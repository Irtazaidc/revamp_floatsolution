// @ts-nocheck
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbDatepicker, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SampleTrackingService } from '../../services/sample-tracking.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,

  selector: 'app-sample-receiving',
  templateUrl: './sample-receiving.component.html',
  styleUrls: ['./sample-receiving.component.scss']
})
export class SampleReceivingComponent implements OnInit {
  @ViewChild('dateFrom') dateFrom: NgbDatepicker;
  @ViewChild('dateTo') dateTo: NgbDatepicker;
  @ViewChild('riderAssignmentModal') riderAssignmentModal: TemplateRef<any>;

  // Filter Form
  filterForm: FormGroup;
  isValidDateRange = true;

  // Data
  batches: any[] = [];
  selectedBatch: any = null;
  batchDetails: any = null;

  // UI States
  loadingBatches = false;
  loadingDetails = false;
  isSpinnerSearch = true;
  disabledButtonSearch = false;

  // User Info
  loggedInUser: UserModel;

  // Stats
  stats = {
    pendingReceiving: 0,
    delayedBatches: 0,
    receivedToday: 0,
    avgDeliveryTime: '12:30'
  };

  // Rider Assignment Properties
  selectedRiderId: number = null;
  selectedBatchForRider: any = null;
  showRiderError: boolean = false;

  // Batch Receiving Properties - NEW
  showReceivingSection: boolean = true;
  receivingRemarks: string = '';
  batchReceiving = {
    hasSpillage: false,
    hasDamage: false,
    hasTempIssue: false,
    temperatureDetail: '',
    sealIntact: null // boolean
  };

  // Issue Types - NEW
  issueTypes: any[] = [];

  // Confirmation Popover Configs
  confirmationPopoverConfigRider = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please confirm...!',
    popoverMessage: 'Are you <strong>sure</strong> want to receive?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };

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
    private srv: SampleTrackingService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.initFilterForm();
    this.loadBatches();
    this.loadRiders();
    this.getSampleTrackingLookup(); // Load issue types
  }

  initFilterForm() {
    this.filterForm = this.formBuilder.group({
      dateFrom: [Conversions.getCurrentDateObject()],
      dateTo: [Conversions.getCurrentDateObject()],
      batchNo: ['']
    });
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  loadBatches() {
    const formValues = this.filterForm.getRawValue();

    // Date validation
    if (formValues.dateFrom && formValues.dateTo) {
      if (!this.validateDateRange()) {
        return;
      }
    }

    // Format dates
    const fromDate = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    const toDate = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;

    this.loadingBatches = true;
    this.isSpinnerSearch = false;
    this.disabledButtonSearch = true;

    const params = {
      ToLocId: 1,//this.loggedInUser.locationid,
      FromDate: fromDate,
      ToDate: toDate,
      BatchNo: formValues.batchNo || null
    };

    this.srv.getData(API_ROUTES.GET_RECEIVING_PENDING_BATCHES, params).subscribe({
      next: (resp: any) => {
        this.loadingBatches = false;
        this.isSpinnerSearch = true;
        this.disabledButtonSearch = false;

        if (resp && resp.StatusCode === 200 && resp.PayLoad) {
          // PayLoad is a DataTable - convert to array
          this.batches = resp.PayLoad;
          this.calculateStats();

          // Clear selected batch if it's no longer in the list
          if (this.selectedBatch) {
            const stillExists = this.batches.some(b => b.BatchId === this.selectedBatch.BatchId);
            if (!stillExists) {
              this.selectedBatch = null;
              this.batchDetails = null;
            }
          }
        } else {
          this.batches = [];
          this.selectedBatch = null;
          this.batchDetails = null;
        }
      },
      error: (err) => {
        this.loadingBatches = false;
        this.isSpinnerSearch = true;
        this.disabledButtonSearch = false;
        console.error('Error loading batches:', err);
        this.toastr.error('Error loading incoming batches');
      }
    });
  }

  selectBatch(batch: any) {
    this.selectedBatch = batch;
    this.loadBatchDetails(batch);

    // Reset receiving form when batch changes - NEW
    this.resetReceivingForm();
  }

  riders: any[] = [];
  loadRiders() {
    let params = {
      RiderID: 0,
      LocID: null
    }
    this.srv.getData(API_ROUTES.GET_RIDERS_DETAIL, {}).subscribe((resp: any) => {
      this.riders = resp.PayLoad;
    }, (err) => { console.log(err) })
  }

  // Load batch details
  loadBatchDetails(batch: any) {
    this.loadingDetails = true;
    this.batchDetails = null;

    // Prepare params with all required fields for the new SP
    const params = {
      BatchId: batch.BatchId,
      BatchNo: batch.BatchNo,
      ToLocId: this.loggedInUser.locationid, // Use logged in user's location
      RowVer: batch.RowVer
    };

    this.srv.getData(API_ROUTES.GET_SAMPLE_BATCH_DETAILS, params).subscribe({
      next: (resp: any) => {
        this.loadingDetails = false;

        if (resp && resp.StatusCode === 200) {
          if (resp.PayLoad && resp.PayLoad.length > 0) {
            // Process the batch items from the new SP response
            this.processBatchDetails(resp.PayLoad);
          } else {
            this.toastr.warning('No details found for this batch');
          }
        } else {
          // Handle validation errors from the SP
          this.handleBatchDetailError(resp);

          // Refresh the batches list to get latest data (RowVer might have changed)
          this.refreshDashboard();
        }
      },
      error: (err) => {
        this.loadingDetails = false;
        console.error('Error loading batch details:', err);

        // Try to extract error message from response
        if (err.error && err.error.Message) {
          this.toastr.error(err.error.Message);
        } else {
          this.toastr.error('Error loading batch details');
        }

        // Refresh batches list on error
        this.refreshDashboard();
      }
    });
  }

  // Handle batch detail errors
  handleBatchDetailError(resp: any) {
    if (resp && resp.Message) {
      // Check for specific error messages
      if (resp.Message.includes('modified by another user')) {
        this.toastr.warning(resp.Message);
      } else if (resp.Message.includes('already been received')) {
        this.toastr.info(resp.Message);
        // Remove this batch from the list since it's already received
        this.batches = this.batches.filter(b => b.BatchId !== this.selectedBatch?.BatchId);
        this.selectedBatch = null;
      } else if (resp.Message.includes('does not belong')) {
        this.toastr.error(resp.Message);
      } else if (resp.Message.includes('only Dispatched or RiderSentForPick')) {
        this.toastr.warning(resp.Message);
      } else {
        this.toastr.error(resp.Message || 'Error loading batch details');
      }
    }
  }

  // Process batch details with enhanced sample structure - UPDATED
  processBatchDetails(details: any[]) {
    // Find the "None" issue type ID dynamically
    const noneIssueType = this.issueTypes.find(i => i.Descp === 'None');
    const defaultIssueTypeId = noneIssueType ? noneIssueType.Id : 1;

    // Group items by Visit and then by Barcode
    const visitMap = new Map();

    details.forEach(item => {
      // Extract patient details directly from the individual fields
      const patientName = item.PatientName || '';
      const patientAge = item.PatientAge || '';
      const patientGender = item.Gender || '';
      const patientCell = item.Cell || '';

      if (!visitMap.has(item.VisitId)) {
        visitMap.set(item.VisitId, {
          VisitId: item.VisitId,
          PatientName: patientName,
          PatientAge: patientAge,
          Gender: patientGender,
          Cell: patientCell,
          samples: []
        });
      }

      const visit = visitMap.get(item.VisitId);

      // Find or create sample (barcode) using LabId
      let sample = visit.samples.find((s: any) => s.LabId === item.LabId);
      if (!sample) {
        sample = {
          LabId: item.LabId,
          SampleType: item.SampleType || 'Blood',
          tpCodes: item.TPList || '',
          status: item.ItemStatusName || 'Pending',
          showIssues: false,
          issueTypeId: defaultIssueTypeId, // Default to "None"
          issueDetail: '',
          actionTaken: ''
        };
        visit.samples.push(sample);
      }
    });

    this.batchDetails = {
      visits: Array.from(visitMap.values()),
      TotalSampleCount: this.batches.find(b => b.BatchId === this.selectedBatch?.BatchId)?.TotalSampleCount || 0
    };
  }

  // NEW: Toggle receiving section
  toggleReceivingSection() {
    this.showReceivingSection = !this.showReceivingSection;
  }

  // NEW: Toggle sample issues section
  toggleSampleIssues(visitIndex: number, sampleIndex: number) {
    if (this.batchDetails && this.batchDetails.visits[visitIndex] &&
      this.batchDetails.visits[visitIndex].samples[sampleIndex]) {
      const sample = this.batchDetails.visits[visitIndex].samples[sampleIndex];
      sample.showIssues = !sample.showIssues;
    }
  }

  // NEW: Reset receiving form
  resetReceivingForm() {
    this.batchReceiving = {
      hasSpillage: false,
      hasDamage: false,
      hasTempIssue: false,
      temperatureDetail: '',
      sealIntact: null
    };
    this.receivingRemarks = '';
    this.showReceivingSection = true;
  }

  calculateStats() {
    // Calculate stats from batches
    this.stats.pendingReceiving = this.batches.length;
    this.stats.delayedBatches = this.batches.filter(b => b.IsDelayed).length;

    // Calculate received today (would need separate API or field)
    // For now, using placeholder
    this.stats.receivedToday = 0;
  }

  validateDateRange(): boolean {
    const formValues = this.filterForm.getRawValue();
    if (!formValues.dateFrom || !formValues.dateTo) return true;

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

  resetFilters() {
    this.filterForm.patchValue({
      dateFrom: Conversions.getCurrentDateObject(),
      dateTo: Conversions.getCurrentDateObject(),
      batchNo: ''
    });
    this.loadBatches();
  }

  refreshDashboard() {
    this.loadBatches();
    // Don't reload details here as they'll be cleared when batches reload
    this.selectedBatch = null;
    this.batchDetails = null;
  }

  getStatusBadgeClass(batch: any): string {
    if (batch.IsDelayed) return 'badge-danger';
    if (batch.BatchStatusId === 3) return 'badge-warning'; // RiderSentForPick
    if (batch.BatchStatusId === 2) return 'badge-success'; // Dispatched
    return 'badge-secondary';
  }

  openRiderAssignmentModal(event: Event, batch: any) {
    event.stopPropagation(); // Prevent card selection when clicking button
    this.selectedBatchForRider = batch;
    this.selectedRiderId = null; // Reset selected rider
    this.modalService.open(this.riderAssignmentModal, { size: 'md' });
  }



  printBarcode(batchNo) {
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

  // Helper method to format remaining time
  formatRemainingTime(minutes: number): string {
    if (!minutes) return '';

    if (minutes < 0) {
      return `Delayed by ${Math.abs(minutes)} minutes`;
    }

    if (minutes < 60) {
      return `${minutes} minutes`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  // Helper method to get row class based on delay status
  getBatchRowClass(batch: any): string {
    if (batch.IsDelayed) return 'table-danger';
    if (batch.RemainingMinutes !== null && batch.RemainingMinutes <= 30 && batch.RemainingMinutes > 0) return 'table-warning';
    return '';
  }

  // Helper method to check if rider assignment button should be shown
  showRiderAssignmentButton(batch: any): boolean {
    return batch.TransportMediumId !== 1 && batch.BatchStatusId === 2; // Show for all except OwnRider and only when Dispatched
  }

  // Date validation helper
  validateDateDifference(index: number) {
    this.validateDateRange();
  }

  // Clear selection
  clearSelection() {
    this.selectedBatch = null;
    this.batchDetails = null;
    this.resetReceivingForm();
  }

  // Load issue types for dropdown - NEW
  getSampleTrackingLookup() {
    // TransportMedium('TRANSPORTMEDIUM', 'MEDIUM', 'TRANSPORT')
    // BatchStatus('BATCHSTATUS', 'BATCH')
    // ItemStatus('ITEMSTATUS', 'ITEM')
    // IssueType('ISSUETYPE', 'ISSUE')
    let objParams = {
      LookupName: 'ISSUETYPE',
      Id: null
    };

    this.srv.getData(API_ROUTES.GET_SAMPLE_TRACKING_LOOKUP, objParams).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        // console.log("API Response: ", data);

        if (data.PayLoad && data.PayLoad.length > 0) {
          this.issueTypes = data.PayLoad;
          // console.log("Issue Types loaded: ", this.issueTypes);
        } else {
          this.issueTypes = [];
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

  // Assign rider for pickup
  assignDriverForPickup(modal?: any) {
    // Validate rider selection
    if (!this.selectedRiderId) {
      this.toastr.error('Please select a rider');
      return;
    }

    if (!this.selectedBatchForRider) {
      this.toastr.error('No batch selected');
      return;
    }

    // Show loading
    this.spinner.show();

    // Prepare request parameters matching stored procedure
    const params = {
      BatchId: this.selectedBatchForRider.BatchId,
      BatchNo: this.selectedBatchForRider.BatchNo,
      ToLocId:  this.loggedInUser.locationid, // Receiving location
      RiderSentId: this.selectedRiderId,
      RowVer: this.selectedBatchForRider.RowVer,
      ActorUserId: this.loggedInUser.userid
    };

    // Call API
    this.srv.insertUpdateData(API_ROUTES.UPDATE_BATCH_RIDER_SENT, params).subscribe({
      next: (resp: any) => {
        this.spinner.hide();

        if (resp && resp.StatusCode === 200) {
          this.toastr.success('Rider assigned successfully');

          // Close the modal if provided
          if (modal) {
            modal.close();
          }

          // Refresh the batches list to get updated status
          this.refreshDashboard();

          // Clear selected batch for rider
          this.selectedBatchForRider = null;
          this.selectedRiderId = null;
        } else {
          // Handle validation errors from SP
          this.toastr.error(resp?.Message || 'Error assigning rider');
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error assigning rider:', err);

        // Try to extract error message from response
        if (err.error && err.error.Message) {
          this.toastr.error(err.error.Message);
        } else {
          this.toastr.error('Error assigning rider');
        }
      }
    });
  }
  // Quick action to set common issues
  setSampleIssue(sample: any, issueTypeId: number, issueDetail: string, actionTaken: string) {
    sample.issueTypeId = issueTypeId;
    sample.issueDetail = issueDetail;
    sample.actionTaken = actionTaken;

    // Optional: Show a toast notification
    this.toastr.info(`Issue marked: ${issueDetail}`);
  }
  // Update the validateSampleIssues method - only check Issue Details
  // Update the validateSampleIssues method - only check Issue Details
  validateSampleIssues(): boolean {
    let isValid = true;
    let hasIssuesWithoutDetails = false;

    if (this.batchDetails && this.batchDetails.visits) {
      this.batchDetails.visits.forEach((visit: any) => {
        visit.samples.forEach((sample: any) => {
          // Reset validation flag
          sample.issueDetailInvalid = false;

          // Check if issue type is not "None" (Id: 1)
          if (sample.issueTypeId && sample.issueTypeId !== 1) {
            // Issue Detail is required for non-None issues
            if (!sample.issueDetail || sample.issueDetail.trim() === '') {
              sample.issueDetailInvalid = true;
              hasIssuesWithoutDetails = true;
              isValid = false;
            }
            // Action Taken is optional - no validation
          }
        });
      });
    }

    if (hasIssuesWithoutDetails) {
      this.toastr.error('Please provide Issue Details for all problematic samples');
    }

    return isValid;
  }

  // Update the receiveBatch method to match your table type structure
  receiveBatch() { 
    if (!this.selectedBatch) {
      this.toastr.warning('Please select a batch first');
      return;
    }

    // Validate sample issues first - now only checks Issue Details
    if (!this.validateSampleIssues()) {
      return;
    }

    // Prepare receive items matching typSampleReceiveItemIssue
    const receiveItems = [];

    if (this.batchDetails && this.batchDetails.visits) {
      this.batchDetails.visits.forEach((visit: any) => {
        visit.samples.forEach((sample: any) => {
          receiveItems.push({
            visitId: visit.VisitId.replaceAll('-', ''),                    // numeric(15,0)
            labId: sample.LabId,                        // varchar(10)
            issueTypeId: sample.issueTypeId || 1,       // smallint (default to 1 = "None")
            itemRemarks: '',                             // varchar(300) - can be used if needed
            issueDetail: sample.issueDetail || null,     // varchar(300)
            actionTaken: sample.actionTaken || null      // varchar(300) - optional
          });
        });
      });
    }

    // Prepare the full request payload
    const requestData = {
      batchId: this.selectedBatch.BatchId,
      batchNo: this.selectedBatch.BatchNo,
      receivedAtLocId: this.loggedInUser.locationid,
      receivedBy: this.loggedInUser.userid,
      rowVer: this.selectedBatch.RowVer,
      hasSpillage: this.batchReceiving.hasSpillage,
      hasDamage: this.batchReceiving.hasDamage,
      hasTempIssue: this.batchReceiving.hasTempIssue,
      temperatureDetail: this.batchReceiving.temperatureDetail || null,
      sealIntact: this.batchReceiving.sealIntact,
      receivingRemarks: this.receivingRemarks || null,
      receiveItems: receiveItems,
      closeIfComplete: true
    };

    // console.log('Receive Payload:', requestData); // For debugging

    // Show loading
    this.spinner.show();
    this.isProcessing = true;

    // Call API
    this.srv.insertUpdateData(API_ROUTES.RECEIVE_BATCH, requestData).subscribe({
      next: (resp: any) => {
        this.spinner.hide();
        this.isProcessing = false;

        if (resp && resp.StatusCode === 200) {
          this.toastr.success('Batch received successfully');

          // Refresh the batches list
          this.refreshDashboard();

          // Clear selection
          this.clearSelection();
        } else {
          // Handle validation errors from SP
          this.toastr.error(resp?.Message || 'Error receiving batch');
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.isProcessing = false;
        console.error('Error receiving batch:', err);

        // Try to extract error message from response
        if (err.error && err.error.Message) {
          this.toastr.error(err.error.Message);
        } else {
          this.toastr.error('Error receiving batch');
        }
      }
    });
  }

  // Add processing flag
  isProcessing: boolean = false;
}