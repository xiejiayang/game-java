import { Logger } from '../../core/Logger';
import { GameSettings } from '../../data/GameSettings';
import { h5Storage } from '../../platform/H5Storage';

/**
 * 设置弹窗
 * 来源：PRD §4, DESIGN §7.2
 */
export class SettingsOverlay {
    private readonly logger = new Logger('SettingsOverlay');

    public show(settings: GameSettings, _onChange?: (s: GameSettings) => void): void {
        this.logger.info('Settings:', settings);
        // TODO: 实例化 ScrollModal.prefab，显示音效/音乐/语言/清除存档
    }

    public clearSave(): void {
        if (typeof confirm !== 'undefined' && confirm('确定要清除所有存档吗？')) {
            h5Storage.clear();
            this.logger.info('Save cleared');
        }
    }
}
