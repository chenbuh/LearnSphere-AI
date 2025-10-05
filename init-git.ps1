# LearnSphere AI Git 初始化脚本
# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "正在初始化 LearnSphere AI 项目的Git仓库..." -ForegroundColor Green

try {
    # 检查是否已经是Git仓库
    if (Test-Path ".git") {
        Write-Host "Git仓库已存在！" -ForegroundColor Yellow
    } else {
        # 初始化Git仓库
        Write-Host "初始化Git仓库..." -ForegroundColor Cyan
        git init
        
        # 配置Git用户信息
        Write-Host "配置Git用户信息..." -ForegroundColor Cyan
        git config user.name "LearnSphere Developer"
        git config user.email "developer@learnsphere.local"
        
        Write-Host "Git仓库初始化完成！" -ForegroundColor Green
    }
    
    # 添加所有文件到暂存区
    Write-Host "添加文件到暂存区..." -ForegroundColor Cyan
    git add .
    
    # 检查是否有文件需要提交
    $status = git status --porcelain
    if ($status) {
        # 进行初始提交
        Write-Host "进行初始提交..." -ForegroundColor Cyan
        git commit -m "Initial commit: LearnSphere AI 英语学习平台初始版本"
        
        # 创建备份分支
        Write-Host "创建备份分支..." -ForegroundColor Cyan
        git checkout -b backup-main
        git checkout main
        
        Write-Host "`n=== Git 仓库设置完成！===" -ForegroundColor Green
    } else {
        Write-Host "没有文件需要提交。" -ForegroundColor Yellow
    }
    
    # 显示当前状态
    Write-Host "`n当前Git状态：" -ForegroundColor Magenta
    git status --short
    
    Write-Host "`n常用Git命令：" -ForegroundColor Yellow
    Write-Host "  git status              - 查看文件状态"
    Write-Host "  git add .               - 添加所有修改的文件"
    Write-Host "  git commit -m '消息'    - 提交更改"
    Write-Host "  git log --oneline       - 查看提交历史"
    Write-Host "  git checkout backup-main - 切换到备份分支"
    Write-Host "  git reset --hard HEAD~1  - 回滚到上一个提交"
    
} catch {
    Write-Host "错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "请确保已安装Git并添加到系统PATH中。" -ForegroundColor Red
}

Write-Host "`n按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
