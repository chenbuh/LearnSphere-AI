package com.learnsphere.payment;

import com.learnsphere.service.ISystemConfigService;
import org.jasypt.encryption.StringEncryptor;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * 支付相关测试的共用构造辅助。
 *
 * <p>{@link EpayConfigService} 的配置来源是「数据库优先、配置文件兜底」。
 * 单元测试不连数据库，因此这里造一个「数据库里什么都查不到」的实现，
 * 让 {@code resolve()} 全部回退到传入的 {@link EpayProperties}，
 * 从而保持测试仍然只依赖显式构造的配置对象。
 */
final class EpayTestSupport {

    private EpayTestSupport() {
    }

    /**
     * 造一个不查数据库的 {@link EpayConfigService}：所有键都返回 null，走 props 兜底。
     */
    static EpayConfigService configServiceWithDefaults(EpayProperties props) {
        ISystemConfigService store = mock(ISystemConfigService.class);
        when(store.getConfigValue(anyString(), org.mockito.ArgumentMatchers.any())).thenReturn(null);

        StringEncryptor encryptor = mock(StringEncryptor.class);
        when(encryptor.decrypt(anyString())).thenAnswer(inv -> inv.getArgument(0));
        when(encryptor.encrypt(anyString())).thenAnswer(inv -> inv.getArgument(0));

        return new EpayConfigService(store, encryptor, props);
    }
}
