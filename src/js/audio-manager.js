/**
 * 音频管理器
 * 处理听力练习中的音频播放、控制和进度管理
 */
class AudioManager {
    constructor() {
        this.audioElement = null;
        this.currentTrack = null;
        this.playlist = [];
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 0.8;
        this.playbackRate = 1.0;
        this.repeatMode = 'none'; // none, single, playlist
        this.subtitle = null;
        this.subtitleTrack = [];
        this.init();
    }

    init() {
        console.log('🎵 初始化音频管理器...');
        this.createAudioElement();
        this.setupEventListeners();
        this.loadAudioLibrary();
    }

    /**
     * 创建音频元素
     */
    createAudioElement() {
        this.audioElement = new Audio();
        this.audioElement.preload = 'metadata';
        this.audioElement.volume = this.volume;
        this.audioElement.playbackRate = this.playbackRate;

        // 音频事件监听
        this.audioElement.addEventListener('loadstart', () => {
            console.log('🎵 开始加载音频');
            this.updateUI('loading');
        });

        this.audioElement.addEventListener('loadedmetadata', () => {
            this.duration = this.audioElement.duration;
            console.log('🎵 音频元数据已加载，时长:', this.duration);
            this.updateUI('loaded');
        });

        this.audioElement.addEventListener('canplay', () => {
            console.log('🎵 音频可以播放');
            this.updateUI('ready');
        });

        this.audioElement.addEventListener('play', () => {
            this.isPlaying = true;
            console.log('🎵 音频开始播放');
            this.updateUI('playing');
        });

        this.audioElement.addEventListener('pause', () => {
            this.isPlaying = false;
            console.log('🎵 音频暂停');
            this.updateUI('paused');
        });

        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
            console.log('🎵 音频播放结束');
            this.handleTrackEnd();
        });

        this.audioElement.addEventListener('timeupdate', () => {
            this.currentTime = this.audioElement.currentTime;
            this.updateProgress();
            this.updateSubtitle();
        });

        this.audioElement.addEventListener('error', (event) => {
            console.error('❌ 音频播放错误:', event);
            this.updateUI('error');
        });
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 全局键盘快捷键
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return; // 在输入框中不响应快捷键
            }

            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.seekBackward(5);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.seekForward(5);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.adjustVolume(-0.1);
                    break;
            }
        });
    }

    /**
     * 加载音频库
     */
    loadAudioLibrary() {
        // 预定义的音频库（实际项目中可以从服务器加载）
        this.audioLibrary = {
            'cet4_listening_1': {
                title: 'CET-4 听力练习 1',
                src: '../assets/audio/cet4_listening_1.mp3',
                subtitle: '../assets/audio/cet4_listening_1.srt',
                duration: 180,
                difficulty: 'intermediate',
                type: 'conversation',
                examType: 'cet4'
            },
            'cet6_listening_1': {
                title: 'CET-6 听力练习 1',
                src: '../assets/audio/cet6_listening_1.mp3',
                subtitle: '../assets/audio/cet6_listening_1.srt',
                duration: 240,
                difficulty: 'advanced',
                type: 'lecture',
                examType: 'cet6'
            },
            'ielts_listening_1': {
                title: 'IELTS 听力练习 1',
                src: '../assets/audio/ielts_listening_1.mp3',
                subtitle: '../assets/audio/ielts_listening_1.srt',
                duration: 300,
                difficulty: 'advanced',
                type: 'academic',
                examType: 'ielts'
            },
            'toefl_listening_1': {
                title: 'TOEFL 听力练习 1',
                src: '../assets/audio/toefl_listening_1.mp3',
                subtitle: '../assets/audio/toefl_listening_1.srt',
                duration: 360,
                difficulty: 'expert',
                type: 'campus',
                examType: 'toefl'
            },
            // 日常对话
            'daily_conversation_1': {
                title: '日常对话 - 购物',
                src: '../assets/audio/daily_conversation_1.mp3',
                subtitle: '../assets/audio/daily_conversation_1.srt',
                duration: 120,
                difficulty: 'basic',
                type: 'conversation',
                examType: 'general'
            },
            'daily_conversation_2': {
                title: '日常对话 - 餐厅',
                src: '../assets/audio/daily_conversation_2.mp3',
                subtitle: '../assets/audio/daily_conversation_2.srt',
                duration: 150,
                difficulty: 'basic',
                type: 'conversation',
                examType: 'general'
            },
            // 学术讲座
            'academic_lecture_1': {
                title: '学术讲座 - 环境科学',
                src: '../assets/audio/academic_lecture_1.mp3',
                subtitle: '../assets/audio/academic_lecture_1.srt',
                duration: 480,
                difficulty: 'expert',
                type: 'lecture',
                examType: 'academic'
            }
        };

        console.log('🎵 音频库已加载:', Object.keys(this.audioLibrary).length, '个音频');
    }

    /**
     * 播放音频
     */
    async play(trackId) {
        try {
            if (trackId && trackId !== this.currentTrack?.id) {
                await this.loadTrack(trackId);
            }

            if (this.audioElement && this.audioElement.readyState >= 2) {
                await this.audioElement.play();
                return true;
            } else {
                console.warn('⚠️ 音频尚未准备好');
                return false;
            }
        } catch (error) {
            console.error('❌ 播放音频失败:', error);
            this.showNotification('音频播放失败，请检查音频文件', 'error');
            return false;
        }
    }

    /**
     * 暂停音频
     */
    pause() {
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
        }
    }

    /**
     * 停止音频
     */
    stop() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
    }

    /**
     * 切换播放/暂停
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * 加载音频轨道
     */
    async loadTrack(trackId) {
        const trackInfo = this.audioLibrary[trackId];
        if (!trackInfo) {
            console.error('❌ 未找到音频轨道:', trackId);
            return false;
        }

        this.currentTrack = {
            id: trackId,
            ...trackInfo
        };

        // 检查音频文件是否存在，如果不存在则使用占位符
        const audioExists = await this.checkAudioExists(trackInfo.src);
        if (!audioExists) {
            console.warn('⚠️ 音频文件不存在，使用TTS生成:', trackInfo.title);
            this.generateTTSAudio(trackInfo);
        } else {
            this.audioElement.src = trackInfo.src;
        }

        // 加载字幕
        if (trackInfo.subtitle) {
            await this.loadSubtitle(trackInfo.subtitle);
        }

        console.log('🎵 已加载音频轨道:', trackInfo.title);
        return true;
    }

    /**
     * 检查音频文件是否存在
     */
    async checkAudioExists(src) {
        try {
            const response = await fetch(src, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * 使用TTS生成音频
     */
    generateTTSAudio(trackInfo) {
        // 创建一个示例音频内容
        const sampleTexts = {
            'cet4_listening_1': 'Welcome to CET-4 listening practice. In this section, you will hear a conversation between two students discussing their study plans.',
            'cet6_listening_1': 'This is CET-6 listening comprehension. You will hear a lecture about environmental protection and sustainable development.',
            'ielts_listening_1': 'IELTS Listening Section 1. You will hear a phone conversation about booking a hotel room.',
            'toefl_listening_1': 'TOEFL Listening Practice. This is a campus conversation between a student and a professor.',
            'daily_conversation_1': 'A: Good morning! Can I help you? B: Yes, I\'m looking for a birthday gift for my friend.',
            'daily_conversation_2': 'Waiter: Are you ready to order? Customer: Yes, I\'d like the chicken pasta, please.',
            'academic_lecture_1': 'Today we will discuss the impact of climate change on global ecosystems and biodiversity.'
        };

        const text = sampleTexts[trackInfo.id] || trackInfo.title;
        
        // 使用Web Speech API生成语音
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            // 创建临时音频URL
            this.createAudioFromTTS(utterance, trackInfo);
        } else {
            // 如果不支持TTS，创建一个静音音频
            this.createSilentAudio(trackInfo.duration);
        }
    }

    /**
     * 从TTS创建音频
     */
    createAudioFromTTS(utterance, trackInfo) {
        // 这是一个简化的实现，实际项目中可能需要更复杂的音频处理
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        // 设置一个简单的音调作为占位符
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, trackInfo.duration * 1000);

        // 显示提示信息
        this.showNotification('音频文件不存在，已使用占位符音频', 'warning');
    }

    /**
     * 创建静音音频
     */
    createSilentAudio(duration) {
        // 创建一个数据URL表示的静音音频
        const sampleRate = 44100;
        const numChannels = 1;
        const numSamples = sampleRate * duration;
        
        const arrayBuffer = new ArrayBuffer(numSamples * 2);
        const view = new DataView(arrayBuffer);
        
        // 写入WAV头部
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, numSamples * 2, true);
        
        // 填充静音数据（全零）
        for (let i = 44; i < arrayBuffer.byteLength; i++) {
            view.setUint8(i, 0);
        }
        
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
        this.audioElement.src = URL.createObjectURL(blob);
    }

    /**
     * 加载字幕
     */
    async loadSubtitle(subtitlePath) {
        try {
            const response = await fetch(subtitlePath);
            if (response.ok) {
                const subtitleText = await response.text();
                this.subtitleTrack = this.parseSRT(subtitleText);
                console.log('📝 字幕已加载:', this.subtitleTrack.length, '条');
            } else {
                // 如果字幕文件不存在，创建示例字幕
                this.createSampleSubtitle();
            }
        } catch (error) {
            console.warn('⚠️ 字幕加载失败，使用示例字幕:', error);
            this.createSampleSubtitle();
        }
    }

    /**
     * 创建示例字幕
     */
    createSampleSubtitle() {
        const sampleSubtitles = [
            { start: 0, end: 5, text: "Welcome to the listening practice." },
            { start: 5, end: 10, text: "Please listen carefully to the audio." },
            { start: 10, end: 15, text: "You will answer questions based on what you hear." },
            { start: 15, end: 20, text: "Take notes if necessary." },
            { start: 20, end: 25, text: "Good luck with your practice!" }
        ];
        
        this.subtitleTrack = sampleSubtitles;
        console.log('📝 已创建示例字幕');
    }

    /**
     * 解析SRT字幕格式
     */
    parseSRT(srtText) {
        const subtitles = [];
        const blocks = srtText.split(/\n\s*\n/);
        
        blocks.forEach(block => {
            const lines = block.trim().split('\n');
            if (lines.length >= 3) {
                const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
                if (timeMatch) {
                    const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000;
                    const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000;
                    const text = lines.slice(2).join(' ');
                    
                    subtitles.push({ start, end, text });
                }
            }
        });
        
        return subtitles;
    }

    /**
     * 更新字幕显示
     */
    updateSubtitle() {
        const currentSubtitle = this.subtitleTrack.find(
            subtitle => this.currentTime >= subtitle.start && this.currentTime <= subtitle.end
        );
        
        const subtitleElement = document.querySelector('.audio-subtitle');
        if (subtitleElement) {
            if (currentSubtitle) {
                subtitleElement.textContent = currentSubtitle.text;
                subtitleElement.style.opacity = '1';
            } else {
                subtitleElement.style.opacity = '0.5';
            }
        }
    }

    /**
     * 跳转到指定时间
     */
    seekTo(time) {
        if (this.audioElement && this.duration > 0) {
            const clampedTime = Math.max(0, Math.min(time, this.duration));
            this.audioElement.currentTime = clampedTime;
            this.currentTime = clampedTime;
        }
    }

    /**
     * 向前跳转
     */
    seekForward(seconds = 10) {
        this.seekTo(this.currentTime + seconds);
    }

    /**
     * 向后跳转
     */
    seekBackward(seconds = 10) {
        this.seekTo(this.currentTime - seconds);
    }

    /**
     * 调整音量
     */
    adjustVolume(delta) {
        const newVolume = Math.max(0, Math.min(1, this.volume + delta));
        this.setVolume(newVolume);
    }

    /**
     * 设置音量
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
        }
        this.updateVolumeUI();
    }

    /**
     * 设置播放速度
     */
    setPlaybackRate(rate) {
        this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
        if (this.audioElement) {
            this.audioElement.playbackRate = this.playbackRate;
        }
        this.updatePlaybackRateUI();
    }

    /**
     * 设置重复模式
     */
    setRepeatMode(mode) {
        this.repeatMode = mode; // none, single, playlist
        this.updateRepeatModeUI();
    }

    /**
     * 处理音频结束
     */
    handleTrackEnd() {
        switch (this.repeatMode) {
            case 'single':
                this.seekTo(0);
                this.play();
                break;
            case 'playlist':
                this.playNext();
                break;
            default:
                this.updateUI('ended');
                break;
        }
    }

    /**
     * 播放下一首
     */
    playNext() {
        const currentIndex = this.playlist.findIndex(track => track.id === this.currentTrack?.id);
        const nextIndex = (currentIndex + 1) % this.playlist.length;
        if (nextIndex < this.playlist.length) {
            this.play(this.playlist[nextIndex].id);
        }
    }

    /**
     * 播放上一首
     */
    playPrevious() {
        const currentIndex = this.playlist.findIndex(track => track.id === this.currentTrack?.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.playlist.length - 1;
        this.play(this.playlist[prevIndex].id);
    }

    /**
     * 更新进度
     */
    updateProgress() {
        const progressElements = document.querySelectorAll('.audio-progress');
        const timeElements = document.querySelectorAll('.audio-time');
        
        progressElements.forEach(element => {
            if (this.duration > 0) {
                const progress = (this.currentTime / this.duration) * 100;
                const progressFill = element.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
            }
        });
        
        timeElements.forEach(element => {
            element.textContent = `${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}`;
        });
    }

    /**
     * 格式化时间
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * 更新UI状态
     */
    updateUI(status) {
        const playButtons = document.querySelectorAll('.audio-play-btn');
        const statusElements = document.querySelectorAll('.audio-status');
        
        playButtons.forEach(button => {
            switch (status) {
                case 'playing':
                    button.innerHTML = '<span class="icon">⏸️</span> 暂停';
                    button.className = 'btn btn-warning audio-play-btn';
                    break;
                case 'paused':
                case 'stopped':
                case 'ended':
                    button.innerHTML = '<span class="icon">▶️</span> 播放';
                    button.className = 'btn btn-primary audio-play-btn';
                    break;
                case 'loading':
                    button.innerHTML = '<span class="icon">⏳</span> 加载中';
                    button.className = 'btn btn-secondary audio-play-btn';
                    button.disabled = true;
                    break;
                case 'ready':
                    button.innerHTML = '<span class="icon">▶️</span> 播放';
                    button.className = 'btn btn-primary audio-play-btn';
                    button.disabled = false;
                    break;
                case 'error':
                    button.innerHTML = '<span class="icon">❌</span> 错误';
                    button.className = 'btn btn-danger audio-play-btn';
                    break;
            }
        });
        
        statusElements.forEach(element => {
            element.textContent = this.getStatusText(status);
        });
    }

    /**
     * 获取状态文本
     */
    getStatusText(status) {
        const statusTexts = {
            'loading': '正在加载...',
            'loaded': '已加载',
            'ready': '准备就绪',
            'playing': '正在播放',
            'paused': '已暂停',
            'stopped': '已停止',
            'ended': '播放完成',
            'error': '播放错误'
        };
        return statusTexts[status] || '未知状态';
    }

    /**
     * 更新音量UI
     */
    updateVolumeUI() {
        const volumeSliders = document.querySelectorAll('.volume-slider');
        const volumeValues = document.querySelectorAll('.volume-value');
        
        volumeSliders.forEach(slider => {
            slider.value = this.volume;
        });
        
        volumeValues.forEach(element => {
            element.textContent = Math.round(this.volume * 100) + '%';
        });
    }

    /**
     * 更新播放速度UI
     */
    updatePlaybackRateUI() {
        const rateSliders = document.querySelectorAll('.playback-rate-slider');
        const rateValues = document.querySelectorAll('.playback-rate-value');
        
        rateSliders.forEach(slider => {
            slider.value = this.playbackRate;
        });
        
        rateValues.forEach(element => {
            element.textContent = this.playbackRate + 'x';
        });
    }

    /**
     * 更新重复模式UI
     */
    updateRepeatModeUI() {
        const repeatButtons = document.querySelectorAll('.repeat-mode-btn');
        
        repeatButtons.forEach(button => {
            switch (this.repeatMode) {
                case 'none':
                    button.innerHTML = '<span class="icon">🔁</span> 不重复';
                    button.className = 'btn btn-outline-secondary repeat-mode-btn';
                    break;
                case 'single':
                    button.innerHTML = '<span class="icon">🔂</span> 单曲循环';
                    button.className = 'btn btn-info repeat-mode-btn';
                    break;
                case 'playlist':
                    button.innerHTML = '<span class="icon">🔁</span> 列表循环';
                    button.className = 'btn btn-success repeat-mode-btn';
                    break;
            }
        });
    }

    /**
     * 获取音频库
     */
    getAudioLibrary() {
        return this.audioLibrary;
    }

    /**
     * 根据条件筛选音频
     */
    filterAudio(filters = {}) {
        const { examType, difficulty, type } = filters;
        
        return Object.entries(this.audioLibrary).filter(([id, audio]) => {
            return (!examType || audio.examType === examType) &&
                   (!difficulty || audio.difficulty === difficulty) &&
                   (!type || audio.type === type);
        }).map(([id, audio]) => ({ id, ...audio }));
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info', duration = 3000) {
        if (window.NotificationManager) {
            window.NotificationManager.show(message, type, duration);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * 销毁音频管理器
     */
    destroy() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
        }
        console.log('🎵 音频管理器已销毁');
    }
}

// 创建全局实例
window.AudioManager = new AudioManager();
