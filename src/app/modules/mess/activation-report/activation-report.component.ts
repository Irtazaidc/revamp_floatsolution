// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "../../auth";
import { LookupService } from "../../patient-booking/services/lookup.service";
import { Conversions } from "../../shared/helpers/conversions";
import { SharedService } from "../../shared/services/shared.service";

@Component({
  standalone: false,

  selector: "app-activation-report",
  templateUrl: "./activation-report.component.html",
  styleUrls: ["./activation-report.component.scss"],
})
export class ActivationReportComponent implements OnInit {
  spinnerRefs = {
    dataTable: "dataTable",
    panelsDropdown: "panelsDropdown",
  };

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };


  messActivationList: any = [];
  isSpinner: boolean = true;
  isDisable = false;
  ForMealType: number = -1;
  isSubmitted = false;
  searchText = "";
  maxDate: any;
  branchList = [];
  loggedInUser: UserModel;
  statusOptionForMealType = [
    { label: "All", value: -1 },
    { label: "Breakfast", value: 1 },
    { label: "Lunch", value: 2 },
    { label: "Dinner", value: 3 },
  ];

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    LocIDs: [ "" , Validators.required],
  };
  filterForm: FormGroup = this.formBuilder.group(this.Fields);

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getLocationList();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
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
      this.pagination.filteredSearchResults = [...this.messActivationList];
    } else {
      this.pagination.filteredSearchResults = this.messActivationList.filter((item: any) =>
        ['EmpName', 'EmpNo', 'DepartmentName', 'Designation', 'LocCode', 'MealType'].some((key) =>
          (item[key] || '').toString().toLowerCase().includes(keyword)
        )
      );
    }

    this.pagination.page = 1;
    this.refreshPagination();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getMessActivationData() {
    let formValues = this.filterForm.getRawValue();
    formValues.dateFrom = formValues.dateFrom
      ? Conversions.formatDateObject(formValues.dateFrom)
      : null;
    formValues.dateTo = formValues.dateTo
      ? Conversions.formatDateObject(formValues.dateTo)
      : null;

    if (this.filterForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.messActivationList = [];
      this.isSubmitted = true;
      return;
    }

    if (formValues.dateFrom && formValues.dateTo) {
      const dateFrom = new Date(formValues.dateFrom);
      const dateTo = new Date(formValues.dateTo);

      // Check if DateTo is earlier than DateFrom
      if (dateTo < dateFrom) {
        this.toastr.error("DateTo should be equal or greater than DateFrom");
        this.messActivationList = [];
        this.isSubmitted = true;
        return;
      }

      // Check if the selected date range exceeds one month
      const oneMonthLimit = new Date(dateFrom);
      oneMonthLimit.setMonth(dateFrom.getMonth() + 1);

      if (dateTo > oneMonthLimit) {
        this.toastr.warning(
          "You can only fetch data for up to one month. Please adjust your date range."
        );
        this.messActivationList = [];
        this.isSubmitted = true;
        return;
      }

      this.isDisable = true;
    }

    let objParm = {
      DateFrom: formValues.dateFrom,
      DateTo: formValues.dateTo,
      LocIDs: formValues.LocIDs.join(","),
      MealTypeID: this.ForMealType      
    };
    this.isSpinner = true;
    this.spinner.show();

    this.sharedService.getMessActivationData(objParm).subscribe(
      (resp: any) => {
        this.isDisable = false;
        this.spinner.hide(this.spinnerRefs.dataTable);
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.messActivationList = resp.PayLoad;
            this.pagination.filteredSearchResults = [...resp.PayLoad];
              this.refreshPagination();
          this.isSpinner = false;
          this.spinner.hide();
        } else {
          this.toastr.warning("No Record Found");
          this.messActivationList = [];
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

  getLocationList() {
    this.branchList = [];
    let param = {
      UserID: this.loggedInUser.userid || -99,
    };
    this.lookupService.getAllLocationByUserID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.branchList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

onSelectAllBranches() {
    this.filterForm.patchValue({
      LocIDs: this.branchList.map((a) => a.LocId),
    });
  }
  onUnselectAllBranches() {
    this.filterForm.patchValue({
      LocIDs: [],
    });
  }


}
