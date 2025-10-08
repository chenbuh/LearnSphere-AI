/**
 * 实时监控词汇修复进度
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'chen20040209',
    database: 'learnsphere_ai'
};

async function showProgress() {
    const conn = await mysql.createConnection(DB_CONFIG);
    
    console.clear();
    console.log('═'.repeat(60));
    console.log('  词汇修复进度监控');
    console.log('═'.repeat(60));
    console.log(`更新时间: ${new Date().toLocaleString()}\n`);
    
    // 总体统计
    const [total] = await conn.execute(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN phonetic IS NULL OR phonetic = '' THEN 1 ELSE 0 END) as no_phonetic,
            SUM(CASE WHEN example IS NULL OR example = '' OR example LIKE '%unavailable%' OR example LIKE '%This is useful%' THEN 1 ELSE 0 END) as bad_example
        FROM vocabulary WHERE deleted = 0
    `);
    
    const totalWords = total[0].total;
    const needPhonetic = total[0].no_phonetic;
    const needExample = total[0].bad_example;
    const completedPhonetic = totalWords - needPhonetic;
    const completedExample = totalWords - needExample;
    
    console.log('📊 总体进度:');
    console.log(`   总词汇: ${totalWords}`);
    console.log(`   音标完成: ${completedPhonetic}/${totalWords} (${((completedPhonetic/totalWords)*100).toFixed(1)}%)`);
    console.log(`   例句完成: ${completedExample}/${totalWords} (${((completedExample/totalWords)*100).toFixed(1)}%)`);
    console.log(`   剩余音标: ${needPhonetic}`);
    console.log(`   剩余例句: ${needExample}`);
    
    // 最近更新的词汇
    const [recent] = await conn.execute(`
        SELECT word, example, update_time 
        FROM vocabulary 
        WHERE deleted = 0 
        ORDER BY update_time DESC 
        LIMIT 5
    `);
    
    console.log('\n📝 最近更新的词汇:');
    recent.forEach((r, i) => {
        const time = new Date(r.update_time).toLocaleTimeString();
        console.log(`   ${i+1}. ${r.word.padEnd(15)} (${time})`);
    });
    
    // 按考试类型统计
    const [byType] = await conn.execute(`
        SELECT 
            exam_type,
            COUNT(*) as total,
            SUM(CASE WHEN example IS NULL OR example = '' OR example LIKE '%unavailable%' OR example LIKE '%This is useful%' THEN 1 ELSE 0 END) as need_fix
        FROM vocabulary WHERE deleted = 0
        GROUP BY exam_type
        ORDER BY need_fix DESC
    `);
    
    console.log('\n📋 按考试类型进度:');
    console.log('   类型\t\t总数\t剩余\t完成率');
    console.log('   ' + '-'.repeat(50));
    byType.forEach(t => {
        const completed = t.total - t.need_fix;
        const percent = ((completed / t.total) * 100).toFixed(1);
        const type = (t.exam_type || 'unknown').padEnd(12);
        console.log(`   ${type}\t${t.total}\t${t.need_fix}\t${percent}%`);
    });
    
    // 预估完成时间
    const [firstUpdate] = await conn.execute(`
        SELECT MIN(update_time) as first_time 
        FROM vocabulary 
        WHERE update_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);
    
    if (firstUpdate[0].first_time) {
        const startTime = new Date(firstUpdate[0].first_time);
        const now = new Date();
        const elapsed = (now - startTime) / 1000; // 秒
        const processed = completedExample - (totalWords - 14777); // 假设开始时有14777个需要修复
        
        if (processed > 0) {
            const rate = processed / elapsed; // 每秒处理数
            const remaining = needExample;
            const estimatedSeconds = remaining / rate;
            const estimatedHours = (estimatedSeconds / 3600).toFixed(1);
            const estimatedFinish = new Date(now.getTime() + estimatedSeconds * 1000);
            
            console.log('\n⏱️  预估信息:');
            console.log(`   处理速度: ${(rate * 60).toFixed(1)} 个/分钟`);
            console.log(`   预计剩余时间: ${estimatedHours} 小时`);
            console.log(`   预计完成时间: ${estimatedFinish.toLocaleString()}`);
        }
    }
    
    console.log('\n提示: 按 Ctrl+C 退出监控（不影响后台进程）');
    console.log('═'.repeat(60));
    
    await conn.end();
}

// 每30秒刷新一次
async function monitor() {
    while (true) {
        try {
            await showProgress();
            await new Promise(r => setTimeout(r, 30000));
        } catch (e) {
            console.error('错误:', e.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

monitor().catch(console.error);
