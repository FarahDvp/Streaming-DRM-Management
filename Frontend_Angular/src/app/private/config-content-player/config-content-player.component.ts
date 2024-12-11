import { Component } from '@angular/core';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../shared/topbar/topbar.component';

@Component({
  selector: 'app-config-content-player',
  standalone: true,
  imports: [SidebarComponent, TopbarComponent],
  templateUrl: './config-content-player.component.html',
  styleUrl: './config-content-player.component.css'
})
export class ConfigContentPlayerComponent {

}
