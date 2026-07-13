# 智能拼豆图纸生成器 Technical Architecture

**文档版本：** v0.1\
**产品阶段：** MVP\
**关联需求：** `PRO.md`\
**首发平台：** 微信小程序\
**架构状态：** Draft / Baseline

------------------------------------------------------------------------

# 1. 目的

本文档定义智能拼豆图纸生成器 MVP 的技术架构。`PRO.md`
定义"做什么"，本文档定义"如何实现"。

架构目标：

-   支持微信小程序 MVP；
-   图像生成 Pipeline 模块化；
-   Pattern Generation 与 Pattern Export 解耦；
-   主体识别/分割实现可替换；
-   MARD 色板可版本化和扩展；
-   支持三方案 P95 \< 15 秒的性能目标；
-   避免 MVP 阶段过度微服务化。

------------------------------------------------------------------------

# 2. 架构原则

## 2.1 Modular Monolith First

MVP
后端采用**模块化单体**，不提前拆微服务。业务模块必须保持清晰边界，禁止把
API、CV、数据库和渲染逻辑堆入单一文件。

## 2.2 Pipeline-Oriented Design

``` text
Image Input
→ Validation
→ Preprocessing
→ Composition Strategy
→ Board Fitting
→ Pixel Sampling
→ Color Complexity Reduction
→ MARD Palette Mapping
→ Pattern Validation
→ Pattern Data
```

每一步必须有明确输入和输出，禁止用一个超大函数实现完整生成流程。

## 2.3 Pattern Data Is the Source of Truth

最终业务事实来源是 `Pattern Data`：

``` text
Pattern Data
├── Mini Program Renderer
├── PNG Renderer
└── PDF Renderer
```

禁止从 PNG 截图反推 PDF；禁止把预览图片当作图纸业务数据本身。

## 2.4 Strategy-Based Composition

三个生成方案实现为独立策略：

``` text
FullCompositionStrategy
SubjectFocusedCompositionStrategy
BackgroundRemovedCompositionStrategy
```

三个策略共享 Board Fitting、Pixel Sampling、Color Processing 和 Pattern
Validation。

## 2.5 Replaceable CV/AI Components

业务层依赖抽象接口：

``` text
SubjectDetector
ForegroundSegmenter
```

不得直接绑定具体模型或云 API。允许存在 Local、Cloud、Mock/Fallback
Adapter。

------------------------------------------------------------------------

# 3. 推荐技术栈

## 3.1 微信小程序

-   微信小程序原生框架
-   TypeScript
-   WXML
-   WXSS
-   Canvas 2D
-   微信登录
-   微信相册/文件 API
-   微信 Storage

MVP
不优先使用跨端框架，因为首发仅面向微信小程序，且手势、Canvas、图片保存和登录高度依赖微信能力。

## 3.2 后端

推荐 **Python + FastAPI**。

主要技术：

-   FastAPI
-   Pydantic
-   Pillow
-   NumPy
-   OpenCV
-   SQLAlchemy 2.x
-   Alembic
-   httpx
-   pytest
-   经验证的 CIEDE2000 实现

Python 便于图像处理、CV/AI 模型接入和算法实验。

## 3.3 数据库

推荐 **PostgreSQL**。

保存：

-   用户；
-   最终图纸；
-   Pattern Data；
-   图纸元数据；
-   色号/豆量统计。

不保存原始用户图片。

## 3.4 文件存储

开发环境使用本地临时目录；生产环境使用 S3-compatible Object Storage。

抽象接口：

``` text
ObjectStorage
├── LocalObjectStorage
└── S3ObjectStorage
```

临时工作副本必须具有生命周期和清理机制。

## 3.5 异步任务

第一阶段先使用简单任务执行模型。若性能测试证明需要任务队列，再演进为：

``` text
FastAPI
→ Redis Queue
→ Celery Worker
→ Result Store
```

不得在没有性能数据前提前引入复杂分布式架构。

------------------------------------------------------------------------

# 4. 系统总体架构

``` text
┌─────────────────────────────────────┐
│          WeChat Mini Program        │
│ Upload / Config / Gesture / Viewer  │
└─────────────────┬───────────────────┘
                  │ HTTPS API
                  ▼
┌─────────────────────────────────────┐
│             FastAPI Backend         │
│ API / Application / Domain / Infra  │
└───────┬──────────┬──────────┬───────┘
        │          │          │
        ▼          ▼          ▼
 PostgreSQL   Object Storage   CV/AI Adapters
                                      │
                                      ▼
                              Generation Pipeline
                                      │
                                      ▼
                                  Pattern Data
                                  /          \
                                 ▼            ▼
                            PNG Renderer   PDF Renderer
```

------------------------------------------------------------------------

# 5. Repository Structure

``` text
perler-bead-generator/
├── PRO.md
├── ARCHITECTURE.md
├── AGENTS.md
├── README.md
├── .gitignore
├── docker-compose.yml
│
├── miniprogram/
│   ├── app.ts
│   ├── app.json
│   ├── app.wxss
│   ├── project.config.json
│   ├── pages/
│   │   ├── home/
│   │   ├── generate/
│   │   ├── options/
│   │   ├── adjust/
│   │   ├── pattern/
│   │   ├── my-patterns/
│   │   └── pattern-detail/
│   ├── components/
│   │   ├── image-uploader/
│   │   ├── board-selector/
│   │   ├── difficulty-selector/
│   │   ├── option-card/
│   │   ├── pattern-canvas/
│   │   └── color-legend/
│   ├── services/
│   │   ├── api.ts
│   │   ├── generation.ts
│   │   ├── auth.ts
│   │   ├── pattern.ts
│   │   └── analytics.ts
│   ├── stores/
│   │   ├── generation-store.ts
│   │   ├── auth-store.ts
│   │   └── regeneration-quota.ts
│   ├── models/
│   └── utils/
│
├── backend/
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── .env.example
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/v1/
│   │   │   ├── generation.py
│   │   │   ├── auth.py
│   │   │   ├── patterns.py
│   │   │   └── exports.py
│   │   ├── application/
│   │   │   ├── generation_service.py
│   │   │   ├── pattern_service.py
│   │   │   ├── export_service.py
│   │   │   └── auth_service.py
│   │   ├── domain/
│   │   │   ├── generation/
│   │   │   ├── pattern/
│   │   │   ├── palette/
│   │   │   └── user/
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   ├── cv/
│   │   │   ├── storage/
│   │   │   └── wechat/
│   │   ├── rendering/
│   │   │   ├── png_renderer.py
│   │   │   └── pdf_renderer.py
│   │   └── data/palettes/
│   │       └── mard_reference.json
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── fixtures/
│
└── docs/
    ├── adr/
    ├── api/
    └── experiments/
```

------------------------------------------------------------------------

# 6. 核心领域模型

## 6.1 BoardSize

允许：

``` text
52x52
78x78
104x104
```

安全区域由后端领域对象计算：

``` text
usable_width  = board_width - 10
usable_height = board_height - 10
```

前端可以显示规则，但后端必须再次强制验证 5 格边距。

## 6.2 Difficulty

枚举：

``` text
simple
standard
detailed
```

默认 `standard`。

Difficulty 不直接等于固定颜色数。`PaletteComplexityPolicy`
根据难度、可用区域和图片复杂度决定目标颜色复杂度。

## 6.3 GenerationOptionType

``` text
full
subject_focused
background_removed
```

禁止使用任意字符串表达方案类型。

## 6.4 Pattern Data

逻辑结构：

``` json
{
  "pattern_id": "uuid",
  "board": {
    "width": 52,
    "height": 52,
    "safety_margin": 5
  },
  "brand": "mard",
  "difficulty": "standard",
  "source_option": "subject_focused",
  "grid": [
    [null, null, "A01"],
    [null, "B12", "B12"]
  ],
  "legend": [
    {
      "symbol": "1",
      "color_id": "A01",
      "color_name": "White",
      "rgb": [245, 245, 240],
      "count": 126
    }
  ],
  "statistics": {
    "color_count": 12,
    "bead_count": 1480
  }
}
```

规则：

-   `grid` 尺寸等于完整豆板；
-   `null` 表示空白格；
-   非空值引用品牌 `color_id`；
-   Pattern Data 不包含原图、CV embedding 或调整历史。

------------------------------------------------------------------------

# 7. Generation Pipeline

## 7.1 Image Validation

检查：

-   实际 MIME/signature；
-   Pillow/OpenCV 可解码；
-   JPG/JPEG/PNG/WEBP；
-   静态图片；
-   尺寸有效。

输出 `ValidatedImage`。

## 7.2 Preprocessing

-   修正 EXIF orientation；
-   转换统一 RGB 工作格式；
-   最长边最多 2048 px；
-   保持宽高比；
-   创建会话级工作副本。

输出 `PreparedImage`。

## 7.3 Composition Strategies

三个策略并行尝试。

``` text
Full:
PreparedImage → Preserve Composition → Candidate

Subject Focused:
PreparedImage → SubjectDetector → Subject Group Selection
→ Smart Crop → Scale Optimization → Candidate

Background Removed:
PreparedImage → SubjectDetector → ForegroundSegmenter
→ Foreground Mask → Candidate
```

单策略异常必须转化为该方案失败状态，不得导致整个 Generation Request
失败。

## 7.4 Board-Aware Fitting

``` text
safe_x_min = 5
safe_y_min = 5
safe_x_max = board_width - 5
safe_y_max = board_height - 5
```

候选图案必须完全位于安全区域。

## 7.5 Pixel Sampling

将候选图映射到整数网格。

要求：

-   输出尺寸为整数；
-   不允许半格；
-   保持空白/透明区域；
-   重采样算法可配置并通过实验比较。

## 7.6 Color Complexity Reduction

``` text
Sampled Pixels
→ Color Quantization
→ Reduced Colors
→ Brand Palette Mapping
```

禁止不控制颜色碎片地把所有像素直接映射到完整品牌色板。

接口建议：

``` text
PaletteComplexityPolicy.resolve(...)
```

## 7.7 MARD Palette Mapping

``` text
sRGB
→ CIELAB
→ CIEDE2000
→ Nearest MARD Reference Color
```

MARD 色板 Lab 值应预计算。

接口：

``` text
PaletteMatcher.match(rgb) -> PaletteColor
```

## 7.8 Pattern Validation

必须验证：

1.  Grid 尺寸等于完整豆板；
2.  图案不突破 5 格边距；
3.  非空 color_id 存在于 MARD Reference Palette；
4.  所有颜色 count 之和等于非空格数量；
5.  `bead_count` 等于非空格数量；
6.  `color_count` 等于唯一使用色数量；
7.  `pattern_id` 有效。

验证失败的 Pattern 不得保存或导出。

------------------------------------------------------------------------

# 8. 构图调整架构

小程序负责手势交互，维护：

``` text
translation_x
translation_y
scale
rotation
```

`rotation` 仅允许 0、90、180、270。

手势过程中：

``` text
Client Lightweight Preview
```

手势结束：

``` text
Adjustment Parameters
→ Backend Adjustment Endpoint
→ Integer Grid Resampling
→ Color Processing
→ Updated Pattern Preview
```

连续缩放结束事件应
debounce。禁止每一帧发送完整生成请求。后端再次校验安全边界。

------------------------------------------------------------------------

# 9. API Architecture

Base Path：

``` text
/api/v1
```

## Generation

``` text
POST /api/v1/generations
GET  /api/v1/generations/{generation_id}
POST /api/v1/generations/{generation_id}/regenerate
POST /api/v1/generations/{generation_id}/adjust
POST /api/v1/generations/{generation_id}/confirm
```

Generation Option 状态：

``` text
pending
processing
success
failed
timeout
```

三个固定槽位必须始终返回。

## Authentication

``` text
POST /api/v1/auth/wechat
GET  /api/v1/auth/me
```

流程：

``` text
wx.login()
→ temporary code
→ backend
→ WeChat auth API
→ openid
→ internal user
→ application session/token
```

客户端不得直接提交可信 `openid` 或 `user_id`。

## Patterns

``` text
POST /api/v1/patterns
GET  /api/v1/patterns
GET  /api/v1/patterns/{pattern_id}
```

要求认证、owner 校验和 `pattern_id` 幂等保存。

## Exports

``` text
POST /api/v1/patterns/{pattern_id}/exports/png
POST /api/v1/patterns/{pattern_id}/exports/pdf
```

Renderer 仅接受通过 Pattern Validation 的 Pattern Data。

------------------------------------------------------------------------

# 10. 统一错误模型

``` json
{
  "error": {
    "code": "SUBJECT_NOT_FOUND",
    "message": "未能识别明确主体",
    "request_id": "uuid"
  }
}
```

推荐错误码：

``` text
UNSUPPORTED_IMAGE_TYPE
IMAGE_DECODE_FAILED
IMAGE_INVALID
GENERATION_FAILED
GENERATION_TIMEOUT
SUBJECT_NOT_FOUND
SEGMENTATION_FAILED
OPTION_NOT_AVAILABLE
INVALID_BOARD_SIZE
INVALID_DIFFICULTY
SAFETY_MARGIN_VIOLATION
PATTERN_VALIDATION_FAILED
AUTH_REQUIRED
AUTH_FAILED
PATTERN_NOT_FOUND
PATTERN_ACCESS_DENIED
EXPORT_FAILED
STORAGE_FAILED
```

前端必须基于稳定 `error.code` 处理业务，不得解析异常字符串。

------------------------------------------------------------------------

# 11. 数据库

## users

``` text
id UUID PK
wechat_openid VARCHAR UNIQUE NOT NULL
created_at TIMESTAMP
updated_at TIMESTAMP
```

## patterns

``` text
id UUID PK
owner_id UUID FK users.id
board_width INTEGER
board_height INTEGER
brand VARCHAR
difficulty VARCHAR
source_option VARCHAR
pattern_data JSONB
color_count INTEGER
bead_count INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

MVP 不建立原图长期保存表，也不长期保存三个候选方案。

------------------------------------------------------------------------

# 12. 临时 Generation Session

建议保存：

``` text
generation_id
board_size
brand
difficulty
status
created_at
expires_at
option_statuses
temporary_asset_refs
```

开发原型可先使用简单缓存。生产环境建议 Redis/TTL Store。

会话过期后删除工作副本和临时方案资产，不影响已经确认并保存的 Pattern。

------------------------------------------------------------------------

# 13. MARD Palette Data

文件：

``` text
backend/app/data/palettes/mard_reference.json
```

建议结构：

``` json
{
  "brand": "mard",
  "source": "verified-reference",
  "version": "0.1",
  "colors": [
    {
      "color_id": "A01",
      "name": "White",
      "hex": "#F5F5F0",
      "rgb": [245, 245, 240],
      "lab": [96.8, -0.2, 2.5]
    }
  ]
}
```

要求：

-   数据版本化；
-   记录 reference source；
-   测试重复 color_id；
-   测试 RGB 范围；
-   测试 HEX/RGB 一致性；
-   不在业务代码中硬编码色号。

------------------------------------------------------------------------

# 14. Renderer

## PNG Renderer

输入 `Validated Pattern Data`。

输出包含：

-   完整豆板；
-   网格；
-   横纵坐标；
-   实际颜色背景；
-   图纸编号；
-   色号图例；
-   各色豆量；
-   总颜色数；
-   总豆数。

Renderer 不执行主体检测、分割、颜色量化或 Palette Matching。

## PDF Renderer

输入同样为 `Validated Pattern Data`。

78×78 和 104×104
不得为了单页而把编号压缩到不可读。允许分页/分区渲染，具体分页方案通过原型验证。

------------------------------------------------------------------------

# 15. Analytics

统一接口：

``` text
analytics.track(eventName, properties)
```

允许：

``` text
board_size
difficulty
selected_option
generation_round
generation_duration_ms
adjustment_used
```

禁止发送：

-   原图；
-   缩略图；
-   文件名；
-   image embedding；
-   图片语义标签；
-   人脸或主体推断内容。

MVP 可先写结构化事件日志，后续替换 Analytics Adapter。

------------------------------------------------------------------------

# 16. Logging and Observability

每个请求生成 `request_id`。

Generation 关联 `generation_id`，Pattern 关联 `pattern_id`。

日志不得包含图片二进制、Base64 图片、图片语义或完整微信认证凭据。

核心监控：

-   generation duration；
-   generation timeout rate；
-   strategy failure rate；
-   subject-focused failure rate；
-   background-removal failure rate；
-   export failure rate；
-   pattern validation failure rate。

Pipeline 应记录各 Stage duration，用于 P95 性能优化。

------------------------------------------------------------------------

# 17. Privacy and Data Lifecycle

``` text
Receive Image
→ Validate
→ Create Working Copy
→ Process
→ Temporary Storage
→ Session Expiry
→ Delete
```

原图和工作副本不得默认长期保存、训练模型或用于宣传。

临时文件清理不能只依赖请求结束，生产环境应使用对象存储生命周期策略和应用层清理机制。

------------------------------------------------------------------------

# 18. Testing Strategy

## Unit Tests

必须覆盖：

-   BoardSize 安全区域；
-   5 格边距验证；
-   Difficulty；
-   Palette 数据校验；
-   RGB → Lab；
-   CIEDE2000；
-   豆量统计；
-   Pattern Validation；
-   legend/symbol 生成；
-   幂等保存。

## Pipeline Tests

固定 Fixture 至少包含：

-   单主体人物；
-   单主体宠物；
-   多主体合照；
-   动漫角色；
-   风景图；
-   无明确主体图片；
-   透明 PNG；
-   低分辨率图片；
-   超大图片；
-   极端宽图；
-   极端高图。

验证三个策略独立执行、单方案失败隔离、安全边距和统计一致性。

## Integration Tests

覆盖：

``` text
Upload
→ Generate
→ Select
→ Adjust
→ Confirm
→ Login
→ Save
→ Export
```

重点测试登录后继续原操作、owner 校验、幂等保存和导出失败。

## Performance Tests

至少测试：

``` text
52x52 simple
52x52 detailed
78x78 standard
104x104 standard
104x104 detailed
```

记录 P50、P95、P99 和各 Pipeline Stage duration。

------------------------------------------------------------------------

# 19. Development Environment

推荐：

``` text
Windows 10/11
VS Code
Git
Docker Desktop
Python 3.12
WeChat DevTools
PostgreSQL via Docker
```

环境变量通过 `.env` 管理，提交 `.env.example`。

禁止提交：

``` text
.env
WeChat AppSecret
database password
cloud storage secret
API keys
```

`docker-compose.yml` 初期至少提供 PostgreSQL；需要异步队列后再增加
Redis。

------------------------------------------------------------------------

# 20. ADR

重要技术决策记录到：

``` text
docs/adr/
```

建议首批：

``` text
ADR-001-use-native-wechat-miniprogram.md
ADR-002-use-fastapi-backend.md
ADR-003-use-modular-monolith.md
ADR-004-pattern-data-as-source-of-truth.md
ADR-005-composition-strategy-interface.md
ADR-006-palette-matching-ciede2000.md
ADR-007-generation-job-execution-model.md
ADR-008-cv-segmentation-provider.md
```

------------------------------------------------------------------------

# 21. Implementation Phases

## Phase A --- Repository Foundation

Monorepo、小程序目录、FastAPI、PostgreSQL、健康检查、测试框架和基础
CI。不实现真实 AI/CV。

## Phase B --- Pattern Core

BoardSize、Safety Margin、Pattern Data、MARD Palette
Loader、Lab/CIEDE2000、Palette Matcher、Statistics 和 Validation。

## Phase C --- Basic Image-to-Pattern Pipeline

图片上传、校验、2048 px 工作副本、完整图策略、Board Fitting、Pixel
Sampling、Color Quantization、MARD Mapping 和 Pattern Preview。

## Phase D --- Three Composition Strategies

Strategy Interface、Full、Subject Focused、Background
Removed、并行执行、失败隔离和三个固定槽位。

## Phase E --- Mini Program Core Flow

上传、参数选择、生成状态、三方案、方案选择、构图调整和 Pattern Viewer。

## Phase F --- Authentication and Persistence

微信登录、用户、Pattern 保存、我的图纸、owner 校验和幂等保存。

## Phase G --- Export

PNG Renderer、PDF Renderer、导出和失败重试。

## Phase H --- Analytics and Performance

核心事件、Pipeline Timing、P95 测试、超时策略和 Beta 指标验证。

------------------------------------------------------------------------

# 22. Agent / Codex Architecture Constraints

在 `AGENTS.md` 创建前，Agent 必须遵守：

1.  修改前阅读 `PRO.md` 和 `ARCHITECTURE.md`。
2.  不增加 `PRO.md` Out of Scope 功能。
3.  不把 MVP 改造成专业像素编辑器。
4.  不删除 5 格安全边距。
5.  不增加自定义豆板尺寸。
6.  不增加 MARD 之外品牌。
7.  不长期保存原始用户图片。
8.  不默认将用户图片用于训练。
9.  不把 PNG/PDF 当作 Pattern Data 的唯一事实来源。
10. 不把主体检测逻辑直接耦合到 API Controller。
11. 不复制粘贴实现三个 Composition Strategy。
12. 单方案失败不得导致整轮 Generation 失败。
13. Pattern 保存必须校验 owner 和幂等性。
14. 新增架构依赖必须说明用途。
15. 未经需求确认不得进行大规模架构重构。

------------------------------------------------------------------------

# 23. Open Architecture Decisions

-   **AD-001:** MARD Reference Palette 数据基准、版本和人工核验流程。
-   **AD-002:** 简约/标准/精细动态颜色复杂度策略。
-   **AD-003:** Subject Detection Provider。
-   **AD-004:** Foreground Segmentation Provider。
-   **AD-005:** Generation Execution Model；通过性能数据决定是否引入
    Redis + Celery。
-   **AD-006:** 78×78 和 104×104 PDF 分页/分区策略。

------------------------------------------------------------------------

# 24. Architecture Success Criteria

MVP 架构必须满足：

-   三个生成策略可独立替换；
-   CV/AI Provider 可替换；
-   MARD Palette 不硬编码在业务逻辑；
-   Pattern Data 可独立渲染为小程序视图、PNG 和 PDF；
-   Pattern Validation 保证豆量统计一致；
-   后端强制 5 格安全边距；
-   单策略失败不导致整轮失败；
-   原图不进入长期 Pattern Storage；
-   用户资源访问具有 owner 校验；
-   可记录 Pipeline Stage Timing；
-   支持针对 P95 \< 15 秒进行性能优化；
-   Agent 可按模块和 Issue 逐步实现，无需一次生成整个项目。

------------------------------------------------------------------------

# 25. 推荐开发工作流

``` text
PRO.md
→ ARCHITECTURE.md
→ AGENTS.md
→ ADR
→ Repository Scaffold
→ GitHub Milestones
→ GitHub Issues
→ Codex Task
→ Pull Request
→ Review
```
