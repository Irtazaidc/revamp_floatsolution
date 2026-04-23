// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription, interval } from 'rxjs';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { PrintReportService } from 'src/app/modules/print-reports/services/print-report.service';
import { VisitRemarksService } from 'src/app/modules/remarks/services/visit-remarks.service';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { RisWorklistService } from 'src/app/modules/ris/services/ris-worklist.service';
import { TechnicianService } from 'src/app/modules/ris/services/technician.service';
import { VitalsService } from 'src/app/modules/ris/services/vitals.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { StorageService } from 'src/app/modules/shared/helpers/storage.service';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  standalone: false,

  selector: 'app-queue-manager-worklist',
  templateUrl: './queue-manager-worklist.component.html',
  styleUrls: ['./queue-manager-worklist.component.scss']
})
export class QueueManagerWorklistComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  private refreshSubscription: Subscription;
  @Input() paramsValuesForWorkList: any;
  @Input() colNamesForMOScreen = [];
  @Input() actionsPermission: any = [];
  @Input() isStatusChanged: any = [];
  @Input() isSaved: any = [];
  @Output() paramFormHeaderInfo = new EventEmitter<any>();
  @Output() selectedValueChange = new EventEmitter<any>();
  @ViewChild('questionnaireModal') questionnaireModal;
  @ViewChild('visitTPDetailModal') visitTPDetailModal;
  @ViewChild('moInterventionAlertPopupForTech') moInterventionAlertPopupForTech;
  @ViewChild('moHistoryModal') moHistoryModal;
  @ViewChild('vitalsModal') vitals;
  @ViewChild('emrModal') emrModal;

  @ViewChild('technicianModal') technicianModal;
  @ViewChild('userVerificationModal') userVerificationModal;
  @ViewChild('modalitiesModal') modalitiesModal;
  @ViewChild('reportingModal') reportingModal;
  @ViewChild('detailArea') detailArea: ElementRef;
  @ViewChild('emergencyAssignerModal') emergencyAssignerModal;
  buttonControlsPermissions = {

  }
  modalities = [
    { ModalityID: 1, ModalityName: "Mindray", ModalityCode: "MD" },
    { ModalityID: 2, ModalityName: "Alinity", ModalityCode: "ALT" }
  ]
  risWorkist: any = [];
  params: { VisitID: any; BranchIDs: any; FilterBy: any; DateFrom: any; DateTo: any; };
  orignaRisList: any = [];
  visitInfo: any = {};
  PatientPhoneNumber: any = "";
  screenIdentity = null; //1 for MO Worklist, 2 for Tech Worklist
  disabledButtonVerify = false; // Button Enabled / Disables [By default Enabled]
  isSpinnerVerify = true;//Hide Loader

  techUsername = ""; //john.doe;
  techPassword = ""; //freedom;
  userVerificationForm = this.fb.group({
    techUsername: ['', Validators.compose([Validators.required])],
    techPassword: ['', Validators.compose([Validators.required])]
  });


  confirmationPopoverConfigCloseModal = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: '<span class="text-danger">Are you <strong>sure</strong> want to close? <span>', // 'Are you sure?',
    popoverMessage: 'All <strong>Unsaved data</strong> will be <strong>Discarded</strong>',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  loggedInUser: UserModel;

  sub: Subscription;
  count = 0;
  currow: any;
  constructor(
    private lookupSrv: LookupService,
    private worklistSrv: RisWorklistService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private vitalsSrv: VitalsService,
    private multiApp: MultiAppService,
    private questionnaireSrv: QuestionnaireService,
    private helper: HelperService,
    private techSrv: TechnicianService,
    private visitRemarksService: VisitRemarksService,
    private auth: AuthService,
    private storageService: StorageService,
    private printRptService: PrintReportService
  ) { }
  EmpID = null;
  InitByEmpID = null;
  DSByEmpID = null;
  isSavedVitals = null;
  pageRefreshTime = 120000 //300000; //300000 //5 minutes  600000 // 10 minutes, 120000 for two minutes

  private fetchData(): void {
    this.getRisworkList(this.paramsValuesForWorkList);
    if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
      this.getRISWorkListSummary(this.paramsValuesForWorkList);
  }

  branchList = [];
  moduleScreenName = 'MO Worklist'
  ngOnInit(): void {
    this.loadLoggedInUserInfo();

    // SUBSECTIONS & BRANCHES///////////
    // this.subSectionList = [];
    // let objParam = {
    //   SectionID: -1,
    //   LabDeptID: 2
    // }
    // this.sharedService.getData(API_ROUTES.LOOKUP_GET_SUBSECTION_SECTIONID, objParam).subscribe((resp: any) => {
    //   let _response = resp.PayLoad;
    //   this.subSectionList = _response;
    //   console.log("SECTIONNNNNNNNNNNNNNNNNNNNNNS: ",this.subSectionList)
    // }, (err) => {
    //   this.toastr.error('Connection error');
    // })
    // let param = {
    //   UserID: this.loggedInUser.userid
    // }
    // this.lookupSrv.getAllLocationByUserID(param).subscribe((resp: any) => {
    //   if (resp.PayLoad) {
    //     this.branchList = resp.PayLoad;
    //     console.log("BRANCHES: ",this.branchList)
    //   }
    // }, (err) => { console.log(err) })

    // SUBSECTIONS & BRANCHES///////////

    this.screenIdentity = this.route.routeConfig.path;
    switch (this.screenIdentity) {
      case 'mo-worklist':
        this.moduleScreenName = 'MO Worklist';
        break;
      case 'tech-worklist':
        this.moduleScreenName = 'Tech Worklist';
        break;
      case 'queue-management':
        this.moduleScreenName = 'Queue Mgt';
        break;
      case 'assign-bulk-test':
        this.moduleScreenName = 'Assign Bulk Test';
        break;
      case 'reporting-worklist':
        this.moduleScreenName = 'Reporting Worklist';
        break;

      case 'queue-manager':
        this.moduleScreenName = 'Queue Manager';
        break;
      case 'bulk-queue-manager':
        this.moduleScreenName = 'Bulk Queue Manager';
        break;
      case 'reporting-v2':
        this.moduleScreenName = 'Reporting Worklist';
        break;
      default:
        this.moduleScreenName = 'MO Worklist';
    }

    if (this.screenIdentity == 'tech-worklist') {
      if (!localStorage.getItem('reloaded')) {
        localStorage.setItem('reloaded', 'true');
        localStorage.setItem('reloadedSrv', '');
        location.reload();
      }
    }

    this.newsSubscription = interval(10000).subscribe(() => {
      this.showUrdu = !this.showUrdu;
    });
    this.multiApp.connectToMultiApp();
    this.subscribeForMultiAppStatus();

    this.isSavedVitals = this.isSaved;
    // console.log("paramsValuesForWorkList in ngonit", this.paramsValuesForWorkList);
    this.getRadiologistInfo(null);
    //Clear Variables data
    // this.clearVariables(0);
    //Clear Variables data

    if (this.screenIdentity == 'queue-management' || this.screenIdentity == 'queue-manager')
      this.isAssigner = true;
    else
      this.isAssigner = false;
    this.reEvaluateButtonsPermissions();
    this.searchFormInfoObj = {
      formHeaderBGClass: 'bg-primary',
      formHeaderText: "MO Pending List"
    }
    this.paramFormHeaderInfo.emit(this.searchFormInfoObj);
    this.getRisworkList(this.paramsValuesForWorkList);
    // if (!this.paramsValuesForWorkList.visitID)
    if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
      this.getRISWorkListSummary(this.paramsValuesForWorkList);
    if (this.screenIdentity == 'tech-worklist' || this.screenIdentity == 'mo-worklist') {
      this.refreshSubscription = interval(this.pageRefreshTime).subscribe(() => {
        this.fetchData();
      });
    }

    // console.log("noticeBoardStyle is",this.noticeBoardStyle);
    this.noticeBoardStyle = this.paramsValuesForWorkList.visitID ? this.paramsValuesForWorkList.noticeBoardStyle = "bg-purple" : this.screenIdentity == "mo-worklist" ? this.paramsValuesForWorkList.noticeBoardStyle = "bg-primary" : this.screenIdentity == "tech-worklist" ? this.paramsValuesForWorkList.noticeBoardStyle = "bg-success" : this.paramsValuesForWorkList.noticeBoardStyle = "bg-warning";
    // this.testSummaryInfoHeader = 
    // this.paramsValuesForWorkList.visitID 
    // ? this.paramsValuesForWorkList.testSummaryInfoHeader = "All Tests" 
    // : this.screenIdentity == "mo-worklist" 
    // ? this.paramsValuesForWorkList.testSummaryInfoHeader = "Registered Tests" 
    // : this.screenIdentity == "tech-worklist" 
    // ? this.paramsValuesForWorkList.testSummaryInfoHeader = "Checkin Worklist" 
    // : this.paramsValuesForWorkList.testSummaryInfoHeader = "Queue Management";

    this.testSummaryInfoHeader =
      this.paramsValuesForWorkList.visitID
        ? "All Tests" : this.screenIdentity === "mo-worklist"
          ? "Registered Tests" : this.screenIdentity === "tech-worklist"
            ? "Checkin Worklist" : this.screenIdentity === "reporting-worklist"
              ? "Assigned Tests" : "Queue Management";

    if (this.multiApp.biomatricData) {
      this.sub = this.multiApp.biomatricData.subscribe((resp: any) => {
        console.log("respons back from multi app server is_______________________ngOnInit", resp);
        if (resp) {
          this.spinner.hide();
        }
        setTimeout(() => {
          this.count = 0;
          if (resp && resp.userIdentity && resp.userIdentity != 0) {
            if (resp.userIdentity == -99) {
              this.toastr.warning("The device is not connected or closed, so please log in with your credentials.", "Device Connection Error")
              this.appPopupService.openModal(this.userVerificationModal, { backdrop: 'static', size: 'md' });
            } else {
              const data = this.multiApp.getTDate();
              this.TPId = data.value.TPId;
              this.VisitID = data.value.VisitNo.replaceAll("-", "");
              this.VisitIDWithDashes = data.value.VisitNo;
              this.TPCode = data.value.TPCode;
              this.TPName = data.value.TPName;
              this.PatientName = data.value.PatientName;
              this.PatientId = data.value.PatientId;
              this.RISStatusID = data.value.RISStatusID;
              this.PatientPhoneNumber = data.value.PhoneNumber;
              this.RISWorkListID = data.value.RISWorkListID;
              this.MOBy = data.value.MOBy;
              this.ProcessIDParent = data.value.ProcessId;
              this.WorkflowStatus = data.value["Workflow Status"];
              this.RegistrationDate = moment(data.value.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
              this.DeliveryDate = moment(data.value.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
              this.isConsentRead = data.value.isConsentRead;
              this.isTechHistoryRequred = data.value.isTechHistoryRequred;
              this.VerifiedUserID = (resp && resp.userIdentity) ? resp.userIdentity : null;
              this.VerifiedUserName = (resp && resp.UserName) ? resp.UserName : null;
              this.RegLocId = (resp && resp.RegLocId) ? resp.RegLocId : null;
              this.toastr.success(this.VerifiedUserName, "Verified:");
              this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
              this.getVitals()
              this.spinner.hide();

              if (!this.isConsentRead && this.MOBy) {
                this.isTechDisclaimer = true;
                this.openMOHistoryForTechAgreement()
              } else {
                if (!this.RISWorkListID || (this.RISWorkListID && this.RISStatusID == 2)) {
                  this.insertUpdateTechnicianWorkList();
                }
                setTimeout(() => {
                  this.appPopupService.openModal(this.technicianModal, { size: 'fsl' });
                }, 500);
              }
            }

          }
          // else{
          //   this.spinner.hide();
          //   this.toastr.error("Web Disc Connection has problem")
          // }
        }, 300);
      });
    }

    this.getSubSection();
    setTimeout(() => {
      if (!this.multiAppConnectionStatus) {
        this.toastr.warning("WebDesk App is not installed OR Not Connected, tech with thumb will not be performed, You can use your credentials instead.", "WebDesk App Error!")
      }
    }, 1000);
  }

  multiAppConnectionStatus = false;
  subscribeForMultiAppStatus() {
    this.multiApp.multiAppConnectionStatus.subscribe((status) => {
      this.multiAppConnectionStatus = status;
      setTimeout(() => {
        this.cd.detectChanges();
      }, 100);
    })
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ngOnDestroy() {
    this.newsSubscription.unsubscribe();
    this.multiApp.biomatricData = null;
    // this.clearVariables(0);
    // this.currow = null;
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  screenIdentityngOnchages = null;
  ngOnChanges(changes: SimpleChanges) {
    this.loadLoggedInUserInfo();
    // this.sub = this.multiApp.biomatricData.subscribe((resp: any) => {
    //   console.log("respons back from multi app server is_______________________ngOnChanges", resp);
    //   setTimeout(() => {
    //     if (resp) {
    //       this.spinner.hide();
    //     }
    //     if (resp && resp.userIdentity && resp.userIdentity != 0) {
    //       this.VerifiedUserID = (resp && resp.userIdentity) ? resp.userIdentity : null;
    //       this.VerifiedUserName = (resp && resp.UserName) ? resp.UserName : null;
    //       this.RegLocId = (resp && resp.RegLocId) ? resp.RegLocId : null;
    //       this.toastr.success(this.VerifiedUserName, "Verified:");
    //       this.spinner.hide();
    //     }
    //   }, 200);
    // });
    this.screenIdentityngOnchages = this.route.routeConfig.path;
    if ((this.screenIdentityngOnchages != 'queue-management' || this.screenIdentity != 'queue-manager') && this.screenIdentityngOnchages != 'bulk-queue-manager') {
      // setTimeout(() => {
      this.getRisworkList(this.paramsValuesForWorkList);
      // }, 200);
    }

  }

  ngAfterViewInit() { }


  dblClick = false;
  cmdchk = false;
  WorkflowStatus = null;
  TranscribedBy = null;
  verifyUserBiomateric(row, index) {
    this.WorkflowStatus = row["Workflow Status"]
    this.isTechDisclaimer = false;
    // console.log("mo-row", row);
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.currow = row;
    this.multiApp.setTData(row);
    // this.count = this.count + 1;
    if (this.screenIdentity == 'mo-worklist') {
      if (!row.isMedicalOfficerIntervention) {
        this.toastr.warning("MO Intervention is not set for the test " + row.TPName + "", "MO Intervention");
        return;
      }
      this.VerifiedUserID = null;
      this.rowIndex = index;
      this.TPId = row.TPId;
      this.VisitID = row.VisitNo.replaceAll("-", "");
      this.TPCode = row.TPCode;
      this.TPName = row.TPName;
      this.PatientName = row.PatientName;
      this.PatientId = row.PatientId;
      this.RISStatusID = row.RISStatusID;
      this.PatientPhoneNumber = row.PhoneNumber;
      this.RISWorkListID = row.RISWorkListID;
      this.MOBy = row.MOBy;
      this.ProcessIDParent = row.ProcessId;
      this.isConsentRead = row.isConsentRead;
      this.isTechHistoryRequred = row.isTechHistoryRequred;
      this.VisitIDWithDashes = row.VisitNo;
      this.TestStatus = row.TestStatus;
      this.StatusId = row.StatusId;
      this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
      this.getVitals();
      setTimeout(() => {
        this.appPopupService.openModal(this.questionnaireModal, { backdrop: 'static', size: 'fss' });
      }, 200);
    } else if (this.screenIdentity == 'queue-management' || this.screenIdentity == 'queue-manager') {
      this.isTechDisclaimer = false;
      if (row.MOBy)
        this.openMOHistory(row);
      else this.toastr.warning("MO history not done...", "No MO history")
    }
    else if (this.screenIdentity == 'tech-worklist') {
      this.isTechDisclaimer = true;
      this.VerifiedUserID = null;
      this.rowIndex = index;
      this.TPId = row.TPId;
      this.VisitID = row.VisitNo.replaceAll("-", "");
      this.VisitIDWithDashes = row.VisitNo;
      this.TPCode = row.TPCode;
      this.TPName = row.TPName;
      this.PatientName = row.PatientName;
      this.PatientId = row.PatientId;
      this.RISStatusID = row.RISStatusID;
      this.PatientPhoneNumber = row.PhoneNumber;
      this.RISWorkListID = row.RISWorkListID;
      this.MOBy = row.MOBy;
      this.ProcessIDParent = row.ProcessId;
      this.isConsentRead = row.isConsentRead;
      this.isMedicalOfficerIntervention = row.isMedicalOfficerIntervention;
      this.isTechHistoryRequred = row.isTechHistoryRequred;
      this.WorkflowStatus = row["Workflow Status"];
      this.TestStatus = row.TestStatus;
      this.StatusId = row.StatusId;
      if (this.isMedicalOfficerIntervention && !this.MOBy && this.RISStatusID < 3) {
        this.toastr.warning("For the " + this.TPName + ", prior MO history is mandatory but has not been recorded for this patient. Therefore, you are unable to proceed with this procedure at this time.", "MO Hisoty Required!")
        this.appPopupService.openModal(this.moInterventionAlertPopupForTech, { backdrop: 'static', size: 'fss' }); return;
      }

      if (this.RISStatusID == 5 || this.RISStatusID == 6 || this.RISStatusID == 8 || this.RISStatusID == 9) { //in case already initialized (does not need to verify thumb)
        this.isTechDisclaimer = false;
        this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
        this.getVitals();
        this.appPopupService.openModal(this.technicianModal, { backdrop: 'static', size: 'fsl' }); return;
      } else {

        //Check for already initialized study
        this.getRISWorklistRow(Number(this.VisitID), this.TPId);
        setTimeout(() => {
          if (this.StatusId >= 7 || (this.StatusId == -1) || (this.StatusId == -2)) {
            let aletMsg = "";
            let alertTitle = "";
            if (this.StatusId >= 7) {
              alertTitle = "Already Initialized";
              aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has already been initialized. Your action cannot be performed.';
            } else if (this.StatusId == -1) {
              alertTitle = "Already Cancelled";
              aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has already been Cancelled. Your action cannot be performed.';
            } else if (this.StatusId == -2) {
              alertTitle = "Requested For Cancellation";
              aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has sent for cancellation. Your action cannot be performed.';
            } else {
              aletMsg = 'Somthing went wrong and your action cannot be performed.';
            }
            // this.toastr.error("This study has already been INITIALIZED by the doctor. Your action cannot be performed.","Already Initialized"); 
            Swal.fire({
              title: alertTitle, //'Already Initialized',
              // text: 'This study <strong>'+this.TPName+'</strong> has already been initialized. Your action cannot be performed.',
              // html: 'This study <strong class="text-primary"> ' +row.VisitNo+' : '+ this.TPName + '</strong> has already been initialized. Your action cannot be performed.',
              html: aletMsg,
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
                // this.getRisworkList(this.paramsValuesForWorkList);
                // this.getRISWorkListSummary(this.paramsValuesForWorkList);

                this.pagination.paginatedSearchResults.splice(this.rowIndex, 1);
                --this.countCheckoutWorklist;
                Swal.close();
              }
              // else {
              //   Swal.close();
              //   // Handle the Cancel button click here (if needed)
              // }
            });
            return
          } else {
            // console.log("this.StatusId_____________",this.StatusId," this.RISWorklistRow",this.RISWorklistRow)
            this.count = this.count + 1;
            // this.clearVariables(0);
            const obj = {
              user: 1,
              timestamp: +new Date(),
              screen: encodeURIComponent(window.location.href)
            }
            if (this.count == 1) {
              this.rowIndex = index;
              this.TPId = row.TPId;
              this.VisitID = row.VisitNo.replaceAll("-", "");
              this.VisitIDWithDashes = row.VisitNo;
              this.TPCode = row.TPCode;
              this.TPName = row.TPName;
              this.PatientName = row.PatientName;
              this.PatientId = row.PatientId;
              this.RISStatusID = row.RISStatusID;
              this.PatientPhoneNumber = row.PhoneNumber;
              this.RISWorkListID = row.RISWorkListID;
              this.MOBy = row.MOBy;
              this.isConsentRead = row.isConsentRead;
              this.isTechHistoryRequred = row.isTechHistoryRequred;
              this.WorkflowStatus = row["Workflow Status"];
              this.TestStatus = row.TestStatus;
              this.StatusId = row.StatusId;
              // this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
              // this.getVitals();
              // if (this.multiApp.checkIfMultiAppConnectedBiomatric()) {
              this.sendCommand({ command: 'fmd', userIdentity: JSON.stringify(obj), useFor: "checkin" });
              this.spinner.show();

              // } else {
              //   this.toastr.warning("WebDesk App is not connected/not installed", "Web App Connection Error");
              //   this.appPopupService.openModal(this.userVerificationModal, { backdrop: 'static', size: 'md' });
              //   this.multiApp.connectToMultiApp();
              // }
              this.count = 0;
            }
            else {
              this.toastr.warning("Please verify your thumb for Visit: " + this.VisitIDWithDashes + ", TPCode: " + this.TPCode + ", Patient: " + this.PatientName, "Instince already Opened");
            }
          }
        }, 300);
        //Check for already initialized study


      }

    } else if (this.screenIdentity == 'reporting-worklist') {
      this.VerifiedUserID = null;
      this.rowIndex = index;
      this.TPId = row.TPId;
      this.VisitIDWithDashes = row.VisitNo;
      this.VisitID = row.VisitNo.replaceAll("-", "");
      this.TPCode = row.TPCode;
      this.TPName = row.TPName;
      this.PatientName = row.PatientName;
      this.PatientId = row.PatientId;
      this.RISStatusID = row.RISStatusID;
      this.StatusId = row.StatusId;
      this.PatientPhoneNumber = row.PhoneNumber;
      this.RISWorkListID = row.RISWorkListID;
      this.MOBy = row.MOBy;
      this.ProcessIDParent = row.ProcessId;
      this.TestStatus = row.TestStatus;
      this.StatusId = row.StatusId;
      this.isConsentRead = row.isConsentRead;
      this.WorkflowStatus = row["Workflow Status"];
      this.TranscribedBy = row.TranscribedBy;
      this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
      this.getVitals();
      setTimeout(() => {
        this.appPopupService.openModal(this.reportingModal, { backdrop: 'static', size: 'fss' });
      }, 200);
    }


  }
  sendCommand(cmd) {
    // console.log("MultiApp", cmd);
    this.multiApp.sendCommandBiomatric(cmd);
  }
  spinnerRefs = {
    listSection: 'listSection',
    drPic: "drPic",
    dsdrPic: "dsdrPic",
    readiologinstSummarySection: "readiologinstSummarySection",
    readiologinstSummarySectionIintBy: "readiologinstSummarySectionIintBy",
    readiologinstSummarySectionDSBy: "readiologinstSummarySectionDSBy",
    doctorsDropdownSpinner: "doctorsDropdownSpinner",
  }
  _object = Object;
  showAllTab = false;
  clearVariables(refreshCounter = 0) {
    this.TPId = null;
    this.VisitID = null;
    this.PatientName = null;
    this.TPCode = null;
    this.TPName = null;
    this.PatientId = null;
    this.RISWorkListID = null;
    this.RISStatusID = null;
    this.MOBy = null;
    this.VisitIDWithDashes = null;
    this.SubSectionId = null;
    this.rowIndex = -1//null;
    if (refreshCounter == 1)
      this.count = 0;
  }
  getRisworkList(val) {
    // console.log("Queue Manager val are : ",val)
    this.visitDetailBtnClicked = false;
    this.isLoadSummaryMethodCalled = false;
    // console.log("there we goo in risworklist status change rec getRisworkList:",val)
    // this.clearVariables(0)
    const storagePrms = this.storageService.getObject('risFilterParams') ? this.storageService.getObject('risFilterParams') : val;
    this.storageService.setObject('risFilterParams', val);
    const visitIDForSelectedDoctor = val.visitID.replaceAll("-", '');
    if (val.visitID) {
      this.showAllTab = true;
      this.active = 7;
      if (this.screenIdentity == 'reporting-worklist') {
        val.RISStatusID = -1;
        val.filterBy = 4;
      }
    } else {
      this.active = val.isActive;
      this.showAllTab = false;
    }
    if (val.visitID && val.isActive != 7) {
      this.toastr.warning('You have selected "PIN" please click on "All" tab to show data');
      return;
    }
    if ((val.dateFrom && val.dateTo) || val.visitID) {
      // console.log("val is______",val)
      this.searchText = '';
      // this.filterResults();
      this.risWorkist = [];
      this.spinner.show(this.spinnerRefs.listSection);
      const params = {
        VisitID: val.visitID ? val.visitID.replaceAll("-", '') : null,
        BranchIDs: (!val.branch || !val.branch.length) ? val.branchAll.join(",") : val.branch.join(","),
        FilterBy: val.filterBy,
        RISStatusID: val.RISStatusID,
        DateFrom: val.visitID ? null : val.dateFrom,
        DateTo: val.visitID ? null : val.dateTo,
        // SubSectionIDs: val.subSectionIDs ? val.subSectionIDs.join(",") : null,
        SubSectionIDs: ((val.filterBy === 5 || val.filterBy === 12) && (!val.subSectionIDs || val.subSectionIDs.length || val.subSectionIDs == "") && (this.screenIdentity == 'queue-manager' || this.screenIdentity == 'reporting-worklist')) ? val.subSectionIDsAll.join(",") : (val.subSectionIDs ? val.subSectionIDs.join(",") : null),
        AssignerFilter: val.AssignemntFilter,
        isPreMedical: this.isPreMedicalFitness,
        UserID: this.loggedInUser.userid || -99 // -99 incase of null
      }
      // console.log("Queue Manager Params are : ",params)
      this.worklistSrv.getRISWorklist(params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
          this.orignaRisList = resp.PayLoad
          const dataset = resp.PayLoad;
          // console.log("dataset: ", dataset)
          this.risWorkist = dataset.map(a => ({
            BranchCode: a.BranchCode,
            MOBy: a.MOBy,
            PatientId: a.PatientId,
            PatientName: a.PatientName,
            PhoneNumber: a.PhoneNumber,
            ProcessId: a.ProcessId,
            RISStatusID: a.RISStatusID,
            RISWorkListID: a.RISWorkListID,
            StatusId: a.StatusId,
            TPCode: a.TPCode,
            TPId: a.TPId,
            TPName: a.TPName,
            TestStatus: this.getTestStatus(a.StatusId, a.RISStatusID, a.TestStatus, a.WorkflowStatus),//a.TestStatus,
            VisitNo: a.VisitNo,
            "Workflow Status": a.WorkflowStatus,
            StatusBadgeClass: this.getStatusClass(a.RISStatusID),
            isMedicalOfficerIntervention: a.isMedicalOfficerIntervention,
            EmpId: a.EmpId,
            RegistrationDate: a.RegistrationDate,
            DeliveryDate: a.DeliveryDate,
            "RemainingTime (hh:mm)": this.getRemainingTime(a.DeliveryDate),
            isConsentRead: a.isConsentRead,
            InitializedBy: a.InitializedBy,
            InitializedOn: a.InitializedOn,
            isTechHistoryRequred: a.isTechHistoryRequred,
            SubSectionId: a.SubSectionId,
            TranscribedBy: a.TranscribedBy,
            InitByEmpID: a.InitByEmpID,
            DSByEmpID: a.DSByEmpID,
            isMetal: a.isMetal,
            RadiologistID: a.RadiologistID,
            isPreMedical: a.isPreMedical
          }));
          // this.risWorkist = resp.PayLoad;
          // ['VisitNo', 'PatientName', 'TPCode', 'TestStatus']
          const newris = [];
          this.risWorkist = this.risWorkist.map((a, i) => {
            const _obj = {};
            this.colNamesForMOScreen.forEach(b => { _obj[b] = a[b] }); return _obj
          })
          this.filterResults();
          this.getRadiologistRefByMappingInfo(visitIDForSelectedDoctor);
        }
        this.params = params

      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.log("Err", err)
      })
    }
    else {
      this.toastr.error("Please select date range")
    }

  }
  getTestStatus(StatusId, RISStatusID, TestStatus, WorkflowStatus) {
    let testStatus = WorkflowStatus;
    if ((StatusId == 6 && !RISStatusID) || (StatusId == 7 && (RISStatusID == 8 || RISStatusID == 10))) {
      testStatus = WorkflowStatus;
    } else {
      testStatus = TestStatus
    }
    return testStatus;

  }
  getRemainingTime_(deliveryDate: string): string {
    const now = moment(); // Current date and time
    const deliveryDateTime = moment(deliveryDate); // Delivery date and time

    // Calculate the difference between current date and delivery date
    const diff = deliveryDateTime.diff(now);

    // Check if the difference is negative
    if (diff < 0) {
      // Convert the absolute difference to duration and extract hours and minutes
      const duration = moment.duration(Math.abs(diff));
      const remainingHours = duration.hours();
      const remainingMinutes = duration.minutes();

      // Format remaining time as -HH:MM
      const remainingTime = `-${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
      return remainingTime;
    } else {
      // Convert the difference to duration and extract hours and minutes
      const duration = moment.duration(diff);
      const remainingHours = duration.hours();
      const remainingMinutes = duration.minutes();

      // Format remaining time as HH:MM
      const remainingTime = `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
      return remainingTime;
    }
  }
  getRemainingTime(deliveryDate: string): string {
    // Get the current date and time
    const currentMoment = moment();

    // Parse the delivery date using Moment.js
    const deliveryMoment = moment(deliveryDate);

    // Calculate the difference in minutes between the current time and delivery time
    const diffMinutes = deliveryMoment.diff(currentMoment, 'minutes');

    // Calculate the absolute difference in hours and minutes
    const absDiffHours = Math.floor(Math.abs(diffMinutes) / 60);
    const absDiffMinutes = Math.abs(diffMinutes) % 60;

    // Format the result as "hh:mm" with a minus sign if necessary
    const formattedHours = String(absDiffHours).padStart(2, '0');
    const formattedMinutes = String(absDiffMinutes).padStart(2, '0');
    const sign = diffMinutes < 0 ? '-' : ''; // Add minus sign if the difference is negative

    return `${sign}${formattedHours}:${formattedMinutes}`;
  }

  countMOWorklist = 0;
  countMODone = 0;
  countCheckinWorklist = 0;
  countCheckoutWorklist = 0;
  countInitialWorklist = 0;
  countAllWorklist = 0;
  countInitialized = 0;
  countAssignerWorkList = 0;
  countPendWorklist = 0;
  countAssignerAll = 0;
  countAssignerAssigned = 0;
  countAssignerUnassigned = 0;
  countAssignerSubAll = 0;

  //Reporting Counters
  countRadioAssigned = 0;
  countRadioPending = 0;
  countRadioDrafted = 0;
  countRadioReported = 0;
  countRadioFinal = 0;
  countRadioAddendumed = 0;
  countRadioAll = 0;
  getRISWorkListSummary(val) {
    if ((val.dateFrom && val.dateTo) || val.visitID) {
      const params = {
        VisitID: val.visitID ? val.visitID.replaceAll("-", '') : null,
        // BranchIDs: val.branch ? val.branch.join(",") : null, //comment in case of v1 and following for v2 ie queue-manager, we will add for bulkv2 also when need
        BranchIDs: (this.screenIdentity === 'queue-manager' || this.screenIdentity == 'bulk-queue-manager') && (!val.branch || !val.branch.length)
          ? val.branchAll.join(",")
          : (val.branch || val.branch.length)
            ? val.branch.join(",")
            : null,
        FilterBy: val.filterBy,
        RISStatusID: val.RISStatusID,
        DateFrom: val.visitID ? null : val.dateFrom,
        DateTo: val.visitID ? null : val.dateTo,
        // SubSectionIDs: val.subSectionIDs ? val.subSectionIDs.join(",") : null,
        SubSectionIDs: (
          (val.filterBy === 5 || val.filterBy === 12)
          && (!val.subSectionIDs || val.subSectionIDs == "")
          && (this.screenIdentity == 'reporting-worklist' || this.screenIdentity == 'queue-manager' || this.screenIdentity == 'bulk-queue-manager')
        ) ? val.subSectionIDsAll.join(",") : (val.subSectionIDs ? val.subSectionIDs.join(",") : null),

        UserID: this.loggedInUser.userid || -99
      }
      // console.log("FormOBJJJJJJJJJ_IN queue Manager222222________", params)
      this.worklistSrv.getRISWorkListSummary(params).subscribe((resp: any) => {
        const filterBy = [4, 5, 6, 7, 8, 9, 10];
        if (filterBy.includes(parseInt(params.FilterBy))) {
          if (resp && resp.PayLoadDS && resp.StatusCode == 200) {
            const summaryCounter = resp.PayLoadDS.Table;
            const summaryAddendum = resp.PayLoadDS.Table1;
            const summaryPending = resp.PayLoadDS.Table2;

            this.countRadioAssigned = (summaryCounter.find(a => a.RISStatusID === 8 && a.StatusID === 7) || { TotalRecords: 0 }).TotalRecords;



            // this.countRadioDrafted = (summaryCounter.find(a => a.RISStatusID === 10 && a.StatusID === 7) || { TotalRecords: 0 }).TotalRecords;

            //new changes for drafted
            const draftednwl = summaryCounter.filter(a => a.RISStatusID == 10 && a.StatusID == 7);
            // let draftednwl = summaryCounter.filter(a => a.RISStatusID == 10 && a.StatusID != 10 && a.StatusID != 9 && a.StatusID != 8);
            this.countRadioDrafted = draftednwl.length ? draftednwl.reduce((n, { TotalRecords }) => n + TotalRecords, 0) : 0 || 0;



            //update latest the counters. incase of no IRISStatusID
            // this.countRadioReported = (summaryCounter.find(a => a.RISStatusID === 8 && a.StatusID === 8) || { TotalRecords: 0 }).TotalRecords;
            // this.countRadioReported = (summaryCounter.find(a => a.StatusID === 8) || { TotalRecords: 0 }).TotalRecords;

            //new changes for reported
            const reportednwl = summaryCounter.filter(a => a.StatusID == 8);
            this.countRadioReported = reportednwl.length ? reportednwl.reduce((n, { TotalRecords }) => n + TotalRecords, 0) : 0 || 0;



            // this.countRadioFinal = (summaryCounter.find(a => a.RISStatusID === 8 && a.StatusID === 9) || { TotalRecords: 0 }).TotalRecords;
            // this.countRadioFinal = (summaryCounter.find(a => a.StatusID === 9) || { TotalRecords: 0 }).TotalRecords;

            //new changes for Final
            const finalwl = summaryCounter.filter(a => a.StatusID == 9);
            this.countRadioFinal = finalwl.length ? finalwl.reduce((n, { TotalRecords }) => n + TotalRecords, 0) : 0 || 0;


            this.countRadioAddendumed = (summaryAddendum[0]?.AddendumCount || 0);
            this.countRadioPending = (summaryPending[0]?.PendingCount || 0);
          }
        } else {
          if (resp && resp.PayLoadDS && resp.StatusCode == 200) {
            const summaryCounter = resp.PayLoadDS.Table;
            // console.log("summaryCounter: ", summaryCounter)

            const mowl = summaryCounter.filter(a => !a.RISStatusID && a.isMedicalOfficerIntervention == 1);
            this.countMOWorklist = mowl.length ? mowl[0].TestCount : 0 || 0;

            const modonewl = summaryCounter.filter(a => a.RISStatusID == 2 && a.isMedicalOfficerIntervention == 1);
            this.countMODone = modonewl.length ? modonewl[0].TestCount : 0 || 0;

            const checkinwl = summaryCounter.filter(a => a.RISStatusID == 2 || a.RISStatusID == 7 || !a.RISStatusID);
            // this.countCheckinWorklist = checkinwl.length ? checkinwl[0].TestCount : 0 || 0;
            this.countCheckinWorklist = checkinwl.length ? checkinwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;

            // this.countCheckinWorklist = this.countMOWorklist + this.countMODone;

            const checkoutwl = summaryCounter.filter(a => a.RISStatusID == 3);
            this.countCheckoutWorklist = checkoutwl.length ? checkoutwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;

            const pendwl = summaryCounter.filter(a => a.RISStatusID == 7);
            this.countPendWorklist = pendwl.length ? pendwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;

            const initialwl = summaryCounter.filter(a => a.RISStatusID == 4);
            this.countInitialWorklist = initialwl.length ? initialwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;

            const initializedwl = summaryCounter.filter(a => a.RISStatusID == 5 || a.RISStatusID == 6);
            this.countInitialized = initializedwl.length ? initializedwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;

            this.countAllWorklist = this.countMOWorklist + this.countCheckinWorklist + this.countCheckoutWorklist + this.countInitialized;

            const assignerAllwl = resp.PayLoadDS.Table1.length ? resp.PayLoadDS.Table1[0].TestCount : 0




            const assigneAssignedwl = summaryCounter.filter(a => a.RISStatusID == 8);
            // let assignerUnassignedwl = summaryCounter.filter(a => a.RISStatusID == 1 || a.RISStatusID == 2 || a.RISStatusID == 3 || a.RISStatusID == 4 || a.RISStatusID == 5 || a.RISStatusID == 6 || a.RISStatusID == 7 || a.RISStatusID == 9 );
            const assignerUnassignedwl = summaryCounter.filter(a => [4, 5, 9].includes(a.RISStatusID)); //1, 2, 3, 4, 5, 6, 7, 9 i have made some changes because in counter MO done and checkin studies was also comming while not in listing
            // this.countAssignerWorkList = resp.PayLoadDS.Table1.length ? resp.PayLoadDS.Table1[0].TestCount : 0

            // this.countAssignerAssigned = assigneAssignedwl.length ? assigneAssignedwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;
            this.countAssignerAssigned = resp.PayLoadDS.Table2.length ? resp.PayLoadDS.Table2[0].AssignedCount : 0
            // this.countAssignerUnassigned = assignerUnassignedwl.length ? assignerUnassignedwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;
            this.countAssignerUnassigned = resp.PayLoadDS.Table2.length ? resp.PayLoadDS.Table2[0].UnAssignedCount : 0
            this.countAssignerWorkList = resp.PayLoadDS.Table1.length ? resp.PayLoadDS.Table1[0].TestCount : 0
            // this.countAssignerSubAll = assignerAllwl;
            this.countAssignerSubAll = this.countAssignerAssigned + this.countAssignerUnassigned;
            // if(this.isAll){
            //   this.countAssignerWorkList = assignerAllwl;
            // }else if(this.isAssigned){
            //   this.countAssignerWorkList = assigneAssignedwl.length ? assigneAssignedwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;
            // } else if(this.isUnassigned){
            //   this.countAssignerWorkList = assignerUnassignedwl.length ? assignerUnassignedwl.reduce((n, { TestCount }) => n + TestCount, 0) : 0 || 0;
            // }else{
            //   this.countAssignerWorkList = resp.PayLoadDS.Table1.length ? resp.PayLoadDS.Table1[0].TestCount : 0
            // }
            this.englishNews = "You have (" + this.countCheckoutWorklist + ") tests pending checkout. Please proceed; the next step awaits!";

          }
        }

      }, (err) => {
        console.log("Err", err)
      })
    }
    else {
      this.toastr.error("Please select date range")
    }

  }

  active = 2;
  workListFilter
  searchFormInfoObj = {
    formHeaderBGClass: 'text-primary',
    formHeaderText: "MO Pending List"
  }
  testSummaryInfoHeader = "Registered Tests";
  noticeBoardStyle = "bg-primary";
  // testSummaryInfoHeader1 ="Registered Tests";
  // noticeBoardStyle1 = "bg-primary";
  getActive(active, risStatusID, filterBy, formHeaderBGClass, formHeaderText) {
    this.TPId = null;
    // this.clearVariables(0);
    let filterByCondition = filterBy;
    if (filterBy == -99) {
      if (this.screenIdentity == 'mo-worklist') {
        filterByCondition = 1;
      } else if (this.screenIdentity == 'tech-worklist') {
        filterByCondition = 2;
      } else if ((this.screenIdentity == 'queue-management' || this.screenIdentity == 'queue-manager' || this.screenIdentity == 'bulk-queue-manager')) {
        filterByCondition = 3;
      } else {
        filterByCondition = filterBy;
      }
    }
    this.rowIndex = null;
    this.active = active;
    this.isAll = false;
    this.isAssigned = false;
    this.isUnassigned = false;
    this.paramsValuesForWorkList.RISStatusID = risStatusID;
    this.paramsValuesForWorkList.filterBy = filterByCondition;
    this.paramsValuesForWorkList.isActive = active;
    this.noticeBoardStyle = formHeaderBGClass;
    this.paramsValuesForWorkList.AssignemntFilter = 3;
    this.isUnassigned = true;
    this.searchFormInfoObj = {
      formHeaderBGClass: formHeaderBGClass,
      formHeaderText: formHeaderText
    }
    this.paramFormHeaderInfo.emit(this.searchFormInfoObj);
    this.getRisworkList(this.paramsValuesForWorkList);
    if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
      this.getRISWorkListSummary(this.paramsValuesForWorkList);
    this.getTestSummaryInfo(active);
  }
  getActiveReporting(active, risStatusID, filterBy, formHeaderBGClass, formHeaderText) {
    this.TPId = null;
    // this.clearVariables(0);
    this.rowIndex = null;
    this.active = active;
    this.isAll = false;
    this.isAssigned = false;
    this.isUnassigned = false;
    this.paramsValuesForWorkList.RISStatusID = risStatusID;
    this.paramsValuesForWorkList.filterBy = filterBy;
    this.paramsValuesForWorkList.isActive = active;
    this.noticeBoardStyle = formHeaderBGClass;
    this.paramsValuesForWorkList.AssignemntFilter = 3;
    this.isUnassigned = true;
    this.searchFormInfoObj = {
      formHeaderBGClass: formHeaderBGClass,
      formHeaderText: formHeaderText
    }
    this.paramFormHeaderInfo.emit(this.searchFormInfoObj);
    this.getRisworkList(this.paramsValuesForWorkList);
    if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
      this.getRISWorkListSummary(this.paramsValuesForWorkList);
    this.getTestSummaryInfo(active);
  }

  isAll = false;
  isAssigned = false;
  isUnassigned = true;
  isReset = false;
  isDissabledChk = false;
  isPreMedicalFitness = false;
  assignerFilter(active, risStatusID, filterBy, formHeaderBGClass, formHeaderText, assignemntFilter) {
    this.TPId = null;
    if (assignemntFilter == 1) {
      this.isAll = true;
      this.isAssigned = false;
      this.isUnassigned = false;
      this.isDissabledChk = false;
      this.isReset = false;
    }
    else if (assignemntFilter == 2) {
      this.isAll = false;
      this.isAssigned = true;
      this.isUnassigned = false;
      this.isDissabledChk = true;
      this.isReset = false;
    }

    else if (assignemntFilter == 3) {
      this.isAll = false;
      this.isAssigned = false;
      this.isUnassigned = true;
      this.isDissabledChk = false;
      this.isReset = false;
    }
    else if (assignemntFilter == 4) {
      this.isAll = false;
      this.isAssigned = false;
      this.isUnassigned = false;
      this.isDissabledChk = false;
      this.isReset = true;
    }
    else {
      this.isAll = true;
      this.isAssigned = false;
      this.isDissabledChk = true;
      this.isUnassigned = false;
      this.isReset = false;
    }
    this.rowIndex = null;
    this.active = active;
    this.paramsValuesForWorkList.RISStatusID = risStatusID;
    this.paramsValuesForWorkList.filterBy = filterBy;
    this.paramsValuesForWorkList.isActive = active;
    this.paramsValuesForWorkList.AssignemntFilter = assignemntFilter;
    this.noticeBoardStyle = formHeaderBGClass;
    this.searchFormInfoObj = {
      formHeaderBGClass: formHeaderBGClass,
      formHeaderText: formHeaderText
    }
    // console.log("RISWorklistParam: ", this.paramsValuesForWorkList)
    this.paramFormHeaderInfo.emit(this.searchFormInfoObj);
    this.getRisworkList(this.paramsValuesForWorkList);
    if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
      this.getRISWorkListSummary(this.paramsValuesForWorkList);
    this.getTestSummaryInfo(active);

  }


  getTestSummaryInfo(activeTab) {
    switch (activeTab) {
      case 1: {
        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Assigned Tests";
        } else {
          this.testSummaryInfoHeader = "MO Pending Tests";
        }

        break
      }
      case 2: {
        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Pending Tests";
        } else {
          this.testSummaryInfoHeader = "Registered Tests";
        }
        break
      }
      case 3: {

        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Saved as Draft Tests";
        } else {
          this.testSummaryInfoHeader = "Checkin Worklist";
        }
        break
      }
      case 4: {
        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Reported Tests";
        } else {
          this.testSummaryInfoHeader = "Checkout Worklist";
        }
        break
      }
      case 5: {
        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Finalized Tests";
        } else {
          this.testSummaryInfoHeader = "Initial Worklist";
        }

        break
      }
      case 6: {
        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Tests Needs Addendum";
        } else {
          this.testSummaryInfoHeader = "Queue Management";
        }
        break
      }
      // case 7: {
      //   this.testSummaryInfoHeader = "All Tests";
      //   break
      // }
      case 8: {
        this.testSummaryInfoHeader = "Pended Worklist";
        break
      }
      case 9: {
        this.testSummaryInfoHeader = "MO Done";
        break
      }
      default: {
        this.testSummaryInfoHeader = "Registered Tests";
      }
    }
  }
  isStatusChangedRec(statusValue) {
    if (this.screenIdentity == 'tech-worklist' && statusValue == 2)
      window.location.reload();
    // console.log("WE ARE GOING TO RECEIVE EMIT")
    // console.log("there we goo in risworklist status change rec:",statusValue)
    // this.clearVariables(0);
    this.rowIndex = null;
    // setTimeout(() => {
    this.getRisworkList(this.paramsValuesForWorkList);
    if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
      this.getRISWorkListSummary(this.paramsValuesForWorkList);
    this.getVitals();
    // }, 5000);

  }
  isDropDownChangeRec(doropDownObj) {
    this.getVitalsOnChangeMODropdown(doropDownObj)
  }

  reEvaluateButtonsPermissions() {

    // this.buttonControlsPermissions.branch = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'branch') ? true : false;

  }
  risParamsReceived(event) {
    // console.log(event);
    // this.getMOWorkList(event);
  }
  resss(ee) {
    // console.log("resss", this.paramsValuesForWorkList);
  }

  TPId = null;
  VisitID = null;
  VisitIDWithDashes = null;
  PatientName = null;
  TPCode = null;
  TPName = null;
  PatientId = null;
  RISWorkListID = null;
  RISStatusID = null;
  StatusId = null;
  MOBy = null;
  rowIndex = null;
  ProcessIDParent = 1;
  TestStatus = null;
  RegistrationDate = null;
  DeliveryDate = null;
  isTechDisclaimer = false;
  isConsentRead = false;
  isMedicalOfficerIntervention = null;
  isTechHistoryRequred = null;
  isPreMedical = null;
  isMetal = null;
  openPopupModal(row, index) {
    // this.clearVariables(0);
    this.rowIndex = null;
    // console.log("mo-row", row);
    this.rowIndex = index;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    this.isMedicalOfficerIntervention = row.isMedicalOfficerIntervention;
    this.isTechHistoryRequred = row.isTechHistoryRequred;
    this.TestStatus = row.TestStatus;
    this.StatusId = row.StatusId;
    this.WorkflowStatus = row["Workflow Status"];
    // console.log("and ProcessIDParent", this.ProcessIDParent);
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.getVitals()
    if (this.screenIdentity == 'mo-worklist') {
      this.isTechDisclaimer = false;
      if (!row.isMedicalOfficerIntervention) {
        this.toastr.warning("MO Intervention is not set for the test " + row.TPName + "", "MO Intervention");
        return;
      }
      this.rowIndex = null;
      this.rowIndex = index;
      this.appPopupService.openModal(this.questionnaireModal, { backdrop: 'static', size: 'fss' });

    } else if (this.screenIdentity == 'tech-worklist') {
      this.isTechDisclaimer = true;
      if (this.isMedicalOfficerIntervention && !this.MOBy && this.RISStatusID < 3) {
        this.toastr.warning("For the " + this.TPCode + "-" + this.TPName + ", prior MO history is mandatory but has not been recorded for this patient. Therefore, you are unable to proceed with this procedure at this time.", "MO Hisoty Required!")
        this.appPopupService.openModal(this.moInterventionAlertPopupForTech, { backdrop: 'static', size: 'fss' }); return;
      }
      if (this.RISStatusID == 5 || this.RISStatusID == 6 || this.RISStatusID == 8 || this.RISStatusID == 9) {
        this.appPopupService.openModal(this.technicianModal, { backdrop: 'static', size: 'fsl' }); return;
      } else {

        //Check for already initialized study
        this.getRISWorklistRow(Number(this.VisitID), this.TPId);
        setTimeout(() => {
          if (this.StatusId >= 7 || (this.StatusId == -1) || (this.StatusId == -2)) {
            let aletMsg = "";
            let alertTitle = "";
            if (this.StatusId >= 7) {
              alertTitle = "Already Initialized";
              aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has already been initialized. Your action cannot be performed.';
            } else if (this.StatusId == -1) {
              alertTitle = "Already Cancelled";
              aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has already been Cancelled. Your action cannot be performed.';
            } else if (this.StatusId == -2) {
              alertTitle = "Requested For Cancellation";
              aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has sent for cancellation. Your action cannot be performed.';
            } else {
              aletMsg = 'Somthing went wrong and your action cannot be performed.';
            }
            // this.toastr.error("This study has already been INITIALIZED by the doctor. Your action cannot be performed.","Already Initialized"); 
            Swal.fire({
              title: alertTitle,//'Already Initialized',
              // text: 'This study has already been initialized. Your action cannot be performed.',
              html: aletMsg, //'This study <strong class="text-primary"> ' +row.VisitNo+' : '+ this.TPName + '</strong> has already been initialized. Your action cannot be performed.',
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
                this.pagination.paginatedSearchResults.splice(this.rowIndex, 1);
                --this.countCheckoutWorklist;
                Swal.close();
              }
            });
            return
          } else {
            this.appPopupService.openModal(this.userVerificationModal, { backdrop: 'static', size: 'md' });
          }
        }, 300);
        //Check for already initialized study
      }

    }

  }
  openQuestionnaireModal(row) {
    this.isTechDisclaimer = false;
    if (!row.isMedicalOfficerIntervention) {
      this.toastr.warning("MO Intervention is not set for the test " + row.TPName + "", "MO Intervention");
      return;
    }
    // console.log("mo-row", row);
    this.WorkflowStatus = row["Workflow Status"]
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    this.TestStatus = row.TestStatus;
    this.StatusId = row.StatusId;
    if (this.screenIdentity == 'mo-worklist')
      this.appPopupService.openModal(this.questionnaireModal, { backdrop: 'static', size: 'fss' });
    else
      this.openMOHistory(row);
  }
  openVerifyLoginModal(row) {
    // console.log("mo-row", row);
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.VisitIDWithDashes = row.VisitNo;
    this.MOBy = row.MOBy;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.userVerificationModal, { size: 'md' });
    this.isConsentRead = row.isConsentRead;
    this.TestStatus = row.TestStatus;
    this.StatusId = row.StatusId;
  }

  openMOHistory(row) {
    this.isTechDisclaimer = false;
    // console.log("mo-row", row);
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.getVitals();
    setTimeout(() => {
      this.appPopupService.openModal(this.moHistoryModal);
    }, 200);

  }
  openVitals(selVisitInfo) {
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.vitals, { size: 'lg' });
  }

  openMOHistoryReport(row) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(row.VisitNo.replaceAll("-", "")), TPID: row.TPId }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    const winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }

  openEMR(selVisitInfo) {
    this.VisitID = selVisitInfo.VisitNo.replaceAll("-", "");
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.emrModal, { size: 'fss' });
  }

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }
  searchText = '';
  refreshPagination() {
    // this.clearVariables(0);
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    if ((this.screenIdentity == 'queue-management' || this.screenIdentity == 'queue-manager') && this.isAssigner || (this.screenIdentity == 'bulk-queue-manager')) {
      this.pagination.paginatedSearchResults = dataToPaginate;
    } else {
      this.pagination.paginatedSearchResults = dataToPaginate
        // .map((item, i) => ({ id: i + 1, ...item }))
        .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
    }
    if ((this.screenIdentity == 'queue-management' || this.screenIdentity == 'queue-manager') || this.screenIdentity == 'bulk-queue-manager') {
      this.assignTest(this.pagination.paginatedSearchResults[0], 0)
    }
  }

  filterResults() {
    // this.clearVariables(0);
    this.pagination.page = 1;
    const cols = ['VisitNo', 'PatientName', 'TPCode', 'BranchCode', 'PhoneNumber', 'TestStatus', 'Workflow Status'];
    let results: any = this.risWorkist;
    if (this.searchText && this.searchText.length > 2) {
      const pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.risWorkist, this.searchText, cols, this.risWorkist);
    }
    this.pagination.filteredSearchResults = results;
    // console.log("this.pagination.filteredSearchResults____________", this.pagination.filteredSearchResults)
    this.refreshPagination();
    this.cd.detectChanges();

  }


  VerifiedUserID = null;
  RegLocId = null;
  VerifiedUserName = null;
  IsAuthenticated = false;
  isSpinnerAccept = true;
  openMOHistoryForTechAgreement() {
    this.appPopupService.openModal(this.moHistoryModal);
  }
  readTechAgreement() {
    if (this.isConsentRead) {
      const params = {
        RISWorkListID: this.RISWorkListID,
        isConsentRead: 1,
        ModifiedBy: this.VerifiedUserID
      }
      this.isSpinnerAccept = false;
      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RIS_WORKLIST_CONSENT_READ, params).subscribe((resp: any) => {
        this.isSpinnerAccept = true;
        if (resp.StatusCode == 200) {
          this.appPopupService.closeModal(this.moHistoryModal);
          if (!this.RISWorkListID || (this.RISWorkListID && this.RISStatusID == 2)) {
            this.insertUpdateTechnicianWorkList();
          }
          setTimeout(() => {
            this.appPopupService.openModal(this.technicianModal, { backdrop: 'static', size: 'fsl' });
          }, 500);
        } else {
          this.appPopupService.closeModal(this.moHistoryModal);
        }
      }, (err) => {
        console.log("err", err)
        this.appPopupService.closeModal(this.moHistoryModal);
      })
    } else {
      this.appPopupService.closeModal(this.moHistoryModal);
    }

  }
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
            this.VerifiedUserName = data.PayLoad[0].UserName;
            this.toastr.success(data.PayLoad[0].UserName, "Verified:");
            if (!this.isConsentRead && this.MOBy) {
              this.appPopupService.closeModal(this.userVerificationModal);
              this.userVerificationForm.patchValue({
                techUsername: "",
                techPassword: ""
              })
              this.openMOHistoryForTechAgreement()
            } else {
              // here we sign agreement from tech to read mo history
              if (!this.RISWorkListID || (this.RISWorkListID && this.RISStatusID == 2)) {
                this.insertUpdateTechnicianWorkList();
              }
              this.appPopupService.closeModal(this.userVerificationModal);
              this.userVerificationForm.patchValue({
                techUsername: "",
                techPassword: ""
              })

              setTimeout(() => {
                this.appPopupService.openModal(this.technicianModal, { backdrop: 'static', size: 'fsl' });
              }, 500);
            }

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
  vitalRefresh = 0;
  isVistalSaved(isSaved) {
    // console.log("isVistalSaved:emit_____", isSaved)
    this.vitalRefresh = 1;
    if (isSaved) {
      this.getVitals()
    }
  }
  isShowVitalsCard = false;
  getVitals() {
    if (this.visitInfo.visitID && this.visitInfo.tpId) {
      const params = {
        VisitID: this.VisitID,
        TPID: this.TPId
      }
      this.vitalsSrv.getVitals(params).subscribe((resp: any) => {
        if (resp.PayLoad.length) {
          this.isShowVitalsCard = true;
        } else {
          this.isShowVitalsCard = false;
        }
      }, (err) => { console.log("err", err) })
    }
  }

  getVitalsOnChangeMODropdown(doropDownObj) {
    this.TPId = doropDownObj.TPID
    this.VisitID = doropDownObj.VisitID
    this.visitInfo = { tpId: doropDownObj.TPID, visitID: doropDownObj.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    if (this.visitInfo.visitID && this.visitInfo.tpId) {
      const params = {
        VisitID: doropDownObj.VisitID,
        TPID: doropDownObj.TPID
      }
      this.vitalsSrv.getVitals(params).subscribe((resp: any) => {
        if (resp.PayLoad.length) {
          this.isShowVitalsCard = true;
        } else {
          this.isShowVitalsCard = false;
        }
      }, (err) => { console.log("err", err) })
    }
  }
  closeModal1(modalName) {
    this.getRisworkList(this.paramsValuesForWorkList);
    if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
      this.getRISWorkListSummary(this.paramsValuesForWorkList);
    this.VerifiedUserID = null;
    this.appPopupService.closeModal(modalName);
    window.location.reload();
    // this.multiApp.biomatricData = null;
  }

  getStatusClass(risStatusID) {
    let statusClass = 'badge badge-primary';
    switch (risStatusID) {
      case null:
      case 1: {
        statusClass = 'badge badge-primary';
        break;
      }
      case 2: {
        statusClass = 'badge badge-info';
        break;
      }
      case 3: {
        statusClass = 'badge badge-tomato';
        break;
      }
      case 4: {
        statusClass = 'badge badge-blue';
        break;
      }
      case 5: {
        statusClass = 'badge badge-checkout-with-initial';
        break;
      }
      case 6: {
        statusClass = 'badge badge-initial';
        break;
      }
      case 7: {
        statusClass = 'badge bg-salmon';
        break;
      }
      case 8: {
        statusClass = 'badge bg-primary';
        break;
      }
      case 9: {
        statusClass = 'badge bg-tomato';
        break;
      }
      default: {
        statusClass = 'badge badge-primary';
        break;
      }
    }
    return statusClass;
  }

  printMOHistoryReport(visitID, TPId) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(visitID), TPID: TPId }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    const winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }







  /////////////////////////////Assigner Section////////////
  isSpinnerAssign = true;//Hide Loader
  isSpinnerUnAssign = true;//Hide Loader
  disabledButtonAssign = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonUnAssign = false; // Button Enabled / Disables [By default Enabled]
  VisitId = null;
  assigneeName = null;
  assigneeInItName = null;
  assigneeDSName = null;
  rowGlobal: any = null;
  SubSectionIdFilter = null
  InitializedBy = null;
  InitializedOn = null;
  assignTest(row, index) {
    console.log("assigner row ", row)
    this.isDisabledAssignment = false;
    // console.log("mo-row_assignTest",row)
    this.assigneeInItName = null;
    this.assigneeDSName = null;

    this.rowGlobal = row;
    // console.log("mo-row", row)
    this.rowIndex = index;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo ? row.VisitNo.replaceAll("-", "") : row.VisitNo;
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.VisitId = row.VisitNo ? row.VisitNo.replaceAll("-", "") : row.VisitNo;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.TPIds = [row.TPId];
    this.ProcessID = row.ProcessId
    this.EmpID = row.EmpId;
    this.DSByEmpID = row.DSByEmpID
    this.InitByEmpID = row.InitByEmpID
    this.VisitIDWithDashes = row.VisitNo;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.SubSectionIdFilter = row.SubSectionId;
    this.InitializedBy = row.InitializedBy;
    this.InitializedOn = row.InitializedOn;
    this.isMetal = row.isMetal;
    this.isPreMedical = row.isPreMedical;
    this.RadiologistID = row.RadiologistID;
    
    if (this.radoiologistList.length) {
      setTimeout(() => {
      this.radiologistListFiltered = this.radoiologistList.filter((radiologist) => {
        // Split the SubSectionIDs string into an array of values
        const subSectionIdsArray = radiologist.SubSectionIDs ? radiologist.SubSectionIDs.split(',').map(Number) : [];
        // Check if the SubSectionIdFilter value is in the array
        return subSectionIdsArray.includes(this.SubSectionIdFilter);
      });
      this.getRadiologistRefByMappingInfo(this.VisitID)
      }, 200);

    }

    if (this.EmpID) {
      // this.clearRadiologistSummary();
      this.selectedValueChange.emit(this.EmpID);
      // this.getRadiologistSummary(null);
      const drInfo = this.radoiologistList.find(a => a.EmpId == this.EmpID);
      if (drInfo)
        this.assigneeName = drInfo.FullName;
      this.assigneeInItName = this.InitByEmpID ? this.radoiologistList.find(a => a.EmpId == this.InitByEmpID).FullName : null;
      this.assigneeDSName = this.DSByEmpID ? this.radoiologistList.find(a => a.EmpId == this.DSByEmpID).FullName : null;
      console.log("this.assigneeDSName:", this.InitByEmpID, this.assigneeDSName, "this.assigneeInItName:", this.DSByEmpID, this.assigneeInItName);

      const assignee = (this.EmpID) ? this.radoiologistList.find(item => item.EmpId == this.EmpID) : null;
      this.assigneeName = (assignee) ? assignee.FullName + "(" + assignee.LocationFromIorgLoc + ")" : null;

      const assigneeInIt = (this.InitByEmpID) ? this.radoiologistList.find(item => item.EmpId == this.InitByEmpID) : null;
      this.assigneeInItName = (assigneeInIt) ? assigneeInIt.FullName + "(" + assigneeInIt.LocationFromIorgLoc + ")" : null;

      const assigneeDS = (this.DSByEmpID) ? this.radoiologistList.find(item => item.EmpId == this.DSByEmpID) : null;
      this.assigneeDSName = (assigneeDS) ? assigneeDS.FullName + "(" + assigneeDS.LocationFromIorgLoc + ")" : null;
    } else {
      this.selectedValueChange.emit(null);
      // this.clearRadiologistSummary();
    }
    this.getVitals()
    // this.getMOInterventionTPByVisitID(this.VisitID);
    this.getRISTPByVisit(this.VisitID);
    this.getRadioReportVisitTestStatus();
    this.clearRadiologistSummary();
    this.clearAllRadiologistSummary();
    // console.log("RISStatusID: ", this.RISStatusID)
  }

  visitTests = []
  TPIds = [];
  getMOInterventionTPByVisitID(VisitID) {
    this.visitTests = []
    const params = {
      VisitID: VisitID
    };
    // this.questionnaireSrv.getMOInterventionTPByVisitID(params).subscribe((res: any) => {
    this.sharedService.getData(API_ROUTES.GET_TP_BY_VISIT_ID, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.visitTests = res.PayLoad || [];
      } else {
        console.log('Something went wrong! Please contact administrator moIntervied');
      }
    }, (err) => {
      console.log(err);
    })

  }

  visitTestsAssigner = [];
  getRISTPByVisit(VisitID) {
    this.visitTestsAssigner = []
    const params = {
      VisitID: VisitID,
      FilterBy: 1
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_TP_BY_VISIT, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        const visitTestsAssigner = res.PayLoad || [];
        this.visitTestsAssigner = visitTestsAssigner.map(a => ({
          TPID: a.TPID,
          TestProfileCode: a.TestProfileCode,
          TestProfileName: a.TestProfileName,
          TPFullName: a.TestProfileCode + ' - ' + a.TestProfileName
        }));
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
    })

  }

  radoiologistList = [];
  radiologistListFiltered = [];
  getRadiologistInfo(EmpID) {
    const subSectionIDs = (this.paramsValuesForWorkList.subSectionIDs && this.paramsValuesForWorkList.subSectionIDs.length) ? this.paramsValuesForWorkList.subSectionIDs.join(",") : null;
    const params = {
      EmpID: EmpID,
      SubSectionIDs: subSectionIDs
    };
    this.spinner.show(this.spinnerRefs.doctorsDropdownSpinner)
    this.questionnaireSrv.getRadiologistInfo(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.doctorsDropdownSpinner);
      if (res.StatusCode == 200) {
        this.radoiologistList = res.PayLoadDS['Table'] || [];
        this.EmpID = this.radoiologistList[0].EmpId
        this.AssigneeName = this.radoiologistList[0].FullName
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.doctorsDropdownSpinner);
    })
  }
  AssigneeName = ""
  getRadiologistInfoByID(event, emp) {
    if (!event) {
      this.isLoadSummaryMethodCalled = false;
      this.clearAllRadiologistSummary();
    }
    // this.clearRadiologistSummary();
    this.AssigneeName = event.FullName;
    this.EmpID = event ? event.EmpId : null;
    this.selectedValueChange.emit(this.EmpID);
    // setTimeout(() => {
    //   this.getRadiologistSummary(null);
    // }, 200);
    if (!this.InitByEmpID && event) {
      this.InitByEmpID = event.EmpId || null;
    }
    if (emp == 1) {
      this.clearInitRadiologistSummary();
      this.clearAllRadiologistSummary();
      // this.assigneeInItName = this.InitByEmpID ? this.radoiologistList.find(a => a.EmpId == this.InitByEmpID).FullName : null;
      // const assignee =(this.EmpID) ? this.radoiologistList.find(item => item.EmpId == this.EmpID):null;
      // this.assigneeName = (assignee)?assignee.FullName+"("+assignee.LocationFromIorgLoc+")" : null; 
      const assigneeInIt = (this.InitByEmpID) ? this.radoiologistList.find(item => item.EmpId == this.InitByEmpID) : null;
      this.assigneeInItName = (assigneeInIt) ? assigneeInIt.FullName + "(" + assigneeInIt.LocationFromIorgLoc + ")" : null;

    } else if (emp==2) {
      this.clearRadiologistSummaryDSBy();
      this.clearAllRadiologistSummary();
      // this.assigneeDSName = this.DSByEmpID ? this.radoiologistList.find(a => a.EmpId == this.DSByEmpID).FullName : null;
      const assigneeDS = (this.DSByEmpID) ? this.radoiologistList.find(item => item.EmpId == this.DSByEmpID) : null;
      this.assigneeDSName = (assigneeDS) ? assigneeDS.FullName + "(" + assigneeDS.LocationFromIorgLoc + ")" : null;
    }
  }

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to assign ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }


  isAssigner = false;
  assignerButtonClicked = 0;
  setAssignerLayout(assignerButtonSelected) {
    this.assignerButtonClicked = assignerButtonSelected;
    if ((this.screenIdentity == 'queue-management' || this.screenIdentity == 'queue-manager') && this.assignerButtonClicked == 1) {
      this.isAssigner = true;
    } else if ((this.screenIdentity == 'queue-management' || this.screenIdentity == 'queue-manager') && this.assignerButtonClicked == 0) {
      this.isAssigner = false;
    }
    else {
      this.isAssigner == false;
    }
  }
  isCoppied = null;
  rowIndexCpy = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    const pin = text.VisitNo
    this.helper.copyMessage(pin);
    this.isCoppied = true;
    setTimeout(() => {
      this.isCoppied = false;
      this.rowIndexCpy = null;
    }, 3000);
  }
  returnCopyClasses(i) {
    let styleClass = 'ti-files'
    if (this.rowIndex == i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle text-white';
    } else if (this.rowIndex == i && this.rowIndexCpy != i) {
      styleClass = 'ti-files text-white';
    } else if (this.rowIndex == !i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else if (this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else {
      styleClass = 'ti-files';
    }
    return styleClass;
  }
  returnCopyClassesBulk(i) {
    let styleClass = 'ti-files'
    if (this.rowIndexBulk == i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle text-white';
    } else if (this.rowIndexBulk == i && this.rowIndexCpy != i) {
      styleClass = 'ti-files text-white';
    } else if (this.rowIndexBulk == !i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else if (this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else {
      styleClass = 'ti-files';
    }
    return styleClass;
  }

  copyVisitNo(visitno: any) {
    this.helper.copyMessage(visitno);
  }
  copyAllVisitNo(visitno: any) {
    let studies = '';
    visitno.forEach(item => {
      studies += `${item.VisitId} (${item.Code})\n`;
    });
    this.helper.copyMessage(studies);
  }

  //Technician History/////////////////////////////////
  TechnicianHistory = "";
  TechnicianHistoryJSON = "";
  techHistoryValidityCheck = false;
  techHistoryModalityCheck = false;
  isDoneTechHistory = 0;
  objJson = []
  insertUpdateTechnicianWorkList() {
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
      ///////////////////
      TPID: this.TPId,
      VisitID: Number(this.VisitID),
      RISWorkListID: this.RISWorkListID,
      // AppointmentID: null,
      PatientID: this.PatientId,
      LocID: this.RegLocId,
      RISStatusID: (!this.RISStatusID || this.RISStatusID == 1 || this.RISStatusID == 2) ? 3 : this.RISStatusID,
      // TechnicianHistory: this.TechnicianHistory,
      // TechnicianHistoryJSON: JSON.stringify(mergeObj),
      // MachineStartTime: null,//this.machineStartTime,
      // MachineStopTime: null, //this.machineStopTime,
      // MachineModalityID: null, //this.MachineModalityID,
      // RadiologistID: null, //this.RadiologistID,
      // PendCheckInRemarks: null, //this.PendCheckInRemarks || null,
      CreatedBy: this.VerifiedUserID || -99,

    }
    // console.log("objParam for tech checklist____________", objParam);//return;

    this.techSrv.insertUpdateTechnicianWorkList(objParam).subscribe((data: any) => {
      const respons = JSON.parse(data.PayLoadStr);
      if (respons.length) {
        if (data.StatusCode == 200) {
          this.toastr.success(data.Message);
          this.RISStatusID = respons[0].RISStatusID;
          this.RISWorkListID = respons[0].RISWorkListID;
          this.isDoneTechHistory = 1;
          this.getRisworkList(this.paramsValuesForWorkList);
          if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
            this.getRISWorkListSummary(this.paramsValuesForWorkList);
        } else {
          this.toastr.error('Error occured while saving tech history!')
        }
      }
    }, (err) => {
      console.log(err);
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
  markSensitivity_(row) {
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
        input: 'custom-radio'
      },
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.ProcessID = result.value;
        this.updateVisitTestPriority(row)
      }
    });
  }
  ProcessRemarks = "";
  isChkUrgent = '';
  isChkCritical = '';
  async markSensitivity(row) {
    (row.ProcessId == 2) ? this.isChkUrgent = 'checked' : this.isChkUrgent = '';
    (row.ProcessId == 3) ? this.isChkCritical = 'checked' : this.isChkCritical = '';
    const { value: formValues } = await Swal.fire({
      title: 'Mark Sensitivity <i class="ti-flag-alt text-danger"></i>',
      html:
        `<strong class="text-primary">` + row.PatientName + `: ` + row.VisitNo + `-` + row.TPCode + `</strong>
        <p>Are you Sure want to change sensitivity?</p>
        <div>
          <input type="radio" id="swal-radio1" name="swal-radio" `+ this.isChkUrgent + ` value="2">
          <label for="swal2-label"><span class="swal2-label mr-4">Urgent</span></label>
          <input type="radio" id="swal-radio2" name="swal-radio" `+ this.isChkCritical + ` value="3">
          <label for="swal-radio2"><span class="swal2-label">Critical<span></label>
        </div>
        <textarea id="swal-textarea" class="form-control" placeholder="Enter Remarks"></textarea>`,
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
          return false;
        } else if (!processID) {
          Swal.showValidationMessage('Please select any option');
          return false;
        } else if (processRemarks == '') {
          Swal.showValidationMessage('Please enter remarks');
          return false;
        }
        else {
          return [
            (document.querySelector('input[name="swal-radio"]:checked') as HTMLInputElement)?.value,
            (document.getElementById('swal-textarea') as HTMLTextAreaElement).value,
          ]
        }

      }
    });

    if (formValues && formValues[0] && formValues[1] != '') {
      this.ProcessID = Number(formValues[0]);
      const remarksPrepend = this.ProcessID == 2 ? "Urgent Remarks for " + row.TPCode + ": " : "Critical Remarks for " + row.TPCode + ": ";
      this.ProcessRemarks = remarksPrepend + formValues[1]
      this.updateVisitTestPriority(row)
      this.saveVisitRemarks(row)
    }
    // else {
    //   this.toastr.error("Something went wrong please try again!")
    // }
  }

  async markSensitivityAssigner(row) {
    this.clearRadiologistSummary();
    this.clearAllRadiologistSummary();
    (this.ProcessID == 2) ? this.isChkUrgent = 'checked' : this.isChkUrgent = '';
    (this.ProcessID == 3) ? this.isChkCritical = 'checked' : this.isChkCritical = '';
    const { value: formValues } = await Swal.fire({
      title: 'Mark Sensitivity',
      html:
        `<strong class="text-primary">` + this.PatientName + `: ` + this.VisitIDWithDashes + `-` + this.TPCode + `</strong>
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
          return false;
        } else if (!processID) {
          Swal.showValidationMessage('Please select any option');
          return false;
        } else if (processRemarks == '') {
          Swal.showValidationMessage('Please enter remarks');
          return false;
        }
        else {
          return [
            (document.querySelector('input[name="swal-radio"]:checked') as HTMLInputElement)?.value,
            (document.getElementById('swal-textarea') as HTMLTextAreaElement).value,
          ]
        }

      }
    });

    if (formValues && formValues[0] && formValues[1] != '') {
      this.ProcessID = Number(formValues[0]);
      const remarksPrepend = this.ProcessID == 2 ? "Urgent Remarks for " + this.TPCode + ": " : "Critical Remarks for " + this.TPCode + ": ";
      this.ProcessRemarks = remarksPrepend + formValues[1]
      this.updateVisitTestPriority({ TPId: this.TPId, VisitNo: this.VisitID })
      this.saveVisitRemarks({ TPId: this.TPId, VisitNo: this.VisitID })
    }
    // else {
    //   this.toastr.error("Something went wrong please try again!")
    // }
  }

  updateVisitTestPriority(row) {
    const objParams = {
      VisitID: row.VisitNo.replaceAll("-", ""),
      TPID: row.TPId,
      ProcessID: this.ProcessID,
      Remarks: this.ProcessRemarks.trim(),
      CreatedBy: this.loggedInUser.userid || -99 // -99 incase of null
    }
    this.questionnaireSrv.updateVisitTestPriority(objParams).subscribe((res: any) => {
      const respons = JSON.parse(res.PayLoadStr);
      if (res.StatusCode == 200) {
        this.toastr.success(res.Message, "Test Sensitivity");
        this.getRisworkList(this.paramsValuesForWorkList);
        if (!this.paramsValuesForWorkList.visitID && this.paramsValuesForWorkList.dateFrom && this.paramsValuesForWorkList.dateTo)
          this.getRISWorkListSummary(this.paramsValuesForWorkList);
      }
    }, (err) => {
      console.log(err),
        this.toastr.error("Some error occured, Please contact system administrator")
    })
  }

  saveVisitRemarks(row) {
    const params = {
      VisitId: Number(row.VisitNo.replaceAll("-", "")),
      ModuleName: this.moduleScreenName,
      Remarks: this.ProcessRemarks.trim(),
      Priority: 1,
      UserId: this.loggedInUser.userid,
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
  saveVisitRemarksAssigner(row) {
    const params = {
      VisitId: Number(row.VisitId),
      ModuleName: this.moduleScreenName,
      Remarks: row.Remarks,
      Priority: row.Priority,
      UserId: row.UserId,
    };

    this.visitRemarksService.saveVisitRemarks(params).subscribe((res: any) => {
    }, (err) => {
      console.log(err);
    });
  }
  getRowInfoForUnassign(row) {
    this.TPIds = [row.TPId];
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.EmpID = row.EmpId;
    this.assignTestToDoctor(9, 'bulk'); // bulk is for: calling from bulk screen and 9 is for unassign status;
  }

  isDisabledAssignment = false;
  isSpinnerAssignment = true;
  isDisabledUnassignment = false;
  isSpinnerUnassignment = true;

  isDisabledAssignmentBulk = false;
  isSpinnerAssignmentBulk = true;
  isDisabledUnassignmentBulk = false;
  isSpinnerUnassignmentBulk = true;
  isInitSubmitted = false;
  isDSSubmitted = false;
  withRemarks = true;
  assignTestToDoctor(statusID, screen) {
    if ((!this.InitByEmpID || !this.DSByEmpID) && screen !== 'bulk') {
      if (!this.InitByEmpID && !this.DSByEmpID) {
        this.toastr.error("Please select the Doctors", "Validation Failed");
      } else if (!this.InitByEmpID) {
        this.toastr.error("Please select Init By Doctor", "Validation Failed");
      } else if (!this.DSByEmpID) {
        this.toastr.error("Please select DS By Doctor", "Validation Failed");
      }

      this.isInitSubmitted = true;
      this.isDSSubmitted = true;
      return;
    }
    if (!this.InitByEmpID && !this.DSByEmpID && !this.TPIds.length && screen != 'bulk') {
      this.toastr.error("Please select the Doctor and  Test(s) to assign", "Validation Faild");
      return
    } else if (!this.TPIds.length && screen != 'bulk') {
      this.toastr.error("Please select Test(s) to assign", "Validation Faild");
      return
    } else {
      this.clearRadiologistSummary();
      this.clearAllRadiologistSummary();
      if (screen != 'bulk' && statusID == 8) {
        this.isDisabledAssignment = true;
        this.isSpinnerAssignment = false;
      } else if (screen != 'bulk' && statusID == 9) {
        this.isDisabledUnassignment = true;
        this.isSpinnerUnassignment = false;
      } else if (screen == 'bulk' && statusID == 8) {
        this.isDisabledAssignmentBulk = true;
        this.isSpinnerAssignmentBulk = false;
      } else if (screen == 'bulk' && statusID == 9) {
        this.isDisabledUnassignmentBulk = true;
        this.isSpinnerUnassignmentBulk = false;
      }

      const objParam = {
        TPIDs: this.TPIds.join(","),
        VisitID: Number(this.VisitID),
        EmpID: this.DSByEmpID,
        InitByEmpID: this.InitByEmpID,
        DSByEmpID: this.DSByEmpID,
        LocID: this.loggedInUser.locationid || -99, //incase of null or empty,
        RISStatusID: statusID,
        Remarks: '',
        CreatedBy: this.loggedInUser.userid || -99,//incase of null or empty
      }

      // console.log("objParam_________", objParam); return;
      this.techSrv.insertUpdateVisitTestAssignmentV2(objParam).subscribe((data: any) => {
        this.isDisabledAssignment = false;
        this.isSpinnerAssignment = true;
        this.isDisabledAssignmentBulk = false;
        this.isSpinnerAssignmentBulk = true;
        this.isDisabledUnassignment = false;
        this.isSpinnerUnassignment = true;
        this.isDisabledUnassignmentBulk = false;
        this.isSpinnerUnassignmentBulk = true;

        const respons = JSON.parse(data.PayLoadStr);
        if (respons[0].Result === 2) {
          this.toastr.error(data.Message); return;
        }
        if (respons[0].IsExists) {
          this.toastr.warning("This Test is already assigned");
          this.getRISWorklistRow(Number(this.VisitID), this.TPId)
          return;
        }
        if (respons.length) {
          if (data.StatusCode == 200) {
            if (this.withRemarks && statusID == 8 && respons[0].isExistTPStatus <= 8 && respons[0].isExistTPStatus > 0) {
              const remarks = this.composeAssignmentRemarks();
              this.saveVisitRemarksAssigner({
                VisitId: Number(this.VisitID),
                ModuleName: this.moduleScreenName,
                Remarks: remarks,
                Priority: 1,
                UserId: this.loggedInUser.userid,
              })
            }
            if (respons[0].isExistTPStatus <= 8 && respons[0].isExistTPStatus > 0) {
              this.toastr.success(data.Message);
              this.isInitSubmitted = false;
              this.isDSSubmitted = false;
            } else if (respons[0].isExistTPStatus == 9) {
              this.toastr.warning("The report has already been finalized, and your action cannot be performed.");
            } else if (respons[0].isExistTPStatus == 12) {
              this.toastr.warning("The report has already been delivered, and your action cannot be performed.");
            } else if (respons[0].isExistTPStatus == -1) {
              this.toastr.warning("The report has already been cancelled, and your action cannot be performed.");
            } else if (respons[0].isExistTPStatus == -2) {
              this.toastr.warning("The report has sent for cancellation request, and your action cannot be performed.");
            } else {
              this.toastr.warning("Your action cannot be performed.");
            }

            this.pagination.paginatedSearchResults.splice(this.rowIndex, 1);
            // this.pagination.paginatedSearchResults = this.pagination.paginatedSearchResults.filter(item => item.TPId != this.TPId && item.VisitNo!=this.VisitIDWithDashes);
            const nextRow = this.pagination.paginatedSearchResults.find((item, index) => index == this.rowIndex);
            if (nextRow)
              setTimeout(() => {
                this.assignTest(nextRow, this.rowIndex)
              }, 200);
            // this.getRisworkList(this.paramsValuesForWorkList);
            // this.getRISWorkListSummary(this.paramsValuesForWorkList);
            // if(this.paramsValuesForWorkList.AssignemntFilter==1){
            //   // this.isAll = true;
            //   // this.isAssigned = false;
            //   // this.isUnassigned = false;
            //   --this.countAssignerSubAll;
            // }else 
            if (this.paramsValuesForWorkList.AssignemntFilter == 1) {

              // this.isAll = false;
              // this.isAssigned = true;
              // this.isUnassigned = false;
              if (statusID == 8) {
                --this.countAssignerUnassigned;
                if (respons[0].isExistTPStatus <= 8 && respons[0].isExistTPStatus > 0) { ++this.countAssignerAssigned; }
              } else if (statusID == 9) {
                if (respons[0].isExistTPStatus <= 8 && respons[0].isExistTPStatus > 0) { ++this.countAssignerUnassigned; }
                --this.countAssignerAssigned;
              }
            } else if (this.paramsValuesForWorkList.AssignemntFilter == 2) {

              // this.isAll = false;
              // this.isAssigned = true;
              // this.isUnassigned = false;
              --this.countAssignerAssigned;
              if (respons[0].isExistTPStatus <= 8 && respons[0].isExistTPStatus > 0) { ++this.countAssignerUnassigned };
            } else if (this.paramsValuesForWorkList.AssignemntFilter == 3) {
              // this.isAll = false;
              // this.isAssigned = false;
              // this.isUnassigned = true;
              // this.countAssignerUnassigned = this.countAssignerUnassigned-1
              --this.countAssignerUnassigned;
              if (respons[0].isExistTPStatus <= 8 && respons[0].isExistTPStatus > 0) { ++this.countAssignerAssigned; }

            }
            else {
              --this.countAssignerUnassigned;
              if (respons[0].isExistTPStatus <= 8 && respons[0].isExistTPStatus > 0) { ++this.countAssignerAssigned; }

            }
            this.TPId = null;
            // this.rowIndex = null;

            // setTimeout(() => {
            //   this.assignTest(this.pagination.filteredSearchResults[0], 0)
            // }, 300);

          } else {
            this.isDisabledAssignment = false;
            this.isSpinnerAssignment = true;
            this.toastr.error('Something went wrong!')
          }
        }
      }, (err) => {
        console.log(err);
        this.isDisabledAssignment = false;
        this.isSpinnerAssignment = true;
        this.isDisabledAssignment = false;
        this.isSpinnerAssignment = true;
        this.toastr.error('Connection error');
      })
    }
  }

  private composeAssignmentRemarks(): string {
    const testName = this.TPCode?.trim() || 'Test';
    const initName = this.assigneeInItName?.trim();
    const dsName = this.assigneeDSName?.trim();
    const initId = this.InitByEmpID;
    const dsId = this.DSByEmpID;

    if (initId && dsId && initId === dsId) {
      return `${testName} assigned to ${dsName} for Preliminary Reporting and Review/Final DS.`;
    }

    if (initId && dsId && initId !== dsId) {
      return `${testName} assigned to ${initName} for Preliminary Reporting and ${dsName} for Review/Final DS.`;
    }

    return `${testName} assignment created.`; // fallback, ideally never hit
  }


  unAssignTestBulk(rowIndex, row) {
    this.clearRadiologistSummary();
    this.clearAllRadiologistSummary();
    this.isDisabledUnassignmentBulk = true;
    this.isSpinnerUnassignmentBulk = false;
    const objParam = {
      TPIDs: row.TPId,
      VisitID: Number(row.VisitNo.replaceAll("-", "")),
      EmpID: this.EmpID,
      LocID: this.loggedInUser.locationid || -99,
      RISStatusID: 9,
      Remarks: '',
      CreatedBy: this.loggedInUser.userid || -99,
    }
    // console.log("objParam_____________", objParam)
    this.techSrv.insertUpdateVisitTestAssignment(objParam).subscribe((data: any) => {
      this.isDisabledUnassignmentBulk = false;
      this.isSpinnerUnassignmentBulk = true;
      const respons = JSON.parse(data.PayLoadStr);

      if (respons.length) {
        if (data.StatusCode == 200) {
          // this.toastr.success(data.Message);
          if (respons[0].isExistTPStatus <= 8 && respons[0].isExistTPStatus > 0) {
            this.toastr.success(data.Message);
          } else if (respons[0].isExistTPStatus == 9) {
            this.toastr.warning("The report has already been finalized, and your action cannot be performed.");
          } else if (respons[0].isExistTPStatus == 12) {
            this.toastr.warning("The report has already been delivered, and your action cannot be performed.");
          } else if (respons[0].isExistTPStatus == -1) {
            this.toastr.warning("The report has already been cancelled, and your action cannot be performed.");
          } else if (respons[0].isExistTPStatus == -2) {
            this.toastr.warning("The report has sent for cancellation request, and your action cannot be performed.");
          } else {
            this.toastr.warning("Your action cannot be performed.");
          }
          this.pagination.paginatedSearchResults.splice(rowIndex, 1);
          --this.countAssignerAssigned;
          ++this.countAssignerUnassigned;
          this.TPId = null;
        } else {
          this.toastr.error('Something went wrong!')
        }
      }
    }, (err) => {
      console.log(err);
      this.isDisabledAssignment = false;
      this.isSpinnerAssignment = true;
      this.toastr.error('Connection error');
    })
  }


  filterReportingList(filterBy) {
    this.paramsValuesForWorkList.filterBy = filterBy;
    this.getRisworkList(this.paramsValuesForWorkList);
  }

  openReportingModalPopup(row, index) {
    this.isTechDisclaimer = false;
    this.VerifiedUserID = null;
    this.rowIndex = index;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.StatusId = row.StatusId;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.TestStatus = row.TestStatus;
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    this.getVitals();
    setTimeout(() => {
      this.appPopupService.openModal(this.reportingModal, { backdrop: 'static', size: 'fss' });
    }, 200);
  }

  disabledButtonUnlock = false;
  isSpinnerUnlock = true;
  updateRadioReportLock() {
    const objParam = {
      VisitID: Number(this.VisitId),
      TPID: this.TPId,
      LockedBy: null,
    }
    this.disabledButtonUnlock = true;
    this.isSpinnerUnlock = false;
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RADIO_REPORT_LOCK, objParam).subscribe((data: any) => {
      this.disabledButtonUnlock = false;
      this.isSpinnerUnlock = true;
      if (data.StatusCode == 200) {
        this.toastr.success("Study has been unlocked");
        this.isLocked = null;
      } else {
        this.toastr.error('Error occured while Unlock the study!')
        this.disabledButtonUnlock = false;
        this.isSpinnerUnlock = true;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection with database is not made,  Please contact System Support !');
    })
  }

  isLocked = null;
  getRadioReportVisitTestStatus() {
    const objParam = {
      VisitID: this.VisitId,
      TPID: this.TPId,
    }
    this.sharedService.getData(API_ROUTES.GET_RADIO_REPORT_VISIT_TEST_STATUS, objParam).subscribe((data: any) => {
      const response = data.PayLoad;
      if (response && response.length) {
        this.isLocked = response[0].LockedBy;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  subSectionList = []
  getSubSection() {
    this.subSectionList = [];
    const objParam = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_SUBSECTION_SECTIONID, objParam).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }

  // readiologinstSummary = [];
  // pendingPINList = [];
  // AllCount = 0;
  // PendingCount = 0;
  // FinalCount = 0;
  AllStudies = [];
  PendingStudies = [];
  FinalStudies = [];

  SubSectionId = null;
  getRadiologistSummary(param) {
    this.SubSectionId = param ? param.SubSectionId : null;
    // if(!this.EmpID){
    //   this.toastr.warning("Please select the doctor first!","No Doctor Selected")
    //   return
    // }else{
    //   this.clearRadiologistSummary();
    //   this.SubSectionId = param ? param.SubSectionId : null;
    //   let objParam = {
    //     EmpID: this.EmpID,
    //     SectionID: this.SubSectionId,
    //     DateFrom: this.paramsValuesForWorkList.dateFrom,
    //     DateTo: this.paramsValuesForWorkList.dateTo
    //   }
    //   // if (this.SubSectionId) {
    //     this.spinner.show(this.spinnerRefs.readiologinstSummarySection)//;;return;
    //     this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_SUMMARY, objParam).subscribe((resp: any) => {
    //       this.spinner.hide(this.spinnerRefs.readiologinstSummarySection);
    //       if (resp.StatusCode == 200) {
    //         let readiologinstSummary = resp.PayLoadDS || [];
    //         // if(this.readiologinstSummary["Table"] && this.readiologinstSummary["Table"].length){

    //         //   this.AllCount = this.readiologinstSummary["Table"][0].TC;
    //         //   this.PendingCount = this.readiologinstSummary["Table"][0].PC;
    //         //   this.FinalCount = this.readiologinstSummary["Table"][0].FC;
    //         // }
    //         // if(this.readiologinstSummary["Table1"] && this.readiologinstSummary["Table1"].length){
    //         //   this.pendingPINList = this.readiologinstSummary["Table1"];
    //         // }
    //         this.AllStudies = readiologinstSummary.Table || [];
    //         this.FinalStudies = readiologinstSummary.Table1 || [];
    //         this.PendingStudies = readiologinstSummary.Table2 || [];
    //       }
    //     }, (err) => {
    //       console.log("Some error occured:", err)
    //       this.spinner.hide(this.spinnerRefs.readiologinstSummarySection);
    //     })
    //   // }

    // }


  }
  getInintByRadiologistSummary(param) {
    this.SubSectionId = param ? param.SubSectionId : null;
    this.clearInitRadiologistSummary();
  }
  SubSectionIdDSBy = null;
  getDSByRadiologistSummary(param) {
    this.SubSectionIdDSBy = param ? param.SubSectionId : null;
    this.clearRadiologistSummaryDSBy();

  }

  clearRadiologistSummary() {
    this.isLoadSummaryMethodCalled = false
    // this.SubSectionId = null
    this.AllStudies = [];
    this.FinalStudies = [];
    this.PendingStudies = [];
  }

  AllInitStudies = [];
  PendingInitStudies = [];
  FinalInitRadioStudies = [];
  clearInitRadiologistSummary() {
    this.isLoadInitSummaryMethodCalled = false
    // this.SubSectionId = null
    this.AllInitStudies = [];
    this.FinalInitRadioStudies = [];
    this.PendingInitStudies = [];
  }
  clearRadiologistSummaryDSBy() {
    this.isLoadDSSummaryMethodCalled = false
    this.AllStudiesDSBy = [];
    this.FinalStudiesDSBy = [];
    this.PendingStudiesDSBy = [];
  }

  clearAllRadiologistSummary() {
    this.isLoadSummaryMethodCalled = false
    this.isLoadInitSummaryMethodCalled = false
    this.isLoadDSSummaryMethodCalled = false
    this.AllStudies = [];
    this.FinalStudies = [];
    this.PendingStudies = [];
    this.AllInitStudies = [];
    this.FinalInitRadioStudies = [];
    this.PendingInitStudies = [];
    this.AllStudiesDSBy = [];
    this.FinalStudiesDSBy = [];
    this.PendingStudiesDSBy = [];
  }

  getStudyName(e, VisitID) {
    this.isDisabledAssignment = false;
    const TPID = e.target.value;
    // console.log("TPID______this.VisitID_",TPID,this.VisitID);
    // console.log("risworklist is ",this.risWorkist)
    const tpObj = this.visitTestsAssigner.find(a => a.TPID == TPID);
    this.TPCode = tpObj.TestProfileCode;
    this.TPName = tpObj.TestProfileName;
    this.getRISWorklistRow(VisitID, TPID)
    // let filterObj = this.risWorkist.find(a => a.TPId == TPID && a.VisitNo.replaceAll("-", "") == this.VisitID)
    // console.log("filterObj___________________",filterObj)
    setTimeout(() => {
      this.assignTest(this.RISWorklistRow[0], this.rowIndex)
    }, 200);
    // this.assignTest(filterObj, this.rowIndex)
  }
  isFieldDisabled = false;
  rowIndexBulk = null;
  selectAllTPStoreItems(e) {
    this.pagination.paginatedSearchResults.forEach(a => {
      a.checked = false;
      // if (a.RISStatusID != 8) {
      //   a.checked = e.target.checked;
      // }
      // if(!this.isDissabledChk){
      //   if (a.RISStatusID != 8) {
      //     a.checked = e.target.checked;
      //   }
      // }else{
      //   if (a.RISStatusID == 8) {
      //     a.checked = e.target.checked;
      //   }
      // }
      if ((!this.isDissabledChk && a.RISStatusID != 8) || (this.isDissabledChk && a.RISStatusID == 8)) {
        a.checked = e.target.checked;
      }
    })
    this.checkedItemCount = e.target.checked ? this.pagination.paginatedSearchResults.filter(item => item.checked).length : 0;
    this.mainChk = this.pagination.paginatedSearchResults.length == this.checkedItemCount ? true : false;
  }
  selectRadiologistForAll(param) {
    this.radiologistPic = null;
    let EmpId
    if (param) {
      EmpId = param.EmpId;
      this.EmpID = EmpId;
      this.InitByEmpID = EmpId;
      this.getEmployeePic(this.EmpID);
      this.clearRadiologistSummary();
      this.clearAllRadiologistSummary();
      // setTimeout(() => {
      //   this.getRadiologistSummary(null);
      // }, 200);
      this.pagination.paginatedSearchResults.forEach(a => {
        if (EmpId) {
          a.EmpId = EmpId;
        }
      });
    } else {
      this.isLoadSummaryMethodCalled = false;
    }
  }
  //Summary for InitBy
  selectRadiologistForAllinit(param) {
    this.radiologistPic = null;
    let EmpId
    if (param) {
      EmpId = param.EmpId;
      this.EmpID = EmpId;
      this.InitByEmpID = EmpId;
      this.getInitEmployeePic(this.EmpID);
      // this.clearRadiologistSummary();
      this.clearInitRadiologistSummary();
      // setTimeout(() => {
      //   this.getRadiologistSummary(null);
      // }, 200);
      this.pagination.paginatedSearchResults.forEach(a => {
        if (EmpId) {
          a.InitByEmpID = EmpId;
        }
      });
    } else {
      this.isLoadSummaryMethodCalled = false;
    }
  }

  EmpIDforDS
  selectRadiologistForAllDS(param) {
    this.radiologistPic = null;
    let EmpId
    if (param) {
      EmpId = param.EmpId;
      this.EmpIDforDS = EmpId;
      this.getEmployeePic(this.EmpIDforDS);
      this.clearRadiologistSummary();
      // setTimeout(() => {
      //   this.getRadiologistSummary(null);
      // }, 200);
      this.pagination.paginatedSearchResults.forEach(a => {
        if (EmpId) {
          a.DSByEmpID = EmpId;
        }
      });
    } else {
      this.isLoadSummaryMethodCalled = false;
    }
  }
  checkedItemCount = 0;
  mainChk = false;
  countCheckedItems() {
    const checkedItems = this.pagination.paginatedSearchResults.filter(item => item.checked);
    this.checkedItemCount = checkedItems.length;
    this.mainChk = this.pagination.paginatedSearchResults.length == this.checkedItemCount ? true : false;
  }
  buttonClicked = false;
  assignTestToDoctorBulk(statusID) {
    let isValidAssignmentObj = false;      // Both Init and DS missing in a row
    let isValidAssignmentObjInit = false;  // Init missing
    let isValidAssignmentObjDS = false;    // DS missing
    this.buttonClicked = true;
    const checkedItems = this.pagination.paginatedSearchResults.filter(a => a.checked);
    if (!checkedItems.length) {
      this.toastr.warning("Please select test(s) to assign", "Warning");
      return;
    }
    checkedItems.forEach(a => {
      const missingInit = !a.InitByEmpID;
      const missingDS = !a.DSByEmpID;

      if (missingInit && missingDS) {
        isValidAssignmentObj = true;
      } else if (missingInit) {
        isValidAssignmentObjInit = true;
      } else if (missingDS) {
        isValidAssignmentObjDS = true;
      }
    });
    if (isValidAssignmentObj || (isValidAssignmentObjInit && isValidAssignmentObjDS)) {
      this.toastr.error("Please select the Init and DS doctors against selected tests!", "Validation Failed");
    } else if (isValidAssignmentObjInit) {
      this.toastr.error("Please select the Init doctors against selected tests!", "Validation Failed");
    } else if (isValidAssignmentObjDS) {
      this.toastr.error("Please select the DS doctors against selected tests!", "Validation Failed");
    } else {
      this.clearRadiologistSummary();
      this.isDisabledAssignment = true;
      this.isSpinnerAssignment = false;
      const objParam = {
        LocID: this.loggedInUser.locationid || -99, //incase of null or empty,
        RISStatusID: statusID,
        CreatedBy: this.loggedInUser.userid || -99,//incase of null or empty
        tblVisitTestAssignmentV2: checkedItems.map(a => {

          return {
            VisitId: Number(a.VisitNo.replaceAll("-", "")),
            TPId: a.TPId,
            EmpId: a.DSByEmpID,//a.EmpId,
            InitByEmpID: a.InitByEmpID,
            DSByEmpID: a.DSByEmpID,
            RemarksForAssign: a.RemarksForAssign ? a.Remarks : null,
            RemarksForUnassign: a.RemarksForUnassign ? a.Remarks : null,
            Form: 'Bulk Visit Tests Assignment',
            VisitRemarks: this.buildVisitRemarks(
              a.TPCode,
              a.InitByEmpID,
              a.DSByEmpID,
              statusID
            ),
            PRIORITY: 1
          }
        })
      }
      // return 
      console.log("objParam for Assigner", objParam); //return;
      this.techSrv.insertUpdateBulkVisitTestAssignmentV2(objParam).subscribe((data: any) => {
        this.buttonClicked = false;
        this.isDisabledAssignment = false;
        this.isSpinnerAssignment = true;
        const respons = JSON.parse(data.PayLoadStr);
        if (respons[0].Result === 2) {
          this.toastr.error(data.Message); return;
        }
        if (respons[0].IsExists) {
          this.toastr.warning("In your selection some test(s) have alreay been assigned, Please refresh your list and retry.");
          // this.getRISWorklistRow(Number(this.VisitID),this.TPId)
          return;
        }
        if (respons.length) {
          if (data.StatusCode == 200) {

            this.toastr.success(data.Message);
            this.mainChk = false;
            // this.getRisworkList(this.paramsValuesForWorkList);
            // this.getRISWorkListSummary(this.paramsValuesForWorkList);
            this.pagination.paginatedSearchResults = this.pagination.paginatedSearchResults.filter(item =>
              !checkedItems.some(subtractItem =>
                item.VisitNo === subtractItem.VisitNo && item.TPId === subtractItem.TPId
              )
            );

            this.TPId = null;
            this.rowIndex = null;

            // Replaced these three lines by following block for page list filter setting
            // this.isAll = true;
            // this.isAssigned = false;
            // this.isUnassigned = false;
            if (this.paramsValuesForWorkList.AssignemntFilter == 1) {
              this.isAll = true;
              this.isAssigned = false;
              this.isUnassigned = false;
              if (statusID == 8) {
                this.countAssignerUnassigned = this.countAssignerUnassigned - checkedItems.length;
                this.countAssignerAssigned = this.countAssignerAssigned + checkedItems.length;
              } else {
                --this.countAssignerUnassigned;
                ++this.countAssignerAssigned;
              }
            } else if (this.paramsValuesForWorkList.AssignemntFilter == 2) {

              if (statusID == 8) {
                this.isAll = false;
                this.isAssigned = true;
                this.isUnassigned = false;
                --this.countAssignerAssigned;
                ++this.countAssignerUnassigned;
              } else {
                this.countAssignerUnassigned = this.countAssignerUnassigned + checkedItems.length;
                this.countAssignerAssigned = this.countAssignerAssigned - checkedItems.length;
              }


            } else if (this.paramsValuesForWorkList.AssignemntFilter == 3) {
              this.isAll = false;
              this.isAssigned = false;
              this.isUnassigned = true;
              // --this.countAssignerUnassigned;
              // ++this.countAssignerAssigned;
              this.countAssignerUnassigned = this.countAssignerUnassigned - checkedItems.length;
              this.countAssignerAssigned = this.countAssignerAssigned + checkedItems.length;
            } else {
              this.isAll = true;
              this.isAssigned = false;
              this.isUnassigned = false;
              --this.countAssignerUnassigned;
              ++this.countAssignerAssigned;
            }



            // setTimeout(() => {
            //   this.assignTest(this.pagination.filteredSearchResults[0], 0)
            // }, 300);

          } else {
            this.toastr.error('Error occured while assigning test(s)!')
          }
        }
      }, (err) => {
        console.log(err);
        this.isDisabledAssignment = false;
        this.isSpinnerAssignment = true;
        this.toastr.error('Connection error');
      })
    }
  }

  private buildVisitRemarks(
    tpCode: string,
    initByEmpID: number,
    dsByEmpID: number,
    statusID: number
  ): string { 
    const getDoctorName = (empId: number): string => {
      const dr = this.radoiologistList.find(d => d.EmpId === empId);
      return dr ? dr.FullName : '';
    };

    const initAssigneeName = getDoctorName(initByEmpID);
    const dsAssigneeName = getDoctorName(dsByEmpID);

    const actionText = (statusID === 8) ? 'assigned to' : 'unassigned from';

    // SAME Init & DS doctor
    if (initByEmpID && dsByEmpID && initByEmpID === dsByEmpID) {
      return (
        tpCode + ' ' + actionText + ' ' +
        initAssigneeName +
        ' for Preliminary Reporting and Review/Final DS.'
      );
    }

    // DIFFERENT Init & DS doctors
    return (
      tpCode + ' ' + actionText + ' ' +
      initAssigneeName +
      ' for Preliminary Reporting and ' +
      dsAssigneeName +
      ' for Review/Final DS.'
    );
  }



  MOForm: any = "";
  openVisitDetailModal(row, i) {
    console.log("mo-row", row);
    this.rowIndexBulk = i;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.VisitId = this.VisitID;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.isConsentRead = row.isConsentRead;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.InitializedBy = row.InitializedBy;
    this.InitializedOn = row.InitializedOn;
    this.isMetal = row.isMetal;
    this.isPreMedical = row.isPreMedical;
    this.RadiologistID = row.RadiologistID;
    this.getVitals();
    if (this.screenIdentity == 'bulk-queue-manager') {
      this.getRadiologistRefByMappingInfo(this.VisitID)
    }
    this.appPopupService.openModal(this.visitTPDetailModal, { backdrop: 'static', size: 'fss' });
  }
  visitDetailBtnClicked = false;
  showVisitDetail(row, i) {
    this.visitDetailBtnClicked = true;
    // console.log("mo-row - visitdetail", row);
    this.rowIndex = i;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.VisitId = this.VisitID;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.isConsentRead = row.isConsentRead;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.InitializedBy = row.InitializedBy;
    this.InitializedOn = row.InitializedOn;
    this.scrollToDetail();
    // this.getVitals();
  }
  scrollToDetail() {
    setTimeout(() => {
      // if(this.screenIdentity=='tech-worklist'){
      if (this.detailArea.nativeElement) {
        this.detailArea.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
      // }
    }, 200);
  }


  loggedInUserLocCode = "F8";
  printRadioLable(row, i) {
    this.loggedInUserLocCode = this.loggedInUser.currentLocation;
    this.rowIndex = i;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitId = this.VisitID;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    if (this.TPId && this.VisitId) {
      const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitId, TPID: this.TPId, UserLoc: this.loggedInUserLocCode, appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
      window.open(url.toString(), '_blank');
    }
  }
  docsLength = null;
  getLoadedDocs(e) {
    this.docsLength = e.length;
  }

  RISWorklistRow = []
  getRISWorklistRow(VisitID, TPID) {
    
    this.visitDetailBtnClicked = false;
    this.RISWorklistRow = []
    const params = {
      VisitID: VisitID,
      TPID: TPID
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_WORKLIST_ROW, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.RISWorklistRow = res.PayLoad || [];
        const row = this.RISWorklistRow[0];
        if (row.RISStatusID) {
          this.WorkflowStatus = row["Workflow Status"]
          this.EmpID = row.EmpId;
          this.InitByEmpID = row.InitByEmpID;
          this.DSByEmpID = row.DSByEmpID;
          this.StatusId = row.StatusId;
          this.TestStatus = row.TestStatus;
          this.StatusId = row.StatusId;
          this.TPId = row.TPId;
          this.VisitID = row.VisitNo.replaceAll("-", "");
          this.VisitIDWithDashes = row.VisitNo;
          this.TPCode = row.TPCode;
          this.TPName = row.TPName;
          this.PatientName = row.PatientName;
          this.PatientId = row.PatientId;
          this.RISStatusID = row.RISStatusID;
          this.PatientPhoneNumber = row.PhoneNumber;
          this.RISWorkListID = row.RISWorkListID;
          this.MOBy = row.MOBy;
          this.isConsentRead = row.isConsentRead;
          this.isTechHistoryRequred = row.isTechHistoryRequred;
          this.SubSectionId = row.SubSectionId;
          this.isPreMedical = row.isPreMedical;
          this.isMetal = row.isMetal;
          const assignee = (this.EmpID) ? this.radoiologistList.find(item => item.EmpId == this.EmpID) : null;
          this.assigneeName = (assignee) ? assignee.FullName + "(" + assignee.LocationFromIorgLoc + ")" : null;

          const assigneeInIt = (this.InitByEmpID) ? this.radoiologistList.find(item => item.EmpId == this.InitByEmpID) : null;
          this.assigneeInItName = (assigneeInIt) ? assigneeInIt.FullName + "(" + assigneeInIt.LocationFromIorgLoc + ")" : null;

          const assigneeDS = (this.DSByEmpID) ? this.radoiologistList.find(item => item.EmpId == this.DSByEmpID) : null;
          this.assigneeDSName = (assigneeDS) ? assigneeDS.FullName + "(" + assigneeDS.LocationFromIorgLoc + ")" : null;
        } else {
          this.StatusId = row.StatusId;
        }
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
    })

  }

  // rowIndex = -1;
  rowCount = 0;

  onKeyDown_(event: KeyboardEvent) {
    // Handle the Down Arrow key press.
    if (event.key === 'ArrowDown' && this.rowIndex < this.risWorkist.length - 1) {
      this.rowIndex++;
      this.assignTest(this.risWorkist[this.rowIndex], this.rowIndex);
      event.preventDefault(); // Prevent the default scrolling behavior.
    }
  }

  onKeyDown(event: KeyboardEvent) {
    // Handle the Arrow Up key press.
    if (event.key === 'ArrowUp' && this.rowIndex > 0) {
      this.rowIndex--;
      this.assignTest(this.risWorkist[this.rowIndex], this.rowIndex);
      event.preventDefault(); // Prevent the default scrolling behavior.
    }

    // Handle the Arrow Down key press.
    if (event.key === 'ArrowDown' && this.rowIndex < this.risWorkist.length - 1) {
      this.rowIndex++;
      this.assignTest(this.risWorkist[this.rowIndex], this.rowIndex);
      event.preventDefault(); // Prevent the default scrolling behavior.
    }
  }

  isLoadSummaryMethodCalled = null;
  isLoadInitSummaryMethodCalled = null;
  loadRadiologistSummary() {
    if (!this.InitByEmpID) {
      this.toastr.warning("Please select the doctor first!", "No Doctor Selected")
      return
    } else {
      this.clearRadiologistSummary();
      this.isLoadSummaryMethodCalled = true;
      const objParam = {
        EmpID: this.InitByEmpID,
        SectionID: this.SubSectionId,
        DateFrom: this.paramsValuesForWorkList.dateFrom,
        DateTo: this.paramsValuesForWorkList.dateTo
      }
      console.log("objParams for load radiologist summery ", objParam);
      // if (this.SubSectionId) {
      this.spinner.show(this.spinnerRefs.readiologinstSummarySection)//;;return;
      this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_SUMMARY, objParam).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.readiologinstSummarySection);
        if (resp.StatusCode == 200) {
          const readiologinstSummary = resp.PayLoadDS || [];
          this.AllStudies = readiologinstSummary.Table || [];
          this.FinalStudies = readiologinstSummary.Table1 || [];
          this.PendingStudies = readiologinstSummary.Table2 || [];
        }
      }, (err) => {
        console.log("Some error occured:", err)
        this.spinner.hide(this.spinnerRefs.readiologinstSummarySection);
      })
      // }

    }
  }


  loadInitRadiologistSummary() {
    if (!this.InitByEmpID) {
      this.toastr.warning("Please select the doctor first!", "No Doctor Selected")
      return
    } else {
      this.clearInitRadiologistSummary();
      this.isLoadInitSummaryMethodCalled = true;
      const objParam = {
        InitByEmpID: this.InitByEmpID,
        SectionID: this.SubSectionId,
        DateFrom: this.paramsValuesForWorkList.dateFrom,
        DateTo: this.paramsValuesForWorkList.dateTo
      }
      console.log("objParams for load radiologist summery ", objParam);
      // if (this.SubSectionId) {
      this.spinner.show(this.spinnerRefs.readiologinstSummarySection)//;;return;
      this.sharedService.getData(API_ROUTES.GET_INIT_RADIOLOGIST_SUMMARY, objParam).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.readiologinstSummarySection);
        if (resp.StatusCode == 200) {
          const readiologinstSummary = resp.PayLoadDS || [];
          this.AllInitStudies = readiologinstSummary.Table || [];
          this.FinalInitRadioStudies = readiologinstSummary.Table || [];
          this.PendingInitStudies = readiologinstSummary.Table1 || [];
        }
      }, (err) => {
        console.log("Some error occured:", err)
        this.spinner.hide(this.spinnerRefs.readiologinstSummarySection);
      })
      // }

    }
  }


  isLoadDSSummaryMethodCalled = null
  AllStudiesDSBy = [];
  FinalStudiesDSBy = [];
  PendingStudiesDSBy = [];
  loadDSRadiologistSummary() {
    if (!this.DSByEmpID) {
      this.toastr.warning("Please select the doctor first!", "No Doctor Selected")
      return
    } else {
      this.clearRadiologistSummaryDSBy();
      this.isLoadDSSummaryMethodCalled = true;
      const objParam = {
        DSByEmpID: this.DSByEmpID,
        SectionID: this.SubSectionIdDSBy,
        DateFrom: this.paramsValuesForWorkList.dateFrom,
        DateTo: this.paramsValuesForWorkList.dateTo
      }
      console.log("objParams for load DSBy radiologist summery ", objParam);
      // if (this.SubSectionId) {
      this.spinner.show(this.spinnerRefs.readiologinstSummarySectionDSBy)//;;return;
      this.sharedService.getData(API_ROUTES.GET_DS_RADIOLOGIST_SUMMARY, objParam).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.readiologinstSummarySectionDSBy);
        if (resp.StatusCode == 200) {
          const readiologinstSummaryDSBy = resp.PayLoadDS || [];
          this.AllStudiesDSBy = readiologinstSummaryDSBy.Table || [];
          this.FinalStudiesDSBy = readiologinstSummaryDSBy.Table || [];
          this.PendingStudiesDSBy = readiologinstSummaryDSBy.Table1 || [];
        }
      }, (err) => {
        console.log("Some error occured:", err)
        this.spinner.hide(this.spinnerRefs.readiologinstSummarySectionDSBy);
      })
      // }

    }
  }


  radiologistPic = null;
  radiologistPicDS = null;
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;

  // Get Picture for DS By doctor
  getEmployeePic(EmpID) {
    this.radiologistPic = null;
    this.spinner.show(this.spinnerRefs.drPic);
    const params = {
      EmpID: EmpID
    }
    this.questionnaireSrv.getEmployeePic(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.drPic);
      if (res.StatusCode == 200) {
        if (res.PayLoad.length && res.PayLoad[0].EmployeePic) {
          const resp = this.helper.formateImagesData(res.PayLoad, 'EmployeePic');
          this.radiologistPic = resp[0].EmployeePic;
          this.radiologistPicDS = resp[0].EmployeePic;
        } else {
          this.radiologistPic = null;
          this.radiologistPicDS = null;
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.drPic);
    })
  }

  // Get Picture for InitBy doctor
  getInitEmployeePic(EmpID) {
    this.radiologistPic = null;
    this.spinner.show(this.spinnerRefs.drPic);
    const params = {
      EmpID: EmpID
    }
    this.questionnaireSrv.getEmployeePic(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.drPic);
      if (res.StatusCode == 200) {
        if (res.PayLoad.length && res.PayLoad[0].EmployeePic) {
          const resp = this.helper.formateImagesData(res.PayLoad, 'EmployeePic');
          this.radiologistPic = resp[0].EmployeePic;
        } else {
          this.radiologistPic = null;
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.drPic);
    })
  }
  showPassword = false;
  isInputFocused = false;

  urduNews = "براہ کرم زیر التواء ٹیسٹ چیک آؤٹ کریں۔ ورک فلو کا اگلا مرحلہ اس کا انتظار کر رہا ہے۔ شکریہ";
  englishNews: string = this.countCheckoutWorklist > 1 ? "You have " + this.countCheckoutWorklist + " tests pending checkout. Please proceed; the next step awaits. " : "You have " + this.countCheckoutWorklist + " test pending checkout. Please proceed; the next step awaits. ";
  showUrdu = true;
  private newsSubscription: Subscription;



  printReport(row, index) {
    this.isTechDisclaimer = false;
    this.VerifiedUserID = null;
    this.rowIndex = index;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.StatusId = row.StatusId;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.TestStatus = row.TestStatus;
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    if (this.StatusId > 7) {
      setTimeout(() => {
        this.ViewReport('');
      }, 200);
    } else {
      this.toastr.warning("This report is not finalized yet so, you can't print it.")
    }

  }


  // Print report /////////////////////////////////////////////////////////
  ViewReport(itemType, reportType = 'normal') {
    let radioTestIds = '';
    let radioTP: any = [];
    //   radioTP =[{
    //     "ACCOUNTNO": this.VisitId,
    //     "TESTRESULT_ID": "",
    //     "TestID": "",
    //     "hasEmailSend": "n",
    //     "TESTRESULTID": "n",
    //     "BRANCH_ID": 0,
    //     "PROFILETESTS": this.TPCode,
    //     "PROFILETESTSDESC": this.TPName,
    //     "SECTION": "",
    //     "STATUS": "Final",
    //     "ABBRIVATION": "n",
    //     "REPORTINGTIME": "2023-07-05T20:00:00",
    //     "PROFILETESTID": this.TPID,
    //     "SECTIONID": 7,
    //     "ISPANEL": 0,
    //     "IsCash": "",
    //     "PANELNAME": "n",
    //     "CREATEDON": "n",
    //     "SectionType": "Radiology",
    //     "ReportTemplateType": 2,
    //     "DSBy": "n",
    //     "isReportable": 1,
    //     "WR_ALLOWED": 1,
    //     "EnableEmail": "n",
    //     "ENABLESMS": "n",
    //     "InOut": "N",
    //     "DueBalance": "",
    //     "PanelMailToPatient": "n",
    //     "PanelMailToPanel": "n",
    //     "PanelSMSAlert": "n",
    //     "PanelShowReport": "n",
    //     "PanelShouldReportMails": "n",
    //     "PanelIsByPassDueAmount": "n",
    //     "PanelPOCEmail": "n",
    //     "ProfileIsEmailEnable": "n",
    //     "ProfileIsSMSEnable": "n",
    //     "ProfileIsShowOnline": null,
    //     "isPackage": 1,
    //     "TypeId": 1,
    //     "PROFILEID": "",
    //     "SUBSECTIONID": 18,
    //     "EncAccountNo": null,
    //     "PanelID": null,
    //     "permission_ViewGraphicalReportIcon": false,
    //     "permission_ViewReportIcon": true,
    //     "permission_PRViewReportIcon": true,
    //     "permission_ViewPreReportIcon": false,
    //     "permission_ViewDeliverReportIcon": true,
    //     "permission_InPrgresIcon": false,
    //     "permission_PACSImages": true,
    //     "permission_IsReportableIcon": true,
    //     "permission_PanelIsTestAllowOnlineIcon": false,
    //     "permission_IsTestAllowOnlineIcon": false,
    //     "permission_IsdueblnceIcon": false,
    //     "permission_IsTestCancelled": false,

    // }]
    radioTP = [{
      "ACCOUNTNO": this.VisitID,
      "PROFILETESTS": this.TPCode,
      "PROFILETESTSDESC": this.TPName,
      "PROFILETESTID": this.TPId,

    }]
    // console.log("radioTP: ",radioTP);return;

    if (!this.TPId) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    }
    else {


      radioTestIds = this.TPId;
      if (radioTestIds) {
        radioTP = { ...radioTP };
        radioTP[0].PROFILETESTID = radioTestIds;
        radioTP[0].ReportType = "tp";
        radioTP[0].ItemType = itemType;
        radioTP[0].AppName = 'medicubes';
        radioTP[0].LoginName_MC = this.loggedInUser.username;
        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(radioTP[0]).subscribe((res: any) => {
          // console.log("ressssssssssssssssss: ", res)
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }
    }
  }

  isActive = null;
  openReportWindow() {
    const patientVisitInvoiceWinRef = window.open('', '_blank');
    return patientVisitInvoiceWinRef;
  }
  addSessionExpiryForReport(reportUrl) {
    const reportSegments = reportUrl.split('?');
    if (reportSegments.length > 1) {
      reportUrl = reportSegments[0] + '?' + btoa(atob(reportSegments[1]) + '&SessionExpiryTime=' + (+new Date() + (CONSTANTS.REPORT_EXPIRY_TIME * 1000))); // &pdf=1
    }
    return reportUrl;
  }

  PACSServers = [];
  isVPN = false;
  getPACSServers(visitID, TPID, rowIndex) {
    this.rowIndex = rowIndex;
    this.toastr.info("Working in progress", "Success");
    const VisitID = visitID.replaceAll("-", "");
    // 240301044020,@TPId INT=926--2123
    // let objParams = {
    //   VisitId: VisitID,//'240301134040',//'240301044020',//VisitID,
    //   TPId: TPID//926//926//TPID
    // }
    // console.log("objParam: ", objParams)
    // this.disabledButtonSearch = true;
    // this.isSpinnerSearch = false;
    // this.spinner.show(this.spinnerRefs.comparativeSection);
    this.isVPN = localStorage.getItem('isVPN') === 'true'; //  get from local storage
    const tblVisitTestDetail = [{
      VisitID: VisitID,
      TPID: TPID
    }];
    const objParams = {
      IsVPN: this.isVPN,
      LocID: this.loggedInUser.locationid,
      tblVisitTPID: tblVisitTestDetail
    };
    this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS_LOC_AND_VISITS_V2, objParams).subscribe((resp: any) => {
      // this.disabledButtonDICOM = false;
      // this.isSpinnerDICOM = true;
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.PACSServers = resp.PayLoad || [];
        // Dynamic handling for any number of servers
        if (this.PACSServers.length > 0) {
          // Create the URL dynamically for any number of servers
          let url = 'radiant://?n=f';

          // Add each server path to the URL
          this.PACSServers.forEach((server, index) => {
            let sanitizedPath = server.BackupServer;

            // Remove trailing slash if present
            if (sanitizedPath.endsWith('\\')) {
              sanitizedPath = sanitizedPath.substring(0, sanitizedPath.length - 1);
            }

            // Replace backslashes with URL encoding
            sanitizedPath = sanitizedPath.replace(/\\/g, '%5C');

            // Add to URL with proper parameter name
            url += `&v=%22${sanitizedPath}%22`;
          });

          // Open the URL
          window.open(url, '_blank');
        } else {
          // this.disabledButtonDICOM = false;
          // this.isSpinnerDICOM = true;
          this.toastr.warning("No PACS Servers Available");
        }
      } else if (resp.StatusCode == 200 && !resp.PayLoad.length) {
        this.toastr.warning("No Record Found");
        // this.disabledButtonDICOM = false;
        // this.isSpinnerDICOM = true;
      }
    }, (err) => {
      console.log(err);
      // this.disabledButtonDICOM = false;
      // this.isSpinnerDICOM = true;
      this.toastr.error("Error fetching PACS servers");
    });
  }

  getRemainingTimeBadgeColor(remainingTime: string): string {
    const [hours, minutes] = remainingTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes >= 180) {
      return 'badge badge-primary'; // Greater than or equal to 3 hours
    } else if (totalMinutes >= 0) {
      return 'badge badge-warning'; // Greater than or equal to 0 minutes
    } else {
      return 'badge badge-danger'; // Negative remaining time
    }
  }
  getRowActiveBulk(i) {
    this.rowIndexBulk = i;
  }

  openEmergencyAssignerModal() {
    setTimeout(() => {
      this.appPopupService.openModal(this.emergencyAssignerModal, { backdrop: 'static', size: 'xl' });
    }, 500);
  }

  radiologistRefByMappingInfo = [];
  refByDrName = null;
  associatedRadiologists = null;
  RadiologistID = null;
  AssigneeNameSuggestedByTech = null;
  getRadiologistRefByMappingInfo(visitID) {
    this.radiologistRefByMappingInfo = [];
    const params = {
      VisitID: visitID
    };
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_REFBYLIST_MAPPING_INFO, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        if (this.RISStatusID != 8) {
          this.EmpID = null;
        }
        // let visitTestsAssigner = res.PayLoad || [];
        this.radiologistRefByMappingInfo = res.PayLoad || [];
        if (this.radiologistRefByMappingInfo.length) {
          if (this.RISStatusID != 8) {
            this.EmpID = this.radiologistRefByMappingInfo[0].EmpId;
            this.DSByEmpID = this.radiologistRefByMappingInfo[0].EmpId;
            this.InitByEmpID = this.radiologistRefByMappingInfo[0].EmpId;
            this.AssigneeName = (this.EmpID) ? this.radoiologistList.find(item => item.EmpId == this.EmpID).FullName : null;

            this.assigneeInItName = this.AssigneeName?.trim();
            this.assigneeDSName  = this.AssigneeName?.trim();

            this.AssigneeNameSuggestedByTech = this.RadiologistID ? this.radoiologistList.find(item => item.EmpId == this.RadiologistID).FullName : null;
          }
          this.refByDrName = this.radiologistRefByMappingInfo[0].RefBy;
          this.associatedRadiologists = this.radiologistRefByMappingInfo
            .map(radiologist => radiologist.FullName)
            .join(', ');
        } else {
          if (this.RISStatusID != 8) {
            this.EmpID = this.RadiologistID;
            this.DSByEmpID = this.RadiologistID;
            this.InitByEmpID = this.RadiologistID;
            this.AssigneeName = (this.EmpID) ? this.radoiologistList.find(item => item.EmpId == this.EmpID).FullName : null;
            this.assigneeInItName = this.AssigneeName?.trim();
            this.assigneeDSName  = this.AssigneeName?.trim();
          }

          this.AssigneeNameSuggestedByTech = this.RadiologistID ? this.radoiologistList.find(item => item.EmpId == this.RadiologistID).FullName : null;
        }
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
    })

  }

}
