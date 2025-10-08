/**
 * 例句完善脚本
 * 1. 从API获取真实例句
 * 2. 替换重复/模板例句
 * 3. 补充例句翻译
 */

const axios = require('axios');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'chen20040209',
    database: 'learnsphere_ai',
    waitForConnections: true,
    connectionLimit: 5
};

const REQUEST_INTERVAL = 5000; // 5秒间隔，避免限流
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 重复/模板例句模式
const TEMPLATE_PATTERNS = [
    'This is useful for study',
    'I study this carefully',
    'She understands it well',
    'We use this in class',
    'He learns it quickly',
    'is very important in our daily life',
    'We need to understand the',
    'has changed significantly over time'
];

// 检查是否是模板例句
function isTemplateExample(example) {
    if (!example) return true;
    const lower = example.toLowerCase();
    return TEMPLATE_PATTERNS.some(p => lower.includes(p.toLowerCase()));
}

// 从Free Dictionary API获取例句
async function fetchExample(word) {
    try {
        const res = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
            { timeout: 10000 }
        );
        const entry = res.data?.[0];
        if (entry?.meanings) {
            for (const meaning of entry.meanings) {
                for (const def of meaning.definitions || []) {
                    if (def.example) {
                        return { example: def.example, status: 'ok' };
                    }
                }
            }
        }
        return { example: null, status: 'no_example' };
    } catch (e) {
        if (e.response?.status === 429) return { example: null, status: 'rate_limited' };
        return { example: null, status: 'error' };
    }
}


// 根据词性生成例句
function generateExample(word, translation, category) {
    const meaning = (translation || '').split(/[;；,，]/)[0].replace(/[a-zA-Z.&]/g, '').trim() || word;
    const cat = (category || 'n').toLowerCase();
    
    const templates = {
        n: [
            { en: `The ${word} plays an important role in modern society.`, cn: `${meaning}在现代社会中扮演着重要角色。` },
            { en: `We should pay more attention to the ${word}.`, cn: `我们应该更加关注${meaning}。` },
            { en: `The ${word} has become increasingly popular.`, cn: `${meaning}变得越来越受欢迎。` }
        ],
        v: [
            { en: `You need to ${word} the situation carefully.`, cn: `你需要仔细${meaning}这种情况。` },
            { en: `They decided to ${word} immediately.`, cn: `他们决定立即${meaning}。` },
            { en: `It is important to ${word} regularly.`, cn: `定期${meaning}很重要。` }
        ],
        adj: [
            { en: `The result was quite ${word}.`, cn: `结果相当${meaning}。` },
            { en: `She gave a ${word} answer to the question.`, cn: `她对这个问题给出了${meaning}的回答。` },
            { en: `His performance was remarkably ${word}.`, cn: `他的表现非常${meaning}。` }
        ],
        adv: [
            { en: `She completed the task ${word}.`, cn: `她${meaning}地完成了任务。` },
            { en: `The team worked ${word} together.`, cn: `团队${meaning}地合作。` },
            { en: `He spoke ${word} about the issue.`, cn: `他${meaning}地谈论了这个问题。` }
        ]
    };
    
    const list = templates[cat] || templates.n;
    return list[Math.floor(Math.random() * list.length)];
}

// 简单翻译（基于词义生成）
function generateTranslation(example, word, translation) {
    if (!example) return null;
    const meaning = (translation || '').split(/[;；,，]/)[0].trim() || word;
    // 简单的模板翻译
    if (example.includes('important')) return `${meaning}很重要。`;
    if (example.includes('need')) return `我们需要${meaning}。`;
    if (example.includes('should')) return `我们应该${meaning}。`;
    return `这是关于${meaning}的例句。`;
}


async function main() {
    console.log('🚀 例句完善脚本启动\n');
    
    let pool;
    try {
        pool = mysql.createPool(DB_CONFIG);
        console.log('✅ 数据库连接成功\n');
        
        // 统计重复例句
        const [dupStats] = await pool.execute(`
            SELECT example, COUNT(*) as cnt FROM vocabulary 
            WHERE deleted = 0 AND example IS NOT NULL AND example != ''
            GROUP BY example HAVING cnt > 5 ORDER BY cnt DESC LIMIT 10
        `);
        
        if (dupStats.length > 0) {
            console.log('📊 重复例句统计:');
            dupStats.forEach(d => console.log(`   "${d.example.substring(0, 40)}..." x ${d.cnt}`));
            console.log('');
        }
        
        // 获取需要完善的词汇（无例句或模板例句）
        const [words] = await pool.execute(`
            SELECT id, word, translation, example, example_translation
            FROM vocabulary WHERE deleted = 0
            AND (example IS NULL OR example = '' 
                 OR example LIKE '%This is useful for study%'
                 OR example LIKE '%I study this carefully%'
                 OR example LIKE '%She understands it well%'
                 OR example LIKE '%We use this in class%'
                 OR example LIKE '%He learns it quickly%'
                 OR example LIKE '%is very important in our daily life%')
            ORDER BY id LIMIT 1000
        `);
        
        console.log(`📝 需处理: ${words.length} 个词汇\n`);
        
        if (words.length === 0) {
            console.log('✅ 所有例句已完善！');
            return;
        }
        
        let apiSuccess = 0, generated = 0, failed = 0;
        
        for (let i = 0; i < words.length; i++) {
            const vocab = words[i];
            process.stdout.write(`[${i + 1}/${words.length}] ${vocab.word.padEnd(20)}`);
            
            // 尝试从API获取
            const result = await fetchExample(vocab.word);
            
            if (result.status === 'rate_limited') {
                console.log('⚠️ 限流，等待30秒...');
                await delay(30000);
                i--;
                continue;
            }
            
            let example, exampleTrans;
            
            if (result.example) {
                example = result.example;
                exampleTrans = generateTranslation(example, vocab.word, vocab.translation);
                console.log(`✓ API: ${example.substring(0, 40)}...`);
                apiSuccess++;
            } else {
                // 生成例句
                const gen = generateExample(vocab.word, vocab.translation, 'n');
                example = gen.en;
                exampleTrans = gen.cn;
                console.log(`✓ 生成: ${example.substring(0, 40)}...`);
                generated++;
            }
            
            await pool.execute(
                'UPDATE vocabulary SET example = ?, example_translation = ?, update_time = NOW() WHERE id = ?',
                [example, exampleTrans, vocab.id]
            );
            
            await delay(REQUEST_INTERVAL);
        }
        
        console.log('\n' + '='.repeat(50));
        console.log(`📊 API获取: ${apiSuccess}, 自动生成: ${generated}, 失败: ${failed}`);
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
    } finally {
        if (pool) await pool.end();
    }
}

main().catch(console.error);
