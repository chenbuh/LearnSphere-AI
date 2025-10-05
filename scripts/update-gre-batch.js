const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/data/gre_words.js');

// GRE核心词汇 - 35个高难度词汇
const newWords = [
    { word: "abstruse", meaning: "adj. 深奥的，难懂的", phonetic: "/æbˈstruːs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "acrimonious", meaning: "adj. 尖刻的，激烈的", phonetic: "/ˌækrɪˈməʊniəs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "ameliorate", meaning: "v. 改善，改进", phonetic: "/əˈmiːliəreɪt/", difficulty: 6, category: "v", examType: "gre" },
    { word: "anachronism", meaning: "n. 时代错误，过时的事物", phonetic: "/əˈnækrənɪzəm/", difficulty: 6, category: "n", examType: "gre" },
    { word: "antipathy", meaning: "n. 反感，厌恶", phonetic: "/ænˈtɪpəθi/", difficulty: 6, category: "n", examType: "gre" },
    { word: "approbation", meaning: "n. 赞许，认可", phonetic: "/ˌæprəˈbeɪʃn/", difficulty: 6, category: "n", examType: "gre" },
    { word: "assuage", meaning: "v. 缓解，减轻", phonetic: "/əˈsweɪdʒ/", difficulty: 6, category: "v", examType: "gre" },
    { word: "austerity", meaning: "n. 严峻，朴素", phonetic: "/ɔːˈsterəti/", difficulty: 6, category: "n", examType: "gre" },
    { word: "avarice", meaning: "n. 贪婪，贪心", phonetic: "/ˈævərɪs/", difficulty: 6, category: "n", examType: "gre" },
    { word: "bombastic", meaning: "adj. 夸大的，浮夸的", phonetic: "/bɒmˈbæstɪk/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "capricious", meaning: "adj. 反复无常的", phonetic: "/kəˈprɪʃəs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "chicanery", meaning: "n. 欺骗，诡计", phonetic: "/ʃɪˈkeɪnəri/", difficulty: 6, category: "n", examType: "gre" },
    { word: "circumlocution", meaning: "n. 冗长的说法", phonetic: "/ˌsɜːkəmləˈkjuːʃn/", difficulty: 6, category: "n", examType: "gre" },
    { word: "cogent", meaning: "adj. 有说服力的", phonetic: "/ˈkəʊdʒənt/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "commensurate", meaning: "adj. 相称的，相当的", phonetic: "/kəˈmenʃərət/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "conundrum", meaning: "n. 难题，谜语", phonetic: "/kəˈnʌndrəm/", difficulty: 6, category: "n", examType: "gre" },
    { word: "corroborate", meaning: "v. 证实，确证", phonetic: "/kəˈrɒbəreɪt/", difficulty: 6, category: "v", examType: "gre" },
    { word: "deleterious", meaning: "adj. 有害的，有毒的", phonetic: "/ˌdeləˈtɪəriəs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "demagogue", meaning: "n. 煽动者，政治家", phonetic: "/ˈdeməɡɒɡ/", difficulty: 6, category: "n", examType: "gre" },
    { word: "desiccate", meaning: "v. 使干燥，脱水", phonetic: "/ˈdesɪkeɪt/", difficulty: 6, category: "v", examType: "gre" },
    { word: "dichotomy", meaning: "n. 二分法，对立", phonetic: "/daɪˈkɒtəmi/", difficulty: 6, category: "n", examType: "gre" },
    { word: "dilatory", meaning: "adj. 拖延的，缓慢的", phonetic: "/ˈdɪlətəri/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "ebullient", meaning: "adj. 热情洋溢的", phonetic: "/ɪˈbʌliənt/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "efficacious", meaning: "adj. 有效的，灵验的", phonetic: "/ˌefɪˈkeɪʃəs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "ephemeral", meaning: "adj. 短暂的，瞬息的", phonetic: "/ɪˈfemərəl/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "equivocate", meaning: "v. 模糊其辞，支吾", phonetic: "/ɪˈkwɪvəkeɪt/", difficulty: 6, category: "v", examType: "gre" },
    { word: "erudite", meaning: "adj. 博学的，有学问的", phonetic: "/ˈeruːdaɪt/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "exacerbate", meaning: "v. 恶化，加剧", phonetic: "/ɪɡˈzæsəbeɪt/", difficulty: 6, category: "v", examType: "gre" },
    { word: "fastidious", meaning: "adj. 挑剔的，苛求的", phonetic: "/fæˈstɪdiəs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "garrulous", meaning: "adj. 喋喋不休的", phonetic: "/ˈɡærələs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "gregarious", meaning: "adj. 群居的，爱社交的", phonetic: "/ɡrɪˈɡeəriəs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "hackneyed", meaning: "adj. 陈腐的，老套的", phonetic: "/ˈhæknid/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "iconoclast", meaning: "n. 破坏传统者", phonetic: "/aɪˈkɒnəklæst/", difficulty: 6, category: "n", examType: "gre" },
    { word: "impecunious", meaning: "adj. 贫困的，身无分文的", phonetic: "/ˌɪmpɪˈkjuːniəs/", difficulty: 6, category: "adj", examType: "gre" },
    { word: "intransigent", meaning: "adj. 顽固的，不妥协的", phonetic: "/ɪnˈtrænsɪdʒənt/", difficulty: 6, category: "adj", examType: "gre" }
];

console.log(`🚀 Starting GRE vocabulary batch update...`);

// 读取现有文件
let existingWords = [];
try {
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    const match = fileContent.match(/const greWords = (\[[\s\S]*?\]);/);
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
const finalFileContent = `const greWords = ${JSON.stringify(finalWords, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = greWords;
}`;

try {
    fs.writeFileSync(targetFile, finalFileContent, 'utf8');
    console.log(`🎉 Successfully updated GRE vocabulary!`);
} catch (error) {
    console.error(`❌ Error writing to file: ${error.message}`);
}
