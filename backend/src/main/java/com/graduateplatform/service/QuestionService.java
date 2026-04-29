package com.graduateplatform.service;

import com.graduateplatform.entity.Question;
import com.graduateplatform.exception.BusinessException;
import com.graduateplatform.repository.QuestionBankRepository;
import com.graduateplatform.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionBankRepository bankRepository;

    public QuestionService(QuestionRepository questionRepository, QuestionBankRepository bankRepository) {
        this.questionRepository = questionRepository;
        this.bankRepository = bankRepository;
    }

    public List<Map<String, Object>> getQuestions(Long bankId) {
        bankRepository.findById(bankId)
            .orElseThrow(() -> new BusinessException("题库不存在"));
        return questionRepository.findByBankId(bankId).stream().map(this::toMap).toList();
    }

    private Map<String, Object> toMap(Question q) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", q.getId());
        map.put("stem", q.getStem());
        map.put("options", q.getOptionsJson());
        map.put("answer", q.getAnswer());
        map.put("analysis", q.getAnalysis());
        map.put("chapter", q.getChapter());
        map.put("difficulty", q.getDifficulty());
        return map;
    }
}
