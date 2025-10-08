// 检查词汇状态
const mysql = require('mysql2/promise');

async function main() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'chen20040209',
        database: 'learnsphere_ai'
    });
    
    console.log('词汇数据库状态检查\n');
    
    // 总体统计
    const [total] = await conn.execute(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN phonetic IS NULL OR phonetic = '' THEN 1 ELSE 0 END) as no_phonetic,
            SUM(CASE WHEN phonetic LIKE '%&%' THEN 1 ELSE 0 END) as bad_phonetic,
            SUM(CASE WHEN example IS NULL OR example = '' THEN 1 ELSE 0 END) as no_example,
            SUM(CASE WHEN example_translation IS NULL OR example_translation = '' THEN 1 ELSE 0 END) as no_example_cn
        FROM vocabulary WHERE deleted = 0
    `);
    
    console.log('总体统计:');
    console.log(`  总词汇: ${total[0].total}`);
    console.log(`  缺音标: ${total[0].no_phonetic}`);
    console.log(`  错误音标(含&): ${total[0].bad_phonetic}`);
    console.log(`  缺例句: ${total[0].no_example}`);
    console.log(`  缺例句翻译: ${total[0].no_example_cn}`);
    
    // 按考试类型统计
    const [byType] = await conn.execute(`
        SELECT 
            exam_type,
            COUNT(*) as total,
            SUM(CASE WHEN phonetic IS NULL OR phonetic = '' OR phonetic LIKE '%&%' THEN 1 ELSE 0 END) as need_phonetic,
            SUM(CASE WHEN example IS NULL OR example = '' THEN 1 ELSE 0 END) as need_example
        FROM vocabulary WHERE deleted = 0
        GROUP BY exam_type
        ORDER BY total DESC
    `);
    
    console.log('\n按考试类型统计:');
    console.log('类型\t\t总数\t需音标\t需例句');
    console.log('-'.repeat(40));
    for (const row of byType) {
        const type = (row.exam_type || 'unknown').padEnd(12);
        console.log(`${type}\t${row.total}\t${row.need_phonetic}\t${row.need_example}`);
    }
    
    // 显示一些需要完善的词汇示例
    const [samples] = await conn.execute(`
        SELECT word, phonetic, example
        FROM vocabulary 
        WHERE deleted = 0 
        AND (phonetic IS NULL OR phonetic = '' OR phonetic LIKE '%&%' OR example IS NULL OR example = '')
        LIMIT 10
    `);
    
    console.log('\n需要完善的词汇示例:');
    for (const s of samples) {
        console.log(`  ${s.word}: 音标=${s.phonetic || '无'}, 例句=${s.example ? '有' : '无'}`);
    }
    
    await conn.end();
}

main().catch(console.error);
