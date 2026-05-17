package com.graduateplatform.kaoyan.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.kaoyan.service.StudyRoomService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kaoyan/study-rooms")
public class StudyRoomController {

    private final StudyRoomService studyRoomService;

    public StudyRoomController(StudyRoomService studyRoomService) {
        this.studyRoomService = studyRoomService;
    }

    private Long getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        Object principal = auth.getPrincipal();
        return principal instanceof Long ? (Long) principal : null;
    }

    @PostMapping
    public ApiResponse<?> createRoom(Authentication auth, @RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) return ApiResponse.fail("请先登录");
        return ApiResponse.ok(studyRoomService.createRoom(userId, body));
    }

    @GetMapping
    public ApiResponse<?> getRoomList(@RequestParam Map<String, String> params) {
        return ApiResponse.ok(studyRoomService.getRoomList(params));
    }

    @GetMapping("/{id}")
    public ApiResponse<?> getRoomDetail(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyRoomService.getRoomDetail(id, userId));
    }

    @PostMapping("/{id}/join")
    public ApiResponse<?> joinRoom(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) return ApiResponse.fail("请先登录");
        return ApiResponse.ok(studyRoomService.joinRoom(userId, id));
    }

    @PostMapping("/leave")
    public ApiResponse<?> leaveRoom(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) return ApiResponse.fail("请先登录");
        studyRoomService.leaveRoom(userId);
        return ApiResponse.ok(null, "已离开自习室");
    }

    @GetMapping("/{id}/messages")
    public ApiResponse<?> getMessagesAfter(Authentication auth, @PathVariable Long id,
                                           @RequestParam(required = false) String since) {
        Long userId = getCurrentUserId(auth);
        return ApiResponse.ok(studyRoomService.getMessagesAfter(id, userId, since));
    }

    @PostMapping(value = "/{id}/messages", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<?> sendMessage(Authentication auth, @PathVariable Long id,
                                       @RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) return ApiResponse.fail("请先登录");
        return ApiResponse.ok(studyRoomService.sendMessage(userId, id, body));
    }

    @GetMapping(value = "/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter roomStream(@PathVariable Long id) {
        return studyRoomService.subscribeRoom(id);
    }

    @GetMapping("/{id}/leaderboard")
    public ApiResponse<?> getLeaderboard(@PathVariable Long id,
                                          @RequestParam(defaultValue = "all") String period) {
        List<Map<String, Object>> board = studyRoomService.getLeaderboard(id, period);
        return ApiResponse.ok(board);
    }

    @GetMapping("/me")
    public ApiResponse<?> getMyCurrentRoom(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) return ApiResponse.fail("请先登录");
        return ApiResponse.ok(studyRoomService.getMyCurrentRoom(userId));
    }

    @GetMapping("/me/created")
    public ApiResponse<?> getMyCreatedRooms(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) return ApiResponse.fail("请先登录");
        return ApiResponse.ok(studyRoomService.getMyCreatedRooms(userId));
    }

    @PutMapping("/{id}/close")
    public ApiResponse<?> closeRoom(Authentication auth, @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        if (userId == null) return ApiResponse.fail("请先登录");
        studyRoomService.closeRoom(userId, id);
        return ApiResponse.ok(null, "自习室已关闭");
    }
}