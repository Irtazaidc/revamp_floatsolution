// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class RisWorklistService {


  private risData$ = new BehaviorSubject(null);
  risData = this.risData$.asObservable();

  constructor(private http: HttpClient) { }

  getRISModalities(params) {
    return this.http.post(API_ROUTES.GET_RIS_MODALITIES, params, this.getServerCallOptions());
  }

  getRISWorklist(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST, params, this.getServerCallOptions());
  }
  getRISWorklistForPeerReview(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST_FOR_PEER_REVIEW, params, this.getServerCallOptions());
  }
  getRISWorklistService(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST_SERVICE, params, this.getServerCallOptions());
  }
  getRISWorkListSummary(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST_SUMMARY, params, this.getServerCallOptions());
  }
  getRISWorkListSummaryOutsanding(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST_SUMMARY_OUTSTANDING, params, this.getServerCallOptions());
  }

  InsertUpdateRISTPQAnswer(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_RISTPQ_ANSWERE, params, this.getServerCallOptions());
  }
  getRISMOHistory(params) {
    return this.http.post(API_ROUTES.GET_RIS_MO_HISTORY, params, this.getServerCallOptions());
  }
  getRISWorklistForReporting(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST_FOR_REPORTING, params, this.getServerCallOptions());
  }
  getRISWorkListSummaryMain(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST_SUMMARY_REPORTING_MAIN, params, this.getServerCallOptions());
  }
  getRISWorkListSummaryUnassigned(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST_SUMMARY_REPORTING_UNASSIGNED, params, this.getServerCallOptions());
  }
  getRISWorkListSummaryAddendumSecondOpinion(params) {
    return this.http.post(API_ROUTES.GET_RIS_WORKLIST_SUMMARY_REPORTING_ADDENDUM_SECONDOPINION, params, this.getServerCallOptions());
  }


  setTData(data) {
    this.risData$.next(data);
  }
  getTDate() {
    return this.risData$;
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
