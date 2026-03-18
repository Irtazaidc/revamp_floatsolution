// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class HcSharedService {

  constructor(private http: HttpClient) { }


  bookingDetailByBookingID(param) {
    return this.http.post(API_ROUTES.BOOKING_DETAIL_BY_BID, param, this.getServerCallOptions())
  }

  hcRegDetail(param) {
    return this.http.post(API_ROUTES.REG_TEST_DET_BY_BOOKING_ID, param, this.getServerCallOptions())
  }
  getHCBookingRequestsByCCR() {
    return this.http.post(API_ROUTES.GET_HC_BOOKING_REQ_BY_CCR, this.getServerCallOptions())
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
