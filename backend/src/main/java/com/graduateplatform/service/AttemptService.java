package com.graduateplatform.service;

import com.graduateplatform.dto.request.SubmitAttemptRequest;
import com.graduateplatform.entity.Attempt;
import com.graduateplatform.entity.Question;
import com.graduateplatform.entity.User;
import com.graduateplatform.exception.BusinessException;
import com.graduateplatform.repository.AttemptRepository;
import com.graduateplatform.repository.QuestionRepository;
import com.graduateplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public AttemptService(AttemptRepository attemptRepository, QuestionRepository questionRepository, UserRepository userRepository) {
        this.attemptRepository = attemptRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> submit(Long questionId, SubmitAttemptRequest req) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new BusinessException("题目不存在"));

        User user = userRepository.findById(req.getUserId())
            .orElseThrow(() -> new BusinessException("用户不存在"));

        boolean correct = question.getAnswer().equals(req.getAnswer().trim().toUpperCase());

        Attempt attempt = Attempt.builder()
            .user(user)
            .question(question)
            .answer(req.getAnswer())
            .correct(correct)
            .build();

        attempt = attemptRepository.save(attempt);

        Map<String, Object> result = new HashMap<>();
        result.put("id", attempt.getId());
        result.put("correct", attempt.getCorrect());
        result.put("answer", attempt.getAnswer());
        result.put("createdAt", attempt.getCreatedAt().toString());
        return result;
    }

    public List<Map<String, Object>> getAttempts(Long userId) {
        return attemptRepository.findByUserId(userId).stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("questionId", a.getQuestion().getId());
            map.put("answer", a.getAnswer());
            map.put("correct", a.getCorrect());
            map.put("createdAt", a.getCreatedAt().toString());
            return map;
        }).toList();
    }
}
