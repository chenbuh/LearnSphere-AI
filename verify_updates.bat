@echo off
chcp 65001 >nul
echo ========================================
echo 验证例句更新结果
echo ========================================
echo.

echo 检查前10条更新的记录...
mysql -uroot -pchen20040209 learnsphere_ai -e "SELECT id, word, LEFT(example, 50) as example FROM vocabulary WHERE id IN (14598, 14599, 14600, 14602, 14603, 14606, 14609, 14613, 14614, 14615);"
echo.

echo 检查还有多少重复的 "This is useful for study."...
mysql -uroot -pchen20040209 learnsphere_ai -e "SELECT COUNT(*) as remaining_count FROM vocabulary WHERE example = 'This is useful for study.';"
echo.

echo 验证完成！
pause
