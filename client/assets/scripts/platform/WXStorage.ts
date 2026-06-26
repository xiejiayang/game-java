import { createDefaultSave, IGameSave, StorageAdapter } from './StorageAdapter';

/**
 * 微信小游戏存储最小类型声明
 */
declare const wx: {
    getStorageSync<T>(key: string): T | undefined;
    setStorageSync(key: string, data: unknown): void;
    removeStorageSync(key: string): void;
} | undefined;

/**
 * 微信平台检测
 */
export function isWechatPlatform(): boolean {
    return typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function';
}

/**
 * 微信小游戏存储实现
 * 仅在 platform === wechat 时启用。
 * 来源：ARCHITECTURE §2.1, §5.1
 */
export class WXStorage implements StorageAdapter {
    private readonly key: string;

    constructor(key = 'dujiangyan_game_save') {
        this.key = key;
    }

    public load(): IGameSave | null {
        if (!isWechatPlatform()) {
            return createDefaultSave();
        }
        try {
            const data = wx!.getStorageSync<IGameSave>(this.key);
            return data ?? createDefaultSave();
        } catch (err) {
            console.warn('[WXStorage] load failed, fallback to default:', err);
            return createDefaultSave();
        }
    }

    public save(data: IGameSave): boolean {
        if (!isWechatPlatform()) {
            return false;
        }
        try {
            wx!.setStorageSync(this.key, { ...data, updatedAt: Date.now() });
            return true;
        } catch (err) {
            console.warn('[WXStorage] save failed:', err);
            return false;
        }
    }

    public clear(): boolean {
        if (!isWechatPlatform()) {
            return false;
        }
        try {
            wx!.removeStorageSync(this.key);
            return true;
        } catch (err) {
            console.warn('[WXStorage] clear failed:', err);
            return false;
        }
    }
}

export const wxStorage = new WXStorage();
