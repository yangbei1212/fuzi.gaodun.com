#!/bin/bash

# 夫子单词卡 - 生产环境部署脚本
# 使用方法: ./deploy.sh [服务器地址] [远程路径]
# 示例: ./deploy.sh user@fuzi.gaodun.com /var/www/html

set -e  # 遇到错误立即退出

echo "=================================="
echo "  夫子单词卡 - 生产环境部署"
echo "=================================="
echo ""

# 检查参数
if [ $# -lt 2 ]; then
    echo "❌ 错误：缺少必要参数"
    echo ""
    echo "使用方法:"
    echo "  ./deploy.sh [服务器地址] [远程路径]"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh user@fuzi.gaodun.com /var/www/html"
    echo ""
    exit 1
fi

SERVER=$1
REMOTE_PATH=$2

echo "📋 部署配置:"
echo "   服务器: $SERVER"
echo "   路径: $REMOTE_PATH"
echo ""

# 步骤 1: 检查依赖
echo "🔍 步骤 1/5: 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到 npm，请先安装"
    exit 1
fi

if ! command -v rsync &> /dev/null; then
    echo "⚠️  警告：未找到 rsync，将使用 scp"
    USE_SCP=true
else
    USE_SCP=false
fi

echo "✅ 依赖检查完成"
echo ""

# 步骤 2: 构建项目
echo "🔨 步骤 2/5: 构建项目..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ 错误：构建失败，dist 目录不存在"
    exit 1
fi

echo "✅ 构建完成"
echo ""

# 步骤 3: 备份旧文件（可选）
echo "💾 步骤 3/5: 创建远程备份..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
ssh "$SERVER" "mkdir -p $REMOTE_PATH/$BACKUP_DIR && cp -r $REMOTE_PATH/assets $REMOTE_PATH/index.html $REMOTE_PATH/$BACKUP_DIR/ 2>/dev/null || echo '无需备份（首次部署）'"
echo "✅ 备份完成（如果有旧文件）"
echo ""

# 步骤 4: 上传文件
echo "📤 步骤 4/5: 上传文件到服务器..."

if [ "$USE_SCP" = true ]; then
    echo "   使用 scp 上传..."
    scp -r dist/* "$SERVER:$REMOTE_PATH/"
    scp -r api "$SERVER:$REMOTE_PATH/"
else
    echo "   使用 rsync 上传..."
    rsync -avz --progress dist/* "$SERVER:$REMOTE_PATH/"
    rsync -avz --progress api/ "$SERVER:$REMOTE_PATH/api/"
fi

echo "✅ 文件上传完成"
echo ""

# 步骤 5: 设置权限
echo "🔐 步骤 5/5: 设置文件权限..."
ssh "$SERVER" "chmod -R 755 $REMOTE_PATH/api && chmod 644 $REMOTE_PATH/api/*.php"
echo "✅ 权限设置完成"
echo ""

# 完成
echo "=================================="
echo "🎉 部署成功！"
echo "=================================="
echo ""
echo "📝 下一步："
echo "1. 访问网站：https://fuzi.gaodun.com"
echo "2. 清除浏览器缓存（Ctrl + Shift + Delete）"
echo "3. 测试接口功能"
echo ""
echo "🧪 测试命令："
echo ""
echo "# 测试聊天接口"
echo "curl -X POST https://fuzi.gaodun.com/api/doubao-chat.php \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"messages\":[{\"role\":\"user\",\"content\":\"你好\"}]}'"
echo ""
echo "# 测试图片生成接口"
echo "curl -X POST https://fuzi.gaodun.com/api/doubao-image.php \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"prompt\":\"一只猫\",\"n\":1,\"size\":\"2k\"}'"
echo ""
echo "📚 查看详细文档："
echo "   - SOLUTION_SUMMARY.md"
echo "   - DEPLOYMENT_CHECKLIST.md"
echo ""

