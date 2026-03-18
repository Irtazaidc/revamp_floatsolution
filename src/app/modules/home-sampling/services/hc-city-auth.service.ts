// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class HcCityAuthService {


  constructor(private http: HttpClient) { }

  getHCCities() {
    return this.http.post(API_ROUTES.GET_HC_CITIES, '', this.getServerCallOptions())
  }

  getAuthorizedCitiesByUserId(params) {
    return this.http.post(API_ROUTES.GET_AUTHORIZE_CITIES_BY_USERID, params, this.getServerCallOptions())
  }

  updateUserCityAuth(params) {
    return this.http.post(API_ROUTES.UPDATE_HC_USER_CITY_AUTH, params, this.getServerCallOptions())
  }
  insertUpdateHCCity(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_HC_CITY, params, this.getServerCallOptions())
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
