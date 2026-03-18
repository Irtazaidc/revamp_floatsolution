// @ts-nocheck
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { TestProfileConfigurationService } from '../../Services/test-profile-configurations-services';
import { FormGroup, FormBuilder } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { DatePipe } from '@angular/common';
import { LabConfigsService } from 'src/app/modules/lab-configs/services/lab-configs.service';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';

@Component({
  standalone: false,

  selector: 'app-test-comments',
  templateUrl: './test-comments.component.html',
  styleUrls: ['./test-comments.component.scss']
})
export class TestCommentsComponent implements OnInit {
  from: FormGroup;
  TPCONFIGFormSubmitted = false;
  TPConfigForm = this.fb.group({
    PatientInstructionsHTML: ['', ''],
  });

  spinnerRefs = {
    machineAssocPopup: 'machineAssocPopup',
    machineAssocSection: 'machineAssocSection',
    machinePriorityFormSection: 'machinePriorityFormSection',
    testProfilesDropdown: 'testProfilesDropdown',
    listSection: 'listSection',
    mainFormSection: 'mainFormSection'
  }

  loggedInUser: UserModel;



  IsImageAttached = 0;
  TestProfilePicId: any;
  curTestProfilePicID: any;
  loggedIn = false;
  isSubmitted = false;
  ModifiedBy = null;
  TPID: any;
  ExTPID: any;
  isAuthenticated: boolean = false;
  isHCTestProfile = false;
  isOnlineBookingAllowed = false;
  selectedAlternateTestCollectionMedium: any;
  selectedTestCollectionMedium: any;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverTitlePriority: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to save?',
    popoverPriorityMessage: 'Are you <b>sure</b> you want to set priority?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  TPParams = [];
  CardTitle: string;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  TestProfileCode: any;
  disabledButtonRemove: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinnerRemove: boolean = true;//Hide Loader
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private auth: AuthService,
    private tpService: TestProfileService
  ) { }
  hasQueryParams: boolean = false;
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getTestProfileList('');
  }
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
      }
    };
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  testProfileList = [];
  searchText = "";
  getTestProfileList(tpname) {
    this.testProfileList = [];
    let _params = {
      tpids: null,
      branchId: 1
    }

    this.spinner.show(this.spinnerRefs.listSection);
    this.tpService.getTestsByName(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        // console.log(data, "data");
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        if (data.length) {
          data.forEach(element => {
            element.TestProfileCodeDesc = `${element.TestProfileCode} - ${element.TestProfileName} (${element.TestProfilePrice})`;
          });
        }
        this.testProfileList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log(err);
    });
  }
  rowIndex = null;
  TPRow = [];
  TPComments: string = '<p></p>';
  TPCode: string = '';
  TestProfileName: string = '';
  getTestCommentWithID(row, i) {
    this.TPCode = row.TestProfileCode;
    this.TestProfileName = row.TestProfileName;
    this.rowIndex = i;
    this.TPID = row.TPId;
    this.TPNameCardHeader = this.TPCode + ' - ' + this.TestProfileName;
    let response = []
    this.spinner.show();
    let params = {
      TPID: this.TPID
    }
    this.spinner.show(this.spinnerRefs.mainFormSection);
    this.tpService.getTestCommentByTPID(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.mainFormSection);
      response = resp.PayLoad;
      this.TPRow = response;
      if (this.TPRow?.length) {
        const footer = this.TPRow[0].ReportFooterHTML || this.TPRow[0].ReportFooter_HTML || '';
        this.TPComments = footer.replace(/Untitled document/gi, '');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.mainFormSection);
      console.log(err);
    })
  }

  TPNameCardHeader = "Test Profile Config";
  updateTPComments() {
    let param = {
      TPID: this.TPID,
      TPComments: this.TPComments,
      ModifyBy: this.loggedInUser.userid
    }
    this.disabledButton = true;
    this.isSpinner = false;
    this.tpService.updateTPComments(param).subscribe((data: any) => {
      this.disabledButton = false;
      this.isSpinner = true;
      if (JSON.parse(data.payLoad).length) {
        if (data.statusCode == 200) {
          this.toastr.success(data.message);
        } else {
          this.toastr.error(data.message);
        }
        setTimeout(() => {
          this.disabledButton = false;
          this.isSpinner = true;
        }, 500);
      }
    }, (err) => {
      setTimeout(() => {
        this.disabledButton = false;
        this.isSpinner = true;
      }, 500);
    })
  }

}