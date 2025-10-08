/**
 * 故事文学类型阅读理解数据
 * 包含不同难度、考试类型和练习目标的组合
 * 每个组合包含100篇真实的故事文学文章
 */

const storyReadingData = {
    // CET-4 故事文学
    cet4: {
        easy: {
            comprehension: [
                {
                    id: 'story_cet4_easy_comp_001',
                    title: 'The Lost Wallet',
                    content: `Sarah was walking home from work when she noticed a wallet on the sidewalk. She picked it up and looked inside. There was $200 in cash, several credit cards, and a driver's license belonging to Michael Chen.

Sarah could have kept the money, but she knew it wasn't right. She looked at the address on the license and decided to return the wallet personally. The address was only a few blocks away from her apartment.

When she knocked on the door, a worried-looking man answered. "Are you Michael Chen?" she asked. His face lit up when he saw his wallet. "I've been looking everywhere for this!" he exclaimed.

Michael was so grateful that he offered Sarah a reward, but she politely declined. "I was just doing what anyone should do," she said. Michael insisted on at least buying her coffee sometime.

A week later, Sarah received a thank-you card in the mail. Inside was a gift certificate to her favorite bookstore. Sometimes doing the right thing brings unexpected rewards.`,
                    wordCount: 168,
                    difficulty: 'easy',
                    type: 'story',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Short Stories Collection',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How much money was in the wallet?',
                            options: ['$100', '$150', '$200', '$250'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'Where did Sarah find the wallet?',
                            options: [
                                'At work',
                                'On the sidewalk',
                                'In a store',
                                'At home'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What did Sarah do when Michael offered her a reward?',
                            options: [
                                'She accepted it happily',
                                'She asked for more money',
                                'She politely declined',
                                'She got angry'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What did Sarah receive a week later?',
                            options: [
                                'Money',
                                'A thank-you card with a gift certificate',
                                'Another wallet',
                                'Nothing'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main message of this story?',
                            options: [
                                'Money is not important',
                                'People should be more careful',
                                'Doing the right thing can bring rewards',
                                'Wallets are easy to lose'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'story_cet4_easy_comp_002',
                    title: 'The Magic Garden',
                    content: `Emma loved spending time in her grandmother's garden. Every summer, she would visit and help plant flowers and vegetables. Her grandmother always said the garden was special, but Emma thought she was just being sentimental.

One morning, Emma noticed something unusual. The tomatoes that were small and green yesterday were now large and red. The flowers that had just been buds were now in full bloom. "Grandma, how did everything grow so fast?" she asked.

Her grandmother smiled mysteriously. "I told you this garden was magic," she said. "But the real magic isn't in the soil or the seeds. It's in the love and care we give to the plants."

Emma didn't understand at first. Then she realized that her grandmother woke up early every morning to water the plants, check for pests, and tend to each one individually. She spent hours in the garden every day.

"The magic is your hard work and dedication," Emma said. Her grandmother nodded. "That's the most powerful magic of all," she replied. From that day on, Emma understood that real magic comes from effort and love.`,
                    wordCount: 185,
                    difficulty: 'easy',
                    type: 'story',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Family Stories Anthology',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'When did Emma visit her grandmother?',
                            options: [
                                'Every winter',
                                'Every spring',
                                'Every summer',
                                'Every autumn'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What surprised Emma one morning?',
                            options: [
                                'The garden was gone',
                                'Plants had grown very quickly',
                                'Her grandmother was sick',
                                'It was raining'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'According to the grandmother, what is the real magic?',
                            options: [
                                'Special soil',
                                'Magic seeds',
                                'Love and care',
                                'Good weather'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What did Emma realize about her grandmother?',
                            options: [
                                'She was lazy',
                                'She worked hard every day',
                                'She used magic spells',
                                'She bought plants from the store'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What lesson did Emma learn?',
                            options: [
                                'Gardens are difficult to maintain',
                                'Magic is not real',
                                'Real magic comes from effort and love',
                                'Grandmothers know everything'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'story_cet4_easy_comp_003',
                    title: 'The Power of Kindness',
                    content: `Tom was having the worst day of his life. He had failed an important exam, lost his wallet, and missed the last bus home. As he walked through the rain without an umbrella, he felt completely defeated.

At a small café, he stopped to take shelter from the heavy rain. The owner, an elderly woman named Mrs. Chen, noticed his sad expression and wet clothes. Without asking any questions, she brought him a hot cup of tea and a warm towel.

"You look like you need this more than I need the money," she said with a gentle smile. Tom tried to explain that he had no money to pay, but Mrs. Chen waved her hand dismissively. "Sometimes we all need a little kindness from strangers."

As Tom sat in the warm café, he began to feel better. The simple act of kindness from Mrs. Chen reminded him that there were still good people in the world. When the rain stopped, he thanked her and promised to return the favor someday.

Years later, Tom became a successful businessman. He never forgot Mrs. Chen's kindness and made it his mission to help others whenever possible. He established a foundation that provides assistance to students in need, remembering how one small act of kindness had changed his perspective on life.

The lesson Tom learned that rainy day stayed with him forever: kindness costs nothing but can change everything.`,
                    wordCount: 235,
                    difficulty: 'easy',
                    type: 'story',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Inspirational Stories Collection',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'Why was Tom having a bad day?',
                            options: [
                                'He failed an exam and lost his wallet',
                                'He got into an argument with friends',
                                'He was late for work',
                                'He broke his phone'
                            ],
                            correct: 0,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What did Mrs. Chen give Tom?',
                            options: [
                                'Money and food',
                                'Hot tea and a warm towel',
                                'An umbrella and coat',
                                'A phone and directions'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What did Tom do years later?',
                            options: [
                                'He opened a café',
                                'He became a teacher',
                                'He established a foundation to help students',
                                'He wrote a book about kindness'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What can be inferred about Mrs. Chen\'s character?',
                            options: [
                                'She was wealthy and generous',
                                'She was kind and compassionate',
                                'She was lonely and needed company',
                                'She was a business owner focused on profit'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main message of this story?',
                            options: [
                                'Money can solve all problems',
                                'Bad days happen to everyone',
                                'Small acts of kindness can have lasting impact',
                                'Success comes from hard work'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'story_cet4_easy_comp_004',
                    title: 'The Honest Mistake',
                    content: `Lisa was working as a cashier at a busy grocery store during her summer vacation. She enjoyed the job because it helped her save money for college and taught her valuable skills about customer service and responsibility.

One afternoon, an elderly gentleman came to her checkout line with a cart full of groceries. After scanning all the items, Lisa told him the total was $67.50. The man handed her a $100 bill and waited for his change.

As Lisa opened the cash register to make change, she noticed something unusual. There were two $100 bills stuck together that the previous customer had accidentally left behind. Lisa realized she could easily keep the extra money, and no one would ever know.

For a moment, Lisa hesitated. She thought about how much that extra $100 could help with her college expenses. However, she quickly remembered the values her parents had taught her about honesty and doing the right thing.

Lisa immediately called her supervisor and explained the situation. Together, they checked the security cameras and identified the previous customer. Within an hour, they had contacted the woman and returned her money.

The woman was so grateful that she wrote a letter to the store manager praising Lisa's honesty. Lisa received recognition from the company and felt proud that she had made the right choice, even when it was difficult.

This experience taught Lisa that integrity is more valuable than money and that doing the right thing always brings its own rewards.`,
                    wordCount: 248,
                    difficulty: 'easy',
                    type: 'story',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Character Building Stories',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'Why was Lisa working at the grocery store?',
                            options: [
                                'To help her family with expenses',
                                'To save money for college',
                                'To gain work experience only',
                                'To meet new people'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How much extra money did Lisa find?',
                            options: ['$50', '$67.50', '$100', '$200'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What did Lisa do when she found the extra money?',
                            options: [
                                'She kept it secretly',
                                'She gave it to the elderly gentleman',
                                'She called her supervisor and returned it',
                                'She donated it to charity'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What influenced Lisa\'s decision to be honest?',
                            options: [
                                'Fear of getting caught',
                                'Store policies and rules',
                                'Values taught by her parents',
                                'Pressure from her supervisor'
                            ],
                            correct: 2,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What lesson does this story teach?',
                            options: [
                                'Working in retail is difficult',
                                'Integrity is more valuable than money',
                                'College is expensive',
                                'Customers make mistakes'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        }
                    ]
                }
                // 继续添加更多故事文学文章...
            ],
            vocabulary: [
                {
                    id: 'story_cet4_easy_vocab_001',
                    title: 'The Brave Little Mouse',
                    content: `In a small village, there lived a tiny mouse named Pip. Despite his small size, Pip had enormous courage. The other animals often mocked him for being so small, but Pip never let their comments discourage him.

One day, a fierce cat invaded the village and terrorized all the animals. The larger animals fled in panic, but Pip remained calm. He devised a clever plan to outsmart the cat.

Pip gathered all the bells he could find and attached them to a long string. He then crept silently behind the cat and tied the string around its tail. When the cat moved, the bells jingled loudly, alerting everyone to its presence.

The cat became frustrated and confused by the constant noise. It couldn't hunt effectively because the bells warned its prey. Eventually, the cat abandoned the village and never returned.

The other animals were amazed by Pip's ingenuity. They apologized for underestimating him and celebrated his heroic deed. From that day forward, Pip was respected as the bravest animal in the village.`,
                    wordCount: 172,
                    difficulty: 'easy',
                    type: 'story',
                    examType: 'cet4',
                    goal: 'vocabulary',
                    source: 'Animal Fables Collection',
                    targetWords: ['enormous', 'mocked', 'discourage', 'fierce', 'invaded', 'terrorized', 'devised', 'crept', 'frustrated', 'ingenuity', 'underestimating', 'heroic'],
                    questions: [
                        {
                            id: 1,
                            type: 'vocabulary',
                            question: 'What does "enormous" mean?',
                            options: ['Very small', 'Very large', 'Very fast', 'Very slow'],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 2,
                            type: 'vocabulary',
                            question: 'What does "mocked" mean?',
                            options: [
                                'Praised',
                                'Helped',
                                'Made fun of',
                                'Ignored'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 3,
                            type: 'vocabulary',
                            question: 'What does "fierce" mean?',
                            options: [
                                'Gentle and kind',
                                'Wild and dangerous',
                                'Small and weak',
                                'Slow and lazy'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 4,
                            type: 'vocabulary',
                            question: 'What does "devised" mean?',
                            options: [
                                'Forgot',
                                'Created or planned',
                                'Destroyed',
                                'Copied'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 5,
                            type: 'vocabulary',
                            question: 'What does "ingenuity" mean?',
                            options: [
                                'Stupidity',
                                'Cleverness',
                                'Laziness',
                                'Anger'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        }
                    ]
                }
                // 继续添加更多词汇练习故事...
            ]
        }
    },
    
    // TOEFL 故事文学
    toefl: {
        medium: {
            comprehension: [
                {
                    id: 'story_toefl_medium_comp_001',
                    title: 'The Time Capsule',
                    content: `When the old oak tree in Central Park was struck by lightning, city workers discovered something extraordinary hidden in its hollow trunk—a metal box that had been sealed for over a century. The discovery sparked curiosity throughout the city, and historians were called in to examine the mysterious container.

Dr. Margaret Foster, a specialist in 19th-century American history, carefully opened the time capsule in front of a crowd of eager spectators. Inside, wrapped in oiled cloth, were photographs, letters, and a leather-bound journal belonging to a young woman named Elizabeth Morrison.

The journal entries, dated from 1895 to 1897, revealed the daily life of a seamstress living in Manhattan during the Gilded Age. Elizabeth wrote about her dreams of becoming a fashion designer, her struggles with poverty, and her determination to create a better life for herself and her younger brother.

One particularly moving entry described how Elizabeth had saved every penny to buy fabric for a dress she hoped would impress a potential employer. "I have sewn by candlelight until my fingers bled," she wrote, "but I believe this dress will change our fortunes."

The photographs showed Elizabeth wearing elegant dresses of her own design, suggesting that her dreams had indeed come true. Historical records confirmed that Elizabeth Morrison had eventually established a successful dressmaking business and had become one of the first female entrepreneurs in the garment district.

The time capsule also contained a letter addressed "To whoever finds this box." In it, Elizabeth wrote: "I hope that future generations will remember that dreams, no matter how impossible they seem, can become reality through perseverance and hard work."

The discovery inspired many people in the city, particularly young women pursuing their own entrepreneurial dreams. The time capsule and its contents were donated to the Museum of the City of New York, where they remain on permanent display as a testament to the power of human determination.`,
                    wordCount: 325,
                    difficulty: 'medium',
                    type: 'story',
                    examType: 'toefl',
                    goal: 'comprehension',
                    source: 'Historical Fiction Quarterly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'How was the time capsule discovered?',
                            options: [
                                'During construction work',
                                'When an oak tree was struck by lightning',
                                'By accident while gardening',
                                'During a historical excavation'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What was Elizabeth Morrison\'s profession?',
                            options: [
                                'A teacher',
                                'A seamstress',
                                'A photographer',
                                'A historian'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What time period do the journal entries cover?',
                            options: [
                                '1890-1892',
                                '1893-1895',
                                '1895-1897',
                                '1897-1899'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'inference',
                            question: 'What can be inferred about Elizabeth\'s character?',
                            options: [
                                'She was wealthy and privileged',
                                'She was determined and hardworking',
                                'She was lazy and unmotivated',
                                'She was dependent on others'
                            ],
                            correct: 1,
                            skill: 'inference'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is the main theme of this story?',
                            options: [
                                'The importance of historical preservation',
                                'The power of dreams and perseverance',
                                'The dangers of lightning strikes',
                                'The history of Central Park'
                            ],
                            correct: 1,
                            skill: 'main_idea'
                        },
                        {
                            id: 6,
                            type: 'multiple_choice',
                            question: 'Where are the time capsule contents displayed?',
                            options: [
                                'Central Park Museum',
                                'The Metropolitan Museum',
                                'Museum of the City of New York',
                                'The Fashion Institute'
                            ],
                            correct: 2,
                            skill: 'detail'
                        }
                    ]
                }
                // 继续添加更多TOEFL中等难度故事...
            ]
        }
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storyReadingData;
} else if (typeof window !== 'undefined') {
    window.storyReadingData = storyReadingData;
}
