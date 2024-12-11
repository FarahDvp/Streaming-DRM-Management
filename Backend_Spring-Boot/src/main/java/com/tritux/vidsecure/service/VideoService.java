package com.tritux.vidsecure.service;

import com.tritux.vidsecure.dto.VideoDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface VideoService {
    VideoDTO uploadVideo(MultipartFile file) throws IOException, InterruptedException;
    String getCurrentUserUid(HttpServletRequest request);
    ResponseEntity<?> getDashVideoResponse(String fileName);
    ResponseEntity<?> getDashVideoWithInjectionResponse(String fileName);
    Page<VideoDTO> getVideosPageable(int page, int size);
    Page<VideoDTO> getVideosWithInjectionUserID(int page, int size);
    VideoDTO getOne(String reference);
    VideoDTO updateVideo(String reference, VideoDTO videoDTO);
    void deleteVideo(String reference);
    void removeVideo(Long id);
}
