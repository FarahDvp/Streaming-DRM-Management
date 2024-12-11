import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServerService } from '../../service/security/auth-server.service';
import { Register } from '../../model/register';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControlesService } from '../../service/form-controles.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register3',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, CommonModule],
  templateUrl: './register3.component.html',
  styleUrl: './register3.component.css'
})
export class Register3Component {

  constructor() { }
  ngOnInit(): void {
  }

}
