/**
 * 激励视频广告接口抽象
 * MVP 内仅留空函数与触发点注释，不接入真实广告。
 * 来源：PRD §3.1, DESIGN §9.1
 */
export interface AdAdapter {
    /**
     * 预加载激励视频广告
     */
    preload(): void;

    /**
     * 播放激励视频广告，成功播放后 resolve(true)
     */
    showRewardedAd(): Promise<boolean>;

    /**
     * 当前是否可播放广告
     */
    isReady(): boolean;
}

/**
 * MVP 空实现
 * 触发点：提示按钮点击时调用 showRewardedAd()，此处仅返回成功占位。
 */
export class EmptyAdAdapter implements AdAdapter {
    public preload(): void {
        // TODO: 接入平台广告 SDK 时实现
    }

    public async showRewardedAd(): Promise<boolean> {
        // TODO: 接入平台广告 SDK 时实现真实播放
        // 触发点：玩家点击「看广告得提示」按钮
        console.log('[EmptyAdAdapter] rewarded ad placeholder');
        return true;
    }

    public isReady(): boolean {
        // TODO: 接入平台广告 SDK 时返回真实就绪状态
        return true;
    }
}

export const adAdapter = new EmptyAdAdapter();
