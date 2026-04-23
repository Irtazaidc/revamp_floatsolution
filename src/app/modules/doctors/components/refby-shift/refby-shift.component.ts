// @ts-nocheck
import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { HelperService } from "src/app/modules/shared/helpers/helper.service";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { ChangeDetectorRef } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Conversions } from "src/app/modules/shared/helpers/conversions";

@Component({
  standalone: false,

  selector: "app-refby-shift",
  templateUrl: "./refby-shift.component.html",
  styleUrls: ["./refby-shift.component.scss"],
})
export class RefbyShiftComponent implements OnInit {
  spinnerRefs = {
    searchTable: "searchTable",
  };
  loggedInUser: UserModel;
  isSubmitted = false;
  searchText = "";
  noDataMessage = "";
  dataSetListExisting = [];

  filterForm = this.formBuilder.group({
    dateFrom: [""],
    dateTo: [""],
    byVisitID: ["", [Validators.minLength(12), Validators.maxLength(15)]],
  });

  confirmationPopover = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Please Confirm...!", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> want to save ?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };
  maxDate;

  isSpinner = true;
  disabledButton = false;
  mainChk = false;
  medTypes = [
    {
      id: "MED-SPL",
      title: "MED-SPL",
    },
    {
      id: "DEN-GP",
      title: "DEN-GP",
    },
    {
      id: "MED-GP",
      title: "MED-GP",
    },
    {
      id: "DEN-SPL",
      title: "DEN-SPL",
    },
  ];
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private sharedService: SharedService,
    private lookupService: LookupService,
    private helper: HelperService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    // this.getRefByDoctors();
    this.getCitiesList(168);
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 300);
    this.maxDate = Conversions.getCurrentDateObject();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  doctorList: any = [];

  getRefByDoctors() {
    const formValues = this.filterForm.getRawValue();
    this.doctorList = [];

    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(
      dateFrom.year,
      dateFrom.month - 1,
      dateFrom.day
    );
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = "1 month";
      this.toastr.error(
        `The difference between dates should not exceed ${period}`
      );
      this.isSubmitted = false;
      return;
    }

    if (this.filterForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const paramObj = {
      DateFrom: formValues.dateFrom
        ? Conversions.formatDateObject(formValues.dateFrom)
        : null,
      DateTo: formValues.dateTo
        ? Conversions.formatDateObject(formValues.dateTo)
        : null,
      VisitID: Number(formValues.byVisitID) || null,
    };

    // this.noDataMessage = "Please wait, data is loading...";
    // this.spinner.show(this.spinnerRefs.searchTable);
    this.spinner.show(this.spinnerRefs.searchTable);
    this.sharedService
      .getData(API_ROUTES.GET_REF_BY_DOCTORS_TO_BE_SHIFT, paramObj)
      .subscribe(
        (res: any) => {
          this.spinner.hide(this.spinnerRefs.searchTable);
           if (res.StatusCode == 200) {
    if (res.PayLoad.length) {
      const drData = res.PayLoad;

      // Initialize checked property
      this.dataSetList = drData.map((item: any) => ({
        ...item,
        MedType: item.MedType || null,
        CityName: item.CityName || null,
        checked: false  // Add this line
      }));

      this.filterResults();

              // this.updateFilteredList();
            } else {
              this.toastr.info("No Record Found");
              this.dataSetList = [];
              this.filteredDataSetList = [];
              this.noDataMessage = "No record found";
            }
          } else {
            this.toastr.error("Something Went Wrong");
            this.noDataMessage = "No record found";
            this.dataSetList = [];
            this.filteredDataSetList = [];
          }
        },
        (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.searchTable);
          this.toastr.error("Connection error");
        }
      );
  }


  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

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
      this.mainChk = this.dataSetList.length &&
               this.dataSetList.every(item => item.checked);
  }
 filterResults() {
  this.pagination.page = 1;

  const cols = [
    'Name',
    'City',
    'CreatedByName',
    'Cell',
    'Title',
    'LocationName',
    'VisitNo',
  ];

  let results = this.dataSetList;

  if (this.searchText && this.searchText.length > 1) {
    const normalizedSearchText = this.searchText
      .replace(/-/g, '')
      .toLowerCase();

    results = this.dataSetList.filter(item =>
      cols.some(col => {
        if (!item[col]) return false;
        return item[col]
          .toString()
          .replace(/-/g, '')
          .toLowerCase()
          .includes(normalizedSearchText);
      })
    );
  }

  this.pagination.filteredSearchResults = results;
  this.refreshPagination();
}



  clearSearchedvalue(e) {
    const searchInput: HTMLInputElement = document.querySelector(
      '[formcontrolname="subSectionIDs"] .ng-input input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = null;
    }
    if (e && e.length) {
      this.getRefByDoctors();
    }
  }
  citiesList: any = [];
  getCitiesList(countryId) {
    this.citiesList = [];
    this.lookupService.getCities({ CountryId: countryId }).subscribe(
      (res: any) => {
        if (res && res.PayLoad && res.PayLoad.length) {
          this.citiesList = res.PayLoad;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  copyToClipboard(text: string): void {
    this.helper.copyMessage(text);
  }

  saveRefByDoctor() {
      const checkedItems = this.pagination.paginatedSearchResults.filter((a) => a.checked);

    if (!checkedItems.length) {
      this.toastr.warning(
        "Please select at least one doctor to proceed.",
        "No Doctor Selected"
      );
      return;
    }

    // Reset invalid flags first
    this.dataSetList.forEach((a) => (a.invalidEmail = false));

    // Validate email for checked doctors
    const invalidEmails = checkedItems.filter(
      (a) => a.Email && !this.validateEmail(a.Email)
    );

    if (invalidEmails.length) {
      invalidEmails.forEach((a) => (a.invalidEmail = true));
      this.toastr.error(
        "Please correct invalid email address(es) before saving.",
        "Invalid Email Found"
      );
      return; // stop submission
    }

    const objParams = {
      tblDoctorList: checkedItems.map((a) => ({
        RefByDoctorsToBeShiftId: a.RefByDoctorsToBeShiftId || null,
        Name: a.Name?.trim() || null,
        PMDCRegNo: a.PMDCNo?.trim() || null,
        Address: a.Address?.trim() || null,
        City: a.City || null,
        MedType: a.MedType || "",
        CreatedBy: this.loggedInUser?.userid || -99,
        ContactNo: a.ContactNo?.trim() || null,
        Email: a.Email?.trim() || null,
      })),
    };

    this.disabledButton = true;
    this.isSpinner = false;

    this.sharedService
      .insertUpdateData(
        API_ROUTES.INSERT_UPDATE_REF_BY_DOCTORS_TO_BE_SHIFT,
        objParams
      )
      .subscribe(
        (res: any) => {
          this.disabledButton = false;
          this.isSpinner = true;
          if (res.StatusCode == 200) {
            if (res.PayLoad[0].Result == 1) {
              this.toastr.success("Doctors saved successfully");
              this.getRefByDoctors();
            } else {
              this.toastr.error("Failed to save the data");
            }
          } else {
            this.toastr.error("Something went wrong");
          }
        },
        (err) => {
          console.log(err);
          this.disabledButton = false;
          this.isSpinner = true;
          this.toastr.error("Connection error");
        }
      );
  }

  // Email validation helper
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

selectAllItems(checked: boolean) {
  // Update all items in the current paginated view
  this.pagination.paginatedSearchResults.forEach((item) => {
    item.checked = checked;
  });
  
  // Also update the main dataSetList to keep state synchronized
  this.updateAllCheckedInDataSetList(checked);
  
  this.countSelectedCheckboxes();
}

// Helper method to update all items in dataSetList
updateAllCheckedInDataSetList(checked: boolean) {
  const paginatedIds = new Set(this.pagination.paginatedSearchResults.map(item => item.RefByDoctorsToBeShiftId));
  
  this.dataSetList.forEach(item => {
    if (paginatedIds.has(item.RefByDoctorsToBeShiftId)) {
      item.checked = checked;
    }
  });
}

  onSelectedDoctor(item) {
  // Find and update the corresponding item in dataSetList
  const index = this.dataSetList.findIndex(d => 
    d.RefByDoctorsToBeShiftId === item.RefByDoctorsToBeShiftId
  );
  
  if (index !== -1) {
    this.dataSetList[index].checked = item.checked;
  }
  
  this.countSelectedCheckboxes();
}

  selectedCheckboxesCount = 0;
  countSelectedCheckboxes() {
  // Count from dataSetList to get total selected
  const selectedCount = this.dataSetList.filter((item) => item.checked).length;
  this.selectedCheckboxesCount = selectedCount;
}
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  clearDataSet() {
    this.dataSetList = [];
    this.filteredDataSetList = [];
  }
  dataSetList: any[] = [];
  filteredDataSetList: any[] = [];
  updateFilteredList() {
    const keyword = this.searchText?.toLowerCase() || "";
    this.filteredDataSetList = this.dataSetList.filter((item) => {
      return (
        item.Name?.toLowerCase().includes(keyword) ||
        item.LocationName?.toLowerCase().includes(keyword)
      );
    });
  }

  onEmailBlur(data: any): void {
    const email = data.Email?.trim();

    // Simple email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // If email is empty or matches the pattern → valid
    if (!email || emailPattern.test(email)) {
      data.isEmailInvalid = false; // remove highlight if valid
    } else {
      data.isEmailInvalid = true; // highlight invalid
      this.toastr.warning(
        "Please enter a valid email address.",
        "Invalid Email"
      );
    }
  }

  onPINInput() {
    const pinControl = this.filterForm.get("byVisitID");
    if (pinControl?.value) {
      pinControl.setValue(pinControl.value.replace(/\D/g, ""), {
        emitEvent: false,
      });
    }
  }
}
