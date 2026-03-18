// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class DoctorShareService {

  constructor(
    private http: HttpClient
  ) { }

  getDoctorLevel(params) {
    return this.http.post(API_ROUTES.GET_DOCTOR_LEVEL, params, this.getServerCallOptions());
  }

  updateDoctorLevel(params) {
    return this.http.post(API_ROUTES.UPDATE_DOCTOR_LEVEL, params, this.getServerCallOptions());
  }
  getAllLocationByTPID(params) {
    return this.http.post(API_ROUTES.GET_ALL_LOCATION_TPID, params, this.getServerCallOptions());
  }
  getTestPrfoileRadiologistTests(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILES_RADIOLOGIST_TESTS, params, this.getServerCallOptions());
  }
  InsertUpdateRISLevelLocationTPShare(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_DOCTOR_SHARE, params, this.getServerCallOptions());
  }
  insertUpdateRISDoctorLocationTPShare(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_DOCTOR_SHARE_DOCTORE_WISE, params, this.getServerCallOptions());
  }
  getRISLevelLocationTPShare(params) {
    return this.http.post(API_ROUTES.GET_RIS_LEVEL_LOCATION_TP_SHARE, params, this.getServerCallOptions());
  }
  getRISDoctorLocationTPShare  (params) {
    return this.http.post(API_ROUTES.GET_RIS_DOCTOR_LOCATION_TP_SHARE, params, this.getServerCallOptions());
  }
  getRISDoctorLocationTPShareForLoc  (params) {
    return this.http.post(API_ROUTES.GET_RIS_DOCTOR_LOCATION_TP_SHARE_FOR_LOC, params, this.getServerCallOptions());
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
