// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class ComplaintDashboardService {

  constructor(private http: HttpClient) { }

  getAssignedCMSrequest(params){
    return this.http.post(API_ROUTES.GET_ASSIGNED_CMS_REQUEST,params,this.getServerCallOptions())
  }
  getCMSReportingDetails(params){
    return this.http.post(API_ROUTES.GET_CMS_REQUEST_DETAILS,params,this.getServerCallOptions())
  }
  getCMSRequest(params){
    return this.http.post(API_ROUTES.GET_CMS_REQUEST,params,this.getServerCallOptions())
  }
  getCMSinquiryDetails(params){
    return this.http.post(API_ROUTES.GET_CMS_INQUIRY_DETAILS,params,this.getServerCallOptions())
  }
  GetSearchCMSRequest(params){
    return this.http.post(API_ROUTES.GET_CMS_SEARCH_REQUEST,params,this.getServerCallOptions())
  }
  GetPatientPortalUserDetailByFilters(params){
    return this.http.post(API_ROUTES.GET_PATIENTPORTAL_DETAILS,params,this.getServerCallOptions())
  }
  getCMSStatus(params){
    return this.http.post(API_ROUTES.GET_CMS_STATUS,params,this.getServerCallOptions())
  }
  getCMSrequestStats(params){
    return this.http.post(API_ROUTES.GET_CMS_REQUEST_STATS,params,this.getServerCallOptions())
  }
  updateCMSRequestStatus(params){
    return this.http.post(API_ROUTES.UPDATE_CMS_REQUEST_STATUS,params,this.getServerCallOptions())
  }
  InsertCMSContactBackTracking(params){
    return this.http.post(API_ROUTES.INSERT_CMS_CONTACT_BACK_TRACK,params,this.getServerCallOptions())
  }
  getHistoryOfCMSContactBack(params){
    return this.http.post(API_ROUTES.GET_CMS_CONTACT_BACK_TRACK,params,this.getServerCallOptions())
  }
  getEmplyoyeeCardInfo(params){
    return this.http.post(API_ROUTES.GET_EMP_BASIC_INFO,params,this.getServerCallOptions())
  }
  getGetCMSRequestByResponsiblePersonUserID(params){
    return this.http.post(API_ROUTES.GET_CMS_REQUEST_COMPARISON,params,this.getServerCallOptions())
  }
  GetWhatsAppLogs(params){
    return this.http.post(API_ROUTES.GET_WHATSAPP_LOGS,params,this.getServerCallOptions())
  }
  GetWhatsAppLogsSummary(params){
    return this.http.post(API_ROUTES.GET_WHATSAPP_SUMMARY,params,this.getServerCallOptions())
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
