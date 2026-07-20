# 足迹手帐 · UI 重设计与功能深化设计文档

> 日期：2026-07-11
> 状态：已确认方案，待编写实现计划

## 1. 背景与问题诊断

### 1.1 当前 UI 核心问题

| 问题 | 根因 | 影响 |
|------|------|------|
| 插画比例失真 | COS 横版插画(1024×768)被塞进卡片缩略图和详情封面后裁剪变形 | 视觉丑陋，用户不满意 |
| 装饰元素混搭 | 云朵/星星/月亮/爱心等装饰跨主题通用，与主题色不协调 | 画面杂乱无焦点 |
| 构图层次缺失 | 首字徽章+插画+装饰+角落卡片同时出现在小区域 | 元素互相干扰 |
| 缺乏纸质温度 | 产品定位是"手帐"，但界面是标准 App 风格 | 缺少手账特有质感 |
| 图标过小 | 搜索/收藏/反馈等图标尺寸不足 | 用户难以发现和点击 |

### 1.2 约束条件

- 分享功能因个人主体暂不上线，但保留 `share-place` 页面代码，仅隐藏入口
- COS 上的素材资源有限（仅 6 组主题插画 + 6 个装饰图），且横版插画不适用
- 微信小程序代码包体积限制 2MB
- 不使用 emoji 作为主要视觉元素（用户明确要求）

## 2. 设计方案：B+D 组合 — CSS 几何图形 + 色块叠加

### 2.1 设计原则

1. **一主题一渐变一图形**：每个主题有独特的渐变色 + CSS 绘制几何图形
2. **零图片依赖**：所有视觉效果用纯 CSS 实现，不引用任何远程或本地图片
3. **手账纸质底纹**：全局 `#faf6f1` 米白底色
4. **统一圆角语言**：卡片 20rpx / 按钮 100rpx / 标签 100rpx
5. **大量留白**：信息区间距充足，呼吸感强

### 2.2 主题系统重构

移除 `theme-config.ts` 中的 `illustUrl` 和 `decoUrl` 远程图片引用，每主题改为：

| 主题ID | 渐变色 | CSS 几何图形 | accent 色 | light 底色 |
|--------|--------|-------------|-----------|-----------|
| night | `#a8a8d0 → #7c7cb8` | 月亮（圆+内阴影偏移） | `#5a5a8e` | `#e8e8f5` |
| coffee | `#f5deb3 → #d4a96a` | 咖啡杯环（圆环+顶部手柄） | `#8b6914` | `#fdf5e6` |
| park | `#c8e6c9 → #81c784` | 叶子（圆角不对称四边形） | `#2e7d32` | `#e8f5e9` |
| gather | `#e1bee7 → #ce93d8` | 双圆叠加（两个半透明圆） | `#7b1fa2` | `#f3e5f5` |
| stay | `#ffe0b2 → #ffb74d` | 房屋（三角顶+方形身） | `#e65100` | `#fff3e0` |
| exhibit | `#b3e5fc → #64b5f6` | 相框（方形边框+内圆） | `#1565c0` | `#e3f2fd` |

### 2.3 CSS 几何图形实现规范

所有图形通过 CSS 属性绘制，不使用图片：

```
geo-night  → border-radius:50% + inset box-shadow 偏移造月牙效果
geo-coffee → border-radius:50% + border 做杯环 + ::after 做手柄
geo-park   → border-radius:0 100% 0 100% + rotate 做叶形
geo-gather → ::before + ::after 两个半透明圆叠加
geo-stay   → border 三角形 + ::after 矩形做房屋
geo-exhibit→ border 方框 + ::after 内圆做画框
```

### 2.4 色块叠加规范

在渐变背景上叠加半透明圆形色块，增加层次感：

- 右上角：120rpx 圆形，`rgba(255,255,255,0.2)`，偏移 -30rpx
- 左下角：60rpx 圆形，`rgba(255,255,255,0.12)`，偏移 -10rpx

### 2.5 收藏心形图标

用 CSS `::before` + `::after` 绘制心形（两个圆角矩形旋转 45°），颜色跟随主题 accent 色。

## 3. 页面设计

### 3.1 卡片墙（pages/cards）

**布局**：
- 顶部：标题"我的地点" + 搜索按钮（44rpx 圆形，CSS 绘制放大镜图标）
- 双列网格，每张卡片高 200rpx
- 卡片结构：渐变视觉区(flex:1) + 白色信息区
- 视觉区：首字徽章(左上) + 心形(右上) + CSS 几何图形(居中) + 色块叠加(伪元素)
- 信息区：地点名(14px/600) + 打卡次数(11px/灰) + 标签(10px/胶囊/主题light色)
- 浮动添加按钮：56rpx 圆形，渐变紫色，右下角
- 反馈按钮：带"反馈"文字标签，112rpx
- 自定义 TabBar：3 个 Tab，CSS 绘制线性图标

**增强功能**：
- 卡片入场动画：交错淡入+上移（stagger 50ms）
- 长按卡片预览弹窗：放大显示封面+标签+最近打卡
- 收藏爱心触觉反馈（vibrateShort）+ 弹跳动画
- 打卡里程碑角标：3/5/10 次显示铜/银/金勋章

### 3.2 地点详情（pages/place-detail）

**封面区**（220rpx 高）：
- 渐变背景 + 色块叠加
- 顶部导航：返回/更多按钮（40rpx 圆形，半透明白底）
- 居中：首字徽章（80rpx）+ 下方 CSS 几何图形（放大 1.3 倍）

**信息区**（上浮 24rpx，圆角覆盖封面底部）：
- 自定义昵称（22px/700）
- 地址（13px/灰）
- 标签组（属性标签 + 场景标签，胶囊形，主题色）
- 统计栏：打卡次数 / 收藏时间 / 标签数
- 记忆时间轴：贴纸风格卡片，彩色圆点 + 白色圆角内容卡

**底部按钮**：
- 打卡（渐变紫，主按钮）
- 分享（描边，次按钮）—— 保留但标注"即将上线"

### 3.3 打卡（pages/checkin）

**珍珠仪式区**：
- 100rpx 珍珠球（径向渐变 + 虚线外圈），可视化"每次打卡给容器多放一颗珍珠"
- 标题"给这颗珍珠写句话"

**心情选择器**：
- 5 个心情选项（44rpx 圆形），选中放大 1.1 倍 + 紫色边框
- 心情数据存入 CheckIn 扩展字段

**输入区**：
- 手账风格白色圆角输入框
- 文字日记（最多 500 字）
- 照片上传（最多 9 张，64rpx 方形）
- 事件标签选择器

**提交动效**：
- 珍珠球缩放+淡出动画
- `Taro.vibrateShort()` 触觉反馈

### 3.4 旅程地图（pages/journey）

**统计卡片**：
- 3 列：地点数 / 打卡数 / 城市数
- 每列不同 accent 色

**地图区**：
- 全屏地图，markers 使用主题色水滴形标记
- 相邻打卡点虚线连接（SVG path 绘制动画）

**底部信息卡**：
- 点击 marker 弹出，显示地点摘要
- 主题色圆形首字 + 名称 + 打卡次数 + 箭头

## 4. 实现路径 · 4 阶段

### 阶段一 · UI 基础重构（核心，最高优先级）

**目标**：彻底解决插画失真问题，建立统一视觉语言

| 任务 | 涉及文件 |
|------|---------|
| 主题系统重构：移除 illustUrl/decoUrl，新增 geo 类名映射 | `theme-config.ts` |
| 新增 CSS 几何图形组件 | `components/ThemeShape/index.tsx` + `.scss` |
| 卡片墙重绘 | `pages/cards/index.tsx` + `.scss` |
| 详情页重绘 | `pages/place-detail/index.tsx` + `.scss` |
| 全局纸质底色 | `app.scss` |
| 搜索按钮 CSS 放大镜图标 | `pages/cards/index.scss` |
| 收藏心形 CSS 绘制 | `pages/cards/index.scss` |
| 自定义 TabBar 图标 CSS 绘制 | `custom-tab-bar/index.tsx` + `.scss` |
| 打卡页珍珠仪式 | `pages/checkin/index.tsx` + `.scss` |
| 旅程地图标记和统计 | `pages/journey/index.tsx` + `.scss` |

### 阶段二 · 卡片墙交互增强

| 任务 | 说明 |
|------|------|
| 卡片入场动画 | CSS animation + animation-delay stagger |
| 长按预览弹窗 | Taro wrapping modal，显示放大卡片 |
| 收藏爱心动效 | CSS keyframes 弹跳 + vibrateShort |
| 打卡里程碑角标 | 打卡次数 >= 3/5/10 显示铜/银/金勋章 |

### 阶段三 · 打卡仪式感

| 任务 | 说明 |
|------|------|
| 心情选择器 | 5 种心情 + 存入 CheckIn 扩展字段 |
| 天气获取 | wx.getWeatherType 或手动选择 |
| 提交动效 | 珍珠缩放淡出 + 粒子散开(CSS) |
| 打卡日签 | Canvas 绘制可保存图片 |
| 连续打卡火焰 | 详情页显示连续天数 + 火焰图标 |

### 阶段四 · 旅程叙事

| 任务 | 说明 |
|------|------|
| 路径连线动画 | SVG path stroke-dashoffset 动画 |
| 时间滑块 | 拖动回放历史打卡轨迹 |
| 城市点亮 | 首次打卡城市显示点亮动效 |
| 旅程年报 | Canvas 生成年度足迹总结图 |

## 5. 数据模型扩展

### 5.1 CheckIn 扩展字段

```typescript
interface CheckInDto {
  // 现有字段...
  mood?: string;        // 心情：happy/love/calm/think/sleepy
  weather?: string;     // 天气：sunny/cloudy/rainy/snowy
}
```

### 5.2 ThemeResource 重构

```typescript
interface ThemeResource {
  id: string;
  gradient: string;     // CSS 渐变
  accent: string;       // 主题强调色
  light: string;        // 浅色背景（标签底色）
  geoType: string;      // 几何图形类型：night/coffee/park/gather/stay/exhibit
  // 移除：illustUrl, decoUrl, emoji, deco, bg, iconBg, iconColor
}
```

## 6. 组件设计

### 6.1 ThemeShape 组件

```typescript
// components/ThemeShape/index.tsx
interface ThemeShapeProps {
  geoType: 'night' | 'coffee' | 'park' | 'gather' | 'stay' | 'exhibit';
  size?: number;  // rpx，默认 72
}
```

纯 CSS 组件，根据 geoType 渲染对应几何图形。零图片依赖。

### 6.2 CSS 心形图标

用 `::before` + `::after` 两个旋转圆角矩形绘制，颜色通过 `currentColor` 继承父级。

## 7. 视觉规范

### 7.1 颜色系统

| 用途 | 色值 |
|------|------|
| 全局底色 | `#faf6f1` |
| 卡片背景 | `#ffffff` |
| 主文字 | `#2d3436` |
| 次文字 | `#999999` |
| 分割线 | `#eeeeee` |
| 主按钮渐变 | `#6366f1 → #818cf8` |
| 标签底色 | 主题 light 色 |
| 标签文字 | 主题 accent 色 |

### 7.2 尺寸规范

| 元素 | 尺寸 |
|------|------|
| 卡片圆角 | 20rpx |
| 按钮圆角 | 100rpx（胶囊形） |
| 标签圆角 | 100rpx |
| 信息区上浮圆角 | 24rpx |
| 首字徽章（卡片） | 36rpx |
| 首字徽章（详情） | 80rpx |
| 搜索按钮 | 44rpx |
| 浮动添加按钮 | 56rpx |
| 心形图标 | 14rpx（CSS 绘制） |
| TabBar 图标 | 22rpx |

### 7.3 字号规范

| 元素 | 字号 | 字重 |
|------|------|------|
| 页面标题 | 20rpx | 700 |
| 地点名（详情） | 22rpx | 700 |
| 卡片地点名 | 14rpx | 600 |
| 打卡次数 | 11rpx | 400 |
| 标签 | 10-12rpx | 500 |
| 按钮文字 | 15-16rpx | 600 |

## 8. 分享功能处理

- `pages/share-place/` 和 `pages/share-place/index.tsx` 保留代码不删除
- 详情页底部"分享"按钮改为描边样式，标注"即将上线"
- `app.config.ts` 中保留 share-place 路由
- `useShareAppMessage` 保留但不在 UI 中主动引导

## 9. 不在本次范围内

- 后端 API 新增（心情/天气字段需后端配合，阶段三时处理）
- 远程主题配置下发（保持本地配置）
- 语音视频日记（P2）
- 年度回顾（P2）
- 足迹小说 AI 生成（P2）
