package com.tritux.vidsecure.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Component
public class DownloadDTO {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userId;
    private String videoId;
    private String downloadUrl;
    private Boolean deletedForAdmin;
    private Boolean deletedForUser;
    private LocalDateTime date;
}
