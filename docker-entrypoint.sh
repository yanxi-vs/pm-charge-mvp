#!/bin/sh
set -e

# 首次启动时执行种子数据
if [ ! -f "$DB_PATH" ]; then
  echo "🌱 首次启动，正在初始化数据库..."
  node seed.js
fi

exec "$@"
