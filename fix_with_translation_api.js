/**
 * 使用真实API获取例句和翻译
 * 例句来自词典API，翻译来自翻译API
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

// ============ 词典API - 获取例句 ============

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
        
        return { phonetic, examples, source: 'FreeDictionary' };
    } catch (e) {
        if (e.response?.status === 429) return { rateLimited: true };
        return null;
    }
}

async function fetchFromWordnik(word) {
    try {
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
                .map(r => ({
                    en: r.text,
                    cn: r.translations?.[0]?.[0]?.text || null
                }));
            
            if (examples.length > 0) {
                return {
                    examples: examples.map(e => e.en),
                    translations: examples.map(e => e.cn),
                    source: 'Tatoeba'
                };
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============ 翻译API ============

// API 1: MyMemory Translation API (免费，每天1000次)
async function translateWithMyMemory(text) {
    try {
        const res = await axios.get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`,
            { timeout: 8000 }
        );
        
        if (res.data?.responseData?.translatedText) {
            return res.data.responseData.translatedText;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// API 2: LibreTranslate (开源免费)
async function translateWithLibre(text) {
    try {
        const res = await axios.post(
            'https://libretranslate.de/translate',
            {
                q: text,
                source: 'en',
                target: 'zh',
                format: 'text'
            },
            { timeout: 10000 }
        );
        
        if (res.data?.translatedText) {
            return res.data.translatedText;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// API 3: Google Translate (非官方，免费)
async function translateWithGoogle(text) {
    try {
        const res = await axios.get(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`,
            { timeout: 8000 }
        );
        
        if (res.data?.[0]?.[0]?.[0]) {
            return res.data[0][0][0];
        }
        return null;
    } catch (e) {
        return null;
    }
}

// API 4: Bing Translator (非官方)
async function translateWithBing(text) {
    try {
        const res = await axios.get(
            `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=zh-Hans&text=${encodeURIComponent(text)}`,
            { 
                timeout: 8000,
                validateStatus: () => true
            }
        );
        
        if (res.data?.[0]?.translations?.[0]?.text) {
            return res.data[0].translations[0].text;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// 综合翻译函数
async function translateText(text) {
    // 尝试多个翻译API
    let translation = await translateWithGoogle(text);
    if (translation) return { translation, source: 'Google' };
    
    await delay(200);
    
    translation = await translateWithMyMemory(text);
    if (translation) return { translation, source: 'MyMemory' };
    
    await delay(200);
    
    translation = await translateWithLibre(text);
    if (translation) return { translation, source: 'LibreTranslate' };
    
    return null;
}

// ============ 综合获取函数 ============

async function fetchWordData(word) {
    const result = {
        phonetic: null,
        example: null,
        exampleCn: null,
        sources: []
    };
    
    // 1. 获取例句
    const api1 = await fetchFromFreeDictionary(word);
    if (api1?.rateLimited) return { rateLimited: true };
    
    if (api1) {
        if (api1.phonetic) result.phonetic = api1.phonetic;
        if (api1.examples?.length > 0) {
            result.example = api1.examples[0];
            result.sources.push('FreeDictionary');
        }
    }
    
    if (!result.example) {
        const api2 = await fetchFromWordnik(word);
        if (api2?.examples?.length > 0) {
            result.example = api2.examples[0];
            result.sources.push('Wordnik');
        }
    }
    
    if (!result.example) {
        const api3 = await fetchFromTatoeba(word);
        if (api3?.examples?.length > 0) {
            result.example = api3.examples[0];
            if (api3.translations?.[0]) {
                result.exampleCn = api3.translations[0];
                result.sources.push('Tatoeba(含翻译)');
                return result; // Tatoeba已经有翻译了
            }
            result.sources.push('Tatoeba');
        }
    }
    
    // 2. 翻译例句
    if (result.example && !result.exampleCn) {
        const trans = await translateText(result.example);
        if (trans) {
            result.exampleCn = trans.translation;
            result.sources.push(trans.source + '翻译');
        }
    }
    
    return result;
}

// ============ 主函数 ============

async function main() {
    console.log('═'.repeat(60));
    console.log('  使用真实API获取例句和翻译');
    console.log('═'.repeat(60));
    console.log('词典API: FreeDictionary, Wordnik, Tatoeba');
    console.log('翻译API: Google, MyMemory, LibreTranslate');
    console.log(`\n开始时间: ${new Date().toLocaleString()}\n`);
    
    let conn;
    try {
        conn = await mysql.createConnection(DB_CONFIG);
        console.log('✅ 数据库连接成功\n');
        
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
        let phoneticCount = 0, exampleCount = 0, translationCount = 0;
        let apiStats = {};
        let batchCount = 0;
        
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            process.stdout.write(`[${(i+1).toString().padStart(5)}/${words.length}] ${w.word.padEnd(20)} `);
            
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
            
            // 更新音标
            if ((!phonetic || phonetic === '') && apiData.phonetic) {
                phonetic = apiData.phonetic;
                phoneticCount++;
                updated = true;
            }
            
            // 更新例句和翻译
            const needExample = !example || example === '' || 
                               example.includes('unavailable') || 
                               example.includes('This is useful');
            
            if (needExample && apiData.example) {
                example = apiData.example;
                exampleCn = apiData.exampleCn || '翻译获取失败';
                exampleCount++;
                if (apiData.exampleCn) translationCount++;
                updated = true;
                
                // 统计API来源
                apiData.sources.forEach(s => {
                    apiStats[s] = (apiStats[s] || 0) + 1;
                });
            }
            
            // 更新数据库
            if (updated) {
                try {
                    await conn.execute(
                        'UPDATE vocabulary SET phonetic = ?, example = ?, example_translation = ?, update_time = NOW() WHERE id = ?',
                        [phonetic, example, exampleCn, w.id]
                    );
                    
                    const sources = apiData.sources.join('+') || '音标';
                    console.log(`✓ ${sources}`);
                    success++;
                } catch (e) {
                    console.log(`✗ 失败: ${e.message}`);
                    failed++;
                }
            } else {
                console.log('- 跳过');
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
        console.log(`   跳过: ${skipped}`);
        console.log(`   失败: ${failed}`);
        console.log(`   获取音标: ${phoneticCount}`);
        console.log(`   获取例句: ${exampleCount}`);
        console.log(`   获取翻译: ${translationCount}`);
        
        console.log(`\n📊 API来源统计:`);
        for (const [api, count] of Object.entries(apiStats)) {
            console.log(`   ${api}: ${count}`);
        }
        
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
