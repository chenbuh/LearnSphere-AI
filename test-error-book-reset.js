// 错题本重置功能测试脚本
// 在浏览器控制台中运行此脚本来测试重置功能

console.log('🧪 开始错题本重置功能测试...');

// 测试函数
async function testErrorBookReset() {
    try {
        // 1. 检查页面状态
        console.log('\n📍 步骤1: 检查页面状态');
        const errorBookPage = document.getElementById('error-book');
        const isActive = errorBookPage && errorBookPage.classList.contains('active');
        console.log('错题本页面:', { 
            存在: !!errorBookPage, 
            激活: isActive 
        });
        
        if (!isActive) {
            console.log('⚠️ 不在错题本页面，尝试切换...');
            if (window.app && window.app.navigateToPage) {
                window.app.navigateToPage('error-book');
                // 等待页面切换完成
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // 2. 检查重置按钮
        console.log('\n🔘 步骤2: 检查重置按钮');
        const resetBtn = document.getElementById('resetErrorBookBtn');
        console.log('重置按钮:', {
            存在: !!resetBtn,
            可见: resetBtn && resetBtn.offsetParent !== null,
            禁用: resetBtn && resetBtn.disabled,
            类名: resetBtn && resetBtn.className
        });

        // 3. 检查错题本管理器
        console.log('\n📚 步骤3: 检查错题本管理器');
        console.log('错题本管理器:', {
            存在: !!window.errorBookManager,
            类型: typeof window.errorBookManager
        });
        
        if (window.errorBookManager) {
            const stats = window.errorBookManager.getErrorStats();
            console.log('错题统计:', stats);
        }

        // 4. 检查应用对象
        console.log('\n🔧 步骤4: 检查应用对象');
        console.log('应用对象:', {
            存在: !!window.app,
            重置方法: !!(window.app && typeof window.app.resetErrorBook === 'function'),
            确认模态框: !!(window.app && typeof window.app.showConfirmModal === 'function')
        });

        // 5. 测试事件绑定
        console.log('\n🔗 步骤5: 测试事件绑定');
        if (resetBtn) {
            // 检查是否已有事件监听器
            const hasEvents = resetBtn.onclick || resetBtn.dataset.eventBound;
            console.log('事件绑定状态:', {
                onclick: !!resetBtn.onclick,
                eventBound: resetBtn.dataset.eventBound,
                hasEvents: !!hasEvents
            });

            // 手动绑定测试事件
            console.log('🔧 添加测试事件监听器...');
            resetBtn.addEventListener('click', function testHandler(e) {
                console.log('🖱️ 测试事件处理器被触发!');
                console.log('事件对象:', e);
                resetBtn.removeEventListener('click', testHandler);
            }, { once: true });
        }

        // 6. 创建测试错题数据（如果需要）
        console.log('\n📝 步骤6: 准备测试数据');
        if (window.errorBookManager) {
            const currentStats = window.errorBookManager.getErrorStats();
            if (currentStats.totalErrors === 0) {
                console.log('📝 错题本为空，创建测试数据...');
                
                // 创建几个测试错题
                const testErrors = [
                    {
                        module: 'vocabulary',
                        category: '词汇学习',
                        knowledgePoint: 'meaning',
                        question: '测试题目1：What does "example" mean?',
                        userAnswer: '错误答案',
                        correctAnswer: '正确答案',
                        explanation: '这是一个测试解析',
                        difficulty: 'medium'
                    },
                    {
                        module: 'grammar',
                        category: '语法练习',
                        knowledgePoint: 'tenses',
                        question: '测试题目2：Choose the correct tense.',
                        userAnswer: '错误答案',
                        correctAnswer: '正确答案',
                        explanation: '这是另一个测试解析',
                        difficulty: 'easy'
                    }
                ];

                testErrors.forEach(errorData => {
                    window.errorBookManager.recordError(errorData);
                });

                console.log('✅ 已创建测试错题数据');
                
                // 更新统计
                if (window.app && window.app.updateErrorBookStats) {
                    await window.app.updateErrorBookStats();
                }
            } else {
                console.log('📊 错题本已有数据，无需创建测试数据');
            }
        }

        // 7. 提供手动测试选项
        console.log('\n🎯 步骤7: 手动测试选项');
        console.log('可以执行以下操作进行测试:');
        console.log('1. 点击重置按钮');
        console.log('2. 运行: window.app.resetErrorBook()');
        console.log('3. 运行: document.getElementById("resetErrorBookBtn").click()');

        return true;

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
        return false;
    }
}

// 执行测试
testErrorBookReset().then(success => {
    if (success) {
        console.log('\n✅ 测试准备完成！');
        console.log('现在可以点击重置按钮或运行手动命令进行测试。');
        
        // 提供快捷测试命令
        console.log('\n🚀 快捷测试命令:');
        console.log('测试按钮点击: document.getElementById("resetErrorBookBtn").click()');
        console.log('直接调用方法: window.app.resetErrorBook()');
        console.log('检查错题统计: window.errorBookManager.getErrorStats()');
    } else {
        console.log('\n❌ 测试准备失败，请检查错误信息。');
    }
}).catch(error => {
    console.error('❌ 测试脚本执行失败:', error);
});
