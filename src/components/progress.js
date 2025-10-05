/**
 * 进度条组件
 * 提供各种进度显示和动画效果
 */

class Progress {
    static instance = null;
    
    constructor() {
        if (Progress.instance) {
            return Progress.instance;
        }
        
        this.progressBars = new Map();
        
        Progress.instance = this;
    }

    /**
     * 创建进度条
     * @param {HTMLElement|string} container - 容器元素或选择器
     * @param {Object} options - 配置选项
     * @returns {string} 进度条ID
     */
    create(container, options = {}) {
        const {
            value = 0,
            max = 100,
            min = 0,
            showText = true,
            showPercent = true,
            animated = true,
            striped = false,
            color = 'var(--primary-color)',
            height = '8px',
            borderRadius = '4px',
            backgroundColor = 'var(--bg-secondary)',
            textColor = 'var(--text-primary)',
            className = ''
        } = options;

        // 获取容器元素
        const containerElement = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;

        if (!containerElement) {
            console.error('进度条容器未找到');
            return null;
        }

        // 生成唯一ID
        const id = Utils.generateId();

        // 创建进度条元素
        const progressElement = this.createProgressElement(id, {
            value, max, min, showText, showPercent, animated, striped,
            color, height, borderRadius, backgroundColor, textColor, className
        });

        // 添加到容器
        containerElement.appendChild(progressElement);

        // 保存进度条信息
        this.progressBars.set(id, {
            element: progressElement,
            container: containerElement,
            value,
            max,
            min,
            options
        });

        return id;
    }

    /**
     * 创建进度条DOM元素
     * @param {string} id - 进度条ID
     * @param {Object} options - 配置选项
     * @returns {HTMLElement} 进度条元素
     */
    createProgressElement(id, options) {
        const {
            value, max, min, showText, showPercent, animated, striped,
            color, height, borderRadius, backgroundColor, textColor, className
        } = options;

        const progress = document.createElement('div');
        progress.className = `progress-container ${className}`;
        progress.dataset.id = id;

        // 计算百分比
        const percentage = this.calculatePercentage(value, min, max);

        // 创建进度条HTML
        progress.innerHTML = `
            ${showText ? `<div class="progress-text" style="color: ${textColor}; margin-bottom: 4px; font-size: 12px;">
                <span class="progress-label">${showPercent ? `${percentage}%` : `${value}/${max}`}</span>
            </div>` : ''}
            <div class="progress-bar-container" style="
                width: 100%;
                height: ${height};
                background-color: ${backgroundColor};
                border-radius: ${borderRadius};
                overflow: hidden;
                position: relative;
            ">
                <div class="progress-bar-fill ${animated ? 'animated' : ''} ${striped ? 'striped' : ''}" style="
                    width: ${percentage}%;
                    height: 100%;
                    background-color: ${color};
                    transition: width 0.3s ease;
                    ${striped ? `
                        background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
                        background-size: 1rem 1rem;
                    ` : ''}
                    ${animated && striped ? 'animation: progress-bar-stripes 1s linear infinite;' : ''}
                "></div>
            </div>
        `;

        return progress;
    }

    /**
     * 更新进度条值
     * @param {string} id - 进度条ID
     * @param {number} value - 新的值
     * @param {boolean} animate - 是否使用动画
     */
    updateValue(id, value, animate = true) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        const { element, min, max, options } = progressData;
        
        // 更新值
        progressData.value = Math.max(min, Math.min(max, value));
        
        // 计算新的百分比
        const percentage = this.calculatePercentage(progressData.value, min, max);
        
        // 更新进度条
        const fillElement = element.querySelector('.progress-bar-fill');
        if (fillElement) {
            if (animate) {
                fillElement.style.transition = 'width 0.3s ease';
            } else {
                fillElement.style.transition = 'none';
            }
            fillElement.style.width = `${percentage}%`;
        }
        
        // 更新文本
        if (options.showText) {
            const labelElement = element.querySelector('.progress-label');
            if (labelElement) {
                labelElement.textContent = options.showPercent 
                    ? `${percentage}%` 
                    : `${progressData.value}/${max}`;
            }
        }
    }

    /**
     * 设置进度条最大值
     * @param {string} id - 进度条ID
     * @param {number} max - 最大值
     */
    setMax(id, max) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        progressData.max = max;
        this.updateValue(id, progressData.value);
    }

    /**
     * 设置进度条最小值
     * @param {string} id - 进度条ID
     * @param {number} min - 最小值
     */
    setMin(id, min) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        progressData.min = min;
        this.updateValue(id, progressData.value);
    }

    /**
     * 增加进度值
     * @param {string} id - 进度条ID
     * @param {number} increment - 增加的值
     */
    increment(id, increment = 1) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        this.updateValue(id, progressData.value + increment);
    }

    /**
     * 减少进度值
     * @param {string} id - 进度条ID
     * @param {number} decrement - 减少的值
     */
    decrement(id, decrement = 1) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        this.updateValue(id, progressData.value - decrement);
    }

    /**
     * 设置进度条颜色
     * @param {string} id - 进度条ID
     * @param {string} color - 新颜色
     */
    setColor(id, color) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        const fillElement = progressData.element.querySelector('.progress-bar-fill');
        if (fillElement) {
            fillElement.style.backgroundColor = color;
        }
    }

    /**
     * 设置进度条状态
     * @param {string} id - 进度条ID
     * @param {string} status - 状态 (success, warning, error, info)
     */
    setStatus(id, status) {
        const statusColors = {
            success: 'var(--success-color)',
            warning: 'var(--warning-color)',
            error: 'var(--danger-color)',
            info: 'var(--info-color)',
            primary: 'var(--primary-color)'
        };

        const color = statusColors[status] || statusColors.primary;
        this.setColor(id, color);
    }

    /**
     * 启动不确定进度动画
     * @param {string} id - 进度条ID
     */
    startIndeterminate(id) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        const fillElement = progressData.element.querySelector('.progress-bar-fill');
        if (fillElement) {
            fillElement.style.width = '30%';
            fillElement.style.animation = 'progress-indeterminate 2s ease-in-out infinite';
        }
    }

    /**
     * 停止不确定进度动画
     * @param {string} id - 进度条ID
     */
    stopIndeterminate(id) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        const fillElement = progressData.element.querySelector('.progress-bar-fill');
        if (fillElement) {
            fillElement.style.animation = '';
            this.updateValue(id, progressData.value);
        }
    }

    /**
     * 重置进度条
     * @param {string} id - 进度条ID
     */
    reset(id) {
        this.updateValue(id, 0);
    }

    /**
     * 完成进度条（设置为100%）
     * @param {string} id - 进度条ID
     */
    complete(id) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        this.updateValue(id, progressData.max);
    }

    /**
     * 销毁进度条
     * @param {string} id - 进度条ID
     */
    destroy(id) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return;

        const { element } = progressData;
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        
        this.progressBars.delete(id);
    }

    /**
     * 获取进度条值
     * @param {string} id - 进度条ID
     * @returns {number} 当前值
     */
    getValue(id) {
        const progressData = this.progressBars.get(id);
        return progressData ? progressData.value : null;
    }

    /**
     * 获取进度百分比
     * @param {string} id - 进度条ID
     * @returns {number} 百分比
     */
    getPercentage(id) {
        const progressData = this.progressBars.get(id);
        if (!progressData) return null;

        const { value, min, max } = progressData;
        return this.calculatePercentage(value, min, max);
    }

    /**
     * 计算百分比
     * @param {number} value - 当前值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 百分比
     */
    calculatePercentage(value, min, max) {
        if (max === min) return 0;
        return Math.round(((value - min) / (max - min)) * 100);
    }

    /**
     * 批量创建进度条
     * @param {Array} configs - 配置数组
     * @returns {Array} 进度条ID数组
     */
    createBatch(configs) {
        return configs.map(config => this.create(config.container, config.options));
    }

    /**
     * 批量更新进度条
     * @param {Array} updates - 更新数组 [{id, value}, ...]
     */
    updateBatch(updates) {
        updates.forEach(({ id, value }) => {
            this.updateValue(id, value);
        });
    }

    /**
     * 获取所有进度条ID
     * @returns {Array} ID数组
     */
    getAllIds() {
        return Array.from(this.progressBars.keys());
    }

    /**
     * 销毁所有进度条
     */
    destroyAll() {
        const ids = this.getAllIds();
        ids.forEach(id => this.destroy(id));
    }

    // ===== 静态方法 =====

    /**
     * 创建进度条
     * @param {HTMLElement|string} container - 容器
     * @param {Object} options - 选项
     * @returns {string} 进度条ID
     */
    static create(container, options) {
        const instance = Progress.getInstance();
        return instance.create(container, options);
    }

    /**
     * 更新进度条
     * @param {string} id - 进度条ID
     * @param {number} value - 值
     */
    static update(id, value) {
        const instance = Progress.getInstance();
        instance.updateValue(id, value);
    }

    /**
     * 获取实例
     * @returns {Progress} Progress实例
     */
    static getInstance() {
        if (!Progress.instance) {
            Progress.instance = new Progress();
        }
        return Progress.instance;
    }

    /**
     * 初始化
     */
    static init() {
        Progress.getInstance();
        
        // 添加CSS动画
        this.addAnimationStyles();
    }

    /**
     * 添加动画样式
     */
    static addAnimationStyles() {
        if (document.getElementById('progress-animations')) return;

        const style = document.createElement('style');
        style.id = 'progress-animations';
        style.textContent = `
            @keyframes progress-bar-stripes {
                0% { background-position: 1rem 0; }
                100% { background-position: 0 0; }
            }
            
            @keyframes progress-indeterminate {
                0% { left: -35%; right: 100%; }
                60% { left: 100%; right: -90%; }
                100% { left: 100%; right: -90%; }
            }
            
            .progress-bar-fill.animated.striped {
                animation: progress-bar-stripes 1s linear infinite;
            }
        `;
        document.head.appendChild(style);
    }
}

// 导出Progress类
window.Progress = Progress;
