// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-recommend-reject-request',
  templateUrl: './recommend-reject-request.component.html',
  styleUrls: ['./recommend-reject-request.component.scss']
})
export class RecommendRejectRequestComponent implements OnInit {
  loggedInUser: UserModel;
  VisitID = null;
  TPID = null;
  PatientId = null;
  resetRequests = [];
  disabledButtonReject = false;
  disabledButtonRecommend = false;
  isSpinnerReject = true;
  isSpinnerRecommend = true;
  RejectRecommendRequestRemarks = "";
  characterCount = 0;
  maxCharacterCount = 15;
  rowIndex = null;
  ResetRequestRemarks = null;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessageReject: 'Are you <b>sure</b> you want to Reject?',
    popoverMessageRecommend: 'Are you <b>sure</b> you want to Recommend?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  noDataMessage = 'Please search reset request';
  spinnerRefs = {
    listSection: 'listSection',
    requestProcessSection: "requestProcessSection",
  }
  public FormParams = {
    dateFrom: [null, ''],
    dateTo: [null, ''],
  };
  formObj: FormGroup = this.formBuilder.group(this.FormParams)
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService,
    private auth: AuthService

  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.noDataMessage = 'Please search reset request';
    this.formObj.patchValue({
      dateFrom: Conversions.getCurrentDateObject(),
      dateTo: Conversions.getCurrentDateObject()
    });
    this.getVisitTestReset();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  validateDateDifference(index) {
    const formValues = this.formObj.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;

    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      if (index === 1) {
        this.formObj.patchValue({
          dateTo: ""
        });
      }
      else {
        this.formObj.patchValue({
          dateFrom: ""
        });
      }
    }
  }


  updateCharacterCount() {
    this.characterCount = this.RejectRecommendRequestRemarks.length;
  }

  getVisitTestReset() {
    this.resetRequests = [];
    const formValues = this.formObj.getRawValue();
    formValues.dateFrom = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    formValues.dateTo = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo, 'end') : null;
    const params = {
      DateFrom: formValues.dateFrom,
      DateTo: formValues.dateTo,
      StatusID: 13
    };
    this.spinner.show(this.spinnerRefs.listSection);
    this.sharedService.getData(API_ROUTES.GET_VISIT_TEST_RESET, params).subscribe((res: any) => {
      this.noDataMessage = 'No Reset Request Found';
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        this.resetRequests = res.PayLoad || [];
        console.log("this.resetRequests: ",this.resetRequests)
        if (this.resetRequests.length) {
          setTimeout(() => {
            this.getRowData(this.resetRequests[0], 0);
          }, 200);
        }
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log(err);
    })

  }
  truncate(source, size) {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }
  // truncate(source, size) { 
  //   if(source){
  //     return source.length > size ? source.slice(0, size - 1) + " <strong class='text-danger font-weight-boldest' style='font-size: 14px !important;'>…</strong>" : source;
  //   } else{
  //     return '';
  //   }
  // }

  RequestedBy:any= null;
  RequestedOn:any= null;
  getRowData(selectedRow, i) {
    this.rowIndex = i;
    this.VisitID = selectedRow.VisitId;
    this.TPID = selectedRow.TPId;
    this.ResetRequestRemarks = selectedRow.ReqRemarks;
    this.RequestedBy = selectedRow.RequestedBy;
    this.RequestedOn = selectedRow.RequestedOn;
  }
  clickSubmitBtn=false;
  updateVisitTestResetStatus(StatusID) {
    // recRejValue: 1: for recommend, 2: Reject 
    if (this.RejectRecommendRequestRemarks.length < 15) {
      this.clickSubmitBtn=true;
      this.toastr.warning("Please Provide atleast 15 characters in remarks", "Warning");
      return;
    } else {
      this.clickSubmitBtn=false;
      const TPIDs = this.TPID
      const formData = {
        VisitID: this.VisitID,
        TPIDs: TPIDs,
        Remarks: this.RejectRecommendRequestRemarks,
        StatusID: StatusID,//reset request 9 for reject as set to 9 final status, 14 for resetrequestrecommend status
        CreatedBy: this.loggedInUser.userid || -99,
        LocID: this.loggedInUser.locationid
      };
      this.disabledButtonReject = true;
      this.disabledButtonRecommend = true;
      if (StatusID == 14) {
        this.isSpinnerRecommend = false;
      } else {
        this.isSpinnerReject = false;
      }
      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_VISIT_TEST_RESET_STATUS, formData).subscribe((data: any) => {
        // if (JSON.parse(data.PayLoadStr).length) {
        // if (data.StatusCode == 200) {
        this.characterCount = 0;
        this.RejectRecommendRequestRemarks = "";
        this.getVisitTestReset();
        this.disabledButtonReject = false;
        this.disabledButtonRecommend = false;
        if (StatusID == 14) {
          this.isSpinnerRecommend = true;
          this.toastr.success("Reset Request has been recommended");
        } else {
          this.isSpinnerReject = true;
          this.toastr.success("Reset Request has been rejected");
        }

        // } else {
        //   this.toastr.error(data.Message)
        //   this.disabledButton = false;
        //   this.isSpinner = true;
        // }
        // }
      }, (err) => {
        console.log(err);
        this.disabledButtonReject = false;
        this.disabledButtonRecommend = false;
        if (StatusID == 14) {
          this.isSpinnerRecommend = true;
        } else {
          this.isSpinnerReject = true;
        }
        this.toastr.error('Connection error');
      })
    }

  }


}
