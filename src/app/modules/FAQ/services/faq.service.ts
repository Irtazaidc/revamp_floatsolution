// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class FAQService {

  constructor(
    private http: HttpClient
  ) { }

  getFAQCategory(param) {
    return this.http.post(API_ROUTES.GET_FAQ_CATEGORY,param, this.getServerCallOptions())
  }

  getFAQ(param) {
    return this.http.post(API_ROUTES.GET_FAQ,param, this.getServerCallOptions())
  }

  addUpdateFAQ(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_FAQ,param, this.getServerCallOptions())
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
