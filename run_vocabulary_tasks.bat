@echo off
echo Starting Vocabulary Enhancement Process...
echo.

echo 1. Installing dependencies...
call npm install axios
echo.

echo 2. Running Duplicate Example Fixer (Fixes "This is useful for study" etc.)
echo This may take a while. You can see progress in the window.
start "Fix Vocabulary Examples" cmd /k "node scripts/complete_vocabulary_fix.js duplicates"

echo.
echo 3. Running Exam Vocabulary Initializer (Adds missing core words for exams)
echo This will add CET4, CET6, IELTS, TOEFL, GRE words.
start "Init Exam Vocab" cmd /k "node scripts/init_exam_vocabulary.js all"

echo.
echo Both scripts are running in separate windows.
echo You can close this window now.
pause
