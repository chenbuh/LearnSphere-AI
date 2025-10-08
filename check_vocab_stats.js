const mysql = require('mysql2/promise');

async function check() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'chen20040209',
        database: 'learnsphere_ai'
    });
    
    const [r] = await conn.execute(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN phonetic IS NULL OR phonetic = '' THEN 1 ELSE 0 END) as missing_phonetic,
            SUM(CASE WHEN example IS NULL OR example = '' THEN 1 ELSE 0 END) as missing_example
        FROM vocabulary WHERE deleted = 0
    `);
    
    console.log('📊 词汇库统计:');
    console.log('   总词汇数:', r[0].total);
    console.log('   缺少音标:', r[0].missing_phonetic);
    console.log('   缺少例句:', r[0].missing_example);
    
    await conn.end();
}

check().catch(console.error);
