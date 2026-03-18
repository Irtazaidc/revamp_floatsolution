// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';


@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  constructor(private http: HttpClient) { }


  
  getPushNotificationsList(params) {
    return this.http.post(
      `${API_ROUTES.GET_PUSH_NOTIFICATIONS_LIST}`,
        params,
        this.getServerCallOptions());
  }
  getPushNotificationTokens(params) {
    return this.http.post(
      `${API_ROUTES.GET_PUSH_NOTIFICATION_TOKENS}`,
        params,
        this.getServerCallOptions());
  }
  sendPushNotifications(params) {
    return this.http.post(
      `${API_ROUTES.SEND_PUSH_NOTIFICATIONS}`,
        params,
        this.getServerCallOptions());
  }

  savePushNotification(params) {
    return this.http.post(
      `${API_ROUTES.SAVE_PUSH_NOTIFICATION}`,
        params,
        this.getServerCallOptions());
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
