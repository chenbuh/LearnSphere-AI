export default {
    theme: {
        switch: '主题切换',
        light: '浅色',
        dark: '暗色',
        toggleToLight: '切换到浅色主题',
        toggleToDark: '切换到暗色主题'
    },
    menu: {
        dashboard: '仪表盘',
        vocabulary: '词汇学习',
        vocabularyTest: '词汇测试',
        review: '智能复习',
        dailyTasks: '每日任务',
        grammar: '语法练习',
        listening: '听力训练',
        speaking: '口语练习',
        reading: '阅读理解',
        writing: '写作练习',
        mockExam: '模拟考试',
        learningHub: '学习中心',
        analysis: '学习分析',
        errorBook: '错题本',
        answerHistory: '答题历史',
        notifications: '通知中心',
        profile: '个人中心',
        settings: '设置',
        logout: '退出登录'
    },
    settings: {
        title: '系统设置',
        subtitle: '管理您的偏好设置与账户信息',
        general: {
            tab: '通用设置',
            title: '通用设置',
            subtitle: '自定义界面外观与交互体验',
            language: {
                title: '系统语言',
                desc: '切换系统显示语言'
            },
            autoPlay: {
                title: '自动播放音频',
                desc: '在查看单词或例句时自动朗读'
            },
            clearCache: {
                title: '清除缓存',
                desc: '释放本地存储空间，不影响账号数据',
                button: '立即清除'
            },
            save: '保存更改'
        },
        account: {
            tab: '账户安全',
            title: '账户安全',
            subtitle: '更新您的个人信息与密码'
        },
        notifications: {
            tab: '通知提醒',
            title: '通知提醒',
            subtitle: '管理您的消息推送偏好'
        }
    },
    notifications: {
        title: '通知中心',
        subtitle: '查看系统公告、课程更新与会员相关消息',
        trigger: '通知',
        unread: '未读',
        read: '已读',
        empty: '暂时还没有通知',
        emptyFiltered: '当前筛选条件下没有通知',
        markRead: '标记已读',
        markAllRead: '全部已读',
        markedAllRead: '已处理 {count} 条通知',
        readAt: '已读于',
        createdAt: '发送时间',
        expireAt: '过期时间',
        permanent: '永久有效',
        allRead: '全部已读',
        viewAll: '查看全部',
        viewDetail: '查看详情',
        refresh: '刷新通知',
        latest: '最新通知',
        total: '通知总数',
        unreadCount: '未读消息',
        openCenter: '打开通知中心',
        filters: {
            type: '通知类型',
            status: '阅读状态',
            action: '筛选通知',
            title: '筛选通知',
            clear: '清空筛选',
            apply: '应用筛选'
        },
        filterOptions: {
            allTypes: '全部类型',
            allStatus: '全部状态',
            unreadOnly: '仅看未读',
            readOnly: '仅看已读'
        },
        detailTitle: '通知详情',
        priorityLabel: '优先级',
        types: {
            system: '系统通知',
            announcement: '平台公告',
            update: '功能更新',
            warning: '重要提醒'
        },
        priorities: {
            0: '普通',
            1: '重要',
            2: '紧急'
        }
    },
    share: {
        title: '分享学习成果',
        defaultDesc: '我正在使用 LearnSphere AI 进行学习，快来一起提升吧！',
        qq: 'QQ',
        wechat: '微信',
        copyLink: '复制链接',
        wechatScan: '微信扫码分享',
        scanHint: '使用微信扫描二维码分享给好友',
        qqSuccess: '已打开 QQ 分享窗口',
        copySuccess: '链接已复制到剪贴板'
    },
    dashboard: {
        welcome: '你好, {name}! 👋',
        learner: '学习者',
        welcomeSub: '准备好开始今天的学习了吗？AI 助手建议您先进行一轮词汇复习。',
        checkedIn: '当日已打卡',
        checkIn: '立即打卡签到',
        checkInSuccess: '打卡成功！坚持就是胜利！',
        checkInFail: '打卡失败',
        aiInsight: 'LearnSphere AI 深度洞察',
        aiAnalyzing: 'NEURAL ENGINE ANALYZING...',
        aiDesc: '基于您的历史答题轨迹与遗忘曲线，AI 为您精准锁定了当前最迫切的提升任务。',
        aiEmpty: '积累更多学习记录，AI 将为您生成精准洞察',
        streak: '连续打卡',
        days: '天',
        learningTime: '总学习时长',
        vocabCoverage: '词汇量覆盖',
        timeDistribution: '学习时长分布',
        '7days': '7天',
        '30days': '30天',
        accuracyTrend: '正确率趋势',
        leaderboard: '学习排行榜',
        xp: 'XP',
        recentActivity: '最近活动',
        viewHistory: '查看所有历史',
        minutesAgo: '分钟前',
        hoursAgo: '小时前',
        daysAgo: '天前',
        activityVocab: '单词强化',
        activityGrammar: '语法练习',
        activityReading: '阅读理解',
        activityListening: '听力训练',
        activityExam: '模拟考试',
        activityNormal: '日常练习',
        aiFallbackContent: 'AI 引擎正在预热中，建议先按计划完成每日任务。',
        aiFallbackAction: '查看任务',
        weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    }
}
