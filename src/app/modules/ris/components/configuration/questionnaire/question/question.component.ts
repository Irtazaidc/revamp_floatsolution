// @ts-nocheck
import { Component, Pipe, PipeTransform, Input, OnChanges, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QuestionnaireService } from '../../../../services/questionnaire.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
// import { Conversions } from '../../../shared/helpers/conversions';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';

@Component({
  standalone: false,

  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {
  SubDepartmentID = null;
  LocID = null;
  departmentsList = [];
  branchesList = [];
  QuestionID: any = null;
  searchText = '';
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader

  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection'
  }

  ActionLabel = "Save";
  CardTitle = "Add Question";
  objForm = this.fb.group({
    AnsTypeID: ['', Validators.compose([Validators.required])],
    QuestionGroupTypeID: ['', Validators.compose([Validators.required])],
    Question: ['', Validators.compose([Validators.required])],
    DefaultAns: [''],
    DefaultAnsText: [''],
    MinimumAnswerChar: [''],
    ChildQuestionID: [''],
    NextQuestionOnOption: [1],
    IsRequired: [''],
    anyChild: [''],
    qDate: [''],
    minVal: [''],
    maxVal: [''],
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?', // 'Are you sure?',
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
  questionListDB = [];
  existingRow: any[];
  ansTypeList: any;
  isNextQuestion = false;
  isMandatory = true;
  isChecklist=false;
  isAnsTypeReadOnly=false;
  questionGroupTypeList: any[];
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private questionnaireSrv: QuestionnaireService,
    private auth: AuthService,
  ) {
  }


  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  existingYesNo = false;
  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  arrOptions = [];
  arrExpectedOptions = [];
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getQuestion();
    this.getAnswerType();
    this.getQuestionGroupType();
    this.objForm.patchValue({
      NextQuestionOnOption: 1,
      QuestionGroupTypeID: 5
    });
    // this.objForm.get('AnsTypeID').valueChanges.subscribe(val => {
    //   console.log("I am changed Person now",)
    //   this.getAnstypeID(val);

    // })

  }

  add(event: MatChipInputEvent): void {
    const inputText = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.arrExpectedOptions.push({ option: value.trim() });
    }

    // Reset the input value
    if (inputText) {
      inputText.value = '';
    }
  }

  remove(option: any): void {
    const index = this.arrExpectedOptions.indexOf(option);

    if (index >= 0) {
      this.arrExpectedOptions.splice(index, 1);
    }
  }


  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getSingleRow(QuestionID) {
    this.QuestionID = QuestionID;
    this.getQuestion();
  }

  insertUpdateQuestion() {
    let formValues = this.objForm.getRawValue();
    // console.log("formValues.DefaultAns_______",formValues.DefaultAns);return;
    this.objForm.markAllAsTouched();
    let q = formValues.Question ? formValues.Question.trim() : '';
    if (q == "") {
      this.objForm.patchValue({
        Question: ""
      });
      this.toastr.warning('Please fill the required fields...!');
      return 0
    }

    let inputType = formValues.AnsTypeID;

    let defaultAns = "";
    let expectedOptions = "";
    switch (inputType) {
      case 1:
        {
          defaultAns = formValues.DefaultAns;
          break;
        }

      case 3:
        {
          let arr = this.arrExpectedOptions;
          // defaultAns = arr.length?arr.map((x) => x.option).join(','):'';
          defaultAns = formValues.DefaultAns;
          expectedOptions = arr.length ? arr.map((x) => x.option).join('^') : '';
          break;
        }
      case 4:
        {
          let arr = this.arrExpectedOptions;
          // let ans = "";
          // if((formValues.DefaultAns || formValues.DefaultAns !="" ) && (formValues.DefaultAnsText || formValues.DefaultAnsText)){
          //   defaultAns = formValues.DefaultAns+'^'+formValues.DefaultAnsText;
          // }
          defaultAns = formValues.DefaultAns + '^' + formValues.DefaultAnsText;
          expectedOptions = arr.length ? arr.map((x) => x.option).join('^') : '';
          break;
        }

      case 5:
        {
          expectedOptions = 'Yes^No';
          defaultAns = formValues.DefaultAns ? 'Yes' : 'No';
          break;
        }

      case 6:
        {
          defaultAns = formValues.qDate ? Conversions.formatDateObject(formValues.qDate) : '';
          break;
        }
      case 7:
        {
          defaultAns = formValues.minVal + "^" + formValues.maxVal;
          break;
        }

      default:
        defaultAns = formValues.DefaultAns;
        break;
    }
    this.objForm.markAllAsTouched();
    if (this.objForm.invalid) {
      this.spinner.hide(this.spinnerRefs.formSection);
      this.toastr.warning('Please fill the required fields...!'); //return false;
    } else {
      // this.disabledButton = true;
      // this.isSpinner = false;
      // this.spinner.show(this.spinnerRefs.formSection); 
      let formData = {
        QuestionID: this.QuestionID,
        QuestionGroupTypeID: formValues.QuestionGroupTypeID,
        Question: formValues.Question,
        DefaultAns: defaultAns,
        MinimumAnswerChar: formValues.MinimumAnswerChar,
        ChildQuestionID: formValues.ChildQuestionID,
        NextQuestionOnOption: formValues.NextQuestionOnOption,
        AnsTypeID: formValues.AnsTypeID,
        QExpectedOptions: expectedOptions,
        IsRequired: formValues.IsRequired == true ? 1 : 0,
        CreatedBy: this.loggedInUser.userid || -99,
      };
      console.log("formData____________________", formData); //return;
      this.questionnaireSrv.insertUpdateQuestion(formData).subscribe((data: any) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.spinner.hide(this.spinnerRefs.formSection);
            this.toastr.success(data.Message);
            this.clearForm();
            this.getQuestion();
            this.isOptionBox = false;
            this.changeQuestionDetail(1);
            // this.disabledButton = false; 
            // this.isSpinner = true;
          } else {
            this.spinner.hide(this.spinnerRefs.formSection);
            this.toastr.error(data.Message)
            this.disabledButton = false;
            this.isSpinner = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.formSection);
        this.disabledButton = false;
        this.isSpinner = true;
        this.toastr.error('Connection error');
      })
    }
  }

  minMaxError = false;
  validateMinMaxVal(minVal, maxVal) {
    if (minVal != '' && maxVal != '' && maxVal < minVal) {
      this.minMaxError = true;
      this.objForm.patchValue({
        maxVal: ''
      })
    } else {
      this.minMaxError = false;
    }
  }

  isQuestionGroupTypReadOnly=false;
  getQuestion() {
    this.existingRow = [];
    this.arrExpectedOptions = [];
    if (this.QuestionID) {
      this.ActionLabel = "Update"
      this.CardTitle = "Update Question";
      this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?';
      this.spinner.show(this.spinnerRefs.formSection);
    } else {
      this.searchText = '';
      this.filterResults();
      this.ActionLabel = "Save"
      this.CardTitle = "Add Question";
      this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?';
      this.spinner.show(this.spinnerRefs.listSection);
    }

    let params = {
      QuestionID: this.QuestionID
    };
    this.questionnaireSrv.getQuestion(params).subscribe((res: any) => {
      (this.QuestionID) ? this.spinner.hide(this.spinnerRefs.formSection) : this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        if (params.QuestionID) {
          this.disabledButton = false;
          this.existingRow = res.PayLoad[0];
          this.QuestionID = this.existingRow['QuestionID']
          console.log('Existing row is: ', this.existingRow)
          this.spinner.hide(this.spinnerRefs.listSection);
          this.objForm.patchValue({
            AnsTypeID: this.existingRow["AnsTypeID"],
            QuestionGroupTypeID: this.existingRow["QuestionGroupTypeID"],
            Question: this.existingRow["Question"],
            // DefaultAns: this.existingRow["DefaultAns"],
            MinimumAnswerChar: this.existingRow["MinimumAnswerChar"],
            ChildQuestionID: this.existingRow["ChildQuestionID"],
            NextQuestionOnOption: this.existingRow["NextQuestionOnOption"],
            // QExpectedOptions: this.existingRow["QExpectedOptions"],
            IsRequired: this.existingRow["IsRequired"],
          });
          // this.isQuestionGroupTypReadOnly = this.existingRow["QuestionGroupTypeID"] == 8?true:false;

          if(this.existingRow["QuestionGroupTypeID"] == 8){
            this.isQuestionGroupTypReadOnly = true;
            this.objForm.patchValue({
              AnsTypeID: 5
            })
  
            let obj = {
              AnsTypeId: 5,
              AnswerType: "Yes/No"
            }
            this.getAnstypeID(obj);
            this.isMandatory=false;
            this.isChecklist=true;
            this.isAnsTypeReadOnly=true;
          }else{
            this.isQuestionGroupTypReadOnly=false;
          }
          if (this.existingRow["ChildQuestionID"]) {
            this.isNextQuestion = true;
            this.objForm.patchValue({
              anyChild: 1
            })
          } else {
            this.objForm.patchValue({
              anyChild: 0
            })
            this.isNextQuestion = false;
            this.objForm.patchValue({
              ChildQuestionID: null
            })
          }
          this.setExistingDeaultAns(this.existingRow["AnsTypeID"], this.existingRow["DefaultAns"], this.existingRow["QExpectedOptions"]);
          this.changeQuestionDetail(this.existingRow["AnsTypeID"]);
        } else {
          this.isQuestionGroupTypReadOnly = this.existingRow["QuestionGroupTypeID"] == 8?true:false;
          this.clearForm();
          let data = res.PayLoad;
          this.objForm.patchValue({
            QuestionGroupTypeID: 5
          })
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          this.questionListDB = data || []; 
          this.questionList = data || [];
          this.filterResults();
          if (!this.questionList.length) {
            this.toastr.info('No record found.');
          }
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      (this.QuestionID) ? this.spinner.hide(this.spinnerRefs.formSection) : this.spinner.hide(this.spinnerRefs.listSection);
    })
    this.spinner.hide();
  }

  setExistingDeaultAns(inputType, existingDefaultVal, expectedOptions) {
    this.isReadonly = false;
    this.existingYesNo = false;
    this.yesNoLabel = "No";
    var inputCondition = inputType
    switch (inputCondition) {
      case 1:
      case 2:
        {
          this.objForm.patchValue({
            DefaultAns: existingDefaultVal
          })
          break;
        }


      case 3:
        {
          let existingDefaultAns = existingDefaultVal.split('^');
          this.arrOptions =
            existingDefaultAns.map(a => ({
              option: a,
            }));

          let existingEexpectedOptions = expectedOptions.split('^');
          this.arrExpectedOptions =
            existingEexpectedOptions.map(a => ({
              option: a,
            }));

          this.objForm.patchValue({
            NextQuestionOnOption: this.existingRow["NextQuestionOnOption"]
          })
          this.objForm.patchValue({
            DefaultAns: existingDefaultVal
          })
          this.isReadonly = false;
          break;
        }

      case 4:
        {
          let existingDefaultAns = existingDefaultVal.split('^');
          this.arrOptions =
            existingDefaultAns.map(a => ({
              option: a,
            }));

          expectedOptions = expectedOptions.trim();
          if (expectedOptions && expectedOptions != "") {
            let existingEexpectedOptions = expectedOptions.split('^');
            this.arrExpectedOptions =
              existingEexpectedOptions.map(a => ({
                option: a,
              }));
          }


          this.objForm.patchValue({
            NextQuestionOnOption: this.existingRow["NextQuestionOnOption"]
          })
          if (existingDefaultAns) {
            this.objForm.patchValue({
              DefaultAns: existingDefaultAns[0]
            })
          }
          if (existingDefaultAns[1] != "null") {
            this.objForm.patchValue({
              DefaultAnsText: existingDefaultAns[1]
            })
          } else {
            this.objForm.patchValue({
              DefaultAnsText: ""
            })
          }



          this.isReadonly = false;
          break;
        }

      case 5:
        {
          let yesNoString = existingDefaultVal.trim();
          console.log("existing default value for checkbox is above if: ", yesNoString)
          if (yesNoString === 'Yes') {
            console.log("existing default value for checkbox is: ", yesNoString)
            this.existingYesNo = true;
            this.yesNoLabel = "Yes";
          } else if (yesNoString === 'No') {
            this.existingYesNo = false;
            this.yesNoLabel = "No";
          }
          else {
            this.existingYesNo = false;
            this.yesNoLabel = "No";
          }
          break;
        }

      case 6:
        {
          this.objForm.patchValue({
            qDate: Conversions.getDateObjectByGivenDate(existingDefaultVal)
          })
          this.isReadonly = true;
          break;
        }
      case 7:
        {
          let existingDefaultAns = existingDefaultVal.split('^');
          this.objForm.patchValue({
            minVal: existingDefaultAns[0],
            maxVal: existingDefaultAns[1],
          })
          break;
        }

      default:
        console.log("No mach found");
        break;
    }

  }
  getAnswerType() {
    this.ansTypeList = [];
    let params = {
      // AnsTypeId: null
    };
    this.questionnaireSrv.getAnswerType(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.clearForm();
        let result = res.PayLoad || [];
        // result = result.filter(a=> (a.AnsTypeId!=4));
        this.ansTypeList = result || [];
        if (!this.questionList.length) {
          this.toastr.info('No record found.');
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }
  selectedGroupType = 5;
  getQuestionGroupType() {
    this.questionGroupTypeList = [];
    let params = {
      // AnsTypeId: null
    };
    this.questionnaireSrv.getQuestionGroupType(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.clearForm();
        let groupTypeList = res.PayLoad || [];
        if(groupTypeList.length){
          groupTypeList = groupTypeList.filter(a=> (a.QuestionGroupTypeID==5 || a.QuestionGroupTypeID==6 ||a.QuestionGroupTypeID==8));
          this.questionGroupTypeList =groupTypeList;
        }else{
          this.questionGroupTypeList = []
        }
        this.objForm.patchValue({
          QuestionGroupTypeID: 5
        })
        if(!this.questionGroupTypeList.length) {
          this.toastr.info('No record found.');
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }
  checkChildQuestion(e) {
    if (e.target.checked) {
      this.isNextQuestion = true;
    } else {
      this.isNextQuestion = false;
      this.objForm.patchValue({
        ChildQuestionID: ""
      })
    }

  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

  isMinCharLimit = true;
  isDataPicker = false;
  isYesNo = false;
  isOptionBox = false;
  isOptionBoxText = false;
  isMinMax = false;
  isReadonly = false;


  getAnstypeID(param) {
    this.yesNoLabel = "No";
    let inputType = param.AnsTypeId;
    if (inputType == 5) {
      let arr = [
        { option: 'Yes' },
        { option: 'No' }
      ]

      this.isReadonly = true;
      this.arrOptions = [
        { option: 'Yes' },
        { option: 'No' }
      ];

      // this.objForm.patchValue({
      //   DefaultAns: arr.map((x) => x.option).join(',')
      // })
    } else if (inputType == 3) {
      this.arrOptions = [];
      this.objForm.patchValue({
        DefaultAns: ""
      })
      this.isReadonly = false;
    }
    else {
      this.isReadonly = false;
      this.objForm.patchValue({
        DefaultAns: ""
      })
    }
    this.objForm.patchValue({
      IsRequired: 0
    })
    this.changeQuestionDetail(inputType)
  }
  getDefaultValue(param) {
    // this.objForm.patchValue({
    //   DefaultAns:param
    // })
  }

  // makeMultipleOptions(options){
  //   this.arrOptions= options.split(',');
  // }
  changeQuestionDetail(param) {
    /*
      1-	Text
      2-	Paragraph
      3-	Options
      4-	Options Text
      5-	Yes/No
      6-	Date
      7-	Min - Max
    */
    let inputType = param;
    switch (inputType) {
      case 1:
        {
          this.isMinCharLimit = true;
          this.isDataPicker = false;
          this.isOptionBox = false;
          this.isOptionBoxText = false;
          this.isMinMax = false;
          this.isYesNo = false;

          break;
        }

      // case 2:
      //   {
      //     this.isMinCharLimit = true;

      //     this.isDataPicker = false;
      //     this.isOptionBox = false;
      //     this.isMinMax = false;
      //     break;
      //   }

      case 3:
        {
          this.isOptionBox = true;
          this.isOptionBoxText = false;
          this.isMinCharLimit = false;
          this.isDataPicker = false;
          this.isMinMax = false;
          this.isYesNo = false;
          break;
        }

      case 4:
        {
          this.isOptionBox = true;
          this.isOptionBoxText = true;
          this.isMinCharLimit = false;
          this.isDataPicker = false;
          this.isMinMax = false;
          this.isYesNo = false;
          break;
        }
      case 6:
      // case 7:
      case 5:
        {
          this.isYesNo = true;
          this.isOptionBox = false;
          this.isOptionBoxText = false;
          this.isMinCharLimit = false;
          this.isDataPicker = false;
          this.isMinMax = false;
          break;
        }

      case 6:
        {
          this.isDataPicker = true;
          this.isOptionBox = false;
          this.isOptionBoxText = false;
          this.isMinCharLimit = false;
          this.isMinMax = false
          this.isYesNo = false;
          break;
        }
      case 7:
        {
          this.isMinMax = true
          this.isDataPicker = false;
          this.isOptionBox = false;
          this.isOptionBoxText = false;
          this.isMinCharLimit = false;
          this.isYesNo = false;
          break;
        }

      default:
        console.log("No mach found");
        break;
    }
  }
  setExistingDefaultVale() {

  }

  clearForm() {
    this.isQuestionGroupTypReadOnly = false;
    this.QuestionID = null;
    this.ActionLabel = "Save";
    this.disabledButton = false;
    this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?'
    this.CardTitle = "Add Question";
    this.isNextQuestion = false;
    this.isReadonly = false;
    this.arrExpectedOptions = [];
    this.isMandatory=true;
    this.isChecklist=false;
    this.isAnsTypeReadOnly=false;
    setTimeout(() => {
      this.objForm.reset();
      this.objForm.patchValue({
        AnsTypeID: 1,
        QuestionGroupTypeID: 5,
        IsRequired: 0
      });
    }, 100);
    this.changeQuestionDetail(1);
  }

  truncate(source, size) {
    if (source) {
      return source.length > size ? source.slice(0, size - 1) + " …" : source;
    } else {
      return '';
    }
  }

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }

  refreshPagination() {
    let dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  }

  filterResults() {
    this.pagination.page = 1;
    let cols = ['Question', 'QuestionGroupType'];
    let results: any = this.questionList;
    if (this.searchText && this.searchText.length > 1) {
      let pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.questionList, this.searchText, cols, this.questionList);
    }
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }

  setAnswerMinMax(Answer, minMax, AnsTypeId) {
    let ans = "";
    if (AnsTypeId == 7) {
      let existingAns = Answer.split('^');
      ans = (minMax == 1) ? existingAns[0] : existingAns[1];
    }
    return ans;
  }

  yesNoLabel = "No";
  setYesNoLabelValue(e) {
    if (e.target.checked) {
      this.yesNoLabel = "Yes";
      this.existingYesNo = true;
    } else {
      this.yesNoLabel = "No";
      this.existingYesNo = false;
    }
  }
  setQuestionGroupTypeSetting(param) {
    let inputType = param.QuestionGroupTypeID;
    switch (inputType) {
      case 1:
        {
          this.isMandatory=true;
          this.isChecklist=false;
          this.isAnsTypeReadOnly=false;
        }

      case 2:
        {
          this.isMandatory=true;
          this.isChecklist=false;
          this.isAnsTypeReadOnly=false;
        }

      case 3:
        {
          this.isMandatory=true;
          this.isChecklist=false;
          this.isAnsTypeReadOnly=false;
          break;
        }

      case 4:
        {
          this.isMandatory=true;
          this.isChecklist=false;
          this.isAnsTypeReadOnly=false;
          break;
        }

      case 5:
        {
          this.isMandatory=true;
          this.isChecklist=false;
          this.isAnsTypeReadOnly=false;
          break;
        }

      case 6:
        {
          this.objForm.patchValue({
            AnsTypeID: 5
          })
          let obj = {
            AnsTypeId: 5,
            AnswerType: "Yes/No",
            DisplayOrder: 5
          }
          this.getAnstypeID(obj);
          this.isMandatory=false;
          this.isChecklist=true;
          this.isAnsTypeReadOnly=true;

          // .
          break;
        }
      // case 7:
      //   {

      //     break;
      //   }
      case 8:
        {
          this.objForm.patchValue({
            AnsTypeID: 5
          })

          let obj = {
            AnsTypeId: 5,
            AnswerType: "Yes/No"
          }
          this.getAnstypeID(obj);
          this.isMandatory=false;
          this.isChecklist=true;
          this.isAnsTypeReadOnly=true;
          break;
        }

      default:
        console.log("No mach found");
        break;
    }

  }
  QfilterKey
  filteredList
  filterByQuestion(key){
    console.log("🚀filterByQuestion ~ key:", key)
    if (key) {
      this.questionList = this.questionListDB;
      this.filteredList = this.questionList.filter((complaint) => complaint.CMSTypeID !== 2);
      this.filteredList = this.filteredList.filter(item => item.QuestionGroupTypeID === key);
      this.questionList=this.filteredList;
      setTimeout(() => {
        this.filterResults();
      }, 200);
    } else {
      this.getQuestion();
    }
  }
}
