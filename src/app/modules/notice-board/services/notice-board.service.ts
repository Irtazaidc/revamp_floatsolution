// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { API_ROUTES } from '../../../shared/helpers/api-routes';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class NoticeBoardService {

  constructor(private http: HttpClient) { }

  addUpdateNotification(params) {
    return this.http.post(API_ROUTES.ADD_UPDATE_NOTICE_BOARD, params, this.getServerCallOptions());
  }
  GetNotifications() {
    return this.http.post(API_ROUTES.GET_NOTIFICATIONS, this.getServerCallOptions())
  }

  getNotificationDetailByID(params) {
    return this.http.post(API_ROUTES.GET_NOTIFICATION_DETAIL_BY_ID, params, this.getServerCallOptions())
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


