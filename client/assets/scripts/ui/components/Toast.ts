import { eventBus } from '../../core/EventBus';
import { Logger } from '../../core/Logger';

/**
 * Toast 消息事件名
 */
export const TOAST_EVENT = 'ui:toast';

/**
 * Toast 消息数据
 */
export interface ToastMessage {
    message: string;
    duration?: number;
}

/**
 * Toast 轻量提示服务
 * 实际 UI 预制体在 5.1 实现；此处仅提供触发接口。
 * 来源：DESIGN §4.11, §7.2
 */
export class Toast {
    private static logger = new Logger('Toast');

    /**
     * 显示 Toast，默认停留 2 秒
     */
    public static show(message: string, duration = 2000): void {
        this.logger.info(`Toast: ${message}`);
        eventBus.emit<ToastMessage>(TOAST_EVENT, { message, duration });
    }
}
