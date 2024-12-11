package com.tritux.vidsecure.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;
@Data
@Setter
@Getter
public class VideoDTO {
    private Long id;
    private String name;
    private String reference;
    private String videoUrl;
    private String videoDashUrl;
    private Set<String> videoDashUrlWithInjection;
    private LocalDateTime uploadDate;
}
