package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.exception.QuotaExceededException;
import com.learnsphere.service.IAIGenerationService;
import com.learnsphere.service.IUserLogService;
import com.learnsphere.service.IUserService;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AIGenerationControllerFallbackTest {

    @Test
    void generateListening_returnsLocalFallback_whenQuotaExceeded() {
        IAIGenerationService aiGenerationService = mock(IAIGenerationService.class);
        IUserLogService userLogService = mock(IUserLogService.class);
        IUserService userService = mock(IUserService.class);
        AIGenerationController controller = new AIGenerationController(aiGenerationService, userLogService, userService);

        AIGenerationController.GenerateListeningRequest request = new AIGenerationController.GenerateListeningRequest();
        request.setType("conversation");
        request.setDifficulty("easy");
        request.setCount(2);

        when(aiGenerationService.generateListening("conversation", "easy", 2))
                .thenThrow(new QuotaExceededException("quota exceeded"));

        Map<String, Object> localFallback = new HashMap<>();
        localFallback.put("content", "local-listening");
        when(aiGenerationService.generateFromLocal(eq("listening"), anyMap())).thenReturn(localFallback);

        Result<Map<String, Object>> result = controller.generateListening(request);

        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertSame(localFallback, result.getData());
        assertEquals("local", result.getData().get("_from"));

        verify(aiGenerationService).generateFromLocal(eq("listening"), anyMap());
    }

    @Test
    void generateGrammar_returnsLocalFallback_whenQuotaExceeded() {
        IAIGenerationService aiGenerationService = mock(IAIGenerationService.class);
        IUserLogService userLogService = mock(IUserLogService.class);
        IUserService userService = mock(IUserService.class);
        AIGenerationController controller = new AIGenerationController(aiGenerationService, userLogService, userService);

        AIGenerationController.GenerateGrammarRequest request = new AIGenerationController.GenerateGrammarRequest();
        request.setTopic("tense");
        request.setDifficulty("medium");

        when(aiGenerationService.generateGrammar("tense", "medium"))
                .thenThrow(new QuotaExceededException("quota exceeded"));

        Map<String, Object> localFallback = new HashMap<>();
        localFallback.put("content", "local-grammar");
        when(aiGenerationService.generateFromLocal(eq("grammar"), anyMap())).thenReturn(localFallback);

        Result<Map<String, Object>> result = controller.generateGrammar(request);

        assertNotNull(result);
        assertEquals(200, result.getCode());
        assertSame(localFallback, result.getData());
        assertEquals("local", result.getData().get("_from"));

        verify(aiGenerationService).generateFromLocal(eq("grammar"), anyMap());
    }
}
