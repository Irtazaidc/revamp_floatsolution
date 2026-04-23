// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { TpDataService } from 'src/app/modules/gen-reports/services/tp-data.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { LabTatsService } from '../../../services/lab-tats.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';

@Component({
  standalone: false,

  selector: 'app-sample-trnsprt-loc',
  templateUrl: './sample-trnsprt-loc.component.html',
  styleUrls: ['./sample-trnsprt-loc.component.scss']
})
export class SampleTrnsprtLocComponent implements OnInit {


  TestProfileDataList:any = []

  spinnerRefs = {
    TestProfileData: 'TestProfileData',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: [, Validators.required],
    subSectionID: [''],
    TestId: [''],
  };

  isSubmitted = false;
  branchList = [];
  
  searchText = '';
  maxDate:any;
  
  getsampleTransportationData: FormGroup = this.formBuilder.group(this.Fields)
  
  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private tpservice: TpDataService,
    private excelService: ExcelService,
    private labTats: LabTatsService,
     private testProfileService: TestProfileService,
  ) { }

  ngOnInit(): void {
     this.getLocationList();
     this.getSubSection();
    this.getTestProfileList();

    setTimeout(() => {
      this.getsampleTransportationData.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }


  getSampleTransportationListLocWise(){
    const formValues  = this.getsampleTransportationData.getRawValue();
    
    if (this.getsampleTransportationData.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null, 
      LocIDs : formValues.locID ? formValues.locID.join(","): null,
      SubSectionIDs : formValues.subSectionID != "" ? formValues.subSectionID.join(","): -1, 
      TPIDs : formValues.TestId != "" ? formValues.TestId.join(","): -1,
    }
    this.spinner.show(this.spinnerRefs.TestProfileData);
    this.labTats.getSampleTransportationTATLocWise(objParams).subscribe((res: any) => {
      console.log("res:", res)
      this.spinner.hide(this.spinnerRefs.TestProfileData);
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.TestProfileDataList  = res.PayLoad
      } else {
        this.toasrt.info('No Record Found');
        this.TestProfileDataList = []
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
  
  onSelectAllBranches() {
    this.getsampleTransportationData.patchValue({
     locID: this.branchList.map(a => a.LocId)
    });
  }
  onUnselectAllBranches() {
    this.getsampleTransportationData.patchValue({
     locID: []
    });
  }

  subSectionList = []
  getSubSection() {
    
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: -1,
    }    
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      this.subSectionList = resp.PayLoad;
    }, (err) => {
      console.log("error:", err)
      this.toasrt.error('Connection error');
    })
  }
  
  onSelectAllSubSections() {
    this.getsampleTransportationData.patchValue({
      subSectionID: this.subSectionList.map(a => a.SubSectionId)
     });
     setTimeout(() => {
      this.getTestProfileList();
      }, 100);
  }
  onUnselectAllSubSections() {
    this.getsampleTransportationData.patchValue({
      subSectionID: []
     });
     setTimeout(() => {
      this.getTestProfileList();
      }, 100);
  }

  exportAsExcel() {  
    const excelData = [];
     if(this.TestProfileDataList.length){
      this.TestProfileDataList.forEach((d, index) => {
        const row = {
          'Sr#': index+1,
          'Location Code': d.LocCode,
          'Total Test': d.TotalTest,
          'Min TAT': d.MinTAT,
          'Max TAT': d.MaxTAT,
          'Avg TAT': d.AvgTAT,
        };
        excelData.push(row);
      });
     this.excelService.exportAsExcelFile(excelData, 'Sample Transport Location Wise','SampleTransportLocWise'); 
    }
    else{
      this.toasrt.error('Empty Record');
    }
}

testList = [];
getTestProfileList() {
  
  const formValues  = this.getsampleTransportationData.getRawValue();
  
  this.testList = [];
  const _param = {
    TPID: null,
    TestProfileCode: null,
    TestProfileName: null,
    SubSectionID:formValues.subSectionID ? formValues.subSectionID.join(","): null,
    LabDeptID: null,
  };
  this.testProfileService.getTestsProfileForAnalytics(_param).subscribe(
    (res: any) => {
      if (res && res.StatusCode === 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) {
          console.log(ex);
        }
        this.testList = data || [];
      }
    },
    (err) => {
      console.log(err);
    }
  );
}



onSelectAllTestProfile(){
  this.getsampleTransportationData.patchValue({
    TestId: this.testList.map(a => a.TPID)
   });
}

onUnselectAllTestProfile(){
  this.getsampleTransportationData.patchValue({
    TestId: [null]
   });
}

}
