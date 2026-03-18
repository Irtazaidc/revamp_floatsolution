// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class RackingRoutingService {

  constructor(
    private http: HttpClient
    ) { }

  getRacks(param) {
    return this.http.post(API_ROUTES.GET_RACK,param, this.getServerCallOptions())
  }

  getRackInformationByRackNo(param){
    return this.http.post(API_ROUTES.GET_RACK_INFO_BY_RACKNO, param, this.getServerCallOptions())
  }
  allocateRack(param){
    return this.http.post(API_ROUTES.ALLOCATE_RACK, param, this.getServerCallOptions())
  }
  putSample(param){
    return this.http.post(API_ROUTES.SAMPLE_PUT, param, this.getServerCallOptions())
  }

  getSampleInfoByBarCode(param){
    return this.http.post(API_ROUTES.GET_SAMPLE_INFO_BY_BARCODE, param, this.getServerCallOptions())
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
