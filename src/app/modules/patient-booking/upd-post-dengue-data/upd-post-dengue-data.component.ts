// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { DengueService } from '../services/dengue.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserModel } from '../../auth/_models/user.model';
import { AuthService } from '../../auth/_services/auth.service';

@Component({
  standalone: false,

  selector: 'app-upd-post-dengue-data',
  templateUrl: './upd-post-dengue-data.component.html',
  styleUrls: ['./upd-post-dengue-data.component.scss']
})
export class UpdPostDengueDataComponent implements OnInit {
  dengueData: any = [];
  masterSelected: any = false;
  selectedItemsToPost: any = [];
  Token: any = "";
  loggedInUser: UserModel;

  constructor(
    private dengueSrv: DengueService,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.getDengueDataToPost();
    this.getToken();
    this.loadLoggedInUserInfo();

  }

  getDengueDataToPost() {
    this.spinner.show();
    this.dengueSrv.getDengueDataToPostSrvForUpd().subscribe((resp: any) => {
      console.log(resp);
      this.spinner.hide();
      if (resp && resp.StatusCode == 200 && resp.PayLoad) {
        this.dengueData = resp.PayLoad;
        this.dengueData.map(a => { a.isSelected = false })
        console.log("dengueData to update", this.dengueData)
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err)
    })
  }
  selectUnselectAllItem() {
    this.dengueData.map((a, i) => {
      a.isSelected = this.masterSelected
    });
  }



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
            "PrevVisitDate": cur.PrevVisitDate,
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
              "PrevVisitDate": cur.PrevVisitDate,
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
        IsReposted: 1,

        // visitid: a.VisitId,
        // pid: a.PID,
        // tpid: a.TPId
      }
      console.log("paramsReposret: ", params);

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




  // checkdatatopost() {
  //   this.spinner.show();
  //   console.table(this.selectedItemsToPost);
  //   this.selectedItemsToPost = this.dengueData.filter((a => { return a.isSelected == true }))
  //   const result = this.selectedItemsToPost.reduce((acc, cur, i) => {
  //     if (cur.CNIC.indexOf('-') > -1) {
  //     }
  //     else {
  //       let curcnic1 = cur.CNIC.substring(0, 5);
  //       let curcnic2 = cur.CNIC.substring(5, 12);
  //       let curcnic3 = cur.CNIC.substring(12, 13);
  //       cur.CNIC = curcnic1 + '-' + curcnic2 + '-' + curcnic3;
  //     }

  //     const found = acc.find(a => a.VisitId === cur.VisitId);
  //     const details = {
  //       // "hct_first_reading": cur.PCode.toLowerCase == 'hct' ? cur.Result : null,
  //       // "hct_first_reading_date": cur.PCode.toLowerCase == 'hct' ? "2021-12-09" : null,
  //       // "wbc_first_reading": cur.PCode.toLowerCase == 'wbc' ? cur.Result : null,
  //       // "wbc_first_reading_date": cur.PCode.toLowerCase == 'wbc' ? "2021-12-09" : null,
  //       // "platelet_first_reading": cur.PCode.toLowerCase == 'plt' ? cur.Result : null,
  //       // "platelet_first_reading_date": cur.PCode.toLowerCase == 'plt' ? "2021-12-09" : null,
  //       "ns1": cur.PCode.toLowerCase() == 'ns1e' ? cur.Result : null,
  //       "igm": cur.PCode.toLowerCase() == 'denme' ? cur.Result : null,
  //       "igg": cur.PCode.toLowerCase() == 'denge' ? cur.Result : null
  //     }
  //     if (!found) {
  //       acc.push({
  //         "cnic": cur.CNIC,
  //         "patient_name": cur.PatientName,
  //         "fh_name": cur.PatientFatherName || "Not Provided",
  //         "gender": cur.Gender,
  //         "patient_contact": cur.PatientContact,
  //         "cnic_relation": cur.CNICRelation,
  //         "age": cur.PatientAge,
  //         "age_month": null,
  //         "address": cur.Address,
  //         "district_id": cur.DistrictID,
  //         "district": cur.District,
  //         "tehsil": cur.Tehsil,
  //         "tehsil_id": cur.TehsilID,
  //         "permanent_address": cur.Address,
  //         "permanent_district_id": cur.PermanentDistrictID,
  //         "permanent_district": cur.PerDistirct,
  //         "permanent_tehsil_id": cur.PermanentTehsilID,
  //         "permanent_tehsil": cur.PerTehsil,
  //         "workplace_address": null,
  //         "workplace_district_id": null,
  //         "workplace_district": null,
  //         "workplace_tehsil_id": null,
  //         "workplace_tehsil": null,
  //         "provisional_diagnosis": cur.ProvisonalDiagnosis || "Confirmed",
  //         "reporting_date": cur.ReportingDate,
  //         "VisitId": cur.VisitId,
  //         "lab_result_attributes": details,
  //         "log": [{
  //           "cnic": cur.CNIC,
  //           "patient_name": cur.PatientName,
  //           "fh_name": cur.PatientFatherName,
  //           "gender": cur.Gender,
  //           "patient_contact": cur.PatientContact,
  //           "cnic_relation": cur.CNICRelation,
  //           "age": '74', //a.PatientAge,
  //           "age_month": 12,
  //           "address": cur.Address,
  //           "district_id": cur.DistrictID,
  //           "district": cur.District,
  //           "tehsil": cur.Tehsil,
  //           "tehsil_id": cur.TehsilID,
  //           "permanent_address": cur.Address,
  //           "permanent_district_id": cur.PermanentDistrictID,
  //           "permanent_district": cur.PerDistirct,
  //           "permanent_tehsil_id": cur.PermanentTehsilID,
  //           "permanent_tehsil": cur.PerTehsil,
  //           "workplace_address": null,
  //           "workplace_district_id": null,
  //           "workplace_district": null,
  //           "workplace_tehsil_id": null,
  //           "workplace_tehsil": null,
  //           "provisional_diagnosis": cur.ProvisonalDiagnosis || "Confirmed",
  //           "reporting_date": cur.RegistrationData,
  //           "Result": cur.Result,
  //           "visitId": cur.VisitId,
  //           "tpID": cur.TPId,
  //           "pID": cur.PID,
  //           "CreatedBy": 1
  //         }]
  //       })
  //     }
  //     else {
  //       if (cur.PCode.toLowerCase() == 'denme') {
  //         found.lab_result_attributes.igm = cur.Result
  //       }
  //       else if (cur.PCode.toLowerCase() == 'denge') {
  //         found.lab_result_attributes.igg = cur.Result
  //       }
  //       else if (cur.PCode.toLowerCase() == 'ns1e') {
  //         found.lab_result_attributes.ns1 = cur.Result
  //       }
  //       if ((i - 1) < acc.length) {
  //         acc[i - 1].log.push(
  //           {
  //             "cnic": cur.CNIC,
  //             "patient_name": cur.PatientName,
  //             "fh_name": cur.PatientFatherName || "Not Provided",
  //             "gender": cur.Gender,
  //             "patient_contact": cur.PatientContact,
  //             "cnic_relation": cur.CNICRelation || null,
  //             "age": cur.PatientAge,
  //             "age_month": null,
  //             "address": cur.Address,
  //             "district_id": cur.DistrictID,
  //             "district": cur.District,
  //             "tehsil": cur.Tehsil,
  //             "tehsil_id": cur.TehsilID,
  //             "permanent_address": cur.Address,
  //             "permanent_district_id": cur.PermanentDistrictID,
  //             "permanent_district": cur.PerDistirct,
  //             "permanent_tehsil_id": cur.PermanentTehsilID,
  //             "permanent_tehsil": cur.PerTehsil,
  //             "workplace_address": null,
  //             "workplace_district_id": null,
  //             "workplace_district": null,
  //             "workplace_tehsil_id": null,
  //             "workplace_tehsil": null,
  //             "provisional_diagnosis": cur.ProvisonalDiagnosis || "Confirmed",
  //             "reporting_date": cur.ReportingDate,
  //             "Result": cur.Result,
  //             "visitID": cur.VisitId,
  //             "tpID": cur.TPId,
  //             "pID": cur.PID,
  //             "CreatedBy": 1
  //           }
  //         )
  //       }
  //     }
  //     // if (cur.lab_result_attributes.igm == 'Positive' || cur.lab_result_attributes.igg == 'Positive' || cur.lab_result_attributes.ns1 == 'Positive') {

  //     // }
  //     return acc;
  //   }, [])
  //   console.log("resultresultresultresultresult", result);
  //   let params = {
  //     t: this.Token,
  //     patient: result,
  //     // visitid: a.VisitId,
  //     // pid: a.PID,
  //     // tpid: a.TPId
  //   }
  //   console.log("params: ", params);
  //   this.dengueSrv.postDengueDataSrv(params).subscribe((resp: any) => {
  //     console.log(resp);
  //     this.spinner.hide();
  //     this.getDengueDataToPost();
  //   }, (err) => {
  //     this.spinner.hide();
  //     console.log(err)
  //   })
  // }
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
}
