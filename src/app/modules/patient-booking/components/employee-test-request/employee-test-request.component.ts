// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { TestProfileService } from "../../services/test-profile.service";
import { NgxSpinnerService } from "ngx-spinner";
import { LookupService } from "../../services/lookup.service";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService, UserModel } from "src/app/modules/auth";
import { ChangeDetectorRef } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  standalone: false,

  selector: "app-employee-test-request",
  templateUrl: "./employee-test-request.component.html",
  styleUrls: ["./employee-test-request.component.scss"],
})
export class EmployeeTestRequestComponent implements OnInit {
  testList: any[] = [];
  refByDocList: any[] = [{ Name: "Self" }];
  employeesList: any[] = [];
  dependentsList: any[] = [];
  freeTestList: any[] = [];
  previousAmount: any = 0;
  loggedInUser: UserModel;
  Form: FormGroup;
  ActionLabel = "Save";
  disabledButton: boolean = false; 

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle:
      "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?", // 'Are you sure?',
    popoverTitleTests: "Are you <b>sure</b> want to submit ?", // 'Are you sure?',
    popoverMessage: "",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };

  spinnerRefs = {
    TestSection: "TestSection",
    searchEmployee: "searchEmployee",
    refByDocField: "refByDocField",
    B2BDocField: "B2BDocField",
    testProfilesDropdown: "testProfilesDropdown",
    panelsDropdown: "panelsDropdown",
    homeSamplingEmp: "homeSamplingEmp",
    discountCards: "discountCards",
    recentRegs: "recentRegs",
    patientVisits: "patientVisits",
  };

  rdSearchBy = "byCode";
  chkSearchByExactMatch = true;
  selectedTPID: number = null;
  selectedTPIDs: any[] = [];
  totalTPPrice: number = 0;
  discountPercentage = 0;
  discountedCharges = 0;
  discountAmount = 0;
  protocol: string = null;
  patientInstruction: string = null;
  tpParametersForPopover: any[] = [];

  docDefault = true;
  loadedDocuments: any[] = [];

  typeOptions = [
    { label: "Self", value: 0 },
    { label: "On Behalf", value: 1 },
  ];

  constructor(
    private fb: FormBuilder,
    private testProfileService: TestProfileService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {
    this.Form = this.fb.group({
      OnBehalf: [0],
      RequesterUserId: [""],
      RequesterEmpId: [""],
      EmployeeID: [null],
      DependentID: [null],
      RefDoc: [null],
      Items: [[]],
      ReplaceAttachments: [false],
    });
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getEmployeesData();
    this.getRefByDoctors();
    this.getTestProfileList();
    this.getFreeTestSummary(this.loggedInUser?.userid);

    const loggedInUserId = this.loggedInUser?.userid;
    const loggedInEmpId = this.loggedInUser?.empid;

    // Patch logged-in user
    this.Form.patchValue({
      RequesterUserId: loggedInUserId,
      RequesterEmpId: loggedInEmpId,
    });

    // Initial Load (Default = Self)
    this.loadDependentsForUser(loggedInUserId);
    this.loadPreviousAmount(loggedInEmpId);

    // ==============================
    // OnBehalf Change Listener
    // ==============================
    this.Form.get("OnBehalf")?.valueChanges.subscribe((value) => {
      this.Form.get("DependentID")?.reset();
      this.previousAmount = 0;

      if (value === 0) {
        // SELF MODE
        this.loadDependentsForUser(loggedInUserId);
        this.loadPreviousAmount(loggedInEmpId);
      }

      if (value === 1) {
        // ON BEHALF MODE

        const selectedEmpId = this.Form.get("EmployeeID")?.value;

        if (!selectedEmpId) {
          this.dependentsList = [];
          return;
        }

        const selectedEmp = this.employeesList.find(
          (e) => e.EmpId == selectedEmpId,
        );

        if (selectedEmp) {
          this.loadDependentsForUser(selectedEmp.UserId);
          this.loadPreviousAmount(selectedEmp.EmpId);
        }
      }
    });

    // ==============================
    // Employee Dropdown Change
    // ==============================
    this.Form.get("EmployeeID")?.valueChanges.subscribe(
      (selectedEmpId: number) => {
        // Only work in OnBehalf mode
        if (this.Form.get("OnBehalf")?.value !== 1) return;

        if (!selectedEmpId) {
          this.dependentsList = [];
          this.previousAmount = 0;
          return;
        }

        const selectedEmp = this.employeesList.find(
          (e) => e.EmpId == selectedEmpId,
        );

        if (selectedEmp) {
          this.loadDependentsForUser(selectedEmp.UserId);
          this.loadPreviousAmount(selectedEmp.EmpId);
        } else {
          this.dependentsList = [];
          this.previousAmount = 0;
        }
      },
    );
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    console.log("Logged in user info:", this.loggedInUser);
  }

  getEmployeesData() {
    const objParam = {};
    this.lookupService.getNormalEmployeeList(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200 && res.PayLoadDS) {
          let data = res.PayLoadDS.Table;
          try {
            data = JSON.parse(data);
          } catch {}
          this.employeesList = data || [];
        }
      },
      (err) => console.log(err),
    );
  }
  getDependentData(userId: number) {
    const objParam = {
      RequesterUserId: userId,
    };

    this.lookupService.getDependentList(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200 && res.PayLoad) {
          let data = res.PayLoad || [];
          this.dependentsList = data;
          console.log("Dependents List:", this.dependentsList);
        } else {
          this.dependentsList = [];
        }
      },
      (err) => {
        console.log(err);
        this.dependentsList = [];
      },
    );
  }
  loadingPreviousAmount: boolean = false;

  previousVisitTotal: number = 0;
  previousPendingTotal: number = 0;

  loadPreviousAmount(empid: number) {
    if (!empid) {
      this.previousVisitTotal = 0;
      this.previousPendingTotal = 0;
      return;
    }

    this.loadingPreviousAmount = true;

    const objParam = {
      RequesterEmpId: empid,
      AsOfDate: null,
    };

    this.lookupService.getPreviousTotal(objParam).subscribe(
      (res: any) => {
        this.loadingPreviousAmount = false;

        if (res && res.StatusCode === 200 && res.PayLoad) {
          // API returns DataTable in PayLoad. Depending on serialization,
          // it may be an array already, or a JSON string.
          let data = res.PayLoad;

          try {
            if (typeof data === "string") {
              data = JSON.parse(data);
            }
          } catch (ex) {}

          if (Array.isArray(data) && data.length > 0) {
            const row = data[0];

            this.previousVisitTotal = Number(row?.PrevVisitTotal) || 0;
            this.previousPendingTotal = Number(row?.PrevPendingTotal) || 0;
          } else {
            this.previousVisitTotal = 0;
            this.previousPendingTotal = 0;
          }
        } else {
          this.previousVisitTotal = 0;
          this.previousPendingTotal = 0;
        }
      },
      (err) => {
        console.log(err);
        this.loadingPreviousAmount = false;
        this.previousVisitTotal = 0;
        this.previousPendingTotal = 0;
      },
    );
  }

  loadingDependents: boolean = false;

  loadDependentsForUser(userId: number) {
    if (!userId) {
      this.dependentsList = [];
      return;
    }

    this.loadingDependents = true;
    const objParam = {
      RequesterUserId: userId,
    };

    this.lookupService.getDependentList(objParam).subscribe(
      (res: any) => {
        this.loadingDependents = false;
        if (res && res.StatusCode === 200 && res.PayLoad) {
          this.dependentsList = res.PayLoad || [];
          this.cdr.detectChanges();
        } else {
          this.dependentsList = [];
        }
      },
      (err) => {
        console.log(err);
        this.loadingDependents = false;
        this.dependentsList = [];
      },
    );
  }
  getFreeTestSummary(userId: number) {
    console.log("Fetching free test summary for userId:", userId);
    if (!userId) {
      this.freeTestList = [];
      return;
    }

    this.loadingDependents = true;
    const objParam = {
      RequesterUserId: userId,
      DateFrom: null,
      DateTo: null,
      PatientId: null,
      Status: null,
    };
    console.log("objParam", objParam);

    this.lookupService.getFreeTestSummary(objParam).subscribe(
      (res: any) => {
        this.loadingDependents = false;
        if (res && res.StatusCode === 200) {
          this.freeTestList = res.PayLoadDS["Table"] || [];
        } else {
          this.freeTestList = [];
        }
      },
      (err) => {
        console.log(err);
        this.freeTestList = [];
      },
    );
  }

  getRefByDoctors() {
    this.refByDocList = [{ Name: "Self" }];
    this.spinner.show(this.spinnerRefs.refByDocField);
    this.lookupService.getRefByDoctors({}).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.refByDocField);
        if (res && res.StatusCode === 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch {}
          this.refByDocList = data || [{ Name: "Self" }];
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.refByDocField);
        console.log(err);
      },
    );
  }

  ngbFormatterRefBy_input = (x: any) => (x ? x.Name : "");
  ngbFormatterRefBy_output = (x: any) => (x ? x.Name : "");
  ngbSearchRefBy = (text$: Observable<any>) =>
    text$.pipe(
      distinctUntilChanged(),
      map((term) =>
        term.length < 2
          ? [{ Name: "Self" }]
          : this.refByDocList
              .filter((v) => v.Name.toLowerCase().includes(term.toLowerCase()))
              .slice(0, 20),
      ),
    );

  getTestProfileList() {
    this.testList = [];
    const _param = {
      branchId: 1,
      TestProfileCode: null,
      TestProfileName: null,
      panelId: null,
      TPIDs: "",
    };
    this.testProfileService.getTestsByName(_param).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch {}
          this.testList = data || [];
        }
      },
      (err) => console.log(err),
    );
  }

  rdSearchByClick(a: string) {
    this.rdSearchBy = a;
  }

  customSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    if (this.rdSearchBy === "byCode") {
      if (this.chkSearchByExactMatch)
        return item.TestProfileCode.toLowerCase() === term;
      return item.TestProfileCode.toLowerCase().startsWith(term);
    } else {
      return item.TestProfileName.toLowerCase().includes(term);
    }
  };

  testListChanged(e: any) {
    if (!e) return;
    const newTest = this.testList.find((x) => x.TPId == this.selectedTPID);
    if (!newTest) return;

    this.spinner.show(this.spinnerRefs.TestSection);

    this.selectedTPIDs.push(newTest);

    if (e.AssociatedTPIDs) {
      const comm = e.AssociatedTPIDs.split(",");
      comm.forEach((a) => {
        if (!this.selectedTPIDs.find((c) => c.TPId == a)) {
          const associated = this.testList.find((b) => b.TPId == Number(a));
          if (associated) this.selectedTPIDs.push(associated);
        } else {
          this.toastr.info("Already selected");
        }
      });
    }

    this.selectedTPIDs.forEach((element) => {
      element.itemDiscount =
        element.IsDiscountable === 1
          ? (this.discountPercentage * element.TestProfilePrice) / 100
          : 0;
      element.discountedPrice =
        element.IsDiscountable === 1
          ? element.TestProfilePrice - element.itemDiscount
          : element.TestProfilePrice;
    });

    this.totalTPPrice = this.selectedTPIDs.reduce(
      (pv, cv) => pv + cv.TestProfilePrice,
      0,
    );
    this.discountAmount = this.selectedTPIDs.reduce(
      (pv, cv) => pv + cv.itemDiscount,
      0,
    );
    this.calculateDiscountedCharges(this.discountPercentage);

    // Remove from test list
    this.testList = this.testList.filter(
      (o1) => !this.selectedTPIDs.some((o2) => o1.TPId === o2.TPId),
    );

    this.spinner.hide(this.spinnerRefs.TestSection);

    if (e.TypeId === 3) this.getPackageList(e);

    setTimeout(() => (this.selectedTPID = null), 100);
  }

  calculateDiscountedCharges(_discPercentage: number) {
    const totalDiscountable = this.selectedTPIDs
      .filter((x) => x.IsDiscountable)
      .reduce((pv, cv) => pv + cv.TestProfilePrice, 0);
    const totalNonDiscountable = this.selectedTPIDs
      .filter((x) => x.IsDiscountable === 0)
      .reduce((pv, cv) => pv + cv.TestProfilePrice, 0);

    const discWith =
      totalDiscountable - (_discPercentage * totalDiscountable) / 100;
    this.discountedCharges = discWith + totalNonDiscountable;
  }

  getPackageList(e: any) {
    this.spinner.show();
    this.testProfileService
      .getPackageTestsProfiles({
        packageId: e.TPId,
        branchId: null,
        panelId: null,
      })
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res?.StatusCode === 200 && res.PayLoad) {
            let data = res.PayLoad;
            try {
              data = JSON.parse(data);
            } catch {}
            data.forEach((d) => (d.forPkg = e.TPId));
            this.selectedTPIDs = [
              ...this.selectedTPIDs.filter(
                (t) => !data.some((d) => d.TPId === t.TPId),
              ),
              ...data,
            ];
          }
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        },
      );
  }

  showTestDetail(tp: any) {
    this.getParameterByTPID(tp);
    this.getTestProfileProtocolAndPatientInstruction(tp.TPId);
  }

  getParameterByTPID(tp: any) {
    const targetIDs = [
      51, 47, 7, 58, 45, 39, 46, 37, 43, 12, 36, 50, 18, 44, 34, 35, 49, 38, 48,
      25, 29, 62,
    ].map(String);

    if (tp.SubSectionID && targetIDs.includes(tp.SubSectionID.toString())) {
      this.tpParametersForPopover = [
        { Code: tp.TestProfileCode, Name: tp.TestProfileName },
      ];
      return;
    }

    this.tpParametersForPopover = [{ Code: "Loading...", Name: "" }];
    this.testProfileService
      .GetTestsByTestProfileID({ TPId: tp.TPId })
      .subscribe(
        (res: any) => {
          if (res.StatusCode === 200 && res.PayLoad)
            this.tpParametersForPopover = res.PayLoad;
        },
        (err) => {
          this.tpParametersForPopover = [{ Code: "server error", Name: "" }];
          console.log(err);
        },
      );
  }

  getTestProfileProtocolAndPatientInstruction(TPId: number) {
    this.protocol = null;
    this.patientInstruction = null;
    this.testProfileService
      .getTestProfileProtocolAndPatientInstruction({ TPId })
      .subscribe(
        (res: any) => {
          if (res.StatusCode === 200 && res.PayLoad?.length) {
            this.protocol = res.PayLoad[0].Protocol;
            this.patientInstruction = res.PayLoad[0].PatientInstruction;
          }
        },
        (err) => console.log(err),
      );
  }

  removeItem(TPId: number) {
    const removed = this.selectedTPIDs.find((x) => x.TPId === TPId);
    if (removed) this.testList.push(removed);

    this.selectedTPIDs = this.selectedTPIDs.filter(
      (x) => x.TPId !== TPId && x.forPkg !== TPId,
    );

    this.totalTPPrice = this.selectedTPIDs.reduce(
      (pv, cv) => pv + cv.TestProfilePrice,
      0,
    );
    this.discountAmount = this.selectedTPIDs.reduce(
      (pv, cv) => pv + cv.itemDiscount,
      0,
    );
    this.calculateDiscountedCharges(this.discountPercentage);
  }

  enforceRange(input: HTMLInputElement): void {
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    else if (value > 100) {
      value = 0;
      this.toastr.warning("Discount percentage should be less than 100");
    }
    input.value = value.toString();
  }

  getLoadedDocs(event: any) {
    this.docDefault = true;
    this.loadedDocuments = Array.isArray(event) ? event : event ? [event] : [];
  }

isloading: boolean = false;

  submitRequest() {
    if (!this.Form.get("DependentID")?.value) {
      this.toastr.warning("Please select dependent");
      return;
    }

    if (!this.selectedTPIDs.length) {
      this.toastr.warning("Please select at least one test");
      return;
    }

    // ===============================
    // Prepare Items Table (Like KBS Example)
    // ===============================
    const Items = this.selectedTPIDs.map((tp) => ({
      TPId: tp.TPId,
      UnitPrice: tp.TestProfilePrice || 0,
    }));

    // ===============================
    // Determine RequesterEmpId
    // ===============================
    let requesterEmpId = this.loggedInUser?.empid;
    let requesterUserid = this.loggedInUser?.userid;

    if (this.Form.get("OnBehalf")?.value === 1) {
      const selectedEmpId = this.Form.get("EmployeeID")?.value;

      const selectedEmp = this.employeesList.find(
        (e) => e.EmpId == selectedEmpId,
      );

      if (selectedEmp) {
        requesterEmpId = selectedEmp.EmpId;
        requesterUserid = selectedEmp.UserId;
      }
    }

    // ===============================
    // Prepare Final Params Object
    // ===============================
    const params = {
      RequestId: null, // INSERT
      RequestNo: null,
      RequesterUserId: requesterUserid,
      RequesterEmpId: requesterEmpId,
      CreatedByUserId: this.loggedInUser?.userid,
      OnBehalf: this.Form.get("OnBehalf")?.value === 1,
      PatientId: this.Form.get("DependentID")?.value,
      VisitId: null,
      RefByDocId: this.Form.get("RefDoc")?.value?.RefId || null,
      RegLocId: this.loggedInUser?.locationid, // change if dynamic
      Remarks: null,
      PolicyId: null,
      ReplaceAttachments: this.Form.get("ReplaceAttachments")?.value,
      Items,
      Attachments: this.formatUploadedDocsData(),
    };

    console.log("Final Insert Params:", params);
 
    this.spinner.show();
    this.isloading = true;
    this.lookupService.InsertUpdateFreeTestRequest(params).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.isloading = false;

        if (res && res.StatusCode === 200) {
          this.toastr.success("Request submitted successfully");
          this.clearLoadedDocs();
          this.getFreeTestSummary(this.loggedInUser?.userid);
          // Optional reset
          this.Form.reset({
            OnBehalf: 0,
            ReplaceAttachments: false,
          });

          this.selectedTPIDs = [];
          this.totalTPPrice = 0;
          this.previousVisitTotal = 0;
          this.previousPendingTotal = 0;
        } else {
          this.toastr.error(res.ErrorDetails);
        }
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
        this.toastr.error(err.ErrorDetails);
      },
    );
  }

  formatUploadedDocsData(): any[] {
    const docs = (this.loadedDocuments || []).filter((d) => !d.docId);

    return docs.map((d, index) => {
      // 1) Base64 (strip prefix if present)
      const raw = (d.data || d.base64 || d.FtpPath || d.Path || "").toString();
      const base64String = raw.includes(",") ? raw.split(",")[1] : raw;

      // 2) Get original filename from whatever property your uploader provides
      // Common variants: fileName, name, FileName, filename
      const originalName = (
        d.fileName ||
        d.name ||
        d.FileName ||
        d.filename ||
        ""
      )
        .toString()
        .trim();

      // 3) Extract extension from filename OR fallback to mime type
      let extension = "";
      if (originalName && originalName.includes(".")) {
        extension = originalName.split(".").pop()!.trim().toLowerCase();
      } else if (d.fileType && d.fileType.includes("/")) {
        // e.g. image/jpeg => jpeg
        extension = d.fileType.split("/")[1].toLowerCase();
        if (extension === "jpeg") extension = "jpg";
      }

      // 4) Final filename (must not be empty)
      // Use originalName if available; otherwise generate one
      const finalFileName = originalName
        ? originalName
        : `FreeTest_${Date.now()}_${index + 1}${extension ? "." + extension : ""}`;

      // 5) MimeType
      const mimeType = (
        d.fileType ||
        d.MimeType ||
        "application/octet-stream"
      ).toString();

      return {
        MimeType: mimeType,
        // IMPORTANT: send only base64 data here
        FtpPath: base64String || "",
        FileName: finalFileName, // ✅ now filled
        FileExtension: extension || "", // ✅ now filled
      };
    });
  }
  selectedFile: File | null = null;
  clearLoadedDocs(): void {
    this.loadedDocuments = [];
    // Notify the child component by passing null
    this.getLoadedDocs([]);
    this.docDefault = false;
    this.selectedFile = null;
  }



 
selectedRequest: any = null;
openRequestPopup(content: any, row: any) {
  this.selectedRequest = row;
  this.modalService.open(content, {
    size: 'xl',
    centered: true,
    backdrop: 'static',
    scrollable: true
  });
}

cancelRemarks: string = '';
cancelLoading: boolean = false;

normalizeStatus(status: string): string {
  return (status || '').toUpperCase().trim();
}

hasVisit(request: any): boolean {
  return !!request?.VisitId && Number(request.VisitId) > 0;
}

isRejectedRequest(request: any): boolean {
  return this.normalizeStatus(request?.Status) === 'REJECTED';
}

isCancelledRequest(request: any): boolean {
  return this.normalizeStatus(request?.Status) === 'CANCELLED';
}

isAvailedRequest(request: any): boolean {
  return this.normalizeStatus(request?.Status) === 'AVAILED';
}

isApprovedRequest(request: any): boolean {
  return this.normalizeStatus(request?.Status) === 'APPROVED';
}

isPendingLikeRequest(request: any): boolean {
  const status = this.normalizeStatus(request?.Status);
  return status === 'PENDING' || status === 'IN_APPROVAL';
}

isApprovedWithoutVisit(request: any): boolean {
  return this.isApprovedRequest(request) && !this.hasVisit(request);
}

isApprovedWithVisit(request: any): boolean {
  return this.isApprovedRequest(request) && this.hasVisit(request);
}

canShowCancelForm(request: any): boolean {
  if (!request) return false;

  if (this.isRejectedRequest(request)) return false;
  if (this.isCancelledRequest(request)) return false;
  if (this.isAvailedRequest(request)) return false;
  if (this.isApprovedWithVisit(request)) return false;

  if (this.isPendingLikeRequest(request)) return true;
  if (this.isApprovedWithoutVisit(request)) return true;

  return false;
}

cancelFreeTestRequest(): void {
  if (!this.selectedRequest?.RequestId || !this.selectedRequest?.RequestNo) {
    this.toastr.warning('Invalid request selected.');
    return;
  }

  if (!this.canShowCancelForm(this.selectedRequest)) {
    return;
  }

  const objParam = {
    RequestId: this.selectedRequest?.RequestId,
    RequestNo: this.selectedRequest?.RequestNo,
    ActingUserId: this.loggedInUser?.userid,
    CancelRemarks: this.cancelRemarks?.trim() || null
  };

  this.cancelLoading = true;
  console.log("Cancel Request Params:", objParam);

  this.lookupService.cancelFreeTestRequest(objParam).subscribe(
    (res: any) => {
      this.cancelLoading = false;

      if (res && res.StatusCode === 200) {
        this.toastr.success(res.Message || 'Request cancelled successfully.');

        this.selectedRequest.Status = 'CANCELLED';
        this.selectedRequest.CurrentApprovalStatus = 'CANCELLED';
        this.selectedRequest.CancelRemarks = objParam.CancelRemarks;
        this.getFreeTestSummary(this.loggedInUser?.userid);
        if (res.PayLoad) {
          this.freeTestList = Array.isArray(res.PayLoad) ? res.PayLoad : [];
        }

        this.cancelRemarks = '';
      } else {
        this.toastr.warning(res?.Message || 'Unable to cancel request.');
      }
    },
    (err) => {
      this.cancelLoading = false;
      this.toastr.error(err?.error?.ErrorDetails || err?.error?.Message || 'Failed to cancel request.');
    }
  );
}

getStatusClass(status: string): string {
  const s = (status || '').toUpperCase();

  switch (s) {
    case 'PENDING':
      return 'badge-warning';
    case 'IN_APPROVAL':
      return 'badge-info';
    case 'APPROVED':
      return 'badge-success';
    case 'REJECTED':
      return 'badge-danger';
    case 'CANCELLED':
      return 'badge-danger';
    case 'AVAILED':
      return 'badge-primary';
    default:
      return 'badge-secondary';
  }
}

getStatusIcon(status: string): string {
  const s = (status || '').toUpperCase();

  switch (s) {
    case 'PENDING':
    case 'IN_APPROVAL':
      return 'fa fa-clock';
    case 'APPROVED':
      return 'fa fa-check';
    case 'REJECTED':
      return 'fa fa-times';
    case 'CANCELLED':
      return 'fa fa-ban';
    case 'AVAILED':
      return 'fa fa-stethoscope';
    default:
      return 'fa fa-info-circle';
  }
}

}