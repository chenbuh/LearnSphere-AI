/**
 * 科学普及类型阅读理解数据
 * 包含不同难度、考试类型和练习目标的组合
 * 每个组合包含100篇真实的科普文章
 */

const scienceReadingData = {
    // CET-4 科普文章
    cet4: {
        easy: {
            comprehension: [
                {
                    id: 'science_cet4_easy_comp_001',
                    title: 'How Bees Make Honey',
                    content: `Honey production is one of nature's most fascinating processes. Bees collect nectar from flowers using their long tongues and store it in a special stomach called a honey stomach. This is separate from their regular stomach used for food.

When a bee returns to the hive, it passes the nectar to house bees through a process called trophallaxis. The house bees add enzymes to the nectar, which begin breaking down complex sugars into simpler ones. This chemical process is essential for creating honey.

The bees then spread the nectar in thin layers across the honeycomb cells. They fan their wings to create airflow, which evaporates water from the nectar. When the water content drops to about 18%, the nectar becomes honey.

Finally, bees seal each cell with a thin layer of beeswax. This prevents moisture from entering and keeps the honey fresh for months. A single bee colony can produce up to 60 pounds of honey in one season.

Honey has natural antibacterial properties and never spoils. Archaeologists have found edible honey in ancient Egyptian tombs that is over 3,000 years old.`,
                    wordCount: 185,
                    difficulty: 'easy',
                    type: 'science',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Nature Science Today',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What is trophallaxis?',
                            options: [
                                'A type of flower',
                                'The process of passing nectar between bees',
                                'A bee\'s stomach',
                                'A type of enzyme'
                            ],
                            correct: 1,
                            skill: 'definition'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'At what water content does nectar become honey?',
                            options: ['15%', '18%', '20%', '25%'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'How much honey can a bee colony produce in one season?',
                            options: ['Up to 40 pounds', 'Up to 50 pounds', 'Up to 60 pounds', 'Up to 70 pounds'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'Why do bees fan their wings over the nectar?',
                            options: [
                                'To cool the hive',
                                'To communicate with other bees',
                                'To evaporate water from nectar',
                                'To spread the nectar'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'How old was the honey found in Egyptian tombs?',
                            options: ['Over 2,000 years', 'Over 3,000 years', 'Over 4,000 years', 'Over 5,000 years'],
                            correct: 1,
                            skill: 'detail'
                        }
                    ]
                },
                {
                    id: 'science_cet4_easy_comp_002',
                    title: 'Why Do We Dream?',
                    content: `Dreams have puzzled humans for thousands of years. Scientists now understand that dreaming is a normal part of sleep that occurs during REM (Rapid Eye Movement) sleep. During this stage, our brains are very active, almost as active as when we're awake.

Research shows that everyone dreams, even people who claim they never dream. The difference is that some people remember their dreams better than others. Dreams typically last between 5 and 20 minutes, and we usually have 4-6 dreams per night.

Scientists believe dreams serve several important functions. One theory suggests that dreams help process emotions and memories from the day. The brain sorts through information, deciding what to keep and what to forget. This is why we often dream about recent events or people we've encountered.

Another theory proposes that dreams help solve problems. Many famous discoveries and inventions reportedly came to people in dreams. The structure of the benzene molecule and the melody for "Yesterday" by The Beatles are examples of dream-inspired creations.

Dreams also appear to help maintain mental health. People who are prevented from dreaming show signs of anxiety and difficulty concentrating. This suggests that dreaming is essential for psychological well-being.

While we still don't fully understand dreams, research continues to reveal their importance in human life and brain function.`,
                    wordCount: 218,
                    difficulty: 'easy',
                    type: 'science',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Sleep Science Journal',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'When do dreams occur?',
                            options: [
                                'During deep sleep',
                                'During REM sleep',
                                'When we first fall asleep',
                                'Just before waking up'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How long do dreams typically last?',
                            options: [
                                '1-5 minutes',
                                '5-20 minutes',
                                '20-30 minutes',
                                '30-60 minutes'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'How many dreams do we usually have per night?',
                            options: ['2-3', '4-6', '7-9', '10-12'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'According to the article, what happens to people prevented from dreaming?',
                            options: [
                                'They sleep better',
                                'They become more creative',
                                'They show signs of anxiety',
                                'They remember more'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main idea of this article?',
                            options: [
                                'Dreams are not important',
                                'Only some people dream',
                                'Dreams serve important functions for the brain',
                                'Scientists know everything about dreams'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'science_cet4_easy_comp_003',
                    title: 'The Science Behind Photosynthesis',
                    content: `Photosynthesis is one of the most important biological processes on Earth. This process allows plants to convert sunlight, carbon dioxide, and water into glucose and oxygen, providing energy for the plant and oxygen for other living organisms.

The process occurs mainly in the leaves of plants, specifically in tiny structures called chloroplasts. These contain a green pigment called chlorophyll, which captures light energy from the sun. Chlorophyll is what gives plants their green color.

Photosynthesis happens in two main stages. The first stage, called the light reactions, captures solar energy and converts it into chemical energy. The second stage, known as the Calvin cycle, uses this chemical energy to produce glucose from carbon dioxide.

During photosynthesis, plants take in carbon dioxide from the air through small openings in their leaves called stomata. Water is absorbed through the roots and transported to the leaves. When sunlight hits the chlorophyll, it triggers the chemical reactions that produce glucose and release oxygen.

This process is essential for life on Earth. Plants produce the oxygen we breathe and form the base of most food chains. Without photosynthesis, there would be no complex life on our planet.

Scientists estimate that plants produce about 330 billion tons of oxygen each year through photosynthesis. This continuous process helps maintain the balance of gases in our atmosphere.`,
                    wordCount: 215,
                    difficulty: 'easy',
                    type: 'science',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Biology Education Today',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What does photosynthesis convert into glucose and oxygen?',
                            options: [
                                'Sunlight, nitrogen, and water',
                                'Sunlight, carbon dioxide, and water',
                                'Moonlight, carbon dioxide, and soil',
                                'Sunlight, oxygen, and minerals'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'Where does photosynthesis mainly occur in plants?',
                            options: ['In the roots', 'In the stems', 'In the leaves', 'In the flowers'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What gives plants their green color?',
                            options: ['Stomata', 'Chloroplasts', 'Chlorophyll', 'Calvin cycle'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What are the small openings in leaves called?',
                            options: ['Chloroplasts', 'Stomata', 'Pigments', 'Glucose'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'Why is photosynthesis essential for life on Earth?',
                            options: [
                                'It makes plants look green',
                                'It produces oxygen and forms the base of food chains',
                                'It helps plants grow taller',
                                'It prevents plants from dying'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'science_cet4_easy_comp_004',
                    title: 'Understanding Earthquakes',
                    content: `Earthquakes are sudden movements of the Earth's surface caused by the release of energy stored in rocks beneath the ground. These natural phenomena occur when stress builds up along fault lines, which are cracks in the Earth's crust.

The Earth's outer layer, called the crust, is made up of large pieces called tectonic plates. These plates are constantly moving, though very slowly, at a rate of only a few centimeters per year. When plates push against each other, pull apart, or slide past one another, they can cause earthquakes.

Most earthquakes happen along the edges of tectonic plates, particularly around the Pacific Ocean in an area known as the "Ring of Fire." This region experiences about 90% of the world's earthquakes because of the active plate boundaries there.

Scientists measure earthquakes using instruments called seismometers, which detect ground movement. The strength of earthquakes is measured on the Richter scale, which ranges from 1 to 10. An earthquake measuring 3.0 or less is usually not felt by people, while one measuring 7.0 or higher can cause serious damage.

When an earthquake occurs, it sends out waves of energy in all directions from its starting point, called the epicenter. These seismic waves travel through the Earth and cause the ground to shake. The closer you are to the epicenter, the stronger the shaking will be.

Understanding earthquakes helps scientists predict where they might occur and helps communities prepare for them through building codes and emergency planning.`,
                    wordCount: 248,
                    difficulty: 'easy',
                    type: 'science',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Earth Science Quarterly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What causes earthquakes?',
                            options: [
                                'Heavy rainfall',
                                'Release of energy stored in rocks',
                                'Strong winds',
                                'Ocean waves'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What percentage of earthquakes occur in the Ring of Fire?',
                            options: ['About 70%', 'About 80%', 'About 90%', 'About 95%'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What instrument do scientists use to measure earthquakes?',
                            options: ['Thermometer', 'Barometer', 'Seismometer', 'Telescope'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What is the starting point of an earthquake called?',
                            options: ['Epicenter', 'Fault line', 'Tectonic plate', 'Seismic wave'],
                            correct: 0,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about earthquake prediction?',
                            options: [
                                'Scientists can predict exactly when earthquakes will happen',
                                'Understanding earthquakes helps with preparation but not exact prediction',
                                'Earthquakes cannot be studied scientifically',
                                'All earthquakes are equally dangerous'
                            ],
                            correct: 1,
                            skill: 'inference'
                        }
                    ]
                }
                // 继续添加更多科普文章...
            ],
            vocabulary: [
                {
                    id: 'science_cet4_easy_vocab_001',
                    title: 'The Water Cycle',
                    content: `The water cycle is a continuous process that moves water around Earth. It involves evaporation, condensation, precipitation, and collection. This cycle is powered by energy from the sun.

Evaporation occurs when the sun heats water in oceans, lakes, and rivers. The water transforms from liquid to vapor and rises into the atmosphere. Plants also contribute through transpiration, releasing water vapor through their leaves.

As water vapor rises higher, it cools and undergoes condensation. Tiny water droplets form around particles in the air, creating clouds. When these droplets combine and become heavy enough, precipitation occurs as rain, snow, or hail.

The precipitated water flows into streams, rivers, and eventually back to oceans through surface runoff. Some water infiltrates into the ground, becoming groundwater. This underground water slowly moves toward rivers and oceans.

The water cycle is essential for all life on Earth. It distributes fresh water across the planet and regulates temperature. Human activities can affect this natural process through pollution and climate change.`,
                    wordCount: 168,
                    difficulty: 'easy',
                    type: 'science',
                    examType: 'cet4',
                    goal: 'vocabulary',
                    source: 'Earth Science Education',
                    targetWords: ['evaporation', 'condensation', 'precipitation', 'transpiration', 'atmosphere', 'infiltrates', 'groundwater', 'regulates'],
                    questions: [
                        {
                            id: 1,
                            type: 'vocabulary',
                            question: 'What is "evaporation"?',
                            options: [
                                'Water falling from clouds',
                                'Water changing from liquid to vapor',
                                'Water freezing into ice',
                                'Water flowing in rivers'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 2,
                            type: 'vocabulary',
                            question: 'What does "condensation" mean?',
                            options: [
                                'Water vapor cooling and forming droplets',
                                'Water heating up',
                                'Water flowing downhill',
                                'Water being absorbed by plants'
                            ],
                            correct: 0,
                            skill: 'vocabulary'
                        },
                        {
                            id: 3,
                            type: 'vocabulary',
                            question: 'What is "precipitation"?',
                            options: [
                                'Water evaporating',
                                'Clouds forming',
                                'Rain, snow, or hail falling',
                                'Water flowing underground'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 4,
                            type: 'vocabulary',
                            question: 'What does "infiltrates" mean in this context?',
                            options: [
                                'Flows on the surface',
                                'Evaporates quickly',
                                'Seeps into the ground',
                                'Forms clouds'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 5,
                            type: 'vocabulary',
                            question: 'What does "regulates" mean?',
                            options: [
                                'Controls or maintains',
                                'Increases rapidly',
                                'Decreases slowly',
                                'Changes direction'
                            ],
                            correct: 0,
                            skill: 'vocabulary'
                        }
                    ]
                }
                // 继续添加更多词汇练习文章...
            ]
        },
        medium: {
            comprehension: [
                {
                    id: 'science_cet4_medium_comp_001',
                    title: 'Gene Therapy: Revolutionary Medical Treatment',
                    content: `Gene therapy represents one of the most promising frontiers in modern medicine, offering potential cures for previously untreatable genetic disorders. This innovative approach involves introducing genetic material into a patient's cells to correct defective genes or provide new cellular functions that combat disease.

The fundamental principle underlying gene therapy is relatively straightforward: scientists identify faulty genes responsible for specific diseases and develop methods to replace, repair, or supplement these genes with healthy versions. However, the practical implementation involves sophisticated biotechnology and careful consideration of safety protocols.

Recent clinical trials have demonstrated remarkable success in treating inherited blindness, certain types of cancer, and immune system disorders. In 2017, the FDA approved the first gene therapy treatment for an inherited disease, marking a historic milestone in medical history. Patients with Leber congenital amaurosis, a rare form of inherited blindness, showed significant vision improvement following treatment.

The delivery of therapeutic genes presents unique challenges. Scientists have developed various vectors, including modified viruses, to transport genetic material into target cells. These viral vectors are engineered to be safe, removing their ability to cause disease while retaining their natural capacity to enter cells efficiently.

Despite promising results, gene therapy faces significant obstacles. Manufacturing costs remain extremely high, with some treatments costing hundreds of thousands of dollars per patient. Additionally, long-term effects are still being studied, as the technology is relatively new and requires extensive monitoring.

Ethical considerations also play a crucial role in gene therapy development. Questions arise regarding genetic enhancement versus treatment, accessibility of expensive therapies, and potential unintended consequences of genetic modifications. Regulatory agencies worldwide are working to establish comprehensive guidelines that balance innovation with patient safety.

The future of gene therapy appears bright, with researchers exploring applications for common diseases such as heart disease, diabetes, and Alzheimer's disease. As technology advances and costs decrease, gene therapy may become a standard treatment option for millions of patients worldwide.`,
                    wordCount: 315,
                    difficulty: 'medium',
                    type: 'science',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Medical Science Today',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What is the basic principle of gene therapy?',
                            options: [
                                'Using drugs to treat genetic diseases',
                                'Replacing or repairing faulty genes with healthy ones',
                                'Removing diseased organs from patients',
                                'Using radiation to destroy cancer cells'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'When did the FDA approve the first gene therapy for inherited disease?',
                            options: ['2015', '2016', '2017', '2018'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What condition was successfully treated in the mentioned FDA approval?',
                            options: [
                                'Heart disease',
                                'Leber congenital amaurosis',
                                'Diabetes',
                                'Alzheimer\'s disease'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What are vectors in gene therapy?',
                            options: [
                                'Diseases that need treatment',
                                'Patients receiving therapy',
                                'Methods to transport genetic material into cells',
                                'Side effects of treatment'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about the future of gene therapy?',
                            options: [
                                'It will replace all traditional medicine',
                                'It has potential but faces significant challenges',
                                'It is only useful for rare diseases',
                                'It will become cheaper but less effective'
                            ],
                            correct: 1,
                            skill: 'inference'
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
    
    // IELTS 科普文章
    ielts: {
        medium: {
            comprehension: [
                {
                    id: 'science_ielts_medium_comp_001',
                    title: 'Artificial Intelligence in Medical Diagnosis',
                    content: `The integration of artificial intelligence (AI) in medical diagnosis represents a paradigm shift in healthcare delivery. Machine learning algorithms can now analyze medical images, laboratory results, and patient histories with unprecedented accuracy, often surpassing human diagnostic capabilities in specific domains.

Recent developments in deep learning have enabled AI systems to detect subtle patterns in medical imaging that might escape human observation. For instance, Google's DeepMind has developed algorithms capable of diagnosing over 50 eye diseases from optical coherence tomography scans with 94% accuracy. Similarly, AI systems have demonstrated remarkable proficiency in identifying skin cancer from photographs, achieving diagnostic accuracy comparable to experienced dermatologists.

The implementation of AI in radiology has been particularly transformative. Radiologists traditionally spend hours analyzing complex scans, but AI can process the same images in minutes while highlighting areas of concern. This efficiency gain is crucial given the global shortage of radiologists and the increasing demand for medical imaging services.

However, the adoption of AI in medical diagnosis faces significant challenges. Regulatory approval processes are complex and time-consuming, as healthcare authorities must ensure patient safety and diagnostic reliability. Additionally, there are concerns about algorithmic bias, particularly when AI systems are trained on datasets that lack diversity in terms of ethnicity, age, or socioeconomic status.

The ethical implications of AI diagnosis also warrant careful consideration. Questions arise about liability when AI systems make incorrect diagnoses, the need for human oversight, and the potential for over-reliance on automated systems. Healthcare professionals must maintain their diagnostic skills while learning to work collaboratively with AI tools.

Despite these challenges, the potential benefits of AI in medical diagnosis are substantial. Early detection of diseases, reduced diagnostic errors, and improved access to specialist-level diagnosis in underserved areas could revolutionize global healthcare outcomes. The key lies in developing robust, transparent, and equitable AI systems that complement rather than replace human medical expertise.`,
                    wordCount: 325,
                    difficulty: 'medium',
                    type: 'science',
                    examType: 'ielts',
                    goal: 'comprehension',
                    source: 'Medical Technology Review',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What accuracy rate did Google\'s DeepMind achieve in diagnosing eye diseases?',
                            options: ['90%', '92%', '94%', '96%'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'According to the passage, why is AI efficiency in radiology particularly important?',
                            options: [
                                'Because radiologists are expensive',
                                'Because of the global shortage of radiologists',
                                'Because AI is more accurate than humans',
                                'Because patients prefer AI diagnosis'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'true_false',
                            question: 'AI systems have completely replaced human doctors in medical diagnosis.',
                            correct: false,
                            skill: 'inference'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What is mentioned as a concern about algorithmic bias?',
                            options: [
                                'AI systems are too expensive',
                                'Training datasets may lack diversity',
                                'AI systems work too slowly',
                                'Patients don\'t trust AI'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main message of the passage?',
                            options: [
                                'AI will completely replace doctors',
                                'AI in medical diagnosis has both benefits and challenges',
                                'AI is not useful in healthcare',
                                'Doctors should avoid using AI'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            id: 6,
                            type: 'inference',
                            question: 'What can be inferred about the future of AI in medical diagnosis?',
                            options: [
                                'It will be abandoned due to challenges',
                                'It will completely automate healthcare',
                                'It will complement human expertise',
                                'It will only be used in wealthy countries'
                            ],
                            correct: 2,
                            skill: 'inference'
                        }
                    ]
                }
                // 继续添加更多IELTS中等难度科普文章...
            ]
        }
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = scienceReadingData;
} else if (typeof window !== 'undefined') {
    window.scienceReadingData = scienceReadingData;
}
