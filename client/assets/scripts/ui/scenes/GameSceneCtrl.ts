import { Logger } from '../../core/Logger';
import { PuzzleRuntime } from '../../gameplay/PuzzleRuntime';
import { LevelConfig } from '../../data/LevelConfig';
import { BuildingBlockConfig } from '../../data/BuildingBlockConfig';
import { eventBus } from '../../core/EventBus';

/**
 * GameScene 控制器
 * 来源：PRD §4, DESIGN §5.4
 */
export class GameSceneCtrl {
    private readonly logger = new Logger('GameSceneCtrl');
    private runtime: PuzzleRuntime | null = null;

    public onLoad(levelConfig: LevelConfig, blockConfigs: BuildingBlockConfig[]): void {
        this.logger.info('GameScene onLoad');
        const configMap: Record<string, BuildingBlockConfig> = {};
        for (const c of blockConfigs) {
            configMap[c.id] = c;
        }
        this.runtime = new PuzzleRuntime(levelConfig, configMap);
        this.bindEvents();
    }

    public onPlaceBlock(blockConfig: BuildingBlockConfig, x: number, y: number): void {
        this.runtime?.placeBlock(blockConfig, { x, y });
    }

    public onRotateBlock(instanceId: string): void {
        this.runtime?.rotateBlock(instanceId);
    }

    public onRemoveBlock(instanceId: string): void {
        this.runtime?.removeBlock(instanceId);
    }

    public onUndo(): void {
        this.runtime?.undoAction();
    }

    public onReset(): void {
        this.runtime?.reset();
    }

    public onWater(): void {
        this.runtime?.startSimulation();
    }

    public onPause(): void {
        this.runtime?.togglePause();
    }

    public update(dt: number): void {
        this.runtime?.step(dt);
    }

    private bindEvents(): void {
        eventBus.on('puzzle:stateChanged', (ev) => {
            this.logger.info('state changed:', ev);
        });
        eventBus.on('puzzle:settled', (result) => {
            this.logger.info('settled:', result);
            // TODO: 打开 ResultOverlay
        });
    }
}
