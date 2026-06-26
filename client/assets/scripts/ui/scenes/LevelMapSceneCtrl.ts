import { _decorator, Component } from 'cc';
import { Logger } from '../../core/Logger';
import { Toast } from '../components/Toast';

const { ccclass } = _decorator;

/**
 * LevelMapScene 控制器
 * 来源：PRD §4, DESIGN §5.3
 */
@ccclass('LevelMapSceneCtrl')
export class LevelMapSceneCtrl extends Component {
    private readonly logger = new Logger('LevelMapSceneCtrl');

    public onLoad(): void {
        this.logger.info('LevelMapScene onLoad');
    }

    public onLevelClick(levelId: string, status: 'locked' | 'unlocked' | 'cleared' | 'preview'): void {
        if (status === 'locked') {
            Toast.show('关卡未解锁');
            return;
        }
        if (levelId === 'L002' && status === 'preview') {
            Toast.show('开发中，敬请期待');
            return;
        }
        this.logger.info(`进入关卡 ${levelId}`);
        // TODO: 跳转 GameScene
    }

    public onBack(): void {
        this.logger.info('返回标题');
        // TODO: 跳转 TitleScene
    }
}
