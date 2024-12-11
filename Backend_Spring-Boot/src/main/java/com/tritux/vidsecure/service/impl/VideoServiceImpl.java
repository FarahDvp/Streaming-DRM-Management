package com.tritux.vidsecure.service.impl;

import com.tritux.vidsecure.config.JwtService;
import com.tritux.vidsecure.dto.VideoDTO;
import com.tritux.vidsecure.mapper.VideoMapper;
import com.tritux.vidsecure.model.Video;
import com.tritux.vidsecure.repository.VideoRepository;
import com.tritux.vidsecure.service.VideoService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.*;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Stream;

@Service
public class VideoServiceImpl implements VideoService {
    @Autowired
    private VideoRepository videoRepository;
    @Autowired
    private VideoMapper videoMapper;
    @Autowired
    private HttpServletRequest request;
    @Autowired
    private final JwtService jwtService;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    private static final Logger logger = LoggerFactory.getLogger(VideoServiceImpl.class);
    public VideoServiceImpl(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    @Value("${video.upload.directory}")
    private String uploadDirectory;
    @Value("${video.upload.updated.directory}")
    private String uploadModifiedDirectory;
    @Value("${video.upload.encrypted.directory}")
    private String uploadEncryptedDirectory;
    @Value("${video.upload.uid.injection.directory}")
    private  String uploadEncryptedUidInjectionDirectory;
    @Value("${video.upload.downloads.directory}")
    private  String downloadDirectory;

    @Override
    public VideoDTO uploadVideo(MultipartFile file) throws IOException, InterruptedException {

        String ref = UUID.randomUUID().toString();
        String fileName = file.getOriginalFilename();
        String filePath = uploadDirectory + fileName;
        String outputVideoPathEncrypted = uploadEncryptedDirectory + fileName;

        int counter = 0;
        while (Files.exists(Path.of(filePath))) {
            counter++;
            assert fileName != null;
            String newName = getUniqueFileName(fileName);
            filePath = uploadDirectory + newName;
            outputVideoPathEncrypted = uploadEncryptedDirectory + newName;

        }
        Path targetPath = Path.of(filePath);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        ProcessBuilder processBuilderShaka = buildShakaPackagerProcess(filePath, outputVideoPathEncrypted);
        executeProcess(processBuilderShaka);

        Video video = new Video();
        video.setName(fileName);
        video.setReference(ref);
        video.setVideoUrl(filePath);
        video.setUploadDate(LocalDateTime.now());

        Path directoryPath = Paths.get(uploadEncryptedDirectory);
        String videoFileName = Files.list(directoryPath)
                .filter(path -> path.toString().endsWith(".mpd"))
                .min((f1, f2) -> Long.compare(f2.toFile().lastModified(), f1.toFile().lastModified()))
                .map(Path::getFileName)
                .map(Path::toString)
                .orElse(null);
        if (videoFileName != null) {
            String videoBaseUrl = "http://127.0.0.1:8080/api/videos/dash-videos/";
            String videoDashUrl = videoBaseUrl + videoFileName;
            video.setVideoDashUrl(videoDashUrl);
        } else {
            video.setVideoDashUrl(null);
        }

        video = videoRepository.save(video);

        String message = "A new video is now available: " + video.getName();
        rabbitTemplate.convertAndSend("notificationQueue", message);

        return videoMapper.toDto(video);
    }
    private String getUniqueFileName(String fileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String extension = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".")) : "";
        return timestamp + extension;
    }
    private String removeExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            return fileName.substring(0, dotIndex);
        }
        return fileName;
    }

    /*private ProcessBuilder buildFFmpegProcess(String filePath, String currentUserUid, String videoOutputPath) {
        return new ProcessBuilder(
                "C:\\Program Files\\ffmpeg-6.1.1-essentials_build\\ffmpeg-6.1.1-essentials_build\\bin\\ffmpeg",
                "-i", filePath,
                "-filter_complex", "[0:v]drawtext=text='" + currentUserUid + "':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=16:fontcolor=yellow, " +
                "drawtext=text='" + currentUserUid + "':x=(w-text_w)/10:y=(h-text_h)/10:fontsize=16:fontcolor=yellow, " +
                "drawtext=text='" + currentUserUid + "':x=(w-text_w)/10:y=(h-text_h)*9/10:fontsize=16:fontcolor=yellow, " +
                "drawtext=text='" + currentUserUid + "':x=(w-text_w)*9/10:y=(h-text_h)/10:fontsize=16:fontcolor=yellow, " +
                "drawtext=text='" + currentUserUid + "':x=(w-text_w)*9/10:y=(h-text_h)*9/10:fontsize=16:fontcolor=yellow",
                "-c:a", "copy",
                videoOutputPath
        ).redirectErrorStream(true);
    }*/

    private int getVideoHeight(String videoResolution) {
        String[] parts = videoResolution.split("x");
        return Integer.parseInt(parts[1]);
    }
    private int getVideoWidth(String videoResolution) {
        String[] parts = videoResolution.split("x");
        return Integer.parseInt(parts[0]);
    }
    private ProcessBuilder buildFFmpegProcess(String filePath, String currentUserUid, String videoOutputPath) throws IOException, InterruptedException {
        String videoResolution = extractVideoResolution(filePath);
        int videoWidth = getVideoWidth(videoResolution);
        int videoHeight = getVideoHeight(videoResolution);

        StringBuilder filterComplex = new StringBuilder();
        filterComplex.append("[0:v]");

        int startY = 0;
        int fontSize = 16;
        String fontColor = "yellow";

        int partLength = currentUserUid.length() / 3;

        int lineHeight = videoHeight / 3;
        int startX = 0;

        for (int i = 0; i < 3; i++) {
            String part = currentUserUid.substring(i * partLength, (i + 1) * partLength);
            appendText(filterComplex, part, startX, startY + i * lineHeight, fontSize, fontColor, videoWidth, lineHeight);
        }

        filterComplex.delete(filterComplex.length() - 2, filterComplex.length());

        filterComplex.append(";");

        return new ProcessBuilder(
                "ffmpeg",
                "-i", filePath,
                "-filter_complex", filterComplex.toString(),
                "-c:a", "copy",
                videoOutputPath
        ).redirectErrorStream(true);
    }
    private void appendText(StringBuilder filterComplex, String text, int startX, int startY, int fontSize, String fontColor, int videoWidth, int lineHeight) {
        int totalCharacters = text.length();
        int characterWidth = videoWidth / totalCharacters;

        int currentX = startX;

        for (int i = 0; i < totalCharacters; i++) {
            filterComplex.append("drawtext=text='");
            filterComplex.append(text.charAt(i));
            filterComplex.append("':x=");
            filterComplex.append(currentX);
            filterComplex.append(":y=");
            filterComplex.append(startY);
            filterComplex.append(":fontsize=");
            filterComplex.append(fontSize);
            filterComplex.append(":fontcolor=");
            filterComplex.append(fontColor);
            filterComplex.append(", ");

            currentX += characterWidth;
        }
    }
    private ProcessBuilder buildShakaPackagerProcess(String inputVideoPath, String outputVideoPath) {

        String videoOutputPath = outputVideoPath + "_video";
        String audioOutputPath = outputVideoPath + "_audio";
        String videoDescriptor = "in=" + inputVideoPath + ",stream=video,segment_template=" + videoOutputPath + "_$Number$.mp4,init_segment=" + videoOutputPath + "_init.mp4";
        String audioDescriptor = "in=" + inputVideoPath + ",stream=audio,segment_template=" + audioOutputPath + "_$Number$.mp4,init_segment=" + audioOutputPath + "_init.mp4";

        String outputWithoutExtension = removeExtension(outputVideoPath);

        return new ProcessBuilder(
                "packager",
                videoDescriptor,
                audioDescriptor,
                "--generate_static_live_mpd",
                "--mpd_output", outputWithoutExtension + ".mpd"
        ).redirectErrorStream(true);
    }
    private static void executeProcess(ProcessBuilder processBuilder) throws IOException {
        try {
            Process process = processBuilder.start();
            InputStream inputStream = process.getInputStream();
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                logger.info(line);
            }
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                logger.info("Process completed successfully.");
            } else {
                logger.error("Process failed with error code: {}", exitCode);
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Error executing process", e);
        }
    }
    private void displayVideoInfo(String videoPath, String videoType) throws IOException, InterruptedException {
        String[] cmd = {"ffmpeg", "-i", videoPath};

        ProcessBuilder processBuilder = new ProcessBuilder(cmd);
        Process process = processBuilder.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.contains("Stream") && line.contains("Video")) {
                logger.info("{} Video Info: {}", videoType, line.trim());
            }
        }
        process.waitFor();
    }
    private String  extractVideoResolution(String videoPath) throws IOException, InterruptedException {
        String[] cmd = {"ffmpeg", "-i", videoPath};
        ProcessBuilder processBuilder = new ProcessBuilder(cmd);
        Process process = processBuilder.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        String line;
        String resolution = "";
        while ((line = reader.readLine()) != null) {
            if (line.contains("Stream") && line.contains("Video")) {
                String[] parts = line.split(",");
                if (parts.length >= 5) {
                    String resolutionInfo = parts[4].trim();
                    String[] resolutionParts = resolutionInfo.split(" ");
                    resolution = resolutionParts[0];
                    break;
                }
            }
        }
        process.waitFor();
        return resolution;
    }

    @Override
    public ResponseEntity<?> getDashVideoResponse(String fileName) {
        try {
            Path encryptedFilePath = Paths.get(uploadEncryptedDirectory).resolve(fileName);

            Resource encryptedResource = new UrlResource(encryptedFilePath.toUri());

             if (encryptedResource.exists() && encryptedResource.isReadable()) {
                return createResponseEntity(encryptedResource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @Override
    public ResponseEntity<?> getDashVideoWithInjectionResponse(String fileName) {
        try {
            Path encryptedFilePath = Paths.get(uploadEncryptedUidInjectionDirectory).resolve(fileName);

            Resource encryptedResource = new UrlResource(encryptedFilePath.toUri());

            if (encryptedResource.exists() && encryptedResource.isReadable()) {
                return createResponseEntity(encryptedResource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    private ResponseEntity<?> createResponseEntity(Resource resource) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"");
        headers.add(HttpHeaders.CONTENT_TYPE, "text/xml"); // Définir le type MIME
        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }
    @Override
    public Page<VideoDTO> getVideosPageable(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uploadDate"));
        Page<Video> videoPage = videoRepository.findAll(pr);

        return videoPage.map(videoMapper::toDto);
    }
    @Override
    public Page<VideoDTO> getVideosWithInjectionUserID(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uploadDate"));
        Page<Video> videoPage = videoRepository.findAll(pr);

        String currentUserUid = getCurrentUserUid(request);

        videoPage.forEach(video -> {
            String filePath = video.getVideoUrl();
            String fileName = Paths.get(filePath).getFileName().toString();
            String videoOutputPath = uploadModifiedDirectory + currentUserUid + "_" + fileName;
            String outputVideoPathEncrypted = uploadEncryptedUidInjectionDirectory + currentUserUid + "_" + fileName;

            boolean isUidInjected = isUidInjected(videoOutputPath,currentUserUid);
            if (!isUidInjected) {
                ProcessBuilder processBuilder;
                try {
                    processBuilder = buildFFmpegProcess(filePath, currentUserUid, videoOutputPath);
                    executeProcess(processBuilder);

                    logger.info("Input Video Info (Resolution, Bitrate, Video Codec, Frame Rate (FPS), Color Format) :");
                    displayVideoInfo(filePath, " ---> Input");
                    logger.info("Output Video Info (Resolution, Bitrate, Video Codec, Frame Rate (FPS), Color Format) :");
                    displayVideoInfo(videoOutputPath, " ---> Output");
                    logger.info("Resolution (Resolution Video) :");
                    String videoResolution = extractVideoResolution(filePath);
                    System.out.println("Resolution de la vidéo : " + videoResolution);
                    int width = getVideoWidth(videoResolution);
                    System.out.println("Width de la vidéo : " + width);
                    int height = getVideoHeight(videoResolution);
                    System.out.println("Height de la vidéo : " + height);

                    ProcessBuilder processBuilderShaka = buildShakaPackagerProcess(videoOutputPath, outputVideoPathEncrypted);
                    executeProcess(processBuilderShaka);

                    Path directoryPath = Paths.get(uploadEncryptedUidInjectionDirectory);
                    String videoFileName = Files.list(directoryPath)
                            .filter(path -> path.getFileName().toString().startsWith(currentUserUid) && path.toString().endsWith(".mpd"))
                            .min((f1, f2) -> Long.compare(f2.toFile().lastModified(), f1.toFile().lastModified()))
                            .map(Path::getFileName)
                            .map(Path::toString)
                            .orElse(null);

                    if (videoFileName != null) {
                        String videoBaseUrl = "http://127.0.0.1:8080/api/videos/dash-videos-with-injection/";
                        String videoDashUrlWithInjection = videoBaseUrl + videoFileName;
                        Set<String> videoDashUrlWithInjectionSet = new HashSet<>();

                        videoDashUrlWithInjectionSet.add(videoDashUrlWithInjection);
                        if (video.getVideoDashUrlWithInjection() != null) {
                            videoDashUrlWithInjectionSet.addAll(video.getVideoDashUrlWithInjection());
                        }
                        video.setVideoDashUrlWithInjection(videoDashUrlWithInjectionSet);

                    } else {
                        video.setVideoDashUrlWithInjection(null);
                    }
                    videoRepository.save(video);


                } catch (IOException | InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        return videoPage.map(videoMapper::toDto);
    }
    private boolean isUidInjected(String videoOutputPath, String currentUserUid) {
        Path directoryPath = Paths.get(videoOutputPath).getParent();
        String videoFileName = Paths.get(videoOutputPath).getFileName().toString();
        try (Stream<Path> paths = Files.list(directoryPath)) {
            return paths.anyMatch(path -> path.getFileName().toString().equals(videoFileName) && videoFileName.contains(currentUserUid));
        }
        catch (IOException e) {
            logger.error("Error while checking UID injection:", e);
            return false;
        }
    }
    @Override
    public VideoDTO getOne(String reference) {
        Optional<Video> optionalVideo = videoRepository.findByReference(reference);
        if (optionalVideo.isPresent()) {
            Video video = optionalVideo.get();
            return videoMapper.toDto(video);
        } else {
            throw new NoSuchElementException("Video with ID " + reference + " not found");
        }
    }
    @Override
    public VideoDTO updateVideo(String reference, VideoDTO videoDTO) {
        Optional<Video> optionalVideo = videoRepository.findByReference(reference);
        if (optionalVideo.isPresent()) {
            Video existingVideo = optionalVideo.get();
            existingVideo.setName(videoDTO.getName());
            Video updatedVideo = videoRepository.save(existingVideo);
            return videoMapper.toDto(updatedVideo);
        } else {
            throw new NoSuchElementException("Video with ID " + reference + " not found");
        }
    }
    @Override
    public void deleteVideo(String reference) {
        Optional<Video> optionalVideo = videoRepository.findByReference(reference);
        if (optionalVideo.isPresent()) {
            Video video = optionalVideo.get();
            videoRepository.delete(video);
        } else {
            throw new NoSuchElementException("Video with reference " + reference + " not found");
        }
    }
    @Override
    public void removeVideo(Long id) {
        Optional<Video> optionalVideo = videoRepository.findById(id);
        if (optionalVideo.isPresent()) {
            Video video = optionalVideo.get();
            videoRepository.delete(video);
        } else {
            throw new NoSuchElementException("Video with reference " + id + " not found");
        }
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


}
