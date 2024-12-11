package com.tritux.vidsecure.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "views_tracking")
@AllArgsConstructor
@NoArgsConstructor
public class ViewsTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userId;
    private String videoId;
    private LocalDateTime date;
    private Boolean deletedForAdmin;
    private Boolean deletedForUser;
}
