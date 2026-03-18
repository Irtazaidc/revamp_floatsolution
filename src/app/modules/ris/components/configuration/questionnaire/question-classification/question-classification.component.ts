// @ts-nocheck
import { Component, Pipe,PipeTransform, Input, OnChanges, OnInit,ViewChild,ElementRef, Output, EventEmitter} from '@angular/core';
import { QuestionnaireService } from '../../../../services/questionnaire.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';

@Component({
  standalone: false,

  selector: 'app-question-classification',
  templateUrl: './question-classification.component.html',
  styleUrls: ['./question-classification.component.scss']
})
export class QuestionClassificationComponent implements OnInit {
  @Output() tabIndexData = new EventEmitter<any>();
  @Output() outputFromChild : EventEmitter<string> = new EventEmitter();
  QuestionClassificationID:any=null;
  searchText='';
  objList=[];
  existingRow = [];
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  
  spinnerRefs = {
    listSection: 'listSection',
    formSection:'formSection'
  }

  actionLabel ="Save";
  cardTitle ="Add Classification";
  objForm = this.fb.group({
    QuestionClassificationName : ['' ,Validators.compose([Validators.required])],
    QuestionClassificationCode : ['', Validators.compose([Validators.required])],
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to '+this.actionLabel.toLowerCase()+' ?', // 'Are you sure?',
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
  titleToShowOnCard: any='';
  
  constructor(
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private lookupService : LookupService,
    private fb : FormBuilder,
    private questionnaireService : QuestionnaireService,
    private auth: AuthService,
  ) {
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getQuestionClassification();
    
  }
  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getSingleRow(QuestionClassificationID){
    this.QuestionClassificationID = QuestionClassificationID;
    this.getQuestionClassification();
  }
  getClassificationQuestionsByClassificationID(QuestionClassificationID){
    this.QuestionClassificationID = QuestionClassificationID;
    let tabIndexObj={
      questionClassificationID:QuestionClassificationID,
      selectedIndex:2
    }
    this.tabIndexData.emit(tabIndexObj);
  }
  
  insertUpdateQuestionClassification(){
    let formValues = this.objForm.getRawValue();
    this.objForm.markAllAsTouched();
    let qc = formValues.QuestionClassificationName ? formValues.QuestionClassificationName.trim():'';
    let qcc = formValues.QuestionClassificationCode ? formValues.QuestionClassificationCode.trim():'';
    if(qc =="" && qcc ==""){
      this.objForm.patchValue({
        QuestionClassificationName:""
      });
      this.objForm.patchValue({
        QuestionClassificationCode:""
      });
      this.toastr.warning('Please fill the required fields...!');
      return 0
    }
    if(qcc ==""){
      this.objForm.patchValue({
        QuestionClassificationCode:""
      });
      this.toastr.warning('Please fill the required fields...!');
      return 0
    }


    if(qc ==""){
      this.objForm.patchValue({
        QuestionClassificationName:""
      });
      this.toastr.warning('Please fill the required fields...!');
      return 0
    }
    if(qcc ==""){
      this.objForm.patchValue({
        QuestionClassificationCode:""
      });
      this.toastr.warning('Please fill the required fields...!');
      return 0
    }
    this.spinner.show(this.spinnerRefs.formSection); 
    
    if(this.objForm.invalid) {
      this.spinner.hide(this.spinnerRefs.formSection);
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      this.disabledButton = true;
      this.isSpinner = false;
      let formData = {
        QuestionClassificationID:this.QuestionClassificationID,
        QuestionClassificationName: formValues.QuestionClassificationName,
        QuestionClassificationCode: formValues.QuestionClassificationCode.trim(),
        CreatedBy:this.loggedInUser.userid || -99,
      };
      this.questionnaireService.insertUpdateQuestionClassification(formData).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.spinner.hide(this.spinnerRefs.formSection);
            this.toastr.success(data.Message);
            this.clearForm();
            this.getQuestionClassification();
            this.disabledButton = false; 
            this.isSpinner = true;
          }else if(data.StatusCode==409){
            this.spinner.hide(this.spinnerRefs.formSection);
            this.toastr.error(data.Message)
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

  getQuestionClassification(){
    this.existingRow = [];
    if(this.QuestionClassificationID){
      this.actionLabel="Update"
      this.cardTitle ="Update Classification";
      this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to '+this.actionLabel.toLowerCase()+' ?';
      this.spinner.show(this.spinnerRefs.formSection);
    }else{
      this.actionLabel="Save"
      this.cardTitle ="Add Classification";
      this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to '+this.actionLabel.toLowerCase()+' ?';
      this.spinner.show(this.spinnerRefs.listSection);
    }
    
    let params = {
      QuestionClassificationID: this.QuestionClassificationID
    };
    this.questionnaireService.getQuestionClassification(params).subscribe((res: any) => {
      (this.QuestionClassificationID)? this.spinner.hide(this.spinnerRefs.formSection):this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        if(params.QuestionClassificationID){
          this.existingRow =  res.PayLoad[0];
          this.spinner.hide(this.spinnerRefs.listSection);
          this.objForm.patchValue({
            QuestionClassificationCode: this.existingRow["QuestionClassificationCode"],
            QuestionClassificationName: this.existingRow["QuestionClassificationName"]
          });
          this.titleToShowOnCard = this.existingRow["QuestionClassificationCode"]
        }else{
          this.clearForm();
          this.objList =  res.PayLoad || [];
          if(!this.objList.length){
            console.log('No record found.');
          }
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      (this.QuestionClassificationID)? this.spinner.hide(this.spinnerRefs.formSection):this.spinner.hide(this.spinnerRefs.listSection);
    })
    this.spinner.hide();
  }

  clearForm(){ 
    this.existingRow =[]
    this.objList;
    this.titleToShowOnCard = '';
    this.QuestionClassificationID=null;
    this.actionLabel="Save";
    this.disabledButton=false;
    this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to '+this.actionLabel.toLowerCase()+' ?'
    this.cardTitle ="Add Classification";
    setTimeout(() => {
      this.objForm.reset();
    }, 100);
  }

}
