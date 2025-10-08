@echo off
echo 正在重新编译后端项目...
call mvn clean compile -DskipTests
echo.
echo 编译完成！请重启后端服务。
pause
