// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class VitalsService {

  constructor(private http: HttpClient) { }

  insertUpdateVisitVitals(params) {
    return this.http.post(API_ROUTES.RIS_INSERT_VITALS, params, this.getServerCallOptions());
  }
  getPainSeverity() {
    return this.http.post(API_ROUTES.RIS_PAIN_SEVERITY, this.getServerCallOptions());
  }
  getVitals(params) {
    return this.http.post(API_ROUTES.GET_VITALS,params, this.getServerCallOptions());
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
