// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class AccessioningService {

  constructor(private http: HttpClient) { }
  
  getSampleInfoByBarCode(param){
    return this.http.post(API_ROUTES.GET_SAMPLE_INFO_BY_RACK, param, this.getServerCallOptions())
  }
  lockRackByRackBarcode(param){
    return this.http.post(API_ROUTES.LOCK_RACK_BY_RACKBARCODE, param, this.getServerCallOptions())
  }

  getSampleListByScreen(param){
    return this.http.post(API_ROUTES.GET_SAMPLE_LIST_BY_SCREEN, param, this.getServerCallOptions())
  }
  transferSampleToMachine(param){
    return this.http.post(API_ROUTES.TRANSFER_SAMPLE_TO_MACHINE, param, this.getServerCallOptions())
  }

  moveSampleToTransferRack(param){
    return this.http.post(API_ROUTES.MOVE_SAMPLE_TO_TRANSFER_RACK, param, this.getServerCallOptions())
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
