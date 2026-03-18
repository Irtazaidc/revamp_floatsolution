// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Component({
  standalone: false,

  selector: 'app-refby-mapping',
  templateUrl: './refby-mapping.component.html',
  styleUrls: ['./refby-mapping.component.scss']
})
export class RefbyMappingComponent implements OnInit {

  radoiologistList
  searchText = '';
  EmpIDActiveClass
  isSubmitted = false
  spinnerRefs = {
    listSection: "listSection",
    refBylistSection: "refBylistSection",
  }

  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  disabledButton = false;
  isSpinner = true;
  buttonClicked = false;
  refByDoctors = []

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupSrv: LookupService,
    private sharedService: SharedService,

  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRadiologistRefByListMapping();
    this.getRefByDoctors();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  getRadiologistRefByListMapping() {
    this.radoiologistList = [];
    this.spinner.show(this.spinnerRefs.listSection);
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_REFBYLIST_MAPPING, {}).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        let resp = data.PayLoad || [];
        this.radoiologistList = resp.map(a => {
          let refByIDs = a.RefByListIDs ? a.RefByListIDs.split(',').map(id => parseInt(id, 10)) : [];
          return {
            EmpId: a.EmpId,
            FullName: a.FullName,
            EmpNoWithPrefix: a.EmpNoWithPrefix,
            refByIDs: refByIDs.filter(id => !isNaN(id))
          };
        });
        this.spinner.hide(this.spinnerRefs.listSection);
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }

  selectAllTestsSection(checked) {
    this.radoiologistList.forEach(sec => {
      sec.checked = checked;
    });
  }
  onSelectedSectionChange(e) {
    const checked: boolean = e.checked
    if(checked == true ){
     this.isSubmitted = true;
    } 
  }
 
  getRefByDoctors() {
    this.refByDoctors = [];
    let _params = {};
    this.spinner.show(this.spinnerRefs.refBylistSection);
    this.lookupSrv.getRefByDoctors(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.refBylistSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.refByDoctors = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.refBylistSection);
      console.log(err);
    });
  }

  insertUpdateRefByRadiologistMapping() {
    let checkedItems = this.radoiologistList.filter(a => a.checked);
    let isInValidData = false;
    if (!checkedItems.length) {
      this.toastr.warning("Please select doctor to save mapping", "Warning!");
      return;
    }
    this.buttonClicked = true;
    checkedItems.forEach(a => {
      if (!a.refByIDs || !a.refByIDs.length) {
        isInValidData = true;
      }
    })

    if (isInValidData) {
      this.toastr.error("Please select RefBy doctor against checked Radiologist");
      this.isSubmitted = true;
      return;
    } else {
      let objParam = {
        CreatedBy: this.loggedInUser.userid,
        tblRefByRadioMapping: checkedItems.map(a => {
          return {
            EmpID: a.EmpId,
            RefByListIDs: a.refByIDs.join(','),
          }

        })
      }
      this.disabledButton = true;
      this.isSpinner = false;
      this.sharedService.getData(API_ROUTES.INSERT_UPDATE_REFBY_RADIOLOGIST_MAPPING, objParam).subscribe((data: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        this.buttonClicked = false;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            let date = JSON.parse(data.PayLoadStr)
            if(date[0].Result == 1){
              this.toastr.success('Saved');
              this.buttonClicked = false;
            }
            else{
              this.toastr.error("Error!");
            }
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.isSpinner = true;
            this.buttonClicked = false;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButton = false;
        this.isSpinner = true;
        this.buttonClicked = false;
      })
    }

  }


}
