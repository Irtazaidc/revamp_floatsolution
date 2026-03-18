// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SampleTrackingService } from '../../services/sample-tracking.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,

  selector: 'app-sample-dispatch',
  templateUrl: './sample-dispatch.component.html',
  styleUrls: ['./sample-dispatch.component.scss']
})
export class SampleDispatchComponent implements OnInit {
  @ViewChild('dateFrom') dateFrom: NgbDatepicker;
  @ViewChild('dateTo') dateTo: NgbDatepicker;

  noDataMessage = "Please select date range or PIN";
  isValidDateRange = true;

  public formFields = {
    dateFrom: [null, ''],
    dateTo: [null, ''],
    visitID: [null, ''],
  };

  spinnerRefs = {
    listSection: 'listSection',
    formSection: "formSection"
  };

  paramsForm: FormGroup = this.formBuilder.group(this.formFields);
  dispatchForm: FormGroup;
  loggedInUser: UserModel;

  searchText: any = "";
  samplesList: any = [];
  groupedSamples: any[] = [];
  branches: any[] = [];
  riders: any[] = [];
  rowIndex: number = null;
  isLoading: boolean = false;
  isCreatingBatch: boolean = false;
  selectedFile: File | null = null;

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

  // New properties for expand/collapse functionality
  allExpanded: boolean = true;

  // New property for select/deselect toggle
  allItemsSelected: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private srv: SampleTrackingService
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.initDispatchForm();
    this.paramsForm.patchValue({
      dateFrom: Conversions.getCurrentDateObject(),
      dateTo: Conversions.getCurrentDateObject()
    });
    // this.getDataForBatch();
    this.loadBranches();
    this.loadRiders();
    this.getSampleTrackingLookup();
  }

  initDispatchForm() {
    this.dispatchForm = this.formBuilder.group({
      fromLocId: [this.loggedInUser?.locationid || ''],
      toLocId: [null, Validators.required],
      transportMediumName: [null, Validators.required], // This will store the Id value
      riderId: [null],
      transportDetail: [''],
      transportReferenceNo: [''],
      courierCompanyName: [''],
      publicTransportName: [''],
      arrivalLocationDetail: [''],
      estimatedCost: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      actualCost: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      expectedArrivalTime: [''],
      receiptTitle: [''],
      remarks: ['']
    });
  }


  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  loadBranches() {
    // Load branches from your service
    this.srv.getData(API_ROUTES.LOOKUP_GET_BRANCHES, {}).subscribe((resp: any) => {
      if (resp && resp.PayLoad && resp.StatusCode === 200) {
        this.branches = resp.PayLoad;
      }
    }, (err) => {
      console.log("Error loading branches", err);
    });
  }

  loadRiders() {
    let params = {
      RiderID: 0,
      LocID: null
    }
    this.srv.getData(API_ROUTES.GET_RIDERS_DETAIL, {}).subscribe((resp: any) => {
      this.riders = resp.PayLoad;
    }, (err) => { console.log(err) })
  }


  // Handle transport medium change
  onTransportMediumChange() {
    const mediumId = this.dispatchForm.get('transportMediumName').value;

    // Find the selected medium description if needed
    const selectedMedium = this.transportMediums.find((m: any) => m.Id === mediumId);

    // Reset conditional fields
    this.dispatchForm.patchValue({
      riderId: null,
      courierCompanyName: '',
      publicTransportName: '',
      transportDetail: '',
      transportReferenceNo: ''
    });

    // Update validators based on selection
    const riderIdControl = this.dispatchForm.get('riderId');
    const courierCompanyControl = this.dispatchForm.get('courierCompanyName');
    const publicTransportControl = this.dispatchForm.get('publicTransportName');
    const transportDetailControl = this.dispatchForm.get('transportDetail');
    const transportRefControl = this.dispatchForm.get('transportReferenceNo');

    // Clear all validators first
    riderIdControl.clearValidators();
    courierCompanyControl.clearValidators();
    publicTransportControl.clearValidators();
    transportDetailControl.clearValidators();
    transportRefControl.clearValidators();

    // Set validators based on medium ID
    switch (mediumId) {
      case 1: // OwnRider
        riderIdControl.setValidators([Validators.required]);
        break;
      case 2: // Public Transport
        publicTransportControl.setValidators([Validators.required]);
        transportDetailControl.setValidators([Validators.required]);
        transportRefControl.setValidators([Validators.required]);
        break;
      case 3: // Courier Company
        courierCompanyControl.setValidators([Validators.required]);
        transportRefControl.setValidators([Validators.required]);
        break;
    }

    // Update validity
    riderIdControl.updateValueAndValidity();
    courierCompanyControl.updateValueAndValidity();
    publicTransportControl.updateValueAndValidity();
    transportDetailControl.updateValueAndValidity();
    transportRefControl.updateValueAndValidity();
  }

  isSpinnerSearch: boolean = true;
  disabledButtonSearch: boolean = false;
  getDataForBatch() {
    let formValues = this.paramsForm.getRawValue();
    let visitID = formValues.visitID;

    if ((!formValues.dateFrom || !formValues.dateTo) && !visitID) {
      this.toastr.error('Please Select Date Range');
      this.isValidDateRange = false;
      return;
    } else {
      this.isValidDateRange = true;
    }

    // Date validation
    if (formValues.dateFrom && formValues.dateTo) {
      const dateFrom = formValues.dateFrom;
      const dateTo = formValues.dateTo;
      const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
      const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

      if (toDate < fromDate) {
        this.toastr.error('DateTo should be equal or greater than DateFrom');
        this.isValidDateRange = false;
        return;
      }

      const maxDaysDifference = 30;
      const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

      if (daysDifference > maxDaysDifference) {
        this.toastr.error('The difference between dates should not exceed 1 month');
        this.isValidDateRange = false;
        return;
      }
    }

    this.isValidDateRange = true;
    formValues.dateFrom = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    formValues.dateTo = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;

    if ((formValues.dateFrom && formValues.dateTo) || formValues.visitID) {
      this.noDataMessage = "Loading data... Please wait a while.";
      this.searchText = '';
      this.samplesList = [];
      this.groupedSamples = [];
      this.isLoading = true;

      this.spinner.show(this.spinnerRefs.listSection);

      let params = {
        FromLocId: this.loggedInUser.locationid || -99,
        FromDate: formValues.dateFrom ? formValues.dateFrom : null,
        ToDate: formValues.dateTo ? formValues.dateTo : null,
        VisitId: formValues.visitID ? formValues.visitID.replaceAll('-', '') : null
      };
      this.isSpinnerSearch = false;
      this.disabledButtonSearch = true;
      this.srv.getData(API_ROUTES.GET_SAMPLES_ELIGIBLE_FOR_DISPATCH, params).subscribe((resp: any) => {
        this.isSpinnerSearch = true;
        this.disabledButtonSearch = false;
        this.noDataMessage = "";
        this.spinner.hide(this.spinnerRefs.listSection);
        this.isLoading = false;

        if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
          this.samplesList = resp.PayLoad;
          this.groupSamples();
        } else {
          this.groupedSamples = [];
          this.noDataMessage = "No data found";
        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.isLoading = false;
        this.isSpinnerSearch = true;
        this.disabledButtonSearch = false;
        console.log("Err", err);
        this.toastr.error('Error loading samples');
      });
    } else {
      this.toastr.error("Please select date range");
    }
  }

  groupSamples() {
    const groupedByVisit = new Map();

    this.samplesList.forEach(item => {
      // Group by PIN
      if (!groupedByVisit.has(item.PIN)) {
        groupedByVisit.set(item.PIN, {
          visitId: item.PIN,
          patientName: item.PatientName,
          patientAge: item.PatientAge,
          gender: item.Gender,
          phone: item.Phone,
          cell: item.Cell,
          checked: false,
          partialChecked: false,
          expanded: true, // Add expanded property default true
          barcodes: new Map(),
          originalData: item
        });
      }

      const visit = groupedByVisit.get(item.PIN);

      // Group by Barcode within Visit
      if (!visit.barcodes.has(item.Barcode)) {
        visit.barcodes.set(item.Barcode, {
          barcode: item.Barcode,
          sampleType: item.SampleType || 'Blood',
          checked: false,
          allTestsChecked: false,
          expanded: true, // Add expanded property default true
          tests: []
        });
      }

      const barcode = visit.barcodes.get(item.Barcode);

      // Add test to barcode
      barcode.tests.push({
        tpId: item.TPId,
        tpCode: item.TPCode,
        tpName: item.TPName || item.TPCode,
        status: item.TestStatus || 'Pending',
        checked: false,
        originalData: item
      });
    });

    // Convert Maps to arrays
    this.groupedSamples = Array.from(groupedByVisit.values()).map(visit => ({
      ...visit,
      barcodes: Array.from(visit.barcodes.values())
    }));
  }

  // Checkbox change handlers
  onVisitCheckChange(visit: any, checked: boolean) {
    visit.checked = checked;
    visit.partialChecked = false;

    // Check/uncheck all barcodes and tests under this visit
    visit.barcodes.forEach((barcode: any) => {
      barcode.checked = checked;
      barcode.allTestsChecked = checked;
      barcode.tests.forEach((test: any) => test.checked = checked);
    });

    this.updateAllItemsSelectedStatus();
  }

  onBarcodeCheckChange(visit: any, barcode: any, checked: boolean) {
    barcode.checked = checked;
    barcode.allTestsChecked = checked;

    // Check/uncheck all tests under this barcode
    barcode.tests.forEach((test: any) => test.checked = checked);

    // Update visit checked status based on barcodes
    this.updateVisitCheckedStatus(visit);
    this.updateAllItemsSelectedStatus();
  }

  onTestCheckChange(visit: any, barcode: any, test: any, checked: boolean) {
    test.checked = checked;

    // Update barcode checked status based on tests
    const allTestsChecked = barcode.tests.every((t: any) => t.checked);
    const anyTestChecked = barcode.tests.some((t: any) => t.checked);

    barcode.allTestsChecked = allTestsChecked;
    barcode.checked = anyTestChecked;

    // Update visit checked status
    this.updateVisitCheckedStatus(visit);
    this.updateAllItemsSelectedStatus();
  }

  updateVisitCheckedStatus(visit: any) {
    const allBarcodesChecked = visit.barcodes.every((b: any) => b.checked);
    const anyBarcodeChecked = visit.barcodes.some((b: any) => b.checked);

    visit.checked = allBarcodesChecked;
    visit.partialChecked = !allBarcodesChecked && anyBarcodeChecked;
  }

  // Selection helpers
  selectAll() {
    this.groupedSamples.forEach(visit => {
      visit.checked = true;
      visit.partialChecked = false;
      visit.barcodes.forEach((barcode: any) => {
        barcode.checked = true;
        barcode.allTestsChecked = true;
        barcode.tests.forEach((test: any) => test.checked = true);
      });
    });
    this.allItemsSelected = true;
  }

  deselectAll() {
    this.groupedSamples.forEach(visit => {
      visit.checked = false;
      visit.partialChecked = false;
      visit.barcodes.forEach((barcode: any) => {
        barcode.checked = false;
        barcode.allTestsChecked = false;
        barcode.tests.forEach((test: any) => test.checked = false);
      });
    });
    this.allItemsSelected = false;
  }

  resetSelection() {
    this.deselectAll();
    this.dispatchForm.reset({
      transportMediumName: ''
    });
    this.selectedFile = null;
  }

  // New method to toggle select/deselect all
  toggleSelectAll() {
    if (this.allItemsSelected) {
      this.deselectAll();
    } else {
      this.selectAll();
    }
  }

  // New method to update the allItemsSelected status
  updateAllItemsSelectedStatus() {
    // Check if all items are selected
    let totalTests = 0;
    let selectedTests = 0;

    this.groupedSamples.forEach(visit => {
      visit.barcodes.forEach((barcode: any) => {
        barcode.tests.forEach((test: any) => {
          totalTests++;
          if (test.checked) {
            selectedTests++;
          }
        });
      });
    });

    this.allItemsSelected = totalTests > 0 && selectedTests === totalTests;
  }

  // Count methods
  getTotalSamplesCount(visit: any): number {
    return visit.barcodes.length;
  }

  getSelectedSamplesCount(visit: any): number {
    return visit.barcodes.filter((b: any) => b.checked).length;
  }

  getSelectedTestsCount(barcode?: any): number {
    if (barcode) {
      return barcode.tests.filter((t: any) => t.checked).length;
    }

    // Global count
    let count = 0;
    this.groupedSamples.forEach(visit => {
      visit.barcodes.forEach((barcode: any) => {
        count += barcode.tests.filter((t: any) => t.checked).length;
      });
    });
    return count;
  }

  getSelectedBarcodesCount(): number {
    let count = 0;
    this.groupedSamples.forEach(visit => {
      count += visit.barcodes.filter((b: any) => b.checked).length;
    });
    return count;
  }

  getSelectedVisitsCount(): number {
    return this.groupedSamples.filter((v: any) => v.checked).length;
  }

  getSelectedItemsCount(): number {
    return this.getSelectedTestsCount();
  }

  // Expand/Collapse methods
  toggleVisitExpand(visit: any) {
    visit.expanded = !visit.expanded;
    this.updateAllExpandedStatus();
  }

  toggleBarcodeExpand(barcode: any) {
    barcode.expanded = !barcode.expanded;
    this.updateAllExpandedStatus();
  }

  toggleExpandCollapseAll() {
    this.allExpanded = !this.allExpanded;

    this.groupedSamples.forEach(visit => {
      visit.expanded = this.allExpanded;
      visit.barcodes.forEach((barcode: any) => {
        barcode.expanded = this.allExpanded;
      });
    });
  }

  updateAllExpandedStatus() {
    let allExpanded = true;

    for (let visit of this.groupedSamples) {
      if (!visit.expanded) {
        allExpanded = false;
        break;
      }
      for (let barcode of visit.barcodes) {
        if (!barcode.expanded) {
          allExpanded = false;
          break;
        }
      }
    }

    this.allExpanded = allExpanded;
  }

  // File upload
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  printBatchLabel(batchNo: number) {
    if (!batchNo) {
      this.toastr.warning('Batch number not found');
      return;
    }

    const url = environment.patientReportsPortalUrl + 'batch-bc?p=' +
      btoa(JSON.stringify({
        batchNo: batchNo,
        appName: 'WebMedicubes:sampleTracking',
        timeStemp: +new Date()
      }));
    window.open(url.toString(), '_blank');
  }

  validateDateDifference(index) {
    const formValues = this.paramsForm.getRawValue();
    if (!formValues.dateFrom || !formValues.dateTo) return;

    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.isValidDateRange = false;
      this.toastr.error('DateTo should be equal or greater than DateFrom');
    }
    const daysDifference = (toDate - fromDate) / (1000 * 3600 * 24);
    if (daysDifference > 30) {
      this.isValidDateRange = false;
      this.toastr.error('The difference between dates should not exceed 1 month');
    }
  }

  setSearchFilter() {
    let visitID = this.paramsForm.getRawValue().visitID;
    if (visitID) {
      this.paramsForm.patchValue({
        dateFrom: "",
        dateTo: ""
      });
    } else {
      this.paramsForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject()
      });
    }
  }

  searchByVisit() {
    this.getDataForBatch();
  }

  validateDecimalNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    const charStr = String.fromCharCode(charCode);
    const inputValue = e.target.value;

    // Allow control keys (like backspace, delete, arrow keys, etc.)
    if (charCode <= 31) {
      return true;
    }

    // Allow only digits and one decimal point
    if ((charCode >= 48 && charCode <= 57) || (charStr === '.' && !inputValue.includes('.'))) {
      return true;
    }

    // Prevent any other characters
    return false;
  }

  transportMediums: any = [];

  getSampleTrackingLookup() {
    let objParams = {
      LookupName: 'TransportMedium',
      Id: null
    };

    this.srv.getData(API_ROUTES.GET_SAMPLE_TRACKING_LOOKUP, objParams).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        if (data.PayLoad && data.PayLoad.length > 0) {
          this.transportMediums = data.PayLoad;
        } else {
          this.transportMediums = [];
        }
      } else {
        console.log('Error response:', data.Message);
        this.toastr.error(data.Message || 'Error loading lookup data');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    });
  }

  // /////////////////////////////////// Creat batch ///////////////////////////////
  isSpinnerSearchDispatch: boolean = true;

  createBatch(isDraft: boolean = false) {
    // Mark all fields as touched to show validation errors
    Object.keys(this.dispatchForm.controls).forEach(key => {
      const control = this.dispatchForm.get(key);
      control?.markAsTouched();
    });

    // Check required fields based on transport medium
    let isValidRequired = false;
    const mediumId = this.dispatchForm.get('transportMediumName')?.value;
    const missingFields = [];

    // Basic required fields
    if (!this.dispatchForm.get('toLocId')?.value) {
      isValidRequired = true;
      missingFields.push('Destination Branch');
    }

    if (!mediumId) {
      isValidRequired = true;
      missingFields.push('Transport Medium');
    }

    // Conditional validation based on transport medium
    if (mediumId === 1) { // OwnRider
      if (!this.dispatchForm.get('riderId')?.value) {
        isValidRequired = true;
        missingFields.push('Rider');
      }
    } else if (mediumId === 2) { // Public Transport
      if (!this.dispatchForm.get('publicTransportName')?.value) {
        isValidRequired = true;
        missingFields.push('Public Transport Name');
      }
      if (!this.dispatchForm.get('transportReferenceNo')?.value) {
        isValidRequired = true;
        missingFields.push('Reference Number');
      }
      if (!this.dispatchForm.get('transportDetail')?.value) {
        isValidRequired = true;
        missingFields.push('Transport Details');
      }
    } else if (mediumId === 3) { // Courier Company
      if (!this.dispatchForm.get('courierCompanyName')?.value) {
        isValidRequired = true;
        missingFields.push('Courier Company Name');
      }
      if (!this.dispatchForm.get('transportReferenceNo')?.value) {
        isValidRequired = true;
        missingFields.push('Tracking Number');
      }
    }

    // Check if any items are selected
    let hasSelectedItems = false;
    this.groupedSamples.forEach(visit => {
      visit.barcodes.forEach((barcode: any) => {
        barcode.tests.forEach((test: any) => {
          if (test.checked) {
            hasSelectedItems = true;
          }
        });
      });
    });

    if (!hasSelectedItems) {
      this.toastr.error("Please select at least one test item");
      return;
    }

    // Show validation error if required fields missing
    if (isValidRequired) {
      this.toastr.error(`Please fill required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Prepare items for the request (matching TVP structure)
    const items = [];
    this.groupedSamples.forEach(visit => {
      visit.barcodes.forEach((barcode: any) => {
        barcode.tests.forEach((test: any) => {
          if (test.checked) {
            // Clean VisitId - remove any non-numeric characters
            const cleanVisitId = visit.visitId.toString().replace(/\D/g, '');

            items.push({
              visitId: parseFloat(cleanVisitId),
              labId: barcode.barcode.toString(),
              tpId: test.tpId
            });
          }
        });
      });
    });

    // Prepare request object matching the DTO
    const formValues = this.dispatchForm.getRawValue();

    // Base request data without file
    const requestData: any = {
      // Location fields
      fromLocId: this.loggedInUser?.locationid,
      toLocId: formValues.toLocId,

      // Transport medium (ID from lookup)
      transportMediumId: mediumId,

      // Own Rider
      riderId: formValues.riderId,

      // Transport details
      transportDetail: formValues.transportDetail || null,
      transportReferenceNo: formValues.transportReferenceNo || null,

      // Specific transport names
      courierCompanyName: formValues.courierCompanyName || null,
      publicTransportName: formValues.publicTransportName || null,

      // Arrival details
      arrivalLocationDetail: formValues.arrivalLocationDetail || null,

      // Cost fields
      estimatedCost: formValues.estimatedCost ? parseFloat(formValues.estimatedCost) : null,
      actualCost: formValues.actualCost ? parseFloat(formValues.actualCost) : null,

      // Time field
      expectedArrivalTime: formValues.expectedArrivalTime || null,

      // Receipt fields
      receiptTitle: formValues.receiptTitle || null,

      // Remarks
      remarks: formValues.remarks || null,

      // Batch status (1 = Draft, 2 = Dispatched)
      batchStatusId: isDraft ? 1 : 2,

      // Metadata
      createdBy: this.loggedInUser?.userid,

      // Items collection
      items: items
    };

    // Show loading state
    this.spinner.show(this.spinnerRefs.formSection);
    this.isCreatingBatch = true;
    this.disabledButton = true;
    this.isSpinner = false;

    // Determine API route based on action
    const apiRoute = isDraft
      ? API_ROUTES.CREATE_DRAFT
      : API_ROUTES.DISPATCH;

    this.isSpinnerSearchDispatch = false;
    setTimeout(() => {
      this.isSpinnerSearchDispatch = true;
    }, 3000);

    // If file is selected, convert to base64 and include in request
    if (this.selectedFile) {
      // Validate file type
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
      const fileExt = this.selectedFile.name.substring(this.selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (!allowedTypes.includes(fileExt)) {
        this.toastr.error('Only JPG, PNG, and PDF files are allowed');
        this.spinner.hide(this.spinnerRefs.formSection);
        this.isCreatingBatch = false;
        this.disabledButton = false;
        this.isSpinner = true;
        return;
      }

      // Validate file size (5MB max)
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.toastr.error('File size cannot exceed 5MB');
        this.spinner.hide(this.spinnerRefs.formSection);
        this.isCreatingBatch = false;
        this.disabledButton = false;
        this.isSpinner = true;
        return;
      }

      this.convertFileToBase64(this.selectedFile).then(base64Data => {
        // Add file data to request
        requestData.receiptFileBase64 = base64Data;
        requestData.fileName = this.selectedFile!.name;

        // Send the request
        this.sendCreateBatchRequest(apiRoute, requestData);
      }).catch(error => {
        this.spinner.hide(this.spinnerRefs.formSection);
        this.isCreatingBatch = false;
        this.disabledButton = false;
        this.isSpinner = true;
        this.toastr.error('Error processing file');
        console.error('File conversion error:', error);
      });
    } else {
      // No file, send request directly
      this.sendCreateBatchRequest(apiRoute, requestData);
    }
  }

  // New method to send the request
  sendCreateBatchRequest(apiRoute: string, requestData: any) {
    this.srv.insertUpdateData(apiRoute, requestData).subscribe({
      next: (data: any) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        this.isCreatingBatch = false;
        this.disabledButton = false;
        this.isSpinner = true;

        if (data.StatusCode === 201) {
          const successMsg = requestData.batchStatusId === 1 ? 'Draft batch created successfully' : 'Batch dispatched successfully';
          this.toastr.success(data.Message || successMsg);

          // Refresh data
          this.getDataForBatch();
          this.resetSelection();

          // Optionally print batch label
          if (data.PayLoad && data.PayLoad.length > 0) {
            const BatchNo = data.PayLoad[0].BatchNo;
            this.printBatchLabel(BatchNo);
          }
        } else {
          // Show validation errors from API if any
          if (data.PayLoad && Array.isArray(data.PayLoad)) {
            data.PayLoad.forEach((msg: string) => {
              this.toastr.error(msg);
            });
          } else {
            this.toastr.error(data.Message || 'Error creating batch');
          }
        }
      },
      error: (err) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        this.isCreatingBatch = false;
        this.disabledButton = false;
        this.isSpinner = true;

        console.error('Error creating batch:', err);

        // Show validation errors from API if any
        if (err.error?.PayLoad && Array.isArray(err.error.PayLoad)) {
          err.error.PayLoad.forEach((msg: string) => {
            this.toastr.error(msg);
          });
        } else {
          this.toastr.error('Connection error');
        }
      }
    });
  }

  // Convenience methods
  createDraftBatch() {
    this.createBatch(true);
  }

  dispatchBatch() {
    this.createBatch(false);
  }

  // Add these properties for button states
  disabledButton: boolean = false;
  isSpinner: boolean = true;

  // Add this method for file conversion
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Add this method to get today's date in the format required by datetime-local
  getTodayDateTime(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Add this method to validate the date on change
  validateExpectedArrivalTime(event: any) {
    const selectedDate = new Date(event.target.value);
    const today = new Date();

    // Set time to midnight for date comparison only
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.toastr.warning('Expected Arrival Time cannot be in the past');
      this.dispatchForm.patchValue({ expectedArrivalTime: '' });
    }
  }
}