package com.tritux.vidsecure.controller;

import com.tritux.vidsecure.dto.DownloadDTO;
import com.tritux.vidsecure.dto.ViewsTrackingDTO;
import com.tritux.vidsecure.model.ViewsTracking;
import com.tritux.vidsecure.service.ViewsTrackingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/views-tracking")
public class ViewsTrackingController {
    @Autowired
    private ViewsTrackingService viewsTrackingService;
    @GetMapping("/current-user-uid")
    public ResponseEntity<String> getCurrentUserUid(HttpServletRequest request) {
        String uid = viewsTrackingService.getCurrentUserUid(request);
        return ResponseEntity.ok(uid);
    }

    @GetMapping("/all")
    public ResponseEntity<Page<ViewsTrackingDTO>> getAllViewsVideos(@RequestParam(name = "page", defaultValue = "0") int page,
                                                                     @RequestParam(name = "size", defaultValue = "10") int size) {
        Page<ViewsTrackingDTO> viewsTrackingPage = viewsTrackingService.getViewsVideosPageable(page, size);
        return ResponseEntity.ok().body(viewsTrackingPage);
    }

    @GetMapping("/user")
    public ResponseEntity<Page<ViewsTrackingDTO>> getAllViewsVideosByUser(@RequestParam(name = "page", defaultValue = "0") int page,
                                                                    @RequestParam(name = "size", defaultValue = "10") int size) {
        Page<ViewsTrackingDTO> viewsTrackingPage = viewsTrackingService.getViewsVideosPageableByUser(page, size);
        return ResponseEntity.ok().body(viewsTrackingPage);
    }

    @PostMapping("/{videoId}/views")
    public ResponseEntity<ViewsTracking> addViewToVideo(@PathVariable String videoId, @RequestBody ViewsTrackingDTO viewDTO) {
        ViewsTracking view = viewsTrackingService.addViewToVideo(videoId, viewDTO);
        return new ResponseEntity<>(view, HttpStatus.CREATED);
    }

    @GetMapping("/calculate-views/{videoId}")
    public ResponseEntity<Long> calculateViewsByVideoId(@PathVariable String videoId) {
        long views = viewsTrackingService.calculateViewsByVideoId(videoId);
        return ResponseEntity.ok(views);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteViewForAdmin(@PathVariable("id") Long id) {
        viewsTrackingService.deleteViewForAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<Void> deleteViewForUser(@PathVariable("id") Long id) {
        viewsTrackingService.deleteViewForUser(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/date/{date}")
    public ResponseEntity<Void> deleteViewsByDate(@PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        viewsTrackingService.deleteViewsByDateAndUser(date);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clearAll")
    public ResponseEntity<Void> clearAllViewsForAdmin(@RequestParam int page, @RequestParam int size) {
        viewsTrackingService.clearAllViewsForAdmin(page, size);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/clearAll")
    public ResponseEntity<Void> clearAllViewsByUser(@RequestParam int page, @RequestParam int size) {
        viewsTrackingService.clearAllViewsByUser(page, size);
        return ResponseEntity.noContent().build();
    }

}
