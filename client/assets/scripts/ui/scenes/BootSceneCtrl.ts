import { Logger } from '../../core/Logger';

/**
 * BootScene 控制器
 * 来源：PRD §4, DESIGN §5.1
 */
export class BootSceneCtrl {
    private readonly logger = new Logger('BootSceneCtrl');

    public onLoad(): void {
        this.logger.info('BootScene onLoad');
    }

    public start(): void {
        this.logger.info('BootScene start: 资源预加载、静默登录');
        // TODO: 预加载资源、生成游客身份、跳转 TitleScene
    }

    public updateProgress(progress: number, label: string): void {
        this.logger.info(`Loading progress: ${progress}% - ${label}`);
    }
}
