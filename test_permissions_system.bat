@echo off
chcp 65001 >nul
echo ========================================
echo   LearnSphere AI 权限系统测试
echo ========================================
echo.

echo [1/5] 检查关键文件是否存在...
echo.

set "files_ok=1"

if exist "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" (
    echo [OK] VipCheckAspect.java
) else (
    echo [MISSING] VipCheckAspect.java
    set "files_ok=0"
)

if exist "backend\src\main\java\com\learnsphere\controller\UserController.java" (
    echo [OK] UserController.java
) else (
    echo [MISSING] UserController.java
    set "files_ok=0"
)

if exist "frontend-vue\src\composables\useVipPermission.js" (
    echo [OK] useVipPermission.js
) else (
    echo [MISSING] useVipPermission.js
    set "files_ok=0"
)

if exist "frontend-vue\src\components\QuotaDisplay.vue" (
    echo [OK] QuotaDisplay.vue
) else (
    echo [MISSING] QuotaDisplay.vue
    set "files_ok=0"
)

if exist "frontend-vue\src\components\VipUpgradePrompt.vue" (
    echo [OK] VipUpgradePrompt.vue
) else (
    echo [MISSING] VipUpgradePrompt.vue
    set "files_ok=0"
)

if exist "docs\USER_PERMISSIONS.md" (
    echo [OK] USER_PERMISSIONS.md
) else (
    echo [MISSING] USER_PERMISSIONS.md
    set "files_ok=0"
)

echo.
if "%files_ok%"=="1" (
    echo [OK] 关键文件检查通过
) else (
    echo [WARN] 部分关键文件缺失
)

echo.
echo [2/5] 检查关键代码片段...
echo.

findstr /C:"dailyQuota = 5" "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 普通用户每日配额已配置
) else (
    echo [WARN] 未找到普通用户每日配额配置
)

findstr /C:"case 1: dailyQuota = 50" "backend\src\main\java\com\learnsphere\common\aspect\VipCheckAspect.java" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 月度会员 50 次配额已配置
) else (
    echo [WARN] 未找到月度会员配额配置
)

findstr /C:"useVipPermission" "frontend-vue\src\layouts\MainLayout.vue" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] MainLayout 已接入权限能力
) else (
    echo [WARN] MainLayout 未接入权限能力
)

findstr /C:"fetchQuotaInfo" "frontend-vue\src\views\ProfileView.vue" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] ProfileView 已接入配额展示
) else (
    echo [WARN] ProfileView 未接入配额展示
)

echo.
echo [3/5] 检查文档完整性...
echo.

findstr /C:"普通用户" "docs\USER_PERMISSIONS.md" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 用户权限文档已创建
) else (
    echo [WARN] 用户权限文档不完整
)

findstr /C:"配额系统" "docs\PERMISSIONS_SUMMARY.md" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 权限总结文档已创建
) else (
    echo [WARN] 权限总结文档不完整
)

echo.
echo [4/5] 手动测试建议...
echo.
echo 建议按下面顺序进行手动验证：
echo.
echo 1. 后端接口验证
echo    - 启动后端服务
echo    - 调用 GET /api/user/quota
echo    - 对比普通用户与 VIP 用户的返回差异
echo.
echo 2. 前端页面验证
echo    - 启动前端服务
echo    - 登录普通用户账号
echo    - 查看导航栏中的配额展示
echo    - 进入个人中心查看会员权益页面
echo    - 尝试调用 AI 功能，观察配额扣减
echo.
echo 3. VIP 账号验证
echo    - 登录 VIP 用户账号
echo    - 检查配额数量是否正确（50/100/200）
echo    - 确认 VIP 特权列表正常显示
echo.
echo 4. 升级流程验证
echo    - 使用普通账号
echo    - 点击各处“升级 VIP”按钮
echo    - 确认升级对话框展示正确
echo.
echo [5/5] 下一步操作...
echo.
echo - 重新编译后端代码
echo - 重新启动后端服务
echo - 重新编译前端代码
echo - 测试配额扣减能力
echo - 测试 VIP 权限校验
echo - 验证配额每日重置逻辑
echo.
echo ========================================
echo   测试检查完成
echo ========================================
echo.
echo 如需更多说明，可查看：
echo   - docs\PERMISSIONS_UPDATE_README.md
echo   - docs\PERMISSIONS_SUMMARY.md
echo   - docs\USER_PERMISSIONS.md
echo.
pause
