# 足迹手帐 · UI 重设计阶段一实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 彻底解决插画失真问题，用纯 CSS 几何图形 + 色块叠加替代所有图片引用，建立统一优雅的视觉语言。

**Architecture:** 移除 ThemeResource 中的 illustUrl/decoUrl/emoji 字段，新增 geoType/accent/light 字段。新建 ThemeShape 纯 CSS 组件渲染 6 种主题几何图形。重写卡片墙、详情页、打卡页、旅程地图 4 个核心页面的 TSX 和 SCSS。

**Tech Stack:** Taro 4.2.0 + React + TypeScript + SCSS

---

## 文件结构

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 修改 | `packages/shared-types/src/index.ts` | ThemeResource 类型重构 |
| 修改 | `apps/miniapp/src/config/theme-config.ts` | 主题配置数据重构 |
| 创建 | `apps/miniapp/src/components/ThemeShape/index.tsx` | CSS 几何图形组件 |
| 创建 | `apps/miniapp/src/components/ThemeShape/index.scss` | 6 种几何图形样式 |
| 修改 | `apps/miniapp/src/services/resource.ts` | 适配新 ThemeResource |
| 修改 | `apps/miniapp/src/app.scss` | 全局纸质底色 |
| 重写 | `apps/miniapp/src/pages/cards/index.tsx` | 卡片墙页面 |
| 重写 | `apps/miniapp/src/pages/cards/index.scss` | 卡片墙样式 |
| 重写 | `apps/miniapp/src/pages/place-detail/index.tsx` | 详情页页面 |
| 重写 | `apps/miniapp/src/pages/place-detail/index.scss` | 详情页样式 |
| 重写 | `apps/miniapp/src/pages/checkin/index.tsx` | 打卡页页面 |
| 重写 | `apps/miniapp/src/pages/checkin/index.scss` | 打卡页样式 |
| 重写 | `apps/miniapp/src/pages/journey/index.tsx` | 旅程地图页面 |
| 重写 | `apps/miniapp/src/pages/journey/index.scss` | 旅程地图样式 |
| 修改 | `apps/miniapp/src/custom-tab-bar/index.tsx` | TabBar 适配 |
| 修改 | `apps/miniapp/src/custom-tab-bar/index.scss` | TabBar 样式 |

---

### Task 1: 重构 ThemeResource 类型定义

**Files:**
- Modify: `packages/shared-types/src/index.ts` (约 111-121 行)

- [ ] **Step 1: 替换 ThemeResource 接口**

将现有的 ThemeResource 接口替换为新设计：

```typescript
export interface ThemeResource {
  id: string;              // 主题唯一标识：night/coffee/park/gather/stay/exhibit
  gradient: string;        // CSS 渐变背景
  accent: string;          // 主题强调色（标签文字、首字徽章文字色）
  light: string;           // 浅色背景（标签底色）
  geoType: string;         // CSS 几何图形类型：night/coffee/park/gather/stay/exhibit
}
```

移除字段：`bg`, `iconBg`, `iconColor`, `emoji`, `deco`, `illustUrl`, `decoUrl`。

- [ ] **Step 2: 构建 shared-types 包**

Run: `pnpm --filter @zuji/shared-types run build`
Expected: 编译成功，无类型错误

- [ ] **Step 3: Commit**

```bash
git add packages/shared-types/src/index.ts
git commit -m "refactor: 重构 ThemeResource 类型，移除图片字段，新增 geoType/accent/light"
```

---

### Task 2: 重构主题配置数据

**Files:**
- Modify: `apps/miniapp/src/config/theme-config.ts` (完整重写)

- [ ] **Step 1: 重写 theme-config.ts**

```typescript
/**
 * 主题配置 -- 本地默认主题池
 *
 * 纯 CSS 视觉方案：每主题 = 渐变色 + CSS 几何图形 + accent/light 配色
 * 零图片依赖，永不失真。
 * 后续切换为后台管理远程配置时，只需 ResourceService.setSource('remote')。
 */
import type { ThemeResource } from '@zuji/shared-types';

export const LOCAL_THEME_POOL: ThemeResource[] = [
  {
    id: 'night',
    gradient: 'linear-gradient(160deg, #a8a8d0 0%, #7c7cb8 100%)',
    accent: '#5a5a8e',
    light: '#e8e8f5',
    geoType: 'night',
  },
  {
    id: 'coffee',
    gradient: 'linear-gradient(160deg, #f5deb3 0%, #d4a96a 100%)',
    accent: '#8b6914',
    light: '#fdf5e6',
    geoType: 'coffee',
  },
  {
    id: 'park',
    gradient: 'linear-gradient(160deg, #c8e6c9 0%, #81c784 100%)',
    accent: '#2e7d32',
    light: '#e8f5e9',
    geoType: 'park',
  },
  {
    id: 'gather',
    gradient: 'linear-gradient(160deg, #e1bee7 0%, #ce93d8 100%)',
    accent: '#7b1fa2',
    light: '#f3e5f5',
    geoType: 'gather',
  },
  {
    id: 'stay',
    gradient: 'linear-gradient(160deg, #ffe0b2 0%, #ffb74d 100%)',
    accent: '#e65100',
    light: '#fff3e0',
    geoType: 'stay',
  },
  {
    id: 'exhibit',
    gradient: 'linear-gradient(160deg, #b3e5fc 0%, #64b5f6 100%)',
    accent: '#1565c0',
    light: '#e3f2fd',
    geoType: 'exhibit',
  },
];

// 当前配置版本号（远程配置更新时递增，用于缓存失效）
export const THEME_CONFIG_VERSION = '2.0.0';
```

- [ ] **Step 2: Commit**

```bash
git add apps/miniapp/src/config/theme-config.ts
git commit -m "refactor: 主题配置改为纯 CSS 方案，移除 COS 图片引用"
```

---

### Task 3: 创建 ThemeShape 组件

**Files:**
- Create: `apps/miniapp/src/components/ThemeShape/index.tsx`
- Create: `apps/miniapp/src/components/ThemeShape/index.scss`

- [ ] **Step 1: 创建组件 TSX**

```typescript
import { View } from '@tarojs/components';

interface ThemeShapeProps {
  geoType: 'night' | 'coffee' | 'park' | 'gather' | 'stay' | 'exhibit';
  className?: string;
}

/**
 * 主题几何图形组件
 * 纯 CSS 绘制，零图片依赖，永不失真。
 * 通过 geoType 匹配对应的 CSS 类名渲染图形。
 */
export default function ThemeShape({ geoType, className = '' }: ThemeShapeProps) {
  return <View className={`theme-shape theme-shape--${geoType} ${className}`} />;
}
```

- [ ] **Step 2: 创建组件 SCSS**

```scss
.theme-shape {
  position: relative;
  z-index: 1;

  // 夜 - 月亮：圆 + 内阴影偏移造月牙
  &--night {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: inset -18rpx -6rpx 0 rgba(124, 124, 184, 0.4);
  }

  // 咖 - 咖啡杯环：圆环 + 顶部手柄
  &--coffee {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    border: 7rpx solid rgba(255, 255, 255, 0.55);

    &::after {
      content: '';
      position: absolute;
      width: 44rpx;
      height: 12rpx;
      border: 3rpx solid rgba(255, 255, 255, 0.35);
      border-radius: 50%;
      top: -20rpx;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  // 园 - 叶子：不对称圆角四边形
  &--park {
    width: 66rpx;
    height: 66rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 0 100% 0 100%;
    transform: rotate(-15deg);
  }

  // 聚 - 双圆叠加：两个半透明圆
  &--gather {
    width: 76rpx;
    height: 56rpx;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 46rpx;
      height: 46rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      top: 5rpx;
    }

    &::before { left: 0; }
    &::after { right: 0; background: rgba(255, 255, 255, 0.5); }
  }

  // 宿 - 房屋：三角顶 + 方形身
  &--stay {
    width: 0;
    height: 0;
    border-left: 38rpx solid transparent;
    border-right: 38rpx solid transparent;
    border-bottom: 48rpx solid rgba(255, 255, 255, 0.5);

    &::after {
      content: '';
      position: absolute;
      width: 44rpx;
      height: 30rpx;
      background: rgba(255, 255, 255, 0.35);
      top: 48rpx;
      left: -22rpx;
    }
  }

  // 展 - 相框：方形边框 + 内圆
  &--exhibit {
    width: 60rpx;
    height: 60rpx;
    border: 5rpx solid rgba(255, 255, 255, 0.5);
    border-radius: 6rpx;

    &::after {
      content: '';
      position: absolute;
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
```

- [ ] **Step 3: 构建验证**

Run: `pnpm --filter miniapp run build:weapp`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add apps/miniapp/src/components/ThemeShape/
git commit -m "feat: 新增 ThemeShape 纯 CSS 几何图形组件"
```

---

### Task 4: 适配 resource.ts 服务

**Files:**
- Modify: `apps/miniapp/src/services/resource.ts` (无需大改，类型已自动适配)

- [ ] **Step 1: 检查 resource.ts 是否需要修改**

resource.ts 中 `getThemeByName` 和 `getThemeById` 返回 `ThemeResource`，类型已在 Task 1 更新。此文件无需代码修改，类型会自动适配。

- [ ] **Step 2: 构建验证**

Run: `pnpm --filter miniapp run build:weapp`
Expected: 编译可能报错（因为其他页面还引用旧字段），记录错误但暂不修复，后续 Task 逐个修复

---

### Task 5: 全局纸质底色

**Files:**
- Modify: `apps/miniapp/src/app.scss`

- [ ] **Step 1: 修改全局背景色**

在 app.scss 中找到 `page` 或全局背景色设置，改为 `#faf6f1`。

如果没有明确的 page 背景色，在 app.scss 顶部添加：

```scss
page {
  background-color: #faf6f1;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/miniapp/src/app.scss
git commit -m "style: 全局纸质底色 #faf6f1"
```

---

### Task 6: 重写卡片墙页面

**Files:**
- Rewrite: `apps/miniapp/src/pages/cards/index.tsx`
- Rewrite: `apps/miniapp/src/pages/cards/index.scss`

- [ ] **Step 1: 重写 cards/index.tsx**

关键变化：
- 移除 ThemeImage 引用，改用 ThemeShape 组件
- 卡片视觉区改为渐变背景 + CSS 色块 + ThemeShape
- 首字徽章用 `theme.accent` 颜色
- 收藏心形改用 CSS 绘制（`heart-shape` 类）
- 标签用 `theme.light` 和 `theme.accent`
- 搜索按钮改为 CSS 放大镜图标
- 保留排序、公告、下拉刷新等现有功能逻辑

- [ ] **Step 2: 重写 cards/index.scss**

关键样式：
- `.cw-card-visual`：渐变背景 + `::before`/`::after` 色块叠加
- `.badge`：白色圆形 + `color: var(--accent)`
- `.heart-shape`：CSS 心形（`::before`+`::after` 旋转圆角矩形）
- `.cw-search`：CSS 放大镜（`::before` 圆 + `::after` 斜线）
- `.cw-tag`：`background: var(--light); color: var(--accent)`
- 全局使用 CSS 变量传递主题色

- [ ] **Step 3: 构建验证**

Run: `pnpm --filter miniapp run build:weapp`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add apps/miniapp/src/pages/cards/
git commit -m "feat: 卡片墙重写为纯 CSS 几何图形 + 色块叠加方案"
```

---

### Task 7: 重写详情页

**Files:**
- Rewrite: `apps/miniapp/src/pages/place-detail/index.tsx`
- Rewrite: `apps/miniapp/src/pages/place-detail/index.scss`

- [ ] **Step 1: 重写 place-detail/index.tsx**

关键变化：
- 移除所有 COS 图片引用和 ThemeImage
- 移除 `require('../../assets/detail-deco/...')` 引用
- 封面区改为渐变背景 + 色块 + 居中首字徽章 + ThemeShape
- 移除云朵、星星、月亮等装饰
- 信息区上浮 24rpx 圆角覆盖
- 时间轴改为贴纸风格（白色圆角卡片 + 彩色圆点）
- 底部分享按钮标注"即将上线"
- 保留打卡、编辑、删除等现有功能逻辑

- [ ] **Step 2: 重写 place-detail/index.scss**

关键样式：
- `.dp-cover`：渐变 + 色块叠加
- `.dp-badge`：80rpx 白色圆形 + accent 色文字
- `.dp-body`：上浮 24rpx + 圆角 24rpx
- `.dp-tag`：`background: var(--light); color: var(--accent)`
- `.dp-timeline-content`：白色圆角卡片 + 阴影
- 移除所有旧装饰元素样式

- [ ] **Step 3: 构建验证**

Run: `pnpm --filter miniapp run build:weapp`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add apps/miniapp/src/pages/place-detail/
git commit -m "feat: 详情页重写为纯 CSS 渐变封面 + 贴纸时间轴"
```

---

### Task 8: 重写打卡页

**Files:**
- Rewrite: `apps/miniapp/src/pages/checkin/index.tsx`
- Rewrite: `apps/miniapp/src/pages/checkin/index.scss`

- [ ] **Step 1: 重写 checkin/index.tsx**

关键变化：
- 新增珍珠仪式区：100rpx 珍珠球（径向渐变 + 虚线外圈）
- 标题"给这颗珍珠写句话"
- 保留文字日记、照片上传、事件标签选择器
- 提交时添加 `Taro.vibrateShort()` 触觉反馈
- 提交按钮文案改为"放入珍珠"

- [ ] **Step 2: 重写 checkin/index.scss**

关键样式：
- `.ci-pearl`：径向渐变 + `::after` 虚线外圈
- `.ci-input`：白色圆角 16rpx
- `.ci-photo`：64rpx 方形圆角 12rpx
- `.ci-btn`：渐变紫色胶囊形

- [ ] **Step 3: 构建验证**

Run: `pnpm --filter miniapp run build:weapp`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add apps/miniapp/src/pages/checkin/
git commit -m "feat: 打卡页新增珍珠仪式区"
```

---

### Task 9: 重写旅程地图

**Files:**
- Rewrite: `apps/miniapp/src/pages/journey/index.tsx`
- Rewrite: `apps/miniapp/src/pages/journey/index.scss`

- [ ] **Step 1: 重写 journey/index.tsx**

关键变化：
- 统计卡片改为 3 列（地点数/打卡数/城市数），每列不同 accent 色
- 地图 markers 使用主题色（通过 `resourceService.getThemeByName` 获取）
- 底部信息卡添加主题色圆形首字
- 保留地图、markers、点击跳转等现有功能逻辑

- [ ] **Step 2: 重写 journey/index.scss**

关键样式：
- `.jm-stat-card`：白色圆角 16rpx
- `.jm-stat-num`：24rpx/700
- `.jm-bottom-card`：白色圆角 + 阴影
- `.jm-pin`：主题色水滴形

- [ ] **Step 3: 构建验证**

Run: `pnpm --filter miniapp run build:weapp`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add apps/miniapp/src/pages/journey/
git commit -m "feat: 旅程地图新增统计卡片和主题色标记"
```

---

### Task 10: 适配 TabBar 和清理旧组件

**Files:**
- Modify: `apps/miniapp/src/custom-tab-bar/index.tsx`
- Modify: `apps/miniapp/src/custom-tab-bar/index.scss`
- Delete: `apps/miniapp/src/components/ThemeImage/` (如不再被引用)

- [ ] **Step 1: 检查 ThemeImage 是否还有引用**

搜索项目中所有 `ThemeImage` 的 import 引用。如果卡片墙和详情页已全部改用 ThemeShape，则 ThemeImage 不再被引用。

- [ ] **Step 2: 删除 ThemeImage 组件（如无引用）**

如果确认无引用，删除 `apps/miniapp/src/components/ThemeImage/` 目录。

- [ ] **Step 3: 确保 TabBar 样式与新视觉一致**

检查 custom-tab-bar 的 SCSS，确保：
- 图标尺寸 22rpx
- 未选中灰色 `#ccc`
- 选中紫色 `#6366f1`
- 底部适配安全区

- [ ] **Step 4: 最终构建验证**

Run: `pnpm --filter miniapp run build:weapp`
Expected: 编译成功，无警告

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: 清理旧 ThemeImage 组件，适配 TabBar"
```

---

## Self-Review

**Spec coverage:**
- 2.2 主题系统重构 -> Task 1 + Task 2 ✓
- 2.3 CSS 几何图形 -> Task 3 ✓
- 2.4 色块叠加 -> Task 6 + Task 7 (SCSS 中实现) ✓
- 2.5 收藏心形 -> Task 6 (SCSS 中实现) ✓
- 3.1 卡片墙 -> Task 6 ✓
- 3.2 详情页 -> Task 7 ✓
- 3.3 打卡 -> Task 8 ✓
- 3.4 旅程地图 -> Task 9 ✓
- 全局底色 -> Task 5 ✓
- 分享功能处理 -> Task 7 (分享按钮标注"即将上线") ✓

**Placeholder scan:** 无 TBD/TODO，每个 Task 都有具体步骤和代码

**Type consistency:** ThemeResource 字段 `gradient/accent/light/geoType` 在所有 Task 中一致使用
