// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class LabConfigsService {

  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  constructor(
    private http: HttpClient
  ) { }
  getMachine(param) {
    return this.http.post(API_ROUTES.GET_MACHINE, param, this.getServerCallOptions())
  }
  getLabMachine(param) {
    return this.http.post(API_ROUTES.GET_MACHINE_LOG, param, this.getServerCallOptions())
  }
  getRISMachine(param) {
    return this.http.post(API_ROUTES.GET_RIS_MACHINE_LOG, param, this.getServerCallOptions())
  }
  GetAllParamMappingByMachineIdLocId(param) {
    return this.http.post(API_ROUTES.GET_RIS_MACHINE_ALL_PARAMS_MACHINEID, param, this.getServerCallOptions())
  }
  GetLocationsByMachineID(param) {
    return this.http.post(API_ROUTES.GET_RIS_MACHINE_LOCATIONS_MACHINEID, param, this.getServerCallOptions())
  }
  insertUpdateMachine(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_MACHINE, param, this.getServerCallOptions())
  }
  insertUpdateMachineTest(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_MACHINE_TEST, param, this.getServerCallOptions())
  }
  insertUpdateMachineParams(param) {
    return this.http.post(API_ROUTES.ADD_UPDATE_MACHINE_PARAMS_ASSAYCODE, param, this.getServerCallOptions())
  }
  CopyParamMachineAssayCodeToBranches(param) {
    return this.http.post(API_ROUTES.COPY_MACHINE_PARAMS_ASSAYCODE, param, this.getServerCallOptions())
  }
  TransferRISTPShareLocToLoc(param) {
    return this.http.post(API_ROUTES.TRANSFER_RIS_TPSHARE_LOCATION_TO_LOCATION, param, this.getServerCallOptions())
  }
  TransferRISShareDocToDocs(param) {
    return this.http.post(API_ROUTES.TRANSFER_RIS_TPSHARE_DOCTOR_TO_DOCTORS, param, this.getServerCallOptions())
  }
  transferRISTPDoctorShareLocToLocs(param) {
    return this.http.post(API_ROUTES.TRANSFER_RIS_TP_DOCTORSHARE_LOCATION_TO_LOCATION, param, this.getServerCallOptions())
  }
  updateTestMachinePriority(param) {
    return this.http.post(API_ROUTES.UPDATE_TEST_MACHINE_PRIORITY, param, this.getServerCallOptions())
  }

  getTestMachines(param) {
    return this.http.post(API_ROUTES.GET_TEST_MACHINES, param, this.getServerCallOptions())
  }

  
  getTestMachinesJ(param) {
    return this.http.post(API_ROUTES.GET_TEST_MACHINES, param, this.getServerCallOptionsJ())
  }
  getTestMachinesExtended(param) {
    return this.http.post(API_ROUTES.GET_TEST_MACHINES_EXTENDED, param, this.getServerCallOptionsJ())
  }

  getServerCallOptions(): object {
    return {
      headers: this.getCommonHeaders(),
      responseType: "json"
    }
  }
  getCommonHeadersJ() {
    const token = JSON.parse(localStorage.getItem(this.authLocalStorageToken));
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    })
  }

  getServerCallOptionsJ(): object {
    return {
      headers: this.getCommonHeadersJ(),
      responseType: "json"
    }
  }
  getCommonHeaders() {
    //here
    const token = JSON.parse(localStorage.getItem(this.authLocalStorageToken));
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer ' + token
    })
  }
}
