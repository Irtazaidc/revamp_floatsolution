// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class VisitResultService {

  constructor(private http: HttpClient) { }


  getVisitsFroResultsEntry(params) {
    return this.http.post(API_ROUTES.GET_VISITS_FOR_RESULT_ENTRY, params, this.getServerCallOptions());
  }
  getVisitTestsByVisitId(params) {
    return this.http.post(API_ROUTES.GET_VISIT_TESTS_BY_VISITID, params, this.getServerCallOptions());
  }
  insertPatientVisitTestResult(params) {
    return this.http.post(API_ROUTES.INSERT_VISIT_TESTS_RESULTS, params, this.getServerCallOptions());
  }
  updatePatientVisitTestStatus(params) {
    return this.http.post(API_ROUTES.UPDATE_VISIT_TESTS_STATUS_RESULTS_ENTRY, params, this.getServerCallOptions());
  }

  updatePatientVisitTestStatusFoRIS(params) {
    return this.http.post(API_ROUTES.UPDATE_VISIT_TESTS_STATUS_RESULTS_ENTRY_FOR_RIS, params, this.getServerCallOptions());
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
