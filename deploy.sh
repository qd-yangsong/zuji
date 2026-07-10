#!/bin/bash
# ============================================================
# 足迹手帐 部署脚本
# 用法：./deploy.sh
# 前提：服务器已安装 Docker + Docker Compose
# ============================================================

set -e

echo "=== 足迹手帐 部署开始 ==="

# 1. 检查 .env.production 是否存在
if [ ! -f .env.production ]; then
  echo "❌ 缺少 .env.production 文件，请先创建并填入真实凭证"
  exit 1
fi

# 2. 检查是否有未替换的占位符
if grep -q "替换为" .env.production || grep -q "你的" .env.production; then
  echo "❌ .env.production 中仍有占位符未替换，请先填入真实凭证"
  exit 1
fi

# 3. 构建并启动服务
echo ">>> 构建 Docker 镜像并启动..."
docker compose up -d --build

# 4. 等待服务就绪
echo ">>> 等待服务就绪..."
sleep 10

# 5. 运行数据库迁移
echo ">>> 运行数据库迁移..."
docker compose exec -T server npx prisma migrate deploy

# 6. 运行种子数据
echo ">>> 导入系统预设数据（标签）..."
docker compose exec -T server npx prisma db seed

# 7. 创建管理员账号（交互式）
echo ""
echo "=== 创建管理员账号 ==="
echo "请输入管理员账号密码："
docker compose exec -it server node prisma/seed-admin.js

echo ""
echo "=== 部署完成 ==="
echo "后端 API:   http://你的服务器IP:3000/api"
echo "健康检查:   http://你的服务器IP:3000/api/health"
echo ""
echo "下一步："
echo "1. 配置 Nginx: sudo cp nginx.conf /etc/nginx/sites-available/zuji"
echo "2. 启用站点:   sudo ln -s /etc/nginx/sites-available/zuji /etc/nginx/sites-enabled/"
echo "3. 修改域名:   编辑 nginx.conf 中的 server_name"
echo "4. 申请 SSL:   sudo certbot --nginx -d 你的域名.com"
echo "5. 修改小程序 API 地址: 编辑 apps/miniapp/config/prod.ts 中的域名"
echo "6. 构建小程序:  pnpm --filter miniapp build:weapp"
echo "7. 微信开发者工具: 上传代码 -> 提交审核"