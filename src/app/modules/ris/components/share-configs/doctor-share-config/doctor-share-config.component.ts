// @ts-nocheck
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { DoctorShareService } from '../../../services/doctor-share.service';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { LabConfigsService } from 'src/app/modules/lab-configs/services/lab-configs.service';
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
  standalone: false,

  selector: 'app-doctor-share-config',
  templateUrl: './doctor-share-config.component.html',
  styleUrls: ['./doctor-share-config.component.scss']
})
export class DoctorShareConfigComponent implements OnInit {

  spinnerRefs = {
    searchTable: 'searchTable',
  }
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  loggedInUser: UserModel;

  public Fields = {
    doctorUserID: [, Validators.required],
    locID: [],
    TPID: [],
    subSectionIDs: [null, ''],
  };

  isSubmitted = false;
  doctorlevelList = [];
  DoctorList = [];
  searchText = '';
  ByLoc = true;
  ByTest = false;
  radoiologistList = [];
  AssignedDataList = [];
  isDissabledChk = false;
  isFieldDisabled = false;
  isChecked: boolean = true;
  searchAssignForm: FormGroup = this.formBuilder.group(this.Fields)


  confirmationPopover = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  confirmationPopoverCopy = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to copy ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  isSpinner = true;
  disabledButton = false;
  hideLoc = true;
  hideTest = true;
  // dataSetList: any = []
  searchValue = '1'; //this.searchValue == '1' this is converted to strint for mat-radio-button, the origional one was searchValue: number = 1; 
  testList = [];
  branchList = [];
  mainChk
  isValues
  radiologistLevel: any = []
  isLargeScreen: boolean = false;
  subSectionList: any = [];
  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private doctorShare: DoctorShareService,
    private questionnaireSrv: QuestionnaireService,
    private appPopupService: AppPopupService,
    private LabConfService: LabConfigsService

  ) {
    this.checkScreenSize();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }
  checkScreenSize() {
    const width = window.innerWidth;
    this.isLargeScreen = width >= 992; // Bootstrap lg size (992px) or greater
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRadiologistInfoDetail();
    this.getLocationList();
    this.getTestProfileList();
    this.getSubSection();
    this.updateValidators();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  onSelectAllSections() {
    this.searchAssignForm.patchValue({
      subSectionIDs: this.subSectionList.map(a => a.SubSectionId)
    });
    // this.validateBranch = false;
  }

  onUnselectAllSections() {
    this.searchAssignForm.patchValue({
      subSectionIDs: []
    });
  }
  SubSectionIDs = null;
  clearSearchedvalue(e) {
    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="subSectionIDs"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }
    if (e && e.length) {
      this.SubSectionIDs = e.map(item => item.SubSectionId).join(', ');
      if (this.ByTest) {
        this.getTestProfileList();
      }
    } else {
      this.SubSectionIDs = null;
      if (this.ByTest) {
        this.getTestProfileList();
      }

    }
  }
  getSubSection() {
    this.subSectionList = [];
    let objParm = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      let _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }

  updateDoctorShare(): void {
    try {
      this.isSubmitted = true;
      const formValues = this.searchAssignForm.getRawValue();

      /** Validate Form */
      if (this.searchAssignForm.invalid) {
        this.toastr.warning("Please fill the mandatory fields");
        return;
      }

      /** Get only checked items */
      const checkedItems = this.dataSetList?.filter(item => item?.checked) || [];

      if (!checkedItems.length) {
        this.toastr.warning("Please select item(s) to update");
        return;
      }

      /** Validate checked rows share values */
      const missingValues = checkedItems.some(item =>
        item?.InitialShare == null ||
        item?.InitialSharePerc == null ||
        item?.DSShare == null ||
        item?.DSSharePerc == null
      );

      if (missingValues) {
        this.toastr.warning("Please select values against checked Items");
        this.isValues = true;
        return;
      }

      /** Prepare Request Payload */
      const payload = {
        CreatedBy: this.loggedInUser?.userid ?? -99,
        DoctorUserID: this.EmpUserID ?? null,
        DoctorEmpID: this.EmpID ?? null,
        tblRISDoctorLocationTPShare: checkedItems.map(item => ({
          RISDoctorLocationTPShareID: item.RISDoctorLocationTPShareID ?? null,
          DoctorUserID: this.EmpUserID ?? null,
          DoctorEmpID: this.EmpID ?? null,
          LocID: item.LocID ?? formValues.locID ?? null,
          TPID: item.TPID ?? formValues.TPID ?? null,
          MINInitial: item.MINInitial ?? null,
          MAXInitial: item.MAXInitial ?? null,
          InitialShare: item.InitialShare ?? 0,
          InitialSharePerc: item.InitialSharePerc ?? 0,
          QuotaInitial: null,
          MINDS: item.MINDS ?? null,
          MAXDS: item.MAXDS ?? null,
          DSShare: item.DSShare ?? 0,
          DSSharePerc: item.DSSharePerc ?? 0,
          QuotaDS: null,
          MINReset: item.MINReset ?? null,
          MAXReset: item.MAXReset ?? null,
          ResetShare: item.ResetShare ?? 0,
          ResetSharePerc: item.ResetSharePerc ?? 0,
          QuotaReset: null
        }))
      };

      /** API call with spinner protection */
      this.spinner.show(this.spinnerRefs.searchTable);
      this.disabledButton = true;
      this.isSpinner = false;

      this.doctorShare.insertUpdateRISDoctorLocationTPShare(payload).subscribe({
        next: (res: any) => {
          this.disabledButton = false;
          this.isSpinner = true;
          this.spinner.hide(this.spinnerRefs.searchTable);

          const response = { ...res, PayLoadStr: JSON.parse(res.PayLoadStr) };

          if (response.StatusCode === 200 && response.PayLoadStr[0]?.Result === 1) {
            this.toastr.success(response.Message);
            this.searchDataAssign();
          } else {
            this.toastr.warning(response.Message || 'Failed to update');
          }
        },
        error: () => {
          this.spinner.hide(this.spinnerRefs.searchTable);
          this.disabledButton = false;
          this.isSpinner = true;
          this.toastr.error('Connection error');
        }
      });

    } catch (error) {
      /** Catch unexpected runtime errors too */
      console.error("Update Error:", error);
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.disabledButton = false;
      this.isSpinner = true;
      this.toastr.error('Unexpected error occurred');
    }
  }

  EmpID = null
  EmpUserID = null
  getEmployeeUserID(item) {
    this.EmpID = item?.EmpId || null
    this.EmpUserID = item?.UserId || null
  }
  getRadiologistInfoDetail() {
    let params = {
      EmpID: null
    };
    this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.radoiologistList = res.PayLoadDS['Table'] || [];

        this.radoiologistList = this.radoiologistList.map(item => ({
          ...item,
          displayLabel: `${item.EmpNoWithPrefix} - ${item.FullName}`
        }));
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }
  customSearch(term: string, item: any) {
    term = term.toLowerCase();
    return (
      (item.FullName && item.FullName.toLowerCase().includes(term)) ||
      (item.EmpNoWithPrefix && item.EmpNoWithPrefix.toLowerCase().includes(term))
    );
  }
  selectAllItems(checked: boolean) {
    this.filteredDataSetList.forEach(item => {
      item.checked = checked;
    });
    this.countSelectedCheckboxes();
  }
  onSelectedDoctor(e) {
    const checked: boolean = e.checked
    if (checked == true) {
      this.isValues = false
    }
    this.countSelectedCheckboxes();
  }

  selectedCheckboxesCount = 0;
  countSelectedCheckboxes() {
    const selectedCount = this.dataSetList.filter(item => item.checked).length;
    this.selectedCheckboxesCount = selectedCount;
  }


  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.branchList = data || [];
        this.branchList = this.branchList.sort((a, b) => {
          if (a.Code > b.Code) {
            return 1;
          } else if (a.Code < b.Code) {
            return -1;
          } else {
            return 0;
          }
        });

      }
    }, (err) => {
      console.log(err);
    });
  }


  getTestProfileList() {
    this.testList = [];
    let _param = {
      BranchID: 1,
      isRadiologyTests: 1,
      SubSectionIDs: this.SubSectionIDs
    };
    this.doctorShare.getTestPrfoileRadiologistTests(_param).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.testList = data || [];
      }
    },
      (err) => {
        console.log(err);

      }
    );
  }
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
  validateDecimalNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    const charStr = String.fromCharCode(charCode);
    const inputValue = e.target.value;

    // Allow control keys (like backspace, delete, arrow keys, etc.)
    if (charCode <= 31) {
      return true;
    }

    // Allow only digits and one decimal point
    if ((charCode >= 48 && charCode <= 57) || (charStr === '.' && !inputValue.includes('.'))) {
      return true;
    }

    // Prevent any other characters
    return false;
  }

  setIsLocTest(Val) {
    this.searchValue = Val
    if (Val == 1) {
      this.ByLoc = true;
      this.ByTest = false;
    }
    if (Val == 0) {
      this.ByLoc = false;
      this.ByTest = true;
      this.isChecked = false;
    }
  }

  onChange(event: any) {
    this.searchValue = event
    if (event && event == 1) {
      this.ByLoc = true;
      this.ByTest = false;
      this.searchAssignForm.get('TPID')?.setValue(null);
      this.RegTestProfilePrice = 0;
    }
    if (event && event == 0) {
      this.ByLoc = false;
      this.ByTest = true;
      this.isChecked = false;
      this.searchAssignForm.get('locID')?.setValue(null);
    }
    this.updateValidators();
  }


  clearDataSet() {
    this.dataSetList = [];
    this.filteredDataSetList = [];
  }

  BranchId = false;
  dataSetList: any[] = [];
  filteredDataSetList: any[] = [];
  hasExistingConfig = false;
  updateFilteredList() {
    try {
      const keyword = this.searchText?.toLowerCase() || '';

      this.filteredDataSetList = this.dataSetList?.filter(item => {
        return (
          // When test view is active
          (this.hideTest && (
            (item.ShortTitle?.toLowerCase().includes(keyword)) ||
            (item.TestProfileCode?.toLowerCase().includes(keyword)) ||
            (item.Code?.toLowerCase().includes(keyword))
          )) ||

          // When location view is active
          (this.hideLoc && (
            (item.Code?.toLowerCase().includes(keyword)) ||
            (item.Title?.toLowerCase().includes(keyword))
          ))
        );
      }) || [];

      // Check if any existing config is already saved
      this.hasExistingConfig = this.filteredDataSetList.some(
        x => x?.RISDoctorLocationTPShareID != null && x.RISDoctorLocationTPShareID !== ''
      );

      this.applyInitPerc = false;
      this.applyDSPerc = false;
      this.initHeaderPerc = null;
      this.dsHeaderPerc  = null;

    } catch (error) {
      console.error("Error in updateFilteredList():", error);
      this.filteredDataSetList = [];
      this.hasExistingConfig = false;
    }
  }



  RegTestProfilePrice = 0;
  onTestChange(param) {
    this.RegTestProfilePrice = param ? param.RegTestProfilePrice : 0;
  }
  calculateInitPercentageSecondFinal(data: any, field: string) {
    // Ensure InitialShare and TestProfilePrice are numbers and not null or undefined
    const initialShare = data.InitialShare ? Number(data.InitialShare) : 0;
    const testProfilePrice = data.TestProfilePrice ? Number(data.TestProfilePrice) : 0;
    const initialSharePerc = data.InitialSharePerc ? Number(data.InitialSharePerc) : 0;

    if (field === 'Share') {
      // If the InitialShare field is changed, update InitialSharePerc
      if (testProfilePrice !== 0) {
        data.InitialSharePerc = ((initialShare / testProfilePrice) * 100).toFixed(2);
      } else {
        data.InitialSharePerc = 0; // Avoid division by zero
      }
    } else if (field === 'SharePerc') {
      // If the InitialSharePerc field is changed, update InitialShare
      // data.InitialShare = ((initialSharePerc * testProfilePrice) / 100).toFixed(2);
      data.InitialShare = Math.round((initialSharePerc * testProfilePrice) / 100);
    }
  }

  ////////////////////Calculations//////////////////////////
  calculatePercentage(data: any, field: string, type: string) {
    const testProfilePrice = data.TestProfilePrice ? Number(data.TestProfilePrice) : 0;

    const getValue = (v: any) => v ? Number(v) : 0;

    // Helper: return true only if user entered a non-zero value
    const isNonZero = (v: any) => v !== null && v !== undefined && v !== '' && Number(v) !== 0;

    // ************* PERCENTAGE > 100 VALIDATION *************
    const validatePercentageLimit = (value: any, fieldName: string) => {
      if (Number(value) > 100) {
        data[fieldName] = 0;
        this.toastr.error("Percentage amount should not be greater than 100");
        return false;
      }
      return true;
    };
    // ********************************************************

    // ************* FIX AMOUNT > PRICE VALIDATION *************
    const validateShareLimit = (value: any, fieldName: string) => {
      if (Number(value) > testProfilePrice) {
        data[fieldName] = 0;
        this.toastr.error("The fixed amount should not be greater than the test price");
        return false;
      }
      return true;
    };
    // ********************************************************

    // ========= INIT =========
    if (type === 'Init') {

      // Validate % limit
      if (field === 'SharePerc' && !validatePercentageLimit(data.InitialSharePerc, "InitialSharePerc"))
        return;

      // Validate fixed amount limit
      if (field === 'Share' && !validateShareLimit(data.InitialShare, "InitialShare"))
        return;

      if (field === 'Share') {
        if (!isNonZero(data.InitialShare)) return;
        data.InitialSharePerc = 0;
      }

      else if (field === 'SharePerc') {
        if (!isNonZero(data.InitialSharePerc)) return;
        data.InitialShare = 0;
      }
    }

    // ========= DS =========
    if (type === 'DS') {

      // Validate % limit
      if (field === 'SharePerc' && !validatePercentageLimit(data.DSSharePerc, "DSSharePerc"))
        return;

      // Validate fixed amount limit
      if (field === 'Share' && !validateShareLimit(data.DSShare, "DSShare"))
        return;

      if (field === 'Share') {
        if (!isNonZero(data.DSShare)) return;
        data.DSSharePerc = 0;
      }

      else if (field === 'SharePerc') {
        if (!isNonZero(data.DSSharePerc)) return;
        data.DSShare = 0;
      }
    }

    // ========= RESET =========
    if (type === 'Reset') {

      // Validate % limit
      if (field === 'SharePerc' && !validatePercentageLimit(data.ResetSharePerc, "ResetSharePerc"))
        return;

      // Validate fixed amount limit
      if (field === 'Share' && !validateShareLimit(data.ResetShare, "ResetShare"))
        return;

      if (field === 'Share') {
        if (!isNonZero(data.ResetShare)) return;
        data.ResetSharePerc = 0;
      }

      else if (field === 'SharePerc') {
        if (!isNonZero(data.ResetSharePerc)) return;
        data.ResetShare = 0;
      }
    }
  }

  btnSearchClicked = false;
  noDataMessage = "Please search the data for share configuration";
  searchDataAssign(): void {
    try {
      this.btnSearchClicked = true;

      /** Validate form before search */
      if (this.searchAssignForm.invalid) {
        this.toastr.warning("Please fill the required search fields");
        this.searchAssignForm.markAllAsTouched();
        return;
      }

      /** Validate dropdown value */
      if (this.searchValue !== '0' && this.searchValue !== '1') {
        this.toastr.error("Invalid search type");
        return;
      }

      /** Call respective API */
      if (this.searchValue === '1') {
        this.getRISDoctorLocationTPShare();
      } else {
        this.getRISDoctorLocationTPShareForLoc();
      }

    } catch (error) {
      /** Fallback error handler */
      console.error("searchDataAssign() error:", error);
      this.toastr.error("Something went wrong while searching");
    }
  }

  dataSetListExisting = [];
  clickSubmit = false;
  getRISDoctorLocationTPShare() {
    this.clickSubmit = true;
    this.dataSetList = [];
    this.updateFilteredList();
    this.hideLoc = false;
    this.hideTest = true;
    let formValues = this.searchAssignForm.getRawValue();
    console.log("formValues", formValues);
    if (this.EmpUserID == '' || this.EmpUserID == null || this.EmpUserID == undefined) {
      this.toastr.error('Please select the doctor', 'Doctor not selected');
      return
    }
    if (formValues.locID == '' || formValues.locID == null || formValues.locID == undefined && this.ByLoc) {
      this.toastr.error('Please select the branch', 'Branch not selected');
      return
    }
    if (this.ByTest) {
      this.toastr.error('Please select the test', 'Test not selected');
      return
    }
    let objParams = {
      TPID: formValues.TPID || null,
      DoctorUserID: this.EmpUserID || null,
      LocID: formValues.locID || null,
      SubSectionIDs: (formValues.subSectionIDs && formValues.subSectionIDs.length) ? formValues.subSectionIDs.join(', ') : null
    };
    this.disabledButtonSearch = true;
    this.isSpinnerSearch = false;
    this.spinner.show(this.spinnerRefs.searchTable);
    this.doctorShare.getRISDoctorLocationTPShare(objParams).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.disabledButtonSearch = false;
      this.isSpinnerSearch = true;
      if (res.StatusCode == 200 && res.PayLoad.length) {
        // this.dataSetListExisting = res.PayLoad;
        this.dataSetList = res.PayLoad;
        this.updateFilteredList();
        // console.log("dataSetListExisting", this.dataSetListExisting);
      }
      else {
        // this.toastr.error('Something Went Wrong');
        this.dataSetListExisting = [];
      }
    }, (err) => {
      this.disabledButtonSearch = false;
      this.isSpinnerSearch = true;
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.searchTable);
    })
  }
  getRISDoctorLocationTPShareForLoc() {
    this.clickSubmit = true;
    this.dataSetList = [];
    this.updateFilteredList();
    this.hideLoc = true;
    this.hideTest = false;
    let formValues = this.searchAssignForm.getRawValue();
    let objParams = {
      TPID: formValues.TPID || null,
      DoctorUserID: this.EmpUserID || null,
      LocID: formValues.locID || null,
      SubSectionIDs: (formValues.subSectionIDs && formValues.subSectionIDs.length) ? formValues.subSectionIDs.join(', ') : null,
    };
    this.disabledButtonSearch = true;
    this.isSpinnerSearch = false;
    this.spinner.show(this.spinnerRefs.searchTable);
    this.doctorShare.getRISDoctorLocationTPShareForLoc(objParams).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.disabledButtonSearch = false;
      this.isSpinnerSearch = true;
      if (res.StatusCode == 200 && res.PayLoad.length) {
        // this.dataSetListExisting = res.PayLoad;
        this.dataSetList = res.PayLoad;
        this.updateFilteredList();
        // console.log("dataSetListExisting", this.dataSetListExisting);
      }
      else {
        // this.toastr.error('Something Went Wrong');
        this.dataSetListExisting = [];
      }
    }, (err) => {
      this.disabledButtonSearch = false;
      this.isSpinnerSearch = true;
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.searchTable);
    })
  }



  @ViewChild("showbranchSelectionModal") showbranchSelectionModal;
  @ViewChild('tableContainer') tableContainer!: ElementRef;
  showScrollTop = false;


  showScrollTopBtn = false;

  ngAfterViewInit() {
    if (this.tableContainer) {
      const container = this.tableContainer.nativeElement;
      container.addEventListener('scroll', () => {
        this.showScrollTop = container.scrollTop > 200; // shows button after scroll down
      });
    }
  }
  scrollTableToTop() {
    if (this.tableContainer) {
      this.tableContainer.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
  sourceBranchId = null;
  branchPopupRef: NgbModalRef;
  isBranchSubmitted = false;
  isRadiologistSubmitted = false;
  distaniationBranchesList = [];
  distaniationRadiologistList = [];
  showBranchSelectionModal() {
    let formValues = this.searchAssignForm.getRawValue();
    const locId = formValues.locID
    const RadiologistUserId = formValues.doctorUserID
    // if (!locId) {
    //   this.toastr.warning("Please select branch first");
    //   this.isBranchSubmitted = true;
    //   return;
    // } else {
    //   this.distaniationBranchesList = this.branchList.filter((b) => b.LocId !== locId);
    // }
    this.clearChoiceSelection();
    this.stopCopyLoading();
    if (!locId) {
      this.toastr.warning("Please select branch first");
      this.isBranchSubmitted = true;
      return;
    }

    if (!RadiologistUserId) {
      this.toastr.warning("Please select Doctor/Radiologist first");
      this.clickSubmit = true;
      return;
    }

    this.distaniationBranchesList = this.branchList.filter(b => b.LocId !== locId);
    this.distaniationRadiologistList = this.radoiologistList.filter(b => b.EmpId !== RadiologistUserId);
    console.log("🚀  this.distaniationRadiologistList:",  this.distaniationRadiologistList)

    this.sourceBranchId = null;
    this.radiologistIds = null;
    setTimeout(() => {
      this.branchPopupRef = this.appPopupService.openModal(
        this.showbranchSelectionModal,
        {
          backdrop: "static",
          size: "lg",
        }
      );
    }, 200);
  }

 //#region START:RIS Configs Copy
  isSpinnerCopy = true;
  isSpinnerSearch = true;
  disabledButtonCopy = false
  disabledButtonSearch = false

  ValueOfCopyRadio = '1'; 
  ByRadiologist = true;
  ByLocation = false;
  ChangeofValueAtCopyRadio(event) {
    this.ValueOfCopyRadio = event;
     if (event && event == 1) {
      this.ByRadiologist = true;
      this.ByLocation = false;
      this.radiologistIds = [];
    }
    if (event && event == 2) {
       this.ByRadiologist = false;
      this.ByLocation = true;
      this.isChecked = false;
      this.branchIds = [];
    }
  }

  copyDataToSelectedBranchOrRadiologist(){
    if(this.ByRadiologist){
      this.copyDataToSelectedRadiologists();
    }
    if(this.ByLocation){
      this.copyDataToSelectedBranch();
    }
  }

  copyDataToSelectedBranch() {
    this.isBranchSubmitted = true;
    let formValues = this.searchAssignForm.getRawValue()
    if (!this.branchIds.length) {
      this.toastr.warning("Please select branch first");
      return;
    }
    const objParam = {
      FromLocID: formValues.locID,
      ToLocIDs: this.branchIds.join(","),
      DoctorUserID: this.EmpUserID,
      CreatedBy: this.loggedInUser.userid || -99,
    };
    this.isSpinnerCopy = false;
    this.disabledButtonCopy = true;
    this.startCopyLoading(); 
    this.LabConfService.transferRISTPDoctorShareLocToLocs(objParam).subscribe(
      (data: any) => {
       this.stopCopyLoading();
        let result = JSON.parse(data.PayLoadStr)
        if (data.StatusCode === 200 && result[0].Result === 1) {
          this.branchPopupRef.close();
          this.toastr.success("Configuration applied successfully to all selected branches.");
        } else {
          this.toastr.error(data.Message);
        }
      },
      (err) => {
        console.error(err);
         this.stopCopyLoading();
        // this.spinner.hide(this.spinnerRefs.paramsListSection);
        this.toastr.error("Connection error");
      }
    );
  }

  clearChoiceSelection() {
    this.branchIds = [];
    this.radiologistIds = [];
    this.ValueOfCopyRadio = '1';
    this.ByRadiologist = true;
    this.ByLocation = false;
    this.isBranchSubmitted = false;
    this.isRadiologistSubmitted = false;
  }
  copyDataToSelectedRadiologists() {
    this.isRadiologistSubmitted = true;
    let formValues = this.searchAssignForm.getRawValue()
    if (!this.radiologistIds?.length) {
      this.toastr.warning("Please select radiologist first");
      return;
    }
    const objParam = {
      FromDoctor: formValues.doctorUserID,
      ToDoctorIds: this.radiologistIds.join(","),
      CreatedBy: this.loggedInUser.userid || -99,
    };
    this.isSpinnerCopy = false;
    this.disabledButtonCopy = true;
     this.startCopyLoading();    
    this.LabConfService.TransferRISShareDocToDocs(objParam).subscribe(
      (data: any) => {
        this.stopCopyLoading();
        let result = data.PayLoad
        if (data.StatusCode === 200 && result[0].Result === 1) {
          this.branchPopupRef.close();
          this.toastr.success("Configuration applied successfully to all selected radiologists.");
        } else {
          this.toastr.error(data.Message);
        }
      },
      (err) => {
        console.error(err);
       this.stopCopyLoading();
        // this.spinner.hide(this.spinnerRefs.paramsListSection);
        this.toastr.error("Connection error");
      }
    );
  }

startCopyLoading() {
  this.isSpinnerCopy = false;
  this.disabledButtonCopy = true;
}

stopCopyLoading() {
  this.isSpinnerCopy = true;
  this.disabledButtonCopy = false;
}

  validateBranch = false;
  branchIds = [];
  radiologistIds = [];
  onSelectAllBranches() {
    this.branchIds = this.distaniationBranchesList.map(a => a.LocId)
    this.validateBranch = false;
  }
  onUnselectAllBranches() {

    this.branchIds = []
    this.validateBranch = true;
  }

   onSelectAllRadiologist() {
    this.radiologistIds = this.radoiologistList.map(a => a.EmpId) //EmpId
    // this.validateBranch = false;
  }
  onUnselectAllRadiologist() {
    this.radiologistIds = []
    // this.validateBranch = true;
  }

//#region END:RIS Configs Copy
  updateValidators() {
    const locCtrl = this.searchAssignForm.get('locID');
    const tpidCtrl = this.searchAssignForm.get('TPID');

    if (this.ByLoc) {
      // locID required, TPID optional
      locCtrl?.setValidators([Validators.required]);
      tpidCtrl?.clearValidators();
    }

    if (this.ByTest) {
      // TPID required, locID optional
      tpidCtrl?.setValidators([Validators.required]);
      locCtrl?.clearValidators();
    }

    // Update form validation status
    locCtrl?.updateValueAndValidity();
    tpidCtrl?.updateValueAndValidity();
  }

  applyInitPerc = false;
  applyDSPerc = false;

  initHeaderPerc: number | null = null;
  dsHeaderPerc: number | null = null;
  applyPercentage(type: 'Init' | 'DS') {

    // 1 Check: at least one row selected
    const hasCheckedRow = this.filteredDataSetList.some(item => item.checked);

    if (!hasCheckedRow) {
      this.toastr.info(
        'Please select at least one row to apply percentage.',
        'No Row Selected'
      );
      return;
    }

    // Determine header value & label
    const percentageValue =
      type === 'Init' ? this.initHeaderPerc : this.dsHeaderPerc;

    const columnLabel =
      type === 'Init' ? 'Initial' : 'DS';

    // 2 Check: textbox empty / invalid
    if (percentageValue == null || isNaN(percentageValue)) {
      this.toastr.warning(
        `Please enter ${columnLabel} percentage to apply.`,
        'Percentage Required'
      );
      return;
    }

    // 3 Check: percentage > 100
    if (percentageValue > 100) {
      this.toastr.warning(
        `${columnLabel} percentage cannot be greater than 100.`,
        'Invalid Percentage'
      );
      return;
    }

    // Apply percentage (0 is allowed)
    this.filteredDataSetList.forEach(item => {
      if (item.checked) {
        if (type === 'Init') {
          item.InitialSharePerc = percentageValue;
          this.calculatePercentage(item, 'SharePerc', 'Init');
        } else {
          item.DSSharePerc = percentageValue;
          this.calculatePercentage(item, 'SharePerc', 'DS');
        }
      }
    });

    
    // Success toaster
    // this.toastr.success(
    //   `${columnLabel} percentage applied successfully.`,
    //   'Success'
    // );
  }


}
