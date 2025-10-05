const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/data/postgraduate_words.js');

// 第一批考研核心词汇 - 50个
const newWords = [
    { word: "deteriorate", meaning: "v. 恶化，变坏", phonetic: "/dɪˈtɪəriəreɪt/", difficulty: 5, category: "v", examType: "postgraduate" },
    { word: "deviate", meaning: "v. 偏离，背离", phonetic: "/ˈdiːvieɪt/", difficulty: 5, category: "v", examType: "postgraduate" },
    { word: "dilemma", meaning: "n. 困境，进退两难", phonetic: "/dɪˈlemə/", difficulty: 4, category: "n", examType: "postgraduate" },
    { word: "diminish", meaning: "v. 减少，缩小", phonetic: "/dɪˈmɪnɪʃ/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "discard", meaning: "v. 丢弃，抛弃", phonetic: "/dɪsˈkɑːd/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "discourse", meaning: "n. 论述，演讲", phonetic: "/ˈdɪskɔːs/", difficulty: 5, category: "n", examType: "postgraduate" },
    { word: "discrete", meaning: "adj. 分离的，不连续的", phonetic: "/dɪˈskriːt/", difficulty: 5, category: "adj", examType: "postgraduate" },
    { word: "discriminate", meaning: "v. 歧视，区别", phonetic: "/dɪˈskrɪmɪneɪt/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "disperse", meaning: "v. 分散，散布", phonetic: "/dɪˈspɜːs/", difficulty: 5, category: "v", examType: "postgraduate" },
    { word: "dispose", meaning: "v. 处理，安排", phonetic: "/dɪˈspəʊz/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "distinct", meaning: "adj. 明显的，独特的", phonetic: "/dɪˈstɪŋkt/", difficulty: 4, category: "adj", examType: "postgraduate" },
    { word: "distort", meaning: "v. 扭曲，歪曲", phonetic: "/dɪˈstɔːt/", difficulty: 5, category: "v", examType: "postgraduate" },
    { word: "diverse", meaning: "adj. 多样的，不同的", phonetic: "/daɪˈvɜːs/", difficulty: 4, category: "adj", examType: "postgraduate" },
    { word: "domain", meaning: "n. 领域，范围", phonetic: "/dəˈmeɪn/", difficulty: 4, category: "n", examType: "postgraduate" },
    { word: "domestic", meaning: "adj. 国内的，家庭的", phonetic: "/dəˈmestɪk/", difficulty: 3, category: "adj", examType: "postgraduate" },
    { word: "dominant", meaning: "adj. 占主导地位的", phonetic: "/ˈdɒmɪnənt/", difficulty: 4, category: "adj", examType: "postgraduate" },
    { word: "donate", meaning: "v. 捐赠，捐献", phonetic: "/dəʊˈneɪt/", difficulty: 3, category: "v", examType: "postgraduate" },
    { word: "dramatic", meaning: "adj. 戏剧性的，引人注目的", phonetic: "/drəˈmætɪk/", difficulty: 3, category: "adj", examType: "postgraduate" },
    { word: "duration", meaning: "n. 持续时间", phonetic: "/djʊˈreɪʃn/", difficulty: 4, category: "n", examType: "postgraduate" },
    { word: "dynamic", meaning: "adj. 动态的，有活力的", phonetic: "/daɪˈnæmɪk/", difficulty: 4, category: "adj", examType: "postgraduate" },
    { word: "elaborate", meaning: "adj. 精心制作的 v. 详述", phonetic: "/ɪˈlæbərət/", difficulty: 5, category: "adj", examType: "postgraduate" },
    { word: "eliminate", meaning: "v. 消除，排除", phonetic: "/ɪˈlɪmɪneɪt/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "emerge", meaning: "v. 出现，浮现", phonetic: "/ɪˈmɜːdʒ/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "emphasis", meaning: "n. 强调，重点", phonetic: "/ˈemfəsɪs/", difficulty: 4, category: "n", examType: "postgraduate" },
    { word: "enable", meaning: "v. 使能够，使可能", phonetic: "/ɪˈneɪbl/", difficulty: 3, category: "v", examType: "postgraduate" },
    { word: "encounter", meaning: "v. 遇到，遭遇", phonetic: "/ɪnˈkaʊntə(r)/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "enhance", meaning: "v. 提高，增强", phonetic: "/ɪnˈhɑːns/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "enormous", meaning: "adj. 巨大的，庞大的", phonetic: "/ɪˈnɔːməs/", difficulty: 3, category: "adj", examType: "postgraduate" },
    { word: "ensure", meaning: "v. 确保，保证", phonetic: "/ɪnˈʃʊə(r)/", difficulty: 3, category: "v", examType: "postgraduate" },
    { word: "entity", meaning: "n. 实体，存在", phonetic: "/ˈentəti/", difficulty: 5, category: "n", examType: "postgraduate" },
    { word: "equivalent", meaning: "adj. 等价的，相等的", phonetic: "/ɪˈkwɪvələnt/", difficulty: 4, category: "adj", examType: "postgraduate" },
    { word: "erode", meaning: "v. 侵蚀，腐蚀", phonetic: "/ɪˈrəʊd/", difficulty: 5, category: "v", examType: "postgraduate" },
    { word: "establish", meaning: "v. 建立，确立", phonetic: "/ɪˈstæblɪʃ/", difficulty: 3, category: "v", examType: "postgraduate" },
    { word: "estimate", meaning: "v. 估计，评估", phonetic: "/ˈestɪmeɪt/", difficulty: 3, category: "v", examType: "postgraduate" },
    { word: "ethnic", meaning: "adj. 种族的，民族的", phonetic: "/ˈeθnɪk/", difficulty: 4, category: "adj", examType: "postgraduate" },
    { word: "evaluate", meaning: "v. 评价，评估", phonetic: "/ɪˈvæljueɪt/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "evident", meaning: "adj. 明显的，显然的", phonetic: "/ˈevɪdənt/", difficulty: 3, category: "adj", examType: "postgraduate" },
    { word: "evolve", meaning: "v. 进化，发展", phonetic: "/ɪˈvɒlv/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "exceed", meaning: "v. 超过，胜过", phonetic: "/ɪkˈsiːd/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "exclude", meaning: "v. 排除，不包括", phonetic: "/ɪkˈskluːd/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "execute", meaning: "v. 执行，实施", phonetic: "/ˈeksɪkjuːt/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "exhibit", meaning: "v. 展示，表现", phonetic: "/ɪɡˈzɪbɪt/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "expand", meaning: "v. 扩大，扩展", phonetic: "/ɪkˈspænd/", difficulty: 3, category: "v", examType: "postgraduate" },
    { word: "exploit", meaning: "v. 开发，利用", phonetic: "/ɪkˈsplɔɪt/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "expose", meaning: "v. 暴露，揭露", phonetic: "/ɪkˈspəʊz/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "external", meaning: "adj. 外部的，外在的", phonetic: "/ɪkˈstɜːnl/", difficulty: 4, category: "adj", examType: "postgraduate" },
    { word: "extract", meaning: "v. 提取，摘录", phonetic: "/ɪkˈstrækt/", difficulty: 4, category: "v", examType: "postgraduate" },
    { word: "facilitate", meaning: "v. 促进，使便利", phonetic: "/fəˈsɪlɪteɪt/", difficulty: 5, category: "v", examType: "postgraduate" },
    { word: "factor", meaning: "n. 因素，要素", phonetic: "/ˈfæktə(r)/", difficulty: 3, category: "n", examType: "postgraduate" },
    { word: "feature", meaning: "n. 特征，特色", phonetic: "/ˈfiːtʃə(r)/", difficulty: 3, category: "n", examType: "postgraduate" }
];

console.log(`🚀 Starting Postgraduate vocabulary batch update...`);

// 读取现有文件
let existingWords = [];
try {
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    const match = fileContent.match(/const postgraduateWords = (\[[\s\S]*?\]);/);
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
const finalFileContent = `const postgraduateWords = ${JSON.stringify(finalWords, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = postgraduateWords;
}`;

try {
    fs.writeFileSync(targetFile, finalFileContent, 'utf8');
    console.log(`🎉 Successfully updated postgraduate vocabulary!`);
} catch (error) {
    console.error(`❌ Error writing to file: ${error.message}`);
}
