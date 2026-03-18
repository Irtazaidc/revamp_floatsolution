// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class DocsService {

  constructor(private http: HttpClient) { }
  
  getVisitDocuments(params) {
    return this.http.post(API_ROUTES.GET_VISIT_DOCS, params, this.getServerCallOptions());
  }
  getVisitDocumentById(params) {
    return this.http.post(API_ROUTES.GET_VISIT_DOC_BY_ID, params, this.getServerCallOptions());
  }
  saveVisitDocuments(params) {
    return this.http.post(API_ROUTES.SAVE_VISIT_DOCS, params, this.getServerCallOptions());
  }
 
  getGeneralDocumentsByRefIdDocTypeId(params) {
    return this.http.post(API_ROUTES.GET_GENERAL_DOCS, params, this.getServerCallOptions());
  }
  GetVisitSaleBranchClosingDepositDocByID(params) {
    return this.http.post(API_ROUTES.GET_BRANCH_CLOSING_DOCS, params, this.getServerCallOptions());
  }
  getGeneralDocumentsByDocId(params) {
    return this.http.post(API_ROUTES.GET_GENERAL_DOCS_BY_ID, params, this.getServerCallOptions());
  }
  saveGeneralDocumentsByRefIdTypeId(params) {
    return this.http.post(API_ROUTES.SAVE_GENERAL_DOCS, params, this.getServerCallOptions());
  }
  saveGeneralDocumentsByRefIdTypeIdDB(params) {
    return this.http.post(API_ROUTES.SAVE_GENERAL_DOCS_BY_REFID, params, this.getServerCallOptions());
  }
  deleteGeneralDocumentByDocId(params) {
    return this.http.post(API_ROUTES.DELETE_GENERAL_DOCS, params, this.getServerCallOptions());
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
