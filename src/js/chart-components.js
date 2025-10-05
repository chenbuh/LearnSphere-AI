/**
 * 图表组件库
 * 提供学习数据的可视化展示
 */

class ChartComponents {
    constructor() {
        this.colors = {
            primary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8',
            secondary: '#6c757d',
            light: '#f8f9fa',
            dark: '#343a40'
        };
        this.gradients = {};
        this.initializeGradients();
    }

    /**
     * 初始化渐变色
     */
    initializeGradients() {
        // 这里可以预定义一些渐变色
        this.gradients = {
            blue: ['#007bff', '#0056b3'],
            green: ['#28a745', '#1e7e34'],
            orange: ['#fd7e14', '#e55100'],
            purple: ['#6f42c1', '#5a2d91']
        };
    }

    /**
     * 创建进度环形图
     */
    createProgressRing(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            size = 120,
            strokeWidth = 8,
            backgroundColor = '#e9ecef',
            foregroundColor = this.colors.primary,
            showPercentage = true,
            animationDuration = 1000
        } = options;

        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const progress = Math.min(100, Math.max(0, data.percentage || 0));
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        container.innerHTML = `
            <div class="progress-ring" style="width: ${size}px; height: ${size}px; position: relative;">
                <svg width="${size}" height="${size}" style="transform: rotate(-90deg);">
                    <circle
                        cx="${size / 2}"
                        cy="${size / 2}"
                        r="${radius}"
                        stroke="${backgroundColor}"
                        stroke-width="${strokeWidth}"
                        fill="none"
                    />
                    <circle
                        cx="${size / 2}"
                        cy="${size / 2}"
                        r="${radius}"
                        stroke="${foregroundColor}"
                        stroke-width="${strokeWidth}"
                        fill="none"
                        stroke-dasharray="${strokeDasharray}"
                        stroke-dashoffset="${strokeDashoffset}"
                        stroke-linecap="round"
                        style="transition: stroke-dashoffset ${animationDuration}ms ease-in-out;"
                    />
                </svg>
                ${showPercentage ? `
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        text-align: center;
                        font-weight: bold;
                        font-size: ${size * 0.15}px;
                        color: ${foregroundColor};
                    ">
                        ${Math.round(progress)}%
                        ${data.label ? `<div style="font-size: ${size * 0.08}px; color: #6c757d; margin-top: 2px;">${data.label}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * 创建条形图
     */
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            height = 300,
            barColor = this.colors.primary,
            showValues = true,
            animationDelay = 100
        } = options;

        const maxValue = Math.max(...data.map(item => item.value));
        const barWidth = 100 / data.length;

        let html = `<div class="bar-chart" style="height: ${height}px; display: flex; align-items: end; padding: 20px 0;">`;

        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            const delay = index * animationDelay;

            html += `
                <div class="bar-item" style="
                    width: ${barWidth}%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin: 0 2px;
                ">
                    ${showValues ? `
                        <div style="
                            font-size: 12px;
                            font-weight: bold;
                            color: ${barColor};
                            margin-bottom: 5px;
                        ">${item.value}</div>
                    ` : ''}
                    <div style="
                        width: 100%;
                        height: ${barHeight}px;
                        background: ${barColor};
                        border-radius: 4px 4px 0 0;
                        animation: barGrow 800ms ease-out ${delay}ms both;
                    "></div>
                    <div style="
                        font-size: 11px;
                        color: #6c757d;
                        margin-top: 8px;
                        text-align: center;
                        word-break: break-all;
                    ">${item.label}</div>
                </div>
            `;
        });

        html += '</div>';

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes barGrow {
                from { height: 0; }
                to { height: ${height - 60}px; }
            }
        `;
        document.head.appendChild(style);

        container.innerHTML = html;
    }

    /**
     * 创建折线图
     */
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            width = 400,
            height = 200,
            lineColor = this.colors.primary,
            pointColor = this.colors.primary,
            gridColor = '#e9ecef',
            showGrid = true,
            showPoints = true,
            animationDuration = 1500
        } = options;

        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        const maxValue = Math.max(...data.map(item => item.value));
        const minValue = Math.min(...data.map(item => item.value));
        const valueRange = maxValue - minValue || 1;

        // 生成路径点
        const points = data.map((item, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
            return { x, y, value: item.value, label: item.label };
        });

        // 生成SVG路径
        const pathData = points.reduce((path, point, index) => {
            return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
        }, '');

        let svg = `<svg width="${width}" height="${height}" style="overflow: visible;">`;

        // 网格线
        if (showGrid) {
            for (let i = 0; i <= 4; i++) {
                const y = padding + (i / 4) * chartHeight;
                svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="${gridColor}" stroke-width="1"/>`;
            }
            for (let i = 0; i < data.length; i++) {
                const x = padding + (i / (data.length - 1)) * chartWidth;
                svg += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="${gridColor}" stroke-width="1"/>`;
            }
        }

        // 折线
        svg += `
            <path d="${pathData}" 
                  stroke="${lineColor}" 
                  stroke-width="3" 
                  fill="none" 
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: drawLine ${animationDuration}ms ease-out forwards;
                  "/>
        `;

        // 数据点
        if (showPoints) {
            points.forEach((point, index) => {
                svg += `
                    <circle cx="${point.x}" cy="${point.y}" r="4" 
                            fill="${pointColor}" 
                            stroke="white" 
                            stroke-width="2"
                            style="
                                opacity: 0;
                                animation: showPoint 300ms ease-out ${animationDuration + index * 100}ms forwards;
                            "/>
                `;
            });
        }

        // X轴标签
        points.forEach(point => {
            if (point.label) {
                svg += `
                    <text x="${point.x}" y="${height - 10}" 
                          text-anchor="middle" 
                          font-size="11" 
                          fill="#6c757d">${point.label}</text>
                `;
            }
        });

        svg += '</svg>';

        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes drawLine {
                to { stroke-dashoffset: 0; }
            }
            @keyframes showPoint {
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        container.innerHTML = svg;
    }

    /**
     * 创建雷达图
     */
    createRadarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            size = 300,
            levels = 5,
            strokeColor = this.colors.primary,
            fillColor = this.colors.primary + '40',
            gridColor = '#e9ecef',
            labelColor = '#6c757d'
        } = options;

        const center = size / 2;
        const radius = center - 50;
        const angleStep = (2 * Math.PI) / data.length;

        let svg = `<svg width="${size}" height="${size}">`;

        // 绘制网格
        for (let level = 1; level <= levels; level++) {
            const r = (radius / levels) * level;
            let path = '';
            for (let i = 0; i < data.length; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const x = center + Math.cos(angle) * r;
                const y = center + Math.sin(angle) * r;
                path += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
            }
            path += ' Z';
            svg += `<path d="${path}" stroke="${gridColor}" stroke-width="1" fill="none"/>`;
        }

        // 绘制轴线
        for (let i = 0; i < data.length; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="${gridColor}" stroke-width="1"/>`;
        }

        // 绘制数据区域
        let dataPath = '';
        data.forEach((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const value = Math.min(1, Math.max(0, item.value / 100)); // 标准化到0-1
            const r = radius * value;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            dataPath += (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
        });
        dataPath += ' Z';

        svg += `<path d="${dataPath}" stroke="${strokeColor}" stroke-width="2" fill="${fillColor}"/>`;

        // 绘制数据点
        data.forEach((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const value = Math.min(1, Math.max(0, item.value / 100));
            const r = radius * value;
            const x = center + Math.cos(angle) * r;
            const y = center + Math.sin(angle) * r;
            svg += `<circle cx="${x}" cy="${y}" r="3" fill="${strokeColor}"/>`;
        });

        // 添加标签
        data.forEach((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = radius + 20;
            const x = center + Math.cos(angle) * labelRadius;
            const y = center + Math.sin(angle) * labelRadius;
            
            svg += `
                <text x="${x}" y="${y}" 
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      font-size="12" 
                      fill="${labelColor}">${item.label}</text>
            `;
        });

        svg += '</svg>';
        container.innerHTML = svg;
    }

    /**
     * 创建热力图
     */
    createHeatmap(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            cellSize = 20,
            cellSpacing = 2,
            colorScale = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
            showLabels = true
        } = options;

        const weeks = data.length;
        const days = data[0] ? data[0].length : 7;
        const width = weeks * (cellSize + cellSpacing);
        const height = days * (cellSize + cellSpacing);

        // 计算数据范围用于颜色映射
        const flatData = data.flat();
        const maxValue = Math.max(...flatData);
        const minValue = Math.min(...flatData);

        let html = `<div class="heatmap" style="display: inline-block;">`;
        html += `<svg width="${width}" height="${height}">`;

        data.forEach((week, weekIndex) => {
            week.forEach((value, dayIndex) => {
                const x = weekIndex * (cellSize + cellSpacing);
                const y = dayIndex * (cellSize + cellSpacing);
                
                // 计算颜色索引
                let colorIndex = 0;
                if (maxValue > minValue) {
                    colorIndex = Math.floor(((value - minValue) / (maxValue - minValue)) * (colorScale.length - 1));
                }
                const color = colorScale[Math.max(0, Math.min(colorScale.length - 1, colorIndex))];

                html += `
                    <rect x="${x}" y="${y}" 
                          width="${cellSize}" height="${cellSize}" 
                          fill="${color}" 
                          rx="2" ry="2"
                          title="Week ${weekIndex + 1}, Day ${dayIndex + 1}: ${value}">
                    </rect>
                `;
            });
        });

        html += '</svg>';
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * 创建仪表盘
     */
    createGauge(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            size = 200,
            min = 0,
            max = 100,
            value = data.value || 0,
            title = data.title || '',
            unit = data.unit || '',
            colors = ['#dc3545', '#ffc107', '#28a745']
        } = options;

        const radius = size / 2 - 20;
        const center = size / 2;
        const startAngle = -Math.PI * 0.75;
        const endAngle = Math.PI * 0.75;
        const angleRange = endAngle - startAngle;

        // 计算当前值的角度
        const valueAngle = startAngle + (value - min) / (max - min) * angleRange;

        let svg = `<svg width="${size}" height="${size * 0.75}">`;

        // 背景弧
        const bgPath = this.describeArc(center, center, radius, startAngle, endAngle);
        svg += `<path d="${bgPath}" stroke="#e9ecef" stroke-width="20" fill="none"/>`;

        // 彩色区段
        const segmentAngle = angleRange / colors.length;
        colors.forEach((color, index) => {
            const segmentStart = startAngle + index * segmentAngle;
            const segmentEnd = startAngle + (index + 1) * segmentAngle;
            const segmentPath = this.describeArc(center, center, radius, segmentStart, segmentEnd);
            svg += `<path d="${segmentPath}" stroke="${color}" stroke-width="20" fill="none" opacity="0.3"/>`;
        });

        // 值弧
        const valuePath = this.describeArc(center, center, radius, startAngle, valueAngle);
        svg += `<path d="${valuePath}" stroke="${colors[Math.floor((value / max) * colors.length)]} " stroke-width="20" fill="none"/>`;

        // 指针
        const needleX = center + Math.cos(valueAngle) * (radius - 10);
        const needleY = center + Math.sin(valueAngle) * (radius - 10);
        svg += `<line x1="${center}" y1="${center}" x2="${needleX}" y2="${needleY}" stroke="#343a40" stroke-width="3" stroke-linecap="round"/>`;
        svg += `<circle cx="${center}" cy="${center}" r="8" fill="#343a40"/>`;

        // 刻度
        for (let i = 0; i <= 10; i++) {
            const tickAngle = startAngle + (i / 10) * angleRange;
            const tickStart = radius - 5;
            const tickEnd = radius + 5;
            const x1 = center + Math.cos(tickAngle) * tickStart;
            const y1 = center + Math.sin(tickAngle) * tickStart;
            const x2 = center + Math.cos(tickAngle) * tickEnd;
            const y2 = center + Math.sin(tickAngle) * tickEnd;
            
            svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6c757d" stroke-width="1"/>`;
            
            // 刻度标签
            if (i % 2 === 0) {
                const labelValue = min + (i / 10) * (max - min);
                const labelX = center + Math.cos(tickAngle) * (radius + 15);
                const labelY = center + Math.sin(tickAngle) * (radius + 15);
                svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#6c757d">${Math.round(labelValue)}</text>`;
            }
        }

        svg += '</svg>';

        // 添加标题和数值
        let html = `<div style="text-align: center;">`;
        html += svg;
        html += `<div style="margin-top: -30px;">`;
        html += `<div style="font-size: 24px; font-weight: bold; color: #343a40;">${Math.round(value)}${unit}</div>`;
        if (title) {
            html += `<div style="font-size: 14px; color: #6c757d; margin-top: 5px;">${title}</div>`;
        }
        html += `</div></div>`;

        container.innerHTML = html;
    }

    /**
     * 辅助方法：描述SVG弧形路径
     */
    describeArc(x, y, radius, startAngle, endAngle) {
        const start = this.polarToCartesian(x, y, radius, endAngle);
        const end = this.polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    }

    /**
     * 辅助方法：极坐标转笛卡尔坐标
     */
    polarToCartesian(centerX, centerY, radius, angleInRadians) {
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartComponents;
} else {
    window.ChartComponents = ChartComponents;
}

console.log('📊 图表组件库已加载');
