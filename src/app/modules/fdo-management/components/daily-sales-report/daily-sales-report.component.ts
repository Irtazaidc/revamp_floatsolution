// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LabTatsService } from 'src/app/modules/lab/services/lab-tats.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-daily-sales-report',
  templateUrl: './daily-sales-report.component.html',
  styleUrls: ['./daily-sales-report.component.scss']
})
export class DailySalesReportComponent implements OnInit {

 
  dailySalesReportDataList:any = []

  spinnerRefs = {
    delayreportTable: 'delayreportTable',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: [, Validators.required],
    ModeId: [ ],
    TypeId: [ ],
  };

  isSubmitted = false;
  branchList = [];

  searchText = '';
  maxDate: any;

  filterForm: FormGroup = this.formBuilder.group(this.Fields)

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private labTats: LabTatsService,
    private excelService: ExcelService,
  ) { }

  ngOnInit(): void {

    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getLookupsForRegistration();
    

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
        locID: this.loggedInUser.locationid,
      });
    this.maxDate = Conversions.getCurrentDateObject();
    }, 500);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  TotalAmount:number = 0;
getDailySalesReportData() {
  const formValues = this.filterForm.getRawValue();
  const spinnerRef = this.spinnerRefs.delayreportTable;

  if (this.filterForm.invalid) {
    this.toasrt.warning("Please Fill The Mandatory Fields");
    this.isSubmitted = true;
    return;
  }

  const objParams = {
    DateFrom: Conversions.formatDateObject(formValues.dateFrom) ?? null,
    DateTo: Conversions.formatDateObject(formValues.dateTo) ?? null,
    LocId: formValues.locID || null,
    UserId: -1,
    PaymentMode: formValues.ModeId || -1,
    PatientType: formValues.TypeId || -1,
    OnlyBalance: null,
    Remarks: null,
    ExcludeRemarks: null,
  };

  this.spinner.show(spinnerRef);
  this.labTats.getDailySalesReport(objParams).subscribe({
    next: (res: any) => {
      this.spinner.hide(spinnerRef);
      if (res?.StatusCode === 200 && Array.isArray(res.PayLoad) && res.PayLoad.length) {
        this.dailySalesReportDataList = res.PayLoad;
        this.TotalAmount = this.dailySalesReportDataList.reduce((sum, item) => sum + item.Cash, 0);
      } else {
        this.toasrt.info('No Record Found');
        this.dailySalesReportDataList = [];
        this.TotalAmount = 0;
      }
    },
    error: (err) => {
      console.error('Error fetching report:', err);
      this.spinner.hide(spinnerRef);
      this.toasrt.error('Connection error');
    }
  });
}

  getLocationList() {
    this.branchList = [];
    let param = {
      UserID: this.loggedInUser.userid || -99
    }
    this.lookupService.getAllLocationByUserID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.branchList = data || [];
          // this.branchList = this.branchList.sort((a, b) => {
          //   if (a.Code > b.Code) {
          //     return 1;
          //   } else if (a.Code < b.Code) {
          //     return -1;
          //   } else {
          //     return 0;
          //   }
          // });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onSelectAllBranches() {
    this.filterForm.patchValue({
      locID: this.branchList.map(a => a.LocId)
    });
  }
  onUnselectAllBranches() {
    this.filterForm.patchValue({
      locID: []
    });
  }

  paymentModesList = [];
  patientTypeList = [];
  getLookupsForRegistration() {
    this.paymentModesList = [];
    this.lookupService.getLookupsForRegistration({ branchId: this.loggedInUser.locationid }).subscribe((resp: any) => {
      let _response = resp.PayLoadDS|| [];
      this.paymentModesList = _response.Table5 || [];
      this.patientTypeList = _response.Table6 || [];
    }, (err) => {
      console.log(err);
    })
  }

  exportAsExcel() {
    const excelData = [];
    if (this.dailySalesReportDataList.length) {
      this.dailySalesReportDataList.forEach((d, index) => {
        const row = {
          'Sr#': index + 1,
          'Patient Name': d.PatientName,
          'Test Name': d.TPCode,
          'VisitDate': d.VisitDate,
          'TestStatus': d.TestStatus,
          'Delivery Date': d.DeliveryDate,
        };
        excelData.push(row);
      });
     this.excelService.exportAsExcelFile(excelData, 'Daily Sales Report','DailySalesReport');  
    }
    else {
      this.toasrt.error('Cannot export empty table');
    }
  }

}
