// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild } from '@angular/core';
// import { CookieService } from 'ngx-cookie-service'; 
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NewsEventsService } from '../../services/news-events.service'
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';


@Component({
  standalone: false,

  selector: 'app-addupdate-news-events',
  templateUrl: './addupdate-news-events.component.html',
  styleUrls: ['./addupdate-news-events.component.scss']
})
export class AddupdateNewsEventsComponent implements OnInit {

  urlPattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?";
  
  @ViewChild('frmPromotion') form;
  NewsAndEventsRow: any = [];
  ImageToUpload: File = null
  ImageUrl: any;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  pageHeader : any='';
  urlID:any=null;
  NewsAndEventsID:any=null;
  NewsAndEventsIDEnc:any = null;
  NewsAndEventsTitle: any = "";
  NewsAndEventsLink: any = "";
  IsValidUser:any=null;
  ImageMaxSize: number;
  patientBasicInfo:any;
  ImageUrl_temp: any;
  DisplayOrder:any;

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
    formSection:'formSection'
  }

  constructor(
    private _newsService: NewsEventsService,
      private toastr: ToastrService,
      private route:ActivatedRoute, 
      private spinner:NgxSpinnerService,
      private helper: HelperService,
      private router: Router,
      // private cookieService: CookieService,
      // private storageService: StorageService,
      private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.urlID =  this.route.snapshot.params['id'] ? this.route.snapshot.params['id'] : null;
    this.newsAndEvents(this.urlID);
    // if(this.cookieService.get('isLoggedIn') || this.storageService.isLoggedIn()){
    //   this.IsValidUser=1
    //   if(this.urlID==null){
    //     this.pageHeader ='Add News and Events';
    //   }else{
    //     this.pageHeader ='Update News and Events';
    //   }
    // }else{
    //   this.router.navigate(['/products-promotion/news-events-listing']);
    // }
  }

  newsAndEvents(id) {
    this.spinner.show(this.spinnerRefs.listSection);
    this.NewsAndEventsIDEnc=id;
    // this.spinner.show();;
    let response = [];
    const Params = {
      NewsAndEventsIDEnc: id
    }
    if(!Params.NewsAndEventsIDEnc) {
      this.NewsAndEventsRow = [];
      this.spinner.hide(this.spinnerRefs.listSection);
      return;
    } else{
      this._newsService.getNewsAndEvents(Params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        response = JSON.parse(resp.PayLoadStr);
        response = this.helper.promotionImagesData(response);
        this.NewsAndEventsRow = response;
        this.NewsAndEventsTitle =  this.NewsAndEventsRow[0].NewsAndEventsTitle;
        this.NewsAndEventsLink =  this.NewsAndEventsRow[0].NewsAndEventsLink;
        this.NewsAndEventsID =  this.NewsAndEventsRow[0].NewsAndEventsID;
        this.NewsAndEventsIDEnc =  this.NewsAndEventsRow[0].NewsAndEventsIDEnc;
      }, (err) => {
        console.log(err);
      })
    }
    
  }
  
  handelFileImput(file: FileList) {
    this.ImageToUpload = file.item(0);
    this.ImageMaxSize = this.ImageToUpload.size;
    // Show image preview
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.ImageUrl = event.target.result;
    }
    reader.readAsDataURL(this.ImageToUpload);
  }

 



  //Add Update News and Events
  addUpdateNewsAndEvents(data) { 
    const bytesToMegaBytes = this.ImageMaxSize / (1024 ** 2);
    let fileExtension = "";
    let image=null;
    if(this.ImageToUpload !=null){
      if(bytesToMegaBytes > 2){
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error('Image size is too large and exceeds 2MBs'); return;
      }
      fileExtension = (this.ImageToUpload.name.substr((this.ImageToUpload.name.lastIndexOf('.') + 1)) || '').toLowerCase();
      if (fileExtension === "png") {
        fileExtension = "";
        //data.NewsEvetImage = this.ImageUrl.replace("data:image/png;base64,", "");
        image = this.ImageUrl.replace("data:image/png;base64,", "");
      } else if (fileExtension === "jpg" || fileExtension==="jpeg") {
        fileExtension = "";
        image  = this.ImageUrl.replace("data:image/jpeg;base64,", "");
      }else if (fileExtension === "gif") {
        fileExtension = "";
        image = this.ImageUrl.replace("data:image/gif;base64,", "");
      }
      // image = this.ImageUrl;
    }
    // image = this.ImageUrl;
    image = this.ImageUrl_temp ;
    if(this.NewsAndEventsID!=null && image!=null){
      data.NewsAndEventsImage = image;
    }else if(this.NewsAndEventsID!=null && image==null){
      data.NewsAndEventsImage=null;
    }else if(this.NewsAndEventsID==null && image!=null){
      data.NewsAndEventsImage = image;
    }else{
      this.toastr.error('Please Select an Image. Image is mandatory!'); return;
    }
    
    data.isActive = 1;
    data.isDeleted = 0;
    data.CreatedBy = -1 //this.storageService.getLoggedInUserProfile().userid;
    data.NewsAndEventsID=this.NewsAndEventsID;
    this.spinner.show(this.spinnerRefs.listSection);
    if (this.form.valid) {
      this._newsService.addUpdateNewsAndEvents(data).subscribe((data: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.router.navigate(['marketing/news-events-listing'])
          } else {
            this.toastr.error(data.Message)
          }
        }
      },(err)=>{
        this.spinner.hide(this.spinnerRefs.listSection);
      })
    }
    else {
      alert("Not Validated")
    }

  }


  loadNewsEventImage(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.ImageToUpload = file;
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
        this.ImageUrl_temp = imageURL;
        //.replace('data:'+file.type+';base64,','');
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
  stopZero(value){
    if(value==0){
     this.DisplayOrder='';
    }
   }

}
