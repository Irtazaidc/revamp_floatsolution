// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class DoctorService  {

  constructor(private http: HttpClient) { }


  insertUpdateB2BDoctor(params) {
    return this.http.post(API_ROUTES.ADD_EDIT_B2B_DOCTOR, params, this.getServerCallOptions());
  }

  insertUpdateRefByDoctor(params) {
    return this.http.post(API_ROUTES.ADD_EDIT_REF_BY_DOCTOR, params, this.getServerCallOptions());
  }

  deleteRefByDoctor(params) {
    return this.http.post(API_ROUTES.DELETE_REF_BY_DOCTOR, params, this.getServerCallOptions());
  }

  insertRefByB2BDoctorsMapping(params) {
    return this.http.post(API_ROUTES.ADD_REF_BY_B2B_DOCTOR_MAPPING, params, this.getServerCallOptions());
  }  

  getRefByB2BDoctorsMapping(params) {
    return this.http.post(API_ROUTES.GET_REF_BY_B2B_DOCTOR_MAPPING, params, this.getServerCallOptions());
  }

  getRefByList(params) {
    return this.http.post(API_ROUTES.GET_REF_BY_LIST, params, this.getServerCallOptions());
  }

  getB2BDoctorShareReport(params) {
    return this.http.post(API_ROUTES.GET_B2B_DOCTOR_SHARE_REPORT, params, this.getServerCallOptions());
  }

  getB2BDoctorRefList(params) {
    return this.http.post(API_ROUTES.GET_B2B_DOCTOR_REF_LIST_EXPORT, params, this.getServerCallOptions());
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
