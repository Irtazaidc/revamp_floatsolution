// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { TpDataService } from 'src/app/modules/gen-reports/services/tp-data.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { LabTatsService } from '../../services/lab-tats.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-lab-testing',
  templateUrl: './lab-testing.component.html',
  styleUrls: ['./lab-testing.component.scss']
})
export class LabTestingComponent implements OnInit {

  labTestDataList:any =[]

  spinnerRefs = {
    labTesting: 'labTesting',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: [, Validators.required],
    PanelId: [null],
    
  };

  isSubmitted = false;
  branchList = [];
  
  searchText = '';
  maxDate:any;
  
  getLabTestingData: FormGroup = this.formBuilder.group(this.Fields)
  
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
    this.getPanels();
  

    setTimeout(() => {
      this.getLabTestingData.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }

  getLabTestingDataList(){
    let formValues  = this.getLabTestingData.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toasrt.error('DateTo should be equal or greater than DateFrom');
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference =  30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period =  '1 month';
      this.toasrt.error(`The difference between dates should not exceed ${period}`);
      this.isSubmitted = false;
      return;
    }
    
    if (this.getLabTestingData.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    let objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null, 
      LocID : formValues.locID || null,
      PanelID : formValues.PanelId || null,
    }
    this.spinner.show(this.spinnerRefs.labTesting);
    this.labTats.getLabTestingTAT(objParams).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.labTesting);
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.labTestDataList  = res.PayLoad
      } else {
        this.toasrt.info('No Record Found');
        this.labTestDataList = []
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.labTesting);
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
  
  panelsList
  getPanels() {
    this.panelsList = [];
    let _params = {
      branchId: null
    }
    this.lookupService.getPanels(_params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.panelsList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }

  exportAsExcel() {  
    const excelData = []; 
    if (this.labTestDataList.length){
      this.labTestDataList.forEach((d, index) => {
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
     this.excelService.exportAsExcelFile(excelData, 'Lab Testing TAT','LabTestingTAT'); 
    }
    else{
      this.toasrt.error('Empty Record');
    }
       
}

}
