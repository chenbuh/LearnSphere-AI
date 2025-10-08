/**
 * 测试API接口是否正常工作
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080';

async function testAPI() {
    console.log('🧪 测试API接口...\n');
    
    try {
        // 测试统计接口
        console.log('1️⃣ 测试统计接口...');
        const statsResponse = await axios.get(`${API_BASE_URL}/api/public/vocabulary/template-stats`);
        
        if (statsResponse.data.code === 200) {
            console.log('✅ 统计接口正常！');
            const stats = statsResponse.data.data;
            console.log('\n📊 当前统计:');
            console.log(`   - 总词汇数: ${stats.totalCount}`);
            console.log(`   - "This is useful for study.": ${stats.studyCount}`);
            console.log(`   - "I study this carefully.": ${stats.carefullyCount}`);
            console.log(`   - "She understands it well.": ${stats.understandsCount}`);
            console.log(`   - "We use this in class.": ${stats.classCount}`);
            console.log(`   - "He learns it quickly.": ${stats.quicklyCount}`);
            console.log(`   - 总重复数: ${stats.totalDuplicates}`);
            console.log(`   - 占比: ${stats.percentage}`);
        } else {
            console.log('❌ 统计接口返回错误:', statsResponse.data.message);
            return false;
        }
        
        console.log('\n2️⃣ 测试批量处理接口（处理1个词汇）...');
        const fixResponse = await axios.post(
            `${API_BASE_URL}/api/public/vocabulary/fix-all-duplicate-examples`,
            null,
            { params: { limit: 1 }, timeout: 30000 }
        );
        
        if (fixResponse.data.code === 200) {
            console.log('✅ 批量处理接口正常！');
            const data = fixResponse.data.data;
            console.log(`   - 处理成功: ${data.processedCount}`);
            console.log(`   - 处理失败: ${data.errorCount}`);
            console.log(`   - 剩余数量: ${data.totalRemaining}`);
        } else {
            console.log('❌ 批量处理接口返回错误:', fixResponse.data.message);
            return false;
        }
        
        console.log('\n🎉 所有接口测试通过！可以开始批量处理了。');
        console.log('\n运行以下命令开始批量处理:');
        console.log('   node batch_fix_examples.js');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        if (error.response) {
            console.error('   响应状态:', error.response.status);
            console.error('   响应数据:', error.response.data);
        }
        console.log('\n请检查:');
        console.log('   1. 后端服务是否正常运行');
        console.log('   2. 后端是否已重新编译');
        console.log('   3. 端口8080是否被占用');
        return false;
    }
}

// 运行测试
testAPI().then(success => {
    process.exit(success ? 0 : 1);
});
