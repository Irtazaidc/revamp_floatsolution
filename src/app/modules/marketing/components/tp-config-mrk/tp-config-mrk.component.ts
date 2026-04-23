// @ts-nocheck
import { Component, Pipe, PipeTransform, Input, OnChanges, OnInit, ViewChild, ElementRef, Output, EventEmitter, NgModule } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { ProductsPromotionService } from '../../services/products-promotion.service';
import { Router } from '@angular/router';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { TestProfileConfigurationService } from '../../../test-profile-management/Services/test-profile-configurations-services';

@Component({
  standalone: false,

  selector: 'app-tp-config-mrk',
  templateUrl: './tp-config-mrk.component.html',
  styleUrls: ['./tp-config-mrk.component.scss']
})

export class TpConfigMrkComponent implements OnInit {

  @Output() tabIndexData = new EventEmitter<any>();
  @Output() outputFromChild = new EventEmitter<string>();

  QuestionClassificationID: any = null;



  searchText = '';
  objList = [];
  existingRow = [];
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  ImageToUpload: File = null
  ImageUrl: any;
  ImageUrl_temp: any;

  isActive = true;
  ImageMaxSize: number;
  inputTestData: string;
  inputCodeData: string;
  
  selectedLocId = 1
  selectedPanelId = null
  selectedTPID = 0;
  rdSearchBy = 'byCode';
  testList = []
  imageStr=""
  TPId: any = null;
  
  resizeFileSize = {
    thumbnail: {
      width: 200,
      height: 200
    },
    width: 500,
    height: 500
  };
  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection',
    updatePicture: 'updatePicture'
  };
  actionLabel = "Save";
  cardTitle = "Add Classification";
  objForm = this.fb.group({
    TestProfileName: ['',{disabled: true}, Validators.compose([Validators.required])],
    TestProfileCode: ['',{disabled: true}, Validators.compose([Validators.required])],
    TPId: ['',{disabled: true}, Validators.compose([Validators.required])]
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to ' + this.actionLabel.toLowerCase() + ' ?', // 'Are you sure?',
    popoverTitleTests: 'Are you <b>sure</b> want to save ?', // 'Are you sure?',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  collectionSize = 0;

  
  titleToShowOnCard: any = '';
  TestProfileName: string;
  TestProfileCode: string;
  filteredData: any[];
  pageIndex = 0;
  pagination = {
    page: 1,
    pageSize: 20,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }

  ginatedSearchResults: []
  base64: any;


  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private _ppservice: ProductsPromotionService,
    private testProfileService: TestProfileService,
    private TPService: TestProfileConfigurationService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getTestProfileList();
    this.refreshPagination();
  }

  getTestProfileList() {
    this.objList = [];
    this.filterResults();
    this.spinner.show(this.spinnerRefs.listSection);
    const _param = {
      branchId: this.selectedLocId,
      TestProfileCode: null,
      TestProfileName: null,
      panelId: (this.selectedPanelId > 0 ? this.selectedPanelId : null),
      TPIDs: ''
    };
    this.testProfileService.getTestsByName(_param).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.objList = data || [];
        this.filterResults();

      }
    }, (err) => {
      console.log(err);
    });
  }

  TestProfilePicID=null;

  getSingleRow(item: any) {

    this.spinner.show(this.spinnerRefs.updatePicture);

    this.TestProfileName = item.TestProfileName;
    this.TestProfileCode = item.TestProfileCode;
    this.TPId = item.TPId

    let response = [];
    this.ImageUrl=null;

    const paramObj = {
      TPID:this.TPId
    }
    this.TPService.GetTestProfilePicByID(paramObj).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.updatePicture);
      response = JSON.parse(resp.PayLoadStr || '[]');
      console.log("TPService.GetTestProfilePicByID")
      if (response['Table'].length) {
        this.ImageUrl = response['Table'][0].TestProfileImage;
        this.TestProfilePicID= response['Table'][0].TestProfilePicID || null;
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.updatePicture);
      console.log(err);
    })

  }


  // Start Pagination 

  refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
    // console.log("this.pagination.paginatedSearchResults ", this.pagination.paginatedSearchResults);
  }
  filterResults() {
    
    this.pagination.page = 1;
    const cols = ['TestProfileName', 'TestProfileCode'];
    let results: any = this.objList;
    if (this.searchText && this.searchText.length > 1) {
      const pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.objList, this.searchText, cols, this.objList);
    }
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }

  // End Pagination

  //Add Update Product Promotion
  addUpdateTestProfilePic() {
    const bytesToMegaBytes = this.ImageMaxSize / (1024 ** 2);
    let fileExtension = "";
    this.spinner.show(this.spinnerRefs.updatePicture);
    let image = null;
    if (this.ImageToUpload != null) {
      if (bytesToMegaBytes > (500 / 1024)) {
        this.toastr.error('Image size is too large and exceeds 100KB');
        this.spinner.hide(this.spinnerRefs.updatePicture);
         return;
      }
      
      fileExtension = (this.ImageToUpload.name.substring((this.ImageToUpload.name.lastIndexOf('.') + 1)) || '').toLowerCase();
      // console.log("🚀FileExtension", fileExtension)
      if (fileExtension === "png") {
        fileExtension = "";
        image = this.ImageUrl.replace("data:image/png;base64,", "data:image/png;base64,");
      } else if (fileExtension === "jpg" || fileExtension === "jpeg") {
        fileExtension = "";
        image = this.ImageUrl.replace("data:image/png;base64,", "data:image/jpeg;base64,");
        image = this.ImageUrl.replace("data:image/png;base64,", "data:image/jpg;base64,");
      // } else if (fileExtension === "gif") {
      //   fileExtension = "";
      //   image = this.ImageUrl.replace("data:image/png;base64,", "data:image/gif;base64,");
        
      }     
      const param = {
        CreatedBy: this.loggedInUser.userid,
        TPID: this.objForm.value.TPId,
        TestProfilePic: image,
        TestProfilePicID: this.TestProfilePicID,
      };
      //  console.log("ParamSave PIc", param) 
        this._ppservice.saveTestProfilePic(param).subscribe((data: any) => {
          this.spinner.hide(this.spinnerRefs.updatePicture);
          console.log("SaveTestProfilePic")
          if(data.PayLoadArr[0].Result===1){
            this.toastr.success('Image Updated Successfully');
          }
          else{
            this.toastr.error('Error While Uploading Image');
          }
        }, (err) => {
          this.spinner.hide(this.spinnerRefs.updatePicture);
          console.log(err);
        })
    }
    else{
      this.toastr.error('Upload Image first'); 
      this.spinner.hide(this.spinnerRefs.updatePicture);
      return; 
    }
  }
 
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  clearForm() {
    this.existingRow = []
    this.objList;
    this.titleToShowOnCard = '';
    this.QuestionClassificationID = null;
    this.actionLabel = "Save";
    this.ImageUrl = 'assets/images/brand/no-image.png';
    this.disabledButton = false;
    this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.actionLabel.toLowerCase() + ' ?'
    this.cardTitle = "Add Classification";
    setTimeout(() => {
      this.objForm.reset();
    }, 100);
  }
  Height = 0;
  Weight = 0;

  loadItemsImage(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.ImageToUpload = file;
    //Get image width and height
    const URL = window.URL || window.webkitURL;
    const Img = new Image();
    Img.src = URL.createObjectURL(file);
    Img.onload = (e: any) => {
      const height = e.path[0].height;
      const width = e.path[0].width;
      console.log("height and width ",height,width);


  }
  //Get image width and height

    this.ImageMaxSize = this.ImageToUpload.size;
    if(file && file.type) {
      if(file.type.indexOf('image/') == -1) {
        this.toastr.warning('File should be Image', 'Invalid File Type');
        return;
      }
      this.loadImage(file).then( (response: any) => {
        event.target.value = '';
        this.ImageUrl= response.resizedImageData;
      });
    }
  }
  loadImage(file, fileName = 'file') {
    
    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageURL = reader.result as string;
        this.ImageUrl_temp = imageURL.replace('data:'+file.type+';base64,','');
        // console.log("file to load",this.ImageUrl_temp);
        const _fileName = file.name || '';
        //_fileName = `${fileName}`;
        const _fileObject = {
          uniqueIdentifier: (+new Date()),
          fileName: _fileName,
          filtType: file.type || '',
          resizedImageData:'',
          data: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          thumbnail: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL).toString()
        };
        if(file.type.split('/')[0] == 'image' && file.type.split('/')[1] != 'svg+xml') { // resize only if it is image
          this.resizeImage(file, this.resizeFileSize.thumbnail.width, this.resizeFileSize.thumbnail.height, 0, '', imageURL).then((res:string) => {
            _fileObject.resizedImageData = res;
            resolve(_fileObject);
          }, (err) => {
            reject(err);
          });
        } else {
          resolve(_fileObject);
        }
      }
      reader.readAsDataURL(file);
    });
    return promise;
  }

  resizeImage(file, maxWidth, maxHeight, compressionRatio = 0, imageEncoding = '', base64Data = '') {
    const self = this;
    const promise = new Promise( (resolve, reject) => {
      if(!file && !base64Data) {
        resolve('');
      }
      const fileLoader = new FileReader();
      const canvas = document.createElement('canvas');
      let context = null;
      const imageObj:any = new Image();
      let blob = null;
  
      // create a hidden canvas object we can use to create the new resized image data
      const canvas_id = 'hiddenCanvas_'+ +new Date();
      canvas.id = canvas_id;
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      canvas.style.visibility = 'hidden';
      document.body.appendChild(canvas);
  
      if(base64Data) {
        imageObj.src = base64Data;
      } else if(file && file.size) {
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
          reject('The upload was aborted.');
          alert('The upload was aborted.');
        };
    
        fileLoader.onerror = () => {
          reject('An error occured while reading the file.');
          alert('An error occured while reading the file.');
        };
      }

      // set up the images onload function which clears the hidden canvas context,
      // draws the new image then gets the blob data from it
      imageObj.onload = function () {
          // Check for empty images
          if (this.width === 0 || this.height === 0) {
            alert('Image is empty');
          } else {
            // get the context to use
            // context = canvas.getContext('2d');
            // context.clearRect(0, 0, max_width, max_height);
            // context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, max_width, max_height);
            const newSize = self.calculateAspectRatioFit(this.width, this.height, maxWidth, maxHeight);
            canvas.width = newSize.width;
            canvas.height = newSize.height;
            context = canvas.getContext('2d');
            context.clearRect(0, 0, newSize.width, newSize.height);
            context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, newSize.width, newSize.height);
            // dataURItoBlob function available here:
            // http://stackoverflow.com/questions/12168909/blob-from-dataurl
            // add ')' at the end of this function SO dont allow to update it without a 6 character edit
            blob = canvas.toDataURL(imageEncoding);
            document.getElementById(canvas_id).remove();
            // pass this blob to your upload function
            resolve(blob);
          }
      };
  
      imageObj.onabort = () => {
        reject('Image load was aborted.');
        alert('Image load was aborted.');
      };
  
      imageObj.onerror = () => {
        resolve(imageObj.currentSrc || '');
        // reject('An error occured while loading image.');
        alert('An error occured while loading image.');
      };
    })
    return promise;
  }
  calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth*ratio, height: srcHeight*ratio };
  }




}
