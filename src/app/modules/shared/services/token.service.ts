// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private http: HttpClient) { }


  
  tokenCall(params) {
    return this.http.post(API_ROUTES.Q_MANAGEMENT_CALL_FOR_TOKEN, params, this.getServerCallOptions());
  }
  tokenAttend(params) {
    return this.http.post(API_ROUTES.Q_MANAGEMENT_ATTEND_TOKEN, params, this.getServerCallOptions());
  }
  saveQManagementTokenWithVisit(params) {
    return this.http.post(API_ROUTES.SAVE_Q_MANAGEMENT_TOKEN_WITH_VISIT, params, this.getServerCallOptions());
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
