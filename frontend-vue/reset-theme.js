// 主题强制重置脚本
// 在浏览器控制台中运行此脚本来强制重置为深色主题

console.log('=== LearnSphere 主题强制重置 ===')

// 1. 清除当前主题设置
localStorage.removeItem('user_theme_preference')
console.log('✓ 已清除主题偏好设置')

// 2. 设置为深色模式
localStorage.setItem('user_theme_preference', 'dark')
console.log('✓ 已强制设置为深色模式')

// 3. 显示当前设置
console.log('当前设置:', localStorage.getItem('user_theme_preference'))

// 4. 刷新页面
console.log('即将刷新页面...')
setTimeout(() => {
    location.reload()
}, 1000)
