@echo off
chcp 65001 >nul
echo ========================================
echo  LearnSphere AI 一键部署脚本
echo ========================================
echo.

:: ─── 步骤 1：清理前端静态目录（保留 admin 子目录）──────────────────
echo [1/5] 清理旧前端静态资源（保留 admin 目录）...

set STATIC_DIR=backend\src\main\resources\static

if not exist "%STATIC_DIR%" mkdir "%STATIC_DIR%"

:: 删除非 admin 的内容
for /f "delims=" %%i in ('dir /b "%STATIC_DIR%"') do (
    if /i not "%%i"=="admin" (
        if exist "%STATIC_DIR%\%%i\" (
            rmdir /s /q "%STATIC_DIR%\%%i"
        ) else (
            del /f /q "%STATIC_DIR%\%%i"
        )
    )
)
echo 清理完成（admin 目录已保留）！
echo.

:: ─── 步骤 2：构建前端用户端 ──────────────────────────────────
echo [2/5] 构建前端（用户网站）...
cd frontend-vue
if exist package-lock.json (
    call npm ci
) else (
    call npm install
)
if errorlevel 1 (
    echo [ERROR] 前端依赖安装失败！
    pause & exit /b 1
)
call npm run build
if errorlevel 1 (
    echo [ERROR] 前端构建失败！
    pause & exit /b 1
)
cd ..
echo 前端构建完成！
echo.

:: ─── 步骤 3：复制 dist -^> backend static ───────────────────────────
echo [3/5] 复制前端文件到后端 resources/static...
xcopy /s /e /y "frontend-vue\dist\*" "%STATIC_DIR%\"
if errorlevel 1 (
    echo [ERROR] 文件复制失败！
    pause & exit /b 1
)
echo 复制完成！
echo.

:: ─── 步骤 4：可选构建管理后台 ─────────────────────────────────
echo [4/5] 构建管理后台（可选）...
set /p BUILD_ADMIN="是否同时构建管理后台 admin-vue？(y/n): "
if /i "%BUILD_ADMIN%"=="y" (
    cd admin-vue
    if exist package-lock.json (
        call npm ci
    ) else (
        call npm install
    )
    if errorlevel 1 (
        echo [ERROR] 管理后台依赖安装失败！
        cd .. & pause & exit /b 1
    )
    call npm run build
    if errorlevel 1 (
        echo [ERROR] 管理后台构建失败！
        cd .. & pause & exit /b 1
    )
    cd ..
    if not exist "%STATIC_DIR%\admin" (
        mkdir "%STATIC_DIR%\admin"
    ) else (
        for /f "delims=" %%i in ('dir /b "%STATIC_DIR%\admin"') do (
            if exist "%STATIC_DIR%\admin\%%i\" (
                rmdir /s /q "%STATIC_DIR%\admin\%%i"
            ) else (
                del /f /q "%STATIC_DIR%\admin\%%i"
            )
        )
    )
    xcopy /s /e /y "admin-vue\dist\*" "%STATIC_DIR%\admin\"
    echo 管理后台构建并复制完成！
) else (
    echo 跳过管理后台构建。
)
echo.

:: ─── 步骤 5：Maven 打包后端 JAR ────────────────────────────────
echo [5/5] 打包后端 JAR（包含前端静态资源）...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo [ERROR] 后端打包失败！
    cd .. & pause & exit /b 1
)
cd ..
echo 后端打包完成！
echo.

echo ========================================
echo  部署准备完成！
echo ========================================
echo.
echo  JAR 路径: backend\target\learnsphere-ai-0.0.1-SNAPSHOT.jar
echo.
echo  访问地址（启动后）：
echo    前端用户端: http://服务器IP:8080/
echo    管理后台:   http://服务器IP:8080/admin/
echo    API接口:    http://服务器IP:8080/api/
echo.
echo  静态资源缓存策略:
echo    /assets/**   JS/CSS  -^> 7天强缓存 (immutable)
echo    /index.html  入口    -^> 不缓存 (no-store)
echo    /sw.js       SW      -^> 不缓存 (no-store)
echo.
echo  上传 JAR 到服务器后，参考 docs\部署运维\宝塔部署指南.md 启动。
echo.
pause
