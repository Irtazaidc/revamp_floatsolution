// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { EclService } from '../../services/ecl.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Component({
  standalone: false,

  selector: 'app-outsource-pending-patients',
  templateUrl: './outsource-pending-patients.component.html',
  styleUrls: ['./outsource-pending-patients.component.scss']
})
export class OutsourcePendingPatientsComponent implements OnInit {
  @Input() selOutPat;
  WaitingPatientList: any = [];
  @Output() outHospitalPatSelectedEvent = new EventEmitter<any>();
  OutsourceHospitalPatientsList: any = [];
  searchInOuthospPatient: any = "";
  outPatTypes: any = [
    {
      Patienttype: "All"
    },
    {
      Patienttype: "ER"
    },
    {
      Patienttype: "OPD"
    },
    {
      Patienttype: "IPD"
    }
  ];
  public formFields = {
    dateFrom: ['', ''],
    dateTo: ['', ''],
    orgId: ['', ''],
    mobile: ['', ''],
  };
  outsourcePendingPatientsForm: FormGroup = this.fb.group(this.formFields);
  outsourceHospitals: any = [];
  // selectedHospitalDetail: any = { HospitalID: 1, HospitalName: "ECL" };
  FilOutsourceHospitalPatientsList: any = [];

  buttonControlsPermissions = {
    dateFrom: true,
    dateTo: true,
    mobile: false,
  }
  telenoreResp: any = [];
  telenoreRespCardDetail: any = [];
  telenoreRespCardOwnerDetail: any = [];
  telenoreRespFamilyDetail: any = [];
  showResult = false;
  telenorePatientPayLoad: any = [];
  telenoreRespStr: any = "";
  showPatienTypeDropdown = true;
  constructor(private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private ecl: EclService,
    private router: Router,
    private route: ActivatedRoute,
    private shared: SharedService
  ) { }

  ngOnInit(): void {
    // this.getOutsourceHospitalPat()    
    console.log("selOutPat", this.selOutPat);

    this.getOutsourceOrgs();

    this.reEvaluateButtonsPermissions();
    // this.getPatientsFormD();
    const formValues = this.outsourcePendingPatientsForm.getRawValue();
    if (formValues.orgId == 5) {
      this.showPatienTypeDropdown = false;
    }
  }

  reEvaluateButtonsPermissions() {
    this.buttonControlsPermissions.dateFrom = this.selOutPat.ParamPermissions.split(',').find(a => (a || '').toString().toLowerCase().trim() == 'datefrom') ? true : false;;
    this.buttonControlsPermissions.dateTo = this.selOutPat.ParamPermissions.split(',').find(a => (a || '').toString().toLowerCase().trim() == 'dateto') ? true : false;;
    this.buttonControlsPermissions.mobile = this.selOutPat.ParamPermissions.split(',').find(a => (a || '').toString().toLowerCase().trim() == 'mobile') ? true : false;;
    if (this.buttonControlsPermissions.dateFrom && this.buttonControlsPermissions.dateTo) {
      this.setDefualtDates();
    }
    this.selectedHospital()
  }
  selectedHospital() {
    this.outsourcePendingPatientsForm.patchValue({
      orgId: this.selOutPat.HospitalID,
    });
  }

  setDefualtDates() {
    const today = Date();
    const fDate = { day: moment(today).get('date') - 2, month: (moment(today).get('month') + 1), year: moment(today).get('year') };
    const tDate = { day: moment(today).get('date'), month: (moment(today).get('month') + 1), year: moment(today).get('year') };
    this.outsourcePendingPatientsForm.patchValue({
      dateFrom: fDate,
      dateTo: tDate
    });
    // this.HCForm.updateValueAndValidity();
    // this.HCForm.setValue["dateFrom"] = moment(Date());
    // this.HCForm.setValue["dateTo"] =  moment(Date());
  }
  OutOrgChangeEvent() {
    const formValues = this.outsourcePendingPatientsForm.getRawValue()
    this.selOutPat = this.outsourceHospitals.find(a => { return a.HospitalID == formValues.orgId });
    this.reEvaluateButtonsPermissions();
    if (formValues.orgId == 5) {
      this.showPatienTypeDropdown = false;
    }
  }
  getOutsourceHospitalPat() {
    this.spinner.show();
    this.ecl.geteclPendingPatients().subscribe((resp: any) => {
      console.log("resp", resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoadStr) {
        const parsedData = JSON.parse(resp.PayLoadStr) || '';
        this.WaitingPatientList = parsedData.Orders;
        console.log("resp", this.WaitingPatientList);
        // this.InsertUpdPatients();
        this.getPatientsFormD();
      }
    }, (err) => {
      this.spinner.hide();
      console.log("err", err)
    });
  }
  getPatientsFormD() {
    const formValues = this.outsourcePendingPatientsForm.getRawValue();
    const params = {
      "HospitalID": formValues.hospitalId || 1, //ECL Hospital ID
      "dateFrom": formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      "dateTo": formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
    }
    this.spinner.show();
    this.ecl.getOutsourcePendingPatientsByHospitalID(params).subscribe((resp: any) => {
      console.log(resp.PayLoad);
      this.spinner.hide();
      if (resp.StatusCode == 200 && resp.PayLoad && resp.PayLoad.length) {
        this.OutsourceHospitalPatientsList = resp.PayLoad;
        this.FilOutsourceHospitalPatientsList = this.OutsourceHospitalPatientsList;
      }
      else if (resp.StatusCode != 200 && !resp.PayLoad && !resp.PayLoad.length) {
        this.OutsourceHospitalPatientsList = [];
        this.FilOutsourceHospitalPatientsList = [];
      }
      else {
        this.toastr.error("Something went wrong please check your internet connection");
      }
    }, (err) => { this.spinner.hide(); console.log(err, "errr") })
  }
  getOutsourcePatient() {

    this.showResult = false;
    this.OutsourceHospitalPatientsList = [];
    this.FilOutsourceHospitalPatientsList = [];
    this.spinner.show();
    const formValues = this.outsourcePendingPatientsForm.getRawValue();
    // if (formValues.orgId == 5 || formValues.orgId == 4 || formValues.orgId == 6 || formValues.orgId == 7 || formValues.orgId == 9) {
    //   this.getPatientInfoByHospitalID(formValues);
    //   return;
    // }
    this.spinner.show();
    if (formValues.orgId == 1 || formValues.orgId == 2 ) {


      const params = {
        "OrgID": formValues.orgId, //ECL Hospital ID
        "MobileNo": formValues.mobile,
        "HospitalID": formValues.orgId,
        "OrgPostApiUrl": this.selOutPat.OrgPostApiUrl,
        "OrgGetApiUrl": this.selOutPat.OrgGetApiUrl,
        "DateFrom": formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
        "DateTo": formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
      }
      this.ecl.getOutsourcePendingPatientsByOrgID(params).subscribe((resp: any) => {
        console.log(resp.PayLoad);
        this.spinner.hide();
        if (resp && resp.StatusCode == 200 && (resp.PayLoad || resp.PayLoadStr)) {
          this.showResult = true;
          if (resp.PayLoad && formValues.orgId == 1) {
            this.OutsourceHospitalPatientsList = resp.PayLoad;
            this.FilOutsourceHospitalPatientsList = this.OutsourceHospitalPatientsList;
          }
          else if (resp.PayLoadStr && formValues.orgId == 2) {
            this.telenoreRespStr = resp.PayLoadStr;
            this.telenoreResp = JSON.parse(resp.PayLoadStr || '[]');
            this.telenoreRespCardOwnerDetail = this.telenoreResp.GetCustomerdetailsResult.LabCustomerdetails;
            this.telenoreRespFamilyDetail = this.telenoreResp.GetCustomerdetailsResult.FamilyMember;
            if (this.telenoreResp.GetCustomerdetailsResult.ResponseCode == '0000') {
              console.log(this.telenoreRespCardOwnerDetail, this.telenoreRespFamilyDetail);
            }
            this.telenorePatientPayLoad = this.telenoreResp
          }
          else if (resp && resp.StatusCode != 200 && !resp.PayLoad) {
            this.OutsourceHospitalPatientsList = [];
            this.FilOutsourceHospitalPatientsList = [];
          }
          else {

          }
        } else {

        }

      }, (err) => { this.spinner.hide(); console.log(err, "errr") });
    }
    else {
      this.getPatientInfoByHospitalID(formValues);
    }
  }
  getPatientInfoByHospitalID(formValues) {
    this.spinner.show();
    const params = {
      "OrgID": formValues.orgId, //ECL Hospital ID
      "MobileNo": formValues.mobile,
      "HospitalID": formValues.orgId,
      "OrgPostApiUrl": this.selOutPat.OrgPostApiUrl,
      "OrgGetApiUrl": this.selOutPat.OrgGetApiUrl,
      "DateFrom": formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      "DateTo": formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
    }

    this.shared.getData(API_ROUTES.GET_HOSPITAL_PATIENT_BY_HOSPITALID, params).subscribe((resp: any) => {
      this.showResult = true;
      this.spinner.hide();
      if (resp && resp.StatusCode == 200) {
        resp.PayLoadStr = JSON.parse(resp.PayLoadStr);
        this.OutsourceHospitalPatientsList = resp.PayLoadStr.Table;
        this.FilOutsourceHospitalPatientsList = resp.PayLoadStr.Table;
        console.log("telenoreRespCardOwnerDetailtelenoreRespCardOwnerDetail", this.telenoreRespCardOwnerDetail)
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    })
  }
  OutSourcePatClick(patient) {
    let _url = ['pat-reg/reg'] || [];
    if (this.route.routeConfig.path == 'regForHS') {
      _url = ['pat-reg/regForHS'];
    }
    const formValues = this.outsourcePendingPatientsForm.getRawValue();
    if (formValues.orgId == 1)
      this.updateUrlParams_navigateTo(_url, { outHospital: btoa(JSON.stringify({ HospitalPatientID: patient.HospitalPatientID, patSrc: 10 })) });
    else if (formValues.orgId == 2) {
      // telenoreResp.GetCustomerdetailsResult.LabCustomerdetails.MobileNumber + '-' + telenoreResp.GetCustomerdetailsResult.LabCustomerdetails.Name + '-' +
      //                       telenoreResp.GetCustomerdetailsResult.LabCustomerdetails.PackageName + '-' + telenoreResp.GetCustomerdetailsResult.LabCustomerdetails.Validity;      
      const telenoreMRN = this.telenoreResp.GetCustomerdetailsResult.LabCustomerdetails.MobileNumber
        + '-' + patient.Name + '-' + patient.Relation
      const dataToInsert = {
        "FirstName": patient.Name,
        "MobileNo": this.telenoreResp.GetCustomerdetailsResult.LabCustomerdetails.MobileNumber,
        "HospitalMRNo": telenoreMRN,
        "HospitalID": 2,
        "RespRcvFromTeleGetDiscountCardSrv": this.telenoreRespStr
      }
      this.InsertUpdPatients(dataToInsert, _url, patient);
      // let HospitalOrderNo = this.telenorePatientPayLoad[0].HospitalMRNo + '-' + patient.Name + '-' + patient.Relation;
      // this.updateUrlParams_navigateTo(_url, { bookingInfoTelenore: btoa(JSON.stringify(patient)), ownerInfoTele: btoa(JSON.stringify(this.telenoreRespCardOwnerDetail)) });
      // this.updateUrlParams_navigateTo(_url, { teleHospitalPatientID: btoa(JSON.stringify({ teleHospitalPatientID: this.telenorePatientPayLoad[0].HospitalPatientID })), teleHospitalMRN: btoa(JSON.stringify({ teleHospitalMRNo: this.telenorePatientPayLoad[0].HospitalMRNo })), orgID: btoa(JSON.stringify({ HospitalID: 2 })), bookingInfoTelenore: btoa(JSON.stringify(patient)), ownerInfoTele: btoa(JSON.stringify(this.telenoreRespCardOwnerDetail)) });
    }
    else if (formValues.orgId == 5) {
      this.showPatienTypeDropdown = false;
      this.updateUrlParams_navigateTo(_url, { outHospital: btoa(JSON.stringify({ HospitalPatientID: patient.HospitalPatientID, patSrc: 10 })) });
    }
    else if (formValues.orgId == 4) {
      this.updateUrlParams_navigateTo(_url, { outHospital: btoa(JSON.stringify({ HospitalPatientID: patient.HospitalPatientID, patSrc: 10 })) });
    }
    else if (formValues.orgId == 6 || formValues.orgId == 7) {
      this.updateUrlParams_navigateTo(_url, { outHospital: btoa(JSON.stringify({ HospitalPatientID: patient.HospitalPatientID, patSrc: 10 })) });
    }
    else {
      this.updateUrlParams_navigateTo(_url, { outHospital: btoa(JSON.stringify({ HospitalPatientID: patient.HospitalPatientID, patSrc: 10 })) });

    }
  }
  InsertUpdPatients(dataToInsert, _url, patient) {
    // if(this.WaitingPatientList[3].ONLINEBOOKEDTPDATA){}
    this.spinner.show();
    this.ecl.InsertUpdECLPatient(dataToInsert).subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length && resp.PayLoad[0].Result == 1) {
        this.updateUrlParams_navigateTo(_url, {
          teleHospitalPatientID: btoa(JSON.stringify({
            teleHospitalPatientID: resp.PayLoad[0].HospitalPatientID
          })), teleHospitalMRN: btoa(JSON.stringify({ teleHospitalMRNo: resp.PayLoad[0].HospitalMRNo })), orgID: btoa(JSON.stringify({ HospitalID: 2 })), bookingInfoTelenore: btoa(JSON.stringify(patient)), ownerInfoTele: btoa(JSON.stringify(this.telenoreRespCardOwnerDetail))
        });
        // resp.PayLoad[0].HospitalPatientID

        // this.updateUrlParams_navigateTo(_url, { telenore : btoa(JSON.stringify({ telenoreHospPatID: resp.PayLoad[0].HospitalPatientID })),teleCardOwner : btoa(JSON.stringify({ teleCardOwnerDetail:this.telenoreResp.GetCustomerdetailsResult.LabCustomerdetails }))});
      }
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.log("err", err)
    });


  }
  registerOutsourcePatients(outPatData) {
    this.router.navigate(['pat-reg/reg']).then(result => {
      window.open('#/pat-reg/reg?' + 'ousourcePatients=' + btoa(JSON.stringify(outPatData)) + '&ousourcePatientsTP=' +
        btoa(JSON.stringify(outPatData.ONLINEBOOKEDTPDATA)), '_blank');
    });
  }

  getOutsourceOrgs() {
    this.ecl.getOutSourceHospitalDetail().subscribe((resp: any) => {
      console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.outsourceHospitals = resp.PayLoad
      }
    }, (err) => { console.log(err) })
  }


  changePaType(selData) {
    switch (selData) {
      case 'All':
        this.FilOutsourceHospitalPatientsList = this.OutsourceHospitalPatientsList;
        break;
      default:
        this.FilOutsourceHospitalPatientsList = this.OutsourceHospitalPatientsList.filter(a => a.PatientType == selData);
        break;

    }
  }
  updateUrlParams_navigateTo(url, params = {}, settings = {}) {
    const _url = url || [];
    const _settings = {
      ...{
        // relativeTo: this.route,
        replaceUrl: true,
        queryParams: params,
        // queryParamsHandling: 'merge', // remove to replace all query params by provided
      }, ...settings
    };
    this.router.navigate(
      _url,
      _settings
    );
  }
}
