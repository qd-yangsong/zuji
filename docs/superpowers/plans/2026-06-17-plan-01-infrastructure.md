# Plan 1：基础设施与项目骨架 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建「足迹手帐」前后端工程骨架、数据库、对象存储、微信登录通路，使后续业务模块可即插即用开发。

**Architecture:** pnpm Monorepo 管理 `apps/miniapp`（Taro 前端） 与 `apps/server`（NestJS 后端） 两个子工程；后端使用 Prisma 操作 PostgreSQL，Redis 用于会话缓存；对象存储使用阿里云 OSS；前端通过微信登录获取 code，后端换取 openid 并签发 JWT。

**Tech Stack:** pnpm + Taro 3 + React 18 + TS + Zustand + NutUI + NestJS + Prisma + PostgreSQL + Redis + 阿里云 OSS + JWT

---

## File Structure

| 文件 | 责任 |
|---|---|
| `pnpm-workspace.yaml` | 声明 monorepo 工作空间 |
| `package.json`（根） | 根脚本 + 共享 devDeps |
| `apps/miniapp/`（Taro 模板生成） | 前端入口 |
| `apps/miniapp/src/services/request.ts` | 网络请求封装（带 token） |
| `apps/miniapp/src/services/auth.ts` | 登录服务 |
| `apps/miniapp/src/stores/userStore.ts` | 用户全局状态（Zustand） |
| `apps/miniapp/src/pages/index/index.tsx` | 临时首页（验证登录） |
| `apps/server/`（NestJS 生成） | 后端入口 |
| `apps/server/prisma/schema.prisma` | 数据模型（仅 User 表） |
| `apps/server/src/modules/auth/auth.module.ts` | 鉴权模块 |
| `apps/server/src/modules/auth/auth.controller.ts` | 登录接口 |
| `apps/server/src/modules/auth/auth.service.ts` | 微信 code 换 openid + JWT 签发 |
| `apps/server/src/modules/user/user.service.ts` | 用户 upsert |
| `apps/server/src/common/guards/jwt.guard.ts` | JWT 守卫 |
| `apps/server/src/common/oss/oss.service.ts` | OSS 上传签名服务 |
| `apps/server/.env.example` | 环境变量模板 |
| `packages/shared-types/src/index.ts` | 前后端共享 TS 类型（如 ApiResponse） |

---

## Task 1：初始化 Monorepo 根工程

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.editorconfig`

- [ ] **Step 1：初始化 git 仓库**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git init
git branch -M main
```

- [ ] **Step 2：写 .gitignore**

写入文件 `/Users/yangsong/个人产品设计/2026_6_17/.gitignore`：

```
# deps
node_modules/
.pnpm-store/

# build
dist/
.cache/

# env
.env
.env.local
*.local

# logs
*.log
npm-debug.log*

# editor
.vscode/
.idea/
.DS_Store

# taro
apps/miniapp/dist/
apps/miniapp/.swc/
```

- [ ] **Step 3：写 pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 4：写根 package.json**

```json
{
  "name": "zuji-shouzhang",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "miniapp:dev": "pnpm --filter miniapp dev:weapp",
    "server:dev": "pnpm --filter server start:dev",
    "server:test": "pnpm --filter server test"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 5：提交**

```bash
git add .gitignore pnpm-workspace.yaml package.json
git commit -m "chore: init monorepo skeleton"
```

---

## Task 2：创建 Taro 前端工程

**Files:**
- Create: `apps/miniapp/`（由 Taro CLI 生成）

- [ ] **Step 1：全局安装 Taro CLI（若未安装）**

```bash
pnpm add -g @tarojs/cli
```

- [ ] **Step 2：进入 apps 目录并生成 Taro 项目**

```bash
mkdir -p apps && cd apps
taro init miniapp --template default --typescript --css sass --framework react --npm pnpm --description "足迹手帐"
```
> 交互式选项遇到时，全部按上述选择回车。

- [ ] **Step 3：安装 NutUI + Zustand 依赖**

```bash
cd miniapp
pnpm add @nutui/nutui-react-taro zustand
pnpm add -D babel-plugin-import
```

- [ ] **Step 4：在 babel.config.js 启用 NutUI 按需引入**

修改 `apps/miniapp/babel.config.js`：

```js
module.exports = {
  presets: [
    ['taro', { framework: 'react', ts: true }],
  ],
  plugins: [
    [
      'import',
      {
        libraryName: '@nutui/nutui-react-taro',
        libraryDirectory: 'dist/esm',
        style: 'css',
        camel2DashComponentName: false,
      },
      'nutui-react-taro',
    ],
  ],
};
```

- [ ] **Step 5：跑一次开发构建验证**

```bash
pnpm dev:weapp
```
预期：终端无报错，dist/ 生成；用微信开发者工具打开 `apps/miniapp/dist`，能看到默认 Hello world 页。

按 Ctrl+C 退出。

- [ ] **Step 6：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/miniapp
git commit -m "feat(miniapp): scaffold taro+react+ts project with nutui"
```

---

## Task 3：创建 NestJS 后端工程

**Files:**
- Create: `apps/server/`（由 NestJS CLI 生成）

- [ ] **Step 1：进入 apps 目录生成 NestJS 项目**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17/apps
pnpm dlx @nestjs/cli new server --package-manager pnpm --strict
```
> 交互式选项：选 pnpm。

- [ ] **Step 2：安装核心依赖**

```bash
cd server
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add prisma @prisma/client
pnpm add ioredis @nestjs-modules/ioredis
pnpm add ali-oss
pnpm add axios
pnpm add class-validator class-transformer
pnpm add -D @types/passport-jwt @types/ali-oss
```

- [ ] **Step 3：初始化 Prisma**

```bash
pnpm dlx prisma init --datasource-provider postgresql
```
预期：生成 `prisma/schema.prisma` 与 `.env`。

- [ ] **Step 4：编写 .env.example（供团队参考，不进 git 的是 .env）**

写入 `apps/server/.env.example`：

```
# Server
PORT=3000
NODE_ENV=development

# Postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zuji?schema=public"

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT
JWT_SECRET=replace-with-strong-random
JWT_EXPIRES_IN=30d

# WeChat MiniProgram
WX_APPID=wx_xxxxxxxxxxxx
WX_SECRET=xxxxxxxxxxxx

# Aliyun OSS
OSS_REGION=oss-cn-shanghai
OSS_ACCESS_KEY_ID=xxx
OSS_ACCESS_KEY_SECRET=xxx
OSS_BUCKET=zuji-shouzhang
OSS_ENDPOINT=oss-cn-shanghai.aliyuncs.com
```

> 让团队复制 `.env.example` 为 `.env` 并填真实值。

- [ ] **Step 5：跑一次启动验证**

```bash
pnpm start:dev
```
预期：终端打印 `Application is running on http://[::1]:3000`。

按 Ctrl+C 退出。

- [ ] **Step 6：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server
git commit -m "feat(server): scaffold nestjs project with prisma/jwt/redis/oss deps"
```

---

## Task 4：定义 User 数据模型并跑首次迁移

**Files:**
- Modify: `apps/server/prisma/schema.prisma`
- Create: `apps/server/prisma/migrations/<timestamp>_init/migration.sql`（自动生成）

- [ ] **Step 1：写 schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  openid      String   @unique
  unionid     String?  @unique
  nickname    String?
  avatarUrl   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("users")
}
```

- [ ] **Step 2：执行 migration**

```bash
cd apps/server
pnpm dlx prisma migrate dev --name init
```
预期：生成 migrations 目录，数据库出现 `users` 表。

- [ ] **Step 3：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server/prisma
git commit -m "feat(server): add User model and initial migration"
```

---

## Task 5：实现 Prisma Service（封装 PrismaClient）

**Files:**
- Create: `apps/server/src/common/prisma/prisma.service.ts`
- Create: `apps/server/src/common/prisma/prisma.module.ts`

- [ ] **Step 1：写 prisma.service.ts**

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

- [ ] **Step 2：写 prisma.module.ts**

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3：在 AppModule 中导入**

修改 `apps/server/src/app.module.ts`：

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 4：启动验证**

```bash
cd apps/server
pnpm start:dev
```
预期：无连接错误，终端正常启动。Ctrl+C 退出。

- [ ] **Step 5：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server/src
git commit -m "feat(server): add prisma module wiring"
```

---

## Task 6：实现微信登录（code → openid → JWT）

**Files:**
- Create: `apps/server/src/modules/user/user.service.ts`
- Create: `apps/server/src/modules/user/user.module.ts`
- Create: `apps/server/src/modules/auth/auth.service.ts`
- Create: `apps/server/src/modules/auth/auth.controller.ts`
- Create: `apps/server/src/modules/auth/auth.module.ts`
- Create: `apps/server/src/modules/auth/dto/login.dto.ts`
- Create: `apps/server/test/auth.controller.spec.ts`

- [ ] **Step 1：写测试（先写失败的测试）**

写入 `apps/server/src/modules/auth/auth.controller.spec.ts`：

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    loginByWxCode: jest.fn().mockResolvedValue({
      token: 'mock-jwt',
      user: { id: 'u1', openid: 'ox' },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('应能根据 code 登录并返回 token', async () => {
    const result = await controller.login({ code: 'wx-code' });
    expect(result.token).toBe('mock-jwt');
    expect(mockAuthService.loginByWxCode).toHaveBeenCalledWith('wx-code');
  });
});
```

- [ ] **Step 2：跑测试确认失败**

```bash
cd apps/server
pnpm test auth.controller
```
预期：FAIL，"Cannot find module './auth.controller'"。

- [ ] **Step 3：写 login DTO**

写入 `apps/server/src/modules/auth/dto/login.dto.ts`：

```ts
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  // 微信 wx.login() 返回的 code
  @IsString()
  @MinLength(1)
  code: string;
}
```

- [ ] **Step 4：写 user.service.ts**

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 根据 openid upsert 用户
  async upsertByOpenid(openid: string, unionid?: string) {
    return this.prisma.user.upsert({
      where: { openid },
      update: { unionid: unionid ?? undefined },
      create: { openid, unionid },
    });
  }
}
```

- [ ] **Step 5：写 user.module.ts**

```ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

- [ ] **Step 6：写 auth.service.ts**

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UserService } from '../user/user.service';

interface WxCode2SessionResp {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    private userService: UserService,
  ) {}

  // code 换 openid + 落库 + 签 JWT
  async loginByWxCode(code: string) {
    const appid = this.config.get<string>('WX_APPID');
    const secret = this.config.get<string>('WX_SECRET');
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const { data } = await axios.get<WxCode2SessionResp>(url);
    if (!data.openid) {
      throw new UnauthorizedException(`wx login failed: ${data.errmsg}`);
    }
    const user = await this.userService.upsertByOpenid(data.openid, data.unionid);
    const token = await this.jwt.signAsync({ sub: user.id, openid: user.openid });
    return { token, user };
  }
}
```

- [ ] **Step 7：写 auth.controller.ts**

```ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.loginByWxCode(dto.code);
  }
}
```

- [ ] **Step 8：写 auth.module.ts**

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 9：在 AppModule 注册**

修改 `apps/server/src/app.module.ts`，imports 数组加上 `AuthModule`、`UserModule`：

```ts
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
// imports: [..., UserModule, AuthModule]
```

- [ ] **Step 10：跑测试确认通过**

```bash
pnpm test auth.controller
```
预期：PASS。

- [ ] **Step 11：开 ValidationPipe（main.ts 全局校验）**

修改 `apps/server/src/main.ts`：

```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

- [ ] **Step 12：手动起服务并 curl 测试错误流程**

```bash
pnpm start:dev
```
新开一个终端：
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"code":""}'
```
预期：返回 400，code 校验失败。Ctrl+C 关服务。

- [ ] **Step 13：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/server/src
git commit -m "feat(server): wechat login (code -> openid -> jwt)"
```

---

## Task 7：实现 JWT 守卫（保护后续接口）

**Files:**
- Create: `apps/server/src/common/guards/jwt.strategy.ts`
- Create: `apps/server/src/common/guards/jwt.guard.ts`
- Create: `apps/server/src/common/decorators/current-user.decorator.ts`

- [ ] **Step 1：写 jwt.strategy.ts**

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  openid: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  // payload 校验后，结果挂到 req.user
  async validate(payload: JwtPayload) {
    return { id: payload.sub, openid: payload.openid };
  }
}
```

- [ ] **Step 2：写 jwt.guard.ts**

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 3：写 current-user 装饰器**

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as { id: string; openid: string };
  },
);
```

- [ ] **Step 4：在 AuthModule 注册 strategy**

修改 `auth.module.ts`：

```ts
// providers 增加 JwtStrategy
import { JwtStrategy } from '../../common/guards/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
// imports 增加 PassportModule
// providers: [AuthService, JwtStrategy]
```

- [ ] **Step 5：在 AuthController 加一个受保护的 me 接口验证**

修改 `auth.controller.ts`：

```ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// 新增方法：
@UseGuards(JwtAuthGuard)
@Get('me')
me(@CurrentUser() user: { id: string; openid: string }) {
  return user;
}
```

- [ ] **Step 6：手动验证**

```bash
pnpm start:dev
```
另开终端：
```bash
# 不带 token
curl http://localhost:3000/api/auth/me
# 预期：401

# 带伪造 token
TOKEN=$(node -e "const j=require('jsonwebtoken'); console.log(j.sign({sub:'u1',openid:'ox'},'replace-with-strong-random'))")
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/auth/me
# 预期：{ id: 'u1', openid: 'ox' }
```
> 注意：JWT_SECRET 需与 .env 一致才能验证。

- [ ] **Step 7：提交**

```bash
git add apps/server/src
git commit -m "feat(server): jwt strategy/guard and current-user decorator"
```

---

## Task 8：OSS 上传签名服务

**Files:**
- Create: `apps/server/src/common/oss/oss.service.ts`
- Create: `apps/server/src/common/oss/oss.module.ts`
- Create: `apps/server/src/common/oss/oss.controller.ts`

- [ ] **Step 1：写 oss.service.ts（生成 PostObject 签名供前端直传）**

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface OssPolicy {
  accessKeyId: string;
  policy: string;
  signature: string;
  host: string;
  dir: string;
  expire: number;
}

@Injectable()
export class OssService {
  constructor(private config: ConfigService) {}

  // 生成 OSS 直传 policy（前端使用 wx.uploadFile）
  buildUploadPolicy(userId: string, expireSeconds = 600): OssPolicy {
    const accessKeyId = this.config.get<string>('OSS_ACCESS_KEY_ID')!;
    const accessKeySecret = this.config.get<string>('OSS_ACCESS_KEY_SECRET')!;
    const bucket = this.config.get<string>('OSS_BUCKET')!;
    const endpoint = this.config.get<string>('OSS_ENDPOINT')!;

    const expire = Math.floor(Date.now() / 1000) + expireSeconds;
    const dir = `users/${userId}/`;

    const policyText = JSON.stringify({
      expiration: new Date(expire * 1000).toISOString(),
      conditions: [
        ['starts-with', '$key', dir],
        ['content-length-range', 0, 20 * 1024 * 1024], // 单文件 20MB
      ],
    });
    const policy = Buffer.from(policyText).toString('base64');
    const signature = crypto
      .createHmac('sha1', accessKeySecret)
      .update(policy)
      .digest('base64');

    return {
      accessKeyId,
      policy,
      signature,
      host: `https://${bucket}.${endpoint}`,
      dir,
      expire,
    };
  }
}
```

- [ ] **Step 2：写 oss.controller.ts（受保护接口）**

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { OssService } from './oss.service';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('oss')
export class OssController {
  constructor(private oss: OssService) {}

  // 前端调用以获取直传凭证
  @Get('policy')
  policy(@CurrentUser() user: { id: string }) {
    return this.oss.buildUploadPolicy(user.id);
  }
}
```

- [ ] **Step 3：写 oss.module.ts**

```ts
import { Module } from '@nestjs/common';
import { OssService } from './oss.service';
import { OssController } from './oss.controller';

@Module({
  controllers: [OssController],
  providers: [OssService],
  exports: [OssService],
})
export class OssModule {}
```

- [ ] **Step 4：在 AppModule 注册**

```ts
// imports 增加 OssModule
import { OssModule } from './common/oss/oss.module';
```

- [ ] **Step 5：手动验证**

```bash
pnpm start:dev
# 用上一个 task 的 TOKEN 请求：
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/oss/policy
# 预期：返回 { accessKeyId, policy, signature, host, dir, expire }
```

- [ ] **Step 6：提交**

```bash
git add apps/server/src
git commit -m "feat(server): oss upload policy endpoint"
```

---

## Task 9：前端封装请求层与登录服务

**Files:**
- Create: `apps/miniapp/src/services/request.ts`
- Create: `apps/miniapp/src/services/auth.ts`
- Create: `apps/miniapp/src/stores/userStore.ts`

- [ ] **Step 1：写 request.ts**

```ts
import Taro from '@tarojs/taro';

const BASE_URL = process.env.TARO_APP_API_BASE || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
}

export async function request<T = unknown>(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
  needAuth?: boolean;
}): Promise<T> {
  const { url, method = 'GET', data, needAuth = true } = options;
  const header: Record<string, string> = { 'Content-Type': 'application/json' };
  if (needAuth) {
    const token = Taro.getStorageSync('token');
    if (token) header.Authorization = `Bearer ${token}`;
  }
  const res = await Taro.request<ApiResponse<T>>({
    url: BASE_URL + url,
    method,
    data,
    header,
  });
  if (res.statusCode >= 400) {
    throw new Error((res.data as ApiResponse<T>)?.message || `HTTP ${res.statusCode}`);
  }
  return res.data as T;
}
```

- [ ] **Step 2：写 auth.ts**

```ts
import Taro from '@tarojs/taro';
import { request } from './request';

interface LoginResp {
  token: string;
  user: { id: string; openid: string; nickname?: string; avatarUrl?: string };
}

export async function loginWithWx(): Promise<LoginResp> {
  const { code } = await Taro.login();
  const result = await request<LoginResp>({
    url: '/auth/login',
    method: 'POST',
    data: { code },
    needAuth: false,
  });
  Taro.setStorageSync('token', result.token);
  return result;
}
```

- [ ] **Step 3：写 userStore.ts**

```ts
import { create } from 'zustand';

interface UserInfo {
  id: string;
  openid: string;
  nickname?: string;
  avatarUrl?: string;
}

interface UserState {
  user: UserInfo | null;
  setUser: (u: UserInfo | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

- [ ] **Step 4：改造首页验证登录通路**

修改 `apps/miniapp/src/pages/index/index.tsx`：

```tsx
import { View, Text, Button } from '@tarojs/components';
import { useState } from 'react';
import { loginWithWx } from '../../services/auth';
import { useUserStore } from '../../stores/userStore';
import './index.scss';

export default function Index() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { user: u } = await loginWithWx();
      setUser(u);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='index'>
      <Text>足迹手帐</Text>
      {user ? (
        <Text>已登录：{user.openid}</Text>
      ) : (
        <Button loading={loading} onClick={handleLogin}>
          微信一键登录
        </Button>
      )}
    </View>
  );
}
```

- [ ] **Step 5：构建并在微信开发者工具验证**

```bash
cd apps/miniapp
pnpm dev:weapp
```
打开微信开发者工具：
- 导入 `apps/miniapp/dist`
- 在 详情 -> 本地设置 勾选「不校验合法域名」（开发期）
- 后端跑 `pnpm --filter server start:dev`
- 点击「微信一键登录」
- 预期：页面显示「已登录：oxxx...」

> 若测试号无 appid，可在 .env 用真实小程序 appid + secret。

- [ ] **Step 6：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add apps/miniapp/src
git commit -m "feat(miniapp): request layer + wx login + user store"
```

---

## Task 10：前端 OSS 上传工具函数（图片直传）

**Files:**
- Create: `apps/miniapp/src/services/upload.ts`

- [ ] **Step 1：写 upload.ts**

```ts
import Taro from '@tarojs/taro';
import { request } from './request';

interface OssPolicy {
  accessKeyId: string;
  policy: string;
  signature: string;
  host: string;
  dir: string;
  expire: number;
}

// 上传单张图到 OSS，返回最终公开 URL
export async function uploadImage(localPath: string): Promise<string> {
  const policy = await request<OssPolicy>({ url: '/oss/policy' });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const key = policy.dir + filename;

  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: policy.host,
      filePath: localPath,
      name: 'file',
      formData: {
        key,
        OSSAccessKeyId: policy.accessKeyId,
        policy: policy.policy,
        signature: policy.signature,
        success_action_status: '200',
      },
      success: () => resolve(`${policy.host}/${key}`),
      fail: (err) => reject(err),
    });
  });
}
```

- [ ] **Step 2：在首页加一个上传按钮做端到端验证**

修改 `apps/miniapp/src/pages/index/index.tsx`，在已登录后加：

```tsx
import { uploadImage } from '../../services/upload';

// 在已登录视图中加 Button：
<Button onClick={async () => {
  const res = await Taro.chooseImage({ count: 1 });
  const url = await uploadImage(res.tempFilePaths[0]);
  Taro.showToast({ title: '上传成功' });
  console.log('uploaded:', url);
}}>测试上传图片</Button>
```

- [ ] **Step 3：在微信开发者工具验证**

- 选图，上传成功 toast，控制台打印公网 URL
- 浏览器打开 URL 能看到图

> 前置：阿里云 OSS bucket 已开通，ACL 设为「公共读」。

- [ ] **Step 4：提交**

```bash
git add apps/miniapp/src
git commit -m "feat(miniapp): oss direct upload helper + e2e verify"
```

---

## Task 11：共享类型包

**Files:**
- Create: `packages/shared-types/package.json`
- Create: `packages/shared-types/tsconfig.json`
- Create: `packages/shared-types/src/index.ts`

- [ ] **Step 1：写 packages/shared-types/package.json**

```json
{
  "name": "@zuji/shared-types",
  "version": "0.0.1",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "private": true
}
```

- [ ] **Step 2：写 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3：写第一个共享类型 src/index.ts**

```ts
// 通用接口响应封装
export interface ApiError {
  statusCode: number;
  message: string;
}

// 用户基本信息
export interface UserDto {
  id: string;
  openid: string;
  nickname?: string;
  avatarUrl?: string;
}

// 登录返回
export interface LoginResponseDto {
  token: string;
  user: UserDto;
}
```

- [ ] **Step 4：在前后端 package.json 加依赖**

`apps/miniapp/package.json` 与 `apps/server/package.json` 的 dependencies 都加：

```json
"@zuji/shared-types": "workspace:*"
```

然后：
```bash
cd /Users/yangsong/个人产品设计/2026_6_17
pnpm install
```

- [ ] **Step 5：替换前端 auth.ts 的内联类型为共享类型**

修改 `apps/miniapp/src/services/auth.ts`：

```ts
import type { LoginResponseDto } from '@zuji/shared-types';
// 删除本地 LoginResp，使用 LoginResponseDto
```

- [ ] **Step 6：构建确认无类型错误**

```bash
cd apps/miniapp
pnpm dev:weapp
```
按 Ctrl+C 退出。

- [ ] **Step 7：提交**

```bash
cd /Users/yangsong/个人产品设计/2026_6_17
git add packages apps
git commit -m "feat(shared-types): introduce shared dto package"
```

---

## Task 12：环境就绪检查清单（人工验收）

> 这个 task 没有代码，只是核对清单，确保 Plan 1 真正交付。

- [ ] PostgreSQL 已起，DATABASE_URL 可连通
- [ ] Redis 已起，REDIS_HOST/PORT 可连通
- [ ] 阿里云 OSS bucket 已建，公共读权限
- [ ] 小程序 appid/secret 已填到 .env
- [ ] `pnpm server:dev` 启动无报错
- [ ] `pnpm miniapp:dev` 编译无报错
- [ ] 微信开发者工具登录通路成功（看到 openid）
- [ ] 微信开发者工具上传图片成功，能看到公网 URL

---

## Self-Review

- ✅ User 数据模型 → Task 4
- ✅ JWT 鉴权 → Task 6/7
- ✅ OSS 直传 → Task 8/10
- ✅ 微信登录 → Task 6/9
- ✅ 共享类型 → Task 11
- ✅ 端到端验证 → Task 12
- ⚠️ 注意：本 plan 不包含 Place / CheckIn / Tag / Collection / Share 业务模型，这些在 Plan 2-6 中实现，需要 Plan 1 完成后再生成相应 plan 文档

---

## 执行模式

完成本 plan 后，请告知，我会基于实际进展生成 **Plan 2：三层标签体系**。

执行本 plan 推荐方式：
1. **Subagent-Driven（推荐）**：每个 Task 交给独立 subagent 执行，任务间审查
2. **Inline**：当前会话按 Task 检查点逐步执行
