// @ts-nocheck
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { ComplaintDashboardService } from 'src/app/modules/complaints-feedback/services/complaint-dashboard.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { FeedbackService } from '../../service/feedback.service';

@Component({
  standalone: false,

  selector: 'app-search-user-detail',
  templateUrl: './search-user-detail.component.html',
  styleUrls: ['./search-user-detail.component.scss']
})
export class SearchUserDetailComponent implements OnInit {

  GetPatientPortalUserDetailByFilters: FormGroup;
  isSubmitted=false;
  @Output() UserDetails = new EventEmitter<any>();

  spinnerRefs = {
    userDetailsTable: 'userDetailsTable',
  }
  constructor(
    private fb: FormBuilder,
    private lookupService: LookupService,
    private getfeedback: FeedbackService,
    private toastr: ToastrService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private testProfileService: TestProfileService,
    private appPopupService: AppPopupService,
    private complaintDashboardService: ComplaintDashboardService,
  ) 
  {
  this.GetPatientPortalUserDetailByFilters = this.fb.group({
    UserName: ['', Validators.required],
    Email: ['', [Validators.email,Validators.required]],
    CellNumber: ['', Validators.required,]
  });
}

  ngOnInit(): void {
  }
  userDetailsList=[];
  PPuserID:number;
  GetPatientPortalUserDetail(){
    this.isSubmitted=true;
    const formValues= this.GetPatientPortalUserDetailByFilters.getRawValue();
    const objParm = {
      UserName: formValues.UserName || null, 
      Email:  formValues.Email || null, 
      CellNumber: formValues.CellNumber || null, 
      PatientPortialUserID:null,
    };
    this.spinner.show(this.spinnerRefs.userDetailsTable)
    this.complaintDashboardService.GetPatientPortalUserDetailByFilters(objParm).subscribe((resp: any) => {
    this.spinner.hide(this.spinnerRefs.userDetailsTable)
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.userDetailsList = resp.PayLoad;
      } else {
        this.toastr.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
    });
  }

  customValidation() {
    const userName =     this.GetPatientPortalUserDetailByFilters.controls.UserName.value;
    const email =     this.GetPatientPortalUserDetailByFilters.controls.Email.value;
    const cellNumber =     this.GetPatientPortalUserDetailByFilters.controls.CellNumber.value;

    if (userName || cellNumber) {
      this.GetPatientPortalUserDetailByFilters.controls.UserName.clearValidators();
      this.GetPatientPortalUserDetailByFilters.controls.Email.clearValidators();
      this.GetPatientPortalUserDetailByFilters.controls.CellNumber.clearValidators();
    } else if(email){
      this.GetPatientPortalUserDetailByFilters.controls.UserName.clearValidators();
      this.GetPatientPortalUserDetailByFilters.controls.CellNumber.clearValidators();
    }
    else {
      this.GetPatientPortalUserDetailByFilters.controls.UserName.setValidators(Validators.required);
      this.GetPatientPortalUserDetailByFilters.controls.Email.setValidators([Validators.email,Validators.required]);
      this.GetPatientPortalUserDetailByFilters.controls.CellNumber.setValidators(Validators.required);
    }
  
    this.GetPatientPortalUserDetailByFilters.controls.UserName.updateValueAndValidity();
    this.GetPatientPortalUserDetailByFilters.controls.Email.updateValueAndValidity();
    this.GetPatientPortalUserDetailByFilters.controls.CellNumber.updateValueAndValidity();
  }

  patientRowDoubleClick(event){
    this.UserDetails.emit(event);
  }
}
