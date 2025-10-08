const axios = require('axios');

async function testAIQuality() {
    try {
        console.log('测试AI生成质量...\n');
        
        // 处理一个词汇
        const response = await axios.post(
            'http://localhost:8080/api/public/vocabulary/fix-all-duplicate-examples',
            null,
            { 
                params: { limit: 1 },
                timeout: 60000
            }
        );
        
        if (response.data.code === 200) {
            console.log('✅ 处理成功\n');
            
            // 查询刚刚更新的词汇
            const mysql = require('child_process').execSync;
            const result = mysql(
                'mysql -uroot -pchen20040209 learnsphere_ai -e "SELECT word, example, example_translation FROM vocabulary WHERE example NOT IN (\'This is useful for study.\', \'I study this carefully.\', \'She understands it well.\', \'We use this in class.\', \'He learns it quickly.\') ORDER BY id DESC LIMIT 5;"',
                { encoding: 'utf8' }
            );
            
            console.log('最新生成的例句:');
            console.log(result);
        }
        
    } catch (error) {
        console.error('错误:', error.message);
    }
}

testAIQuality();
