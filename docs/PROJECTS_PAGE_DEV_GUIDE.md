# Projects 页面开发理解文档

> 生成日期：2026-07-02
> 分析对象：当前仓库主干代码（HEAD = `ddb25b8`，工作树干净）
> 用途：为 Projects 页面开发建立权威技术基线，明确所需资源、依赖、技术约束与关键决策点。
> 前置文档：`docs/TECHNICAL_ANALYSIS.md`（优化阶段，部分失效）、`docs/ABOUT_PAGE_DEV_GUIDE.md`（About 准备阶段，路由尚未落地）。**本文档基于路由已落地、About 已实现后的真实状态**，与上述两份存在偏差时以本文档为准。

---

## 一、项目定位与当前架构状态

`evangong.tech` 是 **Evan Gong 的个人作品集网站**，定位为 **沉浸式 3D 驱动的滚动作品集**。

- **部署形态**：纯前端静态站点，**无后端、无数据库、无 API 集成**。外部资源仅 Google Fonts CDN 与本地 `/public/icons/` SVG。
- **架构演进**：已从"单页无路由"升级为 **多页面 SPA**。`react-router-dom@^7.18.1` 已安装并接入，`App.jsx` 用 `BrowserRouter` + `Routes` 编排。
- **当前路由表**（[App.jsx:79-86](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx)）：

| 路径 | 组件 | 状态 |
|---|---|---|
| `/` | `Home` | ✅ 已实现 |
| `/about` | `About` | ✅ 已实现（commit `9cba4f2`） |
| `/projects` | — | ❌ **菜单已注册，路由未注册**（当前落入 `*` → Home 兜底） |
| `*`（兜底） | `Home` | 任何未匹配路径回首页 |

- **导航集成**：`StaggeredMenu` 渲染菜单项为 `<a href={link}>`（官方实现不动），由 [App.jsx:26-60](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) 的 `useClientSideNav()` 在 document 捕获阶段拦截 `.sm-panel-item` 点击：`preventDefault` → `navigate(href)` → 模拟 toggle 点击关闭菜单；并在路由切换时 `scrollTo(0,0)`。**Projects 页面无需改动导航逻辑**，只需注册路由即可自动生效。
- **菜单数据**（[App.jsx:10-17](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx)）：`{ label: 'Projects', ariaLabel: 'View my projects', link: '/projects' }` 已存在，无需新增。

---

## 二、技术栈清单（真实版本）

### 2.1 框架与构建

| 类别 | 技术 | 版本 | 说明 |
|---|---|---|---|
| UI 框架 | React | ^19.2.7 | StrictMode 开启（dev 双挂载，WebGL 初始化需防竞态） |
| **路由** | **react-router-dom** | **^7.18.1** | **已接入**：BrowserRouter + Routes + useNavigate/useLocation |
| 构建工具 | Vite | ^8.1.0 | `vite.config.js` **极简**：仅 `react()` + `assetsInclude: ['**/*.glb']`。**无 manualChunks 分包，无 vite-imagetools 配置**（依赖保留但未启用） |
| React 插件 | @vitejs/plugin-react | ^6.0.2 | 基于 Oxc |
| 样式方案 | 原生 CSS | — | 组件级 CSS + 全局 Token，**无 Tailwind / CSS-in-JS** |
| Lint | oxlint | ^1.69.0 | 配置 `.oxlintrc.json` |
| 类型系统 | 无 TypeScript | — | `.jsx` + `@types/react` 仅编辑器提示 |

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
| lenis | ^1.3.25 | 平滑滚动（About 与 ScrollStack 各自创建实例） |
| ogl | ^1.0.11 | FlyingPosters、SideRays |
| matter-js | ^0.20.0 | FallingText 物理文字（About 已用） |

### 2.3 后端 / 数据库 / API

**无**。纯静态站点。所有数据以**模块级常量内联于组件文件顶部**，零 fetch / axios / 状态管理库（无 Redux/Zustand/Context 全局 store）。

---

## 三、入口与渲染流程

### 3.1 启动链

```
index.html
  └─ <script type="module" src="/src/main.jsx">
       └─ main.jsx
            ├─ import './index.css'      (全局 Token + reset + 字体 @import)
            └─ <StrictMode><App /></StrictMode>
                 └─ App.jsx
                      ├─ <BrowserRouter><Layout/></BrowserRouter>
                      │     ├─ useClientSideNav()  (拦截 .sm-panel-item 点击 + 路由切换滚顶)
                      │     ├─ <StaggeredMenu/>    (fixed，右侧抽屉，全站共享)
                      │     ├─ <main><Routes>…</Routes></main>
                      │     └─ <Footer/>           (全站共享)
                      └─ Routes: / → Home, /about → About, * → Home
```

### 3.2 关键文件职责

| 文件 | 职责 |
|---|---|
| [index.html](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/index.html) | 入口 HTML。**仅含 favicon + title + root div**，无 Google Fonts `<link>`（字体由 index.css `@import` 加载，**且仅加载 Inter 一种**） |
| [src/main.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/main.jsx) | `createRoot` + `StrictMode`。无 `gsap.ticker.lagSmoothing` 配置 |
| [src/index.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/index.css) | 全局 Token（颜色/字体）+ reset + `::selection` + Inter 字体 `@import` |
| [src/App.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) | 组合根：BrowserRouter、`useClientSideNav` 路由拦截、菜单数据、Routes、共享 StaggeredMenu + Footer |
| [src/App.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.css) | 全局 section 布局 + 响应式断点（**Home 专用 section 样式**，如 `.scroll-stack-section`、`.logo-loop-section` 等） |

### 3.3 ⚠️ 当前遗留问题（Projects 开发前须知）

1. **字体缺失**：`index.css` 仅 `@import` 了 Inter。`ASCIIText`（IBM Plex Mono）与 `TextPressure`（Roboto Flex 可变字体）所需字体**当前未加载**，会回退到系统字体。Projects 页面若用到这两个组件需先修复（见第十节）。
2. **无懒加载**：所有 section 当前 **eager 加载**，无 `React.lazy` / `Suspense`。`_perf/` 目录已移除。Projects 页面作为新路由页可考虑恢复轻量懒加载，但需与当前"全 eager"基线保持一致或统一规划。
3. **无性能分包**：`vite.config.js` 无 `manualChunks`，R3F/three 等会打入主 chunk。
4. **`App.css` 末尾**（[App.css:352](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.css)）：`/* ===== Flying Posters section ===== */` 标题后内容为空，是 Home 全局 section 样式的收尾。Projects 页面若需全局 section 布局类，可在此追加或全部走组件级 CSS。

---

## 四、目录结构

```
evangong.tech/
├── index.html              # 入口 HTML（无字体 link）
├── vite.config.js          # 极简配置（react + glb）
├── package.json            # 含 react-router-dom ^7.18.1
├── .oxlintrc.json
├── docs/                   # ← 本文档所在
│   ├── TECHNICAL_ANALYSIS.md
│   └── ABOUT_PAGE_DEV_GUIDE.md
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── icons/              # 本地 SVG 品牌图标（白填充，si() 引用）
│   └── assets/
│       ├── demo/           # cs1/cs2/cs3.webp
│       └── 3d/             # bar.glb / cube.glb / lens.glb（可复用于 Projects 视觉）
├── Photography/            # 摄影展示衍生图（按地域子目录），import.meta.glob 取
└── src/
    ├── main.jsx
    ├── App.jsx             # 组合根 + 路由 + 导航拦截
    ├── App.css             # Home 全局 section 布局
    ├── index.css           # 全局 Token + 字体
    ├── assets/
    │   ├── EvanGongIcon.png # Hero/About/Footer logo 源
    │   ├── hero.png  react.svg  vite.svg
    │   └── lanyard/         # card.glb (2.3MB) + lanyard.png
    └── components/
        ├── ErrorBoundary.jsx        # 复用工具：WebGL 兜底
        ├── Home/                    # 首页（聚合 Hero + 各 section）
        ├── About/                   # ← Projects 的直接参照（路由页范式）
        │   ├── About.jsx
        │   └── About.css
        ├── Skills/                  # ← 自定义 section 范式（About 内引用）
        ├── Footer/                  # 自定义 section（全站共享）
        ├── ContactShowcase/         # 自定义 section
        ├── LensesShowcase/          # 自定义 section
        ├── FlyingPosters/           # React Bits + Section 包装
        ├── LogoLoop/                # 自定义（无限滚动 logo 轨道）
        └── (其余均为 React Bits 本地源码组件，组件=文件夹约定)
```

**约定**：组件 = 文件夹。`src/components/<ComponentName>/<ComponentName>.jsx` + 同名 `.css` 共置。

---

## 五、现有页面结构（Projects 的直接参照）

### 5.1 About 页面（路由页范式 — 重点参照）

[About.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/About/About.jsx) 是 Projects 页面的**最直接模板**——同为独立路由页，结构清晰：

```
<section className="about-page" aria-label="About Evan Gong">
  ├─ .about-circular        (fixed 装饰 CircularText，pointer-events:none)
  ├─ .about-title           (Shuffle h1 标题，triggerOnHover)
  ├─ .about-intro           (flex：左 MetallicPaint 图标 + 右 intro 段落，关键词青色着色)
  ├─ .about-falling         (FallingText 物理文字，trigger=hover)
  └─ <Skills/>              (自定义 section：分类技能 chips)
```

**About 页面三大关键模式（Projects 须复用）：**

#### 模式 A — 自带 Lenis 实例（[About.jsx:59-82](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/About/About.jsx)）

非 Home 页面**不共享** ScrollStack 的 Lenis。About 在 `useEffect` 内自建 Lenis，配置**完全复刻** ScrollStack 的 `setupLenis`（`useWindowScroll=true` 分支），保证跨页滚动手感一致：

```jsx
useEffect(() => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true, touchMultiplier: 2, infinite: false,
    wheelMultiplier: 1, lerp: 0.1, syncTouch: true, syncTouchLerp: 0.075,
  })
  const raf = time => { lenis.raf(time); rafRef.current = requestAnimationFrame(raf) }
  rafRef.current = requestAnimationFrame(raf)
  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    lenis.destroy()      // ← 必须清理，否则路由切换后残留重复 rAF
  }
}, [])
```

**Projects 页面必须照搬此模式**（除非 Projects 用 ScrollStack，则由 ScrollStack 自建 Lenis）。

#### 模式 B — 数据内联 + 关键词着色（[About.jsx:13-39](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/About/About.jsx)）

模块级常量 + `buildIntroChildren()` 拆词，关键词包 `<span style={{color:'#00f0ff'}}>`，正文 `var(--color-white)`。与 Home 的 `buildRevealChildren`（[Home.jsx:31-46](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Home/Home.jsx)）逻辑一致，仅类名不同。

#### 模式 C — WebGL 组件外包 ErrorBoundary（[About.jsx:118-142](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/About/About.jsx)）

`MetallicPaint` 外包 `<ErrorBoundary>`，失败静默降级（`fallback` 默认 `null`），兄弟子树存活。

### 5.2 Home 页面（section 编排范式）

[Home.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Home/Home.jsx) 用 `<>` Fragment 纵向堆叠 section，数据全部内联（`flowingMenuItems`、`REVEAL_KEYWORDS`、`programmingLogos`/`photographyLogos`/`aiLogos`、`posterImages` 用 `import.meta.glob` 批量取图）。

**注意**：Home 已有一个"Current projects" ScrollStack（[Home.jsx:129-188](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Home/Home.jsx)），含 5 张堆叠卡（OpenKyrozen / Sona / Anti-Fire Drone / Campus Studio / Open To Collaborate）。**Projects 页面应是其详尽展开**，避免与首页重复堆叠卡形式，宜换布局（见第九节）。

### 5.3 Skills 自定义 section（列表/网格范式 — 重点参照）

[Skills.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Skills/Skills.jsx) + [Skills.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Skills/Skills.css) 是 Projects 列表/网格的**最佳范式**：

- 数据：`SKILL_GROUPS` 模块级常量数组（[Skills.jsx:11-73](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Skills/Skills.jsx)），每项 `{ name, icon?, text?, href }`。
- 本地图标 helper：`const si = (slug) => '/icons/${slug}.svg'`（[Skills.jsx:6](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Skills/Skills.jsx)），无图标时回退文字徽章。
- **扁平设计**（CSS 顶部明示）：无 glow / 无 gradient / 无 shadow，仅实色 + 1px 边框 + 透明背景。
- 行间 `border-bottom: 1px solid #00f0ff` 分隔；chip 悬停 → `background: rgba(0,240,255,0.12)` + `border-color: #00f0ff` + `color: #00f0ff`。
- 响应式：768px 行改纵向；480px 字号降档。

### 5.4 Section 组件编写范式（通用）

```jsx
import SubComponentA from '../SubComponentA/SubComponentA.jsx'
import ErrorBoundary from '../ErrorBoundary.jsx'
import './SectionName.css'

export default function SectionName() {
  // 常量数据内联于文件顶部
  return (
    <section className="section-name" aria-label="无障碍标签">
      <ErrorBoundary>
        <WebGLComponent ... />
      </ErrorBoundary>
      <div className="section-name__grid"> ... </div>
    </section>
  )
}
```

**要点**：`<section>` 根 + `aria-label`；类名 BEM；WebGL 外包 `ErrorBoundary`；section 间 `border-top: 1px solid rgba(0,240,255,0.08~0.1)`；配套 `.css` 同目录。

---

## 六、样式规范

### 6.1 设计 Token（[index.css:9-15](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/index.css)）

```css
:root {
  color-scheme: dark;
  --color-cyan: #00f0ff;    /* 唯一强调色 */
  --color-black: #000000;   /* 全站背景 */
  --color-white: #ffffff;   /* 正文/标题默认 */
  --color-gray: #9c9c9c;    /* Token 已定义，CSS 基本未引用 */
}
```

### 6.2 配色规则（硬约束）

1. **三色制**：黑/白/青，**禁止引入第四主色**。
2. 强调色统一引用 `var(--color-cyan)` 或 `#00f0ff`；3D 用 hex int `0x00f0ff`。
3. **透明度层级**：分隔线 `rgba(0,240,255,0.08~0.1)` → 悬停 `rgba(0,240,255,0.12)` → 边框 `rgba(0,240,255,0.55~0.6)` → 投影 `rgba(0,0,0,0.15~0.45)`。
4. 玻璃层以多档白色 rgba 叠加（`rgba(255,255,255,0.02~0.5)`）。
5. 唯一例外：`BorderGlow` 使用 hsla 多彩渐变，但**仅限 LensesShowcase 单 section 局部装饰，不外溢**。
6. **卡片色交替**：青/白交替（`project-card--cyan` 青底黑字 / `project-card--white` 白底黑字），见 [App.css:131-139](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.css)。

### 6.3 字体

| 字体 | 用途 | 加载状态 |
|---|---|---|
| **Inter** (100-900) | 全站默认正文/标题 | ✅ `index.css @import` 已加载 |
| IBM Plex Mono (500/600) | 仅 ASCIIText | ❌ **当前未加载**（遗留） |
| Roboto Flex (100-1000 可变) | 仅 TextPressure | ❌ **当前未加载**（遗留） |

**字号层级**：`ScrollVelocity` > `ScrollReveal` > 正文。标题用最粗 900 + 负字距（`letter-spacing: -0.03em`）。流体排版用 `clamp()`。

### 6.4 布局规范

- section 最大宽度：**1100px（内容）/ 1400px（宽布局）** 居中，`margin: 0 auto`。
- section padding：`clamp()` 流体留白，如 `padding: clamp(6rem, 14vw, 10rem) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 10vw, 8rem)`（About 范式）。
- 根 `.app` / `body` 背景 `var(--color-black)`。

### 6.5 响应式断点（移动优先 + max-width 下探）

| 断点 | 主要适配 |
|---|---|
| **768px**（主断点） | 标题/卡片改纵向、字号/padding 收缩、双列改单列 |
| **480px** | 字号再降一档、按钮/卡片圆角缩小 |
| **1024px** | 宽容器收窄 |
| **900px** | 双列改单列（Contact 用） |
| **640px** | StaggeredMenu 面板撑满兜底 |

### 6.6 可访问性

- `aria-label` 覆盖所有 section 与图标链接。
- `:focus-visible` 青色描边（`outline: 2px solid var(--color-cyan); outline-offset: 4px`）。
- `prefers-reduced-motion` / `prefers-color-scheme: dark` 在部分组件有处理。

---

## 七、数据与状态管理

### 7.1 数据交互逻辑

- **无 API 调用**：零 fetch / axios / XMLHttpRequest。
- **数据内联**：菜单项、品牌列表、reveal 文案、技能分组、摄影图集（`import.meta.glob`）、社交链接均以**模块级常量**写在组件文件顶部。
- **图片资源**：
  - 批量：`import.meta.glob('/Photography/*.{jpeg,jpg,png}', { eager: true, query: '?url', import: 'default' })`（[Home.jsx:92-94](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Home/Home.jsx)）。
  - 单图：`import x from '/Photography/xxx.jpeg'`（根目录绝对路径）或 `import x from '../../assets/xxx'`（src 内相对路径）。
- **本地图标**：`const si = (slug) => '/icons/${slug}.svg'`（[Skills.jsx:6](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Skills/Skills.jsx)），SVG 预置 `fill="#ffffff"`。

### 7.2 状态管理

- **无全局状态库**（无 Redux/Zustand/Context）。
- 组件内状态用 `useState` / `useRef`。
- **跨组件通信**：ScrollStack 通过 `window.__lenis` 全局暴露 Lenis 实例，供 FlyingPostersSection pin 时协调（Projects 若混用两者需注意）。
- **路由状态**：`useNavigate` / `useLocation`（[App.jsx:27-28](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx)），Projects 页面可用 `useNavigate` 做项目详情跳转（若需）。

### 7.3 Projects 页面数据策略建议

延续内联常量范式，在 `Projects/Projects.jsx` 顶部定义 `PROJECTS` 数组，每项建议结构：

```js
const PROJECTS = [
  {
    name: 'OpenKyrozen',
    tagline: 'A self-learning AI Agent that adapts and grows.',
    category: 'AI',           // 用于分类筛选/标签
    description: '...',        // 详情段落
    tech: ['python', 'tensorflow'],  // 复用 si() 取图标
    links: { github: '...', demo: '...' },
    cover: '/Photography/...或 import',  // 封面图
    index: '01',
  },
  // ...
]
```

---

## 八、可复用组件与工具清单

### 8.1 工具组件

| 组件 | 路径 | 复用方式 |
|---|---|---|
| `ErrorBoundary` | [src/components/ErrorBoundary.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/ErrorBoundary.jsx) | `<ErrorBoundary fallback={null}><WebGLComp/></ErrorBoundary>`。捕获子树错误，失败子树降级（默认 `fallback=null`），兄弟存活 |

### 8.2 Projects 页面可复用的 React Bits 组件

| 组件 | 能力 | Projects 适用场景 | 备注 |
|---|---|---|---|
| `ScrollStack` | 滚动堆叠卡片（Lenis + useWindowScroll） | 项目时间线/精选项目卡 | ⚠️ Home 已用于 5 张项目卡，**避免重复**；若用须保留 transform 反馈修复 |
| `TrueFocus` | 聚焦高亮文字 | 页面标题强调 | — |
| `SplitText` | GSAP 文字入场动画 | 标题入场 | — |
| `Shuffle` | 悬停文字洗牌 | 标题交互（About 已用） | — |
| `ShinyText` | 闪光文字 | 链接/CTA 强调 | — |
| `Magnet` | 磁吸按钮（`disabled` 布尔 prop） | "View on GitHub" 等 CTA | 官方实现，`magnetStrength` 默认 2 |
| `GlassSurface` | 毛玻璃容器 | 项目卡容器 | — |
| `BorderGlow` | 描边光晕 | 精选项目卡描边 | hsla 多彩，**仅局部装饰** |
| `LogoLoop` | 无限滚动 logo 轨道 | 每个项目的 tech stack 图标墙 | Home 已用 ×3 |
| `ScrollReveal` | 滚动逐词揭示 | 页面 intro 段落 | Home 已用，注意区分文案 |
| `ScrollVelocity` | 横向跑马灯 | 项目分类标签滚动 | Home 已用 |
| `FlyingPosters` | WebGL 海报滚动 pin | 项目封面海报墙（若有视觉素材） | OGL，须外包 ErrorBoundary |
| `FluidGlass` | R3F 透视玻璃 | 视觉装饰 | ⚠️ 有 3 个已修 bug，**严格遵循官方实现** |
| `FallingText` | 物理掉落文字 | — | About 已用，**避免重复** |
| `CircularText` | 旋转环形文字 | — | About 已用，**避免重复** |
| `ASCIIText` | ASCII 文字（Three） | 视觉标题 | ⚠️ 需 IBM Plex Mono，**当前字体未加载** |
| `TextPressure` | 压力变形文字 | 大标题 | ⚠️ 需 Roboto Flex，**当前字体未加载** |

### 8.3 未被引用的保留组件

`PixelBlast`、`ShuffleText`、`SideRays` 当前未被引用，可按需启用。

### 8.4 可复用 3D 资产

`public/assets/3d/`：`bar.glb` / `cube.glb` / `lens.glb`，可用作项目视觉装饰（须外包 ErrorBoundary）。

---

## 九、关键架构决策点（需用户确认）

### 9.1 ⚡ Projects 页面布局方案

首页已有 ScrollStack 堆叠 5 张项目卡，Projects 页面应**差异化展开**。三种可选：

| 方案 | 实现 | 优点 | 缺点 |
|---|---|---|---|
| **A. 网格卡片墙** | 自定义网格（参考 Skills 的扁平 chip 范式放大为卡片），每卡含封面/标题/描述/tech 图标/链接 | 信息密度高、易扩展、与首页 ScrollStack 区分明显、无 WebGL 依赖 | 视觉冲击弱于 3D 方案 |
| **B. ScrollStack 扩展** | 复用 ScrollStack 但增加卡片数量与详情（每卡含 tech stack、链接、封面） | 滚动动效连贯、复用现有组件 | 与首页重复观感、Lenis 全局实例需协调 |
| **C. 混合** | 顶部 ScrollReveal intro + 精选项目用 FluidGlass/BorderGlow 卡 + 其余网格列表 | 视觉层次丰富、兼顾冲击与信息量 | 复杂度高、WebGL 须真实浏览器验证 |

**推荐**：方案 A 或 C。理由：首页已占 ScrollStack 形式，Projects 页宜换布局以区分；方案 A 最稳，方案 C 视觉最强但需 ErrorBoundary + 真实浏览器验证。

### 9.2 项目详情展开方式

- **就地展开**（accordion / modal）vs **外链 GitHub** vs **子路由 `/projects/:slug`**。
- 推荐：外链 GitHub + 就地展开详情段落（不引入子路由，保持路由表简洁）。

### 9.3 是否使用 WebGL 组件

若选方案 C 或用 FluidGlass/FlyingPosters/ASCIIText：
- 须外包 `ErrorBoundary`；
- 3D 异步初始化加 `disposed` 标志检查（StrictMode 双挂载竞态）；
- 须 Chrome + Safari 真实浏览器验证（无头预览无 WebGL）；
- 若用 ASCIIText/TextPressure 须先修复字体加载（见第十节）。

### 9.4 是否恢复懒加载

当前全 eager。Projects 页面若含重型 WebGL，是否引入 `React.lazy` + `Suspense`？建议至少对 WebGL 组件外包 `ErrorBoundary`；是否恢复懒加载待统一规划（避免与现有基线不一致）。

---

## 十、Projects 页面开发所需资源与依赖

### 10.1 路由注册（必须，零新依赖）

`react-router-dom` 已安装。仅需在 [App.jsx:80-84](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) 的 `<Routes>` 内追加：

```jsx
import Projects from './components/Projects/Projects.jsx'
// ...
<Route path="/projects" element={<Projects />} />
```

菜单 `Projects → /projects` 已存在，`useClientSideNav` 自动接管客户端跳转 + 关闭菜单 + 滚顶。

### 10.2 字体修复（仅当用 ASCIIText / TextPressure）

需在 `index.html` 恢复 Google Fonts `<link>` 或在 `index.css` 补充 `@import`：
- IBM Plex Mono（500/600）
- Roboto Flex（100-1000 可变）

### 10.3 资源

- 项目封面图：使用仓库内的受保护展示衍生图；新增照片后运行 `npm run images:protect -- --apply`，勿直引相机原图。
- tech stack 图标：复用 `public/icons/` 与 `si()` helper。
- 3D 模型：`public/assets/3d/`（bar.glb / cube.glb / lens.glb）可复用。
- 个人图标：`src/assets/EvanGongIcon.png`。

### 10.4 文件创建约定

按组件=文件夹约定：
```
src/components/Projects/
├── Projects.jsx      # 路由页组件（含自带 Lenis，照搬 About 模式 A）
└── Projects.css      # 组件级样式
```
（若拆子 section，如 `ProjectCard/`，同样遵循组件=文件夹约定。）

---

## 十一、开发规范与最佳实践（硬约束）

> 源自项目累积工程约定与踩坑教训，Projects 页面开发须严格遵守。

### 11.1 设计一致性

1. **三色制**：黑/白/青，禁第四主色；强调色用 `var(--color-cyan)` / `#00f0ff`；3D 用 `0x00f0ff`。
2. **字体层级**：正文/标题 Inter；等宽仅 ASCIIText 用 IBM Plex Mono；可变压力字仅 TextPressure 用 Roboto Flex。
3. **字号层级**：`ScrollVelocity` > `ScrollReveal` > 正文。
4. **卡片色交替**：青/白交替（`project-card--cyan` / `project-card--white`），前景统一黑字。
5. **按钮**：胶囊形（`border-radius: 999px`）+ 半透明背景 + `backdrop-blur`；悬停背景过渡到 `rgba(0,240,255,0.12)` + 青色边框。
6. **扁平列表区**（参考 Skills）：无 glow / 无 gradient / 无 shadow，仅实色 + 1px 边框 + 透明背景。

### 11.2 组件使用约定

1. **React Bits 组件严格遵循官方实现**：禁自定义魔改（曾因反转 FlyingPosters 滚动方向致渲染失败）。
2. **`Magnet`** 用官方实现，布尔 `disabled` 控制磁吸，`magnetStrength` 默认 2。
3. **`StaggeredMenu`** 的 `.sm-prelayers` 必须含 `right: 0`。
4. **`ScrollStack`** 用 `useWindowScroll` + Lenis；其 `getElementOffset` 有 transform 反馈循环修复，勿删。
5. **WebGL 组件一律外包 `ErrorBoundary`**。
6. **3D 异步初始化**加 `disposed`/`cancelled` 标志检查，规避 React 19 StrictMode dev 双挂载竞态。
7. **Safari 兼容**：不支持 SVG displacement map 的 Liquid GLASS 组件降级 `backdrop-blur`。
8. **Lenis 实例**：非 Home 页面自建 Lenis（照搬 About 模式 A 配置），`useEffect` 清理 `cancelAnimationFrame` + `lenis.destroy()`，防路由切换残留 rAF。
9. **组件级 CSS 与组件同目录**；Home 专用全局 section 布局进 `App.css`；Token 进 `index.css`。

### 11.3 性能与构建

1. **新页面默认与基线一致**：当前全 eager，Projects 页面若含重型 WebGL，至少外包 `ErrorBoundary`；是否恢复懒加载待统一规划。
2. **重型 WebGL section**：考虑可见性管理（进入视口才挂载/门控 rAF），禁止常驻后台循环。
3. **图片**：使用已处理的展示衍生图；保护流程限制长边、重新压缩、写入版权元数据并叠加署名水印。
4. **CSS 特异性**：覆写组件默认样式时用后代选择器提升特异性，勿依赖源码顺序。
5. **验证**：3D 组件须在 Chrome/Safari 真实浏览器验证（无头预览无 WebGL，HMR 对 Ballpit/Lanyard 不可靠）。

### 11.4 版本控制（用户偏好）

- 改动后**直接提交 `main` 分支并推送**，不开 feature 分支。

---

## 十二、下一步行动

1. **路由注册**：在 [App.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) `<Routes>` 追加 `/projects` 路由（零新依赖）。
2. **待用户确认**（第九节）：
   - 9.1 布局方案（A 网格 / B ScrollStack 扩展 / C 混合）
   - 9.2 详情展开方式（外链 / 就地 / 子路由）
   - 9.3 是否使用 WebGL 组件
   - 9.4 是否恢复懒加载
3. **待用户提供**：项目清单数据（名称、简介、分类、tech stack、链接、封面图）——当前首页 ScrollStack 仅有 4 个项目 + 1 个协作邀请卡，Projects 页面需扩充。
4. 按确认结果创建 `src/components/Projects/`（`Projects.jsx` + `Projects.css`），照搬 About 的 Lenis 模式与 Skills 的列表范式。
5. 真实浏览器（Chrome + Safari）验证。

---

## 附录：与 ABOUT_PAGE_DEV_GUIDE.md 的差异说明

ABOUT_PAGE_DEV_GUIDE.md 生成时（2026-07-01）路由尚未落地，以下内容**现已变化**，以本文档为准：

| 项目 | ABOUT_PAGE_DEV_GUIDE.md 描述 | 当前真实状态（2026-07-02） |
|---|---|---|
| 路由 | 无路由库，菜单 About → /about 会 404 | ✅ `react-router-dom@^7.18.1` 已接入，BrowserRouter + Routes + `useClientSideNav` 拦截 |
| About 页面 | 未实现（准备阶段） | ✅ 已实现（commit `9cba4f2`）：CircularText + Shuffle + MetallicPaint + FallingText + Skills |
| 新增组件 | — | CircularText、FallingText、Skills（自定义 section） |
| Lenis | 仅 ScrollStack 一处 | About 页面自建独立 Lenis 实例（同配置，路由切换时 destroy） |
| 路由表 | — | `/`→Home、`/about`→About、`*`→Home；`/projects` 菜单已注册但路由未注册 |
| Projects 路由 | — | 待注册（仅需 `<Route path="/projects" element={<Projects/>} />`） |
