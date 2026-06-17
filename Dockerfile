# 产品经理充电站 MVP - Docker 镜像
# 单容器部署：构建前端 + 运行后端

FROM node:18-alpine AS client-builder

WORKDIR /app/client
COPY client/package.json ./
RUN npm install

COPY client/ ./
RUN npm run build

FROM node:18-alpine

WORKDIR /app/server

# 安装后端依赖
COPY server/package.json ./
RUN npm install --omit=dev

# 复制后端代码
COPY server/ ./

# 复制前端构建产物到 server/client-dist
COPY --from=client-builder /app/client/dist ./client-dist

# 数据持久化目录
RUN mkdir -p /data

# 入口脚本
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENV STATIC_DIR=/app/server/client-dist
ENV DB_PATH=/data/pm_charge.db

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "index.js"]
