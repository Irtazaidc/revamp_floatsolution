// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { IVisitDocs } from 'src/app/modules/auth/_models/documents.model';
import { UserModel } from 'src/app/modules/auth/_models/user.model';
import { DocsService } from 'src/app/modules/shared/components/visit-docs/services/docs.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';

@Component({
  standalone: false,

  selector: 'app-general-docs',
  templateUrl: './general-docs.component.html',
  styleUrls: ['./general-docs.component.scss']
})
export class GeneralDocsComponent implements OnInit {

  pageTitle = 'General Documents';
  heading = 'General';
  urlParams:any = {}; 
  // {
  //   refId: 22,
  //   docTypeId: 7
  // };
  loggedInUser: UserModel;
  alreadySavedDocs = [];
  docs = [];

  spinnerRefs = {
    getDocs: 'getDocs',
    saveDocs: 'saveDocs'
  }
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  docsThumbs = CONSTANTS.docsThumbs;
  uploadDocsPerm = {select: false, camera: false};
  screenPermissions = [];
  screenPermissionsObj: any = {};



  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private auth: AuthService,
    private docsService: DocsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef,
    private helper: HelperService
  ) { }

  ngOnInit(): void {

    this.getPermissions();
    this.loadLoggedInUserInfo();
    this.getUrlParams();
    // this.getDocumentsFromDb(this.urlParams);

  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getPermissions() {
    let _activatedroute = this.route.routeConfig.path;
    // this.screenPermissionsObj = this.storageService.getLoggedInUserProfilePermissionsObj(_activatedroute);
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    console.log(this.screenPermissionsObj);

    if(this.screenPermissionsObj && this.screenPermissionsObj.upload) {
      this.uploadDocsPerm = {select: true, camera: true};
    }
  }


  getUrlParams() {
    // btoa(decodeURIComponent('refId=22&docTypeId=7'))
    this.urlParams = this.helper.getUrlParams(); // || {refId: 0, docTypeId: 0};
    if(this.urlParams.refId && this.urlParams.docTypeId) {
      this.getDocumentsFromDb(this.urlParams); // allParams.refId, allParams.docTypeId);
    } else {
      this.toastr.warning('Invalid paramters');
    }
    /*
    // this.updateUrlParams_navigateTo(_url, { p: btoa(JSON.stringify({ doc-ref-id: 1, doc-type-id: 2 })) });
    this.route.queryParams.subscribe(params => {
      if (params.p) {
        let allParams: any = decodeURIComponent(atob(params.p));
        allParams = JSON.parse(allParams);
        console.log(allParams);
        this.urlParams = allParams;
        if(this.urlParams.refId && this.urlParams.docTypeId) {
          this.getDocumentsFromDb(allParams); // allParams.refId, allParams.docTypeId);
        } else {
          this.toastr.warning('Invalid paramters');
        }
      }
      //  else {
      //   this.updateUrlParams_navigateTo('');
      // }
    });
    */
  }
  

  getDocumentsFromDb(params) {
    /*let _imgData = 'data:image/png;base64,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';
    let _obj:IVisitDocs = { // = new VisitDocs();
      docId: 1,
      visitId: null,
      uniqueIdentifier: +new Date(),
      fileName: 'Docs - 1',
      fileType: 'image/png',
      data: _imgData,
      thumbnail: _imgData,
      sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(_imgData),
      sanitizedThumbnail: this.sanitizer.bypassSecurityTrustResourceUrl(_imgData)
    };
    this.alreadySavedDocs.push(_obj);
    */
   this.alreadySavedDocs = [];
    this.spinner.show(this.spinnerRefs.getDocs);
    this.docsService.getGeneralDocumentsByRefIdDocTypeId(params).subscribe( (res:any) => {
      this.spinner.hide(this.spinnerRefs.getDocs);
      if(res && res.StatusCode == 200) {
        // this.toastr.success('Documents loaded successfully');
        let fetchedDocs = res.PayLoad || [];
        let docArr = [];
        fetchedDocs.forEach(a=> {
          let docImg = a.GDocBase64 || a.Doc || '';
          if(docImg && docImg.indexOf('data:') == -1) { // check if image prefix is already appended
            docImg = 'data:' + (a.GDocType || 'image/png') + ';base64,' + docImg;
          }  
          let thumb = this.getThumbByFileType(a.GDocType); // (this.docsThumbs.find(b => b.type == a.GDocType) || {img: ''}).img;
          a.GDocType = thumb ? 'image/png' : (a.GDocType || 'image/png');
          a.GDocBase64Thumbnail = thumb || a.GDocBase64Thumbnail || docImg;
          let _obj:IVisitDocs = { // = new VisitDocs();
            docId: a.DocId,
            // visitId: null,
            uniqueIdentifier: +new Date(),
            fileName: a.Title,
            Remarks:a.Remarks,
            fileType: a.GDocType || 'image/png',
            data: docImg,
            thumbnail: a.GDocBase64Thumbnail || docImg,
            sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(docImg),
            sanitizedThumbnail: this.sanitizer.bypassSecurityTrustResourceUrl(a.GDocBase64Thumbnail || docImg)
          };
          docArr.push(_obj);
        })
        this.alreadySavedDocs = docArr;
        this.cd.detectChanges();
      } else {
        this.toastr.error('error loading documents.');
      }
      console.log(res);
    }, err => {
      this.toastr.error('Error loading documents');
      this.spinner.hide(this.spinnerRefs.getDocs);
    })
  }
  getThumbByFileType(fileType){
    fileType = fileType || 'file';
    let img = '';
    img = (this.docsThumbs.find(b => b.name == 'file') || {img: ''}).img
    switch(fileType.split('/')[0]){
      case 'image': {
        switch(fileType.split('/')[1]){
          case 'svg+xml': {
            img = (this.docsThumbs.find(b => b.name == 'svg') || {img: ''}).img;
            break;
          }
          default: {
            img = (this.docsThumbs.find(b => b.name == 'img') || {img: ''}).img;
            break;
          }
        }
        break;
      }
      default: {
        switch(fileType.split('/')[1]){
          case 'pdf': {
            img = (this.docsThumbs.find(b => b.name == 'pdf') || {img: ''}).img;
            break;
          }
          case 'plain': {
            img = (this.docsThumbs.find(b => b.name == 'txt') || {img: ''}).img;
            break;
          }
          case 'x-zip-compressed': {
            img = (this.docsThumbs.find(b => b.name == 'zip') || {img: ''}).img;
            break;
          }
          default: {
            break;
          }
        }
      }
    }
    return img;
  }

  saveDocs() {
    let docsToSave = this.formatUploadedDocsData().filter(a => !a.docId) || [];
    console.log(this.formatUploadedDocsData())
    console.log("docs to save ",docsToSave)
    if(!docsToSave.length) {
      this.toastr.warning('No documents to save');
      return;
    }
    if(!this.urlParams.refId || !this.urlParams.docTypeId) {
      this.toastr.warning('DocType and RefId not provided');
      return;
    }
    let params = {
      UserId: this.loggedInUser.userid,
      Docs: docsToSave
    }
    this.spinner.show(this.spinnerRefs.saveDocs);
    this.docsService.saveGeneralDocumentsByRefIdTypeId(params).subscribe( (res:any) => {
      this.spinner.hide(this.spinnerRefs.saveDocs);
      if(res && res.StatusCode == 200) {
        this.toastr.success('Documents saved successfully');
        this.getDocumentsFromDb(this.urlParams);
      } else {
        this.toastr.error('error saving documents.');
      }
      console.log(res);
    }, err => {
      this.toastr.error('Error saving documents');
      this.spinner.hide(this.spinnerRefs.saveDocs);
    });
  }

  formatUploadedDocsData() {
    let docs = [];
    this.docs.filter(a => !a.docId).forEach(a => {
      let d = {
        DocId: null,
        Title: a.fileName,
        Remarks: a.Remarks,
        Doc: null, // byte[] // it will be converted to byte[] in API for backward support
        CreatedBy: this.loggedInUser.userid,
        //DateTime CreatedOn
        RefId: this.urlParams.refId,
        //int? IsDeleted
        DocTypeId: this.urlParams.docTypeId,
        GDocBase64: a.data,
        GDocBase64Thumbnail: '', // a.thumbnail,
        GDocFileType: a.fileType,
        DirPath: `GDocs/${this.urlParams.docTypeId}/${this.urlParams.refId}/${a.fileName}`
      };
      docs.push(d);
    })

    return docs;
  }

  getLoadedVisitDocs(e) {
    // console.log('doccccccccccccccccccccs ', e);
    // this.visitAttachments = [...this.visitAttachments, ...e];
    this.docs = e;
    /*
    e will contain this
    [
      {
        "docId":null,
        "uniqueIdentifier":1654797495198,
        "fileName":"Generate_Certificate_1648826113428.jpg",
        "fileType":"image/jpeg",
        "data":"data:image",
        "sanitizedData":"data:image",
        "sanitizedThumbnail":"data:image",
        "thumbnail":"data:image",
        "visitId":null
      }
    ]
    */
  }

}
