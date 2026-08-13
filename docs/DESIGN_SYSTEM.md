# evangong.tech 设计系统

> 版本：1.0 · 盘点日期：2026-08-13
> 本文档是根据当前工作树的 React、CSS、资源和本地浏览器运行时反向整理的“现状设计系统”。当本文档与旧 PRD、旧页面开发指南或历史截图冲突时，以当前源码和实际运行结果为准。

## 1. 设计系统定位

`evangong.tech` 是 Evan Gong 的个人作品集、实验室和 field notes 入口。它不是传统的“简历卡片集合”，而是把以下三类内容放在同一个体验里：

- **身份**：Evan Gong、Programming、AI、3D Printing、Robot、Photography、Table Tennis。
- **作品**：AI、机器人、硬件、macOS 工具和软件项目。
- **观察与审美**：摄影画廊、博客文章、硬件与 Agent 的 field notes。

因此，设计重点不是让每个页面都长得一样，而是让页面都遵循同一个张力：

> 极简的黑白青内容层，承载高密度的 3D、物理、光线和文字动效。

视觉效果负责建立记忆点，结构化排版负责让内容仍然可读、可扫描、可导航。未来页面应先确认内容结构，再决定是否需要 WebGL 或复杂动效；动效不能替代页面层级。

## 2. 现状架构与页面关系

### 2.1 全站外壳

入口在 `src/main.jsx`，由 `StrictMode` 启动 `App`。`src/App.jsx` 提供共享外壳：

```text
BrowserRouter
└─ .app
   ├─ StaggeredMenu（固定右侧菜单，/gallery/:category 隐藏）
   ├─ main
   │  └─ Routes
   ├─ Footer（/gallery/:category 隐藏）
   └─ PageTransition（全屏模糊遮罩）
```

非首页路由通过 `React.lazy` 加载，并用 `Suspense fallback={null}` 包裹。所有页面共用 `src/index.css` 的全局 reset、字体、颜色变量和黑色背景；页面自身的布局放在对应组件目录的 CSS 中。

### 2.2 路由矩阵

| 路由 | 页面 | 主要职责 | 菜单 | Footer |
| --- | --- | --- | --- | --- |
| `/` | Home | 沉浸式首页、身份、精选项目、技能、摄影、联系入口 | 显示 | 显示 |
| `/about` | About | 个人介绍、交互式自述、Skills | 显示 | 显示 |
| `/projects` | Projects | 可展开的项目列表、技术栈和外链 | 显示 | 显示 |
| `/gallery` | Gallery | 摄影分类的 3D 无限球面入口 | 显示 | 显示 |
| `/gallery/:category` | GalleryCategory | 某一摄影分类的全屏 Dome Gallery | 隐藏 | 隐藏 |
| `/blog` | Blog | Featured notes、按年份归档、tag 筛选 | 显示 | 显示 |
| `/blog/:slug` | BlogPost | Markdown 文章、目录、阅读进度、相关文章 | 显示 | 显示 |
| `/awards` | Awards | 编辑式荣誉时间线、可展开案例、证明与项目入口 | 显示 | 显示 |
| 其他 | Home fallback | `path="*"` 回退到首页 | 显示 | 显示 |

### 2.3 导航与页面切换

普通站内 `<a>` 使用 `data-nav-link`，由 `App.jsx` 的文档级 capture handler 接管：

1. 阻止浏览器完整刷新。
2. 进入 1 秒的 blur-out。
3. 执行 React Router 导航。
4. 等待新页面非 lazy 图片完成加载；图片最多阻塞 8 秒。
5. 在双 `requestAnimationFrame` 后进入 1 秒 blur-in。

`PageTransition.css` 的激活态是 `backdrop-filter: blur(50px)` 加 `rgba(0,0,0,.55)`。因此新页面的站内链接应优先使用 `data-nav-link`，自定义按钮应通过 `NavContext` 的 `triggerTransition` 走同一套过渡。外部链接、`mailto:`、`tel:`、hash 链接不应被拦截。

## 3. 核心视觉语言

### 3.1 品牌气质

关键词是：

- **Dark technical**：黑色底、低透明度分隔线、白色信息层。
- **Cyan signal**：青色是系统唯一明确的视觉信号，用来表示焦点、链接、状态、关键词和可操作性。
- **Immersive**：Ballpit、Lanyard、光线、镜片、ASCII、摄影球面和海报让页面拥有空间感。
- **Editorial**：博客和项目页用大标题、eyebrow、编号、细分隔线、窄文本列建立编辑式阅读秩序。
- **Tactile**：拖拽、悬停、滚动、物理碰撞、文字洗牌和磁吸让内容有“被操作”的感觉。

避免把风格描述成泛泛的“赛博朋克”。它更准确的组合是：**黑白编辑设计 + 青色仪表信号 + 3D 实验室界面**。

### 3.2 色彩 Token

全局 Token 定义在 `src/index.css`：

| Token | 值 | 角色 |
| --- | --- | --- |
| `--color-black` | `#000000` | 页面、section、菜单和主要容器背景 |
| `--color-white` | `#ffffff` | 标题、正文、白色卡片和高亮前景 |
| `--color-cyan` | `#00f0ff` | 主强调色、链接、焦点、关键词、青色卡片、3D 灯光 |
| `--color-gray` | `#9c9c9c` | 中性 Token；目前主要在 Ballpit 的 3D 颜色数组中以 hex 使用 |

推荐的透明度层级来自当前 CSS 的真实用法：

| 层级 | 示例 | 用途 |
| --- | --- | --- |
| 微弱分隔 | `rgba(0, 240, 255, .08-.12)` | section 顶线、列表线、画廊边框 |
| 轻交互底 | `rgba(0, 240, 255, .06-.12)` | 胶囊 CTA、chip hover、blockquote |
| 可见边框 | `rgba(0, 240, 255, .25-.6)` | chip、back link、焦点边界、交互框 |
| 玻璃白 | `rgba(255, 255, 255, .02-.3)` | 毛玻璃底、白色 halo、社交圆按钮 |
| 遮罩黑 | `rgba(0, 0, 0, .4-.78)` | WebGL 可读性遮罩、scrim、过渡层 |

规则：

1. 新页面默认只用黑、白、青三色，不引入第四个品牌主色。
2. 多色 `BorderGlow` 只属于 `LensesShowcase` 的局部装饰，不能扩散成全站配色。
3. 同一页面中，青色应表示“可关注/可操作/当前重点”，不要同时把它当作普通正文色。
4. 需要反转的卡片应使用黑字，不要在青底或白底上继续使用低对比度青色正文。

### 3.3 字体与文字层级

当前全局明确加载和继承的是 Google Fonts 的 **Inter**，权重范围 100–900。源码没有建立独立的字号 Token，所以新增页面应沿用现有 `clamp()` 方式，而不是创建另一套固定字号体系。

现有角色：

| 角色 | 当前表现 | 参考实现 |
| --- | --- | --- |
| Display / Hero | 900、负字距、`clamp(4rem, 10vw, 10rem)` | `.hero-title` |
| Page title | 800–900、负字距、通常全大写或强视觉词 | Blog、Projects、Gallery、About |
| Section title | 700–800、负字距 | Blog section heading、Skills |
| Body | 400、1.55–1.85 行高、最大 38–65ch | About、Blog、项目描述 |
| Eyebrow / metadata | 600–700、约 `.7rem`、`letter-spacing: .12-.16em`、uppercase | Blog、Projects、Skills |
| Chip / CTA | 500–600、`.75-.95rem`、轻微字距 | 技术栈、按钮、过滤器 |

排版原则：

- 标题可以很大，但正文必须回到窄文本列，保证阅读节奏。
- 标题多用 `letter-spacing: -0.02em` 到 `-0.08em`；metadata 反向使用正字距。
- 关键词可以染青，但应保持正文的语法和自然换行。
- `ASCIIText` 和 `TextPressure` 是特殊视觉组件，不应成为普通正文的字体替代品；它们只适合短标题或装饰。

### 3.4 容器、留白与分隔

页面内容宽度有两个主要档位：

- **约 1100px**：About intro、Skills、Blog article body、局部阅读内容。
- **约 1400px**：Home 大 section、Projects 列表、Blog archive、Gallery 舞台。

典型页面 padding：

```css
padding: clamp(6rem, 14vw, 10rem)
         clamp(1.25rem, 5vw, 4rem)
         clamp(4rem, 10vw, 8rem);
```

新增页面应优先采用 `max-width + margin: 0 auto + clamp()`，不要用固定的全屏内边距。section 之间通常用 `border-top: 1px solid rgba(0, 240, 255, .08-.16)` 建立节拍；黑底留白本身也是层级，不需要每个 section 都有卡片背景。

## 4. 组件与交互模式

### 4.1 全局组件

| 组件 | 位置 | 作用和使用边界 |
| --- | --- | --- |
| `StaggeredMenu` | `App.jsx` | 固定右侧菜单；黑色抽屉、超大 uppercase 菜单项、青色 hover/current。只在页面外壳使用。 |
| `PageTransition` | `App.jsx` | 站内路由的全屏模糊切换；不要在页面内部再叠加一套导航过渡。 |
| `Footer` | `App.jsx` | 约三分之一屏高，左侧 MetallicPaint logo，右侧 GitHub/X/Instagram 圆形入口。 |
| `ErrorBoundary` | 多个 WebGL section | 包住可能因 WebGL、纹理或 3D 模型失败的子树；失败时保留兄弟内容。 |

### 4.2 内容和表面组件

| 模式/组件 | 当前用法 | 视觉规则 |
| --- | --- | --- |
| `GlassSurface` | Hero、Contact 按钮、scroll indicator | 56px 高胶囊是默认 CTA 形态；背景透明度低、边框偏白，Safari/Firefox 或强制 fallback 时用 CSS blur。 |
| 技术/技能 chip | Projects、About Skills、Blog tags | `border: 1px`、`border-radius: 999px`、透明底；hover 变青底/青边/青字。 |
| 反转卡片 | Blog featured、related、Projects row | 黑底白字默认；hover/focus 后可以变青底黑字或白底黑字，同时更新内部 metadata 和图标对比度。 |
| 实色卡片 | Home ScrollStack | 青/白交替，统一黑字，圆角约 20–32px，阴影只用于抬升，不要再叠加玻璃。 |
| `LogoLoop` | Home Programming / Photography / AI | 白色品牌图标横向循环，fade 到黑色，hover 降速或放大；移动端标签从竖排改横排。 |
| `ShinyText` | 联系邮箱、scroll 指示 | 只用于短文本 CTA 或装饰，不用于段落。 |

### 4.3 文字动效

| 组件 | 适合的内容 | 触发方式 |
| --- | --- | --- |
| `Shuffle` | Hero 名字、About 标题、Blog 文章标题 | 首次出现、hover 或一次性触发；适合短标题。 |
| `GlitchText` | Projects 和 Blog 的页面标题 | 常驻或 hover glitch；只放在一级标题，不要让每个小标题都 glitch。 |
| `RotatingText` | Hero 副标题中的兴趣/身份 | 约 2.5 秒轮换，字符级 spring 过渡。 |
| `ScrollReveal` | Home 的主张段落 | 滚动时逐词出现，关键词保持青色。 |
| `ScrollVelocity` | 兴趣 marquee | 大字号 uppercase 横向循环，黑底、青白两行对照。 |
| `ScrollStack` | Home 精选项目 | 窗口滚动驱动卡片堆叠；不要在 Projects 详情页机械复制同一构图。 |
| `ScrambledText` | Projects 项目长描述 | hover/focus 附近触发；正文仍须可直接阅读。 |
| `FallingText` | About 自述 | 物理文字、hover 触发；作为大块体验区，不当作导航。 |
| `TrueFocus` | Home “True Focus” | 手动焦点/边框装饰，适合短语。 |
| `SplitText` | Contact headline | 入场分词，保持标题语义清楚。 |

### 4.4 WebGL 与沉浸组件

当前正在页面中使用的主要 WebGL/Canvas 组件：

| 组件 | 页面/位置 | 内容作用 | 必须注意 |
| --- | --- | --- | --- |
| `Ballpit` | Home Hero 背景 | 150 个白/青/灰球体，跟随鼠标，形成首屏材质背景 | 只能做背景；文字层必须有更高 z-index。 |
| `Lanyard` | Home Hero 右侧 | 带 Evan logo 的可交互挂牌 | 需 `ErrorBoundary`，移动端变成相对定位的较小区域。 |
| `FlyingPosters` | Home 摄影段 | 400vh pin 区内由滚动推动摄影海报 | 资源多、视差强；仅用在独立视觉段。 |
| `FlowingMenu` | Home 摄影入口 | 地点分行，hover 显示横向摄影 marquee | 文案 uppercase，图片为短横向胶囊。 |
| `LensesShowcase` | Home | “Through the Lenses” + 彩色描边 + 3D lens | 多色 glow 是局部例外，不要移植到全站。 |
| `Hyperspeed` | Home Contact 背景 | 黑色高速道路和青白光线 | 纯背景，内容层必须有遮罩/高对比度。 |
| `ASCIIText` | Contact 右侧 | “Hey” ASCII 字符视觉 | 内容短、需降级，不能承担唯一信息。 |
| `InfiniteMenu` | Gallery | 可拖拽旋转的摄影类别球面 | 入口动作通过 `NavContext`，不要绕开页面切换。 |
| `DomeGallery` | Gallery category | 全屏、可拖拽/查看 EXIF 的图片穹顶 | 独立全屏页，菜单和 Footer 隐藏。 |
| `MetallicPaint` | About / Footer | Logo 的金属液体质感 | 是 logo 装饰，不要把正文做成金属效果。 |

所有 WebGL 组件都应包在 `ErrorBoundary` 中。异步初始化要有 `cancelled`/`disposed` 清理逻辑；页面卸载时取消 rAF、observer 和 Lenis，避免路由切换后重复运行。

当前文件中还存在 `PixelBlast`、`ShuffleText` 等未被当前页面引用的本地组件。它们属于可用素材，不等于当前设计系统的默认组件；启用前需重新验证视觉必要性、性能和降级。

## 5. 页面级设计蓝图

### 5.1 Home：沉浸式叙事长页

Home 的 section 顺序就是主要叙事顺序，不应随意交换：

1. **Hero**：Ballpit 背景、Evan Gong 超大标题、兴趣轮换、View Projects / About me 玻璃按钮、Lanyard、scroll indicator。
2. **Interests marquee**：白色兴趣行 + 青色兴趣行，建立个人范围。
3. **About statement**：大字号逐词揭示，physical/digital/robotic/3D/camera 等关键词染青。
4. **Current projects**：青白交替的五个 ScrollStack 项目卡，最后一张是合作 CTA。
5. **Tools and brands**：Programming、Photography、AI 三组 LogoLoop。
6. **True Focus**：短语型视觉停顿。
7. **Photography posters**：长 pin 视觉段，滚动推进海报。
8. **Photography flowing menu**：Paris、Chaoshan、Beijing、Miscellaneous 四个地点。
9. **Through the Lenses**：TextPressure、BorderGlow、FluidGlass。
10. **Contact**：Let's build the future、邮箱、Get in touch、Github、ASCII “Hey”。
11. **Footer**：MetallicPaint logo 与社交入口。

Home 的体验目标是“从身份进入能力，从能力进入作品，从作品进入审美与合作”。未来新增 section 应说明它属于哪一段叙事，避免只因“有一个好看的组件”而插入。

### 5.2 About：个人介绍与能力目录

结构：


```text
.about-page
├─ 固定左下 CircularText：Programming * Robotics * Photography
├─ 居中 Shuffle 标题：Hi, I'm Evan
├─ icon + intro 双列（移动端变单列）
├─ FallingText 物理交互区
└─ Skills：五组扁平 chip 行
```

About 的重点是“人”和“能力”，所以内容区比 Home 更克制：黑色背景、窄容器、较少背景特效、青色关键词和技能 chip。Skills 是最适合新增分类的范式：数据数组、图标/文字 badge fallback、按组横向排列、768px 后纵向排列。

### 5.3 Projects：编辑式项目索引

Projects 使用固定 SideRays 背景与黑色径向遮罩，前景是横向项目行：

```text
页面标题（GlitchText，左对齐）
└─ 顶部青色细线
   ├─ 编号 + 年份
   ├─ 青色项目名称
   └─ hover/focus 展开：tagline → ScrambledText intro → features → tech chips → links
```

桌面端：hover 或 focus-within 时行变白、文字变黑、详情由 `0fr` 展开为 `1fr`。移动端：详情始终展开，不依赖 hover。整个 row 可点击打开 GitHub，但内部 tech 和 demo 链接保留自己的目标。

这是一个很重要的内容模式：**项目名称必须始终可见，细节渐进展开**。未来增加项目时要保持信息 schema（index、year、name、tagline、intro、features、tech、link、demo），不要把每个项目重新设计成不同的卡片。

### 5.4 Gallery：入口页与沉浸详情页分离

`/gallery` 是带标题和说明的入口页：

- `GALLERY` 白色超大标题。
- 一段灰白说明文字和青色手势图标。
- 约 `100vh` 的 InfiniteMenu 舞台，黑底、青色圆形 action button。

`/gallery/:category` 是另一种页面，不是普通内容页：

- fixed、100vw、100vh、overflow hidden。
- DomeGallery 填满视口。
- 顶部左侧固定青色描边胶囊 Back to Gallery。
- App 级菜单和 Footer 隐藏。

页面之间的差异是有意的：入口页负责解释操作，详情页负责让照片占满视野。不要在 category 详情页加入普通长文、Footer 或常规页边距。

### 5.5 Blog：编辑索引

Blog 采用更像杂志目录的结构：

1. eyebrow：`EVAN GONG / FIELD NOTES`。
2. 超大 `BLOG` 标题，GlitchText 的青白阴影。
3. 一段左侧错位的 intro。
4. `01 Selected notes`：最多三列 featured cards，图片默认去色，hover 变彩色并放大。
5. `02 All field notes`：All/tag 胶囊过滤器，按年份分组的文章行。

featured card 是黑底，hover 变青底黑字；archive row 使用小图、metadata、标题、excerpt、tags 和右侧箭头。560px 以下隐藏 archive excerpt 和 tags，保留标题与导航性。

内容来自 `src/content/blog/*.md`。`blogData.js` 在构建时 eager glob 原始 Markdown，解析轻量 frontmatter：`slug`、`title`、`excerpt`、`date`、`tags`、`featured`、`cover`、`readingTime`。新增文章优先复用这套 schema，不要在 Blog JSX 里硬编码文章卡。

### 5.6 BlogPost：长文阅读

文章页的阅读框架是：

```text
顶部固定 3px 青色阅读进度
└─ Back to Field Notes
   └─ FIELD NOTE / YEAR
      └─ 超大标题（Shuffle）
         └─ excerpt + date/read time/tags
            └─ 宽封面（轻度 grayscale + contrast）
               └─ sticky TOC + 窄正文列
                  └─ related cards
                     └─ Back to all field notes
```

正文使用 ReactMarkdown + GFM。`h2` 自动生成目录锚点；链接、列表 marker、blockquote、code、pre、table 和图片均通过青色细线/低透明背景统一。正文列建议保持约 46rem，不能把长文拉满 1400px。

### 5.7 Awards：编辑式荣誉时间线

Awards 以最新年份在前的单一时间线组织跨领域荣誉，不重复建立 Featured 卡片区：

```text
EVAN GONG / RECOGNITION + DEMO 标识
└─ 超大 AWARDS（GlitchText）
   └─ intro + 奖项数 / 领域数 / 年份跨度
      └─ 01 Recognition timeline
         ├─ sticky 年份 + 普通奖项条目
         └─ 重点奖项原位展开：Challenge / My contribution / Outcome / media
            └─ Explore Projects
```

桌面端年份列 sticky，奖项行 hover/focus 时切换为青底黑字；768px 以下恢复单列文档流。重点案例一次只展开一个，媒体使用原生 `<dialog>` 查看。时间线滚动点亮属于渐进增强，不支持 scroll timeline 或启用 reduced motion 时保持静态细线。内容来自同目录 `awardsData.js`；演示数据必须持续显示 `DEMO CONTENT` 和 `MOCK MEDIA`，替换真实内容后再关闭 `isDemo`。

## 6. 响应式规则

当前采用 `max-width` 下探和 `clamp()` 流体排版：

| 断点 | 现有系统行为 | 新页面应遵守 |
| --- | --- | --- |
| `1024px` | Hero padding 和 Lanyard 宽度收窄；菜单宽度开始更激进适配 | 不要让 3D 装饰继续占据内容列 |
| `900px` | Contact 双列改单列，ASCII 视觉上移 | 将“视觉 + 内容”双列转为内容优先顺序 |
| `768px` | 主断点：双列改单列、项目行详情常开、卡片纵向、logo 标签横排、Footer 居中 | hover-only 信息必须改为常显或可点击展开 |
| `640px` | 菜单面板全宽 | 菜单不能留下窄抽屉造成内容遮挡 |
| `480px` | Hero 按钮纵排、标题/圆角/间距再降档、Blog archive 隐藏次要信息 | 保留标题、主要行动和可访问名称，删减非核心装饰 |

响应式优先级：

1. 内容和操作顺序。
2. 标题可读性与不溢出。
3. 图片/3D 的比例和性能。
4. 装饰细节。

不要只把桌面字号缩小；应明确哪些信息在移动端仍然必须出现，以及哪些 hover 行为需要改成常显。

## 7. 无障碍、降级与性能

### 7.1 可访问性基线

- 每个主要 section 使用 `aria-label` 或标题关联。
- 图标链接提供 `aria-label`，装饰性 canvas/图像使用 `aria-hidden` 或空 alt。
- 可交互元素使用 `:focus-visible`，默认青色 2px outline，并留出 outline offset。
- Projects row 虽然是 `article`，但通过 `tabIndex=0`、`role="link"` 和 Enter/Space 支持键盘打开。
- Gallery 这类拖拽体验必须同时提供可识别的标题、说明和 Back 链接。
- `prefers-reduced-motion` 已在部分页面处理；新增复杂动效必须至少提供缩短/取消动画的规则。

### 7.2 WebGL 降级

降级不是可选项。页面的标题、正文、链接和项目数据不能依赖 WebGL 才存在。

- 3D 组件包进 `ErrorBoundary`。
- WebGL 失败时保留黑底和结构化内容，允许视觉子树为空。
- GlassSurface 在不支持 SVG displacement 或被 `forceFallback` 时使用 `backdrop-filter` 版本；再不支持时应保留半透明背景和边框。
- 不要把唯一 CTA 放进 canvas；CTA 应是 HTML 元素。

### 7.3 性能边界

- 非首页路由在 `App.jsx` 中 lazy load；重型 section 使用 `DeferredMount` 等接近视口才挂载。
- 400vh FlyingPosters 的 rAF 只在 section 可见时运行。
- 图片优先使用 Vite/Sharp 构建流程的压缩资源；不要直接把原始大图作为新页面首屏背景。
- 新增 3D section 时，先确认它的首屏必要性、GPU 上下文数量、纹理尺寸和卸载逻辑。
- 页面切换期间不要再创建第二套全局遮罩或平滑滚动实例。

## 8. 新页面实施模板

### 8.1 建议目录

```text
src/components/NewPage/
├─ NewPage.jsx
└─ NewPage.css
```

页面根节点使用语义化 `<section>` 或 `<article>`，BEM 风格类名，并通过 `aria-label` 或真实标题建立可访问结构。页面内容和数据如果会增长，应放在同目录的 data 模块或 `src/content/`，不要把大量内容散落在 JSX 中。

### 8.2 页面设计顺序

1. 先写页面目标、主要内容层级和唯一主操作。
2. 选 1100px 或 1400px 内容宽度档位。
3. 选黑底内容页、编辑式列表、实色卡片或全屏沉浸页中的一种主构图。
4. 只定义一个主视觉动效；其他动效服务于层级或反馈。
5. 复用现有 link、chip、eyebrow、section heading、CTA 和 page transition 习惯。
6. 让移动端在无 hover、无 WebGL、无高性能 GPU 时仍能完成主要任务。

### 8.3 推荐页面骨架

```jsx
export default function NewPage() {
  return (
    <section className="new-page" aria-label="Page purpose">
      <header className="new-page__hero">
        <div className="new-page__eyebrow">EVAN GONG / CATEGORY</div>
        <h1 className="new-page__title">PAGE TITLE</h1>
        <p className="new-page__intro">A short explanation that establishes the page.</p>
      </header>

      <section className="new-page__content" aria-labelledby="new-page-section-title">
        <div className="section-heading">
          <span className="section-heading__index">01</span>
          <h2 id="new-page-section-title">Content group</h2>
        </div>
        {/* HTML content first; optional WebGL decoration is secondary. */}
      </section>
    </section>
  )
}
```

需要 WebGL 时：

```jsx
<ErrorBoundary>
  <VisualComponent />
</ErrorBoundary>
```

需要站内导航时，普通链接用 `href="/target" data-nav-link`；组件内部按钮使用 `NavContext` 的 `triggerTransition`，保证和菜单导航一致。

## 9. 设计决策检查表

提交新页面或大改版前，逐项确认：

- [ ] 页面是否仍然以黑、白、青为主色，且青色只承担强调/操作语义？
- [ ] 是否沿用了 Inter、负字距大标题、uppercase metadata 和窄正文列？
- [ ] 是否使用了 1100px/1400px 内容宽度与 `clamp()` 留白？
- [ ] 页面是否有清晰的 hero → content → action 结构，而不是只有背景特效？
- [ ] WebGL 是否是增强层，HTML 是否独立可读？
- [ ] 所有站内链接是否接入 `data-nav-link` 或 `NavContext`？
- [ ] hover 内容在 768px 以下是否常显或有等价触控路径？
- [ ] 是否有 `focus-visible`、aria label、键盘路径和 reduced-motion 方案？
- [ ] 是否包裹了 WebGL `ErrorBoundary`，并清理了 rAF/observer/Lenis？
- [ ] 是否验证了桌面、平板、手机和无 WebGL/低动效状态？
- [ ] 是否更新了路由表、页面导航和必要的内容数据 schema？

## 10. 当前实现中的已知边界

这些不是未来设计必须立即修复的问题，但新增页面时必须知道：

1. `--color-gray` 已定义但不是主要 CSS 中性色；实际灰度多通过白色 opacity 表达。
2. 全站没有集中式 spacing/type scale Token，规则分布在 `index.css`、`App.css` 和组件 CSS 中。本文档的数值是现有实现的约束摘要，不代表已经存在同名变量。
3. `/gallery` 是普通入口页，只有 `/gallery/:category` 才会隐藏菜单和 Footer；不要依据旧注释把两者混为全屏详情页。
4. `GlassSurface` 的 SVG filter 在浏览器间能力不同；当前 Contact 按钮显式使用 `forceFallback`，未来复用时应根据目标浏览器确认。
5. `PixelBlast`、`ShuffleText` 等本地组件存在但当前没有进入页面编排；“存在于组件目录”不等于“已经是默认设计模式”。
6. 旧的 `docs/TECHNICAL_ANALYSIS.md` 和各页面开发指南包含历史阶段信息。新增页面请先检查当前 `App.jsx`、`index.css`、对应页面 JSX/CSS 及运行时，而不是直接复制旧文档里的旧路由和旧 section 清单。

## 11. 设计系统索引

需要实现新页面时，建议按以下顺序查阅：

1. `src/index.css`：全局颜色、字体、reset。
2. `src/App.jsx`：路由、共享外壳、导航过渡、菜单。
3. `src/App.css`：Home 的 section、ScrollStack、LogoLoop、CTA 全局布局。
4. `src/components/About/`：独立路由页、Lenis、Skills chip 范式。
5. `src/components/Projects/`：编辑式列表、可展开详情、tech chip 和键盘交互。
6. `src/components/Blog/`：索引卡片、年份归档、tag 过滤。
7. `src/components/Blog/BlogPost.css`：长文、目录、代码、表格、相关文章。
8. `src/components/Gallery/`：入口页与 full-viewport 沉浸页的边界。
9. `src/components/Awards/`：编辑式时间线、原位展开案例和原生 dialog 媒体查看。
10. `src/components/ErrorBoundary.jsx` 与 WebGL 组件：降级和清理范式。

这套系统的核心不是“每个页面都加一个新特效”，而是保持黑白青内容层、编辑式信息层级、可感知的交互反馈，以及在高性能视觉失效时仍然成立的页面结构。
