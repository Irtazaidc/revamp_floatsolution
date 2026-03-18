// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SampleTrackingService {

  constructor(private http: HttpClient) { }

  getData(route, param) {
    return this.http.post(route, param, this.getServerCallOptions())
  }

  insertUpdateData(route, param) {
    return this.http.post(route, param, this.getServerCallOptions())
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