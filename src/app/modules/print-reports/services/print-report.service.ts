// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class PrintReportService {

  constructor(private http: HttpClient) { }
  getPatientReportUrl(params) {
    return this.http.post(
      API_ROUTES.GENERATE_PATIENT_REPORT_URL,
        params, this.getServerCallOptions());
  }

  UpdateReportStatus(params) {
    return this.http.post(
      API_ROUTES.UPDATE_REPORT_STATUS,
        params, this.getServerCallOptions());
  }
  getVisitDetails(params) {   
    return this.http.post(API_ROUTES.GET_PATIENT_VISIT_DETAIL, params,
      this.getServerCallOptions()); 
  }
  getVisitDetailsForSmartReportData(params) {   
    return this.http.post(API_ROUTES.GET_VISIT_DETAILS_FOR_SMART_REPORT, params,
      this.getServerCallOptions()); 
  }
 
  GetSmartReport(params: any, API_KEY) {
    return this.http.post(
      API_ROUTES.GENERATE_SMART_REPORT,
      params,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,//'idc-report-api-key-2024-secure'
        }),
        responseType: 'blob'
      }
    );
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
