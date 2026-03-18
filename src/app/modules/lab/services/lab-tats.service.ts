// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';
// import * as Tesseract from 'tesseract.js';

@Injectable({
  providedIn: 'root'
})
export class LabTatsService {

  constructor(private http: HttpClient) { }

  getSampleTransportationTAT(params) {
    return this.http.post(`${API_ROUTES.GET_SAMPLE_TRANSPORTATION_TAT}`,params,this.getServerCallOptions());
  }
  getSampleTransportationTATDateWise(params) {
    return this.http.post(`${API_ROUTES.GET_SAMPLE_TRANSPORTATION_TAT_DATEWISE}`,params,this.getServerCallOptions());
  }
  getSampleTransportationTATLocWise(params) {
    return this.http.post(`${API_ROUTES.GET_SAMPLE_TRANSPORTATION_TAT_LOCWISE}`,params,this.getServerCallOptions());
  }
    /// Lab Testin ///
  getLabTestingTAT(params) {
    return this.http.post(`${API_ROUTES.GET_LAB_TESTING_TAT}`,params,this.getServerCallOptions());
  }
  getLabTestingTATDateWise(params) {
    return this.http.post(`${API_ROUTES.GET_LAB_TESTING_TAT_DATEWISE}`,params,this.getServerCallOptions());
  }
  getLabTestingTATLocWise(params) {
    return this.http.post(`${API_ROUTES.GET_LAB_TESTING_TAT_LOCWISE}`,params,this.getServerCallOptions());
  }
  /// Delay Report ///
  getDelayReport(params) {
    return this.http.post(`${API_ROUTES.GET_DELAY_REPORT}`,params,this.getServerCallOptions());
  }
  getMyCashTallyReport(params) {
    return this.http.post(`${API_ROUTES.GET_CASH_TALLY_REPORT}`,params,this.getServerCallOptions());
  }
  getPatientInsuranceDataReport(params) {
    return this.http.post(`${API_ROUTES.GET_PATIENT_INSURANCE}`,params,this.getServerCallOptions());
  }
  getRegisteredPatientReport(params) {
    return this.http.post(`${API_ROUTES.GET_REGISTERED_PATIENT_REPORT}`,params,this.getServerCallOptions());
  }
  getUnregisteredPatientReport(params) {
    return this.http.post(`${API_ROUTES.GET_UNREGISTERED_PATIENT_REPORT}`,params,this.getServerCallOptions());
  }
  GetUnPostedPatientInsurance(params) {
    return this.http.post(`${API_ROUTES.GET_UNPOSTED_PATIENT_INSURANCE}`,params,this.getServerCallOptions());
  }
  GetPatientInsuranceActivication(params) {
    return this.http.post(`${API_ROUTES.GET_PATIENT_INSURANCE_SUMMARY}`,params,this.getServerCallOptions());
  }
  getTestCountReport(params) {
    return this.http.post(`${API_ROUTES.GET_TEST_COUNTS_REPORT}`,params,this.getServerCallOptions());
  }
  getDailySalesReport(params) {
    return this.http.post(`${API_ROUTES.GET_DAILY_SALES}`,params,this.getServerCallOptions());
  }
  getDigitalReceiptReport(params) {
    return this.http.post(`${API_ROUTES.GET_DIGITAL_RECEIPT}`,params,this.getServerCallOptions());
  }
  getUserCashDetailReport(params) {
    return this.http.post(`${API_ROUTES.GET_USER_CASH_DETAIL_REPORT}`,params,this.getServerCallOptions());
  }
  getUserCashSummaryReport(params) {
    return this.http.post(`${API_ROUTES.GET_USER_CASH_SUMMARY_REPORT}`,params,this.getServerCallOptions());
  }
  GetVisitSaleBranchClosingByLocation(params) {
    return this.http.post(`${API_ROUTES.GET_BRANCH_CLOSED_SALES_REPORT}`,params,this.getServerCallOptions());
  }
  GetFDOSaleClosing(params) {
    return this.http.post(`${API_ROUTES.GET_FDO_SALES_CLOSING}`,params,this.getServerCallOptions());
  }
  getDelayReportDetails(params) {
    return this.http.post(`${API_ROUTES.GET_DELAY_REPORT_DETAILS}`,params,this.getServerCallOptions());
  }
  getDueDelayReportForRIS(params) {
    return this.http.post(`${API_ROUTES.GET_DUE_DELAY_REPORT_FOR_RIS}`,params,this.getServerCallOptions());
  }
  getDueDelayReportSummaryForRIS(params) {
    return this.http.post(`${API_ROUTES.GET_DUE_DELAY_REPORT_SUMMARY_FOR_RIS}`,params,this.getServerCallOptions());
  }
   getRISDueReportDetails(params) {
    return this.http.post(`${API_ROUTES.GET_RIS_DUE_REPORT_DETAILS}`,params,this.getServerCallOptions());
  }
  getDelayReportSummary(params) {
    return this.http.post(`${API_ROUTES.GET_DELAY_REPORT_SUMMARY}`,params,this.getServerCallOptions());
  }
   /// Due Report ///
   getDueReport(params) {
    return this.http.post(`${API_ROUTES.GET_DUE_REPORT}`,params,this.getServerCallOptions());
  }
  getDueReportDetails(params) {
    return this.http.post(`${API_ROUTES.GET_DUE_REPORT_DETAILS}`,params,this.getServerCallOptions());
  }
 
  getCancellationReport(params) {
    return this.http.post(`${API_ROUTES.GET_CANCELLATION_REPORT}`,params,this.getServerCallOptions());
  }

   /// RIS TAT Report ///
 getRISTATReportByLocIDs(params) {
    return this.http.post(`${API_ROUTES.GET_TAT_REPORT_FOR_RIS}`,params,this.getServerCallOptions());
  }


  // async performOCR(imageData: File): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = async (event) => {
  //       const image = new Image();
  //       image.src = event.target.result as string;
  //       image.onload = async () => {
  //         const result = await Tesseract.recognize(image);
  //         resolve(result.data.text);
  //       };
  //     };
  //     reader.readAsDataURL(imageData);
  //   });
  // }


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
