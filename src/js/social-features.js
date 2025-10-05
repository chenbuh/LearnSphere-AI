/**
 * 社交学习功能
 * 提供好友系统、学习小组、排行榜等社交功能
 */
class SocialFeatures {
    constructor() {
        this.currentUser = null;
        this.friends = [];
        this.studyGroups = [];
        this.leaderboards = {};
        this.notifications = [];
        this.chatRooms = {};
        this.init();
    }

    init() {
        console.log('👥 初始化社交学习功能...');
        this.initializeUser();
        this.setupEventListeners();
        this.loadSocialData();
        this.setupRealTimeFeatures();
    }

    /**
     * 初始化用户
     */
    initializeUser() {
        this.currentUser = {
            id: this.generateUserId(),
            username: '学习者' + Math.floor(Math.random() * 1000),
            avatar: '👤',
            level: 1,
            experience: 0,
            status: 'online', // online, offline, studying, busy
            studyStreak: 0,
            totalStudyTime: 0,
            achievements: [],
            preferences: {
                allowFriendRequests: true,
                showOnlineStatus: true,
                allowStudyInvites: true,
                notifications: {
                    friendRequests: true,
                    studyInvites: true,
                    achievements: true,
                    leaderboardUpdates: false
                }
            },
            privacy: {
                profileVisibility: 'friends', // public, friends, private
                activityVisibility: 'friends',
                statisticsVisibility: 'friends'
            }
        };
        
        console.log('👤 用户已初始化:', this.currentUser.username);
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听学习活动
        document.addEventListener('learningActivity', (event) => {
            this.onLearningActivity(event.detail);
        });

        // 监听成就解锁
        document.addEventListener('achievementUnlocked', (event) => {
            this.shareAchievement(event.detail);
        });

        // 监听等级提升
        document.addEventListener('levelUp', (event) => {
            this.announceLevelUp(event.detail);
        });
    }

    /**
     * 好友系统
     */
    
    /**
     * 发送好友请求
     */
    async sendFriendRequest(targetUserId, message = '') {
        if (!this.currentUser.preferences.allowFriendRequests) {
            throw new Error('您已禁用好友请求功能');
        }

        const request = {
            id: this.generateRequestId(),
            from: this.currentUser.id,
            to: targetUserId,
            message: message,
            timestamp: Date.now(),
            status: 'pending'
        };

        // 模拟发送请求
        console.log('📨 发送好友请求:', request);
        
        // 添加到通知系统
        this.addNotification({
            type: 'friend_request_sent',
            title: '好友请求已发送',
            message: `已向用户发送好友请求`,
            timestamp: Date.now()
        });

        return request;
    }

    /**
     * 接受好友请求
     */
    async acceptFriendRequest(requestId) {
        const request = this.findRequestById(requestId);
        if (!request) {
            throw new Error('请求不存在');
        }

        // 添加好友关系
        const friendship = {
            id: this.generateFriendshipId(),
            user1: request.from,
            user2: request.to,
            establishedAt: Date.now(),
            status: 'active'
        };

        this.friends.push(friendship);
        
        // 通知对方
        this.addNotification({
            type: 'friend_request_accepted',
            title: '好友请求已接受',
            message: `${this.currentUser.username} 接受了您的好友请求`,
            timestamp: Date.now()
        });

        console.log('✅ 好友请求已接受');
        this.saveSocialData();
    }

    /**
     * 拒绝好友请求
     */
    async rejectFriendRequest(requestId) {
        const request = this.findRequestById(requestId);
        if (request) {
            request.status = 'rejected';
            console.log('❌ 好友请求已拒绝');
        }
    }

    /**
     * 移除好友
     */
    async removeFriend(friendId) {
        this.friends = this.friends.filter(friendship => 
            !(friendship.user1 === friendId || friendship.user2 === friendId)
        );
        
        this.addNotification({
            type: 'friend_removed',
            title: '好友已移除',
            message: '您已移除一位好友',
            timestamp: Date.now()
        });

        console.log('👋 好友已移除');
        this.saveSocialData();
    }

    /**
     * 获取好友列表
     */
    getFriendsList() {
        return this.friends.map(friendship => {
            const friendId = friendship.user1 === this.currentUser.id ? 
                friendship.user2 : friendship.user1;
            
            return {
                id: friendId,
                username: `学习者${friendId.slice(-3)}`,
                avatar: ['👤', '👨', '👩', '🧑'][Math.floor(Math.random() * 4)],
                level: Math.floor(Math.random() * 30) + 1,
                status: ['online', 'offline', 'studying'][Math.floor(Math.random() * 3)],
                lastActive: Date.now() - Math.random() * 86400000, // 最近24小时内
                studyStreak: Math.floor(Math.random() * 30),
                friendshipDate: friendship.establishedAt
            };
        });
    }

    /**
     * 学习小组功能
     */
    
    /**
     * 创建学习小组
     */
    async createStudyGroup(groupData) {
        const group = {
            id: this.generateGroupId(),
            name: groupData.name,
            description: groupData.description || '',
            creator: this.currentUser.id,
            members: [this.currentUser.id],
            maxMembers: groupData.maxMembers || 10,
            privacy: groupData.privacy || 'public', // public, private, invite_only
            category: groupData.category || 'general',
            createdAt: Date.now(),
            rules: groupData.rules || [],
            goals: groupData.goals || [],
            currentChallenge: null,
            stats: {
                totalStudyTime: 0,
                completedChallenges: 0,
                activeMembers: 1
            }
        };

        this.studyGroups.push(group);
        
        this.addNotification({
            type: 'group_created',
            title: '学习小组已创建',
            message: `您创建了学习小组 "${group.name}"`,
            timestamp: Date.now()
        });

        console.log('👥 学习小组已创建:', group.name);
        this.saveSocialData();
        
        return group;
    }

    /**
     * 加入学习小组
     */
    async joinStudyGroup(groupId, message = '') {
        const group = this.studyGroups.find(g => g.id === groupId);
        if (!group) {
            throw new Error('学习小组不存在');
        }

        if (group.members.length >= group.maxMembers) {
            throw new Error('学习小组已满');
        }

        if (group.members.includes(this.currentUser.id)) {
            throw new Error('您已是该小组成员');
        }

        group.members.push(this.currentUser.id);
        group.stats.activeMembers++;

        this.addNotification({
            type: 'group_joined',
            title: '已加入学习小组',
            message: `您已加入学习小组 "${group.name}"`,
            timestamp: Date.now()
        });

        console.log('✅ 已加入学习小组:', group.name);
        this.saveSocialData();
    }

    /**
     * 退出学习小组
     */
    async leaveStudyGroup(groupId) {
        const group = this.studyGroups.find(g => g.id === groupId);
        if (group) {
            group.members = group.members.filter(id => id !== this.currentUser.id);
            group.stats.activeMembers = Math.max(0, group.stats.activeMembers - 1);
            
            console.log('👋 已退出学习小组:', group.name);
            this.saveSocialData();
        }
    }

    /**
     * 发起小组挑战
     */
    async createGroupChallenge(groupId, challengeData) {
        const group = this.studyGroups.find(g => g.id === groupId);
        if (!group) {
            throw new Error('学习小组不存在');
        }

        const challenge = {
            id: this.generateChallengeId(),
            groupId: groupId,
            title: challengeData.title,
            description: challengeData.description,
            type: challengeData.type, // daily, weekly, custom
            target: challengeData.target,
            startDate: challengeData.startDate || Date.now(),
            endDate: challengeData.endDate,
            participants: [],
            progress: {},
            rewards: challengeData.rewards || {},
            status: 'active'
        };

        group.currentChallenge = challenge.id;

        this.addNotification({
            type: 'group_challenge_created',
            title: '小组挑战开始',
            message: `"${challenge.title}" 挑战已在小组中发起`,
            timestamp: Date.now()
        });

        console.log('🎯 小组挑战已创建:', challenge.title);
        return challenge;
    }

    /**
     * 排行榜系统
     */
    
    /**
     * 更新排行榜
     */
    updateLeaderboard(category, userScore) {
        if (!this.leaderboards[category]) {
            this.leaderboards[category] = [];
        }

        const existingEntry = this.leaderboards[category].find(
            entry => entry.userId === this.currentUser.id
        );

        if (existingEntry) {
            existingEntry.score = Math.max(existingEntry.score, userScore);
            existingEntry.lastUpdated = Date.now();
        } else {
            this.leaderboards[category].push({
                userId: this.currentUser.id,
                username: this.currentUser.username,
                avatar: this.currentUser.avatar,
                score: userScore,
                lastUpdated: Date.now()
            });
        }

        // 排序并限制榜单长度
        this.leaderboards[category].sort((a, b) => b.score - a.score);
        this.leaderboards[category] = this.leaderboards[category].slice(0, 100);

        console.log(`📊 排行榜已更新: ${category}`);
    }

    /**
     * 获取排行榜
     */
    getLeaderboard(category, limit = 10) {
        const leaderboard = this.leaderboards[category] || [];
        
        // 添加排名
        return leaderboard.slice(0, limit).map((entry, index) => ({
            ...entry,
            rank: index + 1,
            isCurrentUser: entry.userId === this.currentUser.id
        }));
    }

    /**
     * 获取用户排名
     */
    getUserRank(category) {
        const leaderboard = this.leaderboards[category] || [];
        const userIndex = leaderboard.findIndex(
            entry => entry.userId === this.currentUser.id
        );
        
        return userIndex === -1 ? null : userIndex + 1;
    }

    /**
     * 学习活动分享
     */
    
    /**
     * 分享学习成就
     */
    shareAchievement(achievement) {
        if (!this.currentUser.preferences.notifications.achievements) {
            return;
        }

        const shareData = {
            type: 'achievement_share',
            userId: this.currentUser.id,
            username: this.currentUser.username,
            achievement: achievement,
            timestamp: Date.now()
        };

        // 通知好友
        this.notifyFriends('friend_achievement', {
            title: '好友获得成就',
            message: `${this.currentUser.username} 获得了成就 "${achievement.title}"`,
            data: shareData
        });

        console.log('🏆 成就已分享:', achievement.title);
    }

    /**
     * 分享学习进度
     */
    shareProgress(progressData) {
        const shareData = {
            type: 'progress_share',
            userId: this.currentUser.id,
            username: this.currentUser.username,
            progress: progressData,
            timestamp: Date.now()
        };

        // 发布到动态
        this.postToFeed(shareData);

        console.log('📈 学习进度已分享');
    }

    /**
     * 学习邀请功能
     */
    
    /**
     * 发送学习邀请
     */
    async sendStudyInvite(friendId, studyData) {
        const invite = {
            id: this.generateInviteId(),
            from: this.currentUser.id,
            to: friendId,
            type: 'study_session',
            data: studyData,
            message: studyData.message || '',
            timestamp: Date.now(),
            expiresAt: Date.now() + (studyData.duration || 3600000), // 默认1小时
            status: 'pending'
        };

        // 发送邀请通知
        this.sendNotificationToUser(friendId, {
            type: 'study_invite',
            title: '学习邀请',
            message: `${this.currentUser.username} 邀请您一起学习`,
            data: invite
        });

        console.log('📚 学习邀请已发送');
        return invite;
    }

    /**
     * 创建学习房间
     */
    async createStudyRoom(roomData) {
        const room = {
            id: this.generateRoomId(),
            name: roomData.name,
            host: this.currentUser.id,
            participants: [this.currentUser.id],
            maxParticipants: roomData.maxParticipants || 4,
            topic: roomData.topic,
            difficulty: roomData.difficulty || 'intermediate',
            isPrivate: roomData.isPrivate || false,
            password: roomData.password || null,
            createdAt: Date.now(),
            status: 'waiting', // waiting, active, finished
            currentActivity: null,
            settings: {
                allowChat: true,
                allowVoice: false,
                autoNext: true,
                timer: roomData.timer || 30
            }
        };

        this.chatRooms[room.id] = room;

        console.log('🏠 学习房间已创建:', room.name);
        return room;
    }

    /**
     * 实时聊天功能
     */
    
    /**
     * 发送消息
     */
    sendMessage(roomId, message, type = 'text') {
        const room = this.chatRooms[roomId];
        if (!room) {
            throw new Error('房间不存在');
        }

        const msg = {
            id: this.generateMessageId(),
            userId: this.currentUser.id,
            username: this.currentUser.username,
            avatar: this.currentUser.avatar,
            content: message,
            type: type, // text, emoji, system
            timestamp: Date.now(),
            reactions: {}
        };

        if (!room.messages) {
            room.messages = [];
        }
        
        room.messages.push(msg);

        // 通知房间内其他用户
        this.broadcastToRoom(roomId, 'new_message', msg);

        console.log('💬 消息已发送:', message);
        return msg;
    }

    /**
     * 添加消息反应
     */
    addMessageReaction(roomId, messageId, emoji) {
        const room = this.chatRooms[roomId];
        if (!room || !room.messages) return;

        const message = room.messages.find(m => m.id === messageId);
        if (message) {
            if (!message.reactions[emoji]) {
                message.reactions[emoji] = [];
            }
            
            if (!message.reactions[emoji].includes(this.currentUser.id)) {
                message.reactions[emoji].push(this.currentUser.id);
            }
        }
    }

    /**
     * 通知系统
     */
    
    /**
     * 添加通知
     */
    addNotification(notification) {
        const fullNotification = {
            id: this.generateNotificationId(),
            ...notification,
            read: false,
            createdAt: Date.now()
        };

        this.notifications.unshift(fullNotification);
        
        // 限制通知数量
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }

        // 显示通知
        this.showNotificationPopup(fullNotification);
        
        this.saveSocialData();
    }

    /**
     * 标记通知为已读
     */
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveSocialData();
        }
    }

    /**
     * 获取未读通知数量
     */
    getUnreadNotificationCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    /**
     * 辅助方法
     */
    
    /**
     * 通知好友
     */
    notifyFriends(type, notificationData) {
        const friends = this.getFriendsList();
        friends.forEach(friend => {
            if (friend.status === 'online') {
                this.sendNotificationToUser(friend.id, {
                    ...notificationData,
                    type: type
                });
            }
        });
    }

    /**
     * 发送通知给用户
     */
    sendNotificationToUser(userId, notification) {
        // 实际实现中，这里会通过WebSocket或其他方式发送
        console.log(`📢 发送通知给用户 ${userId}:`, notification);
    }

    /**
     * 广播到房间
     */
    broadcastToRoom(roomId, event, data) {
        const room = this.chatRooms[roomId];
        if (room) {
            room.participants.forEach(participantId => {
                if (participantId !== this.currentUser.id) {
                    console.log(`📡 广播到房间 ${roomId}, 用户 ${participantId}:`, event, data);
                }
            });
        }
    }

    /**
     * 显示通知弹窗
     */
    showNotificationPopup(notification) {
        // 检查权限
        if (!this.currentUser.preferences.notifications[notification.type.split('_')[0]]) {
            return;
        }

        const popup = document.createElement('div');
        popup.className = 'social-notification-popup';
        popup.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(notification.type)}</div>
                <div class="notification-text">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;

        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            padding: 1rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

        document.body.appendChild(popup);

        // 绑定关闭事件
        popup.querySelector('.notification-close').addEventListener('click', () => {
            popup.remove();
        });

        // 5秒后自动关闭
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 5000);
    }

    /**
     * 获取通知图标
     */
    getNotificationIcon(type) {
        const icons = {
            friend_request: '👋',
            friend_request_accepted: '✅',
            group_joined: '👥',
            achievement_share: '🏆',
            study_invite: '📚',
            group_challenge: '🎯',
            level_up: '⬆️'
        };
        
        return icons[type] || '📢';
    }

    /**
     * ID生成器
     */
    generateUserId() { return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    generateRequestId() { return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    generateFriendshipId() { return 'friend_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    generateGroupId() { return 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    generateChallengeId() { return 'challenge_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    generateInviteId() { return 'invite_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    generateRoomId() { return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    generateMessageId() { return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }
    generateNotificationId() { return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

    /**
     * 查找请求
     */
    findRequestById(requestId) {
        // 模拟从数据库查找
        return null;
    }

    /**
     * 设置实时功能
     */
    setupRealTimeFeatures() {
        // 模拟WebSocket连接
        console.log('🔌 设置实时功能连接...');
        
        // 定期更新在线状态
        setInterval(() => {
            this.updateOnlineStatus();
        }, 30000); // 30秒更新一次
    }

    /**
     * 更新在线状态
     */
    updateOnlineStatus() {
        // 更新最后活动时间
        this.currentUser.lastActive = Date.now();
        
        // 广播状态更新
        console.log('📡 状态已更新');
    }

    /**
     * 数据持久化
     */
    saveSocialData() {
        const socialData = {
            currentUser: this.currentUser,
            friends: this.friends,
            studyGroups: this.studyGroups,
            notifications: this.notifications,
            leaderboards: this.leaderboards,
            lastSaved: Date.now()
        };
        
        localStorage.setItem('social_features_data', JSON.stringify(socialData));
    }

    loadSocialData() {
        try {
            const saved = localStorage.getItem('social_features_data');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentUser = { ...this.currentUser, ...data.currentUser };
                this.friends = data.friends || [];
                this.studyGroups = data.studyGroups || [];
                this.notifications = data.notifications || [];
                this.leaderboards = data.leaderboards || {};
                console.log('📥 社交数据已加载');
            }
        } catch (error) {
            console.error('❌ 加载社交数据失败:', error);
        }
    }

    /**
     * 销毁社交功能
     */
    destroy() {
        this.saveSocialData();
        console.log('👥 社交学习功能已销毁');
    }
}

// 创建全局实例
window.SocialFeatures = new SocialFeatures();
