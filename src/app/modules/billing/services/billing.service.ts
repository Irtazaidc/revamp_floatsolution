// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private http: HttpClient) { }

  getRadioDocShareDetail(params) {
    return this.http.post(API_ROUTES.GET_RADIO_SHARE_DETAILS, params, this.getServerCallOptions());
  }
  getRISDocShareDetailForAccounts(params) {
    return this.http.post(API_ROUTES.GET_RIS_SHARE_DETAILS_ACCOUNTS, params, this.getServerCallOptions());
  }
  getRadioDocShareDetailV2(params) {
    return this.http.post(API_ROUTES.GET_RADIO_SHARE_DETAILS_V2, params, this.getServerCallOptions());
  }
  getRadioDocShareSummary(params) {
    return this.http.post(API_ROUTES.GET_RADIO_SHARE_SUMMARY, params, this.getServerCallOptions());
  }
  getRadioDocShareSummaryV2(params) {
    return this.http.post(API_ROUTES.GET_RADIO_SHARE_SUMMARY_V2, params, this.getServerCallOptions());
  }
  GetSalesDepositDocumentBySaleDate(params) {
    return this.http.post(API_ROUTES.GET_SALES_DEPOSIT_SLIPS , params, this.getServerCallOptions());
  }
//Panel Users
  GetPanelUsers(params) {
    return this.http.post(API_ROUTES.GET_PANEL_USERS, params, this.getServerCallOptions());
  }
  GetPanelUserDetailByPanelUserID(params) {
    return this.http.post(API_ROUTES.GET_PANEL_USERS_DETAILS, params, this.getServerCallOptions());
  }
  DeletePanelUserByPanelUserId(params) {
    return this.http.post(API_ROUTES.DELETE_PANEL_USERS, params, this.getServerCallOptions());
  }
  DeletePanelByPanelId(params) {
    return this.http.post(API_ROUTES.DELETE_PANEL_BY_PANELID, params, this.getServerCallOptions());
  }
  InsertUpdatePanel(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_PANEL, params, this.getServerCallOptions());
  }
  
 // Manage Panels
  GetIPanelType() {
    return this.http.post(API_ROUTES.GET_PANEL_TYPE, this.getServerCallOptions());
  }
  GetPanelList() {
    return this.http.post(API_ROUTES.GET_PANEL_LIST, this.getServerCallOptions());
  }
  GetPanelDetailsByPanelId(params) {
    return this.http.post(API_ROUTES.GET_PANEL_DETAILS_PANELID, params, this.getServerCallOptions());
  }
//Manage Panels > Details
  GetIPanelBIlling() {
    return this.http.post(API_ROUTES.GET_PANEL_BILLING, this.getServerCallOptions());
  }
  GetIPanelRateDisplay() {
    return this.http.post(API_ROUTES.GET_PANEL_RATE_DISPLAY, this.getServerCallOptions());
  }
  GetTestProfileProfileList() {
    return this.http.post(API_ROUTES.GET_DTEST_PROFILE_PRICELIST, this.getServerCallOptions());
  }
  GetLabDepartment() {
    return this.http.post(API_ROUTES.GET_LAB_DEPARTMENT, this.getServerCallOptions());
  }
  GetAllTestsByPanelIDPriceListId(params) {
    return this.http.post(API_ROUTES.GET_ALL_TESTS_BY_PANELID_PRICELISTID, params, this.getServerCallOptions());
  }
//Manage Panels > General
  GetChartOfAccount() {
    return this.http.post(API_ROUTES.GET_CHART_OF_ACCOUNT, this.getServerCallOptions());
  }
 
  GetAccMaintenaceByCOAId(params) {
    return this.http.post(API_ROUTES.GET_ACC_MAINTENANCE_BY_COAID, params, this.getServerCallOptions());
  }
  //Manage Panels > Location
  GetLocationsByPanelId(params) {
    return this.http.post(API_ROUTES.GET_PANEL_LOCATIONS_PANELID, params, this.getServerCallOptions());
  }

   //Manage Panels > Users
   GetPanelUserDetailByPanelId(params) {
    return this.http.post(API_ROUTES.GET_PANEL_USERS_PANELID, params, this.getServerCallOptions());
  }
 

  InsertUpdatePanelUser(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_PANEL_USERS, params, this.getServerCallOptions());
  }
  insertPanelUserForAssociation(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_PANEL_USERS_ASSOCIATION, params, this.getServerCallOptions());
  }
  getVisitIDByLocID(params) {
    return this.http.post(API_ROUTES.GET_VISITID_BY_LOCID , params, this.getServerCallOptions());
  }
  UpdateStatusOnDeskByVisitTPId(params) {
    return this.http.post(API_ROUTES.UPDATE_STATUS_BY_VISITID_TPID, params, this.getServerCallOptions());
  }
  InsertSaleDepositDocument(params) {
    return this.http.post(API_ROUTES.INSERT_SALES_DEPOSIT_SLIPS , params, this.getServerCallOptions());
  }
  getTestHeader(params) {
    return this.http.post(API_ROUTES.GET_TEST_HEAD, params, this.getServerCallOptions());
  }

  // Partners Configuration
  getAllPartners() {
    return this.http.post(API_ROUTES.GET_ALL_PARTNER, this.getServerCallOptions());
  }
  getPartnersDetailsByID(params) {
    return this.http.post(API_ROUTES.GET_PARTNER_BY_ID,params, this.getServerCallOptions());
  }
  getPartnerUserByID(params) {
    return this.http.post(API_ROUTES.GET_PARTNER_USERBYID,params, this.getServerCallOptions());
  }
  getPartnersRISMachineByID(params) {
    return this.http.post(API_ROUTES.GET_PARTNER_RIS_MACHINE_BY_ID,params, this.getServerCallOptions());
  }
  insertUpdatePartnersRISMachine(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_PARTNER_RIS_MACHINE,params, this.getServerCallOptions());
  }

  insertUpdatePartners(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_PARTNER,params, this.getServerCallOptions());
  }
  GetPartnerUser() {
    return this.http.post(API_ROUTES.GET_PARTNER_USER, this.getServerCallOptions());
  }
  InserUpdatePartnerUser(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_PARTNER_USER,params, this.getServerCallOptions());
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
