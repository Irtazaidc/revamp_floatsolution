// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { FeedbackService } from '../../service/feedback.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { environment } from '../../../../../environments/environment';


@Component({
  standalone: false,

  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  filterForm: FormGroup;
  defaultDateFrom: Date;
  defaultDateTo: Date;
  feedbackData: any[];
  selectedFeedback: any;
  selectedComplaint: any;
  feedBackType = null;
  rmsFeedbackList: any = [];
  rmsFeedback: any = [];
  rmsComplaint: any = [];
  FBId:any
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  loggedInUser: UserModel;
  happyImg=CONSTANTS.USER_FEEDBACK_EMOJI.HAPPY;
  veryHappyImg=CONSTANTS.USER_FEEDBACK_EMOJI.VERRYHAPPY;
  SadImg=CONSTANTS.USER_FEEDBACK_EMOJI.SAD;
  verySadImg=CONSTANTS.USER_FEEDBACK_EMOJI.VERYSAD;
  normalImg=CONSTANTS.USER_FEEDBACK_EMOJI.NORMAL;

  spinnerRefs = {
    FeedBackContent: 'FeedBackContent',
    FeedbackDetails: 'FeedbackDetails',
  }
  // buttonControlsPermissions = {
  //   dateFrom: false,
  //   dateTo: false,
  //   email:false,
  // }

  constructor(
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private getfeedback: FeedbackService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.filterForm = this.formBuilder.group({
      dateFrom: [''], 
      dateTo:[''],
      pin: [''],
      contact: [''],
      email: ['']
    });
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject()
      });
    }, 100);
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  selectFeedback(feedback: any) {
    this.spinner.show(this.spinnerRefs.FeedbackDetails)
    this.selectedFeedback = feedback;
    this.FBId=this.selectedFeedback['FBId']
    setTimeout(() => {
    this.spinner.hide(this.spinnerRefs.FeedbackDetails)
    }, 200);
  }
  selectComplaint(complaint: any) {
    this.spinner.show(this.spinnerRefs.FeedbackDetails)
    this.selectedComplaint = complaint;
    this.FBId=this.selectedComplaint['FBId'];
    setTimeout(() => {
      this.spinner.hide(this.spinnerRefs.FeedbackDetails)
      }, 200);
  }

  getPatientFeedbackData() {

    let formValues = this.filterForm.getRawValue();
    formValues.dateFrom = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    formValues.dateTo = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;

    let objParm = {
      DateFrom: formValues.dateFrom,    
      DateTo: formValues.dateTo,      
      AccountNo: formValues.pin || null,
      Cell: formValues.contact || null,
      EMail: formValues.email || null,
    };
    this.spinner.show(this.spinnerRefs.FeedBackContent)
    this.getfeedback.getPatientFeedback(objParm).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.FeedBackContent)
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.rmsFeedbackList = resp.PayLoad;
        this.rmsFeedback = this.rmsFeedbackList.filter(item => item.FeedbackComplaint === 1);
        this.rmsComplaint = this.rmsFeedbackList.filter(item => item.FeedbackComplaint !== 1);
      }
      else{
        this.toastr.warning('No Record Found');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.FeedBackContent)
      console.log(err)
    });
  }

  complaintSourcefromFMS:any;
  navigateToComplaintRegPage(event): void {
    this.complaintSourcefromFMS = event;
    const encodedItem = encodeURIComponent(JSON.stringify(this.complaintSourcefromFMS));
    const safeEncodedItem = btoa(encodedItem).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    window.open(`#/rms/cc-request-handling?item=${safeEncodedItem}`, "_blank");
  }

  // navigateToInformationDesk(visit){
  //    const PIN = visit; 
  //   const encodedPIN = btoa(PIN);
  //   window.open(
  //     `#/information-desk/info-desk?item=${encodedPIN}`,
  //     "_blank"
  //   );
  // }

  openInvoice(visit) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ visitID: visit, loginName: this.loggedInUser.username, appName: 'WebMedicubes:search_pat', copyType: (0), timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
  }
}
