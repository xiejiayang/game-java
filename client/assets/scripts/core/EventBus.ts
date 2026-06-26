/**
 * 类型安全的事件发布/订阅总线
 * 来源：ARCHITECTURE §3.1
 */
export type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus {
    private handlers = new Map<string, Set<EventHandler<unknown>>>();

    /**
     * 订阅事件
     * @param event 事件名
     * @param handler 处理函数
     * @returns 取消订阅函数
     */
    public on<T>(event: string, handler: EventHandler<T>): () => void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        const set = this.handlers.get(event)!;
        const wrapped = handler as EventHandler<unknown>;
        set.add(wrapped);

        return () => {
            set.delete(wrapped);
            if (set.size === 0) {
                this.handlers.delete(event);
            }
        };
    }

    /**
     * 订阅一次性事件
     */
    public once<T>(event: string, handler: EventHandler<T>): void {
        const off = this.on<T>(event, (payload: T) => {
            off();
            handler(payload);
        });
    }

    /**
     * 发布事件
     */
    public emit<T>(event: string, payload: T): void {
        const set = this.handlers.get(event);
        if (!set) {
            return;
        }
        // 复制集合避免在回调中取消订阅导致迭代异常
        const handlers = Array.from(set);
        for (const handler of handlers) {
            try {
                handler(payload);
            } catch (err) {
                // 事件总线不阻塞后续监听器
                console.error(`[EventBus] handler for "${event}" threw:`, err);
            }
        }
    }

    /**
     * 移除指定事件的所有监听
     */
    public off(event: string): void {
        this.handlers.delete(event);
    }

    /**
     * 清空所有监听
     */
    public clear(): void {
        this.handlers.clear();
    }

    /**
     * 获取指定事件的监听器数量（用于测试与调试）
     */
    public listenerCount(event: string): number {
        return this.handlers.get(event)?.size ?? 0;
    }
}

/** 全局事件总线实例 */
export const eventBus = new EventBus();
