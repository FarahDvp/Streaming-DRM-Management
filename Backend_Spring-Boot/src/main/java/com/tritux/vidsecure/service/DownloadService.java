package com.tritux.vidsecure.service;

import com.tritux.vidsecure.dto.DownloadDTO;
import com.tritux.vidsecure.model.Download;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface DownloadService {
    String getCurrentUserUid(HttpServletRequest request);
    Page<DownloadDTO> getDownloadedVideosPageable(int page, int size);
    Page<DownloadDTO> getDownloadedVideosPageableByUser(int page, int size);
    ResponseEntity<Resource> getDownloadedVideoByName(String filename);
    Download downloadVideoByReference(String videoId) throws IOException;
    long calculateDownloadsByUserId(String userId);
    void deleteDownloadForAdmin(Long id);
    void deleteDownloadForUser(Long id);
    void clearAllDownloads(int page, int size);
    void clearAllDownloadsByUser();

}
