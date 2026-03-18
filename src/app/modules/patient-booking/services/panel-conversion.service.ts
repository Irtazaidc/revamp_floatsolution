// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class PanelConversionService {

  constructor(private http: HttpClient) { }
  getVisitsForSecurityRefund(params) {
    return this.http.post(API_ROUTES.GET_VISITS_FOR_SECURITY_REFUND, params, this.getServerCallOptions());
  }

  getVisitSamples(params) {
    return this.http.post(API_ROUTES.GET_VISIT_SAMPLES, params, this.getServerCallOptions());
  }
  getVisitDetailsForSecurityRefund(params) {
    return this.http.post(API_ROUTES.GET_VISIT_DETAIL_FOR_SECURITY_REFUND, params, this.getServerCallOptions());
  }
  updateVisitTestsStatus(params) {
    return this.http.post(API_ROUTES.UPDATE_VISIT_TESTS_STATUS, params, this.getServerCallOptions());
  }
  getVisitQuestionnaire(params) {
    return this.http.post(API_ROUTES.GET_VISIT_QUESTIONNAIRE, params, this.getServerCallOptions());
  }
  saveVisitQuestionnaire(params) {
    return this.http.post(API_ROUTES.SAVE_VISIT_QUESTIONNAIRE, params, this.getServerCallOptions());
  }

  getVisitDetailForPanelConversion(param) {
    return this.http.post(API_ROUTES.GET_VISIT_DETAIL_FOR_PANEL_CONVERSION,param, this.getServerCallOptions())
  }
  insertVisitPanelShifting(param) {
    return this.http.post(API_ROUTES.INSERT_VISIT_PANEL_SHIFTNG,param, this.getServerCallOptions())
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
