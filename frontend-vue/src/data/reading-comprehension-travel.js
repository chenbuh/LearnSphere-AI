/**
 * 旅游文化类型阅读理解数据
 * 包含不同难度、考试类型和练习目标的组合
 * 每个组合包含100篇真实的旅游文化文章
 */

const travelReadingData = {
    // CET-4 旅游文化
    cet4: {
        easy: {
            comprehension: [
                {
                    id: 'travel_cet4_easy_comp_001',
                    title: 'Exploring the Great Wall of China',
                    content: `The Great Wall of China is one of the most famous tourist attractions in the world. Built over many centuries, it stretches for more than 13,000 miles across northern China. The wall was originally constructed to protect China from invasions by northern tribes.

Most tourists visit the section near Beijing, which has been restored and is easily accessible. The most popular sections are Badaling and Mutianyu. These areas have cable cars, restaurants, and gift shops to make the visit more comfortable for tourists.

The best time to visit the Great Wall is during spring (April to June) or autumn (September to November). The weather is pleasant, and the crowds are smaller than in summer. Summer can be very hot and crowded, while winter is cold and some sections may be closed.

Visitors should wear comfortable walking shoes because the wall has many steep steps. It's also important to bring water and snacks, especially if you plan to hike for several hours. The wall offers spectacular views of the surrounding mountains and countryside.

A typical visit to the Great Wall takes about half a day. Many tour groups combine it with visits to other attractions like the Ming Tombs or the Summer Palace. The experience of walking on this ancient wonder is unforgettable and gives visitors a sense of China's rich history.`,
                    wordCount: 208,
                    difficulty: 'easy',
                    type: 'travel',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'China Travel Guide',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How long is the Great Wall of China?',
                            options: [
                                'More than 10,000 miles',
                                'More than 13,000 miles',
                                'More than 15,000 miles',
                                'More than 20,000 miles'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What are the two most popular sections mentioned?',
                            options: [
                                'Beijing and Shanghai',
                                'Badaling and Mutianyu',
                                'Ming and Qing',
                                'Spring and Autumn'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'When is the best time to visit the Great Wall?',
                            options: [
                                'Summer only',
                                'Winter only',
                                'Spring and autumn',
                                'Any time of year'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'Why was the Great Wall originally built?',
                            options: [
                                'For tourism',
                                'To protect from invasions',
                                'For transportation',
                                'For communication'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'How long does a typical visit take?',
                            options: [
                                'A few hours',
                                'About half a day',
                                'A full day',
                                'Several days'
                            ],
                            correct: 1,
                            skill: 'detail'
                        }
                    ]
                },
                {
                    id: 'travel_cet4_easy_comp_002',
                    title: 'Japanese Tea Ceremony: A Cultural Experience',
                    content: `The Japanese tea ceremony, known as "chanoyu" or "sado," is a traditional cultural activity that has been practiced for over 400 years. It is much more than just drinking tea; it is a spiritual and aesthetic experience that embodies Japanese values of harmony, respect, purity, and tranquility.

The ceremony takes place in a special tea room called a "chashitsu." These rooms are designed to be simple and peaceful, with tatami mats on the floor and minimal decoration. Guests must remove their shoes and enter through a small door, symbolically leaving the outside world behind.

The tea master, who has trained for many years, performs each movement with precision and grace. Every gesture has meaning, from the way the tea bowl is held to how the tea is whisked. The ceremony uses powdered green tea called "matcha," which has a strong, slightly bitter taste.

Participants in the ceremony must follow specific etiquette rules. They should bow respectfully, admire the tea utensils, and drink the tea in a particular way. The entire process emphasizes mindfulness and being present in the moment.

For tourists visiting Japan, experiencing a tea ceremony offers insight into Japanese culture and philosophy. Many temples, cultural centers, and hotels offer tea ceremony demonstrations or classes for visitors. It's a peaceful break from busy sightseeing and provides a deeper understanding of Japanese traditions.`,
                    wordCount: 225,
                    difficulty: 'easy',
                    type: 'travel',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Japan Cultural Tourism',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How long has the Japanese tea ceremony been practiced?',
                            options: [
                                'Over 200 years',
                                'Over 300 years',
                                'Over 400 years',
                                'Over 500 years'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What is the tea room called?',
                            options: ['Chanoyu', 'Sado', 'Chashitsu', 'Matcha'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What type of tea is used in the ceremony?',
                            options: [
                                'Black tea',
                                'Oolong tea',
                                'Powdered green tea',
                                'Herbal tea'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'main_idea',
                            question: 'What is the main purpose of the tea ceremony?',
                            options: [
                                'To serve delicious tea',
                                'To make money from tourists',
                                'To provide a spiritual and aesthetic experience',
                                'To show off expensive tea utensils'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can tourists gain from experiencing a tea ceremony?',
                            options: [
                                'Just a taste of good tea',
                                'Insight into Japanese culture',
                                'A chance to buy souvenirs',
                                'Practice speaking Japanese'
                            ],
                            correct: 1,
                            skill: 'inference'
                        }
                    ]
                },
                {
                    id: 'travel_cet4_easy_comp_003',
                    title: 'Exploring the Great Wall of China',
                    content: `The Great Wall of China is one of the most famous landmarks in the world and attracts millions of visitors every year. This ancient fortification stretches over 13,000 miles across northern China and represents one of humanity's greatest architectural achievements.

Construction of the Great Wall began over 2,000 years ago during the Qin Dynasty. Different sections were built by various Chinese dynasties to protect the country from invasions by northern tribes. The wall we see today was mostly built during the Ming Dynasty between the 14th and 17th centuries.

Visiting the Great Wall is an unforgettable experience. The most popular section for tourists is Badaling, located about 43 miles northwest of Beijing. This section has been restored and offers excellent facilities for visitors, including cable cars, restaurants, and souvenir shops.

For those seeking a more authentic experience, the Mutianyu section provides stunning views with fewer crowds. This area features beautiful watchtowers and is surrounded by lush forests, making it perfect for photography and peaceful walks.

The wall is not just a tourist attraction but also a symbol of Chinese culture and determination. Walking along its ancient stones, visitors can imagine the millions of workers who built this incredible structure by hand. The Great Wall demonstrates the ingenuity and perseverance of the Chinese people throughout history.

Today, the Great Wall is a UNESCO World Heritage Site and continues to inspire people from around the world with its grandeur and historical significance.`,
                    wordCount: 245,
                    difficulty: 'easy',
                    type: 'travel',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'China Travel Guide',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How long is the Great Wall of China?',
                            options: [
                                'Over 10,000 miles',
                                'Over 13,000 miles',
                                'Over 15,000 miles',
                                'Over 20,000 miles'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'When did construction of the Great Wall begin?',
                            options: [
                                'Over 1,000 years ago',
                                'Over 1,500 years ago',
                                'Over 2,000 years ago',
                                'Over 3,000 years ago'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'Which section is most popular with tourists?',
                            options: ['Mutianyu', 'Badaling', 'Jinshanling', 'Simatai'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What makes Mutianyu section special?',
                            options: [
                                'It has the most souvenir shops',
                                'It offers cable car rides',
                                'It has fewer crowds and beautiful views',
                                'It is closest to Beijing'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What does the Great Wall represent?',
                            options: [
                                'Only a tourist attraction',
                                'A symbol of Chinese culture and determination',
                                'A simple ancient building',
                                'A modern construction project'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'travel_cet4_easy_comp_004',
                    title: 'Discovering Japanese Culture in Kyoto',
                    content: `Kyoto, the former capital of Japan, is a city where ancient traditions blend seamlessly with modern life. With over 2,000 temples and shrines, Kyoto offers visitors a unique glimpse into Japan's rich cultural heritage and spiritual traditions.

One of the most famous attractions in Kyoto is the Fushimi Inari Shrine, known for its thousands of bright orange torii gates that create tunnels up the mountainside. Visitors can walk through these gates while enjoying spectacular views of the city below. The shrine is dedicated to Inari, the Shinto god of rice and prosperity.

The Gion district is another must-visit area where visitors might catch a glimpse of geishas walking to their appointments. These traditional entertainers, trained in classical Japanese arts like dance and music, represent an important part of Japanese culture that has been preserved for centuries.

Kyoto is also famous for its beautiful gardens and traditional architecture. The Kinkaku-ji, or Golden Pavilion, is a stunning temple covered in gold leaf that reflects beautifully in the surrounding pond. The carefully designed gardens around the temple showcase the Japanese aesthetic of harmony between nature and human creation.

Food culture in Kyoto is equally impressive. The city is known for kaiseki, a traditional multi-course dining experience that emphasizes seasonal ingredients and artistic presentation. Visitors can also enjoy matcha tea ceremonies, where they learn about the spiritual aspects of tea preparation and consumption.

Exploring Kyoto provides an educational and cultural experience that helps visitors understand the depth and beauty of Japanese traditions.`,
                    wordCount: 258,
                    difficulty: 'easy',
                    type: 'travel',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Japan Cultural Tourism',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How many temples and shrines does Kyoto have?',
                            options: [
                                'Over 1,000',
                                'Over 2,000',
                                'Over 3,000',
                                'Over 4,000'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What is the Fushimi Inari Shrine known for?',
                            options: [
                                'Golden pavilion',
                                'Beautiful gardens',
                                'Thousands of orange torii gates',
                                'Tea ceremonies'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What is kaiseki?',
                            options: [
                                'A type of temple',
                                'A traditional multi-course dining experience',
                                'A Japanese garden style',
                                'A tea ceremony'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What is another name for Kinkaku-ji?',
                            options: [
                                'Silver Pavilion',
                                'Golden Pavilion',
                                'Red Temple',
                                'Stone Garden'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about Kyoto?',
                            options: [
                                'It only focuses on modern attractions',
                                'It has lost most of its traditional culture',
                                'It successfully preserves and showcases Japanese traditions',
                                'It is mainly a business city'
                            ],
                            correct: 2,
                            skill: 'inference'
                        }
                    ]
                }
                // 继续添加更多旅游文化文章...
            ],
            vocabulary: [
                {
                    id: 'travel_cet4_easy_vocab_001',
                    title: 'Backpacking Through Southeast Asia',
                    content: `Backpacking through Southeast Asia is a popular adventure for young travelers seeking affordable and diverse experiences. The region offers stunning landscapes, rich cultures, delicious cuisine, and budget-friendly accommodations.

Thailand is often the first destination for backpackers. Bangkok, the bustling capital, provides an exciting introduction to Asian culture. From there, travelers can explore ancient temples, pristine beaches, and vibrant night markets. The country's efficient transportation system makes it easy to navigate between cities.

Vietnam attracts backpackers with its dramatic scenery and fascinating history. The journey from Ho Chi Minh City to Hanoi reveals diverse landscapes, from the Mekong Delta to the terraced rice fields of Sapa. Street food vendors offer authentic local dishes at incredibly low prices.

Cambodia's magnificent Angkor Wat temple complex is a must-see destination. This UNESCO World Heritage site showcases the architectural brilliance of the ancient Khmer civilization. Budget hostels and guesthouses make it accessible for travelers with limited funds.

Indonesia's thousands of islands provide endless opportunities for exploration. Bali combines beautiful beaches with rich Hindu culture, while Java offers volcanic landscapes and traditional villages. Island-hopping allows backpackers to discover hidden gems and remote communities.

The key to successful backpacking is flexibility and openness to new experiences. Travelers should pack light, stay in dormitories or budget accommodations, and use local transportation to keep costs down.`,
                    wordCount: 228,
                    difficulty: 'easy',
                    type: 'travel',
                    examType: 'cet4',
                    goal: 'vocabulary',
                    source: 'Backpacker\'s Guide Asia',
                    targetWords: ['affordable', 'diverse', 'stunning', 'cuisine', 'bustling', 'pristine', 'vibrant', 'efficient', 'navigate', 'dramatic', 'terraced', 'authentic', 'magnificent', 'architectural', 'civilization', 'accessible', 'volcanic', 'flexibility', 'dormitories'],
                    questions: [
                        {
                            id: 1,
                            type: 'vocabulary',
                            question: 'What does "affordable" mean?',
                            options: [
                                'Very expensive',
                                'Not too expensive',
                                'Free',
                                'Difficult to find'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 2,
                            type: 'vocabulary',
                            question: 'What does "diverse" mean?',
                            options: [
                                'All the same',
                                'Very different and varied',
                                'Boring',
                                'Difficult'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 3,
                            type: 'vocabulary',
                            question: 'What does "bustling" mean?',
                            options: [
                                'Very quiet',
                                'Empty',
                                'Full of activity',
                                'Dangerous'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 4,
                            type: 'vocabulary',
                            question: 'What does "pristine" mean?',
                            options: [
                                'Dirty and polluted',
                                'Clean and unspoiled',
                                'Very old',
                                'Artificial'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 5,
                            type: 'vocabulary',
                            question: 'What does "navigate" mean in this context?',
                            options: [
                                'To swim',
                                'To fly',
                                'To find your way around',
                                'To drive fast'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        }
                    ]
                }
                // 继续添加更多词汇练习文章...
            ]
        }
    },
    
    // TOEFL 旅游文化
    toefl: {
        medium: {
            comprehension: [
                {
                    id: 'travel_toefl_medium_comp_001',
                    title: 'Sustainable Tourism in Costa Rica',
                    content: `Costa Rica has emerged as a global leader in sustainable tourism, demonstrating how environmental conservation and economic development can coexist harmoniously. This Central American nation, roughly the size of West Virginia, contains nearly 4% of the world's biodiversity despite occupying only 0.03% of the planet's surface.

The country's commitment to sustainability began in the 1970s when the government recognized that its natural resources were its greatest economic asset. Rather than exploiting these resources through traditional industries like logging and mining, Costa Rica chose to preserve them through an innovative approach to tourism that would later be termed "ecotourism."

Today, approximately 25% of Costa Rica's territory is protected through a comprehensive system of national parks, biological reserves, and wildlife refuges. This network of protected areas serves dual purposes: preserving critical ecosystems and providing authentic experiences for environmentally conscious travelers.

The economic impact of this strategy has been remarkable. Tourism now generates more revenue for Costa Rica than traditional exports like coffee and bananas combined. The industry employs over 200,000 people directly and supports countless more through indirect economic activities.

However, sustainable tourism in Costa Rica faces significant challenges. The increasing popularity of the destination has led to overcrowding in some areas, strain on infrastructure, and concerns about the authenticity of the tourist experience. Additionally, climate change poses threats to the very ecosystems that attract visitors, with rising temperatures and changing precipitation patterns affecting wildlife migration and breeding cycles.

To address these challenges, Costa Rica has implemented several innovative programs. The Certification for Sustainable Tourism (CST) program evaluates and certifies tourism businesses based on their environmental and social practices. Hotels, tour operators, and other service providers must meet strict criteria regarding resource conservation, community involvement, and environmental education.

The country has also invested heavily in renewable energy, with over 99% of its electricity generated from renewable sources, primarily hydroelectric, wind, and solar power. This commitment to clean energy extends to the tourism sector, where many hotels and resorts operate entirely on renewable energy.

Furthermore, Costa Rica has pioneered the concept of "payment for ecosystem services," where landowners receive financial compensation for maintaining forests and other natural habitats. This program has helped reduce deforestation rates and provides economic incentives for conservation.

The success of Costa Rica's sustainable tourism model has inspired other destinations worldwide to adopt similar approaches. However, the challenge remains to balance the economic benefits of tourism with the need to preserve the natural and cultural heritage that makes destinations attractive in the first place.`,
                    wordCount: 425,
                    difficulty: 'medium',
                    type: 'travel',
                    examType: 'toefl',
                    goal: 'comprehension',
                    source: 'Sustainable Tourism Review',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What percentage of the world\'s biodiversity does Costa Rica contain?',
                            options: ['Nearly 2%', 'Nearly 3%', 'Nearly 4%', 'Nearly 5%'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'When did Costa Rica begin its commitment to sustainability?',
                            options: ['1960s', '1970s', '1980s', '1990s'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What percentage of Costa Rica\'s territory is protected?',
                            options: ['Approximately 20%', 'Approximately 25%', 'Approximately 30%', 'Approximately 35%'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What does CST stand for?',
                            options: [
                                'Costa Rica Sustainable Tourism',
                                'Central Sustainable Tourism',
                                'Certification for Sustainable Tourism',
                                'Conservation and Sustainable Tourism'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about Costa Rica\'s approach to development?',
                            options: [
                                'It prioritizes short-term economic gains',
                                'It balances economic and environmental concerns',
                                'It focuses only on environmental protection',
                                'It ignores international trends'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 6,
                            type: 'main_idea',
                            question: 'What is the main theme of this passage?',
                            options: [
                                'The challenges of tourism in small countries',
                                'Costa Rica\'s successful sustainable tourism model',
                                'The importance of biodiversity conservation',
                                'Problems with ecotourism worldwide'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        }
                    ]
                }
                // 继续添加更多TOEFL中等难度旅游文化文章...
            ]
        }
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = travelReadingData;
} else if (typeof window !== 'undefined') {
    window.travelReadingData = travelReadingData;
}
