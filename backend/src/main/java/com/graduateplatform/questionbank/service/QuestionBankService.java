package com.graduateplatform.questionbank.service;

import com.graduateplatform.questionbank.entity.QuestionBank;
import com.graduateplatform.questionbank.repository.QuestionBankRepository;
import com.graduateplatform.questionbank.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class QuestionBankService {

    private final QuestionBankRepository repository;
    private final QuestionRepository questionRepository;

    public QuestionBankService(QuestionBankRepository repository, QuestionRepository questionRepository) {
        this.repository = repository;
        this.questionRepository = questionRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBanks(String target, String subject, String chapter,
                                              String questionType, String difficulty, Integer year) {
        List<QuestionBank> banks;
        String normalizedTarget = normalize(target);
        if (normalizedTarget != null) {
            banks = repository.findByTarget(normalizedTarget);
        } else {
            banks = repository.findAll();
        }
        String normalizedSubject = normalize(subject);
        String normalizedDifficulty = normalize(difficulty);
        String normalizedChapter = normalize(chapter);
        String normalizedQuestionType = normalize(questionType);
        return banks.stream()
            .filter(bank -> normalizedSubject == null || normalizedSubject.equals(bank.getSubject()))
            .filter(bank -> normalizedDifficulty == null || normalizedDifficulty.equals(bank.getDifficulty()))
            .map(bank -> toMap(bank, normalizedChapter, normalizedQuestionType, normalizedDifficulty, year))
            .filter(map -> (Integer) map.get("questionCount") > 0)
            .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOptions() {
        Map<String, Object> options = new LinkedHashMap<>();
        options.put("targets", repository.findDistinctTargets());
        options.put("subjects", repository.findDistinctSubjects());
        options.put("chapters", questionRepository.findDistinctChapters());
        options.put("questionTypes", questionRepository.findDistinctQuestionTypes());
        options.put("difficulties", repository.findDistinctDifficulties());
        options.put("years", questionRepository.findDistinctYears());
        return options;
    }

    private Map<String, Object> toMap(QuestionBank bank, String chapter, String questionType,
                                      String difficulty, Integer year) {
        var questions = questionRepository.findPracticeCandidates(
            bank.getId(), chapter, questionType, difficulty, year
        );
        Map<String, Object> map = new HashMap<>();
        map.put("id", bank.getId());
        map.put("name", bank.getName());
        map.put("target", bank.getTarget());
        map.put("subject", bank.getSubject());
        map.put("description", bank.getDescription());
        map.put("difficulty", bank.getDifficulty());
        map.put("chapterCount", questions.stream().map(q -> q.getChapter()).filter(Objects::nonNull).distinct().count());
        map.put("questionCount", questions.size());
        map.put("supportedModes", List.of("chapter", "random", "mock"));
        return map;
    }

    private String normalize(String value) {
        if (value == null || value.isBlank() || "all".equals(value)) {
            return null;
        }
        return value.trim();
    }
}
