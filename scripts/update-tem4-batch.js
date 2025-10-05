const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/data/tem4_words.js');

// TEM-4核心词汇 - 30个
const newWords = [
    { word: "accomplish", meaning: "v. 完成，实现", phonetic: "/əˈkʌmplɪʃ/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "acknowledge", meaning: "v. 承认，确认", phonetic: "/əkˈnɒlɪdʒ/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "adequate", meaning: "adj. 足够的，胜任的", phonetic: "/ˈædɪkwət/", difficulty: 4, category: "adj", examType: "tem4" },
    { word: "advocate", meaning: "v. 提倡，拥护", phonetic: "/ˈædvəkeɪt/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "anticipate", meaning: "v. 预期，预料", phonetic: "/ænˈtɪsɪpeɪt/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "appreciate", meaning: "v. 欣赏，感激", phonetic: "/əˈpriːʃieɪt/", difficulty: 3, category: "v", examType: "tem4" },
    { word: "arbitrary", meaning: "adj. 任意的，武断的", phonetic: "/ˈɑːbɪtrəri/", difficulty: 5, category: "adj", examType: "tem4" },
    { word: "assemble", meaning: "v. 集合，装配", phonetic: "/əˈsembl/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "attribute", meaning: "v. 归因于 n. 属性", phonetic: "/əˈtrɪbjuːt/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "capacity", meaning: "n. 能力，容量", phonetic: "/kəˈpæsəti/", difficulty: 3, category: "n", examType: "tem4" },
    { word: "category", meaning: "n. 类别，种类", phonetic: "/ˈkætəɡəri/", difficulty: 3, category: "n", examType: "tem4" },
    { word: "circumstance", meaning: "n. 环境，情况", phonetic: "/ˈsɜːkəmstæns/", difficulty: 4, category: "n", examType: "tem4" },
    { word: "colleague", meaning: "n. 同事，同僚", phonetic: "/ˈkɒliːɡ/", difficulty: 3, category: "n", examType: "tem4" },
    { word: "commence", meaning: "v. 开始，着手", phonetic: "/kəˈmens/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "compensate", meaning: "v. 补偿，赔偿", phonetic: "/ˈkɒmpenseɪt/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "comprehensive", meaning: "adj. 全面的，综合的", phonetic: "/ˌkɒmprɪˈhensɪv/", difficulty: 4, category: "adj", examType: "tem4" },
    { word: "constitute", meaning: "v. 构成，组成", phonetic: "/ˈkɒnstɪtjuːt/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "contemporary", meaning: "adj. 当代的，现代的", phonetic: "/kənˈtempərəri/", difficulty: 4, category: "adj", examType: "tem4" },
    { word: "controversy", meaning: "n. 争论，辩论", phonetic: "/ˈkɒntrəvɜːsi/", difficulty: 4, category: "n", examType: "tem4" },
    { word: "coordinate", meaning: "v. 协调，配合", phonetic: "/kəʊˈɔːdɪneɪt/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "criteria", meaning: "n. 标准，准则", phonetic: "/kraɪˈtɪəriə/", difficulty: 4, category: "n", examType: "tem4" },
    { word: "demonstrate", meaning: "v. 证明，演示", phonetic: "/ˈdemənstreɪt/", difficulty: 3, category: "v", examType: "tem4" },
    { word: "dimension", meaning: "n. 尺寸，方面", phonetic: "/daɪˈmenʃn/", difficulty: 4, category: "n", examType: "tem4" },
    { word: "eliminate", meaning: "v. 消除，排除", phonetic: "/ɪˈlɪmɪneɪt/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "emphasis", meaning: "n. 强调，重点", phonetic: "/ˈemfəsɪs/", difficulty: 4, category: "n", examType: "tem4" },
    { word: "equivalent", meaning: "adj. 等价的，相等的", phonetic: "/ɪˈkwɪvələnt/", difficulty: 4, category: "adj", examType: "tem4" },
    { word: "establish", meaning: "v. 建立，确立", phonetic: "/ɪˈstæblɪʃ/", difficulty: 3, category: "v", examType: "tem4" },
    { word: "evaluate", meaning: "v. 评价，评估", phonetic: "/ɪˈvæljueɪt/", difficulty: 4, category: "v", examType: "tem4" },
    { word: "facilitate", meaning: "v. 促进，使便利", phonetic: "/fəˈsɪlɪteɪt/", difficulty: 5, category: "v", examType: "tem4" },
    { word: "fundamental", meaning: "adj. 基本的，根本的", phonetic: "/ˌfʌndəˈmentl/", difficulty: 4, category: "adj", examType: "tem4" }
];

console.log(`🚀 Starting TEM-4 vocabulary batch update...`);

// 读取现有文件
let existingWords = [];
try {
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    const match = fileContent.match(/const tem4Words = (\[[\s\S]*?\]);/);
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
const finalFileContent = `const tem4Words = ${JSON.stringify(finalWords, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = tem4Words;
}`;

try {
    fs.writeFileSync(targetFile, finalFileContent, 'utf8');
    console.log(`🎉 Successfully updated TEM-4 vocabulary!`);
} catch (error) {
    console.error(`❌ Error writing to file: ${error.message}`);
}
