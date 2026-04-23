// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder,Validators, AbstractControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { UserModel } from 'src/app/modules/auth/_models/user.model';
import { DengueService } from 'src/app/modules/patient-booking/services/dengue.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { FuelLogService } from '../../service/fuel-log.service';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';

@Component({
  standalone: false,

  selector: 'app-generator-logs',
  templateUrl: './generator-logs.component.html',
  styleUrls: ['./generator-logs.component.scss']
})
export class GeneratorLogsComponent implements OnInit {
  
  isSubmitted = false;
  branchList
  GeneratorList: any = [];
  genratorData:any[] = null;
  spinnerRefs = {
    genratorData: 'genratorData',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: [, Validators.required],
    generatorId: [, Validators.required],
  };

  searchText = '';
  maxDate:any;
  
  getGeneratorFuelLog: FormGroup = this.formBuilder.group(this.Fields)
  

  constructor(
    private formBuilder: FormBuilder,
    private dengueSrv: DengueService,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private fuelLog: FuelLogService,
    private excelService: ExcelService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    setTimeout(() => {
      this.getGeneratorFuelLog.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
    this.loadLoggedInUserInfo();
    this.getLocationList();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  // Custom validator to ensure dates are within one month
validateDateRange(getGeneratorFuelLog: AbstractControl) {
  const dateFrom = getGeneratorFuelLog.get('dateFrom')?.value;
  const dateTo = getGeneratorFuelLog.get('dateTo')?.value;

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const to = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
    const oneMonthLater = new Date(from);
    oneMonthLater.setMonth(from.getMonth() + 1);

    if (to > oneMonthLater) {
      return { dateRangeInvalid: true };
    }
  }
  return null;
}
  getGenFuelLogData(){
    const formValues = this.getGeneratorFuelLog.getRawValue();
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


    this.genratorData = null;
    this.isSubmitted = true;
    if(this.getGeneratorFuelLog.invalid){ 
      this.toasrt.warning('Please Fill The Mandatory fields');
      return;
    } 
  
    const param = {
      FromDate: Conversions.formatDateObject(formValues.dateFrom) || null,
      ToDate: Conversions.formatDateObject(formValues.dateTo) || null, 
      LocIds: formValues.locID.join(","), 
      GeneratorIDs: formValues.generatorId.join(","),
    }
    this.spinner.show(this.spinnerRefs.genratorData)
    this.fuelLog.getGeneratorFuelLogList(param).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.genratorData)
      if (res && res.StatusCode == 200 && res.PayLoad) {
         this.genratorData = res.PayLoad;
      }
      else{
        this.toasrt.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.toasrt.error('Connection Error')
    });
  }

  onSelectAllBranches() {
    console.log("select all");
    setTimeout(() => {
      this.getGeneratorFuelLog.patchValue({
        locID: this.branchList.map((a) => a.LocId),
      });
      this.cdRef.detectChanges(); 
      this.getGeneratorList()// Manually trigger change detection
    }, 300);
  }
  
  onUnselectAllBranches() {
    console.log("Unselect all");
    setTimeout(() => {
      this.getGeneratorFuelLog.patchValue({
        locID: [],
      });
      this.cdRef.detectChanges(); 
      this.getGeneratorList()// Manually trigger change detection
    }, 300);
  }
  onSelectAllGenerators() {
    console.log("select all");
    setTimeout(() => {
      this.getGeneratorFuelLog.patchValue({
        generatorId: this.GeneratorList.map((a) => a.GeneratorID), // Ensure 'GeneratorID' matches
      });
      this.cdRef.detectChanges(); // Trigger change detection after value update
    }, 300);
  }
  onUnselectAllGenerators() {
    console.log("Unselect all");
    setTimeout(() => {
      this.getGeneratorFuelLog.patchValue({
        generatorId: [],
      });
      this.cdRef.detectChanges(); // Manually trigger change detection
    }, 300);
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
        this.branchList=this.branchList.sort((a, b) => {
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
 
  getGenerator(event){
    console.log("event", event)
    if(event){
      this.getGeneratorList();

    }

  }
  getGeneratorList() {
    this.GeneratorList = [];
    const formValues = this.getGeneratorFuelLog.getRawValue();
    console.log("formValues", formValues)
    const param = {
      LocIds : formValues.locID.join(",") || -1, 
    };

    this.fuelLog.getGeneratorName(param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoadStr) {
        let data = res.PayLoadStr;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.GeneratorList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  
  exportAsExcel() {  
    if(this.genratorData.length){
      const excelData = [];
      this.genratorData.forEach((d, index) => {
        const row = {
          'Sr#': index+1,
          'Employee Name': d.EmployeeNAme,
          'Generator Name': d.GeneratorName,
          'Capacity': d.Capacity,
          'FuelAdded(Ltrs)': d.FuelAddLtrs,
          'FuelLog Date': d.FuelLogDate,
          'MinFuel Reminder': d.MinFuelReminder,
          'PricePerLiter': d.PricePerLiter,
          'BeforFuelLevel': d.BeforFuelLevel,
          'AfterFuelLevel': d.AfterFuelLevel,
        };
        excelData.push(row);
      });
     this.excelService.exportAsExcelFile(excelData, 'Fuel Logs Report', 'Fuel Logs');  
    }
    else{
      this.toasrt.info('No Record Found');
    }
     
 }

}


