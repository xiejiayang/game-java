/**
 * 日志等级
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

/**
 * 带等级开关的日志工具
 * 生产环境默认关闭 DEBUG 日志。
 * 来源：ARCHITECTURE §3.1
 */
export class Logger {
    private static globalLevel: LogLevel = LogLevel.DEBUG;
    private static production = false;

    public static setGlobalLevel(level: LogLevel): void {
        Logger.globalLevel = level;
    }

    public static setProduction(value: boolean): void {
        Logger.production = value;
    }

    public static getGlobalLevel(): LogLevel {
        return Logger.globalLevel;
    }

    constructor(private readonly tag: string) {}

    public debug(...args: unknown[]): void {
        this.log(LogLevel.DEBUG, console.debug, 'DEBUG', args);
    }

    public info(...args: unknown[]): void {
        this.log(LogLevel.INFO, console.info, 'INFO', args);
    }

    public warn(...args: unknown[]): void {
        this.log(LogLevel.WARN, console.warn, 'WARN', args);
    }

    public error(...args: unknown[]): void {
        this.log(LogLevel.ERROR, console.error, 'ERROR', args);
    }

    private log(
        level: LogLevel,
        fn: (...data: unknown[]) => void,
        label: string,
        args: unknown[],
    ): void {
        if (level < Logger.globalLevel) {
            return;
        }
        if (Logger.production && level <= LogLevel.DEBUG) {
            return;
        }
        fn(`[${label}][${this.tag}]`, ...args);
    }
}

export const logger = new Logger('Game');
