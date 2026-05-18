package com.graduateplatform.kaoyan.controller;

import com.graduateplatform.common.dto.ApiResponse;
import com.graduateplatform.kaoyan.dto.CreateMaterialRequest;
import com.graduateplatform.kaoyan.service.MaterialService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kaoyan/materials")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping("/page")
    public ApiResponse<?> listMaterialsPage(@RequestParam Map<String, String> filters) {
        return ApiResponse.ok(materialService.listApprovedMaterialsPage(filters));
    }

    @GetMapping("/{id}")
    public ApiResponse<?> getMaterialDetail(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(materialService.getMaterialDetail(id));
    }

    @PostMapping
    public ApiResponse<?> createMaterial(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String school,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String materialType,
            @RequestParam List<MultipartFile> files,
            Authentication auth) {
        Long userId = requiredUserId(auth);
        CreateMaterialRequest request = new CreateMaterialRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setSchool(school);
        request.setMajor(major);
        request.setSubject(subject);
        request.setYear(year);
        request.setMaterialType(materialType);
        return ApiResponse.ok(materialService.createMaterial(userId, request, files), "资料上传成功，等待审核");
    }

    @GetMapping("/my")
    public ApiResponse<?> listMyMaterials(@RequestParam Map<String, String> filters, Authentication auth) {
        return ApiResponse.ok(materialService.listMyMaterials(requiredUserId(auth), filters));
    }

    @GetMapping("/{materialId}/download/{attachmentId}")
    public ResponseEntity<StreamingResponseBody> downloadAttachment(
            @PathVariable Long materialId,
            @PathVariable Long attachmentId,
            Authentication auth) {
        Object[] result = materialService.getDownloadStream(materialId, attachmentId, requiredUserId(auth));
        InputStream inputStream = (InputStream) result[0];
        com.qcloud.cos.model.ObjectMetadata metadata = (com.qcloud.cos.model.ObjectMetadata) result[1];
        String originalName = (String) result[2];

        String contentType = metadata.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        StreamingResponseBody stream = out -> {
            try {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                inputStream.close();
            } catch (Exception e) {
                throw new RuntimeException("下载失败: " + e.getMessage());
            }
        };

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalName + "\"; filename*=UTF-8''" + originalName)
            .contentType(MediaType.parseMediaType(contentType))
            .contentLength(metadata.getContentLength())
            .body(stream);
    }

    private Long requiredUserId(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof Long) return (Long) principal;
        return Long.parseLong(principal.toString());
    }
}