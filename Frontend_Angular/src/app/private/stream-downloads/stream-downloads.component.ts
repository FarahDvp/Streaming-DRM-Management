import { Component, OnInit } from '@angular/core';
import Plyr from 'plyr';
import { DownloadService } from '../../service/download.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TopbarComponent } from '../shared/topbar/topbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VideoService } from '../../service/video.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stream-downloads',
  standalone: true,
  imports: [TopbarComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './stream-downloads.component.html',
  styleUrls: ['./stream-downloads.component.css']
})
export class StreamDownloadsComponent implements OnInit {
  public videos: any[] = []
  videosList: any[] = [];
  public taillePagination: number[] = [];
  public activePage: number = 0;
  public size: number = 9;
  downloadUrl: string | undefined;
  player: Plyr | undefined;
  videoDelete: any;

  constructor(private videoService: VideoService, private downloadService: DownloadService, private route: ActivatedRoute, private router: Router, private toastr: ToastrService) { }

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

  getAllVideos(page: number, size: number) {
    this.videosList = [];
    this.downloadService.getAllDownloadsByUser(page, size).subscribe(
      result => {
        console.log('Résultat de getAllVideos():', result);
        this.videosList = result.content;
        this.videos = result.content;

        const totalPages = Math.ceil(result.totalElements / size);
        this.taillePagination = Array.from({ length: totalPages }, (_, i) => i);

        // Nouvelle logique pour obtenir les noms des vidéos
        this.videosList.forEach((video, index) => {
          this.videoService.getVideoName(video.videoId).subscribe(
            videoName => {
              this.videosList[index].name = videoName;
              this.initializePlayer();
            },
            error => {
              console.log(`Erreur lors de la récupération du nom de la vidéo avec l'ID ${video.videoId}:`, error);
            }
          );
        });
      },
      error => {
        console.log(error);
      }
    );
  }

  private initializePlayer(): void {
    if (this.downloadUrl) {
      const videoElement = document.querySelector('.plyr__video-wrapper video') as HTMLElement;
      if (videoElement) {
        this.player = new Plyr(videoElement);
        this.player.source = {
          type: 'video',
          sources: [
            {
              src: this.downloadUrl,
              type: 'video/mp4'
            }
          ]
        };
      }
    }
  }


  deleteRow(event: any) {
    if (event.target && event.target.getAttribute('data-id')) {
      this.videoDelete = {
        id: event.target.getAttribute('data-id')
      };
    } else {
      console.error("La propriété 'id' n'est pas définie dans l'événement.");
    }
  }

  delete() {
    if (this.videoDelete && this.videoDelete.id) {

      this.downloadService.deleteDownloadedVideoForUser(this.videoDelete.id).subscribe(
        res => {
          this.toastr.success("This downloaded video has been deleted successfully.", "Success");
          this.router.navigate(['/downloads']);
        },
        err => {
          console.log(err);
        }
      );
      const element = document.getElementById("closeModalButton");
      if (element) {
        element.click();
      } else {
        console.error("L'élément avec l'ID 'closeModalButton' n'a pas été trouvé.");
      }

    } else {
      console.error("La propriété 'id' de videoDelete est undefined.");
    }
  }


  clearAllDownloads() {
    this.downloadService.clearAllDownloadsByUser().subscribe(() => {
      this.toastr.success("All downloaded videos cleared successfully.", "Success");
      this.router.navigate(['/downloads']);
    }, error => {
      console.error('Error clearing downloads:', error);
    });
    const element = document.getElementById("closeModal1Button");
    if (element) {
      element.click();
    } else {
      console.error("L'élément avec l'ID 'closeModal1Button' n'a pas été trouvé.");
    }
  }

}
