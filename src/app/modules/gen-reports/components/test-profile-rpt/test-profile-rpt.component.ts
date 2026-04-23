// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/auth";
import { UserModel } from "src/app/modules/auth/_models/user.model";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { TpDataService } from "../../services/tp-data.service";
import { ExcelService } from "src/app/modules/business-suite/excel.service";

@Component({
  standalone: false,

  selector: "app-test-profile-rpt",
  templateUrl: "./test-profile-rpt.component.html",
  styleUrls: ["./test-profile-rpt.component.scss"],
})
export class TestProfileRptComponent implements OnInit {
  TestProfileDataList;
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };
  spinnerRefs = {
    TestProfileData: "TestProfileData",
  };

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    locID: ["", Validators.required],
  };

  isSubmitted = false;
  branchList = [];
SubSectionList = [];
  LabDeptID = -1;
  SectionList = [];

  searchText = "";
  maxDate: any;

  getTestProfileData: FormGroup = this.formBuilder.group(this.Fields);

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private tpservice: TpDataService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.getLocationList();
    this.getSection();

    setTimeout(() => {
      this.getTestProfileData.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }
  getSection() {
    this.SectionList = [];
    const objParm = {
      SectionID: -1,
    };
    this.lookupService.getSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        this.SectionList = _response.filter((a) => a.SectionId != 7);
      },
      (err) => {
        this.toasrt.error("Connection error");
      }
    );
  }

    getSubSectionByParent(SectionID) {
    this.SubSectionList = [];
    const objParm = {
      SectionID: SectionID,
      LabDeptID: this.LabDeptID,
    };
    this.lookupService.getSubSectionByParent(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        this.SubSectionList = _response;
      },
      (err) => {
        this.toasrt.error("Connection error");
      }
    );
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getTestProfileList() {
    this.pagination.paginatedSearchResults = [];

    const formValues = this.getTestProfileData.getRawValue();

    if (this.getTestProfileData.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      LocID: formValues.locID || null,
    };
    this.spinner.show(this.spinnerRefs.TestProfileData);
    this.tpservice.getTestPrfoileDataByLocID(objParams).subscribe(
      (res: any) => {
        console.log("res:", res);
        this.spinner.hide(this.spinnerRefs.TestProfileData);
        if (res.StatusCode == 200 && res.PayLoad.length) {
          this.TestProfileDataList = res.PayLoad;
          this.filterResults();
        } else {
          this.toasrt.info("No Record Found");
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.TestProfileData);
        this.toasrt.error("Connection error");
      }
    );
  }
  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
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
      },
      (err) => {
        console.log(err);
      }
    );
  }

  exportAsExcel() {
    const excelData = [];
    this.TestProfileDataList.forEach((d, index) => {
      const row = {
        "Sr#": index + 1,
        "Patient Name": d.patientname,
        "PIN#": d.PIN,
        "Test Name": d.Test,
        "Patient Type": d.PatientType,
        "Panel Code": d.panelCode,
        "Branch Code": d.BranchCode,
        "Reg. Date": d.registrationdate,
        Amount: d.Amount,
      };
      excelData.push(row);
    });
    this.excelService.exportAsExcelFile(
      excelData,
      "Test Profile Data",
      "TestProfileDataList"
    );
  }

  refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
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
    'patientname',
    'PIN',
    'Test',
    'PatientType',
    'panelCode',
    'BranchCode',
    'Amount'
  ];

  let results: any = this.TestProfileDataList;

  if (this.searchText && this.searchText.length > 1) {
    const normalizedSearchText = this.searchText
      .replace(/-/g, '')
      .toLowerCase();

    results = this.TestProfileDataList.filter((item: any) => {
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
