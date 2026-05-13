package com.graduateplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GraduatePlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(GraduatePlatformApplication.class, args);
    }
}
