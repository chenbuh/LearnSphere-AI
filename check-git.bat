@echo off
chcp 65001
echo 检查Git仓库状态...
echo.

rem 检查.git文件夹是否存在
if exist ".git" (
    echo ✓ Git仓库已初始化
    echo.
    
    echo 当前分支：
    git branch
    echo.
    
    echo 提交历史：
    git log --oneline
    echo.
    
    echo 仓库状态：
    git status
    echo.
    
    echo Git配置：
    git config user.name
    git config user.email
    
) else (
    echo ✗ Git仓库未初始化
    echo 请运行 init-git.bat 来初始化Git仓库
)

echo.
echo .git文件夹位置: %CD%\.git
echo 项目文件位置: %CD%
echo.
pause
