/**
 * 阅读理解数据批量生成工具
 * 用于快速生成符合不同组合要求的真实文章数据
 */

class ReadingDataGenerator {
    constructor() {
        this.articleTemplates = {
            news: {
                topics: [
                    'technology', 'environment', 'education', 'health', 'economy', 
                    'science', 'politics', 'culture', 'sports', 'transportation'
                ],
                sources: [
                    'Global News Network', 'International Herald', 'World Report Today',
                    'Daily Chronicle', 'News Weekly', 'Current Affairs Journal'
                ]
            },
            academic: {
                topics: [
                    'psychology', 'sociology', 'linguistics', 'education', 'economics',
                    'anthropology', 'political science', 'philosophy', 'history', 'literature'
                ],
                sources: [
                    'Academic Research Quarterly', 'Journal of Social Sciences', 'Educational Studies',
                    'Research in Psychology', 'International Review', 'Scholarly Publications'
                ]
            },
            science: {
                topics: [
                    'biology', 'physics', 'chemistry', 'astronomy', 'geology',
                    'medicine', 'environmental science', 'technology', 'mathematics', 'engineering'
                ],
                sources: [
                    'Science Today', 'Nature Discovery', 'Scientific American', 'Popular Science',
                    'Research & Development', 'Innovation Magazine'
                ]
            },
            story: {
                topics: [
                    'friendship', 'adventure', 'mystery', 'family', 'courage',
                    'wisdom', 'kindness', 'perseverance', 'honesty', 'growth'
                ],
                sources: [
                    'Short Stories Collection', 'Literary Magazine', 'Fiction Quarterly',
                    'Story Anthology', 'Creative Writing', 'Narrative Arts'
                ]
            },
            biography: {
                topics: [
                    'scientists', 'artists', 'leaders', 'inventors', 'writers',
                    'musicians', 'athletes', 'activists', 'entrepreneurs', 'explorers'
                ],
                sources: [
                    'Biography Today', 'Lives & Achievements', 'Historical Figures',
                    'Great People Series', 'Inspiring Lives', 'Legacy Magazine'
                ]
            },
            travel: {
                topics: [
                    'cultural heritage', 'natural wonders', 'adventure travel', 'city exploration',
                    'food culture', 'festivals', 'architecture', 'traditions', 'landscapes', 'history'
                ],
                sources: [
                    'Travel & Culture', 'World Explorer', 'Cultural Journey',
                    'Adventure Magazine', 'Global Destinations', 'Heritage Travel'
                ]
            }
        };

        this.vocabularyStore = {
            'revolutionize': { def: 'change (something) radically or fundamentally', opts: ['to slightly alter', 'to keep constant', 'to formally approve'] },
            'innovation': { def: 'a new method, idea, product, etc.', opts: ['a traditional practice', 'a complex problem', 'a market decline'] },
            'algorithm': { def: 'a process or set of rules to be followed in calculations', opts: ['a hardware component', 'a type of software bug', 'a user interface design'] },
            'mitigate': { def: 'make (something bad) less severe, serious, or painful', opts: ['to worsen or aggravate', 'to completely ignore', 'to publicly announce'] },
            'biodiversity': { def: 'the variety of plant and animal life in the world or in a particular habitat', opts: ['a single species', 'a geological formation', 'a type of pollution'] },
            'sustainable': { def: 'able to be maintained at a certain rate or level', opts: ['designed for short-term use', 'environmentally harmful', 'economically unfeasible'] },
            'synthesis': { def: 'the combination of ideas to form a theory or system', opts: ['a detailed analysis of one part', 'a random collection of facts', 'a fundamental disagreement'] },
            'nuanced': { def: 'characterized by subtle shades of meaning or expression', opts: ['simple and straightforward', 'loud and clear', 'completely biased'] },
            'perseverance': { def: 'persistence in doing something despite difficulty or delay', opts: ['giving up easily', 'a lack of effort', 'a state of confusion'] },
            'ingenuity': { def: 'the quality of being clever, original, and inventive', opts: ['a lack of creativity', 'the ability to follow instructions', 'a resistance to change'] }
        };

        this.difficultySettings = {
            easy: {
                wordCount: { min: 120, max: 200 },
                sentenceLength: { min: 8, max: 15 },
                vocabularyLevel: 'basic',
                questionCount: { min: 3, max: 5 }
            },
            medium: {
                wordCount: { min: 180, max: 280 },
                sentenceLength: { min: 12, max: 20 },
                vocabularyLevel: 'intermediate',
                questionCount: { min: 4, max: 6 }
            },
            hard: {
                wordCount: { min: 250, max: 400 },
                sentenceLength: { min: 15, max: 25 },
                vocabularyLevel: 'advanced',
                questionCount: { min: 5, max: 8 }
            }
        };

        this.examTypeSettings = {
            cet4: {
                focusAreas: ['basic comprehension', 'vocabulary', 'main ideas'],
                questionTypes: ['multiple_choice', 'true_false'],
                complexity: 'moderate'
            },
            cet6: {
                focusAreas: ['detailed analysis', 'inference', 'critical thinking'],
                questionTypes: ['multiple_choice', 'inference', 'analysis'],
                complexity: 'high'
            },
            toefl: {
                focusAreas: ['academic content', 'complex reasoning', 'synthesis'],
                questionTypes: ['multiple_choice', 'inference', 'summary'],
                complexity: 'high'
            },
            ielts: {
                focusAreas: ['practical application', 'detailed understanding', 'opinion analysis'],
                questionTypes: ['multiple_choice', 'true_false', 'matching'],
                complexity: 'high'
            },
            tem4: {
                focusAreas: ['language proficiency', 'cultural understanding', 'analysis'],
                questionTypes: ['multiple_choice', 'analysis', 'inference'],
                complexity: 'moderate'
            },
            tem8: {
                focusAreas: ['advanced analysis', 'critical evaluation', 'synthesis'],
                questionTypes: ['multiple_choice', 'analysis', 'evaluation'],
                complexity: 'very_high'
            }
        };
    }

    /**
     * 生成指定组合的文章数据
     * @param {string} articleType - 文章类型
     * @param {string} examType - 考试类型
     * @param {string} difficulty - 难度等级
     * @param {string} goal - 练习目标
     * @param {number} count - 生成数量
     * @returns {Array} 生成的文章数组
     */
    generateArticles(articleType, examType, difficulty, goal, count = 100) {
        const articles = [];
        const settings = this.getSettings(articleType, examType, difficulty, goal);
        
        for (let i = 1; i <= count; i++) {
            const article = this.generateSingleArticle(articleType, examType, difficulty, goal, i, settings);
            articles.push(article);
        }
        
        return articles;
    }

    /**
     * 获取生成设置
     */
    getSettings(articleType, examType, difficulty, goal) {
        return {
            articleTemplate: this.articleTemplates[articleType],
            difficultySettings: this.difficultySettings[difficulty],
            examSettings: this.examTypeSettings[examType],
            goal: goal
        };
    }

    /**
     * 生成单篇文章
     */
    generateSingleArticle(articleType, examType, difficulty, goal, index, settings) {
        const id = `${articleType}_${examType}_${difficulty}_${goal}_${String(index).padStart(3, '0')}`;
        const topic = this.getRandomElement(settings.articleTemplate.topics);
        const source = this.getRandomElement(settings.articleTemplate.sources);
        
        // 根据不同类型生成标题和内容
        const { title, content } = this.generateContent(articleType, topic, difficulty, settings);
        
        // 生成问题
        const questions = this.generateQuestions(content, goal, settings);
        
        // 计算词数
        const wordCount = this.countWords(content);
        
        const article = {
            id: id,
            title: title,
            content: content,
            wordCount: wordCount,
            difficulty: difficulty,
            type: articleType,
            examType: examType,
            goal: goal,
            source: source,
            questions: questions
        };

        // 根据练习目标添加特殊字段
        if (goal === 'vocabulary') {
            article.targetWords = this.extractTargetWords(content, difficulty);
        } else if (goal === 'speed') {
            article.timeLimit = this.calculateTimeLimit(wordCount, difficulty);
        }

        return article;
    }

    /**
     * 生成内容（标题和正文）
     */
    generateContent(articleType, topic, difficulty, settings) {
        const contentGenerators = {
            news: this.generateNewsContent.bind(this),
            academic: this.generateAcademicContent.bind(this),
            science: this.generateScienceContent.bind(this),
            story: this.generateStoryContent.bind(this),
            biography: this.generateBiographyContent.bind(this),
            travel: this.generateTravelContent.bind(this)
        };

        return contentGenerators[articleType](topic, difficulty, settings);
    }

    /**
     * 生成学术内容
     */
    generateAcademicContent(topic, difficulty, settings) {
        const title = `A Critical Analysis of ${this.capitalize(topic)} in Contemporary Society`;
        const content = `A recent meta-analysis published in the '${this.getRandomElement(['Journal of Advanced Studies', 'International Review of Social Sciences'])}' explores the complex role of ${topic} in the 21st century. The study, led by Dr. ${this.getRandomElement(['Alina Petrova', 'Samuel Jones'])}, synthesizes findings from over 150 peer-reviewed articles, providing a comprehensive overview of current research trends.

The core argument of the paper is that traditional models of understanding ${topic} are no longer sufficient. The authors propose a new theoretical framework that considers the influence of globalization and digital media. "We need to adopt a more nuanced perspective that acknowledges the interconnectedness of these factors," Dr. Petrova explains. The research highlights a significant correlation between ${topic} and key societal metrics, such as economic mobility and social cohesion.

The methodology involved a rigorous quantitative analysis of existing data, combined with qualitative case studies from diverse cultural contexts. This mixed-methods approach allowed the researchers to identify subtle patterns that previous studies may have overlooked. The findings indicate that policy interventions related to ${topic} must be context-specific to be effective.

The paper concludes by calling for further interdisciplinary research to explore the long-term implications. While the study provides valuable insights, it also opens up new questions about the future of ${topic} in an increasingly complex world. The academic community is expected to engage in a lively debate over these findings in the coming months.`;
        
        return { title, content };
    }

    /**
     * 生成科学内容
     */
    generateScienceContent(topic, difficulty, settings) {
        const title = `Breakthrough in ${this.capitalize(topic)}: A New Frontier`;
        const content = `A team of international scientists has announced a groundbreaking discovery in the field of ${topic}, potentially opening up new avenues for research and technological application. The findings, detailed in the latest issue of '${this.getRandomElement(['Science Horizon', 'Nature Discoveries'])}', challenge long-held theories and provide a new understanding of fundamental processes.

The research, conducted at the ${this.getRandomElement(['Advanced Photonics Lab', 'Quantum Dynamics Institute'])}, utilized a novel experimental setup that allowed for observations at an unprecedented level of detail. "We were able to see things that were previously considered impossible to detect," said lead researcher Dr. ${this.getRandomElement(['Kenji Tanaka', 'Maria Garcia'])}. "This gives us a completely new window into the world of ${topic}."

At the heart of the discovery is a new particle (or mechanism) that behaves in unexpected ways under extreme conditions. This could explain a phenomenon that has puzzled scientists for decades. The implications are vast, ranging from the development of new materials with unique properties to advancements in medical imaging and quantum computing.

While the results are promising, the team emphasizes that the research is still in its early stages. "We have a lot more work to do to fully understand the implications of our findings," Dr. Garcia added. "But this is a major step forward." The scientific community has reacted with excitement, and several independent labs are already planning to replicate and expand upon the experiment.`;
        
        return { title, content };
    }

    /**
     * 生成故事内容
     */
    generateStoryContent(topic, difficulty, settings) {
        const title = `The Unforgettable Lesson of ${this.capitalize(topic)}`;
        const content = `In a small, forgotten town nestled between rolling hills, a young person named ${this.getRandomElement(['Elara', 'Liam', 'Seraphina'])} was about to learn a profound lesson about ${topic}. The story begins on a crisp autumn morning, with the scent of pine in the air and a sense of anticipation hanging over the town.

${this.getRandomElement(['Elara', 'Liam', 'Seraphina'])} was known for being ${this.getRandomElement(['curious', 'headstrong', 'compassionate'])}, but was facing a challenge that seemed insurmountable. A valuable community heirloom, the ${this.getRandomElement(['Starstone', 'Sunstone', 'Moonstone'])}, had been lost, and everyone was in despair. It was through this trial that the true meaning of ${topic} would be revealed.

With the guidance of a wise old mentor, ${this.getRandomElement(['Master Kael', 'Old Man Hemlock', 'Nona'])}, the protagonist embarked on a journey. The path was fraught with obstacles that tested their resolve. It wasn't through strength alone, but through an act of ${topic}, that the crucial clue was finally discovered. The heirloom was found in an unexpected place, hidden not by malice but by misunderstanding.

The experience transformed ${this.getRandomElement(['Elara', 'Liam', 'Seraphina'])}, who came to understand that ${topic} is not just an idea, but a powerful force for change. The town celebrated the return of the heirloom, but more importantly, they celebrated the wisdom their young hero had gained. This tale has been passed down through generations, a timeless reminder of the power of ${topic}.`;
        
        return { title, content };
    }

    /**
     * 生成传记内容
     */
    generateBiographyContent(topic, difficulty, settings) {
        const title = `A Legacy of Innovation: The Life of a Pioneer in ${this.capitalize(topic)}`;
        const content = `The story of ${this.getRandomElement(['Dr. Aris Thorne', 'Eleonora Vance', 'Julian Croft'])}, a visionary ${topic}, is a testament to the power of human ingenuity and perseverance. Born into humble circumstances in ${this.getRandomElement(['the early 1920s', 'a post-war era', 'a time of great social change'])}, their early life was marked by challenges that would forge an unbreakable will.

From a young age, a relentless curiosity about ${topic} set them apart. Despite facing skepticism and limited resources, they pursued their passion, eventually earning a place at the prestigious ${this.getRandomElement(['University of Crestwood', 'Royal Academy of Sciences', 'Solitude Institute'])}. It was here that they began to formulate the groundbreaking theories that would later define their career.

The turning point came with the publication of their seminal work, "${this.getRandomElement(['The Quantum Leap', 'Echoes of the Past', 'Patterns of Progress'])}". This masterpiece challenged the established paradigms of ${topic} and introduced concepts that were initially met with resistance. However, the sheer brilliance and empirical evidence behind the work could not be denied.

Throughout a long and decorated career, this pioneer accumulated numerous accolades, but their true legacy lies in the generations of ${topic}s they inspired. Their life demonstrates that with a clear vision and unwavering dedication, one individual can indeed change the world. Their contributions continue to shape our understanding of ${topic} and inspire future innovators.`;
        
        return { title, content };
    }

    /**
     * 生成旅游内容
     */
    generateTravelContent(topic, difficulty, settings) {
        const title = `A Journey Through Time: Discovering ${this.capitalize(topic)} in ${this.getRandomElement(['Southeast Asia', 'the Mediterranean', 'the Andes Mountains'])}`;
        const content = `For the intrepid traveler seeking a deep connection with ${topic}, the region of ${this.getRandomElement(['Patagonia', 'the Silk Road', 'the Nile Valley'])} offers an unparalleled adventure. This journey is not just about seeing new places, but about experiencing the rich tapestry of history, culture, and nature that defines this corner of the world.

The expedition begins in the ancient city of ${this.getRandomElement(['Xylos', 'Petra', 'Cuzco'])}, a place where ${topic} is etched into every stone. Here, travelers can explore bustling markets, ancient temples, and hidden alleyways, each telling a story of a bygone era. Local cuisine offers a sensory explosion, with flavors passed down through centuries.

The next leg of the journey ventures into the breathtaking natural landscapes that surround the city. From towering mountain peaks to serene river valleys, the environment itself is a testament to the enduring power of ${topic}. Expert guides lead treks that reveal hidden waterfalls, rare wildlife, and panoramic vistas that seem to touch the sky.

A highlight of the trip is the opportunity to engage with local communities. Homestays with indigenous families provide a unique insight into their traditions and way of life. This cultural exchange is often the most memorable part of the experience, fostering a profound appreciation for the human element of ${topic}. This is more than a vacation; it's an exploration of the soul of a place.`;
        
        return { title, content };
    }

    /**
     * 生成新闻内容
     */
    generateNewsContent(topic, difficulty, settings) {
        const newsTemplates = {
            technology: {
                titles: [
                    'New AI Breakthrough Could Revolutionize {industry}',
                    '{Company} Unveils Next-Generation {product}',
                    'The Future of {field}: A Deep Dive into Recent Innovations',
                ],
                content: `In a major announcement today, researchers at the {institution} have revealed a groundbreaking development in {topic}. This innovation, centered around {adjective} algorithms, is poised to reshape the landscape of the {industry} sector. Experts believe this could lead to a {percentage}% increase in {metric} and significantly improve {application}.

Dr. {name}, a leading scientist on the project, stated, "We've overcome a significant {obstacle} that has puzzled experts for years. Our approach involves {process}, which allows for unprecedented levels of {metric}." The technology is expected to be integrated into {product}s by {date}.

However, the rapid advancement has also sparked debate about {issue}. Critics raise concerns about {concern}, warning that without proper regulation, the technology could be misused. Industry analysts are cautiously optimistic, suggesting that while the potential is enormous, addressing the {challenge_area} will be critical for long-term success. The global community is now watching closely as {Company} and its competitors race to harness this new power.`
            },
            environment: {
                titles: [
                    'Global Leaders Agree on Landmark Climate Accord to Combat {issue}',
                    'New Study Reveals Alarming Rate of {habitat} Loss',
                    'Innovative {solution} Offers Hope for a Greener Future',
                ],
                content: `An international summit on climate change concluded today with a historic agreement aimed at curbing {issue}. Nations pledged to reduce emissions by {percentage}% over the next decade. The accord focuses on promoting {solution} and investing in {field}.

A recent report published in '{journal}' paints a grim picture of the world's ecosystems. The study, which tracked {habitat} loss over 20 years, found that human activities like {activity} have led to a critical decline in biodiversity. Lead author Dr. {name} emphasized the urgent need for conservation efforts to protect endangered species.

On a more positive note, a startup named {Company} has developed a novel {product} that could help mitigate environmental damage. Their technology uses {process} to {action} pollutants from the atmosphere. "Our goal is to make environmental protection economically viable," said the CEO. While still in early stages, this innovation represents a significant step forward in the fight against climate change.`
            },
            health: {
                titles: [
                    'Major Breakthrough in {disease} Research Announced',
                    'New Public Health Initiative Targets {health_issue}',
                    '{Company} Receives Approval for New {treatment} Drug',
                ],
                content: `Scientists at the {institution} have announced a significant breakthrough in the fight against {disease}. Their research, published in '{journal}', identifies a key biological marker that could lead to earlier diagnosis and more effective {treatment}. This discovery could improve the lives of millions worldwide.

In response to rising rates of {health_issue}, the government has launched a nationwide public health campaign. The initiative aims to educate the public about preventative measures, such as {preventative_measure} and {preventative_measure2}. Health officials hope this program will reduce the strain on the healthcare system.

Meanwhile, pharmaceutical company {Company} has received regulatory approval for its new drug, designed to treat {disease}. Clinical trials showed the {treatment} to be {percentage}% more effective than existing options. However, concerns about its high cost and potential side effects remain a topic of discussion among medical professionals.`
            },
        };

        const template = newsTemplates[topic] || newsTemplates.technology; // Fallback to technology
        const title = this.fillTemplate(this.getRandomElement(template.titles), topic);
        const content = this.fillTemplate(template.content, topic);

        return { title, content };
    }

    /**
     * 填充模板变量
     */
    fillTemplate(template, topic) {
        const variables = {
            // General
            '{topic}': topic,
            '{name}': this.getRandomElement(['Dr. Evelyn Reed', 'Dr. Kenji Tanaka', 'Dr. Aisha Khan', 'Dr. Ben Carter']),
            '{institution}': this.getRandomElement(['Global Research Institute', 'National Science University', 'Center for Advanced Studies', 'Institute of Technology']),
            '{company}': this.getRandomElement(['Innovate Corp', 'Future Dynamics', 'Quantum Solutions', 'BioSynth Inc.']),
            '{product}': this.getRandomElement(['platform', 'device', 'system', 'solution']),
            '{field}': this.getRandomElement(['artificial intelligence', 'biotechnology', 'renewable energy', 'nanotechnology']),
            '{percentage}': this.getRandomElement(['15', '25', '40', '50']),
            '{date}': this.getRandomElement(['2026', 'the end of next year', 'the first quarter of 2027']),
            '{issue}': this.getRandomElement(['data privacy', 'ethical implications', 'carbon emissions', 'resource depletion']),
            '{process}': this.getRandomElement(['a novel deep-learning model', 'a CRISPR-based gene-editing technique', 'a decentralized blockchain network', 'a quantum computing simulation']),
            '{metric}': this.getRandomElement(['efficiency', 'accuracy', 'sustainability', 'cost-effectiveness']),
            '{application}': this.getRandomElement(['data analysis', 'medical diagnostics', 'supply chain management', 'energy consumption']),
            
            // Technology-specific
            '{industry}': this.getRandomElement(['healthcare', 'finance', 'transportation', 'entertainment']),
            '{adjective}': this.getRandomElement(['groundbreaking', 'revolutionary', 'transformative', 'disruptive']),
            '{obstacle}': this.getRandomElement(['computational limit', 'data bottleneck', 'integration challenge', 'scalability problem']),
            '{challenge_area}': this.getRandomElement(['regulatory hurdles', 'public adoption', 'security vulnerabilities', 'job displacement']),
            '{concern}': this.getRandomElement(['algorithmic bias', 'surveillance capabilities', 'unforeseen social impacts', 'energy usage']),
            
            // Environment-specific
            '{habitat}': this.getRandomElement(['rainforests', 'coral reefs', 'wetlands', 'arctic ice caps']),
            '{solution}': this.getRandomElement(['carbon capture technology', 'sustainable agriculture', 'circular economy models', 'reforestation projects']),
            '{journal}': this.getRandomElement(['Nature', 'Science', 'The Lancet', 'Cell']),
            '{activity}': this.getRandomElement(['deforestation', 'industrial pollution', 'overfishing', 'urban sprawl']),
            '{action}': this.getRandomElement(['remove', 'neutralize', 'convert', 'recycle']),

            // Health-specific
            '{disease}': this.getRandomElement(['Alzheimer\'s', 'cancer', 'diabetes', 'cardiovascular disease']),
            '{health_issue}': this.getRandomElement(['obesity', 'mental health stigma', 'antibiotic resistance', 'vaping-related illnesses']),
            '{treatment}': this.getRandomElement(['gene therapy', 'immunotherapy', 'personalized medicine', 'nanobot delivery system']),
            '{preventative_measure}': this.getRandomElement(['a balanced diet', 'regular exercise', 'mental health awareness', 'vaccination programs']),
            '{preventative_measure2}': this.getRandomElement(['better sleep hygiene', 'reduced screen time', 'community support groups', 'regular health check-ups']),
        };

        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(key, 'g'), value);
        }

        return result;
    }

    /**
     * 生成问题
     */
    generateQuestions(content, goal, settings) {
        const questionCount = this.getRandomNumber(
            settings.difficultySettings.questionCount.min,
            settings.difficultySettings.questionCount.max
        );

        const questions = [];
        const questionGenerators = {
            comprehension: this.generateComprehensionQuestions.bind(this),
            vocabulary: this.generateVocabularyQuestions.bind(this),
            speed: this.generateSpeedQuestions.bind(this),
            analysis: this.generateAnalysisQuestions.bind(this)
        };

        return questionGenerators[goal](content, questionCount, settings);
    }

    /**
     * 生成词汇类问题
     */
    generateVocabularyQuestions(content, count, settings) {
        const questions = [];
        const words = this.getKeywords(content, count + 5); // Get more keywords
        const targetWords = words.slice(0, count);

        for (let i = 1; i <= count; i++) {
            const word = targetWords[i-1];
            if (!word) continue;

            const options = this.generateDefinitionOptions(word);
            if (options.length < 4) continue;

            const question = {
                id: i,
                type: 'vocabulary',
                question: `In the context of the passage, what is the closest meaning of the word "${word}"?`,
                options: options.map(o => o.text),
                correct: options.findIndex(o => o.correct),
                skill: 'vocabulary'
            };
            questions.push(question);
        }

        return questions;
    }

    generateDefinitionOptions(word) {
        if (this.vocabularyStore[word.toLowerCase()]) {
            const entry = this.vocabularyStore[word.toLowerCase()];
            const options = [
                { text: this.capitalize(entry.def), correct: true },
                ...entry.opts.map(opt => ({ text: this.capitalize(opt), correct: false }))
            ];
            return this.shuffleArray(options);
        }

        // Fallback for words not in the store
        const options = [];
        const correctDefinition = `A concept or idea related to ${word}.`;
        options.push({ text: this.capitalize(correctDefinition), correct: true });

        const synonyms = ['A related concept', 'A similar idea', 'A relevant term'];
        const antonyms = ['An opposite concept', 'A contrasting idea', 'An unrelated term'];
        
        options.push({ text: this.capitalize(`${this.getRandomElement(synonyms)} to ${word}`), correct: false });
        options.push({ text: this.capitalize(`${this.getRandomElement(antonyms)} of ${word}`), correct: false });
        options.push({ text: `A description of something else entirely unrelated to ${word}.`, correct: false });
        
        while(options.length > 4) {
            options.pop();
        }

        return this.shuffleArray(options);
    }
    
    /**
     * 生成速度类问题
     */
    generateSpeedQuestions(content, count, settings) {
        const questions = [];
        
        for (let i = 1; i <= Math.min(count, 3); i++) {
            const question = {
                id: i,
                type: 'multiple_choice',
                question: `Quick comprehension question ${i}`,
                options: [
                    'Option A',
                    'Option B', 
                    'Option C',
                    'Option D'
                ],
                correct: Math.floor(Math.random() * 4),
                skill: 'speed'
            };
            questions.push(question);
        }

        return questions;
    }

    /**
     * 生成分析类问题
     */
    generateAnalysisQuestions(content, count, settings) {
        const questions = [];
        
        for (let i = 1; i <= count; i++) {
            const question = {
                id: i,
                type: 'analysis',
                question: `What is the structure/tone/purpose of this passage?`,
                options: [
                    'Analysis option A',
                    'Analysis option B',
                    'Analysis option C', 
                    'Analysis option D'
                ],
                correct: Math.floor(Math.random() * 4),
                skill: 'analysis'
            };
            questions.push(question);
        }

        return questions;
    }

    /**
     * 生成理解类问题
     */
    generateComprehensionQuestions(content, count, settings) {
        const questions = [];
        const sentences = this.getSentences(content);
        if (sentences.length < 2) return []; // Not enough content to generate questions

        const questionTypes = ['detail', 'main_idea', 'inference'];

        for (let i = 1; i <= count; i++) {
            const questionType = this.getRandomElement(questionTypes);
            
            // Ensure we have sentences to work with
            const sentence = this.getRandomElement(sentences);
            if (!sentence) continue;

            const questionText = this.generateQuestionText(sentence, questionType);
            const options = this.generateOptions(sentence, sentences, content, questionType);

            // If options can't be generated, skip this question
            if (options.length < 4) continue;
            
            const question = {
                id: i,
                type: 'multiple_choice',
                question: questionText,
                options: options.map(o => o.text),
                correct: options.findIndex(o => o.correct),
                skill: questionType
            };
            questions.push(question);
        }

        return questions;
    }

    /**
     * 生成问题文本
     */
    generateQuestionText(sentence, questionType) {
        const keywords = this.getKeywords(sentence, 2);
        const mainKeyword = keywords.length > 0 ? keywords[0] : 'the main topic';

        const questionTemplates = {
            detail: [
                `According to the passage, what is stated about ${mainKeyword}?`,
                `What specific detail is mentioned regarding ${this.getRandomElement(keywords) || 'this topic'}?`,
            ],
            main_idea: [
                'What is the main idea of this article?',
                'Which of the following best summarizes the passage?',
                'What is the primary purpose of this text?'
            ],
            inference: [
                `What can be inferred from the statement: "${sentence.substring(0, 50)}..."?`,
                'What does the author imply about ' + mainKeyword + '?',
            ]
        };

        const templates = questionTemplates[questionType] || questionTemplates.detail;
        return this.getRandomElement(templates);
    }

    /**
     * 生成选项
     */
    generateOptions(correctSentence, allSentences, content, questionType) {
        let options = [];
        
        // Correct Answer
        let correctAnswerText = '';
        if (questionType === 'detail') {
            correctAnswerText = this.simplifySentence(correctSentence);
        } else if (questionType === 'main_idea') {
            correctAnswerText = this.summarizeContent(content);
        } else { // inference
            correctAnswerText = this.createInference(correctSentence);
        }
        options.push({ text: this.capitalize(correctAnswerText), correct: true });

        // Distractors
        let distractors = [];
        while (distractors.length < 3) {
            const randomSentence = this.getRandomElement(allSentences);
            if (randomSentence === correctSentence) continue;
            
            let distractorText = '';
            if (questionType === 'detail') {
                distractorText = this.mutateSentence(randomSentence);
            } else {
                distractorText = this.simplifySentence(randomSentence);
            }

            // Ensure distractor is not too similar to correct answer or other distractors
            if (distractorText.length > 10 && !options.some(opt => opt.text.includes(distractorText.substring(0, 20)))) {
                 distractors.push(distractorText);
                 options.push({ text: this.capitalize(distractorText), correct: false });
            }
        }
        
        return this.shuffleArray(options);
    }

    /**
     * 工具方法
     */
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // New Helper Methods for Q&A Generation
    getSentences(text) {
        return text.match(/[^.!?]+[.!?]+/g) || [];
    }

    getKeywords(sentence, count = 2) {
        // Simple keyword extraction: find nouns and proper nouns (capitalized words not at sentence start)
        const words = sentence.replace(/[^a-zA-Z\s]/g, '').split(/\s+/);
        const commonWords = new Set(['the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'is', 'are', 'was', 'were', 'it', 'that', 'this']);
        let keywords = words.filter(word => word.length > 4 && !commonWords.has(word.toLowerCase()));
        keywords = keywords.filter((v, i, a) => a.indexOf(v) === i); // Unique
        return keywords.slice(0, count);
    }

    simplifySentence(sentence) {
        // Simple simplification: take the first part of a sentence
        return sentence.split(',')[0].trim();
    }
    
    summarizeContent(content) {
        // Simple summary: take the first sentence
        return this.getSentences(content)[0] || "The article discusses an important topic.";
    }

    createInference(sentence) {
        // Simple inference: rephrase the sentence slightly
        // This is a placeholder for a more complex logic
        const keywords = this.getKeywords(sentence, 2);
        if (keywords.length > 1) {
            return `The author suggests a connection between ${keywords[0]} and ${keywords[1]}.`;
        }
        return `The passage implies something significant about ${keywords[0] || 'the topic'}.`;
    }

    mutateSentence(sentence) {
        // Simple mutation: replace a keyword to make it incorrect
        const keywords = this.getKeywords(sentence, 1);
        if (keywords.length > 0) {
            const fakeWords = ['an unrelated concept', 'a different theory', 'an opposing idea'];
            return sentence.replace(keywords[0], this.getRandomElement(fakeWords));
        }
        return "This statement is not supported by the text.";
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    extractTargetWords(content, difficulty) {
        // 简化版本，实际应该根据难度提取合适的词汇
        const words = content.match(/\b[a-zA-Z]{6,}\b/g) || [];
        return words.slice(0, 8);
    }

    calculateTimeLimit(wordCount, difficulty) {
        const readingSpeed = {
            easy: 200,    // words per minute
            medium: 180,
            hard: 150
        };
        
        const speed = readingSpeed[difficulty];
        return Math.ceil((wordCount / speed) * 60) + 30; // add 30 seconds for questions
    }

    /**
     * 批量生成所有组合的数据
     */
    generateAllCombinations() {
        const articleTypes = ['news', 'academic', 'science', 'story', 'biography', 'travel'];
        const examTypes = ['cet4', 'cet6', 'toefl', 'ielts', 'tem4', 'tem8', 'postgraduate', 'gre'];
        const difficulties = ['easy', 'medium', 'hard'];
        const goals = ['comprehension', 'vocabulary', 'speed', 'analysis'];

        const allData = {};

        articleTypes.forEach(articleType => {
            allData[articleType] = {};
            
            examTypes.forEach(examType => {
                allData[articleType][examType] = {};
                
                difficulties.forEach(difficulty => {
                    allData[articleType][examType][difficulty] = {};
                    
                    goals.forEach(goal => {
                        console.log(`Generating ${articleType}-${examType}-${difficulty}-${goal}...`);
                        allData[articleType][examType][difficulty][goal] = 
                            this.generateArticles(articleType, examType, difficulty, goal, 100);
                    });
                });
            });
        });

        return allData;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReadingDataGenerator;
} else if (typeof window !== 'undefined') {
    window.ReadingDataGenerator = ReadingDataGenerator;
}
