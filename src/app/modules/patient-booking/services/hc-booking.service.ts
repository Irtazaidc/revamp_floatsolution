// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class HcBookingService {

  constructor(private http: HttpClient) { }
  bookHcPatient(params) {
    return this.http.post(API_ROUTES.BOOK_HC_PATIENT, params, this.getServerCallOptions());
  }
  getHCBookingSources() {
    return this.http.post(API_ROUTES.HC_BOOKING_SOURCES, this.getServerCallOptions());
  }
  getVisitHomeCollectionTest() {
    return this.http.post(API_ROUTES.GET_VISIT_HOME_COLLECTION_TEST, this.getServerCallOptions());
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
