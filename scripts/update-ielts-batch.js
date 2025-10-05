const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/data/ielts_words.js');

// 第一批雅思核心词汇 - 40个
const newWords = [
    { word: "fluctuate", meaning: "v. 波动，起伏", phonetic: "/ˈflʌktʃueɪt/", difficulty: 5, category: "v", examType: "ielts" },
    { word: "fundamental", meaning: "adj. 基本的，根本的", phonetic: "/ˌfʌndəˈmentl/", difficulty: 4, category: "adj", examType: "ielts" },
    { word: "generate", meaning: "v. 产生，生成", phonetic: "/ˈdʒenəreɪt/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "genuine", meaning: "adj. 真正的，真诚的", phonetic: "/ˈdʒenjuɪn/", difficulty: 4, category: "adj", examType: "ielts" },
    { word: "global", meaning: "adj. 全球的，整体的", phonetic: "/ˈɡləʊbl/", difficulty: 3, category: "adj", examType: "ielts" },
    { word: "guarantee", meaning: "v. 保证，担保", phonetic: "/ˌɡærənˈtiː/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "habitat", meaning: "n. 栖息地，居住地", phonetic: "/ˈhæbɪtæt/", difficulty: 4, category: "n", examType: "ielts" },
    { word: "heritage", meaning: "n. 遗产，传统", phonetic: "/ˈherɪtɪdʒ/", difficulty: 4, category: "n", examType: "ielts" },
    { word: "hierarchy", meaning: "n. 等级制度，层次", phonetic: "/ˈhaɪərɑːki/", difficulty: 5, category: "n", examType: "ielts" },
    { word: "hypothesis", meaning: "n. 假设，假说", phonetic: "/haɪˈpɒθəsɪs/", difficulty: 5, category: "n", examType: "ielts" },
    { word: "identical", meaning: "adj. 相同的，一致的", phonetic: "/aɪˈdentɪkl/", difficulty: 4, category: "adj", examType: "ielts" },
    { word: "implement", meaning: "v. 实施，执行", phonetic: "/ˈɪmplɪment/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "implication", meaning: "n. 含义，暗示", phonetic: "/ˌɪmplɪˈkeɪʃn/", difficulty: 5, category: "n", examType: "ielts" },
    { word: "incentive", meaning: "n. 激励，动机", phonetic: "/ɪnˈsentɪv/", difficulty: 4, category: "n", examType: "ielts" },
    { word: "incorporate", meaning: "v. 合并，包含", phonetic: "/ɪnˈkɔːpəreɪt/", difficulty: 5, category: "v", examType: "ielts" },
    { word: "indicate", meaning: "v. 表明，指示", phonetic: "/ˈɪndɪkeɪt/", difficulty: 3, category: "v", examType: "ielts" },
    { word: "inevitable", meaning: "adj. 不可避免的", phonetic: "/ɪnˈevɪtəbl/", difficulty: 4, category: "adj", examType: "ielts" },
    { word: "infrastructure", meaning: "n. 基础设施", phonetic: "/ˈɪnfrəstrʌktʃə(r)/", difficulty: 5, category: "n", examType: "ielts" },
    { word: "inhibit", meaning: "v. 抑制，阻止", phonetic: "/ɪnˈhɪbɪt/", difficulty: 5, category: "v", examType: "ielts" },
    { word: "initiative", meaning: "n. 主动性，倡议", phonetic: "/ɪˈnɪʃətɪv/", difficulty: 4, category: "n", examType: "ielts" },
    { word: "innovation", meaning: "n. 创新，革新", phonetic: "/ˌɪnəˈveɪʃn/", difficulty: 4, category: "n", examType: "ielts" },
    { word: "integrate", meaning: "v. 整合，融合", phonetic: "/ˈɪntɪɡreɪt/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "integrity", meaning: "n. 诚实，完整性", phonetic: "/ɪnˈteɡrəti/", difficulty: 5, category: "n", examType: "ielts" },
    { word: "interpret", meaning: "v. 解释，翻译", phonetic: "/ɪnˈtɜːprɪt/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "intervention", meaning: "n. 干预，介入", phonetic: "/ˌɪntəˈvenʃn/", difficulty: 5, category: "n", examType: "ielts" },
    { word: "investigate", meaning: "v. 调查，研究", phonetic: "/ɪnˈvestɪɡeɪt/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "justify", meaning: "v. 证明...正当", phonetic: "/ˈdʒʌstɪfaɪ/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "legislation", meaning: "n. 立法，法律", phonetic: "/ˌledʒɪsˈleɪʃn/", difficulty: 5, category: "n", examType: "ielts" },
    { word: "legitimate", meaning: "adj. 合法的，正当的", phonetic: "/lɪˈdʒɪtɪmət/", difficulty: 5, category: "adj", examType: "ielts" },
    { word: "maintain", meaning: "v. 维持，保持", phonetic: "/meɪnˈteɪn/", difficulty: 3, category: "v", examType: "ielts" },
    { word: "manipulate", meaning: "v. 操纵，控制", phonetic: "/məˈnɪpjuleɪt/", difficulty: 5, category: "v", examType: "ielts" },
    { word: "mechanism", meaning: "n. 机制，机械装置", phonetic: "/ˈmekənɪzəm/", difficulty: 4, category: "n", examType: "ielts" },
    { word: "migrate", meaning: "v. 迁移，移居", phonetic: "/maɪˈɡreɪt/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "minimize", meaning: "v. 最小化，减少", phonetic: "/ˈmɪnɪmaɪz/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "modify", meaning: "v. 修改，调整", phonetic: "/ˈmɒdɪfaɪ/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "monitor", meaning: "v. 监控，监视", phonetic: "/ˈmɒnɪtə(r)/", difficulty: 3, category: "v", examType: "ielts" },
    { word: "motivate", meaning: "v. 激励，推动", phonetic: "/ˈməʊtɪveɪt/", difficulty: 4, category: "v", examType: "ielts" },
    { word: "neutral", meaning: "adj. 中性的，中立的", phonetic: "/ˈnjuːtrəl/", difficulty: 4, category: "adj", examType: "ielts" },
    { word: "objective", meaning: "adj. 客观的 n. 目标", phonetic: "/əbˈdʒektɪv/", difficulty: 4, category: "adj", examType: "ielts" },
    { word: "obtain", meaning: "v. 获得，取得", phonetic: "/əbˈteɪn/", difficulty: 3, category: "v", examType: "ielts" }
];

console.log(`🚀 Starting IELTS vocabulary batch update...`);

// 读取现有文件
let existingWords = [];
try {
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    const match = fileContent.match(/const ieltsWords = (\[[\s\S]*?\]);/);
    if (match) {
        existingWords = JSON.parse(match[1]);
        console.log(`✅ Successfully read ${existingWords.length} existing words.`);
    }
} catch (error) {
    console.error(`❌ Error reading existing file: ${error.message}`);
    existingWords = [];
}

// 合并词汇
const wordMap = new Map();
for (const word of existingWords) {
    if (word && word.word) {
        wordMap.set(word.word.toLowerCase(), word);
    }
}

let newCount = 0;
let updatedCount = 0;
for (const newWord of newWords) {
    const key = newWord.word.toLowerCase();
    if (wordMap.has(key)) {
        updatedCount++;
    } else {
        newCount++;
    }
    wordMap.set(key, newWord);
}

const finalWords = Array.from(wordMap.values());
console.log(`Added ${newCount} new words, updated ${updatedCount} existing words.`);
console.log(`Final vocabulary size: ${finalWords.length}`);

// 写入文件
const finalFileContent = `const ieltsWords = ${JSON.stringify(finalWords, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ieltsWords;
}`;

try {
    fs.writeFileSync(targetFile, finalFileContent, 'utf8');
    console.log(`🎉 Successfully updated IELTS vocabulary!`);
} catch (error) {
    console.error(`❌ Error writing to file: ${error.message}`);
}
