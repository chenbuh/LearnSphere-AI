/**
 * 进度条组件
 */
class Progress {
    constructor() {
        this.progressBars = new Map();
        this.init();
    }

    init() {
        this.addStyles();
    }

    addStyles() {
        if (!document.getElementById('progress-styles')) {
            const styles = document.createElement('style');
            styles.id = 'progress-styles';
            styles.textContent = `
                .progress-container {
                    background: #f0f0f0;
                    border-radius: 10px;
                    overflow: hidden;
                    position: relative;
                    height: 20px;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #007bff, #0056b3);
                    border-radius: 10px;
                    transition: width 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .progress-bar.success {
                    background: linear-gradient(90deg, #28a745, #1e7e34);
                }

                .progress-bar.warning {
                    background: linear-gradient(90deg, #ffc107, #e0a800);
                }

                .progress-bar.error {
                    background: linear-gradient(90deg, #dc3545, #c82333);
                }

                .progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }

                .progress-bar.animated::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    background: linear-gradient(
                        -45deg,
                        rgba(255,255,255,0.2) 25%,
                        transparent 25%,
                        transparent 50%,
                        rgba(255,255,255,0.2) 50%,
                        rgba(255,255,255,0.2) 75%,
                        transparent 75%,
                        transparent
                    );
                    background-size: 30px 30px;
                    animation: progressAnimation 2s linear infinite;
                }

                @keyframes progressAnimation {
                    0% {
                        background-position: 0 0;
                    }
                    100% {
                        background-position: 30px 0;
                    }
                }

                .circular-progress {
                    position: relative;
                    width: 100px;
                    height: 100px;
                }

                .circular-progress svg {
                    transform: rotate(-90deg);
                    width: 100%;
                    height: 100%;
                }

                .circular-progress .progress-circle {
                    fill: none;
                    stroke: #f0f0f0;
                    stroke-width: 8;
                }

                .circular-progress .progress-circle.active {
                    stroke: #007bff;
                    stroke-dasharray: 283;
                    stroke-dashoffset: 283;
                    transition: stroke-dashoffset 0.5s ease;
                }

                .circular-progress .progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-weight: bold;
                    color: #333;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    create(container, options = {}) {
        const {
            type = 'linear',
            value = 0,
            max = 100,
            showText = true,
            animated = false,
            color = 'primary'
        } = options;

        const id = Date.now().toString();
        
        if (type === 'circular') {
            return this.createCircularProgress(container, { id, value, max, showText, color });
        } else {
            return this.createLinearProgress(container, { id, value, max, showText, animated, color });
        }
    }

    createLinearProgress(container, options) {
        const { id, value, max, showText, animated, color } = options;
        
        const progressHTML = `
            <div class="progress-container" data-progress-id="${id}">
                <div class="progress-bar ${color} ${animated ? 'animated' : ''}" 
                     style="width: ${(value / max) * 100}%">
                    ${showText ? `<div class="progress-text">${Math.round((value / max) * 100)}%</div>` : ''}
                </div>
            </div>
        `;

        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (container) {
            container.innerHTML = progressHTML;
        }

        this.progressBars.set(id, {
            container,
            type: 'linear',
            value,
            max,
            showText,
            animated,
            color
        });

        return id;
    }

    createCircularProgress(container, options) {
        const { id, value, max, showText, color } = options;
        const percentage = (value / max) * 100;
        const circumference = 2 * Math.PI * 45; // radius = 45
        const offset = circumference - (percentage / 100) * circumference;

        const progressHTML = `
            <div class="circular-progress" data-progress-id="${id}">
                <svg>
                    <circle class="progress-circle" cx="50" cy="50" r="45"></circle>
                    <circle class="progress-circle active" cx="50" cy="50" r="45" 
                            style="stroke-dashoffset: ${offset}"></circle>
                </svg>
                ${showText ? `<div class="progress-text">${Math.round(percentage)}%</div>` : ''}
            </div>
        `;

        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (container) {
            container.innerHTML = progressHTML;
        }

        this.progressBars.set(id, {
            container,
            type: 'circular',
            value,
            max,
            showText,
            color
        });

        return id;
    }

    update(id, newValue) {
        const progress = this.progressBars.get(id);
        if (!progress) return;

        progress.value = newValue;
        const percentage = (newValue / progress.max) * 100;

        if (progress.type === 'linear') {
            const progressBar = progress.container.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
                
                if (progress.showText) {
                    const textElement = progressBar.querySelector('.progress-text');
                    if (textElement) {
                        textElement.textContent = `${Math.round(percentage)}%`;
                    }
                }
            }
        } else if (progress.type === 'circular') {
            const circle = progress.container.querySelector('.progress-circle.active');
            if (circle) {
                const circumference = 2 * Math.PI * 45;
                const offset = circumference - (percentage / 100) * circumference;
                circle.style.strokeDashoffset = offset;
                
                if (progress.showText) {
                    const textElement = progress.container.querySelector('.progress-text');
                    if (textElement) {
                        textElement.textContent = `${Math.round(percentage)}%`;
                    }
                }
            }
        }
    }

    setColor(id, color) {
        const progress = this.progressBars.get(id);
        if (!progress) return;

        progress.color = color;
        
        if (progress.type === 'linear') {
            const progressBar = progress.container.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.className = `progress-bar ${color} ${progress.animated ? 'animated' : ''}`;
            }
        }
    }

    remove(id) {
        const progress = this.progressBars.get(id);
        if (progress && progress.container) {
            progress.container.innerHTML = '';
        }
        this.progressBars.delete(id);
    }

    // 便捷方法
    linear(container, value = 0, max = 100) {
        return this.create(container, { type: 'linear', value, max });
    }

    circular(container, value = 0, max = 100) {
        return this.create(container, { type: 'circular', value, max });
    }
}

// 创建全局实例
window.Progress = new Progress();
