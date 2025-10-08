"""
Edge TTS 本地服务
提供免费高质量语音合成 API

依赖安装：
pip install edge-tts flask flask-cors

运行：
python edge_tts_server.py
"""

from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import edge_tts
import asyncio
import io
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 默认语音
DEFAULT_VOICE = "en-US-JennyNeural"

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

@app.route('/api/voices', methods=['GET'])
def get_voices():
    """获取可用语音列表"""
    voices = asyncio.run(list_voices())
    return jsonify(voices)

@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({'status': 'ok', 'service': 'Edge TTS'})

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
    print("Edge TTS Server Starting...")
    print("API Endpoint: http://localhost:5010/api/tts")
    print("Health Check: http://localhost:5010/health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5010, debug=False)
