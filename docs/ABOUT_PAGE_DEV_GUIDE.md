# About 页面开发理解文档

> 生成日期：2026-07-01
> 分析对象：当前仓库主干代码（HEAD 截至 2026-06-30 性能优化回退后，commit f42c924 之后状态）
> 用途：为 About 页面开发建立权威技术基线，明确所需资源、依赖、技术约束与关键决策点。
> 注意：本文档基于**回退后的真实代码状态**，与 `docs/TECHNICAL_ANALYSIS.md`（描述优化阶段）存在多处偏差，以本文档为准。

---

## 一、项目定位与部署形态

`evangong.tech` 是 **Evan Gong 的个人作品集网站**，定位为 **沉浸式 3D 驱动的单页滚动作品集**。

- **部署形态**：纯前端静态站点，**无后端、无数据库、无 API 集成**。外部资源仅 Google Fonts CDN 与本地 `/public/icons/` SVG。
- **当前架构**：**单页应用（SPA）**，无路由库（无 react-router）。`App.jsx` 是唯一组合根，所有 section 纵向堆叠于 `<main>` 内。
- **核心叙事**：单页向下滚动——Hero → 兴趣跑马灯 → About 自述（ScrollReveal）→ 项目堆叠卡 → 品牌墙 → 聚焦 → 摄影海报 → 摄影菜单 → 透视镜片 → 联系区 → 页脚。

---

## 二、技术栈清单（真实版本）

### 2.1 框架与构建

| 类别 | 技术 | 版本 | 说明 |
|---|---|---|---|
| UI 框架 | React | ^19.2.7 | StrictMode 开启（dev 双挂载，WebGL 初始化需防竞态） |
| 构建工具 | Vite | ^8.1.0 | `vite.config.js` **当前极简**：仅 `react()` 插件 + `assetsInclude: ['**/*.glb']`。**无 manualChunks 分包，无 vite-imagetools 配置**（依赖仍保留在 devDependencies，但未启用） |
| React 插件 | @vitejs/plugin-react | ^6.0.2 | 基于 Oxc |
| 样式方案 | 原生 CSS | — | 组件级 CSS + 全局 Token，**无 Tailwind / CSS-in-JS** |
| Lint | oxlint | ^1.69.0 | 配置 `.oxlintrc.json` |
| 类型系统 | 无 TypeScript | — | `.jsx` + `@types/react` 仅编辑器提示 |
| **路由** | **无** | — | **未安装 react-router 或任何路由库** |

### 2.2 3D / 动画 / 滚动

| 库 | 版本 | 用途 |
|---|---|---|
| three | ^0.185.0 | Lanyard / ASCIIText / FluidGlass / PixelBlast / Hyperspeed / Ballpit |
| @react-three/fiber | ^9.6.1 | Lanyard / FluidGlass |
| @react-three/drei | ^10.7.7 | Lanyard（useGLTF / useTexture / Environment） |
| @react-three/rapier | ^2.2.0 | Lanyard 物理绳索 |
| postprocessing | ^6.39.1 | Hyperspeed（Bloom/SMAA）、PixelBlast |
| meshline | ^3.3.1 | Lanyard 挂绳线条 |
| maath | ^0.10.8 | FluidGlass 缓动 |
| gsap | ^3.15.0 | SplitText / ScrollStack / Shuffle / ScrollReveal / FlowingMenu / StaggeredMenu |
| motion | ^12.42.0 | TrueFocus / RotatingText / ShinyText |
| lenis | ^1.3.25 | ScrollStack 平滑滚动（`window.__lenis` 全局暴露） |
| ogl | ^1.0.11 | FlyingPosters、SideRays |

### 2.3 后端 / 数据库 / API

**无**。纯静态站点。所有数据（菜单项、品牌列表、reveal 文案、摄影图集）以**常量数组内联于 `App.jsx`**，无 fetch、无状态管理库（无 Redux/Zustand/Context 全局 store）。

---

## 三、入口与渲染流程

### 3.1 启动链

```
index.html
  └─ <script type="module" src="/src/main.jsx">
       └─ main.jsx
            ├─ import './index.css'      (全局 Token + reset + 字体 @import)
            └─ <StrictMode><App /></StrictMode>
                 └─ App.jsx (唯一组合根)
```

### 3.2 关键文件职责

| 文件 | 职责 |
|---|---|
| [index.html](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/index.html) | 入口 HTML。**当前仅含 favicon + title + root div**，无 Google Fonts `<link>`（字体改由 index.css `@import` 加载，**且仅加载 Inter 一种**） |
| [src/main.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/main.jsx) | `createRoot` + `StrictMode`。**当前无 `gsap.ticker.lagSmoothing` 配置**（回退后移除） |
| [src/index.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/index.css) | 全局 Token（颜色/字体）+ reset + `::selection` + Inter 字体 `@import` |
| [src/App.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) | 唯一组合根：section 顺序编排、菜单数据、品牌列表、reveal 文案关键词 |
| [src/App.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.css) | 全局 section 布局 + 响应式断点（非组件级样式） |

### 3.3 ⚠️ 回退遗留问题（开发前须知）

1. **字体缺失**：`index.css` 仅 `@import` 了 Inter。但 `ASCIIText`（IBM Plex Mono）与 `TextPressure`（Roboto Flex 可变字体）所需字体**当前未加载**，会回退到系统字体。这是性能优化回退时丢失 `index.html` 的 Google Fonts `<link>` 导致的。About 页面若用到这两个组件需先修复。
2. **无懒加载**：所有 section 当前 **eager 加载**，无 `React.lazy` / `Suspense` / `SectionFallback`。`_perf/` 目录已移除。About 页面作为新 section 可考虑恢复轻量懒加载策略，但需与当前"全 eager"基线保持一致或统一规划。
3. **无性能分包**：`vite.config.js` 无 `manualChunks`，R3F/three 等会打入主 chunk。

---

## 四、目录结构

```
evangong.tech/
├── index.html              # 入口 HTML
├── vite.config.js          # 极简配置（react + glb）
├── package.json
├── .oxlintrc.json
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── icons/              # 本地 SVG 品牌图标（白填充，App.jsx 的 si() 引用）
│   └── assets/
│       ├── demo/           # cs1/cs2/cs3.webp
│       └── 3d/              # bar.glb / cube.glb / lens.glb
├── Photography/            # 摄影展示衍生图（按地域子目录），App.jsx 用 import.meta.glob 取
│   ├── Paris/  Chaoshan/  Beijing/  Miscellaneous/
└── src/
    ├── main.jsx
    ├── App.jsx             # 组合根 + 数据内联
    ├── App.css             # 全局 section 布局
    ├── index.css           # 全局 Token + 字体
    ├── assets/
    │   ├── EvanGongIcon.png # Hero Lanyard + Footer logo 源
    │   ├── hero.png  react.svg  vite.svg
    │   └── lanyard/         # card.glb (2.3MB) + lanyard.png
    └── components/
        ├── ErrorBoundary.jsx        # 复用工具：WebGL 兜底
        ├── Hero/                    # 自定义 section（聚合 Ballpit+Lanyard+Shuffle+...）
        ├── Footer/                  # 自定义 section
        ├── ContactShowcase/         # 自定义 section
        ├── LensesShowcase/          # 自定义 section
        ├── FlyingPosters/           # React Bits + Section 包装
        │   ├── FlyingPosters.jsx
        │   └── FlyingPostersSection.jsx   # 滚动 pin 包装器
        ├── LogoLoop/                # 自定义（无限滚动 logo 轨道）
        └── (其余均为 React Bits 本地源码组件，组件=文件夹约定)
```

**约定**：组件 = 文件夹。`src/components/<ComponentName>/<ComponentName>.jsx` + 同名 `.css` 共置。

---

## 五、现有 Section 结构（App.jsx 编排）

### 5.1 顶层渲染顺序

```
StaggeredMenu (fixed, eager) — 右侧抽屉导航
└─ main
   ├─ Hero (eager) — Ballpit + Shuffle + RotatingText + Lanyard + GradualBlur + GlassSurface×2
   ├─ ScrollVelocity — 兴趣跑马灯（Table Tennis • Programming • AI ...）
   ├─ ScrollReveal — About 自述（关键词青色着色，已预拆 .word span）
   ├─ ScrollStack — 5 张项目堆叠卡（青/白交替：OpenKyrozen/Sona/抗火无人机/Campus Studio/协作邀请）
   ├─ LogoLoop ×3 — Programming / Photography / AI 品牌墙
   ├─ TrueFocus — 聚焦文字 "True Focus"
   ├─ FlyingPostersSection (+ErrorBoundary) — 摄影海报滚动 pin
   ├─ FlowingMenu — 摄影全屏菜单（Paris/Chaoshan/Beijing/Misc）
   ├─ LensesShowcase — TextPressure + BorderGlow + FluidGlass
   ├─ ContactShowcase — Hyperspeed + ASCIIText + SplitText + ShinyText + Magnet×2
   └─ Footer — MetallicPaint logo + 社交图标（GitHub/X/Instagram）
```

### 5.2 菜单数据（关键：与 About 页面直接相关）

[App.jsx:57-64](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) 定义：

```js
const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
  { label: 'Projects', ariaLabel: 'View my projects', link: '/projects' },
  { label: 'Gallery', ariaLabel: 'View gallery', link: '/gallery' },
  { label: 'Blog', ariaLabel: 'Read my blog', link: '/blog' },
  { label: 'Awards', ariaLabel: 'View awards', link: '/awards' },
]
```

`StaggeredMenu` 渲染为 `<a href={it.link}>`（[StaggeredMenu.jsx:215](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/StaggeredMenu/StaggeredMenu.jsx)）。**当前点击 About 会整页跳转 `/about`，而项目无该路由 → 404**。这是 About 页面开发必须首先解决的架构问题（见第九节）。

### 5.3 Section 组件编写范式

观察 `Hero` / `ContactShowcase` / `LensesShowcase` / `Footer` 等自定义 section，提炼统一范式：

```jsx
import SubComponentA from '../SubComponentA/SubComponentA.jsx'
import ErrorBoundary from '../ErrorBoundary.jsx'
import photo from '/Photography/xxx.jpeg'   // 或 '../../assets/xxx'
import './SectionName.css'

export default function SectionName() {
  // 常量数据内联于文件顶部或组件内
  return (
    <section className="section-name" aria-label="无障碍标签">
      {/* WebGL 组件一律外包 ErrorBoundary */}
      <ErrorBoundary>
        <WebGLComponent ... />
      </ErrorBoundary>
      <div className="section-name__grid"> ... </div>
    </section>
  )
}
```

**要点**：
- `<section>` 根元素 + `aria-label`。
- 类名 BEM 风格（`section-name` / `section-name__grid` / `section-name--modifier`）。
- WebGL 组件外包 `ErrorBoundary`（[ErrorBoundary.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/ErrorBoundary.jsx)），防上下文丢失导致整树卸载。
- section 间以 `border-top: 1px solid rgba(0,240,255,0.08~0.1)` 区隔。
- 配套 `<SectionName>.css` 同目录创建。

---

## 六、样式规范

### 6.1 设计 Token（[index.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/index.css)）

```css
:root {
  color-scheme: dark;
  --color-cyan: #00f0ff;    /* 唯一强调色 */
  --color-black: #000000;   /* 全站背景 */
  --color-white: #ffffff;   /* 正文/标题默认 */
  --color-gray: #9c9c9c;    /* Token 已定义，CSS 基本未引用；3D 用 0x9c9c9c */
}
```

### 6.2 配色规则（硬约束）

1. **三色制**：黑/白/青，**禁止引入第四主色**。
2. 强调色统一引用 `var(--color-cyan)` 或 `#00f0ff`；3D 用 hex int `0x00f0ff`。
3. **透明度层级**：分隔线 `rgba(0,240,255,0.08~0.1)` → 悬停 `rgba(0,240,255,0.12)` → 边框 `rgba(0,240,255,0.55~0.6)` → 投影 `rgba(0,0,0,0.15~0.45)`。
4. 玻璃层以多档白色 rgba 叠加（`rgba(255,255,255,0.02~0.5)`）。
5. 唯一例外：`BorderGlow` 使用 hsla 多彩渐变，但**仅限 LensesShowcase 单 section 局部装饰，不外溢**。

### 6.3 字体

| 字体 | 用途 | 加载状态 |
|---|---|---|
| **Inter** (100-900) | 全站默认正文/标题 | ✅ `index.css @import` 已加载 |
| IBM Plex Mono (500/600) | 仅 ASCIIText | ❌ **当前未加载**（回退遗留） |
| Roboto Flex (100-1000 可变) | 仅 TextPressure | ❌ **当前未加载**（回退遗留） |

**字号层级**：`ScrollVelocity` > `ScrollReveal` > 正文。Hero 标题用最粗 900 + 负字距（`letter-spacing: -0.03em`）。

### 6.4 布局规范

- section 最大宽度：**1100px（内容）/ 1400px（宽布局）** 居中，`margin: 0 auto`。
- section padding：`clamp()` 流体留白，如 `padding: clamp(4rem, 12vw, 10rem) clamp(1.5rem, 5vw, 4rem)`。
- 根 `.app` / `body` 背景 `var(--color-black)`。

### 6.5 响应式断点（移动优先 + max-width 下探）

| 断点 | 主要适配 |
|---|---|
| **768px**（主断点） | Hero 改纵向居中、Lanyard 缩小；多 section 字号/padding 收缩；卡片改纵向 |
| **480px** | 字号再降一档；按钮改纵向 |
| **1024px** | Hero padding/Lanyard 宽收窄 |
| **900px** | Contact 双列改单列 |
| **640px** | StaggeredMenu 面板撑满 |

### 6.6 流体排版示例

```css
font-size: clamp(4rem, 10vw, 10rem);      /* Hero 标题 */
font-size: clamp(3rem, 7vw, 6.5rem);       /* ScrollReveal */
font-size: clamp(1.25rem, 2.5vw, 2rem);    /* 副标题 */
```

### 6.7 可访问性

- `aria-label` 覆盖所有 section 与图标链接。
- `:focus-visible` 青色描边（`outline: 2px solid var(--color-cyan); outline-offset: 4px`）。
- `prefers-reduced-motion` / `prefers-color-scheme: dark` 在部分组件有处理。

---

## 七、数据与状态管理

### 7.1 数据交互逻辑

- **无 API 调用**：零 fetch / axios / XMLHttpRequest。
- **数据内联**：菜单项、品牌列表、reveal 文案关键词、摄影图集（`import.meta.glob`）、社交链接（`Footer` 内联常量）均以**模块级常量**写在组件文件顶部。
- **图片资源**：`import.meta.glob('/Photography/*.{jpeg,jpg,png}', { eager: true, query: '?url', import: 'default' })`（[App.jsx:105](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx)）批量取图。单图用 `import x from '/path'` 或 `import x from '../../assets/...'`。

### 7.2 状态管理

- **无全局状态库**（无 Redux/Zustand/Context）。
- 组件内状态用 `useState` / `useRef`。`StaggeredMenu` 用 `openRef` + `setOpen` 管理；`ScrollStack` 用多个 ref 缓存变换。
- **跨组件通信**：`ScrollStack` 通过 `window.__lenis` 全局暴露 Lenis 实例（[ScrollStack.jsx:228](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/ScrollStack/ScrollStack.jsx)），供 `FlyingPostersSection` pin 时协调。

### 7.3 About 页面数据策略建议

About 页面所需数据（个人介绍、技能、经历、时间线等）应**延续内联常量范式**，写在 `About/About.jsx` 顶部，不引入数据层。

---

## 八、可复用组件与工具清单

### 8.1 工具组件

| 组件 | 路径 | 复用方式 |
|---|---|---|
| `ErrorBoundary` | [src/components/ErrorBoundary.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/ErrorBoundary.jsx) | `<ErrorBoundary fallback={null}><WebGLComp/></ErrorBoundary>`。捕获子树错误，失败子树降级（默认 `fallback=null`），兄弟存活 |

### 8.2 About 页面可复用的 React Bits 组件

| 组件 | 能力 | About 适用场景 |
|---|---|---|
| `ScrollReveal` | 滚动逐词揭示 + 模糊渐显（GSAP） | 个人宣言/简介段落（首页已用，注意区分） |
| `ScrollVelocity` | 滚动速度驱动的横向跑马灯 | 技能/兴趣标签滚动 |
| `ScrollStack` | 滚动堆叠卡片（Lenis + useWindowScroll） | 经历/项目时间线卡片 |
| `TrueFocus` | 聚焦高亮文字 | 标题强调 |
| `SplitText` | GSAP 文字入场动画 | 标题入场 |
| `ShinyText` | 闪光文字 | 邮箱/链接强调 |
| `Shuffle` | 悬停文字洗牌 | 标题交互 |
| `RotatingText` | 轮播文字 | 多角色/多身份展示 |
| `Magnet` | 磁吸按钮（`disabled` 布尔 prop） | CTA 按钮 |
| `GlassSurface` | 毛玻璃容器 | 按钮/卡片容器 |
| `FluidGlass` | R3F 透视玻璃 | 视觉装饰（⚠️ 有 3 个已修 bug，严格遵循官方实现） |
| `BorderGlow` | 描边光晕 | 卡片描边 |
| `LogoLoop` | 无限滚动 logo 轨道 | 技能/工具图标墙 |
| `ASCIIText` | ASCII 文字（Three） | 视觉标题（⚠️ 需 IBM Plex Mono，当前字体未加载） |
| `TextPressure` | 压力变形文字 | 大标题（⚠️ 需 Roboto Flex，当前字体未加载） |

### 8.3 未被引用的保留组件

`PixelBlast`、`ShuffleText`、`SideRays` 当前未被 App.jsx 引用，可按需启用。

---

## 九、关键架构决策点（需用户确认）

### 9.1 ⚡ 路由方案（About 页面实现的前提）

项目当前**无路由库**，菜单 `About → '/about'` 是 `<a href>` 形式，当前会整页跳转 404。About 页面实现需先确定路由方案，三种可选：

| 方案 | 实现 | 优点 | 缺点 |
|---|---|---|---|
| **A. react-router-dom** | 引入 `react-router-dom`，BrowserRouter + 路由表，About 为独立 `/about` 页面 | URL 优雅、可扩展（后续 Projects/Gallery 等菜单项一致）、标准方案 | 需服务端 fallback 配置（Vercel `rewrites` 或 SPA fallback）；增加依赖 |
| **B. 自定义视图切换** | `useState` 管理 `currentView`，不引入路由库，`StaggeredMenu` 的 `<a>` 改 `onClick` 切换 | 零依赖、改动局部 | URL 不变（无深链接/刷新即失）、不利于 SEO/分享 |
| **C. 锚点 section** | About 作为首页内一个 section（`#about`），菜单 link 改 `/#about` | 零依赖、保持单页滚动叙事 | 非"独立页面"，与菜单 `'/about'` path 形式不符 |

**推荐**：方案 A。理由：菜单已规划 6 个 path 形式项（`/`、`/about`、`/projects`...），暗示多页面意图；react-router 是标准方案，Vercel 部署可配置 SPA fallback。若选 A，需同时处理其他菜单项（Projects/Gallery/Blog/Awards）的占位。

### 9.2 About 页面是否独立布局

About 页面是否共享首页的 `StaggeredMenu` 固定导航 + `Footer`？还是独立布局？通常应共享导航与页脚以保持一致，仅 `<main>` 内容切换。

### 9.3 是否恢复懒加载

当前全 eager。About 页面若含 WebGL 组件，是否引入 `React.lazy` + `Suspense`？建议至少对 About 内 WebGL 组件用 `ErrorBoundary` 包裹。

---

## 十、About 页面开发所需资源与依赖

### 10.1 路由依赖（取决于 9.1 决策）

- 方案 A：需 `npm install react-router-dom`
- 方案 B/C：无新依赖

### 10.2 字体修复（若 About 用到 ASCIIText / TextPressure）

需在 `index.html` 恢复 Google Fonts `<link>` 或在 `index.css` 补充 `@import`：
- IBM Plex Mono（500/600）
- Roboto Flex（100-1000 可变）

### 10.3 资源

- 个人头像/照片：已有 `src/assets/EvanGongIcon.png`、`src/assets/hero.png` 可复用。
- 技能/工具图标：复用 `public/icons/` 与 `App.jsx` 的 `si()` helper（[App.jsx:69](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx)）。
- 摄影图：`Photography/` 目录可取。
- 3D 模型：`public/assets/3d/`（bar.glb / cube.glb / lens.glb）可复用。

### 10.4 文件创建约定

按组件=文件夹约定：
```
src/components/About/
├── About.jsx      # section 组件
└── About.css      # 组件级样式
```
若方案 A（独立路由页），通常在 `src/pages/About.jsx` 或复用 `src/components/About/`，路由表在 `App.jsx` 或新建 `src/router.jsx`。

---

## 十一、开发规范与最佳实践（硬约束）

> 源自项目累积工程约定与踩坑教训，About 页面开发须严格遵守。

### 11.1 设计一致性

1. **三色制**：黑/白/青，禁第四主色；强调色用 `var(--color-cyan)` / `#00f0ff`；3D 用 `0x00f0ff`。
2. **字体层级**：正文/标题 Inter；等宽仅 ASCIIText 用 IBM Plex Mono；可变压力字仅 TextPressure 用 Roboto Flex。
3. **字号层级**：`ScrollVelocity` > `ScrollReveal` > 正文；桌面 ScrollReveal 每行 ≤4 词。
4. **卡片色交替**：青/白交替（`project-card--cyan` / `project-card--white`），前景统一黑字。
5. **按钮**：胶囊形（`border-radius: 999px`）+ 半透明背景 + `backdrop-blur`；悬停背景过渡到 `rgba(0,240,255,0.12)` + 青色边框。
6. **Footer**：约 1/3 屏高（`min-height: 33vh`），社交图标桌面 60–84px / 移动 56px；悬停"变青+边框+背景+scale 1.08"，**去 box-shadow 辉光**。

### 11.2 组件使用约定

1. **React Bits 组件严格遵循官方实现**：禁自定义魔改（曾因反转 FlyingPosters 滚动方向致渲染失败）。
2. **`Magnet`** 用官方实现，布尔 `disabled` 控制磁吸，`magnetStrength` 默认 2。
3. **`StaggeredMenu`** 的 `.sm-prelayers` 必须含 `right: 0`（[StaggeredMenu.css:19](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/StaggeredMenu/StaggeredMenu.css)）。
4. **`ScrollStack`** 用 `useWindowScroll` + Lenis 窗口滚动驱动；其 `getElementOffset` 有 transform 反馈循环修复（[ScrollStack.jsx:62-88](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/ScrollStack/ScrollStack.jsx)），勿删。
5. **WebGL 组件一律外包 `ErrorBoundary`**。
6. **3D 异步初始化**加 `disposed`/`cancelled` 标志检查，规避 React 19 StrictMode dev 双挂载竞态。
7. **Safari 兼容**：不支持 SVG displacement map 的 Liquid GLASS 组件降级 `backdrop-blur`。
8. **组件级 CSS 与组件同目录**；全局 section 布局进 `App.css`；Token 进 `index.css`。

### 11.3 性能与构建

1. **新 section 默认与基线一致**：当前全 eager，About 页面若含重型 WebGL，至少外包 `ErrorBoundary`；是否恢复懒加载待统一规划。
2. **重型 WebGL section**：考虑可见性管理（进入视口才挂载/门控 rAF），禁止常驻后台循环。
3. **图片**：使用仓库中的受保护展示衍生图；新增照片后运行 `npm run images:protect -- --apply`，不要把原图直接提交。
4. **CSS 特异性**：覆写组件默认样式时用后代选择器提升特异性，勿依赖源码顺序。
5. **验证**：3D 组件须在 Chrome/Safari 真实浏览器验证（无头预览无 WebGL，HMR 对 Ballpit/Lanyard 不可靠）。

### 11.4 版本控制（用户偏好）

- 改动后**直接提交 `main` 分支并推送**，不开 feature 分支。

---

## 十二、下一步行动

1. ✅ **路由方案已确认**：`react-router-dom`（见第九节 9.1）。
2. **待用户指令**：当前为准备阶段，About 页面实现尚未启动（用户 2026-07-01 明确"先不用开始做"）。
3. 实现启动时需进一步确认：About 页面内容结构（个人介绍 / 技能 / 经历 / 时间线 / 联系等模块）。
4. 实现启动时需确认是否一并修复字体缺失问题（IBM Plex Mono / Roboto Flex）。
5. 按确认结果创建 `src/components/About/`（或 `src/pages/About.jsx`），遵循组件=文件夹约定与样式规范。
6. 真实浏览器（Chrome + Safari）验证。

---

## 附录：与 TECHNICAL_ANALYSIS.md 的差异说明

`docs/TECHNICAL_ANALYSIS.md` 描述的是性能优化阶段状态，以下内容在回退后**已失效**，以本文档为准：

| 项目 | TECHNICAL_ANALYSIS.md 描述 | 当前真实状态 |
|---|---|---|
| 懒加载 | 全 section `React.lazy` + `Suspense` + `SectionFallback` | 全 eager，无 lazy |
| `_perf/` 工具 | VisibilityMount / useVisibilityPause / SectionFallback 存在 | 目录已移除 |
| vite 分包 | manualChunks（vendor-r3f/three/gsap/...） | 无 manualChunks |
| 图片保护 | `scripts/protect-images.mjs` + sharp | 生成 1600px 内、带署名和版权元数据的展示衍生图 |
| 字体加载 | index.html `<link>` + preconnect 并行加载 3 字体 | index.html 无字体 link；index.css `@import` 仅加载 Inter |
| gsap.ticker | main.jsx 配置 lagSmoothing | 未配置 |
| ScrollTrigger↔Lenis bridge | 存在 | 已移除 |
| 性能指标 | Performance 0.76 | 当前未测量（基线已变） |
