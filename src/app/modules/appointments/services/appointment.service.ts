// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient) { }

  getRISModalities(params) {
    return this.http.post(API_ROUTES.GET_RIS_MODALITIES, params,  this.getServerCallOptions());
  }
  getModalityWiseAppointments(params) {
    return this.http.post(API_ROUTES.GET_APPOINTMENTS_MODALITY_WISE, params,  this.getServerCallOptions());
  }
  getModalitySchedule(params) {
    return this.http.post(API_ROUTES.GET_MODALITY_SCHEDULE, params,  this.getServerCallOptions());
  }
  getAppointmentTypes() {
    return this.http.post(API_ROUTES.GET_APPOINTMENT_TYPES, '',  this.getServerCallOptions());
  }

  getAppointmentStatuses() {
    return this.http.post(API_ROUTES.GET_APPOINTMENT_STATUSES, '',  this.getServerCallOptions());
  }

  getAppointmentReasons() {
    return this.http.post(API_ROUTES.GET_APPOINTMENT_REASONS, '',  this.getServerCallOptions());
  }

  getModalityWiseTests(params) {
    return this.http.post(API_ROUTES.GET_MODALITY_WISE_TESTS, params,  this.getServerCallOptions());
  }

  getDoctorsModalityWise(params) {
    return this.http.post(API_ROUTES.GET_DOCTORS_MODALITY_WISE, params,  this.getServerCallOptions());
  }

  insertUpdAppointment(params) {
    return this.http.post(API_ROUTES.INSERT_UPD_APPOINTMENT, params,  this.getServerCallOptions());
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
