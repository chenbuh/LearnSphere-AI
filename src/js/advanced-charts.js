/**
 * 高级图表组件
 * 提供丰富的数据可视化功能
 */
class AdvancedCharts {
    constructor() {
        this.charts = {};
        this.themes = {
            default: {
                primary: '#007bff',
                secondary: '#6c757d',
                success: '#28a745',
                warning: '#ffc107',
                danger: '#dc3545',
                info: '#17a2b8'
            },
            dark: {
                primary: '#0d6efd',
                secondary: '#6c757d',
                success: '#198754',
                warning: '#ffc107',
                danger: '#dc3545',
                info: '#0dcaf0'
            }
        };
        this.currentTheme = 'default';
        this.animationDuration = 800;
        this.init();
    }

    init() {
        console.log('📊 初始化高级图表组件...');
        this.setupChartStyles();
    }

    /**
     * 设置图表样式
     */
    setupChartStyles() {
        const styles = `
            .chart-container {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                margin-bottom: 2rem;
                position: relative;
                overflow: hidden;
            }

            .chart-title {
                font-size: 1.2rem;
                font-weight: bold;
                color: #333;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .chart-canvas {
                width: 100%;
                height: 300px;
                position: relative;
            }

            .chart-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin-top: 1rem;
                justify-content: center;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }

            .legend-color {
                width: 12px;
                height: 12px;
                border-radius: 2px;
            }

            .chart-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 300px;
                color: #6c757d;
            }

            .chart-error {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 300px;
                color: #dc3545;
                flex-direction: column;
                gap: 1rem;
            }

            .chart-tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 0.5rem;
                border-radius: 5px;
                font-size: 0.8rem;
                pointer-events: none;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            @media (max-width: 768px) {
                .chart-container {
                    padding: 1rem;
                }
                
                .chart-canvas {
                    height: 250px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * 创建进度环形图
     */
    createProgressRing(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            size: options.size || 150,
            strokeWidth: options.strokeWidth || 12,
            backgroundColor: options.backgroundColor || '#e9ecef',
            progressColor: options.progressColor || this.themes[this.currentTheme].primary,
            textColor: options.textColor || '#333',
            showPercentage: options.showPercentage !== false,
            animated: options.animated !== false,
            ...options
        };

        container.innerHTML = `
            <div class="progress-ring-container" style="width: ${config.size}px; height: ${config.size}px; position: relative;">
                <svg width="${config.size}" height="${config.size}" style="transform: rotate(-90deg);">
                    <circle
                        cx="${config.size / 2}"
                        cy="${config.size / 2}"
                        r="${(config.size - config.strokeWidth) / 2}"
                        stroke="${config.backgroundColor}"
                        stroke-width="${config.strokeWidth}"
                        fill="transparent"
                    />
                    <circle
                        class="progress-circle"
                        cx="${config.size / 2}"
                        cy="${config.size / 2}"
                        r="${(config.size - config.strokeWidth) / 2}"
                        stroke="${config.progressColor}"
                        stroke-width="${config.strokeWidth}"
                        fill="transparent"
                        stroke-linecap="round"
                        stroke-dasharray="${2 * Math.PI * (config.size - config.strokeWidth) / 2}"
                        stroke-dashoffset="${2 * Math.PI * (config.size - config.strokeWidth) / 2}"
                        style="transition: stroke-dashoffset ${this.animationDuration}ms ease-in-out;"
                    />
                </svg>
                <div class="progress-text" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    color: ${config.textColor};
                    font-weight: bold;
                ">
                    <div class="progress-value" style="font-size: ${config.size / 6}px;">${config.showPercentage ? Math.round(data.value * 100) + '%' : data.value}</div>
                    <div class="progress-label" style="font-size: ${config.size / 12}px; opacity: 0.7;">${data.label || ''}</div>
                </div>
            </div>
        `;

        // 动画效果
        if (config.animated) {
            setTimeout(() => {
                const circle = container.querySelector('.progress-circle');
                const circumference = 2 * Math.PI * (config.size - config.strokeWidth) / 2;
                const offset = circumference - (data.value * circumference);
                circle.style.strokeDashoffset = offset;
            }, 100);
        }

        return container;
    }

    /**
     * 创建技能雷达图
     */
    createSkillRadar(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            size: options.size || 300,
            levels: options.levels || 5,
            backgroundColor: options.backgroundColor || '#f8f9fa',
            gridColor: options.gridColor || '#dee2e6',
            fillColor: options.fillColor || this.themes[this.currentTheme].primary,
            strokeColor: options.strokeColor || this.themes[this.currentTheme].primary,
            ...options
        };

        const center = config.size / 2;
        const radius = center - 50;
        const angleStep = (2 * Math.PI) / data.skills.length;

        let svgContent = `
            <svg width="${config.size}" height="${config.size}" viewBox="0 0 ${config.size} ${config.size}">
                <defs>
                    <filter id="drop-shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
                    </filter>
                </defs>
        `;

        // 绘制背景网格
        for (let level = 1; level <= config.levels; level++) {
            const levelRadius = (radius * level) / config.levels;
            let pathData = '';
            
            data.skills.forEach((skill, index) => {
                const angle = index * angleStep;
                const x = center + Math.cos(angle) * levelRadius;
                const y = center + Math.sin(angle) * levelRadius;
                
                if (index === 0) {
                    pathData += `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            });
            pathData += ' Z';

            svgContent += `
                <path d="${pathData}" 
                      fill="none" 
                      stroke="${config.gridColor}" 
                      stroke-width="1"/>
            `;
        }

        // 绘制从中心到各个顶点的线
        data.skills.forEach((skill, index) => {
            const angle = index * angleStep;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            
            svgContent += `
                <line x1="${center}" y1="${center}" 
                      x2="${x}" y2="${y}" 
                      stroke="${config.gridColor}" 
                      stroke-width="1"/>
            `;
        });

        // 绘制数据区域
        let dataPath = '';
        data.skills.forEach((skill, index) => {
            const angle = index * angleStep;
            const skillRadius = (radius * skill.value) / 100;
            const x = center + Math.cos(angle) * skillRadius;
            const y = center + Math.sin(angle) * skillRadius;
            
            if (index === 0) {
                dataPath += `M ${x} ${y}`;
            } else {
                dataPath += ` L ${x} ${y}`;
            }
        });
        dataPath += ' Z';

        svgContent += `
            <path d="${dataPath}" 
                  fill="${config.fillColor}40" 
                  stroke="${config.strokeColor}" 
                  stroke-width="2"
                  filter="url(#drop-shadow)"/>
        `;

        // 绘制数据点
        data.skills.forEach((skill, index) => {
            const angle = index * angleStep;
            const skillRadius = (radius * skill.value) / 100;
            const x = center + Math.cos(angle) * skillRadius;
            const y = center + Math.sin(angle) * skillRadius;
            
            svgContent += `
                <circle cx="${x}" cy="${y}" r="4" 
                        fill="${config.strokeColor}" 
                        stroke="white" 
                        stroke-width="2"/>
            `;
        });

        // 添加标签
        data.skills.forEach((skill, index) => {
            const angle = index * angleStep;
            const labelRadius = radius + 20;
            const x = center + Math.cos(angle) * labelRadius;
            const y = center + Math.sin(angle) * labelRadius;
            
            svgContent += `
                <text x="${x}" y="${y}" 
                      text-anchor="middle" 
                      dominant-baseline="middle" 
                      font-size="12" 
                      fill="#333">
                    ${skill.name}
                </text>
            `;
        });

        svgContent += '</svg>';

        container.innerHTML = `
            <div class="radar-chart">
                ${svgContent}
            </div>
        `;

        return container;
    }

    /**
     * 创建学习趋势图
     */
    createTrendChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            width: options.width || container.clientWidth || 400,
            height: options.height || 200,
            margin: { top: 20, right: 30, bottom: 30, left: 40 },
            lineColor: options.lineColor || this.themes[this.currentTheme].primary,
            areaColor: options.areaColor || this.themes[this.currentTheme].primary + '20',
            gridColor: options.gridColor || '#e9ecef',
            ...options
        };

        const chartWidth = config.width - config.margin.left - config.margin.right;
        const chartHeight = config.height - config.margin.top - config.margin.bottom;

        // 计算数据范围
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const valueRange = maxValue - minValue || 1;

        let svgContent = `
            <svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}">
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${config.lineColor};stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:${config.lineColor};stop-opacity:0" />
                    </linearGradient>
                </defs>
                <g transform="translate(${config.margin.left}, ${config.margin.top})">
        `;

        // 绘制网格线
        for (let i = 0; i <= 5; i++) {
            const y = (chartHeight * i) / 5;
            svgContent += `
                <line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" 
                      stroke="${config.gridColor}" stroke-width="1" opacity="0.5"/>
            `;
        }

        // 生成路径数据
        let linePath = '';
        let areaPath = '';
        
        data.forEach((point, index) => {
            const x = (chartWidth * index) / (data.length - 1);
            const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                linePath += `M ${x} ${y}`;
                areaPath += `M ${x} ${chartHeight} L ${x} ${y}`;
            } else {
                linePath += ` L ${x} ${y}`;
                areaPath += ` L ${x} ${y}`;
            }
            
            if (index === data.length - 1) {
                areaPath += ` L ${x} ${chartHeight} Z`;
            }
        });

        // 绘制区域
        svgContent += `
            <path d="${areaPath}" fill="url(#areaGradient)"/>
        `;

        // 绘制线条
        svgContent += `
            <path d="${linePath}" 
                  fill="none" 
                  stroke="${config.lineColor}" 
                  stroke-width="3" 
                  stroke-linecap="round"/>
        `;

        // 绘制数据点
        data.forEach((point, index) => {
            const x = (chartWidth * index) / (data.length - 1);
            const y = chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
            
            svgContent += `
                <circle cx="${x}" cy="${y}" r="4" 
                        fill="${config.lineColor}" 
                        stroke="white" 
                        stroke-width="2"
                        class="data-point"
                        data-value="${point.value}"
                        data-label="${point.label || ''}"/>
            `;
        });

        svgContent += `
                </g>
            </svg>
        `;

        container.innerHTML = `
            <div class="trend-chart">
                ${svgContent}
            </div>
        `;

        // 添加交互事件
        this.addTrendChartInteractions(container);

        return container;
    }

    /**
     * 创建成就树状图
     */
    createAchievementTree(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            width: options.width || container.clientWidth || 600,
            height: options.height || 400,
            nodeSize: options.nodeSize || 40,
            levelHeight: options.levelHeight || 80,
            ...options
        };

        // 计算布局
        const levels = this.calculateTreeLevels(data);
        const maxWidth = Math.max(...levels.map(level => level.length));
        
        container.innerHTML = `
            <div class="achievement-tree" style="position: relative; width: ${config.width}px; height: ${config.height}px; overflow-x: auto;">
                ${this.renderTreeLevel(levels, config)}
            </div>
        `;

        return container;
    }

    /**
     * 创建学习热力图
     */
    createHeatmap(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            cellSize: options.cellSize || 15,
            cellGap: options.cellGap || 2,
            weeks: options.weeks || 52,
            colors: options.colors || ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
            ...options
        };

        const totalWidth = (config.cellSize + config.cellGap) * 7;
        const totalHeight = (config.cellSize + config.cellGap) * config.weeks;

        let svgContent = `
            <svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
        `;

        // 绘制热力图格子
        for (let week = 0; week < config.weeks; week++) {
            for (let day = 0; day < 7; day++) {
                const x = day * (config.cellSize + config.cellGap);
                const y = week * (config.cellSize + config.cellGap);
                
                // 计算日期
                const date = new Date();
                date.setDate(date.getDate() - (config.weeks - week) * 7 + day);
                const dateStr = date.toISOString().split('T')[0];
                
                // 获取数据值
                const dayData = data.find(d => d.date === dateStr);
                const value = dayData ? dayData.value : 0;
                const colorIndex = Math.min(Math.floor(value * config.colors.length), config.colors.length - 1);
                const color = config.colors[colorIndex];
                
                svgContent += `
                    <rect x="${x}" y="${y}" 
                          width="${config.cellSize}" 
                          height="${config.cellSize}" 
                          fill="${color}" 
                          rx="2" ry="2"
                          class="heatmap-cell"
                          data-date="${dateStr}"
                          data-value="${value}">
                        <title>${dateStr}: ${value}</title>
                    </rect>
                `;
            }
        }

        svgContent += '</svg>';

        container.innerHTML = `
            <div class="heatmap-container">
                <div class="heatmap-header">
                    <h4>学习活动热力图</h4>
                    <div class="heatmap-legend">
                        <span>少</span>
                        ${config.colors.map(color => `<div style="width: 10px; height: 10px; background: ${color}; margin: 0 1px;"></div>`).join('')}
                        <span>多</span>
                    </div>
                </div>
                <div class="heatmap-chart">
                    ${svgContent}
                </div>
            </div>
        `;

        return container;
    }

    /**
     * 创建动态计数器
     */
    createCounter(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const config = {
            duration: options.duration || 2000,
            formatValue: options.formatValue || (v => Math.round(v)),
            prefix: options.prefix || '',
            suffix: options.suffix || '',
            color: options.color || this.themes[this.currentTheme].primary,
            ...options
        };

        container.innerHTML = `
            <div class="counter-container" style="text-align: center;">
                <div class="counter-value" style="
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: ${config.color};
                    margin-bottom: 0.5rem;
                ">${config.prefix}0${config.suffix}</div>
                <div class="counter-label" style="
                    font-size: 1rem;
                    color: #6c757d;
                ">${data.label}</div>
            </div>
        `;

        // 动画计数
        const valueElement = container.querySelector('.counter-value');
        const startValue = 0;
        const endValue = data.value;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / config.duration, 1);
            
            // 使用缓动函数
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (endValue - startValue) * easeProgress;
            
            valueElement.textContent = config.prefix + config.formatValue(currentValue) + config.suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);

        return container;
    }

    /**
     * 添加趋势图交互
     */
    addTrendChartInteractions(container) {
        const dataPoints = container.querySelectorAll('.data-point');
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        container.appendChild(tooltip);

        dataPoints.forEach(point => {
            point.addEventListener('mouseenter', (e) => {
                const value = e.target.dataset.value;
                const label = e.target.dataset.label;
                
                tooltip.innerHTML = `
                    <div><strong>${label}</strong></div>
                    <div>值: ${value}</div>
                `;
                
                tooltip.style.opacity = '1';
                this.updateTooltipPosition(e, tooltip);
            });

            point.addEventListener('mousemove', (e) => {
                this.updateTooltipPosition(e, tooltip);
            });

            point.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }

    /**
     * 更新提示框位置
     */
    updateTooltipPosition(event, tooltip) {
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    }

    /**
     * 计算树状结构层级
     */
    calculateTreeLevels(data) {
        const levels = [];
        const visited = new Set();
        
        // 找到根节点（没有父节点的节点）
        const roots = data.filter(node => !node.parent);
        
        const processLevel = (nodes, level) => {
            if (!levels[level]) levels[level] = [];
            
            nodes.forEach(node => {
                if (!visited.has(node.id)) {
                    visited.add(node.id);
                    levels[level].push(node);
                    
                    // 找到子节点
                    const children = data.filter(child => child.parent === node.id);
                    if (children.length > 0) {
                        processLevel(children, level + 1);
                    }
                }
            });
        };
        
        processLevel(roots, 0);
        return levels;
    }

    /**
     * 渲染树状层级
     */
    renderTreeLevel(levels, config) {
        let html = '';
        
        levels.forEach((level, levelIndex) => {
            const y = levelIndex * config.levelHeight;
            const levelWidth = config.width;
            const nodeSpacing = levelWidth / (level.length + 1);
            
            level.forEach((node, nodeIndex) => {
                const x = (nodeIndex + 1) * nodeSpacing;
                const status = node.unlocked ? (node.completed ? 'completed' : 'unlocked') : 'locked';
                
                html += `
                    <div class="achievement-node ${status}" style="
                        position: absolute;
                        left: ${x - config.nodeSize/2}px;
                        top: ${y}px;
                        width: ${config.nodeSize}px;
                        height: ${config.nodeSize}px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        ${this.getNodeStyles(status)}
                    " title="${node.title}">
                        ${node.icon}
                    </div>
                `;
            });
        });
        
        return html;
    }

    /**
     * 获取节点样式
     */
    getNodeStyles(status) {
        const styles = {
            completed: 'background: #28a745; color: white; box-shadow: 0 0 20px rgba(40, 167, 69, 0.5);',
            unlocked: 'background: #007bff; color: white; box-shadow: 0 0 15px rgba(0, 123, 255, 0.3);',
            locked: 'background: #e9ecef; color: #6c757d; border: 2px dashed #dee2e6;'
        };
        return styles[status] || styles.locked;
    }

    /**
     * 设置主题
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            console.log(`🎨 图表主题已切换到: ${themeName}`);
        }
    }

    /**
     * 销毁图表
     */
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            delete this.charts[chartId];
            const container = document.getElementById(chartId);
            if (container) {
                container.innerHTML = '';
            }
        }
    }

    /**
     * 销毁所有图表
     */
    destroyAll() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
        console.log('📊 所有图表已销毁');
    }
}

// 创建全局实例
window.AdvancedCharts = new AdvancedCharts();
