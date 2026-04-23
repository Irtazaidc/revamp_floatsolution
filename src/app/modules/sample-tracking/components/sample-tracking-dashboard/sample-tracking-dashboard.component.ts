// @ts-nocheck
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbDatepicker, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SampleTrackingService } from '../../services/sample-tracking.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { animate, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';

type Label = any;

@Component({
  standalone: false,

  selector: 'app-sample-tracking-dashboard',
  templateUrl: './sample-tracking-dashboard.component.html',
  styleUrls: ['./sample-tracking-dashboard.component.scss'],
  animations: [
    trigger('fadeInOutTranslate', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class SampleTrackingDashboardComponent implements OnInit {
  @ViewChild('dateFrom') dateFrom: NgbDatepicker;
  @ViewChild('dateTo') dateTo: NgbDatepicker;
  @ViewChild('tableSection') tableSection: ElementRef;

  // Filter Form
  filterForm: FormGroup;
  isValidDateRange = true;

  // Data
  batches: any[] = [];
  filteredBatches: any[] = [];
  summary: any = null;
  branches: any[] = [];

  // UI States
  loadingBatches = false;
  isSpinnerSearch = true;
  disabledButtonSearch = false;
  lastRefreshed: Date = new Date();

  // User Info
  loggedInUser: UserModel;

  // Toggle Sections
  isStatsSectionVisible = true;
  isChartsSectionVisible = true;

  // Chart Data for Pie Chart
  pieChartDatasets: any[] = [];
  pieChartLabels: Label[] = ['Dispatched', 'Rider Sent', 'Delayed', 'Due Today', 'No ETA'];
  pieChartType = 'pie';
  pieChartLegend = false;
  pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const dataset = context.dataset;
            const data = dataset.data as number[];
            const total = data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value as number / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  pieChartDataItems: number[] = [];

  // Chart Data for Bar Chart
  barChartData: ChartDataSets[] = [{ data: [] }];
  barChartLabels: Label[] = ['Dispatched', 'Rider Sent', 'Delayed', 'Due Today', 'No ETA'];
  barChartType = 'bar';
  barChartLegend = true;
  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          stepSize: 1,
          precision: 0
        },
        scaleLabel: {
          display: true,
          labelString: 'Number of Batches'
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Status'
        },
        gridLines: {
          display: false
        }
      }]
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          fontStyle: 'bold',
          generateLabels: (chart) => {
            const labels = ['Dispatched', 'Rider Sent', 'Delayed', 'Due Today', 'No ETA'];
            const colors = ['#28a745', '#17a2b8', '#dc3545', '#ffc107', '#6c757d'];

            return labels.map((label, i) => ({
              text: label,
              fillStyle: colors[i],
              strokeStyle: 'transparent',
              lineWidth: 0,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Batches: ${context.raw}`;
          }
        }
      }
    }
  };

  // Color array for legend
  chartColors: string[] = ['#00C1D4', '#2E5BFF', '#FF647C', '#FF9F1C', '#8C9CB5'];

  // Attachment related properties
  selectedBatchForAttachments: any = null;
  attachmentsList: any[] = [];
  selectedPreview: any = null;

  // Computed properties for toggle icons
  get statsIconClass(): string {
    return this.isStatsSectionVisible ? 'fa-minus-square text-primary' : 'fa-plus-square text-muted';
  }

  get statsTooltip(): string {
    return this.isStatsSectionVisible ? 'Hide Statistics' : 'Show Statistics';
  }

  get chartsIconClass(): string {
    return this.isChartsSectionVisible ? 'fa-minus-square text-success' : 'fa-plus-square text-muted';
  }

  get chartsTooltip(): string {
    return this.isChartsSectionVisible ? 'Hide Charts' : 'Show Charts';
  }

  get bothIconClass(): string {
    if (this.isStatsSectionVisible && this.isChartsSectionVisible) {
      return 'fa-compress-alt text-warning';
    } else if (!this.isStatsSectionVisible && !this.isChartsSectionVisible) {
      return 'fa-expand-alt text-warning';
    } else {
      return 'fa-adjust text-warning';
    }
  }

  get bothTooltip(): string {
    if (this.isStatsSectionVisible && this.isChartsSectionVisible) {
      return 'Hide All Sections';
    } else if (!this.isStatsSectionVisible && !this.isChartsSectionVisible) {
      return 'Show All Sections';
    } else {
      return 'Reset to Show All';
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private srv: SampleTrackingService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private helperService: HelperService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.loadBranches();
    this.initFilterForm();
    this.searchBatches(); // Initial load with default dates
  }

  initFilterForm() {
    // Set default branch to logged in user's location
    const defaultBranchId = this.loggedInUser?.locationid || null;

    this.filterForm = this.formBuilder.group({
      dateFrom: [Conversions.getCurrentDateObject()],
      dateTo: [Conversions.getCurrentDateObject()],
      branchId: [defaultBranchId],
      batchNo: ['']
    });
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  loadBranches() {
    this.srv.getData(API_ROUTES.LOOKUP_GET_BRANCHES, {}).subscribe({
      next: (resp: any) => {
        if (resp && resp.StatusCode === 200 && resp.PayLoad) {
          this.branches = resp.PayLoad;
        }
      },
      error: (err) => {
        console.error('Error loading branches:', err);
      }
    });
  }

  // Search button - calls API with date range and branch filters
  searchBatches() {
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
      ToLocId: formValues.branchId || 0,
      FromDate: fromDate,
      ToDate: toDate,
      BatchNo: formValues.batchNo || null,
      IsManagement: true
    };

    console.log('API Params:', params); // For debugging

    this.srv.getData(API_ROUTES.GET_BATCHES_FOR_TRACKING_DASHBOARD, params).subscribe({
      next: (resp: any) => {
        this.loadingBatches = false;
        this.isSpinnerSearch = true;
        this.disabledButtonSearch = false;
        this.lastRefreshed = new Date();

        console.log('API Response:', resp); // For debugging

        if (resp && resp.StatusCode === 200) {
          // Check if we have PayLoadDS with Table and Table1
          if (resp.PayLoadDS) {
            // First table is batches (Table) - Process attachments for each batch
            this.batches = this.processBatchesAttachments(resp.PayLoadDS.Table || []);

            // Second table is summary (Table1) - it's an array with one object
            if (resp.PayLoadDS.Table1 && resp.PayLoadDS.Table1.length > 0) {
              this.summary = resp.PayLoadDS.Table1[0];
              console.log('Summary data:', this.summary);
            } else {
              this.summary = null;
            }
          }
          // Fallback to PayLoad if PayLoadDS is not available
          else if (resp.PayLoad) {
            if (Array.isArray(resp.PayLoad) && resp.PayLoad.length >= 2) {
              this.batches = this.processBatchesAttachments(resp.PayLoad[0] || []);
              this.summary = resp.PayLoad[1] && resp.PayLoad[1].length > 0 ? resp.PayLoad[1][0] : null;
            } else {
              this.batches = this.processBatchesAttachments(resp.PayLoad || []);
              this.summary = null;
            }
          } else {
            this.batches = [];
            this.summary = null;
          }

          // Apply local filters (batch no only now)
          this.applyLocalFilters();
          this.prepareChartData();

          console.log('Batches loaded:', this.batches.length);
          console.log('Filtered batches:', this.filteredBatches.length);

          // Force change detection
          this.cdr.detectChanges();
        } else {
          this.batches = [];
          this.filteredBatches = [];
          this.summary = null;
          this.toastr.error(resp?.Message || 'Error loading data');
        }
      },
      error: (err) => {
        this.loadingBatches = false;
        this.isSpinnerSearch = true;
        this.disabledButtonSearch = false;
        console.error('Error loading dashboard data:', err);
        this.toastr.error('Error loading dashboard data');
      }
    });
  }

  // Process attachments for batches
  processBatchesAttachments(batches: any[]): any[] {
    if (!batches || !batches.length) return [];

    return batches.map(batch => {
      // Parse attachments if they exist
      if (batch.Attachments && typeof batch.Attachments === 'string') {
        try {
          const parsedAttachments = JSON.parse(batch.Attachments);
          // Handle both array and single object cases
          if (Array.isArray(parsedAttachments)) {
            batch.AttachmentsList = parsedAttachments.map((att: any) => ({
              ...att,
              FileExtension: (att.FileExtension || '').toLowerCase(),
              PreviewUrl: this.getBase64ImageSrc(att),
              HasError: false
            }));
          } else if (parsedAttachments && typeof parsedAttachments === 'object') {
            // If it's a single object, wrap it in an array
            batch.AttachmentsList = [{
              ...parsedAttachments,
              FileExtension: (parsedAttachments.FileExtension || '').toLowerCase(),
              PreviewUrl: this.getBase64ImageSrc(parsedAttachments),
              HasError: false
            }];
          } else {
            batch.AttachmentsList = [];
          }
        } catch (error) {
          console.error('Error parsing attachments for batch:', batch.BatchNo, error);
          batch.AttachmentsList = [];
        }
      } else {
        batch.AttachmentsList = [];
      }

      // Set HasAttachment flag based on attachments list
      batch.HasAttachment = batch.AttachmentsList && batch.AttachmentsList.length > 0;

      return batch;
    });
  }

  // Open attachments modal for a batch
  openAttachmentsModal(content: any, batch: any): void {
    this.selectedAttachment = null;
    this.resetView();
    this.selectedBatchForAttachments = batch;

    if (batch.AttachmentsList && batch.AttachmentsList.length > 0) {
      this.attachmentsList = batch.AttachmentsList;
    } else {
      this.attachmentsList = [];
    }

    this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
      centered: true,
      windowClass: 'attachments-modal'
    });
  }

  // Get base64 image source for preview
  getBase64ImageSrc(file: any): string {
    if (!file?.FileBase64) {
      return '';
    }

    const ext = (file.FileExtension || '').toLowerCase();

    let mimeType = 'image/jpeg'; // Default to JPEG

    switch (ext) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'bmp':
        mimeType = 'image/bmp';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      case 'svg':
        mimeType = 'image/svg+xml';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        break;
    }

    return `data:${mimeType};base64,${file.FileBase64}`;
  }

  // Check if file is an image
  isImageFile(extension: string): boolean {
    return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(
      (extension || '').toLowerCase()
    );
  }

  // Check if file is PDF
  isPdfFile(extension: string): boolean {
    return (extension || '').toLowerCase() === 'pdf';
  }

  // Get file icon class based on extension
  getFileIconClass(extension: string): string {
    const ext = (extension || '').toLowerCase();

    if (this.isImageFile(ext)) {
      return 'fa-file-image-o';
    } else if (this.isPdfFile(ext)) {
      return 'fa-file-pdf-o';
    } else {
      return 'fa-file-o';
    }
  }

  // Get file extension display
  getFileExtensionDisplay(extension: string): string {
    return (extension || 'Unknown').toUpperCase();
  }

  // Open attachment in new tab
  openAttachmentInNewTab(file: any): void {
    const isImage = this.isImageFile(file.FileExtension);
    const isPdf = this.isPdfFile(file.FileExtension);

    if (isImage || isPdf) {
      const fileSrc = this.getBase64ImageSrc(file);

      if (!fileSrc) {
        this.toastr.warning('File content not available');
        return;
      }

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        if (isImage) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.FileName || 'Attachment'}</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #111;
                    min-height: 100vh;
                  }
                  img {
                    max-width: 100%;
                    max-height: 100vh;
                    object-fit: contain;
                  }
                </style>
              </head>
              <body>
                <img src="${fileSrc}" alt="${file.FileName || 'Attachment'}" />
              </body>
            </html>
          `);
        } else if (isPdf) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.FileName || 'Attachment'}</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100vh;
                  }
                  embed {
                    width: 100%;
                    height: 100%;
                  }
                </style>
              </head>
              <body>
                <embed src="${fileSrc}" type="application/pdf" width="100%" height="100%" />
              </body>
            </html>
          `);
        }
        newWindow.document.close();
      }
    } else {
      // For non-image/non-pdf files, show download option
      this.toastr.info('This file type cannot be previewed directly');
    }
  }

  // Handle image error
  onImageError(item: any): void {
    item.HasError = true;
  }

  // Track by function for attachments
  trackByAttachment(index: number, item: any): string {
    return item.FilePath || item.FileName || index.toString();
  }

  // Apply local filters (batch number only)
  applyLocalFilters() {
    const batchNoFilter = this.filterForm.get('batchNo')?.value?.toLowerCase() || '';

    this.filteredBatches = this.batches.filter((batch: any) => {
      let matches = true;

      // Batch number filter
      if (batchNoFilter) {
        matches = matches && batch.BatchNo?.toLowerCase().includes(batchNoFilter);
      }

      return matches;
    });
  }

  // Filter by status from card clicks or chart legend
  filterByStatus(statusKey: string) {
    console.log('Filtering by status:', statusKey);

    // First filter the data
    if (statusKey === 'all') {
      this.filteredBatches = [...this.batches];
    } else if (statusKey === 'delayed') {
      // For delayed, we need to filter by IsDelayed flag
      this.filteredBatches = this.batches.filter(batch => batch.IsDelayed === true);
    } else {
      // For status IDs
      const statusId = parseInt(statusKey, 10);
      this.filteredBatches = this.batches.filter(batch => batch.BatchStatusId === statusId);
    }

    console.log('Filtered batches count:', this.filteredBatches.length);

    // Force change detection
    this.cdr.detectChanges();

    // Then scroll to the table with smooth animation (only if there are results)
    this.scrollToTable();
  }

  // Helper to get status key from chart index
  getStatusKey(index: number): string {
    switch (index) {
      case 0: return '2'; // Dispatched
      case 1: return '3'; // Rider Sent
      case 2: return 'delayed'; // Delayed
      case 3: return 'due'; // Due Today
      case 4: return 'noeta'; // No ETA
      default: return 'all';
    }
  }

  // Get color for legend
  getColorForIndex(index: number): string {
    return this.chartColors[index] || '#6c757d';
  }

  // Scroll to table method
  scrollToTable() {
    setTimeout(() => {
      if (this.tableSection && this.filteredBatches.length > 0) {
        const element = this.tableSection.nativeElement;

        // Add highlight class
        element.classList.add('highlight-section');

        // Scroll to element
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Remove highlight class after animation
        setTimeout(() => {
          element.classList.remove('highlight-section');
        }, 1000);
      }
    }, 100);
  }

  // Toggle methods
  toggleStatsSection() {
    this.isStatsSectionVisible = !this.isStatsSectionVisible;
  }

  toggleChartsSection() {
    this.isChartsSectionVisible = !this.isChartsSectionVisible;
  }

  toggleBothSections() {
    if (this.isStatsSectionVisible && this.isChartsSectionVisible) {
      this.isStatsSectionVisible = false;
      this.isChartsSectionVisible = false;
    } else if (!this.isStatsSectionVisible && !this.isChartsSectionVisible) {
      this.isStatsSectionVisible = true;
      this.isChartsSectionVisible = true;
    } else {
      this.isStatsSectionVisible = true;
      this.isChartsSectionVisible = true;
    }
  }

  // Prepare chart data with professional corporate colors
  prepareChartData() {
    if (this.summary) {
      const chartData = [
        this.summary.DispatchedCount || 0,
        this.summary.RiderSentForPickCount || 0,
        this.summary.DelayedCount || 0,
        this.summary.DueTodayCount || 0,
        this.summary.NoETAcount || 0
      ];
      this.pieChartDataItems = [...chartData];

      this.pieChartDatasets = [{
        data: chartData,
        backgroundColor: [
          '#00C1D4', // Teal - Dispatched (was Rider Sent)
          '#2E5BFF', // Bright Blue - Rider Sent (was Dispatched)
          '#FF647C', // Coral Red - Delayed
          '#FF9F1C', // Orange - Due Today
          '#8C9CB5'  // Slate Gray - No ETA
        ],
        borderColor: [
          '#00C1D4',
          '#2E5BFF',
          '#FF647C',
          '#FF9F1C',
          '#8C9CB5'
        ],
        borderWidth: 1
      }];

      this.barChartData = [{
        data: chartData,
        label: 'Batch Status Distribution',
        backgroundColor: [
          'rgba(0, 193, 212, 0.8)',   // #00C1D4 with opacity - Dispatched
          'rgba(46, 91, 255, 0.8)',   // #2E5BFF with opacity - Rider Sent
          'rgba(255, 100, 124, 0.8)', // #FF647C with opacity - Delayed
          'rgba(255, 159, 28, 0.8)',  // #FF9F1C with opacity - Due Today
          'rgba(140, 156, 181, 0.8)'  // #8C9CB5 with opacity - No ETA
        ],
        hoverBackgroundColor: [
          'rgba(0, 193, 212, 1)',      // Dispatched - Solid on hover
          'rgba(46, 91, 255, 1)',      // Rider Sent - Solid on hover
          'rgba(255, 100, 124, 1)',    // Delayed - Solid on hover
          'rgba(255, 159, 28, 1)',     // Due Today - Solid on hover
          'rgba(140, 156, 181, 1)'     // No ETA - Solid on hover
        ],
        borderColor: [
          '#00C1D4',
          '#2E5BFF',
          '#FF647C',
          '#FF9F1C',
          '#8C9CB5'
        ],
        hoverBorderColor: [
          '#00d4c2',
          '#2E5BFF',
          '#FF647C',
          '#FF9F1C',
          '#8C9CB5'
        ],
        borderWidth: 1
      }];
    } else {
      // Set default empty data if no summary
      const emptyData = [0, 0, 0, 0, 0];
      this.pieChartDataItems = [...emptyData];

      this.pieChartDatasets = [{
        data: emptyData,
        backgroundColor: ['#00C1D4', '#2E5BFF', '#FF647C', '#FF9F1C', '#8C9CB5'],
        borderColor: ['#00C1D4', '#2E5BFF', '#FF647C', '#FF9F1C', '#8C9CB5'],
        borderWidth: 1
      }];

      this.barChartData = [{
        data: emptyData,
        label: 'Batch Status Distribution',
        backgroundColor: [
          'rgba(0, 193, 212, 0.8)',
          'rgba(46, 91, 255, 0.8)',
          'rgba(255, 100, 124, 0.8)',
          'rgba(255, 159, 28, 0.8)',
          'rgba(140, 156, 181, 0.8)'
        ],
        hoverBackgroundColor: [
          '#00C1D4',
          '#2E5BFF',
          '#FF647C',
          '#FF9F1C',
          '#8C9CB5'
        ],
        borderColor: [
          '#00C1D4',
          '#2E5BFF',
          '#FF647C',
          '#FF9F1C',
          '#8C9CB5'
        ],
        hoverBorderColor: [
          '#00C1D4',
          '#2E5BFF',
          '#FF647C',
          '#FF9F1C',
          '#8C9CB5'
        ],
        borderWidth: 1
      }];
    }
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
    const defaultBranchId = this.loggedInUser?.locationid || null;

    this.filterForm.patchValue({
      dateFrom: Conversions.getCurrentDateObject(),
      dateTo: Conversions.getCurrentDateObject(),
      branchId: defaultBranchId,
      batchNo: ''
    });
    this.searchBatches(); // Reload data with default dates and branch
  }

  refreshDashboard() {
    this.searchBatches(); // Refresh with current filters
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getStatusBadgeClass(batch: any): string {
    if (!batch) return 'badge-secondary';
    if (batch.BatchStatusId === 2) return 'badge-success';
    if (batch.BatchStatusId === 3) return 'badge-info';
    if (batch.BatchStatusId === 4) return 'badge-primary';
    if (batch.BatchStatusId === 5) return 'badge-secondary';
    if (batch.IsDelayed) return 'badge-danger';
    return 'badge-warning';
  }

  exportToExcel() {
    this.toastr.info('Export functionality will be implemented soon');
  }

  validateDateDifference(index: number) {
    this.validateDateRange();
  }

  // Get attachment count display
  getAttachmentDisplay(batch: any): string {
    if (!batch.AttachmentsList || batch.AttachmentsList.length === 0) {
      return 'No Attachments';
    }
    return `${batch.AttachmentsList.length} Attachment(s)`;
  }

  // Get attachment icon class based on count
  getAttachmentIconClass(batch: any): string {
    if (!batch.AttachmentsList || batch.AttachmentsList.length === 0) {
      return 'fa-paperclip text-muted';
    }
    return 'fa-paperclip text-primary';
  }
  // Get a clean display name without the GUID
  getDisplayFileName(fileName: string): string {
    if (!fileName) return 'Attachment';

    // Format is usually: "12-03-2026-c83aa160-a90d-4eb2-ad3a-cf2970bc02c4.jpg"
    const parts = fileName.split('-');

    // If it has the GUID pattern (multiple parts), create a cleaner name
    if (parts.length > 4) {
      // Get the date part (first 3 parts: 12-03-2026)
      const datePart = parts.slice(0, 3).join('-');

      // Get the extension
      const extension = fileName.split('.').pop()?.toUpperCase() || '';

      return `Attachment (${datePart}).${extension}`;
    }

    // If it's a regular filename, just return the original
    return fileName;
  }

  // Add these properties to your component
  attachmentViewType: 'grid' | 'list' = 'grid';
  selectedAttachment: any = null;
  translateX = 0;
  translateY = 0;
  imageRotation = 0;
  zoomFactor = 1;
  isDragging = false;
  prevX = 0;
  prevY = 0;

  // View type methods
  setAttachmentViewType(type: 'grid' | 'list') {
    this.attachmentViewType = type;
  }

  // Full view methods
  openFullView(attachment: any) {
    this.selectedAttachment = attachment;
    this.resetView();
  }

  closeFullView() {
    this.selectedAttachment = null;
    this.resetView();
  }

  // Image manipulation methods
  rotateImage() {
    this.imageRotation = (this.imageRotation + 90) % 360;
  }

  zoomIn() {
    if (this.zoomFactor < 3) {
      this.zoomFactor += 0.1;
    }
  }

  zoomOut() {
    if (this.zoomFactor > 0.5) {
      this.zoomFactor -= 0.1;
    }
  }

  resetView() {
    this.translateX = 0;
    this.translateY = 0;
    this.imageRotation = 0;
    this.zoomFactor = 1;
  }

  // Drag methods
  startDrag(event: MouseEvent) {
    if (this.zoomFactor > 1) { // Only allow drag when zoomed in
      this.isDragging = true;
      this.prevX = event.clientX;
      this.prevY = event.clientY;
    }
  }

  onDrag(event: MouseEvent) {
    if (this.isDragging) {
      const deltaX = event.clientX - this.prevX;
      const deltaY = event.clientY - this.prevY;
      this.translateX += deltaX;
      this.translateY += deltaY;
      this.prevX = event.clientX;
      this.prevY = event.clientY;
    }
  }

  stopDrag() {
    this.isDragging = false;
  }

  // Mouse wheel zoom
  onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY > 0) {
      this.zoomOut();
    } else {
      this.zoomIn();
    }
  }

  // Image styles
  getImageStyles() {
    return {
      transform: `translate(${this.translateX}px, ${this.translateY}px) rotate(${this.imageRotation}deg) scale(${this.zoomFactor})`
    };
  }

  // Safe PDF URL
  getSafePdfUrl(attachment: any): SafeResourceUrl {
    if (attachment && attachment.FileBase64) {
      const pdfUrl = `data:application/pdf;base64,${attachment.FileBase64}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
    }
    return '';
  }

  // Download method
  downloadAttachment(attachment: any) {
    if (attachment.FileBase64) {
      const link = document.createElement('a');
      link.href = `data:${this.getMimeType(attachment.FileExtension)};base64,${attachment.FileBase64}`;
      link.download = attachment.FileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toastr.success('File download started');
    } else {
      this.toastr.warning('File content not available');
    }
  }

  // Print method
  printDocument(attachment: any) {
    if (attachment.FileBase64) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const mimeType = this.getMimeType(attachment.FileExtension);
        printWindow.document.write(`
        <html>
          <head>
            <title>${attachment.FileName || 'Document'}</title>
            <style>
              body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
              img, embed { max-width: 100%; max-height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            ${mimeType.includes('image') ?
            `<img src="data:${mimeType};base64,${attachment.FileBase64}" />` :
            `<embed src="data:${mimeType};base64,${attachment.FileBase64}" type="${mimeType}" width="100%" height="100%" />`
          }
          </body>
        </html>
      `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } else {
      this.toastr.warning('File content not available');
    }
  }

  // Get MIME type helper
  getMimeType(extension: string): string {
    const ext = (extension || '').toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  copyText(text: string) {
    this.helperService.copyMessage(text);
  }
}