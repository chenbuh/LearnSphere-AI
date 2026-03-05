/**
 * TEM-4 音标格式修复脚本
 * 将旧式音标符号转换为标准 IPA 国际音标
 */

import fs from 'fs'

// 旧式音标到新式 IPA 的映射表
const oldToNewIPA = {
    'E': 'ə',    // schwa
    'R': 'ɜː',   // long stressed schwa
    'i': 'ɪ',    // short i (kit)
    'A': 'æ',    // ash (trap)
    'O': 'ɒ',    // lot (cloth)
    'U': 'ʊ',    // foot
    '@': 'ə',    // alternate schwa
    'V': 'ʌ',    // strut
    'I': 'aɪ',   // price
    'E:': 'eɪ',  // face
    'U:': 'uː',  // goose
    'O:': 'ɔː',  // thought
    'A:': 'ɑː',  // palm
    'Q': 'ɑː',   // palm alternate
    '9': 'ɔː',   // thought alternate
}

/**
 * 转换单个音标字符串
 */
function convertPhonetic(phonetic) {
    if (!phonetic || phonetic === '') return phonetic

    let converted = phonetic

    // 按照长度降序替换，避免短符号替换长符号的一部分
    const sortedKeys = Object.keys(oldToNewIPA).sort((a, b) => b.length - a.length)

    for (const old of sortedKeys) {
        const regex = new RegExp(old, 'g')
        converted = converted.replace(regex, oldToNewIPA[old])
    }

    return converted
}

/**
 * 处理 TEM-4 单词数据
 */
function fixTem4Phonetics(data) {
    const fixed = data.map(item => {
        if (item.phonetic && item.phonetic !== '') {
            item.phonetic = convertPhonetic(item.phonetic)
        }
        return item
    })
    return fixed
}

/**
 * 读取并修复 TEM-4 文件
 */
function fixTem4File(inputPath, outputPath) {
    console.log(`📖 读取文件: ${inputPath}`)

    const content = fs.readFileSync(inputPath, 'utf-8')

    // 提取数组部分
    const match = content.match(/export\s+const\s+tem4Words\s*=\s*(\[[\s\S]*?\]);/)

    if (!match) {
        console.error('❌ 无法找到 tem4Words 数组')
        return
    }

    try {
        // 解析数组
        const data = eval(match[1])

        console.log(`📊 找到 ${data.length} 个单词`)

        // 修复音标
        const fixed = fixTem4Phonetics(data)

        // 生成输出
        const output = `export const tem4Words = ${JSON.stringify(fixed, null, 2)};`

        fs.writeFileSync(outputPath, output, 'utf-8')

        console.log(`✅ 已保存到: ${outputPath}`)

        // 显示一些转换示例
        console.log('\n📝 转换示例:')
        const examples = [
            'academic',
            'accommodate',
            'accumulate',
            'accuracy',
            'accurate'
        ]

        examples.forEach(word => {
            const original = data.find(w => w.word === word)
            const fixedWord = fixed.find(w => w.word === word)
            if (original && fixedWord) {
                console.log(`  ${word}:`)
                console.log(`    ${original.phonetic} → ${fixedWord.phonetic}`)
            }
        })

    } catch (error) {
        console.error('❌ 处理文件时出错:', error.message)
    }
}

// 主函数
function main() {
    const inputFile = './tem4_words.js'
    const outputFile = './tem4_words_fixed.js'

    console.log('🔧 TEM-4 音标修复工具\n')

    // 检查输入文件
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ 文件不存在: ${inputFile}`)
        console.log('请确保在 frontend-vue/src/data 目录下运行此脚本')
        return
    }

    // 创建备份
    const backupFile = inputFile + '.backup'
    if (!fs.existsSync(backupFile)) {
        fs.copyFileSync(inputFile, backupFile)
        console.log(`📦 已创建备份: ${backupFile}\n`)
    }

    // 修复文件
    fixTem4File(inputFile, outputFile)

    console.log('\n✨ 完成！')
    console.log('\n下一步:')
    console.log(`1. 检查生成的文件: ${outputFile}`)
    console.log('2. 如果满意，将 tem4_words_fixed.js 重命名为 tem4_words.js')
    console.log('3. 如果有问题，可以从备份恢复: cp tem4_words.js.backup tem4_words.js')
}

main()
