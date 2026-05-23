package com.graduateplatform.admin.service;

import com.graduateplatform.common.exception.BusinessException;
import com.graduateplatform.questionbank.entity.Question;
import com.graduateplatform.questionbank.entity.QuestionBank;
import com.graduateplatform.questionbank.repository.QuestionBankRepository;
import com.graduateplatform.questionbank.repository.QuestionRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminQuestionBankService {

    private final QuestionBankRepository bankRepository;
    private final QuestionRepository questionRepository;

    public AdminQuestionBankService(QuestionBankRepository bankRepository,
                                    QuestionRepository questionRepository) {
        this.bankRepository = bankRepository;
        this.questionRepository = questionRepository;
    }

    // ==================== 题库管理 ====================

    @Transactional(readOnly = true)
    public Map<String, Object> getBanks(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<QuestionBank> bankPage = bankRepository.findAll(pageable);

        List<Map<String, Object>> content = bankPage.getContent().stream().map(bank -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", bank.getId());
            m.put("name", bank.getName());
            m.put("target", bank.getTarget());
            m.put("subject", bank.getSubject());
            m.put("difficulty", bank.getDifficulty());
            m.put("description", bank.getDescription());
            long questionCount = bank.getQuestions().stream().filter(q -> Boolean.TRUE.equals(q.getActive())).count();
            m.put("questionCount", questionCount);
            return m;
        }).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("totalPages", bankPage.getTotalPages());
        result.put("totalElements", bankPage.getTotalElements());
        return result;
    }

    @Transactional
    @CacheEvict(value = "questionBank:options", allEntries = true)
    public Map<String, Object> createBank(Map<String, Object> body) {
        String name = (String) body.get("name");
        if (name == null || name.isBlank()) {
            throw new BusinessException("题库名称不能为空");
        }

        QuestionBank bank = QuestionBank.builder()
            .name(name.trim())
            .target(nullable(body.get("target")))
            .subject(nullable(body.get("subject")))
            .difficulty(nullable(body.get("difficulty")))
            .description(nullable(body.get("description")))
            .build();

        bank = bankRepository.save(bank);
        return bankToMap(bank);
    }

    @Transactional
    @CacheEvict(value = "questionBank:options", allEntries = true)
    public Map<String, Object> updateBank(Long id, Map<String, Object> body) {
        QuestionBank bank = bankRepository.findById(id)
            .orElseThrow(() -> new BusinessException("题库不存在"));

        if (body.containsKey("name")) {
            String name = (String) body.get("name");
            if (name == null || name.isBlank()) {
                throw new BusinessException("题库名称不能为空");
            }
            bank.setName(name.trim());
        }
        if (body.containsKey("target")) bank.setTarget(nullable(body.get("target")));
        if (body.containsKey("subject")) bank.setSubject(nullable(body.get("subject")));
        if (body.containsKey("difficulty")) bank.setDifficulty(nullable(body.get("difficulty")));
        if (body.containsKey("description")) bank.setDescription(nullable(body.get("description")));

        bankRepository.save(bank);
        return bankToMap(bank);
    }

    @Transactional
    @CacheEvict(value = "questionBank:options", allEntries = true)
    public void deleteBank(Long id) {
        QuestionBank bank = bankRepository.findById(id)
            .orElseThrow(() -> new BusinessException("题库不存在"));

        // Soft-delete all questions first, then remove the bank
        bank.getQuestions().forEach(q -> {
            q.setActive(false);
            q.setStatus("disabled");
        });
        bankRepository.delete(bank);
    }

    // ==================== 题目管理 ====================

    @Transactional(readOnly = true)
    public Map<String, Object> getQuestions(Long bankId, int page, int size) {
        if (!bankRepository.existsById(bankId)) {
            throw new BusinessException("题库不存在");
        }

        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<Question> questionPage = questionRepository.findByBankId(bankId, pageable);

        List<Map<String, Object>> content = questionPage.getContent().stream().map(this::questionToMap).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("totalPages", questionPage.getTotalPages());
        result.put("totalElements", questionPage.getTotalElements());
        return result;
    }

    @Transactional
    @CacheEvict(value = "questionBank:options", allEntries = true)
    public Map<String, Object> createQuestion(Long bankId, Map<String, Object> body) {
        QuestionBank bank = bankRepository.findById(bankId)
            .orElseThrow(() -> new BusinessException("题库不存在"));

        String stem = (String) body.get("stem");
        if (stem == null || stem.isBlank()) {
            throw new BusinessException("题干不能为空");
        }
        String answer = (String) body.get("answer");
        if (answer == null || answer.isBlank()) {
            throw new BusinessException("答案不能为空");
        }

        Question question = Question.builder()
            .bank(bank)
            .stem(stem.trim())
            .optionsJson(nullable(body.get("optionsJson")))
            .answer(answer.trim())
            .analysis(nullable(body.get("analysis")))
            .chapter(nullable(body.get("chapter")))
            .questionType(nullable(body.get("questionType")))
            .knowledgePoint(nullable(body.get("knowledgePoint")))
            .difficulty(nullable(body.get("difficulty")))
            .year(body.get("year") != null ? ((Number) body.get("year")).intValue() : null)
            .status("published")
            .active(true)
            .versionNo(1)
            .build();

        question = questionRepository.save(question);
        return questionToMap(question);
    }

    @Transactional
    @CacheEvict(value = "questionBank:options", allEntries = true)
    public Map<String, Object> updateQuestion(Long id, Map<String, Object> body) {
        Question question = questionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("题目不存在"));

        if (body.containsKey("stem")) {
            String stem = (String) body.get("stem");
            if (stem == null || stem.isBlank()) {
                throw new BusinessException("题干不能为空");
            }
            question.setStem(stem.trim());
        }
        if (body.containsKey("optionsJson")) question.setOptionsJson(nullable(body.get("optionsJson")));
        if (body.containsKey("answer")) {
            String answer = (String) body.get("answer");
            if (answer == null || answer.isBlank()) {
                throw new BusinessException("答案不能为空");
            }
            question.setAnswer(answer.trim());
        }
        if (body.containsKey("analysis")) question.setAnalysis(nullable(body.get("analysis")));
        if (body.containsKey("chapter")) question.setChapter(nullable(body.get("chapter")));
        if (body.containsKey("questionType")) question.setQuestionType(nullable(body.get("questionType")));
        if (body.containsKey("knowledgePoint")) question.setKnowledgePoint(nullable(body.get("knowledgePoint")));
        if (body.containsKey("difficulty")) question.setDifficulty(nullable(body.get("difficulty")));
        if (body.containsKey("year")) question.setYear(((Number) body.get("year")).intValue());
        if (body.containsKey("status")) question.setStatus(nullable(body.get("status")));

        // Bump version number
        question.setVersionNo(question.getVersionNo() == null ? 1 : question.getVersionNo() + 1);

        questionRepository.save(question);
        return questionToMap(question);
    }

    @Transactional
    @CacheEvict(value = "questionBank:options", allEntries = true)
    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
            .orElseThrow(() -> new BusinessException("题目不存在"));
        question.setActive(false);
        question.setStatus("disabled");
        questionRepository.save(question);
    }

    // ==================== 辅助 ====================

    private Map<String, Object> bankToMap(QuestionBank bank) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", bank.getId());
        m.put("name", bank.getName());
        m.put("target", bank.getTarget());
        m.put("subject", bank.getSubject());
        m.put("difficulty", bank.getDifficulty());
        m.put("description", bank.getDescription());
        return m;
    }

    private Map<String, Object> questionToMap(Question q) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", q.getId());
        m.put("stem", q.getStem());
        m.put("optionsJson", q.getOptionsJson());
        m.put("answer", q.getAnswer());
        m.put("analysis", q.getAnalysis());
        m.put("chapter", q.getChapter());
        m.put("questionType", q.getQuestionType());
        m.put("knowledgePoint", q.getKnowledgePoint());
        m.put("difficulty", q.getDifficulty());
        m.put("year", q.getYear());
        m.put("status", q.getStatus());
        m.put("active", q.getActive());
        m.put("versionNo", q.getVersionNo());
        m.put("bankId", q.getBank() != null ? q.getBank().getId() : null);
        return m;
    }

    private String nullable(Object value) {
        if (value == null || (value instanceof String s && s.isBlank())) {
            return null;
        }
        return value.toString().trim();
    }
}
