// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';
// import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  constructor(private http: HttpClient) { }

  getLookupsForRegistration(params) {
    return this.http.post(API_ROUTES.LOOKUP_FOR_REGISTRATION, params, this.getServerCallOptions());
  }
  getGendersList() {
    return this.http.post(API_ROUTES.LOOKUP_GENDERS, null, this.getServerCallOptions());
  }
  getPersonalRelation() {
    return this.http.post(API_ROUTES.LOOKUP_PERSONAL_RELATION, null, this.getServerCallOptions());
  }
  getProvinces() {
    return this.http.post(API_ROUTES.LOOKUP_GET_PROVINCE, null, this.getServerCallOptions());
  }
  getdistricts() {
    return this.http.post(API_ROUTES.LOOKUP_GET_DISTRICTS, null, this.getServerCallOptions());
  }
  getTehsils() {
    return this.http.post(API_ROUTES.LOOKUP_GET_TEHSILS, null, this.getServerCallOptions());
  }
  getTehsilsByDistrictID(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_TEHSIL_BY_DISTRICT_ID, params, this.getServerCallOptions());
  }
  getSalutationList() {
    return this.http.post(API_ROUTES.LOOKUP_SALUTATIONS, null, this.getServerCallOptions());
  }
  getNotationList() {
    return this.http.post(API_ROUTES.LOOKUP_NOTATIONS, null, this.getServerCallOptions());
  }
  getCities(params) {
    return this.http.post(API_ROUTES.LOOKUP_CITIES, params, this.getServerCallOptions());
  }
  getMobileOperator() {
    return this.http.post(API_ROUTES.LOOKUP_MOBILE_OPERATORS, null, this.getServerCallOptions());
  }
  GetBranches() {
    return this.http.post(API_ROUTES.LOOKUP_GET_BRANCHES, this.getServerCallOptions())
  }
  GetBranchesByCityIDs(params: any) {
    return this.http.post(API_ROUTES.LOOKUP_GET_BRANCHES_BY_CITY_IDS,params,this.getServerCallOptions()
  );
}
  GetBranchesByLocID(param) {
    return this.http.post(API_ROUTES.LOOKUP_GET_BRANCHES,param, this.getServerCallOptions())
  }
  GetCMSPriorityList() {
    return this.http.post(API_ROUTES.LOOKUP_GET_CMS_PRIORITY_LIST, this.getServerCallOptions())
  }
  getAllLocationByUserID(param) {
    return this.http.post(API_ROUTES.LOOKUP_GET_BRANCHES_BY_USER_ID, param, this.getServerCallOptions())
  }
  GetPaymentModeByPaymentModeCategory(param) {
    return this.http.post(API_ROUTES.LOOKUP_GET_PAYMENT_MODE_BY_PAYMENT_MODE_CATEGORY, param, this.getServerCallOptions())
  }
  GetAccount() {
    return this.http.post(API_ROUTES.LOOKUP_GET_ACCOUNT, this.getServerCallOptions())
  }
  GetDepartments() {
    return this.http.post(API_ROUTES.LOOKUP_GET_DEPARTMENTS, this.getServerCallOptions())
  }
  GetSubDepartments() {
    return this.http.post(API_ROUTES.LOOKUP_GET_SUB_DEPARTMENTS, this.getServerCallOptions())
  }
  GetCMSActionTakenMeasures() {
    return this.http.post(API_ROUTES.LOOKUP_GET_CMS_ACTION_TAKEN, this.getServerCallOptions())
  }

  getCMSContactBackStatus() {
    return this.http.post(API_ROUTES.LOOKUP_GET_CONTACTBACK_STATUS, this.getServerCallOptions()) 
  }

  GetPriorityLevels() {
    return this.http.post(API_ROUTES.LOOKUP_GET_PRIORITY_LEVELS, this.getServerCallOptions())
  }
  GetNotifyType() {
    return this.http.post(API_ROUTES.LOOKUP_GET_NOTIFY_TYPE, this.getServerCallOptions())
  }
  getMobileOperatorByCode(params) {
    return this.http.post(API_ROUTES.LOOKUP_MOBILE_OPERATOR_BY_CODE, params, this.getServerCallOptions());
  }
  getPaymentModes(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_PAYMENT_MODES, params, this.getServerCallOptions());
  }
  getInsuranceExpiryDate(params) {
    return this.http.post(API_ROUTES.GET_INSURANCE_EXPIRY_DATE, params, this.getServerCallOptions());
  }
  /*
  getAppUsers(params) {
    return this.http.post(API_ROUTES.GET_APP_USERS, params, this.getServerCallOptions());
  }
  */
  maritalStatus(params) {
    return this.http.post(API_ROUTES.LOOKUP_MARITAL_STATUS, params, this.getServerCallOptions());
  }
  getCountries(params) {
    return this.http.post(API_ROUTES.LOOKUP_COUNTRIES, params, this.getServerCallOptions());
  }
  getRefByDoctors(params) {
    return this.http.post(API_ROUTES.LOOKUP_REF_DOCTOR, params, this.getServerCallOptions());
  }
  getB2BDoctors(params) {
    return this.http.post(API_ROUTES.LOOKUP_B2B_DOCTOR, params, this.getServerCallOptions());
  }
  getDoctorSpeciality(params) {
    return this.http.post(API_ROUTES.LOOKUP_DOCTOR_SPECIALITY, params, this.getServerCallOptions());
  }
  getBloodGroups(params) {
    return this.http.post(API_ROUTES.LOOKUP_BLODD_GROUPS, params, this.getServerCallOptions());
  }
  getPanels(params) {
    return this.http.post(API_ROUTES.LOOKUP_PANELS, params, this.getServerCallOptions());
  }
  getPanelsByOutsourceHospitalID(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_PANELS_BY_OUTSOURCE_HOSPITAL_ID, params, this.getServerCallOptions());
  }

  getApprovingAuthoritiesByDiscount(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_APPROVING_AUTHORITIES_BY_DISCOUNT_PERCENTAGE, params, this.getServerCallOptions());
  }
  getEmployeesForHomeSampling(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_EMP_FOR_HOME_SAMPLING, params, this.getServerCallOptions());
  }
  getEmployeesForTestRegistration(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_EMPLOYEE_FOR_TEST_REGISTRATION, params, this.getServerCallOptions());
  }
  GetFreeTestApprovalDependents(params) {
    return this.http.post(API_ROUTES.GET_FREE_TEST_APPROVAL_PATIENTS_DEPENDENTS, params, this.getServerCallOptions());
  }
  GetEmployeesForTestApproval(params) {
    return this.http.post(API_ROUTES.GET_EMPLOYEE_FOR_TEST_APPROVAL_PATIENTS, params, this.getServerCallOptions());
  }
  GetFreeTestApprovalPatientsDependents(params) {
    return this.http.post(API_ROUTES.GET_FREE_TEST_APPROVAL_PATIENTS_DEPENDENTS, params, this.getServerCallOptions());
  }
  getEmployeeListByDepDesLocID(params) {
    return this.http.post(API_ROUTES.GET_EMP_DETAILS_BY_DEP_LOC_ID, params, this.getServerCallOptions());
  }
  getEmployeeListByLocID(params) {
    return this.http.post(API_ROUTES.GET_EMP_DETAILS_BY_LOC_ID, params, this.getServerCallOptions());
  }
  getNormalEmployeeList(params) {
    return this.http.post(API_ROUTES.GET_NORMAL_EMP_DETAILS, params, this.getServerCallOptions());
  }
  getDependentList(params) {
    return this.http.post(API_ROUTES.GET_DEPENDENT_LIST, params, this.getServerCallOptions());
  }
  getFreeTestSummary(params) {
    return this.http.post(API_ROUTES.GET_FREE_TEST_SUMMARY, params, this.getServerCallOptions());
  }
  cancelFreeTestRequest(params) {
    return this.http.post(API_ROUTES.CANCEL_FREE_TEST_REQUEST, params, this.getServerCallOptions());
  }
  getMyPendingApprovals(params) {
    return this.http.post(API_ROUTES.GET_MY_PENDING_APPROVALS, params, this.getServerCallOptions());
  }
  getMyPendingApprovalsItems(params) {
    return this.http.post(API_ROUTES.GET_MY_PENDING_APPROVALS_ITEMS, params, this.getServerCallOptions());
  }
  getPreviousTotal(params) {
    return this.http.post(API_ROUTES.GET_PREVIOUS_TOTAL, params, this.getServerCallOptions());
  }
  InsertUpdateFreeTestRequest(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_FREE_TEST_REQUEST, params, this.getServerCallOptions());
  }
  InsertUpdateMyApprovals(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_MY_APPROVALS, params, this.getServerCallOptions());
  }
  getAirlines(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_AIRLINES, params, this.getServerCallOptions());
  }
  getAirports(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_AIRPORTS, params, this.getServerCallOptions());
  }
  getTestStatus(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_TEST_STATUS, params, this.getServerCallOptions());
  }
  RISStatusList(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_RIS_STATUS, params, this.getServerCallOptions());
  }
  getVaccines(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_VACCINES, params, this.getServerCallOptions());
  }
  getAppVersion(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_APP_VERSION, params, this.getServerCallOptions());
  }
  getDiscountCardsByPatientId(params) {
    return this.http.post(API_ROUTES.GET_DISCOUNT_CARDS_BY_PATIENT_ID, params, this.getServerCallOptions());
  }

  getHCCities(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_HC_CITIES, params, this.getServerCallOptions())
  }

  getProductPromotionCity(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_PRODUCT_PROMOTION_CITIES, params, this.getServerCallOptions())
  }

  getHCCityAreas(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_HC_CITY_AREAS, params, this.getServerCallOptions())
  }
  getHomeCollectionCentre(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_HC_CENTRES, params, this.getServerCallOptions())
  }

  getVehicleTypes(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_VEHICLE_TYPES, params, this.getServerCallOptions())
  }

  GetSubSectionBySectionID(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_SUBSECTION_SECTIONID, params, this.getServerCallOptions())
  }
  GetLogoutSettingByProfileID(params) {
    return this.http.post(API_ROUTES.GET_LOGOUT_SETTINGS, params, this.getServerCallOptions())
  }

  GetSubSectionByEmpID(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_SUBSECTION_BY_EMPID, params, this.getServerCallOptions())
  }
  GetTestInfoByTPID(params){
    return this.http.post(API_ROUTES.GET_TESTINFO_TPID, params, this.getServerCallOptions())
  }

  getSectionBySectionID(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_SECTION_SECTIONID, params, this.getServerCallOptions())
  }

  getSubSectionByParent(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_SUBSECTION_BY_PARENT_SECTIONID, params, this.getServerCallOptions())
  }

  getDiscountCardType() {
    return this.http.post(API_ROUTES.LOOKUP_GET_DISCOUNT_CARD_TYPE, null, this.getServerCallOptions())
  }
  getCutomDiscountNumber(params) {
    return this.http.post(API_ROUTES.GET_CUTOME_DISCOUNT_CARD_NUMBER, params, this.getServerCallOptions())
  }

  getPanelByPanelType(param) {
    return this.http.post(API_ROUTES.LOOKUP_GET_PANEL_BY_PANEL_TYPE, param, this.getServerCallOptions())
  }

  getExtension(params) {
    return this.http.post(API_ROUTES.LOOKUP_EXTENSIONS, params, this.getServerCallOptions());
  }
  getPanelDetailByPanelID(params) {
    return this.http.post(API_ROUTES.LOOKUP_GET_PANEL_DETAIL_BY_PANEL_ID, params, this.getServerCallOptions());
  }
  getDHRMGeneralShift(params) {
    return this.http.post(API_ROUTES.GET_DHRM_GENERAL_SHIFT , params, this.getServerCallOptions());
  }
  getWorkWeek(params) {
    return this.http.post(API_ROUTES.GET_WORK_WEEK , params, this.getServerCallOptions());
  }

  getMobileDeviceTokensByPatientID(params) {
    return this.http.post(API_ROUTES.GET_MOBILE_DEVICE_TOKEN_BY_PATIENTID, params, this.getServerCallOptions());
  }

  getUserProvince(params) {
    return this.http.post(API_ROUTES.USER_PROVINCE, params, this.getServerCallOptions());
  }
 
  logData(params){
    return this.http.post(API_ROUTES.USER_PROVINCE, params, this.getServerCallOptions());
  }

  // KBS API Calls
  getKBSBranche(params) {
    return this.http.post(API_ROUTES.GET_KBS_BRANCH, params, this.getServerCallOptions());
  }
  getKBSServices(params) {
    return this.http.post(API_ROUTES.GET_KBS_SERVICES, params, this.getServerCallOptions());
  }
  getKBSBranchServicesByLocID(params) {
    return this.http.post(API_ROUTES.GET_KBS_BRANCH_SERVICES_BY_LOC_ID, params, this.getServerCallOptions());
  }
  getKBSBranchServicesByServiceID(params) {
    return this.http.post(API_ROUTES.GET_KBS_BRANCH_SERVICES_BY_SERVICE_ID, params, this.getServerCallOptions());
  }
  getKBSBranchServices(params) {
    return this.http.post(API_ROUTES.GET_KBS_BRANCH_SERVICES, params, this.getServerCallOptions());
  }
  insertUpdateKBSBranchServices(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_KBS_BRANCH_SERVICES, params, this.getServerCallOptions());
  }
  insertUpdateDKBSBranch(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_D_KBS_BRANCH, params, this.getServerCallOptions());
  }
  insertUpdateDKBSServices(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_D_KBS_SERVICES, params, this.getServerCallOptions());
  }
  getKBSTickerData(params) {
    return this.http.post(API_ROUTES.GET_KBS_TICKER_DATA, params, this.getServerCallOptions());
  }
  insertUpdateDKBSTickerCategory(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_D_KBS_TICKER_CATEGORY, params, this.getServerCallOptions());
  }
  insertUpdateKBSTicker(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_KBS_TICKER, params, this.getServerCallOptions());
  }
   getKBSTickerCategory(params) {
    return this.http.post(API_ROUTES.GET_KBS_TICKER_CATEGORY, params, this.getServerCallOptions());
  }
   getActiveKBSTickerDetail(params) {
    return this.http.post(API_ROUTES.GET_ACTIVE_KBS_TICKER_DETAIL, params, this.getServerCallOptions());
  }
   deleteKBSTicker(params) {
    return this.http.post(API_ROUTES.DELETE_KBS_TICKER, params, this.getServerCallOptions());
  }

   deleteKBSDocument(params) {
    return this.http.post(API_ROUTES.DELETE_KBS_DOCUMENT, params, this.getServerCallOptions());
  }
   deleteKBSDocumentCategory(params) {
    return this.http.post(API_ROUTES.DELETE_KBS_DOCUMENT_CATEGORY, params, this.getServerCallOptions());
  }
   getKBSDocumentsPaged(params) {
    return this.http.post(API_ROUTES.GET_KBS_DOCUMENT_PAGED, params, this.getServerCallOptions());
  }
   getKBSDocumentsCategory(params) {
    return this.http.post(API_ROUTES.GET_KBS_DOCUMENT_CATEGORY, params, this.getServerCallOptions());
  }
   documentUploadValidation(params) {
    return this.http.post(API_ROUTES.DOCUMENT_UPLOAD_VALIDATION, params, this.getServerCallOptions());
  }
   insertUpdateDKBSDocumentCategory(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_D_KBD_DOCUMENT_CATEGORY, params, this.getServerCallOptions());
  }
   insertUpdateKBSDocumentsWithValidation(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_D_KBD_DOCUMENT_WITH_VALIDATION, params, this.getServerCallOptions());
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
