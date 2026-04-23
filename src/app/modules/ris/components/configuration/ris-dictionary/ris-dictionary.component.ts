// @ts-nocheck
import { Component, OnInit, SecurityContext } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from '../../../../shared/helpers/api-routes';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-ris-dictionary',
  templateUrl: './ris-dictionary.component.html',
  styleUrls: ['./ris-dictionary.component.scss']
})

export class RISDictionaryComponent implements OnInit {
  config = {
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
        // if (event.data.keyCode === 32) {
        //   const range = selection.getRanges()[0];
        //   const selectedText = this.getPreviousWord(range);
        //   const codeObj = this.codesList.find(a => a.TextCode === selectedText);
        //   if (codeObj) {
        //     const wordToReplace = codeObj.TextHTMLTag;
        //     const textCode = codeObj.TextCode;
        //     if (selectedText === textCode) {
        //       const previousWordRange = range.clone();
        //       previousWordRange.setEnd(range.startContainer, range.startOffset);
        //       previousWordRange.setStart(previousWordRange.startContainer, previousWordRange.startOffset - selectedText.length);
        //       previousWordRange.deleteContents();
        //       const newHtml = wordToReplace;
        //       editor.insertHtml(newHtml);
        //       this.cdr.detectChanges();
        //     }
        //   }
        // }
      }
    }
  };
  TextDescription = "";
  RISDictionaryID: any = null;
  TextCode: any = null;
  CategoryID = null;
  searchText = '';
  existingRow = [];
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonDelete = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  isSpinnerDelete = true;//Hide Loader

  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection'
  }

  ActionLabel = "Save";
  CardTitle = "Add Dictionary Word";
  _form = this.fb.group({
    TextCode: ['', Validators.compose([Validators.required])],
    TextDescription: ['', Validators.compose([Validators.required])],
    isBold: [''],
    isItalic: [''],
    isUnderline: [''],
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!',
    popoverMessage: 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?',
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
  testList: any[];
  titleToShowOnCard: any = '';
  dataList = [];
  dataListGlobal = [];
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private auth: AuthService,
    private risSharedService: SharedService,
    private route: ActivatedRoute,
    private sanitized: DomSanitizer
  ) {
  }
  screenIdentity = null;
  isMainDictionary = true;
  categoryText = "Main Dictionary";
  myHtml = "";
  ngOnInit(): void {
    this.screenIdentity = this.route.routeConfig.path;
    if (this.screenIdentity === 'ris-user-dictionary')
      this.isMainDictionary = false;
    else
      this.isMainDictionary = true;
    this.categoryText = this.isMainDictionary ? "Main Dictionary" : "User Dictionary";
    this.loadLoggedInUserInfo();
    this.getRISDictionaryByUserID();
    this.myHtml = '<span class="demo">Hello, world!</span>';
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  rowIndex = null;
  getSingleRow(RISDictionaryID, CategoryID, TextCode, i) {
    this.rowIndex = i;
    this.RISDictionaryID = RISDictionaryID;
    this.CategoryID = CategoryID;
    this.TextCode = TextCode;
    this.getRISDictionaryByRISDictionaryID();
  }

  getRISDictionaryByRISDictionaryID() {
    if (this.RISDictionaryID) {
      this.ActionLabel = "Update"
      this.CardTitle = "Update Dectionary Word";
      this.confirmationPopoverConfig.popoverMessage = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?',
        this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?';
    } else {
      this.ActionLabel = "Save"
      this.CardTitle = "Add Dictionary Word";
      this.confirmationPopoverConfig.popoverMessage = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?',
        this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?';
    }
    this.spinner.show(this.spinnerRefs.formSection);
    const params = {
      RISDictionaryID: this.RISDictionaryID
    };
    this.risSharedService.getData(API_ROUTES.GET_RIS_DICTIONARY_BY_RIS_DICTIONARY_ID, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.formSection);
      if (res.StatusCode == 200) {
        const formExistingData = res.PayLoad[0];
        console.log("formExistingData___________________", formExistingData)
        // this.isMainDictionary = formExistingData["CategoryID"] == 1 ? true : false;
        this.selectedColor = formExistingData["TextColor"];
        this._form.patchValue({
          TextCode: formExistingData["TextCode"],
          TextDescription: formExistingData["TextHTMLTag"],
          isBold: formExistingData["isBold"],
          isItalic: formExistingData["isItalic"],
          isUnderline: formExistingData["isUnderline"]
        });

      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  public getPlainFromHTML(paramHtml): string {
    const sanitizedHtmlContent = this.sanitized.sanitize(SecurityContext.HTML, paramHtml);
    return this.getPlainText(sanitizedHtmlContent);
  }
  public getPlainText(htmlContent: string): string {
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    const plainText = element.textContent || element.innerText || '';
    // Clean up any additional whitespace
    return plainText.trim();
  }
  // Utility function to remove the outer <p> tag
  removeOuterPTags(html: string): string {
    // Create a DOM parser to handle the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
  
    // Get the first child element
    const bodyChild = doc.body.firstElementChild;
  
    // Check if it's a <p> tag and unwrap its content
    if (bodyChild && bodyChild.tagName.toLowerCase() === 'p') {
      return bodyChild.innerHTML;
    }
  
    // Return the original HTML if no <p> tag is found
    return html;
  }
  saveDictionary(formValues) {
    //  Remove the outer <p> tag
    const htmlContent = formValues.TextDescription;
    const withoutOuterP = this.removeOuterPTags(htmlContent);
    this.spinner.show(this.spinnerRefs.formSection);
    this.disabledButton = true;
    this.isSpinner = false;
    const formData = {
      RISDictionaryID: this.RISDictionaryID,
      CategoryID: this.isMainDictionary ? 1 : 2,
      TextCode: formValues.TextCode.trim(),
      TextDesc: this.getPlainFromHTML(formValues.TextDescription).replace('\n\n', ' '),
      TextHTMLTag: withoutOuterP,
      isBold: formValues.isBold,
      isItalic: formValues.isItalic,
      isUnderline: formValues.isUnderline,
      TextColor: this.selectedColor,
      CreatedBy: this.loggedInUser.userid || -99,
    };
    // console.log("form obj is :",formData);//return;
    this.risSharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RIS_DICTIONARY, formData).subscribe((data: any) => {
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          this.spinner.hide(this.spinnerRefs.formSection);
          this.toastr.success(data.Message);
          this.clearForm();
          this.getRISDictionaryByUserID();
          this.selectedColor = "#3F4254";
          this.disabledButton = false;
          this.isSpinner = true;
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

  selectedColor = "#000";
  // isMainDictionary = true;
  // categoryText = "Main Dictionary";
  // onSlideToggleChange() {
  //   this.categoryText = this.isMainDictionary ? "Main Dictionary" : "User Dictionary";
  // }

  TextHTMLTag = "";
  insertUpdateDictionary() {
    this.TextHTMLTag = "";
    const formValues = this._form.getRawValue();
    // this.TextHTMLTag = `<span [ngClass]="{'bold': ` + formValues.isBold + `, 'italic': ` + formValues.isItalic + `, 'underline': ` + formValues.isUnderline + `}">This is some text</span>`;
    this.TextHTMLTag = this.makeHtml(formValues);
    this._form.markAllAsTouched();
    if (this._form.invalid) {
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      // let checkDuplicateMain = this.dataListGlobal.find(el => el.CategoryID == 1 && el.TextCode.trim() === formValues.TextCode.trim());
      // let checkDuplicateUser = this.dataListGlobal.find(el => el.CategoryID == 2 && el.TextCode.trim() === formValues.TextCode.trim());
      const checkDuplicateMain = this.dataListGlobal.find(el => el.CategoryID == 1 && el.TextCode.trim().localeCompare(formValues.TextCode.trim()) === 0);
      const checkDuplicateUser = this.dataListGlobal.find(el => el.CategoryID == 2 && el.TextCode.trim().localeCompare(formValues.TextCode.trim()) === 0);

      if (this.RISDictionaryID && this.TextCode === formValues.TextCode) {
        this.saveDictionary(formValues)
      } else
        if (
          (checkDuplicateMain && this.screenIdentity == 'ris-dictionary')
          || (checkDuplicateUser && this.screenIdentity == 'ris-user-dictionary')
          || (this.TextCode == formValues.TextCode)
          // && !(this.RISDictionaryID && this.TextCode=== formValues.TextCode)

        ) {
          this.toastr.warning("This shortcut already exists", "Shortcut Duplication"); return;
        } else {
          // this.toastr.success("Not Exist ","Exist form "); return;
          // this.spinner.show(this.spinnerRefs.formSection);
          // this.disabledButton = true;
          // this.isSpinner = false;
          // let formData = {
          //   RISDictionaryID: this.RISDictionaryID,
          //   CategoryID: this.isMainDictionary ? 1 : 2,
          //   TextCode: formValues.TextCode.trim(),
          //   TextDesc: formValues.TextDescription,
          //   TextHTMLTag: this.TextHTMLTag,
          //   isBold: formValues.isBold,
          //   isItalic: formValues.isItalic,
          //   isUnderline: formValues.isUnderline,
          //   TextColor: this.selectedColor,
          //   CreatedBy: this.loggedInUser.userid || -99,
          // };
          // // console.log("form obj is :",formData);//return;
          // this.risSharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RIS_DICTIONARY, formData).subscribe((data: any) => {
          //   if (JSON.parse(data.PayLoadStr).length) {
          //     if (data.StatusCode == 200) {
          //       this.spinner.hide(this.spinnerRefs.formSection);
          //       this.toastr.success(data.Message);
          //       this.clearForm();
          //       this.getRISDictionaryByUserID();
          //       this.selectedColor = "#3F4254";
          //       this.disabledButton = false;
          //       this.isSpinner = true;
          //     } else {
          //       this.spinner.hide(this.spinnerRefs.formSection);
          //       this.toastr.error(data.Message)
          //       this.disabledButton = false;
          //       this.isSpinner = true;
          //     }
          //   }
          // }, (err) => {
          //   console.log(err);
          //   this.spinner.hide(this.spinnerRefs.formSection);
          //   this.disabledButton = false;
          //   this.isSpinner = true;
          //   this.toastr.error('Connection error');
          // })
          this.saveDictionary(formValues);
        }

    }
  }

  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  getRISDictionaryByUserID() {
    this.spinner.show(this.spinnerRefs.listSection);
    this.dataListGlobal = [];
    const params = {
      UserID: this.loggedInUser.userid || -99,
      CategoryID: (this.screenIdentity == 'ris-user-dictionary') ? 2 : 1
    };
    this.risSharedService.getData(API_ROUTES.GET_RIS_DICTIONARY_BY_USER_ID, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        this.clearForm();
        this.dataListGlobal = res.PayLoad || [];

        this.dataListGlobal = this.dataListGlobal.map((a) => ({ CategoryTitle: (a.CategoryID == 1) ? 'Default' : 'Self', ...a }));
        this.dataListGlobal = this.dataListGlobal.map(a => ({
          RISDictionaryID: a.RISDictionaryID,
          CategoryID: a.CategoryID,
          CategoryTitle: a.CategoryTitle,
          TextCode: a.TextCode,
          TextDesc: a.TextDesc,
          TextHTMLTag: this.transform(a.TextHTMLTag)
        }))
        this.dataList = this.dataListGlobal;
        this.countAll = this.dataListGlobal.length;
        this.countMain = this.dataListGlobal.filter(a => a.CategoryID == 1).length;
        this.countMy = this.dataListGlobal.filter(a => a.CategoryID == 2).length;
      } else {
        this.dataListGlobal = [];
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.listSection);
      this.toastr.error('Connection error');
    })
  }

  deleteRISDictionary() {
    this.spinner.show(this.spinnerRefs.listSection);
    this.spinner.show(this.spinnerRefs.formSection);
    const params = {
      RISDictionaryID: this.RISDictionaryID,
      CreatedBy: this.loggedInUser.userid || -99
    };
    this.risSharedService.insertUpdateData(API_ROUTES.DELETE_RIS_DICTIONARY, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      this.spinner.hide(this.spinnerRefs.formSection);
      if (res.StatusCode == 200) {
        this.toastr.success(res.Message);
        this.getRISDictionaryByUserID();
        this.clearForm();
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.listSection);
      this.toastr.error('Connection error');
    })
  }


  clearForm() {
    this.titleToShowOnCard = '';
    this.RISDictionaryID = null;
    this.ActionLabel = "Save";
    this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?'
    this.confirmationPopoverConfig.popoverMessage = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?', // 'Are you sure?',
      this.CardTitle = "Add Dictionary Word";
    // this.rowIndex = null;
    setTimeout(() => {
      this._form.reset();
    }, 100);
  }
  truncate(source, size) {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }
  makeHtml(param: any) {
    let html = param.TextDescription;
    if (param.isUnderline) {
      html = '<u>' + html + '</u>';
    }
    if (param.isItalic) {
      html = `<i style="color: ` + this.selectedColor + `!important">` + html + `</i>`;
    }
    if (param.isBold) {
      html = '<b>' + html + '</b>';
    }
    html = `<span style="font-size: 12px; font-family:Verdana,Geneva,sans-serif; color: ` + this.selectedColor + `">` + html + `</span>`;
    return html;
  }

  isAll = true;
  isMain = false;
  isMy = false;
  countAll = 0;
  countMain = 0;
  countMy = 0;
  dictionaryFilter(dictionayFilter) {
    this.rowIndex = null;
    this.clearForm();
    if (dictionayFilter == 1) {
      this.isAll = true;
      this.isMain = false;
      this.isMy = false;
    }
    else if (dictionayFilter == 2) {
      this.isAll = false;
      this.isMain = true;
      this.isMy = false;
    }

    else if (dictionayFilter == 3) {
      this.isAll = false;
      this.isMain = false;
      this.isMy = true;
    }
    else {
      this.isAll = true;
      this.isMain = false;
      this.isMy = false;
    }

    if (dictionayFilter == 1) {
      this.dataList = this.dataListGlobal;
    } else if (dictionayFilter == 2) {
      this.dataList = this.dataListGlobal.filter(a => a.CategoryID == 1)
    } else if (dictionayFilter == 3) {
      this.dataList = this.dataListGlobal.filter(a => a.CategoryID == 2)
    } else {
      this.dataList = this.dataListGlobal;
    }
  }

}
