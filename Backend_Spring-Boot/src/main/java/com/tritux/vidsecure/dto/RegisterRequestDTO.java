package com.tritux.vidsecure.dto;

import com.tritux.vidsecure.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDTO {
    private String uid;
    private String username;
    private String fullname;
    private String email;
    private String password;
    private String phone;
    private LocalDateTime creationDate;
    private Role role;
}
