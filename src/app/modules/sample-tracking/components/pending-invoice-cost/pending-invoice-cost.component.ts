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

@Component({
  standalone: false,

  selector: 'app-pending-invoice-cost',
  templateUrl: './pending-invoice-cost.component.html',
  styleUrls: ['./pending-invoice-cost.component.scss']
})
export class PendingInvoiceCostComponent implements OnInit {

  @ViewChild('dateFrom') dateFrom: NgbDatepicker;
  @ViewChild('dateTo') dateTo: NgbDatepicker;

  // Filter Form
  paramsForm: FormGroup;
  isValidDateRange = true;
  isSpinnerSearch = true;
  disabledButtonSearch = false;

  // Data
  pendingBatches: any[] = [];
  selectedBatch: any = null;
  selectedFile: File | null = null;

  // UI States
  isLoading = false;
  isUpdating = false;
  noDataMessage = "Please select date range or Batch # to search";

  // Update Form
  updateForm: FormGroup;

  // User Info
  loggedInUser: UserModel;

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please confirm...!',
    popoverMessage: 'Are you <b>sure</b> you want to update?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  };

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private srv: SampleTrackingService
  ) { }

  ngOnInit(): void {
    this.noDataMessage = "Please select date range or Batch # to search";
    this.loadLoggedInUserInfo();
    this.initForms();
    this.loadInitialData();

    // Watch for actual cost changes
    this.updateForm.get('actualCost')?.valueChanges.subscribe(value => {
      // No need to clear file when cost is entered
      // Users can now update both at the same time
    });
  }

  initForms() {
    // Filter Form
    this.paramsForm = this.formBuilder.group({
      dateFrom: [Conversions.getCurrentDateObject()],
      dateTo: [Conversions.getCurrentDateObject()],
      batchNo: ['']
    });

    // Update Form
    this.updateForm = this.formBuilder.group({
      actualCost: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      receiptTitle: [''],
      remarks: ['']
    });
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  setSearchFilter() {
    const batchNo = this.paramsForm.getRawValue().batchNo;
    if (batchNo) {
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

  loadInitialData() {
    this.paramsForm.patchValue({
      dateFrom: Conversions.getCurrentDateObject(),
      dateTo: Conversions.getCurrentDateObject()
    });
    // this.getPendingBatches();
  }

  getPendingBatches() {
    const formValues = this.paramsForm.getRawValue();

    // Date validation
    if (formValues.dateFrom && formValues.dateTo) {
      if (!this.validateDates(formValues)) {
        return;
      }
    }

    // Format dates
    const fromDate = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    const toDate = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;

    this.isLoading = true;
    this.noDataMessage = "Loading pending batches...";
    this.isSpinnerSearch = false;
    this.disabledButtonSearch = true;

    const params = {
      FromLocId: this.loggedInUser.locationid,
      FromDate: fromDate,
      ToDate: toDate,
      BatchNo: formValues.batchNo || null
    };

    this.srv.getData(API_ROUTES.GET_PENDING_INVOICE_BATCHES, params).subscribe({
      next: (resp: any) => {
        this.isSpinnerSearch = true;
        this.disabledButtonSearch = false;
        this.isLoading = false;

        if (resp && resp.StatusCode === 200 && resp.PayLoad && resp.PayLoad.length > 0) {
          this.processBatchData(resp.PayLoad);
          this.noDataMessage = "";
        } else {
          this.pendingBatches = [];
          this.selectedBatch = null;
          this.noDataMessage = "No pending batches found";
        }
      },
      error: (err) => {
        this.isSpinnerSearch = true;
        this.disabledButtonSearch = false;
        this.isLoading = false;
        console.error('Error loading pending batches:', err);
        this.toastr.error('Error loading pending batches');
      }
    });
  }

  processBatchData(batches: any[]) {
    const batchMap = new Map();

    batches.forEach(row => {
      if (!batchMap.has(row.BatchId)) {
        batchMap.set(row.BatchId, {
          BatchId: row.BatchId,
          BatchNo: row.BatchNo,
          BatchStatusName: row.BatchStatusName,
          FromLocId: row.FromLocId,
          FromLocName: row.FromLocName,
          ToLocName: row.ToLocName,
          TransportMediumName: row.TransportMediumName,
          TransportDetail: row.TransportDetail,
          TransportReferenceNo: row.TransportReferenceNo,
          CourierCompanyName: row.CourierCompanyName,
          PublicTransportName: row.PublicTransportName,
          ArrivalLocationDetail: row.ArrivalLocationDetail,
          EstimatedCost: row.EstimatedCost,
          ActualCost: row.ActualCost,
          ExpectedArrivalTime: row.ExpectedArrivalTime,
          DispatchedOn: row.DispatchedOn,
          Remarks: row.Remarks,
          CreatedByName: row.CreatedByName,
          CreatedOn: row.CreatedOn,
          AttachmentMissing: row.AttachmentMissing,
          RowVer: row.RowVer,
          items: []
        });
      }

      const batch = batchMap.get(row.BatchId);

      const existingItem = batch.items.find((i: any) => i.BatchItemId === row.BatchItemId);
      if (!existingItem) {
        batch.items.push({
          BatchItemId: row.BatchItemId,
          VisitId: row.VisitId,
          LabId: row.LabId,
          PatientDetail: row.PatientDetail,
          ItemRemarks: row.ItemRemarks,
          TPsForLabId: row.TPsForLabId,
          TPId: row.TPId
        });
      }
    });

    this.pendingBatches = Array.from(batchMap.values());
  }

  selectBatch(batch: any) {
    this.selectedBatch = batch;
    this.selectedFile = null;

    this.updateForm.reset({
      actualCost: '',
      receiptTitle: '',
      remarks: batch.Remarks || ''
    });

    this.setupValidators();
  }

  setupValidators() {
    const actualCostControl = this.updateForm.get('actualCost');
    const receiptTitleControl = this.updateForm.get('receiptTitle');

    actualCostControl?.clearValidators();
    receiptTitleControl?.clearValidators();

    if (this.selectedBatch.AttachmentMissing && !this.selectedBatch.ActualCost) {
      // Both missing - pattern validation only
      actualCostControl?.setValidators([Validators.pattern(/^\d+(\.\d{1,2})?$/)]);
      receiptTitleControl?.setValidators([]);
    }
    else if (this.selectedBatch.AttachmentMissing && this.selectedBatch.ActualCost) {
      // Only invoice missing - receipt title required
      actualCostControl?.setValidators([]);
      receiptTitleControl?.setValidators([Validators.required]);
    }
    else if (!this.selectedBatch.AttachmentMissing && !this.selectedBatch.ActualCost) {
      // Only cost missing - cost required
      actualCostControl?.setValidators([Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]);
      receiptTitleControl?.setValidators([]);
    }

    actualCostControl?.updateValueAndValidity();
    receiptTitleControl?.updateValueAndValidity();
  }

  // Check if actual cost field should be editable
  isActualCostEditable(): boolean {
    if (!this.selectedBatch) return false;
    // Can edit ONLY if actual cost is missing in the database
    return !this.selectedBatch.ActualCost;
  }

  // Check if receipt fields should be editable
  isReceiptEditable(): boolean {
    if (!this.selectedBatch) return false;
    // Can edit ONLY if invoice is missing in the database
    return this.selectedBatch.AttachmentMissing;
  }

  canUpdate(): boolean {
    if (!this.selectedBatch) return false;

    const actualCost = this.updateForm.get('actualCost')?.value;
    const receiptTitle = this.updateForm.get('receiptTitle')?.value;
    const hasFile = !!this.selectedFile;
    const hasCostValue = actualCost && parseFloat(actualCost) > 0;

    // Get what's missing in the database
    const costMissingInDb = !this.selectedBatch.ActualCost;
    const invoiceMissingInDb = this.selectedBatch.AttachmentMissing;

    // Case 1: Both missing in DB - can update cost, invoice, or both
    if (invoiceMissingInDb && costMissingInDb) {
      // Option A: Adding cost only
      if (hasCostValue && !receiptTitle && !hasFile) {
        return this.updateForm.get('actualCost')?.valid || false;
      }
      // Option B: Uploading invoice only
      if (!hasCostValue && receiptTitle && hasFile) {
        return this.updateForm.get('receiptTitle')?.valid || false;
      }
      // Option C: Adding both cost and invoice
      if (hasCostValue && receiptTitle && hasFile) {
        return this.updateForm.get('actualCost')?.valid &&
          this.updateForm.get('receiptTitle')?.valid || false;
      }
      return false;
    }

    // Case 2: Only invoice missing in DB (cost already exists)
    if (invoiceMissingInDb && !costMissingInDb) {
      // Can only upload invoice
      return receiptTitle && hasFile && this.updateForm.get('receiptTitle')?.valid || false;
    }

    // Case 3: Only cost missing in DB (invoice already exists)
    if (!invoiceMissingInDb && costMissingInDb) {
      // Can only add cost
      return hasCostValue && this.updateForm.get('actualCost')?.valid || false;
    }

    // Case 4: Both exist in DB - cannot update anything
    return false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedTypes.includes(fileExt)) {
        this.toastr.error('Only JPG, PNG, and PDF files are allowed');
        event.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size cannot exceed 5MB');
        event.target.value = '';
        return;
      }

      this.selectedFile = file;
      
      // Do NOT clear cost value - allow both to be updated together
    }
  }

  // Convert file to base64 for FormData
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Update batch method using JSON (matching new API)
updateBatch() {
  if (!this.canUpdate()) {
    this.toastr.error('No updates possible or invalid data. Please check the rules.');
    return;
  }

  this.isUpdating = true;
  this.spinner.show();

  const formValues = this.updateForm.getRawValue();

  // Prepare update data as JSON
  const updateData: any = {
    batchNo: this.selectedBatch.BatchNo,
    actualCost: formValues.actualCost ? parseFloat(formValues.actualCost) : null,
    fileTitle: formValues.receiptTitle || null,
    remarks: formValues.remarks || null,
    actorUserId: this.loggedInUser.userid
  };

  // Add RowVer only if updating actual cost
  if (formValues.actualCost && parseFloat(formValues.actualCost) > 0) {
    updateData.rowVer = this.selectedBatch.RowVer;
  }

  // Handle file if selected
  if (this.selectedFile) {
    this.convertFileToBase64(this.selectedFile).then(base64Data => {
      // Add file data to the JSON object
      updateData.receiptFileBase64 = base64Data;
      updateData.fileName = this.selectedFile!.name;
      
      // Send as JSON
      this.sendUpdateRequest(updateData);
    }).catch(error => {
      this.spinner.hide();
      this.isUpdating = false;
      this.toastr.error('Error processing file');
      console.error('File conversion error:', error);
    });
  } else {
    // Send as JSON without file
    this.sendUpdateRequest(updateData);
  }
}

  // Send update request using FormData
  sendUpdateRequest(updateData: any) {
  // Use insertUpdateData which sends JSON with correct headers
  this.srv.insertUpdateData(API_ROUTES.UPDATE_BATCH_ACTUAL_COST_ATTACHMENT, updateData).subscribe({
    next: (resp: any) => {
      this.spinner.hide();
      this.isUpdating = false;

      if (resp && resp.StatusCode === 200) {
        this.toastr.success('Batch updated successfully');
        this.getPendingBatches();
        this.clearSelection();
      } else if (resp && resp.StatusCode === 409) {
        this.toastr.warning(resp.Message || 'Conflict detected. Please refresh and try again.');
        this.getPendingBatches();
      } else {
        this.toastr.error(resp?.Message || 'Error updating batch');
      }
    },
    error: (err) => {
      this.spinner.hide();
      this.isUpdating = false;

      if (err.error && err.error.Message) {
        this.toastr.error(err.error.Message);
      } else {
        this.toastr.error('Error updating batch');
      }
      console.error('Error updating batch:', err);
    }
  });
}

  clearSelection() {
    this.selectedBatch = null;
    this.selectedFile = null;
    this.updateForm.reset({
      actualCost: '',
      receiptTitle: '',
      remarks: ''
    });
  }

  resetFilters() {
    this.paramsForm.patchValue({
      dateFrom: Conversions.getCurrentDateObject(),
      dateTo: Conversions.getCurrentDateObject(),
      batchNo: ''
    });
    this.getPendingBatches();
  }

  validateDates(formValues: any): boolean {
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toastr.error('Date To should be equal or greater than Date From');
      this.isValidDateRange = false;
      return false;
    }

    const maxDaysDifference = 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      this.toastr.error('Date range should not exceed 1 month');
      this.isValidDateRange = false;
      return false;
    }

    this.isValidDateRange = true;
    return true;
  }

  validateDateDifference(index: number) {
    const formValues = this.paramsForm.getRawValue();
    if (formValues.dateFrom && formValues.dateTo) {
      this.validateDates(formValues);
    }
  }

  validateDecimalNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    const charStr = String.fromCharCode(charCode);
    const inputValue = e.target.value;

    // Allow control keys (backspace, delete, arrow keys, tab, etc.)
    if (charCode <= 31 || charCode === 8 || charCode === 9 || charCode === 13 ||
      charCode === 27 || charCode === 46 || (charCode >= 35 && charCode <= 40)) {
      return true;
    }

    // Allow digits
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }

    // Allow one decimal point
    if (charStr === '.' && !inputValue.includes('.')) {
      return true;
    }

    return false;
  }

  // Helper method to get status class for badge
  getStatusClass(batch: any): string {
    if (batch.AttachmentMissing && !batch.ActualCost) return 'badge-danger';
    if (batch.AttachmentMissing && batch.ActualCost) return 'badge-warning';
    if (!batch.AttachmentMissing && !batch.ActualCost) return 'badge-info';
    return 'badge-success';
  }

  // Helper method to get status text
  getStatusText(batch: any): string {
    if (batch.AttachmentMissing && !batch.ActualCost) return 'Missing Both';
    if (batch.AttachmentMissing && batch.ActualCost) return 'Missing Invoice';
    if (!batch.AttachmentMissing && !batch.ActualCost) return 'Missing Cost';
    return 'Complete';
  }

  // Helper method to get alert class for status message
  getAlertClass(): string {
    if (!this.selectedBatch) return '';
    if (this.selectedBatch.AttachmentMissing && !this.selectedBatch.ActualCost) return 'alert-danger';
    if (this.selectedBatch.AttachmentMissing && this.selectedBatch.ActualCost) return 'alert-warning';
    if (!this.selectedBatch.AttachmentMissing && !this.selectedBatch.ActualCost) return 'alert-info';
    return 'alert-success';
  }
}