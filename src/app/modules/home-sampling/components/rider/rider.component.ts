// @ts-nocheck
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RiderService } from '../../services/rider.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { Conversions } from '../../../shared/helpers/conversions';
import { CONSTANTS } from '../../../shared/helpers/constants';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';

@Component({
  standalone: false,

  selector: 'app-rider',
  templateUrl: './rider.component.html',
  styleUrls: ['./rider.component.scss']
})
export class RiderComponent implements OnInit {
  ButtonClip: boolean = false;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  ActionLabel = "Save"
  spinnerRefs = {
    formSection: 'formSection',
    listSection: 'listSection',
    employeesLoadingSection: 'employeesLoadingSection'
  }
  RiderID: any = 0;
  EmpNumber: any = null;
  EmployeeRow: any = [];
  DisableAllfields: boolean = false;
  isRider: boolean = false;
  NotationsList = [];
  RiderList = [];
  RiderRow: any[];
  searchText = '';
  citesList: any[];
  cityAreasList: any[];
  ishShowPassMessage: boolean = false;
  SampleCenters: any[];
  VehicleTypesList: any[];
  mobileOperatorList: any[];
  EmployeePic: any;
  HCUserType: any = [];
  isActive: any = 1;
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private riderService: RiderService,
    private lookupService: LookupService,
    private auth: AuthService,
    private sharedService: SharedService,
    private helperSrv: HelperService,
  ) { }
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  RiderForm = this.fb.group({
    HcStaffType: ['', ''],
    EmpNumber: [,],
    EmployeeNumber: ['',],
    NotationId: ['',],
    IsExternal: ['',],
    FirstName: ['',],
    LastName: ['',],
    CNIC: ['',],
    Email: ['',],
    Cell: ['',],
    ReferenceContactNo: ['',],

    RiderLicense: ['',],
    LicenseExpiryDate: [,],
    Registration: ['',],
    VehicleType: ['',],

    UserName: ['',],
    RiderEmpId: ['',],
    UserId: ['',],
    Password: ['',],
    CityID: [,],
    IOrgCityAreaID: [,],
    LocId: [,],
    MobileOperatorID: ['',],
  });
  loggedInUser: UserModel;
  ActionButtonText: string = 'Save';
  ActionButtonIcon: string = 'fa fa-save';
  employeesList = [];
  licenseDocs = [];
  ld = [];

  ngOnInit(): void {
    this.getEmployees();
    this.disablefields();
    this.getNotationList();
    this.loadLoggedInUserInfo();
    this.getRider(0);
    this.getHCCities();
    this.getHomeCollectionCentre();
    this.getVehicleTypes();
    this.getMobileOperator();
    this.getHCUserType();
  }
  getRider(riderID) {
    this.spinner.show(this.spinnerRefs.listSection);
    this.RiderList = [];
    // let formValues = this.formRider.getRawValue();
    let objParm = {
      RiderID: riderID
    }
    this.riderService.getRider(objParm).subscribe((res: any) => {
      let resRider = res.PayLoadDS.Table || [];
      if (res.StatusCode == 200) {
        this.RiderList = resRider || [];
      }
    }, (err) => {
      console.log("loading search result error", err);
    })
    this.spinner.hide(this.spinnerRefs.listSection);
  }
  getHCUserType() {
    this.spinner.show(this.spinnerRefs.listSection);
    this.HCUserType = [];
    // let formValues = this.formRider.getRawValue();

    this.riderService.getHCUserType().subscribe((res: any) => {
      let resRider = res.PayLoad || [];
      if (res.StatusCode == 200) {
        this.HCUserType = resRider || [];
      }
    }, (err) => {
      console.log("loading search result error", err);
    })
    this.spinner.hide(this.spinnerRefs.listSection);
  }

  rowIndex = null;
  getRiderByID(riderID,i) {
    this.rowIndex = i;
    this.ld = []
    this.ActionButtonText = "Update";
    this.ActionButtonIcon = "fa fa-edit";
    this.ButtonClip = true;
    this.spinner.show(this.spinnerRefs.formSection);
    this.RiderRow = [];
    // let formValues = this.formRider.getRawValue();
    let objParm = {
      RiderID: riderID
    }
    this.riderService.getRider(objParm).subscribe((res: any) => {
      let resRider = res.PayLoadDS.Table || [];
      if (res.StatusCode == 200) {
        this.RiderRow = resRider || [];

        this.ld = this.helperSrv.addPrefixToDocs(res.PayLoadDS.Table1);
        if (this.RiderRow[0]["RiderType"] == 2) {
          this.RiderForm.reset({
            NotationId: { value: 0, disabled: false },
            FirstName: { value: '', disabled: false },
            LastName: { value: '', disabled: false },
            CNIC: { value: '', disabled: false },
            Email: { value: '', disabled: false },
            Cell: { value: '', disabled: false },
            ReferenceContactNo: { value: '', disabled: false },
            MobileOperatorID: { value: '', disabled: false },
            UserName: { value: '', disabled: true },
            EmpNumber: { value: '', disabled: true },
            CityID: { value: '', disabled: false },
            IOrgCityAreaID: { value: '', disabled: false },
            LocId: { value: '', disabled: false },
            EmployeeNumber: { value: '', disabled: false },
          });
        } else {
          this.RiderForm.reset({
            NotationId: { value: 0, disabled: true },
            FirstName: { value: '', disabled: true },
            LastName: { value: '', disabled: true },
            CNIC: { value: '', disabled: true },
            Email: { value: '', disabled: true },
            Cell: { value: '', disabled: true },
            // ReferenceContactNo: { value: '', disabled: true },
            MobileOperatorID: { value: '', disabled: true },
            UserName: { value: '', disabled: true },
            EmpNumber: { value: '', disabled: true },
            CityID: { value: '', disabled: false },
            IOrgCityAreaID: { value: '', disabled: false },
            LocId: { value: '', disabled: false },
            EmployeeNumber: { value: '', disabled: true },
          });
        }
        this.RiderForm.patchValue({
          HcStaffType: this.RiderRow[0]["HCUserTypeID"],
          NotationId: this.RiderRow[0]["NotationID"],
          EmpNumber: (this.RiderRow[0]["RiderType"] == 1) ? this.RiderRow[0]["RiderEmpNo"].toString() : "",
          FirstName: this.RiderRow[0]["RiderFirstName"],
          LastName: this.RiderRow[0]["RiderLastName"],
          CNIC: this.RiderRow[0]["CNIC"],
          Email: this.RiderRow[0]["Email"],
          Cell: this.RiderRow[0]["RiderCell"],
          // ReferenceContactNo: this.RiderRow[0]["ReferenceContactNo"],
          ReferenceContactNo: (this.RiderRow[0]["ReferenceContactNo"] || "").toString().replace(/\D/g, ''),
          MobileOperatorID: this.RiderRow[0]["MobileOperatorID"],
          UserName: this.RiderRow[0]["UserName"],
          RiderEmpId: this.RiderRow[0]["RiderEmpID"],
          UserId: this.RiderRow[0]["UserID"],
          CityID: this.RiderRow[0]["CityID"] || null,
          IOrgCityAreaID: this.RiderRow[0]["IOrgCityAreaID"] || null,

          RiderLicense: this.RiderRow[0]["RiderLicense"] || null,
          LicenseExpiryDate: Conversions.getDateObjectByGivenDate(this.RiderRow[0]["LicenseExpiryDate"]) || null,
          Registration: this.RiderRow[0]["Registration"] || null,
          VehicleType: this.RiderRow[0]["VehicleTypeID"] || null,

          LocId: this.RiderRow[0]["LocId"] || null,
        });

        if (this.RiderRow[0]["RiderType"] == 2) {
          this.isRider = true;
          this.disabledButton = false;
        } else {
          this.isRider = false;
          this.disabledButton = true

        }
        // ✅ Make ReferenceContactNo required in this case
        this.RiderForm.get('ReferenceContactNo')?.setValidators([Validators.required]);
        this.RiderForm.get('ReferenceContactNo')?.updateValueAndValidity();
        
        this.RiderID = this.RiderRow[0]["RiderID"]
        if (this.RiderID == 0) {
          setTimeout(() => {
            this.RiderForm.reset({
              EmpNumber: { value: '', disabled: false },
            });
          }, 100);
        }
        this.EmpNumber = this.RiderRow[0]["RiderEmpNo"]
        if (this.RiderRow[0]["CityID"] != null) {
          this.getCityAreas(this.RiderRow[0]["CityID"]);
          if (this.RiderRow[0]["IOrgCityAreaID"] != null) {
            this.RiderForm.patchValue({
              IOrgCityAreaID: this.RiderRow[0]["IOrgCityAreaID"],
            })
          }
        }

        if (this.RiderRow[0]["RiderPicBase64"] && (this.RiderRow[0]['RiderPicBase64'] != "" || this.RiderRow[0]['RiderPicBase64'] != null)) {
          this.EmployeePic = this.RiderRow[0]['RiderPicBase64'];
        } else {
          this.EmployeePic = "";
        }
        this.spinner.hide(this.spinnerRefs.formSection);
      }
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.formSection);
    })

  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getNotationList() {
    this.NotationsList = [];
    this.lookupService.getNotationList().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.NotationsList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }

  addUpdateRider() {
    this.spinner.show(this.spinnerRefs.formSection);
    let formValues = this.RiderForm.getRawValue();
    this.RiderForm.markAllAsTouched();

    if (this.RiderForm.invalid) {
      this.spinner.hide(this.spinnerRefs.formSection);
      this.toastr.warning('Please fill the required fields...!'); return;
    } else {
      if ((formValues.UserName == "" || formValues.UserName == null) && this.isRider) {
        this.toastr.error('Please provide Username');
        this.spinner.hide(this.spinnerRefs.formSection); return;
      } else if ((formValues.UserName == "" || formValues.UserName == null) && !this.isRider) {
        this.toastr.error('Please contact HR for Login Credentials');
        this.spinner.hide(this.spinnerRefs.formSection); return;
      } else {
        let uid = formValues.UserId != null ? formValues.UserId : 0;
        this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
        this.isSpinner = false; // Button Spinner show
        this.ld = this.licenseDocs;
        let generalLD = this.ld.map((val) => {
          return {
            "GDocumentID": val.docId,
            "GDocTitle": val.fileName,
            "Remarks": null,
            "RefId": null,
            "GDocTypeId": 7,
            "GDocumentPic": val.data.toString().replace(val.data.substring(0, val.data.indexOf(",") + 1), ''),
            "GDocBase64": val.data,
            "GDocBase64Thumbnail": val.thumbnail,
            "GDocType": val.fileType
          }
        })
        let formData = {
          RiderID: this.RiderID,
          NotationId: formValues.NotationId || 0,
          RiderFirstName: formValues.FirstName,
          RiderLastName: formValues.LastName,
          RiderEMail: formValues.Email || null,
          RiderCell: formValues.Cell,
          ReferenceContactNo: formValues.ReferenceContactNo,
          MobileOperatorID: formValues.MobileOperatorID,
          CNIC: formValues.CNIC,
          RiderEmpID: formValues.RiderEmpId != null ? formValues.RiderEmpId : 0,
          RiderEmpNo: this.EmpNumber != null ? this.EmpNumber : 0,
          UserID: formValues.UserId != null ? formValues.UserId : 0,
          // RiderType: (!this.isRider) ? 1 : 2 || -99,
          RiderType: ((!this.isRider) ? 1 : 2) || -99,
          RiderUserName: formValues.UserName,
          RiderUserPassword: (this.isRider && formValues.Password != '') ? formValues.Password : null,
          CityID: formValues.CityID || null,
          IOrgCityAreaID: formValues.IOrgCityAreaID || null,
          LocId: formValues.LocId || null,
          RiderLicense: formValues.RiderLicense || null,
          LicenseExpiryDate: formValues.LicenseExpiryDate ? Conversions.formatDateObject(formValues.LicenseExpiryDate) : null,
          Registration: formValues.Registration || null,
          VehicleType: formValues.VehicleType || 0,
          RiderPicBase64: (this.EmployeePic != "" && (this.RiderID == 0 || this.RiderID != '')) ? this.EmployeePic : "",
          CreatedBy: this.loggedInUser.userid || -99,
          tblGeneralDocument: generalLD,
          HCUserTypeID: formValues.HcStaffType
        };

        this.riderService.addUpdateRider(formData).subscribe((data: any) => {
          this.spinner.hide(this.spinnerRefs.formSection);
          if (JSON.parse(data.PayLoadStr).length) {
            let res = JSON.parse(data.PayLoadStr);
            if (data.StatusCode == 200) {
              this.EmployeePic = "";
              this.ld = [];
              if (res[0].Result == 1) {
                this.toastr.success(data.Message);
              } else if (res[0].Result == 2) {
                this.toastr.info(data.Message);
              } else {
                this.toastr.success(data.Message);
              }
              this.getRider(0);
              this.clearForms();
              this.disabledButton = false; // Enable button again
              this.isSpinner = true; // Hide button spinner
              this.ActionButtonText = "Save"
            } else {
              this.toastr.error(data.Message)
              this.spinner.hide(this.spinnerRefs.formSection);
              this.disabledButton = false; // Enable button again
              this.isSpinner = true; // Hide button spinner
            }
            this.ishShowPassMessage = false;
          }
        }, (err) => {
          console.log(err);
        })
      }
    }
  }
  clearForms() {
    this.licenseDocs = [];
    this.EmployeePic = ""
    this.RiderForm.reset();
    this.RiderID = 0;
    this.ActionLabel = "Save";
    this.isRider = false;
    this.RiderForm.reset({
      NotationId: { value: 0, disabled: false },
      FirstName: { value: '', disabled: false },
      LastName: { value: '', disabled: false },
      CNIC: { value: '', disabled: false },
      Email: { value: '', disabled: false },
      Cell: { value: '', disabled: false },
      ReferenceContactNo: { value: '', disabled: false },
      MobileOperatorID: { value: '', disabled: false },
      UserName: { value: '', disabled: false },
      EmpNumber: { value: '', disabled: false },
      CityID: { value: '', disabled: false },
      IOrgCityAreaID: { value: '', disabled: false },
    });
    this.RiderForm.patchValue({
      Password: ['']
    })
  }

  loadEmployee(EmpNumber) {
    this.isRider = false;
    this.DisableAllfields = true;
    this.ishShowPassMessage = true;
    this.spinner.show(this.spinnerRefs.formSection);
    this.EmpNumber = EmpNumber;
    if (this.EmpNumber == null || this.EmpNumber == '') {
      this.spinner.hide(this.spinnerRefs.formSection);
      this.toastr.warning('Please provide a valid Employee Number...!'); return false;
    } else {
      this.isRider = false;
      this.disablefields()
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      this.isSpinner = false; // Button Spinner shwo
      let objParam = {
        EmpId: this.EmpNumber,
      };
      this.riderService.GetEmployeeByEmpNo(objParam).subscribe((resp: any) => {
        this.EmployeeRow = resp.PayLoad || [];
        if (resp.PayLoad) {
          this.RiderForm.patchValue({
            HcStaffType: this.EmployeeRow[0]["HCUserTypeID"],
            NotationId: this.EmployeeRow[0]["NotationID"],
            FirstName: this.EmployeeRow[0]["DspName"],
            LastName: this.EmployeeRow[0]["LastName"],
            CNIC: this.EmployeeRow[0]["CNIC"],
            Email: this.EmployeeRow[0]["Email"],
            Cell: this.EmployeeRow[0]["Cell"],
            ReferenceContactNo: this.EmployeeRow[0]["ReferenceContactNo"],
            MobileOperatorID: this.EmployeeRow[0]["MobileOperatorId"],
            UserName: this.EmployeeRow[0]["UserName"],
            RiderEmpId: this.EmployeeRow[0]["EmpId"],
            UserId: this.EmployeeRow[0]["UserId"],
            CityID: this.EmployeeRow[0]["CityID"] || null,
            LocId: this.EmployeeRow[0]["LocId"] || null,
            IOrgCityAreaID: this.EmployeeRow[0]["IOrgCityAreaID"] || null,
            EmployeeNumber: "",
          });
          if (this.EmployeeRow[0]['EmployeePic']) {
            this.EmployeePic = 'data:image/png;base64,' + this.EmployeeRow[0]["EmployeePic"];
          } else {
            this.EmployeePic = "";
          }
          this.spinner.hide(this.spinnerRefs.formSection);
        }

      }, (err) => {
        console.log(err);
      })
      this.disabledButton = false; // Enable button again
      this.isSpinner = true; // Hide button spinner
    }
  }

  loadEmployeeByEmployeeID(EmpNumber) {
    this.ishShowPassMessage = true;
    this.spinner.show(this.spinnerRefs.formSection);
    // this.EmpNumber = (EmpNumber!='' || EmpNumber) ? EmpNumber.replace('IDC-','').replace('IDC','').replace('idc-','').replace('idc',''):'' ||'';
    if (EmpNumber != '' || EmpNumber != null) {
      this.EmpNumber = EmpNumber.replace('IDC-', '').replace('IDC', '').replace('idc-', '').replace('idc', '');
    } else {
      this.EmpNumber = "";
    }
    if (this.EmpNumber == null || this.EmpNumber == '') {
      this.spinner.hide(this.spinnerRefs.formSection);
      this.toastr.warning('Please provide a valid Employee Number...!'); return false;
    } else {
      this.disablefields()
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      this.isSpinner = false; // Button Spinner shwo
      let objParam = {
        EmpId: this.EmpNumber,
      };
      this.riderService.GetEmployeeByEmpNo(objParam).subscribe((resp: any) => {
        this.EmployeeRow = resp.PayLoad || [];
        if (resp.PayLoad) {
          this.RiderForm.patchValue({
            HcStaffType: this.EmployeeRow[0]["HCUserTypeID"],
            NotationId: this.EmployeeRow[0]["NotationID"],
            FirstName: this.EmployeeRow[0]["DspName"],
            LastName: this.EmployeeRow[0]["LastName"],
            CNIC: this.EmployeeRow[0]["CNIC"],
            Email: this.EmployeeRow[0]["Email"],
            Cell: this.EmployeeRow[0]["Cell"],
            ReferenceContactNo: this.EmployeeRow[0]["ReferenceContactNo"],
            MobileOperatorID: this.EmployeeRow[0]["MobileOperatorId"],
            UserName: this.EmployeeRow[0]["UserName"],
            RiderEmpId: this.EmployeeRow[0]["EmpId"],
            UserId: this.EmployeeRow[0]["UserId"],
            CityID: this.EmployeeRow[0]["CityID"] || null,
            IOrgCityAreaID: this.EmployeeRow[0]["IOrgCityAreaID"] || null,
            EmpNumber: '',
          });
          if (this.EmployeeRow[0]['EmployeePic'] != "") {
            this.EmployeePic = 'data:image/png;base64,' + this.EmployeeRow[0]["EmployeePic"];
          } else {
            this.EmployeePic = "";
          }
          this.spinner.hide(this.spinnerRefs.formSection);
        }

      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.formSection);
      })
      this.disabledButton = false; // Enable button again
      this.isSpinner = true; // Hide button spinner
    }
  }

  disablefields() {
    this.DisableAllfields = true
  }
  public externalRider(value: boolean) {
    this.isRider = value;
    if (this.isRider == true) {
      this.DisableAllfields = false;
      this.ishShowPassMessage = false;
      this.ButtonClip = true;
      this.RiderID = 0;
      setTimeout(() => {
        this.RiderForm.reset({
          NotationId: { value: '', disabled: false },
          FirstName: { value: '', disabled: false },
          MiddleName: { value: '', disabled: false },
          LastName: { value: '', disabled: false },
          CNIC: { value: '', disabled: false },
          Email: { value: '', disabled: false },
          Cell: { value: '', disabled: false },
          ReferenceContactNo: { value: '', disabled: false },
          MobileOperatorID: { value: '', disabled: false },
          UserName: { value: '', disabled: false },
          EmpNumber: { value: '', disabled: true },
          EmployeeNumber: { value: '', disabled: true },
          CityID: { disabled: false },
          IOrgCityAreaID: { disabled: false },
        });
        this.EmployeePic = '';
      }, 100);
    } else {
      this.ButtonClip = false;
      setTimeout(() => {
        this.RiderForm.reset({
          NotationId: { value: '', disabled: true },
          FirstName: { value: '', disabled: true },
          MiddleName: { value: '', disabled: true },
          LastName: { value: '', disabled: true },
          CNIC: { value: '', disabled: true },
          Email: { value: '', disabled: true },
          Cell: { value: '', disabled: true },
          ReferenceContactNo: { value: '', disabled: true },
          MobileOperatorID: { value: '', disabled: true },
          UserName: { value: '', disabled: true },
          EmpNumber: { value: '', disabled: false },
          EmployeeNumber: { value: '', disabled: false },
        });
      }, 100);
    }
  }


  getHCCities() {
    this.citesList = []
    let objParam = {
      isHomeSamplingCity: 1
    }
    this.lookupService.getHCCities(objParam).subscribe((resp: any) => {
      this.citesList = resp.PayLoad || [];
      if (!this.citesList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getAreasByCityID(event) {
    this.getCityAreas(event.CityID)
  }
  getCityAreas(CityID) {
    this.cityAreasList = []
    let objParam = {
      CityID: CityID
    }
    this.lookupService.getHCCityAreas(objParam).subscribe((resp: any) => {
      this.cityAreasList = resp.PayLoad || [];
      if (!this.cityAreasList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }
  newRider() {
    this.EmployeePic = "";
    this.ActionButtonText = "Save";
    this.ActionButtonIcon = "fa fa-save";
    this.RiderID = 0;
    this.isRider = false;
    this.ishShowPassMessage = false;
    this.EmpNumber = null;
    this.ButtonClip = false;
    this.disabledButton = false;
    this.licenseDocs = [];
    this.ld = [];

    this.RiderForm.reset({
      NotationId: { value: 0, disabled: true },
      FirstName: { value: '', disabled: true },
      LastName: { value: '', disabled: true },
      CNIC: { value: '', disabled: true },
      Email: { value: '', disabled: true },
      Cell: { value: '', disabled: true },
      ReferenceContactNo: { value: '', disabled: true },
      // MobileOperatorID: {value:'', disabled:true},
      UserName: { value: '', disabled: true },
      EmpNumber: { value: '', disabled: false },
      EmployeeNumber: { value: '', disabled: false },
    });
  }
  getEmployees() {
    this.employeesList = [];
    let params = {};
    this.spinner.show(this.spinnerRefs.employeesLoadingSection);
    this.sharedService.getEmployees(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        let empList = JSON.parse(res.PayLoadStr);
        empList = empList.filter(a => !a.RiderID);
        this.employeesList = empList.map(a => ({ EmpId: a.EmpId, EmpNo: a.EmpNo, EmployeeName: a.EmployeeName, UserId: a.UserId, FullName: '[IDC-' + a.EmpNo.padStart(4, '0') + '] ' + a.EmployeeName }));
        this.spinner.hide(this.spinnerRefs.employeesLoadingSection);
      } else {
        this.employeesList = []
        this.spinner.hide(this.spinnerRefs.employeesLoadingSection);
      }

    }, (err) => {
      this.spinner.hide();
    })
  }

  getHomeCollectionCentre() {
    this.citesList = []
    // let objParam = {
    //   // having no params for the time being
    // }
    this.lookupService.GetBranches().subscribe((resp: any) => {
      this.SampleCenters = resp.PayLoad || [];
      if (!this.SampleCenters.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getVehicleTypes() {
    this.VehicleTypesList = []
    let objParam = {
    }
    this.lookupService.getVehicleTypes(objParam).subscribe((resp: any) => {
      this.VehicleTypesList = resp.PayLoad || [];
      if (!this.VehicleTypesList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getMobileOperator() {
    this.mobileOperatorList = [];
    this.lookupService.getMobileOperator().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.mobileOperatorList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }

  getMobileOperatorByCode(mobileNo) {
    let params = {
      mobileCode: (mobileNo || this.RiderForm.value.MobileNO || '')
    }
    if (params.mobileCode && params.mobileCode.length > 3) {
    } else {
      return;
    }
    this.spinner.show();
    this.lookupService.getMobileOperatorByCode(params).subscribe((res: any) => {
      this.spinner.hide();
      // console.log(res);
      if (res && res.StatusCode == 200) {
        if (res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(res.PayLoad);
          } catch (e) { }
          if (data && data.length) {
            this.RiderForm.patchValue({
              MobileOperatorID: (data[0].Column1 || '')
            })
          }
        }
        // this.mobileOperatorList = res.payLoad;
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);

    });

  }

  getLoadedDocs(e) {
    this.licenseDocs = e;
  }
  clearImageData() {
    this.EmployeePic = "";
    this.licenseDocs = [];
    this.ld = [];
  }

  inActiveRider(RiderID, isActive) {
    let params = {
      "RiderID": RiderID,
      "IsActive": isActive ? 1 : 0
    }
    this.spinner.show();
    this.riderService.inActiveRider(params).subscribe((resp: any) => {
      this.spinner.hide();
      console.log(resp)
    }, (err) => {
      this.spinner.hide();
      console.log(err)
    });

  }
}