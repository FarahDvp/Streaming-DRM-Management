import { Component, ElementRef, ViewChild } from '@angular/core';
import { TopbarComponent } from '../shared/topbar/topbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService } from '../../service/video.service';
import { TokenStorageService } from '../../service/security/token-storage.service';
import { OverlayService } from '../../service/overlay.service';
import { DownloadService } from '../../service/download.service';
import { ToastrService } from 'ngx-toastr';

declare let shaka: any;

@Component({
  selector: 'app-stream-details',
  standalone: true,
  imports: [TopbarComponent],
  templateUrl: './stream-details.component.html',
  styleUrl: './stream-details.component.css'
})
export class StreamDetailsComponent {
  video: any;
  videosList: any[] = [];
  player: any;

  constructor(private route: ActivatedRoute, private videoService: VideoService, private downloadService: DownloadService, private tokenService: TokenStorageService, private overlayService: OverlayService, private router: Router, private toastr: ToastrService) {

  }

  ngOnInit(): void {
    let idVideo = this.route.snapshot.params['id'];
    console.log(idVideo);
    this.videoService.getOneVideo(idVideo).subscribe(
      res => {
        this.video = res;
        this.loadVideo(this.video.videoDashUrlWithInjection);
      },
      err => {
        console.log(err);
      }

    )
  }

  @ViewChild('videoPlayer') videoElementRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainerRef!: ElementRef<HTMLDivElement>;


  loadVideo(videoDashUrlsWithInjection: string[]): void {
    shaka.polyfill.installAll();
    if (shaka.Player.isBrowserSupported()) {

      const videoElement = this.videoElementRef.nativeElement;
      const videoContainer = this.videoContainerRef.nativeElement;

      this.player = new shaka.Player(videoElement);
      const ui = new shaka.ui.Overlay(this.player, videoContainer, videoElement);

      let isPlaying = false;
      let userIdSaved = false;

      const addViews = () => {
        const userId = this.tokenService.getUid();
        if (userId) {
          if (!userIdSaved) {
            userIdSaved = true;
            this.overlayService.saveView(this.video.reference, userId).subscribe(
              response => {
                console.log('View enregistré avec succès dans la base de données :', response);
              },
              error => {
                console.error('Erreur lors de l\'enregistrement de view dans la base de données :', error);
              }
            );
          }
        } else {
          console.error('Impossible de récupérer l\'ID utilisateur.');
        }
      }

      const userId = this.tokenService.getUid();
      videoDashUrlsWithInjection.forEach(videoDashUrlWithInjection => {
        if (typeof userId === 'string' && videoDashUrlWithInjection.includes(userId)) {
          this.player.load(videoDashUrlWithInjection)
            .then(() => {
              console.log('Video loaded successfully');

              this.videoContainerRef.nativeElement.addEventListener('click', () => {
                console.log('Clic détecté sur l\'élément vidéo');
                if (isPlaying) {
                  this.videoElementRef?.nativeElement?.pause();
                  isPlaying = false;
                } else {
                  this.videoElementRef?.nativeElement?.play();
                  isPlaying = true;
                }
                addViews();
              });

              const playButton = document.querySelector('.shaka-controls-button-panel');
              if (playButton) {
                playButton.addEventListener('click', () => {
                  console.log('Clic détecté sur le bouton de lecture');
                  if (isPlaying) {
                    this.videoElementRef?.nativeElement?.pause();
                    isPlaying = false;
                  } else {
                    this.videoElementRef?.nativeElement?.play();
                    isPlaying = true;
                  }
                  addViews();
                });
              } else {
                console.error("Impossible de trouver l'élément du bouton de lecture dans les contrôles inférieurs de Shaka Player.");
              }
            })
            .catch((error: any) => {
              console.error("Erreur lors du chargement de la vidéo :", error);
            });
        }
      });


    }
  }


  download(videoId: any) {
    this.downloadService.saveDownloadedVideo(videoId).subscribe(
      response => {
        const blob = new Blob([response], { type: 'video/mp4' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        this.toastr.success("Video successfully downloaded.", "Success");
        this.router.navigate(['/downloads']);
      },
      error => {
        this.toastr.warning("This video already downloaded.", "Warning");
        console.error('Error downloading video:', error);
      }
    );
  }



}
