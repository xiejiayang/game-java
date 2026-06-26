import { _decorator, Component } from 'cc';
import { Logger } from '../../core/Logger';

const { ccclass } = _decorator;

/**
 * TitleScene 控制器
 * 来源：PRD §4, DESIGN §5.2
 */
@ccclass('TitleSceneCtrl')
export class TitleSceneCtrl extends Component {
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
