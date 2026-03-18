// @ts-nocheck
import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { SharedService } from "src/app/modules/shared/services/shared.service";

@Component({
  standalone: false,

  selector: "app-insurance-inquiry-report",
  templateUrl: "./insurance-inquiry-report.component.html",
  styleUrls: ["./insurance-inquiry-report.component.scss"],
})
export class InsuranceInquiryReportComponent implements OnInit {
  reportInquiryParams: FormGroup;
  isSpinner: boolean = true;
  reportInquiryList: any = [];
  isDisable = false;
  searchText = "";
  sortAsc: boolean = true; // start with ascending
  inquiryList: any[] = [];
  isSubmitted = false;
  spinnerRefs = {
    ReportInquirySection: "ReportInquirySection",
    inquiryData: "inquiryData",
  };

  advancedSearchEnabled = false;
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private shareSrv: SharedService,
    private excelService: ExcelService,
    private datePipe: DatePipe
    
  ) {
    this.reportInquiryParams = this.fb.group({
      MRNo: [""],
      CNIC: ["", [Validators.pattern("^[0-9]*$")]],
      Cell: ["", [Validators.pattern("^[0-9]*$")]],
      VisitID: ["", [Validators.pattern("^[0-9]*$")]],
      PolicyNo: ["", [Validators.pattern("^[0-9]*$")]],
    });
  }

  ngOnInit(): void {}

  getInsuranceInquiryReport() {
    let formValues = this.reportInquiryParams.getRawValue();
    this.reportInquiryList = [];

    // if (this.reportInquiryParams.invalid) {
    //   this.toastr.warning("Please Fill The Mandatory Fields");
    //   this.reportInquiryList = [];
    //   this.isSubmitted = true;
    //   return;
    // }
    let objParm = {
      MRNo: formValues.MRNo || null,
      CNIC: formValues.CNIC || null,
      Cell: formValues.Cell || null,
      VisitID: formValues.VisitID || null,
      PolicyNo: formValues.PolicyNo || null,
    };
    this.isSpinner = true;
    this.spinner.show();

    this.shareSrv.getInsuranceInquiryReport(objParm).subscribe(
      (resp: any) => {
        this.isDisable = false;
        this.spinner.hide(this.spinnerRefs.ReportInquirySection);
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.reportInquiryList = resp.PayLoad;
          this.pagination.filteredSearchResults = [...resp.PayLoad];
          this.refreshPagination();
          this.isSpinner = false;
          this.spinner.hide();
        } else {
          this.toastr.warning("No Record Found");
          this.reportInquiryList = [];
          this.pagination.filteredSearchResults = [];
          this.refreshPagination();
          this.isSpinner = false;
          this.spinner.hide();
        }
      },
      (err) => {
        this.isSpinner = false;
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  clearFields(activeFieldName: string) {
    switch (activeFieldName) {
      case "MobileNO": {
        this.reportInquiryParams.patchValue({
          PatientNo: "",
          VisitId: "",
        });
        break;
      }
      case "PatientNo": {
        this.reportInquiryParams.patchValue({
          MobileNO: "",
          VisitId: "",
        });
        break;
      }
      case "VisitId": {
        this.reportInquiryParams.patchValue({
          MobileNO: "",
          PatientNo: "",
        });
        break;
      }
    }
  }

  sortByCreatedOn() {
    if (this.reportInquiryList && this.reportInquiryList.length) {
      this.reportInquiryList = [
        ...this.reportInquiryList.sort((a, b) => {
          const dateA = new Date(a.CreatedOn).getTime();
          const dateB = new Date(b.CreatedOn).getTime();
          return this.sortAsc ? dateA - dateB : dateB - dateA;
        }),
      ];

      this.sortAsc = !this.sortAsc; // Toggle sort direction
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  removeHyphens(controlName: string) {
    const currentValue = this.reportInquiryParams.get(controlName)?.value || "";
    const cleanedValue = currentValue.replace(/-/g, "");
    this.reportInquiryParams
      .get(controlName)
      ?.setValue(cleanedValue, { emitEvent: false });
  }

  advancedSearch() {
    this.advancedSearchEnabled = !this.advancedSearchEnabled;
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
filterSearchResults() {
  const keyword = this.searchText.toLowerCase().trim();

  if (!keyword) {
    this.pagination.filteredSearchResults = [...this.reportInquiryList];
  } else {
    this.pagination.filteredSearchResults = this.reportInquiryList.filter(
      (item: any) =>
        ["PatientName", "MRNo", "InsuranceStatus", "VisitID"].some(
          (key) => {
            const value = item[key];

            // handle null/undefined safely
            if (!value) return false;

            return value.toString().toLowerCase().includes(keyword);
          }
        )
    );
  }

  this.pagination.page = 1;
  this.refreshPagination();
}

  handleFocus(fieldName: string): void {
    const form = this.reportInquiryParams;
    if (!form.get(fieldName)?.value) {
      Object.keys(form.controls).forEach((key) => {
        if (key !== fieldName && form.get(key)?.value) {
          form.get(key)?.setValue("");
        }
      });
    }
  }

  exportAsExcel() {
    const excelData = [];
    if (this.reportInquiryList.length) {
      this.reportInquiryList.forEach((d) => {
        const row = {
          'Patient Name': d.PatientName,
          'MRNo': d.MRNo || "--",
          'FIT Coverage Status': d.InsuranceStatus || "--",
          'VisitID': d.VisitID ? d.VisitID.toString() : "--",
          'Date': this.datePipe.transform(d.CreatedOn, 'dd MMM, yyyy, h:mm a' ) || '--',
          
          'Changed By': d.CratedBy || "--",
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(
        excelData,
        "FIT Coverage Inquiry Report",
        "FIT-Coverage-Inquiry-Report"
      );
    } else {
      this.toastr.error("Cannot export empty table");
    }
  }
}
