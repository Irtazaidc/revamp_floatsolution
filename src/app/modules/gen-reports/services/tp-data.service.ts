// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class TpDataService {

  constructor(private http: HttpClient) { }

  getTestPrfoileDataByLocID(params) {
    return this.http.post(API_ROUTES.GET_TESTPROFILEBYLOCID_DATA, params, this.getServerCallOptions());
  }
  getAnnualMedicalsByPanelID(params) {
    return this.http.post(API_ROUTES.GET_ANNUALMEDICALS_DATA, params, this.getServerCallOptions());
  }
  
  getTestProfileByPanelID(params) {
    return this.http.post(API_ROUTES.GET_TESTPROFILE_PANELID, params, this.getServerCallOptions());
  }
  GetDoctorPrescriptionByRefByID(params) {
    return this.http.post(API_ROUTES.GET_DOCTOR_PRES_REFID, params, this.getServerCallOptions());
  }
  GetDoctorPrescription(params) {
    return this.http.post(API_ROUTES.GET_DOCTOR_PRESCRIPTION, params, this.getServerCallOptions());
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
