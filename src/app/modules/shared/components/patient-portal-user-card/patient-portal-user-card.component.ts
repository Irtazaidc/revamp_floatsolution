// @ts-nocheck
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from '../../helpers/constants';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { ComplaintDashboardService } from 'src/app/modules/complaints-feedback/services/complaint-dashboard.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { FeedbackService } from 'src/app/modules/rms/service/feedback.service';
import { AppPopupService } from '../../helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-patient-portal-user-card',
  templateUrl: './patient-portal-user-card.component.html',
  styleUrls: ['./patient-portal-user-card.component.scss']
})
export class PatientPortalUserCardComponent implements OnInit {

  @Input('PPUserId') PPUserId: number;

  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;

  constructor(
    private fb: FormBuilder,
    private lookupService: LookupService,
    private getfeedback: FeedbackService,
    private toastr: ToastrService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private testProfileService: TestProfileService,
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef,
    private complaintDashboardService: ComplaintDashboardService,
  ) { }

  ngOnInit(): void {
    this.cd.detectChanges();
    setTimeout(() => {
    this.GetPatientPortalUserDetail(this.PPUserId);
      console.log("setTimeout ~ this.PPUserId:", this.PPUserId)
    }, 500);
  }

  UserDetailsList;

  GetPatientPortalUserDetail(PPUserId){
    
    let objParm = {
      UserName:  null, 
      Email:  null,
      CellNumber: null, 
      PatientPortialUserID: PPUserId, 
    };
    console.log("UserId Card objParm______",objParm);
    this.complaintDashboardService.GetPatientPortalUserDetailByFilters(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.UserDetailsList = resp.PayLoad[0];
        // this.UserDetails.emit(this.userDetailsList);
        console.log("this.userDetailsList:", this.UserDetailsList);
      } else {
        this.toastr.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');

    });
  }


}
