document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const modalBody = document.getElementById('modal-body');

    const authContainer = document.getElementById('auth-container');
    const userInfoContainer = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');

    const API_BASE_URL = 'http://localhost:3000/api';

    // --- UI Update Logic ---
    const updateUIForLoggedInUser = (username, role) => {
        if (!authContainer || !userInfoContainer || !usernameDisplay) return;
        authContainer.style.display = 'none';
        userInfoContainer.style.display = 'flex';
        
        console.log('🔐 更新UI - 用户:', username, '角色:', role);
        
        let userHtml = `<span>${username}</span>`;
        
        // 获取管理控制台按钮
        const adminBtn = document.getElementById('adminPanelBtn');
        console.log('🔍 管理按钮元素:', adminBtn ? '找到' : '未找到');
        
        if (role === 'admin') {
            // 管理员：显示徽章和管理控制台按钮
            userHtml += `<span class="admin-badge">管理员</span>`;
            console.log('👑 检测到管理员角色，显示管理控制台按钮');
            
            if (adminBtn) {
                adminBtn.style.display = 'flex';
                // 移除旧的事件监听器（如果存在）
                const newAdminBtn = adminBtn.cloneNode(true);
                adminBtn.parentNode.replaceChild(newAdminBtn, adminBtn);
                // 添加新的事件监听器
                document.getElementById('adminPanelBtn').addEventListener('click', () => {
                    console.log('🚀 打开管理控制台');
                    window.open('/src/html/admin.html', '_blank');
                });
                console.log('✅ 管理按钮已显示并绑定事件');
            } else {
                console.warn('⚠️ 未找到管理按钮元素，无法显示');
            }
        } else {
            // 普通用户：隐藏管理控制台按钮
            console.log('👤 普通用户，隐藏管理控制台按钮');
            if (adminBtn) {
                adminBtn.style.display = 'none';
            }
        }
        
        usernameDisplay.innerHTML = userHtml;
    };

    const updateUIForLoggedOutUser = () => {
        if (!authContainer || !userInfoContainer || !usernameDisplay) return;
        authContainer.style.display = 'flex';
        userInfoContainer.style.display = 'none';
        usernameDisplay.textContent = '';
        
        // 隐藏管理控制台按钮
        const adminBtn = document.getElementById('adminPanelBtn');
        if (adminBtn) {
            adminBtn.style.display = 'none';
        }
    };

    // --- Modal Control ---
    const openModal = () => authModal && (authModal.style.display = 'flex');
    const closeModal = () => authModal && (authModal.style.display = 'none');

    // --- Form Rendering ---
    const renderLoginForm = () => {
        if (!modalBody) return;
        modalBody.innerHTML = `
            <h2>登录</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="login-username">用户名</label>
                    <input type="text" id="login-username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="login-password">密码</label>
                    <input type="password" id="login-password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary">登录</button>
            </form>
            <p class="form-switch-link">还没有账户? <a id="switch-to-register">立即注册</a></p>
        `;
        document.getElementById('switch-to-register').addEventListener('click', renderRegisterForm);
        document.getElementById('login-form').addEventListener('submit', handleLogin);
    };
    
    const renderRegisterForm = () => {
        if (!modalBody) return;
        modalBody.innerHTML = `
            <h2>注册</h2>
            <form id="register-form">
                <div class="form-group">
                    <label for="register-username">用户名</label>
                    <input type="text" id="register-username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="register-password">密码</label>
                    <input type="password" id="register-password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary">注册</button>
            </form>
            <p class="form-switch-link">已有账户? <a id="switch-to-login">立即登录</a></p>
        `;
        document.getElementById('switch-to-login').addEventListener('click', renderLoginForm);
        document.getElementById('register-form').addEventListener('submit', handleRegister);
    };

    // --- API Handlers ---
    const handleLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        setButtonLoading(submitBtn, '登录中...');

        const username = form.username.value;
        const password = form.password.value;

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);
            updateUIForLoggedInUser(data.username, data.role);
            closeModal();
        } catch (error) {
            window.Notification.error(error.message || '登录失败，请重试');
        } finally {
            unsetButtonLoading(submitBtn, originalBtnText);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        setButtonLoading(submitBtn, '注册中...');

        const username = form.username.value;
        const password = form.password.value;
        
        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
             if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            // Switch to login form after successful registration
            renderLoginForm();
            window.Notification.success('注册成功！请登录。');
        } catch (error) {
            window.Notification.error(error.message || '注册失败，请重试');
        } finally {
            unsetButtonLoading(submitBtn, originalBtnText);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        updateUIForLoggedOutUser();
        
        // 确保管理控制台按钮被隐藏
        const adminBtn = document.getElementById('adminPanelBtn');
        if (adminBtn) {
            adminBtn.style.display = 'none';
        }
    };

    // --- Button Loading State ---
    const setButtonLoading = (btn, text) => {
        btn.disabled = true;
        btn.innerHTML = `
            <span class="spinner"></span>
            ${text}
        `;
    };

    const unsetButtonLoading = (btn, originalText) => {
        btn.disabled = false;
        btn.innerHTML = originalText;
    };


    // --- Initial State Check ---
    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        
        console.log('🔍 检查登录状态:', { token: token ? '存在' : '不存在', username, role });
        
        if (token && username) {
            // Here you might want to verify the token with the server in a real app
            updateUIForLoggedInUser(username, role);
        } else {
            updateUIForLoggedOutUser();
        }
    };

    // --- Event Listeners ---
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            renderLoginForm();
            openModal();
        });
    }
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            renderRegisterForm();
            openModal();
        });
    }
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // --- Initialization ---
    checkLoginStatus();
});
