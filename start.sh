#!/bin/bash

# 英语等级考试学习软件启动脚本

echo ""
echo "====================================="
echo "   英语等级考试学习软件"
echo "====================================="
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Node.js是否安装
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ 检测到Node.js: $NODE_VERSION${NC}"
        return 0
    else
        echo -e "${RED}❌ 未检测到Node.js${NC}"
        return 1
    fi
}

# 检查Python是否安装
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        echo -e "${GREEN}✅ 检测到Python3: $PYTHON_VERSION${NC}"
        return 0
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version)
        echo -e "${GREEN}✅ 检测到Python: $PYTHON_VERSION${NC}"
        return 0
    else
        echo -e "${RED}❌ 未检测到Python${NC}"
        return 1
    fi
}

# 使用Node.js启动
start_with_nodejs() {
    echo "🚀 使用Node.js启动应用..."
    echo ""
    node tools/launcher.js
}

# 使用Python启动
start_with_python() {
    echo "🔧 使用Python内置服务器启动..."
    echo ""
    
    # 尝试打开浏览器
    if command -v open &> /dev/null; then
        # macOS
        open http://localhost:8000 &
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open http://localhost:8000 &
    fi
    
    # 启动Python服务器
    if command -v python3 &> /dev/null; then
        python3 -m http.server 8000
    else
        python -m SimpleHTTPServer 8000
    fi
}

# 显示手动启动说明
show_manual_instructions() {
    echo ""
    echo -e "${RED}❌ 无法自动启动服务器！${NC}"
    echo ""
    echo -e "${YELLOW}💡 解决方案：${NC}"
    echo "   1. 安装Node.js (推荐): https://nodejs.org/"
    echo "   2. 或安装Python: https://python.org/"
    echo "   3. 或直接用浏览器打开 src/html/index.html"
    echo ""
    echo "📁 项目位置: $SCRIPT_DIR"
    echo ""
}

# 设置退出处理
cleanup() {
    echo ""
    echo ""
    echo "👋 感谢使用英语等级考试学习软件！"
    exit 0
}

# 捕获退出信号
trap cleanup SIGINT SIGTERM

# 主逻辑
main() {
    # 检查并启动服务器
    if check_nodejs; then
        start_with_nodejs
    elif check_python; then
        start_with_python
    else
        show_manual_instructions
        read -p "按任意键退出..."
    fi
}

# 检查参数
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "英语等级考试学习软件启动脚本"
    echo ""
    echo "用法:"
    echo "  ./start.sh           启动应用"
    echo "  ./start.sh --help    显示帮助"
    echo ""
    echo "要求:"
    echo "  - Node.js (推荐) 或 Python"
    echo "  - 现代浏览器"
    echo ""
    exit 0
fi

# 执行主函数
main
