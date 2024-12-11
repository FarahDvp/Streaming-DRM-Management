import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Login } from "../../model/login";
import { Register } from "../../model/register";
import { tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthServerService {

  private loginDetails: { username: string; password: string };

  constructor(private http: HttpClient) {
    this.loginDetails = { username: '', password: '' };
  }

  login(l: Login) {
    return this.http.post('http://localhost:8080/api/auth/authenticate', l).pipe(
      tap((response: any) => {
        this.loginDetails = { username: l.username, password: l.password };
      })
    );
  }

  register(u: Register) {
    return this.http.post('http://localhost:8080/api/auth/register', u);
  }

  getLoginDetails() {
    return this.loginDetails;
  }

}




