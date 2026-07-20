# 足迹手帐 · 新用户引导设计文档

> 日期：2026-07-11
> 状态：已确认方案，待编写实现计划

## 1. 背景与问题

当前新用户登录后面对空白卡片墙，仅看到"还没有收藏任何地点"文字和右下角小浮动按钮，缺乏明确指引。用户不知道能做什么、怎么做、会得到什么，容易流失。

## 2. 设计方案：分步卡片式引导页

### 2.1 设计原则

1. **空状态增强为引导页**：不新增页面、不新增弹窗，直接把卡片墙空状态升级为引导页
2. **零后端依赖**：用本地 Storage 标记是否已看过引导，无需后端改动
3. **纯 CSS 视觉**：所有编号圆、勋章、按钮均用 CSS 绘制，零图片依赖
4. **与现有视觉系统一致**：渐变色、圆角、配色遵循 UI 重设计方案

### 2.2 触发逻辑

**显示条件**（三条同时满足）：
- 用户已登录
- 地点列表为空
- 本地 Storage 中 `zuji_onboarding_done` 不为 `'true'`

**不再显示**：
- 用户点击"收藏第一个地点"按钮 -> 写入 `zuji_onboarding_done = true` -> 跳转地点创建页
- 用户添加了第一个地点后（地点列表不为空）-> 自动写入 `zuji_onboarding_done = true`
- 即使后续删除所有地点，也不会再显示引导（Storage 已标记）

**Storage key**：`zuji_onboarding_done`，值 `'true'`

### 2.3 引导页布局

从上到下依次：

**1. 欢迎区**
- 标题："欢迎使用足迹手帐"（22rpx / 700 / #2d3436）
- 副标题："收藏每一个对你重要的地方，用打卡记录你与它的故事"（14rpx / #888）

**2. 分步引导区**（3 步竖向卡片）
- Step 1：紫色渐变编号圆 ① + "收藏第一个地点" + "点击右下角 + 号，标记一个对你重要的地方" + 向右箭头
- Step 2：金色渐变编号圆 ② + "给它打个卡" + "写下此刻的心情，附上照片，留下珍珠般的记忆"
- Step 3：绿色渐变编号圆 ③ + "查看你的旅程地图" + "在「发现」页看到所有足迹连成的旅程"

编号圆 36rpx，渐变色与 3 个主题色对应：
- ① `linear-gradient(135deg, #a8a8d0, #7c7cb8)`（night 主题色）
- ② `linear-gradient(135deg, #f5deb3, #d4a96a)`（coffee 主题色）
- ③ `linear-gradient(135deg, #c8e6c9, #81c784)`（park 主题色）

**3. 成就勋章预告区**（紫色渐变背景卡片）
- 标签"成就目标"（12rpx / #7b1fa2 / 600）
- 3 个勋章横排：
  - 铜色"初识"：收藏 3 个地点
  - 银色"足迹"：收藏 5 个地点
  - 金色"漫游者"：收藏 10 个地点
- 勋章用 CSS 渐变圆（44rpx）+ 数字 + 名称 + 需求文字
- 背景 `linear-gradient(135deg, #f3e5f5, #e1bee7)`

**4. 主行动按钮**
- "收藏第一个地点"（渐变紫色 `#6366f1 -> #818cf8` 胶囊形，全宽，52rpx 高）
- 点击行为：`Taro.setStorageSync('zuji_onboarding_done', 'true')` -> `Taro.navigateTo({ url: '/pages/place-create/index' })`

**5. 非引导空状态**
- 当 `zuji_onboarding_done` 为 `true` 但地点仍为空时，显示简化空状态
- 现有装饰圆形 + "还没有收藏任何地点" + "去标记第一个对你重要的地方吧"

### 2.4 视觉规范

| 元素 | 规格 |
|------|------|
| 编号圆 | 36rpx，CSS 渐变，白色数字 16rpx/700 |
| 步骤标题 | 15rpx / 600 / #2d3436 |
| 步骤描述 | 13rpx / #888 / line-height 1.5 |
| 勋章圆 | 44rpx，CSS 渐变（铜/银/金），白色数字 |
| 勋章名称 | 10rpx / #666 |
| 勋章需求 | 9rpx / #aaa |
| 主按钮 | 52rpx 高，100rpx 圆角，渐变紫色 |
| 成就卡圆角 | 16rpx |

## 3. 涉及的文件

| 操作 | 文件路径 | 改动内容 |
|------|---------|---------|
| 修改 | `apps/miniapp/src/pages/cards/index.tsx` | 新增引导判断逻辑、引导页渲染、Storage 标记 |
| 修改 | `apps/miniapp/src/pages/cards/index.scss` | 新增引导页样式 |

无需新增组件、新增页面、修改后端。

## 4. TSX 改动详情

### 4.1 新增状态

```typescript
// 是否为新用户（需要显示引导）
const isOnboarding = !Taro.getStorageSync('zuji_onboarding_done');
```

### 4.2 空状态分支

```tsx
{places.length === 0 ? (
  isOnboarding ? (
    // 引导页
    <View className='cards__onboarding'>...</View>
  ) : (
    // 简化空状态（现有）
    <View className='cards__empty-wrap'>...</View>
  )
) : (
  // 卡片网格（现有）
  <View className='cards__grid'>...</View>
)}
```

### 4.3 引导按钮处理

```typescript
const handleStartOnboarding = () => {
  Taro.setStorageSync('zuji_onboarding_done', 'true');
  Taro.navigateTo({ url: '/pages/place-create/index' });
};
```

### 4.4 自动标记

在 `loadPlaces` 成功且 `places.length > 0` 时：
```typescript
if (res.list.length > 0) {
  Taro.setStorageSync('zuji_onboarding_done', 'true');
}
```

## 5. 不在本次范围内

- 旅程地图页面的空状态引导（后续迭代）
- 合集页面的空状态引导（后续迭代）
- 遮罩式功能引导 / Coachmark（后续迭代）
- 后端新用户标识（不需要，本地 Storage 已满足）
- 成就系统后端实现（本次仅展示预告，不实现实际勋章逻辑）
