// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { RisReportingService } from '../../../services/ris-reporting.service';

@Component({
  standalone: false,

  selector: 'app-mt-workload-report',
  templateUrl: './mt-workload-report.component.html',
  styleUrls: ['./mt-workload-report.component.scss']
})
export class MtWorkloadReportComponent implements OnInit {

   MTWorkloadList = [];
   patientTypeList = [];
   labDeptID = -1;
   subSectionList = []
   testList = []
 
   spinnerRefs = {
    Tablearea: 'Tablearea',
   }
 
   loggedInUser: UserModel;
 
   public Fields = {
     dateFrom: ['', Validators.required],
     dateTo: ['', Validators.required],
     locId: [null],
     EmployeeUserId: [null],
     SectionId: [null],
   };
   filterForm: FormGroup = this.formBuilder.group(this.Fields)
 
   isSubmitted = false;
   branchList = [];
   searchText = '';
   maxDate: any;
 
 
   constructor(
     private formBuilder: FormBuilder,
     private toasrt: ToastrService,
     private spinner: NgxSpinnerService,
     private auth: AuthService,
     private lookupService: LookupService,
     private excelService: ExcelService,
     private RisReport: RisReportingService,

   ) { }
 
   ngOnInit(): void {
 
     this.loadLoggedInUserInfo();
     this.getLocationList();
     this.getEmployeesForTestRegistration();
     this.getSubSection();
     setTimeout(() => {
       this.filterForm.patchValue({
         dateFrom: Conversions.getPreviousDateObject(),
         dateTo: Conversions.getCurrentDateObject(),
        //  locId: this.loggedInUser.locationid,
       });
       this.maxDate = Conversions.getCurrentDateObject();
     }, 800);
   }
 
   loadLoggedInUserInfo() {
     this.loggedInUser = this.auth.currentUserValue;
   }
 
   getRISMTWorkloadReport() {
     const formValues = this.filterForm.getRawValue();
      const dateFrom = formValues.dateFrom;
      const dateTo = formValues.dateTo;
      const fromDate: any = new Date(
        dateFrom.year,
        dateFrom.month - 1,
        dateFrom.day
      );
      const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
      if (toDate < fromDate) {
        this.toasrt.error("DateTo should be equal or greater than DateFrom");
        this.isSubmitted = false;
        return;
      }
      const maxDaysDifference = 31;
      const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

      if (daysDifference > maxDaysDifference) {
        const period = "1 month";
        this.toasrt.error(`The difference between dates should not exceed ${period}`);
        this.isSubmitted = false;
        return;
      }
      this.MTWorkloadList = [];
     if (this.filterForm.invalid) {
       this.toasrt.warning("Please Fill The Mandatory Fields");
       this.isSubmitted = true;
       return;
     }
     const objParams = {
       DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
       DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
       LocID: formValues.locId || -1,
       EmpoyeeUserId: formValues.EmployeeUserId || -1,
       SubSectionIDs: formValues.SectionId?.length ? formValues.SectionId.join(',') : this.subSectionList.map(a => a.SubSectionId).join(',')
     };
     this.spinner.show(this.spinnerRefs.Tablearea);
     this.RisReport.GetMTWorkloadReport(objParams).subscribe((res: any) => {
       this.spinner.hide(this.spinnerRefs.Tablearea);
      if (res.StatusCode === 200) {
        this.MTWorkloadList = res.PayLoad ? res.PayLoad : [];
      } else {
        this.toasrt.error('Something went wrong');
        this.MTWorkloadList = [];
      }
     }, (err) => {
       console.log(err);
       this.spinner.hide(this.spinnerRefs.Tablearea);
       this.toasrt.error('Connection error');
     })
   }

   employeesList:any[] = [];
  getEmployeesForTestRegistration() {
    const formValues = this.filterForm.getRawValue();
    this.employeesList = [];
     const objParam = {
      DepartmentId: 10,
      DesignationId: -1,
      locId: formValues.locId || -1,
    };
    this.lookupService.getEmployeeListByDepDesLocID(objParam).subscribe(
      (res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoadDS) {
        let data = res.PayLoadDS.Table;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        console.log(data);
        this.employeesList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
   getLocationList() {
     this.branchList = [];
     this.lookupService.GetBranches().subscribe((res: any) => {
       if (res && res.StatusCode === 200 && res.PayLoad) {
         let data = res.PayLoad;
         try {
           data = JSON.parse(data);
         } catch (ex) {
           console.log(ex);
         }
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
     }, (err) => {
       console.log(err);
     });
   }
 
   onSelectAllSections() {
     this.filterForm.patchValue({
       SectionId: this.subSectionList.map(a => a.SubSectionId)
     });
   }
   onUnselectAllSections() {
     this.filterForm.patchValue({
       SectionId: []
     });
   }
 
 


   // exportAsExcel() {
   //   const excelData = [];
   //   if (this.testCountList.length) {
   //     this.testCountList.forEach((d, index) => {
   //       const row = {
   //         'Sr#': index + 1,
   //         'Patient Name': d.PatientName,
   //         'Test Name': d.TPCode,
   //         'VisitDate': d.VisitDate,
   //         'TestStatus': d.TestStatus,
   //         'Delivery Date': d.DeliveryDate,
   //       };
   //       excelData.push(row);
   //     });
   //    this.excelService.exportAsExcelFile(excelData, 'DailySalesReport');  
   //   }
   //   else {
   //     this.toasrt.error('Cannot export empty table');
   //   }
   // }
 
   getSubSection() {
 
     this.subSectionList = [];
     const objParm = {
       SectionID: -1,
       LabDeptID: 2 // Radiology,
     };
     this.lookupService.GetSubSectionBySectionID(objParm).subscribe(
       (resp: any) => {
         const _response = resp.PayLoad;
         this.subSectionList = _response;
       },
       (err) => {
         console.log(err);
         this.toasrt.error("Connection error");
       }
     );
   }

}
