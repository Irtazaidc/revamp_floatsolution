// @ts-nocheck
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Component({
  standalone: false,

  selector: 'app-addendum-second-opinion-request',
  templateUrl: './addendum-second-opinion-request.component.html',
  styleUrls: ['./addendum-second-opinion-request.component.scss']
})
export class AddendumSecondOpinionRequestComponent implements OnInit {

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
    this.getRadiologistInfo();
    this.getRISAddendumReviewSource();
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
      this.getTPByVisitIDForAddendum(visit.VisitID);
    } else {
      this.toastr.warning('No record found');
    }
  }

  getTPByVisitIDForAddendum(VisitID) {
    this.visitTests = []
    let params = {
      VisitID: VisitID
    };
    this.spinner.show(this.spinnerRefs.listSection);
    this.sharedService.getData(API_ROUTES.GET_TP_BY_VISIT_ID_FOR_ADDENDUM, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        this.visitTests = res.PayLoad || [];
        if (this.visitTests.length) {
          this.ObjectionQueryPhysician = this.visitTests[0].RefBy;
          this.ObjectionQueryReportedDoctor = this.visitTests[0].EmpName;
          this.PrimaryReportedRadiologistID = this.visitTests[0].EmpID || null;
          this.radoiologistList = this.radoiologistList.filter(f => f.EmpId != this.PrimaryReportedRadiologistID);
        }
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log(err);
    })

  }


  selectAllText(event: Event) {
    // Cast the event target to HTMLInputElement
    const inputElement = event.target as HTMLInputElement;

    // Check if the target element is an input element
    if (inputElement.tagName === 'INPUT') {
      // Select all text in the input field
      inputElement.select();
    }
  }


  patientVisitEvent(event) {
    this.selectVisit(event);
  }

  AddendumRemarks = "";
  characterCount = 0;
  maxCharacterCount = 50;
  RadiologistID = null;
  RequestedBy = null; //Requested RISAddendumReviewSource
  QueryObjection = null;
  ObjectionQueryPhysician = null;
  ObjectionQuerySourceName = null;
  ObjectionQueryReportedDoctor = null;
  PrimaryReportedRadiologistID = null;
  updateCharacterCount() {
    this.characterCount = this.QueryObjection.length;
  }
  clickSubmitBtn = false;
  insertUpdateVisitTestAddendum() {
    let checkedTests = this.visitTests.filter(a => a.checked);

    // if (this.AddendumRemarks.length < 15) {
    //   this.clickSubmitBtn=true;
    //   this.toastr.warning("Please Provide atleast 15 characters in remarks", "Warning");
    //   return;
    // }
    if (!checkedTests.length) {
      this.clickSubmitBtn = false;
      this.toastr.warning("Please select any study", "Warning");
      return;
    } else {
      if (!this.RequestedBy || (this.RequestType == '2' && !this.RadiologistID) || !this.QueryObjection) {
        this.clickSubmitBtn = true;
        this.toastr.warning("Please fill the required highlighted fields", "Validation Failed")
        return
      } else if (this.QueryObjection.length < 50) {
        this.clickSubmitBtn = true;
        this.toastr.warning("Please Provide atleast 50 characters in Query/Objection/Reason", "Warning");
        return;
      } else {
        this.clickSubmitBtn = false;
        let TPIDs = checkedTests.map(obj => obj.TPID).join(",")
        let formData = {
          VisitID: this.VisitID,
          TPIDs: TPIDs,
          // Remarks: this.AddendumRemarks,
          RISAddendumTypeID: this.RequestType,
          AddendumReviewSourceID: this.RequestedBy || null,
          RefByDoctorName: this.ObjectionQueryPhysician || null,
          QueryObjection: this.QueryObjection || null,
          RadiologistID: this.RadiologistID || null,
          CreatedBy: this.loggedInUser.userid || -99,
          RISStatusID : (this.RequestType=="1")? 15:17
        };
        this.disabledButton = true;
        this.isSpinner = false;
        this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_VISIT_TEST_ADDENDUM, formData).subscribe((data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              if(this.RequestType == '1'){
                this.toastr.success("Addendum request added successfully");
              }else{
                this.toastr.success("Second Opinion request added successfully");
              }
              
              this.resetAddenSeconOpinFormData();
              this.getTPByVisitIDForAddendum(this.VisitID);
              if (this.RequestType == "2")
                this.getRadiologistInfo();
              this.disabledButton = false;
              this.isSpinner = true;
            } else {
              this.toastr.error(data.Message)
              this.disabledButton = false;
              this.isSpinner = true;
            }
          }
        }, (err) => {
          console.log(err);
          this.disabledButton = false;
          this.isSpinner = true;
          this.toastr.error('Connection error');
        })
      }
    }
  }

  resetAddenSeconOpinFormData() {
    this.characterCount = 0;
    this.AddendumRemarks = "";
    this.characterCount = 0;
    this.maxCharacterCount = 50;
    this.RadiologistID = null;
    this.RequestedBy = null; //Requested RISAddendumReviewSource
    this.QueryObjection = null;
    this.ObjectionQueryPhysician = null;
    this.ObjectionQuerySourceName = null;
    this.PrimaryReportedRadiologistID = null;
    this.showHideBtnSubmit = false;

  }

  disabledPhysician = false;
  setSourcePhysicianAndReportedDoctorName() {
    // this.clickSubmitBtn = false;
    if (this.RequestedBy == 2) {
      this.ObjectionQuerySourceName = this.ObjectionQueryPhysician;
    } else if (this.RequestedBy == 5) {
      this.ObjectionQuerySourceName = this.ObjectionQueryReportedDoctor;
    } else {
      this.ObjectionQuerySourceName = this.ObjectionQueryPhysician;
    }
    if (this.RequestedBy == 2) {
      this.disabledPhysician = true;
    } else {
      this.disabledPhysician = false;
    }
  }
  RequestType: string = '1'; // RISAddendumTypeID Selects 'Addendum' by default, 1:Addendum, 2:Second Opinion 
  noticeBoardHeading = "Addendum";
  noticeBoardText = "Addendum can be done by the primary reporting doctor.";

  onChange(event: any) {
    if (event && event == 1) {
      this.noticeBoardHeading = "Addendum";
      this.noticeBoardText = "Addendum can be done by the primary reporting doctor.";
    } else {
      this.noticeBoardHeading = "Second Opinion ";
      this.noticeBoardText = "Second Opinion  will be assigned to an authorized doctor's panel. Please select the reviewer doctor below";
    }
  }

  radoiologistList = [];
  getRadiologistInfo() {
    let params = {
      EmpID: null
    };
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_INFO, params).subscribe((res: any) => {
      this.radoiologistList = res.PayLoadDS['Table'] || [];
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  addendumReviewSources = [];
  getRISAddendumReviewSource() {
    let params = {};
    this.sharedService.getData(API_ROUTES.GET_RIS_ADDENDUM_REVIEW_SOURCE, params).subscribe((res: any) => {
      this.addendumReviewSources = res.PayLoad || [];
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  showHideBtnSubmit = false;
  onAddenSecondOpinCheckboxChange() {
    let checkedTests = this.visitTests.filter(a => a.checked);
    this.showHideBtnSubmit = (checkedTests.length) ? true : false;
  }

  revertAddendum(tp) {
    let objParm = {
      TPID: tp.TPID,
      VisitID: this.VisitID,
      CreatedBy: this.loggedInUser.userid || -1
    };
    this.spinner.show(this.spinnerRefs.listSection);
    this.sharedService.revertAddendumSecondOpinion(API_ROUTES.GET_REVERT_ADDENDUM_SECOND_OPINION, objParm)
      .subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        let revert = null;
        if (res.PayLoadStr) {
          try {
            const parsed = JSON.parse(res.PayLoadStr);
            revert = parsed[0]?.Result || null;
          } catch (error) {
            console.error("Error parsing PayLoadStr:", error);
          }
        }
        if (revert === 1) {
          this.getTPByVisitIDForAddendum(this.VisitID);
          if(this.RequestType=="1"){
            this.toastr.success("Addendum request has been reverted successfully");
          }else{
            this.toastr.success("Second opinion request has been reverted successfully");
          }
        } else if (revert === 2) {
          this.getTPByVisitIDForAddendum(this.VisitID);
          if(this.RequestType=="1"){
            this.toastr.success("The addendum request has already been completed, and the request cannot be reverted.");
          }else{
            this.toastr.success("The second opinion request has already been completed, and the request cannot be reverted.");
          }
        } else {
          this.toastr.error('An unexpected error occurred');
        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.error("API Error:", err);
        this.toastr.error('Failed to process the request');
      });
  }

}