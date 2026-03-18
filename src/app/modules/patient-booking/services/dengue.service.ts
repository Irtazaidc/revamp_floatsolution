// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class DengueService {

  constructor(private http: HttpClient) { }

  getDengueDataToPostSrv(params) {
    return this.http.post(API_ROUTES.GET_DATA_FOR_DENGUE_PORTAL, params, this.getServerCallOptions());
  }
  updatePatientInfoDengueDataToPost(params) {
    return this.http.post(API_ROUTES.UPDATE_PATIENTINFO_FOR_DENGUE_PORTAL, params, this.getServerCallOptions());
  }
  getDengueDataToPostSrvForUpd() {
    return this.http.post(API_ROUTES.GET_DATA_FOR_DENGUE_PORTAL_FOR_UPD, '', this.getServerCallOptions());
  }
  postDengueDataSrv(params) {
    return this.http.post(API_ROUTES.POST_DENGUE_DATA, params, this.getServerCallOptions());
  }
  getDenguePostedData(params) {
    return this.http.post(API_ROUTES.GET_DENGUE_POSTED_DATA, params, this.getServerCallOptions());
  }
  getDenguePostedDataToRepost() {
    return this.http.post(API_ROUTES.GET_DENGUE_POSTED_DATA_TO_REPOST, this.getServerCallOptions());
  }
  getToken() {
    return this.http.post(API_ROUTES.GET_T, '', this.getServerCallOptions());
  }

  getServerCallOptions(): object {
    return {
      headers: this.getCommonHeaders(),
      responseType: "json"
    }
  }
  getCommonHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    })
  }
}
