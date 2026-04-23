// @ts-nocheck
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from '../../../auth';
import { LookupService } from '../../../patient-booking/services/lookup.service';
import { DoctorService } from '../../services/doctor.service';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { TabsSwitchingService } from '../../services/tabs-switching.service';
import { BillingService } from 'src/app/modules/billing/services/billing.service';
import html2canvas from 'html2canvas';

@Component({
  standalone: false,

  selector: 'app-b2b-doctors',
  templateUrl: './b2b-doctors.component.html',
  styleUrls: ['./b2b-doctors.component.scss']
})
export class B2bDoctorsComponent implements OnInit {

  loggedInUser: UserModel;
  showB2BDoctorsForm = false;
  searchText = '';
  b2bDoctorsList = [];
  doctorSpecialityList = [];
  panelsList = [];
  bTobPanelName=null;

@ViewChild('qrWrapper', { static: false }) qrWrapper!: ElementRef;

  refByB2BDoctorsMapping = [];
  refByDoctors = [];
  b2bDoctors = [];
  formSubmitted = false;

  bTobDoctorsData
  
  QRCodeNumber = '';
  existing
   = '';

  spinnerRefs = {
    DocDrGen: 'DocDrGen',
    searchTable: 'searchTable',
    insertForm: 'insertForm',
  };
  isSubmitted = false;
  isEditing = false;
  isSaveEditing = false;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader



  doctorForm = this.fb.group({
    B2BDoctorID: [null],
    Code: [''],
    Title: ['Dr.'],
    FirstName: ['', Validators.required],
    LastName: [''],
    Gender: [''],
    DateOfBirth: [''], // [new Date(), Validators.required],
    Phone: ['', [Validators.required, Validators.maxLength(15)]],
    Cell: ['', Validators.required],
    Email: ['',[Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    Address: [''],
    B2BTypeID: ['', Validators.required], // Business, Hopital, Doctor
    Discount: [0], //[Validators.min(0), Validators.max(100)]
    DiscountTypeID: [false],
    LISShare: [0, Validators.required],
    RISShare: [0, Validators.required],
    Education: [''],
    SpecialityId: [''],
    CreatedBy: ['', Validators.required],
    IsDeleted: [0],
    AssociatePanelIDs: [],
    isOnlineReportView: [''],
  });

  form = this.fb.group({
    RefByDoc: ['', Validators.required], // for FE use only
    RefId: ['', Validators.required],
    B2BDoctorID: ['', Validators.required],
    CreatedBy: [''],
    AssignForcefully: ['']
  });

  doctorFormSubmitted = false;
  genders = [
    {
      id: 'M', title: 'Male'
    },
    {
      id: 'F', title: 'Female',
    }
  ];
  myModel = {percentNumber: 0};
  b2bTypes = [
    {id: 1, title: 'Doctor'},
    {id: 2, title: 'Hospital'},
    {id: 3, title: 'Clinic'},
    {id: 4, title: 'Business'}
  ];
  optionalColumnsVisibility = false;
  userCreationForm: FormGroup;
  insertPanelform : FormGroup;

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }
  isFormDisabled = true; // Fields disabled by default
  toggleEditFields = true;
  rowIndex: number | null = null;


  
  selectedTabIndex;
  tabData;
  constructor(
    private doctorService: DoctorService,
    private auth: AuthService,
    private lookupService: LookupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private Tabs : TabsSwitchingService,
    private Billing: BillingService,

  ) { 
    this.userCreationForm = this.fb.group({
      Username: [{ value: '', disabled: true }, Validators.required],
      Password: [{ value: '', disabled: true }, Validators.required],
      // FullName: [{ value: '', disabled: true }, Validators.required],
      // Cell: [{ value: '', disabled: true }],
      // Phone: [{ value: '', disabled: true }],
      // Email: [{ value: '', disabled: true }, [Validators.email]],
    });
    this.insertPanelform = this.fb.group({
      PanelUserId: [  , Validators.required],
    });
   }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getDoctorSpeciality();
    this.getB2BDoctors();
    this.getPanels();
    this.getPanelUsersData();
    // this.getRefByB2bDoctorsMapping();
    // this.getRefByDoctors();
    this.Tabs.selectedTabIndex$.subscribe(({index, data }) => {
      this.selectedTabIndex = index;
      this.tabData = data; 
      if(this.tabData){
        console.log("🚀this.tabData:", this.tabData)
          this.doctorForm.patchValue({
            B2BDoctorID: null,
            Title: 'Dr.',
            FirstName: this.tabData.RefByName.replace(/^Dr\. /, '') || '',
            Phone: this.tabData.ContactNo || '',
            Cell: this.tabData.ContactNo || '',
            Email: this.tabData.Email || '',
            Address: this.tabData.RefByAddress || '',
            // IsDeleted: this.tabData.IsDeleted || '',
          })
      }        
    });
  }

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.auth.getUserFromLocalStorage();
    this.loggedInUser = this.auth.currentUserValue;
    this.doctorForm.patchValue({
      CreatedBy: this.loggedInUser.userid
    });

  }

  showAddB2BDoctorForm(value) {
    if(value) {
      this.resetForm();
    }
    this.showB2BDoctorsForm = value;
  }

  b2bTypeChangedEvent() {
    const genderCtrl = 'Gender';
    const titleCtrl = 'Title';
    // let lastName = 'LastName'
    if (!this.doctorForm.value.B2BTypeID || this.doctorForm.value.B2BTypeID == 1) {
      // this.setMandatoryFormControl(genderCtrl, true);
      this.disableFormControl(genderCtrl, false);
      this.setMandatoryFormControl(titleCtrl, true);
      // this.setMandatoryFormControl(lastName, false);
      this.disableFormControl(titleCtrl, false);

      this.doctorForm.patchValue({
        [titleCtrl]: 'Dr.'
      });
    } else {
      this.doctorForm.patchValue({
        [genderCtrl]: '',
        [titleCtrl]: ''
      });
      // this.setMandatoryFormControl(genderCtrl, false);
      this.disableFormControl(genderCtrl, true);
      this.setMandatoryFormControl(titleCtrl, false);
      // this.setMandatoryFormControl(lastName, true);
      this.disableFormControl(titleCtrl, true);
    }
  }
  disableFormControl(controlName, disable) {
    if (!controlName) {
      return;
    }
    const ctrl = this.doctorForm.get(controlName);
    if (disable) { //(ctrl.disabled) {
      ctrl.disable();
    } else {
      ctrl.enable();
    }
  }
  setMandatoryFormControl(controlName, required) {
    if (!controlName) {
      return;
    }
    const ctrl = this.doctorForm.get(controlName);
    if (required) {
      ctrl.setValidators([Validators.required]);
      ctrl.updateValueAndValidity();
    } else {
      ctrl.setValidators([]);
      ctrl.updateValueAndValidity();
    }
  }

  getB2BDoctors(b2bDoctorID = 0) {
    this.b2bDoctorsList = [];
    const _params = {
      B2BDoctorID: b2bDoctorID
    };
    this.spinner.show();
    this.lookupService.getB2BDoctors(_params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // data.forEach(element => {
        //   element.AssociatePanelIDs = '58,62,71,87,97,137,140,145,150,155,162,164,167,172,174';
        //   element.DiscountTypeID = null;
        // });
        this.b2bDoctorsList = data || [];
        // this.b2bDoctors = data || [];

      }
    }, (err) => {
      this.spinner.hide();
    });
  }
  getDoctorSpeciality() {
    this.doctorSpecialityList = [];
    const _params = {
    };
    this.lookupService.getDoctorSpeciality(_params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.doctorSpecialityList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  getPanels() {
    this.panelsList = [];
    const _params = {
      PanelType: 1
    };
    this.lookupService.getPanelByPanelType(_params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.panelsList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }

  submitForm() {
    this.doctorFormSubmitted = true;

    if(this.doctorForm.valid) {
      this.insertUpdate(this.doctorForm.getRawValue());
    } else {
      const invalidFieldNames = [];
      Object.keys(this.doctorForm.controls).forEach((a,i) => {
        if(this.doctorForm.controls[a].errors) {
             invalidFieldNames.push(a);
        }
      })
      this.toastr.warning('Please enter ' + invalidFieldNames.join(', '));
    }
  }

  insertUpdate(values) {
    const params = values;
    params.B2BType = params.B2BTypeID;
    params.DateOfBirth = new Date();
    params.AssociatePanelIDs = (params.AssociatePanelIDs || []).join(',')
    params.DiscountTypeID = params.DiscountTypeID ? 1: 0;
    params.Education = params.Education || "";
    params.Gender = params.Gender || "";
    params.LastName = params.LastName || "";
    params.Email = params.Email || "";
    params.isOnlineReportView = params.isOnlineReportView || false;
    params.QRCodeNumber = false;//this.DrQrData || this.existingQrCodeNumber;
    this.spinner.show();
    this.doctorService.insertUpdateB2BDoctor(params).subscribe( (res:any) => {
      this.spinner.hide();
      if(
        res.StatusCode == 200
        && res.PayLoad
        && res.PayLoad.length
        && res.PayLoad[0].Result !== 0
        && res.PayLoad[0].Result !== '0'
      ) {
        this.toastr.success(res.PayLoad[0].Result || 'Doctor Saved');
        this.resetForm();
        this.getB2BDoctors();  
      } else {
        this.toastr.error('Error Saving Doctor Information');
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
    })
  }
  getB2BDoctorID = true;
  B2BDoctorID : any;
  edit(doctor) {
   console.log("🚀edit ~ doctor:", doctor);
   this.B2BDoctorID = doctor.B2BDoctorID
   this.doctorFullName = doctor.FullName;
   console.log("this.doctorFullName::::",this.doctorFullName)

    this.showAddB2BDoctorForm(true);
    doctor.IsDeleted = doctor.IsDeleted ? 1 : 0;
    this.doctorForm.patchValue(doctor);
    this.doctorForm.patchValue({
      AssociatePanelIDs:  doctor.AssociatePanelIDs ? (doctor.AssociatePanelIDs || '').split(',').map(a => +a) : [],
      DiscountTypeID: doctor.DiscountTypeID == 1 ? true : false
    });
    this.spinner.show(this.spinnerRefs.DocDrGen);
    setTimeout(() => {
      this.getB2BDoctorID = false;
      this.bTobDoctorsData = doctor;
      this.QRCodeNumber = doctor.QRCodeNumber.toString();
    this.spinner.hide(this.spinnerRefs.DocDrGen);
    }, 200);
    this.b2bTypeChangedEvent();
    //Add Ref By Doc
    // this.bTobPanelName = doctor.FullName
    // let getSelectedPanel = this.refByB2BDoctorsMapping.find(f => f.B2BDoctorID == doctor.B2BDoctorID)
    // // let find = this.refByDoctors.find(a => a.RefId == getSelectedPanel.RefId);
    // this.isB2BDocDisabled = false;
    // this.form.patchValue({
    //   // RefByDoc: this.refByDoctors.find(a => a.RefId == doctor.RefId) || '',
    //   // RefId: getSelectedPanel.RefId || '',
    //   B2BDoctorID: doctor.B2BDoctorID,
    //   AssignForcefully: 1
    // });
    // this.refByChanged({item: getSelectedPanel});
  }

  delete(doctor) {
    // if(confirm('Are you sure, you want to proceed?')) {
      doctor.IsDeleted = 1;
      this.insertUpdate(doctor);
    // }
  }

  insertPanelUserForAssociation() {
    const formValues = this.insertPanelform.getRawValue();
    const panelUserIdArray = Array.isArray(formValues.PanelUserId)
      ? formValues.PanelUserId
      : formValues.PanelUserId
      ? [formValues.PanelUserId]
      : [];
  
    // Prevent submission if no items are selected
    if (panelUserIdArray.length === 0) {
      this.toastr.error("Please select panel from the dropdown.");
      return;
    }

    const params = {
      PanelUserIDs: panelUserIdArray.join(","),
      PanelId: -1,
      B2BDoctorID: this.B2BDoctorID,
    };
  
    console.log("🚀 Obj params:", params);
    this.spinner.show(this.spinnerRefs.searchTable);
  
    this.Billing.insertPanelUserForAssociation(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
  
        if (res.StatusCode === 200) {
          this.toastr.success("Panel user saved successfully"); // Success message
          // const data = JSON.parse(res.PayLoadStr) || [];
          // if (data[0].Result == 1) {
          //   this.toastr.success("Panel user saved successfully"); // Success message
          //   this.insertPanelform.patchValue({ PanelUserId: [] }); // Clear the dropdown
          // } else {
          //   this.toastr.error(res.Message);
          // }
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable);
      }
    );
  }

 


  resetForm() {
    this.doctorFormSubmitted = false;
    this.doctorForm.reset();
    this.bTobPanelName=null;
    this.getB2BDoctorID = true;
    this.form.reset();
    this.doctorForm.patchValue({
      B2BDoctorID: null,
      Title: 'Dr.',
      CreatedBy: this.loggedInUser.userid,
      IsDeleted: 0
    })
    this.QRCodeNumber = '';
    this.b2bTypeChangedEvent();
  }

  //Doctors Mapping
  
  // refByChanged(e = null) {
  //   this.ngbTypeahead_config.change(e);
  // }

  // getRefByB2bDoctorsMapping(refId = 0) {
  //   this.refByB2BDoctorsMapping = [];
  //   let _params = {
  //     refId: refId ? refId : null
  //   };
  //   this.spinner.show();
  //   this.doctorService.getRefByB2BDoctorsMapping(_params).subscribe((res: any) => {
  //     this.spinner.hide();
  //     if (res && res.StatusCode == 200 && res.PayLoad) {
  //       let data = res.PayLoad;
  //       try {
  //         data = JSON.parse(data);
  //       } catch (ex) { }
  //       console.log(data);
  //       this.refByB2BDoctorsMapping = data || [];
  //       console.log("🚀 this.refByB2BDoctorsMapping:", this.refByB2BDoctorsMapping)
  //     }
  //   }, (err) => {
  //     this.spinner.hide();
  //     console.log(err);
  //   });
  // }

  // save() {
  //   this.formSubmitted = true;
  //   this.form.patchValue({
  //     CreatedBy: this.loggedInUser.userid,
  //     AssignForcefully: this.form.value.AssignForcefully == 1 ? 1 : 0
  //   });
  //   if(!this.form.valid) {
  //     this.toastr.warning('Please select Ref By and B2b Doctors');
  //     return;
  //   }
  //   console.log(this.form, this.form.valid)
  //   let params = JSON.parse(JSON.stringify(this.form.value));
  //   delete params.RefByDoc;
  //   this.spinner.show();
  //   this.doctorService.insertRefByB2BDoctorsMapping(params).subscribe( (res:any) => {
  //     this.spinner.hide();
  //     this.form.patchValue({
  //       AssignForcefully: 0
  //     });
  //     if(res && res.StatusCode == 200) {
  //       if(!res.PayLoad.length) {
  //         this.toastr.success('Doctors mapped');
  //         this.reset();
  //         this.getRefByB2bDoctorsMapping();
  //         this.getB2BDoctors();
  //       } else {
  //         this.toastr.warning('Mapped to: <br><b>' +  res.PayLoad.map(a => a.Name).join('<br>') + '</b>', 'Already mapped', {enableHtml: true});
  //         console.log('Already Mapped ' , res.PayLoad);
  //       }
  //     } else {
  //       this.toastr.error('Error mapping doctor');
  //     }
  //   } , (err) => {
  //     this.spinner.hide();
  //     this.form.patchValue({
  //       AssignForcefully: 0
  //     });
  //   });
  // }

  // reset() {
  //   this.isB2BDocDisabled = false;
  //   this.bTobPanelName=null;
  //   this.form.reset();
  //   this.resetForm();
  //   // this.form.patchValue({
  //   //   RefByDoc: '',
  //   //   RefId: '',
  //   //   B2BDoctorID: '',
  //   //   CreatedBy: '',
  //   //   AssignForcefully: ''
  //   // });
  //   this.formSubmitted = false;
  // }

  // getRefByDoctors() {
  //   this.refByDoctors = [];
  //   let _params = {};
  //   this.spinner.show();
  //   this.lookupService.getRefByDoctors(_params).subscribe((res: any) => {
  //     this.spinner.hide();
  //     if (res && res.StatusCode == 200 && res.PayLoad) {
  //       let data = res.PayLoad;
  //       try {
  //         data = JSON.parse(data);
  //       } catch (ex) { }
  //       // console.log(data);
  //       this.refByDoctors = data || [];
  //     }
  //   }, (err) => {
  //     this.spinner.hide();
  //     console.log(err);
  //   });
  // }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

  onTabChanged($event) {
    // let clickedIndex = $event.index;
    console.log('onTabChanged ', $event, $event.index);
    switch($event.index) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      default:
        console.log('default');
    }
  }

  PanelUserId = null;
  doctorFullName = '';
  InsertUpdatePanelUser() {
    if (this.userCreationForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const formValues = this.userCreationForm.getRawValue();
    const isUpdating = !!this.PanelUserId; // Check if updating

    const params = {
      PanelUserId: isUpdating ? this.PanelUserId : null, // Ensure correct ID handling
      Username: formValues.Username || null,
      Password: formValues.Password,
      PasswordHash: formValues.Password || null,
      FullName: this.doctorFullName || null,
      Cell: formValues.Cell || null,
      Phone: formValues.Phone || null,
      Email: formValues.Email || "",
      CreatedBy: this.loggedInUser.userid || -1,
      UserType: 2, // 1 = PanelUser, 2 = B2B User
    };
    console.log("🚀 PanelUserId Before API Call:", this.PanelUserId); 
    console.log("🚀 Obj params:", params);

    this.spinner.show(this.spinnerRefs.searchTable);

    this.Billing.InsertUpdatePanelUser(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200) {
          const data = JSON.parse(res.PayLoadStr) || [];
          if (data[0].Result == 1) {
            this.toastr.success(isUpdating ? "User updated successfully!" : "User added successfully!");
            
            // Remove the old entry from the list before updating
            this.panelUsersDataList = this.panelUsersDataList.filter(
              (user) => user.PanelUserId !== this.PanelUserId
            );

            // Fetch the latest updated list
            this.getPanelUsersData();
            this.cancelEdit();
          } else {
            this.toastr.error(res.Message);
          }
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable);
      }
    );
}

edit_User(user: any) {
  console.log("🚀 Editing User:", user); // Check if user data is received

  this.PanelUserId = user.PanelUserId; // Assign correct ID
  this.doctorFullName = user.FullName; // Ensure full name is set

  this.userCreationForm.patchValue({
      Username: user.Username,
      Password: user.Password,
      Cell: user.Cell,
      Phone: user.Phone,
      Email: user.Email,
  });

  console.log("🚀 PanelUserId Set for Update:", this.PanelUserId);
}

  cancelEdit(): void {
    this.isFormDisabled = true;
    this.isEditing = false;
    this.isSaveEditing = false;
    this.toggleEditFields = true;
    this.userCreationForm.disable();
  }
  refreshForm(): void {
    this.userCreationForm.reset();
    this.PanelUserId = null;
    this.isFormDisabled = true;
    this.rowIndex = null;
  }

  panelUsersDataList = [];

  deleteUser(): void {
    if (this.rowIndex !== null) {
      console.log('Deleting user:', this.panelUsersDataList[this.rowIndex]);
      this.panelUsersDataList.splice(this.rowIndex, 1);
      this.DeletePanelUserByPanelUserId();
      this.refreshForm();
    }
    else{
      this.toastr.warning("Please select user first");
    }
  }
  DeletePanelUserByPanelUserId() {
    if (!this.PanelUserId) {
      this.toastr.warning("Please Provide Panel UserId");
      return;
    }
    const params = {
      PanelUserId: this.PanelUserId,
      IsDeleted: 1,
      CreatedBy: this.loggedInUser.userid || -1,
    };
    this.spinner.show(this.spinnerRefs.insertForm)
    this.Billing.DeletePanelUserByPanelUserId(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.insertForm)
      if (res.StatusCode === 200) {
        this.toastr.success(res.Message,"Record deleted successfully");
        this.getPanelUsersData();
      }
      else {
        this.toastr.error(res.ErrorDetails);
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.insertForm)
    })
  }
  getPanelUsersData() {
    this.panelUsersDataList = [];
    const params = {};
    this.spinner.show(this.spinnerRefs.searchTable);

    this.Billing.GetPanelUsers(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200) {
          const uniqueUsers = new Map(); // Using a Map to ensure uniqueness by PanelUserId

          res.PayLoad.forEach((user) => {
            if (user.UserType === 2) {
              uniqueUsers.set(user.PanelUserId, user); // Only keeps the latest value for each PanelUserId
            }
          });

          this.panelUsersDataList = Array.from(uniqueUsers.values());

          if (!this.panelUsersDataList.length) {
            this.toastr.info("No record found");
          }
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable);
      }
    );
}
  getTableDate(data: any, index: number): void {
    console.log("🚀 ~ ManagePanelUsersComponent ~ getTableDate ~ data:", data)
    this.cancelEdit(); // Reset any editing state
    this.rowIndex = index;
    this.PanelUserId = data.PanelUserId;
    setTimeout(() => {
      this.getPanelUsersDetails();
    }, 100);
    // this.userCreationForm.patchValue(data); // Populate the form
    this.isFormDisabled = true; // Keep fields disabled
  }

  panelUsersDatiels = [];
  
  getPanelUsersDetails() {
    this.panelUsersDatiels = [];

    if (!this.PanelUserId) {
      this.toastr.warning("Please Provide Panel UserId");
      return;
    }

    const params = {
      PanelUserId: this.PanelUserId
    };
    this.spinner.show(this.spinnerRefs.insertForm)
    this.Billing.GetPanelUserDetailByPanelUserID(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.insertForm)
      if (res.StatusCode === 200) {
        if (res.PayLoad.length) {
          this.panelUsersDatiels = res.PayLoad;
          //  this.userCreationForm.patchValue(this.panelUsersDatiels[0]);
          const userDetails = { ...this.panelUsersDatiels[0] };
          userDetails.Password = 'DummyPassword@123';
          this.userCreationForm.patchValue(userDetails);
        }
        else {
          this.toastr.info('No record found');
        }
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.insertForm)
    })
  }
  editUser(): void {
    this.isFormDisabled = false; // Enable fields for editing
    this.userCreationForm.enable();
    this.isEditing = true; // Mark as editing
    this.toggleEditFields = false;
  }
  
  validateDiscountRange(event: any): void {
    const inputValue = parseFloat(event.target.value);
    if (inputValue < 0) {
      event.target.value = 0;
      this.doctorForm.get('Discount')?.setValue(0);
    } else if (inputValue > 100) {
      this.toastr.warning('Disocunt limit is 100%');
      event.target.value = 0;
      this.doctorForm.get('Discount')?.setValue(0);
    }
  }

private getQrDataUrl(): string | null {
  if (!this.qrWrapper?.nativeElement) {
    return null;
  }

  const wrapper: HTMLElement = this.qrWrapper.nativeElement;

  // 1) Try canvas first
  const canvas = wrapper.querySelector('canvas') as HTMLCanvasElement | null;
  if (canvas) {
    return canvas.toDataURL('image/png');
  }

  // 2) Try img if library renders image
  const img = wrapper.querySelector('img') as HTMLImageElement | null;
  if (img?.src) {
    return img.src;
  }

  // 3) Try svg
  const svg = wrapper.querySelector('svg') as SVGElement | null;
  if (svg) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    return URL.createObjectURL(svgBlob);
  }

  return null;
}

downloadQRCode() {
  setTimeout(() => {
    const dataUrl = this.getQrDataUrl();

    if (!dataUrl) {
      this.toastr.error('QR code is not ready yet');
      return;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QRCode_${this.QRCodeNumber || 'QR'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // cleanup for blob url
    if (dataUrl.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
    }
  }, 300);
}

printQRCode() {
  setTimeout(() => {
    const dataUrl = this.getQrDataUrl();

    if (!dataUrl) {
      this.toastr.error('QR code is not ready yet');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=700,height=700');

    if (!printWindow) {
      this.toastr.error('Popup blocked. Please allow popups.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 30px;
              text-align: center;
              font-family: Arial, sans-serif;
              background: #fff;
            }
            .wrap {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 90vh;
            }
            img {
              width: 260px;
              height: 260px;
              object-fit: contain;
            }
            .code-text {
              margin-top: 12px;
              font-size: 16px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="wrap">
            <img src="${dataUrl}" alt="QR Code" />
            <div class="code-text">${this.QRCodeNumber || ''}</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, 300);
}

}
