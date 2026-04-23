// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { AuthService, UserModel } from "src/app/modules/auth";

@Component({
  standalone: false,

  selector: "app-kbs-services-config",
  templateUrl: "./kbs-services-config.component.html",
  styleUrls: ["./kbs-services-config.component.scss"],
})
export class KbsServicesConfigComponent implements OnInit {
  ActionLabel = "Save";
  disabledButton = false; 
  isSpinner = true; 
  Services: any;
  searchBranchText = "";
  loggedInUser: UserModel;
  spinnerRefs = {
    listSection: "listSection",
    testListSection: "testListSection",
    machineFormSection: "machineFormSection",
    tableFormSection: "tableFormSection",
    radTable: "radTable",
    searchTable: "searchTable",
  };
  services: { ServiceName: string; order: number; DKBSServicesID: string }[] =
    [];
  BranchServicesList: any;
  selectedServiceID: any = null;

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
    private lookupService: LookupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.getDKBSServices();
    this.loadLoggedInUserInfo();
  }

  
  onContentChange(data: any, field: string, event: FocusEvent) {
  const element = event.target as HTMLElement;
  data[field] = element.innerHTML.trim();
}

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  // Modified method to get branch services
  selectedLocId: number | null = null;
  getKBSBranchServicesByServiceID() {
    if (!this.selectedServiceID) {
      this.toastr.warning("Please select a service first");
      return;
    }

    this.isSpinner = true;
    this.disabledButton = true;

    const params = {
      DKBSServicesID: this.selectedServiceID || null,
    };

    this.lookupService.getKBSBranchServicesByServiceID(params).subscribe(
      (res: any) => {
        this.isSpinner = false;
        this.disabledButton = false;

        if (res.StatusCode === 200 && res.PayLoad) {
          // Use the exact property names from API
          this.BranchServicesList = res.PayLoad.map((item: any) => ({
            ...item,
            isEditorLoadedSpecialRemarks: false,
            isEditorLoadedServiceDetail: false,
            Allowed: item.Allowed || 0,
            IsActive: item.IsActive ? 1 : 0,
          }));

          console.log("BranchServicesList:", this.BranchServicesList);
        } else {
          this.BranchServicesList = [];
          this.toastr.error("Something went wrong");
        }
      },
      (err) => {
        this.isSpinner = false;
        this.disabledButton = false;
        console.error(err);
        this.toastr.error("Connection error");
      }
    );
  }

  getDKBSServices() {
    this.spinner.show(this.spinnerRefs.listSection);

    this.lookupService.getKBSServices({}).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);

        if (res.StatusCode === 200 && res.PayLoad) {
          const payload = res.PayLoad || res.Payload;

          console.log("API Response:", payload);

          const sortedServices = payload.sort(
            (a: any, b: any) => (a.Sort ?? 0) - (b.Sort ?? 0)
          );

          this.services = sortedServices.map((s: any, index: number) => ({
            ServiceName: s.ServiceName ?? s.name ?? "",
            order: s.Sort ?? index + 1,
            originalData: s,
            DKBSServicesID: s.DKBSServicesID || s.id || null, // Make sure ID is included
          }));

          console.log("Processed Services:", this.services);
        } else {
          this.toastr.error("Something went wrong");
          this.services = [{ ServiceName: "", order: 1, DKBSServicesID: null }];
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.log(err);
        this.toastr.error("Connection error");
        this.services = [{ ServiceName: "", order: 1, DKBSServicesID: null }];
      }
    );
  }

  // Method to handle service selection
  onServiceSelect(service: any): void {
    if (service && service.DKBSServicesID) {
      this.selectedServiceID = service.DKBSServicesID;
      this.getKBSBranchServicesByServiceID();
    } else {
      this.toastr.warning("Please select a valid service");
    }
  }

  insertUpdateKBSBranchServices() {
    // Get checked rows
    const selectedRows = this.BranchServicesList.filter(
      (row) => row.Allowed === 1
    );

    if (selectedRows.length === 0) {
      this.toastr.warning("Please select at least one branch");
      return;
    }

    // Extract locIDs from checked rows
    const selectedLocIDs = selectedRows.map((row) => row.LocID);
    console.log("Selected LocIDs:", selectedLocIDs); // This will show all checked locIDs

    this.spinner.show(this.spinnerRefs.listSection);

    // Filter only checked rows (same as selectedRows)
    const allowedServices = this.BranchServicesList.filter(
      (item) => item.Allowed === 1
    );

    if (allowedServices.length === 0) {
      this.toastr.warning("Please check at least one service before saving.");
      return;
    }

    // Validate checked rows
    for (let i = 0; i < allowedServices.length; i++) {
      const item = allowedServices[i];

      if (
        !item.Extension ||
        !item.OptTiming ||
        !item.ServiceDetail ||
        !item.SpecialRemarks
      ) {
        this.toastr.warning(`Please fill all fields for the allowed service.`);
        return;
      }
    }

    this.disabledButton = true;
    this.isSpinner = true;

    // Prepare an array for tblKBSBranchServices
    const tblKBSBranchServices = allowedServices.map((fv) => ({
      LocID: fv.LocId, // This is where locID is being used
      DKBSServiceID: fv.DKBSServicesID,
      IsActive: fv.IsActive,
      Extension: fv.Extension,
      OptTiming: fv.OptTiming,
      ServiceDetail: fv.ServiceDetail,
      SpecialRemarks: fv.SpecialRemarks,
    }));

    const params = {
      UserID: this.loggedInUser.userid,
      ServiceOrLocID: this.selectedServiceID,
      IsServiceOrLoc: "S",
      tblKBSBranchServices,
    };

    console.log("Params with LocIDs:", params);

    this.lookupService.insertUpdateKBSBranchServices(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Configuration saved successfully!");
          this.getDKBSServices();
          this.getKBSBranchServicesByServiceID();
          this.spinner.hide(this.spinnerRefs.listSection);
        } else {
          this.toastr.error("Failed to add branch");
        }
      },
      (err) => {
        console.error(err);
        this.toastr.error("Connection error");
      }
    );
  }

  insertUpdateDKBSServices(): void {
    // Quick null checks
    if (!this.loggedInUser?.userid) {
      this.toastr.error("User not found");
      return;
    }

    if (!this.services?.length) {
      this.toastr.warning("No services to save");
      return;
    }

    this.isSpinner = true;
    this.disabledButton = true;

    const tblDKBSServices = this.services
      .filter((service) => service?.ServiceName?.trim())
      .map((service) => ({
        DKBSServiceID: service.DKBSServicesID || 0,
        ServiceName: service.ServiceName.trim(),
        Sort: service.order || 0,
      }));

    if (!tblDKBSServices.length) {
      this.toastr.warning("No valid services to save");
      this.isSpinner = false;
      this.disabledButton = false;
      return;
    }

    const params = {
      UserID: this.loggedInUser.userid,
      tblDKBSServices: tblDKBSServices,
    };

    console.log("Saving services with params:", params);

    this.lookupService.insertUpdateDKBSServices(params).subscribe(
      (res: any) => {
        this.isSpinner = false;
        this.disabledButton = false;
        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Saved successfully!");
          this.getDKBSServices();
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
    this.BranchServicesList = []; // Clear existing branch services when adding a new service
    // Safely calculate the next order number
    const currentOrders = this.services
      .map((s) => s.order)
      .filter((order) => !isNaN(order));
    const newOrder =
      currentOrders.length > 0 ? Math.max(...currentOrders) + 1 : 1;

    this.services.push({
      ServiceName: "",
      order: newOrder,
      DKBSServicesID: null, // Important for selection functionality
    });

    console.log("Added new row with order:", newOrder);
  }

  removeRow(index: number): void {
    if (this.services.length > 1) {
      this.services.splice(index, 1);

      // reorder after delete
      this.services.forEach((s, idx) => (s.order = idx + 1));
    }
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.services, event.previousIndex, event.currentIndex);

    this.services = this.services.map((s, index) => ({
      ...s,
      order: index + 1,
    }));
  }

  get nonEmptyServicesCount(): number {
    return (
      this.services?.filter((s) => s.ServiceName && s.ServiceName.trim() !== "")
        .length || 0
    );
  }

  get totalServicesCount(): number {
    return this.services?.length || 0;
  }
}
