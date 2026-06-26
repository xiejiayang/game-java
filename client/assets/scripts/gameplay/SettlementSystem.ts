import { LevelConfig } from '../data/LevelConfig';
import { LevelState } from '../data/LevelState';
import { GameSave } from '../data/GameSave';
import { MoneyWallet } from './MoneyWallet';
import { ProgressApi, UserProgressDTO } from '../network/ProgressApi';
import { Logger } from '../core/Logger';

/**
 * 结算结果
 */
export interface SettlementResult {
    success: boolean;
    reason: 'villageSafe' | 'villageFlooded' | 'wallCollapsedCausedFlood';
    consumedMoney: number;
    isFrugal: boolean;
    attempts: number;
    unlockedL2Preview: boolean;
}

/**
 * 结算输入
 */
export interface SettlementInput {
    villageHitCount: number;
    villageHitThreshold: number;
    wallCollapsed: boolean;
    maxDurationReached: boolean;
}

/**
 * 结算系统
 * 来源：PRD §5.2, §6.6, ARCHITECTURE §5.1, §5.3
 */
export class SettlementSystem {
    private readonly logger = new Logger('SettlementSystem');

    /**
     * 执行结算
     */
    public settle(
        input: SettlementInput,
        levelConfig: LevelConfig,
        wallet: MoneyWallet,
        levelState: LevelState,
    ): SettlementResult {
        const isFlooded = input.villageHitCount >= input.villageHitThreshold;
        const wallCausedFlood = isFlooded && input.wallCollapsed;

        let reason: SettlementResult['reason'];
        let success: boolean;

        if (wallCausedFlood) {
            reason = 'wallCollapsedCausedFlood';
            success = false;
        } else if (isFlooded) {
            reason = 'villageFlooded';
            success = false;
        } else {
            reason = 'villageSafe';
            success = true;
        }

        const isFrugal = wallet.isFrugal(levelConfig.money.frugalThreshold);

        levelState.attempts += 1;
        levelState.lastPlayedAt = Date.now();

        if (success) {
            levelState.status = 'cleared';
            if (levelState.bestMoneyUsed === undefined || wallet.consumedMoney < levelState.bestMoneyUsed) {
                levelState.bestMoneyUsed = wallet.consumedMoney;
            }
            levelState.isFrugal = isFrugal;
        }

        // L2 预览解锁：L1 通关后解锁，或失败 1-2 次后也解锁预览（根据产品设计）
        const unlockedL2Preview = levelConfig.id === 'L001' && (success || levelState.attempts >= 1);

        return {
            success,
            reason,
            consumedMoney: wallet.consumedMoney,
            isFrugal,
            attempts: levelState.attempts,
            unlockedL2Preview,
        };
    }

    /**
     * 异步上报进度
     * 失败不影响本地结果。
     */
    public async reportProgress(
        userId: string,
        save: GameSave,
        progressApi: ProgressApi,
    ): Promise<UserProgressDTO | null> {
        try {
            const result = await progressApi.saveProgress(userId, save);
            this.logger.info('Progress reported');
            return result;
        } catch (err) {
            this.logger.warn('Progress report failed:', err);
            return null;
        }
    }
}

export const settlementSystem = new SettlementSystem();
