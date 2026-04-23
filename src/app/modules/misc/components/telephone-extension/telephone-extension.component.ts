// @ts-nocheck
import { Component, Pipe,PipeTransform, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { MiscService } from '../../services/misc.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';

@Component({
  standalone: false,

  selector: 'app-telephone-extension',
  templateUrl: './telephone-extension.component.html',
  styleUrls: ['./telephone-extension.component.scss']
})
export class TelephoneExtensionComponent implements OnInit {
  ExtensionID:any=null;
  SubDepartmentID=null;
  LocID = null;
  searchText='';
  ExtensionExistingRow = [];
  LabDeptID=-1;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonTests = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  
  spinnerRefs = {
    listSection: 'listSection',
    formSection:'formSection'
  }

  ActionLabel ="Save";
  CardTitle ="Add Extension";
  extensionForm = this.fb.group({
    LocId : ['' ,Validators.compose([Validators.required])],
    DepartmentId : ['', Validators.compose([Validators.required])],
    Title : ['', Validators.compose([Validators.required])],
    ExtensionNo : ['', Validators.compose([Validators.required])],
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to '+this.ActionLabel.toLowerCase()+' ?', // 'Are you sure?',
    popoverTitleTests: 'Are you <b>sure</b> want to save ?', // 'Are you sure?',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  page = 1;
  pageSize = 5;
  collectionSize = 0;
  filteredSearchResults = [];
  paginatedSearchResults = [];
  testList: any[];
  ExtensionTitleToShowOnCard: any='';
  MachineTestID: any = null;
  ExistingSelectedTests: any = [];
  branchesList =[];
  departmentsList = [];
  extensionList: any = [];
  constructor(
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private lookupService : LookupService,
    private fb : FormBuilder,
    private miscService : MiscService,
    private auth: AuthService,
  ) {
  }

  ngOnInit(): void {
    this.getBranches();
    this.loadLoggedInUserInfo();
    this.getSubDepartment();
    this.getExtension();
    
  }
  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getSingleRow(ExtensionID){
    this.ExtensionID = ExtensionID;
    this.getExtension();
  }
  
  insertUpdateExtension(){
    this.spinner.show(this.spinnerRefs.formSection); 
    const formValues = this.extensionForm.getRawValue();
    this.extensionForm.markAllAsTouched();
    if(this.extensionForm.invalid) {
      this.spinner.hide(this.spinnerRefs.formSection);
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      this.disabledButton = true;
      this.isSpinner = false;
      const formData = {
        ExtensionID:this.ExtensionID,
        DepartmentID: formValues.DepartmentId,
        LocID: formValues.LocId,
        Title: formValues.Title,
        ExtensionNo: formValues.ExtensionNo,
        CreatedBy:this.loggedInUser.userid || -99,
      };
      this.miscService.insertUpdateExtension(formData).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.spinner.hide(this.spinnerRefs.formSection);
            this.toastr.success(data.Message);
            this.clearForm();
            this.ExtensionID = null;
            this.getExtension();
            this.disabledButton = false; 
            this.isSpinner = true;
          } else {
            this.spinner.hide(this.spinnerRefs.formSection);
            this.toastr.error(data.Message)
            this.disabledButton = false; 
            this.isSpinner = true;
          }
        }
      },(err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.formSection);
        this.disabledButton = false; 
        this.isSpinner = true; 
        this.toastr.error('Connection error');
      })
    }
  }
  
  searchExtension(){
      this.ActionLabel="Save"
      this.CardTitle ="Add Extension";
      this.spinner.show(this.spinnerRefs.listSection);
    const params = {
      ExtensionID: this.ExtensionID,
      SubDepartmentID: this.SubDepartmentID,
      LocID: this.LocID
    };
    this.lookupService.getExtension(params).subscribe((res: any) => {
      (this.ExtensionID)? this.spinner.hide(this.spinnerRefs.formSection):this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        this.extensionList =  res.PayLoad || [];
        this.ExtensionID = null;
          this.spinner.hide(this.spinnerRefs.listSection);
        
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.listSection);
    })
    this.spinner.hide();
  }
  getExtension(){
    this.ExtensionExistingRow = [];
    if(this.ExtensionID){
      this.ActionLabel="Update"
      this.CardTitle ="Update Exension";
      this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to '+this.ActionLabel.toLowerCase()+' ?';
      this.spinner.show(this.spinnerRefs.formSection);
    }else{
      this.ActionLabel="Save"
      this.CardTitle ="Add Extension";
      this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to '+this.ActionLabel.toLowerCase()+' ?';
      this.spinner.show(this.spinnerRefs.listSection);
    }
    
    const params = {
      ExtensionID: this.ExtensionID,
      SubDepartmentID: this.SubDepartmentID,
      LocID: this.LocID
    };
    this.lookupService.getExtension(params).subscribe((res: any) => {
      (this.ExtensionID)? this.spinner.hide(this.spinnerRefs.formSection):this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        if(params.ExtensionID){
          this.disabledButtonTests = false;
          this.ExtensionExistingRow =  res.PayLoad[0];
          this.spinner.hide(this.spinnerRefs.listSection);
          this.extensionForm.patchValue({
            LocId: this.ExtensionExistingRow["LocID"],
            DepartmentId: this.ExtensionExistingRow["DepartmentID"],
            Title: this.ExtensionExistingRow["Title"],
            ExtensionNo: this.ExtensionExistingRow["ExtensionNo"]
          });
          this.ExtensionTitleToShowOnCard = this.ExtensionExistingRow["Title"]
        }else{
          this.clearForm();
          this.extensionList =  res.PayLoad || [];
          if(!this.extensionList.length){
            this.toastr.info('No record found.');
          }
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      (this.ExtensionID)? this.spinner.hide(this.spinnerRefs.formSection):this.spinner.hide(this.spinnerRefs.listSection);
    })
    this.spinner.hide();
  }


  clearForm(){ 
    this.ExtensionTitleToShowOnCard = '';
    this.ExtensionID=null;
    this.ActionLabel="Save";
    this.disabledButtonTests=true;
    this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to '+this.ActionLabel.toLowerCase()+' ?'
    this.CardTitle ="Add Extension";
    setTimeout(() => {
      this.extensionForm.reset();
    }, 100);
  }

  getExtension_() {
    this.spinner.show(this.spinnerRefs.listSection);
    this.extensionList = [];
    const _params = {
      ExtensionID: this.ExtensionID,
      SubDepartmentID: null,
      LocID: null
    }
    this.lookupService.getExtension(_params).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.listSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }

        this.extensionList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }

  getBranches() {
    this.branchesList = [];
    this.lookupService.GetBranches().subscribe((resp: any) => {
      const _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
    }, (err) => {
      console.log(err);
    })
  }

  getSubDepartment() {
    this.departmentsList = []
    this.lookupService.GetSubDepartments().subscribe((resp: any) => {
      this.departmentsList = resp.PayLoad;
      console.log('Dep List is: ',this.departmentsList)
      if(!this.departmentsList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

}
