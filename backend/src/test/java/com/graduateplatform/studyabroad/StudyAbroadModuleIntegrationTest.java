package com.graduateplatform.studyabroad;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graduateplatform.common.entity.User;
import com.graduateplatform.common.repository.UserRepository;
import com.graduateplatform.common.security.JwtTokenProvider;
import com.graduateplatform.init.DataInitializer;
import com.graduateplatform.studyabroad.repository.StudyAbroadApplicationRepository;
import com.graduateplatform.studyabroad.repository.StudyAbroadExperienceRepository;
import com.graduateplatform.studyabroad.repository.StudyAbroadMaterialRepository;
import com.graduateplatform.studyabroad.repository.StudyAbroadTimelineRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudyAbroadModuleIntegrationTest {
    @MockBean DataInitializer dataInitializer;

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtTokenProvider tokenProvider;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired UserRepository userRepository;
    @Autowired StudyAbroadApplicationRepository applicationRepository;
    @Autowired StudyAbroadTimelineRepository timelineRepository;
    @Autowired StudyAbroadMaterialRepository materialRepository;
    @Autowired StudyAbroadExperienceRepository experienceRepository;

    private String userToken;
    private String otherToken;

    @BeforeEach
    void setUp() {
        experienceRepository.deleteAll();
        materialRepository.deleteAll();
        timelineRepository.deleteAll();
        applicationRepository.deleteAll();

        String suffix = String.valueOf(System.nanoTime());
        User user = userRepository.save(User.builder()
            .name("Study Abroad User").email("liuxue" + suffix + "@test.local")
            .password(passwordEncoder.encode("pw")).target("liuxue").role("user").status("normal").build());
        User other = userRepository.save(User.builder()
            .name("Other Study Abroad User").email("liuxue-other" + suffix + "@test.local")
            .password(passwordEncoder.encode("pw")).target("liuxue").role("user").status("normal").build());
        userToken = tokenProvider.generateToken(user.getId(), "user");
        otherToken = tokenProvider.generateToken(other.getId(), "user");
    }

    @Test
    void applicationTimelineAndMaterialRoundTripWithOwnershipChecks() throws Exception {
        String applicationResponse = mockMvc.perform(post("/api/studyabroad/applications")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "country", "UK",
                    "school", "University College London",
                    "program", "Computer Science MSc",
                    "degree", "Master",
                    "intake", "2027 Fall",
                    "applicationRound", "Round 1",
                    "deadline", "2026-10-15",
                    "status", "preparing",
                    "priority", "dream",
                    "note", "Prepare application package"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.school").value("University College London"))
            .andReturn().getResponse().getContentAsString();
        long applicationId = objectMapper.readTree(applicationResponse).path("data").path("id").asLong();

        String timelineResponse = mockMvc.perform(post("/api/studyabroad/timeline")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "applicationId", applicationId,
                    "title", "Submit online application",
                    "country", "UK",
                    "school", "University College London",
                    "phase", "Submission",
                    "dueDate", "2026-10-10",
                    "status", "todo",
                    "note", "Upload final documents"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.applicationSchool").value("University College London"))
            .andReturn().getResponse().getContentAsString();
        long timelineId = objectMapper.readTree(timelineResponse).path("data").path("id").asLong();

        mockMvc.perform(post("/api/studyabroad/materials")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "applicationId", applicationId,
                    "title", "Personal Statement",
                    "country", "UK",
                    "stage", "Documents",
                    "category", "Writing",
                    "deadline", "2026-08-10",
                    "completed", false,
                    "note", "Second draft"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.applicationProgram").value("Computer Science MSc"));

        mockMvc.perform(get("/api/studyabroad/timeline").header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].applicationId").value(applicationId));

        mockMvc.perform(put("/api/studyabroad/timeline/" + timelineId)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "title", "Other update",
                    "country", "UK",
                    "school", "University College London",
                    "phase", "Submission",
                    "dueDate", "2026-10-11",
                    "status", "doing",
                    "note", "Should fail"
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void experienceCreateSearchAndOwnershipDeleteFlow() throws Exception {
        String createResponse = mockMvc.perform(post("/api/studyabroad/experiences")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "title", "UK PS writing notes",
                    "country", "UK",
                    "topic", "Writing",
                    "authorName", "Study Abroad User",
                    "readTime", "6 min",
                    "summary", "Connect course fit with project experience.",
                    "content", "A clear PS should explain program fit, project evidence, and future plan.",
                    "tags", "PS,course fit,documents"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.tags[0]").value("PS"))
            .andReturn().getResponse().getContentAsString();
        long experienceId = objectMapper.readTree(createResponse).path("data").path("id").asLong();

        mockMvc.perform(get("/api/studyabroad/experiences")
                .header("Authorization", "Bearer " + userToken)
                .param("country", "UK")
                .param("topic", "Writing")
                .param("keyword", "PS"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].title").value("UK PS writing notes"));

        mockMvc.perform(delete("/api/studyabroad/experiences/" + experienceId)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(delete("/api/studyabroad/experiences/" + experienceId)
                .header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk());
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }
}
