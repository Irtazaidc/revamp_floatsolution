// @ts-nocheck
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { VisitTrackingService } from 'src/app/modules/information-desk/services/visit-tracking.service';
import { LookupService } from '../../services/lookup.service';
import { TestProfileService } from '../../services/test-profile.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { PatientService } from '../../services/patient.service';

@Component({
  standalone: false,

  selector: 'app-test-search',
  templateUrl: './test-search.component.html',
  styleUrls: ['./test-search.component.scss']
})
export class TestSearchComponent implements OnInit {
  @Output() patValueEmit = new EventEmitter<any>();
  TestDataList = [];
  selectedPatient
  spinnerRefs = {
    searchTable: 'searchTable',
    searchFormSpinner: 'searchFormSpinner',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    TPID: [, Validators.required],
    locID: [, Validators.required],
    
  };

  isSubmitted = false;
  branchList = [];
  
  searchText = '';
  
  searchForm: FormGroup = this.formBuilder.group(this.Fields)

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private patientService: PatientService,
    private testProfileService: TestProfileService,
  ) { }

 
  ngOnInit(): void {
    this.getLocationList();
    this.getTestProfileList();
    setTimeout(() => {
      this.searchForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      // this.onSelectAllBranches();
    }, 100);

  }
  getSearchedDataList(){
    let formValues  = this.searchForm.getRawValue();
     this.TestDataList = []
    if (this.searchForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    let objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null, 
      BranchIDs : formValues.locID ? formValues.locID.join(",") : null,
      TPId : formValues.TPID || null,
    }
    this.spinner.show(this.spinnerRefs.searchTable);
    this.patientService.getSearchVisitByTestAndLoc(objParams).subscribe((res: any) => {
      console.log("res:", res)
      this.spinner.hide(this.spinnerRefs.searchTable);
      if (res.StatusCode == 200 && res.PayLoadStr.length) {
        let data = res.PayLoadStr
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.TestDataList  = data.Table || [];
      } else {
        this.toasrt.info('No Record Found');
        this.TestDataList = []
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.toasrt.error('Connection error');
    })
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
          if (a.Code  > b.Code ) {
            return 1;
          } else if (a.Code  < b.Code ) {
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
  testList = [];
  getTestProfileList() {
    this.testList = [];
    let _param = {
      branchId: 1, //null
      TestProfileCode: null,
      TestProfileName: null,
      panelId: null,
      TPIDs: "",
    };
    this.spinner.show(this.spinnerRefs.searchFormSpinner)
    this.testProfileService.getTestsByName(_param).subscribe(
      (res: any) => {
    this.spinner.hide(this.spinnerRefs.searchFormSpinner)
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
    this.spinner.hide(this.spinnerRefs.searchFormSpinner)

      }
    );
  }

 

patientRowDoubleClick(patient) {
    this.selectedPatient = patient;
    this.patValueEmit.emit(this.selectedPatient);
}

onSelectAllBranches() {
  this.searchForm.patchValue({
    locID: this.branchList.map(a => a.LocId)
  });
}
onUnselectAllBranches() {
  this.searchForm.patchValue({
    locID: []
  });
}

}
