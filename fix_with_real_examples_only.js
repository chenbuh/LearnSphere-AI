/**
 * 只使用真实API例句修复词汇
 * 不生成例句，只使用来自API的真实例句
 * 如果API没有例句则跳过，保持原样
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

const DELAY = 1000; // 1秒间隔
const delay = ms => new Promise(r => setTimeout(r, ms));

// ============ API 1: Free Dictionary API ============
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
        
        let examples = [];
        if (entry.meanings) {
            for (const m of entry.meanings) {
                for (const d of m.definitions || []) {
                    if (d.example) examples.push(d.example);
                }
            }
        }
        
        return { 
            phonetic, 
            examples,
            source: 'FreeDictionary' 
        };
    } catch (e) {
        if (e.response?.status === 429) return { rateLimited: true };
        return null;
    }
}

// ============ API 2: Wordnik API (免费，但需要注册) ============
async function fetchFromWordnik(word) {
    try {
        // 使用demo key（有限制但可用）
        const res = await axios.get(
            `https://api.wordnik.com/v4/word.json/${encodeURIComponent(word.toLowerCase())}/examples?limit=5&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5`,
            { timeout: 10000 }
        );
        
        if (res.data?.examples) {
            return {
                examples: res.data.examples.map(e => e.text),
                source: 'Wordnik'
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ API 3: Sentences API ============
async function fetchFromSentencesAPI(word) {
    try {
        const res = await axios.get(
            `https://api.sentences.com/v1/sentences/${encodeURIComponent(word.toLowerCase())}`,
            { timeout: 8000, validateStatus: () => true }
        );
        
        if (res.data?.sentences) {
            return {
                examples: res.data.sentences.slice(0, 3),
                source: 'SentencesAPI'
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ API 4: Tatoeba (开源例句库) ============
async function fetchFromTatoeba(word) {
    try {
        const res = await axios.get(
            `https://tatoeba.org/en/api_v0/search?from=eng&query=${encodeURIComponent(word)}&trans_to=cmn`,
            { timeout: 10000 }
        );
        
        if (res.data?.results) {
            const examples = res.data.results
                .filter(r => r.text.toLowerCase().includes(word.toLowerCase()))
                .slice(0, 3)
                .map(r => r.text);
            
            if (examples.length > 0) {
                return {
                    examples,
                    source: 'Tatoeba'
                };
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ API 5: Datamuse (获取相关句子) ============
async function fetchFromDatamuse(word) {
    try {
        const res = await axios.get(
            `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&md=d&max=1`,
            { timeout: 8000 }
        );
        
        if (res.data?.[0]?.defs) {
            // Datamuse的定义有时包含例句
            const defsWithExamples = res.data[0].defs
                .filter(d => d.includes('"'))
                .map(d => {
                    const match = d.match(/"([^"]+)"/);
                    return match ? match[1] : null;
                })
                .filter(e => e);
            
            if (defsWithExamples.length > 0) {
                return {
                    examples: defsWithExamples,
                    source: 'Datamuse'
                };
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ 综合获取真实例句 ============
async function fetchRealExamples(word) {
    const result = {
        phonetic: null,
        example: null,
        sources: []
    };
    
    // API 1: Free Dictionary (最可靠)
    const api1 = await fetchFromFreeDictionary(word);
    if (api1?.rateLimited) return { rateLimited: true };
    
    if (api1) {
        if (api1.phonetic) {
            result.phonetic = api1.phonetic;
        }
        if (api1.examples?.length > 0) {
            result.example = api1.examples[0];
            result.sources.push('FreeDictionary');
            return result; // 找到例句就返回
        }
    }
    
    // API 2: Wordnik
    const api2 = await fetchFromWordnik(word);
    if (api2?.examples?.length > 0) {
        result.example = api2.examples[0];
        result.sources.push('Wordnik');
        return result;
    }
    
    await delay(300); // 短暂延迟
    
    // API 3: Tatoeba
    const api3 = await fetchFromTatoeba(word);
    if (api3?.examples?.length > 0) {
        result.example = api3.examples[0];
        result.sources.push('Tatoeba');
        return result;
    }
    
    // API 4: Datamuse
    const api4 = await fetchFromDatamuse(word);
    if (api4?.examples?.length > 0) {
        result.example = api4.examples[0];
        result.sources.push('Datamuse');
        return result;
    }
    
    return result;
}

// ============ 生成中文翻译 ============
function generateChineseTranslation(example, word, translation) {
    const meaning = extractMeaning(translation);
    
    // 简单的关键词匹配翻译
    const keywords = {
        'important': '重要',
        'essential': '必不可少',
        'need': '需要',
        'want': '想要',
        'use': '使用',
        'make': '制作',
        'help': '帮助',
        'learn': '学习',
        'understand': '理解',
        'know': '知道',
        'think': '认为',
        'believe': '相信',
        'work': '工作',
        'study': '学习',
        'read': '阅读',
        'write': '写',
        'speak': '说',
        'listen': '听'
    };
    
    let translation_cn = example;
    for (const [en, cn] of Object.entries(keywords)) {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translation_cn = translation_cn.replace(regex, cn);
    }
    
    // 如果翻译变化不大，使用简单模板
    if (translation_cn === example) {
        return `这是一个关于"${meaning}"的真实例句。`;
    }
    
    return translation_cn;
}

function extractMeaning(translation) {
    if (!translation) return '这个';
    return translation
        .split(/[;；,，]/)[0]
        .replace(/^[a-zA-Z]+\.\s*/, '')
        .replace(/[a-zA-Z.&\s]/g, '')
        .trim() || '这个';
}

// ============ 主函数 ============
async function main() {
    console.log('═'.repeat(60));
    console.log('  只使用真实API例句修复词汇');
    console.log('═'.repeat(60));
    console.log('API列表:');
    console.log('  1. Free Dictionary API');
    console.log('  2. Wordnik API');
    console.log('  3. Tatoeba (开源例句库)');
    console.log('  4. Datamuse API');
    console.log('\n策略: 只使用真实例句，不生成\n');
    console.log(`开始时间: ${new Date().toLocaleString()}\n`);
    
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
                example LIKE '%This is useful%'
            )
            ORDER BY id
        `);
        
        console.log(`📝 需要修复: ${words.length} 个词汇\n`);
        
        if (words.length === 0) {
            console.log('✅ 所有词汇已完善！');
            return;
        }
        
        let success = 0, skipped = 0, failed = 0;
        let phoneticCount = 0, exampleCount = 0;
        let apiStats = {};
        let batchCount = 0;
        
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            process.stdout.write(`[${(i+1).toString().padStart(5)}/${words.length}] ${w.word.padEnd(20)} `);
            
            // 从多个API获取真实例句
            const apiData = await fetchRealExamples(w.word);
            
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
            
            // 更新音标
            if ((!phonetic || phonetic === '') && apiData.phonetic) {
                phonetic = apiData.phonetic;
                phoneticCount++;
                updated = true;
            }
            
            // 更新例句（只使用真实API例句）
            const needExample = !example || example === '' || 
                               example.includes('unavailable') || 
                               example.includes('This is useful');
            
            if (needExample && apiData.example) {
                example = apiData.example;
                exampleCn = generateChineseTranslation(example, w.word, w.translation);
                exampleCount++;
                updated = true;
                
                // 统计API来源
                const source = apiData.sources[0] || 'Unknown';
                apiStats[source] = (apiStats[source] || 0) + 1;
            }
            
            // 更新数据库
            if (updated) {
                try {
                    await conn.execute(
                        'UPDATE vocabulary SET phonetic = ?, example = ?, example_translation = ?, update_time = NOW() WHERE id = ?',
                        [phonetic, example, exampleCn, w.id]
                    );
                    
                    const sources = apiData.sources.length > 0 ? apiData.sources.join('+') : '音标';
                    console.log(`✓ ${sources}`);
                    success++;
                } catch (e) {
                    console.log(`✗ 失败: ${e.message}`);
                    failed++;
                }
            } else {
                console.log('- 跳过(无API数据)');
                skipped++;
            }
            
            // 每100个显示进度
            batchCount++;
            if (batchCount >= 100) {
                console.log(`\n--- 已处理 ${i+1}/${words.length}, 成功: ${success}, 跳过: ${skipped} ---`);
                console.log(`API统计: ${JSON.stringify(apiStats)}\n`);
                batchCount = 0;
            }
            
            await delay(DELAY);
        }
        
        console.log('\n' + '═'.repeat(60));
        console.log(`📊 完成统计:`);
        console.log(`   成功更新: ${success}`);
        console.log(`   跳过(无API数据): ${skipped}`);
        console.log(`   失败: ${failed}`);
        console.log(`   获取音标: ${phoneticCount}`);
        console.log(`   获取例句: ${exampleCount}`);
        
        console.log(`\n📊 API来源统计:`);
        for (const [api, count] of Object.entries(apiStats)) {
            console.log(`   ${api}: ${count} 个例句`);
        }
        
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
