// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { SmsStatusService } from 'src/app/modules/sms/service/sms-status.service';

@Component({
  standalone: false,

  selector: 'app-manage-test-profile',
  templateUrl: './manage-test-profile.component.html',
  styleUrls: ['./manage-test-profile.component.scss']
})
export class ManageTestProfileComponent implements OnInit {

  spinnerRefs = {
    tableList: 'tableList',
    sendSMS: 'sendSMS'
  }

  TestProfileList

  loggedInUser: UserModel;

  selectedTPId:any=null;
  searchText = '';

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
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getTableRowData(event, index){

    this.spinner.show(this.spinnerRefs.sendSMS)
    console.log("getTableRowData ~ event:", event)
    this.selectedTPId = index
    // setTimeout(() => {
    //   this.formForSendingSMS.patchValue({
    //     cellNumber: this.getTableData['CellNo'],
    //     Message: this.getTableData['Message'], 
    //   });
    //   this.spinner.hide(this.spinnerRefs.sendSMS)
    // }, 500);
  }
}
