import { Logger } from '../../core/Logger';

/**
 * 叙事弹窗
 * 来源：PRD §4, §5.2
 */
export class NarrativeOverlay {
    private readonly logger = new Logger('NarrativeOverlay');

    public show(title: string, content: string, onClose?: () => void): void {
        this.logger.info(`Narrative: ${title} - ${content}`);
        // TODO: 实例化 ScrollModal.prefab，显示叙事文案
        onClose?.();
    }
}
