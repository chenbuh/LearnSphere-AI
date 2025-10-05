# 解析六级.md文件并合并四级词汇创建完整的六级词汇库
Write-Host "开始处理六级词汇（包含四级词汇）..."

# 1. 先读取四级词汇
Write-Host "读取四级词汇..."
$cet4Content = Get-Content "src/data/cet4_words.js" -Encoding UTF8
$cet4Words = @()

foreach ($line in $cet4Content) {
    if ($line -match 'word: "([^"]+)", meaning: "([^"]+)", phonetic: "([^"]+)"') {
        $word = $matches[1]
        $meaning = $matches[2]
        $phonetic = $matches[3]
        
        # 将四级词汇转换为六级格式（提高难度等级）
        $wordObj = "    { word: `"$word`", meaning: `"$meaning`", phonetic: `"$phonetic`", difficulty: 3, category: `"n`", examType: `"cet6`" }"
        $cet4Words += $wordObj
    }
}

Write-Host "四级词汇数量: $($cet4Words.Count)"

# 2. 解析六级特有词汇
Write-Host "解析六级特有词汇..."
$cet6Content = Get-Content "六级.md" -Encoding UTF8
$cet6NewWords = @()
$wordCount = 0

foreach ($line in $cet6Content) {
    $line = $line.Trim()
    
    # 匹配各种六级词汇格式
    if ($line -match "([a-zA-Z]{2,})\s+(n|v|vi|vt|adj|adv|prep|conj|ad)\.([^a-zA-Z]+)([^[:alpha:]]+.*)$") {
        $word = $matches[1].ToLower()
        $category = $matches[2]
        $meaning = $matches[4].Trim()
        
        # 清理释义
        $meaning = $meaning -replace "^\s*", "" -replace "\s+", " "
        $meaning = ($meaning -split "\s+")[0..3] -join " "
        $meaning = $meaning -replace "[，。；：].*$", ""
        
        # 生成音标（简化处理）
        $phonetic = "/$word/"
        
        # 确定词性类别
        $finalCategory = "n"
        switch ($category) {
            "n" { $finalCategory = "n" }
            "v" { $finalCategory = "v" }
            "vi" { $finalCategory = "v" }
            "vt" { $finalCategory = "v" }
            "adj" { $finalCategory = "adj" }
            "adv" { $finalCategory = "adv" }
            "ad" { $finalCategory = "adv" }
            "prep" { $finalCategory = "prep" }
            "conj" { $finalCategory = "conj" }
        }
        
        $wordObj = "    { word: `"$word`", meaning: `"$meaning`", phonetic: `"$phonetic`", difficulty: 4, category: `"$finalCategory`", examType: `"cet6`" }"
        $cet6NewWords += $wordObj
        $wordCount++
        
        if ($wordCount % 200 -eq 0) {
            Write-Host "已处理六级词汇: $wordCount 个"
        }
    }
}

Write-Host "六级特有词汇数量: $($cet6NewWords.Count)"

# 3. 合并所有词汇并去重
Write-Host "合并词汇并去重..."
$allWords = $cet4Words + $cet6NewWords
$uniqueWords = @{}
$finalWords = @()

foreach ($wordLine in $allWords) {
    if ($wordLine -match 'word: "([^"]+)"') {
        $word = $matches[1]
        if (-not $uniqueWords.ContainsKey($word)) {
            $uniqueWords[$word] = $true
            $finalWords += $wordLine
        }
    }
}

Write-Host "去重后总词汇数量: $($finalWords.Count)"

# 4. 分批写入文件
Write-Host "开始分批写入文件..."
$batchSize = 1000
$totalBatches = [Math]::Ceiling($finalWords.Count / $batchSize)

for ($batch = 0; $batch -lt $totalBatches; $batch++) {
    $start = $batch * $batchSize
    $end = [Math]::Min(($batch + 1) * $batchSize - 1, $finalWords.Count - 1)
    
    Write-Host "写入第 $($batch + 1) 批，词汇 $($start + 1) 到 $($end + 1)"
    
    if ($batch -eq 0) {
        # 第一批：重写整个文件
        $content = @"
const cet6Words = [
$($finalWords[$start..$end] -join ",`n")
];

// 导出词汇数据
if (typeof module !== "undefined" && module.exports) {
    module.exports = cet6Words;
} else if (typeof window !== "undefined") {
    window.cet6Words = cet6Words;
}
"@
    } else {
        # 后续批次：在数组末尾插入
        $currentContent = Get-Content "src/data/cet6_words.js" -Raw
        $newWords = $finalWords[$start..$end] -join ",`n"
        $content = $currentContent -replace "(\];)", ",`n$newWords`n];"
    }
    
    $content | Out-File -FilePath "src/data/cet6_words.js" -Encoding UTF8 -NoNewline
    Start-Sleep -Seconds 1
}

Write-Host "所有词汇写入完成！"
$verify = (Get-Content "src/data/cet6_words.js" | Select-String "word:").Count
Write-Host "验证: 文件中包含 $verify 个词汇"
