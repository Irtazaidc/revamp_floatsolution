// @ts-nocheck
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalesReportsService {

  constructor(private http: HttpClient) { }

  getHCBookingInquiry(params){
    return this.http.post(API_ROUTES.GET_HC_BOOKING_INQUIRY,params,this.getServerCallOptions())
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
