// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { TpDataService } from 'src/app/modules/gen-reports/services/tp-data.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { LabTatsService } from '../../services/lab-tats.service';

@Component({
  standalone: false,

  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent implements OnInit {

  @Input() buttonControls = ['dateFrom', 'dateTo'];

  TestProfileDataList

  spinnerRefs = {
    TestProfileData: 'TestProfileData',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: [, Validators.required],
    
  };

  isSubmitted = false;
  branchList = [];
  
  searchText = '';
  maxDate:any;
  
  searchfilterform: FormGroup = this.formBuilder.group(this.Fields)

  buttonControlsPermissions = {
    branch: false,
    modality: false,
    dateFrom: false,
    dateTo: false,
    visitID: false,
    FilterBy: false,
    subsectionids: false
  }


  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private tpservice: TpDataService,
    private excelService: ExcelService,
    private labTats: LabTatsService,
  ) { }

  ngOnInit(): void {

    this.getLocationList();
 

    setTimeout(() => {
      this.searchfilterform.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
    
  }


  reEvaluateButtonsPermissions() {
    // this.buttonControlsPermissions.modality = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'modality') ? true : false;
    // this.buttonControlsPermissions.visitID = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'visitid') ? true : false;
    this.buttonControlsPermissions.dateFrom = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'datefrom') ? true : false;
    this.buttonControlsPermissions.dateTo = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'dateto') ? true : false;
    this.buttonControlsPermissions.branch = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'branch') ? true : false;
    this.buttonControlsPermissions.subsectionids = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'subsectionids') ? true : false;
  }


  getSampleTransportationList(){
    const formValues  = this.searchfilterform.getRawValue();
    
    if (this.searchfilterform.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
 
    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null, 
      LocID : formValues.locID || null,
    }
    this.spinner.show(this.spinnerRefs.TestProfileData);
    this.labTats.getSampleTransportationTATDateWise(objParams).subscribe((res: any) => {
      console.log("res:", res)
      this.spinner.hide(this.spinnerRefs.TestProfileData);
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.TestProfileDataList  = res.PayLoad
      } else {
        this.toasrt.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.TestProfileData);
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

}
