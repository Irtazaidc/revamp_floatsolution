// @ts-nocheck
import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel } from "src/app/modules/auth";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";

@Component({
  standalone: false,

  selector: "app-registered-patients",
  templateUrl: "./registered-patients.component.html",
  styleUrls: ["./registered-patients.component.scss"],
})
export class RegisteredPatientsComponent implements OnInit {
  registeredPatientsList: any = [];

  spinnerRefs = {
    dataTable: "dataTable",
    panelsDropdown: "panelsDropdown",
  };

  loggedInUser: UserModel;

  public Fields = {
    date: ["", Validators.required],
  };
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  isSubmitted = false;
  showLocColumn = false;
  branchList = [];

  searchText = "";
  maxDate: any;
  isActive: number = 1;
  filterForm: FormGroup = this.formBuilder.group(this.Fields);

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private labTats: LabTatsService,
    private excelService: ExcelService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.filterForm.patchValue({
        date: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
  }

  getRegisteredPatientsData() {
    this.registeredPatientsList = [];
    this.pagination.paginatedSearchResults = [];
    this.searchText = "";

    let formValues = this.filterForm.getRawValue();

    if (this.filterForm.invalid) {
      this.toastr.warning("Please Select Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    let objParams = {
      Date: Conversions.formatDateObject(formValues.date) || null,
    };

    this.spinner.show(this.spinnerRefs.dataTable);
    this.labTats.getRegisteredPatientReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        if (res.StatusCode == 200) {
          if (res.PayLoad.length) {
            this.registeredPatientsList = res.PayLoad;
            this.pagination.filteredSearchResults = [...res.PayLoad];
            this.refreshPagination();
          } else {
            this.toastr.info("No Record Found");
            this.registeredPatientsList = [];
          }
        } else {
          this.toastr.error("Something went wrong");
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.dataTable);
        this.toastr.error("Connection error");
      }
    );
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
      this.pagination.filteredSearchResults = [...this.registeredPatientsList];
    } else {
      this.pagination.filteredSearchResults =
        this.registeredPatientsList.filter((item: any) =>
          [
            "PatientName",
            "PatientMRNo",
            "Cell",
            "VisitID",
            "VisitDate",
            "LocCode",
            "RegInvoiceAmt",
          ].some((key) =>
            (item[key] || "").toString().toLowerCase().includes(keyword)
          )
        );
    }

    this.pagination.page = 1;
    this.refreshPagination();
  }

  exportAsExcel() {
  const excelData: any[] = [];

  if (this.pagination.filteredSearchResults?.length) {
    this.pagination.filteredSearchResults.forEach((data: any, index: number) => {
      excelData.push({
        '#': index + 1,
        MRN: data.PatientMRNo || '',
        'Patient Name': data.PatientName || '',
        'Age/Gender': `${data.Age || ''} / ${data.Gender || ''}`,
        Cell: data.Cell || '',
        VisitID: `'${data.VisitID || ''}`, // ✅ Keep as text to avoid scientific notation
        'Visit Date': this.datePipe.transform(data.VisitDate, 'dd MMM, yyyy, h:mm a') || '',
        'Last VisitID': `'${data.LastVisitID || ''}`, // ✅ Same fix for last visit
        'Last Visit Date': this.datePipe.transform(data.LastVisitReg, 'dd MMM, yyyy, h:mm a') || '',
        Amount: data.RegInvoiceAmt ?? '',
        Location: data.LocCode || '',
      });
    });

    this.excelService.exportAsExcelFile(
      excelData,
      'Registered Patient Report',
      'Registered Patient Report'
    );
  } else {
    this.toastr.error('Cannot export empty table');
  }
}
}
