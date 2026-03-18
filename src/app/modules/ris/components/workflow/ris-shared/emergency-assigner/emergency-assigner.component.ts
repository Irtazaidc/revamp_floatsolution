// @ts-nocheck
import { Component, OnInit, Input } from '@angular/core';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from '../../../../../shared/helpers/api-routes';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  standalone: false,

  selector: 'app-emergency-assigner',
  templateUrl: './emergency-assigner.component.html',
  styleUrls: ['./emergency-assigner.component.scss']
})
export class EmergencyAssignerComponent implements OnInit {

   @Input('paramsValues') paramsValues: any;
  
   EmergencyAssignerDataList = [];

   searchText = ''
  
   spinnerRefs = {
    DataTable: 'DataTable',
  }

  constructor( 
    private sharedService: SharedService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    ) { }

  ngOnInit(): void {
   console.log("ParamsValuesForWorkList:", this.paramsValues)
     if (this.paramsValues.dateFrom && this.paramsValues.dateTo) {
      this.getAssignedEmergencyList(this.paramsValues);
    }
  }
  selVisit = null;
  selEmpUserId = null;
  getAssignedEmergencyList(params) {
     this.EmergencyAssignerDataList = [];
      if( !(params.branch?.length > 0) && !(params.branchAll?.length > 0)) {
        this.toastr.warning("Please select branch");
        return
      }
      if(!(params.subSectionIDs?.length > 0) && !(params.subSectionIDsAll?.length > 0)) {
        this.toastr.warning("Please select section");
        return
      }
      let Objparams = {
        DateFrom: params.dateFrom,
        DateTo: params.dateTo,
        LocIDs:  params.branch?.length > 0 ? params.branch.join(",") : params.branchAll.join(","),
        SubSectionIDs: params.subSectionIDs?.length > 0  ? params.subSectionIDs.join(",") : params.subSectionIDsAll.join(","),
        VisitID: params.visitID || null,
      }      
      this.spinner.show(this.spinnerRefs.DataTable);
      this.sharedService.getData(API_ROUTES.GET_EMERGENCY_ASSIGN_TEST, Objparams).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.DataTable);
        if (resp.StatusCode == 200) {
          this.EmergencyAssignerDataList = resp.PayLoad || [];
          // this.selVisit = this.EmergencyAssignerDataList[0]?.VisitId;
          // this.selEmpUserId = this.EmergencyAssignerDataList[0]?.CreatedUser;
        } else {
          this.toastr.error(resp.Message);
        }
      }, (err) => {
        console.log("err", err);
       this.spinner.hide(this.spinnerRefs.DataTable);

      })
  }

rowIndex = null;
getTableData(data, i){
  this.selVisit = data.VisitId;
  this.selEmpUserId = data.CreatedUser;
  this.rowIndex = i;
}

}
