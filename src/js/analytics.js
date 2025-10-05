/**
 * 基础分析模块
 * 提供基本的用户行为分析和统计功能
 */

class BasicAnalytics {
    constructor() {
        this.events = [];
        this.sessionData = {
            startTime: Date.now(),
            pageViews: 0,
            interactions: 0,
            timeSpent: {}
        };
        
        this.init();
    }

    init() {
        console.log('📈 基础分析模块已初始化');
        this.trackPageView();
        this.setupEventTracking();
    }

    /**
     * 追踪页面浏览
     */
    trackPageView(page = window.location.pathname) {
        this.sessionData.pageViews++;
        this.trackEvent('page_view', { page, timestamp: Date.now() });
    }

    /**
     * 追踪事件
     */
    trackEvent(eventName, data = {}) {
        const event = {
            name: eventName,
            data: data,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        this.events.push(event);
        console.log('📊 事件追踪:', eventName, data);

        // 限制事件数量，避免内存泄漏
        if (this.events.length > 1000) {
            this.events = this.events.slice(-500);
        }
    }

    /**
     * 设置事件追踪
     */
    setupEventTracking() {
        // 点击事件
        document.addEventListener('click', (e) => {
            this.sessionData.interactions++;
            this.trackEvent('click', {
                element: e.target.tagName,
                className: e.target.className,
                id: e.target.id
            });
        });

        // 页面离开时间追踪
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end', {
                duration: Date.now() - this.sessionData.startTime,
                pageViews: this.sessionData.pageViews,
                interactions: this.sessionData.interactions
            });
        });
    }

    /**
     * 获取会话ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * 获取统计数据
     */
    getStats() {
        return {
            sessionData: this.sessionData,
            eventCount: this.events.length,
            topEvents: this.getTopEvents(),
            sessionDuration: Date.now() - this.sessionData.startTime
        };
    }

    /**
     * 获取热门事件
     */
    getTopEvents() {
        const eventCounts = {};
        this.events.forEach(event => {
            eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
        });

        return Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));
    }
}

// 创建全局实例
window.BasicAnalytics = new BasicAnalytics();
