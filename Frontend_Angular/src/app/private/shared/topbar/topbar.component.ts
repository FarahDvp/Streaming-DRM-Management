import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../service/security/token-storage.service';
import { DownloadService } from '../../../service/download.service';
import { WebSocketService } from '../../../service/WebSocket/web-socket.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {

  currentUser: any;
  downloadsCount: number = 0;

  private notificationsSubscription!: Subscription;
  private paymentNotificationsSubscription!: Subscription;
  notification: any;
  payment_notification: any;

  clicked: boolean = false;

  public isAdmin: Boolean | undefined
  public isUser: Boolean | undefined

  constructor(private tokenService: TokenStorageService, private route: ActivatedRoute, private downloadService: DownloadService, private webSocketService: WebSocketService) { }

  ngOnInit(): void {
    this.getCurrentUser();

    if (this.tokenService.getRole() == "USER") {
      this.isUser = true;
      this.isAdmin = false;
    }

    if (this.tokenService.getRole() == "ADMIN") {
      this.isUser = false;
      this.isAdmin = true;
    }

    this.webSocketService.connect();
    this.notificationsSubscription = this.webSocketService.notifications$.subscribe(notifications => {
      console.log('Notifications:', notifications);
      if (notifications.length > 0) {
        this.notification = notifications[notifications.length - 1];
      }
    });

    this.paymentNotificationsSubscription = this.webSocketService.paymentNotifications$.subscribe(notifications => {
      console.log('Payment Notifications:', notifications);
      if (notifications.length > 0) {
        this.payment_notification = notifications[0];
      }
    });

  }

  ngOnDestroy(): void {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    if (this.paymentNotificationsSubscription) {
      this.paymentNotificationsSubscription.unsubscribe();
    }
  }

  /* ngOnInit(): void {
    this.getCurrentUser();

    this.webSocketService.connect();
    this.notification = this.webSocketService.getNotifications()[0];
    this.cdr.detectChanges();
  } */

  getCurrentUser(): void {
    this.currentUser = this.tokenService.getCurrentUserDetails();
    this.calculateDownloads()
    console.log('role admin:', this.currentUser.role);
  }

  calculateDownloads() {
    if (this.currentUser && this.currentUser.uid) {
      this.downloadService.calculateDownloadsByUserId(this.currentUser.uid).subscribe(
        downloads => {
          this.downloadsCount = downloads;
          console.log('Nombre de téléchargements:', this.downloadsCount);
        },
        error => {
          console.error('Erreur lors du calcul des téléchargements pour l\'utilisateur', this.currentUser.uid, ':', error);
        }
      );
    } else {
      console.error('Utilisateur non trouvé ou ID utilisateur non défini');
    }
  }


}
