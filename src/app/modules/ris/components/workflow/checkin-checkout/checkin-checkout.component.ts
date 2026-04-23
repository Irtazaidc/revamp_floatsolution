// @ts-nocheck
import { Component, EventEmitter, Input, NgZone, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { TechnicianService } from 'src/app/modules/ris/services/technician.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
// import { RisWorklistService } from 'src/app/modules/ris/services/ris-worklist.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
// import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { AppPopupService } from '../../../../shared/helpers/app-popup.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import { environment } from '../../../../..../../../../environments/environment';
import { SweetAlertResult } from 'sweetalert2';
import Swal from 'sweetalert2';
import { VisitRemarksService } from 'src/app/modules/remarks/services/visit-remarks.service';
import { fromEvent, interval, BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
@Component({
  standalone: false,

  selector: 'app-checkin-checkout',
  templateUrl: './checkin-checkout.component.html',
  styleUrls: ['./checkin-checkout.component.scss']
})
export class CheckinCheckOutComponent implements OnInit, OnDestroy {
  @ViewChild('userVerificationModal') userVerificationModal;
  userVerificationModalRef: NgbModalRef;
  techUsername = ""; //john.doe;
  techPassword = ""; //freedom;
  userVerificationForm = this.fb.group({
    techUsername: ['', Validators.compose([Validators.required])],
    techPassword: ['', Validators.compose([Validators.required])]
  });
  private startTime: number;
  mm = 0;
  ss = 0;
  ms = 0;
  private timerSubscription: Subscription;
  private isPageVisible = true;
  @Input() ParamsPayload = {
    TPID: null,
    VisitID: null,
    VisitIDWithDashes: null,
    PatientID: null,
    TPCode: null,
    TPName: null,
    PatientName: null,
    RISWorkListID: null,
    VerifiedUserID: null,
    VerifiedUserName: null,
    RISStatusID: null,
    MOBy: null,
    RegLocId: null,
    ProcessIDParent: null,
    isShowVitalsCard: null,
    isTechHistoryRequred: null,
    WorkflowStatus: null,
    StatusId: null,
    TestStatus: null,
    isMetal: null,
    isPreMedical: null
  };
  @Output() isStatusChanged = new EventEmitter<any>();
  searchText = "";
  TPID = null;
  VisitId = null;
  VisitIDWithDashes = null;
  PatientID = null;
  TPCode = null;
  TPName = null;
  TPFullName = null;
  PatientName = null;
  RISWorkListID = null;
  VerifiedUserID = null;
  VerifiedUserName = null;
  RISStatusID = null;
  MOBy = null;
  RegLocId = null;
  ProcessIDParent = null;
  isShowVitalsCard = null;
  isTechHistoryRequred = null;
  WorkflowStatus: any = null;
  StatusId = null;
  TestStatus = null;
  MOForm: any = "";
  isMetal = null;
  isPreMedical = null;
  itemsList = [];
  TPItemsList = [];
  confirmationPopoverConfigCheckin = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to checkin ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  confirmationPopoverConfigInventory = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save inventory ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  confirmationPopoverConfigCheckout = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to checkout ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  isMetalChecked = false;
  checkboxEvent: any;
  pendingCheckState: boolean | null = null;
  confirmMetalPopup = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm Metal...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> that metal is detected?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }


  spinnerRefs = {
    inventorySection: 'inventorySection',
    checklistSection: 'checklistSection',
    RISServicesSection: 'RISServicesSection',
  }
  loggedInUser: UserModel;
  constructor(
    private questionnaireService: QuestionnaireService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    // private worklistSrv: RisWorklistService,
    private techSrv: TechnicianService,
    private auth: AuthService,
    private modalService: NgbModal,
    private appPopupService: AppPopupService,
    private router: Router,
    private datePipe: DatePipe,
    private multiApp: MultiAppService,
    private visitRemarksService: VisitRemarksService,
    private ngZone: NgZone,
    private fb: FormBuilder,
    private sharedService: SharedService
  ) {
    fromEvent(document, 'visibilitychange')
      .pipe(
        filter(() => document.visibilityState === 'visible')
      )
      .subscribe(() => {
        // Page is now visible, restart the timer
        if (this.isRunning) {
          this.startTimer();
        }
        this.isPageVisible = true;
      });
  }
  startTimer() {
    this.machineStartTime = null;
    const _machineStartTime = new Date();
    this.machineStartTime = formatDate(_machineStartTime, 'yyyy-MM-dd H:mm:ss', 'en-US');
    if (!this.isRunning) {
      this.startTime = performance.now() - (this.mm * 60000 + this.ss * 1000 + this.ms) * 10;
      this.isRunning = true;
      this.updateTimer();
    }
  }
  private updateTimer() {
    if (this.isRunning) {
      const currentTime = performance.now();
      const elapsedTime = currentTime - this.startTime;
      this.mm = Math.floor(elapsedTime / 60000);
      this.ss = Math.floor((elapsedTime % 60000) / 1000);
      this.ms = Math.floor((elapsedTime % 1000) / 10);
      this.timerId = requestAnimationFrame(() => this.updateTimer());
    }
  }

  isFieldDisabled = false;
  sub: any = Subscription;
  count = 0;
  ngOnDestroy() {
    this.stopTimer();
  }
  stopTimer() {
    if (this.isRunning) {
      cancelAnimationFrame(this.timerId);
      this.isRunning = false;
      this.machineStopTime = null;
      const _machineStopTime = new Date();
      this.machineStopTime = formatDate(_machineStopTime, 'yyyy-MM-dd H:mm:ss', 'en-US');
      clearInterval(this.timerId);
      this.isStopped = true;
      this.isStartStopTimeSaved = true;
    }
  }
  ngOnInit(): void {
    if (this.multiApp.biomatricCheckout) {
      this.sub = this.multiApp.biomatricCheckout.subscribe((resp: any) => {
        // console.log("respons back from multi app server is_______________________ngOnInit", resp);
        if (resp) {
          this.spinner.hide();
        }
        setTimeout(() => {
          this.count = 0;
          if (resp && resp.userIdentity && resp.userIdentity != 0) {
            if (resp.userIdentity == -99) {
              this.toastr.warning("The device is not connected, so please log in with your credentials.", "Device Connection Error")
            } else {
              // alert("wer are in verifyed")
              this.VerifiedUserID = (resp && resp.userIdentity) ? resp.userIdentity : null;
              this.VerifiedUserName = (resp && resp.UserName) ? resp.UserName : null;
              this.RegLocId = (resp && resp.RegLocId) ? resp.RegLocId : null;
              this.toastr.success(this.VerifiedUserName, "Verified:");
              this.techCheckoutVerified();
              this.spinner.hide();
            }
          }
          // else{
          //   this.spinner.hide();
          //   this.toastr.error("Web Disc Connection has problem")
          // }
        }, 300);
      });
    }

    // console.log("Emitted data for checkin is+++++++++++++++++++++++++++++++++++++++", this.ParamsPayload)
    // this.clearVariables();
    this.loadLoggedInUserInfo();
    this.MOForm = "MO Form";
    this.VisitId = this.ParamsPayload.VisitID;
    this.VisitIDWithDashes = this.ParamsPayload.VisitIDWithDashes;
    this.TPCode = this.ParamsPayload.TPCode;
    this.TPName = this.ParamsPayload.TPName;
    this.TPFullName = this.TPName;
    this.PatientName = this.ParamsPayload.PatientName;
    this.PatientID = this.ParamsPayload.PatientID;
    this.TPID = this.ParamsPayload.TPID;
    this.RISWorkListID = this.ParamsPayload.RISWorkListID;
    this.VerifiedUserID = this.ParamsPayload.VerifiedUserID;
    this.VerifiedUserName = this.ParamsPayload.VerifiedUserName;
    this.RISStatusID = this.ParamsPayload.RISStatusID;
    this.MOBy = this.ParamsPayload.MOBy;
    this.RegLocId = this.ParamsPayload.RegLocId;
    this.ProcessIDParent = this.ParamsPayload.ProcessIDParent;
    this.isShowVitalsCard = this.ParamsPayload.isShowVitalsCard;
    this.isTechHistoryRequred = this.ParamsPayload.isTechHistoryRequred;
    this.WorkflowStatus = this.ParamsPayload.WorkflowStatus;
    this.StatusId = this.ParamsPayload.StatusId;
    this.TestStatus = this.ParamsPayload.TestStatus;
    this.isMetal = this.ParamsPayload.isMetal;
    this.isPreMedical = this.ParamsPayload.isPreMedical;
    this.isMedicalExamine = this.ParamsPayload.isPreMedical;
    if (this.RISStatusID == 4 || this.RISStatusID == 5 || this.RISStatusID == 6) {
      this.isFieldDisabled = true;
    } else {
      this.isFieldDisabled = false;
    }
    // setTimeout(() => {
    this.getVisitTPInventory();
    // }, 1000);
    // this.getTPInventory();
    this.getTechnicianCheckList();
    this.getTechnicianHistory();
    this.getMachineModality();
    this.getRadiologistInfo();
    this.getRISServicesByVisitID();
    // console.log("ParamsPayload_______", this.ParamsPayload)
  }
  // ngOnChanges(): void {
  //   this.clearVariables();
  //   this.loadLoggedInUserInfo();
  //   this.MOForm = "MO Form";
  //   this.VisitId = this.ParamsPayload.VisitID;
  //   this.TPCode = this.ParamsPayload.TPCode;
  //   this.TPName = this.ParamsPayload.TPName;
  //   this.TPFullName = this.TPCode + ' - ' + this.TPName;
  //   this.PatientName = this.ParamsPayload.PatientName;
  //   this.PatientID = this.ParamsPayload.PatientID;
  //   this.TPID = this.ParamsPayload.TPID;
  //   this.RISWorkListID = this.ParamsPayload.RISWorkListID;
  //   this.VerifiedUserID = this.ParamsPayload.VerifiedUserID;
  //   this.VerifiedUserName = this.ParamsPayload.VerifiedUserName;
  //   this.RISStatusID = this.ParamsPayload.RISStatusID;
  //   this.MOBy = this.ParamsPayload.MOBy;
  //   this.RegLocId = this.ParamsPayload.RegLocId;
  //   this.isShowVitalsCard = this.ParamsPayload.isShowVitalsCard;
  //   if (this.RISStatusID == 4 || this.RISStatusID == 5 || this.RISStatusID == 6) {
  //     this.isFieldDisabled = true;
  //   } else {
  //     this.isFieldDisabled = false;
  //   }
  //   // setTimeout(() => {
  //   this.getVisitTPInventory();
  //   // }, 1000);
  //   // this.getTPInventory();
  //   this.getTechnicianCheckList();
  //   this.getTechnicianHistory();
  //   this.getMachineModality();
  //   this.getRadiologistInfo();
  // }
  clearVariables() {
    this.TPID = null;
    // this.VisitID = null;
    this.PatientName = null;
    this.TPCode = null;
    this.TPName = null;
    this.PatientID = null;
    this.RISWorkListID = null;
    this.RISStatusID = null;
    this.MOBy = null;

    this.ParamsPayload.TPID = null;
    this.ParamsPayload.VisitID = null;
    this.ParamsPayload.VisitIDWithDashes = null;
    this.ParamsPayload.PatientID = null;
    this.ParamsPayload.TPCode = null;
    this.ParamsPayload.TPName = null;
    this.ParamsPayload.PatientName = null;
    this.ParamsPayload.RISWorkListID = null;
    this.ParamsPayload.VerifiedUserID = null;
    this.ParamsPayload.VerifiedUserName = null;
    this.ParamsPayload.RISStatusID = null;
    this.ParamsPayload.MOBy = null;
    this.ParamsPayload.RegLocId = null;
    this.ParamsPayload.isShowVitalsCard = null;
    this.ParamsPayload.isTechHistoryRequred = null;
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  getVisitTPInventory() {
    this.TPItemsList = []
    const params = {
      VisitID: this.VisitId,
      TPID: this.TPID,
      RISStatusID: null,
      StatusID: 7
    };
    this.spinner.show(this.spinnerRefs.inventorySection);
    // console.log("Params are_____________", params)
    this.techSrv.getVisitTPInventory(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.inventorySection);
      if (res.StatusCode == 200) {
        this.TPItemsList = res.PayLoad || [];
        this.TPItemsList = this.TPItemsList.map(a => ({
          StoreItemID: a.StoreItemID,
          VisitTPInventoryID: a.VisitTPInventoryID,
          Code: a.Code ? a.Code : "",
          MeasuringUnit: a.MeasuringUnit,
          StoreItemFull: a.Code + "-" + a.StoreItemTitle + "[" + a.MeasuringUnit + "]",
          StoreItemId: a.StoreItemID,
          StoreItemTitle: a.StoreItem,
          RecQuantity: a.RecQuantity,
          ConsumedQuantity: a.ConsumedQuantity,
          DamagedQuantity: a.DamagedQuantity,
          StatusID: a.StatusID,
          RISStatusID: a.RISStatusID,
          Remarks: a.Remarks,
          checked: a.VisitTPInventoryID ? true : false
        }))
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.inventorySection);
    })
  }




  selectedItemsList = [];
  addSelectedQuestion(e) {

  }
  selectAllTPStoreItems(e) {
    this.TPItemsList.forEach(a => {
      a.checked = false;
      if (a.StoreItemID > 0) {
        a.checked = e.target.checked;
      }
    })
  }
  selectAllChecklist(e) {
    this.techChecklist.forEach(a => {
      a.checked = false;
      if (a.QuestionID > 0) {
        a.checked = e.target.checked;
      }
    })
  }

  removeItem(param) {
  }
  disabledButton = false; // Button Enabled / Disables [By default Enabled]

  isSpinner = true;//Hide Loader
  disabledButtonInventory = false;
  isSpinnerInventory = true;
  buttonClicked = false;
  isValidInventoryQty = false;

  disabledButtonCheckin = false;
  isSpinnerCheckin = true;
  disabledButtonPrintLabel = false;
  isSpinnerPrintLabel = true;

  disabledButtonCheckout = false;
  isSpinnerCheckout = true;
  InsertUpdateVisitTPInventory(saveFrom) {
    this.isValidInventoryQty = false;
    const checkedItems = this.TPItemsList.filter(a => a.checked);
    if (!checkedItems.length) {
      if (saveFrom == 1) {
        this.toastr.warning("Please select store item(s) to save", "Warning");
        return;
      }

      this.isDoneTPInventory = 1;
      return;
    }
    this.buttonClicked = true;
    let isValidInventoryObj = false;
    // let isValidInventoryQty=false;
    checkedItems.forEach(a => {
      if (!a.ConsumedQuantity) {
        isValidInventoryObj = true;
      }
      if (a.ConsumedQuantity + (a.DamagedQuantity || 0) > a.RecQuantity) {
        this.isValidInventoryQty = true;
      }
      // else{
      //   this.isValidInventoryQty=false;
      // }
    })

    if (isValidInventoryObj) {
      this.toastr.error("Please provide item quantity against selected Item!");
      this.isDoneTPInventory = 0;
      return;
    } else if (this.isValidInventoryQty) {
      this.toastr.error("SUM of Consumed and Damaged Qty should be less then Max Allowed Qty", "Validation Error");
      this.isDoneTPInventory = 0;
      return
    } else {
      const objParam = {
        TPID: this.TPID,
        VisitID: Number(this.VisitId),
        CreatedBy: this.VerifiedUserID || -99,
        tblVisitTPInventory: checkedItems.map(a => {
          return {
            VisitTPInventoryID: a.VisitTPInventoryID ? a.VisitTPInventoryID : null,
            Visit: Number(this.VisitId),
            TPID: this.TPID,
            StatusID: a.StatusID || null,
            RISStatusID: a.RISStatusID,
            StoreItemID: a.StoreItemId,
            ConsumedQuantity: a.ConsumedQuantity,
            DamagedQuantity: a.DamagedQuantity,
            Remarks: a.Remarks
          }
        })
      }
      // console.log("ojParam____________________", objParam)
      this.disabledButtonInventory = true;
      this.isSpinnerInventory = false;
      this.techSrv.InsertUpdateVisitTPInventory(objParam).subscribe((data: any) => {
        this.disabledButtonInventory = false;
        this.isSpinnerInventory = true;
        this.buttonClicked = false;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.getVisitTPInventory()
            this.isSpinnerInventory = true;
            this.buttonClicked = false;
            // this.closeLoginModal();
            this.isDoneTPInventory = 1;
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButton = false;
            this.isSpinner = true;
            this.disabledButtonInventory = false;
            this.isSpinnerInventory = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonInventory = false;
        this.isSpinnerInventory = true;
      })
    }

  }

  techChecklist = [];
  getTechnicianCheckList() {
    this.techChecklist = [];
    const params = {
      QuestionGroupTypeID: 8,
      TPID: this.TPID,
      VisitID: Number(this.VisitId)
    };
    // console.log("Params are_____________getTechnicianCheckList", params)
    this.spinner.show(this.spinnerRefs.checklistSection);
    this.techSrv.getTechnicianCheckList(params).subscribe((res: any) => {
      // console.log("checkin resp-1 getTechnicianCheckList",res)
      this.spinner.hide(this.spinnerRefs.checklistSection);
      if (res.StatusCode == 200) {
        this.techChecklist = res.PayLoad || [];
        // console.log("checklist items are: ", this.techChecklist)
        this.techChecklist = this.techChecklist.map(a => ({
          AnsTypeID: a.AnsTypeID,
          Answer: a.Answer,
          ChildQuestionID: a.ChildQuestionID,
          DefaultAns: a.DefaultAns,
          IsRequired: a.IsRequired,
          MinimumAnswerChar: a.MinimumAnswerChar,
          NextQuestionOnOption: a.NextQuestionOnOption,
          QExpectedOptions: a.QExpectedOptions,
          Question: a.Question,
          QuestionGroupTypeID: a.QuestionGroupTypeID,
          QuestionID: a.QuestionID,
          Remarks: a.Remarks,
          TechnicianQAnswerID: a.TechnicianQAnswerID,
          checked: (a.Answer == "Yes") ? true : false
        }))
      }
      // else {
      //   this.toastr.error('Something went wrong! Please contact administrator-1');
      // }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.checklistSection);
      this.toastr.error('Connection error');
    })
  }


  insertTechnicianQAnswer() {
    this.checkSubmit = false;
    let isValidChecklist = false;
    if (!this.techChecklist.length)
      return
    this.techChecklist.forEach(a => {
      if (!a.checked && !a.Remarks) {
        isValidChecklist = true;
      }
    })
    //COMMENT OUT REMARKS IF ITEM IS NOT CHECKED FOR CHECKIN PROCESS AS AB SATTAR SAHB SUGGEST, IT WILL MANDATORY ONLY FOR CHECKOUT
    // I havae revert again because it does not make any sense
    if (isValidChecklist) { //isValidChecklist
      this.toastr.error("Please enter checklist remarks");
      this.isDoneCheckList = 0;
      return;
    } else {
      const objParam = {
        TPID: this.TPID,
        VisitID: Number(this.VisitId),
        CreatedBy: this.VerifiedUserID || -99,
        tblTechnicianQAnswer: this.techChecklist.map(a => {
          return {
            TechnicianQAnswerID: a.TechnicianQAnswerID ? a.TechnicianQAnswerID : null,
            Visit: Number(this.VisitId),
            TPID: this.TPID,
            QuestionID: a.QuestionID,
            Answer: a.checked ? 'Yes' : 'No',
            Remarks: a.Remarks
          }
        })
      }
      // console.log("objParam for tech checklist____________",objParam);return;
      this.disabledButtonCheckin = true;
      this.isSpinnerCheckin = false;

      this.techSrv.insertTechnicianQAnswer(objParam).subscribe((data: any) => {
        this.disabledButtonCheckin = false;
        this.isSpinnerCheckin = true;
        this.buttonClicked = false;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            // this.getVisitTPInventory();
            this.getTechnicianCheckList();
            this.disabledButtonCheckin = false;
            this.isSpinnerCheckin = true;
            this.isDoneCheckList = 1;
            // this.closeLoginModal();
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButtonCheckin = false;
            this.isSpinnerCheckin = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonInventory = false;
        this.isSpinnerInventory = true;
      })
    }

  }

  //Technician History/////////////////////////////////
  TechnicianHistory = "";
  TechnicianHistoryJSON = "";
  techHistoryValidityCheck = false;
  techHistoryModalityCheck = false;
  isClearTechnicianHistoryField = false;
  isMedicalExamine = false;
  insertUpdateTechnicianWorkList() {
    if (this.machineStartTime && !this.machineStopTime) {
      this.toastr.warning("Please stop the machine time", "Machine Stop Time");
      return;
    }
    this.buttonClicked = true;
    //COMMENT OUT HISTORY FIELD FOR CHECKIN PROCESS AS AB SATTAR SAHB SUGGEST, IT WILL MANDATORY ONLY FOR CHECKOUT
    // if (this.TechnicianHistory === "") {
    //   this.techHistoryValidityCheck = true;
    //   this.toastr.error("Please enter technician history remarks");
    //   this.isDoneTechHistory = 0;
    //   return;
    // } else {
    //   // this.techHistoryValidityCheck=false;
    // }


    //Will make make mandatory when fils done...
    // if (this.MachineModalityID == "") {
    //   this.techHistoryModalityCheck = true;
    //   this.toastr.error("Please select modality");
    //   return;
    // } else {
    //   this.techHistoryModalityCheck = false;
    // }


    const currentdate = moment().format('DD-MMM-YYYY h:mm:ss');
    let mergeObj = []
    const obj = {
      technicianHitory: this.TechnicianHistory,
      unserName: this.VerifiedUserName,
      userID: this.VerifiedUserID,
      savedOn: currentdate
    }
    if (this.objJson && this.objJson.length)
      mergeObj = this.objJson;
    mergeObj.push(obj);
    // console.log("jsonOBJ______________",obj);//return;
    // console.log("mergeObj______________",mergeObj);return;
    const objParam = {
      TPID: this.TPID,
      VisitID: Number(this.VisitId),
      RISWorkListID: this.RISWorkListID,
      AppointmentID: null,
      PatientID: this.PatientID,
      LocID: this.RegLocId,
      RISStatusID: 3,
      TechnicianHistory: this.TechnicianHistory,
      TechnicianHistoryJSON: JSON.stringify(mergeObj),
      MachineStartTime: this.machineStartTime,
      MachineStopTime: this.machineStopTime,
      MachineModalityID: this.MachineModalityID,
      RadiologistID: this.RadiologistID,
      PendCheckInRemarks: this.PendCheckInRemarks || null,
      isMedicalExamine: this.isMedicalExamine?true:false,
      CreatedBy: this.VerifiedUserID || -99,
    }
    // console.log("objParam for tech checklist____________", objParam);//return;
    this.disabledButtonCheckin = true;
    this.isSpinnerCheckin = false;
    this.techSrv.insertUpdateTechnicianWorkList(objParam).subscribe((data: any) => {
      this.disabledButtonCheckin = false;
      this.isSpinnerCheckin = true;
      const resp = JSON.parse(data.PayLoadStr)
      if (resp.length) {
        if (data.StatusCode == 200) {
          this.RISWorkListID = resp[0].RISWorkListID;
          // if(resp[0].existingTPStatus >=7){
          if (resp[0].existingTPStatus >= 7 || (resp[0].existingTPStatus == -1) || (resp[0].existingTPStatus == -2)) {
            let alertMsg = "";
            let alertTitle = "";
            if (resp[0].existingTPStatus >= 7) {
              alertTitle = "Already Initialized";
              alertMsg = 'This study <strong class="text-primary"> ' + this.VisitIDWithDashes + ' : ' + this.TPName + '</strong> has already been initialized. Your action cannot be performed.';
            } else if (resp[0].existingTPStatus == -1) {
              alertTitle = "Already Cancelled";
              alertMsg = 'This study <strong class="text-primary"> ' + this.VisitIDWithDashes + ' : ' + this.TPName + '</strong> has already been Cancelled. Your action cannot be performed.';
            } else if (resp[0].existingTPStatus == -2) {
              alertTitle = "Requested For Cancellation";
              alertMsg = 'This study <strong class="text-primary"> ' + this.VisitIDWithDashes + ' : ' + this.TPName + '</strong> has sent for cancellation. Your action cannot be performed.';
            } else {
              alertMsg = 'Somthing went wrong and your action cannot be performed.';
            }
            // this.toastr.error("This study has already been INITIALIZED by the doctor. Your action cannot be performed.","Already Initialized"); 
            Swal.fire({
              title: alertTitle, //'Already Initialized',
              // text: 'This study has already been initialized. Your action cannot be performed.',
              html: alertMsg, //'This study <strong class="text-primary"> ' +this.VisitIDWithDashes+' : '+ this.TPName + '</strong> has already been initialized. Your action cannot be performed.',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: '<i class="fas fa-check"></i> OK',
              cancelButtonText: '<i class="fas fa-times"></i> Close',
              customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger',
              },
            }).then((result) => {
              if (result.isConfirmed) {
                Swal.close();
                //this.appPopupService.closeModal(this.userVerificationModal);
                this.isStatusChanged.emit(2)
              }
              // else {
              //   Swal.close();
              //   // Handle the Cancel button click here (if needed)
              // }
            });

            return
          }

          this.isClearTechnicianHistoryField = true;
          // for now we are going to save tech history as visit remarks to show to the doctor on reporting because there is no separate table of any place to save , they handling in visit remarks
          if (this.TechnicianHistory != "") {
            this.saveTechHisoryAsRemarks({
              VisitId: Number(this.VisitId),
              ModuleName: 'Tech Form',
              Remarks: 'Tech History: ' + this.TechnicianHistory,
              Priority: 1,
              UserId: this.loggedInUser.userid,
            })
          }
          if (this.isMedicalExamine && this.myResStatus == 5) {
            this.saveTechHisoryAsRemarks({
              VisitId: Number(this.VisitId),
              ModuleName: 'Tech Form',
              Remarks: 'Study for medical examination. The report must be ensured according to the medical fitness criteria.',
              Priority: 1,
              UserId: this.loggedInUser.userid,
            })
          }
          this.toastr.success(data.Message);
          if (this.RISStatusID == 7) {
            this.isStatusChanged.emit(2)
          } else {
            this.isStatusChanged.emit(1)
          }
          if (this.RISStatusID != 3)
            this.appPopupService.closeModal("technicianModal");
          this.getTechnicianHistory();
          this.isDoneTechHistory = 1;
          this.multiApp.biomatricData = null;
        } else {
          this.toastr.error('Error occured while saving tech history!')
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  objJson = []
  isStartStopTimeSaved = false;
  isDisabledMachineModalityDropdown = false;
  RadiologistID = null;
  PatientInstruction = "NA";
  PendCheckInRemarksToShow = null;
  PendCheckInBy = null;
  getTechnicianHistory() {
    const params = {
      TPID: this.TPID,
      VisitID: Number(this.VisitId),
      RISWorkListID: this.RISWorkListID
    };
    // console.log("params are getTechnicianHistory",params)
    this.techSrv.getTechnicianHistory(params).subscribe((res: any) => {
      // console.log("checkin resp-2 getTechnicianHistory",res)
      if (res.StatusCode == 200) {
        const technicianHitory = res.PayLoad[0] || [];
        // console.log("technician history is_______________", technicianHitory)
        this.TechnicianHistory = technicianHitory.TechnicianHistory || '';
        this.machineStartTime = technicianHitory.MachineStartTime;
        this.machineStopTime = technicianHitory.MachineStopTime;
        this.RadiologistID = technicianHitory.RadiologistID;
        this.PatientInstruction = (technicianHitory.PatientInstruction != '' || !technicianHitory.PatientInstruction) ? technicianHitory.PatientInstruction : 'NA';
        this.PendCheckInRemarksToShow = technicianHitory.PendCheckInRemarks || null;
        this.PendCheckInBy = technicianHitory.PendCheckInBy || null;
        if (technicianHitory.MachineModalityID) {
          this.MachineModalityID = technicianHitory.MachineModalityID;
          this.isDisabledMachineModalityDropdown = true;
        } else if (!technicianHitory.MachineModalityID && (this.modalities.length && this.modalities.length == 1)) {
          this.MachineModalityID = this.modalities[0].MachineModalityID;
          this.isDisabledMachineModalityDropdown = true;
        } else {
          this.isDisabledMachineModalityDropdown = false;
          this.MachineModalityID = "";
        }
        // 1
        // var a = moment(technicianHitory.MachineStopTime);//now
        // var b = moment(technicianHitory.MachineStartTime);

        // console.log('technicianHitory.MachineStartTime: ',technicianHitory.MachineStartTime) // 
        // console.log('technicianHitory.MachineStopTime: ',technicianHitory.MachineStopTime) // 
        // console.log(a.diff(b, 'seconds')) // 
        // console.log(a.diff(b, 'minutes')) // 
        // console.log(a.diff(b, 'hours')) //
        // console.log(a.diff(b, 'days')) // 
        // console.log(a.diff(b, 'weeks')) //

        // 2
        // let date_future:any = new Date(new Date().getFullYear() +1, 0, 1);
        // console.log("date  future is: ",date_future)
        // let date_now:any = new Date();

        // let seconds = Math.floor((date_future - (date_now))/1000);
        // let minutes = Math.floor(seconds/60);
        // let hours = Math.floor(minutes/60);
        // let days = Math.floor(hours/24);

        // hours = hours-(days*24);
        // minutes = minutes-(days*24*60)-(hours*60);
        // seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);

        // console.log("Time until new year:\nDays: " + days + " Hours: " + hours + " Minutes: " + minutes + " Seconds: " + seconds);

        // 3
        if (technicianHitory.MachineStartTime && technicianHitory.MachineStopTime) {
          this.isStartStopTimeSaved = true
          const diffTime = Math.abs(new Date(technicianHitory.MachineStopTime).valueOf() - new Date(technicianHitory.MachineStartTime).valueOf());
          let days = diffTime / (24 * 60 * 60 * 1000);
          let hours = (days % 1) * 24;
          let minutes = (hours % 1) * 60;
          let secs = (minutes % 1) * 60;
          [days, hours, minutes, secs] = [Math.floor(days), Math.floor(hours), Math.floor(minutes), Math.floor(secs)]
          this.hh = hours;
          this.mm = minutes;
          this.ss = secs;

        } else {
          this.isStartStopTimeSaved = false
        };



        // console.log(days+'d', hours+'h', minutes+'m', secs+'s');

        this.TechnicianHistory = "";//(!this.isClearTechnicianHistoryField)? technicianHitory.TechnicianHistory || "":"";
        this.objJson = technicianHitory.TechnicianHistoryJSON ? JSON.parse(technicianHitory.TechnicianHistoryJSON) : null
      }
      // else {
      //   this.toastr.error('Something went wrong! Please contact administrator');
      // }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }


  //Technician History/////////////////////////////////

  checkSubmit = false;
  isDoneCheckList = 0;
  isDoneTPInventory = 0;
  isDoneTechHistory = 0
  techCheckIn() {

    this.insertTechnicianQAnswer();
    // let checkedItems = this.TPItemsList.filter(a=>a.checked);
    // if(checkedItems.length){
    this.InsertUpdateVisitTPInventory(2);
    // }

    // console.log("isDoneCheckList: " + this.isDoneCheckList + " isDoneTPInventory: " + this.isDoneTPInventory + " isDoneTechHistory:" + this.isDoneTechHistory)
    // setTimeout(() => {
    if (true) { // this.isDoneCheckList && this.isDoneTPInventory // as we remove mandaory validation for checkin for checklist and tech history
      this.insertUpdateTechnicianWorkList();
      // this.appPopupService.closeModal("technicianModal");
      // this.isStatusChanged.emit(1)
    }
    // }, 200);


  }
  sendCommand(cmd) {
    this.multiApp.sendCommandBiomatric(cmd);
  }

  printRadioLabels = 1;
  techCheckoutVerified() { //console.log("we are in verified function: to be checkout and tech history is: ", this.TechnicianHistory); //return;
    // console.log("this.machineStartTime: ",this.machineStartTime,"  this.machineStopTime: ",this.machineStopTime);return
    // start::if risStatus not equal to 5 means checkout


    // begin::Process the services and their inventory
    // this.buttonserviceInventoryClicked = true;
    // let isValidItem = true;
    // // Create a deep copy of the RISServices array because if i dont do this then the original list is filtered in any case.
    // let servicesToFilter = JSON.parse(JSON.stringify(this.RISServices));
    // let filteredServices = [];
    // servicesToFilter.forEach((item) => {
    //   item.services = item.services.filter((service) => service.checked === true);
    //   filteredServices.push({ ...item }); // Push a copy of the item with filtered services
    // });

    // let isValid = true; // Initialize isValid to true
    // for (let item of filteredServices) {
    //   for (let service of item.services) {
    //     if (
    //       (service.DamagedQuantity > 0 && !service.Remarks) ||
    //       ((service.DamagedQuantity || 0) + service.ConsumedQuantity > service.Quantity && !service.Remarks)
    //     ) {
    //       isValid = false; // Set isValid to false if any item doesn't meet the criteria
    //       break;
    //     }
    //   }
    // }
    // if(isValid){
    //   this.updateVisitServiceStatus(filteredServices);
    // }
    // else{
    //   this.toastr.error('Remarks is mandatory for damaged or over-consumed items.', "Inventory validation Error!");
    //   isValidItem = true;
    //   return;
    // }

    // end::Process the services and their inventory

    this.checkSubmit = true;
    let isValidChecklist = false;
    this.techChecklist.forEach(a => {
      if (!a.checked && !a.Remarks) {
        isValidChecklist = true;
      }
    })
    if (isValidChecklist) {
      this.toastr.error("Please enter checklist remarks");
      this.isDoneCheckList = 0;
      return;
    } else {
      const objParam = {
        TPID: this.TPID,
        VisitID: Number(this.VisitId),
        CreatedBy: this.VerifiedUserID || -99,
        tblTechnicianQAnswer: this.techChecklist.map(a => {
          return {
            TechnicianQAnswerID: a.TechnicianQAnswerID ? a.TechnicianQAnswerID : null,
            Visit: Number(this.VisitId),
            TPID: this.TPID,
            QuestionID: a.QuestionID,
            Answer: a.checked ? 'Yes' : 'No',
            Remarks: a.Remarks
          }
        })
      }
      // console.log("objParam for tech checklist____________",objParam);return;
      // this.disabledButtonCheckin = true;
      // this.isSpinnerCheckin = false;
      this.techSrv.insertTechnicianQAnswer(objParam).subscribe((data: any) => {
        // this.disabledButtonCheckin = false;
        // this.isSpinnerCheckin = true;
        this.buttonClicked = false;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            if (this.techChecklist.length) {
              this.toastr.success(data.Message);
              // this.getVisitTPInventory();
              this.getTechnicianCheckList();
            }
            // this.disabledButtonCheckin = false;
            // this.isSpinnerCheckin = true;
            this.isDoneCheckList = 1;
            // this.closeLoginModal();
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            // this.disabledButtonCheckin = false;
            // this.isSpinnerCheckin = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonInventory = false;
        this.isSpinnerInventory = true;
      })
    }
    /////////////////////////end::techninciat checklist////////////////////////////////////////////


    /////////////////////start:: services/////////////////////////////////////
    // updateVisitTPStatusByTPIDs() {
    this.checkSubmit = false;
    const checkedItems = this.RISServices.filter(a => a.checked);
    // console.log("checkedItems___", checkedItems);
    if (checkedItems.length) {
      const TPIDs = checkedItems.map(obj => obj.TPID).join(",")
      const objParam = {
        TPIDs: TPIDs,
        VisitID: Number(this.VisitId),
        StatusID: 7,
        CreatedBy: this.VerifiedUserID || -99,
        LocID: this.RegLocId,
      }
      // console.log("objParam for tech checklist____________", objParam);//return;
      this.disabledButtonServices = true;
      this.disabledButtonCheckin = true;
      this.isSpinnerServices = false;
      this.isSpinnerCheckin = false;

      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_VISIT_TPSTATUS_BY_TPIDS, objParam).subscribe((resp: any) => {
        this.disabledButtonServices = false;
        this.disabledButtonCheckin = false;
        this.isSpinnerServices = true;
        this.isSpinnerCheckin = true;
        this.buttonClicked = false;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            this.getRISServicesByVisitID();
            this.disabledButtonServices = false;
            this.isSpinnerServices = true;
            this.isDoneServices = 1;
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButtonServices = false;
            this.isSpinnerCheckin = true;
            this.disabledButtonCheckin = false;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonServices = false;
        this.isSpinnerServices = true;
        this.disabledButtonCheckin = false;
        this.isSpinnerCheckin = true;
      })
    }
    // }
    /////////////////////end:: services//////////////////////////////////////


    const currentdate = moment().format('DD-MMM-YYYY h:mm:ss');
    let mergeObj = []
    const obj = {
      technicianHitory: this.TechnicianHistory,
      unserName: this.VerifiedUserName,
      userID: this.VerifiedUserID,
      savedOn: currentdate
    }
    if (this.objJson && this.objJson.length)
      mergeObj = this.objJson;
    mergeObj.push(obj);
    const objParam = {
      TPID: this.TPID,
      VisitID: Number(this.VisitId),
      RISWorkListID: this.RISWorkListID,
      // AppointmentID : null,
      PatientID: this.PatientID,
      RISStatusID: this.myResStatus,
      TechnicianHistory: this.TechnicianHistory,
      TechnicianHistoryJSON: JSON.stringify(mergeObj),
      LocID: this.RegLocId,
      MachineStartTime: (this.myResStatus == 7) ? null : this.machineStartTime,
      MachineStopTime: (this.myResStatus == 7) ? null : this.machineStopTime,
      MachineModalityID: this.MachineModalityID,
      RadiologistID: this.RadiologistID,
      isMedicalExamine: this.isMedicalExamine?true:false,
      CreatedBy: this.VerifiedUserID || -99
    }
    this.disabledButtonCheckout = true;
    this.disabledButtonPend = true;
    this.disabledButtonCheckin = true;
    this.isSpinnerCheckout = false;
    this.techSrv.insertUpdateTechnicianWorkList(objParam).subscribe((data: any) => {
      // console.log("Data is_______________",data); 
      this.disabledButtonCheckout = false;
      this.disabledButtonPend = false;
      this.disabledButtonCheckin = false;
      this.isSpinnerCheckout = true;
      const resp = JSON.parse(data.PayLoadStr)
      if (resp.length) {
        if (data.StatusCode == 200) {
          this.RISWorkListID = resp[0].RISWorkListID;
          // if(resp[0].existingTPStatus >=7){
          if (resp[0].existingTPStatus >= 7 || (resp[0].existingTPStatus == -1) || (resp[0].existingTPStatus == -2)) {
            let alertMsg = "";
            let alertTitle = "";
            if (resp[0].existingTPStatus >= 7) {
              alertTitle = "Already Initialized";
              alertMsg = 'This study <strong class="text-primary"> ' + this.VisitIDWithDashes + ' : ' + this.TPName + '</strong> has already been initialized. Your action cannot be performed.';
            } else if (resp[0].existingTPStatus == -1) {
              alertTitle = "Already Cancelled";
              alertMsg = 'This study <strong class="text-primary"> ' + this.VisitIDWithDashes + ' : ' + this.TPName + '</strong> has already been Cancelled. Your action cannot be performed.';
            } else if (resp[0].existingTPStatus == -2) {
              alertTitle = "Requested For Cancellation";
              alertMsg = 'This study <strong class="text-primary"> ' + this.VisitIDWithDashes + ' : ' + this.TPName + '</strong> has sent for cancellation. Your action cannot be performed.';
            } else {
              alertMsg = 'Somthing went wrong and your action cannot be performed.';
            }
            // this.toastr.error("This study has already been INITIALIZED by the doctor. Your action cannot be performed.","Already Initialized"); 
            Swal.fire({
              title: alertTitle,//'Already Initialized',
              // text: 'This study has already been initialized. Your action cannot be performed.',
              html: alertMsg,//'This study <strong class="text-primary"> ' +this.VisitIDWithDashes+' : '+ this.TPName + '</strong> has already been initialized. Your action cannot be performed.',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: '<i class="fas fa-check"></i> OK',
              cancelButtonText: '<i class="fas fa-times"></i> Close',
              customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger',
              },
            }).then((result) => {
              if (result.isConfirmed) {
                Swal.close();
                //this.appPopupService.closeModal(this.userVerificationModal);
                this.isStatusChanged.emit(2)
              }
              // else {
              //   Swal.close();
              //   // Handle the Cancel button click here (if needed)
              // }
            });

            return
          }
          // for now we are going to save tech history as visit remarks to show to the doctor on reporting because there is no separate table of any place to save , they handling in visit remarks
          if (this.TechnicianHistory != "") {
            this.saveTechHisoryAsRemarks({
              VisitId: Number(this.VisitId),
              ModuleName: 'Technician',
              Remarks: 'Tech History: ' + this.TechnicianHistory,
              Priority: 1,
              UserId: this.loggedInUser.userid,
            })
          }
          if (this.isMedicalExamine && this.myResStatus == 5) {
            this.saveTechHisoryAsRemarks({
              VisitId: Number(this.VisitId),
              ModuleName: 'Tech Form',
              Remarks: 'Study for medical examination. The report must be ensured according to the medical fitness criteria.',
              Priority: 1,
              UserId: this.loggedInUser.userid,
            })
          }
          this.toastr.success(data.Message);
          if (this.isEmergencyAssign && this.RadiologistID) {
            this.emergencyAssignTest();
          }
          // if(withOrWithoutInitial==2){
          //   this.updateVisitTPStatusForInitialization();
          // }
          this.multiApp.biomatricData = null;
          this.appPopupService.closeModal("technicianModal");
          // this.reloadCurrentPage();
          this.isStatusChanged.emit(2)
          if (this.printRadioLabels && this.myWithOrWithoutInitial == 2) {
            const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitId, TPID: this.TPID,UserLoc: this.loggedInUserLocCode, appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
            window.open(url.toString(), '_blank');
          }
        } else {
          this.toastr.error('Error occured while saving tech history!')
        }
      }
    }, (err) => {
      console.log(err);
      this.disabledButtonCheckout = false;
      this.disabledButtonPend = false;
      this.disabledButtonCheckin = false;
      this.isSpinnerCheckout = true;
      this.toastr.error('Connection error');
    })
    // end::if risStatus not equal to 5 means checkout
  }

  emergencyAssignTest() {
    const selectedDoctor = this.radoiologistList.find(dr => dr.EmpId === this.RadiologistID);
    const drFullName = selectedDoctor ? selectedDoctor.FullName : "";
    const objParam = {
      VisitId: Number(this.VisitId),
      TPID: this.TPID,
      EmpID: this.RadiologistID,
      Remarks: "This " + this.TPCode + " study was directly assigned by the technologist (" + this.VerifiedUserName + ") to " + drFullName + " as an EMERGENCY case for Initial and Review / Digital Signature!",
      CreatedBy: this.VerifiedUserID,
      LocID: this.RegLocId,
      isEmergencyAssign: this.isEmergencyAssign ? 1 : 0,
    }
    this.sharedService.insertUpdateData(API_ROUTES.EMERGENCY_ASSIGN_TEST, objParam).subscribe((resp: any) => {
      if (JSON.parse(resp.PayLoadStr).length) {
        if (resp.StatusCode == 200) {
          this.toastr.success(resp.Message);
          this.isEmergencyAssign = false;
        } else {
          this.toastr.error('Something went wrong while emergency assinging test! Please contact system support.');
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }


  myResStatus = null;
  myWithOrWithoutInitial = null;
  techCheckout(withOrWithoutInitial, risStatus) {
    this.loggedInUserLocCode = this.loggedInUser.currentLocation;
    this.buttonClicked = true;
    this.myResStatus = risStatus;
    this.myWithOrWithoutInitial = withOrWithoutInitial;
    if (this.machineStartTime && !this.machineStopTime) {
      this.toastr.warning("Please stop the machine time", "Machine Stop Time");
      return;
    }
    if (this.TechnicianHistory === "" && this.isTechHistoryRequred) {
      this.techHistoryValidityCheck = true;
      this.toastr.error("Please enter technician history remarks");
      this.isDoneTechHistory = 0;
      return;
    }

    // Will make make mandatory when fils done...
    if (!this.MachineModalityID || this.MachineModalityID == "") {
      this.techHistoryModalityCheck = true;
      this.toastr.error("Please select modality");
      return;
    }


    if (risStatus == 5) {
      const obj = {
        user: 1,
        timestamp: +new Date(),
        screen: encodeURIComponent(window.location.href)
      }
      this.sendCommand({ command: 'fmd', userIdentity: JSON.stringify(obj), useFor: "checkout" });
      this.spinner.show();
      return
    } else {
      /////////////////////////start::techninciat checklist////////////////////////////////////////////

      // start::if risStatus not equal to 5 means checkout
      this.checkSubmit = true;
      let isValidChecklist = false;
      this.techChecklist.forEach(a => {
        if (!a.checked && !a.Remarks) {
          isValidChecklist = true;
        }
      })
      if (isValidChecklist) {
        this.toastr.error("Please enter checklist remarks");
        this.isDoneCheckList = 0;
        return;
      } else {
        const objParam = {
          TPID: this.TPID,
          VisitID: Number(this.VisitId),
          CreatedBy: this.VerifiedUserID || -99,
          tblTechnicianQAnswer: this.techChecklist.map(a => {
            return {
              TechnicianQAnswerID: a.TechnicianQAnswerID ? a.TechnicianQAnswerID : null,
              Visit: Number(this.VisitId),
              TPID: this.TPID,
              QuestionID: a.QuestionID,
              Answer: a.checked ? 'Yes' : 'No',
              Remarks: a.Remarks
            }
          })
        }
        // console.log("objParam for tech checklist____________",objParam);return;
        // this.disabledButtonCheckin = true;
        // this.isSpinnerCheckin = false;

        this.techSrv.insertTechnicianQAnswer(objParam).subscribe((data: any) => {
          // this.disabledButtonCheckin = false;
          // this.isSpinnerCheckin = true;
          this.buttonClicked = false;
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              if (this.techChecklist.length) {
                this.toastr.success(data.Message);
                // this.getVisitTPInventory();
                this.getTechnicianCheckList();
              }
              this.disabledButtonCheckin = false;
              this.isSpinnerCheckin = true;
              this.isDoneCheckList = 1;
              // this.closeLoginModal();
            } else {
              this.toastr.error('Something went wrong! Please contact system support.')
              this.disabledButtonCheckin = false;
              this.isSpinnerCheckin = true;
            }
          }
        }, (err) => {
          console.log(err);
          this.toastr.error('Connection error');
          this.disabledButtonInventory = false;
          this.isSpinnerInventory = true;
        })
      }
      /////////////////////////end::techninciat checklist////////////////////////////////////////////


      const currentdate = moment().format('DD-MMM-YYYY h:mm:ss');
      let mergeObj = []
      const obj = {
        technicianHitory: this.TechnicianHistory,
        unserName: this.VerifiedUserName,
        userID: this.VerifiedUserID,
        savedOn: currentdate
      }
      if (this.objJson && this.objJson.length)
        mergeObj = this.objJson;
      mergeObj.push(obj);
      const objParam = {
        TPID: this.TPID,
        VisitID: Number(this.VisitId),
        RISWorkListID: this.RISWorkListID,
        // AppointmentID : null,
        PatientID: this.PatientID,
        RISStatusID: risStatus,
        TechnicianHistory: this.TechnicianHistory,
        TechnicianHistoryJSON: JSON.stringify(mergeObj),
        LocID: this.RegLocId,
        MachineStartTime: (risStatus == 7) ? null : this.machineStartTime,
        MachineStopTime: (risStatus == 7) ? null : this.machineStopTime,
        MachineModalityID: this.MachineModalityID,
        RadiologistID: this.RadiologistID,
        isMedicalExamine: this.isMedicalExamine?true:false,
        CreatedBy: this.VerifiedUserID || -99
      }
      // console.log("objParam for tech checklist____________",objParam);//return;
      this.disabledButtonCheckout = true;
      this.disabledButtonPend = true;
      this.disabledButtonCheckin = true;

      this.isSpinnerCheckout = false;
      this.isSpinnerCheckin = false;
      this.techSrv.insertUpdateTechnicianWorkList(objParam).subscribe((data: any) => {
        this.disabledButtonCheckout = false;
        this.disabledButtonPend = false;
        this.disabledButtonCheckin = false;
        this.isSpinnerCheckout = true;
        this.isSpinnerCheckin = true;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            // for now we are going to save tech history as visit remarks to show to the doctor on reporting because there is no separate table of any place to save , they handling in visit remarks
            if (this.TechnicianHistory != "") {
              this.saveTechHisoryAsRemarks({
                VisitId: Number(this.VisitId),
                ModuleName: 'Technician',
                Remarks: 'Tech History: ' + this.TechnicianHistory,
                Priority: 1,
                UserId: this.loggedInUser.userid,
              })
            }
            if (this.isMedicalExamine && this.myResStatus == 5) {
              this.saveTechHisoryAsRemarks({
                VisitId: Number(this.VisitId),
                ModuleName: 'Tech Form',
                Remarks: 'Study for medical examination. The report must be ensured according to the medical fitness criteria.',
                Priority: 1,
                UserId: this.loggedInUser.userid,
              })
            }
            this.toastr.success(data.Message);
            // if(withOrWithoutInitial==2){
            //   this.updateVisitTPStatusForInitialization();
            // }
            this.multiApp.biomatricData = null;
            this.appPopupService.closeModal("technicianModal");
            // this.reloadCurrentPage();
            this.isStatusChanged.emit(2)
            if (this.printRadioLabels && withOrWithoutInitial == 2) {
              const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitId, TPID: this.TPID,UserLoc: this.loggedInUserLocCode, appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
              window.open(url.toString(), '_blank');
            }
          } else {
            this.toastr.error('Error occured while saving tech history!')
          }
        }
      }, (err) => {
        console.log(err);
        this.disabledButtonCheckout = false;
        this.disabledButtonPend = false;
        this.disabledButtonCheckin = false;
        this.isSpinnerCheckout = true;
        this.isSpinnerCheckin = true;
        this.toastr.error('Connection error');
      })
      // end::if risStatus not equal to 5 means checkout
    }

  }
  // For now we are going to save tech history as visit remarks to show to the doctor on reporting because there is no separate table of any place to save , they handling in visit remarks
  // When reporting shifts to web then will remove this functionality
  saveTechHisoryAsRemarks(row) {
    const params = {
      VisitId: Number(row.VisitId),
      ModuleName: row.ModuleName,
      Remarks: row.Remarks,
      Priority: row.Priority,
      UserId: row.UserId,
    };

    this.visitRemarksService.saveVisitRemarks(params).subscribe((res: any) => {
    }, (err) => {
      console.log(err);
    });
  }

  disabledButtonCheckoutInitial = false;
  isSpinnerCheckoutInitial = true;
  disabledButtonInitial = false;
  isSpinnerInitial = true;
  isSpinnerPend = true;
  disabledButtonPend = false;
  updateVisitTPStatusForInitialization() {
    const objParam = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      StatusID: 7,
      CreatedBy: this.VerifiedUserID || -99
    }
    // console.log("objParam for tech checklist____________",objParam);//return;
    this.disabledButtonCheckoutInitial = true;
    this.isSpinnerCheckoutInitial = false;
    this.techSrv.updateVisitTPStatusForInitialization(objParam).subscribe((data: any) => {
      this.disabledButtonCheckoutInitial = false;
      this.isSpinnerCheckoutInitial = true;
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          this.toastr.success(data.Message, "Technician Initial");
          // this.appPopupService.closeModal("technicianModal");
          // this.isStatusChanged.emit(1)
        } else {
          this.toastr.error('Error occured while saving tech history!')
        }
      }
    }, (err) => {
      console.log(err);
      this.disabledButtonCheckoutInitial = false;
      this.isSpinnerCheckoutInitial = true;
      this.toastr.error('Connection error');
    })
  }


  hh = 0;
  isRunning = false;
  isStopped = false;
  timerId: any = 0;

  clickHandler() {
    if (!this.isRunning) {
      // Stop => Running
      this.timerId = setInterval(() => {
        this.ms++;
        if (this.ms >= 100) {
          this.ss++;
          this.ms = 0;
        }
        if (this.ss >= 60) {
          this.mm++;
          this.ss = 0;
        }
      }, 10);
    } else {
      clearInterval(this.timerId);
    }
    this.isRunning = !this.isRunning;
  }

  machineStartTime: any = null;
  machineStopTime: any = null;
  startTime_() {
    // this.machineStartTime = null;
    // let _startDateTimeDate = new Date();
    // this.machineStartTime = formatDate(_startDateTimeDate, 'yyyy-MM-dd H:mm:ss', 'en-US');
    // this.isRunning = true;
    // // if (!this.isRunning) {
    // // Stop => Running
    // this.timerId = setInterval(() => {
    //   this.ms++;
    //   if (this.ms >= 100) {
    //     this.ss++;
    //     this.ms = 0;
    //   }
    //   if (this.ss >= 60) {
    //     this.mm++;
    //     this.ss = 0;
    //   }
    // }, 10);
    // // } 
    // // this.isRunning = !this.isRunning;

    this.machineStartTime = null;
    const _startDateTimeDate = new Date();
    this.machineStartTime = formatDate(_startDateTimeDate, 'yyyy-MM-dd H:mm:ss', 'en-US');
    this.isRunning = true;
    this.isPageVisible = true;

    // Start the timer
    this.startTimer();
  }

  stopTime() {
    this.machineStopTime = null;
    const _machineStopTime = new Date();
    this.machineStopTime = formatDate(_machineStopTime, 'yyyy-MM-dd H:mm:ss', 'en-US');
    clearInterval(this.timerId);
    // this.isRunning=false;
    this.isStopped = true;
  }
  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  MachineModalityID = "";
  modalities = []
  getMachineModality() {
    this.techChecklist = [];
    const params = {
      LocID: this.loggedInUser.locationid, //this.RegLocId,
      TPID: this.TPID
    };
    this.techSrv.getRISMachineModalityByLocID(params).subscribe((res: any) => {
      // console.log("Modality payload is: ", res)
      if (res.StatusCode == 200) {
        this.modalities = res.PayLoad || [];
        if (this.modalities.length && this.modalities.length == 1) {
          this.MachineModalityID = this.modalities[0].MachineModalityID;
          this.isDisabledMachineModalityDropdown = true;
        }
        // else {
        //   this.MachineModalityID = "";
        // }
        // console.log("modalities list is: ", this.modalities)
      } else {
        this.modalities = [];
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.checklistSection);
      this.toastr.error('Connection error');
    })
  }

  radoiologistList = [];
  EmpId = null;
  getRadiologistInfo() {
    const params = {
      EmpID: null
    };
    this.questionnaireService.getRadiologistInfo(params).subscribe((res: any) => {
      this.radoiologistList = res.PayLoadDS['Table'] || [];
      // console.log("Radiologists are:", this.radoiologistList)
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  PendCheckInRemarks = null;
  confirmPend() {
    Swal.fire({
      title: 'Enter Remarks',
      text: 'For Pend operation remarks is required',
      // icon: 'warning',
      input: 'textarea',
      inputValidator: (value) => {
        if (!value) {
          return 'Remarks are not provided'; // This will show an error message if the input value is empty and modal will not close
        }
      },
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: '<i class="ti-back-left text-white"></i> Pend',
      cancelButtonText: '<i class="fas fa-times text-white"></i> Cancel',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'sweet-alert-confirm-btn-salmon',
        input: 'sweet-alert-text-area'
      },
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.PendCheckInRemarks = result.value;
        this.pendProcess(7)
      }
    });
  }

  pendProcess(risStatus) {
    const currentdate = moment().format('DD-MMM-YYYY h:mm:ss');
    let mergeObj = []
    const obj = {
      technicianHitory: this.TechnicianHistory,
      unserName: this.VerifiedUserName,
      userID: this.VerifiedUserID,
      savedOn: currentdate
    }
    if (this.objJson && this.objJson.length)
      mergeObj = this.objJson;
    mergeObj.push(obj);
    const objParam = {
      TPID: this.TPID,
      VisitID: Number(this.VisitId),
      RISWorkListID: this.RISWorkListID,
      // AppointmentID : null,
      PatientID: this.PatientID,
      RISStatusID: risStatus,
      TechnicianHistory: this.TechnicianHistory,
      TechnicianHistoryJSON: JSON.stringify(mergeObj),
      LocID: this.RegLocId,
      MachineStartTime: (risStatus == 7) ? null : this.machineStartTime,
      MachineStopTime: (risStatus == 7) ? null : this.machineStopTime,
      MachineModalityID: this.MachineModalityID,
      RadiologistID: this.RadiologistID,
      PendCheckInRemarks: this.PendCheckInRemarks,
      CreatedBy: this.VerifiedUserID || -99
    }
    // console.log("objParam for tech checklist____________",objParam);//return;
    this.disabledButtonPend = true;
    this.isSpinnerPend = false;
    this.techSrv.insertUpdateTechnicianWorkList(objParam).subscribe((data: any) => {
      this.disabledButtonPend = false;
      this.isSpinnerPend = true;
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          this.toastr.success("Process Pended succussfully");
          this.multiApp.biomatricData = null;
          this.isStatusChanged.emit(2)
          this.appPopupService.closeModal("technicianModal");

        } else {
          this.toastr.error('Error occured while saving tech history!')
        }
      }
    }, (err) => {
      console.log(err);
      this.disabledButtonPend = false;
      this.isSpinnerPend = true;
      this.toastr.error('Connection error');
    })
  }


  /////////////////Mark Sensitivity////////////////////////////
  ProcessID = 1;
  options = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2, disabled: true },
    { label: 'Option 3', value: 3 },
  ];
  markSensitivity_() {
    Swal.fire({
      title: 'Mark Sensitivity',
      text: 'Are you Sure want to change sensitivity?',
      // icon: 'warning',
      input: 'radio',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select any option'; // This will show an error message if the input value is empty and modal will not close
        }
      },
      inputOptions: {
        // 1: 'Normal',
        2: 'Urgent',
        3: 'Critical'
      },
      // inputValue: (row.ProcessId==1)?2:row.ProcessId,
      showCancelButton: true,
      confirmButtonText: '<i class="ti-check text-white"></i> Yes',
      cancelButtonText: '<i class="ti-close text-white"></i> No',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'sweet-alert-confirm-btn-danger',
        // input: 'sweet-alert-text-area'
      },
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.ProcessID = result.value;
        this.updateVisitTestPriority()
      }
    });
  }
  ProcessRemarks = "";
  isChkUrgent = '';
  isChkCritical = '';
  async markSensitivity() {
    (this.ProcessIDParent == 2) ? this.isChkUrgent = 'checked' : this.isChkUrgent = '';
    (this.ProcessIDParent == 3) ? this.isChkCritical = 'checked' : this.isChkCritical = '';
    const { value: formValues } = await Swal.fire({
      title: 'Mark Sensitivity',
      html:
        `<strong class="text-primary">` + this.PatientName + `: ` + this.VisitId + `-` + this.TPCode + `</strong>
        <p>Are you Sure want to change sensitivity?</p>
        <div>
          <input type="radio" id="swal-radio1" name="swal-radio" `+ this.isChkUrgent + ` value="2">
          <label for="swal2-label"><span class="swal2-label mr-4">Urgent</span></label>
          <input type="radio" id="swal-radio2" name="swal-radio" `+ this.isChkCritical + ` value="3">
          <label for="swal-radio2"><span class="swal2-label">Critical<span></label>
        </div>
        <textarea id="swal-textarea" class="form-control" placeholder="Enter Remarks"></textarea>`,
      inputValidator: (value) => {
        if (!value) {
          return 'Please select any option'; // This will show an error message if the input value is empty and modal will not close
        }
      },
      inputValue: this.ProcessID,
      showCancelButton: true,
      confirmButtonText: '<i class="ti-check text-white"></i> Yes',
      cancelButtonText: '<i class="ti-close text-white"></i> No',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'sweet-alert-confirm-btn-danger',
        input: 'custom-radio'
      },
      preConfirm: (res) => {
        const processID = (document.querySelector('input[name="swal-radio"]:checked') as HTMLInputElement)?.value;
        const processRemarks = (document.getElementById('swal-textarea') as HTMLTextAreaElement).value;
        if (!processID && processRemarks == '') {
          Swal.showValidationMessage('Please select any option and provide remarks');
        } else if (!processID) {
          Swal.showValidationMessage('Please select any option');
        } else if (processRemarks == '') {
          Swal.showValidationMessage('Please enter remarks');
        }
        else {
          return [
            (document.querySelector('input[name="swal-radio"]:checked') as HTMLInputElement)?.value,
            (document.getElementById('swal-textarea') as HTMLTextAreaElement).value,
          ]
        }

      }
    });

    if (formValues[0] && formValues[1] != '') {
      this.ProcessID = Number(formValues[0]);
      const remarksPrepend = this.ProcessID == 2 ? "Urgent Remarks for " + this.TPCode + ": " : "Critical Remarks for " + this.TPCode + ": ";
      this.ProcessRemarks = remarksPrepend + formValues[1]
      this.updateVisitTestPriority()
      this.saveVisitRemarks()
    } else {
      this.toastr.error("Something went wrong please try again!")
    }
  }

  updateVisitTestPriority() {
    const objParams = {
      TPID: this.TPID,
      VisitID: Number(this.VisitId),
      ProcessID: this.ProcessID,
      Remarks: this.ProcessRemarks.trim(),
      CreatedBy: this.VerifiedUserID
    }
    this.questionnaireService.updateVisitTestPriority(objParams).subscribe((res: any) => {
      const respons = JSON.parse(res.PayLoadStr);
      if (res.StatusCode == 200) {
        this.ProcessIDParent = this.ProcessID;
        this.toastr.success(res.Message, "Test Sensitivity");
        this.isStatusChanged.emit(1)
      }
    }, (err) => {
      console.log(err),
        this.toastr.error("Some error occured, Please contact system administrator")
    })
  }
  saveVisitRemarks() {
    const params = {
      VisitId: Number(this.VisitId),
      ModuleName: 'Technician',
      Remarks: this.ProcessRemarks.trim(),
      Priority: 1,
      UserId: this.VerifiedUserID//this.loggedInUser.userid,
    };
    if (!params.VisitId || !params.Remarks) {
      return;
    }
    this.spinner.show();
    this.visitRemarksService.saveVisitRemarks(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        this.ProcessRemarks = '';
        this.ProcessID = 1;
        this.toastr.success('Remarks saved successfully');
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
      this.toastr.error('Error Saving Remarks');
    });
  }

  loggedInUserLocCode = "F8";
  printRadioLable() {
    this.loggedInUserLocCode = this.loggedInUser.currentLocation;
    this.disabledButtonPrintLabel = true;
    this.isSpinnerPrintLabel = false;
    setTimeout(() => {
      this.disabledButtonPrintLabel = false;
      this.isSpinnerPrintLabel = true;
      if (this.TPID && this.VisitId) {
        const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitId, TPID: this.TPID, UserLoc: this.loggedInUserLocCode, appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
        window.open(url.toString(), '_blank');
      }
      else {
        this.toastr.warning("Test is not in proper stage", "Validation Error")
      }
    }, 1000);

  }

  isEmergencyAssign = false;
  openLoginForm(withOrWithoutInitial, risStatus) {
    this.myResStatus = risStatus;
    this.myWithOrWithoutInitial = withOrWithoutInitial;
    this.buttonClicked = true;
    if ((!this.MachineModalityID || this.MachineModalityID === "") && (this.TechnicianHistory === "" && this.isTechHistoryRequred)) {
      this.techHistoryModalityCheck = true;
      this.techHistoryValidityCheck = true;
      this.toastr.error("Please select modality and enter technician history remarks");
      this.isDoneTechHistory = 0;
      return;
    }

    if (!this.MachineModalityID || this.MachineModalityID === "") {
      this.techHistoryModalityCheck = true;
      this.toastr.error("Please select modality");
      return;
    }

    if (this.TechnicianHistory === "" && this.isTechHistoryRequred) {
      this.techHistoryValidityCheck = true;
      this.toastr.error("Please enter technician history remarks");
      this.isDoneTechHistory = 0;
      return;
    }

    // If both conditions pass
    this.userVerificationModalRef = this.appPopupService.openModal(
      this.userVerificationModal,
      { backdrop: 'static', size: 'md' }
    );

    // if (this.TechnicianHistory === "" && this.isTechHistoryRequred) {
    //   this.techHistoryValidityCheck = true;
    //   this.toastr.error("Please enter technician history remarks");
    //   this.isDoneTechHistory = 0;
    //   return;
    // } else {
    //   this.userVerificationModalRef = this.appPopupService.openModal(this.userVerificationModal, { backdrop: 'static', size: 'md' });
    // }

  }

  disabledButtonVerify = false; // Button Enabled / Disables [By default Enabled]
  isSpinnerVerify = true;//Hide Loader
  verifyUser() {
    // this.clearVariables();
    const formValues = this.userVerificationForm.getRawValue();
    this.userVerificationForm.markAllAsTouched();
    if (this.userVerificationForm.invalid) {
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      ///////START::VERIFY USER /////////////////////////////
      // formValues.techUsername=='john.doe' && formValues.techPassword=='freedom'
      const params = {
        UserName: formValues.techUsername,
        Password: formValues.techPassword
      }
      this.disabledButtonVerify = true;
      this.isSpinnerVerify = false;
      this.sharedService.verifyUser(params).subscribe((data: any) => {
        this.disabledButtonVerify = false;
        this.isSpinnerVerify = true;
        if (data.StatusCode == 200) {
          if (data.PayLoad && data.PayLoad.length) {
            this.VerifiedUserID = data.PayLoad[0].UserId;
            this.RegLocId = data.PayLoad[0].RegLocId;
            this.loggedInUserLocCode = data.PayLoad[0].BranchName||"F*";
            this.VerifiedUserName = data.PayLoad[0].UserName;
            this.toastr.success(data.PayLoad[0].UserName, "Verified:");
            this.userVerificationModalRef.close()
            this.userVerificationForm.patchValue({
              techUsername: "",
              techPassword: ""
            })
            this.techCheckoutVerified();
            // this.spinner.hide();

          }
          else {
            this.toastr.error("Wrong Credentials....")
          }
        } else {
          this.toastr.error(data.Message)
        }
      }, (err) => {
        console.log(err);
        this.disabledButtonVerify = false;
        this.isSpinnerVerify = true;
      });
      ///////END::  VERIFY USER /////////////////////////////


    }
  }

  showPassword = false;
  isInputFocused = false;

  // start:: RIS Services////////////////////////////////////////////
  RISServices = []
  getRISServicesByVisitID() {
    this.RISServices = [];
    const params = {
      VisitID: this.VisitId,
      TPId: this.TPID
    };
    this.spinner.show(this.spinnerRefs.RISServicesSection);
    this.sharedService.getData(API_ROUTES.GET_RISSERVICES_BY_VISITID, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.RISServicesSection);
      // console.log("RISServices payload is: ", res)
      if (res.StatusCode == 200) {
        // this.RISServices = res.PayLoad || [];
        const services = res.PayLoad || [];

        const result = services.reduce((re, o) => {
          // Check if group already exists for this TPID
          const existObj = re.find(obj => obj.TPID === o.TPId);

          if (existObj) {
            // Push service item only if TPInventoryID exists (non-null)
            if (o.TPInventoryID !== null) {
              existObj.services.push({
                StoreItemID: o.StoreItemID,
                Quantity: o.Quantity,
                ConsumedQuantity: o.Quantity,
                StoreItem: o.StoreItem,
                checked: true // Sir Abdul Sattar make it true to auto process the services on checkout. and it may be reversed in the future.
                // ,MeasurintUnit: o.MeasurintUnit
              });
            }
          } else {
            // Create new TP group
            const groupObj: any = {
              TPID: o.TPId,
              TPCode: o.TPCode,
              TPName: o.TPName,
              StatusID: o.StatusId,
              RISStatusID: o.RISStatusID,
              checked: true, // Sir Abdul Sattar make it true to auto process the services on checkout. and it may be reversed in the future.
              services: []
            };

            // If TPInventoryID exists, push the item
            if (o.TPInventoryID !== null) {
              groupObj.services.push({
                StoreItemID: o.StoreItemID,
                Quantity: o.Quantity,
                ConsumedQuantity: o.Quantity,
                StoreItem: o.StoreItem,
                checked: true // Sir Abdul Sattar make it true to auto process the services on checkout. and it may be reversed in the future.
                // ,MeasurintUnit: o.MeasurintUnit
              });
            }

            re.push(groupObj);
          }

          return re;
        }, []);

        // If a group has all items with null TPInventoryID, its services array will remain empty
        this.RISServices = result;

        // console.log("RISServices_____", this.RISServices);

      } else {
        this.RISServices = [];
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.RISServicesSection);
      this.toastr.error('Connection error');
    })
  }

  selectAllServices(e) {
    this.RISServices.forEach(a => {
      a.checked = false;
      if (a.TPID > 0) {
        a.checked = e.target.checked;
      }
    })
  }

  disabledButtonServices = false;
  isSpinnerServices = true;
  isDoneServices
  updateVisitTPStatusByTPIDs() {
    this.checkSubmit = false;
    const checkedItems = this.RISServices.filter(a => a.checked);
    // console.log("checkedItems___", checkedItems);
    if (!checkedItems.length) {
      this.toastr.warning("Please select any service to proceed!")
    } else {
      const TPIDs = checkedItems.map(obj => obj.TPID).join(",")
      const objParam = {
        TPIDs: TPIDs,
        VisitID: Number(this.VisitId),
        StatusID: 7,
        CreatedBy: this.VerifiedUserID || -99,
        LocID: this.RegLocId,
      }
      // console.log("objParam for tech checklist____________", objParam);//return;
      this.disabledButtonServices = true;
      this.isSpinnerServices = false;
      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_VISIT_TPSTATUS_BY_TPIDS, objParam).subscribe((resp: any) => {
        this.disabledButtonServices = false;
        this.isSpinnerServices = true;
        this.buttonClicked = false;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            this.getRISServicesByVisitID();
            this.disabledButtonServices = false;
            this.isSpinnerServices = true;
            this.isDoneServices = 1;
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButtonServices = false;
            this.isSpinnerCheckin = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonServices = false;
        this.isSpinnerServices = true;
      })
    }
  }

  printRadioLableLineItem(tpid) {
    this.loggedInUserLocCode = this.loggedInUser.currentLocation;
    
    // console.log("VisitID :", this.VisitId, " TPID: ", tpid)
    const TPID = tpid;
    setTimeout(() => {
      if (TPID && this.VisitId) {
        const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitId, TPID: TPID, UserLoc: this.loggedInUserLocCode,appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
        window.open(url.toString(), '_blank');
      }
      else {
        this.toastr.warning("Test is not in proper stage", "Validation Error")
      }
    }, 200);

  }

  checkValidationForServiceInventory(data) {
    const filteredServicesdata = data;
    let isValid = true; // Initialize isValid to true
    for (const item of filteredServicesdata) {
      for (const service of item.services) {
        if (
          (service.DamagedQuantity > 0 && !service.Remarks) ||
          ((service.DamagedQuantity || 0) + service.ConsumedQuantity > service.Quantity && !service.Remarks)
        ) {
          isValid = false; // Set isValid to false if any item doesn't meet the criteria
          break;
        }
      }
    }
    return isValid; // Return the final validation result after checking all items
  }

  insertServiceInventory(data) {
    const filteredServices = data;
    // Initialize the tblVisitTPInventory array
    const tblVisitTPInventory = [];
    for (const item of filteredServices) {
      for (const service of item.services) {
        if (service.checked) {
          // Create an entry for each checked service
          const visitTPInventory = {
            VisitTPInventoryID: item.VisitTPInventoryID || null,
            Visit: Number(this.VisitId),
            TPID: item.TPID,
            StatusID: 7,//item.StatusID, 7 for inventory against initialization
            RISStatusID: item.RISStatusID,
            StoreItemID: service.StoreItemID,
            ConsumedQuantity: service.ConsumedQuantity,
            DamagedQuantity: service.DamagedQuantity,
            Remarks: service.Remarks,
          };
          tblVisitTPInventory.push(visitTPInventory);
        }
      }
    }

    // Create the objParam with the tblVisitTPInventory array and insert
    const objParam = {
      TPID: this.TPID,
      VisitID: Number(this.VisitId),
      CreatedBy: this.VerifiedUserID || -99,
      tblVisitTPInventory: tblVisitTPInventory,
    };

    //  this.disabledButtonInventory = true;
    //  this.isSpinnerInventory = false;
    this.techSrv.InsertUpdateVisitTPInventory(objParam).subscribe((data: any) => {
      this.disabledButtonInventory = false;
      this.isSpinnerInventory = true;
      this.buttonClicked = false;
      this.isSpinnerInventory = true;
      this.buttonserviceInventoryClicked = false;
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          this.toastr.success(data.Message);
          this.disabledButtonInventory = false;
          this.isSpinnerInventory = true;
          // this.getVisitTPInventory()
          this.getRISServicesByVisitID();
          this.isSpinnerInventory = true;
          this.buttonClicked = false;
          // this.closeLoginModal();
          this.isDoneTPInventory = 1;
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          this.disabledButton = false;
          this.isSpinner = true;
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.disabledButtonInventory = false;
      this.isSpinnerInventory = true;
    })
    this.buttonserviceInventoryClicked = false;
  }

  updateVisitServiceStatus(data) {
    const filteredServices = data
    const TPIDs = filteredServices.map(item => item.TPID).join(',');
    const obj = {
      TPIDs: TPIDs,
      VisitID: Number(this.VisitId),
      StatusID: 7,
      CreatedBy: this.VerifiedUserID || -99,
      LocID: this.RegLocId,
    }
    this.disabledButtonServices = true;
    this.isSpinnerServices = false;
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_VISIT_TPSTATUS_BY_TPIDS, obj).subscribe((resp: any) => {
      // this.disabledButtonServices = false;
      // this.isSpinnerServices = true;
      // this.buttonClicked = false;
      if (JSON.parse(resp.PayLoadStr).length) {
        if (resp.StatusCode == 200) {
          this.disabledButtonServices = false;
          this.isSpinnerServices = true;
          this.toastr.success(resp.Message);
          /////////////////////////now insert inventory//////////////////////////////

          //  this.insertServiceInventory(filteredServices)
          if (filteredServices.services && filteredServices.services.length) {
            // console.log("VALIDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
            this.insertServiceInventory(filteredServices)
          } else {
            this.getRISServicesByVisitID();
            this.disabledButtonServices = false;
            this.isSpinnerServices = true;
            this.isSpinnerInventory = true;
            this.disabledButtonInventory = false;
            this.buttonserviceInventoryClicked = false;
          }

          /////////////////////////end insert inventory//////////////////////////////
          // this.disabledButtonServices = false;
          // this.isSpinnerServices = true;
          // this.isDoneServices = 1;
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          this.disabledButtonServices = false;
          this.isSpinnerCheckin = true;
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.disabledButtonServices = false;
      this.isSpinnerServices = true;
    })
  }


  buttonserviceInventoryClicked = false;
  insertUpdateVisitTPServiceInventory() {
    this.buttonserviceInventoryClicked = true;
    let isValidItem = true;
    // Create a deep copy of the RISServices array because if i dont do this then the original list is filtered in any case.
    const srv = this.RISServices.filter((service) => service.checked === true);
    if (!srv.length) {
      this.toastr.warning("Please select any service to serve!", "No Service selected!");
      return;
    }
    let isValidateData = true;
    for (const item of srv) {
      if (!item.services || item.services.length === 0) {
        // Condition 1: No child array for services
        isValidateData = true;
      } else if (item.services.every(service => service.StoreItemID === null)) {
        // Condition 2: All objects in services array have StoreItemID = null
        isValidateData = true;
        // item.services.some(service => service.StoreItemID !== null && !service.checked)
      } else if (item.services.some(service => service.StoreItemID !== null && service.checked)) {
        // Condition 3: At least one object in services array has StoreItemID not equal to null and checked = false
        isValidateData = true;
        break; // Stop further execution if isValidateData is false
      } else {
        // Condition 4: Default case
        isValidateData = false;
      }
    }
    if (!isValidateData) {
      this.toastr.error("Please select any item against checked service/s to counsume", "No inventory selected!");
      return;
    }
    const servicesToFilter = JSON.parse(JSON.stringify(srv));
    const filteredServices = [];
    servicesToFilter.forEach((item) => {
      item.services = item.services.filter((service) => service.checked === true);
      filteredServices.push({ ...item }); // Push a copy of the item with filtered services
    });
    isValidItem = this.checkValidationForServiceInventory(filteredServices)
    // Continue with the action if all items are valid
    setTimeout(() => {
      if (isValidItem) {
        this.updateVisitServiceStatus(filteredServices);
        // this.toastr.success('Everything is ready_____', "Inventory validation Success!");
      } else {
        this.toastr.error('Remarks is mandatory for damaged or over-consumed items.', "Inventory validation Error!");
        isValidItem = true;
        return;
      }
      // console.log("filteredServices_________",filteredServices)
    }, 200);


  }
  showServiceSection = true;
  toggleServiceSection() {
    this.showServiceSection = !this.showServiceSection;
  }
  // end:: RIS Services////////////////////////////////////////////

  toggleChildCheckboxes(profile: any) {
    return; // Sir Abdul Sattar make it true to auto process the services on checkout. and it may be reversed in the future.
    if (profile.services && profile.services.length > 0) {
      profile.services.forEach((service: any) => {
        service.checked = profile.checked;
      });
    }
  }



  openConfirmationPopover(event: any) {
    event.preventDefault();
    this.pendingCheckState = !this.isMetalChecked;
    this.checkboxEvent = event;
  }

  confirmSelection() {
    if (this.pendingCheckState !== null) {
      this.isMetalChecked = this.pendingCheckState;
    }
    this.metalDetected(this.checkboxEvent);
    this.pendingCheckState = null;
  }

  cancelSelection() {
    this.pendingCheckState = null;
  }

  metalDetected(event) {
    // console.log("🚀 ~ metalDetected ~ event:", event)

    const params = {
      PatientID: this.PatientID,
      isMetal: this.isMetalChecked ? 1 : 0,  // 1 for is Metal, 0 for not isMetal
      ModifiedBy: this.loggedInUser.userid,  //logged in User
    };
    // console.log("🚀 ~ MoQuestionnaireComponent ~ metalDetected ~ event:", params);
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_PATIENT_ISMETAL, params).subscribe(
      (resp: any) => {
        if (resp.StatusCode === 200) {
          if (resp.PayLoad[0].Result === 1) {
            this.toastr.success(resp.Message);
            this.isMetal = true;
          }
          else {
            this.toastr.error(resp.Message);
          }
        }
        else {
          this.toastr.error(resp.Message);
        }
      },
      (err) => {
        console.log("Error:", err);
      }
    );
  }
  // isDocFieldDisable = true;
  isDocFieldDisable = false;
  onChangeIsEmergencyCheckbox(event) {
    // console.log("🚀event:", event)
    // event.checked == true ? this.isDocFieldDisable = false : this.isDocFieldDisable = true;
  }

}
