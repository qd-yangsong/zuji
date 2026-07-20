# Plan 4：打卡与记忆时间轴 Implementation Plan

**Goal:** 实现打卡功能（CheckIn 模型 + 图文记录 + 事件标签 + 定位验证）和记忆时间轴（按时间倒序展示一个地点的所有打卡记录），这是产品的核心仪式感功能。

**Architecture:** CheckIn 关联 Place + 事件标签（多对多），创建打卡时自动递增 Place.checkinCount + 标签 usageCount。时间轴在地点详情页内展示，按时间倒序排列，每条记录显示事件标签、文字、图片缩略图。

---

## Task 1：CheckIn 数据模型 + 迁移

追加 CheckIn + CheckInTag 模型，并在 Place 上加反向关联。

## Task 2：共享类型更新

新增 CheckInDto / CreateCheckInDto。

## Task 3：后端 CheckIn 模块 CRUD API

- POST /api/checkins （创建打卡，需传 placeId）
- GET /api/places/:id/checkins （获取某地点的时间轴）
- DELETE /api/checkins/:id （删除打卡）
- 创建时自动递增 place.checkinCount + tag.usageCount

## Task 4：前端打卡 API 服务

## Task 5：打卡页面

从地点详情页「打卡」按钮跳转，包含：定位验证 + 图文录入 + 事件标签选择 + 提交。

## Task 6：详情页集成时间轴

在地点详情页的统计信息下方，展示打卡记录时间轴。
