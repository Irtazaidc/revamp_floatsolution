// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class TpChargeMasterService {

  constructor(private http: HttpClient) { }


  insertUpdateChargeMaster(params) {
    return this.http.post(API_ROUTES.ADD_EDIT_TP_CHARGE_MASTER, params, this.getServerCallOptions());
  }

  updateChargeMasterLocationMapping(params) {
    return this.http.post(API_ROUTES.ADD_EDIT_TP_CHARGE_MASTER_BRANCH_MAPPING, params, this.getServerCallOptions());
  }

  setChargeMasterAsDefault(params) {
    return this.http.post(API_ROUTES.SET_CHARGE_MASTER_AS_DEFAULT, params, this.getServerCallOptions());
  }

  getChargeMaster(params) {
    return this.http.post(API_ROUTES.GET_TP_CHARGE_MASTER, params, this.getServerCallOptions());
  }

  deleteChargeMaster(params) {
    return this.http.post(API_ROUTES.DELETE_TP_CHARGE_MASTER, params, this.getServerCallOptions());
  }

  getLookupBranchesForChargeMaster(params) {
    return this.http.post(API_ROUTES.GET_LOOKUP_BRANCHES_FOR_TP_CHARGE_MASTER, params, this.getServerCallOptions());
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
