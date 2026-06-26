import { createDefaultSave, IGameSave, StorageAdapter } from './StorageAdapter';

/**
 * H5 本地存储实现
 * 基于 localStorage，读写失败时回退默认进度。
 * 来源：PRD §3.1, ARCHITECTURE §5.1
 */
export class H5Storage implements StorageAdapter {
    private readonly key: string;

    constructor(key = 'dujiangyan_game_save') {
        this.key = key;
    }

    public load(): IGameSave | null {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw) {
                return null;
            }
            const parsed = JSON.parse(raw) as IGameSave;
            return parsed;
        } catch (err) {
            console.warn('[H5Storage] load failed, fallback to default:', err);
            return createDefaultSave();
        }
    }

    public save(data: IGameSave): boolean {
        try {
            const payload = JSON.stringify({ ...data, updatedAt: Date.now() });
            localStorage.setItem(this.key, payload);
            return true;
        } catch (err) {
            console.warn('[H5Storage] save failed:', err);
            return false;
        }
    }

    public clear(): boolean {
        try {
            localStorage.removeItem(this.key);
            return true;
        } catch (err) {
            console.warn('[H5Storage] clear failed:', err);
            return false;
        }
    }
}

export const h5Storage = new H5Storage();
