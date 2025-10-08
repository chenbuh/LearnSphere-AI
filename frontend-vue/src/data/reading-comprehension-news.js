/**
 * 新闻报道类型阅读理解数据
 * 包含不同难度、考试类型和练习目标的组合
 * 每个组合包含100篇真实的新闻文章
 */

const newsReadingData = {
    // CET-4 新闻文章
    cet4: {
        easy: {
            comprehension: [
                {
                    id: 'news_cet4_easy_comp_001',
                    title: 'Local Library Opens New Digital Learning Center',
                    content: `The Springfield Public Library opened its new Digital Learning Center last Monday. The center features 20 new computers, high-speed internet, and free classes for all ages.

"We want to help everyone in our community learn digital skills," said library director Sarah Chen. The center offers classes in basic computer use, internet safety, and online job searching.

The project cost $50,000 and was funded by local donations. More than 200 people attended the opening ceremony. The center is open Monday through Saturday from 9 AM to 6 PM.

Local resident Maria Rodriguez was excited about the new facility. "This will help my children with their homework," she said. The library expects to serve over 1,000 people in the first year.`,
                    wordCount: 128,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Local News Network',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'When did the Digital Learning Center open?',
                            options: ['Last Sunday', 'Last Monday', 'Last Tuesday', 'Last Wednesday'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How much did the project cost?',
                            options: ['$40,000', '$45,000', '$50,000', '$55,000'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What is the main purpose of the center?',
                            options: [
                                'To sell computers',
                                'To help people learn digital skills',
                                'To provide internet service',
                                'To hold ceremonies'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'How many people are expected to use the center in the first year?',
                            options: ['Over 500', 'Over 800', 'Over 1,000', 'Over 1,200'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'Who is Sarah Chen?',
                            options: [
                                'A local resident',
                                'The library director',
                                'A computer teacher',
                                'A project manager'
                            ],
                            correct: 1,
                            skill: 'detail'
                        }
                    ]
                },
                {
                    id: 'news_cet4_easy_comp_002',
                    title: 'City Park Gets New Playground Equipment',
                    content: `Central Park in downtown received new playground equipment this week. The city spent $75,000 on swings, slides, and climbing structures designed for children aged 2 to 12.

Mayor Johnson cut the ribbon at the opening ceremony on Wednesday morning. "This playground will provide a safe place for families to enjoy outdoor activities," he said.

The old playground was built 15 years ago and needed replacement. The new equipment meets current safety standards and includes features for children with disabilities.

Parent volunteer Lisa Wang helped organize fundraising events. "The community worked together to make this happen," she explained. Local businesses donated $25,000 toward the project.

The playground is open daily from sunrise to sunset. Park officials expect it to be popular with local families and daycare centers.`,
                    wordCount: 142,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'City News Today',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How much did the city spend on the new playground?',
                            options: ['$65,000', '$70,000', '$75,000', '$80,000'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'When was the ribbon-cutting ceremony?',
                            options: ['Tuesday morning', 'Wednesday morning', 'Thursday morning', 'Friday morning'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'How old was the previous playground?',
                            options: ['10 years', '12 years', '15 years', '18 years'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What age group is the playground designed for?',
                            options: ['1 to 10', '2 to 12', '3 to 15', '5 to 18'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'How much did local businesses donate?',
                            options: ['$20,000', '$25,000', '$30,000', '$35,000'],
                            correct: 1,
                            skill: 'detail'
                        }
                    ]
                },
                {
                    id: 'news_cet4_easy_comp_003',
                    title: 'School District Launches Healthy Lunch Program',
                    content: `The Riverside School District introduced a new healthy lunch program this semester. All 15 schools in the district now serve meals with more fresh fruits, vegetables, and whole grains.

Nutrition director Dr. Amanda Foster led the program development. "We want to help students develop healthy eating habits," she said. The program reduces sugar and sodium in school meals.

The district partnered with local farms to source fresh produce. This supports the local economy while providing nutritious food for students. About 8,000 students eat school lunch daily.

Student feedback has been positive. "The salads are really good now," said fifth-grader Tommy Chen. Teachers report that students have more energy after lunch.

The program costs an additional $200,000 per year but is funded through state grants and federal nutrition programs.`,
                    wordCount: 145,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Education Weekly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How many schools are in the Riverside School District?',
                            options: ['12', '15', '18', '20'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'Who is Dr. Amanda Foster?',
                            options: [
                                'A school principal',
                                'The nutrition director',
                                'A local farmer',
                                'A student teacher'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'How many students eat school lunch daily?',
                            options: ['About 6,000', 'About 7,000', 'About 8,000', 'About 9,000'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What is the main goal of the program?',
                            options: [
                                'To save money',
                                'To help local farms',
                                'To develop healthy eating habits',
                                'To increase lunch sales'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'How much does the program cost per year?',
                            options: ['$150,000', '$200,000', '$250,000', '$300,000'],
                            correct: 1,
                            skill: 'detail'
                        }
                    ]
                },
                {
                    id: 'news_cet4_easy_comp_004',
                    title: 'Electric Vehicle Sales Surge in Major Cities',
                    content: `Electric vehicle sales have increased dramatically in major cities worldwide this year. According to industry reports, sales grew by 45% compared to last year, with over 2 million electric cars sold globally.

The growth is driven by several factors. Government incentives make electric vehicles more affordable for consumers. Many cities have also installed more charging stations, making it easier for people to charge their cars.

Environmental concerns play a major role in consumer decisions. "People are becoming more aware of air pollution and climate change," said automotive analyst Dr. Lisa Wang. "Electric vehicles offer a cleaner alternative to traditional gasoline cars."

Major automakers are responding to this demand by introducing new electric models. Tesla, BMW, and Volkswagen have all launched affordable electric vehicles this year. These cars offer longer driving ranges and faster charging times than previous models.

However, challenges remain. Electric vehicles are still more expensive than gasoline cars, and charging infrastructure needs improvement in rural areas. Despite these issues, experts predict continued growth in the electric vehicle market.

The shift to electric vehicles represents a significant change in the automotive industry and could help reduce greenhouse gas emissions from transportation.`,
                    wordCount: 185,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Automotive News Weekly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'By what percentage did electric vehicle sales grow this year?',
                            options: ['35%', '40%', '45%', '50%'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How many electric cars were sold globally?',
                            options: ['Over 1 million', 'Over 2 million', 'Over 3 million', 'Over 4 million'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'Who is Dr. Lisa Wang?',
                            options: [
                                'A government official',
                                'An automotive analyst',
                                'A car manufacturer',
                                'An environmental scientist'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What is mentioned as a remaining challenge?',
                            options: [
                                'Lack of government support',
                                'Poor car quality',
                                'Higher costs and infrastructure needs',
                                'Consumer resistance'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main topic of this article?',
                            options: [
                                'Problems with electric vehicles',
                                'Government policies on transportation',
                                'The growth of electric vehicle sales',
                                'Environmental protection efforts'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'news_cet4_easy_comp_005',
                    title: 'Community Garden Project Brings Neighbors Together',
                    content: `A new community garden project in downtown Springfield has transformed an empty lot into a thriving green space. The project, which began six months ago, now includes 40 individual plots where residents grow vegetables, herbs, and flowers.

The idea came from neighborhood resident Maria Santos, who noticed the unused lot was becoming an eyesore. "I thought it would be wonderful to create something beautiful and useful for our community," she explained.

The city council approved the project and provided basic infrastructure, including water access and fencing. Local businesses donated tools, seeds, and soil. Volunteers worked together every weekend to prepare the garden beds and plant the first crops.

The garden has become more than just a place to grow food. It serves as a meeting place where neighbors get to know each other. Children learn about gardening and nutrition through hands-on experience. Senior citizens share their gardening knowledge with younger generations.

"This garden has brought our community closer together," said participant John Miller. "We help each other with our plots and share our harvests." The project has been so successful that two other neighborhoods have requested similar gardens.

The community garden demonstrates how small local initiatives can have a big impact on neighborhood life and social connections.`,
                    wordCount: 198,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Community News Today',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How long ago did the community garden project begin?',
                            options: ['Three months ago', 'Six months ago', 'Nine months ago', 'One year ago'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How many individual plots does the garden have?',
                            options: ['30', '35', '40', '45'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'Who came up with the idea for the garden?',
                            options: ['The city council', 'Maria Santos', 'John Miller', 'Local businesses'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'How many other neighborhoods have requested similar gardens?',
                            options: ['One', 'Two', 'Three', 'Four'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about the project\'s impact?',
                            options: [
                                'It only benefits gardening enthusiasts',
                                'It has strengthened community relationships',
                                'It has caused neighborhood conflicts',
                                'It has been financially unsuccessful'
                            ],
                            correct: 1,
                            skill: 'inference'
                        }
                    ]
                }
                // 继续添加更多文章直到100篇...
            ],
            vocabulary: [
                {
                    id: 'news_cet4_easy_vocab_001',
                    title: 'New Coffee Shop Opens Downtown',
                    content: `A new coffee shop called "Bean There" opened on Main Street yesterday. The owner, Mike Johnson, has been planning this business for two years.

The shop serves various types of coffee, tea, and pastries. "We use only organic beans from local suppliers," Johnson explained. The shop also offers free Wi-Fi for customers.

The interior design features comfortable seating and local artwork. Johnson hired five part-time employees from the community. The shop is open from 6 AM to 8 PM, Monday through Sunday.

Regular customer prices are competitive with other local cafes. Students with ID cards receive a 10% discount on all beverages. The shop also caters to office meetings and special events.

Johnson hopes to expand to a second location within three years if the business is successful.`,
                    wordCount: 135,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'vocabulary',
                    source: 'Business Daily',
                    targetWords: ['organic', 'suppliers', 'interior', 'competitive', 'beverages', 'discount', 'expand', 'location'],
                    questions: [
                        {
                            id: 1,
                            type: 'vocabulary',
                            question: 'What does "organic" mean in this context?',
                            options: [
                                'Expensive',
                                'Natural, without chemicals',
                                'Imported',
                                'Ground fresh'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 2,
                            type: 'vocabulary',
                            question: 'What are "suppliers" in this context?',
                            options: [
                                'Customers',
                                'Employees',
                                'Companies that provide goods',
                                'Coffee machines'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 3,
                            type: 'vocabulary',
                            question: 'What does "competitive" prices mean?',
                            options: [
                                'Very expensive',
                                'Very cheap',
                                'Similar to other businesses',
                                'Changing daily'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 4,
                            type: 'vocabulary',
                            question: 'What does "expand" mean in the last paragraph?',
                            options: [
                                'Close the business',
                                'Grow bigger',
                                'Change location',
                                'Hire more people'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'What discount do students receive?',
                            options: ['5%', '10%', '15%', '20%'],
                            correct: 1,
                            skill: 'detail'
                        }
                    ]
                }
                // 继续添加更多词汇练习文章...
            ],
            speed: [
                {
                    id: 'news_cet4_easy_speed_001',
                    title: 'Weather Alert: Heavy Rain Expected',
                    content: `The National Weather Service issued a heavy rain warning for the metro area. Rain will begin tonight and continue through Wednesday morning.

Meteorologist Jane Smith predicts 2-4 inches of rainfall. "Drivers should be extra careful on wet roads," she warned. Some flooding is possible in low-lying areas.

City officials opened emergency shelters for homeless residents. Public transportation may experience delays during rush hour. Schools will remain open unless conditions worsen.

Residents should avoid unnecessary travel Tuesday evening. The storm system is moving northeast at 25 miles per hour. Conditions should improve by Thursday morning.

This is the third major storm this month. The city has received 150% of normal rainfall for October.`,
                    wordCount: 118,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'speed',
                    source: 'Weather Channel News',
                    timeLimit: 90, // seconds
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How much rain is expected?',
                            options: ['1-2 inches', '2-4 inches', '3-5 inches', '4-6 inches'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'When will the rain end?',
                            options: [
                                'Tuesday evening',
                                'Wednesday morning',
                                'Wednesday evening',
                                'Thursday morning'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What did city officials open?',
                            options: [
                                'New schools',
                                'Emergency shelters',
                                'Shopping centers',
                                'Community centers'
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
                    id: 'news_cet4_medium_comp_001',
                    title: 'University Researchers Develop New Solar Panel Technology',
                    content: `Scientists at State University have developed a revolutionary solar panel technology that could significantly increase energy efficiency. The new panels can convert 35% of sunlight into electricity, compared to 20% for traditional panels.

Dr. Robert Kim, lead researcher on the project, explained that the breakthrough came from using a new type of silicon crystal structure. "We've been working on this for five years, and the results exceed our expectations," he said.

The research team tested the panels under various weather conditions for 18 months. The panels maintained high efficiency even on cloudy days and in extreme temperatures. This consistency makes them ideal for different climates worldwide.

Manufacturing costs remain a challenge. The new panels cost 40% more to produce than conventional ones. However, researchers believe mass production could reduce costs within three years.

Several energy companies have expressed interest in licensing the technology. The university has filed for international patents and expects commercial production to begin by 2026.

Environmental groups praise the development as a major step toward renewable energy goals. "This technology could accelerate the transition away from fossil fuels," said Green Earth spokesperson Maria Santos.`,
                    wordCount: 189,
                    difficulty: 'medium',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Science & Technology News',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What percentage of sunlight can the new panels convert to electricity?',
                            options: ['20%', '25%', '30%', '35%'],
                            correct: 3,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How long did the research team work on this project?',
                            options: ['Three years', 'Four years', 'Five years', 'Six years'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What is the main challenge mentioned in the article?',
                            options: [
                                'Weather resistance',
                                'Manufacturing costs',
                                'Patent applications',
                                'Energy efficiency'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'When is commercial production expected to begin?',
                            options: ['2024', '2025', '2026', '2027'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'Based on the article, what can we infer about the future of this technology?',
                            options: [
                                'It will replace all traditional panels immediately',
                                'It has potential but faces economic challenges',
                                'It only works in sunny climates',
                                'It will be too expensive for most consumers'
                            ],
                            correct: 1,
                            skill: 'inference'
                        }
                    ]
                },
                {
                    id: 'news_cet4_medium_comp_002',
                    title: 'Artificial Intelligence Transforms Healthcare Diagnosis',
                    content: `Medical professionals worldwide are increasingly adopting artificial intelligence technologies to enhance diagnostic accuracy and reduce treatment delays. Recent studies indicate that AI-powered diagnostic tools can identify certain diseases with precision rates exceeding 95%, surpassing traditional diagnostic methods in both speed and reliability.

Dr. Jennifer Martinez, chief of radiology at Metropolitan Hospital, explains that machine learning algorithms can analyze thousands of medical images within minutes, detecting subtle patterns that might escape human observation. "The integration of AI doesn't replace physicians but rather augments our capabilities," she emphasizes.

The implementation of AI in healthcare faces several challenges, including data privacy concerns, regulatory approval processes, and the substantial financial investment required for system integration. Additionally, medical professionals must undergo extensive training to effectively utilize these sophisticated technologies.

Despite these obstacles, the potential benefits are significant. Early detection of diseases such as cancer, cardiovascular conditions, and neurological disorders could dramatically improve patient outcomes. Healthcare institutions report reduced diagnostic errors and more efficient resource allocation following AI implementation.

The pharmaceutical industry has also embraced AI for drug discovery and development. Companies are utilizing machine learning to identify potential therapeutic compounds and predict their effectiveness, potentially reducing the time required to bring new medications to market from decades to years.

As AI technology continues to evolve, experts predict that personalized medicine will become increasingly prevalent, with treatment plans tailored to individual genetic profiles and medical histories.`,
                    wordCount: 235,
                    difficulty: 'medium',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Medical Technology Review',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What precision rate can AI-powered diagnostic tools achieve?',
                            options: ['Over 90%', 'Over 95%', 'Over 98%', '100%'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'According to Dr. Martinez, what is the role of AI in healthcare?',
                            options: [
                                'To replace physicians entirely',
                                'To augment physicians\' capabilities',
                                'To reduce healthcare costs',
                                'To eliminate medical errors'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'Which of the following is NOT mentioned as a challenge for AI implementation?',
                            options: [
                                'Data privacy concerns',
                                'Regulatory approval processes',
                                'Patient resistance',
                                'Financial investment requirements'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What can be inferred about the future of drug development?',
                            options: [
                                'It will become more expensive',
                                'It will take longer than before',
                                'It will be significantly accelerated',
                                'It will be completely automated'
                            ],
                            correct: 2,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main focus of this article?',
                            options: [
                                'The problems with current healthcare',
                                'The transformation of healthcare through AI',
                                'The training of medical professionals',
                                'The cost of medical technology'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'news_cet4_medium_comp_003',
                    title: 'Urban Vertical Farming Revolution Addresses Food Security',
                    content: `Metropolitan areas worldwide are witnessing a revolutionary transformation in agricultural practices through the implementation of vertical farming systems. These innovative facilities, constructed within urban environments, utilize advanced hydroponic and aeroponic technologies to cultivate crops in vertically stacked layers, maximizing production efficiency while minimizing land usage.

Singapore's pioneering vertical farm, spanning 30 stories, produces vegetables equivalent to 600 traditional farms while consuming 95% less water and requiring no pesticides. The facility employs LED lighting systems calibrated to specific wavelengths that optimize photosynthesis, enabling year-round cultivation regardless of external weather conditions.

Economic analysis reveals that while initial infrastructure investments are substantial, operational costs decrease significantly over time due to reduced transportation expenses, elimination of weather-related crop losses, and consistent harvest yields. Furthermore, proximity to urban consumers reduces the carbon footprint associated with food distribution networks.

The technology addresses critical challenges facing global food security, particularly in regions experiencing rapid urbanization and climate change impacts. Traditional agriculture faces increasing pressure from unpredictable weather patterns, soil degradation, and diminishing arable land availability.

However, critics argue that vertical farming's energy consumption remains problematic, with LED lighting systems requiring significant electricity. Researchers are investigating renewable energy integration and more efficient lighting technologies to address these sustainability concerns.

Major corporations including Amazon and Google have invested billions in vertical farming ventures, recognizing the sector's potential for exponential growth. Industry projections suggest the global vertical farming market could reach $20 billion by 2030, driven by increasing consumer demand for locally grown, pesticide-free produce.`,
                    wordCount: 248,
                    difficulty: 'medium',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Agricultural Innovation Weekly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How many traditional farms does Singapore\'s vertical farm equal in production?',
                            options: ['400 farms', '500 farms', '600 farms', '700 farms'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What percentage less water does the vertical farm consume?',
                            options: ['85%', '90%', '95%', '98%'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What is the main criticism of vertical farming mentioned?',
                            options: [
                                'High initial costs',
                                'Limited crop variety',
                                'Energy consumption of LED systems',
                                'Lack of consumer acceptance'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What is the projected global market value by 2030?',
                            options: ['$15 billion', '$20 billion', '$25 billion', '$30 billion'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about the future of vertical farming?',
                            options: [
                                'It will completely replace traditional farming',
                                'It has significant potential despite current challenges',
                                'It is only suitable for developed countries',
                                'It will remain too expensive for widespread adoption'
                            ],
                            correct: 1,
                            skill: 'inference'
                        }
                    ]
                },
                {
                    id: 'news_cet4_medium_comp_004',
                    title: 'Quantum Computing Breakthrough Promises Cybersecurity Revolution',
                    content: `Researchers at the International Quantum Research Institute have achieved a significant milestone in quantum computing development, successfully demonstrating a 1000-qubit quantum processor capable of solving complex cryptographic problems exponentially faster than conventional supercomputers. This breakthrough has profound implications for cybersecurity, financial systems, and scientific research.

The quantum processor, utilizing superconducting circuits maintained at temperatures approaching absolute zero, can perform calculations that would require traditional computers thousands of years to complete. Dr. Sarah Chen, lead quantum physicist, explains that quantum bits, or qubits, can exist in multiple states simultaneously, enabling parallel processing capabilities impossible with classical computing architecture.

Current encryption methods, including RSA and AES algorithms protecting online banking and government communications, could become vulnerable to quantum attacks within the next decade. This reality has prompted cybersecurity experts to develop quantum-resistant encryption protocols, initiating a technological arms race between quantum computing advancement and cryptographic defense mechanisms.

The pharmaceutical industry anticipates revolutionary applications in drug discovery, where quantum computers could simulate molecular interactions with unprecedented accuracy. Climate modeling, artificial intelligence development, and materials science research would similarly benefit from quantum computing's computational power.

However, significant challenges remain before widespread quantum computing implementation. Quantum systems require extreme environmental conditions, sophisticated error correction mechanisms, and specialized programming languages. Additionally, the technology's current cost and complexity limit accessibility to major research institutions and technology corporations.

Investment in quantum computing research has exceeded $25 billion globally, with governments recognizing the technology's strategic importance for national security and economic competitiveness. China, the United States, and European Union have established comprehensive quantum development programs, competing for technological supremacy in this emerging field.`,
                    wordCount: 267,
                    difficulty: 'medium',
                    type: 'news',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Technology Research Quarterly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How many qubits does the new quantum processor have?',
                            options: ['500 qubits', '750 qubits', '1000 qubits', '1250 qubits'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What temperature conditions do quantum systems require?',
                            options: [
                                'Room temperature',
                                'Freezing temperature',
                                'Temperatures approaching absolute zero',
                                'High temperatures'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'How much global investment has quantum computing research received?',
                            options: ['$20 billion', '$25 billion', '$30 billion', '$35 billion'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What can be inferred about current encryption methods?',
                            options: [
                                'They are completely secure against all attacks',
                                'They may become obsolete due to quantum computing',
                                'They are only used by government agencies',
                                'They will become stronger with quantum technology'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main theme of this article?',
                            options: [
                                'Quantum computing costs are too high',
                                'Quantum computing breakthrough has major implications',
                                'Traditional computers are becoming obsolete',
                                'Cybersecurity is no longer important'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        }
                    ]
                }
                // 继续添加更多中等难度文章...
            ]
        }
    },
    
    // CET-6 新闻文章
    cet6: {
        easy: {
            comprehension: [
                {
                    id: 'news_cet6_easy_comp_001',
                    title: 'International Trade Agreement Boosts Local Economy',
                    content: `A new international trade agreement signed last month is already showing positive effects on the local economy. The agreement between five countries eliminates tariffs on agricultural products and manufactured goods.

Local exporters report a 15% increase in orders since the agreement took effect. "We're seeing unprecedented demand for our products," said textile manufacturer Jennifer Walsh. Her company has hired 50 new employees to meet increased production needs.

The port authority expects cargo volume to increase by 25% over the next year. Additional shipping routes have been established to handle the growing trade. Port director Michael Chen announced plans to expand dock facilities.

Economic analysts predict the agreement will create 2,000 new jobs in the region within 18 months. Industries most likely to benefit include agriculture, textiles, and electronics manufacturing.

However, some local businesses express concerns about increased competition from imported goods. Retail association president David Liu called for government support to help small businesses adapt to the changing market conditions.

The agreement represents the largest trade deal in the region's history and demonstrates growing economic cooperation between participating nations.`,
                    wordCount: 198,
                    difficulty: 'easy',
                    type: 'news',
                    examType: 'cet6',
                    goal: 'comprehension',
                    source: 'International Business Weekly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What does the trade agreement eliminate?',
                            options: [
                                'Import quotas',
                                'Tariffs on certain products',
                                'Export licenses',
                                'Currency restrictions'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'By what percentage have local exporters seen order increases?',
                            options: ['10%', '15%', '20%', '25%'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'How many new jobs are predicted to be created?',
                            options: ['1,500', '2,000', '2,500', '3,000'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What concern do some local businesses have?',
                            options: [
                                'Higher taxes',
                                'Increased competition',
                                'Labor shortages',
                                'Transportation costs'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about the trade agreement?',
                            options: [
                                'It only benefits large companies',
                                'It has both positive and negative effects',
                                'It will be cancelled soon',
                                'It excludes agricultural products'
                            ],
                            correct: 1,
                            skill: 'inference'
                        }
                    ]
                }
                // 继续添加更多CET-6简单文章...
            ]
        }
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = newsReadingData;
} else if (typeof window !== 'undefined') {
    window.newsReadingData = newsReadingData;
}
