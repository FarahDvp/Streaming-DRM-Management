import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenStorageService } from './security/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private downloadVideoUrl = "http://127.0.0.1:8080/api/downloads/add/";
  private calculateDownloadsUrl = "http://localhost:8080/api/downloads/calculate-downloads/";
  private deleteDownloadedVideoForAdminUrl = "http://localhost:8080/api/downloads/delete/"
  private deleteDownloadedVideoForUserUrl = "http://localhost:8080/api/downloads/remove/"
  private clearAllDownloadsUrl = 'http://localhost:8080/api/downloads/clearAll';
  private clearAllDownloadsByUserUrl = 'http://localhost:8080/api/downloads/user/clearAll';

  constructor(private http: HttpClient, private tokenService: TokenStorageService) { }

  getAllDownloadsTracking(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>("http://localhost:8080/api/downloads/all", { params });
  }

  getAllDownloadsByUser(page: number, size: number) {
    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      }),
      params: new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
    };

    return this.http.get<any>("http://localhost:8080/api/downloads/user", httpOptions);
  }

  saveDownloadedVideo(videoId: any) {
    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      }),
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.downloadVideoUrl + videoId, {}, httpOptions);
  }

  calculateDownloadsByUserId(userId: string) {
    return this.http.get<number>(this.calculateDownloadsUrl + userId);
  }

  deleteDownloadedVideo(id: any) {
    return this.http.delete<any>(this.deleteDownloadedVideoForAdminUrl + id)
  }

  deleteDownloadedVideoForUser(id: any) {
    return this.http.delete<any>(this.deleteDownloadedVideoForUserUrl + id)
  }

  clearAllDownloads(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.delete<void>(this.clearAllDownloadsUrl, { params });
  }

  clearAllDownloadsByUser() {
    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    };
    return this.http.delete<void>(this.clearAllDownloadsByUserUrl, httpOptions);
  }
}
