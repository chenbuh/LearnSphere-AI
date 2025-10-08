/**
 * 一次性完善所有词汇 - 修复缺失的音标
 * 使用 Free Dictionary API
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

// 请求间隔 1.5秒，避免API限流
const DELAY = 1500;
const delay = ms => new Promise(r => setTimeout(r, ms));

// 从 Free Dictionary API 获取音标
async function getPhonetic(word) {
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
        return phonetic;
    } catch (e) {
        if (e.response?.status === 429) return 'RATE_LIMITED';
        return null;
    }
}

// 常用音标映射（备用）
const PHONETIC_MAP = {
    'extract': '/ˈekstrækt/',
    'flap': '/flæp/',
    'fluctuate': '/ˈflʌktʃueɪt/',
    'formulate': '/ˈfɔːrmjuleɪt/',
    'generalize': '/ˈdʒenərəlaɪz/',
    'grease': '/ɡriːs/',
    'guideline': '/ˈɡaɪdlaɪn/',
    'handbook': '/ˈhændbʊk/',
    'incidence': '/ˈɪnsɪdəns/',
    'incidentally': '/ˌɪnsɪˈdentəli/',
    ' toefl': '/ˈtoʊfl/',
    'ielts': '/ˈaɪelts/'
};

async function main() {
    console.log('═'.repeat(50));
    console.log('  一次性完善所有词汇音标');
    console.log('═'.repeat(50));
    console.log(`开始时间: ${new Date().toLocaleString()}\n`);
    
    let conn;
    try {
        conn = await mysql.createConnection(DB_CONFIG);
        console.log('✅ 数据库连接成功\n');
        
        // 获取所有缺音标的词汇
        const [words] = await conn.execute(`
            SELECT id, word, phonetic, exam_type
            FROM vocabulary 
            WHERE deleted = 0 AND (phonetic IS NULL OR phonetic = '')
            ORDER BY exam_type, id
        `);
        
        console.log(`📝 需要完善音标: ${words.length} 个词汇\n`);
        
        if (words.length === 0) {
            console.log('✅ 所有词汇音标已完善！');
            return;
        }
        
        let success = 0, failed = 0, apiHit = 0;
        
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            process.stdout.write(`[${(i+1).toString().padStart(3)}/${words.length}] ${w.word.padEnd(20)} `);
            
            // 先检查本地映射
            let phonetic = PHONETIC_MAP[w.word.toLowerCase()];
            
            // 如果没有本地映射，调用API
            if (!phonetic) {
                phonetic = await getPhonetic(w.word);
                
                if (phonetic === 'RATE_LIMITED') {
                    console.log('⚠️ API限流，等待60秒...');
                    await delay(60000);
                    i--;
                    continue;
                }
                
                if (phonetic) apiHit++;
            }
            
            if (phonetic) {
                await conn.execute(
                    'UPDATE vocabulary SET phonetic = ?, update_time = NOW() WHERE id = ?',
                    [phonetic, w.id]
                );
                console.log(`✓ ${phonetic}`);
                success++;
            } else {
                console.log('✗ 未找到');
                failed++;
            }
            
            await delay(DELAY);
        }
        
        console.log('\n' + '═'.repeat(50));
        console.log(`📊 完成统计:`);
        console.log(`   成功: ${success}`);
        console.log(`   失败: ${failed}`);
        console.log(`   API命中: ${apiHit}`);
        
        // 最终统计
        const [stats] = await conn.execute(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN phonetic IS NULL OR phonetic = '' THEN 1 ELSE 0 END) as no_phonetic
            FROM vocabulary WHERE deleted = 0
        `);
        console.log(`\n📊 数据库状态:`);
        console.log(`   总词汇: ${stats[0].total}`);
        console.log(`   仍缺音标: ${stats[0].no_phonetic}`);
        
        console.log(`\n完成时间: ${new Date().toLocaleString()}`);
        
    } catch (e) {
        console.error('\n❌ 错误:', e.message);
    } finally {
        if (conn) await conn.end();
    }
}

main();
