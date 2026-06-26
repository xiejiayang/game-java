import { PuzzleState } from './PuzzleState';

/**
 * 状态转换定义
 */
export interface StateTransition<TState extends string | number | symbol> {
    from: TState;
    to: TState;
}

/**
 * 状态机配置
 */
export interface StateMachineConfig<TState extends string | number | symbol> {
    initial: TState;
    transitions: StateTransition<TState>[];
}

/**
 * 状态生命周期回调
 */
export interface StateMachineCallbacks<TState extends string | number | symbol> {
    onEnter?: (state: TState, prev: TState | null) => void;
    onExit?: (state: TState, next: TState) => void;
    onChange?: (from: TState | null, to: TState) => void;
}

/**
 * 泛型状态机
 * 来源：ARCHITECTURE §3.1, §7.5
 * 驱动 PuzzleRuntime.state 切换，禁止业务代码直接修改状态字段。
 */
export class StateMachine<TState extends string | number | symbol> {
    private current: TState;
    private transitions = new Map<TState, Set<TState>>();
    private callbacks: StateMachineCallbacks<TState> = {};
    private changing = false;

    constructor(config: StateMachineConfig<TState>, callbacks: StateMachineCallbacks<TState> = {}) {
        this.current = config.initial;
        this.callbacks = callbacks;
        for (const t of config.transitions) {
            if (!this.transitions.has(t.from)) {
                this.transitions.set(t.from, new Set());
            }
            this.transitions.get(t.from)!.add(t.to);
        }
    }

    public get state(): TState {
        return this.current;
    }

    /**
     * 判断是否允许从当前状态转换到目标状态
     */
    public canTransition(to: TState): boolean {
        if (to === this.current) {
            return false;
        }
        const allowed = this.transitions.get(this.current);
        return allowed ? allowed.has(to) : false;
    }

    /**
     * 执行状态转换
     * @returns 是否转换成功
     */
    public transition(to: TState): boolean {
        if (this.changing) {
            console.warn('[StateMachine] recursive transition rejected');
            return false;
        }

        if (!this.canTransition(to)) {
            console.warn(`[StateMachine] invalid transition: ${String(this.current)} -> ${String(to)}`);
            return false;
        }

        this.changing = true;
        const from = this.current;

        try {
            this.callbacks.onExit?.(from, to);
            this.current = to;
            this.callbacks.onEnter?.(to, from);
            this.callbacks.onChange?.(from, to);
        } finally {
            this.changing = false;
        }

        return true;
    }

    /**
     * 强制设置状态（仅用于初始化或极端恢复场景，业务代码禁止调用）
     */
    public reset(to: TState): void {
        this.current = to;
    }
}

/**
 * 创建解谜专用状态机
 * 合法转换：
 * Editing → Simulating
 * Simulating → Settling
 * Settling → Editing
 * Simulating ↔ Paused
 */
export function createPuzzleStateMachine(callbacks: StateMachineCallbacks<PuzzleState> = {}): StateMachine<PuzzleState> {
    return new StateMachine<PuzzleState>({
        initial: PuzzleState.Editing,
        transitions: [
            { from: PuzzleState.Editing, to: PuzzleState.Simulating },
            { from: PuzzleState.Simulating, to: PuzzleState.Settling },
            { from: PuzzleState.Settling, to: PuzzleState.Editing },
            { from: PuzzleState.Simulating, to: PuzzleState.Paused },
            { from: PuzzleState.Paused, to: PuzzleState.Simulating },
        ],
    }, callbacks);
}
