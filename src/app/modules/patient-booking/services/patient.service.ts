// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }

  insertUpdatePatient(params) { //test
    return this.http.post(API_ROUTES.INSERT_UPDATE_PATIENT, params, this.getServerCallOptions());
  }

  searchPatient(params) {
    return this.http.post(API_ROUTES.SEARCH_PATIENT, params, this.getServerCallOptions());
  }
  searchPatientByRefNoForGIZ(params) {
    return this.http.post(API_ROUTES.SEARCH_PATIENT_BY_REFNO_FOR_GIZ, params, this.getServerCallOptions());
  }

  getPatientInfoByVisitID(params) {
    return this.http.post(API_ROUTES.SEARCH_PATIENT_INFO_BY_VISITID, params, this.getServerCallOptions())
  }

  // searchPatientVIMS(params) {
  //   return this.http.post(API_ROUTES.SEARCH_PATIENT_VIMS, params, this.getServerCallOptions());
  // }
  // searchPatientOrbit(params) {
  //   return this.http.post(API_ROUTES.SEARCH_PATIENT_ORBIT, params, this.getServerCallOptions());
  // }
  searchPatientByBookingID(params) {
    return this.http.post(API_ROUTES.SEARCH_PATIENT_BOOKING_ID, params, this.getServerCallOptions());
  }
  searchOutsourceHospitalPat(params) {
    return this.http.post(API_ROUTES.GET_OUTSOURCE_PAT_BY_ID, params, this.getServerCallOptions());
  }
  getPatientPic(params) {
    return this.http.post(API_ROUTES.GET_PATIENT_IMAGE, params, this.getServerCallOptions());
  }
  getSaleByFDO(params) {
    return this.http.post(API_ROUTES.GET_SALE_BY_FDO, params, this.getServerCallOptions());
  }
  getAllSaleByFDO(params) {
    return this.http.post(API_ROUTES.GET_ALL_SALE_BY_FDO, params, this.getServerCallOptions());
  }
  getFDOSummaryReport(params) {
    return this.http.post(API_ROUTES.GET_FDO_SUMMARY_REPORT, params, this.getServerCallOptions());
  }
  getBranchSaleSummaryReport(params) {
    return this.http.post(API_ROUTES.GET_BRANCH_SALE_SUMMARY_REPORT, params, this.getServerCallOptions());
  }
  InsertBranchSalesClosing(params) {
    return this.http.post(API_ROUTES.INSERT_BRANCH_SALE_CLOSING, params, this.getServerCallOptions());
  }
  updateFDOPaymentCashClosing(params) {
    return this.http.post(API_ROUTES.UPDATE_SALE_CLOSING_BY_FDO, params, this.getServerCallOptions());
  }
  getRegistrationByUserID(params) {
    return this.http.post(API_ROUTES.GET_REGISTRATIONS_BY_FDO, params, this.getServerCallOptions());
  }

  getConscentDetailByVisitID(params) {
    return this.http.post(API_ROUTES.GET_CONSCENT_DETAIL_BY_VISITID, params, this.getServerCallOptions());
  }
  getPatientVisitsByTPIDs(params) {
    return this.http.post(API_ROUTES.GET_VISITS_BY_TPIDS, params, this.getServerCallOptions());
  }

  searchPatientVisits(params) {
    return this.http.post(API_ROUTES.SEARCH_PATIENT_VISITS, params, this.getServerCallOptions());
  }
  getPatientVisitsByPatientID(params) {   
    return this.http.post(API_ROUTES.GET_PATIENT_VISIT_DETAIL_BY_PATIENT_ID, params,
      this.getServerCallOptions()); 
  }
  updateVisitInfo(params) {
    return this.http.post(API_ROUTES.UPDATE_VISITS_INFO, params, this.getServerCallOptions());
  }
  updateRefbyViaVisitId(params) {
    return this.http.post(API_ROUTES.UPDATE_REFBY_VIA_VISTIID, params, this.getServerCallOptions());
  }
  getVisitInfoByVisitID(params) {
    return this.http.post(API_ROUTES.GET_VISITS_INFO, params, this.getServerCallOptions());
  }
  getSearchVisitByTestAndLoc(params) {
    return this.http.post(API_ROUTES.GET_SEARCH_VISIT_LOC_TEST, params, this.getServerCallOptions());
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
