// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { forkJoin } from "rxjs";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { QuestionnaireService } from "src/app/modules/ris/services/questionnaire.service";
import { RISCommonService } from "src/app/modules/ris/services/ris-common.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { FilterByKeyPipe } from "src/app/modules/shared/pipes/filter-by-key.pipe";

@Component({
  standalone: false,

  selector: "app-services-config",
  templateUrl: "./services-config.component.html",
  styleUrls: ["./services-config.component.scss"],
})
export class ServicesConfigComponent implements OnInit {

  private searchSubject = new Subject<string>();
  ActionLabel = "Save";
  searchText = "";
  servicesList: any;
  isFieldDisabled = false;
  isDissabledChk = false;
  radoiologistTime: any;
  radoiologistWorkWeek: any;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true; //Hide Loader
  filteredAvailableServices = [];
  loggedInUser: UserModel;

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

  spinnerRefs = {
    listSection: "listSection",
    testListSection: "testListSection",
    machineFormSection: "machineFormSection",
    tableFormSection: "tableFormSection",
    radTable: "radTable",
    searchTable: "searchTable",
  };

  servicesListForm = this.fb.group({
    SubSectionId: [null],
    LocId: [null, Validators.required],
  });
  serviceConfigForm: FormGroup = this.fb.group({
    SubSectionID: [null],
    locID: [null],
  });

  servicesAvlForm = this.fb.group({
    LocID: ["", Validators.compose([Validators.required])],
  });

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private auth: AuthService,
    private sharedService: SharedService,
    private questionnaireSrv: QuestionnaireService,
    private testProfileService: TestProfileService,
    private risCommonService: RISCommonService
  ) {}

  ngOnInit(): void {

setTimeout(() => {
    this.getServicesList();
}, 500);

    this.loadLoggedInUserInfo();
    this.getSubSection();
    this.getLocationList();
    this.groupedTestList = this.groupBySubsection(this.testList);
  }

  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  mainChk = false;
  selectAllItems(checked) {
    this.testList.forEach((item) => {
      item.checked = checked;
    });
    this.mainChk = checked;
  }

  onSelectedChild(e) {
    if (!e.checked) {
      // Clear everything when unchecked
      e.LocId = [];
      e.isServicePerform = false;
      e.ServiceTiming = "";
      e.ServiceRemarks = "";
    }

    this.mainChk =
      this.testList.length > 0 && this.testList.every((item) => item.checked);
    const checked: boolean = e.checked;
    if (checked == true) {
      this.isDissabledChk = false;
    }
  }

  mainStatusChk = false;

  selectAllStatus(checked: boolean) {
    console.log("clicked");
    this.servicesList.forEach((group) => {
      group.children.forEach((item) => {
        item.isServicePerform = checked;
      });
    });

    this.servicesList = [...this.servicesList];
    this.mainStatusChk = checked;
  }

  onStatusChange(data: any) {
    this.mainStatusChk =
      this.testList.length > 0 &&
      this.testList.every((item) => item.isServicePerform);
  }

  updateServicesAvailability() {
    const filterFormValues = this.servicesListForm.getRawValue();
    const filterLocId = filterFormValues?.LocId;

    const availableServices = this.testList || [];
    if (!availableServices.length) {
      this.toastr.error("No services available to update");
      return;
    }

    // ✅ Collect checked children (flatten in one pass)
    const checkedItems = [];
    for (const group of availableServices) {
      if (group.children?.length) {
        if (group.checked) {
          checkedItems.push(...group.children);
        } else {
          for (const child of group.children) {
            if (child.checked) {
              checkedItems.push(child);
            }
          }
        }
      }
    }

    if (!checkedItems.length) {
      this.toastr.warning("Please select item(s) to save");
      return;
    }

    // ✅ Build params in one pass
    const tblServiceTPLocation = [];
    for (const item of checkedItems) {
      if (filterLocId) {
        tblServiceTPLocation.push({
          TPId: item.TPID,
          LocId: filterLocId,
          isServicePerform: !!item.isServicePerform,
          ServiceTiming: item.ServiceTiming,
          ServiceRemarks: item.ServiceRemarks,
        });
      } else if (Array.isArray(item.LocId)) {
        for (const locId of item.LocId) {
          tblServiceTPLocation.push({
            TPId: item.TPID,
            LocId: locId,
            isServicePerform: !!item.isServicePerform,
            ServiceTiming: item.ServiceTiming,
            ServiceRemarks: item.ServiceRemarks,
          });
        }
      }
    }

    const param = {
      tblServiceTPLocation,
      CreatedBy: this.loggedInUser?.userid || -99,
    };

    console.log("insertion params::", param);

    this.spinner.show(this.spinnerRefs.searchTable);

    this.sharedService
      .insertUpdateData(API_ROUTES.INSERT_SERVICES_FOR_KBS, param)
      .subscribe(
        (res: any) => {
          this.spinner.hide(this.spinnerRefs.searchTable);

          let payload: any[] = [];
          try {
            payload = res.PayLoadStr
              ? JSON.parse(res.PayLoadStr)
              : Array.isArray(res.PayLoad)
              ? res.PayLoad
              : [];
          } catch {
            payload = [];
          }

          if (
            res.StatusCode === 200 &&
            payload.length > 0 &&
            payload[0].Result === 1
          ) {
            this.toastr.success(res.Message || "Operation successful");
            this.getServicesList();
          } else {
            this.toastr.error(res.Message || "Unexpected response from server");
          }
        },
        (err) => {
          console.error("insertUpdateData error:", err);
          this.spinner.hide(this.spinnerRefs.searchTable);
          this.toastr.error("Connection error");
        }
      );
  }

  getAllowedBranches() {
    const selectedLocId = this.servicesListForm.get("LocId")?.value;

    // If a location is selected in filter → restrict to that location
    if (selectedLocId) {
      return this.branchList.filter((branch) => branch.LocId === selectedLocId);
    }

    // If no location selected → return full list
    return this.branchList;
  }

  testList = [];
  labDeptID = -1;

  getServicesList() {
    this.testList = [];
    this.servicesList = [];

    const formValues = this.servicesListForm.getRawValue();
    const formConfigValues = this.serviceConfigForm.getRawValue();

    const testsParam = {
      DepartmentId: this.labDeptID,
      SubSectionId: formValues.SubSectionId || null,
      LocId: formValues.LocId || null,
    };

    const servicesParam = {
      SubSectionID: formConfigValues.SubSectionID,
      LocIDs: Array.isArray(formValues.LocId)
        ? formValues.LocId.join(",")
        : formValues.LocId
        ? String(formValues.LocId)
        : "", // send empty string instead of null
    };

    this.spinner.show(this.spinnerRefs.listSection);

    forkJoin({
      tests: this.testProfileService.getTestsByDisease(testsParam),
      services: this.risCommonService.getServicesForKBS(servicesParam),
    }).subscribe(
      ({ tests, services }: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);

        const testData =
          tests?.StatusCode === 200 && tests.PayLoad ? tests.PayLoad : [];
        const storedServices =
          services?.StatusCode === 200 && services.PayLoad
            ? services.PayLoad
            : [];

        if (!testData.length) {
          this.toastr.info("No record found");
          return;
        }

        // ✅ Build lookup map for storedServices → O(1) access
        const serviceMap = new Map<string, any>();
        for (const s of storedServices) {
          const key = `${s.TPID}_${s.locID}`;
          serviceMap.set(key, s);
        }

        // ✅ Merge + Group in a single pass
        const grouped: Record<string, any> = {};
        for (const test of testData) {
          const key = `${test.TPID}_${test.locID}`;
          const matched = serviceMap.get(key);

          const mergedItem = {
            ...test,
            isServicePerform: matched?.isServicePerform ?? false,
            ServiceTiming: matched?.ServiceTiming ?? null,
            ServiceRemarks: matched?.ServiceRemarks ?? null,
            LocId: matched?.LocId ?? test.LocId,
          };

          if (!grouped[test.SubSectionCode]) {
            grouped[test.SubSectionCode] = {
              SubSectionCode: test.SubSectionCode,
              children: [],
            };
          }
          grouped[test.SubSectionCode].children.push(mergedItem);
        }

        this.testList = Object.values(grouped);
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.error("Error fetching services:", err);
        this.toastr.error("Connection error");
      }
    );
  }

  branchList: any[] = [];
  selectedBranchData: any = null;
  isSubmitted = false;

  subSectionList: any[] = [];
  selectedDepartment: any;
  selectedDepartmentId = -1;
  selectedSubSectionId: number | null = null;
  selectedTestId: number | null = null;
  departmentOptions = [
    {
      id: 1,
      name: "Lab",
      isOpen: false,
      subSections: [],
    },
    {
      id: 2,
      name: "Imaging",
      isOpen: false,
      subSections: [],
    },
  ];

  getSubSection() {
    const objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID,
    };
    // Assuming lookupService is fetching the subsections for both departments
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        this.subSectionList = _response;

        // Based on the selected department, populate the corresponding subSections
        if (this.selectedDepartmentId === 1) {
          this.departmentOptions[0].subSections = _response; // Lab department
        } else if (this.selectedDepartmentId === 2) {
          this.departmentOptions[1].subSections = _response; // Imaging department
        }

        // Ensure each department's subSections is initialized to avoid rendering issues
        this.departmentOptions.forEach((dept) => {
          dept.subSections = dept.subSections || []; // Initialize empty array if no subsections are present
        });
      },
      (err) => {
        this.toastr.error("Connection error");
      }
    );
  }

  getLocationList() {
    const formValues = this.servicesListForm.getRawValue();
    this.branchList = [];

    const param = { LocID: formValues.LocId };

    this.lookupService.GetBranchesByLocID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}

          this.branchList = data || [];
          this.branchList = this.branchList.sort((a, b) =>
            a.Code.localeCompare(b.Code)
          );

          // ✅ Store and pass the first branch
          if (this.branchList.length > 0) {
            this.selectedBranchData = this.branchList[0];
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  mainLocationChk = false;

  onSelectAllBranches() {
    const allBranches = this.getAllowedBranches().map((b) => b.LocId);
    this.testList.forEach((item) => (item.LocId = [...allBranches]));
    this.mainLocationChk = true;
  }

  onUnselectAllBranches() {
    this.testList.forEach((item) => (item.LocId = []));
    this.mainLocationChk = false;
  }

  onLocationSelected(changedRow: any, selectedLocIds: any[]) {
    // Find parent group of this row
    const parentGroup = this.testList.find(
      (group: any) =>
        group.children &&
        group.children.some((child: any) => child === changedRow)
    );

    if (!parentGroup) return;

    // If parent "Select All" is ON → apply same location to all selected children
    if (this.isGroupFullyChecked(parentGroup)) {
      parentGroup.children.forEach((child: any) => {
        if (child.checked) {
          child.LocId = [...selectedLocIds]; // assign same location
        }
      });
    }
  }

  copyServiceRemarksToAll() {
    if (this.testList.length > 0) {
      const firstRemark = this.testList[0].ServiceTiming || "";
      this.testList.forEach((item, index) => {
        if (index > 0) {
          item.ServiceTiming = firstRemark;
        }
      });
    }
  }

  copyPersonRemarksToAll() {
    if (this.testList.length > 0) {
      const firstRemark = this.testList[0].ServiceRemarks || "";
      this.testList.forEach((item, index) => {
        if (index > 0) {
          item.ServiceRemarks = firstRemark;
        }
      });
    }
  }

  groupedTestList: any[] = [];

  groupBySubsection(testList: any[]) {
    return Object.values(
      testList.reduce((groups: any, item) => {
        const section = item.SubSectionCode || "Other";
        if (!groups[section]) {
          groups[section] = { SubSectionCode: section, items: [] };
        }
        groups[section].items.push(item);
        return groups;
      }, {})
    );
  }

  toggleGroupSelection(group: any, checked: boolean) {
    group.children?.forEach((child: any) => {
      if (child.checked !== checked) {
        child.checked = checked;
        this.onSelectedChild(child);
      }
    });
  }

  isGroupFullyChecked(group: any): boolean {
    return group.children?.every((c: any) => c.checked) ?? false;
  }

  isGroupIndeterminate(group: any): boolean {
    const children = group.children ?? [];
    return (
      children.some((c: any) => c.checked) &&
      !children.every((c: any) => c.checked)
    );
  }

  expandedGroup: string | null = null; // store which subsection is expanded

  toggleGroupExpand(subSectionCode: string) {
    this.expandedGroup =
      this.expandedGroup === subSectionCode ? null : subSectionCode;
  }
  // Toggle all statuses in this group
  toggleGroupStatuses(group: any, checked: boolean) {
    group.children?.forEach((child: any) => (child.isServicePerform = checked));
  }

  // If all statuses are active
  isGroupStatusesFullyChecked(group: any): boolean {
    return group.children?.every((c: any) => c.isServicePerform) ?? false;
  }

  // If some statuses active but not all → indeterminate
  isGroupStatusesIndeterminate(group: any): boolean {
    const children = group.children ?? [];
    const active = children.filter((c: any) => c.isServicePerform).length;
    return active > 0 && active < children.length;
  }

  private copyToCheckedChildren(
    group: any,
    field: "ServiceTiming" | "ServiceRemarks"
  ) {
    const source = group.children?.find((c: any) => c[field]?.trim());
    if (!source) return;
    group.children?.forEach((child: any) => {
      if (child.checked) child[field] = source[field];
    });
  }

  // Copy Service Remarks: takes the first non-empty remark in group and applies to all checked children
  copyServiceRemarksToGroup(group: any) {
    this.copyToCheckedChildren(group, "ServiceTiming");
  }

  // Copy Person Remarks: takes the first non-empty remark in group and applies to all checked children
  copyPersonRemarksToGroup(group: any) {
    this.copyToCheckedChildren(group, "ServiceRemarks");
  }

  applyParentLocation(group: any) {
    group.children?.forEach(
      (child: any) => (child.LocId = [...(group.parentLocId || [])])
    );
  }

  applyParentServiceTiming(group: any) {
    group.children?.forEach(
      (child: any) => (child.ServiceTiming = group.parentServiceTiming || "")
    );
  }

  applyParentServiceRemarks(group: any) {
    group.children?.forEach(
      (child: any) => (child.ServiceRemarks = group.parentServiceRemarks || "")
    );
  }

  // ✅ Check if any child/parent is selected
  isAnyChecked(): boolean {
    return this.testList.some(
      (group) =>
        group.children?.some((c: any) => c.checked) ||
        this.isGroupFullyChecked(group) ||
        this.isGroupIndeterminate(group)
    );
  }
  get isLocationFilterApplied(): boolean {
    return !!this.servicesListForm.get("LocId")?.value;
  }

// originalTestList: any[] = [];
//   filterResults() {
//   const cols = ['SubSectionCode', 'TPName', 'TPCode'];

//   // keep a backup of original list
//   if (!this.originalTestList || !this.originalTestList.length) {
//     this.originalTestList = [...this.testList];
//   }

//   if (this.searchText && this.searchText.trim().length > 1) {
//     const pipe_filterByKey = new FilterByKeyPipe();
//     this.testList = pipe_filterByKey.transform(
//       this.originalTestList,
//       this.searchText,
//       cols,
//       this.originalTestList
//     );
//   } else {
//     // reset to full list when search is cleared
//     this.testList = [...this.originalTestList];
//   }
// }
}
