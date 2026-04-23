// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { DoctorService } from '../../services/doctor.service';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';

@Component({
  standalone: false,

  selector: 'app-b2b-share-report',
  templateUrl: './b2b-share-report.component.html',
  styleUrls: ['./b2b-share-report.component.scss']
})
export class B2bShareReportComponent implements OnInit {

  loggedInUser: UserModel;
  searchText = '';
  b2bDoctorsList = [];
  sumOfShareAmt= null
  formSubmitted = false;
  optionalColumnsVisibility = false;
  form = this.fb.group({
    B2BDoctorID: [0],
    DoctorShareStatusID: [1],
    DateFrom: ['', Validators.required],
    DateTo: ['', Validators.required],
    ReportType: [1]
  });
  defaultNoRecordRow = {headers: ['Message'], data: [{Message: 'No Record'}] };
  defaultLoadingRow ={headers: ['Message'], data: [{Message: 'Loading...'}] };
  defaultErrorRow = {headers: ['Message'], data: [{Message: 'Error loading data'}] };
  b2bDoctorShareReportData: any = {
    CoveringData: this.defaultNoRecordRow,
    Summary: this.defaultNoRecordRow,
    Detailed: this.defaultNoRecordRow,
  };

  reportType = [
    {id: 1, name: 'Detailed Report'},
    {id: 2, name: 'Summary Report (All B to B)'},
    {id: 3, name: 'Monthly Covering Letter'}
  ];

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

  uiDesign = 1;
  
  constructor(
    private doctorService: DoctorService,
    private lookupService: LookupService,
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private excelService: ExcelService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getB2BDoctors();
    setTimeout(() => {
      this.form.patchValue({
        DateFrom: {...Conversions.getCurrentDateObject(), ...{day: 1}},
        DateTo: Conversions.getCurrentDateObject()
      });
    }, 100);
    this.createHeadersFromData();

    // this.form.get('ReportType').valueChanges.subscribe(val => {
    //   this.spinner.show();
    // });
    // this.form.controls.ReportType.valueChanges
    //   .pipe(
    //     debounceTime(1000),
    //     distinctUntilChanged()
    //   )
    //   .subscribe((val) => {
    //     this.spinner.hide();
    //   });
    
  }

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.auth.getUserFromLocalStorage();
    this.loggedInUser = this.auth.currentUserValue;
    // this.form.patchValue({
    //   CreatedBy: this.loggedInUser.userid
    // });

  }

  getB2BDoctors(b2bDoctorID = 0) {
    this.b2bDoctorsList = [];
    const _params = {
      B2BDoctorID: b2bDoctorID
    };
    this.spinner.show();
    this.lookupService.getB2BDoctors(_params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.b2bDoctorsList = data || [];
      }
    }, (err) => {
      this.spinner.hide();
    });
  }

  getB2BDoctorShareReport() {
    this.b2bDoctorShareReportData = {
      CoveringData: this.defaultNoRecordRow,
      Summary: this.defaultLoadingRow,
      Detailed: this.defaultLoadingRow,
    };
    // this.createHeadersFromData();
    const _params = this.form.getRawValue();
    _params.DateFrom = _params.DateFrom ? Conversions.formatDateObjectToString(_params.DateFrom) : '';
    _params.DateTo = _params.DateTo ? Conversions.formatDateObjectToString(_params.DateTo, 'end') : '';
    if(!this.form.valid) {
      const invalidFieldNames = [];
      Object.keys(this.form.controls).forEach((a,i) => {
        if(this.form.controls[a].errors) {
             invalidFieldNames.push(a);
        }
      })
      this.toastr.warning('Please enter ' + invalidFieldNames.join(', '));
      return;
    }
    this.spinner.show();
    this.doctorService.getB2BDoctorShareReport(_params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.PayLoadDS || res.StatusCode == 200) {
        let data = res.PayLoadDS;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        if(!data.Table2 || data.Table2.length) {
          const perc = 25;
          data.Table2 = [
            {
              Name: 'LIS (Share '+perc+'%)',
              TestCount: data.Table1.filter(a => a.isLabTest).reduce( (a,b) => a+b.TotalTPCount, 0),
              TotalTestPrice: data.Table1.filter(a => a.isLabTest).reduce( (a,b) => a+b.LISShareAmt, 0),
              Payables: data.Table1.filter(a => a.isLabTest).reduce( (a,b) => a+b.LISShareAmt, 0) * perc / 100,
            },
            {
              Name: 'Radiology (Share '+perc+'%)',
              TestCount: data.Table1.filter(a => !a.isLabTest).reduce( (a,b) => a+b.TotalTPCount, 0),
              TotalTestPrice: data.Table1.filter(a => !a.isLabTest).reduce( (a,b) => a+b.RISShareAmt, 0),
              Payables: data.Table1.filter(a => !a.isLabTest).reduce( (a,b) => a+b.RISShareAmt, 0) * perc / 100
            }
            // TotalTPCount	LISShareAmt	RISShareAmt
          ]
        }
        const dataSets = ['Table', 'Table1', 'Table2']
        dataSets.forEach(a => {
          data[a] = (data && data[a] || []).map( a => {
            if(a.isLabTest === undefined) return a
            const o = {
              ...a,
              // Dept: (a.isLabTest ? 'Lab' : 'Imaging')
              isLabTest: (a.isLabTest ? 'Lab' : 'Imaging')
            }
            // delete o.isLabTest;
            return o;
          });
        })
        const covering = data && data.Table2 && data.Table2.length ? {headers: Object.keys(data.Table2[0]), data: data.Table2} : this.defaultNoRecordRow;
        const summary = data && data.Table1 && data.Table1.length ? {headers: Object.keys(data.Table1[0]), data: data.Table1} : this.defaultNoRecordRow;
        const detailed = data && data.Table && data.Table.length ? {headers: Object.keys(data.Table[0]), data: data.Table} : this.defaultNoRecordRow;
        console.log("🚀 this.doctorService.getB2BDoctorShareReport ~ detailed:", detailed)
        this.b2bDoctorShareReportData = {
          CoveringData: covering,
          Summary: summary,
          Detailed: detailed,
        };
        this.b2bDoctorShareReportData.Detailed.data.sort((a, b) => a.B2BDoctorID - b.B2BDoctorID);
        this.b2bDoctorShareReportData.Detailed.doctorWise = [];
        
        this.b2bDoctorShareReportData.Detailed.data.forEach(a => {
            if (this.b2bDoctorShareReportData.Detailed.doctorWise.find(doc => doc.b2bName === a.DoctorName)) {
                this.b2bDoctorShareReportData.Detailed.doctorWise.find(doc => doc.b2bName === a.DoctorName).data.push(a);
            } else {
                this.b2bDoctorShareReportData.Detailed.doctorWise.push({ b2bName: a.DoctorName, data: [a] });
            }
        });
        // Calculate the total RISShareAmt for each doctor
        this.b2bDoctorShareReportData.Detailed.doctorWise.forEach(doctor => {
            doctor.totalRISShareAmt = doctor.data.reduce((total, data) => {
                return total + parseFloat(data.TotalShare);
            }, 0);
        });        
        console.log(this.b2bDoctorShareReportData);
      } else {
        this.b2bDoctorShareReportData = {
          CoveringData: this.defaultNoRecordRow,
          Summary: this.defaultErrorRow,
          Detailed: this.defaultErrorRow,
        };
      } 
      // this.createHeadersFromData();
      console.log('Report ----> ', res);
    }, (err) => {
      this.b2bDoctorShareReportData = {
        CoveringData: this.defaultNoRecordRow,
        Summary: this.defaultErrorRow,
        Detailed: this.defaultErrorRow,
      };
      // this.createHeadersFromData();
      this.spinner.hide();
    });
  }
  doctorWiseList
  createHeadersFromData() {
    if(this.b2bDoctorShareReportData.Detailed.data.length)
      this.b2bDoctorShareReportData.Detailed.headers = Object.keys(this.b2bDoctorShareReportData.Detailed.data[0]);
    if(this.b2bDoctorShareReportData.Summary.data.length)
      this.b2bDoctorShareReportData.Summary.headers = Object.keys(this.b2bDoctorShareReportData.Summary.data[0]);
  }
  excelFile:any = []
  excelData:any = []
  Export(){
    this.excelFile = [];
    if (this.b2bDoctorShareReportData.Detailed.doctorWise) {
      const excelData = [];
  
      this.b2bDoctorShareReportData.Detailed.doctorWise.forEach((row, i) => {
        const excelRow = {
          'B2B Name': row.b2bName,
          'Total RIS Share Amt': row.totalRISShareAmt,
        };
        excelData.push(excelRow);
        row.data.forEach((dataItem, index) => {
          const excelSubRow = {
            'Sr#': index+1,
            // 'Doctor Name': dataItem.DoctorName,
            'Visit ID': dataItem.VisitID,
            'Patient Name': dataItem.PatientName,
            'LTC/Discount Card NO': dataItem.DisCardNo,
            'Visit Date': dataItem.VisitDate,
            'Visit/Profile Name': dataItem.TestName,
            'Department': dataItem.isLabTest,
            'Test Price Actual': dataItem.ActualPrice,
            'Test Price Panel': dataItem.TotalTPPrice,
            'Lab Share Value': dataItem.LISShareAmt,
            'Imaging Share Value': dataItem.RISShareAmt,
            'Total Share Amount': dataItem.TotalShare,
            // Add more properties as needed
          };
          excelData.push(excelSubRow);
        });
      });
      this.excelService.exportAsExcelFile(excelData, 'B2B Financial' ,'B2B Financial');
    }

  }
}
