// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class NewsEventsService {

  constructor(private http: HttpClient) { }

  getNewsAndEvents(params) {
    return this.http.post(API_ROUTES.GET_NEWS_AND_EVENTS, params, this.getServerCallOptions());
  }
  addUpdateNewsAndEvents(params) { 
    return this.http.post(API_ROUTES.ADD_UPDATE_NEWS_AND_EVENTS, params, this.getServerCallOptions());
  }
  deleteActivate(data){ 
    return this.http.post(API_ROUTES.DELETE_INACTIVE_NEFWS_EVENT, data,this.getServerCallOptions())
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
