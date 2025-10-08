@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════════
echo   词汇完善工具
echo ═══════════════════════════════════════════════════════════
echo.

:menu
echo 请选择操作:
echo   1. 导入词汇到数据库（从JS文件）
echo   2. 完善词汇（使用免费API）
echo   3. 完善指定考试类型词汇
echo   4. 查看数据库词汇统计
echo   5. 退出
echo.
set /p choice=请输入选项 (1-5): 

if "%choice%"=="1" goto import
if "%choice%"=="2" goto enhance
if "%choice%"=="3" goto enhance_type
if "%choice%"=="4" goto stats
if "%choice%"=="5" goto end

echo 无效选项，请重新选择
goto menu

:import
echo.
echo 正在导入词汇到数据库...
node import_vocabulary_to_db.js
echo.
pause
goto menu

:enhance
echo.
echo 正在完善词汇（默认处理200个）...
node vocabulary_enhancer.js --limit=200
echo.
pause
goto menu

:enhance_type
echo.
echo 可选考试类型: cet4, cet6, toefl, ielts, gre, tem4, tem8, postgraduate, primary, middle_school, high_school, coca
set /p examtype=请输入考试类型: 
echo.
echo 正在完善 %examtype% 词汇...
node vocabulary_enhancer.js %examtype% --limit=100
echo.
pause
goto menu

:stats
echo.
echo 正在查询数据库统计...
node -e "const mysql=require('mysql2/promise');(async()=>{const c=await mysql.createConnection({host:'localhost',user:'root',password:'chen20040209',database:'learnsphere_ai'});const[r]=await c.execute('SELECT exam_type,COUNT(*) as cnt,SUM(CASE WHEN phonetic IS NULL OR phonetic=\"\" THEN 1 ELSE 0 END) as no_ph,SUM(CASE WHEN example IS NULL OR example=\"\" THEN 1 ELSE 0 END) as no_ex FROM vocabulary WHERE deleted=0 GROUP BY exam_type');console.log('考试类型\t总数\t缺音标\t缺例句');r.forEach(x=>console.log(x.exam_type+'\t'+x.cnt+'\t'+x.no_ph+'\t'+x.no_ex));await c.end()})().catch(console.error)"
echo.
pause
goto menu

:end
echo 再见！
