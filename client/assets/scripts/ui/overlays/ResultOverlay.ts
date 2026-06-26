import { Logger } from '../../core/Logger';
import { SettlementResult } from '../../gameplay/SettlementSystem';

/**
 * 结算弹窗
 * 来源：PRD §4, §5.2
 */
export class ResultOverlay {
    private readonly logger = new Logger('ResultOverlay');

    public show(result: SettlementResult, _onRetry?: () => void, _onBack?: () => void): void {
        this.logger.info('Result:', result);
        // TODO: 实例化 ScrollModal.prefab，显示结算信息
        _onRetry?.();
    }

    public hide(): void {
        this.logger.info('ResultOverlay hide');
    }
}
