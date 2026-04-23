// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { environment } from 'src/environments/environment';
import { ratingElement } from '../../../../../../app/ratingElement';
import { ActivatedRoute } from '@angular/router';
import * as Chart from 'chart.js';
// import { ChartDataSets, ChartOptions } from 'chart.js';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { VitalsService } from '../../../services/vitals.service';
import moment from 'moment';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';

type Color = any;
type Label = any;

@Component({
  standalone: false,

  selector: 'app-tech-audit-summary-report',
  templateUrl: './tech-audit-summary-report.component_new.html',
  styleUrls: ['./tech-audit-summary-report.component.scss']
})
export class TechAuditSummaryReportComponent implements OnInit {
  @ViewChild('techAuditModal') techAuditModal;
  screenIdentity = null;
  public starRatingElements: ratingElement[] = [];
  public starRatingElementsInner: ratingElement[] = [];
  subSectionList: any = [];
  technologistList = [];
  risWorklist = [];
  qualityAssurance = []
  rowIndex = null;
  searchText = '';
  inValidDateRange = false;
  spinnerRefs = {
    listSection: 'listSection'
  }
  noDataMessage = 'Please search to get audit summary report data';
  disabledButton = false;
  isSpinner = true;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessageReject: 'Are you <b>sure</b> you want to Reject?',
    popoverMessageRecommend: 'Are you <b>sure</b> you want to Recommend?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  _form = this.fb.group({
    TechnologistID: [null, Validators.compose(this.generateValidatorsForRadiologistID())],
    AuditorTechnologistID: [null,],
    dateFrom: ['',],
    dateTo: ['',],
    RatingCondition: ['',],
    Rating: ['',],
    AuditQAIDs: ['',],
    BranchID: [null,],
    isFined: ['',],
    isTechRemarks: ['',]
  });

  AuditorTechnologistID = null;
  loggedInUser: UserModel;
  isRatingRequired = false;
  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private helper: HelperService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private excelService: ExcelService,
    private vitalsSrv: VitalsService,
    private appPopupService: AppPopupService,
  ) {
    this._form = this.fb.group({
      TechnologistID: [, Validators.compose([Validators.required])],
      AuditorTechnologistID: [null,],
      dateFrom: [''],
      dateTo: [''],
      RatingCondition: [''],
      Rating: [''],
      AuditQAIDs: ['',],
      BranchID: [null,],
      isFined: ['',],
      isTechRemarks: ['',]
    });

    // Set up dynamic validation for the Rating control based on RatingCondition
    this._form.get('RatingCondition').valueChanges.subscribe((ratingCondition) => {
      const ratingControl = this._form.get('Rating');

      if (ratingCondition) {
        this.isRatingRequired = true;
        // If RatingCondition has a value, make Rating control required
        ratingControl.setValidators([Validators.required]);
      } else {
        // If RatingCondition is empty, remove the required validator
        ratingControl.setValidators(null);
        this.isRatingRequired = true;
      }

      // Update the validity of the Rating control
      ratingControl.updateValueAndValidity();
    });
  }
  generateValidatorsForRadiologistID() {
    return this.screenIdentity === '!radiologist-audit-findings'
      ? [Validators.required]
      : [];
  }
  isShowDoctorName = true;
  ngOnInit(): void {
    this.screenIdentity = this.route.routeConfig.path;
    this.isShowDoctorName = this.screenIdentity !== 'my-tech-audit-summary-report'?true:false;
    this.loadLoggedInUserInfo();
    this._form.patchValue({
      dateFrom: Conversions.getCurrentDateObject(),
      dateTo: Conversions.getCurrentDateObject()
    });
    this.route.params.subscribe(params => {
      // Assuming 'screenIdentity' is a route parameter

      // Update validators for RadiologistID when screenIdentity changes
      const radiologistIDControl = this._form.get('TechnologistID');
      if (radiologistIDControl) {
        radiologistIDControl.setValidators(this.generateValidatorsForRadiologistID());
        radiologistIDControl.updateValueAndValidity();
      }
    });
    this.getTechnologist();
    this.getAuditQA();
    this.getBranches();
    const _ratingElement = new ratingElement();
    _ratingElement.readonly = true;
    _ratingElement.checkedcolor = "red";
    _ratingElement.uncheckedcolor = "black";
    _ratingElement.value = this.roundedAverageRating || 0
    _ratingElement.size = 15;
    _ratingElement.totalstars = 5;
    this.starRatingElementsInner.push(_ratingElement);
    if (this.screenIdentity == 'my-tech-audit-summary-report')
      this.getRISTechnologistAuditSummary();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  onSelectAllSections() {
    this._form.patchValue({
      subSectionIDs: this.subSectionList.map(a => a.SubSectionId)
    });
  }


  onUnselectAllSections() {
    this._form.patchValue({
      subSectionIDs: []
    });
  }
  clearSearchedvalue() {
    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="subSectionIDs"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }
  }

  getTechnologist() {
    this.technologistList = [];
    this.technologistList = [];
    this.sharedService.getData(API_ROUTES.GET_TECHNOLOGISTS, {}).subscribe((res: any) => {
      if (res && res.StatusCode == 200) {
        this.technologistList = res.PayLoad;
        this.technologistList = this.technologistList.map(a => ({ EmpId: a.EmpId, EmpNo: a.EmpNo, EmployeeName: a.EmployeeName, UserId: a.UserId, FullName: '[IDC-' + a.EmpNo.padStart(4, '0') + '] ' + a.EmployeeName }));
      }
    }, (err) => {
      console.log("err")
    })
  }


  validateDateDifference(index) {
    const formValues = this._form.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;

    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      if (index === 1) {
        this._form.patchValue({
          dateTo: "" // Conversions.getCurrentDateObject()
        });
      }
      else {
        this._form.patchValue({
          dateFrom: ""// Conversions.getCurrentDateObject(),
        });
      }
    }
    const daysDifference = (toDate - fromDate) / (1000 * 3600 * 24);
    const revertDays = (fromDate - toDate) / (1000 * 3600 * 24);
    if (daysDifference > 60 || revertDays > 60) {
      this.toastr.error('The difference between dates should be 2 months');
      if (index === 1) {
        this._form.patchValue({
          dateTo: "" //Conversions.getCurrentDateObject()
        });
      }
      else {
        this._form.patchValue({
          dateFrom: "" //Conversions.getCurrentDateObject(),
        });
      }
    }
  }

  roundedAverageRating = null;
  BranchID = null;
  TechnologistID = null;
  chartLabels: any = [];
  chartValues: any = [];
  chartLabelsTC: any = [];
  chartValuesTC: any = [];
  TotalRecommendedFine: any = 0;
  getRISTechnologistAuditSummary_() {
    this.risWorklist = [];
    const formValues = this._form.getRawValue();
    this.BranchID = formValues.BranchID || null;
    this.TechnologistID = formValues.TechnologistID || null;
    this._form.markAllAsTouched();
    if (this._form.invalid) {
      this.toastr.warning('Please provide the required information!'); return false;
    } else {
      const objParams = {
        TechnologistID: this.screenIdentity == 'my-tech-audit-summary-report' ? this.loggedInUser.userid : formValues.TechnologistID,
        AuditorTechnologistID: formValues.AuditorTechnologistID,
        DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
        DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
        RatingCondition: formValues.RatingCondition ? formValues.RatingCondition : null,
        Rating: formValues.Rating ? formValues.Rating : null,
        AuditQAIDs: formValues.AuditQAIDs.length ? formValues.AuditQAIDs.join(",") : null,
        LocID: formValues.BranchID || null,
        isShared: (this.screenIdentity == 'my-tech-audit-summary-report' || this.screenIdentity == 'tech-audit-summary-report-mgr') ? 1 : null,
        ManagerID: this.screenIdentity == 'tech-audit-summary-report-branch-mgr' ? this.loggedInUser.userid : null,
        isFined: formValues.isFined ? formValues.isFined : null,
        isTechRemarks: formValues.isTechRemarks ? formValues.isTechRemarks : null,
      };
      this.spinner.show(this.spinnerRefs.listSection);
      this.sharedService.getData(API_ROUTES.GET_RIS_TECHNOLOGIST_AUDIT_SUMMARY, objParams).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
          this.risWorklist = resp.PayLoad || [];
          /////////////Chart Data////////////////////////
          if (this.BranchID && !this.TechnologistID) { }
          this.renderChart()
          /////////////Chart Data////////////////////////
          this.roundedAverageRating = Math.round(
            this.risWorklist
              .filter(report => report.hasOwnProperty('Rating'))
              .reduce((accumulator, currentReport) => accumulator + currentReport.Rating, 0) /
            this.risWorklist.length * 2
          ) / 2;
          this.TotalRecommendedFine =
            this.risWorklist
              .filter(report => report.hasOwnProperty('RecommendedFine'))
              .reduce((accumulator, currentReport) => accumulator + currentReport.RecommendedFine, 0);
          this.TotalRecommendedFine = this.TotalRecommendedFine.toLocaleString();

          setTimeout(() => {
            this.starRatingElements.splice(0, this.starRatingElements.length);
            const _ratingElement = new ratingElement();
            _ratingElement.readonly = true;
            _ratingElement.checkedcolor = "red";
            _ratingElement.uncheckedcolor = "black";
            _ratingElement.value = this.roundedAverageRating || 0
            _ratingElement.size = 30;
            _ratingElement.totalstars = 5;
            this.starRatingElements.push(_ratingElement);
          }, 100);
        } else {
          this.noDataMessage = 'No record found...';
          this.risWorklist = []
        }

      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.log("Err", err)
      })
    }
  }
  risWorklistForExport = [];
  rowCount = 0;
  getRISTechnologistAuditSummary() {
    this.isCheckboxChecked = false;
    this.risWorklist = [];
    const formValues = this._form.getRawValue();
    this.BranchID = formValues.BranchID || null;
    this.TechnologistID = formValues.TechnologistID || null;
    this._form.markAllAsTouched();
    if (this._form.invalid) {
      this.toastr.warning('Please provide the required information!'); return false;
    } else {
      const objParams = {
        TechnologistID: this.screenIdentity == 'my-tech-audit-summary-report' ? this.loggedInUser.userid : formValues.TechnologistID,
        AuditorTechnologistID: formValues.AuditorTechnologistID,
        DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
        DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
        RatingCondition: formValues.RatingCondition ? formValues.RatingCondition : null,
        Rating: formValues.Rating ? formValues.Rating : null,
        AuditQAIDs: formValues.AuditQAIDs.length ? formValues.AuditQAIDs.join(",") : null,
        LocID: formValues.BranchID || null,
        isShared: (this.screenIdentity == 'my-tech-audit-summary-report' || this.screenIdentity == 'tech-audit-summary-report-mgr') ? 1 : null,
        ManagerID: this.screenIdentity == 'tech-audit-summary-report-branch-mgr' ? this.loggedInUser.userid : null,
        isFined: formValues.isFined ? formValues.isFined : null,
        isTechRemarks: formValues.isTechRemarks ? formValues.isTechRemarks : null,
      };
      this.spinner.show(this.spinnerRefs.listSection);
      this.sharedService.getData(API_ROUTES.GET_RIS_TECHNOLOGIST_AUDIT_SUMMARY, objParams).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
          const response = resp.PayLoad || [];
          this.orignaRisList = resp.PayLoad
          this.risWorklistForExport = response || []
          this.rowCount = response.length || 0;
          // console.log("risworklist before formate: ", response);
          //////////////////////begin:: Reformat Array////////////////////
          this.GetRISTechInitSummary();
          const res = response.reduce((re, o) => {
            const existObj = re.find(obj => obj.TechnologistID === o.TechnologistID);
            if (existObj) {
              existObj.techData.push({
                AuditStatusID: o.AuditStatusID,
                AuditorTechnologistID: o.AuditorTechnologistID,
                Branch: o.Branch,
                CommaSeparatedQATitles: o.CommaSeparatedQATitles,
                CommaSeparatedQATitlesCount: o.CommaSeparatedQATitlesCount,
                PIN: o.PIN,
                PatientID: o.PatientID,
                PatientName: o.PatientName,
                PhoneNumber: o.PhoneNumber,
                Rating: o.Rating,
                Recommendation: o.Recommendation,
                RecommendedFine: o.RecommendedFine,
                ManagerRemarks: o.ManagerRemarks,
                ApprovedFine: o.ApprovedFine,
                Remarks: o.Remarks,
                TechRemarks: o.TechRemarks,
                Section: o.Section,
                TPCode: o.TPCode,
                TPID: o.TPID,
                TPName: o.TPName,
                TechnologistID: o.TechnologistID,
                TechnologistName: o.TechnologistName,
                TechnologistVisitTPAuditID: o.TechnologistVisitTPAuditID,
                VisitID: o.VisitID,
                FeedBackBy: o.FeedBackBy,
                FeedBackOn: o.FeedBackOn,
                FeedBackRemarks: o.FeedBackRemarks,
                FeedBackDetailRemarks: o.FeedBackDetailRemarks ? o.FeedBackDetailRemarks.replace(/,$/, '').split(',') : null,
                FBHLocCode: o.FBHLocCode || null
              });
            } else {
              re.push({
                TechnologistID: o.TechnologistID,
                TechnologistName: o.TechnologistName,
                Branch: o.Branch,
                TotalAmt: 0, // Initialize total amount
                AverageRating: 0, // Initialize total amount
                techData: [{
                  AuditStatusID: o.AuditStatusID,
                  AuditorTechnologistID: o.AuditorTechnologistID,
                  Branch: o.Branch,
                  CommaSeparatedQATitles: o.CommaSeparatedQATitles,
                  CommaSeparatedQATitlesCount: o.CommaSeparatedQATitlesCount,
                  PIN: o.PIN,
                  PatientID: o.PatientID,
                  PatientName: o.PatientName,
                  PhoneNumber: o.PhoneNumber,
                  Rating: o.Rating,
                  Recommendation: o.Recommendation,
                  RecommendedFine: o.RecommendedFine,
                  ManagerRemarks: o.ManagerRemarks,
                  ApprovedFine: o.ApprovedFine,
                  Remarks: o.Remarks,
                  TechRemarks: o.TechRemarks,
                  Section: o.Section,
                  TPCode: o.TPCode,
                  TPID: o.TPID,
                  TPName: o.TPName,
                  TechnologistID: o.TechnologistID,
                  TechnologistName: o.TechnologistName,
                  TechnologistVisitTPAuditID: o.TechnologistVisitTPAuditID,
                  VisitID: o.VisitID,
                  FeedBackBy: o.FeedBackBy,
                  FeedBackOn: o.FeedBackOn,
                  FeedBackRemarks: o.FeedBackRemarks,
                  FeedBackDetailRemarks: o.FeedBackDetailRemarks ? o.FeedBackDetailRemarks.replace(/,$/, '').split(',') : null,
                  FBHLocCode: o.FBHLocCode || null
                }]
              });
            }
            return re;
          }, []);

          // Calculate TotalAmt for each patient
          res.forEach(tech => {
            tech.TotalAmt = tech.techData.reduce((total, item) => total + item.RecommendedFine, 0);
            tech.AverageRating = tech.techData.reduce((total, item) => total + item.Rating, 0) / tech.techData.length;
            tech.AverageRatingRounded = this.roundToNearestHalfStep(tech.AverageRating); // Apply rounding function
            tech.TotalAmt = tech.TotalAmt.toLocaleString(); // Format total amount
          });

          this.risWorklist = res;
          // console.log("risworklist after formate: ", this.risWorklist);
          //////////////////////end:: Reformat Array//////////////////////

          /////////////Chart Data////////////////////////
          if (this.BranchID && !this.TechnologistID) { }
          // setTimeout(() => {
          // this.renderChart()
          // }, 500);
          /////////////Chart Data////////////////////////
          this.roundedAverageRating = Math.round(
            this.risWorklist
              .filter(report => report.hasOwnProperty('Rating'))
              .reduce((accumulator, currentReport) => accumulator + currentReport.Rating, 0) /
            this.risWorklist.length * 2
          ) / 2;

          this.TotalRecommendedFine =
            this.risWorklist
              .filter(report => report.hasOwnProperty('RecommendedFine'))
              .reduce((accumulator, currentReport) => accumulator + currentReport.RecommendedFine, 0);
          this.TotalRecommendedFine = this.TotalRecommendedFine.toLocaleString();

          setTimeout(() => {
            this.starRatingElements.splice(0, this.starRatingElements.length);
            const _ratingElement = new ratingElement();
            _ratingElement.readonly = true;
            _ratingElement.checkedcolor = "red";
            _ratingElement.uncheckedcolor = "black";
            _ratingElement.value = this.roundedAverageRating || 0
            _ratingElement.size = 30;
            _ratingElement.totalstars = 5;
            this.starRatingElements.push(_ratingElement);
          }, 100);
          console.log("dataset __", this.risWorklist)
        } else {
          this.noDataMessage = 'No record found...';
          this.risWorklist = []
        }

      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error("Something went wrong...")
        console.log("Err", err)
      })
    }
  }


  roundToNearestHalfStep(rating: number): number {
    const steps = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
    for (let i = 0; i < steps.length; i++) {
      if (rating <= steps[i]) {
        return steps[i];
      }
    }
    return 5; // Return the maximum rating if it exceeds 5
  }
  renderChart() {
    // old code from plan parent array
    // let chartData = this.risWorklist.reduce((acc, item) => {
    //   // Check if TechnologistID already exists in the accumulator
    //   let existingTechnologist = acc.find((t) => t.TechnologistID === item.TechnologistID);

    //   if (existingTechnologist) {
    //     // If exists, update the CommaSeparatedQATitlesCount sum
    //     existingTechnologist.CommaSeparatedQATitlesCount += item.CommaSeparatedQATitlesCount;
    //   } else {
    //     // If doesn't exist, add a new entry
    //     acc.push({
    //       TechnologistID: item.TechnologistID,
    //       TechnologistName: item.TechnologistName,
    //       CommaSeparatedQATitlesCount: item.CommaSeparatedQATitlesCount,
    //     });
    //   }

    //   return acc;
    // }, []);

    // end of plan array

    // new code for calculated the mistakes for chat
    const chartData = this.risWorklist.reduce((acc, technologist) => {
      // Check if TechnologistID already exists in the accumulator
      const existingTechnologist = acc.find((t) => t.TechnologistID === technologist.TechnologistID);

      if (existingTechnologist) {
        // If exists, update the CommaSeparatedQATitlesCount sum from the techData array
        existingTechnologist.CommaSeparatedQATitlesCount = technologist.techData.reduce((total, item) => total + item.CommaSeparatedQATitlesCount, 0);
      } else {
        // If doesn't exist, add a new entry
        acc.push({
          TechnologistID: technologist.TechnologistID,
          TechnologistName: technologist.TechnologistName,
          CommaSeparatedQATitlesCount: technologist.techData.reduce((total, item) => total + item.CommaSeparatedQATitlesCount, 0)
        });
      }

      return acc;
    }, []);


    const chartDataTC = this.RISTechInitSummary.reduce((acc, technologist) => {
      // Check if InitBy already exists in the accumulator
      const existingTechnologist = acc.find((t) => t.InitBy === technologist.InitBy);
      if (existingTechnologist) {
        // If exists, increment the count for total cases
        existingTechnologist.TotalCasesCount += 1;
      } else {
        // If doesn't exist, add a new entry with a count of 1
        acc.push({
          InitBy: technologist.InitBy,
          TechnologistName: technologist.TechName,
          TotalCasesCount: 1
        });
      }
      return acc;
    }, []);

    // Extract chart labels and values
    this.chartLabelsTC = this.RISTechInitSummary.map((item) => item.TechName);
    this.chartValuesTC = this.RISTechInitSummary.map((item) => item.TotalRecord);
    // Now `chartData` contains aggregated data for each Technologi
    // Separate the labels (TechnologistName) and data (CommaSeparatedQATitlesCount)
    this.chartLabels = chartData.map((item) => item.TechnologistName);
    this.chartValues = chartData.map((item) => item.CommaSeparatedQATitlesCount);
    // this.lineChartData = [
    //   { data: this.chartValues, label: 'Branch Wise Tech Mistakes' },
    // ];

    this.barChartData = [
      { data: this.chartValues, label: 'Branch Wise Tech Mistakes' },
    ];
    this.barChartDataTC = [
      { data: this.chartValuesTC, label: 'Branch Wise Tech Total Cases' },
    ];
    // this.lineChartLabels = this.chartLabels;
    // this.lineChartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    this.barChartLabels = this.chartLabels;

    this.barChartLabelsTC = this.chartLabelsTC;
    // this.lineChartOptions = {
    //   legend: {
    //     display: true,
    //   },
    //   hover: {
    //     animationDuration: 0
    //   },
    //   animation: {
    //     onComplete: function () {
    //       const chartInstance = this.chart,
    //         ctx = chartInstance.ctx;
    //       ctx.textAlign = "center";
    //       ctx.textBaseline = "middle";
    //       this.data.datasets.forEach(function (dataset, i) {
    //         const meta = chartInstance.controller.getDatasetMeta(i);
    //         meta.data.forEach(function (bar, index) {
    //           const data = dataset.data[index];
    //           ctx.fillStyle = "#000";
    //           ctx.fillText(data, bar._model.x, bar._model.y - 2);
    //         });
    //       });
    //     }
    //   },
    //   tooltips: {
    //     enabled: true
    //   },
    //   responsive: true,
    //   scales: {
    //     yAxes: [
    //       {
    //         display: true,
    //         scaleLabel: {
    //           display: true,
    //           labelString: "Mistakes",
    //           fontColor: '#1BC5BD'
    //         },
    //         ticks: {
    //           beginAtZero: true,
    //           stepSize: 5,
    //         }
    //       },
    //     ],
    //     xAxes: [
    //       {
    //         scaleLabel: {
    //           display: true,
    //           labelString: 'Technologists',
    //           fontColor: '#1BC5BD'
    //         },
    //       },
    //     ],
    //   },
    // };


    this.barChartOptions = {
      legend: {
        display: true,
      },
      hover: {
        animationDuration: 0
      },
      animation: {
        onComplete: function () {
          const chartInstance = this.chart,
            ctx = chartInstance.ctx;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          this.data.datasets.forEach(function (dataset, i) {
            const meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              const data = dataset.data[index];
              ctx.fillStyle = "#000";
              ctx.fillText(data, bar._model.x, bar._model.y - 2);
            });
          });
        }
      },
      tooltips: {
        enabled: true
      },
      responsive: true,
      scales: {
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Mistakes",
              fontColor: '#f18ea3'
            },
            ticks: {
              beginAtZero: true,
              stepSize: 5,
            }
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Technologists',
              fontColor: '#f18ea3'
            },
          },
        ],
      },
    };

    this.barChartOptionsTC = {
      legend: {
        display: true,
      },
      hover: {
        animationDuration: 0
      },
      animation: {
        onComplete: function () {
          const chartInstance = this.chart,
            ctx = chartInstance.ctx;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          this.data.datasets.forEach(function (dataset, i) {
            const meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              const data = dataset.data[index];
              ctx.fillStyle = "#000";
              ctx.fillText(data, bar._model.x, bar._model.y - 2);
            });
          });
        }
      },
      tooltips: {
        enabled: true
      },
      responsive: true,
      scales: {
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Cases",
              fontColor: '#f18ea3'
            },
            ticks: {
              beginAtZero: true,
              stepSize: 5,
            }
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Technologists',
              fontColor: '#f18ea3'
            },
          },
        ],
      },
    };
  }

  getCheckedColor(rating: number): string {
    let color = '';
    if (rating <= 2) {
      color = '#dc3545';
    } else if (rating <= 3) {
      color = '#FFA800';
    } else {
      color = '#1BC5BD';
    }
    return color;
  }

  isCoppied = null;
  rowIndexCpy = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    const pin = text.PIN;
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




  isFieldDisabled = false;
  selectAllTPs(e) {
    this.risWorklist.forEach(a => {
      a.checked = false;
      if (a.TPId > 0) {
        a.checked = e.target.checked;
      }
    })
  }


  printAuditSummaryReport() {
    const formValues = this._form.getRawValue();
    const url = environment.patientReportsPortalUrl + 'tech-audit-summary-report?p=' + btoa(JSON.stringify({
      TechnologistID: this.screenIdentity == 'my-tech-audit-summary-report' ? this.loggedInUser.userid : formValues.TechnologistID,
      AuditorTechnologistID: formValues.AuditorTechnologistID,
      DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
      RatingCondition: formValues.RatingCondition ? formValues.RatingCondition : null,
      Rating: formValues.Rating ? formValues.Rating : null,
      AuditQAIDs: formValues.AuditQAIDs.length ? formValues.AuditQAIDs.join(",") : null,
      LocID: formValues.BranchID || null,
      isShared: (this.screenIdentity == 'my-tech-audit-summary-report' || this.screenIdentity == 'tech-audit-summary-report-mgr') ? 1 : null,
      isFined: formValues.isFined ? formValues.isFined : null,
      isTechRemarks: formValues.isTechRemarks ? formValues.isTechRemarks : null,
      DrChakboxParam: this.DrChakboxParam,
      isShowDoctorName: this.isShowDoctorName
    }));
    const winRef = window.open(url.toString(), '_blank');
  }
  printToExcel() {
    console.log(this.risWorklistForExport)
    const excelData = [];
    this.risWorklistForExport.forEach((dataItem, index) => {
      const row = {
        'Sr#': index + 1,
        'PIN Number': `'${dataItem.VisitID || 'NA'}`,
        'Patient Name': dataItem.PatientName || 'NA',
        // 'Section': dataItem.Section || 'NA',
        'Test': dataItem.TPCode + ": " + dataItem.TPName || 'NA',
        // 'Rating': dataItem.Rating + "/5",
        'Mistakes': dataItem.CommaSeparatedQATitlesCount + ":" + dataItem.CommaSeparatedQATitles,
        'Recommendation': dataItem.Recommendation,
        'Remarks': dataItem.Remarks || 'NA',
        'TechReplyRemarks': dataItem.TechRemarks || 'NA',
        'Tech Name': dataItem.TechnologistName || 'NA',
        'Branch': dataItem.Branch || 'NA',
        // 'RecommendedFine': dataItem.RecommendedFine || 'NA',
        // 'FeedBackBy': dataItem.FeedBackBy || 'NA',
        // 'FeedBackOn': dataItem.FeedBackOn || 'NA',
        'FeedBackRemarks': dataItem.FeedBackRemarks || 'NA',
        'FeedBackDetailRemarks': dataItem.FeedBackDetailRemarks || 'NA',
        'BranchManager/Supervisor Remarks': dataItem.ManagerRemarks || 'NA'
      };
      excelData.push(row);
    });
    this.excelService.exportAsExcelFile(excelData, 'Tech Audit Report', 'Tech-Audit-Report');
  }


  selectAllReports(e) {
    this.risWorklist.forEach(a => {
      a.checked = false;
      if (a.RadiologistVisitTPAuditID > 0 && !a.isShared) {
        a.checked = e.target.checked;
      }
    })
  }


  disabledButtonShare = false;
  isSpinnerShare = true;
  updateRadiologistVisitTPAuditShare() {
    const checkedItems = this.risWorklist.filter(a => a.checked);
    if (!checkedItems.length) {
      this.toastr.warning("Please select any report to share", "No Report Selected");
      return;
    } else {
      const objParam = {
        RadiologistVisitTPAuditIDs: checkedItems.map(obj => obj.RadiologistVisitTPAuditID).join(","),
        CreatedBy: this.loggedInUser.userid || -99,
      }
      this.disabledButtonShare = true;
      this.isSpinnerShare = false;
      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RADIOLOGIST_VISIT_TP_AUDIT_SHARE, objParam).subscribe((resp: any) => {
        this.disabledButtonShare = false;
        this.isSpinnerShare = true;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            this.getRISTechnologistAuditSummary();
            this.isSpinnerShare = true;
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButtonShare = false;
            this.isSpinnerShare = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonShare = false;
        this.isSpinnerShare = true;
      })
    }
  }
  getAuditQA() {
    this.qualityAssurance = [];
    this.sharedService.getData(API_ROUTES.GET_AUDIT_QA, {}).subscribe((resp: any) => {
      if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
        this.qualityAssurance = resp.PayLoad || [];
      } else {
        this.qualityAssurance = []
      }
    }, (err) => {
      console.log("Err", err)
    })
  }

  branchList: any = [];
  getBranches() {
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_BRANCHES, {}).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }


  // begin:: Chart Section 
  // Line Chart
  chartType = 2;
  // lineChartData: Chart.ChartDataSets[];
  // lineChartLabels: Label[];
  // lineChartOptions: Chart.ChartOptions = {
  //   responsive: true,
  //   scales: {
  //     xAxes: [{
  //       scaleLabel: {
  //         display: true,
  //         labelString: 'Technologists', // Set the label for the x-axis
  //       },
  //     }],
  //     yAxes: [{
  //       scaleLabel: {
  //         display: true,
  //         labelString: 'Mistakes', // Set the label for the y-axis
  //       },
  //       ticks: {
  //         beginAtZero: true,
  //       },
  //     }],
  //   },
  // };

  // lineChartColors: Color[] = [
  //   {
  //     borderColor: '#ff3972',
  //     backgroundColor: 'rgba(39, 187, 245, 0.8)',
  //   },
  // ];
  // lineChartLegend = true;
  // lineChartPlugins = [];
  // lineChartType = 'line';

  // Bar Chart
  barChartData: Chart.ChartDataSets[] = [
    { data: [45, 37, 60, 70, 46, 33], label: 'Best Fruits' },
  ];
  barChartLabels: Label[] = ['Apple', 'Banana', 'Kiwifruit', 'Blueberry', 'Orange', 'Grapes'];
  barChartOptions_: Chart.ChartOptions = {
    responsive: true,
  };
  barChartOptions: Chart.ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Technologists', // Set the label for the x-axis
        },
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Mistakes', // Set the label for the y-axis
        },
        ticks: {
          beginAtZero: true,
        },
      }],
    },
  };
  barChartLegend = true;
  barChartPlugins = [];
  barChartType = 'bar';

  barChartDataTC: Chart.ChartDataSets[] = [
    { data: [45, 37, 60, 70, 46, 33], label: 'Best Fruits' },
  ];
  barChartColorsTC: Color[] = [
    {
      borderColor: '#ff3972',
      backgroundColor: 'rgba(39, 187, 245, 0.8)',
    },
  ];
  barChartColors: Color[] = [
    {
      borderColor: '#ff3972',
      backgroundColor: '#F64E60',
    },
  ];
  barChartLabelsTC: Label[] = ['Apple', 'Banana', 'Kiwifruit', 'Blueberry', 'Orange', 'Grapes'];
  barChartOptionsTC_: Chart.ChartOptions = {
    responsive: true,
  };
  barChartOptionsTC: Chart.ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Technologists', // Set the label for the x-axis
        },
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Cases', // Set the label for the y-axis
        },
        ticks: {
          beginAtZero: true,
        },
      }],
    },
  };
  barChartLegendTC = true;
  barChartPluginsTC = [];
  barChartTypeTC = 'bar';

  // Pie Chart
  // pieChartData: number[] = [300, 500, 100];
  // pieChartLabels: Label[] = ['Download Sales', 'In-Store Sales', 'Mail Sales'];
  // pieChartOptions: Chart.ChartOptions = {
  //   responsive: true,
  // };
  // pieChartLegend = true;
  // pieChartPlugins = [];
  // pieChartType = 'pie';
  // end:: Chart Section 


  captureChartAsImage(chartType: string): Promise<string> {
    return new Promise((resolve) => {
      const chartContainer = document.createElement('div');
      document.body.appendChild(chartContainer);

      const chartCanvas = document.createElement('canvas');
      chartContainer.appendChild(chartCanvas);

      const chart = new Chart.Chart(chartCanvas, {
        type: chartType,
        data: {
          labels: this.barChartLabelsTC,
          datasets: [
            {
              label: 'Branch wise Tech Cases',
              data: this.chartValuesTC,
              borderColor: 'rgba(39, 187, 245, 0.8)',
              backgroundColor: 'rgba(39, 187, 245, 0.2)',
            },
          ],
        },
        options: {
          responsive: true,
        },
      });

      // Wait for the chart to render
      setTimeout(() => {
        const imageDataUrl = chartCanvas.toDataURL('image/png');

        // Cleanup
        chartContainer.remove();

        // Resolve the promise with the image data
        resolve(imageDataUrl);
      }, 500);
    });
  }

  exportChartAsPNG() {
    this.captureChartAsImage('line').then((imageData) => {
      // Create a link
      const downloadLink = document.createElement('a');
      downloadLink.href = imageData;
      downloadLink.download = 'chart.png';

      // Simulate a click on the link to trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  exportChart(chartType: string) {
    let canvas: HTMLCanvasElement;

    if (chartType === 'bar2') {
      canvas = document.getElementById('barChartCanvas2') as HTMLCanvasElement;
    } else if (chartType === 'bar') {
      canvas = document.getElementById('barChartCanvas') as HTMLCanvasElement;
    }

    if (canvas) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      const dataURL = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `chart_${chartType}.png`;
      link.click();
    } else {
      console.error(`Could not find canvas for chart type: ${chartType}`);
    }
  }


  PatientPhoneNumber: any = "";
  TPId = null;
  VisitID = null;
  VisitId = null;
  VisitIDWithDashes = null;
  PatientName = null;
  TPCode = null;
  TPName = null;
  PatientId = null;
  RISWorkListID = null;
  RISStatusID = null;
  StatusId = null;
  MOBy = null;
  ProcessIDParent = 1;
  TestStatus = null;
  RegistrationDate = null;
  DeliveryDate = null;
  isTechDisclaimer = false;
  isConsentRead = false;
  isMedicalOfficerIntervention = null;
  isTechHistoryRequred = null;
  WorkflowStatus = null;
  InitializedBy = null;
  InitializedOn = null;
  TechRemarks = null;
  RISWorklistRow = []
  getRISWorklistRow(visitID, TPID) {
    const params = {
      VisitID: this.VisitID,
      TPID: this.TPId
    }
    this.sharedService.getData(API_ROUTES.GET_RIS_WORKLIST_ROW_FOR_TECH_AUDIT, params).subscribe((resp: any) => {
      if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
        const respData = resp.PayLoad;
        this.RISWorklistRow = respData;
        const row = this.RISWorklistRow[0];
        // console.log("RISWorklistRow: ",this.RISWorklistRow)
        this.WorkflowStatus = row["Workflow Status"]
        this.TPId = row.TPId;
        this.VisitID = row.VisitNo.replaceAll("-", "");
        this.VisitIDWithDashes = row.VisitNo;
        this.TPCode = row.TPCode;
        this.TPName = row.TPName;
        this.PatientName = row.PatientName;
        this.PatientId = row.PatientId;
        this.RISStatusID = row.RISStatusID;
        this.PatientPhoneNumber = row.PhoneNumber;
        this.RISWorkListID = row.RISWorkListID;
        this.MOBy = row.MOBy;
        this.ProcessIDParent = row.ProcessId;
        this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
        this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
        this.isConsentRead = row.isConsentRead;
        this.TestStatus = row.TestStatus;
        this.StatusId = row.StatusId;
        this.InitializedBy = row.InitializedBy;
        this.InitializedOn = row.InitializedOn;
        this.TechnologistVisitTPAuditID = row.TechnologistVisitTPAuditID;
        this.InitBy = row.InitBy;
        this.AuditStatusID = row.AuditStatusID || null;
        this.TechRemarks = row.TechRemarks || null;
        this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
        this.getVitals();
        setTimeout(() => {
          this.appPopupService.openModal(this.techAuditModal, { backdrop: 'static', size: 'fss' });
        }, 200);
      }
    }, (err) => {
      console.log("Err", err)
    })
  }

  TechnologistVisitTPAuditID = null;
  InitBy = null;
  AuditStatusID = null;
  AuditStatusIDChk = null;

  // Feedback detail
  FeedBackBy = null;
  FeedBackOn = null;
  FBHLocCode = null;
  FeedBackRemarks = null;
  FeedBackDetailRemarks = [];
  FeedbackObj: any = {
    FeedBackBy: null,
    FeedBackOn: null,
    FBHLocCode: null,
    FeedBackRemarks: null,
    FeedBackDetailRemarks: null
  };
  orignaRisList: any = [];
  isCheckboxChecked = false;
  DrChakboxParam = false;
  filterDrFeedbackData(isChecked: boolean): void {
    if (isChecked) {
      this.DrChakboxParam = true;
      const filteredData = this.orignaRisList.filter(d => d.FeedBackBy);
      this.fitlterMyData(filteredData);
    } else {
      this.DrChakboxParam = false;
      this.fitlterMyData(this.orignaRisList)
    }
  }
  fitlterMyData(myData) {
    this.spinner.hide(this.spinnerRefs.listSection);
    if (myData.length) {
      this.risWorklistForExport = myData || []
      this.rowCount = myData.length || 0;
      // console.log("risworklist before formate: ", response);
      //////////////////////begin:: Reformat Array////////////////////
      const res = myData.reduce((re, o) => {
        const existObj = re.find(obj => obj.TechnologistID === o.TechnologistID);
        if (existObj) {
          existObj.techData.push({
            AuditStatusID: o.AuditStatusID,
            AuditorTechnologistID: o.AuditorTechnologistID,
            Branch: o.Branch,
            CommaSeparatedQATitles: o.CommaSeparatedQATitles,
            CommaSeparatedQATitlesCount: o.CommaSeparatedQATitlesCount,
            PIN: o.PIN,
            PatientID: o.PatientID,
            PatientName: o.PatientName,
            PhoneNumber: o.PhoneNumber,
            Rating: o.Rating,
            Recommendation: o.Recommendation,
            RecommendedFine: o.RecommendedFine,
            Remarks: o.Remarks,
            TechRemarks: o.TechRemarks,
            Section: o.Section,
            TPCode: o.TPCode,
            TPID: o.TPID,
            TPName: o.TPName,
            TechnologistID: o.TechnologistID,
            TechnologistName: o.TechnologistName,
            TechnologistVisitTPAuditID: o.TechnologistVisitTPAuditID,
            VisitID: o.VisitID,
            FeedBackBy: o.FeedBackBy,
            FeedBackOn: o.FeedBackOn,
            FeedBackRemarks: o.FeedBackRemarks,
            FeedBackDetailRemarks: o.FeedBackDetailRemarks ? o.FeedBackDetailRemarks.replace(/,$/, '').split(',') : null,
            FBHLocCode: o.FBHLocCode || null
          });
        } else {
          re.push({
            TechnologistID: o.TechnologistID,
            TechnologistName: o.TechnologistName,
            Branch: o.Branch,
            TotalAmt: 0, // Initialize total amount
            AverageRating: 0, // Initialize total amount
            techData: [{
              AuditStatusID: o.AuditStatusID,
              AuditorTechnologistID: o.AuditorTechnologistID,
              Branch: o.Branch,
              CommaSeparatedQATitles: o.CommaSeparatedQATitles,
              CommaSeparatedQATitlesCount: o.CommaSeparatedQATitlesCount,
              PIN: o.PIN,
              PatientID: o.PatientID,
              PatientName: o.PatientName,
              PhoneNumber: o.PhoneNumber,
              Rating: o.Rating,
              Recommendation: o.Recommendation,
              RecommendedFine: o.RecommendedFine,
              Remarks: o.Remarks,
              TechRemarks: o.TechRemarks,
              Section: o.Section,
              TPCode: o.TPCode,
              TPID: o.TPID,
              TPName: o.TPName,
              TechnologistID: o.TechnologistID,
              TechnologistName: o.TechnologistName,
              TechnologistVisitTPAuditID: o.TechnologistVisitTPAuditID,
              VisitID: o.VisitID,
              FeedBackBy: o.FeedBackBy,
              FeedBackOn: o.FeedBackOn,
              FeedBackRemarks: o.FeedBackRemarks,
              FeedBackDetailRemarks: o.FeedBackDetailRemarks ? o.FeedBackDetailRemarks.replace(/,$/, '').split(',') : null,
              FBHLocCode: o.FBHLocCode || null
            }]
          });
        }
        return re;
      }, []);

      // Calculate TotalAmt for each patient
      res.forEach(tech => {
        tech.TotalAmt = tech.techData.reduce((total, item) => total + item.RecommendedFine, 0);
        tech.AverageRating = tech.techData.reduce((total, item) => total + item.Rating, 0) / tech.techData.length;
        tech.TotalAmt = tech.TotalAmt.toLocaleString(); // Format total amount
      });

      this.risWorklist = res;
      // console.log("risworklist after formate: ", this.risWorklist);
      //////////////////////end:: Reformat Array//////////////////////

      /////////////Chart Data////////////////////////
      if (this.BranchID && !this.TechnologistID) { }
      this.renderChart()
      /////////////Chart Data////////////////////////
      this.roundedAverageRating = Math.round(
        this.risWorklist
          .filter(report => report.hasOwnProperty('Rating'))
          .reduce((accumulator, currentReport) => accumulator + currentReport.Rating, 0) /
        this.risWorklist.length * 2
      ) / 2;
      this.TotalRecommendedFine =
        this.risWorklist
          .filter(report => report.hasOwnProperty('RecommendedFine'))
          .reduce((accumulator, currentReport) => accumulator + currentReport.RecommendedFine, 0);
      this.TotalRecommendedFine = this.TotalRecommendedFine.toLocaleString();

      setTimeout(() => {
        this.starRatingElements.splice(0, this.starRatingElements.length);
        const _ratingElement = new ratingElement();
        _ratingElement.readonly = true;
        _ratingElement.checkedcolor = "red";
        _ratingElement.uncheckedcolor = "black";
        _ratingElement.value = this.roundedAverageRating || 0
        _ratingElement.size = 30;
        _ratingElement.totalstars = 5;
        this.starRatingElements.push(_ratingElement);
      }, 100);
    } else {
      this.noDataMessage = 'No record found...';
      this.risWorklist = []
    }
  }

  openTechAuditModal(row, index) {
    this.FeedbackObj = {
      FeedBackBy: row.FeedBackBy || null,
      FeedBackOn: row.FeedBackOn || null,
      FBHLocCode: row.FBHLocCode || null,
      FeedBackRemarks: row.FeedBackRemarks || null,
      FeedBackDetailRemarks: row.FeedBackDetailRemarks || null,
    }
    // this.rowIndex = index;
    this.AuditStatusIDChk = row.AuditStatusID;
    this.TPId = row.TPID
    this.VisitID = row.VisitID;
    this.getRISWorklistRow(this.VisitID, this.TPId);

  }
  vitalRefresh = 0;
  isVistalSaved(isSaved) {
    // console.log("isVistalSaved:emit_____", isSaved)
    this.vitalRefresh = 1;
    if (isSaved) {
      this.getVitals()
    }
  }
  isShowVitalsCard = false;
  visitInfo: any = {};
  getVitals() {
    if (this.visitInfo.visitID && this.visitInfo.tpId) {
      const params = {
        VisitID: this.VisitID,
        TPID: this.TPId
      }
      this.vitalsSrv.getVitals(params).subscribe((resp: any) => {
        if (resp.PayLoad.length) {
          this.isShowVitalsCard = true;
        } else {
          this.isShowVitalsCard = false;
        }
      }, (err) => { console.log("err", err) })
    }
  }

  RISTechInitSummary = []
  GetRISTechInitSummary() {
    const formValues = this._form.getRawValue();
    this.RISTechInitSummary = [];
    const valBranch = formValues.BranchID
    const valTechId = formValues.TechnologistID
    if (valBranch || valTechId) {
      const params = {
        DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
        DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
        LocID: formValues.BranchID || null,
        TechnologistID: formValues.TechnologistID || null,
      }
      this.sharedService.getData(API_ROUTES.GET_RIS_TECHNOLOGIST_INIT_SUMMARY, params).subscribe((resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.RISTechInitSummary = resp.PayLoad;
          setTimeout(() => {
            this.renderChart();
          }, 500);
        } else {
          this.RISTechInitSummary = [];
        }
      }, (err) => { console.log("err", err) })
    }
  }

  isStatusChangedRec(statusValue) {
    this.rowIndex = null;
    if (true)
      this.getRISTechnologistAuditSummary();
    this.rowIndex = null;
    this.getVitals();

  }

}
