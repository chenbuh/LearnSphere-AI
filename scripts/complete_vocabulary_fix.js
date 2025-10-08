/**
 * 完善词汇脚本 - 修复音标、例句和翻译
 * 调用现有后端API批量完善所有词汇数据
 * 
 * 功能：
 * 1. 修复空音标或错误音标
 * 2. 修复重复或无效例句
 * 3. 补充缺失的翻译
 * 4. 按考试类型分批处理
 */

const axios = require('axios');

// 配置
const API_BASE_URL = 'http://localhost:8080';
const BATCH_SIZE = 10; // 每批处理数量（降低以避免API限速）
const DELAY_BETWEEN_BATCHES = 5000; // 批次间隔5秒
const MAX_RETRIES = 3; // 最大重试次数

// 统计信息
let stats = {
    totalProcessed: 0,
    successCount: 0,
    failCount: 0,
    skipped: 0,
    startTime: null
};

// 常见的无效例句模式（需要替换的）
const INVALID_EXAMPLES = [
    "This is useful for study.",
    "I study this carefully.",
    "She understands it well.",
    "We use this in class.",
    "He learns it quickly.",
    "She explains this word carefully.",
    "I learn this word every day.",
    "They remember this word clearly.",
    "She uses this word often.",
    "I understand this word now.",
    "We study this word in class.",
    "We practice this word together.",
    "He knows this word well.",
    "I need to practice more.",
    "This is important for learning.",
    "He demonstrates this technique.",
    "She teaches us this concept.",
    "We discuss this topic often.",
    "They improve their performance.",
    "We apply this method daily.",
    "She masters this skill quickly.",
    "I focus on this subject.",
    "He explains it very clearly.",
    "They work on this project."
];

/**
 * 延迟函数
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 日志函数
 */
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    const icons = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        progress: '🔄'
    };
    console.log(`[${timestamp}] ${icons[type] || ''} ${message}`);
}

/**
 * 获取需要修复的词汇统计
 */
async function getVocabularyStats() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/public/vocabulary/template-stats`);
        if (response.data.code === 200) {
            return response.data.data;
        }
    } catch (error) {
        log(`获取统计失败: ${error.message}`, 'error');
    }
    return null;
}

/**
 * 获取需要修复的词汇列表
 * @param {string} examType - 考试类型 (可选)
 * @param {number} limit - 获取数量
 */
async function getVocabularyNeedsFix(examType, limit = 100) {
    try {
        const params = { page: 1, pageSize: limit };
        if (examType) {
            params.examType = examType;
        }

        const response = await axios.get(`${API_BASE_URL}/api/vocabulary/list`, { params });
        if (response.data.code === 200) {
            const records = response.data.data.records || [];
            // 过滤出需要修复的词汇
            return records.filter(v => needsFix(v));
        }
    } catch (error) {
        log(`获取词汇列表失败: ${error.message}`, 'error');
    }
    return [];
}

/**
 * 判断词汇是否需要修复
 */
function needsFix(vocab) {
    // 检查音标
    const hasInvalidPhonetic = !vocab.phonetic ||
        vocab.phonetic.trim() === '' ||
        !vocab.phonetic.includes('/');

    // 检查例句
    const hasInvalidExample = !vocab.example ||
        vocab.example.trim() === '' ||
        INVALID_EXAMPLES.includes(vocab.example);

    // 检查翻译
    const hasInvalidTranslation = !vocab.translation ||
        vocab.translation.trim() === '';

    // 检查例句翻译
    const hasInvalidExampleTranslation = !vocab.exampleTranslation ||
        vocab.exampleTranslation.trim() === '';

    return hasInvalidPhonetic || hasInvalidExample ||
        hasInvalidTranslation || hasInvalidExampleTranslation;
}

/**
 * 使用AI生成单词详情
 */
async function generateVocabularyDetails(vocabId) {
    for (let retry = 0; retry < MAX_RETRIES; retry++) {
        try {
            if (retry > 0) {
                log(`重试第 ${retry} 次...`, 'warning');
                await delay(2000 * retry);
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/vocabulary/generate/${vocabId}`,
                {},
                { timeout: 60000 }
            );

            if (response.data.code === 200) {
                return response.data.data;
            }
        } catch (error) {
            if (retry === MAX_RETRIES - 1) {
                throw error;
            }
        }
    }
    return null;
}

/**
 * 调用批量修复API (公开接口)
 */
async function callBatchFix(limit = BATCH_SIZE) {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/public/vocabulary/fix-all-duplicate-examples`,
            null,
            {
                params: { limit },
                timeout: 300000
            }
        );

        if (response.data.code === 200) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        log(`批量修复API调用失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 单个词汇修复
 */
async function fixSingleVocabulary(vocab) {
    try {
        log(`处理: ${vocab.word} (ID: ${vocab.id})`, 'progress');

        const result = await generateVocabularyDetails(vocab.id);

        if (result) {
            stats.successCount++;
            log(`成功: ${vocab.word}`, 'success');
            return true;
        } else {
            stats.failCount++;
            log(`失败: ${vocab.word}`, 'error');
            return false;
        }
    } catch (error) {
        stats.failCount++;
        log(`错误: ${vocab.word} - ${error.message}`, 'error');
        return false;
    }
}

/**
 * 批量处理重复例句
 */
async function processDuplicateExamples(maxBatches = 1000) {
    log('========================================', 'info');
    log('开始处理重复例句...', 'info');
    log('========================================', 'info');

    // 获取初始统计
    const initialStats = await getVocabularyStats();
    if (initialStats) {
        log(`初始统计:`, 'info');
        log(`  - 总词汇数: ${initialStats.totalCount}`, 'info');
        log(`  - 重复例句数: ${initialStats.totalDuplicates}`, 'info');
        log(`  - 占比: ${initialStats.percentage}`, 'info');
    }

    let batchCount = 0;
    let hasMore = true;

    while (hasMore && batchCount < maxBatches) {
        batchCount++;
        log(`\n批次 ${batchCount}/${maxBatches}`, 'progress');

        const result = await callBatchFix(BATCH_SIZE);

        if (result) {
            stats.totalProcessed += result.processedCount;
            stats.successCount += result.processedCount;
            stats.failCount += result.errorCount;

            log(`  成功: ${result.processedCount}`, 'success');
            log(`  失败: ${result.errorCount}`, result.errorCount > 0 ? 'warning' : 'info');
            log(`  剩余: ${result.totalRemaining}`, 'info');

            hasMore = result.totalRemaining > 0;

            if (result.processedCount === 0 && result.totalRemaining === 0) {
                hasMore = false;
            }
        } else {
            log(`批次 ${batchCount} 失败`, 'error');
            // 等待更长时间后重试
            await delay(10000);
        }

        // 每10批显示进度
        if (batchCount % 10 === 0) {
            const elapsed = (Date.now() - stats.startTime) / 1000 / 60;
            log(`\n📊 进度报告:`, 'info');
            log(`  - 已处理: ${stats.totalProcessed}`, 'info');
            log(`  - 成功率: ${((stats.successCount / Math.max(1, stats.totalProcessed)) * 100).toFixed(1)}%`, 'info');
            log(`  - 耗时: ${elapsed.toFixed(1)} 分钟`, 'info');
        }

        if (hasMore) {
            await delay(DELAY_BETWEEN_BATCHES);
        }
    }

    // 最终统计
    const finalStats = await getVocabularyStats();
    log('\n========================================', 'info');
    log('处理完成！', 'success');
    log('========================================', 'info');
    log(`总处理: ${stats.totalProcessed}`, 'info');
    log(`成功: ${stats.successCount}`, 'info');
    log(`失败: ${stats.failCount}`, 'info');
    if (finalStats) {
        log(`剩余重复: ${finalStats.totalDuplicates}`, 'info');
    }
}

/**
 * 按考试类型处理词汇
 */
async function processVocabularyByExamType(examType) {
    log(`\n========================================`, 'info');
    log(`开始处理 ${examType} 词汇...`, 'info');
    log(`========================================`, 'info');

    const vocabList = await getVocabularyNeedsFix(examType, 1000);
    log(`找到 ${vocabList.length} 个需要修复的 ${examType} 词汇`, 'info');

    for (let i = 0; i < vocabList.length; i++) {
        const vocab = vocabList[i];
        log(`[${i + 1}/${vocabList.length}] 处理: ${vocab.word}`, 'progress');

        await fixSingleVocabulary(vocab);
        stats.totalProcessed++;

        // 延迟避免API限速
        if ((i + 1) % BATCH_SIZE === 0) {
            log(`等待 ${DELAY_BETWEEN_BATCHES / 1000} 秒...`, 'info');
            await delay(DELAY_BETWEEN_BATCHES);
        } else {
            await delay(500);
        }
    }
}

/**
 * 处理所有考试类型
 */
async function processAllExamTypes() {
    const examTypes = ['cet4', 'cet6', 'ielts', 'toefl', 'gre', 'sat', 'gaokao'];

    for (const examType of examTypes) {
        await processVocabularyByExamType(examType);
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('\n');
    log('🚀 词汇完善脚本启动', 'info');
    log('========================================', 'info');
    log(`API地址: ${API_BASE_URL}`, 'info');
    log(`批量大小: ${BATCH_SIZE}`, 'info');
    log(`批次间隔: ${DELAY_BETWEEN_BATCHES / 1000} 秒`, 'info');
    log('========================================', 'info');

    stats.startTime = Date.now();

    // 检查服务是否可用，最多等待10次
    log('正在连接后端服务...', 'info');
    let connected = false;
    for (let i = 0; i < 20; i++) {
        try {
            await axios.get(`${API_BASE_URL}/api/public/vocabulary/template-stats`, { timeout: 3000 });
            log('后端服务连接成功！', 'success');
            connected = true;
            break;
        } catch (error) {
            process.stdout.write('.'); // 简单的进度条
            await delay(3000);
        }
    }
    console.log(''); // 换行

    if (!connected) {
        log('无法连接到后端服务，请确保后端已启动', 'error');
        process.exit(1);
    }

    // 获取命令行参数
    const args = process.argv.slice(2);
    const mode = args[0] || 'all';

    switch (mode) {
        case 'duplicates':
            // 只处理重复例句
            await processDuplicateExamples();
            break;
        case 'cet4':
        case 'cet6':
        case 'ielts':
        case 'toefl':
        case 'gre':
            // 处理指定考试类型
            await processVocabularyByExamType(mode);
            break;
        case 'all':
        default:
            // 先处理重复例句，再按考试类型处理
            await processDuplicateExamples(100); // 限制批次数
            await processAllExamTypes();
            break;
    }

    // 输出最终统计
    const elapsed = (Date.now() - stats.startTime) / 1000 / 60;
    console.log('\n');
    log('========================================', 'info');
    log('📊 最终统计', 'info');
    log('========================================', 'info');
    log(`总处理: ${stats.totalProcessed}`, 'info');
    log(`成功: ${stats.successCount}`, 'success');
    log(`失败: ${stats.failCount}`, 'error');
    log(`总耗时: ${elapsed.toFixed(1)} 分钟`, 'info');
    log('========================================', 'info');
}

// 运行
main().catch(error => {
    console.error('程序出错:', error);
    process.exit(1);
});
