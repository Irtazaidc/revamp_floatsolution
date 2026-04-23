// @ts-nocheck
import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TestProfileConfigurationService } from '../../Services/test-profile-configurations-services';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { NgbModal, NgbModalConfig, NgbDateStruct, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { DatePipe } from '@angular/common';
import { LabConfigsService } from 'src/app/modules/lab-configs/services/lab-configs.service';
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { AuthModel } from 'src/app/modules/auth/_models/auth.model';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';


@Component({
  standalone: false,

  selector: 'app-test-profile-configurations',
  templateUrl: './test-profile-configurations.component_new.html',
  styleUrls: ['./test-profile-configurations.component.scss']
})
export class TestProfileConfigurationsComponent implements OnInit {
  from: FormGroup;
  selectedDiseases = [];
  selectedQuestionClassification = [];
  extraQuesTxt: any = "";
  @ViewChild('assocMachineModal') assocMachineModal;
  @ViewChild('addUpdateRangeModal') addUpdateRangeModal;
  @ViewChild('assocMachineDetailModal') assocMachineDetailModal;
  // Selected persons: [ { "name": "Karyn Wright" }, { "name": "Other" } ]

  // public Editor = ClassicEditor;
  TPCONFIGFormSubmitted = false;
  TPConfigForm = this.fb.group({
    Gender: ['', ''],
    BodyPartTitle: ['', ''],
    DiseaseTitle: ['', ''],
    PatientInstructions: ['', ''],
    TestDescription: ['', ''],
    manualTAT: ['', ''],
    // getSelectedValue() {
    //   console.log(this.selectedDiseases);
    // }
  });

  spinnerRefs = {
    machineAssocPopup: 'machineAssocPopup',
    machineAssocSection: 'machineAssocSection',
    machinePriorityFormSection: 'machinePriorityFormSection',
    testProfilesDropdown: 'testProfilesDropdown',
    listSection: 'listSection',
    mainFormSection: 'mainFormSection'
  }

  @ViewChild("TestConfig") form;
  @ViewChild("inputFile") myInputVariable: ElementRef;
  loggedInUser: UserModel;
  TestProfileIDURL: number = null;
  userCredentials = {
    /* EUserName: '',
    EPassword: '',
    ETestProfileId: '', */
    UserName: '',
    Password: '',
    TestProfileId: '',
    SourceName: '',
  }

  List = []
  BodyParts: any = []
  DiseaseTitleList = []
    TestProfileData: any = {};

  TestProfilePic = []
  DiseaseTitleIDs = []
  BodyPartID: any;
  DiseasesID: any;
  BodyPartTitle: any;
  BodyPartCount: any;
  DiseaseCount: any;
  TestProfileName: any;
  TPCode: any;
  Gender: any = "";
  BodyPart: any = "";
  DiseaseTitle: any = "";
  manualTAT: any;
  PatientInstructions: any = "";
  TestDescription: any = "";
  PatientInstructionsHTML = '<p></p>';
  TestDescriptionHTML = '<p></p>';
  imageURL = "";
  uploadForm: FormGroup;
  formSubmitAttempt: boolean;
  IsImageAttached = 0;
  TestProfilePicId: any;
  curTestProfilePicID: any;
  loggedIn = false;
  isSubmitted = false;
  ModifiedBy = null;
  TPID: any;
  ExTPID: any;
  isAuthenticated = false;
  isHCTestProfile = false;
  isOnlineBookingAllowed = false;
  selectedAlternateTestCollectionMedium: any;
  selectedTestCollectionMedium: any;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverTitlePriority: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to remove?',
    popoverPriorityMessage: 'Are you <b>sure</b> you want to set priority?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  confirmationPopoverConfigDeletion = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to delete ?', // 'Are you sure?',
    popoverMessage: 'You won\'t be able to revert it!',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  confirmationPopoverDissociateMachine = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to remove ?', // 'Are you sure?',
    popoverMessage: 'You won\'t be able to revert it!',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  confirmationPopoverQuestion = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: '<b class="text-secondary">Please confirm</b>', // 'Are you sure?',
    popoverMessage: 'Are you sure want to <b>save</b> qestion(s) ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  confirmationPopoverInventory = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: '<b class="text-secondary">Please confirm</b>', // 'Are you sure?',
    popoverMessage: 'Are you sure want to <b>save</b> item(s) ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  TPParams = [];
  CardTitle: string;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  disabledButtonRange = false; // Button Enabled / Disables [By default Enabled]
  isSpinnerRange = true;//Hide Loader
  MachineList: any;
  ParamMachineRangeID: any = null;//For update single range record
  TestProfileCode: any;
  formAssocMachine = this.fb.group({
    MachineID: ['', Validators.compose([Validators.required])],
    Gender: ['', Validators.compose([Validators.required])],
    AgeType: ['', Validators.compose([Validators.required])],
    AgeFrom: ['', Validators.compose([Validators.required])],
    AgeTo: ['', Validators.compose([Validators.required])],
    RangeFrom: [''],
    RangeTo: [''],
    RangeText: ['']
  });

  formAddUpdateRange = this.fb.group({
    Gender: ['', Validators.compose([Validators.required])],
    AgeType: ['', Validators.compose([Validators.required])],
    AgeFrom: ['', Validators.compose([Validators.required])],
    AgeTo: ['', Validators.compose([Validators.required])],
    RangeFrom: [''],
    RangeTo: [''],
    RangeText: ['',]
  });
  ParamID: any;
  MachineID: any;
  ParamMachineRages: any;
  ActionLabel = 'Add Range';
  selectedSymptoms: any = '';
  MachineName: any;
  isMachineRangesList = false;
  TestRanges: any = [];
  queryParams: any = {};
  IsAuthenticated = false;
  selBranchID: any = 0;
  ActionBtnText = 'Save';
  ActionBtnIcon = 'fa fa-save';

  disabledButtonRemove = false; // Button Enabled / Disables [By default Enabled]
  isSpinnerRemove = true;//Hide Loader
  UserID: any;
  TestMachineList: any = [];
  isMedicalOfficerIntervention = false;
  isBypassAssigner = false;
  isBypassTech = false;
  isService = false;
  isCancelable = true;
  isAdvanceCancellation = false;
  isAIAssistEnable = false;
  serviceType  = 1;
  selectedBodyparts: any = [];
  isFastingReq: any = false;
  fastingHours: any;
  isTechHistoryRequred: any;
  sysmtomsList: any = [];
  sampleCollectionMedium: any = [];
  altSampleCollectionMedium: any = [];
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  constructor(
    private TPService: TestProfileConfigurationService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private auth: AuthService,
    // private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private appPopupService: AppPopupService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private LabConfService: LabConfigsService,
    private questionnaireService: QuestionnaireService,
    private cd: ChangeDetectorRef,
    private lookupService: LookupService,
    private tpService: TestProfileService
  ) {
    this.uploadForm = this.fb.group({
      avatar: [null],
      name: ['']
    })
  }
  hasQueryParams = false;
  ngOnInit(): void {
    this.queryParams = this.getUrlParams();
    this.route.queryParams.subscribe(params => {
      // Check if queryParams is not empty
      this.hasQueryParams = Object.keys(params).length > 0;
    });
    this.loadLoggedInUserInfo();
    // let urlParams:any = {
    //   un: '',
    //   pw: '',
    //   tpid: '',
    //   appName: ''
    // };
    // try {
    //   urlParams = this.route.snapshot.queryParams;
    //   urlParams = this.getUrlParams();
    //   this.TPID=urlParams.tpid;
    // } 
    // catch (e) {}

    // this.userCredentials = {
    //   UserName: decodeURIComponent(urlParams.un || '').replace(/\s/g, '+'),
    //   Password: decodeURIComponent(urlParams.pw || '').replace(/\s/g, '+'),
    //   TestProfileId: decodeURIComponent(urlParams.tpid || '').replace(/\s/g, '+'),
    //   SourceName: decodeURIComponent(urlParams.appName || '').replace(/\s/g, '+')
    // }
    if (environment.production) {
      this.updateUrlParams_navigateTo('');
    }
    // if (this.userCredentials.UserName && this.userCredentials.Password) {
    //   let  paramObj = {
    //     TestProfileId: this.userCredentials.TestProfileId
    //   }
    //   setTimeout(() => {
    //     this.TPService.DecryptTPID(paramObj).subscribe((resp: any) => {
    //     // console.log("testing",resp.payLoad);
    //       this.ExTPID = resp.payLoad;
    //       this.GetTestProfileDataByID(this.ExTPID)
    //       this.GetTestProfileParamsByTPID(this.ExTPID)

    //     }, (err) => {
    //       console.log(err);
    //     })

    //   }, 500);
    // }
    // this.decryptParam(this.userCredentials);
    this.GetBodyParts();
    this.GetDiseases();
    this.getSymptoms();
    this.getMachine(null);
    this.verifyUserCredentials();
    this.getQuestion();
    this.getQuestionClassification();
    this.getTestSampleCollectionType();
    this.extraQuesTxt = "Extra Added Question";
    this.getStoreItemList();
    this.getTestStatus();
    this.getRISStatus();
    if(!this.hasQueryParams)
      this.getTestProfileList('');
  }
  testProfileList =[];
  searchText="";
  searchByCodeNameRadio:any=null;
  selectedPanel:any=null;
  getTestProfileList(tpname) {
    this.testProfileList = [];
    const _params = {
      tpids: null,
      code: (this.searchByCodeNameRadio == 'code' ? tpname : null),
      desc: (this.searchByCodeNameRadio == 'name' ? tpname : null),
      branchId: 1,//this.loggedInUser.locationid,
      panelId: (this.selectedPanel || '') // this.selectedPanel ? this.selectedPanel.PanelId : '' //this.patientBasicInfo.value.corporateClientID || '',
    }
    // if (!this.loggedInUser.locationid) {
    //   this.toastr.warning('Branch ID not found');
    //   return;
    // }

    this.spinner.show(this.spinnerRefs.listSection);
    this.tpService.getTestsByName(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        // console.log(data, "data");
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        if (data.length) {
          data.forEach(element => {
            element.TestProfileCodeDesc = `${element.TestProfileCode} - ${element.TestProfileName} (${element.TestProfilePrice})`;
          });
        }
        this.testProfileList = data || [];
        // console.log("testProfileList________",this.testProfileList);
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log(err);
    });
  }
  rowIndex = null;
  getTestProfileDetail(tpid,i){
    this.rowIndex = i;
    this.ExTPID = tpid
    this.GetTestProfileDataByID(this.ExTPID)
    this.GetTestProfileParamsByTPID(this.ExTPID)
    this.getTestMachines(this.ExTPID)
    this.getTestProfileQuestions(this.ExTPID);
  }

  verifyUserCredentials() {
    const params = {
      UserName: decodeURIComponent(this.queryParams.un || '').replace(/\s/g, '+'),
      Password: decodeURIComponent(this.queryParams.pw || '').replace(/\s/g, '+'),
      SourceName: decodeURIComponent(this.queryParams.appName || '').replace(/\s/g, '+'),
      BranchID: decodeURIComponent(this.queryParams.tpid || '').replace(/\s/g, '+')
    }

    this.sharedService.verifyIDCEmpCredentials(params).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        //////////////////Getting user id////
        this.sharedService.getUserID(params).subscribe((data: any) => {
          if (resp.StatusCode == 200) {
            if (data.PayLoad && data.PayLoad.length) {
              this.UserID = data.PayLoad[0].UserId;
              const teken = resp.PayLoad[0].Token;
              // this.setAuthInLocalStorage(this.createAuthObj(teken));
            }
          }
        });
        ////////////////////////////////////
        this.IsAuthenticated = true
        if (resp.PayLoad && resp.PayLoad.length) {
          this.selBranchID = resp.PayLoad.BranchID;
          this.selBranchID = resp.PayLoad.BranchID;
          this.ExTPID = resp.PayLoad[0].BranchID;
          this.GetTestProfileDataByID(this.ExTPID)
          this.GetTestProfileParamsByTPID(this.ExTPID)
          this.getTestMachines(this.ExTPID)
          this.getTestProfileQuestions(this.ExTPID);

          this.loggedIn = true;
        }
      } else if (resp.StatusCode == 202) {
        this.IsAuthenticated = false
      } else {
        this.IsAuthenticated = false
      }
      this.spinner.hide();
    }, (err) => {
      console.log(err);
    });

  }

  private setAuthInLocalStorage(auth): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth.authToken));
      return true;
    }
    return false;
  }
  private createAuthObj(resp): AuthModel {
    const auth: AuthModel = new AuthModel();
    auth.authToken = resp || '';
    auth.refreshToken = 'token_' + +new Date();
    auth.expiresIn = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
    return auth;
  }

  isShowTestTableSection = false;
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    if(this.loggedInUser){
      this.isShowTestTableSection = true;
    }else{
      this.isShowTestTableSection = false;
    }
  }

  decryptParam(param) {
    const response = "";
    this.TPService.decryptData(param).subscribe((resp: any) => {
      if (resp.statusCode == 200) {
        if (resp.payLoadArr && resp.payLoadArr.length) {
          // console.warn("Here we Go ",resp.payLoadArr)
          this.ModifiedBy = resp.payLoadArr[0].userId;
          this.loggedIn = true;
          const params = {
            TestProfileName: "",
            TestProfileId: param.TestProfileId,
            isLabTest: 1
          }

        } else {
          this.toastr.warning(("Wrong Credentials"), 'warning');
        }
      } else if (resp.StatusCode == 202) {
        this.toastr.error((resp.message || ''));
      } else {
        this.toastr.success((resp.message || ''));
      }
      this.spinner.hide();

    }, (err) => {
      console.log(err);
    })
  }

  decryptTPID(param) {
    const paramObj = {
      TestProfileId: param
    }
    const response = "";
    this.TPService.DecryptTPID(paramObj).subscribe((resp: any) => {
      this.TPID = resp.payLoad;

    }, (err) => {
      console.log(err);
    })
  }

  TestConfigFormReset(form) {
    this.spinner.show();
    console.log(form)
    window.location.reload();
    setTimeout(() => {
      this.spinner.hide();
    }, 200)
  }

  ImageRemove(picID) { // TestProfileIDURL
    this.imageURL = "";
    this.myInputVariable.nativeElement.value = "";

  }


  GetBodyParts() {
    let response = [];
    const BodyPartCount = [];

    this.BodyPartCount = response.length
    this.TPService.GetBodyparts().subscribe((resp: any) => {
      response = JSON.parse(resp.PayLoadStr);
      this.BodyParts = response;
    }, (err) => {
      console.log(err);
    })
  }

  getSymptoms() {
    this.TPService.GetSymptoms().subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp && resp.PayLoad.length) {
        this.sysmtomsList = resp.PayLoad
        // console.log(" this.sysmtomsList___________", this.sysmtomsList)
      }
    }, (err) => { console.log(err) })
  }
  GetDiseases() {
    let response = [];
    const ObjParams = {
      DiseasesID: this.DiseasesID
    }
    this.DiseaseCount = response.length
    this.TPService.GetDiseases().subscribe((resp: any) => {
      response = JSON.parse(resp.PayLoadStr);
      this.DiseaseTitleList = response;
    }, (err) => {
      console.log(err);
    })
  }
  getTestSampleCollectionType() {
    this.TPService.GetTestSampleCollectionType().subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.sampleCollectionMedium = resp.PayLoad;
        this.altSampleCollectionMedium = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  AddUpdateTP(param, myform) {
    let response = [];

    let data = {}
    try {
      this.disabledButton = true; // button dissabled till response
      this.isSpinner = false;//show button spinner



      data = {
        TPID: this.ExTPID,
        Gender: param.Gender,
        BodyPart: param.BodyPartTitle.toString(),
        DiseaseTitle: param.DiseaseTitle.toString(),
        PatientInstructions: param.PatientInstructions,
        PatientInstructionsHTML: param.PatientInstructionsHTML,
        TestDescription: param.TestDescription,
        TestDescriptionHTML: param.TestDescriptionHTML,
        isHCTestProfile: this.isHCTestProfile,
        isOnlineBookingAllowed: this.isOnlineBookingAllowed,
        isMedicalOfficerIntervention: this.isMedicalOfficerIntervention,
        isBypassAssigner: this.isBypassAssigner,
        isBypassTech: this.isBypassTech,
        isService: this.isService,
        isCancelable: this.isCancelable,
        isAdvanceCancellation: this.isAdvanceCancellation,
        isAIAssistEnable: this.isAIAssistEnable,
        ServiceType: this.serviceType,
        IsFasting: this.isFastingReq,
        FastingHours: this.fastingHours,
        isTechHistoryRequred: this.isTechHistoryRequred,
        SymptomsIDs: this.selectedSymptoms.toString(),
        TestCollectionMedium: this.selectedTestCollectionMedium,
        AlternateTestCollectionMedium: this.selectedAlternateTestCollectionMedium,
        ManualTAT: param.manualTAT
      }
    }
    catch (ex) {
      this.disabledButton = false; // button dissabled till response
      this.isSpinner = true;//show button spinner
    }
    console.log('param Data is: ', data)
    this.TPService.AddUpdateTProfile(data).subscribe((resp: any) => {
      this.spinner.hide();
      response = JSON.parse(resp.PayLoadStr);
      if (resp.StatusCode == 200) {
        this.toastr.success((resp.Message || ''), 'Success');
        try {
          this.isSubmitted = true;
          this.loggedIn = false;
          this.disabledButton = false;
          this.isSpinner = true;
          // setTimeout(window.close, 1000);
        } catch (e) { }
      } else {
        this.toastr.error((resp.message || ''), 'Failure');
        this.disabledButton = true;
        this.isSpinner = false;
      }

    }, (err) => {
      this.spinner.hide();

      console.log(err);

    })

    if (this.IsImageAttached == 1) {
      const AddUpdateTPImage = {
        TPID: this.ExTPID,
        TestProfilePic: this.imageURL, //param.imageURL,
        TestProfilePicThumbnail: this.imageURL, //param.imageURL,
        TestProfilePicID: this.curTestProfilePicID,
        CreatedBy: this.UserID || this.loggedInUser.userid, //this.loggedInUser.userid || -99
      }
      this.TPService.AddUpdateTPImage(data).subscribe((resp: any) => {
        response = JSON.parse(resp.PayLoadStr);
        if (resp.StatusCode == 200) {
          // this.toastr.success((resp.message || ''), 'Success');
          this.IsImageAttached = 0;
          this.ImageRemove(this.ExTPID)
          // myform.refresh()
          try {
            // window.location.reload()
          } catch (e) { }
        } else {
          this.toastr.error((resp.message || ''), 'Failur');
        }
      }, (err) => {
        console.log(err);

      })
    }
  }
  // *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*  For File or Pic Upload Function  -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
  showPreview(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.uploadForm.patchValue({
      avatar: file
    });
    this.uploadForm.get('avatar').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      this.IsImageAttached = 1;
    }
    reader.readAsDataURL(file)

  }

  // Submit Form
  // submit() {
  //   console.log(this.uploadForm.value)
  // }

  // *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*

  TPNameCardHeader = "Test Profile Config";
 GetTestProfileDataByID(param: any) {

  const ObjParams = { TPID: param };

  this.spinner.show(this.spinnerRefs.mainFormSection);

  this.TPService.GetTestProfileDataByID(ObjParams).subscribe(
    (resp: any) => {

      this.spinner.hide(this.spinnerRefs.mainFormSection);

      const response = JSON.parse(resp.PayLoadStr || '{}');
      this.TestProfileData = response;

      if (
        this.TestProfileData?.Table?.length ||
        this.TestProfileData?.Table1?.length
      ) {

        const table = this.TestProfileData.Table[0];

        /* ---------- BASIC DETAILS ---------- */
        this.Gender = table.Gender;
        this.PatientInstructions = table.PatientInstruction;
        this.PatientInstructionsHTML = table.PatientInstructionHTML;
        this.TestDescription = table.TPDescription;
        this.TestDescriptionHTML = table.TPDescriptionHTML;
        this.TestProfileName = table.TestProfileName;
        this.TPCode = table.TPCode;

        /* ---------- FLAGS ---------- */
        this.isHCTestProfile = table.isHCTestProfile;
        this.isOnlineBookingAllowed = table.isOnlineBookingAllowed;
        this.isMedicalOfficerIntervention = table.isMedicalOfficerIntervention;
        this.isBypassAssigner = table.isBypassAssigner;
        this.isBypassTech = table.isBypassTech;
        this.isService = table.isService;
        this.isCancelable = table.IsCancelable;
        this.isAdvanceCancellation = table.isAdvanceCancellation;
        this.isAIAssistEnable = table.isAIAssistEnable;

        /* ---------- FASTING & SERVICE ---------- */
        this.serviceType = table.ServiceType;
        this.isFastingReq = table.IsFasting;
        this.fastingHours = table.FastingHours;
        this.isTechHistoryRequred = table.isTechHistoryRequred;
        this.manualTAT = table.ManualTAT;

        /* ---------- COLLECTION MEDIUM ---------- */
        this.selectedTestCollectionMedium = table.TestSampleCollectionMediumID;
        this.selectedAlternateTestCollectionMedium = table.AlternateTestCollectionMedium;

        /* ---------- MAPPED MULTI SELECTS ---------- */
        this.selectedDiseases = this.TestProfileData.Table1
          ?.map((a: any) => a.IDiseasesID) || [];

        this.selectedBodyparts = this.TestProfileData.Table2
          ?.map((a: any) => a.IBodyPartID) || [];

        this.selectedSymptoms = this.TestProfileData.Table3
          ?.map((a: any) => a.SymptomID) || [];

        /* ---------- UI HEADERS ---------- */
        this.CardTitle =
          `Test-Profile Configurations [${this.TPCode} - ${this.TestProfileName}]`;

        this.TPNameCardHeader =
          `${this.TPCode} - ${this.TestProfileName}`;
      }

      this.cd.detectChanges();
    },
    (err) => {
      this.spinner.hide(this.spinnerRefs.mainFormSection);
      console.error(err);
    }
  );

  /* ---------- IMAGE LOAD ---------- */
  if (this.IsImageAttached === 0) {

    const imgParams = { TPID: this.ExTPID };

    this.spinner.show();

    this.TPService.GetTestProfilePicByID(imgParams).subscribe(
      (resp: any) => {

        this.spinner.hide();

        const response = JSON.parse(resp.PayLoadStr || '{}');

        if (response?.Table?.length) {
          this.imageURL = response.Table[0].TestProfileImage;
          this.IsImageAttached = 1;
          this.TestProfilePicId = response.Table[0].TestProfilePicID;
          this.curTestProfilePicID = response.Table[0].TestProfilePicID;
        }
      },
      (err) => {
        this.spinner.hide();
        console.error(err);
      }
    );
  }
}


  GetTestProfileParamsByTPID(param) {
    let response = [];
    const ObjParams = {
      pTPID: param,
    }
    this.spinner.show();
    this.TPService.GetTestProfileParamsByTPID(ObjParams).subscribe((resp: any) => {
      this.spinner.hide();
      response = JSON.parse(resp.PayLoadStr);
      this.TPParams = response['Table'];
      // Machine names array
      let machineArr: any;
      let machineIdsArr: any;
      this.TPParams.forEach((element, index) => {
        const machineNames = (element.MachineName) ? (element.MachineName.replace(/[, ]+$/, "").trim()) : null
        const string = (machineNames) ? machineNames.split(',') : '';
        [...string];
        Array.from(string);
        machineArr = Object.assign([], string);
        machineArr = machineArr.filter(e => e != '');
        this.TPParams[index].ArrMachineNames = machineArr;

        // Machine names array
        // Machine Ids array

        const machineIds = (element.MachineID) ? (element.MachineID.replace(/[, ]+$/, "").trim()) : null
        const stringIds = (machineIds) ? machineIds.split(',') : '';
        [...stringIds];
        Array.from(string);
        machineIdsArr = Object.assign([], stringIds);
        machineIdsArr = machineIdsArr.filter(e => e != '');
        this.TPParams[index].ArrMachineIds = machineIdsArr;
        this.TPParams[index].ArrMachineIdsDesc = this.TPParams[index].ArrMachineIds.sort((a, b) => b - a);
        // console.log('Machin ids array is : ',this.TPParams[index].ArrMachineIds)
        // console.log('Machin ids array is after desc : ',this.TPParams[index].ArrMachineIds.sort((a,b) => b - a))
      });
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    })

  }

  // ------------------------------------------------------------------------------------------------------

  updateUrlParams_navigateTo(url, params = {}, settings = {}) {
    const _url = url || [];
    const _settings = {
      ...{
        // relativeTo: this.route,
        replaceUrl: true,
        queryParams: params,
        // queryParamsHandling: 'merge', // remove to replace all query params by provided
      }, ...settings
    };
    this.router.navigate(
      _url,
      _settings
    );
  }

  getUrlParams(): any {
    const vars = {};
    let hash;
    let encryptedQueryString = '';
    if (window.location.href.indexOf('?') === -1) {
      return vars;
    } else {
      encryptedQueryString = window.location.href.slice(window.location.href.indexOf('?') + 1);
    }
    try {
      encryptedQueryString = decodeURIComponent(encryptedQueryString);
    } catch (err) { }
    try {
      encryptedQueryString = atob(encryptedQueryString);
    } catch (err) {
      try {
        encryptedQueryString = atob(encryptedQueryString + '=');
      } catch (err) {
        try {
          encryptedQueryString = atob(encryptedQueryString + '==');
        } catch (err) {
          try {
            encryptedQueryString = atob(encryptedQueryString.split('=').filter(a => a).join('='));
          } catch (err) {
            // console.log(err);
          }
        }
      }
    }
    const hashes = encryptedQueryString.split('&'); // atob
    for (let i = 0; i < hashes.length; i++) {
      hash = hashes[i].split(/=(.+)/); //.split('=');
      vars[hash[0]] = hash[1];
    }

    return vars;
  }

  closeLoginModal() {
    this.modalService.dismissAll();
    this.spinner.hide();
  }

  showAssocMachineModal(ParamID: any, MachineID: any, ArrMachineIds) {
    this.ParamID = ParamID;
    this.MachineID = MachineID;
    this.getMachine(null, ArrMachineIds)
    this.appPopupService.openModal(this.assocMachineModal, { size: 'lg' });
  }

  showAssocMachineModalInner() {
    this.appPopupService.openModal(this.assocMachineModal, { size: 'lg' });
  }

  getMachine(MachineID, filterIDs: any = []) {
    const params = {
      MachineID: MachineID
    };
    this.TPService.getMachineForTP(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.MachineList = res.PayLoad || [];
        if (filterIDs) {
          this.MachineList = this.MachineList.filter(a => !filterIDs.includes(a.MachineID.toString()))
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }



  associateMachine() {
    this.disabledButton = true;
    this.isSpinner = false;
    const formValues = this.formAssocMachine.getRawValue();
    this.formAssocMachine.markAllAsTouched();
    if (!this.formAssocMachine.valid) {
      this.toastr.warning('Please fill the required information!');
      this.disabledButton = false;
      this.isSpinner = true;
    } else {
      if (!((formValues.RangeFrom && formValues.RangeTo) || formValues.RangeText)) {
        this.toastr.warning('Either provide Range From and Range to OR Range Text');
        this.disabledButton = false;
        this.isSpinner = true;
        return;
      }
      const ageFromDays = (formValues.AgeType == 'D') ? formValues.AgeFrom : this.daysConversion(formValues.AgeType, formValues.AgeFrom)
      const ageToDays = (formValues.AgeType == 'D') ? formValues.AgeTo : this.daysConversion(formValues.AgeType, formValues.AgeTo)
      const objParam = {
        ParamID: this.ParamID || null,
        MachineID: formValues.MachineID,
        CreatedBy: this.UserID || this.loggedInUser.userid, //this.loggedInUser.userid || -99,
        tblParamMachineRange: [{
          "ParamMachineRangeID": null,
          "ParamID": this.ParamID,
          "MachineID": formValues.MachineID,
          "Gender": formValues.Gender,
          "AgeFrom": formValues.AgeFrom,
          "AgeTo": formValues.AgeTo,
          "AgeType": formValues.AgeType,
          "RangeFrom": formValues.RangeFrom,
          "RangeTo": formValues.RangeTo,
          "RangeText": formValues.RangeText,
          "AgeFromDays": ageFromDays,
          "AgeToDays": ageToDays
        }]
      }
      this.TPService.insertUpdateParamMachineRanges(objParam).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success('Machine has been associated successfully');
            this.GetTestProfileParamsByTPID(this.ExTPID)
            this.getMachine(this.MachineID);
            this.formAssocMachine.reset();
            this.disabledButton = false;
            this.isSpinner = true;
            this.closeLoginModal();
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButton = false;
            this.isSpinner = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButton = false;
        this.isSpinner = true;
      })
    }
  }

  addUpdateRange() {
    this.disabledButtonRange = true;
    this.isSpinnerRange = false;
    const formValues = this.formAddUpdateRange.getRawValue();
    this.formAddUpdateRange.markAllAsTouched();
    if (!this.formAddUpdateRange.valid) {
      this.toastr.warning('Please fill the required information!');
      this.disabledButtonRange = false;
      this.isSpinnerRange = true;
    } else {
      if (!((formValues.RangeFrom && formValues.RangeTo) || formValues.RangeText)) {
        this.toastr.warning('Either provide Range From and Range to OR Range Text');
        this.disabledButtonRange = false;
        this.isSpinnerRange = true;
        return;
      }
      const ageFromDays = (formValues.AgeType == 'D') ? formValues.AgeFrom : this.daysConversion(formValues.AgeType, formValues.AgeFrom)
      const ageToDays = (formValues.AgeType == 'D') ? formValues.AgeTo : this.daysConversion(formValues.AgeType, formValues.AgeTo)
      const objParam = {
        ParamID: this.ParamID || null,
        MachineID: this.MachineID,
        CreatedBy: this.UserID || this.loggedInUser.userid, // this.loggedInUser.userid || -99,
        tblParamMachineRange: [{
          "ParamMachineRangeID": this.ParamMachineRangeID,
          "ParamID": this.ParamID,
          "MachineID": this.MachineID,
          "Gender": formValues.Gender,
          "AgeFrom": formValues.AgeFrom,
          "AgeTo": formValues.AgeTo,
          "AgeType": formValues.AgeType,
          "RangeFrom": formValues.RangeFrom,
          "RangeTo": formValues.RangeTo,
          "RangeText": formValues.RangeText,
          "AgeFromDays": ageFromDays,
          "AgeToDays": ageToDays
        }]
      }
      // console.log("objParams__________________________________",objParam);return;
      this.TPService.insertUpdateParamMachineRanges(objParam).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            if (this.ParamMachineRangeID) {
              this.toastr.success('Range has been updated successfully');
            } else {
              this.toastr.success('Range has been added successfully');
            }

            this.ParamMachineRangeID = null;
            this.GetTestProfileParamsByTPID(this.ExTPID)
            this.getMachine(this.MachineID);
            this.formAddUpdateRange.reset();
            this.disabledButtonRange = false;
            this.isSpinnerRange = true;
            this.closeLoginModal();
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButtonRange = false;
            this.isSpinnerRange = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonRange = false;
        this.isSpinnerRange = true;
      })
    }
  }

  showMachineRangesDetail(ParamID: any, MachineID: any = null, row) {
    this.getMachine(null, row.ArrMachineIds)
    this.ParamID = ParamID;
    this.MachineID = MachineID;
    this.appPopupService.openModal(this.assocMachineDetailModal);

    const params = {
      ParamID: this.ParamID,
      MachineID: MachineID
    };
    this.TPService.getParamMachineRangesByParamID(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        const ranges = res.PayLoad || [];
        const result = ranges.reduce((re, o) => {
          const existObj = re.find(
            obj => obj.MachineID === o.MachineID
          )

          if (existObj) {
            existObj.ranges.push({
              ParamMachineRangeID: o.ParamMachineRangeID,
              AgeType: o.AgeType,
              Gender: o.Gender,
              AgeFrom: o.AgeFrom,
              AgeTo: o.AgeTo,
              RangeFrom: o.RangeFrom,
              RangeTo: o.RangeTo,
              RangeText: o.RangeText
            })
          } else {
            re.push({
              MachineID: o.MachineID,
              MachineName: o.MachineName,
              ParamID: o.ParamID,
              ranges: [{
                ParamMachineRangeID: o.ParamMachineRangeID,
                AgeType: o.AgeType,
                Gender: o.Gender,
                AgeFrom: o.AgeFrom,
                AgeTo: o.AgeTo,
                RangeFrom: o.RangeFrom,
                RangeTo: o.RangeTo,
                RangeText: o.RangeText
              }]
            })
          }
          return re
        }, []);
        this.ParamMachineRages = result;
        this.TestRanges = this.ParamMachineRages.length ? this.ParamMachineRages[0].ranges : [];
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }


  addUpdateRangeParamObj = {}
  showAddUpdateRangeModal(paramID: any, machineID, machineName, actionLabel: any, row, isMachineRangesList) {
    if (row) {
      this.ActionBtnText = 'Update';
      this.ActionBtnIcon = 'fa fa-edit';
    } else {
      this.ActionBtnText = 'Save';
      this.ActionBtnIcon = 'fa fa-save';
      this.ParamMachineRangeID = null
    }

    this.formAddUpdateRange.reset();
    this.addUpdateRangeParamObj = {
      paramID: paramID,
      machineID: machineID
    }

    this.isMachineRangesList = isMachineRangesList;
    this.ParamID = paramID;
    this.MachineID = machineID;
    this.MachineName = machineName;
    this.ActionLabel = actionLabel;
    if (row) {
      this.ParamMachineRangeID = row.ParamMachineRangeID;
      this.formAddUpdateRange.patchValue({
        Gender: row.Gender,
        AgeType: row.AgeType,
        AgeFrom: row.AgeFrom,
        AgeTo: row.AgeTo,
        RangeFrom: row.RangeFrom,
        RangeTo: row.RangeTo,
        RangeText: row.RangeText
      })
    }


    if (isMachineRangesList) {
      const params = {
        ParamID: this.ParamID,
        MachineID: machineID
      };
      this.TPService.getParamMachineRangesByParamID(params).subscribe((res: any) => {
        if (res.StatusCode == 200) {
          const ranges = res.PayLoad || [];
          const result = ranges.reduce((re, o) => {
            const existObj = re.find(
              obj => obj.MachineID === o.MachineID
            )

            if (existObj) {
              existObj.ranges.push({
                ParamMachineRangeID: o.ParamMachineRangeID,
                AgeType: o.AgeType,
                Gender: o.Gender,
                AgeFrom: o.AgeFrom,
                AgeTo: o.AgeTo,
                RangeFrom: o.RangeFrom,
                RangeTo: o.RangeTo,
                RangeText: o.RangeText
              })
            } else {
              re.push({
                MachineID: o.MachineID,
                MachineName: o.MachineName,
                ParamID: o.ParamID,
                ranges: [{
                  ParamMachineRangeID: o.ParamMachineRangeID,
                  AgeType: o.AgeType,
                  Gender: o.Gender,
                  AgeFrom: o.AgeFrom,
                  AgeTo: o.AgeTo,
                  RangeFrom: o.RangeFrom,
                  RangeTo: o.RangeTo,
                  RangeText: o.RangeText
                }]
              })
            }
            return re
          }, []);
          this.ParamMachineRages = result;
          this.TestRanges = this.ParamMachineRages.length ? this.ParamMachineRages[0].ranges : [];
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
      })
    };
    this.appPopupService.openModal(this.addUpdateRangeModal, { size: 'lg' });
  }

  showAddUpdateRangeModalMain(paramID: any, machineName, actionLabel: any, row, isMachineRangesList) {
    this.ActionBtnText = 'Save';
    this.ActionBtnIcon = 'fa fa-save';
    this.ActionLabel = 'Add Range';
    this.formAddUpdateRange.reset();
    const machineNameID = machineName.split('^');
    this.addUpdateRangeParamObj = {
      paramID: paramID,
      machineID: machineNameID[0]
    }
    // console.log('obj param: ', this.addUpdateRangeParamObj)
    this.isMachineRangesList = isMachineRangesList;
    this.ParamID = paramID;
    this.MachineID = machineNameID[0];
    this.MachineName = machineNameID[1];
    this.ActionLabel = actionLabel;
    if (row) {
      this.ParamMachineRangeID = row.ParamMachineRangeID;
      this.formAddUpdateRange.patchValue({
        Gender: row.Gender,
        AgeType: row.AgeType,
        AgeFrom: row.AgeFrom,
        AgeTo: row.AgeTo,
        RangeFrom: row.RangeFrom,
        RangeTo: row.RangeTo,
        RangeText: row.RangeText
      })
    }


    if (isMachineRangesList) {
      const params = {
        ParamID: this.ParamID,
        MachineID: this.MachineID
      };
      this.TPService.getParamMachineRangesByParamID(params).subscribe((res: any) => {
        if (res.StatusCode == 200) {
          const ranges = res.PayLoad || [];
          const result = ranges.reduce((re, o) => {
            const existObj = re.find(
              obj => obj.MachineID === o.MachineID
            )

            if (existObj) {
              existObj.ranges.push({
                ParamMachineRangeID: o.ParamMachineRangeID,
                AgeType: o.AgeType,
                Gender: o.Gender,
                AgeFrom: o.AgeFrom,
                AgeTo: o.AgeTo,
                RangeFrom: o.RangeFrom,
                RangeTo: o.RangeTo,
                RangeText: o.RangeText
              })
            } else {
              re.push({
                MachineID: o.MachineID,
                MachineName: o.MachineName,
                ParamID: o.ParamID,
                ranges: [{
                  ParamMachineRangeID: o.ParamMachineRangeID,
                  AgeType: o.AgeType,
                  Gender: o.Gender,
                  AgeFrom: o.AgeFrom,
                  AgeTo: o.AgeTo,
                  RangeFrom: o.RangeFrom,
                  RangeTo: o.RangeTo,
                  RangeText: o.RangeText
                }]
              })
            }
            return re
          }, []);
          this.ParamMachineRages = result;
          this.TestRanges = this.ParamMachineRages.length ? this.ParamMachineRages[0].ranges : [];
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
      })
    };
    this.appPopupService.openModal(this.addUpdateRangeModal, { size: 'lg' });
  }


  patchExistingRangeRow(existingMachine, ExistingRange) {
    this.ActionBtnText = 'Update';
    this.ActionBtnIcon = 'fa fa-edit';
    this.ParamID = existingMachine.ParamID;
    // this.MachineID = existingMachine.MachineID;
    // this.MachineName = existingMachine.MachineName;
    this.ActionLabel = 'Update Range';
    this.ParamMachineRangeID = ExistingRange.ParamMachineRangeID;
    this.formAddUpdateRange.patchValue({
      Gender: ExistingRange.Gender,
      AgeType: ExistingRange.AgeType,
      AgeFrom: ExistingRange.AgeFrom,
      AgeTo: ExistingRange.AgeTo,
      RangeFrom: ExistingRange.RangeFrom,
      RangeTo: ExistingRange.RangeTo,
      RangeText: ExistingRange.RangeText
    })

  }
  newRange() {
    this.formAddUpdateRange.reset();
    this.ParamMachineRangeID = null;
    this.ActionBtnText = 'Save';
    this.ActionBtnIcon = 'fa fa-save';
    this.ActionLabel = 'Add Range';
  }

  deleteParamMachineRangeByID(ParamMachineRangeID) {
    const objParam = {
      ParamMachineRangeID: ParamMachineRangeID
    };
    this.TPService.deleteParamMachineRangeByID(objParam).subscribe((data: any) => {
      this.spinner.hide();
      if (data.StatusCode == 200) {
        this.toastr.success('Record Deleted Successfully');
        const params = {
          ParamID: this.addUpdateRangeParamObj["paramID"],
          MachineID: this.addUpdateRangeParamObj["machineID"]
        };

        this.TPService.getParamMachineRangesByParamID(params).subscribe((res: any) => {
          if (res.StatusCode == 200) {
            const ranges = res.PayLoad || [];
            const result = ranges.reduce((re, o) => {
              const existObj = re.find(
                obj => obj.MachineID === o.MachineID
              )

              if (existObj) {
                existObj.ranges.push({
                  ParamMachineRangeID: o.ParamMachineRangeID,
                  AgeType: o.AgeType,
                  Gender: o.Gender,
                  AgeFrom: o.AgeFrom,
                  AgeTo: o.AgeTo,
                  RangeFrom: o.RangeFrom,
                  RangeTo: o.RangeTo,
                  RangeText: o.RangeText
                })
              } else {
                re.push({
                  MachineID: o.MachineID,
                  MachineName: o.MachineName,
                  ParamID: o.ParamID,
                  ranges: [{
                    ParamMachineRangeID: o.ParamMachineRangeID,
                    AgeType: o.AgeType,
                    Gender: o.Gender,
                    AgeFrom: o.AgeFrom,
                    AgeTo: o.AgeTo,
                    RangeFrom: o.RangeFrom,
                    RangeTo: o.RangeTo,
                    RangeText: o.RangeText
                  }]
                })
              }
              return re
            }, []);
            this.ParamMachineRages = result;
            this.TestRanges = this.ParamMachineRages.length ? this.ParamMachineRages[0].ranges : [];
            this.GetTestProfileParamsByTPID(this.ExTPID)
          }
        }, (err) => {
          console.log(err);
          this.toastr.error('Connection error');
        })

        // this.ProductsPromotionsList = this.ProductsPromotionsList.filter( a=> a.ProductPromotionID != id);
      } else {
        this.toastr.error('Something went wrong! Please contact system support');
      }
    }, (err) => {
      // this.spinner.hide();
    })
  }

  truncate(source, size) {
    if (source) {
      return source.length > size ? source.slice(0, size - 1) + " …" : source;
    } else {
      return '';
    }
  }


  daysConversion(ageType, age) {
    if (ageType == 'M') {
      let ageCalc = age * 30.4167;
      ageCalc = Math.floor(ageCalc);
      return ageCalc;
      return age * 30.4167;
    } else if (ageType == 'Y') {
      return age * 365;
    }
  }


  ////////begin::Convert Number of days to Year Months and Days in case of Age type Day/////////
  getFormatedStringFromDays_(numberOfDays) {
    const years = Math.floor(numberOfDays / 365);
    const months = Math.floor(numberOfDays % 365 / 30);
    const days = Math.floor(numberOfDays % 365 % 30);

    const yearsDisplay = years > 0 ? years + (years == 1 ? "Y, " : " Yrs, ") : "";
    const monthsDisplay = months > 0 ? months + (months == 1 ? "M, " : " Mos, ") : "";
    const daysDisplay = days > 0 ? days + (days == 1 ? "D" : "Dys") : "";
    return yearsDisplay + monthsDisplay + daysDisplay;
  }

  getFormatedStringFromDays(numberOfDays) {
    const currentDate = new Date();
    const calculatedDate = currentDate.setDate(currentDate.getDate() - numberOfDays);
    const finalDateParam = this.datePipe.transform(calculatedDate, 'yyyy, MM, dd');
    return (this.getAge(new Date(finalDateParam), new Date()))
  }


  getAge(date_1, date_2) {
    //convert to UTC
    const date2_UTC = new Date(Date.UTC(date_2.getUTCFullYear(), date_2.getUTCMonth(), date_2.getUTCDate()));
    const date1_UTC = new Date(Date.UTC(date_1.getUTCFullYear(), date_1.getUTCMonth(), date_1.getUTCDate()));
    let yAppendix, mAppendix, dAppendix;
    //--------------------------------------------------------------
    let days = date2_UTC.getDate() - date1_UTC.getDate();
    days = days - 1;
    if (days < 0) {
      date2_UTC.setMonth(date2_UTC.getMonth() - 1);
      days += this.DaysInMonth(date2_UTC);
    }
    //--------------------------------------------------------------
    let months = date2_UTC.getMonth() - date1_UTC.getMonth();
    if (months < 0) {
      date2_UTC.setFullYear(date2_UTC.getFullYear() - 1);
      months += 12;
    }
    //--------------------------------------------------------------
    const years = date2_UTC.getFullYear() - date1_UTC.getFullYear();
    if (years > 1) yAppendix = "yrs";
    else yAppendix = "y";
    if (months > 1) mAppendix = "mos";
    else mAppendix = "m";
    if (days > 1) dAppendix = "dys";
    else dAppendix = "d";
    return years + yAppendix + ", " + months + mAppendix + ", " + days + dAppendix;
  }

  DaysInMonth(date2_UTC) {
    const monthStart: any = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth(), 1);
    const monthEnd: any = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth() + 1, 1);
    const monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
    return monthLength;
  }
  ////////end::Convert Number of days to Year Months and Days in case of Age type Day/////////
  AgeLimitError = false;
  validateMinMaxAge(AgeFrom, AgeTo) {
    AgeFrom = Number(AgeFrom);
    AgeTo = Number(AgeTo);
    if ((AgeFrom && AgeTo) && AgeTo < AgeFrom) {
      this.AgeLimitError = true;
      this.formAddUpdateRange.patchValue({
        AgeTo: ''
      })
      this.formAssocMachine.patchValue({
        AgeTo: ''
      })
    } else {
      this.AgeLimitError = false;
    }
  }
  getPostfixForValue(rangeType) {
    let lbl = '';
    if (rangeType == "M") {
      lbl = 'm'
    } else if (rangeType == 'Y') {
      lbl = 'y'
    } else {
      lbl = '';
    }
    return lbl;
  }

  ///////////////////////////start::dissociateMachine//////////////////////////////////////////////
  dissociateMachine(paramID: any, machineID) {
    this.disabledButtonRemove = true; // Lock the button after for submit to wait till process is completed and respone is send
    this.isSpinnerRemove = false; // Button Spinner show
    this.spinner.show(this.spinnerRefs.machineAssocSection);
    const objParam = {
      ParamID: paramID,
      MachineID: machineID,
      CreatedBy: this.UserID || this.loggedInUser.userid,
    };
    this.TPService.deleteMachineRangeByMachineID(objParam).subscribe((data: any) => {
      this.disabledButtonRemove = false;
      this.isSpinnerRemove = true;
      this.spinner.hide(this.spinnerRefs.machineAssocSection);
      if (data.StatusCode == 200) {
        this.toastr.success('Machine Dissociated Successfully');
        this.GetTestProfileParamsByTPID(this.ExTPID)
        this.closeLoginModal();
      } else {
        this.toastr.error('Something went wrong! Please contact system support');
      }
    }, (err) => {
      this.toastr.error('Something went wrong! Please contact system support');
      this.disabledButtonRemove = false;
      this.isSpinnerRemove = true;
      this.spinner.hide(this.spinnerRefs.machineAssocSection);
    })
  }
  ///////////////////////////end::dissociateMachine//////////////////////////////////////////////


  ///////////////////////////start::Machine Priority//////////////////////////////////////////////

  getTestMachines(TPID) {
    this.TPID = TPID;
    // this.spinner.show(this.spinnerRefs.machinePriorityFormSection);
    const params = {
      TPId: this.TPID
    };
    this.LabConfService.getTestMachinesExtended(params).subscribe((res: any) => {
      // this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
      if (res.StatusCode == 200) {
        this.TestMachineList = res.PayLoad || [];
        if (this.TestMachineList <= 0) {
          this.toastr.warning('No associated machine found against "' + this.TestProfileName + '"!')
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      // this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
    })
    this.spinner.hide();
  }
  ///////////////////////////end::Machine Priority//////////////////////////////////////////////


  ///////////////////////////start::Update Machine Priority//////////////////////////////////////////////
  updateTestMachinePriority() {
    this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
    this.isSpinner = false; // Button Spinner show
    this.spinner.show(this.spinnerRefs.machinePriorityFormSection);
    if (this.TestMachineList.length) {
      const objParam = {
        MachineTestID: this.TestMachineList[0].MachineTestID,
        TPID: this.TPID,
        CreatedBy: this.UserID || this.loggedInUser.userid,
        tblMachineTest: this.TestMachineList.map(a => {
          return {
            MachineTestID: a.MachineTestID,
            MachineID: a.MachineID,
            TPID: this.TPID,
            PerformingTime: null,
            MachinePriority: a.MachinePriority
          }
        })
      }
      this.LabConfService.updateTestMachinePriority(objParam).subscribe((data: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.getTestMachines(this.TPID);
          } else {
            this.toastr.error(data.Message)
          }
          this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
        }
      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
        this.toastr.error('Connection error');
        this.disabledButton = false;
        this.isSpinner = true;
      })
    }
  }
  ///////////////////////////end::Update Machine Priority//////////////////////////////////////////////

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.TestMachineList, event.previousIndex, event.currentIndex);
    this.TestMachineList.forEach((item, idx) => {
      item.MachinePriority = idx + 1;
    });
  }


  risOnQuestionPriorityChange(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedQuestion, event.previousIndex, event.currentIndex);
    this.selectedQuestion.forEach((item, idx) => {
      item.SortOrder = idx + 1;
    });
  }
  risInventoryPriorityChange(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedItems, event.previousIndex, event.currentIndex);
    this.selectedItems.forEach((item, idx) => {
      item.SortOrder = idx + 1;
    });
  }

  classificationList = []
  questionClassificationID = null;
  getQuestionClassification() {
    const params = {
      QuestionClassificationID: null
    };
    this.questionnaireService.getQuestionClassification(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.classificationList = res.PayLoad || [];
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }

  onTabChanged($event) {
    if($event.index == 0){
      this.QuestionGroupTypeID = 5;
      this.getQuestion();
      this.getTestProfileQuestions(this.ExTPID);
    }else if($event.index == 1){
      this.QuestionGroupTypeID = 8;
      this.getQuestion();
      this.getTestProfileQuestions(this.ExTPID);
    }
    else{
      this.QuestionGroupTypeID = 5;
      this.getQuestion();
      this.getTestProfileQuestions(this.ExTPID);
    }
  }
  
  questionList = []
  QuestionGroupTypeID = 5;
  getQuestion() {
    this.questionList = [];
    const params = {
      QuestionID: null,
      QuestionGroupTypeID :this.QuestionGroupTypeID
    };
    this.questionnaireService.getQuestion(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.questionList = res.PayLoad || [];
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  selectedQuestion = [];
  addSelectedQuestion(e) {
    if (e) {
      if (!this.selectedQuestion.find(a => a.QuestionID == e.QuestionID)) {
        const newQuestion = this.questionList.find(x => x.QuestionID == e.QuestionID)
        if (newQuestion) {
          this.selectedQuestion.push(newQuestion);
          const filteredQuestions = this.questionList.filter(x => x.QuestionID != e.QuestionID)
          this.questionList = filteredQuestions;

        }
      } else {
        this.toastr.info("This question is already added")
      }
    }
  }
  // this.selectedDiseases = this.TestProfileData['Table1'].map(a => a.IDiseasesID);

  getQClassificationQuestions(e) {
    this.selectedQuestion = [];
    if (e.length) {
      const classificationIDs = this.selectedQuestionClassification.join(",")
      this.getQClassificationSelectedQuestions(classificationIDs)
    }
  }
  getQClassificationSelectedQuestions(classificationIDs) {
    this.getQuestion();
    this.selectedQuestion = [];
    const params = {
      QuestionClassificationID: classificationIDs
    };
    this.questionnaireService.getQClassificationQuestions(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.selectedQuestion = res.PayLoad || [];
        //unique qustions(Remove duplications)
        this.selectedQuestion = Array.from(this.selectedQuestion.reduce((m, t) => m.set(t.QuestionID, t), new Map()).values());
        //unique qustions(Remove duplications)
        // this.selectedQuestion = this.removeDuplicates(this.selectedQuestion, "QuestionID");
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  // removeDuplicates(originalArray, prop) {
  //   var newArray = [];
  //   var lookupObject  = {};
  //   for(var i in originalArray) {
  //      lookupObject[originalArray[i][prop]] = originalArray[i];
  //   }

  //   for(i in lookupObject) {
  //       newArray.push(lookupObject[i]);
  //   }
  //    return newArray;
  // }

  removeItem(QuestionID) {
    let newSelectQuestions = [];
    newSelectQuestions = this.selectedQuestion.filter(x => x.QuestionID != QuestionID)
    this.questionList = this.questionList.concat(this.selectedQuestion.find(x => x.QuestionID == QuestionID));
    this.selectedQuestion = newSelectQuestions;
  }

  insertUpdateTPQuestions() {
    const tpList = this.selectedQuestion.map(a => ({ TestProfileQuestionsID: a.TestProfileQuestionsID, QuestionClassificationID: a.QuestionClassificationID, QuestionID: a.QuestionID, SortOrder: a.SortOrder }));
    const objParam = {
      CreatedBy: this.UserID || this.loggedInUser.userid,
      TPID: this.TPID,
      // QuestionIDs: this.selectedQuestion.map(a => { return (a.QuestionID) }).join(",")
      tblTestProfileQuestions: tpList,
      QuestionGroupTypeID:this.QuestionGroupTypeID
    }
    this.TPService.insertUpdateTPQuestions(objParam).subscribe((data: any) => {
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          this.toastr.success(data.Message);
          this.disabledButton = false;
          this.isSpinner = true;
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          this.disabledButton = false;
          this.isSpinner = true;
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.disabledButton = false;
      this.isSpinner = true;
    })
  }

  getTestProfileQuestions(TPID) {
    const params = {
      TPID: TPID,
      QuestionGroupTypeID:this.QuestionGroupTypeID
    };
    this.questionnaireService.getTestProfileQuestions(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.selectedQuestion = res.PayLoad || [];
        // console.log("profile questions are :", this.selectedQuestion);
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////start::TestProfile Inventory////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  storeItemList = []
  getStoreItemList() {
    this.questionList = [];
    const params = {
    };
    this.TPService.getStoreItemListExtended(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.storeItemList = res.PayLoad || [];
        this.storeItemList = this.storeItemList.map(a => ({
          StoreItemId: a.StoreItemId,
          Code: a.Code,
          StoreItemTitle: a.StoreItemTitle,
          MeasuringUnit: a.MeasuringUnit,
          StoreItemFull: a.Code ? (a.Code + "-" + a.StoreItemTitle + "(" + a.MeasuringUnit + ")") : (a.StoreItemTitle + " [" + a.MeasuringUnit + "]")
        }))
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  StatusId = null;
  RISStatusID = null;
  StoreItemId = null;

  testStatusList = [];
  getTestStatus() {
    this.testStatusList = [];
    this.lookupService.getTestStatus({ testCategory: 1 }).subscribe((resp: any) => {
      const _response = resp.PayLoad || [];
      this.testStatusList = _response;
      // console.log("testStatusList: ", this.testStatusList)
    }, (err) => {
    })
  }

  RISStatusList = [];
  getRISStatus() {
    this.RISStatusList = [];
    this.lookupService.RISStatusList({}).subscribe((resp: any) => {
      const _response = resp.PayLoad || [];
      this.RISStatusList = _response;
      // console.log("RISStatusList: ", this.RISStatusList)
    }, (err) => {
    })
  }

  selectedItems = [];
  addSelectedItems(e) {
    if (e) {
      if (!this.selectedQuestion.find(a => a.StoreItemId == e.StoreItemId)) {
        const newItems = this.storeItemList.find(x => x.StoreItemId == e.StoreItemId)
        if (newItems) {
          this.selectedItems.push(newItems);
          const filteredItems = this.storeItemList.filter(x => x.StoreItemId != e.StoreItemId)
          this.storeItemList = filteredItems;

        }
      } else {
        this.toastr.info("This question is already added")
      }
    }
  }
  addSelectedItemsTypeHead(e) {
    if (e) {
      if (!this.selectedQuestion.find(a => a.StoreItemId == e.item.StoreItemId)) {
        const newItems = this.storeItemList.find(x => x.StoreItemId == e.item.StoreItemId)
        if (newItems) {
          this.selectedItems.push(newItems);
          // console.log("Dropdown selectedItems____", this.selectedItems)
          const filteredItems = this.storeItemList.filter(x => x.StoreItemId != e.item.StoreItemId)
          this.storeItemList = filteredItems;
          setTimeout(() => {
            this.selectedInventory = "";
          }, 100);

        }
      } else {
        this.toastr.info("This question is already added")
      }
    }
  }

  removeStoreItem(StoreItemId) {
    let newSelectItems = [];
    newSelectItems = this.selectedItems.filter(x => x.StoreItemId != StoreItemId)
    this.questionList = this.questionList.concat(this.selectedItems.find(x => x.StoreItemId == StoreItemId));
    this.selectedItems = newSelectItems;
  }
  setDropdown(param) {
    if (param == 1) {
      this.StatusId = null;
    } else if (param == 2) {
      this.RISStatusID = null;
    }
    this.getTPInventory();
  }
  selectedInventory = "";
  testFieldEnableDisalbe = false;
  disabledButtonInventory = false;
  isSpinnerInventory = true;

  formatter = (x: any) => x ? (x.StoreItemFull) : '';
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      // map(term => term.length < 2 ? [] : this.TestsData.filter(v => v.CODE.toLowerCase().indexOf(term.toLowerCase()) > -1 || v.DESC.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
      map(term => term.length < 2 ? [] : this.storeItemList.filter(v => v.StoreItemFull.toLowerCase().indexOf(term.toLowerCase()) == 0).slice(0, 10))
    )



  buttonClicked = false;
  InsertUpdateTPInventoryExtended() {
    this.buttonClicked = true;
    // console.log("RISSttusID: ", this.RISStatusID, " LabStatusID: ", this.StatusId)
    let isValidInventoryObj = false;
    this.selectedItems.forEach(a => {
      if (!a.ConsumeQuantity) {
        isValidInventoryObj = true;
      }
    })
    if (isValidInventoryObj) {
      this.toastr.error("Please provide item quantity!");
      return;
    } else if (!this.RISStatusID && !this.StatusId) {
      this.toastr.error("Please select atleast one status...")
      return;
    } else {
      const objParam = {
        TPId: this.TPID,
        CreatedBy: this.UserID || this.loggedInUser.userid,
        tblTPInventory: this.selectedItems.map(a => {
          return {
            TPInventoryID: a.TPInventoryID,
            TPID: this.TPID,
            StatusID: this.StatusId,
            RISStatusID: this.RISStatusID,
            StoreItemID: a.StoreItemId,
            Quantity: a.ConsumeQuantity
          }
        })
      }
      this.disabledButtonInventory = true;
      this.isSpinnerInventory = false;

      this.TPService.InsertUpdateTPInventoryExtended(objParam).subscribe((data: any) => {
        this.disabledButtonInventory = false;
        this.isSpinnerInventory = true;
        this.buttonClicked = false;

        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.getTPInventory()
            this.disabledButton = false;
            this.isSpinner = true;
            // this.closeLoginModal();
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
    }
  }

  //Get existing TP Inventory/////////////
  getTPInventory() {
    this.selectedItems = [];
    const params = {
      TPID: this.TPID,
      StatusID: this.StatusId,
      RISStatusID: this.RISStatusID
    };
    this.TPService.getTPInventoryExtended(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.selectedItems = res.PayLoad || [];
        this.selectedItems = this.selectedItems.map(a => ({
          Code: a.Code ? a.Code : "",
          MeasuringUnit: a.MeasuringUnit,
          StoreItemFull: a.Code + "-" + a.StoreItemTitle + "[" + a.MeasuringUnit + "]",
          StoreItemId: a.StoreItemID,
          StoreItemTitle: a.StoreItem,
          ConsumeQuantity: a.Quantity
        }))
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////end::TestProfile Inventory////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////

  // ngAfterViewInit() {
  //   const ckEditorElement = document.getElementById('myCkEditor');

  //   if (ckEditorElement) {
  //     // Apply styles dynamically
  //     ckEditorElement.style.width = '300px';
  //     ckEditorElement.style.height = '200px';
  //   }
  // }

}