// @ts-nocheck
import { Component, Pipe,PipeTransform, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { QuestionnaireService } from '../../../../services/questionnaire.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";

@Component({
  standalone: false,

  selector: 'app-questions-group',
  templateUrl: './questions-group-new.component.html',
  styleUrls: ['./questions-group.component.scss']
})
export class QuestionsGroupComponent implements OnInit {
  @Input() questionClassificationID:number=null;
  QuestionClassificationID:any=null;
  searchText='';
  objList=[];
  existingRow = [];
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  actionButtonText = "Save";
  
  spinnerRefs = {
    listSection: 'listSection',
    formSection:'formSection'
  }

  actionLabel ="Save";
  cardTitle ="Group Question in Classification";
  objForm = this.fb.group({
    QuestionClassificationName : ['' ,Validators.compose([Validators.required])],
    QuestionClassificationCode : ['', Validators.compose([Validators.required])],
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please confirm...', // 'Are you sure?',
    popoverMessage: 'Do you <b>really</b> want to save ?',
    confirmText: 'Yes',
    cancelText: 'No',
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
  questionList: any[];
  classificationList: any;
  
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
    this.getQuestion();
		if(this.questionClassificationID){
			this.getQClassificationSelectedQuestionsV2(this.questionClassificationID);
		}
    
  }
  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getQuestion(){
    this.questionList = [];
    const params = {
      QuestionID: null
    };
    this.questionnaireService.getQuestion(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
          this.questionList =  res.PayLoad || [];
          console.log("Question List is: ",this.questionList)
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  getQuestionClassification(){
    const params = {
      QuestionClassificationID: null
    };
    this.questionnaireService.getQuestionClassification(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {;
          this.classificationList =  res.PayLoad || [];
          console.log("Question classification List is: ",this.classificationList)
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }

  
  selectedQuestion=[];
  addSelectedQuestion(e) {
    if(e){
      if (!this.selectedQuestion.find(a => a.QuestionID == e.QuestionID)) {
        const newQuestion = this.questionList.find(x => x.QuestionID == e.QuestionID)
        if (newQuestion) {
          this.selectedQuestion.push(newQuestion);
          const filteredQuestions = this.questionList.filter(x => x.QuestionID != e.QuestionID)
          this.questionList = filteredQuestions;
        }
      }else{
        this.toastr.info("This question is already added")
      }
    }
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedQuestion, event.previousIndex, event.currentIndex);
    this.selectedQuestion.forEach((item, idx) => {
      item.MachinePriority = idx + 1;
    });
  }

  removeItem(QuestionID){
    let newSelectQuestions = [];
    newSelectQuestions = this.selectedQuestion.filter(x => x.QuestionID != QuestionID )
    this.questionList = this.questionList.concat(this.selectedQuestion.find(x => x.QuestionID == QuestionID ));
    this.selectedQuestion = newSelectQuestions;
  }
  requiredHighlited=true;

  insertUpdateQClassificationQuestion(){
    if(!this.questionClassificationID) {
      this.requiredHighlited=false;
			this.toastr.error("Please Select Question Classification")
      return false;
    }else{
      this.waitTillResponse(true);
      this.requiredHighlited=true;
      let i=0;

      const tTPIDs = this.testList.filter(x => x.checked);

      const objParam = {
        CreatedBy: this.loggedInUser.userid || -99,
        QuestionClassificationID: this.questionClassificationID,
        tTPIDs: tTPIDs.map(x => {
          return{
            TPID: x.TPId,
          }
        }), 
        tblQClassificationQuestion: this.selectedQuestion.map( a => {
          i+=1;
          return {
            QClassificationQuestionID: a.QClassificationQuestionsID?a.QClassificationQuestionsID:null, 
            QuestionID: a.QuestionID, 
            SordOrder: i
            }
          })
        } 
        console.log("objParam for insertion::: ", objParam)
        this.questionnaireService.insertUpdateQClassificationQuestionV2(objParam).subscribe((data: any) => {
         setTimeout(() => {
          this.waitTillResponse(false);
         }, 500);
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              this.toastr.success(data.Message);
              this.getQuestion();
               this.getQClassificationSelectedQuestionsV2(this.questionClassificationID);
              // this.selectedQuestion=[];
            } else {
              this.toastr.error(data.Message)
            }
          }
        }, (err) => {
        this.waitTillResponse(false);
        console.log(err);
        this.toastr.error('Connection error');
      })
     
    }
  }

  getQClassificationQuestionsV2(e){
		this.selectedQuestion=[];
		if(e){
		  this.getQClassificationSelectedQuestionsV2(e.QuestionClassificationID)
		}
  }

	getQClassificationSelectedQuestionsV2(questionClassificationID) {
  this.selectedQuestion = [];
  this.testList = []; // dataset for tests

  const params = {
    QuestionClassificationID: questionClassificationID
  };

  this.questionnaireService.getQClassificationQuestionsV2(params).subscribe(
    (res: any) => {
      if (res.StatusCode === 200) {
        const payload = res.PayLoadDS || {};

        // First dataset (Questions)
        this.selectedQuestion = payload.Table || [];

        // Second dataset (Tests)
        this.testList = (payload.Table1 || []).map((item: any) => {
          return {
            ...item,
            checked: item.Allow ? true : false // auto-check if allowed
          };
        });

        console.log("Questions → ", this.selectedQuestion);
        console.log("Tests → ", this.testList);
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    },
    (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    }
  );
}


  waitTillResponse(param){
    if(param){
      this.disabledButton = true; //Disabled Button
      this.isSpinner = false;//Show Loader
      this.actionButtonText = "Please wait...";
    }else{
      this.disabledButton = false; //Enable Button
      this.isSpinner = true;//Hide Loader
      this.actionButtonText = "Save";
    }
  }

  isFieldDisabled = false;
  mainChk;
  isDissabledChk = false;
  testList

  selectAllItems(checked: boolean) {
  this.testList.forEach((item) => {
    // Only toggle items that are NOT already linked
    if (!item.QuestionClassificationID) {
      item.checked = checked;
    }
  });
}


  onSelectedTest(e) {
    // const checked: boolean = e.checked;
    // if (checked == true) {
    //   this.isDissabledChk = false;
    // }
  }
}
