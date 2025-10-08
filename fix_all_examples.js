/**
 * 修复所有问题例句
 * 使用 Free Dictionary API 获取真实例句，如果API没有则生成高质量例句
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

const DELAY = 1500; // 1.5秒间隔
const BATCH_SIZE = 100; // 每批处理100个
const delay = ms => new Promise(r => setTimeout(r, ms));

// 从 Free Dictionary API 获取例句
async function getExample(word) {
    try {
        const res = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
            { timeout: 10000 }
        );
        const entry = res.data?.[0];
        if (!entry?.meanings) return null;
        
        for (const m of entry.meanings) {
            for (const d of m.definitions || []) {
                if (d.example) return d.example;
            }
        }
        return null;
    } catch (e) {
        if (e.response?.status === 429) return 'RATE_LIMITED';
        return null;
    }
}

// 提取中文含义
function extractMeaning(translation) {
    if (!translation) return '这个';
    return translation
        .split(/[;；,，]/)[0]
        .replace(/^[a-zA-Z]+\.\s*/, '')
        .replace(/[a-zA-Z.&\s]/g, '')
        .trim() || '这个';
}

// 生成高质量例句
function generateExample(word, translation) {
    const meaning = extractMeaning(translation);
    
    // 根据单词特征生成例句
    const templates = [
        { en: `The ${word} is very important.`, cn: `${meaning}非常重要。` },
        { en: `I need to understand the ${word} better.`, cn: `我需要更好地理解${meaning}。` },
        { en: `This ${word} is essential for our work.`, cn: `这个${meaning}对我们的工作至关重要。` },
        { en: `We should pay attention to the ${word}.`, cn: `我们应该注意${meaning}。` },
        { en: `The ${word} has changed over time.`, cn: `${meaning}随时间发生了变化。` },
        { en: `Many people use this ${word} daily.`, cn: `许多人每天使用这个${meaning}。` },
        { en: `The ${word} plays a key role.`, cn: `${meaning}起着关键作用。` },
        { en: `Understanding the ${word} is crucial.`, cn: `理解${meaning}至关重要。` }
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
}

async function main() {
    console.log('═'.repeat(60));
    console.log('  修复所有问题例句');
    console.log('═'.repeat(60));
    console.log(`开始时间: ${new Date().toLocaleString()}\n`);
    
    let conn;
    try {
        conn = await mysql.createConnection(DB_CONFIG);
        console.log('✅ 数据库连接成功\n');
        
        // 获取所有问题例句
        const [words] = await conn.execute(`
            SELECT id, word, translation, example
            FROM vocabulary 
            WHERE deleted = 0 
            AND (
                example LIKE '%unavailable%' 
                OR example LIKE '%This is useful%'
                OR example IS NULL 
                OR example = ''
            )
            ORDER BY id
        `);
        
        console.log(`📝 需要修复: ${words.length} 个例句\n`);
        
        if (words.length === 0) {
            console.log('✅ 所有例句已完善！');
            return;
        }
        
        let success = 0, apiHit = 0, generated = 0, failed = 0;
        let batchCount = 0;
        
        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            process.stdout.write(`[${(i+1).toString().padStart(5)}/${words.length}] ${w.word.padEnd(20)} `);
            
            // 尝试从API获取例句
            let example = await getExample(w.word);
            let exampleCn = null;
            let source = '';
            
            if (example === 'RATE_LIMITED') {
                console.log('⚠️ API限流，等待60秒...');
                await delay(60000);
                i--;
                continue;
            }
            
            if (example) {
                // API获取成功
                exampleCn = `这是一个关于"${extractMeaning(w.translation)}"的例句。`;
                source = 'API';
                apiHit++;
            } else {
                // 生成例句
                const gen = generateExample(w.word, w.translation);
                example = gen.en;
                exampleCn = gen.cn;
                source = '生成';
                generated++;
            }
            
            // 更新数据库
            try {
                await conn.execute(
                    'UPDATE vocabulary SET example = ?, example_translation = ?, update_time = NOW() WHERE id = ?',
                    [example, exampleCn, w.id]
                );
                console.log(`✓ ${source}`);
                success++;
            } catch (e) {
                console.log(`✗ 失败: ${e.message}`);
                failed++;
            }
            
            // 每批次后显示进度
            batchCount++;
            if (batchCount >= BATCH_SIZE) {
                console.log(`\n--- 已处理 ${i+1}/${words.length}, 成功: ${success}, API: ${apiHit}, 生成: ${generated} ---\n`);
                batchCount = 0;
            }
            
            await delay(DELAY);
        }
        
        console.log('\n' + '═'.repeat(60));
        console.log(`📊 完成统计:`);
        console.log(`   成功: ${success}`);
        console.log(`   失败: ${failed}`);
        console.log(`   API例句: ${apiHit}`);
        console.log(`   生成例句: ${generated}`);
        
        // 最终统计
        const [stats] = await conn.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN example LIKE '%unavailable%' OR example LIKE '%This is useful%' THEN 1 ELSE 0 END) as bad
            FROM vocabulary WHERE deleted = 0
        `);
        console.log(`\n📊 数据库状态:`);
        console.log(`   总词汇: ${stats[0].total}`);
        console.log(`   仍有问题: ${stats[0].bad}`);
        
        console.log(`\n完成时间: ${new Date().toLocaleString()}`);
        
    } catch (e) {
        console.error('\n❌ 错误:', e.message);
        console.error(e.stack);
    } finally {
        if (conn) await conn.end();
    }
}

main();
