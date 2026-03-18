// @ts-nocheck
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ROUTES } from '../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class BusinessSuiteService {

  constructor(
    private httpClient: HttpClient
  ) { }

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
  
  getBranchWiseVisitCountAnalytics(param) {
    return this.httpClient.post(API_ROUTES.GET_BRANCHWISE_VISIT_COUNT_ANALYTICS, param, this.getServerCallOptions())
  }

  getTPCodeWiseVisitCountAnalyticsByLocID(param) {
    return this.httpClient.post(API_ROUTES.GET_TESTWISE_VISIT_COUNT_ANALYTICS, param, this.getServerCallOptions())
  }
  getSectionWiseVisitCountAnalyticsByLocID(param) {
    return this.httpClient.post(API_ROUTES.GET_SECTIONWISE_VISIT_COUNT_ANALYTICS, param, this.getServerCallOptions())
  }

}






