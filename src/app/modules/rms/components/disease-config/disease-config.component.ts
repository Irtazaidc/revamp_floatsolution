// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { HcDashboardService } from "src/app/modules/home-sampling/services/hc-dashboard.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { TestProfileConfigurationService } from "src/app/modules/test-profile-management/Services/test-profile-configurations-services";

@Component({
  standalone: false,

  selector: "app-disease-config",
  templateUrl: "./disease-config.component.html",
  styleUrls: ["./disease-config.component.scss"],
})
export class DiseaseConfigComponent implements OnInit {
  // testFinderForm: FormGroup;
  BodyParts: any = [];
  Gender: any = "";
  selectedBodyparts: any = [];
  BodyPartCount: any;
  sysmtomsList: any = [];
  DiseasesID: any;
  DiseaseTitleList = [];
  DiseaseCount: any;
  selectedSymptoms: any = "";
  testFinderList: any = [];
  isSubmitted = false;
  labDeptID = -1;
  isSpinner = true;
  disabledButton = false;
  isDisable = false;
  spinnerRefs = {
    testProfilesDropdown: "testProfilesDropdown",
    listSection: "listSection",
    mainFormSection: "mainFormSection",
    testFinderSection: "testFinderSection",
  };

  TPCONFIGFormSubmitted = false;

  // TPConfigForm = this.fb.group({
  //   Gender: ["", ""],
  //   BodyPartTitle: ['', ''],
  //   DiseaseTitle: ['', ''],
  //   PatientInstructions: ['', ''],
  //   TestDescription: ['', ''],
  //   manualTAT: ['', ''],
  // });
  testFinderForm = this.fb.group({
    Gender: ["", Validators.required],
    BodyParts: [" ",Validators.required],
    Diseases: [" "],
    Symptoms: [" "], // Optional field
  });
 
  constructor(
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private TPService: TestProfileConfigurationService,
    private cd: ChangeDetectorRef,
    private toasrt: ToastrService,

  ) {}

  ngOnInit(): void {
    this.GetBodyParts();
    this.getSymptoms();
    this.GetDiseases();
  }


  GetTestFinderResult() {
    // let formValues = this.testFinderForm.getRawValue();

    // if (this.testFinderForm.invalid) {
    //   this.toastr.warning("Please Fill The Mandatory Fields");
    //   this.testFinderList = [];
    //   this.isSubmitted = true;
    // }
    // return;

    const objtParams = {
      Gender: this.Gender,
      BodyParts: this.selectedBodyparts,
      Diseases: this.selectedDiseases,
      Symptoms: this.selectedSymptoms,
    };

    console.log("Request Params:", objtParams);
    return;

    this.isSpinner = true;
    this.spinner.show();

    // this.HCService.GetBookingComparison(objtParams).subscribe((resp: any) => {
    //   console.log("Api response: ", resp);
    //   this.isDisable = false;
    //   this.spinner.hide(this.spinnerRefs.testFinderSection);
    //   if (resp.StatusCode == 200 && resp.PayLoad.length) {
    //     this.testFinderList = resp.PayLoad;
    //     console.log("response's payload: ", this.testFinderList);
    //     this.isSpinner = false;
    //     this.spinner.hide();
    //   }
    // });
  }

  GetBodyParts() {
    let response = [];
    const BodyPartCount = [];

    this.BodyPartCount = response.length;
    this.TPService.GetBodyparts().subscribe(
      (resp: any) => {
        response = JSON.parse(resp.PayLoadStr);
        this.BodyParts = response;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getSymptoms() {
    this.TPService.GetSymptoms().subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp && resp.PayLoad.length) {
          this.sysmtomsList = resp.PayLoad;
          // console.log(" this.sysmtomsList___________", this.sysmtomsList)
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  GetDiseases() {
    let response = [];
    const ObjParams = {
      DiseasesID: this.DiseasesID,
    };
    this.DiseaseCount = response.length;
    this.TPService.GetDiseases().subscribe(
      (resp: any) => {
        response = JSON.parse(resp.PayLoadStr);
        this.DiseaseTitleList = response;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  TPNameCardHeader = "Test Profile Config";
  TestProfileData = [];
  BodyPart: any = "";
  selectedDiseases = [];
  DiseaseTitle: any = "";
  PatientInstructions: any = "";
  TestDescription: any = "";

  GetTestProfileDataByID(param) {
    let response = [];
    const ObjParams = {
      TPID: param,
    };
    this.spinner.show(this.spinnerRefs.mainFormSection);
    this.TPService.GetTestProfileDataByID(ObjParams).subscribe(
      (resp: any) => {
        this.spinner.hide(this.spinnerRefs.mainFormSection);
        response = JSON.parse(resp.PayLoadStr);
        this.TestProfileData = response;
        if (
          this.TestProfileData["Table"].length ||
          this.TestProfileData["Table1"].length
        ) {
          this.Gender = this.TestProfileData["Table"][0].Gender;
          this.BodyPart = this.TestProfileData["Table"][0].IBodyPartsID;
          this.selectedDiseases = this.TestProfileData["Table1"].map(
            (a) => a.IDiseasesID
          );
          this.selectedBodyparts = this.TestProfileData["Table2"].map(
            (a) => a.BodyPartsTestProfileID
          );
          this.selectedSymptoms = this.TestProfileData["Table3"].map(
            (a) => a.SymptomID
          );
          this.DiseaseTitle = this.TestProfileData["Table1"].IDiseasesID;
          this.PatientInstructions =
            this.TestProfileData["Table"][0].PatientInstruction;
          this.TestDescription = this.TestProfileData["Table"][0].TPDescription;
          this.PatientInstructions =
            this.TestProfileData["Table"][0].PatientInstruction;
        }
        this.cd.detectChanges();
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.mainFormSection);
        console.log(err);
      }
    );
  }
}
