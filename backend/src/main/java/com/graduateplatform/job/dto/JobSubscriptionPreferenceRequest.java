package com.graduateplatform.job.dto;

import lombok.Data;

@Data
public class JobSubscriptionPreferenceRequest {
    private String cities;
    private String industries;
    private String roleTypes;
    private String salaryRange;
    private String companyTypes;
    private Boolean active;
}
