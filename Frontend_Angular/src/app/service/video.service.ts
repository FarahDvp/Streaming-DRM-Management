import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from "@angular/common/http";
import { Video } from '../model/video';
import { TokenStorageService } from './security/token-storage.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private uploadVideoUrl = "http://localhost:8080/api/videos/upload";
  private getOneVideoUrl = "http://localhost:8080/api/videos/one/";
  private updateVideoUrl = "http://localhost:8080/api/videos/update/";
  private deleteVideoUrl = "http://localhost:8080/api/videos/delete/";

  constructor(private http: HttpClient, private tokenService: TokenStorageService) { }

  getAllVideos(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>("http://localhost:8080/api/videos/pageable/all", { params });
  }

  getAllVideosWithInjectionUserID(page: number, size: number) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    };

    return this.http.get<any>('http://localhost:8080/api/videos/all-with-injection-userID', { params, ...httpOptions });
  }


  getOneVideo(id: String) {
    return this.http.get<any>(this.getOneVideoUrl + id);
  }

  uploadVideo(file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const token = this.tokenService.getToken();

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + token
      })
    };

    return this.http.post(this.uploadVideoUrl, formData, httpOptions);
  }

  updateVideo(video: Video, id: string) {
    return this.http.put<any>(this.updateVideoUrl + id, video);
  }

  deleteVideo(id: String) {
    return this.http.delete<any>(this.deleteVideoUrl + id)
  }


  getVideoName(videoId: string) {
    return this.http.get<any>(this.getOneVideoUrl + videoId).pipe(
      map((response: { name: any; }) => response.name)
    );
  }


  getVideoDashUrls(videoId: string) {
    return this.http.get<any>(this.getOneVideoUrl + videoId).pipe(
      map((response: { videoDashUrlWithInjection: any; }) => response.videoDashUrlWithInjection)
    );
  }


}