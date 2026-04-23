// @ts-nocheck
import { Component, Input, OnChanges, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ProductsPromotionService } from '../../services/products-promotion.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import moment from 'moment';




@Component({
  standalone: false,

  selector: 'app-edit-product-promotion',
  templateUrl: './edit-product-promotion.component.html',
  styleUrls: ['./edit-product-promotion.component.scss']
})
export class EditProductPromotionComponent implements OnInit, AfterViewInit {

  urlPattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?";

  @ViewChild('frmPromotion') form;
  ProductsPromotionsRow: any = [];
  ImageToUpload: File = null
  ImageUrl: any;
  ImageUrl_temp: any;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  pageHeader: any = '';
  urlID: any = null;
  ProductPromotionID: any = null;
  ProductPromotionIDEnc: any = null;
  PromotionTitle: any = "";
  PromotionURL: any = "";
  PromotionOrder: any = "";
  PromotionFor: any = 1;
  PromotionDescription: any = "";
  IsValidUser: any = null;
  ImageMaxSize: number;
  DisplayOrder: any;
  isActive = null;
  isShowDetail = 0;
  minEndDate;
  minStartDate;
  minTime;
  StartDate = null;
  StartTime = null;
  EndDate = null;
  EndTime = null;
  resizeFileSize = {
    thumbnail: {
      width: 200,
      height: 200
    },
    width: 500,
    height: 500
  }
  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection'
  }
  isDisabledPromotionFor = false;
    constructor(
    private _ppservice: ProductsPromotionService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private helper: HelperService,
    private router: Router,
    private cookieService: CookieService,
    private auth: AuthService,
    // private storageService: StorageService,
    private sanitizer: DomSanitizer,
    private lookupService: LookupService,
        ) { }
  loggedInUser: UserModel;
  ngOnInit(): void {
    this.urlID = this.route.snapshot.params['id'] ? this.route.snapshot.params['id'] : null;
    if (this.urlID == null) {
      this.getProductPromotionCity()
      this.pageHeader = 'Add Product Promotion';
    } else {
      this.getCities();
      this.pageHeader = 'Update Product Promotion';
    }

    this.loadLoggedInUserInfo();
    this.endHourHandlerChange();
    this.startHourHandlerChange();
    // this.getBranches();


    this.productPromotion(this.urlID);
    if (this.cookieService.get('isLoggedIn') || this.auth.isLoggedIn()) {
      this.IsValidUser = 1
      // if (this.urlID == null) {
      //   this.getProductPromotionCity()
      //   this.pageHeader = 'Add Product Promotion';
      // } else {
      //   this.getCities();
      //   this.pageHeader = 'Update Product Promotion';
      // }
    } else {
      this.router.navigate(['/products-promotion/products-promotion']);
    }
    this.minStartDate= Conversions.getCurrentDateObject();
    this.minEndDate= Conversions.getCurrentDateObject();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  existingActiveValue = null;
  allCitiesAreChecked = false;
  productPromotion(id) {
    this.spinner.show(this.spinnerRefs.listSection);
    this.ProductPromotionIDEnc = id;
    // this.spinner.show();;
    let response = [];
    const Params = {
      ProductPromotionIDEnc: id
    }
    if (!Params.ProductPromotionIDEnc) {
      this.ProductsPromotionsRow = [];
      this.StartDate = Conversions.getCurrentDateObject();
      this.EndDate = Conversions.getEndDateObjectNew();
      this.StartTime = { hour: 0, minute: 0, second: 0 };
      this.EndTime = { hour: 23, minute: 59, second: 59 };
      this.spinner.hide(this.spinnerRefs.listSection);
      this.isDisabledPromotionFor = false;
      return;
    } else {
      this._ppservice.getProductPromotions(Params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        response = JSON.parse(resp.PayLoadStr);
        response = this.helper.promotionImagesData(response);
        this.ProductsPromotionsRow = response;
        // console.log("promotion row is: ",this.ProductsPromotionsRow)

        //start time obj making
        const startDateTime = this.ProductsPromotionsRow[0].StartDateTime ? new Date(this.ProductsPromotionsRow[0].StartDateTime) : null;
        const startHours = startDateTime ? startDateTime.getHours() : '00';
        const startMinutes = startDateTime ? startDateTime.getMinutes() : '01';
        const startSeconds = startDateTime ? startDateTime.getSeconds() : '0';
        this.StartTime = { hour: startHours, minute: startMinutes, second: startSeconds };

        //end time obj making
        const endDateTime = this.ProductsPromotionsRow[0].EndDateTime ? new Date(this.ProductsPromotionsRow[0].EndDateTime) : null;
        const endHours = endDateTime ? endDateTime.getHours() : '00';
        const endMinutes = endDateTime ? endDateTime.getMinutes() : '01';
        const endSeconds = endDateTime ? endDateTime.getSeconds() : '0';
        this.EndTime = { hour: endHours, minute: endMinutes, second: endSeconds };

        this.StartDate = Conversions.getDateObjectByGivenDate(this.ProductsPromotionsRow[0].StartDateTime);
        this.EndDate = Conversions.getDateObjectByGivenDate(this.ProductsPromotionsRow[0].EndDateTime);

        this.PromotionTitle = this.ProductsPromotionsRow[0].PromotionTitle;
        this.PromotionURL = this.ProductsPromotionsRow[0].PromotionURL;
        this.PromotionOrder = this.ProductsPromotionsRow[0].PromotionOrder;
        this.PromotionFor = this.ProductsPromotionsRow[0].PromotionFor;
        this.PromotionDescription = this.ProductsPromotionsRow[0].PromotionDescription;
        this.ProductPromotionID = this.ProductsPromotionsRow[0].ProductPromotionID;
        this.isActive = this.ProductsPromotionsRow[0].isActive;
        this.isShowDetail = this.ProductsPromotionsRow[0].isShowDetail;

        // this.branchIds = this.ProductsPromotionsRow[0].LocIDs.substring(0, this.ProductsPromotionsRow[0].LocIDs.length - 1).split(',').map(id => parseInt(id.trim(), 10));
        // this.cityIds = this.ProductsPromotionsRow[0].OrgCityIDs.substring(0, this.ProductsPromotionsRow[0].OrgCityIDs.length - 1).split(',').map(id => parseInt(id.trim(), 10));
        this.cityIds = this.ProductsPromotionsRow[0].OrgCityIDs.substring(0, this.ProductsPromotionsRow[0].OrgCityIDs.length - 1).split(',').map(id => parseInt(id.trim(), 10));
        const incCityIds = this.ProductsPromotionsRow[0].OrgCityIDs.substring(0, this.ProductsPromotionsRow[0].OrgCityIDs.length - 1).split(',');
        // this.isDisabledPromotionFor = this.ProductsPromotionsRow[0].PromotionFor == 4 ? true : false;
        this.isDisabledPromotionFor = true;
        this.citiesList.forEach(city => {
          city.checked = incCityIds.includes(city.CityID.toString());
        });
        this.allCitiesAreChecked = this.citiesList.every(city => {
          return city.checked && incCityIds.includes(city.CityID.toString());
        });
      }, (err) => {
        console.log(err);
      })
    }

  }

  // handelFileImput(file: FileList) { console.warn('there we goooo')
  //   this.ImageToUpload = file.item(0);
  //   this.ImageMaxSize = this.ImageToUpload.size;
  //   // Show image preview
  //   var reader = new FileReader();
  //   reader.onload = (event: any) => {
  //     this.ImageUrl = event.target.result;
  //   }
  //   reader.readAsDataURL(this.ImageToUpload);
  // }


  isDateObjectEmpty(obj: any): boolean {
    return isNaN(obj.day) && isNaN(obj.month) && isNaN(obj.year);
  }

  //Add Update Product Promotion
  endDateGreaterValidation = false;
  addUpdateProductPromotion(data) {
    let cityIds = ""
    const checkedCities = this.citiesList.filter(a => a.checked);
    if (checkedCities.length) {
      cityIds = checkedCities.map(city => city.CityID).join(',');
    } else {
      this.toastr.warning("Please select any city", "City Validation Error!")
      return;
    }
    // console.log('checkedCities___',checkedCities,"cityIds: ",cityIds);return;
    let startDateTime: any;
    let endDateTime: any;
    // console.log("this.StartDate && this.StartTime",this.StartDate +'--'+ this.StartTime);
    // if (this.isDateObjectEmpty(this.StartDate)) {
    //   console.log('start Date object is empty');
    // } else {
    //   console.log('start Date object is not empty');
    //   startDateTime = Conversions.mergeDateTime(this.StartDate,this.StartTime);
    // }
    // if (this.isDateObjectEmpty(this.EndDate)) {
    //   console.log('endDate object is empty');
    // } else {
    //   console.log('end Date object is not empty');
    //   endDateTime = Conversions.mergeDateTime(this.EndDate,this.EndTime);
    // }
    // return;
    startDateTime = (this.StartDate && this.StartTime) ? Conversions.mergeDateTime(this.StartDate, this.StartTime) : null;
    endDateTime = (this.EndDate && this.EndTime) ? Conversions.mergeDateTime(this.EndDate, this.EndTime) : null;
    // console.log("start date: ",startDateTime, "end date: ",endDateTime);return;
    if(startDateTime>endDateTime){
      this.endDateGreaterValidation = true;
      this.toastr.error("End DateTime should be greater then the Start DateTime","Date Validation Error")
      return;
    }else{
      this.endDateGreaterValidation=false;
    }
    // let branchIds = this.branchIds.join(",");
    //let cityIds = this.cityIds.join(",");
    const bytesToMegaBytes = this.ImageMaxSize / (1024 ** 2);
    let fileExtension = "";
    let image = null;
    if (this.ImageToUpload != null) {
      if (this.PromotionFor == 4 && (this.Width > 300 || this.Height > 500)) {
        this.toastr.error("Image exceeds the maximum values of dimensions, W:" + this.Width + " H:" + this.Height, "Max W:300px, Max H:500px");
        return;
      }

      if (bytesToMegaBytes > 2) {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error('Image size is too large and exceeds 2MBs'); return;
      }

      fileExtension = (this.ImageToUpload.name.substr((this.ImageToUpload.name.lastIndexOf('.') + 1)) || '').toLowerCase();
      // console.log("file to load2",this.ImageUrl_temp);
      if (fileExtension === "png") {
        fileExtension = "";
        //data.PromotionImage = this.ImageUrl.replace("data:image/png;base64,", "");
        image = this.ImageUrl.replace("data:image/png;base64,", "");
      } else if (fileExtension === "jpg" || fileExtension === "jpeg") {
        fileExtension = "";
        image = this.ImageUrl.replace("data:image/jpeg;base64,", "");
        image = this.ImageUrl.replace("data:image/jpg;base64,", "");
      } else if (fileExtension === "gif") {
        fileExtension = "";
        image = this.ImageUrl.replace("data:image/gif;base64,", "");
      }
    }

    image = this.ImageUrl_temp
    if (this.ProductPromotionID != null && image != null) {
      data.PromotionImage = image;
    } else if (this.ProductPromotionID != null && image == null) {
      data.PromotionImage = null;
    } else if (this.ProductPromotionID == null && image != null) {
      data.PromotionImage = image;
    } else {
      this.spinner.hide();
      this.toastr.error('Please Select an Image. Image is mandatory!'); return;
    }

    // (this.ProductPromotionID) ? data.isActive = this.isActive : 1;
    // data.isDeleted = 0;
    data.StartDateTime = startDateTime ? startDateTime : null;
    data.EndDateTime = endDateTime ? endDateTime : null;
    data.CreatedBy = this.loggedInUser.userid || -99,
      data.PromotionDetail = "";
    data.ProductPromotionID = this.ProductPromotionID;
    data.isShowDetail = this.isShowDetail ? 1 : 0;
    // data.LocIDs = branchIds;
    data.OrgCityIDs = cityIds;
    data.isActive = this.ProductPromotionID ? this.isActive : true;
    const propertiesToDelete = ["EndDate", "EndTime", "StartTime", "StartDate"];
    propertiesToDelete.forEach(property => {
      if (data.hasOwnProperty(property)) {
        delete data[property];
      }
    });
    // console.log('Data________', data);
    this.spinner.show(this.spinnerRefs.listSection);
    if (this.form.valid) {
      this._ppservice.addUpdateProductPromotion(data).subscribe((data: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.router.navigate(['marketing/products-promotion'])
          } else {
            this.toastr.error(data.Message)
          }
        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
      })
    }
    else {
      this.toastr.warning("Plese provide the required information", "Validation Error");
      this.spinner.hide(this.spinnerRefs.listSection);
    }

  }
  stopZero(value) {
    if (value == 0) {
      this.PromotionOrder = '';
    }
  }

  //////////Button Spinner/////////////////
  // ButtonSpinner(Input) {
  //   if (Input == "show") {
  //     this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
  //     this.isSpinner = false; // Show Spinner on submit button click
  //   }
  //   else if (Input == "hide") {
  //     this.disabledButton = false; // Unlock the Button after response
  //     this.isSpinner = true; // Hide Spinner after response    
  //   }
  // }

  // showSpinner() {
  //   this.spinner.show();
  //   setTimeout(() => {
  //     this.spinner.hide()
  //   }, 600);
  // }
  // hideSpinner() {
  //   this.spinner.hide();
  // }

  // onChange(fileInput: any) {
  //   const URL = window.URL || window.webkitURL;
  //   const Img = new Image();

  //   const filesToUpload = (fileInput.target.files);
  //   Img.src = URL.createObjectURL(filesToUpload[0]);

  //   Img.onload = (e: any) => {
  //     const height = e.path[0].height;
  //     const width = e.path[0].width;

  //     console.log("height and width ",height,width);
  // }
  // }
  // handleFileChange(event: any) {
  //   const file = event.target.files[0];
  //   const reader = new FileReader();

  //   reader.onload = (e: any) => {
  //     const image = new Image();
  //     image.src = e.target.result;

  //     image.onload = () => {
  //       this.Height = image.height;
  //       this.Width = image.width;
  //       // const height = image.height;
  //       // const width = image.width;
  //       // console.log('Height:', height);
  //       // console.log('Width:', width);
  //     };
  //   };

  //   reader.readAsDataURL(file);
  // }
  Height = 0;
  Width = 0;
  loadItemsImage(event) {
    const file = (event.target as HTMLInputElement).files[0];
        this.ImageToUpload = file;
      //Get image width and height
    const URL = window.URL || window.webkitURL;
    const Img = new Image();
    Img.src = URL.createObjectURL(file);
    Img.onload = (e: any) => {
      // const height = e.path[0].height;
      // const width = e.path[0].width;
    }
//Get image width and height
    this.ImageMaxSize = this.ImageToUpload.size;
        if (file && file.type) {
      if (file.type.indexOf('image/') == -1) {
        this.toastr.warning('File should be Image', 'Invalid File Type');
        return;
  }
    this.loadImage(file).then((response: any) => {
        event.target.value = '';
        this.ImageUrl = response.resizedImageData;
              
      });
      }
  }

  loadImage(file, fileName = 'file') {

    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageURL = reader.result as string;
        this.ImageUrl_temp = imageURL.replace('data:' + file.type + ';base64,', '');
        console.log("file to load",this.ImageUrl_temp);
        const _fileName = file.name || '';
        //_fileName = `${fileName}`;
        const _fileObject = {
          uniqueIdentifier: (+new Date()),
          fileName: _fileName,
          filtType: file.type || '',
          resizedImageData: '',
          data: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          thumbnail: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL).toString()
        };
        if (file.type.split('/')[0] == 'image' && file.type.split('/')[1] != 'svg+xml') { // resize only if it is image
          this.resizeImage(file, this.resizeFileSize.thumbnail.width,
             this.resizeFileSize.thumbnail.height, 0, '', imageURL).then((res: string) => {
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
    const promise = new Promise((resolve, reject) => {
      if (!file && !base64Data) {
        resolve('');
      }
      const fileLoader = new FileReader();
      const canvas = document.createElement('canvas');
      let context = null;
      const imageObj: any = new Image();
      let blob = null;

      // create a hidden canvas object we can use to create the new resized image data
      const canvas_id = 'hiddenCanvas_' + +new Date();
      canvas.id = canvas_id;
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      canvas.style.visibility = 'hidden';
      document.body.appendChild(canvas);

      if (base64Data) {
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
          this.Width = newSize.width;
          this.Height = newSize.height;
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
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  branchesList = [];
  getBranches() {
    this.branchesList = [];
    this.lookupService.GetBranches().subscribe((resp: any) => {
      const _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
    }, (err) => {
      console.log(err)
    })
  }
  citiesList = [];
  searchText = '';
  isFieldDisabled = false;
  getCitiesConditionally() {
    this.citiesList = [];
    if (this.urlID == null && this.PromotionFor == 4) {
      this.getProductPromotionCity()
    } else {
      this.getCities();
    }
  }
  getCities() {
    const param = { isHomeSamplingCity: null }
    this.citiesList = [];
    this.lookupService.getHCCities(param).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.citiesList = _response;
    }, (err) => {
      console.log(err)
    })
  }
  getProductPromotionCity() {
    const param = { PromotionFor: this.PromotionFor }
    this.citiesList = [];
    this.lookupService.getProductPromotionCity(param).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.citiesList = _response;
      console.log("Promotin cities are: ", this.citiesList)
    }, (err) => {
      console.log(err)
    })
  }
  branchIds: any[] = [];
  onSelectAllBranches() {
    this.branchIds = this.branchesList.map(branch => branch.LocId);
  }
  onUnselectAllBranches() {
    this.branchIds = [];
  }
  cityIds: any[] = [];
  onSelectAllCities() {
    this.cityIds = this.citiesList.map(city => city.CityID);
  }
  onUnselectAllCities() {
    this.cityIds = [];
  }
  selectAllCities(e) {
    this.citiesList.forEach(a => {
      // a.checked = false;
      if (a.CityID) {
        if (this.PromotionFor == 4) {
          a.checked = e.target.checked && !a.ProductCount;
        } else {
          a.checked = e.target.checked;
        }

      }
      // else{
      //   a.checked  = false;
      // }
    })

  }

  handleHourInput: () => void;
  handleMinuteInput: () => void;

  endHourHandlerChange() {
    const endHourElement: HTMLInputElement = document.querySelector(
      '[name="EndTime"] .ngb-tp-hour input'
    ) as HTMLInputElement;

    const endMinuteElement: HTMLInputElement = document.querySelector(
      '[name="EndTime"]  .ngb-tp-minute input'
    ) as HTMLInputElement;
    endHourElement.removeEventListener('input', this.handleHourInput);
    this.handleHourInput = () => {
      if (endHourElement.value.length === 2) {
        endMinuteElement.focus();
      }
    };
    endHourElement.addEventListener('input', this.handleHourInput);
    endMinuteElement.removeEventListener('input', this.handleMinuteInput);
    this.handleMinuteInput = () => {
      if (endMinuteElement.value.length === 0) {
        endHourElement.focus();
      }
    };
    endMinuteElement.addEventListener('input', this.handleMinuteInput);
  }
  startHourHandlerChange() {
    const startHourElement: HTMLInputElement = document.querySelector(
      '[name="StartTime"] .ngb-tp-hour input'
    ) as HTMLInputElement;

    const startMinuteElement: HTMLInputElement = document.querySelector(
      '[name="StartTime"] .ngb-tp-minute input'
    ) as HTMLInputElement;

    startHourElement.removeEventListener('input', this.handleHourInput);
    this.handleHourInput = () => {
      if (startHourElement.value.length === 2) {
        startMinuteElement.focus();
      }
    };
    startHourElement.addEventListener('input', this.handleHourInput);
    startMinuteElement.removeEventListener('input', this.handleMinuteInput);
    this.handleMinuteInput = () => {
      if (startMinuteElement.value.length === 0) {
        startHourElement.focus();
      }
    };
    startMinuteElement.addEventListener('input', this.handleMinuteInput);
  }

  // hourHandlerChange(){
  //    const inputFields = document.querySelectorAll('.ngb-tp .ngb-tp-hour input');
  // inputFields.forEach((inputField, index) => {
  //   inputField.addEventListener('input', () => {
  //     const currentInput = inputField as HTMLInputElement;
  //     if (currentInput.value.length === 1 && index < inputFields.length - 1) {
  //       (inputFields[index + 1] as HTMLInputElement).focus();
  //     } else if (currentInput.value.length === 0 && index > 0) {
  //       (inputFields[index - 1] as HTMLInputElement).focus();
  //     }
  //   });
  // });
  // }
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

  dmyEnum = [
    { id: 1, name: 'day(s)' },
    { id: 2, name: 'mon(s)' },
    { id: 3, name: 'yr(s)' }
  ];
  PromotionAge = 0;
  dmy: any = 1;
  ageChange(value) {
    if (value == 0) {
    }
    else {
      const _calculatedDob = this.calculateDOB(value, this.dmy);
      this.EndDate = _calculatedDob;
      console.log("end date from days field is: ", this.EndDate)
    }
  }

  dmyChange(value) {
    if ((value == 2 || value == 3) && !this.PromotionAge) {
      this.PromotionAge = 1;
    }
    const _calculatedDob = this.calculateDOB(this.PromotionAge, value);
    this.EndDate = _calculatedDob
    console.log("end date from ymd dropdown is: ", this.EndDate)
  }

  calculateDOB(number, dmy) {
    const startDateTime = (this.StartDate && this.StartTime) ? Conversions.mergeDateTime(this.StartDate, this.StartTime) : null;

    const inputDate = startDateTime;

    // Parse the input date with the initial format
    const parsedDate = moment(inputDate, 'MM/DD/YYYY HH:mm:ss.SSS');

    // Format the date in the desired format
    const formattedDate = parsedDate.format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)');


    let dob: any = formattedDate//new Date();
    console.log("dob ==============", dob)


    console.log(formattedDate)

    console.log("start date ==============", formattedDate)

    dmy = dmy || '3';
    if (dmy == '1') {
      dob = moment(dob).add(number, 'days')
    } else if (dmy == '2') {
      dob = moment(dob).add(number, 'months')
    } else if (dmy == '3') {
      dob = moment(dob).add(number, 'years')
    }
    const calculatedDob = { day: moment(dob).get('date'), month: (moment(dob).get('month') + 1), year: moment(dob).get('year') };
    return calculatedDob;
  }
  ngAfterViewInit() {
    const formVal = this.dmy;
    this.StartDate.valueChanges.subscribe(val => {
      const selectedDob = new Date(val.year, val.month - 1, val.day); 
      const _ageObj = this.calculateAge(selectedDob);
        this.PromotionAge=_ageObj.years ? _ageObj.years : _ageObj.months ? _ageObj.months : _ageObj.days
        this.dmy = _ageObj.years ? '3' : _ageObj.months ? '2' : _ageObj.days || formVal.dmy == 1 ? '1' : '3'
    });

  }
  calculateAge(birthday) {
    const obj = { days: 0, months: 0, years: 0 }
    if (!moment(birthday).isValid()) {
      return obj;
    }

    const oneDay = 24 * 60 * 60 * 1000; 
    const bday: any = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()); //(2021, 3, 2);
    const currentDate: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
    if (diffDays > 364) {
      obj.years = Math.floor(diffDays / 364);
    } else if (diffDays >= 30) {
      obj.months = Math.floor(diffDays / 30);
    }
    else if (diffDays == 0 && this.dmy == '3') {
      const _calculatedDob = this.calculateDOB(1, this.dmy);
      obj.years = Math.floor(1);
        this.EndDate = _calculatedDob;
    }
    else if (diffDays == 0 && this.dmy == '2') {
      obj.months = Math.floor(1);
    }
    else if (diffDays == 0 && this.dmy == '1') {
      const _calculatedDob = this.calculateDOB(1, this.dmy);
      obj.days = Math.floor(1);
       this.EndDate = _calculatedDob;
    }
    else {
      obj.days = diffDays;
    }
    return obj;
  }

  switchEndDate(StartDate){
    if(StartDate){
      this.minEndDate = Conversions.getDateObjectByGivenDate(StartDate);
    }
    else{
      this.minStartDate = Conversions.getCurrentDateObject();
      this.minEndDate = Conversions.getCurrentDateObject();
    }
    
  }
}
