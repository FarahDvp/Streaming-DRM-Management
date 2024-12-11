import { Component } from '@angular/core';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../shared/topbar/topbar.component';
import { TokenStorageService } from '../../service/security/token-storage.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  currentUser: any;

  constructor(private tokenService: TokenStorageService) { }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    this.currentUser = this.tokenService.getCurrentUserDetails();
    console.log('role admin:', this.currentUser.role);
  }

}
