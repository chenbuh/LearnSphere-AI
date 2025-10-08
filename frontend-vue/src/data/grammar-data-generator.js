/**
 * 语法练习数据批量生成工具
 */
class GrammarDataGenerator {
    constructor() {
        this.categories = {
            tenses: {
                name: '动词时态',
                subcategories: ['present_simple', 'present_continuous', 'past_simple', 'past_continuous', 'present_perfect', 'future_simple', 'past_perfect', 'future_perfect', 'present_perfect_continuous', 'past_perfect_continuous'],
                generation_function: this.generateTensesQuestion.bind(this)
            },
            articles: {
                name: '冠词',
                subcategories: ['indefinite_articles', 'definite_articles', 'zero_articles'],
                generation_function: this.generateArticlesQuestion.bind(this)
            },
            prepositions: {
                name: '介词',
                subcategories: ['time', 'place', 'movement', 'phrasal'],
                generation_function: this.generatePrepositionsQuestion.bind(this)
            },
            clauses: {
                name: '从句',
                subcategories: ['relative_who', 'relative_which', 'relative_that', 'adverbial_time', 'adverbial_condition'],
                generation_function: this.generateClausesQuestion.bind(this)
            },
            modals: {
                name: '情态动词',
                subcategories: ['ability', 'permission', 'possibility', 'obligation', 'advice', 'speculation'],
                generation_function: this.generateModalsQuestion.bind(this)
            },
            conditionals: {
                name: '条件句',
                subcategories: ['zero_conditional', 'first_conditional', 'second_conditional', 'third_conditional'],
                generation_function: this.generateConditionalsQuestion.bind(this)
            }
        };

        this.vocabulary = {
            subjects: {
                person: ['The student', 'The teacher', 'My friend', 'She', 'He', 'They', 'The scientist', 'The author'],
                object: ['The book', 'The car', 'The computer', 'The project', 'The research', 'The city']
            },
            verbs: {
                // base, present_s, past, participle, ing
                read: ['read', 'reads', 'read', 'read', 'reading'],
                write: ['write', 'writes', 'wrote', 'written', 'writing'],
                study: ['study', 'studies', 'studied', 'studied', 'studying'],
                develop: ['develop', 'develops', 'developed', 'developed', 'developing'],
                discover: ['discover', 'discovers', 'discovered', 'discovered', 'discovering'],
                go: ['go', 'goes', 'went', 'gone', 'going'],
                see: ['see', 'sees', 'saw', 'seen', 'seeing']
            },
            objects: {
                person: ['a letter', 'the report', 'the exam', 'a new language', 'a new theory'],
                object: ['a novel', 'an email', 'an interesting article', 'the solution', 'the mountain peak']
            },
            places: ['in the library', 'at home', 'in the office', 'at the university', 'in the laboratory'],
            time_adverbs: {
                present: ['every day', 'often', 'sometimes', 'now', 'at the moment'],
                past: ['yesterday', 'last week', 'three years ago', 'in 2020'],
                future: ['tomorrow', 'next month', 'in the future']
            }
        };
    }

    generateQuestions(category, difficulty, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            const subcategory = this.getRandomElement(this.categories[category].subcategories);
            const question = this.generateSingleQuestion(category, subcategory, difficulty, i);
            if (question) { // Ensure question is not null
                questions.push(question);
            }
        }
        return questions;
    }

    generateSingleQuestion(category, subcategory, difficulty, index) {
        const id = `${category}_${difficulty}_${String(index).padStart(3, '0')}`;
        
        const generationFunc = this.categories[category]?.generation_function;
        if (!generationFunc) {
            console.warn(`No generation function for category: ${category}`);
            return null;
        }

        const questionData = generationFunc(subcategory, difficulty);
        if (!questionData) return null;

        return {
            id,
            type: 'multiple_choice',
            difficulty,
            category,
            subcategory,
            ...questionData
        };
    }

    generateTensesQuestion(subcategory, difficulty) {
        const v = this.getRandomElement(Object.keys(this.vocabulary.verbs));
        const verbForms = this.vocabulary.verbs[v];
        const subject = this.getRandomElement(this.vocabulary.subjects.person);
        const object = this.getRandomElement(this.vocabulary.objects.object);
        
        let template;
        const templates = {
            present_simple: { q: `${subject} _____ ${object} ${this.getRandomElement(this.vocabulary.time_adverbs.present)}.`, a: verbForms[1], o: [verbForms[0], verbForms[4], verbForms[2]]},
            past_simple: { q: `${subject} _____ ${object} ${this.getRandomElement(this.vocabulary.time_adverbs.past)}.`, a: verbForms[2], o: [verbForms[0], verbForms[4], verbForms[1]]},
            future_simple: { q: `${subject} _____ ${object} ${this.getRandomElement(this.vocabulary.time_adverbs.future)}.`, a: `will ${verbForms[0]}`, o: [verbForms[4], verbForms[2], `is going to ${verbForms[0]}`]},
            present_continuous: { q: `${subject} _____ ${object} right now.`, a: `is ${verbForms[4]}`, o: [verbForms[1], verbForms[2], verbForms[0]]},
            past_continuous: { q: `While ${subject.toLowerCase()} _____ ${object}, the phone rang.`, a: `was ${verbForms[4]}`, o: [verbForms[2], verbForms[1], `had ${verbForms[3]}`]},
            present_perfect: { q: `${subject} _____ ${object} several times.`, a: `has ${verbForms[3]}`, o: [verbForms[2], `is ${verbForms[4]}`, verbForms[1]]}
        };

        template = templates[subcategory];
        if (!template) return null;

        const question = template.q.replace('_____', `_____ (${v})`);
        const options = this.shuffleArray([...template.o, template.a]);
        const correctIndex = options.indexOf(template.a);
        
        return {
            question,
            options,
            correct: correctIndex,
            explanation: `For the verb "${v}", this sentence requires the ${subcategory.replace(/_/g, ' ')} tense.`
        };
    }

    generateArticlesQuestion(subcategory, difficulty) {
        const templates = {
            indefinite_articles: [
                { q: 'I saw _____ beautiful cat in the garden.', a: 'a', o: ['an', 'the', 'no article'] },
                { q: 'He is _____ honest person.', a: 'an', o: ['a', 'the', 'no article'] },
                { q: 'She wants to be _____ astronaut.', a: 'an', o: ['a', 'the', 'no article'] },
            ],
            definite_articles: [
                { q: '_____ sun is very bright today.', a: 'The', o: ['A', 'An', 'No article'] },
                { q: 'Can you pass me _____ salt, please?', a: 'the', o: ['a', 'an', 'no article'] },
                { q: 'This is _____ best movie I have ever seen.', a: 'the', o: ['a', 'an', 'no article'] },
            ],
            zero_articles: [
                { q: 'I love listening to _____ music.', a: 'no article', o: ['a', 'an', 'the'] },
                { q: 'She is good at _____ mathematics.', a: 'no article', o: ['a', 'an', 'the'] },
                { q: 'We go to _____ school by bus.', a: 'no article', o: ['a', 'an', 'the'] },
            ]
        };

        const availableTemplates = templates[subcategory] || [];
        if (availableTemplates.length === 0) return null;

        const template = this.getRandomElement(availableTemplates);
        const options = this.shuffleArray([...template.o, template.a]);
        const correctIndex = options.indexOf(template.a);
        
        return {
            question: template.q,
            options,
            correct: correctIndex,
            explanation: `This sentence requires ${subcategory.replace(/_/g, ' ')}.`
        };
    }

    generatePrepositionsQuestion(subcategory, difficulty) {
        const templates = {
            time: [
                { q: 'The meeting is _____ Monday.', a: 'on', o: ['in', 'at', 'by'] },
                { q: 'I will see you _____ 5 PM.', a: 'at', o: ['in', 'on', 'since'] },
                { q: 'She was born _____ 1995.', a: 'in', o: ['on', 'at', 'from'] },
            ],
            place: [
                { q: 'The cat is hiding _____ the bed.', a: 'under', o: ['on', 'in', 'above'] },
                { q: 'There is a picture _____ the wall.', a: 'on', o: ['in', 'at', 'over'] },
                { q: 'He lives _____ a small apartment.', a: 'in', o: ['on', 'at', 'by'] },
            ],
            phrasal: [
                { q: 'She is interested _____ learning new languages.', a: 'in', o: ['on', 'at', 'for'] },
                { q: 'He is very good _____ playing the guitar.', a: 'at', o: ['in', 'on', 'with'] },
                { q: 'I look forward _____ seeing you soon.', a: 'to', o: ['for', 'at', 'in'] },
            ]
        };

        const availableTemplates = templates[subcategory] || [];
        if (availableTemplates.length === 0) return null;

        const template = this.getRandomElement(availableTemplates);
        const options = this.shuffleArray([...template.o, template.a]);
        const correctIndex = options.indexOf(template.a);
        
        return {
            question: template.q,
            options,
            correct: correctIndex,
            explanation: `This sentence uses a common preposition for ${subcategory.replace(/_/g, ' ')}.`
        };
    }
    
    generateClausesQuestion(subcategory, difficulty) {
        const templates = {
            relative_who: { q: 'The person _____ called you is my boss.', a: 'who', o: ['which', 'that', 'whose'] },
            relative_which: { q: 'The computer _____ I bought last week is very fast.', a: 'which', o: ['who', 'that', 'where'] },
            adverbial_time: { q: 'I will call you _____ I finish my work.', a: 'when', o: ['although', 'because', 'if'] },
            adverbial_condition: { q: '_____ it rains tomorrow, the picnic will be cancelled.', a: 'If', o: ['Although', 'Because', 'When'] },
        };
        const template = templates[subcategory];
        if (!template) return null;
        
        const options = this.shuffleArray([...template.o, template.a]);
        const correctIndex = options.indexOf(template.a);
        return { question: template.q, options, correct: correctIndex, explanation: `This sentence requires a ${subcategory.replace(/_/g, ' ')}.` };
    }

    generateModalsQuestion(subcategory, difficulty) {
        const templates = {
            ability: { q: 'She _____ speak three languages fluently.', a: 'can', o: ['must', 'should', 'may'] },
            permission: { q: '_____ I use your phone for a moment?', a: 'May', o: ['Must', 'Should', 'Will'] },
            possibility: { q: 'It _____ rain later, the sky is very cloudy.', a: 'might', o: ['must', 'should', 'can'] },
            obligation: { q: 'You _____ finish this report by Friday.', a: 'must', o: ['can', 'may', 'might'] },
            advice: { q: 'You _____ see a doctor if you feel unwell.', a: 'should', o: ['must', 'can', 'may'] },
        };
        const template = templates[subcategory];
        if (!template) return null;

        const options = this.shuffleArray([...template.o, template.a]);
        const correctIndex = options.indexOf(template.a);
        return { question: template.q, options, correct: correctIndex, explanation: `This sentence expresses ${subcategory}.` };
    }

    generateConditionalsQuestion(subcategory, difficulty) {
        const templates = {
            first_conditional: { q: 'If you _____ (study) hard, you will pass the exam.', a: 'study', o: ['studied', 'will study', 'are studying'] },
            second_conditional: { q: 'If I _____ (be) you, I would take the job.', a: 'were', o: ['am', 'was', 'would be'] },
            third_conditional: { q: 'She would have come if she _____ (know) about the party.', a: 'had known', o: ['knew', 'knows', 'would have known'] },
        };
        const template = templates[subcategory];
        if (!template) return null;

        const question = template.q;
        const correctAnswer = template.a;
        const options = this.shuffleArray([...template.o, correctAnswer]);
        const correctIndex = options.indexOf(correctAnswer);

        return {
            question,
            options,
            correct: correctIndex,
            explanation: `This is a ${subcategory.replace(/_/g, ' ')}.`
        };
    }

    getRandomElement(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarDataGenerator;
}
