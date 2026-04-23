// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { TpDataService } from 'src/app/modules/gen-reports/services/tp-data.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { LabTatsService } from '../../services/lab-tats.service';

@Component({
  standalone: false,

  selector: 'app-sample-trnsprt',
  templateUrl: './sample-trnsprt.component.html',
  styleUrls: ['./sample-trnsprt.component.scss']
})
export class SampleTransportComponent implements OnInit {

  TestProfileDataList:any = []

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
    
  ) { }

  ngOnInit(): void {

    this.getLocationList();
  

    setTimeout(() => {
      this.getsampleTransportationData.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
    
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getSampleTransportationList(){
    const formValues  = this.getsampleTransportationData.getRawValue();
    
    if (this.getsampleTransportationData.invalid) {
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
    this.labTats.getSampleTransportationTAT(objParams).subscribe((res: any) => {
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

  exportAsExcel() {  
    const excelData = [];
    

     if(this.TestProfileDataList.length){
      this.TestProfileDataList.forEach((d, index) => {
        const row = {
          'Sr#': index+1,
          'Test Profile Code': d.TestProfileCode,
          'Booking Lab': d.BookingLab,
          'Sampling Lab': d.SamplingLab,
          'Testing Lab': d.TestingLab,
          'Total Test': d.TotalTest,
          'Min TAT': d.MinTAT,
          'Max TAT': d.MaxTAT,
          'Avg TAT': d.AvgTAT,
        };
        excelData.push(row);
      });
     this.excelService.exportAsExcelFile(excelData, 'Sample Transport TAT','SampleTransportTAT'); 
    }
    else{
      this.toasrt.error('Empty Record');
    }
}

}
