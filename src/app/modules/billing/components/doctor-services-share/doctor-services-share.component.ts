// @ts-nocheck
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { DoctorShareService } from 'src/app/modules/ris/services/doctor-share.service';
import { BillingService } from '../../services/billing.service';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { environment } from 'src/environments/environment';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';


@Component({
  standalone: false,

  selector: 'app-doctor-services-share',
  templateUrl: './doctor-services-share.component.html',
  styleUrls: ['./doctor-services-share.component.scss']
})
export class DoctorServicesShareComponent implements OnInit {


 spinnerRefs = {
    searchTable: "searchTable",
  };

  loggedInUser: UserModel;
  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    LocIds: [ ],
    EmpIds: [ ],
    subSectionIds: [ ]
  };
  labDeptID = -1;
  subSectionList = []



  isSubmitted = false;
  doctorlevelList = [];
  DoctorShareDetalList = [];
  DoctorShareMonthlyList = [];
  DoctorShareSummaryList
  testHeadList = [];
  ifDataPrint =  false;
  groupedData = [];
  grandTotalPrice = 0;
  grandTotalShareAmount = 0;
  radoiologistList = [];
  DoctorName = null
  isChecked = true;
  searchSlipForm: FormGroup = this.formBuilder.group(this.Fields)

  ifDetail = false;
  ifSummary = false;
  ifMonthly = false;

  searchTextShareSummary = ''

  reportType = null;
  radiologistLevel: any = []
  branchList: any = [];
  maxDate:any;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private doctorShare: DoctorShareService,
    private questionnaireSrv: QuestionnaireService,
    private Billing: BillingService,
    private sharedService: SharedService,
    private lookupService: LookupService,
    private excelService: ExcelService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getBranches();
    this.getRadiologistInfoDetail();
    this.getSubSection();

    setTimeout(() => {
      this.searchSlipForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      // this.searchSlipForm.get('doctorID').disable();
    }, 100);
    this.onMonthlyRadioChange(this.reportType);
    this.maxDate = Conversions.getCurrentDateObject();
  }

  onMonthlyRadioChange(reportTypeValue: string) {
    const isDisabled = reportTypeValue === '3';

    if (isDisabled) {
      this.searchSlipForm.get('BranchID')?.disable();
      this.searchSlipForm.get('EmpID')?.disable();
      this.searchSlipForm.get('subSectionID')?.disable();
    } else {
      this.searchSlipForm.get('BranchID')?.enable();
      this.searchSlipForm.get('EmpID')?.enable();
      this.searchSlipForm.get('subSectionID')?.enable();
    }
  
    this.reportType = reportTypeValue;
  
    if (this.reportType === '3') {
      this.searchSlipForm.patchValue({
        BranchID: null,
        EmpID: null,
        subSectionID: null
      });
  
      this.labDeptID = null; // Reset Section dropdown
    }
  }
  getBranches() {
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_BRANCHES, {}).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }


  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  searchDataList(){

    if (this.searchSlipForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    // if(!this.reportType){
    //   this.toastr.warning("Select Report Type");
    //   return;
    // }

    this.getRadioShareDetails();

    // this.ifSummary = false;
    // this.ifDetail = false;
    // this.ifMonthly = false;
    // this.ifDataPrint = false;
    // if(this.reportType == 1){
    //   this.ifSummary = true;
    //   this.getRadioShareSummary();
    // }
    // if(this.reportType == 2){
    //   this.ifDetail = true;
    //   this.getRadioShareDetails();
    // }
    // if(this.reportType == 3){
    //   this.ifMonthly = true;
    //   this.getRadioShareMonthly();
    // }
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    // Check for Ctrl+P or Cmd+P (MacOS)
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault(); // Prevent the default print dialog
      console.log('Print functionality is disabled.');
    }
  }

  getRadioShareSummary(){
    const formValues = this.searchSlipForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
     // Check if DateTo is earlier than DateFrom
     if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference =  30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period =  '1 month';
      this.toastr.error(`The difference between dates should not exceed ${period}`);
      this.isSubmitted = false;
      return;
    }
    this.DoctorShareSummaryList = []
    this.DoctorName = null
    const params = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      DocId: this.loggedInUser.userid,
    };
    console.log("🚀 ~ ReportsShareComponent ~ getRadioShareSummary ~ params:", params)
    this.Billing.getRadioDocShareSummary(params).subscribe((res: any) => {
      if (res.StatusCode === 200) {
        this.DoctorShareSummaryList = res.PayLoad;
         this.DoctorName = this.DoctorShareSummaryList[0].DocName
         this.ifDataPrint = true;
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  getRadioShareDetails(){
    const formValues = this.searchSlipForm.getRawValue();
    const dateFrom = formValues.dateFrom; 
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
     // Check if DateTo is earlier than DateFrom
     if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference =  30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period =  '1 month';
      this.toastr.error(`The difference between dates should not exceed ${period}`);
      this.isSubmitted = false;
      return;
    }
    this.DoctorShareDetalList = [];
    const params = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      RadiologistUserIDs: Array.isArray(formValues.EmpIds) && formValues.EmpIds.length > 0 ? formValues.EmpIds.join(",") : this.radoiologistList.map(a => a.UserId).join(","),
      LocIDs: Array.isArray(formValues.LocIds) && formValues.LocIds.length > 0 ? formValues.LocIds.join(",") : this.branchList.map(a => a.LocId).join(","),
      SectionIds: Array.isArray(formValues.subSectionIds) && formValues.subSectionIds.length > 0 ? formValues.subSectionIds.join(",") : this.subSectionList.map(a => a.SubSectionId).join(","),
      
    };
    this.spinner.show(this.spinnerRefs.searchTable);
    this.Billing.getRISDocShareDetailForAccounts(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable);
      if (res.StatusCode === 200) {
        this.DoctorShareDetalList = res.PayLoad;
        // this.groupDataByDoctorAndTest();
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.toastr.error('Connection error');
    })
  }

  getRadioShareMonthly(){
    const formValues = this.searchSlipForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
     // Check if DateTo is earlier than DateFrom
     if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference =  30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period =  '1 month';
      this.toastr.error(`The difference between dates should not exceed ${period}`);
      this.isSubmitted = false;
      return;
    }
    this.DoctorShareMonthlyList = [];
    const params = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
    };
    this.Billing.getRadioDocShareDetail(params).subscribe((res: any) => {
      if (res.StatusCode === 200) {
        this.DoctorShareMonthlyList = res.PayLoad;
        this.ifDataPrint = true;
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  getSubSection() {

    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID,
    }
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      this.subSectionList = resp.PayLoad;
    }, (err) => {
      console.log("error:", err)
      this.toastr.error('Connection error');
    })
  }
  

  getRadiologistInfoDetail() {
    this.radoiologistList = [];
    const params = {
      EmpID: null
    };
    this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe((res: any) => {
      if (res.StatusCode === 200) {
        this.radoiologistList = res.PayLoadDS['Table'] || [];
        this.radoiologistList = this.radoiologistList.map(item => ({
          ...item,
          displayLabel: `${item.EmpNoWithPrefix} - ${item.FullName}`
        }));
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  onChange(event: any) {
    console.log('Selected Report Type::', event)
    this.onMonthlyRadioChange(this.reportType);
    this.reportType = event
  }

  groupDataByDoctorAndTest() {
    const grouped = this.DoctorShareDetalList.reduce((acc, item) => {
      // Group by doctor name
      const doctor = acc.find(d => d.DocName === item.DocName);
      if (doctor) {
        // Group by test head
        const testHead = doctor.tests.find(t => t.TestHeadID === item.TestHeadID);
        if (testHead) {
          testHead.data.push(item);
        } else {
          doctor.tests.push({
            TestHeadID: item.TestHeadID,
            TestHeadName: item.TestHeadName,
            data: [item],
            totalPrice: 0,
            totalShareAmount: 0
          });
        }
      } else {
        acc.push({
          DocName: item.DocName,
          tests: [{
            TestHeadID: item.TestHeadID,
            TestHeadName: item.TestHeadName,
            data: [item],
            totalPrice: 0,
            totalShareAmount: 0
          }]
        });
      }
      return acc;
    }, []);
  
    // Initialize grand totals
    this.grandTotalPrice = 0;
    this.grandTotalShareAmount = 0;
  
    // Calculate totals for each section and accumulate grand totals
    grouped.forEach(doctor => {
      doctor.tests.forEach(test => {
        // Calculate totals for each test section
        test.totalPrice = test.data.reduce((sum, item) => sum + item.Price, 0);
        test.totalShareAmount = test.data.reduce((sum, item) => sum + item.ShareAmount, 0);
  
        // Accumulate totals for grand total
        this.grandTotalPrice += test.totalPrice;
        this.grandTotalShareAmount += test.totalShareAmount;
      });
    });
  
    this.groupedData = grouped;
  }

  calculateTotal(data: any): number {
    return (data.XR || 0) + (data.MRI || 0) + (data.OPG || 0) + (data.CTSCAN || 0) + 
           (data.UGS || 0) + (data.FLORO || 0) + (data.ECHO || 0) + (data.ETT || 0) +
           (data.ENDO || 0) + (data.PROC || 0) + (data.DOPPLER || 0);
}

// Function to calculate column total for a particular field (e.g. XR, MRI, etc.)
calculateColumnTotal(field: string): number {
    return this.DoctorShareSummaryList.reduce((total, current) => total + (current[field] || 0), 0);
}

// Function to calculate the grand total
calculateGrandTotal(): number {
    return this.DoctorShareSummaryList.reduce((grandTotal, current) => grandTotal + this.calculateTotal(current), 0);
}


printMyShareReport() {
  const formValues = this.searchSlipForm.getRawValue();
  if(this.reportType == 1){
    const url = environment.patientReportsPortalUrl + 'my-services-share?p=' + btoa(JSON.stringify({
      // DoctorShareSummaryList: this.DoctorShareSummaryList,
      reportType: this.reportType,
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      DocId: this.loggedInUser.userid,
    }));
    const winRef = window.open(url.toString(), '_blank');
  }
  if(this.reportType == 2){
    const url = environment.patientReportsPortalUrl + 'my-services-share?p=' + btoa(JSON.stringify({
      // DoctorShareDetalList: this.DoctorShareDetalList,
      reportType: this.reportType,
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      DocId: this.loggedInUser.userid,
      HeadId:formValues.testHeadID || -1,
      LocId: this.loggedInUser.locationid,
    }));
    const winRef = window.open(url.toString(), '_blank');
  }
 
}

 onSelectAllBranches() {
    this.searchSlipForm.patchValue({
      LocIds: this.branchList.map(a => a.LocId)
    });
  }
  onUnselectAllBranches() {
    this.searchSlipForm.patchValue({
      LocIds: []
    });
  }

   onSelectAllSections() {
    this.searchSlipForm.patchValue({
      subSectionIds: this.subSectionList.map(a => a.SubSectionId)
    });
  }
  onUnselectAllSections() {
    this.searchSlipForm.patchValue({
      subSectionIds: []
    });
  }
   onSelectAllRadiologist() {
    this.searchSlipForm.patchValue({
      EmpIds: this.radoiologistList.map(a => a.UserId)
    });
  }
  onUnselectAllRadiologist() {
    this.searchSlipForm.patchValue({
      EmpIds: []
    });
  }


    exportAsExcel() {
    const excelData = [];
    if (this.DoctorShareDetalList.length) {
   this.DoctorShareDetalList.forEach((d, index) => {
      const doctorFull = d.DoctorName || '';
      const firstSpaceIndex = doctorFull.indexOf(' ');

      const employeeNo = firstSpaceIndex > -1 ? doctorFull.substring(0, firstSpaceIndex)  : doctorFull;

      const doctorName = firstSpaceIndex > -1 ? doctorFull.substring(firstSpaceIndex + 1) : '';

      const row = {
        'Sr#': index + 1,
        'PIN': d.VisitID,
        'Patient Name': d.PatientName,
        'Test Name': d.Test,
        'Section': d.Section,
        'Location': d.LocationCode,
        'Employee No': employeeNo,
        'Doctor Name': doctorName,
        'Visit Date': d.Date,
        'Price': d.Price || 0,
        'Init Share': d['Reported By'] || 0,
        'DS Share': d['DS By'] || 0,
        'Total': d.TotalShare || 0,
      };

      excelData.push(row);
    });
     this.excelService.exportAsExcelFile(excelData, 'Doctor Share Report','DoctorShareReport');  
    }
    else {
      this.toastr.error('Cannot export empty table');
    }

  }
}
