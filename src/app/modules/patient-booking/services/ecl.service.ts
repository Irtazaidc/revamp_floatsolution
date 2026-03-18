// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class EclService {

  constructor(private http: HttpClient) { }

  geteclPendingPatients() {
    return this.http.post(API_ROUTES.GET_ECL_PENDING_PATIENTS, '', this.getServerCallOptions());
  }

  
  getOutSourceHospitalDetail() {
    return this.http.post(API_ROUTES.GET_OUTSOURCE_HOSPITAL_DETAIL, '', this.getServerCallOptions());
  }

  getVisitsAgainstOrderNumbers(params) {
    return this.http.post(API_ROUTES.GET_VISIT_ID_BY_ORDERNo, params, this.getServerCallOptions());
  }
  getOutsourcePendingPatientsByHospitalID(params) {
    return this.http.post(API_ROUTES.GET_ECL_PAT_BY_HOSPITALID, params, this.getServerCallOptions());
  }
  getOutsourcePendingPatientsByOrgID(params) {
    return this.http.post(API_ROUTES.GET_ECL_PAT_BY_ORGID, params, this.getServerCallOptions());
  }
  
  
  InsertUpdECLPatient(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_OUTSOURCE_PATIENTS,params, this.getServerCallOptions());
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
