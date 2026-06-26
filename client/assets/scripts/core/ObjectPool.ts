/**
 * 对象池接口
 * 来源：ARCHITECTURE §3.1, §7.2
 * 针对 WaterParticle 等高频创建/销毁对象进行复用。
 */
export interface PooledObject {
    reset(): void;
}

export interface ObjectPoolConfig<T> {
    /** 池容量上限 */
    capacity: number;
    /** 创建新对象的工厂函数 */
    factory: () => T;
    /** 重置对象状态的回调 */
    reset: (obj: T) => void;
}

/**
 * 泛型对象池
 */
export class ObjectPool<T> {
    private available: T[] = [];
    private inUse = new Set<T>();
    private capacity: number;
    private factory: () => T;
    private reset: (obj: T) => void;

    constructor(config: ObjectPoolConfig<T>) {
        this.capacity = Math.max(1, config.capacity);
        this.factory = config.factory;
        this.reset = config.reset;

        for (let i = 0; i < this.capacity; i++) {
            this.available.push(this.factory());
        }
    }

    /**
     * 从池中获取对象；若池耗尽则创建新对象（可能临时超出容量）
     */
    public acquire(): T {
        let obj: T;
        if (this.available.length > 0) {
            obj = this.available.pop()!;
        } else {
            obj = this.factory();
        }
        this.reset(obj);
        this.inUse.add(obj);
        return obj;
    }

    /**
     * 回收对象到池中
     */
    public release(obj: T): void {
        if (!this.inUse.has(obj)) {
            return;
        }
        this.inUse.delete(obj);
        this.reset(obj);
        if (this.available.length < this.capacity) {
            this.available.push(obj);
        }
    }

    /**
     * 释放所有在用对象
     */
    public releaseAll(): void {
        for (const obj of Array.from(this.inUse)) {
            this.release(obj);
        }
    }

    /**
     * 当前可用对象数
     */
    public get availableCount(): number {
        return this.available.length;
    }

    /**
     * 当前在用对象数
     */
    public get inUseCount(): number {
        return this.inUse.size;
    }

    /**
     * 池总容量
     */
    public get maxCapacity(): number {
        return this.capacity;
    }
}
