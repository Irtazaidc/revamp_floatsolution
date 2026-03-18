// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class HcRptsService {

  constructor(private http: HttpClient) { }


  getHCStatusWiseRpt(params) {
    return this.http.post(API_ROUTES.HC_STATUS_WISE_RPT, params, this.getServerCallOptions())
  }
  GetHCBookingStatuses() {
    return this.http.post(API_ROUTES.HC_BOOKING_STATUSES, '', this.getServerCallOptions())
  }
  updHCShareToDiscard(params) {
    return this.http.post(API_ROUTES.DISCARD_HC_SHARE, params, this.getServerCallOptions())
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
