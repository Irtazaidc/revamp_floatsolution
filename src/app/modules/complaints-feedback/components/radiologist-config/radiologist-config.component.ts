// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { QuestionnaireService } from "src/app/modules/ris/services/questionnaire.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { SharedService } from "src/app/modules/shared/services/shared.service";

@Component({
  standalone: false,

  selector: "app-radiologist-config",
  templateUrl: "./radiologist-config.component.html",
  styleUrls: ["./radiologist-config.component.scss"],
})
export class RadiologistConfigComponent implements OnInit {
  ActionLabel = "Save";
  searchText = "";
  radoiologistList: any;
  isFieldDisabled = false;
  isDissabledChk = false;
  radoiologistTime: any;
  radoiologistWorkWeek: any;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true; //Hide Loader
  filteredAvailableRadiologist = [];
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

  // radiologistFilterForm = this.fb.group({
  //   LocID: [],
  //   EmpID: "",
  // });

  spinnerRefs = {
    listSection: "listSection",
    testListSection: "testListSection",
    machineFormSection: "machineFormSection",
    tableFormSection: "tableFormSection",
    radTable: "radTable",
    searchTable: "searchTable",
  };

  radiologistAvlForm = this.fb.group({
    LocID: ["", Validators.compose([Validators.required])],
  });

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private auth: AuthService,
    private sharedService: SharedService,
    private questionnaireSrv: QuestionnaireService
  ) {}

  ngOnInit(): void {
    this.getRadiologistWorkWeek();
    this.getRadiologistTime();
    this.loadLoggedInUserInfo();
    setTimeout(() => {
    this.getRadiologistInfoDetail();
    }, 500);
    
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    console.log("this.loggedInUser",this.loggedInUser)
  }

  mainChk;
  selectAllItems(checked) {
    this.radoiologistList.forEach((sec) => {
      sec.checked = checked;
    });
  }

  onSelectedDoctor(e) {
    const checked: boolean = e.checked;
    if (checked == true) {
      this.isDissabledChk = false;
    }
  }

  updateRadiologistAvailability() {
    const formValues = this.radiologistAvlForm.getRawValue();
    this.filteredAvailableRadiologist = this.radoiologistList;
    const checkedItems = this.filteredAvailableRadiologist.filter(
      (item) => item.checked
    );
    let GeneralShiftId = false;
    let WorkWeekId = false;
    const isAvailable = false;

    console.log("check", checkedItems);
    console.log("available", this.filteredAvailableRadiologist);
    if (!checkedItems.length) {
      this.toastr.warning("Please select item(s) to save");
      return;
    }

    checkedItems.forEach((a) => {
      if (!a.GeneralShiftId) {
        GeneralShiftId = true;
      }

      if (!a.WorkWeekId) {
        WorkWeekId = true;
      }
    });

    if (GeneralShiftId) {
      this.toastr.warning("Please select available time for selected item.");
      return;
    } else if (WorkWeekId) {
      this.toastr.warning("Please select a work week for selected item.");
      return;
    } else {
      console.log(" ", checkedItems);
      const param = {
        tblEmplAvailabilityShiftTime: checkedItems.map((item) => ({
          EmpID: item.EmpId,
          isAvailable: item.isAvailable ? true : false,
          isAvailableRemarks: item.isAvailableRemarks || "",
          GeneralShiftId: item.GeneralShiftId,
          WorkWeekId: item.WorkWeekId,
        })),
        ModifiedBy: this.loggedInUser.userid || -99,
      };
      console.log("params", param);

      this.spinner.show(this.spinnerRefs.searchTable);
      this.sharedService
        .insertUpdateData(API_ROUTES.INSERT_AVAILABLE_RADIOLOGIST, param)
        .subscribe(
          (res: any) => {
            setTimeout(() => {
              this.spinner.hide(this.spinnerRefs.searchTable);
            }, 100);
            res.PayLoadStr = JSON.parse(res.PayLoadStr);
            if (res.StatusCode === 200 && res.PayLoadStr[0].Result === 1) {
              this.toastr.success(res.Message);
              this.getRadiologistInfoDetail();
            } else {
              this.toastr.error(res.Message);
            }
          },
          (err) => {
            console.log(err);
            this.spinner.hide(this.spinnerRefs.searchTable);
            this.toastr.error("Connection error");
          }
        );
    }
  }

getRadiologistInfoDetail() {
  const params = {
    LocID: this.loggedInUser.locationid, 
    EmpID: null,                        
  };

  this.isSpinner = false;
  this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe(
    (res: any) => {
      this.disabledButton = false;
      this.isSpinner = true;
      if (res.StatusCode == 200) {
        this.radoiologistList = res.PayLoadDS["Table"] || [];
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

  getRadiologistTime() {
    const params = {};
    this.isSpinner = false;
    this.lookupService.getDHRMGeneralShift(params).subscribe(
      (res: any) => {
        this.isSpinner = true;
        if (res.StatusCode == 200) {
          this.radoiologistTime = res.PayLoad;
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

  getRadiologistWorkWeek() {
    const params = {};
    this.isSpinner = false;
    this.lookupService.getWorkWeek(params).subscribe(
      (res: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        if (res.StatusCode == 200) {
          this.radoiologistWorkWeek = res.PayLoad;
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
}
