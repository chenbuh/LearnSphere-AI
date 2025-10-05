/**
 * AI智能导师系统
 * 提供个性化学习指导和智能问答
 */
class AITutor {
    constructor() {
        this.personality = 'friendly'; // friendly, strict, encouraging, humorous
        this.knowledge_base = {};
        this.conversation_history = [];
        this.student_profile = null;
        this.teaching_strategies = {};
        this.current_session = null;
        this.response_templates = {};
        this.init();
    }

    init() {
        if (window.logger) {
            window.logger.info('AITutor', '🤖 初始化AI智能导师...');
        }
        this.initializeKnowledgeBase();
        this.setupPersonality();
        this.loadTeachingStrategies();
        this.initializeResponseTemplates();
        this.setupUI();
    }

    /**
     * 初始化知识库
     */
    initializeKnowledgeBase() {
        this.knowledge_base = {
            // 语法知识
            grammar: {
                tenses: {
                    present_simple: {
                        definition: "现在时表示经常发生的动作或状态",
                        structure: "主语 + 动词原形/第三人称单数",
                        examples: ["I study English every day.", "She works in a hospital."],
                        common_mistakes: ["忘记第三人称单数加s", "时间状语使用错误"],
                        exercises: ["fill_blanks", "sentence_transformation"]
                    },
                    past_simple: {
                        definition: "过去时表示过去发生的动作或状态",
                        structure: "主语 + 动词过去式",
                        examples: ["I visited London last year.", "They played football yesterday."],
                        common_mistakes: ["不规则动词变形错误", "时间状语混用"],
                        exercises: ["story_completion", "timeline_exercises"]
                    },
                    future_simple: {
                        definition: "将来时表示将要发生的动作或状态",
                        structure: "主语 + will + 动词原形",
                        examples: ["I will travel to Japan next month.", "She will graduate next year."],
                        common_mistakes: ["will和be going to混用", "条件句中的时态"],
                        exercises: ["prediction_games", "planning_activities"]
                    }
                },
                sentence_patterns: {
                    questions: {
                        wh_questions: "以what, where, when, why, how开头的疑问句",
                        yes_no_questions: "可以用yes或no回答的疑问句",
                        tag_questions: "反义疑问句"
                    },
                    conditionals: {
                        zero_conditional: "表示普遍真理的条件句",
                        first_conditional: "表示真实条件的句子",
                        second_conditional: "表示假设条件的句子"
                    }
                }
            },

            // 词汇知识
            vocabulary: {
                categories: {
                    daily_life: ["food", "family", "home", "transportation", "weather"],
                    academic: ["education", "science", "technology", "research", "analysis"],
                    business: ["meeting", "presentation", "negotiation", "marketing", "finance"],
                    travel: ["hotel", "airport", "restaurant", "sightseeing", "culture"]
                },
                learning_techniques: {
                    mnemonics: "记忆法技巧",
                    word_association: "词汇联想",
                    context_learning: "语境学习",
                    spaced_repetition: "间隔重复"
                }
            },

            // 学习技巧
            study_tips: {
                reading: [
                    "先浏览全文，了解大意",
                    "标记关键词和短语",
                    "总结每段的主要内容",
                    "练习推理和判断"
                ],
                listening: [
                    "先听整体，再听细节",
                    "注意语调和重音",
                    "记录关键信息",
                    "多听不同口音"
                ],
                speaking: [
                    "模仿标准发音",
                    "练习流利度",
                    "增加词汇量",
                    "克服紧张情绪"
                ],
                writing: [
                    "明确文章结构",
                    "使用连接词",
                    "检查语法错误",
                    "丰富表达方式"
                ]
            },

            // 考试策略
            exam_strategies: {
                cet4: {
                    listening: "重点练习对话理解和短文听写",
                    reading: "提高阅读速度，掌握快速定位技巧",
                    writing: "掌握议论文和应用文写作模板",
                    translation: "加强中英文转换能力"
                },
                ielts: {
                    listening: "熟悉各种题型，提高预测能力",
                    reading: "训练快速浏览和精读技能",
                    writing: "掌握Task1和Task2的写作要求",
                    speaking: "提高流利度和准确性"
                }
            }
        };

        if (window.logger) {
            window.logger.debug('AITutor', '📚 知识库已初始化');
        }
    }

    /**
     * 设置AI导师个性
     */
    setupPersonality() {
        this.personality_traits = {
            friendly: {
                greeting: "你好！我是你的AI学习伙伴，很高兴帮助你学习英语！😊",
                encouragement: ["做得很好！", "继续努力！", "你在进步！", "相信自己！"],
                correction: "没关系，让我们一起来看看正确的答案。",
                farewell: "今天的学习很棒！明天见！"
            },
            strict: {
                greeting: "开始今天的学习吧。我们要认真对待每一个知识点。",
                encouragement: ["需要更加努力", "基础还需要加强", "继续练习"],
                correction: "这个答案是错误的。请仔细思考正确答案。",
                farewell: "记住要复习今天学过的内容。"
            },
            encouraging: {
                greeting: "太棒了！又到了学习时间！让我们一起征服英语吧！🌟",
                encouragement: ["你是最棒的！", "每一步都是进步！", "坚持就是胜利！"],
                correction: "别担心，错误是学习的一部分。让我们找出正确答案！",
                farewell: "你今天表现出色！为自己骄傲吧！"
            },
            humorous: {
                greeting: "嗨！你的英语导师上线了！准备好接受知识的洗礼了吗？😄",
                encouragement: ["你比昨天更聪明了！", "大脑升级中...请稍候", "知识+1！"],
                correction: "哎呀，这个答案想逃跑！让我们把正确答案抓回来。",
                farewell: "今天的大脑充电完毕！明天继续冒险！"
            }
        };

        if (window.logger) {
            window.logger.debug('AITutor', `🎭 AI导师个性设置为: ${this.personality}`);
        }
    }

    /**
     * 加载教学策略
     */
    loadTeachingStrategies() {
        this.teaching_strategies = {
            // 根据学习者水平调整策略
            beginner: {
                explanation_style: 'detailed',
                examples_count: 3,
                practice_difficulty: 'easy',
                feedback_frequency: 'immediate',
                encouragement_level: 'high'
            },
            intermediate: {
                explanation_style: 'moderate',
                examples_count: 2,
                practice_difficulty: 'medium',
                feedback_frequency: 'periodic',
                encouragement_level: 'medium'
            },
            advanced: {
                explanation_style: 'concise',
                examples_count: 1,
                practice_difficulty: 'hard',
                feedback_frequency: 'summary',
                encouragement_level: 'low'
            },

            // 根据学习类型调整
            visual_learner: {
                use_diagrams: true,
                color_coding: true,
                mind_maps: true,
                visual_examples: true
            },
            auditory_learner: {
                pronunciation_focus: true,
                audio_examples: true,
                rhythm_patterns: true,
                verbal_explanations: true
            },
            kinesthetic_learner: {
                interactive_exercises: true,
                hands_on_activities: true,
                movement_based: true,
                practical_applications: true
            }
        };

        if (window.logger) {
            window.logger.debug('AITutor', '📖 教学策略已加载');
        }
    }

    /**
     * 初始化回复模板
     */
    initializeResponseTemplates() {
        this.response_templates = {
            explanation: {
                grammar: "让我来解释一下{topic}。{definition}。例如：{examples}。常见错误包括：{mistakes}。",
                vocabulary: "关于单词'{word}'，它的意思是{meaning}。用法：{usage}。记忆技巧：{memory_tip}。",
                pronunciation: "'{word}'的发音是{phonetic}。注意{pronunciation_tips}。让我们一起练习几遍。"
            },
            encouragement: {
                correct: "太棒了！你答对了！{encouragement}",
                incorrect: "没关系，{comfort}让我们一起分析一下正确答案。",
                progress: "你的进步很明显！{specific_progress}继续保持！"
            },
            suggestions: {
                study_plan: "基于你的表现，我建议你{suggestions}。这样可以{benefits}。",
                practice: "为了提高{skill}，你可以尝试{practice_methods}。",
                resources: "我推荐你使用这些资源：{resources}。"
            }
        };

        if (window.logger) {
            window.logger.debug('AITutor', '💬 回复模板已初始化');
        }
    }

    /**
     * 设置UI界面
     */
    setupUI() {
        // 延迟初始化，确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeUI();
            });
        } else {
            this.initializeUI();
        }
    }

    /**
     * 初始化UI界面
     */
    initializeUI() {
        // 不创建悬浮界面，而是集成到页面中
        this.setupInlineInterface();
        this.setupEventListeners();
    }

    /**
     * 设置内联界面
     */
    setupInlineInterface() {
        // 绑定到页面中的AI导师卡片
        const tutorCard = document.getElementById('ai-tutor-card');
        if (!tutorCard) {
            console.warn('AI导师卡片未找到，将创建悬浮界面');
            this.createTutorInterface();
            return;
        }

        // 设置内联聊天功能
        this.setupInlineTutorChat();
    }

    /**
     * 设置内联聊天功能
     */
    setupInlineTutorChat() {
        const chatPreview = document.getElementById('tutorChatPreview');
        const quickInput = document.getElementById('quickTutorInput');
        const sendButton = document.getElementById('sendQuickMessage');

        if (!chatPreview || !quickInput || !sendButton) {
            if (window.logger) {
                window.logger.warn('AITutor', 'AI导师界面元素未找到，将稍后重试');
            }
            // 延迟重试，可能DOM还未完全加载
            setTimeout(() => this.setupInlineTutorChat(), 1000);
            return;
        }

        // 清除可能存在的旧事件监听器
        const newSendButton = sendButton.cloneNode(true);
        sendButton.parentNode.replaceChild(newSendButton, sendButton);
        
        // 设置初始欢迎消息
        if (chatPreview.children.length <= 1) {
            chatPreview.innerHTML = `
                <div class="chat-message">
                    <span class="message-text tutor">你好！我是你的AI学习伙伴 😊</span>
                </div>
                <div class="chat-message">
                    <span class="message-text tutor">你可以问我任何英语学习问题，比如语法、词汇、学习方法等！</span>
                </div>
            `;
        }

        // 绑定发送消息事件
        const handleSend = async () => {
            const message = quickInput.value.trim();
            if (!message) return;

            // 显示用户消息
            this.addInlineMessage(message, 'user', chatPreview);
            quickInput.value = '';

            // 显示加载状态
            const loadingMessage = this.addInlineMessage('正在思考...', 'tutor', chatPreview);
            
            try {
                // 生成AI回复
                const response = await this.generateResponse(message);
                
                // 移除加载消息
                if (loadingMessage && loadingMessage.parentNode) {
                    loadingMessage.parentNode.removeChild(loadingMessage);
                }
                
                // 显示AI回复
                this.addInlineMessage(response, 'tutor', chatPreview);
                
            } catch (error) {
                if (window.logger) {
                    window.logger.error('AITutor', 'AI导师响应失败:', error);
                }
                
                // 移除加载消息
                if (loadingMessage && loadingMessage.parentNode) {
                    loadingMessage.parentNode.removeChild(loadingMessage);
                }
                
                this.addInlineMessage('抱歉，我现在无法回复。请稍后重试。', 'tutor', chatPreview);
            }
        };

        // 重新获取按钮引用（因为我们替换了它）
        const currentSendButton = document.getElementById('sendQuickMessage');
        const currentQuickInput = document.getElementById('quickTutorInput');
        
        if (currentSendButton && currentQuickInput) {
            currentSendButton.addEventListener('click', handleSend);
            currentQuickInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                }
            });
            
            if (window.logger) {
                window.logger.info('AITutor', 'AI导师界面事件已绑定');
            }
            
            // 添加一些示例问题按钮
            this.addQuickQuestions(chatPreview);
        }
    }

    /**
     * 添加内联消息
     */
    addInlineMessage(content, sender, container) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const messageSpan = document.createElement('span');
        messageSpan.className = `message-text ${sender}`;
        messageSpan.textContent = content;
        
        messageDiv.appendChild(messageSpan);
        container.appendChild(messageDiv);
        
        // 滚动到底部
        container.scrollTop = container.scrollHeight;
        
        // 返回消息元素，用于后续操作（如删除加载消息）
        return messageDiv;
    }

    /**
     * 添加快速问题按钮
     */
    addQuickQuestions(chatPreview) {
        const quickQuestions = [
            "我想学习英语四级，给我一个学习规划",
            "Hello! 让我们一起提升你的英语水平吧!"
        ];

        // 只在初始化时添加一次
        if (chatPreview.children.length <= 1) {
            quickQuestions.forEach(question => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'chat-message';
                questionDiv.innerHTML = `
                    <button class="btn btn-outline-primary btn-sm quick-question-btn" 
                            onclick="window.AITutor.handleQuickQuestion('${question}')"
                            style="margin: 2px; font-size: 0.8rem;">
                        ${question}
                    </button>
                `;
                chatPreview.appendChild(questionDiv);
            });
        }
    }

    /**
     * 处理快速问题点击
     */
    handleQuickQuestion(question) {
        const quickInput = document.getElementById('quickTutorInput');
        if (quickInput) {
            quickInput.value = question;
            const sendButton = document.getElementById('sendQuickMessage');
            if (sendButton) {
                sendButton.click();
            }
        }
    }

    /**
     * 生成快速回复
     */
    generateQuickResponse(message) {
        const quickResponses = [
            "这是一个很好的问题！让我来帮你解答。",
            "我理解你的疑问，这里有一些建议...",
            "根据你的问题，我推荐你这样学习...",
            "很棒的学习态度！继续加油！",
            "这个知识点确实需要多练习，我来给你一些方法。"
        ];
        
        // 修复变量名错误：应该使用message而不是userMessage
        const index = message.length % quickResponses.length;
        return quickResponses[index];
    }

    /**
     * 创建导师界面（备用悬浮模式）
     */
    createTutorInterface() {
        // 检查是否已存在导师界面
        if (document.getElementById('ai-tutor-container')) {
            return;
        }

        const tutorContainer = document.createElement('div');
        tutorContainer.id = 'ai-tutor-container';
        tutorContainer.innerHTML = `
            <div class="ai-tutor-panel">
                <div class="tutor-header">
                    <div class="tutor-avatar">
                        <div class="avatar-image">🤖</div>
                        <div class="status-indicator online"></div>
                    </div>
                    <div class="tutor-info">
                        <h3 class="tutor-name">AI导师</h3>
                        <p class="tutor-status">在线 - 随时为您服务</p>
                    </div>
                    <div class="tutor-controls">
                        <button class="btn btn-sm btn-outline-secondary" id="tutorSettings">⚙️</button>
                        <button class="btn btn-sm btn-outline-secondary" id="minimizeTutor">−</button>
                    </div>
                </div>
                
                <div class="tutor-body">
                    <div class="conversation-area" id="conversationArea">
                        <div class="welcome-message">
                            <div class="message tutor-message">
                                <div class="message-content">
                                    ${this.personality_traits[this.personality].greeting}
                                </div>
                                <div class="message-time">${new Date().toLocaleTimeString()}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="quick-btn" data-action="explain">📖 解释概念</button>
                        <button class="quick-btn" data-action="practice">💪 练习建议</button>
                        <button class="quick-btn" data-action="feedback">📊 学习反馈</button>
                        <button class="quick-btn" data-action="plan">📅 学习计划</button>
                    </div>
                    
                    <div class="input-area">
                        <div class="input-group">
                            <input type="text" 
                                   id="tutorInput" 
                                   class="form-control" 
                                   placeholder="问我任何关于英语学习的问题..."
                                   autocomplete="off">
                            <button class="btn btn-primary" id="sendMessage">
                                <span class="icon">📤</span>
                            </button>
                        </div>
                        <div class="input-suggestions" id="inputSuggestions"></div>
                    </div>
                </div>
                
                <div class="tutor-settings-panel hidden" id="tutorSettingsPanel">
                    <h4>导师设置</h4>
                    <div class="setting-group">
                        <label>个性类型</label>
                        <select id="personalitySelect" class="form-control">
                            <option value="friendly">友善型</option>
                            <option value="strict">严格型</option>
                            <option value="encouraging">鼓励型</option>
                            <option value="humorous">幽默型</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>回复速度</label>
                        <input type="range" id="responseSpeed" min="500" max="3000" value="1500" class="form-range">
                        <small>慢 ←→ 快</small>
                    </div>
                    <div class="setting-group">
                        <label>详细程度</label>
                        <select id="detailLevel" class="form-control">
                            <option value="brief">简洁</option>
                            <option value="moderate">适中</option>
                            <option value="detailed">详细</option>
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm" id="saveSettings">保存设置</button>
                </div>
            </div>
        `;

        // 添加样式
        const styles = `
            <style>
                #ai-tutor-container {
                    position: fixed;
                    bottom: 20px;
                    right: 440px;
                    width: 350px;
                    max-height: 500px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    z-index: 1000;
                    font-family: 'Roboto', sans-serif;
                    border: 1px solid #e0e0e0;
                    overflow: hidden;
                }

                .ai-tutor-panel {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .tutor-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .tutor-avatar {
                    position: relative;
                }

                .avatar-image {
                    width: 40px;
                    height: 40px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }

                .status-indicator {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                }

                .status-indicator.online {
                    background: #28a745;
                }

                .tutor-info {
                    flex: 1;
                }

                .tutor-name {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: bold;
                }

                .tutor-status {
                    margin: 0;
                    font-size: 0.8rem;
                    opacity: 0.9;
                }

                .tutor-controls {
                    display: flex;
                    gap: 0.5rem;
                }

                .tutor-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    max-height: 400px;
                }

                .conversation-area {
                    flex: 1;
                    padding: 1rem;
                    overflow-y: auto;
                    max-height: 250px;
                }

                .message {
                    margin-bottom: 1rem;
                    animation: messageSlideIn 0.3s ease-out;
                }

                .tutor-message .message-content {
                    background: #f8f9fa;
                    color: #333;
                    padding: 0.8rem;
                    border-radius: 15px 15px 15px 5px;
                    max-width: 85%;
                }

                .user-message .message-content {
                    background: #007bff;
                    color: white;
                    padding: 0.8rem;
                    border-radius: 15px 15px 5px 15px;
                    max-width: 85%;
                    margin-left: auto;
                }

                .message-time {
                    font-size: 0.7rem;
                    color: #6c757d;
                    margin-top: 0.3rem;
                }

                .quick-actions {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0 1rem;
                    flex-wrap: wrap;
                }

                .quick-btn {
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    border-radius: 20px;
                    padding: 0.4rem 0.8rem;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .quick-btn:hover {
                    background: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .input-area {
                    padding: 1rem;
                    border-top: 1px solid #e0e0e0;
                }

                .input-group {
                    display: flex;
                    gap: 0.5rem;
                }

                .input-group input {
                    flex: 1;
                    border: 1px solid #e0e0e0;
                    border-radius: 20px;
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                }

                .input-group button {
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .input-suggestions {
                    display: flex;
                    gap: 0.3rem;
                    margin-top: 0.5rem;
                    flex-wrap: wrap;
                }

                .suggestion-chip {
                    background: #e3f2fd;
                    color: #1976d2;
                    padding: 0.2rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .suggestion-chip:hover {
                    background: #1976d2;
                    color: white;
                }

                .tutor-settings-panel {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: white;
                    padding: 1rem;
                    overflow-y: auto;
                }

                .tutor-settings-panel.hidden {
                    display: none;
                }

                .setting-group {
                    margin-bottom: 1rem;
                }

                .setting-group label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 0.3rem;
                    color: #333;
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.8rem;
                    background: #f8f9fa;
                    border-radius: 15px;
                    margin-bottom: 1rem;
                }

                .typing-dots {
                    display: flex;
                    gap: 3px;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: #6c757d;
                    border-radius: 50%;
                    animation: typingDots 1.4s ease-in-out infinite both;
                }

                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                .typing-dot:nth-child(3) { animation-delay: 0s; }

                @keyframes typingDots {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes messageSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 1200px) {
                    #ai-tutor-container {
                        right: 20px;
                        width: 320px;
                    }
                }

                @media (max-width: 768px) {
                    #ai-tutor-container {
                        width: calc(100vw - 20px);
                        max-width: 350px;
                        bottom: 10px;
                        right: 10px;
                        left: 10px;
                        margin: 0 auto;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(tutorContainer);

        console.log('🎨 AI导师界面已创建');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        const sendButton = document.getElementById('sendMessage');
        const input = document.getElementById('tutorInput');
        const quickBtns = document.querySelectorAll('.quick-btn');
        const settingsBtn = document.getElementById('tutorSettings');
        const minimizeBtn = document.getElementById('minimizeTutor');

        // 发送消息
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.handleUserMessage();
            });
        }

        // 回车发送
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleUserMessage();
                }
            });

            // 输入建议
            input.addEventListener('input', (e) => {
                this.showInputSuggestions(e.target.value);
            });
        }

        // 快速操作按钮
        quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // 设置按钮
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.toggleSettings();
            });
        }

        // 最小化按钮
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.minimizeTutor();
            });
        }

        // 个性选择
        const personalitySelect = document.getElementById('personalitySelect');
        if (personalitySelect) {
            personalitySelect.value = this.personality;
            personalitySelect.addEventListener('change', (e) => {
                this.personality = e.target.value;
                this.setupPersonality();
            });
        }

        console.log('🔗 事件监听器已设置');
    }

    /**
     * 处理用户消息
     */
    async handleUserMessage() {
        const input = document.getElementById('tutorInput');
        const message = input.value.trim();
        
        if (!message) return;

        // 显示用户消息
        this.addMessage(message, 'user');
        input.value = '';

        // 显示输入中状态
        this.showTypingIndicator();

        // 生成AI回复
        const response = await this.generateResponse(message);
        
        // 移除输入中状态并显示回复
        this.hideTypingIndicator();
        this.addMessage(response, 'tutor');

        // 记录对话历史
        this.conversation_history.push({
            user: message,
            tutor: response,
            timestamp: Date.now()
        });

        // 更新输入建议
        this.updateInputSuggestions(message);
    }

    /**
     * 添加消息到对话区
     */
    addMessage(content, sender) {
        const conversationArea = document.getElementById('conversationArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;

        conversationArea.appendChild(messageDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }

    /**
     * 显示输入中指示器
     */
    showTypingIndicator() {
        const conversationArea = document.getElementById('conversationArea');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <span>AI导师正在输入</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        conversationArea.appendChild(typingDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }

    /**
     * 隐藏输入中指示器
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * 生成AI回复
     */
    async generateResponse(userMessage) {
        // 减少响应延迟，提供更快的用户体验
        const responseDelay = document.getElementById('responseSpeed')?.value || 300;
        await new Promise(resolve => setTimeout(resolve, parseInt(responseDelay)));

        // 深度分析用户问题
        const analysis = this.deepAnalyzeQuestion(userMessage);
        
        // 根据分析结果生成针对性回答
        let response = this.generateContextualResponse(userMessage, analysis);

        return this.personalizeResponse(response);
    }

    /**
     * 深度分析用户问题
     */
    deepAnalyzeQuestion(message) {
        const lowerMessage = message.toLowerCase();
        
        const analysis = {
            originalMessage: message,
            keywords: this.extractKeywords(message),
            questionType: this.identifyQuestionType(message),
            context: this.identifyContext(message),
            intent: this.analyzeIntent(lowerMessage),
            entities: this.extractEntities(message),
            sentiment: this.analyzeSentiment(message)
        };

        return analysis;
    }

    /**
     * 提取关键词
     */
    extractKeywords(message) {
        const keywords = [];
        const lowerMessage = message.toLowerCase();
        
        // 学习相关关键词
        const learningKeywords = ['学习', '学', '背', '记', '练习', '提高', '改善', '掌握'];
        const examKeywords = ['四级', '六级', '雅思', '托福', 'cet4', 'cet6', 'ielts', 'toefl', '考试', '备考'];
        const skillKeywords = ['听力', '口语', '阅读', '写作', '语法', '词汇', '发音', '翻译'];
        const timeKeywords = ['天', '周', '月', '时间', '计划', '规划', '安排'];
        
        // 检查各类关键词
        [...learningKeywords, ...examKeywords, ...skillKeywords, ...timeKeywords].forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        
        return keywords;
    }

    /**
     * 识别问题类型
     */
    identifyQuestionType(message) {
        if (message.includes('？') || message.includes('?')) return 'question';
        if (message.includes('怎么') || message.includes('如何') || message.includes('how')) return 'how_to';
        if (message.includes('什么') || message.includes('what')) return 'what_is';
        if (message.includes('为什么') || message.includes('why')) return 'why';
        if (message.includes('给我') || message.includes('帮我') || message.includes('想要')) return 'request';
        if (message.includes('可以') || message.includes('能')) return 'capability';
        return 'statement';
    }

    /**
     * 识别上下文
     */
    identifyContext(message) {
        const lowerMessage = message.toLowerCase();
        const contexts = [];
        
        // 考试上下文
        if (lowerMessage.includes('四级') || lowerMessage.includes('cet4')) contexts.push('cet4');
        if (lowerMessage.includes('六级') || lowerMessage.includes('cet6')) contexts.push('cet6');
        if (lowerMessage.includes('雅思') || lowerMessage.includes('ielts')) contexts.push('ielts');
        if (lowerMessage.includes('托福') || lowerMessage.includes('toefl')) contexts.push('toefl');
        
        // 技能上下文
        if (lowerMessage.includes('听力')) contexts.push('listening');
        if (lowerMessage.includes('口语')) contexts.push('speaking');
        if (lowerMessage.includes('阅读')) contexts.push('reading');
        if (lowerMessage.includes('写作')) contexts.push('writing');
        if (lowerMessage.includes('语法')) contexts.push('grammar');
        if (lowerMessage.includes('词汇')) contexts.push('vocabulary');
        
        // 学习阶段上下文
        if (lowerMessage.includes('初学') || lowerMessage.includes('零基础')) contexts.push('beginner');
        if (lowerMessage.includes('基础')) contexts.push('basic');
        if (lowerMessage.includes('进阶') || lowerMessage.includes('提高')) contexts.push('intermediate');
        if (lowerMessage.includes('高级') || lowerMessage.includes('advanced')) contexts.push('advanced');
        
        return contexts;
    }

    /**
     * 提取实体
     */
    extractEntities(message) {
        const entities = {
            timeExpressions: [],
            numbers: [],
            examTypes: [],
            skills: []
        };
        
        // 提取时间表达
        const timeMatches = message.match(/(\d+)\s*(天|周|月|小时|分钟)/g);
        if (timeMatches) entities.timeExpressions = timeMatches;
        
        // 提取数字
        const numberMatches = message.match(/\d+/g);
        if (numberMatches) entities.numbers = numberMatches.map(n => parseInt(n));
        
        return entities;
    }

    /**
     * 分析情感
     */
    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        
        // 积极情感词
        const positiveWords = ['好', '棒', '喜欢', '想要', '希望', '期待', '感谢', '谢谢'];
        // 消极情感词
        const negativeWords = ['难', '困难', '不会', '不懂', '失败', '放弃', '烦恼', '担心'];
        // 中性情感词
        const neutralWords = ['学习', '练习', '考试', '准备', '计划'];
        
        let positiveScore = 0;
        let negativeScore = 0;
        
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) positiveScore++;
        });
        
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) negativeScore++;
        });
        
        if (positiveScore > negativeScore) return 'positive';
        if (negativeScore > positiveScore) return 'negative';
        return 'neutral';
    }

    /**
     * 生成上下文相关回答
     */
    generateContextualResponse(message, analysis) {
        // 根据问题类型和上下文生成回答
        if (analysis.questionType === 'request' && analysis.keywords.includes('规划')) {
            return this.generateStudyPlanResponse(message, analysis);
        }
        
        if (analysis.questionType === 'how_to') {
            return this.generateHowToResponse(message, analysis);
        }
        
        if (analysis.questionType === 'what_is') {
            return this.generateWhatIsResponse(message, analysis);
        }
        
        if (analysis.context.includes('cet4') || analysis.context.includes('cet6')) {
            return this.generateExamResponse(message, analysis);
        }
        
        if (analysis.keywords.some(k => ['听力', '口语', '阅读', '写作', '语法', '词汇'].includes(k))) {
            return this.generateSkillResponse(message, analysis);
        }
        
        // 默认智能回答
        return this.generateIntelligentResponse(message, analysis);
    }

    /**
     * 生成学习规划回答
     */
    generateStudyPlanResponse(message, analysis) {
        let response = "好的！我来为你制定学习规划：\n\n";
        
        // 根据上下文调整回答
        if (analysis.context.includes('cet4')) {
            response += this.generateCET4StudyPlan();
        } else if (analysis.context.includes('cet6')) {
            response += this.generateCET6StudyPlan();
        } else if (analysis.entities.timeExpressions.length > 0) {
            const timeFrame = analysis.entities.timeExpressions[0];
            response += `基于你提到的${timeFrame}时间安排，我为你制定以下计划：\n\n`;
            response += this.generateTimeBasedPlan(timeFrame);
        } else {
            response += this.generateStudyPlan(message);
        }
        
        return response;
    }

    /**
     * 生成"怎么做"类型回答
     */
    generateHowToResponse(message, analysis) {
        const skills = analysis.context.filter(c => ['listening', 'speaking', 'reading', 'writing', 'grammar', 'vocabulary'].includes(c));
        
        if (skills.length > 0) {
            const skill = skills[0];
            return this.generateSkillImprovementGuide(skill, message);
        }
        
        if (analysis.keywords.includes('学习')) {
            return this.generateGeneralLearningGuide(message, analysis);
        }
        
        return `关于"${message}"这个问题，我建议你：\n\n` +
               `1. 先明确具体目标\n` +
               `2. 制定详细计划\n` +
               `3. 循序渐进练习\n` +
               `4. 定期检查进度\n\n` +
               `你能告诉我更具体的情况吗？这样我能给出更精准的建议。`;
    }

    /**
     * 生成"什么是"类型回答
     */
    generateWhatIsResponse(message, analysis) {
        // 提取用户询问的概念
        const concept = this.extractConcept(message);
        
        if (concept) {
            return this.explainConcept(concept, analysis);
        }
        
        return `我理解你想了解某个概念。请告诉我你具体想了解什么，比如：\n\n` +
               `• 语法概念（现在完成时、被动语态等）\n` +
               `• 学习方法（如何背单词、提高听力等）\n` +
               `• 考试相关（四级题型、雅思评分等）\n\n` +
               `这样我就能给你详细的解释！`;
    }

    /**
     * 生成考试相关回答
     */
    generateExamResponse(message, analysis) {
        const examType = analysis.context.find(c => ['cet4', 'cet6', 'ielts', 'toefl'].includes(c));
        
        if (examType === 'cet4') {
            if (analysis.keywords.includes('规划') || analysis.keywords.includes('计划')) {
                return this.generateCET4StudyPlan();
            } else {
                return this.generateCET4GeneralAdvice(message, analysis);
            }
        } else if (examType === 'cet6') {
            if (analysis.keywords.includes('规划') || analysis.keywords.includes('计划')) {
                return this.generateCET6StudyPlan();
            } else {
                return this.generateCET6GeneralAdvice(message, analysis);
            }
        }
        
        return this.generateGeneralExamAdvice(examType, message, analysis);
    }

    /**
     * 生成技能相关回答
     */
    generateSkillResponse(message, analysis) {
        const skills = analysis.keywords.filter(k => ['听力', '口语', '阅读', '写作', '语法', '词汇'].includes(k));
        
        if (skills.length > 0) {
            const skill = skills[0];
            return this.generateSpecificSkillAdvice(skill, message, analysis);
        }
        
        return this.generateGeneralSkillAdvice(message, analysis);
    }

    /**
     * 生成智能回答
     */
    generateIntelligentResponse(message, analysis) {
        let response = "";
        
        // 根据情感调整回答语调
        if (analysis.sentiment === 'negative') {
            response += "我理解你可能遇到了一些困难，别担心，我们一起来解决！\n\n";
        } else if (analysis.sentiment === 'positive') {
            response += "很高兴看到你积极的学习态度！\n\n";
        }
        
        // 根据关键词生成相关建议
        if (analysis.keywords.length > 0) {
            response += `关于你提到的"${analysis.keywords.join('、')}"，我的建议是：\n\n`;
            response += this.generateKeywordBasedAdvice(analysis.keywords, message);
        } else {
            response += "我很乐意帮助你！不过我需要更多信息来给出最好的建议。\n\n";
            response += "你可以告诉我：\n";
            response += "• 你的具体问题或困难\n";
            response += "• 你的学习目标\n";
            response += "• 你目前的英语水平\n\n";
            response += "这样我就能为你提供更精准的指导！";
        }
        
        return response;
    }

    /**
     * 生成基于关键词的建议
     */
    generateKeywordBasedAdvice(keywords, message) {
        let advice = "";
        
        if (keywords.includes('听力')) {
            advice += "📻 **听力提升建议**：\n• 每天听英语材料15-30分钟\n• 从简单对话开始，逐步提高难度\n• 练习记笔记和抓关键信息\n\n";
        }
        
        if (keywords.includes('口语')) {
            advice += "🗣️ **口语提升建议**：\n• 每天大声朗读英语文章\n• 练习日常对话场景\n• 录音对比，纠正发音\n\n";
        }
        
        if (keywords.includes('阅读')) {
            advice += "📖 **阅读提升建议**：\n• 选择适合水平的阅读材料\n• 练习快速浏览和精读技巧\n• 积累生词和短语\n\n";
        }
        
        if (keywords.includes('写作')) {
            advice += "✍️ **写作提升建议**：\n• 掌握基本写作结构\n• 多读优秀范文，学习表达\n• 定期练习不同类型写作\n\n";
        }
        
        if (keywords.includes('词汇')) {
            advice += "📚 **词汇学习建议**：\n• 制定每日背词计划\n• 在语境中学习单词\n• 定期复习巩固记忆\n\n";
        }
        
        if (keywords.includes('语法')) {
            advice += "📝 **语法学习建议**：\n• 系统学习语法规则\n• 通过例句理解用法\n• 多做语法练习题\n\n";
        }
        
        return advice || "根据你的问题，我建议你制定一个系统的学习计划，循序渐进地提高各项技能。";
    }

    /**
     * 生成技能改进指南
     */
    generateSkillImprovementGuide(skill, message) {
        const guides = {
            listening: "🎧 **听力提升完整指南**：\n\n**基础阶段**：\n• 选择语速较慢的材料\n• 重复听同一段内容\n• 边听边跟读\n\n**进阶阶段**：\n• 听新闻、讲座等\n• 练习听写技能\n• 学习预测技巧\n\n**高级阶段**：\n• 听不同口音材料\n• 练习同声传译\n• 培养批判性听力",
            
            speaking: "🗣️ **口语提升完整指南**：\n\n**发音基础**：\n• 学习音标和发音规则\n• 练习单词重音\n• 模仿标准发音\n\n**流利度训练**：\n• 日常话题练习\n• 角色扮演对话\n• 即兴演讲训练\n\n**表达提升**：\n• 学习地道表达\n• 练习不同语域\n• 培养逻辑思维",
            
            reading: "📖 **阅读提升完整指南**：\n\n**基础技能**：\n• 扩大词汇量\n• 掌握基本语法\n• 练习句子理解\n\n**阅读策略**：\n• 学会快速浏览\n• 掌握精读技巧\n• 练习推理判断\n\n**高级技能**：\n• 批判性阅读\n• 文本分析能力\n• 跨文化理解",
            
            writing: "✍️ **写作提升完整指南**：\n\n**基础写作**：\n• 掌握句子结构\n• 学习段落组织\n• 练习基本文体\n\n**进阶写作**：\n• 提高逻辑性\n• 丰富表达方式\n• 学习修辞技巧\n\n**高级写作**：\n• 培养个人风格\n• 掌握学术写作\n• 提高创造力",
            
            grammar: "📝 **语法学习完整指南**：\n\n**基础语法**：\n• 词性和句子成分\n• 基本时态\n• 简单句结构\n\n**中级语法**：\n• 复合句和复杂句\n• 语态和语气\n• 非谓语动词\n\n**高级语法**：\n• 虚拟语气\n• 倒装和强调\n• 语法的语用功能",
            
            vocabulary: "📚 **词汇学习完整指南**：\n\n**词汇积累**：\n• 制定背词计划\n• 使用记忆技巧\n• 定期复习巩固\n\n**词汇运用**：\n• 在语境中学习\n• 练习词汇搭配\n• 掌握词汇变形\n\n**词汇拓展**：\n• 学习词根词缀\n• 了解词汇文化\n• 培养词感"
        };
        
        return guides[skill] || this.generateGeneralSkillAdvice(message, {});
    }

    /**
     * 提取概念
     */
    extractConcept(message) {
        const concepts = {
            '现在完成时': 'present_perfect',
            '过去完成时': 'past_perfect',
            '被动语态': 'passive_voice',
            '虚拟语气': 'subjunctive',
            '定语从句': 'relative_clause',
            '状语从句': 'adverbial_clause'
        };
        
        for (const [chinese, english] of Object.entries(concepts)) {
            if (message.includes(chinese)) {
                return { name: chinese, key: english };
            }
        }
        
        return null;
    }

    /**
     * 解释概念
     */
    explainConcept(concept, analysis) {
        const explanations = {
            present_perfect: "🔍 **现在完成时详解**：\n\n**定义**：表示过去发生的动作对现在造成的影响或结果\n\n**结构**：have/has + 过去分词\n\n**用法**：\n• 表示经历：I have been to Beijing.\n• 表示持续：I have lived here for 5 years.\n• 表示完成：I have finished my homework.\n\n**时间标志**：already, yet, just, ever, never, for, since\n\n**注意事项**：不能与具体的过去时间连用",
            
            passive_voice: "🔍 **被动语态详解**：\n\n**定义**：表示主语是动作的承受者\n\n**结构**：be + 过去分词\n\n**用法场景**：\n• 不知道动作执行者\n• 强调动作承受者\n• 动作执行者不重要\n\n**例句**：\n• The book was written by him.\n• English is spoken worldwide.\n\n**转换方法**：主动句的宾语变主语，谓语动词变被动形式"
        };
        
        return explanations[concept.key] || `关于"${concept.name}"，这是一个重要的语法概念。我建议你通过具体例句来理解它的用法，并多做相关练习来巩固掌握。`;
    }

    /**
     * 分析用户意图
     */
    analyzeIntent(message) {
        const patterns = {
            grammar_question: [
                /语法|grammar|时态|tense|句型|sentence/i,
                /怎么用|how to use|用法|usage/i,
                /现在时|过去时|将来时|present|past|future/i,
                /被动语态|passive voice|主动语态|active voice/i,
                /虚拟语气|subjunctive|条件句|conditional/i
            ],
            vocabulary_question: [
                /单词|word|词汇|vocabulary|什么意思|meaning/i,
                /怎么记|how to remember|记忆|memory/i,
                /同义词|synonym|反义词|antonym/i,
                /词根|root|前缀|prefix|后缀|suffix/i
            ],
            study_advice: [
                /怎么学|how to study|学习方法|study method/i,
                /建议|advice|推荐|recommend/i,
                /提高|improve|练习|practice/i,
                /计划|plan|安排|schedule|规划/i,
                /学习.*规划|学习.*计划|制定.*计划/i
            ],
            encouragement_request: [
                /鼓励|encourage|加油|支持|support/i,
                /困难|difficult|挫折|frustrated/i,
                /放弃|give up|坚持不下去|can't continue/i
            ],
            exam_preparation: [
                /考试|exam|四级|六级|雅思|托福|ielts|toefl/i,
                /准备|prepare|复习|review/i,
                /真题|past paper|模拟|simulation/i
            ],
            specific_question: [
                /^.{1,50}\?$|为什么|why|怎么|how|什么|what/i
            ]
        };

        // 优先匹配具体问题，按优先级排序
        const intentPriority = [
            'study_advice',      // 学习建议优先级最高
            'exam_preparation',  // 考试准备
            'vocabulary_question', // 词汇问题
            'grammar_question',   // 语法问题
            'specific_question',  // 具体问题
            'encouragement_request' // 鼓励请求
        ];

        // 按优先级检查意图
        for (const intent of intentPriority) {
            if (patterns[intent]) {
                for (const pattern of patterns[intent]) {
                    if (pattern.test(message)) {
                        return {
                            type: intent,
                            topic: this.extractTopic(message, intent),
                            confidence: 0.9,
                            originalMessage: message
                        };
                    }
                }
            }
        }

        // 检查剩余的意图
        for (const [intent, patternList] of Object.entries(patterns)) {
            if (!intentPriority.includes(intent)) {
                for (const pattern of patternList) {
                    if (pattern.test(message)) {
                        return {
                            type: intent,
                            topic: this.extractTopic(message, intent),
                            confidence: 0.7,
                            originalMessage: message
                        };
                    }
                }
            }
        }

        return { type: 'general_chat', confidence: 0.3, originalMessage: message };
    }

    /**
     * 提取话题
     */
    extractTopic(message, intent) {
        const topicPatterns = {
            grammar_question: {
                present_simple: /现在时|present.*simple/i,
                past_simple: /过去时|past.*simple/i,
                future_simple: /将来时|future.*simple/i,
                conditionals: /条件句|conditional/i
            },
            vocabulary_question: {
                word: message.match(/单词["""](.+?)["""]|word["""](.+?)["""]/i)?.[1] || 
                      message.match(/(\w+).*什么意思|meaning.*of.*(\w+)/i)?.[1]
            },
            exam_preparation: {
                cet4: /四级|cet.*4/i.test(message) ? 'cet4' : null,
                cet6: /六级|cet.*6/i.test(message) ? 'cet6' : null,
                ielts: /雅思|ielts/i.test(message) ? 'ielts' : null,
                toefl: /托福|toefl/i.test(message) ? 'toefl' : null
            }
        };

        if (topicPatterns[intent]) {
            for (const [topic, pattern] of Object.entries(topicPatterns[intent])) {
                if (pattern && (typeof pattern === 'string' ? pattern : pattern.test(message))) {
                    return topic;
                }
            }
        }

        return null;
    }

    /**
     * 处理语法问题
     */
    handleGrammarQuestion(topic, message) {
        const grammarInfo = this.knowledge_base.grammar.tenses[topic];
        
        if (grammarInfo) {
            return `关于${topic}，${grammarInfo.definition}。\n\n` +
                   `结构：${grammarInfo.structure}\n\n` +
                   `例句：\n${grammarInfo.examples.join('\n')}\n\n` +
                   `常见错误：${grammarInfo.common_mistakes.join('，')}。\n\n` +
                   `你想要更多的练习吗？`;
        }

        return `我理解你想了解语法问题。虽然我没有关于"${topic}"的具体信息，但我可以为你提供一般的语法学习建议。你能更具体地告诉我你想了解哪个语法点吗？`;
    }

    /**
     * 处理词汇问题
     */
    handleVocabularyQuestion(topic, message) {
        // 从消息中提取单词
        const word = this.extractWordFromMessage(message) || topic;
        
        if (!word) {
            return "请告诉我你想了解哪个单词？你可以这样问：\n\n" +
                   "• \"apple是什么意思？\"\n" +
                   "• \"单词beautiful怎么用？\"\n" +
                   "• \"help这个词的用法\"\n\n" +
                   "我会为你详细解释单词的含义、用法和记忆技巧！";
        }
        
        // 尝试从现有词汇数据库获取信息
        const wordInfo = this.getWordFromDatabase(word);
        
        if (wordInfo) {
            return `关于单词"${word}"：\n\n` +
                   `📖 含义：${wordInfo.meaning || wordInfo.translation}\n` +
                   `🔤 词性：${wordInfo.pos || '未知'}\n` +
                   `💡 用法：${wordInfo.usage || wordInfo.example || '建议在句子中学习'}\n` +
                   `🎯 难度：${wordInfo.difficulty || '中等'}\n\n` +
                   `学习建议：\n` +
                   `1. 在句子中理解含义\n` +
                   `2. 制作单词卡片\n` +
                   `3. 多次复习巩固\n` +
                   `4. 尝试在对话中使用\n\n` +
                   `你还想了解其他单词吗？`;
        } else {
            return `我正在查找"${word}"的信息...\n\n` +
                   `虽然我暂时没有找到这个单词的详细信息，但我建议你：\n\n` +
                   `1. 查阅权威词典获取准确含义\n` +
                   `2. 在应用的词汇学习模块中搜索\n` +
                   `3. 通过例句理解用法\n` +
                   `4. 记录到你的学习笔记中\n\n` +
                   `你可以尝试在词汇学习页面搜索这个单词！`;
        }
    }
    
    /**
     * 从消息中提取单词
     */
    extractWordFromMessage(message) {
        // 匹配引号中的单词
        const quotedWord = message.match(/["""']([a-zA-Z]+)["""']/);
        if (quotedWord) return quotedWord[1];
        
        // 匹配"单词xxx"格式
        const wordPattern = message.match(/单词\s*([a-zA-Z]+)/i);
        if (wordPattern) return wordPattern[1];
        
        // 匹配"xxx是什么意思"格式
        const meaningPattern = message.match(/([a-zA-Z]+)\s*是什么意思/i);
        if (meaningPattern) return meaningPattern[1];
        
        // 匹配"xxx怎么用"格式
        const usagePattern = message.match(/([a-zA-Z]+)\s*怎么用/i);
        if (usagePattern) return usagePattern[1];
        
        // 匹配单独的英文单词
        const singleWord = message.match(/\b([a-zA-Z]{2,})\b/);
        if (singleWord) return singleWord[1];
        
        return null;
    }
    
    /**
     * 从词汇数据库获取单词信息
     */
    getWordFromDatabase(word) {
        // 尝试从全局词汇数据库获取
        if (window.vocabularyDatabase) {
            return window.vocabularyDatabase.find(w => 
                w.word.toLowerCase() === word.toLowerCase() ||
                w.translation === word
            );
        }
        
        // 尝试从CET词汇数据获取
        if (window.CET4_WORDS) {
            const found = window.CET4_WORDS.find(w => 
                w.word.toLowerCase() === word.toLowerCase()
            );
            if (found) return found;
        }
        
        if (window.CET6_WORDS) {
            const found = window.CET6_WORDS.find(w => 
                w.word.toLowerCase() === word.toLowerCase()
            );
            if (found) return found;
        }
        
        return null;
    }

    /**
     * 处理学习建议
     */
    handleStudyAdvice(skill, message) {
        const lowerMessage = message.toLowerCase();
        
        // 检查是否是学习规划请求
        if (lowerMessage.includes('规划') || lowerMessage.includes('计划')) {
            return this.generateStudyPlan(message);
        }
        
        // 检查是否是四级相关
        if (lowerMessage.includes('四级') || lowerMessage.includes('cet4')) {
            return this.generateCET4StudyPlan();
        }
        
        // 检查是否是六级相关
        if (lowerMessage.includes('六级') || lowerMessage.includes('cet6')) {
            return this.generateCET6StudyPlan();
        }
        
        // 一般学习建议
        const advice = this.knowledge_base.study_tips[skill] || this.knowledge_base.study_tips.reading;
        
        return `关于${skill || '英语学习'}，我建议你：\n\n` +
               advice.map((tip, index) => `${index + 1}. ${tip}`).join('\n') +
               `\n\n记住，坚持练习是最重要的！你想要针对哪个方面的具体建议吗？`;
    }

    /**
     * 生成学习计划
     */
    generateStudyPlan(message) {
        return `好的！我来为你制定一个个性化的学习规划：\n\n` +
               `📋 **学习规划建议**\n\n` +
               `**第一阶段：基础巩固（1-2周）**\n` +
               `• 每天30分钟词汇学习\n` +
               `• 复习基础语法知识\n` +
               `• 简单阅读练习\n\n` +
               `**第二阶段：技能提升（3-4周）**\n` +
               `• 增加听力练习时间\n` +
               `• 开始写作训练\n` +
               `• 口语表达练习\n\n` +
               `**第三阶段：综合应用（持续）**\n` +
               `• 模拟考试练习\n` +
               `• 错题分析总结\n` +
               `• 实际应用练习\n\n` +
               `你想要针对哪个具体考试制定更详细的计划吗？`;
    }

    /**
     * 生成四级学习计划
     */
    generateCET4StudyPlan() {
        return `🎯 **英语四级学习规划**\n\n` +
               `**词汇部分（每天30分钟）**\n` +
               `• 掌握4000核心词汇\n` +
               `• 使用词汇书或APP背单词\n` +
               `• 每天复习前一天的单词\n\n` +
               `**听力部分（每天20分钟）**\n` +
               `• 练习短对话和长对话\n` +
               `• 听写训练提高准确性\n` +
               `• 熟悉常见话题和场景\n\n` +
               `**阅读部分（每天25分钟）**\n` +
               `• 练习快速阅读技巧\n` +
               `• 掌握关键词定位方法\n` +
               `• 多做真题练习\n\n` +
               `**写作部分（每周3次）**\n` +
               `• 掌握基本写作模板\n` +
               `• 练习不同类型作文\n` +
               `• 注意语法和拼写\n\n` +
               `**翻译部分（每周2次）**\n` +
               `• 练习中英文转换\n` +
               `• 掌握常用表达方式\n\n` +
               `建议学习周期：3-4个月，你觉得这个计划怎么样？`;
    }

    /**
     * 生成六级学习计划
     */
    generateCET6StudyPlan() {
        return `🎯 **英语六级学习规划**\n\n` +
               `**词汇部分（每天40分钟）**\n` +
               `• 掌握6000+核心词汇\n` +
               `• 重点学习高频词汇\n` +
               `• 词汇在语境中的应用\n\n` +
               `**听力部分（每天30分钟）**\n` +
               `• 练习学术讲座听力\n` +
               `• 提高长篇听力理解\n` +
               `• 训练笔记记录技巧\n\n` +
               `**阅读部分（每天35分钟）**\n` +
               `• 练习深度阅读理解\n` +
               `• 掌握推理判断技巧\n` +
               `• 提高阅读速度和准确性\n\n` +
               `**写作部分（每周4次）**\n` +
               `• 练习议论文写作\n` +
               `• 提高逻辑思维能力\n` +
               `• 丰富词汇和句式\n\n` +
               `**翻译部分（每周3次）**\n` +
               `• 练习段落翻译\n` +
               `• 掌握文化背景知识\n\n` +
               `建议学习周期：4-6个月，需要更详细的每日计划吗？`;
    }

    /**
     * 处理鼓励请求
     */
    handleEncouragementRequest(message) {
        const encouragements = this.personality_traits[this.personality].encouragement;
        // 基于时间选择鼓励语
        const timeIndex = new Date().getHours() % encouragements.length;
        const randomEncouragement = encouragements[timeIndex];
        
        return `${randomEncouragement} 学习英语确实不容易，但你已经在正确的道路上了。每一次练习都是进步，每一个错误都是学习的机会。\n\n` +
               `记住：\n` +
               `• 进步需要时间，要有耐心\n` +
               `• 错误是学习过程的一部分\n` +
               `• 坚持练习，你会看到改变\n` +
               `• 相信自己的能力\n\n` +
               `你已经做得很好了！继续加油！💪`;
    }

    /**
     * 处理考试准备
     */
    handleExamPreparation(exam, message) {
        const examStrategies = this.knowledge_base.exam_strategies[exam];
        
        if (examStrategies) {
            return `关于${exam.toUpperCase()}考试准备，我为你总结了重点策略：\n\n` +
                   Object.entries(examStrategies).map(([skill, strategy]) => 
                       `📚 ${skill.toUpperCase()}: ${strategy}`
                   ).join('\n\n') +
                   `\n\n需要我为你制定详细的复习计划吗？`;
        }

        return `考试准备很重要！无论准备哪种考试，我建议你：\n\n` +
               `1. 了解考试格式和要求\n` +
               `2. 制定合理的复习计划\n` +
               `3. 多做真题练习\n` +
               `4. 找出薄弱环节重点突破\n` +
               `5. 保持良好的心态\n\n` +
               `你准备哪种考试？我可以给你更具体的建议。`;
    }

    /**
     * 处理具体问题
     */
    handleSpecificQuestion(message) {
        // 尝试从问题中提取关键词并给出针对性回答
        const lowerMessage = message.toLowerCase();
        
        // 检查是否包含具体的英语概念
        if (lowerMessage.includes('a') && lowerMessage.includes('an') && lowerMessage.includes('the')) {
            return "关于冠词的使用：\n\n" +
                   "• **a/an** 用于可数名词单数，表示泛指\n" +
                   "  - a 用于辅音音素开头的词前\n" +
                   "  - an 用于元音音素开头的词前\n\n" +
                   "• **the** 用于特指，表示双方都知道的事物\n\n" +
                   "例如：\n" +
                   "- I saw **a** cat. (泛指一只猫)\n" +
                   "- **The** cat is sleeping. (特指那只猫)\n\n" +
                   "你想了解更多冠词的用法吗？";
        }
        
        // 如果问题很短且包含疑问词，尝试给出相关回答
        if (lowerMessage.length < 20) {
            if (lowerMessage.includes('为什么') || lowerMessage.includes('why')) {
                return "这是一个很好的问题！请告诉我你想了解的具体内容，我会详细解释原因。比如：\n\n" +
                       "• 为什么要学英语语法？\n" +
                       "• 为什么单词这么难记？\n" +
                       "• 为什么听力总是听不懂？\n\n" +
                       "请具体说明你的疑问，我会给出针对性的解答。";
            }
            
            if (lowerMessage.includes('怎么') || lowerMessage.includes('how')) {
                return "我很乐意帮你解决这个问题！请告诉我你想了解的具体方法，比如：\n\n" +
                       "• 怎么提高英语口语？\n" +
                       "• 怎么记住单词？\n" +
                       "• 怎么准备考试？\n\n" +
                       "请详细描述你的需求，我会提供具体的学习方法和建议。";
            }
        }
        
        // 默认回复
        return "我注意到你提出了一个具体的问题。为了给你最准确的回答，请告诉我：\n\n" +
               "• 你想了解哪个具体的英语知识点？\n" +
               "• 你在学习中遇到了什么困难？\n" +
               "• 你希望我重点解释哪个方面？\n\n" +
               "这样我就能为你提供更有针对性的帮助！";
    }

    /**
     * 处理一般聊天
     */
    handleGeneralChat(message) {
        const lowerMessage = message.toLowerCase();
        
        // 检查是否是问候语
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('你好')) {
            return `Hello! 很高兴见到你！🎉\n\n我是你的AI英语学习伙伴，我可以帮助你：\n\n` +
                   `📚 **学习指导**\n` +
                   `• 制定个性化学习计划\n` +
                   `• 解答语法和词汇问题\n` +
                   `• 提供学习方法建议\n\n` +
                   `🎯 **考试准备**\n` +
                   `• 四六级考试规划\n` +
                   `• 雅思托福指导\n` +
                   `• 真题练习建议\n\n` +
                   `💪 **技能提升**\n` +
                   `• 听说读写全面提升\n` +
                   `• 发音和口语练习\n` +
                   `• 写作技巧指导\n\n` +
                   `你想从哪个方面开始呢？`;
        }
        
        // 检查是否询问能力
        if (lowerMessage.includes('能做什么') || lowerMessage.includes('什么功能') || lowerMessage.includes('帮助')) {
            return `我可以为你提供全方位的英语学习支持：\n\n` +
                   `🎓 **学习规划**：根据你的水平和目标制定学习计划\n` +
                   `📖 **知识解答**：解释语法规则、词汇用法、句型结构\n` +
                   `💡 **学习建议**：提供高效的学习方法和技巧\n` +
                   `🎯 **考试指导**：针对各类英语考试的备考策略\n` +
                   `💪 **技能训练**：听说读写各项技能的提升方法\n` +
                   `🔍 **问题诊断**：分析学习中遇到的困难并提供解决方案\n\n` +
                   `你可以直接问我任何英语学习相关的问题！`;
        }
        
        // 默认回复
        const responses = [
            "很高兴和你聊天！有什么英语学习方面的问题我可以帮你吗？",
            "我是来帮助你学习英语的！你想聊聊你的学习目标吗？",
            "作为你的AI导师，我很乐意帮助你提高英语水平。有什么具体问题吗？",
            "学习英语是一个很棒的选择！让我知道我能如何帮助你。"
        ];

        // 基于当前分钟数选择回复
        const index = new Date().getMinutes() % responses.length;
        return responses[index];
    }

    /**
     * 处理未知意图
     */
    handleUnknownIntent(message) {
        return "我理解你的问题，但可能需要更多信息才能给出最好的答案。你能具体说说你想了解什么吗？\n\n" +
               "我可以帮你：\n" +
               "• 解释语法概念\n" +
               "• 学习词汇\n" +
               "• 提供学习建议\n" +
               "• 考试准备指导\n" +
               "• 学习鼓励和支持";
    }

    /**
     * 个性化回复
     */
    personalizeResponse(response) {
        // 根据个性特征调整回复风格
        const traits = this.personality_traits[this.personality];
        
        // 添加个性化的结尾
        const endings = {
            friendly: ["😊", "希望对你有帮助！", "有其他问题随时问我！"],
            strict: ["记住要多练习。", "基础很重要。", "不要偷懒。"],
            encouraging: ["你一定可以的！", "加油！💪", "相信自己！"],
            humorous: ["😄", "学习愉快！", "大脑升级中..."]
        };

        const personalEndings = endings[this.personality] || endings.friendly;
        // 基于回复内容长度选择结尾
        const index = response.length % personalEndings.length;
        const randomEnding = personalEndings[index];

        return response + "\n\n" + randomEnding;
    }

    /**
     * 处理快速操作
     */
    handleQuickAction(action) {
        const actions = {
            explain: "我可以解释任何英语概念！比如语法规则、单词用法、句型结构等。你想了解什么？",
            practice: "练习建议来了！根据你的水平，我推荐：\n\n• 每天15-30分钟集中练习\n• 选择一个薄弱技能重点突破\n• 结合听说读写全面发展\n• 定期测试检查进步\n\n你想重点练习哪个技能？",
            feedback: "让我看看你的学习情况...\n\n基于你最近的表现，我注意到：\n• 学习很积极，保持下去！\n• 可以尝试更多样化的练习\n• 建议增加口语练习时间\n\n需要具体的改进建议吗？",
            plan: "让我为你制定学习计划！\n\n请告诉我：\n• 你的当前水平？\n• 学习目标是什么？\n• 每天可以学习多长时间？\n• 有特定的考试目标吗？\n\n这样我就能为你定制最合适的计划！"
        };

        this.addMessage(actions[action], 'tutor');
    }

    /**
     * 显示输入建议
     */
    showInputSuggestions(inputValue) {
        const suggestionsContainer = document.getElementById('inputSuggestions');
        if (!suggestionsContainer) return;

        if (inputValue.length < 2) {
            suggestionsContainer.innerHTML = '';
            return;
        }

        const suggestions = this.generateInputSuggestions(inputValue);
        suggestionsContainer.innerHTML = suggestions.map(suggestion => 
            `<span class="suggestion-chip" onclick="document.getElementById('tutorInput').value='${suggestion}'">${suggestion}</span>`
        ).join('');
    }

    /**
     * 生成输入建议
     */
    generateInputSuggestions(input) {
        const commonQuestions = [
            "什么是现在完成时？",
            "怎么提高英语口语？",
            "四级考试怎么准备？",
            "如何记住单词？",
            "语法错误怎么避免？",
            "听力练习有什么技巧？",
            "写作如何提高？",
            "发音怎么练习？"
        ];

        return commonQuestions.filter(q => 
            q.toLowerCase().includes(input.toLowerCase())
        ).slice(0, 3);
    }

    /**
     * 切换设置面板
     */
    toggleSettings() {
        const settingsPanel = document.getElementById('tutorSettingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('hidden');
        }
    }

    /**
     * 最小化导师
     */
    minimizeTutor() {
        const container = document.getElementById('ai-tutor-container');
        if (container) {
            container.style.transform = 'translateY(calc(100% - 60px))';
            container.style.height = '60px';
            
            // 添加展开按钮
            setTimeout(() => {
                if (!document.getElementById('expandTutor')) {
                    const expandBtn = document.createElement('button');
                    expandBtn.id = 'expandTutor';
                    expandBtn.innerHTML = '🤖 AI导师';
                    expandBtn.style.cssText = `
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 20px;
                        cursor: pointer;
                        font-size: 0.9rem;
                    `;
                    expandBtn.onclick = () => {
                        container.style.transform = 'translateY(0)';
                        container.style.height = 'auto';
                        expandBtn.remove();
                    };
                    container.appendChild(expandBtn);
                }
            }, 300);
        }
    }

    /**
     * 更新学生档案
     */
    updateStudentProfile(profileData) {
        this.student_profile = {
            ...this.student_profile,
            ...profileData,
            lastUpdated: Date.now()
        };

        // 根据新档案调整教学策略
        this.adaptTeachingStrategy();
    }

    /**
     * 适应教学策略
     */
    adaptTeachingStrategy() {
        if (!this.student_profile) return;

        const level = this.student_profile.level || 'intermediate';
        const learningStyle = this.student_profile.learningStyle || 'visual';

        // 应用相应的教学策略
        const strategy = this.teaching_strategies[level];
        const styleStrategy = this.teaching_strategies[learningStyle + '_learner'];

        console.log(`📚 教学策略已调整为: ${level} + ${learningStyle}`);
    }

    /**
     * 获取学习统计
     */
    getStudyStats() {
        return {
            totalConversations: this.conversation_history.length,
            topicsDiscussed: this.getUniqueTopics(),
            averageResponseTime: this.calculateAverageResponseTime(),
            studentEngagement: this.calculateEngagement(),
            lastActiveTime: Date.now()
        };
    }

    /**
     * 测试AI导师功能
     */
    testTutorFunction() {
        const chatPreview = document.getElementById('tutorChatPreview');
        if (chatPreview) {
            this.addInlineMessage('测试消息：AI导师功能正常！', 'tutor', chatPreview);
            return true;
        }
        return false;
    }

    /**
     * 销毁AI导师
     */
    destroy() {
        const container = document.getElementById('ai-tutor-container');
        if (container) {
            container.remove();
        }
        if (window.logger) {
            window.logger.info('AITutor', '🤖 AI导师已销毁');
        }
    }
}

// 创建全局实例
window.AITutor = new AITutor();
