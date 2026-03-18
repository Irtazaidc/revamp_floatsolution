// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service'; 
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NewsEventsService } from '../../services/news-events.service'

@Component({
  standalone: false,

  selector: 'app-news-events',
  templateUrl: './news-events.component.html',
  styleUrls: ['./news-events.component.scss']
})
export class NewsEventsComponent implements OnInit {
  IsValidUser:any=null;
  // this.route.snapshot.paramMap.get('id')
  ProductsPromotionsList = []
  NewsEventsList = []
  isSpinner: boolean = true;//Hide Loader
  ProductPromotionID=null;
  Action=null;
  newsAndEventsMessage = 'No Recored found';
  @ViewChild('deletepromotionview') deletepromotionview;
  @ViewChild('authenticateAdmin') authenticateAdmin;
  username: any = "";
  password: any = "";
  disabledButtonModal: boolean = false; // Button Enabled / Disables [By default Enabled]
  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    // private storage: StorageService,
    private cookieService: CookieService,
    private modalService: NgbModal,
    private _newsService: NewsEventsService,
    // private helper: HelperService
  ) { }


  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> you want to delete?', // 'Are you sure?',
    popoverMessage: 'You will not be able to recover it!',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }

  ngOnInit(): void {
    if(1){ // (this.cookieService.get('isLoggedIn')){
      this.IsValidUser=1
      this.newsAndEvents();
    }else{
      this.IsValidUser=null;
      setTimeout(() => {
        this.modalService.open(this.authenticateAdmin, { size: 'md', scrollable: true })
      }, 500);
    }
  }

  newsAndEvents() {
    this.spinner.show();
    let response = [];
    let Params = {
      NewsAndEventsID: null,
      ForActive:null
    }
    this.newsAndEventsMessage = 'Please wait while data is loading...';
    this._newsService.getNewsAndEvents(Params).subscribe((resp: any) => {
      this.spinner.hide();
      response = JSON.parse(resp.PayLoadStr);
      // response = this.helper.addPrefixToPic(response, 'NewsAndEventsPic');
      this.NewsEventsList = response||[];
      // console.warn('News and Events list is: ',this.NewsEventsList);
      if(!this.NewsEventsList.length){
        this.newsAndEventsMessage = 'No Recored found';
      }
    }, (err) => {
      this.spinner.hide();
      this.newsAndEventsMessage = 'Error occured while loading data! Please contact system support';
      console.log(err);
    })
  }

  openLoginModal(){
    this.modalService.open(this.authenticateAdmin, { size: 'md', scrollable: true })
   }
   Login(){
     if(this.username=='admin@idcmarketting' && this.password=='Admin@idcmkt!'){
      const dateNow = new Date();
      dateNow.setMinutes(dateNow.getMinutes() + 5);
      this.cookieService.set('isLoggedIn', 'true', dateNow);
      this.newsAndEvents();
      this.IsValidUser=1;
      this.modalService.dismissAll();
     }else if(this.username=="" && this.password==""){
      this.toastr.error('Please Provide Username & Password');
     }else if(this.username==""){
      this.toastr.error('Please Provide Usernam');
     }else if(this.password==""){
      this.toastr.error('Please Provide Password');
     }else{
      this.toastr.error('Invalid Username Or Password');
     }
   }
  
   closeLoginModal() {
      this.modalService.dismissAll();
      // this.ButtonSpinner('hide');
      this.spinner.hide();
    }

    activeDeactiveItem(id, $event) {
      if ($event.target.checked === true) {
        this.deleteDeactiveNewsEvent(id, 2);
      }else{
        this.deleteDeactiveNewsEvent(id, 3);
      }
   }

   // id is NewsAndEventsID, action(1.Deletion, 2.Active, 3.Inactive)
   deleteDeactiveNewsEvent(id, action){
    this.spinner.show();
    let data: any = {
      NewsAndEventsID:id,
      DeleteActive:action
    };
    this._newsService.deleteActivate(data).subscribe((data: any) => {
      this.spinner.hide();
      if (data.StatusCode == 200 || data.statusCode == 200) {
        if(action==1){
          this.toastr.success('Item Deleted Successfully');
          this.NewsEventsList = this.NewsEventsList.filter( a=> a.NewsAndEventsID != id);
        }else if(action ==2){
          this.toastr.success('Item Activated Sussuflly');
        }else{
          this.toastr.success('Item Deactivated Successfully');
        } this.closeLoginModal();
      } else{
        this.toastr.error('Something went wrong! Please contact system support');
      }
    }, (err) => {
      this.spinner.hide();
    })
  }

}
