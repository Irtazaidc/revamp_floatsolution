// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';
// import { API_ROUTES } from '../../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  
  constructor(private http: HttpClient) { }

  
  getRoles(params) {
    return this.http.post(API_ROUTES.GET_ROLES, params, this.getServerCallOptions());
  }
  insertUpdateRole(params) {
    return this.http.post(API_ROUTES.UPDATE_ROLE, params, this.getServerCallOptions());
  }
  getUsersByRoleID(params) {
    return this.http.post(API_ROUTES.GET_USERS_BY_ROLE, params, this.getServerCallOptions());
  }
  deleteRole(params) {
    return this.http.post(API_ROUTES.UPDATE_ROLE, params, this.getServerCallOptions());
  }


  
  getUsers(params) {
    return this.http.post(API_ROUTES.GET_USERS, params, this.getServerCallOptions());
  }
  updateUserRole(params) {
    return this.http.post(API_ROUTES.UPDATE_USER_ROLE, params, this.getServerCallOptions());
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
