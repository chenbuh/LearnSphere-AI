/**
 * AI内容生成器
 * 智能生成学习内容、练习题目、学习计划等
 */
class AIContentGenerator {
    constructor() {
        this.contentTemplates = {};
        this.generationRules = {};
        this.vocabularyDatabase = {};
        this.grammarRules = {};
        this.contentCache = new Map();
        this.generationHistory = [];
        this.userPreferences = {};
        this.difficultyLevels = {};
        this.init();
    }

    init() {
        if (window.logger) {
            window.logger.info('AIContentGenerator', '🤖 初始化AI内容生成器...');
        }
        this.loadContentTemplates();
        this.setupGenerationRules();
        this.loadVocabularyDatabase();
        this.loadGrammarRules();
        this.setupDifficultyLevels();
        this.loadUserPreferences();
        this.setupGeneratorUI();
    }

    /**
     * 加载内容模板
     */
    loadContentTemplates() {
        this.contentTemplates = {
            // 词汇练习模板
            vocabulary: {
                multiple_choice: {
                    template: "What does '{word}' mean?",
                    options: ["{correct_meaning}", "{distractor1}", "{distractor2}", "{distractor3}"],
                    explanation: "'{word}' means {correct_meaning}. {usage_example}"
                },
                fill_blank: {
                    template: "Complete the sentence: {sentence_with_blank}",
                    answer: "{target_word}",
                    explanation: "The correct word is '{target_word}' because {reason}"
                },
                synonym_antonym: {
                    template: "Choose the {type} of '{word}':",
                    options: ["{correct_answer}", "{distractor1}", "{distractor2}", "{distractor3}"],
                    explanation: "'{correct_answer}' is a {type} of '{word}'"
                }
            },

            // 语法练习模板
            grammar: {
                tense_correction: {
                    template: "Choose the correct form: {sentence_with_options}",
                    options: ["{correct_form}", "{wrong_form1}", "{wrong_form2}", "{wrong_form3}"],
                    explanation: "The correct answer is '{correct_form}' because {grammar_rule}"
                },
                sentence_transformation: {
                    template: "Transform the sentence: '{original}' → {transformation_type}",
                    answer: "{transformed_sentence}",
                    explanation: "The transformation follows the rule: {rule_explanation}"
                },
                error_correction: {
                    template: "Find and correct the error: '{sentence_with_error}'",
                    answer: "{corrected_sentence}",
                    explanation: "The error was: {error_type}. Correct form: {correction_reason}"
                }
            },

            // 阅读理解模板
            reading: {
                comprehension: {
                    template: "Read the passage and answer: {passage}\n\nQuestion: {question}",
                    options: ["{correct_answer}", "{distractor1}", "{distractor2}", "{distractor3}"],
                    explanation: "The answer is '{correct_answer}' as stated in: {supporting_text}"
                },
                inference: {
                    template: "Based on the passage, we can infer that: {passage}\n\nInference: {question}",
                    options: ["{correct_inference}", "{wrong_inference1}", "{wrong_inference2}", "{wrong_inference3}"],
                    explanation: "The correct inference is '{correct_inference}' because {reasoning}"
                }
            },

            // 写作模板
            writing: {
                essay_structure: {
                    template: "Write a {essay_type} essay about '{topic}' using this structure:",
                    structure: ["Introduction: {intro_guide}", "Body: {body_guide}", "Conclusion: {conclusion_guide}"],
                    tips: ["{writing_tip1}", "{writing_tip2}", "{writing_tip3}"]
                },
                sentence_construction: {
                    template: "Construct a sentence using: {given_words}",
                    example: "{example_sentence}",
                    variations: ["{variation1}", "{variation2}", "{variation3}"]
                }
            },

            // 听力练习模板
            listening: {
                conversation: {
                    template: "Listen to the conversation and answer: {audio_description}",
                    question: "{comprehension_question}",
                    options: ["{correct_answer}", "{distractor1}", "{distractor2}", "{distractor3}"]
                },
                dictation: {
                    template: "Listen and write what you hear: {audio_segment}",
                    answer: "{correct_transcription}",
                    hints: ["{hint1}", "{hint2}", "{hint3}"]
                }
            }
        };

        if (window.logger) {
            window.logger.debug('AIContentGenerator', '📝 内容模板已加载');
        }
    }

    /**
     * 设置生成规则
     */
    setupGenerationRules() {
        this.generationRules = {
            vocabulary: {
                difficulty_progression: {
                    beginner: { frequency_min: 1000, syllables_max: 2, complexity: 'low' },
                    intermediate: { frequency_min: 500, syllables_max: 3, complexity: 'medium' },
                    advanced: { frequency_min: 100, syllables_max: 5, complexity: 'high' }
                },
                distractor_generation: {
                    semantic: 'similar_meaning',
                    phonetic: 'similar_sound',
                    morphological: 'similar_form',
                    contextual: 'same_category'
                }
            },
            grammar: {
                rule_complexity: {
                    basic: ['present_simple', 'past_simple', 'articles'],
                    intermediate: ['present_perfect', 'conditionals', 'passive_voice'],
                    advanced: ['subjunctive', 'complex_conditionals', 'advanced_modals']
                },
                error_types: {
                    common: ['subject_verb_agreement', 'tense_consistency', 'article_usage'],
                    intermediate: ['modal_usage', 'preposition_choice', 'word_order'],
                    advanced: ['register_appropriateness', 'idiomatic_expressions', 'subtle_meanings']
                }
            },
            reading: {
                passage_types: {
                    narrative: { structure: 'chronological', complexity: 'medium' },
                    expository: { structure: 'logical', complexity: 'high' },
                    descriptive: { structure: 'spatial', complexity: 'low' },
                    argumentative: { structure: 'persuasive', complexity: 'high' }
                },
                question_types: {
                    literal: 'directly_stated',
                    inferential: 'implied_meaning',
                    critical: 'analysis_evaluation'
                }
            }
        };

        if (window.logger) {
            window.logger.debug('AIContentGenerator', '📋 生成规则已设置');
        }
    }

    /**
     * 加载词汇数据库
     */
    loadVocabularyDatabase() {
        // 从全局词汇数据库加载真实数据
        this.vocabularyDatabase = this.loadRealVocabularyData() || {
            basic: [
                { 
                    word: 'happy', 
                    meaning: '快乐的', 
                    frequency: 1500, 
                    syllables: 2,
                    synonyms: ['joyful', 'glad', 'cheerful'],
                    antonyms: ['sad', 'unhappy', 'depressed'],
                    usage: 'I feel happy today.',
                    category: 'emotion'
                },
                {
                    word: 'important',
                    meaning: '重要的',
                    frequency: 1200,
                    syllables: 3,
                    synonyms: ['significant', 'crucial', 'vital'],
                    antonyms: ['unimportant', 'trivial', 'insignificant'],
                    usage: 'This is an important decision.',
                    category: 'description'
                }
            ],
            intermediate: [
                {
                    word: 'sophisticated',
                    meaning: '复杂的，精密的',
                    frequency: 600,
                    syllables: 4,
                    synonyms: ['complex', 'advanced', 'refined'],
                    antonyms: ['simple', 'basic', 'primitive'],
                    usage: 'The software has a sophisticated interface.',
                    category: 'description'
                }
            ],
            advanced: [
                {
                    word: 'ubiquitous',
                    meaning: '无处不在的',
                    frequency: 200,
                    syllables: 4,
                    synonyms: ['omnipresent', 'pervasive', 'widespread'],
                    antonyms: ['rare', 'scarce', 'limited'],
                    usage: 'Smartphones are ubiquitous in modern society.',
                    category: 'description'
                }
            ]
        };

        console.log('📚 词汇数据库已加载');
    }
    
    /**
     * 加载真实词汇数据
     */
    loadRealVocabularyData() {
        try {
            const realData = { basic: [], intermediate: [], advanced: [] };
            
            // 从CET4词汇加载基础词汇
            if (window.CET4_WORDS && Array.isArray(window.CET4_WORDS)) {
                realData.basic = window.CET4_WORDS.slice(0, 100).map(word => ({
                    word: word.word,
                    meaning: word.translation || word.meaning,
                    frequency: word.frequency || 1000,
                    difficulty: 'basic',
                    usage: word.example || `Example: This is a ${word.word}.`,
                    synonyms: word.synonyms || [],
                    antonyms: word.antonyms || []
                }));
            }
            
            // 从CET6词汇加载中级词汇
            if (window.CET6_WORDS && Array.isArray(window.CET6_WORDS)) {
                realData.intermediate = window.CET6_WORDS.slice(0, 100).map(word => ({
                    word: word.word,
                    meaning: word.translation || word.meaning,
                    frequency: word.frequency || 800,
                    difficulty: 'intermediate',
                    usage: word.example || `Example: This is a ${word.word}.`,
                    synonyms: word.synonyms || [],
                    antonyms: word.antonyms || []
                }));
            }
            
            // 从GRE词汇加载高级词汇
            if (window.GRE_WORDS && Array.isArray(window.GRE_WORDS)) {
                realData.advanced = window.GRE_WORDS.slice(0, 50).map(word => ({
                    word: word.word,
                    meaning: word.translation || word.meaning,
                    frequency: word.frequency || 500,
                    difficulty: 'advanced',
                    usage: word.example || `Example: This is a ${word.word}.`,
                    synonyms: word.synonyms || [],
                    antonyms: word.antonyms || []
                }));
            }
            
            // 如果有数据则返回，否则返回null使用默认数据
            if (realData.basic.length > 0 || realData.intermediate.length > 0 || realData.advanced.length > 0) {
                console.log('✅ 已加载真实词汇数据:', {
                    basic: realData.basic.length,
                    intermediate: realData.intermediate.length,
                    advanced: realData.advanced.length
                });
                return realData;
            }
            
            return null;
        } catch (error) {
            console.error('加载真实词汇数据失败:', error);
            return null;
        }
    }

    /**
     * 加载语法规则
     */
    loadGrammarRules() {
        this.grammarRules = {
            tenses: {
                present_simple: {
                    structure: 'Subject + Verb (base form/s)',
                    usage: ['habits', 'general truths', 'scheduled events'],
                    examples: ['I work every day.', 'The sun rises in the east.'],
                    common_errors: ['missing_s_third_person', 'wrong_auxiliary']
                },
                present_continuous: {
                    structure: 'Subject + am/is/are + Verb-ing',
                    usage: ['ongoing actions', 'temporary situations', 'future plans'],
                    examples: ['I am working now.', 'She is studying English.'],
                    common_errors: ['missing_auxiliary', 'wrong_ing_form']
                },
                present_perfect: {
                    structure: 'Subject + have/has + Past Participle',
                    usage: ['completed actions with present relevance', 'experiences', 'duration'],
                    examples: ['I have finished my homework.', 'She has lived here for years.'],
                    common_errors: ['using_simple_past', 'wrong_participle']
                }
            },
            conditionals: {
                zero_conditional: {
                    structure: 'If + Present Simple, Present Simple',
                    usage: 'General truths and scientific facts',
                    examples: ['If you heat water, it boils.']
                },
                first_conditional: {
                    structure: 'If + Present Simple, will + base verb',
                    usage: 'Real future possibilities',
                    examples: ['If it rains, I will stay home.']
                },
                second_conditional: {
                    structure: 'If + Past Simple, would + base verb',
                    usage: 'Hypothetical situations',
                    examples: ['If I won the lottery, I would travel the world.']
                }
            }
        };

        console.log('📖 语法规则已加载');
    }

    /**
     * 设置难度等级
     */
    setupDifficultyLevels() {
        this.difficultyLevels = {
            beginner: {
                vocabulary_size: 1000,
                sentence_length: 10,
                grammar_complexity: 'basic',
                reading_speed: 100, // words per minute
                topics: ['daily_life', 'family', 'food', 'weather']
            },
            intermediate: {
                vocabulary_size: 3000,
                sentence_length: 15,
                grammar_complexity: 'intermediate',
                reading_speed: 150,
                topics: ['work', 'education', 'travel', 'culture', 'technology']
            },
            advanced: {
                vocabulary_size: 8000,
                sentence_length: 20,
                grammar_complexity: 'advanced',
                reading_speed: 200,
                topics: ['science', 'politics', 'philosophy', 'literature', 'economics']
            }
        };

        console.log('📊 难度等级已设置');
    }

    /**
     * 加载用户偏好
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('ai_content_preferences');
            this.userPreferences = saved ? JSON.parse(saved) : {
                difficulty: 'intermediate',
                preferred_topics: ['general'],
                learning_style: 'mixed',
                question_types: ['multiple_choice', 'fill_blank'],
                content_length: 'medium'
            };
        } catch (error) {
            console.error('❌ 加载用户偏好失败:', error);
        }
    }

    /**
     * 生成词汇练习
     */
    generateVocabularyExercise(options = {}) {
        const {
            difficulty = this.userPreferences.difficulty,
            type = 'multiple_choice',
            count = 1,
            topic = null
        } = options;

        const exercises = [];
        const wordPool = this.getWordPool(difficulty, topic);

        for (let i = 0; i < count; i++) {
            const targetWord = this.selectRandomWord(wordPool);
            const exercise = this.createVocabularyExercise(targetWord, type, difficulty);
            exercises.push(exercise);
        }

        return exercises.length === 1 ? exercises[0] : exercises;
    }

    /**
     * 获取单词池
     */
    getWordPool(difficulty, topic) {
        let pool = this.vocabularyDatabase[difficulty] || this.vocabularyDatabase.intermediate;
        
        if (topic) {
            pool = pool.filter(word => word.category === topic);
        }

        return pool;
    }

    /**
     * 选择随机单词
     */
    selectRandomWord(wordPool) {
        // 基于当前时间戳选择单词
        const index = Date.now() % wordPool.length;
        return wordPool[index];
    }

    /**
     * 创建词汇练习
     */
    createVocabularyExercise(targetWord, type, difficulty) {
        const template = this.contentTemplates.vocabulary[type];
        
        switch (type) {
            case 'multiple_choice':
                return this.createMultipleChoiceVocab(targetWord, template, difficulty);
            case 'fill_blank':
                return this.createFillBlankVocab(targetWord, template, difficulty);
            case 'synonym_antonym':
                return this.createSynonymAntonymVocab(targetWord, template, difficulty);
            default:
                return this.createMultipleChoiceVocab(targetWord, template, difficulty);
        }
    }

    /**
     * 创建选择题词汇练习
     */
    createMultipleChoiceVocab(targetWord, template, difficulty) {
        const distractors = this.generateDistractors(targetWord, 3, difficulty);
        const allOptions = [targetWord.meaning, ...distractors];
        const shuffledOptions = this.shuffleArray(allOptions);
        const correctIndex = shuffledOptions.indexOf(targetWord.meaning);

        return {
            id: this.generateExerciseId(),
            type: 'vocabulary_multiple_choice',
            difficulty: difficulty,
            question: template.template.replace('{word}', targetWord.word),
            options: shuffledOptions,
            correct_answer: correctIndex,
            explanation: template.explanation
                .replace('{word}', targetWord.word)
                .replace('{correct_meaning}', targetWord.meaning)
                .replace('{usage_example}', targetWord.usage),
            target_word: targetWord,
            metadata: {
                skill: 'vocabulary',
                subskill: 'word_meaning',
                estimated_time: 30
            }
        };
    }

    /**
     * 创建填空词汇练习
     */
    createFillBlankVocab(targetWord, template, difficulty) {
        const sentence = this.createContextSentence(targetWord, difficulty);
        const sentenceWithBlank = sentence.replace(targetWord.word, '______');

        return {
            id: this.generateExerciseId(),
            type: 'vocabulary_fill_blank',
            difficulty: difficulty,
            question: template.template.replace('{sentence_with_blank}', sentenceWithBlank),
            answer: targetWord.word,
            explanation: template.explanation
                .replace('{target_word}', targetWord.word)
                .replace('{reason}', `it means "${targetWord.meaning}" and fits the context`),
            target_word: targetWord,
            metadata: {
                skill: 'vocabulary',
                subskill: 'word_usage',
                estimated_time: 45
            }
        };
    }

    /**
     * 创建同义词/反义词练习
     */
    createSynonymAntonymVocab(targetWord, template, difficulty) {
        // 基于单词长度决定是同义词还是反义词
        const isSynonym = targetWord.word.length % 2 === 0;
        const type = isSynonym ? 'synonym' : 'antonym';
        const correctAnswer = isSynonym ? 
            this.selectRandom(targetWord.synonyms || []) : 
            this.selectRandom(targetWord.antonyms || []);

        if (!correctAnswer) {
            // 如果没有同义词或反义词，回退到选择题
            return this.createMultipleChoiceVocab(targetWord, this.contentTemplates.vocabulary.multiple_choice, difficulty);
        }

        const distractors = this.generateSynAntDistractors(targetWord, type, 3, difficulty);
        const allOptions = [correctAnswer, ...distractors];
        const shuffledOptions = this.shuffleArray(allOptions);
        const correctIndex = shuffledOptions.indexOf(correctAnswer);

        return {
            id: this.generateExerciseId(),
            type: 'vocabulary_synonym_antonym',
            difficulty: difficulty,
            question: template.template
                .replace('{type}', type)
                .replace('{word}', targetWord.word),
            options: shuffledOptions,
            correct_answer: correctIndex,
            explanation: template.explanation
                .replace('{correct_answer}', correctAnswer)
                .replace('{type}', type)
                .replace('{word}', targetWord.word),
            target_word: targetWord,
            metadata: {
                skill: 'vocabulary',
                subskill: `${type}_recognition`,
                estimated_time: 30
            }
        };
    }

    /**
     * 生成语法练习
     */
    generateGrammarExercise(options = {}) {
        const {
            difficulty = this.userPreferences.difficulty,
            type = 'tense_correction',
            grammar_point = null,
            count = 1
        } = options;

        const exercises = [];

        for (let i = 0; i < count; i++) {
            const exercise = this.createGrammarExercise(type, difficulty, grammar_point);
            exercises.push(exercise);
        }

        return exercises.length === 1 ? exercises[0] : exercises;
    }

    /**
     * 创建语法练习
     */
    createGrammarExercise(type, difficulty, grammarPoint) {
        switch (type) {
            case 'tense_correction':
                return this.createTenseCorrectionExercise(difficulty, grammarPoint);
            case 'sentence_transformation':
                return this.createSentenceTransformationExercise(difficulty, grammarPoint);
            case 'error_correction':
                return this.createErrorCorrectionExercise(difficulty, grammarPoint);
            default:
                return this.createTenseCorrectionExercise(difficulty, grammarPoint);
        }
    }

    /**
     * 创建时态改错练习
     */
    createTenseCorrectionExercise(difficulty, grammarPoint) {
        const tenses = grammarPoint ? [grammarPoint] : this.getGrammarPointsForDifficulty(difficulty);
        const targetTense = this.selectRandom(tenses);
        const rule = this.grammarRules.tenses[targetTense];
        
        if (!rule) {
            console.warn(`未找到语法规则: ${targetTense}`);
            return null;
        }

        const sentence = this.generateSentenceForTense(targetTense, difficulty);
        const options = this.generateTenseOptions(sentence, targetTense);
        const correctIndex = 0; // 正确答案总是第一个

        return {
            id: this.generateExerciseId(),
            type: 'grammar_tense_correction',
            difficulty: difficulty,
            question: `Choose the correct form: ${sentence.question}`,
            options: this.shuffleArray(options),
            correct_answer: this.shuffleArray(options).indexOf(options[0]),
            explanation: `The correct answer uses ${targetTense} because ${rule.usage[0]}`,
            grammar_point: targetTense,
            metadata: {
                skill: 'grammar',
                subskill: 'tense_usage',
                estimated_time: 45
            }
        };
    }

    /**
     * 生成阅读理解练习
     */
    generateReadingExercise(options = {}) {
        const {
            difficulty = this.userPreferences.difficulty,
            type = 'comprehension',
            topic = null,
            passage_length = 'medium'
        } = options;

        const passage = this.generateReadingPassage(difficulty, topic, passage_length);
        const questions = this.generateReadingQuestions(passage, type, difficulty);

        return {
            id: this.generateExerciseId(),
            type: 'reading_comprehension',
            difficulty: difficulty,
            passage: passage,
            questions: questions,
            metadata: {
                skill: 'reading',
                subskill: type,
                estimated_time: this.estimateReadingTime(passage, questions.length),
                word_count: passage.split(' ').length
            }
        };
    }

    /**
     * 生成阅读文章
     */
    generateReadingPassage(difficulty, topic, length) {
        const topics = topic ? [topic] : this.difficultyLevels[difficulty].topics;
        const selectedTopic = this.selectRandom(topics);
        
        const passages = {
            daily_life: {
                medium: "Sarah wakes up at 7 AM every morning. She has breakfast with her family and then goes to work by bus. She works in an office downtown and enjoys her job very much. After work, she often meets friends for dinner or goes to the gym. On weekends, she likes to read books and watch movies at home."
            },
            technology: {
                medium: "Artificial Intelligence is transforming the way we live and work. From smartphones that understand our voice commands to cars that can drive themselves, AI technology is becoming increasingly sophisticated. While these advances offer many benefits, they also raise important questions about privacy, employment, and the future of human society."
            },
            science: {
                medium: "Climate change represents one of the most significant challenges facing humanity today. Rising global temperatures, caused primarily by greenhouse gas emissions, are leading to more frequent extreme weather events, rising sea levels, and disruptions to ecosystems worldwide. Scientists emphasize the urgent need for coordinated international action to address this crisis."
            }
        };

        return passages[selectedTopic]?.[length] || passages.daily_life.medium;
    }

    /**
     * 生成阅读问题
     */
    generateReadingQuestions(passage, type, difficulty) {
        const questions = [];
        const questionCount = difficulty === 'beginner' ? 2 : difficulty === 'intermediate' ? 3 : 4;

        for (let i = 0; i < questionCount; i++) {
            const question = this.createReadingQuestion(passage, type, difficulty, i);
            if (question) {
                questions.push(question);
            }
        }

        return questions;
    }

    /**
     * 创建阅读问题
     */
    createReadingQuestion(passage, type, difficulty, index) {
        // 简化实现 - 实际应用中需要更复杂的NLP处理
        const sentences = passage.split('. ');
        const targetSentence = sentences[index % sentences.length];
        
        if (!targetSentence) return null;

        const words = targetSentence.split(' ');
        const keyWord = words.find(word => word.length > 4) || words[0];

        return {
            id: `question_${index + 1}`,
            question: `According to the passage, what is mentioned about ${keyWord.toLowerCase().replace(/[.,]/g, '')}?`,
            options: [
                `Information from the passage about ${keyWord}`,
                `Incorrect information about ${keyWord}`,
                `Unrelated information`,
                `Opposite information`
            ],
            correct_answer: 0,
            explanation: `The passage states information about ${keyWord} in the context provided.`
        };
    }

    /**
     * 生成写作练习
     */
    generateWritingExercise(options = {}) {
        const {
            difficulty = this.userPreferences.difficulty,
            type = 'essay_structure',
            topic = null,
            word_limit = 200
        } = options;

        const topics = topic ? [topic] : this.difficultyLevels[difficulty].topics;
        const selectedTopic = this.selectRandom(topics);

        return this.createWritingExercise(type, selectedTopic, difficulty, word_limit);
    }

    /**
     * 创建写作练习
     */
    createWritingExercise(type, topic, difficulty, wordLimit) {
        const template = this.contentTemplates.writing[type];
        
        const prompts = {
            daily_life: "Describe a typical day in your life",
            technology: "Discuss the impact of technology on education",
            environment: "Write about environmental protection",
            culture: "Compare different cultural traditions"
        };

        const selectedPrompt = prompts[topic] || prompts.daily_life;

        return {
            id: this.generateExerciseId(),
            type: 'writing_exercise',
            difficulty: difficulty,
            prompt: selectedPrompt,
            word_limit: wordLimit,
            structure_guide: template.structure,
            writing_tips: template.tips,
            evaluation_criteria: this.getWritingCriteria(difficulty),
            metadata: {
                skill: 'writing',
                subskill: type,
                estimated_time: 30
            }
        };
    }

    /**
     * 生成学习计划
     */
    generateStudyPlan(options = {}) {
        const {
            duration = 30, // days
            daily_time = 60, // minutes
            focus_areas = ['vocabulary', 'grammar', 'reading', 'listening'],
            difficulty = this.userPreferences.difficulty,
            goal = 'general_improvement'
        } = options;

        const plan = {
            id: this.generatePlanId(),
            title: `${duration}天英语学习计划`,
            duration: duration,
            daily_time: daily_time,
            difficulty: difficulty,
            goal: goal,
            focus_areas: focus_areas,
            weekly_schedule: this.generateWeeklySchedule(focus_areas, daily_time),
            daily_plans: this.generateDailyPlans(duration, focus_areas, difficulty, daily_time),
            milestones: this.generateMilestones(duration, goal),
            resources: this.generateStudyResources(focus_areas, difficulty),
            assessment_schedule: this.generateAssessmentSchedule(duration)
        };

        return plan;
    }

    /**
     * 生成每周计划
     */
    generateWeeklySchedule(focusAreas, dailyTime) {
        const schedule = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach((day, index) => {
            const primaryFocus = focusAreas[index % focusAreas.length];
            const secondaryFocus = focusAreas[(index + 1) % focusAreas.length];
            
            schedule[day] = {
                primary_focus: primaryFocus,
                secondary_focus: secondaryFocus,
                time_allocation: {
                    [primaryFocus]: Math.floor(dailyTime * 0.6),
                    [secondaryFocus]: Math.floor(dailyTime * 0.3),
                    review: Math.floor(dailyTime * 0.1)
                },
                activities: this.generateDayActivities(primaryFocus, secondaryFocus)
            };
        });

        return schedule;
    }

    /**
     * 生成每日计划
     */
    generateDailyPlans(duration, focusAreas, difficulty, dailyTime) {
        const plans = [];
        
        for (let day = 1; day <= duration; day++) {
            const focusArea = focusAreas[(day - 1) % focusAreas.length];
            const plan = {
                day: day,
                date: this.getFutureDate(day - 1),
                focus_area: focusArea,
                activities: this.generateDailyActivities(focusArea, difficulty, dailyTime),
                goals: this.generateDailyGoals(focusArea, difficulty),
                exercises: this.generateDailyExercises(focusArea, difficulty),
                estimated_time: dailyTime
            };
            plans.push(plan);
        }

        return plans;
    }

    /**
     * 生成里程碑
     */
    generateMilestones(duration, goal) {
        const milestones = [];
        const intervals = [7, 14, 21, 30];
        
        intervals.forEach(interval => {
            if (interval <= duration) {
                milestones.push({
                    day: interval,
                    title: `第${interval}天检查点`,
                    description: this.getMilestoneDescription(interval, goal),
                    assessment_type: interval % 14 === 0 ? 'comprehensive' : 'quick_check',
                    expected_progress: this.getExpectedProgress(interval, duration)
                });
            }
        });

        return milestones;
    }

    /**
     * 批量生成内容
     */
    generateBatchContent(requests) {
        const results = [];
        
        requests.forEach(request => {
            try {
                let content = null;
                
                switch (request.type) {
                    case 'vocabulary':
                        content = this.generateVocabularyExercise(request.options);
                        break;
                    case 'grammar':
                        content = this.generateGrammarExercise(request.options);
                        break;
                    case 'reading':
                        content = this.generateReadingExercise(request.options);
                        break;
                    case 'writing':
                        content = this.generateWritingExercise(request.options);
                        break;
                    case 'study_plan':
                        content = this.generateStudyPlan(request.options);
                        break;
                    default:
                        throw new Error(`未知内容类型: ${request.type}`);
                }
                
                results.push({
                    id: request.id,
                    success: true,
                    content: content
                });
                
            } catch (error) {
                results.push({
                    id: request.id,
                    success: false,
                    error: error.message
                });
            }
        });

        return results;
    }

    /**
     * 设置生成器UI
     */
    setupGeneratorUI() {
        // 集成到页面中而不是创建悬浮界面
        this.setupInlineGenerator();
        this.bindInlineGeneratorEvents();
    }

    /**
     * 设置内联生成器
     */
    setupInlineGenerator() {
        const generatorCard = document.getElementById('ai-generator-card');
        if (!generatorCard) {
            console.warn('AI内容生成器卡片未找到，将创建悬浮界面');
            this.createGeneratorInterface();
            this.bindGeneratorEvents();
            return;
        }

        // 绑定内联生成器功能
        this.setupInlineGeneratorControls();
    }

    /**
     * 设置内联生成器控件
     */
    setupInlineGeneratorControls() {
        const contentType = document.getElementById('quickContentType');
        const difficulty = document.getElementById('quickDifficulty');
        const generateBtn = document.getElementById('quickGenerate');
        const resultArea = document.getElementById('quickGenerationResult');

        if (!contentType || !difficulty || !generateBtn || !resultArea) {
            if (window.logger) {
                window.logger.warn('AIContentGenerator', '内容生成器界面元素未找到，将稍后重试');
            }
            // 延迟重试，可能DOM还未完全加载
            setTimeout(() => this.setupInlineGeneratorControls(), 1000);
            return;
        }

        // 设置初始显示内容
        if (resultArea.innerHTML.trim() === '') {
            resultArea.innerHTML = '<div class="placeholder-text" style="color: #6c757d; font-style: italic; padding: 1rem; text-align: center;">生成的内容将显示在这里...</div>';
        }

        // 绑定生成按钮事件
        generateBtn.addEventListener('click', async () => {
            const type = contentType.value;
            const level = difficulty.value;
            
            // 显示加载状态
            resultArea.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div>正在生成内容...</div>';
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';

            try {
                // 快速生成内容，减少等待时间
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const content = this.generateQuickContent(type, level);
                if (content && content !== "生成内容时出现错误，请重试") {
                    this.displayInlineResult(content, resultArea);
                } else {
                    resultArea.innerHTML = '<div class="error-message" style="color: #dc3545; padding: 1rem; text-align: center; border: 1px solid #f5c6cb; background: #f8d7da; border-radius: 8px;">生成失败，请检查数据加载或重试</div>';
                }
                
            } catch (error) {
                if (window.logger) {
                    window.logger.error('AIContentGenerator', '内容生成失败:', error);
                }
                resultArea.innerHTML = '<div class="error-message" style="color: #dc3545; padding: 1rem; text-align: center; border: 1px solid #f5c6cb; background: #f8d7da; border-radius: 8px;">生成失败，请重试</div>';
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = '生成内容';
            }
        });
    }

    /**
     * 生成快速内容
     */
    generateQuickContent(type, level) {
        try {
            // 根据类型和级别生成真实的内容
            switch (type) {
                case 'vocabulary':
                    return this.generateVocabularyContent(level);
                case 'grammar':
                    return this.generateGrammarContent(level);
                case 'reading':
                    return this.generateReadingContent(level);
                case 'writing':
                    return this.generateWritingContent(level);
                default:
                    return "请选择内容类型和难度级别";
            }
        } catch (error) {
            console.error('生成内容失败:', error);
            return "生成内容时出现错误，请重试";
        }
    }

    /**
     * 生成词汇内容
     */
    generateVocabularyContent(level) {
        const wordPool = this.vocabularyDatabase[level === 'beginner' ? 'basic' : level] || this.vocabularyDatabase.basic;
        if (!wordPool || wordPool.length === 0) {
            return "词汇数据库为空，请检查数据加载";
        }

        const word = this.selectRandomWord(wordPool);
        return `单词：${word.word} (${word.meaning})\n例句：${word.usage || `This is an example with ${word.word}.`}\n练习：选择正确含义...`;
    }

    /**
     * 生成语法内容
     */
    generateGrammarContent(level) {
        const grammarPoints = {
            beginner: ['present_simple', 'past_simple'],
            intermediate: ['present_perfect', 'conditionals'],
            advanced: ['subjunctive', 'complex_conditionals']
        };

        const points = grammarPoints[level] || grammarPoints.beginner;
        const point = this.selectRandom(points);
        const rule = this.grammarRules.tenses[point];

        if (rule) {
            return `语法点：${point}\n结构：${rule.structure}\n用法：${rule.usage[0]}\n例句：${rule.examples[0]}`;
        }

        return `语法点：${point}\n结构：主语 + 动词\n练习：请完成句子...`;
    }

    /**
     * 生成阅读内容
     */
    generateReadingContent(level) {
        const passages = {
            beginner: "Tom is a student. He likes reading books and playing sports. Every morning, he goes to school by bus. He has many friends at school.",
            intermediate: "Education plays a crucial role in personal development and social progress. It provides individuals with knowledge, skills, and critical thinking abilities necessary for success in modern society.",
            advanced: "The rapid advancement of artificial intelligence has profound implications for the future of work. While AI technologies offer unprecedented opportunities for innovation and efficiency, they also raise important questions about employment displacement and the need for workforce adaptation."
        };

        const passage = passages[level] || passages.beginner;
        return `短文：${passage}\n\n问题：根据文章内容，请回答相关问题。`;
    }

    /**
     * 生成写作内容
     */
    generateWritingContent(level) {
        const prompts = {
            beginner: {
                topic: "我的一天",
                requirement: "用50-80个单词描述你的一天",
                tips: "包括：起床时间、吃饭、学习、睡觉等"
            },
            intermediate: {
                topic: "环境保护的重要性",
                requirement: "写一篇120-150词的短文",
                tips: "结构：引言-主体段落-结论"
            },
            advanced: {
                topic: "科技对教育的影响",
                requirement: "写一篇250-300词的议论文",
                tips: "要点：优势分析、挑战讨论、未来展望"
            }
        };

        const prompt = prompts[level] || prompts.beginner;
        return `题目：${prompt.topic}\n要求：${prompt.requirement}\n提示：${prompt.tips}`;
    }

    /**
     * 显示内联结果
     */
    displayInlineResult(content, container) {
        container.innerHTML = `
            <div class="success-message">
                <h5>✨ 生成成功！</h5>
                <pre style="white-space: pre-wrap; margin: 0.5rem 0; background: #f8f9fa; padding: 1rem; border-radius: 8px; border: 1px solid #e9ecef;">${content}</pre>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-sm btn-primary" onclick="window.AIContentGenerator.regenerateContent()">重新生成</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.AIContentGenerator.copyContent('${content.replace(/'/g, "\\'")}')">复制内容</button>
                </div>
            </div>
        `;
    }

    /**
     * 重新生成内容
     */
    regenerateContent() {
        const generateBtn = document.getElementById('quickGenerate');
        if (generateBtn) {
            generateBtn.click();
        }
    }

    /**
     * 复制内容
     */
    copyContent(content) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content).then(() => {
                this.showToast('内容已复制到剪贴板');
            }).catch(err => {
                console.error('复制失败:', err);
                this.showToast('复制失败，请手动复制');
            });
        } else {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showToast('内容已复制到剪贴板');
            } catch (err) {
                this.showToast('复制失败，请手动复制');
            }
            document.body.removeChild(textArea);
        }
    }

    /**
     * 显示提示消息
     */
    showToast(message) {
        // 创建简单的提示消息
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 4px;
            z-index: 10000;
            font-size: 0.9rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // 3秒后自动移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    /**
     * 绑定内联生成器事件
     */
    bindInlineGeneratorEvents() {
        // 自适应测试按钮事件
        const testOptions = document.querySelectorAll('.test-option button');
        testOptions.forEach(button => {
            button.addEventListener('click', (e) => {
                const testType = e.target.closest('.test-option').dataset.testType;
                this.startInlineAdaptiveTest(testType);
            });
        });
    }

    /**
     * 启动内联自适应测试
     */
    startInlineAdaptiveTest(testType) {
        // 使用现有的自适应测试系统
        if (window.AdaptiveTestingSystem) {
            window.AdaptiveTestingSystem.startAdaptiveTest({ type: testType });
        } else {
            alert(`正在启动${testType}测试...`);
        }
    }

    /**
     * 创建生成器界面
     */
    createGeneratorInterface() {
        // 检查是否已存在
        if (document.getElementById('ai-content-generator')) return;

        const generatorContainer = document.createElement('div');
        generatorContainer.id = 'ai-content-generator';
        generatorContainer.innerHTML = `
            <div class="generator-panel">
                <div class="generator-header">
                    <h3>🤖 AI内容生成器</h3>
                    <button class="btn btn-sm btn-outline-secondary" id="toggleGenerator">−</button>
                </div>
                
                <div class="generator-body">
                    <div class="content-type-selector">
                        <label>内容类型</label>
                        <select id="contentType" class="form-control">
                            <option value="vocabulary">词汇练习</option>
                            <option value="grammar">语法练习</option>
                            <option value="reading">阅读理解</option>
                            <option value="writing">写作练习</option>
                            <option value="study_plan">学习计划</option>
                        </select>
                    </div>
                    
                    <div class="difficulty-selector">
                        <label>难度等级</label>
                        <select id="difficultyLevel" class="form-control">
                            <option value="beginner">初级</option>
                            <option value="intermediate">中级</option>
                            <option value="advanced">高级</option>
                        </select>
                    </div>
                    
                    <div class="quantity-selector">
                        <label>生成数量</label>
                        <input type="number" id="contentQuantity" class="form-control" min="1" max="10" value="1">
                    </div>
                    
                    <div class="advanced-options" id="advancedOptions">
                        <!-- 动态生成的高级选项 -->
                    </div>
                    
                    <div class="generator-actions">
                        <button class="btn btn-primary" id="generateContent">生成内容</button>
                        <button class="btn btn-outline-secondary" id="previewContent">预览</button>
                        <button class="btn btn-outline-info" id="saveTemplate">保存模板</button>
                    </div>
                </div>
                
                <div class="generation-results" id="generationResults">
                    <!-- 生成结果显示区域 -->
                </div>
            </div>
        `;

        // 添加样式
        const styles = `
            <style>
            #ai-content-generator {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 1001;
                max-height: 70vh;
                overflow-y: auto;
            }

                .generator-panel {
                    display: flex;
                    flex-direction: column;
                }

                .generator-header {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 10px 10px 0 0;
                }

                .generator-body {
                    padding: 1.5rem;
                }

                .generator-body > div {
                    margin-bottom: 1rem;
                }

                .generator-body label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .advanced-options {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 1rem;
                    background: #f8f9fa;
                }

                .generator-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .generation-results {
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 1rem;
                    border-top: 1px solid #e0e0e0;
                }

                .generated-item {
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }

                .generated-item h4 {
                    color: #28a745;
                    margin-bottom: 0.5rem;
                }

                .item-actions {
                    margin-top: 0.5rem;
                    display: flex;
                    gap: 0.5rem;
                }

                @media (max-width: 1200px) {
                    #ai-content-generator {
                        width: 350px;
                    }
                }

                @media (max-width: 768px) {
                    #ai-content-generator {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        width: 100%;
                        max-height: 100vh;
                        border-radius: 0;
                        z-index: 10002;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(generatorContainer);

        console.log('🎨 AI内容生成器界面已创建');
    }

    /**
     * 绑定生成器事件
     */
    bindGeneratorEvents() {
        const contentType = document.getElementById('contentType');
        const generateBtn = document.getElementById('generateContent');
        const previewBtn = document.getElementById('previewContent');
        const toggleBtn = document.getElementById('toggleGenerator');

        if (contentType) {
            contentType.addEventListener('change', (e) => {
                this.updateAdvancedOptions(e.target.value);
            });
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.handleContentGeneration();
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.handleContentPreview();
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleGeneratorPanel();
            });
        }

        // 初始化高级选项
        this.updateAdvancedOptions('vocabulary');
    }

    /**
     * 更新高级选项
     */
    updateAdvancedOptions(contentType) {
        const advancedOptions = document.getElementById('advancedOptions');
        if (!advancedOptions) return;

        let optionsHTML = '';

        switch (contentType) {
            case 'vocabulary':
                optionsHTML = `
                    <h5>词汇练习选项</h5>
                    <div class="form-group">
                        <label>练习类型</label>
                        <select id="vocabType" class="form-control">
                            <option value="multiple_choice">选择题</option>
                            <option value="fill_blank">填空题</option>
                            <option value="synonym_antonym">同义/反义词</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>主题</label>
                        <select id="vocabTopic" class="form-control">
                            <option value="">随机</option>
                            <option value="emotion">情感</option>
                            <option value="description">描述</option>
                            <option value="action">动作</option>
                        </select>
                    </div>
                `;
                break;
            case 'grammar':
                optionsHTML = `
                    <h5>语法练习选项</h5>
                    <div class="form-group">
                        <label>语法点</label>
                        <select id="grammarPoint" class="form-control">
                            <option value="">随机</option>
                            <option value="present_simple">现在时</option>
                            <option value="present_perfect">现在完成时</option>
                            <option value="conditionals">条件句</option>
                        </select>
                    </div>
                `;
                break;
            case 'reading':
                optionsHTML = `
                    <h5>阅读理解选项</h5>
                    <div class="form-group">
                        <label>文章长度</label>
                        <select id="passageLength" class="form-control">
                            <option value="short">短文</option>
                            <option value="medium">中等</option>
                            <option value="long">长文</option>
                        </select>
                    </div>
                `;
                break;
            case 'study_plan':
                optionsHTML = `
                    <h5>学习计划选项</h5>
                    <div class="form-group">
                        <label>计划天数</label>
                        <input type="number" id="planDuration" class="form-control" min="7" max="90" value="30">
                    </div>
                    <div class="form-group">
                        <label>每日学习时间(分钟)</label>
                        <input type="number" id="dailyTime" class="form-control" min="15" max="180" value="60">
                    </div>
                `;
                break;
        }

        advancedOptions.innerHTML = optionsHTML;
    }

    /**
     * 处理内容生成
     */
    async handleContentGeneration() {
        const contentType = document.getElementById('contentType').value;
        const difficulty = document.getElementById('difficultyLevel').value;
        const quantity = parseInt(document.getElementById('contentQuantity').value);

        const options = this.getGenerationOptions(contentType, difficulty, quantity);
        
        try {
            this.showGenerationLoading();
            
            let results = [];
            if (quantity === 1) {
                const content = await this.generateContentByType(contentType, options);
                results = [content];
            } else {
                for (let i = 0; i < quantity; i++) {
                    const content = await this.generateContentByType(contentType, options);
                    results.push(content);
                }
            }

            this.displayGenerationResults(results, contentType);
            
        } catch (error) {
            console.error('❌ 内容生成失败:', error);
            this.showGenerationError(error.message);
        } finally {
            this.hideGenerationLoading();
        }
    }

    /**
     * 根据类型生成内容
     */
    async generateContentByType(type, options) {
        switch (type) {
            case 'vocabulary':
                return this.generateVocabularyExercise(options);
            case 'grammar':
                return this.generateGrammarExercise(options);
            case 'reading':
                return this.generateReadingExercise(options);
            case 'writing':
                return this.generateWritingExercise(options);
            case 'study_plan':
                return this.generateStudyPlan(options);
            default:
                throw new Error(`未支持的内容类型: ${type}`);
        }
    }

    /**
     * 获取生成选项
     */
    getGenerationOptions(contentType, difficulty, quantity) {
        const baseOptions = { difficulty, count: quantity };

        switch (contentType) {
            case 'vocabulary':
                const vocabType = document.getElementById('vocabType')?.value;
                const vocabTopic = document.getElementById('vocabTopic')?.value;
                return { ...baseOptions, type: vocabType, topic: vocabTopic || null };
            
            case 'grammar':
                const grammarPoint = document.getElementById('grammarPoint')?.value;
                return { ...baseOptions, grammar_point: grammarPoint || null };
            
            case 'reading':
                const passageLength = document.getElementById('passageLength')?.value;
                return { ...baseOptions, passage_length: passageLength || 'medium' };
            
            case 'study_plan':
                const planDuration = document.getElementById('planDuration')?.value;
                const dailyTime = document.getElementById('dailyTime')?.value;
                return {
                    duration: parseInt(planDuration) || 30,
                    daily_time: parseInt(dailyTime) || 60,
                    difficulty
                };
            
            default:
                return baseOptions;
        }
    }

    /**
     * 显示生成结果
     */
    displayGenerationResults(results, contentType) {
        const resultsContainer = document.getElementById('generationResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '<h4>生成结果</h4>';

        results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'generated-item';
            resultItem.innerHTML = this.formatGeneratedContent(result, contentType, index + 1);
            resultsContainer.appendChild(resultItem);
        });
    }

    /**
     * 格式化生成的内容
     */
    formatGeneratedContent(content, type, index) {
        switch (type) {
            case 'vocabulary':
                return `
                    <h4>词汇练习 ${index}</h4>
                    <p><strong>问题:</strong> ${content.question}</p>
                    ${content.options ? `
                        <div><strong>选项:</strong></div>
                        <ul>
                            ${content.options.map((option, i) => 
                                `<li ${i === content.correct_answer ? 'style="color: green; font-weight: bold;"' : ''}>${option}</li>`
                            ).join('')}
                        </ul>
                    ` : ''}
                    <p><strong>解释:</strong> ${content.explanation}</p>
                    <div class="item-actions">
                        <button class="btn btn-sm btn-primary" onclick="window.AIContentGenerator.useContent('${content.id}')">使用</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="window.AIContentGenerator.editContent('${content.id}')">编辑</button>
                    </div>
                `;
            
            case 'study_plan':
                return `
                    <h4>${content.title}</h4>
                    <p><strong>时长:</strong> ${content.duration}天</p>
                    <p><strong>每日学习时间:</strong> ${content.daily_time}分钟</p>
                    <p><strong>重点领域:</strong> ${content.focus_areas.join(', ')}</p>
                    <div class="item-actions">
                        <button class="btn btn-sm btn-primary" onclick="window.AIContentGenerator.adoptPlan('${content.id}')">采用计划</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="window.AIContentGenerator.customizePlan('${content.id}')">自定义</button>
                    </div>
                `;
            
            default:
                return `
                    <h4>${type} 练习 ${index}</h4>
                    <pre>${JSON.stringify(content, null, 2)}</pre>
                `;
        }
    }

    // 辅助方法
    generateExerciseId() {
        return 'exercise_' + Date.now() + '_' + this.getNextCounter();
    }

    generatePlanId() {
        return 'plan_' + Date.now() + '_' + this.getNextCounter();
    }
    
    getNextCounter() {
        if (!this.idCounter) this.idCounter = 1;
        return this.idCounter++;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        // 使用确定性洗牌算法
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = (Date.now() + i) % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    selectRandom(array) {
        if (array.length === 0) return null;
        const index = Date.now() % array.length;
        return array[index];
    }

    generateDistractors(targetWord, count, difficulty) {
        // 简化实现 - 实际应用中需要更复杂的算法
        const distractors = ['错误选项1', '错误选项2', '错误选项3'];
        return distractors.slice(0, count);
    }

    showGenerationLoading() {
        const generateBtn = document.getElementById('generateContent');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.textContent = '生成中...';
        }
    }

    hideGenerationLoading() {
        const generateBtn = document.getElementById('generateContent');
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.textContent = '生成内容';
        }
    }

    toggleGeneratorPanel() {
        const panel = document.querySelector('.generator-body');
        const results = document.getElementById('generationResults');
        if (panel && results) {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            results.style.display = isHidden ? 'block' : 'none';
        }
    }

    /**
     * 销毁内容生成器
     */
    destroy() {
        const container = document.getElementById('ai-content-generator');
        if (container) {
            container.remove();
        }
        console.log('🤖 AI内容生成器已销毁');
    }
}

// 创建全局实例
window.AIContentGenerator = new AIContentGenerator();
