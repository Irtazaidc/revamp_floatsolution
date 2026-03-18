// @ts-nocheck
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { SmsStatusService } from 'src/app/modules/sms/service/sms-status.service';

@Component({
  standalone: false,

  selector: 'app-tp-general',
  templateUrl: './tp-general.component.html',
  styleUrls: ['./tp-general.component.scss']
})
export class TpGeneralComponent implements OnInit {

  formForTpGen = this.formBuilder.group({
    reportTitle: [''],
    testType: [''],
    testName: [''],
    testCode: [''],
    reportFooter: [''],
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

  ngOnInit(): void {}

}
