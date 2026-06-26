/**
 * 构件配置类型
 * 来源：ARCHITECTURE §4.2
 */
export interface Vector2 {
    x: number;
    y: number;
}

export type Direction = 'left' | 'right' | 'up' | 'down';

export type WaterResponse = 'block' | 'reflect' | 'divertUp' | 'divertDown' | 'slow';

export interface WaterInteractionRule {
    rotStep: number;
    incomingDirection: Direction;
    response: WaterResponse;
    velocityChange: Vector2;
    pressureMultiplier: number;
}

export interface BuildingBlockConfig {
    id: string;
    name: string;
    type: 'stoneWall' | 'bambooCage';
    icon: string;
    size: { width: number; height: number };
    cost: number;
    maxHealth?: number;
    collapseThreshold?: number;
    interactions: WaterInteractionRule[];
    rotatable: boolean;
    rotStepCount: number;
}
