import { Achievement } from './Achievement';
import { GameSettings } from './GameSettings';
import { LevelState } from './LevelState';

/**
 * 游戏存档
 * 来源：ARCHITECTURE §4.4
 */
export interface GameSave {
    userId: string;
    version: string;
    levelStates: LevelState[];
    settings: GameSettings;
    achievements: Achievement[];
    updatedAt: number;
}
