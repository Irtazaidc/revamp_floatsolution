// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class RisReportingService {

  constructor(private http: HttpClient) { }


  GetVisitForImagingOneWindow(params) {
    return this.http.post(API_ROUTES.GET_VISITS_FOR_RIS_RESULT_ENTRY, params, this.getServerCallOptions());
  }
  GetMTWorkloadReport(params) {
    return this.http.post(API_ROUTES.GET_RIS_MT_WORKLOAD_REPORT, params, this.getServerCallOptions());
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
