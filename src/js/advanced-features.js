/**
 * 高级功能模块
 * 包含实验性和高级功能
 */

class AdvancedFeatures {
    constructor() {
        this.features = {
            voiceControl: false,
            gestureControl: false,
            eyeTracking: false,
            brainwaveControl: false,
            virtualReality: false,
            augmentedReality: false
        };

        this.experiments = [];
        this.activeExperiments = new Set(); // 优化：使用Set跟踪活跃实验
        this.experimentCache = new Map(); // 优化：缓存实验状态
        
        // 性能优化：防抖保存
        this.debouncedSave = null;
        if (window.Utils && window.Utils.debounce) {
            this.debouncedSave = window.Utils.debounce(
                this.saveExperimentState.bind(this), 
                500
            );
        }
        
        this.init();
    }

    init() {
        const logger = window.logger || console;
        logger.info('AdvancedFeatures', '高级功能模块初始化中...');
        
        try {
            this.detectCapabilities();
            this.setupExperimentalFeatures();
            
            // 优化：使用 requestIdleCallback 延迟恢复状态
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    this.restoreExperimentStates();
                }, { timeout: 2000 });
            } else {
                setTimeout(() => {
                    this.restoreExperimentStates();
                }, 1000);
            }
            
            logger.info('AdvancedFeatures', '高级功能模块初始化完成');
        } catch (error) {
            logger.error('AdvancedFeatures', '初始化失败:', error);
        }
    }

    /**
     * 检测设备能力（优化版）
     */
    async detectCapabilities() {
        const logger = window.logger || console;
        const capabilities = [];

        try {
            // 检测语音控制
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                this.features.voiceControl = true;
                capabilities.push('语音控制');
            }

            // 检测设备方向（用于手势控制）
            if ('DeviceOrientationEvent' in window) {
                this.features.gestureControl = true;
                capabilities.push('手势控制');
            }

            // 检测WebXR（VR/AR支持）- 优化：并行检测
            if ('xr' in navigator && navigator.xr) {
                const [vrSupported, arSupported] = await Promise.all([
                    navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
                    navigator.xr.isSessionSupported('immersive-ar').catch(() => false)
                ]);

                if (vrSupported) {
                    this.features.virtualReality = true;
                    capabilities.push('VR支持');
                }

                if (arSupported) {
                    this.features.augmentedReality = true;
                    capabilities.push('AR支持');
                }
            }

            // 检测眼球追踪（实验性）
            if ('EyeDropper' in window) {
                this.features.eyeTracking = true;
                capabilities.push('眼球追踪(实验性)');
            }

            if (capabilities.length > 0) {
                logger.info('AdvancedFeatures', `检测到设备能力: ${capabilities.join(', ')}`);
            } else {
                logger.info('AdvancedFeatures', '未检测到高级设备能力');
            }
        } catch (error) {
            logger.error('AdvancedFeatures', '设备能力检测失败:', error);
        }
    }

    /**
     * 设置实验性功能
     */
    setupExperimentalFeatures() {
        this.experiments = [
            {
                name: 'AI语音助手',
                description: '使用语音与AI导师对话，支持中英文语音命令',
                enabled: this.features.voiceControl,
                setup: () => this.setupVoiceAssistant(),
                teardown: () => this.teardownVoiceAssistant()
            },
            {
                name: '深色模式',
                description: '护眼的深色主题，减少眼部疲劳',
                enabled: true,
                setup: () => this.setupDarkMode(),
                teardown: () => this.teardownDarkMode()
            },
            {
                name: '打字速度监控',
                description: '实时监控您的打字速度，提供输入效率分析',
                enabled: true,
                setup: () => this.setupTypingSpeedMonitor(),
                teardown: () => this.teardownTypingSpeedMonitor()
            },
            {
                name: '学习连击计数器',
                description: '记录连续学习天数，激励持续学习',
                enabled: true,
                setup: () => this.setupLearningStreak(),
                teardown: () => this.teardownLearningStreak()
            },
            {
                name: '智能通知系统',
                description: '基于学习习惯的个性化提醒通知',
                enabled: true,
                setup: () => this.setupSmartNotifications(),
                teardown: () => this.teardownSmartNotifications()
            },
            {
                name: '番茄钟学习计时器',
                description: '使用番茄工作法优化学习时间管理',
                enabled: true,
                setup: () => this.setupPomodoroTimer(),
                teardown: () => this.teardownPomodoroTimer()
            },
            {
                name: '自定义快捷键',
                description: '设置个性化的键盘快捷键',
                enabled: true,
                setup: () => this.setupCustomShortcuts(),
                teardown: () => this.teardownCustomShortcuts()
            },
            {
                name: '专注度监控',
                description: '监控学习时的专注程度，提供专注度报告',
                enabled: true,
                setup: () => this.setupFocusMonitoring(),
                teardown: () => this.teardownFocusMonitoring()
            },
            {
                name: '智能背景音乐',
                description: '根据学习状态播放合适的背景音乐',
                enabled: true,
                setup: () => this.setupAdaptiveMusic(),
                teardown: () => this.teardownAdaptiveMusic()
            },
            {
                name: '手势学习',
                description: '通过手势控制学习界面（移动设备）',
                enabled: this.features.gestureControl,
                setup: () => this.setupGestureControl(),
                teardown: () => this.teardownGestureControl()
            },
            {
                name: '沉浸式VR学习',
                description: '在虚拟现实中学习英语（需要VR设备）',
                enabled: this.features.virtualReality,
                setup: () => this.setupVRLearning()
            },
            {
                name: '增强现实单词卡',
                description: '在现实环境中显示单词卡片（需要AR支持）',
                enabled: this.features.augmentedReality,
                setup: () => this.setupARWordCards()
            }
        ];

        this.addExperimentalStyles();
    }

    /**
     * 渲染实验性功能到指定容器
     */
    renderFeaturesTo(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="panel-content">
                ${this.renderExperiments()}
            </div>
        `;
        this.bindFeatureEvents(container);
    }

    /**
     * 渲染实验列表
     */
    renderExperiments() {
        return this.experiments.map((exp, index) => `
            <div class="experiment-item ${exp.enabled ? 'available' : 'disabled'}">
                <div class="experiment-info">
                    <h4>${exp.name}</h4>
                    <p>${exp.description}</p>
                </div>
                <label class="experiment-toggle">
                    <input type="checkbox" data-experiment="${index}" ${exp.enabled ? '' : 'disabled'}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `).join('');
    }

    /**
     * 绑定面板事件
     */
    bindFeatureEvents(container) {
        // 实验功能开关
        const toggles = container.querySelectorAll('input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const expIndex = parseInt(e.target.dataset.experiment);
                const experiment = this.experiments[expIndex];
                
                if (e.target.checked && experiment.enabled) {
                    this.enableExperiment(experiment);
                } else {
                    this.disableExperiment(experiment);
                }
            });
        });
    }

    /**
     * 启用实验功能（优化版）
     */
    enableExperiment(experiment) {
        const logger = window.logger || console;
        
        // 参数验证
        if (!experiment || typeof experiment !== 'object') {
            logger.error('AdvancedFeatures', '无效的实验功能对象');
            return false;
        }

        // 检查是否已启用
        if (this.activeExperiments.has(experiment.name)) {
            logger.warn('AdvancedFeatures', `实验功能"${experiment.name}"已启用`);
            return true;
        }

        logger.info('AdvancedFeatures', `启用实验功能: ${experiment.name}`);
        
        try {
            if (typeof experiment.setup === 'function') {
                // 性能标记
                if (window.performanceMonitor) {
                    window.performanceMonitor.mark(`experiment-${experiment.name}-start`);
                }

                experiment.setup();
                
                // 标记功能为激活状态
                experiment.active = true;
                this.activeExperiments.add(experiment.name);
                
                // 缓存实验状态
                this.experimentCache.set(experiment.name, {
                    active: true,
                    enabledAt: Date.now()
                });
                
                // 优化：使用防抖保存
                if (this.debouncedSave) {
                    this.debouncedSave(experiment.name, true);
                } else {
                    this.saveExperimentState(experiment.name, true);
                }

                // 性能标记结束
                if (window.performanceMonitor) {
                    window.performanceMonitor.mark(`experiment-${experiment.name}-end`);
                    window.performanceMonitor.measure(
                        `实验功能启动: ${experiment.name}`,
                        `experiment-${experiment.name}-start`,
                        `experiment-${experiment.name}-end`
                    );
                }
            }
            
            if (window.Notification) {
                window.Notification.info(`实验功能 "${experiment.name}" 已启用`, {
                    duration: 3000
                });
            }

            return true;
        } catch (error) {
            logger.error('AdvancedFeatures', `启用实验功能失败 (${experiment.name}):`, error);
            
            // 清理失败状态
            experiment.active = false;
            this.activeExperiments.delete(experiment.name);
            this.experimentCache.delete(experiment.name);
            
            if (window.Notification) {
                window.Notification.error(`启用 "${experiment.name}" 失败：${error.message}`, {
                    duration: 5000
                });
            }

            return false;
        }
    }

    /**
     * 禁用实验功能（优化版）
     */
    disableExperiment(experiment) {
        const logger = window.logger || console;
        
        // 参数验证
        if (!experiment || typeof experiment !== 'object') {
            logger.error('AdvancedFeatures', '无效的实验功能对象');
            return false;
        }

        // 检查是否已禁用
        if (!this.activeExperiments.has(experiment.name)) {
            logger.warn('AdvancedFeatures', `实验功能"${experiment.name}"未启用`);
            return true;
        }

        logger.info('AdvancedFeatures', `禁用实验功能: ${experiment.name}`);
        
        try {
            if (typeof experiment.teardown === 'function') {
                experiment.teardown();
            }
            
            // 标记功能为非激活状态
            experiment.active = false;
            this.activeExperiments.delete(experiment.name);
            this.experimentCache.delete(experiment.name);
            
            // 优化：使用防抖保存
            if (this.debouncedSave) {
                this.debouncedSave(experiment.name, false);
            } else {
                this.saveExperimentState(experiment.name, false);
            }

            return true;
        } catch (error) {
            logger.error('AdvancedFeatures', `禁用实验功能失败 (${experiment.name}):`, error);
            return false;
        }
    }

    /**
     * 保存实验功能状态（优化版）
     */
    async saveExperimentState(name, active) {
        const logger = window.logger || console;
        
        try {
            // 优化：使用Storage系统而不是直接访问localStorage
            if (window.Storage) {
                const states = await window.Storage.get('experimentStates', {});
                states[name] = {
                    active,
                    timestamp: Date.now()
                };
                await window.Storage.set('experimentStates', states);
            } else {
                // 降级到localStorage
                const states = JSON.parse(localStorage.getItem('experimentStates') || '{}');
                states[name] = { active, timestamp: Date.now() };
                localStorage.setItem('experimentStates', JSON.stringify(states));
            }
            
            logger.debug('AdvancedFeatures', `实验状态已保存: ${name} = ${active}`);
        } catch (error) {
            logger.error('AdvancedFeatures', '保存实验状态失败:', error);
        }
    }

    /**
     * 恢复实验功能状态（优化版）
     */
    async restoreExperimentStates() {
        const logger = window.logger || console;
        
        try {
            logger.info('AdvancedFeatures', '开始恢复实验功能状态...');
            
            // 优化：使用Storage系统
            let states = {};
            if (window.Storage) {
                states = await window.Storage.get('experimentStates', {});
            } else {
                states = JSON.parse(localStorage.getItem('experimentStates') || '{}');
            }
            
            // 优化：批量恢复，收集需要启用的实验
            const experimentsToRestore = [];
            
            this.experiments.forEach(experiment => {
                const state = states[experiment.name];
                
                // 检查状态是否有效
                if (state && (state.active || state === true) && experiment.enabled) {
                    experimentsToRestore.push(experiment);
                }
            });
            
            if (experimentsToRestore.length > 0) {
                logger.info('AdvancedFeatures', `恢复 ${experimentsToRestore.length} 个实验功能`);
                
                // 优化：使用requestAnimationFrame分批恢复，避免阻塞
                const batchSize = 3;
                for (let i = 0; i < experimentsToRestore.length; i += batchSize) {
                    const batch = experimentsToRestore.slice(i, i + batchSize);
                    
                    await new Promise(resolve => {
                        requestAnimationFrame(() => {
                            batch.forEach(exp => this.enableExperiment(exp));
                            resolve();
                        });
                    });
                }
                
                logger.info('AdvancedFeatures', '实验功能状态恢复完成');
            } else {
                logger.info('AdvancedFeatures', '无需恢复实验功能');
            }
        } catch (error) {
            logger.error('AdvancedFeatures', '恢复实验状态失败:', error);
        }
    }

    /**
     * 获取活跃实验列表
     * @returns {Array} 活跃的实验功能列表
     */
    getActiveExperiments() {
        return Array.from(this.activeExperiments);
    }

    /**
     * 获取实验功能统计
     * @returns {Object} 统计信息
     */
    getExperimentStats() {
        return {
            total: this.experiments.length,
            active: this.activeExperiments.size,
            available: this.experiments.filter(e => e.enabled).length,
            capabilities: Object.entries(this.features)
                .filter(([_, supported]) => supported)
                .map(([name]) => name)
        };
    }

    /**
     * 设置语音助手
     */
    setupVoiceAssistant() {
        if (!this.features.voiceControl) return;

        this.voiceRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.voiceRecognition.continuous = false;
        this.voiceRecognition.interimResults = false;
        this.voiceRecognition.lang = 'zh-CN';

        this.voiceRecognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const transcript = result[0].transcript.toLowerCase();
                this.processVoiceCommand(transcript);
            }
        };

        this.voiceRecognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
        };

        this.voiceRecognition.onend = () => {
            // 自动重启语音识别
            if (this.voiceAssistantActive) {
                setTimeout(() => this.voiceRecognition.start(), 1000);
            }
        };

        // 创建语音助手UI
        this.createVoiceAssistantUI();
        this.voiceAssistantActive = true;
        this.voiceRecognition.start();
        console.log('🎤 语音助手已启动');
    }

    /**
     * 创建语音助手UI
     */
    createVoiceAssistantUI() {
        const voiceUI = document.createElement('div');
        voiceUI.id = 'voice-assistant-ui';
        voiceUI.innerHTML = `
            <div class="voice-button" title="点击开始语音识别">
                <div class="voice-icon">🎤</div>
                <div class="voice-status">待命中</div>
            </div>
            <div class="voice-commands">
                <h4>语音命令示例：</h4>
                <ul>
                    <li>"开始学习" - 进入词汇学习</li>
                    <li>"开始测试" - 进入词汇测试</li>
                    <li>"查看统计" - 查看学习统计</li>
                    <li>"切换深色模式" - 切换主题</li>
                    <li>"播放音乐" - 开启背景音乐</li>
                </ul>
            </div>
        `;
        document.body.appendChild(voiceUI);

        // 绑定点击事件
        const voiceButton = voiceUI.querySelector('.voice-button');
        voiceButton.addEventListener('click', () => {
            if (this.voiceRecognition) {
                this.voiceRecognition.start();
                this.updateVoiceStatus('listening');
            }
        });
    }

    /**
     * 更新语音状态
     */
    updateVoiceStatus(status) {
        const statusElement = document.querySelector('#voice-assistant-ui .voice-status');
        const voiceButton = document.querySelector('#voice-assistant-ui .voice-button');
        
        if (statusElement && voiceButton) {
            switch (status) {
                case 'listening':
                    statusElement.textContent = '聆听中...';
                    voiceButton.classList.add('listening');
                    break;
                case 'processing':
                    statusElement.textContent = '处理中...';
                    voiceButton.classList.remove('listening');
                    voiceButton.classList.add('processing');
                    break;
                case 'ready':
                default:
                    statusElement.textContent = '待命中';
                    voiceButton.classList.remove('listening', 'processing');
                    break;
            }
        }
    }

    /**
     * 处理语音命令
     */
    processVoiceCommand(command) {
        this.updateVoiceStatus('processing');
        console.log('🎤 语音命令:', command);

        let commandProcessed = false;

        // 页面导航命令
        if (command.includes('开始学习') || command.includes('词汇学习')) {
            window.app?.showPage('vocabulary');
            this.speakResponse('正在进入词汇学习页面');
            commandProcessed = true;
        } else if (command.includes('开始测试') || command.includes('词汇测试')) {
            window.app?.showPage('vocab-test');
            this.speakResponse('正在进入词汇测试页面');
            commandProcessed = true;
        } else if (command.includes('查看统计') || command.includes('学习统计')) {
            window.app?.showPage('statistics');
            this.speakResponse('正在查看学习统计');
            commandProcessed = true;
        } else if (command.includes('返回首页') || command.includes('主页')) {
            window.app?.showPage('home');
            this.speakResponse('正在返回首页');
            commandProcessed = true;
        }

        // 功能控制命令
        else if (command.includes('切换深色模式') || command.includes('深色主题')) {
            this.toggleDarkMode();
            this.speakResponse('已切换深色模式');
            commandProcessed = true;
        } else if (command.includes('播放音乐') || command.includes('背景音乐')) {
            this.toggleBackgroundMusic();
            this.speakResponse('已切换背景音乐');
            commandProcessed = true;
        }

        // 未识别命令
        if (!commandProcessed) {
            this.speakResponse('抱歉，我没有理解您的命令，请重试');
        }

        setTimeout(() => this.updateVoiceStatus('ready'), 2000);
    }

    /**
     * 语音回复
     */
    speakResponse(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    }

    /**
     * 关闭语音助手
     */
    teardownVoiceAssistant() {
        this.voiceAssistantActive = false;
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
        }
        const voiceUI = document.getElementById('voice-assistant-ui');
        if (voiceUI) {
            voiceUI.remove();
        }
        console.log('🎤 语音助手已关闭');
    }

    /**
     * 设置手势控制
     */
    setupGestureControl() {
        if (!this.features.gestureControl) return;

        let lastOrientation = { alpha: 0, beta: 0, gamma: 0 };
        
        window.addEventListener('deviceorientation', (event) => {
            const { alpha, beta, gamma } = event;
            
            // 检测手势
            const deltaGamma = gamma - lastOrientation.gamma;
            
            if (Math.abs(deltaGamma) > 30) {
                if (deltaGamma > 0) {
                    this.triggerGesture('swipe_right');
                } else {
                    this.triggerGesture('swipe_left');
                }
            }
            
            lastOrientation = { alpha, beta, gamma };
        });

        console.log('👋 手势控制已启动');
    }

    /**
     * 触发手势
     */
    triggerGesture(gesture) {
        console.log('👋 手势检测:', gesture);
        
        switch (gesture) {
            case 'swipe_left':
                // 切换到下一页
                break;
            case 'swipe_right':
                // 切换到上一页
                break;
        }
    }

    /**
     * 设置VR学习
     */
    setupVRLearning() {
        if (!this.features.virtualReality) return;
        
        console.log('🥽 VR学习环境准备中...');
        // VR学习环境设置
    }

    /**
     * 设置AR单词卡
     */
    setupARWordCards() {
        if (!this.features.augmentedReality) return;
        
        console.log('📱 AR单词卡准备中...');
        // AR单词卡设置
    }

    /**
     * 设置专注度监控
     */
    setupFocusMonitoring() {
        let focusStartTime = Date.now();
        let isPageVisible = true;
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isPageVisible = false;
                const focusTime = Date.now() - focusStartTime;
                console.log('👁️ 专注时长:', focusTime + 'ms');
            } else {
                isPageVisible = true;
                focusStartTime = Date.now();
            }
        });

        // 检测鼠标活动
        let lastMouseMove = Date.now();
        document.addEventListener('mousemove', () => {
            lastMouseMove = Date.now();
        });

        // 定期检查专注度
        setInterval(() => {
            const timeSinceMouseMove = Date.now() - lastMouseMove;
            if (timeSinceMouseMove > 30000 && isPageVisible) {
                console.log('👁️ 检测到可能的注意力分散');
                this.showFocusReminder();
            }
        }, 30000);

        console.log('👁️ 专注度监控已启动');
    }

    /**
     * 显示专注提醒
     */
    showFocusReminder() {
        if (window.Notification) {
            window.Notification.warning('检测到注意力分散，建议休息一下或重新专注学习', {
                duration: 5000,
                title: '专注提醒'
            });
        }
    }

    /**
     * 设置自适应音乐
     */
    setupAdaptiveMusic() {
        const musicContext = {
            studying: ['focus', 'ambient', 'classical'],
            testing: ['calm', 'minimal'],
            break: ['relaxing', 'nature']
        };

        let currentMode = 'studying';
        let audioContext = null;

        // 根据学习状态播放音乐
        const playAdaptiveMusic = (mode) => {
            console.log('🎵 切换背景音乐模式:', mode);
            currentMode = mode;
            // 这里可以集成音乐API
        };

        // 监听页面变化
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.replace('#', '');
            if (page.includes('test')) {
                playAdaptiveMusic('testing');
            } else if (page === 'home') {
                playAdaptiveMusic('break');
            } else {
                playAdaptiveMusic('studying');
            }
        });

        console.log('🎵 智能背景音乐已启动');
    }

    /**
     * 设置深色模式
     */
    setupDarkMode() {
        this.createDarkModeToggle();
        console.log('🌙 深色模式已启用');
    }

    createDarkModeToggle() {
        const darkModeBtn = document.createElement('button');
        darkModeBtn.id = 'dark-mode-toggle';
        darkModeBtn.innerHTML = '🌙';
        darkModeBtn.title = '切换深色模式';
        darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        document.body.appendChild(darkModeBtn);
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        if (window.Notification) {
            window.Notification.success(isDark ? '已切换到深色模式' : '已切换到浅色模式', { duration: 2000 });
        }
    }

    teardownDarkMode() {
        document.body.classList.remove('dark-mode');
        const darkModeBtn = document.getElementById('dark-mode-toggle');
        if (darkModeBtn) darkModeBtn.remove();
    }

    /**
     * 设置打字速度监控
     */
    setupTypingSpeedMonitor() {
        this.typingData = { chars: 0, startTime: null, words: 0 };
        this.createTypingSpeedDisplay();
        this.bindTypingEvents();
        console.log('⌨️ 打字速度监控已启用');
    }

    createTypingSpeedDisplay() {
        const display = document.createElement('div');
        display.id = 'typing-speed-display';
        display.innerHTML = `
            <div class="typing-stats">
                <span>WPM: <strong id="wpm-counter">0</strong></span>
                <span>CPM: <strong id="cpm-counter">0</strong></span>
            </div>
        `;
        document.body.appendChild(display);
    }

    bindTypingEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key.length === 1) { // 只计算可见字符
                if (!this.typingData.startTime) {
                    this.typingData.startTime = Date.now();
                }
                this.typingData.chars++;
                
                if (e.key === ' ') {
                    this.typingData.words++;
                }
                
                this.updateTypingStats();
            }
        });
    }

    updateTypingStats() {
        if (!this.typingData.startTime) return;
        
        const elapsed = (Date.now() - this.typingData.startTime) / 60000; // 分钟
        const wpm = Math.round(this.typingData.words / elapsed) || 0;
        const cpm = Math.round(this.typingData.chars / elapsed) || 0;
        
        const wpmElement = document.getElementById('wpm-counter');
        const cpmElement = document.getElementById('cpm-counter');
        
        if (wpmElement) wpmElement.textContent = wpm;
        if (cpmElement) cpmElement.textContent = cpm;
    }

    teardownTypingSpeedMonitor() {
        const display = document.getElementById('typing-speed-display');
        if (display) display.remove();
        this.typingData = null;
    }

    /**
     * 设置学习连击计数器
     */
    setupLearningStreak() {
        this.loadStreakData();
        this.createStreakDisplay();
        this.updateStreakCounter();
        console.log('🔥 学习连击计数器已启用');
    }

    loadStreakData() {
        const saved = localStorage.getItem('learningStreak');
        this.streakData = saved ? JSON.parse(saved) : {
            current: 0,
            best: 0,
            lastStudyDate: null
        };
    }

    createStreakDisplay() {
        const display = document.createElement('div');
        display.id = 'streak-display';
        display.innerHTML = `
            <div class="streak-counter">
                🔥 <span id="current-streak">${this.streakData.current}</span> 天
                <div class="streak-best">最佳: ${this.streakData.best} 天</div>
            </div>
        `;
        document.body.appendChild(display);
    }

    updateStreakCounter() {
        const today = new Date().toDateString();
        const lastDate = this.streakData.lastStudyDate;
        
        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                this.streakData.current++;
            } else if (lastDate !== today) {
                this.streakData.current = 1;
            }
            
            this.streakData.lastStudyDate = today;
            
            if (this.streakData.current > this.streakData.best) {
                this.streakData.best = this.streakData.current;
            }
            
            localStorage.setItem('learningStreak', JSON.stringify(this.streakData));
            
            const currentElement = document.getElementById('current-streak');
            if (currentElement) {
                currentElement.textContent = this.streakData.current;
            }
        }
    }

    teardownLearningStreak() {
        const display = document.getElementById('streak-display');
        if (display) display.remove();
    }

    /**
     * 设置智能通知系统
     */
    setupSmartNotifications() {
        this.requestNotificationPermission();
        this.scheduleSmartNotifications();
        console.log('📢 智能通知系统已启用');
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    scheduleSmartNotifications() {
        // 每30分钟检查学习状态
        this.notificationInterval = setInterval(() => {
            this.checkAndSendNotification();
        }, 30 * 60 * 1000);
    }

    checkAndSendNotification() {
        const lastActivity = localStorage.getItem('lastActivity');
        const now = Date.now();
        
        if (lastActivity && (now - parseInt(lastActivity)) > 60 * 60 * 1000) { // 1小时无活动
            this.sendSmartNotification('学习提醒', '您已经有一段时间没有学习了，要不要来复习一下？');
        }
    }

    sendSmartNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/assets/icons/logo.svg'
            });
        }
    }

    teardownSmartNotifications() {
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
        }
    }

    /**
     * 设置番茄钟计时器
     */
    setupPomodoroTimer() {
        this.pomodoroState = {
            isRunning: false,
            currentTime: 25 * 60, // 25分钟
            isBreak: false,
            sessions: 0
        };
        this.createPomodoroUI();
        console.log('🍅 番茄钟计时器已启用');
    }

    createPomodoroUI() {
        const pomodoroUI = document.createElement('div');
        pomodoroUI.id = 'pomodoro-timer';
        pomodoroUI.innerHTML = `
            <div class="pomodoro-display">
                <div class="timer-circle">
                    <div class="timer-text">
                        <span id="timer-minutes">25</span>:<span id="timer-seconds">00</span>
                    </div>
                </div>
                <div class="pomodoro-controls">
                    <button id="pomodoro-start">开始</button>
                    <button id="pomodoro-pause">暂停</button>
                    <button id="pomodoro-reset">重置</button>
                </div>
                <div class="pomodoro-status">
                    <span id="pomodoro-mode">专注时间</span>
                    <span id="session-count">第 1 个番茄钟</span>
                </div>
            </div>
        `;
        document.body.appendChild(pomodoroUI);
        this.bindPomodoroEvents();
    }

    bindPomodoroEvents() {
        document.getElementById('pomodoro-start').addEventListener('click', () => this.startPomodoro());
        document.getElementById('pomodoro-pause').addEventListener('click', () => this.pausePomodoro());
        document.getElementById('pomodoro-reset').addEventListener('click', () => this.resetPomodoro());
    }

    startPomodoro() {
        this.pomodoroState.isRunning = true;
        this.pomodoroInterval = setInterval(() => {
            this.updatePomodoroTimer();
        }, 1000);
    }

    pausePomodoro() {
        this.pomodoroState.isRunning = false;
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
        }
    }

    resetPomodoro() {
        this.pausePomodoro();
        this.pomodoroState.currentTime = this.pomodoroState.isBreak ? 5 * 60 : 25 * 60;
        this.updatePomodoroDisplay();
    }

    updatePomodoroTimer() {
        if (this.pomodoroState.currentTime > 0) {
            this.pomodoroState.currentTime--;
            this.updatePomodoroDisplay();
        } else {
            this.completePomodoroSession();
        }
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroState.currentTime / 60);
        const seconds = this.pomodoroState.currentTime % 60;
        
        document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
    }

    completePomodoroSession() {
        this.pausePomodoro();
        
        if (!this.pomodoroState.isBreak) {
            this.pomodoroState.sessions++;
            this.sendSmartNotification('番茄钟完成！', '恭喜完成一个专注时段，休息一下吧！');
            this.pomodoroState.isBreak = true;
            this.pomodoroState.currentTime = 5 * 60; // 5分钟休息
        } else {
            this.sendSmartNotification('休息结束！', '准备开始新的专注时段！');
            this.pomodoroState.isBreak = false;
            this.pomodoroState.currentTime = 25 * 60; // 25分钟专注
        }
        
        this.updatePomodoroDisplay();
        document.getElementById('pomodoro-mode').textContent = this.pomodoroState.isBreak ? '休息时间' : '专注时间';
        document.getElementById('session-count').textContent = `第 ${this.pomodoroState.sessions + 1} 个番茄钟`;
    }

    teardownPomodoroTimer() {
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
        }
        const pomodoroUI = document.getElementById('pomodoro-timer');
        if (pomodoroUI) pomodoroUI.remove();
    }

    /**
     * 设置自定义快捷键
     */
    setupCustomShortcuts() {
        this.customShortcuts = this.loadCustomShortcuts();
        this.bindCustomShortcuts();
        this.createShortcutManager();
        console.log('⌨️ 自定义快捷键已启用');
    }

    loadCustomShortcuts() {
        const saved = localStorage.getItem('customShortcuts');
        return saved ? JSON.parse(saved) : {
            'Ctrl+1': () => window.app?.showPage('home'),
            'Ctrl+2': () => window.app?.showPage('vocabulary'),
            'Ctrl+3': () => window.app?.showPage('vocab-test'),
            'Ctrl+4': () => window.app?.showPage('statistics')
        };
    }

    bindCustomShortcuts() {
        document.addEventListener('keydown', (e) => {
            const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;
            if (this.customShortcuts[key]) {
                e.preventDefault();
                this.customShortcuts[key]();
            }
        });
    }

    createShortcutManager() {
        // 可以添加快捷键管理界面
        console.log('快捷键管理器已创建');
    }

    teardownCustomShortcuts() {
        this.customShortcuts = null;
    }

    /**
     * 改进专注度监控
     */
    setupFocusMonitoring() {
        this.focusData = {
            startTime: Date.now(),
            totalFocusTime: 0,
            distractions: 0,
            isPageVisible: true
        };
        
        this.createFocusDisplay();
        this.bindFocusEvents();
        console.log('👁️ 专注度监控已启用');
    }

    createFocusDisplay() {
        const display = document.createElement('div');
        display.id = 'focus-display';
        display.innerHTML = `
            <div class="focus-stats">
                <div class="focus-time">专注: <span id="focus-time-counter">0分钟</span></div>
                <div class="focus-score">专注度: <span id="focus-score">100%</span></div>
            </div>
        `;
        document.body.appendChild(display);
        
        this.focusUpdateInterval = setInterval(() => this.updateFocusDisplay(), 1000);
    }

    bindFocusEvents() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.focusData.isPageVisible = false;
                this.focusData.distractions++;
            } else {
                this.focusData.isPageVisible = true;
            }
        });

        // 检测鼠标离开窗口
        document.addEventListener('mouseleave', () => {
            this.focusData.distractions++;
        });
    }

    updateFocusDisplay() {
        if (this.focusData.isPageVisible) {
            this.focusData.totalFocusTime += 1000;
        }
        
        const focusMinutes = Math.floor(this.focusData.totalFocusTime / 60000);
        const totalMinutes = Math.floor((Date.now() - this.focusData.startTime) / 60000);
        const focusScore = totalMinutes > 0 ? Math.round((focusMinutes / totalMinutes) * 100) : 100;
        
        const timeElement = document.getElementById('focus-time-counter');
        const scoreElement = document.getElementById('focus-score');
        
        if (timeElement) timeElement.textContent = `${focusMinutes}分钟`;
        if (scoreElement) scoreElement.textContent = `${focusScore}%`;
    }

    teardownFocusMonitoring() {
        if (this.focusUpdateInterval) {
            clearInterval(this.focusUpdateInterval);
        }
        const display = document.getElementById('focus-display');
        if (display) display.remove();
    }

    /**
     * 改进智能背景音乐
     */
    setupAdaptiveMusic() {
        this.musicEnabled = false;
        this.createMusicControls();
        console.log('🎵 智能背景音乐已启用');
    }

    createMusicControls() {
        const controls = document.createElement('div');
        controls.id = 'music-controls';
        controls.innerHTML = `
            <button id="music-toggle" title="切换背景音乐">🎵</button>
            <div class="music-info">
                <span id="music-status">音乐已关闭</span>
            </div>
        `;
        document.body.appendChild(controls);
        
        document.getElementById('music-toggle').addEventListener('click', () => {
            this.toggleBackgroundMusic();
        });
    }

    toggleBackgroundMusic() {
        this.musicEnabled = !this.musicEnabled;
        const statusElement = document.getElementById('music-status');
        
        if (this.musicEnabled) {
            statusElement.textContent = '背景音乐已开启';
            // 这里可以集成实际的音乐播放逻辑
        } else {
            statusElement.textContent = '音乐已关闭';
        }
    }

    teardownAdaptiveMusic() {
        const controls = document.getElementById('music-controls');
        if (controls) controls.remove();
        this.musicEnabled = false;
    }

    teardownGestureControl() {
        // 移除手势控制事件监听器
        console.log('👋 手势控制已关闭');
    }

    /**
     * 添加实验性功能样式
     */
    addExperimentalStyles() {
        if (document.getElementById('experimental-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'experimental-styles';
        styles.textContent = `
            /* 实验功能列表样式 */
            .experiment-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
            }

            .experiment-item:last-child {
                border-bottom: none;
            }

            .experiment-item.disabled {
                opacity: 0.5;
            }

            .experiment-info h4 {
                margin: 0 0 5px 0;
                font-size: 14px;
                color: #333;
            }

            .experiment-info p {
                margin: 0;
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }

            .experiment-toggle {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
                flex-shrink: 0;
                margin-left: 1rem;
            }

            .experiment-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: 0.3s;
                border-radius: 24px;
            }

            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }

            input:checked + .toggle-slider {
                background-color: #667eea;
            }

            input:checked + .toggle-slider:before {
                transform: translateX(26px);
            }

            input:disabled + .toggle-slider {
                opacity: 0.5;
                cursor: not-allowed;
            }

            /* 深色模式样式 */
            body.dark-mode {
                background-color: #1a1a1a;
                color: #e0e0e0;
            }

            body.dark-mode .header {
                background-color: #2d2d2d;
                border-bottom-color: #404040;
            }

            body.dark-mode .settings-card {
                background-color: #2d2d2d;
                border-color: #404040;
            }

            #dark-mode-toggle {
                position: fixed;
                top: 20px;
                right: 80px;
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                background: #333;
                color: #fff;
                cursor: pointer;
                font-size: 18px;
                z-index: 1000;
            }

            /* 语音助手样式 */
            #voice-assistant-ui {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 15px;
                width: 250px;
                z-index: 1000;
            }

            .voice-button {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                border: 2px solid #667eea;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .voice-button:hover {
                background: #f8f9ff;
            }

            .voice-button.listening {
                background: #667eea;
                color: white;
                animation: pulse 1s infinite;
            }

            .voice-commands {
                margin-top: 15px;
                font-size: 12px;
            }

            .voice-commands ul {
                margin: 5px 0;
                padding-left: 15px;
            }

            /* 打字速度显示 */
            #typing-speed-display {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: white;
                padding: 10px 15px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                font-size: 12px;
                z-index: 1000;
            }

            .typing-stats span {
                margin-right: 15px;
            }

            /* 学习连击显示 */
            #streak-display {
                position: fixed;
                top: 20px;
                left: 20px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                color: white;
                padding: 10px 15px;
                border-radius: 20px;
                font-weight: bold;
                z-index: 1000;
            }

            .streak-best {
                font-size: 10px;
                opacity: 0.8;
                margin-top: 2px;
            }

            /* 番茄钟样式 */
            #pomodoro-timer {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                background: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                text-align: center;
                z-index: 1000;
            }

            .timer-circle {
                width: 80px;
                height: 80px;
                border: 3px solid #667eea;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 15px;
            }

            .pomodoro-controls button {
                margin: 0 5px;
                padding: 5px 10px;
                border: 1px solid #667eea;
                background: white;
                color: #667eea;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            }

            .pomodoro-controls button:hover {
                background: #667eea;
                color: white;
            }

            .pomodoro-status {
                margin-top: 10px;
                font-size: 11px;
                color: #666;
            }

            /* 专注度显示 */
            #focus-display {
                position: fixed;
                bottom: 80px;
                left: 20px;
                background: white;
                padding: 10px 15px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                font-size: 12px;
                z-index: 1000;
            }

            /* 音乐控制 */
            #music-controls {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 1000;
            }

            #music-controls button {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                margin-right: 10px;
            }

            .music-info {
                font-size: 11px;
                color: #666;
            }

            /* 动画 */
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                #voice-assistant-ui,
                #pomodoro-timer {
                    width: calc(100vw - 40px);
                    left: 20px;
                    right: 20px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * 获取功能状态
     */
    getFeatureStatus() {
        return {
            capabilities: this.features,
            experiments: this.experiments.map(exp => ({
                name: exp.name,
                enabled: exp.enabled,
                active: exp.active || false
            }))
        };
    }

    /**
     * 手动测试高级学习分析
     */
    testAdvancedAnalytics() {
        console.log('🧪 手动测试高级学习分析功能...');
        
        // 检查AdvancedAnalytics是否存在
        if (!window.AdvancedAnalytics) {
            console.error('❌ window.AdvancedAnalytics 未找到');
            return false;
        }
        
        console.log('✅ window.AdvancedAnalytics 已找到');
        
        // 尝试调用showFeature
        try {
            window.AdvancedAnalytics.showFeature();
            console.log('✅ showFeature() 调用成功');
            
            // 检查悬浮按钮是否存在
            setTimeout(() => {
                const button = document.getElementById('advanced-analytics-toggle');
                if (button) {
                    console.log('✅ 悬浮按钮已创建');
                    console.log('按钮样式:', button.style.display);
                } else {
                    console.error('❌ 悬浮按钮未找到');
                }
            }, 500);
            
            return true;
        } catch (error) {
            console.error('❌ showFeature() 调用失败:', error);
            return false;
        }
    }
}

// 创建全局实例
window.AdvancedFeatures = new AdvancedFeatures();
