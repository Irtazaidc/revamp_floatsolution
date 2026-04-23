// @ts-nocheck
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SecurityContext, SimpleChanges, ViewChild, OnChanges, OnDestroy } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from '../../../../shared/helpers/api-routes';
import { TechnicianService } from '../../../services/technician.service';
import { ActivatedRoute } from '@angular/router';
import { AppPopupService } from '../../../../shared/helpers/app-popup.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as CKEditor from 'ckeditor4-angular';
import { PrintReportService } from 'src/app/modules/print-reports/services/print-report.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import moment from 'moment';
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  standalone: false,

  selector: 'app-reporting-window',
  templateUrl: './reporting-window.component.html',
  styleUrls: ['./reporting-window.component.scss']
})
export class ReportingWindowComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('userVerificationModal') userVerificationModal;
  @ViewChild('addendumnModal') addendumnModal;
  modalPopupRef: NgbModalRef;
  @Input() isSavedWord = null;

  @Input() ParamsPayload = {
    TPID: null,
    VisitID: null,
    PatientID: null,
    TPCode: null,
    TPName: null,
    PatientName: null,
    RISWorkListID: null,
    StatusId: null,
    ProcessIDParent: null,
    PID: null,
    TestStatus: null,
    TranscribedBy: null,
    RISStatusID: null,
    tempDSDateTime: null,
    EditExpiryTime: null,
    currentDateTime: null,
    ReportDelayTime: null,
    isCaseStudyTab: null,
    isMetal: null,
    InitByEmpID: null,
    DSByEmpID: null,
    ActiveTab: null,
    IsAIAssistEnable: null,
    RISRequestAIID: null,
    LocId: null,
    isCompareStudy: null,
    SubSectionId: null
  };
  @Output() isStatusChanged = new EventEmitter<any>();

  TPID = null;
  VisitId = null;
  PatientID = null;
  TPCode = null;
  TPName = null;
  TPFullName = null;
  PatientName = null;
  RISWorkListID = null;
  StatusId = null;
  ProcessIDParent = null;
  MOForm: any = "";
  PID = null;
  TestStatus = null;
  TranscribedBy = null;
  RISStatusID = null;

  tempDSDateTime = null;
  EditExpiryTime = null;
  currentDateTime = null;
  ReportDelayTime = null;
  isCaseStudyTab = null;
  isMetal = null;
  isDoctorFeedback = null;
  InitByEmpID = null;
  DSByEmpID = null;
  ActiveTab = null;

  isEditingMode = false;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonInitial = false;
  disabledButtonLock = false;
  disabledButtonCancel = false;
  isSpinner = true;//Hide Loader
  isSpinnerInitial = true;
  isSpinnerLock = true;
  isSpinnerCancel = true;
  isEditorDisabled = true;
  IsAIAssistEnable = null;
  isCompareStudy = null;
  RISRequestAIID = null;
  LocId = null;
  SubSectionId = null;
  isDSFinal = false;

  loggedInUser: UserModel;

  TPQuestions = [];
  visitTests = []
  visitTestsAssigner = []

  spinnerRefs = {
    listSection: 'listSection',
    editorSection: 'editorSection',
    comparativeSection: 'comparativeSection',
  }

  public config = {
    toolbar: [
      ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
      ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
      ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
      ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
      ['Link', 'Unlink', 'Anchor'],
      ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
      ['Styles', 'Format', 'Font', 'FontSize', 'lineheight'],
      ['TextColor', 'BGColor'], // Add 'TextColor' button
      ['Maximize', 'ShowBlocks'],
    ],
    // uiColor: '#ffffff',
    toolbarGroups: [{ name: 'clipboard', groups: ['clipboard', 'undo'] },
    { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
    { name: 'links' }, { name: 'insert' },
    { name: 'document', groups: ['mode', 'document', 'doctools'] },
    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
    { name: 'styles' },
    { name: 'colors' }],
    // skin: 'moono', //kama default
    resize_enabled: false,
    removePlugins: 'elementspath,save,magicline',
    extraPlugins: 'divarea,smiley,justify,indentblock,colordialog,scayt',
    // colorButton_foreStyle: {
    //   element: 'font',
    //   attributes: { 'color': '#(color)' }
    // },
    scayt_autoStartup: true,
    colorButton_foreStyle: {
      element: 'span', // Change to 'span' for text color
      attributes: { 'style': 'color: #(color)' } // Set the style attribute for text color
    },
    // line_height: {
    //   options: [
    //     // Define the available line height options
    //     { model: '1.0', title: 'Single', class: 'ck-line-height-1' },
    //     { model: '1.15', title: '1.15', class: 'ck-line-height-1-15' },
    //     { model: '1.5', title: '1.5', class: 'ck-line-height-1-5' },
    //     { model: '2.0', title: 'Double', class: 'ck-line-height-2' }
    //     // Add more options as needed
    //   ],
    //   extraPlugins: 'divarea,smiley,justify,indentblock,colordialog,font,colorbutton',
    // },

    height: 400,
    removeDialogTabs: 'image:advanced;link:advanced',
    // removeButtons: 'Subscript,Superscript,Anchor,Source,Table',
    removeButtons: '',
    format_tags: 'p;h1;h2;h3;pre;div',
  };
  SysInfo: any = {};
  ServersInfo: any = [];


  // getConfig() {
  //   return {
  //     toolbar: [
  //       ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
  //       ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
  //       ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
  //       ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
  //       ['Link', 'Unlink', 'Anchor'],
  //       ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
  //       ['Styles', 'Format', 'Font', 'FontSize', 'lineheight'],
  //       ['TextColor', 'BGColor'], // Add 'TextColor' button
  //       ['Maximize', 'ShowBlocks'],
  //     ],
  //     uiColor: '#ffffff',
  //     toolbarGroups: [{ name: 'clipboard', groups: ['clipboard', 'undo'] },
  //     { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
  //     { name: 'links' }, { name: 'insert' },
  //     { name: 'document', groups: ['mode', 'document', 'doctools'] },
  //     { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
  //     { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
  //     { name: 'styles' },
  //     { name: 'colors' }],
  //     // skin: 'moono', //kama default
  //     resize_enabled: false,
  //     removePlugins: 'elementspath,save,magicline,contextmenu',
  //     extraPlugins: 'divarea,smiley,justify,indentblock,colorbutton,colordialog,font,scayt',//scayt
  //     // colorButton_foreStyle: {
  //     //   element: 'font',
  //     //   attributes: { 'color': '#(color)' }
  //     // },
  //     scayt_autoStartup: true,
  //     scayt_svcHost: 'svc.webspellchecker.net',
  //     colorButton_foreStyle: {
  //       element: 'span', // Change to 'span' for text color
  //       attributes: { 'style': 'color: #(color)' } // Set the style attribute for text color
  //     },
  //     // line_height: {
  //     //   options: [
  //     //     // Define the available line height options
  //     //     { model: '1.0', title: 'Single', class: 'ck-line-height-1' },
  //     //     { model: '1.15', title: '1.15', class: 'ck-line-height-1-15' },
  //     //     { model: '1.5', title: '1.5', class: 'ck-line-height-1-5' },
  //     //     { model: '2.0', title: 'Double', class: 'ck-line-height-2' }
  //     //     // Add more options as needed
  //     //   ],
  //     //   extraPlugins: 'divarea,smiley,justify,indentblock,colordialog,font,colorbutton',
  //     // },

  //     height: 400,
  //     removeDialogTabs: 'image:advanced;link:advanced',
  //     // removeButtons: 'Subscript,Superscript,Anchor,Source,Table',
  //     removeButtons: '',
  //     format_tags: 'p;h1;h2;h3;pre;div',
  //     // Add other configuration options as needed
  //     on: {
  //       key: (event: any) => {
  //         const editor = event.editor;
  //         const selection = editor.getSelection();
  //         if (event.data.keyCode === 32) {
  //           const range = selection.getRanges()[0];
  //           const selectedText = this.getPreviousWord(range);
  //           const codeObj = this.codesList.find(a => a.TextCode === selectedText);
  //           if (codeObj) {
  //             const wordToReplace = codeObj.TextHTMLTag;
  //             const textCode = codeObj.TextCode;
  //             if (selectedText === textCode) {
  //               //removing the matched word to replace with its description
  //               const previousWordRange = range.clone();
  //               previousWordRange.setEnd(range.startContainer, range.startOffset);
  //               previousWordRange.setStart(previousWordRange.startContainer, previousWordRange.startOffset - selectedText.length);
  //               previousWordRange.deleteContents();
  //               //Now add the new Description
  //               const newHtml = wordToReplace;
  //               editor.insertHtml(newHtml);
  //               this.cdr.detectChanges();
  //             }
  //           }
  //           // else {
  //           //   this.toastr.info('No code found...');
  //           // }
  //         } else {
  //           editor.setHtml('');
  //         }
  //       }
  //     }
  //   };
  // }


  //START: Testing CK Editor  
  // getConfig() {
  //   return {
  //     toolbar: [
  //       ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
  //       ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
  //       ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
  //       ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
  //       ['Link', 'Unlink', 'Anchor'],
  //       ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
  //       ['Styles', 'Format', 'Font', 'FontSize', 'lineheight'],
  //       ['TextColor', 'BGColor'],
  //       ['Maximize', 'ShowBlocks'],
  //     ],
  //     uiColor: '#ffffff',
  //     toolbarGroups: [
  //       { name: 'clipboard', groups: ['clipboard', 'undo'] },
  //       { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
  //       { name: 'links' },
  //       { name: 'insert' },
  //       { name: 'document', groups: ['mode', 'document', 'doctools'] },
  //       { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
  //       { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
  //       { name: 'styles' },
  //       { name: 'colors' }
  //     ],
  //     extraPlugins: 'divarea,smiley,justify,indentblock,colorbutton,colordialog,font,tab',
  //     colorButton_foreStyle: {
  //       element: 'span',
  //       attributes: { 'style': 'color: #(color)' }
  //     },
  //     resize_enabled: false,
  //     removePlugins: 'elementspath,save,magicline,contextmenu',
  //     height: 400,
  //     removeDialogTabs: 'image:advanced;link:advanced',
  //     removeButtons: '',
  //     format_tags: 'p;h1;h2;h3;pre;div',
  //     undo: {
  //       undoStackSize: 200,
  //     },
  //     tabSpaces: 4, // Sets TAB to insert 4 spaces

  //     on: {
  //       instanceReady: function() {
  //         this.document.on('keydown', (event) => {
  //           const editor = event.editor;
  //           const selection = editor.getSelection();

  //           // Handle TAB key to insert spaces
  //           if (event.data.$.keyCode === 9) { // TAB key
  //             event.cancel(); // Prevent default behavior
  //             const tabSize = new Array(this.tabSpaces + 1).join(' '); // Create a string of spaces
  //             editor.insertText(tabSize); // Insert spaces at the current cursor position
  //           }
  //         });
  //       },
  //       key: (event) => {
  //         const editor = event.editor;
  //         const selection = editor.getSelection();

  //         // Handling SPACEBAR key for replacing text code
  //         if (event.data.keyCode === 32) {
  //           const range = selection.getRanges()[0];
  //           const selectedText = this.getPreviousWord(range);
  //           const codeObj = this.codesList.find(a => a.TextCode === selectedText);
  //           if (codeObj) {
  //             const wordToReplace = codeObj.TextHTMLTag;
  //             const textCode = codeObj.TextCode;
  //             if (selectedText === textCode) {
  //               const previousWordRange = range.clone();
  //               previousWordRange.setEnd(range.startContainer, range.startOffset);
  //               previousWordRange.setStart(previousWordRange.startContainer, previousWordRange.startOffset - selectedText.length);
  //               previousWordRange.deleteContents();
  //               const newHtml = wordToReplace;
  //               editor.insertHtml(newHtml);
  //               this.cdr.detectChanges();
  //             }
  //           }
  //         }
  //       }
  //     }
  //   };
  // }
  getConfig() {
    return {
      toolbar: [
        ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
        ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
        ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
        ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
        ['Link', 'Unlink', 'Anchor'],
        ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
        ['Styles', 'Format', 'Font', 'FontSize', 'lineheight'],
        ['TextColor', 'BGColor'],
        ['Maximize', 'ShowBlocks'],
      ],
      uiColor: '#ffffff',
      toolbarGroups: [
        { name: 'clipboard', groups: ['clipboard', 'undo'] },
        { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
        { name: 'links' },
        { name: 'insert' },
        { name: 'document', groups: ['mode', 'document', 'doctools'] },
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
        { name: 'styles' },
        { name: 'colors' }
      ],
      extraPlugins: 'divarea,smiley,justify,indentblock,colorbutton,colordialog,font,tab',
      colorButton_foreStyle: {
        element: 'span',
        attributes: { 'style': 'color: #(color)' }
      },
      resize_enabled: false,
      removePlugins: 'elementspath,save,magicline,contextmenu',
      height: 400,
      removeDialogTabs: 'image:advanced;link:advanced',
      removeButtons: '',
      format_tags: 'p;h1;h2;h3;pre;div',
      undo: {
        undoStackSize: 200,
      },
      tabSpaces: 4,

      on: {
        instanceReady: function () {
          this.document.on('keydown', (event) => {
            const editor = event.editor;
            const selection = editor.getSelection();
            // Handle TAB key to insert spaces
            if (event.data.$.keyCode === 9) { // TAB key
              event.cancel(); // Prevent default behavior
              const tabSize = new Array(this.tabSpaces + 1).join(' ');
              editor.insertText(tabSize); // Insert spaces at the current cursor position
            }
          });
        },
        key: (event) => {
          const editor = event.editor;
          const selection = editor.getSelection();
          if (event.data.keyCode === 27) { // ESC key
            event.cancel();
          }
          if (event.data.keyCode === 32) {
            const range = selection.getRanges()[0];
            const selectedText = this.getPreviousWord(range);
            const codeObj = this.codesList.find(a => a.TextCode === selectedText);
            if (codeObj) {
              const wordToReplace = codeObj.TextHTMLTag;
              const textCode = codeObj.TextCode;
              if (selectedText === textCode) {
                const previousWordRange = range.clone();
                previousWordRange.setEnd(range.startContainer, range.startOffset);
                previousWordRange.setStart(previousWordRange.startContainer, previousWordRange.startOffset - selectedText.length);
                previousWordRange.deleteContents();
                const newHtml = wordToReplace;
                editor.insertHtml(newHtml);
                this.cdr.detectChanges();
              }
            }
          }
        }
      }
    };
  }
  //END: Testing CK Editor 
  getPreviousWord(range: any): string {
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;

    let previousWord = '';
    let currentNode = startContainer;
    let currentOffset = startOffset;

    while (currentOffset > 0) {
      const textContent = currentNode.getText().slice(0, currentOffset);
      const lastSpaceIndex = textContent.lastIndexOf(' ');

      if (lastSpaceIndex === -1) {
        previousWord = textContent + previousWord;
        currentOffset = 0;
      } else {
        previousWord = textContent.slice(lastSpaceIndex + 1) + previousWord;
        currentOffset = lastSpaceIndex;
      }

      currentNode = currentNode.getPrevious();
      if (!currentNode || !currentNode.is('text')) {
        break;
      }

      currentOffset = currentNode.getLength();
    }

    return previousWord.trim();
  }



  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private sharedService: SharedService,
    private techSrv: TechnicianService,
    private route: ActivatedRoute,
    private appPopupService: AppPopupService,
    private cdr: ChangeDetectorRef,
    private printRptService: PrintReportService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private lookupSrv: LookupService,
    private helper: HelperService,
    private multiApp: MultiAppService
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
  confirmationPopoverConfigPreliminary = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Disclaimer',
    popoverMessage: `
      You have <strong>only ONE chance</strong> to save this report as 
      <strong class="text-danger">Preliminary</strong>.<br><br>

      Saving as <strong class="text-danger">Preliminary</strong> will 
      <strong>generate the Initial Share</strong> and 
      <strong>cannot be reverted</strong> under normal conditions.<br><br>

      Please proceed carefully.
    `,
    confirmText: 'Yes, Proceed <i class="fa fa-check"></i>',
    cancelText: 'Cancel <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  };

  screenIdentity = null;
  isEditExpired = false;
  remainingTime = '00:00'; // Initialize remainingTime with '00:00'
  private subscription: Subscription;
  updateRemainingTime_(): void {
    const currentTime = moment();
    this.isEditExpired = currentTime.isSameOrAfter(this.tempDSDateTime);
  }


  updateRemainingTime__(): void {
    const currentTime = moment(); // Get the current date and time
    const expiryTime = moment(this.tempDSDateTime); // Expiry time

    // Calculate the difference in milliseconds
    const duration = moment.duration(expiryTime.diff(currentTime));

    // Check if the expiry time has passed
    if (duration.asSeconds() <= 0) {
      this.isEditExpired = true;
      this.remainingTime = 'Expired';
    } else {
      this.isEditExpired = false;
      const minutes = String(Math.floor(duration.asMinutes())).padStart(2, '0');
      const seconds = String(Math.floor(duration.asSeconds() % 60)).padStart(2, '0');
      this.remainingTime = `${minutes}:${seconds}`;
    }
  }
  updateRemainingTime(): void {
    try {
      const currentTime = moment(); // Get the current date and time
      const expiryTime = moment(this.tempDSDateTime); // Your expiry time

      // Check if tempDSDateTime is valid
      if (!expiryTime.isValid() || !this.tempDSDateTime) {
        this.isEditExpired = true;
        this.remainingTime = '00:00'; // Default to '00:00' in case of invalid date
        return;
      }

      // Calculate the difference in milliseconds
      const duration = moment.duration(expiryTime.diff(currentTime));

      // Check if the expiry time has passed
      if (duration.asSeconds() <= 0) {
        this.isEditExpired = true;
        this.remainingTime = '00:00'; // Show '00:00' if expired
        this.reportFeedbackPopupRef.close();
      } else {
        this.isEditExpired = false;
        const minutes = String(Math.floor(duration.asMinutes())).padStart(2, '0');
        const seconds = String(Math.floor(duration.asSeconds() % 60)).padStart(2, '0');
        this.remainingTime = `${minutes}:${seconds}`;
      }
    } catch (error) {
      // Fallback for unexpected errors
      console.error('Error calculating remaining time:', error);
      this.remainingTime = '00:00'; // Default to '00:00' in case of errors
      this.isEditExpired = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.VerifiedUserID = Number(localStorage.getItem('VerifiedUserID')) || null;
    this.RegLocId = Number(localStorage.getItem('RegLocId')) || null;
    this.VerifiedUserName = localStorage.getItem('VerifiedUserName') || '';
    if (this.isSavedWord == 1) {
      this.getRISDictionaryByUserID();
    }
  }

  isVPN = false;
  ngOnInit(): void {
    this.isVPN = localStorage.getItem('isVPN') === 'true';
    this.VerifiedUserID = Number(localStorage.getItem('VerifiedUserID')) || null;
    this.RegLocId = Number(localStorage.getItem('RegLocId')) || null;
    this.VerifiedUserName = localStorage.getItem('VerifiedUserName') || '';

    this.getPermissions();
    // Check the time immediately when the component is initialized
    this.updateRemainingTime();

    // Set up the interval to check the time every 30 seconds
    this.subscription = interval(1000).subscribe(() => {
      this.updateRemainingTime();
    });
    this.getDSQuestions();

    // console.log("payLoad issssssssssssssssss______________________",this.ParamsPayload)
    this.screenIdentity = this.route.routeConfig.path;
    this.VisitId = this.ParamsPayload.VisitID;
    this.TPCode = this.ParamsPayload.TPCode;
    this.TPName = this.ParamsPayload.TPName;
    this.TPFullName = this.TPCode + ' - ' + this.TPName;
    this.PatientName = this.ParamsPayload.PatientName;
    this.PatientID = this.ParamsPayload.PatientID;
    this.TPID = this.ParamsPayload.TPID;
    this.RISWorkListID = this.ParamsPayload.RISWorkListID;
    this.StatusId = this.ParamsPayload.StatusId;
    this.ProcessIDParent = this.ParamsPayload.ProcessIDParent;
    this.PID = this.ParamsPayload.PID;
    this.TestStatus = this.ParamsPayload.TestStatus;
    this.TranscribedBy = this.ParamsPayload.TranscribedBy;
    this.RISStatusID = this.ParamsPayload.RISStatusID;
    this.tempDSDateTime = this.ParamsPayload.tempDSDateTime ? moment(this.ParamsPayload.tempDSDateTime).add(this.ParamsPayload.ReportDelayTime, 'minutes').format('YYYY-MM-DDTHH:mm:ss') : null;
    this.EditExpiryTime = this.ParamsPayload.EditExpiryTime;
    this.currentDateTime = this.ParamsPayload.currentDateTime;
    this.isCaseStudyTab = this.ParamsPayload.isCaseStudyTab;
    this.ReportDelayTime = this.ParamsPayload.ReportDelayTime;
    this.isMetal = this.ParamsPayload.isMetal;
    this.InitByEmpID = this.ParamsPayload.InitByEmpID;
    this.DSByEmpID = this.ParamsPayload.DSByEmpID;
    this.ActiveTab = this.ParamsPayload.ActiveTab;
    this.IsAIAssistEnable = this.ParamsPayload.IsAIAssistEnable;
    this.isCompareStudy = this.ParamsPayload.isCompareStudy;
    this.RISRequestAIID = this.ParamsPayload.RISRequestAIID;
    this.LocId = this.ParamsPayload.LocId;
    this.SubSectionId = this.ParamsPayload.SubSectionId;
    this.getTPByVisitIDForAddendum()

    this.getRadioReportVisitTestStatus();
    this.loadLoggedInUserInfo();
    // this.getTPByVisitID(this.VisitId);
    this.getRISTPByVisit(this.VisitId);
    // this.getRISTemplate(); this function is shefted to setTimeout delayed section below becasue the editor was not initializeing here and need some delay
    this.getRISDictionaryByUserID();
    this.getTPDisclaimer();
    this.getRISServicesByVisitIDAll();
    // if (this.config.extraPlugins.includes('colordialog')) {
    //   console.log('colordialog plugin is available');
    // } else {
    //   console.log('colordialog plugin is not available');
    // }
    // this.config.extraPlugins = 'divarea,smiley,justify,indentblock,colordialog';
    this.getSubSection();


    this.getTPParamsByTPID(this.TPID); //incase of params but no template this will use
    setTimeout(() => {
      this.isEditorDisabled = true;
      //////////get one year back date for comparison studies filter
      const currentDate = new Date();

      // Subtract one year from the current date
      const oneYearBack = new Date(currentDate);
      oneYearBack.setFullYear(currentDate.getFullYear() - 1);
      // Format the date as needed
      const formattedDate = `${oneYearBack.getFullYear()}-${(oneYearBack.getMonth() + 1).toString().padStart(2, '0')}-${oneYearBack.getDate().toString().padStart(2, '0')}`;
      const metacubeStartDate = '2006-07-19'
      this._form.patchValue({
        startDate: Conversions.getDateObjectByGivenDate(metacubeStartDate),
        // startDate: Conversions.getCurrentDateObjectNew(),
        endDate: Conversions.getEndDateObjectNew()
      });
      this.getTestProfileComparisonByPatientID();
      this.getRISTemplate();
    }, 400);
    // this.getRISReportParametersDetail();
    this.getSystemInformation(this.loggedInUser);

    this.getRISAssesmentCategory();
    this.getRISErrorCategoryResearch();
    this.getAddendumByTPID();
    this.getRISCaseStudyCategory();
    this.getIsDoctorFeedBack();
    this.getRISAIAssistanceRequestByVIsitIDTPID();
    this.getTimeDelays();
  }
  ngOnDestroy(): void {
    // Unsubscribe from the interval when the component is destroyed
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getTPByVisitID(VisitID) {
    this.visitTests = []
    const params = {
      VisitID: VisitID
    };
    this.sharedService.getData(API_ROUTES.GET_TP_BY_VISIT_ID, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.visitTests = res.PayLoad || [];
        if (this.visitTests.length) {
          // this.getTPParamsByTPID(this.TPID)
          // this.getRISTemplateDetail()
          this.getRISReportParametersDetail()
        }
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getRISTPByVisit(VisitID) {
    this.visitTestsAssigner = []
    const params = {
      VisitID: VisitID,
      FilterBy: 2 //1=For Assigner, 2= Reporting
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_TP_BY_VISIT, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.visitTestsAssigner = res.PayLoad || [];
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

  getTPName(e) {
    const TPID = e.target.value;
    this.TPID = TPID;
    if (TPID) {
      const visitTestAssigner = this.visitTestsAssigner.find(a => a.TPID == TPID);
      this.TPFullName = visitTestAssigner.TestProfileCode + ' - ' + visitTestAssigner.TestProfileName;
      this.TPName = visitTestAssigner.TestProfileCode + '-' + visitTestAssigner.TestProfileName;
      this.TPCode = visitTestAssigner.TestProfileCode;
      this.StatusId = visitTestAssigner.StatusID;
    }
    this.getRISTemplate();
    setTimeout(() => {
      this.getRISReportParametersDetail();
      this.getTPByVisitIDForAddendum();
      this.getAddendumByTPID();
    }, 200);

  }


  RISTemplateID = null;
  templateList = [];
  TemplateParameterHTML = "";
  getRISTemplate() {
    const params = {
      RISTemplateID: null,//this.RISTemplateID,
      TPID: this.TPID,
      UserID: this.loggedInUser.userid
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_TEMPLATE, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.templateList = res.PayLoad || [];
        if (this.templateList.length) {
          const resultTemplateDefault = this.templateList.find(x => x.isDefault);
          const resultTemplateMain = this.templateList.find(x => x.CategoryID == 1);
          this.RISTemplateID = resultTemplateDefault ? resultTemplateDefault.RISTemplateID : ((!resultTemplateDefault && resultTemplateMain) ? resultTemplateMain.RISTemplateID : this.templateList[0]["RISTemplateID"]);
          // this.getRISTemplateDetail();
          // this.getRISReportParametersDetail();
          // console.log(" this.RISTemplateID this.RISTemplateID this.RISTemplateID this.RISTemplateID: ", this.RISTemplateID)
        }
        this.getRISReportParametersDetail();
      } else {
        this.toastr.error('Something went wrong! Please contact system support');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }

  getRISTemplete(pid) {
    const params = {
      RISTemplateID: pid,
      PID: null,
      UserID: null
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_TEMPLATE, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        if (this.RISTemplateID) {
          this.TemplateParameterHTML = res.PayLoad[0]["TemplateParameterHTML"];
        } else {
          this.templateList = res.PayLoad || [];
          this.TemplateParameterHTML = this.templateList[0]["TemplateParameterHTML"];
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

  getTemplateByID(param) {
    this.RISTemplateID = param.target.value;
    this.getRISTemplete(this.RISTemplateID);
  }

  getFullHTMLReport_() {
    let html = "<div>";
    this.TPParams.forEach(a => {
      html += a.ParamReportHTML;
    });
    html += "</div>";
    return html;
  }
  getFullHTMLReport() {
    let html = "";
    this.TPParams.forEach(a => {
      html += a.ParamReportHTML;
    });
    html += "";
    html = html.replace(/line-height:\s*80%/g, 'line-height:70%');
    return html;
  }

  getFullHTMLReportParam_(param, index, length) {
    let htmlFirst = ""
    let htmlLast = "";
    if (length == 1) {
      return "<div>" + param + "</div>";
    }
    else if (index == 0 && length > 1) {
      htmlFirst = "<div>" + param;
      return htmlFirst;
    } else if (index == (length - 1)) {
      htmlLast = param + "</div>";
      return htmlLast;
    } else {
      return param;
    }

  }
  getFullHTMLReportParam(param, index, length) {
    let htmlFirst = ""
    let htmlLast = "";
    if (length == 1) {
      param = param.replace(/line-height:\s*80%/g, 'line-height:70%');
      return "" + param + "";
    }
    else if (index == 0 && length > 1) {
      htmlFirst = "" + param;
      htmlFirst = htmlFirst.replace(/line-height:\s*80%/g, 'line-height:70%');
      return htmlFirst;
    } else if (index == (length - 1)) {
      htmlLast = param + "";
      htmlLast = htmlLast.replace(/line-height:\s*80%/g, 'line-height:70%');
      return htmlLast;
    } else {
      param = param.replace(/line-height:\s*80%/g, 'line-height:70%');
      return param;
    }

  }

  ////////////////////////// begin:: Get TP Disclaimer////////////////
  TPDisclaimerRow = [];
  DDisclaimerID = null;
  TPDisclaimerID = null;
  DisclaimerBody = null;
  disableDropdown = false;
  DisclaimerBodyHTML = '<p></p>';
  getTPDisclaimer() {
    this.disableDropdown = false; // Initialize
    this.TPDisclaimerRow = [];
    const objParam = {
      TPID: this.TPID,
      VisitID: this.VisitId || null
    }
    this.sharedService.getData(API_ROUTES.GET_TP_DISCLAIMER, objParam).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.TPDisclaimerRow = _response;
      if (this.TPDisclaimerRow.length) {
        const foundDisclaimer = this.TPDisclaimerRow.find(
          (item) => item.VisitTPDisclaimerID !== null && item.VisitTPDisclaimerID !== undefined
        );

        // Assign the found disclaimer, or fall back to the first one
        this.selectedDisclaimer = foundDisclaimer || this.TPDisclaimerRow[0];

        // Disable dropdown if a valid disclaimer is found
        this.disableDropdown = !!foundDisclaimer; // Converts to true/false
        this.getDisclaimerForReport(this.selectedDisclaimer);
      }
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }

  selectedDisclaimer: any;
  // onDisclaimerChange(selectedDisclaimer: any) {
  getDisclaimerForReport(selectedDisclaimer: any) {
    if (selectedDisclaimer) {
      this.DDisclaimerID = selectedDisclaimer.DDisclaimerID;
      this.TPDisclaimerID = selectedDisclaimer.TPDisclaimerID;
      this.VisitTPDisclaimerID = selectedDisclaimer.VisitTPDisclaimerID;
      this.DisclaimerBody = selectedDisclaimer.DisclaimerBody;
      this.DisclaimerBodyHTML = selectedDisclaimer.DisclaimerBodyHTML;
    }
  }

  /*************  ✨ Windsurf Command 🌟  *************/
  /**
   * Handles the change event when the user selects a different disclaimer from the dropdown.
   * @param e The change event.
   */
  onDisclaimerChange(selectedDisclaimer: any) {
    // Find the selected disclaimer in the array
    // const selectedDisclaimer = selectedDisclaimerP
    // If the disclaimer is found, update the values
    // console.log('selectedDisclaimer', selectedDisclaimer)
    if (selectedDisclaimer) {
      // Update the disclaimer IDs
      this.DDisclaimerID = selectedDisclaimer.DDisclaimerID;
      this.TPDisclaimerID = selectedDisclaimer.TPDisclaimerID;
      this.VisitTPDisclaimerID = selectedDisclaimer.VisitTPDisclaimerID;
      // Update the disclaimer body and HTML
      this.DisclaimerBody = selectedDisclaimer.DisclaimerBody;
      this.DisclaimerBodyHTML = selectedDisclaimer.DisclaimerBodyHTML;
    }
  }
  /*******  15c7ee57-fbad-454f-9b3c-2684393efb30  *******/

  ////////////////////////// end:: Get TP Disclaimer////////////////
  IndividualConfig = {
    positionClass: 'toast-center-center', // Positioning the Toastr in the middle of the screen
    timeOut: 2000, // Time duration for the Toastr message to be displayed
    closeButton: true, // Display close button for the Toastr message
    progressBar: true, // Show progress bar for the Toastr message
  };
  showInfoMsgForEditor = true;
  checkEdiortEnable() {
    this.showInfoMsgForEditor = true;
    if (!this.isEditingMode && (this.StatusId == 7 || this.StatusId == 8)) {
      this.toastr.error('Please Click On Edit before typing!', 'Editor Disabled', this.IndividualConfig);
    } else {
      this.showInfoMsgForEditor = false;
    }
  }
  actionButton = null;
  // actionBtn 1:for Save as a draft, 2: for preliminary, 3: for finalized from emoji, 4:for finalized from popup, 5: forRepeat
  // RISStatusID radioEditStatus: 9 for savedraft, 2 for preliminary, 3 for final
  // StatusID:  null for save as draft, 8 for preliminary or reported , 9 for final
  notCloseButtonStatus = null;
  disabledButtonDraftFinalizePopup = false;
  isSpinnerDraftFinalizePopup = true;
  isReportByDSBy = false;
  insertUpdateRadioReport(radioEditStatus, statusID, actionBtn, RISStatusID = null) {
    this.isReportByDSBy = (this.currentStatusID && this.currentStatusID <= 7) ? true : false;
    this.notCloseButtonStatus = RISStatusID;
    this.actionButton = actionBtn;
    const dataObj = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      FullReportRTF: null,
      FullReportHTML: this.getFullHTMLReport(),
      FullReport: null,
      RadioEditStatus: radioEditStatus,//prelimanary save status =2, 9 for draft
      StatusID: this.isFinalDraft ? 8 : statusID,// Preliminary save status =8, 9 for Final
      isReportDelay: (statusID === 9 && this.isReportDelay) ? 1 : 0,
      RISStatusID: this.isFinalDraft ? 12 : RISStatusID,// (statusID==7)?10:null,// 10 = draft null = preliminary // RISStatus 12 is for Draft  Final
      CreatedBy: this.loggedInUser.userid,
      LocID: this.loggedInUser.locationid,//Need to verify what location id? MT , Dr or Login User

      //////New Fields
      PatientID: this.PatientID,
      TranscribedBy: this.TranscribedBy || this.VerifiedUserID || null,
      RISWorkListID: this.RISWorkListID,
      ReportedBy: (statusID == 8) ? this.loggedInUser.userid : null,
      isReportByDSBy: this.isReportByDSBy,
      tblRadioReportParam: this.TPParams.map((a, index) => (
        {
          RadioReportParamID: null,
          VisitId: Number(this.VisitId),
          ProfileId: null,
          TestId: this.TPID,
          RISTemplateID: this.RISTemplateID,
          RISTemplateParameterID: a.RISTemplateParameterID,
          PID: a.PID,
          ParamReportHeading: null,
          ParamReport: null,
          ParamReportHTML: this.getFullHTMLReportParam(a.ParamReportHTML, index, this.TPParams.length)//a.ParamReportHTML//a.TemplateParameterHTML
        }
      ))
    };
    // console.log("dataObj____________",dataObj);
    // this.startSpinner();
    // this.enableButton();
    this.disabledButtonFinalizePopup = true;
    this.disabledButtonDraftFinalizePopup = true;
    this.disabledButtonDraft = true;
    this.disabledButtonPrimelinary = true;

    if (this.isFinalDraft) {
      this.isSpinnerDraftFinalizePopup = false;
    } else {
      this.isSpinnerFinalizePopup = false;
    }
    this.ParamsPayload.TranscribedBy = dataObj.TranscribedBy;
    this.TranscribedBy = dataObj.TranscribedBy;
    // this.updateRadioReportLock(false);
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RADIO_REPORT_V4, dataObj).subscribe((data: any) => {
      this.disabledButtonFinalizePopup = false;
      this.disabledButtonDraftFinalizePopup = false;
      this.disabledButtonDraft = false;
      this.disabledButtonPrimelinary = false;
      if (this.isFinalDraft) {
        this.isSpinnerDraftFinalizePopup = true;
      } else {
        this.isSpinnerFinalizePopup = true;
      }
      const res = JSON.parse(data.PayLoadStr);
      if (data.StatusCode === 200) {
        // this.StatusID = statusID;
        // this.RISStatusID = RISStatusID;
        this.isFinalDraft = false;
        this.spinner.hide(this.spinnerRefs.editorSection);
        if (res[0].Result == 2) {
          this.toastr.error('Study reserved by other radiologist');
        } else if (res[0].Result == 3) {
          this.toastr.error('Study has been unassigned by queue management.');
        } else if (res[0].Result == 4) {
          this.toastr.error('Study has already been cancelled', 'Cancelled Test');
        } else {
          this.currentStatusID = null;
          this.isReportByDSBy = false;
          if (this.TPDisclaimerID) {
            this.insertUpdateVisitTPDisclaimer();
          }
          this.toastr.success(data.Message);
        }

        // this.toastr.success(data.Message);
        this.stopSpinner();
        this.enableButton();
        // this.appPopupService.closeModal();
        if (statusID == 8) {
          this.updateRadioReportLockOnPreliminary(false);
        }

        // this.isEditingMode = false;
        this.disabledButton = false;
        this.isSpinner = true;
        this.isStatusChanged.emit(1)
        // this.RISWorkListID = data.PayLoadStr;
        if (statusID == 9 && !this.isFinalDraft || this.isRepeat) {
          if (!this.isRepeat) {
            this.ViewReport('');
          }

          this.appPopupService.closeModal();
        }
        this.reportFeedbackPopupRef ? this.reportFeedbackPopupRef.close() : this.reportFeedbackPopupRef;
        this.StatusID = statusID ? statusID : 7;
        this.StatusId = statusID ? statusID : 7;
        this.TestStatus = statusID == null
          ? "Saved as Draft"
          : statusID === 8
            ? "Preliminary Saved"
            : statusID === 9 && "Finalized";
        this.isEditingMode = false;
        this.RISStatusID = RISStatusID;
      } else {
        this.disabledButtonDraft = false;
        this.disabledButtonPrimelinary = false;
        this.spinner.hide(this.spinnerRefs.editorSection);
        this.toastr.error(data.Message)
        this.stopSpinner();
        this.enableButton();
      }
    }, (err) => {
      this.disabledButtonFinalizePopup = false;
      this.disabledButtonDraftFinalizePopup = false;
      if (this.isFinalDraft) {
        this.isSpinnerDraftFinalizePopup = true;
      } else {
        this.isSpinnerFinalizePopup = true;
      }
      console.log(err);
      this.spinner.hide(this.spinnerRefs.editorSection);
      this.disabledButton = false;
      this.isSpinner = true;
      this.toastr.error('Connection error');
    })

  }
  VisitTPDisclaimerID = null;
  DisclaimerTitle = null;
  DisclaimerHeader = null;
  DisclaimerFooter = null;
  insertUpdateVisitTPDisclaimer() {
    const objDisclaimer = {
      VisitTPDisclaimerID: this.VisitTPDisclaimerID,
      TPDisclaimerID: this.TPDisclaimerID,
      VisitID: this.VisitId,
      TPID: this.TPID,
      DisclaimerTitle: this.DisclaimerTitle,
      DisclaimerHeader: this.DisclaimerHeader,
      DisclaimerFooter: this.DisclaimerFooter,
      DisclaimerBody: this.DisclaimerBody,
      DisclaimerBodyHTML: this.DisclaimerBodyHTML,
      DDisclaimerID: this.DDisclaimerID,
      // CreatedBy: this.loggedInUser.userid,
      CreatedBy: this.VerifiedUserID ? this.VerifiedUserID : this.loggedInUser.userid
      // TranscriptedBy: this.VerifiedUserID,
    };
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_UPDATE_VISIT_TP_DISCLAIMER, objDisclaimer).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.spinner.hide(this.spinnerRefs.editorSection);
        this.getTPDisclaimer();
      } else {
        this.spinner.hide(this.spinnerRefs.editorSection);
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.editorSection);
      this.toastr.error('Connection error');
    })
  }


  updateRadioReportLock(param) {
    // if (param && !this.VerifiedUserID) {
    //   this.openVerifyForm();
    //   // return;
    // }
    // else{
    //   this.VerifiedUserID = null;
    // }

    if (param && this.isCompareStudy && this.RISStatusID <= 10) {

      Swal.fire({
        title: 'Comparative Study Available',
        html: `
    <div class="text-left">
      The study <strong class="text-primary">${this.VisitId} : ${this.TPName}</strong>
      has previous imaging records available for comparison.
      <br><br>
      Please review the prior study before finalizing your report.
    </div>
  `,
        showCancelButton: false,
        confirmButtonText: '<i class="fas fa-exchange-alt mr-1"></i> Review & Continue',
        customClass: {
          confirmButton: 'btn btn-primary'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.close();
        }
      });


    }

    this.isEditorDisabled = false;
    const objParam = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      LockedBy: param ? this.loggedInUser.userid : null,
    }
    param ? this.disabledButtonLock = true : this.disabledButtonCancel = true;
    param ? this.isSpinnerLock = false : this.isSpinnerCancel = false;
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RADIO_REPORT_LOCK, objParam).subscribe((data: any) => {
      this.disabledButtonLock = false;
      this.isSpinnerLock = true;
      param ? this.disabledButtonLock = false : this.disabledButtonCancel = false;
      param ? this.isSpinnerLock = true : this.isSpinnerCancel = true;
      const response = JSON.parse(data.PayLoadStr);
      if (response.length) {
        if (data.StatusCode == 200) {
          if (response[0].Result == 1) {
            if (param) {
              this.toastr.success(data.Message);
            } else {
              this.toastr.success("Report Unlocked Successfully");
            }
            if (param || !this.notCloseButtonStatus) {
              this.isEditingMode = true;
            } else {
              this.isEditingMode = false;
            }

            // if (param && !this.VerifiedUserID) {
            //   this.openVerifyForm();
            //   // return;
            // }
          } else if (response[0].Result == 3) {
            this.toastr.success(data.Message);
            this.isEditingMode = false;
          } else if (response[0].Result == 2) {
            this.toastr.error(data.Message);
            this.isEditingMode = false;
          }

          this.StatusId = this.StatusId;
          this.TestStatus = this.TestStatus;
          // this.toastr.success(data.Message);
          // this.isStatusChanged.emit(1)
          return true;
        } else {
          param ? this.disabledButtonLock = false : this.disabledButtonCancel = false;
          param ? this.isSpinnerLock = true : this.isSpinnerCancel = true;
          this.toastr.error('Error occured while Lock/Unlock report!')
          return false;
        }
      }
    }, (err) => {
      console.log(err);
      param ? this.disabledButtonLock = false : this.disabledButtonCancel = false;
      param ? this.isSpinnerLock = true : this.isSpinnerCancel = true;
      this.toastr.error('Connection with database is not made,  Please contact System Support !');
    })
  }
  updateRadioReportLockOnPreliminary(param) {
    this.isEditorDisabled = false;
    const objParam = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      LockedBy: param ? this.loggedInUser.userid : null,
    }
    param ? this.disabledButtonLock = true : this.disabledButtonCancel = true;
    param ? this.isSpinnerLock = false : this.isSpinnerCancel = false;
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RADIO_REPORT_LOCK, objParam).subscribe((data: any) => {
      this.disabledButtonLock = false;
      this.isSpinnerLock = true;
      param ? this.disabledButtonLock = false : this.disabledButtonCancel = false;
      param ? this.isSpinnerLock = true : this.isSpinnerCancel = true;
      const response = JSON.parse(data.PayLoadStr);
      if (response.length) {
        if (data.StatusCode == 200) {
          if (response[0].Result == 1) {
            if (param) {
              this.toastr.success(data.Message);
            } else {
              this.toastr.success("Report Unlocked Successfully");
            }
            this.isEditingMode = true;
          } else if (response[0].Result == 3) {
            this.toastr.success(data.Message);
            this.isEditingMode = false;
          } else if (response[0].Result == 2) {
            this.toastr.error(data.Message);
            this.isEditingMode = false;
          }
          this.StatusId = this.StatusId;
          this.TestStatus = this.TestStatus;
          return true;
        } else {
          param ? this.disabledButtonLock = false : this.disabledButtonCancel = false;
          param ? this.isSpinnerLock = true : this.isSpinnerCancel = true;
          this.toastr.error('Error occured while Lock/Unlock report!')
          return false;
        }
      }
    }, (err) => {
      console.log(err);
      param ? this.disabledButtonLock = false : this.disabledButtonCancel = false;
      param ? this.isSpinnerLock = true : this.isSpinnerCancel = true;
      this.toastr.error('Connection with database is not made,  Please contact System Support !');
    })
  }

  updateVisitTPStatus() {
    //SP : UpdateVisitTPStatus
    const objParam = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      StatusID: this.StatusID,
      CreatedBy: this.loggedInUser.userid || -99
    }
    this.disabledButtonInitial = true;
    this.isSpinnerInitial = false;
    this.techSrv.updateVisitTPStatusForInitialization(objParam).subscribe((data: any) => {
      this.disabledButtonInitial = false;
      this.isSpinnerInitial = true;
      const respData = JSON.parse(data.PayLoadStr);

      if (respData.length) {
        this.RISWorkListID = respData[0].RISWorkListID;
        if (data.StatusCode == 200) {
          this.actionButton == 5 ? this.StatusID = 8 : this.StatusId = 7;
          this.actionButton == 5 ? this.TestStatus = "Repeated" : this.TestStatus = "Initialized"
          this.actionButton == 5 ? this.toastr.success("Study has been sent for Repeate successfully", "Repeate Test") : this.toastr.success("Test Initialized successfully", "Initialized");
          this.isStatusChanged.emit(1)
        } else {
          this.toastr.error('Error occured while saving tech history!')
        }
      }
    }, (err) => {
      console.log(err);
      this.disabledButtonInitial = false;
      this.isSpinnerInitial = true;
      this.toastr.error('Connection error');
    })
  }

  initializedReportByDoctor() {
    //SP : UpdateVisitTPStatus
    const objParam = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      StatusID: this.StatusID,
      CreatedBy: this.loggedInUser.userid || -99
    }
    this.disabledButtonInitial = true;
    this.isSpinnerInitial = false;
    this.techSrv.updateVisitTPStatusForInitialization(objParam).subscribe((data: any) => {
      this.disabledButtonInitial = false;
      this.isSpinnerInitial = true;
      const respData = JSON.parse(data.PayLoadStr);

      if (respData.length) {
        this.RISWorkListID = respData[0].RISWorkListID;
        if (data.StatusCode == 200) {
          if (respData[0].Result == 1) {
            this.actionButton == 5 ? this.StatusID = 8 : this.StatusId = 7;
            this.actionButton == 5 ? this.TestStatus = "Repeated" : this.TestStatus = "Initialized"
            this.actionButton == 5 ? this.toastr.success("Study has been sent for Repeate successfully", "Repeate Test") : this.toastr.success("Test Initialized successfully", "Initialized");
          } else {
            this.TestStatus = "Cancelled";
            this.toastr.error("Study has already been cancelled", "Cancelled Test");
          }
          this.isStatusChanged.emit(1)
        } else {
          this.toastr.error('Error occured while saving tech history!')
        }
      }
    }, (err) => {
      console.log(err);
      this.disabledButtonInitial = false;
      this.isSpinnerInitial = true;
      this.toastr.error('Connection error');
    })
  }
  TPParams = [];
  isShowReportMain = true;
  getTPParamsByTPID(TPID) {
    if (TPID) {
      const objParam = {
        pTPID: TPID
      }
      this.sharedService.getData(API_ROUTES.GET_TP_PARAMS, objParam).subscribe((data: any) => {
        const response = JSON.parse(data.PayLoadStr)
        const params = response.Table || [];
        // console.log("returned template params are _____________________________",params)
        this.TPParams = params.map((a) => ({
          Pcode: a.PCode,
          PCode: a.PCode,
          PId: a.PId,
          PID: a.PId,
          Title: a.Title,
          /////////////////////////////
          TemplateParameterHTML: "<p></p>",
          ParamReportHeading: null,
          ParamReport: "",
          ParamReportHTML: "<p></p>",
          ///////////////////////
        }));
        // console.log("TPParams_ after maping_____________________:", this.TPParams)
        if (this.TPParams.length) {
          const pid = this.TPParams[0].PId;
          this.isShowReportMain = true;
          // this.getRISTemplate()
        } else {
          this.isShowReportMain = false;
        }
        // console.log("TPParams: ", this.TPParams)
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
      })
    }
  }

  getHtml(param) {
    const data = this.templateList.find(b => b.PID == param);
    const d = data ? data.TemplateParameterHTML : '<p></p>';
    return d;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////
  // start::Finalization and Repeat of report with feadback////////////////////////////////////////////
  RadioEditStatus = null;
  StatusID = 7;

  isSpinnerDraft = true;
  isSpinnerPremilinary = true;
  isSpinnerFinalize = true;
  isSpinnerFinalizePopup = true;
  isSpinnerRepeat = true;
  isSpinnerRepeatPopup = true;

  disabledButtonDraft = false;
  disabledButtonPrimelinary = false;
  disabledButtonFinalize = false;
  disabledButtonFinalizePopup = false;
  disabledButtonRepeat = false;
  disabledButtonRepeatPopup = false;

  startSpinner() {
    // actionBtn 1:for Save as a draft, 2: for preliminary, 3: for finalized from emoji, 4:for finalized from popup, 5: forRepeat
    switch (this.actionButton) {
      case 1: {
        this.isSpinnerDraft = false;
        break;
      }
      case 2: {
        this.isSpinnerPremilinary = false;
        break;
      }
      case 3: {
        this.isSpinnerFinalize = false;
        break;
      }
      case 4: {
        this.isSpinnerFinalizePopup = false;
        break;
      }
      case 5: {
        this.isSpinnerRepeatPopup = false;
        break;
      }
      case 6: {
        this.isSpinnerRepeat = false;
        break;
      }
      // default:
      //   break;
    }
  }
  disableButton() {
    // actionBtn 1:for Save as a draft, 2: for preliminary, 3: for finalized from emoji, 4:for finalized from popup, 5: forRepeat
    // switch (this.actionButton) {
    //   case 1: {
    //     this.disabledButtonDraft = true;
    //     break;
    //   }
    //   case 2: {
    //     this.disabledButtonPrimelinary = true;
    //     break;
    //   }
    //   case 3: {
    //     this.disabledButtonFinalize = true;
    //     break;
    //   }
    //   case 4: {
    //     this.disabledButtonFinalizePopup = true;
    //     break;
    //   }
    //   case 5: {
    //     this.disabledButtonRepeatPopup = true;
    //     break;
    //   }
    //   case 6: {
    //     this.disabledButtonRepeat = true;
    //     break;
    //   }
    //   // default:
    //   //   break;
    // }
    this.disabledButtonDraft = true;
    this.disabledButtonPrimelinary = true;
    this.disabledButtonFinalize = true;
    this.disabledButtonFinalizePopup = true;
    this.disabledButtonRepeat = true;
    this.disabledButtonRepeatPopup = true;

  }
  stopSpinner() {
    this.isSpinnerDraft = true;
    this.isSpinnerPremilinary = true;
    this.isSpinnerFinalize = true;
    this.isSpinnerFinalizePopup = true;
    this.isSpinnerRepeat = true;
    this.isSpinnerRepeatPopup = true;
  }
  enableButton() {
    this.disabledButtonDraft = false;
    this.disabledButtonPrimelinary = false;
    this.disabledButtonFinalize = false;
    this.disabledButtonFinalizePopup = false;
    this.disabledButtonRepeat = false;
    this.disabledButtonRepeatPopup = false;
  }

  reportFeedbackPopupRef: NgbModalRef;
  isFeedback = true;
  feedbackRemarks = null;
  feedbackRemarksTouched = false;
  feedbackQuestions = [];
  @ViewChild('reportFeedback') reportFeedback;
  currentStatusID = null;
  reportFinalizationProcess(radioEditStatus, statusID, currentStatusID) {
    this.currentStatusID = currentStatusID;
    this.RadioEditStatus = radioEditStatus;
    this.StatusID = statusID;
    this.feedbackQuestions.forEach(a => {
      a.checked = false;
    })
    this.isFeedback = false;
    this.reportFeedbackPopupRef = this.appPopupService.openModal(this.reportFeedback, { backdrop: 'static', size: 'lg' });
  }

  goBack(param) {
    this.isFeedback = param;
  }

  clickSubmit = false;
  isFinalDraft = false;
  selectFeedback(param, isDraftFinal = false) {
    this.isFinalDraft = isDraftFinal;
    this.StatusID = this.isFinalDraft ? 8 : this.StatusID;
    //return;
    this.isFeedback = param;
    if (!this.isFeedback) {
      this.insertUpdateRadioReport(this.RadioEditStatus, this.StatusID, 3, 13);
    } else {
      this.getDSQuestions();
    }
  }
  finalizeReport() {
    this.isRepeat = false;
    this.clickSubmit = true;
    // if (!this.feedbackRemarks || this.feedbackRemarks == "") {
    //   this.toastr.error("Please provide Remarks !", "Validation Error");
    //   return;
    // } else {
    //   this.clickSubmit = false;
    // }

    const dsQuestions = this.feedbackQuestions.filter(a => a.checked);

    this.StatusID = 9;
    this.RadioEditStatus = 3;
    this.insertUpdateRadioReport(3, 9, 4, 13); //1.radioEditStatus, 2.statusID, 3.actionBtn, 4.RISStatusID = null
    if (this.feedbackRemarks != "") {
      const dataObj = {
        VisitID: Number(this.VisitId),
        TPID: this.TPID,
        Remarks: this.feedbackRemarks,
        CreatedBy: this.loggedInUser.userid,
        SourceID: 1,
        tblDSFeedBack: dsQuestions.map(a => (
          {
            QuestionID: a.QuestionId,
            Question: a.Description
          }
        ))
      };
      this.sharedService.insertUpdateData(API_ROUTES.INSERT_DS_FEEDBACK, dataObj).subscribe((data: any) => {
        if (data.StatusCode == 200) {
          this.toastr.success(data.Message);
          this.isDoctorFeedback = true;
        }
      }, (err) => {
        console.log(err);
      })
    }

    // }

  }
  isRepeat = false;
  repeatReport() {
    this.isRepeat = true;
    this.clickSubmit = true;
    if (!this.feedbackRemarks || this.feedbackRemarks == "") {
      this.toastr.error("Please provide Remarks !", "Remarks validation");
      return;
    } else {
      this.clickSubmit = false;
    }

    const dsQuestions = this.feedbackQuestions.filter(a => a.checked);

    this.StatusID = 8;
    this.RadioEditStatus = 3;
    // this.insertUpdateRadioReport(3, 8, 5);//change for repeat option becasue it was making RISStatusID as null
    this.insertUpdateRadioReport(3, 8, 5, this.RISStatusID);
    this.updateVisitTPStatus();
    const dataObj = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      Remarks: this.feedbackRemarks,
      CreatedBy: this.loggedInUser.userid,
      SourceID: 1,
      tblDSFeedBack: dsQuestions.map(a => (
        {
          QuestionID: a.QuestionId,
          Question: a.Description
        }
      ))
    };
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_DS_FEEDBACK, dataObj).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.toastr.success(data.Message);
      }
    }, (err) => {
      console.log(err);
    })
    // }
  }
  getDSQuestions() {
    this.sharedService.getData(API_ROUTES.GET_DS_QUESTIONS, {}).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.feedbackQuestions = data.PayLoad;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  ReportData = [];
  getRadopReportByID() {
    const objParam = {
      VisitID: this.VisitId,
      TPID: this.TPID
    }
    this.sharedService.getData(API_ROUTES.GET_RADIO_REPORT_BY_ID, objParam).subscribe((data: any) => {
      this.ReportData = data.PayLoad;
      // console.log("ReportData: ", this.ReportData)
      if (this.ReportData.length) {
        this.TemplateParameterHTML = this.ReportData[0].ParamReportHTML;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  getRISTemplateDetailonChange(e) {
    this.RISTemplateID = e.target.value;
    // this.getRISReportParametersDetail();
    this.getRISTemplateDetail()
  }

  onDropdownClick(e) {
    this.RISTemplateID = e.target.value;
    if (this.templateList.length && this.templateList.length === 1) {
      this.getRISTemplateDetail();
    }
  }

  getRISTemplateDetail() {
    const response = [];
    const objParams = {
      RISTemplateID: this.RISTemplateID,
      TPID: null,
    }
    this.sharedService.getData(API_ROUTES.GET_RIS_TEMPLATE_DETAIL, objParams).subscribe((resp: any) => {
      this.TPParams = JSON.parse(resp.PayLoadStr)
      // console.log("this.TPParams________details_________________________________", this.TPParams)
      if (this.TPParams.length) {
        this.isShowReportMain = true;
        this.RISTemplateID = this.TPParams[0].RISTemplateID;
      } else {
        this.isShowReportMain = false;
      }

    }, (err) => {
      console.log(err);
    })
  }
  onCKEditorChange(value: string, index: number) {
    this.TPParams[index].TemplateParameterHTML = value;
  }

  // ngAfterViewInit() {
  //   this.TPParams = this.TPParamsTemplateChanged;
  //   console.log("params afterview init is : ",this.TPParams)
  // }
  RISCaseStudyCategoryID = null;
  RISCaseStudyCategoryRemarks = '';
  getRISReportParametersDetail() {
    this.TPParams = [];
    let response = [];
    const objParams = {
      VisitID: this.VisitId,
      TPID: this.TPID,
      UserID: this.loggedInUser.userid
    }
    this.spinner.show(this.spinnerRefs.editorSection);
    this.sharedService.getData(API_ROUTES.GET_RIS_REPORT_PARAMTERS_DETAIL, objParams).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.editorSection);
      response = resp.PayLoad;
      // console.log("getRISReportParametersDetail This.TPParams: before mege ", response)
      if (response.length) {
        this.TPParams = response.map((a) => ({ TemplateParameterHTML: a.ParamReportHTML, ...a }));
        // console.log("getRISReportParametersDetail This.TPParams: ", this.TPParams)
        this.RISTemplateID = this.TPParams[0].RISTemplateID;
        // console.log("and RISTemplateIDsfds sfdsfdsffsdfds: ",this.RISTemplateID)
        // console.log("and this.TPParamsthis.TPParamsthis.TPParams: ",this.TPParams)
        this.RISCaseStudyCategoryID = this.TPParams[0].RISCaseStudyCategoryID || null;
        this.RISCaseStudyCategoryRemarks = this.TPParams[0].RISCaseStudyCategoryRemarks || "";
        if (this.RISCaseStudyCategoryID) {
          this.isCaseStudy = true;
        } else {
          this.isCaseStudy = false;
        }
      }
      if (this.TPParams.length) {
        this.isShowReportMain = true;
      } else {
        this.isShowReportMain = false;
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.editorSection);
      console.log(err);
    })

  }

  getRadioReportVisitTestStatus() {
    const objParam = {
      VisitID: this.VisitId,
      TPID: this.TPID,
    }
    this.sharedService.getData(API_ROUTES.GET_RADIO_REPORT_VISIT_TEST_STATUS, objParam).subscribe((data: any) => {
      const response = data.PayLoad;
      if (response.length) {
        this.StatusId = response[0].StatusId;
        this.RadioEditStatus = response[0].RadioEditStatus
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  printRadioReport() {
    this.toastr.info("Comming soon.", "In-progress")
  }

  // end::Finalization and Repeat of report with feadback////////////////////////////////////////////



  // Dictionary integration 
  codesList = [];
  getRISDictionaryByUserID() {
    this.codesList = [];
    const params = {
      UserID: this.loggedInUser.userid || -99,
      CategoryID: 2
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_DICTIONARY_BY_USER_ID, params).subscribe((res: any) => {
      this.codesList = res.PayLoad || [];
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error occured while loading dictionary');
    })
  }
  editorInstance: any;

  onEditorReady(event: any) {
    this.editorInstance = event.editor;
    this.editorInstance.on('contentDom', () => {
      const editable = this.editorInstance.editable();
      editable.attachListener(editable, 'keyup', () => {
        this.handleKeyUp();
      });
    });
  }

  handleKeyUp() {
    const selection = this.editorInstance.getSelection();
    const range = selection.getRanges()[0];
    const startNode = range.startContainer;
    const startOffset = range.startOffset;

    // Traverse backwards until a space character is encountered
    let previousWord = '';
    const currentNode = startNode;
    let currentOffset = startOffset;
    while (currentOffset > 0) {
      const previousCharacter = currentNode.getText().charAt(currentOffset - 1);
      if (previousCharacter === ' ') {
        break;
      }
      previousWord = previousCharacter + previousWord;
      currentOffset--;
    }

    // console.log('Previous word:', previousWord);
  }

  reloadSavedReport() {
    this.getRISReportParametersDetail();
  }


  // Print report /////////////////////////////////////////////////////////
  ViewReport(itemType, reportType = 'normal') {
    let radioTestIds = '';
    let radioTP: any = [];
    //   radioTP =[{
    //     "ACCOUNTNO": this.VisitId,
    //     "TESTRESULT_ID": "",
    //     "TestID": "",
    //     "hasEmailSend": "n",
    //     "TESTRESULTID": "n",
    //     "BRANCH_ID": 0,
    //     "PROFILETESTS": this.TPCode,
    //     "PROFILETESTSDESC": this.TPName,
    //     "SECTION": "",
    //     "STATUS": "Final",
    //     "ABBRIVATION": "n",
    //     "REPORTINGTIME": "2023-07-05T20:00:00",
    //     "PROFILETESTID": this.TPID,
    //     "SECTIONID": 7,
    //     "ISPANEL": 0,
    //     "IsCash": "",
    //     "PANELNAME": "n",
    //     "CREATEDON": "n",
    //     "SectionType": "Radiology",
    //     "ReportTemplateType": 2,
    //     "DSBy": "n",
    //     "isReportable": 1,
    //     "WR_ALLOWED": 1,
    //     "EnableEmail": "n",
    //     "ENABLESMS": "n",
    //     "InOut": "N",
    //     "DueBalance": "",
    //     "PanelMailToPatient": "n",
    //     "PanelMailToPanel": "n",
    //     "PanelSMSAlert": "n",
    //     "PanelShowReport": "n",
    //     "PanelShouldReportMails": "n",
    //     "PanelIsByPassDueAmount": "n",
    //     "PanelPOCEmail": "n",
    //     "ProfileIsEmailEnable": "n",
    //     "ProfileIsSMSEnable": "n",
    //     "ProfileIsShowOnline": null,
    //     "isPackage": 1,
    //     "TypeId": 1,
    //     "PROFILEID": "",
    //     "SUBSECTIONID": 18,
    //     "EncAccountNo": null,
    //     "PanelID": null,
    //     "permission_ViewGraphicalReportIcon": false,
    //     "permission_ViewReportIcon": true,
    //     "permission_PRViewReportIcon": true,
    //     "permission_ViewPreReportIcon": false,
    //     "permission_ViewDeliverReportIcon": true,
    //     "permission_InPrgresIcon": false,
    //     "permission_PACSImages": true,
    //     "permission_IsReportableIcon": true,
    //     "permission_PanelIsTestAllowOnlineIcon": false,
    //     "permission_IsTestAllowOnlineIcon": false,
    //     "permission_IsdueblnceIcon": false,
    //     "permission_IsTestCancelled": false,

    // }]
    radioTP = [{
      "ACCOUNTNO": this.VisitId,
      "PROFILETESTS": this.TPCode,
      "PROFILETESTSDESC": this.TPName,
      "PROFILETESTID": this.TPID,

    }]
    // console.log("radioTP: ",radioTP);return;

    if (!this.TPID) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    }
    else {


      radioTestIds = this.TPID;
      if (radioTestIds) {
        radioTP = { ...radioTP };
        radioTP[0].PROFILETESTID = radioTestIds;
        radioTP[0].ReportType = "tp";
        radioTP[0].ItemType = itemType;
        radioTP[0].AppName = 'medicubes';
        radioTP[0].LoginName_MC = this.loggedInUser.username;
        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(radioTP[0]).subscribe((res: any) => {
          // console.log("ressssssssssssssssss: ", res)
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            // console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }
    }
  }


  openReportWindow() {
    const patientVisitInvoiceWinRef = window.open('', '_blank');
    return patientVisitInvoiceWinRef;
  }
  addSessionExpiryForReport(reportUrl) {
    const reportSegments = reportUrl.split('?');
    if (reportSegments.length > 1) {
      reportUrl = reportSegments[0] + '?' + btoa(atob(reportSegments[1]) + '&SessionExpiryTime=' + (+new Date() + (CONSTANTS.REPORT_EXPIRY_TIME * 1000))); // &pdf=1
    }
    return reportUrl;
  }




  ///////////////////////////start::User verification for sucscription//////////////
  techUsername = ""; //john.doe;
  techPassword = ""; //freedom;
  userVerificationForm = this.fb.group({
    techUsername: ['', Validators.compose([Validators.required])],
    techPassword: ['', Validators.compose([Validators.required])]
  });
  VerifiedUserID = null;
  RegLocId = null;
  VerifiedUserName = null;
  IsAuthenticated = false;
  disabledButtonVerify = false; // Button Enabled / Disables [By default Enabled]
  isSpinnerVerify = true;//Hide Loader
  openVerifyForm() {
    this.modalPopupRef = this.appPopupService.openModal(this.userVerificationModal, { backdrop: 'static', size: 'md' });
  }

  verifyUser() {
    // this.clearVariables();
    const formValues = this.userVerificationForm.getRawValue();
    this.userVerificationForm.markAllAsTouched();
    if (this.userVerificationForm.invalid) {
      this.toastr.warning('Please enter your username and password!'); return false;
    } else {
      ///////START::VERIFY USER /////////////////////////////
      // formValues.techUsername=='john.doe' && formValues.techPassword=='freedom'
      const params = {
        UserName: formValues.techUsername,
        Password: formValues.techPassword
      }
      this.disabledButtonVerify = true;
      this.isSpinnerVerify = false;
      this.sharedService.verifyUser(params).subscribe((data: any) => {
        this.disabledButtonVerify = false;
        this.isSpinnerVerify = true;
        if (data.StatusCode == 200) {
          if (data.PayLoad && data.PayLoad.length) {
            localStorage.setItem('VerifiedUserID', data.PayLoad[0].UserId);
            localStorage.setItem('RegLocId', data.PayLoad[0].RegLocId);
            localStorage.setItem('VerifiedUserName', data.PayLoad[0].UserName);
            this.VerifiedUserID = Number(localStorage.getItem('VerifiedUserID')) || null;
            this.RegLocId = Number(localStorage.getItem('RegLocId')) || null;
            this.VerifiedUserName = localStorage.getItem('VerifiedUserName') || '';

            this.modalPopupRef.close();
            this.isEditingMode = true;
            // this.updateRadioReportLock(true)

            this.userVerificationForm.patchValue({
              techUsername: "",
              techPassword: ""
            })
            this.toastr.success(data.PayLoad[0].UserName, "Verified:");
          }
          else {
            this.toastr.error("Wrong Credentials....")
          }
        } else {
          this.toastr.error(data.Message)
        }
      }, (err) => {
        console.log(err);
        this.disabledButtonVerify = false;
        this.isSpinnerVerify = true;
      });

      ///////END::  VERIFY USER /////////////////////////////


    }
  }
  ///////////////////////////end::User verification for sucscription//////////////

  ////////////////////////begin:addendum form ///////////////////////////////////

  //This function will decide to show Addendum button or not show
  getTPByVisitIDForAddendum() {
    this.visitTests = []
    const params = {
      VisitID: this.VisitId,
      TPId: this.TPID
    };
    this.spinner.show(this.spinnerRefs.listSection);
    this.sharedService.getData(API_ROUTES.GET_TP_BY_VISIT_ID_FOR_ADDENDUM, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        this.visitTests = res.PayLoad || [];
        if (this.visitTests.length && !this.visitTests[0].IsGenerateAddendumRequest) {
          this.isShowAddendumButton = true;
        } else {
          this.isShowAddendumButton = false;
        }
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log(err);
    })

  }

  addendumFormData = [];
  isShowAddendumButton = false;

  ////This function will get extra data for addendum for like requested by , requested on and remarks
  RequestedBy = null;
  RequestedOn = null;
  AddendumRemarks = null;
  RISAddendumTypeID = null;
  QueryObjection = null;
  DrQueryRemarks = null;
  RefByDoctorName = null;
  AddendumReviewSourceID = null;
  RequestedSource = null;
  lebelType = "Addendum";
  RadiologistUserID = null;
  showSecondOpinionButton = false;
  getAddendumByTPID() {
    this.addendumFormData = []
    const params = {
      VisitID: this.VisitId,
      TPID: this.TPID
    };
    this.sharedService.getData(API_ROUTES.GET_ADDENDUM_BY_TPID, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        this.addendumFormData = res.PayLoad || [];
        if (this.addendumFormData.length) {
          this.RequestedBy = this.addendumFormData[0].RequestedBy;
          this.RequestedOn = this.addendumFormData[0].RequestedOn;
          this.AddendumRemarks = this.addendumFormData[0].Remarks;
          this.RISAddendumTypeID = this.addendumFormData[0].RISAddendumTypeID;
          this.QueryObjection = this.addendumFormData[0].QueryObjection;
          this.DrQueryRemarks = this.addendumFormData[0].DrQueryRemarks;
          this.RefByDoctorName = this.addendumFormData[0].RefByDoctorName;
          this.AddendumReviewSourceID = this.addendumFormData[0].AddendumReviewSourceID;
          this.RequestedSource = this.addendumFormData[0].RequestedSource;
          this.RadiologistUserID = this.addendumFormData[0].RadiologistUserID;

          if (this.RISAddendumTypeID == 1) {
            this.lebelType = "Addendum";
          } else if (this.RISAddendumTypeID == 2) {
            this.lebelType = "Second Opinion";
          }
          setTimeout(() => {
            this.showSecondOpinionButton = ((this.RISAddendumTypeID == 2 && this.RadiologistUserID == this.loggedInUser.userid) || this.RISAddendumTypeID == 1) ? true : false;
          }, 200);
        }
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
    })
  }

  openAddendumForm() {
    this.getAddendumByTPID();
    this.modalPopupRef = this.appPopupService.openModal(this.addendumnModal, { backdrop: 'static', size: 'lg' });
  }

  Addendum = "";
  AddendumHTML = '';
  RISAssesmentCategoryID = null;
  RISErrorCategoryID = null;
  disabledButtonAddendum = false;
  isSpinnerAddendum = true;
  inValidDateRange = false;
  //This function will save addendum
  clickSubmitBtn = false;
  insertUpdateVisitTestAddendum() {
    this.Addendum = this.getPlainFromHTML(this.AddendumHTML).replace('\n\n', ' ');
    setTimeout(() => {
      if (!this.Addendum || this.Addendum == "") {
        this.toastr.warning("Please provide addendum", "Warning");
        this.clickSubmitBtn = false;
        return;
      } else if (this.RISAddendumTypeID == 2 && !this.RISAssesmentCategoryID) {
        this.toastr.warning("Please select assesment category", "Warning");
        this.clickSubmitBtn = true;
        return;
      } else {
        const sanitizedAddendumHTML = '<br>' + (this.AddendumHTML
          ?.replace(/<p[^>]*>/gi, '<span>')
          .replace(/<\/p>/gi, '</span>')
          || '');
        this.clickSubmitBtn = false;
        const formData = {
          VisitID: this.VisitId,
          TPIDs: this.TPID,
          // Remarks: this.AddendumRemarks,
          CreatedBy: this.loggedInUser.userid || -99,
          Addendum: this.Addendum,
          AddendumHTML: sanitizedAddendumHTML,
          RISAssesmentCategoryID: this.RISAssesmentCategoryID,
          RISErrorCategoryID: this.RISErrorCategoryID,
          RISStatusID: (this.RISAddendumTypeID == "1") ? 16 : 18
        };
        // console.log("formData__",formData);return;
        this.disabledButtonAddendum = true;
        this.isSpinnerAddendum = false;
        this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_VISIT_TEST_ADDENDUM, formData).subscribe((data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              if (this.RISAddendumTypeID == 1) {
                this.toastr.success("Addendum added successfully");
              } else {
                this.toastr.success("Second opinion added successfully");
              }
              this.isStatusChanged.emit(1)
              this.Addendum = "";
              this.AddendumHTML = "";
              this.disabledButtonAddendum = false;
              this.isSpinnerAddendum = true;
              this.getTPByVisitIDForAddendum();
              this.getAddendumByTPID();
              this.appPopupService.closeModal();
            } else {
              this.toastr.error(data.Message)
              this.disabledButtonAddendum = false;
              this.isSpinnerAddendum = true;
            }
          }
        }, (err) => {
          console.log(err);
          this.disabledButtonAddendum = false;
          this.isSpinnerAddendum = true;
          this.toastr.error('Connection error');
        })
      }
    }, 200);
  }

  public getPlainFromHTML(paramHtml): string {
    const sanitizedHtmlContent = this.sanitizer.sanitize(SecurityContext.HTML, paramHtml);
    return this.getPlainText(sanitizedHtmlContent);
  }
  public getPlainText(htmlContent: string): string {
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    const plainText = element.textContent || element.innerText || '';
    // Clean up any additional whitespace
    return plainText.trim();
  }

  ////////////////////////end:addendum form ///////////////////////////////////
  subSectionList: any = [];
  _form = this.fb.group({
    startDate: ['', Validators.compose([Validators.required])],
    endDate: ['', Validators.compose([Validators.required])],
    // PanelId: [{ value: 1714, disabled: true }],//For live GIZ
    // PanelId: [{ value: 975, disabled: true }], // For stg. TEC
    SubSectionID: [null,]
  });
  disabledButtonSearch = false;
  isSpinnerSearch = true;

  getSubSection() {
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.lookupSrv.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.subSectionList = _response;
      // console.log("subsectionsa are: ", this.subSectionList)
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }


  copyText(text: any, i = null) {
    const pin = text;
    this.helper.copyMessage(pin);
  }



  // Print report Comparative study/////////////////////////////////////////////////////////
  reportNotReadyForPrint() {
    this.toastr.warning("Report is not ready or canceled. so you cannot view", "Report Not Viewable");
  }
  ViewReportComparative(row) {
    let radioTestIds = '';
    let radioTP: any = [];
    //   radioTP =[{
    //     "ACCOUNTNO": this.VisitId,
    //     "TESTRESULT_ID": "",
    //     "TestID": "",
    //     "hasEmailSend": "n",
    //     "TESTRESULTID": "n",
    //     "BRANCH_ID": 0,
    //     "PROFILETESTS": this.TPCode,
    //     "PROFILETESTSDESC": this.TPName,
    //     "SECTION": "",
    //     "STATUS": "Final",
    //     "ABBRIVATION": "n",
    //     "REPORTINGTIME": "2023-07-05T20:00:00",
    //     "PROFILETESTID": this.TPID,
    //     "SECTIONID": 7,
    //     "ISPANEL": 0,
    //     "IsCash": "",
    //     "PANELNAME": "n",
    //     "CREATEDON": "n",
    //     "SectionType": "Radiology",
    //     "ReportTemplateType": 2,
    //     "DSBy": "n",
    //     "isReportable": 1,
    //     "WR_ALLOWED": 1,
    //     "EnableEmail": "n",
    //     "ENABLESMS": "n",
    //     "InOut": "N",
    //     "DueBalance": "",
    //     "PanelMailToPatient": "n",
    //     "PanelMailToPanel": "n",
    //     "PanelSMSAlert": "n",
    //     "PanelShowReport": "n",
    //     "PanelShouldReportMails": "n",
    //     "PanelIsByPassDueAmount": "n",
    //     "PanelPOCEmail": "n",
    //     "ProfileIsEmailEnable": "n",
    //     "ProfileIsSMSEnable": "n",
    //     "ProfileIsShowOnline": null,
    //     "isPackage": 1,
    //     "TypeId": 1,
    //     "PROFILEID": "",
    //     "SUBSECTIONID": 18,
    //     "EncAccountNo": null,
    //     "PanelID": null,
    //     "permission_ViewGraphicalReportIcon": false,
    //     "permission_ViewReportIcon": true,
    //     "permission_PRViewReportIcon": true,
    //     "permission_ViewPreReportIcon": false,
    //     "permission_ViewDeliverReportIcon": true,
    //     "permission_InPrgresIcon": false,
    //     "permission_PACSImages": true,
    //     "permission_IsReportableIcon": true,
    //     "permission_PanelIsTestAllowOnlineIcon": false,
    //     "permission_IsTestAllowOnlineIcon": false,
    //     "permission_IsdueblnceIcon": false,
    //     "permission_IsTestCancelled": false,

    // }]
    radioTP = [{
      "ACCOUNTNO": row.PIN.replaceAll("-", ""),
      "PROFILETESTS": row.TPCode,
      "PROFILETESTSDESC": row.TPName,
      "PROFILETESTID": row.TPID,

    }]
    // console.log("radioTP: ",radioTP);return;

    if (!row.TPID) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    }
    else {

      radioTestIds = row.TPID;
      if (radioTestIds) {
        radioTP = { ...radioTP };
        radioTP[0].PROFILETESTID = radioTestIds;
        radioTP[0].ReportType = "tp";
        radioTP[0].ItemType = '';
        radioTP[0].AppName = 'medicubes';
        radioTP[0].LoginName_MC = this.loggedInUser.username;
        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(radioTP[0]).subscribe((res: any) => {
          // console.log("ressssssssssssssssss: ", res)
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            // console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }
    }
  }
  // end::Print report Comparative study/////////////////////////////////////////////////////////

  searchText = "";
  comparativeStudies = []
  getTestProfileComparisonByPatientID() {
    const formValues = this._form.getRawValue();
    if (this._form.invalid) {
      this.toastr.warning('Please provide date range', 'Date Validation'); return false;
    } else {
      const objParams = {
        PatientID: this.PatientID,
        SubSectionID: formValues.SubSectionID,
        DateFrom: formValues.startDate ? Conversions.formatDateObject(formValues.startDate) : null,
        DateTo: formValues.endDate ? Conversions.formatDateObject(formValues.endDate) : null,
      }
      // console.log("objParam: ", objParams)
      // console.log("formValues: ", formValues)
      this.disabledButtonSearch = true;
      this.isSpinnerSearch = false;
      this.spinner.show(this.spinnerRefs.comparativeSection);
      this.sharedService.getData(API_ROUTES.GET_TEST_PROFILE_COMPARASION_BY_PATIENT_ID, objParams).subscribe((resp: any) => {
        this.disabledButtonSearch = false;
        this.isSpinnerSearch = true;
        this.spinner.hide(this.spinnerRefs.comparativeSection);
        if (resp.StatusCode == 200) {
          this.selectedCount = 0;
          this.flexCheckDisabled = false;
          const respData = resp.PayLoad || [];
          if (respData.length) {
            this.comparativeStudies = respData.filter(f => !(f.TPID === this.TPID && f.VisitID === Number(this.VisitId)));
          }
          // console.log("comparativeStudies___", this.comparativeStudies,this.TPID, this.VisitId)
        }
      }, (err) => {
        this.disabledButtonSearch = false;
        this.isSpinnerSearch = true;
        this.spinner.hide(this.spinnerRefs.comparativeSection);
        console.log(err)
      })
    }

  }
  PACSServers = [];
  getPACSServers(VID, TPID, purpose) {
    //purpose : 1 for indvidual, 2 for compare 
    // let VisitID = data.PIN.replaceAll("-", "");
    let selVisits = "";
    let selTPID = "";
    const VisitIDsObj = this.comparativeStudies.filter(row => row.checked);
    selVisits = VisitIDsObj.map(a => { return a.VisitID }).join(',');
    selTPID = VisitIDsObj.map(a => { return a.TPID }).join(',');

    // let TPIDs = VisitIDsObj.map(a => { return a.TPID }).join(',')
    let VisitIDs = "";
    let TPIDs = "";
    if (purpose === 2) {
      VisitIDs = VID.replaceAll("-", "") + ',' + selVisits;
      TPIDs = TPID + "," + selTPID;
    }
    else {
      VisitIDs = VID.replaceAll("-", "");
      TPIDs = TPID;
    }


    this.SysInfo = this.auth.getSystemInfoFromStorage();
    const objParams = { //240401170909,221201097900,
      VisitIDs: VisitIDs,//"240401170909,221201097900,240501050969", //'240301134040',//'240301044020',//VisitID,
      // VisitId: VisitID, //'240301134040',//'240301044020',//VisitID,
      // TPID: TPID,//926//926//TPID
      TPIDs: TPIDs,//"539,488,917,1008,1272,460,946,1185,917,628,872",//TPIDs,//926//926//TPID
      LocID: this.loggedInUser.locationid //Number(this.SysInfo.loginLocId)
    }

    // this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS, objParams).subscribe((resp: any) => {
    this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS_BV, objParams).subscribe((resp: any) => {

      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.PACSServers = resp.PayLoad || [];
        console.log("this.PACSServersthis.PACSServersthis.PACSServers", this.PACSServers);
        this.ServersInfo = this.PACSServers;
        if (this.PACSServers.length === 1) {
          if (this.comparativeStudies.length !== 1) {
            this.toastr.info("Only One Study Is Avalibale In System")
          }
          let createLink = (this.PACSServers[0].BackupServer);

          createLink = createLink.substring(0, createLink.length - 1)
          const sanitizedPath = createLink.replace(/\\/g, '%5C');
          const url = ('radiant://?n=f&v=%22' + sanitizedPath + '%22')
          // console.log("url is :", url)

          // let winRef = window.open((url), '_blank');
          const winRef = window.open((url), '_blank');
          // const shortcutPath = createLink;
          //   let url = ('radiant://?n=d&v=%22'+createLink+'%22') 

          // // Trigger the download of the shortcut file
          // const link = document.createElement('a');
          // link.setAttribute('href', url);
          // //link.setAttribute('download', 'shortcut.lnk');
          // document.body.appendChild(link);
          // link.click();
          // document.body.removeChild(link);

        }

        else if (this.PACSServers.length === 2) {

          const serverObj = [];
          this.PACSServers.forEach(a => {
            this.comparativeStudies.forEach(b => {
              // if (a.VisitID == b.VisitID) {
              serverObj.push(a);
              // }
            })
          })
          console.log("serverObj", serverObj);
          let createLink = serverObj.map(a => { return a.BackupServer }).join(',')
          console.log("serverObj", createLink);
          createLink = createLink.substring(0, createLink.length - 1)
          let b1 = this.PACSServers[0].BackupServer;

          b1 = b1.substring(0, b1.length - 1)
          b1 = b1.replace(/\\/g, '%5C');

          let b2 = this.PACSServers[1].BackupServer;
          b2 = b2.substring(0, b2.length - 1)
          b2 = b2.replace(/\\/g, '%5C');

          const url = ('radiant://?n=f&v=%22' + b1 + '%22' + '&v=%22' + b2 + '%22');

          window.open((url), '_blank');
        }
        else {
          this.toastr.warning("Something Went Wrong");
        }
      }
      else if (resp.StatusCode == 200 && !resp.PayLoad.length) {
        this.toastr.warning("No Record Found");

      }
    }, (err) => {
      console.log(err)
    })


  }

  getSystemInformation(loggedInUser: UserModel) {
    // setTimeout(() => {
    const obj = {
      user: loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href)
    }
    this.sendCommand({ command: 'sys-info', userIdentity: JSON.stringify(obj) });
  }
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }
  selectedCount = 0;
  flexCheckDisabled = false;
  onCheckboxChange() {
    // console.log("datadatadatadata", data)
    this.selectedCount = this.comparativeStudies.filter(row => row.checked).length;
    if (this.selectedCount >= 1) {
      // this.toastr.warning('You can only select up to 2 studies for comparison.', 'Maximum limit is 2');
      this.flexCheckDisabled = true;
    }

    // if (this.selectedCount != 0) {
    //   let VisitIDsObj = this.comparativeStudies.filter(row => row.checked);
    //   VisitIDsObj.forEach(a => {
    //     let found = this.ServersInfo.forEach(b => { return b.VisitID == a.PIN })
    //     if (found.length !== 0) {
    //       this.getPACSServers(a.PIN, a.TPID);
    //     }
    //   })
    // }
  }
  disabledButtonExport = false;
  isSpinnerExport = true;
  exportComparativeStudy() {
    this.spinnerRefs
    this.disabledButtonExport = true;
    this.isSpinnerExport = false;
    // this.spinner.show(this.spinnerRefs.comparativeSection);
    setTimeout(() => {
      this.disabledButtonExport = false;
      this.isSpinnerExport = true;
      // this.spinner.hide(this.spinnerRefs.comparativeSection);
    }, 3000);

    const selectedStudies = this.comparativeStudies.filter(row => row.checked)
    if (!selectedStudies.length) {
      this.toastr.warning("Please select atleast one study", "No Selection");
    } else {
      this.toastr.info("Working in progress", "Success");
    }
  }

  DateError = false;
  validateApplyDate(StartDate, EndDate) {
    if (StartDate > EndDate) {
      this.DateError = true;
      this._form.patchValue({
        endDate: ''
      })
    } else {
      this.DateError = false;
    }
  }

  RISServices = []
  contrastServices = [];
  getRISServicesByVisitIDAll() {
    this.RISServices = [];
    const params = {
      VisitID: this.VisitId,
      isShowAllService: 1
    };
    this.sharedService.getData(API_ROUTES.GET_RISSERVICES_BY_VISITID, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        const services = res.PayLoad || [];
        const result = services.reduce((re, o) => {
          const existObj = re.find(
            obj => obj.TPID === o.TPID
          )

          if (existObj) {
            existObj.services.push({
              StoreItemID: o.StoreItemID,
              Quantity: o.Quantity,
              ConsumedQuantity: o.Quantity,
              StoreItem: o.StoreItem
              // ,MeasurintUnit: o.MeasurintUnit

            })
          } else {
            re.push({
              TPID: o.TPID,
              TPCode: o.TPCode,
              TPName: o.TPName,
              StatusID: o.StatusID,
              RISStatusID: o.RISStatusID,
              SubSectionId: o.SubSectionId,
              services: [{
                StoreItemID: o.StoreItemID,
                Quantity: o.Quantity,
                ConsumedQuantity: o.Quantity,
                StoreItem: o.StoreItem
                // ,MeasurintUnit: o.MeasurintUnit
              }]
            })
          }
          return re
        }, []);
        this.RISServices = result;
        this.contrastServices = this.RISServices.length ? this.RISServices.filter(f => f.SubSectionId == 47) : []

      } else {
        this.RISServices = [];
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  isShowHideAddendumReview = false;
  showHideAddendumReview() {
    // this.getAddendumByTPID();
    this.isShowHideAddendumReview = !this.isShowHideAddendumReview;
  }

  assesmentCategories = [];
  getRISAssesmentCategory() {
    const params = {};
    this.sharedService.getData(API_ROUTES.GET_RIS_ASSESMENT_CATEGORY, params).subscribe((res: any) => {
      this.assesmentCategories = res.PayLoad || [];
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  errorCategories = []
  getRISErrorCategoryResearch() {
    const params = {};
    this.sharedService.getData(API_ROUTES.GET_RIS_ERROR_CATEGORY_RESEARCH, params).subscribe((res: any) => {
      this.errorCategories = res.PayLoad || [];
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  disabledButtonDrRemarks = false;
  isSpinnerDrRemarks = true;
  btnReviewer = false;
  updateVisitTestAddendumDrQueryRemarks() {
    if (!this.DrQueryRemarks || this.DrQueryRemarks == '') {
      this.btnReviewer = true;
      this.toastr.warning("Please enter the reviewer remarks", "Validation Faild");
      return;
    } else {
      this.btnReviewer = false;
      const formData = {
        VisitID: this.VisitId,
        TPIDs: this.TPID,
        DrQueryRemarks: this.DrQueryRemarks,
        CreatedBy: this.loggedInUser.userid || -99,
      };
      this.disabledButtonDrRemarks = true;
      this.isSpinnerDrRemarks = false;
      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_VISIT_TEST_ADDENDUM_DR_QUERY_REMARKS, formData).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.disabledButtonDrRemarks = false;
            this.isSpinnerDrRemarks = true;
          } else {
            this.toastr.error(data.Message)
            this.disabledButtonDrRemarks = false;
            this.isSpinnerDrRemarks = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.disabledButtonDrRemarks = false;
        this.isSpinnerDrRemarks = true;
        this.toastr.error('Connection error');
      })
    }
  }

  caseStudyCategories = []
  getRISCaseStudyCategory() {
    this.caseStudyCategories = [];
    this.sharedService.getData(API_ROUTES.GET_RIS_CASE_STUDY_CATEGORY, {}).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.caseStudyCategories = res.PayLoad || [];
      } else {
        this.toastr.error('Case study category not loaded');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getIsDoctorFeedBack() {
    const params = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID
    }
    if (this.StatusId >= 9) {
      this.sharedService.getData(API_ROUTES.GET_IS_DOCTOR_FEEDBACK, params).subscribe((res: any) => {
        if (res.StatusCode == 200) {
          this.isDoctorFeedback = res.PayLoad[0].isDoctorFeedBack || 0;
        } else {
          this.toastr.error('isDoctorFeedback could not loaded');
        }
      }, (err) => {
        console.log(err);
      })
    }
  }

  pendingIsCaseStudy = false;
  isCaseStudy = false
  reportMarking(event: any) {
    // event.source.checked = false;
    let options = '';
    // this.caseStudyCategories.forEach((caseItem) => {
    //   options += `<option value="${caseItem.RISCaseStudyCategoryID}">${caseItem.RISCaseStudyCategory}</option>`;
    // });

    this.caseStudyCategories.forEach((caseItem) => {
      const isSelected = caseItem.RISCaseStudyCategoryID === this.RISCaseStudyCategoryID ? 'selected' : '';
      options += `<option value="${caseItem.RISCaseStudyCategoryID}" ${isSelected}>${caseItem.RISCaseStudyCategory}</option>`;
    });

    // if (event.checked) {
    let selectedCase = null;
    let processRemarks = null;
    const unMarkMessageDescription = event.checked ? 'Are you sure you want to mark this test as outstanding?' : 'Are you sure you want to Unmark this test as outstanding?'
    Swal.fire({
      title: event.checked ? 'Mark as Case Study' : 'Unmark from Case Study',
      html:
        `<p>` + unMarkMessageDescription + `</p>
            <select id="swal-select" class="form-control form-control-sm mb-1">
            <option value="">--Select Category--</option>
            ${options}
          </select>
             <textarea id="swal-textarea" class="form-control" placeholder="Enter Remarks">`+ this.RISCaseStudyCategoryRemarks + `</textarea>`,
      showCancelButton: true,
      confirmButtonText: '<i class="ti-check text-white"></i> Yes',
      cancelButtonText: '<i class="ti-close text-white"></i> No',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'sweet-alert-confirm-btn-danger',
        input: 'custom-radio'
      },
      preConfirm: () => {
        selectedCase = (document.getElementById('swal-select') as HTMLSelectElement).value;
        console.log("selectedCase:", selectedCase)
        processRemarks = (document.getElementById('swal-textarea') as HTMLTextAreaElement).value;

        if (event.checked && processRemarks === '') {
          Swal.showValidationMessage('Please enter remarks');
          return false;
        }
        else if (event.checked && (!selectedCase || selectedCase == '')) {
          Swal.showValidationMessage('Please select any case option');
          return false;
        }
        else {
          return { selectedCase, processRemarks };
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const obj = {
          VisitID: this.VisitId,
          TPID: this.TPID,
          RISCaseStudyCategoryID: event.checked ? selectedCase : null,
          RISCaseStudyCategoryRemarks: event.checked ? processRemarks : ""
        };
        this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RIS_CASE_STUDY_CATEGORY, obj).subscribe((data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              if (obj.RISCaseStudyCategoryID) {
                this.toastr.success(data.Message);
              } else {
                this.toastr.success("Report Unmarked from Case Study");
              }
              this.isCaseStudy = event.checked ? true : false;
              event.source.checked = event.checked ? true : false;
            } else {
              this.toastr.error(data.Message)
              this.isCaseStudy = event.checked ? false : true;
              event.source.checked = event.checked ? false : true;
            }
          }
        }, (err) => {
          console.log(err);
          this.isCaseStudy = event.checked ? false : true;
          event.source.checked = event.checked ? false : true;
          this.toastr.error('Connection error');
        })
      }
    });
    // } else {
    //   this.isCaseStudy = false;
    // }
  }
  onCheckboxClick(event: Event) {
    event.preventDefault();
    this.pendingIsCaseStudy = !this.isCaseStudy;
  }
  screenPermissions = [];
  isMarkCaseStudy = false;
  screenPermissionsObj: any = {};
  isAIAssist = false;
  disabledButtonAIRequest = false;
  isSpinnerAIRequest = true;
  disabledButtonDoctorAIFeedback = false;
  isSpinnerDoctorAIFeedback = true;
  getPermissions() {
    this.screenPermissionsObj = this.auth.getUserPermissionsFromLocalStorage();
    const data = this.screenPermissionsObj.find(i => i.state == 'can_mark_report_casestudy');
    this.isMarkCaseStudy = data ? true : false;
    const aiassist = this.screenPermissionsObj.find(i => i.key == 'can-use-ai-assist');
    this.isAIAssist = aiassist ? true : false;
  }


  @ViewChild('postFeedback') postFeedback;
  FeedbackPopupRef: NgbModalRef;
  isReportDelay = false;
  checkReportDelay(event) {
    this.isReportDelay = event.checked ? true : false;

  }




  postFeedbackProcess(radioEditStatus, statusID) {
    this.getDSQuestions();
    this.RadioEditStatus = radioEditStatus;
    this.StatusID = statusID;
    this.feedbackQuestions.forEach(a => {
      a.checked = false;
    })
    this.FeedbackPopupRef = this.appPopupService.openModal(this.postFeedback, { backdrop: 'static', size: 'md' });

  }


  savePostFeedabck() {
    this.clickSubmit = true;
    if (!this.feedbackRemarks || this.feedbackRemarks == "") {
      this.toastr.error("Please provide Remarks !", "Validation Error");
      return;
    } else {
      this.clickSubmit = false;
    }
    const dsQuestions = this.feedbackQuestions.filter(a => a.checked);

    const dataObj = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      Remarks: this.feedbackRemarks,
      CreatedBy: this.loggedInUser.userid,
      SourceID: 1,
      tblDSFeedBack: dsQuestions.map(a => (
        {
          QuestionID: a.QuestionId,
          Question: a.Description
        }
      ))
    };
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_DS_FEEDBACK, dataObj).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.toastr.success(data.Message);
        this.isDoctorFeedback = true;
        this.FeedbackPopupRef.close();
      }
    }, (err) => {
      console.log(err);
    })
  }

  revertToUnassigned() {
    const dataObj = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID,
      CreatedBy: this.loggedInUser.userid,
      StatusId: 6,
      RISStatusID: 6,
      RISWorkListID: this.RISWorkListID
    };
    this.sharedService.insertUpdateData(API_ROUTES.REVERT_TO_UNASSIGNED, dataObj).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.toastr.success(data.Message);
        this.isStatusChanged.emit(1)
        this.appPopupService.closeModal();
      }
      else {
        this.toastr.error(data.Message);
      }
    }, (err) => {
      console.log(err);
      this.toastr.error("Something Went Wrong");
    })
  }

  closeReportFeedback() {
    this.isDSFinal = null;
    this.reportFeedbackPopupRef.close();
  }
  logoutMT() {
    localStorage.removeItem('VerifiedUserID');
    localStorage.removeItem('RegLocId');
    localStorage.removeItem('VerifiedUserName');
    this.VerifiedUserID = null;
    this.RegLocId = null;
    this.VerifiedUserName = '';
  }

  // AI Assistince Section 
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ////begin::AI Assistince Request//////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
  isAIImages = false;
  anonId: string | null = null;
  AIResponse: any;
  originalData: any; // Fixed typo from "origional" to "original"
  private storedDicomData: {
    anonId?: string;
    originalData?: any;
    imagePath?: string;
  } = {};

  // Public accessor for template
  get hasStoredDicomData(): boolean {
    return !!this.storedDicomData.imagePath;
  }

  // Main request function
  AIButtonClicked = false;
  // requestAIAssistance(VisitID: number, TPID: number): void {
  //   this.toastr.warning('AI Request Started', 'AI Assistance Started');
  //   setTimeout(() => {
  //     this.toastr.warning('AI Request End', 'AI Assistance End');
  //   }, this.AITimeDelay);
  // }
  requestAIAssistance(VisitID: number, TPID: number): void {
    this.isShowMessageDiv = true;
    this.AIButtonClicked = true;
    this.disabledButtonAIRequest = true;  // Disable request button
    this.isSpinnerAIRequest = false;       // Show spinner on request button

    const dataObj = {
      VisitID: Number(VisitID),
      PatientID: this.PatientID,
      TPID: TPID,
      LocID: this.LocId,
      RadiologistID: this.loggedInUser.userid,
    };

    this.sharedService.insertUpdateData(API_ROUTES.REQUEST_AI_ASSISTANCE, dataObj).subscribe({
      next: (data: any) => {
        try {
          // Parse the response payload
          const payload = typeof data.PayLoadStr === 'string'
            ? JSON.parse(data.PayLoadStr)
            : data.PayLoadStr;

          console.log('AI Response Payload:', payload);

          // Parse the OriginalData
          const originalData = payload.OrigionalData
            ? (typeof payload.OrigionalData === 'string'
              ? JSON.parse(payload.OrigionalData)
              : payload.OrigionalData)
            : {
              PatientID: this.PatientID.toString(),
              PatientName: '',
              StudyInstanceUID: '',
              SeriesInstanceUID: '',
              SOPInstanceUID: ''
            };

          // Store data globally in component
          this.storedDicomData = {
            anonId: payload.AnonId,
            originalData: originalData,
            imagePath: payload.ImagePath || ''
          };
          this.anonId = payload.AnonId;

          if (data.StatusCode === 200) {
            this.toastr.success(data.Message || 'AI request processed successfully');
            // If we already have the image path, open it directly
            if (this.storedDicomData.imagePath) {
              this.ImagePath = this.storedDicomData.imagePath;
              this.isAIImages = true;
              this.AIButtonClicked = false;
              this.openDicomImage(this.storedDicomData.imagePath);
            } else {
              // Wait 2 minutes (120 seconds) for AI processing, then try to get the image
              setTimeout(() => {
                // Reset request button state
                this.disabledButtonAIRequest = false;
                this.isSpinnerAIRequest = true;
                this.attemptToOpenProcessedImage();
              }, this.AITimeDelay); // 120000= 2 minutes, 80000 = 80 seconds or 1.5 minutes, 45000: 45 seconds

            }
          } else {
            this.toastr.error(data.Message || 'AI request failed');
            this.resetAIRequestButtonState();
          }
        } catch (error) {
          console.error('Error processing AI response:', error);
          this.handleError(error);
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        this.handleError(err);
      }
    });
  }
  private attemptToOpenProcessedImage(): void {
    if (this.storedDicomData.anonId) {
      this.isAIImages = true;
    }
    if (this.storedDicomData.imagePath) {
      // If we have image path, open directly
      this.openDicomImage(this.storedDicomData.imagePath);
      this.AIButtonClicked = false;
    } else if (this.storedDicomData.anonId && this.storedDicomData.originalData) {
      // If we have anonId but no path, call API to get processed image
      const dicomRequest = {
        anon_id: this.storedDicomData.anonId,
        original: this.storedDicomData.originalData
      };
      this.getAndOpenDicomImage(dicomRequest);
    } else {
      this.toastr.warning('AI processing is taking longer than expected. Please try again later.');
      this.resetButtonState();
    }
  }
  isShowMessageDiv = false;
  private getAndOpenDicomImage(dicomData: any): void {
    const requestPayload = {
      anon_id: dicomData.anon_id,
      original: {
        PatientID: dicomData.original.PatientID,
        PatientName: dicomData.original.PatientName,
        StudyInstanceUID: dicomData.original.StudyInstanceUID,
        SeriesInstanceUID: dicomData.original.SeriesInstanceUID,
        SOPInstanceUID: dicomData.original.SOPInstanceUID
      }
    };

    this.sharedService.getData(API_ROUTES.REQUEST_AI_PROCESSED_DICOM, requestPayload).subscribe({
      next: (response: any) => {
        try {
          if (response.StatusCode === 200) {
            const payload = typeof response.PayLoadStr === 'string'
              ? JSON.parse(response.PayLoadStr)
              : response.PayLoadStr;

            // Update the stored path
            this.storedDicomData.imagePath = payload.ImagePath || payload.path;
            this.ImagePath = this.storedDicomData.imagePath;

            if (this.storedDicomData.imagePath) {
              this.isShowMessageDiv = false;
              this.isAIImages = true;
              this.AIButtonClicked = false;
              this.openDicomImage(this.storedDicomData.imagePath);
              this.toastr.success("DICOM image is ready for viewing");
            } else {
              this.toastr.error("DICOM image path not found");
              this.resetButtonState();
            }
          } else {
            this.toastr.error(response.Message || "Failed to retrieve DICOM image");
            this.resetButtonState();
          }
        } catch (error) {
          this.handleError(error);
        }
      },
      error: (error) => {
        this.handleError(error);
        this.resetButtonState();
      }
    });
  }

  private resetButtonState(): void {
    this.disabledButtonAIRequest = false;
    this.isSpinnerAIRequest = true;
    this.AIButtonClicked = false;
  }


  disabledButtonAIImages = false;
  isSpinnerAIImages = true;

  AIAssistanceRequestRow: any;
  ImagePath: any = null;
  getRISAIAssistanceRequestByVIsitIDTPID() {
    const params = {
      VisitID: Number(this.VisitId),
      TPID: this.TPID
    };

    this.sharedService.getData(API_ROUTES.GET_RIS_AI_ASSISTANCE_REQUEST_BY_VISIT_ID_TPID, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.AIAssistanceRequestRow = res.PayLoad[0];
        // Reset storedDicomData
        this.storedDicomData = {
          anonId: null,
          originalData: null,
          imagePath: null
        };

        // Check if we have Annon_ID
        if (this.AIAssistanceRequestRow.Annon_ID) {
          this.isAIImages = true;
          this.storedDicomData.anonId = this.AIAssistanceRequestRow.Annon_ID;
          this.anonId = this.storedDicomData.anonId;
          // Parse AIServerResponse to get original data
          try {
            const aiResponse = JSON.parse(this.AIAssistanceRequestRow.AIServerResponse);
            if (aiResponse.anonymized_data?.original) {
              this.storedDicomData.originalData = aiResponse.anonymized_data.original;
            }
          } catch (e) {
            console.error('Error parsing AIServerResponse:', e);
          }
          // Store path if it exists (but don't open automatically)
          if (this.AIAssistanceRequestRow.DeAnonymizedFolderPath) {
            this.storedDicomData.imagePath = this.AIAssistanceRequestRow.DeAnonymizedFolderPath;
            this.ImagePath = this.storedDicomData.imagePath
          }
        } else {
          this.isAIImages = false;
        }

      }
      // else {
      //   // this.toastr.error('AI assistance request row could not be loaded');
      // }
    }, (err) => {
      console.log(err);
      this.toastr.error('Error loading AI assistance request');
    });
  }
  getAndOpenDicomImageByButton(): void {
    this.disabledButtonAIImages = true;   // Disable AI Images button
    this.isSpinnerAIImages = false;        // Show spinner on AI Images button

    if (this.ImagePath) {
      // If we have the image path, open directly
      this.openDicomImage(this.ImagePath);
      this.resetAIImagesButtonState();
    } else if (this.anonId && this.storedDicomData.originalData) {
      // If we have anonId but no path, try to get the image
      const dicomRequest = {
        anon_id: this.anonId,
        original: this.storedDicomData.originalData
      };

      this.sharedService.getData(API_ROUTES.REQUEST_AI_PROCESSED_DICOM, dicomRequest).subscribe({
        next: (response: any) => {
          try {
            if (response.StatusCode === 200) {
              const payload = typeof response.PayLoadStr === 'string'
                ? JSON.parse(response.PayLoadStr)
                : response.PayLoadStr;

              // Update the stored path
              this.storedDicomData.imagePath = payload.ImagePath || payload.path;
              this.ImagePath = this.storedDicomData.imagePath;

              if (this.storedDicomData.imagePath) {
                this.openDicomImage(this.storedDicomData.imagePath);
                this.toastr.success("DICOM image is ready for viewing");
              } else {
                this.toastr.error("DICOM image path not found");
              }
            } else {
              this.toastr.error(response.Message || "Failed to retrieve DICOM image");
            }
          } catch (error) {
            this.handleError(error);
          }
          this.resetAIImagesButtonState();
        },
        error: (error) => {
          this.handleError(error);
          this.resetAIImagesButtonState();
        }
      });
    } else {
      this.toastr.warning('No AI images available. Please request AI assistance first.');
      this.resetAIImagesButtonState();
    }
  }
  private resetAIRequestButtonState(): void {
    this.disabledButtonAIRequest = false;
    this.isSpinnerAIRequest = true;
    this.AIButtonClicked = false;
  }

  private resetAIImagesButtonState(): void {
    this.disabledButtonAIImages = false;
    this.isSpinnerAIImages = true;
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.toastr.error(error.message || "An error occurred");
    this.resetAIRequestButtonState();
    this.resetAIImagesButtonState();
  }

  private openDicomImage(imagePath: string): void {
    this.openDicomImageWithOrigional();
    return;
    try {
      // var createLink = (this.PACSServers[0].BackupServer);

      // createLink = createLink.substring(0, createLink.length - 1)
      const createLink = imagePath
      const sanitizedPath = createLink.replace(/\\/g, '%5C');
      const url = ('radiant://?n=f&v=%22' + sanitizedPath + '%22')
      // console.log("url is :", url)

      // let winRef = window.open((url), '_blank');
      const winRef = window.open((url), '_blank');
    } catch (error) {
      console.error('Error opening DICOM:', error);
      this.toastr.error("Could not open DICOM image");
    }
  }

  private handleError_(error: any): void {
    console.error('Error:', error);
    this.toastr.error(error.message || "An error occurred");
    this.disabledButtonAIRequest = false;
    this.isSpinnerAIRequest = false;
  }

  // Open the DICOM images
  openDicomImageWithOrigional() {
    // debugger;
    const VisitIDsObj = this.comparativeStudies.filter(row => row.checked);
    this.isVPN = localStorage.getItem('isVPN') === 'true';

    // 🔹 Step 1: First fixed object
    const firstObj = {
      VisitID: this.VisitId.replaceAll("-", ""),
      TPID: this.TPID
    };

    // 🔹 Step 2: Map VisitIDsObj array into new objects
    const dynamicObjs = VisitIDsObj.map(item => ({
      VisitID: item.VisitID,
      TPID: item.TPID
    }));

    // 🔹 Step 3: Merge them into final tblVisitTestDetail array
    const tblVisitTestDetail = [firstObj, ...dynamicObjs];

    // 🔹 Step 4: Final object for API
    const objParams = {
      IsVPN: this.isVPN,
      LocID: this.loggedInUser.locationid,
      tblVisitTPID: tblVisitTestDetail,
      IsAI: true,
      UserID: this.loggedInUser.userid
    };

    this.disabledButtonAIImages = true;
    this.isSpinnerAIImages = false;
    this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS_LOC_AND_VISITS_V2, objParams).subscribe((resp: any) => {
      this.disabledButtonAIImages = false;
      this.isSpinnerAIImages = true;
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.PACSServers = resp.PayLoad || [];
        this.ServersInfo = this.PACSServers;

        // Dynamic handling for any number of servers
        if (this.PACSServers.length > 0) {
          // Check if we have only one study available
          if (this.PACSServers.length === 1 && this.comparativeStudies.length !== 1) {
            this.toastr.info("Only One Study Is Available In System");
          }

          // Create the URL dynamically for any number of servers
          let url = 'radiant://?n=f';

          // Add each server path to the URL
          this.PACSServers.forEach((server, index) => {
            let sanitizedPath = server.BackupServer;

            // Remove trailing slash if present
            if (sanitizedPath.endsWith('\\')) {
              sanitizedPath = sanitizedPath.substring(0, sanitizedPath.length - 1);
            }

            // Replace backslashes with URL encoding
            sanitizedPath = sanitizedPath.replace(/\\/g, '%5C');

            // Add to URL with proper parameter name
            url += `&v=%22${sanitizedPath}%22`;
          });

          // Open the URL
          window.open(url, '_blank');
        } else {
          this.disabledButtonAIImages = false;
          this.isSpinnerAIImages = true;
          this.toastr.warning("No PACS Servers Available");
        }
      } else if (resp.StatusCode == 200 && !resp.PayLoad.length) {
        this.toastr.warning("No Record Found");
        this.disabledButtonAIImages = false;
        this.isSpinnerAIImages = true;
      }
    }, (err) => {
      console.log(err);
      this.disabledButtonAIImages = false;
      this.isSpinnerAIImages = true;
      this.toastr.error("Error fetching PACS servers");
    });
  }

  // New function for time delays
  timeDelays: any[] = [];   // store all delays
  xrayDelay = 0;
  memoDelay = 0;
  AITimeDelay = 65000;
  getTimeDelays() {
    this.sharedService.getUtility(API_ROUTES.GET_TIME_DELAYS).subscribe(
      (data: any) => {
        try {
          if (!Array.isArray(data)) {
            throw new Error('Invalid response: Expected an array of time delays.');
          }

          this.timeDelays = data;

          // Normalize case and check Delay safely
          const xray = this.timeDelays.find(
            x => typeof x?.Name === 'string' && x.Name.toLowerCase().trim() === 'xray'
          );
          const memo = this.timeDelays.find(
            x => typeof x?.Name === 'string' && x.Name.toLowerCase().trim() === 'memo'
          );

          this.xrayDelay = xray && typeof xray.Delay === 'number' ? xray.Delay : 0;
          this.memoDelay = memo && typeof memo.Delay === 'number' ? memo.Delay : 0;
          if (this.SubSectionId == 29) {
            // SubSectionId 29 = xray, SubSectionId 64 = memo
            this.AITimeDelay = this.xrayDelay;
          } else if (this.SubSectionId == 64) {
            this.AITimeDelay = this.memoDelay;
          } else {
            this.AITimeDelay = 50000;
          }

        } catch (err: any) {
          console.error('Error processing time delays:', err);
          this.toastr.error('Unexpected response format for time delays');
          this.xrayDelay = 0;
          this.memoDelay = 0;
        }
      },
      (err) => {
        console.error('API call failed:', err);
        this.toastr.error('Failed to load time delays');
        this.xrayDelay = 0;
        this.memoDelay = 0;
      }
    );
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////end::AI Assistince Request//////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////
}
