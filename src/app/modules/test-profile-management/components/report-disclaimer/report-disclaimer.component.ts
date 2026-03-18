// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit, SecurityContext, SimpleChanges } from '@angular/core';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  standalone: false,

  selector: 'app-report-disclaimer',
  templateUrl: './report-disclaimer.component.html',
  styleUrls: ['./report-disclaimer.component.scss']
})
export class ReportDisclaimerComponent implements OnInit {
  ///////////////// begin:: Variables and Properties///////////////////////
  countAll = 0;
  countLab = 0;
  countRadiology = 0;
  rowIndex = null;
  searchText = "";
  isAll = 0;
  isLab = 0;
  isRadio = 0;
  AssociationCardTitle = "Associate Tests";

  spinnerRefs = {
    disclaimerListSection: 'disclaimerListSection',
    sectionListSection: 'sectionListSection',
    testListSection: 'testListSection',
    addUpdateSection: 'addUpdateSection',
    testAssociationSection: 'testAssociationSection'

  }
  ActionLabel = "Save";
  CardTitle = "Add Disclaimer";
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
  confirmationPopoverConfigDeative = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to deactive ?',
    popoverMessage: 'This disclaimer will also be <b>Deleted</b> associated with all tests!',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  config = {
    toolbar: [
      ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
      ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
      ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
      ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
      ['Link', 'Unlink', 'Anchor'],
      ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
      ['Styles', 'Format', 'Font', 'FontSize'],
      ['TextColor', 'BGColor'], // Add 'TextColor' button
      ['Maximize', 'ShowBlocks'],
    ],
    uiColor: '#ffffff',
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
    extraPlugins: 'divarea,smiley,justify,indentblock,colorbutton,colordialog',
    // colorButton_foreStyle: {
    //   element: 'font',
    //   attributes: { 'color': '#(color)' }
    // },
    colorButton_foreStyle: {
      element: 'span', // Change to 'span' for text color
      attributes: { 'style': 'color: #(color)' } // Set the style attribute for text color
    },
    line_height: {
      options: [
        // Define the available line height options
        { model: '1.0', title: 'Single', class: 'ck-line-height-1' },
        { model: '1.15', title: '1.15', class: 'ck-line-height-1-15' },
        { model: '1.5', title: '1.5', class: 'ck-line-height-1-5' },
        { model: '2.0', title: 'Double', class: 'ck-line-height-2' }
        // Add more options as needed
      ],
      extraPlugins: 'divarea,smiley,justify,indentblock,colordialog,font,colorbutton',
    },
    height: 400,
    removeDialogTabs: 'image:advanced;link:advanced',
    // removeButtons: 'Subscript,Superscript,Anchor,Source,Table',
    removeButtons: '',
    format_tags: 'p;h1;h2;h3;pre;div'
  }

  // begin:: Form and List Variables 
  dataList = [];
  disclaimerRow = [];
  subSectionList = [];
  testProfileList = [];
  disclaimerList = [];
  TPDisclaimerList = [];
  isSpinner = true;
  isSpinnerDeative = true;
  disabledButton = false;
  disabledButtonDeative = false;
  isSpinnerAssociation = true;
  disabledButtonAssociation = false;
  DDisclaimerID = null;
  TPDisclaimerID = null;
  DisclaimerTitle = ""
  DisclaimerHeader = ""
  DisclaimerFooter = ""
  DisclaimerBody = ""
  DisclaimerBodyHTML: string = '<p></p>';
  actionButtonClicked = false;
  loggedInUser: UserModel;
  // end:: Form and list Variabls 

  ///////////////// end:: Variables and Properties///////////////////////

  constructor(
    private sharedService: SharedService,
    private toastr: ToastrService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getSubSection();
    // this.getTPDisclaimer();
    this.getDDisclaimer(this.DDisclaimerID, null);
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  searchTextSection = "";
  searchTextTest = "";
  getSubSection() {
    this.subSectionList = [];
    let objParam = {
      SectionID: -1,
      LabDeptID: -1
    }
    this.spinner.show(this.spinnerRefs.sectionListSection);
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_SUBSECTION_SECTIONID, objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.sectionListSection);
      let _response = resp.PayLoad;
      // this.subSectionList = [];
      if (this.existingSectionIDs.length) {
        let data = _response;
        data.forEach(subsection => {
          subsection.checked = this.existingSectionIDs.includes(subsection.SubSectionId);
        });

        data.sort((a, b) => {
          if (a.checked && !b.checked) {
            return -1; // `a` (checked) comes before `b` (unchecked)
          } else if (!a.checked && b.checked) {
            return 1; // `b` (checked) comes before `a` (unchecked)
          } else {
            return 0; // No change in order if both checked or both unchecked
          }
        });
        this.subSectionList = data;
        this.existingSectionIDs = [];
      } else {
        this.subSectionList = _response;
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.sectionListSection);
      this.toastr.error('Connection error');

    })
  }
  getTestProfileBySectionIDs() {
    let checkedItems = this.subSectionList.filter(a => a.checked);
    this.testProfileList = [];
    let objParam = {
      SubSectionIDs: checkedItems.length ? checkedItems.map(obj => obj.SubSectionId).join(",") : -1,
      LabDeptID: -1
    }
    this.spinner.show(this.spinnerRefs.testListSection);
    this.sharedService.getData(API_ROUTES.GET_TEST_PROFILE_BY_SECTIONIDS, objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.testListSection);
      let _response = resp.PayLoad;
      this.testProfileList = _response;
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.testListSection);
      this.toastr.error('Connection error');
    })
  }

  getDDisclaimer(DDisclaimerID, i) {
    this.hideSections = true;
    this.AssociationCardTitle = "Associate Tests";
    this.rowIndex = i;
    let objParam = {
      DDisclaimerID: DDisclaimerID
    }
    if (objParam.DDisclaimerID) {
      this.spinner.show(this.spinnerRefs.addUpdateSection);
    } else {
      this.spinner.show(this.spinnerRefs.disclaimerListSection);
    }
    this.sharedService.getData(API_ROUTES.GET_D_DISCLAIMER, objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.addUpdateSection);
      this.spinner.hide(this.spinnerRefs.disclaimerListSection);
      let _response = resp.PayLoad;
      if (objParam.DDisclaimerID) {
        this.disclaimerRow = [];
        this.disclaimerRow = _response || [];
        this.DDisclaimerID = this.disclaimerRow[0].DDisclaimerID;
        this.DisclaimerTitle = this.disclaimerRow[0].DisclaimerTitle;
        this.DisclaimerBody = this.disclaimerRow[0].DisclaimerBody;
        this.DisclaimerBodyHTML = this.disclaimerRow[0].DisclaimerBodyHTML;
        this.AssociationCardTitle = this.disclaimerRow[0].DisclaimerTitle;
        this.getTPByDDisclaimerID();
      } else {
        this.DDisclaimerID = null;
        this.rowIndex = null;
        this.disclaimerList = [];
        this.disclaimerList = _response || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.disclaimerListSection);
      this.toastr.error('Connection error');
    })
  }


  selectAllTestsSection(checked) {
    this.spinner.show(this.spinnerRefs.testListSection);
    this.subSectionList.forEach(sec => {
      sec.checked = checked;
    });
    setTimeout(() => {
      this.spinner.hide(this.spinnerRefs.testListSection);
      this.getTestProfileBySectionIDs();
    }, 500);
  }
  selectAllTests(checked) {
    this.testProfileList.forEach(test => {
      test.checked = checked;
    });
  }


  insertDDisclaimer() {
    this.actionButtonClicked = true;
    if (!this.DisclaimerTitle || this.DisclaimerTitle == '') {
      this.toastr.error("Please enter disclaimer title", "Validation Error!");
      return
    }
    if (!this.DisclaimerBodyHTML || this.DisclaimerBodyHTML == '') {
      this.toastr.error("Please enter disclaimer text", "Validation Error!");
      return
    }

    let objParam = {
      DDisclaimerID: this.DDisclaimerID,
      DisclaimerTitle: this.DisclaimerTitle,
      DisclaimerHeader: "",
      DisclaimerFooter: "",
      DisclaimerBody: this.getPlainFromHTML(this.DisclaimerBodyHTML).replace('\n\n', ' '),
      DisclaimerBodyHTML: this.DisclaimerBodyHTML,
      CreatedBy: this.loggedInUser.userid || -99
    }
    this.disabledButton = true;
    this.isSpinner = false;
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_DDISCLAIMER, objParam).subscribe((resp: any) => {
      this.disabledButton = false;
      this.isSpinner = true;
      if (JSON.parse(resp.PayLoadStr).length) {
        if (resp.StatusCode == 200) {
          const data = JSON.parse(resp.PayLoadStr) || [];
        if (data[0].Result == 1) {
          this.toastr.success(resp.Message);
        }else{
          this.toastr.error(resp.Message);
        }
          this.clearForm();
          this.getDDisclaimer(null, null);
          this.isSpinner = true;
          this.actionButtonClicked = false;
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          this.disabledButton = false;
          this.isSpinner = true;
          this.disabledButton = false;
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



  getTPByTPDisclaimerID(TPDisclaimerID, i) {
    this.TPDisclaimerID = TPDisclaimerID;
    this.rowIndex = i;
    let objParam = {
      TPDisclaimerID: TPDisclaimerID
    }
    this.spinner.show(this.spinnerRefs.addUpdateSection);
    this.sharedService.getData(API_ROUTES.GET_TP_DISCLAIMER_BY_TPDISCLAIMER_ID, objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.addUpdateSection);
      let _response = resp.PayLoad;
      this.DisclaimerBodyHTML = _response.length ? _response[0].DisclaimerBodyHTML : '<p></p>';
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.addUpdateSection);
      this.toastr.error('Connection error');
    })
  }

  clearForm() {
    this.DDisclaimerID = null;
    this.DisclaimerTitle = null;
    this.DisclaimerBody = null;
    this.DisclaimerBodyHTML = '<p></p>';
    this.AssociationCardTitle = 'Associate Tests';
    this.rowIndex = null;
    this.existingSectionIDs = [];
    this.existingTPIDs = [];
    this.hideSections = false;
    this.selectedIndex = 0;
  }
  truncate(source, size) {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }
  tabSelected(p) {
    if (p.index == 0) {
      this.clearForm();
      this.getDDisclaimer(null, null);
      this.existingSectionIDs = [];
      this.existingTPIDs = [];
      // this.DDisclaimerID = null;
      this.rowIndex = null;
    }// else {
    //   if (this.DDisclaimerID) {
    //     this.getTPByDDisclaimerID();
    //   }
    // }
  }
  selectedIndex = 0;
  getDataForTestAssociation() {
    this.selectedIndex = 1;
    this.hideSections = true;
    setTimeout(() => {
      // this.getTPDisclaimer();
      this.getTPByDDisclaimerID()
    }, 300);

  }

  //////////////////////////////// begin::TP Association /////////////////////////////////////////////
  insertTPDisclaimer() {
    let checkedItems = this.testProfileList.filter(a => a.checked);
    if (!checkedItems.length) {
      this.toastr.error("Please select any test to save disclaimer", "Validation Error!");
      return
    }

    let objParam = {
      DDisclaimerID: this.DDisclaimerID,
      CreatedBy: this.loggedInUser.userid || -99,
      tblTPDisclaimer: checkedItems.map(a => {
        return {
          TPDisclaimerID: a.TPDisclaimerID ? a.TPDisclaimerID : null,
          TPID: a.TPID,
          SubSectionID: a.SubSectionId,
          DisclaimerTitle: this.DisclaimerTitle,
          DisclaimerHeader: "",
          DisclaimerFooter: "",
          DisclaimerBody: this.getPlainFromHTML(this.DisclaimerBodyHTML).replace('\n\n', ' '),
          DisclaimerBodyHTML: this.DisclaimerBodyHTML,
          CreatedBy: this.loggedInUser.userid || -99,
        }
      })
    }
    this.disabledButtonAssociation = true;
    this.isSpinnerAssociation = false;
    this.spinner.show(this.spinnerRefs.testAssociationSection);
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_TP_DISCLAIMER, objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.testAssociationSection);
      this.disabledButtonAssociation = false;
      this.isSpinnerAssociation = true;
      if (JSON.parse(resp.PayLoadStr).length) {
        if (resp.StatusCode == 200) {
          this.toastr.success(resp.Message);
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          this.disabledButtonAssociation = false;
          this.isSpinnerAssociation = true;
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.disabledButtonAssociation = false;
      this.isSpinnerAssociation = true;
      this.spinner.hide(this.spinnerRefs.testAssociationSection);
    })

  }

  existingSectionIDs = []
  existingTPIDs = []
  hideSections = true;
  // getTPDisclaimer() {
  //   this.TPDisclaimerList = [];
  //   let objParam = {
  //     DDisclaimerID: this.DDisclaimerID
  //   }
  //   this.spinner.show(this.spinnerRefs.testAssociationSection);
  //   this.sharedService.getData(API_ROUTES.GET_TP_DISCLAIMER, objParam).subscribe((resp: any) => {
  //     this.spinner.hide(this.spinnerRefs.testAssociationSection);
  //     let _response = resp.PayLoad;
  //     this.TPDisclaimerList = _response;
  //     this.testProfileList = this.TPDisclaimerList;
  //     this.subSectionList = this.getUniqueRowsBySubSectionID(this.TPDisclaimerList);
  //     if (this.TPDisclaimerList.length) {
  //       let sectionData = this.TPDisclaimerList;
  //       this.existingSectionIDs = [...new Set(sectionData.map(item => item.SubSectionID))];
  //       this.existingTPIDs = [...new Set(sectionData.map(item => item.TPID))];
  //     } else {
  //       this.existingSectionIDs = [];
  //       this.existingTPIDs = [];
  //     }
  //     // this.getSubSection();
  //   }, (err) => {
  //     this.spinner.hide(this.spinnerRefs.testAssociationSection);
  //     this.toastr.error('Connection error');
  //   })
  // }
  getTPByDDisclaimerID() {
    this.TPDisclaimerList = [];
    let objParam = {
      DDisclaimerID: this.DDisclaimerID
    }
    this.spinner.show(this.spinnerRefs.testAssociationSection);
    this.sharedService.getData(API_ROUTES.GET_TP_BY_DDISCLAIMER, objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.testAssociationSection);
      let _response = resp.PayLoad;
      this.TPDisclaimerList = _response;
      this.testProfileList = this.TPDisclaimerList;
      this.subSectionList = this.getUniqueRowsBySubSectionID(this.TPDisclaimerList);
      if (this.TPDisclaimerList.length) {
        let sectionData = this.TPDisclaimerList;
        this.existingSectionIDs = [...new Set(sectionData.map(item => item.SubSectionID))];
        this.existingTPIDs = [...new Set(sectionData.map(item => item.TPID))];
      } else {
        this.existingSectionIDs = [];
        this.existingTPIDs = [];
      }
      // this.getSubSection();
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.testAssociationSection);
      this.toastr.error('Connection error');
    })
  }
  getUniqueRowsBySubSectionID(data) {
    const uniqueRows = [];
    const seenIDs = new Set();
    for (const item of data) {
      if (!seenIDs.has(item.SubSectionID)) {
        uniqueRows.push(item);
        seenIDs.add(item.SubSectionID);
      }
    }
    return uniqueRows;
  }
  // ngOnChanges(changes: SimpleChanges) {
  //   this.cd.detectChanges();
  // }

  // ngAfterViewInit() {
  //   this.cd.detectChanges();
  //  }
  enableDisableAction(param) {
    if (param == 1) {
      this.hideSections = false;
      this.getSubSection();
      this.getTestProfileBySectionIDsWithExisintTPs();
    } else {
      this.hideSections = true;
      this.getDataForTestAssociation();
    }

  }
  getTestProfileBySectionIDsWithExisintTPs() {
    let SubSectionIDs = this.existingSectionIDs.join(',');
    if (this.existingSectionIDs.length) {
      this.testProfileList = [];
      let objParam = {
        SubSectionIDs: SubSectionIDs,
        LabDeptID: -1
      }
      this.spinner.show(this.spinnerRefs.testListSection);
      this.sharedService.getData(API_ROUTES.GET_TEST_PROFILE_BY_SECTIONIDS, objParam).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.testListSection);
        let _response = resp.PayLoad;
        if (this.existingTPIDs.length) {
          let data = _response;
          data.forEach(tps => {
            tps.checked = this.existingTPIDs.includes(tps.TPID);
          });

          data.sort((a, b) => {
            if (a.checked && !b.checked) {
              return -1; // `a` (checked) comes before `b` (unchecked)
            } else if (!a.checked && b.checked) {
              return 1; // `b` (checked) comes before `a` (unchecked)
            } else {
              return 0; // No change in order if both checked or both unchecked
            }
          });
          this.testProfileList = data;
          this.existingTPIDs = [];
        } else {
          this.testProfileList = _response;
        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.testListSection);
        this.toastr.error('Connection error');
      })
    }
  }
  //////////////////////////////// end::TP Association //////////////////////////////////////////////
  disclaimerFilter(p) { }


  ///////////////begin:: deactive disclaimer////////////////////////////////////
  deActiveDisclaimer() {
    let objParam = {
      DDisclaimerID: this.DDisclaimerID,
      CreatedBy: this.loggedInUser.userid || -99
    }
    this.disabledButtonDeative = true;
    this.isSpinnerDeative = false;
    this.sharedService.insertUpdateData(API_ROUTES.DELETE_DDISCLAIMER, objParam).subscribe((resp: any) => {
      this.disabledButtonDeative = false;
      this.isSpinnerDeative = true;
      if (JSON.parse(resp.PayLoadStr).length) {
        if (resp.StatusCode == 200) {
          this.toastr.success(resp.Message);
          this.clearForm();
          this.getDDisclaimer(null, null);
          this.isSpinnerDeative = true;
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          this.disabledButtonDeative = false;
      this.isSpinnerDeative = true;
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.disabledButtonDeative = false;
      this.isSpinnerDeative = true;
    })

  }
  ///////////////end:: deactive disclaimer/////////////////////////////////////
}
