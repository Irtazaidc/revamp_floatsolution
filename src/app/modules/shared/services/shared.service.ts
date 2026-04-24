// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private http: HttpClient) { }

  getEmployees(params) {
    return this.http.post(API_ROUTES.GET_EMPLOYEES, params, this.getServerCallOptions());
  }
  verifyIDCEmpCredentials(params) {
    return this.http.post(API_ROUTES.VERIFY_IDC_USER_CREDENTIAL, params, this.getServerCallOptions());
  }
  verifyEmployee(params) {
    return this.http.post(API_ROUTES.VERIFY_IDC_USER_CREDENTIAL, params, this.getServerCallOptions());
  }
  encryptString(params) {
    return this.http.post(API_ROUTES.ENCRYPT_STRING, params, this.getServerCallOptions());
  }
  decryptString(params) {
    return this.http.post(API_ROUTES.DECRYPT_STRING, params, this.getServerCallOptions());
  }
   GoogleAPIKEYString(params) {
    return this.http.post(API_ROUTES.GOOGLE_API_KEY, params, this.getServerCallOptions());
  }
  insertUpdateOutSourceHospital(param) {
    return this.http.post(API_ROUTES.INSERT_OUTSOURCE_HOSPITALS, param, this.getServerCallOptions())
  }
  getOutSourceHospitalsDetail(param) {
    return this.http.post(API_ROUTES.GET_OUTSOURCE_HOSPITALS_DETAIL, param, this.getServerCallOptions())
  }
  getUserID(params) {
    return this.http.post(API_ROUTES.GET_USER_ID, params, this.getServerCallOptions());
  }
  getDueClearanceReport(params) {
    return this.http.post(API_ROUTES.GET_DUE_CLEARANCE_REPORT, params, this.getServerCallOptions());
  }
  getPACsCommLog(params) {
    return this.http.post(API_ROUTES.GET_PACS_COMM_LOG , params, this.getServerCallOptions());
  }
  verifyUser(params) {
    return this.http.post(API_ROUTES.VERIFY_USER, params, this.getServerCallOptions());
  }
  getInsuranceInquiryReport(params) {
    return this.http.post(API_ROUTES.GET_PATIENT_INSURANCE_INQUIRY_REPORT, params, this.getServerCallOptions());
  }
  getMessActivationData(params) {
    return this.http.post(API_ROUTES.GET_MESS_ACTIVATION_DATA, params, this.getServerCallOptions());
  }
  getAppUserCount(params) {
    return this.http.post(API_ROUTES.GET_APP_USER_COUNT, params, this.getServerCallOptions());
  }
  getPanelServicesShare(params) {
    return this.http.post(API_ROUTES.GET_PANEL_SERVICES_SHARE, params, this.getServerCallOptions());
  }
  getAlfalahEmailReport(params) {
    return this.http.post(API_ROUTES.GET_ALFALAH_EMAIL_REPORT, params, this.getServerCallOptions());
  }
  resendAlfalahEmailReport(params) {
    return this.http.post(API_ROUTES.RESEND_ALFALAH_EMAIL, params, this.getServerCallOptions());
  }
  getPendingPanelReport(params) {
    return this.http.post(API_ROUTES.GET_PENDING_PANEL_REPORT, params, this.getServerCallOptions());
  }
  getPanelConversionReport(params) {
    return this.http.post(API_ROUTES.GET_PANEL_CONVERSION_REPORT, params, this.getServerCallOptions());
  }

   getRadiologistInfo(params) {
    return this.http.post(API_ROUTES.GET_RADIOLOGIST_INFO, params, this.getServerCallOptions());
  }

  getData(route,param) {
    return this.http.post(route, param, this.getServerCallOptions())
  }
  getUtility(route) {
    return this.http.get(route, this.getServerCallOptions())
  }
  getDataGET(route) {
    return this.http.get(route, this.getServerCallOptions())
  }

  revertAddendumSecondOpinion(route,param) {
    return this.http.post(route, param, this.getServerCallOptions())
  }


  getDataArrayBuffer(route,param) {
    return this.http.post(route, param, this.getServerCallOptions1())
  }


  insertUpdateData(route,param) {
    return this.http.post(route,param, this.getServerCallOptions())
  }
  insertUpdateDataForGeneratorLog(route,param) {
    return this.http.post(route,param, this.getServerCallOptions())
  }
  
  deleteRecord(route,param){
    return this.http.post(route,param, this.getServerCallOptions())
  }

  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  loadGoogleMap(key: string, libraries = 'places'): Promise<void> {
    if (this.loaded) {
      return Promise.resolve();
    }
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise<void>((resolve, reject) => {
      try {
        // If a script already exists with Google Maps, resolve immediately
        const existing = Array.from(document.getElementsByTagName('script'))
          .find(s => s.src && s.src.indexOf('maps.googleapis.com/maps/api/js') !== -1);
        if (existing) {
          // If it's already loaded, resolve. If not, wait on its load event.
          if ((existing as any)._gm_loaded) {
            this.loaded = true;
            resolve();
          } else {
            existing.addEventListener('load', () => { (existing as any)._gm_loaded = true; this.loaded = true; resolve(); });
            existing.addEventListener('error', (e) => reject(e));
          }
          return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        // Google Maps best-practice loading: add `loading=async` to avoid performance warning.
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=${encodeURIComponent(libraries)}&loading=async&v=weekly`;

        script.onload = () => {
          (script as any)._gm_loaded = true;
          this.loaded = true;
          resolve();
        };
        script.onerror = (err) => {
          reject(new Error('Google Maps script failed to load: ' + err));
        };

        document.head.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });

    return this.loadingPromise;
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
      // "Authorization": "Basic jwt"
    })
  }
  getServerCallOptions1(): object {
    return {
      headers: this.getCommonHeaders1(),
      responseType: "arraybuffer"
    }
  }
  getCommonHeaders1() {
    return new HttpHeaders({
      // 'Content-Type': 'application/json',
      // "Authorization": "Basic jwt"
    })
  }
 
}
