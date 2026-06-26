# ARCHITECTURE.md — 都江堰治水解谜游戏架构文档

> 文档状态：基于 `PRD.md` 与 `DESIGN.md` 生成的 MVP 架构草案  
> 适用阶段：MVP（L1 完整可玩 + L2 占位）  
> 生成日期：2026-06-26  

---

## 1. 架构总览

本项目采用**客户端主导、服务端同步**的轻量架构：

- **客户端**：承担全部玩法逻辑（编辑、模拟、结算、本地存档），保证单局 60–90 秒内的即时反馈与零惩罚重试体验。
- **服务端**：负责关卡配置下发、用户进度持久化、成就/排行榜校验（预留）。
- **核心原则**：逻辑与渲染解耦、跨设备确定性、水墨国风表现一致。

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                           客户端（Cocos Creator 3.x 2D）                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   表现层     │  │   玩法层     │  │   数据层     │  │   平台适配层 │    │
│  │ UI / 粒子    │  │ 解谜 / 模拟  │  │ 存档 / 配置  │  │ H5 / 小游戏  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         └─────────────────┴─────────────────┴─────────────────┘            │
│                                    │                                       │
│                              事件总线 / 状态机                              │
└────────────────────────────────────┼───────────────────────────────────────┘
                                     │ RESTful JSON
┌────────────────────────────────────┼───────────────────────────────────────┐
│                          服务端（Java Spring Boot）                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ 关卡配置 API     │  │ 用户进度同步 API │  │ 成就/排行榜预留  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈

### 2.1 客户端

| 层级 | 技术/方案 | 说明 |
|------|-----------|------|
| 引擎 | Cocos Creator 3.x | 官方主推，支持 2D/3D，可一键发布 H5 与微信小游戏 |
| 项目模式 | 2D 项目 | 使用 Sprite、2D 碰撞、2D 粒子系统；美术资源为 3D 预渲染的 2D 精灵图 |
| 语言 | TypeScript | 类型安全，便于与 Java 团队协作 |
| 渲染 | Cocos 2D 渲染器 + 自定义 Shader | 水墨流动、墨滴粒子、水面波纹 |
| 碰撞 | 内置 2D 碰撞系统（BoxCollider2D / PolygonCollider2D） | 不引入 Box2D，避免过度设计 |
| 输入 | Cocos 触摸/鼠标事件 / Pointer Events | 拖拽、点击、多点触控统一处理 |
| UI | Cocos UI 系统 | 按钮、进度条、弹窗、滚动视图，严格遵循 DESIGN.md 视觉规范 |
| 状态管理 | 自定义状态机 + 事件总线 | PuzzleState、LevelState、Wallet 等 |
| 本地存储 | localStorage（H5）/ wx 存储（微信小游戏） | 本地优先，服务端异步同步 |

### 2.2 服务端

| 层级 | 技术/方案 | 说明 |
|------|-----------|------|
| 框架 | Spring Boot | Java 生态成熟，团队熟悉 |
| 协议 | RESTful JSON | 状态无感知，便于 H5 与小游戏共用 |
| 数据库 | MySQL / PostgreSQL + Redis | 持久化用户进度；Redis 缓存热数据 |
| 配置 | JSON/YAML 关卡配置 | 策划可通过后台或 Excel 导出为 JSON，服务端下发 |
| 部署 | Docker + Nginx | 容器化部署，静态资源 CDN 加速 |

### 2.3 工具链

- **版本控制**：Git（禁止执行 `git push` / `git reset --hard` / `git rebase` 等变更型操作，除非用户明确授权）。
- **构建**：Cocos Dashboard + Cocos Creator 3.x 编辑器；服务端 Maven / Gradle。
- **测试**：客户端单元测试（Jest / Cocos 内置测试），服务端 JUnit。
- **原型参考**：`prototype/index.html` 中的 CSS 变量、组件样式、动效参数作为视觉与交互的唯一来源。

---

## 3. 目录结构

### 3.1 客户端（Cocos Creator 3.x 2D）

```text
assets/
├── animations/              # 动画剪辑（按钮、印章、粒子等）
├── audio/                   # 音效与音乐资源
├── prefabs/                 # UI 预制体
│   ├── ui/
│   │   ├── Button.prefab
│   │   ├── ScrollModal.prefab
│   │   ├── Seal.prefab
│   │   ├── LevelNode.prefab
│   │   ├── MoneyBar.prefab
│   │   ├── BlockCard.prefab
│   │   ├── DeleteZone.prefab
│   │   ├── WaterButton.prefab
│   │   └── Toast.prefab
│   └── game/
│       ├── StoneWall.prefab
│       └── BambooCage.prefab
├── resources/               # 动态加载资源
├── scenes/                  # 场景文件
│   ├── BootScene.scene
│   ├── TitleScene.scene
│   ├── LevelMapScene.scene
│   └── GameScene.scene
├── scripts/                 # TypeScript 源码
│   ├── core/                # 基础框架与工具
│   │   ├── EventBus.ts
│   │   ├── StateMachine.ts
│   │   ├── ObjectPool.ts
│   │   └── Logger.ts
│   ├── data/                # 数据模型与配置
│   │   ├── LevelConfig.ts
│   │   ├── BuildingBlockConfig.ts
│   │   ├── UserProfile.ts
│   │   ├── LevelState.ts
│   │   └── GameSave.ts
│   ├── gameplay/            # 核心玩法系统
│   │   ├── PuzzleRuntime.ts
│   │   ├── MoneyWallet.ts
│   │   ├── Inventory.ts
│   │   ├── PlacementSystem.ts
│   │   ├── UndoSystem.ts
│   │   ├── WaterSimulation.ts
│   │   └── SettlementSystem.ts
│   ├── entities/            # 实体定义
│   │   ├── PlacedBlock.ts
│   │   ├── WaterParticle.ts
│   │   └── VillageZone.ts
│   ├── interactions/        # 交互与碰撞响应
│   │   ├── WaterInteraction.ts
│   │   ├── StoneWallInteraction.ts
│   │   └── BambooCageInteraction.ts
│   ├── ui/                  # UI 控制器
│   │   ├── overlays/
│   │   │   ├── NarrativeOverlay.ts
│   │   │   ├── ResultOverlay.ts
│   │   │   ├── HintOverlay.ts
│   │   │   ├── SettingsOverlay.ts
│   │   │   └── LoadingOverlay.ts
│   │   ├── scenes/
│   │   │   ├── BootSceneCtrl.ts
│   │   │   ├── TitleSceneCtrl.ts
│   │   │   ├── LevelMapSceneCtrl.ts
│   │   │   └── GameSceneCtrl.ts
│   │   └── components/
│   │       ├── ButtonBase.ts
│   │       ├── Seal.ts
│   │       ├── MoneyBar.ts
│   │       ├── BlockCard.ts
│   │       └── Toast.ts
│   ├── platform/            # 平台适配
│   │   ├── StorageAdapter.ts
│   │   ├── H5Storage.ts
│   │   ├── WXStorage.ts
│   │   └── AdAdapter.ts
│   ├── network/             # 服务端通信
│   │   ├── ApiClient.ts
│   │   ├── LevelConfigApi.ts
│   │   └── ProgressApi.ts
│   └── shaders/             # 自定义 Shader
│       ├── InkFlow.effect
│       └── WaterRipple.effect
├── settings/                # Cocos 项目配置
└── static/                  # 静态配置表
    ├── levels/
    │   └── L001.json
    └── blocks/
        └── blocks.json
```

### 3.2 服务端（Java Spring Boot）

```text
server/
├── src/main/java/com/dujiangyan/game/
│   ├── DuJiangYanGameApplication.java
│   ├── config/              # 应用配置
│   ├── controller/          # REST API 控制器
│   │   ├── LevelConfigController.java
│   │   ├── UserProgressController.java
│   │   └── AchievementController.java
│   ├── service/             # 业务逻辑
│   │   ├── LevelConfigService.java
│   │   ├── UserProgressService.java
│   │   └── AchievementService.java
│   ├── repository/          # 数据访问层
│   │   ├── LevelConfigRepository.java
│   │   └── UserProgressRepository.java
│   ├── entity/              # JPA / MyBatis 实体
│   │   ├── LevelConfigEntity.java
│   │   ├── BuildingBlockEntity.java
│   │   └── UserProgressEntity.java
│   ├── dto/                 # 数据传输对象
│   │   ├── LevelConfigDTO.java
│   │   ├── BuildingBlockDTO.java
│   │   └── UserProgressDTO.java
│   ├── exception/           # 全局异常处理
│   └── util/                # 工具类
├── src/main/resources/
│   ├── application.yml
│   ├── static/              # 静态资源（关卡配置 JSON）
│   │   └── levels/
│   └── db/migration/        # 数据库迁移脚本
├── src/test/java/           # 单元测试
└── Dockerfile
```

### 3.3 文档与原型

```text
docs/
├── PRD.md                   # 产品需求文档
├── DESIGN.md                # 视觉与交互设计规范
├── ARCHITECTURE.md          # 本架构文档
└── HTML_UI_Prompts.md       # UI 提示词参考
```

---

## 4. 数据模型

### 4.1 关卡配置（LevelConfig）

```typescript
interface LevelConfig {
  id: string;                          // 关卡唯一标识，如 "L1"
  name: string;                        // 关卡名，如 "堵"
  description: string;                 // 关卡简介
  narrative: {                         // 叙事文案
    enter: string;
    success: string;
    fail: string;
  };
  terrain: TerrainConfig;              // 地形配置
  waterSource: WaterSourceConfig;      // 水源配置
  village: VillageConfig;              // 村庄触发区配置
  inventory: Record<string, number>;   // 构件初始库存，如 { stoneWall: 5, bambooCage: 3 }
  money: {                             // 金钱系统
    max: number;                       // 金钱上限
    frugalThreshold: number;           // 节俭阈值
    placementCost: Record<string, number>;
  };
  simulation: {                        // 模拟参数
    maxDuration: number;               // 最大模拟时长（秒）
    timeStep: number;                  // 固定时间步长（秒），默认 1/60
    flowCurve: FlowCurveConfig;        // 流量曲线 base → peak → stable
  };
  winCondition: WinConditionConfig;    // 胜利条件
  failCondition: FailConditionConfig;  // 失败条件
  hint: HintConfig;                    // 提示配置
}

interface TerrainConfig {
  bounds: { width: number; height: number; };
  riverPath: BezierPath | Polygon;      // 河流区域
  gridSize: number;                     // 网格尺寸，默认 0.5 米
  obstacles: ObstacleConfig[];
}

interface WaterSourceConfig {
  position: Vector2;
  baseFlow: number;                     // 基础流量
  peakFlow: number;                     // 峰值流量
  stableFlow: number;                   // 稳定流量
  spawnInterval: number;                // 粒子生成间隔（秒）
}

interface VillageConfig {
  position: Vector2;
  size: { width: number; height: number; };
  hitThreshold: number;                 // 村庄被淹没阈值
}

interface FlowCurveConfig {
  baseDuration: number;
  peakDuration: number;
  stableDuration: number;
}

interface WinConditionConfig {
  villageNotFlooded: boolean;           // 村庄未被淹没
}

interface FailConditionConfig {
  villageFlooded: boolean;              // 村庄被淹没
  wallCollapsedCausedFlood: boolean;    // 石墙倒塌导致村庄被淹
}

interface HintConfig {
  triggerAttempts: number;              // 失败几次后触发提示
  text: string;                         // 提示文本
  highlightAreas: HighlightArea[];      // 高亮区域
}
```

### 4.2 构件配置（BuildingBlockConfig）

```typescript
interface BuildingBlockConfig {
  id: string;                           // 构件唯一标识
  name: string;                         // 显示名称
  type: "stoneWall" | "bambooCage";     // 构件类型
  icon: string;                         // 图标资源路径
  size: { width: number; height: number; };
  cost: number;                         // 放置消耗金钱
  maxHealth?: number;                   // 石墙耐久
  collapseThreshold?: number;           // 石墙倒塌水势阈值
  interactions: WaterInteractionRule[]; // 水流交互规则
  rotatable: boolean;                   // 是否可旋转
  rotStepCount: number;                 // 旋转步数，默认 4（0–3）
}

interface WaterInteractionRule {
  rotStep: number;                      // 当前旋转步
  incomingDirection: Direction;         // 来水方向
  response: "block" | "reflect" | "divertUp" | "divertDown" | "slow";
  velocityChange: Vector2;
  pressureMultiplier: number;           // 对该构件产生的压力倍率
}
```

### 4.3 运行时实体

```typescript
interface PlacedBlock {
  instanceId: string;                   // 实例唯一标识
  configId: string;                     // 关联 BuildingBlockConfig.id
  position: Vector2;                    // 网格吸附后的位置
  rotStep: number;                      // 0–3，对应 0° / 90° / 180° / 270°
  state: "active" | "collapsed";        // 构件状态
  currentPressure: number;              // 当前水势压力（石墙用）
}

interface WaterParticle {
  id: number;
  position: Vector2;
  velocity: Vector2;
  mass: number;
  lifeTime: number;
  isActive: boolean;
}

interface VillageZone {
  position: Vector2;
  size: { width: number; height: number; };
  hitCount: number;                     // 当前命中粒子数
  flooded: boolean;                     // 是否被淹没
}
```

### 4.4 用户进度（UserProgress）

```typescript
interface UserProfile {
  userId: string;
  nickname?: string;
  avatar?: string;
  platform: "h5" | "wechat";
  createdAt: number;
  lastLoginAt: number;
}

interface LevelState {
  levelId: string;
  status: "locked" | "unlocked" | "cleared";
  attempts: number;
  bestMoneyUsed?: number;
  isFrugal?: boolean;
  lastPlayedAt?: number;
}

interface GameSave {
  userId: string;
  version: string;                      // 存档版本号
  levelStates: LevelState[];
  settings: GameSettings;
  achievements: Achievement[];          // 预留
  updatedAt: number;
}

interface GameSettings {
  musicEnabled: boolean;
  soundEnabled: boolean;
  language: "zh-CN";
}

interface Achievement {
  id: string;
  unlockedAt: number;
}
```

### 4.5 运行时状态机（PuzzleState）

```typescript
enum PuzzleState {
  Editing = "editing",                  // 编辑阶段
  Simulating = "simulating",            // 模拟阶段
  Settling = "settling",                // 结算阶段
  Paused = "paused"                     // 暂停
}

interface PuzzleRuntime {
  levelId: string;
  state: PuzzleState;
  money: number;
  inventory: Record<string, number>;
  placedBlocks: PlacedBlock[];
  undoStack: UndoAction[];              // 最多 20 步
  simulation: {
    elapsedTime: number;
    particles: WaterParticle[];
    villageHitCount: number;
  };
}
```

---

## 5. 服务层约定

### 5.1 客户端服务层

| 服务 | 职责 | 关键约束 |
|------|------|----------|
| `PuzzleRuntime` | 维护单局状态机、金钱、库存、已放置构件 | 所有状态变更必须经过状态机；编辑阶段允许撤销/重置；模拟阶段锁定编辑 |
| `MoneyWallet` | 管理金钱上限、消耗、返还、节俭判定 | 放置扣费、删除全额返还、结算时判定 `isFrugal` |
| `Inventory` | 维护构件库存 | 库存不足时禁止放置，UI 显示 `.empty` 状态 |
| `PlacementSystem` | 处理拖拽、网格吸附、旋转、删除、碰撞检测 | 网格尺寸 0.5 米；旋转 90° 步进；位置占用时 Toast 提示 |
| `UndoSystem` | 维护撤销栈 | 最多 20 步；重置时清空；进入模拟后不可撤销 |
| `WaterSimulation` | 固定步长水流模拟 | 与渲染帧率解耦；粒子数量仅影响视觉密度；判定逻辑独立计算 |
| `SettlementSystem` | 结算判定、解锁下一关、存档同步 | 成功/失败条件严格依据配置；结算后异步上报服务端 |
| `StorageAdapter` | 本地存档读写 | H5 用 localStorage，微信小游戏用 wx 存储；失败回退默认进度 |
| `ApiClient` | 服务端通信 | 失败不阻塞本地游戏体验，异步重试 |

### 5.2 服务端 API 约定

#### 5.2.1 关卡配置 API

```http
GET /api/v1/levels
Response: LevelConfigDTO[]

GET /api/v1/levels/{levelId}
Response: LevelConfigDTO

GET /api/v1/blocks
Response: BuildingBlockDTO[]
```

#### 5.2.2 用户进度 API

```http
GET /api/v1/users/{userId}/progress
Response: UserProgressDTO

POST /api/v1/users/{userId}/progress
Body: GameSave
Response: UserProgressDTO
```

#### 5.2.3 通用响应格式

```json
{
  "code": 200,
  "message": "ok",
  "data": { }
}
```

### 5.3 数据流约定

```text
1. 启动时：客户端从服务端拉取 LevelConfig、BuildingBlockConfig（可本地缓存）。
2. 进入 L1：客户端根据配置初始化 PuzzleRuntime、MoneyWallet、Inventory。
3. 编辑/模拟：所有逻辑在客户端本地运行，服务端不参与。
4. 结算后：客户端将结果（success/fail、isFrugal、attempts）上报服务端保存。
5. 关卡选择器：从服务端拉取最新 LevelState，显示解锁与成绩。
```

### 5.4 错误处理约定

- **客户端**：非法操作使用 Toast 轻量提示，不阻塞玩家继续操作；仅清除存档使用二次确认弹窗。
- **服务端**：统一异常封装，返回标准错误码；网络失败时客户端使用本地缓存/默认数据，不影响单局体验。

---

## 6. AI 引用机制

> 说明：当前 PRD 与 DESIGN.md 未将 AI 作为核心玩法机制。本节定义 AI 在项目中的**辅助性、非侵入性引用边界**，确保任何 AI 能力都不破坏核心解谜体验与商业模式。

### 6.1 AI 适用场景

| 场景 | 用途 | 约束 |
|------|------|------|
| **老河工提示文案生成** | 根据关卡配置与玩家失败次数，生成变体提示 | 必须经策划审核后落表；运行时使用配置表，不实时调用大模型 |
| **测试辅助** | 自动化布局探索、回归测试用例生成 | 仅用于开发与 QA，不上线 |
| **数据分析** | 玩家行为聚类、关卡通过率分析 | 服务端离线分析，不涉及实时玩法 |
| **美术概念参考** | 水墨风格概念图生成 | 仅作参考，最终资源需美术团队确认 |

### 6.2 AI 禁止场景

- ❌ **实时生成关卡答案**：不得通过 AI 在运行时直接给出解法，破坏顿悟体验。
- ❌ **动态调整核心数值**：不得用 AI 实时修改水流、压力、倒塌阈值等影响确定性的参数。
- ❌ **替代状态机与物理判定**：AI 不得参与模拟逻辑、碰撞判定、结算判定。
- ❌ **破坏商业模式**：不得用 AI 生成可售卖的外观/主题资源而不经审批流程。

### 6.3 AI 输出落表规范

若引入 AI 生成内容，必须：

1. 输出保存到配置表或资源目录，纳入版本控制。
2. 运行时只读取已审核的静态数据。
3. 在资源清单中标注来源与审核状态。

---

## 7. 开发约束

### 7.1 确定性约束

- 水流模拟使用**固定时间步长**（默认 1/60 秒），与渲染帧率解耦。
- 禁用真随机数；湍流使用**预计算噪声表**或固定种子。
- 浮点运算统一精度，必要时使用**定点数**或统一截断小数位。
- 判定逻辑（`villageHitCount`、压力、倒塌）与渲染粒子数量**完全解耦**。

### 7.2 性能约束

| 档位 | 粒子数 | 帧率 | 说明 |
|------|--------|------|------|
| 高端机 | 600 | 60fps | 完整视觉密度 |
| 中端机 | 400 | 30fps | 平衡表现与性能 |
| 低端机 | 200 | 优先保证交互帧率 | 可进一步降低粒子 |

- 性能分级**仅影响视觉密度**，不影响判定结果。
- 微信小游戏首包仅包含 L1，后续关卡远程加载。

### 7.3 视觉约束

- 必须使用 `DESIGN.md` 中定义的 CSS 变量色值，并在 Cocos 中建立一一对应的颜色配置表。
- 必须使用 `DESIGN.md` 中定义的组件尺寸、动效时长、缓动曲线。
- 禁止使用高饱和荧光色、彩虹渐变、夸张 3D 翻转动效。
- 触控区域不得低于 44px。

### 7.4 商业模式约束

- 禁止售卖资源、跳关、付费跳过。
- 仅允许：激励视频广告换取一次提示、外观/主题付费。
- 零惩罚重试：重置、撤销、重试均无代价。

### 7.5 代码规范约束

- 客户端使用 TypeScript，严格类型定义；服务端使用 Java，遵循团队代码规范。
- 状态变更必须经过状态机，禁止直接修改 `PuzzleRuntime.state`。
- 所有配置数据必须通过 `LevelConfig` / `BuildingBlockConfig` 读取，禁止硬编码关卡数值。
- 平台相关代码必须通过 `StorageAdapter` / `AdAdapter` 抽象，禁止在业务逻辑中直接调用 `localStorage` 或 `wx.*`。

---

## 8. 禁止破坏的逻辑

> 以下逻辑是产品核心体验（顿悟循环、零惩罚、水墨国风）的根基，任何修改必须经 PRD 评审。

### 8.1 教学逻辑（不可破坏）

- **L1 必须通过“硬堵失败”让玩家领悟“堵不如疏”**。
- 石墙倒塌时间必须控制在 **0.8–2 秒**内。
- 村庄被淹必须在约 **10 秒**内可被感知。
- 失败 **1–2 次**后必须触发老河工提示。

### 8.2 零惩罚体验（不可破坏）

- 重置、撤销、重试**均不得消耗任何资源或次数**。
- 失败视觉反馈不得刺眼，重试入口必须始终突出。
- 撤销栈至少支持 **20 步**。

### 8.3 确定性模拟（不可破坏）

- 同一布局在不同设备上必须产生**一致的判定结果**。
- 粒子数量不得影响 `villageHitCount`、压力、倒塌判定。
- 不得引入真随机数到核心模拟逻辑。

### 8.4 商业模式红线（不可破坏）

- 不卖资源、不卖跳关、不付费跳过。
- 激励广告仅用于换取提示，不得用于恢复金钱或库存。

### 8.5 视觉风格红线（不可破坏）

- 水墨国风基调不可改为卡通、写实、低多边形等其他风格。
- 必须使用 `--ink-black`、`--paper`、`--water` 等核心色系。
- 印章、卷轴、留白等文化隐喻必须保留。

---

## 9. 验收标准

### 9.1 功能验收

| 验收项 | 通过标准 |
|--------|----------|
| L1 可玩 | 玩家能完成完整编辑 → 放水 → 模拟 → 结算循环 |
| 硬堵失败 | 横向筑坝后石墙倒塌，村庄被淹，失败反馈正确 |
| 疏导成功 | 竖放竹笼分水后，村庄不被淹没，显示「暂时安全」 |
| 节俭判定 | 实际消耗 ≤ 节俭阈值时，`isFrugal = true` |
| 状态机 | Editing → Simulating → Settling → Editing / LevelMap 切换正确 |
| 撤销/重置 | 最多 20 步撤销；重置后库存与金钱恢复初始值 |
| 提示触发 | L1 失败 1–2 次后弹出老河工提示 |
| L2 占位 | 关卡选择器中 L2 显示「开发中，敬请期待」，不可进入 |
| 存档 | 进度可在 H5 localStorage / 微信 wx 存储中正确读写 |
| 服务端同步 | 结算后进度可上报并持久化到 Java 后端 |

### 9.2 性能验收

| 验收项 | 通过标准 |
|--------|----------|
| 模拟帧率 | 中端机 30fps，高端机 60fps |
| 启动时间 | BootScene 到 TitleScene ≤ 5 秒（首包仅 L1） |
| 内存占用 | 微信低端机不触发内存警告 |
| 发热控制 | 连续游玩 10 分钟无异常发热 |

### 9.3 确定性验收

| 验收项 | 通过标准 |
|--------|----------|
| 同布局同结果 | 同一关卡布局在 3 台不同设备上运行，判定结果一致 |
| 粒子分级一致 | 高中低粒子数下，`villageHitCount` 判定结果一致 |
| 浮点稳定 | 模拟 100 次无异常数值漂移导致结果不一致 |

### 9.4 视觉验收

| 验收项 | 通过标准 |
|--------|----------|
| 色彩一致 | 所有 UI 颜色可在 `DESIGN.md` 色表中找到对应 |
| 组件一致 | 按钮、弹窗、印章、金钱条等符合 `DESIGN.md` 规范 |
| 动效一致 | 按钮悬停、弹窗出现、Toast 等动效参数一致 |
| 响应式适配 | 移动端 ≤480px 下布局与触控区域正常 |

### 9.5 体验验收

| 验收项 | 通过标准 |
|--------|----------|
| L1 通关率 | ≥ 70% |
| L1 平均尝试次数 | 2–4 次 |
| 平均单局时长 | 60–90 秒 |
| 用户主动重试率 | ≥ 50% |
| 7 日留存 | ≥ 15% |

---

## 10. 演进路线

| 阶段 | 目标 | 主要工作 |
|------|------|----------|
| MVP | L1 完整可玩 + L2 占位 | 完成上述架构，跑通所有验收项 |
| v0.2 | L2–L4 内容 | 引入鱼嘴、飞沙堰机制，扩展 LevelConfig |
| v0.3 | 碑廊与叙事 | 完善碑廊系统、三层提示树、剧情演出 |
| v0.4 | 微信小游戏 | 接入社交分享、好友排行榜、激励广告 |
| v1.0 | 完整上线 | 8 关完整内容、主题皮肤、赛季活动 |

---

## 11. 参考文档

- [`PRD.md`](./PRD.md)：产品定位、MVP 范围、核心流程、状态机、关卡设计。
- [`DESIGN.md`](./DESIGN.md)：色彩系统、组件规范、页面布局、动效参数、交互实现。
- `prototype/index.html`：原型实现（色彩变量、组件样式、动效参数）。
