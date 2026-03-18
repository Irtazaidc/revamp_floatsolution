// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class RISCommonService {

  constructor(private http: HttpClient) { }

  getData(route,param) {
    return this.http.post(route, param, this.getServerCallOptions())
  }

  insertUpdateData(route,param) {
    return this.http.post(route,param, this.getServerCallOptions())
  }

  getRISMachine(param) {
    return this.http.post(API_ROUTES.GET_RIS_MACHINE, param, this.getServerCallOptions())
  }
  getRISMachineLog(param) {
    return this.http.post(API_ROUTES.GET_RIS_MACHINE_LOG , param, this.getServerCallOptions())
  }
  getServicesForKBS(param) {
    return this.http.post(API_ROUTES.GET_SERVICES_FOR_KBS , param, this.getServerCallOptions())
  }
  getLabMachineLog(param) {
    return this.http.post(API_ROUTES.GET_MACHINE_LOG  , param, this.getServerCallOptions())
  }
  getRadiologyStatsReport(param) {
    return this.http.post(API_ROUTES.GET_RADIOLOGY_STATS_REPORT , param, this.getServerCallOptions())
  }
  GetRISMachineUtilization(param) {
    return this.http.post(API_ROUTES.GET_RIS_MACHINE_UTILIZATION , param, this.getServerCallOptions())
  }

  insertUpdateRISMachine(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_RIS_MACHINE, param, this.getServerCallOptions())
  }
  insertUpdateRISMachineTest(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_RIS_MACHINE_TEST, param, this.getServerCallOptions())
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
