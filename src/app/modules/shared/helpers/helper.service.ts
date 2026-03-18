// @ts-nocheck
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
import { IVisitDocs, VisitDocs } from '../../auth/_models/documents.model';
import { CONSTANTS } from './constants';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    // private toastr: ToastrService
  ) { }
  addImagesData(data) { // add patient image, either from DB or clipart according to gender
    let imaagesAddedData = [];
    data.forEach(element => {
        let obj = {...element};
        if(!element['PatientImage']) {
            obj['PatientImage'] = ((element['Gender'] || element["GENDER"]) == 'F' ? CONSTANTS.USER_IMAGE.FEMALE : (element['Gender'] || element["GENDER"]) == 'M' ? CONSTANTS.USER_IMAGE.MALE : CONSTANTS.USER_IMAGE.UNSPECIFIED);
        } else {
            if(element['PatientImage'].indexOf('data:image') <= -1) { // check if image prefix is already appended
                obj['PatientImage'] = CONSTANTS.IMAGE_PREFIX.PNG + element['PatientImage'];
            }
        }
        imaagesAddedData.push(obj);
    });
    return imaagesAddedData;
  }

  promotionImagesData(data) { 
    let imaagesAddedData = [];
    data.forEach(element => {
        let obj = {...element};
        if(element['PromotionImage']!=null){
          if(element['PromotionImage'].indexOf('data:image') <= -1) { // check if image prefix is already appended
            obj['PromotionImage'] = CONSTANTS.IMAGE_PREFIX.PNG + element['PromotionImage'];
        }
        }
       
        imaagesAddedData.push(obj);
    });
    return imaagesAddedData;
  }
  promotionThumbnailImagesData(data) { 
    let imaagesAddedData = [];
    data.forEach(element => {
        let obj = {...element};
        if(element['PromotionImageThumbnail']!=null){
          if(element['PromotionImageThumbnail'].indexOf('data:image') <= -1) { // check if image prefix is already appended
            obj['PromotionImageThumbnail'] = CONSTANTS.IMAGE_PREFIX.PNG + element['PromotionImageThumbnail'];
        }
        }
       
        imaagesAddedData.push(obj);
    });
    return imaagesAddedData;
  }
  addPrefixToDocs(data) { 
    let docsData = [];
    data.forEach( (doc, i) => {
        let obj = {...doc};
        let _obj:IVisitDocs = new VisitDocs();
        _obj.data = (obj.VisitDocBase64 || obj.Doc || obj.VisitDocBase64Thumbnail || obj.GDocBase64 || obj.DocBase64 || '' );

        _obj.docId = (obj.DocId);
        _obj.uniqueIdentifier = Number((+new Date())+ (i)+'');
        _obj.fileName = obj.Title;
        _obj.CreatedOn = obj.CreatedOn;
        _obj.CreatedName = obj.EmployeeName;
        _obj.fileType = obj.VisitDocType || 'image/png';
        _obj.data = _obj.data;
        // _obj.sanitizedData = _obj.data ? this.sanitizer.bypassSecurityTrustResourceUrl(_obj.data) : '';
        _obj.thumbnail = obj.VisitDocBase64Thumbnail;
        _obj.visitId = obj.VisitId;

        // obj.data = obj.VisitDocBase64 || obj.Doc || '';
        if(_obj.data && _obj.data.indexOf('data:') == -1) { // check if image prefix is already appended
          _obj.data = 'data:' + (_obj.fileType) + ';base64,' + _obj.data;
        }
        if(_obj.thumbnail && _obj.thumbnail.indexOf('data:') == -1) { // check if image prefix is already appended
          _obj.thumbnail = 'data:' + (_obj.fileType) + ';base64,' + _obj.thumbnail;
        }

        _obj.sanitizedData = _obj.data ? this.sanitizer.bypassSecurityTrustResourceUrl(_obj.data) : '';
        _obj.sanitizedThumbnail = _obj.data ? this.sanitizer.bypassSecurityTrustResourceUrl(_obj.thumbnail || _obj.data) : '';

        docsData.push(_obj);
    });
    return docsData;
  }


  formatNumericValues(value) {
    return (value || '').toString().replace(CONSTANTS.REGEX.nimericWithComma, ",");
  }

  parseNumbericValues(value, roundingFn = 'round') {
    let _value = value;
    if(!isNaN(value)) {
      _value = Number(_value);
      switch(roundingFn) {
        case 'round':
          _value = Math.round(_value);
          break;
        case 'floor':
          _value = Math.floor(_value);
          break;
        case 'ceil':
          _value = Math.ceil(_value);
          break;
        default:
          _value = Math.round(_value);
      }
    } else {
      _value = 0;
    }
    return _value;
  }

  formatDecimalValue(value) {
    return Math.round(value * 100) / 100;
  }
  calculateTaxValue(fullValue, taxRate) {
    
    // tax calculation formula by Account/Finance deparment
    // (ActualPrice * TaxRate/100) + (ActualValue) = ValueWithTax
    // (ActualValue * 17 + ActualValue * 100) / 100
    // ActualValue(17 + 100)
    // (ValueWithTax * 100) / (TaxRate + 100)
    // (900 * 100) / (TaxRate + 100) = 769.2308

    let valueWithoutTax = 0;
    // calculatedTax = (900 * 100) / 117 = 769.2308
    valueWithoutTax = (fullValue * 100) / (taxRate + 100);
   //new code comentd  // valueWithoutTax = fullValue * (1 + taxRate / 100)


    let obj = {
      fullValue: fullValue,
      taxRate: taxRate,
      taxValue: fullValue - valueWithoutTax,
      withoutTaxValue: valueWithoutTax
    }
    return obj;
  }
  getTotal(arr, key) {
    return arr.map(a => a[key]).reduce((a, b) => this.parseNumbericValues(a) + this.parseNumbericValues(b), 0);
  }
  

  updateUrlParams_navigateTo(url, params = {}, settings = {}) {
    const _url = url || [];
    let _settings = { ...{
        // relativeTo: this.route,
        replaceUrl: true,
        queryParams: params,
        // queryParamsHandling: 'merge', // remove to replace all query params by provided
      }, ...settings};
    this.router.navigate(
      _url,
      _settings
      );
  }

  windowRefresh() {
    try {
      this.updateUrlParams_navigateTo('', {ver: (+new Date())}, {queryParamsHandling: 'merge'});
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {}
  }

  replaceAll(str, find, replace) {
    // return str;
    return str.replaceAll(find, replace);
    return str.replace(new RegExp(find.toString(), 'g'), replace);
  }


  copyMessage(val: string){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    // this.toastr.info('Text copied');
  }

  getUrlParams() {
    const vars = {};
    let hash;
    let encryptedQueryString = '';
    if (window.location.href.indexOf('?') === -1) {
      return vars;
    } else {
      encryptedQueryString = window.location.href.slice(window.location.href.indexOf('?') + 1);
    }
    try {
      encryptedQueryString = decodeURIComponent(encryptedQueryString);
    } catch (err) { }
    try {
      encryptedQueryString = atob(encryptedQueryString);
    } catch (err) {
      try {
        encryptedQueryString = atob(encryptedQueryString + '=');
      } catch (err) {
        try {
          encryptedQueryString = atob(encryptedQueryString + '==');
        } catch (err) {
          try {
            encryptedQueryString = atob(encryptedQueryString.split('=').filter(a => a).join('='));
          } catch (err) {
            // console.log(err);
          }
        }
      }
    }
    let hashes = encryptedQueryString.split('&'); // atob
    for (let i = 0; i < hashes.length; i++) {
      hash = hashes[i].split(/=(.+)/); //.split('=');
      //vars.push(hash[0]);
      vars[hash[0]] = hash[1];
      // console.log("hash", hash);
    }
    return vars;
  }

  formateImagesData(data,imageColumnName) { 
    let imaagesAddedData = [];
    data.forEach(element => {
        let obj = {...element};
        if(element[imageColumnName]!=null){
          if(element[imageColumnName].indexOf('data:image') <= -1) {
            obj[imageColumnName] = CONSTANTS.IMAGE_PREFIX.PNG + element[imageColumnName];
        }
        }
       
        imaagesAddedData.push(obj);
    });
    return imaagesAddedData;
  }

}
