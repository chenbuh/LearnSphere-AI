@echo off
chcp 65001 >nul
echo ========================================
echo   LearnSphere AI 权限系统测试
echo ========================================
echo.

echo [1/5] 检查文件是否存在...
echo.

set "files_ok=1"

if exist "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" (
    echo ✓ VipCheckAspect.java
) else (
    echo ✗ VipCheckAspect.java 未找到
    set "files_ok=0"
)

if exist "backend\src\main\java\com\learnsphere\controller\UserController.java" (
    echo ✓ UserController.java
) else (
    echo ✗ UserController.java 未找到
    set "files_ok=0"
)

if exist "frontend-vue\src\composables\useVipPermission.js" (
    echo ✓ useVipPermission.js
) else (
    echo ✗ useVipPermission.js 未找到
    set "files_ok=0"
)

if exist "frontend-vue\src\components\QuotaDisplay.vue" (
    echo ✓ QuotaDisplay.vue
) else (
    echo ✗ QuotaDisplay.vue 未找到
    set "files_ok=0"
)

if exist "frontend-vue\src\components\VipUpgradePrompt.vue" (
    echo ✓ VipUpgradePrompt.vue
) else (
    echo ✗ VipUpgradePrompt.vue 未找到
    set "files_ok=0"
)

if exist "docs\USER_PERMISSIONS.md" (
    echo ✓ USER_PERMISSIONS.md
) else (
    echo ✗ USER_PERMISSIONS.md 未找到
    set "files_ok=0"
)

echo.
if "%files_ok%"=="1" (
    echo [✓] 所有文件检查通过
) else (
    echo [✗] 部分文件缺失
)

echo.
echo [2/5] 检查关键代码片段...
echo.

findstr /C:"dailyQuota = 5" "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 普通用户5次配额已配置
) else (
    echo ✗ 普通用户配额配置未找到
)

findstr /C:"case 1: dailyQuota = 50" "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 月度会员50次配额已配置
) else (
    echo ✗ 月度会员配额配置未找到
)

findstr /C:"useVipPermission" "frontend-vue\src\layouts\MainLayout.vue" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ MainLayout已集成QuotaDisplay
) else (
    echo ✗ MainLayout未集成QuotaDisplay
)

findstr /C:"fetchQuotaInfo" "frontend-vue\src\views\ProfileView.vue" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ ProfileView已集成配额显示
) else (
    echo ✗ ProfileView未集成配额显示
)

echo.
echo [3/5] 检查文档完整性...
echo.

findstr /C:"普通用户" "docs\USER_PERMISSIONS.md" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 用户权限文档已创建
) else (
    echo ✗ 用户权限文档不完整
)

findstr /C:"配额系统" "docs\PERMISSIONS_SUMMARY.md" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 权限总结文档已创建
) else (
    echo ✗ 权限总结文档不完整
)

echo.
echo [4/5] 测试建议...
echo.
echo 建议进行以下手动测试：
echo.
echo 1. 后端测试
echo    - 启动后端服务
echo    - 测试 GET /api/user/quota 接口
echo    - 验证普通用户和VIP用户的响应差异
echo.
echo 2. 前端测试
echo    - 启动前端服务
echo    - 登录普通用户账号
echo    - 查看导航栏配额显示
echo    - 访问个人中心-会员权益页面
echo    - 尝试调用AI功能，观察配额扣减
echo.
echo 3. VIP测试
echo    - 登录VIP用户账号
echo    - 验证配额数量是否正确（50/100/200）
echo    - 确认VIP特权列表显示
echo.
echo 4. 升级流程测试
echo    - 使用普通账号
echo    - 点击各处的"升级VIP"按钮
echo    - 验证升级对话框是否正确显示
echo.
echo [5/5] 下一步操作...
echo.
echo □ 重新编译后端代码
echo □ 重新启动后端服务
echo □ 重新编译前端代码
echo □ 测试配额扣减功能
echo □ 测试VIP权限检查
echo □ 验证配额每日重置
echo.
echo ========================================
echo   测试检查完成
echo ========================================
echo.
echo 需要帮助？查看文档：
echo   - docs\PERMISSIONS_UPDATE_README.md
echo   - docs\PERMISSIONS_SUMMARY.md
echo   - docs\USER_PERMISSIONS.md
echo.
pause
