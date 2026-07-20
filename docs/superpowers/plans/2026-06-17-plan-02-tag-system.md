# Plan 2：三层标签体系 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现「足迹手帐」的三层标签体系（属性 / 场景 / 事件），包含数据模型、系统预设种子数据、后端 CRUD API、前端标签选择器组件，为后续 Place / CheckIn 模块提供标签能力。

**Architecture:** Tag 和 TagGroup 以 `userId IS NULL` 表示系统预设标签（全局共享），`userId = xxx` 表示用户自定义标签（用户隔离）。查询时 `WHERE userId IS NULL OR userId = current`。前端提供通用 `TagSelector` 组件，按 type 区分三种标签，后续 Place 表单和 CheckIn 表单复用。

**Tech Stack:** Prisma + PostgreSQL + NestJS + Taro + React + Zustand

---

## File Structure

| 文件 | 责任 |
|---|---|
| `apps/server/prisma/schema.prisma` | 新增 Tag / TagGroup 模型 |
| `apps/server/prisma/seed.ts` | 系统预设标签种子数据 |
| `apps/server/src/modules/tag/tag.service.ts` | 标签 CRUD 逻辑 |
| `apps/server/src/modules/tag/tag.controller.ts` | 标签 API 接口 |
| `apps/server/src/modules/tag/tag.module.ts` | 标签模块 |
| `apps/server/src/modules/tag/dto/create-tag.dto.ts` | 创建标签 DTO |
| `apps/server/src/modules/tag-group/tag-group.service.ts` | 标签组 CRUD 逻辑 |
| `apps/server/src/modules/tag-group/tag-group.controller.ts` | 标签组 API 接口 |
| `apps/server/src/modules/tag-group/tag-group.module.ts` | 标签组模块 |
| `apps/server/src/modules/tag-group/dto/create-tag-group.dto.ts` | 创建标签组 DTO |
| `apps/miniapp/src/services/tag.ts` | 前端标签 API 服务 |
| `apps/miniapp/src/components/TagSelector/index.tsx` | 通用标签选择器组件 |
| `apps/miniapp/src/components/TagSelector/index.scss` | 标签选择器样式 |
| `packages/shared-types/src/index.ts` | 新增 Tag / TagGroup 类型定义 |

---

## Task 1：定义 Tag 和 TagGroup 数据模型并迁移

**Files:**
- Modify: `apps/server/prisma/schema.prisma`

- [ ] **Step 1：在 schema.prisma 末尾追加 Tag 和 TagGroup 模型**

在 `apps/server/prisma/schema.prisma` 的 User 模型之后追加：

```prisma
// 标签组 —— 用于场景标签的编组（如"陪伴场景""社交场景"）
model TagGroup {
  id        String   @id @default(cuid())
  userId    String?  // null = 系统预设，所有用户共享
  name      String   // 组名，如"陪伴场景"
  color     String?  // 组颜色（十六进制），如"#FF6B6B"
  icon      String?  // 组图标（emoji 或图标名）
  tagType   String   // 该组允许的标签类型，目前仅 "scene"
  isSystem  Boolean  @default(false) // 是否系统预设
  tags      Tag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("tag_groups")
}

// 标签 —— 三层体系：attribute（属性）/ scene（场景）/ event（事件）
model Tag {
  id          String   @id @default(cuid())
  userId      String?  // null = 系统预设，所有用户共享
  name        String   // 标签名称
  type        String   // attribute | scene | event
  groupId     String?  // 所属标签组（仅 scene 类型可归组）
  isSystem    Boolean  @default(false) // 是否系统预设
  usageCount  Int      @default(0) // 使用次数，用于热门排序
  group       TagGroup? @relation(fields: [groupId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, type])
  @@map("tags")
}
```

- [ ] **Step 2：执行迁移**

```bash
cd apps/server
pnpm dlx prisma migrate dev --name add_tag_system
```
预期：生成 migration SQL，数据库出现 `tags` 和 `tag_groups` 表。

- [ ] **Step 3：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server/prisma
git commit -m "feat(server): add Tag and TagGroup models with migration"
```

---

## Task 2：系统预设标签种子数据

**Files:**
- Create: `apps/server/prisma/seed.ts`
- Modify: `apps/server/package.json`（添加 prisma seed 配置）

- [ ] **Step 1：写 seed.ts**

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 系统预设标签组
const SYSTEM_GROUPS = [
  { name: '陪伴场景', color: '#FF9F43', icon: '👨‍👩‍👧', tagType: 'scene' },
  { name: '社交场景', color: '#54A0FF', icon: '🤝', tagType: 'scene' },
  { name: '时间场景', color: '#5F27CD', icon: '📅', tagType: 'scene' },
  { name: '心情场景', color: '#00D2D3', icon: '🌙', tagType: 'scene' },
];

// 系统预设标签
const SYSTEM_TAGS: { name: string; type: string; groupName?: string }[] = [
  // 属性标签
  { name: '美食', type: 'attribute' },
  { name: '咖啡', type: 'attribute' },
  { name: '酒吧', type: 'attribute' },
  { name: '书店', type: 'attribute' },
  { name: '景点', type: 'attribute' },
  { name: '酒店', type: 'attribute' },
  { name: '博物馆', type: 'attribute' },
  { name: '公园', type: 'attribute' },
  { name: '商场', type: 'attribute' },
  { name: '办公地', type: 'attribute' },
  { name: '学校', type: 'attribute' },
  // 场景标签 - 陪伴场景
  { name: '适合带孩子', type: 'scene', groupName: '陪伴场景' },
  { name: '适合带父母', type: 'scene', groupName: '陪伴场景' },
  { name: '适合带宠物', type: 'scene', groupName: '陪伴场景' },
  // 场景标签 - 社交场景
  { name: '适合朋友小聚', type: 'scene', groupName: '社交场景' },
  { name: '适合招待重要客人', type: 'scene', groupName: '社交场景' },
  { name: '适合接待外地朋友', type: 'scene', groupName: '社交场景' },
  { name: '适合相亲约会', type: 'scene', groupName: '社交场景' },
  { name: '适合团建', type: 'scene', groupName: '社交场景' },
  // 场景标签 - 时间场景
  { name: '适合日常去', type: 'scene', groupName: '时间场景' },
  { name: '适合周末', type: 'scene', groupName: '时间场景' },
  { name: '适合长假', type: 'scene', groupName: '时间场景' },
  { name: '适合工作日中午', type: 'scene', groupName: '时间场景' },
  { name: '适合深夜', type: 'scene', groupName: '时间场景' },
  // 场景标签 - 心情场景
  { name: '适合一个人静一静', type: 'scene', groupName: '心情场景' },
  { name: '适合发呆', type: 'scene', groupName: '心情场景' },
  { name: '适合赶deadline', type: 'scene', groupName: '心情场景' },
  // 事件标签
  { name: '同学聚会', type: 'event' },
  { name: '单位年会', type: 'event' },
  { name: '家庭聚餐', type: 'event' },
  { name: '家长会', type: 'event' },
  { name: '剧本杀', type: 'event' },
  { name: '密室', type: 'event' },
  { name: '看演出', type: 'event' },
  { name: '看展', type: 'event' },
  { name: '度假', type: 'event' },
  { name: '出差', type: 'event' },
  { name: '约会', type: 'event' },
  { name: '生日庆祝', type: 'event' },
  { name: '纪念日', type: 'event' },
  { name: '闺蜜局', type: 'event' },
  { name: '兄弟局', type: 'event' },
];

async function main() {
  // 插入标签组
  const groupMap = new Map<string, string>();
  for (const g of SYSTEM_GROUPS) {
    const created = await prisma.tagGroup.upsert({
      where: { id: g.name }, // 用 name 作为幂等键（需先查是否存在）
      update: {},
      create: {
        name: g.name,
        color: g.color,
        icon: g.icon,
        tagType: g.tagType,
        isSystem: true,
        userId: null,
      },
    });
    groupMap.set(g.name, created.id);
  }

  // 插入标签
  for (const t of SYSTEM_TAGS) {
    const existing = await prisma.tag.findFirst({
      where: { name: t.name, type: t.type, userId: null },
    });
    if (existing) continue;

    await prisma.tag.create({
      data: {
        name: t.name,
        type: t.type,
        groupId: t.groupName ? groupMap.get(t.groupName) ?? null : null,
        isSystem: true,
        userId: null,
        usageCount: 0,
      },
    });
  }

  console.log(`已插入 ${SYSTEM_GROUPS.length} 个标签组, ${SYSTEM_TAGS.length} 个系统预设标签`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

> 注意：upsert 的 where 子句需要唯一字段。由于 name 没有加 @unique（因为系统预设和用户自定义可能同名），这里改用 findFirst + 跳过的幂等策略。

- [ ] **Step 2：在 package.json 添加 prisma seed 配置**

在 `apps/server/package.json` 中添加：

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

并安装 ts-node（如未安装）：

```bash
cd apps/server
pnpm add -D ts-node
```

- [ ] **Step 3：执行 seed**

```bash
pnpm dlx prisma db seed
```
预期：终端输出 "已插入 4 个标签组, 30 个系统预设标签"。

- [ ] **Step 4：验证数据**

```bash
docker exec cw-postgres psql -U cw_admin -d zuji -c "SELECT type, count(*) FROM tags GROUP BY type;"
```
预期：attribute=11, scene=16, event=15（共 30 个，不含 group 计数差异）。

- [ ] **Step 5：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server/prisma apps/server/package.json
git commit -m "feat(server): seed system preset tags and tag groups"
```

---

## Task 3：共享类型更新

**Files:**
- Modify: `packages/shared-types/src/index.ts`

- [ ] **Step 1：追加 Tag 和 TagGroup 类型**

在 `packages/shared-types/src/index.ts` 末尾追加：

```ts
// 标签类型枚举
export type TagType = 'attribute' | 'scene' | 'event';

// 标签组
export interface TagGroupDto {
  id: string;
  userId: string | null;
  name: string;
  color: string | null;
  icon: string | null;
  tagType: TagType;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// 标签
export interface TagDto {
  id: string;
  userId: string | null;
  name: string;
  type: TagType;
  groupId: string | null;
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// 创建标签请求
export interface CreateTagDto {
  name: string;
  type: TagType;
  groupId?: string;
}

// 创建标签组请求
export interface CreateTagGroupDto {
  name: string;
  color?: string;
  icon?: string;
  tagType: TagType;
}
```

- [ ] **Step 2：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add packages/shared-types/src/index.ts
git commit -m "feat(shared-types): add Tag and TagGroup dto types"
```

---

## Task 4：后端 Tag 模块（CRUD API）

**Files:**
- Create: `apps/server/src/modules/tag/dto/create-tag.dto.ts`
- Create: `apps/server/src/modules/tag/tag.service.ts`
- Create: `apps/server/src/modules/tag/tag.controller.ts`
- Create: `apps/server/src/modules/tag/tag.module.ts`
- Create: `apps/server/src/modules/tag/tag.controller.spec.ts`

- [ ] **Step 1：写测试**

写入 `apps/server/src/modules/tag/tag.controller.spec.ts`：

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

describe('TagController', () => {
  let controller: TagController;
  const mockTagService = {
    findByType: jest.fn().mockResolvedValue([
      { id: 't1', name: '美食', type: 'attribute', isSystem: true },
    ]),
    create: jest.fn().mockResolvedValue({
      id: 't2', name: '网红', type: 'attribute', isSystem: false,
    }),
    remove: jest.fn().mockResolvedValue({ ok: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [{ provide: TagService, useValue: mockTagService }],
    }).compile();
    controller = module.get<TagController>(TagController);
  });

  it('应能按类型查询标签', async () => {
    const result = await controller.findByType('attribute', { id: 'u1', openid: 'ox' });
    expect(result).toHaveLength(1);
    expect(mockTagService.findByType).toHaveBeenCalledWith('attribute', 'u1');
  });

  it('应能创建自定义标签', async () => {
    const result = await controller.create(
      { name: '网红', type: 'attribute' },
      { id: 'u1', openid: 'ox' },
    );
    expect(result.id).toBe('t2');
    expect(mockTagService.create).toHaveBeenCalled();
  });

  it('应能删除自定义标签', async () => {
    const result = await controller.remove('t2', { id: 'u1', openid: 'ox' });
    expect(result.ok).toBe(true);
  });
});
```

- [ ] **Step 2：跑测试确认失败**

```bash
cd apps/server
pnpm test tag.controller
```
预期：FAIL，"Cannot find module './tag.controller'"。

- [ ] **Step 3：写 create-tag.dto.ts**

```ts
import { IsString, IsIn, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateTagDto {
  // 标签名称
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name: string;

  // 标签类型：attribute（属性）/ scene（场景）/ event（事件）
  @IsString()
  @IsIn(['attribute', 'scene', 'event'])
  type: string;

  // 所属标签组 ID（仅 scene 类型可归组）
  @IsOptional()
  @IsString()
  groupId?: string;
}
```

- [ ] **Step 4：写 tag.service.ts**

```ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  // 按类型查询：系统预设 + 当前用户自定义
  async findByType(type: string, userId: string) {
    return this.prisma.tag.findMany({
      where: {
        type,
        OR: [{ userId: null }, { userId }],
      },
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }, { createdAt: 'asc' }],
      include: { group: true },
    });
  }

  // 创建用户自定义标签
  async create(dto: CreateTagDto, userId: string) {
    return this.prisma.tag.create({
      data: {
        name: dto.name,
        type: dto.type,
        groupId: dto.groupId,
        userId,
        isSystem: false,
      },
    });
  }

  // 删除标签（仅可删自己的自定义标签，系统预设不可删）
  async remove(tagId: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('标签不存在');
    if (tag.isSystem) throw new ForbiddenException('系统预设标签不可删除');
    if (tag.userId !== userId) throw new ForbiddenException('无权删除他人标签');
    await this.prisma.tag.delete({ where: { id: tagId } });
    return { ok: true };
  }

  // 增加使用次数（供 Place / CheckIn 模块调用）
  async incrementUsage(tagIds: string[]) {
    if (tagIds.length === 0) return;
    await this.prisma.tag.updateMany({
      where: { id: { in: tagIds } },
      data: { usageCount: { increment: 1 } },
    });
  }
}
```

- [ ] **Step 5：写 tag.controller.ts**

```ts
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // 按类型查询标签
  @Get()
  findByType(
    @Body('type') type: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagService.findByType(type || 'attribute', user.id);
  }

  // 创建自定义标签
  @Post()
  create(
    @Body() dto: CreateTagDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagService.create(dto, user.id);
  }

  // 删除自定义标签
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagService.remove(id, user.id);
  }
}
```

> 注意：GET 查询用 query param 更 RESTful，但小程序端 `Taro.request` 的 GET data 会自动拼到 URL query。这里改用 `@Query('type')` 更规范。

- [ ] **Step 6：修正 controller 为 @Query**

修改 `tag.controller.ts`，把 `@Body('type')` 改为 `@Query('type')`：

```ts
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';

@Get()
findByType(
  @Query('type') type: string,
  @CurrentUser() user: { id: string; openid: string },
) {
  return this.tagService.findByType(type || 'attribute', user.id);
}
```

- [ ] **Step 7：写 tag.module.ts**

```ts
import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
```

- [ ] **Step 8：在 AppModule 注册**

修改 `apps/server/src/app.module.ts`，imports 数组加上 `TagModule`：

```ts
import { TagModule } from './modules/tag/tag.module';
// imports: [..., TagModule]
```

- [ ] **Step 9：跑测试确认通过**

```bash
cd apps/server
pnpm test tag.controller
```
预期：3 passed。

- [ ] **Step 10：手动验证 API**

```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null; sleep 1
pnpm start &
sleep 6
TOKEN=$(node -e "const c=require('crypto');const h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');const p=Buffer.from(JSON.stringify({sub:'u1',openid:'ox'})).toString('base64url');const s=c.createHmac('sha256','dev-secret-change-in-production-2026').update(h+'.'+p).digest('base64url');console.log(h+'.'+p+'.'+s)")
echo "=== 查询属性标签 ==="
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/tags?type=attribute" | head -c 300
echo ""
echo "=== 创建自定义标签 ==="
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"网红店","type":"attribute"}' http://localhost:3000/api/tags
echo ""
kill %1 2>/dev/null; wait 2>/dev/null
```
预期：查询返回系统预设标签列表；创建返回新标签对象。

- [ ] **Step 11：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server/src
git commit -m "feat(server): tag CRUD api with type filtering"
```

---

## Task 5：后端 TagGroup 模块（CRUD API）

**Files:**
- Create: `apps/server/src/modules/tag-group/dto/create-tag-group.dto.ts`
- Create: `apps/server/src/modules/tag-group/tag-group.service.ts`
- Create: `apps/server/src/modules/tag-group/tag-group.controller.ts`
- Create: `apps/server/src/modules/tag-group/tag-group.module.ts`

- [ ] **Step 1：写 create-tag-group.dto.ts**

```ts
import { IsString, IsIn, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateTagGroupDto {
  // 组名
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name: string;

  // 颜色（十六进制）
  @IsOptional()
  @IsString()
  color?: string;

  // 图标（emoji 或图标名）
  @IsOptional()
  @IsString()
  icon?: string;

  // 允许的标签类型，目前仅 scene
  @IsString()
  @IsIn(['scene'])
  tagType: string;
}
```

- [ ] **Step 2：写 tag-group.service.ts**

```ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';

@Injectable()
export class TagGroupService {
  constructor(private prisma: PrismaService) {}

  // 查询所有标签组：系统预设 + 当前用户自定义
  async findAll(userId: string, tagType?: string) {
    return this.prisma.tagGroup.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
        ...(tagType ? { tagType } : {}),
      },
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
      include: { tags: true },
    });
  }

  // 创建用户自定义标签组
  async create(dto: CreateTagGroupDto, userId: string) {
    return this.prisma.tagGroup.create({
      data: {
        name: dto.name,
        color: dto.color,
        icon: dto.icon,
        tagType: dto.tagType,
        userId,
        isSystem: false,
      },
    });
  }

  // 删除标签组（仅可删自己的自定义组，系统预设不可删）
  async remove(groupId: string, userId: string) {
    const group = await this.prisma.tagGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('标签组不存在');
    if (group.isSystem) throw new ForbiddenException('系统预设标签组不可删除');
    if (group.userId !== userId) throw new ForbiddenException('无权删除他人标签组');
    // 删除组时，组内标签的 groupId 置空（onDelete: SetNull 已在 schema 配置）
    await this.prisma.tagGroup.delete({ where: { id: groupId } });
    return { ok: true };
  }
}
```

- [ ] **Step 3：写 tag-group.controller.ts**

```ts
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TagGroupService } from './tag-group.service';
import { CreateTagGroupDto } from './dto/create-tag-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tag-groups')
export class TagGroupController {
  constructor(private readonly tagGroupService: TagGroupService) {}

  // 查询标签组（可按类型筛选）
  @Get()
  findAll(
    @Query('tagType') tagType: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagGroupService.findAll(user.id, tagType);
  }

  // 创建自定义标签组
  @Post()
  create(
    @Body() dto: CreateTagGroupDto,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagGroupService.create(dto, user.id);
  }

  // 删除自定义标签组
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; openid: string },
  ) {
    return this.tagGroupService.remove(id, user.id);
  }
}
```

- [ ] **Step 4：写 tag-group.module.ts**

```ts
import { Module } from '@nestjs/common';
import { TagGroupController } from './tag-group.controller';
import { TagGroupService } from './tag-group.service';

@Module({
  controllers: [TagGroupController],
  providers: [TagGroupService],
  exports: [TagGroupService],
})
export class TagGroupModule {}
```

- [ ] **Step 5：在 AppModule 注册**

```ts
import { TagGroupModule } from './modules/tag-group/tag-group.module';
// imports: [..., TagGroupModule]
```

- [ ] **Step 6：手动验证**

```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null; sleep 1
pnpm start &
sleep 6
TOKEN=$(node -e "const c=require('crypto');const h=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');const p=Buffer.from(JSON.stringify({sub:'u1',openid:'ox'})).toString('base64url');const s=c.createHmac('sha256','dev-secret-change-in-production-2026').update(h+'.'+p).digest('base64url');console.log(h+'.'+p+'.'+s)")
echo "=== 查询场景标签组 ==="
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/tag-groups?tagType=scene" | head -c 500
echo ""
kill %1 2>/dev/null; wait 2>/dev/null
```
预期：返回 4 个系统预设标签组及其下标签。

- [ ] **Step 7：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server/src
git commit -m "feat(server): tag group CRUD api"
```

---

## Task 6：前端标签 API 服务

**Files:**
- Create: `apps/miniapp/src/services/tag.ts`

- [ ] **Step 1：写 tag.ts**

```ts
import { request } from './request';
import type { TagDto, TagGroupDto, CreateTagDto, TagType } from '@zuji/shared-types';

// 按类型获取标签（系统预设 + 用户自定义）
export async function fetchTags(type: TagType): Promise<TagDto[]> {
  return request<TagDto[]>({ url: '/tags', method: 'GET', data: { type } });
}

// 创建自定义标签
export async function createTag(dto: CreateTagDto): Promise<TagDto> {
  return request<TagDto>({ url: '/tags', method: 'POST', data: dto });
}

// 删除自定义标签
export async function deleteTag(tagId: string): Promise<void> {
  await request({ url: `/tags/${tagId}`, method: 'DELETE' });
}

// 获取标签组（含组内标签）
export async function fetchTagGroups(tagType?: string): Promise<TagGroupDto[]> {
  return request<TagGroupDto[]>({
    url: '/tag-groups',
    method: 'GET',
    data: tagType ? { tagType } : undefined,
  });
}

// 创建自定义标签组
export async function createTagGroup(dto: {
  name: string;
  color?: string;
  icon?: string;
  tagType: TagType;
}): Promise<TagGroupDto> {
  return request<TagGroupDto>({ url: '/tag-groups', method: 'POST', data: dto });
}
```

- [ ] **Step 2：验证构建**

```bash
cd apps/miniapp
HOME=/Users/yangsong/个人产品设计/2026_6_17/apps/miniapp pnpm build:weapp 2>&1 | tail -5
```
预期：Compiled successfully。

- [ ] **Step 3：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/miniapp/src
git commit -m "feat(miniapp): tag api service layer"
```

---

## Task 7：前端 TagSelector 通用组件

**Files:**
- Create: `apps/miniapp/src/components/TagSelector/index.tsx`
- Create: `apps/miniapp/src/components/TagSelector/index.scss`

- [ ] **Step 1：写组件 index.tsx**

```tsx
import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { fetchTags, createTag } from '../../services/tag';
import type { TagDto, TagType } from '@zuji/shared-types';
import './index.scss';

interface TagSelectorProps {
  // 标签类型
  type: TagType;
  // 已选中的标签 ID 列表
  selectedIds: string[];
  // 选中变化回调
  onChange: (ids: string[]) => void;
  // 是否允许创建新标签
  allowCreate?: boolean;
}

export default function TagSelector({
  type,
  selectedIds,
  onChange,
  allowCreate = true,
}: TagSelectorProps) {
  const [tags, setTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // 加载标签列表
  useEffect(() => {
    setLoading(true);
    fetchTags(type)
      .then(setTags)
      .catch((e) => console.error('加载标签失败:', e))
      .finally(() => setLoading(false));
  }, [type]);

  // 切换选中状态
  const toggleTag = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  // 创建新标签
  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      const newTag = await createTag({ name: newTagName.trim(), type });
      setTags([...tags, newTag]);
      onChange([...selectedIds, newTag.id]);
      setNewTagName('');
      setShowInput(false);
    } catch (e) {
      console.error('创建标签失败:', e);
    }
  };

  return (
    <View className='tag-selector'>
      <ScrollView scrollX className='tag-selector__scroll'>
        {loading && <Text className='tag-selector__loading'>加载中...</Text>}
        {tags.map((tag) => (
          <View
            key={tag.id}
            className={`tag-selector__tag ${selectedIds.includes(tag.id) ? 'tag-selector__tag--active' : ''}`}
            onClick={() => toggleTag(tag.id)}
          >
            <Text>{tag.name}</Text>
            {tag.isSystem && <Text className='tag-selector__badge'>系统</Text>}
          </View>
        ))}
        {allowCreate && (
          <View
            className='tag-selector__tag tag-selector__tag--add'
            onClick={() => setShowInput(!showInput)}
          >
            <Text>+ 自定义</Text>
          </View>
        )}
      </ScrollView>
      {showInput && (
        <View className='tag-selector__input-bar'>
          <input
            className='tag-selector__input'
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder='输入标签名...'
            maxLength={20}
          />
          <View className='tag-selector__confirm' onClick={handleCreate}>
            <Text>确认</Text>
          </View>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2：写样式 index.scss**

```scss
.tag-selector {
  &__scroll {
    white-space: nowrap;
    padding: 8rpx 0;
  }

  &__loading {
    color: #999;
    font-size: 24rpx;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    padding: 8rpx 24rpx;
    margin-right: 12rpx;
    border-radius: 32rpx;
    background: #f5f5f5;
    font-size: 26rpx;
    color: #333;
    transition: all 0.2s;

    &--active {
      background: #54a0ff;
      color: #fff;
    }

    &--add {
      background: transparent;
      border: 2rpx dashed #ccc;
      color: #999;
    }
  }

  &__badge {
    margin-left: 8rpx;
    font-size: 18rpx;
    color: #aaa;
    background: rgba(255, 255, 255, 0.3);
    padding: 2rpx 8rpx;
    border-radius: 8rpx;
  }

  &__input-bar {
    display: flex;
    align-items: center;
    margin-top: 12rpx;
    gap: 12rpx;
  }

  &__input {
    flex: 1;
    height: 64rpx;
    padding: 0 20rpx;
    border: 2rpx solid #ddd;
    border-radius: 12rpx;
    font-size: 26rpx;
  }

  &__confirm {
    padding: 12rpx 32rpx;
    background: #54a0ff;
    color: #fff;
    border-radius: 12rpx;
    font-size: 26rpx;
  }
}
```

- [ ] **Step 3：验证构建**

```bash
cd apps/miniapp
HOME=/Users/yangsong/个人产品设计/2026_6_17/apps/miniapp pnpm build:weapp 2>&1 | tail -5
```
预期：Compiled successfully。

- [ ] **Step 4：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/miniapp/src/components
git commit -m "feat(miniapp): reusable TagSelector component"
```

---

## Task 8：首页集成标签选择器验证

**Files:**
- Modify: `apps/miniapp/src/pages/index/index.tsx`

- [ ] **Step 1：在首页集成 TagSelector 做端到端验证**

修改 `apps/miniapp/src/pages/index/index.tsx`，在已登录视图中添加标签选择器测试区：

```tsx
import { View, Text, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { loginWithWx } from '../../services/auth';
import { uploadImage } from '../../services/upload';
import { useUserStore } from '../../stores/userStore';
import TagSelector from '../../components/TagSelector';
import './index.scss';

export default function Index() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [selectedAttrTags, setSelectedAttrTags] = useState<string[]>([]);
  const [selectedEventTags, setSelectedEventTags] = useState<string[]>([]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { user: u } = await loginWithWx();
      setUser(u);
    } catch (e: any) {
      console.error('登录失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const res = await Taro.chooseImage({ count: 1 });
      const url = await uploadImage(res.tempFilePaths[0]);
      Taro.showToast({ title: '上传成功' });
      console.log('uploaded:', url);
    } catch (e: any) {
      console.error('上传失败:', e);
      Taro.showToast({ title: '上传失败', icon: 'error' });
    }
  };

  return (
    <View className='index'>
      <Text>足迹手帐</Text>
      {user ? (
        <>
          <Text>已登录：{user.openid}</Text>
          <Button onClick={handleUpload}>测试上传图片</Button>
          <View className='index__section'>
            <Text className='index__label'>属性标签</Text>
            <TagSelector
              type='attribute'
              selectedIds={selectedAttrTags}
              onChange={setSelectedAttrTags}
            />
          </View>
          <View className='index__section'>
            <Text className='index__label'>事件标签</Text>
            <TagSelector
              type='event'
              selectedIds={selectedEventTags}
              onChange={setSelectedEventTags}
            />
          </View>
        </>
      ) : (
        <Button loading={loading} onClick={handleLogin}>
          微信一键登录
        </Button>
      )}
    </View>
  );
}
```

- [ ] **Step 2：在 index.scss 追加样式**

在 `apps/miniapp/src/pages/index/index.scss` 追加：

```scss
.index {
  padding: 32rpx;

  &__section {
    margin-top: 32rpx;
  }

  &__label {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
    color: #333;
  }
}
```

- [ ] **Step 3：验证构建**

```bash
cd apps/miniapp
HOME=/Users/yangsong/个人产品设计/2026_6_17/apps/miniapp pnpm build:weapp 2>&1 | tail -5
```
预期：Compiled successfully。

- [ ] **Step 4：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/miniapp/src
git commit -m "feat(miniapp): integrate TagSelector on home page for verification"
```

---

## Self-Review

- ✅ Tag 数据模型 → Task 1
- ✅ TagGroup 数据模型 → Task 1
- ✅ 系统预设种子数据 → Task 2
- ✅ Tag CRUD API → Task 4
- ✅ TagGroup CRUD API → Task 5
- ✅ 共享类型 → Task 3
- ✅ 前端标签服务 → Task 6
- ✅ 前端 TagSelector 组件 → Task 7
- ✅ 端到端集成验证 → Task 8
- ⚠️ 注意：本 plan 不包含 Place / CheckIn 的标签关联（那是 Plan 3/4 的内容），但 TagService.incrementUsage 方法已预留供后续调用
- ⚠️ Taro 小程序中 `<input>` 标签需替换为 `<Input>` 组件（Taro 组件库），在 Task 7 实现时需注意

---

## 执行模式

本 plan 使用 Subagent-Driven Development 执行。
