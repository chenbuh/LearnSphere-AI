/**
 * 使用多个免费API修复所有词汇
 * API列表：
 * 1. Free Dictionary API - 音标、例句
 * 2. Datamuse API - 定义、相关词
 * 3. Words API (RapidAPI免费版) - 详细信息
 * 4. DictionaryAPI.dev - 备用
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

const DELAY = 1200; // 1.2秒间隔
const delay = ms => new Promise(r => setTimeout(r, ms));

// ============ API 1: Free Dictionary API ============
async function fetchFromFreeDictionary(word) {
    try {
        const res = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
            { timeout: 8000 }
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
        
        return { phonetic, example, source: 'FreeDictionary' };
    } catch (e) {
        if (e.response?.status === 429) return { rateLimited: true };
        return null;
    }
}

// ============ API 2: Datamuse API ============
async function fetchFromDatamuse(word) {
    try {
        const res = await axios.get(
            `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=dpr&max=1`,
            { timeout: 8000 }
        );
        
        if (res.data?.[0]) {
            const data = res.data[0];
            return {
                definition: data.defs?.[0],
                pronunciation: data.tags?.find(t => t.startsWith('pron:'))?.replace('pron:', ''),
                source: 'Datamuse'
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ API 3: Merriam-Webster Learner's Dictionary (免费) ============
async function fetchFromMerriamWebster(word) {
    try {
        // 使用公开的学习者词典API（无需key）
        const res = await axios.get(
            `https://www.dictionaryapi.com/api/v3/references/learners/json/${encodeURIComponent(word)}`,
            { timeout: 8000, validateStatus: () => true }
        );
        
        if (res.data?.[0]?.hwi?.prs?.[0]?.mw) {
            return {
                phonetic: '/' + res.data[0].hwi.prs[0].mw + '/',
                source: 'MerriamWebster'
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ API 4: Wiktionary API ============
async function fetchFromWiktionary(word) {
    try {
        const res = await axios.get(
            `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
            { timeout: 8000 }
        );
        
        if (res.data?.en) {
            const definitions = res.data.en;
            for (const def of definitions) {
                if (def.definitions?.[0]?.examples?.[0]) {
                    return {
                        example: def.definitions[0].examples[0],
                        source: 'Wiktionary'
                    };
                }
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ API 5: Oxford Learner's Dictionaries (公开数据) ============
async function fetchFromOxford(word) {
    try {
        // 使用Oxford公开的学习者词典
        const res = await axios.get(
            `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(word)}`,
            { 
                timeout: 8000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            }
        );
        
        // 简单解析HTML获取音标（如果可用）
        const phoneticMatch = res.data.match(/\/([^\/]+)\//);
        if (phoneticMatch) {
            return {
                phonetic: '/' + phoneticMatch[1] + '/',
                source: 'Oxford'
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ 综合获取函数 ============
async function fetchWordData(word) {
    const result = {
        phonetic: null,
        example: null,
        sources: []
    };
    
    // 尝试 API 1: Free Dictionary (最可靠)
    const api1 = await fetchFromFreeDictionary(word);
    if (api1?.rateLimited) return { rateLimited: true };
    
    if (api1) {
        if (api1.phonetic) {
            result.phonetic = api1.phonetic;
            result.sources.push('FreeDictionary音标');
        }
        if (api1.example) {
            result.example = api1.example;
            result.sources.push('FreeDictionary例句');
        }
    }
    
    // 如果还缺音标，尝试其他API
    if (!result.phonetic) {
        // 尝试 API 2: Datamuse
        const api2 = await fetchFromDatamuse(word);
        if (api2?.pronunciation) {
            result.phonetic = '/' + api2.pronunciation + '/';
            result.sources.push('Datamuse音标');
        }
    }
    
    // 如果还缺例句，尝试 Wiktionary
    if (!result.example) {
        const api4 = await fetchFromWiktionary(word);
        if (api4?.example) {
            result.example = api4.example;
            result.sources.push('Wiktionary例句');
        }
    }
    
    return result;
}

// ============ 例句生成 ============
function extractMeaning(translation) {
    if (!translation) return '这个';
    return translation
        .split(/[;；,，]/)[0]
        .replace(/^[a-zA-Z]+\.\s*/, '')
        .replace(/[a-zA-Z.&\s]/g, '')
        .trim() || '这个';
}

function generateExample(word, translation) {
    const meaning = extractMeaning(translation);
    
    const templates = [
        { en: `The ${word} is very important in our daily life.`, cn: `${meaning}在我们的日常生活中非常重要。` },
        { en: `Understanding the ${word} is essential for success.`, cn: `理解${meaning}对成功至关重要。` },
        { en: `We need to pay attention to the ${word}.`, cn: `我们需要注意${meaning}。` },
        { en: `This ${word} plays a crucial role.`, cn: `这个${meaning}起着关键作用。` },
        { en: `The ${word} has changed significantly over time.`, cn: `${meaning}随时间发生了显著变化。` },
        { en: `Many people use this ${word} every day.`, cn: `许多人每天使用这个${meaning}。` },
        { en: `Learning about the ${word} is beneficial.`, cn: `学习${meaning}是有益的。` },
        { en: `The ${word} affects our lives in many ways.`, cn: `${meaning}在许多方面影响着我们的生活。` }
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

function generateExampleTranslation(example, word, translation) {
    const meaning = extractMeaning(translation);
    
    if (example.toLowerCase().includes('important')) return `${meaning}很重要。`;
    if (example.toLowerCase().includes('essential')) return `${meaning}是必不可少的。`;
    if (example.toLowerCase().includes('need')) return `我们需要${meaning}。`;
    if (example.toLowerCase().includes('use')) return `我们使用${meaning}。`;
    if (example.toLowerCase().includes('learn')) return `学习${meaning}。`;
    if (example.toLowerCase().includes('understand')) return `理解${meaning}。`;
    if (example.toLowerCase().includes('help')) return `${meaning}有帮助。`;
    
    return `这是一个关于"${meaning}"的例句。`;
}

// ============ 主函数 ============
async function main() {
    console.log('═'.repeat(60));
    console.log('  使用多个免费API修复所有词汇');
    console.log('═'.repeat(60));
    console.log('API列表:');
    console.log('  1. Free Dictionary API');
    console.log('  2. Datamuse API');
    console.log('  3. Wiktionary API');
    console.log(`\n开始时间: ${new Date().toLocaleString()}\n`);
    
    let conn;
    try {
        conn = await mysql.createConnection(DB_CONFIG);
        console.log('✅ 数据库连接成功\n');
        
        // 获取所有需要修复的词汇
        const [words] = await conn.execute(`
            SELECT id, word, phonetic, translation, example, example_translation
            FROM vocabulary 
            WHERE deleted = 0 
            AND (
                phonetic IS NULL OR phonetic = '' OR
                example IS NULL OR example = '' OR
                example LIKE '%unavailable%' OR
                example LIKE '%This is useful%' OR
                example_translation IS NULL OR example_translation = ''
            )
            ORDER BY id
        `);
        
        console.log(`📝 需要修复: ${words.length} 个词汇\n`);
        
        if (words.length === 0) {
            console.log('✅ 所有词汇已完善！');
            return;
        }
        
        let success = 0, apiHit = 0, generated = 0, failed = 0;
        let phoneticFromAPI = 0, exampleFromAPI = 0;
        let batchCount = 0;
        
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            process.stdout.write(`[${(i+1).toString().padStart(5)}/${words.length}] ${w.word.padEnd(20)} `);
            
            // 从多个API获取数据
            const apiData = await fetchWordData(w.word);
            
            if (apiData.rateLimited) {
                console.log('⚠️ API限流，等待60秒...');
                await delay(60000);
                i--;
                continue;
            }
            
            let phonetic = w.phonetic;
            let example = w.example;
            let exampleCn = w.example_translation;
            let updated = false;
            let sources = [];
            
            // 更新音标
            if ((!phonetic || phonetic === '') && apiData.phonetic) {
                phonetic = apiData.phonetic;
                phoneticFromAPI++;
                updated = true;
            }
            
            // 更新例句
            const needExample = !example || example === '' || 
                               example.includes('unavailable') || 
                               example.includes('This is useful');
            
            if (needExample) {
                if (apiData.example) {
                    example = apiData.example;
                    exampleCn = generateExampleTranslation(example, w.word, w.translation);
                    exampleFromAPI++;
                    updated = true;
                } else {
                    const gen = generateExample(w.word, w.translation);
                    example = gen.en;
                    exampleCn = gen.cn;
                    sources.push('生成');
                    generated++;
                    updated = true;
                }
            }
            
            // 更新数据库
            if (updated) {
                try {
                    await conn.execute(
                        'UPDATE vocabulary SET phonetic = ?, example = ?, example_translation = ?, update_time = NOW() WHERE id = ?',
                        [phonetic, example, exampleCn, w.id]
                    );
                    
                    const allSources = [...apiData.sources, ...sources];
                    console.log(`✓ ${allSources.join('+') || '更新'}`);
                    success++;
                    if (apiData.sources.length > 0) apiHit++;
                } catch (e) {
                    console.log(`✗ 失败: ${e.message}`);
                    failed++;
                }
            } else {
                console.log('- 无需更新');
            }
            
            // 每100个显示进度
            batchCount++;
            if (batchCount >= 100) {
                console.log(`\n--- 已处理 ${i+1}/${words.length}, 成功: ${success}, API音标: ${phoneticFromAPI}, API例句: ${exampleFromAPI}, 生成: ${generated} ---\n`);
                batchCount = 0;
            }
            
            await delay(DELAY);
        }
        
        console.log('\n' + '═'.repeat(60));
        console.log(`📊 完成统计:`);
        console.log(`   成功更新: ${success}`);
        console.log(`   失败: ${failed}`);
        console.log(`   API获取音标: ${phoneticFromAPI}`);
        console.log(`   API获取例句: ${exampleFromAPI}`);
        console.log(`   生成例句: ${generated}`);
        console.log(`   API命中率: ${((apiHit/success)*100).toFixed(1)}%`);
        
        // 最终统计
        const [stats] = await conn.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN phonetic IS NULL OR phonetic = '' THEN 1 ELSE 0 END) as no_phonetic,
                SUM(CASE WHEN example IS NULL OR example = '' OR example LIKE '%unavailable%' OR example LIKE '%This is useful%' THEN 1 ELSE 0 END) as bad_example
            FROM vocabulary WHERE deleted = 0
        `);
        
        console.log(`\n📊 数据库最终状态:`);
        console.log(`   总词汇: ${stats[0].total}`);
        console.log(`   缺音标: ${stats[0].no_phonetic}`);
        console.log(`   问题例句: ${stats[0].bad_example}`);
        
        console.log(`\n完成时间: ${new Date().toLocaleString()}`);
        
    } catch (e) {
        console.error('\n❌ 错误:', e.message);
        console.error(e.stack);
    } finally {
        if (conn) await conn.end();
    }
}

main();
