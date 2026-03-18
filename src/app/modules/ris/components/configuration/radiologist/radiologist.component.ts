// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators } from '@angular/forms';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HttpClient } from '@angular/common/http';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Component({
  standalone: false,

  selector: 'app-radiologist',
  templateUrl: './radiologist.component.html',
  styleUrls: ['./radiologist.component.scss']
})
export class RadiologistComponent implements OnInit {

  radoiologistList = [];
  SubDepartmentID = null;
  EmpID = null;
  EmpIDActiveClass = null;
  LocID = null;
  departmentsList = [];
  selectedRadiologist:number = null;

  maxVal:number = 0;
  minVal:number = 0;

  branchesList = [];
  QuestionID:any = null;
  searchText = '';
  searchTextSection = '';
  searchTextTest = '';
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true; //Hide Loader

  checkedSectionIDs: any[] = [];
  checkedTestsIDs: any[] = [];  
  hideToggle=false;
  radiologiestSectionsList:any[] = []
  radiologiestTestsList:any[] = [];
  sectionChecked
  testChecked
  subSectionList:any = [];
  showHideEditBtn:boolean = true;
  showHideCancelBtn:boolean = false;
  
  spinnerRefs = {
    listSection: "listSection",
    formSection: "formSection",
    drSections: "drSections",
    drTests: "drTests",
    drPic: "drPic",
    refBylistSection: "refBylistSection"
  }

  ActionLabel ="Save";
  CardTitle ="Update Radiologist Configuration";
  sectionForm = this.fb.group({
    minVal : [''],
    maxVal : [''],
  });
  objForm = this.fb.group({
    AnsTypeID : ['' ,Validators.compose([Validators.required])],
    QuestionGroupTypeID : ['', Validators.compose([Validators.required])],
    Question : ['', Validators.compose([Validators.required])],
    DefaultAns : [''],
    MinimumAnswerChar : [''],
    ChildQuestionID : [''],
    NextQuestionOnOption : [1],
    IsRequired : [''],
    anyChild : [''],
    qDate : [''],
    minVal : [''],
    maxVal : [''],
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
  questionList = [];
  existingRow: any[];
  ansTypeList: any;
  isNextQuestion = false;
  questionGroupTypeList: any[];
  constructor(
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private fb : FormBuilder,
    private questionnaireSrv : QuestionnaireService,
    private auth: AuthService,
    private helper: HelperService,
    private lookupSrv: LookupService,
    private http: HttpClient,
    private sharedService: SharedService

  ) {
  }
 
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRadiologistInfoDetail(this.EmpID);
    // this.getRefByDoctors();
  }
  // defaultPatientPic="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLe5PABjXc17cjIMOibECLM7ppDwMmiDg6Dw&usqp=CAU";
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  radiologistPic =null;
  radiologiestSections=[];
  radoiologistListTests=[];
  radoiologistListTestsSelected=[];
  radoiologistRow:any={};
  radoiologistListRefBy=[];

  isTableLocked = false;
  getRadiologistInfoDetail(EmpID){
    // lock only when employee is clicked (not when loading list)
  if (EmpID) {
    if (this.isTableLocked) return;              // ignore extra clicks
    this.isTableLocked = true;                   // LOCK TABLE
  }
    this.selectedRadiologist = EmpID;
    this.selectedRefByDoctors = [];
    this.isAdd = false;
    let params = {
      EmpID: EmpID
    };
    if(params.EmpID){
      this.spinner.show(this.spinnerRefs.formSection);
    }
    else{
      this.spinner.show(this.spinnerRefs.listSection);
    }
    this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe((res: any) => {
      if(params.EmpID){
        this.EmpIDActiveClass = EmpID;
        this.spinner.hide(this.spinnerRefs.formSection);
      }
      else{
        this.spinner.hide(this.spinnerRefs.listSection);
      }
      if (res.StatusCode == 200) {
        if(params.EmpID){
          this.clearForm();
          this.subSectionList = [];
          this.radoiologistRow = res.PayLoadDS['Table'][0] || [];
          this.radiologiestSections =  res.PayLoadDS['Table1'] || [];
          this.radoiologistListRefBy =  (res.PayLoadDS['Table3'] && res.PayLoadDS['Table3'].length)?res.PayLoadDS['Table3'] : [];
          setTimeout(() => {
            this.getRefByDoctors();
          }, 100);
          this.radiologiestSections.forEach(sec => {
            sec.checked = true;
          });
          this.radiologiestSectionsList = this.radiologiestSections;
          this.radoiologistListTests =  res.PayLoadDS['Table2'] || [];
          this.radoiologistListTestsSelected =  this.radoiologistListTests.filter(a=> a.isAssigned==1);
          this.radoiologistListTestsSelected.forEach(test => {
            test.checked = true;
          });
          this.radiologiestTestsList = this.radoiologistListTestsSelected;
          this.showHideCancelBtn = false; this.showHideEditBtn = true; this.hideToggle = false;
          this.getEmployeePic(params.EmpID)
          if(!this.radoiologistList.length){
            this.toastr.info('No record found.');
          }
        }else{
          this.radoiologistList =  res.PayLoadDS['Table'] || [];
          setTimeout(() => {
            this.getRadiologistInfoDetail(this.radoiologistList[0].EmpId);
            this.getEmployeePic(this.radoiologistList[0].EmpId);
            this.EmpIDActiveClass = this.radoiologistList[0].EmpId
          }, 200);
          // console.log("Radiologist list is: ",this.radoiologistList)
        }

      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.listSection);
      this.spinner.hide(this.spinnerRefs.formSection);
      this.isTableLocked = false;  
    })
    this.spinner.hide();
  }

  selectAllTestsSelected(e) {
    console.log("selectAllTestsSelected ~ event_____________:", e);
    this.radiologiestTestsList.forEach(t => {
      t.checked = e;
    });
  }
  selectAllTestsSection(checked){
  console.log("🚀selectAllTestsSection ~ checked:", checked);
  this.radiologiestSectionsList.forEach(sec => {
    sec.checked = checked;
  });
  }
  
  getEmployeePic(EmpID){
    this.spinner.show(this.spinnerRefs.drPic);
    let params = {
      EmpID:EmpID
    }
    this.questionnaireSrv.getEmployeePic(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.drPic);
      if (res.StatusCode == 200) {
        if(res.PayLoad.length && res.PayLoad[0].EmployeePic){
          let resp = this.helper.formateImagesData(res.PayLoad,'EmployeePic');
          this.radiologistPic = resp[0].EmployeePic;
        }else{
          this.radiologistPic=null;
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
      this.isTableLocked = false;
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.drPic);
      this.isTableLocked = false;
    })
  }

  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  validateNo(e): boolean {
    // if(index==1){this.minVal = e.target.value}
    // if(index==2){this.maxVal = e.target.value}
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

  
  clearForm(){ 
    this.QuestionID=null;
    this.ActionLabel="Save";
    this.disabledButton=false;
    this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to '+this.ActionLabel.toLowerCase()+' ?'
    this.CardTitle ="Update Radiologist Configuration";
    this.isNextQuestion = false;
    setTimeout(() => {
      this.objForm.reset();
    }, 100);
  }
  truncate(source, size) { 
    if(source){
      return source.length > size ? source.slice(0, size - 1) + " …" : source;
    } else{
      return '';
    }
  }
  getSubSection() {
    this.showHideEditBtn=false;
    this.showHideCancelBtn=true;
    this.hideToggle=true;
    this.subSectionList = [];
    let objParm = {
      SectionID: -1,
      LabDeptID: 2,
    }
    this.lookupSrv.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      if(resp && resp.PayLoad){
        let _response = resp.PayLoad;
        this.subSectionList = _response;
        this.subSectionList = this.subSectionList.filter(id => id.SubSectionId !== 62);
        this.radiologiestSectionsList = [...this.radiologiestSections, ...this.subSectionList];
        const uniqueSubSectionIds = {};
        const uniqueSectionsList = [];
        this.radiologiestSectionsList.forEach((sec) => {
          if (!uniqueSubSectionIds[sec.SubSectionId]) {
            uniqueSubSectionIds[sec.SubSectionId] = true;
            uniqueSectionsList.push(sec);
          }
        });
        this.radiologiestSectionsList =  uniqueSectionsList;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  getTestProfile(subSectionId) {
    let objParm = {
      SubSectionID: subSectionId,
    }
    this.questionnaireSrv.getTestProfileforRadWorklist(objParm).subscribe((resp: any) => {
      if(resp && resp.PayLoad){
        let _response = resp.PayLoad;
        const testProfileList = _response;
        this.radiologiestTestsList = [...testProfileList, ...this.radoiologistListTestsSelected];
        const combinedList = [
          ...testProfileList.filter((test) => {
            return !this.radoiologistListTestsSelected.some(
              (selectedTest) => test.TPID === selectedTest.TPId
            );
          }),
          ...this.radoiologistListTestsSelected
        ];
        console.log(combinedList);
        this.radiologiestTestsList = combinedList;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  cancel(){
    this.showHideEditBtn=true;
    this.hideToggle=false;
    this.showHideCancelBtn=false;
    this.subSectionList = [];
    this.radiologiestSectionsList = this.radiologiestSections;
    this.radiologiestTestsList = this.radoiologistListTestsSelected;
  }
  SectionIDs:any[]=[]
  onSelectedSectionChange(e) {
    console.log("🚀 ~ RadiologistComponent ~ onSelectedSectionChange ~ e:", e)
    const checked:boolean = e.checked 
    if(checked == true ){
      this.checkedSectionIDs = e.SubSectionId;
      this.SectionIDs = this.SectionIDs.concat(this.checkedSectionIDs);
      this.getTestProfile(this.checkedSectionIDs);
    } 
    else{
      // this.radoiologistListTestsSelected;
      this.radiologiestTestsList = this.radoiologistListTestsSelected.filter(item => item.SubSectionId !== e.SubSectionId);
    }
     
  }

  onSelectedTestsChange(e) {
    this.checkedTestsIDs = this.checkedTestsIDs.concat(e); 
    console.log(this.checkedTestsIDs);
  }

  saveRadiologistWorklist() {
    let selectedSections = this.radiologiestSectionsList.filter(a => a.checked == true);
    // selectedSections.forEach(section => {
    //   const minValue = parseFloat(section.Min);
    //   const maxValue = parseFloat(section.Max);
    //   if (minValue > maxValue && section.Max !== "") {
    //     this.toastr.error(`Min is greater than Max for SubSectionId: ${section.SubSectionId}`);
    //   }
    // });
    let selectedTests = this.radiologiestTestsList.filter(a => a.checked == true);
    if(this.showHideEditBtn == false ){ //&& (selectedTests.length || selectedSections.length)
      let params = {
        EmpID: this.selectedRadiologist,
        CreatedBy: this.loggedInUser?.userid,           
        tblSectionTestProfile : selectedTests.map((row) => ({  
          SubSectionID: row.SubSectionId || null, 
          TPID: row.TPID || row.TPId,
          isInit: row.isInit || 0,
          isDS: row.isDS || 0,
          isSecondOpinion: row.isSecondOpinion || 0,
          isPeerReview:  row.isPeerReview || 0,
        })),
        tblEmployeeSectionWorkload:selectedSections.map((sec) => ({   
          SubSectionID: sec.SubSectionId || null, 
          MinTest: sec.Min || 0,
          MaxTest: sec.Max || 0,
        })),  
      }
      console.log("RadiologistWorklist ~ params:", params); 
      this.questionnaireSrv.InsertUpdateRadiologistWorklist(params).subscribe((resp: any) => {
        if(resp && resp.PayLoad){
          if(resp.PayLoad[0].Result == 1){
            this.toastr.success('Doctor Workload Saved');
            this.showHideEditBtn = true;
            this.hideToggle = false;
            this.showHideCancelBtn = false;
            this.getRadiologistInfoDetail(this.selectedRadiologist);
          }
          else{
          this.toastr.error('Something went wrong');
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
      })
    }
    else{
      this.toastr.warning('Please select section(s) OR test(s) first');
    }
    
  }
 
  OnChangeChecks(sect, event) {
    console.log("SectionID, Event:", sect, event);
  
    // Iterate through the radiologiestTestsList
    this.radiologiestTestsList.forEach(t => {
      if (event === 'isInit') {
        t.isInit = sect.SubSectionId === t.SubSectionId && sect.isInit === true;
      } else if (event === 'isDS') {
        t.isDS = sect.SubSectionId === t.SubSectionId && sect.isDS === true;
      } else if (event === 'isSecondOpinion') {
        t.isSecondOpinion = sect.SubSectionId === t.SubSectionId && sect.isSecondOpinion === true;
      } else if (event === 'isPeerReview') {
        t.isPeerReview = sect.SubSectionId === t.SubSectionId && sect.isPeerReview === true;
      } else {
        // Reset all properties for the matching subsection
        if (sect.SubSectionId === t.SubSectionId) {
          t.isInit = t.isDS = t.isSecondOpinion = t.isPeerReview = false;
        }
      }
    });
  }
  
  refByDoctors = []
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
        this.refByDoctors = this.refByDoctors.filter(doctor => {
          const isMatched = this.radoiologistListRefBy.some(item => {
            return item.RefByListID.toString() === doctor.RefId.toString();
          });
          return !isMatched;
        });
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.refBylistSection);
      console.log(err);
    });
  }
  isAdd = false;
  sowHideRefByDropdownSection(action){
    this.isAdd = action==1?true:false;
  }
  isSubmitted = false;
  selectedRefByDoctors = []
  insertUpdateRefByRadiologistMapping() {
    let margedArray = [];
    let myArr = this.selectedRefByDoctors.map(id => ({
      Name:'',
      RefByListID: id,
      RefByRadiologistMappingID:null
      
  }));
  margedArray = [...this.radoiologistListRefBy, ...myArr];
  let dataMerged = margedArray.map(id => {return id.RefByListID})
    if (!this.selectedRefByDoctors.length) {
      this.toastr.warning("Please select RefBy doctor!");
      this.isSubmitted = true;
      return;
    } else {
      let objParam = {
        CreatedBy: this.loggedInUser.userid,
        tblRefByRadioMapping: [{
          EmpID: this.EmpIDActiveClass,
          RefByListIDs: dataMerged.join(','),
        }]
      }
      this.disabledButton = true;
      this.isSpinner = false;
      this.sharedService.getData(API_ROUTES.INSERT_UPDATE_REFBY_RADIOLOGIST_MAPPING, objParam).subscribe((data: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            let res = JSON.parse(data.PayLoadStr)
            if(res[0].Result == 1){
              this.toastr.success(data.Message);
              // if(this.removeRefBy == 1){return;}
              this.getRadiologistInfoDetail(this.EmpIDActiveClass);
              this.isAdd = false;
              this.selectedRefByDoctors = [];
            }
            else{
              this.toastr.error("Error!");
            }
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.isSpinner = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButton = false;
        this.isSpinner = true;
      })
    }

  }
  removeRefBy = null;
  removeRefByRadiologistMapping(refBy){
   
    let objParam = {
        CreatedBy: this.loggedInUser.userid,
        RefByRadiologistMappingID:refBy.RefByRadiologistMappingID,  
      }
      this.disabledButton = true;
      this.isSpinner = false;
      this.sharedService.getData(API_ROUTES.REMOVE_REFBY_RADIOLOGIST_MAPPING, objParam).subscribe((data: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            let res = JSON.parse(data.PayLoadStr)
            if(res[0].Result == 1){
              this.toastr.success(data.Message);
              this.radoiologistListRefBy = this.radoiologistListRefBy.filter(id => {
                return id.RefByListID != refBy.RefByListID;
              });
            }
            else{
              this.toastr.error("Error!");
            }
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.isSpinner = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButton = false;
        this.isSpinner = true;
      })
    }
   

    onValueChange(sec: any, type: 'Min' | 'Max') {
      const minVal = parseFloat(sec.Min);
      const maxVal = parseFloat(sec.Max);
  
      if (type === 'Min') {
        if (!isNaN(minVal)) {
          if (minVal >= maxVal) {
            sec.Min = 0;
            this.toastr.info('Min should be less than Max');
          } else {
            sec.Min = minVal;
          }
        }
      } else if (type === 'Max') {
        if (!isNaN(maxVal)) {
          if (maxVal <= minVal) {
            sec.Max = minVal + 1;
            this.toastr.info('Max should be greater than Min');
          } else {
            sec.Max = maxVal;
          }
        }
      }
    }

}
