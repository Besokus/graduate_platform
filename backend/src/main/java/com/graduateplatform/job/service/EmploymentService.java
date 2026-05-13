package com.graduateplatform.job.service;

import com.graduateplatform.common.entity.User;
import com.graduateplatform.common.exception.BusinessException;
import com.graduateplatform.common.repository.UserRepository;
import com.graduateplatform.job.dto.*;
import com.graduateplatform.job.entity.*;
import com.graduateplatform.job.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class EmploymentService {
    private static final Set<String> VALID_STATUSES = Set.of(
        "TODO", "APPLIED", "VIEWED", "WRITTEN_TEST", "INTERVIEW", "OFFER", "REJECTED", "CLOSED"
    );

    private final CareerFairRepository fairRepository;
    private final JobPostingRepository jobRepository;
    private final ResumeProfileRepository resumeRepository;
    private final ApplicationRecordRepository applicationRepository;
    private final JobSubscriptionPreferenceRepository preferenceRepository;
    private final EmploymentNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public EmploymentService(CareerFairRepository fairRepository,
                             JobPostingRepository jobRepository,
                             ResumeProfileRepository resumeRepository,
                             ApplicationRecordRepository applicationRepository,
                             JobSubscriptionPreferenceRepository preferenceRepository,
                             EmploymentNotificationRepository notificationRepository,
                             UserRepository userRepository) {
        this.fairRepository = fairRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.applicationRepository = applicationRepository;
        this.preferenceRepository = preferenceRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listFairs(String city, String industry, String keyword) {
        return fairRepository.findActive(blankToNull(city), blankToNull(industry), blankToNull(keyword))
            .stream().map(this::toFairMap).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> fairDetail(Long id) {
        CareerFair fair = fairRepository.findById(id).filter(CareerFair::getActive)
            .orElseThrow(() -> new BusinessException("Career fair not found or inactive"));
        return toFairMap(fair);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPostings(String city, String industry, String roleType, String keyword) {
        return jobRepository.findActive(blankToNull(city), blankToNull(industry), blankToNull(roleType), blankToNull(keyword))
            .stream().map(this::toJobMap).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> postingDetail(Long id) {
        JobPosting job = jobRepository.findById(id).filter(JobPosting::getActive)
            .orElseThrow(() -> new BusinessException("Job posting not found"));
        return toJobMap(job);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPreference(Long userId) {
        ensureUser(userId);
        return preferenceRepository.findByUserId(userId).map(this::toPreferenceMap).orElseGet(LinkedHashMap::new);
    }

    @Transactional
    public Map<String, Object> savePreference(Long userId, JobSubscriptionPreferenceRequest req) {
        User user = ensureUser(userId);
        JobSubscriptionPreference pref = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> JobSubscriptionPreference.builder().user(user).build());
        pref.setCities(trim(req.getCities()));
        pref.setIndustries(trim(req.getIndustries()));
        pref.setRoleTypes(trim(req.getRoleTypes()));
        pref.setSalaryRange(trim(req.getSalaryRange()));
        pref.setCompanyTypes(trim(req.getCompanyTypes()));
        pref.setActive(req.getActive() == null || req.getActive());
        return toPreferenceMap(preferenceRepository.save(pref));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getResume(Long userId) {
        ensureUser(userId);
        return resumeRepository.findByUserId(userId).map(this::toResumeMap).orElseGet(LinkedHashMap::new);
    }

    @Transactional
    public Map<String, Object> upsertResume(Long userId, ResumeProfileRequest req) {
        User user = ensureUser(userId);
        ResumeProfile resume = resumeRepository.findByUserId(userId)
            .orElseGet(() -> ResumeProfile.builder().user(user).build());
        String templateType = trim(req.getTemplateType());
        if (templateType != null) {
            resume.setTemplateType(templateType);
        } else if (trim(resume.getTemplateType()) == null) {
            resume.setTemplateType("default");
        }
        resume.setBaseInfo(trim(req.getBaseInfo()));
        resume.setEducation(trim(req.getEducation()));
        resume.setProjects(trim(req.getProjects()));
        resume.setInternships(trim(req.getInternships()));
        resume.setSkills(trim(req.getSkills()));
        resume.setSelfEvaluation(trim(req.getSelfEvaluation()));
        return toResumeMap(resumeRepository.save(resume));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> recommendations(Long userId, String city, String industry, String roleType) {
        User user = ensureUser(userId);
        JobSubscriptionPreference pref = preferenceRepository.findByUserId(userId).orElse(null);
        ResumeProfile resume = resumeRepository.findByUserId(userId).orElse(null);
        List<JobPosting> jobs = jobRepository.findByActiveTrueOrderByCreatedAtDesc();
        return jobs.stream()
            .map(job -> recommendationMap(job, user, pref, resume, city, industry, roleType))
            .filter(map -> ((Integer) map.get("matchScore")) > 0)
            .sorted((a, b) -> Integer.compare((Integer) b.get("matchScore"), (Integer) a.get("matchScore")))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listApplications(Long userId) {
        ensureUser(userId);
        return applicationRepository.findByUserIdOrderByAppliedAtDescCreatedAtDesc(userId)
            .stream().map(this::toApplicationMap).toList();
    }

    @Transactional
    public Map<String, Object> createApplication(Long userId, ApplicationRecordRequest req) {
        User user = ensureUser(userId);
        ApplicationRecord record = ApplicationRecord.builder()
            .user(user)
            .companyName(trimRequired(req.getCompanyName(), "Company name is required"))
            .jobTitle(trimRequired(req.getJobTitle(), "required field missing"))
            .jobPosting(resolveJob(req.getJobPostingId()))
            .status(normalizeStatus(req.getStatus()))
            .appliedAt(req.getAppliedAt())
            .nextStepAt(req.getNextStepAt())
            .notes(trim(req.getNotes()))
            .build();
        return toApplicationMap(applicationRepository.save(record));
    }

    @Transactional
    public Map<String, Object> updateApplication(Long userId, Long id, ApplicationRecordRequest req) {
        ensureUser(userId);
        ApplicationRecord record = applicationRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("Application record not found or not owned by current user"));
        record.setCompanyName(trimRequired(req.getCompanyName(), "Company name is required"));
        record.setJobTitle(trimRequired(req.getJobTitle(), "required field missing"));
        record.setJobPosting(resolveJob(req.getJobPostingId()));
        record.setStatus(normalizeStatus(req.getStatus()));
        record.setAppliedAt(req.getAppliedAt() == null ? record.getAppliedAt() : req.getAppliedAt());
        record.setNextStepAt(req.getNextStepAt());
        record.setNotes(trim(req.getNotes()));
        return toApplicationMap(applicationRepository.save(record));
    }

    @Transactional
    public Map<String, Object> deleteApplication(Long userId, Long id) {
        ensureUser(userId);
        ApplicationRecord record = applicationRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException("Application record not found or not owned by current user"));
        applicationRepository.delete(record);
        return Map.of("deleted", true, "id", id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listNotifications(Long userId) {
        ensureUser(userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toNotificationMap).toList();
    }

    @Transactional
    public Map<String, Object> markNotificationRead(Long userId, Long notificationId) {
        ensureUser(userId);
        EmploymentNotification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
            .orElseThrow(() -> new BusinessException("Notification not found or not owned by current user"));
        notification.setReadFlag(true);
        notification.setReadAt(LocalDateTime.now());
        return toNotificationMap(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> adminFairs() {
        return fairRepository.findAll().stream()
            .sorted(Comparator.comparing(CareerFair::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::toFairMap).toList();
    }

    @Transactional
    public Map<String, Object> createFair(CareerFairRequest req) {
        CareerFair fair = new CareerFair();
        applyFair(fair, req);
        return toFairMap(fairRepository.save(fair));
    }

    @Transactional
    public Map<String, Object> updateFair(Long id, CareerFairRequest req) {
        CareerFair fair = fairRepository.findById(id).orElseThrow(() -> new BusinessException("Career fair not found"));
        applyFair(fair, req);
        return toFairMap(fairRepository.save(fair));
    }

    @Transactional
    public Map<String, Object> deleteFair(Long id) {
        CareerFair fair = fairRepository.findById(id).orElseThrow(() -> new BusinessException("Career fair not found"));
        fairRepository.delete(fair);
        return Map.of("deleted", true, "id", id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> adminJobs() {
        return jobRepository.findAll().stream()
            .sorted(Comparator.comparing(JobPosting::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::toJobMap).toList();
    }

    @Transactional
    public Map<String, Object> createJob(JobPostingRequest req) {
        JobPosting job = new JobPosting();
        applyJob(job, req);
        return toJobMap(jobRepository.save(job));
    }

    @Transactional
    public Map<String, Object> updateJob(Long id, JobPostingRequest req) {
        JobPosting job = jobRepository.findById(id).orElseThrow(() -> new BusinessException("record not found"));
        applyJob(job, req);
        return toJobMap(jobRepository.save(job));
    }

    @Transactional
    public Map<String, Object> deleteJob(Long id) {
        JobPosting job = jobRepository.findById(id).orElseThrow(() -> new BusinessException("record not found"));
        jobRepository.delete(job);
        return Map.of("deleted", true, "id", id);
    }

    @Transactional
    public Map<String, Object> triggerNotification(NotificationTriggerRequest req) {
        String type = req.getRelatedType() == null ? "" : req.getRelatedType().trim().toUpperCase(Locale.ROOT);
        NotificationSource source = resolveNotificationSource(type, req.getRelatedId());
        List<JobSubscriptionPreference> prefs = preferenceRepository.findByActiveTrue();
        List<EmploymentNotification> created = new ArrayList<>();
        for (JobSubscriptionPreference pref : prefs) {
            if (matchesPreference(pref, source.city(), source.industry(), source.roleType())) {
                EmploymentNotification notification = EmploymentNotification.builder()
                    .user(pref.getUser())
                    .title(source.title())
                    .content(source.content())
                    .relatedType(type)
                    .relatedId(req.getRelatedId())
                    .readFlag(false)
                    .build();
                created.add(notificationRepository.save(notification));
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("createdCount", created.size());
        result.put("notifications", created.stream().map(this::toNotificationMap).toList());
        return result;
    }

    private void applyFair(CareerFair fair, CareerFairRequest req) {
        fair.setTitle(trimRequired(req.getTitle(), "Title is required"));
        fair.setCompanyName(trimRequired(req.getCompanyName(), "Company name is required"));
        fair.setCity(trim(req.getCity()));
        fair.setIndustry(trim(req.getIndustry()));
        fair.setTargetRoles(trim(req.getTargetRoles()));
        fair.setLocation(trim(req.getLocation()));
        fair.setStartTime(req.getStartTime());
        fair.setEndTime(req.getEndTime());
        fair.setApplyDeadline(req.getApplyDeadline());
        fair.setApplyUrl(trim(req.getApplyUrl()));
        fair.setDescription(trim(req.getDescription()));
        fair.setActive(req.getActive() == null || req.getActive());
    }

    private void applyJob(JobPosting job, JobPostingRequest req) {
        job.setTitle(trimRequired(req.getTitle(), "required field missing"));
        job.setCompanyName(trimRequired(req.getCompanyName(), "Company name is required"));
        job.setCity(trim(req.getCity()));
        job.setIndustry(trim(req.getIndustry()));
        job.setRoleType(trim(req.getRoleType()));
        job.setSalaryRange(trim(req.getSalaryRange()));
        job.setEducationRequirement(trim(req.getEducationRequirement()));
        job.setMajorKeywords(trim(req.getMajorKeywords()));
        job.setSkillTags(trim(req.getSkillTags()));
        job.setDescription(trim(req.getDescription()));
        job.setApplyUrl(trim(req.getApplyUrl()));
        job.setActive(req.getActive() == null || req.getActive());
    }

    private NotificationSource resolveNotificationSource(String type, Long id) {
        if ("FAIR".equals(type)) {
            CareerFair fair = fairRepository.findById(id).orElseThrow(() -> new BusinessException("Career fair not found"));
            return new NotificationSource("New career fair: " + fair.getTitle(),
                fair.getCompanyName() + " will host a career fair in " + nullSafe(fair.getCity()) + ". Open the employment page for details.",
                fair.getCity(), fair.getIndustry(), fair.getTargetRoles());
        }
        if ("JOB".equals(type)) {
            JobPosting job = jobRepository.findById(id).orElseThrow(() -> new BusinessException("record not found"));
            return new NotificationSource("new matched item: " + job.getTitle(),
                job.getCompanyName() + " posted " + job.getTitle() + ". Open the employment page for details.",
                job.getCity(), job.getIndustry(), job.getRoleType());
        }
        throw new BusinessException("Notification source must be FAIR or JOB");
    }

    private Map<String, Object> recommendationMap(JobPosting job, User user, JobSubscriptionPreference pref,
                                                  ResumeProfile resume, String city, String industry, String roleType) {
        int score = 0;
        List<String> reasons = new ArrayList<>();
        if (matchesText(job.getCity(), city) || (pref != null && matchesAny(pref.getCities(), job.getCity()))) {
            score += 20; reasons.add("city match");
        }
        if (matchesText(job.getIndustry(), industry) || (pref != null && matchesAny(pref.getIndustries(), job.getIndustry()))) {
            score += 20; reasons.add("industry match");
        }
        if (matchesText(job.getRoleType(), roleType) || (pref != null && matchesAny(pref.getRoleTypes(), job.getRoleType()))) {
            score += 20; reasons.add("role match");
        }
        if (matchesAny(job.getMajorKeywords(), user.getMajor())) {
            score += 20; reasons.add("major match");
        }
        if (resume != null && (matchesAny(job.getSkillTags(), resume.getSkills()) || matchesAny(job.getSkillTags(), resume.getProjects()))) {
            score += 20; reasons.add("skill match");
        }
        if (score == 0 && pref == null && resume == null && hasText(user.getTarget()) && "job".equals(user.getTarget())) {
            score = 5;
            reasons.add("job direction fallback");
        }
        Map<String, Object> map = toJobMap(job);
        map.put("matchScore", score);
        map.put("matchReasons", reasons);
        return map;
    }

    private boolean matchesPreference(JobSubscriptionPreference pref, String city, String industry, String roleType) {
        return matchesAny(pref.getCities(), city)
            || matchesAny(pref.getIndustries(), industry)
            || matchesAny(pref.getRoleTypes(), roleType)
            || (!hasText(pref.getCities()) && !hasText(pref.getIndustries()) && !hasText(pref.getRoleTypes()));
    }

    private JobPosting resolveJob(Long id) {
        if (id == null) return null;
        return jobRepository.findById(id).orElseThrow(() -> new BusinessException("岗位不存在"));
    }

    private User ensureUser(Long userId) {
        if (userId == null) throw new BusinessException("login required");
        return userRepository.findById(userId).orElseThrow(() -> new BusinessException("record not found"));
    }

    private String normalizeStatus(String status) {
        String normalized = hasText(status) ? status.trim() : "APPLIED";
        if (!VALID_STATUSES.contains(normalized)) {
            throw new BusinessException("invalid status");
        }
        return normalized;
    }

    private Map<String, Object> toFairMap(CareerFair fair) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", fair.getId());
        map.put("title", fair.getTitle());
        map.put("companyName", fair.getCompanyName());
        map.put("city", fair.getCity());
        map.put("industry", fair.getIndustry());
        map.put("targetRoles", fair.getTargetRoles());
        map.put("location", fair.getLocation());
        map.put("startTime", toString(fair.getStartTime()));
        map.put("endTime", toString(fair.getEndTime()));
        map.put("applyDeadline", toString(fair.getApplyDeadline()));
        map.put("applyUrl", fair.getApplyUrl());
        map.put("description", fair.getDescription());
        map.put("active", fair.getActive());
        map.put("createdAt", toString(fair.getCreatedAt()));
        return map;
    }

    private Map<String, Object> toJobMap(JobPosting job) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", job.getId());
        map.put("title", job.getTitle());
        map.put("companyName", job.getCompanyName());
        map.put("city", job.getCity());
        map.put("industry", job.getIndustry());
        map.put("roleType", job.getRoleType());
        map.put("salaryRange", job.getSalaryRange());
        map.put("educationRequirement", job.getEducationRequirement());
        map.put("majorKeywords", job.getMajorKeywords());
        map.put("skillTags", job.getSkillTags());
        map.put("description", job.getDescription());
        map.put("applyUrl", job.getApplyUrl());
        map.put("active", job.getActive());
        map.put("createdAt", toString(job.getCreatedAt()));
        return map;
    }

    private Map<String, Object> toResumeMap(ResumeProfile resume) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", resume.getId());
        map.put("templateType", resume.getTemplateType());
        map.put("baseInfo", resume.getBaseInfo());
        map.put("education", resume.getEducation());
        map.put("projects", resume.getProjects());
        map.put("internships", resume.getInternships());
        map.put("skills", resume.getSkills());
        map.put("selfEvaluation", resume.getSelfEvaluation());
        map.put("updatedAt", toString(resume.getUpdatedAt()));
        return map;
    }

    private Map<String, Object> toPreferenceMap(JobSubscriptionPreference pref) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", pref.getId());
        map.put("cities", pref.getCities());
        map.put("industries", pref.getIndustries());
        map.put("roleTypes", pref.getRoleTypes());
        map.put("salaryRange", pref.getSalaryRange());
        map.put("companyTypes", pref.getCompanyTypes());
        map.put("active", pref.getActive());
        map.put("updatedAt", toString(pref.getUpdatedAt()));
        return map;
    }

    private Map<String, Object> toApplicationMap(ApplicationRecord record) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", record.getId());
        map.put("companyName", record.getCompanyName());
        map.put("jobTitle", record.getJobTitle());
        map.put("jobPostingId", record.getJobPosting() != null ? record.getJobPosting().getId() : null);
        map.put("status", record.getStatus());
        map.put("appliedAt", toString(record.getAppliedAt()));
        map.put("nextStepAt", toString(record.getNextStepAt()));
        map.put("notes", record.getNotes());
        map.put("createdAt", toString(record.getCreatedAt()));
        map.put("updatedAt", toString(record.getUpdatedAt()));
        return map;
    }

    private Map<String, Object> toNotificationMap(EmploymentNotification notification) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", notification.getId());
        map.put("title", notification.getTitle());
        map.put("content", notification.getContent());
        map.put("relatedType", notification.getRelatedType());
        map.put("relatedId", notification.getRelatedId());
        map.put("readFlag", notification.getReadFlag());
        map.put("createdAt", toString(notification.getCreatedAt()));
        map.put("readAt", toString(notification.getReadAt()));
        return map;
    }

    private String blankToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private String trimRequired(String value, String message) {
        String trimmed = trim(value);
        if (!hasText(trimmed)) throw new BusinessException(message);
        return trimmed;
    }

    private String defaultString(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private String toString(LocalDateTime time) {
        return time == null ? null : time.toString();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean matchesText(String actual, String expected) {
        if (!hasText(expected)) return false;
        return hasText(actual) && actual.toLowerCase(Locale.ROOT).contains(expected.trim().toLowerCase(Locale.ROOT));
    }

    private boolean matchesAny(String source, String candidate) {
        if (!hasText(source) || !hasText(candidate)) return false;
        String normalizedCandidate = candidate.toLowerCase(Locale.ROOT);
        for (String token : source.split("[,;\\s\\uFF0C\\u3001]+")) {
            if (hasText(token) && normalizedCandidate.contains(token.trim().toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        String normalizedSource = source.toLowerCase(Locale.ROOT);
        for (String token : candidate.split("[,;\\s\\uFF0C\\u3001]+")) {
            if (hasText(token) && normalizedSource.contains(token.trim().toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private record NotificationSource(String title, String content, String city, String industry, String roleType) {}
}
