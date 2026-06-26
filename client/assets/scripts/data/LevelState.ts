/**
 * 关卡进度状态
 * 来源：ARCHITECTURE §4.4
 */
export interface LevelState {
    levelId: string;
    status: 'locked' | 'unlocked' | 'cleared';
    attempts: number;
    bestMoneyUsed?: number;
    isFrugal?: boolean;
    lastPlayedAt?: number;
}
