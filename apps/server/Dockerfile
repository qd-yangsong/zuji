# ---- 构建阶段 ----
# 构建上下文需为 monorepo 根目录
FROM node:18-slim AS builder

# 安装 OpenSSL（Prisma 运行需要）
RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm install -g pnpm

# 复制 workspace 配置和 shared-types
COPY pnpm-workspace.yaml ./
COPY packages/shared-types ./packages/shared-types

# 复制 server 项目
COPY apps/server/package.json apps/server/pnpm-lock.yaml* ./apps/server/
COPY apps/server/prisma ./apps/server/prisma

# 安装依赖
RUN cd apps/server && pnpm install --frozen-lockfile || pnpm install

# 生成 Prisma Client
RUN cd apps/server && npx prisma generate

# 复制源码并构建
COPY apps/server/tsconfig.json apps/server/nest-cli.json ./apps/server/
COPY apps/server/src ./apps/server/src

RUN cd apps/server && pnpm run build

# ---- 运行阶段 ----
FROM node:18-slim AS runner

# 安装 OpenSSL（Prisma 运行需要）
RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml ./
COPY packages/shared-types ./packages/shared-types
COPY apps/server/package.json apps/server/pnpm-lock.yaml* ./apps/server/
COPY apps/server/prisma ./apps/server/prisma

# 安装全部依赖（含 prisma CLI），然后裁剪
RUN cd apps/server && pnpm install --frozen-lockfile || pnpm install
RUN cd apps/server && npx prisma generate

# 复制构建产物
COPY --from=builder /app/apps/server/dist ./apps/server/dist

WORKDIR /app/apps/server

EXPOSE 3000

# 启动前自动执行迁移，然后启动服务
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
