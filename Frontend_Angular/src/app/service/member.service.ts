import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { Member } from '../model/member';
import { TokenStorageService } from './security/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private baseUrl = "http://localhost:8080/api/members/";
  private getOneMemberUrl = "http://localhost:8080/api/members/get_one/";
  private saveMemberUrl = "http://localhost:8080/api/members/save";
  private updateMemberUrl = "http://localhost:8080/api/members/update/";
  private deleteMemberUrl = "http://localhost:8080/api/members/delete/";


  constructor(private http: HttpClient, private tokenService: TokenStorageService) { }

  getAllMembers(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>("http://localhost:8080/api/members/all", { params });
  }

  getAllActiveMembers(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>("http://localhost:8080/api/members/active", { params });
  }

  getAllBlockedMembers(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>("http://localhost:8080/api/members/blocked", { params });
  }

  getOneMember(id: String) {
    return this.http.get<any>(this.getOneMemberUrl + id);
  }

  saveMember(member: Member) {
    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    };

    return this.http.post<any>(this.saveMemberUrl, member, httpOptions);
  }

  updateMember(member: Member, id: string) {
    return this.http.put<any>(this.updateMemberUrl + id, member);
  }

  deleteMember(id: String) {
    return this.http.delete<any>(this.deleteMemberUrl + id)
  }

  blockMember(uid: string) {
    const token = this.tokenService.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    };
    return this.http.put<any>(`${this.baseUrl}${uid}/block`, null, httpOptions);
  }

  unblockMember(uid: string) {
    const token = this.tokenService.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    };
    return this.http.put<any>(`${this.baseUrl}${uid}/unblock`, null, httpOptions);
  }

}
