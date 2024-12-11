package com.tritux.vidsecure.service.impl;
import com.tritux.vidsecure.config.JwtService;
import com.tritux.vidsecure.dto.DownloadDTO;
import com.tritux.vidsecure.dto.ViewsTrackingDTO;
import com.tritux.vidsecure.exception.OverlayAlreadyExistsException;
import com.tritux.vidsecure.exception.ResourceNotFoundException;
import com.tritux.vidsecure.mapper.ViewsTrackingMapper;
import com.tritux.vidsecure.model.Download;
import com.tritux.vidsecure.model.ViewsTracking;
import com.tritux.vidsecure.model.Video;
import com.tritux.vidsecure.repository.ViewsTrackingRepository;
import com.tritux.vidsecure.repository.VideoRepository;
import com.tritux.vidsecure.service.MemberService;
import com.tritux.vidsecure.service.VideoService;
import com.tritux.vidsecure.service.ViewsTrackingService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ViewsTrackingServiceImpl implements ViewsTrackingService {
    @Autowired
    private ViewsTrackingRepository viewsTrackingRepository;
    @Autowired
    private ViewsTrackingMapper viewsTrackingMapper;
    @Autowired
    private VideoRepository videoRepository;
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private  JwtService jwtService;
    public ViewsTrackingServiceImpl(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    @Autowired
    public ViewsTrackingServiceImpl(ViewsTrackingRepository ViewsRepository, VideoRepository videoRepository) {
        this.viewsTrackingRepository = ViewsRepository;
        this.videoRepository = videoRepository;
    }

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
    public ViewsTracking addViewToVideo(String videoId, ViewsTrackingDTO viewsTrackingDTO) {
        Video video = videoRepository.findByReference(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id " + videoId));

        String userId = viewsTrackingDTO.getUserId();

        boolean viewsExists = viewsTrackingRepository.existsByVideoIdAndUserId(videoId, userId);
        if (viewsExists) {
            ViewsTracking existingView = viewsTrackingRepository.findByVideoIdAndUserId(videoId, userId)
                    .orElseThrow(() -> new OverlayAlreadyExistsException("Overlay already exists for video with id " + videoId + " and userId: " + userId));

            existingView.setDeletedForUser(false);
            existingView.setDate(LocalDateTime.now());
            viewsTrackingRepository.save(existingView);

            throw new OverlayAlreadyExistsException("Overlay already exists for video with id " + videoId + " and userId: " + userId);
        }

        ViewsTracking view = new ViewsTracking();
        view.setUserId(userId);
        view.setVideoId(video.getReference());
        view.setDate(LocalDateTime.now());
        view = viewsTrackingRepository.save(view);

        return view;
    }
    @Override
    public Page<ViewsTrackingDTO> getViewsVideosPageable(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<ViewsTracking> viewsTrackingPage = viewsTrackingRepository.findAllByAdmin(pr);

        return viewsTrackingPage.map(viewsTrackingMapper::toDto);
    }
    @Override
    public Page<ViewsTrackingDTO> getViewsVideosPageableByUser(int page, int size) {
        String userId = getCurrentUserUid(request);
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<ViewsTracking> viewsTrackingPage = viewsTrackingRepository.findAllByUserId(userId, pr);

        return viewsTrackingPage.map(viewsTrackingMapper::toDto);
    }
    @Override
    public long calculateViewsByVideoId(String videoId) {
        return viewsTrackingRepository.countByVideoId(videoId);
    }
    @Override
    public void deleteViewForAdmin(Long id) {
        Optional<ViewsTracking> optionalView = viewsTrackingRepository.findById(id);
        if (optionalView.isPresent()) {
            ViewsTracking view = optionalView.get();
            viewsTrackingRepository.delete(view);
            view.setDeletedForAdmin(true);
            viewsTrackingRepository.save(view);
        } else {
            throw new NoSuchElementException("Video with reference " + id + " not found");
        }
    }
    @Override
    public void deleteViewForUser(Long id) {
        Optional<ViewsTracking> optionalV = viewsTrackingRepository.findById(id);
        if (optionalV.isPresent()) {
            ViewsTracking vt = optionalV.get();
            viewsTrackingRepository.delete(vt);
            vt.setDeletedForUser(true);
            viewsTrackingRepository.save(vt);
        } else {
            throw new NoSuchElementException("View with id " + id + " not found");
        }
    }
    @Override
    public void deleteViewsByDateAndUser(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        String userId = getCurrentUserUid(request);

        List<ViewsTracking> views = viewsTrackingRepository.findByUserIdAndDateBetween(userId, startOfDay, endOfDay);

        for (ViewsTracking vt : views) {
            vt.setDeletedForUser(true);
        }

        viewsTrackingRepository.saveAll(views);
    }
    @Override
    public void clearAllViewsForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<ViewsTracking> viewsToClear = viewsTrackingRepository.findAllByAdmin(pageable);

        List<Long> idsToClear = viewsToClear.stream()
                .map(ViewsTracking::getId)
                .collect(Collectors.toList());
        if (!idsToClear.isEmpty()) {
            viewsTrackingRepository.markDeletedForAdminByIds(idsToClear);
        }
    }
    @Override
    public void clearAllViewsByUser(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        String userId = getCurrentUserUid(request);
        Page<ViewsTracking> viewsToClear = viewsTrackingRepository.findAllByUserId(userId,pageable);

        List<Long> idsToClear = viewsToClear.stream()
                .map(ViewsTracking::getId)
                .collect(Collectors.toList());
        if (!idsToClear.isEmpty()) {
            viewsTrackingRepository.markDeletedForUserByIds(idsToClear);
        }
    }

}
