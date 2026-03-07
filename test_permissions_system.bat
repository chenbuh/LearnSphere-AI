@echo off
chcp 65001 >nul
echo ========================================
echo   LearnSphere AI 鏉冮檺绯荤粺娴嬭瘯
echo ========================================
echo.

echo [1/5] 妫€鏌ユ枃浠舵槸鍚﹀瓨鍦?..
echo.

set "files_ok=1"

if exist "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" (
    echo 鉁?VipCheckAspect.java
) else (
    echo 鉁?VipCheckAspect.java 鏈壘鍒?
    set "files_ok=0"
)

if exist "backend\src\main\java\com\learnsphere\controller\UserController.java" (
    echo 鉁?UserController.java
) else (
    echo 鉁?UserController.java 鏈壘鍒?
    set "files_ok=0"
)

if exist "frontend-vue\src\composables\useVipPermission.js" (
    echo 鉁?useVipPermission.js
) else (
    echo 鉁?useVipPermission.js 鏈壘鍒?
    set "files_ok=0"
)

if exist "frontend-vue\src\components\QuotaDisplay.vue" (
    echo 鉁?QuotaDisplay.vue
) else (
    echo 鉁?QuotaDisplay.vue 鏈壘鍒?
    set "files_ok=0"
)

if exist "frontend-vue\src\components\VipUpgradePrompt.vue" (
    echo 鉁?VipUpgradePrompt.vue
) else (
    echo 鉁?VipUpgradePrompt.vue 鏈壘鍒?
    set "files_ok=0"
)

if exist "docs\USER_PERMISSIONS.md" (
    echo 鉁?USER_PERMISSIONS.md
) else (
    echo 鉁?USER_PERMISSIONS.md 鏈壘鍒?
    set "files_ok=0"
)

echo.
if "%files_ok%"=="1" (
    echo [鉁揮 鎵€鏈夋枃浠舵鏌ラ€氳繃
) else (
    echo [鉁梋 閮ㄥ垎鏂囦欢缂哄け
)

echo.
echo [2/5] 妫€鏌ュ叧閿唬鐮佺墖娈?..
echo.

findstr /C:"dailyQuota = 5" "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" >nul 2>&1
if %errorlevel%==0 (
    echo 鉁?鏅€氱敤鎴?娆￠厤棰濆凡閰嶇疆
) else (
    echo 鉁?鏅€氱敤鎴烽厤棰濋厤缃湭鎵惧埌
)

findstr /C:"case 1: dailyQuota = 50" "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" >nul 2>&1
if %errorlevel%==0 (
    echo 鉁?鏈堝害浼氬憳50娆￠厤棰濆凡閰嶇疆
) else (
    echo 鉁?鏈堝害浼氬憳閰嶉閰嶇疆鏈壘鍒?
)

findstr /C:"useVipPermission" "frontend-vue\src\layouts\MainLayout.vue" >nul 2>&1
if %errorlevel%==0 (
    echo 鉁?MainLayout宸查泦鎴怮uotaDisplay
) else (
    echo 鉁?MainLayout鏈泦鎴怮uotaDisplay
)

findstr /C:"fetchQuotaInfo" "frontend-vue\src\views\ProfileView.vue" >nul 2>&1
if %errorlevel%==0 (
    echo 鉁?ProfileView宸查泦鎴愰厤棰濇樉绀?
) else (
    echo 鉁?ProfileView鏈泦鎴愰厤棰濇樉绀?
)

echo.
echo [3/5] 妫€鏌ユ枃妗ｅ畬鏁存€?..
echo.

findstr /C:"鏅€氱敤鎴? "docs\USER_PERMISSIONS.md" >nul 2>&1
if %errorlevel%==0 (
    echo 鉁?鐢ㄦ埛鏉冮檺鏂囨。宸插垱寤?
) else (
    echo 鉁?鐢ㄦ埛鏉冮檺鏂囨。涓嶅畬鏁?
)

findstr /C:"閰嶉绯荤粺" "docs\PERMISSIONS_SUMMARY.md" >nul 2>&1
if %errorlevel%==0 (
    echo 鉁?鏉冮檺鎬荤粨鏂囨。宸插垱寤?
) else (
    echo 鉁?鏉冮檺鎬荤粨鏂囨。涓嶅畬鏁?
)

echo.
echo [4/5] 娴嬭瘯寤鸿...
echo.
echo 寤鸿杩涜浠ヤ笅鎵嬪姩娴嬭瘯锛?
echo.
echo 1. 鍚庣娴嬭瘯
echo    - 鍚姩鍚庣鏈嶅姟
echo    - 娴嬭瘯 GET /api/user/quota 鎺ュ彛
echo    - 楠岃瘉鏅€氱敤鎴峰拰VIP鐢ㄦ埛鐨勫搷搴斿樊寮?
echo.
echo 2. 鍓嶇娴嬭瘯
echo    - 鍚姩鍓嶇鏈嶅姟
echo    - 鐧诲綍鏅€氱敤鎴疯处鍙?
echo    - 鏌ョ湅瀵艰埅鏍忛厤棰濇樉绀?
echo    - 璁块棶涓汉涓績-浼氬憳鏉冪泭椤甸潰
echo    - 灏濊瘯璋冪敤AI鍔熻兘锛岃瀵熼厤棰濇墸鍑?
echo.
echo 3. VIP娴嬭瘯
echo    - 鐧诲綍VIP鐢ㄦ埛璐﹀彿
echo    - 楠岃瘉閰嶉鏁伴噺鏄惁姝ｇ‘锛?0/100/200锛?
echo    - 纭VIP鐗规潈鍒楄〃鏄剧ず
echo.
echo 4. 鍗囩骇娴佺▼娴嬭瘯
echo    - 浣跨敤鏅€氳处鍙?
echo    - 鐐瑰嚮鍚勫鐨?鍗囩骇VIP"鎸夐挳
echo    - 楠岃瘉鍗囩骇瀵硅瘽妗嗘槸鍚︽纭樉绀?
echo.
echo [5/5] 涓嬩竴姝ユ搷浣?..
echo.
echo 鈻?閲嶆柊缂栬瘧鍚庣浠ｇ爜
echo 鈻?閲嶆柊鍚姩鍚庣鏈嶅姟
echo 鈻?閲嶆柊缂栬瘧鍓嶇浠ｇ爜
echo 鈻?娴嬭瘯閰嶉鎵ｅ噺鍔熻兘
echo 鈻?娴嬭瘯VIP鏉冮檺妫€鏌?
echo 鈻?楠岃瘉閰嶉姣忔棩閲嶇疆
echo.
echo ========================================
echo   娴嬭瘯妫€鏌ュ畬鎴?
echo ========================================
echo.
echo 闇€瑕佸府鍔╋紵鏌ョ湅鏂囨。锛?
echo   - docs\PERMISSIONS_UPDATE_README.md
echo   - docs\PERMISSIONS_SUMMARY.md
echo   - docs\USER_PERMISSIONS.md
echo.
pause
