FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/
COPY apps/server/tsconfig.json apps/server/tsconfig.build.json apps/server/nest-cli.json apps/server/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-types/tsconfig.json packages/shared-types/

RUN pnpm install --frozen-lockfile

COPY apps/server apps/server/
COPY packages/shared-types packages/shared-types/

RUN pnpm --filter server build

# 生成 Prisma Client
RUN cd apps/server && npx prisma generate

FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

WORKDIR /app
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma
COPY --from=builder /app/packages/shared-types ./packages/shared-types

EXPOSE 3000
CMD ["node", "apps/server/dist/main.js"]