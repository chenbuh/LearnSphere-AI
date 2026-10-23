const STATIC_SALT = "LrnSphere2026";

/**
 * 获取本地日期字符串 YYYY-MM-DD
 *
 * 注意：不能用 toISOString()。它返回的是 UTC 日期，而后端用的是
 * java.time.LocalDate.now()（服务器本地时区）。在 UTC+8 的 00:00~08:00 之间，
 * UTC 日期比本地日期早一天，导致密钥最后一位不同（'8' vs '7'），
 * 解密出来的文本会出现 n->a、?->/、?->0 这类字符损坏。
 */
const getLocalDateString = (offsetDays = 0) => {
    const now = new Date();
    if (offsetDays) {
        now.setDate(now.getDate() + offsetDays);
    }
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * 服务端在响应里回传的密钥日期（Result.keyDate / payload._keyDate）。
 *
 * 这是最可靠的来源：后端用它加密，前端就用它解密，
 * 中间不存在"今天到底是几号"的歧义。
 */
let serverKeyDate = null;

/** 记录服务端下发的密钥日期；传 null/非法值则清除 */
export const setServerKeyDate = (date) => {
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        serverKeyDate = date;
    } else if (date === null || date === undefined) {
        serverKeyDate = null;
    }
};

/** 读取当前生效的密钥日期（优先服务端下发的） */
export const getServerKeyDate = () => serverKeyDate;

/**
 * 获取动态密钥 (必须与后端 getDynamicKey 逻辑一致)
 *
 * 有服务端下发的日期时优先用它，这样即使浏览器与服务器时区不同，
 * 也一定和加密端对齐。
 */
const getDynamicKey = (offsetDays = 0) => {
    const base = serverKeyDate || getLocalDateString();
    if (offsetDays && serverKeyDate) {
        // 在服务端日期上做偏移
        const d = new Date(`${serverKeyDate}T00:00:00`);
        d.setDate(d.getDate() + offsetDays);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return new TextEncoder().encode(`${STATIC_SALT}${year}-${month}-${day}`);
    }
    const rawKey = STATIC_SALT + (offsetDays ? getLocalDateString(offsetDays) : base);
    return new TextEncoder().encode(rawKey);
};

/**
 * 密钥候选：当天、昨天、明天。
 *
 * 只要服务端和浏览器对"今天"的判断差一天（时区不同、跨零点、容器 UTC 等），
 * 单一密钥就会解出"看着像英文、其实有字符被改掉"的乱码，
 * 例如 insist on -> insist oa、空格 -> /、? -> 0。
 * 这类结果不会触发控制字符检查，所以需要额外判据兜底。
 */
const KEY_OFFSETS = [0, -1, 1];

/**
 * 统计解密结果里的"破损痕迹"。数值越小越可信，0 表示没有可疑之处。
 *
 * 注意这里只统计**几乎不可能出现在正常例句里**的形态，
 * 不用通用语言模型打分：否则 "and/or"、"he/she" 这类正常写法会被误判，
 * 反而把正确的当天密钥结果挤掉。当天密钥在打平时始终优先。
 */
const countArtifacts = (text) => {
    if (!text) return Number.MAX_SAFE_INTEGER;
    let bad = 0;

    // UTF-8 解码失败留下的替换符
    bad += (text.match(/\uFFFD/g) || []).length * 10;
    // 控制字符
    bad += (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length * 10;

    // 字母数字直接黏连（"there0"）：正常英文例句里极少见
    bad += (text.match(/[a-zA-Z]\d/g) || []).length;
    // 字母紧贴斜杠（"Who/the"）：排除 and/or、he/she、m/s 这类约定写法
    const slash = (text.match(/[a-zA-Z]\/[a-zA-Z]/g) || []).length;
    bad += Math.max(0, slash - 1);
    // 词中间出现感叹号/尖括号等（"Who!the"、"there>"）
    bad += (text.match(/[a-zA-Z][!<>~^`|]/g) || []).length;

    return bad;
};

/**
 * 用单个密钥做 XOR 解密
 */
const xorDecode = (bytes, offsetDays) => {
    const keyBytes = getDynamicKey(offsetDays);
    const result = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        result[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return new TextDecoder('utf-8').decode(result);
};

/**
 * 解密 XOR + Base64 字符串
 */
export const decryptContent = (encodedData) => {
    if (!encodedData || typeof encodedData !== 'string') return encodedData;

    // 检查是否是 Base64 格式 (简单检查)
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(encodedData) || encodedData.length < 4) {
        // 不是有效的 Base64 格式，直接返回原文
        return encodedData;
    }

    try {
        // 1. Base64 解码 - 使用更安全的方法处理 UTF-8
        const binaryString = atob(encodedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 2. 先用当天密钥解，只有当结果带有明显破损痕迹时，
        //    才尝试昨天/明天的密钥。这样正常情况下行为与旧版一致，
        //    不会因为启发式误判而改变正确结果。
        let best = xorDecode(bytes, 0);
        let bestBad = countArtifacts(best);

        if (bestBad > 0) {
            for (const offset of KEY_OFFSETS) {
                if (offset === 0) continue;
                const decoded = xorDecode(bytes, offset);
                const bad = countArtifacts(decoded);
                // 严格小于才替换：打平时保留当天密钥的结果
                if (bad < bestBad) {
                    bestBad = bad;
                    best = decoded;
                }
            }
        }

        // 3. 所有密钥都解出不可打印字符：说明这不是加密串，按原文返回
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(best)) {
            return encodedData;
        }

        return best;
    } catch (e) {
        // 如果解密失败，可能是因为不是加密格式，或者是历史数据
        // 静默返回原文，不打印错误
        return encodedData;
    }
};

/**
 * 自动递归处理对象或数组中的加密字段
 */
export const decryptPayload = (payload) => {
    if (!payload) return payload;

    // 处理数组
    if (Array.isArray(payload)) {
        return payload.map(item => decryptPayload(item));
    }

    // 处理对象
    if (typeof payload === 'object') {
        // 先取服务端下发的密钥日期（Result.keyDate 或 payload._keyDate），
        // 让本次解密用与加密端一致的密钥
        if (typeof payload.keyDate === 'string' || typeof payload._keyDate === 'string') {
            setServerKeyDate(payload.keyDate || payload._keyDate);
        }

        const decrypted = { ...payload };
        const sensitiveFields = [
            'content', 'passage', 'analysis', 'suggestions', 'tips', 'hint',
            'explanation', 'feedback', 'script', 'transcript', 'transcription',
            'translation', 'example', 'exampleTranslation', 'definition',
            'meaning', 'cn' // meaning: translation 字段映射名; cn: examples 数组内中文翻译
        ];

        // 递归处理子属性
        Object.keys(decrypted).forEach(key => {
            const value = decrypted[key];

            // 只对可能是加密数据的字段进行解密
            // 加密数据通常是 Base64 格式，长度较长，且不包含中文字符
            if (sensitiveFields.includes(key) &&
                typeof value === 'string' &&
                value.length > 8 &&  // 降低门槛：短加密串也需要解密（如 'q8zkc5fT0JXbuA==' 仅16字符）
                !/[\u4e00-\u9fa5]/.test(value)) { // 不包含中文
                decrypted[key] = decryptContent(value);
            } else if (value && typeof value === 'object') {
                decrypted[key] = decryptPayload(value);
            }
        });

        return decrypted;
    }

    return payload;
};
