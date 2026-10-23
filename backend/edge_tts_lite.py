"""Edge TTS 轻量服务 — 仅语音合成，零第三方 Web 框架依赖。
用法: python edge_tts_lite.py --port 5010
依赖: pip install edge-tts
"""
import argparse, asyncio, io, json, os, shutil, subprocess, sys, tempfile, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from socketserver import ThreadingMixIn

try:
    import edge_tts
except ImportError:
    print("缺少 edge-tts: pip install edge-tts", file=sys.stderr)
    sys.exit(1)

DEFAULT_VOICE = "en-US-JennyNeural"
VOICE_ALLOWLIST = None

_cache = {}
_cache_order = []
CACHE_MAX = 2048

# 磁盘缓存：重启后不必重新合成，离线时也能播放已听过的内容
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tts-cache")
DISK_CACHE_ENABLED = True

def _cache_path(key):
    import hashlib
    h = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return os.path.join(CACHE_DIR, h + ".mp3")

def disk_get(key):
    if not DISK_CACHE_ENABLED:
        return None
    try:
        path = _cache_path(key)
        if os.path.isfile(path):
            with open(path, "rb") as f:
                return f.read()
    except Exception:
        pass
    return None

def disk_put(key, value):
    if not DISK_CACHE_ENABLED:
        return
    try:
        os.makedirs(CACHE_DIR, exist_ok=True)
        tmp = _cache_path(key) + ".tmp"
        with open(tmp, "wb") as f:
            f.write(value)
        os.replace(tmp, _cache_path(key))
    except Exception:
        pass

def cache_get(key):
    v = _cache.get(key)
    if v is not None:
        return v
    v = disk_get(key)
    if v is not None:
        # 回填内存缓存
        if len(_cache_order) >= CACHE_MAX:
            _cache.pop(_cache_order.pop(0), None)
        _cache[key] = v
        _cache_order.append(key)
    return v

def cache_put(key, value):
    if key in _cache:
        return
    if len(_cache_order) >= CACHE_MAX:
        old = _cache_order.pop(0)
        _cache.pop(old, None)
    _cache[key] = value
    _cache_order.append(key)
    disk_put(key, value)

async def synth(text, voice, rate):
    comm = edge_tts.Communicate(text, voice, rate=rate)
    buf = io.BytesIO()
    async for ch in comm.stream():
        if ch["type"] == "audio":
            buf.write(ch["data"])
    return buf.getvalue()

# ---------------------------------------------------------------------------
# 兜底音源：Windows SAPI（系统自带英语语音，如 Microsoft Zira Desktop）
# 前端 speechSynthesis 在没装英语语音的机器上不可用，且用户不可能自己去装。
# 服务端直接调 SAPI + ffmpeg 转 MP3，作为 edge-tts 失败时的保险。
# ---------------------------------------------------------------------------
SAPI_ENABLED = sys.platform == "win32"

def _powershell_exe():
    for name in ("pwsh", "powershell"):
        p = shutil.which(name)
        if p:
            return p
    return None

def _ffmpeg_exe():
    return shutil.which("ffmpeg")

def synth_sapi(text, voice_hint="en-US"):
    """用 Windows SAPI 合成，返回 MP3 字节；不可用时返回 None。"""
    if not SAPI_ENABLED:
        return None
    ps = _powershell_exe()
    ff = _ffmpeg_exe()
    if not ps:
        return None

    safe_text = text.replace("'", "''")
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, "out.wav")
        script = (
            "Add-Type -AssemblyName System.Speech; "
            "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
            # 优先选英语语音；没有就让它自己挑
            "$v = $s.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'en*' } | Select-Object -First 1; "
            "if ($v) { $s.SelectVoice($v.VoiceInfo.Name) }; "
            f"$s.SetOutputToWaveFile('{wav}'); "
            f"$s.Speak('{safe_text}'); "
            "$s.Dispose();"
        )
        try:
            r = subprocess.run(
                [ps, "-NoProfile", "-NonInteractive", "-Command", script],
                capture_output=True, timeout=30
            )
            if r.returncode != 0 or not os.path.isfile(wav):
                print(f"[sapi] synth failed rc={r.returncode} {r.stderr[:200]!r}", flush=True)
                return None
        except Exception as e:
            print(f"[sapi] error: {e}", flush=True)
            return None

        if not ff:
            # 没有 ffmpeg 就直接返回 WAV（浏览器也能播）
            with open(wav, "rb") as f:
                return f.read(), "audio/wav"

        mp3 = os.path.join(td, "out.mp3")
        try:
            r = subprocess.run(
                [ff, "-y", "-loglevel", "error", "-i", wav,
                 "-codec:a", "libmp3lame", "-b:a", "48k", "-ar", "24000", "-ac", "1", mp3],
                capture_output=True, timeout=30
            )
            if r.returncode == 0 and os.path.isfile(mp3):
                with open(mp3, "rb") as f:
                    return f.read(), "audio/mpeg"
        except Exception as e:
            print(f"[sapi] ffmpeg error: {e}", flush=True)

        with open(wav, "rb") as f:
            return f.read(), "audio/wav"


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            self._json(200, {"status": "ok", "tts": True, "cached": len(_cache)})
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/api/tts":
            self._json(404, {"error": "not found"})
            return
        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n <= 0 or n > 20000:
                self._json(400, {"error": "bad length"})
                return
            data = json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception as e:
            self._json(400, {"error": f"bad json: {e}"})
            return

        text = (data.get("text") or "").strip()
        voice = (data.get("voice") or DEFAULT_VOICE).strip()
        rate_raw = data.get("rate", 1)
        # rate 支持 1.0 倍率 或 "+0%" 字符串
        if isinstance(rate_raw, str):
            rate = rate_raw
        else:
            try:
                pct = int(round((float(rate_raw) - 1.0) * 100))
            except Exception:
                pct = 0
            pct = max(-50, min(100, pct))
            rate = f"{pct:+d}%"

        if not text:
            self._json(400, {"error": "text required"})
            return
        if len(text) > 4000:
            self._json(400, {"error": "text too long"})
            return
        if VOICE_ALLOWLIST and voice not in VOICE_ALLOWLIST:
            self._json(400, {"error": "voice not allowed"})
            return

        key = f"{voice}|{rate}|{text}"
        hit = cache_get(key)
        if hit is not None:
            audio = hit
            mime = "audio/mpeg"
        else:
            t0 = time.time()
            audio = None
            mime = "audio/mpeg"
            # 一级：edge-tts 神经音色（音质最好）
            try:
                audio = asyncio.run(synth(text, voice, rate))
            except Exception as e:
                print(f"[tts] edge-tts failed: {e}", flush=True)

            # 二级：Windows SAPI 系统语音（保证一定有声音）
            if not audio:
                try:
                    fallback = synth_sapi(text)
                    if fallback:
                        audio, mime = fallback
                        print(f"[tts] used SAPI fallback ({mime})", flush=True)
                except Exception as e:
                    print(f"[tts] SAPI fallback failed: {e}", flush=True)

            if not audio:
                self._json(502, {"error": "synthesis failed: no audio source available"})
                return

            if mime == "audio/mpeg":
                cache_put(key, audio)
            print(f"[tts] {len(text)}c -> {len(audio)/1024:.1f}KB in {(time.time()-t0)*1000:.0f}ms", flush=True)

        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(audio)))
        self.send_header("Cache-Control", "public, max-age=604800")
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        self.wfile.write(audio)

class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=5010)
    a = ap.parse_args()
    try:
        os.makedirs(CACHE_DIR, exist_ok=True)
        n = len([f for f in os.listdir(CACHE_DIR) if f.endswith(".mp3")])
        print(f"Disk cache: {n} entries in {CACHE_DIR}", flush=True)
    except Exception as e:
        print(f"Disk cache unavailable: {e}", flush=True)
    print(f"Edge TTS lite listening on http://{a.host}:{a.port}", flush=True)
    Server((a.host, a.port), Handler).serve_forever()
