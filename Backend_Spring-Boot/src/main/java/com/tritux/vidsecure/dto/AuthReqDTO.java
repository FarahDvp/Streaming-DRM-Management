package com.tritux.vidsecure.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthReqDTO {
    private String password;
    private String username;
    private String uid;
}
