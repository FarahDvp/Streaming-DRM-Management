import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { TokenStorageService } from './security/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {

  private injectUIDCurrentUserUrl = "http://127.0.0.1:8080/api/views-tracking";
  private calculateViewsUrl = "http://localhost:8080/api/views-tracking/calculate-views";
  private deleteViewForAdminUrl = "http://localhost:8080/api/views-tracking/delete/";
  private deleteViewForUserUrl = "http://localhost:8080/api/views-tracking/remove/";
  private deleteViewByDateUrl = "http://localhost:8080/api/views-tracking/date/";
  private clearAllViewsForAdminUrl = 'http://localhost:8080/api/views-tracking/clearAll';
  private clearAllViewsByUserUrl = 'http://localhost:8080/api/views-tracking/user/clearAll';

  constructor(private http: HttpClient, private tokenService: TokenStorageService) { }

  getAllViewsTracking(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>("http://localhost:8080/api/views-tracking/all", { params });
  }

  getAllViewsByUser(page: number, size: number) {
    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      }),
      params: new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
    };

    return this.http.get<any>("http://localhost:8080/api/views-tracking/user", httpOptions);
  }

  saveView(videoId: any, viewTracking: string) {
    return this.http.post<any>(this.injectUIDCurrentUserUrl + `/${videoId}/views`, { userId: viewTracking });
  }

  calculateViewsByVideoId(videoId: string) {
    return this.http.get<number>(this.calculateViewsUrl + `/${videoId}`);
  }

  deleteViewForAdmin(id: any) {
    return this.http.delete<any>(this.deleteViewForAdminUrl + id)
  }

  deleteViewForUser(id: any) {
    return this.http.delete<any>(this.deleteViewForUserUrl + id)
  }

  deleteViewsByDay(date: string) {
    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    };
    return this.http.delete<any>(this.deleteViewByDateUrl + date, httpOptions)
  }

  clearAllViewsForAdmin(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.delete<void>(this.clearAllViewsForAdminUrl, { params });
  }

  clearAllViewsByUser(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      }),
      params: params
    };

    return this.http.delete<void>(this.clearAllViewsByUserUrl, httpOptions);
  }


}
