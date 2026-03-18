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

  selector: 'app-my-cash-tally',
  templateUrl: './my-cash-tally.component.html',
  styleUrls: ['./my-cash-tally.component.scss']
})
export class MyCashTallyComponent implements OnInit {

  cashTallyDataList:any = [];
  totalAmounts: any = {};

  spinnerRefs = {
    TallyReportTable: 'TallyReportTable',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: [ ],
    ModeId: [ ],
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
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
        locID: this.loggedInUser.locationid,
      });
    this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getCashTallyData() {
    this.cashTallyDataList = [];
    this.totalAmounts = {}
    let formValues = this.filterForm.getRawValue();
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

    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    let objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      LocID : formValues.locID || -1,
      PaymentMode: formValues.ModeId || -1,
      UserId : this.loggedInUser.userid || -1,
    }
    this.spinner.show(this.spinnerRefs.TallyReportTable);
    this.labTats.getMyCashTallyReport(objParams).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.TallyReportTable);
      if (res.StatusCode == 200){
        if(res.PayLoad.length){
          this.cashTallyDataList = res.PayLoad;
          this.cashTallyDataList = this.cashTallyDataList.map(data => {
            return {
              ...data,
              Balance: 
              (data.TotalAmount || 0) 
              - (data.Cash || 0) 
              - (data.CreditCard || 0) 
              - (data.Cheque || 0) 
              - (data.DemandDraft || 0) 
              - (data.RewardPoint || 0) 
              // + (data.Refund || 0) // Add the Refund value
            };
          });
          this.calculateTotals();
        }else{
          this.toasrt.info('No Record Found');
          this.cashTallyDataList = [];
        }
      }else {
      this.toasrt.error('Something went wrong');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.TallyReportTable);
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


  paymentModesList = [];
  getLookupsForRegistration() {
    this.paymentModesList = [];
    this.lookupService.getLookupsForRegistration({ branchId: this.loggedInUser.locationid }).subscribe((resp: any) => {
      let _response = resp.PayLoadDS|| [];
      this.paymentModesList = _response.Table5 || [];
      
    }, (err) => {
      console.log(err);
    })
  }

  exportAsExcel() {
    const excelData = [];
    if (this.cashTallyDataList.length) {
      this.cashTallyDataList.forEach((d, index) => {
        const row = {
          'ReceiptNo': d.ReceiptNo,
          'PIN': d.AccNo,
          'Total Amount': d.TotalAmount || '0' ,
          'Cash ': d.Cash || '0' ,
          'Credit Card': d.CC || '0' ,
          'Cheque': d.Cheque || '0' ,
          'DemandDraft': d.DemandDraft || '0' ,
          'Reward Points': d.RewardPoints || '0' ,
          'Refund': d.Refund || '0',
          'Balance ': d.Balance || '0',
          'Remarks  ': d.Remarks || '-',
        };
        excelData.push(row);
      });
     this.excelService.exportAsExcelFile(excelData, 'Cash Tally Report','Cash-Tally-Report');  
    }
    else {
      this.toasrt.error('Cannot export empty table');
    }
  }


calculateTotals() {
  this.totalAmounts = this.cashTallyDataList.reduce((totals, data) => {
    totals.TotalAmount = (totals.TotalAmount || 0) + (data.TotalAmount || 0);
    totals.Cash = (totals.Cash || 0) + (data.Cash || 0);
    totals.CreditCard = (totals.CreditCard || 0) + (data.CreditCard || 0);
    totals.Cheque = (totals.Cheque || 0) + (data.Cheque || 0);
    totals.DemandDraft = (totals.DemandDraft || 0) + (data.DemandDraft || 0);
    totals.RewardPoints = (totals.RewardPoints || 0) + (data.RewardPoints || 0);
    totals.Refund = (totals.Refund || 0) + (data.Refund || 0);
    totals.Balance = (totals.Balance || 0) + (data.Balance || 0);
    return totals;
  }, {});
}


onSearchChange(value: string) {
  // Strip hyphens or other special characters
  this.searchText = value.replace(/[^a-zA-Z0-9]/g, '');
}

}
