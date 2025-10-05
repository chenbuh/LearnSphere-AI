/**
 * 无障碍访问增强器
 * 提供全面的无障碍访问支持，包括屏幕阅读器、键盘导航、视觉辅助等
 */
class AccessibilityEnhancer {
    constructor() {
        this.isEnabled = true;
        this.settings = {};
        this.focusManager = null;
        this.screenReader = null;
        this.visualEnhancer = null;
        this.keyboardNavigator = null;
        this.announcements = [];
        
        // 性能优化：缓存和防抖
        this.elementCache = new Map();
        this.cacheTimeout = 30000; // 30秒缓存过期
        this.debouncedUpdate = Utils.debounce(this.updateAccessibilityFeatures.bind(this), 500);
        
        // 自适应优化
        this.userCapabilities = this.detectUserCapabilities();
        this.adaptiveSettings = new Map();
        
        this.init();
    }

    init() {
        console.log('♿ 初始化无障碍访问增强器...');
        this.loadAccessibilitySettings();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupVisualEnhancements();
        this.setupKeyboardNavigation();
        this.setupMotorAccessibility();
        this.setupCognitiveAssistance();
        this.createAccessibilityPanel();
        this.startAccessibilityMonitoring();
    }

    /**
     * 加载无障碍设置
     */
    loadAccessibilitySettings() {
        try {
            const saved = localStorage.getItem('accessibility_settings');
            this.settings = saved ? JSON.parse(saved) : {
                // 视觉辅助设置
                highContrast: false,
                largeText: false,
                fontSize: 16,
                colorBlindSupport: false,
                reducedMotion: false,
                darkMode: false,
                
                // 音频辅助设置
                screenReader: false,
                audioDescriptions: true,
                soundEffects: true,
                voiceSpeed: 1.0,
                voicePitch: 1.0,
                
                // 键盘导航设置
                keyboardNavigation: true,
                skipLinks: true,
                focusIndicator: true,
                tabOrder: 'logical',
                
                // 运动辅助设置
                stickyKeys: false,
                slowKeys: false,
                bounceKeys: false,
                mouseKeys: false,
                
                // 认知辅助设置
                simplifiedInterface: false,
                readingGuide: false,
                autoComplete: true,
                errorPrevention: true,
                timeExtension: false
            };
        } catch (error) {
            console.error('❌ 加载无障碍设置失败:', error);
        }

        console.log('⚙️ 无障碍设置已加载');
    }

    /**
     * 设置焦点管理
     */
    setupFocusManagement() {
        this.focusManager = {
            focusableElements: [],
            currentFocusIndex: -1,
            focusHistory: [],
            
            // 获取可聚焦元素
            getFocusableElements: () => {
                const selector = [
                    'a[href]',
                    'button:not([disabled])',
                    'input:not([disabled])',
                    'select:not([disabled])',
                    'textarea:not([disabled])',
                    '[tabindex]:not([tabindex="-1"])',
                    '[contenteditable="true"]'
                ].join(', ');
                
                return Array.from(document.querySelectorAll(selector))
                    .filter(el => el.offsetParent !== null && !el.hasAttribute('aria-hidden'));
            },
            
            // 管理焦点
            manageFocus: (element) => {
                if (element && typeof element.focus === 'function') {
                    element.focus();
                    this.focusManager.focusHistory.push(element);
                    this.announceToScreenReader(`焦点移至 ${this.getElementDescription(element)}`);
                }
            },
            
            // 焦点陷阱
            trapFocus: (container) => {
                const focusableElements = container.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                container.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === firstElement) {
                                e.preventDefault();
                                lastElement.focus();
                            }
                        } else {
                            if (document.activeElement === lastElement) {
                                e.preventDefault();
                                firstElement.focus();
                            }
                        }
                    }
                });
            }
        };

        // 增强焦点指示器
        if (this.settings.focusIndicator) {
            this.enhanceFocusIndicators();
        }

        // 设置跳转链接
        if (this.settings.skipLinks) {
            this.createSkipLinks();
        }

        console.log('🎯 焦点管理已设置');
    }

    /**
     * 增强焦点指示器
     */
    enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            :focus {
                outline: 3px solid #0066cc !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 5px rgba(0, 102, 204, 0.3) !important;
            }
            
            .focus-enhanced:focus {
                background-color: #e6f3ff !important;
                border: 2px solid #0066cc !important;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 10000;
                border-radius: 4px;
                font-weight: bold;
            }
            
            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 创建跳转链接
     */
    createSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">跳转到主要内容</a>
            <a href="#navigation" class="skip-link">跳转到导航</a>
            <a href="#search" class="skip-link">跳转到搜索</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    /**
     * 设置屏幕阅读器支持
     */
    setupScreenReaderSupport() {
        this.screenReader = {
            isActive: this.detectScreenReader(),
            announcements: [],
            
            // 创建实时通知区域
            createLiveRegion: () => {
                const liveRegion = document.createElement('div');
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.setAttribute('aria-atomic', 'true');
                liveRegion.setAttribute('id', 'live-region');
                liveRegion.style.cssText = `
                    position: absolute;
                    left: -10000px;
                    width: 1px;
                    height: 1px;
                    overflow: hidden;
                `;
                document.body.appendChild(liveRegion);
                return liveRegion;
            },
            
            // 紧急通知区域
            createAssertiveRegion: () => {
                const assertiveRegion = document.createElement('div');
                assertiveRegion.setAttribute('aria-live', 'assertive');
                assertiveRegion.setAttribute('id', 'assertive-region');
                assertiveRegion.style.cssText = `
                    position: absolute;
                    left: -10000px;
                    width: 1px;
                    height: 1px;
                    overflow: hidden;
                `;
                document.body.appendChild(assertiveRegion);
                return assertiveRegion;
            }
        };

        // 创建实时区域
        this.screenReader.liveRegion = this.screenReader.createLiveRegion();
        this.screenReader.assertiveRegion = this.screenReader.createAssertiveRegion();

        // 增强ARIA标签
        this.enhanceAriaLabels();

        // 设置语音合成
        if ('speechSynthesis' in window && this.settings.screenReader) {
            this.setupSpeechSynthesis();
        }

        console.log('🔊 屏幕阅读器支持已设置');
    }

    /**
     * 检测屏幕阅读器
     */
    detectScreenReader() {
        // 检测常见的屏幕阅读器
        const userAgent = navigator.userAgent.toLowerCase();
        const screenReaders = ['jaws', 'nvda', 'voiceover', 'talkback', 'dragon'];
        
        return screenReaders.some(sr => userAgent.includes(sr)) || 
               navigator.userAgent.includes('Accessibility') ||
               window.speechSynthesis !== undefined;
    }

    /**
     * 增强ARIA标签
     */
    enhanceAriaLabels() {
        // 自动添加ARIA标签
        const elements = {
            'button': '按钮',
            'input[type="text"]': '文本输入框',
            'input[type="password"]': '密码输入框',
            'input[type="email"]': '邮箱输入框',
            'select': '下拉选择框',
            'textarea': '文本区域',
            'nav': '导航',
            'main': '主要内容',
            'aside': '侧边栏',
            'header': '页头',
            'footer': '页脚'
        };

        Object.entries(elements).forEach(([selector, description]) => {
            document.querySelectorAll(selector).forEach(element => {
                if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
                    const text = element.textContent.trim();
                    if (text) {
                        element.setAttribute('aria-label', `${description}: ${text}`);
                    } else {
                        element.setAttribute('aria-label', description);
                    }
                }
            });
        });

        // 为表单添加描述
        document.querySelectorAll('form').forEach((form, index) => {
            if (!form.hasAttribute('aria-label')) {
                form.setAttribute('aria-label', `表单 ${index + 1}`);
            }
        });

        // 为列表添加描述
        document.querySelectorAll('ul, ol').forEach((list, index) => {
            if (!list.hasAttribute('aria-label')) {
                const itemCount = list.children.length;
                list.setAttribute('aria-label', `列表，包含 ${itemCount} 项`);
            }
        });
    }

    /**
     * 设置语音合成
     */
    setupSpeechSynthesis() {
        this.speechSynthesis = {
            synth: window.speechSynthesis,
            voices: [],
            currentVoice: null,
            
            init: () => {
                this.speechSynthesis.voices = this.speechSynthesis.synth.getVoices();
                this.speechSynthesis.currentVoice = this.speechSynthesis.voices.find(voice => 
                    voice.lang.startsWith('zh') || voice.lang.startsWith('cn')
                ) || this.speechSynthesis.voices[0];
            },
            
            speak: (text, options = {}) => {
                if (this.speechSynthesis.synth.speaking) {
                    this.speechSynthesis.synth.cancel();
                }
                
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.speechSynthesis.currentVoice;
                utterance.rate = this.settings.voiceSpeed;
                utterance.pitch = this.settings.voicePitch;
                utterance.volume = options.volume || 1.0;
                
                this.speechSynthesis.synth.speak(utterance);
            }
        };

        // 初始化语音
        this.speechSynthesis.init();
        
        // 监听语音变化
        this.speechSynthesis.synth.addEventListener('voiceschanged', () => {
            this.speechSynthesis.init();
        });
    }

    /**
     * 设置视觉增强
     */
    setupVisualEnhancements() {
        this.visualEnhancer = {
            applyHighContrast: () => {
                document.body.classList.toggle('high-contrast', this.settings.highContrast);
            },
            
            applyLargeText: () => {
                document.body.classList.toggle('large-text', this.settings.largeText);
            },
            
            applyFontSize: () => {
                document.documentElement.style.fontSize = `${this.settings.fontSize}px`;
            },
            
            applyColorBlindSupport: () => {
                document.body.classList.toggle('color-blind-support', this.settings.colorBlindSupport);
            },
            
            applyReducedMotion: () => {
                document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);
            },
            
            applyDarkMode: () => {
                document.body.classList.toggle('dark-mode', this.settings.darkMode);
            }
        };

        // 添加视觉增强样式
        this.addVisualEnhancementStyles();

        // 应用当前设置
        this.applyVisualEnhancements();

        console.log('👁️ 视觉增强已设置');
    }

    /**
     * 添加视觉增强样式
     */
    addVisualEnhancementStyles() {
        const style = document.createElement('style');
        style.id = 'accessibility-visual-styles';
        style.textContent = `
            /* 高对比度模式 */
            .high-contrast {
                filter: contrast(150%) brightness(1.2);
            }
            
            .high-contrast * {
                border-color: #000 !important;
                color: #000 !important;
                background-color: #fff !important;
            }
            
            .high-contrast a {
                color: #0000ff !important;
                text-decoration: underline !important;
            }
            
            .high-contrast button {
                background-color: #f0f0f0 !important;
                border: 2px solid #000 !important;
            }
            
            /* 大字体模式 */
            .large-text {
                font-size: 1.25em !important;
                line-height: 1.6 !important;
            }
            
            .large-text h1 { font-size: 2.5em !important; }
            .large-text h2 { font-size: 2.2em !important; }
            .large-text h3 { font-size: 1.8em !important; }
            .large-text h4 { font-size: 1.5em !important; }
            
            /* 色盲支持 */
            .color-blind-support {
                filter: sepia(0.1) saturate(0.8);
            }
            
            /* 减少动画 */
            .reduced-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            /* 暗色模式 */
            .dark-mode {
                background-color: #1a1a1a !important;
                color: #ffffff !important;
            }
            
            .dark-mode * {
                background-color: inherit;
                color: inherit;
                border-color: #666 !important;
            }
            
            .dark-mode input,
            .dark-mode select,
            .dark-mode textarea {
                background-color: #333 !important;
                color: #fff !important;
                border: 1px solid #666 !important;
            }
            
            .dark-mode button {
                background-color: #444 !important;
                color: #fff !important;
                border: 1px solid #666 !important;
            }
            
            /* 阅读指南 */
            .reading-guide {
                position: relative;
            }
            
            .reading-guide::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #0066cc, transparent);
                z-index: 10000;
                pointer-events: none;
                transition: top 0.1s ease;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        this.keyboardNavigator = {
            shortcuts: {
                'Alt+1': () => this.navigateToSection('main'),
                'Alt+2': () => this.navigateToSection('navigation'),
                'Alt+3': () => this.navigateToSection('search'),
                'Alt+4': () => this.toggleAccessibilityPanel(),
                'Alt+H': () => this.showKeyboardHelp(),
                'Escape': () => this.handleEscape(),
                'Tab': (e) => this.handleTab(e),
                'Shift+Tab': (e) => this.handleShiftTab(e),
                'Enter': (e) => this.handleEnter(e),
                'Space': (e) => this.handleSpace(e)
            },
            
            handleKeydown: (event) => {
                const key = this.getKeyString(event);
                const handler = this.keyboardNavigator.shortcuts[key];
                
                if (handler) {
                    event.preventDefault();
                    handler(event);
                }
            }
        };

        // 绑定键盘事件
        document.addEventListener('keydown', this.keyboardNavigator.handleKeydown);

        // 设置逻辑tab顺序
        this.setupLogicalTabOrder();

        console.log('⌨️ 键盘导航已设置');
    }

    /**
     * 设置逻辑Tab顺序
     */
    setupLogicalTabOrder() {
        const focusableElements = this.focusManager.getFocusableElements();
        
        // 根据页面结构重新排序tabindex
        focusableElements.forEach((element, index) => {
            if (!element.hasAttribute('tabindex') || element.getAttribute('tabindex') === '0') {
                element.setAttribute('tabindex', String(index + 1));
            }
        });
    }

    /**
     * 设置运动辅助
     */
    setupMotorAccessibility() {
        this.motorAccessibility = {
            // 粘滞键模拟
            stickyKeys: {
                enabled: this.settings.stickyKeys,
                modifierPressed: null,
                timeout: null
            },
            
            // 慢键模拟
            slowKeys: {
                enabled: this.settings.slowKeys,
                delay: 500,
                pendingKeys: new Map()
            },
            
            // 弹跳键模拟
            bounceKeys: {
                enabled: this.settings.bounceKeys,
                lastKey: null,
                lastTime: 0,
                debounceTime: 500
            },
            
            // 鼠标键模拟
            mouseKeys: {
                enabled: this.settings.mouseKeys,
                speed: 5,
                acceleration: 1.2
            }
        };

        if (this.settings.stickyKeys) {
            this.enableStickyKeys();
        }

        if (this.settings.slowKeys) {
            this.enableSlowKeys();
        }

        if (this.settings.bounceKeys) {
            this.enableBounceKeys();
        }

        if (this.settings.mouseKeys) {
            this.enableMouseKeys();
        }

        console.log('🖱️ 运动辅助已设置');
    }

    /**
     * 设置认知辅助
     */
    setupCognitiveAssistance() {
        this.cognitiveAssistance = {
            // 简化界面
            simplifyInterface: () => {
                if (this.settings.simplifiedInterface) {
                    document.body.classList.add('simplified-interface');
                    this.hideNonEssentialElements();
                }
            },
            
            // 阅读指南
            enableReadingGuide: () => {
                if (this.settings.readingGuide) {
                    document.body.classList.add('reading-guide');
                    this.setupReadingGuide();
                }
            },
            
            // 自动完成
            enhanceAutoComplete: () => {
                if (this.settings.autoComplete) {
                    this.setupIntelligentAutoComplete();
                }
            },
            
            // 错误预防
            enableErrorPrevention: () => {
                if (this.settings.errorPrevention) {
                    this.setupErrorPrevention();
                }
            },
            
            // 时间延长
            extendTimeouts: () => {
                if (this.settings.timeExtension) {
                    this.extendAllTimeouts();
                }
            }
        };

        // 应用认知辅助设置
        Object.values(this.cognitiveAssistance).forEach(fn => fn());

        console.log('🧠 认知辅助已设置');
    }

    /**
     * 创建无障碍面板
     */
    createAccessibilityPanel() {
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.innerHTML = `
            <div class="accessibility-controls">
                <div class="panel-header">
                    <h3>♿ 无障碍设置</h3>
                    <button class="close-btn" id="closeAccessibilityPanel">×</button>
                </div>
                
                <div class="panel-content">
                    <div class="control-section">
                        <h4>视觉辅助</h4>
                        <label class="control-item">
                            <input type="checkbox" id="highContrast" ${this.settings.highContrast ? 'checked' : ''}>
                            <span>高对比度</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="largeText" ${this.settings.largeText ? 'checked' : ''}>
                            <span>大字体</span>
                        </label>
                        <label class="control-item">
                            <span>字体大小</span>
                            <input type="range" id="fontSize" min="12" max="24" value="${this.settings.fontSize}">
                            <span id="fontSizeValue">${this.settings.fontSize}px</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="colorBlindSupport" ${this.settings.colorBlindSupport ? 'checked' : ''}>
                            <span>色盲支持</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="reducedMotion" ${this.settings.reducedMotion ? 'checked' : ''}>
                            <span>减少动画</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="darkMode" ${this.settings.darkMode ? 'checked' : ''}>
                            <span>暗色模式</span>
                        </label>
                    </div>
                    
                    <div class="control-section">
                        <h4>音频辅助</h4>
                        <label class="control-item">
                            <input type="checkbox" id="screenReader" ${this.settings.screenReader ? 'checked' : ''}>
                            <span>屏幕阅读器</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="audioDescriptions" ${this.settings.audioDescriptions ? 'checked' : ''}>
                            <span>音频描述</span>
                        </label>
                        <label class="control-item">
                            <span>语音速度</span>
                            <input type="range" id="voiceSpeed" min="0.5" max="2" step="0.1" value="${this.settings.voiceSpeed}">
                            <span id="voiceSpeedValue">${this.settings.voiceSpeed}x</span>
                        </label>
                    </div>
                    
                    <div class="control-section">
                        <h4>键盘导航</h4>
                        <label class="control-item">
                            <input type="checkbox" id="keyboardNavigation" ${this.settings.keyboardNavigation ? 'checked' : ''}>
                            <span>键盘导航</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="skipLinks" ${this.settings.skipLinks ? 'checked' : ''}>
                            <span>跳转链接</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="focusIndicator" ${this.settings.focusIndicator ? 'checked' : ''}>
                            <span>焦点指示器</span>
                        </label>
                    </div>
                    
                    <div class="control-section">
                        <h4>认知辅助</h4>
                        <label class="control-item">
                            <input type="checkbox" id="simplifiedInterface" ${this.settings.simplifiedInterface ? 'checked' : ''}>
                            <span>简化界面</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="readingGuide" ${this.settings.readingGuide ? 'checked' : ''}>
                            <span>阅读指南</span>
                        </label>
                        <label class="control-item">
                            <input type="checkbox" id="errorPrevention" ${this.settings.errorPrevention ? 'checked' : ''}>
                            <span>错误预防</span>
                        </label>
                    </div>
                </div>
                
                <div class="panel-actions">
                    <button class="btn btn-primary" id="saveAccessibilitySettings">保存设置</button>
                    <button class="btn btn-secondary" id="resetAccessibilitySettings">重置</button>
                    <button class="btn btn-info" id="accessibilityHelp">帮助</button>
                </div>
            </div>
        `;

        // 添加样式
        this.addAccessibilityPanelStyles();
        
        // 添加到页面
        document.body.appendChild(panel);
        
        // 绑定事件
        this.bindAccessibilityPanelEvents();

        // 创建快速访问按钮
        this.createQuickAccessButton();

        console.log('🎛️ 无障碍面板已创建');
    }

    /**
     * 添加无障碍面板样式
     */
    addAccessibilityPanelStyles() {
        const style = document.createElement('style');
        style.id = 'accessibility-panel-styles';
        style.textContent = `
            #accessibility-panel {
                position: fixed;
                top: 50%;
                right: -400px;
                transform: translateY(-50%);
                width: 400px;
                max-height: 80vh;
                background: white;
                border-radius: 10px 0 0 10px;
                box-shadow: -5px 0 20px rgba(0,0,0,0.3);
                z-index: 10001;
                transition: right 0.3s ease;
                overflow: hidden;
                font-family: 'Arial', sans-serif;
            }

            #accessibility-panel.open {
                right: 0;
            }

            .accessibility-controls {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .panel-header {
                background: #2c3e50;
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .panel-header h3 {
                margin: 0;
                font-size: 1.2rem;
            }

            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }

            .control-section {
                margin-bottom: 1.5rem;
                border-bottom: 1px solid #eee;
                padding-bottom: 1rem;
            }

            .control-section h4 {
                margin: 0 0 1rem 0;
                color: #2c3e50;
                font-size: 1rem;
            }

            .control-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.8rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 5px;
                transition: background-color 0.2s ease;
            }

            .control-item:hover {
                background-color: #f8f9fa;
            }

            .control-item input[type="checkbox"] {
                margin-right: 0.5rem;
                transform: scale(1.2);
            }

            .control-item input[type="range"] {
                flex: 1;
                margin: 0 0.5rem;
            }

            .panel-actions {
                padding: 1rem;
                border-top: 1px solid #eee;
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .panel-actions button {
                flex: 1;
                padding: 0.5rem;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.2s ease;
            }

            .btn-primary {
                background: #007bff;
                color: white;
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-info {
                background: #17a2b8;
                color: white;
            }

            .quick-access-btn {
                position: fixed;
                bottom: 80px;
                right: 10px;
                width: 50px;
                height: 50px;
                background: #2c3e50;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.5rem;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }

            .quick-access-btn:hover {
                background: #34495e;
                transform: translateY(-50%) scale(1.1);
            }

            .quick-access-btn:focus {
                outline: 3px solid #0066cc;
                outline-offset: 2px;
            }

            /* 简化界面样式 */
            .simplified-interface .complex-element {
                display: none !important;
            }

            .simplified-interface {
                font-size: 1.1em;
                line-height: 1.6;
            }

            .simplified-interface * {
                border-radius: 8px !important;
                box-shadow: none !important;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * 创建快速访问按钮
     */
    createQuickAccessButton() {
        // 检查是否已存在
        if (document.querySelector('.quick-access-btn')) {
            return;
        }

        const button = document.createElement('button');
        button.className = 'quick-access-btn';
        button.innerHTML = '♿';
        button.setAttribute('aria-label', '打开无障碍设置');
        button.setAttribute('title', '无障碍设置 (Alt+4)');
        
        button.addEventListener('click', () => {
            this.toggleAccessibilityPanel();
        });

        document.body.appendChild(button);
    }

    /**
     * 绑定无障碍面板事件
     */
    bindAccessibilityPanelEvents() {
        // 关闭按钮
        document.getElementById('closeAccessibilityPanel').addEventListener('click', () => {
            this.toggleAccessibilityPanel();
        });

        // 设置控件事件
        const controls = [
            'highContrast', 'largeText', 'colorBlindSupport', 'reducedMotion', 'darkMode',
            'screenReader', 'audioDescriptions', 'keyboardNavigation', 'skipLinks', 
            'focusIndicator', 'simplifiedInterface', 'readingGuide', 'errorPrevention'
        ];

        controls.forEach(control => {
            const element = document.getElementById(control);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.settings[control] = e.target.checked;
                    this.applySettingChange(control, e.target.checked);
                });
            }
        });

        // 范围控件
        const rangeControls = ['fontSize', 'voiceSpeed'];
        rangeControls.forEach(control => {
            const element = document.getElementById(control);
            const valueElement = document.getElementById(control + 'Value');
            if (element && valueElement) {
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.settings[control] = value;
                    valueElement.textContent = control === 'fontSize' ? `${value}px` : `${value}x`;
                    this.applySettingChange(control, value);
                });
            }
        });

        // 操作按钮
        document.getElementById('saveAccessibilitySettings').addEventListener('click', () => {
            this.saveAccessibilitySettings();
        });

        document.getElementById('resetAccessibilitySettings').addEventListener('click', () => {
            this.resetAccessibilitySettings();
        });

        document.getElementById('accessibilityHelp').addEventListener('click', () => {
            this.showAccessibilityHelp();
        });
    }

    /**
     * 应用设置更改
     */
    applySettingChange(setting, value) {
        switch (setting) {
            case 'highContrast':
                this.visualEnhancer.applyHighContrast();
                break;
            case 'largeText':
                this.visualEnhancer.applyLargeText();
                break;
            case 'fontSize':
                this.visualEnhancer.applyFontSize();
                break;
            case 'colorBlindSupport':
                this.visualEnhancer.applyColorBlindSupport();
                break;
            case 'reducedMotion':
                this.visualEnhancer.applyReducedMotion();
                break;
            case 'darkMode':
                this.visualEnhancer.applyDarkMode();
                break;
            case 'screenReader':
                this.toggleScreenReader(value);
                break;
            case 'simplifiedInterface':
                this.cognitiveAssistance.simplifyInterface();
                break;
            case 'readingGuide':
                this.cognitiveAssistance.enableReadingGuide();
                break;
        }
    }

    /**
     * 应用视觉增强
     */
    applyVisualEnhancements() {
        this.visualEnhancer.applyHighContrast();
        this.visualEnhancer.applyLargeText();
        this.visualEnhancer.applyFontSize();
        this.visualEnhancer.applyColorBlindSupport();
        this.visualEnhancer.applyReducedMotion();
        this.visualEnhancer.applyDarkMode();
    }

    /**
     * 向屏幕阅读器通知
     */
    announceToScreenReader(message, priority = 'polite') {
        const region = priority === 'assertive' ? 
            this.screenReader.assertiveRegion : 
            this.screenReader.liveRegion;
        
        if (region) {
            region.textContent = message;
            
            // 清除消息以便下次通知
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }

        // 如果启用语音合成
        if (this.settings.screenReader && this.speechSynthesis) {
            this.speechSynthesis.speak(message);
        }
    }

    /**
     * 获取元素描述
     */
    getElementDescription(element) {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent.trim();
        const label = element.getAttribute('aria-label') || element.getAttribute('title') || '';
        
        return label || text || `${tagName}元素`;
    }

    /**
     * 获取键盘快捷键字符串
     */
    getKeyString(event) {
        const parts = [];
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        if (event.metaKey) parts.push('Meta');
        
        if (event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift' && event.key !== 'Meta') {
            parts.push(event.key);
        }
        
        return parts.join('+');
    }

    /**
     * 切换无障碍面板
     */
    toggleAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.classList.toggle('open');
            const isOpen = panel.classList.contains('open');
            
            if (isOpen) {
                this.announceToScreenReader('无障碍设置面板已打开');
                // 焦点陷阱
                this.focusManager.trapFocus(panel);
            } else {
                this.announceToScreenReader('无障碍设置面板已关闭');
            }
        }
    }

    /**
     * 保存无障碍设置
     */
    saveAccessibilitySettings() {
        try {
            localStorage.setItem('accessibility_settings', JSON.stringify(this.settings));
            this.announceToScreenReader('无障碍设置已保存');
        } catch (error) {
            console.error('❌ 保存无障碍设置失败:', error);
            this.announceToScreenReader('保存设置失败', 'assertive');
        }
    }

    /**
     * 重置无障碍设置
     */
    resetAccessibilitySettings() {
        if (confirm('确定要重置所有无障碍设置吗？')) {
            localStorage.removeItem('accessibility_settings');
            location.reload();
        }
    }

    /**
     * 显示无障碍帮助
     */
    showAccessibilityHelp() {
        const helpContent = `
        无障碍功能帮助：

        键盘快捷键：
        • Alt+1: 跳转到主要内容
        • Alt+2: 跳转到导航
        • Alt+3: 跳转到搜索
        • Alt+4: 打开/关闭无障碍设置
        • Alt+H: 显示键盘帮助
        • Tab: 下一个元素
        • Shift+Tab: 上一个元素
        • Enter/Space: 激活元素
        • Escape: 关闭对话框

        视觉辅助：
        • 高对比度：增强文本和背景的对比度
        • 大字体：放大文本以便阅读
        • 色盲支持：调整颜色以适应色盲用户
        • 减少动画：减少或禁用动画效果
        • 暗色模式：使用深色背景保护眼睛

        音频辅助：
        • 屏幕阅读器：朗读页面内容
        • 语音速度：调整朗读速度

        认知辅助：
        • 简化界面：隐藏非必要元素
        • 阅读指南：提供阅读辅助线
        • 错误预防：提供额外的确认和提示
        `;

        alert(helpContent);
    }

    /**
     * 开始无障碍监控
     */
    startAccessibilityMonitoring() {
        // 监控焦点变化
        document.addEventListener('focusin', (event) => {
            this.handleFocusChange(event.target);
        });

        // 监控DOM变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    this.handleDOMChanges(mutation);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('👁️ 无障碍监控已启动');
    }

    /**
     * 检测用户能力 - 自适应优化
     */
    detectUserCapabilities() {
        const capabilities = {
            vision: this.detectVisionCapabilities(),
            hearing: this.detectHearingCapabilities(),
            motor: this.detectMotorCapabilities(),
            cognitive: this.detectCognitiveCapabilities()
        };
        
        console.log('🔍 检测到用户能力:', capabilities);
        return capabilities;
    }

    detectVisionCapabilities() {
        const vision = {
            screenReader: this.hasScreenReader(),
            highContrast: window.matchMedia('(prefers-contrast: high)').matches,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            fontSize: parseInt(getComputedStyle(document.documentElement).fontSize),
            colorBlindness: this.detectColorBlindness()
        };
        
        return vision;
    }

    detectHearingCapabilities() {
        return {
            audioSupport: 'speechSynthesis' in window,
            webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
            soundEnabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }

    detectMotorCapabilities() {
        return {
            touchSupport: 'ontouchstart' in window,
            pointerSupport: 'PointerEvent' in window,
            keyboardOnly: this.detectKeyboardOnlyNavigation(),
            fineMotorControl: this.detectFineMotorControl()
        };
    }

    detectCognitiveCapabilities() {
        return {
            attentionSpan: this.estimateAttentionSpan(),
            readingLevel: this.estimateReadingLevel(),
            memorySupport: this.detectMemoryNeeds()
        };
    }

    hasScreenReader() {
        // 检测常见的屏幕阅读器
        const userAgent = navigator.userAgent.toLowerCase();
        const screenReaders = ['nvda', 'jaws', 'voiceover', 'talkback', 'dragon'];
        
        return screenReaders.some(sr => userAgent.includes(sr)) ||
               window.speechSynthesis !== undefined ||
               !!window.navigator.userAgent.match(/screen reader/i);
    }

    detectColorBlindness() {
        // 简单的色盲检测（需要用户交互验证）
        return localStorage.getItem('accessibility_colorblind') === 'true';
    }

    detectKeyboardOnlyNavigation() {
        // 检测是否主要使用键盘导航
        return localStorage.getItem('accessibility_keyboard_only') === 'true';
    }

    detectFineMotorControl() {
        // 检测精细运动控制能力
        const touchDevice = 'ontouchstart' in window;
        const largeScreen = window.innerWidth > 768;
        
        return !touchDevice && largeScreen;
    }

    estimateAttentionSpan() {
        // 基于用户行为估计注意力持续时间
        const sessionTime = Date.now() - (sessionStorage.getItem('session_start') || Date.now());
        return sessionTime > 300000 ? 'long' : sessionTime > 60000 ? 'medium' : 'short';
    }

    estimateReadingLevel() {
        // 估计阅读水平（可以基于用户选择或行为分析）
        return localStorage.getItem('accessibility_reading_level') || 'medium';
    }

    detectMemoryNeeds() {
        // 检测是否需要记忆辅助
        return localStorage.getItem('accessibility_memory_support') === 'true';
    }

    /**
     * 自适应无障碍优化
     */
    applyAdaptiveOptimizations() {
        const capabilities = this.userCapabilities;
        
        // 视觉优化
        if (capabilities.vision.screenReader) {
            this.enableScreenReaderOptimizations();
        }
        
        if (capabilities.vision.highContrast) {
            this.enableHighContrastMode();
        }
        
        if (capabilities.vision.reducedMotion) {
            this.disableAnimations();
        }
        
        // 听觉优化
        if (!capabilities.hearing.audioSupport) {
            this.enableVisualAlternatives();
        }
        
        // 运动优化
        if (capabilities.motor.keyboardOnly) {
            this.enhanceKeyboardNavigation();
        }
        
        if (!capabilities.motor.fineMotorControl) {
            this.enlargeClickTargets();
        }
        
        // 认知优化
        if (capabilities.cognitive.attentionSpan === 'short') {
            this.simplifyInterface();
        }
        
        if (capabilities.cognitive.memorySupport) {
            this.enableMemoryAids();
        }
    }

    enableScreenReaderOptimizations() {
        // 增强屏幕阅读器支持
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.setAttribute('alt', '图片');
        });
        
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
            if (!btn.textContent.trim()) {
                btn.setAttribute('aria-label', '按钮');
            }
        });
        
        // 添加跳转链接
        this.addSkipLinks();
    }

    enableHighContrastMode() {
        document.body.classList.add('high-contrast');
        this.settings.highContrast = true;
        this.saveSettings();
    }

    disableAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    enableVisualAlternatives() {
        // 为音频内容提供视觉替代
        document.querySelectorAll('audio, video').forEach(media => {
            if (!media.querySelector('track[kind="captions"]')) {
                console.warn('媒体元素缺少字幕:', media);
            }
        });
    }

    enhanceKeyboardNavigation() {
        // 增强键盘导航
        this.settings.keyboardNavigation = true;
        this.setupKeyboardShortcuts();
        this.enhanceFocusIndicators();
    }

    enlargeClickTargets() {
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-large-targets button,
            .accessibility-large-targets a,
            .accessibility-large-targets input,
            .accessibility-large-targets select {
                min-height: 44px !important;
                min-width: 44px !important;
                padding: 12px !important;
            }
        `;
        document.head.appendChild(style);
        document.body.classList.add('accessibility-large-targets');
    }

    simplifyInterface() {
        // 简化界面
        document.body.classList.add('simplified-interface');
        
        // 隐藏非关键元素
        document.querySelectorAll('.advanced-options, .secondary-actions').forEach(el => {
            el.style.display = 'none';
        });
    }

    enableMemoryAids() {
        // 启用记忆辅助
        this.addBreadcrumbs();
        this.enableAutoSave();
        this.addProgressIndicators();
    }

    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">跳转到主要内容</a>
            <a href="#navigation" class="skip-link">跳转到导航</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    addBreadcrumbs() {
        const breadcrumbs = document.createElement('nav');
        breadcrumbs.setAttribute('aria-label', '面包屑导航');
        breadcrumbs.className = 'breadcrumbs';
        
        const currentPage = window.location.hash.replace('#', '') || 'home';
        breadcrumbs.innerHTML = `
            <ol>
                <li><a href="#home">首页</a></li>
                <li aria-current="page">${this.getPageTitle(currentPage)}</li>
            </ol>
        `;
        
        const main = document.querySelector('main, .main-content');
        if (main) {
            main.insertBefore(breadcrumbs, main.firstChild);
        }
    }

    getPageTitle(page) {
        const titles = {
            'vocabulary': '词汇学习',
            'grammar': '语法练习',
            'listening': '听力训练',
            'reading': '阅读理解',
            'writing': '写作练习',
            'statistics': '学习统计'
        };
        return titles[page] || '当前页面';
    }

    /**
     * 性能优化的更新方法
     */
    updateAccessibilityFeatures() {
        // 清理过期缓存
        this.cleanupCache();
        
        // 重新检测用户能力
        this.userCapabilities = this.detectUserCapabilities();
        
        // 应用自适应优化
        this.applyAdaptiveOptimizations();
        
        console.log('🔄 无障碍功能已更新');
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.elementCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.elementCache.delete(key);
            }
        }
    }

    /**
     * 处理焦点变化
     */
    handleFocusChange(element) {
        if (this.settings.screenReader) {
            const description = this.getElementDescription(element);
            this.announceToScreenReader(`焦点在 ${description}`);
        }
    }

    /**
     * 处理DOM变化
     */
    handleDOMChanges(mutation) {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                this.enhanceNewElement(node);
            }
        });
    }

    /**
     * 增强新元素
     */
    enhanceNewElement(element) {
        // 为新元素添加ARIA标签
        if (element.tagName && !element.hasAttribute('aria-label')) {
            const description = this.getElementDescription(element);
            if (description !== 'undefined元素') {
                element.setAttribute('aria-label', description);
            }
        }

        // 为新的可聚焦元素设置tabindex
        if (this.isFocusable(element)) {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        }
    }

    /**
     * 检查元素是否可聚焦
     */
    isFocusable(element) {
        const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
        return focusableTags.includes(element.tagName) || 
               element.hasAttribute('tabindex') || 
               element.hasAttribute('contenteditable');
    }

    /**
     * 销毁无障碍增强器
     */
    destroy() {
        // 移除面板
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            panel.remove();
        }

        // 移除快速访问按钮
        const button = document.querySelector('.quick-access-btn');
        if (button) {
            button.remove();
        }

        // 移除样式
        const styles = document.querySelectorAll('#accessibility-visual-styles, #accessibility-panel-styles');
        styles.forEach(style => style.remove());

        console.log('♿ 无障碍访问增强器已销毁');
    }
}

// 创建全局实例
window.AccessibilityEnhancer = new AccessibilityEnhancer();
