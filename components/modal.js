/**
 * 模态框组件
 */
class Modal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.init();
    }

    static init() {
        if (!window.Modal) {
            window.Modal = new Modal();
        }
        return window.Modal;
    }

    init() {
        this.modal = document.getElementById('modal');
        if (!this.modal) {
            this.createModal();
        }
        this.bindEvents();
    }

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

    bindEvents() {
        if (!this.modal) return;

        // 关闭按钮
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // 背景点击关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open(options = {}) {
        if (!this.modal) return;

        const { title, content, showFooter = true } = options;

        if (title) {
            const titleElement = this.modal.querySelector('.modal-title');
            if (titleElement) titleElement.textContent = title;
        }

        if (content) {
            const bodyElement = this.modal.querySelector('.modal-body');
            if (bodyElement) bodyElement.innerHTML = content;
        }

        const footerElement = this.modal.querySelector('.modal-footer');
        if (footerElement) {
            footerElement.style.display = showFooter ? 'block' : 'none';
        }

        this.modal.style.display = 'block';
        this.isOpen = true;

        // 焦点管理
        setTimeout(() => {
            const firstFocusable = this.modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) firstFocusable.focus();
        }, 100);
    }

    close() {
        if (!this.modal) return;
        
        this.modal.style.display = 'none';
        this.isOpen = false;
    }

    confirm(message, callback) {
        this.open({
            title: '确认',
            content: `<p>${message}</p>`,
            showFooter: true
        });

        const confirmBtn = this.modal.querySelector('[data-action="confirm"]');
        const cancelBtn = this.modal.querySelector('[data-action="cancel"]');

        const handleConfirm = () => {
            this.close();
            if (callback) callback(true);
            cleanup();
        };

        const handleCancel = () => {
            this.close();
            if (callback) callback(false);
            cleanup();
        };

        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    }

    alert(message, callback) {
        this.open({
            title: '提示',
            content: `<p>${message}</p>`,
            showFooter: false
        });

        const closeHandler = () => {
            this.close();
            if (callback) callback();
            this.modal.removeEventListener('click', closeHandler);
        };

        // 添加确定按钮
        const footer = this.modal.querySelector('.modal-footer');
        footer.innerHTML = '<button class="btn btn-primary" id="alertOk">确定</button>';
        footer.style.display = 'block';

        document.getElementById('alertOk').addEventListener('click', closeHandler);
    }
}

// 创建全局实例
window.Modal = new Modal();
