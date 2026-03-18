// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http: HttpClient) { }

  // private requestGeneratedSubject = new BehaviorSubject<boolean>(false);
  // requestGenerated$: Observable<boolean> = this.requestGeneratedSubject.asObservable();

  // notifyRequestGenerated() {
  //   console.log('requestGenerated')
  //   this.requestGeneratedSubject.next(true);
  // }
  
  getPatientFeedback(params) {
    return this.http.post(API_ROUTES.GET_FEEDBACK, params, this.getServerCallOptions());
  }
  saveCCRFeedback(params) {
    return this.http.post(API_ROUTES.CC_REQ_HANDLING, params, this.getServerCallOptions());
  }
  getCMScategory() {
    return this.http.post(API_ROUTES.GET_CMS_CATEGORY, this.getServerCallOptions());
  }
  getCMSsubCategory(params) {
    return this.http.post(API_ROUTES.GET_SUB_CMS_CATEGORY, params, this.getServerCallOptions());
  }
  getCMSreqType() {
    return this.http.post(API_ROUTES.GET_CMS_REQ_TYPE, this.getServerCallOptions());
  }
  saveCMSrequest(params) {
    return this.http.post(API_ROUTES.SAVE_CMS_REQUEST, params, this.getServerCallOptions());
  }
  
  getCMSrequestsource() {
    return this.http.post(API_ROUTES.GET_CMS_REQUEST_SOURCE,  this.getServerCallOptions());
  }
  getCMScategoryCounts(param) {
    return this.http.post(API_ROUTES.GET_CMS_CATEGORY_COUNTS, param, this.getServerCallOptions());
  }
  getCMSCountByCreatedByUserID (param) {
    return this.http.post(API_ROUTES.GET_CMS_REQUEST_COUNTS, param, this.getServerCallOptions());
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