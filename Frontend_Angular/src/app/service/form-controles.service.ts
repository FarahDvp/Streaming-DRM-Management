import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormControlesService {

  constructor(private fb: FormBuilder, private fbAddMem: FormBuilder) { }

  formGroupLogin = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    blocked: ''
  });

  formGroupAddMem = this.fbAddMem.group({
    usernameMem: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    nameMem: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern('[a-zA-Z ]*')]],
    emailMem: ['', [Validators.required, Validators.email]],
    phoneMem: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern('[0-9]*')]],
    passwordMem: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],

  });

  /* add member controle */
  get nameMem() {
    return this.formGroupAddMem.get('nameMem');
  }
  get usernameMem() {
    return this.formGroupAddMem.get('usernameMem');
  }
  get emailMem() {
    return this.formGroupAddMem.get('emailMem');
  }
  get phoneMem() {
    return this.formGroupAddMem.get('phoneMem');
  }
  get passwordMem() {
    return this.formGroupAddMem.get('passwordMem');
  }

  /* login controle */
  get username() {
    return this.formGroupLogin.get('username');
  }
  get password() {
    return this.formGroupLogin.get('password');
  }

  get blocked() {
    return this.formGroupLogin.get('blocked');
  }

}
