// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TpDataService } from '../../services/tp-data.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-annual-med-rpt',
  templateUrl: './annual-med-rpt.component.html',
  styleUrls: ['./annual-med-rpt.component.scss']
})
export class AnnualMedRptComponent implements OnInit {


  annualMedicalList

  spinnerRefs = {
    annualmedTable: 'annualmedTable',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    panelId: ['', Validators.required],
    packageId: [''],
  };
  _object = Object;
  isSubmitted = false;
  branchList = [];

  searchText = '';
  maxDate: any;
  panelList: any = [];
  TestProfileList = [];
  medicForm: FormGroup = this.formBuilder.group(this.Fields)
  panelList1: any = [];
  TestProfileList1: any = [];


  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private tpservice: TpDataService,
    private excelService: ExcelService,
  ) { }

  ngOnInit(): void {

    this.getPanelList();

    this.getTestProfileList();

    setTimeout(() => {
      this.medicForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();

  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  getAnnualMedicalrpt() {
    const formValues = this.medicForm.getRawValue();

    if (this.medicForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      PanelID: formValues.panelId || null,
      PackageID: formValues.packageId || null,
    }
    this.spinner.show(this.spinnerRefs.annualmedTable);
    this.tpservice.getAnnualMedicalsByPanelID(objParams).subscribe((res: any) => {
      console.log("res:", res)
      this.spinner.hide(this.spinnerRefs.annualmedTable);
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.annualMedicalList = res.PayLoad
      }
      else {
        this.toasrt.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.annualmedTable);
      this.toasrt.error('Connection error');
    })
  }

  exportAsExcel() {
    const excelData = [];
    this.annualMedicalList.forEach(row => {
      excelData.push(row);
    });
    this.excelService.exportAsExcelFile(excelData,  'Annual Medical List','annualMedicalList');
  }
  getPanelList() {
    
    this.panelList = [];
    const _param = {}
    this.lookupService.getPanels(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.panelList = data || [];
        const aa = "1714, 379, 391, 532, 379";
        this.panelList.map(a => {
          // if (a.PanelId === 1714 || a.PanelId === 379 || a.PanelId === 391 || a.PanelId === 532) {
          if (a.PanelId === 1714 || a.PanelId === 532 || a.PanelId === 379 || a.PanelId === 403) {
            this.panelList1.push(a);
          }
        });
        // this.panelList1 = 
        console.log("this.panelList", this.panelList)

      }
    }, (err) => {
      console.log(err);
    });
  }

  getTestProfileList() {
    this.TestProfileList = [];
    this.TestProfileList1 = [];
    const formValues = this.medicForm.getRawValue();
    const _param = {
      PanelIDs: formValues.panelId || null, //"1714",
    };
    this.tpservice.getTestProfileByPanelID(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;

        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.TestProfileList = data || [];
        console.log("🚀this.TestProfileList:", this.TestProfileList);
        // GIZMED
        this.TestProfileList1 = [];
        this.TestProfileList.forEach(a => {
          if (a.TPCode === 'GIZMED' && formValues.panelId == '1714') {
            console.log("a", a);
            a.AssociatedTPIDs = "1708"
            this.TestProfileList1.push(a);
          }
          else if ((a.TPCode === 'MOLPRE') && formValues.panelId == '532') {
            a.AssociatedTPIDs = "1708"
            this.TestProfileList1.push(a);
          }
          else if ((a.TPCode === 'MOLANU39Y' || a.TPCode === 'MOLANU40Y') && formValues.panelId == '379') {
            this.TestProfileList1.push(a);
          }
          else if ( formValues.panelId == '403') {
            this.TestProfileList1.push(a);
          }
        });
        console.log("TestProfileList1", this.TestProfileList1)
      }
    }, (err) => {
      console.log(err);
    });
  }
}
