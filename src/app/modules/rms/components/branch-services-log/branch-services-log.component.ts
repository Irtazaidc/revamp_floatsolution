// @ts-nocheck
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { UserModel, AuthService } from "src/app/modules/auth";
import * as ExcelJS from "exceljs";
import { HelperService } from "src/app/modules/shared/helpers/helper.service";
import { ActivatedRoute } from "@angular/router";
type AttachItem = {
  id?: number | null; // existing file id if any (backend)
  file?: File | null; // File object for new uploads
  name: string;
  type: "image" | "pdf" | "video" | "audio" | "other";
  preview?: string | null; // dataURL or blob URL for preview
  size?: number;
  sizeReadable?: string;
  isNew: boolean; // true if newly added in this session
  remark?: string | null; // only for new items
  url?: string | null; // existing file url for download/preview
};

@Component({
  standalone: false,

  selector: "app-branch-services-log",
  templateUrl: "./branch-services-log.component.html",
  styleUrls: ["./branch-services-log.component.scss"],
})
export class BranchServicesLogComponent implements OnInit {
  BranchesList: any[] = [];
  ServicessList: any[] = [];
  servicesList: any[] = [];
  spinnerRefs = { listSection: "listSection" };
  disabledButton = false;
  isSpinner = true;
  searchServiceText = "";
  loggedInUser: UserModel;
  ActionLabel = "Save";

  serviceConfigForm: FormGroup;
  showLocationSummary = false;
  selectedLocation: any = null;
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

  constructor(
    private fb: FormBuilder,
    private lookupService: LookupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private excelService: ExcelService,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private helper: HelperService,
    private route: ActivatedRoute
  ) {
    this.serviceConfigForm = this.fb.group(
      {
        LocID: [null],
        DKBSServicesID: [null],
      },
      { validators: [this.locationOrServiceValidator] }
    );
  }

  ngOnInit(): void {
    this.getDKBSServices();
    this.getKBSBranch();
    this.loadLoggedInUserInfo();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  locationOrServiceValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const { LocID, DKBSServicesID } = control.value;
    if (!LocID && !DKBSServicesID) return { requireOne: true };
    return null;
  }

  getKBSBranch() {
    this.isSpinner = true;
    let params = {
      LocIDs: -1
    };
    this.lookupService.getKBSBranche(params).subscribe({
      next: (res: any) => {
        this.isSpinner = false;
        if (res.StatusCode === 200) this.BranchesList = res.PayLoad;
        else this.toastr.error("Something Went Wrong");
      },
      error: () => {
        this.isSpinner = false;
        this.toastr.error("Connection Error");
      },
    });
  }

  getDKBSServices() {
    this.spinner.show(this.spinnerRefs.listSection);
    this.lookupService.getKBSServices({}).subscribe({
      next: (res: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (res.StatusCode === 200) this.ServicessList = res.PayLoad;
        else this.toastr.error("Something went wrong");
      },
      error: () => {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error("Connection Error");
      },
    });
  }

  getBranchServices() {
    if (this.serviceConfigForm.invalid) {
      this.toastr.warning("Please select at least one: Location or Service");
      this.servicesList = []; // <-- Clear table
      this.selectedLocation = null; // <-- Clear summary
      this.showLocationSummary = false;
      return;
    }

    const { LocID, DKBSServicesID } = this.serviceConfigForm.getRawValue();
    this.lookupService
      .getKBSBranchServices({ LocID, DKBSServicesID })
      .subscribe({
        next: (res: any) => {
          if (res.StatusCode === 200) this.servicesList = res.PayLoad || [];
          else this.toastr.error("Something went wrong");

          // SHOW SUMMARY ONLY ON SEARCH BUTTON CLICK
          if (LocID) {
            this.selectedLocation = this.BranchesList.find(
              (b) => b.LocId === LocID
            );
            this.showLocationSummary = !!this.selectedLocation;
          } else {
            this.selectedLocation = null;
            this.showLocationSummary = false;
          }
        },
        error: () => this.toastr.error("Connection Error"),
      });
  }

  onLocationChange() {
    // summary row will not appear here anymore
  }

  onServiceChange() {
    if (
      this.serviceConfigForm.get("DKBSServicesID")?.value &&
      !this.serviceConfigForm.get("LocID")?.value
    ) {
      this.showLocationSummary = false;
      this.selectedLocation = null;
    }
  }

  telephoneExtensionPopupRef: NgbModalRef;

  @ViewChild("telephoneExtensionModal") telephoneExtensionModal;
  telephoneExtensionProcess() {
    this.telephoneExtensionPopupRef = this.appPopupService.openModal(
      this.telephoneExtensionModal,
      { backdrop: "static", size: "xl" }
    );
  }

  exportAsExcel() {
    if (!this.servicesList || this.servicesList.length === 0) {
      this.toastr.error("Cannot export empty table");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Branch Services");

    let currentRow = 1;

    /* =========================
     SUMMARY SECTION WITH STYLING
  ========================= */
    if (this.showLocationSummary && this.selectedLocation) {
      // Summary Header
      worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
      const summaryHeader = worksheet.getCell(`A${currentRow}`);
      summaryHeader.value = "BRANCH SUMMARY";
      summaryHeader.font = { bold: true, size: 14, color: { argb: "FFFFFF" } };
      summaryHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" }, // Blue
      };
      summaryHeader.alignment = { horizontal: "center", vertical: "middle" };
      currentRow++;

      // Summary Data
      const summaryData = [
        ["Selected Location", this.selectedLocation.LocCode || "-"],
        ["Address", this.selectedLocation.Address || "-"],
        [
          "Manager / Receptionist Name",
          this.selectedLocation.ManagerAndReceptionistName || "-",
        ],
        [
          "Manager / Receptionist Extension",
          this.selectedLocation.ManagerAndReceptionistExt || "-",
        ],
        ["Branch Timing", this.selectedLocation.TimingHead || "-"],
      ];

      summaryData.forEach(([label, value]) => {
        const labelCell = worksheet.getCell(`A${currentRow}`);
        labelCell.value = label;
        labelCell.font = { bold: true, color: { argb: "2F5597" } };
        labelCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D9E1F2" }, // Light blue
        };

        const valueCell = worksheet.getCell(`B${currentRow}`);
        valueCell.value = value;
        valueCell.font = { color: { argb: "1F3864" } };

        currentRow++;
      });

      // Spacer row
      currentRow += 2;
    }

    /* =========================
     TABLE HEADERS WITH STYLING
  ========================= */
    const headers = ["Sr No", "Service Name"];
    if (!this.showLocationSummary) {
      headers.push("Location");
    }
    headers.push(
      "Extension",
      "Operational Time",
      "Status",
      "Service Detail",
      "Special Remarks"
    );

    // Header row styling
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "7030A0" }, // Purple
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Auto-fit column widths
    headers.forEach((header, index) => {
      worksheet.getColumn(index + 1).width = Math.max(15, header.length + 5);
    });

    // Style for Service Detail and Special Remarks columns (make them wider)
    const detailColIndex = headers.indexOf("Service Detail") + 1;
    const remarksColIndex = headers.indexOf("Special Remarks") + 1;
    worksheet.getColumn(detailColIndex).width = 40;
    worksheet.getColumn(remarksColIndex).width = 40;

    currentRow++;

    /* =========================
     TABLE DATA WITH ALTERNATING ROW COLORS
  ========================= */
    this.servicesList.forEach((item, index) => {
      const row = worksheet.getRow(currentRow);
      const isEvenRow = index % 2 === 0;

      // Alternate row colors
      const rowColor = isEvenRow ? "FFFFFF" : "F2F2F2";

      let colIndex = 1;
      row.getCell(colIndex++).value = index + 1; // Sr No
      row.getCell(colIndex++).value = item.ServiceName || "-"; // Service Name

      if (!this.showLocationSummary) {
        row.getCell(colIndex++).value = item.LocCode || "-"; // Location
      }

      row.getCell(colIndex++).value = item.Extension || "-"; // Extension
      row.getCell(colIndex++).value = this.stripHtml(item.OptTiming); // Operational Time

      // Status with conditional formatting
      const statusCell = row.getCell(colIndex++);
      const isActive =
        item.ServiceStatus?.toString().toLowerCase().trim() === "active";
      statusCell.value = isActive ? "Active" : "Inactive";
      statusCell.font = {
        color: { argb: isActive ? "00B050" : "FF0000" }, // Green for Active, Red for Inactive
        bold: isActive,
      };

      row.getCell(colIndex++).value = this.stripHtml(item.ServiceDetail); // Service Detail
      row.getCell(colIndex++).value = this.stripHtml(item.SpecialRemarks); // Special Remarks

      // Apply styling to all cells in the row
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowColor },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "D9D9D9" } },
          left: { style: "thin", color: { argb: "D9D9D9" } },
          bottom: { style: "thin", color: { argb: "D9D9D9" } },
          right: { style: "thin", color: { argb: "D9D9D9" } },
        };
        // Wrap text for detail columns
        // if (cell.col === detailColIndex || cell.col === remarksColIndex) {
        //   cell.alignment = { wrapText: true };
        // }
      });

      currentRow++;
    });

    /* =========================
     ADD TOTALS ROW
  ========================= */
    const totalRow = worksheet.getRow(currentRow);
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF2CC" }, // Light yellow
    };

    const totalCell = worksheet.getCell(currentRow, 1);
    totalCell.value = `Total Services: ${this.servicesList.length}`;
    totalCell.font = { bold: true, color: { argb: "BF9000" } };
    totalCell.alignment = { horizontal: "center" };

    // Merge cells for the total row
    worksheet.mergeCells(currentRow, 1, currentRow, headers.length);

    /* =========================
     EXPORT FILE
  ========================= */
    workbook.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        "Branch_Services_" + new Date().toISOString().split("T")[0] + ".xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  stripHtml(value: string): string {
    if (!value) {
      return "-";
    }

    // First decode HTML entities
    const decodedString = this.decodeHtmlEntities(value);

    // Remove HTML tags but preserve line breaks
    const withoutTags = decodedString
      .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newline
      .replace(/<\/p>/gi, "\n") // Convert </p> to newline
      .replace(/<\/div>/gi, "\n") // Convert </div> to newline
      .replace(/<[^>]+>/g, "") // Remove all other HTML tags
      .trim();

    // Replace multiple spaces with single space (but preserve intentional spaces)
    return withoutTags.replace(/\s+/g, " ");
  }
  // Alternative if you don't want to use DOM element:
  decodeHtmlEntities(text: string): string {
    const entities: { [key: string]: string } = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&ndash;": "–",
      "&mdash;": "—",
      "&hellip;": "…",
      "&copy;": "©",
      "&reg;": "®",
      "&#38;": "&",
      "&#160;": " ",
    };

    return text.replace(/&[a-z0-9#]+;/gi, (match) => {
      return entities[match] || match;
    });
  }
}
