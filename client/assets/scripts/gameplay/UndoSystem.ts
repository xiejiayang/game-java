import { PlacedBlock } from '../entities/PlacedBlock';

/**
 * 撤销动作类型
 */
export type UndoActionType = 'place' | 'remove' | 'rotate';

/**
 * 撤销动作
 * 来源：ARCHITECTURE §4.5, §5.1
 */
export interface UndoAction {
    type: UndoActionType;
    blockInstanceId: string;
    /** place 时记录被放置的构件完整状态 */
    placedBlock?: PlacedBlock;
    /** remove 时记录被删除前的构件状态 */
    removedBlock?: PlacedBlock;
    /** rotate 时记录旋转前的 rotStep */
    previousRotStep?: number;
}

/**
 * 撤销系统
 * 维护最多 20 步撤销栈；重置时清空；进入 Simulating 后不可撤销。
 * 来源：PRD §5.2, ARCHITECTURE §5.1, §8.2
 */
export class UndoSystem {
    public static readonly MAX_SIZE = 20;

    private stack: UndoAction[] = [];
    private enabled = true;

    /**
     * 压入一个撤销动作
     */
    public push(action: UndoAction): void {
        if (!this.enabled) {
            return;
        }
        this.stack.push(action);
        if (this.stack.length > UndoSystem.MAX_SIZE) {
            this.stack.shift();
        }
    }

    /**
     * 弹出最近一个撤销动作
     */
    public pop(): UndoAction | null {
        if (!this.enabled || this.stack.length === 0) {
            return null;
        }
        return this.stack.pop() ?? null;
    }

    /**
     * 查看最近动作（不弹出）
     */
    public peek(): UndoAction | null {
        if (this.stack.length === 0) {
            return null;
        }
        return this.stack[this.stack.length - 1];
    }

    /**
     * 是否可以撤销
     */
    public canUndo(): boolean {
        return this.enabled && this.stack.length > 0;
    }

    /**
     * 清空撤销栈
     */
    public clear(): void {
        this.stack = [];
    }

    /**
     * 获取当前栈深度
     */
    public get size(): number {
        return this.stack.length;
    }

    /**
     * 禁用撤销（进入 Simulating 后调用）
     */
    public disable(): void {
        this.enabled = false;
    }

    /**
     * 启用撤销（返回编辑状态时调用）
     */
    public enable(): void {
        this.enabled = true;
    }

    /**
     * 当前是否启用
     */
    public isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * 创建 place 动作的便捷方法
     */
    public static createPlaceAction(block: PlacedBlock): UndoAction {
        return {
            type: 'place',
            blockInstanceId: block.instanceId,
            placedBlock: { ...block, position: { ...block.position } },
        };
    }

    /**
     * 创建 remove 动作的便捷方法
     */
    public static createRemoveAction(block: PlacedBlock): UndoAction {
        return {
            type: 'remove',
            blockInstanceId: block.instanceId,
            removedBlock: { ...block, position: { ...block.position } },
        };
    }

    /**
     * 创建 rotate 动作的便捷方法
     */
    public static createRotateAction(block: PlacedBlock, previousRotStep: number): UndoAction {
        return {
            type: 'rotate',
            blockInstanceId: block.instanceId,
            previousRotStep,
        };
    }
}
