// 检查问题例句
const mysql = require('mysql2/promise');

async function main() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root', 
        password: 'chen20040209',
        database: 'learnsphere_ai'
    });
    
    // 统计问题例句
    const [stats] = await c.execute(`
        SELECT 
            SUM(CASE WHEN example IS NULL OR example = '' THEN 1 ELSE 0 END) as empty_cnt,
            SUM(CASE WHEN example LIKE '%unavailable%' THEN 1 ELSE 0 END) as unavailable_cnt,
            SUM(CASE WHEN example LIKE '%This is useful%' THEN 1 ELSE 0 END) as generic1_cnt,
            SUM(CASE WHEN example LIKE '%I study this%' THEN 1 ELSE 0 END) as generic2_cnt,
            SUM(CASE WHEN example LIKE '%This word means%' THEN 1 ELSE 0 END) as generic3_cnt,
            SUM(CASE WHEN example = example_translation THEN 1 ELSE 0 END) as duplicate_cnt
        FROM vocabulary WHERE deleted = 0
    `);
    
    console.log('问题例句统计:');
    console.log('  空例句:', stats[0].empty_cnt);
    console.log('  unavailable:', stats[0].unavailable_cnt);
    console.log('  This is useful:', stats[0].generic1_cnt);
    console.log('  I study this:', stats[0].generic2_cnt);
    console.log('  This word means:', stats[0].generic3_cnt);
    console.log('  例句=翻译(重复):', stats[0].duplicate_cnt);
    
    const total = Number(stats[0].empty_cnt || 0) + Number(stats[0].unavailable_cnt || 0) + 
                  Number(stats[0].generic1_cnt || 0) + Number(stats[0].generic2_cnt || 0) + Number(stats[0].generic3_cnt || 0);
    console.log('\n需要修复总数:', total);
    
    // 显示示例
    const [samples] = await c.execute(`
        SELECT word, example FROM vocabulary 
        WHERE deleted = 0 AND (
            example IS NULL OR example = '' OR 
            example LIKE '%unavailable%' OR
            example LIKE '%This is useful%' OR
            example LIKE '%I study this%'
        ) LIMIT 15
    `);
    
    console.log('\n问题例句示例:');
    samples.forEach(x => console.log(`  ${x.word}: ${x.example || '(空)'}`));
    
    await c.end();
}

main().catch(console.error);
