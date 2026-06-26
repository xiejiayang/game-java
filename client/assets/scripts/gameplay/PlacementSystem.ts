import { BuildingBlockConfig } from '../data/BuildingBlockConfig';
import { Vector2 } from '../data/LevelConfig';
import { PlacedBlock } from '../entities/PlacedBlock';
import { Logger } from '../core/Logger';

/**
 * 放置结果
 */
export interface PlacementResult {
    success: boolean;
    block?: PlacedBlock;
    reason?: 'out_of_bounds' | 'occupied' | 'invalid_rotStep';
}

/**
 * 地形边界
 */
export interface TerrainBounds {
    width: number;
    height: number;
}

/**
 * 配置查找函数类型
 */
export type ConfigLookup = (configId: string) => BuildingBlockConfig | undefined;

/**
 * 放置系统
 * 处理拖拽、网格吸附、旋转、删除、碰撞检测。
 * 来源：PRD §5.2, ARCHITECTURE §5.1
 */
export class PlacementSystem {
    private readonly logger = new Logger('PlacementSystem');
    private gridSize: number;
    private bounds: TerrainBounds;

    constructor(gridSize = 0.5, bounds: TerrainBounds = { width: 20, height: 10 }) {
        this.gridSize = gridSize;
        this.bounds = bounds;
    }

    /**
     * 网格吸附
     */
    public snapToGrid(position: Vector2): Vector2 {
        return {
            x: Math.round(position.x / this.gridSize) * this.gridSize,
            y: Math.round(position.y / this.gridSize) * this.gridSize,
        };
    }

    /**
     * 判断是否可以放置
     * @param lookup 其他已放置构件的配置查找函数
     */
    public canPlace(
        blockConfig: BuildingBlockConfig,
        position: Vector2,
        rotStep: number,
        existing: PlacedBlock[],
        lookup: ConfigLookup,
    ): PlacementResult['reason'] | null {
        if (rotStep < 0 || rotStep >= blockConfig.rotStepCount) {
            return 'invalid_rotStep';
        }

        const box = this.getBoundingBox(blockConfig.size, position, rotStep);

        if (box.minX < 0 || box.maxX > this.bounds.width || box.minY < 0 || box.maxY > this.bounds.height) {
            return 'out_of_bounds';
        }

        for (const other of existing) {
            const otherConfig = lookup(other.configId);
            if (!otherConfig) {
                continue;
            }
            const otherBox = this.getBoundingBox(otherConfig.size, other.position, other.rotStep);
            if (this.intersect(box, otherBox)) {
                return 'occupied';
            }
        }

        return null;
    }

    /**
     * 放置构件
     */
    public place(
        config: BuildingBlockConfig,
        position: Vector2,
        rotStep = 0,
        existing: PlacedBlock[] = [],
        lookup: ConfigLookup = () => undefined,
    ): PlacementResult {
        const snapped = this.snapToGrid(position);
        const reason = this.canPlace(config, snapped, rotStep, existing, lookup);

        if (reason) {
            this.logger.warn(`Cannot place: ${reason}`);
            return { success: false, reason };
        }

        const block: PlacedBlock = {
            instanceId: this.generateId(),
            configId: config.id,
            position: { ...snapped },
            rotStep,
            state: 'active',
            currentPressure: 0,
        };

        return { success: true, block };
    }

    /**
     * 旋转已放置构件
     */
    public rotate(block: PlacedBlock, config: BuildingBlockConfig): boolean {
        if (!config.rotatable) {
            return false;
        }
        block.rotStep = (block.rotStep + 1) % config.rotStepCount;
        return true;
    }

    /**
     * 删除构件是否允许
     */
    public canRemove(block: PlacedBlock): boolean {
        return block.state !== 'collapsed';
    }

    /**
     * 检查点是否在删除区内（UI 传入删除区矩形）
     */
    public isInDeleteZone(position: Vector2, zone: { x: number; y: number; width: number; height: number }): boolean {
        return (
            position.x >= zone.x &&
            position.x <= zone.x + zone.width &&
            position.y >= zone.y &&
            position.y <= zone.y + zone.height
        );
    }

    /**
     * 计算包围盒
     */
    public getBoundingBox(
        size: { width: number; height: number },
        position: Vector2,
        rotStep: number,
    ): { minX: number; maxX: number; minY: number; maxY: number } {
        // rotStep 0/2：横向；1/3：纵向（长宽互换）
        const isVertical = rotStep % 2 === 1;
        const halfW = (isVertical ? size.height : size.width) / 2;
        const halfH = (isVertical ? size.width : size.height) / 2;

        return {
            minX: position.x - halfW,
            maxX: position.x + halfW,
            minY: position.y - halfH,
            maxY: position.y + halfH,
        };
    }

    private intersect(
        a: { minX: number; maxX: number; minY: number; maxY: number },
        b: { minX: number; maxX: number; minY: number; maxY: number },
    ): boolean {
        return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
    }

    private generateId(): string {
        return `block_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    }
}
