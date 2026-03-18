// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class ZoneConfigService {

  constructor(private http: HttpClient) { }

  insertUpdateHCZones(params) {
    return this.http.post(API_ROUTES.HC_INSERT_UPDATE_ZONE, params, this.getServerCallOptions())
  }
  getZones() {
    return this.http.post(API_ROUTES.HC_ZONES, this.getServerCallOptions())
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
