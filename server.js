const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-for-jwt'; // 使用环境变量

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 限制请求体大小
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务优化
app.use(express.static(path.join(__dirname, '.'), {
    maxAge: '1d', // 缓存1天
    etag: true,
    lastModified: true
}));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ 
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
    });
});

// --- User Authentication API ---

const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Helper function to read users
const readUsers = () => {
    try {
        if (!fs.existsSync(usersFilePath)) {
            // 如果文件不存在，创建空的用户数组
            const emptyUsers = [];
            fs.writeFileSync(usersFilePath, JSON.stringify(emptyUsers, null, 2));
            return emptyUsers;
        }
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(usersData);
    } catch (error) {
        console.error('读取用户文件错误:', error);
        return [];
    }
};

// Helper function to write users
const writeUsers = (users) => {
    try {
        // 确保data目录存在
        const dataDir = path.dirname(usersFilePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('写入用户文件错误:', error);
        throw error; // 重新抛出错误，让调用者处理
    }
};

// Register Endpoint
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const users = readUsers();
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { 
            id: Date.now(), 
            username, 
            password: hashedPassword,
            role: 'user', // Default role for new users
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(newUser);
        writeUsers(users);

        res.status(201).json({ 
            message: '用户注册成功',
            user: { id: newUser.id, username: newUser.username, role: newUser.role }
        });
    } catch (error) {
        console.error('注册过程中发生错误:', error);
        res.status(500).json({ message: '注册过程中发生服务器错误' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const users = readUsers();
    const user = users.find(user => user.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ message: 'Login successful', token, username: user.username, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});


// --- Server Routes ---

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'html', 'index.html'));
});

// You can add other routes here if needed
// For example, if you have a separate statistics page:
app.get('/statistics', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'html', 'statistics.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});