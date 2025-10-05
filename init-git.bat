@echo off
chcp 65001
echo 正在初始化Git仓库...

rem 初始化Git仓库
git init

rem 配置Git用户信息（您可以根据需要修改）
git config user.name "LearnSphere Developer"
git config user.email "developer@learnsphere.local"

rem 添加所有文件到暂存区
echo 添加文件到暂存区...
git add .

rem 进行初始提交
echo 进行初始提交...
git commit -m "Initial commit: LearnSphere AI 英语学习平台初始版本"

rem 创建备份分支
echo 创建备份分支...
git checkout -b backup-main
git checkout main

echo.
echo Git仓库初始化完成！
echo.
echo 可用的Git命令：
echo   git status          - 查看文件状态
echo   git add .           - 添加所有修改的文件
echo   git commit -m "消息" - 提交更改
echo   git log --oneline   - 查看提交历史
echo   git checkout backup-main - 切换到备份分支
echo   git reset --hard HEAD~1  - 回滚到上一个提交
echo.
pause
