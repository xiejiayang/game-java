import { PlacedBlock } from '../entities/PlacedBlock';
import { WaterParticle } from '../entities/WaterParticle';
import { PuzzleState } from '../core/PuzzleState';

/**
 * 撤销动作
 */
export interface UndoAction {
    type: 'place' | 'remove' | 'rotate';
    blockInstanceId: string;
    previousState?: unknown;
}

/**
 * 运行时数据结构
 * 来源：ARCHITECTURE §4.5
 */
export interface PuzzleRuntime {
    levelId: string;
    state: PuzzleState;
    money: number;
    inventory: Record<string, number>;
    placedBlocks: PlacedBlock[];
    undoStack: UndoAction[];
    simulation: {
        elapsedTime: number;
        particles: WaterParticle[];
        villageHitCount: number;
    };
}
