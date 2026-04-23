// @ts-nocheck
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { ComplaintDashboardService } from "../../services/complaint-dashboard.service";
import { AuthService, UserModel } from "src/app/modules/auth";
import { Observable } from "rxjs";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { NgbCalendar, NgbDate, NgbDateStruct, NgbModal, NgbTimeStruct, NgbTimepicker } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from "@angular/router";

@Component({
  standalone: false,

  selector: "app-cms-contactback-tracking",
  templateUrl: "./cms-contactback-tracking.component.html",
  styleUrls: ["./cms-contactback-tracking.component.scss"],
})
export class CmsContactbackTrackingComponent implements OnInit {

  @Output() formValuesChange = new EventEmitter<any>();
  @Input() paramInputSelector = {
    CMSRequestID: null,
    CMSstatusID: null,
  };

  InsertCMSContactBackTrackingForm: FormGroup;
  GetPatientPortalUserDetailByFilters: FormGroup;
  user$: Observable<UserModel>;
  loggedInUser: UserModel;
  emittedValues;
  CMSstatusID;
  CMSRequestID;
  isSubmited = false;
  insertContactBackStatusList = [];
  contactBackHistory = [];
  cmsInquiryList = [];
  StatusList = [];
  maxDate;
  minTime;

  spinnerRefs = {
    ContactBackStatusFormContainer: "ContactBackStatusFormContainer",
    hcRequesDetail: "hcRequesDetail",
    hcComplaintRequestContainer: "hcComplaintRequestContainer",
  };

  constructor(
    private complaintDashboardService: ComplaintDashboardService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
  ) {

    this.InsertCMSContactBackTrackingForm = this.formBuilder.group({
      contactBackStatus: [, Validators.required],
      ContactBackDate: ['', Validators.required],
      ContactBackTime: ['', Validators.required],
      ContactBackFindings: ['', Validators.required],
      // ContactBackRemarks: [''],
    });

    this.maxDate = Conversions.getCurrentDateObject();

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  ngOnInit(): void {
    // console.log(this.paramInputSelector);
    this.loadLoggedInUserInfo();
    this.getStatusList();
    setTimeout(() => {
      this.InsertCMSContactBackTrackingForm.patchValue({
        ContactBackDate: Conversions.getCurrentDateObject(),
        ContactBackTime: Conversions.getCurrentTime(),
      });
      if(this.route.routeConfig.path == 'hc-requests'){
       this.InsertCMSContactBackTrackingForm.get('ContactBackDate').disable(); 
       this.InsertCMSContactBackTrackingForm.get('ContactBackTime').disable();
      }
    }, 500);
    console.log("paramInputSelector_____________", this.paramInputSelector);
    this.CMSRequestID = this.paramInputSelector.CMSRequestID || this.paramInputSelector;
    this.CMSstatusID = this.paramInputSelector.CMSstatusID;
    if (this.CMSstatusID == 4) {
      this.InsertCMSContactBackTrackingForm.get('contactBackStatus').disable();
      this.InsertCMSContactBackTrackingForm.get('ContactBackDate').disable();
      this.InsertCMSContactBackTrackingForm.get('ContactBackTime').disable();
      this.InsertCMSContactBackTrackingForm.get('ContactBackFindings').disable();
    }
    else {
      this.InsertCMSContactBackTrackingForm.get('contactBackStatus').enable();
      this.InsertCMSContactBackTrackingForm.get('ContactBackDate').enable();
      this.InsertCMSContactBackTrackingForm.get('ContactBackTime').enable();
      this.InsertCMSContactBackTrackingForm.get('ContactBackFindings').enable();
    }
    setTimeout(() => {
      this.getHistoryOfCMSContactBackTracking();
    }, 500);

    this.hourHandlerChange();
  
  }


  InsertCMSContactBackTracking() {
    this.isSubmited = true;
    if (this.InsertCMSContactBackTrackingForm.invalid) {
      this.toastr.warning("Please Fill the required Fields");
      return;
    }
    const formValues = this.InsertCMSContactBackTrackingForm.getRawValue();
    console.log("InsertCMSContactBackTracking ~ formValues:", formValues)
    const contactBackDateTime = Conversions.mergeDateTime(formValues.ContactBackDate, formValues.ContactBackTime);
    console.log("mergeDateAndTime", contactBackDateTime);

    const objParm = {
      ContactBackStatusID: formValues.contactBackStatus || null,
      ContactBackDateTime: contactBackDateTime,
      CMSRequestID: this.CMSRequestID,
      CMSStatusID: this.CMSstatusID || 1,
      CreatedBy: this.loggedInUser.userid,
      ContactBackFindings: formValues.ContactBackFindings || null,
    };
    console.log("Insert objParm:", objParm)
    this.spinner.show(this.spinnerRefs.ContactBackStatusFormContainer);
    this.complaintDashboardService.InsertCMSContactBackTracking(objParm).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.ContactBackStatusFormContainer);
      if (resp.StatusCode == 200 && resp.PayLoad[0].RESULT === 1) {
        this.toastr.success("Callback Tracking Updated Successfully");
        this.isSubmited = false;
        // this.modalService.dismissAll();
        this.InsertCMSContactBackTrackingForm.patchValue({
          contactBackStatus: '',
          ContactBackFindings: ''
        });
      } else {
        this.toastr.error("Something Went Wrong");
      }
    },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.ContactBackStatusFormContainer);
        this.toastr.error("Something Went Wrong");
      }
    );
  }
  truncate(source, size) {
    return source && source.length > size
      ? source.slice(0, size - 1) + "…"
      : source;
  }
  getHistoryOfCMSContactBackTracking() {    
    const objParm = {
      CMSRequestID: this.CMSRequestID,
    };
    this.complaintDashboardService
      .getHistoryOfCMSContactBack(objParm)
      .subscribe(
        (resp: any) => {
          if (resp.StatusCode == 200) {
            this.contactBackHistory = resp.PayLoad;
          } else {
            this.toastr.error("Something Went Wrong");
          }
        },
        (err) => {
          console.log(err);
          this.toastr.error("Something Went Wrong");
        }
      );
  }

  getStatusList() {
    this.StatusList = [];
    this.lookupService.getCMSContactBackStatus().subscribe(
      (resp: any) => {
        // console.log('Status List is: ', resp);
        this.StatusList = resp.PayLoad;
        if (!this.StatusList.length) {
          console.log("No Recored found");
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getCMSrequestInquiry() {  
    this.cmsInquiryList = [];
    const objParm = {
      CMSRequestID: this.CMSRequestID,
    };
    this.complaintDashboardService.getCMSinquiryDetails(objParm).subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.cmsInquiryList = resp.PayLoad;
        } else {
          this.toastr.info("No Record Found");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Something Went Wrong");
      }
    );
  }
  emitFormValues(event) {
    this.emittedValues = event;
    if (this.InsertCMSContactBackTrackingForm.valid) {
      this.formValuesChange.emit(this.emittedValues);
    }
  }

  navigateToCmsInquiryPage(): void {
    // this.modalService.dismissAll();
    // this.router.navigate(['/cms-request/cms-inquiry'], { queryParams: { ID: btoa(this.getCMSrequestID) } });
    const cmsRequestId = this.CMSRequestID; // Assuming this.getCMSrequestID() returns the actual CMS request ID
    const encodedRequestId = btoa(cmsRequestId);
    window.open(`#/cms/cms-inquiry?CMSrequestID=${encodedRequestId}`, "_blank");
    // window.open('#/cms-request/cms-inquiry?' + 'CMSrequestID=' + btoa((this.getCMSrequestID)), '_blank');
  }

  // hourHandlerChange() {
  //   const hourElement: any = document.querySelector('[formcontrolname="ContactBackTime"] .ngb-tp-hour input');
  //   const minuteElement: any = document.querySelector('[formcontrolname="ContactBackTime"] .ngb-tp-minute input');
  //   hourElement.removeAllListeners();
  //   hourElement.addEventListener('keyup', _ => {
  //     if (((hourElement.value )).toString().length == 2) {
  //       minuteElement.focus();
  //     }
  //   });
  // }
  handleHourKeyup: () => void;
  handleMinuteKeyup: () => void;
  hourHandlerChange() {
    const hourElement: HTMLInputElement = document.querySelector(
      '[formcontrolname="ContactBackTime"] .ngb-tp-hour input'
    ) as HTMLInputElement;

    const minuteElement: HTMLInputElement = document.querySelector(
      '[formcontrolname="ContactBackTime"] .ngb-tp-minute input'
    ) as HTMLInputElement;

    hourElement.removeEventListener('keyup', this.handleHourKeyup);
    this.handleHourKeyup = () => {
      if (((hourElement.value)).toString().length === 2) {
        minuteElement.focus();
      }
    };
    hourElement.addEventListener('keyup', this.handleHourKeyup);

    minuteElement.removeEventListener('keyup', this.handleMinuteKeyup);
    this.handleMinuteKeyup = () => {
      if (minuteElement.value.length === 0) {
        hourElement.focus();
      }
    };
    minuteElement.addEventListener('keyup', this.handleMinuteKeyup);
  }

}




