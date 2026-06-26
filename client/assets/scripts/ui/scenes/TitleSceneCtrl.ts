import { Logger } from '../../core/Logger';

/**
 * TitleScene 控制器
 * 来源：PRD §4, DESIGN §5.2
 */
export class TitleSceneCtrl {
    private readonly logger = new Logger('TitleSceneCtrl');

    public onLoad(): void {
        this.logger.info('TitleScene onLoad');
    }

    public onStartGame(): void {
        this.logger.info('开始治水');
        // TODO: 跳转 LevelMapScene
    }

    public onSettings(): void {
        this.logger.info('打开设置');
        // TODO: 打开 SettingsOverlay
    }
}
