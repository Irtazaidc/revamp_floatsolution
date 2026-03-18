// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class TestProfilePackageService {

  constructor(private http: HttpClient) { }

  getTests(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILES, params, this.getServerCallOptions());
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
