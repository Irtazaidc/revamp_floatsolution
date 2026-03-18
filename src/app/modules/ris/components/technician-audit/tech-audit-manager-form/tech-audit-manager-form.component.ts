// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ratingElement } from '../../../../../../app/ratingElement';
import { StarRatingComponent } from 'ng-starrating';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,

  selector: 'app-tech-audit-manager-form',
  templateUrl: './tech-audit-manager-form.component.html',
  styleUrls: ['./tech-audit-manager-form.component.scss']
})
export class TechAuditManagerFormComponent implements OnInit {

  screenIdentity = null;
  public starRatingElements: Array<ratingElement> = [];
  @Input() InputPayload = {
    TPID: null,
    VisitID: null,
    PatientID: null,
    TPCode: null,
    TPName: null,
    PatientName: null,
    RISWorkListID: null,
    ProcessIDParent: null,
    RISStatusID: null,
    StatusId: null,
    WorkflowStatus: null,
    TestStatus: null,
    InitializedBy: null,
    InitializedOn: null,
    InitBy: null,
    TechnologistVisitTPAuditID: null,
    AuditStatusID: null,
    TechRemarks: null,
    FeedbackObj: {
      FeedBackBy: null,
      FeedBackOn: null,
      FBHLocCode: null,
      FeedBackRemarks: null,
      FeedBackDetailRemarks: null
    },
    isMetal:false
  };
  @Output() isStatusChanged = new EventEmitter<any>();
  TPID = null;
  VisitId = null;
  PatientID = null;
  TPCode = null;
  TPName = null;
  TPFullName = null;
  PatientName = null;
  RISWorkListID = null;
  ProcessIDParent = null;
  MOForm: any = "";
  RISStatusID: any = null;
  StatusId: any = null;
  WorkflowStatus: any = null;
  TestStatus: any = null;
  InitializedBy: any = null;
  InitializedOn: any = null;
  InitBy = null;
  TechnologistVisitTPAuditID = null;
  AuditStatusID = null;
  isReAudit = null;
  FeedbackObj: {
    FeedBackBy: null,
    FeedBackOn: null,
    FBHLocCode: null,
    FeedBackRemarks: null,
    FeedBackDetailRemarks: null
  }
  isMetal = false;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  loggedInUser: UserModel;

  TPQuestions = [];
  visitTests = []

  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection'
  }
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
    private sharedService: SharedService,
    private appPopupService: AppPopupService,
    private route: ActivatedRoute,

  ) { }

  qualityAssurance = []

  isFieldDisabled=false;
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getAuditQA();
    let _ratingElement = new ratingElement();
    //ratingElement5.readonly = true;
    _ratingElement.checkedcolor = "red";
    _ratingElement.uncheckedcolor = "black";
    _ratingElement.value = 0;//7.5;
    _ratingElement.size = 30;
    _ratingElement.totalstars = 5;
    this.starRatingElements.push(_ratingElement);
    this.VisitId = this.InputPayload.VisitID;
    this.TPCode = this.InputPayload.TPCode;
    this.TPName = this.InputPayload.TPName;
    this.TPFullName = this.TPCode + ' - ' + this.TPName;
    this.PatientName = this.InputPayload.PatientName;
    this.PatientID = this.InputPayload.PatientID;
    this.TPID = this.InputPayload.TPID;
    this.RISWorkListID = this.InputPayload.RISWorkListID;
    this.ProcessIDParent = this.InputPayload.ProcessIDParent;
    this.RISStatusID = this.InputPayload.RISStatusID;
    this.WorkflowStatus = this.InputPayload.WorkflowStatus;
    this.TestStatus = this.InputPayload.TestStatus;
    this.StatusId = this.InputPayload.StatusId;
    this.InitializedBy = this.InputPayload.InitializedBy;
    this.InitializedOn = this.InputPayload.InitializedOn;
    this.InitBy = this.InputPayload.InitBy;
    this.TechnologistVisitTPAuditID = this.InputPayload.TechnologistVisitTPAuditID;
    this.AuditStatusID = this.InputPayload.AuditStatusID;
    this.TechRemarks = this.InputPayload.TechRemarks;
    this.FeedbackObj  = this.InputPayload.FeedbackObj;
    this.isMetal  = this.InputPayload.isMetal;

    this.screenIdentity = this.route.routeConfig.path;
    if((this.screenIdentity=='my-tech-audit-summary-report'||this.screenIdentity=='tech-audit-summary-report' || this.TechnologistVisitTPAuditID) || (this.screenIdentity=='tech-audit' && this.TechnologistVisitTPAuditID)){
      this.isFieldDisabled=true;
    }else{
      this.isFieldDisabled=false;
    }

    if (this.TechnologistVisitTPAuditID){
      // setTimeout(() => {
        this.getTechnologistVisitTPAuditByID()
      // }, 200);
    }
    setTimeout(() => {
      if(this.TechRemarks && this.TechRemarks!=''){
        this.TechRemarksDisabled=true;
      }else{
        this.TechRemarksDisabled=false;
      }
      // console.log("this.FeedbackObj ____________",this.FeedbackObj)
    }, 100);
      

  }
  isObjectEmpty(obj: any): boolean {
    for (let key in obj) {
      if (obj[key] !== null && obj[key] !== undefined) {
        return false;
      }
    }
    return true;
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  onRate($event: { oldValue: number, newValue: number, starRating: StarRatingComponent }) {
    this.AuditRating = $event.newValue;
    // alert(`Old Value:${$event.oldValue}, New Value: ${$event.newValue}, Checked Color: ${$event.starRating.checkedcolor}, Unchecked Color: ${$event.starRating.uncheckedcolor}`);
  }
  getStarRatingValue(param) {
    if (param.target.value) {
      this.AuditRating = parseFloat(param.target.value);
    }
  }
  clearSearchedvalue_() {
    const searchInput: HTMLInputElement = document.querySelector('[name="QAIDField"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }

  }
  clearSearchedvalue() {
    const searchInput: HTMLInputElement = document.querySelector('[name="AuditQAID"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }

  }

  getAuditQA() {
    this.qualityAssurance = [];
    this.sharedService.getData(API_ROUTES.GET_AUDIT_QA, {}).subscribe((resp: any) => {
      if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
        this.qualityAssurance = resp.PayLoad || [];
      } else {
        this.qualityAssurance = []
      }
    }, (err) => {
      console.log("Err", err)
    })
  }
  existingAuditRow = [];
  exitingAuditQAIDs = []
  getTechnologistVisitTPAuditByID() {
    this.existingAuditRow = [];
    let objParam = {
      TechnologistVisitTPAuditID: this.TechnologistVisitTPAuditID
    };
    this.sharedService.getData(API_ROUTES.GET_TECHNOLOGIST_VISIT_TP_AUDIT_BY_ID, objParam).subscribe((resp: any) => {
      if (resp.PayLoadDS && resp.StatusCode == 200) {
        this.existingAuditRow = resp.PayLoadDS.Table || []
        this.exitingAuditQAIDs = resp.PayLoadDS.Table1 || []
        if(this.exitingAuditQAIDs.length){
          this.AuditQAIDs = this.exitingAuditQAIDs.map((val:any) =>  val.AuditQAID);
        }

        if(this.existingAuditRow.length){
          let objRow = this.existingAuditRow[0];
          this.Remarks = objRow.Remarks;
          this.Recommendations = objRow.Recommendation;
          this.ManagerRemarks = objRow.ManagerRemarks||'';
          this.QualityAssurance = objRow.QualityAssurance;
          this.RecommendedFine = objRow.RecommendedFine || 0;
          this.ApprovedFine = objRow.ApprovedFine;
          this.AuditRating = objRow.Rating;
          this.isReAudit = objRow.isReAudit;
          setTimeout(() => {
            this.starRatingElements.splice(0, this.starRatingElements.length);
            let _ratingElement = new ratingElement();
            //ratingElement5.readonly = true;
            _ratingElement.checkedcolor = "red";
            _ratingElement.uncheckedcolor = "black";
            _ratingElement.value = this.AuditRating||0
            _ratingElement.size = 30;
            _ratingElement.totalstars = 5;
            this.starRatingElements.push(_ratingElement);
          }, 100);
        }
        

      } else {
        this.existingAuditRow = []
        this.exitingAuditQAIDs = []
      }
    }, (err) => {
      console.log("Err", err)
    })

  }
  showResetButton = true;
  enableReaudit(){
    this.showResetButton=false;
    this.TechnologistVisitTPAuditID=null;
    this.isFieldDisabled=false;
    this.isReAudit = true;
  }
  AuditQAIDs = [7];
  Remarks = null;
  Recommendations = null;
  QualityAssurance = null;
  selectedQualityAssurance: any = '';
  RecommendedFine = 0;
  AuditRating = null;
  isSubmitClicked = false;
  saveWithShare = true;
  ManagerRemarks	= null;
  ApprovedFine = 0;
  insertUpdateTechnologistVisitTPAuditManager() {
    this.isSubmitClicked = true;
    if (!this.AuditRating) {
      this.toastr.error("Please Provide Rating", "No Star Selected");
      return;
    }
    if (!this.AuditQAIDs.length) {
      this.toastr.warning("Please select atleast one value for QA", "No QA selected");
      return;
    } else {
      let objParam = {
        TechnologistVisitTPAuditID: this.TechnologistVisitTPAuditID,
        ManagerRemarks	: this.ManagerRemarks	,
        ApprovedFine: this.ApprovedFine,
        CreatedBy: this.loggedInUser.userid || -99
      }
      // console.log("Form values_________", objParam, this.AuditQAIDs);//return;
      this.disabledButton = true;
      this.isSpinner = false;
      this.spinner.show(this.spinnerRefs.formSection);
      this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_TECHNOLOGIST_VISIT_TP_AUDIT_MANAGER, objParam).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            this.appPopupService.closeModal();
            this.AuditRating = null;
            this.isSpinner = true;
            this.TechnologistVisitTPAuditID = null;
            // if (this.starRatingElements.length > 0) {
            //   this.starRatingElements.splice(0, this.starRatingElements.length);
            //   let _ratingElement = new ratingElement();
            //   //ratingElement5.readonly = true;
            //   _ratingElement.checkedcolor = "red";
            //   _ratingElement.uncheckedcolor = "black";
            //   _ratingElement.value = 0;//7.5;
            //   _ratingElement.size = 30;
            //   _ratingElement.totalstars = 5;
            //   this.starRatingElements.push(_ratingElement);
            //   this.isStatusChanged.emit(1)
            // }
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButton = false;
            this.isSpinner = true;
          }
        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButton = false;
        this.isSpinner = true;
      })

    }
  }

  TechRemarksDisabled=false;
  TechRemarksSaved=false;
  TechRemarks ='';
  isSpinnerechRemarks=true;
  disabledButtonTechRemarks=false;
  sendTechRemarks(){
    if (!this.TechRemarks || this.TechRemarks=='') {
      this.toastr.warning("Please provide remarks", "No Remarks");
      return;
    } else {
      let objParam = {
        TechnologistVisitTPAuditID: this.TechnologistVisitTPAuditID,
        // TechnologistID: this.loggedInUser.userid || -99,//this.InitBy,
        TechRemarks: this.TechRemarks,
        CreatedBy: this.loggedInUser.userid || -99,
      }
      // console.log("Form values_________", objParam);//eturn;
      this.disabledButtonTechRemarks = true;
      this.isSpinnerechRemarks = false;
      this.spinner.show(this.spinnerRefs.formSection);
      this.sharedService.insertUpdateData(API_ROUTES.INSERT_TECHNOLOGIST_VISIT_TP_AUDIT_RAMARKS, objParam).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        this.disabledButtonTechRemarks = false;
        this.isSpinnerechRemarks = true;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            this.TechRemarksSaved=true;
            // this.appPopupService.closeModal();
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButtonTechRemarks = false;
            this.isSpinnerechRemarks = true;
            this.TechRemarksSaved=false;
          }
        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonTechRemarks = false;
        this.isSpinnerechRemarks = true;
        this.TechRemarksSaved=false;
      })

    }

  }


}
