// @ts-nocheck
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { DoctorShareService } from '../../../services/doctor-share.service';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { LabConfigsService } from 'src/app/modules/lab-configs/services/lab-configs.service';
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
  standalone: false,

  selector: 'app-assign-share',
  templateUrl: './assign-share.component.html',
  styleUrls: ['./assign-share.component.scss']
})

export class ShareAssignComponent implements OnInit {

  spinnerRefs = {
    searchTable: 'searchTable',
  }
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  loggedInUser: UserModel;

  public Fields = {
    radlevel: [, Validators.required],
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
  isSpinner = true;
  disabledButton = false;
  hideLoc = true;
  hideTest = true;
  dataSetList: any = []
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
    private testProfileService: TestProfileService,
    private appPopupService: AppPopupService,
    private LabConfService : LabConfigsService

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
    this.getLevelList();
    this.getLocationList();
    this.getTestProfileList();
    this.getSubSection();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getLevelList() {
    this.doctorlevelList = [];

    this.doctorShare.getDoctorLevel({}).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.doctorlevelList = res.PayLoad;
      }
      else {
        this.doctorlevelList = [];
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
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

  updateDoctorShare() {
    let formValues = this.searchAssignForm.getRawValue();
    if (this.searchAssignForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    };
    let checkedItems = this.dataSetList.filter(a => a.checked);
    // console.log("🚀 checkedItems:", checkedItems)
    if (!checkedItems.length) {
      this.toastr.warning("Please select item(s) to update");
      return;
    }
    if (checkedItems.some(a =>
      a.MINInitial == null || a.MAXInitial == null ||
      a.InitialShare == null || a.InitialSharePerc == null ||
      a.MINDS == null || a.MAXDS == null ||
      a.DSShare == null || a.DSSharePerc == null
      // || a.MINReset == null || a.MAXReset == null || a.ResetShare == null || a.ResetSharePerc == null
    )) {
      this.toastr.warning("Please select values against checked Items");
      this.isValues = true;
      return;
    }

    let objParams = {
      CreatedBy: this.loggedInUser.userid || -99,
      LevelID: formValues.radlevel || null,
      tblRISLevelLocationTPShare: checkedItems.map(a => {
        return {
          RISLevelLocationTPShareID: a.RISLevelLocationTPShareID || null,
          LevelID: formValues.radlevel || null,
          LocID: a.LocID || formValues.locID || null,
          TPID: a.TPId || formValues.TPID || null,
          MINInitial: a.MINInitial || null,
          MAXInitial: a.MAXInitial || null,
          InitialShare: a.InitialShare || null,
          InitialSharePerc: a.InitialSharePerc || null,
          QuotaInitial: null,
          MINDS: a.MINDS || null,
          MAXDS: a.MAXDS || null,
          DSShare: a.DSShare || null,
          DSSharePerc: a.DSSharePerc || null,
          QuotaDS: null,
          MINReset: a.MINReset || null,
          MAXReset: a.MAXReset || null,
          ResetShare: a.ResetShare || null,
          ResetSharePerc: a.ResetSharePerc || null,
          QuotaReset: null,
        }
      }),
    };
    // console.log("🚀 ~ ShareAssignComponent ~ updateDoctorLevel ~ objParams:", objParams);// return;
    this.spinner.show(this.spinnerRefs.searchTable);
    this.disabledButton = true;
    this.isSpinner = false;
    this.doctorShare.InsertUpdateRISLevelLocationTPShare(objParams).subscribe((res: any) => {
      this.disabledButton = false;
      this.isSpinner = true;
      setTimeout(() => { this.spinner.hide(this.spinnerRefs.searchTable); }, 200);
      res.PayLoadStr = JSON.parse(res.PayLoadStr);
      if (res.StatusCode == 200) {
        if (res.PayLoadStr[0].Result == 1) {
          this.toastr.success('Doctors Share Updated Successfully!');
        }
        else {
          this.toastr.warning('Failed to update')
        }
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.disabledButton = false;
      this.isSpinner = true;
      this.toastr.error('Connection error');
    })
  }

  getRadiologistInfoDetail() {
    let params = {
      EmpID: null
    };
    this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.radoiologistList = res.PayLoadDS['Table'] || [];
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



  selectAllItems(checked) {
    this.dataSetList.forEach(sec => {
      sec.checked = checked;
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
    }
    if (event && event == 0) {
      this.ByLoc = false;
      this.ByTest = true;
      this.isChecked = false;
      this.searchAssignForm.get('locID')?.setValue(null);
    }
  }


  clearDataSet() {
    this.dataSetList = [];
  }

  getAllLocationByTPID() {
    this.hideTest = false;
    this.hideLoc = true;
    this.dataSetList = [];
    // if (!event) {
    //   this.dataSetList = [];
    //   return
    // }
    if (this.searchAssignForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    };
    let formValues = this.searchAssignForm.getRawValue();
    if (!formValues.TPID) {
      this.toastr.warning("Please select any test", "Validation error");
      return;
    }
    // let selectedTPID = event.TPId;
    let objParams = {
      TPID: formValues.TPID || null,
      // LevelID: formValues.radlevel || null,
      SubSectionIDs: (formValues.subSectionIDs && formValues.subSectionIDs.length) ? formValues.subSectionIDs.join(', ') : null
    };
    this.spinner.show(this.spinnerRefs.searchTable);
    this.doctorShare.getAllLocationByTPID(objParams).subscribe((res: any) => {
      setTimeout(() => { this.spinner.hide(this.spinnerRefs.searchTable); }, 100);
      if (res.StatusCode == 200 && res.PayLoad.length) {
        let locData = res.PayLoad;
        this.dataSetList = this.mergeLocDataSets(locData, this.dataSetListExisting);
      }
      else {
        this.dataSetList = [];
        this.noDataMessage = "No record found";
      }
    }, (err) => {
      console.log(err);
      this.noDataMessage = "No record found";
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.toastr.error('Connection error');
    })
  }


  getTestPrfoile_() {
    this.hideLoc = false;
    this.hideTest = true;
    this.dataSetList = [];
    // if (!event) {
    //   this.dataSetList = [];
    //   return
    // }
    // let selectedBranchID = event.LocId;
    if (this.searchAssignForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    };
    let formValues = this.searchAssignForm.getRawValue();
    let objParams = {
      BranchID: formValues.locID || null,
      isRadiologyTests: 1,   //1 for Radiology 0 for Lab
      // LevelID: formValues.radlevel || null,

    };
    this.spinner.show(this.spinnerRefs.searchTable);
    this.doctorShare.getTestPrfoileRadiologistTests(objParams).subscribe((res: any) => {
      setTimeout(() => { this.spinner.hide(this.spinnerRefs.searchTable); }, 100);
      if (res.StatusCode == 200) {
        if (res.PayLoad.length) {
          this.dataSetList = res.PayLoad;
          this.dataSetList = this.mergeDataSets(this.dataSetListExisting, this.dataSetList);
        }
        else {
          this.toastr.info('No Record Found');
          this.dataSetList = [];
        }
      }
      else {
        this.toastr.error('Something Went Wrong');
        this.dataSetList = [];
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.toastr.error('Connection error');
    })
  }
  BranchId = false;
  getTestPrfoile() {
    this.hideLoc = false;
    this.hideTest = true;
    this.dataSetList = [];
    if (this.searchAssignForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    };
    let formValues = this.searchAssignForm.getRawValue();
    if (!formValues.locID) {
      this.toastr.warning("Please select any branch", "Validation error");
      return;
    }else{
      this.BranchId = true;
    }
    let objParams = {
      BranchID: formValues.locID || null,
      isRadiologyTests: 1,   // 1 for Radiology 0 for Lab
      LevelID: formValues.radlevel || null,
      SubSectionIDs: (formValues.subSectionIDs && formValues.subSectionIDs.length) ? formValues.subSectionIDs.join(', ') : null
    };

    this.spinner.show(this.spinnerRefs.searchTable);
    this.doctorShare.getTestPrfoileRadiologistTests(objParams).subscribe((res: any) => {
      setTimeout(() => { this.spinner.hide(this.spinnerRefs.searchTable); }, 100);

      if (res.StatusCode == 200) {
        if (res.PayLoad.length) {
          let testData = res.PayLoad;
          // Merge dataSetListExisting into dataSetList
          this.dataSetList = this.mergeDataSets(testData, this.dataSetListExisting);
        } else {
          this.toastr.info('No Record Found');
          this.dataSetList = [];
          this.noDataMessage = "No record found";
        }
      } else {
        this.toastr.error('Something Went Wrong');
        this.noDataMessage = "No record found";
        this.dataSetList = [];
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.toastr.error('Connection error');
    });
  }
  RegTestProfilePrice = 0;
  onTestChange(param) {
    this.RegTestProfilePrice = param ? param.RegTestProfilePrice : 0;
  }

  mergeDataSets(mainData: any[], existingData: any[]) {
    let formValues = this.searchAssignForm.getRawValue();
    // Iterate over each item in the main data array
    mainData.forEach(mainItem => {
      // Find the corresponding item in the existing data array based on TPId and LevelID
      const matchedItem = existingData.find(exItem => exItem.TPID === mainItem.TPId && exItem.LevelID === formValues.radlevel);
      // console.log("matched data in merge function: ",matchedItem)

      // If a match is found, append or update the fields from the matched item to the main item
      if (matchedItem) {
        for (let key in matchedItem) {
          // Skip TPID and LevelID to avoid overwriting the main item keys
          if (key !== 'TPID' && key !== 'LevelID') {
            mainItem[key] = matchedItem[key];
          }
        }
      }
    });

    // Return the updated mainData array
    return mainData;
  }
  mergeLocDataSets(mainData: any[], existingData: any[]) {
    let formValues = this.searchAssignForm.getRawValue();
    // Iterate over each item in the main data array
    mainData.forEach(mainItem => {
      // Find the corresponding item in the existing data array based on TPId and LevelID
      const matchedItem = existingData.find(exItem => exItem.LocID === mainItem.LocID && exItem.LevelID === formValues.radlevel);

      // If a match is found, append or update the fields from the matched item to the main item
      if (matchedItem) {
        for (let key in matchedItem) {
          // Skip TPID and LevelID to avoid overwriting the main item keys
          if (key !== 'LocID' && key !== 'LevelID') {
            mainItem[key] = matchedItem[key];
          }
        }
      }
    });

    // Return the updated mainData array
    return mainData;
  }

  calculateInitPercentage_(data: any) {
    // Ensure InitialShare and TestProfilePrice are numbers and not null or undefined
    const initialShare = data.InitialShare ? Number(data.InitialShare) : 0;
    const testProfilePrice = data.TestProfilePrice ? Number(data.TestProfilePrice) : 0;

    // Calculate the percentage
    if (testProfilePrice !== 0) {
      data.InitialSharePerc = ((initialShare / testProfilePrice) * 100).toFixed(2);
    } else {
      data.InitialSharePerc = 0; // Avoid division by zero
    }
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
  calculateInitPercentage___(data: any, field: string) {
    // Ensure InitialShare and TestProfilePrice are numbers and not null or undefined
    const initialShare = data.InitialShare ? Number(data.InitialShare) : 0;
    const testProfilePrice = data.TestProfilePrice ? Number(data.TestProfilePrice) : 0;
    const initialSharePerc = data.InitialSharePerc ? Number(data.InitialSharePerc) : 0;

    if (field === 'Share') {
      // If the InitialShare field is changed, update InitialSharePerc
      if (testProfilePrice !== 0) {
        data.InitialSharePerc = Math.round((initialShare / testProfilePrice) * 100);
      } else {
        data.InitialSharePerc = 0; // Avoid division by zero
      }
    } else if (field === 'SharePerc') {
      // If the InitialSharePerc field is changed, update InitialShare
      data.InitialShare = Math.round((initialSharePerc * testProfilePrice) / 100);
    }
  }
  ////////////////////Calculations//////////////////////////
  calculatePercentage(data: any, field: string, type: string) {
    // Ensure TestProfilePrice is a number and not null or undefined
    const testProfilePrice = data.TestProfilePrice ? Number(data.TestProfilePrice) : 0;

    if (type === 'Init') {
      const initialShare = data.InitialShare ? Number(data.InitialShare) : 0;
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
        data.InitialShare = Math.round((initialSharePerc * testProfilePrice) / 100);
      }

    } else if (type === 'DS') {
      const dSShare = data.DSShare ? Number(data.DSShare) : 0;
      const dSSharePerc = data.DSSharePerc ? Number(data.DSSharePerc) : 0;

      if (field === 'Share') {
        // If the DSShare field is changed, update DSSharePerc
        if (testProfilePrice !== 0) {
          data.DSSharePerc = ((dSShare / testProfilePrice) * 100).toFixed(2);
        } else {
          data.DSSharePerc = 0; // Avoid division by zero
        }
      } else if (field === 'SharePerc') {
        // If the DSSharePerc field is changed, update DSShare
        data.DSShare = Math.round((dSSharePerc * testProfilePrice) / 100);
      }

    } else if (type === 'Reset') {
      const resetShare = data.ResetShare ? Number(data.ResetShare) : 0;
      const resetSharePerc = data.ResetSharePerc ? Number(data.ResetSharePerc) : 0;

      if (field === 'Share') {
        // If the ResetShare field is changed, update ResetSharePerc
        if (testProfilePrice !== 0) {
          data.ResetSharePerc = ((resetShare / testProfilePrice) * 100).toFixed(2);
        } else {
          data.ResetSharePerc = 0; // Avoid division by zero
        }
      } else if (field === 'SharePerc') {
        // If the ResetSharePerc field is changed, update ResetShare
        data.ResetShare = Math.round((resetSharePerc * testProfilePrice) / 100);
      }
    }
  }

  btnSearchClicked = false;
  noDataMessage = "Please search the data for share configuration";
  searchDataAssign() {
    this.btnSearchClicked = true;
    this.getRISLevelLocationTPShare();
    if (this.searchValue == '1') { //this.searchValue == '1' this is converted to strint for mat-radio-button
      this.getTestPrfoile()
    }
    else {
      this.getAllLocationByTPID()
    }


  }
  dataSetListExisting = [];
  getRISLevelLocationTPShare() {
    let formValues = this.searchAssignForm.getRawValue();
    let objParams = {
      TPID: formValues.TPID || null,
      LevelID: formValues.radlevel || null,
      LocID: formValues.locID || null,
    };
    this.doctorShare.getRISLevelLocationTPShare(objParams).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.dataSetListExisting = res.PayLoad;
      }
      else {
        // this.toastr.error('Something Went Wrong');
        this.dataSetListExisting = [];
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

 

  @ViewChild("showbranchSelectionModal") showbranchSelectionModal;
  sourceBranchId = null
  branchPopupRef: NgbModalRef;
  isBranchSubmitted = false;

   showBranchSelectionModal() {
    // Reset selectedBranchId
    const locId = this.searchAssignForm.get('locID')
    if (!locId) {
      this.toastr.warning("Please select branch first");
      this.isBranchSubmitted = true;
      return;
    }
    this.sourceBranchId = null;
    // this.multiBranchesList = this.BranchesList.filter(
    //   (b) => b.LocId !== this.machineBranchId
    // );
    // Show the modal (requires Bootstrap or equivalent modal handling)
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

 confirmBranchSelection() {
  const locId = this.searchAssignForm.get('locID')
    if (!locId) {
      this.toastr.warning("Please select a branch");
      return;
    } else{
       this.copyDataToSelectedBranch();
      this.branchPopupRef.close();
    }
    // Proceed with copying data
  }
  
  copyDataToSelectedBranch() {
      let formValues = this.searchAssignForm.getRawValue()
      // const locId = this.searchAssignForm.get('locID')
    if (!this.sourceBranchId) {
      this.toastr.warning("Please select branch first");
      this.isBranchSubmitted = true;
      return;
    }
    const objParam = {
      FromLocID: formValues.locID, // Use selected branch ID
      ToLocID: this.sourceBranchId, // Use Targetted branch ID
      CreatedBy: this.loggedInUser.userid || -99,
    };
    console.log("ObjParam:____________", objParam);
    // this.spinner.show(this.spinnerRefs.paramsListSection);
    this.LabConfService.TransferRISTPShareLocToLoc(objParam).subscribe(
      (data: any) => {
        // this.spinner.hide(this.spinnerRefs.paramsListSection);
        if (data.StatusCode === 200 && data.PayLoad[0].Result === 1) {
          this.toastr.success("Data copied successfully");
        } else {
          this.toastr.error(data.Message);
        }
      },
      (err) => {
        console.error(err);
        // this.spinner.hide(this.spinnerRefs.paramsListSection);
        this.toastr.error("Connection error");
      }
    );
  }
}
