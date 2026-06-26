import { WaterInteractionRule } from '../data/BuildingBlockConfig';

/**
 * 竹笼水流交互
 * 来源：PRD §5.2, DESIGN §6.6
 *
 * 竖放（rotStep 0/2）时粒子 x 减速，y 方向被推向上/下两侧（分水）。
 * 横放（rotStep 1/3）时粒子 x 方向反弹或阻挡。
 */
export class BambooCageInteraction {
    /**
     * 默认竹笼规则
     */
    public static createDefaultRules(): WaterInteractionRule[] {
        return [
            // 竖放：分水
            { rotStep: 0, incomingDirection: 'right', response: 'divertUp', velocityChange: { x: 0.3, y: 1 }, pressureMultiplier: 0.2 },
            { rotStep: 0, incomingDirection: 'right', response: 'divertDown', velocityChange: { x: 0.3, y: -1 }, pressureMultiplier: 0.2 },
            { rotStep: 2, incomingDirection: 'right', response: 'divertUp', velocityChange: { x: 0.3, y: 1 }, pressureMultiplier: 0.2 },
            { rotStep: 2, incomingDirection: 'right', response: 'divertDown', velocityChange: { x: 0.3, y: -1 }, pressureMultiplier: 0.2 },
            // 横放：阻挡/反弹
            { rotStep: 1, incomingDirection: 'right', response: 'reflect', velocityChange: { x: -0.5, y: 0 }, pressureMultiplier: 0.5 },
            { rotStep: 3, incomingDirection: 'right', response: 'reflect', velocityChange: { x: -0.5, y: 0 }, pressureMultiplier: 0.5 },
        ];
    }
}
