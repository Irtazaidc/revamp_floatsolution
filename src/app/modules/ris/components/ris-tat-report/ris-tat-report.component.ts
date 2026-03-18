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

  selector: 'app-ris-tat-report',
  templateUrl: './ris-tat-report.component.html',
  styleUrls: ['./ris-tat-report.component.scss']
})
export class RisTatReportComponent implements OnInit {

  risTatDataList = []
  loggedInUser: UserModel;
pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };
  isSubmitted = false;
  branchList = [];
  searchText = '';
  maxDate: any;
  spinnerRefs = {
    delayreportTable: 'delayreportTable',
  }

    public Fields = {
      dateFrom: ['', Validators.required],
      dateTo: ['', Validators.required],
      locID: [null, Validators.required],
    };

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
    this.getLocationList();
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  getRIStatReportData() {
      let formValues = this.filterForm.getRawValue();
      const dateFrom = formValues.dateFrom;
      const dateTo = formValues.dateTo;
      const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
      const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
         this.risTatDataList = []
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
        LocIDs: formValues.locID.join(','),
      }
      this.spinner.show(this.spinnerRefs.delayreportTable);
      this.labTats.getRISTATReportByLocIDs(objParams).subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.delayreportTable);
        if (res.StatusCode == 200 && res.PayLoad.length) {
          this.risTatDataList = res.PayLoad
          this.filterResults();
        } else {
          this.toasrt.info('No Record Found');
          this.risTatDataList = []
        }
      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.delayreportTable);
        this.toasrt.error('Connection error');
      })
    }


    allowOnlyNumbers(event: KeyboardEvent): void {
      const charCode = event.key.charCodeAt(0);
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
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


exportAsExcel() {
    const excelData = [];

    if (this.risTatDataList.length) {
      this.risTatDataList.forEach((d, index) => {
        const row = {
          '#': index + 1,
          'PIN': d.PinNumber || '--',
          'Patient Name': d.PatientName || '--',
          'Age/Gender': d.AgeGender || '--',
          'Branch': d.RegLocation || '--',
          'Section': d.SectionName || '--',
          'Test Name': d.TestName || '--',
          'Registration Date': this.formatDate(d.RegistrationDate),
          'Initialized By': d.InitByLoc || '--',
          'Initialization Date': this.formatDate(d.InitDate),
          'Delivery Date': this.formatDate(d.DeliveryDate),
          'Final Date': this.formatDate(d.FinalDate),
          'Time Taken': d.TimeTaken || '--',
          'TAT': d.TAT || '--',
          'Difference': d.TimeDiff_HhMm || '--'
        };
        excelData.push(row);
      });

      this.excelService.exportAsExcelFile(excelData, 'RIS_TAT_Report', 'RIS TAT Report');
    } else {
      this.toasrt.error('Cannot export empty table');
    }
  }

  private formatDate(date: any): string {
  return date ? new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) : '--';
}

get cleanSearchText(): string {
    return this.searchText.replace(/-/g, '');
  }


  refreshPagination() {
    let dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice(
        (this.pagination.page - 1) * this.pagination.pageSize,
        (this.pagination.page - 1) * this.pagination.pageSize +
          this.pagination.pageSize
      );
  }
 filterResults() {
  this.pagination.page = 1;

  const cols = [
    'PinNumber',
    'PatientName',
    'AgeGender',
    'RegLocation',
    'TestName',
    'RegistrationDate',
    'InitByLoc',
    'InitDate',
    'DeliveryDate',
    'FinalDate',
    'TimeTaken',
    'TAT',
    'TimeDiff_HhMm',
  ];

  let results: any = this.risTatDataList;

  if (this.searchText && this.searchText.length > 1) {
    const normalizedSearchText = this.searchText
      .replace(/-/g, '')
      .toLowerCase();

    results = this.risTatDataList.filter((item: any) => {
      return cols.some((col) => {
        if (!item[col]) return false;

        const value = item[col]
          .toString()
          .replace(/-/g, '')   // 🔥 FIX HERE
          .toLowerCase();

        return value.includes(normalizedSearchText);
      });
    });
  }

  this.pagination.filteredSearchResults = results;
  this.refreshPagination();
}

}
