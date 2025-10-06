/**
 * 增强可视化图表组件
 * 提供丰富的数据可视化功能
 */
class EnhancedChartComponents {
    constructor() {
        this.charts = new Map();
        this.animations = new Map();
        this.themes = {
            light: {
                background: '#ffffff',
                text: '#333333',
                primary: '#007bff',
                secondary: '#6c757d',
                success: '#28a745',
                warning: '#ffc107',
                danger: '#dc3545',
                grid: '#e9ecef'
            },
            dark: {
                background: '#1a1a1a',
                text: '#ffffff',
                primary: '#4dabf7',
                secondary: '#adb5bd',
                success: '#51cf66',
                warning: '#ffd43b',
                danger: '#ff6b6b',
                grid: '#495057'
            }
        };
        this.currentTheme = 'light';
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.detectTheme();
        this.setupThemeListener();
        console.log('📊 增强可视化图表组件已初始化');
    }

    /**
     * 检测当前主题
     */
    detectTheme() {
        const theme = document.documentElement.getAttribute('data-theme') || 
                     localStorage.getItem('theme') ||
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.setTheme(theme);
    }

    /**
     * 设置主题
     */
    setTheme(theme) {
        this.currentTheme = theme;
        // 重新渲染所有图表
        this.charts.forEach((chartData, id) => {
            this.updateChartTheme(id, chartData);
        });
    }

    /**
     * 设置主题监听器
     */
    setupThemeListener() {
        // 监听主题变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.detectTheme();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.detectTheme();
        });
    }

    /**
     * 创建进度环形图
     */
    createProgressRing(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('容器未找到:', containerId);
            return;
        }

        const defaultOptions = {
            size: 120,
            strokeWidth: 8,
            foregroundColor: this.themes[this.currentTheme].primary,
            backgroundColor: this.themes[this.currentTheme].grid,
            textColor: this.themes[this.currentTheme].text,
            animationDuration: 1000,
            showPercentage: true,
            showLabel: true
        };

        const config = { ...defaultOptions, ...options };
        const { size, strokeWidth, foregroundColor, backgroundColor, textColor } = config;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const percentage = Math.max(0, Math.min(100, data.percentage || 0));
        const offset = circumference - (percentage / 100) * circumference;

        const svg = `
            <svg width="${size}" height="${size}" class="progress-ring">
                <circle
                    cx="${size / 2}"
                    cy="${size / 2}"
                    r="${radius}"
                    stroke="${backgroundColor}"
                    stroke-width="${strokeWidth}"
                    fill="transparent"
                    class="progress-ring-background"
                />
                <circle
                    cx="${size / 2}"
                    cy="${size / 2}"
                    r="${radius}"
                    stroke="${foregroundColor}"
                    stroke-width="${strokeWidth}"
                    fill="transparent"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference}"
                    stroke-linecap="round"
                    class="progress-ring-foreground"
                    transform="rotate(-90 ${size / 2} ${size / 2})"
                />
                ${config.showPercentage ? `
                    <text
                        x="${size / 2}"
                        y="${size / 2 - 5}"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="${textColor}"
                        font-size="${size * 0.15}"
                        font-weight="bold"
                        class="progress-percentage"
                    >${Math.round(percentage)}%</text>
                ` : ''}
                ${config.showLabel && data.label ? `
                    <text
                        x="${size / 2}"
                        y="${size / 2 + 15}"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="${textColor}"
                        font-size="${size * 0.08}"
                        class="progress-label"
                    >${data.label}</text>
                ` : ''}
            </svg>
        `;

        container.innerHTML = svg;

        // 添加动画
        if (config.animationDuration > 0) {
            const circle = container.querySelector('.progress-ring-foreground');
            const percentageText = container.querySelector('.progress-percentage');
            
            this.animateProgressRing(circle, percentageText, circumference, offset, percentage, config.animationDuration);
        }

        // 保存图表数据
        this.charts.set(containerId, {
            type: 'progressRing',
            data,
            options: config,
            element: container
        });
    }

    /**
     * 动画进度环
     */
    animateProgressRing(circle, percentageText, circumference, finalOffset, finalPercentage, duration) {
        const startTime = performance.now();
        const startOffset = circumference;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用缓动函数
            const easeProgress = this.easeOutCubic(progress);
            
            const currentOffset = startOffset - (startOffset - finalOffset) * easeProgress;
            const currentPercentage = finalPercentage * easeProgress;
            
            circle.style.strokeDashoffset = currentOffset;
            
            if (percentageText) {
                percentageText.textContent = Math.round(currentPercentage) + '%';
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 创建柱状图
     */
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('容器未找到:', containerId);
            return;
        }

        const defaultOptions = {
            width: container.clientWidth || 400,
            height: options.height || 200,
            margin: { top: 20, right: 20, bottom: 40, left: 40 },
            barColor: this.themes[this.currentTheme].primary,
            textColor: this.themes[this.currentTheme].text,
            gridColor: this.themes[this.currentTheme].grid,
            showValues: true,
            showGrid: true,
            animationDuration: 800
        };

        const config = { ...defaultOptions, ...options };
        const { width, height, margin } = config;
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // 计算数据范围
        const maxValue = Math.max(...data.map(d => d.value));
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length * 0.2;

        let svg = `
            <svg width="${width}" height="${height}" class="bar-chart">
                <defs>
                    <linearGradient id="barGradient-${containerId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${config.barColor};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${config.barColor};stop-opacity:0.7" />
                    </linearGradient>
                </defs>
        `;

        // 添加网格线
        if (config.showGrid) {
            const gridLines = 5;
            for (let i = 0; i <= gridLines; i++) {
                const y = margin.top + (chartHeight / gridLines) * i;
                svg += `
                    <line
                        x1="${margin.left}"
                        y1="${y}"
                        x2="${width - margin.right}"
                        y2="${y}"
                        stroke="${config.gridColor}"
                        stroke-width="1"
                        opacity="0.3"
                    />
                `;
                
                // 添加Y轴标签
                const value = maxValue * (1 - i / gridLines);
                svg += `
                    <text
                        x="${margin.left - 10}"
                        y="${y + 4}"
                        text-anchor="end"
                        fill="${config.textColor}"
                        font-size="12"
                        opacity="0.7"
                    >${Math.round(value)}</text>
                `;
            }
        }

        // 添加柱子
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
            const y = margin.top + chartHeight - barHeight;

            svg += `
                <rect
                    x="${x}"
                    y="${margin.top + chartHeight}"
                    width="${barWidth}"
                    height="0"
                    fill="url(#barGradient-${containerId})"
                    rx="4"
                    class="bar-rect"
                    data-final-y="${y}"
                    data-final-height="${barHeight}"
                />
            `;

            // 添加数值标签
            if (config.showValues) {
                svg += `
                    <text
                        x="${x + barWidth / 2}"
                        y="${y - 5}"
                        text-anchor="middle"
                        fill="${config.textColor}"
                        font-size="12"
                        font-weight="bold"
                        class="bar-value"
                        opacity="0"
                    >${item.value}</text>
                `;
            }

            // 添加X轴标签
            svg += `
                <text
                    x="${x + barWidth / 2}"
                    y="${height - 10}"
                    text-anchor="middle"
                    fill="${config.textColor}"
                    font-size="12"
                    class="bar-label"
                >${item.label}</text>
            `;
        });

        svg += '</svg>';
        container.innerHTML = svg;

        // 添加动画
        if (config.animationDuration > 0) {
            this.animateBarChart(container, config.animationDuration);
        }

        // 保存图表数据
        this.charts.set(containerId, {
            type: 'barChart',
            data,
            options: config,
            element: container
        });
    }

    /**
     * 动画柱状图
     */
    animateBarChart(container, duration) {
        const bars = container.querySelectorAll('.bar-rect');
        const values = container.querySelectorAll('.bar-value');
        
        bars.forEach((bar, index) => {
            const finalY = parseFloat(bar.getAttribute('data-final-y'));
            const finalHeight = parseFloat(bar.getAttribute('data-final-height'));
            
            setTimeout(() => {
                bar.style.transition = `y ${duration}ms ease-out, height ${duration}ms ease-out`;
                bar.setAttribute('y', finalY);
                bar.setAttribute('height', finalHeight);
                
                // 显示数值
                if (values[index]) {
                    setTimeout(() => {
                        values[index].style.transition = 'opacity 300ms ease-in';
                        values[index].style.opacity = '1';
                    }, duration * 0.8);
                }
            }, index * 100);
        });
    }

    /**
     * 创建雷达图
     */
    createRadarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('容器未找到:', containerId);
            return;
        }

        const defaultOptions = {
            size: 300,
            levels: 5,
            strokeColor: this.themes[this.currentTheme].primary,
            fillColor: this.themes[this.currentTheme].primary + '40',
            gridColor: this.themes[this.currentTheme].grid,
            textColor: this.themes[this.currentTheme].text,
            animationDuration: 1000
        };

        const config = { ...defaultOptions, ...options };
        const { size } = config;
        const center = size / 2;
        const radius = size * 0.35;
        const angleStep = (2 * Math.PI) / data.length;

        let svg = `
            <svg width="${size}" height="${size}" class="radar-chart">
                <defs>
                    <filter id="glow-${containerId}">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
        `;

        // 绘制网格
        for (let level = 1; level <= config.levels; level++) {
            const levelRadius = (radius / config.levels) * level;
            let pathData = '';
            
            for (let i = 0; i <= data.length; i++) {
                const angle = angleStep * i - Math.PI / 2;
                const x = center + Math.cos(angle) * levelRadius;
                const y = center + Math.sin(angle) * levelRadius;
                pathData += (i === 0 ? 'M' : 'L') + x + ',' + y;
            }
            
            svg += `
                <path
                    d="${pathData}"
                    fill="none"
                    stroke="${config.gridColor}"
                    stroke-width="1"
                    opacity="0.3"
                />
            `;
        }

        // 绘制轴线
        data.forEach((item, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            
            svg += `
                <line
                    x1="${center}"
                    y1="${center}"
                    x2="${x}"
                    y2="${y}"
                    stroke="${config.gridColor}"
                    stroke-width="1"
                    opacity="0.3"
                />
            `;
            
            // 添加标签
            const labelX = center + Math.cos(angle) * (radius + 20);
            const labelY = center + Math.sin(angle) * (radius + 20);
            
            svg += `
                <text
                    x="${labelX}"
                    y="${labelY}"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    fill="${config.textColor}"
                    font-size="12"
                    font-weight="500"
                >${item.label}</text>
            `;
        });

        // 绘制数据多边形
        let dataPath = '';
        const points = [];
        
        data.forEach((item, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const value = Math.max(0, Math.min(100, item.value));
            const distance = (value / 100) * radius;
            const x = center + Math.cos(angle) * distance;
            const y = center + Math.sin(angle) * distance;
            
            points.push({ x, y, value });
            dataPath += (index === 0 ? 'M' : 'L') + x + ',' + y;
        });
        
        dataPath += 'Z';

        svg += `
            <path
                d="${dataPath}"
                fill="${config.fillColor}"
                stroke="${config.strokeColor}"
                stroke-width="2"
                filter="url(#glow-${containerId})"
                class="radar-data-path"
                opacity="0"
            />
        `;

        // 添加数据点
        points.forEach((point, index) => {
            svg += `
                <circle
                    cx="${point.x}"
                    cy="${point.y}"
                    r="4"
                    fill="${config.strokeColor}"
                    stroke="white"
                    stroke-width="2"
                    class="radar-point"
                    opacity="0"
                >
                    <title>${data[index].label}: ${point.value}%</title>
                </circle>
            `;
        });

        svg += '</svg>';
        container.innerHTML = svg;

        // 添加动画
        if (config.animationDuration > 0) {
            this.animateRadarChart(container, config.animationDuration);
        }

        // 保存图表数据
        this.charts.set(containerId, {
            type: 'radarChart',
            data,
            options: config,
            element: container
        });
    }

    /**
     * 动画雷达图
     */
    animateRadarChart(container, duration) {
        const path = container.querySelector('.radar-data-path');
        const points = container.querySelectorAll('.radar-point');
        
        // 路径动画
        setTimeout(() => {
            path.style.transition = `opacity ${duration}ms ease-out`;
            path.style.opacity = '1';
        }, 200);
        
        // 点动画
        points.forEach((point, index) => {
            setTimeout(() => {
                point.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
                point.style.opacity = '1';
                point.style.transform = 'scale(1.2)';
                
                setTimeout(() => {
                    point.style.transform = 'scale(1)';
                }, 150);
            }, 400 + index * 100);
        });
    }

    /**
     * 创建热力图
     */
    createHeatmap(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('容器未找到:', containerId);
            return;
        }

        const defaultOptions = {
            cellSize: 12,
            cellSpacing: 2,
            colorScale: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
            showTooltip: true,
            animationDuration: 1200
        };

        const config = { ...defaultOptions, ...options };
        const { cellSize, cellSpacing, colorScale } = config;
        
        const weeks = data.length;
        const days = data[0] ? data[0].length : 7;
        const width = weeks * (cellSize + cellSpacing) - cellSpacing;
        const height = days * (cellSize + cellSpacing) - cellSpacing + 40; // 额外空间给标签

        let svg = `
            <svg width="${width}" height="${height}" class="heatmap">
        `;

        // 添加月份标签
        const monthLabels = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
        for (let i = 0; i < 12; i++) {
            const x = (weeks / 12) * i * (cellSize + cellSpacing);
            svg += `
                <text
                    x="${x}"
                    y="15"
                    fill="${this.themes[this.currentTheme].text}"
                    font-size="10"
                    opacity="0.7"
                >${monthLabels[i]}月</text>
            `;
        }

        // 添加星期标签
        const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        dayLabels.forEach((day, index) => {
            if (index % 2 === 1) { // 只显示奇数行标签，避免拥挤
                const y = 25 + index * (cellSize + cellSpacing) + cellSize / 2;
                svg += `
                    <text
                        x="-5"
                        y="${y}"
                        fill="${this.themes[this.currentTheme].text}"
                        font-size="9"
                        text-anchor="end"
                        dominant-baseline="middle"
                        opacity="0.7"
                    >${day}</text>
                `;
            }
        });

        // 绘制热力图格子
        data.forEach((week, weekIndex) => {
            week.forEach((value, dayIndex) => {
                const x = weekIndex * (cellSize + cellSpacing);
                const y = 25 + dayIndex * (cellSize + cellSpacing);
                const colorIndex = Math.min(colorScale.length - 1, Math.max(0, value));
                const color = colorScale[colorIndex];
                
                const date = this.getDateFromWeekDay(weekIndex, dayIndex);
                
                svg += `
                    <rect
                        x="${x}"
                        y="${y}"
                        width="${cellSize}"
                        height="${cellSize}"
                        fill="${color}"
                        rx="2"
                        class="heatmap-cell"
                        data-value="${value}"
                        data-date="${date}"
                        opacity="0"
                    >
                        ${config.showTooltip ? `<title>${date}: ${value} 次学习</title>` : ''}
                    </rect>
                `;
            });
        });

        svg += '</svg>';
        container.innerHTML = svg;

        // 添加动画
        if (config.animationDuration > 0) {
            this.animateHeatmap(container, config.animationDuration);
        }

        // 保存图表数据
        this.charts.set(containerId, {
            type: 'heatmap',
            data,
            options: config,
            element: container
        });
    }

    /**
     * 动画热力图
     */
    animateHeatmap(container, duration) {
        const cells = container.querySelectorAll('.heatmap-cell');
        
        cells.forEach((cell, index) => {
            setTimeout(() => {
                cell.style.transition = 'opacity 200ms ease-out';
                cell.style.opacity = '1';
            }, (index % 100) * (duration / 100)); // 分批显示，避免一次性加载太多
        });
    }

    /**
     * 创建线性图
     */
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('容器未找到:', containerId);
            return;
        }

        const defaultOptions = {
            width: container.clientWidth || 400,
            height: options.height || 200,
            margin: { top: 20, right: 20, bottom: 40, left: 40 },
            lineColor: this.themes[this.currentTheme].primary,
            pointColor: this.themes[this.currentTheme].primary,
            textColor: this.themes[this.currentTheme].text,
            gridColor: this.themes[this.currentTheme].grid,
            showGrid: true,
            showPoints: true,
            showArea: false,
            animationDuration: 1000
        };

        const config = { ...defaultOptions, ...options };
        const { width, height, margin } = config;
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // 计算数据范围
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const valueRange = maxValue - minValue || 1;

        let svg = `
            <svg width="${width}" height="${height}" class="line-chart">
                <defs>
                    <linearGradient id="areaGradient-${containerId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${config.lineColor};stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:${config.lineColor};stop-opacity:0" />
                    </linearGradient>
                </defs>
        `;

        // 添加网格
        if (config.showGrid) {
            const gridLines = 5;
            for (let i = 0; i <= gridLines; i++) {
                const y = margin.top + (chartHeight / gridLines) * i;
                svg += `
                    <line
                        x1="${margin.left}"
                        y1="${y}"
                        x2="${width - margin.right}"
                        y2="${y}"
                        stroke="${config.gridColor}"
                        stroke-width="1"
                        opacity="0.3"
                    />
                `;
            }
        }

        // 计算路径点
        const points = data.map((item, index) => {
            const x = margin.left + (index / (data.length - 1)) * chartWidth;
            const y = margin.top + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
            return { x, y, value: item.value, label: item.label };
        });

        // 绘制面积（如果启用）
        if (config.showArea) {
            let areaPath = `M${points[0].x},${margin.top + chartHeight}`;
            points.forEach(point => {
                areaPath += ` L${point.x},${point.y}`;
            });
            areaPath += ` L${points[points.length - 1].x},${margin.top + chartHeight} Z`;

            svg += `
                <path
                    d="${areaPath}"
                    fill="url(#areaGradient-${containerId})"
                    class="line-area"
                />
            `;
        }

        // 绘制线条
        let linePath = `M${points[0].x},${points[0].y}`;
        points.slice(1).forEach(point => {
            linePath += ` L${point.x},${point.y}`;
        });

        svg += `
            <path
                d="${linePath}"
                fill="none"
                stroke="${config.lineColor}"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="line-path"
                stroke-dasharray="1000"
                stroke-dashoffset="1000"
            />
        `;

        // 绘制数据点
        if (config.showPoints) {
            points.forEach((point, index) => {
                svg += `
                    <circle
                        cx="${point.x}"
                        cy="${point.y}"
                        r="4"
                        fill="${config.pointColor}"
                        stroke="white"
                        stroke-width="2"
                        class="line-point"
                        opacity="0"
                    >
                        <title>${point.label}: ${point.value}</title>
                    </circle>
                `;
            });
        }

        // 添加X轴标签
        points.forEach((point, index) => {
            if (index % Math.ceil(data.length / 6) === 0) { // 显示部分标签避免拥挤
                svg += `
                    <text
                        x="${point.x}"
                        y="${height - 10}"
                        text-anchor="middle"
                        fill="${config.textColor}"
                        font-size="10"
                        opacity="0.7"
                    >${point.label}</text>
                `;
            }
        });

        svg += '</svg>';
        container.innerHTML = svg;

        // 添加动画
        if (config.animationDuration > 0) {
            this.animateLineChart(container, config.animationDuration);
        }

        // 保存图表数据
        this.charts.set(containerId, {
            type: 'lineChart',
            data,
            options: config,
            element: container
        });
    }

    /**
     * 动画线性图
     */
    animateLineChart(container, duration) {
        const path = container.querySelector('.line-path');
        const points = container.querySelectorAll('.line-point');
        
        // 线条动画
        path.style.transition = `stroke-dashoffset ${duration}ms ease-out`;
        path.style.strokeDashoffset = '0';
        
        // 点动画
        points.forEach((point, index) => {
            setTimeout(() => {
                point.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
                point.style.opacity = '1';
                point.style.transform = 'scale(1.3)';
                
                setTimeout(() => {
                    point.style.transform = 'scale(1)';
                }, 150);
            }, duration * 0.7 + index * 50);
        });
    }

    /**
     * 创建饼图
     */
    createPieChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('容器未找到:', containerId);
            return;
        }

        const defaultOptions = {
            size: 200,
            innerRadius: 0, // 0为饼图，>0为环形图
            colors: [
                this.themes[this.currentTheme].primary,
                this.themes[this.currentTheme].success,
                this.themes[this.currentTheme].warning,
                this.themes[this.currentTheme].danger,
                this.themes[this.currentTheme].secondary
            ],
            textColor: this.themes[this.currentTheme].text,
            showLabels: true,
            showValues: true,
            animationDuration: 1000
        };

        const config = { ...defaultOptions, ...options };
        const { size, innerRadius } = config;
        const radius = size / 2 - 10;
        const center = size / 2;

        // 计算总值
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        let svg = `<svg width="${size}" height="${size}" class="pie-chart">`;
        
        let currentAngle = -Math.PI / 2; // 从顶部开始
        
        data.forEach((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 2 * Math.PI;
            const endAngle = currentAngle + angle;
            
            const x1 = center + Math.cos(currentAngle) * radius;
            const y1 = center + Math.sin(currentAngle) * radius;
            const x2 = center + Math.cos(endAngle) * radius;
            const y2 = center + Math.sin(endAngle) * radius;
            
            const largeArcFlag = angle > Math.PI ? 1 : 0;
            
            const color = config.colors[index % config.colors.length];
            
            // 绘制扇形
            let pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            if (innerRadius > 0) {
                // 环形图
                const innerX1 = center + Math.cos(currentAngle) * innerRadius;
                const innerY1 = center + Math.sin(currentAngle) * innerRadius;
                const innerX2 = center + Math.cos(endAngle) * innerRadius;
                const innerY2 = center + Math.sin(endAngle) * innerRadius;
                
                pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`;
            }
            
            svg += `
                <path
                    d="${pathData}"
                    fill="${color}"
                    stroke="white"
                    stroke-width="2"
                    class="pie-slice"
                    opacity="0"
                    data-percentage="${Math.round(percentage * 100)}"
                >
                    <title>${item.label}: ${item.value} (${Math.round(percentage * 100)}%)</title>
                </path>
            `;
            
            // 添加标签
            if (config.showLabels && percentage > 0.05) { // 只显示占比大于5%的标签
                const labelAngle = currentAngle + angle / 2;
                const labelRadius = radius * 0.7;
                const labelX = center + Math.cos(labelAngle) * labelRadius;
                const labelY = center + Math.sin(labelAngle) * labelRadius;
                
                svg += `
                    <text
                        x="${labelX}"
                        y="${labelY}"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        fill="${config.textColor}"
                        font-size="12"
                        font-weight="bold"
                        class="pie-label"
                        opacity="0"
                    >${config.showValues ? Math.round(percentage * 100) + '%' : item.label}</text>
                `;
            }
            
            currentAngle = endAngle;
        });
        
        svg += '</svg>';
        container.innerHTML = svg;

        // 添加动画
        if (config.animationDuration > 0) {
            this.animatePieChart(container, config.animationDuration);
        }

        // 保存图表数据
        this.charts.set(containerId, {
            type: 'pieChart',
            data,
            options: config,
            element: container
        });
    }

    /**
     * 动画饼图
     */
    animatePieChart(container, duration) {
        const slices = container.querySelectorAll('.pie-slice');
        const labels = container.querySelectorAll('.pie-label');
        
        slices.forEach((slice, index) => {
            setTimeout(() => {
                slice.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
                slice.style.opacity = '1';
                slice.style.transformOrigin = 'center';
                slice.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    slice.style.transform = 'scale(1)';
                }, 150);
            }, index * (duration / slices.length));
        });
        
        // 标签动画
        setTimeout(() => {
            labels.forEach((label, index) => {
                setTimeout(() => {
                    label.style.transition = 'opacity 300ms ease-out';
                    label.style.opacity = '1';
                }, index * 50);
            });
        }, duration * 0.7);
    }

    // 辅助方法

    /**
     * 缓动函数
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * 更新图表主题
     */
    updateChartTheme(chartId, chartData) {
        // 重新渲染图表以应用新主题
        const { type, data, options } = chartData;
        
        switch (type) {
            case 'progressRing':
                this.createProgressRing(chartId, data, options);
                break;
            case 'barChart':
                this.createBarChart(chartId, data, options);
                break;
            case 'radarChart':
                this.createRadarChart(chartId, data, options);
                break;
            case 'heatmap':
                this.createHeatmap(chartId, data, options);
                break;
            case 'lineChart':
                this.createLineChart(chartId, data, options);
                break;
            case 'pieChart':
                this.createPieChart(chartId, data, options);
                break;
        }
    }

    /**
     * 根据周和天数获取日期
     */
    getDateFromWeekDay(weekIndex, dayIndex) {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - (52 - weekIndex - 1) * 7 - (7 - dayIndex - 1));
        return targetDate.toLocaleDateString();
    }

    /**
     * 销毁图表
     */
    destroyChart(chartId) {
        if (this.charts.has(chartId)) {
            const chartData = this.charts.get(chartId);
            if (chartData.element) {
                chartData.element.innerHTML = '';
            }
            this.charts.delete(chartId);
        }
    }

    /**
     * 销毁所有图表
     */
    destroyAllCharts() {
        this.charts.forEach((chartData, chartId) => {
            this.destroyChart(chartId);
        });
    }

    /**
     * 获取图表数据
     */
    getChartData(chartId) {
        return this.charts.get(chartId);
    }

    /**
     * 导出图表为图片
     */
    exportChart(chartId, format = 'png') {
        const chartData = this.charts.get(chartId);
        if (!chartData) return null;

        const svg = chartData.element.querySelector('svg');
        if (!svg) return null;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        return new Promise((resolve) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const dataURL = canvas.toDataURL(`image/${format}`);
                resolve(dataURL);
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.EnhancedChartComponents = EnhancedChartComponents;
    console.log('📊 增强可视化图表组件已加载');
}
