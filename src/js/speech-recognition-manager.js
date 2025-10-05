/**
 * 语音识别管理器
 * 提供语音输入、发音评估和口语练习功能
 */
class SpeechRecognitionManager {
    constructor() {
        this.recognition = null;
        this.synthesis = null;
        this.isSupported = false;
        this.isListening = false;
        this.currentLanguage = 'en-US';
        this.pronunciationTargets = [];
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.lastSpeakAt = 0;
        this.init();
    }

    init() {
        console.log('🎤 初始化语音识别系统...');
        this.checkSupport();
        this.initRecognition();
        this.initSynthesis();
        this.setupEventListeners();
    }

    /**
     * 检查浏览器语音支持
     */
    checkSupport() {
        // 检查语音识别支持
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.isSupported = true;
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
            this.isSupported = true;
        }

        // 检查语音合成支持
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
        }

        console.log(`🎤 语音支持状态: 识别=${this.isSupported}, 合成=${!!this.synthesis}`);
    }

    /**
     * 初始化语音识别
     */
    initRecognition() {
        if (!this.recognition) return;

        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;

        // 识别开始
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI('listening');
            console.log('🎤 开始语音识别');
        };

        // 识别结果
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            this.handleRecognitionResult(finalTranscript, interimTranscript);
        };

        // 识别错误
        this.recognition.onerror = (event) => {
            console.error('❌ 语音识别错误:', event.error);
            this.updateUI('error', event.error);
            this.isListening = false;
        };

        // 识别结束
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI('stopped');
            console.log('🎤 语音识别结束');
        };
    }

    /**
     * 初始化语音合成
     */
    initSynthesis() {
        if (!this.synthesis) return;

        this.synthesis.onvoiceschanged = () => {
            this.voices = this.synthesis.getVoices();
            console.log('🔊 语音库已加载:', this.voices.length, '个语音');
        };
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 添加语音相关的UI控件
        this.addVoiceControls();
    }

    /**
     * 添加语音控制界面
     */
    addVoiceControls() {
        // 在适当的页面添加语音控制按钮
        const pages = ['vocabulary', 'grammar', 'listening', 'reading', 'writing'];
        
        pages.forEach(pageId => {
            const page = document.getElementById(pageId);
            if (page) {
                this.addVoiceControlsToPage(page, pageId);
            }
        });
    }

    /**
     * 为页面添加语音控制
     */
    addVoiceControlsToPage(page, pageId) {
        const voicePanel = document.createElement('div');
        voicePanel.className = 'voice-control-panel';
        voicePanel.innerHTML = `
            <div class="voice-controls">
                <h4>🎤 语音功能</h4>
                <div class="voice-buttons">
                    <button class="btn btn-primary" id="startVoiceBtn-${pageId}">
                        <span class="icon">🎤</span>
                        开始语音输入
                    </button>
                    <button class="btn btn-secondary" id="playAudioBtn-${pageId}">
                        <span class="icon">🔊</span>
                        朗读内容
                    </button>
                    <button class="btn btn-outline-primary" id="pronunciationBtn-${pageId}">
                        <span class="icon">📢</span>
                        发音练习
                    </button>
                </div>
                <div class="voice-status" id="voiceStatus-${pageId}">
                    <div class="status-indicator">准备就绪</div>
                    <div class="voice-level">
                        <div class="level-bar" id="levelBar-${pageId}"></div>
                    </div>
                </div>
                <div class="recognition-result" id="recognitionResult-${pageId}">
                    <div class="interim-text"></div>
                    <div class="final-text"></div>
                </div>
            </div>
        `;

        // 插入到页面头部
        const pageHeader = page.querySelector('.page-header');
        if (pageHeader) {
            pageHeader.insertAdjacentElement('afterend', voicePanel);
        }

        // 绑定事件
        this.bindVoiceEvents(pageId);
    }

    /**
     * 绑定语音事件
     */
    bindVoiceEvents(pageId) {
        const startBtn = document.getElementById(`startVoiceBtn-${pageId}`);
        const playBtn = document.getElementById(`playAudioBtn-${pageId}`);
        const pronunciationBtn = document.getElementById(`pronunciationBtn-${pageId}`);

        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleRecognition(pageId));
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => this.speakContent(pageId));
        }

        if (pronunciationBtn) {
            pronunciationBtn.addEventListener('click', () => this.startPronunciationPractice(pageId));
        }
    }

    /**
     * 切换语音识别状态
     */
    toggleRecognition(pageId) {
        if (!this.isSupported) {
            this.showNotification('您的浏览器不支持语音识别功能', 'warning');
            return;
        }

        if (this.isListening) {
            this.stopRecognition();
        } else {
            this.startRecognition(pageId);
        }
    }

    /**
     * 开始语音识别
     */
    startRecognition(pageId) {
        if (!this.recognition) return;

        this.currentPageId = pageId;
        this.recognition.start();
    }

    /**
     * 停止语音识别
     */
    stopRecognition() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    /**
     * 处理识别结果
     */
    handleRecognitionResult(finalText, interimText) {
        if (!this.currentPageId) return;

        const resultDiv = document.getElementById(`recognitionResult-${this.currentPageId}`);
        if (resultDiv) {
            const interimDiv = resultDiv.querySelector('.interim-text');
            const finalDiv = resultDiv.querySelector('.final-text');

            if (interimDiv) interimDiv.textContent = interimText;
            if (finalDiv && finalText) {
                finalDiv.textContent = finalText;
                this.processVoiceCommand(finalText);
            }
        }
    }

    /**
     * 处理语音命令
     */
    processVoiceCommand(text) {
        const command = text.toLowerCase().trim();
        
        // 基本命令处理
        if (command.includes('下一个') || command.includes('next')) {
            this.triggerNextAction();
        } else if (command.includes('上一个') || command.includes('previous')) {
            this.triggerPreviousAction();
        } else if (command.includes('重复') || command.includes('repeat')) {
            this.triggerRepeatAction();
        } else if (command.includes('帮助') || command.includes('help')) {
            this.showVoiceHelp();
        } else {
            // 将识别的文本填入当前活动的输入框
            this.fillActiveInput(text);
        }
    }

    /**
     * 朗读内容
     */
    speakContent(pageId) {
        if (!this.synthesis) {
            this.showNotification('您的浏览器不支持语音合成功能', 'warning');
            return;
        }

        // 获取页面中需要朗读的内容
        const content = this.getContentToSpeak(pageId);
        if (content) {
            this.speak(content);
        }
    }

    /**
     * 获取需要朗读的内容
     */
    getContentToSpeak(pageId) {
        const page = document.getElementById(pageId);
        if (!page) return '';

        // 根据不同页面类型获取内容
        switch (pageId) {
            case 'vocabulary':
                return this.getVocabularyContent(page);
            case 'reading':
                return this.getReadingContent(page);
            case 'listening':
                return this.getListeningContent(page);
            default:
                return this.getGeneralContent(page);
        }
    }

    /**
     * 获取词汇内容
     */
    getVocabularyContent(page) {
        const wordElement = page.querySelector('.current-word, .word-display');
        if (wordElement) {
            const word = wordElement.textContent || wordElement.innerText;
            return word;
        }
        return '';
    }

    /**
     * 获取阅读内容
     */
    getReadingContent(page) {
        const contentElement = page.querySelector('.article-content, .reading-text');
        if (contentElement) {
            const text = contentElement.textContent || contentElement.innerText;
            // 限制朗读长度
            return text.substring(0, 500);
        }
        return '';
    }

    /**
     * 获取听力内容
     */
    getListeningContent(page) {
        // 听力页面通常有自己的音频，这里可以提供相关文本
        const transcriptElement = page.querySelector('.transcript, .listening-text');
        if (transcriptElement) {
            return transcriptElement.textContent || transcriptElement.innerText;
        }
        return '';
    }

    /**
     * 获取通用内容
     */
    getGeneralContent(page) {
        const titleElement = page.querySelector('h2, .page-title');
        if (titleElement) {
            return titleElement.textContent || titleElement.innerText;
        }
        return '欢迎使用LearnSphere AI智能英语学习系统';
    }

    /**
     * 语音合成
     */
    speak(text, options = {}) {
        if (!this.synthesis) return;

        // 简单防抖，避免重复点击触发中断
        const now = Date.now();
        if (now - this.lastSpeakAt < 200) return;
        this.lastSpeakAt = now;

        const synth = this.synthesis;
        try { synth.cancel(); } catch (e) {}

        const utterance = new SpeechSynthesisUtterance(text);
        
        // 设置语音参数
        utterance.lang = options.lang || this.currentLanguage;
        utterance.rate = options.rate || 0.8;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        // 选择合适的语音（若voices未就绪，则等待一次）
        const assignVoice = () => {
            const voices = synth.getVoices();
            const englishVoice = voices.find(v => v.lang && v.lang.startsWith('en') && v.name && v.name.includes('Google'))
                || voices.find(v => v.lang && v.lang.startsWith('en'));
            if (englishVoice) utterance.voice = englishVoice;
        };
        const voicesReady = synth.getVoices()?.length > 0;
        if (!voicesReady) {
            synth.onvoiceschanged = () => {
                synth.onvoiceschanged = null;
                assignVoice();
            };
        } else {
            assignVoice();
        }

        // 语音事件
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.currentUtterance = utterance;
            console.log('🔊 开始朗读');
            this.updateSpeechUI('speaking');
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.log('🔊 朗读结束');
            this.updateSpeechUI('stopped');
        };

        utterance.onerror = (event) => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            if (event && (event.error === 'interrupted' || event.error === 'canceled')) {
                console.warn('🔇 语音合成被中断:', event.error);
                this.updateSpeechUI('stopped');
                // 自动重试一次（避免立即cancel导致的误中断）
                if (!options.__retried) {
                    setTimeout(() => this.speak(text, { ...options, __retried: true }), 200);
                }
                return;
            }
            console.error('❌ 语音合成错误:', event?.error || event);
            this.updateSpeechUI('error');
        };

        const startSpeak = () => {
            try { synth.resume && synth.resume(); } catch (e) {}
            // 解锁策略：在开始的前1秒内周期性调用resume，避免自动播放策略导致无声
            let unlockTimer = null;
            try { unlockTimer = setInterval(() => { try { synth.resume && synth.resume(); } catch (_) {} }, 100); } catch (_) {}
            try { setTimeout(() => { try { clearInterval(unlockTimer); } catch (_) {} }, 1000); } catch (_) {}
            synth.speak(utterance);
        };

        // 若仍在speaking/pending，延迟启动，避免立即中断
        if (synth.speaking || synth.pending) {
            try { synth.cancel(); } catch (e) {}
            setTimeout(startSpeak, 200);
        } else {
            startSpeak();
        }
    }

    /**
     * 开始发音练习
     */
    startPronunciationPractice(pageId) {
        const practiceModal = this.createPronunciationModal(pageId);
        document.body.appendChild(practiceModal);
        this.showModal(practiceModal);
    }

    /**
     * 创建发音练习模态框
     */
    createPronunciationModal(pageId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = `pronunciationModal-${pageId}`;
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📢 发音练习</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="pronunciation-practice">
                        <div class="target-word">
                            <h4>练习单词</h4>
                            <div class="word-display" id="targetWord-${pageId}">Hello</div>
                            <button class="btn btn-secondary" id="playTargetBtn-${pageId}">
                                <span class="icon">🔊</span>
                                听示范发音
                            </button>
                        </div>
                        
                        <div class="pronunciation-input">
                            <h4>请跟读</h4>
                            <button class="btn btn-primary btn-lg" id="recordPronunciation-${pageId}">
                                <span class="icon">🎤</span>
                                开始录音
                            </button>
                            <div class="recording-status" id="recordingStatus-${pageId}">
                                准备录音
                            </div>
                        </div>
                        
                        <div class="pronunciation-result" id="pronunciationResult-${pageId}">
                            <h4>发音评估</h4>
                            <div class="result-content">
                                <div class="score-display">
                                    <div class="score-circle">
                                        <span class="score-value">--</span>
                                        <span class="score-label">分</span>
                                    </div>
                                </div>
                                <div class="feedback-text">
                                    点击"开始录音"进行发音练习
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="cancel">关闭</button>
                    <button class="btn btn-primary" id="nextWordBtn-${pageId}">下一个单词</button>
                </div>
            </div>
        `;

        // 绑定事件
        this.bindPronunciationEvents(modal, pageId);
        return modal;
    }

    /**
     * 绑定发音练习事件
     */
    bindPronunciationEvents(modal, pageId) {
        const playBtn = modal.querySelector(`#playTargetBtn-${pageId}`);
        const recordBtn = modal.querySelector(`#recordPronunciation-${pageId}`);
        const nextBtn = modal.querySelector(`#nextWordBtn-${pageId}`);
        const closeBtn = modal.querySelector('.modal-close');

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                const word = modal.querySelector(`#targetWord-${pageId}`).textContent;
                this.speak(word);
            });
        }

        if (recordBtn) {
            recordBtn.addEventListener('click', () => {
                this.togglePronunciationRecording(pageId);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.loadNextPronunciationWord(pageId);
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal(modal);
            });
        }
    }

    /**
     * 切换发音录音状态
     */
    togglePronunciationRecording(pageId) {
        if (this.isListening) {
            this.stopPronunciationRecording(pageId);
        } else {
            this.startPronunciationRecording(pageId);
        }
    }

    /**
     * 开始发音录音
     */
    startPronunciationRecording(pageId) {
        this.currentPageId = pageId;
        this.isPronunciationMode = true;
        this.startRecognition(pageId);
        
        const statusDiv = document.getElementById(`recordingStatus-${pageId}`);
        if (statusDiv) {
            statusDiv.textContent = '正在录音...';
            statusDiv.className = 'recording-status recording';
        }
    }

    /**
     * 停止发音录音
     */
    stopPronunciationRecording(pageId) {
        this.stopRecognition();
        this.isPronunciationMode = false;
        
        const statusDiv = document.getElementById(`recordingStatus-${pageId}`);
        if (statusDiv) {
            statusDiv.textContent = '录音完成';
            statusDiv.className = 'recording-status completed';
        }
    }

    /**
     * 评估发音
     */
    evaluatePronunciation(spokenText, targetWord) {
        // 简单的发音评估算法
        const similarity = this.calculateSimilarity(spokenText.toLowerCase(), targetWord.toLowerCase());
        const score = Math.round(similarity * 100);
        
        let feedback = '';
        if (score >= 80) {
            feedback = '发音很好！继续保持！';
        } else if (score >= 60) {
            feedback = '发音不错，还可以更准确一些。';
        } else if (score >= 40) {
            feedback = '需要多练习，注意发音的准确性。';
        } else {
            feedback = '发音需要改进，建议多听示范发音。';
        }

        return { score, feedback };
    }

    /**
     * 计算字符串相似度
     */
    calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const maxLength = Math.max(len1, len2);
        return (maxLength - matrix[len1][len2]) / maxLength;
    }

    /**
     * 更新UI状态
     */
    updateUI(status, data) {
        if (!this.currentPageId) return;

        const statusDiv = document.getElementById(`voiceStatus-${this.currentPageId}`);
        const startBtn = document.getElementById(`startVoiceBtn-${this.currentPageId}`);

        if (statusDiv) {
            const indicator = statusDiv.querySelector('.status-indicator');
            if (indicator) {
                switch (status) {
                    case 'listening':
                        indicator.textContent = '正在听取语音...';
                        indicator.className = 'status-indicator listening';
                        break;
                    case 'stopped':
                        indicator.textContent = '准备就绪';
                        indicator.className = 'status-indicator ready';
                        break;
                    case 'error':
                        indicator.textContent = `错误: ${data}`;
                        indicator.className = 'status-indicator error';
                        break;
                }
            }
        }

        if (startBtn) {
            if (status === 'listening') {
                startBtn.innerHTML = '<span class="icon">⏹️</span> 停止录音';
                startBtn.className = 'btn btn-danger';
            } else {
                startBtn.innerHTML = '<span class="icon">🎤</span> 开始语音输入';
                startBtn.className = 'btn btn-primary';
            }
        }
    }

    /**
     * 更新语音合成UI
     */
    updateSpeechUI(status) {
        // 更新朗读按钮状态
        const playBtns = document.querySelectorAll('[id^="playAudioBtn-"]');
        playBtns.forEach(btn => {
            if (status === 'speaking') {
                btn.innerHTML = '<span class="icon">⏸️</span> 停止朗读';
                btn.className = 'btn btn-warning';
            } else {
                btn.innerHTML = '<span class="icon">🔊</span> 朗读内容';
                btn.className = 'btn btn-secondary';
            }
        });
    }

    /**
     * 填充活动输入框
     */
    fillActiveInput(text) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            activeElement.value = text;
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    /**
     * 显示语音帮助
     */
    showVoiceHelp() {
        const helpText = `
语音命令帮助：
• "下一个" 或 "next" - 下一项
• "上一个" 或 "previous" - 上一项  
• "重复" 或 "repeat" - 重复当前内容
• "帮助" 或 "help" - 显示此帮助
• 直接说话 - 填入文本框`;

        this.showNotification(helpText, 'info', 5000);
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info', duration = 3000) {
        // 使用现有的通知系统
        if (window.NotificationManager) {
            window.NotificationManager.show(message, type, duration);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * 显示模态框
     */
    showModal(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭模态框
     */
    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modal.remove();
    }

    /**
     * 设置语言
     */
    setLanguage(language) {
        this.currentLanguage = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
        console.log('🌐 语音识别语言设置为:', language);
    }

    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return [
            { code: 'en-US', name: '英语 (美国)' },
            { code: 'en-GB', name: '英语 (英国)' },
            { code: 'zh-CN', name: '中文 (普通话)' },
            { code: 'zh-TW', name: '中文 (繁体)' }
        ];
    }

    /**
     * 销毁语音识别管理器
     */
    destroy() {
        if (this.recognition) {
            this.recognition.stop();
        }
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        console.log('🎤 语音识别管理器已销毁');
    }
}

// 创建全局实例
window.SpeechRecognitionManager = new SpeechRecognitionManager();
