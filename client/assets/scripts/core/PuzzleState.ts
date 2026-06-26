/**
 * 单局解谜状态枚举
 * 来源：PRD §5.3, ARCHITECTURE §4.5
 * 所有状态变更必须经过 StateMachine，禁止直接修改。
 */
export enum PuzzleState {
    /** 编辑阶段：可放置、旋转、删除、撤销、重置 */
    Editing = 'editing',

    /** 模拟阶段：锁定编辑，水流模拟运行中 */
    Simulating = 'simulating',

    /** 结算阶段：模拟结束，展示结果 */
    Settling = 'settling',

    /** 暂停：从 Simulating 进入，可恢复 */
    Paused = 'paused',
}
