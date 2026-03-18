// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";

@Component({
  standalone: false,

  selector: "app-kbs-ticker-config",
  templateUrl: "./kbs-ticker-config.component.html",
  styleUrls: ["./kbs-ticker-config.component.scss"],
})
export class KbsTickerConfigComponent implements OnInit {
  isSpinner: boolean = true; //Hide Loader
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  editForm!: FormGroup;
  loggedInUser: UserModel;
  spinnerRefs = {
    dataTable: "dataTable",
  };
  ActionLabel = "Save";
  searchTickerText = "";
  activeTickerList: any;
  archiveTickerList: any;

  CategoryList: any;

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle:
      "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?", // 'Are you sure?',
    popoverTitleTests: "Are you <b>sure</b> want to save ?", // 'Are you sure?',
    popoverMessage: "",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };
  removedIDs: number[] = [];

  categories: { CategoryName: string; DKBSTickerCategoryID: string }[] = [];
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getActiveKBSTicker();
    this.getArchiveKBSTicker();
    this.getKBSTickerCategory();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  onContentChange(data: any, field: string, event: FocusEvent) {
  const element = event.target as HTMLElement;
  let html = element.innerHTML.trim();

  // Replace &nbsp; with normal spaces
  html = html.replace(/&nbsp;/g, ' ');

  // Convert <br> to newline
  html = html.replace(/<br\s*\/?>/gi, '\n');

  // Convert <div>…</div> used for line breaks to newline
  html = html.replace(/<div>(.*?)<\/div>/gi, (match, p1) => {
    return p1 ? p1 + '\n' : '\n';
  });

  // Remove any leftover HTML tags
  html = html.replace(/<[^>]+>/g, '');

  data[field] = html;
}
limitLength(event: any, max: number) {
  const element = event.target as HTMLElement;
  let text = element.innerText;

  // Hard stop: prevent typing beyond max
  if (text.length > max) {
    // Trim text immediately
    text = text.substring(0, max);
    element.innerText = text;

    // Move cursor to end after trimming
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

  getActiveKBSTicker() {
    let params = {
       ActiveOnly : 1 // Fetch active tickers
    };
    this.isSpinner = false;

    this.lookupService.getKBSTickerData(params).subscribe(
      (res: any) => {
        this.disabledButton = false;
        this.isSpinner = true;

        if (res.StatusCode == 200) {
          // Receive list
          let list = res.PayLoad;

          // Convert dates for datepicker
          this.activeTickerList = list.map((item: any) => ({
            ...item,
            StartDate: this.convertToNgb(item.StartDate),
            EndDate: this.convertToNgb(item.EndDate),
          }));
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        this.isSpinner = true;
        console.log(err);
        this.toastr.error("Connection error");
      }
    );

    this.spinner.hide();
  }
  getArchiveKBSTicker() {
    let params = {
      ActiveOnly : 0 // Fetch archived tickers
    };
    this.isSpinner = false;

    this.lookupService.getKBSTickerData(params).subscribe(
      (res: any) => {
        this.disabledButton = false;
        this.isSpinner = true;

        if (res.StatusCode == 200) {
          // Receive list
          let list = res.PayLoad;

          // Convert dates for datepicker
          this.archiveTickerList = list.map((item: any) => ({
            ...item,
            isSelected: false, // For selection in archive list
            StartDate: this.convertToNgb(item.StartDate),
            EndDate: this.convertToNgb(item.EndDate),
          }));
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        this.isSpinner = true;
        console.log(err);
        this.toastr.error("Connection error");
      }
    );

    this.spinner.hide();
  }

  convertToNgb(dateString: string) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }

  convertFromNgb(date: any) {
    if (!date) return null;
    return `${date.year}-${("0" + date.month).slice(-2)}-${(
      "0" + date.day
    ).slice(-2)}T00:00:00`;
  }

  onNonExpiryChange(data: any) {
    if (data.NonExpiry) {
      data.EndDate = null; // Clear EndDate if NonExpiry is checked
    }
  }

  getKBSTickerCategory() {
    let params = {};
    this.isSpinner = false;

    this.lookupService.getKBSTickerCategory(params).subscribe(
      (res: any) => {
        this.disabledButton = false;
        this.isSpinner = true;

        if (res.StatusCode == 200) {
          this.categories = res.PayLoad;
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        this.isSpinner = true;
        console.log(err);
        this.toastr.error("Connection error");
      }
    );

    this.spinner.hide();
  }

  insertUpdateActiveKBSTickerConfiguration() {
    if (!this.loggedInUser?.userid) {
      this.toastr.error("User not found");
      return;
    }
     for (let item of this.activeTickerList) {
    const start = this.convertFromNgb(item.StartDate);
    const end = item.NonExpiry ? null : this.convertFromNgb(item.EndDate);

    if (!item.NonExpiry && start && end && new Date(end) < new Date(start)) {
      this.toastr.error("End Date cannot be earlier than Start Date");
      return;   // ❌ STOP saving
    }
  }

    this.isSpinner = true;
    this.disabledButton = true;

    // Prepare payload
    const params = {
      UserID: this.loggedInUser.userid,
      tblKBSTicker: this.activeTickerList.map((item: any) => ({
        ...item,
        StartDate: this.convertFromNgb(item.StartDate),
        EndDate: item.NonExpiry ? null : this.convertFromNgb(item.EndDate),
      })),
    };

    console.log("Saving Tickers:", params);

    this.lookupService.insertUpdateKBSTicker(params).subscribe(
      (res: any) => {
        this.isSpinner = false;
        this.disabledButton = false;

        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Saved successfully!");
          this.getActiveKBSTicker(); // Reload list
        } else {
          this.toastr.error(res?.Message || "Save failed");
        }
      },
      (err) => {
        this.isSpinner = false;
        this.disabledButton = false;
        this.toastr.error("Save failed");
        console.error(err);
      }
    );
  }

 onRowSelectChange(row: any) {
  // No logic required yet — HTML handles enabling/disabling
}
  insertUpdateArchiveKBSTickerConfiguration() {
  const selectedRows = this.archiveTickerList.filter((x: any) => x.isSelected);

  if (selectedRows.length === 0) {
    this.toastr.warning("Please select at least one row to update.");
    return;
  }

   for (let item of this.archiveTickerList) {
    const start = this.convertFromNgb(item.StartDate);
    const end = item.NonExpiry ? null : this.convertFromNgb(item.EndDate);

    if (!item.NonExpiry && start && end && new Date(end) < new Date(start)) {
      this.toastr.error("End Date cannot be earlier than Start Date");
      return;   // ❌ STOP saving
    }
  }
  

  this.isSpinner = true;
  this.disabledButton = true;

  const params = {
    UserID: this.loggedInUser.userid,
    tblKBSTicker: selectedRows.map((item: any) => ({
      ...item,
      TickerID:  0,
      StartDate: this.convertFromNgb(item.StartDate),
      EndDate: item.NonExpiry ? null : this.convertFromNgb(item.EndDate),
    })),
  };

  this.lookupService.insertUpdateKBSTicker(params).subscribe(
    (res: any) => {
      this.isSpinner = false;
      this.disabledButton = false;

      if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
        this.toastr.success("Saved successfully!");
        this.getArchiveKBSTicker();
        this.getActiveKBSTicker();
        console.log("Updated Archive Tickers:", params);
      } else {
        this.toastr.error(res?.Message || "Save failed");
      }
    },
    (err) => {
      this.isSpinner = false;
      this.disabledButton = false;
      this.toastr.error("Save failed");
    }
  );
}

  insertUpdateKBSTickerCategory(): void {
    if (!this.loggedInUser?.userid) {
      this.toastr.error("User not found");
      return;
    }

    if (!this.categories?.length) {
      this.toastr.warning("No categories to save");
      return;
    }

    this.isSpinner = true;
    this.disabledButton = true;

    // Prepare categories to save
    const tblDKBSTickerCategory = this.categories
      .filter((c) => c.CategoryName?.trim())
      .map((c) => ({
        DKBSTickerCategoryID: c.DKBSTickerCategoryID ?? 0,
        CategoryName: c.CategoryName.trim(),
      }));

    if (!tblDKBSTickerCategory.length) {
      this.toastr.warning("No valid categories to save");
      this.isSpinner = false;
      this.disabledButton = false;
      return;
    }

    // Prepare final payload
    const params = {
      UserID: this.loggedInUser.userid,
      tblDKBSTickerCategory: tblDKBSTickerCategory,
      removedCategoryIDs: this.removedIDs, // 👈 send deleted IDs
    };

    console.log("Saving Categories:", params);

    this.lookupService.insertUpdateDKBSTickerCategory(params).subscribe(
      (res: any) => {
        this.isSpinner = false;
        this.disabledButton = false;

        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Saved successfully!");

          // Clear deleted IDs after successful save
          this.removedIDs = [];

          // Reload list
          this.getKBSTickerCategory();
        } else {
          this.toastr.error(res?.Message || "Save failed");
        }
      },
      (err) => {
        this.isSpinner = false;
        this.disabledButton = false;
        this.toastr.error("Save failed");
        console.error(err);
      }
    );
  }

  addRow(): void {
    this.categories.push({
      CategoryName: "", // Empty for new rows
      DKBSTickerCategoryID: null, // This marks it as a new category
    });

    console.log("Added new row");
  }

  addNewTicker(): void {
    const newTicker = {
      KBSTickerID: 0,
      Title: "",
      Details: "",
      CategoryID: null,
      StartDate: null,
      EndDate: null,
      NonExpiry: false,
      IsActive: true,
    };
    this.activeTickerList = [newTicker, ...this.activeTickerList];
  }
  cancelNewTicker(): void {
    this.activeTickerList = this.activeTickerList.filter(
      (ticker) => ticker.KBSTickerID !== 0
    );
  }

  // Method to check if a category is new
  isNewCategory(cat: any): boolean {
    return cat.DKBSTickerCategoryID === null; // Fixed property name
  }

  // Optional: Validation method
  validateCategoryName(cat: any): void {
    if (cat.CategoryName && cat.CategoryName.trim() === "") {
      // Handle empty category name validation
      console.warn("Category name cannot be empty");
    }
  }

  removeRow(index: number): void {
    const removed = this.categories[index];

    // If it's an existing category, store it for deletion
    if (removed?.DKBSTickerCategoryID) {
      this.removedIDs.push(Number(removed.DKBSTickerCategoryID));
    }

    this.categories.splice(index, 1);
  }

  deleteActiveKBSTicker(tickerID: number): void {
    if (!this.loggedInUser?.userid) {
      this.toastr.error("User not found");
      return;
    }

    const params = {
      UserID: this.loggedInUser.userid,
      KBSTickerID: tickerID,
    };

    this.lookupService.deleteKBSTicker(params).subscribe(
      (res: any) => {
        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Deleted successfully!");
          this.getActiveKBSTicker(); // Refresh list
        } else {
          this.toastr.error(res?.Message || "Delete failed");
        }
      },
      (err) => {
        this.toastr.error("Delete failed");
        console.error(err);
      }
    );
  }
  deleteArchiveKBSTicker(tickerID: number): void {
    if (!this.loggedInUser?.userid) {
      this.toastr.error("User not found");
      return;
    }

    const params = {
      UserID: this.loggedInUser.userid,
      KBSTickerID: tickerID,
    };

    this.lookupService.deleteKBSTicker(params).subscribe(
      (res: any) => {
        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Deleted successfully!");
          this.getActiveKBSTicker(); // Refresh list
        } else {
          this.toastr.error(res?.Message || "Delete failed");
        }
      },
      (err) => {
        this.toastr.error("Delete failed");
        console.error(err);
      }
    );
  }

  get nonEmptyCategoriesCount(): number {
    return (
      this.categories?.filter(
        (s) => s.CategoryName && s.CategoryName.trim() !== ""
      ).length || 0
    );
  }

  get totalServicesCount(): number {
    return this.categories?.length || 0;
  }
}
