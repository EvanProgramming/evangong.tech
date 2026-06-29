# ScrollStack 闪烁（抽搐）修复说明

## 问题现象

滚动经过 Scroll Stack 区段时，已 pin（固定）的上方 Stack 卡片持续上下闪烁/抽搐，无法稳定停留在堆叠位置。

## 根本原因

`ScrollStack.jsx` 的 `getElementOffset` 在 `useWindowScroll=true` 模式下使用 `getBoundingClientRect().top + window.scrollY` 读取卡片位置，而 `getBoundingClientRect()` 返回的是**经过 CSS transform 变换后的**位置。

`updateCardTransforms` 每帧读取 `cardTop` 并据此计算 `translateY`，再写回 `card.style.transform`。这形成了一个**反馈循环**：

```
帧 N    : 读 cardTop（含上一帧 translateY_N）→ 算出错误的 translateY_{N+1}（≈0 或负）→ 卡片跳回原位
帧 N+1  : 读 cardTop（≈原位）                → 算出正确的 translateY             → 卡片跳回 pinned 位
帧 N+2  : 读 cardTop（含 translateY）         → 算出错误值                       → 卡片跳回原位
...                                                                    循环 → 上下闪烁
```

Lenis 的 `lerp: 0.1` 平滑插值每帧触发 `scroll` 事件，使震荡持续可见。pinned 卡片 `translateY` 最大，震荡幅度最明显，因此"上方 Stack 卡片"闪烁最严重，与用户描述吻合。

### 为什么官方默认实现不闪烁

官方 React Bits 默认 `useWindowScroll=false`，此时 `getElementOffset` 走 `element.offsetTop`（相对 offsetParent 的布局位置，**不受 transform 影响**），无反馈循环。

本项目因架构约束必须使用 `useWindowScroll=true`（window scroll-driven stacking + Lenis integration），走 `getBoundingClientRect()` 分支，触发此 bug。官方实现的两个分支在 `useWindowScroll=true` 时本身存在该缺陷，仅是默认未启用。

## 解决方案

在 `useWindowScroll=true` 时缓存每张卡片的**原始文档绝对 offset**（在应用任何 `translateY` 之前读取），`updateCardTransforms` 改用缓存值，打破反馈循环。

- 初始化时 `transform=translateZ(0)`（z 轴平移，不改变 `rect.top`），此时 `getBoundingClientRect().top` 等于真实 layout top，缓存值正确。
- 之后即使 `translateY` 移动卡片，缓存保持不变，`cardTop` 始终是固定的布局位置，与官方 `offsetTop` 语义一致。
- `useWindowScroll=false` 模式保持官方 `offsetTop` 行为不变（每帧读取，安全）。
- 新增 `resize` 监听：因区段使用 `20vh` 顶部 padding，窗口尺寸变化会改变每张卡片的布局 offset，需重新捕获缓存并重置 transform 以读取真实位置。

## 代码变更记录

### `ScrollStack.jsx`

1. **新增 `cardOffsetsRef`**：缓存每张卡片的原始文档绝对 offset。

2. **`updateCardTransforms` 中的两处读取改用缓存**：
   - 主循环 `cardTop`（用于 triggerStart / pinStart / translateY 计算）
   - blur 计算中的 `jCardTop`（用于 topCardIndex 判定）

   ```jsx
   const cardTop = useWindowScroll
     ? (cardOffsetsRef.current[i] ?? getElementOffset(card))
     : getElementOffset(card);
   ```

3. **`useLayoutEffect` 新增 `captureOffsets()`**：在设置 transform 样式后、`setupLenis()` 前捕获缓存。

4. **新增 `handleResize`**：resize 时重置 transform → 重新捕获缓存 → 清空 transforms 缓存 → 触发一次更新。

5. **cleanup**：移除 resize 监听，清空 `cardOffsetsRef.current`。

## 不受影响的部分

- `getElementOffset` 函数本身保留（`useWindowScroll=false` 分支和 `.scroll-stack-end` 仍用，因 end 元素无 transform，`getBoundingClientRect` 稳定）。
- Lenis 配置、ScrollTrigger bridge、`isUpdatingRef` 防重入、`lastTransformsRef` 去抖动逻辑均不变。
- 非 window-scroll 模式行为与官方完全一致。

## 验证清单

请在真实浏览器（内置预览环境对滚动/动画不可靠）验证：

- [ ] Chrome：滚动经过 Scroll Stack 区段，已 pin 卡片稳定停留在堆叠位置，无上下闪烁
- [ ] Safari：同上
- [ ] 快速滚动 / 慢速滚动 / 触摸板惯性滚动均无闪烁
- [ ] 改变窗口尺寸（resize）后，卡片的 pin 触发点正确更新，无错位
- [ ] 向上回滚时卡片能正常释放 pin，回到原位
- [ ] 控制台无新报错
