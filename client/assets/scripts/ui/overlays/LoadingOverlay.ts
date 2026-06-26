import { Logger } from '../../core/Logger';

/**
 * 加载中弹窗
 * 来源：PRD §4, DESIGN §7.1
 */
export class LoadingOverlay {
    private readonly logger = new Logger('LoadingOverlay');

    public show(message = '引水入渠中…'): void {
        this.logger.info(`Loading: ${message}`);
        // TODO: 实例化加载弹窗，显示脉冲水滴图标
    }

    public hide(): void {
        this.logger.info('LoadingOverlay hide');
    }
}
