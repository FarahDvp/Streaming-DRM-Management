package com.tritux.vidsecure.controller;

import com.tritux.vidsecure.dto.DownloadDTO;
import com.tritux.vidsecure.model.Download;
import com.tritux.vidsecure.service.DownloadService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;


import java.io.IOException;

@RestController
@RequestMapping("/api/downloads")
public class DownloadController {
    @Autowired
    private DownloadService downloadService;

    @GetMapping("/current-user-uid")
    public ResponseEntity<String> getCurrentUserUid(HttpServletRequest request) {
        String uid = downloadService.getCurrentUserUid(request);
        return ResponseEntity.ok(uid);
    }
    @GetMapping("/all")
    public ResponseEntity<Page<DownloadDTO>> getAllDownloadedVideos(@RequestParam(name = "page", defaultValue = "0") int page,
                                                          @RequestParam(name = "size", defaultValue = "9") int size) {
        Page<DownloadDTO> downloadPage = downloadService.getDownloadedVideosPageable(page, size);
        return ResponseEntity.ok().body(downloadPage);
    }
    @GetMapping("/user")
    public ResponseEntity<Page<DownloadDTO>> getAllDownloadedVideosByUser(@RequestParam(name = "page", defaultValue = "0") int page,
                                                                          @RequestParam(name = "size", defaultValue = "9") int size) {
        Page<DownloadDTO> downloadPage = downloadService.getDownloadedVideosPageableByUser(page, size);
        return ResponseEntity.ok().body(downloadPage);
    }
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getDownloadedVideo(@PathVariable String filename) {
        return downloadService.getDownloadedVideoByName(filename);
    }

    @PostMapping("/add/{reference}")
    public ResponseEntity<Download> downloadVideo(@PathVariable String reference) throws IOException {
        Download download = downloadService.downloadVideoByReference(reference);
        return new ResponseEntity<>(download, HttpStatus.CREATED);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDownloadForAdmin(@PathVariable("id") Long id) {
        downloadService.deleteDownloadForAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<Void> deleteDownloadForUser(@PathVariable("id") Long id) {
        downloadService.deleteDownloadForUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/calculate-downloads/{userId}")
    public ResponseEntity<Long> calculateDownloadsByUserId(@PathVariable String userId) {
        long downloads = downloadService.calculateDownloadsByUserId(userId);
        return ResponseEntity.ok(downloads);
    }

    @DeleteMapping("/clearAll")
    public void clearAllDownloads(@RequestParam int page, @RequestParam int size) {
        downloadService.clearAllDownloads(page, size);
    }

    @DeleteMapping("/user/clearAll")
    public ResponseEntity<Void> clearAllDownloadsByUser() {
        downloadService.clearAllDownloadsByUser();
        return ResponseEntity.noContent().build();
    }

}
