@echo off
chcp 65001 >nul
echo ========================================
echo LearnSphere AI 部署脚本
echo ========================================
echo.

echo [1/5] 清理旧的静态资源...
if exist "backend\src\main\resources\static" (
    rmdir /s /q "backend\src\main\resources\static"
)
mkdir "backend\src\main\resources\static"
echo 清理完成！
echo.

echo [2/5] 构建前端（用户网站）...
cd frontend-vue
call npm install
if errorlevel 1 (
    echo 前端依赖安装失败！
    pause
    exit /b 1
)
call npm run build
if errorlevel 1 (
    echo 前端构建失败！
    pause
    exit /b 1
)
echo 前端构建完成！
cd ..
echo.

echo [3/5] 复制前端文件到后端 resources...
xcopy /s /e /y "frontend-vue\dist\*" "backend\src\main\resources\static\"
if errorlevel 1 (
    echo 文件复制失败！
    pause
    exit /b 1
)
echo 文件复制完成！
echo.

echo [4/5] 构建管理后台（可选）...
set /p BUILD_ADMIN="是否构建管理后台？(y/n): "
if /i "%BUILD_ADMIN%"=="y" (
    cd admin-vue
    call npm install
    if errorlevel 1 (
        echo 管理后台依赖安装失败！
        cd ..
        pause
        exit /b 1
    )
    call npm run build
    if errorlevel 1 (
        echo 管理后台构建失败！
        cd ..
        pause
        exit /b 1
    )
    cd ..
    
    echo 复制管理后台文件...
    mkdir "backend\src\main\resources\static\admin"
    xcopy /s /e /y "admin-vue\dist\*" "backend\src\main\resources\static\admin\"
    echo 管理后台构建完成！
)
echo.

echo [5/5] 打包后端 JAR...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo 后端打包失败！
    cd ..
    pause
    exit /b 1
)
cd ..
echo 后端打包完成！
echo.

echo ========================================
echo 部署准备完成！
echo ========================================
echo.
echo JAR 文件位置: backend\target\learnsphere-ai-0.0.1-SNAPSHOT.jar
echo.
echo 下一步：
echo 1. 上传 JAR 文件到服务器
echo 2. 配置数据库（参考 docs\DEPLOYMENT.md）
echo 3. 配置 Nginx（参考 docs\DEPLOYMENT.md）
echo 4. 启动应用
echo.
echo 详细部署文档请查看: docs\DEPLOYMENT.md
echo.
pause
