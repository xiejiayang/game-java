import { Vector2 } from '../data/LevelConfig';

/**
 * 已放置构件实体
 * 来源：ARCHITECTURE §4.3
 */
export interface PlacedBlock {
    instanceId: string;
    configId: string;
    position: Vector2;
    rotStep: number;
    state: 'active' | 'collapsed';
    currentPressure: number;
}
