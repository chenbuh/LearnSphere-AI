const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/data/toefl_words.js');

// 第一批托福核心词汇 - 45个
const newWords = [
    { word: "paradigm", meaning: "n. 范式，模式", phonetic: "/ˈpærədaɪm/", difficulty: 5, category: "n", examType: "toefl" },
    { word: "perceive", meaning: "v. 感知，理解", phonetic: "/pəˈsiːv/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "persistent", meaning: "adj. 持续的，坚持的", phonetic: "/pəˈsɪstənt/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "phenomenon", meaning: "n. 现象，奇迹", phonetic: "/fəˈnɒmɪnən/", difficulty: 4, category: "n", examType: "toefl" },
    { word: "plausible", meaning: "adj. 似乎合理的", phonetic: "/ˈplɔːzəbl/", difficulty: 5, category: "adj", examType: "toefl" },
    { word: "potential", meaning: "adj. 潜在的 n. 潜力", phonetic: "/pəˈtenʃl/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "precise", meaning: "adj. 精确的，准确的", phonetic: "/prɪˈsaɪs/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "predominant", meaning: "adj. 主要的，占优势的", phonetic: "/prɪˈdɒmɪnənt/", difficulty: 5, category: "adj", examType: "toefl" },
    { word: "preliminary", meaning: "adj. 初步的，预备的", phonetic: "/prɪˈlɪmɪnəri/", difficulty: 5, category: "adj", examType: "toefl" },
    { word: "presume", meaning: "v. 假定，推测", phonetic: "/prɪˈzjuːm/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "principal", meaning: "adj. 主要的 n. 校长", phonetic: "/ˈprɪnsəpl/", difficulty: 3, category: "adj", examType: "toefl" },
    { word: "priority", meaning: "n. 优先权，重点", phonetic: "/praɪˈɒrəti/", difficulty: 4, category: "n", examType: "toefl" },
    { word: "procedure", meaning: "n. 程序，步骤", phonetic: "/prəˈsiːdʒə(r)/", difficulty: 3, category: "n", examType: "toefl" },
    { word: "profound", meaning: "adj. 深刻的，深远的", phonetic: "/prəˈfaʊnd/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "prominent", meaning: "adj. 突出的，著名的", phonetic: "/ˈprɒmɪnənt/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "proportion", meaning: "n. 比例，部分", phonetic: "/prəˈpɔːʃn/", difficulty: 4, category: "n", examType: "toefl" },
    { word: "prospect", meaning: "n. 前景，可能性", phonetic: "/ˈprɒspekt/", difficulty: 4, category: "n", examType: "toefl" },
    { word: "protocol", meaning: "n. 协议，礼仪", phonetic: "/ˈprəʊtəkɒl/", difficulty: 5, category: "n", examType: "toefl" },
    { word: "pursue", meaning: "v. 追求，从事", phonetic: "/pəˈsjuː/", difficulty: 3, category: "v", examType: "toefl" },
    { word: "qualitative", meaning: "adj. 定性的，质的", phonetic: "/ˈkwɒlɪtətɪv/", difficulty: 5, category: "adj", examType: "toefl" },
    { word: "quantitative", meaning: "adj. 定量的，量的", phonetic: "/ˈkwɒntɪtətɪv/", difficulty: 5, category: "adj", examType: "toefl" },
    { word: "radical", meaning: "adj. 根本的，激进的", phonetic: "/ˈrædɪkl/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "rational", meaning: "adj. 理性的，合理的", phonetic: "/ˈræʃənl/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "recover", meaning: "v. 恢复，康复", phonetic: "/rɪˈkʌvə(r)/", difficulty: 3, category: "v", examType: "toefl" },
    { word: "refine", meaning: "v. 精炼，改进", phonetic: "/rɪˈfaɪn/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "regulate", meaning: "v. 调节，管制", phonetic: "/ˈreɡjuleɪt/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "reinforce", meaning: "v. 加强，增援", phonetic: "/ˌriːɪnˈfɔːs/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "relevant", meaning: "adj. 相关的，切题的", phonetic: "/ˈreləvənt/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "reliable", meaning: "adj. 可靠的，可信的", phonetic: "/rɪˈlaɪəbl/", difficulty: 3, category: "adj", examType: "toefl" },
    { word: "reluctant", meaning: "adj. 不情愿的，勉强的", phonetic: "/rɪˈlʌktənt/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "remarkable", meaning: "adj. 显著的，非凡的", phonetic: "/rɪˈmɑːkəbl/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "represent", meaning: "v. 代表，象征", phonetic: "/ˌreprɪˈzent/", difficulty: 3, category: "v", examType: "toefl" },
    { word: "require", meaning: "v. 需要，要求", phonetic: "/rɪˈkwaɪə(r)/", difficulty: 2, category: "v", examType: "toefl" },
    { word: "research", meaning: "n./v. 研究，调查", phonetic: "/rɪˈsɜːtʃ/", difficulty: 2, category: "n", examType: "toefl" },
    { word: "resolve", meaning: "v. 解决，决心", phonetic: "/rɪˈzɒlv/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "resource", meaning: "n. 资源，财力", phonetic: "/rɪˈsɔːs/", difficulty: 3, category: "n", examType: "toefl" },
    { word: "respond", meaning: "v. 回应，反应", phonetic: "/rɪˈspɒnd/", difficulty: 3, category: "v", examType: "toefl" },
    { word: "restrict", meaning: "v. 限制，约束", phonetic: "/rɪˈstrɪkt/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "retain", meaning: "v. 保持，保留", phonetic: "/rɪˈteɪn/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "reveal", meaning: "v. 揭示，显示", phonetic: "/rɪˈviːl/", difficulty: 3, category: "v", examType: "toefl" },
    { word: "reverse", meaning: "v. 颠倒，逆转", phonetic: "/rɪˈvɜːs/", difficulty: 4, category: "v", examType: "toefl" },
    { word: "revise", meaning: "v. 修订，复习", phonetic: "/rɪˈvaɪz/", difficulty: 3, category: "v", examType: "toefl" },
    { word: "significant", meaning: "adj. 重要的，显著的", phonetic: "/sɪɡˈnɪfɪkənt/", difficulty: 4, category: "adj", examType: "toefl" },
    { word: "simulate", meaning: "v. 模拟，仿真", phonetic: "/ˈsɪmjuleɪt/", difficulty: 5, category: "v", examType: "toefl" },
    { word: "subsequent", meaning: "adj. 随后的，后来的", phonetic: "/ˈsʌbsɪkwənt/", difficulty: 5, category: "adj", examType: "toefl" }
];

console.log(`🚀 Starting TOEFL vocabulary batch update...`);

// 读取现有文件
let existingWords = [];
try {
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    const match = fileContent.match(/const toeflWords = (\[[\s\S]*?\]);/);
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
const finalFileContent = `const toeflWords = ${JSON.stringify(finalWords, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = toeflWords;
}`;

try {
    fs.writeFileSync(targetFile, finalFileContent, 'utf8');
    console.log(`🎉 Successfully updated TOEFL vocabulary!`);
} catch (error) {
    console.error(`❌ Error writing to file: ${error.message}`);
}
