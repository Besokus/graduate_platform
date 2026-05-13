package com.graduateplatform.kaoyan.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.kaoyan.service.KaoyanService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/kaoyan")
public class KaoyanController {

    private final KaoyanService kaoyanService;

    public KaoyanController(KaoyanService kaoyanService) {
        this.kaoyanService = kaoyanService;
    }

    @GetMapping("/schools/page")
    public ApiResponse<?> schoolsPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoyanService.listSchoolsPage(filters));
    }

    @GetMapping("/score-lines/page")
    public ApiResponse<?> scoreLinesPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(kaoyanService.queryScoreLinesPage(filters));
    }

    @PostMapping("/score-lines/{id}/favorite")
    public ApiResponse<?> favoriteScoreLine(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(kaoyanService.favoriteScoreLine(id, requiredUserId(auth)), "收藏成功");
    }

    @DeleteMapping("/score-lines/{id}/favorite")
    public ApiResponse<?> unfavoriteScoreLine(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(kaoyanService.unfavoriteScoreLine(id, requiredUserId(auth)), "已取消收藏");
    }

    @GetMapping("/score-lines/favorites")
    public ApiResponse<?> myFavoriteScoreLines(Authentication auth) {
        return ApiResponse.ok(kaoyanService.myFavoriteScoreLines(requiredUserId(auth)));
    }

    private Long requiredUserId(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof Long) return (Long) principal;
        return Long.parseLong(principal.toString());
    }
}