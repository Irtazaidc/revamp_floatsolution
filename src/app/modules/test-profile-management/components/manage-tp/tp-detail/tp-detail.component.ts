// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { SmsStatusService } from 'src/app/modules/sms/service/sms-status.service';

@Component({
  standalone: false,

  selector: 'app-tp-detail',
  templateUrl: './tp-detail.component.html',
  styleUrls: ['./tp-detail.component.scss']
})
export class TpDetailComponent implements OnInit {

  formForTpDetail = this.formBuilder.group({
    Protocol: [''],
    instruction: [''],
    methodology: [''],
    performedMethod: [''],
    showOnlineReport: [''],
    testQuestion: [''],
    testHead: [''],
    smsAlert: [''],
    reportable: [''],
    
  });

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private smsStatus: SmsStatusService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

}
