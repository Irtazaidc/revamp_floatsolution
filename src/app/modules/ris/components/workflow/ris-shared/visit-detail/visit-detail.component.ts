// @ts-nocheck
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { AuthService, UserModel } from 'src/app/modules/auth';
import { PrintReportService } from 'src/app/modules/print-reports/services/print-report.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare let $: any;

@Component({
  standalone: false,

  selector: 'app-visit-detail',
  templateUrl: './visit-detail.component.html',
  styleUrls: ['./visit-detail.component.scss']
})
export class VisitDetailComponent implements OnInit, OnChanges {
  @Input() selVisit: any = {};
  @Input() selPIN: any;
  visitDetailsList: any = [];
  isDueBalance = false;
  DueBalanceAmount = 0;
  IsMasterDisable: boolean;
  masterSelected: boolean;
  isTPDetailScreen: boolean;
  checklist: any;
  SelectedTPs: any = [];
  checkedList: any = [];
  isDeliverButtonAllowed: boolean;
  deliverRptTitle: string;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  commaseparatedTPIds: any = "";
  searchInTestDetail: any = "";
  loggedInUser: UserModel;
  spinnerRefs = {
    visitDetailListSection: 'visitDetailListSection',
  }
  constructor(
    private toastr: ToastrService,
    private printRptService: PrintReportService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.GetVisitTestDetails();
    this.loadLoggedInUserInfo()
  }

  ngOnChanges(): void {
    // console.log("selVisit", this.selVisit);
    this.GetVisitTestDetails();
  }

  GetVisitTestDetails() {
    this.spinner.show(this.spinnerRefs.visitDetailListSection);
    const params = {
      AccountNo: this.selVisit,//visit.VisitId,
      branchID: 1,
      SampleRefNo: '',
      HospitalMRNo: '',
      ForAllProfileTests: 0
    };
    this.printRptService.getVisitDetails(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.visitDetailListSection);
      this.selVisit = '';//visit.VisitId
      this.IsMasterDisable = false;
      this.masterSelected = false;
      this.isTPDetailScreen = true;
      this.visitDetailsList = JSON.parse(resp.payLoad);

      this.visitDetailsList = this.visitDetailsList? this.visitDetailsList.Table.map(obj => ({ ...obj, isSelected: false, isDisabled: false })):[]
      // console.log("this.visitDetailsList: ",this.visitDetailsList)
      this.checklist = this.visitDetailsList;

      // this.visitDetailsList[0].permission_IsdueblnceIcon = true;
      if (this.visitDetailsList.length && this.visitDetailsList[0].permission_IsdueblnceIcon) {
        this.isDueBalance = true;
        this.DueBalanceAmount = 9000;//this.visitDetailsList[0].DueBalance; 

        this.visitDetailsList.forEach(element => {
          element.isDisabled = true
        });
      }
      else {
        this.visitDetailsList.forEach(element => {
          if ((element.permission_PRViewReportIcon && element.isReportable && !element.permission_IsTestCancelled && !element.permission_InPrgresIcon) || element.permission_ViewPreReportIcon) {
            element.isDisabled = false;
          }
          else {
            element.isDisabled = true
          }
        });
      }

      // if (this.commaseparatedTPIds == "") {
      //   this.disableViewTestRow = true;
      // }

      // this.getCheckedItemList();

    }, (err) => { console.log(err) })
  }

  openReportWindow() {
    const patientVisitInvoiceWinRef = window.open('', '_blank');
    // patientVisitInvoiceWinRef.opener = null;

    return patientVisitInvoiceWinRef;
  }
  addSessionExpiryForReport(reportUrl) {
    const reportSegments = reportUrl.split('?');
    if (reportSegments.length > 1) {
      reportUrl = reportSegments[0] + '?' + btoa(atob(reportSegments[1]) + '&SessionExpiryTime=' + (+new Date() + (CONSTANTS.REPORT_EXPIRY_TIME * 1000))); // &pdf=1
    }
    return reportUrl;
  }
  ViewReport(itemType, reportType = 'normal') {
    // console.log("Selected Visit", selctedVisit, selctedVisit.patientReportsPortal);
    let chemistryTestIds = '';
    let pakageTestIds = '';
    let grphicalTestIds = '';
    let radioTestIds = '';

    let chemistryTP: any = [];
    let grphicalTP: any = [];
    let radioTP: any = [];
    let pakageTP: any = [];

    if (!this.SelectedTPs.length) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    }
    else {

      console.log("SelectedTPs", this.SelectedTPs);
      // let _item = { ...this.SelectedTPs };


      pakageTP = this.SelectedTPs.length ? this.SelectedTPs.filter(a => { return a.isPackage == 3 }).map(a => { return a }) : '';
      pakageTestIds = pakageTP.length ? pakageTP.map(a => a.PROFILETESTID).join(',') : '';

      chemistryTP = this.SelectedTPs.length ? this.SelectedTPs.filter(a => { return a.SECTIONID == 1 && !a.permission_ViewGraphicalReportIcon && a.isPackage != 3 }).map(a => { return a }) : '';
      chemistryTestIds = chemistryTP.length ? chemistryTP.map(a => a.PROFILETESTID).join(',') : '';

      grphicalTP = this.SelectedTPs.length ? this.SelectedTPs.filter(a => { return a.SECTIONID == 1 && a.permission_ViewGraphicalReportIcon && a.isPackage != 3 }).map(a => { return a }) : '';
      grphicalTestIds = grphicalTP.length ? grphicalTP.map(a => a.PROFILETESTID).join(',') : '';

      radioTP = this.SelectedTPs.length ? this.SelectedTPs.filter(a => { return a.SECTIONID == 7 && a.isPackage != 3 }).map(a => { return a }) : '';
      radioTestIds = radioTP.length ? radioTP.map(a => a.PROFILETESTID).join(',') : '';

      if (pakageTestIds) {
        pakageTP = { ...pakageTP };
        //  i  = {...chemistryTP};
        pakageTP[0].PROFILETESTID = pakageTestIds;
        pakageTP[0].ReportType = "pkg";
        pakageTP[0].ItemType = itemType;
        pakageTP[0].AppName = 'medicubes';
        pakageTP[0].LoginName_MC = this.loggedInUser.username;


        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(pakageTP[0]).subscribe((res: any) => {
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }

      if (chemistryTestIds) {
        chemistryTP = { ...chemistryTP };
        //  i  = {...chemistryTP};
        chemistryTP[0].PROFILETESTID = chemistryTestIds;
        chemistryTP[0].ReportType = "tp";
        chemistryTP[0].ItemType = itemType;
        chemistryTP[0].AppName = 'medicubes';
        // chemistryTP[0].LoginName_MC = this.loggedInUser.username;


        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(chemistryTP[0]).subscribe((res: any) => {
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }

      if (radioTestIds) {
        radioTP = { ...radioTP };
        radioTP[0].PROFILETESTID = radioTestIds;
        radioTP[0].ReportType = "tp";
        radioTP[0].ItemType = itemType;
        radioTP[0].AppName = 'medicubes';
        radioTP[0].LoginName_MC = this.loggedInUser.username;
        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(radioTP[0]).subscribe((res: any) => {
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }

      if (grphicalTestIds) {
        grphicalTP = { ...grphicalTP };
        grphicalTP[0].PROFILETESTID = grphicalTestIds;
        grphicalTP[0].ReportType = "grf";
        grphicalTP[0].ItemType = itemType;
        grphicalTP[0].AppName = 'medicubes';
        grphicalTP[0].LoginName_MC = this.loggedInUser.username;
        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(grphicalTP[0]).subscribe((res: any) => {
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }
    }
  }

  getCheckedItemList() {
    this.SelectedTPs = [];
    this.checkedList = [];
    for (let i = 0; i < this.checklist.length; i++) {
      if (this.checklist[i].isSelected) {
        this.checkedList.push(this.checklist[i]);
      }
    }
    const decision = this.CheckIFCheckedItemsContainDeliverStatus();
    if (decision.length > 0) {
      this.isDeliverButtonAllowed = true;
      this.deliverRptTitle = "Some tests are not allowed to deliver";
      this.confirmationPopoverConfig.popoverTitle = "Some tests are not allowed to deliver";
    }
    else {
      this.isDeliverButtonAllowed = false;
      this.deliverRptTitle = "Deliver Reports";
      this.confirmationPopoverConfig.popoverTitle = "Deliver Reports";

    }
    console.log(decision);

    this.SelectedTPs = this.checkedList;
    this.commaseparatedTPIds = this.SelectedTPs; // this.visitDetailsList.filter(a=>a.SectionName == _item.SECTION);
    this.commaseparatedTPIds = this.commaseparatedTPIds.length ? this.commaseparatedTPIds.filter(a => (a.permission_PRViewReportIcon && a.isReportable && !a.permission_IsTestCancelled && !a.permission_InPrgresIcon) || a.permission_ViewPreReportIcon).map(a => a.PROFILETESTID).join(',') : '';
    // if (this.commaseparatedTPIds == "") {
    //   this.disableViewTestRow = true;
    // }
  }

  isAllSelected() {
    this.masterSelected = this.checklist.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }

  CheckIFCheckedItemsContainDeliverStatus() {
    const aa = this.checkedList.filter(a => {
      return a.permission_ViewDeliverReportIcon == false;
    })
    return aa;
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  openMoconsent(row) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(row.ACCOUNTNO), TPID: row.PROFILETESTID }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    const winRef = window.open(url.toString(), '_blank');
  }

 
  openMOHistory(row) {

  }
}
