// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { LabTatsService } from '../../services/lab-tats.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Component({
  standalone: false,

  selector: 'app-doc-compare',
  templateUrl: './doc-compare.component.html',
  styleUrls: ['./doc-compare.component.scss']
})
export class DocCompareComponent implements OnInit {

  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection',
    updatePicture: 'updatePicture'
  };


  file1: File | null = null;
  file2: File | null = null;
  text1: string | null = null;
  text2: string | null = null;
  comparisonResult: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private labTats: LabTatsService,
    private sharedSrv: SharedService
  ) { }

  ngOnInit(): void {
    // this.testironocr();
  }


  searchText = '';

  async onFileChange(event: any) {
    const file = event.target.files[0];
    this.file2 = null;
    this.text2 = null;
    this.file2 = file;
    // this.text2 = await this.labTats.performOCR(file);
    console.log("text2:", this.text2)
  }

  compareDocuments() {
    if (this.text2) {
      const searchText = this.searchText.toLowerCase();  //`'${this.searchText.toLowerCase()}'`;
      this.text2 = this.text2.toLowerCase();
      if (this.searchText && this.text2.includes(searchText)) {
        this.comparisonResult = `The text "${this.searchText}" found in the document.`;
        this.toastr.info(`The text "${this.searchText}" found in the document.`);
      } else {
        this.comparisonResult = `The text "${this.searchText}" not found in the document.`;
        this.toastr.warning(`The text "${this.searchText}" not found in the document.`);
      }
    } else {
      this.toastr.error('OCR operation has not completed yet or no file selected.');
    }
  }

  testironocr() {
    this.sharedSrv.getData(API_ROUTES.tt, null).subscribe((res: any) => {

    }, (err) => {
      console.log(err);
    })
  }

  // ImageToUpload: File = null
  // ImageMaxSize: number;
  // ImageUrl: any;
  // ImageUrl_temp: any;
  // resizeFileSize = {
  //   thumbnail: {
  //     width: 200,
  //     height: 200
  //   },
  //   width: 500,
  //   height: 500
  // };

  // loadItemsImage(event) {
  //   const file = (event.target as HTMLInputElement).files[0];
  //   this.ImageToUpload = file;
  //   //Get image width and height
  //   const URL = window.URL || window.webkitURL;
  //   const Img = new Image();
  //   Img.src = URL.createObjectURL(file);
  //   Img.onload = (e: any) => {
  //     const height = e.path[0].height;
  //     const width = e.path[0].width;
  //     console.log("height and width ",height,width);


  // }
  // //Get image width and height

  //   this.ImageMaxSize = this.ImageToUpload.size;
  //   if(file && file.type) {
  //     if(file.type.indexOf('image/') == -1) {
  //       this.toastr.warning('File should be Image', 'Invalid File Type');
  //       return;
  //     }
  //     this.loadImage(file).then( (response: any) => {
  //       event.target.value = '';
  //       this.ImageUrl= response.resizedImageData;
  //     });
  //   }
  // }
  // loadImage(file, fileName = 'file') {

  //   let promise = new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       let imageURL = reader.result as string;
  //       this.ImageUrl_temp = imageURL.replace('data:'+file.type+';base64,','');
  //       // console.log("file to load",this.ImageUrl_temp);
  //       let _fileName = file.name || '';
  //       //_fileName = `${fileName}`;
  //       let _fileObject = {
  //         uniqueIdentifier: (+new Date()),
  //         fileName: _fileName,
  //         filtType: file.type || '',
  //         resizedImageData:'',
  //         data: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
  //         sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
  //         thumbnail: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL).toString()
  //       };
  //       if(file.type.split('/')[0] == 'image' && file.type.split('/')[1] != 'svg+xml') { // resize only if it is image
  //         this.resizeImage(file, this.resizeFileSize.thumbnail.width, this.resizeFileSize.thumbnail.height, 0, '', imageURL).then((res:string) => {
  //           _fileObject.resizedImageData = res;
  //           resolve(_fileObject);
  //         }, (err) => {
  //           reject(err);
  //         });
  //       } else {
  //         resolve(_fileObject);
  //       }
  //     }
  //     reader.readAsDataURL(file);
  //   });
  //   return promise;
  // }

  // resizeImage(file, maxWidth, maxHeight, compressionRatio = 0, imageEncoding = '', base64Data = '') {
  //   const self = this;
  //   let promise = new Promise( (resolve, reject) => {
  //     if(!file && !base64Data) {
  //       resolve('');
  //     }
  //     const fileLoader = new FileReader();
  //     const canvas = document.createElement('canvas');
  //     let context = null;
  //     const imageObj:any = new Image();
  //     let blob = null;

  //     // create a hidden canvas object we can use to create the new resized image data
  //     let canvas_id = 'hiddenCanvas_'+ +new Date();
  //     canvas.id = canvas_id;
  //     canvas.width = maxWidth;
  //     canvas.height = maxHeight;
  //     canvas.style.visibility = 'hidden';
  //     document.body.appendChild(canvas);

  //     if(base64Data) {
  //       imageObj.src = base64Data;
  //     } else if(file && file.size) {
  //     // check for an image then
  //     // trigger the file loader to get the data from the image
  //     // if (file.type.match('image.*')) {
  //       fileLoader.readAsDataURL(file);
  //       // } else {
  //       // alert('File is not an image');
  //       // }

  //       // setup the file loader onload function
  //       // once the file loader has the data it passes it to the
  //       // image object which, once the image has loaded,
  //       // triggers the images onload function
  //       fileLoader.onload = function () {
  //         const data = this.result;
  //         imageObj.src = data;
  //       };

  //       fileLoader.onabort = () => {
  //         reject('The upload was aborted.');
  //         alert('The upload was aborted.');
  //       };

  //       fileLoader.onerror = () => {
  //         reject('An error occured while reading the file.');
  //         alert('An error occured while reading the file.');
  //       };
  //     }

  //     // set up the images onload function which clears the hidden canvas context,
  //     // draws the new image then gets the blob data from it
  //     imageObj.onload = function () {
  //         // Check for empty images
  //         if (this.width === 0 || this.height === 0) {
  //           alert('Image is empty');
  //         } else {
  //           // get the context to use
  //           // context = canvas.getContext('2d');
  //           // context.clearRect(0, 0, max_width, max_height);
  //           // context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, max_width, max_height);
  //           const newSize = self.calculateAspectRatioFit(this.width, this.height, maxWidth, maxHeight);
  //           canvas.width = newSize.width;
  //           canvas.height = newSize.height;
  //           context = canvas.getContext('2d');
  //           context.clearRect(0, 0, newSize.width, newSize.height);
  //           context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, newSize.width, newSize.height);
  //           // dataURItoBlob function available here:
  //           // http://stackoverflow.com/questions/12168909/blob-from-dataurl
  //           // add ')' at the end of this function SO dont allow to update it without a 6 character edit
  //           blob = canvas.toDataURL(imageEncoding);
  //           document.getElementById(canvas_id).remove();
  //           // pass this blob to your upload function
  //           resolve(blob);
  //         }
  //     };

  //     imageObj.onabort = () => {
  //       reject('Image load was aborted.');
  //       alert('Image load was aborted.');
  //     };

  //     imageObj.onerror = () => {
  //       resolve(imageObj.currentSrc || '');
  //       // reject('An error occured while loading image.');
  //       alert('An error occured while loading image.');
  //     };
  //   })
  //   return promise;
  // }
  // calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  //   const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  //   return { width: srcWidth*ratio, height: srcHeight*ratio };
  // }

}
