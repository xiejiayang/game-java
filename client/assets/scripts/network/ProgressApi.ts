import { GameSave } from '../data/GameSave';
import { ApiClient, ApiResult } from './ApiClient';

/**
 * 用户进度 DTO（客户端视角）
 */
export interface UserProgressDTO {
    userId: string;
    levelStates: unknown[];
    updatedAt: number;
}

/**
 * 用户进度 API
 * 来源：ARCHITECTURE §5.2.2
 */
export class ProgressApi {
    constructor(private readonly client: ApiClient) {}

    public async getProgress(userId: string): Promise<UserProgressDTO | null> {
        const result = await this.client.get<UserProgressDTO>(`/api/v1/users/${userId}/progress`);
        return this.unwrap(result);
    }

    public async saveProgress(userId: string, save: GameSave): Promise<UserProgressDTO | null> {
        const result = await this.client.post<UserProgressDTO>(`/api/v1/users/${userId}/progress`, save);
        return this.unwrap(result);
    }

    private unwrap<T>(result: ApiResult<T> | null): T | null {
        if (!result || result.code !== 200) {
            return null;
        }
        return result.data;
    }
}

export const progressApi = new ProgressApi(new ApiClient());
