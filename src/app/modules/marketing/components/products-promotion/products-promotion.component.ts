// @ts-nocheck
import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
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
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NgForm } from '@angular/forms';


@Component({
  standalone: false,

  selector: 'app-products-promotion',
  templateUrl: './products-promotion.component.html',
  styleUrls: ['./products-promotion.component.scss']
})
export class ProductsPromotionComponent implements OnInit {
  IsValidUser: any = null;
  // this.route.snapshot.paramMap.get('id')
  ProductsPromotionsList = []
  NewsEventsList = []
  isSpinner: boolean = true;//Hide Loader
  ProductPromotionID = null;
  Action = null;
  productPromotionMessage = 'No Recored found';
  @ViewChild('deletepromotionview') deletepromotionview;
  @ViewChild('authenticateAdmin') authenticateAdmin;
  username: any = "";
  password: any = "";
  disabledButtonModal: boolean = false; // Button Enabled / Disables [By default Enabled]
  checked
  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    // private storage: StorageService,
    private cookieService: CookieService,
    private modalService: NgbModal,
    private _ppservice: ProductsPromotionService,
    private helper: HelperService,
    private lookupService: LookupService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> you want to delete?', // 'Are you sure?',
    popoverMessage: 'You will not be able to recover it!',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  spinnerRefs = {
    listSection: 'listSection',
    listCitySection: 'listCitySection',
    formSection: 'formSection'
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    if (this.cookieService.get('isLoggedIn') || this.auth.isLoggedIn()) {
      this.IsValidUser = 1
      this.productPromotions();
    } else {
      this.IsValidUser = null;
      setTimeout(() => {
        this.modalService.open(this.authenticateAdmin, { size: 'md', scrollable: true })
      }, 500);
    }


    this.urlID = null // this.route.snapshot.params['id'] ? this.route.snapshot.params['id'] : null;
    if (this.urlID == null) {
      this.getProductPromotionCity()
      this.pageHeader = 'Add Product Promotion';
    } else {
      this.getCities();
      this.pageHeader = 'Update Product Promotion';
    }

    

    // this.productPromotion(this.urlID,);
    if (this.cookieService.get('isLoggedIn') || this.auth.isLoggedIn()) {
      this.IsValidUser = 1
    } else {
      this.router.navigate(['/products-promotion/products-promotion']);
    }
    // this.StartDate = Conversions.getCurrentDateObject();
    // this.EndDate = Conversions.getEndDateObjectNew();
    
    this.StartDate = Conversions.getCurrentDateObject();
    this.EndDate = Conversions.getEndDateObjectNew();
    this.StartTime = { hour: 0, minute: 0, second: 0 };
    this.EndTime = { hour: 23, minute: 59, second: 59 };
    setTimeout(() => {
      let dStart =  Conversions.formatDateObject(this.StartDate);
      let dEnd =  Conversions.formatDateObject(this.EndDate);
      let startDate = moment(dStart);
      let endDate = moment(dEnd);
      let duration = moment.duration(endDate.diff(startDate));
      this.PromotionAge = duration.asDays();
      this.endHourHandlerChange();
    this.startHourHandlerChange();
    }, 200);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ForActive = 1;
  productPromotions() {
    //this.showSpinner();
    this.spinner.show(this.spinnerRefs.listSection);
    let response = [];
    let Params = {
      ProductPromotionID: null,
      ForActive: this.ForActive,
      ShowImage: 1
    }
    this.productPromotionMessage = 'Please wait while data is loading...';
    this._ppservice.getProductPromotions(Params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      response = JSON.parse(resp.PayLoadStr);
      // response = this.helper.promotionImagesData(response);
      response = this.helper.promotionThumbnailImagesData(response);
      this.ProductsPromotionsList = response;
      if (!this.ProductsPromotionsList.length) {
        this.productPromotionMessage = 'No Recored found';
      }
      // this.hideSpinner();
    }, (err) => {
      this.spinner.hide();
      this.productPromotionMessage = 'error loading data';
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log(err);
    })
  }

  openDeletePromotionModal(id, action) {
    this.ProductPromotionID = id;
    this.Action = action;
    this.modalService.open(this.deletepromotionview, { size: 'sm', scrollable: true })
  }

  // id is ProductPromotionID, action(1.Deletion, 2.Active, 3.Inactive)
  deleteProductPromotion(id, action) {
    this.spinner.show();
    let data: any = {
      ProductPromotionID: id,
      DeleteActive: action,
      ModifiedBy: this.loggedInUser.userid || -99,
    };
    this._ppservice.deleteActivate(data).subscribe((data: any) => {
      this.spinner.hide();
      if (data.StatusCode == 200) {
        this.resetForm();
        if (action == 1) {
          this.toastr.success('Item Deleted Successfully');
          this.ProductsPromotionsList = this.ProductsPromotionsList.filter(a => a.ProductPromotionID != id);
        } else if (action == 2) {
          this.toastr.success('Item Activated Successfully');
          this.productPromotions();
        } else {
          this.toastr.success('Item Deactivated Successfully');
          this.productPromotions();
        } 
        // this.closeLoginModal();
      } else {
        this.toastr.error('Something went wrong! Please contact system support');
      }
    }, (err) => {
      this.spinner.hide();
    })
  }

  changeDetailVisibality(row, event) {
    // console.log(event.checked)
    let dataObj = {
      ProductPromotionID: row.ProductPromotionID,
      PromotionTitle: row.PromotionTitle,
      PromotionDescription: row.PromotionDescription,
      PromotionDetail: row.PromotionDetail,
      PromotionURL: row.PromotionURL,
      // PromotionImage  : row.PromotionImage,
      PromotionOrder: row.PromotionOrder,
      isActive: row.isActive,
      CreatedBy: this.loggedInUser.userid || -99,
      PromotionFor: row.PromotionFor,
      isShowDetail: event.checked ? 1 : 0
    }
    this._ppservice.addUpdateProductPromotion(dataObj).subscribe((data: any) => {
      this.spinner.hide();
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          this.toastr.success("Item Description visibility changed successfully");
          // this.productPromotions();
        } else {
          this.toastr.error(data.Message)
        }
      }
    })

  }
  activeDeactiveItem(id, event) {
    if (event == true) {
      this.deleteProductPromotion(id, 2);
    } else {
      this.deleteProductPromotion(id, 3);
    }
  }

  openLoginModal() {
    this.modalService.open(this.authenticateAdmin, { size: 'md', scrollable: true })
  }
  Login() {
    if (this.username == 'admin@idcmarketting' && this.password == 'Admin@idcmkt!') {
      const dateNow = new Date();
      dateNow.setMinutes(dateNow.getMinutes() + 5);
      this.cookieService.set('isLoggedIn', 'true', dateNow);
      this.productPromotions();
      this.IsValidUser = 1;
      this.modalService.dismissAll();
    } else if (this.username == "" && this.password == "") {
      this.toastr.error('Please Provide Username & Password');
    } else if (this.username == "") {
      this.toastr.error('Please Provide Usernam');
    } else if (this.password == "") {
      this.toastr.error('Please Provide Password');
    } else {
      this.toastr.error('Invalid Username Or Password');
    }
  }

  closeLoginModal() {
    this.modalService.dismissAll();
    // this.ButtonSpinner('hide');
    this.spinner.hide();
  }
  
  

























  
  urlPattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?";

  @ViewChild('frmPromotion') form;
  ProductsPromotionsRow: any = [];
  ImageToUpload: File = null
  ImageUrl: any;
  ImageUrl_temp: any;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  pageHeader: any = '';
  urlID: any = null;
  ProductPromotionIDEnc: any = null;
  PromotionTitle: any = "";
  PromotionURL: any = "";
  PromotionOrder: any = "";
  PromotionFor: any = 1;
  PromotionDescription: any = "";
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

  resizeFileSize_bak_old = {
    thumbnail: {
      width: 200,
      height: 200
    },
    width: 500,
    height: 500
  }
  resizeFileSize = {
    thumbnail: {
      width: 90,
      height: 90
    },
    width: 500,
    height: 500
  }
 
  // ngOnInit(): void {
  //   this.urlID = this.route.snapshot.params['id'] ? this.route.snapshot.params['id'] : null;
  //   if (this.urlID == null) {
  //     this.getProductPromotionCity()
  //     this.pageHeader = 'Add Product Promotion';
  //   } else {
  //     this.getCities();
  //     this.pageHeader = 'Update Product Promotion';
  //   }

  //   this.loadLoggedInUserInfo();
  //   this.endHourHandlerChange();
  //   this.startHourHandlerChange();
  //   // this.getBranches();


  //   this.productPromotion(this.urlID);
  //   if (this.cookieService.get('isLoggedIn') || this.auth.isLoggedIn()) {
  //     this.IsValidUser = 1
  //     // if (this.urlID == null) {
  //     //   this.getProductPromotionCity()
  //     //   this.pageHeader = 'Add Product Promotion';
  //     // } else {
  //     //   this.getCities();
  //     //   this.pageHeader = 'Update Product Promotion';
  //     // }
  //   } else {
  //     this.router.navigate(['/products-promotion/products-promotion']);
  //   }
  //   this.minStartDate= Conversions.getCurrentDateObject();
  //   this.minEndDate= Conversions.getCurrentDateObject();
  // }

  isDisabledPromotionFor = false;
  existingActiveValue = null;
  allCitiesAreChecked = false;
  rowIndex = null;
  productPromotion(id,index) {
    this.Thumbnail = null;
    this.urlID = id;
    this.rowIndex = index;
    this.ProductPromotionID = id;
    this.spinner.show(this.spinnerRefs.listSection);
    this.ProductPromotionIDEnc = id;
    // this.spinner.show();;
    let response = [];
    let Params = {
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
        response = this.helper.promotionThumbnailImagesData(response);
        this.ProductsPromotionsRow = response;
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
        this.ProductPromotionIDEnc = this.ProductsPromotionsRow[0].ProductPromotionIDEnc;
        this.isActive = this.ProductsPromotionsRow[0].isActive;
        this.isShowDetail = this.ProductsPromotionsRow[0].isShowDetail;
        this.Thumbnail = this.ProductsPromotionsRow[0].PromotionImageThumbnail;
        this.ImageUrl = this.ProductsPromotionsRow[0].PromotionImage;
        this.dmy = this.ProductsPromotionsRow[0].DMY;
        // this.branchIds = this.ProductsPromotionsRow[0].LocIDs.substring(0, this.ProductsPromotionsRow[0].LocIDs.length - 1).split(',').map(id => parseInt(id.trim(), 10));
        // this.cityIds = this.ProductsPromotionsRow[0].OrgCityIDs.substring(0, this.ProductsPromotionsRow[0].OrgCityIDs.length - 1).split(',').map(id => parseInt(id.trim(), 10));
        this.cityIds = this.ProductsPromotionsRow[0].OrgCityIDs.substring(0, this.ProductsPromotionsRow[0].OrgCityIDs.length - 1).split(',').map(id => parseInt(id.trim(), 10));
        let incCityIds = this.ProductsPromotionsRow[0].OrgCityIDs.substring(0, this.ProductsPromotionsRow[0].OrgCityIDs.length - 1).split(',');
        // this.isDisabledPromotionFor = this.ProductsPromotionsRow[0].PromotionFor == 4 ? true : false;
        this.isDisabledPromotionFor = true;
        this.citiesList.forEach(city => {
          city.checked = incCityIds.includes(city.CityID.toString());
        });
        this.allCitiesAreChecked = this.citiesList.every(city => {
          return city.checked && incCityIds.includes(city.CityID.toString());
        });
        setTimeout(() => {
        // console.log("citiesList is ________",this.citiesList)
          
        }, 200);
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
    let checkedCities = this.citiesList.filter(a => a.checked);
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
    let startDateTimeString = (this.StartDate && this.StartTime) ? Conversions.mergeDateTime(this.StartDate, this.StartTime) : null;
    let endDateTimeString = (this.EndDate && this.EndTime) ? Conversions.mergeDateTime(this.EndDate, this.EndTime) : null;

    let startDateTimeDate = new Date(startDateTimeString);
    let endDateTimeDate = new Date(endDateTimeString);

    // console.log("start date: ",startDateTime, "end date: ",endDateTime);return;
    if(startDateTimeDate>endDateTimeDate){
      this.endDateGreaterValidation = true;
      this.toastr.error("End DateTime should be greater then the Start DateTime","Date Validation Error")
      return;
    }else{
      this.endDateGreaterValidation=false;
    }
    // let branchIds = this.branchIds.join(",");
    //let cityIds = this.cityIds.join(",");
    let bytesToMegaBytes = this.ImageMaxSize / (1024 ** 2);
    var fileExtension = "";
    var fileExtensionImg = "";
    var fileExtensionThumb = "";
    let image = null;
    let imageThumb = null;
    if (this.ImageToUpload != null) {
      if (this.PromotionFor == 4 && (this.Width > 300 || this.Height > 500)) {
        this.toastr.error("Image exceeds the maximum values of dimensions, W:" + this.Width + " H:" + this.Height, "Max W:300px, Max H:500px");
        return;
      }

      if (bytesToMegaBytes > 2) {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error('Image size is too large and exceeds 2MBs'); return;
      }

      // fileExtension = (this.ImageToUpload.name.substr((this.ImageToUpload.name.lastIndexOf('.') + 1)) || '').toLowerCase();
      // fileExtensionImg = (this.ImageUrl.name.substr((this.ImageToUpload.name.lastIndexOf('.') + 1)) || '').toLowerCase();
      // fileExtensionThumb = (this.Thumbnail.name.substr((this.ImageToUpload.name.lastIndexOf('.') + 1)) || '').toLowerCase();
      // console.log("fileExtension___________",fileExtension);
      // console.log("fileExtensionImg______",fileExtensionImg);
      // console.log("fileExtensionThumb___________",fileExtensionThumb);
      // // console.log("file to load2",this.ImageUrl_temp);
      // if (fileExtension === "png") {
      //   fileExtension = "";
      //   //data.PromotionImage = this.ImageUrl.replace("data:image/png;base64,", "");
      //   image = this.ImageUrl.replace("data:image/png;base64,", "");
      //   imageThumb = this.Thumbnail.replace("data:image/png;base64,", "");
      // } else if (fileExtension === "jpg" || fileExtension === "jpeg") {
      //   fileExtension = "";
      //   image = this.ImageUrl.replace("data:image/jpg;base64,", "");
      //   image = this.ImageUrl.replace("data:image/jpeg;base64,", "");
      //   imageThumb = this.Thumbnail.replace("data:image/jpg;base64,", "");
      //   imageThumb = this.Thumbnail.replace("data:image/jpeg;base64,", "");
      // } else if (fileExtension === "gif") {
      //   fileExtension = "";
      //   image = this.ImageUrl.replace("data:image/gif;base64,", "");
      //   imageThumb = this.Thumbnail.replace("data:image/gif;base64,", "");
      // }
      image = this.ImageUrl.replace(/^data:image\/[a-z]+;base64,/, '');
      imageThumb = this.Thumbnail.replace(/^data:image\/[a-z]+;base64,/, '');
    }
    // image = this.ImageUrl_temp
    //handling promotion image with edit
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

    //  handel promotion image thumbnail with edit

    //comment to remove the error
    // if (this.ProductPromotionID && imageThumb != null) {
      data.PromotionImageThumbnail = imageThumb;
    // } else if (this.ProductPromotionID && !imageThumb) {
    //   data.PromotionImageThumbnail = null;
    // } else if (this.ProductPromotionID  && imageThumb) {
    //   data.PromotionImageThumbnail = imageThumb;
    // } 


    // console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaaa: ",data);//return;
    // else {
    //   this.spinner.hide();
    //   this.toastr.error('Please Select an Image. Image is mandatory!'); return;
    // }

    // data.PromotionImageThumbnail = imageThumb;
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
    data.isActive = true;//this.ProductPromotionID ? this.isActive : true;
    data.DMY = this.dmy;
    const propertiesToDelete = ["EndDate", "EndTime", "StartTime", "StartDate"];
    propertiesToDelete.forEach(property => {
      if (data.hasOwnProperty(property)) {
        delete data[property];
      }
    });
    if (this.form.valid) {
      console.log("Image thumbnail and image data to save: ",data)
      this.spinner.show(this.spinnerRefs.listSection);
      this.disabledButton = true; 
      this.isSpinner = false;
      this._ppservice.addUpdateProductPromotion(data).subscribe((data: any) => {
        this.disabledButton = false; 
        this.isSpinner = true;
        this.spinner.hide(this.spinnerRefs.listSection);
        // if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.resetForm();
            this.productPromotions();
            // this.router.navigate(['marketing/products-promotion'])
          } else {
            this.disabledButton = false; 
            this.isSpinner = true;
            this.toastr.error(data.Message)
          }
        // }
      }, (err) => {
        this.disabledButton = false; 
        this.isSpinner = true;
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
  Height: number = 0;
  Width: number = 0;
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
        // this.ImageUrl = response.resizedImageData; bak old
        this.ImageUrl = response.data;
        this.Thumbnail = response.thumbnail;
      });
      }
  }
  Thumbnail: any;
  loadImage(file, fileName = 'file') {
    let promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let imageURL = reader.result as string;
        this.ImageUrl_temp = imageURL.replace('data:' + file.type + ';base64,', '');
        let _fileName = file.name || fileName || '';
        if (_fileName.length > 50) {
          _fileName = (_fileName || '').toString().substring(0, 50);
        }
        //_fileName = `${fileName}`;
        let _fileObject = {
          docId: null,
          uniqueIdentifier: (+new Date()),
          fileName: _fileName,
          fileType: file.type || 'image/png',
          data: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          sanitizedThumbnail: this.sanitizer.bypassSecurityTrustResourceUrl(''),
          thumbnail: '', //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL).toString()
        };
        if (file.type.split('/')[0] == 'image' && file.type.split('/')[1] != 'svg+xml') { // resize only if it is image
          this.resizeImage(file, this.resizeFileSize.thumbnail.width, this.resizeFileSize.thumbnail.height, 0, '', imageURL).then((res: string) => {
            _fileObject.thumbnail = res;
            _fileObject.sanitizedThumbnail = this.sanitizer.bypassSecurityTrustResourceUrl(res);
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

  loadImage_bak(file, fileName = 'file') {

    let promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let imageURL = reader.result as string;
        this.ImageUrl_temp = imageURL.replace('data:' + file.type + ';base64,', '');
        let _fileName = file.name || '';
        //_fileName = `${fileName}`;
        let _fileObject = {
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
    let promise = new Promise((resolve, reject) => {
      if (!file && !base64Data) {
        resolve('');
      }
      const fileLoader = new FileReader();
      const canvas = document.createElement('canvas');
      let context = null;
      const imageObj: any = new Image();
      let blob = null;

      // create a hidden canvas object we can use to create the new resized image data
      let canvas_id = 'hiddenCanvas_' + +new Date();
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
      let _response = resp.PayLoad;
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
    let param = { isHomeSamplingCity: null }
    this.citiesList = [];
    this.lookupService.getHCCities(param).subscribe((resp: any) => {
      let _response = resp.PayLoad;
      this.citiesList = _response;
    }, (err) => {
      console.log(err)
    })
  }
  getProductPromotionCity() {
    let param = { PromotionFor: this.PromotionFor }
    this.citiesList = [];
    this.lookupService.getProductPromotionCity(param).subscribe((resp: any) => {
      let _response = resp.PayLoad;
      this.citiesList = _response;
      // console.log("Promotin cities are: ", this.citiesList)
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
      let _calculatedDob = this.calculateDOB(value, this.dmy);
      this.EndDate = _calculatedDob;
    }
  }

  dmyChange(value) {
    if ((value == 2 || value == 3) && !this.PromotionAge) {
      this.PromotionAge = 1;
    }
    let _calculatedDob = this.calculateDOB(this.PromotionAge, value);
    this.EndDate = _calculatedDob;
  }

  calculateDOB(number, dmy) {
    let startDateTime = (this.StartDate && this.StartTime) ? Conversions.mergeDateTime(this.StartDate, this.StartTime) : null;

    let inputDate = startDateTime;

    // Parse the input date with the initial format
    let parsedDate = moment(inputDate, 'MM/DD/YYYY HH:mm:ss.SSS');

    // Format the date in the desired format
    let formattedDate = parsedDate.format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)');
    let dob: any = formattedDate//new Date();
    dmy = dmy || '3';
    if (dmy == '1') {
      dob = moment(dob).add(number, 'days')
    } else if (dmy == '2') {
      dob = moment(dob).add(number, 'months')
    } else if (dmy == '3') {
      dob = moment(dob).add(number, 'years')
    }
    let calculatedDob = { day: moment(dob).get('date'), month: (moment(dob).get('month') + 1), year: moment(dob).get('year') };
    return calculatedDob;
  }
  ngAfterViewInit() {
    let formVal = this.dmy;
    if(this.StartDate?.property !== undefined){
      this.StartDate.valueChanges.subscribe(val => {
        let selectedDob = new Date(val.year, val.month - 1, val.day); 
        let _ageObj = this.calculateAge(selectedDob);
          this.PromotionAge=_ageObj.years ? _ageObj.years : _ageObj.months ? _ageObj.months : _ageObj.days
          this.dmy = _ageObj.years ? '3' : _ageObj.months ? '2' : _ageObj.days || formVal.dmy == 1 ? '1' : '3'
      });
    }
  }

  calculateAge(birthday) {
    let obj = { days: 0, months: 0, years: 0 }
    if (!moment(birthday).isValid()) {
      return obj;
    }

    let oneDay = 24 * 60 * 60 * 1000; 
    let bday: any = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()); //(2021, 3, 2);
    let currentDate: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    let diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
    if (diffDays > 364) {
      obj.years = Math.floor(diffDays / 364);
    } else if (diffDays >= 30) {
      obj.months = Math.floor(diffDays / 30);
    }
    else if (diffDays == 0 && this.dmy == '3') {
      let _calculatedDob = this.calculateDOB(1, this.dmy);
      obj.years = Math.floor(1);
        this.EndDate = _calculatedDob;
    }
    else if (diffDays == 0 && this.dmy == '2') {
      obj.months = Math.floor(1);
    }
    else if (diffDays == 0 && this.dmy == '1') {
      let _calculatedDob = this.calculateDOB(1, this.dmy);
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

  resetForm(){
    // this.form.resetForm();
    this.isDisabledPromotionFor=null;
    this.PromotionFor=1;
    this.rowIndex = null;
    this.ProductsPromotionsRow =[];
    this.urlID = null;
    this.ProductPromotionIDEnc = null;
    this.PromotionTitle = "";
    this.PromotionURL = "";
    this.PromotionOrder = "";
    this.PromotionDescription = "";
    this.PromotionFor = 1;
    // this.isActive = null;

    this.citiesList.forEach(a => {
      a.checked = false;
    })
    
    setTimeout(() => {
      this.StartDate = Conversions.getCurrentDateObject();
      this.EndDate = Conversions.getEndDateObjectNew();
      this.StartTime = { hour: 0, minute: 0, second: 0 };
      this.EndTime = { hour: 23, minute: 59, second: 59 };
      let dStart =  Conversions.formatDateObject(this.StartDate);
      let dEnd =  Conversions.formatDateObject(this.EndDate);
      let startDate = moment(dStart);
      let endDate = moment(dEnd);
      let duration = moment.duration(endDate.diff(startDate));
      this.PromotionAge = duration.asDays();
      this.PromotionFor = 1;
    }, 200);
  }

  tabSelected(event: MatTabChangeEvent): void {
    let selectedIndex = event.index;
    if (selectedIndex === 0) {
      this.ForActive = 1
      this.resetForm();
      this.productPromotions();
    } else if (selectedIndex === 1) {
      this.ForActive = 0;
      this.resetForm();
      this.productPromotions();
    }
  }
  
}
