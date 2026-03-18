// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class HcShareService {

  constructor(private http: HttpClient) { }

  getUnProcessedShareData(params) {
    return this.http.post(API_ROUTES.HC_UNPROCCESSED_SHARE_DATA, params, this.getServerCallOptions())
  }

  getCurrFiscalYearDetail() {
    return this.http.post(API_ROUTES.CURR_FISCAL_INFO, '', this.getServerCallOptions())
  }
  updUnProcessedShareData(params) {
    return this.http.post(API_ROUTES.UPD_UNPROCCESSED_SHARE_DATA, params, this.getServerCallOptions())
  }

  getProcessedShareData(params) {
    return this.http.post(API_ROUTES.HC_PROCCESSED_SHARE_DATA, params, this.getServerCallOptions())
  }
  updProcessedShareData(params) {
    return this.http.post(API_ROUTES.HC_UPDATE_FINAL_SHARE, params, this.getServerCallOptions())
  }

  getRecemmendedShareData(params) {
    return this.http.post(API_ROUTES.HC_RECOMMENDED_SHARE_DATA, params, this.getServerCallOptions())
  }
  getHCShareDetailRpt(params) {
    return this.http.post(API_ROUTES.GET_HC_SHARE_DETAIL_RPT, params, this.getServerCallOptions())
  }
  getHCShareSummaryRpt(params) {
    return this.http.post(API_ROUTES.GET_HC_SHARE_SUMMARY_RPT, params, this.getServerCallOptions())
  }
  getHCShareComplianceRpt(params) {
    return this.http.post(API_ROUTES.GET_HC_SHARE_COMPLIENCE_RPT, params, this.getServerCallOptions())
  }
  getHomeSamplingTestStatus(params) {
    return this.http.post(API_ROUTES.GET_HC_TEST_STATUS, params, this.getServerCallOptions())
  }
  updRecemmendedShareData(params) {
    return this.http.post(API_ROUTES.HC_UPDATE_FINAL_SHARE, params, this.getServerCallOptions())
  }
  updHCShareToDiscard(params) {
    return this.http.post(API_ROUTES.DISCARD_HC_SHARE, params, this.getServerCallOptions())
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
