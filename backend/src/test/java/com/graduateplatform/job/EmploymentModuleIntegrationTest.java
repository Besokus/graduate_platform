package com.graduateplatform.job;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graduateplatform.common.entity.User;
import com.graduateplatform.common.repository.UserRepository;
import com.graduateplatform.common.security.JwtTokenProvider;
import com.graduateplatform.job.entity.CareerFair;
import com.graduateplatform.job.entity.JobPosting;
import com.graduateplatform.job.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmploymentModuleIntegrationTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtTokenProvider tokenProvider;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired UserRepository userRepository;
    @Autowired CareerFairRepository fairRepository;
    @Autowired JobPostingRepository jobRepository;
    @Autowired ResumeProfileRepository resumeRepository;
    @Autowired ApplicationRecordRepository applicationRepository;
    @Autowired JobSubscriptionPreferenceRepository preferenceRepository;
    @Autowired EmploymentNotificationRepository notificationRepository;

    private User admin;
    private User user;
    private User otherUser;
    private String adminToken;
    private String userToken;
    private String otherToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        applicationRepository.deleteAll();
        resumeRepository.deleteAll();
        preferenceRepository.deleteAll();
        fairRepository.deleteAll();
        jobRepository.deleteAll();

        String suffix = String.valueOf(System.nanoTime());
        admin = userRepository.save(User.builder()
            .name("Test Admin").email("admin" + suffix + "@test.local")
            .password(passwordEncoder.encode("pw")).target("job").role("admin").status("normal").build());
        user = userRepository.save(User.builder()
            .name("Job User").email("job" + suffix + "@test.local")
            .password(passwordEncoder.encode("pw")).target("job").role("user").status("normal")
            .major("Computer Science").build());
        otherUser = userRepository.save(User.builder()
            .name("Other User").email("other" + suffix + "@test.local")
            .password(passwordEncoder.encode("pw")).target("job").role("user").status("normal")
            .major("Finance").build());
        adminToken = tokenProvider.generateToken(admin.getId(), "admin");
        userToken = tokenProvider.generateToken(user.getId(), "user");
        otherToken = tokenProvider.generateToken(otherUser.getId(), "user");
    }

    @Test
    void adminEmploymentEndpointsAreNotPublicAndRejectNormalUsers() throws Exception {
        mockMvc.perform(get("/api/admin/employment/fairs"))
            .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/employment/fairs").header("Authorization", "Bearer " + userToken))
            .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/employment/fairs").header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void privateEmploymentGetsRequireAuthenticationButPublicBrowseWorks() throws Exception {
        fairRepository.save(CareerFair.builder()
            .title("Public Fair").companyName("Public Company").city("Shanghai").industry("Internet")
            .startTime(LocalDateTime.now().plusDays(1)).active(true).build());
        jobRepository.save(JobPosting.builder()
            .title("Public Job").companyName("Public Company").city("Shanghai").industry("Internet")
            .roleType("Backend").majorKeywords("Computer Science").skillTags("Java").active(true).build());

        mockMvc.perform(get("/api/job/fairs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].title").value("Public Fair"));
        mockMvc.perform(get("/api/job/postings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].title").value("Public Job"));
        mockMvc.perform(get("/api/job/resume")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/job/applications")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/job/recommendations")).andExpect(status().isForbidden());
    }

    @Test
    void resumeUpsertAndApplicationOwnershipRoundTrip() throws Exception {
        mockMvc.perform(put("/api/job/resume")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("templateType", "Tech", "skills", "Java,Spring Boot", "projects", "Employment Platform"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.templateType").value("Tech"));

        mockMvc.perform(get("/api/job/resume").header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.skills").value("Java,Spring Boot"));

        String createResponse = mockMvc.perform(post("/api/job/applications")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("companyName", "Future Tech", "jobTitle", "Java Backend", "status", "APPLIED"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("APPLIED"))
            .andReturn().getResponse().getContentAsString();
        long applicationId = objectMapper.readTree(createResponse).path("data").path("id").asLong();

        mockMvc.perform(put("/api/job/applications/" + applicationId)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("companyName", "Future Tech", "jobTitle", "Java Backend", "status", "INTERVIEW"))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(put("/api/job/applications/" + applicationId)
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("companyName", "Future Tech", "jobTitle", "Java Backend", "status", "INTERVIEW"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("INTERVIEW"));
    }

    @Test
    void createApplicationWithMissingJobPostingReturnsClearMessage() throws Exception {
        mockMvc.perform(post("/api/job/applications")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "companyName", "Missing Corp",
                    "jobTitle", "Missing Role",
                    "jobPostingId", 999999,
                    "status", "APPLIED"
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("岗位不存在"));
    }

    @Test
    void recommendationsUseRuleMatchingWithoutExternalService() throws Exception {
        jobRepository.save(JobPosting.builder()
            .title("Java Backend Engineer").companyName("Future Tech").city("Shanghai").industry("Internet")
            .roleType("Backend").majorKeywords("Computer Science,Software Engineering").skillTags("Java,Spring Boot")
            .description("Rule matched job").active(true).build());
        jobRepository.save(JobPosting.builder()
            .title("Finance Specialist").companyName("Finance Company").city("Beijing").industry("Finance")
            .roleType("Finance").majorKeywords("Accounting").skillTags("Excel").active(true).build());

        mockMvc.perform(put("/api/job/preferences")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("cities", "Shanghai", "industries", "Internet", "roleTypes", "Backend", "active", true))))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/job/recommendations").header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].title").value("Java Backend Engineer"))
            .andExpect(jsonPath("$.data[0].matchScore").value(80));
    }

    @Test
    void adminCrudAndMatchedStationNotificationFlow() throws Exception {
        mockMvc.perform(put("/api/job/preferences")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("cities", "Shanghai", "industries", "Internet", "roleTypes", "Backend", "active", true))))
            .andExpect(status().isOk());

        String createJob = mockMvc.perform(post("/api/admin/employment/jobs")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "title", "Java Backend Engineer", "companyName", "Future Tech", "city", "Shanghai",
                    "industry", "Internet", "roleType", "Backend", "majorKeywords", "Computer Science", "skillTags", "Java", "active", true
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.title").value("Java Backend Engineer"))
            .andReturn().getResponse().getContentAsString();
        JsonNode jobNode = objectMapper.readTree(createJob).path("data");

        mockMvc.perform(post("/api/admin/employment/notifications/trigger")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("relatedType", "JOB", "relatedId", jobNode.path("id").asLong()))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.createdCount").value(1));

        String notifications = mockMvc.perform(get("/api/job/notifications").header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].readFlag").value(false))
            .andReturn().getResponse().getContentAsString();
        long notificationId = objectMapper.readTree(notifications).path("data").get(0).path("id").asLong();

        mockMvc.perform(put("/api/job/notifications/" + notificationId + "/read").header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.readFlag").value(true));

        assertThat(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())).hasSize(1);
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }
}
