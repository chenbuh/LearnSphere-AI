@echo off
chcp 65001
echo 正在初始化Git仓库...

rem 初始化Git仓库
git init

rem 配置Git用户信息（您可以根据需要修改）
git config user.name "LearnSphere Developer"
git config user.email "developer@learnsphere.local"

rem Add all files to staging area
echo Adding files to staging area...
git add .

rem Make initial commit
echo Making initial commit...
git commit -m "Initial commit: LearnSphere AI English Learning Platform"

rem Create backup branch
echo Creating backup branch...
git checkout -b backup-main 2>nul || echo Backup branch already exists
git checkout main

echo.
echo Git repository initialization completed!
echo.
echo Available Git commands:
echo   git status          - Check file status
echo   git add .           - Add all modified files
echo   git commit -m "msg" - Commit changes
echo   git log --oneline   - View commit history
echo   git checkout backup-main - Switch to backup branch
echo   git reset --hard HEAD~1  - Rollback to previous commit
echo.
pause
