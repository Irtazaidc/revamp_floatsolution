// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { ComplaintDashboardService } from '../../services/complaint-dashboard.service';
import { AuthService } from 'src/app/modules/auth';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupService } from '../../../patient-booking/services/lookup.service';
import { AppPopupService } from '../../../shared/helpers/app-popup.service';
import { Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-cms-inquiry',
  templateUrl: './cms-inquiry.component.html',
  styleUrls: ['./cms-inquiry.component.scss']
})
export class CmsInquiryComponent implements OnInit {

  @ViewChild('openEmployeeCard') openEmployeeCard;
  @ViewChild('openSearchRecord') openSearchRecord;

  getCurrentDate
  filterFormforCMSInquiry: FormGroup;
  employeeID: any;
  getEventvalues;
  CMSrequestID:number;
  cmsInquiryList = [];
  cmsInquiryTable= [];
  patientId: any;
  complaintDetailsList:any=[];
  responsiblePersonLIST: any=[];
  MeasuresTakenLIST: any=[];
  getVisitID=null;
  PPuserID=null;
  contactBackHistory = [];
  spinnerRefs = {
    cmsInquiryListTable: 'cmsInquiryListTable',
  };

  constructor(
    private complaintDashboardService: ComplaintDashboardService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private sharedService: SharedService,
  ) {
    this.filterFormforCMSInquiry = this.formBuilder.group({
      byCMSrequestID: [''],
      byCMSrequestNo: [''],
      cellNo: [''],  //RegisteredNo
      PIN: [''],
      PatientCLI: [''],
    });
    
  }

  ngOnInit(): void {
    this.getPermissions();
    this.route.queryParams.subscribe(params => {
      const cmsRequestId = params['CMSrequestID'];
      if (cmsRequestId) {
        const decodedRequestId = atob(cmsRequestId);
        console.log("Decoded CMS Request ID:", decodedRequestId);
        this.filterFormforCMSInquiry.patchValue({
          byCMSrequestID: decodedRequestId,
        });
        this.getCMSrequestInquiry();
      }
    });
  }
  getSearchCMSRequest(){
    let formValues = this.filterFormforCMSInquiry.getRawValue();
    formValues.PIN = (formValues.PIN || '').trim().toString().replace(/\D/g, '');
    if(formValues.byCMSrequestID){
      this.getCMSrequestInquiry();
      return
    }
    let objParm = {
          CMSRequestID: formValues.byCMSrequestID || null,
          CMSRequestNo: formValues.byCMSrequestNo || null,
          CellNo:formValues.cellNo || null, 
          VisitID:formValues.PIN || null,
          PatientCLI:formValues.PatientCLI || null,
        };
        this.spinner.show(this.spinnerRefs.cmsInquiryListTable);
        this.complaintDashboardService.GetSearchCMSRequest(objParm).subscribe((resp: any) => {
          this.spinner.hide(this.spinnerRefs.cmsInquiryListTable);
          if (resp.StatusCode == 200 && resp.PayLoad.length) {
            this.cmsInquiryList = resp.PayLoad;
            this.cmsInquiryTable=this.cmsInquiryList;
            this.patientId = this.cmsInquiryList[0].PatientID;
          } else {
            this.toastr.info('No Record Found');
          }
        }, (err) => {
          console.log(err);
          this.toastr.error('Something Went Wrong');
          this.spinner.hide(this.spinnerRefs.cmsInquiryListTable);
        });
  }
  getCMSrequestInquiry() {
    this.cmsInquiryTable = [];
    this.cmsInquiryList = [];
    let formValues = this.filterFormforCMSInquiry.getRawValue();
      this.CMSrequestID = formValues.byCMSrequestID;
      let objParm = {
        CMSRequestID: this.CMSrequestID || formValues.byCMSrequestNo ||  null,
        // CMSRequestNo: formValues.byCMSrequestNo || null,
      };
      this.spinner.show(this.spinnerRefs.cmsInquiryListTable);
      this.complaintDashboardService.getCMSinquiryDetails(objParm).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.cmsInquiryListTable);
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.cmsInquiryList = resp.PayLoad;
          this.cmsInquiryTable=this.cmsInquiryList;
          this.patientId = this.cmsInquiryList[0].PatientID;
          this.getHistoryOfCMSContactBackTracking();
          this.selectedComplaintByRequest();
          this.getResponsiblePerson();
          this.getMeasuresTakenData();
        } else {
          this.toastr.info('No Record Found');
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Something Went Wrong');
        this.spinner.hide(this.spinnerRefs.cmsInquiryListTable);
      });
   
  }

  loadedDocuments: any[];
  allowRemove=true;
  filtercomp:number = 26;
  screenIdentity='CMS'
  getLoadedDocs(event) {
    console.log("event:", event);
    this.allowRemove=false;
    this.loadedDocuments = Array.isArray(event) ? event : [event]; // Ensure event is an array
  
    const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1]; // Get the latest loaded document
  
    if (latestDoc) {
      const base64String = latestDoc.data; // Your base64 image string
      const binaryData = base64String;
      const sizeInBytes = binaryData.length;
      const sizeInKB = sizeInBytes / 1024;
      console.log("🚀imgesize:", sizeInKB);
      if (sizeInKB > 100) {
        this.toastr.warning('Image size should be less than 100KB');
        return;
      }
    }
  }
  activePanelIds: string[] = [];
  togglePanel(panelId: string): void {
    if (this.isActivePanel(panelId)) {
      this.activePanelIds = this.activePanelIds.filter(id => id !== panelId);
    } else {
      this.activePanelIds = [panelId];
    }
  }

  isActivePanel(panelId: string): boolean {
    return this.activePanelIds.includes(panelId);
  }
  truncate(source, size) {
    return source && source.length > size ? source.slice(0, size - 1) + "…" : source;
  }
  getHistoryOfCMSContactBackTracking() {
    let objParm = {
      CMSRequestID: this.CMSrequestID || null,
    };
    this.complaintDashboardService.getHistoryOfCMSContactBack(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.contactBackHistory = resp.PayLoad;
        console.log(" this.contactBackHistory:", this.contactBackHistory);
      } else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
    });
  }
  OpenEmployeeCardPopUP(event){
    console.log("event:", event)
    this.employeeID=event['CreatedBy'];
    console.log("🚀this.employeeID:", this.employeeID)
    setTimeout(() => {
      this.appPopupService.openModal(this.openEmployeeCard, { backdrop: 'static', size: 'lg' }); //, { backdrop: 'static', size: 'fss' }
    }, 500);
  }
  openSearchRecordPopUP(){
    let formValues = this.filterFormforCMSInquiry.getRawValue();
    if(formValues.byCMSrequestID){
      this.CMSrequestID=formValues.byCMSrequestID;
    }
    else{
      setTimeout(() => {
        this.appPopupService.openModal(this.openSearchRecord, { backdrop: 'static', size: 'fss' }); //, { backdrop: 'static', size: 'fss' }
      }, 500);
    }
  }
  openREsponsiblePersonCARD(event){
    this.employeeID=event['ResponsiblePersonUserID'];
    console.log("🚀this.employeeID:", this.employeeID)
    setTimeout(() => {
      this.appPopupService.openModal(this.openEmployeeCard, { backdrop: 'static', size: 'lg' }); //, { backdrop: 'static', size: 'fss' }
    }, 500);
  }
  selectedComplaintByRequest() {
    let objParm = {
      CMSRequestID: this.CMSrequestID || null,
    };
    this.complaintDashboardService.getCMSRequest(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.complaintDetailsList = resp.PayLoad[0];
        this.patientId=this.complaintDetailsList.PatientID;
        this.getVisitID=this.complaintDetailsList.VisitId;
        this.PPuserID=this.complaintDetailsList.PatientPortalUserID;
      } 
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
    });
  }
  
  getResponsiblePerson() {

    let objParm = {
    CMSRequestID: this.CMSrequestID || null,     
    };
    this.sharedService
      .getData(API_ROUTES.GET_RESPONSIBLE_PERSON_DATA, objParm)
      .subscribe(
        (resp: any) => {
          if (resp.StatusCode == 200 && resp.PayLoad) {
            this.responsiblePersonLIST = resp.PayLoad;
            this.responsiblePersonLIST = this.responsiblePersonLIST.filter(item => item.ResponsiblePersonUserID !== null);
              this.responsiblePersonLIST = this.responsiblePersonLIST.filter((item, index) => {
                if (item.ResponsiblePersonUserID) {
                  const isFirstOccurrence = this.responsiblePersonLIST.findIndex(
                    (prevItem, prevIndex) =>
                      prevItem.ResponsiblePersonUserID === item.ResponsiblePersonUserID && prevIndex < index
                  ) === -1;             
                  return isFirstOccurrence;
                  }
              });
            console.log("🚀  this.responsiblePersonLIST:", this.responsiblePersonLIST
            );
          } else {
            this.toastr.error("Something Went Wrong");
          }
        },
        (err) => {
          console.log(err);
        }
      );
  } 
  getMeasuresTakenData() {
    let objParm = {
    CMSRequestID: this.CMSrequestID || null,     
    };
    this.sharedService
      .getData(API_ROUTES.GET_MEASURES_TAKEN_DATA, objParm)
      .subscribe(
        (resp: any) => {
          if (resp.StatusCode == 200 && resp.PayLoad) {
            this.MeasuresTakenLIST=resp.PayLoad
            this.MeasuresTakenLIST=this.MeasuresTakenLIST.filter(item => item.ActionTakenID !== null);
            this.MeasuresTakenLIST = this.MeasuresTakenLIST.filter((item, index) => {
              if (item.ActionTakenID) {
                const isFirstOccurrence = this.MeasuresTakenLIST.findIndex(
                  (prevItem, prevIndex) =>
                    prevItem.ActionTakenID === item.ActionTakenID && prevIndex < index
                ) === -1;
                return isFirstOccurrence;
              } 
            });
            console.log("🚀 this.MeasuresTakenLIST:", this.MeasuresTakenLIST);
          } else {
            this.toastr.error("Something Went Wrong");
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  
  patientRowDoubleClick(event){
    this.spinner.show(this.spinnerRefs.cmsInquiryListTable);
    this.CMSrequestID=null;
    this.filterFormforCMSInquiry.reset();
    console.log("patientRowDoubleClick ~ event:", event);
    this.getEventvalues=event;
    this.CMSrequestID=this.getEventvalues['CMSRequestID'];
    this.filterFormforCMSInquiry.patchValue({
      byCMSrequestID: this.CMSrequestID,
    });
    this.getCMSrequestInquiry();
    setTimeout(() => {
    this.getHistoryOfCMSContactBackTracking();
    this.selectedComplaintByRequest();
    this.getResponsiblePerson();
    this.getMeasuresTakenData();
    this.spinner.hide(this.spinnerRefs.cmsInquiryListTable);
    }, 300);
    this.modalService.dismissAll();
  }
  clearFields(activeFieldName) {
    switch (activeFieldName) {
      case 'cellNo': {
        this.filterFormforCMSInquiry.patchValue({
          byCMSrequestID: null,
          PIN: null,
          PatientCLI: null,
          byCMSrequestNo: null,
        });
        break;
      }
      case 'PatientCLI': {
        this.filterFormforCMSInquiry.patchValue({
          byCMSrequestID: null,
          cellNo: null,  
          PIN: null,
          byCMSrequestNo: null,
        });
        break;
      }
      case 'PIN': {
        this.filterFormforCMSInquiry.patchValue({
          byCMSrequestID: null,
          cellNo: null,  
          PatientCLI: null,
          byCMSrequestNo: null,
        });
        break;
      }
      case 'byCMSrequestID': {
        this.filterFormforCMSInquiry.patchValue({
          cellNo: null,  
          PIN: null,
          PatientCLI: null,
          byCMSrequestNo: null,
        });
        break;
      }
      case 'byCMSrequestNo': {
        this.filterFormforCMSInquiry.patchValue({
          cellNo: null,  
          PIN: null,
          PatientCLI: null,
          byCMSrequestID: null,
        });
        break;
      }
    }
  }
  screenPermissionsObj
  getPermissions() {
    let _activatedroute = this.route.routeConfig.path;
    // this.screenPermissions = (this.storageService.getLoggedInUserProfilePermissions(_activatedroute) || []); // .filter(a=>a.state == _activatedroute);
    // this.screenPermissions.forEach(a=>{
    //   this.screenPermissionsObj[a.key] = a.key;
    // })
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    console.log("User Screen Permsions___",this.screenPermissionsObj);
  }

  patchRequestNo(){
    this.getCurrentDate = Conversions.getCurrentDateObject();
    const YY = this.getCurrentDate.year % 100;
    const MM = this.getCurrentDate.month;
    const combinedNumber = parseInt(`${YY.toString().padStart(2, '0')}${MM.toString().padStart(2, '0')}`);
    const result = `CMS-C-${combinedNumber}-`;
    setTimeout(() => {
      this.filterFormforCMSInquiry.patchValue({
        byCMSrequestNo: result,
      });
    }, 10);
  }
}
