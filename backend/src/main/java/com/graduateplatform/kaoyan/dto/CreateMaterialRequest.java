package com.graduateplatform.kaoyan.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateMaterialRequest {
    private String title;
    private String description;
    private String school;
    private String major;
    private String subject;
    private Integer year;
    private String materialType;
}