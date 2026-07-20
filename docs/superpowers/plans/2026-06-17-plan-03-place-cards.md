# Plan 3：地点收藏与卡片墙 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现地点收藏功能（Place 模型 + 地图选点 + 自定义命名 + 三层标签关联）和卡片墙首页（多维度排序 + 分类筛选 + 卡片/地图视图切换），这是用户日常使用的核心入口。

**Architecture:** Place 模型关联 User + 属性标签 + 场景标签（多对多通过中间表）。首页卡片墙为瀑布流双列布局，支持「最近添加 / 按年 / 按日期 / 打卡次数」排序和标签筛选。地图选点页使用 Taro map 组件 + 微信定位 API。地图渲染数据源拆分为 baseMarkers（收藏点）和临时 markers，避免覆盖。

**Tech Stack:** Prisma + PostgreSQL + NestJS + Taro map 组件 + React + Zustand

---

## File Structure

| 文件 | 责任 |
|---|---|
| `apps/server/prisma/schema.prisma` | 新增 Place + PlaceTag 中间表 |
| `apps/server/src/modules/place/dto/create-place.dto.ts` | 创建地点 DTO |
| `apps/server/src/modules/place/dto/query-place.dto.ts` | 查询地点 DTO |
| `apps/server/src/modules/place/place.service.ts` | 地点 CRUD + 查询逻辑 |
| `apps/server/src/modules/place/place.controller.ts` | 地点 API |
| `apps/server/src/modules/place/place.module.ts` | 地点模块 |
| `apps/miniapp/src/services/place.ts` | 前端地点 API 服务 |
| `apps/miniapp/src/pages/cards/index.tsx` | 卡片墙首页 |
| `apps/miniapp/src/pages/cards/index.scss` | 卡片墙样式 |
| `apps/miniapp/src/pages/place-create/index.tsx` | 地图选点 + 创建地点页 |
| `apps/miniapp/src/pages/place-create/index.scss` | 创建页样式 |
| `apps/miniapp/src/pages/place-detail/index.tsx` | 地点详情页（基础版） |
| `apps/miniapp/src/pages/place-detail/index.scss` | 详情页样式 |
| `packages/shared-types/src/index.ts` | 新增 PlaceDto 等类型 |
| `apps/miniapp/src/app.config.ts` | 注册新页面路由 |

---

## Task 1：Place 数据模型 + 迁移

**Files:**
- Modify: `apps/server/prisma/schema.prisma`

- [ ] **Step 1：在 schema.prisma 追加 Place 和 PlaceTag 模型**

在 Tag 模型之后追加：

```prisma
// 地点 —— 用户收藏的地点，关联属性标签和场景标签
model Place {
  id              String   @id @default(cuid())
  userId          String   // 所属用户
  realName        String   // 地点真实名称（如"海底捞火锅（南门店）"）
  customName      String   // 用户自定义昵称（如"我家楼下深夜小馆"）
  latitude        Float    // 纬度
  longitude       Float    // 经度
  address         String?  // 详细地址
  coverImage      String?  // 封面图 URL
  checkinCount    Int      @default(0) // 打卡次数（计算字段，由 CheckIn 触发更新）
  collectedAt     DateTime @default(now()) // 收藏时间
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  tags            PlaceTag[]

  @@index([userId])
  @@index([userId, collectedAt])
  @@map("places")
}

// 地点-标签中间表（多对多）
model PlaceTag {
  id        String   @id @default(cuid())
  placeId   String
  tagId     String
  place     Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([placeId, tagId])
  @@index([tagId])
  @@map("place_tags")
}
```

同时在 Tag 模型中追加反向关联（在 `@@map("tags")` 之前加一行）：

```prisma
  placeTags  PlaceTag[]
```

- [ ] **Step 2：执行迁移**

```bash
cd apps/server
pnpm prisma migrate dev --name add_place_model
```

- [ ] **Step 3：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server/prisma
git commit -m "feat(server): add Place and PlaceTag models with migration"
```

---

## Task 2：共享类型更新

**Files:**
- Modify: `packages/shared-types/src/index.ts`

- [ ] **Step 1：追加 Place 类型**

```ts
// 地点信息
export interface PlaceDto {
  id: string;
  userId: string;
  realName: string;
  customName: string;
  latitude: number;
  longitude: number;
  address: string | null;
  coverImage: string | null;
  checkinCount: number;
  collectedAt: string;
  createdAt: string;
  updatedAt: string;
  tags: TagDto[];
}

// 创建地点请求
export interface CreatePlaceDto {
  realName: string;
  customName: string;
  latitude: number;
  longitude: number;
  address?: string;
  coverImage?: string;
  attributeTagIds: string[];
  sceneTagIds: string[];
}

// 查询地点请求
export interface QueryPlaceDto {
  sort?: 'recent' | 'year' | 'date' | 'checkin';
  tagId?: string;
  page?: number;
  pageSize?: number;
}
```

- [ ] **Step 2：提交**

```bash
git add packages/shared-types/src/index.ts
git commit -m "feat(shared-types): add Place dto types"
```

---

## Task 3：后端 Place 模块（CRUD + 查询 API）

**Files:**
- Create: `apps/server/src/modules/place/dto/create-place.dto.ts`
- Create: `apps/server/src/modules/place/dto/query-place.dto.ts`
- Create: `apps/server/src/modules/place/place.service.ts`
- Create: `apps/server/src/modules/place/place.controller.ts`
- Create: `apps/server/src/modules/place/place.module.ts`

- [ ] **Step 1：写 create-place.dto.ts**

```ts
import { IsString, IsNumber, IsOptional, IsArray, MinLength, MaxLength } from 'class-validator';

export class CreatePlaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  realName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  customName!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsArray()
  @IsString({ each: true })
  attributeTagIds!: string[];

  @IsArray()
  @IsString({ each: true })
  sceneTagIds!: string[];
}
```

- [ ] **Step 2：写 query-place.dto.ts**

```ts
import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPlaceDto {
  @IsOptional()
  @IsString()
  @IsIn(['recent', 'year', 'date', 'checkin'])
  sort?: string;

  @IsOptional()
  @IsString()
  tagId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
```

- [ ] **Step 3：写 place.service.ts**

```ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TagService } from '../tag/tag.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';

@Injectable()
export class PlaceService {
  constructor(
    private prisma: PrismaService,
    private tagService: TagService,
  ) {}

  // 创建地点
  async create(dto: CreatePlaceDto, userId: string) {
    const allTagIds = [...dto.attributeTagIds, ...dto.sceneTagIds];
    const place = await this.prisma.place.create({
      data: {
        userId,
        realName: dto.realName,
        customName: dto.customName,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        coverImage: dto.coverImage,
        tags: {
          create: allTagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });
    // 增加标签使用次数
    await this.tagService.incrementUsage(allTagIds);
    return this.toDto(place);
  }

  // 查询当前用户的地点列表
  async findAll(userId: string, query: QueryPlaceDto) {
    const sort = query.sort || 'recent';
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const orderBy: Record<string, string> = {
      recent: 'createdAt',
      date: 'collectedAt',
      checkin: 'checkinCount',
    } as const;

    const places = await this.prisma.place.findMany({
      where: {
        userId,
        ...(query.tagId ? { tags: { some: { tagId: query.tagId } } } : {}),
      },
      orderBy: sort === 'year'
        ? [{ collectedAt: 'desc' }]
        : [{ [orderBy[sort] || 'createdAt']: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { tags: { include: { tag: true } } },
    });

    const total = await this.prisma.place.count({
      where: {
        userId,
        ...(query.tagId ? { tags: { some: { tagId: query.tagId } } } : {}),
      },
    });

    return {
      list: places.map((p) => this.toDto(p)),
      total,
      page,
      pageSize,
    };
  }

  // 获取单个地点详情
  async findOne(placeId: string, userId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      include: { tags: { include: { tag: true } } },
    });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权访问他人地点');
    return this.toDto(place);
  }

  // 更新地点
  async update(placeId: string, dto: Partial<CreatePlaceDto>, userId: string) {
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权修改他人地点');

    const { attributeTagIds, sceneTagIds, ...placeData } = dto;
    const allTagIds = [...(attributeTagIds || []), ...(sceneTagIds || [])];

    // 更新地点基本信息
    await this.prisma.place.update({
      where: { id: placeId },
      data: placeData,
    });

    // 如果传了标签，重建关联
    if (allTagIds.length > 0) {
      await this.prisma.placeTag.deleteMany({ where: { placeId } });
      await this.prisma.placeTag.createMany({
        data: allTagIds.map((tagId) => ({ placeId, tagId })),
      });
    }

    return this.findOne(placeId, userId);
  }

  // 删除地点
  async remove(placeId: string, userId: string) {
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('地点不存在');
    if (place.userId !== userId) throw new ForbiddenException('无权删除他人地点');
    await this.prisma.place.delete({ where: { id: placeId } });
    return { ok: true };
  }

  // 转换为 DTO（扁平化标签）
  private toDto(place: any) {
    return {
      ...place,
      tags: place.tags?.map((pt: any) => pt.tag) || [],
    };
  }
}
```

- [ ] **Step 4：写 place.controller.ts**

```ts
import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { QueryPlaceDto } from './dto/query-place.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get()
  findAll(
    @Query() query: QueryPlaceDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.findOne(id, user.id);
  }

  @Post()
  create(
    @Body() dto: CreatePlaceDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePlaceDto>,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.placeService.remove(id, user.id);
  }
}
```

- [ ] **Step 5：写 place.module.ts**

```ts
import { Module } from '@nestjs/common';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [TagModule],
  controllers: [PlaceController],
  providers: [PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {}
```

- [ ] **Step 6：在 AppModule 注册**

```ts
import { PlaceModule } from './modules/place/place.module';
// imports: [..., PlaceModule]
```

- [ ] **Step 7：验证 API**

启动后端，用 JWT token 测试：
- `GET /api/places` → 返回空列表
- `POST /api/places` 创建一个地点 → 返回地点对象
- `GET /api/places` → 返回刚创建的地点

- [ ] **Step 8：提交**

```bash
git add apps/server/src packages/shared-types/src/index.ts
git commit -m "feat(server): place CRUD api with tag association"
```

---

## Task 4：前端地点 API 服务

**Files:**
- Create: `apps/miniapp/src/services/place.ts`

- [ ] **Step 1：写 place.ts**

```ts
import { request } from './request';
import type { PlaceDto, CreatePlaceDto, QueryPlaceDto } from '@zuji/shared-types';

// 查询地点列表
export async function fetchPlaces(query?: QueryPlaceDto): Promise<{
  list: PlaceDto[];
  total: number;
  page: number;
  pageSize: number;
}> {
  return request({ url: '/places', method: 'GET', data: query });
}

// 获取地点详情
export async function fetchPlaceDetail(placeId: string): Promise<PlaceDto> {
  return request({ url: `/places/${placeId}`, method: 'GET' });
}

// 创建地点
export async function createPlace(dto: CreatePlaceDto): Promise<PlaceDto> {
  return request({ url: '/places', method: 'POST', data: dto });
}

// 更新地点
export async function updatePlace(placeId: string, dto: Partial<CreatePlaceDto>): Promise<PlaceDto> {
  return request({ url: `/places/${placeId}`, method: 'PATCH', data: dto });
}

// 删除地点
export async function deletePlace(placeId: string): Promise<void> {
  await request({ url: `/places/${placeId}`, method: 'DELETE' });
}
```

- [ ] **Step 2：提交**

```bash
git add apps/miniapp/src/services/place.ts
git commit -m "feat(miniapp): place api service layer"
```

---

## Task 5：地图选点 + 创建地点页

**Files:**
- Create: `apps/miniapp/src/pages/place-create/index.tsx`
- Create: `apps/miniapp/src/pages/place-create/index.scss`
- Modify: `apps/miniapp/src/app.config.ts`（注册路由）

- [ ] **Step 1：写 place-create 页面**

页面功能：
1. 地图组件显示当前位置 + 可拖动选点
2. 微信定位获取当前坐标
3. 表单：真实名称、自定义昵称、地址
4. 封面图上传（复用 uploadImage）
5. 属性标签选择器 + 场景标签选择器
6. 提交创建

- [ ] **Step 2：注册路由**

在 `app.config.ts` 的 pages 数组添加：
```ts
'pages/place-create/index'
```

- [ ] **Step 3：验证构建**

- [ ] **Step 4：提交**

```bash
git add apps/miniapp/src
git commit -m "feat(miniapp): place create page with map picker and tag selector"
```

---

## Task 6：卡片墙首页

**Files:**
- Create: `apps/miniapp/src/pages/cards/index.tsx`
- Create: `apps/miniapp/src/pages/cards/index.scss`
- Modify: `apps/miniapp/src/app.config.ts`（注册路由 + 设为首页）

- [ ] **Step 1：写卡片墙页面**

页面功能：
1. 顶部搜索框（P1 阶段，MVP 先占位）
2. 排序切换：最近添加 / 按年 / 按日期 / 打卡次数
3. 双列瀑布流卡片
4. 每张卡片：封面图 + 自定义昵称 + 真实名 + 打卡次数 + 标签摘要
5. 点击卡片 → 跳转地点详情
6. 底部浮动「+」按钮 → 跳转创建地点页
7. 空状态引导插画

- [ ] **Step 2：设为首页**

在 `app.config.ts` 中把 `pages/cards/index` 放到 pages 数组第一位。

- [ ] **Step 3：验证构建**

- [ ] **Step 4：提交**

```bash
git add apps/miniapp/src
git commit -m "feat(miniapp): cards wall home page with sorting and waterfall layout"
```

---

## Task 7：地点详情页（基础版）

**Files:**
- Create: `apps/miniapp/src/pages/place-detail/index.tsx`
- Create: `apps/miniapp/src/pages/place-detail/index.scss`
- Modify: `apps/miniapp/src/app.config.ts`

- [ ] **Step 1：写地点详情页**

页面结构：
1. 封面图
2. 自定义昵称（大字）+ 真实名 + 地址（灰色小字）
3. 属性标签 + 场景标签展示
4. 打卡次数 + 收藏时间
5. 底部小地图缩略（点击展开全屏）
6. 「打卡」按钮（Plan 4 实现，此处先占位）
7. 「分享」按钮（Plan 6 实现，此处先占位）

- [ ] **Step 2：注册路由**

- [ ] **Step 3：验证构建**

- [ ] **Step 4：提交**

```bash
git add apps/miniapp/src
git commit -m "feat(miniapp): place detail page with cover and tags display"
```

---

## Self-Review

- ✅ Place 数据模型 + PlaceTag 中间表 → Task 1
- ✅ Place CRUD API → Task 3
- ✅ 共享类型 → Task 2
- ✅ 前端地点服务 → Task 4
- ✅ 地图选点创建页 → Task 5
- ✅ 卡片墙首页 → Task 6
- ✅ 地点详情页 → Task 7
- ⚠️ 历史教训：map 组件 markers 数据源拆分在 Task 5 实现（baseMarkers vs 临时选点 marker）
- ⚠️ 搜索功能（名称/昵称/标签/日记内容）为 P1，MVP 不做
- ⚠️ 打卡按钮和分享按钮为占位，分别在 Plan 4 和 Plan 6 实现
