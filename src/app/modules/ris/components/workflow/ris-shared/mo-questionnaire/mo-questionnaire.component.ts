// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Conversions } from '../../../../../../modules/shared/helpers/conversions';
import { ToastrService } from 'ngx-toastr';
import { RisWorklistService } from 'src/app/modules/ris/services/ris-worklist.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../../../environments/environment'
import Swal, { SweetAlertResult } from 'sweetalert2';
import { VisitRemarksService } from 'src/app/modules/remarks/services/visit-remarks.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { VisitResultService } from 'src/app/modules/visit-result-entry/services/visit-result.service';

@Component({
  standalone: false,

  selector: 'app-mo-questionnaire',
  templateUrl: './mo-questionnaire.component.html',
  styleUrls: ['./mo-questionnaire.component.scss']
})
export class MoQuestionnaireComponent implements OnInit {
  @Input() QuestionnairePayload = {
    TPID: null,
    VisitID: null,
    PatientID: null,
    TPCode: null,
    TPName: null,
    PatientName: null,
    RISWorkListID: null,
    ProcessIDParent: null,
    RISStatusID: null,
    WorkflowStatus: null,
    isMetal: null,
    MOBy: null
  };
  @Output() isStatusChanged = new EventEmitter<any>();
  @ViewChild('visitRemarksComp') visitRemarksComp;
  @Output() isDropDownChange = new EventEmitter<any>();

  TPID = null;
  VisitId = null;
  PatientID = null;
  TPCode = null;
  TPName = null;
  TPFullName = null;
  PatientName = null;
  RISWorkListID = null;
  ProcessIDParent = null;
  MOForm: any = "";
  RISStatusID: any = null;
  WorkflowStatus: any = null;
  isMetal: any = null;
  MOBy: any = null;

  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  loggedInUser: UserModel;

  TPQuestions = [];
  visitTests = []

  spinnerRefs = {
    TPQuestionsModalSection: 'TPQuestionsModalSection',
  }

  constructor(
    private questionnaireService: QuestionnaireService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private worklistSrv: RisWorklistService,
    private auth: AuthService,
    private modalService: NgbModal,
    private visitRemarksService: VisitRemarksService,
    private sharedService: SharedService,
    private visitResultsService: VisitResultService

  ) { }

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  confirmMetalPopup = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm Metal...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> that metal is detected?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  saveButtonText = "Save";
  saveButtonIconClass = "fa fa-save";


  ngOnInit(): void {
    this.MOForm = "MO Form";
    this.VisitId = this.QuestionnairePayload.VisitID;
    this.TPCode = this.QuestionnairePayload.TPCode;
    this.TPName = this.QuestionnairePayload.TPName;
    this.TPFullName = this.TPCode + ' - ' + this.TPName;
    this.PatientName = this.QuestionnairePayload.PatientName;
    this.PatientID = this.QuestionnairePayload.PatientID;
    this.TPID = this.QuestionnairePayload.TPID;
    this.RISWorkListID = this.QuestionnairePayload.RISWorkListID;
    this.ProcessIDParent = this.QuestionnairePayload.ProcessIDParent;
    this.RISStatusID = this.QuestionnairePayload.RISStatusID;
    this.WorkflowStatus = this.QuestionnairePayload.WorkflowStatus;
    this.isMetal = this.QuestionnairePayload.isMetal;
    this.MOBy = this.QuestionnairePayload.MOBy;
    this.saveButtonText = this.MOBy ? "Update" : "Save";
    this.saveButtonIconClass = this.MOBy ? "fa fa-edit" : "fa fa-save";
    // console.log("QuestionnairePaylod_", this.QuestionnairePayload)
    this.getCreatinineByPIN();
    this.loadLoggedInUserInfo();
    this.getRadiologistInfo();
    this.getRISTPQuestions(this.QuestionnairePayload.TPID);
    setTimeout(() => {
      this.getMOInterventionTPByVisitID(this.VisitId);
    }, 100);

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  isOutsideReport = false;
  resHtml = "";
  getRISTPQuestions(TPID) {
    this.TPQuestions = []
    const params = {
      TPID: TPID,
      QuestionGroupTypeID: 5,
      VisitID: this.VisitId
    };
    this.spinner.show(this.spinnerRefs.TPQuestionsModalSection);
    this.questionnaireService.getRISTPQuestions(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.TPQuestionsModalSection);
      if (res.StatusCode == 200) {
        const resp = res.PayLoad || [];
        // this.TPFullName = resp[0].TPFullName;
        this.RISWorkListID = resp[0].RISWorkListID;
        const tpq = resp.map(a => ({
          AnsType: a.AnsType,
          AnsTypeId: a.AnsTypeId,
          ChildQuestionID: a.ChildQuestionID,
          DefaultAns: a.DefaultAns, // (a.AnsTypeId == 3 || a.AnsTypeId == 4 || a.AnsTypeId == 5) ? a.DefaultAns.split('^') : a.DefaultAns,
          IsRequired: a.IsRequired,
          MinimumAnswerChar: a.MinimumAnswerChar,
          NextQuestionOnOption: a.NextQuestionOnOption,
          Question: a.Question,
          QuestionID: a.QuestionID,
          RISTPQAnswerID: a.RISTPQAnswerID,
          Answer: (a.AnsTypeId == 5) ? this.setYesNoVal(a.Answer, a.DefaultAns) : this.setAnswerValue(a.AnsTypeId, a.Answer, a.DefaultAns),
          AnswerText: (a.AnsTypeId == 4) ? this.setAnsText(a.Answer, a.DefaultAns) : "",
          QExpectedOptions: (a.AnsTypeId == 3 || a.AnsTypeId == 4) ? this.setOptionValue(a.QExpectedOptions) : "",
          AnswerMin: (a.Answer && a.AnsTypeId == 7) ? this.setAnswerMinMax(a.Answer, 1, a.AnsTypeId) : this.setAnswerMinMax(a.DefaultAns, 1, a.AnsTypeId),
          AnswerMax: (a.Answer && a.AnsTypeId == 7) ? this.setAnswerMinMax(a.Answer, 2, a.AnsTypeId) : this.setAnswerMinMax(a.DefaultAns, 2, a.AnsTypeId),
          SortOrder: a.SortOrder

        }));
        this.TPQuestions = tpq;
        // Check for QuestionID 67 and update confirmation messagef
        const q67Exists = tpq.some(q => q.QuestionID === 67);
        // const q170Exists = tpq.some(q => q.QuestionID === 170);

        const q170 = this.TPQuestions.find(q => q.Question === "Is Creatinine test done from other lab? if Yes, add Lab Name and Attach Report");
        const shouldSaveCreatinine = this.creatinineStatusID < 9 && this.creatinineTPID && (!q170 || q170.Answer === "No");

        const q170Exists = tpq.some(q => q.Question === "Is Creatinine test done from other lab? if Yes, add Lab Name and Attach Report");
        if (q67Exists && this.creatinineTPID && this.creatinineStatusID < 9) {
          // if (shouldSaveCreatinine) {
          this.confirmationPopoverConfig.popoverMessage =
            `Are you <b>sure</b> want to save?<br>
            <div class="d-flex mt-2 align-items-start">
              <div class="text-danger">
                <strong>
                🔔 Important – Creatinine for IV Contrast</strong>
                If <strong>Creatinine for IV Contrast</strong> done at IDC, enter the result in “<strong>Patient's Creatinine Result</strong>”. This will finalize the report with your name and make it accessible to the patient.
                If Creatinine done <strong>outside IDC</strong>, click “<strong>Check Button</strong>” to avoid finalizing the report as it wasn't done at IDC.<br>
                ✅ Double-check before saving. Once entered in the Questionnaire/History Form, it cannot be edited.<span class="blink-red"><br>
                ⚠️ Inaccurate results can lead to life-threatening complications during scanning.</span>
                
              </div>
            </div>`;
        }
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.TPQuestionsModalSection);
    })
  }

  ////////// begin::Creaatinine value validation ///////////
  restrictCreatinineInput(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const inputChar = event.key;

    // Allow control keys
    if (allowedKeys.includes(inputChar)) return;

    // Allow only numbers and one decimal point
    const currentValue = (event.target as HTMLInputElement).value;

    // Block if not a digit or decimal point
    if (!/^[0-9.]$/.test(inputChar)) {
      event.preventDefault();
      return;
    }

    // Only one decimal point allowed
    if (inputChar === '.' && currentValue.includes('.')) {
      event.preventDefault();
      return;
    }
  }

  onCreatininePaste(event: ClipboardEvent, q: any) {
    const pasteData = event.clipboardData?.getData('text') || '';

    // Remove unwanted characters
    const cleanValue = pasteData.replace(/[^0-9.]/g, '');

    // More than one decimal check
    if ((cleanValue.match(/\./g) || []).length > 1) {
      event.preventDefault();
      this.toastr.error('Only one decimal point is allowed.', 'Invalid Format');
      return;
    }

    // Parse value
    const value = parseFloat(cleanValue);

    // Numeric check
    if (isNaN(value)) {
      event.preventDefault();
      this.toastr.error('Creatinine value must be a number.', 'Invalid Input');
      return;
    }

    // Decimal places check
    if (cleanValue.includes('.') && cleanValue.split('.')[1].length > 2) {
      event.preventDefault();
      this.toastr.error('Creatinine value can have a maximum of 2 decimal places.', 'Invalid Format');
      return;
    }

    // Range check
    if (value < 0.1 || value > 20) {
      event.preventDefault();
      this.toastr.error('Creatinine value must be between 0.1 and 20 mg/dL.', 'Invalid Range');
      return;
    }

    // If all validations pass, allow paste but clean formatting
    event.preventDefault();
    q.Answer = value % 1 === 0
      ? value.toString()
      : value.toFixed(2).replace(/\.?0+$/, '');
  }


  validateCreatinineValue(q: any) {
    if (q.Answer !== null && q.Answer !== undefined && q.Answer !== '') {
      let answerStr = q.Answer.toString().trim();

      // Remove all invalid characters
      answerStr = answerStr.replace(/[^0-9.]/g, '');

      // Only one decimal allowed
      const decimalCount = (answerStr.match(/\./g) || []).length;
      if (decimalCount > 1) {
        this.toastr.error('Only one decimal point is allowed.', 'Invalid Format');
        q.Answer = '';
        return;
      }

      // Parse number
      const value = parseFloat(answerStr);

      // If not a number
      if (isNaN(value)) {
        this.toastr.error('Creatinine value must be a number.', 'Invalid Input');
        q.Answer = '';
        return;
      }

      // Decimal places check
      if (answerStr.includes('.') && answerStr.split('.')[1].length > 2) {
        this.toastr.error('Creatinine value can have a maximum of 2 decimal places.', 'Invalid Format');
        q.Answer = '';
        return;
      }

      // Range check (including 0.x case)
      if (value < 0.1 || value > 20) {
        this.toastr.error('Creatinine value must be between 0.1 and 20 mg/dL.', 'Invalid Range');
        q.Answer = '';
        return;
      }

      // Format nicely (remove trailing zeros but keep 2 decimals if needed)
      q.Answer = value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
    }
  }
  ////////// end::Creaatinine value validation /////////////


  getMOInterventionTPByVisitID(VisitID) {
    this.visitTests = []
    const params = {
      VisitID: VisitID
    };
    this.questionnaireService.getMOInterventionTPByVisitID(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.visitTests = res.PayLoad || [];
        this.RadiologistID = this.visitTests[0].RadiologistID || null;
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
    })
  }

  isMinCharLimit = true;
  isDataPicker = false;
  isYesNo = false;
  isOptionBox = false;
  isMinMax = false;
  isReadonly = false;

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

  setExistingDeaultAns(inputType, existingDefaultVal) {
    const inputCondition = inputType
    switch (inputCondition) {
      // case 1:
      //   {
      //     this.isMinCharLimit = true;
      //     this.isDataPicker = false;
      //     this.isOptionBox = false;
      //     this.isMinMax = false;
      //     this.isYesNo = false;
      //     break;
      //   }
      case 3:
        {
          const existingDefaultAns = existingDefaultVal.split(',');
          const arrOptions1: any =
            existingDefaultAns.map(a => ({
              option: a,
            }));
          return arrOptions1;
          break;
        }

      case 5:
        {
          const existingDefaultAns = existingDefaultVal.split(',');
          const arrOptions: any =
            existingDefaultAns.map(a => ({
              option: a,
            }));
          return arrOptions;
          break;
        }
      // case 5:
      //   {
      //     this.isYesNo = true;
      //     this.isOptionBox = false;
      //     this.isMinCharLimit = false;
      //     this.isDataPicker = false;
      //     this.isMinMax = false;
      //     break;
      //   }

      case 6:
        {

          return Conversions.getDateObjectByGivenDate(existingDefaultVal);
          break;
        }
      case 7:
        {
          const existingDefaultAns = existingDefaultVal.split('-');
          return {
            minVal: existingDefaultAns[0],
            maxVal: existingDefaultAns[1],
          }
          break;
        }

      default:
        console.log("No mach found");
        return "";
        break;
    }
  }
  vd = [];
  getLoadedVisitDocs(e) {
    this.vd = e;
  }
  isMinCharValid = false;
  validateMinChar(Answer, MinimumAnswerChar) {
    if (MinimumAnswerChar && Answer.length < MinimumAnswerChar) {
      this.isMinCharValid = true;
    } else {
      this.isMinCharValid = false;
    }
  }
  insertUpdateRISTPQAnswer() {
    let isValidRequired = false;
    this.TPQuestions.forEach(a => {
      if (a.IsRequired && !a.Answer && a.AnsTypeId != 5) {
        isValidRequired = true;
      }
    })
    let isMinCharValid = false;
    this.TPQuestions.forEach(a => {

      if (a.MinimumAnswerChar && a.Answer.length < a.MinimumAnswerChar) {
        isMinCharValid = true;
      }
    })

    if (isValidRequired && isMinCharValid) {
      this.toastr.error("Please Provide the required data with minimum characters");
    } else if (isValidRequired) {
      this.toastr.error("Please Provide the required information with valid data");
    }
    else if (isMinCharValid) {
      this.toastr.error("Please Provide minimum characters");
    }
    else {
      // this.toastr.success("Everything is ok");
      //return;
      this.spinner.show(this.spinnerRefs.TPQuestionsModalSection);
      this.disabledButton = true;
      this.isSpinner = false;
      // const dataObj = {};
      const dataObj = {
        RISWorkListID: this.RISWorkListID,
        TPID: this.TPID,
        VisitID: Number(this.VisitId),
        PatientID: this.PatientID,
        LocID: this.loggedInUser.locationid,
        RISStatusID: 2,//will add it from lookup table
        CheckINBy: null,
        CheckOutBy: null,
        MOBy: this.loggedInUser.userid,
        AppointmentID: 1,
        RadiologistID: this.RadiologistID,
        CreatedBy: this.loggedInUser.userid,
        tblRISTPQAnswer: this.TPQuestions.map(a => (
          {
            RISTPQAnswerID: a.RISTPQAnswerID,//null null because of new entry with update as well
            VisitID: Number(this.VisitId),
            TPID: this.TPID,
            QuestionID: a.QuestionID,
            Answer: (a.AnsTypeId == 7) ? this.getAnswerMinMax(a.AnswerMin, a.AnswerMax) : this.getAnswerValue(a.AnsTypeId, a.Answer, a.AnswerText)//(a.Answere && a.AnsTypeId==6)? Conversions.formatDateObject(a.Answere):a.Answere
          }
        ))
      };
      this.worklistSrv.InsertUpdateRISTPQAnswer(dataObj).subscribe((data: any) => {
        // if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          // debugger
          const q170 = this.TPQuestions.find(q => q.Question === "Is Creatinine test done from other lab? if Yes, add Lab Name and Attach Report");
          const shouldSaveCreatinine =
            this.creatinineStatusID < 9 &&
            !!this.creatinineTPID && // explicitly cast to boolean
            (typeof q170 === 'undefined' || q170.Answer === 'No');
          if (shouldSaveCreatinine) {
            this.saveCreatinineResult(dataObj.tblRISTPQAnswer);
          }
          this.spinner.hide(this.spinnerRefs.TPQuestionsModalSection);
          this.toastr.success(data.Message);
          this.MOBy = !this.MOBy ? this.loggedInUser.userid : this.MOBy;
          this.saveButtonText = this.MOBy ? "Update" : "Save";
          this.saveButtonIconClass = this.MOBy ? "fa fa-edit" : "fa fa-save";
          //  setTimeout(() => {
          this.disabledButton = false;
          this.isSpinner = true;
          // this.modalService.dismissAll();
          this.isStatusChanged.emit(this.MOBy)
          this.RISWorkListID = data.PayLoadStr;
          //  }, 600);
          this
        } else {
          this.spinner.hide(this.spinnerRefs.TPQuestionsModalSection);
          this.toastr.error(data.Message)
          this.disabledButton = false;
          this.isSpinner = true;
        }
        // }
      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.TPQuestionsModalSection);
        this.disabledButton = false;
        this.isSpinner = true;
        this.toastr.error('Connection error');
      })
    }

  }
  saveCreatinineResult(obj: any[]) {
    // Validate input
    if (!Array.isArray(obj) || obj.length === 0) {
      this.toastr.error("Invalid input data for creatinine result.");
      return;
    }

    // Find the answer for QuestionID 67
    const q67 = obj.find(item => item?.QuestionID === 67 && item?.Answer);

    // Extract and clean the result value
    let cleanedResult = "";
    if (q67 && typeof q67.Answer === 'string') {
      // Remove non-numeric characters except dot, and extract first match
      const match = q67.Answer.match(/[\d.]+/);
      cleanedResult = match ? match[0] : "";
    }

    if (!cleanedResult) {
      this.toastr.warning("Creatinine result is missing or invalid. To DS the Creatinine Please provide the result", "Invalid Creatinine Value");
      return;
    }
    const _params = {
      UserId: this.loggedInUser.userid,
      VisitId: this.VisitId,
      TPId: this.creatinineTPID,
      Result: "",
      TestResults: [
        {
          VisitID: this.VisitId,
          TestID: this.creatinineTPID,
          ParamID: this.creatinineParamID,//638
          Result: cleanedResult
        }
      ]
    };
    this.visitResultsService.updatePatientVisitTestStatusFoRIS(_params).subscribe(
      (res: any) => {
        const result = JSON.parse(res.PayLoadStr)
        // if (res && res.StatusCode === 200) {
        //   this.creatinineStatusID = 9;
        //   this.toastr.success("Creatinine result saved successfully");
        // } else {
        //   this.toastr.error("Error saving creatinine result");
        // }
        if (result[0].Result == 1) {
          this.toastr.success(res.Message);
          this.creatinineStatusID = 9;
        }
        else if (result[0].Result == 2) {
          this.toastr.error(res.Message);
          this.creatinineStatusID = 9;
        }
        else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("An error occurred while saving creatinine result");
      }
    );
  }

  getAnswerMinMax(minVal = "", maxVal = "") {
    const ans = minVal + '^' + maxVal;
    return ans;
  }
  getAnswerValue(AnsTypeId, Answer, AnswerText) {

    switch (AnsTypeId) {
      case 1:
        {
          return Answer;
          break;
        }

      case 3:
        {
          return Answer;
          break;
        }
      case 4:
        {
          return Answer + "^" + AnswerText;
          break;
        }
      case 5:
        {
          const ans = (Answer || Answer == "Yes") ? "Yes" : "No"
          return ans;
          break;
        }

      case 6:
        {
          const ans = (Answer || Answer != "") ? Conversions.formatDateObject(Answer) : "";
          return ans;
          break;
        }
      case 7:
        {
          return Answer;
          break;
        }

      default:
        console.log("No mach found");
        return Answer;
        break;
    }

  }
  setYesNoVal(Answer, defaultAns) {
    const ans = (Answer == "Yes") ? true : false;
    // if((Answer=="" || !Answer) && (defaultAns=="Yes" || defaultAns=="1" || defaultAns==1)){
    //   ans=true;
    // }else if((Answer=="" || !Answer) && (defaultAns=="false"||defaultAns=="0")){
    //   ans=false;
    // }else if(Answer=="true"){
    //   ans=true;
    // }else if(Answer=="false"){
    //   ans=false;
    // }else{
    //   ans=false;
    // }
    return ans;
  }

  setAnsText(Answer, defaultAns) {
    if (Answer && Answer != "" && Answer != "•") {
      if (Answer.includes("^") && !Answer.includes('undefined')) {
        Answer = Answer.split("^");
        return Answer[1];
      } else {
        return "";
      }
    } else if (defaultAns && defaultAns != "•" && defaultAns != "") {
      if (defaultAns.includes("^")) {
        defaultAns = defaultAns.split("^");
        return defaultAns[1];
      } else {
        return "";
      }

    } else {
      return "";
    }
  }

  setOptionValue(param) {
    let arrExpectedOptions = [];
    if (param && param != "") {
      const existinEexpectedOptions = param.split('^');
      arrExpectedOptions =
        existinEexpectedOptions.map(a => ({
          option: a,
        }));
    }
    return arrExpectedOptions;
  }
  setAnswerValue(AnsTypeId, Answer, DefaultAns) {
    switch (AnsTypeId) {
      case 1:
      case 2:
        {
          const ans = (Answer && Answer != "") ? Answer : DefaultAns
          return ans;
          break;
        }
      case 3:
        {
          const ans = (Answer && Answer != "") ? Answer : DefaultAns
          return ans;
          break;
        }
      case 4:
        {
          const ans = (Answer && Answer != "") ? Answer : DefaultAns
          if (ans) {
            const ansFormate = ans.split("^") || null;
            return ansFormate[0];
          }
          else {
            return ans;
          }
          // return ansFormate[0];
          // else ansFormate
          break;
        }
      case 5:
        {
          const ans = (Answer == "Yes") ? true : false;
          return ans;
          break;
        }

      case 6:
        {
          const ans = (Answer) ? Conversions.getDateObjectByGivenDate(Answer) : Conversions.getDateObjectByGivenDate(DefaultAns);
          return ans;
          break;
        }
      case 7:
        {
          let existingAns = "";
          if (Answer) {
            existingAns = Answer.split('-');
            const minVal = existingAns[0];
            const maxVal = existingAns[1];
          }

          return existingAns;
          break;
        }

      default:
        console.log("No mach found");
        return Answer;
        break;
    }

  }
  setAnswerMinMax(Answer, minMax, AnsTypeId) {
    let ans = "";
    if (AnsTypeId == 7) {
      const existingAns = Answer.split('^');
      ans = (minMax == 1) ? existingAns[0] : existingAns[1];
    }
    return ans;
  }
  getMOIntervenedTestsByTPID(e) {
    const TPID = e.target.value;
    if (TPID) {
      const visitTest = this.visitTests.find(a => a.TPID == TPID);
      this.TPFullName = visitTest.TPCode + ' - ' + visitTest.TPName;
      this.getRISTPQuestions(TPID);
      const doropDownObj = { TPID: TPID, VisitID: this.VisitId }
      this.getCreatinineByPIN();
      this.isDropDownChange.emit(doropDownObj);
    }
  }
  /////////////////Mark Sensitivity////////////////////////////
  ProcessID = 1;
  options = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2, disabled: true },
    { label: 'Option 3', value: 3 },
  ];
  markSensitivity_() {
    Swal.fire({
      title: 'Mark Sensitivity',
      text: 'Are you Sure want to change sensitivity?',
      // icon: 'warning',
      input: 'radio',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select any option'; // This will show an error message if the input value is empty and modal will not close
        }
      },
      inputOptions: {
        // 1: 'Normal',
        2: 'Urgent',
        3: 'Critical'
      },
      // inputValue: (row.ProcessId==1)?2:row.ProcessId,
      showCancelButton: true,
      confirmButtonText: '<i class="ti-check text-white"></i> Yes',
      cancelButtonText: '<i class="ti-close text-white"></i> No',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'sweet-alert-confirm-btn-danger',
        // input: 'sweet-alert-text-area'
      },
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.ProcessID = result.value;
        this.updateVisitTestPriority()
      }
    });
  }

  ProcessRemarks = "";
  isChkUrgent = '';
  isChkCritical = '';
  async markSensitivity() {
    (this.ProcessIDParent == 2) ? this.isChkUrgent = 'checked' : this.isChkUrgent = '';
    (this.ProcessIDParent == 3) ? this.isChkCritical = 'checked' : this.isChkCritical = '';
    const { value: formValues } = await Swal.fire({
      title: 'Mark Sensitivity',
      html:
        `<strong class="text-primary">` + this.PatientName + `: ` + this.VisitId + `-` + this.TPCode + `</strong>
        <p>Are you Sure want to change sensitivity?</p>
        <div>
          <input type="radio" id="swal-radio1" name="swal-radio" `+ this.isChkUrgent + ` value="2">
          <label for="swal2-label"><span class="swal2-label mr-4">Urgent</span></label>
          <input type="radio" id="swal-radio2" name="swal-radio" `+ this.isChkCritical + ` value="3">
          <label for="swal-radio2"><span class="swal2-label">Critical<span></label>
        </div>
        <textarea id="swal-textarea" class="form-control" placeholder="Enter Remarks"></textarea>`,
      inputValidator: (value) => {
        if (!value) {
          return 'Please select any option'; // This will show an error message if the input value is empty and modal will not close
        }
      },
      inputValue: this.ProcessID,
      showCancelButton: true,
      confirmButtonText: '<i class="ti-check text-white"></i> Yes',
      cancelButtonText: '<i class="ti-close text-white"></i> No',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'sweet-alert-confirm-btn-danger',
        input: 'custom-radio'
      },
      preConfirm: (res) => {
        const processID = (document.querySelector('input[name="swal-radio"]:checked') as HTMLInputElement)?.value;
        const processRemarks = (document.getElementById('swal-textarea') as HTMLTextAreaElement).value;
        if (!processID && processRemarks == '') {
          Swal.showValidationMessage('Please select any option and provide remarks');
        } else if (!processID) {
          Swal.showValidationMessage('Please select any option');
        } else if (processRemarks == '') {
          Swal.showValidationMessage('Please enter remarks');
        }
        else {
          return [
            (document.querySelector('input[name="swal-radio"]:checked') as HTMLInputElement)?.value,
            (document.getElementById('swal-textarea') as HTMLTextAreaElement).value,
          ]
        }

      }
    });

    if (formValues[0] && formValues[1] != '') {
      this.ProcessID = Number(formValues[0]);
      const remarksPrepend = this.ProcessID == 2 ? "Urgent Remarks for " + this.TPCode + ": " : "Critical Remarks for " + this.TPCode + ": ";
      this.ProcessRemarks = remarksPrepend + formValues[1]
      this.updateVisitTestPriority()
      this.saveVisitRemarks()
    } else {
      this.toastr.error("Something went wrong please try again!")
    }
  }


  updateVisitTestPriority() {
    const objParams = {
      TPID: this.TPID,
      VisitID: Number(this.VisitId),
      ProcessID: this.ProcessID,
      Remarks: this.ProcessRemarks.trim(),
      CreatedBy: this.loggedInUser.userid
    }
    this.questionnaireService.updateVisitTestPriority(objParams).subscribe((res: any) => {
      const respons = JSON.parse(res.PayLoadStr);
      if (res.StatusCode == 200) {
        this.ProcessIDParent = this.ProcessID;
        this.toastr.success(res.Message, "Test Sensitivity");
        this.isStatusChanged.emit(1)
      }
    }, (err) => {
      console.log(err),
        this.toastr.error("Some error occured, Please contact system administrator")
    })
  }
  saveVisitRemarks() {
    const params = {
      VisitId: Number(this.VisitId),
      ModuleName: 'MO Questionnaire',
      Remarks: this.ProcessRemarks.trim(),
      Priority: 1,
      UserId: this.loggedInUser.userid,
    };
    if (!params.VisitId || !params.Remarks) {
      return;
    }
    this.spinner.show();
    this.visitRemarksService.saveVisitRemarks(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        this.ProcessRemarks = '';
        this.ProcessID = 1;
        this.toastr.success('Remarks saved successfully');
        // reload remarks in child
        if (this.visitRemarksComp) {
          this.visitRemarksComp.getVisitRemarks();
        }
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
      this.toastr.error('Error Saving Remarks');
    });
  }

  isMetalChecked = false;
  checkboxEvent: any;
  pendingCheckState: boolean | null = null;

  openConfirmationPopover(event: any) {
    // Prevent default checkbox toggle behavior
    event.preventDefault();

    // Store the intended state (toggle the current state)
    this.pendingCheckState = !this.isMetalChecked;

    // Store the event for later use in confirmation
    this.checkboxEvent = event;
  }

  confirmSelection() {
    // Set the checkbox state to the intended state
    if (this.pendingCheckState !== null) {
      this.isMetalChecked = this.pendingCheckState;
    }

    // Trigger the metalDetected function
    this.metalDetected(this.checkboxEvent);

    // Reset the pending check state
    this.pendingCheckState = null;
  }

  cancelSelection() {
    // Do nothing on cancel, the checkbox remains unchanged
    this.pendingCheckState = null;
  }

  metalDetected(event) {

    const params = {
      PatientID: this.PatientID,
      isMetal: this.isMetalChecked ? 1 : 0,  // 1 for is Metal, 0 for not isMetal
      ModifiedBy: this.loggedInUser.userid,  //logged in User
    };
    console.log("🚀 ~ MoQuestionnaireComponent ~ metalDetected ~ event:", params);
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_PATIENT_ISMETAL, params).subscribe(
      (resp: any) => {
        if (resp.StatusCode === 200) {
          if (resp.PayLoad[0].Result === 1) {
            this.toastr.success(resp.Message);
            this.isMetal = true;
          }
          else {
            this.toastr.error(resp.Message);
          }
        }
        else {
          this.toastr.error(resp.Message);
        }
      },
      (err) => {
        console.log("Error:", err);
      }
    );
  }


  creatinineTPID = null;
  creatinineParamID = null;
  creatinineStatusID = null;
  /**
   * Retrieves the creatinine TPID for the given visit
   * @param {void} none
   * @returns {void}
   */
  getCreatinineByPIN(): void {
    const params = {
      VisitID: this.VisitId
    };
    this.questionnaireService.getCreatinineByPIN(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        const resp = res.PayLoad || [];
        // console.log("creatinine resp_________________", resp);
        this.creatinineTPID = resp[0].TPId || null;
        this.creatinineParamID = resp[0].ParamID || null;
        this.creatinineStatusID = resp[0].StatusId || null;
      } else {
        console.error('Something went wrong while loading creatinine test! Please contact administrator');
      }
    }, (err) => {
      console.error(err);
    });
  }

  RadiologistID = null;

  radoiologistList = [];
  getRadiologistInfo() {
    const params = {
      EmpID: null
    };
    this.questionnaireService.getRadiologistInfo(params).subscribe((res: any) => {
      this.radoiologistList = res.PayLoadDS['Table'] || [];
      // console.log("Radiologists are:", this.radoiologistList)
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
}