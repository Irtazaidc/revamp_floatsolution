// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { TpDataService } from '../../services/tp-data.service';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';

@Component({
  standalone: false,

  selector: 'app-doctor-pres-config',
  templateUrl: './doctor-pres-config.component.html',
  styleUrls: ['./doctor-pres-config.component.scss']
})
export class DoctorPresConfigComponent implements OnInit {

  dotcorPrescriptionList

  @ViewChild('showDocuments') showDocuments;

  spinnerRefs = {
    doctorPresTable: 'doctorPresTable',
    doctorPres: 'doctorPres',

  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    radID: [''],
  };
  _object = Object;
  isSubmitted = false;
  branchList = [];

  searchText = '';
  maxDate: any;

  medicForm: FormGroup = this.formBuilder.group(this.Fields)

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private tpservice: TpDataService,
    private excelService: ExcelService,
    private questionnaireSrv: QuestionnaireService,
    private appPopupService: AppPopupService,
    private helper: HelperService,


  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.medicForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();

    this.getRadiologistInfoDetail()

  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  getDoctorPrescRpt() {
    const formValues = this.medicForm.getRawValue();

    if (this.medicForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      RefByListID: formValues.radID || null,
    }
    this.spinner.show(this.spinnerRefs.doctorPresTable);
    this.tpservice.GetDoctorPrescriptionByRefByID(objParams).subscribe((res: any) => {
      console.log("res:", res)
      this.spinner.hide(this.spinnerRefs.doctorPresTable);
      if (res.StatusCode == 200) {
        const dataSet = JSON.parse(res.PayLoadStr);
        this.dotcorPrescriptionList = dataSet['Table'] || [];
        console.log("🚀dotcorPrescriptionList:", this.dotcorPrescriptionList)
      }
      else {
        this.toasrt.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.doctorPresTable);
      this.toasrt.error('Connection error');
    })
  }

  dotcorPrescription
  OCRImg: any = null;
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  getDoctorPrescriptionImage() {
    if (!this.DocumentID) {
      this.toasrt.warning("Document ID isn't available");
      return;
    }
    const objParams = {
      DoctorPrescriptionID: this.DocumentID || null,
    }
    this.spinner.show(this.spinnerRefs.doctorPres);
    this.tpservice.GetDoctorPrescription(objParams).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.doctorPres);
      if (res.StatusCode == 200) {
        const dataSet = JSON.parse(res.PayLoadStr);
        this.dotcorPrescription = dataSet['Table'] || [];
        const resp = this.helper.formateImagesData(this.dotcorPrescription, 'PrescriptionImage');
        this.OCRImg = resp[0].PrescriptionImage;
        this.spinner.hide(this.spinnerRefs.doctorPresTable);
        this.showDocument();
      }
      else {
        this.toasrt.info('No Record Found');
        this.spinner.hide(this.spinnerRefs.doctorPresTable);
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.doctorPres);
      this.spinner.hide(this.spinnerRefs.doctorPresTable);
      this.toasrt.error('Connection error');
    })
  }

  radoiologistList

  getRadiologistInfoDetail() {
    const params = {
      EmpID: null
    };
    this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe((res: any) => {
      console.log("getRadiologistInfoDetail ~ res:", res)
      if (res.StatusCode == 200) {
        this.radoiologistList = res.PayLoadDS['Table'] || [];
      }
    }, (err) => {
      console.log(err);
      this.toasrt.error('Connection error');
    })
    this.spinner.hide();
  }

  DocumentID: number;
  viewDocPres(ID) {
    console.log("🚀viewDocPres ~ ID:", ID)
    this.DocumentID = ID;
    this.spinner.show(this.spinnerRefs.doctorPresTable);
    setTimeout(() => {
      this.getDoctorPrescriptionImage();
    }, 100);
  }

  showDocument() {

    setTimeout(() => {
      this.appPopupService.openModal(this.showDocuments, {
        backdrop: "static",
        size: "xl",
      });
    }, 200);
  }
}
