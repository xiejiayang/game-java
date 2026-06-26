import { Logger } from '../../core/Logger';

/**
 * 老河工提示弹窗
 * 来源：PRD §3.1, §5.2, ARCHITECTURE §8.1
 */
export class HintOverlay {
    private readonly logger = new Logger('HintOverlay');

    public show(text: string, _highlightAreas?: unknown[]): void {
        this.logger.info(`Hint: ${text}`);
        // TODO: 实例化 ScrollModal.prefab，高亮关键区域
    }
}
