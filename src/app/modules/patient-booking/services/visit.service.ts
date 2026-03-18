// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class VisitService {



  constructor(private http: HttpClient) { }

  getPatientVisitsForInvoice(params) {
    return this.http.post(API_ROUTES.PATIENT_VISITS, params, this.getServerCallOptions());
  }

  getVisitDetails(params) {
    return this.http.post(API_ROUTES.VISIT_DETAILS, params, this.getServerCallOptions());
  }
  GetVisitDetailsForAdvCancel(params) {
    return this.http.post(API_ROUTES.VISIT_DETAILS_ADVANCE_CANCELATION, params, this.getServerCallOptions());
  }
  cancelVisit(params) {
    return this.http.post(API_ROUTES.CANCEL_VISIT, params, this.getServerCallOptions());
  }
  VisitAdvTPCancellation(params) {
    return this.http.post(API_ROUTES.ADVANCE_CANCEL_VISIT, params, this.getServerCallOptions());
  }
  GenerateCancelOTPByVisitID(params) {
    return this.http.post(API_ROUTES.GENERATE_CANCEL_OTP_VISITID, params, this.getServerCallOptions());
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
  GetVisitsForAdvCancellationApprove(params) {
    return this.http.post(API_ROUTES.GET_VISITS_FOR_ADV_CANCELLATION_APPROVEL, params);
  }
  getDocumentsAuditData(params) {
    return this.http.post(API_ROUTES.GET_DOCUMENT_AUDIT_DATA, params,this.getServerCallOptions());
  }
  saveDiscountCardSale(params) {
    return this.http.post(API_ROUTES.SAVE_DISCOUNT_CARD_SALE, params, this.getServerCallOptions());
  }
  

  getEmpMedicalRecord(params) {
    return this.http.post(API_ROUTES.GET_EMP_MEDICAL_RECORD, params,this.getServerCallOptions());
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
