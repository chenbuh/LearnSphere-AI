// 检查实际保存的例句
const mysql = require('mysql2/promise');

async function main() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'chen20040209',
        database: 'learnsphere_ai'
    });
    
    // 查看最近更新的10个词汇的例句
    const [r] = await c.execute(`
        SELECT word, example, update_time 
        FROM vocabulary 
        WHERE deleted = 0 
        AND example IS NOT NULL 
        AND example != ''
        ORDER BY update_time DESC 
        LIMIT 10
    `);
    
    console.log('最近更新的例句:\n');
    r.forEach(x => {
        console.log(`${x.word}:`);
        console.log(`  ${x.example}`);
        console.log(`  更新时间: ${x.update_time}\n`);
    });
    
    await c.end();
}

main().catch(console.error);
