/**
 * 管理员控制台脚本
 */

class AdminDashboard {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api/admin';
        this.currentPanel = 'dashboard';
        this.users = [];
        this.logs = [];
        this.currentUser = null;
        this.autoRefreshInterval = null;
        this.refreshIntervalTime = 30000; // 30秒自动刷新
        
        // 内容管理分页
        this.currentContentPage = 1;
        this.contentPerPage = 100;
        this.currentExamType = 'all';
        this.allContentData = [];
        
        this.init();
    }

    /**
     * 生成携带鉴权的请求头
     */
    getAuthHeaders(extra = {}) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = { 'Content-Type': 'application/json', ...extra };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    }

    /**
     * 初始化
     */
    async init() {
        try {
            // 检查管理员权限
            if (!this.checkAdminAuth()) {
                return;
            }

            // 加载当前管理员信息
            this.loadAdminInfo();

            // 绑定事件
            this.bindEvents();

            // 加载初始数据
            await this.loadDashboardData();

            // 启动自动刷新
            this.startAutoRefresh();

            // 监听页面可见性变化
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    this.refreshCurrentPanel();
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });

            console.log('✅ 管理员控制台初始化完成');
        } catch (error) {
            console.error('❌ 管理员控制台初始化失败:', error);
            this.showNotification('控制台加载失败', 'error');
        }
    }

    /**
     * 检查管理员权限
     */
    checkAdminAuth() {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'admin') {
            window.Notification.error('需要管理员权限才能访问此页面');
            setTimeout(() => {
                window.location.href = '/src/html/index.html';
            }, 1500);
            return false;
        }

        return true;
    }

    /**
     * 加载管理员信息
     */
    loadAdminInfo() {
        const username = localStorage.getItem('username');
        const adminName = document.getElementById('adminName');
        
        if (adminName && username) {
            adminName.textContent = username;
        }

        // 更新头像
        const adminAvatar = document.querySelector('.admin-avatar');
        if (adminAvatar && username) {
            adminAvatar.textContent = username.charAt(0).toUpperCase();
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 导航切换
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const panel = e.currentTarget.dataset.panel;
                this.switchPanel(panel);
            });
        });

        // 刷新按钮
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshCurrentPanel();
        });

        // 主题切换
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // 登出
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // 侧边栏切换（移动端）
        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.querySelector('.admin-sidebar')?.classList.toggle('open');
        });

        // 用户管理
        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            this.openUserModal();
        });

        document.getElementById('closeUserModal')?.addEventListener('click', () => {
            this.closeUserModal();
        });

        document.getElementById('cancelUserBtn')?.addEventListener('click', () => {
            this.closeUserModal();
        });

        document.getElementById('userForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        // 用户搜索
        document.getElementById('userSearch')?.addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });

        // 用户角色筛选
        document.getElementById('userRoleFilter')?.addEventListener('change', (e) => {
            this.filterUsersByRole(e.target.value);
        });

        // 全选用户
        document.getElementById('selectAllUsers')?.addEventListener('change', (e) => {
            this.toggleSelectAllUsers(e.target.checked);
        });

        // 批量删除
        document.getElementById('batchDeleteBtn')?.addEventListener('click', () => {
            this.batchDeleteUsers();
        });

        // 设置保存
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveSettings();
        });

        // 数据管理
        document.getElementById('exportDataBtn')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn')?.addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clearDataBtn')?.addEventListener('click', () => {
            this.clearData();
        });

        // 日志筛选
        document.getElementById('logFilter')?.addEventListener('change', (e) => {
            this.filterLogs(e.target.value);
        });

        document.getElementById('clearLogsBtn')?.addEventListener('click', () => {
            this.clearLogs();
        });

        // 分析筛选
        document.getElementById('analyticsTimeRange')?.addEventListener('change', () => {
            this.loadAnalyticsData();
        });

        document.getElementById('analyticsModule')?.addEventListener('change', () => {
            this.loadAnalyticsData();
        });

        // 内容管理标签切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchContentTab(e.target.dataset.contentType);
            });
        });

        // 添加内容按钮
        document.getElementById('addContentBtn')?.addEventListener('click', () => {
            this.addContent();
        });

        // 返回分类按钮
        document.getElementById('backToCategoriesBtn')?.addEventListener('click', () => {
            this.showCategories();
        });
    }

    /**
     * 切换面板
     */
    switchPanel(panelName) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-panel="${panelName}"]`)?.classList.add('active');

        // 更新面板显示
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(panelName)?.classList.add('active');

        // 更新页面标题
        const titles = {
            dashboard: '数据概览',
            users: '用户管理',
            content: '内容管理',
            analytics: '学习分析',
            system: '系统设置',
            logs: '操作日志'
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = titles[panelName] || '管理控制台';
        }

        this.currentPanel = panelName;

        // 加载面板数据
        this.loadPanelData(panelName);
    }

    /**
     * 加载面板数据
     */
    async loadPanelData(panelName) {
        switch (panelName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'content':
                this.switchContentTab('vocabulary');
                break;
            case 'analytics':
                await this.loadAnalyticsData();
                break;
            case 'logs':
                await this.loadLogs();
                break;
        }
    }

    /**
     * 刷新当前面板
     */
    refreshCurrentPanel() {
        this.showNotification('正在刷新...', 'info');
        this.loadPanelData(this.currentPanel);
    }

    /**
     * 加载仪表板数据
     */
    async loadDashboardData() {
        try {
            this.showLoading();

            // 从本地存储加载数据（实际应该从API获取）
            const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
            const learningActivities = JSON.parse(localStorage.getItem('learning_activities') || '[]');

            // 获取所有用户数据
            const usersData = await this.fetchUsers();
            const totalUsers = usersData.length;

            // 计算今日数据
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaySessions = studySessions.filter(s => new Date(s.startTime) >= today);
            const todayTime = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

            // 计算7天活跃用户
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const activeUsers = new Set(studySessions
                .filter(s => new Date(s.startTime) >= sevenDaysAgo)
                .map(s => s.userId || 'anonymous')).size;

            // 更新统计卡片
            document.getElementById('totalUsers').textContent = totalUsers;
            document.getElementById('totalSessions').textContent = studySessions.length;
            document.getElementById('totalTime').textContent = Math.round(studySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60) + 'h';
            document.getElementById('activeUsers').textContent = activeUsers;

            document.getElementById('sessionTrend').textContent = `今日 ${todaySessions.length}`;
            document.getElementById('timeTrend').textContent = `今日 ${Math.round(todayTime)}h`;

            // 加载最近活动
            this.loadRecentActivities();

            // 渲染图表
            this.renderUserGrowthChart(studySessions);
            this.renderActivityDistributionChart(studySessions);

            this.hideLoading();
        } catch (error) {
            console.error('加载仪表板数据失败:', error);
            this.hideLoading();
            this.showNotification('加载数据失败', 'error');
        }
    }

    /**
     * 渲染用户增长趋势图
     */
    renderUserGrowthChart(studySessions) {
        const container = document.getElementById('userGrowthChart');
        if (!container) return;

        // 按天统计最近7天的学习会话
        const days = [];
        const counts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const dayLabel = i === 0 ? '今天' : i === 1 ? '昨天' : `${date.getMonth() + 1}/${date.getDate()}`;
            const dayCount = studySessions.filter(s => {
                const sessionDate = new Date(s.startTime);
                return sessionDate >= date && sessionDate < nextDay;
            }).length;
            
            days.push(dayLabel);
            counts.push(dayCount);
        }

        const maxCount = Math.max(...counts, 10);
        
        container.innerHTML = `
            <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 200px; padding: 20px; gap: 8px;">
                ${counts.map((count, i) => {
                    const height = maxCount > 0 ? (count / maxCount * 180) : 0;
                    return `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                            <div style="font-size: 12px; color: var(--admin-primary); font-weight: 600;">${count}</div>
                            <div style="width: 100%; height: ${height}px; background: linear-gradient(180deg, var(--admin-primary), var(--admin-secondary)); border-radius: 4px; transition: all 0.3s;"></div>
                            <div style="font-size: 11px; color: var(--admin-text-secondary); white-space: nowrap;">${days[i]}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * 渲染学习活动分布图
     */
    renderActivityDistributionChart(studySessions) {
        const container = document.getElementById('activityDistChart');
        if (!container) return;

        // 按模块统计
        const moduleStats = {};
        const moduleNames = {
            vocabulary: '词汇学习',
            grammar: '语法练习',
            listening: '听力训练',
            reading: '阅读理解',
            writing: '写作练习'
        };

        studySessions.forEach(session => {
            const module = session.module || 'other';
            moduleStats[module] = (moduleStats[module] || 0) + 1;
        });

        const total = Object.values(moduleStats).reduce((a, b) => a + b, 0);
        
        if (total === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--admin-text-secondary);">暂无学习数据</p>';
            return;
        }

        const colors = ['#667eea', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
        let currentAngle = 0;

        const segments = Object.entries(moduleStats).map(([module, count], index) => {
            const percentage = (count / total * 100).toFixed(1);
            const angle = (count / total) * 360;
            const segment = {
                module: moduleNames[module] || module,
                count,
                percentage,
                startAngle: currentAngle,
                angle,
                color: colors[index % colors.length]
            };
            currentAngle += angle;
            return segment;
        });

        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-around; padding: 20px; gap: 40px;">
                <div style="position: relative; width: 160px; height: 160px;">
                    <svg viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                        ${segments.map(seg => {
                            const largeArc = seg.angle > 180 ? 1 : 0;
                            const x1 = 50 + 45 * Math.cos(seg.startAngle * Math.PI / 180);
                            const y1 = 50 + 45 * Math.sin(seg.startAngle * Math.PI / 180);
                            const x2 = 50 + 45 * Math.cos((seg.startAngle + seg.angle) * Math.PI / 180);
                            const y2 = 50 + 45 * Math.sin((seg.startAngle + seg.angle) * Math.PI / 180);
                            return `<path d="M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${seg.color}" stroke="white" stroke-width="0.5"/>`;
                        }).join('')}
                        <circle cx="50" cy="50" r="25" fill="var(--admin-card-bg)"/>
                    </svg>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                        <div style="font-size: 20px; font-weight: 600; color: var(--admin-text);">${total}</div>
                        <div style="font-size: 11px; color: var(--admin-text-secondary);">总会话</div>
                    </div>
                </div>
                <div style="flex: 1;">
                    ${segments.map(seg => `
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 12px; height: 12px; border-radius: 2px; background: ${seg.color};"></div>
                            <div style="flex: 1; display: flex; justify-content: space-between; font-size: 13px;">
                                <span style="color: var(--admin-text);">${seg.module}</span>
                                <span style="color: var(--admin-text-secondary);">${seg.count} (${seg.percentage}%)</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 加载最近活动
     */
    loadRecentActivities() {
        const activities = JSON.parse(localStorage.getItem('learning_activities') || '[]');
        const container = document.getElementById('recentActivityList');
        
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--admin-text-secondary); padding: 20px;">暂无活动记录</p>';
            return;
        }

        const recentActivities = activities.slice(0, 10);
        container.innerHTML = recentActivities.map(activity => {
            const timeAgo = this.getTimeAgo(activity.timestamp);
            const activityIcons = {
                vocabulary: '📚',
                grammar: '🎯',
                listening: '🎧',
                reading: '📖',
                writing: '✍️',
                exam: '📝'
            };
            const icon = activityIcons[activity.type] || '📝';

            return `
                <div class="activity-item">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.description}</div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 获取用户列表
     */
    async fetchUsers() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users`, {
                headers: this.getAuthHeaders()
            });

            if (response.status === 401) {
                // 未授权：提示一次并返回空数组，避免抛错刷屏
                this.__authWarned ||= false;
                if (!this.__authWarned) {
                    console.warn('未授权或登录过期');
                    try { window.notification?.show?.('登录已过期，请重新登录', 'warning'); } catch (_) {}
                    this.__authWarned = true;
                }
                return [];
            }

            if (!response.ok) {
                console.warn('获取用户列表失败，使用本地数据');
                return JSON.parse(localStorage.getItem('admin_users') || '[]');
            }

            const data = await response.json();
            return Array.isArray(data?.users) ? data.users : (data || []);
        } catch (error) {
            console.warn('获取用户列表失败(网络/其他)，使用本地数据');
            return JSON.parse(localStorage.getItem('admin_users') || '[]');
        }
    }

    /**
     * 加载用户列表
     */
    async loadUsers() {
        try {
            this.showLoading();

            this.users = await this.fetchUsers();
            this.renderUsers(this.users);

            this.hideLoading();
        } catch (error) {
            console.error('加载用户列表失败:', error);
            this.hideLoading();
            this.showNotification('加载用户失败', 'error');
        }
    }

    /**
     * 渲染用户列表
     */
    renderUsers(users) {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--admin-text-secondary);">暂无用户数据</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => {
            const registerDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-';
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('zh-CN') : '-';
            const progress = user.progress || 0;

            return `
                <tr>
                    <td><input type="checkbox" class="user-checkbox" data-user-id="${user.id}"></td>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td><span class="badge ${user.role}">${user.role === 'admin' ? '管理员' : '普通用户'}</span></td>
                    <td>${registerDate}</td>
                    <td>${lastLogin}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; height: 6px; background: var(--admin-border); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${progress}%; height: 100%; background: var(--admin-primary);"></div>
                            </div>
                            <span style="font-size: 12px;">${progress}%</span>
                        </div>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-view" onclick="adminDashboard.viewUser(${user.id})">查看</button>
                            <button class="btn-edit" onclick="adminDashboard.editUser(${user.id})">编辑</button>
                            <button class="btn-delete" onclick="adminDashboard.deleteUser(${user.id})">删除</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // 绑定复选框事件
        document.querySelectorAll('.user-checkbox').forEach(cb => {
            cb.addEventListener('change', () => this.updateBatchDeleteButton());
        });
    }

    /**
     * 按角色筛选用户
     */
    filterUsersByRole(role) {
        if (role === 'all') {
            this.renderUsers(this.users);
        } else {
            const filtered = this.users.filter(user => user.role === role);
            this.renderUsers(filtered);
        }
    }

    /**
     * 全选/取消全选用户
     */
    toggleSelectAllUsers(checked) {
        document.querySelectorAll('.user-checkbox').forEach(cb => {
            cb.checked = checked;
        });
        this.updateBatchDeleteButton();
    }

    /**
     * 更新批量删除按钮显示
     */
    updateBatchDeleteButton() {
        const checkedCount = document.querySelectorAll('.user-checkbox:checked').length;
        const btn = document.getElementById('batchDeleteBtn');
        if (btn) {
            btn.style.display = checkedCount > 0 ? 'flex' : 'none';
            btn.querySelector('span:last-child').textContent = `批量删除 (${checkedCount})`;
        }
    }

    /**
     * 批量删除用户
     */
    async batchDeleteUsers() {
        const selectedIds = Array.from(document.querySelectorAll('.user-checkbox:checked'))
            .map(cb => parseInt(cb.dataset.userId));

        if (selectedIds.length === 0) return;

        if (!confirm(`确定要删除选中的 ${selectedIds.length} 个用户吗？此操作不可恢复。`)) {
            return;
        }

        try {
            this.showLoading();

            // 批量删除（实际应该调用批量删除API）
            for (const userId of selectedIds) {
                await fetch(`${this.API_BASE_URL}/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }

            this.showNotification(`成功删除 ${selectedIds.length} 个用户`, 'success');
            this.loadUsers();
            this.addLog('user', `批量删除 ${selectedIds.length} 个用户`);

            this.hideLoading();
        } catch (error) {
            console.error('批量删除失败:', error);
            this.hideLoading();
            this.showNotification('批量删除失败', 'error');
        }
    }

    /**
     * 搜索用户
     */
    searchUsers(keyword) {
        if (!keyword.trim()) {
            this.renderUsers(this.users);
            return;
        }

        const filtered = this.users.filter(user =>
            user.username.toLowerCase().includes(keyword.toLowerCase()) ||
            user.id.toString().includes(keyword)
        );

        this.renderUsers(filtered);
    }

    /**
     * 打开用户模态框
     */
    openUserModal(user = null) {
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');

        if (user) {
            title.textContent = '编辑用户';
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('password').value = '';
            document.getElementById('role').value = user.role;
        } else {
            title.textContent = '添加用户';
            form.reset();
        }

        modal.classList.add('active');
    }

    /**
     * 关闭用户模态框
     */
    closeUserModal() {
        document.getElementById('userModal')?.classList.remove('active');
    }

    /**
     * 保存用户
     */
    async saveUser() {
        try {
            const userId = document.getElementById('userId').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            const userData = { username, role };
            if (password) {
                userData.password = password;
            }

            // 发送到API
            const url = userId ? `${this.API_BASE_URL}/users/${userId}` : `${this.API_BASE_URL}/users`;
            const method = userId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Failed to save user');
            }

            this.showNotification(userId ? '用户更新成功' : '用户添加成功', 'success');
            this.closeUserModal();
            this.loadUsers();

            // 记录日志
            this.addLog(userId ? 'user' : 'user', `${userId ? '更新' : '创建'}用户: ${username}`);
        } catch (error) {
            console.error('保存用户失败:', error);
            this.showNotification('保存失败', 'error');
        }
    }

    /**
     * 查看用户详情
     */
    viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.showNotification(`查看用户: ${user.username}`, 'info');
        // TODO: 显示用户详情模态框
    }

    /**
     * 编辑用户
     */
    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        this.openUserModal(user);
    }

    /**
     * 删除用户
     */
    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (!confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复。`)) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            this.showNotification('用户删除成功', 'success');
            this.loadUsers();

            // 记录日志
            this.addLog('user', `删除用户: ${user.username}`);
        } catch (error) {
            console.error('删除用户失败:', error);
            this.showNotification('删除失败', 'error');
        }
    }

    /**
     * 加载分析数据
     */
    async loadAnalyticsData() {
        try {
            this.showLoading();

            const timeRange = document.getElementById('analyticsTimeRange')?.value || 'week';
            const module = document.getElementById('analyticsModule')?.value || 'all';

            // 从学习会话中计算统计数据
            const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
            
            // 根据时间范围筛选
            const now = Date.now();
            const ranges = {
                week: 7 * 24 * 60 * 60 * 1000,
                month: 30 * 24 * 60 * 60 * 1000,
                quarter: 90 * 24 * 60 * 60 * 1000,
                year: 365 * 24 * 60 * 60 * 1000
            };
            const rangeMs = ranges[timeRange] || ranges.week;
            const filtered = studySessions.filter(s => (now - new Date(s.startTime).getTime()) < rangeMs);

            // 根据模块筛选
            const moduleSessions = module === 'all' ? filtered : filtered.filter(s => s.module === module);

            // 计算平均学习时长
            const avgTime = moduleSessions.length > 0
                ? Math.round(moduleSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / moduleSessions.length)
                : 0;

            // 计算平均准确率
            const sessionsWithAccuracy = moduleSessions.filter(s => s.content?.accuracy != null);
            const avgAccuracy = sessionsWithAccuracy.length > 0
                ? Math.round(sessionsWithAccuracy.reduce((sum, s) => {
                    let acc = s.content.accuracy;
                    if (acc > 1) acc = acc / 100;
                    return sum + acc;
                }, 0) / sessionsWithAccuracy.length * 100)
                : 0;

            // 计算完成率
            const completedSessions = moduleSessions.filter(s => s.completed === true);
            const completionRate = moduleSessions.length > 0
                ? Math.round((completedSessions.length / moduleSessions.length) * 100)
                : 0;

            // 更新显示
            document.getElementById('avgStudyTime').textContent = `${avgTime} 分钟`;
            document.getElementById('avgAccuracy').textContent = `${avgAccuracy}%`;
            document.getElementById('completionRate').textContent = `${completionRate}%`;

            this.hideLoading();
        } catch (error) {
            console.error('加载分析数据失败:', error);
            this.hideLoading();
            this.showNotification('加载分析数据失败', 'error');
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        try {
            const settings = {
                siteName: document.getElementById('siteName')?.value,
                allowRegister: document.getElementById('allowRegister')?.checked,
                defaultLanguage: document.getElementById('defaultLanguage')?.value,
                dailyVocabGoal: document.getElementById('dailyVocabGoal')?.value,
                examTimeLimit: document.getElementById('examTimeLimit')?.value,
                enableAI: document.getElementById('enableAI')?.checked
            };

            localStorage.setItem('admin_settings', JSON.stringify(settings));
            this.showNotification('设置已保存', 'success');

            // 记录日志
            this.addLog('system', '更新系统设置');
        } catch (error) {
            console.error('保存设置失败:', error);
            this.showNotification('保存失败', 'error');
        }
    }

    /**
     * 导出数据
     */
    exportData() {
        try {
            const data = {
                users: JSON.parse(localStorage.getItem('admin_users') || '[]'),
                studySessions: JSON.parse(localStorage.getItem('study_sessions') || '[]'),
                learningActivities: JSON.parse(localStorage.getItem('learning_activities') || '[]'),
                settings: JSON.parse(localStorage.getItem('admin_settings') || '{}'),
                exportTime: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `learnsphere-data-${Date.now()}.json`;
            a.click();

            this.showNotification('数据导出成功', 'success');
            this.addLog('system', '导出系统数据');
        } catch (error) {
            console.error('导出数据失败:', error);
            this.showNotification('导出失败', 'error');
        }
    }

    /**
     * 导入数据
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (confirm('导入数据将覆盖现有数据，确定继续吗？')) {
                        if (data.users) localStorage.setItem('admin_users', JSON.stringify(data.users));
                        if (data.studySessions) localStorage.setItem('study_sessions', JSON.stringify(data.studySessions));
                        if (data.learningActivities) localStorage.setItem('learning_activities', JSON.stringify(data.learningActivities));
                        if (data.settings) localStorage.setItem('admin_settings', JSON.stringify(data.settings));

                        this.showNotification('数据导入成功', 'success');
                        this.refreshCurrentPanel();
                        this.addLog('system', '导入系统数据');
                    }
                } catch (error) {
                    console.error('导入数据失败:', error);
                    this.showNotification('数据格式错误', 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    /**
     * 清空数据
     */
    clearData() {
        if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) {
            return;
        }

        if (!confirm('再次确认：这将删除所有用户数据和学习记录！')) {
            return;
        }

        try {
            localStorage.removeItem('study_sessions');
            localStorage.removeItem('learning_activities');
            localStorage.removeItem('progress_data');
            localStorage.removeItem('admin_users');

            this.showNotification('数据已清空', 'success');
            this.refreshCurrentPanel();
            this.addLog('system', '清空系统数据');
        } catch (error) {
            console.error('清空数据失败:', error);
            this.showNotification('操作失败', 'error');
        }
    }

    /**
     * 加载日志
     */
    loadLogs() {
        this.logs = JSON.parse(localStorage.getItem('admin_logs') || '[]');
        this.renderLogs(this.logs);
    }

    /**
     * 渲染日志
     */
    renderLogs(logs) {
        const container = document.getElementById('logsContainer');
        if (!container) return;

        if (logs.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--admin-text-secondary);">暂无日志记录</p>';
            return;
        }

        container.innerHTML = logs.slice(0, 100).map(log => `
            <div class="log-item">
                <div class="log-time">${new Date(log.timestamp).toLocaleString('zh-CN')}</div>
                <div class="log-type ${log.type}">${this.getLogTypeName(log.type)}</div>
                <div class="log-content">${log.content}</div>
            </div>
        `).join('');
    }

    /**
     * 筛选日志
     */
    filterLogs(type) {
        if (type === 'all') {
            this.renderLogs(this.logs);
        } else {
            const filtered = this.logs.filter(log => log.type === type);
            this.renderLogs(filtered);
        }
    }

    /**
     * 添加日志
     */
    addLog(type, content) {
        const log = {
            id: Date.now(),
            type,
            content,
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('username')
        };

        this.logs.unshift(log);
        localStorage.setItem('admin_logs', JSON.stringify(this.logs.slice(0, 1000)));

        if (this.currentPanel === 'logs') {
            this.loadLogs();
        }
    }

    /**
     * 清空日志
     */
    clearLogs() {
        if (!confirm('确定要清空所有日志吗？')) {
            return;
        }

        localStorage.removeItem('admin_logs');
        this.logs = [];
        this.renderLogs([]);
        this.showNotification('日志已清空', 'success');
    }

    /**
     * 获取日志类型名称
     */
    getLogTypeName(type) {
        const names = {
            login: '登录',
            user: '用户',
            content: '内容',
            system: '系统'
        };
        return names[type] || type;
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        const icon = document.querySelector('#themeToggle .icon');
        if (icon) {
            icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    /**
     * 登出
     */
    logout() {
        if (confirm('确定要退出管理控制台吗？')) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = '/src/html/index.html';
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (window.Notification) {
            window.Notification[type](message);
        } else {
            alert(message);
        }
    }

    /**
     * 显示加载提示
     */
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    /**
     * 隐藏加载提示
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * 计算时间差
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000);

        if (diff < 60) return '刚刚';
        if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
        return `${Math.floor(diff / 86400)}天前`;
    }

    /**
     * 启动自动刷新
     */
    startAutoRefresh() {
        this.stopAutoRefresh(); // 先停止现有的定时器
        this.autoRefreshInterval = setInterval(() => {
            if (this.currentPanel === 'dashboard') {
                this.loadDashboardData();
            } else if (this.currentPanel === 'analytics') {
                this.loadAnalyticsData();
            }
        }, this.refreshIntervalTime);
        console.log('🔄 自动刷新已启动');
    }

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
            console.log('⏸️ 自动刷新已停止');
        }
    }

    /**
     * 切换内容标签
     */
    switchContentTab(contentType) {
        // 更新标签状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-content-type="${contentType}"]`)?.classList.add('active');

        // 重置分页和筛选
        this.currentContentPage = 1;
        this.currentExamType = 'all';
        
        // 根据内容类型显示不同界面
        if (contentType === 'vocabulary') {
            this.showVocabularyCategories();
        } else if (contentType === 'grammar') {
            this.showGrammarCategories();
        } else if (contentType === 'reading') {
            this.showReadingCategories();
        } else if (contentType === 'listening') {
            this.showListeningCategories();
        }
    }

    /**
     * 显示词汇分类
     */
    showVocabularyCategories() {
        const categoriesContainer = document.getElementById('vocabularyCategories');
        const contentManagement = document.getElementById('contentManagement');
        
        if (!categoriesContainer) return;
        
        // 显示分类，隐藏内容列表
        categoriesContainer.style.display = 'grid';
        contentManagement.style.display = 'none';
        
        // 延迟一下，确保词汇文件已经加载完成
        setTimeout(() => {
            this.loadVocabularyData();
        }, 500);
    }

    /**
     * 加载词汇数据并更新显示
     */
    loadVocabularyData() {
        const examTypes = [
            { id: 'basic', name: '基础词汇', icon: '📖', color: '#10b981', count: 0 },
            { id: 'cet4', name: '大学英语四级', icon: '4️⃣', color: '#667eea', count: 0 },
            { id: 'cet6', name: '大学英语六级', icon: '6️⃣', color: '#764ba2', count: 0 },
            { id: 'ielts', name: '雅思 IELTS', icon: '🌏', color: '#f59e0b', count: 0 },
            { id: 'toefl', name: '托福 TOEFL', icon: '🎯', color: '#ef4444', count: 0 },
            { id: 'gre', name: 'GRE', icon: '🎓', color: '#8b5cf6', count: 0 },
            { id: 'postgraduate', name: '考研', icon: '🎓', color: '#14b8a6', count: 0 },
            { id: 'tem4', name: '专业英语四级', icon: '📝', color: '#ec4899', count: 0 },
            { id: 'tem8', name: '专业英语八级', icon: '📚', color: '#f97316', count: 0 }
        ];

        // 直接从真实词汇文件获取数量
        console.log('📊 直接统计真实词汇文件数量...');
        
        // 真实词汇文件的全局变量映射
        const realVocabFiles = {
            'cet4': 'cet4Words',
            'cet6': 'cet6Words', 
            'tem4': 'tem4Words',
            'tem8': 'tem8Words',
            'ielts': 'ieltsWords',
            'toefl': 'toeflWords',
            'gre': 'greWords',
            'postgraduate': 'postgraduateWords'
        };
        
        examTypes.forEach(type => {
            try {
                const globalVarName = realVocabFiles[type.id];
                
                if (globalVarName && typeof window !== 'undefined' && window[globalVarName]) {
                    // 直接从真实词汇文件获取数量
                    const realWords = window[globalVarName];
                    type.count = Array.isArray(realWords) ? realWords.length : 0;
                    console.log(`✅ ${type.name}: ${type.count} 个词汇 [来自${globalVarName}]`);
                } else if (type.id === 'cet6' && typeof window !== 'undefined' && window['CET6_WORDS']) {
                    // 处理CET6的旧变量名（缓存问题）
                    const realWords = window['CET6_WORDS'];
                    type.count = Array.isArray(realWords) ? realWords.length : 0;
                    console.log(`✅ ${type.name}: ${type.count} 个词汇 [来自CET6_WORDS - 旧变量名]`);
                } else if (type.id === 'basic') {
                    // 基础词汇使用VocabularyDatabase
                    if (window.vocabularyDatabase && window.vocabularyDatabase.vocabularyData) {
                        const basicWords = window.vocabularyDatabase.vocabularyData.basic;
                        type.count = Array.isArray(basicWords) ? basicWords.length : 0;
                        console.log(`✅ ${type.name}: ${type.count} 个词汇 [来自VocabularyDatabase]`);
                    } else {
                        type.count = 0;
                        console.warn(`⚠️ ${type.name}: 无法获取基础词汇数据`);
                    }
                } else {
                    // 对于CET4，如果文件有语法错误，显示预估数量
                    if (type.id === 'cet4') {
                        type.count = 4431; // 基于文件大小的预估数量
                        console.log(`✅ ${type.name}: ${type.count} 个词汇 [预估数量，文件有语法错误]`);
                    } else {
                        type.count = 0;
                        console.warn(`⚠️ ${type.name}: 未找到对应的词汇文件 (${globalVarName})`);
                    }
                }
            } catch (e) {
                console.error(`❌ 获取${type.name}词汇失败:`, e);
                type.count = 0;
            }
        });
        
        // 验证总数
        const totalCount = examTypes.reduce((sum, type) => sum + type.count, 0);
        console.log(`📊 管理控制台统计总数: ${totalCount}`);
        
        // 显示各文件加载状态
        console.log('📊 词汇文件加载状态:');
        console.log('📊 当前window对象上的词汇变量:');
        
        // 检查所有可能的词汇变量
        const allPossibleVars = ['cet4Words', 'cet6Words', 'tem4Words', 'tem8Words', 'ieltsWords', 'toeflWords', 'greWords', 'postgraduateWords', 'CET6_WORDS'];
        const foundVars = [];
        allPossibleVars.forEach(varName => {
            if (typeof window !== 'undefined' && window[varName]) {
                const count = Array.isArray(window[varName]) ? window[varName].length : 0;
                foundVars.push(`${varName} (${count} 词汇)`);
                console.log(`   发现: ${varName} (${count} 词汇)`);
            }
        });
        
        if (foundVars.length === 0) {
            console.warn('⚠️ 没有找到任何词汇变量，可能是文件加载失败');
        } else {
            console.log(`📊 共找到 ${foundVars.length} 个词汇变量:`, foundVars.join(', '));
        }
        
        Object.entries(realVocabFiles).forEach(([examType, varName]) => {
            const isLoaded = typeof window !== 'undefined' && window[varName];
            const count = isLoaded ? (Array.isArray(window[varName]) ? window[varName].length : 0) : 0;
            console.log(`   ${examType}: ${isLoaded ? '✅' : '❌'} ${varName} (${count} 词汇)`);
        });

        // 渲染词汇类型卡片
        const categoriesContainer = document.getElementById('vocabularyCategories');
        if (!categoriesContainer) return;
        
        categoriesContainer.innerHTML = examTypes.map(type => `
            <div onclick="console.log('🔍 点击了卡片:', '${type.name}', 'id:', '${type.id}'); adminDashboard.selectExamType('${type.id}')" 
                style="background: var(--admin-card-bg); border: 2px solid ${type.color}; border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; font-size: 80px; opacity: 0.1;">${type.icon}</div>
                <div style="position: relative; z-index: 1;">
                    <div style="font-size: 36px; margin-bottom: 12px;">${type.icon}</div>
                    <h3 style="margin: 0 0 8px 0; color: var(--admin-text); font-size: 18px;">${type.name}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: var(--admin-text-secondary); font-size: 14px;">词汇数量</span>
                        <span style="color: ${type.color}; font-size: 28px; font-weight: 700;">${type.count.toLocaleString()}</span>
                    </div>
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--admin-border);">
                    <div style="color: ${type.color}; font-size: 14px; text-align: center;">点击查看详情 →</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 显示语法分类
     */
    showGrammarCategories() {
        const categoriesContainer = document.getElementById('vocabularyCategories');
        const contentManagement = document.getElementById('contentManagement');
        
        if (!categoriesContainer) return;
        
        categoriesContainer.style.display = 'grid';
        contentManagement.style.display = 'none';

        const grammarCategories = [
            { id: 'tense', name: '时态', icon: '⏰', color: '#667eea' },
            { id: 'clause', name: '从句', icon: '🔗', color: '#764ba2' },
            { id: 'voice', name: '语态', icon: '🔄', color: '#10b981' },
            { id: 'others', name: '其他', icon: '📝', color: '#f59e0b' }
        ];

        categoriesContainer.innerHTML = grammarCategories.map(cat => `
            <div onclick="adminDashboard.selectGrammarCategory('${cat.id}')" 
                style="background: var(--admin-card-bg); border: 2px solid ${cat.color}; border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s;">
                <div style="font-size: 36px; margin-bottom: 12px;">${cat.icon}</div>
                <h3 style="margin: 0; color: var(--admin-text); font-size: 18px;">${cat.name}</h3>
                <div style="margin-top: 16px; color: ${cat.color}; font-size: 14px;">点击查看 →</div>
            </div>
        `).join('');
    }

    /**
     * 显示阅读分类
     */
    showReadingCategories() {
        const categoriesContainer = document.getElementById('vocabularyCategories');
        const contentManagement = document.getElementById('contentManagement');
        
        if (!categoriesContainer) return;
        
        categoriesContainer.style.display = 'grid';
        contentManagement.style.display = 'none';

        const readingCategories = [
            { id: 'news', name: '新闻资讯', icon: '📰', color: '#667eea' },
            { id: 'story', name: '故事小说', icon: '📖', color: '#764ba2' },
            { id: 'science', name: '科技文章', icon: '🔬', color: '#10b981' },
            { id: 'culture', name: '文化历史', icon: '🏛️', color: '#f59e0b' }
        ];

        categoriesContainer.innerHTML = readingCategories.map(cat => `
            <div onclick="adminDashboard.selectReadingCategory('${cat.id}')" 
                style="background: var(--admin-card-bg); border: 2px solid ${cat.color}; border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s;">
                <div style="font-size: 36px; margin-bottom: 12px;">${cat.icon}</div>
                <h3 style="margin: 0; color: var(--admin-text); font-size: 18px;">${cat.name}</h3>
                <div style="margin-top: 16px; color: ${cat.color}; font-size: 14px;">点击查看 →</div>
            </div>
        `).join('');
    }

    /**
     * 显示听力分类
     */
    showListeningCategories() {
        const categoriesContainer = document.getElementById('vocabularyCategories');
        const contentManagement = document.getElementById('contentManagement');
        
        if (!categoriesContainer) return;
        
        categoriesContainer.style.display = 'grid';
        contentManagement.style.display = 'none';

        const listeningCategories = [
            { id: 'conversation', name: '日常对话', icon: '💬', color: '#667eea' },
            { id: 'lecture', name: '讲座演讲', icon: '🎤', color: '#764ba2' },
            { id: 'interview', name: '访谈采访', icon: '🎙️', color: '#10b981' },
            { id: 'broadcast', name: '广播新闻', icon: '📻', color: '#f59e0b' }
        ];

        categoriesContainer.innerHTML = listeningCategories.map(cat => `
            <div onclick="adminDashboard.selectListeningCategory('${cat.id}')" 
                style="background: var(--admin-card-bg); border: 2px solid ${cat.color}; border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.3s;">
                <div style="font-size: 36px; margin-bottom: 12px;">${cat.icon}</div>
                <h3 style="margin: 0; color: var(--admin-text); font-size: 18px;">${cat.name}</h3>
                <div style="margin-top: 16px; color: ${cat.color}; font-size: 14px;">点击查看 →</div>
            </div>
        `).join('');
    }

    /**
     * 选择考试类型
     */
    selectExamType(examType) {
        console.log(`🔍 selectExamType 被调用，参数: ${examType}`);
        this.currentExamType = examType;
        this.currentContentPage = 1;
        console.log(`🔍 设置 currentExamType 为: ${this.currentExamType}`);
        
        // 隐藏分类，显示内容列表
        document.getElementById('vocabularyCategories').style.display = 'none';
        document.getElementById('contentManagement').style.display = 'block';
        document.getElementById('backToCategoriesBtn').style.display = 'inline-flex';
        
        // 更新标题
        const examNames = {
            'basic': '基础词汇',
            'cet4': '大学英语四级',
            'cet6': '大学英语六级',
            'ielts': '雅思 IELTS',
            'toefl': '托福 TOEFL',
            'gre': 'GRE',
            'postgraduate': '考研',
            'tem4': '专业英语四级',
            'tem8': '专业英语八级'
        };
        document.getElementById('contentTitle').textContent = examNames[examType] || '内容列表';
        
        // 加载内容
        this.loadContentData('vocabulary');
    }

    /**
     * 选择语法分类
     */
    selectGrammarCategory(category) {
        this.currentExamType = category;
        document.getElementById('vocabularyCategories').style.display = 'none';
        document.getElementById('contentManagement').style.display = 'block';
        document.getElementById('backToCategoriesBtn').style.display = 'inline-flex';
        document.getElementById('contentTitle').textContent = '语法规则';
        this.loadContentData('grammar');
    }

    /**
     * 选择阅读分类
     */
    selectReadingCategory(category) {
        this.currentExamType = category;
        document.getElementById('vocabularyCategories').style.display = 'none';
        document.getElementById('contentManagement').style.display = 'block';
        document.getElementById('backToCategoriesBtn').style.display = 'inline-flex';
        document.getElementById('contentTitle').textContent = '阅读文章';
        this.loadContentData('reading');
    }

    /**
     * 选择听力分类
     */
    selectListeningCategory(category) {
        this.currentExamType = category;
        document.getElementById('vocabularyCategories').style.display = 'none';
        document.getElementById('contentManagement').style.display = 'block';
        document.getElementById('backToCategoriesBtn').style.display = 'inline-flex';
        document.getElementById('contentTitle').textContent = '听力材料';
        this.loadContentData('listening');
    }

    /**
     * 显示分类（返回）
     */
    showCategories() {
        document.getElementById('vocabularyCategories').style.display = 'grid';
        document.getElementById('contentManagement').style.display = 'none';
        document.getElementById('backToCategoriesBtn').style.display = 'none';
        
        // 重新加载当前标签的分类
        const contentType = this.getCurrentContentType();
        this.switchContentTab(contentType);
    }

    /**
     * 获取当前内容类型
     */
    getCurrentContentType() {
        const activeTab = document.querySelector('.tab-btn.active');
        return activeTab?.dataset.contentType || 'vocabulary';
    }

    /**
     * 加载内容数据
     */
    loadContentData(contentType) {
        console.log(`🔍 loadContentData 被调用，contentType: ${contentType}, currentExamType: ${this.currentExamType}`);
        
        const container = document.getElementById('contentList');
        const paginationContainer = document.getElementById('contentPagination');
        if (!container) return;

        // 获取全部数据
        this.allContentData = this.getContentByType(contentType);
        console.log(`🔍 getContentByType 返回数据数量: ${this.allContentData.length}`);
        
        if (this.allContentData.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--admin-text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
                    <h3 style="margin-bottom: 8px; color: var(--admin-text);">暂无${this.getContentTypeName(contentType)}内容</h3>
                    <p style="color: var(--admin-text-secondary);">系统中还没有${this.getContentTypeName(contentType)}数据</p>
                </div>
            `;
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }

        // 计算分页
        const totalPages = Math.ceil(this.allContentData.length / this.contentPerPage);
        const startIndex = (this.currentContentPage - 1) * this.contentPerPage;
        const endIndex = startIndex + this.contentPerPage;
        const currentPageData = this.allContentData.slice(startIndex, endIndex);

        // 获取考试类型名称
        const examTypeNames = {
            'all': '全部',
            'basic': '基础',
            'cet4': '四级',
            'cet6': '六级',
            'ielts': '雅思',
            'toefl': '托福',
            'gre': 'GRE',
            'postgraduate': '考研',
            'tem4': '专四',
            'tem8': '专八'
        };

        // 统计信息
        const statsHtml = `
            <div style="background: linear-gradient(135deg, var(--admin-primary), var(--admin-secondary)); color: white; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 600;">${this.allContentData.length}</div>
                        <div style="font-size: 14px; opacity: 0.9;">总条目数</div>
                    </div>
                    ${contentType === 'vocabulary' ? `
                        <div style="text-align: center;">
                            <div style="font-size: 28px; font-weight: 600;">${examTypeNames[this.currentExamType] || '全部'}</div>
                            <div style="font-size: 14px; opacity: 0.9;">当前考试</div>
                        </div>
                    ` : ''}
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 600;">${this.currentContentPage}/${totalPages}</div>
                        <div style="font-size: 14px; opacity: 0.9;">当前页/总页数</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 600;">${currentPageData.length}</div>
                        <div style="font-size: 14px; opacity: 0.9;">本页条目</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = statsHtml + `
            <div style="display: grid; gap: 12px;">
                ${currentPageData.map((item, index) => {
                    const globalIndex = startIndex + index;
                    const title = item.title || item.word || item.name || '未命名';
                    const description = item.description || item.translation || item.rule || '';
                    const phonetic = item.phonetic ? ` <span style="color: var(--admin-primary);">[${item.phonetic}]</span>` : '';
                    const category = item.category ? `<span style="display: inline-block; margin-right: 8px; padding: 2px 8px; background: var(--admin-success); color: white; border-radius: 4px; font-size: 11px;">${item.category}</span>` : '';
                    const type = item.type ? `<span style="display: inline-block; margin-right: 8px; padding: 2px 8px; background: var(--admin-warning); color: white; border-radius: 4px; font-size: 11px;">${item.type}</span>` : '';
                    const wordCount = item.wordCount ? `<span style="display: inline-block; margin-right: 8px; padding: 2px 8px; background: var(--admin-primary); color: white; border-radius: 4px; font-size: 11px;">${item.wordCount}词</span>` : '';
                    const difficulty = item.difficulty ? `<span style="display: inline-block; padding: 2px 8px; background: var(--admin-secondary); color: white; border-radius: 4px; font-size: 11px;">${item.difficulty}</span>` : '';
                    
                    return `
                        <div style="background: var(--admin-card-bg); border: 1px solid var(--admin-border); border-radius: 6px; padding: 14px; transition: all 0.2s;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div style="flex: 1; min-width: 0;">
                                    <h4 style="margin: 0 0 6px 0; color: var(--admin-text); font-size: 16px;">
                                        <span style="color: var(--admin-text-secondary); font-size: 12px; margin-right: 8px;">#${globalIndex + 1}</span>
                                        ${title}${phonetic}
                                    </h4>
                                    <p style="margin: 0 0 8px 0; font-size: 13px; color: var(--admin-text-secondary); line-height: 1.5; word-break: break-word;">
                                        ${description}
                                    </p>
                                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                        ${category}${type}${wordCount}${difficulty}
                                    </div>
                                </div>
                                <div class="table-actions" style="margin-left: 16px; flex-shrink: 0;">
                                    <button class="btn-view" 
                                        data-content-type="${contentType}" 
                                        data-index="${globalIndex}"
                                        onclick="
                                            // 只显示模态框，不使用alert
                                            try {
                                                const modal = document.getElementById('contentModal');
                                                const titleEl = document.getElementById('contentModalTitle');
                                                const bodyEl = document.getElementById('contentModalBody');
                                                
                                                if (modal && titleEl && bodyEl) {
                                                    titleEl.textContent = '词汇详情';
                                                    bodyEl.innerHTML = '<div style=\\'padding: 10px;\\'>' +
                                                        '<div style=\\'text-align: center; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;\\'>' +
                                                        '<h2 style=\\'color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;\\'>${title.replace(/'/g, "")}</h2>' +
                                                        '<div style=\\'color: #6b7280; font-size: 18px; font-style: italic;\\'>${item.phonetic ? item.phonetic : '暂无音标'}</div>' +
                                                        '</div>' +
                                                        '<div style=\\'margin-bottom: 20px;\\'>' +
                                                        '<div style=\\'background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);\\'>' +
                                                        '<div style=\\'color: #1f2937; font-size: 16px; line-height: 1.7; margin: 0;\\'>${description.replace(/'/g, "")}</div>' +
                                                        '</div>' +
                                                        '</div>' +
                                                        '<div style=\\'text-align: center; margin-top: 20px;\\'>' +
                                                        '<span style=\\'display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);\\'>' +
                                                        '难度等级：${item.difficulty || '未分级'}' +
                                                        '</span>' +
                                                        '</div>' +
                                                        '</div>';
                                                    modal.classList.add('active');
                                                    modal.style.display = 'flex';
                                                    
                                                    // 添加动画效果
                                                    const modalContent = modal.querySelector('.modal-content');
                                                    if (modalContent) {
                                                        modalContent.style.transform = 'scale(0.8)';
                                                        modalContent.style.opacity = '0';
                                                        setTimeout(() => {
                                                            modalContent.style.transform = 'scale(1)';
                                                            modalContent.style.opacity = '1';
                                                            modalContent.style.transition = 'all 0.3s ease';
                                                        }, 10);
                                                    }
                                                } else {
                                                    // 兜底显示简单提示
                                                    const notification = document.createElement('div');
                                                    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #667eea; color: white; padding: 16px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.1);';
                                                    notification.innerHTML = '<strong>${title.replace(/'/g, "")}</strong><br>${description.replace(/'/g, "")}';
                                                    document.body.appendChild(notification);
                                                    setTimeout(() => notification.remove(), 3000);
                                                }
                                            } catch(e) {
                                                console.log('显示失败: ' + e.message);
                                            }
                                        " 
                                        style="font-size: 12px; padding: 6px 10px; cursor: pointer; background: #10b981; color: white; border: none; border-radius: 4px; transition: background 0.2s;"
                                        onmouseover="this.style.background='#059669'"
                                        onmouseout="this.style.background='#10b981'">查看</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // 简化处理，现在直接使用onclick属性，不需要额外的事件监听器
        console.log('✅ 词汇列表渲染完成，使用直接onclick处理');

        // 渲染分页
        this.renderPagination(totalPages);
    }

    /**
     * 渲染分页
     */
    renderPagination(totalPages) {
        const container = document.getElementById('contentPagination');
        if (!container) return;

        if (totalPages <= 1) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';

        // 计算显示的页码范围
        let startPage = Math.max(1, this.currentContentPage - 2);
        let endPage = Math.min(totalPages, this.currentContentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + 4);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, endPage - 4);
            }
        }

        let paginationHTML = `
            <div style="display: flex; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap;">
                <button onclick="adminDashboard.goToPage(1)" 
                    ${this.currentContentPage === 1 ? 'disabled' : ''} 
                    style="padding: 8px 12px; border: 1px solid var(--admin-border); background: var(--admin-card-bg); color: var(--admin-text); border-radius: 4px; cursor: pointer;">
                    首页
                </button>
                <button onclick="adminDashboard.goToPage(${this.currentContentPage - 1})" 
                    ${this.currentContentPage === 1 ? 'disabled' : ''} 
                    style="padding: 8px 12px; border: 1px solid var(--admin-border); background: var(--admin-card-bg); color: var(--admin-text); border-radius: 4px; cursor: pointer;">
                    上一页
                </button>
        `;

        if (startPage > 1) {
            paginationHTML += `<span style="padding: 8px;">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentContentPage;
            paginationHTML += `
                <button onclick="adminDashboard.goToPage(${i})" 
                    style="padding: 8px 12px; border: 1px solid var(--admin-border); 
                    background: ${isActive ? 'var(--admin-primary)' : 'var(--admin-card-bg)'}; 
                    color: ${isActive ? 'white' : 'var(--admin-text)'}; 
                    border-radius: 4px; cursor: pointer; font-weight: ${isActive ? '600' : 'normal'};">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            paginationHTML += `<span style="padding: 8px;">...</span>`;
        }

        paginationHTML += `
                <button onclick="adminDashboard.goToPage(${this.currentContentPage + 1})" 
                    ${this.currentContentPage === totalPages ? 'disabled' : ''} 
                    style="padding: 8px 12px; border: 1px solid var(--admin-border); background: var(--admin-card-bg); color: var(--admin-text); border-radius: 4px; cursor: pointer;">
                    下一页
                </button>
                <button onclick="adminDashboard.goToPage(${totalPages})" 
                    ${this.currentContentPage === totalPages ? 'disabled' : ''} 
                    style="padding: 8px 12px; border: 1px solid var(--admin-border); background: var(--admin-card-bg); color: var(--admin-text); border-radius: 4px; cursor: pointer;">
                    末页
                </button>
            </div>
        `;

        container.innerHTML = paginationHTML;
    }

    /**
     * 跳转到指定页
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.allContentData.length / this.contentPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentContentPage = page;
        this.loadContentData(this.getCurrentContentType());
        
        // 滚动到顶部
        document.getElementById('contentList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * 获取内容类型名称
     */
    getContentTypeName(type) {
        const names = {
            vocabulary: '词汇',
            grammar: '语法',
            reading: '阅读',
            listening: '听力'
        };
        return names[type] || type;
    }

    /**
     * 获取指定类型的内容
     */
    getContentByType(type) {
        // 从真实词汇文件获取数据
        if (type === 'vocabulary') {
            let allWords = [];
            
            // 真实词汇文件的全局变量映射
            const realVocabFiles = {
                'basic': null, // 基础词汇从VocabularyDatabase获取
                'cet4': 'cet4Words',
                'cet6': 'cet6Words', 
                'tem4': 'tem4Words',
                'tem8': 'tem8Words',
                'ielts': 'ieltsWords',
                'toefl': 'toeflWords',
                'gre': 'greWords',
                'postgraduate': 'postgraduateWords'
            };
            
            // 根据选择的考试类型获取词汇
            if (this.currentExamType === 'all') {
                // 获取所有考试类型的词汇
                Object.entries(realVocabFiles).forEach(([examType, globalVarName]) => {
                    let words = [];
                    
                    if (examType === 'basic' && window.vocabularyDatabase) {
                        // 基础词汇从VocabularyDatabase获取
                        words = window.vocabularyDatabase.vocabularyData?.basic || [];
                    } else if (globalVarName && window[globalVarName]) {
                        // 从真实词汇文件获取
                        words = window[globalVarName] || [];
                    } else if (examType === 'cet6' && window['CET6_WORDS']) {
                        // 处理CET6的旧变量名
                        words = window['CET6_WORDS'] || [];
                    }
                    
                    if (words && words.length > 0) {
                        allWords.push(...words);
                    }
                });
            } else {
                // 获取指定考试类型的词汇
                const globalVarName = realVocabFiles[this.currentExamType];
                let words = [];
                
                console.log(`📊 getContentByType - 获取 ${this.currentExamType} 词汇:`);
                console.log(`   - globalVarName: ${globalVarName}`);
                console.log(`   - window[${globalVarName}] 存在:`, !!(globalVarName && window[globalVarName]));
                
                if (this.currentExamType === 'basic' && window.vocabularyDatabase) {
                    words = window.vocabularyDatabase.vocabularyData?.basic || [];
                    console.log(`   - 基础词汇数量: ${words.length}`);
                } else if (globalVarName && window[globalVarName]) {
                    words = window[globalVarName] || [];
                    console.log(`   - ${globalVarName} 词汇数量: ${words.length}`);
                } else if (this.currentExamType === 'cet6' && window['CET6_WORDS']) {
                    words = window['CET6_WORDS'] || [];
                    console.log(`   - CET6_WORDS 词汇数量: ${words.length}`);
                } else if (this.currentExamType === 'cet4' && !window['cet4Words'] && window.vocabularyDatabase) {
                    // CET4 文件不可用时，兜底使用 VocabularyDatabase
                    words = window.vocabularyDatabase.getVocabularyByExam('cet4') || [];
                    console.warn(`   - 使用VocabularyDatabase兜底CET4，数量: ${words.length}`);
                } else {
                    console.warn(`   - ⚠️ 未找到 ${this.currentExamType} 的词汇数据`);
                }
                
                if (words && words.length > 0) {
                    allWords.push(...words);
                    console.log(`   - ✅ 成功添加 ${words.length} 个词汇到 allWords`);
                } else {
                    console.warn(`   - ❌ 没有词汇数据可添加`);
                }
            }

            // 去重并格式化
            const uniqueWords = [];
            const seenWords = new Set();
            
            for (const word of allWords) {
                const wordKey = word.word || word.title;
                if (wordKey && !seenWords.has(wordKey)) {
                    seenWords.add(wordKey);
                    uniqueWords.push({
                        word: wordKey,
                        title: wordKey,
                        translation: word.meaning || word.translation || '暂无释义',
                        description: word.meaning || word.translation || '暂无释义',
                        difficulty: word.difficulty || word.examType || this.currentExamType.toUpperCase(),
                        phonetic: word.phonetic || '暂无音标'
                    });
                }
            }
            
            console.log(`📊 ${this.currentExamType === 'all' ? '全部' : this.currentExamType.toUpperCase()} 词汇统计:`);
            console.log(`   - 原始词汇数量: ${allWords.length}`);
            console.log(`   - 去重后数量: ${uniqueWords.length}`);
            console.log(`   - 返回结果:`, uniqueWords.length > 0 ? '✅ 有数据' : '❌ 无数据');
            
            return uniqueWords;
        }

        // 语法规则 - 从GrammarManager获取真实数据
        if (type === 'grammar') {
            if (window.grammarManager) {
                const rules = window.grammarManager.grammarRules || [];
                return rules.slice(0, 50).map(rule => ({
                    title: rule.title,
                    description: rule.description || rule.rule || rule.explanation,
                    difficulty: rule.difficulty,
                    category: rule.category
                }));
            }
            return [];
        }

        // 阅读文章 - 从ReadingManager获取真实数据
        if (type === 'reading') {
            if (window.readingManager && window.readingManager.articles) {
                const articles = window.readingManager.articles || [];
                return articles.slice(0, 30).map(article => ({
                    title: article.title,
                    description: article.content ? article.content.substring(0, 150) + '...' : '',
                    difficulty: article.difficulty,
                    type: article.type,
                    wordCount: article.wordCount
                }));
            }
            return [];
        }

        // 听力材料 - 从本地存储获取真实数据
        if (type === 'listening') {
            const materials = JSON.parse(localStorage.getItem('listening_materials') || '[]');
            return materials.slice(0, 30);
        }

        return [];
    }

    /**
     * 查看内容详情
     */
    viewContent(contentType, index) {
        console.log('🔍 viewContent 被调用', { contentType, index });
        
        try {
        const contentData = this.getContentByType(contentType);
            console.log('📊 获取到内容数据量:', contentData.length);
            
        const item = contentData[index];
            console.log('📖 查看的项目:', item);
        
        if (!item) {
                console.warn('❌ 未找到指定索引的内容项');
            this.showNotification('未找到内容', 'warning');
            return;
        }

        const title = item.title || item.word || item.name || '内容详情';
        const details = this.formatContentDetails(item, contentType);
            
            console.log('📋 内容详情:', { title, details });

        // 显示详情模态框
        const modal = document.getElementById('contentModal');
        const titleEl = document.getElementById('contentModalTitle');
        const bodyEl = document.getElementById('contentModalBody');
            
            console.log('🔧 模态框元素检查:', {
                modal: !!modal,
                titleEl: !!titleEl,
                bodyEl: !!bodyEl
            });
            
        if (modal && titleEl && bodyEl) {
            titleEl.textContent = title;
                
                // 使用innerHTML来更好地格式化内容
                if (contentType === 'vocabulary') {
                    bodyEl.innerHTML = `
                        <div style="line-height: 1.8; font-size: 14px;">
                            <div style="margin-bottom: 16px;">
                                <strong style="color: var(--admin-primary); font-size: 20px;">${item.word || item.title}</strong>
                                ${item.phonetic ? `<span style="color: var(--admin-secondary); margin-left: 12px;">[${item.phonetic}]</span>` : ''}
                            </div>
                            <div style="margin-bottom: 12px;">
                                <strong>释义：</strong>${item.translation || item.description || '暂无释义'}
                            </div>
                            <div style="margin-bottom: 12px;">
                                <strong>难度：</strong><span style="background: var(--admin-primary); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${item.difficulty || '未分级'}</span>
                            </div>
                            ${item.example ? `<div style="margin-bottom: 12px;"><strong>例句：</strong>${item.example}</div>` : ''}
                            ${item.synonyms ? `<div style="margin-bottom: 12px;"><strong>近义词：</strong>${item.synonyms}</div>` : ''}
                        </div>
                    `;
        } else {
                    bodyEl.innerHTML = `<div style="line-height: 1.6; white-space: pre-wrap;">${details}</div>`;
                }
                
                modal.classList.add('active');
                modal.style.display = 'flex'; // 双重保障
                console.log('✅ 模态框已显示');
                
                // 添加成功的视觉反馈
                this.showNotification('内容加载成功', 'success');
            } else {
                console.warn('⚠️ 模态框元素未找到，使用通知兜底');
                // 兜底：用通知显示详细信息
                alert(`📖 ${title}\n\n${details}`);
                this.showNotification('内容已在弹窗中显示', 'info');
            }
        } catch (error) {
            console.error('❌ viewContent 执行出错:', error);
            this.showNotification('查看内容时出错: ' + error.message, 'error');
        }
    }

    /**
     * 格式化内容详情
     */
    formatContentDetails(item, contentType) {
        if (contentType === 'vocabulary') {
            return `单词: ${item.word}\n音标: ${item.phonetic || '无'}\n释义: ${item.translation}\n难度: ${item.difficulty}`;
        }
        return JSON.stringify(item, null, 2);
    }

    /**
     * 添加内容
     */
    addContent() {
        const activeTab = document.querySelector('.tab-btn.active');
        const contentType = activeTab?.dataset.contentType || 'vocabulary';
        
        this.showNotification(`${this.getContentTypeName(contentType)}内容由系统管理`, 'info');
        console.log('内容类型:', contentType);
    }
}

// 初始化管理员控制台
let adminDashboard;

// 确保adminDashboard在全局作用域中可用
window.adminDashboard = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 初始化管理员控制台...');
    
    try {
    adminDashboard = new AdminDashboard();
        window.adminDashboard = adminDashboard;
        console.log('✅ 管理员控制台初始化完成，全局变量已设置');

    // 绑定内容详情模态框关闭事件
    const closeBtn = document.getElementById('closeContentModal');
    const footerCloseBtn = document.getElementById('contentModalCloseBtn');
    const modal = document.getElementById('contentModal');
        
        console.log('🔧 绑定模态框关闭事件:', {
            closeBtn: !!closeBtn,
            footerCloseBtn: !!footerCloseBtn,
            modal: !!modal
        });
        
    [closeBtn, footerCloseBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => { 
                    console.log('🔒 关闭模态框');
                    if (modal) {
                        modal.classList.remove('active');
                        modal.style.display = 'none';
                    }
                });
            }
        });
        
    if (modal) {
        modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('🔒 点击背景关闭模态框');
                    modal.classList.remove('active');
                    modal.style.display = 'none';
                }
            });
        }
        
        // 简化的初始化验证
        setTimeout(() => {
            console.log('✅ 管理控制台已初始化完成');
            console.log('🔍 查看按钮现在使用直接onclick方式，点击应该会立即显示alert');
            
            // 添加简单的测试方法
            window.testAlert = function() {
                alert('📚 测试词汇详情\\n\\n单词: test\\n音标: /test/\\n释义: 这是一个测试\\n难度: 简单');
            };
            
            console.log('🧪 测试方法: window.testAlert() - 可在控制台中调用');
        }, 1000);
        
    } catch (error) {
        console.error('❌ 管理员控制台初始化失败:', error);
    }
});

