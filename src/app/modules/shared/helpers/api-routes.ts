// @ts-nocheck
import { environment } from "src/environments/environment";


export class API_ROUTES {
  static API_URL = environment.apiUrl;
  static VIMS_API_URL = environment.vimsApiUrl;
  // static PATIENT_PORTAL_API_URL = ''; // environment.patientPortalApiUrl;
  static PATIENT_PORTAL_API_URL = environment.patientPortalApiUrl; // environment.patientPortalApiUrl;
  // static BACK_OFFICE_API_URL = environment.backOfficeApiUrl; // environment.patientPortalApiUrl;
  static API_BASE_URL_PUSH_NOTIFICATIONS = environment.pushNotificationsApiUrl;
  // static PATIENT_PORTAL_LOCAL_API_URL = environment.patientPortalLocalApiUrl;
  // static API_URL = 'https://localhost:44388/api/';
  static API_BASE_URL_FBR = environment.fbrApiUrl;

  static API_URL_SR = environment.smartReportApiUrl;


  // API End Points
  static LOGIN = `${API_ROUTES.API_URL}Login/VerifyUserLogin`;
  static LOGIN_EMPLOYEE_USER = `${API_ROUTES.VIMS_API_URL}Login/VerifyLogin`;
  static LOGIN_USER_DETAILS = `${API_ROUTES.API_URL}Login/UserDetails`;

  static GET_ROLES = `${API_ROUTES.API_URL}UserRole/GetRoles`;
  static UPDATE_ROLE = `${API_ROUTES.API_URL}UserRole/InsertUpdateUserRole`;
  static GET_USERS_BY_ROLE = `${API_ROUTES.API_URL}UserRole/GetUsersByRoleID`;
  static INSERT_ACTION_LOG = `${API_ROUTES.API_URL}Login/InsertActionLog`;

  static GET_HC_BOOKING_DETAIL = `${API_ROUTES.API_URL}HCReports/HCBookingDetailRpt`;
  static GET_HC_BOOKING_AUDIT_SUMMARY = `${API_ROUTES.API_URL}HCReports/GetBookingPatientAuditSummary`;
  static GET_HC_BOOKING_AUDIT_DETAIL = `${API_ROUTES.API_URL}HCReports/GetBookingPatientAuditLogDetail`;
  static GET_HC_SHARE_DETAIL_RPT = `${API_ROUTES.API_URL}HCReports/HCShareDetailRpt`;
  static GET_HC_SHARE_SUMMARY_RPT = `${API_ROUTES.API_URL}HCReports/HCShareSummaryRpt`;
  static HC_STATUS_WISE_RPT = `${API_ROUTES.API_URL}HCReports/HCStatusWiseRpt`;
  static GET_HC_SHARE_COMPLIENCE_RPT = `${API_ROUTES.API_URL}HCReports/HCShareReportForComplience`;
  static GET_HC_TEST_STATUS = `${API_ROUTES.API_URL}HomeCollection/GetHomeSamplingTestStatus`;

  static HOME_COLLECTION_CITIES = `${API_ROUTES.API_URL}Shared/Cities`;


  //HC Rider Dashboard
  static HC_RIDER_DASHBOARD_INFO = `${API_ROUTES.API_URL}HCRiderDashboard/GetHCDetailForRiderDashboard`;
  static HC_RIDER_Q_CHECKLIST = `${API_ROUTES.API_URL}HCRider/GetRiderQCheckList`;

  //Rider
  static HC_GET_USER_TYPE = `${API_ROUTES.API_URL}HCRider/GetHCUserType`;
  static HC_INACTIVE_RIDER = `${API_ROUTES.API_URL}HCRider/InActiveRider`;
  static HC_RIDER_Routine_QPIC = `${API_ROUTES.API_URL}HCRider/GetRiderQAnswerRoutinePic`;
  static HC_RIDER_DEVICE_INFO = `${API_ROUTES.API_URL}HCRider/GetRiderDeviceInfo`;
  static GET_HC_RIDER_SHARE_REPORT = `${API_ROUTES.API_URL}HCRider/GetHCRiderShareReport`;
  static GET_HC_PORTABLE_SERVICES_SHARE_REPORT = `${API_ROUTES.API_URL}Shared/GetPortableXRayShare`;
  static INSERT_RIDER_MESSAGE_BOX = `${API_ROUTES.API_URL}HCRider/InsertMessageBox`;


  //Home collection Configs 
  static GET_HC_CITIES = `${API_ROUTES.API_URL}HCConfigs/HCCities`;
  static GET_HC_SERVICES = `${API_ROUTES.API_URL}CMSLookup/HCServices`;
  static UPDATE_HC_USER_CITY_AUTH = `${API_ROUTES.API_URL}HCConfigs/UpdateUserCityAuth`;
  static INSERT_UPDATE_HC_CITY = `${API_ROUTES.API_URL}HCConfigs/InsertUpdateHCCity`;
  static GET_AUTHORIZE_CITIES_BY_USERID = `${API_ROUTES.API_URL}HCConfigs/UserCityAuthorizationsByUserID`;
  static HC_REG_TP_DETAIL_BY_HCREQ_ID = `${API_ROUTES.API_URL}HCRegisteredTP/GetTestProfileStausByHCRequestID`;
  static CC_REQ_HANDLING = `${API_ROUTES.API_URL}FeedBack/CCRFeedBack`;

  static GET_CMS_CATEGORY = `${API_ROUTES.API_URL}CMSLookup/GetCMSCategory`;
  static GET_SUB_CMS_CATEGORY = `${API_ROUTES.API_URL}CMSLookup/GetCMSSubCategories`;
  static GET_CMS_REQ_TYPE = `${API_ROUTES.API_URL}CMSLookup/GetCMSType`;
  static SAVE_CMS_REQUEST = `${API_ROUTES.API_URL}CMS/SaveAssignCMSRequest`;
  static GET_CMS_REQUEST_SOURCE = `${API_ROUTES.API_URL}CMSLookup/GetCMSRequestSource`;
  static GET_CMS_CATEGORY_COUNTS = `${API_ROUTES.API_URL}CMSDashboard/GetCMSCategoryCounts`;
  static GET_CMS_REQUEST_COUNTS = `${API_ROUTES.API_URL}CMSDashboard/GetCMSCountByCreatedByUserID`;




  static SEND_NOTIFICATION_TO_BRANCH_RIDERS = `${API_ROUTES.API_BASE_URL_PUSH_NOTIFICATIONS}PushRiderNotifications/GetDeviceToken`;

  static GET_PERMISSIONS = `${API_ROUTES.API_URL}Permissions/GetPermissions`;
  static UPDATE_ROLE_PERMISSIONS = `${API_ROUTES.API_URL}Permissions/UpdateRolePermissions`;

  static GET_USERS = `${API_ROUTES.API_URL}UserRole/GetUsers`;
  static UPDATE_USER_ROLE = `${API_ROUTES.API_URL}UserRole/UpdateUserRole`;

  static SEARCH_PATIENT = `${API_ROUTES.API_URL}Patient/SearchPatient`;
  static SEARCH_PATIENT_BY_REFNO_FOR_GIZ = `${API_ROUTES.API_URL}Patient/SearchPatientByRefNoForGIZ`;
  static GET_VISITID_BY_LOCID = `${API_ROUTES.API_URL}Patient/getVisitIDByLocID`;
  static UPDATE_STATUS_BY_VISITID_TPID = `${API_ROUTES.API_URL}Patient/UpdateStatusOnDeskByVisitTPId`;
  static SEARCH_PATIENT_INFO_BY_VISITID = `${API_ROUTES.API_URL}Patient/GetPatientInfoByVisitID`;
  // static SEARCH_PATIENT_VIMS = `${API_ROUTES.VIMS_API_URL}Patient/SearchPatientVIMS`;
  // static SEARCH_PATIENT_ORBIT = `${API_ROUTES.API_URL}Patient/SearchPatient`;
  // static SEARCH_PATIENT_BOOKING_ID = `${API_ROUTES.VIMS_API_URL}Patient/SearchPatientByBookingID`;
  static SEARCH_PATIENT_BOOKING_ID = `${API_ROUTES.API_URL}Patient/SearchPatientByBookingID`;
  static GET_PATIENT_IMAGE = `${API_ROUTES.API_URL}Patient/GetPatientPic`;
  static INSERT_UPDATE_PATIENT = `${API_ROUTES.API_URL}Patient/InsertUpdatePatient`;
  static GET_DISCOUNT_CARD_DETAILS = `${API_ROUTES.API_URL}DiscountCard/DiscountCardInfo`;
  static GET_DISCOUNT_CARD_LIST = `${API_ROUTES.API_URL}DiscountCard/GetDiscountCardList`;
  static GET_FAMILY_CARD_DETAILS = `${API_ROUTES.API_URL}DiscountCard/DiscountCardFamilyDetails`;
  static INSERT_FAMILY_CARD_DETAILS = `${API_ROUTES.API_URL}DiscountCard/InsertUpdateDiscountCardFamily`;
  static GET_RELATIONSHIP_NAMES = `https://reports.idc.net.pk/OnlinePortalsServiceData/api/V1/Shared/GetRelationNames`;
  static ARY_SAHOOLAT_CARD = `${API_ROUTES.API_URL}DiscountCard/GetArySahulatCardNumber`;

  static PATIENT_VISITS = `${API_ROUTES.API_URL}Visit/GetPatientVisits`;
  static VISIT_DETAILS = `${API_ROUTES.API_URL}Visit/GetVisitDetails`;
  static VISIT_DETAILS_ADVANCE_CANCELATION = `${API_ROUTES.API_URL}Visit/GetVisitDetailsForAdvCancel`;
  static CANCEL_VISIT = `${API_ROUTES.API_URL}Visit/VisitTPCancellation`;
  static ADVANCE_CANCEL_VISIT = `${API_ROUTES.API_URL}Visit/VisitAdvTPCancellation`;
  static GENERATE_CANCEL_OTP_VISITID = `${API_ROUTES.API_URL}Visit/GenerateCancelOTPByVisitID`;
  static GET_VISIT_ID_BY_ORDERNo = `${API_ROUTES.API_URL}Visit/GetVisitIDByOrderNo`;

  static GET_SALE_BY_FDO = `${API_ROUTES.API_URL}Sales/GetSaleByFDO`;
  static GET_ALL_SALE_BY_FDO = `${API_ROUTES.API_URL}Sales/GetAllSaleByFDO`;
  static GET_FDO_SUMMARY_REPORT = `${API_ROUTES.API_URL}Sales/GetSaleSummaryByFDO`;
  static GET_BRANCH_SALE_SUMMARY_REPORT = `${API_ROUTES.API_URL}Sales/GetSaleSummaryByLocID`;
  static INSERT_BRANCH_SALE_CLOSING = `${API_ROUTES.API_URL}Sales/InsertVisitSaleBranchClosing`;
  static GET_REGISTRATIONS_BY_FDO = `${API_ROUTES.API_URL}Patient/GetRegistrationByUserID`;
  static UPDATE_SALE_CLOSING_BY_FDO = `${API_ROUTES.API_URL}Sales/UpdateFDOPaymentCashClosing`;

  static LOOKUP_FOR_REGISTRATION = `${API_ROUTES.API_URL}Lookup/LookupsForRegistration`;
  static LOOKUP_GET_BRANCHES = `${API_ROUTES.API_URL}Lookup/GetBranches`;
  static LOOKUP_GET_BRANCHES_BY_CITY_IDS = `${API_ROUTES.API_URL}Lookup/GetBranchesByCityIDs`;
  static tt = `${API_ROUTES.API_URL}OCR/test`;
  static LOOKUP_GET_CMS_PRIORITY_LIST = `${API_ROUTES.API_URL}CMSLookup/GetCMSPriorityList`;
  static LOOKUP_GET_BRANCHES_BY_USER_ID = `${API_ROUTES.API_URL}Lookup/GetAllLocationByUserID`;
  static LOOKUP_GET_PAYMENT_MODE_BY_PAYMENT_MODE_CATEGORY = `${API_ROUTES.API_URL}Lookup/GetPaymentModeByPaymentModeCategory`;
  static LOOKUP_GET_PANEL_BY_PANEL_TYPE = `${API_ROUTES.API_URL}Lookup/GetPanelByPanelType`;
  static LOOKUP_GET_DEPARTMENTS = `${API_ROUTES.API_URL}Lookup/GetDepartments`;
  static LOOKUP_GET_SUB_DEPARTMENTS = `${API_ROUTES.API_URL}Lookup/GetSubDepartments`;
  static LOOKUP_GET_CMS_ACTION_TAKEN = `${API_ROUTES.API_URL}CMSLookup/GetCMSActionTakenMeasures`;
  static LOOKUP_GET_PRIORITY_LEVELS = `${API_ROUTES.API_URL}Lookup/GetPriorityLevels`;
  static LOOKUP_GET_NOTIFY_TYPE = `${API_ROUTES.API_URL}Lookup/GetNotifyType`;
  static LOOKUP_MOBILE_OPERATORS = `${API_ROUTES.API_URL}Lookup/MobileOperator`;
  static LOOKUP_GENDERS = `${API_ROUTES.API_URL}Lookup/Gender`;
  static LOOKUP_SALUTATIONS = `${API_ROUTES.API_URL}Lookup/Salutations`;
  static LOOKUP_NOTATIONS = `${API_ROUTES.API_URL}Lookup/Notations`;
  static LOOKUP_MARITAL_STATUS = `${API_ROUTES.API_URL}Lookup/MaritalStatus`;
  static LOOKUP_COUNTRIES = `${API_ROUTES.API_URL}Lookup/Countries`;
  static LOOKUP_CITIES = `${API_ROUTES.API_URL}Lookup/Cities`;
  static LOOKUP_REF_DOCTOR = `${API_ROUTES.API_URL}Lookup/RefByDoctors`;
  static LOOKUP_PERSONAL_RELATION = `${API_ROUTES.API_URL}Lookup/GetPersonalRelation`;
  static GET_REF_BY_LIST = `${API_ROUTES.API_URL}Doctor/GetRefByList`;
  static GET_B2B_DOCTOR_SHARE_REPORT = `${API_ROUTES.API_URL}Doctor/GetB2BDoctorShareReport`;
  static GET_B2B_DOCTOR_REF_LIST_EXPORT = `${API_ROUTES.API_URL}B2B/GETRefListforExport`;
  static LOOKUP_B2B_DOCTOR = `${API_ROUTES.API_URL}Lookup/B2BDoctors`;
  static LOOKUP_DOCTOR_SPECIALITY = `${API_ROUTES.API_URL}Lookup/DoctorSpeciality`;
  static ADD_EDIT_B2B_DOCTOR = `${API_ROUTES.API_URL}Doctor/InsertUpdateB2BDoctor`;
  static ADD_EDIT_REF_BY_DOCTOR = `${API_ROUTES.API_URL}Doctor/InsertUpdateRefByDoctor`;
  static GET_REF_BY_DOCTORS_TO_BE_SHIFT = `${API_ROUTES.API_URL}Doctor/GetRefByDoctorsToBeShift`;
  static INSERT_UPDATE_REF_BY_DOCTORS_TO_BE_SHIFT = `${API_ROUTES.API_URL}Doctor/InsertUpdateRefByDoctorsToBeShiftRefByDoctor`;
  static DELETE_REF_BY_DOCTOR = `${API_ROUTES.API_URL}Doctor/DeleteRefByDoctor`;
  static ADD_REF_BY_B2B_DOCTOR_MAPPING = `${API_ROUTES.API_URL}Doctor/insertRefByB2BDoctorsMapping`;
  static GET_REF_BY_B2B_DOCTOR_MAPPING = `${API_ROUTES.API_URL}Doctor/getRefByB2BDoctorsMapping`;
  static LOOKUP_BLODD_GROUPS = `${API_ROUTES.API_URL}Lookup/BloodGroups`;
  static LOOKUP_PANELS = `${API_ROUTES.API_URL}Lookup/Panels`;
  static LOOKUP_GET_PANELS_BY_OUTSOURCE_HOSPITAL_ID = `${API_ROUTES.API_URL}Lookup/GetPanelsByOutsourceHospitalID`;
  static LOOKUP_GET_APPROVING_AUTHORITIES_BY_DISCOUNT_PERCENTAGE = `${API_ROUTES.API_URL}Lookup/GetAuthorizedEmployeesForDiscount`;
  static LOOKUP_GET_EMP_FOR_HOME_SAMPLING = `${API_ROUTES.API_URL}Lookup/GetEmployeesForHomeSampling`;
  static LOOKUP_GET_EMPLOYEE_FOR_TEST_REGISTRATION = `${API_ROUTES.API_URL}Employee/GetEmployeesForTestRegistration`;
  static GET_EMPLOYEE_FOR_TEST_APPROVAL_PATIENTS = `${API_ROUTES.API_URL}Employee/GetFreeTestRequest_ApprovedPatients`;
  static GET_FREE_TEST_APPROVAL_PATIENTS_DEPENDENTS = `${API_ROUTES.API_URL}Employee/GetFreeTestRequest_ApprovedPatientDependents`;
  static LOOKUP_GET_TEHSIL_BY_DISTRICT_ID = `${API_ROUTES.API_URL}Lookup/GetTehsilsByDistrictID`;
  static LOOKUP_GET_AIRLINES = `${API_ROUTES.API_URL}Lookup/Airlines`;
  static LOOKUP_GET_AIRPORTS = `${API_ROUTES.API_URL}Lookup/Airports`;
  static LOOKUP_GET_TEST_STATUS = `${API_ROUTES.API_URL}Lookup/TestStatus`;
  static LOOKUP_GET_RIS_STATUS = `${API_ROUTES.API_URL}Lookup/GetRISStatus`;
  static LOOKUP_MOBILE_OPERATOR_BY_CODE = `${API_ROUTES.API_URL}Lookup/GetMobileOperatorsByMobCode`;
  static LOOKUP_GET_VACCINES = `${API_ROUTES.API_URL}Lookup/Vaccines`;
  static LOOKUP_GET_APP_VERSION = `${API_ROUTES.API_URL}Login/AppVersion`;
  static LOOKUP_GET_DESIGNATION = `${API_ROUTES.API_URL}Lookup/GetDesignation`;
  static LOOKUP_GET_PAYMENT_MODES = `${API_ROUTES.API_URL}Lookup/PaymentModes`;
  static LOOKUP_GET_SUBSECTION_SECTIONID = `${API_ROUTES.API_URL}Lookup/GetSubSectionBySectionID`;
  static GET_LOGOUT_SETTINGS = `${API_ROUTES.API_URL}Login/GetLogoutSettings`;
  static LOOKUP_GET_SUBSECTION_BY_EMPID = `${API_ROUTES.API_URL}Lookup/GetSubSectionByEmpID`;
  static LOOKUP_GET_SECTION_SECTIONID = `${API_ROUTES.API_URL}Lookup/GetSectionBySectionID`;
  static LOOKUP_GET_SUBSECTION_BY_PARENT_SECTIONID = `${API_ROUTES.API_URL}Lookup/GetSubSectionByParent`;
  static LOOKUP_GET_DISCOUNT_CARD_TYPE = `${API_ROUTES.API_URL}Lookup/GetDiscountCardType`;
  static LOOKUP_GET_TEHSILS = `${API_ROUTES.API_URL}Lookup/GetTehsils`;
  static LOOKUP_GET_PROVINCE = `${API_ROUTES.API_URL}Lookup/GetProvinces`;
  static LOOKUP_GET_DISTRICTS = `${API_ROUTES.API_URL}Lookup/GetDistricts`;
  static GET_CUTOME_DISCOUNT_CARD_NUMBER = `${API_ROUTES.API_URL}DiscountCard/GetCutomDiscountNumber`;
  static GET_INSURANCE_EXPIRY_DATE = `${API_ROUTES.API_URL}InsurancePolicies/insurance-batch`;
  static LOOKUP_GET_ACCOUNT = `${API_ROUTES.API_URL}Sales/GetAccount`;

  static GET_DISCOUNT_CARDS_BY_PATIENT_ID = `${API_ROUTES.API_URL}DiscountCard/GetDiscountCardByPatientId`;

  static CREATE_SESSION_MCB = `${API_ROUTES.API_URL}Visit/create-session-mcb`;
  static CREATE_VISIT = `${API_ROUTES.API_URL}Visit/CreateVisit`;
  static GET_INSUARANCE_BITS = `${API_ROUTES.API_URL}Visit/InsuarancePolicyBits`;
  static ARY_PANEL_ID = `${API_ROUTES.API_URL}Visit/AryPanelID`;
  static GET_INSUARANCE_Details = `${API_ROUTES.API_URL}InsurancePolicies/1`;
  static INSURANCE_DETAIL_BYPID = `${API_ROUTES.API_URL}InsurancePolicies/insurance-detail-by-pid`;
  static UPDATE_INSURANCE_POLICY_STATUS = `${API_ROUTES.API_URL}InsurancePolicies/update-wiling-status`;
  static GET_CONSCENT_DETAIL_BY_VISITID = `${API_ROUTES.API_URL}Visit/GetConscentDetailByVisitID`;
  static CREATE_VISIT_LIVE = `${API_ROUTES.API_URL}Visit/CreateVisitLive`;
  static GENERATE_PATIENT_REPORT_URL1 = `${API_ROUTES.PATIENT_PORTAL_API_URL}PatientResults/GetPatientReportUrl/`;
  static GENERATE_PATIENT_REPORT_URL = `${API_ROUTES.PATIENT_PORTAL_API_URL}PatientResults/GetPatientReportUrl/`;
  static UPDATE_REPORT_STATUS = `${API_ROUTES.API_URL}TestProfile/UpdateReportStatus/`;
  static GET_PATIENT_VISIT_DETAIL1 = `${API_ROUTES.PATIENT_PORTAL_API_URL}PatientResults/GetPatientVisitDetail/`;
  static GET_PATIENT_VISIT_DETAIL = `${API_ROUTES.PATIENT_PORTAL_API_URL}V3/PatientResults/GetPatientVisitDetail/`;
  static BOOK_HC_PATIENT = `${API_ROUTES.PATIENT_PORTAL_API_URL}PatientRegistration/SaveRegistrationInformation/`;

  static SAVE_DISCOUNT_CARD_SALE = `${API_ROUTES.API_URL}Visit/SaveDiscountCardSale`;

  static GET_VISITS_FOR_RESULT_ENTRY = `${API_ROUTES.API_URL}Visit/GetPatientVisitsForResultsEntry`;
  static GET_VISIT_TESTS_BY_VISITID = `${API_ROUTES.API_URL}Visit/GetVisitTestsByVisitId`;
  static INSERT_VISIT_TESTS_RESULTS = `${API_ROUTES.API_URL}Visit/InsertPatientVisitTestResult`;
  static UPDATE_VISIT_TESTS_STATUS_RESULTS_ENTRY = `${API_ROUTES.API_URL}Visit/UpdatePatientVisitTestFinalize`;
  static UPDATE_VISIT_TESTS_STATUS_RESULTS_ENTRY_FOR_RIS = `${API_ROUTES.API_URL}Visit/UpdatePatientVisitTestFinalizeForRIS`;
  static INSERT_VISIT_INSTALLMENT = `${API_ROUTES.API_URL}Visit/InsertVisitInstallment`;
  static INSERT_AVAILABLE_RADIOLOGIST = `${API_ROUTES.API_URL}RISConfig/UpdateDoctorAvailability`;
  static INSERT_SERVICES_FOR_KBS = `${API_ROUTES.API_URL}RISConfig/UpdateServiceTPLocation`;
  static GET_POS_ID = `${API_ROUTES.API_URL}Visit/GetPOSIDByMACAddress`;
  static GET_VISITS_FOR_CANCELLATION_APPROVEL = `${API_ROUTES.API_URL}Visit/GetVisitsForCancellationApprovel`;
  static GET_VISITS_FOR_ADV_CANCELLATION_APPROVEL = `${API_ROUTES.API_URL}Visit/GetVisitsForAdvCancellationApprove`;
  static GET_DOCUMENT_AUDIT_DATA = `${API_ROUTES.API_URL}DocumentAudit/GetDocumentsAuditData`;

  static GET_EMP_MEDICAL_RECORD = `${API_ROUTES.API_URL}Reports/GetEmployeeVisits`;
  static GET_VISIT_DETAILS_FOR_SMART_REPORT = `${API_ROUTES.API_URL}Reports/GetSmartReportDataSet`;
  static GENERATE_SMART_REPORT = `${API_ROUTES.API_URL_SR}v1/reports/generate`;


  static GET_TP_BY_CELLNO = `${API_ROUTES.API_URL}TestProfile/GetTestProfileByCellNo`;
  static GET_VISITS_BY_TPIDS = `${API_ROUTES.API_URL}TestProfile/GetPatientVisitsByTPIDs`;
  static GET_TEST_PROFILES_FOR_REG = `${API_ROUTES.API_URL}TestProfile/GetTestProfileForRegistration`;
  static GET_PATIENT_VISIT_DETAIL_BY_PATIENT_ID = `${API_ROUTES.API_URL}Patient/GetPatientVisitsByPatientID`;
  static GET_TEST_PROFILES_BY_DISEASE = `${API_ROUTES.API_URL}RISConfig/GetTestProfileByDiseases`;
  static GET_TEST_PROFILES_RADIOLOGIST_TESTS = `${API_ROUTES.API_URL}DoctorShare/GetTestProfileByisRadiologyTests`;
  static GET_LOOKUP_TEST_PROFILES_FOR_CHARGE_MASTER = `${API_ROUTES.API_URL}TestProfile/GetLookupTestProfileForChargeMaster`;
  static GET_TEST_PROFILES_FOR_ANALYTICS = `${API_ROUTES.API_URL}TestProfile/GetTestProfileForAnalytics`;
  static GET_PACKAGE_TEST_PROFILES = `${API_ROUTES.API_URL}TestProfile/GetPackageTestProfileForRegistration`;
  static GET_TESTS_BY_PROFILE_ID = `${API_ROUTES.API_URL}TestProfile/GetTestsByProfileId`;
  static GET_TESTS_BY_TEST_PROFILE_ID = `${API_ROUTES.API_URL}TestProfile/GetTestsByTestProfileID`;
  static GET_TESTS_FOR_CANCELLATION_APPROVEL = `${API_ROUTES.API_URL}TestProfile/GetTestsForCancellationApprovel`;
  static APPROVE_TESTS_CANCELLATION = `${API_ROUTES.API_URL}TestProfile/ApproveTestsCancellationRequest`;
  static GET_TEST_PROFILE_PROTOCOL_AND_PATIENT_INSTRUCTION = `${API_ROUTES.API_URL}TestProfile/GetTestProfileProtocolAndPatientInstruction`;
  static GET_PARAMETERS_BY_TPID = `${API_ROUTES.API_URL}TestProfile/GetParameterByTPID`;

  /* Phlebotomy */
  static GET_VISITS_FOR_PHLEBOTOMY = `${API_ROUTES.API_URL}Visit/GetPatientVisitsForPhlebotomy`;
  static GET_VISITS_FOR_SECURITY_REFUND = `${API_ROUTES.API_URL}Visit/GetVisitsForSecurityRefund`;
  static GET_VISIT_SAMPLES = `${API_ROUTES.API_URL}Visit/GetVisitSamples`;
  static GET_VISIT_DETAIL_FOR_SECURITY_REFUND = `${API_ROUTES.API_URL}Visit/GetVisitDetailsForSecurityRefund`;
  static GET_VISIT_DETAIL_FOR_PANEL_CONVERSION = `${API_ROUTES.API_URL}Visit/GetVisitDetailForPanelConversion`;
  static INSERT_VISIT_PANEL_SHIFTNG = `${API_ROUTES.API_URL}Visit/InsertVisitPanelShifting`;
  static UPDATE_VISIT_TESTS_STATUS = `${API_ROUTES.API_URL}Visit/UpdateVisitTestsStatus`;
  static GET_VISIT_QUESTIONNAIRE = `${API_ROUTES.API_URL}Questionnaire/GetVisitQuestionnaire`;
  static SAVE_VISIT_QUESTIONNAIRE = `${API_ROUTES.API_URL}Questionnaire/SaveVisitQuestionnaire`;
  static GET_VISIT_REMARKS = `${API_ROUTES.API_URL}Visit/GetVisitRemarks`;
  static SAVE_VISIT_REMARKS = `${API_ROUTES.API_URL}Visit/SaveVisitRemarks`;
  static GET_VISIT_DOCS = `${API_ROUTES.API_URL}Visit/GetVisitDocuments`;
  static GET_VISIT_DOC_BY_ID = `${API_ROUTES.API_URL}Visit/GetVisitDocumentByDocId`;
  static SAVE_VISIT_DOCS = `${API_ROUTES.API_URL}Visit/SaveVisitDocuments`;


  /* Reset Password */
  static SEND_RESET_PASSWORD_URL = `${API_ROUTES.API_URL}EP/SRPL`;  //SendResetPasswordUrL

  /* Doctor Share Slip */
  static GET_RADIO_SHARE_DETAILS = `${API_ROUTES.API_URL}DoctorShare/GetRadioDocShareDetail`;
  static GET_RIS_SHARE_DETAILS_ACCOUNTS = `${API_ROUTES.API_URL}DoctorShare/GetRISDoctorShareDetail`;
  static GET_RADIO_SHARE_DETAILS_V2 = `${API_ROUTES.API_URL}DoctorShare/GetRadioDocShareDetail_V2`;
  static GET_RADIO_SHARE_SUMMARY = `${API_ROUTES.API_URL}DoctorShare/GetRadioDocShareSummary`;
  static GET_RADIO_SHARE_SUMMARY_V2 = `${API_ROUTES.API_URL}DoctorShare/GetRadioDocShareSummary_V2`;
  static GET_SALES_DEPOSIT_SLIPS = `${API_ROUTES.API_URL}Sales/GetSalesDepositDocumentBySaleDate`;
  static INSERT_SALES_DEPOSIT_SLIPS = `${API_ROUTES.API_URL}Sales/InsertSaleDepositDocument`;
  static GET_TEST_HEAD = `${API_ROUTES.API_URL}DoctorShare/GetTestHead`;

  /* Manage Panels */
  static GET_PANEL_USERS = `${API_ROUTES.API_URL}PanelBilling/GetPanelUsers`;
  static GET_PANEL_USERS_DETAILS = `${API_ROUTES.API_URL}PanelBilling/GetPanelUserDetailByPanelUserID  `;
  static DELETE_PANEL_USERS = `${API_ROUTES.API_URL}PanelBilling/DeletePanelUserByPanelUserId`;
  static DELETE_PANEL_BY_PANELID = `${API_ROUTES.API_URL}PanelBilling/DeleteDPanelByPanelId`;
  static INSERT_UPDATE_PANEL_USERS = `${API_ROUTES.API_URL}PanelBilling/InsertUpdatePanelUser  `;
  static INSERT_UPDATE_PANEL_USERS_ASSOCIATION = `${API_ROUTES.API_URL}PanelBilling/InsertPanelUserAssociation  `;
  static GET_GIZ_BILL_SALES = `${API_ROUTES.API_URL}PanelBilling/GetPanelBillDetailSaleReport`;

  static GET_PANEL_TYPE = `${API_ROUTES.API_URL}PanelBilling/GetIPanelType`;
  static GET_PANEL_BILLING = `${API_ROUTES.API_URL}PanelBilling/GetIPanelBilling`;
  static GET_PANEL_RATE_DISPLAY = `${API_ROUTES.API_URL}PanelBilling/GetIPanelRateDisplay`;
  static GET_DTEST_PROFILE_PRICELIST = `${API_ROUTES.API_URL}PanelBilling/GetDTestProfilePriceList`;
  static GET_LAB_DEPARTMENT = `${API_ROUTES.API_URL}PanelBilling/GetILabDepartment`;
  static GET_ALL_TESTS_BY_PANELID_PRICELISTID = `${API_ROUTES.API_URL}PanelBilling/GetAllTestsByPanelIDPriceListId`;
  static GET_CHART_OF_ACCOUNT = `${API_ROUTES.API_URL}PanelBilling/GetDFASChartOfAccount`;
  static GET_PANEL_LIST = `${API_ROUTES.API_URL}PanelBilling/GetDPanelList`;
  static GET_ACC_MAINTENANCE_BY_COAID = `${API_ROUTES.API_URL}PanelBilling/GetDFASAccountMaintenanceByCOAId`;
  static GET_PANEL_LOCATIONS_PANELID = `${API_ROUTES.API_URL}PanelBilling/GetPanelLocationsByPanelID`;
  static GET_PANEL_USERS_PANELID = `${API_ROUTES.API_URL}PanelBilling/GetPanelUserDetailByPanelId`;
  static GET_PANEL_DETAILS_PANELID = `${API_ROUTES.API_URL}PanelBilling/GetDPanelDetailByPanelID`;
  static INSERT_UPDATE_PANEL = `${API_ROUTES.API_URL}PanelBilling/InsertUpdatePanel`;

  /* Documents */
  static GET_GENERAL_DOCS = `${API_ROUTES.API_URL}Docs/GetGeneralDocumentsByRefIdDocTypeId`;
  static GET_BRANCH_CLOSING_DOCS = `${API_ROUTES.API_URL}Sales/GetVisitSaleBranchClosingDepositDocByID`;
  static GET_GENERAL_DOCS_BY_ID = `${API_ROUTES.API_URL}Docs/GetGeneralDocumentsByDocId`;
  static SAVE_GENERAL_DOCS = `${API_ROUTES.API_URL}Docs/SaveGeneralDocumentsByRefIdTypeId`;
  static SAVE_GENERAL_DOCS_BY_REFID = `${API_ROUTES.API_URL}Docs/SaveGeneralDocumentsByRefIdTypeIdDB`;
  static SAVE_GENERAL_DOCS2 = `${API_ROUTES.API_URL}Docs/PMR/UploadFile`;
  static DELETE_GENERAL_DOCS = `${API_ROUTES.API_URL}Docs/DeleteGeneralDocumentByDocId`;


  /* Queue Management */
  static Q_MANAGEMENT_CALL_FOR_TOKEN = `${API_ROUTES.API_URL}QueueManagementToken/CallForQueueManagementToken`;
  static Q_MANAGEMENT_ATTEND_TOKEN = `${API_ROUTES.API_URL}QueueManagementToken/AttentQueueManagementToken`;
  static SAVE_Q_MANAGEMENT_TOKEN_WITH_VISIT = `${API_ROUTES.API_URL}QueueManagementToken/SaveQueueManagementTokenWithVisit`;
  /* Queue Management */


  static SEARCH_PATIENT_VISITS = `${API_ROUTES.API_URL}Patient/SearchPatientVisits`;
  static UPDATE_VISITS_INFO = `${API_ROUTES.API_URL}visit/UPVI`;
  static UPDATE_REFBY_VIA_VISTIID = `${API_ROUTES.API_URL}visit/ChangeRefByDoctor`;
  static GET_VISITS_INFO = `${API_ROUTES.API_URL}visit/GetVisitServicesInfoyVisitID`;

  // static GET_APP_USERS = `${API_ROUTES.VIMS_API_URL}User/GetAppUsers`;

  static GET_PUSH_NOTIFICATIONS_LIST = `${API_ROUTES.API_BASE_URL_PUSH_NOTIFICATIONS}PushNotifications/GetMobileNotification`;
  static SAVE_PUSH_NOTIFICATION = `${API_ROUTES.API_BASE_URL_PUSH_NOTIFICATIONS}PushNotifications/InsertUpdateMobileNotification`;
  static GET_PUSH_NOTIFICATION_TOKENS = `${API_ROUTES.API_BASE_URL_PUSH_NOTIFICATIONS}PushNotifications/GetNotificationTokens`;
  static SEND_PUSH_NOTIFICATIONS = `${API_ROUTES.API_BASE_URL_PUSH_NOTIFICATIONS}PushNotifications/SendPushNotification`;

  // static GET_EMPLOYEE_ATTENDANCE = `${API_ROUTES.VIMS_API_URL}Attendance/GetEmployeeAttendance`;

  static GET_MSJ_FOR_ASSOCIATED_TESTS = `${API_ROUTES.API_URL}TestProfile/GetMessageForAssociatedTest`;
  static GET_TEST_PROFILES = `${API_ROUTES.PATIENT_PORTAL_API_URL}TestProfile/Tests`;
  static GET_SEARCH_VISIT_LOC_TEST = `${API_ROUTES.API_URL}Patient/SearchVisitByTestAndLocations`;
  static GET_TEST_PROFILE_COMMENTS = `${API_ROUTES.API_URL}TestProfile/GetTestCommentByTPID`;
  static UPDATE_TP_COMMENTS = `${API_ROUTES.PATIENT_PORTAL_API_URL}TestProfile/UpdataTPCommentWithTPID`;
  // static GET_TEST_PROFILES_DETAIL = `${API_ROUTES.PATIENT_PORTAL_API_URL}V1/TestProfile/TestProfileDetails`;
  static ENCRYPT_PARAM = `${API_ROUTES.PATIENT_PORTAL_API_URL}Shared/EncryptParam`;
  static DECRYPT_PARAM = `${API_ROUTES.PATIENT_PORTAL_API_URL}Shared/DecryptParam`;
  static USER_PROVINCE = `${API_ROUTES.API_URL}Shared/GetUserProvince`;
  static LOG_DATA = `${API_ROUTES.API_URL}Shared/logProvinceNotPunjabInfo`;

  static VERIFY_IDC_USER_CREDENTIAL = `${API_ROUTES.API_URL}Shared/VerifyUserCredentials`;
  static GET_USER_ID = `${API_ROUTES.API_URL}Shared/getUserID`;
  static ENCRYPT_STRING = `${API_ROUTES.API_URL}Misc/EncryptString`;
  static DECRYPT_STRING = `${API_ROUTES.API_URL}Misc/DecryptString`;
  static GET_GENERATOR_FUEL_LOG_LIST = `${API_ROUTES.API_URL}Generator/V1/GeneratorFuelLogListForReport`;
  static GET_GENERATOR_NAME = `${API_ROUTES.API_URL}Generator/V1/GeneratorListByLocIds`;
  static GET_GENERATOR_ON_OFF_LIST = `${API_ROUTES.API_URL}Generator/V1/GetGeneratorOnOffLogList`;
  static INSERT_UPDATE_GENERATOR_LOG = `${API_ROUTES.API_URL}Generator/V1/InsertUpdateGeneratorOnOff`;


  // static GET_BODY_PARTS = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/GetBodyParts`;
  static GET_BODY_PARTS = `${API_ROUTES.API_URL}HealthTipsPortal/GetBodyParts`;
  static GET_SYMPTOMS = `${API_ROUTES.API_URL}HealthTipsPortal/GetSymptoms`;
  static GET_TEST_SAMPLE_COLLECTION_MEDIUM = `${API_ROUTES.API_URL}HealthTipsPortal/GetTestSampleCollectionType`;
  // static GET_DISEASES = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/GetDiseases`;
  static GET_DISEASES = `${API_ROUTES.API_URL}HealthTipsPortal/GetDiseases`;
  static GET_TESTPROFILEDATA = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/GetTestProfileDataByID`;
  static GET_TESTPROFILEPIC = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/GetTestProfilePicByID`;
  static DECRYPT_TPID = `${API_ROUTES.PATIENT_PORTAL_API_URL}Shared/DecryptTPID`;
  static GET_TestProfileData = `${API_ROUTES.API_URL}HealthTipsPortal/GetTestProfileDataByID`;
  // static GET_TestProfileData = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/GetTestProfileDataByID`;
  // static GET_TP_PARAMS = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/GetTestProfileParamsByTPID`;
  static GET_TP_PARAMS = `${API_ROUTES.API_URL}HealthTipsPortal/GetTestProfileParamsByTPID`;
  // static GET_TestProfilePic = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/GetTestProfilePicByID`;
  static GET_TestProfilePic = `${API_ROUTES.API_URL}HealthTipsPortal/GetTestProfilePicByID`;

  // static ADD_UPDATE_TEST_PROFILE = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/AddUpdateTP`;
  static ADD_UPDATE_TEST_PROFILE = `${API_ROUTES.API_URL}HealthTipsPortal/AddUpdateTP`;
  static DECRYPT_PARAMS = `${API_ROUTES.PATIENT_PORTAL_API_URL}Shared/DecryptParam`;
  // static ADD_UPDATE_TP_IMAGE = `${API_ROUTES.PATIENT_PORTAL_API_URL}HealthTipsPortal/AddUpdateTPImage`;
  static ADD_UPDATE_TP_IMAGE = `${API_ROUTES.API_URL}HealthTipsPortal/AddUpdateTPImage`;
  static GET_PRODUCT_PROMOTIONS = `${API_ROUTES.API_URL}Shared/GetProductPromotions`;
  static GET_PRODUCT_PROMOTIONS_FOR_KBS = `${API_ROUTES.API_URL}Shared/GetProductPromotionDetail`;
  static ADD_UPDATE_PRODUCT_PROMOTION = `${API_ROUTES.API_URL}Shared/AddUpdateProductPromotion`;
  static DELETE_INACTIVE_PRODUCT_PROMOTION = `${API_ROUTES.API_URL}Shared/DeleteInActiveProductPromotion`;
  static GET_NEWS_AND_EVENTS = `${API_ROUTES.API_URL}Shared/GetNewsAndEvents`;
  static ADD_UPDATE_NEWS_AND_EVENTS = `${API_ROUTES.API_URL}Shared/AddUpdateNewsAndEvents`;
  static DELETE_INACTIVE_NEFWS_EVENT = `${API_ROUTES.API_URL}Shared/DeleteInActiveNewsEvent`;
  static GET_EMPLOYEES = `${API_ROUTES.API_URL}Shared/GetEmployees`;
  static ADD_UPDATE_NOTICE_BOARD = `${API_ROUTES.API_URL}NoticeBoard/AddUpdateNotification`;
  static GET_NOTIFICATIONS = `${API_ROUTES.API_URL}NoticeBoard/GetNotifications`;
  static GET_NOTIFICATION_DETAIL_BY_ID = `${API_ROUTES.API_URL}NoticeBoard/GetNotificationDetailByID`;

  //Recruitment module routes
  static GET_JOB_STATUS = `${API_ROUTES.API_URL}Recruitment/GetJobStatus`;
  static GET_JOB_SHIFT = `${API_ROUTES.API_URL}Recruitment/GetJobShift`;
  static GET_JOB_CATEGORY = `${API_ROUTES.API_URL}Recruitment/GetJobCategory`;
  static GET_DEGREE_LEVEL = `${API_ROUTES.API_URL}Recruitment/GetDegreeLevel`;
  static GET_APPLICANT_STATUS = `${API_ROUTES.API_URL}Recruitment/GetApplicantStatus`;
  static GET_JOB_REQUEST_BY_ID = `${API_ROUTES.API_URL}Recruitment/GetJobRequestByID`;
  static ADD_UPDATE_JOB_REQUEST = `${API_ROUTES.API_URL}Recruitment/AddUpdateJobRequest`;
  static GET_SEARCH_JOB_REQUEST = `${API_ROUTES.API_URL}Recruitment/SearchJobRequest`;
  static GET_DESIGNATIONS = `${API_ROUTES.API_URL}Lookup/GetDesignation`;
  static GET_JOB_REQUEST_FINAL = `${API_ROUTES.API_URL}Recruitment/GetJobRequestFinal`;
  static INSERT_JOB_APPLICANT_DATA = `${API_ROUTES.API_URL}Recruitment/InsertJobApplicantData`;
  static UPDATE_JOB_STATUS_WITH_REMARKS = `${API_ROUTES.API_URL}Recruitment/UpdateJobStatusWithRemarks`;
  static GET_APPLICANT_LIST = `${API_ROUTES.API_URL}Recruitment/GetApplicantList`;
  static GET_APPLICANT_DETAIL_BY_ID = `${API_ROUTES.API_URL}Recruitment/GetApplicantDetailByID`;

  static GET_FAQ_CATEGORY = `${API_ROUTES.API_URL}Shared/GetFAQCategory`;
  static GET_FAQ = `${API_ROUTES.API_URL}Shared/GetFAQ`;


  static ADD_UPDATE_FAQ = `${API_ROUTES.API_URL}Shared/InsertUpdateFAQ`;
  static GET_EMPLOYEE_BY_EMPNO = `${API_ROUTES.API_URL}Shared/GetEmployeeByEmpNo`;

  static LOOKUP_GET_HC_CITIES = `${API_ROUTES.API_URL}Shared/Cities`;
  static LOOKUP_GET_PRODUCT_PROMOTION_CITIES = `${API_ROUTES.API_URL}Shared/GetProductPromotionCity`;
  static LOOKUP_GET_HC_CITY_AREAS = `${API_ROUTES.API_URL}Shared/GetIOrgCityArea`;
  static UPDATE_JOB_APPLICANT_STATUS_WITH_REMARKS = `${API_ROUTES.API_URL}Recruitment/UpdateJobApplicantStatusWithRemarks`;
  static LOOKUP_GET_HC_CENTRES = `${API_ROUTES.API_URL}Shared/GetHomeCollectionCentre`;
  static GET_OPEN_JOBS_LIST = `${API_ROUTES.API_URL}Recruitment/GetOpenJobRequest`;
  static GET_OPEN_JOBS_LIST_WITH_INTERVIEWERS = `${API_ROUTES.API_URL}Recruitment/GetOpenJobRequestWithInterviewers`;
  static ADD_UPDATE_JOB_INTERVIEWERS = `${API_ROUTES.API_URL}Recruitment/AddUpdateJobInterviewers`;
  static GET_APPLICANT_LIST_BY_INTERVIEWER_ID = `${API_ROUTES.API_URL}Recruitment/GetApplicantListByInterviewerID`;
  static GET_OPEN_JOB_REQUEST_BY_JOB_STATUS = `${API_ROUTES.API_URL}Recruitment/GetOpenJobRequestByJobStatus`;
  static INSERT_UPDATE_APPLICANT_INTERVIEWERS_DATA = `${API_ROUTES.API_URL}Recruitment/InsertUpdateApplicantInterviewersRecomm`;
  static GET_APPLICANT_RESULT = `${API_ROUTES.API_URL}Recruitment/GetJobApplicantResult`;

  static GET_BRANCHWISE_VISIT_COUNT_ANALYTICS = `${API_ROUTES.API_URL}BussinessSuite/GetBranchWiseVisitCountAnalytics`;
  static GET_TESTWISE_VISIT_COUNT_ANALYTICS = `${API_ROUTES.API_URL}BussinessSuite/GetTPCodeWiseVisitCountAnalyticsByLocID`;
  static GET_SECTIONWISE_VISIT_COUNT_ANALYTICS = `${API_ROUTES.API_URL}BussinessSuite/GetSectionWiseVisitCountAnalyticsByLocID`;
  static LOOKUP_GET_VEHICLE_TYPES = `${API_ROUTES.API_URL}Shared/GetVehicleType`;

  static GET_RACK_TYPES = `${API_ROUTES.API_URL}LabConfigs/RackTypes`;
  static GET_RACK_DETAIL = `${API_ROUTES.API_URL}LabConfigs/RackDetail`;
  static CREATE_RACK = `${API_ROUTES.API_URL}LabConfigs/CreatRack`;
  static UPDATE_RACK = `${API_ROUTES.API_URL}LabConfigs/UpdateRack`;

  // Lab Configs
  static GET_MACHINE = `${API_ROUTES.API_URL}LabConfigs/GetMachine`;

  static GET_MACHINE_FOR_TP = `${API_ROUTES.API_URL}HealthTipsPortal/GetMachineForTP`;
  static ADD_UPDATE_MACHINE = `${API_ROUTES.API_URL}LabConfigs/InsertUpdateMachine`;
  static ADD_UPDATE_MACHINE_TEST = `${API_ROUTES.API_URL}LabConfigs/InsertUpdateMachineTest`;
  static ADD_UPDATE_MACHINE_PARAMS_ASSAYCODE = `${API_ROUTES.API_URL}LabConfigs/InsertUpdateParamMachineAssayCode`;
  static COPY_MACHINE_PARAMS_ASSAYCODE = `${API_ROUTES.API_URL}LabConfigs/CopyParamMachineAssayCodeToBranches`;
  static TRANSFER_RIS_TPSHARE_LOCATION_TO_LOCATION = `${API_ROUTES.API_URL}DoctorShare/TransferRISTPShareLocToLoc`;
  static TRANSFER_RIS_TPSHARE_DOCTOR_TO_DOCTORS = `${API_ROUTES.API_URL}DoctorShare/TransferRISShareDocToDocs`;
  static TRANSFER_RIS_TP_DOCTORSHARE_LOCATION_TO_LOCATION = `${API_ROUTES.API_URL}DoctorShare/TransferRISTPDoctorShareLocToLocs`;
  static UPDATE_TEST_MACHINE_PRIORITY = `${API_ROUTES.API_URL}LabConfigs/UpdateTestMachinePriority`;
  static INSERT_UPDATE_MACHINE_RANGES = `${API_ROUTES.API_URL}HealthTipsPortal/InsertUpdateParamMachineRanges`;
  static GET_PARAM_MACHINE_RANGES = `${API_ROUTES.API_URL}HealthTipsPortal/GetParamMachineRangesByParamID`;
  static DELETE_PARAM_MACHINE_RANGE_BY_ID = `${API_ROUTES.API_URL}HealthTipsPortal/DeleteParamMachineRangeByID`;
  static GET_TEST_MACHINES = `${API_ROUTES.API_URL}LabConfigs/GetTestMachines`;
  static GET_TEST_MACHINES_EXTENDED = `${API_ROUTES.API_URL}HealthTipsPortal/GetTestMachines`;
  // FBR
  static FBR_SERVICE_CHECK_STATUS = `${API_ROUTES.API_BASE_URL_FBR}get`;
  static FBR_GET_INVOICE_NO = `${API_ROUTES.API_BASE_URL_FBR}GetInvoiceNumberByModel`;
  static FBR_GET_UNPOSTED_INVOICES = `${API_ROUTES.API_URL}FBR/UnpostedInvoices`;
  static FBR_GET_UNPOSTED_VISIT_DETAILS = `${API_ROUTES.API_URL}FBR/GetUnPotsedFBRVisitDetails`;
  static FBR_REPOST_VISIT_DATA = `${API_ROUTES.API_URL}Visit/RePostFBRPendingData`;
  static FBR_POST_PANEL_CONVERSION_DATA = `${API_ROUTES.API_URL}Visit/PostFBRDataForPanelConversion`;
  static PANEL_IDS_FOR_OLA_B2B = `${API_ROUTES.API_URL}Visit/GetPIDForOlaDocB2B`;

  //ARY Sahulat
  static SEARCH_ARY_CUSTOMER = `${API_ROUTES.API_URL}Visit/ary-search-customer`;
  static ARY_REGISTER_CUSTOMER = `${API_ROUTES.API_URL}Visit/register-customer`;
  static ARY_TOKEN = `${API_ROUTES.API_URL}Token/get-token`;


// Knowledge Based System::
  static GET_KBS_BRANCH = `${API_ROUTES.API_URL}KBS/GetKBSBranch`;
  static GET_KBS_SERVICES = `${API_ROUTES.API_URL}KBS/GetKBSServices`;
  static GET_KBS_BRANCH_SERVICES_BY_LOC_ID = `${API_ROUTES.API_URL}KBS/GetKBSBranchServicesByLocID`;
  static GET_KBS_BRANCH_SERVICES_BY_SERVICE_ID = `${API_ROUTES.API_URL}KBS/GetKBSBranchServicesByServiceID`;
  static GET_KBS_BRANCH_SERVICES = `${API_ROUTES.API_URL}KBS/GetKBSBranchServices`;
  static INSERT_UPDATE_KBS_BRANCH_SERVICES = `${API_ROUTES.API_URL}KBS/InsertUpdateKBSBranchServices`;
  static INSERT_UPDATE_D_KBS_BRANCH = `${API_ROUTES.API_URL}KBS/InsertUpdateDKBSBranch`;
  static INSERT_UPDATE_D_KBS_SERVICES = `${API_ROUTES.API_URL}KBS/InsertUpdateDKBSServices`;
  static GET_KBS_TICKER_DATA = `${API_ROUTES.API_URL}KBS/GetKBSTickerData`;
  static GET_KBS_TICKER_CATEGORY = `${API_ROUTES.API_URL}KBS/GetDKBSTickerCategory`;
  static INSERT_UPDATE_D_KBS_TICKER_CATEGORY = `${API_ROUTES.API_URL}KBS/InsertUpdateDKBSTickerCategory`;
  static DELETE_KBS_TICKER = `${API_ROUTES.API_URL}KBS/DeleteKBSTicker`;
  static INSERT_UPDATE_KBS_TICKER = `${API_ROUTES.API_URL}KBS/InsertUpdateKBSTicker`;
  static GET_ACTIVE_KBS_TICKER_DETAIL = `${API_ROUTES.API_URL}KBS/GetActiveKBSTickerDetails`;
  static DELETE_KBS_DOCUMENT = `${API_ROUTES.API_URL}KBS/DeleteKBSDocument`;
  static DELETE_KBS_DOCUMENT_CATEGORY = `${API_ROUTES.API_URL}KBS/DeleteKBSDocumentCategory`;
  static GET_KBS_DOCUMENT_PAGED = `${API_ROUTES.API_URL}KBS/GetKBSDocumentsPaged`;
  static GET_KBS_DOCUMENT_CATEGORY = `${API_ROUTES.API_URL}KBS/GetDKBSDocumentCategory`;
  static DOCUMENT_UPLOAD_VALIDATION = `${API_ROUTES.API_URL}KBS/DocumentUploadValidation`;
  static INSERT_UPDATE_D_KBD_DOCUMENT_CATEGORY = `${API_ROUTES.API_URL}KBS/InsertUpdateDKBSDocumentCategory`;
  static INSERT_UPDATE_D_KBD_DOCUMENT_WITH_VALIDATION = `${API_ROUTES.API_URL}KBS/InsertUpdateKBSDocumentsWithValidation`;


  //branch
  static BRANCH_TYPES = `${API_ROUTES.API_URL}Branch/Types`;
  static BRANCHES = `${API_ROUTES.API_URL}Branch/Branches`;
  static UPDATE_BRANCH = `${API_ROUTES.API_URL}Branch/UpdateBranch`;
  static GET_CLOCK_HOUR = `${API_ROUTES.API_URL}Branch/GetClockHour`;

  // Racking & Routing
  static GET_RACK = `${API_ROUTES.API_URL}RackingRouting/GetRack`;
  static GET_RACK_INFO_BY_RACKNO = `${API_ROUTES.API_URL}RackingRouting/GetRackInformationByRackNo`;
  static ALLOCATE_RACK = `${API_ROUTES.API_URL}RackingRouting/LockRackByRackBarcode`;
  static GET_SAMPLE_INFO_BY_BARCODE = `${API_ROUTES.API_URL}RackingRouting/GetSampleInfoByBarCode`;
  static SAMPLE_PUT = `${API_ROUTES.API_URL}RackingRouting/LockAccessioningSample`;
  static GET_SAMPLE_INFO = `${API_ROUTES.API_URL}RackingRouting/GET_SAMPLE_INFO_BY`;


  //Accssioning
  static GET_SAMPLE_INFO_BY_RACK = `${API_ROUTES.API_URL}Accessioning/SampleInfoByRackNo`;
  static LOCK_RACK_BY_RACKBARCODE = `${API_ROUTES.API_URL}Accessioning/LockRackByRackBarcode`;
  static GET_SAMPLE_LIST_BY_SCREEN = `${API_ROUTES.API_URL}Accessioning/GetSampleListByScreen`;
  static TRANSFER_SAMPLE_TO_MACHINE = `${API_ROUTES.API_URL}Accessioning/TransferSampleToMachine`;
  static MOVE_SAMPLE_TO_TRANSFER_RACK = `${API_ROUTES.API_URL}Accessioning/MoveSampleToTransferRack`;
  static DELETE_MACHINE_RANGE_BY_MACHINE_ID = `${API_ROUTES.API_URL}HealthTipsPortal/DeleteMachineRangeByMachineID`;

  //apointments
  static GET_RIS_MODALITIES = `${API_ROUTES.API_URL}AppointmentByFDO/RISModalities`;
  static GET_APPOINTMENT_TYPES = `${API_ROUTES.API_URL}AppointmentByFDO/AppointmentTypes`;
  static GET_APPOINTMENT_REASONS = `${API_ROUTES.API_URL}AppointmentByFDO/AppointmentReasons`;
  static GET_APPOINTMENT_STATUSES = `${API_ROUTES.API_URL}AppointmentByFDO/AppointmentStatuses`;
  static GET_MODALITY_WISE_TESTS = `${API_ROUTES.API_URL}AppointmentByFDO/ModalityWiseTP`;
  static GET_DOCTORS_MODALITY_WISE = `${API_ROUTES.API_URL}AppointmentByFDO/ModalityWistDoctors`;
  static GET_APPOINTMENTS_MODALITY_WISE = `${API_ROUTES.API_URL}AppointmentByFDO/GetAppointmentsByModalityID`;
  static GET_MODALITY_SCHEDULE = `${API_ROUTES.API_URL}AppointmentByFDO/ModalitySchedule`;
  static INSERT_UPD_APPOINTMENT = `${API_ROUTES.API_URL}AppointmentByFDO/BookAppointment`;

  //Information Desk
  static GET_TEST_PROFILE_DETAIL_BY_TPID = `${API_ROUTES.API_URL}TestProfile/GetTestProfileDetailByTPID`;
  static GET_TATA_BY_TPID = `${API_ROUTES.API_URL}TestProfile/GetTATByTPID`;
  static GET_TEST_PARAMTER = `${API_ROUTES.API_URL}TestProfile/GetParameter`;
  static GET_TEST_PROFILE_DETAIL_BY_PID = `${API_ROUTES.API_URL}TestProfile/GetTestProfileDetailByPID`;
  static LOOKUP_EXTENSIONS = `${API_ROUTES.API_URL}Lookup/Extensions`;
  static ADD_UPDATE_TELEPHONE_EXTENSION = `${API_ROUTES.API_URL}Shared/InsertUpdatedExtension`;
  static LOOKUP_GET_PANEL_DETAIL_BY_PANEL_ID = `${API_ROUTES.API_URL}Lookup/getPanelDetailByPanelID`;
  static GET_VISIT_TEST_INQUIRY = `${API_ROUTES.API_URL}TestProfile/GetVisitTestInquiry`;

  //outsource Patients
  static GET_OUTSOURCE_HOSPITAL_DETAIL = `${API_ROUTES.API_URL}OutsourcePatients/GetOutSourceHospitalDetail`;
  static GET_ECL_PENDING_PATIENTS = `${API_ROUTES.API_URL}OutsourcePatients/ECLPendingPatients`;
  static GET_ECL_PAT_BY_HOSPITALID = `${API_ROUTES.API_URL}OutsourcePatients/OutSourceHospitalPatientsByHospID`;
  static GET_ECL_PAT_BY_ORGID = `${API_ROUTES.API_URL}OutsourcePatients/OutSourceHospitalPatientsByOrgId`;
  static INSERT_GET_TELENORE_PATIENTS = `${API_ROUTES.API_URL}OutsourcePatients/InsertAndGetTelenorePatients`;
  static GET_OUTSOURCE_PAT_BY_ID = `${API_ROUTES.API_URL}OutsourcePatients/GetOutSourcePatientByID`;
  static INSERT_UPDATE_ECL_PATIENTS = `${API_ROUTES.API_URL}OutsourcePatients/InsertUpdateECLPatients`;
  static INSERT_UPDATE_OUTSOURCE_PATIENTS = `${API_ROUTES.API_URL}OutsourcePatients/InsertOutsourcePatient`;
  static GET_HOSPITAL_PATIENT_BY_HOSPITALID = `${API_ROUTES.API_URL}OutsourcePatients/GetHospitalPatientByHospitalID`;

  // RIS Configs
  static GET_RIS_DICTIONARY_BY_USER_ID = `${API_ROUTES.API_URL}RISConfig/GetRISDictionaryByUserID`;
  static GET_RIS_DICTIONARY_BY_RIS_DICTIONARY_ID = `${API_ROUTES.API_URL}RISConfig/GetRISDictionaryByRISDictionaryID`;
  static INSERT_UPDATE_RIS_DICTIONARY = `${API_ROUTES.API_URL}RISConfig/InsertUpdateRISDictionary`;
  static DELETE_RIS_DICTIONARY = `${API_ROUTES.API_URL}RISConfig/DeleteRISDictionary`;
  static GET_TEST_SECTION_BY_SECTION_ID = `${API_ROUTES.API_URL}TestProfile/GetTestSectionBySectionID`;
  static GET_RIS_TEMPLATE = `${API_ROUTES.API_URL}RISConfig/GetRISTemplate`;
  static INSERT_UPDATE_RIS_TEMPLATE = `${API_ROUTES.API_URL}RISConfig/InsertUpdateRISTemplate`;
  static GET_RIS_MACHINE = `${API_ROUTES.API_URL}RISConfig/GetRISMachine`;
  static GET_RIS_MACHINE_ALL_PARAMS_MACHINEID = `${API_ROUTES.API_URL}LabConfigs/GetAllParamMappingByMachineIdLocId`;
  static GET_RIS_MACHINE_LOCATIONS_MACHINEID = `${API_ROUTES.API_URL}LabConfigs/GetLocationsByMachineId`;
  static INSERT_UPDATE_RIS_MACHINE = `${API_ROUTES.API_URL}RISConfig/InsertUpdateRISMachine`;
  static INSERT_UPDATE_RIS_MACHINE_ON_OFF_LOG = `${API_ROUTES.API_URL}RISConfig/InsertUpdateRISMachineOnOffLog`;
  static INSERT_UPDATE_LAB_MACHINE_ON_OFF_LOG = `${API_ROUTES.API_URL}LabConfigs/InsertUpdateMachineOnOffLog`;
  static INSERT_UPDATE_RIS_MACHINE_TEST = `${API_ROUTES.API_URL}RISConfig/InsertUpdateRISMachineTest`;

  //RIS Questionnaire
  static GET_QUESTIONAIRE_QUESTION = `${API_ROUTES.API_URL}RISConfig/GetQuestion`;
  static GET_ANSWERE_TYPE = `${API_ROUTES.API_URL}RISConfig/GetAnswerType`;
  static GET_QUESTION_GROUP_TYPE = `${API_ROUTES.API_URL}RISConfig/GetQuestionGroupType`;
  static ADD_UPDATE_QUESTION = `${API_ROUTES.API_URL}RISConfig/InsertUpdatedQuestion`;
  static GET_QUESTION_CLASSIFICATION = `${API_ROUTES.API_URL}RISConfig/GetQuestionClassification`;
  static ADD_UPDATE_QUESTION_CLASSIFICATION = `${API_ROUTES.API_URL}RISConfig/InsertUpdateQuestionClassification`;
  static ADD_UPDATE_QCLASSIFICATION_QUESTION = `${API_ROUTES.API_URL}RISConfig/InsertUpdateQClassificationQuestion`;
  static ADD_UPDATE_QCLASSIFICATION_QUESTION_V2 = `${API_ROUTES.API_URL}RISConfig/InsertUpdateQCClassificationQuestionV2`;
  static GET_QUESTION_CLASSIFICATION_QUESTIONS = `${API_ROUTES.API_URL}RISConfig/GetQClassificationQuestions`;
  static GET_QUESTION_CLASSIFICATION_QUESTIONS_V2 = `${API_ROUTES.API_URL}RISConfig/GetQCClassificationQuestionsV2`;

  //Radiologist
  static GET_RADIOLOGIST_INFO_DETAIL = `${API_ROUTES.API_URL}RISConfig/GetRadiologistInfoDetail`;
  static GET_RADIOLOGIST_BY_LOC_IDS = `${API_ROUTES.API_URL}RISConfig/GetRadiologistsByLocIDs`;
  static GET_RADIOLOGIST_AVAILABILITY = `${API_ROUTES.API_URL}RISConfig/RadiologistAvailability`;
  static GET_RADIOLOGIST_INFO = `${API_ROUTES.API_URL}RISConfig/GetRadiologistInfo`;
  static GET_EMPLOYEE_PIC = `${API_ROUTES.API_URL}RISConfig/GetEmployeePic`;
  static INSERT_UPDATE_TPQUESTIONS = `${API_ROUTES.API_URL}HealthTipsPortal/InsertUpdateTPQuestions`;
  static GET_TESTPROFILE_QUESTION = `${API_ROUTES.API_URL}RISConfig/GetTestProfileQuestions`;
  static GET_RIS_QUESTION = `${API_ROUTES.API_URL}RISConfig/GetRISTPQuestions`;
  static GET_CREATININE_BY_TP = `${API_ROUTES.API_URL}RISConfig/GetCreatinineByPIN`;
  static INSERT_UPDATE_RAD_WORKLOAD = `${API_ROUTES.API_URL}Doctor/InsertUpdateEmployeeWorkLoad`;
  static GET_RIS_ADDENDUM_REVIEW_SOURCE = `${API_ROUTES.API_URL}RISReporting/GetRISAddendumReviewSource`;
  static GET_DHRM_GENERAL_SHIFT = `${API_ROUTES.API_URL}Lookup/GetDHRMGeneralShift`;
  static GET_WORK_WEEK = `${API_ROUTES.API_URL}Lookup/GetWorkWeek`;

  //RIS WORKLIST
  static GET_RIS_WORKLIST = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkList`;
  static GET_RIS_WORKLIST_SUMMARY = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListSummary`;
  static GET_RIS_WORKLIST_SUMMARY_OUTSTANDING = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListSummaryOutstanding`;
  static INSERT_UPDATE_RISTPQ_ANSWERE = `${API_ROUTES.API_URL}RISWorklist/InsertUpdateRISTPQAnswer`;
  static GET_RIS_MO_HISTORY = `${API_ROUTES.API_URL}RISWorklist/GetRISMOHistory`;
  static GET_MO_INTERVENED_TP_BY_VISIT_ID = `${API_ROUTES.API_URL}RISWorklist/GetMOInterventionTPByVisitID`;// get MO Intervened Tests against visit ID for MO questionnaire modal dropdown
  static UPDATE_VISIT_TEST_PRIORITY = `${API_ROUTES.API_URL}RISWorklist/UpdateVisitTestPriority`;
  static GET_RIS_WORKLIST_ROW = `${API_ROUTES.API_URL}RISWorklist/GetRISWorklistRow`;
  static GET_RIS_WORKLIST_FOR_REPORTING_ROW = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListForReportingRow_v2`;
  static GET_MACHINE_MANUFACTURE = `${API_ROUTES.API_URL}Lookup/GetMachineManufacture`;
  static GET_TEST_PROFILE_FOR_ANAYLYTICS = `${API_ROUTES.API_URL}TestProfile/GetTestProfileForAnalytics`;
  static GET_RIS_WORKLIST_SERVICE = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListService`;
  static GET_RIS_WORKLIST_FOR_PEER_REVIEW = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListForPeerReview`;
  static GET_RIS_WORKLIST_FOR_REPORTING = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListForReporting`;
  static GET_RIS_WORKLIST_SUMMARY_REPORTING_MAIN = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListMainSummaryReporting`;
  static GET_RIS_WORKLIST_SUMMARY_REPORTING_UNASSIGNED = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListUnAssignedSummaryReporting`;
  static GET_RIS_WORKLIST_SUMMARY_REPORTING_ADDENDUM_SECONDOPINION = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListAddendumSummaryReporting`;

  // SHARE CONFIGS
  static GET_DOCTOR_LEVEL = `${API_ROUTES.API_URL}DoctorShare/GetLevel`;
  static UPDATE_DOCTOR_LEVEL = `${API_ROUTES.API_URL}DoctorShare/InsertUpdateDoctorLevel`;
  static GET_ALL_LOCATION_TPID = `${API_ROUTES.API_URL}DoctorShare/GetAllLocationByTPID`;
  static INSERT_UPDATE_DOCTOR_SHARE = `${API_ROUTES.API_URL}DoctorShare/InsertUpdateRISLevelLocationTPShare`;
  static INSERT_UPDATE_DOCTOR_SHARE_DOCTORE_WISE = `${API_ROUTES.API_URL}DoctorShare/InsertUpdateRISDoctorLocationTPShare`;
  static GET_RIS_LEVEL_LOCATION_TP_SHARE = `${API_ROUTES.API_URL}DoctorShare/GetRISLevelLocationTPShare`;
  static GET_RIS_DOCTOR_LOCATION_TP_SHARE = `${API_ROUTES.API_URL}DoctorShare/GetRISDoctorLocationTPShare`;
  static GET_RIS_DOCTOR_LOCATION_TP_SHARE_FOR_LOC = `${API_ROUTES.API_URL}DoctorShare/GetRISDoctorLocationTPShareForLoc`;


  // TECHNICIAN WORKLIST
  static VERIFY_USER = `${API_ROUTES.API_URL}Shared/VerifyUser`;
  static GET_STORE_ITEMLIST = `${API_ROUTES.API_URL}TestProfile/GetStoreItemList`;
  static GET_STORE_ITEMLIST_EXTENDED = `${API_ROUTES.API_URL}HealthTipsPortal/GetStoreItemList`;
  static INSERT_UPDATE_TP_INVENTORY = `${API_ROUTES.API_URL}TestProfile/InsertUpdateTPInventory`;
  static INSERT_UPDATE_TP_INVENTORY_EXTENTED = `${API_ROUTES.API_URL}HealthTipsPortal/InsertUpdateTPInventory`;
  static GET_TP_INVENTORY = `${API_ROUTES.API_URL}TestProfile/getTPInventory`;
  static GET_TP_INVENTORY_EXTENDED = `${API_ROUTES.API_URL}HealthTipsPortal/getTPInventory`;
  static GET_VISIT_TP_INVENTORY = `${API_ROUTES.API_URL}Technician/GetVisitTPInventory`;
  static INSERT_UPDATE_VISIT_TP_INVENTORY = `${API_ROUTES.API_URL}Technician/InsertUpdateVisitTPInventory`;
  static GET_TECH_CHECKLIST = `${API_ROUTES.API_URL}Technician/GetTechnicianCheckList`;
  static INSERT_TECHNICIAN_QANSWER = `${API_ROUTES.API_URL}Technician/InsertTechnicianQAnswer`;
  static INSERT_UPDATE_TECHNICIAN_WORKLIST = `${API_ROUTES.API_URL}Technician/InsertUpdateTechnicianWorkList`;
  static GET_TECHNICIAN_HISTORY = `${API_ROUTES.API_URL}Technician/GetTechnicianHistory`;
  static GET_MACHINE_MODALITY = `${API_ROUTES.API_URL}Technician/GetMachineModality`;
  static GET_MACHINE_RIS_MODALITY_BY_LOCID = `${API_ROUTES.API_URL}Technician/GetRISMachineModalityByLocID`;
  static UPDATE_VISIT_TP_STATUS = `${API_ROUTES.API_URL}Technician/UpdateVisitTPStatus`;
  static UPDATE_RIS_WORKLIST_CONSENT_READ = `${API_ROUTES.API_URL}Technician/UpdateRISWorkListConsentRead`;
  static UPDATE_PATIENT_ISMETAL = `${API_ROUTES.API_URL}RISConfig/UpdatePatientisMetal`;
  static GET_RISSERVICES_BY_VISITID = `${API_ROUTES.API_URL}TestProfile/GetRISServicesByVisitID`;
  static UPDATE_VISIT_TPSTATUS_BY_TPIDS = `${API_ROUTES.API_URL}Technician/UpdateVisitTPStatusByTPIDs`;
  static GET_TECHNICIAN_HISTORY_JSON = `${API_ROUTES.API_URL}Technician/GetTechnicianHistoryJSON`;
  static EMERGENCY_ASSIGN_TEST = `${API_ROUTES.API_URL}Technician/EmergencyAssignTest`;
  static GET_EMERGENCY_ASSIGN_TEST = `${API_ROUTES.API_URL}Technician/GetAssignedEmergencyDetails`;

  // ASSIGNER
  static INSERT_UPDATE_VISIT_TEST_ASSIGNMENT = `${API_ROUTES.API_URL}RISWorklist/InsertUpdateVisitTestAssignment`;
  static INSERT_UPDATE_VISIT_TEST_ASSIGNMENTV2 = `${API_ROUTES.API_URL}RISWorklist/InsertUpdateVisitTestAssignmentV2`;
  static INSERT_UPDATE_BULK_VISIT_TEST_ASSIGNMENT = `${API_ROUTES.API_URL}RISWorklist/InsertUpdateBulkVisitTestAssignment`;
  static INSERT_UPDATE_BULK_VISIT_TEST_ASSIGNMENT_V2 = `${API_ROUTES.API_URL}RISWorklist/InsertUpdateBulkVisitTestAssignmentV2`;
  static GET_RADIOLOGIST_SUMMARY = `${API_ROUTES.API_URL}RISWorklist/GetRadiologistSummary`;
  static GET_INIT_RADIOLOGIST_SUMMARY = `${API_ROUTES.API_URL}RISWorklist/GetReportedRadiologistSummary`;
  static GET_DS_RADIOLOGIST_SUMMARY = `${API_ROUTES.API_URL}RISWorklist/GetDSRadiologistSummary`;

  //PATIENT VITALS
  static RIS_INSERT_VITALS = `${API_ROUTES.API_URL}Vitals/InsertVitalSign`;
  static RIS_PAIN_SEVERITY = `${API_ROUTES.API_URL}Vitals/RISGetPainSeverity`;
  static GET_VITALS = `${API_ROUTES.API_URL}Vitals/GetVitalSigns`;

  //RIS REPORTING
  static GET_VISITS_FOR_RIS_RESULT_ENTRY = `${API_ROUTES.API_URL}RISOneWindowResultDs/GetVisitForImagingOneWindow`;
  static INSERT_UPDATE_RADIO_REPORT = `${API_ROUTES.API_URL}RISReporting/InsertUpdateRadioReport`;
  // v2 feature is already used with v1 so we miss to make v2 api call. so now jumping to v3
  static INSERT_UPDATE_RADIO_REPORT_V3 = `${API_ROUTES.API_URL}RISReporting/InsertUpdateRadioReport_v3`;
  static INSERT_UPDATE_RADIO_REPORT_V4 = `${API_ROUTES.API_URL}RISReporting/InsertUpdateRadioReport_v4`;
  static INSERT_UPDATE_UPDATE_VISIT_TP_DISCLAIMER = `${API_ROUTES.API_URL}RISReporting/InsertUpdateVisitTPDisclaimer`;
  static UPDATE_RADIO_REPORT_LOCK = `${API_ROUTES.API_URL}RISReporting/UpdateRadioReportLock`;
  static GET_TP_BY_VISIT_ID = `${API_ROUTES.API_URL}TestProfile/GetTPByVisitID`;
  static GET_RIS_TP_BY_VISIT = `${API_ROUTES.API_URL}TestProfile/GetRISTPByVisit`;
  static GET_RIS_REPORT_PARAMTERS_DETAIL = `${API_ROUTES.API_URL}RISReporting/GetRISReportParametersDetail`;
  static GET_DS_QUESTIONS = `${API_ROUTES.API_URL}RISReporting/GetDSQuestions`;
  static INSERT_DS_FEEDBACK = `${API_ROUTES.API_URL}RISReporting/InsertDSFeedBack`;
  static GET_RADIO_REPORT_BY_ID = `${API_ROUTES.API_URL}RISReporting/GetRadopReportByID`;
  static GET_RIS_TEMPLATE_DETAIL = `${API_ROUTES.API_URL}RISReporting/GetRISTemplateDetail`;
  static GET_RADIO_REPORT_VISIT_TEST_STATUS = `${API_ROUTES.API_URL}RISConfig/GetRadioReportVisitTestStatus`;
  static GET_EMPLOYEE_NAME_LOCATION = `${API_ROUTES.API_URL}RISConfig/GetEmployeeNameLocation`;
  static GET_TP_BY_VISIT_ID_FOR_ADDENDUM = `${API_ROUTES.API_URL}TestProfile/GetTPByVisitIDForAddendum`;
  static GET_TP_BY_VISIT_ID_FOR_RESET = `${API_ROUTES.API_URL}TestProfile/GetRISTPByVisitIDForReset`;
  static INSERT_UPDATE_VISIT_TEST_ADDENDUM = `${API_ROUTES.API_URL}RISReporting/InsertUpdateVisitTestAddendum`;
  static GET_ADDENDUM_BY_TPID = `${API_ROUTES.API_URL}RISReporting/GetAddendumByTPID`;
  static GET_TEST_PROFILE_COMPARASION_BY_PATIENT_ID = `${API_ROUTES.API_URL}RISReporting/getTestProfileComparisonByPatientID`;
  static GET_RIS_ASSESMENT_CATEGORY = `${API_ROUTES.API_URL}RISReporting/GetRISAssesmentCategory`;
  static GET_RIS_ERROR_CATEGORY_RESEARCH = `${API_ROUTES.API_URL}RISReporting/GetRISErrorCategoryResearch`;
  static UPDATE_VISIT_TEST_ADDENDUM_DR_QUERY_REMARKS = `${API_ROUTES.API_URL}RISReporting/UpdateVisitTestAddendumDrQueryRemarks`;
  static GET_RIS_CASE_STUDY_CATEGORY = `${API_ROUTES.API_URL}RISReporting/GetRISCaseStudyCategory`;
  static GET_IS_DOCTOR_FEEDBACK = `${API_ROUTES.API_URL}RISReporting/GetIsDoctorFeedBack`;
  static UPDATE_RIS_CASE_STUDY_CATEGORY = `${API_ROUTES.API_URL}RISReporting/UpdateRISCaseStudyCategory`;
  static REVERT_TO_UNASSIGNED = `${API_ROUTES.API_URL}RISReporting/RevertToUnassigned`;
  static GET_RADIOLOGY_STATS_REPORT = `${API_ROUTES.API_URL}Reports/GetRISTestProfileSummary`;
  static GET_DUE_DELAY_REPORT_FOR_RIS = `${API_ROUTES.API_URL}RISReporting/GetRISDelayReport`;
  static GET_RIS_DUE_REPORT_DETAILS = `${API_ROUTES.API_URL}RISReporting/GetRISDueReportDetail`;
  static GET_DUE_DELAY_REPORT_SUMMARY_FOR_RIS = `${API_ROUTES.API_URL}RISReporting/GetRISDelayReportSummary`;
  static GET_TAT_REPORT_FOR_RIS = `${API_ROUTES.API_URL}RISReporting/GetRISTATReportByLocID`;
  static GET_RIS_MT_WORKLOAD_REPORT = `${API_ROUTES.API_URL}RISReporting/GetRISMTWorkloadReport`;

  // AI SUPPORT
  static REQUEST_AI_ASSISTANCE = `${API_ROUTES.API_URL}RISAIAssistance/RequestAIAssistance`;
  static REQUEST_AI_PROCESSED_DICOM = `${API_ROUTES.API_URL}RISAIAssistance/AIProcessedImages`;
  static AI_ASSISTANCE_DOCTOR_FEEDBACK = `${API_ROUTES.API_URL}RISAIAssistance/AIAssistanceDoctorFeedback`;
  static UPDATE_AI_ASSISTANCE_DOCTOR_FEEDBACK = `${API_ROUTES.API_URL}RISAIAssistance/UpdateAIAssistanceDoctorFeedback`;
  static AI_ASSISTANCE_DOCTOR_FEEDBACK_AUDIT = `${API_ROUTES.API_URL}RISAIAssistance/UpdateAIAssistanceDoctorFeedbackAudit`;
  static AI_ASSISTANCE_REQUEST = `${API_ROUTES.API_URL}RISAIAssistance/AIAssistanceRequest`;
  static AI_ASSISTANCE_FEEDBACK = `${API_ROUTES.API_URL}RISAIAssistance/AIAssistanceFeedback`;
  static GET_EXISTINCE_AI_ASSISTANCE_FEEDBACK = `${API_ROUTES.API_URL}RISAIAssistance/ExistenceAIAssistanceFeedback`;
  static GET_RIS_AI_ASSISTANCE_REQUEST_BY_VISIT_ID_TPID = `${API_ROUTES.API_URL}RISAIAssistance/GetRISAIAssistanceRequestByVIsitIDTPID`;
  

  // SECPMD OPINION REPORT
  static GET_SECOND_OPINION_SUMMARY_REPORT = `${API_ROUTES.API_URL}RISReporting/GetSecondOpinionSumaryReport`;
  static GET_REVERT_ADDENDUM_SECOND_OPINION = `${API_ROUTES.API_URL}RISReporting/RevertAddendumSecondOpinionRequest`;


  //REPORTING RESET
  static GET_VISIT_TEST_BY_VISITID_STATUSID = `${API_ROUTES.API_URL}TestProfile/GetVisitTestsByVisitIDStatusID`;
  static UPDATE_VISIT_TEST_RESET_STATUS = `${API_ROUTES.API_URL}RISReporting/UpdateVisitTestResetStatus`;
  static GET_VISIT_TEST_RESET = `${API_ROUTES.API_URL}RISReporting/GetVisitTestReset`;


  // REPORT AUDIT
  static GET_RIS_WORKLIST_FOR_AUDIT = `${API_ROUTES.API_URL}ReportAudit/GetRISWorkListForAudit`;
  static INSERT_UPDATE_RADIOLOGIST_VISIT_TP_AUDIT = `${API_ROUTES.API_URL}ReportAudit/InsertUpdateRadiologistVisitTPAudit`;
  static INSERT_UPDATE_RADIOLOGIST_VISIT_TP_AUDIT_V2 = `${API_ROUTES.API_URL}ReportAudit/InsertUpdateRadiologistVisitTPAuditV2`;
  static GET_RIS_RADIOLOGIST_AUDIT_WORKLIST = `${API_ROUTES.API_URL}ReportAudit/GetRISRadiologistAuditWorklist`;
  static GET_RELATIVE_CASE_DIST = `${API_ROUTES.API_URL}Lookup/GetRelativeCaseDist`;
  static GET_RIS_RADIOLOGIST_AUDIT_SUMMARY = `${API_ROUTES.API_URL}ReportAudit/GetRISRadiologistAuditSummary`;
  static GET_RADIOLOGIST = `${API_ROUTES.API_URL}Lookup/GetRadiologist`;
  static GET_RADIOLOGIST_BY_AUDITOR = `${API_ROUTES.API_URL}ReportAudit/GetRadiologistByAuditor`;
  static GET_AUDIT_TYPE = `${API_ROUTES.API_URL}ReportAudit/GetAuditType`;
  static UPDATE_RADIOLOGIST_VISIT_TP_AUDIT_SHARE = `${API_ROUTES.API_URL}ReportAudit/UpdateRadiologistVisitTPAuditShare`;
  static UPDATE_RADIOLOGIST_VISIT_TP_AUDIT = `${API_ROUTES.API_URL}ReportAudit/UpdateRadiologistVisitTPAudit`;
  static UPDATE_RADIOLOGIST_VISIT_TP_AUDIT_V2 = `${API_ROUTES.API_URL}ReportAudit/UpdateRadiologistAuditByID`;
  static GET_RADIOLOGIST_AUDIT = `${API_ROUTES.API_URL}ReportAudit/GetRadiologistAudit`;



  // TECHNOLOGIST AUDIT
  static GET_AUDIT_QA = `${API_ROUTES.API_URL}TechAudit/GetAuditQA`;
  static GET_RIS_WORKLIST_FOR_TECH_AUDIT = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListForTechAudit`;
  static GET_RIS_WORKLIST_ROW_FOR_TECH_AUDIT = `${API_ROUTES.API_URL}RISWorklist/GetRISWorkListRowForTechAudit`;
  static INSERT_UPDATE_TECHNOLOGIST_VISIT_TP_AUDIT = `${API_ROUTES.API_URL}TechAudit/InsertUpdateTechnologistVisitTPAudit`;
  static INSERT_UPDATE_TECHNOLOGIST_VISIT_TP_AUDIT_MANAGER = `${API_ROUTES.API_URL}TechAudit/InsertUpdateTechnologistVisitTPAuditManager`;
  static GET_TECHNOLOGIST_VISIT_TP_AUDIT_BY_ID = `${API_ROUTES.API_URL}TechAudit/GetTechnologistVisitTPAuditByID`;
  static GET_TECHNOLOGISTS = `${API_ROUTES.API_URL}TechAudit/GetTechnologists`;
  static GET_TECHNOLOGISTS_BY_LOCIDS = `${API_ROUTES.API_URL}TechAudit/GetTechnologistsByLocIDs`;
  static GET_RIS_TECHNOLOGIST_AUDIT_SUMMARY = `${API_ROUTES.API_URL}TechAudit/GetRISTechnologistAuditSummary`;
  static GET_RIS_TECHNOLOGIST_INIT_SUMMARY = `${API_ROUTES.API_URL}TechAudit/GetRISTechInitSummary`;
  static INSERT_TECHNOLOGIST_VISIT_TP_AUDIT_RAMARKS = `${API_ROUTES.API_URL}TechAudit/InsertTechnologistVisitTPAuditRemarks`;

  // Employee Modules to get data for EMP-PROFILE 
  static GET_EMP_BASIC_INFO = `${API_ROUTES.API_URL}IDCEmployee/GetEmpCardInfoByUserID`;
  static GET_EMP_PIC = `${API_ROUTES.API_URL}IDCEmployee/GetEmployeePicByUserID`;
  static EMP_CHANGE_PASSWORD = `${API_ROUTES.API_URL}IDCEmployee/UEP`;
  static RESET_CHANGE_PASSWORD = `${API_ROUTES.API_URL}IDCEmployee/UEPENC`;
  static EMP_PASSWORD_POLICY = `${API_ROUTES.API_URL}IDCEmployee/EmployeePasswordPolicy`;
  static EMP_INSERT_UPDATE_APP_USER_SCREEN_PIN = `${API_ROUTES.API_URL}IDCEmployee/ManageSecurityKey`;
  static GET_SCREEN_PIN_BY_USER_ID = `${API_ROUTES.API_URL}IDCEmployee/GetScreenPINByUserID`;
  static VERIFY_USER_BY_PIN = `${API_ROUTES.API_URL}IDCEmployee/VerifyUserByPIN`;
  static EMP_DELETE_APP_USER_SCREEN_PIN = `${API_ROUTES.API_URL}IDCEmployee/ManageSecurityKey`;

  // Marketing Module
  static TP_TESTPROFILE_PIC = `${API_ROUTES.API_URL}HealthTipsPortal/AddUpdateTPImage`;
  static GET_APP_USER_COUNT = `${API_ROUTES.API_URL}Shared/GetMyIDCAppUserCountReports`;

  //LAB-REPORTS
  static GET_SAMPLE_TRANSPORTATION_TAT = `${API_ROUTES.API_URL}TAT/GetSampleTransportationTAT`;
  static GET_SAMPLE_TRANSPORTATION_TAT_DATEWISE = `${API_ROUTES.API_URL}TAT/GetSampleTransportationTATDateWise`;
  static GET_SAMPLE_TRANSPORTATION_TAT_LOCWISE = `${API_ROUTES.API_URL}TAT/GetSampleTransportationTATLocWise`;
  static GET_LAB_TESTING_TAT = `${API_ROUTES.API_URL}TAT/GetLabTestingTAT`;
  static GET_LAB_TESTING_TAT_DATEWISE = `${API_ROUTES.API_URL}TAT/GetLabTestingTATDateWise`;
  static GET_LAB_TESTING_TAT_LOCWISE = `${API_ROUTES.API_URL}TAT/GetLabTestingTATLocWise`;
  static GET_DELAY_REPORT = `${API_ROUTES.API_URL}TAT/GetDelayedReport`;
  static GET_CASH_TALLY_REPORT = `${API_ROUTES.API_URL}Reports/GetUserCashTally`;
  static GET_PATIENT_INSURANCE = `${API_ROUTES.API_URL}Reports/GetPatientInsuranceData`;
  static GET_REGISTERED_PATIENT_REPORT = `${API_ROUTES.API_URL}insurance-reports/patients-registered`;
  static GET_UNREGISTERED_PATIENT_REPORT = `${API_ROUTES.API_URL}insurance-reports/patients-not-registered`;
  static GET_UNPOSTED_PATIENT_INSURANCE = `${API_ROUTES.API_URL}Reports/GetUnPostedPatientInsurance`;
  static GET_PATIENT_INSURANCE_SUMMARY = `${API_ROUTES.API_URL}Reports/GetPatientInsuranceSummary`;
  static GET_PATIENT_INSURANCE_INQUIRY_REPORT = `${API_ROUTES.API_URL}Reports/GetPatientInsurancePatDetail`;
  static GET_TEST_COUNTS_REPORT = `${API_ROUTES.API_URL}Reports/GetTestCount`;
  static GET_DAILY_SALES = `${API_ROUTES.API_URL}Sales/DailySale`;
  static GET_DIGITAL_RECEIPT = `${API_ROUTES.API_URL}Sales/GetSaleReportOnlinePayment`;
  static GET_USER_CASH_REPORT = `${API_ROUTES.API_URL}Sales/GetUserCashWithLocation`;
  static GET_USER_CASH_SUMMARY_REPORT = `${API_ROUTES.API_URL}Sales/GetUserCashSummaryNew`;
  static GET_USER_CASH_DETAIL_REPORT = `${API_ROUTES.API_URL}Sales/GetUserCashByLocation`;
  static GET_FDO_SALES_CLOSING = `${API_ROUTES.API_URL}Sales/GetFDOSaleClosing`;
  static GET_DELAY_REPORT_DETAILS = `${API_ROUTES.API_URL}TAT/GetDelayedReportDetail`;
  static GET_DELAY_REPORT_SUMMARY = `${API_ROUTES.API_URL}TAT/GetDelayedReportSummary`;
  static GET_DUE_REPORT = `${API_ROUTES.API_URL}TAT/GetDueReport`;
  static GET_DUE_REPORT_DETAILS = `${API_ROUTES.API_URL}TAT/GetDueReportDetail`;
  static GET_DUE_CLEARANCE_REPORT = `${API_ROUTES.API_URL}Sales/DueClearance`;
  static GET_CANCELLATION_REPORT = `${API_ROUTES.API_URL}Sales/GetCancellationsDetails`;
  static GET_BRANCH_CLOSED_SALES_REPORT = `${API_ROUTES.API_URL}Sales/GetVisitSaleBranchClosingByLocation`;

  //Mess Module

  static GET_MESS_ACTIVATION_DATA = `${API_ROUTES.API_URL}Shared/GetMessDetail`;



  // CMS Module
  static GET_FEEDBACK = `${API_ROUTES.API_URL}FeedBack/PatientFeedback`;
  static GET_CMS_REQUEST = `${API_ROUTES.API_URL}CMS/GetCMSRequest`;
  static GET_ASSIGNED_CMS_REQUEST = `${API_ROUTES.API_URL}CMS/GetAssignedCMSRequestsByUserID`;
  static GET_CMS_STATUS = `${API_ROUTES.API_URL}CMSLookup/GetCMSStatus`;
  static GET_CMS_REQUEST_STATS = `${API_ROUTES.API_URL}CMSDashboard/GetCMSRequestCount`;
  static UPDATE_CMS_REQUEST_STATUS = `${API_ROUTES.API_URL}CMS/UpdateCMSRequestStatusByCMSRequestID`;
  static GET_CMS_INQUIRY_DETAILS = `${API_ROUTES.API_URL}CMS/GetCMSInquiryReport`;
  static GET_CMS_SEARCH_REQUEST = `${API_ROUTES.API_URL}CMS/GetSearchCMSRequest`;
  static GET_EMP_DETAILS_BY_DEP_LOC_ID = `${API_ROUTES.API_URL}Employee/GetEmployeeListByDepDesLocID`;
  static GET_EMP_DETAILS_BY_LOC_ID = `${API_ROUTES.API_URL}Employee/GetEmployeeListByLocID`;
  static GET_NORMAL_EMP_DETAILS = `${API_ROUTES.API_URL}Employee/GetNormalUsers`;
  static GET_PREVIOUS_TOTAL = `${API_ROUTES.API_URL}Employee/CalcPrevTotal`;
  static INSERT_UPDATE_FREE_TEST_REQUEST = `${API_ROUTES.API_URL}Employee/InsertUpdateFreeTestRequest`;
  static INSERT_UPDATE_MY_APPROVALS = `${API_ROUTES.API_URL}Employee/ApproveRejectActionItemsBulk`;
  static GET_DEPENDENT_LIST = `${API_ROUTES.API_URL}Employee/GetLinkedPatientsByRequesterUser`;
  static GET_FREE_TEST_SUMMARY = `${API_ROUTES.API_URL}Employee/GetListByRequesterUserId_Summary`;
  static CANCEL_FREE_TEST_REQUEST = `${API_ROUTES.API_URL}Employee/CancelFreeTestRequest`;
  static GET_MY_PENDING_APPROVALS = `${API_ROUTES.API_URL}Employee/MyPendingApprovals`;
  static GET_MY_PENDING_APPROVALS_ITEMS = `${API_ROUTES.API_URL}Employee/MyPendingApprovals_Item`;
  static INSERT_CMS_CONTACT_BACK_TRACK = `${API_ROUTES.API_URL}CMS/InsertCMSContactBackTracking`;
  static GET_CMS_CONTACT_BACK_TRACK = `${API_ROUTES.API_URL}CMS/GetContactBackTracking`;
  static LOOKUP_GET_CONTACTBACK_STATUS = `${API_ROUTES.API_URL}CMSLookup/GetCMSContactBackStatus`;
  static GET_PATIENTPORTAL_DETAILS = `${API_ROUTES.API_URL}PPUser/GetPatientPortalUserDetailByFilters`;
  static GET_RESPONSIBLE_PERSON_DATA = `${API_ROUTES.API_URL}CMS/GetResponsiblePersonByCMSRequestID`;
  static GET_MEASURES_TAKEN_DATA = `${API_ROUTES.API_URL}CMS/GetActionTakenByCMSRequestID`;
  static GET_TESTINFO_TPID = `${API_ROUTES.API_URL}TestProfile/GetTestInfoByTPID`;
  static GET_CMS_REQUEST_DETAILS = `${API_ROUTES.API_URL}CMSReports/GetCMSRequestDetail`;
  static GET_CMS_REQUEST_COMPARISON = `${API_ROUTES.API_URL}CMSReports/GetCMSRequestByResponsiblePersonUserID`;
  static GET_WHATSAPP_LOGS = `${API_ROUTES.API_URL}CMSReports/GetWhatsAppLogs`;
  static GET_WHATSAPP_SUMMARY = `${API_ROUTES.API_URL}CMSReports/GetWhatsAppLogsSummary`;

  // SMS Module
  static GET_SMS_STATUS = `${API_ROUTES.API_URL}SMS/PatientSMSStatus`;
  static GET_CANCELLATION_SMS_STATUS = `${API_ROUTES.API_URL}SMS/PatientCancelationSMSStatus`;
  static GET_EMAIL_INFO = `${API_ROUTES.API_URL}Email/V1/ED`; //Email/V1/GetEmailInfoByViistID;
  // static GET_EMAIL_INFO_BY_DATE = `${API_ROUTES.API_URL}Email/V1/GetEmails`;
  static GET_EMAIL_INFO_BY_DATE = `${API_ROUTES.API_URL}Email/V2/GetEmails`;
  static GET_EMAIL_DETAIL_BY_VISIT_ID = `${API_ROUTES.API_URL}Email/V2/GetEmailsDetails`;
  static SEND_EMAIL = `${API_ROUTES.API_URL}Email/V1/SendEmail`;
  static SEND_PATIENT_MESSAGE = `${API_ROUTES.API_URL}SMS/SendMessage`;

  // CHARGE MASTER
  static ADD_EDIT_TP_CHARGE_MASTER = `${API_ROUTES.API_URL}ChargeMaster/InsertUpdateChargeMaster`;
  static ADD_EDIT_TP_CHARGE_MASTER_BRANCH_MAPPING = `${API_ROUTES.API_URL}ChargeMaster/UpdateChargeMasterLocationMapping`;
  static SET_CHARGE_MASTER_AS_DEFAULT = `${API_ROUTES.API_URL}ChargeMaster/SetChargeMasterAsDefault`;
  static GET_TP_CHARGE_MASTER = `${API_ROUTES.API_URL}ChargeMaster/GetChargeMaster`;
  static DELETE_TP_CHARGE_MASTER = `${API_ROUTES.API_URL}ChargeMaster/DeleteChargeMaster`;
  static GET_LOOKUP_BRANCHES_FOR_TP_CHARGE_MASTER = `${API_ROUTES.API_URL}ChargeMaster/getLookupBranchesForChargeMaster`;


  //HomeCollection
  static UPDATE_REQUEST_STATUS = `${API_ROUTES.API_URL}HomeCollection/ChangeRequestStatus`;
  static GET_HC_BOOKING_INQUIRY = `${API_ROUTES.API_URL}HomeCollection/GetHCBookingInquiry`;
  static GET_HC_BOOKING_DOCS = `${API_ROUTES.API_URL}HomeCollection/GetBookingPatientSampleTubesPic`;
  static GET_HOMECOLLECTION_REQ = `${API_ROUTES.API_URL}HomeCollection/HCRequests`;
  static GET_ONLINE_HOMECOLLECTION_REQ = `${API_ROUTES.API_URL}HomeCollection/HCRequestsOnline`;
  static UPDATE_PATIENT_BOOKINGID = `${API_ROUTES.API_URL}HomeCollection/UpdatePatientBooking`;
  static GET_RIDERS_DETAIL = `${API_ROUTES.API_URL}HomeCollection/Riders-Det`;
  static GET_BOOKING_COMPARISON = `${API_ROUTES.API_URL}HCReports/GetHCDashboardCountsByRider`;
  static GET_RIDER_NOT_COLLECTED_SAMPLES = `${API_ROUTES.API_URL}HomeCollection/GetRiderNotCollectedSamples`;
  static HOME_COLLECTION_BRANCHES = `${API_ROUTES.API_URL}HomeCollection/HomeCollectionBranches`;
  static HC_BOOKING_MESSAGES = `${API_ROUTES.API_URL}HomeCollection/RemarksHistoryOfHCChatByBookingID`;
  static VISITS_FOR_HC_BOOKING = `${API_ROUTES.API_URL}HomeCollection/VisitForHCBooking`;
  static VISIT_DETAIL_BY_VISITID = `${API_ROUTES.API_URL}HomeCollection/VisitDetailByVisitID`;
  static GET_HC_TEST_COUNTS = `${API_ROUTES.API_URL}HCDashboard/GetDateAndRiderWiseHCTestCount`;
  static HC_DEFAULT_CHAT_REMARKS = `${API_ROUTES.API_URL}HomeCollection/GetHcChatRemarks`;
  static UPD_HC__BOOKING_REMARKS = `${API_ROUTES.API_URL}HomeCollection/UpdateBookingRemarksForHCChat`;
  static REG_TEST_DET_BY_BOOKING_ID = `${API_ROUTES.API_URL}HomeCollection/RegistredTestDetailByBookingID`;
  static HC_BOOKING_STATUSES = `${API_ROUTES.API_URL}HomeCollection/HCBookingStatuses`;
  static HC_RIDERS_BY_ZONEID = `${API_ROUTES.API_URL}HomeCollection/GetRiderByZoneID`;
  static ASSIGN_RIDER = `${API_ROUTES.API_URL}HomeCollection/AssignRider`;
  static GET_RIDERS_STATUSES = `${API_ROUTES.API_URL}HomeCollection/RiderStatuses`;
  static GET_HC_DASHBOARD_COUNTS = `${API_ROUTES.API_URL}HCDashboard/HCDashboardCounts`;
  static GET_HC_ADMIN_DASHBOARD_COUNTS = `${API_ROUTES.API_URL}HCDashboard/GetHCDashboardCountsByAdmin`;
  static UPDATE_RIDERS_STATUSE = `${API_ROUTES.API_URL}HomeCollection/ChangeRequestStatus`;
  static CURR_FISCAL_INFO = `${API_ROUTES.API_URL}HCShare/CurrentPeriodsID`;
  static HC_UNPROCCESSED_SHARE_DATA = `${API_ROUTES.API_URL}HCShare/UnProcessedShareData`;
  static UPD_UNPROCCESSED_SHARE_DATA = `${API_ROUTES.API_URL}HCShare/GenerateHCShare`;
  static HC_PROCCESSED_SHARE_DATA = `${API_ROUTES.API_URL}HCShare/ProcessedShareData`;
  static HC_RECOMMENDED_SHARE_DATA = `${API_ROUTES.API_URL}HCShare/RecommendedShareData`;
  static HC_UPDATE_FINAL_SHARE = `${API_ROUTES.API_URL}HCShare/UpdatetHCFinalShare`;
  static HC_INSERT_UPDATE_ZONE = `${API_ROUTES.API_URL}HCZones/InsertUpdateZone`;
  static DISCARD_HC_SHARE = `${API_ROUTES.API_URL}HCShare/DiscardHCShare`;
  static HC_ZONES = `${API_ROUTES.API_URL}HCZones/HomeCollectionZones`;
  static HOME_COLLECTION_ZONES = `${API_ROUTES.API_URL}HCZones/HomeCollectionZones`;
  static HC_ZONES_BY_HCCITY = `${API_ROUTES.API_URL}HCZones/HCZonesByHCCity`;
  static HC_BOOKING_SOURCES = `${API_ROUTES.API_URL}HomeCollection/HCBookingSource/`;
  static RIDER_TASK_SCHEDULE = `${API_ROUTES.API_URL}HomeCollection/RiderTasksSchedule/`;
  static GET_VISIT_HOME_COLLECTION_TEST = `${API_ROUTES.API_URL}HomeCollection/GetVisitHomeCollectionTest/`;
  static ADD_UPDATE_RIDER = `${API_ROUTES.API_URL}HomeCollection/InsertUpdateRider`;
  static GET_RIDER = `${API_ROUTES.API_URL}HomeCollection/Riders-Det`;
  static BOOKING_DETAIL_BY_BID = `${API_ROUTES.API_URL}HCBooking/BookingInfoByBID`;
  static GET_HC_BOOKING_REQUEST_CCR = `${API_ROUTES.API_URL}HCBooking/GetHCRequestsByCCR`;

  //Dengue Integration
  static GET_DATA_FOR_DENGUE_PORTAL = `${API_ROUTES.API_URL}DengueInteg/GetDateForDenguePortal`;
  static UPDATE_PATIENTINFO_FOR_DENGUE_PORTAL = `${API_ROUTES.API_URL}Patient/UpdatePatientInfoRelatedToDengue`;
  static GET_DATA_FOR_DENGUE_PORTAL_FOR_UPD = `${API_ROUTES.API_URL}DengueInteg/GetDengueIntegDataForUpdate`;
  static POST_DENGUE_DATA_ = `${API_ROUTES.API_URL}DengueInteg/PostDataToDenguePortal`;
  static POST_DENGUE_DATA = `${API_ROUTES.API_URL}DengueInteg/V1/PostDataToDenguePortal`;
  static GET_DENGUE_POSTED_DATA = `${API_ROUTES.API_URL}DengueInteg/GetDenguePostedData`;
  static GET_DENGUE_POSTED_DATA_TO_REPOST = `${API_ROUTES.API_URL}DengueInteg/GetDenguePostedDataToRepost`;
  static GET_T = `${API_ROUTES.API_URL}DengueInteg/T`;

  static GET_HC_BOOKING_REQ_BY_CCR = `${API_ROUTES.API_URL}FeedBack/GetHCBookingRequestsByCCR`;

  //Mobile Device Notification
  static GET_MOBILE_DEVICE_TOKEN_BY_PATIENTID = `${API_ROUTES.API_URL}MobileDeviceNotification/GetMobileDeviceTokenByPatientID`;

  // Commond and Shared Functions ie for get data, insert data and deleted a record
  static DELETE_RECORD_BY_TABLE_NAME = `${API_ROUTES.API_URL}Shared/DeleteRecordByTableName`;

  // PACs 
  static GET_PACS_STUDIES = `${API_ROUTES.API_URL}PACs/V1/GetPACSStudies`;
  static DOWNLOAD_PACS_IMAGES = `${API_ROUTES.API_URL}PACs/V1/PacsFilePath`;
  static GET_PACS_COMM_LOG = `${API_ROUTES.API_URL}PACs/GetPACsCommLog`;

  // Test Profile Config - Disclaimer
  static GET_TEST_PROFILE_BY_SECTIONIDS = `${API_ROUTES.API_URL}TestProfile/GetTestProfileBySectionIDs`;
  static INSERT_DDISCLAIMER = `${API_ROUTES.API_URL}TestProfile/InsertDDisclaimer`;
  static DELETE_DDISCLAIMER = `${API_ROUTES.API_URL}TestProfile/DeleteDisclaimerByDDisclaimerID`;
  static INSERT_TP_DISCLAIMER = `${API_ROUTES.API_URL}TestProfile/InsertTPDisclaimer`;
  static GET_TP_BY_DDISCLAIMER = `${API_ROUTES.API_URL}TestProfile/GetTPByDDisclaimerID`;
  static GET_TP_DISCLAIMER = `${API_ROUTES.API_URL}TestProfile/GetTPDisclaimer`;
  static GET_D_DISCLAIMER = `${API_ROUTES.API_URL}TestProfile/GetDDisclaimer`;
  static GET_TP_DISCLAIMER_BY_TPDISCLAIMER_ID = `${API_ROUTES.API_URL}TestProfile/GetTPByTPDisclaimerID`;

  //OlaDoc
  static GET_OLADOC_DATA = `${API_ROUTES.API_URL}OlaDoc/GetRegistrationVerificationOLADOC`;
  static GET_TESTPROFILEBYLOCID_DATA = `${API_ROUTES.API_URL}Reports/GetTestProfileDataByLocID`;
  static GET_ANNUALMEDICALS_DATA = `${API_ROUTES.API_URL}Reports/GetAnnualMedicalsByPanelID`;
  static GET_TESTPROFILE_PANELID = `${API_ROUTES.API_URL}Shared/GetTestProfileByPanelID`;
  static GET_DOCTOR_PRES_REFID = `${API_ROUTES.API_URL}Doctor/GetDoctorPrescriptionByRefByID`;
  static GET_DOCTOR_PRESCRIPTION = `${API_ROUTES.API_URL}Doctor/GetDoctorPrescriptionDoctor`;

  // PANEL BILLING
  static GET_PANEL_VISITS_FOR_BILLING = `${API_ROUTES.API_URL}PanelBilling/GetPanelVisitsForBilling`;
  static INSERT_PANEL_BILL = `${API_ROUTES.API_URL}PanelBilling/InsertPanelBill`;
  static INSERT_PANEL_BILL_VISITID_SERVICEID = `${API_ROUTES.API_URL}PanelBilling/InsertUpdatePanelBillVisitIDServiceID`;
  static GET_PANEL_BILL_STATUS = `${API_ROUTES.API_URL}PanelBilling/GetPanelBillStatus`;
  static GET_PANEL_BILL_NEW = `${API_ROUTES.API_URL}PanelBilling/GetPanelBillNew`;
  static GET_PANEL_BILL_DETAIL = `${API_ROUTES.API_URL}PanelBilling/GetPanelBillDetail`;
  static GET_PANEL_ADDON_SERVICE = `${API_ROUTES.API_URL}PanelBilling/GetPanelAddOnService`;
  static GET_PANEL_SERVICES_SHARE = `${API_ROUTES.API_URL}PanelBilling/GetPanelTestShareDtl`;

  // Alfalah 
  static GET_ALFALAH_EMAIL_REPORT = `${API_ROUTES.API_URL}Shared/GetAlfalahEmails`;
  static RESEND_ALFALAH_EMAIL = `${API_ROUTES.API_URL}Shared/ResendAlfalahEmails`;



  static GET_PENDING_PANEL_REPORT = `${API_ROUTES.API_URL}Shared/GetPendingPanelTests`;
  static GET_PANEL_CONVERSION_REPORT = `${API_ROUTES.API_URL}Shared/GetPanelToPanelConversionDtl`;


  //Consolidated Billing
  static GENERATE_CONSOLIDATED_BILL_NO = `${API_ROUTES.API_URL}PanelBilling/GenerateConsolidatedBillNo`;
  static GET_PANEL_BILL_FOR_CONSOLIDATION = `${API_ROUTES.API_URL}PanelBilling/GetPanelBillForConsolidation`;
  static INSERT_PANEL_CONSOLIDATED_BILL = `${API_ROUTES.API_URL}PanelBilling/InsertPanelConsolidatedBill`;
  static UPDATE_PANEL_CONSOLIDATED_BILL = `${API_ROUTES.API_URL}PanelBilling/UpdatePanelConsolidatedBill`;
  static GET_PANEL_CONSOLIDATED_BILL = `${API_ROUTES.API_URL}PanelBilling/GetPanelConsolidatedBill`;
  static GET_PANEL_CONSOLIDATED_BILL_DETAIL = `${API_ROUTES.API_URL}PanelBilling/GetPanelConsolidatedBillDetail`;
  static GET_FINAL_PANEL_CONSOLIDATED_BILL_DETAIL = `${API_ROUTES.API_URL}PanelBilling/GetFinalPanelConsolidatedBillDetail`;

  // NEW PACS
  static GET_PACS_SERVERS = `${API_ROUTES.API_URL}PACs/GetPACSServers`;
  static GET_PACS_SERVERS_BV = `${API_ROUTES.API_URL}PACs/GetPACSServersBV`;
  static GET_PACS_SERVERS_LOC_AND_VISITS_V2 = `${API_ROUTES.API_URL}PACs/GetPACSServerLocAndVisitsV2`;

  //  MACHINE STATUS LOG (LAB, RIS)
  static GET_MACHINE_LOG = `${API_ROUTES.API_URL}LabConfigs/GetMachineLog`;
  static GET_RIS_MACHINE_LOG = `${API_ROUTES.API_URL}RISConfig/GetRISMachineLog`;

  // KBS services insertion + GET

static GET_SERVICES_FOR_KBS= `${API_ROUTES.API_URL}RISConfig/GetService`;


  // OUTSOURCE HOSPITALS

  static INSERT_OUTSOURCE_HOSPITALS = `${API_ROUTES.API_URL}OutHospitals/V1/IUOH`;
  static GET_OUTSOURCE_HOSPITALS_DETAIL = `${API_ROUTES.API_URL}OutHospitals/V1/GetOutSourceHospitals`;

  // REFBY RADIOLOGIST MAPPING
  static INSERT_UPDATE_REFBY_RADIOLOGIST_MAPPING = `${API_ROUTES.API_URL}RISConfig/InsertUpdateRefByRadiologistMapping`;
  static REMOVE_REFBY_RADIOLOGIST_MAPPING = `${API_ROUTES.API_URL}RISConfig/RemoveRefByRadiologistMapping`;
  static GET_RADIOLOGIST_REFBYLIST_MAPPING = `${API_ROUTES.API_URL}RISConfig/GetRadiologistRefByListMapping`;
  static GET_RADIOLOGIST_REFBYLIST_MAPPING_INFO = `${API_ROUTES.API_URL}RISConfig/GetRadiologistRefByMappingInfo`;

  //  RIS MACHINE UTILIZATION

  static GET_RIS_MACHINE_UTILIZATION = `${API_ROUTES.API_URL}RISReporting/GetRISMachineUtilization`;


  // Partner config
  static GET_ALL_PARTNER = `${API_ROUTES.API_URL}PartnerConfig/GetAllPartner`;
  static GET_PARTNER_USER = `${API_ROUTES.API_URL}PartnerConfig/GetPartnerUser`;
  static GET_PARTNER_USERBYID = `${API_ROUTES.API_URL}PartnerConfig/GetPartnerUserById`;
  static GET_PARTNER_BY_ID = `${API_ROUTES.API_URL}PartnerConfig/GetPartnerByID`;
  static GET_PARTNER_RIS_MACHINE_BY_ID = `${API_ROUTES.API_URL}PartnerConfig/GetPartnerRISMachineByID`;
  static INSERT_UPDATE_PARTNER_RIS_MACHINE = `${API_ROUTES.API_URL}PartnerConfig/InsertUpdatePartnerRISMachine`;
  static INSERT_UPDATE_PARTNER = `${API_ROUTES.API_URL}PartnerConfig/InsertUpdatePatner`;
  // static VERIFY_PARTNER_USER = `${API_ROUTES.API_URL}PartnerConfig/VerifyPartnerUser`;
  static INSERT_UPDATE_PARTNER_USER = `${API_ROUTES.API_URL}PartnerConfig/InsertUpdatePartnerUser`;

  // UTILITY ROUTS 
  static GET_TIME_DELAYS = `${API_ROUTES.API_URL}Utility/timedelays`;
  static GOOGLE_API_KEY = `${API_ROUTES.PATIENT_PORTAL_API_URL}Shared/GetAppKey`;

  // CAMPAING CONFIGURATION
  static INSERT_UPDATE_CAMPAIGN_WITH_COUPONS = `${API_ROUTES.API_URL}Campaign/SaveCampaignWithCoupons`;
  static GET_CAMPAIGN_LIST = `${API_ROUTES.API_URL}Campaign/GetCampaignList`;
  static GET_CAMPAIGN_ROW = `${API_ROUTES.API_URL}Campaign/GetCampaignDetailListByCompainID`;
   static GET_COUPON_DETAIL_BY_COUPON_ID = `${API_ROUTES.API_URL}Campaign/GetCouponUsageDetailByCoupon`;
  static GET_CAMPAIGN_COUPONS = `${API_ROUTES.API_URL}Campaign/GetCouponDetailsByCampaignID`;
  static REMOVE_COUPON = `${API_ROUTES.API_URL}Campaign/RemoveCoupon`;


  // JS BANK

  static GET_AUTH_JSBANK = `${API_ROUTES.API_URL}OnlinePayment/get-auth`;
  static CREATE_QR_CODE_JSBANK = `${API_ROUTES.API_URL}OnlinePayment/create-qr`;
  static RESET_AUTH_JSBANK = `${API_ROUTES.API_URL}OnlinePayment/reset-auth`;
  static VERIFY_TRANSACTION = `${API_ROUTES.API_URL}OnlinePayment/verify-qr-payment-transaction`;
  static INSERT_ONLINE_PAYMENT_QR_CODE_CREDENTIALS = `${API_ROUTES.API_URL}OnlinePayment/InsertOnlinePaymentQRCodeCredentials`;
  static INSERT_ONLINE_PAYMENT_VERIFICATION_CREDENTIALS = `${API_ROUTES.API_URL}OnlinePayment/InsertOnlinePaymentInquiry`;
  static GET_ONLINE_PAYMENT_REFERENCE = `${API_ROUTES.API_URL}OnlinePayment/GetOnlinePaymentReference`;

  static MCB_VERIFY_ORDER = `${API_ROUTES.API_URL}MCB/order`;

  static VERIFY_COUPON_FOR_REGISTRATION = `${API_ROUTES.API_URL}OutsourcePatients/VerifyCouponForRegistration`;

   // SAMPLE TRACKING 
  static GET_SAMPLES_ELIGIBLE_FOR_DISPATCH = `${API_ROUTES.API_URL}sample-tracking/get-samples-eligible-for-dispatch`;
  static GET_SAMPLE_TRACKING_LOOKUP = `${API_ROUTES.API_URL}sample-tracking/lookup `;
  static CREATE_DRAFT = `${API_ROUTES.API_URL}sample-tracking/v1/create-draft`;
  static DISPATCH = `${API_ROUTES.API_URL}sample-tracking/v1/dispatch`;
  static GET_LOOKUP = `${API_ROUTES.API_URL}sample-tracking/v1/get-lookup`;
  static CREATE_BATCH = `${API_ROUTES.API_URL}sample-tracking/v1/create-batch`;
  static GET_PENDING_INVOICE_BATCHES = `${API_ROUTES.API_URL}sample-tracking/v1/get-pending-invoice-batches`;
  static UPDATE_BATCH_INVOICE_COST = `${API_ROUTES.API_URL}sample-tracking/v1/update-batch-invoice-cost`;
  static UPDATE_BATCH_ACTUAL_COST_ATTACHMENT = `${API_ROUTES.API_URL}sample-tracking/v1/update-batch-actual-cost-attachment`;
  static GET_RECEIVING_PENDING_BATCHES = `${API_ROUTES.API_URL}sample-tracking/v1/get-receiving-pending-batches`;
  static GET_SAMPLE_BATCH_DETAILS = `${API_ROUTES.API_URL}sample-tracking/v1/get-sample-batch-details`;
  static UPDATE_BATCH_RIDER_SENT = `${API_ROUTES.API_URL}sample-tracking/v1/update-batch-rider-sent`;
  static RECEIVE_BATCH = `${API_ROUTES.API_URL}sample-tracking/v1/receive-batch`;
  static GET_BATCHES_FOR_TRACKING_DASHBOARD = `${API_ROUTES.API_URL}sample-tracking/v1/get-batches-for-tracking-dahboard`;
  
  
  static PRINT_BATCH_LABEL = `${API_ROUTES.API_URL}sample-tracking/GetSamplesEligibleForDispatch2`;
  

}