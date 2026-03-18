// @ts-nocheck
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserModel } from '../../auth/_models/user.model';
import { APP_ROUTES } from './app-routes';
import { CONSTANTS } from './constants';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  _storage_ = localStorage; // sessionStorage;

  q_mgmt_token_for_pat_reg = btoa('_IDCOME_q_mgmt_token_for_pat_reg');
  q_mgmt_counterNo_for_pat_reg = btoa('_IDCOME_q_mgmt_counterNo_for_pat_reg');
 

  private qMgmtTokenForPatReg$ = new BehaviorSubject('');
  qMgmtTokenForPatReg = this.qMgmtTokenForPatReg$.asObservable();



  constructor(
    // private idle: Idle,
    private router: Router
    ) {
  }



  // getQMgmtToken() {
  //   return this._storage_.getItem(this.q_mgmt_token_for_pat_reg);
  // }
  // setQMgmtToken(token) {
  //   if(token) {
  //     this._storage_.setItem(this.q_mgmt_token_for_pat_reg, token);
  //   } else {
  //     this._storage_.removeItem(this.q_mgmt_token_for_pat_reg);
  //   }
  // }


  getQManagementCounterNo() {
    return this._storage_.getItem(this.q_mgmt_counterNo_for_pat_reg);
  }
  setQManagementCounterNo(counterNo) {
    if(counterNo) {
      this._storage_.setItem(this.q_mgmt_counterNo_for_pat_reg, counterNo);
    } else {
      this._storage_.removeItem(this.q_mgmt_counterNo_for_pat_reg);
    }
  }



  refreshQMgmtToken() {
    this.qMgmtTokenForPatReg$.next(this.getQMgmtToken() || '');
  }
  setQMgmtToken(token) {
    if(token) {
      this._storage_.setItem(this.q_mgmt_token_for_pat_reg, btoa(JSON.stringify(token)));
    } else {
      this._storage_.removeItem(this.q_mgmt_token_for_pat_reg);
    }
    this.qMgmtTokenForPatReg$.next(token || '');
  }
  getQMgmtToken() {
    let token = this._storage_.getItem(this.q_mgmt_token_for_pat_reg);
    if(token) {
      try {
        token = atob(token);
      } catch(e){ }
      try {
        token = JSON.parse(token);
      } catch(e){ }
      try {
        token = JSON.parse(token);
      } catch(e){ }
      try {
        token = atob(token);
      } catch(e){ }
    } else {
      token = '';
    }
    return token;
  }
  getParseQMgmtToken(token = '') {
    let qMgmtTokenDetails:any = token || this.getQMgmtToken(); // this.storageService.getQMgmtToken();
    let qMgmtTokenNumber = '';
    // console.log('davvvvvvvvvvvvv ', qMgmtTokenDetails);
    if(qMgmtTokenDetails) {
      try {
        qMgmtTokenDetails = JSON.parse(qMgmtTokenDetails);
      } catch (e) {}
      try {
        qMgmtTokenDetails = (qMgmtTokenDetails || '').split('=');
        if(qMgmtTokenDetails.length == 4)
        qMgmtTokenNumber = qMgmtTokenDetails[1]; // Token Number
        qMgmtTokenNumber = (qMgmtTokenNumber || '').padStart(4, '0');
      } catch (e) {}
    }
    return qMgmtTokenNumber;
  }

  setObject(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getObject(key: string): any {
    const jsonString = localStorage.getItem(key);
    return JSON.parse(jsonString);
  }

  removeObject(key: string): void {
    localStorage.removeItem(key);
  }



}
