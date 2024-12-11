import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { FormsModule } from '@angular/forms';
import { VideoService } from '../../../service/video.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { OverlayService } from '../../../service/overlay.service';

declare let shaka: any;

@Component({
  selector: 'app-config-videos',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './config-videos.component.html',
  styleUrl: './config-videos.component.css'
})
export class ConfigVideosComponent implements OnInit {

  public videos: any[] = []
  videosList: any[] = [];
  public taillePagination: number[] = [];
  public activePage: number = 0;
  public size: number = 6;
  errorMessage: any;
  successMessage: any;
  selectedFile: File | undefined;
  uploadProgress: any;

  constructor(private videoService: VideoService, private route: ActivatedRoute, private overlayService: OverlayService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Page:', params['page']);
      console.log('Size:', params['size']);
      const page = params['page'] ? +params['page'] : 0;
      const size = params['size'] ? +params['size'] : this.size;
      this.getAllVideos(page, size);

    });
  }

  changePage(pageNumber: number) {
    this.activePage = pageNumber;
    this.getAllVideos(pageNumber, this.size);
  }


  @ViewChildren('videoPlayer') videoElementRefs!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChildren('videoContainer') videoContainerRefs!: QueryList<ElementRef<HTMLDivElement>>;

  getAllVideos(page: number, size: number) {
    this.videosList = [];
    this.videoService.getAllVideos(page, size).subscribe(
      result => {
        console.log('Résultat de getAllVideos():', result);
        this.videosList = result.content;
        this.videos = result.content;

        const totalPages = Math.ceil(result.totalElements / size);
        this.taillePagination = Array.from({ length: totalPages }, (_, i) => i);

        this.videosList.forEach((video, index) => {
          this.loadVideo(video.videoDashUrl, index);
          this.calculateViews();
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  loadVideo(videoDashUrl: string, index: number): void {
    setTimeout(() => {
      const videoElementRef = this.videoElementRefs.toArray()[index];
      const videoContainerRef = this.videoContainerRefs.toArray()[index];
      if (videoElementRef && videoContainerRef) {
        const videoElement = videoElementRef.nativeElement;
        const videoContainer = videoContainerRef.nativeElement;

        shaka.polyfill.installAll();
        if (shaka.Player.isBrowserSupported()) {
          const player = new shaka.Player(videoElement);
          const ui = new shaka.ui.Overlay(player, videoContainer, videoElement);

          const keyHex = '437db709bf58ff6587fc3257f5578ae5';
          const keyBytes = new Uint8Array(keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
          const keyBase64 = btoa(String.fromCharCode.apply(null, Array.from(keyBytes)));

          const config = {
            drm: {
              clearKeys: {
                '501afdfae70f4180931d58f507be78ed': keyBase64
              }
            }
          };

          player.configure(config);

          player.addEventListener('loaded', () => {
            console.log('Shaka Player is ready');
            videoElement.pause();
          });

          player.load(videoDashUrl)
            .then(() => {
              console.log('Video loaded successfully');
            })
            .catch((error: any) => {
              console.error("Erreur lors du chargement de la vidéo :", error);
            });

          videoElement.addEventListener('click', () => {
            if (player.isPaused()) {
              player.play();
            } else {
              player.pause();
            }
          });
        } else {
          console.error('Browser not supported!');
        }
      } else {
        console.error('Video player or container not found.');
      }
    }, 100);
  }

  upload() {
    if (this.selectedFile) {
      this.uploadProgress = 'indeterminate';
      this.videoService.uploadVideo(this.selectedFile).pipe(
        catchError((error) => {
          console.error('Upload error:', error);
          this.errorMessage = 'An error occurred while uploading the video.';
          this.uploadProgress = undefined;
          return throwError(error);
        }),
        finalize(() => {
          this.uploadProgress = undefined;
          this.successMessage = 'Video uploaded successfully.';
        })
      ).subscribe(
        (response) => {
          console.log('Upload successful:', response);
        }
      );
    } else {
      console.warn('No file selected.');
    }
  }

  onFileSelected(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const allowedExtensions = /(\.mp4|\.mkv|\.avi|\.webm)$/i;
      if (!allowedExtensions.exec(file.name)) {
        this.errorMessage = 'Invalid file format. Please select a video file.';
        this.selectedFile = undefined;
      } else {
        this.errorMessage = undefined;
        this.selectedFile = file;
      }
    }
  }


  calculateViews() {
    this.videosList.forEach(video => {
      this.overlayService.calculateViewsByVideoId(video.reference).subscribe(
        views => {
          video.views = views;
        },
        error => {
          console.error('Erreur lors du calcul des vues pour la vidéo', video.reference, ':', error);
        }
      );
    });
  }


}

