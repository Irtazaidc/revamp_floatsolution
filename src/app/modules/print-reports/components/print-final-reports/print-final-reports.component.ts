// @ts-nocheck
import { C } from "@angular/cdk/keycodes";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { CONSTANTS } from "src/app/modules/shared/helpers/constants";
import { environment } from "src/environments/environment";
import { PrintReportService } from "../../services/print-report.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute } from "@angular/router";

@Component({
  standalone: false,

  selector: "app-print-final-reports",
  templateUrl: "./print-final-reports.component.html",
  styleUrls: ["./print-final-reports.component.scss"],
})
export class PrintFinalReportsComponent implements OnInit {
  @ViewChild("inquiryRportModal") inquiryRportModal;
  modalPopupRef: NgbModalRef;
  VisitsList: any = [];
  VisitsDetailList: any = [];
  paginatedSearchResults: any = [];
  PatientInfo: any = [];
  masterSelected = false;
  collectionSize = 0;
  page = 1;
  pageSize = 5;
  checklist: any = [];
  SelectedTPs: any = [];
  checkedList: any = [];
  commaseparatedTPIds: any = [];
  disableViewTestRow = false;
  visitDetailsList: any = [];
  selVisit: any = "";
  searchInVisitList: any = "";
  isLetterHead: any = "";
  isHistoryReq: any = "";
  searchInTestDetail: any = "";
  isDueBalance = false;
  DueBalanceAmount: any = 0;
  IsMasterDisable = false;
  patientReportUrl: any = "";
  isScreen = 0;
  isTPDetailScreen = false;
  isChild = false;
  isDeliverButtonAllowed = false;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }
  deliverRptTitle = "Deliver Reports";
  SelRow: any;
  HighlightRow: any;
  spinnerRefs = {
    deliverReportsSpinnerRef: "deliverReportsSpinnerRef",
    visitSectionTable: "visitSectionTable",
    testSectionTable: "testSectionTable",
    inquiryListSection: "inquiryListSection",
  };
  loggedInUser: UserModel;
  invoiceCopyType = 1;
  constructor(
    private toastr: ToastrService,
    private printRptService: PrintReportService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private sharedService: SharedService,
    private appPopupService: AppPopupService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getPermissions();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  GetFilterdPatientVisit(event) {
    this.cd.detectChanges();
    this.spinner.show(this.spinnerRefs.visitSectionTable);
    this.isScreen = 1;
    console.log("visit ", event);
    this.VisitsList = [];
    this.visitDetailsList = [];
    this.paginatedSearchResults = [];
    this.isAllSmartReport = false;
    this.VisitsList = event;
    this.PatientInfo = event[0];
    this.masterSelected = false;
    this.isTPDetailScreen = false;
    // this.getCheckedItemList();
    this.page = 1;
    this.refreshPagination();
    if (event[0].Result == 0) {
      this.VisitsList = [];
      this.toastr.error("No Record Found");
    } else if (event.length) {
      this.GetVisitTestDetails(event[0], "");
    } else {
    }
    // this.selectVisit(event);
    // this.getVisitDetails(event.VisitID);
    this.spinner.hide(this.spinnerRefs.visitSectionTable);
  }

  DeliverReports() {
    console.log("this.seltps", this.SelectedTPs);
    if (!this.SelectedTPs.length) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    } else {
      const check = this.SelectedTPs.filter((a) => {
        return (
          a.STATUS == "Cancel Req." ||
          a.STATUS == "Cancelled" ||
          a.STATUS == "Registration" ||
          a.STATUS == "Phlebotomy" ||
          a.STATUS == "Pending Phlebotomy" ||
          a.STATUS == "Accession" ||
          a.STATUS == "Pending Accession" ||
          a.STATUS == "Analysis" ||
          a.STATUS == "Initialized" ||
          a.STATUS == "Reported" ||
          a.STATUS == "Pending Final" ||
          a.STATUS == "Reset Requested" ||
          a.STATUS == "Reset Recommended"
        );
      });
      if (check.length > 0) {
        this.toastr.error(
          "Some Selected Tests/Profiles Are Not Allowed To Be Deliver"
        );
      } else {
        const params = {
          VisitIdBig: this.SelectedTPs[0].ACCOUNTNO,
          TPIds: this.commaseparatedTPIds,
          StatusId: 12,
          UserId: this.loggedInUser.userid,
        };
        this.showSpinner(this.spinnerRefs.deliverReportsSpinnerRef);
        this.printRptService.UpdateReportStatus(params).subscribe(
          (resp: any) => {
            console.log(resp);
            this.hideSpinner(this.spinnerRefs.deliverReportsSpinnerRef);
            this.checklist.map((a) => (a.isSelected = false));
            this.toastr.success("Status changed to delivered");
            this.SelectedTPs = "";
            this.masterSelected = false;
            this.GetVisitTestDetails(this.SelRow, "");
          },
          (err) => {
            this.hideSpinner(this.spinnerRefs.deliverReportsSpinnerRef);
            console.log(err);
          }
        );
      }
    }
  }
  GetVisitTestDetails(visit, index) {
    console.log("visit, index", index, visit);
    this.selVisit = "";
    this.isDueBalance = false;
    this.DueBalanceAmount = 0;
    this.HighlightRow = index;
    this.PatientInfo.PatientId = visit.PatientId;
    this.SelRow = visit;
    this.rowIndex = null;
    console.log(visit);

    const params = {
      AccountNo: visit.EncVisitID,
      branchID: 1,
      SampleRefNo: "",
      HospitalMRNo: "",
      ForAllProfileTests: 0,
    };
    this.spinner.show(this.spinnerRefs.testSectionTable);
    this.printRptService.getVisitDetails(params).subscribe(
      (resp: any) => {
        this.spinner.hide(this.spinnerRefs.testSectionTable);
        this.selVisit = visit.VisitId;
        this.IsMasterDisable = false;
        this.masterSelected = false;
        this.isTPDetailScreen = true;
        console.log("Vist Detail", resp);
        console.log(resp);
        this.visitDetailsList = JSON.parse(resp.payLoad);
        this.visitDetailsList = this.visitDetailsList.Table.map((obj) => ({
          ...obj,
          isSelected: false,
          isDisabled: false,
        }));
        this.visitDetailsList = this.sortDataByParentChild(
          this.visitDetailsList
        );
        console.log("🚀visitDetailsList:_____", this.visitDetailsList)
        this.checklist = this.visitDetailsList;
        console.log("this.selVisit", this.selVisit);
        // this.visitDetailsList[0].permission_IsdueblnceIcon = true;
        if (this.visitDetailsList[0].permission_IsdueblnceIcon) {
          this.IsMasterDisable = true;
          this.cd.detectChanges();
          this.isDueBalance = true;

          this.DueBalanceAmount = this.visitDetailsList[0].DueBalance;

          this.visitDetailsList.forEach((element) => {
            element.isDisabled = true;
          });
        } else {
          this.visitDetailsList.forEach((element) => {
            if (
              (element.permission_PRViewReportIcon &&
                element.isReportable &&
                !element.permission_IsTestCancelled &&
                !element.permission_InPrgresIcon) ||
              element.permission_ViewPreReportIcon
            ) {
              element.isDisabled = false;
              this.IsMasterDisable = false;
            } else {
              this.IsMasterDisable = true;
              element.isDisabled = true;
            }
          });
        }

        // if (this.commaseparatedTPIds == "") {
        //   this.disableViewTestRow = true;
        // }

        this.getCheckedItemList();
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.testSectionTable);
      }
    );
  }

  // _ViewReport(itemType, reportType = 'normal') {
  //   // console.log("Selected Visit", selctedVisit, selctedVisit.patientReportsPortal);
  //   if (!this.SelectedTPs.length) {
  //     this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
  //   }
  //   else {
  //     let _item = { ...this.SelectedTPs };
  //     this.commaseparatedTPIds = this.SelectedTPs; // this.visitDetailsList.filter(a=>a.SectionName == _item.SECTION);
  //     this.commaseparatedTPIds = this.commaseparatedTPIds.length ? this.commaseparatedTPIds.filter(a => (a.permission_PRViewReportIcon && a.isReportable && !a.permission_IsTestCancelled && !a.permission_InPrgresIcon) || a.permission_ViewPreReportIcon).map(a => a.PROFILETESTID).join(',') : '';
  //     if (this.commaseparatedTPIds) {
  //       _item[0].PROFILETESTID = this.commaseparatedTPIds;
  //     }
  //     if (this.commaseparatedTPIds == "") {
  //       this.disableViewTestRow = true;
  //     }
  //     else {
  //       _item[0].ReportType = "tp";
  //       _item[0].ItemType = itemType;
  //       _item[0].AppName = 'medicubes';
  //       let patientReportWinRef: any = this.openReportWindow();
  //       this.printRptService.getPatientReportUrl(_item[0]).subscribe((res: any) => {
  //         try {
  //           res = JSON.parse(res);
  //         } catch (ex) {
  //         }
  //         if (res.success) {
  //           console.log(res.PatientReportUrl);
  //           patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
  //           // window.open(this.patientReportUrl)
  //         } else {
  //           alert("Report cannot be opened");
  //         }
  //       }, (err) => {
  //         alert("Error Opening Report");
  //       });
  //     }
  //     // window.open(selctedVisit.patientReportsPortal_Web)
  //   }
  // }
 
  // ViewReport(itemType, rptType) {
  //   console.log("Selected Visit", this.SelectedTPs);
  //   let chemistryTestIds = "";
  //   let pakageTestIds = "";
  //   let grphicalTestIds = "";
  //   let radioTestIds = "";

  //   let chemistryTP: any = [];
  //   let grphicalTP: any = [];
  //   let radioTP: any = [];
  //   let pakageTP: any = [];

  //   if (!this.SelectedTPs.length) {
  //     this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
  //   } else {
  //     console.log("SelectedTPs", this.SelectedTPs);

  //     pakageTP = this.SelectedTPs.length
  //       ? this.SelectedTPs.filter((a) => {
  //           return a.isPackage == 3;
  //         }).map((a) => {
  //           return a;
  //         })
  //       : "";
  //     pakageTestIds = pakageTP.length ? pakageTP.map((a) => a.PROFILETESTID).join(",") : "";
  //     if (rptType === "grf") {
  //       if(this.SelectedTPs.some(a => a.SECTIONID == 1 &&  a.LabStatusID == 8 
  //         && !a.permission_ViewGraphicalReportIcon && a.isPackage != 3)) {
  //         this.toastr.info("Graphical Report is not available for reported tests.");
  //       }
  //       // chemistryTP = this.SelectedTPs.length ? this.SelectedTPs.filter(a => { return a.SECTIONID == 1 && !a.permission_ViewGraphicalReportIcon && a.isPackage != 3 }).map(a => { return a }) : '';
  //       // chemistryTestIds = chemistryTP.length ? chemistryTP.map(a => a.PROFILETESTID).join(',') : '';
  //       grphicalTP = this.SelectedTPs.length ? this.SelectedTPs.filter((a) => {return (a.SECTIONID == 1 &&
  //               a.permission_ViewGraphicalReportIcon && a.isPackage != 3);}).map((a) => {return a; }): ""; 
  //       grphicalTestIds = grphicalTP.length ? grphicalTP.map((a) => a.PROFILETESTID).join(",") : "";
  //     } else if (rptType === "simple") {
  //       chemistryTP = this.SelectedTPs.length
  //         ? this.SelectedTPs.filter((a) => {
  //             return a.SECTIONID == 1 && a.isPackage != 3;
  //           }).map((a) => {
  //             return a;
  //           })
  //         : "";
  //       chemistryTestIds = chemistryTP.length
  //         ? chemistryTP.map((a) => a.PROFILETESTID).join(",")
  //         : "";
  //     }
  //     // grphicalTP = this.SelectedTPs.length ? this.SelectedTPs.filter(a => { return a.SECTIONID == 1 && a.permission_ViewGraphicalReportIcon && a.isPackage != 3 }).map(a => { return a }) : '';
  //     // grphicalTestIds = grphicalTP.length ? grphicalTP.map(a => a.PROFILETESTID).join(',') : '';

  //     // chemistryTP = this.SelectedTPs.length ? this.SelectedTPs.filter(a => { return a.SECTIONID == 1 && a.isPackage != 3 }).map(a => { return a }) : '';
  //     // chemistryTestIds = chemistryTP.length ? chemistryTP.map(a => a.PROFILETESTID).join(',') : '';

  //     radioTP = this.SelectedTPs.length
  //       ? this.SelectedTPs.filter((a) => {
  //           return a.SECTIONID == 7 && a.isPackage != 3;
  //         }).map((a) => {
  //           return a;
  //         })
  //       : "";
  //     radioTestIds = radioTP.length
  //       ? radioTP.map((a) => a.PROFILETESTID).join(",")
  //       : "";

  //     if (pakageTestIds) {
  //       pakageTP = { ...pakageTP };
  //       //  i  = {...chemistryTP};
  //       pakageTP[0].PROFILETESTID = pakageTestIds;
  //       pakageTP[0].ReportType = "pkg";
  //       pakageTP[0].ItemType = itemType;
  //       pakageTP[0].AppName = "medicubes";
  //       pakageTP[0].LoginName_MC = this.loggedInUser.username;
  //       if (this.isLetterHead) pakageTP[0].headerImage = 1;
  //       else pakageTP[0].headerImage = 0;

  //       let patientReportWinRef: any = this.openReportWindow();
  //       this.printRptService.getPatientReportUrl(pakageTP[0]).subscribe(
  //         (res: any) => {
  //           try {
  //             res = JSON.parse(res);
  //           } catch (ex) {}
  //           if (res.success) {
  //             console.log(res.PatientReportUrl);
  //             patientReportWinRef.location = this.addSessionExpiryForReport(
  //               res.PatientReportUrl
  //             );
  //             // window.open(this.patientReportUrl)
  //           } else {
  //             alert("Report cannot be opened");
  //           }
  //         },
  //         (err) => {
  //           alert("Error Opening Report");
  //         }
  //       );
  //     }

  //     if (chemistryTestIds) {
  //       chemistryTP = { ...chemistryTP };
  //       //  i  = {...chemistryTP};
  //       chemistryTP[0].PROFILETESTID = chemistryTestIds;
  //       chemistryTP[0].ReportType = "tp";
  //       chemistryTP[0].ItemType = itemType;
  //       chemistryTP[0].AppName = "medicubes";
  //       chemistryTP[0].LoginName_MC = this.loggedInUser.username;

  //       if (this.isLetterHead) chemistryTP[0].headerImage = 1;
  //       else chemistryTP[0].headerImage = 0;
  //       let patientReportWinRef: any = this.openReportWindow();
  //       this.printRptService.getPatientReportUrl(chemistryTP[0]).subscribe(
  //         (res: any) => {
  //           try {
  //             res = JSON.parse(res);
  //           } catch (ex) {}
  //           if (res.success) {
  //             console.log(res.PatientReportUrl);
  //             patientReportWinRef.location = this.addSessionExpiryForReport(
  //               res.PatientReportUrl
  //             );
  //             // window.open(this.patientReportUrl)
  //           } else {
  //             alert("Report cannot be opened");
  //           }
  //         },
  //         (err) => {
  //           alert("Error Opening Report");
  //         }
  //       );
  //     }

  //     if (radioTestIds) {
  //       radioTP = { ...radioTP };
  //       radioTP[0].PROFILETESTID = radioTestIds;
  //       radioTP[0].ReportType = "tp";
  //       radioTP[0].ItemType = itemType;
  //       radioTP[0].AppName = "medicubes";
  //       radioTP[0].LoginName_MC = this.loggedInUser.username;
  //       if (this.isLetterHead) radioTP[0].headerImage = 1;
  //       else radioTP[0].headerImage = 0;

  //       let patientReportWinRef: any = this.openReportWindow();
  //       this.printRptService.getPatientReportUrl(radioTP[0]).subscribe(
  //         (res: any) => {
  //           try {
  //             res = JSON.parse(res);
  //           } catch (ex) {}
  //           if (res.success) {
  //             console.log(res.PatientReportUrl);
  //             patientReportWinRef.location = this.addSessionExpiryForReport(
  //               res.PatientReportUrl
  //             );
  //             // window.open(this.patientReportUrl)
  //           } else {
  //             alert("Report cannot be opened");
  //           }
  //         },
  //         (err) => {
  //           alert("Error Opening Report");
  //         }
  //       );
  //     }

  //     if (grphicalTestIds) {
  //       grphicalTP = { ...grphicalTP };
  //       grphicalTP[0].PROFILETESTID = grphicalTestIds;
  //       grphicalTP[0].ReportType = "grf";
  //       grphicalTP[0].ItemType = itemType;
  //       grphicalTP[0].AppName = "medicubes";
  //       grphicalTP[0].LoginName_MC = this.loggedInUser.username;
  //       let patientReportWinRef: any = this.openReportWindow();

  //       if (this.isLetterHead) grphicalTP[0].headerImage = 1;
  //       else grphicalTP[0].headerImage = 0;

  //       this.printRptService.getPatientReportUrl(grphicalTP[0]).subscribe(
  //         (res: any) => {
  //           try {
  //             res = JSON.parse(res);
  //           } catch (ex) {}
  //           if (res.success) {
  //             console.log(res.PatientReportUrl);
  //             patientReportWinRef.location = this.addSessionExpiryForReport(
  //               res.PatientReportUrl
  //             );
  //             // window.open(this.patientReportUrl)
  //           } else {
  //             alert("Report cannot be opened");
  //           }
  //         },
  //         (err) => {
  //           alert("Error Opening Report");
  //         }
  //       );
  //     }
  //   }
  // }

  ViewReport(itemType, rptType) {
  console.log("Selected Visit", this.SelectedTPs);
  let chemistryTestIds = "";
  let pakageTestIds = "";
  let grphicalTestIds = "";
  let radioTestIds = "";

  let chemistryTP: any = [];
  let grphicalTP: any = [];
  let radioTP: any = [];
  let pakageTP: any = [];

  if (!this.SelectedTPs.length) {
    this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
  } else {
    console.log("SelectedTPs", this.SelectedTPs);

    pakageTP = this.SelectedTPs.length
      ? this.SelectedTPs.filter((a) => {
          return a.isPackage == 3;
        }).map((a) => {
          return a;
        })
      : "";

    pakageTestIds = pakageTP.length
      ? pakageTP.map((a) => a.PROFILETESTID).join(",")
      : "";

    if (rptType === "grf") {
      if (
        this.SelectedTPs.some(
          (a) =>
            a.SECTIONID == 1 &&
            a.LabStatusID == 8 &&
            !a.permission_ViewGraphicalReportIcon &&
            a.isPackage != 3
        )
      ) {
        this.toastr.info(
          "Graphical Report is not available for reported tests."
        );
      }

      grphicalTP = this.SelectedTPs.length
        ? this.SelectedTPs
            .filter((a) => {
              return (
                a.SECTIONID == 1 &&
                a.permission_ViewGraphicalReportIcon &&
                a.isPackage != 3
              );
            })
            .map((a) => {
              return a;
            })
        : "";

      grphicalTestIds = grphicalTP.length
        ? grphicalTP.map((a) => a.PROFILETESTID).join(",")
        : "";
    } else if (rptType === "simple") {
      chemistryTP = this.SelectedTPs.length
        ? this.SelectedTPs
            .filter((a) => {
              return a.SECTIONID == 1 && a.isPackage != 3;
            })
            .map((a) => {
              return a;
            })
        : "";

      chemistryTestIds = chemistryTP.length
        ? chemistryTP.map((a) => a.PROFILETESTID).join(",")
        : "";
    }

    radioTP = this.SelectedTPs.length
      ? this.SelectedTPs
          .filter((a) => {
            return a.SECTIONID == 7 && a.isPackage != 3;
          })
          .map((a) => {
            return a;
          })
      : "";

    radioTestIds = radioTP.length
      ? radioTP.map((a) => a.PROFILETESTID).join(",")
      : "";

    if (pakageTestIds) {
      pakageTP = { ...pakageTP };

      pakageTP[0].PROFILETESTID = pakageTestIds;
      pakageTP[0].ReportType = "pkg";
      pakageTP[0].ItemType = itemType;
      pakageTP[0].AppName = "medicubes";
      pakageTP[0].LoginName_MC = this.loggedInUser.username;

      pakageTP[0].isHistoryReq = this.isHistoryReq ? 1 : 0;

      if (this.isLetterHead) pakageTP[0].headerImage = 1;
      else pakageTP[0].headerImage = 0;

      const patientReportWinRef: any = this.openReportWindow();

      this.printRptService.getPatientReportUrl(pakageTP[0]).subscribe(
        (res: any) => {
          try {
            res = JSON.parse(res);
          } catch (ex) {}

          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location =
              this.addSessionExpiryForReport(res.PatientReportUrl);
          } else {
            alert("Report cannot be opened");
          }
        },
        (err) => {
          alert("Error Opening Report");
        }
      );
    }

    if (chemistryTestIds) {
      chemistryTP = { ...chemistryTP };

      chemistryTP[0].PROFILETESTID = chemistryTestIds;
      chemistryTP[0].ReportType = "tp";
      chemistryTP[0].ItemType = itemType;
      chemistryTP[0].AppName = "medicubes";
      chemistryTP[0].LoginName_MC = this.loggedInUser.username;

      chemistryTP[0].isHistoryReq = this.isHistoryReq ? 1 : 0;

      if (this.isLetterHead) chemistryTP[0].headerImage = 1;
      else chemistryTP[0].headerImage = 0;

      const patientReportWinRef: any = this.openReportWindow();

      this.printRptService.getPatientReportUrl(chemistryTP[0]).subscribe(
        (res: any) => {
          try {
            res = JSON.parse(res);
          } catch (ex) {}

          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location =
              this.addSessionExpiryForReport(res.PatientReportUrl);
          } else {
            alert("Report cannot be opened");
          }
        },
        (err) => {
          alert("Error Opening Report");
        }
      );
    }

    if (radioTestIds) {
      radioTP = { ...radioTP };

      radioTP[0].PROFILETESTID = radioTestIds;
      radioTP[0].ReportType = "tp";
      radioTP[0].ItemType = itemType;
      radioTP[0].AppName = "medicubes";
      radioTP[0].LoginName_MC = this.loggedInUser.username;

      radioTP[0].isHistoryReq = this.isHistoryReq ? 1 : 0;

      if (this.isLetterHead) radioTP[0].headerImage = 1;
      else radioTP[0].headerImage = 0;

      const patientReportWinRef: any = this.openReportWindow();

      this.printRptService.getPatientReportUrl(radioTP[0]).subscribe(
        (res: any) => {
          try {
            res = JSON.parse(res);
          } catch (ex) {}

          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location =
              this.addSessionExpiryForReport(res.PatientReportUrl);
          } else {
            alert("Report cannot be opened");
          }
        },
        (err) => {
          alert("Error Opening Report");
        }
      );
    }

    if (grphicalTestIds) {
      grphicalTP = { ...grphicalTP };

      grphicalTP[0].PROFILETESTID = grphicalTestIds;
      grphicalTP[0].ReportType = "grf";
      grphicalTP[0].ItemType = itemType;
      grphicalTP[0].AppName = "medicubes";
      grphicalTP[0].LoginName_MC = this.loggedInUser.username;

      grphicalTP[0].isHistoryReq = this.isHistoryReq ? 1 : 0;

      if (this.isLetterHead) grphicalTP[0].headerImage = 1;
      else grphicalTP[0].headerImage = 0;

      const patientReportWinRef: any = this.openReportWindow();

      this.printRptService.getPatientReportUrl(grphicalTP[0]).subscribe(
        (res: any) => {
          try {
            res = JSON.parse(res);
          } catch (ex) {}

          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location =
              this.addSessionExpiryForReport(res.PatientReportUrl);
          } else {
            alert("Report cannot be opened");
          }
        },
        (err) => {
          alert("Error Opening Report");
        }
      );
    }
  }
}

  viewInvoice() {
    const url =
      environment.patientReportsPortalUrl +
      "pat-reg-inv?p=" +
      btoa(
        JSON.stringify({
          visitID: this.selVisit,
          loginName: this.loggedInUser.username,
          appName: "WebMedicubes:search_pat",
          copyType: this.invoiceCopyType || 0,
          timeStemp: +new Date(),
        })
      );
    window.open(url.toString(), "_blank");
  }

  __ViewReport(itemType, reportType = "normal") {
    // console.log("Selected Visit", selctedVisit, selctedVisit.patientReportsPortal);

    if (!this.SelectedTPs.length) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    } else {
      this.SelectedTPs.forEach((element) => {
        console.log(element);
        const _item = { ...element };
        console.log("_item", _item);
        if (_item.permission_ViewGraphicalReportIcon) {
          _item.ReportType = "grf";
        } else {
          _item.ReportType = "tp";
        }
        _item.ItemType = itemType;
        _item.AppName = "medicubes";
        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(_item).subscribe(
          (res: any) => {
            try {
              res = JSON.parse(res);
            } catch (ex) {}
            if (res.success) {
              console.log(res.PatientReportUrl);
              patientReportWinRef.location = this.addSessionExpiryForReport(
                res.PatientReportUrl
              );
              // window.open(this.patientReportUrl)
            } else {
              alert("Report cannot be opened");
            }
          },
          (err) => {
            alert("Error Opening Report");
          }
        );
      });
    }
  }

  openReportWindow() {
    const patientVisitInvoiceWinRef = window.open("", "_blank");
    // patientVisitInvoiceWinRef.opener = null;

    return patientVisitInvoiceWinRef;
  }
  addSessionExpiryForReport(reportUrl) {
    const reportSegments = reportUrl.split("?");
    if (reportSegments.length > 1) {
      reportUrl =
        reportSegments[0] +
        "?" +
        btoa(
          atob(reportSegments[1]) +
            "&SessionExpiryTime=" +
            (+new Date() + CONSTANTS.REPORT_EXPIRY_TIME * 1000)
        ); // &pdf=1
    }
    return reportUrl;
  }
  addParametersInReportUrl(reportUrl, queryParams) {
    if (!queryParams) {
      return reportUrl;
    }
    const reportSegments = reportUrl.split("?");
    if (reportSegments.length > 1) {
      reportUrl =
        reportSegments[0] + "?" + btoa(atob(reportSegments[1]) + queryParams);
    }
    return reportUrl;
  }

  refreshPagination() {
    this.collectionSize = this.VisitsList.length;
    this.paginatedSearchResults = this.VisitsList.map((item, i) => ({
      id: i + 1,
      ...item,
    })).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize
    );
  }
  checkUncheckAll() {
    for (let i = 0; i < this.checklist.length; i++) {
      if (this.checklist[i].isDisabled === false) {
        this.checklist[i].isSelected = this.masterSelected;
      }
    }
    this.getCheckedItemList();
  }
  // Get List of Checked Items
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
      this.confirmationPopoverConfig.popoverTitle =
        "Some tests are not allowed to deliver";
    } else {
      this.isDeliverButtonAllowed = false;
      this.deliverRptTitle = "Deliver Reports";
      this.confirmationPopoverConfig.popoverTitle = "Deliver Reports";
    }
    console.log(decision);

    this.SelectedTPs = this.checkedList;
    this.commaseparatedTPIds = this.SelectedTPs; // this.visitDetailsList.filter(a=>a.SectionName == _item.SECTION);
    this.commaseparatedTPIds = this.commaseparatedTPIds.length
      ? this.commaseparatedTPIds
          .filter(
            (a) =>
              (a.permission_PRViewReportIcon &&
                a.isReportable &&
                !a.permission_IsTestCancelled &&
                !a.permission_InPrgresIcon) ||
              a.permission_ViewPreReportIcon
          )
          .map((a) => a.PROFILETESTID)
          .join(",")
      : "";

      this.isAllSmartReport = this.SelectedTPs.length > 0 ? this.SelectedTPs.every(tp => tp.isSmartReport == true): false;
      console.log("🚀 ~ this.isAllSmartReport:", this.isAllSmartReport)
    // if (this.commaseparatedTPIds == "") {
    //   this.disableViewTestRow = true;
    // }
  }
   
  isAllSmartReport = false;
  CheckIFCheckedItemsContainDeliverStatus() {
    const aa = this.checkedList.filter((a) => {
      return a.permission_ViewDeliverReportIcon == false;
    });
    return aa;
  }

  // Check All Checkbox Checked
  isAllSelected() {
    this.masterSelected = this.checklist.every(function (item: any) {
      return item.isSelected == true;
    });
    this.getCheckedItemList();
  }

  showSpinner(name = "") {
    if (name) {
      this.spinner.show(name);
    } else {
      this.spinner.show();
    }
  }
  hideSpinner(name = "") {
    if (name) {
      this.spinner.hide(name);
    } else {
      this.spinner.hide();
    }
  }

  rowIndex = null;
  onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowUp" && this.rowIndex > 0) {
      this.rowIndex--;
      event.preventDefault();
    }
    if (
      event.key === "ArrowDown" &&
      this.rowIndex < this.visitDetailsList.length - 1
    ) {
      this.rowIndex++;
      event.preventDefault();
    }
    if (event.key === " ") {
      const vd = this.visitDetailsList[this.rowIndex];
      if (vd.isDisabled === false) {
        vd.isSelected = !vd.isSelected;
        event.preventDefault();
      }
      this.getCheckedItemList();
    }
  }
  getRowIndex(index) {
    this.rowIndex = index;
  }

  inquiryVisitID = null;
  inquiryTPID = null;
  openInquiryPopoUp(visitID, TPID) {
    this.inquiryVisitID = visitID;
    this.inquiryTPID = TPID;
    setTimeout(() => {
      this.modalPopupRef = this.appPopupService.openModal(
        this.inquiryRportModal,
        { backdrop: "static", size: "lg" }
      );
    }, 200);
  }

  sortDataByParentChild(data: any[]): any[] {
    const parentChildMap = new Map<number, any[]>();
    const parentsMap = new Map<number, any>();
    const sortedData: any[] = [];
    const addedIds = new Set<number>();

    data.forEach((item) => {
      if (item.PackageId === -1) {
        parentsMap.set(item.PROFILETESTID, item);
      } else {
        if (!parentChildMap.has(item.PackageId)) {
          parentChildMap.set(item.PackageId, []);
        }
        parentChildMap.get(item.PackageId)?.push(item);
      }
    });

    parentsMap.forEach((parentItem, parentId) => {
      if (!addedIds.has(parentItem.PROFILETESTID)) {
        sortedData.push({...parentItem, isParent: true});
        addedIds.add(parentItem.PROFILETESTID);
      }

      const children = parentChildMap.get(parentId) || [];
      children.forEach((child) => {
        if (!addedIds.has(child.PROFILETESTID)) {
          sortedData.push(child);
          addedIds.add(child.PROFILETESTID);
        }
      });

      parentChildMap.delete(parentId);
    });

    data.forEach((item) => {
      if (!addedIds.has(item.PROFILETESTID)) {
        sortedData.push(item);
        addedIds.add(item.PROFILETESTID);
      }
    });
    return sortedData;
  }

  screenPermissionsObj
  SmartReportAccessPermission = false
  getPermissions() {
    const _activatedroute = this.route.routeConfig.path;
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    // console.log("User Screen Permsions___",this.screenPermissionsObj);
    this.SmartReportAccessPermission = this.screenPermissionsObj?.smart_report ? true : false;
  }

   ViewSmartReport(){
    console.log("Selected Visit", this.SelectedTPs);
    this.API_KEY ='';
    if (!this.SelectedTPs.length) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    }
    else {
      
      const ObjParam = {
        VisitID: this.SelectedTPs[0].ACCOUNTNO,
        TPIDs: this.SelectedTPs.map(a => a.PROFILETESTID).join(','),
        CreatedBy: this.loggedInUser.userid || -99,
      }
      console.log("ViewSmartReport ~ ObjParam:", ObjParam)
       this.spinner.show(this.spinnerRefs.testSectionTable);
      this.printRptService.getVisitDetailsForSmartReportData(ObjParam).subscribe((res: any) => {
        if(res.StatusCode == 200 && res?.PayLoadDS?.Table1 && res?.PayLoadDS?.Table1.length > 0){
        const data = res.PayLoadDS;
        const patientRow = data.Table[0];
        this.API_KEY = patientRow.APIKEY
          const payload = {
            // patient: {
            //   name: patientRow.name,
            //   age: patientRow.age,
            //   sex: patientRow.sex === 'M' ? 'Male' : 'Female',
            //   dob: patientRow.dob,
            //   // fasting: patientRow.fasting === 'Y', // adjust if needed
            //   requested_by: patientRow.requested_by,
            //   collected_date: patientRow.collected_date,
            //   lab_name: patientRow.lab_name,
            //   report_date: patientRow.report_date
            // },
            patient: data?.Table[0],
            values: data?.Table1
          };
          console.log("🚀 ~ payload:", payload)
          this.getSmartReport(payload);
        }
        else{
          this.spinner.hide(this.spinnerRefs.testSectionTable);
         this.toastr.info('Smart Report cannot be generated: required key values are missing.', 'Information');
        }
      }, (err) => {
         this.spinner.hide(this.spinnerRefs.testSectionTable);
        console.log(err);
        this.toastr.error('Connection error');
      })
    }
  }

API_KEY = ''
getSmartReport(data: any) {
  this.spinner.show(this.spinnerRefs.testSectionTable);
    console.log("🚀 ~ PrintFinalReportsComponent ~ getSmartReport ~ this.API_KEY:", this.API_KEY)

  this.printRptService.GetSmartReport(data, this.API_KEY).subscribe((res: Blob) => {
    this.spinner.hide(this.spinnerRefs.testSectionTable);
      const fileURL = URL.createObjectURL(
        new Blob([res], { type: 'application/pdf' })
      );
      window.open(fileURL, '_blank'); 
    },
    (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.testSectionTable);
      this.toastr.error('Connection error');
    }
  );
}

}
