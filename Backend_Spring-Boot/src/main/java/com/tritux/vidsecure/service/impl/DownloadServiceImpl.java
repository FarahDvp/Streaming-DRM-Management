package com.tritux.vidsecure.service.impl;

import com.tritux.vidsecure.config.JwtService;
import com.tritux.vidsecure.dto.DownloadDTO;
import com.tritux.vidsecure.exception.OverlayAlreadyExistsException;
import com.tritux.vidsecure.mapper.DownloadMapper;
import com.tritux.vidsecure.model.Download;
import com.tritux.vidsecure.model.Video;
import com.tritux.vidsecure.repository.DownloadRepository;
import com.tritux.vidsecure.repository.VideoRepository;
import com.tritux.vidsecure.service.DownloadService;
import com.tritux.vidsecure.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DownloadServiceImpl implements DownloadService {
    @Autowired
    private DownloadRepository downloadRepository;
    @Autowired
    private DownloadMapper downloadMapper;
    @Autowired
    private VideoRepository videoRepository;
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private final JwtService jwtService;
    @Autowired
    private MemberService userService;
    @Autowired
    private ResourceLoader resourceLoader;
    public DownloadServiceImpl(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    @Value("${video.upload.updated.directory}")
    private String uploadModifiedDirectory;
    @Value("${video.upload.downloads.directory}")
    private  String downloadDirectory;

    @Override
    public String getCurrentUserUid(HttpServletRequest request) {
        String token = request.getHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String uid = (String) jwtService.decode(token).get("uid");
            if (uid != null) {
                return uid;
            } else {
                throw new IllegalArgumentException("Invalid token");
            }
        } else {
            throw new IllegalArgumentException("Token not provided or invalid format");
        }
    }
    @Override
    public Page<DownloadDTO> getDownloadedVideosPageable(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<Download> downloadPage = downloadRepository.findAllByAdmin(pr);

        return downloadPage.map(downloadMapper::toDto);
    }
    @Override
    public Page<DownloadDTO> getDownloadedVideosPageableByUser(int page, int size) {
        String userId = getCurrentUserUid(request);
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<Download> downloadPage = downloadRepository.findAllByUserId(userId, pr);;

        return downloadPage.map(downloadMapper::toDto);
    }
    @Override
    public ResponseEntity<Resource> getDownloadedVideoByName(String filename) {
        Path videoPath = Paths.get("src/main/resources/static/videos/downloads/").resolve(filename);
        Resource videoResource = resourceLoader.getResource("file:" + videoPath.toString());
        if (videoResource.exists() && videoResource.isReadable()) {
            return ResponseEntity.ok().body(videoResource);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "La vidéo demandée n'a pas été trouvée");
        }
    }
    @Override
    public Download downloadVideoByReference(String videoId) throws IOException {
        Video video = videoRepository.findByReference(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Référence vidéo non trouvée"));

        String currentUserUid = getCurrentUserUid(request);

        boolean downloadsExists = downloadRepository.existsByVideoIdAndUserId(videoId, currentUserUid);
        if (downloadsExists) {
            throw new OverlayAlreadyExistsException("Downloaded video already exists for video with id " + videoId + " and userId: " + currentUserUid);
        }

        String videoUrl = video.getVideoUrl();
        File file = new File(videoUrl);
        String fileName = file.getName();
        String finalUrl = currentUserUid + "_" + fileName;
        String chosenVideoUrl = uploadModifiedDirectory + finalUrl;
        String filePath = downloadVideo(chosenVideoUrl);

        Download download = new Download();
        download.setUserId(currentUserUid);
        download.setVideoId(video.getReference());

        String videoBaseUrl = "http://127.0.0.1:8080/api/downloads/";
        Path path = Paths.get(filePath);
        String fileName1 = path.getFileName().toString();
        String videoFinalUrl = videoBaseUrl + fileName1;

        download.setDownloadUrl(videoFinalUrl);
        download.setDate(LocalDateTime.now());
        downloadRepository.save(download);

        return download;
    }
    private String downloadVideo(String videoPath) throws IOException {
        String fileName = UUID.randomUUID().toString() + ".mp4";
        String filePath = downloadDirectory + fileName;

        try (FileInputStream fis = new FileInputStream(videoPath);
             FileOutputStream fos = new FileOutputStream(filePath)) {
            FileChannel inChannel = fis.getChannel();
            FileChannel outChannel = fos.getChannel();
            inChannel.transferTo(0, inChannel.size(), outChannel);
        }

        return filePath;
    }

    @Override
    public long calculateDownloadsByUserId(String userId) {
        return downloadRepository.countDownloadsWithExistingVideos(userId);
    }
    @Override
    public void deleteDownloadForAdmin(Long id) {
        Optional<Download> optionalDownload = downloadRepository.findById(id);
        if (optionalDownload.isPresent()) {
            Download download = optionalDownload.get();
            downloadRepository.delete(download);
            download.setDeletedForAdmin(true);
            downloadRepository.save(download);
        } else {
            throw new NoSuchElementException("Downloaded video with reference " + id + " not found");
        }
    }
    @Override
    public void deleteDownloadForUser(Long id) {
        Optional<Download> optionalDownload = downloadRepository.findById(id);
        if (optionalDownload.isPresent()) {
            Download download = optionalDownload.get();
            downloadRepository.delete(download);
        } else {
            throw new NoSuchElementException("Downloaded video with reference " + id + " not found");
        }
    }
    @Override
    public void clearAllDownloads(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<Download> downloadsToClear = downloadRepository.findAllByAdmin(pageable);

        List<Long> idsToClear = downloadsToClear.stream()
                .map(Download::getId)
                .collect(Collectors.toList());
        if (!idsToClear.isEmpty()) {
            downloadRepository.markDeletedForAdminByIds(idsToClear);
        }
    }
    @Override
    public void clearAllDownloadsByUser() {
        String userId = getCurrentUserUid(request);
        downloadRepository.deleteAllByUserId(userId);
    }

}
