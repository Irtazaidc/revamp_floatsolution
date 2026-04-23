// @ts-nocheck
import { Component, OnInit, Renderer2 } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { SmsStatusService } from '../../service/sms-status.service';

@Component({
  standalone: false,

  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit {
  isSubmitted=false;
  loggedInUser: UserModel;

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
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private smsStatus: SmsStatusService,
  ) { 
   
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo()
    this.getMobileOperator()
  }
  loadLoggedInUserInfo() {
    // this.loggedInUser = this.auth.getUserFromLocalStorage();
    this.loggedInUser = this.auth.currentUserValue;
    
  }
 
  statusList=[]
 
  SendPatientMessage(){
    if(this.formForSendingSMS.invalid){
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const formValues = this.formForSendingSMS.getRawValue();

    const params = {
      PhoneNumber: formValues.cellNumber, 
      OperatorId: formValues.MobileOperatorID,
      Message: formValues.Message,
      Status:1,
      CreatedBy:this.loggedInUser.userid,
      MsgTypeId:1,
    };
    console.log("🚀params:", params);
    this.spinner.show(this.spinnerRefs.sendSMS)
    this.smsStatus.SendpatientMessage(params).subscribe((resp: any) => {
    this.spinner.hide(this.spinnerRefs.sendSMS)
      console.log("~ resp:", resp)
      if (resp.StatusCode == 200) {
        this.toastr.success("Message Sent");
        this.formForSendingSMS.reset();
     }
     else{
     this.toastr.warning("Something Went Wrong");
     }
   },
   (err) => {
     console.log(err);
     this.toastr.warning("Something Went Wrong");
     this.spinner.hide(this.spinnerRefs.tableList)
   }
    );
  }
  mobileOperatorList=[];
  getMobileOperator() {
    this.mobileOperatorList = [];
    this.lookupService.getMobileOperator().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.mobileOperatorList = res.PayLoad;
        // console.log(" this.mobileOperatorList:", this.mobileOperatorList)
      }
    }, (err) => {
      console.log(err);
    });
  }

}
