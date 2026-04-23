// @ts-nocheck
import {
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren, AfterViewInit,
} from "@angular/core";
import { AuthService, UserModel } from "src/app/modules/auth";
import { ActivatedRoute } from "@angular/router";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { TabsSwitchingService } from "src/app/modules/doctors/services/tabs-switching.service";
import { NgbCalendar, NgbDate, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { ToastrService } from "ngx-toastr";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { NgxSpinnerService } from "ngx-spinner";
import { TestProfileConfigurationService } from "src/app/modules/test-profile-management/Services/test-profile-configurations-services";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProductsPromotionService } from "src/app/modules/marketing/services/products-promotion.service";
import { HelperService } from "src/app/modules/shared/helpers/helper.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { trigger, transition, style, animate } from "@angular/animations";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  standalone: false,

  selector: "app-knowledge-based-dashboard.ts",
  templateUrl: "./knowledge-based-dashboard.component.html",
  styleUrls: ["./knowledge-based-dashboard.component.scss"],

  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(-10px)" }),
        animate(
          "300ms ease-out",
          style({ opacity: 1, transform: "translateY(0)" }),
        ),
      ]),
    ]),
  ],
})
export class KnowledgeBasedDashboardComponent implements OnInit, AfterViewInit {
  @Output() sendParamID = new EventEmitter<any>();

  marker: any;
  branchList: any[] = [];
  selectedBranch: any;
  locationWiseChecked = false;
  isSubmitted = false;

  screenPermissionsObj;
  inquiryReportPermission = false;
  servicesPermission = false;
  machinestPermission = false;
  doctorsPermission = false;

  selectedTabIndex = 0;
  ParamID: number | null = 0;
  radiologistAvailabilityPopupRef: NgbModalRef;
  machineStatusPopupRef: NgbModalRef;
  telephoneExtensionPopupRef: NgbModalRef;
  viewDocsPopupRef: NgbModalRef;
  mapViewPopupRef: NgbModalRef;
  panelPopupRef: NgbModalRef;
  discountCardPopupRef: NgbModalRef;
  testList = [];
  selectedLocId = 1;
  selectedPanelId = null;
  // branchList = [];
  panelList = [];
  rdSearchBy = "byCode";
  TPId: any = null;
  testGeneralData = {};
  testGeneralSubsection = {};
  testProtocol: any = null;
  testInstructuon: any = null;
  testParametersData = [];
  testLoationTATData = [];
  repTimeShow: boolean;
  LocId: any = null;
  locationTatUrgency: object = {};
  locationTATData = [];
  indexValue: number = null;
  FilterStringParam = "";
  FilterString = "";
  paramId: number = null;
  BodyParts: any = [];
  Gender: any = "";
  selectedBodyparts: any = [];
  BodyPartCount: any;
  sysmtomsList: any = [];
  DiseasesID: any;
  DiseaseTitleList = [];
  DiseaseCount: any;
  selectedSymptoms: any = "";
  selectedDiseases = [];
  labDeptID = -1;
  searchText = "";
  paginatedSearchResults = [];
  gendersList = [];
  advancedSearchEnabled = false;
  subSectionList: any[] = [];
  subSectionIDs = null;
  testProfileList = [];
  ProductsPromotionsList = [];

  testProfileListForm = this.fb.group({
    BodyPartId: [null],
    DiseaseId: [null],
    SymptomId: [null],
    Gender: [null],
    PanelId: [null],
    SubSectionId: [null],
    LocId: [null],
  });
  expandedIndex = 0;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
  };

  promotionAddForm: FormGroup = this.formBuilder.group(this.Fields);

  maxDate: any;
  reportType = null;
  promotionAddID = -1;
  // isSubmitted = false;
  today: NgbDate = this.calendar.getToday();
  oneDayEarlier: NgbDate = this.calendar.getPrev(this.today, "d", 1);
  mapUrl: SafeResourceUrl | null = null;
  loggedInUser: UserModel;
  AdminAccessPermission = false;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private Tabs: TabsSwitchingService,
    private appPopupService: AppPopupService,
    private toastr: ToastrService,
    private testProfileService: TestProfileService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private TPService: TestProfileConfigurationService,
    private fb: FormBuilder,
    private _ppservice: ProductsPromotionService,
    private helper: HelperService,
    private calendar: NgbCalendar,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {}
  spinnerRefs = {
    testGeneralSection: "testGeneralSection",
    locationTATSection: "locationTATSection",
    testInfoTable: "testInfoTable",
    listSection: "listSection",
    advertisementList: "advertisementList",
  };
  paginationForTestProfile = {
    page: 1,
    pageSize: 5,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  getPermissions() {
    this.screenPermissionsObj = this.auth.getUserPermissionsFromLocalStorage();
    const inquiryReport = this.screenPermissionsObj.find(
      (i) => i.state === "inquiry-report",
    );
    this.inquiryReportPermission = inquiryReport ? true : false;

    const services = this.screenPermissionsObj.find(
      (i) => i.state === "branch-services-log",
    );
    this.servicesPermission = services ? true : false;

    const machines = this.screenPermissionsObj.find(
      (i) => i.state === "machine-status-log",
    );
    this.machinestPermission = machines ? true : false;

    const doctors = this.screenPermissionsObj.find(
      (i) => i.state === "radiologist-availability",
    );
    this.doctorsPermission = doctors ? true : false;
  }

  ngOnInit(): void {
    this.getPanelList();
    this.getListByDisease();
    this.getPermissions();
    this.getDocumentDeleteButtonPermissions();
    this.GetBodyParts();
    this.getSymptoms();
    this.GetDiseases();
    this.getGendersList();
    this.getSubSection();
    this.getLocationList();
    this.getKBSTicker();
    this.loadDocuments();
    this.debugFileUrls();
    // this.productPromotions();

    setTimeout(() => {
      this.promotionAddForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      const content = document.querySelector(".ticker-content") as HTMLElement;
      if (content) {
        const contentWidth = content.scrollWidth;
        const speed = contentWidth / 90; // 90px per second (slow and smooth)

        content.style.animationDuration = `${speed}s`;
        content.style.animationName = "ticker-scroll";
      }
    }, 100);
  }

  // Department Accordion
  accordionForLAB = [{ title: "LAB:", isOpen: false }];

  // Toggle Departments
  toggleAccordionForDepartment(index: number) {
    this.departmentOptions.forEach((dept, i) => {
      dept.isOpen = i === index ? !dept.isOpen : false;
    });

    this.selectedDepartmentId = this.departmentOptions[index].id;

    setTimeout(() => {
      // this.getSubSection(); // Should populate subSections for selectedDepartmentId
      // this.getListByDisease();
    }, 300);
  }
  // Toggle Subsections
  toggleAccordionForSubSection(
    deptIndex: number,
    subIndex: number,
    subSection: any,
  ) {
    const dept = this.departmentOptions[deptIndex];
    dept.subSections.forEach((sub, i) => {
      sub.isOpen = i === subIndex ? !sub.isOpen : false;
    });

    if (dept.subSections[subIndex].isOpen) {
      this.fetchChildTests(subSection, deptIndex, subIndex);
    }
  }

  // Sub-Section Accordion
  accordionForImaging = [{ title: "RIS:", isOpen: false }];

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

  selectedDepartment: any;
  selectedDepartmentId = -1;
  selectedSubSectionId: number | null = null;
  selectedTestId: number | null = null;

  selectDepartment(department: any) {
    this.selectedDepartmentId = department.id;

    // Optionally, call the method to update the subsection based on the selected department
    this.getSubSection();
  }
  selectSubSection(subSection: any) {
    this.selectedSubSectionId = subSection.SubSectionId;
    // You can perform additional logic here, such as updating form controls or other components
  }

  // Simulate child test fetching
  fetchChildTests(subSection: any, deptIndex: number, subIndex: number) {
    const Tests = this.paginationForTestProfile.filteredSearchResults.filter(
      (test) => test.SubSectionID === subSection.SubSectionId,
    );

    this.departmentOptions[deptIndex].subSections[subIndex].childTests = Tests;
  }

  // Select Test
  selectTest(test: any) {
    this.selectedTestId = test.testId;
  }

  rdSearchByClick(a) {
    this.rdSearchBy = a;
  }

  getParamID(paramID) {
    if (paramID && paramID.PID) {
      this.ParamID = paramID;
    } else {
      console.error("Invalid paramID:", paramID);
    }
  }
  advancedSearch() {
    this.advancedSearchEnabled = !this.advancedSearchEnabled;
  }
  // Fetch Subsections for Department (Lab or Imaging)
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
      },
    );
  }

  getTestProfile() {
    const subSectIDs = this.subSectionIDs.join(",");
    this.testProfileList = [];
    const objParm = {
      TPID: null,
      TestProfileCode: null,
      TestProfileName: null,
      SubSectionID: subSectIDs ? subSectIDs : null,
      LabDeptID: this.labDeptID,
    };
    this.testProfileService.getTestsProfileForAnalytics(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;

        this.testProfileList = _response;
      },
      (err) => {
        this.toastr.error("Connection error");
      },
    );
  }

  refreshPaginationForTestProfile() {
    // Apply search filter to the full dataset
    const filteredResults = this.testList.filter(
      (test) =>
        !this.searchText ||
        test.TPCode.toLowerCase().includes(this.searchText.toLowerCase()) ||
        test.TPName.toLowerCase().includes(this.searchText.toLowerCase()),
    );

    // Step 2: Store filtered data
    this.paginationForTestProfile.filteredSearchResults = filteredResults;
    this.paginationForTestProfile.collectionSize = filteredResults.length;

    // Step 3: Fix page number if out of range
    const totalPages = Math.ceil(
      filteredResults.length / this.paginationForTestProfile.pageSize,
    );
    if (this.paginationForTestProfile.page > totalPages) {
      this.paginationForTestProfile.page = totalPages > 0 ? totalPages : 1;
    } else if (this.paginationForTestProfile.page < 1) {
      this.paginationForTestProfile.page = 1;
    }

    // Step 4: Slice data for current page
    const startIndex =
      (this.paginationForTestProfile.page - 1) *
      this.paginationForTestProfile.pageSize;
    const endIndex = startIndex + this.paginationForTestProfile.pageSize;

    this.paginationForTestProfile.paginatedSearchResults =
      filteredResults.slice(startIndex, endIndex);
  }

  onSearchTextChanged() {
    this.paginationForTestProfile.page = 1; // reset to first page
    this.refreshPaginationForTestProfile();
  }

  getParamDetail(param, index) {
    this.paramId = param.Id;
    this.indexValue = index;
  }

  customSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    if (this.rdSearchBy == "byCode") {
      return item.TestProfileCode.toLowerCase().indexOf(term) == 0;
    } else if (this.rdSearchBy == "byName") {
      return item.TestProfileName.toLowerCase().indexOf(term) > -1;
    }
  };
  getGendersList() {
    this.gendersList = [];
    this.lookupService.getGendersList().subscribe(
      (res: any) => {
        if (res && res.PayLoad && res.PayLoad.length) {
          this.gendersList = res.PayLoad;
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  getPanelList() {
    this.panelList = [];
    const _param = {};
    this.lookupService.getPanels(_param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.panelList = data || [];
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  minutesToHours(minutes) {
    if (!minutes) return "";
    let h: any = Math.floor(minutes / 60);
    let m: any = minutes % 60;
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    return h + ":" + m;
  }

  // panelListChanged(e) {
  //   this.getListByDisease();
  // }

  subSectionId: any = null;
  getListByDisease() {
    if (
      this.locationWiseChecked &&
      this.testProfileListForm.get("LocId")?.invalid
    ) {
      this.testProfileListForm.get("LocId")?.markAsTouched();
      this.toastr.warning("Select Location");
      return; // Prevent API call
    }

    this.testList = [];
    const formValues = this.testProfileListForm.getRawValue();

    const _param: any = {
      DiseaseId: formValues.DiseaseId || null,
      BodyPartId: formValues.BodyPartId || null,
      SymptomId: formValues.SymptomId || null,
      PanelId: formValues.PanelId || null,
      Gender: formValues.Gender || null,
      DepartmentId: this.labDeptID,
      SubSectionId: formValues.SubSectionId || null,
    };

    // Include LocId only if provided
    if (formValues.LocId) {
      _param.LocId = formValues.LocId;
    }

    // Store SubSectionId for later use
    this.subSectionId = _param.SubSectionId;
    this.spinner.show(this.spinnerRefs.testInfoTable);

    this.testProfileService.getTestsByDisease(_param).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.testInfoTable);

        if (res && res.StatusCode == 200 && res.PayLoad) {
          const data = res.PayLoad;

          this.testList = data || [];
          this.subSectionId = _param.SubSectionId;

          // Refresh pagination after the testList is populated
          this.refreshPaginationForTestProfile();
        } else {
          this.paginatedSearchResults = [];
          this.toastr.info("No record found");
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.testInfoTable);
        console.error("Error fetching test profiles:", err);
      },
    );
  }

  testListChanged(e) {
    this.TPId = e.TPID;
    this.spinner.show(this.spinnerRefs.testGeneralSection);
    const objParm = {
      TPId: this.TPId,
    };
    this.testProfileService.getTestProfileDetailByTPID(objParm).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.testGeneralSection);
        if (res.StatusCode == 200) {
          this.testGeneralData = res.PayLoadDS["Table"][0] || {};
          // Store Table1 (which contains SubSectionID)
          this.testGeneralSubsection = res.PayLoadDS["Table1"] || [];

          // Extracting SubSectionID from Table1
          this.subsectionId = this.testGeneralSubsection
            ? this.testGeneralSubsection[0]["SubSectionID"]
            : null;

          this.testProtocol = this.testGeneralData
            ? this.testGeneralData["Protocol"].replace(/\r\n/g, "<br>")
            : this.testGeneralData["Protocol"];
          this.testInstructuon = this.testGeneralData
            ? this.testGeneralData["Instruction"].replace(/\r\n/g, "<br>")
            : this.testGeneralData["Instruction"];
          const TypeId = this.testGeneralData["TypeId"];
          if (TypeId === 3) {
            this.getPackageList(this.testGeneralData);
          } else {
            this.testParametersData = res.PayLoadDS["Table1"] || [];
          }
          this.testLoationTATData = res.PayLoadDS["Table2"] || [];

          if (this.testLoationTATData.length) {
            this.getTATByTPID(this.testLoationTATData[0]);
          }
        }
      },
      (err) => {
        console.log("loading search result error", err);
        this.spinner.hide(this.spinnerRefs.testGeneralSection);
        this.toastr.error("Connection error");
      },
    );
  }

  getPackageList(e) {
    const _params = {
      packageId: e.TPId,
      branchId: this.selectedLocId || null,
      panelId: this.selectedPanelId || "",
    };
    this.testProfileService.getPackageTestsProfiles(_params).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          if (data.length) {
            this.testParametersData = data;
          }
        }
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
      },
    );
  }

  getTATByTPID(location) {
    this.repTimeShow = true;
    this.LocId = location.LocId;
    const objParm = {
      TPId: this.TPId,
      LocID: this.LocId,
    };
    this.testProfileService.getTATByTPID(objParm).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.testGeneralSection);
        if (res.StatusCode == 200) {
          this.locationTatUrgency = res.PayLoadDS["Table"][0] || {
            UrgentRptTime: -1,
          };
          this.locationTATData = res.PayLoadDS["Table1"] || [];
        }
      },
      (err) => {
        console.log("loading search result error", err);
        this.spinner.hide(this.spinnerRefs.testGeneralSection);
        this.toastr.error("Connection error");
      },
    );
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
      },
    );
  }

  getSymptoms() {
    this.TPService.GetSymptoms().subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp && resp.PayLoad.length) {
          this.sysmtomsList = resp.PayLoad;
        }
      },
      (err) => {
        console.log(err);
      },
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
      },
    );
  }

  jumpToParamters(param) {
    this.Tabs.setSelectedTabIndex(3, event);
    this.sendParamID.emit(param);
  }

  @ViewChild("testRates") testRates;
  showTestRateCalculator() {
    this.appPopupService.openModal(this.testRates);
  }
  doctorslocationId = null;
  @ViewChild("radiologistAvailabilityModal") radiologistAvailabilityModal;
  radiologistAvailabilityProcess(doctorslocationId) {
    this.doctorslocationId = doctorslocationId;

    this.radiologistAvailabilityPopupRef = this.appPopupService.openModal(
      this.radiologistAvailabilityModal,
      { backdrop: "static", size: "xl" },
    );
  }

  locationid = null;
  subsectionId = null;
  @ViewChild("machinesModal") machinesModal;
  machinesStatusProcess(locationid) {
    this.locationid = locationid;

    this.machineStatusPopupRef = this.appPopupService.openModal(
      this.machinesModal,
      { backdrop: "static", size: "xl" },
    );
  }

  @ViewChild("telephoneExtensionModal") telephoneExtensionModal;
  telephoneExtensionProcess() {
    this.telephoneExtensionPopupRef = this.appPopupService.openModal(
      this.telephoneExtensionModal,
      { backdrop: "static", size: "xl" },
    );
  }

  @ViewChild("viewDocsModal") viewDocsModal;
  viewDocsProcess() {
    this.viewDocsPopupRef = this.appPopupService.openModal(this.viewDocsModal, {
      backdrop: "static",
      size: "xl",
    });
  }

  @ViewChild("mapViewModal") mapViewModal;

  mapViewProcess(branchData: any) {
    this.mapViewPopupRef = this.appPopupService.openModal(this.mapViewModal, {
      backdrop: "static",
      size: "xl",
    });
  }

  @ViewChild("panelModal") panelModal;
  panelProcess() {
    this.panelPopupRef = this.appPopupService.openModal(this.panelModal, {
      backdrop: "static",
      size: "xl",
    });
  }

  @ViewChild("discountCardModal") discountCardModal;
  discountCardProcess() {
    this.discountCardPopupRef = this.appPopupService.openModal(
      this.discountCardModal,
      { backdrop: "static", size: "xl" },
    );
  }

  statusList;
  disabledButton = false;
  isSpinner = true;
  advertisementList: any[] = [];
  ForActive = -1;

  getPromotionAdd() {
    const formValues = this.promotionAddForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(
      dateFrom.year,
      dateFrom.month - 1,
      dateFrom.day,
    );
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    this.advertisementList = null;
    this.isSubmitted = true;
    if (this.promotionAddForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory fields");
      return;
    }

    const param = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      ForActive: this.ForActive,
    };
    console.log("param:::", param);
    this.spinner.show(this.spinnerRefs.advertisementList);
    this._ppservice.getProductPromotionsForKBS(param).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.advertisementList);
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length > 0) {
            this.advertisementList = res.PayLoad;
          } else {
            this.toastr.info("No Advertisement Found");
          }
        } else {
          this.toastr.info("No Record Found");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection Error");
      },
    );
  }

  selectedImage = "";
  showModal = false;

  openModal(image: string): void {
    this.selectedImage = image;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onCheckboxChange(location: boolean) {
    this.locationWiseChecked = location;
    const locIdControl = this.testProfileListForm.get("LocId");

    if (location) {
      locIdControl?.setValidators(Validators.required);
    } else {
      locIdControl?.clearValidators();
      locIdControl?.setValue(null); // Optional: clear value when unchecked
    }

    locIdControl?.updateValueAndValidity();

    this.locationTatUrgency = null;
    this.locationTATData = [];
    this.testList = [];
    this.TPId = null;
    this.repTimeShow = false;
    this.testProfileListForm.reset();
    this.labDeptID = -1;
    this.LocId = null;
    this.paginationForTestProfile = {
      ...this.paginationForTestProfile,
      page: 1,
    };
  }

  getLocationList() {
    const formValues = this.testProfileListForm.getRawValue();
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
            a.Code.localeCompare(b.Code),
          );

          // ✅ Store and pass the first branch
          if (this.branchList.length > 0) {
            this.selectedBranchData = this.branchList[0];
          }
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }

  selectedBranchData: any = null;
  branchLatitude: number | null = null;
  branchLongitude: number | null = null;
  branchAddress = "";

  onBranchSelected(branch: any) {
    if (branch) {
      // Still patch the form if needed
      this.testProfileListForm.patchValue({ LocId: branch.LocId });
      this.selectedBranchData = branch;
    }
  }

  ShowMapView(branchData: any) {
    if (branchData) {
      this.selectedBranchData = branchData;

      this.branchLatitude = +branchData.Latitude || null;
      this.branchLongitude = +branchData.Longitude || null;
      this.branchAddress = branchData.LocAddress || "Address not available";

      if (this.branchLatitude && this.branchLongitude) {
        const unsafeUrl = `https://maps.google.com/maps?q=${this.branchLatitude},${this.branchLongitude}&hl=en&z=16&output=embed`;
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
      } else {
        this.mapUrl = null;
      }

      this.mapViewProcess(branchData);
    }
  }

  TickerList: any;

  getKBSTicker() {
    const params = {};
    this.isSpinner = false;

    this.lookupService.getActiveKBSTickerDetail(params).subscribe(
      (res: any) => {
        this.disabledButton = false;
        this.isSpinner = true;

        if (res.StatusCode == 200) {
          this.TickerList = res.PayLoad.map((t: any) => ({
            ...t,
            // Remove ALL HTML tags (div, style, br, span, p, etc.)
            TickerDetail: t.TickerDetail
              ? t.TickerDetail.replace(/<[^>]*>/g, " ").trim()
              : "",
          }))
            // Remove items that become empty after cleaning
            .filter((t: any) => t.TickerDetail);
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        this.isSpinner = true;
        console.log(err);
        this.toastr.error("Connection error");
      },
    );

    this.spinner.hide();
  }

  selectedTicker: any;
  // openTickerDetails(ticker: any) {
  //   this.selectedTicker = ticker;
  //   this.modalService.open(this.tickerModal, { centered: true, size: 'lg' });
  // }

  @ViewChild("tickerModal") tickerModal;
  openTickerDetails(ticker: any) {
    this.selectedTicker = ticker;
    this.appPopupService.openModal(this.tickerModal);
  }

  // Properties
  // searchText: string = "";
  baseUrl = "https://localhost:59357/api/"; // MUST END WITH SLASH
  documentsList: any[] = [];
  groupedDocuments: any[] = [];

  // Preview modal properties
  selectedDocument: any = null;
  previewUrl: SafeResourceUrl = "";
  isImageFile = true;

  loadDocuments() {
    const params = { search: this.searchText };

    this.lookupService.getKBSDocumentsPaged(params).subscribe({
      next: (res: any) => {
        this.documentsList = res?.PayLoad || [];

        // Format image data using helper
        this.documentsList = this.formatDocumentData(this.documentsList);

        this.groupDocumentsByCategory(this.documentsList);
      },
      error: (err) => {
        this.toastr.error("Failed to load documents");
        console.error(err);
      },
    });
  }

  formatDocumentData(documents: any[]): any[] {
    return documents.map((doc) => {
      // Create a copy to avoid modifying original
      const formattedDoc = { ...doc };

      // Check if DocumentPath is base64
      if (
        formattedDoc.DocumentPath &&
        this.isBase64Data(formattedDoc.DocumentPath)
      ) {
        if (!formattedDoc.DocumentPath.startsWith("data:")) {
          // Get MIME type based on extension
          const mimeType = this.getMimeType(formattedDoc.DocumentExtension);
          formattedDoc.DocumentPath = `data:${mimeType};base64,${formattedDoc.DocumentPath}`;
        }
      }
      console.log("blablabla", formattedDoc);

      return formattedDoc;
    });
  }

  // Group documents by category
  groupDocumentsByCategory(documents: any[]) {
    const map = new Map<number | string, any>();

    documents.forEach((doc) => {
      const categoryId =
        doc.DKBSDocumentCategoryID || doc.categoryId || "uncategorized";

      if (!map.has(categoryId)) {
        map.set(categoryId, {
          categoryId: categoryId,
          categoryName: doc.CategoryName || doc.categoryName || "Uncategorized",
          documents: [],
          open: false,
        });
      }
      map.get(categoryId).documents.push(doc);
    });

    this.groupedDocuments = Array.from(map.values());
  }

  // Toggle category accordion
  toggleCategory(category: any) {
    category.open = !category.open;
  }

  // Search documents
  searchDocuments() {
    if (!this.searchText.trim()) {
      this.groupDocumentsByCategory(this.documentsList);
      return;
    }

    const filtered = this.documentsList.filter(
      (doc) =>
        doc.DocumentTitle?.toLowerCase().includes(
          this.searchText.toLowerCase(),
        ) ||
        doc.CategoryName?.toLowerCase().includes(
          this.searchText.toLowerCase(),
        ) ||
        doc.DocumentFileName?.toLowerCase().includes(
          this.searchText.toLowerCase(),
        ),
    );

    this.groupDocumentsByCategory(filtered);
  }

  // Delete document
  deleteDocument(doc: any) {
    const params = {
      UserID: this.loggedInUser.userid,
      KBSDocumentID:
        doc.KBSDocumentID || doc.DKBSDocumentID || doc.id || doc.DocumentID,
    };

    this.lookupService.deleteKBSDocument(params).subscribe({
      next: (res: any) => {
        this.toastr.success("Document deleted successfully");

        // Remove the document from the list
        this.documentsList = this.documentsList.filter(
          (d) =>
            d.KBSDocumentID !== doc.KBSDocumentID &&
            d.DKBSDocumentID !== doc.DKBSDocumentID &&
            d.id !== doc.id &&
            d.DocumentID !== doc.DocumentID,
        );

        // Regroup documents
        this.groupDocumentsByCategory(this.documentsList);
        this.loadDocuments();
      },
      error: (err) => {
        this.toastr.error("Delete failed");
        console.error(err);
      },
    });
  }

  // Get safe image URL - FIXED
  getSafeImageUrl(doc: any): string {
    if (!doc || !doc.DocumentPath) return "";

    const base = this.baseUrl.endsWith("/") ? this.baseUrl : this.baseUrl + "/";
    const docPath = doc.DocumentPath.startsWith("/")
      ? doc.DocumentPath.substring(1)
      : doc.DocumentPath;

    return base + docPath;
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  isImageType(extension: string): boolean {
    if (!extension) return false;
    const ext = extension.toLowerCase();
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "svg",
      "tiff",
      "tif",
      "ico",
      "heic",
      "heif",
      "apng",
      "avif",
    ];
    return imageExtensions.includes(ext);
  }

  // Add a method to check if the file is base64
  isBase64Data(str: string): boolean {
    if (!str) return false;

    // Remove any whitespace
    const cleanStr = str.trim();

    // Check if it's a data URI
    if (cleanStr.startsWith("data:")) {
      return true;
    }

    // Check for common base64 patterns
    const base64Patterns = [
      /^[A-Za-z0-9+/]+={0,3}$/, // Standard base64
      /^JVBERi/, // PDF base64 (starts with JVBERi)
      /^iVBORw0KGgo/, // PNG base64
      /^\/9j\/4AAQSkZJRg/, // JPEG base64
      /^R0lGODlh/, // GIF base64
      /^Qk[0-9]{2}[A-Za-z0-9+\/]+=*$/, // BMP base64
      /^PD94/, // PDF in base64 (alternative)
      /^UklGR/, // WebP base64
    ];

    // Check first 100 characters for base64 patterns
    const sample = cleanStr.substring(0, 100);

    // Also check if string contains only base64 characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,3}$/;

    return (
      base64Patterns.some((pattern) => pattern.test(sample)) ||
      (cleanStr.length > 50 && base64Regex.test(cleanStr))
    );
  }

  // Check if file is PDF
  isPdfType(extension: string): boolean {
    return extension && extension.toLowerCase() === "pdf";
  }

  // Get document icon based on type - FIXED (using existing FontAwesome classes)
  getDocumentIcon(extension: string): string {
    if (!extension) return "fa-file";

    const ext = extension.toLowerCase();

    if (this.isImageType(ext)) return "fa-image"; // Changed from fa-file-image
    if (this.isPdfType(ext)) return "fa-file-pdf";
    if (["doc", "docx"].includes(ext)) return "fa-file-word";
    if (["xls", "xlsx"].includes(ext)) return "fa-file-excel";
    if (["ppt", "pptx"].includes(ext)) return "fa-file-powerpoint";
    if (["txt"].includes(ext)) return "fa-file-alt";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
      return "fa-file-archive";

    return "fa-file";
  }

  // Get document icon color based on type
  getDocumentIconColor(extension: string): string {
    if (!extension) return "text-secondary";

    const ext = extension.toLowerCase();

    if (this.isImageType(ext)) return "text-success";
    if (this.isPdfType(ext)) return "text-danger";
    if (["doc", "docx"].includes(ext)) return "text-primary";
    if (["xls", "xlsx"].includes(ext)) return "text-success";
    if (["ppt", "pptx"].includes(ext)) return "text-warning";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "text-warning";

    return "text-secondary";
  }

  // Get file extension from filename
  // getFileExtension(filename: string): string {
  //   if (!filename) return '';
  //   return filename.split('.').pop()?.toLowerCase() || '';
  // }

  // Add this debug method to your component
  debugFileUrls() {
    console.log("=== FILE URL DEBUG ===");
    console.log("Base URL:", this.baseUrl);

    this.documentsList.slice(0, 3).forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}: ${doc.DocumentTitle}`);
      console.log("DocumentPath:", doc.DocumentPath);
      console.log("Current URL:", this.getSafeImageUrl(doc));

      // Try alternative URL patterns
      console.log("Alternative URLs:");

      // Option 1: Remove /api/ from DocumentPath if it starts with it
      if (doc.DocumentPath?.startsWith("/api/")) {
        const altPath = doc.DocumentPath.substring(4); // Remove /api
        console.log("1. Without /api prefix:", this.baseUrl + altPath);
      }

      // Option 2: If DocumentPath starts with KBSDocuments/
      if (doc.DocumentPath?.includes("KBSDocuments")) {
        const altUrl = "https://localhost:59357/" + doc.DocumentPath;
        console.log("2. Direct to port:", altUrl);
      }

      // Option 3: Check if it's a relative path
      console.log(
        "3. Relative to root:",
        window.location.origin + "/" + doc.DocumentPath,
      );
    });
  }

  // Properties from reference code
  selectedImg: any = null;
  imageRotation = 0;
  imageScale = 1;

  // Preview modal
  showPreviewModal = false;

  imageError;

  // Open preview with reference code pattern
  openPreviewModal(doc: any) {
    if (!doc || !doc.DocumentPath) {
      this.toastr.error("Invalid document");
      return;
    }

    // ⏳ add a small delay before opening modal
    setTimeout(() => {
      const fileType = this.getMimeType(
        doc.DocumentExtension || doc.DocumentFileName,
      );

      const fileUrl = doc.DocumentPath;

      console.log(
        "Preview URL for",
        doc.DocumentFileName,
        ":",
        fileUrl.substring(0, 100) + (fileUrl.length > 100 ? "..." : ""),
      );

      this.selectedImg = {
        fileName: doc.DocumentTitle || doc.DocumentFileName,
        fileType: fileType,
        sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl),
        originalDoc: doc,
        loaded: false,
      };

      // Reset image manipulation
      this.imageRotation = 0;
      this.imageScale = 1;
      this.imageError = false;

      this.showPreviewModal = true;
    }, 300); // 👈 delay in milliseconds (adjust if needed)
  }

  getImageUrl(doc: any): string {
    if (!doc || !doc.DocumentPath) return "";

    // If DocumentPath is already a data URI or full URL, return it
    if (
      doc.DocumentPath.startsWith("data:") ||
      doc.DocumentPath.startsWith("http://") ||
      doc.DocumentPath.startsWith("https://")
    ) {
      return doc.DocumentPath;
    }

    // Otherwise, it's a regular file path
    return this.getDocumentUrl(doc);
  }

  // Get MIME type based on extension
  getMimeType(extensionOrFilename: string): string {
    if (!extensionOrFilename) return "application/octet-stream";

    const ext = extensionOrFilename.includes(".")
      ? extensionOrFilename.split(".").pop()?.toLowerCase()
      : extensionOrFilename.toLowerCase();

    const mimeTypes: Record<string, string> = {
      // Images
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      svg: "image/svg+xml",
      webp: "image/webp",

      // Documents
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",

      // Archives
      zip: "application/zip",
      rar: "application/x-rar-compressed",
      "7z": "application/x-7z-compressed",
    };

    return mimeTypes[ext || ""] || "application/octet-stream";
  }

  // Get document URL - FIXED based on your 404 error
  getDocumentUrl(doc: any): string {
    if (!doc || !doc.DocumentPath) return "";

    const path = doc.DocumentPath;
    const base = this.baseUrl.endsWith("/") ? this.baseUrl : this.baseUrl + "/";

    // If it's already a full URL, return it
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Clean the path
    let cleanPath = path;
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }

    // Remove "api/" prefix if present
    if (cleanPath.startsWith("api/")) {
      cleanPath = cleanPath.substring(4);
    }

    return base + cleanPath;
  }

  isPdfFile(extensionOrFileName: string): boolean {
    if (!extensionOrFileName) return false;
    const ext = extensionOrFileName.toLowerCase();
    const normalizedExt = ext.includes(".") ? ext.split(".").pop() : ext;
    return normalizedExt === "pdf";
  }

  // Image manipulation methods from reference code
  rotateImage() {
    this.imageRotation = (this.imageRotation + 90) % 360;
  }

  zoomIn() {
    this.imageScale += 0.1;
  }

  zoomOut() {
    this.imageScale = Math.max(0.1, this.imageScale - 0.1);
  }

  getImageStyles() {
    return {
      transform: `rotate(${this.imageRotation}deg) scale(${this.imageScale})`,
      "transform-origin": "center center",
    };
  }

  onMouseWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
    event.preventDefault();
  }

  startDrag(event: MouseEvent) {
    // Implement drag if needed
  }

  onDrag(event: MouseEvent) {
    // Implement drag if needed
  }

  printDocument(elementId: string) {
    const printContent = document.getElementById(elementId);
    if (printContent) {
      const windowUrl = "about:blank";
      const uniqueName = new Date().getTime();
      const windowName = "Print" + uniqueName;
      const printWindow = window.open(
        windowUrl,
        windowName,
        "left=50000,top=50000,width=0,height=0",
      );

      if (printWindow) {
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  }

  // Download document
  downloadDoc(doc: any) {
    if (!doc || !doc.DocumentPath) {
      this.toastr.error("No document to download");
      return;
    }

    const isBase64 = this.isBase64Data(doc.DocumentPath);
    const isImage = this.isImageType(doc.DocumentExtension);

    if (isBase64) {
      // Handle base64 download
      this.downloadBase64File(doc);
    } else {
      // For regular URLs, construct the correct URL
      const fileUrl = isImage
        ? this.getImageUrl(doc)
        : this.getDocumentUrl(doc);

      // Check if URL is accessible
      this.checkUrlAccessibility(fileUrl)
        .then((isAccessible) => {
          if (isAccessible) {
            this.downloadViaUrl(fileUrl, doc);
          } else {
            // Try alternative URL patterns
            this.tryAlternativeUrls(doc, fileUrl);
          }
        })
        .catch(() => {
          this.downloadViaUrl(fileUrl, doc);
        });
    }
  }

  // Helper method to download via URL
  downloadViaUrl(url: string, doc: any) {
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.DocumentFileName || doc.DocumentTitle || "document";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Check if URL is accessible
  async checkUrlAccessibility(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD", mode: "no-cors" });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Try alternative URL patterns
  tryAlternativeUrls(doc: any, originalUrl: string) {
    const alternativeUrls = [];
    const path = doc.DocumentPath;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;

    // Try different URL patterns
    alternativeUrls.push(`${this.baseUrl}api/${cleanPath}`);
    alternativeUrls.push(`${this.baseUrl}KBSDocuments/${cleanPath}`);
    alternativeUrls.push(`https://localhost:59357/${cleanPath}`);
    alternativeUrls.push(`https://localhost:59357/api/${cleanPath}`);
    alternativeUrls.push(`https://localhost:59357/KBSDocuments/${cleanPath}`);

    // Try each URL
    let success = false;
    alternativeUrls.forEach((url) => {
      if (!success) {
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.DocumentFileName || doc.DocumentTitle || "document";
        link.target = "_blank";
        link.onload = () => {
          success = true;
          document.body.removeChild(link);
        };
        link.onerror = () => {
          document.body.removeChild(link);
        };
        document.body.appendChild(link);
        link.click();
      }
    });

    if (!success) {
      this.toastr.warning(
        "Document might not be accessible. Please contact support.",
      );
    }
  }

  downloadBase64File(doc: any) {
    try {
      let base64Data = doc.DocumentPath;

      // If it's raw base64, add data URI prefix
      if (base64Data.startsWith("JVBERi")) {
        const mimeType = this.getMimeType(doc.DocumentExtension || "pdf");
        base64Data = `data:${mimeType};base64,${base64Data}`;
      }

      // Extract base64 from data URI if needed
      if (base64Data.startsWith("data:")) {
        const base64Match = base64Data.match(/^data:.+\/(.+);base64,(.*)$/);
        if (base64Match && base64Match[2]) {
          base64Data = base64Match[2];
        }
      }

      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: this.getMimeType(doc.DocumentExtension),
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.DocumentFileName || doc.DocumentTitle || "document";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading base64 file:", error);
      this.toastr.error("Failed to download file");
    }
  }

  // Close preview
  closePreviewModal() {
    this.showPreviewModal = false;
    this.selectedImg = null;
  }

  // Add these to your component
  getFileExtension(filename: string): string {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  getFileBadgeClass(extension: string): string {
    if (!extension) return "bg-secondary";

    const ext = extension.toLowerCase();
    if (this.isImageType(ext)) return "bg-success";
    if (this.isPdfType(ext)) return "bg-danger";
    if (["doc", "docx"].includes(ext)) return "bg-primary";
    if (["xls", "xlsx"].includes(ext)) return "bg-success";
    if (["zip", "rar", "7z"].includes(ext)) return "bg-warning";

    return "bg-secondary";
  }

  AdminAccessPermissionForDeleteButton = false;
  screenDocumentDeleteButtonPermissionsObj;
  getDocumentDeleteButtonPermissions() {
    const _activatedroute = this.route.routeConfig.path;
    this.screenDocumentDeleteButtonPermissionsObj =
      this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    console.log("User Screen Permsions___", this.screenDocumentDeleteButtonPermissionsObj);
    this.AdminAccessPermissionForDeleteButton = this.screenDocumentDeleteButtonPermissionsObj?.delete_doc_btn
      ? true
      : false;
    console.log("🚀  this.AdminAccessPermissionForDeleteButton:", this.AdminAccessPermissionForDeleteButton);
  }
}
