package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.GrammarExercise;
import com.learnsphere.mapper.GrammarExerciseMapper;
import com.learnsphere.service.IGrammarExerciseService;
import org.springframework.stereotype.Service;

@Service
public class GrammarExerciseServiceImpl extends ServiceImpl<GrammarExerciseMapper, GrammarExercise>
        implements IGrammarExerciseService {
}
