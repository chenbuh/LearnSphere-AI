/**
 * 词汇导入脚本 - 从JS文件导入到数据库
 * 将各考试类型的词汇文件导入到MySQL数据库
 */

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

// 词汇文件配置
const VOCAB_FILES = [
    { file: 'frontend-vue/src/data/cet4_words.js', examType: 'cet4', name: '四级' },
    { file: 'frontend-vue/src/data/cet6_words.js', examType: 'cet6', name: '六级' },
    { file: 'frontend-vue/src/data/toefl_words.js', examType: 'toefl', name: '托福' },
    { file: 'frontend-vue/src/data/ielts_words.js', examType: 'ielts', name: '雅思' },
    { file: 'frontend-vue/src/data/gre_words.js', examType: 'gre', name: 'GRE' },
    { file: 'frontend-vue/src/data/tem4_words.js', examType: 'tem4', name: '专四' },
    { file: 'frontend-vue/src/data/tem8_words.js', examType: 'tem8', name: '专八' },
    { file: 'frontend-vue/src/data/postgraduate_words.js', examType: 'postgraduate', name: '考研' },
    { file: 'frontend-vue/src/data/primary_school_words.js', examType: 'primary', name: '小学' },
    { file: 'frontend-vue/src/data/middle_school_words.js', examType: 'middle_school', name: '中考' },
    { file: 'frontend-vue/src/data/high_school_words.js', examType: 'high_school', name: '高中' },
    { file: 'frontend-vue/src/data/coca_words.js', examType: 'coca', name: 'COCA' }
];

/**
 * 读取词汇JS文件
 */
async function readVocabFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // 尝试多种匹配模式
        let match = content.match(/export\s+(?:const|default)\s+\w+\s*=\s*(\[[\s\S]*?\]);?\s*(?:export|$)/);
        if (!match) {
            match = content.match(/=\s*(\[[\s\S]*\]);?/);
        }
        
        if (match) {
            try {
                // 清理并解析JSON
                let jsonStr = match[1]
                    .replace(/,\s*]/g, ']')  // 移除尾随逗号
                    .replace(/'/g, '"')       // 单引号转双引号
                    .replace(/(\w+):/g, '"$1":'); // 属性名加引号
                
                return JSON.parse(jsonStr);
            } catch (e) {
                // 如果JSON解析失败，尝试eval
                return eval(match[1]);
            }
        }
        return [];
    } catch (e) {
        console.error(`读取文件失败: ${filePath}`, e.message);
        return [];
    }
}

/**
 * 导入词汇到数据库
 */
async function importToDatabase(conn, words, examType) {
    let inserted = 0, updated = 0, skipped = 0;
    
    for (const word of words) {
        try {
            // 检查是否存在
            const [existing] = await conn.execute(
                'SELECT id, phonetic, example FROM vocabulary WHERE word = ? AND exam_type = ?',
                [word.word, examType]
            );
            
            if (existing.length > 0) {
                // 更新（如果新数据更完整）
                const ex = existing[0];
                const needUpdate = 
                    (!ex.phonetic && word.phonetic) ||
                    (!ex.example && word.example) ||
                    (ex.phonetic?.includes('&') && word.phonetic && !word.phonetic.includes('&'));
                
                if (needUpdate) {
                    await conn.execute(`
                        UPDATE vocabulary SET
                            phonetic = COALESCE(NULLIF(?, ''), phonetic),
                            example = COALESCE(NULLIF(?, ''), example),
                            example_translation = COALESCE(NULLIF(?, ''), example_translation),
                            update_time = NOW()
                        WHERE id = ?
                    `, [
                        word.phonetic || null,
                        word.example || null,
                        word.exampleCn || word.example_translation || null,
                        ex.id
                    ]);
                    updated++;
                } else {
                    skipped++;
                }
            } else {
                // 插入新词汇
                await conn.execute(`
                    INSERT INTO vocabulary 
                    (word, phonetic, translation, example, example_translation, exam_type, difficulty, frequency)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    word.word,
                    word.phonetic || null,
                    word.meaning || word.translation || null,
                    word.example || null,
                    word.exampleCn || word.example_translation || null,
                    examType,
                    word.difficulty || 2,
                    word.frequency || 0
                ]);
                inserted++;
            }
        } catch (e) {
            console.error(`  处理词汇 "${word.word}" 失败:`, e.message);
        }
    }
    
    return { inserted, updated, skipped };
}

/**
 * 主函数
 */
async function main() {
    console.log('═'.repeat(60));
    console.log('  词汇导入脚本 - 从JS文件导入到数据库');
    console.log('═'.repeat(60));
    console.log(`📅 开始时间: ${new Date().toLocaleString()}\n`);
    
    let conn;
    
    try {
        conn = await mysql.createConnection(DB_CONFIG);
        console.log('✅ 数据库连接成功\n');
        
        // 获取命令行参数
        const args = process.argv.slice(2);
        const targetExamType = args.find(a => !a.startsWith('-'));
        
        // 过滤要处理的文件
        const filesToProcess = targetExamType 
            ? VOCAB_FILES.filter(f => f.examType === targetExamType)
            : VOCAB_FILES;
        
        if (filesToProcess.length === 0) {
            console.log('❌ 未找到匹配的词汇文件');
            return;
        }
        
        let totalInserted = 0, totalUpdated = 0, totalSkipped = 0;
        
        // 处理每个文件
        for (const config of filesToProcess) {
            console.log(`📁 处理: ${config.name} (${config.examType})`);
            console.log(`   文件: ${config.file}`);
            
            // 读取文件
            const words = await readVocabFile(config.file);
            console.log(`   词汇数: ${words.length}`);
            
            if (words.length === 0) {
                console.log('   ⚠️ 文件为空或读取失败\n');
                continue;
            }
            
            // 导入数据库
            const result = await importToDatabase(conn, words, config.examType);
            console.log(`   ✓ 新增: ${result.inserted}, 更新: ${result.updated}, 跳过: ${result.skipped}\n`);
            
            totalInserted += result.inserted;
            totalUpdated += result.updated;
            totalSkipped += result.skipped;
        }
        
        // 输出统计
        console.log('═'.repeat(60));
        console.log('📊 总计:');
        console.log(`   新增: ${totalInserted}`);
        console.log(`   更新: ${totalUpdated}`);
        console.log(`   跳过: ${totalSkipped}`);
        
        // 查询数据库统计
        const [stats] = await conn.execute(`
            SELECT exam_type, COUNT(*) as count
            FROM vocabulary WHERE deleted = 0
            GROUP BY exam_type
            ORDER BY count DESC
        `);
        
        console.log('\n📊 数据库词汇统计:');
        for (const s of stats) {
            console.log(`   ${s.exam_type}: ${s.count} 个`);
        }
        
        console.log('\n' + '═'.repeat(60));
        console.log(`📅 完成时间: ${new Date().toLocaleString()}`);
        
    } catch (e) {
        console.error('\n❌ 错误:', e.message);
        console.error(e.stack);
    } finally {
        if (conn) await conn.end();
    }
}

main().catch(console.error);
