// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class VisitTrackingService {

  constructor(private http: HttpClient) { }

  getPatientVisitsForInvoice(params) {
    return this.http.post(API_ROUTES.PATIENT_VISITS, params, this.getServerCallOptions());
  }

  getVisitDetails(params) {
    return this.http.post(API_ROUTES.VISIT_DETAILS, params, this.getServerCallOptions());
  }
  cancelVisit(params) {
    return this.http.post(API_ROUTES.CANCEL_VISIT, params, this.getServerCallOptions());
  }
  createVisit(params) {
    return this.http.post(API_ROUTES.CREATE_VISIT, params, this.getServerCallOptions());
  }
  createVisitLive(params) {
    return this.http.post(API_ROUTES.CREATE_VISIT_LIVE, params, this.getServerCallOptions());
  }
  insertVisitInstallment(params) {
    return this.http.post(API_ROUTES.INSERT_VISIT_INSTALLMENT, params, this.getServerCallOptions());
  }
  getPOSID(params) {
    return this.http.post(API_ROUTES.GET_POS_ID, params, this.getServerCallOptions());
  }
  getVisitsForCancellationApproval(params) {
    return this.http.post(API_ROUTES.GET_VISITS_FOR_CANCELLATION_APPROVEL, params);
  }
  saveDiscountCardSale(params) {
    return this.http.post(API_ROUTES.SAVE_DISCOUNT_CARD_SALE, params, this.getServerCallOptions());
  }
  // getSearchVisitByTestAndLoc(params) {
  //   return this.http.post(API_ROUTES.GET_SEARCH_VISIT_LOC_TEST, params, this.getServerCallOptions());
  // }


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
