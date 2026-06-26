import { Vector2 } from '../data/LevelConfig';
import { WaterParticle } from '../entities/WaterParticle';
import { VillageZone } from '../entities/VillageZone';
import { PlacedBlock } from '../entities/PlacedBlock';
import { ObjectPool } from '../core/ObjectPool';

/**
 * 性能分级
 */
export type PerformanceTier = 'high' | 'medium' | 'low';

/**
 * 流量曲线配置
 */
export interface FlowCurve {
    baseDuration: number;
    peakDuration: number;
    stableDuration: number;
}

/**
 * 水源配置
 */
export interface WaterSource {
    position: Vector2;
    baseFlow: number;
    peakFlow: number;
    stableFlow: number;
}

/**
 * 模拟配置
 */
export interface WaterSimulationConfig {
    source: WaterSource;
    village: VillageZone;
    flowCurve: FlowCurve;
    maxDuration: number;
    timeStep: number;
    gravity: number;
    maxParticles: number;
    bounds: { width: number; height: number };
}

/**
 * 构件碰撞交互结果
 */
export interface CollisionResult {
    velocity: Vector2;
    pressure: number;
}

/**
 * 构件交互解析器
 * 由 WaterInteraction / StoneWallInteraction / BambooCageInteraction 实现
 */
export type InteractionResolver = (
    particle: WaterParticle,
    block: PlacedBlock,
    configId: string,
) => CollisionResult | null;

/**
 * 水流模拟系统
 * 来源：PRD §6.5, ARCHITECTURE §5.1, §7.1, §7.2
 */
export class WaterSimulation {
    private config: WaterSimulationConfig;
    private pool: ObjectPool<WaterParticle>;
    private resolver: InteractionResolver;
    private blocks: PlacedBlock[] = [];

    private particles: WaterParticle[] = [];
    private elapsedTime = 0;
    private accumulator = 0;
    private spawnAccumulator = 0;
    private nextParticleId = 1;
    private villageHitCount = 0;
    private turbulenceIndex = 0;

    /** 预计算微小湍流表（禁用真随机） */
    private readonly turbulenceTable = [
        -0.02, 0.03, -0.01, 0.01, 0.02, -0.03, 0.01, -0.01,
        0.02, -0.02, 0.03, -0.01, 0.01, 0.02, -0.03, 0.01,
    ];

    constructor(
        config: WaterSimulationConfig,
        pool: ObjectPool<WaterParticle>,
        resolver: InteractionResolver = () => null,
    ) {
        this.config = config;
        this.pool = pool;
        this.resolver = resolver;
    }

    /**
     * 设置当前已放置构件
     */
    public setBlocks(blocks: PlacedBlock[]): void {
        this.blocks = blocks.filter((b) => b.state === 'active');
    }

    /**
     * 设置交互解析器
     */
    public setResolver(resolver: InteractionResolver): void {
        this.resolver = resolver;
    }

    /**
     * 推进模拟
     * @param deltaTime 渲染帧间隔（秒）
     */
    public step(deltaTime: number): void {
        this.accumulator += deltaTime;

        while (this.accumulator >= this.config.timeStep) {
            this.fixedStep(this.config.timeStep);
            this.accumulator -= this.config.timeStep;
        }
    }

    /**
     * 固定步长更新
     */
    private fixedStep(dt: number): void {
        if (this.elapsedTime >= this.config.maxDuration) {
            return;
        }

        this.spawnParticles(dt);
        this.updateParticles(dt);
        this.elapsedTime += dt;
    }

    /**
     * 根据流量曲线生成粒子
     */
    private spawnParticles(dt: number): void {
        const flow = this.getCurrentFlow();
        this.spawnAccumulator += flow * dt;
        const count = Math.floor(this.spawnAccumulator);
        this.spawnAccumulator -= count;

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.config.maxParticles) {
                break;
            }
            const p = this.pool.acquire();
            p.id = this.nextParticleId++;
            p.position = { ...this.config.source.position };
            p.velocity = this.getInitialVelocity();
            p.mass = 1;
            p.lifeTime = 0;
            p.isActive = true;
            this.particles.push(p);
        }
    }

    /**
     * 当前流量
     */
    private getCurrentFlow(): number {
        const t = this.elapsedTime;
        const { baseDuration, peakDuration, stableDuration } = this.config.flowCurve;
        const { baseFlow, peakFlow, stableFlow } = this.config.source;

        if (t < baseDuration) {
            return baseFlow;
        }
        if (t < baseDuration + peakDuration) {
            const ratio = (t - baseDuration) / peakDuration;
            return baseFlow + (peakFlow - baseFlow) * ratio;
        }
        if (t < baseDuration + peakDuration + stableDuration) {
            const ratio = (t - baseDuration - peakDuration) / stableDuration;
            return peakFlow + (stableFlow - peakFlow) * ratio;
        }
        return stableFlow;
    }

    /**
     * 初始速度：水平 80–110 px/s，禁用真随机
     */
    private getInitialVelocity(): Vector2 {
        const baseSpeed = 80 + (this.nextParticleId % 31); // 0–30 映射到 80–110
        const turbulence = this.turbulenceTable[this.turbulenceIndex % this.turbulenceTable.length];
        this.turbulenceIndex++;
        return {
            x: baseSpeed,
            y: turbulence * 10,
        };
    }

    /**
     * 更新所有粒子
     */
    private updateParticles(dt: number): void {
        const active: WaterParticle[] = [];

        for (const p of this.particles) {
            if (!p.isActive) {
                this.pool.release(p);
                continue;
            }

            this.updateParticle(p, dt);

            if (this.isInsideVillage(p.position)) {
                this.villageHitCount++;
            }

            if (this.isOutOfBounds(p.position)) {
                p.isActive = false;
                this.pool.release(p);
                continue;
            }

            active.push(p);
        }

        this.particles = active;
    }

    /**
     * 单粒子更新
     */
    private updateParticle(p: WaterParticle, dt: number): void {
        p.lifeTime += dt;

        // 重力下沉
        p.velocity.y -= this.config.gravity * dt;

        // 位置更新
        p.position.x += p.velocity.x * dt;
        p.position.y += p.velocity.y * dt;

        // 与构件碰撞
        for (const block of this.blocks) {
            if (this.intersectParticleBlock(p, block)) {
                const result = this.resolver(p, block, block.configId);
                if (result) {
                    p.velocity = result.velocity;
                    block.currentPressure += result.pressure;
                }
            }
        }

        // 截断小数位保证确定性
        p.position.x = this.truncate(p.position.x);
        p.position.y = this.truncate(p.position.y);
        p.velocity.x = this.truncate(p.velocity.x);
        p.velocity.y = this.truncate(p.velocity.y);
    }

    /**
     * 粒子与构件 AABB 碰撞
     */
    private intersectParticleBlock(p: WaterParticle, block: PlacedBlock): boolean {
        // 简化：粒子视为 0.1x0.1 的小方块
        const half = 0.05;
        const px = p.position.x;
        const py = p.position.y;

        // 构件包围盒（简化，未按旋转互换长宽，需 PlacementSystem 提供辅助）
        // 实际运行时由 PuzzleRuntime 提供 block bounding box 或交互系统处理
        return (
            px + half > block.position.x - 0.5 &&
            px - half < block.position.x + 0.5 &&
            py + half > block.position.y - 0.5 &&
            py - half < block.position.y + 0.5
        );
    }

    /**
     * 检查点是否在村庄受击区内
     */
    private isInsideVillage(pos: Vector2): boolean {
        const v = this.config.village;
        return (
            pos.x >= v.position.x &&
            pos.x <= v.position.x + v.size.width &&
            pos.y >= v.position.y &&
            pos.y <= v.position.y + v.size.height
        );
    }

    /**
     * 是否超出地形边界
     */
    private isOutOfBounds(pos: Vector2): boolean {
        return (
            pos.x < 0 ||
            pos.x > this.config.bounds.width ||
            pos.y < 0 ||
            pos.y > this.config.bounds.height
        );
    }

    /**
     * 截断到 4 位小数
     */
    private truncate(value: number): number {
        return Math.round(value * 10000) / 10000;
    }

    /**
     * 重置模拟
     */
    public reset(): void {
        for (const p of this.particles) {
            this.pool.release(p);
        }
        this.particles = [];
        this.elapsedTime = 0;
        this.accumulator = 0;
        this.spawnAccumulator = 0;
        this.villageHitCount = 0;
        this.nextParticleId = 1;
        this.turbulenceIndex = 0;
    }

    public getParticles(): readonly WaterParticle[] {
        return this.particles;
    }

    public getVillageHitCount(): number {
        return this.villageHitCount;
    }

    public getElapsedTime(): number {
        return this.elapsedTime;
    }
}

/**
 * 根据性能档位获取最大粒子数
 */
export function getMaxParticlesByTier(tier: PerformanceTier): number {
    switch (tier) {
        case 'high':
            return 600;
        case 'medium':
            return 400;
        case 'low':
        default:
            return 200;
    }
}
