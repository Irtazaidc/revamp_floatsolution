// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class TestCommentsService {

  constructor(private http: HttpClient) { }
  getTests(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILES, params, this.getServerCallOptions());
  }
  getTestCommentByTPID(params){
    
    return this.http.post(API_ROUTES.GET_TEST_PROFILE_COMMENTS, params, this.getServerCallOptions());
  }
  updateTPComments(data){
    return this.http.post(API_ROUTES.UPDATE_TP_COMMENTS, data,this.getServerCallOptions())
  }

  encryptData(params) {
    return this.http.post(API_ROUTES.ENCRYPT_PARAM,  params, this.getServerCallOptions());
  }

  decryptData(params) {
    return this.http.post(API_ROUTES.DECRYPT_PARAM,  params, this.getServerCallOptions());
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
      // "Authorization": "Basic jwt"
    })
  }
}
