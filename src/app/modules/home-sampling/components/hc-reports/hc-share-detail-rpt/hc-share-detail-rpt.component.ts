// @ts-nocheck
import { analyzeAndValidateNgModules } from "@angular/compiler";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { HcDashboardService } from "../../../services/hc-dashboard.service";
import { HcShareService } from "../../../services/hc-share.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

@Component({
  standalone: false,

  selector: "app-hc-share-detail-rpt",
  templateUrl: "./hc-share-detail-rpt.component.html",
  styleUrls: ["./hc-share-detail-rpt.component.scss"],
})
export class HcShareDetailRptComponent implements OnInit {
  excel = [];
  collectionSize: number = 0;
  collectionSizeSummaryDetail: number = 0;
  paginatedSearchResults: any = [];
  paginatedSearchSummaryResults: any = [];
  page: number = 1;
  pageSummary: number = 1;
  pageSize: number = 20;
  pageSummarySize: number = 20;
  public Fields = {
    dateFrom: ["", ""],
    dateTo: ["", ""],
    hcCity: ["", ""],
    rider: [null, ""],
    LocId: [null, ""],
  };
  HCShareRptForm: FormGroup = this.formBuilder.group(this.Fields);
  RidersDetailList: any = [];
  HomeCollectionCites: any = [];
  citesList: any = [];
  SampleCenters: any = [];
  ShareRptDetailList: any = [];
  ShareSum: any = 0;
  searchShareDatatilRpt: any = "";
  searchShareComplianceRpt: any = "";
  searchShareSummaryRpt: any = "";
  HCSummaryRpt: any = [];
  HCShareComplianceData: any = [];

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverMessage: "",
    confirmText: `<i class='fa fa-file-excel-o'></i> Excel`,
    cancelText: `<i class='fa fa-file-pdf-o'></i> PDF`,
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => this.exportAsPDF(),
  };

  constructor(
    private toastr: ToastrService,
    private appPopupService: AppPopupService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private shareService: HcShareService,
    private HCService: HcDashboardService,
    private lookupService: LookupService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.RidersDetail();
    this.HCCities();
    this.getHomeCollectionCentre();

    setTimeout(() => {
      this.HCShareRptForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 200);
  }

  RidersDetail() {
    let params = {
      RiderID: null,
    };
    this.HCService.GetRiders(params).subscribe(
      (resp: any) => {
        this.RidersDetailList = resp.PayLoad;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getHCShareDetail() {
    this.spinner.show();
    this.HCSummaryRpt = [];
    this.ShareRptDetailList = [];
    this.HCShareComplianceData = [];
    let formData = this.HCShareRptForm.getRawValue();
    let params = {
      DateFrom:
        formData.dateFrom.year +
        "-" +
        formData.dateFrom.month +
        "-" +
        formData.dateFrom.day,
      DateTo:
        formData.dateTo.year +
        "-" +
        formData.dateTo.month +
        "-" +
        formData.dateTo.day,
      RiderID: formData.rider,
      locIDs: formData.LocId ? String(formData.LocId) : null,
      TPID: null,
      HCCities: formData.hcCity ? String(formData.hcCity) : null,
    };
    if (!formData.dateFrom && !formData.dateTo) {
      this.spinner.hide();
      this.toastr.error("Please Select Date Range");
      return;
    }
    this.shareService.getHCShareDetailRpt(params).subscribe(
      (resp: any) => {
        this.spinner.hide();

        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.HCSummaryRpt = [];
          this.HCShareComplianceData = [];

          this.ShareRptDetailList = resp.PayLoad;

          // let ReqIDsArrayy = [...Array.from(new Set(this.ShareRptDetailList.map(a => a.HCRequestID)))];
          // let comparr = [];
          // for (let i = 0; i < ReqIDsArrayy.length; i++) {
          //   let currObject = {
          //     RquestID: ReqIDsArrayy[i],
          //     Share: (this.ShareRptDetailList.filter((item) => item.HCRequestID == ReqIDsArrayy[i]).map(a => { return a.ShareAmount })),
          //     ReuqestDetail: this.ShareRptDetailList.filter((item) => item.HCRequestID == ReqIDsArrayy[i])
          //   };
          //   comparr.push(currObject);
          // } console.log(comparr)

          // this.ShareRptDetailList = comparr;

          // This Below Commented Code Is For Comma Sepration
          this.ShareRptDetailList.map((a) => ({
            ...a,
            CommSepVisitID: "",
            CommaSepBookingIDs: "",
          }));

          let aa = this.ShareRptDetailList.map((a) => {
            if (a.VisitNo) {
              var str2 = a.VisitNo,
                letterForvisitID = "VisitID:",
                letterForBookingID = "BookingID:",
                indexesForVisitNo = [],
                indexesForBookingID = [];
              str2.split(" ").forEach(function (v, i) {
                if (v.toString() === letterForvisitID.toString())
                  indexesForVisitNo.push(i + 1);
              });
              str2.split(" ").forEach(function (v, i) {
                if (v.toString() === letterForBookingID.toString())
                  indexesForBookingID.push(i + 1);
              });
              let CommaSepVisitIds = "";
              CommaSepVisitIds = indexesForVisitNo
                .map((a) => {
                  return str2.split(" ")[a];
                  console.log(str2.split(" ")[a]);
                })
                .join(",");
              let CommaSepBookingIDs = "";
              CommaSepBookingIDs = indexesForBookingID
                .map((a) => {
                  return str2.split(" ")[a];
                  console.log(str2.split(" ")[a]);
                })
                .join(",");
              a.CommSepVisitID = CommaSepVisitIds;
              a.CommaSepBookingIDs = CommaSepBookingIDs;
            } else {
            }
          });
          // console.log("ShareRptDetailList", this.ShareRptDetailList);
          this.page = 1;
          this.refreshPagination();
          this.ShareSum = this.ShareRptDetailList.reduce((prev, next) => {
            return prev + next.ShareAmount;
          }, 0);
        } else if (!resp.PayLoad.length) {
          this.toastr.warning("No Record Found");
        }
      },
      (err) => {
        this.spinner.hide();
        console.log("err", err);
      }
    );
  }

  getHCSummary() {
    this.spinner.show();
    let formData = this.HCShareRptForm.getRawValue();
    this.HCSummaryRpt = [];
    this.ShareRptDetailList = [];
    this.HCShareComplianceData = [];
    if (!formData.dateFrom && !formData.dateTo) {
      this.spinner.hide();
      this.toastr.error("Please Select Date Range");
      return;
    } else {
      let params = {
        DateFrom: formData.dateFrom
          ? Conversions.formatDateObject(formData.dateFrom)
          : "",
        DateTo:
          formData.dateTo.year +
          "-" +
          formData.dateTo.month +
          "-" +
          formData.dateTo.day,
        RiderID: formData.rider,
        locIDs: formData.LocId ? String(formData.LocId) : null,
        TPID: null,
        HCCities: formData.hcCity ? String(formData.hcCity) : null,
      };
      this.shareService.getHCShareSummaryRpt(params).subscribe(
        (resp: any) => {
          this.spinner.hide();
          if (resp.StatusCode == 200 && resp.PayLoad.length) {
            this.ShareRptDetailList = [];
            this.HCShareComplianceData = [];
            this.HCSummaryRpt = resp.PayLoad;
            this.refreshHCSummaryPagination();
          } else if (!resp.PayLoad.length) {
            this.toastr.warning("No Record Found");
          }
        },
        (err) => {
          this.spinner.hide();
          console.log("err", err);
        }
      );
    }
  }

  getHCShareComplianceRpt() {
    this.spinner.show();
    let formData = this.HCShareRptForm.getRawValue();
    this.HCSummaryRpt = [];
    this.ShareRptDetailList = [];
    this.HCShareComplianceData = [];
    if (!formData.dateFrom && !formData.dateTo) {
      this.spinner.hide();
      this.toastr.error("Please Select Date Range");
      return;
    } else {
      let params = {
        DateFrom: formData.dateFrom
          ? Conversions.formatDateObject(formData.dateFrom)
          : "",
        DateTo:
          formData.dateTo.year +
          "-" +
          formData.dateTo.month +
          "-" +
          formData.dateTo.day,
        RiderID: formData.rider,
        locIDs: formData.LocId ? String(formData.LocId) : null,
        TPID: null,
        HCCities: formData.hcCity ? String(formData.hcCity) : null,
      };
      this.shareService.getHCShareComplianceRpt(params).subscribe(
        (resp: any) => {
          this.spinner.hide();
          if (resp.StatusCode == 200 && resp.PayLoad.length) {
            this.ShareRptDetailList = [];
            this.HCSummaryRpt = [];
            this.HCShareComplianceData = resp.PayLoad;

            // This Below Commented Code Is For Comma Sepration
            this.HCShareComplianceData.map((a) => ({
              ...a,
              CommSepVisitID: "",
              CommaSepBookingIDs: "",
            }));

            let aa = this.HCShareComplianceData.map((a) => {
              if (a.VisitNo) {
                var str2 = a.VisitNo,
                  letterForvisitID = "VisitID:",
                  letterForBookingID = "BookingID:",
                  indexesForVisitNo = [],
                  indexesForBookingID = [];
                str2.split(" ").forEach(function (v, i) {
                  if (v.toString() === letterForvisitID.toString())
                    indexesForVisitNo.push(i + 1);
                });
                str2.split(" ").forEach(function (v, i) {
                  if (v.toString() === letterForBookingID.toString())
                    indexesForBookingID.push(i + 1);
                });
                let CommaSepVisitIds = "";
                CommaSepVisitIds = indexesForVisitNo
                  .map((a) => {
                    return str2.split(" ")[a];
                    console.log(str2.split(" ")[a]);
                  })
                  .join(",");
                let CommaSepBookingIDs = "";
                CommaSepBookingIDs = indexesForBookingID
                  .map((a) => {
                    return str2.split(" ")[a];
                    console.log(str2.split(" ")[a]);
                  })
                  .join(",");
                a.CommSepVisitID = CommaSepVisitIds;
                a.CommaSepBookingIDs = CommaSepBookingIDs;
              } else {
              }
            });
          } else if (!resp.PayLoad.length) {
            this.toastr.warning("No Record Found");
          }
        },
        (err) => {
          this.spinner.hide();
          console.log("err", err);
        }
      );
    }
  }

  HCCities() {
    this.HCService.getHCCities().subscribe(
      (resp: any) => {
        this.HomeCollectionCites = resp.PayLoad;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getHomeCollectionCentre() {
    this.citesList = [];
    // let objParam = {
    //   // having no params for the time being
    // }
    this.lookupService.GetBranches().subscribe(
      (resp: any) => {
        this.SampleCenters = resp.PayLoad || [];
        if (!this.SampleCenters.length) {
          console.log("No Recored found");
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  refreshPagination() {
    this.collectionSize = this.ShareRptDetailList.length;
    this.paginatedSearchResults = this.ShareRptDetailList.map((item, i) => ({
      id: i + 1,
      ...item,
    })).slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize
    );
  }

  refreshHCSummaryPagination() {
    this.collectionSizeSummaryDetail = this.HCSummaryRpt.length;
    this.paginatedSearchSummaryResults = this.HCSummaryRpt.map((item, i) => ({
      id: i + 1,
      ...item,
    })).slice(
      (this.pageSummary - 1) * this.pageSummarySize,
      (this.pageSummary - 1) * this.pageSummarySize + this.pageSummarySize
    );
  }

  getActiveReportType(): 'detail' | 'summary' | 'compliance' | null {
  if (this.ShareRptDetailList?.length) return 'detail';
  if (this.HCSummaryRpt?.length) return 'summary';
  if (this.HCShareComplianceData?.length) return 'compliance';
  return null;
}

exportAsExcel() {
  const reportType = this.getActiveReportType();
  let excelData = [];
  let fileName = '';
  let sheetName = '';

  switch (reportType) {
    case 'detail':
      excelData = this.ShareRptDetailList.map(d => ({
        'PIN': d.CommSepVisitID,
        'Booking ID': d.CommaSepBookingIDs,
        'Request ID': d.HCRequestID,
        'Full Name': d.RiderFullName,
        'Share Amount': d.ShareAmount,
        'Share CreatedOn': d.ShareCreatedOn,
        'Test Name': d.TestName,
        'Visit Charges': d.VisitCharges,
      }));
      fileName = 'Detail-Report';
      sheetName = 'Detail Report';
      break;

    case 'summary':
      excelData = this.HCSummaryRpt.map(d => ({
        'Rider Name': d.RiderFullName,
        'Location': d.RiderLocation,
        'Visit Charges': d.VisitCharges,
        'HC Share': d.ShareAmount,
        'Other Allowances': d.OtherAllowance || '-',
        'Net Payable': (d.ShareAmount || 0) + (d.OtherAllowance || 0),
      }));
      fileName = 'Summary-Report';
      sheetName = 'Summary Report';
      break;

    case 'compliance':
      excelData = this.HCShareComplianceData.map((d, i) => ({
        '#': i + 1,
        'HC Staff': `${d.RiderEmpNo} ${d.RiderName}`,
        'Location': d.RiderLocation,
        'Request ID': d.HCRequestID,
        'Booking IDs': d.CommaSepBookingIDs,
        'Visit IDs': d.CommSepVisitID,
        'TPCodes': d.TestName,
      }));
      fileName = 'Compliance-Report';
      sheetName = 'Compliance Report';
      break;

    default:
      this.toastr.warning("No data to export");
      return;
  }

  this.excelService.exportAsExcelFile(excelData, sheetName, fileName);
}


  exportAsPDF() {
  const reportType = this.getActiveReportType();
  let headers = [];
  let rows = [];
  let reportTitle = '';

  switch (reportType) {
    case 'detail':
      headers = [["PIN", "Booking ID", "Request ID", "Full Name", "Share Amount", "Share CreatedOn", "Test Name", "Visit Charges"]];
      rows = this.ShareRptDetailList.map(d => [
        d.CommSepVisitID,
        d.CommaSepBookingIDs,
        d.HCRequestID,
        d.RiderFullName,
        d.ShareAmount,
        new Date(d.ShareCreatedOn).toLocaleString(),
        d.TestName,
        d.VisitCharges
      ]);
      reportTitle = "Detail Report";
      break;

    case 'summary':
      headers = [["Rider Name", "Location", "Visit Charges", "HC Share", "Other Allowances", "Net Payable"]];
      rows = this.HCSummaryRpt.map(d => [
        d.RiderFullName,
        d.RiderLocation,
        d.VisitCharges,
        d.ShareAmount,
        d.OtherAllowance || "-",
        (d.ShareAmount || 0) + (d.OtherAllowance || 0)
      ]);
      reportTitle = "Summary Report";
      break;

    case 'compliance':
      headers = [["#", "HC Staff", "Location", "Request ID", "Booking IDs", "Visit IDs", "TPCodes"]];
      rows = this.HCShareComplianceData.map((d, i) => [
        i + 1,
        `${d.RiderEmpNo} ${d.RiderName}`,
        d.RiderLocation,
        d.HCRequestID,
        d.CommaSepBookingIDs,
        d.CommSepVisitID,
        d.TestName
      ]);
      reportTitle = "Compliance Report";
      break;

    default:
      this.toastr.warning("No data to export");
      return;
  }

  const doc = new jsPDF("p", "pt");
  doc.setFontSize(16);
  doc.text(reportTitle, doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 60,
    theme: "striped",
  });

  doc.save(`${reportTitle.replace(/\s+/g, "-")}.pdf`);
}

}
