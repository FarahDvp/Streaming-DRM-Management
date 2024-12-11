import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../../../service/member.service';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { WebSocketService } from '../../../service/WebSocket/web-socket.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent {
  public users: any[] = [];
  user: any;
  userDelete: any;
  userBlock: any;
  userUnblock: any;
  usersList: any[] = [];
  blockedUsersList: any[] = [];
  public taillePagination: number[] = [];
  public activePage: number = 0;
  public size: number = 10;
  premierOngletActif: boolean = true;
  deuxiemeOngletActif: boolean = false;

  constructor(private userService: MemberService, private route: ActivatedRoute, private router: Router, private toastr: ToastrService, private webSocketService: WebSocketService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Page:', params['page']);
      console.log('Size:', params['size']);
      const page = params['page'] ? +params['page'] : 0;
      const size = params['size'] ? +params['size'] : this.size;
      if (this.premierOngletActif) {
        this.getAllUsers(page, size);
      } else {
        this.getAllBlockedUsers(page, size);
      }
    });
    this.webSocketService.connect();
  }

  activerPremierOnglet() {
    this.premierOngletActif = true;
    this.deuxiemeOngletActif = false;
    this.getAllUsers(0, 10);
  }

  activerDeuxiemeOnglet() {
    this.premierOngletActif = false;
    this.deuxiemeOngletActif = true;
    this.getAllBlockedUsers(0, 10);
  }

  getAllUsers(page: number, size: number) {
    this.usersList = [];
    this.userService.getAllActiveMembers(page, size).subscribe(
      result => {
        console.log('Résultat de getAllUsers():', result);
        this.usersList = result.content;
        const totalPages = Math.ceil(result.totalElements / size);
        this.taillePagination = Array.from({ length: totalPages }, (_, i) => i);
      },
      error => {
        console.log(error);
      }
    );
  }

  getAllBlockedUsers(page: number, size: number) {
    this.blockedUsersList = [];
    this.userService.getAllBlockedMembers(page, size).subscribe(
      result => {
        console.log('Résultat de getAllBlockedUsers():', result);
        this.blockedUsersList = result.content;
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
    if (this.premierOngletActif) {
      this.getAllUsers(pageNumber, this.size);
    } else {
      this.getAllBlockedUsers(pageNumber, this.size);
    }
  }


  deleteRow(event: any) {
    if (event.target && event.target.getAttribute('data-uid')) {
      this.userDelete = {
        uid: event.target.getAttribute('data-uid')
      };
    } else {
      console.error("La propriété 'uid' n'est pas définie dans l'événement.");
    }
  }

  delete() {
    if (this.userDelete && this.userDelete.uid) {

      this.userService.deleteMember(this.userDelete.uid).subscribe(
        res => {
          this.toastr.success("This user has been deleted successfully.", "Success");
          this.router.navigate(['/users-list']);
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
      console.error("La propriété 'uid' de userDelete est undefined.");
    }
  }

  blockRow(event: any) {
    if (event.target && event.target.getAttribute('data-id')) {
      this.userBlock = {
        uid: event.target.getAttribute('data-id')
      };
    } else {
      console.error("La propriété 'id' n'est pas définie dans l'événement.");
    }
  }

  unblockRow(event: any) {
    if (event.target && event.target.getAttribute('data-idi')) {
      this.userUnblock = {
        uid: event.target.getAttribute('data-idi')
      };
    } else {
      console.error("La propriété 'id' n'est pas définie dans l'événement.");
    }
  }

  block() {
    if (this.userBlock && this.userBlock.uid) {

      this.userService.blockMember(this.userBlock.uid).subscribe(
        res => {
          this.toastr.success("This user has been blocked successfully.", "Success");
        },
        err => {
          console.log(err);
        }
      );
      const element = document.getElementById("closeModalButton2");
      if (element) {
        element.click();
      } else {
        console.error("L'élément avec l'ID 'closeModalButton' n'a pas été trouvé.");
      }

    } else {
      console.error("La propriété 'uid' de userBlock est undefined.");
    }
  }


  unblock() {
    if (this.userUnblock && this.userUnblock.uid) {

      this.userService.unblockMember(this.userUnblock.uid).subscribe(
        res => {
          this.toastr.success("This user has been unblocked successfully.", "Success");
          this.router.navigate(['/users-list']);
        },
        err => {
          console.log(err);
        }
      );
      const element = document.getElementById("closeModalButton3");
      if (element) {
        element.click();
      } else {
        console.error("L'élément avec l'ID 'closeModalButton' n'a pas été trouvé.");
      }

    } else {
      console.error("La propriété 'uid' de userBlock est undefined.");
    }
  }



}
