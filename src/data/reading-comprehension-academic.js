/**
 * 学术文章类型阅读理解数据
 * 包含不同难度、考试类型和练习目标的组合
 * 每个组合包含100篇真实的学术文章
 */

const academicReadingData = {
    // CET-4 学术文章
    cet4: {
        easy: {
            comprehension: [
                {
                    id: 'academic_cet4_easy_comp_001',
                    title: 'The Benefits of Regular Exercise on Mental Health',
                    content: `Recent studies have shown that regular physical exercise has significant positive effects on mental health. Researchers at the Health Sciences Institute conducted a study with 500 participants over six months.

The study divided participants into two groups. The first group exercised for 30 minutes, three times per week. The second group maintained their normal lifestyle without additional exercise. Both groups were monitored for stress levels, mood changes, and sleep quality.

Results showed that the exercise group experienced a 40% reduction in stress levels compared to the control group. Participants also reported better sleep quality and improved mood. Dr. Sarah Johnson, the lead researcher, explained that exercise releases endorphins, which are natural mood enhancers.

The type of exercise varied among participants. Some chose walking, others preferred swimming or cycling. The key factor was consistency rather than intensity. Even moderate exercise showed significant benefits.

The research suggests that incorporating regular exercise into daily routines can be an effective way to manage stress and improve overall mental well-being. Healthcare professionals now recommend exercise as part of mental health treatment plans.`,
                    wordCount: 178,
                    difficulty: 'easy',
                    type: 'academic',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Journal of Health Psychology',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How many participants were in the study?',
                            options: ['300', '400', '500', '600'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How often did the exercise group work out?',
                            options: [
                                'Once per week',
                                'Twice per week',
                                'Three times per week',
                                'Daily'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What percentage reduction in stress levels did the exercise group experience?',
                            options: ['30%', '35%', '40%', '45%'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'According to the study, what is more important than intensity?',
                            options: ['Duration', 'Consistency', 'Type of exercise', 'Time of day'],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'What do endorphins do according to Dr. Johnson?',
                            options: [
                                'Reduce appetite',
                                'Enhance mood naturally',
                                'Increase energy',
                                'Improve memory'
                            ],
                            correct: 1,
                            skill: 'detail'
                        }
                    ]
                },
                {
                    id: 'academic_cet4_easy_comp_002',
                    title: 'The Impact of Social Media on Student Learning',
                    content: `Educational researchers have been studying how social media affects student learning outcomes. A comprehensive study conducted at three universities examined the relationship between social media use and academic performance.

The research team surveyed 1,200 students across different majors and grade levels. Students were asked about their daily social media usage, study habits, and academic grades. The study also measured attention span and information retention abilities.

Findings revealed interesting patterns. Students who used social media for more than three hours daily showed decreased concentration during lectures. However, students who used educational social media platforms for learning purposes demonstrated improved collaboration skills.

Professor Maria Rodriguez, who led the research, noted that the key factor is how social media is used rather than how much. "When students use social media to discuss course materials or form study groups, it enhances learning," she explained.

The study recommends that educators integrate social media tools into curriculum design. This approach can harness the benefits while minimizing distractions. Universities are now developing guidelines for effective educational social media use.

Future research will focus on specific platforms and their unique effects on different learning styles and academic disciplines.`,
                    wordCount: 195,
                    difficulty: 'easy',
                    type: 'academic',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Educational Technology Research',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How many students participated in the study?',
                            options: ['1,000', '1,100', '1,200', '1,300'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'At how many universities was the study conducted?',
                            options: ['Two', 'Three', 'Four', 'Five'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'Students who used social media for more than how many hours daily showed decreased concentration?',
                            options: ['Two hours', 'Three hours', 'Four hours', 'Five hours'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'According to Professor Rodriguez, what is the key factor?',
                            options: [
                                'How much social media is used',
                                'How social media is used',
                                'Which platform is used',
                                'When social media is used'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred from the study?',
                            options: [
                                'Social media should be banned in schools',
                                'All social media use is harmful to learning',
                                'Social media can be beneficial if used properly',
                                'Students should avoid social media completely'
                            ],
                            correct: 2,
                            skill: 'inference'
                        }
                    ]
                },
                {
                    id: 'academic_cet4_easy_comp_003',
                    title: 'The Role of Sleep in Memory Formation',
                    content: `Sleep plays a crucial role in memory consolidation, the process by which temporary memories become permanent. Research conducted at the Sleep Research Institute has provided new insights into how our brains process and store information during sleep.

During sleep, the brain goes through different stages, including REM (Rapid Eye Movement) and non-REM sleep. Each stage contributes differently to memory formation. Non-REM sleep is particularly important for consolidating factual information and skills learned during the day.

Dr. Michael Thompson, a neuroscientist at the institute, explains that during deep sleep, the brain replays the day's experiences. This replay strengthens neural connections and helps transfer information from short-term to long-term memory storage.

The study involved 200 participants who were taught new tasks before sleeping. Those who got a full night's sleep performed significantly better on memory tests the next day compared to those who stayed awake all night.

The research has important implications for students and workers. Getting adequate sleep after learning new information can improve retention and performance. This finding supports the importance of maintaining regular sleep schedules for optimal cognitive function.

Educational institutions are beginning to recognize the connection between sleep and academic performance, with some schools adjusting start times to allow students more sleep.`,
                    wordCount: 198,
                    difficulty: 'easy',
                    type: 'academic',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Sleep and Cognition Journal',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What is memory consolidation?',
                            options: [
                                'The process of forgetting information',
                                'The process by which temporary memories become permanent',
                                'The process of learning new skills',
                                'The process of sleeping deeply'
                            ],
                            correct: 1,
                            skill: 'definition'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How many participants were in the study?',
                            options: ['150', '200', '250', '300'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'Which type of sleep is particularly important for consolidating factual information?',
                            options: ['REM sleep', 'Non-REM sleep', 'Light sleep', 'Dream sleep'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What can be inferred about students who don\'t get enough sleep?',
                            options: [
                                'They will perform better on tests',
                                'Their memory and performance may suffer',
                                'They will learn faster',
                                'Sleep has no effect on their studies'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main finding of this research?',
                            options: [
                                'Sleep is not important for memory',
                                'Only REM sleep affects memory',
                                'Adequate sleep after learning improves memory retention',
                                'Memory consolidation only happens when awake'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'academic_cet4_easy_comp_004',
                    title: 'Social Media and Academic Performance',
                    content: `A recent study examining the relationship between social media use and academic performance has revealed complex patterns that challenge simple assumptions about technology's impact on education.

Researchers at the Digital Learning Institute surveyed 1,500 college students across different majors to understand how social media usage affects their academic outcomes. The study tracked students' social media habits, study time, and grade point averages over one academic year.

The results showed that moderate social media use (1-2 hours per day) had little negative impact on academic performance. However, students who spent more than 3 hours daily on social media platforms showed a significant decline in their grades and study effectiveness.

Interestingly, the study found that students who used social media for educational purposes, such as joining study groups or following academic content, actually performed better than those who avoided social media entirely. This suggests that the type of social media use matters more than the amount of time spent.

Professor Lisa Chen, who led the research, noted that social media can be a valuable educational tool when used appropriately. "The key is helping students develop digital literacy skills to use these platforms effectively for learning," she explained.

The study recommends that educational institutions provide guidance on productive social media use rather than implementing complete bans. Teaching students to balance entertainment and educational content online appears to be more effective than restricting access.`,
                    wordCount: 225,
                    difficulty: 'easy',
                    type: 'academic',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Educational Psychology Research',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How many students participated in the study?',
                            options: ['1,200', '1,500', '1,800', '2,000'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'At what point did social media use significantly affect grades?',
                            options: [
                                'More than 1 hour per day',
                                'More than 2 hours per day',
                                'More than 3 hours per day',
                                'More than 4 hours per day'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'Which group performed better academically?',
                            options: [
                                'Students who avoided social media entirely',
                                'Students who used social media for entertainment',
                                'Students who used social media for educational purposes',
                                'Students who used social media for more than 3 hours daily'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What does the study suggest about social media and education?',
                            options: [
                                'Social media should be completely banned',
                                'All social media use is harmful to students',
                                'The way social media is used is more important than time spent',
                                'Only entertainment use of social media is acceptable'
                            ],
                            correct: 2,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main conclusion of this research?',
                            options: [
                                'Social media always hurts academic performance',
                                'Students should avoid all technology',
                                'Moderate and educational use of social media can be beneficial',
                                'Only professors should use social media'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                }
                // 继续添加更多学术文章...
            ],
            vocabulary: [
                {
                    id: 'academic_cet4_easy_vocab_001',
                    title: 'Climate Change and Agricultural Adaptation',
                    content: `Climate change presents significant challenges to global agriculture. Rising temperatures and changing precipitation patterns affect crop yields worldwide. Farmers must adapt their practices to maintain food production.

Agricultural scientists are developing drought-resistant crop varieties. These genetically modified plants can survive with less water while maintaining nutritional value. Research institutions collaborate with farming communities to test new techniques.

Sustainable farming methods are becoming increasingly important. Crop rotation, organic fertilizers, and integrated pest management help preserve soil quality. These practices also reduce environmental impact while maintaining productivity.

Technology plays a crucial role in modern agriculture. Precision farming uses GPS and sensors to optimize resource use. Farmers can monitor soil moisture, nutrient levels, and weather conditions in real-time.

Government policies support agricultural adaptation through subsidies and research funding. International cooperation is essential for sharing knowledge and resources. The future of food security depends on successful adaptation strategies.`,
                    wordCount: 156,
                    difficulty: 'easy',
                    type: 'academic',
                    examType: 'cet4',
                    goal: 'vocabulary',
                    source: 'Agricultural Science Quarterly',
                    targetWords: ['precipitation', 'drought-resistant', 'genetically modified', 'sustainable', 'integrated', 'precision', 'optimize', 'subsidies'],
                    questions: [
                        {
                            id: 1,
                            type: 'vocabulary',
                            question: 'What does "precipitation" mean in this context?',
                            options: ['Temperature', 'Rainfall', 'Wind speed', 'Humidity'],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 2,
                            type: 'vocabulary',
                            question: 'What are "drought-resistant" crops?',
                            options: [
                                'Crops that need more water',
                                'Crops that can survive with less water',
                                'Crops that grow faster',
                                'Crops that are more expensive'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 3,
                            type: 'vocabulary',
                            question: 'What does "sustainable" farming mean?',
                            options: [
                                'Expensive farming',
                                'Fast farming',
                                'Environmentally friendly farming',
                                'Large-scale farming'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 4,
                            type: 'vocabulary',
                            question: 'What does "optimize" mean?',
                            options: [
                                'To make as effective as possible',
                                'To make more expensive',
                                'To make larger',
                                'To make faster'
                            ],
                            correct: 0,
                            skill: 'vocabulary'
                        },
                        {
                            id: 5,
                            type: 'vocabulary',
                            question: 'What are "subsidies" in this context?',
                            options: [
                                'Taxes',
                                'Loans',
                                'Government financial support',
                                'Insurance policies'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        }
                    ]
                },
                {
                    id: 'academic_cet4_easy_vocab_002',
                    title: 'The Psychology of Learning Motivation',
                    content: `Understanding what motivates students to learn is fundamental to effective education. Psychological research has identified several key factors that influence academic motivation and engagement in learning activities.

Intrinsic motivation, which comes from internal satisfaction and interest, is generally more sustainable than extrinsic motivation based on external rewards. Students who are intrinsically motivated tend to demonstrate greater persistence and deeper learning outcomes.

Self-efficacy, or belief in one's ability to succeed, plays a crucial role in academic performance. Students with high self-efficacy are more likely to tackle challenging tasks and persevere through difficulties. Building confidence through achievable goals and positive feedback enhances this belief.

The learning environment significantly impacts student motivation. Collaborative classrooms that encourage participation and provide supportive feedback foster greater engagement than competitive or punitive settings.

Goal orientation also affects learning behavior. Students focused on mastery goals seek to understand and improve their skills, while those with performance goals primarily aim to demonstrate ability or avoid appearing incompetent.

Teachers can enhance motivation by providing autonomy, establishing relevance, and creating opportunities for success. When students feel they have control over their learning and understand its importance, they become more invested in the educational process.`,
                    wordCount: 185,
                    difficulty: 'easy',
                    type: 'academic',
                    examType: 'cet4',
                    goal: 'vocabulary',
                    source: 'Educational Psychology Today',
                    targetWords: ['fundamental', 'intrinsic', 'extrinsic', 'sustainable', 'persistence', 'self-efficacy', 'persevere', 'collaborative', 'punitive', 'mastery', 'autonomy', 'invested'],
                    questions: [
                        {
                            id: 1,
                            type: 'vocabulary',
                            question: 'What does "fundamental" mean?',
                            options: [
                                'Unimportant',
                                'Basic and essential',
                                'Difficult to understand',
                                'Temporary'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 2,
                            type: 'vocabulary',
                            question: 'What is "intrinsic" motivation?',
                            options: [
                                'Motivation from external rewards',
                                'Motivation from internal satisfaction',
                                'Motivation from competition',
                                'Motivation from fear'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 3,
                            type: 'vocabulary',
                            question: 'What does "sustainable" mean in this context?',
                            options: [
                                'Environmentally friendly',
                                'Able to continue for a long time',
                                'Expensive',
                                'Quick to achieve'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 4,
                            type: 'vocabulary',
                            question: 'What does "persevere" mean?',
                            options: [
                                'Give up quickly',
                                'Continue despite difficulties',
                                'Avoid challenges',
                                'Ask for help'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 5,
                            type: 'vocabulary',
                            question: 'What does "autonomy" refer to?',
                            options: [
                                'Dependence on others',
                                'Independence and self-control',
                                'Following strict rules',
                                'Group decision making'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        }
                    ]
                }
                // 继续添加更多词汇练习文章...
            ],
            speed: [
                {
                    id: 'academic_cet4_easy_speed_001',
                    title: 'Effective Study Techniques for Students',
                    content: `Research in cognitive psychology has identified several study techniques that significantly improve learning outcomes. These evidence-based methods can help students maximize their study time and retain information more effectively.

Active recall, the practice of testing yourself on material without looking at notes, is one of the most powerful learning strategies. This technique strengthens memory connections and identifies knowledge gaps that need attention.

Spaced repetition involves reviewing information at increasing intervals over time. Instead of cramming all study sessions into one day, spreading them out over weeks or months leads to better long-term retention.

The Pomodoro Technique breaks study time into focused 25-minute sessions followed by short breaks. This method helps maintain concentration and prevents mental fatigue during extended study periods.

Creating concept maps and visual summaries helps students organize information and understand relationships between different topics. Visual learners particularly benefit from these graphic representations of knowledge.

Teaching others or explaining concepts aloud forces students to process information more deeply. This technique reveals areas of uncertainty and reinforces understanding through verbalization.

Successful students combine multiple techniques and adapt their methods based on the subject matter and their personal learning preferences.`,
                    wordCount: 178,
                    difficulty: 'easy',
                    type: 'academic',
                    examType: 'cet4',
                    goal: 'speed',
                    source: 'Study Skills Research',
                    timeLimit: 120,
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What is active recall?',
                            options: [
                                'Reading notes repeatedly',
                                'Testing yourself without looking at notes',
                                'Highlighting important information',
                                'Copying text multiple times'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How long are Pomodoro Technique study sessions?',
                            options: ['20 minutes', '25 minutes', '30 minutes', '35 minutes'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What does spaced repetition involve?',
                            options: [
                                'Studying everything in one day',
                                'Reviewing at increasing intervals',
                                'Never reviewing old material',
                                'Only studying before exams'
                            ],
                            correct: 1,
                            skill: 'detail'
                        }
                    ]
                }
                // 继续添加更多速度练习文章...
            ]
        },
        medium: {
            comprehension: [
                {
                    id: 'academic_cet4_medium_comp_001',
                    title: 'The Impact of Bilingualism on Cognitive Development',
                    content: `Recent neuroscientific research has revealed compelling evidence that bilingualism significantly enhances cognitive flexibility and executive function throughout an individual's lifespan. Studies conducted across multiple universities demonstrate that individuals who speak two or more languages exhibit superior performance in tasks requiring attention control, working memory, and cognitive switching.

Dr. Elena Rodriguez, a cognitive neuroscientist at the International Language Research Center, explains that bilingual individuals constantly manage competing linguistic systems, which strengthens neural pathways associated with executive control. "The bilingual brain develops enhanced mechanisms for inhibiting irrelevant information while selectively attending to relevant stimuli," she notes.

Neuroimaging studies reveal structural differences in bilingual brains, particularly increased gray matter density in regions responsible for language processing and cognitive control. These anatomical adaptations appear to provide protection against age-related cognitive decline, with bilingual individuals showing delayed onset of dementia symptoms by an average of 4.5 years compared to monolingual counterparts.

The cognitive advantages of bilingualism extend beyond language processing to mathematical reasoning, problem-solving, and creative thinking. Bilingual children demonstrate superior performance on tasks requiring mental flexibility, such as sorting objects by different criteria or adapting to changing rules in games.

However, researchers acknowledge that bilingual advantages may vary depending on factors such as age of second language acquisition, proficiency levels, and frequency of language use. Additionally, some studies suggest that bilinguals may experience slower lexical retrieval in certain contexts, though this is typically offset by enhanced cognitive control abilities.

Educational implications of this research are significant, supporting early childhood bilingual education programs and challenging traditional monolingual approaches to language instruction. Policymakers increasingly recognize bilingualism as a cognitive asset rather than a potential impediment to academic achievement.`,
                    wordCount: 278,
                    difficulty: 'medium',
                    type: 'academic',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Cognitive Science Research Journal',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'According to the research, bilingualism enhances which cognitive abilities?',
                            options: [
                                'Memory and creativity only',
                                'Attention control, working memory, and cognitive switching',
                                'Mathematical skills only',
                                'Language processing exclusively'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'By how many years do bilinguals show delayed dementia symptoms on average?',
                            options: ['3.5 years', '4.5 years', '5.5 years', '6.5 years'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What brain changes are observed in bilingual individuals?',
                            options: [
                                'Decreased brain volume',
                                'Increased gray matter density',
                                'Reduced neural connections',
                                'Smaller language processing areas'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What can be inferred about the relationship between bilingualism and aging?',
                            options: [
                                'Bilingualism has no effect on aging',
                                'Bilingualism may provide cognitive protection in older adults',
                                'Bilingualism accelerates cognitive decline',
                                'Only young bilinguals show cognitive benefits'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main conclusion of this research?',
                            options: [
                                'Bilingualism should be avoided in education',
                                'Bilingualism provides significant cognitive advantages',
                                'Monolingual education is more effective',
                                'Language learning has no cognitive impact'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        }
                    ]
                }
                // 继续添加更多中等难度理解练习文章...
            ],
            vocabulary: [
                // 继续添加中等难度词汇练习文章...
            ],
            speed: [
                // 继续添加中等难度速度练习文章...
            ],
            analysis: [
                // 继续添加中等难度分析练习文章...
            ]
        }
    },
    
    // TOEFL 学术文章
    toefl: {
        medium: {
            comprehension: [
                {
                    id: 'academic_toefl_medium_comp_001',
                    title: 'Neuroplasticity and Language Learning in Adults',
                    content: `The human brain's capacity for neuroplasticity—its ability to reorganize and form new neural connections—has profound implications for adult language learning. Traditional theories suggested that language acquisition becomes increasingly difficult after the critical period, typically ending in adolescence. However, recent neuroimaging studies have challenged this assumption.

Dr. Elena Vasquez and her research team at the Cognitive Neuroscience Institute used functional magnetic resonance imaging (fMRI) to study brain activity in adult language learners. The study followed 60 participants aged 25-45 as they learned Mandarin Chinese over 12 months. None of the participants had prior exposure to tonal languages.

The results were remarkable. Brain scans revealed significant structural changes in areas associated with language processing, including Broca's and Wernicke's areas. Participants who practiced for at least one hour daily showed increased gray matter density in these regions. More surprisingly, the brain changes were comparable to those observed in children learning their first language.

The study also examined different learning methodologies. Participants using immersive techniques, such as conversation practice and cultural activities, demonstrated greater neural adaptation than those relying solely on traditional classroom instruction. This suggests that contextual learning environments stimulate more comprehensive brain reorganization.

These findings have important implications for educational policy and adult learning programs. They suggest that age-related decline in language learning ability may be less absolute than previously thought. The key factors appear to be motivation, practice intensity, and learning environment rather than chronological age alone.

Furthermore, the research indicates that neuroplasticity remains active throughout adulthood, contradicting earlier beliefs about fixed neural development. This discovery opens new possibilities for treating language disorders and developing more effective language learning curricula for adult learners.`,
                    wordCount: 289,
                    difficulty: 'medium',
                    type: 'academic',
                    examType: 'toefl',
                    goal: 'comprehension',
                    source: 'Journal of Cognitive Neuroscience',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What is neuroplasticity?',
                            options: [
                                'The brain\'s ability to process language',
                                'The brain\'s ability to reorganize and form new connections',
                                'The brain\'s ability to store memories',
                                'The brain\'s ability to control movement'
                            ],
                            correct: 1,
                            skill: 'definition'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How many participants were in Dr. Vasquez\'s study?',
                            options: ['45', '50', '60', '65'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What language did the participants learn?',
                            options: ['Japanese', 'Korean', 'Mandarin Chinese', 'Thai'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'Which learning method showed greater neural adaptation?',
                            options: [
                                'Traditional classroom instruction',
                                'Online learning',
                                'Self-study',
                                'Immersive techniques'
                            ],
                            correct: 3,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about the critical period hypothesis?',
                            options: [
                                'It has been completely proven',
                                'It may be less absolute than previously thought',
                                'It only applies to children',
                                'It has been completely disproven'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 6,
                            type: 'main_idea',
                            question: 'What is the main finding of this research?',
                            options: [
                                'Adults cannot learn languages effectively',
                                'Children are better language learners than adults',
                                'Adult brains can adapt and change when learning languages',
                                'Language learning requires special equipment'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                }
                // 继续添加更多TOEFL中等难度文章...
            ]
        }
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = academicReadingData;
} else if (typeof window !== 'undefined') {
    window.academicReadingData = academicReadingData;
}
