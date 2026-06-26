/**
 * 存档数据最小接口
 * 完整定义见 data/GameSave.ts（Task 3.1）
 */
export interface IGameSave {
    version: string;
    updatedAt: number;
    [key: string]: unknown;
}

/**
 * 存储适配器抽象接口
 * 来源：ARCHITECTURE §5.1, §7.5
 * 业务逻辑必须通过此接口读写进度，禁止直接调用 localStorage / wx.*
 */
export interface StorageAdapter {
    /**
     * 读取存档；失败时返回 null，由调用方回退默认进度
     */
    load(): IGameSave | null;

    /**
     * 保存存档；失败时返回 false，不抛出异常
     */
    save(data: IGameSave): boolean;

    /**
     * 清除存档
     */
    clear(): boolean;
}

/**
 * 默认空存档
 */
export function createDefaultSave(): IGameSave {
    return {
        version: '0.1.0',
        updatedAt: Date.now(),
    };
}
