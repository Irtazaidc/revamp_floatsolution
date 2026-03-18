// @ts-nocheck
import { ChangeDetectorRef, Component, EventEmitter, HostBinding, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RisWorklistService } from 'src/app/modules/ris/services/ris-worklist.service';
import { AppPopupService } from '../../../../../shared/helpers/app-popup.service';
import { environment } from '../../../../../../../environments/environment'
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { VitalsService } from 'src/app/modules/ris/services/vitals.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import { Subscription, interval } from 'rxjs';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import moment from 'moment';
import { TechnicianService } from 'src/app/modules/ris/services/technician.service';
import Swal from 'sweetalert2';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from '../../../../../shared/helpers/api-routes';
import { StorageService } from 'src/app/modules/shared/helpers/storage.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: false,

  selector: 'app-ris-worklist-service',
  templateUrl: './ris-worklist-service.component.html',
  styleUrls: ['./ris-worklist-service.component.scss']
})

export class RisWorklistServiceComponent implements OnInit {
  private refreshSubscription: Subscription;
  @Input('paramsValuesForWorkList') paramsValuesForWorkList: any;
  @Input('colNamesForMOScreen') colNamesForMOScreen = [];
  @Input('actionsPermission') actionsPermission: any = [];
  @Input('isStatusChanged') isStatusChanged: any = [];
  @Input('isSaved') isSaved: any = [];
  @Output() paramFormHeaderInfo = new EventEmitter<any>();
  @Output() selectedValueChange = new EventEmitter<any>();
  @ViewChild('vitalsServiceModal') vitalsServiceModal;
  @ViewChild('emrServiceModal') emrServiceModal;
  @ViewChild('userVerificationServiceModal') userVerificationServiceModal;
  @ViewChild('processService') processService;
  userVerificationSrvModalRef: NgbModalRef;
  processServiceModelRef: NgbModalRef;
  buttonControlsPermissions = {

  }

  risWorklist: any = [];
  params: { VisitID: any; BranchIDs: any; FilterBy: any; DateFrom: any; DateTo: any; };
  orignaRisList: any = [];
  visitInfo: any = {};
  PatientPhoneNumber: any = "";
  screenIdentity = null; //1 for MO Worklist, 2 for Tech Worklist
  disabledButtonVerify: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinnerVerify: boolean = true;//Hide Loader


  techUsername = "";
  techPassword = "";
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
  count: number = 0;
  currow: any;
  constructor(
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
    private helper: HelperService,
    private techSrv: TechnicianService,
    private auth: AuthService,
    private storageService: StorageService,
  ) { }

  EmpID = null;
  isSavedVitals = null;
  pageRefreshTime = 120000 //300000; //300000 //5 minutes  600000 // 10 minutes, 120000 for two minutes

  private fetchData(): void {
    this.getRisworkList(this.paramsValuesForWorkList);
  }

  ngOnInit(): void {
    this.screenIdentity = this.route.routeConfig.path;
    if (this.screenIdentity == 'ris-services') {
      if (!localStorage.getItem('reloadedSrv')) {
        localStorage.setItem('reloadedSrv', 'true');
        localStorage.setItem('reloaded', '');
        location.reload();
      }
    }
    this.multiApp.connectToMultiApp();
    this.subscribeForMultiAppStatus();
    this.loadLoggedInUserInfo();
    this.isSavedVitals = this.isSaved;
    this.searchFormInfoObj = {
      formHeaderBGClass: 'bg-primary',
      formHeaderText: "MO Pending List"
    }
    this.paramFormHeaderInfo.emit(this.searchFormInfoObj);
    this.getRisworkList(this.paramsValuesForWorkList);
    this.refreshSubscription = interval(this.pageRefreshTime).subscribe(() => {
      this.fetchData();
    });
    this.noticeBoardStyle = this.paramsValuesForWorkList.visitID ? this.paramsValuesForWorkList.noticeBoardStyle = "bg-purple" : (this.screenIdentity == "mo-worklist" || this.screenIdentity == "ris-services") ? this.paramsValuesForWorkList.noticeBoardStyle = "bg-primary" : this.screenIdentity == "tech-worklist" ? this.paramsValuesForWorkList.noticeBoardStyle = "bg-success" : this.paramsValuesForWorkList.noticeBoardStyle = "bg-warning";
    this.testSummaryInfoHeader =
      this.paramsValuesForWorkList.visitID
        ? "All Tests"
        : "RIS Services";

    if (this.multiApp.biomatricData) {
      this.sub = this.multiApp.biomatricData.subscribe((resp: any) => {
        if (resp) {
          this.spinner.hide();
        }
        setTimeout(() => {
          this.count = 0;
          if (resp && resp.userIdentity && resp.userIdentity != 0) {
            if (resp.userIdentity == -99) {
              this.toastr.warning("The device is not connected or closed, so please log in with your credentials.", "Device Connection Error")
              this.appPopupService.openModal(this.userVerificationServiceModal, { backdrop: 'static', size: 'md' });
            } else {
              let data = this.multiApp.getTDate();
              // this.rowIndex = data.value.rowIndex;
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
              setTimeout(() => {
                // this.updateVisitTPStatus();
                this.processServiceModelRef = this.appPopupService.openModal(this.processService, { size: 'fss' });
              }, 200);
            }

          }
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
    this.multiApp.biomatricData = null;
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  screenIdentityngOnchages = null;
  ngOnChanges(changes: SimpleChanges) {
    this.screenIdentityngOnchages = this.route.routeConfig.path;
    this.getRisworkList(this.paramsValuesForWorkList);

  }

  ngAfterViewInit() { }


  dblClick = false;
  cmdchk = false;
  WorkflowStatus = null;
  verifyUserBiomatericForService(row, index) {
    this.WorkflowStatus = row["Workflow Status"]
    this.isTechDisclaimer = false;
    // console.log("mo-row in service", row);
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.currow = row;
    // row.rowIndex = index;
    this.multiApp.setTData(row);
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
    //Check for already initialized study
    this.getRISWorklistRow(Number(this.VisitID), this.TPId);

    setTimeout(() => {
      this.getVisitTPInventory();
      if (this.StatusId == 12 || (this.StatusId == -1) || (this.StatusId == -2)) {
        let aletMsg = "";
        let alertTitle = "";
        if (this.StatusId == 12) {
          alertTitle = "Already Delivered";
          aletMsg = 'This service <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has already been delivered. Your action cannot be performed.';
        } else if (this.StatusId == -1) {
          alertTitle = "Already Cancelled";
          aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has already been Cancelled. Your action cannot be performed.';
        } else if (this.StatusId == -2) {
          alertTitle = "Requested For Cancellation";
          aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has sent for cancellation. Your action cannot be performed.';
        } else {
          aletMsg = 'Somthing went wrong and your action cannot be performed.';
        }
        Swal.fire({
          title: alertTitle,
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
            this.pagination.paginatedSearchResults.splice(this.rowIndex, 1);
            --this.countCheckoutWorklist;
            Swal.close();
          }
        });
        return
      } else {
        this.count = this.count + 1;
        let obj = {
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
          this.sendCommand({ command: 'fmd', userIdentity: JSON.stringify(obj), useFor: "checkin" });
          this.spinner.show();
          this.count = 0;
        }
        else {
          this.toastr.warning("Please verify your thumb for Visit: " + this.VisitIDWithDashes + ", TPCode: " + this.TPCode + ", Patient: " + this.PatientName, "Instince already Opened");
        }
      }
    }, 300);

  }

  sendCommand(cmd) {
    this.multiApp.sendCommandBiomatric(cmd);
  }
  spinnerRefs = {
    listSection: 'listSection',
    drPic: "drPic",
    readiologinstSummarySection: "readiologinstSummarySection",
    inventorySection: 'inventorySection',
    checklistSection: 'checklistSection',
    RISServicesSection: 'RISServicesSection',
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
    this.rowIndex = -1//null;
    if (refreshCounter == 1)
      this.count = 0;
  }

  filmCount = 0;
  contrastCount = 0;
  otherCount = 0;
  getRisworkList(val) {
    let storagePrms = this.storageService.getObject('risFilterParams') ? this.storageService.getObject('risFilterParams') : val;
    this.storageService.setObject('risFilterParams', val);
    if (val.visitID) {
      this.showAllTab = true;
      this.active = 7;
    } else {
      this.active = val.isActive;
      this.showAllTab = false;
    }
    if (val.visitID && val.isActive != 7) {
      this.toastr.warning('You have selected "PIN" please click on "All" tab to show data');
      return;
    }
    if ((val.dateFrom && val.dateTo) || val.visitID) {
      this.searchText = '';
      this.risWorklist = [];
      this.spinner.show(this.spinnerRefs.listSection);
      let params = {
        VisitID: val.visitID ? val.visitID.replaceAll("-", '') : null,
        BranchIDs: val.branch ? val.branch.join(",") : null,
        FilterBy: val.filterBy,
        RISStatusID: val.RISStatusID,
        DateFrom: val.visitID ? null : val.dateFrom,
        DateTo: val.visitID ? null : val.dateTo,
        SubSectionIDs: val.subSectionIDs ? val.subSectionIDs.join(",") : null,
        AssignerFilter: val.AssignemntFilter
      }
      this.worklistSrv.getRISWorklistService(params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
          this.orignaRisList = resp.PayLoad
          let dataset = resp.PayLoad;
          this.risWorklist = dataset.map(a => ({
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
            TestStatus: a.TestStatus,
            VisitNo: a.VisitNo,
            "Workflow Status": a.WorkflowStatus,
            StatusBadgeClass: this.getStatusClass(a.RISStatusID),
            isMedicalOfficerIntervention: a.isMedicalOfficerIntervention,
            EmpId: a.EmpId,
            RegistrationDate: a.RegistrationDate,
            DeliveryDate: a.DeliveryDate,
            isConsentRead: a.isConsentRead,
            InitializedBy: a.InitializedBy,
            isTechHistoryRequred: a.isTechHistoryRequred,
            SubSectionId: a.SubSectionId,
            ServiceType: a.ServiceType
          }));
          let newris = [];
          this.risWorklist = this.risWorklist.map((a, i) => {
            let _obj = {};
            this.colNamesForMOScreen.forEach(b => { _obj[b] = a[b] }); return _obj
          });
          this.filmCount = this.risWorklist.filter(f => f.ServiceType == 1).length;
          this.contrastCount = this.risWorklist.filter(f => f.ServiceType == 2).length;
          this.otherCount = this.risWorklist.filter(f => f.ServiceType == 3).length;
          this.risWorklist = (this.listFilter != 4) ? this.risWorklist.filter(f => f.ServiceType == this.listFilter) : this.risWorklist;

          this.filterResults();
          console.log("this.risWorklist", this.risWorklist)
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


  active = 2;
  workListFilter
  searchFormInfoObj = {
    formHeaderBGClass: 'text-primary',
    formHeaderText: "MO Pending List"
  }
  testSummaryInfoHeader = "RIS Services - Films";
  testSummaryInfoDesc = "Films";
  noticeBoardStyle = "bg-primary";
  listFilter = 1;
  getActive(active, risStatusID, filterBy, formHeaderBGClass, formHeaderText, testSummaryInfoDesc, listFilter) {
    this.listFilter = listFilter;
    this.testSummaryInfoHeader = formHeaderText;
    this.testSummaryInfoDesc = testSummaryInfoDesc;
    this.TPId = null;
    this.rowIndex = null;
    this.active = active;
    this.paramsValuesForWorkList.RISStatusID = risStatusID;
    this.paramsValuesForWorkList.filterBy = filterBy;
    this.paramsValuesForWorkList.isActive = active;
    this.noticeBoardStyle = formHeaderBGClass;
    this.paramsValuesForWorkList.AssignemntFilter = 3;
    this.getRisworkList(this.paramsValuesForWorkList);
  }

  getTestSummaryInfo(activeTab) {
    switch (activeTab) {
      case 1: {
        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Pending Tests";
        } else {
          this.testSummaryInfoHeader = "MO Pending Tests";
        }

        break
      }
      case 2: {
        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Reported Tests";
        } else {
          this.testSummaryInfoHeader = "Registered Tests";
        }
        break
      }
      case 3: {

        if (this.screenIdentity == 'reporting-worklist') {
          this.testSummaryInfoHeader = "Finalized Tests";
        } else {
          this.testSummaryInfoHeader = "Checkin Worklist";
        }
        break
      }
      case 4: {
        this.testSummaryInfoHeader = "Checkout Worklist";
        break
      }
      case 5: {
        this.testSummaryInfoHeader = "Initial Worklist";
        break
      }
      case 6: {
        this.testSummaryInfoHeader = "Queue Management";
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
    this.rowIndex = null;
    this.getRisworkList(this.paramsValuesForWorkList);
    this.getVitals();
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
  openPopupModal(row, index) {
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
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    //Check for already initialized study
    this.getRISWorklistRow(Number(this.VisitID), this.TPId);
    setTimeout(() => {
      this.getVisitTPInventory();
      if (this.StatusId == 12 || (this.StatusId == -1) || (this.StatusId == -2)) {
        let aletMsg = "";
        let alertTitle = "";
        if (this.StatusId >= 12) {
          alertTitle = "Already Delivered";
          aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has already been delivered. Your action cannot be performed.';
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
            Swal.close();
          }
        });
        return
      } else {
        this.userVerificationSrvModalRef = this.appPopupService.openModal(this.userVerificationServiceModal, { backdrop: 'static', size: 'md' });
      }
    }, 300);

  }

  openVitals(selVisitInfo) {
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.vitalsServiceModal, { size: 'lg' });
  }


  openEMR(selVisitInfo) {
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.emrServiceModal, { size: 'fss' });
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
    let dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  }

  filterResults() {
    this.pagination.page = 1;
    let cols = ['VisitNo', 'PatientName', 'TPCode', 'BranchCode', 'PhoneNumber', 'TestStatus', 'Workflow Status'];
    let results: any = this.risWorklist;
    if (this.searchText && this.searchText.length > 2) {
      let pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.risWorklist, this.searchText, cols, this.risWorklist);
    }
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
    this.cd.detectChanges();

  }


  VerifiedUserID = null;
  RegLocId = null;
  VerifiedUserName = null;
  IsAuthenticated = false;
  isSpinnerAccept = true;

  verifyUserSrv() {
    let formValues = this.userVerificationForm.getRawValue();
    this.userVerificationForm.markAllAsTouched();
    if (this.userVerificationForm.invalid) {
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      ///////START::VERIFY USER /////////////////////////////
      let params = {
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
            // this.updateVisitTPStatus();
            this.userVerificationSrvModalRef.close()
            this.processServiceModelRef = this.appPopupService.openModal(this.processService, { size: 'fss' });
            this.userVerificationForm.patchValue({
              techUsername: "",
              techPassword: ""
            })
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
    this.vitalRefresh = 1;
    if (isSaved) {
      this.getVitals()
    }
  }
  isShowVitalsCard = false;
  getVitals() {
    if (this.visitInfo.visitID && this.visitInfo.tpId) {
      let params = {
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
    let winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }







  /////////////////////////////Assigner Section////////////
  isSpinnerAssign: boolean = true;//Hide Loader
  isSpinnerUnAssign: boolean = true;//Hide Loader
  disabledButtonAssign: boolean = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonUnAssign: boolean = false; // Button Enabled / Disables [By default Enabled]
  VisitId = null;
  assigneeName = null;
  rowGlobal: any = null;
  SubSectionIdFilter = null

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


  isCoppied = null;
  rowIndexCpy = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    let pin = text.VisitNo
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
  copyVisitNo(visitno: any) {
    this.helper.copyMessage(visitno);
  }
  ////////////////////////////Update VisitTPStatus///////////////////
  updateVisitTPStatus() {
    let objParam = {
      VisitID: this.VisitID,
      TPID: this.TPId,
      StatusID: 12,
      CreatedBy: this.loggedInUser.userid || -99
    }
    this.techSrv.updateVisitTPStatusForInitialization(objParam).subscribe((data: any) => {
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          // alert("this.rowIndex___"+this.rowIndex)
          setTimeout(() => {
            this.pagination.paginatedSearchResults.splice(this.rowIndex, 1);
          }, 500);
          if (this.listFilter == 1) {
            --this.filmCount;
          } else if (this.listFilter == 2) {
            --this.contrastCount;
          }
          else if (this.listFilter == 3) {
            --this.otherCount;
          }
          this.toastr.success("This service is processedd sucssfully", "Service Processing");
          if (this.TPId && this.VisitID) {
            const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitID, TPID: this.TPId, appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
            window.open(url.toString(), '_blank');
          }
        } else {
          this.toastr.error('Error occured while saving tech history!')
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  ////////////////////////////Update VisitTPStatus///////////////////

  subSectionList = []
  getSubSection() {
    this.subSectionList = [];
    let objParam = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_SUBSECTION_SECTIONID, objParam).subscribe((resp: any) => {
      let _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
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
    this.RISWorklistRow = []
    let params = {
      VisitID: VisitID,
      TPID: TPID
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_WORKLIST_ROW, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.RISWorklistRow = res.PayLoad || [];
        let row = this.RISWorklistRow[0];
        if (row.RISStatusID) {
          this.EmpID = row.EmpId;
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

  showPassword = false;
  isInputFocused = false;

  // comingSoon(){
  //   this.toastr.info('Working in progress',"Comming soon")
  // }

  closeModal1(modalName) {
    this.getRisworkList(this.paramsValuesForWorkList);
    this.VerifiedUserID = null;
    this.appPopupService.closeModal(modalName);
    window.location.reload();
  }

  confirmationPopoverConfigInventory = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to process the service ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  TPItemsList = [];
  isSpinnerInventory: boolean = true;
  isFieldDisabled = false;
  disabledButtonInventory = false;
  buttonClicked = false;
  getVisitTPInventory() {
    this.TPItemsList = []
    let params = {
      VisitID: this.VisitID,
      TPID: this.TPId,
      RISStatusID: null,
      StatusID: 7
    };
    // this.spinner.show(this.spinnerRefs.inventorySection);
    // console.log("Params are_____________", params)
    this.techSrv.getVisitTPInventory(params).subscribe((res: any) => {
      // this.spinner.hide(this.spinnerRefs.inventorySection);
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
          ConsumedQuantity: (a.VisitTPInventoryID)?a.ConsumedQuantity:a.RecQuantity,
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
      // this.spinner.hide(this.spinnerRefs.inventorySection);
    })
  }
  isSpinnerPrintLabel = true;
  printRadioLabel = 1;
  selectAllTPStoreItems(e) {
    this.TPItemsList.forEach(a => {
      a.checked = false;
      if (a.StoreItemID > 0) {
        a.checked = e.target.checked;
      }
    })
  }
  printRadioLablePopup() {
    this.loggedInUserLocCode = this.loggedInUser.currentLocation;
    if (this.TPId && this.VisitID) {
      const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitID, TPID: this.TPId, UserLoc: this.loggedInUserLocCode, appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
      window.open(url.toString(), '_blank');
    }
  }

  buttonserviceInventoryClicked=false;
  insertUpdateVisitTPServiceInventory() {
    this.buttonserviceInventoryClicked = true;
    let isValidItem = true;
    let filteredItems =  this.TPItemsList.filter(a => a.checked);
    if(this.TPItemsList.length && !filteredItems.length){
      this.toastr.warning("Please select any item to consume","No Item Selected");
      return;
    }
    isValidItem = this.checkValidationForServiceInventory(filteredItems)
    setTimeout(() => {
      if (isValidItem) {
        this.updateVisitServiceStatus(filteredItems);
      } else {
        this.toastr.error('Remarks is mandatory for damaged or over-consumed items.', "Inventory validation Error!");
        isValidItem = true;
        return;
      }
    }, 200);
  }
  checkValidationForServiceInventory(data) {
    let filteredItems = data;
    let isValid = true;
    for (let item of filteredItems) {
        if (
            (item.DamagedQuantity && item.DamagedQuantity > 0 && !item.Remarks) ||
            ((item.DamagedQuantity || 0) + item.ConsumedQuantity > item.RecQuantity && !item.Remarks)
        ) {
            isValid = false;
            break;
        }
    }
    return isValid;
  }
  updateVisitServiceStatus(data){
    let filteredServices = data;
      let obj = {
        TPIDs: this.TPId,
        VisitID: this.VisitID,
        StatusID: 12,
        CreatedBy: this.VerifiedUserID || -99,
        LocID: this.RegLocId,
      }
      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_VISIT_TPSTATUS_BY_TPIDS, obj).subscribe((resp: any) => {
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            if(filteredServices.services && filteredServices.services.length){
              this.insertServiceInventory(filteredServices)
            }else{
              this.isSpinnerInventory = true;
              this.disabledButtonInventory = false;
              this.buttonserviceInventoryClicked = false;
              this.processServiceModelRef.close();
              this.getRisworkList(this.paramsValuesForWorkList);
              if(this.printRadioLabel)
                this.printRadioLablePopup();
              // this.getVisitTPInventory();
            }
            
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
      })
  }
  insertServiceInventory(data){
    let filteredServices = data;
    let objParam = {
      TPID: this.TPId,
      VisitID: this.VisitID,
      CreatedBy: this.VerifiedUserID || -99,
      tblVisitTPInventory: filteredServices.map(a => {
        return {
          VisitTPInventoryID: a.VisitTPInventoryID ? a.VisitTPInventoryID : null,
          Visit: Number(this.VisitId),
          TPID: this.TPId,
          StatusID: a.StatusID || 7,
          RISStatusID: a.RISStatusID,
          StoreItemID: a.StoreItemId,
          ConsumedQuantity: a.ConsumedQuantity,
          DamagedQuantity: a.DamagedQuantity,
          Remarks: a.Remarks
        }
      })
    }
      this.techSrv.InsertUpdateVisitTPInventory(objParam).subscribe((data: any) => {
      this.disabledButtonInventory = false;
      this.isSpinnerInventory = true;
      this.buttonClicked = false;
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          this.toastr.success(data.Message);
          this.getRisworkList(this.paramsValuesForWorkList);
          if(this.printRadioLabel)
            this.printRadioLablePopup();
          // this.getVisitTPInventory();
          this.isSpinnerInventory = true;
          this.disabledButtonInventory = false;
          this.buttonserviceInventoryClicked = false;
          this.processServiceModelRef.close();
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          this.disabledButtonInventory = false;
          this.isSpinnerInventory = true;
          this.buttonserviceInventoryClicked = false;
        }
      }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonInventory = false;
        this.isSpinnerInventory = true;
        this.buttonserviceInventoryClicked = false;
      })
  }
}
