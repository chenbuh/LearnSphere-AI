"""
Edge TTS 本地服务
提供免费高质量语音合成 API

依赖安装：
pip install -r requirements-voice.txt
(确保系统已安装 ffmpeg 并且在 PATH 中)

运行：
python edge_tts_server.py
"""

from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import edge_tts
import asyncio
import io
import logging

import whisper
import os
import tempfile

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 默认语言
DEFAULT_VOICE = "en-US-JennyNeural"

# 加载 Whisper 模型 (tiny.en 是免费且高效的英语模型)
logger.info("Loading Whisper model (tiny.en)...")
try:
    # 提前加载模型到内存，避免每次请求都重新加载
    stt_model = whisper.load_model("tiny.en")
    logger.info("Whisper tiny.en model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load Whisper model: {e}")
    stt_model = None

@app.route('/api/tts', methods=['POST'])
def synthesize():
    """语音合成接口"""
    try:
        data = request.json
        text = data.get('text', '')
        voice = data.get('voice', DEFAULT_VOICE)
        rate = data.get('rate', '+0%')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        logger.info(f"Synthesizing: voice={voice}, text_length={len(text)}")
        
        # 调用 Edge TTS
        audio_data = asyncio.run(synthesize_speech(text, voice, rate))
        
        # 返回音频
        return Response(
            audio_data,
            mimetype='audio/mpeg',
            headers={
                'Content-Disposition': 'inline; filename="speech.mp3"',
                'Cache-Control': 'public, max-age=604800'
            }
        )
    
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stt', methods=['POST'])
def transcribe():
    """语言转文本接口 (Whisper-tiny.en)"""
    if stt_model is None:
        return jsonify({'error': 'STT model not loaded'}), 500
        
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # 创建临时文件保存音频
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            file.save(temp_audio.name)
            temp_path = temp_audio.name

        logger.info(f"Transcribing audio: {temp_path}")
        
        # 使用 Whisper 模型识别内容
        # fp16=False 确保在 CPU 上也能稳定运行
        result = stt_model.transcribe(temp_path, fp16=False, language='en')
        
        # 删除临时文件
        os.remove(temp_path)
        
        logger.info(f"Transcription result: {result['text']}")
        
        return jsonify({
            'text': result['text'].strip(),
            'language': result.get('language', 'en'),
            'segments': result.get('segments', [])
        })
        
    except Exception as e:
        logger.error(f"STT transcription error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voices', methods=['GET'])
def get_voices():
    """获取可用语音列表"""
    voices = asyncio.run(list_voices())
    return jsonify(voices)

@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    status = {
        'status': 'ok', 
        'services': {
            'tts': 'available',
            'stt': 'available' if stt_model else 'failed'
        }
    }
    return jsonify(status)

async def synthesize_speech(text: str, voice: str, rate: str) -> bytes:
    """异步语音合成"""
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    
    # 收集音频数据
    audio_bytes = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.write(chunk["data"])
    
    return audio_bytes.getvalue()

async def list_voices():
    """获取所有可用语音"""
    voices = await edge_tts.list_voices()
    
    # 过滤常用语音
    common_voices = []
    for voice in voices:
        if voice['Locale'] in ['en-US', 'en-GB', 'en-AU', 'zh-CN']:
            common_voices.append({
                'code': voice['ShortName'],
                'name': voice['FriendlyName'],
                'locale': voice['Locale'],
                'gender': voice['Gender']
            })
    
    return common_voices

if __name__ == '__main__':
    print("=" * 50)
    print("LearnSphere AI Voice Engine Starting...")
    print("TTS Endpoint: http://localhost:5010/api/tts")
    print("STT Endpoint: http://localhost:5010/api/stt (Whisper-tiny.en)")
    print("Health Check: http://localhost:5010/health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5010, debug=False)
