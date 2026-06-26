import { Logger } from '../core/Logger';

/**
 * 金钱钱包
 * 来源：PRD §3.1, §5.2, ARCHITECTURE §5.1
 */
export class MoneyWallet {
    private readonly logger = new Logger('MoneyWallet');
    private max: number;
    private current: number;
    private consumed: number;

    constructor(max: number) {
        this.max = max;
        this.current = max;
        this.consumed = 0;
    }

    public get balance(): number {
        return this.current;
    }

    public get maxMoney(): number {
        return this.max;
    }

    public get consumedMoney(): number {
        return this.consumed;
    }

    /**
     * 放置构件扣费
     * @returns 是否扣费成功
     */
    public place(cost: number): boolean {
        if (cost <= 0) {
            return true;
        }
        if (this.current < cost) {
            this.logger.warn('Money insufficient');
            return false;
        }
        this.current -= cost;
        this.consumed += cost;
        return true;
    }

    /**
     * 删除构件全额返还
     */
    public remove(cost: number): void {
        if (cost <= 0) {
            return;
        }
        this.current += cost;
        this.consumed -= cost;
        if (this.consumed < 0) {
            this.consumed = 0;
        }
        if (this.current > this.max) {
            this.current = this.max;
        }
    }

    /**
     * 是否满足节俭条件
     */
    public isFrugal(threshold: number): boolean {
        return this.consumed <= threshold;
    }

    /**
     * 重置为初始上限
     */
    public reset(max?: number): void {
        if (max !== undefined) {
            this.max = max;
        }
        this.current = this.max;
        this.consumed = 0;
    }
}
