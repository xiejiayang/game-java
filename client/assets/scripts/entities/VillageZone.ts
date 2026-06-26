import { Vector2 } from '../data/LevelConfig';

/**
 * 村庄受击区域实体
 * 来源：ARCHITECTURE §4.3
 */
export interface VillageZone {
    position: Vector2;
    size: { width: number; height: number };
    hitCount: number;
    flooded: boolean;
}
