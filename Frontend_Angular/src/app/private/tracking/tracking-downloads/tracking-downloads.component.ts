import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DownloadService } from '../../../service/download.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tracking-downloads',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './tracking-downloads.component.html',
  styleUrl: './tracking-downloads.component.css'
})
export class TrackingDownloadsComponent {
  public downloads: any[] = [];
  download: any;
  downloadDelete: any;
  downloadsList: any[] = [];
  public taillePagination: number[] = [];
  public activePage: number = 0;
  public size: number = 9;

  constructor(private downloadService: DownloadService, private route: ActivatedRoute, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Page:', params['page']);
      console.log('Size:', params['size']);
      const page = params['page'] ? +params['page'] : 0;
      const size = params['size'] ? +params['size'] : this.size;
      this.getAllDownloads(page, size);
    });
  }

  getAllDownloads(page: number, size: number) {
    this.downloadsList = [];
    this.downloadService.getAllDownloadsTracking(page, size).subscribe(
      result => {
        this.downloadsList = result.content;
        const totalPages = Math.ceil(result.totalElements / size);
        this.taillePagination = Array.from({ length: totalPages }, (_, i) => i);
      },
      error => {
        console.log(error);
      }
    );
  }

  changePage(pageNumber: number) {
    this.activePage = pageNumber;
    this.getAllDownloads(pageNumber, this.size);
  }






  deleteRow(event: any) {
    if (event.target && event.target.getAttribute('data-id')) {
      this.downloadDelete = {
        id: event.target.getAttribute('data-id')
      };
    } else {
      console.error("La propriété 'id' n'est pas définie dans l'événement.");
    }
  }

  delete() {
    if (this.downloadDelete && this.downloadDelete.id) {

      this.downloadService.deleteDownloadedVideo(this.downloadDelete.id).subscribe(
        res => {
          this.toastr.success("This downloaded video has been deleted successfully.", "Success");
          this.router.navigate(['/tracking-downloads']);
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
      console.error("La propriété 'id' de downloadDelete est undefined.");
    }
  }


  clearAllDownloads(page: number, size: number) {
    this.downloadService.clearAllDownloads(page, size).subscribe(() => {
      this.toastr.success("All downloaded videos cleared successfully.", "Success");
      this.router.navigate(['/tracking-downloads']);
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
