import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Login } from '../../model/login';
import { FormControlesService } from '../../service/form-controles.service';
import { AuthServerService } from '../../service/security/auth-server.service';
import { TokenStorageService } from '../../service/security/token-storage.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../service/WebSocket/web-socket.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  role = this.tokenStorage.getRole();
  login: Login = new Login();
  showsuccessmessage: boolean = false;
  showerrormessage: boolean = false;
  constructor(public formService: FormControlesService,
    private router: Router,
    private authService: AuthServerService,
    private tokenStorage: TokenStorageService, private webSocketService: WebSocketService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.showsuccessmessage = false;
    this.showerrormessage = false;
    this.webSocketService.connect();
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  async onSubmit() {
    if (this.formService.formGroupLogin.valid) {
      this.login.username = this.formService.formGroupLogin.value.username;
      this.login.password = this.formService.formGroupLogin.value.password;

      console.log('login :', this.login);


      this.authService.login(this.login).subscribe(
        (data: any) => {
          console.log('data :', data);
          this.showerrormessage = false;
          this.showsuccessmessage = true;
          this.tokenStorage.savedata(data);

          if (data.msg === 'User is blocked' && data.access_token === null) {
            this.router.navigateByUrl('blocked-user');
          } else {
            if (localStorage.getItem('role-user') === 'USER') {
              console.log('role user:', data.role);
              this.toastr.success("You have logged in successfully.", "Success");
              this.router.navigateByUrl('stream');
            } else if (localStorage.getItem('role-user') === 'ADMIN') {
              console.log('role admin:', data.role);
              this.toastr.success("You have logged in successfully.", "Success");
              this.router.navigateByUrl('profile');
            }
          }

          this.onClear();
        },
        (error) => {
          console.log('error :', error);
          this.showerrormessage = true;
          this.showsuccessmessage = false;
          setTimeout(() => {
            this.showerrormessage = false;
          }, 2000);
        }
      );


    } else {
      this.validateAllFormFields(this.formService.formGroupLogin);
    }
  }

  onClear() {
    this.formService.formGroupLogin.reset();
  }

}
