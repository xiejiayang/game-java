import { BuildingBlockConfig, WaterInteractionRule } from '../data/BuildingBlockConfig';
import { PlacedBlock } from '../entities/PlacedBlock';

/**
 * 石墙水流交互
 * 来源：PRD §5.2, DESIGN §6.6, ARCHITECTURE §8.1
 *
 * 粒子 x 方向反弹并衰减；对墙产生水势压力累积。
 * 压力 ≥ collapseThreshold 后 0.8–2 秒内进入 Collapsed 状态。
 */
export class StoneWallInteraction {
    /**
     * 默认石墙规则：横向放置时阻挡左右来水，竖向放置时阻挡上下来水
     */
    public static createDefaultRules(): WaterInteractionRule[] {
        return [
            // rotStep 0: 横向，长边水平
            { rotStep: 0, incomingDirection: 'right', response: 'reflect', velocityChange: { x: -0.7, y: 0 }, pressureMultiplier: 1.0 },
            { rotStep: 0, incomingDirection: 'left', response: 'reflect', velocityChange: { x: -0.7, y: 0 }, pressureMultiplier: 1.0 },
            // rotStep 1: 竖向，长边垂直
            { rotStep: 1, incomingDirection: 'up', response: 'reflect', velocityChange: { x: 0, y: -0.7 }, pressureMultiplier: 1.0 },
            { rotStep: 1, incomingDirection: 'down', response: 'reflect', velocityChange: { x: 0, y: -0.7 }, pressureMultiplier: 1.0 },
            // rotStep 2: 横向反向
            { rotStep: 2, incomingDirection: 'right', response: 'reflect', velocityChange: { x: -0.7, y: 0 }, pressureMultiplier: 1.0 },
            { rotStep: 2, incomingDirection: 'left', response: 'reflect', velocityChange: { x: -0.7, y: 0 }, pressureMultiplier: 1.0 },
            // rotStep 3: 竖向反向
            { rotStep: 3, incomingDirection: 'up', response: 'reflect', velocityChange: { x: 0, y: -0.7 }, pressureMultiplier: 1.0 },
            { rotStep: 3, incomingDirection: 'down', response: 'reflect', velocityChange: { x: 0, y: -0.7 }, pressureMultiplier: 1.0 },
        ];
    }

    /**
     * 更新石墙压力与倒塌状态
     * @returns 是否刚刚倒塌
     */
    public static updatePressure(block: PlacedBlock, config: BuildingBlockConfig, dt: number): boolean {
        if (block.state === 'collapsed') {
            return false;
        }

        const threshold = config.collapseThreshold ?? Number.MAX_VALUE;
        if (block.currentPressure >= threshold) {
            block.state = 'collapsed';
            return true;
        }

        // 压力自然衰减
        block.currentPressure = Math.max(0, block.currentPressure - dt * 5);
        return false;
    }
}
