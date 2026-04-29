package com.graduateplatform.service;

import com.graduateplatform.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationCodeService {

    private static final Logger log = LoggerFactory.getLogger(VerificationCodeService.class);
    private static final long TTL_MS = 5 * 60 * 1000;
    private final Map<String, CodeEntry> store = new ConcurrentHashMap<>();
    private final Random random = new Random();
    private final JavaMailSender mailSender;
    private final String mailFrom;

    public VerificationCodeService(JavaMailSender mailSender,
                                   @Value("${spring.mail.username}") String mailFrom) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
    }

    public void sendCode(String target, String type) {
        String code = String.format("%06d", random.nextInt(1000000));
        store.put(key(target, type), new CodeEntry(code, System.currentTimeMillis()));

        if ("email".equals(type)) {
            sendEmail(target, code);
        } else {
            log.info("========================================");
            log.info("验证码: {}  目标: {}  类型: {}", code, target, type);
            log.info("========================================");
        }
    }

    private void sendEmail(String to, String code) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(to);
            msg.setSubject("毕业去向导航与交流平台 - 验证码");
            msg.setText(String.format(
                "您好！\n\n您的验证码是：%s\n有效期 5 分钟，请勿泄露给他人。\n\n如非本人操作，请忽略此邮件。\n\n毕业去向导航与交流平台",
                code
            ));
            mailSender.send(msg);
            log.info("验证码已发送至邮箱: {}", to);
        } catch (Exception e) {
            log.error("邮件发送失败: {}", e.getMessage());
            throw new BusinessException("邮件发送失败，请稍后重试");
        }
    }

    public boolean validate(String target, String type, String inputCode) {
        CodeEntry entry = store.get(key(target, type));
        if (entry == null) return false;
        if (System.currentTimeMillis() - entry.timestamp > TTL_MS) {
            store.remove(key(target, type));
            return false;
        }
        return entry.code.equals(inputCode);
    }

    public void verifyAndConsume(String target, String type, String inputCode) {
        if (inputCode == null || inputCode.isBlank()) {
            throw new BusinessException("请输入验证码");
        }
        if (!validate(target, type, inputCode)) {
            throw new BusinessException("验证码错误或已过期，请重新获取");
        }
        store.remove(key(target, type));
    }

    private String key(String target, String type) {
        return type + ":" + target;
    }

    private record CodeEntry(String code, long timestamp) {}
}
