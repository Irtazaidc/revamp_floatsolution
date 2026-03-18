// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class SmsStatusService {

  constructor(private http: HttpClient) { }

  GetSendingSMSstatus(params){
    return this.http.post(API_ROUTES.GET_SMS_STATUS,params,this.getServerCallOptions())
  }
  GetCancellationSMSstatus(params){
    return this.http.post(API_ROUTES.GET_CANCELLATION_SMS_STATUS,params,this.getServerCallOptions())
  }
  GetEmailInfoByViistID(params){
    return this.http.post(API_ROUTES.GET_EMAIL_INFO,params,this.getServerCallOptions())
  }
  GetEmailInfoByDate(params){
    return this.http.post(API_ROUTES.GET_EMAIL_INFO_BY_DATE,params,this.getServerCallOptions())
  }
  GetEmailDetailsByVisitID(params){
    return this.http.post(API_ROUTES.GET_EMAIL_DETAIL_BY_VISIT_ID,params,this.getServerCallOptions())
  }
  SendEmail(params){
    return this.http.post(API_ROUTES.SEND_EMAIL,params,this.getServerCallOptions())
  }

  SendpatientMessage(params){
    return this.http.post(API_ROUTES.SEND_PATIENT_MESSAGE,params,this.getServerCallOptions())
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
