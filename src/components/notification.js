/**
 * 通知组件
 * 提供各种类型的通知消息功能
 */

class Notification {
    static instance = null;
    
    constructor() {
        if (Notification.instance) {
            return Notification.instance;
        }
        
        this.container = null;
        this.notifications = new Map();
        this.defaultDuration = 5000;
        this.maxNotifications = 5;
        
        this.init();
        Notification.instance = this;
    }

    /**
     * 初始化通知系统
     */
    init() {
        this.createContainer();
    }

    /**
     * 创建通知容器
     */
    createContainer() {
        this.container = document.getElementById('notifications');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notifications';
            this.container.className = 'notifications';
            document.body.appendChild(this.container);
        }
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success, warning, error, info)
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    show(message, type = 'info', options = {}) {
        const {
            title = '',
            duration = this.defaultDuration,
            closable = true,
            icon = this.getDefaultIcon(type),
            onClick = null,
            onClose = null
        } = options;

        // 生成唯一ID
        const id = Utils.generateId();

        // 限制通知数量
        if (this.notifications.size >= this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.hide(oldestId);
        }

        // 创建通知元素
        const notification = this.createNotificationElement(id, message, type, {
            title, icon, closable, onClick
        });

        // 添加到容器
        this.container.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 保存到映射
        const notificationData = {
            element: notification,
            type,
            message,
            onClose
        };
        this.notifications.set(id, notificationData);

        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        return id;
    }

    /**
     * 创建通知元素
     * @param {string} id - 通知ID
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型
     * @param {Object} options - 配置选项
     * @returns {HTMLElement} 通知元素
     */
    createNotificationElement(id, message, type, options) {
        const { title, icon, closable, onClick } = options;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        if (onClick) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', onClick);
        }

        const iconElement = document.createElement('div');
        iconElement.className = 'notification-icon';
        iconElement.textContent = icon;

        const contentElement = document.createElement('div');
        contentElement.className = 'notification-content';

        if (title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'notification-title';
            titleElement.textContent = title;
            contentElement.appendChild(titleElement);
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        contentElement.appendChild(messageElement);

        notification.appendChild(iconElement);
        notification.appendChild(contentElement);

        if (closable) {
            const closeButton = document.createElement('button');
            closeButton.className = 'notification-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide(id);
            });
            notification.appendChild(closeButton);
        }

        return notification;
    }

    /**
     * 隐藏通知
     * @param {string} id - 通知ID
     */
    hide(id) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;

        const { element, onClose } = notificationData;

        // 隐藏动画
        element.classList.add('hide');

        // 移除元素
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);

            // 执行关闭回调
            if (onClose) {
                onClose();
            }
        }, 300);
    }

    /**
     * 隐藏所有通知
     */
    hideAll() {
        const ids = Array.from(this.notifications.keys());
        ids.forEach(id => this.hide(id));
    }

    /**
     * 获取默认图标
     * @param {string} type - 通知类型
     * @returns {string} 图标
     */
    getDefaultIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * 更新通知配置
     * @param {Object} config - 配置对象
     */
    setConfig(config) {
        if (config.defaultDuration !== undefined) {
            this.defaultDuration = config.defaultDuration;
        }
        if (config.maxNotifications !== undefined) {
            this.maxNotifications = config.maxNotifications;
        }
    }

    /**
     * 获取当前通知数量
     * @returns {number} 通知数量
     */
    getCount() {
        return this.notifications.size;
    }

    /**
     * 检查是否有指定类型的通知
     * @param {string} type - 通知类型
     * @returns {boolean} 是否存在
     */
    hasType(type) {
        for (const notification of this.notifications.values()) {
            if (notification.type === type) {
                return true;
            }
        }
        return false;
    }

    // ===== 静态便捷方法 =====

    /**
     * 显示成功通知
     * @param {string} message - 消息内容
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    static success(message, options = {}) {
        const instance = Notification.getInstance();
        return instance.show(message, 'success', options);
    }

    /**
     * 显示警告通知
     * @param {string} message - 消息内容
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    static warning(message, options = {}) {
        const instance = Notification.getInstance();
        return instance.show(message, 'warning', options);
    }

    /**
     * 显示错误通知
     * @param {string} message - 消息内容
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    static error(message, options = {}) {
        const instance = Notification.getInstance();
        return instance.show(message, 'error', {
            duration: 8000, // 错误通知显示更长时间
            ...options
        });
    }

    /**
     * 显示信息通知
     * @param {string} message - 消息内容
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    static info(message, options = {}) {
        const instance = Notification.getInstance();
        return instance.show(message, 'info', options);
    }

    /**
     * 显示加载通知
     * @param {string} message - 消息内容
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    static loading(message = '加载中...', options = {}) {
        const instance = Notification.getInstance();
        return instance.show(message, 'info', {
            icon: '⏳',
            duration: 0, // 不自动隐藏
            closable: false,
            ...options
        });
    }

    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    static show(message, type = 'info', options = {}) {
        const instance = Notification.getInstance();
        return instance.show(message, type, options);
    }

    /**
     * 隐藏通知
     * @param {string} id - 通知ID
     */
    static hide(id) {
        const instance = Notification.getInstance();
        instance.hide(id);
    }

    /**
     * 隐藏所有通知
     */
    static hideAll() {
        const instance = Notification.getInstance();
        instance.hideAll();
    }

    /**
     * 获取实例
     * @returns {Notification} Notification实例
     */
    static getInstance() {
        if (!Notification.instance) {
            Notification.instance = new Notification();
        }
        return Notification.instance;
    }

    /**
     * 初始化静态方法
     */
    static init() {
        Notification.getInstance();
    }

    /**
     * 设置全局配置
     * @param {Object} config - 配置对象
     */
    static setConfig(config) {
        const instance = Notification.getInstance();
        instance.setConfig(config);
    }

    // ===== 特殊通知方法 =====

    /**
     * 显示进度通知
     * @param {string} message - 消息内容
     * @param {number} progress - 进度 (0-100)
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    static progress(message, progress = 0, options = {}) {
        const progressHTML = `
            <div>${message}</div>
            <div class="progress-bar" style="width: 100%; height: 4px; background: #e9ecef; border-radius: 2px; margin-top: 8px;">
                <div class="progress-fill" style="width: ${progress}%; height: 100%; background: var(--primary-color); border-radius: 2px; transition: width 0.3s;"></div>
            </div>
        `;

        const instance = Notification.getInstance();
        return instance.show(progressHTML, 'info', {
            duration: 0,
            closable: false,
            ...options
        });
    }

    /**
     * 更新进度通知
     * @param {string} id - 通知ID
     * @param {number} progress - 新的进度值
     * @param {string} message - 新的消息（可选）
     */
    static updateProgress(id, progress, message = null) {
        const instance = Notification.getInstance();
        const notificationData = instance.notifications.get(id);
        
        if (notificationData) {
            const progressFill = notificationData.element.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            if (message) {
                const messageElement = notificationData.element.querySelector('.notification-message');
                if (messageElement) {
                    const firstLine = messageElement.querySelector('div');
                    if (firstLine) {
                        firstLine.textContent = message;
                    }
                }
            }
        }
    }

    /**
     * 显示持久通知（不自动消失）
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型
     * @param {Object} options - 配置选项
     * @returns {string} 通知ID
     */
    static persist(message, type = 'info', options = {}) {
        const instance = Notification.getInstance();
        return instance.show(message, type, {
            duration: 0, // 不自动隐藏
            ...options
        });
    }
}

// 导出Notification类
window.Notification = Notification;
