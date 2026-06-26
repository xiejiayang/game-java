import { LevelConfig, Vector2 } from '../data/LevelConfig';
import { BuildingBlockConfig } from '../data/BuildingBlockConfig';
import { PlacedBlock } from '../entities/PlacedBlock';
import { WaterParticle } from '../entities/WaterParticle';
import { PuzzleState } from '../core/PuzzleState';
import { createPuzzleStateMachine, StateMachine } from '../core/StateMachine';
import { eventBus } from '../core/EventBus';
import { ObjectPool } from '../core/ObjectPool';
import { MoneyWallet } from './MoneyWallet';
import { Inventory } from './Inventory';
import { PlacementSystem } from './PlacementSystem';
import { UndoSystem } from './UndoSystem';
import { WaterSimulation, getMaxParticlesByTier } from './WaterSimulation';
import { createInteractionResolver } from '../interactions/WaterInteraction';
import { SettlementSystem, SettlementInput, SettlementResult } from './SettlementSystem';
import { LevelState } from '../data/LevelState';
import { GameSave } from '../data/GameSave';
import { ProgressApi } from '../network/ProgressApi';
import { Logger } from '../core/Logger';
import { Toast } from '../ui/components/Toast';
import { StoneWallInteraction } from '../interactions/StoneWallInteraction';

/**
 * 运行时主控
 * 来源：ARCHITECTURE §4.5, §5.1
 */
export class PuzzleRuntime {
    private readonly logger = new Logger('PuzzleRuntime');

    public readonly levelConfig: LevelConfig;
    public readonly blockConfigMap: Record<string, BuildingBlockConfig>;
    public readonly stateMachine: StateMachine<PuzzleState>;
    public readonly wallet: MoneyWallet;
    public readonly inventory: Inventory;
    public readonly placement: PlacementSystem;
    public readonly undo: UndoSystem;
    public readonly water: WaterSimulation;
    public readonly settlement: SettlementSystem;

    public placedBlocks: PlacedBlock[] = [];
    public levelState: LevelState;
    public settlementResult: SettlementResult | null = null;

    private userId: string;
    private performanceTier: 'high' | 'medium' | 'low' = 'medium';

    constructor(levelConfig: LevelConfig, blockConfigMap: Record<string, BuildingBlockConfig>, userId = 'guest') {
        this.levelConfig = levelConfig;
        this.blockConfigMap = blockConfigMap;
        this.userId = userId;

        this.stateMachine = createPuzzleStateMachine({
            onChange: (from, to) => {
                this.logger.info(`State ${from} -> ${to}`);
                eventBus.emit('puzzle:stateChanged', { from, to });
                if (to === PuzzleState.Simulating) {
                    this.undo.disable();
                } else if (from === PuzzleState.Simulating && to === PuzzleState.Editing) {
                    this.undo.enable();
                }
            },
        });

        this.wallet = new MoneyWallet(levelConfig.money.max);
        this.inventory = new Inventory(levelConfig.inventory);
        this.placement = new PlacementSystem(levelConfig.terrain.gridSize, levelConfig.terrain.bounds);
        this.undo = new UndoSystem();
        this.settlement = new SettlementSystem();

        const particlePool = new ObjectPool<WaterParticle>({
            capacity: getMaxParticlesByTier(this.performanceTier),
            factory: () => ({
                id: 0,
                position: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                mass: 1,
                lifeTime: 0,
                isActive: false,
            }),
            reset: (p) => {
                p.isActive = false;
            },
        });

        this.water = new WaterSimulation(
            {
                source: levelConfig.waterSource,
                village: { ...levelConfig.village, hitCount: 0, flooded: false },
                flowCurve: levelConfig.simulation.flowCurve,
                maxDuration: levelConfig.simulation.maxDuration,
                timeStep: levelConfig.simulation.timeStep,
                gravity: 5,
                maxParticles: getMaxParticlesByTier(this.performanceTier),
                bounds: levelConfig.terrain.bounds,
            },
            particlePool,
            createInteractionResolver(blockConfigMap),
        );

        this.levelState = {
            levelId: levelConfig.id,
            status: 'unlocked',
            attempts: 0,
        };
    }

    public get state(): PuzzleState {
        return this.stateMachine.state;
    }

    /**
     * 放置构件
     */
    public placeBlock(blockConfig: BuildingBlockConfig, position: Vector2): boolean {
        if (this.state !== PuzzleState.Editing) {
            return false;
        }

        if (!this.inventory.take(blockConfig.id)) {
            Toast.show('库存不足');
            return false;
        }

        if (!this.wallet.place(blockConfig.cost)) {
            this.inventory.return(blockConfig.id);
            Toast.show('金钱不足');
            return false;
        }

        const result = this.placement.place(blockConfig, position, 0, this.placedBlocks, (id) => this.blockConfigMap[id]);
        if (!result.success) {
            this.inventory.return(blockConfig.id);
            this.wallet.remove(blockConfig.cost);
            if (result.reason === 'occupied') {
                Toast.show('位置已被占用');
            }
            return false;
        }

        const block = result.block!;
        this.placedBlocks.push(block);
        this.undo.push(UndoSystem.createPlaceAction(block));
        eventBus.emit('puzzle:blockPlaced', block);
        return true;
    }

    /**
     * 旋转已放置构件
     */
    public rotateBlock(instanceId: string): boolean {
        if (this.state !== PuzzleState.Editing) {
            return false;
        }

        const block = this.placedBlocks.find((b) => b.instanceId === instanceId);
        if (!block) {
            return false;
        }

        const config = this.blockConfigMap[block.configId];
        if (!config) {
            return false;
        }

        const prevRotStep = block.rotStep;
        const rotated = this.placement.rotate(block, config);
        if (rotated) {
            this.undo.push(UndoSystem.createRotateAction(block, prevRotStep));
            eventBus.emit('puzzle:blockRotated', block);
        }
        return rotated;
    }

    /**
     * 删除已放置构件
     */
    public removeBlock(instanceId: string): boolean {
        if (this.state !== PuzzleState.Editing) {
            return false;
        }

        const index = this.placedBlocks.findIndex((b) => b.instanceId === instanceId);
        if (index < 0) {
            return false;
        }

        const block = this.placedBlocks[index];
        if (!this.placement.canRemove(block)) {
            return false;
        }

        const config = this.blockConfigMap[block.configId];
        if (!config) {
            return false;
        }

        this.placedBlocks.splice(index, 1);
        this.inventory.return(config.id);
        this.wallet.remove(config.cost);
        this.undo.push(UndoSystem.createRemoveAction(block));
        eventBus.emit('puzzle:blockRemoved', block);
        return true;
    }

    /**
     * 撤销上一步
     */
    public undoAction(): boolean {
        if (this.state !== PuzzleState.Editing || !this.undo.canUndo()) {
            return false;
        }

        const action = this.undo.pop();
        if (!action) {
            return false;
        }

        switch (action.type) {
            case 'place':
                if (action.placedBlock) {
                    this.removeBlockByUndo(action.placedBlock.instanceId);
                }
                break;
            case 'remove':
                if (action.removedBlock) {
                    this.restoreBlock(action.removedBlock);
                }
                break;
            case 'rotate':
                if (action.previousRotStep !== undefined) {
                    this.rotateBlockBack(action.blockInstanceId, action.previousRotStep);
                }
                break;
        }

        eventBus.emit('puzzle:undo', action);
        return true;
    }

    /**
     * 重置关卡
     */
    public reset(): void {
        this.placedBlocks = [];
        this.wallet.reset(this.levelConfig.money.max);
        this.inventory.reset(this.levelConfig.inventory);
        this.undo.clear();
        this.water.reset();
        this.settlementResult = null;

        if (this.state !== PuzzleState.Editing) {
            this.stateMachine.reset(PuzzleState.Editing);
        }

        eventBus.emit('puzzle:reset', null);
    }

    /**
     * 开始模拟（放水）
     */
    public startSimulation(): boolean {
        if (this.state !== PuzzleState.Editing) {
            return false;
        }

        if (this.placedBlocks.length === 0) {
            Toast.show('请至少放置一个构件');
            return false;
        }

        this.water.setBlocks(this.placedBlocks);
        this.water.reset();
        return this.stateMachine.transition(PuzzleState.Simulating);
    }

    /**
     * 暂停 / 继续
     */
    public togglePause(): boolean {
        if (this.state === PuzzleState.Simulating) {
            return this.stateMachine.transition(PuzzleState.Paused);
        }
        if (this.state === PuzzleState.Paused) {
            return this.stateMachine.transition(PuzzleState.Simulating);
        }
        return false;
    }

    /**
     * 推进模拟
     */
    public step(deltaTime: number): void {
        if (this.state !== PuzzleState.Simulating) {
            return;
        }

        this.water.step(deltaTime);

        // 更新石墙压力
        for (const block of this.placedBlocks) {
            const config = this.blockConfigMap[block.configId];
            if (config && config.type === 'stoneWall') {
                StoneWallInteraction.updatePressure(block, config, deltaTime);
            }
        }

        const maxTimeReached = this.water.getElapsedTime() >= this.levelConfig.simulation.maxDuration;
        const flooded = this.water.getVillageHitCount() >= this.levelConfig.village.hitThreshold;
        const wallCollapsed = this.placedBlocks.some((b) => b.state === 'collapsed');

        if (maxTimeReached || flooded) {
            this.settle({
                villageHitCount: this.water.getVillageHitCount(),
                villageHitThreshold: this.levelConfig.village.hitThreshold,
                wallCollapsed,
                maxDurationReached: maxTimeReached,
            });
        }
    }

    /**
     * 执行结算
     */
    public settle(input: SettlementInput): SettlementResult {
        if (this.state !== PuzzleState.Simulating) {
            throw new Error('Cannot settle outside Simulating state');
        }

        this.settlementResult = this.settlement.settle(input, this.levelConfig, this.wallet, this.levelState);
        this.stateMachine.transition(PuzzleState.Settling);
        eventBus.emit('puzzle:settled', this.settlementResult);
        return this.settlementResult;
    }

    /**
     * 重试
     */
    public retry(): boolean {
        if (this.state !== PuzzleState.Settling) {
            return false;
        }
        this.reset();
        return true;
    }

    /**
     * 异步上报进度
     */
    public async reportProgress(progressApi: ProgressApi, save: GameSave): Promise<void> {
        await this.settlement.reportProgress(this.userId, save, progressApi);
    }

    private removeBlockByUndo(instanceId: string): void {
        const index = this.placedBlocks.findIndex((b) => b.instanceId === instanceId);
        if (index < 0) {
            return;
        }
        const block = this.placedBlocks[index];
        const config = this.blockConfigMap[block.configId];
        this.placedBlocks.splice(index, 1);
        if (config) {
            this.inventory.return(config.id);
            this.wallet.remove(config.cost);
        }
    }

    private restoreBlock(block: PlacedBlock): void {
        const config = this.blockConfigMap[block.configId];
        if (!config) {
            return;
        }
        if (!this.inventory.take(config.id)) {
            return;
        }
        if (!this.wallet.place(config.cost)) {
            this.inventory.return(config.id);
            return;
        }
        this.placedBlocks.push({ ...block, position: { ...block.position } });
    }

    private rotateBlockBack(instanceId: string, rotStep: number): void {
        const block = this.placedBlocks.find((b) => b.instanceId === instanceId);
        if (block) {
            block.rotStep = rotStep;
        }
    }
}
