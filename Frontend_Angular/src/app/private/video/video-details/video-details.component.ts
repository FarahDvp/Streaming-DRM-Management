import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService } from '../../../service/video.service';
import { Video } from '../../../model/video';
import { CommonModule } from '@angular/common';

declare let shaka: any;

@Component({
  selector: 'app-video-details',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './video-details.component.html',
  styleUrl: './video-details.component.css'
})

export class VideoDetailsComponent implements OnInit {

  public videosUpdateForm: FormGroup;
  video: any;
  videoDelete: any;
  videosList: any[] = [];
  player: any;

  constructor(builder: FormBuilder, private http: HttpClient, private router: Router, private route: ActivatedRoute, private videoService: VideoService) {
    let videosUpdateControls = {
      name: new FormControl(""),
      reference: new FormControl(""),
      videoDashUrl: new FormControl("")
    }
    this.videosUpdateForm = builder.group(videosUpdateControls)
  }

  get name() { return this.videosUpdateForm.get('name') }
  get reference() { return this.videosUpdateForm.get('reference') }
  get videoDashUrl() { return this.videosUpdateForm.get('videoDashUrl') }

  ngOnInit(): void {
    let idVideo = this.route.snapshot.params['id'];
    console.log(idVideo);
    this.videoService.getOneVideo(idVideo).subscribe(
      res => {
        this.video = res;
        this.videosUpdateForm.patchValue({
          name: this.video.name,
          reference: this.video.reference,
          videoDashUrl: this.video.videoDashUrl
        });
        this.loadVideo(this.video.videoDashUrl);
      },
      err => {
        console.log(err);
      }

    )
  }

  @ViewChild('videoPlayer') videoElementRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainerRef!: ElementRef<HTMLDivElement>;

  loadVideo(videoDashUrl: string): void {
    shaka.polyfill.installAll();
    if (shaka.Player.isBrowserSupported()) {
      const videoElement = this.videoElementRef.nativeElement;
      const videoContainer = this.videoContainerRef.nativeElement;

      this.player = new shaka.Player(videoElement);
      const ui = new shaka.ui.Overlay(this.player, videoContainer, videoElement);

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
      this.player.configure(config);

      this.player.addEventListener('loaded', () => {
        console.log('Shaka Player is ready');
        this.videoElementRef.nativeElement.pause();
      });

      this.player.load(videoDashUrl)
        .then(() => {
          console.log('Video loaded successfully');
        })
        .catch((error: any) => {
          console.error("Erreur lors du chargement de la vidéo :", error);
        });

      videoElement.addEventListener('click', () => {
        if (this.player.isPaused()) {
          this.player.play();
        } else {
          this.player.pause();
        }
      });
    } else {
      console.error('Browser not supported!');
    }
  }


  updateVideo() {
    let data = this.videosUpdateForm.value;
    let video = new Video(data.id, data.name, data.reference, data.videoUrl, data.videoDashUrl, data.videoDashUrlWithInjection, data.uploadDate)
    this.videoService.updateVideo(video, video.reference).subscribe(
      res => {
        this.router.navigate(['/config-videos']);
      },
      error => {
        alert(JSON.stringify(error));
      }
    )
  }

  deleteRow(event: any) {
    if (event.target && event.target.getAttribute('data-reference')) {
      this.videoDelete = {
        reference: event.target.getAttribute('data-reference')
      };
    } else {
      console.error("La propriété 'reference' n'est pas définie dans l'événement.");
    }
  }

  delete() {
    if (this.videoDelete && this.videoDelete.reference) {

      this.videoService.deleteVideo(this.videoDelete.reference).subscribe(
        res => {
          this.router.navigate(['/config-videos']);
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
      console.error("La propriété 'reference' de videoDelete est undefined.");
    }
  }

}




