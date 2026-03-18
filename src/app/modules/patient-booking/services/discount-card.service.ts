// @ts-nocheck
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class DiscountCardService  {

  constructor(private http: HttpClient) { }

  getDiscountCardDetails(params) {
    return this.http.post(API_ROUTES.GET_DISCOUNT_CARD_DETAILS, params, this.getServerCallOptions());
  }
  getFamilyDiscountCardDetails(params) {
    return this.http.post(API_ROUTES.GET_FAMILY_CARD_DETAILS, params, this.getServerCallOptions());
  }
  getDiscountCardList(params) {
    return this.http.post(API_ROUTES.GET_DISCOUNT_CARD_LIST, params, this.getServerCallOptions());
  }
  InsertFamilyDiscountCardDetails(params) {
    return this.http.post(API_ROUTES.INSERT_FAMILY_CARD_DETAILS, params, this.getServerCallOptions());
  }
  getRelationshipName() {
    return this.http.post(API_ROUTES.GET_RELATIONSHIP_NAMES, this.getServerCallOptions());
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
