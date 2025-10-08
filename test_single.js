const axios = require('axios');

async function testSingle() {
    try {
        console.log('测试处理单个词汇...\n');
        
        const response = await axios.post(
            'http://localhost:8080/api/public/vocabulary/fix-all-duplicate-examples',
            null,
            { 
                params: { limit: 1 },
                timeout: 60000
            }
        );
        
        console.log('响应:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('错误:', error.message);
        if (error.response) {
            console.error('响应数据:', error.response.data);
        }
    }
}

testSingle();
