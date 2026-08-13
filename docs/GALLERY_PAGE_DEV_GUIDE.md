# Gallery 页面开发理解文档

> 生成日期：2026-07-03
> 分析对象：当前仓库主干代码（HEAD = `4badfca`，分支 `main`）
> 用途：为 Gallery 页面开发建立权威技术基线，明确所需资源、依赖、技术约束与关键决策点。
> 前置文档：`docs/TECHNICAL_ANALYSIS.md`、`docs/ABOUT_PAGE_DEV_GUIDE.md`、`docs/PROJECTS_PAGE_DEV_GUIDE.md`。架构与样式规范部分不再重复，仅引用并补充 Gallery 专属内容；冲突时以本文档为准。

---

## 一、项目定位与当前架构状态

`evangong.tech` 是 **Evan Gong 的个人作品集网站**，定位为 **沉浸式 3D 驱动的多页面滚动作品集**。

- **部署形态**：纯前端静态站点，**无后端、无数据库、无 API 集成**。外部资源仅 Google Fonts CDN（当前仅 Inter）与本地 `/public/icons/` SVG。
- **架构**：多页面 SPA。`react-router-dom@^7.18.1` 已接入，`App.jsx` 用 `BrowserRouter` + `Routes` 编排。
- **当前路由表**（[App.jsx:213-219](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx)）：

| 路径 | 组件 | 状态 |
|---|---|---|
| `/` | `Home` | ✅ 已实现 |
| `/about` | `About` | ✅ 已实现（commit `9cba4f2`） |
| `/projects` | `Projects` | ✅ 已实现（commit `113a463`，含可点击行 commit `4badfca`） |
| `/gallery` | — | ❌ **菜单已注册，路由未注册**（当前落入 `*` → Home 兜底） |
| `/blog`、`/awards` | — | ❌ 菜单已注册，路由未注册（同上） |
| `*`（兜底） | `Home` | 任何未匹配路径回首页 |

- **导航集成**：`StaggeredMenu` 渲染菜单项为 `<a href={link}>`（官方实现不动），由 [App.jsx:76-112](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) 的 `useClientSideNav()` 在 document 捕获阶段拦截 `.sm-panel-item` 与 `[data-nav-link]` 点击：`preventDefault` → `triggerTransition`（PageTransition 模糊出/入状态机）→ `navigate(href)` → 模拟 toggle 点击关闭菜单 → 路由切换 `scrollTo(0,0)`。**Gallery 页面无需改动导航逻辑**，只需注册路由即可自动生效。
- **菜单数据**（[App.jsx:12-19](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx)）：`{ label: 'Gallery', ariaLabel: 'View gallery', link: '/gallery' }` 已存在，无需新增。
- **当前页高亮**：`StaggeredMenu` 接收 `activePath` prop（[App.jsx:210](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) 传 `pathname`），匹配的 `<a>` 获得 `aria-current="page"` → 青色高亮（见 [StaggeredMenu.jsx:221](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/StaggeredMenu/StaggeredMenu.jsx)）。**Gallery 注册路由后高亮自动生效，无需额外代码**。

---

## 二、技术栈清单（Gallery 相关摘要）

> 完整清单见 `docs/PROJECTS_PAGE_DEV_GUIDE.md` 第二节。此处仅列 Gallery 可能涉及项。

| 类别 | 技术 | 版本 | Gallery 相关性 |
|---|---|---|---|
| UI 框架 | React | ^19.2.7 | StrictMode 开启（dev 双挂载，WebGL 初始化需防竞态） |
| 路由 | react-router-dom | ^7.18.1 | 已接入，Gallery 仅需注册 `<Route>` |
| 构建工具 | Vite | ^8.1.0 | `vite.config.js` **极简**：仅 `react()` + `assetsInclude: ['**/*.glb']`。**无 manualChunks、无 vite-imagetools 配置**（依赖保留但未启用，**不会自动转 WebP**） |
| 样式 | 原生 CSS | — | 组件级 CSS + 全局 Token，无 Tailwind / CSS-in-JS |
| 平滑滚动 | lenis | ^1.3.25 | 非 Home 页面自建 Lenis 实例（照搬 About/Projects 模式） |
| GSAP | gsap | ^3.15.0 | 文字/网格入场动画（若需） |
| motion | motion | ^12.42.0 | 轻量交互动画（若需） |
| WebGL（可选） | three / @react-three/fiber / ogl | 0.185 / 9.6 / 1.0 | 若选用 FluidGlass 透视镜 / FlyingPosters 海报墙（均已在 Home 使用，**Gallery 宜差异化**） |
| matter-js | matter-js | ^0.20.0 | FallingText 物理文字（About 已用，**避免重复**） |

**后端 / 数据库 / API**：无。纯静态站点，所有数据以**模块级常量内联于组件文件顶部**。

---

## 三、Gallery 页面定位与摄影资源盘点

### 3.1 定位

Gallery 是 **Evan 的摄影作品集页面**，展示 `Photography/` 目录下的照片。与首页（Home 用 FlyingPosters 海报墙 + FlowingMenu 全屏菜单做"点缀式"摄影展示）不同，Gallery 应是**系统性、可浏览**的图集页——支持分类浏览、大图查看，信息密度与可读性优先于炫技动效。

### 3.2 ⚠️ 摄影图片资源盘点（Gallery 的核心数据源）

摄影展示图同时存在于 `Photography/` 和 `public/Photography/`；博客封面和奖项图片也经过同一保护流程。受保护文件的精确清单见仓库根目录的 `photo-protection-manifest.json`。

| 资源范围 | 用途 | 保护状态 |
|---|---|---|
| `Photography/**` | Home 摄影海报、FlowingMenu 和精选图 | 1600px 内展示衍生图 |
| `public/Photography/**` | Gallery 分类图集 | 1600px 内展示衍生图 |
| `public/blog/**` | Blog 封面 | 1600px 内展示衍生图 |
| `public/awards/**` | Awards 图片和证书 | 1600px 内展示衍生图 |

地域分类仍为 Paris / Chaoshan / Beijing / Miscellaneous；文件数量和指纹以 manifest 为准。

### 3.3 图片资源策略（重要约束）

1. **图片在提交前预处理**：`npm run images:protect -- --apply` 使用 `sharp` 生成不超过 1600px 长边的 JPEG/WebP 展示衍生图，写入版权元数据并叠加 `© Evan Gong · evangong.tech` 水印。`import.meta.glob(..., { query: '?url' })` 取到的是受保护展示图路径，不是相机原图。
2. **批量取图范式**（Home 既有，可复用）：
   ```js
   // 仅取根目录（非递归）
   const rootPhotos = Object.values(
     import.meta.glob('/Photography/*.{jpeg,jpg,png}', { eager: true, query: '?url', import: 'default' })
   )
   // 递归取全部（含子目录）—— Gallery 推荐用此
   const allPhotos = Object.values(
     import.meta.glob('/Photography/**/*.{jpeg,jpg,png}', { eager: true, query: '?url', import: 'default' })
   )
   ```
3. **单图 import**：`import x from '/Photography/Paris/IMG_1598.jpg'`（根目录绝对路径）或 `import x from '../../assets/xxx'`（src 内相对路径）。
4. **展示图体积**：原图不进入仓库；展示图由预处理脚本限制尺寸和质量。仍然建议：
   - 缩略图与展示图同源（用 CSS `object-fit` + 固定容器尺寸控制视觉体积）；
   - 全部 `<img>` 加 `loading="lazy"`（见第九节 PageTransition 约束）；
   - 新增或替换照片后运行 `npm run images:protect -- --apply`，并用 `npm run images:protect -- --check` 验证清单。
5. **分类元数据缺失**：根目录 6 张未归类，无 EXIF/标题/拍摄信息。若 Gallery 要展示标题/地点/年份，需**手工补一份元数据常量**（见第八节建议结构）。

---

## 四、入口与渲染流程（Gallery 接入点）

### 4.1 启动链

```
index.html
  └─ <script type="module" src="/src/main.jsx">
       └─ main.jsx  (StrictMode + createRoot, import './index.css')
            └─ <App/>
                 └─ <BrowserRouter><Layout/></BrowserRouter>
                      ├─ useClientSideNav(triggerTransition)   (拦截 .sm-panel-item / [data-nav-link])
                      ├─ <StaggeredMenu activePath={pathname}/> (fixed 右侧抽屉，全站共享)
                      ├─ <main ref={mainRef}><Routes>…</Routes></main>
                      ├─ <Footer/>                             (全站共享)
                      └─ <PageTransition phase={phase}/>        (模糊出/入遮罩)
```

### 4.2 Gallery 接入点（最小改动）

仅需 [App.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) 两处改动：

1. 顶部 import（与 Home/About/Projects 并列）：
   ```jsx
   import Gallery from './components/Gallery/Gallery.jsx'
   ```
2. `<Routes>` 内追加（**⚠️ GOTCHA**：过往重构 PageTransition 时曾丢失 Projects 的 import/Route，新增 Gallery 路由后务必核验整段 Routes 完整）：
   ```jsx
   <Route path="/gallery" element={<Gallery />} />
   ```

菜单 `Gallery → /gallery` 已存在，`useClientSideNav` 自动接管客户端跳转 + 关闭菜单 + 滚顶 + PageTransition 模糊过渡。**零新依赖**。

### 4.3 PageTransition 与图片加载的交互（Gallery 特别注意）

[App.jsx:37-66](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) 的 `waitForImagesReady()` 在路由切换的 `reveal-prepare` 阶段，会等待 `<main>` 内**所有非 lazy `<img>`** 加载完成 + 双 rAF 后才揭开模糊遮罩（8s 安全超时兜底）。

**对 Gallery 的硬性含义**：
- **首屏（above-the-fold）图片**可保持非 lazy，但要少（1–3 张），否则过渡被拖慢；
- **首屏以下所有图片必须 `loading="lazy"`**，否则 11+ 张原图会阻塞揭开，最坏拖到 8s 超时；
- PageTransition 的 `mainRef` 包裹整个 `<main>`，Gallery 在其内，故此约束直接生效。

---

## 五、现有摄影展示组件分析（Home 三处，差异化依据）

Home 已有三处摄影展示，Gallery 须与之**差异化**，避免观感重复：

### 5.1 FlyingPosters（WebGL 海报墙，OGL）

- 位置：[Home.jsx:260-262](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Home/Home.jsx) → `<FlyingPostersSection items={posterImages} />`，外包 `ErrorBoundary`。
- 数据：`posterImages = import.meta.glob('/Photography/*.{jpeg,jpg,png}')`（**仅根目录 6 张**，非递归）。
- 机制：[FlyingPosters.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/FlyingPosters/FlyingPosters.jsx) 用 OGL `Renderer` + 自定义着色器，把图片贴到可旋转扭曲的 Plane 上；[FlyingPostersSection.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/FlyingPosters/FlyingPostersSection.jsx) 做滚动 pin（`height: scrollLength vh` + sticky 容器，rAF 映射滚动进度到 `inst.scroll.target`）。
- props：`items`（图片 URL 数组）、`planeWidth/Height`、`distortion`、`scrollEase`、`disableWheel`。
- **Gallery 复用建议**：若作 Gallery hero 可接受，但 11 张全进海报墙信息量过低、不可浏览细节。**不建议作 Gallery 主体**。

### 5.2 FlowingMenu（全屏摄影菜单，GSAP）

- 位置：[Home.jsx:264-266](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Home/Home.jsx) → `<FlowingMenu items={flowingMenuItems} />`，4 项（Paris/Chaoshan/Beijing/Misc）。
- 数据：单图 `import` 写死（[Home.jsx:14-17](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Home/Home.jsx)），每项 `{ link, text, image }`。
- **Gallery 复用建议**：FlowingMenu 是"悬停展开全屏图"的导航式交互，**不适合做图集主体**（一次只能看一张）。Gallery 避免重复使用。

### 5.3 LensesShowcase（FluidGlass 透视镜，R3F）

- 位置：[LensesShowcase.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/LensesShowcase/LensesShowcase.jsx)，用单张 Chaoshan 图作 `<FluidGlass mode="lens" image={lensesPhoto} />`，外包 `ErrorBoundary`。
- **Gallery 复用建议**：FluidGlass 镜片效果适合做**单图聚焦/特色照片**展示，可作 Gallery 的"精选图"放大交互。⚠️ 有 3 个已修 bug，**严格遵循官方实现，勿魔改**；Safari 不支持 SVG displacement map，需降级 `backdrop-blur`。

### 5.4 差异化结论

Gallery 应采用 **Home 未用的布局形式**——优先 **CSS 网格 / Masonry / Lightbox** 这类系统性图集范式（Home 完全没有网格图集）。WebGL 组件（FluidGlass/FlyingPosters）仅作局部点缀或精选，不作主体。

---

## 六、可复用组件与工具清单（Gallery 专属）

### 6.1 工具组件

| 组件 | 路径 | 复用方式 |
|---|---|---|
| `ErrorBoundary` | [src/components/ErrorBoundary.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/ErrorBoundary.jsx) | `<ErrorBoundary fallback={null}><WebGLComp/></ErrorBoundary>`。捕获子树错误，失败子树降级（默认 `fallback=null`），兄弟存活。Gallery 内任何 WebGL 须外包 |

### 6.2 Gallery 可复用的 React Bits 组件

| 组件 | 能力 | Gallery 适用场景 | 备注 |
|---|---|---|---|
| `GlitchText` | 故障风标题（青色阴影） | 页面标题 | Projects 已用作 "FEATURED PROJECTS"，可参照 |
| `Shuffle` | 悬停文字洗牌 | 标题交互 | About 已用 |
| `SplitText` | GSAP 文字入场 | 标题入场 | — |
| `ShinyText` | 闪光文字 | CTA/链接强调 | — |
| `TrueFocus` | 聚焦高亮文字 | 标题强调 | Home 已用 |
| `ScrollVelocity` | 横向跑马灯 | 分类标签滚动 / 页面分隔 | Home 已用 |
| `ScrambledText` | 字符乱码揭示 | 章节简介 | Projects 已用 |
| `ScrollReveal` | 滚动逐词揭示 | 页面 intro 段落 | Home 已用，注意区分文案 |
| `Magnet` | 磁吸按钮（`disabled` 布尔 prop） | "Back to top" / 分类切换 CTA | 官方实现，`magnetStrength` 默认 2 |
| `GlassSurface` | 毛玻璃容器 | Lightbox/标题容器 | — |
| `GradualBlur` | 渐变模糊遮罩 | 网格顶/底渐隐 | Hero 已用 |
| `FluidGlass` | R3F 透视玻璃镜片 | 精选单图聚焦 | ⚠️ 严格遵循官方；Safari 降级；外包 ErrorBoundary |
| `FlyingPosters` | WebGL 海报墙 | （可选）Gallery hero | Home 已用，**避免作主体** |
| `BorderGlow` | 描边光晕 | 精选图描边 | hsla 多彩，**仅局部装饰，不外溢** |
| `CircularText` | 旋转环形文字 | 装饰 | About 已用，避免重复 |
| `FallingText` | 物理掉落文字 | — | About 已用，**避免重复** |
| `ASCIIText` | ASCII 文字（Three） | 视觉标题 | ⚠️ 需 IBM Plex Mono，**当前字体未加载** |
| `TextPressure` | 压力变形文字 | 大标题 | ⚠️ 需 Roboto Flex，**当前字体未加载** |
| `LogoLoop` | 无限滚动 logo 轨道 | 器材品牌墙（Sony/Nikon/DJI） | Home 已用 ×3 |

### 6.3 未被引用的保留组件

`PixelBlast`、`ShuffleText`、`SideRays` 当前未被引用，可按需启用（SideRays 是背景光线，可能适合 Gallery 氛围）。

### 6.4 可复用资源

- **本地图标**：`public/icons/` 含 `sony.svg`、`nikon.svg`、`dji.svg`（摄影器材品牌），可作 Gallery 器材墙。`si(slug)` helper 范式见 [Skills.jsx:6](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Skills/Skills.jsx)。
- **3D 模型**：`public/assets/3d/`（bar.glb / cube.glb / lens.glb）可复用（须外包 ErrorBoundary）。
- **个人图标**：`src/assets/EvanGongIcon.png`。

---

## 七、样式规范（Gallery 相关）

> 完整规范见 `docs/PROJECTS_PAGE_DEV_GUIDE.md` 第六节，此处仅列 Gallery 高频项。

### 7.1 设计 Token（[index.css:9-15](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/index.css)）

```css
:root {
  color-scheme: dark;
  --color-cyan: #00f0ff;    /* 唯一强调色 */
  --color-black: #000000;   /* 全站背景 */
  --color-white: #ffffff;   /* 正文/标题默认 */
  --color-gray: #9c9c9c;    /* Token 定义，CSS 基本未引用 */
}
```

### 7.2 配色规则（硬约束）

1. **三色制**：黑/白/青，**禁止引入第四主色**；强调色用 `var(--color-cyan)` / `#00f0ff`；3D 用 hex int `0x00f0ff`。
2. **透明度层级**：分隔线 `rgba(0,240,255,0.08~0.15)` → 悬停 `rgba(0,240,255,0.12)` → 边框 `rgba(0,240,255,0.25~0.6)` → 投影 `rgba(0,0,0,0.15~0.45)`。
3. 玻璃层以多档白色 rgba 叠加（`rgba(255,255,255,0.02~0.5)`）。
4. 唯一例外：`BorderGlow` hsla 多彩，**仅局部装饰，不外溢**。

### 7.3 字体

| 字体 | 用途 | 加载状态 |
|---|---|---|
| **Inter** (100-900) | 全站默认正文/标题 | ✅ `index.css @import` 已加载 |
| IBM Plex Mono (500/600) | 仅 ASCIIText | ❌ **当前未加载**（遗留） |
| Roboto Flex (100-1000 可变) | 仅 TextPressure | ❌ **当前未加载**（遗留） |

**字号层级**：`ScrollVelocity` > `ScrollReveal` > 正文。标题用最粗 900 + 负字距（`letter-spacing: -0.03em`）。流体排版用 `clamp()`。

### 7.4 布局规范

- section 最大宽度：**1100px（内容）/ 1400px（宽布局，图集宜用宽布局）** 居中，`margin: 0 auto`。
- section padding：`clamp()` 流体留白，照搬 About/Projects 范式：`padding: clamp(6rem, 14vw, 10rem) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 10vw, 8rem)`。
- 根 `.app` / `body` 背景 `var(--color-black)`。
- section 间以 `border-top: 1px solid rgba(0,240,255,0.08~0.15)` 区隔。

### 7.5 响应式断点（移动优先 + max-width 下探）

| 断点 | 主要适配 |
|---|---|
| **768px**（主断点） | 网格列数减少、字号/padding 收缩、双列改单列 |
| **480px** | 字号再降一档、网格改单列 |
| **1024px** | 宽容器收窄 |
| **900px** | 双列改单列 |
| **640px** | 兜底 |

### 7.6 可访问性

- `aria-label` 覆盖所有 section 与图片链接；
- `:focus-visible` 青色描边（`outline: 2px solid var(--color-cyan); outline-offset: 4px`）；
- 图集图片建议 `alt` 描述（地点/主题），非纯装饰；
- `prefers-reduced-motion` 关闭 Lightbox 过渡/网格入场动画。

### 7.7 范式参照（直接抄）

- **页面级 CSS**：[Projects.css](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Projects/Projects.css) —— `.projects-page` 布局、`clamp()` padding、`@media (max-width:768px)`、`@media (prefers-reduced-motion: reduce)` 三段式结构。
- **网格/列表扁平范式**：[Skills.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/components/Skills/Skills.jsx) + Skills.css —— 无 glow/gradient/shadow，仅实色 + 1px 边框 + 透明背景；行间 `border-bottom` 分隔；chip 悬停 → `rgba(0,240,255,0.12)` + 青色边框。
- **标题范式**：Projects 的 `GlitchText`（左对齐、`font-size: clamp(2rem,6vw,4.5rem)`）或 About 的 `Shuffle`。

---

## 八、数据与状态管理（Gallery 数据策略）

### 8.1 数据交互逻辑

- **无 API 调用**：零 fetch / axios。
- **数据内联**：延续模块级常量范式，在 `Gallery.jsx` 顶部定义图集数据。
- **图片资源**：`import.meta.glob('/Photography/**/*.{jpeg,jpg,png}', { eager: true, query: '?url', import: 'default' })` **递归取全部**（注意 Home 用的是非递归 `/Photography/*`，Gallery 要含子目录应用 `/**/*`）。

### 8.2 状态管理

- **无全局状态库**。组件内 `useState` / `useRef`。
- **Gallery 可能需要的本地状态**：当前分类筛选、Lightbox 打开/当前索引、网格入场动画触发。
- **跨组件通信**：Home 中 ScrollStack 通过 `window.__lenis` 全局暴露 Lenis；Gallery 自建 Lenis（不共享 ScrollStack 的），不涉及此全局。

### 8.3 Gallery 数据结构建议

由于 `import.meta.glob` 只给 URL 数组（无元数据），且根目录 6 张未归类，建议**手工补一份元数据常量**，按地域分组：

```js
const si = (slug) => `/icons/${slug}.svg`

// 用 import.meta.glob 递归取全部图，再按路径前缀匹配到分组
const photoModules = import.meta.glob('/Photography/**/*.{jpeg,jpg,png}', {
  eager: true, query: '?url', import: 'default'
})

// 分组定义（标题/简介/代表图标可按需）
const GALLERY_GROUPS = [
  { id: 'paris',        label: 'Paris',        path: '/Photography/Paris/' },
  { id: 'chaoshan',     label: 'Chaoshan',     path: '/Photography/Chaoshan/' },
  { id: 'beijing',      label: 'Beijing',      path: '/Photography/Beijing/' },
  { id: 'miscellaneous',label: 'Miscellaneous',path: '/Photography/Miscellaneous/' },
  { id: 'unsorted',     label: 'Unsorted',     path: '/Photography/' }, // 根目录
]

// 运行时把 glob 结果按 path 前缀分桶
function buildGalleryData(modules, groups) {
  // ...按 groups[i].path 过滤，根目录需排除子目录文件
}
```

**或**更简单：直接单图 `import` 列出每张（11 张可控），手工标注 `{ src, title, location, year, group }`。**推荐后者**——数量少、可控、可补标题。

---

## 九、关键架构决策点（需用户确认）

### 9.1 ⚡ Gallery 布局方案

| 方案 | 实现 | 优点 | 缺点 |
|---|---|---|---|
| **A. CSS 网格图集 + Lightbox** | 响应式网格（`grid-template-columns: repeat(auto-fill, minmax(...))`），点击放大全屏 Lightbox（纯 CSS/React state，无 WebGL） | 信息密度高、可浏览细节、与 Home 差异化明显、无 WebGL 依赖最稳、移动友好 | 视觉冲击弱于 3D |
| **B. Masonry 瀑布流** | CSS `column-count` 或 JS Masonry，不规则高度更"摄影集"感 | 摄影集感强、保留原图比例 | Lightbox 仍需自建；跨列顺序控制复杂 |
| **C. FlyingPosters hero + 网格** | 顶部 FlyingPosters 海报墙作 hero，下方网格图集 | 视觉冲击 + 系统浏览兼顾 | 与 Home 海报墙观感部分重复；WebGL 须真实浏览器验证 |
| **D. FluidGlass 精选 + 网格** | 顶部 1 张 FluidGlass 镜片精选，下方网格 | 视觉点缀 + 系统浏览；差异化好 | FluidGlass 有 bug 史 + Safari 降级，须验证 |

**推荐**：方案 A（最稳、最差异化）或方案 D（视觉 + 稳妥平衡）。理由：Home 已占 FlyingPosters/FlowingMenu，Gallery 宜换网格范式；方案 A 零 WebGL 风险，方案 D 仅局部 WebGL 可控。

### 9.2 分类与筛选

- 是否按地域分组（Paris/Chaoshan/Beijing/Misc/Unsorted）？
- 是否需要分类筛选 UI（标签切换 / 全部 + 各地域）？
- 根目录 6 张未归类——是否先人工归类到子目录，还是保留 "Unsorted" 分组？

### 9.3 大图查看方式

- **Lightbox（模态放大）**：点击网格图 → 全屏遮罩 + 大图 + 左右切换 + ESC 关闭。
- **就地展开**：点击行/卡就地放大。
- **无**（仅网格缩略图）。
- 推荐：Lightbox（图集标配，纯 React state 可实现，无新依赖）。

### 9.4 是否使用 WebGL 组件

若选方案 C/D 或用 FluidGlass/FlyingPosters：
- 须外包 `ErrorBoundary`；
- 3D 异步初始化加 `disposed` 标志检查（StrictMode 双挂载竞态）；
- 须 Chrome + Safari 真实浏览器验证（无头预览无 WebGL）；
- 若用 ASCIIText/TextPressure 须先修复字体加载。

### 9.5 图片资源处理

- 图片展示范围由 `photo-protection-manifest.json` 记录；原图只保存在仓库外的私有备份。
- 保护命令：`npm run images:protect -- --apply`；校验命令：`npm run images:protect -- --check`。
- 保护包括长边限制、重新压缩、版权元数据、署名水印和 SHA-256 指纹。

### 9.6 标题组件选择

`GlitchText`（Projects 已用，青色故障风）/ `Shuffle`（About 已用，悬停洗牌）/ `SplitText`（入场动画）/ `TrueFocus`（聚焦高亮）——选一作 Gallery 主标题，避免与 Projects/About 完全雷同。

---

## 十、Gallery 页面开发所需资源与依赖

### 10.1 路由注册（必须，零新依赖）

`react-router-dom` 已安装。仅需 [App.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx)：
1. 顶部 `import Gallery from './components/Gallery/Gallery.jsx'`
2. `<Routes>` 内 `<Route path="/gallery" element={<Gallery />} />`
3. ⚠️ 核验整段 Routes 完整（PageTransition 重构曾丢失 Projects 路由）

### 10.2 字体修复（仅当用 ASCIIText / TextPressure）

需在 `index.html` 恢复 Google Fonts `<link>` 或在 `index.css` 补充 `@import`：IBM Plex Mono（500/600）、Roboto Flex（100-1000 可变）。

### 10.3 资源

- **摄影图**：`Photography/` 与 `public/Photography/` 中的受保护展示图，具体清单见 `photo-protection-manifest.json`。
- **器材图标**：`public/icons/`（`sony.svg` / `nikon.svg` / `dji.svg`），`si()` helper 复用。
- **3D 模型**：`public/assets/3d/`（可选）。
- **个人图标**：`src/assets/EvanGongIcon.png`。

### 10.4 文件创建约定

按组件=文件夹约定：
```
src/components/Gallery/
├── Gallery.jsx      # 路由页组件（含自带 Lenis，照搬 About/Projects 模式 A）
└── Gallery.css      # 组件级样式
```
若拆子组件（如 `GalleryGrid/`、`Lightbox/`），同样遵循组件=文件夹约定。

---

## 十一、开发规范与最佳实践（硬约束）

> 源自项目累积工程约定与踩坑教训，Gallery 页面开发须严格遵守。

### 11.1 设计一致性

1. **三色制**：黑/白/青，禁第四主色；强调色用 `var(--color-cyan)` / `#00f0ff`；3D 用 `0x00f0ff`。
2. **字体层级**：正文/标题 Inter；等宽仅 ASCIIText 用 IBM Plex Mono；可变压力字仅 TextPressure 用 Roboto Flex。
3. **字号层级**：`ScrollVelocity` > `ScrollReveal` > 正文；标题最粗 900 + 负字距。
4. **卡片色**：若用卡片，青/白交替（`--cyan` 青底黑字 / `--white` 白底黑字），前景统一黑字。
5. **按钮**：胶囊形（`border-radius: 999px`）+ 半透明背景 + `backdrop-filter: blur(8px)`；悬停背景过渡到 `rgba(0,240,255,0.12)` + 青色边框（参照 `.scroll-stack-cta` 范式 [App.css:255-301](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.css)）。
6. **扁平列表区**（参考 Skills）：无 glow / 无 gradient / 无 shadow，仅实色 + 1px 边框 + 透明背景。

### 11.2 组件使用约定

1. **React Bits 组件严格遵循官方实现**：禁自定义魔改（曾因反转 FlyingPosters 滚动方向致渲染失败）。
2. **`Magnet`** 用官方实现，布尔 `disabled` 控制磁吸，`magnetStrength` 默认 2。
3. **`StaggeredMenu`** 的 `.sm-prelayers` 必须含 `right: 0`。
4. **WebGL 组件一律外包 `ErrorBoundary`**。
5. **3D 异步初始化**加 `disposed`/`cancelled` 标志检查，规避 React 19 StrictMode dev 双挂载竞态。
6. **Safari 兼容**：不支持 SVG displacement map 的 Liquid GLASS 组件（FluidGlass）降级 `backdrop-blur`。
7. **Lenis 实例**：Gallery 自建 Lenis（照搬 About/Projects 模式 A 配置），`useEffect` 清理 `cancelAnimationFrame` + `lenis.destroy()`，防路由切换残留 rAF：
   ```js
   useEffect(() => {
     const lenis = new Lenis({
       duration: 1.2,
       easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
       smoothWheel: true, touchMultiplier: 2, infinite: false,
       wheelMultiplier: 1, lerp: 0.1, syncTouch: true, syncTouchLerp: 0.075,
     })
     const raf = time => { lenis.raf(time); rafRef.current = requestAnimationFrame(raf) }
     rafRef.current = requestAnimationFrame(raf)
     return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lenis.destroy() }
   }, [])
   ```
8. **组件级 CSS 与组件同目录**；Home 专用全局 section 布局进 `App.css`；Token 进 `index.css`。Gallery 走组件级 CSS。

### 11.3 性能与构建

1. **图片 lazy**：首屏以下 `<img>` 一律 `loading="lazy"`（PageTransition `waitForImagesReady` 约束，见 4.3）。
2. **保护图片不是运行时转换**：不会依赖 Vite 插件在浏览器前临时处理；新增图片必须先运行保护脚本，勿把体积原图作首屏主视觉。
3. **重型 WebGL section**：考虑可见性管理（进入视口才挂载/门控 rAF），禁止常驻后台循环。
4. **CSS 特异性**：覆写组件默认样式时用后代选择器提升特异性（如 `.gallery-page .text-block { ... }`），勿依赖源码顺序（lazy 组件 CSS 注入晚）。
5. **验证**：3D 组件须在 Chrome + Safari 真实浏览器验证（无头预览无 WebGL，HMR 对 Ballpit/Lanyard 不可靠）。

### 11.4 版本控制（用户偏好）

- 改动后**直接提交 `main` 分支并推送**，不开 feature 分支。

---

## 十二、下一步行动

1. **路由注册**：在 [App.jsx](file:///Users/evangong/Library/CloudStorage/OneDrive-Personal/Programming/Web/evangong.tech/src/App.jsx) `<Routes>` 追加 `/gallery` 路由 + 顶部 import（零新依赖），核验 Routes 完整。
2. **待用户确认**（第九节）：
   - 9.1 布局方案（A 网格+Lightbox / B Masonry / C FlyingPosters hero+网格 / D FluidGlass 精选+网格）
   - 9.2 分类与筛选（按地域？是否筛选 UI？根目录 6 张如何处理）
   - 9.3 大图查看方式（Lightbox / 就地 / 无）
   - 9.4 是否使用 WebGL 组件
   - 9.5 图片资源处理（原图直引 / 启用 imagetools / 补元数据）
   - 9.6 标题组件选择
3. **待用户提供/确认**：摄影元数据（标题、地点、年份）——当前仅有文件名与目录归属，无标题等信息。若需展示元数据，需补一份常量或由用户确认是否只展示图。
4. 按确认结果创建 `src/components/Gallery/`（`Gallery.jsx` + `Gallery.css`），照搬 About/Projects 的 Lenis 模式与 Projects 的页面级 CSS 范式。
5. 真实浏览器（Chrome + Safari）验证。
