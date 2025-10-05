const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/data/tem8_words.js');

// TEM-8核心词汇 - 35个高级词汇
const newWords = [
    { word: "aberration", meaning: "n. 偏差，异常", phonetic: "/ˌæbəˈreɪʃn/", difficulty: 5, category: "n", examType: "tem8" },
    { word: "abscond", meaning: "v. 潜逃，逃匿", phonetic: "/æbˈskɒnd/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "accentuate", meaning: "v. 强调，突出", phonetic: "/əkˈsentʃueɪt/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "acquiesce", meaning: "v. 默许，顺从", phonetic: "/ˌækwiˈes/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "admonish", meaning: "v. 告诫，劝告", phonetic: "/ədˈmɒnɪʃ/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "alleviate", meaning: "v. 减轻，缓解", phonetic: "/əˈliːvieɪt/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "ambivalent", meaning: "adj. 矛盾的，摇摆不定的", phonetic: "/æmˈbɪvələnt/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "anomaly", meaning: "n. 异常，反常", phonetic: "/əˈnɒməli/", difficulty: 5, category: "n", examType: "tem8" },
    { word: "articulate", meaning: "adj. 善于表达的 v. 清楚地表达", phonetic: "/ɑːˈtɪkjələt/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "assiduous", meaning: "adj. 勤勉的，刻苦的", phonetic: "/əˈsɪdjuəs/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "astute", meaning: "adj. 机敏的，精明的", phonetic: "/əˈstjuːt/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "augment", meaning: "v. 增加，增大", phonetic: "/ɔːɡˈment/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "auspicious", meaning: "adj. 吉利的，有利的", phonetic: "/ɔːˈspɪʃəs/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "belligerent", meaning: "adj. 好战的，挑衅的", phonetic: "/bəˈlɪdʒərənt/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "benevolent", meaning: "adj. 仁慈的，善意的", phonetic: "/bəˈnevələnt/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "candid", meaning: "adj. 坦率的，直率的", phonetic: "/ˈkændɪd/", difficulty: 4, category: "adj", examType: "tem8" },
    { word: "capitulate", meaning: "v. 投降，屈服", phonetic: "/kəˈpɪtʃuleɪt/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "coerce", meaning: "v. 强迫，胁迫", phonetic: "/kəʊˈɜːs/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "cogitate", meaning: "v. 思考，沉思", phonetic: "/ˈkɒdʒɪteɪt/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "complacent", meaning: "adj. 自满的，得意的", phonetic: "/kəmˈpleɪsnt/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "conciliatory", meaning: "adj. 安抚的，调解的", phonetic: "/kənˈsɪliətəri/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "condescend", meaning: "v. 屈尊，俯就", phonetic: "/ˌkɒndɪˈsend/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "congenial", meaning: "adj. 意气相投的，友善的", phonetic: "/kənˈdʒiːniəl/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "conjecture", meaning: "n./v. 推测，猜想", phonetic: "/kənˈdʒektʃə(r)/", difficulty: 5, category: "n", examType: "tem8" },
    { word: "conscientious", meaning: "adj. 认真的，尽责的", phonetic: "/ˌkɒnʃiˈenʃəs/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "contemplate", meaning: "v. 沉思，考虑", phonetic: "/ˈkɒntəmpleɪt/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "corroborate", meaning: "v. 证实，确证", phonetic: "/kəˈrɒbəreɪt/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "credulous", meaning: "adj. 轻信的，易受骗的", phonetic: "/ˈkredjələs/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "culminate", meaning: "v. 达到顶点，告终", phonetic: "/ˈkʌlmɪneɪt/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "debilitate", meaning: "v. 使衰弱，使虚弱", phonetic: "/dɪˈbɪlɪteɪt/", difficulty: 5, category: "v", examType: "tem8" },
    { word: "deference", meaning: "n. 尊重，顺从", phonetic: "/ˈdefərəns/", difficulty: 5, category: "n", examType: "tem8" },
    { word: "deliberate", meaning: "adj. 故意的 v. 深思", phonetic: "/dɪˈlɪbərət/", difficulty: 4, category: "adj", examType: "tem8" },
    { word: "discernible", meaning: "adj. 可辨别的，看得出的", phonetic: "/dɪˈsɜːnəbl/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "eloquent", meaning: "adj. 雄辩的，有说服力的", phonetic: "/ˈeləkwənt/", difficulty: 5, category: "adj", examType: "tem8" },
    { word: "empirical", meaning: "adj. 经验的，实证的", phonetic: "/ɪmˈpɪrɪkl/", difficulty: 5, category: "adj", examType: "tem8" }
];

console.log(`🚀 Starting TEM-8 vocabulary batch update...`);

// 读取现有文件
let existingWords = [];
try {
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    const match = fileContent.match(/const tem8Words = (\[[\s\S]*?\]);/);
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
const finalFileContent = `const tem8Words = ${JSON.stringify(finalWords, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = tem8Words;
}`;

try {
    fs.writeFileSync(targetFile, finalFileContent, 'utf8');
    console.log(`🎉 Successfully updated TEM-8 vocabulary!`);
} catch (error) {
    console.error(`❌ Error writing to file: ${error.message}`);
}
