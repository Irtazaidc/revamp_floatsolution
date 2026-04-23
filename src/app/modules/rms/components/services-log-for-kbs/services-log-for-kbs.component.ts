// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { RISCommonService } from "src/app/modules/ris/services/ris-common.service";
import { SharedService } from "src/app/modules/shared/services/shared.service";

@Component({
  standalone: false,

  selector: "app-services-log-for-kbs",
  templateUrl: "./services-log-for-kbs.component.html",
  styleUrls: ["./services-log-for-kbs.component.scss"],
})
export class ServicesLogForKbsComponent implements OnInit {
  BranchesList: any = [];
  subSectionList: any = [];
  searchText = "";
  servicesList = [];
  rowIndex = null;
  spinnerRefs = {
    listSection: "listSection",
    logSection: "logSection",
  };
  disabledButton = false;

  serviceConfigForm: FormGroup = this.fb.group({
    SubSectionID: [null],
    LocIDs: [[]],
    TestID: [[]]
  });
  isSpinner = true;
  isSubmitted = false;

  constructor(
    private toastr: ToastrService,
    private sharedService: SharedService,    
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private risCommonService: RISCommonService,
    private testProfileService: TestProfileService,
    
  ) {}

  ngOnInit(): void {
    this.getBranches();
    this.getSubSection();
    this.getServices();
    this.getTestProfileList();
  }

  getServices() {
  this.servicesList = [];

  const formValues = this.serviceConfigForm.getRawValue();

  if (this.serviceConfigForm.invalid) {
    this.toastr.warning("Please Select Mandatory Fields");
    this.isSubmitted = true;
    return;
  }

  const objParams = {
    SubSectionID: formValues.SubSectionID,
    LocIDs: formValues.LocIDs.length ? formValues.LocIDs.join(",") : 1,
  };
  console.log("objParams::: ", objParams);

  this.risCommonService.getServicesForKBS(objParams).subscribe(
    (res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        if (res.PayLoad.length) {
          // 🔹 Group by SubSectionCode
          this.servicesList = Object.values(
            res.PayLoad.reduce((acc: any, { SubSectionCode, ...rest }: any) => {
              if (!acc[SubSectionCode]) {
                acc[SubSectionCode] = { SubSectionCode, items: [] };
              }
              acc[SubSectionCode].items.push(rest);
              return acc;
            }, {})
          );
        } else {
          this.toastr.info("No Record Found");
          this.servicesList = [];
        }
      } else {
        this.toastr.error("Something went wrong");
      }
    },
    (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.listSection);
      this.toastr.error("Connection error");
    }
  );
}

  formatTimeRange(
    startTime: string | null | undefined,
    endTime: string | null | undefined
  ): string {
    if (!startTime && !endTime) return "N/A"; // If both are missing, return single "N/A"

    const formatTime = (time: string | null | undefined): string => {
      if (!time) return "-"; // If one time is missing, show "-"

      const [hours, minutes] = time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return "-"; // Handle invalid format

      const suffix = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert 0 -> 12 for 12 AM

      return `${formattedHours}:${minutes
        .toString()
        .padStart(2, "0")} ${suffix}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  getFormattedDetail(raw: string): string {
    if (!raw) return "";
    return raw.replace(/(?:\r\n|\r|\n)/g, "<br>");
  }

  testList = []

  getTestProfileList() {
    this.testList = [];
    const _param = {
      branchId: 1,
      TestProfileCode: null,
      TestProfileName: null,
      panelId: null,
      TPIDs: ''
    };
    if (!_param.branchId) {
      this.toastr.warning('Please select branch');
      return;
    }
    this.testProfileService.getTestsByName(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.testList = data || [];
      }
    })
  }

  getBranches() {
    this.BranchesList = [];
    this.lookupService.GetBranches().subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        _response.forEach((element, index) => {
          _response[index].Title = (element.Title || "").replace(
            "Islamabad Diagnostic Centre (Pvt) Ltd",
            "IDC "
          );
        });
        this.BranchesList = _response;
      },
      (err) => {}
    );
  }

  getSubSection() {
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: -1,
    };
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        this.subSectionList = _response;
      },
      (err) => {
        this.toastr.error("Connection error");
      }
    );
  }

filteredServicesList: any[] = [];
  filterServicesList() {
  const keyword = this.searchText.toLowerCase().trim();

  if (!keyword) {
    // reset back to original full data
    this.filteredServicesList = [...this.servicesList];
  } else {
    this.filteredServicesList = this.servicesList
      .map(group => {
        // parent match
        const parentMatch = (group.SubSectionCode || '').toLowerCase().includes(keyword);

        // child match
        const filteredItems = group.items.filter((item: any) =>
          ['TPName', 'LocCode', 'LocAddress', 'LocTiming', 'ServiceTiming', 'ServiceRemarks'].some(key =>
            (item[key] || '').toString().toLowerCase().includes(keyword)
          )
        );

        // include parent if it matches OR has matching children
        if (parentMatch || filteredItems.length > 0) {
          return {
            ...group,
            items: parentMatch ? group.items : filteredItems
          };
        }
        return null;
      })
      .filter(group => group !== null);
  }
}


expandedGroup: string | null = null;

toggleGroup(groupCode: string) {
  this.expandedGroup = this.expandedGroup === groupCode ? null : groupCode;
}


parentSort: 'asc'|'desc' = 'asc';
childSortKey = 'TPName';
childSortDirection: 'asc'|'desc' = 'asc';

toggleParentSort(key) {
  this.parentSort = this.parentSort === 'asc' ? 'desc' : 'asc';
   if (this.childSortKey === key) {
    this.childSortDirection = this.childSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.childSortKey = key;
    this.childSortDirection = 'asc';
  }
  this.sortEverything();
}
// toggleChildSort(key: string) {
 
// }

private sortEverything() {
  if (!this.servicesList) return;

  // sort parent groups
  this.servicesList.sort((a: any, b: any) => this.compare(a.SubSectionCode, b.SubSectionCode, this.parentSort));

  // sort children inside each group
  this.servicesList.forEach((g: any) => {
    if (Array.isArray(g.items)) {
      g.items.sort((x: any, y: any) => this.compare(x[this.childSortKey], y[this.childSortKey], this.childSortDirection));
    }
  });
}

private  compare(a: any, b: any, dir: 'asc'|'desc') {
  const va = (a ?? '').toString().toLowerCase();
  const vb = (b ?? '').toString().toLowerCase();
  if (va < vb) return dir === 'asc' ? -1 : 1;
  if (va > vb) return dir === 'asc' ? 1 : -1;
  return 0;
}

getGroupCommonData(group: any) {
  if (!group.items || group.items.length === 0) return null;

  const keys = [
    'LocCode',
    'LocAddress',
    'LocTiming',
    'isServicePerform',
    'ServiceTiming',
    'ServiceRemarks'
  ];

  const common: any = {};
  keys.forEach(key => {
    const first = group.items[0][key];
    const allSame = group.items.every(item => item[key] === first);
    common[key] = allSame ? first : null; // null if not common
  });

  return common;
}

}