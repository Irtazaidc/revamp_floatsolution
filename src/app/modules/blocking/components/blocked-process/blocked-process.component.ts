// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { SmsStatusService } from 'src/app/modules/sms/service/sms-status.service';

@Component({
  standalone: false,

  selector: 'app-blocked-process',
  templateUrl: './blocked-process.component.html',
  styleUrls: ['./blocked-process.component.scss']
})
export class BlockedProcessComponent implements OnInit {

  blockingList
  CellNo


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
  }

  getTableRowData(item){

  }
}
