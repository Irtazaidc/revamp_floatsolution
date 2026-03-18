// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {

  constructor(
    private http: HttpClient
  ) { }

  getQuestion(params) {
    return this.http.post(API_ROUTES.GET_QUESTIONAIRE_QUESTION, params, this.getServerCallOptions());
  }
  getTestProfileforRadWorklist(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILE_FOR_ANAYLYTICS, params, this.getServerCallOptions());
  }
  InsertUpdateRadiologistWorklist(params) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_RAD_WORKLOAD, params, this.getServerCallOptions());
  }

  getAnswerType(params) {
    return this.http.post(API_ROUTES.GET_ANSWERE_TYPE, params, this.getServerCallOptions());
  }
  getQuestionGroupType(params) {
    return this.http.post(API_ROUTES.GET_QUESTION_GROUP_TYPE, params, this.getServerCallOptions());
  }
  insertUpdateQuestion(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_QUESTION,param, this.getServerCallOptions())
  }
  
  
  getQuestionClassification(param) {
    return this.http.post(API_ROUTES.GET_QUESTION_CLASSIFICATION,param, this.getServerCallOptions())
  }
  insertUpdateQuestionClassification(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_QUESTION_CLASSIFICATION,param, this.getServerCallOptions())
  }
  insertUpdateQClassificationQuestion(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_QCLASSIFICATION_QUESTION,param, this.getServerCallOptions())
  }
  insertUpdateQClassificationQuestionV2(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_QCLASSIFICATION_QUESTION_V2,param, this.getServerCallOptions())
  }
  getQClassificationQuestions(params) {
    return this.http.post(API_ROUTES.GET_QUESTION_CLASSIFICATION_QUESTIONS, params, this.getServerCallOptions());
  }
  getQClassificationQuestionsV2(params) {
    return this.http.post(API_ROUTES.GET_QUESTION_CLASSIFICATION_QUESTIONS_V2, params, this.getServerCallOptions());
  }

  ////Radiologist 
  getRadiologistInfoDetail(params) {
    return this.http.post(API_ROUTES.GET_RADIOLOGIST_INFO_DETAIL, params, this.getServerCallOptions());
  }
  getRadiologistByLocIDs(params) {
    return this.http.post(API_ROUTES.GET_RADIOLOGIST_BY_LOC_IDS, params, this.getServerCallOptions());
  }
  RadiologistAvailability(params) {
    return this.http.post(API_ROUTES.GET_RADIOLOGIST_AVAILABILITY, params, this.getServerCallOptions());
  }
  getRadiologistInfo(params) {
    return this.http.post(API_ROUTES.GET_RADIOLOGIST_INFO, params, this.getServerCallOptions());
  }
  getEmployeePic(params) {
    return this.http.post(API_ROUTES.GET_EMPLOYEE_PIC, params, this.getServerCallOptions());
  }
  getTestProfileQuestions(params) {
    return this.http.post(API_ROUTES.GET_TESTPROFILE_QUESTION, params, this.getServerCallOptions());
  }
  getRISTPQuestions(params) {
    return this.http.post(API_ROUTES.GET_RIS_QUESTION, params, this.getServerCallOptions());
  }
  getCreatinineByPIN(params) {
    return this.http.post(API_ROUTES.GET_CREATININE_BY_TP, params, this.getServerCallOptions());
  }
  getMOInterventionTPByVisitID(params) {
    return this.http.post(API_ROUTES.GET_MO_INTERVENED_TP_BY_VISIT_ID, params, this.getServerCallOptions());
  }

  updateVisitTestPriority(params) {
    return this.http.post(API_ROUTES.UPDATE_VISIT_TEST_PRIORITY, params, this.getServerCallOptions());
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
