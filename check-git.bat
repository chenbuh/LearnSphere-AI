@echo off
chcp 65001
echo Checking Git repository status...
echo.

rem Check if .git folder exists
if exist ".git" (
    echo [OK] Git repository is initialized
    echo.
    
    echo Current branch:
    git branch
    echo.
    
    echo Commit history:
    git log --oneline
    echo.
    
    echo Repository status:
    git status
    echo.
    
    echo Git configuration:
    git config user.name
    git config user.email
    
) else (
    echo [ERROR] Git repository not initialized
    echo Please run init-git.bat to initialize Git repository
)

echo.
echo .git folder location: %CD%\.git
echo Project files location: %CD%
echo.
pause
