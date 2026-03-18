// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(private http: HttpClient) { }

  
  getPermissions(params) {
    return this.http.post(API_ROUTES.GET_PERMISSIONS, params, this.getServerCallOptions());
  }
  updateRolePermissions(params) {
    return this.http.post(API_ROUTES.UPDATE_ROLE_PERMISSIONS, params, this.getServerCallOptions());
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
