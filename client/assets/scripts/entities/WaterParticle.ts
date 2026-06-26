import { Vector2 } from '../data/LevelConfig';

/**
 * 水流粒子实体
 * 来源：ARCHITECTURE §4.3
 */
export interface WaterParticle {
    id: number;
    position: Vector2;
    velocity: Vector2;
    mass: number;
    lifeTime: number;
    isActive: boolean;
}
