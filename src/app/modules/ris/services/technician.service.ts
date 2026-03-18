// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {

  constructor( private http: HttpClient) { }

  getVisitTPInventory(params) {
    return this.http.post(API_ROUTES.GET_VISIT_TP_INVENTORY, params, this.getServerCallOptions());
  }
  getTPInventory(params) {
    return this.http.post(API_ROUTES.GET_TP_INVENTORY, params, this.getServerCallOptions());
  }
  
  InsertUpdateVisitTPInventory(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_VISIT_TP_INVENTORY, param, this.getServerCallOptions())
  }

  getTechnicianCheckList(params) {
    return this.http.post(API_ROUTES.GET_TECH_CHECKLIST, params, this.getServerCallOptions());
  }

  insertTechnicianQAnswer(param) {
    return this.http.post(API_ROUTES.INSERT_TECHNICIAN_QANSWER, param, this.getServerCallOptions())
  }
  
  getTechnicianHistory(params) { 
    return this.http.post(API_ROUTES.GET_TECHNICIAN_HISTORY, params, this.getServerCallOptions())
  }

  insertUpdateTechnicianWorkList(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_TECHNICIAN_WORKLIST, param, this.getServerCallOptions())
  }
  updateVisitTPStatusForInitialization(param) {
    return this.http.post(API_ROUTES.UPDATE_VISIT_TP_STATUS, param, this.getServerCallOptions())
  }

  getMachineModality(params) {
    return this.http.post(API_ROUTES.GET_MACHINE_MODALITY, params, this.getServerCallOptions());
  }
  getRISMachineModalityByLocID(params) {
    return this.http.post(API_ROUTES.GET_MACHINE_RIS_MODALITY_BY_LOCID, params, this.getServerCallOptions());
  }

  insertUpdateVisitTestAssignment(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_VISIT_TEST_ASSIGNMENT, param, this.getServerCallOptions())
  }
  insertUpdateVisitTestAssignmentV2(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_VISIT_TEST_ASSIGNMENTV2, param, this.getServerCallOptions())
  }
  insertUpdateBulkVisitTestAssignment(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_BULK_VISIT_TEST_ASSIGNMENT, param, this.getServerCallOptions())
  }
  insertUpdateBulkVisitTestAssignmentV2(params: any) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_BULK_VISIT_TEST_ASSIGNMENT_V2, params, this.getServerCallOptions());
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
