import { BuildingBlockConfig, Direction, WaterInteractionRule, WaterResponse } from '../data/BuildingBlockConfig';
import { WaterParticle } from '../entities/WaterParticle';
import { PlacedBlock } from '../entities/PlacedBlock';
import { CollisionResult, InteractionResolver } from '../gameplay/WaterSimulation';

/**
 * 水流交互基础工具
 * 来源：ARCHITECTURE §3.1, §4.2
 */

/**
 * 根据速度方向确定来水方向
 */
export function getIncomingDirection(velocity: { x: number; y: number }): Direction {
    const absX = Math.abs(velocity.x);
    const absY = Math.abs(velocity.y);

    if (absX >= absY) {
        return velocity.x >= 0 ? 'right' : 'left';
    }
    return velocity.y >= 0 ? 'up' : 'down';
}

/**
 * 查找匹配的交互规则
 */
export function findRule(
    config: BuildingBlockConfig,
    rotStep: number,
    direction: Direction,
): WaterInteractionRule | null {
    return (
        config.interactions.find((r) => r.rotStep === rotStep && r.incomingDirection === direction) ?? null
    );
}

/**
 * 应用规则得到碰撞结果
 */
export function applyRule(particle: WaterParticle, rule: WaterInteractionRule): CollisionResult {
    return {
        velocity: {
            x: particle.velocity.x * rule.velocityChange.x - particle.velocity.y * rule.velocityChange.y,
            y: particle.velocity.x * rule.velocityChange.y + particle.velocity.y * rule.velocityChange.x,
        },
        pressure: Math.abs(particle.velocity.x) * rule.pressureMultiplier,
    };
}

/**
 * 创建统一交互解析器
 * @param configMap 构件配置查找表
 */
export function createInteractionResolver(
    configMap: Record<string, BuildingBlockConfig>,
): InteractionResolver {
    return (particle: WaterParticle, block: PlacedBlock): CollisionResult | null => {
        const config = configMap[block.configId];
        if (!config) {
            return null;
        }

        const direction = getIncomingDirection(particle.velocity);
        const rule = findRule(config, block.rotStep, direction);
        if (!rule) {
            return null;
        }

        return applyRule(particle, rule);
    };
}

/**
 * 创建默认规则
 */
export function createRule(
    rotStep: number,
    incomingDirection: Direction,
    response: WaterResponse,
    velocityChange: { x: number; y: number },
    pressureMultiplier: number,
): WaterInteractionRule {
    return {
        rotStep,
        incomingDirection,
        response,
        velocityChange,
        pressureMultiplier,
    };
}
