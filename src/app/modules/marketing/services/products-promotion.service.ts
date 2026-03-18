// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class ProductsPromotionService {

  constructor(private http: HttpClient) { }

  // Get Product Promotion/s if we pass id then will retuen sigle row else will return all active rows
  getProductPromotions(params) {
    return this.http.post(API_ROUTES.GET_PRODUCT_PROMOTIONS, params, this.getServerCallOptions());
  }
  getProductPromotionsForKBS(params) {
    return this.http.post(API_ROUTES.GET_PRODUCT_PROMOTIONS_FOR_KBS, params, this.getServerCallOptions());
  }

  // if id=0 then update product promotion row else add product promotion row
  addUpdateProductPromotion(params) {
    return this.http.post(API_ROUTES.ADD_UPDATE_PRODUCT_PROMOTION, params, this.getServerCallOptions());
  }

  // Delete Active/In-active product promotion row
  deleteActivate(data){ 
    return this.http.post(API_ROUTES.DELETE_INACTIVE_PRODUCT_PROMOTION, data,this.getServerCallOptions())
  }

  saveTestProfilePic(params) {
    return this.http.post(`${API_ROUTES.TP_TESTPROFILE_PIC}`,params,this.getServerCallOptions());
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
