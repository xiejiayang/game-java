/**
 * 关卡配置类型
 * 来源：ARCHITECTURE §4.1
 */
export interface Vector2 {
    x: number;
    y: number;
}

export interface TerrainConfig {
    bounds: { width: number; height: number };
    riverPath: unknown; // BezierPath | Polygon，具体运行时按配置解析
    gridSize: number;
    obstacles: unknown[];
}

export interface WaterSourceConfig {
    position: Vector2;
    baseFlow: number;
    peakFlow: number;
    stableFlow: number;
    spawnInterval: number;
}

export interface VillageConfig {
    position: Vector2;
    size: { width: number; height: number };
    hitThreshold: number;
}

export interface FlowCurveConfig {
    baseDuration: number;
    peakDuration: number;
    stableDuration: number;
}

export interface WinConditionConfig {
    villageNotFlooded: boolean;
}

export interface FailConditionConfig {
    villageFlooded: boolean;
    wallCollapsedCausedFlood: boolean;
}

export interface HighlightArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface HintConfig {
    triggerAttempts: number;
    text: string;
    highlightAreas: HighlightArea[];
}

export interface LevelConfig {
    id: string;
    name: string;
    description: string;
    narrative: {
        enter: string;
        success: string;
        fail: string;
    };
    terrain: TerrainConfig;
    waterSource: WaterSourceConfig;
    village: VillageConfig;
    inventory: Record<string, number>;
    money: {
        max: number;
        frugalThreshold: number;
        placementCost: Record<string, number>;
    };
    simulation: {
        maxDuration: number;
        timeStep: number;
        flowCurve: FlowCurveConfig;
    };
    winCondition: WinConditionConfig;
    failCondition: FailConditionConfig;
    hint: HintConfig;
}
