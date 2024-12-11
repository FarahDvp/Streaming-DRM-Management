import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServerService } from '../../service/security/auth-server.service';
import { Register } from '../../model/register';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControlesService } from '../../service/form-controles.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  member: Register = new Register();
  constructor(public formService: FormControlesService,
    private router: Router,
    private authService: AuthServerService,
  ) { }
  ngOnInit(): void {
  }
  goToLogin() {
    this.formService.formGroupAddMem.reset();
    this.router.navigate(['/register2']);
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

  onClear() {
    this.member = new Register();
    this.formService.formGroupAddMem.reset();
  }

  onSubmit() {
    if (this.formService.formGroupAddMem.valid) {
      console.log('form submitted');
      this.member.username = this.formService.usernameMem?.value;
      this.member.fullname = this.formService.nameMem?.value;
      this.member.email = this.formService.emailMem?.value;
      this.member.password = this.formService.passwordMem?.value;
      this.member.phone = this.formService.phoneMem?.value;
      this.member.role = "USER";
      console.log('user to add :', this.member);
      this.authService.register(this.member).subscribe(data => {
        console.log('data : ', data);
        this.member = new Register();
        setTimeout(() => {
          this.goToLogin();
        }, 1000);
      }, error => {
        console.log(error);
      })
    } else {
      console.log('invalid form');
      this.validateAllFormFields(this.formService.formGroupAddMem);
    }
  }

}