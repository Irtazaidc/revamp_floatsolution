// @ts-nocheck
import { Attribute, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild, } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NgbModalOptions, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/modules/auth";
import { IVisitDocs } from "src/app/modules/auth/_models/documents.model";
import { UserModel } from "src/app/modules/auth/_models/user.model";
// import { User } from '../../../../models/user';
import { AppPopupService } from "../../../helpers/app-popup.service";
import { CONSTANTS } from "../../../helpers/constants";
import { HelperService } from "../../../helpers/helper.service";
import { MultiAppService } from "../../../services/multi-app.service";
// import { StorageService } from '../../../helpers/storage.service';
import { DocsService } from "../services/docs.service";
import { NonNullAssert } from "@angular/compiler";
import { ActivatedRoute } from "@angular/router";

// import  * as ImgPreviewer from '../image-viewer.js';
declare var $: any;
declare var window: any;
@Component({
  standalone: false,

  selector: "app-visit-docs",
  templateUrl: "./visit-docs.component.html",
  styleUrls: ["./visit-docs.component.scss"],
  // providers: [MultiAppService]
})
export class VisitDocsComponent implements OnInit {
  @ViewChild("documentPopup") documentPopup;
  documentPopupRef: NgbModalRef;
  defaultEditing = { save: false, select: true, camera: true, insert: false };
  @Input("propVisitNo") propVisitNo = "";
  @Input("isLoadByDefault") isLoadByDefault = true;
  @Input("layout") attachmentLayout = "grid2"; // compact | list | grid | grid2
  @Input("layoutButtons") layoutButtons = ["compact", "list", "grid", "grid2"]; // ['compact', 'list', 'grid', 'grid2']
  @Input("editing") editing = this.defaultEditing; // {save: true, select: true, camera: true, scan: true}
  @Input("inputDocs") inputDocs = [];
  @Input("allowRemove") allowRemove = false;
  @Input("forFilterComp") forFilterComp = 0;
  @Input("CMSrequestID") CMSrequestID = 0;
  @Input("sectionHead") sectionHead = "Visit";
  @Input("module") module = ""; // 'general-docs'
  @Input("refByDocID") refByDocID;
  @Output() outputDocs = new EventEmitter();
  @ViewChild("videoElement") videoElement: ElementRef;
  @ViewChild("canvas") public canvas: ElementRef;

  loggedInUser: UserModel;
  isShowRemarks: false;

  video: any;
  activeVideoCameraStream: any;
  openCameraFromSource = "";
  videoDimensions = {
    width: 300,
    height: 300,
  };
  cameraDevicesList = [{ id: "", name: "default" }];
  selectedCamera = "";

  capturedImage = "";

  enableRenameVisitAttachmentField = -1;
  defaultPatientPic = CONSTANTS.USER_IMAGE.MALE;

  resizeFileSize = {
    thumbnail: {
      width: 90,
      height: 90,
    },
    width: 500,
    height: 500,
  };

  spinnerRefs = {
    visitDocs: "visitDocs",
    selectedDoc: "selectedDoc",
  };
  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to proceed?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };

  visitAttachments = [];

  imgViewer;

  selectedImg: IVisitDocs;

  config = {
    btnClass: "default",
    zoomFactor: 0.1,
    containerBackgroundColor: "#fff",
    wheelZoom: true,
    // allowFullscreen: true,
    // allowKeyboardNavigation: true,
    btnIcons: {
      zoomIn: "fa fa-plus",
      zoomOut: "fa fa-minus",
      rotateClockwise: "ti-back-right",
      rotateCounterClockwise: "ti-back-left",
      print: "fa fa-print",
      // next: "fa fa-arrow-right",
      // prev: "fa fa-arrow-left",
      // fullscreen: "fa fa-arrows-alt"
    },
    btnShow: {
      zoomIn: true,
      zoomOut: true,
      rotateClockwise: true,
      rotateCounterClockwise: true,
      // next: true,
      // prev: true
    },
  };

  ngbModalOptions: NgbModalOptions = {
    backdrop: true, // 'static',
    keyboard: true,
  };

  multiAppConnectionStatus = false;

  private subscriptions: Subscription[] = [];

  renameFileExt = "";

  @ViewChild("fileNameField") fileNameField: ElementRef;

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private docsService: DocsService,
    // private storageService: StorageService,
    private auth: AuthService,
    private helper: HelperService,
    private appPopupService: AppPopupService,
    private multiApp: MultiAppService,
    private cd: ChangeDetectorRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,

  ) { }
  isLoadClick = false;
  ngOnInit(): void {
    // console.log("refByDocIDrefByDocIDrefByDocID", this.refByDocID);
    this.isLoadClick = this.isLoadByDefault ? true : false;
    // console.log('ngOnInit propVisitNo  ', this.propVisitNo, this.attachmentLayout);
    // console.log('ImgPreviewer ', ImgPreviewer);
    this.reEvaluateEditingPermissions();
    this.loadLoggedInUserInfo();
    if (this.inputDocs && this.inputDocs.length) {
      this.setVisitDocsArray(this.inputDocs, false);
    } else if (this.propVisitNo && this.isLoadByDefault) {
      this.getVisitDocs();
    } else {
      this.setVisitDocsArray([], true);
    }
    this.connectToMultiApp();
    this.subscribeFirMultiAppStatus();
    this.subscribeForScannedDoc();
    if (this.module == "CMS" || this.module == "Sales") {
      // console.log("ngOnInit ~ 'CMS':", this.module);
      this.getCMSDocuments();
    }
  }

  ngAfterViewInit() {
    this.isLoadClick = this.isLoadByDefault ? true : false;
    // console.log('ngAfterViewInit propVisitNo  ', this.propVisitNo, this.attachmentLayout);
    this.reEvaluateEditingPermissions();
    if (this.inputDocs && this.inputDocs.length) {
      this.setVisitDocsArray(this.inputDocs, false);
    } else if (this.propVisitNo && this.isLoadByDefault) {
      this.getVisitDocs();
    } else {
      this.setVisitDocsArray([], true);
      
    }
    this.video = this.videoElement.nativeElement;
    this.initImageViewer();
  }

  ngOnChanges(e) {
    this.isLoadClick = this.isLoadByDefault ? true : false;
    // console.log('ngOnChanges propVisitNo  ', this.propVisitNo, this.attachmentLayout);
    this.reEvaluateEditingPermissions();
    if (!this.propVisitNo || this.isLoadByDefault == false){
      this.setVisitDocsArray([], true);
    }
    if (this.inputDocs && this.inputDocs.length) {
      this.setVisitDocsArray(this.inputDocs, false);
    } else if (this.propVisitNo && this.isLoadByDefault) {
      this.getVisitDocs();
    } else {
      if (this.refByDocID !== null && !this.inputDocs.length) {
      }
      else {
        this.setVisitDocsArray([], true);
        this.loadImage(null, "default");
      }
    }
    if (this.module == "CMS" || this.module == "Sales") {
      // console.log("ngOnChanges ~ 'CMS':", this.module);
      this.getCMSDocuments();
    }
  }

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;

    // console.log('this.loggedInUser', this.loggedInUser);
  }

  getVisitDocs() {
    this.isLoadClick = true;

    this.setVisitDocsArray([], true);
    let params = {
      visitId: this.propVisitNo,
      withDocs: true,
    };
    if (!params.visitId) {
      return;
    }
    this.spinner.show(this.spinnerRefs.visitDocs);
    this.docsService.getVisitDocuments(params).subscribe(
      (res: any) => {
        this.setVisitDocsArray([], true);
        this.spinner.hide(this.spinnerRefs.visitDocs);
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length) {
            let _data = this.helper.addPrefixToDocs(res.PayLoad);
            this.setVisitDocsArray(_data, true);
            // this.outputDocs.emit(this.visitAttachments);
            // this.visitAttachments = res.PayLoad;
            // console.log(this.visitAttachments);
          }
        }
      },
      (err) => {
        this.setVisitDocsArray([], true);
        this.spinner.hide(this.spinnerRefs.visitDocs);
        console.log(err);
        this.toastr.error("Error loading Documents");
      }
    );
  }
  resetZoom() {
  this.zoomFactor = 1;
}

  getDocById(docId, uniqueIdentifier, isdownload) {
    this.selectedImg = null;
    this.resetZoom();
    this.imageRotation = 0;
    let params = {
      DocId: docId,
      ForFilter: this.forFilterComp,
    };

    if (!params.DocId) {
      if (uniqueIdentifier) {
        this.documentPopupRef = this.appPopupService.openModal(
          this.documentPopup,
          this.ngbModalOptions
        );
        this.selectedImg = this.visitAttachments.find(
          (a) => a.uniqueIdentifier == uniqueIdentifier
        );
      }
      return;
    }
    if (isdownload === 0)
      this.documentPopupRef = this.appPopupService.openModal(
        this.documentPopup,
        this.ngbModalOptions
      );
    if (this.module == "general-docs") {
      let params2 = {
        docId: docId,
      };
      if (isdownload === 0) this.getGeneralDocById(params2);
      else this.DownloadGeneralDocById(params2);
    } else {
      this.getVisitDocById(params);
    }
  }
  deleteDocById(docId) {
    let params = {
      DocId: docId,
    };
    if (!params.DocId) {
      return;
    }
    if (this.module == "general-docs") {
      this.spinner.show(this.spinnerRefs.visitDocs);
      this.docsService.deleteGeneralDocumentByDocId(params).subscribe(
        (res: any) => {
          this.spinner.hide(this.spinnerRefs.visitDocs);
          if (res && res.StatusCode == 200) {
            this.toastr.success("File deleted successfully");
          } else {
            this.toastr.error("Error deleting File.");
          }
        },
        (err) => {
          this.spinner.hide(this.spinnerRefs.visitDocs);
          console.log(err);
          this.toastr.error("Error deleting File");
        }
      );
    }
  }

  getVisitDocById(params) {
    this.spinner.show(this.spinnerRefs.selectedDoc);
    this.docsService.getVisitDocumentById(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.selectedDoc);
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length) {
            let data = this.helper.addPrefixToDocs(res.PayLoad);

            // data[0].docId = data[0].DocId || '__';
            // data[0].uniqueIdentifier = (+new Date());
            // data[0].fileName = data[0].Title;
            // data[0].fileType = data[0].VisitDocType || 'image/png';
            // data[0].data = data[0].VisitDocBase64;
            // data[0].sanitizedData = this.sanitizer.bypassSecurityTrustResourceUrl(data[0].VisitDocBase64);
            // data[0].thumbnail = data[0].VisitDocBase64Thumbnail;
            // data[0].visitId = data[0].VisitId;

            this.selectedImg = data[0];
            console.log("this.selectedImg:", this.selectedImg);
            // this.visitAttachments = res.PayLoad;
            // console.log(this.visitAttachments);
          }
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.selectedDoc);
        console.log(err);
        this.toastr.error("Error loading Document");
      }
    );
  }
  getGeneralDocById(params) {
    this.spinner.show(this.spinnerRefs.selectedDoc);
    this.docsService.getGeneralDocumentsByDocId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.selectedDoc);
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length) {
            let data = this.helper.addPrefixToDocs(res.PayLoad);
            // console.log("docsService.getGeneralDocumentsByDocId ~ data:", data);
            this.selectedImg = data[0];
          }
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.selectedDoc);
        console.log(err);
        this.toastr.error("Error loading Document");
      }
    );
  }
  DownloadGeneralDocById(params) {
    // this.toastr.info("Preparing file to download...");
    this.spinner.show(this.spinnerRefs.selectedDoc);

    this.docsService.getGeneralDocumentsByDocId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.selectedDoc);

        if (res && res.StatusCode === 200 && res.PayLoad?.length) {
          const documentData = res.PayLoad[0]; // Get the first document
          const base64Data = documentData.VisitDocBase64; // Base64 content
          const fileName = documentData.Title || "download"; // File name fallback
          const mimeType = this.getMimeType(fileName); // Derive MIME type from file extension

          if (base64Data) {
            // Trigger the file download
            this.downloadBase64File(base64Data, fileName, mimeType);
            this.toastr.success("File downloaded successfully!");
          } else {
            console.error("File data is missing in the response payload:", documentData);
            this.toastr.error("File data is missing!");
          }
        } else {
          console.error("Invalid document response:", res);
          this.toastr.error("No valid document found to download.");
          if (res && res.StatusCode == 200) {
            if (res.PayLoad && res.PayLoad.length) {
              let data = this.helper.addPrefixToDocs(res.PayLoad);
              // console.log("docsService.getGeneralDocumentsByDocId ~ data:", data);
              this.selectedImg = data[0];

              let base64Data = "data:image/png;" + data[0].data;

              // this.downloadBase64Image(base64Data, "download.png");
            }
          }
        }
        (err) => {
          this.spinner.hide(this.spinnerRefs.selectedDoc);
          console.log(err);
          console.error("Error during document download:", err);
          this.toastr.error("Error loading Document");
        }
      }
    );
  }

  // Utility function for downloading Base64 files
  downloadBase64File(base64Data: string, fileName: string, mimeType: string) {
    const link = document.createElement("a");
    link.href = `data:${mimeType};base64,${base64Data}`;
    link.download = fileName;

    // Simulate the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Derive MIME type from file extension
  getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      pdf: "application/pdf",
      txt: "text/plain",
      zip: "application/zip",
      default: "application/octet-stream",
    };

    return mimeTypes[extension] || mimeTypes.default;
  }

  // downloadBase64File(base64, filename) {
  //   // debugger
  //   // Extract the base64 content (remove the data prefix)
  //   const base64Data = base64.split(",")[1];
  //   // Convert the base64 string to a binary array
  //   const binaryString = atob(base64Data);
  //   const binaryLen = binaryString.length;
  //   const bytes = new Uint8Array(binaryLen);
  //   for (let i = 0; i < binaryLen; i++) {
  //     bytes[i] = binaryString.charCodeAt(i);
  //   }

  //   // Create a blob with the correct MIME type
  //   const mime = base64.match(/data:(.*);base64/)[1];
  //   const blob = new Blob([bytes], { type: mime });

  //   // Create a link to download the file
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = filename;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }
  getGeneralDocById1(params) {
    this.spinner.show(this.spinnerRefs.selectedDoc);
    this.docsService.getGeneralDocumentsByDocId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.selectedDoc);
        if (res && res.StatusCode == 200) {
          let fetchedDocs = res.PayLoad || [];
          let docArr = [];
          fetchedDocs.forEach((a) => {
            let docImg = a.GDocBase64 || a.Doc || "";
            if (docImg && docImg.indexOf("data:") == -1) {
              // check if image prefix is already appended
              docImg =
                "data:" + (a.GDocType || "image/png") + ";base64," + docImg;
            }
            let _obj: IVisitDocs = {
              // = new VisitDocs();
              docId: a.DocId,
              // visitId: null,
              uniqueIdentifier: +new Date(),
              fileName: a.Title,
              fileType: a.GDocType || "image/png",
              data: docImg,
              Remarks: a.Remarks,
              thumbnail: a.GDocBase64Thumbnail || docImg,
              sanitizedData:
                this.sanitizer.bypassSecurityTrustResourceUrl(docImg),
              sanitizedThumbnail: this.sanitizer.bypassSecurityTrustResourceUrl(
                a.GDocBase64Thumbnail || docImg
              ),
            };
            docArr.push(_obj);
          });
          console.log(docArr);
          this.cd.detectChanges();
        } else {
          this.toastr.error("error loading documents.");
        }
        console.log(res);
      },
      (err) => {
        this.toastr.error("Error loading documents");
        this.spinner.hide(this.spinnerRefs.selectedDoc);
      }
    );
  }

  reloadVisitDocs() {
    this.isLoadClick = true;
    if (this.propVisitNo) {
      this.getVisitDocs();
      // console.log("reload")
    }
  }

  saveVisitDocs() {
    let params = {
      UserId: this.loggedInUser.userid,
      Docs: this.getVisitAttachmentsData(),
    };

    if (!params.UserId || !params.Docs.length) {
      return;
    }
    this.spinner.show(this.spinnerRefs.visitDocs);
    this.docsService.saveVisitDocuments(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.visitDocs);
        if (res && res.StatusCode == 200) {
          this.toastr.success("Visit Documents Saved");
          this.getVisitDocs();
        } else {
          this.toastr.error("Error Saving Documents.");
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.visitDocs);
        console.log(err);
        this.toastr.error("Error Saving Documents");
      }
    );
  }

  /*
  formatVisitDocsData(data) {
    const loadImagePromises = [];
    let _data = data;
    try {
      _data = this.helper.addPrefixToDocs(data);
    
      
      // this.spinner.show(this.spinnerRefs.visitDocs);
      // Array.from(data).forEach( (doc:any, i) => {
      //   // doc.Doc = doc.VisitDocBase64 || doc.Doc;
      //   // let docPrefix = data:application/pdf;base64,
      //   let _formattedPic = doc.data; // doc.Doc ? ((doc.Doc.indexOf('data:') == -1) ? (CONSTANTS.IMAGE_PREFIX.PNG + doc.Doc) : doc.Doc) : '';
      //   loadImagePromises.push(this.resizeImage('', this.resizeFileSize.thumbnail.width, this.resizeFileSize.thumbnail.height, 0, '', _formattedPic));
      // });
      // Promise.all(loadImagePromises).then(responses => {
      //   this.spinner.hide(this.spinnerRefs.visitDocs);

      //   data.forEach( (a, i) => {
      //     let _formattedPic = a.data; //a.Doc ? ((a.Doc.indexOf('data:') == -1) ? (CONSTANTS.IMAGE_PREFIX.PNG + a.Doc) : a.Doc) : '';
      //     let obj = {
      //       docId: a.docId,
      //       uniqueIdentifier: (+new Date()),
      //       fileName: a.fileName,
      //       fileType: a.fileType || 'image/png',
      //       data: _formattedPic,
      //       sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(_formattedPic),
      //       thumbnail: responses[i],
      //       visitId: a.visitId
      //     }
      //     // _data.push({
      //     //   VisitDocumentID: a.DocId,
      //     //   VisitID: a.VisitId,
      //     //   VisitDocTitle: a.Title,
      //     //   Remarks: a.Remarks || '',
      //     //   VisitDocumentPic: null, // a.data.replace(/^data:image\/[a-z]+;base64,/, ""), // it will be converted to byte[] in API for backward support
      //     //   VisitDocBase64: a.Doc,
      //     //   VisitDocBase64Thumbnail: responses[i],
      //     //   VisitDocType: a.fileType || 'image/png',
      //     //   VisitDocSourceID: a.VisitDocSourceID || 1, // from registration, visit creation
      //     //   // CreatedBy: this.loggedInUser.userid
      //     // });
      //     _data.push(obj)
      //   });
      //   this.visitAttachments = [...this.visitAttachments, ..._data];
      //   this.updateImageViewer();
      //   // console.log('responses => ', responses, this.visitAttachments);
      // }, (errors) => {
      //   this.spinner.hide(this.spinnerRefs.visitDocs);
      //   console.log(errors);
      // });
      
    } catch (e) {
      // this.spinner.hide(this.spinnerRefs.visitDocs);
    }
    return _data;
  }
  */

  /*  start - camera */
  initCamera(config: any) {
    var browser = <any>navigator;

    browser.getUserMedia =
      browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia;

    if (this.activeVideoCameraStream) {
      this.stopCamera();
    }
    // console.log('config ', config);

    this.spinner.show();
    browser.mediaDevices
      .getUserMedia(config)
      .then((stream) => {
        this.spinner.hide();
        this.activeVideoCameraStream = stream;
        this.video.srcObject = stream;
        this.video.play();
        browser.mediaDevices.enumerateDevices().then((mediaDevices) => {
          this.getCameraDevices(mediaDevices);
        });
      })
      .catch((error) => {
        this.spinner.hide();
        this.toastr.warning(error);
      });
  }
  startCamera(settings = {}) {
    let _settings = { video: true, audio: false };
    _settings = { ..._settings, ...settings };
    this.initCamera(_settings);
  }
  stopCamera() {
    if (this.activeVideoCameraStream) {
      this.activeVideoCameraStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.activeVideoCameraStream = "";
    this.canvas.nativeElement
      .getContext("2d")
      .clearRect(0, 0, this.videoDimensions.width, this.videoDimensions.height);
  }
  capture() {
    var context = this.canvas.nativeElement
      .getContext("2d")
      .drawImage(
        this.video,
        0,
        0,
        this.videoDimensions.width,
        this.videoDimensions.height
      );
    this.capturedImage = this.canvas.nativeElement.toDataURL("image/png");
    this.stopCamera();
  }
  captureDocument() {
    var context = this.canvas.nativeElement
      .getContext("2d")
      .drawImage(
        this.video,
        0,
        0,
        this.videoDimensions.width,
        this.videoDimensions.height
      );
    let imageURL = this.canvas.nativeElement.toDataURL("image/png");
    let _fileName = "capture_" + +new Date();
    let _fileObject = {
      docId: null,
      uniqueIdentifier: +new Date(),
      fileName: _fileName,
      fileType: "image/png",
      data: imageURL,
      sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
      sanitizedThumbnail: this.sanitizer.bypassSecurityTrustResourceUrl(""),
      thumbnail: "", // imageURL,
      visitId: this.propVisitNo || null,
    };
    this.resizeImage(
      "",
      this.resizeFileSize.thumbnail.width,
      this.resizeFileSize.thumbnail.height,
      0,
      "",
      imageURL
    ).then(
      (res: string) => {
        _fileObject.thumbnail = res;
        _fileObject.sanitizedThumbnail =
          this.sanitizer.bypassSecurityTrustResourceUrl(res);
        // this.visitAttachments.push(_fileObject);
        this.updateVisitDocsArray([_fileObject], true);
        // this.updateImageViewer();
        // console.log(_fileObject);
        this.stopCamera();
      },
      (err) => {
        this.toastr.warning("Invalid image captured");
        this.stopCamera();
      }
    );
  }

  cameraChangedEvent() {
    this.openCamera("");
  }

  getCameraDevices(mediaDevices) {
    // console.log(this);
    // console.log('getCameraDevices ', mediaDevices);
    this.cameraDevicesList = [{ id: "", name: "default" }];
    let count = 1;
    mediaDevices.forEach((mediaDevice) => {
      if (mediaDevice.kind === "videoinput") {
        let obj = {
          id: mediaDevice.deviceId,
          name: mediaDevice.label || `Camera ${count++}`,
        };
        // console.log('aaaaaaaaaaaa ', obj);
        this.cameraDevicesList.push(obj);
      }
    });
  }
  /* end - camera */

  loadSelectedAttachmentFileMultiple(event) {
    // debugger;
    // console.log(this.visitAttachments);

    const files = (event.target as HTMLInputElement).files; // event.target.files;
    if (files.length) {
      this.spinner.show(this.spinnerRefs.visitDocs);
      const loadImagePromises = [];
      try {
        Array.from(files).forEach((file: any, i) => {
          loadImagePromises.push(this.loadImage(file, "file_" + ++i));
        });
        Promise.all(loadImagePromises).then(
          (responses) => {
            event.target.value = "";
            this.spinner.hide(this.spinnerRefs.visitDocs);
            this.setVisitDocsArray(
              [...this.visitAttachments, ...responses],
              true
            );
            // this.updateImageViewer();
            console.log(
              "responses docs list => ",
              responses,
              this.visitAttachments
            );
          },
          (errors) => {
            event.target.value = "";
            this.spinner.hide(this.spinnerRefs.visitDocs);
            console.log(errors);
          }
        );
      } catch (e) {
        event.target.value = "";
        this.spinner.hide(this.spinnerRefs.visitDocs);
      }
    }
  }
  loadImage(file, fileName = "file") {
    if (!file) {
      return 
    }
    let promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let imageURL = reader.result as string;
        let _fileName = file.name || fileName || "";
        if (_fileName.length > 50) {
          _fileName = (_fileName || "").toString().substring(0, 50);
        }
        //_fileName = `${fileName}`;
        let _fileObject = {
          docId: null,
          uniqueIdentifier: +new Date(),
          fileName: _fileName,
          fileType: file.type || "image/png",
          data: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          sanitizedData:
            this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          sanitizedThumbnail: this.sanitizer.bypassSecurityTrustResourceUrl(""),
          thumbnail: "", //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL).toString()
          visitId: this.propVisitNo || null,
        };
        if (
          file.type.split("/")[0] == "image" &&
          file.type.split("/")[1] != "svg+xml"
        ) {
          // resize only if it is image
          this.resizeImage(
            file,
            this.resizeFileSize.thumbnail.width,
            this.resizeFileSize.thumbnail.height,
            0,
            "",
            imageURL
          ).then(
            (res: string) => {
              _fileObject.thumbnail = res;
              _fileObject.sanitizedThumbnail =
                this.sanitizer.bypassSecurityTrustResourceUrl(res);
              resolve(_fileObject);
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          resolve(_fileObject);
        }
      };
      reader.readAsDataURL(file);
    });
    return promise;
  }
  openCamera(source) {
    let cameraSettings: any = {};
    if (source == "patient_pic") {
      this.openCameraFromSource = source;
      // cameraSettings = {video: { facingMode: 'user' }};
    } else if (source == "attachment") {
      this.openCameraFromSource = source;
      // cameraSettings = {video: { facingMode: 'environment' }};
    } else {
      // cameraSettings = {video: { facingMode: 'environment' }};
    }

    if (this.activeVideoCameraStream) {
      this.stopCamera();
    }
    cameraSettings = {};
    if (!this.selectedCamera) {
      cameraSettings.facingMode = "environment";
    } else {
      cameraSettings.deviceId = { exact: this.selectedCamera };
    }
    const settings = {
      video: cameraSettings,
      audio: false,
    };

    try {
      var browser = <any>navigator;
      browser.getUserMedia =
        browser.getUserMedia ||
        browser.webkitGetUserMedia ||
        browser.mozGetUserMedia ||
        browser.msGetUserMedia;
      browser.mediaDevices.enumerateDevices().then((mediaDevices) => {
        this.getCameraDevices(mediaDevices);
        this.startCamera(settings);
      });
    } catch (e) {
      this.startCamera(settings);
    }
  }

  removeVisitAttachment(attachment) {
    if (attachment) {
      if (!this.allowRemove && attachment.docId) {
        // if added from another screen then don't remove
        return;
      }
      this.setVisitDocsArray(
        this.visitAttachments.filter(
          (a) => a.uniqueIdentifier != attachment.uniqueIdentifier
        ),
        true
      );
    } else {
      // this.visitAttachments = [];
      this.setVisitDocsArray(
        this.visitAttachments.filter((a) => a.docId),
        true
      );
    }
    // this.updateImageViewer();
  }

  toggleRenameField(action, attachment) {
    this.enableRenameVisitAttachmentField = -1;
    if (action == "show") {
      this.renameFileExt = "";
      let fileNameWithoutExt = attachment.fileName.replace(/\.[^/.]+$/, ""); // attachment.fileName.split('.').splice(0,attachment.fileName.split('.').length-1).join();
      if (attachment.fileName) {
        this.renameFileExt = attachment.fileName.split(".").pop(); // attachment.fileName.split('.')[attachment.fileName.split('.').length-1]; // attachment.fileName.split('.').splice(-1,1)[0]
      }

      if (attachment && (this.allowRemove || !attachment.docId)) {
        attachment.fileName = fileNameWithoutExt;
        this.enableRenameVisitAttachmentField = attachment.uniqueIdentifier;
        setTimeout(() => {
          this.fileNameField.nativeElement.focus();
          this.fileNameField.nativeElement.select();
        }, 300);
      }
    } else {
      if (!(attachment.fileName || "").toString().toLowerCase().trim()) {
        this.toastr.warning("File name cannot be empty");
        attachment.fileName = "File_" + +new Date();
      }
      setTimeout(() => {
        let fileNameWithExt = attachment.fileName + "." + this.renameFileExt;
        if (this.visitAttachments.find((a) => a.fileName == fileNameWithExt)) {
          this.toastr.warning(
            `file name update to <strong>${attachment.fileName}</strong>`,
            "file with same name already exist",
            { enableHtml: true }
          );
          fileNameWithExt =
            attachment.fileName + +new Date() + "." + this.renameFileExt;
        }
        attachment.fileName = fileNameWithExt;
      }, 100);
    }
  }
  resizeImage(
    file,
    maxWidth,
    maxHeight,
    compressionRatio = 0,
    imageEncoding = "",
    base64Data = ""
  ) {
    const self = this;
    let promise = new Promise((resolve, reject) => {
      if (!file && !base64Data) {
        resolve("");
      }
      const fileLoader = new FileReader();
      const canvas = document.createElement("canvas");
      let context = null;
      const imageObj: any = new Image();
      let blob = null;

      // create a hidden canvas object we can use to create the new resized image data
      let canvas_id = "hiddenCanvas_" + +new Date();
      canvas.id = canvas_id;
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      canvas.style.visibility = "hidden";
      document.body.appendChild(canvas);

      // console.log('base64Data ', base64Data);
      if (base64Data) {
        if (base64Data.indexOf("data:image") == -1) {
          // if pdf, icon or any other file then don't resize
          resolve("");
          return promise;
        }
        imageObj.src = base64Data;
      } else if (file && file.size) {
        // check for an image then
        // trigger the file loader to get the data from the image
        // if (file.type.match('image.*')) {
        fileLoader.readAsDataURL(file);
        // } else {
        // alert('File is not an image');
        // }

        // setup the file loader onload function
        // once the file loader has the data it passes it to the
        // image object which, once the image has loaded,
        // triggers the images onload function
        fileLoader.onload = function () {
          const data = this.result;
          imageObj.src = data;
        };

        fileLoader.onabort = () => {
          reject("The upload was aborted.");
          this.toastr.error("The upload was aborted.");
        };

        fileLoader.onerror = () => {
          reject("An error occured while reading the file.");
          this.toastr.error("An error occured while reading the file.");
        };
      }

      // set up the images onload function which clears the hidden canvas context,
      // draws the new image then gets the blob data from it
      imageObj.onload = function () {
        // Check for empty images
        if (this.width === 0 || this.height === 0) {
          this.toastr.error("Image is empty");
        } else {
          // get the context to use
          // context = canvas.getContext('2d');
          // context.clearRect(0, 0, max_width, max_height);
          // context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, max_width, max_height);
          const newSize = self.calculateAspectRatioFit(
            this.width,
            this.height,
            maxWidth,
            maxHeight
          );
          canvas.width = newSize.width;
          canvas.height = newSize.height;
          context = canvas.getContext("2d");
          context.clearRect(0, 0, newSize.width, newSize.height);
          context.drawImage(
            imageObj,
            0,
            0,
            this.width,
            this.height,
            0,
            0,
            newSize.width,
            newSize.height
          );
          // dataURItoBlob function available here:
          // http://stackoverflow.com/questions/12168909/blob-from-dataurl
          // add ')' at the end of this function SO dont allow to update it without a 6 character edit
          blob = canvas.toDataURL(); // imageEncoding, compressionRatio);
          document.getElementById(canvas_id).remove();
          // pass this blob to your upload function
          resolve(blob);
        }
      };

      imageObj.onabort = () => {
        reject("Image load was aborted.");
        this.toastr.error("Image load was aborted.");
      };

      imageObj.onerror = () => {
        resolve(imageObj.currentSrc || "");
        // reject('An error occured while loading image.');
        this.toastr.error("An error occured while loading image.");
      };
    });
    return promise;
  }
  calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  showRemoveAllDocsButton() {
    return this.visitAttachments.find((a) => !a.docId);
  }
  showSaveDocsButton() {
    return this.visitAttachments.find((a) => !a.docId) && this.editing.save;
  }

  getVisitAttachmentsData() {
    let docs = [];
    /*
    public class DocumentsModelForVisit
    {
      public int? VisitDocumentID { get; set; }
      public int? VisitID { get; set; }
      public string VisitDocTitle { get; set; }
      public string Remarks { get; set; }
      public byte[] VisitDocumentPic { get; set; }
      public string VisitDocBase64 { get; set; }
      public string VisitDocBase64Thumbnail { get; set; }
      public string VisitDocType { get; set; }
      public int VisitDocSourceID { get; set; } // { id to identify from where file is uploaded }
    }
    */

    this.visitAttachments.forEach((a) => {
      let obj = {
        VisitDocumentID: a.docId,
        VisitID: a.visitId || this.propVisitNo,
        VisitDocTitle: a.fileName,
        Remarks: "",
        CreatedOn: a.CreatedOn,
        CreatedName: a.EmployeeName,
        VisitDocumentPic: null,
        VisitDocBase64: a.data,
        VisitDocBase64Thumbnail: a.thumbnail,
        VisitDocType: a.fileType || "image/png",
        VisitDocSourceID: 1,
      };
      if (!obj.VisitDocumentID) {
        docs.push(obj);
      }
    });
    return docs;
  }

  setVisitDocsArray(docs, emit) {
    //here
    // debugger;
    this.visitAttachments = docs || [];

    if (emit) {
      this.outputDocs.emit(this.visitAttachments);
    }
    this.updateImageViewer();
  }

  updateVisitDocsArray(docs, emit) {
    //here
    this.visitAttachments = [...this.visitAttachments, ...docs];

    if (emit) {
      this.outputDocs.emit(this.visitAttachments);
    }
    this.updateImageViewer();
  }

  layoutBtnAllowed(btnName) {
    return this.layoutButtons.indexOf(btnName) > -1;
  }

  reEvaluateEditingPermissions() {
    this.editing = { ...this.defaultEditing, ...this.editing };
  }

  initImageViewer() {
    // setTimeout(() => {
    //   this.imgViewer = new ImgPreviewer('.visit-attachments-container', {
    //     scrollbar: true
    //   });
    // }, 500);
  }
  updateImageViewer() {
    // this.initImageViewer();
    // if(this.imgViewer) {
    //   setTimeout(() => {
    //     this.imgViewer.update();
    //   }, 500);
    // } else {
    //   this.initImageViewer();
    // }
  }

  /***** WEB SOCKET - MULTI APP *****/
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }
  connectToMultiApp() {
    // setTimeout(() => {
    //   this.multiApp.connectToMultiApp();
    // }, 1000);
  }
  disconnectToMultiApp() {
    this.multiApp.disconnectToMultiApp();
  }
  subscribeFirMultiAppStatus() {
    this.multiApp.multiAppConnectionStatus.subscribe((status) => {
      this.multiAppConnectionStatus = status;
      setTimeout(() => {
        this.cd.detectChanges();
      }, 100);
    });
  }
  subscribeForScannedDoc() {
    let sub = this.multiApp.scannedDoc.subscribe((doc) => {
      if (doc) {
        this.updateVisitDocsArray(doc, true);
      } else {
        // this.toastr.warning('no data received from scanner');
      }
    });
    this.subscriptions.push(sub);
  }
  scanImage() {
    let isocr = 0;
    if (this.visitAttachments.length == 0) {
      isocr = 1;
    }
    let obj = {
      user: this.loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href),
      isocr: this.refByDocID != 61478 && this.refByDocID != 0 ? isocr : 0,
      refbydocid:
        this.refByDocID != 61478 && this.refByDocID != 0 ? this.refByDocID : 0,
    };
    // this.toastr.warning("refByDocID", (this.refByDocID.toString()))
    this.sendCommand({
      command: "ScanImage",
      userIdentity: JSON.stringify(obj),
    });
  }

  /***** WEB SOCKET - MULTI APP *****/

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  // printDocument(param) {
  //   let styleSheet = `
  //     <style>
  //       body {
  //         width: 21cm;
  //         margin: auto;
  //       }
  //       .no-print{
  //         display:none;
  //       }
  //     </style>`;
  //   setTimeout(() => {
  //     let data = document.getElementById(param).innerHTML;
  //     let documentWindow = window.open(
  //       "Print Document",
  //       "Print Document" + new Date()
  //     );
  //     documentWindow.document.write("<html><head>" + styleSheet + "");
  //     documentWindow.document.write("</head><body>");
  //     documentWindow.document.write("");
  //     documentWindow.document.write(data);
  //     documentWindow.document.write("");
  //     documentWindow.document.write("</body></html>");

  //     documentWindow.print();
  //     setTimeout((a) => {
  //       documentWindow.close();
  //     }, 500);
  //   }, 500);

  // }
  printDocument(param) {
    let styleSheet = `
      <style>
        body {
          width: 21cm;
          margin: auto;
        }
        .no-print {
          display: none;
        }
      </style>`;
  
    setTimeout(() => {
      let element = document.getElementById(param);
      if (!element) {
        console.error("Element not found:", param);
        return;
      }
      
      let data = element.innerHTML;
  
      let documentWindow = window.open("", "_blank");
      if (!documentWindow) {
        alert("Pop-up blocked! Allow pop-ups for printing.");
        return;
      }
  
      documentWindow.document.open();
      documentWindow.document.write("<html><head>" + styleSheet + "</head><body>");
      documentWindow.document.write(data);
      documentWindow.document.write("</body></html>");
      documentWindow.document.close();
  
      // Ensure content is fully loaded before printing
      documentWindow.onload = () => {
        setTimeout(() => {
          documentWindow.print();
          setTimeout(() => {
            documentWindow.close();
          }, 200);
        }, 200);
      };
    }, 200);
  }
  

  showSaveCMSDocsButton() {
    return this.visitAttachments.find((a) => !a.docId) && this.editing.insert;
  }

  formatUploadedDocsData() {
    let docs = [];
    this.visitAttachments
      .filter((a) => !a.docId)
      .forEach((a) => {
        let d = {
          DocId: null,
          Title: a.fileName,
          Remarks: "",
          Doc: null, // byte[] // it will be converted to byte[] in API for backward support
          CreatedBy: this.loggedInUser.userid,
          RefId: this.CMSrequestID,
          DocTypeId: this.forFilterComp,
          GDocBase64: a.data,
          GDocBase64Thumbnail: "", // a.thumbnail,
        };
        docs.push(d);
      });

    return docs;
  }

  insertCMSDocuments() {
    let docsToSave =
      this.formatUploadedDocsData().filter((a) => !a.docId) || [];
    if (!docsToSave.length) {
      this.toastr.warning("No documents to save");
      return;
    }

    let params = {
      UserId: this.loggedInUser.userid,
      Docs: docsToSave,
    };

    // console.log("insertCMSDocuments ~ params:", params)

    this.spinner.show(this.spinnerRefs.visitDocs);
    this.docsService.saveGeneralDocumentsByRefIdTypeIdDB(params).subscribe(
      (res: any) => {
        // console.log("saveCMSDocuments ~ res:", res)
        this.spinner.hide(this.spinnerRefs.visitDocs);
        if (res && res.StatusCode == 200) {
          this.toastr.success("Documents Saved");
          this.getCMSDocuments();
        } else {
          this.toastr.error("Error Saving Documents.");
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.visitDocs);
        console.log(err);
        this.toastr.error("Error Saving Documents");
      }
    );
  }
  getCMSDocuments() {
    this.isLoadClick = true;
    let params = {
      refId: this.CMSrequestID,
      docTypeIds: this.forFilterComp,
    };
    // console.log("insertCMSDocuments ~ params:", params);
    this.spinner.show(this.spinnerRefs.visitDocs);
    this.docsService.getGeneralDocumentsByRefIdDocTypeId(params).subscribe(
      (res: any) => {
        // console.log("getCMSDocuments ~ res:", res)
        this.spinner.hide(this.spinnerRefs.visitDocs);
        if (res && res.StatusCode == 200) {
          this.isLoadClick = true;
          let docData = this.helper.addPrefixToDocs(res.PayLoad);
          this.visitAttachments = docData;
          // console.log("this.docsService.getGeneralDocumentsByRefIdDocTypeId ~ this.visitAttachments:", this.visitAttachments)
          // this.outputDocs.emit(docData);
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.visitDocs);
        console.log(err);
        this.toastr.error("Error Saving Documents");
      }
    );
  }

  translateX: number = 0;
  translateY: number = 0;
  imageRotation: number = 0;
  zoomFactor = 1; // Initial zoom factor
  isDragging = false;
  prevX = 0;
  prevY = 0;

  rotateImage() {
    this.imageRotation = (this.imageRotation + 90) % 360;
  }

  zoomIn() {
    if (this.zoomFactor < 2) {
      this.zoomFactor += 0.1; // Increase zoom factor by 0.1 (adjust as needed)
    }
  }

  zoomOut() {
    if (this.zoomFactor > 0.5) {
      this.zoomFactor -= 0.1; // Decrease zoom factor by 0.1 (adjust as needed)
    }
  }

  onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY > 0) {
      this.zoomOut();
    } else {
      this.zoomIn();
    }
  }

  @HostListener("document:mouseup", ["$event"])
  onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.stopDrag();
    }
  }

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.prevX = event.clientX;
    this.prevY = event.clientY;
  }

  onDrag(event: MouseEvent) {
    if (this.isDragging) {
      const deltaX = event.clientX - this.prevX;
      const deltaY = event.clientY - this.prevY;
      this.translateX += deltaX;
      this.translateY += deltaY;
      this.prevX = event.clientX;
      this.prevY = event.clientY;
      this.getImageStyles();
    }
  }
  stopDrag() {
    this.isDragging = false;
  }

  getImageStyles() {
    return {
      transform: `translate(${this.translateX}px, ${this.translateY}px) rotate(${this.imageRotation}deg) scale(${this.zoomFactor})`,
    };
  }
  addRemarks(va, value) {
    va.Remarks = value
    console.log(va.Remarks)
  }
  rowIndex = null;
  getIndex(index) {
    this.rowIndex = index;
  }
}
