import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VideoService } from '../../service/video.service';
import { TopbarComponent } from '../shared/topbar/topbar.component';
import { TokenStorageService } from '../../service/security/token-storage.service';
import { OverlayService } from '../../service/overlay.service';

declare let shaka: any;

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [TopbarComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.css'
})
export class StreamComponent {
  public videos: any[] = []
  videosList: any[] = [];
  public taillePagination: number[] = [];
  public activePage: number = 0;
  public size: number = 6;
  uploadProgress: any;

  @ViewChildren('videoPlayer') videoElementRefs!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChildren('videoContainer') videoContainerRefs!: QueryList<ElementRef<HTMLDivElement>>;

  constructor(private videoService: VideoService, private route: ActivatedRoute, private tokenService: TokenStorageService, private overlayService: OverlayService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Page:', params['page']);
      console.log('Size:', params['size']);
      const page = params['page'] ? +params['page'] : 0;
      const size = params['size'] ? +params['size'] : this.size;
      this.uploadProgress = 'indeterminate';
      this.getAllVideos(page, size);
    });
  }

  changePage(pageNumber: number) {
    this.activePage = pageNumber;
    this.getAllVideos(pageNumber, this.size);
  }

  getAllVideos(page: number, size: number) {
    this.videosList = [];
    this.videoService.getAllVideosWithInjectionUserID(page, size).subscribe(
      result => {
        console.log('Résultat de getAllVideos():', result);
        this.videosList = result.content;
        this.videos = result.content;

        const totalPages = Math.ceil(result.totalElements / size);
        this.taillePagination = Array.from({ length: totalPages }, (_, i) => i);


        this.videosList.forEach((video, index) => {
          this.loadVideo(video.videoDashUrlWithInjection, index);
          this.calculateViews();
        });
      },
      error => {
        console.log(error);
      }
    );
  }


  loadVideo(videoDashUrlsWithInjection: string[], index: number): void {
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

          /*  // Charger chaque URL de vidéo avec injection séparément
           videoDashUrlsWithInjection.forEach(videoDashUrlWithInjection => {
             player.load(videoDashUrlWithInjection)
               .then(() => {
                 console.log('Video loaded successfully');
               })
               .catch((error: any) => {
                 console.error("Erreur lors du chargement de la vidéo :", error);
               });
           }); */

          const userId = this.tokenService.getUid();
          if (typeof userId === 'string') {
            let videoLoaded = false;
            videoDashUrlsWithInjection.forEach(videoDashUrlWithInjection => {
              if (videoDashUrlWithInjection.includes(userId)) {
                player.load(videoDashUrlWithInjection)
                  .then(() => {
                    console.log('Video loaded successfully');
                    videoLoaded = true;
                  })
                  .catch((error: any) => {
                    console.error("Erreur lors du chargement de la vidéo :", error);
                  });
              }
            });
            if (!videoLoaded) {
              console.error("Aucune vidéo correspondant à l'userId n'a été trouvée dans la liste.");
            }
          } else {
            console.error("L'ID utilisateur est invalide.");
          }


        } else {
          console.error('Browser not supported!');
        }
      } else {
        console.error('Video player or container not found.');
      }
    }, 10);
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


