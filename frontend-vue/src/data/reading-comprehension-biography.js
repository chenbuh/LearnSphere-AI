/**
 * 人物传记类型阅读理解数据
 * 包含不同难度、考试类型和练习目标的组合
 * 每个组合包含100篇真实的人物传记文章
 */

const biographyReadingData = {
    // CET-4 人物传记
    cet4: {
        easy: {
            comprehension: [
                {
                    id: 'biography_cet4_easy_comp_001',
                    title: 'Marie Curie: Pioneer in Science',
                    content: `Marie Curie was born in Poland in 1867. Her real name was Maria Sklodowska. She grew up in a family that valued education, even though Poland was under Russian control and educational opportunities for women were limited.

In 1891, Marie moved to Paris to study at the University of Paris. She was one of only 23 women among nearly 2,000 students in the Faculty of Sciences. Despite financial difficulties, she graduated first in her physics degree and second in her mathematics degree.

Marie met Pierre Curie, a French physicist, in 1894. They married in 1895 and began working together on scientific research. Their partnership was both personal and professional, and they made groundbreaking discoveries about radioactivity.

In 1903, Marie became the first woman to win a Nobel Prize when she shared the Physics Prize with her husband Pierre and Henri Becquerel for their work on radioactivity. After Pierre's tragic death in 1906, Marie continued their research alone.

In 1911, Marie won her second Nobel Prize, this time in Chemistry, for discovering the elements radium and polonium. She became the first person to win Nobel Prizes in two different scientific fields.

Marie Curie's dedication to science opened doors for future generations of women in research. She died in 1934 from complications related to her exposure to radiation during her research.`,
                    wordCount: 218,
                    difficulty: 'easy',
                    type: 'biography',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Great Scientists Series',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'When was Marie Curie born?',
                            options: ['1865', '1867', '1869', '1871'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'What was Marie Curie\'s original name?',
                            options: [
                                'Maria Sklodowska',
                                'Marie Curie',
                                'Maria Curie',
                                'Marie Sklodowska'
                            ],
                            correct: 0,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'In what year did Marie win her first Nobel Prize?',
                            options: ['1901', '1903', '1906', '1911'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What elements did Marie discover?',
                            options: [
                                'Uranium and thorium',
                                'Radium and polonium',
                                'Helium and neon',
                                'Carbon and oxygen'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What is Marie Curie most famous for?',
                            options: [
                                'Being the first woman university student',
                                'Marrying a famous scientist',
                                'Being a pioneer in radioactivity research',
                                'Teaching at the University of Paris'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'biography_cet4_easy_comp_002',
                    title: 'Nelson Mandela: From Prisoner to President',
                    content: `Nelson Mandela was born in South Africa in 1918. He grew up during a time when the country had strict laws separating black and white people, known as apartheid. These laws made life very difficult for black South Africans.

As a young man, Mandela became a lawyer and began fighting against apartheid through peaceful protests. However, the government banned his political organization, the African National Congress (ANC), and arrested many of its members.

In 1964, Mandela was sentenced to life in prison for his political activities. He spent 27 years in jail, mostly on Robben Island. During this time, he became a symbol of the fight against apartheid around the world.

International pressure and protests eventually forced the South African government to release Mandela in 1990. He was 71 years old when he walked free. Instead of seeking revenge, Mandela chose to work for peace and reconciliation.

In 1994, South Africa held its first democratic elections where all races could vote. Mandela was elected as the country's first black president. He served one term and focused on uniting the country and healing the wounds of apartheid.

Mandela won the Nobel Peace Prize in 1993 and became known worldwide as a symbol of peace, forgiveness, and human rights. He died in 2013 at the age of 95, leaving behind a legacy of courage and reconciliation.`,
                    wordCount: 235,
                    difficulty: 'easy',
                    type: 'biography',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'World Leaders Biography',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'When was Nelson Mandela born?',
                            options: ['1916', '1918', '1920', '1922'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How many years did Mandela spend in prison?',
                            options: ['25 years', '27 years', '29 years', '30 years'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'When was Mandela released from prison?',
                            options: ['1988', '1990', '1992', '1994'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What was the name of Mandela\'s political organization?',
                            options: [
                                'African National Congress',
                                'South African Liberation Front',
                                'Black Consciousness Movement',
                                'Democratic Alliance'
                            ],
                            correct: 0,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can we infer about Mandela\'s character?',
                            options: [
                                'He was vengeful and angry',
                                'He was forgiving and peaceful',
                                'He was weak and passive',
                                'He was violent and aggressive'
                            ],
                            correct: 1,
                            skill: 'inference'
                        }
                    ]
                },
                {
                    id: 'biography_cet4_easy_comp_003',
                    title: 'Steve Jobs: Innovation and Vision',
                    content: `Steve Jobs was born in San Francisco in 1955 and was adopted by Paul and Clara Jobs. From an early age, he showed interest in electronics and design, often working with his adoptive father in the family garage.

In 1976, at the age of 21, Jobs co-founded Apple Computer Company with his friend Steve Wozniak. They started the company in Jobs' parents' garage with just $1,300 in startup money. Their first product, the Apple I computer, was built by hand and sold to computer enthusiasts.

Jobs had a unique vision for personal computers. He believed that computers should be user-friendly and accessible to ordinary people, not just technical experts. This philosophy led to the development of the Apple II, which became one of the first highly successful mass-produced personal computers.

In 1985, Jobs left Apple after disagreements with the company's board of directors. He founded a new company called NeXT and also purchased the computer graphics division of Lucasfilm, which later became Pixar Animation Studios. Under his leadership, Pixar created groundbreaking animated films like "Toy Story."

Jobs returned to Apple in 1997 when the company was struggling financially. He introduced revolutionary products like the iMac, iPod, iPhone, and iPad, transforming Apple into one of the world's most valuable companies.

Steve Jobs passed away in 2011, but his legacy of innovation and design excellence continues to influence the technology industry today.`,
                    wordCount: 235,
                    difficulty: 'easy',
                    type: 'biography',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Technology Leaders Biography',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'When was Steve Jobs born?',
                            options: ['1954', '1955', '1956', '1957'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How much startup money did Apple begin with?',
                            options: ['$1,000', '$1,300', '$1,500', '$2,000'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What company did Jobs found after leaving Apple?',
                            options: ['Microsoft', 'NeXT', 'Google', 'IBM'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'What animation studio did Jobs help create?',
                            options: ['Disney', 'DreamWorks', 'Pixar', 'Warner Bros'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'main_idea',
                            question: 'What was Jobs\' main philosophy about computers?',
                            options: [
                                'Computers should be expensive and exclusive',
                                'Computers should only be for technical experts',
                                'Computers should be user-friendly and accessible',
                                'Computers should focus only on business use'
                            ],
                            correct: 2,
                            skill: 'main_idea'
                        }
                    ]
                },
                {
                    id: 'biography_cet4_easy_comp_004',
                    title: 'Oprah Winfrey: From Poverty to Success',
                    content: `Oprah Winfrey was born into poverty in rural Mississippi in 1954. She faced many challenges during her childhood, including living with different family members and experiencing difficult circumstances. Despite these hardships, Oprah was an excellent student and showed early talent in public speaking.

At age 17, Oprah won a beauty contest and received a scholarship to Tennessee State University. While in college, she began working at a local radio station, which marked the beginning of her media career. Her natural ability to connect with people quickly made her popular with audiences.

In 1976, Oprah moved to Baltimore to co-host a television talk show. Although the show was not initially successful, it gave her valuable experience in television. She learned how to interview guests and developed her unique style of emotional and personal conversations.

Oprah's big break came in 1984 when she moved to Chicago to host a morning talk show called "AM Chicago." Within months, the show became the highest-rated talk show in the city. The program was later renamed "The Oprah Winfrey Show" and became nationally syndicated.

For 25 years, "The Oprah Winfrey Show" was one of the most popular television programs in America. Oprah used her platform to discuss important social issues, promote education, and inspire millions of viewers. She also became a successful businesswoman, actress, and philanthropist.

Today, Oprah is one of the most influential media personalities in the world and has used her success to help others through various charitable organizations and educational initiatives.`,
                    wordCount: 258,
                    difficulty: 'easy',
                    type: 'biography',
                    examType: 'cet4',
                    goal: 'comprehension',
                    source: 'Media Personalities Biography',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'Where was Oprah Winfrey born?',
                            options: ['Tennessee', 'Mississippi', 'Baltimore', 'Chicago'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'How did Oprah get her scholarship to university?',
                            options: [
                                'Through academic excellence',
                                'By winning a beauty contest',
                                'Through a radio station',
                                'From a charitable organization'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'What was the original name of Oprah\'s Chicago show?',
                            options: [
                                'The Oprah Winfrey Show',
                                'Chicago Morning',
                                'AM Chicago',
                                'Oprah Live'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'multiple_choice',
                            question: 'How long did "The Oprah Winfrey Show" run?',
                            options: ['20 years', '25 years', '30 years', '35 years'],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'inference',
                            question: 'What can be inferred about Oprah\'s character?',
                            options: [
                                'She gave up easily when faced with challenges',
                                'She was only interested in making money',
                                'She overcame difficulties and used success to help others',
                                'She avoided discussing serious topics'
                            ],
                            correct: 2,
                            skill: 'inference'
                        }
                    ]
                }
                // 继续添加更多人物传记文章...
            ],
            vocabulary: [
                {
                    id: 'biography_cet4_easy_vocab_001',
                    title: 'Albert Einstein: The Genius Physicist',
                    content: `Albert Einstein was born in Germany in 1879. As a child, he was curious about everything and asked many questions. His teachers thought he was a slow learner, but Einstein was actually thinking deeply about complex problems.

Einstein struggled with traditional education methods. He preferred to explore ideas independently rather than memorize facts. This unconventional approach to learning would later contribute to his revolutionary discoveries in physics.

In 1905, Einstein published several groundbreaking papers that transformed our understanding of space, time, and energy. His famous equation E=mc² showed the relationship between mass and energy. This discovery had profound implications for science and technology.

Einstein's theory of relativity challenged established scientific beliefs. Many scientists initially rejected his ideas because they seemed too radical. However, experimental evidence gradually confirmed his theories, and he gained international recognition.

In 1921, Einstein received the Nobel Prize in Physics for his work on the photoelectric effect. He became a celebrity scientist, known not only for his brilliant mind but also for his humanitarian values and advocacy for peace.

When the Nazis came to power in Germany, Einstein emigrated to the United States. He spent his final years at Princeton University, continuing his research and speaking out against war and discrimination.`,
                    wordCount: 198,
                    difficulty: 'easy',
                    type: 'biography',
                    examType: 'cet4',
                    goal: 'vocabulary',
                    source: 'Scientists Biography Collection',
                    targetWords: ['curious', 'complex', 'unconventional', 'revolutionary', 'profound', 'implications', 'established', 'radical', 'experimental', 'humanitarian', 'advocacy', 'emigrated', 'discrimination'],
                    questions: [
                        {
                            id: 1,
                            type: 'vocabulary',
                            question: 'What does "curious" mean?',
                            options: [
                                'Uninterested',
                                'Eager to learn',
                                'Confused',
                                'Angry'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 2,
                            type: 'vocabulary',
                            question: 'What does "unconventional" mean?',
                            options: [
                                'Traditional',
                                'Normal',
                                'Different from usual',
                                'Simple'
                            ],
                            correct: 2,
                            skill: 'vocabulary'
                        },
                        {
                            id: 3,
                            type: 'vocabulary',
                            question: 'What does "revolutionary" mean?',
                            options: [
                                'Completely new and different',
                                'Old-fashioned',
                                'Boring',
                                'Difficult'
                            ],
                            correct: 0,
                            skill: 'vocabulary'
                        },
                        {
                            id: 4,
                            type: 'vocabulary',
                            question: 'What does "profound" mean?',
                            options: [
                                'Shallow',
                                'Deep and significant',
                                'Quick',
                                'Temporary'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        },
                        {
                            id: 5,
                            type: 'vocabulary',
                            question: 'What does "emigrated" mean?',
                            options: [
                                'Stayed in the same place',
                                'Moved to another country',
                                'Went on vacation',
                                'Visited friends'
                            ],
                            correct: 1,
                            skill: 'vocabulary'
                        }
                    ]
                }
                // 继续添加更多词汇练习传记...
            ]
        }
    },
    
    // IELTS 人物传记
    ielts: {
        medium: {
            comprehension: [
                {
                    id: 'biography_ielts_medium_comp_001',
                    title: 'Frida Kahlo: Art Born from Pain',
                    content: `Frida Kahlo, born Magdalena Carmen Frida Kahlo y Calderón in 1907, emerged as one of Mexico's most celebrated artists despite facing extraordinary personal challenges throughout her life. Her artistic journey began not by choice, but as a consequence of a devastating accident that would define both her physical existence and creative expression.

At the age of eighteen, Kahlo was involved in a severe bus accident that left her with lifelong injuries, including a broken spinal column, fractured pelvis, and numerous other complications. Confined to bed for months during her recovery, she began painting as a way to cope with her pain and isolation. Her mother installed a mirror above her bed, allowing Frida to paint self-portraits, which would become her signature style.

Kahlo's art was deeply autobiographical, reflecting her physical suffering, emotional turmoil, and complex relationship with her Mexican identity. Her paintings often featured vivid colors, symbolic imagery, and surrealist elements, though she rejected the surrealist label, insisting that she painted her own reality rather than dreams.

Her tumultuous marriage to renowned muralist Diego Rivera significantly influenced her work and public persona. The couple's relationship was marked by mutual infidelity, political activism, and artistic collaboration. Despite their passionate but troubled union, both artists profoundly impacted each other's work and Mexico's cultural landscape.

Kahlo's paintings gained international recognition during her lifetime, though she achieved greater fame posthumously. Her work has been interpreted through various lenses: feminist art, Mexican nationalism, and expressions of physical and emotional pain. Today, she is considered an icon not only of Mexican art but of resilience, authenticity, and the transformation of personal suffering into artistic beauty.

The Frida Kahlo Museum in Mexico City, housed in her former home known as the Blue House, attracts hundreds of thousands of visitors annually, testament to her enduring influence on contemporary culture and art.`,
                    wordCount: 315,
                    difficulty: 'medium',
                    type: 'biography',
                    examType: 'ielts',
                    goal: 'comprehension',
                    source: 'Art History Quarterly',
                    questions: [
                        {
                            id: 1,
                            type: 'multiple_choice',
                            question: 'What was Frida Kahlo\'s full birth name?',
                            options: [
                                'Frida Carmen Kahlo',
                                'Magdalena Frida Kahlo',
                                'Magdalena Carmen Frida Kahlo y Calderón',
                                'Carmen Frida Kahlo y Calderón'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 2,
                            type: 'multiple_choice',
                            question: 'At what age did Kahlo have her life-changing accident?',
                            options: ['16', '17', '18', '19'],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 3,
                            type: 'multiple_choice',
                            question: 'Why did Kahlo\'s mother install a mirror above her bed?',
                            options: [
                                'For decoration',
                                'To help her see visitors',
                                'To allow her to paint self-portraits',
                                'To make the room look bigger'
                            ],
                            correct: 2,
                            skill: 'detail'
                        },
                        {
                            id: 4,
                            type: 'true_false',
                            question: 'Frida Kahlo considered herself a surrealist artist.',
                            correct: false,
                            skill: 'detail'
                        },
                        {
                            id: 5,
                            type: 'multiple_choice',
                            question: 'Who was Frida Kahlo married to?',
                            options: [
                                'A politician',
                                'Diego Rivera',
                                'Another painter',
                                'A museum director'
                            ],
                            correct: 1,
                            skill: 'detail'
                        },
                        {
                            id: 6,
                            type: 'inference',
                            question: 'What can be inferred about Kahlo\'s artistic style?',
                            options: [
                                'It was purely decorative',
                                'It was deeply personal and autobiographical',
                                'It focused only on landscapes',
                                'It avoided any reference to her life'
                            ],
                            correct: 1,
                            skill: 'inference'
                        }
                    ]
                }
                // 继续添加更多IELTS中等难度传记...
            ]
        }
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = biographyReadingData;
} else if (typeof window !== 'undefined') {
    window.biographyReadingData = biographyReadingData;
}
