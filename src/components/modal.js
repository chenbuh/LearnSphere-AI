/**
 * 模态框组件
 * 提供模态框的显示、隐藏和交互功能
 */

class Modal {
    static instance = null;
    
    constructor() {
        if (Modal.instance) {
            return Modal.instance;
        }
        
        this.modal = null;
        this.isVisible = false;
        this.callbacks = {};
        
        this.init();
        Modal.instance = this;
    }

    /**
     * 初始化模态框
     */
    init() {
        this.modal = document.getElementById('modal');
        if (!this.modal) {
            this.createModal();
        }
        
        this.bindEvents();
    }

    /**
     * 创建模态框DOM
     */
    createModal() {
        const modalHTML = `
            <div class="modal" id="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">标题</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <!-- 模态框内容 -->
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">取消</button>
                        <button class="btn btn-primary" data-action="confirm">确定</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('modal');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.modal) return;

        // 关闭按钮事件
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // 背景点击关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // 按钮事件
        this.modal.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleAction(action);
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * 显示模态框
     * @param {Object} options - 配置选项
     */
    show(options = {}) {
        if (!this.modal) return;

        const {
            title = '提示',
            content = '',
            showCancel = true,
            showConfirm = true,
            cancelText = '取消',
            confirmText = '确定',
            onCancel = null,
            onConfirm = null,
            closable = true
        } = options;

        // 设置标题
        const titleElement = this.modal.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }

        // 设置内容
        const bodyElement = this.modal.querySelector('.modal-body');
        if (bodyElement) {
            if (typeof content === 'string') {
                bodyElement.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                bodyElement.innerHTML = '';
                bodyElement.appendChild(content);
            }
        }

        // 设置按钮
        const cancelBtn = this.modal.querySelector('[data-action="cancel"]');
        const confirmBtn = this.modal.querySelector('[data-action="confirm"]');
        
        if (cancelBtn) {
            cancelBtn.textContent = cancelText;
            cancelBtn.style.display = showCancel ? 'block' : 'none';
        }
        
        if (confirmBtn) {
            confirmBtn.textContent = confirmText;
            confirmBtn.style.display = showConfirm ? 'block' : 'none';
        }

        // 设置关闭按钮
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.style.display = closable ? 'block' : 'none';
        }

        // 保存回调函数
        this.callbacks = { onCancel, onConfirm };

        // 显示模态框
        this.modal.classList.add('show');
        this.isVisible = true;

        // 聚焦到确认按钮
        if (confirmBtn && showConfirm) {
            setTimeout(() => confirmBtn.focus(), 100);
        }

        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
    }

    /**
     * 隐藏模态框
     */
    hide() {
        if (!this.modal || !this.isVisible) return;

        this.modal.classList.remove('show');
        this.isVisible = false;

        // 恢复背景滚动
        document.body.style.overflow = '';

        // 清除回调函数
        this.callbacks = {};
    }

    /**
     * 处理按钮动作
     * @param {string} action - 动作类型
     */
    handleAction(action) {
        if (action === 'cancel') {
            if (this.callbacks.onCancel) {
                const result = this.callbacks.onCancel();
                if (result !== false) {
                    this.hide();
                }
            } else {
                this.hide();
            }
        } else if (action === 'confirm') {
            if (this.callbacks.onConfirm) {
                const result = this.callbacks.onConfirm();
                if (result !== false) {
                    this.hide();
                }
            } else {
                this.hide();
            }
        }
    }

    /**
     * 显示确认对话框
     * @param {string} message - 消息内容
     * @param {Object} options - 配置选项
     * @returns {Promise<boolean>} 用户选择结果
     */
    static confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modal = Modal.getInstance();
            modal.show({
                title: options.title || '确认',
                content: message,
                showCancel: true,
                showConfirm: true,
                cancelText: options.cancelText || '取消',
                confirmText: options.confirmText || '确定',
                onCancel: () => {
                    resolve(false);
                },
                onConfirm: () => {
                    resolve(true);
                }
            });
        });
    }

    /**
     * 显示警告对话框
     * @param {string} message - 消息内容
     * @param {Object} options - 配置选项
     * @returns {Promise<void>} Promise对象
     */
    static alert(message, options = {}) {
        return new Promise((resolve) => {
            const modal = Modal.getInstance();
            modal.show({
                title: options.title || '提示',
                content: message,
                showCancel: false,
                showConfirm: true,
                confirmText: options.confirmText || '确定',
                onConfirm: () => {
                    resolve();
                }
            });
        });
    }

    /**
     * 显示输入对话框
     * @param {string} message - 消息内容
     * @param {Object} options - 配置选项
     * @returns {Promise<string|null>} 用户输入结果
     */
    static prompt(message, options = {}) {
        return new Promise((resolve) => {
            const inputHTML = `
                <p>${message}</p>
                <input type="text" class="form-control" id="prompt-input" 
                       placeholder="${options.placeholder || ''}" 
                       value="${options.defaultValue || ''}">
            `;

            const modal = Modal.getInstance();
            modal.show({
                title: options.title || '输入',
                content: inputHTML,
                showCancel: true,
                showConfirm: true,
                cancelText: options.cancelText || '取消',
                confirmText: options.confirmText || '确定',
                onCancel: () => {
                    resolve(null);
                },
                onConfirm: () => {
                    const input = document.getElementById('prompt-input');
                    const value = input ? input.value.trim() : '';
                    resolve(value);
                }
            });

            // 聚焦到输入框
            setTimeout(() => {
                const input = document.getElementById('prompt-input');
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        });
    }

    /**
     * 显示自定义内容模态框
     * @param {HTMLElement|string} content - 内容
     * @param {Object} options - 配置选项
     */
    static showContent(content, options = {}) {
        const modal = Modal.getInstance();
        modal.show({
            content,
            showCancel: false,
            showConfirm: false,
            closable: options.closable !== false,
            ...options
        });
    }

    /**
     * 隐藏模态框
     */
    static hide() {
        const modal = Modal.getInstance();
        modal.hide();
    }

    /**
     * 获取实例
     * @returns {Modal} Modal实例
     */
    static getInstance() {
        if (!Modal.instance) {
            Modal.instance = new Modal();
        }
        return Modal.instance;
    }

    /**
     * 初始化静态方法
     */
    static init() {
        Modal.getInstance();
    }

    /**
     * 检查是否可见
     * @returns {boolean} 是否可见
     */
    static isVisible() {
        const modal = Modal.getInstance();
        return modal.isVisible;
    }
}

// 导出Modal类
window.Modal = Modal;
