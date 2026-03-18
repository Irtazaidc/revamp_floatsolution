// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class UpdateHcReqService {

  constructor(private http: HttpClient) { }

  updatePatientBooking(params) {
    return this.http.post(API_ROUTES.UPDATE_PATIENT_BOOKINGID, params, this.getServerCallOptions())
  }

  searchDataByBookingID(params) {
    return this.http.post(API_ROUTES.SEARCH_PATIENT_BOOKING_ID, params, this.getServerCallOptions())
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
