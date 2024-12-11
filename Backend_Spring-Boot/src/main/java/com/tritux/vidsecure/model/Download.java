package com.tritux.vidsecure.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "download")
@AllArgsConstructor
@NoArgsConstructor
public class Download {
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
