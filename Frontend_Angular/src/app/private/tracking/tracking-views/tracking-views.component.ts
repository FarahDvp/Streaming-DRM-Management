import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OverlayService } from '../../../service/overlay.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tracking-views',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './tracking-views.component.html',
  styleUrl: './tracking-views.component.css'
})
export class TrackingViewsComponent {

  public overlays: any[] = [];
  overlay: any;
  overlayDelete: any;
  overlaysList: any[] = [];
  public taillePagination: number[] = [];
  public activePage: number = 0;
  public size: number = 10;

  constructor(private overlayService: OverlayService, private route: ActivatedRoute, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Page:', params['page']);
      console.log('Size:', params['size']);
      const page = params['page'] ? +params['page'] : 0;
      const size = params['size'] ? +params['size'] : this.size;
      this.getAllViews(page, size);
    });
  }

  getAllViews(page: number, size: number) {
    this.overlaysList = [];
    this.overlayService.getAllViewsTracking(page, size).subscribe(
      result => {
        this.overlaysList = result.content;
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
    this.getAllViews(pageNumber, this.size);
  }






  deleteRow(event: any) {
    if (event.target && event.target.getAttribute('data-id')) {
      this.overlayDelete = {
        id: event.target.getAttribute('data-id')
      };
    } else {
      console.error("La propriété 'id' n'est pas définie dans l'événement.");
    }
  }

  delete() {
    if (this.overlayDelete && this.overlayDelete.id) {

      this.overlayService.deleteViewForAdmin(this.overlayDelete.id).subscribe(
        res => {
          this.toastr.success("This view has been deleted successfully.", "Success");
          this.router.navigate(['/tracking-views']);
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
      console.error("La propriété 'id' de overlayDelete est undefined.");
    }
  }


  clearAllViews(page: number, size: number) {
    this.overlayService.clearAllViewsForAdmin(page, size).subscribe(() => {
      this.toastr.success("All views cleared successfully.", "Success");
      this.router.navigate(['/tracking-views']);
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
