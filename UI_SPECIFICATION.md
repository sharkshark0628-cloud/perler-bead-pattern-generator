# 智能拼豆图纸生成器 --- High-Fidelity UI Specification

**Document:** `UI_SPECIFICATION.md`\
**Version:** 1.1\
**Status:** Approved Visual Baseline\
**Platform:** 微信小程序\
**Product Working Name:** BeadCraft\
**Design Direction:** Muted & Pastel · Near-Monochromatic · Card-Based
Layered Design · Neo-Minimalism\
**Design Philosophy:** Approachable Sophistication\
**Related Documents:** `PRO.md`, `ARCHITECTURE.md`, `AGENTS.md`,
`UX_SPECIFICATION.md`

------------------------------------------------------------------------

## 1. Document Purpose

本文档定义 BeadCraft MVP 的正式高保真 UI 视觉规范，并取代 v1.0 的
`Cute Minimal Craft` 视觉基线。

v1.1 不修改 PRD 与 UX
已确认的产品规则。首次生成无需登录；保存与导出需要微信登录；固定三个生成方案；允许单方案失败；每日重新生成
5 次；豆板尺寸为 `52×52 / 78×78 / 104×104`；MVP 品牌为
`MARD`；制作难度为
`简单 / 标准 / 精细`；保留安全边距、单指拖动、双指缩放、90°
步进旋转；最终 Pattern Data 是 Source of
Truth；保存图纸只读；产品仍是智能生成器而非拼豆编辑器。

本文档只定义这些功能如何呈现在视觉界面中。

------------------------------------------------------------------------

## 2. Visual Direction

正式视觉方向：

> **Neo-Minimalism with Muted Pastel Layered Cards**

界面使用克制、柔和、近单色的粉彩体系，通过暖象牙白、奶油粉、少量燕麦黄、深色高对比文字、大圆角卡片、细边框、极轻阴影和
Surface Layering 建立视觉秩序。

可爱感来自比例、圆角、留白、柔和颜色、小面积品牌插画和轻量
Microcopy，而不是装饰元素堆叠。

### Approachable Sophistication

**Approachable：** 用户第一次打开即可理解；不暴露 AI 参数，不出现复杂
Toolbar，不使用工程术语，主任务始终清晰。

**Sophisticated：** 色彩克制、图标统一、卡片层级明确、Typography
对比清晰；不使用彩虹多色、高饱和渐变或儿童游戏式 UI。

> Friendly enough to start immediately. Refined enough to feel like a
> designed product.

------------------------------------------------------------------------

## 3. Visual Hierarchy

统一层级：

``` text
Level 1 — Current Task
Level 2 — Primary Content
Level 3 — Supporting Card
Level 4 — Metadata / Helper Text
Level 5 — Decorative Element
```

装饰不得高于任务内容。

------------------------------------------------------------------------

## 4. Color System

### Core Palette

  Token                   Value       Role
  ----------------------- ----------- -----------------------
  `color.ivory`           `#FFFDF8`   App Background
  `color.surface`         `#FFFFFF`   Primary Surface
  `color.creamPink`       `#FFB7C5`   Brand Primary
  `color.creamPinkSoft`   `#FFF0F3`   Soft Pink Surface
  `color.primaryAction`   `#FF8FA6`   CTA / Selected Action
  `color.oatYellow`       `#FFE58A`   Secondary Accent
  `color.oatYellowSoft`   `#FFF8DA`   Yellow Surface
  `color.ink`             `#1F1F1F`   Primary Text
  `color.inkSoft`         `#5F5B59`   Secondary Text
  `color.muted`           `#96908C`   Metadata
  `color.line`            `#ECE6E1`   Standard Border
  `color.lineStrong`      `#D8D0CA`   Strong Border
  `color.success`         `#79A98B`   Success
  `color.warning`         `#D9A85F`   Warning
  `color.error`           `#D97A7A`   Error

`primaryAction` 是 `creamPink` 同色系的交互深色值，用于保证 CTA
对比度，不构成新的主色体系。

### Near-Monochromatic Rule

单页默认使用 `Ivory + White + Ink + Cream Pink`。燕麦黄只作小面积
Accent。

视觉指导比例：

``` text
70% Ivory / White
20% Ink / Neutral
8% Cream Pink
2% Oat Yellow / Semantic
```

禁止 Rainbow UI、大面积 Pink Gradient、Neon、Purple AI Gradient、Blue
SaaS Style、彩色 Glassmorphism 和同屏多个高注意力 Accent。

------------------------------------------------------------------------

## 5. Surface & Layer System

### Layer 0 --- App Canvas

`background: #FFFDF8`

### Layer 1 --- Primary Card

``` text
background: #FFFFFF
border: 1px solid #ECE6E1
radius: 24px
```

用于 Upload、Pattern Preview、Parameter Section、Pattern Card、Settings
Group。

### Layer 2 --- Tinted Card

``` text
background: #FFF0F3
border: 1px solid rgba(255,183,197,0.28)
radius: 24px
```

用于 Hero、Profile、Selected Information。

### Layer 3 --- Floating Surface

``` text
background: #FFFFFF
radius: 24px
shadow: elevated
```

用于 Bottom Sheet、Dialog、Floating Preview。

可见卡片嵌套最多两层。禁止多层 Card 套 Card。

------------------------------------------------------------------------

## 6. Border, Shadow & Radius

### Borders

``` text
border.subtle   1px solid #ECE6E1
border.standard 1px solid #D8D0CA
border.selected 1.5px solid #FF8FA6
border.focus    2px solid #FFB7C5
upload.dashed   1.5px dashed #5F5B59
```

### Shadows

``` text
shadow.soft
0 4px 14px rgba(52, 42, 38, 0.05)

shadow.card
0 6px 20px rgba(52, 42, 38, 0.07)

shadow.elevated
0 12px 32px rgba(52, 42, 38, 0.12)
```

默认 Card 可完全无 Shadow，仅使用 Border。

### Radius

``` text
radius.s     12px
radius.m     16px
radius.l     20px
radius.xl    24px
radius.full  999px
```

Chip 使用 full；Input/Button 16px；Small Card 20px；Primary/Hero Card
24px；Bottom Sheet 顶部和 Dialog 24px。

------------------------------------------------------------------------

## 7. Typography

字体栈：

``` text
PingFang SC
-apple-system
BlinkMacSystemFont
system-ui
sans-serif
```

  Token              Size   Weight Usage
  ---------------- ------ -------- ----------------
  `display`          30px      700 Hero Statement
  `pageTitle`        24px      700 Page Title
  `sectionTitle`     18px      600 Section
  `cardTitle`        16px      600 Card
  `body`             15px      400 Body
  `bodyStrong`       15px      600 Strong Body
  `caption`          13px      400 Supporting
  `micro`            11px      400 Metadata

主标题优先 1--2 行；辅助文案最多 3 行；按钮文案优先 2--6
个中文字符。禁止大量 Bold、全页面居中、Pixel Font 正文和同页超过 5
个字号。

------------------------------------------------------------------------

## 8. Spacing

基础单位 `4px`。

``` text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64
```

标准页面水平 Padding `20px`；顶部任务区 `24–32px`；Section Gap
`28–32px`；Card Gap `12–16px`；Card Internal Padding `16–20px`。

------------------------------------------------------------------------

## 9. Iconography

统一使用 Minimal Rounded Line Icons：

``` text
24 × 24px
stroke: 1.75–2px
round cap
round join
```

默认 `#1F1F1F`，选中 `#FF8FA6`。

禁止混用 Filled/Outline、Emoji Toolbar Icon、彩色 3D Icon
或多个图标体系。品牌小猫和拼豆角色属于 Illustration，不属于 Icon Set。

------------------------------------------------------------------------

## 10. Buttons

### Primary

``` text
height: 56px
background: #FF8FA6
text: #FFFFFF
radius: 16px
```

同一视觉区域原则上只有一个 Primary CTA。

### Secondary

``` text
height: 52–56px
background: #FFFFFF
border: 1px solid #ECE6E1
text: #1F1F1F
radius: 16px
```

### Text Button

无 Card Background，用于取消、退出登录、重新选择。

### States

`default / pressed / loading / disabled`

Pressed：`scale(0.98)`，`120ms`。Loading 保留宽度并禁止重复点击。

------------------------------------------------------------------------

## 11. Cards, Chips & Inputs

Card Family：

``` text
BaseCard
├── HeroCard
├── UploadCard
├── SectionCard
├── OptionCard
├── PatternCard
├── ProfileCard
├── InfoCard
└── StateCard
```

Card 必须承担 Content Group、Action Group、Selection、Status 或 Preview
中至少一个明确职责。

Selected Card：

``` text
border: 1.5px solid #FF8FA6
background: #FFF7F8
```

同时使用 Check Indicator 或明确状态文本，不能只靠颜色。

Chip 高 `28–32px`，水平 Padding
`8–12px`，只用于推荐、尺寸和状态，不承担主 CTA。

Input 高 `52px`、圆角 `16px`、水平 Padding `16px`。状态为
`default / focused / error / disabled`。

------------------------------------------------------------------------

## 12. Navigation

### Bottom Tab Bar

固定：

``` text
首页
我的图纸
我的
```

使用暖白 Floating Surface、24px 圆角和细 Border。选中 Icon/Text 为
`primaryAction`，未选中为 Ink/InkSoft。不使用彩色大背景。

### Top Navigation

流程页结构：

``` text
Back
Centered Page Title
Optional More
```

保持轻量，不使用大型 App Bar。

### Flow Status

`上传 → 设置 → 方案 → 调整 → 图纸`

只作辅助状态，不抢 Page Title，不可点击跳转。

------------------------------------------------------------------------

## 13. Motion

风格：**Quiet and responsive**。

``` text
fast   120ms
normal 220ms
slow   300ms
```

允许 Fade、8px Translate、Scale 0.98、Light Spring、Cross Fade。

禁止重 Bounce、Confetti、大面积粒子、复杂 3D Transition 和强游戏化反馈。

------------------------------------------------------------------------

## 14. Page 01 --- Home / Upload Entry

**Page ID:** `PAGE-01`

视觉目标：安静、精致的创作工具入口，不是 Marketing Landing Page。

``` text
Safe Area

Brand Row
BeadCraft                         More

Hero Card
Hello Maker!
把喜欢的图片
变成拼豆图纸 ✨
                          Brand Character

Upload Card
              +
           上传图片
       JPG / PNG / WEBP

Quick Explanation Row
选择图片    方案推荐    完成图纸

Bottom Tab Bar
```

Hero 使用 Layer 2 Tinted
Card，文案左对齐，品牌角色位于右侧或右下，面积不超过 Card 25%。

Upload Card 使用 Primary Card：

``` text
border: 1.5px dashed inkSoft
radius: 24px
min-height: 300px
```

它是页面第一主任务。

------------------------------------------------------------------------

## 15. Page 02 --- Image Preview

**Page ID:** `PAGE-02`

``` text
Top Navigation
Large Image Preview
Smart Image Guide Card
Primary CTA
```

Image Preview 使用 24px 圆角并保持图片比例。

Smart Image Guide 使用 Primary Card，以 Small Status Dot/Bullet
展示主体、图片类型和建议。禁止复杂评分仪表盘。

一般质量风险使用 Inline Message，不阻断流程。Primary CTA 为"下一步"。

------------------------------------------------------------------------

## 16. Page 03 --- Generation Settings

**Page ID:** `PAGE-03`

``` text
Top Navigation
豆板尺寸 / 3 Option Cards
制作难度 / 3 Option Cards
品牌 / MARD Selected Card
AI 自动处理说明
Bottom Action Bar
```

Option Cards 使用等宽 Grid。Selected 使用 Pink Border + Check
Indicator。

默认：

``` text
78×78
标准
MARD
```

禁止 Slider 表示豆板尺寸；禁止 AI Model 参数。Primary CTA："开始生成"。

------------------------------------------------------------------------

## 17. Page 04 --- AI Loading

**Page ID:** `PAGE-04`

视觉目标是"AI 正在完成一项创作任务"，而不是后台任务。

``` text
Centered Task Title
Pattern Generation Animation
Current Step
Supporting Text
Small Tips Card
```

动画表达：

``` text
Source Image
↓
Grid
↓
Pastel Beads
```

步骤：

1.  正在观察图片
2.  正在设计拼豆布局
3.  正在匹配拼豆颜色

不使用紫色 AI Gradient，不使用虚假百分比。

------------------------------------------------------------------------

## 18. Page 05 --- Generation Options

**Page ID:** `PAGE-05`

``` text
Top Navigation
Page Title
Supporting Text
Hero Preview Card
Option Card A
Option Card B
Option Card C
Bottom Actions
```

三个方案为纵向 Card List：

-   完整构图
-   主体突出
-   纯净背景

Card 包含 Thumbnail、Option Name、Short Description、Status/Preview
Action。推荐方案使用小型粉色"推荐" Chip。

### Press & Preview

Long Press Option Card → Hero Preview Cross Fade → Previewing
State。松手恢复 `selectedOption`。

Previewing 必须显示"预览中"，不得伪装成 Selected。

Bottom Actions：Secondary"重新生成"，Primary"下一步"。

------------------------------------------------------------------------

## 19. Page 06 --- Composition Adjustment

**Page ID:** `PAGE-06`

``` text
Top Navigation
Board Status Chip
Large Board Preview
Compact Transform Controls
Lightweight Status Text
Bottom Action Bar
```

Board Preview 是第一视觉。

MVP 只允许 Drag、Pinch、Rotate 90°、Reset。

禁止 Brush、Eraser、Color Picker、Replace Color、Pixel Editing 和 Build
Mode。

Primary CTA："确认生成"。

------------------------------------------------------------------------

## 20. Page 07 --- Final Pattern

**Page ID:** `PAGE-07`

``` text
Top Navigation
Full Board Pattern Preview
Pattern Information Cards
Safety Margin Metadata
Primary Save Button
Secondary Export Row
```

必须显示完整豆板和安全边距，不能裁剪到主体。

格子使用：

``` text
Actual Color Background
+
Short Pattern Number
```

Legend 映射 MARD 真实色号。

Pattern Information 使用三个小型 Layered Cards：

-   豆子总数
-   颜色数量
-   制作难度

不使用彩色 Chart。

Primary："保存到我的图纸"。Secondary："导出 PNG / 导出 PDF"。

------------------------------------------------------------------------

## 21. Naming Bottom Sheet

从 Page 07 保存触发。

``` text
给图纸起个名字吧 ✨

[ 我的拼豆图纸 ]

[ 保存 ]

取消
```

Bottom Sheet 使用 White Surface、顶部 24px 圆角、Elevated Shadow。

默认名称"我的拼豆图纸"，建议最大 30
字符。空值禁用保存并显示"请输入图纸名称"。键盘打开时 CTA 必须可见。

------------------------------------------------------------------------

## 22. Page 08 --- My Patterns

**Page ID:** `PAGE-08`

视觉目标：作品收藏空间，不是文件管理器。

``` text
Page Title
我的图纸
Supporting Text
2 Column Pattern Grid
Bottom Tab Bar
```

Grid：

``` text
columns: 2
horizontal gap: 12px
vertical gap: 16px
```

Pattern Card：

``` text
Full Board Thumbnail
Pattern Name
Board Size · Color Count
Save Date
```

Thumbnail `1:1`，圆角 20px。Card 圆角 24px，Subtle Border。

不显示编辑、重命名、文件格式、复杂 Menu、搜索或筛选。

------------------------------------------------------------------------

## 23. Page 09 --- Profile

**Page ID:** `PAGE-09`

``` text
Page Title
Profile Card
My Patterns Entry Card
Utility Group Card
Logout Text Action
Bottom Tab Bar
```

Profile Card 使用 `creamPinkSoft` 和 24px 圆角。头像
`64×64px`。无法取得微信信息时显示默认头像和"拼豆用户"。

Utility Group Card：

-   设置
-   使用帮助
-   关于

每 Row 最小高 `56px`，包含 Icon、Label、Chevron。

禁止每个 Row 单独一个浮动 Card。

退出登录使用 Text Action 和 Confirm Dialog。

------------------------------------------------------------------------

## 24. Help & About

### Help

Grouped Accordion List：

-   如何生成拼豆图纸？
-   为什么有三个方案？
-   什么是豆板尺寸？
-   制作难度有什么区别？
-   为什么需要安全边距？
-   支持哪些图片格式？
-   为什么图纸生成失败？
-   如何导出 PNG / PDF？

允许多个问题展开。

### About

``` text
Top Navigation
Pixel / Bead Brand Mark
智能拼豆图纸生成器
Version 1.0.0
品牌文案
隐私说明
用户协议
Made with ♥
```

保持大量留白，不添加 Marketing Banner。

------------------------------------------------------------------------

## 25. Empty, Loading & Error States

### Empty

``` text
Small Brand Illustration
Short Title
One Supporting Sentence
One CTA
```

例如：

> 这里还没有图纸哦

> 把喜欢的图片变成第一张拼豆图纸吧

CTA："生成第一张图纸"。

禁止使用"No Data""暂无数据"。

### Loading

  Context         Pattern
  --------------- -------------------------------
  AI Generation   Branded Grid Fill Animation
  Pattern List    Skeleton Cards
  Login           Button Loading
  Save            Button Loading
  Export          Button Loading
  Final Render    Short Pattern Rendering State

Spinner 只允许小型 Inline Indicator。

### Error

层级：

``` text
Field Error
Inline Error
Content Error
Flow Failure
```

不使用大型红色警告插画。Error Color 只用于 Icon、Border 和 Key
Message。恢复必须从最近有效状态开始。

------------------------------------------------------------------------

## 26. Accessibility

-   最低点击区域 `48×48px`
-   Primary CTA 高 `56px`
-   状态不能只依赖颜色
-   明确表达"已选择 / 预览中 / 生成失败 / 加载中"
-   Pattern Card 使用单一焦点
-   Bottom Sheet 打开后焦点进入 Sheet
-   Dialog 打开后背景不可交互
-   View Scale 与 Pattern Data 严格分离

------------------------------------------------------------------------

## 27. Responsive Rules

Primary Target：微信小程序手机竖屏。

``` text
width: viewport
horizontal padding: 20px
```

Pattern Grid：

``` text
cardWidth = (contentWidth - 12px) / 2
```

Preview 保持比例。Bottom Action Bar 必须识别
`safe-area-inset-bottom`。Naming Sheet 必须 Keyboard Aware。

禁止通过把正文缩小到 11px 以下解决小屏问题。

------------------------------------------------------------------------

## 28. Component Naming

推荐：

``` text
BaseButton
BaseCard
BaseInput
PrimaryButton
SecondaryButton
TextButton
TopNavigation
FlowStepIndicator
BottomTabBar
BottomActionBar
HeroCard
UploadCard
SectionCard
ParameterOptionCard
GenerationOptionCard
PatternCard
ProfileCard
StatusChip
RecommendationChip
NamingBottomSheet
InfoBottomSheet
ConfirmDialog
AppToast
PatternPreview
PatternLegend
PatternStatistics
EmptyState
ContentErrorState
FlowFailureState
SkeletonCard
```

禁止
`PinkButton`、`CuteCard`、`WhiteBox`、`Page3Card`、`BigCard`、`LeftButton`。

组件名描述职责，不描述颜色或位置。

------------------------------------------------------------------------

## 29. Design System Boundary

Design System 不拥有业务规则。

以下属于 Domain/Product Layer：

``` text
安全边距规则
每日重新生成 5 次
三个固定方案
MARD 色卡映射
支持的豆板尺寸
Pattern Data Schema
```

UI 只读取业务状态并呈现，不计算业务规则。

------------------------------------------------------------------------

## 30. Explicit Visual Scope Boundary

Coding Agent 不得自行加入：

-   Purple AI Gradient
-   Glassmorphism
-   Neumorphism
-   Rainbow Palette
-   Pixel Font 正文
-   大面积 Gradient Button
-   复杂 Dashboard
-   Smart Snap
-   Build Mode
-   Pixel Editor Toolbar
-   Color Picker
-   Brush
-   Eraser
-   Community Feed
-   Membership UI
-   Gamification UI

------------------------------------------------------------------------

## 31. Implementation Priority

``` text
Phase 1
Design Tokens
Base Components
Navigation Shell

Phase 2
Page 01
Page 02
Page 03

Phase 3
Page 04
Page 05
Page 06

Phase 4
Page 07
Naming Bottom Sheet

Phase 5
Page 08
Page 09
Help
About

Phase 6
Loading States
Error States
Accessibility Review
Visual Consistency Review
```

禁止一次性要求 Coding Agent 实现全部页面。

------------------------------------------------------------------------

## 32. Visual Acceptance Checklist

-   [ ] Ivory / White 是主要 Canvas。
-   [ ] 未引入未批准主色。
-   [ ] 主 CTA 清晰且同一区域只有一个。
-   [ ] Card Radius 与 Token 一致。
-   [ ] Card Layer 不超过两层。
-   [ ] Border 细且克制。
-   [ ] Shadow 不过重。
-   [ ] Page Title 层级明确。
-   [ ] Supporting Text 不抢主任务。
-   [ ] Icon 属于统一 Rounded Line 风格。
-   [ ] Emoji 未作为操作图标。
-   [ ] 未自行增加编辑能力。
-   [ ] Loading Pattern 与任务类型匹配。
-   [ ] Error 可从最近有效状态恢复。
-   [ ] 页面符合 Approachable Sophistication。
-   [ ] 与已确认视觉预览整体气质一致。

------------------------------------------------------------------------

## 33. Final Visual Definition

> **A muted pastel, near-monochromatic Neo-minimalist craft interface
> built from soft layered cards, warm ivory surfaces, restrained
> cream-pink accents, precise typography, and quiet interaction
> feedback.**

中文定义：

> **以暖象牙白为画布、奶油粉为克制强调，通过大圆角、细边框、轻微投影和分层卡片构建的
> Neo-minimalist
> 手作工具界面。产品应温润、亲切、容易开始，同时保持成熟、精致和明确的视觉秩序。**

核心设计哲学：

> **Approachable Sophistication.**

------------------------------------------------------------------------

**End of UI Specification v1.1**
