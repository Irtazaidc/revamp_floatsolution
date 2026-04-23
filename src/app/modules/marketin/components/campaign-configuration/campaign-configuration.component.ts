// @ts-nocheck
import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-campaign-configuration',
  templateUrl: './campaign-configuration.component.html',
  styleUrls: ['./campaign-configuration.component.scss'],
  animations: [
    trigger('fadeInOutTranslate', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translate(0)' }),
        animate('400ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CampaignConfigurationComponent implements OnInit, AfterViewInit {
  @ViewChild('couponDetailModal') couponDetailModal;
  private scrollTopBtn: HTMLElement | null = null;

  campaignConfigForm = this.fb.group({
    campaignName: ['', Validators.required],
    campaignCode: ['', [Validators.required, Validators.maxLength(5)]],
    discountPercent: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    startHour: ['', Validators.required],
    startMinute: ['', Validators.required],
    endHour: ['', Validators.required],
    endMinute: ['', Validators.required],
    branch: [''], // Optional according to SP
    panel: [''], // Optional according to SP
    tests: [''], // Only tests is mandatory among the three dropdowns// now according to the new requirement tests is optional bkz can be open for all tests// tests: [''],
    autoApply: [false],
    verifyFromClient: [false],
    clientReference: [''],
    parLevel: [''],
    maxLimit: [''],
    clientAPIDetail: [''],
    clientUsagePostAPI: [''],
    description: [''],
    couponPrefix: ['', Validators.maxLength(10)],
    numberOfCoupons: ['', [Validators.required, Validators.min(0)]],
    maxUsagePerCoupon: ['', [Validators.required, Validators.min(1)]],
    maxUsageCount: [''],
    noExpiry: [''],
    cityIDs: ['']
  });

  spinnerRefs = {
    listSection: 'listSection',
    listSectionCampaign: 'listSectionCampaign',
    listSectionCoupon: 'listSectionCoupon',
    panelsDropdown: 'panelsDropdown',
    testProfilesDropdown: 'testProfilesDropdown',
    formSection: 'formSection',
    couponDetail: 'couponDetail'
  };

  ActionLabel = 'Save';
  isValidDateRange = true;
  noCampaignDataMessage = 'No active campaigns found';
  noCouponDataMessage = 'Please select a campaign to get coupons';
  noCouponDatailMessage = 'No Coupon\'s details found';
  disabledButton = false;
  isSpinner = true;

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert',
    popoverMessage: 'Are you <b>sure</b> you want to submit?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  };
  confirmationPopoverConfigRemoveCoupon = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert',
    popoverMessage: 'Are you <b>sure</b> you want to remove?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  };
  searchTextCampaign = "";
  searchTextCoupon = "";
  searchTextCouponDetail = "";

  branchList: any[] = [];
  campaignsList: any[] = [];
  isShowCampaignSection = true;
  hideShowCampaignIconClass = 'fa-minus';
  hideShowCampaignIconTooltip = 'Collapse Section';

  isShowCouponSection = true;
  hideShowCouponIconClass = 'fa-minus';
  hideShowCouponIconTooltip = 'Collapse Section';
  validateBranch = false;
  loggedInUser: UserModel;

  constructor(
    private renderer: Renderer2,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private tpService: TestProfileService,
    private appPopupService: AppPopupService
  ) { }

  ngOnInit(): void {
    // Dynamic validator for ClientReference
    this.campaignConfigForm.get('verifyFromClient').valueChanges.subscribe(checked => {
      const refControl = this.campaignConfigForm.get('clientReference');
      if (checked) {
        refControl.setValidators([Validators.required]);
      } else {
        refControl.clearValidators();
        refControl.setValue('');
      }
      refControl.updateValueAndValidity();
    });
    // Watch for checkbox changes
    this.campaignConfigForm.get('verifyFromClient')?.valueChanges.subscribe((checked: boolean) => {
      this.onVerifyFromClient(checked);
    });
    this.loadLoggedInUserInfo();

    this.getBranches();
    this.getCampaignList();
    this.getPanels();
    this.getTestProfileList('');
    this.getOutsourceHospitals();
    this.getHCCities();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  outsourceHospitals: any = [];
  getOutsourceHospitals() {
    // this.ecl.getOutSourceHospitalDetail().subscribe((resp: any) => {
    this.sharedService.getData(API_ROUTES.GET_OUTSOURCE_HOSPITAL_DETAIL, {}).subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.outsourceHospitals = resp.PayLoad
        // console.log("this.outsourceHospitals___", this.outsourceHospitals);
      }
    }, (err) => { console.log(err) })
  }

  hideShowCampaignSection() {
    this.isShowCampaignSection = !this.isShowCampaignSection;
    this.hideShowCampaignIconClass = this.isShowCampaignSection ? 'fa-minus' : 'fa-plus';
    this.hideShowCampaignIconTooltip = this.isShowCampaignSection ? 'Collapse Section' : 'Expand Section';
  }

  hideShowCouponSection() {
    this.isShowCouponSection = !this.isShowCouponSection;
    this.hideShowCouponIconClass = this.isShowCouponSection ? 'fa-minus' : 'fa-plus';
    this.hideShowCouponIconTooltip = this.isShowCouponSection ? 'Collapse Section' : 'Expand Section';
  }
  groupBranchesByCityFn(item) {
    return item.CityId;
  }

  groupBranchesByCityValueFn(key, children) {
    return {
      CityId: key,
      CityName: children[0].CityName,
      children: children
    };
  }
  getBranches() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe(
      (resp: any) => {
        const response = resp.PayLoad.map((element, index) => ({
          ...element,
          Title: (element.Title || '').replace(
            'Islamabad Diagnostic Centre (Pvt) Ltd',
            'IDC '
          )
        }));
        this.branchList = response;
      },
      err => console.warn(err)
    );
  }
  // Add a private property to store the last processed IDs
  onCityChange(event: any) {
    this.branchList = [];

    // Check if this is an HTTP event object (has headers property)
    if (event && typeof event === 'object') {
      // If it has headers property, it's definitely an HTTP event - ignore it
      if (event.headers) {
        // console.log('Ignoring HTTP event');
        return;
      }

      // If it's an array but first item doesn't have CityID, it's not valid city data
      if (Array.isArray(event) && event.length > 0 && !event[0].CityID) {
        // console.log('Ignoring invalid array without CityID');
        return;
      }

      // If it's a single object without CityID, it's not valid city data
      if (!Array.isArray(event) && !event.CityID) {
        // console.log('Ignoring single object without CityID');
        return;
      }
    }

    // If event is empty or null, get all branches
    if (!event) {
      this.getBranches();
      return;
    }

    // Try to extract the selected values
    let selectedCities = [];

    // If event is already an array
    if (Array.isArray(event)) {
      selectedCities = event;
    }
    // If event has a value property that's an array
    else if (event && Array.isArray(event.value)) {
      selectedCities = event.value;
    }
    // If it's a single city object
    else if (event && event.CityID) {
      selectedCities = [event];
    } else {
      // Unknown format, ignore
      return;
    }

    // Filter out invalid items
    selectedCities = selectedCities.filter(city => city && city.CityID);

    if (selectedCities.length === 0) {
      this.getBranches();
      return;
    }

    const cityIDs = selectedCities
      .map(x => x.CityID)
      .join(',');

    const params = {
      CityIDs: cityIDs
    };

    this.getBranchesByCityIDs(params);
  }
  getBranchesByCityIDs(params: any) {

    this.branchList = [];

    this.lookupService.GetBranchesByCityIDs(params).subscribe(
      (resp: any) => {

        const response = resp.PayLoad.map((element, index) => ({
          ...element,
          Title: (element.Title || '').replace(
            'Islamabad Diagnostic Centre (Pvt) Ltd',
            'IDC '
          )
        }));

        this.branchList = response;

      },
      err => console.warn(err)
    );
  }

  onSelectAllBranches() {
    this.branchList.forEach((b: any) => (b.selected = true));

    const branchControl = this.campaignConfigForm.get('branch');
    branchControl?.setValue(this.branchList.map((b: any) => b.LocId));

    // scroll to top of dropdown panel if it’s open
    const panel = document.querySelector('.ng-dropdown-panel-items');
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.toastr.success('All branches selected.');
  }


  onUnselectAllBranches() {
    this.branchList.forEach((b: any) => (b.selected = false));
    const branchControl = this.campaignConfigForm.get('branch');
    branchControl?.setValue([]);

    // scroll back to top for convenience
    const panel = document.querySelector('.ng-dropdown-panel-items');
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.toastr.info('All branches unselected.');
  }


  getCampaignList() {
    this.campaignId = null;
    this.campaignsList = [];
    this.campaignCoupons = [];
    this.campainRow = {};
    this.newCampaign();
    this.rowIndexCampaign = null;
    this.rowIndexCoupon = null;


    // this.spinner.show(this.spinnerRefs.listSectionCampaign);
    this.sharedService.getData(API_ROUTES.GET_CAMPAIGN_LIST, {}).subscribe(
      (resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSectionCampaign);
        this.campaignsList = resp.PayLoad || [];
      },
      err => this.toastr.error('Connection error'),
      () => this.spinner.hide(this.spinnerRefs.listSectionCampaign)
    );
  }

  _checkBranch(event: any) {
    const selectedIds = this.campaignConfigForm.get('branch')?.value || [];

    // Sort logic: selected branches on top, others below
    this.branchList = this.branchList
      .map(branch => ({
        ...branch,
        selected: selectedIds.includes(branch.LocId)
      }))
      .sort((a, b) => {
        // Selected items come first
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;
        // Maintain your existing sort (if by Title or LocId, adjust below)
        return a.Title.localeCompare(b.Title);
      });
  }
  checkBranch(event: any) {
    const selectedIds = this.campaignConfigForm.get('branch')?.value || [];
    this.branchList = this.sortDropdownList(this.branchList, selectedIds, 'LocId', 'Title');
  }
  @ViewChild('tableContainer') tableContainer!: ElementRef;
  showScrollTop = false;


  showScrollTopBtn = false;

  ngAfterViewInit() {
    if (this.tableContainer) {
      const container = this.tableContainer.nativeElement;
      container.addEventListener('scroll', () => {
        this.showScrollTop = container.scrollTop > 200; // shows button after scroll down
      });
    }
  }
  scrollTableToTop() {
    if (this.tableContainer) {
      this.tableContainer.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  onDropdownOpen(dropdown: any) {
    // Wait for panel to render
    setTimeout(() => {
      const panel = document.querySelector('.ng-dropdown-panel-items');
      if (panel) {
        // Listen to scroll
        this.renderer.listen(panel, 'scroll', (event) => {
          const scrollTop = (event.target as HTMLElement).scrollTop;
          const shouldShow = scrollTop > 400;

          if (shouldShow && !this.scrollTopBtn) {
            this.addScrollTopButton(panel as HTMLElement);
          } else if (!shouldShow && this.scrollTopBtn) {
            this.removeScrollTopButton();
          }
        });
      }
    }, 200);
  }

  private addScrollTopButton(panel: HTMLElement) {
    this.scrollTopBtn = this.renderer.createElement('button');
    this.scrollTopBtn.innerHTML = '<i class="fa fa-arrow-up"></i>';
    this.renderer.addClass(this.scrollTopBtn, 'scroll-top-btn');

    this.renderer.listen(this.scrollTopBtn, 'click', () => {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
      // this.toastr.info('Scrolled to top');
    });

    this.renderer.appendChild(panel, this.scrollTopBtn);
  }

  private removeScrollTopButton() {
    if (this.scrollTopBtn && this.scrollTopBtn.parentNode) {
      this.renderer.removeChild(this.scrollTopBtn.parentNode, this.scrollTopBtn);
      this.scrollTopBtn = null;
    }
  }


  // Allow only digits
  onTimeKeydown(e: KeyboardEvent) {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowed.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  }

  // Automatically move focus to minutes after 2 digits in hour field
  onHourInput(event: any, minuteInput: HTMLInputElement) {
    const value = event.target.value;

    // Allow only digits — but do NOT clear the value completely
    if (!/^\d*$/.test(value)) {
      event.target.value = value.replace(/\D/g, '');
      return;
    }

    // If two digits entered, move to minute field
    if (value.length === 2) {
      setTimeout(() => minuteInput.focus(), 10);
    }
  }

  // Validate time fields (HH:MM)
  validateTimeField(hourField: string, minuteField: string) {
    const hourControl = this.campaignConfigForm.get(hourField);
    const minuteControl = this.campaignConfigForm.get(minuteField);

    const hourRaw = (hourControl.value || '').trim();
    const minuteRaw = (minuteControl.value || '').trim();

    // If both fields are empty — skip validation (don’t mark invalid)
    if (hourRaw === '' && minuteRaw === '') {
      return;
    }

    // If one is filled and the other empty — skip until submit
    if ((hourRaw && !minuteRaw) || (!hourRaw && minuteRaw)) {
      return;
    }

    // Convert to numbers and validate ranges
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    const invalidHour = isNaN(hour) || hour < 0 || hour > 23;
    const invalidMinute = isNaN(minute) || minute < 0 || minute > 59;

    // Set validation errors only when values are actually invalid
    if (invalidHour || invalidMinute) {
      if (invalidHour) hourControl.setErrors({ invalidTime: true });
      if (invalidMinute) minuteControl.setErrors({ invalidTime: true });

      this.toastr.warning('Please enter valid time — Hours: 00–23, Minutes: 00–59', 'Invalid Time');
      hourControl.markAsTouched();
      minuteControl.markAsTouched();
    } else {
      // Clear invalidTime errors but keep others (like required)
      const hourErrors = hourControl.errors;
      const minuteErrors = minuteControl.errors;

      if (hourErrors && hourErrors['invalidTime']) delete hourErrors['invalidTime'];
      if (minuteErrors && minuteErrors['invalidTime']) delete minuteErrors['invalidTime'];

      if (hourErrors && Object.keys(hourErrors).length === 0) hourControl.setErrors(null);
      if (minuteErrors && Object.keys(minuteErrors).length === 0) minuteControl.setErrors(null);
    }
  }

  outsourceHospitalID = null;
  onPanelChange(event) {
    this.outsourceHospitalID = this.campaignConfigForm.get('clientReference')?.value || null;
    this.getPanels();
  }

  panelsList: any[] = [];
  getPanels() {
    this.panelsList = [];
    const _params = {
      OutsourceHospitalID: this.outsourceHospitalID
    }
    this.spinner.show(this.spinnerRefs.panelsDropdown);
    this.lookupService.getPanelsByOutsourceHospitalID(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.panelsDropdown);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.panelsList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.panelsDropdown);
      console.log(err);
    });
  }
  citesList: any[] = [];
  getHCCities() {
    this.citesList = []
    const objParam = {
      isHomeSamplingCity: 1
    }
    this.lookupService.getHCCities(objParam).subscribe((resp: any) => {
      this.citesList = resp.PayLoad || [];
      if (!this.citesList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  testProfileList: any[] = [];
  getTestProfileList(tpname) {
    this.testProfileList = [];
    const _params = {
      tpids: null,
      branchId: 1,//this.loggedInUser.locationid,
      panelId: ''// (this.selectedPanel || '') // this.selectedPanel ? this.selectedPanel.PanelId : '' //this.patientBasicInfo.value.corporateClientID || '',
    }
    // if (!this.loggedInUser.locationid) {
    //   this.toastr.warning('Branch ID not found');
    //   return;
    // }

    this.spinner.show(this.spinnerRefs.testProfilesDropdown);
    this.tpService.getTestsByName(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.testProfilesDropdown);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        // console.log(data, "data");
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        if (data.length) {
          data.forEach(element => {
            element.TestProfileCodeDesc = `${element.TestProfileCode} - ${element.TestProfileName} (${element.TestProfilePrice})`;
          });
        }
        this.testProfileList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.testProfilesDropdown);
      console.log(err);
    });
  }

  // Add this property
  validateTests = false;

  // Panel methods
  onSelectAllPanels() {
    this.panelsList.forEach((p: any) => (p.selected = true));

    const panelControl = this.campaignConfigForm.get('panel');
    panelControl?.setValue(this.panelsList.map((p: any) => p.PanelId));

    const panel = document.querySelector('.ng-dropdown-panel-items');
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.toastr.success('All panels selected.');
  }

  onUnselectAllPanels() {
    this.panelsList.forEach((p: any) => (p.selected = false));
    const panelControl = this.campaignConfigForm.get('panel');
    panelControl?.setValue([]);

    const panel = document.querySelector('.ng-dropdown-panel-items');
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.toastr.info('All panels unselected.');
  }

  // Tests methods
  onSelectAllTests() {
    this.testProfileList.forEach((t: any) => (t.selected = true));

    const testsControl = this.campaignConfigForm.get('tests');
    testsControl?.setValue(this.testProfileList.map((t: any) => t.TPId));

    const panel = document.querySelector('.ng-dropdown-panel-items');
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.toastr.success('All tests selected.');
  }

  onUnselectAllTests() {
    this.testProfileList.forEach((t: any) => (t.selected = false));
    const testsControl = this.campaignConfigForm.get('tests');
    testsControl?.setValue([]);

    const panel = document.querySelector('.ng-dropdown-panel-items');
    if (panel) {
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.toastr.info('All tests unselected.');
  }

  // Update checkTests method (similar to checkBranch)
  _checkTests(event: any) {
    const selectedIds = this.campaignConfigForm.get('tests')?.value || [];

    // Sort logic: selected tests on top, others below
    this.testProfileList = this.testProfileList
      .map(test => ({
        ...test,
        selected: selectedIds.includes(test.TPId)
      }))
      .sort((a, b) => {
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;
        return a.TestProfileCodeDesc.localeCompare(b.TestProfileCodeDesc);
      });

    this.validateTests = !selectedIds.length;
  }
  checkTests(event: any) {
    const selectedIds = this.campaignConfigForm.get('tests')?.value || [];
    this.testProfileList = this.sortDropdownList(this.testProfileList, selectedIds, 'TPId', 'TestProfileCodeDesc');
    this.validateTests = !selectedIds.length;
  }

  // Update panelChanged method to include sorting
  _panelChanged(event: any) {
    const selectedIds = this.campaignConfigForm.get('panel')?.value || [];

    // Sort panels when selection changes
    this.panelsList = this.panelsList
      .map(panel => ({
        ...panel,
        selected: selectedIds.includes(panel.PanelId)
      }))
      .sort((a, b) => {
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;
        return a.CodeName.localeCompare(b.CodeName);
      });
  }
  panelChanged(event: any) {
    const selectedIds = this.campaignConfigForm.get('panel')?.value || [];
    this.panelsList = this.sortDropdownList(this.panelsList, selectedIds, 'PanelId', 'CodeName');
  }

  clickSubmit = false;
  prepareAndSubmit() {
    this.clickSubmit = true;
    const noExpiry = this.campaignConfigForm.get('noExpiry')?.value === true;
    const endDateCtrl = this.campaignConfigForm.get('endDate');
    const endHourCtrl = this.campaignConfigForm.get('endHour');
    const endMinuteCtrl = this.campaignConfigForm.get('endMinute');

    // 1. Dynamic validators for No Expiry
    if (noExpiry) {
      endDateCtrl.clearValidators();
      endHourCtrl.clearValidators();
      endMinuteCtrl.clearValidators();
      endDateCtrl.setErrors(null);
      endHourCtrl.setErrors(null);
      endMinuteCtrl.setErrors(null);
    } else {
      endDateCtrl.setValidators([Validators.required]);
      endHourCtrl.setValidators([Validators.required]);
      endMinuteCtrl.setValidators([Validators.required]);
    }

    endDateCtrl.updateValueAndValidity({ emitEvent: false });
    endHourCtrl.updateValueAndValidity({ emitEvent: false });
    endMinuteCtrl.updateValueAndValidity({ emitEvent: false });

    // 2. Time field validation
    this.validateTimeField('startHour', 'startMinute');
    if (!noExpiry) this.validateTimeField('endHour', 'endMinute');

    const startHourCtrl = this.campaignConfigForm.get('startHour');
    const startMinuteCtrl = this.campaignConfigForm.get('startMinute');

    const startHour = startHourCtrl.value?.toString().trim();
    const startMinute = startMinuteCtrl.value?.toString().trim();
    const endHour = endHourCtrl.value?.toString().trim();
    const endMinute = endMinuteCtrl.value?.toString().trim();

    // Required Start Time
    if (startHour === '' || startMinute === '') {
      startHourCtrl.markAsTouched();
      startMinuteCtrl.markAsTouched();
      startHourCtrl.setErrors({ required: true });
      startMinuteCtrl.setErrors({ required: true });
      this.toastr.error('Please enter a valid Start Time before saving.', 'Time Required');
      return;
    }

    // Required End Time if noExpiry=false
    if (!noExpiry && (endHour === '' || endMinute === '')) {
      endHourCtrl.markAsTouched();
      endMinuteCtrl.markAsTouched();
      endHourCtrl.setErrors({ required: true });
      endMinuteCtrl.setErrors({ required: true });
      this.toastr.error('Please enter a valid End Time before saving.', 'Time Required');
      return;
    }

    // --- (SAFE DATE CONVERSION LOGIC stays unchanged)
    const toSafeDate = (val: any): Date | null => {
      if (!val && val !== 0) return null;
      if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
      if (val.year !== undefined && val.month !== undefined && val.day !== undefined) {
        const d = new Date(val.year, val.month - 1, val.day);
        return isNaN(d.getTime()) ? null : d;
      }
      if (typeof val === 'string') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d;
        const parts = val.split('-');
        if (parts.length === 3) {
          const [p0, p1, p2] = parts;
          if (p0.length !== 4) {
            const dd = +parts[0], mm = +parts[1], yyyy = +parts[2];
            const d2 = new Date(yyyy, mm - 1, dd);
            return isNaN(d2.getTime()) ? null : d2;
          }
        }
        return null;
      }
      if (typeof val === 'number') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
      }
      return null;
    };

    const startDate = toSafeDate(this.campaignConfigForm.get('startDate').value);
    const endDate = toSafeDate(this.campaignConfigForm.get('endDate').value);

    // --- (DATE/TIME RANGE LOGIC stays unchanged)
    if (!noExpiry && startDate && endDate) {
      const startHourNum = Number(startHour) || 0;
      const startMinuteNum = Number(startMinute) || 0;
      const endHourNum = Number(endHour) || 0;
      const endMinuteNum = Number(endMinute) || 0;

      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHourNum, startMinuteNum, 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(endHourNum, endMinuteNum, 0, 0);

      if (startDate.getTime() > endDate.getTime()) {
        this.toastr.error('Start Date cannot be greater than End Date.', 'Invalid Date Range');
        this.campaignConfigForm.get('startDate').setErrors({ invalidRange: true });
        this.campaignConfigForm.get('endDate').setErrors({ invalidRange: true });
        return;
      }

      const sameDay =
        startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0];

      if (sameDay) {
        const startMinTotal = startHourNum * 60 + startMinuteNum;
        const endMinTotal = endHourNum * 60 + endMinuteNum;
        if (endMinTotal <= startMinTotal) {
          this.toastr.error('End Time must be later than Start Time for the same date.', 'Invalid Time Range');
          endHourCtrl.setErrors({ invalidRange: true });
          endMinuteCtrl.setErrors({ invalidRange: true });
          return;
        }
      }

      if (endDateTime.getTime() <= startDateTime.getTime()) {
        this.toastr.error('End Date & Time must be later than Start Date & Time.', 'Invalid Schedule');
        endDateCtrl.setErrors({ invalidRange: true });
        return;
      }
    }

    // --- Preserve all existing form validation
    if (this.campaignConfigForm.invalid) {
      this.campaignConfigForm.markAllAsTouched();
      this.toastr.error('Form contains invalid values. Fix them before saving.', 'Validation Error');
      return;
    }

    // ======================================================================
    // NEW VALIDATION — REQUIRED WHEN Verify From Client = TRUE
    // ======================================================================
    const verifyFromClient = this.campaignConfigForm.get('verifyFromClient').value;
    const parLevelCtrl = this.campaignConfigForm.get('parLevel');
    const maxLimitCtrl = this.campaignConfigForm.get('maxLimit');

    if (verifyFromClient === true) {
      const parLevelVal = parLevelCtrl.value?.toString().trim();
      const maxLimitVal = maxLimitCtrl.value?.toString().trim();

      if (!parLevelVal || parLevelVal === '' || parLevelVal === '0') {
        parLevelCtrl.markAsTouched();
        parLevelCtrl.setErrors({ required: true });
        this.toastr.error('Par Level is required when Verify From Client is enabled.', 'Validation Error');
        return;
      }

      if (!maxLimitVal || maxLimitVal === '' || maxLimitVal === '0') {
        maxLimitCtrl.markAsTouched();
        maxLimitCtrl.setErrors({ required: true });
        this.toastr.error('Max Limit is required when Verify From Client is enabled.', 'Validation Error');
        return;
      }
    }
    // ======================================================================

    // Build TIME strings
    const startTime = this.formatTimeForSQL(startHourCtrl.value, startMinuteCtrl.value);
    const endTime = noExpiry ? null : this.formatTimeForSQL(endHourCtrl.value, endMinuteCtrl.value);

    // Prepare objects for API
    const branchValue = this.campaignConfigForm.get('branch').value;
    const panelValue = this.campaignConfigForm.get('panel').value;
    const testsValue = this.campaignConfigForm.get('tests').value;
    const cityValue = this.campaignConfigForm.get('cityIDs').value;

    // Utility: return -1 if not an array or empty
    const mapOrMinusOne = (arr, key) => {
      return Array.isArray(arr) && arr.length > 0
        ? arr.map(v => ({ [key]: v }))
        : -1;
    };

    const objParam = {
      CampaignID: this.campaignId,
      CampaignCode: this.campaignConfigForm.get('campaignCode').value?.toUpperCase().trim(),
      CampaignName: this.campaignConfigForm.get('campaignName').value?.trim(),
      Description: this.campaignConfigForm.get('description').value?.trim() || null,
      DiscountPercent: parseFloat(this.campaignConfigForm.get('discountPercent').value),
      StartDate: this.formatDateForSQL(this.campaignConfigForm.get('startDate').value),
      EndDate: noExpiry ? null : this.formatDateForSQL(this.campaignConfigForm.get('endDate').value),
      StartTime: startTime,
      EndTime: endTime,
      AutoApply: this.campaignConfigForm.get('autoApply').value ? 1 : 0,
      VerifyFromClient: verifyFromClient ? 1 : 0,
      ClientReference: this.campaignConfigForm.get('clientReference').value?.trim() || null,
      ParLevel: parseInt(parLevelCtrl.value) || 1,
      MaxLimit: parseInt(maxLimitCtrl.value) || 1,
      ClientAPIDetail: this.campaignConfigForm.get('clientAPIDetail').value?.trim() || null,
      ClientUsagePostAPI: this.campaignConfigForm.get('clientUsagePostAPI').value?.trim() || null,
      CreatedBy: this.loggedInUser?.userid || -99,
      CouponPrefix: this.campaignConfigForm.get('couponPrefix').value?.trim() || null,
      NumberOfCoupons: parseInt(this.campaignConfigForm.get('numberOfCoupons').value) || 0,
      MaxUsagePerCoupon: parseInt(this.campaignConfigForm.get('maxUsagePerCoupon').value) || 1,
      IsDeleted: 0,
      NonExpire: this.campaignConfigForm.get('noExpiry').value ? 1 : 0,

      // FIXED ARRAY HANDLING
      tblDTestProfile: mapOrMinusOne(testsValue, 'DTestProfileID'),
      // tblPanel2: mapOrMinusOne(panelValue, 'PanelID'),
      tblPanel: this.campaignConfigForm.get('numberOfCoupons').value ? [{ PanelID: this.campaignConfigForm.get('panel').value }] : -1 || -1,
      tblLocID: mapOrMinusOne(branchValue, 'LocID'),
      CityIDs: this.getCityIdsString()

    };

    console.log("objParam: ", objParam);
    // return;
    // Finally call API (existing logic)
    this.disabledButton = true;
    this.isSpinner = false;

    this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_CAMPAIGN_WITH_COUPONS, objParam)
      .subscribe({
        next: (data: any) => {
          this.disabledButton = false;
          this.isSpinner = true;

          switch (data.StatusCode) {
            case 200:
              this.toastr.success(data.Message || 'Campaign created successfully!');
              this.campaignConfigForm.reset();
              this.clickSubmit = false;
              this.campaignId = null;
              this.getCampaignList();
              break;

            case 400:
              this.handleValidationErrors(data.PayLoad);
              break;

            case 300:
              this.toastr.warning(data.Message || 'Operation completed but no data was returned.');
              break;

            case 500:
              this.toastr.error(data.Message || 'A server error occurred. Please try again later.');
              break;

            default:
              this.toastr.error(data.Message || 'An unexpected error occurred.');
              break;
          }
        },
        error: (err) => {
          this.disabledButton = false;
          this.isSpinner = true;
          console.error('API Error:', err);

          if (err.status === 0) {
            this.toastr.error('Unable to connect to server. Please check your internet connection.', 'Connection Error');
          } else if (err.status === 401) {
            this.toastr.error('Session expired. Please login again.', 'Authentication Error');
          } else if (err.status >= 500) {
            this.toastr.error('Server is temporarily unavailable. Please try again later.', 'Server Error');
          } else {
            this.toastr.error('An unexpected error occurred. Please try again.', 'Error');
          }
        }
      });
  }

  // Add this function in your component class (outside of prepareAndSubmit)
  private getCityIdsString(): string | null {
    const cityValue = this.campaignConfigForm.get('cityIDs')?.value;
    console.log('cityValue:', cityValue); // Add this to see what you're getting

    if (!cityValue) {
      return null;
    }

    // If it's already a string (comma-separated)
    if (typeof cityValue === 'string') {
      return cityValue;
    }

    // If it's an array
    if (Array.isArray(cityValue)) {
      if (cityValue.length === 0) return null;

      // Try to extract IDs based on what's in the array
      try {
        return cityValue.map(item => {
          // If item has CityID property
          if (item && item.CityID) {
            return item.CityID;
          }
          // If item is a number or string
          return item;
        }).join(',');
      } catch (error) {
        console.error('Error mapping city values:', error);
        return null;
      }
    }

    return null;
  }

  // Helper method to handle validation errors from API
  private handleValidationErrors(payload: any): void {
    if (payload && Array.isArray(payload)) {
      // If payload is an array of errors
      payload.forEach((error: any) => {
        if (error.Error) {
          this.toastr.error(error.Error, 'Validation Error');
        }
      });
    } else if (payload && typeof payload === 'object') {
      // If payload is a single error object
      if (payload.Error) {
        this.toastr.error(payload.Error, 'Validation Error');
      }
    } else if (typeof payload === 'string') {
      // If payload is a string
      this.toastr.error(payload, 'Validation Error');
    } else {
      this.toastr.error('Please check your input and try again.', 'Validation Error');
    }
  }

  validateDecimalNo(e: KeyboardEvent): boolean {
    const input = e.target as HTMLInputElement;
    const char = e.key;
    const value = input.value;

    // Allow navigation / control keys
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(char)) return true;

    // Allow only digits and one decimal point
    if (!/[\d.]/.test(char)) {
      e.preventDefault();
      return false;
    }

    // Block multiple decimals
    if (char === '.' && value.includes('.')) {
      e.preventDefault();
      return false;
    }

    // Restrict to two digits after decimal
    const parts = value.split('.');
    if (parts.length === 2 && parts[1].length >= 2 && input.selectionStart! > value.indexOf('.')) {
      e.preventDefault();
      return false;
    }

    return true;
  }
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
  makeCodeUpperCase(): void {
    const machineCodeControl = this.campaignConfigForm.get("campaignCode");
    if (machineCodeControl) {
      // Set the value to uppercase
      machineCodeControl.setValue(machineCodeControl.value.toUpperCase(), {
        emitEvent: false,
      });
    }
  }
  makePrefixUpperCase(): void {
    const machineCodeControl = this.campaignConfigForm.get("couponPrefix");
    if (machineCodeControl) {
      // Set the value to uppercase
      machineCodeControl.setValue(machineCodeControl.value.toUpperCase(), {
        emitEvent: false,
      });
    }
  }




  // Helper method to format time for SQL
  private formatTimeForSQL(hour: any, minute: any): string {
    const h = String(hour || '00').padStart(2, '0');
    const m = String(minute || '00').padStart(2, '0');
    return `${h}:${m}:00`; // SQL TIME format
  }

  // Helper method to format date for SQL (assuming you're using ngbDatepicker)
  private formatDateForSQL(dateObj: any): string {
    if (!dateObj) return null;

    // If it's already a string in dd-mm-yyyy format
    if (typeof dateObj === 'string') {
      const parts = dateObj.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to yyyy-mm-dd
      }
    }

    // If it's an NgbDateStruct
    if (dateObj.year && dateObj.month && dateObj.day) {
      const year = dateObj.year;
      const month = String(dateObj.month).padStart(2, '0');
      const day = String(dateObj.day).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return null;
  }
  rowIndexCampaign = null;
  rowIndexCoupon = null;
  campaignCoupons: any = [];
  campaignName: any = "";
  getCampaignCoupons(campaignId: number, campaignName?: string, rowIndexCampaign?: number) {
    this.newCampaign();
    this.mainChk = false;
    this.campaignId = null;
    this.rowIndexCampaign = rowIndexCampaign;
    this.rowIndexCoupon = null;
    this.campaignName = campaignName;
    this.spinner.show(this.spinnerRefs.listSectionCoupon);
    this.noCouponDataMessage = 'Coupons data are loading...';
    this.sharedService.getData(API_ROUTES.GET_CAMPAIGN_COUPONS, { CampaignID: campaignId }).subscribe(
      (resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSectionCoupon);
        this.campaignCoupons = resp.PayLoad || [];
        this.noCouponDataMessage = this.campaignCoupons.length ? '' : 'No coupons found';
      },
      err => this.toastr.error('Connection error')
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////begin:: Pre-populate the form for Edit////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////
  campainRow: any = {};
  campaignId: any = null;
  editCampaign(campaignId: number, rowIndexCampaign?: number): void {
    this.campaignId = null;
    this.rowIndexCampaign = rowIndexCampaign;

    if (!campaignId) {
      this.toastr.warning('Invalid campaign ID.');
      return;
    }

    this.sharedService.getData(API_ROUTES.GET_CAMPAIGN_ROW, { CampaignID: campaignId })
      .subscribe({
        next: (resp: any) => {
          const payload = resp?.PayLoad;

          if (Array.isArray(payload) && payload.length > 0) {
            this.campaignCoupons = [];
            this.noCouponDataMessage = 'Please select a campaign to get coupons';
            this.campainRow = payload[0];
            // console.log("Campaign Row: ", this.campainRow);
            this.campaignId = this.campainRow.CampaignID || null;

            const branchIds = this.parseCommaSeparatedIds(this.campainRow.LocIDs);
            const panelIds = this.parseCommaSeparatedIds(this.campainRow.PanelIDs);
            const testIds = this.parseCommaSeparatedIds(this.campainRow.DTestProfileIDs);
            const cityIds = this.parseCommaSeparatedIds(this.campainRow.CityIDs);

            this.campaignConfigForm.patchValue({
              campaignName: this.campainRow.CampaignName || '',
              campaignCode: this.campainRow.CampaignCode || '',
              discountPercent: this.campainRow.DiscountPercent ?? '',
              startDate: Conversions.getDateObjectByGivenDate(this.campainRow.StartDate),
              endDate: Conversions.getDateObjectByGivenDate(this.campainRow.EndDate),
              startHour: this.extractHour(this.campainRow.StartTime),
              startMinute: this.extractMinute(this.campainRow.StartTime),
              endHour: this.extractHour(this.campainRow.EndTime),
              endMinute: this.extractMinute(this.campainRow.EndTime),
              branch: branchIds,
              // panel: panelIds, PanelIDs
              panel: this.campainRow.PanelIDs
                ? Number(this.campainRow.PanelIDs)
                : null,
              tests: testIds,
              cityIDs: cityIds,
              autoApply: !!this.campainRow.AutoApply,
              verifyFromClient: !!this.campainRow.VerifyFromClient,
              clientReference: this.campainRow.ClientReferenceGUID || '',
              parLevel: this.campainRow.ParLevel || '',
              maxLimit: this.campainRow.MaxLimit || '',
              clientAPIDetail: this.campainRow.ClientAPIDetail || '',
              clientUsagePostAPI: this.campainRow.ClientUsagePostAPI || '',
              description: this.campainRow.Description || '',
              couponPrefix: this.campainRow.CouponPrefix || '',
              numberOfCoupons: this.campainRow.NumberOfCoupons || 0,
              maxUsagePerCoupon: this.campainRow.MaxUsagePerCoupon || 0,
              maxUsageCount: this.campainRow.MaxUsageCount || '',
              noExpiry: !!this.campainRow.NonExpire
            });

            // Resort dropdown lists
            this.branchList = this.sortDropdownList(this.branchList, branchIds, 'LocId', 'Title');
            this.panelsList = this.sortDropdownList(this.panelsList, panelIds, 'PanelId', 'CodeName');
            this.testProfileList = this.sortDropdownList(this.testProfileList, testIds, 'TPId', 'TestProfileCodeDesc');

            // Disable certain fields if editing existing record
            if (this.campaignId) {
              this.campaignConfigForm.get('campaignCode')?.disable({ emitEvent: false });
              this.campaignConfigForm.get('couponPrefix')?.disable({ emitEvent: false });
            } else {
              this.campaignConfigForm.get('campaignCode')?.enable({ emitEvent: false });
              this.campaignConfigForm.get('couponPrefix')?.enable({ emitEvent: false });
            }

            // ✅ Handle "No Expiry" checkbox auto-disable behavior
            const isNoExpiry = !!this.campainRow.NonExpire;
            const endDateCtrl = this.campaignConfigForm.get('endDate');
            const endHourCtrl = this.campaignConfigForm.get('endHour');
            const endMinuteCtrl = this.campaignConfigForm.get('endMinute');

            if (isNoExpiry) {
              // Clear and disable end fields
              endDateCtrl.setValue('');
              endHourCtrl.setValue('');
              endMinuteCtrl.setValue('');

              endDateCtrl.disable({ emitEvent: false });
              endHourCtrl.disable({ emitEvent: false });
              endMinuteCtrl.disable({ emitEvent: false });

              endDateCtrl.clearValidators();
              endHourCtrl.clearValidators();
              endMinuteCtrl.clearValidators();

              endDateCtrl.setErrors(null);
              endHourCtrl.setErrors(null);
              endMinuteCtrl.setErrors(null);
            } else {
              // Enable and reapply validators
              endDateCtrl.enable({ emitEvent: false });
              endHourCtrl.enable({ emitEvent: false });
              endMinuteCtrl.enable({ emitEvent: false });

              endDateCtrl.setValidators([Validators.required]);
              endHourCtrl.setValidators([Validators.required]);
              endMinuteCtrl.setValidators([Validators.required]);
            }

            // Update validation state
            endDateCtrl.updateValueAndValidity();
            endHourCtrl.updateValueAndValidity();
            endMinuteCtrl.updateValueAndValidity();
            this.campaignConfigForm.updateValueAndValidity();

            this.campaignConfigForm.markAsPristine();
          } else {
            this.campainRow = {};
            this.noCouponDataMessage = 'No Coupons found.';
            this.toastr.info('No campaign details found for the selected record.');
          }
        },
        error: (error) => {
          console.error('Error fetching campaign details:', error);
          this.toastr.error('Failed to load campaign details. Please try again later.');
        }
      });
  }


  private sortDropdownList<T>(
    list: T[],
    selectedIds: any[],
    idKey: keyof T,
    labelKey: keyof T
  ): T[] {
    return list
      .map(item => ({
        ...item,
        selected: selectedIds.includes(item[idKey])
      }))
      .sort((a: any, b: any) => {
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;
        return a[labelKey].toString().localeCompare(b[labelKey].toString());
      });
  }


  /**
   * Helper to convert comma-separated string → number[]
   */
  private parseCommaSeparatedIds(ids: string | null | undefined): number[] {
    if (!ids) return [];
    return ids
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(id => Number(id))
      .filter(id => !isNaN(id));
  }

  /**
   * Helper to format date (handles both ISO and short dates)
   */
  private formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]; // returns YYYY-MM-DD
  }

  /**
   * Helper to extract hour from time string "HH:mm:ss"
   */
  private extractHour(timeStr: string | null | undefined): string {
    return timeStr ? timeStr.split(':')[0] : '';
  }

  /**
   * Helper to extract minute from time string "HH:mm:ss"
   */
  private extractMinute(timeStr: string | null | undefined): string {
    return timeStr ? timeStr.split(':')[1] : '';
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////end:: Pre-populate the form for Edit////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////



  couponDetail: any[] = [];

  getCouponDetails(couponId: number, rowIndexCoupon?: number): void {
    // Set the selected row index if provided
    this.rowIndexCoupon = rowIndexCoupon;

    // Optional: show a loading spinner or disable UI while fetching data
    this.sharedService.getData(API_ROUTES.GET_COUPON_DETAIL_BY_COUPON_ID, { CouponID: couponId })
      .subscribe({
        next: (resp: any) => {
          // Safely extract payload
          this.couponDetail = Array.isArray(resp?.PayLoad) ? resp.PayLoad : [];

          // Check if data exists
          if (this.couponDetail.length > 0) {
            // Open modal only if data is available
            this.appPopupService.openModal(this.couponDetailModal, {
              backdrop: 'static',
              size: 'fss'
            });
          } else {
            this.appPopupService.openModal(this.couponDetailModal, {
              backdrop: 'static',
              size: 'fss'
            });
            // No data found, show toaster instead of empty modal
            this.toastr.info('No details available for the selected coupon.');
          }
        },
        error: (err) => {
          console.error('Error fetching coupon details:', err);
          this.toastr.error('Unable to fetch coupon details. Please try again later.');
        },
        complete: () => {
          // Optional: hide spinner if you added one
        }
      });
  }

  newCampaign(): void {
    this.campaignId = null;
    this.campaignConfigForm.get('campaignCode')?.enable({ emitEvent: false });
    this.campaignConfigForm.get('couponPrefix')?.enable({ emitEvent: false });
    this.campaignConfigForm.get('endDate')?.enable({ emitEvent: false });
    this.campaignConfigForm.get('endHour')?.enable({ emitEvent: false });
    this.campaignConfigForm.get('endMinute')?.enable({ emitEvent: false });
    this.campaignConfigForm.reset();
  }

  ///////////////////////////////////////////////////////////////
  //// begin:: On selection of dropdown clear the typed test /////
  ////////////////////////////////////////////////////////////////
  private testsDropdownOpened = false;
  onTestsDropdownOpen() {
    this.testsDropdownOpened = true;
  }
  onTestSelected() {
    // Give ng-select time to update the DOM before clearing
    setTimeout(() => {
      if (!this.testsDropdownOpened) return;

      const el = document.querySelector('#testsSelect .ng-input input') as HTMLInputElement;

      if (el) {
        el.value = '';                 // clear UI
        el.dispatchEvent(new Event('input')); // notify Angular
      }

    }, 120);  // Delay is necessary, 80–150ms works for all versions
  }
  private panelDropdownOpened = false;
  onPanelDropdownOpen() {
    this.panelDropdownOpened = true;
  }

  // onPanelSelected() {
  //   setTimeout(() => {
  //     if (!this.panelDropdownOpened) return;

  //     const el = document.querySelector('#tp_panel .ng-input input') as HTMLInputElement;

  //     if (el) {
  //       el.value = '';
  //       el.dispatchEvent(new Event('input'));
  //     }

  //   }, 120);
  // }

  private branchDropdownOpened = false;
  onBranchDropdownOpen() {
    this.branchDropdownOpened = true;
  }

  onBranchSelected() {
    setTimeout(() => {
      if (!this.branchDropdownOpened) return;

      const el = document.querySelector('#tp_branch .ng-input input') as HTMLInputElement;

      if (el) {
        el.value = '';
        el.dispatchEvent(new Event('input'));
      }

    }, 120);
  }

  ////////////////////////////////////////////////////////////////
  //// end:: On selection of dropdown clear the typed test ///////
  ////////////////////////////////////////////////////////////////


  mainChk = false;
  selectAllItems(isChecked: boolean): void {
    this.mainChk = isChecked;
    this.campaignCoupons.forEach(row => {
      // Only select if UsageCount == 0
      if (row.UsageCount === 0) {
        row.checked = isChecked;
      }
    });
    this.countSelectedCheckboxes();
  }


  selectedCheckboxesCount = 0;
  countSelectedCheckboxes() {
    const selectedCount = this.campaignCoupons.filter(item => item.checked).length;
    this.selectedCheckboxesCount = selectedCount;
  }

  // onSelectedCoupon(e) {
  //   const checked: boolean = e.checked
  //   if (checked == true) {
  //   }
  //   this.countSelectedCheckboxes();
  // }
  onSelectedCoupon(row: any): void {
    const selectableRows = this.campaignCoupons.filter(r => r.UsageCount === 0);
    const selectedRows = selectableRows.filter(r => r.checked);
    this.mainChk = selectableRows.length > 0 && selectedRows.length === selectableRows.length;
    this.countSelectedCheckboxes();
  }

  disabledButtonCouponRemove = false;
  isSpinnerCouponRemove = true;
  removeCoupon() {
    const checkedItems = this.campaignCoupons.filter(a => a.checked);

    if (!checkedItems.length) {
      this.toastr.warning('Please select at least one coupon to proceed.', 'No Coupon Selected');
      return;
    }

    const objParams = {
      CreatedBy: this.loggedInUser?.userid || -99,
      tblCouponIDs: checkedItems.map(a => ({ CouponID: a.CouponID || null }))
    };

    this.disabledButtonCouponRemove = true;
    this.isSpinnerCouponRemove = false;

    this.sharedService.insertUpdateData(API_ROUTES.REMOVE_COUPON, objParams).subscribe({
      next: (res: any) => {
        this.disabledButtonCouponRemove = false;
        this.isSpinnerCouponRemove = true;

        if (res.StatusCode === 200) {
          const payload = res.PayLoad?.[0];
          const deletedCount = payload?.DeletedCoupons || 0;
          const message = res.Message || 'Coupons processed successfully.';

          if (deletedCount > 0) {
            this.toastr.success(`${message}`, 'Success');

            // Remove successfully deleted coupons from list
            const deletedIds = checkedItems.map(x => x.CouponID);
            this.campaignCoupons = this.campaignCoupons.filter(c => !deletedIds.includes(c.CouponID));

            // Reset select-all checkbox if all got removed
            if (!this.campaignCoupons.length) this.mainChk = false;
          } else {
            this.toastr.info('No coupons were deleted. They might have already been used.', 'Info');
          }
        } else if (res.StatusCode === 400) {
          const validationMessages = res.PayLoad?.map((v: any) => v.ErrorMessage).join('\n') || 'Validation failed.';
          this.toastr.warning(validationMessages, 'Invalid Input');
        } else if (res.StatusCode === 204) {
          this.toastr.info(res.Message || 'No coupons deleted. They might already be used.', 'Info');
        } else if (res.StatusCode === 500) {
          this.toastr.error(res.Message || 'Server error occurred while deleting coupons.', 'Error');
        } else {
          this.toastr.error('Unexpected response received from server.', 'Error');
        }
      },
      error: (err) => {
        console.error('Remove Coupon (Bulk) Error:', err);
        this.disabledButtonCouponRemove = false;
        this.isSpinnerCouponRemove = true;
        this.toastr.error('Connection error. Please try again later.', 'Network Error');
      }
    });
  }

  removeCouponSingle(couponId: number) {
    const objParams = {
      CreatedBy: this.loggedInUser?.userid || -99,
      tblCouponIDs: [{ CouponID: couponId }]
    };

    this.sharedService.insertUpdateData(API_ROUTES.REMOVE_COUPON, objParams).subscribe({
      next: (res: any) => {
        if (res.StatusCode === 200) {
          const payload = res.PayLoad?.[0];
          const deletedCount = payload?.DeletedCoupons || 0;
          const message = res.Message || 'Coupon processed successfully.';

          if (deletedCount > 0) {
            this.toastr.success(`${message}`, 'Success');

            // Remove this single coupon from the list
            this.campaignCoupons = this.campaignCoupons.filter(c => c.CouponID !== couponId);
          } else {
            this.toastr.info('Coupon could not be deleted. It might have already been used.', 'Info');
          }
        } else if (res.StatusCode === 400) {
          const validationMessages = res.PayLoad?.map((v: any) => v.ErrorMessage).join('\n') || 'Validation failed.';
          this.toastr.warning(validationMessages, 'Invalid Input');
        } else if (res.StatusCode === 204) {
          this.toastr.info(res.Message || 'No coupon deleted.', 'Info');
        } else if (res.StatusCode === 500) {
          this.toastr.error(res.Message || 'Server error occurred while deleting the coupon.', 'Error');
        } else {
          this.toastr.error('Unexpected response received from server.', 'Error');
        }
      },
      error: (err) => {
        console.error('Remove Coupon (Single) Error:', err);
        this.toastr.error('Connection error. Please try again later.', 'Network Error');
      }
    });
  }

  onNoExpiry(e: MatCheckboxChange) {
    const isChecked = e.checked;

    const endDateCtrl = this.campaignConfigForm.get('endDate');
    const endHourCtrl = this.campaignConfigForm.get('endHour');
    const endMinuteCtrl = this.campaignConfigForm.get('endMinute');

    if (isChecked) {
      // Clear end fields values
      endDateCtrl.setValue('');
      endHourCtrl.setValue('');
      endMinuteCtrl.setValue('');

      // Disable end fields
      endDateCtrl.disable();
      endHourCtrl.disable();
      endMinuteCtrl.disable();

      // Remove validators for end fields only
      endDateCtrl.clearValidators();
      endHourCtrl.clearValidators();
      endMinuteCtrl.clearValidators();

      // Clear their errors (only for these fields)
      endDateCtrl.setErrors(null);
      endHourCtrl.setErrors(null);
      endMinuteCtrl.setErrors(null);
    } else {
      // Enable end fields again
      endDateCtrl.enable();
      endHourCtrl.enable();
      endMinuteCtrl.enable();

      // Reapply required validators
      endDateCtrl.setValidators([Validators.required]);
      endHourCtrl.setValidators([Validators.required]);
      endMinuteCtrl.setValidators([Validators.required]);
    }

    // ✅ Update validation for just these fields
    endDateCtrl.updateValueAndValidity();
    endHourCtrl.updateValueAndValidity();
    endMinuteCtrl.updateValueAndValidity();

    // ✅ Recheck overall form validity (this is what fixes the problem)
    this.campaignConfigForm.updateValueAndValidity();
  }


  onVerifyFromClient(isChecked: boolean) {
    const parLevelCtrl = this.campaignConfigForm.get('parLevel');
    const maxLimitCtrl = this.campaignConfigForm.get('maxLimit');
    const clientRefCtrl = this.campaignConfigForm.get('clientReference');

    if (isChecked) {
      // Make required
      parLevelCtrl.setValidators([Validators.required]);
      maxLimitCtrl.setValidators([Validators.required]);
      clientRefCtrl.setValidators([Validators.required]);
    } else {
      // Make optional
      parLevelCtrl.clearValidators();
      maxLimitCtrl.clearValidators();
      clientRefCtrl.clearValidators();

      // Clear errors
      parLevelCtrl.setErrors(null);
      maxLimitCtrl.setErrors(null);
      clientRefCtrl.setErrors(null);
    }

    // Update validation states
    parLevelCtrl.updateValueAndValidity();
    maxLimitCtrl.updateValueAndValidity();
    clientRefCtrl.updateValueAndValidity();

    this.campaignConfigForm.updateValueAndValidity();
  }



}
