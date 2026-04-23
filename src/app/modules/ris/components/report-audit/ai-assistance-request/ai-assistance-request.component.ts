// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppPopupService } from '../../../../shared/helpers/app-popup.service';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from '../../../../shared/helpers/api-routes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


@Component({
  standalone: false,

  selector: 'app-ai-assistance-request',
  templateUrl: './ai-assistance-request.component.html',
  styleUrls: ['./ai-assistance-request.component.scss']
})
export class AiAssistanceRequestComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  doctorAIFeedbackPopupRef: NgbModalRef;
  @ViewChild('doctorAIAssistFeedback') doctorAIAssistFeedback;
  public RISParams = {
    dateFrom: [null, ''],
    dateTo: [null, ''],
    visitID: [
      null,
      [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(14),
        Validators.pattern(/^\d{12}$|^\d{4}-\d{2}-\d{6}$/)
      ]
    ]
  };
  isSpinnerDoctorAIFeedback = true;
  disabledButtonDoctorAIFeedback = false;
  risParamsForm: FormGroup = this.formBuilder.group(this.RISParams)
  colNames = ['VisitNo', 'PatientName', 'TPCode', 'TPFullName', 'BranchCode', 'PhoneNumber', 'TestStatus', 'Workflow Status'];

  risWorkist: any = [];
  // employeesList = [];
  TechnicianID = null;
  params: { VisitID: any; BranchIDs: any; FilterBy: any; DateFrom: any; DateTo: any; };
  screenIdentity = null;
  loggedInUser: UserModel;
  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private helper: HelperService,
    private auth: AuthService
  ) { }

  confirmationPopoverConfigAIFeadback = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.risParamsForm.patchValue({
      dateFrom: Conversions.getCurrentDateObjectStartOfMonth(),
      dateTo: Conversions.getCurrentDateObject(),
    });

    this.screenIdentity = this.route.routeConfig.path;
    this.getRISWorkList()
  }


  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ngOnDestroy() { }

  ngOnChanges(changes: SimpleChanges) { }

  ngAfterViewInit() { }
  spinnerRefs = {
    listSection: 'listSection'
  }

  getRISWorkList() {
    const formValues = this.risParamsForm.getRawValue();
    // console.log("FORM VALUES IN PASS PARAMS: ",formValues)
    const visitID = formValues.visitID;
    if ((!formValues.dateFrom || !formValues.dateTo) && !visitID) {
      this.toastr.error('Please Select Date Range OR provide Visit ID (PIN)');
      this.isValidDateRange = false;
      return;
    } else {
      this.isValidDateRange = true;
    }
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isValidDateRange = false;
      return;
    }
    const maxDaysDifference = 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = '1 month';
      this.toastr.error(`The difference between dates should not exceed ${period}`);
      this.isValidDateRange = false;
      return;
    }

    // If everything is valid
    this.isValidDateRange = true;


    this.searchText = '';
    this.risWorkist = [];
    this.spinner.show(this.spinnerRefs.listSection);
    const params = {
      // DateFrom: val.visitID ? null : val.dateFrom,
      // DateTo: val.visitID ? null : val.dateTo,
      RadiologistID: this.loggedInUser.userid
    }
    this.sharedService.getData(API_ROUTES.AI_ASSISTANCE_REQUEST, params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
        this.risWorkist = resp.PayLoad || []
        console.log("risworklist b4", this.risWorkist)
        this.filterResults();
      }

    }, (err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log("Err", err)
    })

  }


  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }
  searchText = '';
  refreshPagination() {
    // this.clearVariables(0);
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      // .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  }

  filterResults() {
    // this.clearVariables(0);
    this.pagination.page = 1;
    const cols = ['VisitNo', 'PatientName', 'TPCode', 'TPFullName', 'BranchCode', 'PhoneNumber', 'TestStatus', 'Workflow Status'];
    let results: any = this.risWorkist;
    if (this.searchText && this.searchText.length > 2) {
      const pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.risWorkist, this.searchText, this.colNames, this.risWorkist);
    }
    this.pagination.filteredSearchResults = results;
    // console.log("this.pagination.filteredSearchResults____________", this.pagination.filteredSearchResults)
    this.refreshPagination();
    this.cd.detectChanges();

  }

  rowIndex = null;
  isCoppied = null;
  rowIndexCpy = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    const pin = text.VisitNo
    this.helper.copyMessage(pin);
    this.isCoppied = true;
    setTimeout(() => {
      this.isCoppied = false;
      this.rowIndexCpy = null;
    }, 3000);
  }
  returnCopyClasses(i) {
    let styleClass = 'ti-files'
    if (this.rowIndex == i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle text-white';
    } else if (this.rowIndex == i && this.rowIndexCpy != i) {
      styleClass = 'ti-files text-white';
    } else if (this.rowIndex == !i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else if (this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else {
      styleClass = 'ti-files';
    }
    return styleClass;
  }


  copyVisitNo(visitno: any) {
    this.helper.copyMessage(visitno);
  }

  isValidDateRange = true;
  clickSubmitAIRequestFeedback = false;
  RadiologistRating = null;
  RadiologistRemarks = null;
  setRatingValue(rating) {
    this.clickSubmitAIRequestFeedback = false;
    this.RadiologistRating = rating;
  }
  VisitId = null;
  TPID = null;
  PatientID = null;
  LocId = null;
  existingFeedback = null;
  RISRequestAIFeedBackID = null;
  AuditorRadiologistID = null;
  openFeedBackAuditModal(row, i) {
    this.cleartForm();
    this.AIAssistanceRequestRow = row;
    this.rowIndex = i;
    this.VisitId = row.VisitID;
    this.TPID = row.TPID;
    this.PatientID = row.PatientID;
    this.LocId = row.LocId;

    const params = {
      VisitID: row.VisitID,
      TPID: row.TPID,
      RadiologistID: this.loggedInUser.userid
    }
    this.sharedService.getData(API_ROUTES.GET_EXISTINCE_AI_ASSISTANCE_FEEDBACK, params).subscribe((resp: any) => {
      if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
        this.existingFeedback = resp.PayLoad || [];
        if (this.existingFeedback.length) {
          this.RadiologistRating = this.existingFeedback[0].RadiologistRating;
          this.RadiologistRemarks = this.existingFeedback[0].RadiologistRemarks;
          this.RISRequestAIFeedBackID = this.existingFeedback[0].RISRequestAIFeedBackID;
          this.AuditorRadiologistID = this.existingFeedback[0].AuditorRadiologistID;
        }
      }
    }, (err) => {
      console.log("Err", err)
    })
    setTimeout(() => {
      this.doctorAIFeedbackPopupRef = this.appPopupService.openModal(this.doctorAIAssistFeedback, { backdrop: 'static', size: 'md' });
    }, 500);

  }
  cleartForm() {
    this.RadiologistRating = null;
    this.RadiologistRemarks = null;
    this.RISRequestAIFeedBackID = null;
    this.AuditorRadiologistID = null;
  }
  processAIAssistenceFeedBack() {
    if (!this.RISRequestAIFeedBackID) {
      this.saveAIAssistenceFeedBack();
    } else {
      this.updateAIAssistenceFeedBack();
    }
  }

  saveAIAssistenceFeedBack() {
    this.clickSubmitAIRequestFeedback = true;
    if (!this.RadiologistRating) {
      this.toastr.error("Please select your satisfaction level before submitting the form.", "We value your input.");
      return;
    }
    if (this.RadiologistRating == 3 && (!this.RadiologistRemarks || this.RadiologistRemarks == "")) {
      this.toastr.error("Please provide remarks", "Validation Error");
      return;
    }
    const dataObj = {
      VisitID: Number(this.VisitId),
      PatientID: this.PatientID,
      TPID: this.TPID,
      LocID: this.LocId,
      RadiologistRating: this.RadiologistRating,
      RadiologistRemarks: this.RadiologistRemarks,
      CreatedBy: this.loggedInUser.userid,
    };
    this.disabledButtonDoctorAIFeedback = true;
    this.isSpinnerDoctorAIFeedback = false;
    this.sharedService.insertUpdateData(API_ROUTES.AI_ASSISTANCE_DOCTOR_FEEDBACK, dataObj).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.toastr.success(data.Message);
        this.disabledButtonDoctorAIFeedback = false;
        this.isSpinnerDoctorAIFeedback = true;
        this.doctorAIFeedbackPopupRef.close();
      }
      else {
        this.toastr.error(data.Message);
        this.disabledButtonDoctorAIFeedback = false;
        this.isSpinnerDoctorAIFeedback = true;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error("Something Went Wrong");
      this.disabledButtonDoctorAIFeedback = false;
      this.isSpinnerDoctorAIFeedback = true;
    })
  }
  updateAIAssistenceFeedBack() {
    this.clickSubmitAIRequestFeedback = true;
    if (!this.RadiologistRating) {
      this.toastr.error("Please select any smiley rating", "Validation Error");
      return;
    }
    if (this.RadiologistRating == 3 && (!this.RadiologistRemarks || this.RadiologistRemarks == "")) {
      this.toastr.error("Please provide remarks", "Validation Error");
      return;
    }
    const dataObj = {
      RISRequestAIFeedBackID: this.RISRequestAIFeedBackID,
      RadiologistRating: this.RadiologistRating,
      RadiologistRemarks: this.RadiologistRemarks,
      CreatedBy: this.loggedInUser.userid,
    };
    this.disabledButtonDoctorAIFeedback = true;
    this.isSpinnerDoctorAIFeedback = false;
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_AI_ASSISTANCE_DOCTOR_FEEDBACK, dataObj).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.toastr.success(data.Message);
        this.disabledButtonDoctorAIFeedback = false;
        this.isSpinnerDoctorAIFeedback = true;
        this.doctorAIFeedbackPopupRef.close();
      }
      else {
        this.toastr.error(data.Message);
        this.disabledButtonDoctorAIFeedback = false;
        this.isSpinnerDoctorAIFeedback = true;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error("Something Went Wrong");
      this.disabledButtonDoctorAIFeedback = false;
      this.isSpinnerDoctorAIFeedback = true;
    })
  }

  searchByVisit() {
    const visitID = this.risParamsForm.getRawValue().visitID;
    if (visitID) {
      this.risParamsForm.patchValue({
        dateFrom: "",
        dateTo: ""
      })

    } else {
      this.risParamsForm.patchValue({
        dateFrom: Conversions.getCurrentDateObjectStartOfMonth(),
        dateTo: Conversions.getCurrentDateObject()
      });

    }
  }

  getRowActive(row, i) {
    this.AIAssistanceRequestRow = row;
    this.rowIndex = i;
  }
  clearVisitID() {
    this.risParamsForm.get('visitID')?.setValue('');
  }
  allowOnlyDigitsAndDash(event: KeyboardEvent) {
    const allowedChars = /[0-9\-]/;
    const inputChar = String.fromCharCode(event.keyCode || event.which);
    if (!allowedChars.test(inputChar)) {
      event.preventDefault();
    }
  }
  onPasteVisitID_(event: ClipboardEvent) {
    event.preventDefault();
    const pastedInput = event.clipboardData?.getData('text') || '';
    // Remove anything except digits and dashes
    const sanitized = pastedInput.replace(/[^0-9\-]/g, '');
    const ctrl = this.risParamsForm.get('visitID');
    ctrl?.setValue(sanitized);
  }
  onPasteVisitID(event: ClipboardEvent) {
    const pastedInput = event.clipboardData?.getData('text') || '';
    if (!/^[0-9\-]*$/.test(pastedInput)) {
      event.preventDefault();
    }
  }
  PACSServers = [];
  SysInfo: any = {};
  getAIImgs(row, i) {
    this.rowIndex = i;
  }
  getPACSServers(i, j, k) {

  }
  getAIImages(visitID, TPID, rowIndex) {
    this.rowIndex = rowIndex;
    this.VisitId = visitID;
    this.TPID = TPID;
    this.getRISAIAssistanceRequestByVIsitIDTPID();
  }

  disabledButtonExport = false;
  isSpinnerExport = true;

  //////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// begin:: AI Assistence Images opening work //////////////////////////////
  /////////////////////////////////////////////////////////// //////////////////////////////////////
  getAndOpenDicomImageByButton(row, index) {
    this.VisitId = row.VisitID;
    this.TPID = row.TPID;
    this.AIAssistanceRequestRow = row;
    // console.log("AIAssistanceRequestRow",this.AIAssistanceRequestRow);return;
    this.rowIndex = index;
    if (this.AIAssistanceRequestRow.Annon_ID) {
      this.isAIImages = true;
      this.storedDicomData.anonId = this.AIAssistanceRequestRow.Annon_ID;
      // Parse AIServerResponse to get original data
      try {
        const aiResponse = JSON.parse(this.AIAssistanceRequestRow.AIServerResponse);
        if (aiResponse.anonymized_data?.original) {
          this.storedDicomData.originalData = aiResponse.anonymized_data.original;
        }
      } catch (e) {
        console.error('Error parsing AIServerResponse:', e);
      }

      // Store path if it exists (but don't open automatically)
      if (this.AIAssistanceRequestRow.DeAnonymizedFolderPath) {
        this.storedDicomData.imagePath = this.AIAssistanceRequestRow.DeAnonymizedFolderPath;
      }
    }

    // If we already have a path, just open it
    if (this.storedDicomData.imagePath) {
      this.openDicomImage(this.storedDicomData.imagePath);
      return;
    }

    // If no path but we have the required data, fetch from storage server
    if (this.storedDicomData.anonId && this.storedDicomData.originalData) {
      this.getAndOpenDicomImage({
        anon_id: this.storedDicomData.anonId,
        original: this.storedDicomData.originalData
      });
      return;
    }

    // If we don't have enough data
    this.toastr.error("No DICOM data available to open");

    // Optional: Try to reload the data if we're missing something
    if (!this.storedDicomData.anonId || !this.storedDicomData.originalData) {
      this.getRISAIAssistanceRequestByVIsitIDTPID();
    }
  }

  // Open AI Images 
  private openDicomImage(imagePath: string): void {
    this.openDicomImageWithOrigional();
    return;
    this.disabledButtonExport = true;
    this.isSpinnerExport = false;
    try {
      // var createLink = (this.PACSServers[0].BackupServer);

      // createLink = createLink.substring(0, createLink.length - 1)
      const createLink = imagePath
      const sanitizedPath = createLink.replace(/\\/g, '%5C');
      const url = ('radiant://?n=f&v=%22' + sanitizedPath + '%22')
      // console.log("url is :", url)

      // let winRef = window.open((url), '_blank');
      const winRef = window.open((url), '_blank');
      this.disabledButtonExport = false;
      this.isSpinnerExport = true;
    } catch (error) {
      console.error('Error opening DICOM:', error);
      this.toastr.error("Could not open DICOM image");
      this.disabledButtonExport = false;
      this.isSpinnerExport = true;
    }
  }
  getAndOpenDicomImage(dicomData: any): void {
    const requestPayload = {
      anon_id: dicomData.anon_id,
      original: {
        PatientID: dicomData.original.PatientID,
        PatientName: dicomData.original.PatientName,
        StudyInstanceUID: dicomData.original.StudyInstanceUID,
        SeriesInstanceUID: dicomData.original.SeriesInstanceUID,
        SOPInstanceUID: dicomData.original.SOPInstanceUID
      }
    };
    this.disabledButtonExport = true;
    this.isSpinnerExport = false;
    this.sharedService.getData(API_ROUTES.REQUEST_AI_PROCESSED_DICOM, requestPayload).subscribe({
      next: (response: any) => {
        try {
          this.disabledButtonExport = false;
          this.isSpinnerExport = true;
          if (response.StatusCode === 200) {
            const payload = typeof response.PayLoadStr === 'string'
              ? JSON.parse(response.PayLoadStr)
              : response.PayLoadStr;
            // Store the path globally
            this.storedDicomData.imagePath = payload.ImagePath || payload.path;

            if (this.storedDicomData.imagePath) {
              console.log('getAndOpenDicomImage called, this.storedDicomData:', this.storedDicomData);
              this.openDicomImage(this.storedDicomData.imagePath);
              this.toastr.success("DICOM image is ready for viewing");
            } else {
              this.toastr.error("DICOM image path not found");
            }
          } else {
            this.toastr.error(response.Message || "Failed to retrieve DICOM image");
          }
          this.disabledButtonExport = false;
          this.isSpinnerExport = true;
        } catch (error) {
          this.handleError(error);
          this.disabledButtonExport = false;
          this.isSpinnerExport = true;
        }
      },
      error: (error) => this.handleError(error)
    });
  }
  disabledButtonAIRequest = false;
  isSpinnerAIRequest = false;
  isAIImages = false;
  anonId: string | null = null;
  AIResponse: any;
  originalData: any; // Fixed typo from "origional" to "original"
  private storedDicomData: {
    anonId?: string;
    originalData?: any;
    imagePath?: string;
  } = {};
  private handleError(error: any): void {
    console.error('Error:', error);
    this.toastr.error(error.message || "An error occurred");
    this.disabledButtonAIRequest = false;
    this.isSpinnerAIRequest = false;
    this.disabledButtonExport = false;
    this.isSpinnerExport = true;
  }
  AIAssistanceRequestRow: any;
  getRISAIAssistanceRequestByVIsitIDTPID() {
    const params = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID
    };

    this.sharedService.getData(API_ROUTES.GET_RIS_AI_ASSISTANCE_REQUEST_BY_VISIT_ID_TPID, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.AIAssistanceRequestRow = res.PayLoad[0];
        // Reset storedDicomData
        this.storedDicomData = {
          anonId: null,
          originalData: null,
          imagePath: null
        };

        // Check if we have Annon_ID
        if (this.AIAssistanceRequestRow.Annon_ID) {
          this.isAIImages = true;
          this.storedDicomData.anonId = this.AIAssistanceRequestRow.Annon_ID;
          // Parse AIServerResponse to get original data
          try {
            const aiResponse = JSON.parse(this.AIAssistanceRequestRow.AIServerResponse);
            if (aiResponse.anonymized_data?.original) {
              this.storedDicomData.originalData = aiResponse.anonymized_data.original;
            }
          } catch (e) {
            console.error('Error parsing AIServerResponse:', e);
          }

          // Store path if it exists (but don't open automatically)
          if (this.AIAssistanceRequestRow.DeAnonymizedFolderPath) {
            this.storedDicomData.imagePath = this.AIAssistanceRequestRow.DeAnonymizedFolderPath;
          }
          setTimeout(() => {
            this.getAndOpenDicomImageByButton(this.AIAssistanceRequestRow, this.rowIndex)
          }, 200);
        } else {
          this.isAIImages = false;
        }

      }
      // else {
      //   // this.toastr.error('AI assistance request row could not be loaded');
      // }
    }, (err) => {
      console.log(err);
      this.toastr.error('Error loading AI assistance request');
    });
  }

  // Open the DICOM images
  openDicomImageWithOrigional() {
    
    const isVPN = localStorage.getItem('isVPN') === 'true';
    // 🔹 Step 1: First fixed object
    const firstObj = {
      VisitID: this.VisitId,
      TPID: this.TPID
    };
    const tblVisitTestDetail = [firstObj];
    const objParams = {
      IsVPN: isVPN,
      LocID: this.loggedInUser.locationid,
      tblVisitTPID: tblVisitTestDetail,
      IsAI: true,
      UserID: this.loggedInUser.userid
    };
    this.disabledButtonExport = true;
    this.isSpinnerExport = false;
    this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS_LOC_AND_VISITS_V2, objParams).subscribe((resp: any) => {
      this.disabledButtonExport = false;
      this.isSpinnerExport = true;
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.PACSServers = resp.PayLoad || [];
        console.log("this.PACSServers", this.PACSServers);

        // Dynamic handling for any number of servers
        if (this.PACSServers.length > 0) {


          // Create the URL dynamically for any number of servers
          let url = 'radiant://?n=f';

          // Add each server path to the URL
          this.PACSServers.forEach((server, index) => {
            let sanitizedPath = server.BackupServer;

            // Remove trailing slash if present
            if (sanitizedPath.endsWith('\\')) {
              sanitizedPath = sanitizedPath.substring(0, sanitizedPath.length - 1);
            }

            // Replace backslashes with URL encoding
            sanitizedPath = sanitizedPath.replace(/\\/g, '%5C');

            // Add to URL with proper parameter name
            url += `&v=%22${sanitizedPath}%22`;
          });

          // Open the URL
          window.open(url, '_blank');
        } else {
          this.disabledButtonExport = false;
          this.isSpinnerExport = true;
          this.toastr.warning("No PACS Servers Available");
        }
      } else if (resp.StatusCode == 200 && !resp.PayLoad.length) {
        this.disabledButtonExport = false;
        this.isSpinnerExport = true;
        this.toastr.warning("No Record Found");
      }
    }, (err) => {
      this.disabledButtonExport = false;
      this.isSpinnerExport = true;
      console.log(err);
      this.toastr.error("Error fetching PACS servers");
    });
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// end:: AI Assistence Images opening work ////////////////////////////////
  /////////////////////////////////////////////////////////// //////////////////////////////////////
}
