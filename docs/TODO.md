# TODO.md — 都江堰治水解谜游戏（MVP）

> 本文档由 `PRD.md`、`DESIGN.md`、`ARCHITECTURE.md` 严格生成，是后续编码的唯一任务清单。禁止杜撰任何未在三份源文档中出现的内容。
> 源文档版本：2026-06-26 草案。

---

## 0. 项目总览

- **产品定位**：国风水利解谜小品，单局 60–90 秒，通过“摆放治水构件 → 放水观察 → 失败/顿悟 → 再试”循环，领悟“堵不如疏、顺势而为”。（PRD §1）
- **MVP 范围**：L1 完整可玩 + L2 占位，浏览器 H5 优先，微信小游戏接口预留。（PRD §3）
- **客户端**：Cocos Creator 3.x（2D 项目）+ TypeScript。（PRD §6.2, ARCHITECTURE §2.1）
- **服务端**：Java Spring Boot + RESTful JSON + MySQL/PostgreSQL + Redis。（PRD §6.3, ARCHITECTURE §2.2）
- **核心原则**：逻辑与渲染解耦、跨设备确定性、水墨国风表现一致、零惩罚重试、不卖资源/跳关/跳过。（PRD §1.4, ARCHITECTURE §7.4, §8）

---

## 1. 项目初始化与基础设施

### 1.1 客户端工程搭建
- [x] 使用 Cocos Creator 3.x 创建 **2D 项目**（非 3D 项目）。（PRD §6.2, ARCHITECTURE §2.1）
- [x] 建立 `assets/scripts/` 目录结构，按 ARCHITECTURE §3.1 创建全部子目录：`core/`, `data/`, `gameplay/`, `entities/`, `interactions/`, `ui/overlays/`, `ui/scenes/`, `ui/components/`, `platform/`, `network/`, `shaders/`。
- [x] 建立 `assets/prefabs/ui/` 与 `assets/prefabs/game/` 预制体目录。（ARCHITECTURE §3.1）
- [x] 建立 `assets/scenes/` 目录，包含 `BootScene.scene`, `TitleScene.scene`, `LevelMapScene.scene`, `GameScene.scene`。（PRD §4, ARCHITECTURE §3.1）
- [x] 建立 `assets/static/levels/` 与 `assets/static/blocks/` 静态配置目录，存放 `L001.json`、`blocks.json`。（ARCHITECTURE §3.1）
- [x] 配置 TypeScript 严格模式，启用类型检查。

### 1.2 服务端工程搭建
- [x] 使用 Spring Boot（Maven 或 Gradle）初始化 `server/` 工程。（PRD §6.3, ARCHITECTURE §2.2）
- [x] 建立 `src/main/java/com/dujiangyan/game/` 包结构，按 ARCHITECTURE §3.2 创建：`config/`, `controller/`, `service/`, `repository/`, `entity/`, `dto/`, `exception/`, `util/`。
- [x] 建立 `src/main/resources/static/levels/`、`db/migration/` 与 `Dockerfile`。（ARCHITECTURE §3.2）
- [x] 配置 `application.yml`，包含数据库（MySQL/PostgreSQL）与 Redis 连接占位。
- [x] 建立统一 REST 响应格式封装：`{ code, message, data }`。（ARCHITECTURE §5.2.3）

### 1.3 版本控制与开发规范
- [x] 初始化 Git 仓库（不执行 `git reset --hard` / `git rebase` 等变更型操作，除非用户明确授权）。（ARCHITECTURE §2.3）
- [x] 建立 `.gitignore`，排除 Cocos `build/`、`library/`、`temp/`、Java `target/`/`build/`。
- [x] 在代码库中建立 DESIGN.md 颜色配置映射表，确保所有 Cocos UI 颜色与 CSS 变量一一对应。（DESIGN §9.2）

---

## 2. 客户端核心框架

### 2.1 事件总线与状态机
- [x] 实现 `EventBus.ts`：类型安全的事件发布/订阅总线。（ARCHITECTURE §3.1）
- [x] 实现 `StateMachine.ts`：泛型状态机，驱动 `PuzzleRuntime.state` 切换，禁止业务代码直接修改状态字段。（ARCHITECTURE §7.5）
- [x] 定义 `PuzzleState` 枚举：`Editing`、`Simulating`、`Settling`、`Paused`。（PRD §5.3, ARCHITECTURE §4.5）

### 2.2 对象池与日志
- [ ] 实现 `ObjectPool.ts`：针对 `WaterParticle` 的对象池，支持高中低粒子数复用。（ARCHITECTURE §7.2）
- [ ] 实现 `Logger.ts`：带等级开关的日志工具，生产环境关闭调试日志。

### 2.3 平台适配层
- [ ] 实现 `StorageAdapter.ts` 抽象接口，统一读写进度与设置。（ARCHITECTURE §5.1, §7.5）
- [ ] 实现 `H5Storage.ts`：基于 `localStorage` 的实现，读写失败回退默认进度。（PRD §3.1, ARCHITECTURE §5.1）
- [ ] 实现 `WXStorage.ts`：微信小游戏 `wx.*` 存储实现，仅在平台为 wechat 时启用。（ARCHITECTURE §2.1）
- [ ] 实现 `AdAdapter.ts`：激励视频广告接口抽象，MVP 内仅留空函数与触发点注释，不接入真实广告。（PRD §3.1, DESIGN §9.1）

### 2.4 网络通信层
- [ ] 实现 `ApiClient.ts`：统一 HTTP 请求封装，网络失败时不阻塞本地游戏，异步重试。（ARCHITECTURE §5.1, §5.4）
- [ ] 实现 `LevelConfigApi.ts`：调用 `GET /api/v1/levels`、`GET /api/v1/levels/{levelId}`、`GET /api/v1/blocks`。（ARCHITECTURE §5.2.1）
- [ ] 实现 `ProgressApi.ts`：调用 `GET /api/v1/users/{userId}/progress`、`POST /api/v1/users/{userId}/progress`。（ARCHITECTURE §5.2.2）

---

## 3. 数据模型与配置

### 3.1 客户端数据模型
- [ ] 实现 `LevelConfig.ts`：完整 TypeScript 接口，包含 `id/name/description/narrative/terrain/waterSource/village/inventory/money/simulation/winCondition/failCondition/hint`。（ARCHITECTURE §4.1）
- [ ] 实现 `BuildingBlockConfig.ts`：完整接口，包含 `id/name/type/icon/size/cost/maxHealth/collapseThreshold/interactions/rotatable/rotStepCount`。（ARCHITECTURE §4.2）
- [ ] 实现 `PlacedBlock.ts`：包含 `instanceId/configId/position/rotStep/state/currentPressure`。（ARCHITECTURE §4.3）
- [ ] 实现 `WaterParticle.ts`：包含 `id/position/velocity/mass/lifeTime/isActive`。（ARCHITECTURE §4.3）
- [ ] 实现 `VillageZone.ts`：包含 `position/size/hitCount/flooded`。（ARCHITECTURE §4.3）
- [ ] 实现 `UserProfile.ts`、`LevelState.ts`、`GameSave.ts`、`GameSettings.ts`、`Achievement.ts`。（ARCHITECTURE §4.4）
- [ ] 实现 `PuzzleRuntime` 接口与运行时数据结构，含 `levelId/state/money/inventory/placedBlocks/undoStack/simulation`。（ARCHITECTURE §4.5）

### 3.2 服务端数据模型
- [ ] 实现 Java 实体：`LevelConfigEntity`、`BuildingBlockEntity`、`UserProgressEntity`。（ARCHITECTURE §3.2）
- [ ] 实现 DTO：`LevelConfigDTO`、`BuildingBlockDTO`、`UserProgressDTO`。（ARCHITECTURE §3.2）
- [ ] 实现 Repository 层：`LevelConfigRepository`、`UserProgressRepository`。（ARCHITECTURE §3.2）
- [ ] 设计 MySQL/PostgreSQL 表结构，包含用户进度、关卡配置、构件配置表。

### 3.3 静态配置内容
- [ ] 编写 `assets/static/levels/L001.json`：L1「堵」完整配置，包括地形、水源、村庄、库存 `{ stoneWall: 5, bambooCage: 3 }`（或策划最终数值）、金钱上限与节俭阈值、模拟参数、胜负条件、提示配置。（PRD §3.3, ARCHITECTURE §4.1）
- [ ] 编写 `assets/static/blocks/blocks.json`：石墙与竹笼构件配置，定义尺寸、花费、耐久、倒塌阈值、各旋转步的水流交互规则。（PRD §3.1, ARCHITECTURE §4.2）
- [ ] 服务端同步放置 `server/src/main/resources/static/levels/` 下相同 JSON，保证服务端可下发配置。

---

## 4. 核心玩法系统

### 4.1 金钱与库存系统
- [ ] 实现 `MoneyWallet.ts`：管理金钱上限、放置扣费、删除全额返还、结算时计算 `isFrugal = consumedMoney ≤ frugalThreshold`。（PRD §3.1, §5.2, ARCHITECTURE §5.1）
- [ ] 实现 `Inventory.ts`：维护石墙、竹笼库存；库存不足时禁止放置，UI 显示 `.empty` 状态。（PRD §3.1, ARCHITECTURE §5.1）
- [ ] 金钱不足、库存不足时通过 Toast 提示，不阻塞操作。（DESIGN §7.2）

### 4.2 放置系统
- [ ] 实现 `PlacementSystem.ts`：处理拖拽、网格吸附（默认 0.5 米网格）、旋转 90° 步进、删除区拖拽删除、碰撞检测。（PRD §5.2, ARCHITECTURE §5.1）
- [ ] 位置占用时弹出 Toast「位置已被占用」。（DESIGN §7.2）
- [ ] 点击已放置构件旋转：`rotStep = (rotStep + 1) % 4`。（PRD §5.2）
- [ ] 未放置构件时点击放水，弹出 Toast「请至少放置一个构件」。（DESIGN §7.2）

### 4.3 撤销与重置系统
- [ ] 实现 `UndoSystem.ts`：维护最多 20 步撤销栈；重置时清空；进入 `Simulating` 后不可撤销。（PRD §5.2, ARCHITECTURE §5.1, §8.2）
- [ ] 重置后库存与金钱恢复初始值，画布清空。（DESIGN §7.3）
- [ ] 撤销栈为空时，撤销按钮禁用：`opacity: 0.5`、`cursor: not-allowed`。（DESIGN §7.3）

### 4.4 水流模拟系统
- [ ] 实现 `WaterSimulation.ts`：
  - 固定时间步长（默认 1/60 秒），与渲染帧率解耦。（PRD §6.5, ARCHITECTURE §7.1）
  - 禁用真随机；湍流使用预计算噪声表或固定种子。（PRD §6.5, ARCHITECTURE §7.1）
  - 浮点运算统一精度或截断小数位，确保跨设备确定性。（PRD §6.5, ARCHITECTURE §7.1）
  - 水源按 `base → peak → stable` 流量曲线生成粒子。（PRD §5.2, §6.5）
  - 粒子水平速度 80–110 px/s，带轻微 y 轴偏移与重力下沉。（DESIGN §6.6）
  - 与构件碰撞后按 `WaterInteractionRule` 改变速度。（ARCHITECTURE §4.2）
  - 每帧独立统计进入村庄受击区域的粒子数 `villageHitCount`，与渲染粒子数解耦。（PRD §5.2, §6.5, ARCHITECTURE §7.1）
- [ ] 实现性能分级：高端 600 粒子/60fps、中端 400 粒子/30fps、低端 200 粒子/优先交互帧率；仅影响视觉密度，不影响判定。（PRD §6.5, ARCHITECTURE §7.2）

### 4.5 构件交互
- [ ] 实现 `WaterInteraction.ts` 基类/接口。（ARCHITECTURE §3.1）
- [ ] 实现 `StoneWallInteraction.ts`：
  - 粒子 x 方向反弹并衰减；对墙产生水势压力累积。（PRD §5.2, DESIGN §6.6）
  - 压力 ≥ `collapseThreshold` 后 0.8–2 秒内进入 `Collapsed` 状态，不再阻挡水流，透明度降至 0.35。（PRD §3.3, §5.2, DESIGN §6.6, ARCHITECTURE §8.1）
- [ ] 实现 `BambooCageInteraction.ts`：
  - 竖放（rotStep 对应竖放）时粒子 x 减速，y 方向被推向上/下两侧（分水）。（PRD §5.2, DESIGN §6.6）
  - 横放时粒子 x 方向反弹或阻挡。（PRD §5.2）

### 4.6 结算系统
- [ ] 实现 `SettlementSystem.ts`：
  - 成功：村庄未被淹没 → 显示「暂时安全」。（PRD §5.2）
  - 失败：村庄被淹 →「村子仍被淹」；石墙倒塌导致村庄被淹 →「墙倒了」。（PRD §5.2）
  - 计算 `isFrugal`，更新 `LevelState.attempts`、解锁 L2 预览状态。（PRD §5.2, §3.3）
  - 结算后异步上报服务端保存进度，失败不影响本地结果。（PRD §6.6, ARCHITECTURE §5.3）

### 4.7 运行时主控
- [ ] 实现 `PuzzleRuntime.ts`：
  - 持有状态机、金钱、库存、已放置构件、撤销栈、模拟数据。（ARCHITECTURE §4.5, §5.1）
  - 状态转换：`Editing → Simulating → Settling → Editing` 或 `LevelMap`；`Simulating ↔ Paused`。（PRD §5.3）
  - 点击放水时校验库存/金钱/布局合法后切换为 `Simulating`。（PRD §5.2）
  - 模拟达到最大时长或触发失败条件后切换为 `Settling`。（PRD §5.2）

---

## 5. UI 场景与弹窗

### 5.1 通用 UI 组件预制体
按 DESIGN §4 与 ARCHITECTURE §3.1 实现以下预制体，颜色、尺寸、动效严格一致：
- [ ] `Button.prefab`：卷轴式不对称圆角 `4px 12px 12px 4px`，悬停上移 2px + 投影加深 + 水墨晕开，按下回弹，过渡 `0.2s ease`。（DESIGN §4.1）
- [ ] `ScrollModal.prefab`：最大宽度 480px，圆角 12px，边框 3px `--ink-dark`，左右赭石轴杆 18px，内容区内边距 32px 36px（移动端 24px 28px）。（DESIGN §4.2）
- [ ] `Seal.prefab`：48px×48px，`--red-ink` 底色，`--paper` 文字 20px 粗体，旋转 -6deg，投影 2px 2px；含关卡节点变体 32px×32px、14px 字、旋转 -12deg。（DESIGN §4.3）
- [ ] `LevelNode.prefab`：80px×80px 圆形徽章，边框 3px `--ink-dark`；未解锁 `opacity: 0.55`；已通关背景 `--green-pale`；预览解锁边框 `--ochre` + 外发光；悬停非锁定 `translateY(-4px)` `0.2s ease`。（DESIGN §4.4）
- [ ] `MoneyBar.prefab`：背景 `--paper-dark`，边框 2px `--ink-dark`，圆角 20px，内边距 6px 14px。（DESIGN §4.6）
- [ ] `BlockCard.prefab`：背景 `--paper`，边框 2px `--ink-dark`，圆角 8px，最小宽度 64px；选中背景 `--green-pale`、上移 2px；库存为空 `opacity: 0.45`。（DESIGN §4.7）
- [ ] `DeleteZone.prefab`：56px×56px，虚线边框 `--red-ink`，圆角 8px，激活态 `scale(1.05)` + 背景加深。（DESIGN §4.8）
- [ ] `WaterButton.prefab`：64px×64px 圆形，`--water` 背景，文字 `--paper`，禁用态 `--ink-light`。（DESIGN §4.9）
- [ ] `Toast.prefab`：底部 80px 居中，`--ink-dark` 背景，`--paper` 文字，圆角 20px，入场 `translateY(20px)` 淡入，`0.3s ease`，停留 2 秒。（DESIGN §4.11）

### 5.2 游戏构件预制体
- [ ] `StoneWall.prefab`：带 Sprite、BoxCollider2D、交互脚本，状态 `active/collapsed`。
- [ ] `BambooCage.prefab`：带 Sprite、BoxCollider2D、交互脚本，支持 4 步旋转。

### 5.3 场景实现
- [ ] `BootScene.scene` + `BootSceneCtrl.ts`：
  - 全屏居中标题 + 副标题 + 进度条 + 加载文案「正在引水入渠…」。（DESIGN §5.1）
  - 资源预加载、版本号、静默登录/游客身份生成。（PRD §4）
  - 进度条 `--paper-dark` 底色、`--ink-dark` 填充，`0.1s linear` 宽度变化。（DESIGN §5.1, §7.1）
  - 加载完成后跳转 `TitleScene`。
- [ ] `TitleScene.scene` + `TitleSceneCtrl.ts`：
  - 底部 35vh 远山 SVG 剪影背景；居中主标题「都江堰治水」、副标题、开始游戏按钮；右上角设置图标按钮。（DESIGN §5.2）
  - 主标题文字投影 3px 3px 0 rgba(0,0,0,0.1)。（DESIGN §5.2）
- [ ] `LevelMapScene.scene` + `LevelMapSceneCtrl.ts`：
  - 顶部场景标题「治水卷轴」+ 返回按钮；中部横向滚动卷轴区域；关卡节点间距 60px。（PRD §4, DESIGN §5.3）
  - 卷轴背景 `--paper`，边框 3px `--ink-dark`，圆角 16px，左右赭石轴杆。（DESIGN §5.3）
  - L1 可点击进入；L2 显示「开发中，敬请期待」，点击弹出 Toast「开发中，敬请期待」；L1 通关后 L2 变为预览状态（边框 `--ochre` + 外发光），仍不可进入。（PRD §3.3, DESIGN §7.2）
  - 从服务端拉取最新 `LevelState` 显示解锁与成绩。（PRD §6.6, ARCHITECTURE §5.3）
- [ ] `GameScene.scene` + `GameSceneCtrl.ts`：
  - 结构自上而下：`.game-header`（返回、关卡名、状态徽章、金钱条、撤销/重置）、`.game-canvas-area`（Canvas 编辑/模拟区）、`.game-toolbar`（构件卡片、删除区、放水按钮）。（DESIGN §5.4）
  - Canvas 层级：背景渐变 → 河流区域 → 河岸虚线 → 网格线（仅 Editing） → 水源/村庄/支流引导 → 构件 → 拖拽预览 → 墨滴粒子 → 暂停遮罩。（DESIGN §5.4）
  - 状态徽章：编辑中 `--green-pale`、模拟中 `--ochre`、结算中 `--red-ink`。（DESIGN §4.5）
  - 村庄触发区：初始 `rgba(139,58,58,0.15)` 填充，随命中比例升至 0.7。（DESIGN §5.4）
  - 进入关卡时加载 `LevelConfig`，初始化 `PuzzleRuntime`、`MoneyWallet`、`Inventory`。（PRD §5.2）

### 5.4 弹窗实现
- [ ] `NarrativeOverlay.ts`：关卡进入/成功/失败时半屏叙事文案，使用 `ScrollModal.prefab`。（PRD §4, §5.2）
- [ ] `ResultOverlay.ts`：结算弹窗，显示「暂时安全」/失败原因、实际消耗、节俭判定、重试/返回按钮。（PRD §4, §5.2）
- [ ] `HintOverlay.ts`：老河工提示层，L1 失败 1–2 次后触发，高亮关键区域。（PRD §3.1, §5.2, ARCHITECTURE §8.1）
- [ ] `SettingsOverlay.ts`：设置弹窗，含音效、音乐、语言（仅简体中文占位）、清除存档按钮；清除存档使用浏览器原生 `confirm` 二次确认。（PRD §4, DESIGN §7.2）
- [ ] `LoadingOverlay.ts`：关卡切换加载提示，卷轴小弹窗 + 脉冲水滴图标 + 文案「引水入渠中…」。（PRD §4, DESIGN §7.1）

---

## 6. 视觉与动效

### 6.1 色彩系统落地
- [ ] 在 Cocos 中建立颜色配置表，严格映射 DESIGN §2.1 全部 CSS 变量：`--ink-black #1a1a1a`、`--ink-dark #2d2d2d`、`--ink-gray #5a5a5a`、`--ink-light #8a8a8a`、`--paper #f5f0e8`、`--paper-dark #e8e0d4`、`--ochre #c4a77d`、`--green-pale #a8c5b5`、`--red-ink #8b3a3a`、`--water #3a4a5a`、`--water-light #5a7a8a`、`--shadow rgba(0,0,0,0.15)`。
- [ ] 禁止使用未定义颜色、高饱和荧光色、彩虹渐变。（DESIGN §2.2, ARCHITECTURE §7.3）

### 6.2 字体与排版
- [ ] 标题/叙事使用宋体/书法体 fallback：`"STSong", "SimSun", "Noto Serif SC", serif`。（DESIGN §3.1）
- [ ] 正文/UI 使用系统无衬线 fallback：`"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`。（DESIGN §3.1）
- [ ] 字号层级按 DESIGN §3.2 实现，移动端 ≤480px 使用对应缩小字号。
- [ ] 标题 letter-spacing 4px–12px；叙事文案 `line-height: 1.8` 居中；印章文字旋转 -6deg 至 -12deg。（DESIGN §3.3）

### 6.3 动效实现
- [ ] 按钮悬停：上移 2px + 投影加深 + 中心水墨晕开 radial-gradient；按下回弹；时长 `0.2s ease`。（DESIGN §4.1, §6.2）
- [ ] 弹窗建议：从 `scale(0.95)` + `opacity: 0` 过渡到 `scale(1)` + `opacity: 1`，`0.25s ease-out`。（DESIGN §6.3）
- [ ] 关卡节点悬停非锁定上移 4px，`0.2s ease`。（DESIGN §6.4）
- [ ] 构件卡片选中上移 2px、背景变 `--green-pale`、投影加深。（DESIGN §6.5）
- [ ] 水流粒子：按 `base → peak → stable` 生成；石墙倒塌透明度 0.35；村庄受击区红色透明度随命中比例 0.15→0.7。（DESIGN §6.6）
- [ ] BootScene 内容 `fadeIn 1s ease`；LoadingOverlay 水滴 `pulse 1.5s infinite`（1.0→1.05）。（DESIGN §6.7）

### 6.4 Shader（MVP 占位）
- [ ] 创建 `InkFlow.effect` 与 `WaterRipple.effect` 文件作为占位，实现基础水墨流动与水面波纹效果即可，不追求完整美术品质。（ARCHITECTURE §3.1）

### 6.5 响应式与触控
- [ ] 移动端 ≤480px 按 DESIGN §8.2 覆盖：标题字号 40px、弹窗内边距 24px 28px、工具栏自动换行、卷轴保持横向滚动、按钮触控区域 ≥44px。
- [ ] 禁用长按选中与文本选择；Canvas 统一使用 Pointer Events。（DESIGN §8.3）

---

## 7. 音效与音乐（MVP 占位）

- [ ] 在 `assets/audio/` 建立目录结构。
- [ ] 放置音效：竹笼摩擦、石墙落地（触发点占位）。
- [ ] 放水音效：水声随流量变化（触发点占位）。
- [ ] 成功音效：古琴单音；失败音效：低沉水声 + 村民惊呼（触发点占位）。
- [ ] 实现音效开关控制，保存到 `GameSettings.soundEnabled`/`musicEnabled`。
- [ ] MVP 内不强制要求完整音效资源，但必须保留触发点与空函数，便于后续替换。（PRD §3.1, DESIGN §9.1）

---

## 8. 服务端 API 实现

### 8.1 关卡配置服务
- [ ] `LevelConfigController.java` + `LevelConfigService.java`：
  - `GET /api/v1/levels` → `LevelConfigDTO[]`
  - `GET /api/v1/levels/{levelId}` → `LevelConfigDTO`
  - `GET /api/v1/blocks` → `BuildingBlockDTO[]`
- [ ] 从 `static/levels/` 或数据库读取配置并返回。

### 8.2 用户进度服务
- [ ] `UserProgressController.java` + `UserProgressService.java` + `UserProgressRepository.java`：
  - `GET /api/v1/users/{userId}/progress` → `UserProgressDTO`
  - `POST /api/v1/users/{userId}/progress`（Body: `GameSave`）→ 持久化并返回 `UserProgressDTO`
- [ ] 使用 Redis 缓存热数据。

### 8.3 成就/排行榜预留
- [ ] `AchievementController.java` + `AchievementService.java`：仅创建接口与空实现，MVP 不开放具体功能。（PRD §3.2, ARCHITECTURE §3.2）

### 8.4 异常处理
- [ ] 全局异常处理：统一封装错误码与消息，返回标准 `{ code, message, data }` 格式。（ARCHITECTURE §5.4）

---

## 9. 配置内容细节

### 9.1 L1「堵」关卡配置
- [ ] 地形：x-y 平面 2D 横板，x 为水流方向，y 为上下方向；河流区域从左向右；村庄在右下侧。（PRD §3.3, ARCHITECTURE §6.4）
- [ ] 水源：左侧入口，按 base → peak → stable 曲线生成粒子。（PRD §5.2）
- [ ] 村庄触发区：矩形区域，配置 `hitThreshold`。（PRD §3.3, ARCHITECTURE §4.1）
- [ ] 库存：石墙、竹笼数量（待策划最终确认，当前先按 PRD 示例或占位）。（PRD §10）
- [ ] 金钱：`max` 上限、`frugalThreshold` 节俭阈值、`placementCost` 各构件花费。（PRD §3.3, ARCHITECTURE §4.1）
- [ ] 模拟参数：`maxDuration`、`timeStep = 1/60`、`flowCurve`。（PRD §6.5, ARCHITECTURE §4.1）
- [ ] 胜利条件：`villageNotFlooded = true`。（ARCHITECTURE §4.1）
- [ ] 失败条件：`villageFlooded = true`、`wallCollapsedCausedFlood = true`。（ARCHITECTURE §4.1）
- [ ] 提示：`triggerAttempts`（1–2 次）、提示文本、高亮区域。（PRD §3.1, §3.3）

### 9.2 构件配置
- [ ] 石墙：耐久、倒塌水势阈值、各旋转步交互规则（默认阻挡/反射 x 方向）。（PRD §5.2, ARCHITECTURE §4.2）
- [ ] 竹笼：竖放时分流上下、横放时阻挡/反射；配置对应 `WaterInteractionRule`。（PRD §5.2, ARCHITECTURE §4.2）

---

## 10. 测试与验收

### 10.1 单元测试
- [ ] 客户端：编写 `MoneyWallet`、`Inventory`、`UndoSystem`、`PlacementSystem`、`WaterSimulation`、`SettlementSystem` 的单元测试。
- [ ] 服务端：使用 JUnit 编写 `LevelConfigService`、`UserProgressService` 单元测试。

### 10.2 集成测试
- [ ] 跑通 `BootScene → TitleScene → LevelMapScene → GameScene(L1) → ResultOverlay → LevelMapScene` 完整流程。
- [ ] 验证编辑 → 放水 → 模拟 → 结算状态机切换。（PRD §5.3）
- [ ] 验证 L1 硬堵失败：横向筑坝 → 石墙 0.8–2 秒内倒塌 → 村庄约 10 秒内被淹 → 失败反馈「墙倒了」/「村子仍被淹」。（PRD §3.3, ARCHITECTURE §8.1）
- [ ] 验证 L1 疏导成功：竖放竹笼分水 → 村庄不被淹 → 显示「暂时安全」。（PRD §3.3）
- [ ] 验证节俭判定：实际消耗 ≤ 节俭阈值时 `isFrugal = true`。（PRD §5.2）
- [ ] 验证 L2 占位：不可进入，点击提示「开发中，敬请期待」；L1 通关后变为预览状态仍不可进入。（PRD §3.3）
- [ ] 验证提示触发：L1 失败 1–2 次后弹出 `HintOverlay`。（PRD §3.1, ARCHITECTURE §8.1）
- [ ] 验证存档：H5 localStorage / 微信 wx 存储读写正常，失败回退默认进度。（PRD §3.1）
- [ ] 验证服务端同步：结算后 POST 进度成功，关卡选择器重新拉取显示最新状态。（PRD §6.6）

### 10.3 性能验收
- [ ] 中端机 30fps、高端机 60fps。（PRD §8, ARCHITECTURE §9.2）
- [ ] 启动时间：BootScene 到 TitleScene ≤ 5 秒。（ARCHITECTURE §9.2）
- [ ] 微信低端机不触发内存警告、连续 10 分钟无异常发热。（ARCHITECTURE §9.2）

### 10.4 确定性验收
- [ ] 同一布局在 3 台不同设备运行，判定结果一致。（ARCHITECTURE §9.3）
- [ ] 高中低粒子数下，`villageHitCount` 判定结果一致。（ARCHITECTURE §9.3）
- [ ] 模拟 100 次无异常浮点漂移导致结果不一致。（ARCHITECTURE §9.3）

### 10.5 视觉验收
- [ ] 所有 UI 颜色可在 DESIGN.md 色表中找到对应。（ARCHITECTURE §9.4）
- [ ] 按钮、弹窗、印章、金钱条、状态徽章符合 DESIGN.md 规范。（ARCHITECTURE §9.4）
- [ ] 按钮悬停、弹窗出现、Toast、构件编辑动效参数一致。（ARCHITECTURE §9.4）
- [ ] 移动端 ≤480px 布局与触控区域正常。（ARCHITECTURE §9.4）

---

## 11. 部署与发布准备

- [ ] 服务端 Dockerfile 与 `docker-compose.yml`（含 MySQL/PostgreSQL + Redis + Nginx）准备。（PRD §6.3, ARCHITECTURE §2.2）
- [ ] Cocos H5 构建配置，确保首包仅含 L1 资源。（PRD §6.5, ARCHITECTURE §7.2）
- [ ] 微信小游戏构建配置预留，后续关卡远程加载方案确认。（PRD §3.1, ARCHITECTURE §7.2）
- [ ] 静态资源配置 CDN 路径占位。

---

## 12. 禁止破坏的红线（编码时必须逐条自检）

1. **教学逻辑不可破坏**：L1 必须让玩家通过硬堵失败领悟“堵不如疏”；石墙倒塌 0.8–2 秒；村庄约 10 秒被淹；失败 1–2 次触发提示。（PRD §3.3, ARCHITECTURE §8.1）
2. **零惩罚体验不可破坏**：重置、撤销、重试不消耗任何资源或次数；撤销栈 ≥20 步；失败视觉不刺眼，重试入口始终突出。（PRD §1.4, §2.1, ARCHITECTURE §8.2）
3. **确定性不可破坏**：固定时间步长；禁用真随机；判定逻辑与渲染粒子数完全解耦。（PRD §6.5, ARCHITECTURE §8.3）
4. **商业模式不可破坏**：不卖资源、不卖跳关、不付费跳过；激励广告仅换提示。（PRD §1.2, §2.3, ARCHITECTURE §8.4）
5. **视觉风格不可破坏**：水墨国风基调；使用 `--ink-black`、`--paper`、`--water` 等核心色系；保留印章、卷轴、留白。（ARCHITECTURE §8.5）
6. **配置不可硬编码**：关卡数值、构件数值必须通过 `LevelConfig` / `BuildingBlockConfig` 读取。（ARCHITECTURE §7.5）
7. **平台抽象不可绕过**：禁止在业务逻辑中直接调用 `localStorage` 或 `wx.*`，必须通过 `StorageAdapter` / `AdAdapter`。（ARCHITECTURE §7.5）
8. **状态机不可绕过**：禁止直接修改 `PuzzleRuntime.state`，所有状态变更必须经过 `StateMachine`。（ARCHITECTURE §7.5）
9. **AI 不可侵入玩法**：不得实时生成答案、动态调整核心数值、替代状态机/物理判定、生成未审批付费资源。（ARCHITECTURE §6）
10. **不杜撰未授权内容**：所有新增美术、音效、关卡、机制必须经 PRD 评审，禁止自行增加源文档未列出的内容。（DESIGN §9.2）

---

## 13. 待确认事项清单（需用户/策划补充）

以下内容 PRD §10 已列为待确认，编码时先用占位值，确认后更新：
- [ ] L1 具体地形、水源、村庄坐标与库存数值。
- [ ] 石墙、竹笼预渲染美术资源规格（尺寸、帧数、颜色）。
- [ ] Java 后端是否使用 Spring Boot，数据库选型（MySQL/PostgreSQL）。
- [ ] 浏览器版是否接入第三方登录（微信扫码/手机号），MVP 建议先用游客模式。
- [ ] 激励视频广告接入时机（MVP 是否包含）。

---

*文档结束。后续所有代码实现必须能从本 TODO 找到对应来源条目，并关联 PRD.md / DESIGN.md / ARCHITECTURE.md 具体章节。*
