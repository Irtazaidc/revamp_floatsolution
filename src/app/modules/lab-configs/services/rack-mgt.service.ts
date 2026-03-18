// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class RackMgtService {

  constructor(private http: HttpClient) { }
  getRacksDetail(params) {
    return this.http.post(API_ROUTES.GET_RACK_DETAIL, params, this.getServerCallOptions());
  }
  getRacksTypes() {
    return this.http.post(API_ROUTES.GET_RACK_TYPES, '', this.getServerCallOptions());
  }

  createRack(params) {
    return this.http.post(API_ROUTES.CREATE_RACK, params, this.getServerCallOptions());
  }

  updateRack(params){
    return this.http.post(API_ROUTES.UPDATE_RACK, params, this.getServerCallOptions());
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
