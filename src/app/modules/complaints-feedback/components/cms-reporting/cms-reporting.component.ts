// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { FuelLogService } from 'src/app/modules/blocking/service/fuel-log.service';
import { DengueService } from 'src/app/modules/patient-booking/services/dengue.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { ComplaintDashboardService } from '../../services/complaint-dashboard.service';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';

@Component({
  standalone: false,

  selector: 'app-cms-reporting',
  templateUrl: './cms-reporting.component.html',
  styleUrls: ['./cms-reporting.component.scss']
})
export class CmsReportingComponent implements OnInit {

  
  branchList
  visibility = false;
  reportingDataList: any = [] 
  maxDate:any;
  loggedInUser: UserModel;
  isSubmitted = false;
  public Fields = {
    dateFrom: ['',Validators.required],
    dateTo: ['',Validators.required],
  };
  searchText = '';
  
  reportingFilterFrom: FormGroup = this.formBuilder.group(this.Fields)
  
  spinnerRefs = {
    reportingData: 'reportingData',
  }

  constructor(
    private formBuilder: FormBuilder,
    private dengueSrv: DengueService,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private fuelLog: FuelLogService,
    private complaintDashboard: ComplaintDashboardService,
    private excelService: ExcelService,
  ) { }

  ngOnInit(): void {

    setTimeout(() => {
      this.reportingFilterFrom.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.loadLoggedInUserInfo();
  this.maxDate = Conversions.getCurrentDateObject();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getCMSReportingData(){
    this.reportingDataList = []
    const formValues = this.reportingFilterFrom.getRawValue();

    if(this.reportingFilterFrom.invalid){
      this.toasrt.warning('Please Fill The Mandatory fields');
      return;
    } 
    
    const param = {
      dateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      dateTo: Conversions.formatDateObject(formValues.dateTo) || null, 
    }
    this.spinner.show(this.spinnerRefs.reportingData)
    this.complaintDashboard.getCMSReportingDetails(param).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.reportingData)
      console.log("reportingDataList ~ res:", res)
      if (res && res.StatusCode == 200 && res.PayLoadStr) {
        const data = res.PayLoadStr;
        this.reportingDataList = JSON.parse(data); 
        console.log("reportingDataList ~ this.reportingDataList:", this.reportingDataList)
      }
      else{
        this.toasrt.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.toasrt.error('Connection Error')
    });


  }

  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.branchList = data || [];
        this.branchList=this.branchList.sort((a, b) => {
          if (a.Code  > b.Code ) {
            return 1;
          } else if (a.Code  < b.Code ) {
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

  exportAsExcel() {  
      // this.reportingDataList.forEach(row => {  
      //   this.excel.push(row);  
      // });
      // this.excel = this.excel.map(aa => {
      //   let objD = aa;
      //   delete objD.ActionDetail;
      //   delete objD.AssignedToBranch;
      //   delete objD.ClosingRemarks1;
      //   delete objD.RequestPriority;
      //   delete objD.cmsstatusid;
      //   return objD;
      // })
      // console.log ("excel",this.excel);
      const excelData = [];
  this.reportingDataList.forEach((dataItem, index) => {
        const row = {
          'Sr#': index+1,
          'Request No': dataItem.CMSRequestNo || 'NA',
          'Patient Name': dataItem.PatientName || 'NA',
          'Patient CLI': dataItem.PatientCLI || 'NA',
          'Registered CellNo': dataItem.RegisteredCellNo || 'NA',
          'Visited Branch': dataItem.VisitedBranch || 'NA',
          'CreatedOn': dataItem.CreatedOn,
          'CreatedBy': dataItem.ComplaintCreatedBy || 'NA',
          'Source': dataItem.ReceivingMedium || 'NA',
          'Description': dataItem.ComplaintDescription || 'NA',
          'Responsible Employee': dataItem.ResponsibleEmployee || 'NA',
          'Category': dataItem.CMSCategory || 'NA',
          'SubCategory': dataItem.CMSSubCategory || 'NA',
          'Initial Remarks': dataItem.initialRemarks || 'NA',
          'Closing Remarks': dataItem.ClosingRemarks || 'NA',
          'Action Taken': dataItem.ActionDetail || 'NA',
          'ClosedBy': dataItem.ClosedBy || 'NA',
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(excelData, 'CMS Reporting' , 'cms-reporting');
   }

}
