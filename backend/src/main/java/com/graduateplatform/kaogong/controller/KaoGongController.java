package com.graduateplatform.kaogong.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.kaogong.entity.MockInterviewAttachment;
import com.graduateplatform.kaogong.service.KaoGongService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/kaogong")
public class KaoGongController {

    private final KaoGongService kaoGongService;

    public KaoGongController(KaoGongService kaoGongService) {
        this.kaoGongService = kaoGongService;
    }

    @PostMapping("/jobs/match")
    public ApiResponse<?> matchJobs(@RequestBody Map<String, Object> body, Authentication auth) {
        return ApiResponse.ok(kaoGongService.matchJobs(body, currentUserId(auth)));
    }

    @GetMapping("/jobs")
    public ApiResponse<?> listJobs(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.listJobs(filters));
    }

    @GetMapping("/jobs/page")
    public ApiResponse<?> listJobsPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.listJobsPage(filters));
    }

    @PostMapping("/jobs/{id}/favorite")
    public ApiResponse<?> favoriteJob(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(kaoGongService.favoriteJob(id, requiredUserId(auth)), "Favorite saved");
    }

    @DeleteMapping("/jobs/{id}/favorite")
    public ApiResponse<?> unfavoriteJob(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(kaoGongService.unfavoriteJob(id, requiredUserId(auth)), "Favorite removed");
    }

    @GetMapping("/jobs/favorites")
    public ApiResponse<?> favoriteJobs(Authentication auth) {
        return ApiResponse.ok(kaoGongService.myFavoriteJobs(requiredUserId(auth)));
    }

    @GetMapping("/jobs/match-history")
    public ApiResponse<?> jobMatchHistory(Authentication auth) {
        return ApiResponse.ok(kaoGongService.myJobMatchHistory(requiredUserId(auth)));
    }

    @GetMapping("/score-lines")
    public ApiResponse<?> scoreLines(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.queryScoreLines(filters));
    }

    @GetMapping("/score-lines/page")
    public ApiResponse<?> scoreLinesPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.queryScoreLinesPage(filters));
    }

    @PostMapping("/score-lines/{id}/favorite")
    public ApiResponse<?> favoriteScoreLine(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(kaoGongService.favoriteScoreLine(id, requiredUserId(auth)), "Favorite saved");
    }

    @DeleteMapping("/score-lines/{id}/favorite")
    public ApiResponse<?> unfavoriteScoreLine(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(kaoGongService.unfavoriteScoreLine(id, requiredUserId(auth)), "Favorite removed");
    }

    @GetMapping("/score-lines/favorites")
    public ApiResponse<?> favoriteScoreLines(Authentication auth) {
        return ApiResponse.ok(kaoGongService.myFavoriteScoreLines(requiredUserId(auth)));
    }

    @GetMapping("/calendar/events")
    public ApiResponse<?> calendarEvents(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.listCalendarEvents(filters));
    }

    @GetMapping("/calendar/events/page")
    public ApiResponse<?> calendarEventsPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.listCalendarEventsPage(filters));
    }

    @GetMapping("/calendar/exams/page")
    public ApiResponse<?> calendarExamGroupsPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.listCalendarExamGroupsPage(filters));
    }

    @PostMapping("/calendar/subscriptions")
    public ApiResponse<?> subscribe(@RequestBody Map<String, Object> body, Authentication auth) {
        return ApiResponse.ok(kaoGongService.subscribeCalendar(body, requiredUserId(auth)), "Subscription saved");
    }

    @GetMapping("/calendar/subscriptions/me")
    public ApiResponse<?> mySubscriptions(Authentication auth) {
        return ApiResponse.ok(kaoGongService.mySubscriptions(requiredUserId(auth)));
    }

    @PutMapping("/calendar/subscriptions/{id}/cancel")
    public ApiResponse<?> cancelSubscription(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(kaoGongService.cancelSubscription(id, requiredUserId(auth)), "Subscription cancelled");
    }

    @GetMapping("/notifications/me")
    public ApiResponse<?> myNotifications(Authentication auth) {
        return ApiResponse.ok(kaoGongService.myNotifications(requiredUserId(auth)));
    }

    @GetMapping("/interviews")
    public ApiResponse<?> rooms() {
        return ApiResponse.ok(kaoGongService.listInterviewRooms());
    }

    @GetMapping("/interviews/page")
    public ApiResponse<?> roomsPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.listInterviewRoomsPage(filters));
    }

    @GetMapping("/interviews/me")
    public ApiResponse<?> myRooms(Authentication auth) {
        return ApiResponse.ok(kaoGongService.myInterviewRooms(requiredUserId(auth)));
    }

    @GetMapping("/interviews/me/page")
    public ApiResponse<?> myRoomsPage(@RequestParam Map<String, String> filters, Authentication auth) {
        return ApiResponse.ok(kaoGongService.myInterviewRoomsPage(requiredUserId(auth), filters));
    }

    @PostMapping("/interviews")
    public ApiResponse<?> createRoom(@RequestBody Map<String, Object> body, Authentication auth) {
        return ApiResponse.ok(kaoGongService.createInterviewRoom(body, requiredUserId(auth)), "Room created");
    }

    @PostMapping("/interviews/{id}/join")
    public ApiResponse<?> joinRoom(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(kaoGongService.joinInterviewRoom(id, requiredUserId(auth)), "Room joined");
    }

    @PutMapping("/interviews/{id}/status")
    public ApiResponse<?> updateRoomStatus(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        return ApiResponse.ok(kaoGongService.updateInterviewRoomStatus(id, body, requiredUserId(auth)), "Room status updated");
    }

    @GetMapping(value = "/interviews/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter roomStream(@PathVariable Long id) {
        return kaoGongService.subscribeInterviewRoom(id);
    }

    @GetMapping("/interviews/{id}/messages")
    public ApiResponse<?> roomMessages(@PathVariable Long id) {
        return ApiResponse.ok(kaoGongService.getInterviewMessages(id));
    }

    @GetMapping("/interviews/{id}/messages/page")
    public ApiResponse<?> roomMessagesPage(@PathVariable Long id, @RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.getInterviewMessagesPage(id, filters));
    }

    @PostMapping("/interviews/{id}/messages")
    public ApiResponse<?> sendRoomMessage(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        return ApiResponse.ok(kaoGongService.sendInterviewMessage(id, body, requiredUserId(auth)), "Message sent");
    }

    @GetMapping("/interviews/{id}/attachments")
    public ApiResponse<?> roomAttachments(@PathVariable Long id) {
        return ApiResponse.ok(kaoGongService.getInterviewAttachments(id));
    }

    @GetMapping("/interviews/{id}/attachments/page")
    public ApiResponse<?> roomAttachmentsPage(@PathVariable Long id, @RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.getInterviewAttachmentsPage(id, filters));
    }

    @PostMapping(value = "/interviews/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<?> uploadAttachment(@PathVariable Long id,
                                           @RequestPart("file") MultipartFile file,
                                           @RequestParam(required = false) String note,
                                           Authentication auth) {
        return ApiResponse.ok(kaoGongService.uploadInterviewAttachment(id, file, note, requiredUserId(auth)), "Attachment uploaded");
    }

    @GetMapping("/interviews/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId, Authentication auth) {
        Long userId = requiredUserId(auth);
        MockInterviewAttachment attachment = kaoGongService.getAttachmentEntity(attachmentId, userId);
        Resource resource = kaoGongService.getAttachmentResource(attachmentId, userId);
        String encodedName = URLEncoder.encode(attachment.getOriginalName(), StandardCharsets.UTF_8).replace("+", "%20");
        MediaType mediaType = attachment.getContentType() == null || attachment.getContentType().isBlank()
            ? MediaType.APPLICATION_OCTET_STREAM
            : MediaType.parseMediaType(attachment.getContentType());
        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
            .body(resource);
    }

    @PostMapping("/interviews/{id}/feedback")
    public ApiResponse<?> feedback(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        return ApiResponse.ok(kaoGongService.addInterviewFeedback(id, body, requiredUserId(auth)), "Feedback saved");
    }

    @GetMapping("/interviews/{id}/feedback")
    public ApiResponse<?> feedbackList(@PathVariable Long id) {
        return ApiResponse.ok(kaoGongService.getInterviewFeedback(id));
    }

    @GetMapping("/interviews/{id}/feedback/page")
    public ApiResponse<?> feedbackPage(@PathVariable Long id, @RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoGongService.getInterviewFeedbackPage(id, filters));
    }

    @GetMapping("/interviews/feedback/me")
    public ApiResponse<?> myFeedback(Authentication auth) {
        return ApiResponse.ok(kaoGongService.myInterviewFeedback(requiredUserId(auth)));
    }

    @GetMapping("/interviews/feedback/me/page")
    public ApiResponse<?> myFeedbackPage(@RequestParam Map<String, String> filters, Authentication auth) {
        return ApiResponse.ok(kaoGongService.myInterviewFeedbackPage(requiredUserId(auth), filters));
    }

    private Long currentUserId(Authentication auth) {
        return auth != null && auth.getPrincipal() instanceof Long ? (Long) auth.getPrincipal() : null;
    }

    private Long requiredUserId(Authentication auth) {
        Long userId = currentUserId(auth);
        if (userId == null) {
            throw new IllegalStateException("Please login first");
        }
        return userId;
    }
}
