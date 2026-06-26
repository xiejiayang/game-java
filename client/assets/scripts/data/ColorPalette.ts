/**
 * DESIGN.md 色彩系统映射表
 * 来源：DESIGN §2.1
 * 所有 UI 颜色必须从此表读取，禁止直接使用未定义颜色。
 */
export const ColorPalette = {
    /** 主墨色：标题文字、主按钮背景、重要边框 */
    INK_BLACK: '#1a1a1a',

    /** 深灰墨：正文、二级按钮边框、弹窗边框 */
    INK_DARK: '#2d2d2d',

    /** 中灰：次要说明文字、状态描述 */
    INK_GRAY: '#5a5a5a',

    /** 浅灰：禁用态、占位文字 */
    INK_LIGHT: '#8a8a8a',

    /** 宣纸白：页面背景、弹窗底色、按钮底色 */
    PAPER: '#f5f0e8',

    /** 陈年纸：进度条底色、金钱条底色、加载背景 */
    PAPER_DARK: '#e8e0d4',

    /** 赭石：卷轴轴杆、选中高亮、预览解锁状态 */
    OCHRE: '#c4a77d',

    /** 淡青绿：编辑中状态、节俭成功、已通关标记 */
    GREEN_PALE: '#a8c5b5',

    /** 朱砂：失败状态、删除区、印章、村庄受击 */
    RED_INK: '#8b3a3a',

    /** 水色：放水按钮、河流背景 */
    WATER: '#3a4a5a',

    /** 浅水色：河流渐变、水源标识 */
    WATER_LIGHT: '#5a7a8a',

    /** 投影：按钮、弹窗、关卡节点阴影 */
    SHADOW: 'rgba(0,0,0,0.15)',
} as const;

export type ColorName = keyof typeof ColorPalette;

/**
 * 将十六进制颜色转换为 Cocos Creator 可用的 cc.Color 构造参数。
 * 注意：本函数返回 { r, g, b, a } 对象，业务层按需使用。
 */
export function parseHexColor(hex: string): { r: number; g: number; b: number; a: number } {
    if (hex.startsWith('rgba')) {
        const match = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(hex);
        if (!match) {
            throw new Error(`Unsupported rgba format: ${hex}`);
        }
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
            a: parseFloat(match[4]) * 255,
        };
    }

    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) {
        throw new Error(`Unsupported hex color: ${hex}`);
    }

    return {
        r: parseInt(normalized.substring(0, 2), 16),
        g: parseInt(normalized.substring(2, 4), 16),
        b: parseInt(normalized.substring(4, 6), 16),
        a: 255,
    };
}
