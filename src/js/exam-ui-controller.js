/**
 * 考试UI控制器
 * 负责管理考试界面的用户体验和交互
 */
class ExamUIController {
    constructor() {
        this.progressBar = null;
        this.timerDisplay = null;
        this.questionNav = null;
        this.answerStatus = new Map();
        this.currentExamData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('🎨 考试UI控制器已初始化');
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听考试时间更新
        window.addEventListener('examTimeUpdate', (event) => {
            this.updateTimer(event.detail);
        });

        // 监听答案更新
        window.addEventListener('examAnswerUpdate', (event) => {
            this.updateAnswerStatus(event.detail);
        });

        // 监听考试恢复
        window.addEventListener('examRestored', (event) => {
            this.onExamRestored(event.detail);
        });

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.currentExamData) {
                this.refreshUI();
            }
        });
    }

    /**
     * 初始化考试界面
     */
    initializeExamUI(examData) {
        this.currentExamData = examData;
        this.createProgressIndicator();
        this.createTimerDisplay();
        this.createQuestionNavigation();
        this.createAnswerStatusPanel();
        this.createExamControls();
        this.showExamStartNotification();
    }

    /**
     * 创建进度指示器
     */
    createProgressIndicator() {
        const container = document.getElementById('examProgressContainer') || this.createContainer('examProgressContainer');
        
        container.innerHTML = `
            <div class="exam-progress-wrapper">
                <div class="progress-header">
                    <span class="progress-label">考试进度</span>
                    <span class="progress-text" id="progressText">0/0</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="examProgressBar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                </div>
                <div class="progress-stats">
                    <span class="answered-count" id="answeredCount">已答: 0</span>
                    <span class="remaining-count" id="remainingCount">剩余: 0</span>
                </div>
            </div>
        `;

        this.progressBar = container.querySelector('#examProgressBar');
        this.updateProgress(0, this.currentExamData?.totalQuestions || 0);
    }

    /**
     * 创建计时器显示
     */
    createTimerDisplay() {
        const container = document.getElementById('examTimerContainer') || this.createContainer('examTimerContainer');
        
        container.innerHTML = `
            <div class="exam-timer-wrapper">
                <div class="timer-display" id="timerDisplay">
                    <div class="time-remaining" id="timeRemaining">--:--:--</div>
                    <div class="timer-label">剩余时间</div>
                </div>
                <div class="timer-controls">
                    <button id="pauseExamBtn" class="timer-btn pause-btn" title="暂停考试">
                        <span class="btn-icon">⏸️</span>
                        <span class="btn-text">暂停</span>
                    </button>
                    <button id="resumeExamBtn" class="timer-btn resume-btn" title="恢复考试" style="display: none;">
                        <span class="btn-icon">▶️</span>
                        <span class="btn-text">恢复</span>
                    </button>
                </div>
            </div>
        `;

        this.timerDisplay = container.querySelector('#timeRemaining');
        this.setupTimerControls();
    }

    /**
     * 创建题目导航
     */
    createQuestionNavigation() {
        const container = document.getElementById('questionNavContainer') || this.createContainer('questionNavContainer');
        
        if (!this.currentExamData) return;

        const totalQuestions = this.currentExamData.totalQuestions || 0;
        const navItems = [];

        for (let i = 0; i < totalQuestions; i++) {
            navItems.push(`
                <button class="question-nav-item" data-question="${i}" title="题目 ${i + 1}">
                    <span class="question-number">${i + 1}</span>
                    <span class="question-status" id="status-${i}">○</span>
                </button>
            `);
        }

        container.innerHTML = `
            <div class="question-nav-wrapper">
                <div class="nav-header">
                    <span class="nav-title">题目导航</span>
                    <button id="toggleNavBtn" class="toggle-nav-btn">收起</button>
                </div>
                <div class="question-nav-grid" id="questionNavGrid">
                    ${navItems.join('')}
                </div>
                <div class="nav-legend">
                    <div class="legend-item">
                        <span class="legend-icon answered">●</span>
                        <span class="legend-text">已答</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon current">◉</span>
                        <span class="legend-text">当前</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon unanswered">○</span>
                        <span class="legend-text">未答</span>
                    </div>
                </div>
            </div>
        `;

        this.setupQuestionNavigation();
    }

    /**
     * 创建答题状态面板
     */
    createAnswerStatusPanel() {
        const container = document.getElementById('answerStatusContainer') || this.createContainer('answerStatusContainer');
        
        container.innerHTML = `
            <div class="answer-status-panel">
                <div class="status-summary">
                    <div class="status-item">
                        <span class="status-label">总题数</span>
                        <span class="status-value" id="totalQuestions">0</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">已完成</span>
                        <span class="status-value" id="completedQuestions">0</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">完成率</span>
                        <span class="status-value" id="completionRate">0%</span>
                    </div>
                </div>
                <div class="quick-actions">
                    <button id="reviewAnswersBtn" class="action-btn review-btn">
                        <span class="btn-icon">📋</span>
                        <span class="btn-text">检查答案</span>
                    </button>
                    <button id="submitExamBtn" class="action-btn submit-btn">
                        <span class="btn-icon">✅</span>
                        <span class="btn-text">提交考试</span>
                    </button>
                </div>
            </div>
        `;

        this.setupActionButtons();
    }

    /**
     * 创建考试控制按钮
     */
    createExamControls() {
        const container = document.getElementById('examControlsContainer') || this.createContainer('examControlsContainer');
        
        container.innerHTML = `
            <div class="exam-controls">
                <div class="navigation-controls">
                    <button id="prevQuestionBtn" class="nav-btn prev-btn">
                        <span class="btn-icon">◀</span>
                        <span class="btn-text">上一题</span>
                    </button>
                    <button id="nextQuestionBtn" class="nav-btn next-btn">
                        <span class="btn-text">下一题</span>
                        <span class="btn-icon">▶</span>
                    </button>
                </div>
                <div class="exam-actions">
                    <button id="saveProgressBtn" class="action-btn save-btn" title="保存进度">
                        <span class="btn-icon">💾</span>
                        <span class="btn-text">保存</span>
                    </button>
                    <button id="fullscreenBtn" class="action-btn fullscreen-btn" title="全屏模式">
                        <span class="btn-icon">🔲</span>
                        <span class="btn-text">全屏</span>
                    </button>
                </div>
            </div>
        `;

        this.setupNavigationControls();
    }

    /**
     * 创建容器元素
     */
    createContainer(id) {
        const container = document.createElement('div');
        container.id = id;
        container.className = 'exam-ui-container';
        
        // 尝试插入到合适的位置
        const examInterface = document.getElementById('examInterface') || document.body;
        examInterface.appendChild(container);
        
        return container;
    }

    /**
     * 设置计时器控制
     */
    setupTimerControls() {
        const pauseBtn = document.getElementById('pauseExamBtn');
        const resumeBtn = document.getElementById('resumeExamBtn');

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.pauseExam();
            });
        }

        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.resumeExam();
            });
        }
    }

    /**
     * 设置题目导航
     */
    setupQuestionNavigation() {
        const navItems = document.querySelectorAll('.question-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const questionIndex = parseInt(e.currentTarget.dataset.question);
                this.goToQuestion(questionIndex);
            });
        });

        const toggleBtn = document.getElementById('toggleNavBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleNavigationPanel();
            });
        }
    }

    /**
     * 设置操作按钮
     */
    setupActionButtons() {
        const reviewBtn = document.getElementById('reviewAnswersBtn');
        const submitBtn = document.getElementById('submitExamBtn');

        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                this.showAnswerReview();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.confirmSubmitExam();
            });
        }
    }

    /**
     * 设置导航控制
     */
    setupNavigationControls() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const saveBtn = document.getElementById('saveProgressBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousQuestion();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextQuestion();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProgress();
            });
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    }

    /**
     * 更新计时器显示
     */
    updateTimer(timeData) {
        if (!this.timerDisplay) return;

        const { timeRemaining, totalTime } = timeData;
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;

        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerDisplay.textContent = timeString;

        // 时间警告
        const percentage = (timeRemaining / totalTime) * 100;
        this.timerDisplay.className = 'time-remaining';
        
        if (percentage <= 10) {
            this.timerDisplay.classList.add('time-critical');
        } else if (percentage <= 25) {
            this.timerDisplay.classList.add('time-warning');
        }
    }

    /**
     * 更新进度显示
     */
    updateProgress(answered, total) {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        const answeredCount = document.getElementById('answeredCount');
        const remainingCount = document.getElementById('remainingCount');

        if (progressText) {
            progressText.textContent = `${answered}/${total}`;
        }

        if (progressFill) {
            const percentage = total > 0 ? (answered / total) * 100 : 0;
            progressFill.style.width = `${percentage}%`;
        }

        if (answeredCount) {
            answeredCount.textContent = `已答: ${answered}`;
        }

        if (remainingCount) {
            remainingCount.textContent = `剩余: ${total - answered}`;
        }

        // 更新状态面板
        this.updateStatusPanel(answered, total);
    }

    /**
     * 更新状态面板
     */
    updateStatusPanel(answered, total) {
        const totalEl = document.getElementById('totalQuestions');
        const completedEl = document.getElementById('completedQuestions');
        const rateEl = document.getElementById('completionRate');

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = answered;
        if (rateEl) {
            const rate = total > 0 ? Math.round((answered / total) * 100) : 0;
            rateEl.textContent = `${rate}%`;
        }
    }

    /**
     * 更新答题状态
     */
    updateAnswerStatus(answerData) {
        const { questionId, answer, totalAnswered, totalQuestions } = answerData;
        
        // 更新答题状态记录
        this.answerStatus.set(questionId, answer);
        
        // 更新进度
        this.updateProgress(totalAnswered, totalQuestions);
        
        // 更新题目导航状态
        this.updateQuestionNavStatus();
    }

    /**
     * 更新题目导航状态
     */
    updateQuestionNavStatus() {
        if (!window.examSimulatorManager) return;

        const questions = window.examSimulatorManager.getQuestions();
        questions.forEach((question, index) => {
            if (question.type === 'passage') return; // 跳过段落

            const statusEl = document.getElementById(`status-${index}`);
            if (statusEl) {
                const isAnswered = window.examSimulatorManager.isAnswered(question.id);
                const isCurrent = window.examSimulatorManager.getCurrentQuestion()?.id === question.id;

                if (isCurrent) {
                    statusEl.textContent = '◉';
                    statusEl.className = 'question-status current';
                } else if (isAnswered) {
                    statusEl.textContent = '●';
                    statusEl.className = 'question-status answered';
                } else {
                    statusEl.textContent = '○';
                    statusEl.className = 'question-status unanswered';
                }
            }
        });
    }

    /**
     * 考试恢复时的处理
     */
    onExamRestored(examStatus) {
        this.currentExamData = examStatus;
        this.showNotification('检测到未完成的考试，已自动恢复', 'info');
        this.refreshUI();
    }

    /**
     * 刷新UI
     */
    refreshUI() {
        if (!this.currentExamData) return;

        this.updateProgress(this.currentExamData.answeredCount, this.currentExamData.totalQuestions);
        this.updateQuestionNavStatus();
        
        if (this.currentExamData.status === 'paused') {
            this.showPausedState();
        } else {
            this.hidePausedState();
        }
    }

    /**
     * 显示暂停状态
     */
    showPausedState() {
        const pauseBtn = document.getElementById('pauseExamBtn');
        const resumeBtn = document.getElementById('resumeExamBtn');

        if (pauseBtn) pauseBtn.style.display = 'none';
        if (resumeBtn) resumeBtn.style.display = 'inline-flex';

        this.showNotification('考试已暂停', 'warning');
    }

    /**
     * 隐藏暂停状态
     */
    hidePausedState() {
        const pauseBtn = document.getElementById('pauseExamBtn');
        const resumeBtn = document.getElementById('resumeExamBtn');

        if (pauseBtn) pauseBtn.style.display = 'inline-flex';
        if (resumeBtn) resumeBtn.style.display = 'none';
    }

    /**
     * 暂停考试
     */
    pauseExam() {
        if (window.examSimulatorManager) {
            window.examSimulatorManager.pauseExam();
            this.showPausedState();
        }
    }

    /**
     * 恢复考试
     */
    resumeExam() {
        if (window.examSimulatorManager) {
            window.examSimulatorManager.resumeExam();
            this.hidePausedState();
            this.showNotification('考试已恢复', 'success');
        }
    }

    /**
     * 跳转到指定题目
     */
    goToQuestion(index) {
        if (window.examSimulatorManager) {
            if (window.examSimulatorManager.goToQuestion(index)) {
                this.updateQuestionNavStatus();
                this.showNotification(`已跳转到第 ${index + 1} 题`, 'info');
            }
        }
    }

    /**
     * 上一题
     */
    previousQuestion() {
        if (window.examSimulatorManager) {
            if (window.examSimulatorManager.previousQuestion()) {
                this.updateQuestionNavStatus();
            }
        }
    }

    /**
     * 下一题
     */
    nextQuestion() {
        if (window.examSimulatorManager) {
            if (window.examSimulatorManager.nextQuestion()) {
                this.updateQuestionNavStatus();
            }
        }
    }

    /**
     * 保存进度
     */
    saveProgress() {
        if (window.examSimulatorManager && window.examSimulatorManager.saveExamProgress) {
            window.examSimulatorManager.saveExamProgress();
            this.showNotification('进度已保存', 'success');
        }
    }

    /**
     * 切换全屏模式
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                this.showNotification('无法进入全屏模式', 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * 切换导航面板
     */
    toggleNavigationPanel() {
        const navGrid = document.getElementById('questionNavGrid');
        const toggleBtn = document.getElementById('toggleNavBtn');

        if (navGrid && toggleBtn) {
            const isHidden = navGrid.style.display === 'none';
            navGrid.style.display = isHidden ? 'grid' : 'none';
            toggleBtn.textContent = isHidden ? '收起' : '展开';
        }
    }

    /**
     * 显示答案检查
     */
    showAnswerReview() {
        // 实现答案检查逻辑
        this.showNotification('答案检查功能开发中', 'info');
    }

    /**
     * 确认提交考试
     */
    confirmSubmitExam() {
        if (!window.examSimulatorManager) return;

        const status = window.examSimulatorManager.getCurrentExamStatus();
        if (!status) return;

        const answered = status.answeredCount;
        const total = status.totalQuestions;
        const unanswered = total - answered;

        let message = '确定要提交考试吗？';
        if (unanswered > 0) {
            message += `\n\n还有 ${unanswered} 题未作答，提交后将无法修改。`;
        }

        if (confirm(message)) {
            window.examSimulatorManager.finishExam();
            this.showNotification('考试已提交', 'success');
        }
    }

    /**
     * 显示考试开始通知
     */
    showExamStartNotification() {
        this.showNotification('考试已开始，祝您考试顺利！', 'success');
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * 清理UI
     */
    cleanup() {
        // 清理计时器和事件监听器
        this.currentExamData = null;
        this.answerStatus.clear();
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.ExamUIController = ExamUIController;
    console.log('🎨 考试UI控制器已加载');
}
