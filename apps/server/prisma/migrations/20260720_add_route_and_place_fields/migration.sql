-- Phase 1 迁移：路线系统 + 收藏即记录 + 贴纸
-- 执行方式：在服务器上运行 psql -d zuji -f migration.sql

BEGIN;

-- 1. 扩展 users 表
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "signature" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stickerUnlocks" TEXT[] DEFAULT '{}';

-- 2. 扩展 places 表
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "firstImpression" TEXT;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "firstImages" TEXT[] DEFAULT '{}';
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "rating" INTEGER;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "wantToRevisit" BOOLEAN DEFAULT false;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "stickerIds" TEXT[] DEFAULT '{}';

-- 添加外键约束（如果不存在）
ALTER TABLE "places" ADD CONSTRAINT "places_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- 3. 扩展 checkins 表
ALTER TABLE "checkins" ADD COLUMN IF NOT EXISTS "stickerIds" TEXT[] DEFAULT '{}';

-- 4. 创建 routes 表
CREATE TABLE IF NOT EXISTS "routes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "type" TEXT NOT NULL DEFAULT 'collection',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "routes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "routes_userId_idx" ON "routes"("userId");
CREATE INDEX IF NOT EXISTS "routes_userId_type_idx" ON "routes"("userId", "type");

-- 5. 创建 route_places 中间表
CREATE TABLE IF NOT EXISTS "route_places" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "dayLabel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_places_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "route_places_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE,
    CONSTRAINT "route_places_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE,
    CONSTRAINT "route_places_routeId_placeId_key" UNIQUE ("routeId", "placeId")
);

CREATE INDEX IF NOT EXISTS "route_places_placeId_idx" ON "route_places"("placeId");

COMMIT;
