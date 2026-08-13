# evangong.tech 技术与设计分析文档

> 生成日期：2026-06-29  
> 分析对象：当前仓库主干代码（commit 截至 2026-06-29 的性能优化阶段）  
> 用途：为后续开发建立设计规范与技术连贯性基线，避免破坏既有视觉一致性与性能成果。

---

## 一、概述

`evangong.tech` 是 **Evan Gong 的个人作品集网站**，定位为 **沉浸式 3D 驱动的单页滚动作品集**。它通过大量 WebGL/Three.js 背景特效、玻璃拟态（Glassmorphism）控件、滚动驱动动画构建“科技感 + 未来感”的视觉语言，同时以黑白青三色极简配色保持内容可读性。

- **部署形态**：纯前端静态站点，**无后端、无数据库、无外部 API 集成**（仅第三方 CDN 字体与 Simple Icons CDN）。
- **核心叙事**：单页向下滚动，分 section 递进——Hero 自我介绍 → 兴趣跑马灯 → About 自述 → 项目堆叠卡片 → 工具品牌墙 → 视觉聚焦 → 摄影海报 → 摄影菜单 → 透视镜片 → 联系区 → 页脚。
- **组件来源**：基于 [React Bits](https://www.reactbits.dev/) 组件库，但 **以本地源码形式集成**（`react-bits` 未作为 npm 依赖安装），便于按需适配与排障。

---

## 二、设计规范摘要

### 2.1 视觉风格

| 维度 | 定位 |
|---|---|
| 整体风格 | **暗黑科技 / 未来主义**，强沉浸感、强动效 |
| 视觉重心 | 全屏 WebGL 背景（粒子、高速通道、物理挂绳）承担“Wow Factor” |
| 容器语言 | **Glassmorphism 玻璃拟态**（`GlassSurface` / `FluidGlass` / `GradualBlur`）+ 实色卡片交替 |
| 排版语言 | 超大字号、负字距、超粗字重（900）与超细字重（300）强对比 |
| 动效语言 | 滚动驱动（GSAP ScrollTrigger / Lenis）、磁吸交互、文字洗牌/闪光/压力变形 |
| 留白 | 大间距 + `clamp()` 流体留白，section 间以 1px 青色低透明分隔线区隔 |

### 2.2 配色方案

设计 Token 定义于 [index.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/index.css)，全站 `color-scheme: dark`。

| 角色 | 变量 | 色值 | 应用规则 |
|---|---|---|---|
| 主色（强调） | `--color-cyan` | `#00f0ff` | 唯一强调色。用于标题/关键词、卡片底（青卡）、标签文字、按钮焦点描边、分隔线（`rgba(0,240,255,0.08~0.1)`）、悬停高亮（`rgba(0,240,255,0.12)`）、`::selection` 选区、3D 粒子/灯光色 |
| 背景色 | `--color-black` | `#000000` | 全站背景（`html`/`body`/`.app`），玻璃控件采样源 |
| 前景色 | `--color-white` | `#ffffff` | 正文/标题默认色、白色卡片底、玻璃高光与边框（`rgba(255,255,255,0.05~0.5)` 多档） |
| 中性色 | `--color-gray` | `#9c9c9c` | **仅作为 Token 定义，当前未被任何 CSS 引用**；3D 粒子中以 hex `0x9c9c9c` 形式使用 |

**色彩应用规则：**
1. **三色体系**：黑（背景）/ 白（前景）/ 青（强调），禁止引入第四种主色。
2. **唯一例外**：[BorderGlow.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/BorderGlow/BorderGlow.css) 使用 hsla 多彩径向/锥形渐变（紫粉绿青黄橙），但 **仅限于 LensesShowcase 单个 section 的描边光晕**，属局部装饰，不外溢。
3. **透明度层级**：分隔线 0.08–0.1 → 悬停 0.12 → 边框 0.55–0.6 → 投影 0.15–0.18；玻璃层以多档白色 rgba 叠加营造深度。
4. **内联色与 Token 并存**：`App.jsx` 大量内联传 `#00f0ff`（如 `ScrollVelocity`、`TrueFocus`、`StaggeredMenu` 的 `menuButtonColor`/`accentColor`/`colors`），3D 组件用 hex int `0x00f0ff`。后续新增强调色应统一引用 `var(--color-cyan)` 或 `#00f0ff`。

### 2.3 字体

三字体家族，全部通过 [index.html](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/index.html) 的 Google Fonts `<link>` + `preconnect` 并行加载（CSS 内无 `@import`，避免渲染阻塞链）。

| 字体 | 权重 | 用途 |
|---|---|---|
| **Inter** | 300/400/500/600/700/800/900 | 全站默认正文与标题字体（`html` 继承），覆盖几乎所有 UI 文本 |
| **IBM Plex Mono** | 500/600 | 等宽字体，**仅** `ASCIIText` 组件使用（canvas 文字） |
| **Roboto Flex** | 可变 100–1000 | 可变字体，**仅** `TextPressure` 组件压力变形文字使用 |

### 2.4 布局结构与交互模式

- **布局**：固定式全屏菜单（`StaggeredMenu`，右侧抽屉）+ `<main>` 纵向流式 section 堆叠。section 最大宽度 1100–1400px 居中。
- **滚动**：`ScrollStack` 集成 **Lenis 平滑滚动** + `useWindowScroll`；其余 section 用原生滚动 + GSAP ScrollTrigger。
- **交互模式**：
  - 滚动驱动揭示/堆叠/速度文字（`ScrollReveal` / `ScrollStack` / `ScrollVelocity`）。
  - 磁吸按钮（`Magnet`，`disabled` 布尔 prop 控制开关）。
  - 悬停触发文字洗牌（`Shuffle` `triggerOnHover`）。
  - 鼠标跟随粒子（`Ballpit` `followCursor`）。
- **可访问性**：`aria-label` 覆盖所有 section 与图标链接；`focus-visible` 青色描边；`prefers-reduced-motion` 关闭 `LogoLoop`/`SectionFallback` 动画。

---

## 三、技术栈清单

### 3.1 前端框架与库

| 类别 | 技术 | 版本 | 说明 |
|---|---|---|---|
| UI 框架 | React | 19.2 | StrictMode 开启（dev 双挂载，需注意 WebGL 初始化竞态） |
| 构建工具 | Vite | 8.1 | ES2020 target，`manualChunks` 分包；展示图片由 `scripts/protect-images.mjs` 预处理 |
| React 插件 | @vitejs/plugin-react | 6.0 | 基于 Oxc |
| 样式方案 | 原生 CSS | — | 组件级 CSS 文件 + 全局 Token，**无 Tailwind / CSS-in-JS** |
| Lint | oxlint | 1.69 | 配置 `.oxlintrc.json` |
| 类型系统 | 无 TypeScript | — | `.jsx` + `@types/react` 仅做编辑器提示 |

### 3.2 3D / 动画 / 滚动

| 库 | 版本 | 用途（使用组件） |
|---|---|---|
| three | 0.185 | Lanyard / ASCIIText / FluidGlass / PixelBlast / Hyperspeed / Ballpit |
| @react-three/fiber | 9.6 | Lanyard / FluidGlass（Canvas、useFrame、useThree） |
| @react-three/drei | 10.7 | Lanyard（useGLTF / useTexture / Environment / Lightformer） |
| @react-three/rapier | 2.2 | Lanyard（物理绳索：BallCollider / RigidBody / 关节） |
| postprocessing | 6.39 | Hyperspeed（Bloom/SMAA）、PixelBlast（EffectComposer） |
| meshline | 3.3 | Lanyard（挂绳线条） |
| maath | 0.10 | FluidGlass（easing 缓动） |
| gsap | 3.15 | SplitText / ScrollStack / Shuffle / ScrollReveal / FlowingMenu / StaggeredMenu |
| motion (motion/react) | 12.42 | TrueFocus / RotatingText / ShinyText |
| lenis | 1.3 | ScrollStack 平滑滚动 |
| ogl | 1.0 | FlyingPosters（WebGL 海报）、SideRays（背景光线） |

### 3.3 后端 / 数据库 / API

**无**。纯静态站点。外部资源仅：
- Google Fonts CDN（字体）
- `cdn.simpleicons.org`（LogoLoop 品牌图标 SVG，按 slug + 颜色取图）

### 3.4 资源管线

- 图片：网站引用固定路径上的受保护展示衍生图；`scripts/protect-images.mjs` 使用 `sharp` 将照片限制到 1600px 长边、重新压缩、写入版权元数据并叠加署名水印。原图不在仓库中。
- 3D 模型：`card.glb`（Lanyard 挂牌，2.3MB）经 `assetsInclude: ['**/*.glb']` 纳入构建。
- 字体：`<link rel="preconnect">` + 并行 `stylesheet`，取代旧 CSS `@import` 链。

---

## 四、代码结构评估

### 4.1 文件组织

采用 **组件 = 文件夹** 约定：`src/components/<ComponentName>/<ComponentName>.jsx` + 同名 `.css` 共置。结构清晰、易定位。

```
evangong.tech/
├── index.html              # 入口 HTML（字体 preconnect / link）
├── vite.config.js          # React、资源纳入与分包策略
├── package.json
├── public/                 # favicon.svg, icons.svg, assets/
├── Photography/            # 摄影展示衍生图（按地域子目录），原图在仓库外
└── src/
    ├── main.jsx            # createRoot + StrictMode + gsap.ticker 配置
    ├── App.jsx             # 唯一组合根：section 顺序、lazy、菜单数据、品牌数据
    ├── App.css             # 全局 section 布局 + 响应式断点（非组件级样式）
    ├── index.css           # 全局 Token（颜色/字体）+ reset + ::selection
    ├── assets/             # EvanGongIcon.png、lanyard/
    └── components/
        ├── _perf/          # 性能工具：VisibilityMount / useVisibilityPause / SectionFallback
        ├── ErrorBoundary.jsx
        ├── Hero/           # 自定义 section（聚合 Ballpit+Lanyard+Shuffle+...）
        ├── Footer/         # 自定义 section
        ├── ContactShowcase/# 自定义 section
        ├── LensesShowcase/ # 自定义 section
        ├── FlyingPosters/  # React Bits + 自定义 Section 包装
        ├── LogoLoop/       # 自定义（无限滚动 logo 轨道）
        └── (其余均为 React Bits 本地源码组件)
```

### 4.2 模块化程度

- **组合根单一**：[App.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) 是唯一的 section 编排处，数据（菜单项、品牌列表、reveal 文案关键词）与布局同文件，便于通览。
- **组件复用**：`ErrorBoundary` 被 5+ 个 WebGL 组件复用；`_perf` 工具被 3D section 复用；`VisibilityMount`（卸载式）与 `useVisibilityPause`（挂载+门控 rAF 式）两套可见性策略按组件特性选用。
- **关注点分离**：视觉组件（React Bits）不关心业务数据，section 包装组件（`Hero`/`Footer` 等）负责数据组装与布局。CSS 按组件/全局双层分离。

### 4.3 代码规范与注释

- **注释质量高**：关键决策均有注释说明“为什么”，例如 `vite.config.js` 分包理由、`App.jsx` 的 `buildRevealChildren` 关键词着色逻辑、`VisibilityMount` 与 `useVisibilityPause` 的差异对比、`App.css` 中后代选择器特异性说明（解决 lazy 加载后 CSS 注入顺序导致字号被覆盖的坑）。
- **规范执行点**：组件 CSS 必须与组件同目录；强调色统一 `#00f0ff`；`Magnet` 用布尔 `disabled` 控制磁吸；`StaggeredMenu` 的 `.sm-prelayers` 必须含 `right: 0`。
- **未使用组件**：`PixelBlast`、`ShuffleText`、`SideRays` 当前未被引用，属保留资产。

### 4.4 顶层渲染顺序（App.jsx）

```
StaggeredMenu (fixed, eager)
└─ main
   ├─ Hero (eager) ─ Ballpit + Shuffle + RotatingText + Lanyard + GradualBlur + GlassSurface×2
   ├─ ScrollVelocity (lazy) ─ 兴趣跑马灯
   ├─ ScrollReveal (lazy) ─ About 自述（关键词青色着色）
   ├─ ScrollStack (eager) ─ 5 张项目堆叠卡（青/白交替）
   ├─ LogoLoop ×3 (lazy) ─ Programming / Photography / AI 品牌墙
   ├─ TrueFocus (lazy) ─ 聚焦文字
   ├─ FlyingPostersSection (lazy, +ErrorBoundary) ─ 摄影海报
   ├─ FlowingMenu (lazy) ─ 摄影全屏菜单
   ├─ LensesShowcase (lazy) ─ TextPressure + BorderGlow + FluidGlass
   ├─ ContactShowcase (lazy) ─ Hyperspeed + ASCIIText + SplitText + ShinyText + Magnet×2
   └─ Footer (lazy) ─ MetallicPaint logo + 社交图标
```

---

## 五、响应式实现

### 5.1 断点策略

移动优先 + `max-width` 下探（仅 `ScrollVelocity` 用 `min-width: 768px` 桌面放大）。流体排版用 `clamp()`。

| 断点 | 次数 | 主要适配 |
|---|---|---|
| **768px**（主断点） | 9 | Hero 改纵向居中、Lanyard 缩小为相对定位；多 section 字号/padding 收缩；ScrollStack 卡片改纵向；LogoLoop 竖排标签改横排；Footer/Contact 改纵向 |
| **480px** | 6 | 字号再降一档；Hero 按钮改纵向；卡片圆角/padding 缩小；Footer 图标缩小 |
| **1024px** | 2 | Hero padding/Lanyard 宽收窄；StaggeredMenu 面板撑满 |
| **900px** | 1 | Contact 双列改单列，Hyperspeed 区块上移（order:-1）、固定 280px 高 |
| **640px** | 1 | StaggeredMenu 面板撑满兜底 |

### 5.2 偏好查询

- `prefers-reduced-motion`：`SectionFallback`、`LogoLoop` 关闭动画。
- `prefers-color-scheme: dark`：`LogoLoop` fadeColor 切 `#0b0b0b`；`GlassSurface` 调整玻璃透明度与边框。

### 5.3 流体排版示例

```css
.hero-title { font-size: clamp(4rem, 10vw, 10rem); }      /* 标题 */
.scroll-reveal-container__text { font-size: clamp(3rem, 7vw, 6.5rem); }
.scroll-velocity-section .scroller { /* 768px:2.25rem → 480px:1.75rem */ }
```

---

## 六、性能表现

### 6.1 Lighthouse 指标（优化后）

| 指标 | 数值 | 评分 |
|---|---|---|
| Performance | — | **0.76**（基线 0.63） |
| FCP | 1.9 s | 0.33 |
| LCP | 2.6 s | 0.43 |
| TBT | 0 ms | 1.0 |
| CLS | 0 | 1.0 |
| Speed Index | 1.9 s | 0.66 |
| TTI | 2.6 s | 0.87 |
| Accessibility | — | 0.92 |
| Best Practices | — | 0.96 |
| SEO | — | 0.83 |
| 总传输量 | 2,221 KiB | — |

### 6.2 构建产物分块（dist/assets，按体积）

| 文件 | 体积 | 说明 |
|---|---|---|
| `vendor-r3f-*.js` | **3.1 M** | R3F + drei + rapier（含 WASM 物理），最大瓶颈 |
| `card.glb` | 2.3 M | Lanyard 挂牌 3D 模型 |
| `index-*.js` | 242 K | 应用主 chunk |
| `vendor-three-*.js` | 170 K | three + postprocessing + meshline + maath |
| `vendor-gsap-*.js` | 125 K | gsap |
| `vendor-motion-*.js` | 119 K | motion |
| `vendor-ogl-*.js` | 51 K | ogl |
| `vendor-lenis-*.js` | 19 K | lenis |
| `index-*.css` | 17 K | 全局样式 |
| 图片 | 30–248 K/张 | WebP，已按用途分档压缩 |
| **dist 总计** | **8.0 M** | — |

### 6.3 已实施优化策略

1. **Vendor 分包**（[vite.config.js](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/vite.config.js)）：R3F/three/gsap/motion/ogl/lenis 各自独立缓存 chunk，独立并行拉取。
2. **首屏关键路径**：`Hero`/`StaggeredMenu`/`ErrorBoundary` eager，其余 section 全部 `React.lazy` + `Suspense` + `SectionFallback`（按 section 硬编码 `minHeight` 防 CLS）。
3. **可见性卸载**：`VisibilityMount` 对原生 rAF 无法暂停的 WebGL 组件（Hyperspeed/ASCIIText）做 **进入视口才挂载、远离即卸载**，释放 WebGL 上下文。
4. **可见性门控**：`useVisibilityPause` 对可暂停组件（Ballpit/FlyingPosters）保持挂载但用 `IntersectionObserver` + `visibilitychange` 门控 rAF。
5. **图片保护**：`scripts/protect-images.mjs` 生成 1600px 长边以内的带署名展示衍生图，并输出 SHA-256 清单；原图仅保存在仓库外备份中。
6. **内存泄漏修复**：`Ballpit`/`FlyingPosters` 等补齐 dispose 与 `disposed` 标志；`Hyperspeed` 异步初始化加 `disposed` 检查防 StrictMode 双挂载竞态。
7. **事件节流**：resize/mousemove 节流。
8. **GSAP**：`gsap.ticker.lagSmoothing(false)`（[main.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/main.jsx)），避免标签后台化后恢复时单帧跳变长任务。

### 6.4 潜在瓶颈

- **`vendor-r3f` 3.1M** 与 **`card.glb` 2.3M** 是体积大头，首屏 LCP/FCP 评分仍偏低（0.33/0.43），根因在 Hero 即需 Three.js + 物理引擎 + GLB。
- **TBT 已为 0**，主线程长任务已通过可见性门控基本消除。
- **WebGL 硬依赖**：无 WebGL 2.0 的环境（无头预览、旧设备）3D 组件会崩，已由 `ErrorBoundary` 兜底降级（静默卸载子树，兄弟存活）。
- **无头预览 HMR** 对 `Ballpit`/`Lanyard` 不可靠，须真实浏览器（Chrome/Safari）验证。

---

## 七、开发注意事项（硬约束与约定）

> 以下规则源自项目累积的工程约定与踩坑教训，后续开发须严格遵守以保持一致性与稳定性。

### 7.1 设计一致性

1. **配色三色制**：黑/白/青（`#00f0ff`），禁止引入第四主色；新增强调色引用 `var(--color-cyan)` 或 `#00f0ff`；3D 色用 hex int `0x00f0ff`。
2. **字体层级**：正文/标题 Inter；等宽仅 ASCIIText 用 IBM Plex Mono；可变压力字仅 TextPressure 用 Roboto Flex。
3. **字号层级**：`ScrollVelocity` > `ScrollReveal` > 正文。`Hero` 标题用最粗 900 + 负字距；`ScrollReveal` 桌面每行 ≤4 词。
4. **卡片色交替**：`ScrollStack` 项目卡青/白交替（`project-card--cyan` / `project-card--white`），前景统一黑字。
5. **Footer 占比**：约 1/3 屏高（`min-height: 33vh`），社交图标桌面 60–84px / 移动 56px；悬停保留“变青 + 边框 + 背景 + scale 1.08”，**去除 box-shadow 辉光**。
6. **联系区按钮**：胶囊形（`border-radius: 999px`）+ 半透明背景 + `backdrop-blur`；`.contact-actions` 与 `.contact-magnets` 须 `flex-wrap: wrap`（≤900px 换行）；magnet 悬停背景过渡到 `rgba(0,240,255,0.12)` + 青色边框。

### 7.2 组件使用约定

1. **React Bits 组件严格遵循官方实现**：禁止自定义魔改（如曾因反转 FlyingPosters 滚动方向导致渲染失败）。
2. **`Magnet`** 必须用官方实现，通过布尔 `disabled`（true/false）控制磁吸，`magnetStrength` 默认 2（官方值）。
3. **`StaggeredMenu`** 的 `.sm-prelayers` 必须含 `right: 0`，否则背景定位错乱。
4. **`ScrollStack`** 必须用 `useWindowScroll` + Lenis 的窗口滚动驱动堆叠。
5. **WebGL 组件**一律外包 `ErrorBoundary`，防止上下文丢失导致整树卸载。
6. **3D 组件异步初始化**须加 `disposed`/`cancelled` 标志检查，规避 React 19 StrictMode dev 双挂载竞态（`Hyperspeed` 已是范例）。
7. **Safari 兼容**：不支持 SVG displacement map 的 Liquid GLASS 组件需降级到 `backdrop-blur`。
8. **组件级 CSS** 必须与组件同目录创建；全局 section 布局进 `App.css`；Token 进 `index.css`。

### 7.3 性能与构建约定

1. **新 section 默认 lazy**：首屏以下一律 `lazy()` + `Suspense` + `SectionFallback`（按实际高度设 `minHeight` 防 CLS）。
2. **重型 WebGL section**：用 `VisibilityMount`（卸载式）或 `useVisibilityPause`（门控式）按可见性管理 rAF，禁止常驻后台循环。
3. **图片**：放入受保护展示目录并运行 `npm run images:protect -- --apply`；不要把相机原图加入仓库或直接发布。
4. **CSS 特异性**：lazy 组件的 CSS 注入晚于首屏，覆写组件默认样式时用 **后代选择器提升特异性**（见 `App.css` 的 `.scroll-reveal-container__title .scroll-reveal-container__text` 注释范例），勿依赖同特异性源码顺序。
5. **版本控制**：改动后直接提交 `main` 分支并推送（用户偏好，不开 feature 分支）。
6. **验证**：3D 组件与 TBT 须在 Chrome/Safari 真实浏览器验证，无头环境无法准确测试 WebGL 与长任务。

---

## 八、附录：组件清单速查

| 组件 | 类型 | 来源 | 渲染位置 |
|---|---|---|---|
| StaggeredMenu | React Bits (GSAP) | 本地 | 顶层固定菜单 |
| Hero | 自定义 section | — | 顶层 |
| Ballpit | React Bits (Three) | 本地 | Hero 背景 |
| Shuffle | React Bits (GSAP) | 本地 | Hero 标题 |
| RotatingText | React Bits (motion) | 本地 | Hero 副标题 |
| Lanyard | React Bits (R3F+Rapier) | 本地 | Hero 右侧 |
| GradualBlur | React Bits | 本地 | Hero 顶部遮罩 |
| GlassSurface | React Bits (毛玻璃) | 本地 | Hero 按钮 |
| ScrollVelocity | React Bits (motion) | 本地 | 兴趣跑马灯 |
| ScrollReveal | React Bits (GSAP) | 本地 | About 自述 |
| ScrollStack | React Bits (GSAP+Lenis) | 本地 | 项目堆叠 |
| LogoLoop | 自定义 | — | 品牌墙 ×3 |
| TrueFocus | React Bits (motion) | 本地 | 聚焦文字 |
| FlyingPosters / Section | React Bits (OGL) + 包装 | 本地 | 摄影海报 |
| FlowingMenu | React Bits (GSAP) | 本地 | 摄影全屏菜单 |
| LensesShowcase | 自定义 section | — | 透视镜片 |
| TextPressure | React Bits (Three) | 本地 | Lenses 标题 |
| BorderGlow | React Bits | 本地 | Lenses 描边 |
| FluidGlass | React Bits (R3F) | 本地 | Lenses 玻璃 |
| ContactShowcase | 自定义 section | — | 联系区 |
| Hyperspeed | React Bits (Three+postprocessing) | 本地 | Contact 背景 |
| ASCIIText | React Bits (Three) | 本地 | Contact 右侧 |
| SplitText | React Bits (GSAP) | 本地 | Contact 标题 |
| ShinyText | React Bits (motion) | 本地 | Contact 邮箱 |
| Magnet | React Bits (motion) | 本地 | Contact 按钮 ×2 |
| Footer | 自定义 section | — | 页脚 |
| MetallicPaint | React Bits (canvas) | 本地 | Footer logo |
| ErrorBoundary | 自定义工具 | — | 复用 |
| _perf/* | 自定义工具 | — | 复用 |
| PixelBlast / ShuffleText / SideRays | React Bits | 本地 | **当前未引用**（保留） |
