// @ts-nocheck
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TabsSwitchingService } from 'src/app/modules/doctors/services/tabs-switching.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-test-profile-package',
  templateUrl: './test-profile-package.component.html',
  styleUrls: ['./test-profile-package.component.scss']
})
export class TestProfilePackageComponent implements OnInit {
  @ViewChild('testRates') testRates;
  @Output() sendParamID = new EventEmitter<any>();
  rdSearchBy = 'byCode'
  clear = false
  selectedLocId = 1
  selectedPanelId = null;
  testProtocol:any=null;
  testInstructuon:any=null;
  branchList = []
  panelList = []
  testList = []
  TPId: any = null;
  testGeneralData = {};
  testParametersData = [];
  testLoationTATData = [];
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
    private Tabs : TabsSwitchingService,
    ) { }
    spinnerRefs = {
      testGeneralSection: 'testGeneralSection',
      locationTATSection: 'locationTATSection'
    }

  ngOnInit(): void {
    this.getPanelList();
    // this.getLocationList();
    this.getTestProfileList();

  }

  branchListChanged(e) {
  }
  panelListChanged(e) {
    this.getTestProfileList();
  }

  customSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    if (this.rdSearchBy == 'byCode'){
      return item.TestProfileCode.toLowerCase().indexOf(term) == 0;
    }
    else if (this.rdSearchBy == 'byName'){
      return item.TestProfileName.toLowerCase().indexOf(term) > -1 ;
    }
  }
  rdSearchByClick(a){
    this.rdSearchBy = a;
  }

  testListChanged(e) {
  this.TPId = e.TPId;
  this.spinner.show(this.spinnerRefs.testGeneralSection);
    let objParm = {
      TPId: this.TPId
    }
    this.testProfileService.getTestProfileDetailByTPID(objParm).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.testGeneralSection);
      if (res.StatusCode == 200) {
        this.testGeneralData = res.PayLoadDS['Table'][0] || {};
        this.testProtocol= this.testGeneralData? this.testGeneralData['Protocol'].replace(/\r\n/g, '<br>'):this.testGeneralData['Protocol'];
        this.testInstructuon= this.testGeneralData? this.testGeneralData['Instruction'].replace(/\r\n/g, '<br>'):this.testGeneralData['Instruction'];
        let TypeId = this.testGeneralData['TypeId'];
        if (TypeId === 3){
          this.getPackageList(this.testGeneralData)
        }
        else{
          this.testParametersData = res.PayLoadDS['Table1'] || [];
        }
        this.testLoationTATData = res.PayLoadDS['Table2'] || [];
        
        if(this.testLoationTATData.length){
          this.getTATByTPID(this.testLoationTATData[0])
        }
        
      }
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.testGeneralSection);
      this.toastr.error('Connection error');
    })

  }
  getPanelList() {
    this.panelList = [];
    let _param = {};
    this.lookupService.getPanels(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.panelList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  getLocationList() {
    this.branchList = [];
    let _param = {};
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.branchList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  getTestProfileList() {
    this.testList = [];
    let _param = {
      branchId: this.selectedLocId,
      TestProfileCode: null,
      TestProfileName: null,
      panelId: (this.selectedPanelId > 0 ? this.selectedPanelId : null),
      TPIDs: ''
    };
    if (!_param.branchId) {
      this.toastr.warning('Please select branch');
      return;
    }

    this.testProfileService.getTestsByName(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.testList = data || [];
      }
    })
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.branchList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }

  getTATByTPID(location){
    console.log('i m  here ',location)
    this.repTimeShow =true;
    this.LocId = location.LocId;
    let objParm = {
      TPId: this.TPId,
      LocID:this.LocId
    };
    this.testProfileService.getTATByTPID(objParm).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.testGeneralSection);
      if (res.StatusCode == 200) {
        console.log('All res: ',res.PayLoadDS)
        this.locationTatUrgency = res.PayLoadDS['Table'][0] || {UrgentRptTime:-1};
        this.locationTATData = res.PayLoadDS['Table1'] || [];
        console.log('LocationTatUrgency is: ',this.locationTatUrgency);
        console.log('LocationTATData is: ',this.locationTATData);
      }
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.testGeneralSection);
      this.toastr.error('Connection error');
    })
  }

  minutesToHours(minutes){
    if(!minutes) return '';
    var h:any = Math.floor(minutes / 60);
    var m:any = minutes % 60;
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
  showTestRateCalculator(){
    this.appPopupService.openModal(this.testRates);
  }

  jumpToParamters(param){
    this.Tabs.setSelectedTabIndex(3,event); 
    this.sendParamID.emit(param)
  }

  getPackageList(e){

    let _params = {
      packageId: e.TPId,
      branchId: this.selectedLocId || null,
      panelId: (this.selectedPanelId || ''),
    }
    this.testProfileService.getPackageTestsProfiles(_params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        if (data.length) {
          this.testParametersData = data;
        }
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    });
}
}
