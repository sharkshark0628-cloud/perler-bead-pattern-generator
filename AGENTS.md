# AGENTS.md

# 智能拼豆图纸生成器 --- AI Coding Agent 工作规范

**文档版本：** v0.1\
**适用范围：** 整个 Repository\
**关联文档：** `PRO.md`、`ARCHITECTURE.md`\
**适用对象：** Codex、AI Coding Agent、自动化代码助手及人工开发者

------------------------------------------------------------------------

# 1. 文档目的

本文件定义 AI Coding Agent 在本项目中的工作规则。

Agent 的职责不是自由设计一个新的拼豆产品，而是：

> **严格依据 `PRO.md` 和
> `ARCHITECTURE.md`，以小步、可验证、可审查的方式实现智能拼豆图纸生成器
> MVP。**

Agent
不得擅自扩大产品范围，不得因为某种技术"更先进"而绕过已经确认的产品需求。

------------------------------------------------------------------------

# 2. 指令优先级

发生冲突时，按以下优先级执行：

1.  用户当前明确指令；
2.  `PRO.md`；
3.  `ARCHITECTURE.md`；
4.  本文件 `AGENTS.md`；
5.  已接受的 ADR；
6.  当前代码和已有实现惯例。

如果当前代码与 `PRO.md` 冲突：

> 不得默认以当前代码为正确答案。

应指出冲突并优先遵守产品需求。

如果 `ARCHITECTURE.md` 与已接受 ADR 冲突，应先检查 ADR
是否明确替代旧架构决策。

------------------------------------------------------------------------

# 3. 每个任务开始前必须执行

Agent 在修改代码前必须：

1.  阅读 `PRO.md` 中与当前任务相关的章节；
2.  阅读 `ARCHITECTURE.md` 中与当前模块相关的章节；
3.  阅读本文件；
4.  检查 `docs/adr/` 是否存在相关 ADR；
5.  检查当前 Repository Structure；
6.  检查相关测试；
7.  检查是否已有类似实现，避免重复代码。

开始实现前，应先用简短内容说明：

``` text
Task understanding
Relevant requirements
Files/modules likely affected
Implementation plan
Validation plan
```

对于简单、局部、低风险修改，可以保持简洁。

对于架构修改、数据模型修改、认证、安全、隐私或 Generation Pipeline
修改，必须明确列出影响范围。

------------------------------------------------------------------------

# 4. 产品边界

MVP 定位：

> **智能拼豆图纸生成器，而不是拼豆编辑器。**

Agent 不得擅自实现以下功能：

-   逐格修改颜色；
-   添加拼豆；
-   删除拼豆；
-   画笔；
-   橡皮擦；
-   图层；
-   专业像素编辑器；
-   自定义豆板尺寸；
-   自由角度旋转；
-   批量图片上传；
-   MARD 之外的品牌色板；
-   在线图库；
-   社区；
-   评论；
-   点赞；
-   关注；
-   打赏；
-   库存管理；
-   电商购买；
-   AI 文生图；
-   AI 图片重绘；
-   生成式图片创作；
-   Web 产品版本；
-   原生 iOS App；
-   原生 Android App。

如果任务似乎需要以上能力，Agent 必须停止扩展并指出：

``` text
This appears to be outside the current MVP scope defined in PRO.md.
```

不得"顺手实现"。

------------------------------------------------------------------------

# 5. 不可违反的产品规则

以下规则属于硬约束。

## 5.1 豆板尺寸

仅允许：

``` text
52x52
78x78
104x104
```

不得增加自定义尺寸。

## 5.2 安全边距

图案与豆板四边必须至少保留：

``` text
5 cells
```

后端必须强制验证。

前端限制不能替代后端验证。

## 5.3 品牌

MVP 仅支持：

``` text
MARD
```

不得添加其他品牌。

不得将 Reference Palette 宣称为 Official Palette，除非需求文档明确更新。

## 5.4 制作难度

仅允许：

``` text
simple
standard
detailed
```

默认：

``` text
standard
```

不得简单将三档永久硬编码为固定 8/16/32 色。

## 5.5 三方案

必须存在三个固定方案类型：

``` text
full
subject_focused
background_removed
```

三个策略应独立执行。

单策略失败不得导致整轮 Generation 失败。

三个固定槽位必须能够表达：

``` text
pending
processing
success
failed
timeout
```

## 5.6 重新生成

每日主动重新生成限制：

``` text
5 times/day
```

MVP 为客户端轻量限制。

网络失败、服务器失败或三个方案全部失败不得正式消耗额度。

## 5.7 调整

只允许：

-   单指拖动；
-   双指缩放；
-   90°步进旋转；
-   重置。

旋转仅允许：

``` text
0
90
180
270
```

不得增加自由旋转。

## 5.8 登录

无需登录：

-   上传；
-   首次生成；
-   查看方案；
-   重新生成；
-   选择方案；
-   调整；
-   确认图纸；
-   查看最终图纸。

需要微信登录：

-   导出图片；
-   导出 PDF；
-   保存到"我的图纸"。

不得擅自把登录提前到首次生成或重新生成。

## 5.9 我的图纸

"我的图纸"是：

> 最终图纸历史库。

不是：

> 可继续编辑的项目空间。

不得保存完整编辑历史用于恢复调整。

------------------------------------------------------------------------

# 6. 隐私规则

Agent 必须默认采用隐私保护设计。

不得长期保存：

-   用户原始图片；
-   2048 px 工作副本；
-   图片缩略图；
-   三个候选方案原始资产，超过临时会话生命周期后必须清理；
-   图片 embedding；
-   图片语义标签。

不得默认将用户图片：

-   用于模型训练；
-   加入训练集；
-   用于产品宣传；
-   用于 Analytics 内容分析。

如果引入新的 AI/CV Provider，必须检查：

1.  图片是否被第三方保留；
2.  是否默认用于第三方训练；
3.  数据处理区域；
4.  删除策略；
5.  请求日志是否包含图片内容。

未确认这些问题前，不得把 Provider 标记为 Production Ready。

------------------------------------------------------------------------

# 7. 安全规则

## 7.1 身份

客户端提交的以下字段不得作为可信身份：

``` text
user_id
openid
owner_id
```

微信身份必须由后端认证流程确认。

## 7.2 资源归属

所有 Pattern 读取、保存和导出必须验证 owner。

禁止：

``` text
GET pattern by pattern_id
→ return pattern
```

正确流程必须包含：

``` text
authenticated user
→ pattern lookup
→ owner verification
→ return resource
```

## 7.3 文件

不得仅通过扩展名验证图片。

必须验证实际文件类型并确认图片可解码。

## 7.4 Secrets

禁止提交：

``` text
.env
WeChat AppSecret
database password
object storage secret
API keys
private tokens
```

示例配置使用 `.env.example`。

不得在测试 Fixture 中放入真实 Secret。

------------------------------------------------------------------------

# 8. 架构规则

## 8.1 模块化单体

MVP 默认采用 Modular Monolith。

Agent 不得擅自：

-   拆微服务；
-   引入 Kubernetes；
-   引入 Service Mesh；
-   引入复杂 Event Bus；
-   建立多个独立数据库。

如性能数据证明需要架构演进，应先提出 ADR。

## 8.2 API Layer

API Controller/Route 负责：

-   HTTP 输入；
-   DTO 校验；
-   调用 Application Service；
-   HTTP 响应映射。

API Layer 不得直接实现：

-   主体检测；
-   图片分割；
-   CIEDE2000；
-   颜色量化；
-   Pattern Statistics；
-   SQL 查询业务逻辑。

## 8.3 Application Layer

Application Service 负责 Use Case 编排。

例如：

``` text
GenerationService
PatternService
ExportService
AuthService
```

Application Service 不应包含具体 OpenCV 模型实现。

## 8.4 Domain Layer

Domain 负责核心业务规则：

-   Board Size；
-   Safety Margin；
-   Pattern Data；
-   Pattern Validation；
-   Pattern Statistics；
-   Palette Matching 领域逻辑；
-   Generation Strategy contract。

Domain 不得依赖 FastAPI Request/Response。

## 8.5 Infrastructure Layer

Infrastructure 负责：

-   Database；
-   CV Provider；
-   Object Storage；
-   WeChat Client；
-   外部 API。

具体 Provider 必须通过接口接入。

------------------------------------------------------------------------

# 9. Generation Pipeline 规则

Pipeline 顺序基线：

``` text
Image Validation
→ Preprocessing
→ Composition Strategy
→ Board-Aware Fitting
→ Pixel Sampling
→ Color Complexity Reduction
→ MARD Palette Mapping
→ Pattern Validation
→ Pattern Data
```

如果需要调整 Pipeline 顺序，Agent 必须说明：

1.  为什么当前顺序不足；
2.  对图纸质量的影响；
3.  对性能的影响；
4.  对现有测试的影响。

重大顺序修改应创建 ADR。

禁止把整个 Pipeline 写成一个超大函数。

推荐每个 Stage：

-   输入类型明确；
-   输出类型明确；
-   错误类型明确；
-   可独立测试。

------------------------------------------------------------------------

# 10. Composition Strategy 规则

三个策略必须共享公共 Pipeline。

禁止：

``` text
generate_full_pattern()
generate_subject_pattern()
generate_background_removed_pattern()
```

三个函数各复制完整颜色处理、Palette Matching 和 Validation。

正确方向：

``` text
CompositionStrategy
→ CompositionCandidate
→ Shared Generation Pipeline
```

策略只负责构图差异。

单策略异常必须隔离。

示例：

``` text
full              success
subject_focused   success
background_removed failed
```

整个 Generation 仍然是有效结果。

------------------------------------------------------------------------

# 11. Pattern Data 规则

Pattern Data 是最终图纸唯一业务事实来源。

所有 Renderer 必须从 Pattern Data 工作。

禁止：

-   PNG 作为数据库中的唯一图纸；
-   从 PNG 读取颜色统计；
-   从 PDF 反向恢复 Pattern；
-   前端截图作为 Pattern Data。

Pattern Data 必须满足：

1.  Grid 尺寸等于完整豆板；
2.  `null` 表示空白；
3.  非空值引用有效 MARD `color_id`；
4.  图案满足 5 格安全边距；
5.  所有 legend count 之和等于非空格数；
6.  `bead_count` 等于非空格数；
7.  `color_count` 等于实际唯一色号数。

任何保存或导出前必须通过 Pattern Validation。

------------------------------------------------------------------------

# 12. Palette 规则

MARD Palette 数据必须存储于版本化数据文件。

禁止在业务代码中写：

``` python
if color == "white":
    return "A01"
```

禁止在多个模块复制色板数据。

Palette Matcher 应通过统一接口使用 Palette Provider。

颜色匹配目标：

``` text
sRGB
→ CIELAB
→ CIEDE2000
→ nearest MARD reference color
```

如果更换颜色匹配算法，必须提供实验或 ADR 说明。

------------------------------------------------------------------------

# 13. Renderer 规则

PNG Renderer 和 PDF Renderer：

-   只接受 Validated Pattern Data；
-   不执行主体检测；
-   不执行分割；
-   不执行 Color Quantization；
-   不执行 Palette Matching。

Pattern Generation 与 Pattern Export 必须解耦。

导出失败不得触发重新生成。

------------------------------------------------------------------------

# 14. 前端规则

## 14.1 页面职责

页面负责流程和用户交互。

可复用 UI 应进入 `components/`。

API 调用统一进入 `services/`。

不得在多个页面复制 HTTP 请求实现。

## 14.2 状态

Generation Session 状态集中管理。

不得依赖多个页面各自维护不一致的 generation data。

重新生成额度通过专用模块管理。

## 14.3 手势

构图调整：

``` text
single finger → translation
two fingers → scale
rotation button/action → 90° step rotation
```

手势中使用轻量预览。

不得每一帧向后端请求完整 Generation Pipeline。

手势结束后 debounce，再请求精确更新。

## 14.4 Pattern Viewer

最终查看页的缩放只修改：

``` text
View Scale
```

不得修改 Pattern Data。

必须与 Adjust 页面缩放逻辑分离。

------------------------------------------------------------------------

# 15. API 规则

API Base Path：

``` text
/api/v1
```

统一错误模型：

``` json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "request_id": "uuid"
  }
}
```

前端必须基于 `error.code` 判断业务状态。

不得解析异常字符串。

新增错误码时：

1.  使用稳定的大写 snake case；
2.  更新错误定义；
3.  添加测试；
4.  检查前端映射。

------------------------------------------------------------------------

# 16. 数据库规则

MVP 长期数据主要为：

``` text
users
patterns
```

Agent 不得为了未确认功能提前创建：

-   community tables；
-   comments；
-   likes；
-   follows；
-   inventory；
-   product catalog；
-   original_image_library。

数据库 Schema 修改必须：

1.  使用 Alembic migration；
2.  不直接手工修改生产数据库；
3.  更新 ORM Model；
4.  更新测试；
5.  说明向前/向后兼容影响。

------------------------------------------------------------------------

# 17. 测试要求

任何业务逻辑修改都必须考虑测试。

## 17.1 必须优先测试的领域

-   5 格安全边距；
-   BoardSize；
-   Pattern Validation；
-   Pattern Statistics；
-   MARD Palette 数据；
-   CIEDE2000；
-   Strategy Failure Isolation；
-   Pattern owner 校验；
-   幂等保存。

## 17.2 Bug Fix Rule

修复 Bug 时：

> 优先先添加能够复现 Bug 的测试，再修复实现。

如果无法添加测试，必须说明原因。

## 17.3 不允许的测试方式

禁止仅通过：

``` text
App starts successfully
```

证明功能正确。

禁止把手工点击页面作为唯一验证。

核心领域逻辑必须有自动化测试。

------------------------------------------------------------------------

# 18. 性能规则

核心目标：

``` text
Generation P95 < 15 seconds
```

30 秒为超时阈值。

性能优化必须基于测量。

Generation Pipeline 应记录 Stage Timing。

优化前应尽量确认瓶颈属于：

-   validation；
-   preprocessing；
-   subject detection；
-   segmentation；
-   fitting；
-   sampling；
-   quantization；
-   palette matching；
-   rendering。

禁止为了"可能更快"进行大规模重构。

------------------------------------------------------------------------

# 19. Logging 规则

使用结构化日志。

关联字段：

``` text
request_id
generation_id
pattern_id
```

按场景使用。

日志不得包含：

-   图片二进制；
-   Base64 图片；
-   原始图片内容；
-   图片语义描述；
-   AppSecret；
-   API Key；
-   完整认证 Token。

异常日志应包含足够的技术上下文，但避免敏感数据。

------------------------------------------------------------------------

# 20. Analytics 规则

Analytics 统一通过 Analytics Service/Adapter。

允许：

``` text
board_size
difficulty
selected_option
generation_round
generation_duration_ms
adjustment_used
```

禁止：

-   图片；
-   缩略图；
-   文件名；
-   embedding；
-   图片语义；
-   人脸标签；
-   主体类别推断。

不得为了"以后可能有用"采集额外图片内容数据。

------------------------------------------------------------------------

# 21. Dependency 规则

新增依赖前必须检查：

1.  当前标准库或已有依赖是否能解决；
2.  依赖用途；
3.  维护状态；
4.  License；
5.  包体积或运行成本；
6.  是否引入不必要的架构复杂度。

Agent 完成任务时必须列出新增依赖及原因。

禁止为了一个简单 Utility 引入大型 Framework。

------------------------------------------------------------------------

# 22. 代码质量规则

代码应优先：

-   清晰；
-   可测试；
-   模块边界明确；
-   类型明确；
-   命名表达业务含义。

避免：

-   超大函数；
-   神秘常量；
-   重复 Pipeline；
-   隐式全局状态；
-   Catch-all exception 后静默失败；
-   无意义 Wrapper；
-   为未来假设进行过度抽象。

Magic Numbers 应转为领域常量。

例如：

``` text
SAFETY_MARGIN = 5
MAX_WORKING_IMAGE_EDGE = 2048
GENERATION_TIMEOUT_SECONDS = 30
```

但不得把所有数字机械地抽成无意义配置。

------------------------------------------------------------------------

# 23. 注释和文档规则

注释解释：

> Why

而不是重复：

> What

错误示例：

``` python
# Increment count by one
count += 1
```

更好的示例：

``` python
# Quota is consumed only after at least one regenerated option succeeds.
count += 1
```

公共领域模型、复杂算法和 Provider Interface 应有简洁 Docstring。

修改产品规则时同步检查：

``` text
PRO.md
ARCHITECTURE.md
AGENTS.md
ADR
```

不要让代码和文档长期漂移。

------------------------------------------------------------------------

# 24. ADR 触发条件

以下修改通常需要 ADR：

-   更换后端核心框架；
-   从 Modular Monolith 拆微服务；
-   引入 Redis/Celery 作为正式任务架构；
-   更换 Pattern Data 核心结构；
-   修改 Composition Strategy 抽象；
-   更换 CIEDE2000 核心颜色匹配方案；
-   选择正式 Subject Detection Provider；
-   选择正式 Segmentation Provider；
-   改变原图数据生命周期；
-   引入长期图片存储；
-   改变认证模型。

小型 Bug Fix、局部 Refactor 和 UI 调整通常不需要 ADR。

------------------------------------------------------------------------

# 25. Git 和任务粒度规则

一个 Task/Issue 应尽量解决一个清晰目标。

推荐：

``` text
Issue: Implement BoardSize and safety-margin validation
```

不推荐：

``` text
Issue: Build the whole backend
```

Agent 不得一次性生成整个 MVP。

推荐开发顺序：

``` text
Foundation
→ Pattern Core
→ Basic Full Strategy
→ Three Strategies
→ Mini Program Flow
→ Auth/Persistence
→ Export
→ Analytics/Performance
```

每次提交应保持意图清晰。

不要把无关格式化、重命名和功能修改混在同一个 Task。

------------------------------------------------------------------------

# 26. Agent 完成任务后的必需汇报

完成实现后，Agent 必须提供：

## Summary

说明完成了什么。

## Files Changed

列出主要修改文件。

## Requirements Covered

指出对应 `PRO.md` / `ARCHITECTURE.md` 需求。

## Validation

列出执行的：

-   tests；
-   lint；
-   type check；
-   build；
-   manual verification。

不得声称执行了未实际执行的测试。

## Known Limitations

说明当前已知限制。

## Architecture Impact

说明：

``` text
None
```

或描述架构影响。

## Dependencies Added

说明新增依赖和用途。

如果没有：

``` text
None
```

## Suggested Next Task

只建议与当前 Roadmap 相邻的下一步。

不得利用任务总结擅自扩大 Scope。

------------------------------------------------------------------------

# 27. Stop and Ask Conditions

遇到以下情况，Agent 应停止并请求确认，而不是自行决定：

1.  需求与 `PRO.md` 冲突；
2.  需要增加 Out of Scope 功能；
3.  需要修改 5 格安全边距；
4.  需要增加豆板尺寸；
5.  需要增加 MARD 之外品牌；
6.  需要改变登录触发点；
7.  需要长期保存原图；
8.  需要将用户图片用于训练；
9.  需要更改 Pattern Data 核心模型；
10. 需要拆微服务；
11. 需要引入付费 AI/CV Provider；
12. Provider 数据隐私条款不明确；
13. 需要大规模重构；
14. 两个需求存在无法同时满足的冲突；
15. 缺少关键数据，继续实现只能依赖产品假设。

请求确认时，应明确：

``` text
What is blocked
Why it matters
Options
Recommended option
Impact of each option
```

------------------------------------------------------------------------

# 28. 当前 Open Decisions

Agent 不得自行永久锁定以下决策：

-   MARD Reference Palette 最终数据源；
-   simple/standard/detailed 动态颜色复杂度阈值；
-   Subject Detection 正式 Provider；
-   Foreground Segmentation 正式 Provider；
-   Redis + Celery 是否进入正式架构；
-   78×78 / 104×104 PDF 最终分页策略。

这些问题应通过实验、产品确认或 ADR 解决。

允许创建 Mock、Interface、Prototype 和 Benchmark。

不得把临时实现描述为最终决策。

------------------------------------------------------------------------

# 29. First Implementation Rule

首次正式 Coding Task 不应直接实现 AI 主体检测。

推荐第一个实现 Milestone：

> **Repository Foundation**

内容：

-   初始化 Monorepo；
-   初始化微信小程序目录；
-   初始化 FastAPI Backend；
-   配置 PostgreSQL Docker Service；
-   创建 `/health`；
-   配置 pytest；
-   创建基础 CI；
-   创建 `.env.example`；
-   创建基础 README 开发启动说明。

第二阶段：

> **Pattern Core**

优先实现可确定、可测试的领域规则，再进入 CV/AI。

------------------------------------------------------------------------

# 30. Agent 核心原则

在本项目中：

> **Do not guess product requirements.**

> **Do not build beyond the MVP scope.**

> **Do not hide architecture decisions inside implementation details.**

> **Do not treat generated images as the source of truth.**

> **Do not sacrifice privacy for implementation convenience.**

> **Prefer small, testable, reviewable changes.**

最终目标不是生成最多代码，而是：

> **按照已确认的产品需求，逐步构建一个可验证、可维护、可演进的智能拼豆图纸生成器
> MVP。**
