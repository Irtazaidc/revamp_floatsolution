// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { SharedService } from "src/app/modules/shared/services/shared.service";

@Component({
  standalone: false,

  selector: "app-giz-sale-report",
  templateUrl: "./giz-sale-report.component.html",
  styleUrls: ["./giz-sale-report.component.scss"],
})
export class GizSaleReportComponent implements OnInit {
  GiZBillingDataList: any = [];
  ungroupedGizBillingData: any = [];
  totalAmounts: any = {};

  spinnerRefs = {
    ReportTable: "ReportTable",
  };

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    PanelAddOnServiceID: [ ],
  };

  isSubmitted = false;
  branchList = [];
  allKeys: string[] = [];
  searchText = "";
  searchKeys = ['PIN', 'MRN', 'RefNo', 'Name'];
  maxDate: any;

  filterForm: FormGroup = this.formBuilder.group(this.Fields);

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private sharedService: SharedService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getPanelAddOnService();
    // this.getLookupsForRegistration();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
        // locID: this.loggedInUser.locationid,
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getCashTallyData() {
    this.GiZBillingDataList = [];
    this.ungroupedGizBillingData = []
    this.totalAmounts = {};
    const formValues = this.filterForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(
      dateFrom.year,
      dateFrom.month - 1,
      dateFrom.day
    );
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toasrt.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = "1 month";
      this.toasrt.error(
        `The difference between dates should not exceed ${period}`
      );
      this.isSubmitted = false;
      return;
    }

    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      FromDate: Conversions.formatDateObject(formValues.dateFrom) || null,
      ToDate: Conversions.formatDateObject(formValues.dateTo) || null,
      PanelAddOnServiceIDs : Array.isArray(formValues.PanelAddOnServiceID) && formValues.PanelAddOnServiceID.length > 0
      ? formValues.PanelAddOnServiceID.join(",") : -1
      
    };

    this.spinner.show(this.spinnerRefs.ReportTable);
    this.sharedService
      .getData(API_ROUTES.GET_GIZ_BILL_SALES, objParams)
      .subscribe(
        (res: any) => {
          this.spinner.hide(this.spinnerRefs.ReportTable);
          if (res.StatusCode == 200) {
            if (res.PayLoad.length) {
              this.ungroupedGizBillingData = res.PayLoad;
              const { groupedData, displayedColumns  } = this.groupAndTransformData(res.PayLoad);
              this.GiZBillingDataList = groupedData;
              console.log("this.GiZBillingDataList:", this.GiZBillingDataList)
              this.allKeys = this.generateDynamicColumns(groupedData, displayedColumns );
              this.calculateTotals();
            } else {
              this.toasrt.info("No Record Found");
              this.GiZBillingDataList = [];
              this.allKeys = [];
            }
          } else {
            this.toasrt.error("Something went wrong");
          }
        },
        (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.ReportTable);
          this.toasrt.error("Connection error");
        }
      );
  }
  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.branchList = data || [];
          this.branchList = this.branchList.sort((a, b) => {
            if (a.Code > b.Code) {
              return 1;
            } else if (a.Code < b.Code) {
              return -1;
            } else {
              return 0;
            }
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  excelData = null

exportAsExcel() {
  if (!this.GiZBillingDataList.length) {
      this.toasrt.error("Cannot export empty table");
      return;
    }

    // Get the column order from allKeys (same as displayed in table)
    const columnOrder = ['Sr#', ...this.allKeys];
     this.excelData = []
    // Prepare main data rows
     this.ungroupedGizBillingData.map((row) => {
      // const row = {};
       this.excelData.push(row);
      // columnOrder.forEach(col => {
      //   if (col === 'Sr#') {
      //     row[col] = index + 1;
      //     return;
      //   }

      //   // Get the value (use 0 for empty amount columns)
      //   let value = this.isAmountColumn(col) 
      //             ? (item[col] || 0) 
      //             : (item[col] || '');

      //   // Format numbers with 2 decimal places
      //   if (this.isAmountColumn(col) && typeof value === 'number') {
      //     value = Number(value.toFixed(2));
      //   }

      //   row[col] = value;
      // });

      // return row;
    });

    // // Calculate and add totals row
    // const totalsRow = { 'Sr#': 'Total' };
    // const totals = this.calculateTotals();
    
    // columnOrder.forEach(col => {
    //   if (col === 'Sr#') return;
      
    //   if (this.isAmountColumn(col)) {
    //     totalsRow[col] = Number(totals[col]?.toFixed(2)) || 0;
    //   } else {
    //     // For non-amount columns, show empty or label
    //     totalsRow[col] = col === 'Name' ? 'Grand Total' : '';
    //   }
    // });

    // Add totals row to excel data
    // excelData.push(totalsRow);

    this.excelService.exportAsExcelFile(this.excelData, "GIZ_Billing_Report", "GIZ Billing Report");

  }

private isAmountColumnExport(columnName: string): boolean {
  const nonAmountColumns = [
    'Sr#', 'MRN', 'PIN', 'Name', 'RefNo', 
    'Invoice Number', 'VisitDate'
  ];
  return !nonAmountColumns.includes(columnName);
}

  onSearchChange(value: string) {
    // Strip hyphens or other special characters
    this.searchText = value.replace(/[^a-zA-Z0-9]/g, "");
  }


// Define these as class properties or constants
private tpIdDental = [1391, 2437, 2438, 2439, 2440, 2441, 2514, 2515, 2516, 2530];
private tpIdPhysiotherapy = [1447, 1448, 2073, 2074, 2075, 2076, 2077, 2078, 2080, 2081, 2082, 2083, 2084, 2085, 2086, 2500];
private tpIdConsultation = [513, 1408, 1429, 1472, 2413, 2414, 2415, 2416, 2417, 2418, 2419, 2420, 2421, 2422, 2423, 2424, 2425, 2426, 2427, 2442, 2503, 2573];
private tpIdAmbulance = [ 2512 ];

private groupAndTransformData(data: any[]): { groupedData: any[], displayedColumns: string[] } {
  const grouped = {};
  const panelServices = new Set<string>();

  // First pass: collect all AccNo values for each patient
  const patientAccNos = {};
  data.forEach(item => {
    if (item.AccNo != null) {
      patientAccNos[item.PatientId] = item.AccNo;
    }
    if (item.PanelAddOnService) {
      panelServices.add(item.PanelAddOnService);
    }
  });

  // Second pass: process data
  data.forEach(item => {
    const patientId = item.PatientId;
    if (!grouped[patientId]) {
      grouped[patientId] = {
        'MRN': item.RegNo,
        'PIN': patientAccNos[patientId] || item.AccNo || '',
        'Name': item.Name,
        'RefNo': item.RefNo || '',
        'Invoice Number': item.PatientBillNo,
        'VisitDate': item.VisitDate,
        // 'Consultation Visits': 0,
        'Consultations': 0,
        'Dental Treatment': 0,
        'Physiotherapy': 0,
        'Ambulance': 0,
        'IDCBills': 0,
        'ThirdParty Bills': 0,
        'Total': 0
      };

      // Initialize all panel service columns
      panelServices.forEach(service => {
        grouped[patientId][service] = 0;
      });
    }

    // Handle TPID-based categorization
    if (item.TPID) {
      if (this.tpIdConsultation.includes(item.TPID)) {
        // grouped[patientId]['Consultation Visits'] += 1;
        grouped[patientId]['Consultations'] += item.TestPrice;
      } 
      else if (this.tpIdDental.includes(item.TPID)) {
        grouped[patientId]['Dental Treatment'] += item.TestPrice;
      }
      else if (this.tpIdPhysiotherapy.includes(item.TPID)) {
        grouped[patientId]['Physiotherapy'] += item.TestPrice;
      }
      else if (this.tpIdAmbulance.includes(item.TPID)) {
        grouped[patientId]['Ambulance'] += item.TestPrice;
      }
    }

    // Add to appropriate bills category
    if (item.TestName) {
      grouped[patientId]['IDCBills'] += item.TestPrice;
      grouped[patientId]['Total'] += item.TestPrice;
    }

    // Handle PanelAddOnService entries
    if (item.PanelAddOnService) {
      grouped[patientId][item.PanelAddOnService] += item.NetAmount;
      grouped[patientId]['ThirdParty Bills'] += item.NetAmount;
      grouped[patientId]['Total'] += item.NetAmount;
    }
  });

  // Prepare displayed columns
  const displayedColumns = [
    'MRN', 'PIN', 'Name', 'RefNo', 'Invoice Number', 'VisitDate',
     'Consultations',
    'Dental Treatment', 'Physiotherapy', 'Ambulance',
    ...Array.from(panelServices),
    'IDCBills', 'ThirdParty Bills', 'Total'
  ];

  return {
    groupedData: Object.values(grouped),
    displayedColumns
  };
}

private generateDynamicColumns(groupedData: any[], displayedColumns: string[]): string[] {
  // We've already prepared the columns in groupAndTransformData
  return displayedColumns;
}


isAmountColumn(key: string): boolean {
  const amountColumns = [
    'Consultations', 
    'Dental Treatment', 
    'Physiotherapy',
    'Ambulance',
    'Medicines',
    'OPT Treatment',
    'Paeeds Vaccination',
    'IPD',
    'Proceedures and Injection',
    'Others',
    'IDCBills', 
    'ThirdParty Bills',
    'Total'
  ];
  
  // Also include all PanelAddOnService columns
  return amountColumns.includes(key) || key.startsWith('PanelAddOnService');
}

getColumnWidth(key: string): number {
  const columnWidths: Record<string, number> = {
    'MRN': 100,
    'PIN': 120,
    'Name': 200,
    'RefNo': 120,
    'invoice Number': 150,
    'VisitDate': 120,
    // 'Consultation Visits': 80,
    'Consultations': 100,
    'Dental Treatment': 100,
    'Physiotherapy': 100,
    'Ambulance': 100,
    'IDCBills': 100,
    'ThirdParty Bills': 120,
    'Total': 120
  };
  
  return columnWidths[key] || 150; // Default width
}


  panelAddOnServices = [];
  getPanelAddOnService() {
    this.sharedService.getData(API_ROUTES.GET_PANEL_ADDON_SERVICE, {}).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.panelAddOnServices = resp.PayLoad || [];
      }
    }, (err) => { console.log(err) })

  }

  onSelectAllServices(){
     this.filterForm.patchValue({
      PanelAddOnServiceID: this.panelAddOnServices.map(a => a.PanelAddOnServiceID)
    });
  }

  onUnselectAllServices(){
 this.filterForm.patchValue({
      PanelAddOnServiceID: []
    });
  }


  calculateTotals() {
    const totals: any = {};

    // Initialize all columns
    this.allKeys.forEach(key => {
      // For amount columns (including PanelAddOnServices), initialize to 0
      if (this.isAmountColumn(key)) {
        totals[key] = 0;
      }
      // For non-amount columns, initialize to empty string
      else {
        totals[key] = '';
      }
    });

    // Calculate sums for all amount columns
    this.GiZBillingDataList.forEach(item => {
      this.allKeys.forEach(key => {
        if (this.isAmountColumn(key) && item[key]) {
          // Convert to number and add to total
          const value = parseFloat(item[key]) || 0;
          totals[key] = (parseFloat(totals[key]) || 0) + value;
        }
      });
    });

    return totals;
  }
}
