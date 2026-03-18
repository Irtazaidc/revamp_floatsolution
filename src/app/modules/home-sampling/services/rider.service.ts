// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class RiderService {

  constructor(
    private http: HttpClient
  ) { }

  getFAQCategory(param) {
    return this.http.post(API_ROUTES.GET_FAQ_CATEGORY,param, this.getServerCallOptions())
  }

  getHCUserType() {
    return this.http.post(API_ROUTES.HC_GET_USER_TYPE,'', this.getServerCallOptions())
  }

  getFAQ(param) {
    return this.http.post(API_ROUTES.GET_FAQ,param, this.getServerCallOptions())
  }
  GetEmployeeByEmpNo(param) {
    return this.http.post(API_ROUTES.GET_EMPLOYEE_BY_EMPNO,param, this.getServerCallOptions())
  }
  inActiveRider(param) {
    return this.http.post(API_ROUTES.HC_INACTIVE_RIDER,param, this.getServerCallOptions())
  }

  addUpdateRider(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_RIDER,param, this.getServerCallOptions())
  }
  getRider(param) {
    return this.http.post(API_ROUTES.GET_RIDER,param, this.getServerCallOptions())
  }

  getRiderDashboardInfo(param) {
    return this.http.post(API_ROUTES.HC_RIDER_DASHBOARD_INFO,param, this.getServerCallOptions())
  }

  getRiderQCheckList(param) {
    return this.http.post(API_ROUTES.HC_RIDER_Q_CHECKLIST,param, this.getServerCallOptions())
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
