import os

replacements = {
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\VocabularyManagementController.java': [
        (' * 词汇管理控制?', ' * 词汇管理控制器'),
        (' * 用于批量导入和完善词汇数?', ' * 用于批量导入和完善词汇数据')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\StudyPlanController.java': [
        (' * 学习计划控制?', ' * 学习计划控制器')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\NotificationController.java': [
        ('     * 标通知为已?', '     * 标记通知为已读')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\LearningHistoryController.java': [
        (' * 学习历史记录控制?', ' * 学习历史记录控制器')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\HealthController.java': [
        ('     * 健康?', '     * 健康检查')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\FileController.java': [
        (' * 文件上传控制?', ' * 文件上传控制器'),
        ('            // 生成单一文件?', '            // 生成单一文件名')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\CommonController.java': [
        (' * 充接口控制噼无需登录即可访问?', ' * 补充接口控制器，无需登录即可访问'),
        ('        // 定义允兼的配?key 前缀白名?', '        // 定义允许的配置 key 前缀白名单')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\admin\AdminUserLogController.java': [
        (' * 管理?- 用户日志管理控制?', ' * 管理后台 - 用户日志管理控制器'),
        ('        // 用户名筛?', '        // 用户名筛选'),
        ('        // 模块筛?', '        // 模块筛选'),
        ('        // 操作类型筛?', '        // 操作类型筛选'),
        ('        // IP筛?', '        // IP筛选'),
        ('        // 状筛?', '        // 状态筛选'),
        ('     * 清空有日志（谨慎操作?', '     * 清空所有日志（谨慎操作）')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\admin\AdminSensitiveController.java': [
        (' * 后台敏感内审控制?', ' * 后台敏感内容审核控制器'),
        ('     * 获取审拦截统数据 (今日、趋势词?', '     * 获取审核拦截统计数据 (今日、趋势词等)'),
        ('     * 添加敏感?', '     * 添加敏感词'),
        ('"内审", action = "添加敏感?"', '"内容审核", action = "添加敏感词"'),
        ('     * 删除敏感?', '     * 删除敏感词'),
        ('"内审", action = "删除敏感?"', '"内容审核", action = "删除敏感词"'),
        ('     * 重载敏感词库到内?', '     * 重载敏感词库到内存')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\admin\AdminOpsController.java': [
        ('     * 清理 Redis 锼按前?     */', '     * 清理 Redis 缓存(按前缀)\n     */')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\admin\AdminLearningContentController.java': [
        (' * 管理后台学习内控制? */', ' * 管理后台学习内容控制器\n */')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\admin\AdminDashboardController.java': [
        ('     * 获取用户增长趋势（最?0天）', '     * 获取用户增长趋势（最近7或30天）')
    ],
    r'e:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\controller\admin\AdminAIFeedbackController.java': [
        (' * AI反审控制?', ' * AI反馈审核控制器')
    ]
}

def do_replacement():
    for path, pairs in replacements.items():
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                text = f.read()
            for old, new in pairs:
                text = text.replace(old, new)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(text)
            print('Fixed:', path)
        else:
            print('Not found:', path)

do_replacement()
