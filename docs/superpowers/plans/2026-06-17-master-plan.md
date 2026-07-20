# 足迹手帐 · 实现计划总览（Master Plan）

> 创建日期：2026-06-17
> 关联设计文档：[2026-06-17-足迹手帐-design.md](../specs/2026-06-17-足迹手帐-design.md)
> 形态：微信小程序（Taro 跨端） + 自建后端

---

## 总体策略

MVP 范围较大，按「独立可测试的子项目」拆分为 **6 个 plan**，每个 plan 完成后都能独立运行、独立验证。

执行顺序为依赖顺序，**前一个 plan 完成后再开始下一个**。

| # | Plan 名称 | 主要产出 | 依赖 |
|---|---|---|---|
| 1 | **基础设施与项目骨架** | Taro 前端 + NestJS 后端 + DB + OSS + 微信登录 | 无 |
| 2 | **三层标签体系** | Tag / TagGroup CRUD + 系统预设种子 + 标签选择器 | Plan 1 |
| 3 | **地点收藏与卡片墙** | Place CRUD + 地图选点 + 卡片墙 + 三视图切换 | Plan 1,2 |
| 4 | **打卡与记忆时间轴** | CheckIn CRUD + 打卡动画 + 时间轴 + 快速找地 | Plan 3 |
| 5 | **旅程地图与地点合集** | 轨迹聚合渲染 + Collection CRUD | Plan 3,4 |
| 6 | **分享系统** | 分享卡片 + H5 预览页 + 第三方导航跳转 | Plan 3,5 |

---

## 技术栈

### 前端
- Taro 3.x + React 18 + TypeScript
- 状态：Zustand
- UI：NutUI-React-Taro
- 测试：Vitest

### 后端
- NestJS + TypeScript
- DB：PostgreSQL 15 + Prisma
- 缓存：Redis 7
- 对象存储：阿里云 OSS（推荐）/ 腾讯云 COS
- 进程：PM2 + Nginx
- 测试：Jest

### Monorepo
- pnpm workspace

---

## 目录结构

```
zuji-shouzhang/
├── apps/
│   ├── miniapp/                # Taro 前端
│   └── server/                 # NestJS 后端
├── packages/
│   └── shared-types/           # 前后端共享 TS 类型
├── docs/superpowers/
│   ├── specs/
│   └── plans/
├── pnpm-workspace.yaml
└── package.json
```

---

## 后续 Plan 文档

- [Plan 1：基础设施与项目骨架](./2026-06-17-plan-01-infrastructure.md)
- Plan 2-6 在 Plan 1 完成并验证后再生成（避免一次性生成过长、不便审阅）

---

## 执行模式建议

每个 plan 文档完成后，建议使用：
- **Subagent-Driven 模式**：每个任务派发独立 subagent 执行 + 任务间审查
- 或 **Inline 模式**：在当前会话按检查点批次执行

具体在每个 plan 写完后再选。
