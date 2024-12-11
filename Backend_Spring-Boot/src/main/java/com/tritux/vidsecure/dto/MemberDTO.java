package com.tritux.vidsecure.dto;

import com.tritux.vidsecure.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Component
public class MemberDTO {
    private Long id;
    private String uid;
    private String username;
    private String fullname;
    private String email;
    private String password;
    private String phone;
    private LocalDateTime creationDate;
    private Boolean blocked;
    private Role role;
}



