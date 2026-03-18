// @ts-nocheck
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class PostexService {

 // private authorizationUrl = 'https://zconnect.jsbl.com/zconnect/client/oauth-blb';
  // private resetAuthUrl = 'https://zconnect.jsbl.com/zconnect/client/reset-oauth-blb';
  // private qrUrl = 'https://zconnect.jsbl.com/zconnect/api/v1/DQR/RAAST';

  constructor(private http: HttpClient) {}

  createQrCodeViaProxy(param: any, authOptions: any) {
  const payload = {
    body: param,
    clientId: authOptions.clientId,
    clientSecret: authOptions.clientSecret,
    organizationId: authOptions.organizationId?.toString()
  };
  return this.http.post(API_ROUTES.CREATE_QR_CODE_JSBANK, payload);
}

resetAuthorizationViaProxy(clientId) {
  const payload = {
    body: { clientSecretId: clientId },
  };
  return this.http.post(API_ROUTES.RESET_AUTH_JSBANK, payload, this.getServerCallOptions());
}

fetchAuthorizationforJsBank() {
  return this.http.get(API_ROUTES.GET_AUTH_JSBANK);
}

verifyTransaction(param: any, authOptions: any) {
  const payload = {
    body: param,
    clientId: authOptions.clientId,
    clientSecret: authOptions.clientSecret,
    organizationId: authOptions.organizationId?.toString()
  };
  return this.http.post(API_ROUTES.VERIFY_TRANSACTION, payload);
}

GetOnlinePaymentReference(param: any) {
  return this.http.post(API_ROUTES.GET_ONLINE_PAYMENT_REFERENCE, param, this.getServerCallOptions());
}

InsertOnlinePaymentQrCodeCredentials(param: any) {
  return this.http.post(API_ROUTES.INSERT_ONLINE_PAYMENT_QR_CODE_CREDENTIALS, param, this.getServerCallOptions());
}
InsertOnlinePaymenVerificationCredentials(param: any) {
return this.http.post(API_ROUTES.INSERT_ONLINE_PAYMENT_VERIFICATION_CREDENTIALS, param, this.getServerCallOptions());
}


/* ------------------- Common Utility Methods ------------------- */

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
