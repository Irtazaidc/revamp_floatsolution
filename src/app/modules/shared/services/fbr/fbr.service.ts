// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class FbrService {


  constructor(private http: HttpClient) { }

  checkFbrApiStatus() {
    return this.http.get(API_ROUTES.FBR_SERVICE_CHECK_STATUS, this.getServerCallOptions());
  }
  getFbrInvoiceNo(params) {
    // params = JSON.stringify(params);
    return this.http.post('https://esp.fbr.gov.pk:8244/FBR/v1/api/Live/PostData', params, this.getServerCallOptions());
    // return this.http.post(API_ROUTES.FBR_GET_INVOICE_NO, params, this.getServerCallOptions());
  }

  getUnPostedFBRInvoices(param) {
    return this.http.post(API_ROUTES.FBR_GET_UNPOSTED_INVOICES, param, this.getServerCallOptions());
  }
  getUnPotsedFBRVisitDetails(params) {
    return this.http.post(API_ROUTES.FBR_GET_UNPOSTED_VISIT_DETAILS, params, this.getServerCallOptions());
  }
  reportFBRVisitData(params) {
    return this.http.post(API_ROUTES.FBR_REPOST_VISIT_DATA, params, this.getServerCallOptions());
  }
  postFBRDataForPanelConversion(params) {
    return this.http.post(API_ROUTES.FBR_POST_PANEL_CONVERSION_DATA, params, this.getServerCallOptions());
  }



  private getServerCallOptions(): object {
    return {
      headers: this.getCommonHeaders(),
      responseType: "json"
    }
  }
  private getCommonHeaders() {
    return new HttpHeaders({
      // "Authorization": "Bearer 1298b5eb-b252-3d97-8622-a4a69d5bf818",
      'Content-Type': 'application/json',
    })
  }
}
