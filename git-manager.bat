@echo off
chcp 65001
title Git Quick Commands - LearnSphere AI

:menu
cls
echo ========================================
echo    Git Quick Commands - LearnSphere AI
echo ========================================
echo.
echo 1. Check status (git status)
echo 2. Add and commit changes
echo 3. View commit history
echo 4. Switch to backup branch
echo 5. Switch to main branch
echo 6. Rollback to previous commit (DANGEROUS!)
echo 7. View all branches
echo 8. Exit
echo.
set /p choice="Please select an option (1-8): "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto commit
if "%choice%"=="3" goto history
if "%choice%"=="4" goto backup
if "%choice%"=="5" goto main
if "%choice%"=="6" goto rollback
if "%choice%"=="7" goto branches
if "%choice%"=="8" goto exit
goto menu

:status
echo.
echo Current Git status:
git status
echo.
pause
goto menu

:commit
echo.
set /p message="Enter commit message: "
if "%message%"=="" (
    echo Error: Commit message cannot be empty!
    pause
    goto menu
)
echo Adding all files...
git add .
echo Committing changes...
git commit -m "%message%"
echo.
echo Commit completed!
pause
goto menu

:history
echo.
echo Commit history:
git log --oneline -10
echo.
pause
goto menu

:backup
echo.
echo Switching to backup branch...
git checkout backup-main
echo Current branch:
git branch
pause
goto menu

:main
echo.
echo Switching to main branch...
git checkout main
echo Current branch:
git branch
pause
goto menu

:rollback
echo.
echo WARNING: This will permanently delete uncommitted changes!
echo Current commits:
git log --oneline -5
echo.
set /p confirm="Are you sure you want to rollback? (yes/no): "
if /i "%confirm%"=="yes" (
    git reset --hard HEAD~1
    echo Rollback completed!
) else (
    echo Rollback cancelled.
)
pause
goto menu

:branches
echo.
echo All branches:
git branch -a
echo.
pause
goto menu

:exit
echo Goodbye!
exit
