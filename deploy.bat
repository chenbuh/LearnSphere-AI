@echo off
chcp 65001 >nul
echo ========================================
echo  LearnSphere AI 涓€閿儴缃茶剼鏈?
echo ========================================
echo.

:: 鈹€鈹€鈹€ 姝ラ 1锛氭竻鐞嗗墠绔潤鎬佺洰褰曪紙淇濈暀 admin 瀛愮洰褰曪級鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
echo [1/5] 娓呯悊鏃у墠绔潤鎬佽祫婧愶紙淇濈暀 admin 鐩綍锛?..

set STATIC_DIR=backend\src\main\resources\static

if not exist "%STATIC_DIR%" mkdir "%STATIC_DIR%"

:: 鍒犻櫎闈?admin 鐨勫唴瀹?
for /f "delims=" %%i in ('dir /b "%STATIC_DIR%"') do (
    if /i not "%%i"=="admin" (
        if exist "%STATIC_DIR%\%%i\" (
            rmdir /s /q "%STATIC_DIR%\%%i"
        ) else (
            del /f /q "%STATIC_DIR%\%%i"
        )
    )
)
echo 娓呯悊瀹屾垚锛坅dmin 鐩綍宸蹭繚鐣欙級锛?
echo.

:: 鈹€鈹€鈹€ 姝ラ 2锛氭瀯寤哄墠绔敤鎴风 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
echo [2/5] 鏋勫缓鍓嶇锛堢敤鎴风綉绔欙級...
cd frontend-vue
call npm install
if errorlevel 1 (
    echo [ERROR] 鍓嶇渚濊禆瀹夎澶辫触锛?
    pause & exit /b 1
)
call npm run build
if errorlevel 1 (
    echo [ERROR] 鍓嶇鏋勫缓澶辫触锛?
    pause & exit /b 1
)
cd ..
echo 鍓嶇鏋勫缓瀹屾垚锛?
echo.

:: 鈹€鈹€鈹€ 姝ラ 3锛氬鍒?dist 鈫?backend static 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
echo [3/5] 澶嶅埗鍓嶇鏂囦欢鍒板悗绔?resources/static...
xcopy /s /e /y "frontend-vue\dist\*" "%STATIC_DIR%\"
if errorlevel 1 (
    echo [ERROR] 鏂囦欢澶嶅埗澶辫触锛?
    pause & exit /b 1
)
echo 澶嶅埗瀹屾垚锛?
echo.

:: 鈹€鈹€鈹€ 姝ラ 4锛氬彲閫夋瀯寤虹鐞嗗悗鍙?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
echo [4/5] 鏋勫缓绠＄悊鍚庡彴锛堝彲閫夛級...
set /p BUILD_ADMIN="鏄惁鍚屾椂鏋勫缓绠＄悊鍚庡彴 admin-vue锛?y/n): "
if /i "%BUILD_ADMIN%"=="y" (
    cd admin-vue
    call npm install
    if errorlevel 1 (
        echo [ERROR] 绠＄悊鍚庡彴渚濊禆瀹夎澶辫触锛?
        cd .. & pause & exit /b 1
    )
    call npm run build
    if errorlevel 1 (
        echo [ERROR] 绠＄悊鍚庡彴鏋勫缓澶辫触锛?
        cd .. & pause & exit /b 1
    )
    cd ..
    if not exist "%STATIC_DIR%\admin" mkdir "%STATIC_DIR%\admin"
    xcopy /s /e /y "admin-vue\dist\*" "%STATIC_DIR%\admin\"
    echo 绠＄悊鍚庡彴鏋勫缓骞跺鍒跺畬鎴愶紒
) else (
    echo 璺宠繃绠＄悊鍚庡彴鏋勫缓銆?
)
echo.

:: 鈹€鈹€鈹€ 姝ラ 5锛歁aven 鎵撳寘鍚庣 JAR 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
echo [5/5] 鎵撳寘鍚庣 JAR锛堝寘鍚墠绔潤鎬佽祫婧愶級...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo [ERROR] 鍚庣鎵撳寘澶辫触锛?
    cd .. & pause & exit /b 1
)
cd ..
echo 鍚庣鎵撳寘瀹屾垚锛?
echo.

echo ========================================
echo  閮ㄧ讲鍑嗗瀹屾垚锛?
echo ========================================
echo.
echo  JAR 璺緞: backend\target\learnsphere-ai-0.0.1-SNAPSHOT.jar
echo.
echo  璁块棶鍦板潃锛堝惎鍔ㄥ悗锛?
echo    鍓嶇鐢ㄦ埛绔? http://鏈嶅姟鍣↖P:8080/
echo    绠＄悊鍚庡彴:   http://鏈嶅姟鍣↖P:8080/admin/
echo    API鎺ュ彛:    http://鏈嶅姟鍣↖P:8080/api/
echo.
echo  闈欐€佽祫婧愮紦瀛樼瓥鐣?
echo    /assets/**   JS/CSS  鈫?7澶╁己缂撳瓨 (immutable)
echo    /index.html  鍏ュ彛    鈫?涓嶇紦瀛?(no-store)
echo    /sw.js       SW      鈫?涓嶇紦瀛?(no-store)
echo.
echo  涓婁紶 JAR 鍒版湇鍔″櫒鍚庯紝鍙傝€?docs\DEPLOYMENT.md 鍚姩銆?
echo.
pause

