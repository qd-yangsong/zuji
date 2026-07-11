#!/bin/bash
# 足迹手帐落地页本地预览验证脚本
set -euo pipefail

PORT=10091
ROOT="web/landing"
BASE="http://localhost:$PORT"

# 启动本地服务器，退出时自动清理
python3 -m http.server "$PORT" --directory "$ROOT" &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 1

# 验证首页、CSS 及所有图片
declare -a URLS=(
  "/"
  "/styles.css"
  "/assets/logo/thumb-96.png"
  "/assets/logo/logo-400.png"
  "/assets/theme-illust/night.png"
  "/assets/theme-illust/coffee.png"
  "/assets/theme-illust/park.png"
  "/assets/theme-illust/gather.png"
  "/assets/theme-illust/exhibit.png"
  "/assets/empty-state/journey.png"
)

for path in "${URLS[@]}"; do
  status=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")
  if [[ "$status" != "200" ]]; then
    echo "❌ $path 返回 $status"
    exit 1
  fi
  echo "✅ $path 200"
done

echo "🎉 所有资源验证通过"
