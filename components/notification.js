/**
 * 通知组件
 */
class Notification {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    static init() {
        if (!window.Notification) {
            window.Notification = new Notification();
        }
        return window.Notification;
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        this.container = document.getElementById('notifications');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notifications';
            this.container.className = 'notifications';
            document.body.appendChild(this.container);
        }

        // 添加样式
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notifications {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                }

                .notification {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    margin-bottom: 10px;
                    padding: 16px;
                    border-left: 4px solid #007bff;
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    position: relative;
                }

                .notification.show {
                    opacity: 1;
                    transform: translateX(0);
                }

                .notification.success {
                    border-left-color: #28a745;
                }

                .notification.error {
                    border-left-color: #dc3545;
                }

                .notification.warning {
                    border-left-color: #ffc107;
                }

                .notification.info {
                    border-left-color: #17a2b8;
                }

                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .notification-title {
                    font-weight: bold;
                    color: #333;
                    margin: 0;
                }

                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #999;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .notification-close:hover {
                    color: #333;
                }

                .notification-message {
                    color: #666;
                    line-height: 1.4;
                }

                .notification-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: rgba(0,0,0,0.1);
                    transition: width linear;
                }

                @media (max-width: 768px) {
                    .notifications {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    show(message, options = {}) {
        const {
            type = 'info',
            title = '',
            duration = 5000,
            persistent = false
        } = options;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const id = Date.now().toString();
        notification.dataset.id = id;

        notification.innerHTML = `
            <div class="notification-header">
                ${title ? `<h4 class="notification-title">${title}</h4>` : ''}
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-message">${message}</div>
            ${!persistent && duration > 0 ? '<div class="notification-progress"></div>' : ''}
        `;

        this.container.appendChild(notification);

        // 绑定关闭事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(id);
        });

        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // 自动关闭
        if (!persistent && duration > 0) {
            const progressBar = notification.querySelector('.notification-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transitionDuration = `${duration}ms`;
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 100);
            }

            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        this.notifications.push({
            id,
            element: notification,
            type,
            message,
            timestamp: Date.now()
        });

        return id;
    }

    remove(id) {
        const notification = this.container.querySelector(`[data-id="${id}"]`);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);

            this.notifications = this.notifications.filter(n => n.id !== id);
        }
    }

    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
    }

    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error', duration: 8000 });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning', duration: 6000 });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }
}

// 创建全局实例
window.Notification = new Notification();
