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

    try {
        // 1. Base64 解码
        const binaryString = window.atob(encodedData);
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
        return new TextDecoder().decode(result);
    } catch (e) {
        // 如果解密失败，可能是因为不是加密格式，或者是历史数据
        console.warn("Decrypt failed or plain text", e.message);
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
            'translation', 'example', 'exampleTranslation', 'definition'
        ];

        // 递归处理子属性
        Object.keys(decrypted).forEach(key => {
            const value = decrypted[key];

            if (sensitiveFields.includes(key) && typeof value === 'string' && value.length > 4) {
                decrypted[key] = decryptContent(value);
            } else if (value && typeof value === 'object') {
                decrypted[key] = decryptPayload(value);
            }
        });

        return decrypted;
    }

    return payload;
};
