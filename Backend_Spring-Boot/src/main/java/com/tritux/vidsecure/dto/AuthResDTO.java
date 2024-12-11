package com.tritux.vidsecure.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResDTO {
    @JsonProperty("msg")
    private String msg;
    @JsonProperty("access_token")
    private String accessToken;
}

