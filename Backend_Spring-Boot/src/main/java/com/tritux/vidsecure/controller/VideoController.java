package com.tritux.vidsecure.controller;

import com.tritux.vidsecure.dto.VideoDTO;
import com.tritux.vidsecure.service.VideoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/videos")
public class VideoController {
    @Autowired
    private VideoService videoService;

    @GetMapping("/current-user-uid")
    public ResponseEntity<String> getCurrentUserUid(HttpServletRequest request) {
        String uid = videoService.getCurrentUserUid(request);
        return ResponseEntity.ok(uid);
    }


    @PostMapping("/upload")
    public ResponseEntity<VideoDTO> uploadVideo(@RequestParam("file") MultipartFile file) throws IOException, InterruptedException {
        VideoDTO videoDTO = videoService.uploadVideo(file);
        return ResponseEntity.ok().body(videoDTO);
    }

    @GetMapping("/dash-videos/{fileName:.+}")
    public ResponseEntity<?> getDashVideo(@PathVariable String fileName) {
        return videoService.getDashVideoResponse(fileName);
    }

    @GetMapping("/dash-videos-with-injection/{fileName:.+}")
    public ResponseEntity<?> getDashVideoWithInjection(@PathVariable String fileName) {
        return videoService.getDashVideoWithInjectionResponse(fileName);
    }

    @GetMapping("/pageable/all")
    public ResponseEntity<Page<VideoDTO>> getAllVideos(@RequestParam(name = "page", defaultValue = "0") int page,
                                                       @RequestParam(name = "size", defaultValue = "6") int size) {
        Page<VideoDTO> videoPage = videoService.getVideosPageable(page, size);
        return ResponseEntity.ok().body(videoPage);
    }

    @GetMapping("/all-with-injection-userID")
    public ResponseEntity<Page<VideoDTO>> getAllVideosWithInjectionUserID(@RequestParam(name = "page", defaultValue = "0") int page,
                                                                          @RequestParam(name = "size", defaultValue = "6") int size) {
        Page<VideoDTO> videoPage = videoService.getVideosWithInjectionUserID(page, size);
        return ResponseEntity.ok().body(videoPage);
    }

    @GetMapping("/one/{reference}")
    public ResponseEntity<VideoDTO> getVideoById(@PathVariable("reference") String reference) {
        try {
            VideoDTO videoDTO = videoService.getOne(reference);
            return ResponseEntity.ok().body(videoDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @PutMapping("/update/{reference}")
    public ResponseEntity<VideoDTO> updateVideo(@PathVariable("reference") String reference,
                                                @RequestBody VideoDTO videoDTO) {
        VideoDTO updatedVideo = videoService.updateVideo(reference, videoDTO);
        return ResponseEntity.ok().body(updatedVideo);
    }

    @DeleteMapping("/delete/{reference}")
    public ResponseEntity<Void> deleteVideo(@PathVariable("reference") String reference) {
        videoService.deleteVideo(reference);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete-one/{id}")
    public ResponseEntity<Void> deleteVideoOne(@PathVariable("id") Long id) {
        videoService.removeVideo(id);
        return ResponseEntity.noContent().build();
    }



}
