package com.graduateplatform.service;

import com.graduateplatform.entity.QuestionBank;
import com.graduateplatform.repository.QuestionBankRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QuestionBankService {

    private final QuestionBankRepository repository;

    public QuestionBankService(QuestionBankRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> getBanks(String target) {
        List<QuestionBank> banks;
        if (target != null && !target.isEmpty()) {
            banks = repository.findByTarget(target);
        } else {
            banks = repository.findAll();
        }
        return banks.stream().map(this::toMap).toList();
    }

    private Map<String, Object> toMap(QuestionBank bank) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", bank.getId());
        map.put("name", bank.getName());
        map.put("target", bank.getTarget());
        map.put("subject", bank.getSubject());
        map.put("description", bank.getDescription());
        map.put("difficulty", bank.getDifficulty());
        map.put("chapterCount", 1); // simplified
        map.put("questionCount", bank.getQuestions() != null ? bank.getQuestions().size() : 0);
        map.put("supportedModes", List.of("chapter", "random", "mock"));
        return map;
    }
}
