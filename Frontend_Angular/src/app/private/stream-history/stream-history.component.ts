import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { TopbarComponent } from '../shared/topbar/topbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OverlayService } from '../../service/overlay.service';
import { TokenStorageService } from '../../service/security/token-storage.service';
import { VideoService } from '../../service/video.service';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

declare let shaka: any;

@Component({
  selector: 'app-stream-history',
  standalone: true,
  imports: [TopbarComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './stream-history.component.html',
  styleUrl: './stream-history.component.css'
})
export class StreamHistoryComponent {
  public views: any[] = []
  viewsList: any[] = [];
  public taillePagination: number[] = [];
  public activePage: number = 0;
  public size: number = 10;
  viewDelete: any;

  @ViewChildren('videoPlayer') videoElementRefs!: QueryList<ElementRef<HTMLVideoElement>>;
  @ViewChildren('videoContainer') videoContainerRefs!: QueryList<ElementRef<HTMLDivElement>>;

  constructor(private videoService: VideoService, private route: ActivatedRoute, private tokenService: TokenStorageService, private overlayService: OverlayService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Page:', params['page']);
      console.log('Size:', params['size']);
      const page = params['page'] ? +params['page'] : 0;
      const size = params['size'] ? +params['size'] : this.size;
      this.getAllViews(page, size);
    });
  }

  changePage(pageNumber: number) {
    this.activePage = pageNumber;
    this.getAllViews(pageNumber, this.size);
  }

  getAllViews(page: number, size: number) {
    this.viewsList = [];
    this.overlayService.getAllViewsByUser(page, size).subscribe(
      result => {
        this.viewsList = result.content;
        this.views = result.content;

        const totalPages = Math.ceil(result.totalElements / size);
        this.taillePagination = Array.from({ length: totalPages }, (_, i) => i);

        this.viewsList.forEach((view, index) => {
          forkJoin({
            videoDashUrlWithInjection: this.videoService.getVideoDashUrls(view.videoId),
            videoName: this.videoService.getVideoName(view.videoId)
          }).subscribe(
            ({ videoDashUrlWithInjection, videoName }) => {
              this.viewsList[index].videoDashUrlWithInjection = videoDashUrlWithInjection;
              this.viewsList[index].name = videoName;
              this.loadVideo(videoDashUrlWithInjection, index);
            },
            error => {
              console.log(`Erreur lors de la récupération des informations de la vidéo avec l'ID ${view.videoId}:`, error);
            }
          );
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






  isNewDay(index: number): boolean {
    if (index === 0) return true;
    const currentDay = this.getDay(this.viewsList[index].date);
    const previousDay = this.getDay(this.viewsList[index - 1].date);
    return currentDay !== previousDay;
  }

  getDay(date: Date): string {
    const viewDate = new Date(date);

    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      return `${year}-${month}-${day}`;
    };

    return formatDate(viewDate);
  }

  getDisplayDate(date: Date): string {
    const today = new Date();
    const viewDate = new Date(date);

    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();
      return `${year}-${month}-${day}`;
    };

    if (viewDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return formatDate(viewDate);
  }

  deleteViewsByDay(date: string) {
    const formattedDate = date === 'Today' ? this.getDay(new Date()) : date;

    this.overlayService.deleteViewsByDay(formattedDate).subscribe(response => {
      this.viewsList = this.viewsList.filter(view => this.getDisplayDate(view.date) !== date);
    });
  }





  deleteRow(event: any) {
    const viewId = event.target.getAttribute('data-id');
    if (viewId) {
      this.overlayService.deleteViewForUser(viewId).subscribe(
        res => {
          this.toastr.success("This view has been deleted successfully.", "Success");
          this.router.navigate(['/history']);
        },
        err => {
          console.log(err);
        }
      );

    } else {
      console.error("La propriété 'id' n'est pas définie dans l'événement.");
    }
  }



  clearAllViews(page: number, size: number) {
    this.overlayService.clearAllViewsByUser(page, size).subscribe(() => {
      this.toastr.success("All views cleared successfully.", "Success");
      this.router.navigate(['/history']);
    }, error => {
      console.error('Error clearing views:', error);
    });
    const element = document.getElementById("closeModal1Button");
    if (element) {
      element.click();
    } else {
      console.error("L'élément avec l'ID 'closeModal1Button' n'a pas été trouvé.");
    }
  }




}
