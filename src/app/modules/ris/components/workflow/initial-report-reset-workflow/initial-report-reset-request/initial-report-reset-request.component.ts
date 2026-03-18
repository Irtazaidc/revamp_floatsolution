// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Component({
  standalone: false,

  selector: 'app-initial-report-reset-request',
  templateUrl: './initial-report-reset-request.component.html',
  styleUrls: ['./initial-report-reset-request.component.scss']
})
export class InitialReportResetRequestComponent implements OnInit {

  @Input('buttonControls') buttonControls = [''];


  loggedInUser: UserModel;

  patientSearchParams = {
    PatientID: '',
    BookingID: '',
    PVNo: '',
    FirstName: '',
    LastName: '',
    CNIC: '',
    PassportNo: '',
    MobileNO: ''
  }

  searchResults = [{ Message: 'No Record(s) Found' }];
  page = 1;
  pageSize = 5;
  collectionSize = 0;
  selectedVisit: any = null;
  disabledButton: boolean = false;
  isSpinner: boolean = true;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to submit?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    public helperService: HelperService,
    private sharedService: SharedService,
  ) { }


  ngOnInit(): void {
    this.loadLoggedInUserInfo();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  visitTests = [];
  VisitID = null;
  PatientID = null;
  spinnerRefs = {
    listSection: 'listSection'
  }


  selectVisit(visit) {
    this.VisitID = visit.VisitID || null;
    this.PatientID = visit.PatientID || null;
    this.selectedVisit = visit;
    if (visit && visit.VisitID) {
      this.getTPByVisitIDFortedReset(visit.VisitID, 8);
    } else {
      this.toastr.warning('No record found');
    }
  }

  getTPByVisitIDFortedReset(VisitID, StatusID) {
    this.visitTests = []
    let params = {
      VisitID: VisitID,
      StatusID: StatusID
    };
    this.spinner.show(this.spinnerRefs.listSection);
    this.sharedService.getData(API_ROUTES.GET_TP_BY_VISIT_ID_FOR_RESET, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        this.visitTests = res.PayLoad || [];
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log(err);
    })

  }





  patientVisitEvent(event) {
    this.selectVisit(event);
  }

  ResetRequestRemarks = "";
  characterCount = 0;
  maxCharacterCount = 15;

  updateCharacterCount() {
    this.characterCount = this.ResetRequestRemarks.length;
  }
  showHideBtnSubmit = false;
  onResetTPCheckboxChange() {
    let checkedTests = this.visitTests.filter(a => a.checked);
    this.showHideBtnSubmit = (checkedTests.length) ? true : false;
  }
  clickSubmitBtn=false;
  updateVisitTestResetStatus() {
    let checkedTests = this.visitTests.filter(a => a.checked);
    console.log("visitTests__",this.visitTests);
    console.log("checkedTests__",checkedTests);
    if (this.ResetRequestRemarks.length < 15) {
      this.clickSubmitBtn=true;
      this.toastr.warning("Please Provide atleast 15 characters in remarks", "Warning");
      return;
    }
    if (!checkedTests.length) {
      this.clickSubmitBtn=false;
      this.toastr.warning("Please select any study", "Warning");
      return;
    } else {
      this.clickSubmitBtn=false;
      let TPIDs = checkedTests.map(obj => obj.TPID).join(",")
      let formData = {
        VisitID: this.VisitID,
        TPIDs: TPIDs,
        Remarks: this.ResetRequestRemarks,
        StatusID: 15,//reported reset request
        CreatedBy: this.loggedInUser.userid || -99,
        LocID: this.loggedInUser.locationid
      };
      this.disabledButton = true;
      this.isSpinner = false;
      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_VISIT_TEST_RESET_STATUS, formData).subscribe((data: any) => {
        
        // if (JSON.parse(data.PayLoadStr).length) {
        // if (data.StatusCode == 200) {
        let result = JSON.parse(data.PayLoadStr);
        if(result[0].Result==1){
          this.toastr.success(data.Message);
        }
        else{
          this.toastr.error(data.Message);
        }
        this.characterCount = 0;
        // this.toastr.success(data.Message);
        this.ResetRequestRemarks = "";
        this.getTPByVisitIDFortedReset(this.VisitID, 8);
        this.disabledButton = false;
        this.isSpinner = true;
        // } else {
        //   this.toastr.error(data.Message)
        //   this.disabledButton = false;
        //   this.isSpinner = true;
        // }
        // }
      }, (err) => {
        console.log(err);
        this.disabledButton = false;
        this.isSpinner = true;
        this.toastr.error('Connection error');
      })
    }
  }
}