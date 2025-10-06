// 错题本重置修复脚本
// 直接在浏览器控制台运行此脚本

console.log('🔧 开始修复错题本重置功能...');

// 1. 强制清空错题本数据
function forceResetErrorBook() {
    console.log('🔄 执行强制重置...');
    
    try {
        // 清空错题本管理器数据
        if (window.errorBookManager) {
            const beforeCount = window.errorBookManager.getErrorStats().totalErrors;
            console.log(`📊 重置前错题数量: ${beforeCount}`);
            
            // 直接清空数据
            window.errorBookManager.errorRecords = [];
            window.errorBookManager.reviewSchedule = {};
            
            // 保存到本地存储
            window.errorBookManager.saveErrorRecords();
            window.errorBookManager.saveReviewSchedule();
            
            console.log(`✅ 已清空错题本管理器数据`);
        }
        
        // 直接清空本地存储
        localStorage.removeItem('errorBookRecords');
        localStorage.removeItem('reviewSchedule');
        console.log('✅ 已清空本地存储数据');
        
        // 直接更新页面显示
        updatePageDisplay();
        
        console.log('🎉 强制重置完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 强制重置失败:', error);
        return false;
    }
}

// 2. 直接更新页面显示
function updatePageDisplay() {
    console.log('🔄 更新页面显示...');
    
    try {
        // 更新统计数字
        const elements = {
            'totalErrorCount': '0',
            'masteredCount': '0', 
            'needReviewCount': '0',
            'masteryRate': '0%'
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`✅ 更新 ${id}: ${value}`);
            } else {
                console.warn(`⚠️ 未找到元素: ${id}`);
            }
        });
        
        // 更新错题列表显示
        const errorsList = document.getElementById('recent-errors-list');
        if (errorsList) {
            errorsList.innerHTML = `
                <div class="guidance-message">
                    <div class="guidance-icon">📚</div>
                    <h3>欢迎使用智能错题本</h3>
                    <p>错题本会自动收集您在各个学习模块中的错题，帮助您：</p>
                    <ul>
                        <li>📊 分析学习薄弱点</li>
                        <li>⏰ 智能安排复习计划</li>
                        <li>📈 跟踪掌握进度</li>
                        <li>💡 提供个性化建议</li>
                    </ul>
                    <p>开始学习后，错题会自动出现在这里！</p>
                </div>
            `;
            console.log('✅ 已更新错题列表显示');
        }
        
        // 显示成功通知
        if (window.app && window.app.showNotification) {
            window.app.showNotification('错题本已成功重置！', 'success');
        }
        
        console.log('✅ 页面显示更新完成');
        
    } catch (error) {
        console.error('❌ 更新页面显示失败:', error);
    }
}

// 3. 修复重置按钮事件
function fixResetButton() {
    console.log('🔧 修复重置按钮事件...');
    
    const resetBtn = document.getElementById('resetErrorBookBtn');
    if (resetBtn) {
        // 移除所有现有事件监听器
        resetBtn.replaceWith(resetBtn.cloneNode(true));
        
        // 重新获取按钮引用
        const newResetBtn = document.getElementById('resetErrorBookBtn');
        
        // 添加新的事件监听器
        newResetBtn.addEventListener('click', function(e) {
            console.log('🖱️ 重置按钮被点击（修复版）');
            e.preventDefault();
            e.stopPropagation();
            
            const confirmed = confirm('确定要重置错题本吗？这将删除所有错题记录！\n\n此操作无法撤销！');
            if (confirmed) {
                forceResetErrorBook();
            }
        });
        
        console.log('✅ 重置按钮事件已修复');
        return true;
    } else {
        console.warn('⚠️ 未找到重置按钮');
        return false;
    }
}

// 4. 检查系统状态
function checkSystemStatus() {
    console.log('🔍 检查系统状态...');
    
    const status = {
        errorBookManager: !!window.errorBookManager,
        app: !!window.app,
        resetButton: !!document.getElementById('resetErrorBookBtn'),
        errorBookPage: !!document.getElementById('error-book'),
        isOnErrorBookPage: document.getElementById('error-book')?.classList.contains('active')
    };
    
    console.log('📊 系统状态:', status);
    
    if (window.errorBookManager) {
        const stats = window.errorBookManager.getErrorStats();
        console.log('📊 当前错题统计:', stats);
    }
    
    return status;
}

// 5. 完整修复流程
function fullFix() {
    console.log('🚀 开始完整修复流程...');
    
    // 检查系统状态
    const status = checkSystemStatus();
    
    if (!status.isOnErrorBookPage) {
        console.log('⚠️ 当前不在错题本页面，尝试切换...');
        if (window.app && window.app.navigateToPage) {
            window.app.navigateToPage('error-book');
            // 等待页面切换
            setTimeout(() => {
                console.log('📄 页面切换完成，继续修复...');
                executeReset();
            }, 1000);
            return;
        }
    }
    
    executeReset();
}

function executeReset() {
    // 执行重置
    const resetSuccess = forceResetErrorBook();
    
    if (resetSuccess) {
        // 修复按钮事件
        fixResetButton();
        
        console.log('🎉 完整修复完成！现在可以正常使用重置功能了。');
        
        // 最终验证
        setTimeout(() => {
            if (window.errorBookManager) {
                const finalStats = window.errorBookManager.getErrorStats();
                console.log('🔍 最终验证 - 错题统计:', finalStats);
                
                if (finalStats.totalErrors === 0) {
                    console.log('✅ 验证成功：错题本已完全重置');
                } else {
                    console.warn('⚠️ 验证失败：仍有错题数据');
                }
            }
        }, 500);
    } else {
        console.error('❌ 修复失败，请检查错误信息');
    }
}

// 导出函数供外部调用
window.fixErrorBookReset = {
    fullFix,
    forceResetErrorBook,
    updatePageDisplay,
    fixResetButton,
    checkSystemStatus
};

// 自动执行修复
console.log('🎯 自动执行修复...');
fullFix();

// 提供使用说明
console.log(`
📋 修复完成！可用的命令：

1. 完整修复：
   window.fixErrorBookReset.fullFix()

2. 强制重置：
   window.fixErrorBookReset.forceResetErrorBook()

3. 更新显示：
   window.fixErrorBookReset.updatePageDisplay()

4. 修复按钮：
   window.fixErrorBookReset.fixResetButton()

5. 检查状态：
   window.fixErrorBookReset.checkSystemStatus()
`);
