/**
 * 社交分享模块
 * 提供学习成果分享功能
 */

class SocialSharing {
    constructor() {
        this.platforms = {
            wechat: {
                name: '微信',
                icon: '💬',
                color: '#07C160'
            },
            weibo: {
                name: '微博',
                icon: '📱',
                color: '#E6162D'
            },
            qq: {
                name: 'QQ',
                icon: '🐧',
                color: '#12B7F5'
            },
            twitter: {
                name: 'Twitter',
                icon: '🐦',
                color: '#1DA1F2'
            },
            facebook: {
                name: 'Facebook',
                icon: '📘',
                color: '#4267B2'
            }
        };

        this.init();
    }

    init() {
        console.log('📤 社交分享模块已初始化');
        this.createShareButton();
    }

    /**
     * 创建分享按钮
     */
    createShareButton() {
        const shareBtn = document.createElement('button');
        shareBtn.id = 'social-share-btn';
        shareBtn.className = 'social-share-btn';
        shareBtn.innerHTML = '📤 分享学习成果';
        shareBtn.title = '分享到社交平台';

        shareBtn.addEventListener('click', () => {
            this.showShareModal();
        });

        // 添加到页面
        document.body.appendChild(shareBtn);

        // 添加样式
        this.addStyles();
    }

    /**
     * 显示分享模态框
     */
    showShareModal() {
        const modal = this.createShareModal();
        document.body.appendChild(modal);

        // 显示动画
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * 创建分享模态框
     */
    createShareModal() {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-backdrop"></div>
            <div class="share-dialog">
                <div class="share-header">
                    <h3>分享学习成果</h3>
                    <button class="share-close">&times;</button>
                </div>
                <div class="share-content">
                    <div class="share-preview">
                        <div class="share-card">
                            <div class="share-icon">📚</div>
                            <div class="share-info">
                                <h4>LearnSphere AI 学习成果</h4>
                                <p>我在 LearnSphere AI 上取得了新的学习进步！</p>
                                <div class="share-stats">
                                    <span>📈 学习时长: ${this.getStudyTime()}</span>
                                    <span>🎯 完成练习: ${this.getCompletedExercises()}次</span>
                                    <span>📚 学习单词: ${this.getWordsLearned()}个</span>
                                    <span>🔥 连续学习: ${this.getStreakDays()}天</span>
                                    <span>🏆 获得积分: ${this.getPoints()}分</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="share-platforms">
                        ${this.renderPlatforms()}
                    </div>
                    <div class="share-link">
                        <input type="text" value="${window.location.href}" readonly>
                        <button class="copy-link-btn">复制链接</button>
                    </div>
                </div>
            </div>
        `;

        // 绑定事件
        this.bindModalEvents(modal);

        return modal;
    }

    /**
     * 渲染分享平台
     */
    renderPlatforms() {
        return Object.entries(this.platforms).map(([key, platform]) => `
            <button class="platform-btn" data-platform="${key}" style="border-color: ${platform.color}">
                <span class="platform-icon">${platform.icon}</span>
                <span class="platform-name">${platform.name}</span>
            </button>
        `).join('');
    }

    /**
     * 绑定模态框事件
     */
    bindModalEvents(modal) {
        // 关闭按钮
        const closeBtn = modal.querySelector('.share-close');
        closeBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });

        // 背景点击关闭
        const backdrop = modal.querySelector('.share-backdrop');
        backdrop.addEventListener('click', () => {
            this.closeModal(modal);
        });

        // 平台分享按钮
        const platformBtns = modal.querySelectorAll('.platform-btn');
        platformBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const platform = btn.dataset.platform;
                this.shareToplatform(platform);
            }, { passive: false });
        });

        // 复制链接按钮
        const copyBtn = modal.querySelector('.copy-link-btn');
        const linkInput = modal.querySelector('input');
        copyBtn.addEventListener('click', () => {
            linkInput.select();
            document.execCommand('copy');
            copyBtn.textContent = '已复制！';
            setTimeout(() => {
                copyBtn.textContent = '复制链接';
            }, 2000);
        });
    }

    /**
     * 分享到平台
     */
    shareToplatform(platform) {
        const shareData = this.getShareData();
        
        switch (platform) {
            case 'wechat':
                this.shareToWechat(shareData);
                break;
            case 'weibo':
                this.shareToWeibo(shareData);
                break;
            case 'qq':
                this.shareToQQ(shareData);
                break;
            case 'twitter':
                this.shareToTwitter(shareData);
                break;
            case 'facebook':
                this.shareToFacebook(shareData);
                break;
        }
    }

    /**
     * 获取分享数据
     */
    getShareData() {
        const studyTime = this.getStudyTime();
        const exercises = this.getCompletedExercises();
        const words = this.getWordsLearned();
        const streak = this.getStreakDays();
        const points = this.getPoints();
        
        return {
            title: 'LearnSphere AI 学习成果',
            text: `我在 LearnSphere AI 上取得了新的学习进步！📈 学习时长: ${studyTime}，🎯 完成练习: ${exercises}次，📚 学习单词: ${words}个，🔥 连续学习: ${streak}天，🏆 获得积分: ${points}分`,
            url: window.location.href
        };
    }

    /**
     * 分享到微信
     */
    shareToWechat(data) {
        // 微信分享显示二维码（简易实现）
        const modal = document.createElement('div');
        modal.className = 'wechat-modal';
        modal.innerHTML = `
            <div class="wechat-backdrop"></div>
            <div class="wechat-dialog">
                <div class="wechat-header">
                    <h4>微信扫一扫分享</h4>
                    <button class="wechat-close">&times;</button>
                </div>
                <div class="wechat-body">
                    <div id="wechat-qrcode" class="wechat-qrcode"></div>
                    <p class="wechat-tip">用微信“扫一扫”扫描二维码即可分享链接</p>
                </div>
            </div>`;

        document.body.appendChild(modal);

        // 生成二维码：多提供商容错（国内可用性更高），按顺序尝试
        const providers = [
            (u) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(u)}`,
            (u) => `https://quickchart.io/qr?size=220&text=${encodeURIComponent(u)}`,
            (u) => `https://image-charts.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(u)}`,
            (u) => `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${encodeURIComponent(u)}`
        ];
        const qr = modal.querySelector('#wechat-qrcode');
        qr.innerHTML = '';

        const loadProvider = (index) => {
            if (index >= providers.length) {
                qr.innerHTML = '<div style="color:#999;font-size:13px;">二维码加载失败，请复制链接分享</div>';
                return;
            }
            const img = new Image();
            img.alt = '微信分享二维码';
            img.width = 220; img.height = 220;
            img.onload = () => {
                qr.innerHTML = '';
                qr.appendChild(img);
            };
            img.onerror = () => {
                // 尝试下一个提供商
                loadProvider(index + 1);
            };
            // 防止长时间白屏，设置超时切换
            const timeout = setTimeout(() => {
                try { img.src = ''; } catch(e) {}
                loadProvider(index + 1);
            }, 2000);
            img.onload = ((origOnload) => () => { clearTimeout(timeout); origOnload(); })(img.onload);
            img.src = providers[index](data.url);
        };
        loadProvider(0);

        const close = () => document.body.removeChild(modal);
        modal.querySelector('.wechat-backdrop').addEventListener('click', close);
        modal.querySelector('.wechat-close').addEventListener('click', close);
    }

    /**
     * 分享到微博
     */
    shareToWeibo(data) {
        const url = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }

    /**
     * 分享到QQ
     */
    shareToQQ(data) {
        const url = `https://connect.qq.com/widget/shareqq/index.html?title=${encodeURIComponent(data.title)}&summary=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }

    /**
     * 分享到Twitter
     */
    shareToTwitter(data) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }

    /**
     * 分享到Facebook
     */
    shareToFacebook(data) {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
        window.open(url, '_blank', 'width=600,height=400');
    }

    /**
     * 显示二维码
     */
    showQRCode(url) {}

    /**
     * 关闭模态框
     */
    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    /**
     * 获取学习时长
     */
    getStudyTime() {
        try {
            // 优先从真实数据统计管理器获取
            if (window.realDataStats) {
                const stats = window.realDataStats.getRealStatistics();
                const totalMinutes = stats.overall.totalStudyTime || 0;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
            }
            
            // 从学习数据获取
            const learningData = JSON.parse(localStorage.getItem('learning_data') || '{}');
            const totalMinutes = learningData.totalStudyTime || 0;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
        } catch (error) {
            console.error('获取学习时长失败:', error);
            return '0分钟';
        }
    }

    /**
     * 获取完成练习数
     */
    getCompletedExercises() {
        try {
            // 从学习会话数据获取
            const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
            const learningActivities = JSON.parse(localStorage.getItem('learning_activities') || '[]');
            
            const totalExercises = studySessions.length + learningActivities.length;
            return totalExercises.toString();
        } catch (error) {
            console.error('获取练习数失败:', error);
            return '0';
        }
    }

    /**
     * 获取积分
     */
    getPoints() {
        try {
            // 从学习数据获取积分
            const learningData = JSON.parse(localStorage.getItem('learning_data') || '{}');
            const points = learningData.totalPoints || 0;
            return points.toString();
        } catch (error) {
            console.error('获取积分失败:', error);
            return '0';
        }
    }

    /**
     * 获取词汇学习数量
     */
    getWordsLearned() {
        try {
            const learningData = JSON.parse(localStorage.getItem('learning_data') || '{}');
            const vocabProgress = learningData.vocabProgress || {};
            
            // 计算掌握程度 >= 2 的单词数
            let learnedCount = 0;
            for (const word in vocabProgress) {
                const progress = vocabProgress[word];
                if (progress && progress.masteryLevel >= 2) {
                    learnedCount++;
                }
            }
            
            return learnedCount || learningData.wordsLearned || 0;
        } catch (error) {
            console.error('获取学习单词数失败:', error);
            return 0;
        }
    }

    /**
     * 获取连续学习天数
     */
    getStreakDays() {
        try {
            const learningData = JSON.parse(localStorage.getItem('learning_data') || '{}');
            return learningData.streakDays || 0;
        } catch (error) {
            console.error('获取连续学习天数失败:', error);
            return 0;
        }
    }

    /**
     * 添加样式
     */
    addStyles() {
        if (document.getElementById('social-share-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'social-share-styles';
        styles.textContent = `
            .social-share-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 15px 25px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                white-space: nowrap;
            }

            .social-share-btn:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
                background: linear-gradient(135deg, #5a6fd8 0%, #6a4c93 100%);
            }

            .social-share-btn:active {
                transform: translateY(-1px) scale(1.02);
                transition: all 0.1s ease;
            }

            .share-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .share-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .share-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
            }

            .share-dialog {
                position: relative;
                background: white;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .share-modal.show .share-dialog {
                transform: scale(1);
            }

            /* 微信二维码弹层 */
            .wechat-modal { position: fixed; inset: 0; z-index: 10002; display:flex; align-items:center; justify-content:center; }
            .wechat-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.45); }
            .wechat-dialog { position:relative; width: 340px; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.25); padding:16px; }
            .wechat-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
            .wechat-close { background:none; border:none; font-size:22px; cursor:pointer; color:#888; }
            .wechat-body { display:flex; flex-direction:column; align-items:center; }
            .wechat-qrcode { width:220px; height:220px; display:flex; align-items:center; justify-content:center; background:#fafafa; border:1px solid #eee; border-radius:8px; }
            .wechat-tip { margin-top:10px; color:#666; font-size:13px; }

            .share-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }

            .share-header h3 {
                margin: 0;
                color: #333;
            }

            .share-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }

            .share-close:hover {
                background: #f5f5f5;
            }

            .share-content {
                padding: 20px;
            }

            .share-preview {
                margin-bottom: 20px;
            }

            .share-card {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }

            .share-icon {
                font-size: 40px;
            }

            .share-info h4 {
                margin: 0 0 5px 0;
                color: #333;
                font-size: 16px;
            }

            .share-info p {
                margin: 0 0 10px 0;
                color: #666;
                font-size: 14px;
            }

            .share-stats {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }

            .share-stats span {
                font-size: 12px;
                color: #888;
            }

            .share-platforms {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
                margin-bottom: 20px;
            }

            .platform-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 15px 10px;
                background: white;
                border: 2px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .platform-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .platform-icon {
                font-size: 24px;
            }

            .platform-name {
                font-size: 12px;
                color: #333;
            }

            .share-link {
                display: flex;
                gap: 10px;
            }

            .share-link input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }

            .copy-link-btn {
                padding: 10px 15px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.3s ease;
            }

            .copy-link-btn:hover {
                background: #0056b3;
            }

            @media (max-width: 768px) {
                .share-dialog {
                    width: 95%;
                    margin: 10px;
                }

                .share-platforms {
                    grid-template-columns: repeat(2, 1fr);
                }

                .share-link {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// 创建全局实例
window.SocialSharing = new SocialSharing();
