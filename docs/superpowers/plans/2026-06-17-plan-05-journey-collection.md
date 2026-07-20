# Plan 5：旅程地图与地点合集 Implementation Plan

**Goal:** 实现旅程地图（由打卡轨迹自动生成的可视化地图）和地点合集（用户自定义打包多个地点，如"成都美食10选"，可整体分享）。

**Architecture:**
- 旅程地图：视图层概念，由 CheckIn + Place 数据聚合生成 markers，无需新表
- 地点合集：新增 Collection 模型（多对多关联 Place），支持创建/编辑/删除/查询
- 地图渲染遵循历史教训：baseMarkers（收藏点）和 journeyMarkers（打卡轨迹点）分两套数据源
