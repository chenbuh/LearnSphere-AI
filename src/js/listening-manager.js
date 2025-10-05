/**
 * 听力训练管理器
 * 提供听力练习、音频播放、进度跟踪等功能
 */

class ListeningManager {
    constructor() {
        this.currentCategory = null;
        this.currentSkill = null;
        this.currentDifficulty = 'basic';
        this.playbackSpeed = 1.0;
        this.repeatCount = 1;
        this.practiceSession = null;
        this.audioPlayer = null;
        this.userProgress = {};
        this.listeningContent = {};
        this.init();
    }

    async init() {
        window.logger?.info('初始化听力训练管理器...');
        
        try {
            // 初始化听力内容数据库
            this.initializeListeningDatabase();
            
            // 初始化音频播放器
            this.initializeAudioPlayer();
            
            // 加载用户进度
            await this.loadUserProgress();
            
            // 初始化难度自适应系统
            this.initializeAdaptiveDifficulty();
            
            window.logger?.info('听力训练管理器初始化完成');
        } catch (error) {
            window.logger?.error('听力训练管理器初始化失败:', error);
        }
    }

    /**
     * 初始化听力内容数据库
     */
    initializeListeningDatabase() {
        this.listeningContent = {
            conversation: [
                {
                    id: 'conv_001',
                    title: '购物场景对话',
                    audioUrl: '/assets/audio/conversation/shopping.mp3',
                    duration: 120, // 秒
                    difficulty: 'basic',
                    transcript: 'A: Can I help you?\nB: Yes, I\'m looking for a birthday gift for my sister...',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What is the person looking for?',
                            options: ['A birthday gift', 'A shopping bag', 'A sister', 'Help'],
                            correct: 0,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'Who is the gift for?',
                            options: ['His brother', 'Her sister', 'His friend', 'Her mother'],
                            correct: 1,
                            skill: 'details'
                        }
                    ],
                    category: 'conversation',
                    tags: ['shopping', 'daily_life', 'basic']
                },
                {
                    id: 'conv_002',
                    title: '餐厅订餐对话',
                    audioUrl: '/assets/audio/conversation/restaurant.mp3',
                    duration: 90,
                    difficulty: 'basic',
                    transcript: 'A: Good evening. Table for two?\nB: Yes, please. We have a reservation under Johnson.\nA: Let me check... Yes, Mr. Johnson, table for two at 7:30. Right this way, please.\nB: Thank you. Could we have a table by the window?\nA: I\'m sorry, those are all taken. But I have a nice quiet table in the corner.\nB: That sounds good.',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'How many people need a table?',
                            options: ['One', 'Two', 'Three', 'Four'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'What name is the reservation under?',
                            options: ['Jackson', 'Johnson', 'Jones', 'Jensen'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'Where do the customers want to sit?',
                            options: ['By the bar', 'By the window', 'In the corner', 'Near the kitchen'],
                            correct: 1,
                            skill: 'details'
                        }
                    ],
                    category: 'conversation',
                    tags: ['restaurant', 'reservation', 'basic']
                },
                {
                    id: 'conv_003',
                    title: '机场办理登机手续',
                    audioUrl: '/assets/audio/conversation/airport.mp3',
                    duration: 150,
                    difficulty: 'intermediate',
                    transcript: 'A: Good morning. I\'d like to check in for the flight to London.\nB: Certainly. May I see your passport and ticket, please?\nA: Here they are.\nB: Thank you. Are you checking any bags today?\nA: Yes, I have one suitcase.\nB: Please place it on the scale... That\'s 23 kilograms. Perfect. Would you prefer an aisle or window seat?\nA: Window seat, please.\nB: Here\'s your boarding pass. Your gate is B12, and boarding begins at 2:30. Have a nice flight!',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'Where is the passenger traveling to?',
                            options: ['Paris', 'London', 'Berlin', 'Madrid'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'How heavy is the passenger\'s suitcase?',
                            options: ['22 kg', '23 kg', '24 kg', '25 kg'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'What type of seat does the passenger prefer?',
                            options: ['Aisle seat', 'Window seat', 'Middle seat', 'Emergency exit'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'When does boarding begin?',
                            options: ['2:00', '2:15', '2:30', '2:45'],
                            correct: 2,
                            skill: 'details'
                        }
                    ],
                    category: 'conversation',
                    tags: ['airport', 'travel', 'check-in', 'intermediate']
                },
                {
                    id: 'conv_004',
                    title: '银行开户咨询',
                    audioUrl: '/assets/audio/conversation/bank.mp3',
                    duration: 180,
                    difficulty: 'intermediate',
                    transcript: 'A: Good afternoon. I\'d like to open a savings account.\nB: Of course! I\'d be happy to help you with that. Do you have any identification with you?\nA: Yes, here\'s my driver\'s license and passport.\nB: Perfect. What type of savings account are you interested in? We have a basic savings account with a low minimum balance, and a high-yield account that requires a higher minimum balance.\nA: What\'s the difference in interest rates?\nB: The basic account offers 0.5% annual interest, while the high-yield account offers 2.1% but requires a minimum balance of $10,000.\nA: I think I\'ll go with the basic account for now.',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What does the customer want to do?',
                            options: ['Close an account', 'Open a savings account', 'Apply for a loan', 'Exchange currency'],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'What identification does the customer provide?',
                            options: ['Only passport', 'Only driver\'s license', 'Both passport and driver\'s license', 'Student ID'],
                            correct: 2,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'What is the interest rate for the basic savings account?',
                            options: ['0.5%', '1.0%', '2.1%', '2.5%'],
                            correct: 0,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'Which account does the customer choose?',
                            options: ['High-yield account', 'Basic account', 'Checking account', 'Certificate of deposit'],
                            correct: 1,
                            skill: 'details'
                        }
                    ],
                    category: 'conversation',
                    tags: ['banking', 'finance', 'account', 'intermediate']
                },
                {
                    id: 'conv_005',
                    title: '医生预约对话',
                    audioUrl: '/assets/audio/conversation/doctor.mp3',
                    duration: 120,
                    difficulty: 'basic',
                    transcript: 'A: Good morning, City Medical Center.\nB: Hi, I\'d like to make an appointment with Dr. Smith.\nA: Certainly. What\'s the nature of your visit?\nB: I\'ve been having headaches for the past week.\nA: I see. Dr. Smith has an opening this Thursday at 2 PM or Friday at 10 AM. Which would work better for you?\nB: Thursday at 2 PM would be perfect.\nA: Great! May I have your name and phone number?\nB: It\'s Sarah Johnson, and my number is 555-0123.\nA: Perfect. We\'ll see you Thursday at 2 PM.',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What is the patient\'s problem?',
                            options: ['Back pain', 'Headaches', 'Fever', 'Cough'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'How long has the patient had this problem?',
                            options: ['A few days', 'A week', 'Two weeks', 'A month'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'When is the appointment scheduled?',
                            options: ['Thursday at 2 PM', 'Friday at 10 AM', 'Thursday at 10 AM', 'Friday at 2 PM'],
                            correct: 0,
                            skill: 'details'
                        }
                    ],
                    category: 'conversation',
                    tags: ['medical', 'appointment', 'health', 'basic']
                },
                {
                    id: 'conv_006',
                    title: '房屋租赁咨询',
                    audioUrl: '/assets/audio/conversation/rental.mp3',
                    duration: 200,
                    difficulty: 'intermediate',
                    transcript: 'A: Hello, I\'m calling about the apartment listing on Oak Street.\nB: Yes, the two-bedroom apartment. Are you interested in viewing it?\nA: Definitely. What\'s the monthly rent?\nB: It\'s $1,200 per month, plus utilities. The apartment comes with parking and laundry facilities.\nA: That sounds reasonable. Is it available immediately?\nB: Yes, it is. The previous tenant moved out last week. When would you like to see it?\nA: How about tomorrow afternoon?\nB: Perfect. Let\'s say 3 PM. I\'ll meet you at the property. By the way, do you have references?\nA: Yes, I can provide references from my previous landlord and my employer.',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What type of apartment is being discussed?',
                            options: ['One-bedroom', 'Two-bedroom', 'Three-bedroom', 'Studio'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'How much is the monthly rent?',
                            options: ['$1,100', '$1,200', '$1,300', '$1,400'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'true_false',
                            question: 'Utilities are included in the rent.',
                            answer: false,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'What amenities are mentioned?',
                            options: ['Only parking', 'Only laundry', 'Parking and laundry', 'Gym and pool'],
                            correct: 2,
                            skill: 'details'
                        }
                    ],
                    category: 'conversation',
                    tags: ['housing', 'rental', 'apartment', 'intermediate']
                },
                {
                    id: 'conv_007',
                    title: '大学课程注册',
                    audioUrl: '/assets/audio/conversation/university.mp3',
                    duration: 160,
                    difficulty: 'intermediate',
                    transcript: 'A: Hi, I need help with course registration for next semester.\nB: Of course! What\'s your major?\nA: I\'m studying Computer Science.\nB: Great. Have you completed all your prerequisite courses?\nA: Yes, I finished Calculus II and Programming Fundamentals last semester.\nB: Perfect. For your junior year, I recommend taking Data Structures, Database Systems, and maybe an elective. What are you interested in?\nA: I\'m really interested in artificial intelligence.\nB: Excellent! Professor Chen\'s AI course is very popular. It\'s on Tuesdays and Thursdays from 2 to 3:30 PM. There are still a few spots available.\nA: That sounds perfect. Can you register me for all three courses?',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What is the student\'s major?',
                            options: ['Mathematics', 'Computer Science', 'Engineering', 'Physics'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'Which courses has the student already completed?',
                            options: ['Calculus I and II', 'Calculus II and Programming', 'Programming and Database', 'Data Structures and AI'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'When does the AI course meet?',
                            options: ['Monday and Wednesday', 'Tuesday and Thursday', 'Wednesday and Friday', 'Monday and Friday'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'What time is the AI course?',
                            options: ['1 to 2:30 PM', '2 to 3:30 PM', '3 to 4:30 PM', '2:30 to 4 PM'],
                            correct: 1,
                            skill: 'details'
                        }
                    ],
                    category: 'conversation',
                    tags: ['education', 'university', 'course_registration', 'intermediate']
                },
                {
                    id: 'conv_008',
                    title: '工作面试对话',
                    audioUrl: '/assets/audio/conversation/job_interview.mp3',
                    duration: 240,
                    difficulty: 'advanced',
                    transcript: 'A: Good morning, Ms. Anderson. Thank you for coming in today.\nB: Good morning! Thank you for the opportunity to interview for the marketing coordinator position.\nA: Let\'s start with your background. Can you tell me about your previous experience in marketing?\nB: Certainly. I worked at Digital Solutions for three years as a marketing assistant, where I managed social media campaigns and helped increase our online engagement by 40%. Before that, I completed an internship at a local advertising agency.\nA: That\'s impressive. What interests you most about this position?\nB: I\'m excited about the opportunity to work with a larger team and take on more strategic responsibilities. Your company\'s innovative approach to digital marketing really appeals to me.\nA: What do you consider your greatest strength?\nB: I\'d say my ability to analyze data and translate insights into actionable marketing strategies. I\'m also very collaborative and enjoy working in team environments.',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What position is Ms. Anderson interviewing for?',
                            options: ['Marketing Assistant', 'Marketing Coordinator', 'Marketing Manager', 'Marketing Director'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'How long did Ms. Anderson work at Digital Solutions?',
                            options: ['Two years', 'Three years', 'Four years', 'Five years'],
                            correct: 1,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'By how much did she help increase online engagement?',
                            options: ['30%', '35%', '40%', '45%'],
                            correct: 2,
                            skill: 'details'
                        },
                        {
                            type: 'multiple_choice',
                            question: 'What does Ms. Anderson consider her greatest strength?',
                            options: ['Leadership skills', 'Creative thinking', 'Data analysis and strategy', 'Public speaking'],
                            correct: 2,
                            skill: 'details'
                        }
                    ],
                    category: 'conversation',
                    tags: ['job_interview', 'career', 'professional', 'advanced']
                }
            ],
            lecture: [
                {
                    id: 'lect_001',
                    title: '环境保护讲座',
                    audioUrl: '/assets/audio/lecture/environment.mp3',
                    duration: 300,
                    difficulty: 'intermediate',
                    transcript: 'Today we\'ll discuss the impact of climate change on global ecosystems...',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What is the main topic of the lecture?',
                            options: ['Global warming', 'Climate change impact', 'Ecosystem protection', 'Environmental policy'],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            type: 'true_false',
                            question: 'The lecturer mentions specific examples of climate change effects.',
                            answer: true,
                            skill: 'details'
                        }
                    ],
                    category: 'lecture',
                    tags: ['environment', 'climate', 'academic']
                }
            ],
            news: [
                {
                    id: 'news_001',
                    title: '科技新闻报道',
                    audioUrl: '/assets/audio/news/technology.mp3',
                    duration: 180,
                    difficulty: 'intermediate',
                    transcript: 'In today\'s tech news, a breakthrough in artificial intelligence...',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What type of news is this?',
                            options: ['Sports news', 'Weather report', 'Technology news', 'Politics'],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ],
                    category: 'news',
                    tags: ['technology', 'AI', 'current_events']
                }
            ],
            interview: [
                {
                    id: 'int_001',
                    title: '名人专访',
                    audioUrl: '/assets/audio/interview/celebrity.mp3',
                    duration: 240,
                    difficulty: 'advanced',
                    transcript: 'Interviewer: Thank you for joining us today...',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'What can you infer about the interviewee\'s attitude?',
                            options: ['Nervous', 'Confident', 'Angry', 'Sad'],
                            correct: 1,
                            skill: 'attitude'
                        }
                    ],
                    category: 'interview',
                    tags: ['celebrity', 'media', 'advanced']
                }
            ],
            monologue: [
                {
                    id: 'mono_001',
                    title: '旅游景点介绍',
                    audioUrl: '/assets/audio/monologue/travel.mp3',
                    duration: 150,
                    difficulty: 'basic',
                    transcript: 'Welcome to the Grand Canyon, one of the most spectacular...',
                    questions: [
                        {
                            type: 'multiple_choice',
                            question: 'Where is this speech taking place?',
                            options: ['Museum', 'Grand Canyon', 'Travel agency', 'Hotel'],
                            correct: 1,
                            skill: 'inference'
                        }
                    ],
                    category: 'monologue',
                    tags: ['travel', 'tourism', 'geography']
                }
            ]
        };

        window.logger?.info('听力内容数据库已初始化，共', this.getTotalContentCount(), '段音频');
    }

    /**
     * 初始化难度自适应系统
     */
    initializeAdaptiveDifficulty() {
        this.adaptiveSystem = {
            enabled: true,
            performanceHistory: [],
            difficultyAdjustmentThreshold: 3, // 连续3次练习后调整难度
            accuracyThresholds: {
                increase: 85, // 准确率超过85%提升难度
                decrease: 60  // 准确率低于60%降低难度
            },
            difficultyLevels: ['basic', 'intermediate', 'advanced'],
            currentLevel: 'basic'
        };
        
        window.logger?.info('难度自适应系统已初始化');
    }

    /**
     * 初始化音频播放器
     */
    initializeAudioPlayer() {
        this.audioPlayer = {
            audio: new Audio(),
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 1.0,
            playbackRate: 1.0,
            playCount: 0,
            maxPlayCount: 1
        };

        // 绑定音频事件
        this.audioPlayer.audio.addEventListener('loadedmetadata', () => {
            this.audioPlayer.duration = this.audioPlayer.audio.duration;
            this.onAudioLoadedMetadata();
        });

        this.audioPlayer.audio.addEventListener('timeupdate', () => {
            this.audioPlayer.currentTime = this.audioPlayer.audio.currentTime;
            this.onAudioTimeUpdate();
        });

        this.audioPlayer.audio.addEventListener('ended', () => {
            this.onAudioEnded();
        });

        this.audioPlayer.audio.addEventListener('play', () => {
            this.audioPlayer.isPlaying = true;
            this.onAudioPlay();
        });

        this.audioPlayer.audio.addEventListener('pause', () => {
            this.audioPlayer.isPlaying = false;
            this.onAudioPause();
        });

        window.logger?.info('音频播放器已初始化');
    }

    /**
     * 获取内容总数
     */
    getTotalContentCount() {
        let total = 0;
        Object.values(this.listeningContent).forEach(category => {
            total += category.length;
        });
        return total;
    }

    /**
     * 加载用户进度
     */
    async loadUserProgress() {
        try {
            const defaultProgress = {
                conversation: { completed: 0, total: 24, accuracy: 0, totalTime: 0 },
                lecture: { completed: 0, total: 18, accuracy: 0, totalTime: 0 },
                news: { completed: 0, total: 20, accuracy: 0, totalTime: 0 },
                interview: { completed: 0, total: 16, accuracy: 0, totalTime: 0 },
                monologue: { completed: 0, total: 12, accuracy: 0, totalTime: 0 },
                skills: {
                    main_idea: { correct: 0, total: 0, accuracy: 0 },
                    details: { correct: 0, total: 0, accuracy: 0 },
                    inference: { correct: 0, total: 0, accuracy: 0 },
                    attitude: { correct: 0, total: 0, accuracy: 0 }
                },
                totalPracticeTime: 0,
                streakDays: 0,
                lastPracticeDate: null,
                overallAccuracy: 0
            };

            this.userProgress = await Storage.get('listening_progress', defaultProgress) || defaultProgress;
            
            // 从用户进度中恢复自适应难度设置
            if (this.userProgress.adaptiveLevel) {
                this.adaptiveSystem.currentLevel = this.userProgress.adaptiveLevel;
            }
            
            window.logger?.info('听力学习进度已加载');
        } catch (error) {
            window.logger?.error('加载听力进度失败:', error);
        }
    }

    /**
     * 保存用户进度
     */
    async saveUserProgress() {
        try {
            // 保存当前自适应难度等级
            this.userProgress.adaptiveLevel = this.adaptiveSystem.currentLevel;
            
            await Storage.set('listening_progress', this.userProgress);
            window.logger?.debug('听力进度已保存');
        } catch (error) {
            window.logger?.error('保存听力进度失败:', error);
        }
    }

    /**
     * 根据条件获取听力内容（智能推荐）
     */
    getListeningContent(category = null, difficulty = null, skill = null, count = 5) {
        let contents = [];

        if (category === 'mixed' || !category) {
            // 混合模式：从所有类别中选择
            contents = Object.values(this.listeningContent).flat();
        } else {
            contents = this.listeningContent[category] || [];
        }

        // 如果启用自适应难度且没有指定难度，使用推荐难度
        if (this.adaptiveSystem.enabled && !difficulty) {
            difficulty = this.getRecommendedDifficulty();
        }

        // 筛选难度
        if (difficulty && difficulty !== 'all') {
            contents = contents.filter(content => content.difficulty === difficulty);
        }

        // 筛选技能（根据题目中的技能标签）
        if (skill) {
            contents = contents.filter(content => 
                content.questions.some(q => q.skill === skill)
            );
        }

        // 智能内容选择
        contents = this.intelligentContentSelection(contents, count);
        
        return contents.slice(0, count);
    }

    /**
     * 智能内容选择
     */
    intelligentContentSelection(contents, count) {
        if (contents.length <= count) {
            return this.shuffleArray([...contents]);
        }

        // 获取用户已完成的内容
        const completedContentIds = this.getCompletedContentIds();
        const errorContentIds = this.getErrorProneContentIds();

        // 分类内容
        const reviewContents = []; // 需要复习的错误内容
        const newContents = []; // 新内容
        const completedContents = []; // 已完成的内容

        contents.forEach(content => {
            if (errorContentIds.includes(content.id)) {
                reviewContents.push(content);
            } else if (completedContentIds.includes(content.id)) {
                completedContents.push(content);
            } else {
                newContents.push(content);
            }
        });

        // 智能分配：30%复习错误内容，60%新内容，10%已完成内容（巩固）
        const reviewCount = Math.min(Math.floor(count * 0.3), reviewContents.length);
        const newCount = Math.min(Math.floor(count * 0.6), newContents.length);
        const completedCount = count - reviewCount - newCount;

        const selectedContents = [
            ...this.shuffleArray(reviewContents).slice(0, reviewCount),
            ...this.shuffleArray(newContents).slice(0, newCount),
            ...this.shuffleArray(completedContents).slice(0, completedCount)
        ];

        // 如果内容不够，从剩余内容中补充
        if (selectedContents.length < count) {
            const remaining = contents.filter(c => !selectedContents.includes(c));
            selectedContents.push(...this.shuffleArray(remaining).slice(0, count - selectedContents.length));
        }

        return this.shuffleArray(selectedContents);
    }

    /**
     * 获取推荐难度
     */
    getRecommendedDifficulty() {
        // 基于用户历史表现推荐难度
        const recentPerformance = this.getRecentPerformance();
        
        if (recentPerformance.length === 0) {
            return 'basic'; // 新用户从基础开始
        }

        const avgAccuracy = recentPerformance.reduce((sum, p) => sum + p.accuracy, 0) / recentPerformance.length;
        
        if (avgAccuracy >= this.adaptiveSystem.accuracyThresholds.increase) {
            // 表现优秀，可以提升难度
            const currentIndex = this.adaptiveSystem.difficultyLevels.indexOf(this.adaptiveSystem.currentLevel);
            if (currentIndex < this.adaptiveSystem.difficultyLevels.length - 1) {
                this.adaptiveSystem.currentLevel = this.adaptiveSystem.difficultyLevels[currentIndex + 1];
                window.logger?.info(`难度自动提升至: ${this.adaptiveSystem.currentLevel}`);
            }
        } else if (avgAccuracy < this.adaptiveSystem.accuracyThresholds.decrease) {
            // 表现较差，降低难度
            const currentIndex = this.adaptiveSystem.difficultyLevels.indexOf(this.adaptiveSystem.currentLevel);
            if (currentIndex > 0) {
                this.adaptiveSystem.currentLevel = this.adaptiveSystem.difficultyLevels[currentIndex - 1];
                window.logger?.info(`难度自动降低至: ${this.adaptiveSystem.currentLevel}`);
            }
        }

        return this.adaptiveSystem.currentLevel;
    }

    /**
     * 获取近期表现
     */
    getRecentPerformance() {
        return this.adaptiveSystem.performanceHistory.slice(-this.adaptiveSystem.difficultyAdjustmentThreshold);
    }

    /**
     * 获取已完成内容ID列表
     */
    getCompletedContentIds() {
        // 从用户进度中获取已完成的内容ID
        return this.userProgress.completedContents || [];
    }

    /**
     * 获取错误率高的内容ID列表
     */
    getErrorProneContentIds() {
        // 从用户进度中获取错误率高的内容ID
        return this.userProgress.errorProneContents || [];
    }

    /**
     * 数组洗牌算法
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 开始听力练习
     */
    startPractice(options = {}) {
        const {
            category = this.currentCategory,
            skill = this.currentSkill,
            difficulty = this.currentDifficulty,
            speed = this.playbackSpeed,
            repeat = this.repeatCount
        } = options;

        // 验证参数
        if (!category) {
            throw new Error('请选择听力类别');
        }

        const contents = this.getListeningContent(category, difficulty, skill, 5);

        if (contents.length === 0) {
            throw new Error('没有找到符合条件的听力内容');
        }

        // 为每个内容添加额外信息
        const enhancedContents = contents.map((content, index) => ({
            ...content,
            contentIndex: index + 1,
            totalContents: contents.length,
            startTime: null,
            endTime: null,
            playCount: 0,
            totalPlayTime: 0,
            userAnswers: [],
            isCompleted: false
        }));

        this.practiceSession = {
            id: `listening_${Date.now()}`,
            category,
            skill,
            difficulty: difficulty || this.getRecommendedDifficulty(),
            speed,
            repeat,
            contents: enhancedContents,
            currentIndex: 0,
            answers: [],
            startTime: Date.now(),
            currentContent: null,
            hasPlayedAudio: false,
            totalScore: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            analysis: {
                strengths: [],
                weaknesses: [],
                recommendations: []
            }
        };

        // 设置音频播放参数
        this.audioPlayer.playbackRate = speed;
        this.audioPlayer.maxPlayCount = repeat === 3 ? Infinity : repeat;
        this.audioPlayer.playCount = 0;

        window.logger?.info(`开始听力练习: ${category || 'mixed'} - ${this.practiceSession.difficulty} - 技能: ${skill || 'all'}`);
        window.logger?.info(`内容数量: ${contents.length}`);

        return this.practiceSession;
    }

    /**
     * 获取当前听力内容
     */
    getCurrentContent() {
        if (!this.practiceSession) {
            return null;
        }

        const { contents, currentIndex } = this.practiceSession;
        return currentIndex < contents.length ? contents[currentIndex] : null;
    }

    /**
     * 加载音频
     */
    async loadAudio(content) {
        return new Promise((resolve, reject) => {
            if (!content || !content.audioUrl) {
                reject(new Error('无效的音频内容'));
                return;
            }

            this.audioPlayer.audio.src = content.audioUrl;
            this.audioPlayer.audio.playbackRate = this.practiceSession.speed;
            this.audioPlayer.playCount = 0;

            this.practiceSession.currentContent = content;
            this.practiceSession.hasPlayedAudio = false;

            // 模拟音频加载（实际项目中应该有真实的音频文件）
            setTimeout(() => {
                this.audioPlayer.duration = content.duration;
                this.onAudioLoadedMetadata();
                resolve();
            }, 500);
        });
    }

    /**
     * 播放音频
     */
    async playAudio() {
        if (!this.practiceSession.currentContent) {
            throw new Error('没有加载的音频内容');
        }

        if (this.audioPlayer.playCount >= this.audioPlayer.maxPlayCount) {
            throw new Error('已达到最大播放次数');
        }

        try {
            this.audioPlayer.playCount++;
            this.practiceSession.hasPlayedAudio = true;
            
            // 使用文本转语音播放音频内容
            const success = await this.playTextToSpeech();
            
            if (success) {
                window.logger?.info(`开始播放音频: ${this.practiceSession.currentContent.title} (第${this.audioPlayer.playCount}次)`);
            } else {
                // 如果TTS失败，则模拟播放
                this.simulateAudioPlayback();
            }
        } catch (error) {
            window.logger?.error('播放音频失败:', error);
            // 降级为模拟播放
            this.simulateAudioPlayback();
        }
    }

    /**
     * 使用文本转语音播放内容
     */
    async playTextToSpeech() {
        return new Promise((resolve) => {
            // 检查浏览器是否支持Web Speech API
            if (!window.speechSynthesis) {
                window.logger?.warn('浏览器不支持语音合成');
                resolve(false);
                return;
            }

            const currentContent = this.practiceSession.currentContent;
            if (!currentContent.transcript) {
                window.logger?.warn('没有可朗读的文本内容');
                resolve(false);
                return;
            }

            // 停止之前的语音
            window.speechSynthesis.cancel();

            // 确保语音已加载
            const setupSpeech = () => {
                // 创建语音合成实例
                const utterance = new SpeechSynthesisUtterance();
                
                // 获取英文语音（优先美式英语）
                const voices = window.speechSynthesis.getVoices();
                const englishVoice = voices.find(voice => 
                    voice.lang.startsWith('en-US') || voice.lang.startsWith('en-')
                );
                
                if (englishVoice) {
                    utterance.voice = englishVoice;
                    window.logger?.debug('使用语音:', englishVoice.name, englishVoice.lang);
                } else {
                    window.logger?.warn('未找到英文语音，使用默认语音');
                }

                // 设置语音参数
                utterance.text = currentContent.transcript.replace(/[A-Z]:/g, '').trim(); // 移除对话标识
                utterance.rate = this.practiceSession.speed; // 根据设置调整语速
                utterance.pitch = 1;
                utterance.volume = 1;

                window.logger?.debug('准备播放文本:', utterance.text.substring(0, 50) + '...');

                // 语音事件处理
                utterance.onstart = () => {
                    window.logger?.debug('语音开始播放');
                    this.audioPlayer.isPlaying = true;
                    this.onAudioPlay();
                    this.startProgressTracking(utterance);
                };

                utterance.onend = () => {
                    window.logger?.debug('语音播放结束');
                    this.audioPlayer.isPlaying = false;
                    this.audioPlayer.currentTime = 0;
                    this.onAudioEnded();
                    if (this.progressInterval) {
                        clearInterval(this.progressInterval);
                    }
                };

                utterance.onerror = (event) => {
                    window.logger?.error('语音合成错误:', event.error);
                    this.audioPlayer.isPlaying = false;
                    resolve(false);
                };

                utterance.onpause = () => {
                    this.audioPlayer.isPlaying = false;
                    this.onAudioPause();
                };

                utterance.onresume = () => {
                    this.audioPlayer.isPlaying = true;
                    this.onAudioPlay();
                };

                // 开始语音合成
                window.speechSynthesis.speak(utterance);
                
                // 设置当前的utterance引用，以便暂停控制
                this.currentUtterance = utterance;
                
                resolve(true);
            };

            // 检查语音是否已加载
            if (window.speechSynthesis.getVoices().length === 0) {
                window.logger?.debug('等待语音加载...');
                window.speechSynthesis.onvoiceschanged = () => {
                    window.logger?.debug('语音已加载');
                    setupSpeech();
                };
            } else {
                setupSpeech();
            }
        });
    }

    /**
     * 启动进度跟踪
     */
    startProgressTracking(utterance) {
        const startTime = Date.now();
        const estimatedDuration = this.practiceSession.currentContent.duration * 1000; // 转为毫秒
        
        this.progressInterval = setInterval(() => {
            if (!this.audioPlayer.isPlaying) {
                clearInterval(this.progressInterval);
                return;
            }

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / estimatedDuration, 1);
            
            this.audioPlayer.currentTime = (elapsed / 1000);
            this.audioPlayer.duration = this.practiceSession.currentContent.duration;
            
            this.onAudioTimeUpdate();

            // 如果超过预估时间，停止跟踪
            if (progress >= 1) {
                clearInterval(this.progressInterval);
            }
        }, 100);
    }

    /**
     * 模拟音频播放（降级方案）
     */
    simulateAudioPlayback() {
        window.logger?.info('使用模拟播放模式');
        
        this.audioPlayer.isPlaying = true;
        this.onAudioPlay();

        // 模拟播放进度
        const duration = this.practiceSession.currentContent.duration * 1000;
        const playbackRate = this.practiceSession.speed;
        const actualDuration = duration / playbackRate;

        let currentTime = 0;
        this.simulationInterval = setInterval(() => {
            currentTime += 100;
            this.audioPlayer.currentTime = (currentTime / 1000) * playbackRate;
            this.onAudioTimeUpdate();

            if (currentTime >= actualDuration) {
                clearInterval(this.simulationInterval);
                this.audioPlayer.isPlaying = false;
                this.audioPlayer.currentTime = 0;
                this.onAudioEnded();
            }
        }, 100);
    }

    /**
     * 暂停音频
     */
    pauseAudio() {
        // 暂停语音合成
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
        
        // 清除模拟播放的定时器
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        this.audioPlayer.isPlaying = false;
        this.onAudioPause();
    }

    /**
     * 停止音频
     */
    stopAudio() {
        // 停止语音合成
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        // 清除所有定时器
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        this.audioPlayer.isPlaying = false;
        this.audioPlayer.currentTime = 0;
        this.currentUtterance = null;
        this.onAudioPause();
    }

    /**
     * 提交答案（增强版）
     */
    submitAnswers(answers) {
        if (!this.practiceSession) {
            throw new Error('没有活跃的练习会话');
        }

        const currentContent = this.getCurrentContent();
        if (!currentContent) {
            throw new Error('没有当前听力内容');
        }

        if (!this.practiceSession.hasPlayedAudio) {
            throw new Error('请先播放音频');
        }

        // 记录答题时间
        if (currentContent.startTime) {
            currentContent.endTime = Date.now();
            currentContent.timeSpent = currentContent.endTime - currentContent.startTime;
        }

        const results = this.checkAnswers(currentContent.questions, answers);
        const correctCount = results.filter(r => r.isCorrect).length;
        const totalQuestions = results.length;
        const accuracy = Math.round((correctCount / totalQuestions) * 100);

        // 生成详细反馈
        const feedback = this.generateDetailedFeedback(currentContent, results, accuracy);

        const answerRecord = {
            contentId: currentContent.id,
            title: currentContent.title,
            category: currentContent.category,
            difficulty: currentContent.difficulty,
            answers: answers,
            results: results,
            correctCount,
            totalQuestions,
            accuracy,
            timeSpent: currentContent.timeSpent || 0,
            playCount: this.audioPlayer.playCount,
            feedback,
            timestamp: Date.now()
        };

        // 更新练习会话统计
        this.practiceSession.answers.push(answerRecord);
        this.practiceSession.totalQuestions += totalQuestions;
        this.practiceSession.correctAnswers += correctCount;
        this.practiceSession.totalScore += accuracy;
        this.practiceSession.currentIndex++;

        // 标记当前内容为已完成
        currentContent.isCompleted = true;
        currentContent.userAnswers = answers;

        // 更新自适应系统表现历史
        this.updatePerformanceHistory(answerRecord);

        window.logger?.info(`答案已提交: ${currentContent.title} - 正确率: ${accuracy}%`);

        return answerRecord;
    }

    /**
     * 生成详细反馈
     */
    generateDetailedFeedback(content, results, accuracy) {
        const feedback = {
            type: accuracy >= 70 ? 'success' : 'warning',
            title: accuracy >= 70 ? '表现不错！' : '需要加强练习',
            overallMessage: this.generateOverallMessage(accuracy),
            questionFeedback: [],
            skillAnalysis: this.analyzeSkillPerformance(results),
            listeningTips: this.getListeningTips(content, results),
            recommendations: this.generateRecommendations(content, results, accuracy)
        };

        // 为每个问题生成详细反馈
        results.forEach((result, index) => {
            feedback.questionFeedback.push({
                questionIndex: index + 1,
                question: result.question,
                isCorrect: result.isCorrect,
                userAnswer: result.userAnswer,
                correctAnswer: result.correctAnswer,
                explanation: this.generateQuestionExplanation(content, result),
                skill: result.skill,
                skillTip: this.getSkillTip(result.skill)
            });
        });

        return feedback;
    }

    /**
     * 生成总体评价信息
     */
    generateOverallMessage(accuracy) {
        if (accuracy >= 90) {
            return '优秀！您的听力理解能力很强，继续保持这样的水平。';
        } else if (accuracy >= 80) {
            return '很好！您已经掌握了大部分内容，稍加练习就能更进一步。';
        } else if (accuracy >= 70) {
            return '不错！您基本理解了听力内容，但还有提升空间。';
        } else if (accuracy >= 60) {
            return '需要加强练习。建议多听类似内容，提高听力理解能力。';
        } else {
            return '听力理解还需要大量练习。建议从较简单的内容开始，逐步提高。';
        }
    }

    /**
     * 分析技能表现
     */
    analyzeSkillPerformance(results) {
        const skillStats = {};
        
        results.forEach(result => {
            if (!skillStats[result.skill]) {
                skillStats[result.skill] = { correct: 0, total: 0 };
            }
            skillStats[result.skill].total++;
            if (result.isCorrect) {
                skillStats[result.skill].correct++;
            }
        });

        // 计算各技能准确率
        Object.keys(skillStats).forEach(skill => {
            const stats = skillStats[skill];
            stats.accuracy = Math.round((stats.correct / stats.total) * 100);
            stats.level = this.getSkillLevel(stats.accuracy);
        });

        return skillStats;
    }

    /**
     * 获取技能水平描述
     */
    getSkillLevel(accuracy) {
        if (accuracy >= 85) return '优秀';
        if (accuracy >= 70) return '良好';
        if (accuracy >= 60) return '一般';
        return '需要提高';
    }

    /**
     * 获取听力技巧提示
     */
    getListeningTips(content, results) {
        const tips = [];
        const category = content.category;
        const weakSkills = results.filter(r => !r.isCorrect).map(r => r.skill);

        // 基于内容类别的通用提示
        if (category === 'conversation') {
            tips.push('对话练习：注意说话者的语调和情绪变化');
            tips.push('关注关键词和转折词，如but、however、actually等');
        } else if (category === 'lecture') {
            tips.push('讲座练习：注意主题句和总结句');
            tips.push('留意举例和解释的信号词，如for example、in other words等');
        } else if (category === 'news') {
            tips.push('新闻练习：关注时间、地点、人物等关键信息');
            tips.push('注意新闻的结构：导语、正文、结尾');
        }

        // 基于错误技能的针对性提示
        if (weakSkills.includes('details')) {
            tips.push('细节理解：第一遍听大意，第二遍关注具体信息');
        }
        if (weakSkills.includes('main_idea')) {
            tips.push('主旨理解：注意开头和结尾的总结性语句');
        }
        if (weakSkills.includes('inference')) {
            tips.push('推理判断：结合上下文和说话者的语气进行推断');
        }
        if (weakSkills.includes('attitude')) {
            tips.push('态度理解：注意语调、重音和情态动词的使用');
        }

        return tips;
    }

    /**
     * 生成问题解释
     */
    generateQuestionExplanation(content, result) {
        const explanations = {
            'details': '这是一道细节理解题。需要仔细听取音频中的具体信息。',
            'main_idea': '这是一道主旨理解题。需要把握整段对话或独白的中心思想。',
            'inference': '这是一道推理判断题。需要根据听到的信息进行逻辑推理。',
            'attitude': '这是一道态度理解题。需要通过语调和用词来判断说话者的态度。'
        };

        return explanations[result.skill] || '请仔细听取音频内容，注意关键信息。';
    }

    /**
     * 获取技能提示
     */
    getSkillTip(skill) {
        const tips = {
            'details': '听细节时要专注于具体的数字、时间、地点等信息',
            'main_idea': '把握主旨要注意主题句，通常在开头或结尾',
            'inference': '推理时要结合上下文，不要过度解读',
            'attitude': '判断态度要注意语调变化和关键词的情感色彩'
        };

        return tips[skill] || '多听多练，提高听力理解能力';
    }

    /**
     * 生成学习建议
     */
    generateRecommendations(content, results, accuracy) {
        const recommendations = [];
        const incorrectResults = results.filter(r => !r.isCorrect);

        // 基于准确率的建议
        if (accuracy < 60) {
            recommendations.push('建议降低播放速度，从0.8倍速开始练习');
            recommendations.push('可以多听几遍同一段音频，加深理解');
            recommendations.push('建议先从基础难度的内容开始练习');
        } else if (accuracy < 80) {
            recommendations.push('继续练习当前难度的内容，巩固基础');
            recommendations.push('可以尝试不看文本直接听音频');
        } else {
            recommendations.push('表现优秀！可以尝试更高难度的内容');
            recommendations.push('建议提高播放速度至1.2倍，挑战自己');
        }

        // 基于错误类型的建议
        if (incorrectResults.length > 0) {
            const skillErrors = {};
            incorrectResults.forEach(r => {
                skillErrors[r.skill] = (skillErrors[r.skill] || 0) + 1;
            });

            const mostProblematicSkill = Object.keys(skillErrors).reduce((a, b) => 
                skillErrors[a] > skillErrors[b] ? a : b
            );

            recommendations.push(`重点练习${this.getSkillName(mostProblematicSkill)}类型的题目`);
        }

        // 基于内容类别的建议
        if (content.category === 'conversation') {
            recommendations.push('多练习日常对话，提高实际交流能力');
        } else if (content.category === 'lecture') {
            recommendations.push('多听学术讲座，提高学术英语理解能力');
        }

        return recommendations;
    }

    /**
     * 获取技能中文名称
     */
    getSkillName(skill) {
        const skillNames = {
            'details': '细节理解',
            'main_idea': '主旨理解',
            'inference': '推理判断',
            'attitude': '态度理解'
        };
        return skillNames[skill] || skill;
    }

    /**
     * 更新表现历史
     */
    updatePerformanceHistory(answerRecord) {
        this.adaptiveSystem.performanceHistory.push({
            timestamp: answerRecord.timestamp,
            accuracy: answerRecord.accuracy,
            difficulty: answerRecord.difficulty,
            category: answerRecord.category
        });

        // 保持历史记录在合理范围内
        if (this.adaptiveSystem.performanceHistory.length > 10) {
            this.adaptiveSystem.performanceHistory.shift();
        }
    }

    /**
     * 检查答案
     */
    checkAnswers(questions, userAnswers) {
        return questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            let isCorrect = false;

            switch (question.type) {
                case 'multiple_choice':
                    isCorrect = userAnswer === question.correct;
                    break;
                case 'true_false':
                    isCorrect = userAnswer === question.answer;
                    break;
                case 'fill_blank':
                    const correctAnswer = question.answer.toLowerCase().trim();
                    const userAnswerText = (userAnswer || '').toLowerCase().trim();
                    isCorrect = userAnswerText === correctAnswer;
                    break;
            }

            return {
                questionIndex: index,
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correct !== undefined ? question.correct : question.answer,
                isCorrect: isCorrect,
                skill: question.skill,
                explanation: question.explanation || ''
            };
        });
    }

    /**
     * 完成练习
     */
    finishPractice() {
        if (!this.practiceSession) {
            throw new Error('没有活跃的练习会话');
        }

        const session = this.practiceSession;
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;

        // 计算统计信息
        const stats = this.calculateStats(session);

        // 更新用户进度
        this.updateProgress(session, stats);

        // 记录学习活动
        this.recordActivity(session, stats);

        // 记录学习会话到应用级别
        if (window.app && window.app.recordStudySession) {
            window.app.recordStudySession('listening', session.duration / 1000, stats.accuracy);
        }

        // 清除当前会话
        this.practiceSession = null;
        this.stopAudio();

        window.logger?.info('听力练习已完成', stats);
        return { session, stats };
    }

    /**
     * 计算统计信息
     */
    calculateStats(session) {
        const { answers, duration } = session;
        const totalQuestions = answers.reduce((sum, answer) => sum + answer.totalQuestions, 0);
        const correctCount = answers.reduce((sum, answer) => sum + answer.correctCount, 0);
        const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        // 按技能统计
        const skillStats = {};
        answers.forEach(answer => {
            answer.results.forEach(result => {
                if (!skillStats[result.skill]) {
                    skillStats[result.skill] = { correct: 0, total: 0 };
                }
                skillStats[result.skill].total++;
                if (result.isCorrect) {
                    skillStats[result.skill].correct++;
                }
            });
        });

        // 计算技能准确率
        Object.keys(skillStats).forEach(skill => {
            skillStats[skill].accuracy = Math.round((skillStats[skill].correct / skillStats[skill].total) * 100);
        });

        return {
            totalContents: answers.length,
            totalQuestions,
            correctCount,
            incorrectCount: totalQuestions - correctCount,
            accuracy,
            duration,
            averageTime: answers.length > 0 ? Math.round(duration / answers.length) : 0,
            skillStats,
            xpEarned: this.calculateXP(correctCount, accuracy, session.difficulty)
        };
    }

    /**
     * 计算经验值
     */
    calculateXP(correctCount, accuracy, difficulty) {
        let baseXP = correctCount * 8; // 听力练习每题8分

        // 难度奖励
        const difficultyMultiplier = {
            'basic': 1,
            'intermediate': 1.3,
            'advanced': 1.6
        };
        baseXP *= difficultyMultiplier[difficulty] || 1;

        // 准确率奖励
        if (accuracy >= 90) baseXP += 40;
        else if (accuracy >= 80) baseXP += 25;
        else if (accuracy >= 70) baseXP += 15;

        return Math.round(baseXP);
    }

    /**
     * 更新进度
     */
    updateProgress(session, stats) {
        // 更新类别进度
        if (session.category && this.userProgress[session.category]) {
            this.userProgress[session.category].completed += stats.totalContents;
            this.userProgress[session.category].totalTime += session.duration;
            // 更新准确率（加权平均）
            const currentAccuracy = this.userProgress[session.category].accuracy || 0;
            const currentCompleted = this.userProgress[session.category].completed - stats.totalContents;
            if (currentCompleted > 0) {
                this.userProgress[session.category].accuracy = Math.round(
                    ((currentAccuracy * currentCompleted) + (stats.accuracy * stats.totalContents)) /
                    this.userProgress[session.category].completed
                );
            } else {
                this.userProgress[session.category].accuracy = stats.accuracy;
            }
        }

        // 更新技能统计
        Object.entries(stats.skillStats).forEach(([skill, skillStats]) => {
            if (this.userProgress.skills[skill]) {
                this.userProgress.skills[skill].total += skillStats.total;
                this.userProgress.skills[skill].correct += skillStats.correct;
                this.userProgress.skills[skill].accuracy = Math.round(
                    (this.userProgress.skills[skill].correct / this.userProgress.skills[skill].total) * 100
                );
            }
        });

        // 更新总体统计
        this.userProgress.totalPracticeTime += session.duration;
        this.userProgress.lastPracticeDate = new Date().toDateString();

        // 计算总体准确率
        const totalCorrect = Object.values(this.userProgress.skills).reduce((sum, skill) => sum + skill.correct, 0);
        const totalQuestions = Object.values(this.userProgress.skills).reduce((sum, skill) => sum + skill.total, 0);
        this.userProgress.overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        // 保存进度
        this.saveUserProgress();
    }

    /**
     * 记录学习活动
     */
    async recordActivity(session, stats) {
        try {
            const activity = {
                module: 'listening',
                type: 'listening_practice',
                category: session.category,
                skill: session.skill,
                difficulty: session.difficulty,
                duration: session.duration,
                contentsCompleted: stats.totalContents,
                questionsAnswered: stats.totalQuestions,
                accuracy: stats.accuracy,
                score: Math.round(stats.accuracy),
                xpEarned: stats.xpEarned,
                details: {
                    correctCount: stats.correctCount,
                    incorrectCount: stats.incorrectCount,
                    skillStats: stats.skillStats,
                    playbackSpeed: session.speed,
                    repeatCount: session.repeat
                }
            };

            await Storage.addLearningActivity(activity);
            
            // 记录到学习动态管理器
            if (window.learningActivityManager) {
                const durationInMinutes = Math.round(session.duration / 60000);
                window.learningActivityManager.recordListeningActivity(
                    durationInMinutes, 
                    session.skill || '听力'
                );
            }
            
            window.logger?.info('听力练习活动已记录');
        } catch (error) {
            window.logger?.error('记录学习活动失败:', error);
        }
    }


    /**
     * 音频事件处理
     */
    onAudioLoadedMetadata() {
        window.logger?.debug('音频元数据已加载');
    }

    onAudioTimeUpdate() {
        // 音频播放进度更新
        const event = new CustomEvent('listeningAudioTimeUpdate', {
            detail: {
                currentTime: this.audioPlayer.currentTime,
                duration: this.audioPlayer.duration,
                progress: (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100
            }
        });
        document.dispatchEvent(event);
    }

    onAudioPlay() {
        window.logger?.debug('音频开始播放');
        const event = new CustomEvent('listeningAudioPlay');
        document.dispatchEvent(event);
    }

    onAudioPause() {
        window.logger?.debug('音频暂停播放');
        const event = new CustomEvent('listeningAudioPause');
        document.dispatchEvent(event);
    }

    onAudioEnded() {
        window.logger?.debug('音频播放结束');
        const event = new CustomEvent('listeningAudioEnded', {
            detail: {
                playCount: this.audioPlayer.playCount,
                maxPlayCount: this.audioPlayer.maxPlayCount,
                canPlayAgain: this.audioPlayer.playCount < this.audioPlayer.maxPlayCount
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 设置当前选择
     */
    setCurrentCategory(category) {
        this.currentCategory = category;
    }

    setCurrentSkill(skill) {
        this.currentSkill = skill;
    }

    setCurrentDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
    }

    setPlaybackSpeed(speed) {
        this.playbackSpeed = parseFloat(speed);
    }

    setRepeatCount(count) {
        this.repeatCount = parseInt(count);
    }

    /**
     * 重置进度
     */
    async resetProgress() {
        try {
            this.userProgress = {
                conversation: { completed: 0, total: 24, accuracy: 0, totalTime: 0 },
                lecture: { completed: 0, total: 18, accuracy: 0, totalTime: 0 },
                news: { completed: 0, total: 20, accuracy: 0, totalTime: 0 },
                interview: { completed: 0, total: 16, accuracy: 0, totalTime: 0 },
                monologue: { completed: 0, total: 12, accuracy: 0, totalTime: 0 },
                skills: {
                    main_idea: { correct: 0, total: 0, accuracy: 0 },
                    details: { correct: 0, total: 0, accuracy: 0 },
                    inference: { correct: 0, total: 0, accuracy: 0 },
                    attitude: { correct: 0, total: 0, accuracy: 0 }
                },
                totalPracticeTime: 0,
                streakDays: 0,
                lastPracticeDate: null,
                overallAccuracy: 0
            };

            await Storage.remove('listening_progress');
            window.logger?.info('听力学习进度已重置');
        } catch (error) {
            window.logger?.error('重置听力进度失败:', error);
        }
    }

    /**
     * 获取听力练习统计信息
     */
    getStats() {
        const progress = this.userProgress || {};
        
        return {
            overall: {
                accuracy: progress.overallAccuracy || 0,
                totalQuestions: progress.totalPractices || 0,
                streakDays: progress.streakDays || 0,
                totalTime: Math.round((progress.totalTime || 0) / 60), // 转换为分钟
                completedSessions: progress.completedSessions || 0
            }
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ListeningManager;
} else {
    window.ListeningManager = ListeningManager;
}

window.logger?.info('听力训练管理器已加载');
