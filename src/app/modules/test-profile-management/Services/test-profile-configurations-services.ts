// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class TestProfileConfigurationService {
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  constructor(private http: HttpClient) { }
  GetBodyparts() {
    return this.http.post(API_ROUTES.GET_BODY_PARTS, {}, this.getServerCallOptions());
  }
  GetSymptoms() {
    return this.http.post(API_ROUTES.GET_SYMPTOMS, {}, this.getServerCallOptions());
  }
  GetDiseases() {
    return this.http.post(API_ROUTES.GET_DISEASES, {}, this.getServerCallOptions());
  }
  GetTestSampleCollectionType() {
    return this.http.post(API_ROUTES.GET_TEST_SAMPLE_COLLECTION_MEDIUM, {}, this.getServerCallOptions());
  }
  AddUpdateTProfile(data) {
    return this.http.post(API_ROUTES.ADD_UPDATE_TEST_PROFILE, data, this.getServerCallOptions());
  }
  decryptData(data) {
    return this.http.post(API_ROUTES.DECRYPT_PARAMS, data, this.getServerCallOptions());
  }

  AddUpdateTPImage(data) {
    return this.http.post(API_ROUTES.ADD_UPDATE_TP_IMAGE, data, this.getServerCallOptions())
  }

  GetTestProfileDataByID(data: any) {

    return this.http.post(API_ROUTES.GET_TestProfileData, data, this.getServerCallOptions());
  }
  GetTestProfileParamsByTPID(data: any) {
    return this.http.post(API_ROUTES.GET_TP_PARAMS, data, this.getServerCallOptions());
  }

  GetTestProfilePicByID(data: any) {

    return this.http.post(API_ROUTES.GET_TestProfilePic, data, this.getServerCallOptions());
  }
  DecryptTPID(data) {
    return this.http.post(API_ROUTES.DECRYPT_TPID, data, this.getServerCallOptions());
  }

  // encryptData(params) {
  //   return this.http.post(API_ROUTES.ENCRYPT_PARAM,  params, this.getServerCallOptions());
  // }

  // decryptData(params) {
  //   return this.http.post(API_ROUTES.DECRYPT_PARAM,  params, this.getServerCallOptions());
  // }
  getMachine(param) {
    return this.http.post(API_ROUTES.GET_MACHINE, param, this.getServerCallOptions())
  }

  insertUpdateParamMachineRanges(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_MACHINE_RANGES, param, this.getServerCallOptions())
  }

  getParamMachineRangesByParamID(param) {
    return this.http.post(API_ROUTES.GET_PARAM_MACHINE_RANGES, param, this.getServerCallOptions())
  }

  deleteParamMachineRangeByID(data) {
    return this.http.post(API_ROUTES.DELETE_PARAM_MACHINE_RANGE_BY_ID, data, this.getServerCallOptions())
  }
  getMachineForTP(param) {
    return this.http.post(API_ROUTES.GET_MACHINE_FOR_TP, param, this.getServerCallOptions())
  }

  deleteMachineRangeByMachineID(data) {
    return this.http.post(API_ROUTES.DELETE_MACHINE_RANGE_BY_MACHINE_ID, data, this.getServerCallOptions())
  }

  insertUpdateTPQuestions(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_TPQUESTIONS, param, this.getServerCallOptions())
  }
  getStoreItemList(params) {
    return this.http.post(API_ROUTES.GET_STORE_ITEMLIST, params, this.getServerCallOptions());
  }
  getStoreItemListExtended(params) {
    return this.http.post(API_ROUTES.GET_STORE_ITEMLIST_EXTENDED, params, this.getServerCallOptions());
  }
  getTPInventory(params) {
    return this.http.post(API_ROUTES.GET_TP_INVENTORY, params, this.getServerCallOptions());
  }
  getTPInventoryExtended(params) {
    return this.http.post(API_ROUTES.GET_TP_INVENTORY_EXTENDED, params, this.getServerCallOptions());
  }

  InsertUpdateTPInventory(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_TP_INVENTORY, param, this.getServerCallOptions())
  }
  InsertUpdateTPInventoryExtended(param) {
    return this.http.post(API_ROUTES.INSERT_UPDATE_TP_INVENTORY_EXTENTED, param, this.getServerCallOptions())
  }

  getServerCallOptions(): object {
    return {
      headers: this.getCommonHeaders(),
      responseType: "json"
    }
  }
  getCommonHeaders() {
    // const token = JSON.parse(localStorage.getItem(this.authLocalStorageToken));
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer ' + token
    })
  }
}
