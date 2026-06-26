/**
 * 用户资料
 * 来源：ARCHITECTURE §4.4
 */
export interface UserProfile {
    userId: string;
    nickname?: string;
    avatar?: string;
    platform: 'h5' | 'wechat';
    createdAt: number;
    lastLoginAt: number;
}
