/**
 * 写作练习管理器
 * 负责处理英语写作练习的所有功能
 */
class WritingManager {
    constructor() {
        this.currentWriting = null;
        this.writingSession = null;
        this.startTime = null;
        this.timer = null;
        this.autosaveTimer = null;
        this.draftKey = 'writing_draft_current';
        this.lastAutosaveAt = 0;
        this.autosaveIntervalMs = 3000; // 3秒自动保存一次
        
        // 配置选项
        this.config = {
            writingType: 'essay',
            difficulty: 'intermediate',
            examType: 'ielts',
            wordLimit: 250
        };
        
        // 用户写作数据
        this.writingProgress = {
            totalWritings: 0,
            totalWords: 0,
            averageScore: 0,
            totalTime: 0,
            typeStats: {
                essay: { completed: 0, averageScore: 0, totalWords: 0 },
                letter: { completed: 0, averageScore: 0, totalWords: 0 },
                report: { completed: 0, averageScore: 0, totalWords: 0 },
                email: { completed: 0, averageScore: 0, totalWords: 0 }
            },
            recentWritings: []
        };
        
        this.init();
    }

    /**
     * 初始化写作管理器
     */
    init() {
        this.loadWritingProgress();
        this.initializeTopicsDatabase();
        this.tryRestoreDraft();
        this.setupEventListeners();
        console.log('✍️ 写作练习管理器已初始化');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 页面关闭前保存草稿
        window.addEventListener('beforeunload', () => {
            this.saveDraft();
        });
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.writingSession) {
                this.saveDraft();
            }
        });
    }

    /**
     * 保存写作草稿
     */
    saveDraft(content = null) {
        try {
            if (!this.writingSession) return;
            
            // 获取当前内容
            const textarea = document.getElementById('writingContent');
            const currentContent = content || (textarea ? textarea.value : '');
            
            if (!currentContent.trim()) return;
            
            const draft = {
                sessionId: this.writingSession.id,
                topic: this.currentWriting,
                content: currentContent,
                wordCount: this.countWords(currentContent),
                timeSpent: Date.now() - this.writingSession.startTime,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.draftKey, JSON.stringify(draft));
            this.lastAutosaveAt = Date.now();
            
            // 显示保存提示（可选）
            if (content === null) { // 只在自动保存时显示
                this.showSaveIndicator();
            }
        } catch (error) {
            console.warn('保存草稿失败:', error);
        }
    }

    /**
     * 尝试恢复草稿
     */
    tryRestoreDraft() {
        try {
            const draftData = localStorage.getItem(this.draftKey);
            if (!draftData) return false;
            
            const draft = JSON.parse(draftData);
            const now = Date.now();
            
            // 检查草稿是否过期（24小时）
            if (now - draft.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem(this.draftKey);
                return false;
            }
            
            // 通知用户有未完成的草稿
            if (draft.content && draft.content.trim()) {
                this.showDraftRestorePrompt(draft);
                return true;
            }
        } catch (error) {
            console.warn('恢复草稿失败:', error);
            localStorage.removeItem(this.draftKey);
        }
        return false;
    }

    /**
     * 显示草稿恢复提示
     */
    showDraftRestorePrompt(draft) {
        const wordCount = draft.wordCount || 0;
        const timeSpent = Math.round((draft.timeSpent || 0) / 60000); // 转换为分钟
        
        const message = `检测到未完成的写作草稿：\n题目：${draft.topic?.title || '未知题目'}\n字数：${wordCount} 字\n用时：${timeSpent} 分钟\n\n是否恢复继续写作？`;
        
        if (confirm(message)) {
            this.restoreDraft(draft);
        } else {
            localStorage.removeItem(this.draftKey);
        }
    }

    /**
     * 恢复草稿
     */
    restoreDraft(draft) {
        try {
            this.currentWriting = draft.topic;
            this.writingSession = {
                id: draft.sessionId,
                topic: draft.topic,
                startTime: Date.now() - (draft.timeSpent || 0),
                content: draft.content,
                wordCount: draft.wordCount || 0,
                completed: false
            };
            
            // 恢复到写作界面
            if (window.app && typeof window.app.showPage === 'function') {
                window.app.showPage('writing');
            }
            
            // 恢复内容到文本框
            setTimeout(() => {
                const textarea = document.getElementById('writingContent');
                if (textarea) {
                    textarea.value = draft.content;
                    // 触发字数统计更新
                    this.updateWordCount();
                }
                
                // 启动计时器
                this.startTimer();
                this.startAutosave();
                
                this.showNotification('草稿已恢复，继续写作吧！', 'success');
            }, 100);
            
        } catch (error) {
            console.error('恢复草稿失败:', error);
            this.showNotification('恢复草稿失败', 'error');
        }
    }

    /**
     * 开始自动保存
     */
    startAutosave() {
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer);
        }
        
        this.autosaveTimer = setInterval(() => {
            if (this.writingSession && !this.writingSession.completed) {
                this.saveDraft();
            }
        }, this.autosaveIntervalMs);
    }

    /**
     * 停止自动保存
     */
    stopAutosave() {
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer);
            this.autosaveTimer = null;
        }
    }

    /**
     * 显示保存指示器
     */
    showSaveIndicator() {
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.textContent = '草稿已保存';
            indicator.style.opacity = '1';
            setTimeout(() => {
                indicator.style.opacity = '0';
            }, 2000);
        }
    }

    /**
     * 显示通知消息
     */
    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * 更新字数统计
     */
    updateWordCount() {
        const textarea = document.getElementById('writingContent');
        if (textarea && this.writingSession) {
            const content = textarea.value;
            const wordCount = this.countWords(content);
            this.writingSession.wordCount = wordCount;
            
            // 更新UI显示
            const wordCountEl = document.getElementById('wordCount');
            if (wordCountEl) {
                wordCountEl.textContent = wordCount;
            }
            
            // 检查字数限制
            const limit = this.currentWriting?.wordLimit || this.config.wordLimit;
            if (limit && wordCount > limit * 1.2) { // 超出20%给警告
                this.showNotification(`字数已超出建议范围 (${wordCount}/${limit})`, 'warning');
            }
        }
    }

    /**
     * 清除草稿
     */
    clearDraft() {
        try {
            localStorage.removeItem(this.draftKey);
            this.stopAutosave();
        } catch (error) {
            console.warn('清除草稿失败:', error);
        }
    }

    /**
     * 初始化写作题目数据库
     */
    initializeTopicsDatabase() {
        this.topicsDatabase = {
            essay: {
                beginner: [
                    {
                        id: 'essay_beg_001',
                        type: 'opinion',
                        title: '我最喜欢的季节',
                        prompt: '每个人都有自己最喜欢的季节。请写一篇短文，介绍你最喜欢的季节，并说明喜欢的原因。',
                        requirements: [
                            '写作字数：不少于150字',
                            '使用简单清晰的语言',
                            '给出具体的理由',
                            '结构简单明了'
                        ],
                        keywords: ['季节', '喜好', '原因', '天气', '活动'],
                        difficulty: 'beginner',
                        timeLimit: 30,
                        wordLimit: 150,
                        examType: 'general'
                    },
                    {
                        id: 'essay_beg_002',
                        type: 'descriptive',
                        title: '我的家乡',
                        prompt: '请描述你的家乡，包括它的地理位置、气候特点、著名景点或特色文化。',
                        requirements: [
                            '写作字数：不少于160字',
                            '描述具体生动',
                            '包含地理和文化信息',
                            '使用基础词汇和句型'
                        ],
                        keywords: ['家乡', '地理位置', '气候', '景点', '文化'],
                        difficulty: 'beginner',
                        timeLimit: 35,
                        wordLimit: 160,
                        examType: 'general'
                    },
                    {
                        id: 'essay_beg_003',
                        type: 'narrative',
                        title: '难忘的一天',
                        prompt: '请写一篇短文，描述你生活中难忘的一天，说明这一天发生了什么，为什么让你印象深刻。',
                        requirements: [
                            '写作字数：不少于140字',
                            '按时间顺序叙述',
                            '表达真实感受',
                            '语言简单易懂'
                        ],
                        keywords: ['难忘', '经历', '感受', '回忆', '故事'],
                        difficulty: 'beginner',
                        timeLimit: 30,
                        wordLimit: 140,
                        examType: 'general'
                    }
                ],
                intermediate: [
                    {
                        id: 'essay_int_001',
                        type: 'argumentative',
                        title: '在线学习的优缺点',
                        prompt: '近年来，在线学习变得越来越流行。一些人认为在线学习是未来教育的趋势，而另一些人则认为传统课堂教学更有效。请讨论在线学习的优缺点，并给出你的观点。',
                        requirements: [
                            '写作字数：不少于250字',
                            '清楚表达观点并提供支持论据',
                            '结构清晰，逻辑连贯',
                            '使用适当的词汇和语法'
                        ],
                        keywords: ['在线学习', '传统教育', '优势', '劣势', '技术', '互动'],
                        difficulty: 'intermediate',
                        timeLimit: 40, // 分钟
                        wordLimit: 250,
                        examType: 'ielts'
                    },
                    {
                        id: 'essay_int_002',
                        type: 'opinion',
                        title: '社交媒体对年轻人的影响',
                        prompt: '社交媒体已成为现代生活的重要组成部分，特别是对年轻人而言。请论述社交媒体对年轻人生活的积极和消极影响，并表达你的看法。',
                        requirements: [
                            '写作字数：不少于250字',
                            '分析积极和消极影响',
                            '提供具体例子和论据',
                            '给出平衡的观点'
                        ],
                        keywords: ['社交媒体', '年轻人', '影响', '沟通', '心理健康', '信息传播'],
                        difficulty: 'intermediate',
                        timeLimit: 40,
                        wordLimit: 250,
                        examType: 'ielts'
                    },
                    {
                        id: 'essay_int_003',
                        type: 'problem_solution',
                        title: '城市交通拥堵问题',
                        prompt: '许多大城市都面临交通拥堵的严重问题，这不仅影响人们的日常生活，还对环境造成负面影响。请分析造成交通拥堵的主要原因，并提出可行的解决方案。',
                        requirements: [
                            '写作字数：不少于250字',
                            '分析问题的主要原因',
                            '提出切实可行的解决方案',
                            '逻辑清晰，论述充分'
                        ],
                        keywords: ['交通拥堵', '城市化', '公共交通', '环境污染', '解决方案'],
                        difficulty: 'intermediate',
                        timeLimit: 40,
                        wordLimit: 250,
                        examType: 'ielts'
                    }
                ],
                advanced: [
                    {
                        id: 'essay_adv_001',
                        type: 'argumentative',
                        title: '人工智能对就业市场的影响',
                        prompt: '随着人工智能技术的快速发展，许多人担心AI会取代人类的工作岗位，而另一些人认为AI会创造新的就业机会。请深入分析人工智能对就业市场的影响，并论述我们应该如何应对这一挑战。',
                        requirements: [
                            '写作字数：不少于300字',
                            '深入分析AI对就业的多方面影响',
                            '提出应对策略和建议',
                            '使用高级词汇和复杂句式',
                            '论证严密，逻辑性强'
                        ],
                        keywords: ['人工智能', '就业市场', '自动化', '技能转型', '未来工作', '教育培训'],
                        difficulty: 'advanced',
                        timeLimit: 45,
                        wordLimit: 300,
                        examType: 'ielts'
                    },
                    {
                        id: 'essay_adv_002',
                        type: 'argumentative',
                        title: '全球化对文化多样性的影响',
                        prompt: '全球化进程在促进世界经济发展的同时，也对各国的传统文化产生了深远影响。有人认为全球化导致文化同质化，威胁文化多样性；而另一些人认为全球化促进了文化交流与融合。请就全球化对文化多样性的影响进行深入分析。',
                        requirements: [
                            '写作字数：不少于320字',
                            '分析全球化的积极和消极影响',
                            '提供具体例子支持论点',
                            '展现批判性思维',
                            '结论部分提出平衡观点'
                        ],
                        keywords: ['全球化', '文化多样性', '文化交流', '传统文化', '现代化', '文化保护'],
                        difficulty: 'advanced',
                        timeLimit: 50,
                        wordLimit: 320,
                        examType: 'ielts'
                    },
                    {
                        id: 'essay_adv_003',
                        type: 'problem_solution',
                        title: '气候变化的解决方案',
                        prompt: '气候变化已成为21世纪最严峻的全球性挑战之一。请分析气候变化产生的主要原因，评估其对人类社会和自然环境的影响，并提出切实可行的解决方案。',
                        requirements: [
                            '写作字数：不少于350字',
                            '系统分析问题的根本原因',
                            '评估多层面的影响',
                            '提出创新性解决方案',
                            '考虑方案的可行性和有效性'
                        ],
                        keywords: ['气候变化', '温室气体', '可持续发展', '新能源', '环境保护', '国际合作'],
                        difficulty: 'advanced',
                        timeLimit: 50,
                        wordLimit: 350,
                        examType: 'ielts'
                    },
                    {
                        id: 'essay_adv_004',
                        type: 'opinion',
                        title: '远程工作的未来发展',
                        prompt: '新冠疫情加速了远程工作模式的普及。请分析远程工作模式的优势和挑战，并预测其在后疫情时代的发展趋势。你认为远程工作会成为未来工作的主流模式吗？',
                        requirements: [
                            '写作字数：不少于300字',
                            '全面分析远程工作的利弊',
                            '结合实际案例和数据',
                            '提出有说服力的个人观点',
                            '预测未来发展趋势'
                        ],
                        keywords: ['远程工作', '工作效率', '工作生活平衡', '数字化转型', '企业管理', '未来趋势'],
                        difficulty: 'advanced',
                        timeLimit: 45,
                        wordLimit: 300,
                        examType: 'ielts'
                    }
                ]
            },
            letter: {
                beginner: [
                    {
                        id: 'letter_beg_001',
                        type: 'informal',
                        title: '给朋友的信：假期计划',
                        prompt: '你的朋友询问你的假期计划。请写一封非正式的信，告诉他/她你的假期安排和想做的事情。',
                        requirements: [
                            '写作字数：不少于120字',
                            '使用友好的语调',
                            '描述具体的计划',
                            '表达期待心情'
                        ],
                        keywords: ['假期计划', '朋友', '活动安排', '期待', '分享'],
                        difficulty: 'beginner',
                        timeLimit: 20,
                        wordLimit: 120,
                        examType: 'general'
                    },
                    {
                        id: 'letter_beg_002',
                        type: 'informal',
                        title: '感谢信：帮助感谢',
                        prompt: '你的朋友最近帮助了你。请写一封感谢信，表达你的感激之情，并说明他/她是如何帮助你的。',
                        requirements: [
                            '写作字数：不少于100字',
                            '真诚表达感谢',
                            '具体说明帮助内容',
                            '语言简单温暖'
                        ],
                        keywords: ['感谢', '帮助', '友谊', '感激', '支持'],
                        difficulty: 'beginner',
                        timeLimit: 18,
                        wordLimit: 100,
                        examType: 'general'
                    }
                ],
                intermediate: [
                    {
                        id: 'letter_int_001',
                        type: 'formal',
                        title: '投诉信：在线购物问题',
                        prompt: '你在某在线商城购买了一台笔记本电脑，但收到的商品存在质量问题。请写一封投诉信给客服部门，说明问题并要求解决。',
                        requirements: [
                            '写作字数：不少于150字',
                            '使用正式的书信格式',
                            '清楚描述问题',
                            '提出合理的解决要求',
                            '语调礼貌但坚定'
                        ],
                        keywords: ['投诉', '产品质量', '退换货', '客服', '解决方案'],
                        difficulty: 'intermediate',
                        timeLimit: 20,
                        wordLimit: 150,
                        examType: 'ielts'
                    },
                    {
                        id: 'letter_int_002',
                        type: 'informal',
                        title: '邀请信：生日聚会',
                        prompt: '你将举办生日聚会，想邀请你的外国朋友参加。请写一封非正式的邀请信，包含聚会的详细信息。',
                        requirements: [
                            '写作字数：不少于150字',
                            '使用友好、轻松的语调',
                            '包含时间、地点、活动安排',
                            '表达期待朋友参加的心情'
                        ],
                        keywords: ['生日聚会', '邀请', '朋友', '庆祝', '活动安排'],
                        difficulty: 'intermediate',
                        timeLimit: 20,
                        wordLimit: 150,
                        examType: 'ielts'
                    },
                    {
                        id: 'letter_int_003',
                        type: 'formal',
                        title: '申请信：奖学金申请',
                        prompt: '你想申请某大学的奖学金项目。请写一封正式的申请信，说明你的学术背景、申请理由和未来计划。',
                        requirements: [
                            '写作字数：不少于180字',
                            '使用正式的书信格式和语言',
                            '突出个人优势和成就',
                            '说明申请动机和未来规划',
                            '语调专业且有说服力'
                        ],
                        keywords: ['奖学金申请', '学术背景', '个人成就', '未来规划', '申请理由'],
                        difficulty: 'intermediate',
                        timeLimit: 25,
                        wordLimit: 180,
                        examType: 'ielts'
                    },
                    {
                        id: 'letter_int_004',
                        type: 'informal',
                        title: '建议信：旅行建议',
                        prompt: '你的朋友计划来你所在的城市旅游，向你询问旅行建议。请写一封信给他/她，推荐一些值得游览的地方和注意事项。',
                        requirements: [
                            '写作字数：不少于160字',
                            '推荐具体的景点和活动',
                            '提供实用的旅行建议',
                            '使用友好、热情的语调',
                            '结构清晰，信息完整'
                        ],
                        keywords: ['旅行建议', '景点推荐', '旅游攻略', '注意事项', '城市介绍'],
                        difficulty: 'intermediate',
                        timeLimit: 22,
                        wordLimit: 160,
                        examType: 'ielts'
                    }
                ],
                advanced: [
                    {
                        id: 'letter_adv_001',
                        type: 'formal',
                        title: '求职信：跨国公司职位申请',
                        prompt: '你看到一家跨国公司招聘项目经理的职位广告，该职位要求有相关经验和语言能力。请写一封求职信，展示你的资格和适合该职位的理由。',
                        requirements: [
                            '写作字数：不少于220字',
                            '展现专业的商务写作技能',
                            '突出相关工作经验和技能',
                            '体现对公司和职位的了解',
                            '使用高级词汇和复杂句式',
                            '结构严谨，逻辑清晰'
                        ],
                        keywords: ['求职信', '项目经理', '工作经验', '专业技能', '跨国公司', '职业发展'],
                        difficulty: 'advanced',
                        timeLimit: 30,
                        wordLimit: 220,
                        examType: 'ielts'
                    },
                    {
                        id: 'letter_adv_002',
                        type: 'formal',
                        title: '建议信：政策建议',
                        prompt: '作为一名关心环境保护的公民，你想向当地政府提出关于减少城市污染的建议。请写一封正式的建议信。',
                        requirements: [
                            '写作字数：不少于250字',
                            '分析当前环境问题',
                            '提出具体可行的建议',
                            '使用正式、礼貌的语调',
                            '论证充分，有说服力',
                            '体现公民责任感'
                        ],
                        keywords: ['环境保护', '政策建议', '城市污染', '可持续发展', '公民参与', '政府政策'],
                        difficulty: 'advanced',
                        timeLimit: 35,
                        wordLimit: 250,
                        examType: 'ielts'
                    }
                ]
            },
            report: {
                beginner: [
                    {
                        id: 'report_beg_001',
                        type: 'simple',
                        title: '班级活动总结',
                        prompt: '请写一份关于上个月班级组织的郊游活动的简单总结报告，包括活动内容、参与人数和大家的反馈。',
                        requirements: [
                            '写作字数：不少于120字',
                            '使用简单的报告格式',
                            '包含基本信息',
                            '语言清晰简洁'
                        ],
                        keywords: ['活动总结', '班级郊游', '参与情况', '反馈', '报告'],
                        difficulty: 'beginner',
                        timeLimit: 20,
                        wordLimit: 120,
                        examType: 'general'
                    },
                    {
                        id: 'report_beg_002',
                        type: 'observation',
                        title: '图书馆使用情况观察',
                        prompt: '你观察了学校图书馆一周的使用情况。请写一份简单的观察报告，描述你看到的情况。',
                        requirements: [
                            '写作字数：不少于130字',
                            '客观描述观察结果',
                            '使用简单的数据',
                            '结构清晰'
                        ],
                        keywords: ['观察报告', '图书馆', '使用情况', '学习环境', '统计'],
                        difficulty: 'beginner',
                        timeLimit: 22,
                        wordLimit: 130,
                        examType: 'general'
                    }
                ],
                intermediate: [
                    {
                        id: 'report_int_001',
                        type: 'survey',
                        title: '学生课外活动调查报告',
                        prompt: '请根据以下数据写一份关于学生课外活动参与情况的调查报告。数据显示：体育活动60%，艺术活动25%，学术竞赛15%。',
                        requirements: [
                            '写作字数：不少于150字',
                            '客观描述数据',
                            '分析趋势和原因',
                            '使用正式的报告格式',
                            '提供结论和建议'
                        ],
                        keywords: ['调查报告', '数据分析', '课外活动', '趋势', '结论'],
                        difficulty: 'intermediate',
                        timeLimit: 20,
                        wordLimit: 150,
                        examType: 'ielts'
                    },
                    {
                        id: 'report_int_002',
                        type: 'comparison',
                        title: '城市交通方式对比报告',
                        prompt: '根据提供的数据，写一份关于不同城市交通方式使用情况的对比报告。数据包括：私家车45%，公共交通30%，自行车15%，步行10%。',
                        requirements: [
                            '写作字数：不少于170字',
                            '清晰呈现数据对比',
                            '分析各种交通方式的特点',
                            '使用适当的连接词',
                            '总结主要发现'
                        ],
                        keywords: ['对比报告', '交通方式', '数据对比', '城市交通', '统计分析'],
                        difficulty: 'intermediate',
                        timeLimit: 25,
                        wordLimit: 170,
                        examType: 'ielts'
                    },
                    {
                        id: 'report_int_003',
                        type: 'process',
                        title: '项目实施过程报告',
                        prompt: '你参与了一个社区环保项目的实施。请写一份过程报告，描述项目的各个阶段、遇到的问题以及解决方案。',
                        requirements: [
                            '写作字数：不少于180字',
                            '按时间顺序描述过程',
                            '详细说明各个阶段',
                            '分析问题和解决方案',
                            '评估项目效果'
                        ],
                        keywords: ['过程报告', '项目实施', '环保项目', '问题解决', '效果评估'],
                        difficulty: 'intermediate',
                        timeLimit: 25,
                        wordLimit: 180,
                        examType: 'ielts'
                    }
                ],
                advanced: [
                    {
                        id: 'report_adv_001',
                        type: 'research',
                        title: '数字化学习效果研究报告',
                        prompt: '基于相关研究数据，撰写一份关于数字化学习工具对学生学习效果影响的研究报告。需要分析不同年龄段学生的适应情况和学习成果。',
                        requirements: [
                            '写作字数：不少于280字',
                            '展现深入的数据分析能力',
                            '使用学术写作风格',
                            '提供详细的研究发现',
                            '得出有价值的结论',
                            '建议进一步研究方向'
                        ],
                        keywords: ['研究报告', '数字化学习', '学习效果', '数据分析', '学术研究', '教育技术'],
                        difficulty: 'advanced',
                        timeLimit: 40,
                        wordLimit: 280,
                        examType: 'ielts'
                    },
                    {
                        id: 'report_adv_002',
                        type: 'business',
                        title: '市场分析报告',
                        prompt: '作为市场分析师，请撰写一份关于新兴科技产品市场前景的分析报告。需要包括市场规模、竞争态势、发展趋势等内容。',
                        requirements: [
                            '写作字数：不少于320字',
                            '展现专业的商业分析能力',
                            '使用商务报告格式',
                            '提供具体的市场数据',
                            '分析竞争优势和风险',
                            '提出战略建议'
                        ],
                        keywords: ['市场分析', '科技产品', '竞争态势', '发展趋势', '商业报告', '战略建议'],
                        difficulty: 'advanced',
                        timeLimit: 45,
                        wordLimit: 320,
                        examType: 'business'
                    }
                ]
            },
            email: {
                beginner: [
                    {
                        id: 'email_beg_001',
                        type: 'personal',
                        title: '个人邮件：课程咨询',
                        prompt: '你想了解某个培训课程的详细信息。请写一封邮件给培训机构，询问课程内容、时间安排和费用。',
                        requirements: [
                            '写作字数：不少于100字',
                            '使用礼貌的询问语言',
                            '提出具体问题',
                            '格式简单正确'
                        ],
                        keywords: ['课程咨询', '培训', '时间安排', '费用', '询问'],
                        difficulty: 'beginner',
                        timeLimit: 15,
                        wordLimit: 100,
                        examType: 'general'
                    },
                    {
                        id: 'email_beg_002',
                        type: 'appointment',
                        title: '预约邮件：医生预约',
                        prompt: '你需要预约看医生。请写一封邮件给诊所，说明你的情况并请求预约时间。',
                        requirements: [
                            '写作字数：不少于110字',
                            '说明预约原因',
                            '提出时间偏好',
                            '语调礼貌专业'
                        ],
                        keywords: ['医生预约', '诊所', '时间安排', '健康', '预约'],
                        difficulty: 'beginner',
                        timeLimit: 16,
                        wordLimit: 110,
                        examType: 'general'
                    }
                ],
                intermediate: [
                    {
                        id: 'email_int_001',
                        type: 'business',
                        title: '商务邮件：会议安排',
                        prompt: '你需要给团队成员发送一封邮件，安排下周的项目讨论会议。请包含会议目的、时间、地点和议程。',
                        requirements: [
                            '写作字数：不少于120字',
                            '使用专业的商务语言',
                            '信息完整准确',
                            '结构清晰',
                            '语调正式礼貌'
                        ],
                        keywords: ['商务邮件', '会议安排', '议程', '团队沟通', '项目讨论'],
                        difficulty: 'intermediate',
                        timeLimit: 15,
                        wordLimit: 120,
                        examType: 'business'
                    },
                    {
                        id: 'email_int_002',
                        type: 'inquiry',
                        title: '询问邮件：产品咨询',
                        prompt: '你对某公司的新产品感兴趣，想了解更多详细信息。请写一封询问邮件，包括你的需求和具体问题。',
                        requirements: [
                            '写作字数：不少于140字',
                            '清楚表达询问目的',
                            '提出具体问题',
                            '使用礼貌的询问语言',
                            '提供必要的背景信息'
                        ],
                        keywords: ['询问邮件', '产品咨询', '需求说明', '信息获取', '商务沟通'],
                        difficulty: 'intermediate',
                        timeLimit: 18,
                        wordLimit: 140,
                        examType: 'business'
                    },
                    {
                        id: 'email_int_003',
                        type: 'notification',
                        title: '通知邮件：活动变更',
                        prompt: '由于天气原因，原定的户外团建活动需要改期。请写一封邮件通知所有参与者，说明变更情况和新的安排。',
                        requirements: [
                            '写作字数：不少于130字',
                            '清楚说明变更原因',
                            '提供新的时间安排',
                            '表达歉意',
                            '语调友好且专业'
                        ],
                        keywords: ['通知邮件', '活动变更', '时间调整', '团建活动', '沟通协调'],
                        difficulty: 'intermediate',
                        timeLimit: 16,
                        wordLimit: 130,
                        examType: 'business'
                    }
                ],
                advanced: [
                    {
                        id: 'email_adv_001',
                        type: 'proposal',
                        title: '提案邮件：新项目建议',
                        prompt: '你有一个创新的项目想法，想向公司高层提出建议。请写一封提案邮件，详细说明项目概念、预期收益和实施计划。',
                        requirements: [
                            '写作字数：不少于250字',
                            '展现专业的商务写作能力',
                            '逻辑清晰地阐述提案',
                            '提供具体的数据支持',
                            '使用说服性语言',
                            '结构严谨，重点突出'
                        ],
                        keywords: ['提案邮件', '项目建议', '商业计划', '创新想法', '高层沟通', '战略规划'],
                        difficulty: 'advanced',
                        timeLimit: 35,
                        wordLimit: 250,
                        examType: 'business'
                    },
                    {
                        id: 'email_adv_002',
                        type: 'negotiation',
                        title: '谈判邮件：合作协议',
                        prompt: '你代表公司与潜在合作伙伴进行商务谈判。请写一封邮件，提出合作条件并尝试达成互利的协议。',
                        requirements: [
                            '写作字数：不少于280字',
                            '展现高级的谈判技巧',
                            '平衡双方利益',
                            '使用外交性语言',
                            '提出具体的合作条款',
                            '保持专业和灵活性'
                        ],
                        keywords: ['谈判邮件', '合作协议', '商务谈判', '合作条件', '互利共赢', '商业合作'],
                        difficulty: 'advanced',
                        timeLimit: 40,
                        wordLimit: 280,
                        examType: 'business'
                    }
                ]
            }
        };
        
        console.log('📝 写作题目数据库已初始化');
        
        // 初始化写作模板数据库
        this.initializeTemplatesDatabase();
    }

    /**
     * 初始化写作模板数据库
     */
    initializeTemplatesDatabase() {
        this.templatesDatabase = {
            essay: {
                argumentative: {
                    title: '议论文模板',
                    structure: [
                        '引言段：提出话题，表明立场',
                        '主体段1：第一个论点及支撑论据',
                        '主体段2：第二个论点及支撑论据', 
                        '主体段3：反驳对立观点（可选）',
                        '结论段：总结观点，重申立场'
                    ],
                    template: `第一段：引言段
- 背景介绍：简要介绍话题背景
- 观点表述：明确表达你的立场
- 文章概览：简述将要讨论的要点

第二段：主体段落1
- 主题句：提出第一个论点
- 解释说明：详细阐述这个论点
- 具体例证：提供支持性例子或数据
- 小结：总结本段要点

第三段：主体段落2
- 主题句：提出第二个论点
- 解释说明：详细阐述这个论点
- 具体例证：提供支持性例子或数据
- 小结：总结本段要点

第四段：结论段
- 重申观点：重新表述你的立场
- 总结要点：概括主要论点
- 结束语：给出最终思考或呼吁`,
                    phrases: [
                        '引言常用表达：',
                        '- It is widely believed that...',
                        '- There is a growing concern about...',
                        '- In recent years, there has been...',
                        '',
                        '表达观点：',
                        '- I strongly believe that...',
                        '- From my perspective...',
                        '- It is my view that...',
                        '',
                        '举例说明：',
                        '- For example...',
                        '- To illustrate this point...',
                        '- A case in point is...',
                        '',
                        '总结表达：',
                        '- In conclusion...',
                        '- To sum up...',
                        '- All things considered...'
                    ]
                },
                opinion: {
                    title: '观点文模板',
                    structure: [
                        '开头段：介绍话题，表达个人观点',
                        '主体段：详细阐述观点，提供理由',
                        '结尾段：总结观点，给出建议'
                    ],
                    template: `第一段：开头段
- 话题引入：用一个有趣的问题或事实开始
- 个人观点：清楚表达你的看法
- 预告结构：简述文章的组织方式

第二段：主体段
- 理由1：提出支持观点的第一个理由
- 具体说明：详细解释这个理由
- 理由2：提出支持观点的第二个理由
- 具体说明：详细解释这个理由

第三段：结尾段
- 观点重申：重新表述你的观点
- 个人建议：基于你的观点给出建议
- 展望未来：对相关话题的未来发展表达看法`,
                    phrases: [
                        '表达观点：',
                        '- In my opinion...',
                        '- I believe that...',
                        '- From my point of view...',
                        '',
                        '提供理由：',
                        '- The main reason is...',
                        '- Another important factor is...',
                        '- What\'s more...',
                        '',
                        '个人经历：',
                        '- Based on my experience...',
                        '- I have found that...',
                        '- In my case...'
                    ]
                }
            },
            letter: {
                formal: {
                    title: '正式书信模板',
                    structure: [
                        '信头：写信人地址和日期',
                        '收信人信息：姓名和地址',
                        '称呼：正式称呼',
                        '正文：说明写信目的和详细内容',
                        '结尾：礼貌结束语',
                        '签名：写信人姓名'
                    ],
                    template: `[Your Address]
[City, State ZIP Code]
[Date]

[Recipient's Name]
[Title]
[Company/Organization]
[Address]
[City, State ZIP Code]

Dear [Mr./Ms. Last Name],

第一段：写信目的
- 简洁说明写信的原因
- 如果是回复来信，可以提及收到的信件

第二段：详细内容
- 详细说明相关情况
- 提供必要的背景信息
- 表达你的需求或观点

第三段：行动要求
- 明确说明你希望对方采取的行动
- 提供时间框架（如适用）
- 表达合作意愿

第四段：结尾
- 感谢对方的时间和考虑
- 期待回复
- 提供联系方式

Sincerely,
[Your Signature]
[Your Typed Name]`,
                    phrases: [
                        '开头表达：',
                        '- I am writing to...',
                        '- I would like to...',
                        '- I am writing in response to...',
                        '',
                        '请求帮助：',
                        '- I would be grateful if...',
                        '- Could you please...',
                        '- I would appreciate it if...',
                        '',
                        '结尾表达：',
                        '- Thank you for your consideration',
                        '- I look forward to hearing from you',
                        '- Please do not hesitate to contact me'
                    ]
                },
                informal: {
                    title: '非正式书信模板',
                    structure: [
                        '日期',
                        '亲切称呼',
                        '正文：分享近况，表达关心',
                        '友好结尾',
                        '签名'
                    ],
                    template: `[Date]

Dear [Friend's Name],

第一段：问候和近况
- 友好的问候
- 询问对方近况
- 分享自己的近况

第二段：主要内容
- 详细说明写信的主要目的
- 分享有趣的经历或想法
- 表达情感或关心

第三段：未来计划
- 提及未来的计划或邀请
- 表达见面的愿望
- 询问对方的计划

第四段：结尾
- 再次表达关心
- 期待回信
- 友好的结束语

Best wishes,
[Your Name]`,
                    phrases: [
                        '友好开头：',
                        '- How are you doing?',
                        '- I hope you\'re well',
                        '- It\'s been a while since...',
                        '',
                        '分享经历：',
                        '- Guess what happened...',
                        '- You won\'t believe...',
                        '- I wanted to tell you about...',
                        '',
                        '友好结尾：',
                        '- Hope to hear from you soon',
                        '- Take care',
                        '- Give my regards to...'
                    ]
                }
            },
            email: {
                business: {
                    title: '商务邮件模板',
                    structure: [
                        '主题行：清晰简洁的主题',
                        '称呼：专业称呼',
                        '正文：目的、详情、行动要求',
                        '结尾：专业结束语',
                        '签名：完整联系信息'
                    ],
                    template: `Subject: [Clear and Specific Subject Line]

Dear [Mr./Ms. Last Name],

第一段：目的说明
- 直接说明邮件目的
- 简要介绍背景（如需要）

第二段：详细信息
- 提供具体详情
- 包含相关数据或事实
- 解释重要性或紧急性

第三段：行动要求
- 明确说明需要的行动
- 提供截止日期
- 说明下一步安排

Best regards,
[Your Full Name]
[Your Title]
[Company Name]
[Phone Number]
[Email Address]`,
                    phrases: [
                        '邮件开头：',
                        '- I am writing to inform you...',
                        '- I would like to discuss...',
                        '- Following our conversation...',
                        '',
                        '提供信息：',
                        '- Please find attached...',
                        '- As requested...',
                        '- I am pleased to inform you...',
                        '',
                        '请求行动：',
                        '- Please confirm...',
                        '- Could you please provide...',
                        '- I would appreciate your feedback...'
                    ]
                }
            },
            report: {
                survey: {
                    title: '调查报告模板',
                    structure: [
                        '标题和摘要',
                        '引言：调查背景和目的',
                        '方法：调查方法和样本',
                        '结果：数据呈现和分析',
                        '结论：主要发现和建议'
                    ],
                    template: `调查报告：[Report Title]

摘要
- 调查目的简述
- 主要发现概括
- 关键建议总结

1. 引言
- 调查背景介绍
- 调查目的说明
- 调查范围界定

2. 调查方法
- 调查对象描述
- 数据收集方法
- 样本规模说明

3. 调查结果
- 数据统计呈现
- 图表分析说明
- 趋势变化描述

4. 结论与建议
- 主要发现总结
- 问题分析讨论
- 改进建议提出`,
                    phrases: [
                        '数据描述：',
                        '- The survey shows that...',
                        '- According to the data...',
                        '- The results indicate...',
                        '',
                        '趋势分析：',
                        '- There is a significant increase in...',
                        '- The trend shows...',
                        '- Compared to last year...',
                        '',
                        '结论表达：',
                        '- In conclusion...',
                        '- The findings suggest...',
                        '- It is recommended that...'
                    ]
                }
            }
        };
        
        // 初始化范文数据库
        this.initializeSampleEssays();
        
        console.log('📋 写作模板数据库已初始化');
    }

    /**
     * 初始化范文数据库
     */
    initializeSampleEssays() {
        this.sampleEssays = {
            essay: {
                argumentative: [
                    {
                        title: '在线学习vs传统课堂教学',
                        prompt: '比较在线学习和传统课堂教学的优缺点',
                        content: `Online Learning vs Traditional Classroom Education

In recent years, online learning has become increasingly popular, especially accelerated by the global pandemic. While some people argue that online learning is the future of education, others believe that traditional classroom teaching remains more effective. This essay will examine both approaches and argue that a blended model combining both methods offers the best educational experience.

Online learning offers several significant advantages. First, it provides unprecedented flexibility, allowing students to learn at their own pace and schedule. Working professionals and parents can pursue education without sacrificing their other responsibilities. Second, online learning eliminates geographical barriers, giving students access to courses and instructors from around the world. Third, it is often more cost-effective, reducing expenses related to transportation, accommodation, and physical materials.

However, traditional classroom education also has distinct benefits. Face-to-face interaction between teachers and students facilitates immediate feedback and clarification of complex concepts. The classroom environment promotes social interaction and collaborative learning, which are essential for developing communication skills. Additionally, the structured schedule of traditional classes helps students maintain discipline and motivation.

Nevertheless, both approaches have limitations. Online learning can lead to isolation and reduced motivation due to lack of direct supervision. Technical issues and the digital divide can also create barriers for some students. On the other hand, traditional classroom education is less flexible and may not accommodate different learning styles effectively.

In conclusion, rather than viewing these approaches as mutually exclusive, educational institutions should embrace a blended model that combines the flexibility of online learning with the personal interaction of traditional classrooms. This hybrid approach can maximize the benefits of both methods while minimizing their respective limitations, ultimately providing students with a more comprehensive and effective learning experience.`,
                        analysis: {
                            strengths: [
                                '清晰的论点和结构',
                                '平衡地讨论了两种观点',
                                '使用了恰当的连接词',
                                '结论提出了建设性建议'
                            ],
                            techniques: [
                                '使用对比论证结构',
                                '每个主体段落都有明确的主题句',
                                '提供了具体的例子和理由',
                                '使用了多样的句式结构'
                            ]
                        }
                    }
                ],
                opinion: [
                    {
                        title: '我最喜欢的季节',
                        prompt: '描述你最喜欢的季节并说明原因',
                        content: `My Favorite Season: Autumn

Among the four seasons, autumn holds a special place in my heart. While many people prefer the warmth of summer or the renewal of spring, I find autumn to be the most beautiful and meaningful season of the year.

The main reason I love autumn is its stunning visual beauty. The changing colors of leaves create a natural masterpiece that never fails to amaze me. Walking through parks and forests, I am surrounded by brilliant shades of red, orange, and gold. The crisp, clear air makes everything seem more vivid and alive. Even the way sunlight filters through the colorful canopy creates magical moments that summer's harsh brightness cannot match.

Another reason autumn appeals to me is the comfortable weather. After the sweltering heat of summer, the cool, refreshing air of autumn is incredibly welcome. It's perfect for outdoor activities like hiking, cycling, or simply taking long walks. I can wear my favorite sweaters and jackets without feeling too hot or too cold. The weather invites you to spend time outdoors while still being cozy and comfortable.

Finally, autumn represents a time of reflection and preparation. As nature prepares for winter's rest, I find myself naturally reflecting on the year's experiences and planning for the future. There's something deeply satisfying about this rhythm of life. The harvest season also reminds me to be grateful for the abundance in my life.

In conclusion, autumn's combination of natural beauty, pleasant weather, and meaningful symbolism makes it my favorite season. While others may prefer different times of the year, I will always treasure the unique magic that autumn brings to our world.`,
                        analysis: {
                            strengths: [
                                '个人观点表达清晰',
                                '使用了生动的描述性语言',
                                '结构简单但有效',
                                '情感表达真诚'
                            ],
                            techniques: [
                                '使用感官描述增强表现力',
                                '每段专注一个主要理由',
                                '使用第一人称增加个人色彩',
                                '结尾呼应开头'
                            ]
                        }
                    }
                ]
            },
            letter: {
                formal: [
                    {
                        title: '求职申请信',
                        content: `123 Main Street
Anytown, ST 12345
March 15, 2024

Ms. Sarah Johnson
Human Resources Manager
Tech Solutions Inc.
456 Business Avenue
Business City, ST 67890

Dear Ms. Johnson,

I am writing to express my strong interest in the Software Developer position advertised on your company website. With my background in computer science and three years of professional experience in software development, I believe I would be a valuable addition to your team.

In my current role at Digital Innovations, I have successfully developed and maintained multiple web applications using Java, Python, and React. I have experience working in agile development environments and have consistently delivered projects on time and within budget. My technical skills, combined with my ability to work collaboratively with cross-functional teams, have enabled me to contribute significantly to my current organization's success.

What particularly attracts me to Tech Solutions Inc. is your company's reputation for innovation and commitment to employee development. I am excited about the opportunity to work on cutting-edge projects and continue growing my skills in a dynamic environment. I am confident that my passion for technology and proven track record of success make me an ideal candidate for this position.

I would welcome the opportunity to discuss how my skills and experience can contribute to your team. Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,
John Smith`,
                        analysis: {
                            strengths: [
                                '正式的商务信件格式',
                                '明确说明了申请目的',
                                '突出了相关经验和技能',
                                '表达了对公司的了解和兴趣'
                            ]
                        }
                    }
                ]
            }
        };
        
        console.log('📚 范文数据库已初始化');
    }

    /**
     * 获取写作模板
     */
    getWritingTemplate(type, subtype) {
        try {
            const template = this.templatesDatabase[type]?.[subtype];
            if (!template) {
                console.warn(`未找到类型 ${type}-${subtype} 的模板`);
                return null;
            }
            return template;
        } catch (error) {
            console.error('获取写作模板失败:', error);
            return null;
        }
    }

    /**
     * 获取范文
     */
    getSampleEssays(type, subtype) {
        try {
            const samples = this.sampleEssays[type]?.[subtype];
            if (!samples) {
                console.warn(`未找到类型 ${type}-${subtype} 的范文`);
                return [];
            }
            return samples;
        } catch (error) {
            console.error('获取范文失败:', error);
            return [];
        }
    }

    /**
     * 根据当前题目推荐相关模板
     */
    getRecommendedTemplate() {
        if (!this.currentWriting) {
            return null;
        }
        
        const topic = this.currentWriting;
        const writingType = topic.id.split('_')[0]; // essay, letter, report, email
        const subtype = topic.type; // argumentative, formal, etc.
        
        return this.getWritingTemplate(writingType, subtype);
    }

    /**
     * 根据当前题目推荐相关范文
     */
    getRecommendedSamples() {
        if (!this.currentWriting) {
            return [];
        }
        
        const topic = this.currentWriting;
        const writingType = topic.id.split('_')[0]; // essay, letter, report, email
        const subtype = topic.type; // argumentative, formal, etc.
        
        return this.getSampleEssays(writingType, subtype);
    }

    /**
     * 根据配置获取写作题目
     */
    getTopicsByConfig() {
        const topics = this.topicsDatabase[this.config.writingType]?.[this.config.difficulty];
        return topics || [];
    }

    /**
     * 随机选择一个写作题目
     */
    selectRandomTopic() {
        const topics = this.getTopicsByConfig();
        
        if (topics.length === 0) {
            console.warn('未找到对应类型的写作题目');
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * topics.length);
        return topics[randomIndex];
    }

    /**
     * 开始写作练习
     */
    startWritingPractice() {
        console.log('✍️ 开始写作练习');
        console.log('配置:', this.config);
        
        // 选择题目
        this.currentWriting = this.selectRandomTopic();
        
        if (!this.currentWriting) {
            return null;
        }
        
        // 创建写作会话
        this.writingSession = {
            id: 'writing_' + Date.now(),
            topic: this.currentWriting,
            startTime: Date.now(),
            endTime: null,
            content: '',
            wordCount: 0,
            timeSpent: 0,
            completed: false
        };
        
        // 启动自动保存
        this.startAutosave();
        
        console.log('✅ 已选择写作题目:', this.currentWriting.title);
        return this.currentWriting;
    }

    /**
     * 开始计时
     */
    startTimer() {
        this.startTime = Date.now();
        
        this.timer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            // 更新界面显示
            const timerElement = document.getElementById('writingTimer');
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    /**
     * 停止计时
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * 更新写作内容
     */
    updateWritingContent(content) {
        if (!this.writingSession) return;
        
        this.writingSession.content = content;
        this.writingSession.wordCount = this.countWords(content);
        
        // 更新字数显示
        const wordCountElement = document.getElementById('wordCount');
        if (wordCountElement) {
            const target = this.currentWriting.wordLimit;
            const current = this.writingSession.wordCount;
            wordCountElement.textContent = `${current}/${target} 词`;
            
            // 根据字数变化颜色
            if (current < target * 0.5) {
                wordCountElement.className = 'word-count insufficient';
            } else if (current >= target) {
                wordCountElement.className = 'word-count sufficient';
            } else {
                wordCountElement.className = 'word-count approaching';
            }
        }
    }

    /**
     * 计算字数
     */
    countWords(text) {
        if (!text || text.trim().length === 0) return 0;
        
        // 简单的英文字数统计
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    /**
     * 完成写作练习
     */
    finishWriting(content) {
        if (!this.writingSession) {
            console.warn('没有活动的写作会话');
            return null;
        }

        this.stopTimer();
        this.stopAutosave();
        
        this.writingSession.content = content;
        this.writingSession.wordCount = this.countWords(content);
        this.writingSession.endTime = Date.now();
        this.writingSession.timeSpent = this.writingSession.endTime - this.writingSession.startTime;
        this.writingSession.completed = true;
        
        // 评分
        const score = this.evaluateWriting(this.writingSession);
        
        const result = {
            session: this.writingSession,
            score: score,
            feedback: this.generateFeedback(score, this.writingSession)
        };
        
        // 记录学习会话
        if (window.app && window.app.recordStudySession) {
            window.app.recordStudySession('writing', this.writingSession.timeSpent / 1000, score.overall);
        }
        
        // 更新进度
        this.updateWritingProgress(result);
        
        // 保存结果
        this.saveWritingResult(result);
        
        // 清除草稿
        this.clearDraft();
        
        console.log('✅ 写作练习完成');
        return result;
    }

    /**
     * 评估写作（增强版AI评分系统）
     */
    evaluateWriting(session) {
        let score = {
            total: 0,
            overall: 0,
            breakdown: {
                content: 0,        // 内容质量 (25%)
                organization: 0,   // 结构组织 (25%)
                language: 0,       // 语言运用 (25%)
                mechanics: 0,      // 语法拼写 (25%)
                coherence: 0,      // 连贯性 (额外指标)
                vocabulary: 0      // 词汇丰富度 (额外指标)
            },
            details: {
                wordCount: session.wordCount,
                targetWords: session.topic.wordLimit,
                timeSpent: Math.round(session.timeSpent / 1000 / 60),
                timeLimit: session.topic.timeLimit,
                paragraphCount: 0,
                sentenceCount: 0,
                avgWordsPerSentence: 0,
                vocabularyRichness: 0,
                readabilityScore: 0
            }
        };
        
        const content = session.content;
        const wordCount = session.wordCount;
        const targetWords = session.topic.wordLimit;
        const timeSpent = session.timeSpent / 1000 / 60; // 转换为分钟
        const timeLimit = session.topic.timeLimit;
        
        // 详细分析文本
        const textAnalysis = this.analyzeText(content);
        score.details = { ...score.details, ...textAnalysis };
        
        // 1. 内容评分 (基于字数达标、主题相关性)
        score.breakdown.content = this.evaluateContent(wordCount, targetWords, content, session.topic);
        
        // 2. 结构评分 (基于段落组织、逻辑结构)
        score.breakdown.organization = this.evaluateOrganization(content, textAnalysis);
        
        // 3. 语言评分 (基于词汇多样性、句式复杂度)
        score.breakdown.language = this.evaluateLanguage(content, textAnalysis);
        
        // 4. 语法机制评分 (基于语法规则、拼写检查)
        score.breakdown.mechanics = this.evaluateMechanics(content, textAnalysis);
        
        // 5. 连贯性评分 (基于逻辑连接、过渡词使用)
        score.breakdown.coherence = this.evaluateCoherence(content, textAnalysis);
        
        // 6. 词汇评分 (基于词汇丰富度、准确性)
        score.breakdown.vocabulary = this.evaluateVocabulary(content, textAnalysis);
        
        // 计算加权总分
        const weights = {
            content: 0.25,
            organization: 0.25,
            language: 0.20,
            mechanics: 0.15,
            coherence: 0.10,
            vocabulary: 0.05
        };
        
        score.total = Math.round(
            (score.breakdown.content * weights.content +
             score.breakdown.organization * weights.organization + 
             score.breakdown.language * weights.language + 
             score.breakdown.mechanics * weights.mechanics +
             score.breakdown.coherence * weights.coherence +
             score.breakdown.vocabulary * weights.vocabulary) * 10
        ) / 10;
        
        // 设置overall分数用于兼容性
        score.overall = score.total;
        
        return score;
    }

    /**
     * 分析文本的基本特征
     */
    analyzeText(content) {
        if (!content || content.trim().length === 0) {
            return {
                paragraphCount: 0,
                sentenceCount: 0,
                avgWordsPerSentence: 0,
                vocabularyRichness: 0,
                readabilityScore: 0,
                uniqueWords: 0,
                totalWords: 0
            };
        }
        
        // 段落数量
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const paragraphCount = paragraphs.length;
        
        // 句子数量 (基于句号、问号、感叹号)
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const sentenceCount = sentences.length;
        
        // 词汇分析
        const words = content.toLowerCase().match(/\b[a-z]+\b/g) || [];
        const totalWords = words.length;
        const uniqueWords = new Set(words);
        const vocabularyRichness = totalWords > 0 ? uniqueWords.size / totalWords : 0;
        
        // 平均句长
        const avgWordsPerSentence = sentenceCount > 0 ? totalWords / sentenceCount : 0;
        
        // 简单的可读性评分 (基于平均句长和音节数估算)
        const readabilityScore = this.calculateReadabilityScore(avgWordsPerSentence, vocabularyRichness);
        
        return {
            paragraphCount,
            sentenceCount,
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            vocabularyRichness: Math.round(vocabularyRichness * 100) / 100,
            readabilityScore: Math.round(readabilityScore * 10) / 10,
            uniqueWords: uniqueWords.size,
            totalWords
        };
    }

    /**
     * 评估内容质量
     */
    evaluateContent(wordCount, targetWords, content, topic) {
        let score = 5; // 基础分数
        
        // 字数达标情况 (40%权重)
        const wordRatio = wordCount / targetWords;
        if (wordRatio >= 1.0) {
            score += 2.5;
        } else if (wordRatio >= 0.9) {
            score += 2.0;
        } else if (wordRatio >= 0.8) {
            score += 1.5;
        } else if (wordRatio >= 0.7) {
            score += 1.0;
        } else if (wordRatio >= 0.6) {
            score += 0.5;
        }
        
        // 主题相关性 (30%权重) - 基于关键词匹配
        const keywordScore = this.calculateKeywordRelevance(content, topic.keywords);
        score += keywordScore * 1.5;
        
        // 内容深度 (30%权重) - 基于内容复杂度
        const depthScore = this.calculateContentDepth(content);
        score += depthScore * 1.5;
        
        return Math.min(Math.max(score, 0), 9);
    }

    /**
     * 评估结构组织
     */
    evaluateOrganization(content, analysis) {
        let score = 5; // 基础分数
        
        // 段落结构 (50%权重)
        if (analysis.paragraphCount >= 4) {
            score += 2;
        } else if (analysis.paragraphCount >= 3) {
            score += 1.5;
        } else if (analysis.paragraphCount >= 2) {
            score += 1;
        } else if (analysis.paragraphCount >= 1) {
            score += 0.5;
        }
        
        // 逻辑连接词使用 (30%权重)
        const transitionScore = this.evaluateTransitionWords(content);
        score += transitionScore * 1.2;
        
        // 结构清晰度 (20%权重)
        const structureScore = this.evaluateStructureClarity(content);
        score += structureScore * 0.8;
        
        return Math.min(Math.max(score, 0), 9);
    }

    /**
     * 评估语言运用
     */
    evaluateLanguage(content, analysis) {
        let score = 5; // 基础分数
        
        // 词汇多样性 (40%权重)
        if (analysis.vocabularyRichness > 0.7) {
            score += 2;
        } else if (analysis.vocabularyRichness > 0.6) {
            score += 1.5;
        } else if (analysis.vocabularyRichness > 0.5) {
            score += 1;
        } else if (analysis.vocabularyRichness > 0.4) {
            score += 0.5;
        }
        
        // 句式复杂度 (35%权重)
        const complexityScore = this.evaluateSentenceComplexity(content, analysis);
        score += complexityScore * 1.4;
        
        // 语言准确性 (25%权重)
        const accuracyScore = this.evaluateLanguageAccuracy(content);
        score += accuracyScore * 1;
        
        return Math.min(Math.max(score, 0), 9);
    }

    /**
     * 评估语法机制
     */
    evaluateMechanics(content, analysis) {
        let score = 7; // 默认较高分数，因为详细语法检查需要专门工具
        
        // 基本拼写检查 (40%权重)
        const spellingScore = this.basicSpellingCheck(content);
        score += (spellingScore - 0.5) * 1.6;
        
        // 标点符号使用 (30%权重)
        const punctuationScore = this.evaluatePunctuation(content);
        score += (punctuationScore - 0.5) * 1.2;
        
        // 大小写规范 (30%权重)
        const capitalizationScore = this.evaluateCapitalization(content);
        score += (capitalizationScore - 0.5) * 1.2;
        
        return Math.min(Math.max(score, 0), 9);
    }

    /**
     * 评估连贯性
     */
    evaluateCoherence(content, analysis) {
        let score = 6; // 基础分数
        
        // 逻辑流畅性 (60%权重)
        const flowScore = this.evaluateLogicalFlow(content);
        score += flowScore * 1.8;
        
        // 代词指代清晰度 (40%权重)
        const referenceScore = this.evaluatePronounReference(content);
        score += referenceScore * 1.2;
        
        return Math.min(Math.max(score, 0), 9);
    }

    /**
     * 评估词汇运用
     */
    evaluateVocabulary(content, analysis) {
        let score = 6; // 基础分数
        
        // 高级词汇使用 (70%权重)
        const advancedVocabScore = this.evaluateAdvancedVocabulary(content);
        score += advancedVocabScore * 2.1;
        
        // 词汇准确性 (30%权重)
        const vocabularyAccuracy = this.evaluateVocabularyAccuracy(content);
        score += vocabularyAccuracy * 0.9;
        
        return Math.min(Math.max(score, 0), 9);
    }

    /**
     * 计算关键词相关性
     */
    calculateKeywordRelevance(content, keywords) {
        if (!keywords || keywords.length === 0) return 0.5;
        
        const lowerContent = content.toLowerCase();
        let matchCount = 0;
        
        keywords.forEach(keyword => {
            if (lowerContent.includes(keyword.toLowerCase())) {
                matchCount++;
            }
        });
        
        return matchCount / keywords.length;
    }

    /**
     * 计算内容深度
     */
    calculateContentDepth(content) {
        // 基于句子长度变化、词汇复杂度等因素
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length === 0) return 0;
        
        let complexityScore = 0;
        let totalLength = 0;
        
        sentences.forEach(sentence => {
            const words = sentence.trim().split(/\s+/);
            totalLength += words.length;
            
            // 长句子获得更高分数
            if (words.length > 15) complexityScore += 0.3;
            else if (words.length > 10) complexityScore += 0.2;
            else if (words.length > 5) complexityScore += 0.1;
        });
        
        const avgLength = totalLength / sentences.length;
        const depthScore = Math.min(complexityScore / sentences.length + avgLength / 20, 1);
        
        return depthScore;
    }

    /**
     * 评估过渡词使用
     */
    evaluateTransitionWords(content) {
        const transitionWords = [
            'however', 'furthermore', 'moreover', 'therefore', 'consequently',
            'in addition', 'on the other hand', 'in contrast', 'similarly',
            'for example', 'in conclusion', 'finally', 'first', 'second',
            'although', 'despite', 'because', 'since', 'as a result'
        ];
        
        const lowerContent = content.toLowerCase();
        let transitionCount = 0;
        
        transitionWords.forEach(word => {
            if (lowerContent.includes(word)) {
                transitionCount++;
            }
        });
        
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const transitionRatio = sentences.length > 0 ? transitionCount / sentences.length : 0;
        
        return Math.min(transitionRatio * 2, 1);
    }

    /**
     * 评估结构清晰度
     */
    evaluateStructureClarity(content) {
        // 简化的结构评估：检查是否有明确的开头、中间、结尾
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        if (paragraphs.length < 2) return 0.3;
        if (paragraphs.length === 2) return 0.6;
        if (paragraphs.length >= 3) return 0.9;
        
        return 0.5;
    }

    /**
     * 评估句式复杂度
     */
    evaluateSentenceComplexity(content, analysis) {
        // 基于平均句长和句式变化
        const avgLength = analysis.avgWordsPerSentence;
        let complexityScore = 0;
        
        if (avgLength > 20) complexityScore = 1;
        else if (avgLength > 15) complexityScore = 0.8;
        else if (avgLength > 12) complexityScore = 0.6;
        else if (avgLength > 8) complexityScore = 0.4;
        else complexityScore = 0.2;
        
        // 检查复杂句式标志词
        const complexMarkers = ['which', 'that', 'although', 'because', 'since', 'while', 'whereas'];
        const lowerContent = content.toLowerCase();
        let markerCount = 0;
        
        complexMarkers.forEach(marker => {
            if (lowerContent.includes(marker)) markerCount++;
        });
        
        const markerBonus = Math.min(markerCount * 0.1, 0.3);
        
        return Math.min(complexityScore + markerBonus, 1);
    }

    /**
     * 评估语言准确性
     */
    evaluateLanguageAccuracy(content) {
        // 简化的准确性评估
        // 在实际应用中，这里应该集成更专业的语法检查工具
        return 0.8; // 默认给较高分数
    }

    /**
     * 基本拼写检查
     */
    basicSpellingCheck(content) {
        // 简化的拼写检查
        // 实际应用中应该使用专业的拼写检查库
        return 0.8; // 默认给较高分数
    }

    /**
     * 评估标点符号使用
     */
    evaluatePunctuation(content) {
        // 检查基本标点符号的使用
        const hasCommas = content.includes(',');
        const hasPeriods = content.includes('.');
        const hasQuestionMarks = content.includes('?');
        const hasExclamation = content.includes('!');
        
        let score = 0.5;
        if (hasPeriods) score += 0.2;
        if (hasCommas) score += 0.2;
        if (hasQuestionMarks || hasExclamation) score += 0.1;
        
        return Math.min(score, 1);
    }

    /**
     * 评估大小写规范
     */
    evaluateCapitalization(content) {
        // 检查句首大写
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let correctCapitalization = 0;
        
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.length > 0 && /^[A-Z]/.test(trimmed)) {
                correctCapitalization++;
            }
        });
        
        return sentences.length > 0 ? correctCapitalization / sentences.length : 0.5;
    }

    /**
     * 评估逻辑流畅性
     */
    evaluateLogicalFlow(content) {
        // 简化的逻辑流畅性评估
        // 基于段落之间的连接和内容的连贯性
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        if (paragraphs.length < 2) return 0.5;
        
        // 检查段落间的逻辑连接
        let connectionScore = 0.6; // 基础分数
        
        // 简单检查：后续段落是否与前面内容相关
        // 这里可以扩展为更复杂的语义分析
        
        return connectionScore;
    }

    /**
     * 评估代词指代清晰度
     */
    evaluatePronounReference(content) {
        // 简化的代词指代评估
        const pronouns = ['it', 'they', 'this', 'that', 'these', 'those'];
        const lowerContent = content.toLowerCase();
        
        let pronounCount = 0;
        pronouns.forEach(pronoun => {
            const regex = new RegExp(`\\b${pronoun}\\b`, 'g');
            const matches = lowerContent.match(regex);
            if (matches) pronounCount += matches.length;
        });
        
        // 适度使用代词得高分，过多或过少都扣分
        const words = content.split(/\s+/).length;
        const pronounRatio = words > 0 ? pronounCount / words : 0;
        
        if (pronounRatio > 0.05 && pronounRatio < 0.15) return 0.8;
        else if (pronounRatio > 0.02 && pronounRatio < 0.2) return 0.6;
        else return 0.4;
    }

    /**
     * 评估高级词汇使用
     */
    evaluateAdvancedVocabulary(content) {
        // 高级词汇列表（示例）
        const advancedWords = [
            'consequently', 'furthermore', 'nevertheless', 'moreover', 'significantly',
            'substantial', 'comprehensive', 'sophisticated', 'innovative', 'fundamental',
            'crucial', 'essential', 'substantial', 'considerable', 'remarkable',
            'extraordinary', 'exceptional', 'unprecedented', 'profound', 'tremendous'
        ];
        
        const lowerContent = content.toLowerCase();
        let advancedCount = 0;
        
        advancedWords.forEach(word => {
            if (lowerContent.includes(word)) {
                advancedCount++;
            }
        });
        
        const totalWords = content.split(/\s+/).length;
        const advancedRatio = totalWords > 0 ? advancedCount / totalWords : 0;
        
        return Math.min(advancedRatio * 20, 1); // 放大比例以获得合理分数
    }

    /**
     * 评估词汇准确性
     */
    evaluateVocabularyAccuracy(content) {
        // 简化的词汇准确性评估
        // 实际应用中应该检查词汇搭配、语境适当性等
        return 0.8; // 默认给较高分数
    }

    /**
     * 计算可读性评分
     */
    calculateReadabilityScore(avgWordsPerSentence, vocabularyRichness) {
        // 基于Flesch Reading Ease的简化版本
        // 较短的句子和常用词汇获得更高的可读性分数
        let readabilityScore = 100;
        
        // 句长影响 (句子越长，可读性越低)
        readabilityScore -= (avgWordsPerSentence - 10) * 2;
        
        // 词汇复杂度影响 (词汇越丰富，可读性相对降低)
        readabilityScore -= (vocabularyRichness - 0.5) * 20;
        
        return Math.max(Math.min(readabilityScore, 100), 0);
    }

    /**
     * 生成增强版反馈
     */
    generateFeedback(score, session) {
        const feedback = {
            overall: '',
            strengths: [],
            improvements: [],
            suggestions: [],
            detailedAnalysis: {
                content: '',
                organization: '',
                language: '',
                mechanics: '',
                coherence: '',
                vocabulary: ''
            },
            scoreBreakdown: {
                content: score.breakdown.content,
                organization: score.breakdown.organization,
                language: score.breakdown.language,
                mechanics: score.breakdown.mechanics,
                coherence: score.breakdown.coherence,
                vocabulary: score.breakdown.vocabulary
            },
            writingAnalysis: score.details
        };
        
        // 总体评价
        if (score.total >= 8.5) {
            feedback.overall = '🌟 卓越的写作！你展现了出色的英语写作能力，各方面表现都很优秀。';
        } else if (score.total >= 7.5) {
            feedback.overall = '✨ 优秀的写作！整体质量很高，只需要在一些细节上进行微调。';
        } else if (score.total >= 6.5) {
            feedback.overall = '👍 良好的写作！基础扎实，有明显的进步空间。';
        } else if (score.total >= 5.5) {
            feedback.overall = '📈 不错的尝试！继续练习会有更大的提升。';
        } else {
            feedback.overall = '💪 需要更多练习！不要气馁，每次练习都是进步的机会。';
        }
        
        // 详细分析各个维度
        this.generateContentFeedback(feedback, score.breakdown.content, session);
        this.generateOrganizationFeedback(feedback, score.breakdown.organization, session);
        this.generateLanguageFeedback(feedback, score.breakdown.language, session);
        this.generateMechanicsFeedback(feedback, score.breakdown.mechanics, session);
        this.generateCoherenceFeedback(feedback, score.breakdown.coherence, session);
        this.generateVocabularyFeedback(feedback, score.breakdown.vocabulary, session);
        
        // 个性化建议
        this.generatePersonalizedSuggestions(feedback, score, session);
        
        return feedback;
    }

    /**
     * 生成内容反馈
     */
    generateContentFeedback(feedback, contentScore, session) {
        if (contentScore >= 8) {
            feedback.strengths.push('📝 内容充实丰富，很好地回应了题目要求');
            feedback.detailedAnalysis.content = '内容质量优秀，主题把握准确，论述深入。';
        } else if (contentScore >= 7) {
            feedback.strengths.push('📝 内容基本充实，能够回应题目要求');
            feedback.detailedAnalysis.content = '内容质量良好，主题相关性较强。';
        } else if (contentScore >= 6) {
            feedback.improvements.push('📝 内容需要更加充实，可以添加更多具体例子和细节');
            feedback.detailedAnalysis.content = '内容基本符合要求，但深度有待提高。';
        } else {
            feedback.improvements.push('📝 内容过于简单，需要大幅扩展和深化');
            feedback.detailedAnalysis.content = '内容不够充实，需要更多的论述和支撑。';
        }
        
        // 字数相关反馈
        const wordRatio = session.wordCount / session.topic.wordLimit;
        if (wordRatio < 0.8) {
            feedback.improvements.push(`📊 字数不足，当前${session.wordCount}字，建议达到${session.topic.wordLimit}字以上`);
        } else if (wordRatio >= 1.2) {
            feedback.suggestions.push('📊 字数充足，注意控制篇幅，保持内容紧凑');
        }
    }

    /**
     * 生成结构反馈
     */
    generateOrganizationFeedback(feedback, orgScore, session) {
        const paragraphCount = session.content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
        
        if (orgScore >= 8) {
            feedback.strengths.push('🏗️ 文章结构清晰，段落组织合理');
            feedback.detailedAnalysis.organization = '结构优秀，逻辑层次分明，段落过渡自然。';
        } else if (orgScore >= 7) {
            feedback.strengths.push('🏗️ 文章结构基本清晰');
            feedback.detailedAnalysis.organization = '结构良好，逻辑基本清晰。';
        } else if (orgScore >= 6) {
            feedback.improvements.push('🏗️ 文章结构需要改进，注意段落间的逻辑关系');
            feedback.detailedAnalysis.organization = '结构基本合理，但逻辑连接有待加强。';
        } else {
            feedback.improvements.push('🏗️ 文章结构混乱，需要重新组织内容');
            feedback.detailedAnalysis.organization = '结构不够清晰，段落组织需要改进。';
        }
        
        // 段落数量建议
        if (paragraphCount < 3) {
            feedback.suggestions.push('📄 建议将内容分为更多段落，每段专注一个主要观点');
        } else if (paragraphCount > 6) {
            feedback.suggestions.push('📄 段落较多，可考虑合并相关内容，使结构更紧凑');
        }
    }

    /**
     * 生成语言反馈
     */
    generateLanguageFeedback(feedback, langScore, session) {
        if (langScore >= 8) {
            feedback.strengths.push('🎯 语言表达准确流畅，词汇运用恰当');
            feedback.detailedAnalysis.language = '语言运用优秀，表达自然流畅。';
        } else if (langScore >= 7) {
            feedback.strengths.push('🎯 语言表达基本准确');
            feedback.detailedAnalysis.language = '语言运用良好，表达较为清晰。';
        } else if (langScore >= 6) {
            feedback.improvements.push('🎯 语言表达需要提高，可以尝试使用更多样的句式');
            feedback.detailedAnalysis.language = '语言运用基本合格，但表达方式需要更加多样化。';
        } else {
            feedback.improvements.push('🎯 语言表达有较多问题，需要加强基础训练');
            feedback.detailedAnalysis.language = '语言运用存在问题，需要加强基础练习。';
        }
    }

    /**
     * 生成语法机制反馈
     */
    generateMechanicsFeedback(feedback, mechScore, session) {
        if (mechScore >= 8) {
            feedback.strengths.push('✅ 语法和拼写基本准确，标点使用规范');
            feedback.detailedAnalysis.mechanics = '语法机制优秀，错误很少。';
        } else if (mechScore >= 7) {
            feedback.strengths.push('✅ 语法和拼写大部分正确');
            feedback.detailedAnalysis.mechanics = '语法机制良好，偶有小错。';
        } else if (mechScore >= 6) {
            feedback.improvements.push('✅ 注意检查语法和拼写错误');
            feedback.detailedAnalysis.mechanics = '语法机制基本合格，但需要更仔细的检查。';
        } else {
            feedback.improvements.push('✅ 语法和拼写错误较多，需要加强基础练习');
            feedback.detailedAnalysis.mechanics = '语法机制需要改进，建议加强基础训练。';
        }
    }

    /**
     * 生成连贯性反馈
     */
    generateCoherenceFeedback(feedback, cohScore, session) {
        if (cohScore >= 8) {
            feedback.strengths.push('🔗 文章连贯性很好，逻辑流畅');
            feedback.detailedAnalysis.coherence = '连贯性优秀，思路清晰，逻辑性强。';
        } else if (cohScore >= 7) {
            feedback.strengths.push('🔗 文章连贯性较好');
            feedback.detailedAnalysis.coherence = '连贯性良好，逻辑基本清晰。';
        } else if (cohScore >= 6) {
            feedback.improvements.push('🔗 加强句子和段落间的逻辑连接');
            feedback.detailedAnalysis.coherence = '连贯性有待提高，需要更好的逻辑连接。';
        } else {
            feedback.improvements.push('🔗 文章缺乏连贯性，需要改善逻辑结构');
            feedback.detailedAnalysis.coherence = '连贯性不足，逻辑关系不够清晰。';
        }
    }

    /**
     * 生成词汇反馈
     */
    generateVocabularyFeedback(feedback, vocabScore, session) {
        if (vocabScore >= 8) {
            feedback.strengths.push('📚 词汇运用丰富多样，展现了良好的语言功底');
            feedback.detailedAnalysis.vocabulary = '词汇运用优秀，丰富多样且准确。';
        } else if (vocabScore >= 7) {
            feedback.strengths.push('📚 词汇运用较为丰富');
            feedback.detailedAnalysis.vocabulary = '词汇运用良好，有一定的多样性。';
        } else if (vocabScore >= 6) {
            feedback.improvements.push('📚 可以尝试使用更多高级词汇和表达方式');
            feedback.detailedAnalysis.vocabulary = '词汇运用基本合格，但可以更加丰富。';
        } else {
            feedback.improvements.push('📚 词汇过于简单，需要扩大词汇量');
            feedback.detailedAnalysis.vocabulary = '词汇运用较为简单，需要提高词汇丰富度。';
        }
    }

    /**
     * 生成个性化建议
     */
    generatePersonalizedSuggestions(feedback, score, session) {
        const details = score.details;
        
        // 基于写作类型的建议
        const writingType = session.topic.type;
        switch (writingType) {
            case 'argumentative':
                feedback.suggestions.push('💡 议论文建议：确保有清晰的论点，充分的论据支持，以及有力的结论');
                break;
            case 'descriptive':
                feedback.suggestions.push('💡 描述文建议：使用更多感官细节，让描述更加生动具体');
                break;
            case 'narrative':
                feedback.suggestions.push('💡 记叙文建议：注意时间顺序，突出关键事件和情感变化');
                break;
            case 'formal':
                feedback.suggestions.push('💡 正式文体建议：保持正式语调，使用适当的敬语和商务表达');
                break;
            case 'informal':
                feedback.suggestions.push('💡 非正式文体建议：可以使用更轻松的语调，但仍要保持清晰表达');
                break;
        }
        
        // 基于分析结果的建议
        if (details.avgWordsPerSentence < 8) {
            feedback.suggestions.push('📝 尝试写更长的句子，使用连接词连接相关想法');
        } else if (details.avgWordsPerSentence > 20) {
            feedback.suggestions.push('📝 句子过长，可以适当分解为更短的句子以提高可读性');
        }
        
        if (details.vocabularyRichness < 0.5) {
            feedback.suggestions.push('📚 增加词汇多样性，避免重复使用相同的词汇');
        }
        
        if (details.paragraphCount < 3) {
            feedback.suggestions.push('📄 建议增加段落数量，每个段落专注于一个主要观点');
        }
        
        // 时间管理建议
        const timeRatio = details.timeSpent / details.timeLimit;
        if (timeRatio < 0.5) {
            feedback.suggestions.push('⏰ 你完成得很快！可以花更多时间检查和完善内容');
        } else if (timeRatio > 0.9) {
            feedback.suggestions.push('⏰ 注意时间管理，可以在构思阶段花更多时间规划结构');
        }
        
        // 通用改进建议
        feedback.suggestions.push('📖 多读优秀范文，学习不同的表达方式和写作技巧');
        feedback.suggestions.push('✍️ 坚持练习，每天写作可以显著提高写作水平');
        feedback.suggestions.push('🔍 完成写作后，花时间检查语法、拼写和逻辑');
    }

    /**
     * 更新写作进度
     */
    updateWritingProgress(result) {
        this.writingProgress.totalWritings++;
        this.writingProgress.totalWords += result.session.wordCount;
        this.writingProgress.totalTime += Math.round(result.session.timeSpent / 1000 / 60);
        
        // 更新平均分数
        const oldTotal = this.writingProgress.totalWritings - 1;
        const oldSum = this.writingProgress.averageScore * oldTotal;
        this.writingProgress.averageScore = Math.round(((oldSum + result.score.total) / this.writingProgress.totalWritings) * 10) / 10;
        
        // 更新类型统计
        const writingType = result.session.topic.type;
        const topLevelType = result.session.topic.id.split('_')[0]; // essay, letter, report, email
        
        if (this.writingProgress.typeStats[topLevelType]) {
            const typeStats = this.writingProgress.typeStats[topLevelType];
            const oldCompleted = typeStats.completed;
            const oldScoreSum = typeStats.averageScore * oldCompleted;
            
            typeStats.completed++;
            typeStats.totalWords += result.session.wordCount;
            typeStats.averageScore = Math.round(((oldScoreSum + result.score.total) / typeStats.completed) * 10) / 10;
        }
        
        // 添加到最近写作
        this.writingProgress.recentWritings.unshift({
            title: result.session.topic.title,
            type: topLevelType,
            score: result.score.total,
            wordCount: result.session.wordCount,
            timeSpent: Math.round(result.session.timeSpent / 1000 / 60),
            date: new Date().toISOString()
        });
        
        // 只保留最近20篇
        if (this.writingProgress.recentWritings.length > 20) {
            this.writingProgress.recentWritings = this.writingProgress.recentWritings.slice(0, 20);
        }
        
        this.saveWritingProgress();
    }

    /**
     * 保存写作结果
     */
    saveWritingResult(result) {
        try {
            const writingHistory = JSON.parse(localStorage.getItem('writingHistory') || '[]');
            
            const historyItem = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                topic: {
                    title: result.session.topic.title,
                    type: result.session.topic.type,
                    difficulty: result.session.topic.difficulty
                },
                content: result.session.content,
                wordCount: result.session.wordCount,
                timeSpent: result.session.timeSpent,
                score: result.score,
                feedback: result.feedback
            };
            
            writingHistory.unshift(historyItem);
            
            // 只保留最近50次记录
            if (writingHistory.length > 50) {
                writingHistory.splice(50);
            }
            
            localStorage.setItem('writingHistory', JSON.stringify(writingHistory));
            console.log('💾 写作结果已保存');
            
        } catch (error) {
            console.error('保存写作结果失败:', error);
        }
    }

    /**
     * 获取写作统计
     */
    getWritingStats() {
        return {
            totalWritings: this.writingProgress.totalWritings,
            averageScore: this.writingProgress.averageScore,
            totalWords: this.writingProgress.totalWords,
            totalTime: this.writingProgress.totalTime,
            typeStats: this.writingProgress.typeStats,
            recentWritings: this.writingProgress.recentWritings.slice(0, 5)
        };
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('📝 写作配置已更新:', this.config);
    }

    /**
     * 保存写作进度
     */
    saveWritingProgress() {
        try {
            localStorage.setItem('writingProgress', JSON.stringify(this.writingProgress));
            console.log('💾 写作进度已保存');
        } catch (error) {
            console.error('保存写作进度失败:', error);
        }
    }

    /**
     * 加载写作进度
     */
    loadWritingProgress() {
        try {
            const saved = localStorage.getItem('writingProgress');
            if (saved) {
                this.writingProgress = { ...this.writingProgress, ...JSON.parse(saved) };
                console.log('📈 写作进度已加载');
            }
        } catch (error) {
            console.error('加载写作进度失败:', error);
        }
    }

    /**
     * 重置写作进度
     */
    resetProgress() {
        this.writingProgress = {
            totalWritings: 0,
            totalWords: 0,
            averageScore: 0,
            totalTime: 0,
            typeStats: {
                essay: { completed: 0, averageScore: 0, totalWords: 0 },
                letter: { completed: 0, averageScore: 0, totalWords: 0 },
                report: { completed: 0, averageScore: 0, totalWords: 0 },
                email: { completed: 0, averageScore: 0, totalWords: 0 }
            },
            recentWritings: []
        };
        
        this.saveWritingProgress();
        console.log('🔄 写作进度已重置');
    }

    /**
     * 重置当前会话
     */
    resetCurrentSession() {
        this.currentWriting = null;
        this.writingSession = null;
        this.stopTimer();
    }

    /**
     * 获取写作历史
     */
    getWritingHistory() {
        try {
            return JSON.parse(localStorage.getItem('writingHistory') || '[]');
        } catch (error) {
            console.error('获取写作历史失败:', error);
            return [];
        }
    }

    /**
     * 获取写作练习统计信息（增强版）
     */
    getStats() {
        const progress = this.writingProgress || {};
        
        // 基础统计
        const basicStats = {
            averageScore: progress.averageScore || 0,
            totalWritings: progress.totalWritings || 0,
            totalTime: Math.round((progress.totalTime || 0)), // 保持分钟单位
            totalWords: progress.totalWords || 0,
            bestScore: Math.max(...(progress.recentWritings || []).map(w => w.score || 0), 0),
            completionRate: progress.totalWritings > 0 ? 100 : 0,
            streakDays: this.calculateWritingStreak()
        };

        // 详细分析
        const detailedAnalysis = this.generateDetailedAnalysis(progress);
        
        // 学习路径推荐
        const learningPath = this.generateLearningPath(progress, detailedAnalysis);
        
        return {
            ...basicStats,
            analysis: detailedAnalysis,
            recommendations: learningPath,
            progressInsights: this.generateProgressInsights(progress)
        };
    }

    /**
     * 生成详细分析
     */
    generateDetailedAnalysis(progress) {
        const recentWritings = progress.recentWritings || [];
        const typeStats = progress.typeStats || {};
        
        const analysis = {
            strengthAreas: [],
            weaknessAreas: [],
            improvementTrends: [],
            skillDistribution: {},
            timeManagement: {},
            consistencyScore: 0
        };

        // 分析各类型表现
        Object.keys(typeStats).forEach(type => {
            const stats = typeStats[type];
            if (stats.completed > 0) {
                analysis.skillDistribution[type] = {
                    completed: stats.completed,
                    averageScore: stats.averageScore,
                    totalWords: stats.totalWords,
                    proficiency: this.calculateProficiencyLevel(stats.averageScore)
                };

                // 识别优势和劣势
                if (stats.averageScore >= 7.5) {
                    analysis.strengthAreas.push({
                        skill: type,
                        score: stats.averageScore,
                        description: this.getSkillDescription(type, 'strength')
                    });
                } else if (stats.averageScore < 6.0) {
                    analysis.weaknessAreas.push({
                        skill: type,
                        score: stats.averageScore,
                        description: this.getSkillDescription(type, 'weakness')
                    });
                }
            }
        });

        // 分析改进趋势
        if (recentWritings.length >= 3) {
            const recent5 = recentWritings.slice(0, 5);
            const older5 = recentWritings.slice(5, 10);
            
            if (older5.length > 0) {
                const recentAvg = recent5.reduce((sum, w) => sum + w.score, 0) / recent5.length;
                const olderAvg = older5.reduce((sum, w) => sum + w.score, 0) / older5.length;
                const improvement = recentAvg - olderAvg;
                
                if (improvement > 0.5) {
                    analysis.improvementTrends.push({
                        type: 'overall_improvement',
                        value: improvement,
                        description: `整体写作水平提升了${improvement.toFixed(1)}分`
                    });
                } else if (improvement < -0.5) {
                    analysis.improvementTrends.push({
                        type: 'performance_decline',
                        value: improvement,
                        description: `需要注意，最近表现有所下降`
                    });
                }
            }
        }

        // 时间管理分析
        if (recentWritings.length > 0) {
            const avgTime = recentWritings.reduce((sum, w) => sum + w.timeSpent, 0) / recentWritings.length;
            analysis.timeManagement = {
                averageTime: Math.round(avgTime),
                efficiency: this.calculateTimeEfficiency(recentWritings),
                recommendation: this.getTimeManagementAdvice(avgTime)
            };
        }

        // 一致性评分
        analysis.consistencyScore = this.calculateConsistencyScore(recentWritings);

        return analysis;
    }

    /**
     * 生成学习路径推荐
     */
    generateLearningPath(progress, analysis) {
        const recommendations = {
            immediate: [], // 立即行动建议
            shortTerm: [], // 短期目标（1-2周）
            longTerm: [], // 长期目标（1-2月）
            nextPractice: null, // 下次练习建议
            skillFocus: [] // 技能重点
        };

        // 基于弱项推荐立即行动
        analysis.weaknessAreas.forEach(weakness => {
            recommendations.immediate.push({
                type: 'skill_improvement',
                priority: 'high',
                action: `加强${this.getTypeDisplayName(weakness.skill)}练习`,
                description: `当前${weakness.skill}平均分仅${weakness.score.toFixed(1)}分，建议重点练习`,
                estimatedTime: '每天15-20分钟'
            });
        });

        // 基于总练习次数推荐
        const totalWritings = progress.totalWritings || 0;
        if (totalWritings < 5) {
            recommendations.immediate.push({
                type: 'practice_frequency',
                priority: 'high',
                action: '增加练习频率',
                description: '建议每天至少完成一篇写作练习',
                estimatedTime: '每天30-45分钟'
            });
        }

        // 短期目标设定
        if (progress.averageScore < 7.0) {
            recommendations.shortTerm.push({
                goal: '提升整体写作水平',
                target: '平均分达到7.0分以上',
                actions: [
                    '每天练习一种写作类型',
                    '重点学习写作模板和范文',
                    '加强语法和词汇基础'
                ],
                timeframe: '2周内'
            });
        }

        // 长期目标
        recommendations.longTerm.push({
            goal: '成为全面的英语写作高手',
            target: '各类型写作平均分达到8.0分以上',
            actions: [
                '掌握高级写作技巧',
                '培养批判性思维',
                '扩大学术和商务词汇量',
                '形成个人写作风格'
            ],
            timeframe: '2个月内'
        });

        // 下次练习建议
        recommendations.nextPractice = this.suggestNextPractice(progress, analysis);

        // 技能重点
        recommendations.skillFocus = this.identifySkillFocus(analysis);

        return recommendations;
    }

    /**
     * 建议下次练习内容
     */
    suggestNextPractice(progress, analysis) {
        const typeStats = progress.typeStats || {};
        const recentWritings = progress.recentWritings || [];

        // 找出练习最少的类型
        let minPracticeType = null;
        let minCount = Infinity;

        Object.keys(typeStats).forEach(type => {
            if (typeStats[type].completed < minCount) {
                minCount = typeStats[type].completed;
                minPracticeType = type;
            }
        });

        // 如果没有明显的弱项，根据最近练习情况推荐
        if (!minPracticeType && recentWritings.length > 0) {
            const lastType = recentWritings[0].type;
            const allTypes = ['essay', 'letter', 'report', 'email'];
            const otherTypes = allTypes.filter(t => t !== lastType);
            minPracticeType = otherTypes[Math.floor(Math.random() * otherTypes.length)];
        }

        // 根据平均分推荐难度
        const avgScore = progress.averageScore || 0;
        let suggestedDifficulty;
        if (avgScore < 6.0) {
            suggestedDifficulty = 'beginner';
        } else if (avgScore < 7.5) {
            suggestedDifficulty = 'intermediate';
        } else {
            suggestedDifficulty = 'advanced';
        }

        return {
            type: minPracticeType || 'essay',
            difficulty: suggestedDifficulty,
            reason: this.getRecommendationReason(minPracticeType, suggestedDifficulty, analysis),
            estimatedTime: this.getEstimatedTime(minPracticeType, suggestedDifficulty)
        };
    }

    /**
     * 识别技能重点
     */
    identifySkillFocus(analysis) {
        const focus = [];

        // 基于弱项识别
        if (analysis.weaknessAreas.length > 0) {
            analysis.weaknessAreas.forEach(weakness => {
                focus.push({
                    skill: weakness.skill,
                    priority: 'high',
                    currentLevel: weakness.score,
                    targetLevel: 7.0,
                    focusAreas: this.getSkillFocusAreas(weakness.skill)
                });
            });
        }

        // 基于时间管理
        if (analysis.timeManagement.efficiency < 0.7) {
            focus.push({
                skill: 'time_management',
                priority: 'medium',
                currentLevel: analysis.timeManagement.efficiency,
                targetLevel: 0.8,
                focusAreas: ['写作规划', '时间分配', '效率提升']
            });
        }

        // 基于一致性
        if (analysis.consistencyScore < 0.7) {
            focus.push({
                skill: 'consistency',
                priority: 'medium',
                currentLevel: analysis.consistencyScore,
                targetLevel: 0.8,
                focusAreas: ['稳定发挥', '质量控制', '标准化流程']
            });
        }

        return focus;
    }

    /**
     * 生成进度洞察
     */
    generateProgressInsights(progress) {
        const insights = [];
        const recentWritings = progress.recentWritings || [];
        const totalWritings = progress.totalWritings || 0;

        // 练习频率洞察
        if (totalWritings > 0) {
            const daysSinceFirst = this.calculateDaysSinceFirstWriting(recentWritings);
            const frequency = totalWritings / Math.max(daysSinceFirst, 1);
            
            if (frequency >= 1) {
                insights.push({
                    type: 'positive',
                    title: '练习频率很高',
                    description: `平均每天完成${frequency.toFixed(1)}篇写作，保持得很好！`,
                    icon: '🔥'
                });
            } else if (frequency >= 0.5) {
                insights.push({
                    type: 'neutral',
                    title: '练习频率适中',
                    description: '建议可以适当增加练习频率，每天至少一篇',
                    icon: '📈'
                });
            } else {
                insights.push({
                    type: 'suggestion',
                    title: '需要增加练习',
                    description: '建议建立每日写作习惯，持续练习是提高的关键',
                    icon: '💪'
                });
            }
        }

        // 进步洞察
        if (recentWritings.length >= 5) {
            const firstScore = recentWritings[recentWritings.length - 1].score;
            const latestScore = recentWritings[0].score;
            const improvement = latestScore - firstScore;

            if (improvement > 1.0) {
                insights.push({
                    type: 'positive',
                    title: '显著进步',
                    description: `写作水平提升了${improvement.toFixed(1)}分，继续保持！`,
                    icon: '🚀'
                });
            } else if (improvement > 0.3) {
                insights.push({
                    type: 'positive',
                    title: '稳步提升',
                    description: `写作水平在稳步提升，已进步${improvement.toFixed(1)}分`,
                    icon: '📊'
                });
            }
        }

        // 里程碑洞察
        if (totalWritings >= 50) {
            insights.push({
                type: 'achievement',
                title: '写作达人',
                description: `已完成${totalWritings}篇写作，是真正的写作达人！`,
                icon: '🏆'
            });
        } else if (totalWritings >= 20) {
            insights.push({
                type: 'achievement',
                title: '勤奋练习者',
                description: `已完成${totalWritings}篇写作，向50篇目标前进！`,
                icon: '🎯'
            });
        } else if (totalWritings >= 10) {
            insights.push({
                type: 'achievement',
                title: '初见成效',
                description: `已完成${totalWritings}篇写作，基础已经建立！`,
                icon: '🌱'
            });
        }

        return insights;
    }

    /**
     * 辅助方法：计算熟练度等级
     */
    calculateProficiencyLevel(averageScore) {
        if (averageScore >= 8.5) return 'expert';
        if (averageScore >= 7.5) return 'advanced';
        if (averageScore >= 6.5) return 'intermediate';
        if (averageScore >= 5.5) return 'beginner';
        return 'novice';
    }

    /**
     * 辅助方法：获取技能描述
     */
    getSkillDescription(type, category) {
        const descriptions = {
            essay: {
                strength: '议论文写作能力强，逻辑思维清晰',
                weakness: '议论文写作需要加强，特别是论证结构'
            },
            letter: {
                strength: '书信写作格式规范，语言得体',
                weakness: '书信写作格式和语调需要改进'
            },
            report: {
                strength: '报告写作条理清晰，数据分析准确',
                weakness: '报告写作的客观性和数据呈现需要提升'
            },
            email: {
                strength: '邮件写作简洁明了，商务语言专业',
                weakness: '邮件写作的正式性和结构需要完善'
            }
        };
        
        return descriptions[type]?.[category] || '需要更多练习';
    }

    /**
     * 辅助方法：计算时间效率
     */
    calculateTimeEfficiency(recentWritings) {
        if (recentWritings.length === 0) return 0;
        
        let totalEfficiency = 0;
        recentWritings.forEach(writing => {
            const expectedTime = writing.wordCount * 0.5; // 假设每词0.5分钟
            const actualTime = writing.timeSpent;
            const efficiency = Math.min(expectedTime / actualTime, 1);
            totalEfficiency += efficiency;
        });
        
        return totalEfficiency / recentWritings.length;
    }

    /**
     * 辅助方法：获取时间管理建议
     */
    getTimeManagementAdvice(avgTime) {
        if (avgTime > 60) {
            return '写作时间较长，建议提前做好大纲规划，提高写作效率';
        } else if (avgTime < 20) {
            return '写作时间较短，建议花更多时间思考和检查';
        } else {
            return '写作时间控制得当，继续保持';
        }
    }

    /**
     * 辅助方法：计算一致性评分
     */
    calculateConsistencyScore(recentWritings) {
        if (recentWritings.length < 3) return 0;
        
        const scores = recentWritings.map(w => w.score);
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        
        // 标准差越小，一致性越高
        return Math.max(0, 1 - standardDeviation / 3);
    }

    /**
     * 辅助方法：获取类型显示名称
     */
    getTypeDisplayName(type) {
        const names = {
            essay: '议论文',
            letter: '书信',
            report: '报告',
            email: '邮件'
        };
        return names[type] || type;
    }

    /**
     * 辅助方法：获取推荐原因
     */
    getRecommendationReason(type, difficulty, analysis) {
        const reasons = [];
        
        if (analysis.weaknessAreas.some(w => w.skill === type)) {
            reasons.push(`${this.getTypeDisplayName(type)}是您的薄弱环节`);
        }
        
        reasons.push(`${difficulty === 'beginner' ? '基础' : difficulty === 'intermediate' ? '中级' : '高级'}难度适合当前水平`);
        
        return reasons.join('，');
    }

    /**
     * 辅助方法：获取预估时间
     */
    getEstimatedTime(type, difficulty) {
        const baseTimes = {
            essay: { beginner: 25, intermediate: 35, advanced: 45 },
            letter: { beginner: 15, intermediate: 20, advanced: 25 },
            report: { beginner: 20, intermediate: 25, advanced: 35 },
            email: { beginner: 10, intermediate: 15, advanced: 20 }
        };
        
        return baseTimes[type]?.[difficulty] || 30;
    }

    /**
     * 辅助方法：获取技能重点领域
     */
    getSkillFocusAreas(skill) {
        const focusAreas = {
            essay: ['论证结构', '逻辑连贯', '观点表达', '例证使用'],
            letter: ['格式规范', '语调把握', '内容组织', '礼貌用语'],
            report: ['数据呈现', '客观分析', '结构清晰', '结论总结'],
            email: ['简洁明了', '专业语言', '格式标准', '行动导向']
        };
        
        return focusAreas[skill] || ['基础练习'];
    }

    /**
     * 辅助方法：计算距离首次写作的天数
     */
    calculateDaysSinceFirstWriting(recentWritings) {
        if (recentWritings.length === 0) return 0;
        
        const firstDate = new Date(recentWritings[recentWritings.length - 1].date);
        const now = new Date();
        const diffTime = Math.abs(now - firstDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    /**
     * 导出写作数据
     */
    exportWritingData(format = 'json') {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                progress: this.writingProgress,
                history: this.getWritingHistory(),
                config: this.config
            };

            let content, filename, mimeType;

            switch (format.toLowerCase()) {
                case 'json':
                    content = JSON.stringify(exportData, null, 2);
                    filename = `writing_data_${this.formatDateForFilename()}.json`;
                    mimeType = 'application/json';
                    break;
                
                case 'csv':
                    content = this.convertToCSV(exportData.history);
                    filename = `writing_history_${this.formatDateForFilename()}.csv`;
                    mimeType = 'text/csv';
                    break;
                
                case 'txt':
                    content = this.convertToText(exportData);
                    filename = `writing_report_${this.formatDateForFilename()}.txt`;
                    mimeType = 'text/plain';
                    break;
                
                default:
                    throw new Error('不支持的导出格式');
            }

            this.downloadFile(content, filename, mimeType);
            console.log(`✅ 写作数据已导出为 ${format.toUpperCase()} 格式`);
            return true;

        } catch (error) {
            console.error('导出写作数据失败:', error);
            return false;
        }
    }

    /**
     * 导入写作数据
     */
    importWritingData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const content = event.target.result;
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    
                    let importData;
                    
                    switch (fileExtension) {
                        case 'json':
                            importData = JSON.parse(content);
                            break;
                        
                        case 'csv':
                            importData = this.parseCSV(content);
                            break;
                        
                        default:
                            throw new Error('不支持的文件格式');
                    }
                    
                    const result = this.processImportData(importData);
                    resolve(result);
                    
                } catch (error) {
                    console.error('导入数据解析失败:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * 处理导入的数据
     */
    processImportData(importData) {
        try {
            const result = {
                success: false,
                imported: {
                    progress: false,
                    history: false,
                    config: false
                },
                errors: [],
                summary: {
                    totalWritings: 0,
                    newWritings: 0,
                    duplicates: 0
                }
            };

            // 验证数据格式
            if (!this.validateImportData(importData)) {
                throw new Error('导入数据格式不正确');
            }

            // 备份当前数据
            const backup = {
                progress: { ...this.writingProgress },
                history: this.getWritingHistory(),
                config: { ...this.config }
            };

            try {
                // 导入进度数据
                if (importData.progress) {
                    this.mergeProgressData(importData.progress);
                    result.imported.progress = true;
                }

                // 导入历史记录
                if (importData.history && Array.isArray(importData.history)) {
                    const historyResult = this.mergeHistoryData(importData.history);
                    result.imported.history = true;
                    result.summary.totalWritings = importData.history.length;
                    result.summary.newWritings = historyResult.newItems;
                    result.summary.duplicates = historyResult.duplicates;
                }

                // 导入配置（可选）
                if (importData.config && this.confirmConfigImport()) {
                    this.config = { ...this.config, ...importData.config };
                    result.imported.config = true;
                }

                result.success = true;
                console.log('✅ 写作数据导入成功');
                
            } catch (error) {
                // 恢复备份数据
                this.writingProgress = backup.progress;
                this.saveWritingProgress();
                
                const currentHistory = this.getWritingHistory();
                localStorage.setItem('writingHistory', JSON.stringify(backup.history));
                
                this.config = backup.config;
                
                throw error;
            }

            return result;

        } catch (error) {
            console.error('处理导入数据失败:', error);
            return {
                success: false,
                error: error.message,
                imported: { progress: false, history: false, config: false },
                summary: { totalWritings: 0, newWritings: 0, duplicates: 0 }
            };
        }
    }

    /**
     * 合并进度数据
     */
    mergeProgressData(importedProgress) {
        // 合并总体统计
        this.writingProgress.totalWritings += importedProgress.totalWritings || 0;
        this.writingProgress.totalWords += importedProgress.totalWords || 0;
        this.writingProgress.totalTime += importedProgress.totalTime || 0;

        // 重新计算平均分
        const currentTotal = this.writingProgress.totalWritings - (importedProgress.totalWritings || 0);
        const currentSum = this.writingProgress.averageScore * currentTotal;
        const importedSum = (importedProgress.averageScore || 0) * (importedProgress.totalWritings || 0);
        
        if (this.writingProgress.totalWritings > 0) {
            this.writingProgress.averageScore = (currentSum + importedSum) / this.writingProgress.totalWritings;
        }

        // 合并类型统计
        if (importedProgress.typeStats) {
            Object.keys(importedProgress.typeStats).forEach(type => {
                if (!this.writingProgress.typeStats[type]) {
                    this.writingProgress.typeStats[type] = { completed: 0, averageScore: 0, totalWords: 0 };
                }
                
                const current = this.writingProgress.typeStats[type];
                const imported = importedProgress.typeStats[type];
                
                const oldCompleted = current.completed;
                const oldSum = current.averageScore * oldCompleted;
                
                current.completed += imported.completed || 0;
                current.totalWords += imported.totalWords || 0;
                
                if (current.completed > 0) {
                    current.averageScore = (oldSum + (imported.averageScore || 0) * (imported.completed || 0)) / current.completed;
                }
            });
        }

        this.saveWritingProgress();
    }

    /**
     * 合并历史记录
     */
    mergeHistoryData(importedHistory) {
        const currentHistory = this.getWritingHistory();
        const existingIds = new Set(currentHistory.map(item => item.id));
        
        let newItems = 0;
        let duplicates = 0;
        
        const mergedHistory = [...currentHistory];
        
        importedHistory.forEach(item => {
            if (existingIds.has(item.id)) {
                duplicates++;
            } else {
                mergedHistory.push(item);
                newItems++;
            }
        });

        // 按日期排序并限制数量
        mergedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        const finalHistory = mergedHistory.slice(0, 100); // 保留最近100条记录

        localStorage.setItem('writingHistory', JSON.stringify(finalHistory));
        
        return { newItems, duplicates };
    }

    /**
     * 验证导入数据格式
     */
    validateImportData(data) {
        // 基本结构检查
        if (!data || typeof data !== 'object') {
            return false;
        }

        // 检查是否包含必要字段
        const hasValidProgress = !data.progress || (
            typeof data.progress === 'object' &&
            typeof data.progress.totalWritings === 'number'
        );

        const hasValidHistory = !data.history || Array.isArray(data.history);

        return hasValidProgress && hasValidHistory;
    }

    /**
     * 转换为CSV格式
     */
    convertToCSV(history) {
        if (!history || history.length === 0) {
            return 'No data available';
        }

        const headers = ['日期', '标题', '类型', '难度', '字数', '用时(分钟)', '总分', '内容分', '结构分', '语言分', '语法分'];
        const csvContent = [headers.join(',')];

        history.forEach(item => {
            const row = [
                new Date(item.date).toLocaleDateString('zh-CN'),
                `"${item.topic?.title || '未知题目'}"`,
                item.topic?.type || '未知',
                item.topic?.difficulty || '未知',
                item.wordCount || 0,
                Math.round((item.timeSpent || 0) / 1000 / 60),
                item.score?.total || item.score?.overall || 0,
                item.score?.breakdown?.content || 0,
                item.score?.breakdown?.organization || 0,
                item.score?.breakdown?.language || 0,
                item.score?.breakdown?.mechanics || 0
            ];
            csvContent.push(row.join(','));
        });

        return csvContent.join('\n');
    }

    /**
     * 转换为文本格式
     */
    convertToText(exportData) {
        const lines = [];
        const progress = exportData.progress;
        const history = exportData.history;

        lines.push('='.repeat(50));
        lines.push('写作练习数据报告');
        lines.push('='.repeat(50));
        lines.push(`导出时间: ${new Date(exportData.exportDate).toLocaleString('zh-CN')}`);
        lines.push('');

        // 总体统计
        lines.push('📊 总体统计');
        lines.push('-'.repeat(30));
        lines.push(`总写作数量: ${progress.totalWritings || 0}篇`);
        lines.push(`平均分数: ${(progress.averageScore || 0).toFixed(1)}分`);
        lines.push(`总字数: ${progress.totalWords || 0}字`);
        lines.push(`总用时: ${progress.totalTime || 0}分钟`);
        lines.push('');

        // 各类型统计
        if (progress.typeStats) {
            lines.push('📝 各类型表现');
            lines.push('-'.repeat(30));
            Object.keys(progress.typeStats).forEach(type => {
                const stats = progress.typeStats[type];
                if (stats.completed > 0) {
                    lines.push(`${this.getTypeDisplayName(type)}: ${stats.completed}篇, 平均${stats.averageScore.toFixed(1)}分`);
                }
            });
            lines.push('');
        }

        // 最近写作记录
        if (history && history.length > 0) {
            lines.push('📋 最近写作记录');
            lines.push('-'.repeat(30));
            history.slice(0, 10).forEach((item, index) => {
                lines.push(`${index + 1}. ${item.topic?.title || '未知题目'}`);
                lines.push(`   日期: ${new Date(item.date).toLocaleDateString('zh-CN')}`);
                lines.push(`   分数: ${item.score?.total || item.score?.overall || 0}分`);
                lines.push(`   字数: ${item.wordCount || 0}字`);
                lines.push('');
            });
        }

        return lines.join('\n');
    }

    /**
     * 解析CSV数据
     */
    parseCSV(csvContent) {
        // 简化的CSV解析，实际应用中可能需要更复杂的解析逻辑
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const item = {};
                headers.forEach((header, index) => {
                    item[header.trim()] = values[index]?.trim() || '';
                });
                data.push(item);
            }
        }

        return { history: data };
    }

    /**
     * 下载文件
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * 格式化日期用于文件名
     */
    formatDateForFilename() {
        const now = new Date();
        return now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
    }

    /**
     * 确认配置导入
     */
    confirmConfigImport() {
        return confirm('是否要导入写作配置设置？这将覆盖当前的配置。');
    }

    /**
     * 导出写作作品（单篇）
     */
    exportSingleWriting(writingId, format = 'txt') {
        try {
            const history = this.getWritingHistory();
            const writing = history.find(item => item.id === writingId);
            
            if (!writing) {
                throw new Error('未找到指定的写作作品');
            }

            let content, filename, mimeType;

            switch (format.toLowerCase()) {
                case 'txt':
                    content = this.formatSingleWritingAsText(writing);
                    filename = `writing_${writing.topic?.title || 'untitled'}_${this.formatDateForFilename()}.txt`;
                    mimeType = 'text/plain';
                    break;
                
                case 'md':
                    content = this.formatSingleWritingAsMarkdown(writing);
                    filename = `writing_${writing.topic?.title || 'untitled'}_${this.formatDateForFilename()}.md`;
                    mimeType = 'text/markdown';
                    break;
                
                case 'json':
                    content = JSON.stringify(writing, null, 2);
                    filename = `writing_${writing.topic?.title || 'untitled'}_${this.formatDateForFilename()}.json`;
                    mimeType = 'application/json';
                    break;
                
                default:
                    throw new Error('不支持的导出格式');
            }

            this.downloadFile(content, filename, mimeType);
            console.log(`✅ 写作作品已导出为 ${format.toUpperCase()} 格式`);
            return true;

        } catch (error) {
            console.error('导出写作作品失败:', error);
            return false;
        }
    }

    /**
     * 格式化单篇写作为文本
     */
    formatSingleWritingAsText(writing) {
        const lines = [];
        
        lines.push('='.repeat(50));
        lines.push(writing.topic?.title || '写作作品');
        lines.push('='.repeat(50));
        lines.push(`写作时间: ${new Date(writing.date).toLocaleString('zh-CN')}`);
        lines.push(`写作类型: ${this.getTypeDisplayName(writing.topic?.type || 'unknown')}`);
        lines.push(`难度等级: ${writing.topic?.difficulty || '未知'}`);
        lines.push(`字数统计: ${writing.wordCount || 0}字`);
        lines.push(`用时: ${Math.round((writing.timeSpent || 0) / 1000 / 60)}分钟`);
        lines.push(`总分: ${writing.score?.total || writing.score?.overall || 0}分`);
        lines.push('');
        
        if (writing.topic?.prompt) {
            lines.push('📝 题目要求');
            lines.push('-'.repeat(30));
            lines.push(writing.topic.prompt);
            lines.push('');
        }
        
        lines.push('✍️ 写作内容');
        lines.push('-'.repeat(30));
        lines.push(writing.content || '无内容');
        lines.push('');
        
        if (writing.score?.breakdown) {
            lines.push('📊 评分详情');
            lines.push('-'.repeat(30));
            lines.push(`内容质量: ${writing.score.breakdown.content || 0}分`);
            lines.push(`结构组织: ${writing.score.breakdown.organization || 0}分`);
            lines.push(`语言运用: ${writing.score.breakdown.language || 0}分`);
            lines.push(`语法机制: ${writing.score.breakdown.mechanics || 0}分`);
            lines.push('');
        }
        
        if (writing.feedback) {
            lines.push('💬 评价反馈');
            lines.push('-'.repeat(30));
            lines.push(writing.feedback.overall || '无反馈');
            lines.push('');
        }
        
        return lines.join('\n');
    }

    /**
     * 格式化单篇写作为Markdown
     */
    formatSingleWritingAsMarkdown(writing) {
        const lines = [];
        
        lines.push(`# ${writing.topic?.title || '写作作品'}`);
        lines.push('');
        lines.push('## 基本信息');
        lines.push('');
        lines.push(`- **写作时间**: ${new Date(writing.date).toLocaleString('zh-CN')}`);
        lines.push(`- **写作类型**: ${this.getTypeDisplayName(writing.topic?.type || 'unknown')}`);
        lines.push(`- **难度等级**: ${writing.topic?.difficulty || '未知'}`);
        lines.push(`- **字数统计**: ${writing.wordCount || 0}字`);
        lines.push(`- **用时**: ${Math.round((writing.timeSpent || 0) / 1000 / 60)}分钟`);
        lines.push(`- **总分**: ${writing.score?.total || writing.score?.overall || 0}分`);
        lines.push('');
        
        if (writing.topic?.prompt) {
            lines.push('## 题目要求');
            lines.push('');
            lines.push(writing.topic.prompt);
            lines.push('');
        }
        
        lines.push('## 写作内容');
        lines.push('');
        lines.push(writing.content || '无内容');
        lines.push('');
        
        if (writing.score?.breakdown) {
            lines.push('## 评分详情');
            lines.push('');
            lines.push(`- **内容质量**: ${writing.score.breakdown.content || 0}分`);
            lines.push(`- **结构组织**: ${writing.score.breakdown.organization || 0}分`);
            lines.push(`- **语言运用**: ${writing.score.breakdown.language || 0}分`);
            lines.push(`- **语法机制**: ${writing.score.breakdown.mechanics || 0}分`);
            lines.push('');
        }
        
        if (writing.feedback) {
            lines.push('## 评价反馈');
            lines.push('');
            lines.push(writing.feedback.overall || '无反馈');
            lines.push('');
        }
        
        return lines.join('\n');
    }

    /**
     * 计算写作连击天数
     */
    calculateWritingStreak() {
        const recentWritings = this.writingProgress.recentWritings || [];
        if (recentWritings.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) { // 检查最近30天
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = checkDate.toDateString();
            
            const hasWriting = recentWritings.some(w => 
                new Date(w.timestamp).toDateString() === dateStr
            );
            
            if (hasWriting) {
                streak++;
            } else if (i > 0) { // 如果不是今天且没有写作记录，则中断连击
                break;
            }
        }
        
        return streak;
    }

    /**
     * 重置写作进度数据
     */
    resetProgress() {
        this.writingProgress = {
            totalWritings: 0,
            totalWords: 0,
            averageScore: 0,
            totalTime: 0,
            typeStats: {
                essay: { completed: 0, averageScore: 0, totalWords: 0 },
                letter: { completed: 0, averageScore: 0, totalWords: 0 },
                report: { completed: 0, averageScore: 0, totalWords: 0 },
                email: { completed: 0, averageScore: 0, totalWords: 0 }
            },
            recentWritings: []
        };
        
        localStorage.removeItem('writingProgress');
        console.log('✅ 写作练习进度已重置');
        return true;
    }
}

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('writing')) {
        window.writingManager = new WritingManager();
        console.log('✅ 写作练习管理器已全局初始化');
    }
});
