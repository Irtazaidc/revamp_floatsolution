// @ts-nocheck
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { RisWorklistService } from 'src/app/modules/ris/services/ris-worklist.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { StorageService } from 'src/app/modules/shared/helpers/storage.service';
import { AuthService, UserModel } from '../../../../../../modules/auth';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { animate, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
@Component({
  standalone: false,

  selector: 'app-ris-worklist-params',
  templateUrl: './ris-worklist-params.component.html',
  styleUrls: ['./ris-worklist-params.component.scss'],
  animations: [
    trigger('fadeInOutTranslate', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translate(0)' }),
        animate('400ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class RisWorklistParamsComponent implements OnInit, OnChanges {
  @Output() risParamsValues = new EventEmitter<any>();
  @Input() buttonControls = ['dateFrom', 'dateTo'];
  @Input() checkDoctorFeedback = false;
  @Input() paramsValuesForWorkListHeader = {
    formHeaderBGClass: null,
    formHeaderText: null
  };
  loggedInUser: UserModel;
  public RISParams = {
    branch: [null, ''],
    modality: [null, ''],
    dateFrom: [null, ''],
    dateTo: [null, ''],
    visitID: [null, ''],
    filterBy: [null, ''],
    subSectionIDs: [null, ''],
    TechnicianID: [null, '']
  };
  risParamsForm: FormGroup = this.formBuilder.group(this.RISParams)
  branchList: any = [];
  multiple = true;
  techAudit = true;
  modalityList: any = [];
  buttonControlsPermissions = {
    branch: false,
    modality: false,
    dateFrom: false,
    dateTo: false,
    visitID: false,
    FilterBy: false,
    subsectionids: false
  }
  subSectionList: any = [];
  constructor(
    private formBuilder: FormBuilder,
    private lookupSrv: LookupService,
    private worklistSrv: RisWorklistService,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private sharedService: SharedService
  ) { }

  formHeaderBGClass = "";
  formHeaderText = "";
  screenIdentity = "mo-worklist";
  branchIDs: any = [];
  subSectionIDs = null;
  ngOnInit(): void {

    this.screenIdentity = this.route.routeConfig.path;
    if (this.screenIdentity == 'tech-audit') {
      this.getEmployees();
      this.multiple = false;
      this.techAudit = false;
    }
    const risFilterParams = this.storageService.getObject('risFilterParams');
    if (risFilterParams) {
      this.branchIDs = risFilterParams.branch;
      this.subSectionIDs = risFilterParams.subSectionIDs
    }

    this.risParamsForm.patchValue({
      dateFrom: risFilterParams ? Conversions.getDateObjectByGivenDate(risFilterParams.dateFrom) : Conversions.getCurrentDateObject(),
      dateTo: risFilterParams ? Conversions.getDateObjectByGivenDate(risFilterParams.dateTo) : Conversions.getCurrentDateObject(),
      visitID: risFilterParams ? risFilterParams.visitID : null,
      branch: risFilterParams ? risFilterParams.branch : null,
      subSectionIDs: risFilterParams ? risFilterParams.subSectionIDs : null,
      TechnicianID: risFilterParams ? risFilterParams.TechnicianID : null,

    });
    // console.log("FORM VALUES IN  ONINIT: ",this.risParamsForm.getRawValue())
    this.loadLoggedInUserInfo();
    this.reEvaluateButtonsPermissions();
    // setTimeout(() => {      
    this.reEvaluateDropDowns();
    // }, 2000);
    this.passParams();
    // this.paramsValuesForWorkListHeaderFormate = this.paramsValuesForWorkListHeaderFormate = JSON.parse(JSON.stringify(this.paramsValuesForWorkListHeader));
    const paramObj = JSON.parse(JSON.stringify(this.paramsValuesForWorkListHeader));
    // setTimeout(() => {
    this.formHeaderBGClass = paramObj ? paramObj.formHeaderBGClass : "bg-purple";
    this.formHeaderText = paramObj ? paramObj.formHeaderText : "All";
    // }, 100);

  }

  ngOnChanges(changes: SimpleChanges) {
    const paramObj = this.paramsValuesForWorkListHeader ? JSON.parse(JSON.stringify(this.paramsValuesForWorkListHeader)) : null;
    // setTimeout(() => {
    this.formHeaderBGClass = paramObj ? paramObj.formHeaderBGClass : "bg-purple";
    this.formHeaderText = paramObj ? paramObj.formHeaderText : "All";
    // }, 100);
    const checkDoctorFeedback = this.checkDoctorFeedback;
    // console.log("checkDoctorFeedback:", checkDoctorFeedback);
    this.storageService.setObject('DoctorFeedback', this.checkDoctorFeedback);
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  /**
   * Calls the ngOnInit method, which is needed when the component is reinitialized
   * (e.g. when the user navigates back to the component)
   */
  callInit() {
    this.ngOnInit();
  }
  isValidDateRange = true;
  passParams() {
    // this.searchByVisit();
    const formValues = this.risParamsForm.getRawValue();
    // console.log("FORM VALUES IN PASS PARAMS: ",formValues)
    const visitID = formValues.visitID;
    const branch = formValues.branch;
    if ((!formValues.dateFrom || !formValues.dateTo) && !visitID) {
      this.toastr.error('Please Select Date Range');
      this.isValidDateRange = false;
      return;
    } else {
      this.isValidDateRange = true;
    }
    //date validateion
    this.screenIdentity = this.route.routeConfig.path;

    // Get the form values for dateFrom and dateTo
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isValidDateRange = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = this.screenIdentity === 'tech-audit' && this.checkDoctorFeedback == false ? 7 : 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = maxDaysDifference === 7 ? '1 week' : '1 month';
      this.toastr.error(`The difference between dates should not exceed ${period}`);
      this.isValidDateRange = false;
      return;
    }

    // If everything is valid
    this.isValidDateRange = true;
    //End date validation


    // if(visitID && (!branch ||  !branch.length)){
    //   this.validateBranch=true;
    // }else{
    //   this.validateBranch=false;
    // }
    // if(this.validateBranch){
    //   this.toastr.warning("Please select branch","Warning!");
    //   return;
    // }
    if (visitID) {
      // formValues.branch = Array.prototype.map.call(this.branchList, function (item) { return parseInt(item.LocId); }).join(",").split(",");
      formValues.branch = this.branchList.map(item => parseInt(item.LocId, 10));
    } else {
      formValues.branch = formValues.branch;
    }

    formValues.dateFrom = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    formValues.dateTo = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;
    formValues.AssignemntFilter = 3;
    const filterMap: Record<string, number> = {
      "queue-manager": 12,
      "bulk-queue-manager": 12,
      "mo-worklist": 1,
      "tech-audit": 1,
      "queue-management": 3,
      "assign-bulk-test": 3,
    };
    if (this.screenIdentity === "tech-worklist") {
      formValues.filterBy = formValues.visitID ? -100 : 2;
    } else {
      formValues.filterBy = filterMap[this.screenIdentity] ?? 8;
    }

    // formValues.filterBy =
    //   (this.screenIdentity == "queue-manager" || this.screenIdentity == "bulk-queue-manager") ? 12
    //     : (this.screenIdentity == "mo-worklist" || this.screenIdentity == "tech-audit") ? 1
    //       : (this.screenIdentity == "queue-management" || this.screenIdentity == "assign-bulk-test")
    //         ? 3
    //         : this.screenIdentity == "tech-worklist"
    //           ? (visitID ? -100 : 2)
    //           : 8; //-1 for All except Initial, 1=For MO, 2=Check IN / Check Out , 4 for reporting all, 5 for reporting pending 8 is for Assigned to me.. and bydefaule we gonna show assigned list to dr
    // if(formValues.filterBy==5 && !formValues.subSectionIDs.length){
    //   formValues.subSectionIDs = this.subSectionList.map(item => item.SubSectionId);
    // }else{
    //   formValues.subSectionIDs = formValues.subSectionIDs
    // }
    if (!formValues.subSectionIDs || !formValues.subSectionIDs.length) {
      formValues.subSectionIDsAll = this.subSectionList.map(item => item.SubSectionId);
      // console.log("we are in empty iddsssssssssssssssssssssss: ");
    } else {
      formValues.subSectionIDsAll = formValues.subSectionIDs
      // console.log("we are in filed caseeeee___________")
    }
    if (!formValues.branch || !formValues.branch.length) {
      formValues.branchAll = this.branchList.map(item => item.LocId);
      // console.log("we are in empty BranchBranch iddsssssssssssssssssssssss: ");
    } else {
      formValues.branchAll = formValues.branch;
      // console.log("we are in BranchBranch filed caseeeee___________")
    }
    formValues.RISStatusID = (this.screenIdentity == "mo-worklist" || this.screenIdentity == "queue-management" || this.screenIdentity == "queue-manager" || formValues.visitID) ? null : 2; //null for MO worklist which is registered, 2 for Registered + MO Done
    // formValues.visitID ? formValues.isActive = 7 : this.screenIdentity == "mo-worklist" ? formValues.isActive = 2 : this.screenIdentity == "tech-worklist" ? formValues.isActive = 3 : formValues.isActive = 6;
    formValues.isActive =
      formValues.visitID
        ? 7
        : (this.screenIdentity === "mo-worklist" || this.screenIdentity === "ris-services")
          ? 2
          : this.screenIdentity === "tech-worklist"
            ? 3
            : this.screenIdentity === "reporting-worklist"
              ? 1 // Set isActive to 1 for reporting-worklist and 1 is for assigned to me
              : this.screenIdentity === "reporting-v2"
                ? 4 // Set isActive to 4 for reporting-v2
                : 6;

    formValues.visitID ? formValues.noticeBoardStyle = "bg-purple" : this.screenIdentity == "mo-worklist" ? formValues.noticeBoardStyle = "bg-primary" : this.screenIdentity == "tech-worklist" ? formValues.noticeBoardStyle = "bg-success" : formValues.noticeBoardStyle = "bg-warning";
    // formValues.visitID ? formValues.testSummaryInfoHeader = "All Tests" : this.screenIdentity == "mo-worklist" ? formValues.testSummaryInfoHeader = "Registered Tests" : this.screenIdentity == "tech-worklist" ? formValues.testSummaryInfoHeader = "Checkin Worklist" : formValues.testSummaryInfoHeader = "Queue Management";
    formValues.testSummaryInfoHeader =
      formValues.visitID
        ? "All Tests"
        : this.screenIdentity === "mo-worklist"
          ? "Registered Tests"
          : this.screenIdentity === "tech-worklist"
            ? "Checkin Worklist"
            : this.screenIdentity === "reporting-worklist"
              ? "Pending Tests"
              : "Queue Management";
    // console.log("formValues____________________________: ",formValues);
    this.cd.detectChanges();
    this.risParamsValues.emit(formValues);
    this.cd.detectChanges();
    if (formValues.isActive == 7) {
      this.formHeaderBGClass = "bg-purple";
      this.formHeaderText = "All";
    }
    // this.paramsValuesForWorkListHeaderFormate = JSON.parse(JSON.stringify(this.paramsValuesForWorkListHeader) );
    // console.log("this.paramsValuesForWorkListHeaderFormate____________",this.paramsValuesForWorkListHeaderFormate)
    // this.storageService.setObject('risFilterParams',formValues);
  }
  getFilterByParam() {
    switch (this.screenIdentity) {
      case 'mo-worklist': {
        return 1;
        break;
      }
      case 'tech-worklist': {
        return 2;
        break;
      }
      case 'assign-bulk-test':
      case 'queue-manager':
      case 'bulk-queue-manager':
      case 'queue-management': {
        return 3;
        break;
      }
      case 'reporting-worklist': {
        return 4;
        break;
      }
      default: {
        return 1;
        break;
      }

    }
  }

  getBranches() {
    this.lookupSrv.GetBranches().subscribe((resp: any) => {
      // console.log(resp);
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }
  getAllLocationByUserID() {
    const param = {
      UserID: this.loggedInUser.userid
    }
    this.lookupSrv.getAllLocationByUserID(param).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  getRISModalities() {
    const fromdata = this.risParamsForm.getRawValue();
    const params = {
      BranchID: fromdata.branch
    }
    this.worklistSrv.getRISModalities(params).subscribe((resp: any) => {
      // console.log(resp);
      if (resp.StatusCode == 200) {
        this.modalityList = resp.PayLoad;
      }
    }, (err) => { })
  }

  reEvaluateButtonsPermissions() {
    this.buttonControlsPermissions.branch = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'branch') ? true : false;
    this.buttonControlsPermissions.modality = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'modality') ? true : false;
    this.buttonControlsPermissions.visitID = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'visitid') ? true : false;
    this.buttonControlsPermissions.dateFrom = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'datefrom') ? true : false;
    this.buttonControlsPermissions.dateTo = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'dateto') ? true : false;
    this.buttonControlsPermissions.subsectionids = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'subsectionids') ? true : false;
  }
  reEvaluateDropDowns() {
    if (this.buttonControlsPermissions.branch)
      // this.getBranches();
      this.getAllLocationByUserID();
    if (this.buttonControlsPermissions.modality)
      this.getRISModalities();
    if (this.screenIdentity == 'reporting-worklist' || this.screenIdentity == 'reporting-v2') {
      this.getSubSectionByEmpID()
    } else {
      this.getSubSection();
    }
  }


  onSelectAllBranches() {
    this.risParamsForm.patchValue({
      branch: this.branchList.map(a => a.LocId)
    });
    this.validateBranch = false;
  }
  onUnselectAllBranches() {
    this.risParamsForm.patchValue({
      branch: []
    });
    this.validateBranch = true;
  }

  onSelectAllSections() {
    this.risParamsForm.patchValue({
      subSectionIDs: this.subSectionList.map(a => a.SubSectionId)
    });
    this.validateBranch = false;
  }

  onUnselectAllSections() {
    this.risParamsForm.patchValue({
      subSectionIDs: []
    });
  }

  getSubSection() {
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.lookupSrv.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }
  getSubSectionByEmpID() {
    this.subSectionList = [];
    const objParm = {
      EmpID: this.loggedInUser.empid
    }
    this.lookupSrv.GetSubSectionByEmpID(objParm).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }
  validateBranch = false;
  searchByVisit() {
    const visitID = this.risParamsForm.getRawValue().visitID;
    const branch = this.risParamsForm.getRawValue().branch;
    // let branchField = this.risParamsForm.get('branch');
    if (visitID) {
      this.risParamsForm.patchValue({
        dateFrom: "",
        dateTo: ""
      })

      // branchField.setValidators(Validators.required);
      // branchField.setErrors({ required: true });
      // branchField.markAsDirty();

    } else {
      this.risParamsForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject()
      });
      //  setTimeout(() => {
      //   branchField.setErrors({ required: false });
      //   branchField.clearValidators();
      //   branchField.markAsPristine();
      //  }, 200);

    }

    // if(visitID && (!branch ||  !branch.length)){

    //   this.validateBranch=true;
    // }else{
    //   this.validateBranch=false;
    // }
  }
  checkBranch(e) {
    const visitID = this.risParamsForm.getRawValue().visitID;
    if (!e.length && visitID)
      this.validateBranch = true;
    else
      this.validateBranch = false;

    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="branch"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }
  }

  validateDateDifference(index) {
    return;
    const formValues = this.risParamsForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;

    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      // if(index===1){
      //   this.risParamsForm.patchValue({
      //     dateTo:"" // Conversions.getCurrentDateObject()
      //   });
      // }
      // else{
      //   this.risParamsForm.patchValue({
      //     dateFrom:""// Conversions.getCurrentDateObject(),
      //   });
      // }
    }
    const daysDifference = (toDate - fromDate) / (1000 * 3600 * 24);
    const revertDays = (fromDate - toDate) / (1000 * 3600 * 24);
    if (daysDifference > 30 || revertDays > 30) {
      this.toastr.error('The difference between dates should be 1 month');
      // if(index===1){
      //   this.risParamsForm.patchValue({
      //     dateTo: "" //Conversions.getCurrentDateObject()
      //   });
      // }
      // else{
      //   this.risParamsForm.patchValue({
      //     dateFrom: "" //Conversions.getCurrentDateObject(),
      //   });
      // }
    }
  }

  clearSearchedvalue() {

    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="subSectionIDs"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }

  }

  advancedSearchEnabled = false;
  advancedSearch() {
    this.advancedSearchEnabled = !this.advancedSearchEnabled;
  }
  employeesList = [];
  getEmployees() {
    this.employeesList = [];
    this.sharedService.getData(API_ROUTES.GET_TECHNOLOGISTS, {}).subscribe((res: any) => {
      if (res && res.StatusCode == 200) {
        this.employeesList = res.PayLoad;
        this.employeesList = this.employeesList.map(a => ({ EmpId: a.EmpId, EmpNo: a.EmpNo, EmployeeName: a.EmployeeName, UserId: a.UserId, FullName: '[IDC-' + a.EmpNo.padStart(4, '0') + '] ' + a.EmployeeName }));
      }
    }, (err) => {
      console.log("err")
    })
  }

}
