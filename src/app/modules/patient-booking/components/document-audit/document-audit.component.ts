// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LabTatsService } from 'src/app/modules/lab/services/lab-tats.service';
import { LookupService } from '../../services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { VisitService } from '../../services/visit.service';

@Component({
  standalone: false,

  selector: 'app-document-audit',
  templateUrl: './document-audit.component.html',
  styleUrls: ['./document-audit.component.scss']
})
export class DocumentAuditComponent implements OnInit {

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: [ ],
    PatTypeId: [ ],
    UserId: [null],
    RefDoc: [''],
    PanelId: [ ],
  };
  isDisable = false;
  isSpinnerDisable = true;
  isSubmitted = false;
  branchList = [];
  selectedVisitID = null;
  searchText = '';
  maxDate: any;
  AttachmentId = '0';
  TotalRecord = 0;
  AttachmentFound = 0;
  NoAttachmentFound = 0;

  spinnerRefs = {
    dataTable: 'dataTable',
    refByDocField: 'refByDocField',
  }
  docAuditDataList:any = null;
  docAuditDataTestList :any = null;

  filterForm: FormGroup = this.formBuilder.group(this.Fields)

  paymentModesList = [];
  patientTypeList = [];
  employeesList = []
  panelList = []
  patientBasicInforFormSubmitted = false;

  ngbFormatterRefBy_input = (x: any) => x ? x.Name : ''; // will be displayed input field when value is selected
  ngbFormatterRefBy_output = (x: any) => x ? x.Name : '';
  ngbSearchRefBy = (text$: Observable<any>) => // used to bind data to dropdown
    text$.pipe(
      // debounceTime(300),
      distinctUntilChanged(),
      map(term => term.length < 2 ? [{ Name: 'Self' }]
        : this.refByDocList.filter(v => v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20))
    )
  
  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private excelService: ExcelService,
    private visit: VisitService,
  ) { }

  ngOnInit(): void {

    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getLookupsForRegistration();
    this.getRefByDoctors();
    this.getEmployeesForTestRegistration();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    this.maxDate = Conversions.getCurrentDateObject();
    }, 500);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.branchList = data || [];
        this.branchList = this.branchList.sort((a, b) => {
          if (a.Code > b.Code) {
            return 1;
          } else if (a.Code < b.Code) {
            return -1;
          } else {
            return 0;
          }
        });

      }
    }, (err) => {
      console.log(err);
    });
  }

  // onSelectAllBranches() {
  //   this.filterForm.patchValue({
  //     locID: this.branchList.map(a => a.LocId)
  //   });
  // }
  // onUnselectAllBranches() {
  //   this.filterForm.patchValue({
  //     locID: []
  //   });
  // }

  
  getLookupsForRegistration() {
    this.paymentModesList = [];
    this.lookupService.getLookupsForRegistration({ branchId: this.loggedInUser.locationid }).subscribe((resp: any) => {
      const _response = resp.PayLoadDS|| [];
      this.paymentModesList = _response.Table5 || [];
      this.patientTypeList = _response.Table6 || [];
    }, (err) => {
      console.log(err);
    })
  }
 

  getEmployeesForTestRegistration() {
    this.employeesList = [];
    // this.employeeDependentsList = [];
    this.lookupService.getEmployeesForTestRegistration({}).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoadDS) {
        let data = res.PayLoadDS.Table;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.employeesList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  panelsTypeList = []
  getPanelList() {
    this.panelList = [];
    this.panelsTypeList = [];
    const _param = {};
    this.lookupService.getPanels(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.panelList = data || [];
        this.panelsTypeList = [
              ...new Map(
                this.panelList.filter(a => a.PanelType) // ensure valid PanelType
                  .map(a => [a.PanelType, { 
                    PanelType: a.PanelType, 
                    PanelTypeName: a.PanelTypeName, 
                  }])
              ).values()
            ];
        console.log("🚀 ~ DocumentAuditComponent ~ getPanelList ~ this.panelsTypeList:", this.panelsTypeList)
      }
    }, (err) => {
      console.log(err);
    });
  }

  getDocAuditDataList(){
    const formValues = this.filterForm.getRawValue();
    this.isDisable = true;
    this.isSpinnerDisable = false;
    this.docAuditDataList = null;
    this.docAuditDataTestList = null;
    this.selectedVisitID = null;
    this.TotalRecord = 0;
    this.AttachmentFound = 0;
    this.NoAttachmentFound = 0;

    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const objParams = {
      FromDate: Conversions.formatDateObject(formValues.dateFrom) || null,
      ToDate: Conversions.formatDateObject(formValues.dateTo) || null,
      LocId: formValues.locID || -1,
      UserId: formValues.UserId || -1,//this.loggedInUser.userid,
      PatientType: formValues.PatTypeId || -1,
      PanelIds: Array.isArray(formValues.PanelId) && formValues.PanelId.length > 0
      ? formValues.PanelId.join(","): "-1",//this.panelList.map(a => a.PanelId).join(","), //formValues.PanelId.join(",") || -1,
      RefBy:formValues.RefDoc.Name ? `${formValues.RefDoc.Name}` : "-1",  //formValues.RefDoc.RefId
      IsDocAttached:Number(this.AttachmentId), // 2 for No attachecment // 1 for Attachment //   0 for All
    };  
    this.spinner.show(this.spinnerRefs.dataTable);
    this.visit.getDocumentsAuditData(objParams).subscribe((res: any) => {
      this.isDisable = false;
      this.isSpinnerDisable = true;
      this.spinner.hide(this.spinnerRefs.dataTable);
      console.log("res:", res)
      if (res.StatusCode == 200 ) {
        if(res.PayLoad.length){
          this.onDataLoaded(res.PayLoad);
          this.TotalRecord = res.PayLoad.length
        }
        else{
          this.toasrt.info('No Record Found');
          this.docAuditDataList = null;
          this.docAuditDataTestList = null;
          this.selectedVisitID = null;

        }
      } else {
        this.toasrt.error('Something Went Wrong');
        this.isDisable = false;
        this.isSpinnerDisable = true;
         this.docAuditDataList = null;
          this.docAuditDataTestList = null;
          this.selectedVisitID = null;
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.dataTable);
      this.toasrt.error('Connection error');
       this.isDisable = false;
        this.isSpinnerDisable = true;
         this.docAuditDataList = null;
          this.docAuditDataTestList = null;
          this.selectedVisitID = null;
    })
  }
  getVisitDataList(visitId){  
    const objParams = {
      VisitId:visitId || null,
    };  
    this.spinner.show(this.spinnerRefs.dataTable);
    this.visit.getVisitDetails(objParams).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.dataTable);
      if (res.StatusCode == 200 ) {
          this.docAuditDataTestList = res.PayLoadDS['Table2'] || [];
      } else {
        this.toasrt.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.dataTable);
      this.toasrt.error('Connection error');
    })
  }

  refByDocList = []
  getRefByDoctors() {
    this.refByDocList = [{ Name: 'Self' }];
    const _params = {};
    this.spinner.show(this.spinnerRefs.refByDocField);
    this.lookupService.getRefByDoctors(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.refByDocField);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.refByDocList = data || [{ Name: 'Self' }];

        // console.log("this.refByDocList", this.refByDocList);
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.refByDocField);
      console.log(err);
    });
  }

  rowIndex = null;
  onDataLoaded(data: any[]) {
    this.docAuditDataList = data;
    this.AttachmentFound = this.docAuditDataList.filter(item => item.DocumentsFound != 0 ).length;
    this.NoAttachmentFound = this.docAuditDataList.filter(item => item.DocumentsFound === 0).length;
    this.rowIndex = data.length > 0 ? 0 : null; // Set the first row as selected if data exists
    if (data.length > 0) {
        this.selectedVisitID = data[0].VisitId; // Set selectedVisitID to first row's VisitId
        this.getVisitDataList(this.selectedVisitID);
    }
}

getTableRowData(data: any, index: number) {
    this.selectedVisitID = data.VisitId;
    this.rowIndex = index;
    this.getVisitDataList(this.selectedVisitID);
}

patientTypeChanged(ev){
  if(ev && ev.TypeId == 2){
    this.getPanelList();
  }
  else{
    this.panelList = [];

  }
}


  groupPanelByTypeFn = (item) => item.PanelType;
  groupPanelsByTypeValueFn = (item) => { 
    return { PanelTypeName: this.panelList.find(b=>b.PanelType == item).PanelTypeName}
  };

  searchPanelsCustomFn(term, item) {
    term = term.toLowerCase();
    return (item.Name || '').toLowerCase().indexOf(term) > -1 || (item.Name || '').toLowerCase() === term
    || (item.Code || '').toLowerCase().indexOf(term) > -1 || (item.Code || '').toLowerCase() === term;
}

  onSelectPanelsType(reg) {
    this.filterForm.patchValue({
      PanelId: this.panelList.filter(a=>a.PanelType == reg.PanelType).map(a => a.PanelId)
    });
  }
 onUnselectAllPanels() {
    this.filterForm.patchValue({
      PanelId: -1
    });
  }

}
