// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DengueService } from '../services/dengue.service';
import { AuthService, UserModel } from '../../auth';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Conversions } from '../../shared/helpers/conversions';
import { LookupService } from '../services/lookup.service';
import { ExcelService } from '../../business-suite/excel.service';
import { AppPopupService } from '../../shared/helpers/app-popup.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';


@Component({
  standalone: false,

  selector: 'app-post-dengue-data',
  templateUrl: './post-dengue-data.component.html',
  styleUrls: ['./post-dengue-data.component.scss']
})
export class PostDengueDataComponent implements OnInit {

  @ViewChild('editPatientInfo') editPatientInfo;
  
  dengueData: any = [];
  masterSelected: any = false;
  selectedItemsToPost: any = [];
  Token: any = "";
  loggedInUser: UserModel;
  docsPopupRef: NgbModalRef;
  public Fields = {
    dateFrom: [''],
    dateTo: [''],
    locID: [, ''],
    PIN: [''],
  };
  searchText = '';

  spinnerRefs = {
    editInfo:'editInfo'
  }
  GetDenPortal: FormGroup = this.formBuilder.group(this.Fields)


   // Dengue Update
   showUpdate = false;
   isEditing = false;
   isSubmitted = false;
   isDisable = true;

   districts = [];
   tehsils = []; 
   optionalColumnsVisibility = false;


  constructor(
    private dengueSrv: DengueService,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private lookupService: LookupService,
    private excelService: ExcelService,
    private appPopupService: AppPopupService,


  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.GetDenPortal.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.getDengueDataToPost();
    }, 100);
    this.getToken();
    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getdistricts();
    this.getTehsils();
  }
  getDengueDataToPost() {
    let formValues = this.GetDenPortal.getRawValue();

    let params = {
      DateFrom: Conversions.formatDateObjectToString(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObjectToString(formValues.dateTo) || null,
      LocID: formValues.locID || null,
      PIN: formValues.PIN || null,
    }
    this.spinner.show();
    this.dengueSrv.getDengueDataToPostSrv(params).subscribe((resp: any) => {
      console.log(resp);
      this.spinner.hide();
      if (resp && resp.StatusCode == 200 && resp.PayLoad) {
        this.dengueData = resp.PayLoad;
        this.dengueData.map(a => { a.isSelected = false });
        this.dengueData = this.dengueData.map(den => ({
          ...den,
          isEditing: false,   // Initialize each row's editing state
          isDisable: true     // Initially disable editing for all rows
        }));
        
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    })
  }
  selectUnselectAllItem() {
    this.dengueData.map((a, i) => {
      // if (this.dengueData[i].isSelected === this.masterSelected) {
      a.isSelected = this.masterSelected
      // this.selectedItemsToPost.push(a);
      // }
    });
    // this.PendingHCRequests[i].isSelected = this.masterSelected;
    // console.table(this.selectedItemsToPost);
  }
  // selectUnselectItem() {
  //   this.dengueData.map((a, i) => {
  //     if (this.dengueData[i].isSelected) {
  //       this.selectedItemsToPost.push(a);
  //     }
  //   });
  // }

  checkdatatopost() {
    this.spinner.show();
    console.table(this.selectedItemsToPost);
    this.selectedItemsToPost = this.dengueData.filter((a => { return a.isSelected == true }))
    const result = this.selectedItemsToPost.reduce((acc, cur, i) => {
      if (cur.CNIC.indexOf('-') > -1) {

      }
      else {
        let curcnic1 = cur.CNIC.substring(0, 5);
        let curcnic2 = cur.CNIC.substring(5, 12);
        let curcnic3 = cur.CNIC.substring(12, 13);
        cur.CNIC = curcnic1 + '-' + curcnic2 + '-' + curcnic3;
      }

      const found = acc.find(a => a.VisitId === cur.VisitId);
      const details = {
        // "hct_first_reading": cur.PCode.toLowerCase == 'hct' ? cur.Result : null,
        // "hct_first_reading_date": cur.PCode.toLowerCase == 'hct' ? "2021-12-09" : null,
        // "wbc_first_reading": cur.PCode.toLowerCase == 'wbc' ? cur.Result : null,
        // "wbc_first_reading_date": cur.PCode.toLowerCase == 'wbc' ? "2021-12-09" : null,
        // "platelet_first_reading": cur.PCode.toLowerCase == 'plt' ? cur.Result : null,
        // "platelet_first_reading_date": cur.PCode.toLowerCase == 'plt' ? "2021-12-09" : null,
        "ns1": cur.PCode.toLowerCase() == 'ns1e' ? cur.Result : null,
        "igm": cur.PCode.toLowerCase() == 'denme' ? cur.Result : null,
        "igg": cur.PCode.toLowerCase() == 'denge' ? cur.Result : null
      }
      if (!found) {
        acc.push({
          "cnic": cur.CNIC,
          "patient_name": cur.PatientName,
          "fh_name": cur.PatientFatherName || "Not Provided",
          "gender": cur.Gender,
          "patient_contact": cur.PatientContact,
          "cnic_relation": cur.CNICRelation,
          "age": cur.PatientAge.split(' ')[0],
          "age_month": null,
          "address": cur.Address,
          "district_id": cur.DistrictID,
          "district": cur.District,
          "tehsil": cur.Tehsil,
          "tehsil_id": cur.TehsilID,
          "permanent_address": cur.Address,
          "permanent_district_id": cur.PermanentDistrictID,
          "permanent_district": cur.PerDistirct,
          "permanent_tehsil_id": cur.PermanentTehsilID,
          "permanent_tehsil": cur.PerTehsil,
          "workplace_address": "Not Provided",
          "workplace_district_id": null,
          "workplace_district": "Not Provided",
          "workplace_tehsil_id": null,
          "workplace_tehsil": "Not Provided",
          "provisional_diagnosis": cur.ProvisonalDiagnosis || "Confirmed",
          "reporting_date": cur.ReportingDate,
          "VisitId": cur.VisitId,
          "lab_result_attributes": details,
          "PrevVisitID": cur.PrevVisitID,
          "PrevLabResult": cur.PrevLabResult,
          "PrevVisitDate": cur.PrevVisitDate,
          "log": [{
            "cnic": cur.CNIC,
            "patient_name": cur.PatientName,
            "fh_name": cur.PatientFatherName,
            "gender": cur.Gender,
            "patient_contact": cur.PatientContact,
            "cnic_relation": cur.CNICRelation,
            "age": cur.PatientAge.split(' ')[0],
            "age_month": null,
            "address": cur.Address,
            "district_id": cur.DistrictID,
            "district": cur.District,
            "tehsil": cur.Tehsil,
            "tehsil_id": cur.TehsilID,
            "permanent_address": cur.Address,
            "permanent_district_id": cur.PermanentDistrictID,
            "permanent_district": cur.PerDistirct,
            "permanent_tehsil_id": cur.PermanentTehsilID,
            "permanent_tehsil": cur.PerTehsil,
            "workplace_address": null,
            "workplace_district_id": null,
            "workplace_district": null,
            "workplace_tehsil_id": null,
            "workplace_tehsil": null,
            "provisional_diagnosis": cur.ProvisonalDiagnosis || "Confirmed",
            "reporting_date": cur.ReportingDate,
            "Result": cur.Result,
            "visitId": cur.VisitId,
            "tpID": cur.TPId,
            "pID": cur.PID,
            "CreatedBy": this.loggedInUser.userid,
            "PrevVisitID": cur.PrevVisitID,
            "PrevLabResult": cur.PrevLabResult,
            "PrevVisitDate": cur.PrevVisitDate
          }]
        })
      }
      else {
        if (cur.PCode.toLowerCase() == 'denme') {
          found.lab_result_attributes.igm = cur.Result
        }
        else if (cur.PCode.toLowerCase() == 'denge') {
          found.lab_result_attributes.igg = cur.Result
        }
        else if (cur.PCode.toLowerCase() == 'ns1e') {
          found.lab_result_attributes.ns1 = cur.Result
        }
        if ((i - 1) < acc.length) {
          acc[i - 1].log.push(
            {
              "cnic": cur.CNIC,
              "patient_name": cur.PatientName,
              "fh_name": cur.PatientFatherName || "Not Provided",
              "gender": cur.Gender,
              "patient_contact": cur.PatientContact,
              "cnic_relation": cur.CNICRelation || null,
              "age": cur.PatientAge.split(' ')[0],
              "age_month": null,
              "address": cur.Address,
              "district_id": cur.DistrictID,
              "district": cur.District,
              "tehsil": cur.Tehsil,
              "tehsil_id": cur.TehsilID,
              "permanent_address": cur.Address,
              "permanent_district_id": cur.PermanentDistrictID,
              "permanent_district": cur.PerDistirct,
              "permanent_tehsil_id": cur.PermanentTehsilID,
              "permanent_tehsil": cur.PerTehsil,
              "workplace_address": null,
              "workplace_district_id": null,
              "workplace_district": null,
              "workplace_tehsil_id": null,
              "workplace_tehsil": null,
              "provisional_diagnosis": cur.ProvisonalDiagnosis || "Confirmed",
              "reporting_date": cur.ReportingDate,
              "Result": cur.Result,
              "visitID": cur.VisitId,
              "tpID": cur.TPId,
              "pID": cur.PID,
              "CreatedBy": this.loggedInUser.userid,
              "PrevVisitID": cur.PrevVisitID,
              "PrevLabResult": cur.PrevLabResult,
              "PrevVisitDate": cur.PrevVisitDate
            }
          )
        }
      }
      // if (cur.lab_result_attributes.igm == 'Positive' || cur.lab_result_attributes.igg == 'Positive' || cur.lab_result_attributes.ns1 == 'Positive') {

      // }
      return acc;
    }, [])
    console.log("resultresultresultresultresult", result);
    for (let i = 0; i < result.length; i++) {
      let params = {
        t: this.Token,
        patient: result[i],
        // visitid: a.VisitId,
        // pid: a.PID,
        // tpid: a.TPId
      }
      console.log("params: ", params);

      this.dengueSrv.postDengueDataSrv(params).subscribe((resp: any) => {
        console.log(resp);
        this.spinner.hide();
        this.getDengueDataToPost();
      }, (err) => {
        this.spinner.hide();
        console.log(err)
      })
    }
  }

  getToken() {
    this.spinner.show();
    this.dengueSrv.getToken().subscribe((resp: any) => {
      console.log(resp);
      this.spinner.hide();
      if (resp && resp.StatusCode == 200 && resp.PayLoadStr.length) {
        this.Token = resp.PayLoadStr
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err)
    })
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  OpenFormForUpdates() {

  }
  branchList
  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
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

   exportAsExcel() {
    const excelData = [];
    if (this.dengueData.length) {
      this.dengueData.forEach((d, index) => {
        const row = {
          'Sr#': index + 1,
          'Patient Name': d.PatientName,
          'Visit ID': d.VisitId,
          'Test Name': d.Title,
          'Param Name': d.PCode,
          'Result': d.Result,
          'District': d.District,
          'Tehsil': d.Tehsil,
          'Permanent District': d.PerDistirct,
          'Permanent Tehsil': d.PerTehsil,
          'Address': d.Address,
          'Permanent Address': d.PermanentAddress,
          'Branch': d.RegLoc,
          'Last Visit': d.PrevVisitID,
          'Last Visit Date': d.PrevVisitDate,
          'Last Visit Result': d.PrevLabResult,
        };
        excelData.push(row);
      });
     this.excelService.exportAsExcelFile(excelData, 'Dengue Data Report' , 'Dengue_Data');  
    }
    else {
      this.toasrt.error('No table to export');
    }
  }
  selectedRow;
  rowIndex = null;
  editDengueDataToPost(den, index) {
    this.rowIndex = index;
    // this.spinner.show(this.spinnerRefs.editInfo)
    this.selectedRow = den;
    console.log("🚀 this.selectedRow:", this.selectedRow)
    this.dengueData.forEach(d => {
      if (d !== den) {
        d.isEditing = false;
        // d.isDisable = true; // Lock other rows
      }
    });
  
    den.isEditing = !den.isEditing;
    // den.isDisable = !den.isEditing; // Enable inputs only for the selected row
    // this.optionalColumnsVisibility = !this.optionalColumnsVisibility;
    // setTimeout(() => {
      this.docsPopupRef = this.appPopupService.openModal(this.editPatientInfo, {
        backdrop: "static",
        size: "lg",
      });
    // this.spinner.hide(this.spinnerRefs.editInfo)
    // }, 200);
  }
  
  

  updateDengueDataToPost(){
    let params = {
      PatientId:this.selectedRow.PatientID,
      VisitId: this.selectedRow.VisitId, 
      // PermanentTehsilID: this.selectedRow.PermanentTehsilID || null, 
      // PermanentDistrictID:this.selectedRow.PermanentDistrictID || null,
      DistrictID:  this.selectedRow.DistrictID || null,  
      TehsilID: this.selectedRow.TehsilID || null, 
      Address: this.selectedRow.Address || "", 
      // PermanentAddress: this.selectedRow.PermanentAddress || "", 
      ModifiedBy:  this.loggedInUser.userid || -1,
    }
    console.log("🚀 ~ PostDengueDataComponent ~ updateDengueDataToPost ~ params:", params)
    this.spinner.show();
    this.dengueSrv.updatePatientInfoDengueDataToPost(params).subscribe((resp: any) => {
      this.spinner.hide();
      if (resp && resp.StatusCode === 200) {
        if(resp.PayLoad[0].Result === 1){
          this.toasrt.success('Data Updated Successfully');
          // this.editDengueDataToPost(den);
          this.appPopupService.closeModal(this.editPatientInfo);
          this.getDengueDataToPost();
          
        }
        else{
          this.toasrt.warning('Error Updating Info');
          // this.editDengueDataToPost(den);
          this.getDengueDataToPost();
        }
      }
      else{
        this.toasrt.error('Something Went Wrong');
        // this.editDengueDataToPost(den);
        // this.getDengueDataToPost();
      }
    }, (err) => {
      this.spinner.hide();
      this.toasrt.error('Connection Error');
      console.log(err);
    })
  }

  

  getdistricts() {

    this.districts = [];
    this.lookupService.getdistricts().subscribe((resp: any) => {
      console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.districts = resp.PayLoad;
        // console.log("this.districts:", this.districts);
      }
    }, (err) => { console.log(err) })
  }

  getTehsils() {

    this.tehsils = [];
    this.lookupService.getTehsils().subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.tehsils = resp.PayLoad;
        // console.log(" this.districts", this.tehsils);
      }
    }, (err) => { console.log(err) })
  }

}
