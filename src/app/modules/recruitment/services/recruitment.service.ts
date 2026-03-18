// @ts-nocheck
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { API_ROUTES } from '../../../shared/helpers/api-routes';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class RecruitmentService {

  constructor(private http: HttpClient) { }

  getJobStatus() {
    return this.http.post(API_ROUTES.GET_JOB_STATUS, {}, this.getServerCallOptions());
  }
  getJobShift() {
    return this.http.post(API_ROUTES.GET_JOB_SHIFT, this.getServerCallOptions())
  }

  getJobCategory() {
    return this.http.post(API_ROUTES.GET_JOB_CATEGORY, {}, this.getServerCallOptions())
  }
  getDegreeLevel() {
    return this.http.post(API_ROUTES.GET_DEGREE_LEVEL, {}, this.getServerCallOptions())
  }
  getApplicantStatus() {
    return this.http.post(API_ROUTES.GET_APPLICANT_STATUS, {}, this.getServerCallOptions())
  }

  getDesignations() {
    return this.http.post(API_ROUTES.GET_DESIGNATIONS, {}, this.getServerCallOptions())
  }

  searchJobRequest(param) {
    return this.http.post(API_ROUTES.GET_SEARCH_JOB_REQUEST, param, this.getServerCallOptions())
  }

  getJobRequestByID(param) {
    return this.http.post(API_ROUTES.GET_JOB_REQUEST_BY_ID, param, this.getServerCallOptions())
  }
  addUpdateJobRequest(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_JOB_REQUEST, param, this.getServerCallOptions())
  }

  updateJobStatusWithRemarks(param) {
    return this.http.post(API_ROUTES.UPDATE_JOB_STATUS_WITH_REMARKS, param, this.getServerCallOptions())
  }

  getApplicantList(param) {
    return this.http.post(API_ROUTES.GET_APPLICANT_LIST, param, this.getServerCallOptions())
  }

  getApplicantDetailByID(param) {
    return this.http.post(API_ROUTES.GET_APPLICANT_DETAIL_BY_ID, param, this.getServerCallOptions())
  }

  updateJobApplicantStatusWithRemarks(param) {
    return this.http.post(API_ROUTES.UPDATE_JOB_APPLICANT_STATUS_WITH_REMARKS, param, this.getServerCallOptions())
  }
  getJobRequestFinal() {
    return this.http.post(API_ROUTES.GET_JOB_REQUEST_FINAL,  this.getServerCallOptions())
  }

  addUpdateApplicantJobData(param) {
    return this.http.post(API_ROUTES.INSERT_JOB_APPLICANT_DATA, param, this.getServerCallOptions())
  }
  getOpenJobsList(param) {
    return this.http.post(API_ROUTES.GET_OPEN_JOBS_LIST, param, this.getServerCallOptions())
  }
  getOpenJobsListWithInterviewers(param) {
    return this.http.post(API_ROUTES.GET_OPEN_JOBS_LIST_WITH_INTERVIEWERS, param, this.getServerCallOptions())
  }
  
  addUpdateJobInterviewers(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_JOB_INTERVIEWERS, param, this.getServerCallOptions())
  }

  getApplicantListByInterviewerID(param) {
    return this.http.post(API_ROUTES.GET_APPLICANT_LIST_BY_INTERVIEWER_ID, param, this.getServerCallOptions())
  }

  getOpenJobRequestsByJobStatus(param) {
    return this.http.post(API_ROUTES.GET_OPEN_JOB_REQUEST_BY_JOB_STATUS, param, this.getServerCallOptions())
  }

  insertUpdateApplicantInterviewersRecomm(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_APPLICANT_INTERVIEWERS_DATA, param, this.getServerCallOptions())
  }

  getJobApplicantResult(param) {
    return this.http.post(API_ROUTES.GET_APPLICANT_RESULT, param, this.getServerCallOptions())
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
