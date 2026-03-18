// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { API_ROUTES } from '../../shared/helpers/api-routes'

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  getUserInfo(userId: any) {
    throw new Error('Method not implemented.');
  }  
  constructor(private http: HttpClient) {}

  empPasswordPolicy(param) {
    return this.http.post(API_ROUTES.EMP_PASSWORD_POLICY,param, this.getServerCallOptions())
  }
  getEmpBasicInfo(param) {
    return this.http.post(API_ROUTES.GET_EMP_BASIC_INFO,param, this.getServerCallOptions())
  }
  getEmpPicByUserId(param) {
    return this.http.post(API_ROUTES.GET_EMP_PIC,param, this.getServerCallOptions())
  }
  resetPassword(param) {
    return this.http.post(API_ROUTES.EMP_CHANGE_PASSWORD,param, this.getServerCallOptions())
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
