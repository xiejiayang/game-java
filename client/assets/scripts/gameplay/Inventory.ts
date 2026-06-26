import { Logger } from '../core/Logger';

/**
 * 构件库存
 * 来源：PRD §3.1, ARCHITECTURE §5.1
 */
export class Inventory {
    private readonly logger = new Logger('Inventory');
    private stock: Record<string, number> = {};

    constructor(initial: Record<string, number> = {}) {
        this.reset(initial);
    }

    /**
     * 获取某构件剩余数量
     */
    public get(blockId: string): number {
        return this.stock[blockId] ?? 0;
    }

    /**
     * 取出一块构件
     * @returns 是否成功
     */
    public take(blockId: string): boolean {
        const count = this.stock[blockId] ?? 0;
        if (count <= 0) {
            this.logger.warn(`Inventory insufficient for ${blockId}`);
            return false;
        }
        this.stock[blockId] = count - 1;
        return true;
    }

    /**
     * 返还一块构件
     */
    public return(blockId: string): void {
        this.stock[blockId] = (this.stock[blockId] ?? 0) + 1;
    }

    /**
     * 是否有库存
     */
    public has(blockId: string): boolean {
        return this.get(blockId) > 0;
    }

    /**
     * 重置为初始库存
     */
    public reset(initial: Record<string, number> = {}): void {
        this.stock = { ...initial };
    }

    /**
     * 全部库存快照
     */
    public snapshot(): Record<string, number> {
        return { ...this.stock };
    }
}
