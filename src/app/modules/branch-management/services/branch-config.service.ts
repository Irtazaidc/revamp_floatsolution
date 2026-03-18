// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class BranchConfigService {

  constructor(private http: HttpClient) { }

  
  getBranchTypes() {
    return this.http.post(API_ROUTES.BRANCH_TYPES, '',  this.getServerCallOptions());
  }
  
  getBranches(params) {
    return this.http.post(API_ROUTES.BRANCHES, params,  this.getServerCallOptions());
  }

  updateBranch(params) {
    return this.http.post(API_ROUTES.UPDATE_BRANCH, params,  this.getServerCallOptions());
  }

  getClockHour() {
    return this.http.post(API_ROUTES.GET_CLOCK_HOUR, '',  this.getServerCallOptions());
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
