import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../service/security/token-storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  public isAdmin: Boolean | undefined
  public isUser: Boolean | undefined

  constructor(private tokenService: TokenStorageService) { }

  ngOnInit(): void {
    if (this.tokenService.getRole() == "USER") {
      this.isUser = true;
      this.isAdmin = false;
    }

    if (this.tokenService.getRole() == "ADMIN") {
      this.isUser = false;
      this.isAdmin = true;
    }
  }
}
