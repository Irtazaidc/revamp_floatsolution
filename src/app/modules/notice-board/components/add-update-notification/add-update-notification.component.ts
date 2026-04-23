// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service'; 
import { DomSanitizer } from '@angular/platform-browser';
import { NoticeBoardService } from '../../services/notice-board.service';
import { ActivatedRoute, Router} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig, NgbDateStruct, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CONSTANTS } from '../../../shared/helpers/constants';
import { Conversions } from '../../../shared/helpers/conversions';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { SharedService } from 'src/app/modules/shared/services/shared.service';



@Component({
  standalone: false,

  selector: 'app-add-update-notification',
  templateUrl: './add-update-notification.component.html',
  styleUrls: ['./add-update-notification.component.scss']
})
export class AddUpdateNotificationComponent implements OnInit {
  @ViewChild('videoElement') videoElement: ElementRef;

    branchesList = [];
    departmentsList = [];
    employeesList = [];
    PriorityLevels = [];
    NotifyTypeList = [];
    NotificationsList = [];
    searchText='';

    NotificationsExistingRow = [];
    SeletedBranchesIDs = [0];
    SelectedDepartmentsIDs = [0];
    NotificationID = null;
    ld = [];

    notificationConfigForm = this.fb.group({
      NotificationCode: ['', Validators.compose([Validators.maxLength(15), Validators.required])],
      NotificationTitle: ['',Validators.compose([Validators.required])],
      NotifyType: [1],
      PriorityLevel: [2],
      NotifiedBy: [],
      startDate: [''],
      endDate: [''],
      branchIds: [ ,Validators.compose([Validators.required])],
      departmentIds: [ ,Validators.compose([Validators.required])],
      NotificationDetail: ['',Validators.compose([Validators.required])],
      PendNotification: [''],
    });
    notificationAttachments=[];
    activeVideoCameraStream: any;
    video: any;
    openCameraFromSource = '';
    videoDimensions = {
      width: 300,
      height: 300
    }
    cameraDevicesList = [{id: '', name: 'default'}];
    selectedCamera = '';
    screenPermissions = [];
    screenPermissionsObj:any = {};

    resizeFileSize = {
      thumbnail: {
        width: 90,
        height: 90
      },
      width: 500,
      height: 500
    }
    // resizePatientProfilePic = {
    //   width: 500,
    //   height: 500
    // }
    // defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
    enableRenameNotificationField = -1;

    confirmationPopoverConfig = {
      placements: ['top', 'left', 'right', 'bottom'],
      popoverTitle: 'Confirmation Alert', // 'Are you sure?',
      popoverMessage: 'Are you <b>sure</b> you want to proceed?',
      confirmText: 'Yes <i class="fa fa-check"></i>',
      cancelText: 'No <i class="fa fa-times"></i>',
      confirmClicked: false,
      cancelClicked: false,
      confirmPopoverCancel: () => {}
    }
  CanUpdate=true;
  loggedInUser: UserModel;
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  filteredSearchResults = [];
  paginatedSearchResults = [];
  refreshPagination() {
    this.collectionSize = this.NotificationsList.length;
    this.paginatedSearchResults = this.NotificationsList
      .map((item, i) => ({id: i + 1, ...item}))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
      // console.log('refresh pagination noti list: ',this.paginatedSearchResults)
  }
  constructor(
    private route : ActivatedRoute,
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private cookieService : CookieService,
    private modalService : NgbModal,
    private helper : HelperService,
    private lookupService : LookupService,
    private fb : FormBuilder,
    private sanitizer : DomSanitizer,
    private NBService : NoticeBoardService,
    private helperSrv: HelperService,
    private sharedService : SharedService,
    private auth: AuthService
  ) {
    // this.notificationConfigForm.controls['NotificationCode'].setValidators([Validators.maxLength(4)]);
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.notificationConfigForm.patchValue({
      startDate: Conversions.getCurrentDateObject(),
      endDate: Conversions.getCurrentDateObject()
    });

    this.getBranches();
    this.getDepartment();
    this.GetPriorityLevels();
    this.GetNotifyType();
    this.getEmployees();
    this.GetNotifications();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getBranches() {
    this.branchesList = [];
    // this.spinner.show('GetBranches');
    this.lookupService.GetBranches().subscribe((resp: any) => {
      // this.spinner.hide('GetBranches');
      const _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
      //this.selectedBranch = 0;
      // setTimeout(() => {
      //   //this.selectedBranch = this.loggedInUser.locationid;
      //   this.notificationConfiForm.patchValue({
      //     branchIds: [this.loggedInUser.locationid]
      //   });
      // }, 100);
    }, (err) => {
      // this.spinner.hide('GetBranches');
    })
  }

  getLoadedDocs(e) {
    this.notificationAttachments = [...this.notificationAttachments, ...e];
  }

  getDepartment() {
    this.departmentsList = []
    this.lookupService.GetDepartments().subscribe((resp: any) => {
      this.departmentsList = resp.PayLoad;
      if(!this.departmentsList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  GetPriorityLevels() {
    this.PriorityLevels = []
    this.lookupService.GetPriorityLevels().subscribe((resp: any) => {
      this.PriorityLevels = resp.PayLoad;
      if(!this.PriorityLevels.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  GetNotifyType() {
    this.NotifyTypeList = []
    this.lookupService.GetNotifyType().subscribe((resp: any) => {
      this.NotifyTypeList = resp.PayLoad;
      if(!this.NotifyTypeList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }
  
  GetNotifications() {
    this.spinner.show();
    this.NotificationsList = []
    this.NBService.GetNotifications().subscribe((resp: any) => {
      this.NotificationsList = resp.PayLoad;
      // console.warn('Notifcations list is: ',this.NotificationsList);
      this.refreshPagination();
      if(!this.NotificationsList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
    this.spinner.hide();
    
  }
  
  onSelectAllBranches() {
    this.notificationConfigForm.patchValue({
      branchIds: this.branchesList.map(a => a.LocId)
    });
  }
  onUnselectAllBranches() {
    this.notificationConfigForm.patchValue({
      branchIds: []
    });
    // this.notificationConfiForm.get('formbranchIds').patchValue([]);
  }
  
  selectAllDepartments(){
    this.notificationConfigForm.patchValue({
      departmentIds:this.departmentsList.map(a =>a.DepartmentId)
    })
  }
  unSelectAllDepartments() {
    this.notificationConfigForm.patchValue({
      departmentIds: []
    });
    // this.notificationConfiForm.get('formbranchIds').patchValue([]);
  }


getEmployees() {
  this.employeesList = [];
  const params = {};
  this.spinner.show();
  this.sharedService.getEmployees(params).subscribe( (res: any) => {
    this.spinner.hide();
    // console.warn('Employees arew: ',res)
    if(res && res.StatusCode == 200) {
      this.employeesList = JSON.parse(res.PayLoadStr);
      this.employeesList = this.employeesList.map(a => ({EmpId:a.EmpId, EmpNo:a.EmpNo,EmployeeName:a.EmployeeName,UserId:a.UserId, FullName: '[IDC-'+a.EmpNo.padStart(4, '0')+'] '+a.EmployeeName }));
    }
  }, (err)=>{
    this.spinner.hide();
  })
}

addUpdateNotification(){
  this.spinner.show();
  const formValues = this.notificationConfigForm.getRawValue();
  this.notificationConfigForm.markAllAsTouched();
  if((!formValues.branchIds.length) && (!formValues.departmentIds.length)){
    this.toastr.error('Please select atleast one branch and department!');
    this.spinner.hide();
    return 0;
  }else if(!formValues.branchIds.length){
    this.toastr.error('Please select atleast one branch!');
    this.spinner.hide();
    return 0;
  }else if(!formValues.departmentIds.length){
    this.toastr.error('Please select atleast one department!');
    this.spinner.hide();
  }
  
  this.ld = this.notificationAttachments;

  const notificatioDoc = this.ld.map((val) => { return {
      "GDocumentID" : null,
      "GDocTitle" : val.fileName,
      "Remarks" : null,
      "RefId" : null,
      "GDocTypeId" : null,
      "GDocumentPic" : val.data.toString().replace(val.data.substring(0,val.data.indexOf(",")+1) ,''),
      "GDocBase64" : val.data,
      "GDocBase64Thumbnail" : val.thumbnail,
      "GDocType" : val.fileType
    }
  })
 
    const formData = {
      NotificationID: this.NotificationID,
      NoticeCode: formValues.NotificationCode,
      NoticeTitle: formValues.NotificationTitle,
      NoticeType: formValues.NotifyType,
      NoticePriorityLevel: formValues.PriorityLevel,
      NotifiedBy: formValues.NotifiedBy,
      locationIds: formValues.branchIds.join(','),
      departmentIds: formValues.departmentIds.join(','),
      NoticeDescription: formValues.NotificationDetail,
      PendNotice: formValues.PendNotification==true?1:0,
      NoticeStartDate: formValues.startDate ? Conversions.formatDateObject(formValues.startDate) : '',
      NoticeEndDate: formValues.endDate ? Conversions.formatDateObject(formValues.endDate, 'end') : '',
      tblGeneralDocument: notificatioDoc,
      CreatedBy:this.loggedInUser.userid || -99,
    };

    // console.log('Attachemnt data is__________',this.ld);
    console.log('form data obj __________',formData); 
      this.NBService.addUpdateNotification(formData).subscribe((data: any) => {
        this.spinner.hide();
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.notificationAttachments = [];
            this.GetNotifications();
            this.toastr.success(data.Message);
          } else {
            this.toastr.error(data.Message)
            this.spinner.hide();
          }
        }
      })
  // }
  // else {
  //   alert("Not Validated")
  // }

  }
  rowIndex = null;;
  getNotificationDetailByID(NoticeId,i){
    this.rowIndex = i;
    // this.NotificationID = NoticeId;
    this.NotificationsExistingRow = [];
    this.SeletedBranchesIDs = [0];
    this.SelectedDepartmentsIDs = [0];
    const params = {
      NotificationID:NoticeId
    };
    // this.spinner.show();
    this.NBService.getNotificationDetailByID(params).subscribe( (res: any) => {
      if(res && res.StatusCode == 200) {
        this.NotificationsExistingRow = res.PayLoadDS.Table;
        this.CanUpdate = Conversions.findValidityDate(this.NotificationsExistingRow[0]["NoticeEndDate"]);
        if(this.CanUpdate){
          this.NotificationID = NoticeId;
        }

        this.SeletedBranchesIDs = res.PayLoadDS.Table1 ;
        this.SelectedDepartmentsIDs = res.PayLoadDS.Table2;
        if(res.PayLoadDS.Table3){
          this.ld = this.helperSrv.addPrefixToDocs(res.PayLoadDS.Table3);
          console.log("PayloadDS NB",res.PayLoadDS.Table3);
        }
        
        // console.log("returnDocs are:",res.PayLoadDS.Table3)
        // console.log("returnDocConver:",this.helperSrv.addPrefixToDocs(res.PayLoadDS.Table3));
        this.notificationConfigForm.patchValue( {
          branchIds: this.SeletedBranchesIDs.map((val:any) =>  val.LocId),
          departmentIds: this.SelectedDepartmentsIDs.map((val:any) =>  val.DeptId),
          NotificationCode: this.NotificationsExistingRow[0]["NoticeCode"],
          NotificationTitle: this.NotificationsExistingRow[0]["NoticeTitle"],
          NotifyType: this.NotificationsExistingRow[0]["NoticeType"],
          PriorityLevel: this.NotificationsExistingRow[0]["NoticePriorityLevel"],
          NotifiedBy: this.NotificationsExistingRow[0]["NotifiedBy"], 
          //this.NotificationsExistingRow.map((val:any) =>  val.NotifiedBy),
          startDate: Conversions.getDateObjectByGivenDate(this.NotificationsExistingRow[0]["NoticeStartDate"]),
          endDate: Conversions.getDateObjectByGivenDate(this.NotificationsExistingRow[0]["NoticeEndDate"]),
          NotificationDetail: this.NotificationsExistingRow[0]["NoticeDescription"],
          PendNotification: this.NotificationsExistingRow[0]["PendNotice"],
        });
      }
      this.spinner.hide();
    }, (err)=>{
      this.spinner.hide();
    })
  }

}
