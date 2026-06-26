import { Logger } from '../core/Logger';

/**
 * 服务端统一响应格式
 * 来源：ARCHITECTURE §5.2.3
 */
export interface ApiResult<T> {
    code: number;
    message: string;
    data: T;
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
}

/**
 * 统一 HTTP 请求封装
 * 来源：ARCHITECTURE §5.1, §5.4
 * 网络失败时不阻塞本地游戏，异步重试。
 */
export class ApiClient {
    private readonly baseUrl: string;
    private readonly logger = new Logger('ApiClient');

    constructor(baseUrl = '') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }

    public async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T> | null> {
        const method = options.method ?? 'GET';
        const timeout = options.timeout ?? 10000;
        const retries = options.retries ?? 1;
        const url = `${this.baseUrl}${path}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const body = options.body ? JSON.stringify(options.body) : undefined;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    method,
                    headers,
                    body,
                    signal: controller.signal,
                });
                clearTimeout(timer);

                if (!response.ok) {
                    this.logger.warn(`HTTP ${response.status} for ${method} ${url}`);
                    if (attempt === retries) {
                        return null;
                    }
                    continue;
                }

                const json = (await response.json()) as ApiResult<T>;
                return json;
            } catch (err) {
                this.logger.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}):`, err);
                if (attempt === retries) {
                    return null;
                }
                await this.delay(500 * (attempt + 1));
            }
        }

        return null;
    }

    public async get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResult<T> | null> {
        return this.request<T>(path, { ...options, method: 'GET' });
    }

    public async post<T>(path: string, body: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResult<T> | null> {
        return this.request<T>(path, { ...options, method: 'POST', body });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const apiClient = new ApiClient();
