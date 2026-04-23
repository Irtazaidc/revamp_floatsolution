// @ts-nocheck
import { Component, Pipe, PipeTransform, Input, OnChanges, OnInit, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { API_ROUTES } from '../../../../shared/helpers/api-routes';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { TestProfileConfigurationService } from 'src/app/modules/test-profile-management/Services/test-profile-configurations-services';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  standalone: false,

  selector: 'app-report-templates',
  templateUrl: './report-templates.component.html',
  styleUrls: ['./report-templates.component.scss']
})
export class ReportTemplatesComponent implements OnInit {

  /*
  ckEditorConfig: any = {
    toolbar: [
      ['Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
      ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
      ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
      ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
      ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
      ['Link', 'Unlink', 'Anchor'],
      ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
      ['Styles', 'Format', 'Font', 'FontSize'],
      ['TextColor', 'BGColor'],
      ['Maximize', 'ShowBlocks']
    ]
  };
  */

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
      ['Maximize', 'ShowBlocks']
    ],
    /*
    uiColor: '#ffffff',
    toolbarGroups: [
      { name: 'clipboard', groups: ['clipboard', 'undo'] },
      { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
      { name: 'links' }, { name: 'insert' },
      { name: 'document', groups: ['mode', 'document', 'doctools'] },
      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
      { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
      { name: 'styles' },
      { name: 'colors' }
    ],
    resize_enabled: false,
    removePlugins: 'elementspath,save,magicline',
    extraPlugins: 'divarea,smiley,justify,indentblock,colordialog,font,lineheight',
    //extraPlugins: 'dialogui,dialog,about,a11yhelp,basicstyles,blockquote,notification,button,toolbar,clipboard,panel,floatpanel,menu,contextmenu,resize,elementspath,enterkey,entities,popup,filetools,filebrowser,floatingspace,listblock,richcombo,format,horizontalrule,htmlwriter,wysiwygarea,image,indent,indentlist,fakeobjects,link,list,magicline,maximize,pastetext,xml,ajax,pastetools,pastefromgdocs,pastefromlibreoffice,pastefromword,removeformat,showborders,sourcearea,specialchar,menubutton,scayt,stylescombo,tab,table,tabletools,tableselection,undo,lineutils,widgetselection,widget,notificationaggregator,uploadwidget,uploadimage,divarea,smiley,hkemoji,justify,indentblock,colordialog,lineheight',
    colorButton_foreStyle: {
      element: 'font',
      attributes: { 'color': '#(color)' }
    },
    height: 400,
    removeDialogTabs: 'image:advanced;link:advanced',
    removeButtons: 'Anchor',
    format_tags: 'p;h1;h2;h3;pre;div'
    */
  };

  TemplateParameterHTML = '<p></p>';
  RISTemplateID: any = null;
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
  CardTitle = "Add Report Template";
  screenIdentity = null;
  CategoryID

  _form = this.fb.group({
    TemplateCode: ['', Validators.compose([Validators.required])],
    TemplateTitle: ['', Validators.compose([Validators.required])],
    Gender: ['B', Validators.compose([Validators.required])],
    TPID: [, Validators.compose([Validators.required])],
    // PId: ['', Validators.compose([Validators.required])],
    // CategoryID: ['1', Validators.compose([Validators.required])],
    // TemplateParameterHTML: ['', Validators.compose([Validators.required])],
    isDefault: [''],
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?', // 'Are you sure?',,
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
  MachineTestID: any = null;
  ExistingSelectedTests: any = [];
  branchesList = [];
  testsList = [];
  templateList: any = [];
  TPIds = null;
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private auth: AuthService,
    private testProfileService: TestProfileService,
    private TPService: TestProfileConfigurationService,
    private sanitizer: DomSanitizer,
    private sharedService: SharedService,
    private route: ActivatedRoute,
  ) { }
  public getPlainText(htmlContent: string): string {
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    const plainText = element.textContent || element.innerText || '';
    // Clean up any additional whitespace
    return plainText.trim();
  }
  public getPlainFromHTML(paramHtml): string {
    const sanitizedHtmlContent = this.sanitizer.sanitize(SecurityContext.HTML, paramHtml);
    return this.getPlainText(sanitizedHtmlContent);
  }

  ngOnInit(): void {
    this.screenIdentity = this.route.routeConfig.path;
    if (this.screenIdentity === 'report-templates')
      this.CategoryID = 1;
    else
      this.CategoryID = 2;
    this.loadLoggedInUserInfo();
    this.getRadiologyTests();
    this.getRISTemplate();
    setTimeout(() => {
      this._form.patchValue({
        Gender: "B"
      })
    }, 500);

  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getSingleRow(RISTemplateID) {
    this.RISTemplateID = RISTemplateID;
    this.TPID = -99;
    this.getRISTemplate();
  }

  RISTemplateParameterID = null;
  insertUpdateRISTemplate() {
    const formValues = this._form.getRawValue();
    console.log("formValues are: ", formValues); //return;
    this._form.markAllAsTouched();
    if (this._form.invalid) {
      this.spinner.hide(this.spinnerRefs.formSection);
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      this.disabledButton = true;
      this.isSpinner = false;
      const formData = {
        RISTemplateID: this.RISTemplateID,
        TemplateCode: formValues.TemplateCode,
        TemplateTitle: formValues.TemplateTitle,
        // RISTemplateParameterID: this.RISTemplateParameterID,
        // TemplateParameterHeading: null,
        // TemplateParameterHTML: formValues.TemplateParameterHTML,
        // TemplateParameterRTF: null,
        // TemplateParameterText: this.getPlainFromHTML().replace('\n\n', ' '),
        // PID: formValues.PId,
        TPID: formValues.TPID,
        CategoryID: this.CategoryID || 2, //1:For Main Parent Template , 2:For User Template
        Gender: formValues.Gender,
        isDefault: formValues.isDefault,
        CreatedBy: this.loggedInUser.userid || -99,
        tblRISTemplateParams: this.TPParams.map((a) => {
          return {
            RISTemplateParameterID: a.RISTemplateParameterID,
            RISTemplateID: this.RISTemplateID,
            TemplateParameterHeading: null,
            TemplateParameterHTML: a.TemplateParameterHTML,
            TemplateParameterRTF: null,
            TemplateParameterText: this.getPlainFromHTML(a.TemplateParameterHTML).replace('\n\n', ' '),
            PID: a.PId
          }
        }),
      };

      console.log('formData param is: ', formData);//return;
      this.spinner.show(this.spinnerRefs.formSection);
      this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RIS_TEMPLATE, formData).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.spinner.hide(this.spinnerRefs.formSection);
            this.toastr.success(data.Message);
            this.clearForm();
            this.getRISTemplate();
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
  }

  getRISTemplate() {
    this.existingRow = [];
    if (this.RISTemplateID) {
      this.ActionLabel = "Update"
      this.CardTitle = "Update Template";
      this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?';
      this.spinner.show(this.spinnerRefs.formSection);
    } else {
      this.ActionLabel = "Save"
      this.CardTitle = "Add Template";
      this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?';
      this.spinner.show(this.spinnerRefs.listSection);
    }

    const params = {
      RISTemplateID: this.RISTemplateID,
      TPID: null,
      UserID: this.loggedInUser.userid
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_TEMPLATE, params).subscribe((res: any) => {
      (this.RISTemplateID) ? this.spinner.hide(this.spinnerRefs.formSection) : this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        if (params.RISTemplateID) {
          this.existingRow = res.PayLoad[0];
          // this.existingRowDetail = res.PayLoadDS['Table1'][0];
          this.RISTemplateParameterID = this.existingRow["RISTemplateParameterID"];
          // console.log("existeingRow is", this.existingRow)
          // console.log("res is", res)
          this.spinner.hide(this.spinnerRefs.listSection);
          this.getRISTemplateDetail({ TPId: this.existingRow["TPID"] });

          setTimeout(() => {
            this._form.patchValue({
              TemplateCode: this.existingRow["TemplateCode"],
              TemplateTitle: this.existingRow["TemplateTitle"],
              Gender: this.existingRow["Gender"],
              PId: this.existingRow["PID"],
              TPID: this.existingRow["TPID"],
              TemplateParameterHTML: this.existingRow["TemplateParameterHTML"],
              isDefault: this.existingRow["isDefault"]
            });
            this.CategoryID = this.existingRow["CategoryID"];
          }, 200);

        } else {
          this.clearForm();
          this.templateList = res.PayLoad || [];
          console.log("this.templateList : ", this.templateList)
          this.filterResults();
          if (!this.templateList.length) {
            this.toastr.info('No record found.');
          }
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      (this.RISTemplateID) ? this.spinner.hide(this.spinnerRefs.formSection) : this.spinner.hide(this.spinnerRefs.listSection);
    })
    this.spinner.hide();
  }

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }
  refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  }

  filterResults() {
    this.pagination.page = 1;
    const cols = ['TemplateCode'];
    let results: any = this.templateList;
    if (this.searchText && this.searchText.length > 1) {
      const pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.templateList, this.searchText, cols, this.templateList);
    }
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }
  clearForm() {
    this.TPID = null;
    this.RISTemplateID = null;
    this.RISTemplateParameterID = null;
    this.ActionLabel = "Save";
    this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?'
    this.CardTitle = "Add Template";
    this.TPParams = [];
    setTimeout(() => {
      this._form.reset();
      this._form.patchValue({
        Gender: "B"
      })
    }, 100);
  }

  getRadiologyTests() {
    const params = {
      SectionID: 7
    };
    this.testsList = []
    this.testProfileService.getTestSectionBySectionID(params).subscribe((resp: any) => {
      this.testsList = resp.PayLoad.map(i => ({
        TPId: i.TPId,
        TestProfileCode: i.TestProfileCode,
        TestProfileName: i.TestProfileName,
        SubSectionTitle: i.SubSectionTitle,
        TPFullName: i.TestProfileCode + '-' + i.TestProfileName + '(' + i.SubSectionTitle + ')'

      }));
      if (!this.testsList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  rdSearchBy = 'byCode'
  chkSearchByExactMatch = false;
  rdSearchByClick(a) {
    this.rdSearchBy = a;
  }

  customSearchFn = (term: string, item: any) => {
    console.log("chkSearchByExactMatch: ", this.chkSearchByExactMatch)
    term = term.toLowerCase();
    if (this.rdSearchBy == 'byCode') {
      if (this.chkSearchByExactMatch) {
        return item.TestProfileCode.toLowerCase() == term;
      } else {
        return item.TestProfileCode.toLowerCase().indexOf(term) == 0;
      }
    }
    else if (this.rdSearchBy == 'byName') {
      return item.TestProfileName.toLowerCase().indexOf(term) > -1;
    }
  }

  changeMaching(checked: boolean) {
    if (checked) {
      this.chkSearchByExactMatch = true;
    } else {
      this.chkSearchByExactMatch = false;
    }
  }
  TPParams = [];
  TPName = null;
  TPCode = null;
  isShowReportMain = true;
  TPID = null
  testListChanged(e) {
    if (e) {
      const TPId = e.TPId;
      this.TPID = TPId;
      this.TPName = e.TPName;
      this.TPCode = e.TPName;
      let response = [];
      const ObjParams = {
        pTPID: TPId,
      }
      this.TPService.GetTestProfileParamsByTPID(ObjParams).subscribe((resp: any) => {
        response = JSON.parse(resp.PayLoadStr);
        const res = response['Table'];
        if (res.length) {
          this.isShowReportMain = true;
          this.TPParams = res.map((a) => ({ TemplateParameterHTML: '', ...a }))
        } else {
          this.isShowReportMain = false;
          this.TPParams = [];
        }
      }, (err) => {
        console.log(err);
      })
    } else {
      this.TPID = null;
      this.TPParams = [];
    }

  }
  getRISTemplateDetail(e) {
    const TPId = e.TPId;
    let response = [];
    const ObjParams = {
      RISTemplateID: this.RISTemplateID,
      PID: null,
    }
    this.sharedService.getData(API_ROUTES.GET_RIS_TEMPLATE_DETAIL, ObjParams).subscribe((resp: any) => {
      response = JSON.parse(resp.PayLoadStr);
      // let res = response['Table'];
      this.TPParams = response;
      // console.log("TPParams2 are : ", this.TPParams)
      // console.log("TPParams res are : ",response)
      // this.TPParams = res.map((a) => ( {TemplateParameterHTML: '', ...a}))
    }, (err) => {
      console.log(err);
    })

  }

  deleteRecord() {
    // this.spinner.show(this.spinnerRefs.listSection);
    // this.spinner.show(this.spinnerRefs.formSection);
    // this.disabledButtonDelete = true;
    // this.isSpinnerDelete = false;
    const params = {
      TableName: "dbo.RISTemplate",
      PrimaryKey: "RISTemplateID",
      PrimaryKeyValue: this.RISTemplateID,
      ModifiedBy: this.loggedInUser.userid || -99
    };
    this.sharedService.deleteRecord(API_ROUTES.DELETE_RECORD_BY_TABLE_NAME, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      this.disabledButtonDelete = false;
      this.isSpinnerDelete = true;
      if (res.StatusCode == 200) {
        this.toastr.success("Template has been deleted successfully...", "Successfull Deletion");
        this.clearForm();
        this.getRISTemplate();
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.listSection);
      this.toastr.error('Connection error');
    })
  }

}
