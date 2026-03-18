// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, debounceTime, filter, map, tap, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class TestProfileService {

  constructor(private http: HttpClient) { }


  // getVaccinationWorklist(params) {
  //   return this.http.post(API_ROUTES.VACCINE_WORKLIST, params, this.getServerCallOptions());
  // }

  // getVaccinatedPersonsList(params) {
  //   return this.http.post(API_ROUTES.VACCINATED_PERSONS_LIST, params, this.getServerCallOptions());
  // }

  // vaccineCheckInOut(params) {
  //   return this.http.post(API_ROUTES.VACCINE_CHECK_IN_OUT, params, this.getServerCallOptions());
  // }

  // covidVaccineCardData(params) {
  //   return this.http.post(API_ROUTES.COVID_VACCINE_CARD_DATA, params, this.getServerCallOptions());
  // }

  // getVaccineWorklistForSecondDose(params) {
  //   return this.http.post(API_ROUTES.VACCINE_WORKLIST_SECOND_DOSE, params, this.getServerCallOptions());
  // }


  getTestsByNameParsed(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILES_FOR_REG, params).pipe( map( (response:any) => { 
        let data = response;
        if(data && data.StatusCode == 200 && data.PayLoad){
          try {
            data = JSON.parse(response.PayLoad);
          } catch(ex) {
            data = response.PayLoad;
          }
        } else {
          data = [];
        }
        return data;
      }
    ));
  }
  getTestsByName(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILES_FOR_REG, params);
  }
  getTestCommentByTPID(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILE_COMMENTS, params);
  }
  updateTPComments(params) {
    return this.http.post(API_ROUTES.UPDATE_TP_COMMENTS, params);
  }
  getTestsByDisease(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILES_BY_DISEASE, params);
  }
  getLookupTestProfileForChargeMaster(params) {
    return this.http.post(API_ROUTES.GET_LOOKUP_TEST_PROFILES_FOR_CHARGE_MASTER, params);
  }
  getMsjForAssocitedTP() {
    return this.http.post(API_ROUTES.GET_MSJ_FOR_ASSOCIATED_TESTS, this.getServerCallOptions());
  }
  
  getTestProfileByCellNo(params) {
    return this.http.post(API_ROUTES.GET_TP_BY_CELLNO,params,  params);
  }
  
  getTestsProfileForAnalytics(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILES_FOR_ANALYTICS, params, this.getServerCallOptions());
  }
  getPackageTestsProfiles(params) {
    return this.http.post(API_ROUTES.GET_PACKAGE_TEST_PROFILES, params);
  }

  getTestsByProfileId(params) {
    return this.http.post(API_ROUTES.GET_TESTS_BY_PROFILE_ID, params);
  }
  GetTestsByTestProfileID(params) {
    return this.http.post(API_ROUTES.GET_TESTS_BY_TEST_PROFILE_ID, params);
  }
  getTestsForCancellationApproval(params) {
    return this.http.post(API_ROUTES.GET_TESTS_FOR_CANCELLATION_APPROVEL, params);
  }

  approveTestsCancellation(params) {
    return this.http.post(API_ROUTES.APPROVE_TESTS_CANCELLATION, params);
  }
  
  getTestProfileDetailByTPID(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILE_DETAIL_BY_TPID, params);
  }

  getParameter(params) {
    return this.http.post(API_ROUTES.GET_TEST_PARAMTER, params);
  }
  getTestProfileDetailByPID(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILE_DETAIL_BY_PID, params);
  }
  getTATByTPID(params) {
    return this.http.post(API_ROUTES.GET_TATA_BY_TPID, params);
  }
  getTestSectionBySectionID(params) {
    return this.http.post(API_ROUTES.GET_TEST_SECTION_BY_SECTION_ID, params);
  }
  getTestProfileProtocolAndPatientInstruction(params) {
    return this.http.post(API_ROUTES.GET_TEST_PROFILE_PROTOCOL_AND_PATIENT_INSTRUCTION, params);
  }
  getParameterByTPID(params) {
    return this.http.post(API_ROUTES.GET_PARAMETERS_BY_TPID, params);
  }

  /*
  getTestProfileDetail(TestProfileName) {
    let _postData = {
      "TestProfileName": TestProfileName
    }
    return this.http.post(API_ROUTES.GET_TEST_PROFILES_DETAIL, _postData);
  }
  */


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
