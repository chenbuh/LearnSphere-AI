/**
 * 新闻报道类型阅读理解数据扩展文件
 * 包含更多考试类型和难度组合的完整数据
 */

const newsReadingDataExtended = {
    // CET-6 新闻文章
    cet6: {
        easy: {
            comprehension: [
                {
                    id: 'news_cet6_easy_comp_001',
                    title: 'Renewable Energy Investment Reaches Record High',
                    content: `Global investment in renewable energy technologies reached an unprecedented $380 billion in 2024, representing a 15% increase from the previous year. This surge reflects growing international commitment to combating climate change and achieving carbon neutrality goals.

Solar power attracted the largest share of investment, accounting for 45% of total funding. Wind energy followed with 30%, while hydroelectric and other renewable sources comprised the remaining 25%. China led global investment with $95 billion, followed by the United States at $75 billion and European Union countries at $68 billion.

The International Energy Agency attributes this growth to several factors, including declining technology costs, supportive government policies, and increasing corporate sustainability commitments. Solar panel costs have decreased by 60% over the past five years, making renewable energy increasingly competitive with fossil fuels.

"We're witnessing a fundamental transformation of the global energy landscape," said Dr. Maria Rodriguez, director of the Global Energy Transition Institute. "The economic case for renewable energy has never been stronger."

However, challenges remain in integrating renewable energy into existing power grids and developing adequate energy storage solutions. Grid modernization requires substantial infrastructure investment, while battery technology continues to evolve to meet large-scale storage demands.

Despite these obstacles, industry analysts project that renewable energy will account for 70% of global electricity generation by 2035, marking a decisive shift away from fossil fuel dependence.`,
                    wordCount: 225,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet6',
                    goal: 'comprehension',
                    source: 'Global Energy Report',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What was the total global investment in renewable energy in 2024?',
                            options: ['$350 billion', '$380 billion', '$400 billion', '$420 billion'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'Which country led global renewable energy investment?',
                            options: ['United States', 'European Union', 'China', 'Japan'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'By what percentage have solar panel costs decreased over five years?',
                            options: ['50%', '55%', '60%', '65%'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What can be inferred about the future of renewable energy?',
                            options: [
                                'It will remain a small part of energy production',
                                'It will become the dominant energy source',
                                'It will be replaced by nuclear energy',
                                'It will only be viable in certain countries'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main message of this article?',
                            options: [
                                'Renewable energy is too expensive',
                                'Investment in renewable energy is growing rapidly',
                                'Fossil fuels are becoming more popular',
                                'Energy storage is the biggest challenge'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'news_cet6_easy_comp_002',
                    title: 'Digital Currency Adoption Accelerates Globally',
                    content: `Central banks worldwide are accelerating the development and implementation of digital currencies, with over 80 countries currently exploring or piloting Central Bank Digital Currencies (CBDCs). This represents a significant shift in monetary policy and payment systems globally.

The People's Bank of China has emerged as a leader in this space, with its digital yuan already being tested in major cities including Beijing, Shanghai, and Shenzhen. The European Central Bank is developing a digital euro, while the Federal Reserve continues to research a potential digital dollar.

Proponents argue that digital currencies offer numerous advantages, including reduced transaction costs, enhanced financial inclusion, and improved monetary policy transmission. Digital currencies can facilitate instant cross-border payments and provide central banks with more precise tools for economic management.

"CBDCs represent the future of money," explains Dr. Sarah Kim, a monetary policy expert at the International Monetary Fund. "They combine the convenience of digital payments with the stability and trust associated with central bank-issued currency."

However, significant challenges accompany this technological advancement. Privacy concerns arise from the potential for governments to monitor all financial transactions. Additionally, the implementation of digital currencies requires substantial technological infrastructure and cybersecurity measures.

The transition to digital currencies also raises questions about the role of commercial banks and the potential impact on traditional banking systems. Some economists worry that widespread adoption of CBDCs could lead to bank disintermediation and financial instability.

Despite these concerns, the momentum toward digital currencies appears irreversible, with many experts predicting widespread adoption within the next decade.`,
                    wordCount: 258,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet6',
                    goal: 'comprehension',
                    source: 'Financial Technology Weekly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How many countries are exploring or piloting CBDCs?',
                            options: ['Over 60', 'Over 70', 'Over 80', 'Over 90'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'Which country has emerged as a leader in digital currency development?',
                            options: ['United States', 'European Union', 'Japan', 'China'],
                            correct: 3,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'According to Dr. Sarah Kim, what do CBDCs combine?',
                            options: [
                                'Speed and security',
                                'Convenience and stability',
                                'Privacy and transparency',
                                'Innovation and tradition'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What is mentioned as a potential negative consequence of CBDCs?',
                            options: [
                                'Increased transaction costs',
                                'Reduced financial inclusion',
                                'Bank disintermediation',
                                'Slower payment processing'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about the author\'s view on digital currencies?',
                            options: [
                                'Completely supportive',
                                'Completely opposed',
                                'Balanced, acknowledging both benefits and challenges',
                                'Indifferent'
                            ],
                            correct: 2,
                            skill: 'inference'
                        }
                    ]
                }
                // 继续添加更多CET-6简单理解文章...
            ],
            vocabulary: [
                {
                    id: 'news_cet6_easy_vocab_001',
                    title: 'Urban Agriculture Revolution Transforms Cities',
                    content: `Metropolitan areas worldwide are experiencing an unprecedented transformation as urban agriculture initiatives proliferate across rooftops, vacant lots, and vertical farming facilities. This agricultural renaissance addresses multiple contemporary challenges, including food security, environmental sustainability, and community development.

Vertical farming technologies have emerged as particularly innovative solutions, utilizing hydroponic and aeroponic systems to cultivate crops in controlled environments. These facilities can produce yields up to 365 times greater per square foot than traditional farming methods while consuming 95% less water.

The economic implications of urban agriculture are substantial. Local food production reduces transportation costs and carbon emissions associated with long-distance food distribution. Additionally, urban farms create employment opportunities and stimulate local economic development in previously underutilized areas.

Community gardens and rooftop farms foster social cohesion by providing spaces for neighborhood interaction and collaborative activities. Educational programs associated with these initiatives enhance food literacy and promote healthy eating habits among urban residents.

However, urban agriculture faces significant obstacles, including high initial investment costs, zoning restrictions, and limited access to suitable land. Regulatory frameworks often lag behind technological innovations, creating bureaucratic barriers for entrepreneurs and community organizations.

Despite these challenges, municipal governments increasingly recognize urban agriculture's potential contributions to sustainable development goals. Cities like Singapore, Detroit, and Amsterdam have implemented comprehensive policies to support and expand urban farming initiatives.`,
                    wordCount: 215,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet6',
                    goal: 'vocabulary',
                    source: 'Urban Development Quarterly',
                    targetWords: ['unprecedented', 'proliferate', 'renaissance', 'hydroponic', 'aeroponic', 'implications', 'substantial', 'cohesion', 'collaborative', 'literacy', 'obstacles', 'bureaucratic', 'comprehensive'],
                    questions: [
                        {
                            id: 1,
                            type: 'vocabulary',
                            question: 'What does "unprecedented" mean?',
                            options: [
                                'Expected',
                                'Never happened before',
                                'Temporary',
                                'Expensive'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 2,
                            type: 'vocabulary',
                            question: 'What does "proliferate" mean?',
                            options: [
                                'Decrease rapidly',
                                'Stay the same',
                                'Increase rapidly',
                                'Disappear completely'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 3,
                            type: 'vocabulary',
                            question: 'What does "substantial" mean in this context?',
                            options: [
                                'Minor',
                                'Significant',
                                'Temporary',
                                'Theoretical'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 4,
                            type: 'vocabulary',
                            question: 'What does "cohesion" refer to?',
                            options: [
                                'Competition',
                                'Unity and togetherness',
                                'Individual achievement',
                                'Economic growth'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 5,
                            type: 'vocabulary',
                            question: 'What does "comprehensive" mean?',
                            options: [
                                'Limited',
                                'Expensive',
                                'Complete and thorough',
                                'Temporary'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        }
                    ]
                }
                // 继续添加更多CET-6词汇练习文章...
            ]
        },
        medium: {
            comprehension: [
                {
                    id: 'news_cet6_medium_comp_001',
                    title: 'Biotechnology Advances Reshape Medical Treatment Paradigms',
                    content: `Revolutionary developments in biotechnology are fundamentally altering therapeutic approaches across multiple medical disciplines, with gene therapy, immunotherapy, and personalized medicine emerging as transformative treatment modalities. These innovations represent a paradigmatic shift from traditional symptom-based interventions toward precision medicine targeting underlying molecular mechanisms.

CRISPR-Cas9 gene editing technology has demonstrated remarkable efficacy in treating previously incurable genetic disorders. Recent clinical trials have shown successful treatment of sickle cell disease, beta-thalassemia, and certain forms of inherited blindness. The precision of this molecular tool allows researchers to modify specific DNA sequences with unprecedented accuracy, offering hope for patients with monogenic disorders.

Immunotherapy has revolutionized oncological treatment by harnessing the body's immune system to combat malignancies. CAR-T cell therapy, which involves genetically modifying patients' T-cells to recognize and destroy cancer cells, has achieved remarkable remission rates in certain hematological cancers. However, the complexity and cost of these treatments present significant accessibility challenges.

The integration of artificial intelligence and machine learning algorithms in drug discovery has accelerated the identification of therapeutic targets and biomarkers. Pharmaceutical companies are leveraging computational models to predict drug efficacy and toxicity, potentially reducing development timelines from decades to years.

Nevertheless, ethical considerations surrounding genetic modification, data privacy, and equitable access to advanced therapies remain contentious issues. Regulatory frameworks struggle to keep pace with technological innovations, creating uncertainty for researchers and patients alike.

The convergence of biotechnology, artificial intelligence, and precision medicine promises to usher in an era of truly personalized healthcare, though realizing this potential requires addressing substantial scientific, economic, and ethical challenges.`,
                    wordCount: 285,
                    difficulty: 'medium',
                    type: 'news',
                    examType: 'cet6',
                    goal: 'comprehension',
                    source: 'Biotechnology Research Journal',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What does the article suggest about the shift in medical treatment approaches?',
                            options: [
                                'From expensive to affordable treatments',
                                'From symptom-based to precision medicine',
                                'From complex to simple procedures',
                                'From individual to group therapy'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'Which diseases have been successfully treated using CRISPR-Cas9 according to the article?',
                            options: [
                                'Diabetes, hypertension, and arthritis',
                                'Sickle cell disease, beta-thalassemia, and inherited blindness',
                                'Cancer, heart disease, and stroke',
                                'Alzheimer\'s, Parkinson\'s, and epilepsy'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'inference',
                            question: 'What can be inferred about CAR-T cell therapy?',
                            options: [
                                'It is widely accessible to all patients',
                                'It is effective but has accessibility limitations',
                                'It only works for solid tumors',
                                'It has no side effects'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'How has AI impacted drug discovery according to the article?',
                            options: [
                                'It has made drugs more expensive',
                                'It has eliminated the need for clinical trials',
                                'It has accelerated target identification and reduced development time',
                                'It has replaced human researchers entirely'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'What challenges are mentioned regarding biotechnology advances?',
                            options: [
                                'Technical limitations only',
                                'Cost considerations only',
                                'Scientific, economic, and ethical challenges',
                                'Regulatory approval delays only'
                            ],
                            correct: 2,
                            skill: 'detail'
                        }
                    ]
                }
                // 继续添加更多CET-6中等难度文章...
            ]
        }
    },
    
    // TOEFL 新闻文章
    toefl: {
        easy: {
            comprehension: [
                {
                    id: 'news_toefl_easy_comp_001',
                    title: 'Archaeological Discovery Reveals Ancient Civilization Secrets',
                    content: `Archaeologists working in Peru have uncovered remarkable evidence of a previously unknown ancient civilization that flourished between 800 and 1200 CE. The discovery, made in the remote Andes Mountains, includes sophisticated irrigation systems, ceremonial structures, and intricate textile artifacts that challenge existing understanding of pre-Columbian societies.

Dr. Maria Gonzalez, the expedition leader from the International Archaeological Institute, describes the find as "extraordinary" and notes that the civilization appears to have developed advanced agricultural techniques that allowed them to thrive in harsh mountain conditions. Carbon dating of organic materials confirms the settlement's age and suggests it was inhabited for approximately 400 years.

The most significant discovery is an elaborate water management system that channeled mountain streams through a network of stone-lined canals and reservoirs. This engineering feat enabled the cultivation of crops at altitudes previously thought unsuitable for agriculture. Terraced fields extend across steep mountainsides, demonstrating remarkable adaptation to challenging terrain.

Textile fragments recovered from burial sites display sophisticated weaving techniques and vibrant dyes derived from local plants and minerals. The patterns and motifs suggest complex religious and social symbolism, indicating a highly organized society with specialized craftspeople and artistic traditions.

The site also contains numerous stone structures arranged around central plazas, suggesting communal gathering spaces for religious ceremonies and social activities. Pottery shards and tool fragments provide additional insights into daily life and technological capabilities of this ancient people.

This discovery adds to growing evidence that the pre-Columbian Americas supported diverse and sophisticated civilizations with advanced knowledge of engineering, agriculture, and social organization. Further excavations are planned to uncover more details about this remarkable society and its ultimate fate.`,
                    wordCount: 285,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'toefl',
                    goal: 'comprehension',
                    source: 'Archaeological Research Today',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'When did the newly discovered civilization flourish?',
                            options: [
                                '600-1000 CE',
                                '800-1200 CE',
                                '1000-1400 CE',
                                '1200-1600 CE'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'Where was the archaeological discovery made?',
                            options: [
                                'Amazon rainforest',
                                'Coastal plains',
                                'Andes Mountains',
                                'Desert regions'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What was the most significant discovery according to the article?',
                            options: [
                                'Textile fragments',
                                'Stone structures',
                                'Water management system',
                                'Pottery shards'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What can be inferred about this ancient civilization?',
                            options: [
                                'They were primarily nomadic',
                                'They had limited technological knowledge',
                                'They were highly organized and skilled',
                                'They lived in small, isolated groups'
                            ],
                            correct: 2,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main significance of this archaeological discovery?',
                            options: [
                                'It proves ancient people were more advanced than previously thought',
                                'It shows that mountain living was impossible in ancient times',
                                'It demonstrates the importance of textile production',
                                'It reveals the location of hidden treasure'
                            ],
                            correct: 0,
                            skill: 'main_idea'
                        },
                        {
                            id: 6,
                            type: 'vocabulary',
                            question: 'What does "flourished" mean in this context?',
                            options: [
                                'Struggled to survive',
                                'Thrived and prospered',
                                'Gradually disappeared',
                                'Remained unchanged'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        }
                    ]
                }
                // 继续添加更多TOEFL简单文章...
            ]
        }
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = newsReadingDataExtended;
} else if (typeof window !== 'undefined') {
    window.newsReadingDataExtended = newsReadingDataExtended;
}
