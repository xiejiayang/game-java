import { BuildingBlockConfig } from '../data/BuildingBlockConfig';
import { LevelConfig } from '../data/LevelConfig';
import { ApiClient, ApiResult } from './ApiClient';

/**
 * 关卡配置 API
 * 来源：ARCHITECTURE §5.2.1
 */
export class LevelConfigApi {
    constructor(private readonly client: ApiClient) {}

    public async getLevels(): Promise<LevelConfig[] | null> {
        const result = await this.client.get<LevelConfig[]>('/api/v1/levels');
        return this.unwrap(result);
    }

    public async getLevel(levelId: string): Promise<LevelConfig | null> {
        const result = await this.client.get<LevelConfig>(`/api/v1/levels/${levelId}`);
        return this.unwrap(result);
    }

    public async getBlocks(): Promise<BuildingBlockConfig[] | null> {
        const result = await this.client.get<BuildingBlockConfig[]>('/api/v1/blocks');
        return this.unwrap(result);
    }

    private unwrap<T>(result: ApiResult<T> | null): T | null {
        if (!result || result.code !== 200) {
            return null;
        }
        return result.data;
    }
}

export const levelConfigApi = new LevelConfigApi(new ApiClient());
