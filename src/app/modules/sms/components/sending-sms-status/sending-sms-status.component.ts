// @ts-nocheck
import { Component, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SmsStatusService } from '../../service/sms-status.service';

@Component({
  standalone: false,

  selector: 'app-sending-sms-status',
  templateUrl: './sending-sms-status.component.html',
  styleUrls: ['./sending-sms-status.component.scss']
})
export class SendingSmsStatusComponent implements OnInit {
  @ViewChild('showPatientPortalUserDetails') showPatientPortalUserDetails;
  @Input() isCancellationScreen = false;
  ModalPopupRef: NgbModalRef;
  smsInquiryReportList=[];
  smsHistoryList=[];
  isSubmitted=false;
  loggedInUser: UserModel;
  CellNo:any=null;

  formForSMSstatus= this.formBuilder.group({
    cellNumber: ['',Validators.required], 
    dateFrom: ['',Validators.required], 
    dateTo: ['',Validators.required], 
  });

  formForSendingSMS= this.formBuilder.group({
    cellNumber: ['',Validators.required],  
    MobileOperatorID: ['',Validators.required], 
    Message: ['',Validators.required], 
  });

  spinnerRefs = {
    tableList: 'tableList',
    sendSMS: 'sendSMS'
  }
  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private smsStatus: SmsStatusService,
    private appPopupService: AppPopupService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo()
    this.getMobileOperator()
    setTimeout(() => {
      this.formForSMSstatus.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 300);

  }
  loadLoggedInUserInfo() {
    // this.loggedInUser = this.auth.getUserFromLocalStorage();
    this.loggedInUser = this.auth.currentUserValue;
    
  }
  mobileOperatorList=[];
  getMobileOperator() {
    this.mobileOperatorList = [];
    this.lookupService.getMobileOperator().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.mobileOperatorList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  statusList=[]
  getSendingSMSstatus(){
    if(this.isCancellationScreen){
      this.getCancellationSMSStatus();
      return
    }

    this.smsHistoryList=[];

    if(this.formForSMSstatus.invalid){
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const formValues = this.formForSMSstatus.getRawValue();
    formValues.dateFrom=Conversions.formatDateObject(formValues.dateFrom);
    formValues.dateTo=Conversions.formatDateObject(formValues.dateTo);
    const params = {
      CellNo: formValues.cellNumber, 
      DateFrom: formValues.dateFrom ,
      DateTo: formValues.dateTo,
    };
    this.spinner.show(this.spinnerRefs.tableList)
    this.smsStatus.GetSendingSMSstatus(params).subscribe((resp: any) => {
    this.spinner.hide(this.spinnerRefs.tableList)
        if (resp.StatusCode == 200 ) {
          if(resp.PayLoad.length){
            this.smsHistoryList = resp.PayLoad;

            // this.smsHistoryList = this.smsHistoryList.map(item => {
            //   let parsedResponse = null;
            //   try {
            //     const parsedRemarks = JSON.parse(item.Remarks);
            //     parsedResponse = parsedRemarks?.corpsms?.response || null;
            //   } catch (error) {
            //     console.error("Invalid JSON format in Remarks:", item.Remarks, error);
            //   }
            //   return {
            //     ...item,
            //     ParsedRemarks: parsedResponse // Add extracted response
            //   };
            // });
          }
          else{ this.toastr.info("No record found");}

          // this.smsHistoryList = data.map(item => {
          //     let parsedRemarks;
          //     try {
          //         parsedRemarks = JSON.parse(item.Remarks);  
          //     } catch (e) {
          //         // console.error(`Error parsing Remarks for item with VisitId: ${item.VisitId}`, e);
          //         parsedRemarks = item.Remarks;  
          //     }
          //     return {
          //         ...item,
          //         Remarks: parsedRemarks  
          //     };
          // });
          // console.log(this.smsHistoryList);

        }
        else if (resp.StatusCode == 500){
          this.toastr.warning("Error loading data");
        }
        else{
          this.toastr.warning("Something went wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.tableList)
      }
    );

  }

  getCancellationSMSStatus(){
    this.smsHistoryList=[];

    if(this.formForSMSstatus.invalid){
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const formValues = this.formForSMSstatus.getRawValue();
    formValues.dateFrom=Conversions.formatDateObject(formValues.dateFrom);
    formValues.dateTo=Conversions.formatDateObject(formValues.dateTo);
    const params = {
      CellNo: formValues.cellNumber, 
      DateFrom: formValues.dateFrom ,
      DateTo: formValues.dateTo,
    };
    this.spinner.show(this.spinnerRefs.tableList)
    this.smsStatus.GetCancellationSMSstatus(params).subscribe((resp: any) => {
    this.spinner.hide(this.spinnerRefs.tableList)
        if (resp.StatusCode == 200 ) {
          if(resp.PayLoad.length){
            this.smsHistoryList = resp.PayLoad;
          }
          else{ this.toastr.info("No record found");}
        }
        else if (resp.StatusCode == 500){
          this.toastr.warning("Error loading data");
        }
        else{
          this.toastr.warning("Something went wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.tableList)
      }
    );
  }
  operatorID=false;
  resendSMS(){
    if(this.formForSendingSMS.invalid){
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.operatorID = true;
      return;
    }
    const formValues = this.formForSendingSMS.getRawValue();

    const params = {
      PhoneNumber: formValues.cellNumber, 
      OperatorId: formValues.MobileOperatorID,
      Message: formValues.Message,
      Status:1,
      CreatedBy:this.loggedInUser.userid,
      MsgTypeId:this.MsgTypeID,
    };
    console.log("resendSMS ~ params:", params)
    // return;
    this.spinner.show(this.spinnerRefs.sendSMS)
    this.smsStatus.SendpatientMessage(params).subscribe((resp: any) => {
    this.spinner.hide(this.spinnerRefs.sendSMS)
        if (resp.StatusCode == 200) {
           this.toastr.success("Message Sent Successfully");
           this.formForSendingSMS.reset();
        }
        else{
          this.toastr.error("Failed To Sent");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.warning("Something Went Wrong");
        this.spinner.hide(this.spinnerRefs.tableList)
      }
    );
  }
  truncate(source, size) {
    return source && source.length > size ? source.slice(0, size - 1) + "." : source;
  }
  MachineModalityID

  getTableData:any;
  MsgTypeID:any;
  getTableRowData(event, index){
    this.spinner.show(this.spinnerRefs.sendSMS)
    console.log("getTableRowData ~ event:", event)
    this.getTableData=event;
    this.CellNo=index;//this.getTableData['CellNo'];
    this.MsgTypeID=this.getTableData['MsgTypeId'];
    setTimeout(() => {
      this.formForSendingSMS.patchValue({
        cellNumber: this.getTableData['CellNo'],
        Message: this.getTableData['Message'], 
      });
      this.spinner.hide(this.spinnerRefs.sendSMS)
    }, 500);
  }
  openPatientPortalUserDetails() {
    setTimeout(() => {
    this.ModalPopupRef = this.appPopupService.openModal(this.showPatientPortalUserDetails); 
    }, 500);
  }
  getEventValues
  getUserDetails(event){
  // this.PPuserID=null;
  // this.patientId=null;
  // this.getVisitID=null;
  console.log("getUserDetails ~ event:", event)
  this.getEventValues=event;
  // this.cd.detectChanges();
  
  }
}