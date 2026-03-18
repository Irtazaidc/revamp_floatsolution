// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { LabConfigsService } from '../../services/lab-configs.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
// import * as signalR from '@microsoft/signalr';
import { SignalrService } from '../../services/signalr.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";

@Component({
  standalone: false,

  selector: 'app-test-machine-priority',
  templateUrl: './test-machine-priority.component.html',
  styleUrls: ['./test-machine-priority.component.scss']
})
export class TestMachinePriorityComponent implements OnInit {

  @ViewChild('videoElement') videoElement: ElementRef;
  searchText='';
  HighlightRow: any;
  MachineID:any=null;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonTests: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  spinnerRefs = {
    listSection: 'listSection',
    testListSection: 'testListSection',
    machinePriorityFormSection:'machinePriorityFormSection'
  }

  machineConfigForm = this.fb.group({
    MachineName : ['' ,Validators.compose([Validators.required])],
    MachineCode : ['', Validators.compose([Validators.required])],
    Abbreviation : ['', Validators.compose([Validators.required])],
    Capacity : ['',Validators.compose([Validators.required])],
    isManual : [0],
    isOperational : [0],
    TestSectionID : ['',Validators.compose([Validators.required])],
    TestSubSectionID : [''],
    MachineDesc : [''],
    machineBranch: ['',]
    // machineBranch: ['', [Validators.required]]
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to save ?', // 'Are you sure?',
    popoverTitleTests: 'Are you <b>sure</b> want to save ?', // 'Are you sure?',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  testList: any[];
  TestMachineList: any = [];
  TPID: any;
  index: any;
  TestProfileCode: any;
  constructor(
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private fb : FormBuilder,
    private LabConfService : LabConfigsService,
    private auth: AuthService,
    private testProfileService: TestProfileService,
  ) {
  }

  ngOnInit(): void {
    this.getTestProfileList();
    this.loadLoggedInUserInfo();
    
  }
  getTestProfileList() {
    this.spinner.show(this.spinnerRefs.testListSection);
    this.testList = [];
    let _param = {
      branchId: 1,//this.selectedLocId,
      TestProfileCode: null,
      TestProfileName: null,
      panelId:  null,
      TPIDs: ''
    };
    this.testProfileService.getTestsByName(_param).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.testListSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        this.testList = data || [];
        // setTimeout(() => {
          this.getTestMachines(this.testList[0].TPId,0,this.testList[0].TestProfileCode)
        // }, 500);
      }
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }

  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  
  insertUpdateMachine(){
    this.spinner.show(this.spinnerRefs.machinePriorityFormSection); 
    let formValues = this.machineConfigForm.getRawValue();
    this.machineConfigForm.markAllAsTouched();
    if(this.machineConfigForm.invalid) {
      this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      this.isSpinner = false; // Button Spinner show
      let formData = {
        MachineID:this.MachineID,
        MachineName: formValues.MachineName,
        MachineCode: formValues.MachineCode,
        Abbreviation: formValues.Abbreviation,
        Capacity: formValues.Capacity,
        isManual: formValues.isManual==true?1:0,
        isOperational: formValues.isOperational==true?1:0,
        TestSectionID: formValues.TestSectionID,
        TestSubSectionID: formValues.TestSubSectionID==""?null:formValues.TestSubSectionID,
        LocID: formValues.machineBranch,
        MachineDesc: formValues.MachineDesc,
        CreatedBy:this.loggedInUser.userid || -99,
      };
      this.LabConfService.insertUpdateMachine(formData).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
            this.toastr.success(data.Message);
            this.disabledButton = false; 
            this.isSpinner = true;
          } else {
            this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
            this.toastr.error(data.Message)
            this.disabledButton = false; 
            this.isSpinner = true;
          }
        }
      },(err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
        this.disabledButton = false; 
        this.isSpinner = true; 
        this.toastr.error('Connection error');
      })
    }
  }

  
  getTestMachines(TPID,index,testProfileCode){
    this.TestMachineList=[]
    this.TestProfileCode = testProfileCode;
    this.index = index;
    this.TPID = TPID;
    this.HighlightRow = index;
    this.spinner.show(this.spinnerRefs.machinePriorityFormSection);
    let params = {
      TPId:this.TPID
    };
    this.LabConfService.getTestMachines(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
      if (res.StatusCode == 200) {
        this.TestMachineList =  res.PayLoad || [];
        console.log('Test Machine Priority: ',this.TestMachineList)
        if(this.TestMachineList <= 0){
          this.toastr.warning('No associated machine found against "'+this.TestProfileCode+'"!')
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
    })
    this.spinner.hide();
  }
  updateTestMachinePriority(){
    this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
    this.isSpinner = false; // Button Spinner show
    this.spinner.show(this.spinnerRefs.machinePriorityFormSection);
      if(this.TestMachineList.length){
        let objParam = {
          MachineTestID: this.TestMachineList[0].MachineTestID,
          TPID : this.TPID,
          CreatedBy: this.loggedInUser.userid || -99,
          tblMachineTest: this.TestMachineList.map( a => {
            return {
              MachineTestID: a.MachineTestID, 
              MachineID: a.MachineID, 
              TPID: this.TPID, 
              PerformingTime: null,
              MachinePriority:  a.MachinePriority
              }
            })
          }   
          this.LabConfService.updateTestMachinePriority(objParam).subscribe((data: any) => {
          this.disabledButton = false;
          this.isSpinner = true;
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              this.toastr.success(data.Message);
              this.getTestMachines(this.TPID,this.index,this.TestProfileCode);
            } else {
              this.toastr.error(data.Message)
            }
            this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
          }
        }, (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.machinePriorityFormSection);
          this.toastr.error('Connection error');
          this.disabledButton = false;
          this.isSpinner = true;
      })
    }
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.TestMachineList, event.previousIndex, event.currentIndex);
    this.TestMachineList.forEach((item, idx) => {
      item.MachinePriority = idx + 1;
    });
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }


}
