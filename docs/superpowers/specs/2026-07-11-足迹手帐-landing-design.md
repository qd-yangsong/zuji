# 足迹手帐 · 单页面介绍网站设计文档

> 创建日期：2026-07-11  
> 版本：v1.0（定稿版）  
> 形态：响应式单页面网站（HTML/CSS/JS）  
> 关联产品：[足迹手帐小程序设计文档](2026-06-17-足迹手帐-design.md)

---

## 一、项目概述

### 1.1 目标
为「足迹手帐」微信小程序设计一个**风格一致、情感化、杂志式**的单页面介绍网站，用于品牌展示、产品说明与引流下载。

### 1.2 核心定位
- **一句话**：地点是记忆的容器。
- **气质**：温暖、年轻、有仪式感，像一本可以翻阅的产品画册。
- **设计关键词**：杂志式排版、插画驱动、柔和渐变、全屏滚动、微动效。

### 1.3 目标受众
- 18-35 岁热爱生活记录的年轻人
- 对咖啡馆、旅行、城市探索有情感共鸣的潜在用户
- 通过分享链接/二维码首次接触产品的访客

---

## 二、页面结构与信息架构

网站采用**单页滚动式杂志结构**，共 7 个全屏/近全屏章节：

| 序号 | 章节 ID | 中文名 | 功能与内容 |
|------|---------|--------|------------|
| 1 | `#cover` | 封面 | 品牌 Slogan、一句话价值主张、两个 CTA（翻开手帐 / 扫码体验） |
| 2 | `#intro` | 卷首语 | 感性文案 + 金句卡片，建立情感连接 |
| 3 | `#cards` | 卡片墙 | 介绍首页卡片墙功能，强调「一张卡片一段回忆」 |
| 4 | `#timeline` | 时间轴 | 介绍地点详情页的时间轴/打卡日记 |
| 5 | `#map` | 旅程地图 | 介绍自动聚合的打卡轨迹与旅程回放 |
| 6 | `#future` | 更多产品 | 展示产品矩阵与未来规划 |
| 7 | `#cta` | 封底 | 下载引导、二维码占位、联系方式、footer |

顶部固定导航栏提供锚点跳转（移动端仅展示汉堡菜单图标）。

---

## 三、视觉设计规范

### 3.1 色彩系统

网站色彩与小程序主题配置保持一致，采用「夜/咖/园/聚/宿/展」六组主题色：

| 语义 | Token | 色值 | 使用场景 |
|------|-------|------|----------|
| 夜蓝 | `brand-night` | `#3B4B7A` | 封面背景、强调按钮、产品卡片图标 |
| 咖啡 | `brand-coffee` | `#8B5A2B` | 卷首语主色、标题、正文、标签 |
| 奶油 | `brand-cream` | `#F4E4C1` | 封面光晕、按钮 hover |
| 草绿 | `brand-park` | `#4CAF50` | 卡片墙章节强调色 |
| 薄荷 | `brand-mint` | `#C8E6C9` | 卡片墙章节背景 |
| 紫色 | `brand-gather` | `#9C27B0` | 时间轴章节强调色 |
| 薰衣草 | `brand-lavender` | `#E1BEE7` | 时间轴章节背景 |
| 天蓝 | `brand-sky` | `#B3E5FC` | 旅程地图章节背景 |
| 湖蓝 | `brand-exhibit` | `#03A9F4` | 旅程地图章节强调色 |
| 橘色 | `brand-stay` | `#FF9800` | 远期主题预留 |
| 蜜桃 | `brand-peach` | `#FFE0B2` | 远期主题预留 |

#### 章节背景色具体取值

| 章节 | 背景方式 | 具体值 |
|------|----------|--------|
| 封面 | 纯色 + SVG 光晕 | `bg-brand-night` |
| 卷首语 | 渐变 | `from-[#FDFBF7] via-[#F5EFE6] to-[#EBE3D5]` |
| 卡片墙 | 纯色 + 颗粒 | `bg-brand-mint` |
| 时间轴 | 纯色 + 颗粒 | `bg-brand-lavender` |
| 旅程地图 | 纯色 + 颗粒 | `bg-brand-sky` |
| 更多产品 | 纯色 + 颗粒 | `bg-[#FDFBF7]` |
| 封底 CTA | 深色 + SVG 光斑 | `bg-[#1A1A2E]` |

### 3.2 字体系统

- **标题字体**：`Noto Serif SC`（思源宋体），用于 h1/h2/h3 与金句，营造杂志感与温度。
- **正文字体**：`Noto Sans SC`（思源黑体），用于正文、标签、按钮，保证可读性。
- **手写感金句**：使用宋体 + `font-style: italic` 模拟手帐批注感。

| 元素 | 字号（移动端 / 桌面端） | 字重 | 颜色 |
|------|------------------------|------|------|
| 封面主标题 | `text-4xl` / `text-7xl~8xl` | bold | white |
| 章节大标题 | `text-3xl` / `text-5xl~6xl` | bold | `brand-coffee` / `slate-900` |
| 章节标签 | `text-xs` / `text-sm` | medium | 对应章节强调色 |
| 正文 | `text-base` / `text-lg` | normal | `slate-700` / `brand-coffee/80` |
| 金句 | `text-xl` / `text-3xl` | normal italic | `brand-coffee/90` |

### 3.3 间距与布局

- 每个章节：`min-height: 100vh`，使用 flex 垂直居中。
- 容器最大宽度：`max-w-6xl`（卷首语/更多产品/封底）、`max-w-7xl`（产品页）。
- 水平内边距：`px-5 md:px-6`。
- 垂直内边距：`py-16 md:py-24`。
- 双栏间距：`gap-10 md:gap-16`。
- 卡片圆角：`rounded-[1.5rem]`（移动端）、`rounded-[2rem]`（桌面端）。

### 3.4 通用组件样式

#### 卡片
- 背景：白色或半透明奶油色
- 圆角：`1.5rem ~ 2rem`
- 阴影：`0 25px 80px -20px rgba(0,0,0,0.25)`（`.mockup-shadow`）
- 边框（卷首语金句卡）：`1px solid rgba(232,213,183,0.4)`

#### 标签 pill
- 背景：`bg-white/60`
- 圆角：`rounded-full`
- 字号：`text-xs md:text-sm`
- 颜色：对应章节强调色

#### 按钮
- 主按钮：白底 + 深色字，胶囊形（`rounded-full`）
- 次按钮：透明底 + 白色边框，hover 时 `bg-white/10`

#### 颗粒纹理
- 所有章节均叠加 `.grain` 类，使用 SVG 噪点纹理，opacity 0.04，增加纸质感。

---

## 四、响应式策略

### 4.1 断点
采用 Tailwind 默认断点：
- 默认：移动端（< 768px）
- `md:`：768px 及以上
- `lg:`：1024px 及以上

### 4.2 关键适配

| 模块 | 移动端 | 桌面端 |
|------|--------|--------|
| 导航 | 仅 Logo + 汉堡菜单图标 | 展开全部锚点链接 |
| 封面标题 | 单行变大、换行显示 | 超大字号居中 |
| 卷首语 | 单栏，金句卡片在下 | 双栏，金句卡片在左 |
| 产品页 | 单栏，图片在下 | 双栏，图文左右交替 |
| 更多产品 | 单列卡片 | 三列卡片 |
| 封底 CTA | 二维码与文案垂直堆叠 | 水平排列 |

### 4.3 图片适配
- 插画使用 `object-contain`，保证完整显示。
- 封面插画限制最大高度：`max-h-[30vh] md:max-h-[40vh]`。

---

## 五、动画与交互

### 5.1 页面级交互
- **平滑滚动**：`html { scroll-behavior: smooth; }`
- **锚点跳转**：导航链接指向各章节 ID。

### 5.2 微动效

| 动画名 | 目标元素 | 效果 | 参数 |
|--------|----------|------|------|
| `float` | 封面光晕、星星 | 上下缓慢漂浮 | `5s ease-in-out infinite`，位移 `-12px` |
| `float-delay` | 部分星星/光斑 | 延迟漂浮 | `6s ease-in-out infinite 1s` |

### 5.3 Hover 反馈
- 导航链接：`hover:opacity-70 transition`
- 按钮主按钮：`hover:bg-brand-cream transition`
- 按钮次按钮：`hover:bg-white/10 transition`
- footer 链接：`hover:opacity-100`

### 5.4 性能要求
- 动画元素仅使用 `transform` 与 `opacity`，避免触发重排。
- 插画图片应压缩至合理大小，优先使用 PNG/WebP。

---

## 六、素材清单

素材统一来自 `apps/miniapp/src/assets/` 目录，网站通过相对路径引用：

| 素材 | 路径 | 使用位置 |
|------|------|----------|
| Logo 96px | `../apps/miniapp/src/assets/logo/thumb-96.png` | 导航栏、更多产品卡片 |
| Logo 400px | `../apps/miniapp/src/assets/logo/logo-400.png` | 封底 CTA |
| 城市夜空插画 | `../apps/miniapp/src/assets/theme-illust/night.png` | 封面底部 |
| 咖啡时光插画 | `../apps/miniapp/src/assets/theme-illust/coffee.png` | 卷首语金句卡 |
| 城市公园插画 | `../apps/miniapp/src/assets/theme-illust/park.png` | 卡片墙 |
| 朋友相聚插画 | `../apps/miniapp/src/assets/theme-illust/gather.png` | 时间轴 |
| 展览记忆插画 | `../apps/miniapp/src/assets/theme-illust/exhibit.png` | 旅程地图 |
| 旅程空状态插画 | `../apps/miniapp/src/assets/empty-state/journey.png` | 旅程地图卡片内 |

> 部署前需确保这些素材被复制到网站构建目录，或调整路径为发布后的实际路径。

---

## 七、技术实现要点

### 7.1 技术栈
- **HTML5** 单文件结构
- **Tailwind CSS**（CDN 引入，用于快速样式开发）
- **原生 CSS** 自定义动画与特殊效果
- **Google Fonts** 加载中文字体

### 7.2 文件位置
- 原型文件：`prototype/landing.html`
- 设计文档：`docs/superpowers/specs/2026-07-11-足迹手帐-landing-design.md`

### 7.3 关键实现细节
1. **导航栏可见性**：使用 `mix-blend-difference text-white`，确保在深浅不同背景下都能看清。
2. **全屏章节**：`.magazine-page` 设置 `min-height: 100vh` 与 `scroll-snap-align: start`（后续可增强滚动吸附）。
3. **颗粒纹理**：使用内联 SVG data URI，无需额外请求。
4. **图片路径**：当前为开发期相对路径，部署时需处理为可访问路径。

### 7.4 待后续实现的功能（非 MVP）
- 移动端汉堡菜单展开/收起
- 滚动触发的渐入动画（ScrollReveal / IntersectionObserver）
- 真实小程序二维码替换占位图
- 页面 SEO meta、Open Graph、Schema.org 标记
- 分析埋点（页面浏览、CTA 点击）

---

## 八、部署说明

### 8.1 本地预览
在项目根目录启动静态服务器：

```bash
python3 -m http.server 10090
```

访问：`http://localhost:10090/prototype/landing.html`

### 8.2 生产部署
1. 确认所有图片素材可被公开访问。
2. 将 `prototype/landing.html` 作为入口文件部署到静态托管（如 Vercel、Cloudflare Pages、Nginx）。
3. 建议将 CDN 版本的 Tailwind 替换为构建后的 CSS，以减少运行时依赖与体积。
4. 替换封底「小程序码占位」为真实二维码图片。

---

## 九、定稿确认

- [x] 整体视觉风格与小程序一致
- [x] 卷首语配色已优化为轻盈温暖的杂志内页风格
- [x] 各章节文案已确认感性化、场景化
- [x] 插画素材已接入并正确显示
- [x] 响应式布局覆盖移动端与桌面端

---

## 十、下一步

设计文档审阅通过后，进入 [writing-plans] 阶段，制定详细的开发实施计划。
