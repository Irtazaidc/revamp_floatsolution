// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { DatePipe } from '@angular/common';
import { AuthService, UserModel } from '../../../../modules/auth';
@Component({
  standalone: false,

  selector: 'app-panel-info',
  templateUrl: './panel-info.component.html',
  styleUrls: ['./panel-info.component.scss']
})
export class PanelInfoComponent implements OnInit {

  loggedInUser: UserModel;
  rdSearchBy = 'byCode'
  clear = false
  panelGeneralData = {};
  panelsList = [];
  tesetProfilePackageList = [];
  testList = [];
  profileList = [];
  packageList = [];
  FilterString='';
  PanelID: any;
  FilterStringTest ='';
  FilterStringProfile ='';
  FilterStringPackage ='';
  constructor(
  private lookupService: LookupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private auth: AuthService,
    public helperService: HelperService,
    ) { }
    spinnerRefs = {
      panelGeneralSection: 'panelGeneralSection',
      testSection: 'testSection',
      profileSection: 'profileSection',
      packageSection: 'packageSection'
    }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getPanels();
    

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    console.log("Login info is: ",this.loggedInUser)
  }
  getPanels() {
    this.panelsList = [];
    let _params = {
      branchId: null//this.loggedInUser.locationid
    }
    console.log('Param is: ',_params)
    if (!this.loggedInUser.locationid) {
      this.toastr.warning('Branch ID not found');
      return;
    }
    this.lookupService.getPanels(_params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }

        this.panelsList = data || [];
        console.log('this.panelsList',this.panelsList)
      }
    }, (err) => {
      console.log(err);
    });
  }

  customSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    if (this.rdSearchBy == 'byCode'){
      return item.Code.toLowerCase().indexOf(term) == 0;
    }
    else if (this.rdSearchBy == 'byName'){
      return item.CodeName.toLowerCase().indexOf(term) > -1 ;
    }
  }
  rdSearchByClick(a){
    this.rdSearchBy = a;
    console.log('rdSearby val: ',this.rdSearchBy)
  }
  
  paneListChanged(e) {
    this.panelGeneralData=[]
    this.PanelID = e.PanelId;
    this.spinner.show(this.spinnerRefs.panelGeneralSection);
    let objParm = {
      PanelID: this.PanelID
    }
    
    this.lookupService.getPanelDetailByPanelID(objParm).subscribe((res: any) => {
      console.log('Test Detail Resp_______',res.PayLoadDS)
      this.spinner.hide(this.spinnerRefs.panelGeneralSection);
      if (res.StatusCode == 200) {
        this.panelGeneralData = res.PayLoadDS['Table'][0] || {};
        this.tesetProfilePackageList = res.PayLoadDS['Table1'] || [];
        this.testList = this.tesetProfilePackageList.filter( a=> (a.TypeId == 1));
        this.profileList = this.tesetProfilePackageList.filter( a=> (a.TypeId == 2));
        this.packageList = this.tesetProfilePackageList.filter( a=> (a.TypeId == 3));
        console.log('Test Detail_______',this.testList)
      }
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.panelGeneralSection);
      this.toastr.error('Connection error');
    })

  }
  
  truncate(source, size) { 
    if(source){
      return source.length > size ? source.slice(0, size - 1) + " …" : source;
    } else{
      return '';
    }
  }
  getFormatedStringFromDays(numberOfDays) {
    var currentDate = new Date();
    var calculatedDate = currentDate.setDate(currentDate.getDate() - numberOfDays);
    var finalDateParam = this.datePipe.transform(calculatedDate, 'yyyy, MM, dd');
    return(this.getAge(new Date(finalDateParam), new Date()))
  }


  getAge(date_1, date_2) {
    //convert to UTC
    var date2_UTC = new Date(Date.UTC(date_2.getUTCFullYear(), date_2.getUTCMonth(), date_2.getUTCDate()));
    var date1_UTC = new Date(Date.UTC(date_1.getUTCFullYear(), date_1.getUTCMonth(), date_1.getUTCDate()));
    var yAppendix, mAppendix, dAppendix;
    //--------------------------------------------------------------
    var days = date2_UTC.getDate() - date1_UTC.getDate();
    if (days < 0) {
        date2_UTC.setMonth(date2_UTC.getMonth() - 1);
        days += this.DaysInMonth(date2_UTC);
    }
    //--------------------------------------------------------------
    var months = date2_UTC.getMonth() - date1_UTC.getMonth();
    if (months < 0) {
        date2_UTC.setFullYear(date2_UTC.getFullYear() - 1);
        months += 12;
    }
    //--------------------------------------------------------------
    var years = date2_UTC.getFullYear() - date1_UTC.getFullYear();
    if (years > 1) yAppendix = "yrs";
    else yAppendix = "y";
    if (months > 1) mAppendix = "mos";
    else mAppendix = "m";
    if (days > 1) dAppendix = "dys";
    else dAppendix = "d";
    return years + yAppendix + ", " + months + mAppendix + ", " + days + dAppendix;
  }

  DaysInMonth(date2_UTC) {
      var monthStart:any = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth(), 1);
      var monthEnd:any = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth() + 1, 1);
      var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
      return monthLength;
  }

}
