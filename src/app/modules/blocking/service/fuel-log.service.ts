// @ts-nocheck
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class FuelLogService {

 
  constructor(private http: HttpClient) { }

  getGeneratorFuelLogList(params){
    return this.http.post(API_ROUTES.GET_GENERATOR_FUEL_LOG_LIST,params,this.getServerCallOptions())
  }
  getGeneratorName(params){
    return this.http.post(API_ROUTES.GET_GENERATOR_NAME,params,this.getServerCallOptions())
  }
  getGeneratorOnOffLogList(params){
    return this.http.post(API_ROUTES.GET_GENERATOR_ON_OFF_LIST,params,this.getServerCallOptions())
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
