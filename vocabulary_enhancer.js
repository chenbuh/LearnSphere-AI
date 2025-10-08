/**
 * 词汇完善脚本 - 使用免费API完善单词数据
 * 功能：
 * 1. 修复错误/缺失的音标
 * 2. 添加/修复例句
 * 3. 添加例句翻译
 * 4. 保存到数据库和JS文件
 */

const axios = require('axios');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 数据库配置
const DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'chen20040209',
    database: 'learnsphere_ai'
};

// 词汇文件路径映射
const VOCAB_FILES = {
    cet4: 'frontend-vue/src/data/cet4_words.js',
    cet6: 'frontend-vue/src/data/cet6_words.js',
    toefl: 'frontend-vue/src/data/toefl_words.js',
    ielts: 'frontend-vue/src/data/ielts_words.js',
    gre: 'frontend-vue/src/data/gre_words.js',
    tem4: 'frontend-vue/src/data/tem4_words.js',
    tem8: 'frontend-vue/src/data/tem8_words.js',
    postgraduate: 'frontend-vue/src/data/postgraduate_words.js',
    primary: 'frontend-vue/src/data/primary_school_words.js',
    middle_school: 'frontend-vue/src/data/middle_school_words.js',
    high_school: 'frontend-vue/src/data/high_school_words.js',
    coca: 'frontend-vue/src/data/coca_words.js'
};

// 请求间隔（毫秒）- 避免API限流
const REQUEST_INTERVAL = 2000;
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ============ API 调用函数 ============

/**
 * Free Dictionary API - 主要API
 * 免费，无需API Key，提供音标和例句
 */
async function fetchFromFreeDictionary(word) {
    try {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`;
        const res = await axios.get(url, { timeout: 10000 });
        
        const entry = res.data?.[0];
        if (!entry) return null;
        
        // 提取音标
        let phonetic = entry.phonetic;
        if (!phonetic && entry.phonetics) {
            for (const p of entry.phonetics) {
                if (p.text) {
                    phonetic = p.text;
                    break;
                }
            }
        }
        
        // 提取例句
        let example = null;
        let definition = null;
        if (entry.meanings) {
            for (const m of entry.meanings) {
                for (const d of m.definitions || []) {
                    if (!definition) definition = d.definition;
                    if (d.example) {
                        example = d.example;
                        break;
                    }
                }
                if (example) break;
            }
        }
        
        return {
            phonetic: phonetic || null,
            example: example || null,
            definition: definition || null,
            status: 'ok'
        };
    } catch (e) {
        if (e.response?.status === 429) return { status: 'rate_limited' };
        if (e.response?.status === 404) return { status: 'not_found' };
        return { status: 'error', message: e.message };
    }
}

/**
 * Datamuse API - 备用API（获取相关词和定义）
 */
async function fetchFromDatamuse(word) {
    try {
        const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d&max=1`;
        const res = await axios.get(url, { timeout: 8000 });
        
        if (res.data?.[0]?.defs) {
            return {
                definition: res.data[0].defs[0],
                status: 'ok'
            };
        }
        return { status: 'not_found' };
    } catch (e) {
        return { status: 'error' };
    }
}

// ============ 例句生成函数 ============

/**
 * 根据词性生成例句
 */
function generateExample(word, translation, category) {
    const meaning = extractMeaning(translation);
    const cat = (category || 'n').toLowerCase().replace(/[^a-z]/g, '');
    
    const templates = {
        n: [
            { en: `The ${word} is very important in our daily life.`, cn: `${meaning}在我们的日常生活中非常重要。` },
            { en: `I need to learn more about ${word}.`, cn: `我需要更多地了解${meaning}。` },
            { en: `This ${word} has changed significantly over time.`, cn: `这个${meaning}随着时间发生了显著变化。` },
            { en: `The ${word} plays a crucial role in this process.`, cn: `${meaning}在这个过程中起着关键作用。` }
        ],
        v: [
            { en: `You should ${word} carefully before making a decision.`, cn: `在做决定之前，你应该仔细${meaning}。` },
            { en: `They decided to ${word} immediately.`, cn: `他们决定立即${meaning}。` },
            { en: `It is important to ${word} regularly.`, cn: `定期${meaning}很重要。` },
            { en: `She learned how to ${word} effectively.`, cn: `她学会了如何有效地${meaning}。` }
        ],
        adj: [
            { en: `The result was quite ${word}.`, cn: `结果相当${meaning}。` },
            { en: `She gave a ${word} answer to the question.`, cn: `她对这个问题给出了${meaning}的回答。` },
            { en: `His performance was remarkably ${word}.`, cn: `他的表现非常${meaning}。` },
            { en: `The situation became increasingly ${word}.`, cn: `情况变得越来越${meaning}。` }
        ],
        adv: [
            { en: `She completed the task ${word}.`, cn: `她${meaning}地完成了任务。` },
            { en: `The team worked ${word} to meet the deadline.`, cn: `团队${meaning}地工作以赶上截止日期。` },
            { en: `He spoke ${word} about the issue.`, cn: `他${meaning}地谈论了这个问题。` },
            { en: `The project progressed ${word}.`, cn: `项目${meaning}地进展着。` }
        ],
        prep: [
            { en: `The book is ${word} the table.`, cn: `书在桌子${meaning}。` },
            { en: `We walked ${word} the park.`, cn: `我们${meaning}公园走。` }
        ],
        conj: [
            { en: `I will go ${word} you come with me.`, cn: `${meaning}你和我一起去，我就去。` },
            { en: `She studied hard ${word} she passed the exam.`, cn: `她努力学习，${meaning}通过了考试。` }
        ],
        pron: [
            { en: `${word.charAt(0).toUpperCase() + word.slice(1)} is the one I was looking for.`, cn: `${meaning}就是我要找的那个。` }
        ]
    };
    
    const list = templates[cat] || templates.n;
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * 从翻译中提取核心含义
 */
function extractMeaning(translation) {
    if (!translation) return '这个';
    // 移除词性标记和特殊字符
    let meaning = translation
        .split(/[;；,，]/)[0]
        .replace(/^[a-zA-Z]+\.\s*/, '')  // 移除 "n. " "v. " 等
        .replace(/[a-zA-Z.&\s]/g, '')
        .trim();
    return meaning || '这个';
}

// ============ 音标验证函数 ============

/**
 * 检查音标是否有效
 */
function isValidPhonetic(phonetic) {
    if (!phonetic) return false;
    if (phonetic.includes('&')) return false;  // 包含&符号的无效
    if (phonetic.length < 3) return false;     // 太短的无效
    if (!/[əɪʊæɑɔʌɛ]/.test(phonetic) && !/[aeiou]/.test(phonetic)) return false;  // 没有元音的无效
    return true;
}

/**
 * 检查例句是否有效
 */
function isValidExample(example) {
    if (!example) return false;
    if (example.length < 10) return false;
    if (example.includes('This is useful')) return false;
    if (example.includes('I study this')) return false;
    if (example.includes('This word means')) return false;
    return true;
}

// ============ 数据库操作 ============

/**
 * 从数据库获取需要完善的词汇
 */
async function getWordsToEnhance(conn, examType = null, limit = 100) {
    let sql = `
        SELECT id, word, phonetic, translation, example, example_translation, exam_type, difficulty
        FROM vocabulary 
        WHERE deleted = 0
        AND (
            phonetic IS NULL OR phonetic = ''
            OR example IS NULL OR example = ''
            OR example_translation IS NULL OR example_translation = ''
        )
    `;
    
    if (examType) {
        sql += ` AND exam_type = '${examType}'`;
    }
    
    sql += ` ORDER BY id LIMIT ${limit}`;
    
    const [rows] = await conn.execute(sql);
    return rows;
}

/**
 * 更新数据库中的词汇
 */
async function updateWordInDB(conn, id, data) {
    const sql = `
        UPDATE vocabulary 
        SET phonetic = ?, example = ?, example_translation = ?, update_time = NOW()
        WHERE id = ?
    `;
    await conn.execute(sql, [data.phonetic, data.example, data.exampleCn, id]);
}

/**
 * 将词汇插入数据库（如果不存在）
 */
async function insertWordToDB(conn, wordData) {
    const sql = `
        INSERT IGNORE INTO vocabulary 
        (word, phonetic, translation, example, example_translation, exam_type, difficulty, frequency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await conn.execute(sql, [
        wordData.word,
        wordData.phonetic,
        wordData.meaning || wordData.translation,
        wordData.example,
        wordData.exampleCn,
        wordData.examType,
        wordData.difficulty || 2,
        0
    ]);
}

// ============ JS文件操作 ============

/**
 * 读取词汇JS文件
 */
async function readVocabFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        // 提取数组内容
        const match = content.match(/export\s+(?:const|default)\s+\w+\s*=\s*(\[[\s\S]*\]);?/);
        if (match) {
            // 使用eval解析（注意：仅用于可信数据）
            return eval(match[1]);
        }
        return [];
    } catch (e) {
        console.error(`读取文件失败: ${filePath}`, e.message);
        return [];
    }
}

/**
 * 保存词汇到JS文件
 */
async function saveVocabFile(filePath, words, examType) {
    const varName = examType.replace(/_/g, '') + 'Words';
    const examNames = {
        cet4: '大学英语四级',
        cet6: '大学英语六级',
        toefl: '托福',
        ielts: '雅思',
        gre: 'GRE',
        tem4: '英语专业四级',
        tem8: '英语专业八级',
        postgraduate: '考研英语',
        primary: '小学英语',
        middle_school: '中考英语',
        high_school: '高中英语',
        coca: 'COCA语料库'
    };
    
    const header = `/**
 * ${examNames[examType] || examType}词汇表
 * 自动生成，包含音标和例句
 * 总计: ${words.length} 个词汇
 * 更新时间: ${new Date().toISOString().split('T')[0]}
 */

export const ${varName} = `;
    
    const content = header + JSON.stringify(words, null, 2) + ';\n\nexport default ' + varName + ';\n';
    await fs.writeFile(filePath, content, 'utf-8');
}

// ============ 主要处理函数 ============

/**
 * 完善单个词汇
 */
async function enhanceWord(word, translation, category) {
    const result = {
        phonetic: null,
        example: null,
        exampleCn: null,
        source: []
    };
    
    // 从API获取数据
    const apiData = await fetchFromFreeDictionary(word);
    
    if (apiData?.status === 'rate_limited') {
        return { ...result, rateLimited: true };
    }
    
    // 处理音标
    if (apiData?.phonetic && isValidPhonetic(apiData.phonetic)) {
        result.phonetic = apiData.phonetic;
        result.source.push('API音标');
    }
    
    // 处理例句
    if (apiData?.example && isValidExample(apiData.example)) {
        result.example = apiData.example;
        result.exampleCn = generateExampleTranslation(apiData.example, word, translation);
        result.source.push('API例句');
    } else {
        // 生成例句
        const generated = generateExample(word, translation, category);
        result.example = generated.en;
        result.exampleCn = generated.cn;
        result.source.push('生成例句');
    }
    
    return result;
}

/**
 * 生成例句翻译
 */
function generateExampleTranslation(example, word, translation) {
    const meaning = extractMeaning(translation);
    // 简单的翻译模板
    if (example.toLowerCase().includes('important')) return `${meaning}很重要。`;
    if (example.toLowerCase().includes('need')) return `我们需要${meaning}。`;
    if (example.toLowerCase().includes('want')) return `我想要${meaning}。`;
    if (example.toLowerCase().includes('like')) return `我喜欢${meaning}。`;
    if (example.toLowerCase().includes('use')) return `我们使用${meaning}。`;
    if (example.toLowerCase().includes('learn')) return `我们学习${meaning}。`;
    if (example.toLowerCase().includes('work')) return `这与${meaning}有关。`;
    return `这是一个关于"${meaning}"的例句。`;
}

// ============ 主函数 ============

async function main() {
    console.log('═'.repeat(60));
    console.log('  词汇完善脚本 - 使用免费API');
    console.log('═'.repeat(60));
    console.log(`⏱️  请求间隔: ${REQUEST_INTERVAL/1000}秒`);
    console.log(`📅 开始时间: ${new Date().toLocaleString()}\n`);
    
    let conn;
    
    try {
        // 连接数据库
        conn = await mysql.createConnection(DB_CONFIG);
        console.log('✅ 数据库连接成功\n');
        
        // 获取命令行参数
        const args = process.argv.slice(2);
        const examType = args.find(a => !a.startsWith('-')) || null;
        const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1]) || 200;
        const updateFiles = args.includes('--update-files');
        
        console.log(`📋 参数: 考试类型=${examType || '全部'}, 限制=${limit}, 更新文件=${updateFiles}\n`);
        
        // 获取需要完善的词汇
        const words = await getWordsToEnhance(conn, examType, limit);
        console.log(`📝 需处理: ${words.length} 个词汇\n`);
        
        if (words.length === 0) {
            console.log('✅ 所有词汇已完善！');
            return;
        }
        
        // 统计
        let success = 0, apiHit = 0, generated = 0, failed = 0;
        const updatedWords = new Map(); // 按考试类型分组
        
        // 处理每个词汇
        for (let i = 0; i < words.length; i++) {
            const v = words[i];
            process.stdout.write(`[${(i+1).toString().padStart(3)}/${words.length}] ${v.word.padEnd(20)}`);
            
            // 完善词汇
            const result = await enhanceWord(v.word, v.translation, 'n');
            
            // 处理限流
            if (result.rateLimited) {
                console.log('⚠️ API限流，等待60秒...');
                await delay(60000);
                i--;
                continue;
            }
            
            // 合并数据
            const phonetic = result.phonetic || v.phonetic;
            const example = result.example || v.example;
            const exampleCn = result.exampleCn || v.example_translation;
            
            // 更新数据库
            if (result.source.length > 0) {
                await updateWordInDB(conn, v.id, { phonetic, example, exampleCn });
                
                // 记录更新的词汇（用于更新JS文件）
                if (!updatedWords.has(v.exam_type)) {
                    updatedWords.set(v.exam_type, []);
                }
                updatedWords.get(v.exam_type).push({
                    ...v,
                    phonetic,
                    example,
                    exampleCn
                });
                
                console.log(`✓ ${result.source.join('+')}`);
                success++;
                
                if (result.source.includes('API例句')) apiHit++;
                if (result.source.includes('生成例句')) generated++;
            } else {
                console.log('- 无需更新');
            }
            
            // 等待避免限流
            await delay(REQUEST_INTERVAL);
        }
        
        // 输出统计
        console.log('\n' + '═'.repeat(60));
        console.log('📊 处理统计:');
        console.log(`   成功更新: ${success} 个`);
        console.log(`   API例句: ${apiHit} 个`);
        console.log(`   生成例句: ${generated} 个`);
        console.log(`   失败: ${failed} 个`);
        
        // 更新JS文件（如果指定）
        if (updateFiles && updatedWords.size > 0) {
            console.log('\n📁 更新词汇文件...');
            for (const [type, words] of updatedWords) {
                if (VOCAB_FILES[type]) {
                    await updateVocabJSFile(type, words);
                    console.log(`   ✓ ${type}: ${words.length} 个词汇`);
                }
            }
        }
        
        // 查询剩余统计
        const [stats] = await conn.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN phonetic IS NULL OR phonetic = '' OR phonetic LIKE '%&%' THEN 1 ELSE 0 END) as noPhonetic,
                SUM(CASE WHEN example IS NULL OR example = '' THEN 1 ELSE 0 END) as noExample,
                SUM(CASE WHEN example_translation IS NULL OR example_translation = '' THEN 1 ELSE 0 END) as noExampleCn
            FROM vocabulary WHERE deleted = 0
        `);
        
        console.log('\n📊 数据库词汇统计:');
        console.log(`   总词汇: ${stats[0].total}`);
        console.log(`   缺音标: ${stats[0].noPhonetic}`);
        console.log(`   缺例句: ${stats[0].noExample}`);
        console.log(`   缺例句翻译: ${stats[0].noExampleCn}`);
        
        console.log('\n' + '═'.repeat(60));
        console.log(`📅 完成时间: ${new Date().toLocaleString()}`);
        
    } catch (e) {
        console.error('\n❌ 错误:', e.message);
        console.error(e.stack);
    } finally {
        if (conn) await conn.end();
    }
}

/**
 * 更新词汇JS文件
 */
async function updateVocabJSFile(examType, updatedWords) {
    const filePath = VOCAB_FILES[examType];
    if (!filePath) return;
    
    try {
        // 读取现有文件
        const existingWords = await readVocabFile(filePath);
        
        // 创建词汇映射
        const wordMap = new Map();
        existingWords.forEach(w => wordMap.set(w.word.toLowerCase(), w));
        
        // 更新词汇
        updatedWords.forEach(w => {
            const key = w.word.toLowerCase();
            if (wordMap.has(key)) {
                const existing = wordMap.get(key);
                existing.phonetic = w.phonetic || existing.phonetic;
                existing.example = w.example || existing.example;
                existing.exampleCn = w.exampleCn || existing.exampleCn;
            }
        });
        
        // 保存文件
        await saveVocabFile(filePath, Array.from(wordMap.values()), examType);
    } catch (e) {
        console.error(`更新文件失败 ${filePath}:`, e.message);
    }
}

// 运行
main().catch(console.error);
