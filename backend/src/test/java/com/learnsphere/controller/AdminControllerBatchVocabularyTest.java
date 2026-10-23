package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.service.IAIGenerationService;
import com.learnsphere.service.IVocabularyService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminControllerBatchVocabularyTest {
    private IVocabularyService vocabularyService;
    private IAIGenerationService aiGenerationService;
    private AdminController controller;

    @BeforeEach
    void setUp() {
        vocabularyService = mock(IVocabularyService.class);
        aiGenerationService = mock(IAIGenerationService.class);
        controller = new AdminController();
        ReflectionTestUtils.setField(controller, "vocabularyService", vocabularyService);
        ReflectionTestUtils.setField(controller, "aiGenerationService", aiGenerationService);
    }

    @Test
    void failedAiResponseIsReportedWithoutUpdatingOrDeleting() {
        Vocabulary vocabulary = vocabulary(1L, "abandon");
        when(vocabularyService.list(any())).thenReturn(List.of(vocabulary));
        when(aiGenerationService.generateVocabularyDetails("abandon", null))
                .thenReturn(Map.of("word", "abandon", "translation", "解析失败，请检查网络"));

        Result<?> result = controller.batchGenerateVocabularyDetails(20);

        assertThat(result.getCode()).isEqualTo(200);
        assertThat(String.valueOf(result.getData())).contains("成功 0 条", "失败 1 条");
        verify(vocabularyService, never()).updateById(any());
        verify(vocabularyService, never()).remove(any());
    }

    @Test
    void validAiResponseUpdatesBeforeRemovingDuplicates() {
        Vocabulary vocabulary = vocabulary(2L, "adapt");
        when(vocabularyService.list(any())).thenReturn(List.of(vocabulary));
        when(vocabularyService.updateById(any())).thenReturn(true);
        when(aiGenerationService.generateVocabularyDetails("adapt", "cet4"))
                .thenReturn(Map.of(
                        "word", "adapt",
                        "phonetic", "/əˈdæpt/",
                        "translation", "适应；改编",
                        "definition", "to change something to suit a new purpose",
                        "example", "She quickly adapted to the new environment.",
                        "exampleTranslation", "她很快适应了新环境。"));

        Result<?> result = controller.batchGenerateVocabularyDetails(20);

        assertThat(result.getCode()).isEqualTo(200);
        assertThat(String.valueOf(result.getData())).contains("成功 1 条", "失败 0 条");
        assertThat(vocabulary.getPhonetic()).isEqualTo("/əˈdæpt/");
        assertThat(vocabulary.getExampleTranslation()).isEqualTo("她很快适应了新环境。");
        InOrder order = inOrder(vocabularyService);
        order.verify(vocabularyService).updateById(vocabulary);
        order.verify(vocabularyService).remove(any());
    }

    @Test
    void invalidLimitIsRejectedBeforeQuerying() {
        Result<?> result = controller.batchGenerateVocabularyDetails(21);

        assertThat(result.getCode()).isEqualTo(500);
        assertThat(result.getMessage()).contains("1 到 20");
        verifyNoInteractions(vocabularyService, aiGenerationService);
    }

    @Test
    void incompleteAiResponseIsNotPersisted() {
        Vocabulary vocabulary = vocabulary(3L, "benefit");
        when(vocabularyService.list(any())).thenReturn(List.of(vocabulary));
        when(aiGenerationService.generateVocabularyDetails("benefit", "cet6"))
                .thenReturn(Map.of("word", "benefit", "translation", "好处"));

        Result<?> result = controller.batchGenerateVocabularyDetails(1);

        assertThat(String.valueOf(result.getData())).contains("成功 0 条", "失败 1 条");
        verify(vocabularyService, never()).updateById(any());
        verify(vocabularyService, never()).remove(any());
    }

    @Test
    void successfulAiFillOnlyRemovesDuplicateFromSameExamType() {
        Vocabulary vocabulary = vocabulary(4L, "record");
        vocabulary.setExamType("ielts");
        when(vocabularyService.list(any())).thenReturn(List.of(vocabulary));
        when(vocabularyService.updateById(any())).thenReturn(true);
        when(aiGenerationService.generateVocabularyDetails("record", "ielts"))
                .thenReturn(Map.of(
                        "word", "record",
                        "phonetic", "/ˈrekɔːd/",
                        "translation", "记录",
                        "definition", "a written account",
                        "example", "Keep a record of your progress.",
                        "exampleTranslation", "记录你的进步。"));

        controller.batchGenerateVocabularyDetails(1);

        ArgumentCaptor<QueryWrapper<Vocabulary>> captor = ArgumentCaptor.forClass(QueryWrapper.class);
        verify(vocabularyService).remove(captor.capture());
        String sql = captor.getValue().getSqlSegment();
        assertThat(sql).contains("exam_type");
    }

    @Test
    void deduplicateGroupsByWordAndExamType() {
        when(vocabularyService.listMaps(any(QueryWrapper.class)))
                .thenReturn(List.of(Map.of("word", "record", "exam_type", "primary")));
        Vocabulary primary = vocabulary(10L, "record");
        primary.setExamType("primary");
        Vocabulary ielts = vocabulary(11L, "record");
        ielts.setExamType("ielts");
        when(vocabularyService.list(any(QueryWrapper.class))).thenReturn(new java.util.ArrayList<>(List.of(primary, ielts)));

        controller.deduplicateVocabulary();

        ArgumentCaptor<QueryWrapper<Vocabulary>> captor = ArgumentCaptor.forClass(QueryWrapper.class);
        verify(vocabularyService).listMaps(captor.capture());
        assertThat(captor.getValue().getSqlSelect()).contains("exam_type");
    }

    private static Vocabulary vocabulary(Long id, String word) {
        Vocabulary vocabulary = new Vocabulary();
        vocabulary.setId(id);
        vocabulary.setWord(word);
        vocabulary.setExamType(id == 2L ? "cet4" : id == 3L ? "cet6" : null);
        return vocabulary;
    }
}
