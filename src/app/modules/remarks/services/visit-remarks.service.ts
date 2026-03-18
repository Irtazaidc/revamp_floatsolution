// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class VisitRemarksService {

  constructor(private http: HttpClient) { }

  getVisitRemarks(params) {
    return this.http.post(API_ROUTES.GET_VISIT_REMARKS, params, this.getServerCallOptions());
  }
  saveVisitRemarks(params) {
    return this.http.post(API_ROUTES.SAVE_VISIT_REMARKS, params, this.getServerCallOptions());
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
