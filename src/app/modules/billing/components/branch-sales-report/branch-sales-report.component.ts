// @ts-nocheck
import { Component, OnInit, ViewChild } from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { PatientService } from "src/app/modules/patient-booking/services/patient.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { HelperService } from "src/app/modules/shared/helpers/helper.service";
import { SharedService } from "src/app/modules/shared/services/shared.service";

@Component({
  standalone: false,

  selector: "app-branch-sales-report",
  templateUrl: "./branch-sales-report.component.html",
  styleUrls: ["./branch-sales-report.component.scss"],
})
export class BranchSalesReportComponent implements OnInit {
  BranchClosingID: any;
  CardTitle = "Branch Closing";
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  ActionLabel = "Add";
  isSpinner = true; //Hide Loader
  selectedDespitId = null
  rowIndex = null;

  patientVisitsPopupRef: NgbModalRef;
  searchTextSales = "";

  @ViewChild("fdoSales") fdoSalesPopup;

  filterForm = this.fb.group({
    DateFrom: [null as any, Validators.required],
    DateTo: [null as any, Validators.required],
    locId: [[] as any[]],
  });

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  spinnerRefs = {
    dataTable: "dataTable",
    closingListSection: "closingListSection",
    closingFormSection: "closingFormSection",
    SalesDataBar: "SalesDataBar",
    FDOsales: "FDOsales",
  };

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to proceed?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };
  allowRemove = false;
  depositList: any = [];
  accountDetails = []
  // {
  //   AccountTitle: '',
  //   EmployeeName: '',
  //   LocCode: '',
  //   Amount: '',
  //   EntryOn: '',
  //   DepositRemarks: '',
  // };
  searchText = "";
  maxDate: any;
  isSubmitted = false;
  GrandTotal = 0;
  Totalcash = 0;
  branchDataList = [];
  BranchClosingDocumentdData = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private auth: AuthService,
    private labTats: LabTatsService,
    private patientService: PatientService,
    private appPopupService: AppPopupService,
    private helper: HelperService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.filterForm.patchValue({
        DateFrom: Conversions.getCurrentDateObject(),
        DateTo: Conversions.getCurrentDateObject(),
        locId: [this.loggedInUser.locationid] as any
      });
      this.getLocationList();
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);

    this.GetAccount();
  }
  clearInitialValue() {
    this.GrandTotal = 0;
    this.Totalcash = 0;
    this.mainChk = false
    this.depositList = [];
    this.accountDetails = [];
    this.closingData = {
      totalAmount: 0,
      Cash: 0,
      CreditCard: 0,
      Others: 0,
    };
    this.BranchClosingDocumentdData = [];
    this.pagination.paginatedSearchResults = [];
  }
  GetBranchClosingDataList() {
    this.clearInitialValue();
    const formValues: any = this.filterForm.getRawValue();
    const spinnerRef = this.spinnerRefs.dataTable;

    if (this.filterForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.DateFrom) ?? null,
      DateTo: Conversions.formatDateObject(formValues.DateTo) ?? null,
      LocIDs: (formValues.locId || []).join(",") || -1,
    };
    this.spinner.show(spinnerRef);
    this.labTats.GetVisitSaleBranchClosingByLocation(objParams).subscribe({
      next: (res: any) => {
        this.spinner.hide(spinnerRef);
        if (res?.StatusCode === 200 && res.PayLoadDS['Table'].length) {
          this.depositList = res.PayLoadDS['Table'] || []
          this.depositList = this.depositList.map((item) => ({
            ...item,
            TotalAmount:
              (item.Cash || 0) + (item.CreditCard || 0) + (item.Others || 0),
          }));
          this.accountDetails = (res.PayLoadDS['Table1'] || []);
          this.selectedDespitId = (res.PayLoadDS['Table2'] || [])
          const documentdData = (res.PayLoadDS['Table2'] || [])
          this.BranchClosingDocumentdData = this.helper.formateImagesData(documentdData, 'DocDirPath')
          this.refreshPagination();
          this.GrandTotal = this.gettotalOfAll();
          this.Totalcash = this.gettotalOfCash();
          this.countClosingData();
        } else {
          this.toastr.info("No Record Found");
          this.depositList = [];
        }
      },
      error: (err) => {
        console.error("Error fetching report:", err);
        this.spinner.hide(spinnerRef);
        this.toastr.error("Connection error");
      },
    });
  }

  loggedInUser: UserModel;

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  branchList = [];
  getLocationList() {
    this.branchList = [];
    const param = {
      UserID: this.loggedInUser.userid || -99,
    };
    this.lookupService.getAllLocationByUserID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          this.branchList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  accountList = []
  GetAccount() {
    this.accountList = [];
    this.lookupService.GetAccount().subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          this.accountList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  mainChk;

  selectAllItems(checked) {
    this.depositList.forEach((sec) => {
      sec.checked = checked;
    });
    this.refreshPagination();
  }

  onSelectedItem(e) {
    const checked: boolean = e.checked;
    // if (checked == true) {
    //   this.isValues = false
    // }
  }

  gettotalOfAll() {
    return this.depositList.reduce(
      (sum, item) =>
        sum + ((item.Cash || 0) + (item.CreditCard || 0) + (item.Others || 0)),
      0
    );
  }
  gettotalOfCash() {
    return this.depositList.reduce((sum, item) => sum + (item.Cash || 0), 0);
  }

  openSalesDetails(event) {
    this.selectedClosingId = event.ClosingId;
    this.selectedClosingDate = event.SaleClosingDate;
    this.selectedUserId = event.UserId;
    this.patientVisitsPopupRef = this.appPopupService.openModal(
      this.fdoSalesPopup,
      { size: "xl" }
    );
    this.getAllSaleByFDO();
  }

  formatAmountWithCommas(value) {
    return value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  fdoSalesDataAll = [];
  selectedClosingId = null;
  selectedClosingDate = null;
  selectedUserId = null;
  getAllSaleByFDO() {
    const formValues = this.filterForm.getRawValue();

    const params = {
      userId: this.selectedUserId, // 2163, // 768 //
      fromDate: moment().subtract(7, "days").format("YYYY-MM-DDT00:00:00.000"), //Conversions.formatDateObject(formValues.DateFrom) ?? null,
      toDate: Conversions.formatDateObject(formValues.DateFrom) ?? null,
      ClosingID: this.selectedClosingId,
    };
    this.fdoSalesDataAll = [];
    this.spinner.show(this.spinnerRefs.SalesDataBar);
    this.patientService.getAllSaleByFDO(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(res);
        if (res.StatusCode == 200) {
          this.fdoSalesDataAll = res.PayLoad || [];
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(err);
      }
    );
  }

  notes = [
    { denomination: 5000, quantity: null, total: 0 },
    { denomination: 1000, quantity: null, total: 0 },
    { denomination: 500, quantity: null, total: 0 },
    { denomination: 100, quantity: null, total: 0 },
    { denomination: 50, quantity: null, total: 0 },
    { denomination: 20, quantity: null, total: 0 },
    { denomination: 10, quantity: null, total: 0 },
    { denomination: 5, quantity: null, total: 0 },
    { denomination: 1, quantity: null, total: 0 },
  ];

  grandTotal = 0;
  closingData = {
    totalAmount: 0,
    Cash: 0,
    CreditCard: 0,
    Others: 0,
  };

  calculateNoteTotals() {
    this.grandTotal = 0;
    for (const note of this.notes) {
      note.total = note.quantity * note.denomination;
      this.grandTotal += note.total;
    }
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ClsoingRemarks = null;
  AccountCode = null;
  Amount = null;

  countClosingData() {
    this.closingData = {
      totalAmount: 0, // Total of all (Cash + CreditCard + Others)
      Cash: 0,
      CreditCard: 0,
      Others: 0,
    };
    // Assuming this.depositList is an array of objects with Cash, CreditCard, and Others properties
    this.depositList.forEach((item) => {
      // Add each type to the respective total
      this.closingData.Cash += item.Cash || 0;
      this.closingData.CreditCard += item.CreditCard || 0;
      this.closingData.Others += item.Others || 0;
    });
    // Calculate the total amount
    this.closingData.totalAmount =
      this.closingData.Cash +
      this.closingData.CreditCard +
      this.closingData.Others;
  }
  isSubmitClosing = false;

  saveBranhClosing() {
    if (!this.pagination.filteredSearchResults || this.pagination.paginatedSearchResults.length < 1) {
      this.toastr.warning("No data available", "Invalid");
      return;
    }
    const formValues = this.filterForm.getRawValue();
    if (!this.AccountCode && !this.Amount && !this.ClsoingRemarks) {
      this.toastr.warning("Please fill the mandatory fields");
      this.isSubmitClosing = true;
      return;
    }

    if ((this.ClsoingRemarks || "").length < 10) {
      this.toastr.warning("Please enter remarks (minimum 10 characters)");
      return;
    }
    const checkedItems = this.depositList.filter((a) => a.checked);
    const docsToSave = this.formatUploadedDocsData().filter(a => !a.docId) || [];
    if (!checkedItems.length) {
      this.toastr.warning("Please select item(s) to update");
      return;
    }
    if (!docsToSave.length) {
      this.toastr.warning("Please select documents to upload");
      return;
    }
    const params = {
      Cash: this.closingData.Cash,
      CreditCard: this.closingData.CreditCard,
      Others: this.closingData.Others,
      LocId: formValues.locId,
      ClosingIDs: checkedItems.map(a => a.ClosingId).join(","),
      CreatedBy: this.loggedInUser.userid || -99,
      tblVisitSaleBranchClosingDeposite: docsToSave.map(a => {
        return {
          VisitSaleBranchClosingDepositeID: null,
          VisitSaleBranchClosingID: null,
          AccountId: parseInt(this.AccountCode, 10),
          Amount: parseInt(this.Amount, 10),
          DepositRemarks: this.ClsoingRemarks,
          DocBase64: a.GDocBase64,
          DocTitle: a.Title,
          DocType: a.GDocFileType,
        }
      }),
    };
    console.log("SaveBranhClosing ~ params:_______", params)
    this.spinner.show(this.spinnerRefs.dataTable);
    this.patientService.InsertBranchSalesClosing(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        console.log(res);
        if (res.StatusCode == 200 && res.PayLoad[0].Result == 1) {
          this.toastr.success("Data saved successfully", 'Success');
          this.GetBranchClosingDataList();
          this.clearLoadedDocs();
        } else {
          this.toastr.error(res.Message, 'Error Saving Data');
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        console.log(err);
      }
    );
  }

  refreshPagination() {
    const mergedData: any[] = [];
    let serialNo = 1;

    const maxLength = Math.max(this.depositList.length, this.accountDetails.length);

    for (let i = 0; i < maxLength; i++) {
      if (this.depositList[i]) {
        mergedData.push({
          ...this.depositList[i],
          rowType: 'deposit',
          serialNo: serialNo++   // only deposit gets a serial number
        });
      }
      if (this.accountDetails[i]) {
        mergedData.push({
          ...this.accountDetails[i],
          rowType: 'account'
        });
      }
    }

    // pagination
    this.pagination.filteredSearchResults = mergedData;
    const dataToPaginate = this.pagination.filteredSearchResults;

    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice(
        (this.pagination.page - 1) * this.pagination.pageSize,
        (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize
      );
  }




  BranchSummaryReport = [];
  getBranchSaleSummary() {
    const formValues: any = this.filterForm.getRawValue();
    if (this.filterForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    this.BranchSummaryReport = [];
    const params = {
      LocId: formValues.locId || null,
      date: Conversions.formatDateObject(formValues.DateFrom) ?? null,
    };
    this.spinner.show(this.spinnerRefs.SalesDataBar);
    this.patientService.getBranchSaleSummaryReport(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(res);
        if (res.StatusCode == 200) {
          this.BranchSummaryReport = res.PayLoad || [];
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(err);
      }
    );
  }


  loadedDocuments: any[];
  docDefault = true;

  clearLoadedDocs() {
    this.loadedDocuments = [];
    this.getLoadedDocs(null);
    this.docDefault = false;
  }

  getLoadedDocs(event) {

    this.docDefault = true;
    this.allowRemove = false;
    this.loadedDocuments = Array.isArray(event) ? event : [event]; // Ensure event is an array

    const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1]; // Get the latest loaded document

    if (latestDoc) {
      const base64String = latestDoc.data; // Your base64 image string
      const binaryData = base64String;
      const sizeInBytes = binaryData.length;
      const sizeInKB = sizeInBytes / 1024;
      // if (sizeInKB > 100) {
      //   this.toastr.warning('Image size should be less than 100KB');
      //   return;
      // }
    }
  }
  formatUploadedDocsData() {
    const docs = [];
    this.loadedDocuments.filter(a => !a.docId).forEach(a => {
      const d = {
        DocId: null,
        Title: a.fileName,
        Remarks: '',
        Doc: null,
        CreatedBy: this.loggedInUser.userid,
        RefId: null,
        DocTypeId: 26,
        GDocBase64: a.data,
        GDocBase64Thumbnail: '',
        GDocFileType: a.fileType,
        DirPath: null
      };
      docs.push(d);
    })

    return docs;
  }

  SAveBranchClosing() {
    const docsToSave = this.formatUploadedDocsData().filter(a => !a.docId) || [];
  }


  setCurrencyNotesNull() {
    this.notes = [
      { denomination: 5000, quantity: null, total: 0 },
      { denomination: 1000, quantity: null, total: 0 },
      { denomination: 500, quantity: null, total: 0 },
      { denomination: 100, quantity: null, total: 0 },
      { denomination: 50, quantity: null, total: 0 },
      { denomination: 20, quantity: null, total: 0 },
      { denomination: 10, quantity: null, total: 0 },
      { denomination: 5, quantity: null, total: 0 },
      { denomination: 1, quantity: null, total: 0 },
    ];

    this.ClsoingRemarks = '';
    this.Amount = null;
    this.AccountCode = null;
  }

  onSelectAllBranches() {
    this.filterForm.patchValue({
      locId: this.branchList.map((a) => a.locId) as any,
    });
  }

  onUnselectAllBranches() {
    this.filterForm.patchValue({
      locId: [] as any,
    });
  }

  selectedImage: string | null = null;

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }

}
