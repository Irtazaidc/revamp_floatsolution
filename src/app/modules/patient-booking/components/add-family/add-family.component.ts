// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit, Input, ViewChild, } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { DiscountCardService } from '../../services/discount-card.service';
import { UserModel } from 'src/app/modules/auth/_models/user.model';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth/_services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Conversions } from '../../../shared/helpers/conversions';
import { PatientService } from '../../services/patient.service';
import { LookupService } from '../../services/lookup.service';
import moment from 'moment';
@Component({
  standalone: false,

  selector: 'app-add-family',
  templateUrl: './add-family.component.html',
  styleUrls: ['./add-family.component.scss']
})
export class AddFamilyComponent implements OnInit {


  @ViewChild('showAddNew') showAddNew;
  @ViewChild('showExistingPatient') showExistingPatient;
  user$: Observable<UserModel>;
  loggedInUser: UserModel;
  advancedSearchEnabled = false;
  searchCardNo = null;
  cardNoValue: any = null;
  cardIdValue: any = null;
  disableAddButton = false;
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  dateFormat = 'DD-MM-YYYY'; //'YYYY-MM-DD';
  maxDate_dob = moment(new Date()).format(this.dateFormat);
  maxDate_dob_bs = { day: moment(new Date()).get('date'), month: (moment(new Date()).get('month') + 1), year: moment(new Date()).get('year') };
  patientSearchParams = {
    PatientID: '',
    VisitId: '',
    CardNo: '',
    MobileNO: ''
  };
  spinnerRefs = {
    associateTable: 'associateTable',
    cardTable: 'cardTable',
  }
  addNewPatient: FormGroup;

  showForm: boolean = false;
  familyCardlist = [];
  familyCardMemberCount: number = 0;
  insertFamilyCardlist = [];
  relationshiplist = [];
  tableValues = [];
  tableValuesForExistingPatient = [];
  gendersList = [];
  salutationsList = [];
  maritalStatusList = [];
  patientId: any;
  OrbitMRN: any;
  RelationshipName = "";
  cardInfoData: any;
  dmyEnum = [
    { id: 1, name: 'day(s)' },
    { id: 2, name: 'mon(s)' },
    { id: 3, name: 'yr(s)' }

  ];

   confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  patientBasicInfoDisabled = null;
  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private appPopupService: AppPopupService,
    private discountCardService: DiscountCardService,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private patientService: PatientService,
    private lookupService: LookupService,
  ) {
    this.addNewPatient = this.fb.group({
      Salutation: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: [''],
      DateOfBirth: ['', Validators.required],
      CNIC: [''],
      dmy: ['', Validators.required],
      Age: ['', Validators.required],
      CellNumber: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      Email: ['', Validators.email],
      Gender: ['', Validators.required]
    });
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRelationshipNames();
    this.getSalutationList();
    this.getMaritalStatus();
    this.getGendersList();
    this.settingSalutionValues();
  }
  ngOnChanges(): void {}

  ngAfterViewInit(){
    this.addNewPatient.get('DateOfBirth').valueChanges.subscribe(val => {
      // console.log('DateOfBirth subscribe ',  val);
      if (val) {
      let selectedDob = new Date(val.year, val.month - 1, val.day); //moment(new Date(`${val.month}-${val.day}-${val.year}`)).format();
      let _ageObj = this.calculateAge(selectedDob);
      // console.log('_ageObj _ageObj _ageObj ', _ageObj);
      
      this.addNewPatient.patchValue({
        //Age: obj.years ? (obj.years + ' years') : obj.months ? (obj.months + ' months') : (obj.days + 'days')
        Age: _ageObj.years ? _ageObj.years : _ageObj.months ? _ageObj.months : _ageObj.days
      });
      this.addNewPatient.patchValue({
        dmy: _ageObj.years ? '3' : _ageObj.months ? '2' : '1'
      });
    }
   }
    );
  }

  calculateAge(birthday) { // birthday is a date
   console.log("🚀 calculateAge ~ birthday:", birthday)
   
    let obj = { days: 0, months: 0, years: 0 }
    // if (!moment(birthday).isValid()) {
    //   return obj;
    // }
    if (!(birthday instanceof Date) || isNaN(birthday.getTime())) {
      return obj;
    }
    let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    let bday: any = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()); //(2021, 3, 2);
    let currentDate: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    let diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
    if (diffDays > 364) {
      obj.years = Math.floor(diffDays / 364);
    } else if (diffDays >= 30) {
      obj.months = Math.floor(diffDays / 30);
    } else {
      obj.days = diffDays;
    }
    return obj;
  }
  calculateDOB(number, dmy) {
    let dob: any = new Date();
    dmy = dmy || '3';
    if (dmy == '1') {
      dob = moment(dob).subtract(number, 'days')
    } else if (dmy == '2') {
      dob = moment(dob).subtract(number, 'months')
    } else if (dmy == '3') {
      dob = moment(dob).subtract(number, 'years')
    }
    let calculatedDob = { day: moment(dob).get('date'), month: (moment(dob).get('month') + 1), year: moment(dob).get('year') };
    return calculatedDob;
    
  }
  ageChange(value) {
    let _calculatedDob = this.calculateDOB(value, this.addNewPatient.value.dmy);
    this.addNewPatient.patchValue({
      DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
    });
  }
  dmyChange(value) {
    let _calculatedDob = this.calculateDOB(this.addNewPatient.value.Age, value);
    this.addNewPatient.patchValue({
      DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
    });
  }
  //Start PopUp Modal

  //Open PopUP for Add New Patient modal
  openAddNewPatientPopUp() {
    // let formValues = this.addRelationship.getRawValue();
    if (!this.RelationshipID) {
      this.toastr.error('Please choose a relationship.'); //Relationship check
      return;
    }
    setTimeout(() => {
      this.appPopupService.openModal(this.showAddNew);
    }, 100);
  }
  //Open PopUP for Add Existing Patient modal
  openExistingPatientPopUp() {
    // let formValues = this.addRelationship.getRawValue();
    if (!this.RelationshipID) {
      this.toastr.error('Please choose a relationship.'); //Relationship check
      return;
    }
    setTimeout(() => {
      this.appPopupService.openModal(this.showExistingPatient);
    }, 100);
  }
  closeLoginModal() {
    this.modalService.dismissAll();
    this.addNewPatient.reset();
  }
  //End PopUp Modal

  receiveValueFromTable(event) {
    this.disableAddButton=false;
    // this.spinner.show(this.spinnerRefs.cardTable);
    this.RelationshipID = '';
    this.cardNoValue = null;
    this.cardIdValue = null;
    console.log("Data from row_____________", event)
    setTimeout(() => {
      this.tableValues = event;
      this.cardNoValue = this.tableValues["CardNo"];
      this.cardIdValue = this.tableValues["CardId"];
      this.getFamilyCardDetails();
    // this.spinner.hide(this.spinnerRefs.cardTable);
    }, 200);
    this.closeLoginModal();
  }

  getCardInfo(data) {
    console.log("🚀 ~ AddFamilyComponent ~ getCardInfo ~ data:", data)
    this.disableAddButton=false;
    this.RelationshipID = '';
    this.familyCardMemberCount = 0;
    this.spinner.show(this.spinnerRefs.cardTable);
    this.cardNoValue = null;
    this.cardIdValue = null;
    setTimeout(() => {
      this.cardInfoData = data;
      // console.log("Get card Info ", this.cardInfoData);
      this.cardNoValue = this.cardInfoData[0].CardNo || null;
      this.cardIdValue = this.cardInfoData[0].CardId || null;
      this.getFamilyCardDetails();
      this.spinner.hide(this.spinnerRefs.cardTable);
    }, 200);
  }

  getFamilyCardDetails() {
    this.familyCardlist = [];
    let params = {
      cardId: this.cardIdValue,
    };
    this.discountCardService.getFamilyDiscountCardDetails(params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad?.length) {
        this.familyCardlist = res.PayLoad;
        this.familyCardMemberCount = this.familyCardlist?.length;
        this.OrbitMRN = this.familyCardlist[0].MRN;
        // console.log("🚀getFamilyDiscountCardDetails:", this.familyCardlist, this.familyCardlist.length)
      } else {
        this.toastr.info('No Member(s) Found');
      }
    }, (err) => {
      this.toastr.error('Connection error');
      console.log(err);
    })
  }

  // editFamilyMembers() {
  //   this.disableAddButton = !this.disableAddButton;
  // }
  getGendersList() {
    this.gendersList = [];
    this.lookupService.getGendersList().subscribe((res: any) => {
      // console.log(res);
      if (res && res.PayLoad && res.PayLoad?.length) {
        this.gendersList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }

  getMaritalStatus() {
    this.maritalStatusList = [];
    let _params = {
    }
    this.lookupService.maritalStatus(_params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.maritalStatusList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  getSalutationList() {
    this.salutationsList = [];
    this.lookupService.getSalutationList().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad?.length) {
        this.salutationsList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  genNewMRN:any;

  saveAddNewPatientInfo() {
    this.familyCardMemberCount = this.familyCardlist?.length;
    if (this.familyCardlist?.length >= 5) {
     this.toastr.info('A maximum of 5 members can be linked to a family card');
      return
    }
    if(this.familyCardlist?.length <= 4 ){
    let patientInfo = this.addNewPatient.getRawValue();
    let formattedDob = `${patientInfo.DateOfBirth.year}-${patientInfo.DateOfBirth.month}-${patientInfo.DateOfBirth.day}`;
    // let formattedDob = Conversions.formatDateObjectToString(patientInfo.DateOfBirth);
    let _branchId = this.loggedInUser.locationid;

    let patientObj = {
      PatientId: null,
      Title: patientInfo.Salutation,
      ISalutationID: ((this.salutationsList.find(a => a.SalutationTitle == patientInfo.Salutation) || {}).SalutationID || 0),
      FirstName: Conversions.capitalizeFirstLetter(patientInfo.firstName),
      // LastNme: Conversions.capitalizeFirstLetter(patientInfo.lastName) || '',
      LastName: patientInfo.lastName ? Conversions.capitalizeFirstLetter(patientInfo.lastName) : '',
      Gender: patientInfo.Gender,
      DoB: formattedDob, //new Date(patientInfo.DateOfBirth),
      IsDoB: true,
      Age: patientInfo.Age,
      MaritalStatus: patientInfo.MaritalStatus || null, // '',
      Phone: null,
      Cell: patientInfo.CellNumber,
      Email: patientInfo.Email || null,
      ADDRESS: null,
      ReferenceNo: null, // '',
      FatherName: null,
      Fax: null, // '',
      CNIC: patientInfo.CNIC || null,
      Passport: null,
      Designation: null, // '',
      LocId: _branchId,
      CountryId: 0,
      BloodGroup: null, // '',
      CityId: 0,
      OperatorId: 0,
      CreatedBy: this.loggedInUser.userid || -99,
      CreatedOn: null,
      IsDeleted: null,
      Nationality: null,
      PatientPortalOTP: null,
      isDefault: null,
      PatientPortalUserID: null,
      PVNo: null,
      VIMSPatientID: null,
      BookingPatientID: null,
      SourceID: 1,
      VaccinationStatus: null,
      PatientPic: null,
    };
    this.patientService.insertUpdatePatient(patientObj).subscribe((res: any) => {
      console.log("🚀AddFamilyComponent ~ this.patientService.insertUpdatePatient ~ res:", res)
      if (res && res.StatusCode == 200) {
        // this.toastr.success('Patient Data Patched in Table');
        this.patientId = res.PayLoad[0].PatientID;
        this.genNewMRN = res.PayLoad[0].MRN;
        console.log("🚀 ~ genNewMRN:", this.genNewMRN);
        this.disableAddButton = true;
      } else {
        this.toastr.error('Patient Data Not Saved');
      }
    }, (err) => {
      this.toastr.error('Connection error');
      console.log(err);
    })
    setTimeout(() => {
      // if(this.familyCardlist.length <= 4 ){ 
        if (this.familyCardlist.some(item => item.PatientId === this.patientId)) {
          this.toastr.error('Patient is Already Associated');
        }
       else{
        this.familyCardlist.push({
          Relationship: this.RelationshipName,
          Name: patientInfo.Salutation + patientInfo.firstName+ " " + patientInfo.lastName,
          Age: patientInfo.Age + ' yr(s)',
          MRN: this.genNewMRN,
          AgeGender: patientInfo.Gender,
        });
        this.disableAddButton = true;
       }
      // }
     
        this.closeLoginModal();
          this.addNewPatient.reset();
      }, 500);
       }
      else{
     this.toastr.info('A maximum of 5 members can be linked to a family card');
      this.spinner.hide(this.spinnerRefs.associateTable);
      }
  }

  changeRalation(event) {
    //  console.log("~ changeRalation ~ event:", event)
    //  console.log("~ changeRalation ~ event:", event.target.value)
    if (event.target.value) {
      let relation = this.relationshiplist.find(a => a.RelationshipID == event.target.value);
      // console.log("Relationhsoiujsod_________", relation);
      this.RelationshipName = relation.Relationship;
      // console.log("🚀  this.RelationshipName:", this.RelationshipName)
      // this.RelationshipName=relation.Relationship;
    }
  }


  receiveExistingPatientValues(data) {
    this.familyCardMemberCount = this.familyCardlist?.length;
    this.tableValuesForExistingPatient = data;
    this.patientId = this.tableValuesForExistingPatient["OrbitPatientID"];
    let birthdate = new Date(this.tableValuesForExistingPatient['DateOfBirth']);
    let today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    let m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    // let formValues = this.addRelationship.getRawValue();
    if(this.familyCardlist.length <= 4 ){ 
      if (this.familyCardlist.some(item => item.PatientId === this.patientId)) {
        this.toastr.error('Patient is Already Associated');
      }
     else{
      this.familyCardlist.push({
        Relationship: this.RelationshipName,
        Name: this.tableValuesForExistingPatient['SalutationTitle'] + this.tableValuesForExistingPatient['FirstName'] + this.tableValuesForExistingPatient['LastName'],
        Age: age + 'yr(s)',
        MRN: this.tableValuesForExistingPatient['OrbitMRNo'],
        AgeGender: this.tableValuesForExistingPatient['Gender'],
      });
      this.disableAddButton = true;
     }
    }
    else{
    this.toastr.info('A maximum of 5 members can be linked to a family card');
    }
    this.closeLoginModal();
  }

  saveDiscountCardInfo() {

    if (!this.RelationshipID) {
      this.toastr.error('Please choose a relationship.');  //Relationship check
      return;
    }

    if(this.patientId){
      if(this.familyCardlist?.length <= 5 ){ 
        if (this.familyCardlist.some(item => item.PatientId === this.patientId)) {
          this.toastr.error('Patient is Already Associated');
        }
       else{
        let params =
        {
          CardId: this.cardIdValue,
          PatientId: this.patientId,
          RelationshipId: Number(this.RelationshipID),
          BranchId: this.loggedInUser.locationid,
          CreatedBy: this.loggedInUser.userid,
        };
        this.spinner.show(this.spinnerRefs.associateTable);
        this.discountCardService.InsertFamilyDiscountCardDetails(params).subscribe((res: any) => {
          setTimeout(() => {
            this.spinner.hide(this.spinnerRefs.associateTable);}, 200);
          if (res && res.StatusCode == 200) {
            this.toastr.success('Family Member Added Successfully');
            this.RelationshipID = "";
            this.getFamilyCardDetails();
          } else {
            this.toastr.error('Something Went Wrong');
          }
        }, (err) => {
          this.spinner.hide(this.spinnerRefs.associateTable);
          this.toastr.error('Connection error');
          console.log(err);
        })
       }
      }
      else{
      this.toastr.info('A maximum of 5 members can be linked to a family card');
      this.spinner.hide(this.spinnerRefs.associateTable);
      }
    } 
    else {
      this.toastr.info('Something Went Wrong');
      this.spinner.hide(this.spinnerRefs.associateTable);
    }
    // rest of the code to update patient details
    this.disableAddButton = false;
  }
  RelationshipID = "";
  getRelationshipNames() {

    // this.discountCardService.getRelationshipName().subscribe((res: any) => {
    // this.relationshiplist = res.PayLoad;
    this.relationshiplist = [
      { RelationshipID: 1, Relationship: "Father" },
      { RelationshipID: 2, Relationship: "Mother" },
      { RelationshipID: 3, Relationship: "Spouse" },
      { RelationshipID: 4, Relationship: "Son" },
      { RelationshipID: 5, Relationship: "Daughter" },
      { RelationshipID: 6, Relationship: "Other" },
      { RelationshipID: 7, Relationship: "Self" }
    ]
    // console.log("🚀 this.discountCardService.getRelationshipName ~ this.relationshiplist:", this.relationshiplist)
    // }, (err) => {
    //   this.toastr.error('Connection error');
    //   console.log(err);
    // })

  }
  removeItem(index: number) {
    this.familyCardlist.splice(index, 1);
  }
  getCardTypeId:number=null
  getdiscountCardDetails(event){
    console.log(" AddFamilyComponent ~ event:", event);
    this.getCardTypeId=event[0].CardTypeId;
    console.log("this.getCardTypeId:", this.getCardTypeId)
  }


  settingSalutionValues(){
    this.addNewPatient.get('Salutation')?.valueChanges.subscribe(selectedSalutation => {
    const matchedSalutation = this.salutationsList.find(s => s.SalutationTitle === selectedSalutation);

    if (matchedSalutation) {
      const genderControl = this.addNewPatient.get('Gender');
      if (matchedSalutation.ForGender === 'M' || matchedSalutation.ForGender === 'F') {
        genderControl?.setValue(matchedSalutation.ForGender);  // Set gender
        genderControl?.disable(); // Disable gender field so user can't change
      } else {
        genderControl?.reset(); // Clear previous value
        genderControl?.enable(); // Allow user to choose manually
      }
    }
  });
  }
}
