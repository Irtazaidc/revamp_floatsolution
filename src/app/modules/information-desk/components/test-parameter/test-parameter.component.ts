// @ts-nocheck
import { Component, Input, OnInit, ViewChild, OnChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { DatePipe } from '@angular/common';

@Component({
  standalone: false,

  selector: 'app-test-parameter',
  templateUrl: './test-parameter.component.html',
  styleUrls: ['./test-parameter.component.scss']
})
export class TestParameterComponent implements OnInit, OnChanges {

 @Input() getParamID:any;

  rdSearchBy = 'byCode'
  clear = false
  paramList = []
  PId: any = null;
  paramGeneralData = {};
  paramTestsList = [];
  paramReferenceRanges = [];
  FilterString='';
  FilterStringParam='';
  LocId: any=null;
  repTimeShow: boolean;
  locationTatUrgency:object ={}
  locationTATData = []
  paramId: number=null;
  indexValue: number=null;
  constructor(
  private lookupService: LookupService,
    private testProfileService: TestProfileService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private datePipe: DatePipe,
    ) { }
    spinnerRefs = {
      testGeneralSection: 'testGeneralSection',
      locationTATSection: 'locationTATSection'
    }

  ngOnInit(): void {
    this.getparamList();
  }

  ngOnChanges(){
    if(this.getParamID){
    this.paramListChanged(this.getParamID);
    }
  }

  customSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    if (this.rdSearchBy == 'byCode'){
      return item.PCode.toLowerCase().indexOf(term) == 0;
    }
    else if (this.rdSearchBy == 'byName'){
      return item.PName.toLowerCase().indexOf(term) > -1 ;
    }
  }
  rdSearchByClick(a){
    this.rdSearchBy = a;
    console.log('rdSearby val: ',this.rdSearchBy)
  }
  paramListChanged(e) {
  this.PId = e.PId || e.PID;
  this.spinner.show(this.spinnerRefs.testGeneralSection);
    const objParm = {
      PId: this.PId
    }
    this.testProfileService.getTestProfileDetailByPID(objParm).subscribe((res: any) => {
      console.log('Test Detail Resp_______',res.PayLoadDS)
      this.spinner.hide(this.spinnerRefs.testGeneralSection);
      if (res.StatusCode == 200) {
        this.paramTestsList = res.PayLoadDS['Table'] || [];
        this.paramGeneralData = res.PayLoadDS['Table1'][0] || {};
        this.paramReferenceRanges = res.PayLoadDS['Table2'] || [];
      }
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.testGeneralSection);
      this.toastr.error('Connection error');
    })

  }
  
  getparamList() {
    this.paramList = [];
    const _param = {
    };

    this.testProfileService.getParameter(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.paramList = data || [];
      }
    })
  }

  minutesToHours(minutes){
    if(!minutes) return '';
    let h:any = Math.floor(minutes / 60);
    let m:any = minutes % 60;
    h = h < 10 ? '0' + h : h; 
    m = m < 10 ? '0' + m : m; 
    return h + ':' + m;
  }
  getParamDetail(param,index){
    this.paramId = param.Id;
    this.indexValue = index;
  }
  truncate(source, size) { 
    if(source){
      return source.length > size ? source.slice(0, size - 1) + " …" : source;
    } else{
      return '';
    }
  }

  getFormatedStringFromDays(numberOfDays) {
    const currentDate = new Date();
    const calculatedDate = currentDate.setDate(currentDate.getDate() - numberOfDays);
    const finalDateParam = this.datePipe.transform(calculatedDate, 'yyyy, MM, dd');
    return(this.getAge(new Date(finalDateParam), new Date()))
  }


  getAge(date_1, date_2) {
    //convert to UTC
    const date2_UTC = new Date(Date.UTC(date_2.getUTCFullYear(), date_2.getUTCMonth(), date_2.getUTCDate()));
    const date1_UTC = new Date(Date.UTC(date_1.getUTCFullYear(), date_1.getUTCMonth(), date_1.getUTCDate()));
    let yAppendix, mAppendix, dAppendix;
    //--------------------------------------------------------------
    let days = date2_UTC.getDate() - date1_UTC.getDate();
    if (days < 0) {
        date2_UTC.setMonth(date2_UTC.getMonth() - 1);
        days += this.DaysInMonth(date2_UTC);
    }
    //--------------------------------------------------------------
    let months = date2_UTC.getMonth() - date1_UTC.getMonth();
    if (months < 0) {
        date2_UTC.setFullYear(date2_UTC.getFullYear() - 1);
        months += 12;
    }
    //--------------------------------------------------------------
    const years = date2_UTC.getFullYear() - date1_UTC.getFullYear();
    if (years > 1) yAppendix = "yrs";
    else yAppendix = "y";
    if (months > 1) mAppendix = "mos";
    else mAppendix = "m";
    if (days > 1) dAppendix = "dys";
    else dAppendix = "d";
    return years + yAppendix + ", " + months + mAppendix + ", " + days + dAppendix;
  }

  DaysInMonth(date2_UTC) {
      const monthStart:any = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth(), 1);
      const monthEnd:any = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth() + 1, 1);
      const monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
      return monthLength;
  }

}
