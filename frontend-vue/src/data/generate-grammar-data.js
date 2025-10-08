/**
 * 批量生成语法练习数据的执行脚本
 */
const GrammarDataGenerator = require('./grammar-data-generator.js');
const fs = require('fs');
const path = require('path');

const generator = new GrammarDataGenerator();
const outputFile = path.join(__dirname, 'grammar-exercises.js');
const allQuestions = {};

const difficulties = ['basic', 'intermediate', 'advanced'];
const categories = Object.keys(generator.categories);
const countPerCombination = 200;

console.log('🚀 开始批量生成语法练习数据...');

categories.forEach(category => {
    allQuestions[category] = [];
    console.log(`\n📚 正在生成 "${generator.categories[category].name}" (${category}) 类别...`);

    difficulties.forEach(difficulty => {
        console.log(`  - 难度: ${difficulty}, 数量: ${countPerCombination}`);
        const questions = generator.generateQuestions(category, difficulty, countPerCombination);
        allQuestions[category].push(...questions);
    });
});

const fileContent = `/**
 * 语法练习题库
 * 自动生成的数据集
 * 生成时间: ${new Date().toISOString()}
 */
const grammarQuestions = ${JSON.stringify(allQuestions, null, 4)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = grammarQuestions;
} else if (typeof window !== 'undefined') {
    window.grammarQuestions = grammarQuestions;
}
`;

fs.writeFileSync(outputFile, fileContent, 'utf8');

console.log(`\n🎉 所有语法数据生成完成！`);
console.log(`✅ 数据已保存到: ${outputFile}`);
const total = Object.values(allQuestions).reduce((sum, cat) => sum + cat.length, 0);
console.log(`📊 总共生成题目: ${total} 道`);
