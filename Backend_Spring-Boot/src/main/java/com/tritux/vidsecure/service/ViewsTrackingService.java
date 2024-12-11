package com.tritux.vidsecure.service;

import com.tritux.vidsecure.dto.ViewsTrackingDTO;
import com.tritux.vidsecure.model.ViewsTracking;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface ViewsTrackingService {
    String getCurrentUserUid(HttpServletRequest request);
    ViewsTracking addViewToVideo(String videoId, ViewsTrackingDTO viewsTrackingDTO);
    Page<ViewsTrackingDTO> getViewsVideosPageable(int page, int size);
    Page<ViewsTrackingDTO> getViewsVideosPageableByUser(int page, int size);
    long calculateViewsByVideoId(String videoId);
    void deleteViewForAdmin(Long id);
    void deleteViewForUser(Long id);
    void deleteViewsByDateAndUser(LocalDate date);
    void clearAllViewsForAdmin(int page, int size);
    void clearAllViewsByUser(int page, int size);
}
