const STATIC_SALT = "LrnSphere2026";

/**
 * 获取动态密钥 (必须与后端 getDynamicKey 逻辑一致)
 */
const getDynamicKey = () => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const rawKey = STATIC_SALT + date;
    return new TextEncoder().encode(rawKey);
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

        // 2. XOR 解密
        const keyBytes = getDynamicKey();
        const result = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            result[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
        }

        // 3. 转换为 UTF-8 字符串
        const decoded = new TextDecoder('utf-8').decode(result);

        // 4. 验证解密结果是否包含有效字符
        // 如果解密后包含不可打印字符或过多的控制字符，可能解密失败
        const hasInvalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(decoded);
        if (hasInvalidChars) {
            throw new Error('Decrypted content contains invalid characters');
        }

        return decoded;
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
