// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class HcBookingInquiryService {

  constructor(private http: HttpClient) { }

  getHCBookingInquiry(params){
    return this.http.post(API_ROUTES.GET_HC_BOOKING_INQUIRY,params,this.getServerCallOptions())
  }
  GetBookingPatientDocument(params){
    return this.http.post(API_ROUTES.GET_HC_BOOKING_DOCS,params,this.getServerCallOptions())
  }
  getHCBookingDetailforExpRpt(params){
    return this.http.post(API_ROUTES.GET_HC_BOOKING_DETAIL,params,this.getServerCallOptions())
  }
  GetHCBookingAuditSummary(params){
    return this.http.post(API_ROUTES.GET_HC_BOOKING_AUDIT_SUMMARY,params,this.getServerCallOptions())
  }
  GetHCBookingAuditDetail(params){
    return this.http.post(API_ROUTES.GET_HC_BOOKING_AUDIT_DETAIL,params,this.getServerCallOptions())
  }
  getHCBookingRequestsByCCR(params){
    console.log("params service" , params)
    return this.http.post(API_ROUTES.GET_HC_BOOKING_REQUEST_CCR,params,this.getServerCallOptions())
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
