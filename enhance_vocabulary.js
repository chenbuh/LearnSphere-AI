/**
 * 词汇完善脚本 - 使用多个免费API
 * 完善音标、例句、例句翻译
 */
const axios = require('axios');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'chen20040209',
    database: 'learnsphere_ai'
};

const REQUEST_INTERVAL = 3000; // 3秒间隔
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// API 1: Free Dictionary API
async function fetchFromFreeDictionary(word) {
    try {
        const res = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
            { timeout: 10000 }
        );
        const entry = res.data?.[0];
        if (!entry) return null;
        
        let phonetic = entry.phonetic;
        if (!phonetic && entry.phonetics) {
            for (const p of entry.phonetics) {
                if (p.text) { phonetic = p.text; break; }
            }
        }
        
        let example = null;
        if (entry.meanings) {
            for (const m of entry.meanings) {
                for (const d of m.definitions || []) {
                    if (d.example) { example = d.example; break; }
                }
                if (example) break;
            }
        }
        
        return { phonetic, example, status: 'ok' };
    } catch (e) {
        if (e.response?.status === 429) return { status: 'rate_limited' };
        if (e.response?.status === 404) return { status: 'not_found' };
        return { status: 'error' };
    }
}


// API 2: Wordnik API (备用)
async function fetchFromWordnik(word) {
    try {
        // Wordnik 免费API
        const res = await axios.get(
            `https://api.wordnik.com/v4/word.json/${encodeURIComponent(word.toLowerCase())}/definitions?limit=1&api_key=demo`,
            { timeout: 8000 }
        );
        if (res.data?.[0]?.text) {
            return { definition: res.data[0].text, status: 'ok' };
        }
    } catch (e) {}
    return null;
}

// 生成例句翻译（简单模板）
function generateExampleTranslation(example, word, translation) {
    if (!example || !translation) return null;
    const meaning = translation.split(/[;；,，]/)[0].replace(/[a-zA-Z.&\s]/g, '').trim();
    if (!meaning) return null;
    
    // 根据例句特征生成翻译
    if (example.toLowerCase().includes('important')) return `${meaning}很重要。`;
    if (example.toLowerCase().includes('need')) return `我们需要${meaning}。`;
    if (example.toLowerCase().includes('want')) return `我想要${meaning}。`;
    if (example.toLowerCase().includes('like')) return `我喜欢${meaning}。`;
    if (example.toLowerCase().includes('use')) return `我们使用${meaning}。`;
    return `这是一个关于"${meaning}"的例句。`;
}

// 生成例句（当API没有时）
function generateExample(word, translation, category) {
    const meaning = (translation || '').split(/[;；,，]/)[0].replace(/[a-zA-Z.&]/g, '').trim() || word;
    const cat = (category || 'n').toLowerCase();
    
    const templates = {
        n: [
            [`The ${word} is essential for our daily life.`, `${meaning}对我们的日常生活至关重要。`],
            [`We need to understand the ${word} better.`, `我们需要更好地理解${meaning}。`],
            [`The ${word} has changed over time.`, `${meaning}随时间发生了变化。`]
        ],
        v: [
            [`You should ${word} carefully.`, `你应该仔细${meaning}。`],
            [`They decided to ${word} immediately.`, `他们决定立即${meaning}。`],
            [`It is important to ${word} regularly.`, `定期${meaning}很重要。`]
        ],
        adj: [
            [`The result was quite ${word}.`, `结果相当${meaning}。`],
            [`She gave a ${word} answer.`, `她给出了${meaning}的回答。`],
            [`His work is remarkably ${word}.`, `他的工作非常${meaning}。`]
        ],
        adv: [
            [`She completed the task ${word}.`, `她${meaning}地完成了任务。`],
            [`The team worked ${word}.`, `团队${meaning}地工作。`],
            [`He spoke ${word}.`, `他${meaning}地说。`]
        ]
    };
    
    const list = templates[cat] || templates.n;
    const [en, cn] = list[Math.floor(Math.random() * list.length)];
    return { example: en, exampleTrans: cn };
}


// 主函数
async function main() {
    console.log('🚀 词汇完善脚本启动');
    console.log(`⏱️  请求间隔: ${REQUEST_INTERVAL/1000}秒\n`);
    
    let conn;
    try {
        conn = await mysql.createConnection(DB_CONFIG);
        console.log('✅ 数据库连接成功\n');
        
        // 获取需要完善的词汇
        const [words] = await conn.execute(`
            SELECT id, word, phonetic, translation, example, example_translation
            FROM vocabulary WHERE deleted = 0
            AND (phonetic IS NULL OR phonetic = '' OR phonetic LIKE '%&%'
                 OR example IS NULL OR example = ''
                 OR example LIKE '%This is useful%' OR example LIKE '%I study this%')
            ORDER BY id LIMIT 500
        `);
        
        console.log(`📝 需处理: ${words.length} 个词汇\n`);
        
        if (words.length === 0) {
            console.log('✅ 所有词汇已完善！');
            return;
        }
        
        let success = 0, apiHit = 0, generated = 0;
        
        for (let i = 0; i < words.length; i++) {
            const v = words[i];
            process.stdout.write(`[${i+1}/${words.length}] ${v.word.padEnd(18)}`);
            
            // 从API获取数据
            const result = await fetchFromFreeDictionary(v.word);
            
            if (result?.status === 'rate_limited') {
                console.log('⚠️ 限流，等待60秒...');
                await delay(60000);
                i--;
                continue;
            }
            
            let phonetic = v.phonetic, example = v.example, exampleTrans = v.example_translation;
            let source = '';
            
            // 更新音标
            if ((!phonetic || phonetic.includes('&')) && result?.phonetic) {
                phonetic = result.phonetic;
                source += '音标';
            }
            
            // 更新例句
            const needExample = !example || example.includes('This is useful') || example.includes('I study this');
            if (needExample) {
                if (result?.example) {
                    example = result.example;
                    exampleTrans = generateExampleTranslation(example, v.word, v.translation);
                    source += (source ? '+' : '') + '例句(API)';
                    apiHit++;
                } else {
                    const gen = generateExample(v.word, v.translation, 'n');
                    example = gen.example;
                    exampleTrans = gen.exampleTrans;
                    source += (source ? '+' : '') + '例句(生成)';
                    generated++;
                }
            }
            
            // 更新数据库
            if (source) {
                await conn.execute(
                    `UPDATE vocabulary SET phonetic=?, example=?, example_translation=?, update_time=NOW() WHERE id=?`,
                    [phonetic, example, exampleTrans, v.id]
                );
                console.log(`✓ ${source}`);
                success++;
            } else {
                console.log('- 无需更新');
            }
            
            await delay(REQUEST_INTERVAL);
        }
        
        console.log('\n' + '='.repeat(50));
        console.log(`📊 完成: 成功${success}, API例句${apiHit}, 生成例句${generated}`);
        
        // 统计剩余
        const [stats] = await conn.execute(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN phonetic IS NULL OR phonetic='' THEN 1 ELSE 0 END) as noPhonetic,
                   SUM(CASE WHEN example IS NULL OR example='' THEN 1 ELSE 0 END) as noExample
            FROM vocabulary WHERE deleted=0
        `);
        console.log(`📊 剩余: 无音标${stats[0].noPhonetic}, 无例句${stats[0].noExample}`);
        
    } catch (e) {
        console.error('❌ 错误:', e.message);
    } finally {
        if (conn) await conn.end();
    }
}

main().catch(console.error);
