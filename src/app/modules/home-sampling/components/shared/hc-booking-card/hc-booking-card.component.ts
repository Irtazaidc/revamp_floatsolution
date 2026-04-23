// @ts-nocheck
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { HcBookingInquiryService } from '../../../services/hc-booking-inquiry.service';
import { HcShareService } from '../../../services/hc-share.service';
import { HcSharedService } from '../../../services/hc-shared.service';
import { HCBookingDetail } from '../../../models/HCBooking';

@Component({
  standalone: false,

  selector: 'app-hc-booking-card',
  templateUrl: './hc-booking-card.component.html',
  styleUrls: ['./hc-booking-card.component.scss']
})
export class HcBookingCardComponent implements OnInit, OnChanges {

  @Input() bookingid: number;
  @Input() requestid: number;
  @Input() multipleBookingIds: any = "";
  @Input() hcBookingInfoDT: any = [];
  @Input() selBookingID: any = null;
  // hcBookingInfo: any = [];
  bookedTestNames: any = "";
  hcBookingInfo: HCBookingDetail;
  VisitNo: any = '';

  bookingFields: any[] = [];

  constructor(private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private shared: HcSharedService
  ) { }

  // ngOnInit(): void {
  //   this.multipleBookingIds = this.multipleBookingIds ? this.multipleBookingIds.split(',') : null;
  //   console.log("this.multipleBookingIds", this.multipleBookingIds);
  //   if (this.multipleBookingIds)
  //     this.bookingid = this.multipleBookingIds ? this.multipleBookingIds[0] : null
  //   this.getbookingDetailByBookingID();
  //   console.log("this.hcBookingInfoDT", this.hcBookingInfoDT);

  //   console.log("bookingid", this.bookingid);

  //   // if (this.multipleBookingIds)

  //   //   this.bookingid = this.multipleBookingIds ? Number(this.multipleBookingIds[0]) : null;
  // }
 
  // getbookingDetailByBookingID() {

  //   this.spinner.show();
  //   if (this.bookingid || this.selBookingID || this.multipleBookingIds) {
  //     let params = {
  //       "HCBookingPatientID": this.selBookingID || this.bookingid || this.multipleBookingIds
  //     }
  //     this.shared.bookingDetailByBookingID(params).subscribe((resp: any) => {
  //       console.log("Booking Data", resp);
  //       this.spinner.hide();
  //       if (resp.StatusCode == 200 && resp.PayLoadDS) {
  //         console.log(resp.PayLoadDS)
  //         this.hcBookingInfo = resp.PayLoadDS.Table[0];
  //         this.bookedTestNames = resp.PayLoadDS.Table1.length ? resp.PayLoadDS.Table1.map(a => { return a.Code }).join(',') : null
  //       }
  //     }, (err) => {
  //       this.spinner.hide();
  //       this.toastr.show("Something Went Wrong");
  //       console.log(err);
  //     });
  //   }
  //   else if (this.hcBookingInfoDT) {
  //     this.hcBookingInfo = this.hcBookingInfoDT;
  //   }
  // }


  ngOnInit(): void {
    try {
      // Split multiple booking IDs if they exist and are not already an array.
      if (this.multipleBookingIds && typeof this.multipleBookingIds === 'string') {
        this.multipleBookingIds = this.multipleBookingIds.split(',');
      }
  
      console.log("Multiple Booking IDs:", this.multipleBookingIds);
  
      // Set the default booking ID if available.
      // this.bookingid = this.multipleBookingIds?.[0] || null;
      console.log(" ngOnInit ~ this.bookingid:", this.bookingid)

      this.bookingid = this.bookingid ? this.bookingid : this.multipleBookingIds ? this.multipleBookingIds?.[0] : null;
      console.log("Selected Booking ID:", this.bookingid);
  
      // Fetch booking details by booking ID.
      this.getbookingDetailByBookingID();
      console.log("Booking Info DataTable:", this.hcBookingInfoDT);
    } catch (error) {
      console.error("Error in ngOnInit:", error);
      this.toastr.error("Initialization failed. Please try again.");
    }
  }
  
  ngOnChanges() {
    console.log("bookingid", this.bookingid);
    this.multipleBookingIds = this.multipleBookingIds ? this.multipleBookingIds.split(',') : null;
    console.log("this.multipleBookingIds", this.multipleBookingIds);
    if (this.multipleBookingIds)
      this.bookingid = this.multipleBookingIds ? this.multipleBookingIds[0] : this.bookingid? this.bookingid : null;
      console.log("🚀 ~ HcBookingCardComponent ~ ngOnChanges ~ this.bookingid:", this.bookingid)
    setTimeout(() => {
    this.getbookingDetailByBookingID();
    }, 300);
    
  }
  spinnerRefs = {
    BookingCard : 'BookingCard'
  }
  getbookingDetailByBookingID(): void {
    this.spinner.show(this.spinnerRefs.BookingCard);
    this.hcBookingInfo = null;
    this.bookedTestNames = "";
    try {
      // Validate booking ID, selected booking ID, or multiple booking IDs before making the API call.
      const bookingID = this.selBookingID || this.bookingid || this.multipleBookingIds;
      if (!bookingID) {
        this.spinner.hide(this.spinnerRefs.BookingCard);
        this.toastr.warning("No Booking ID found. Please select a valid booking.");
        return;
      }
  
      const params = {
        "HCBookingPatientID": bookingID,
      };
  
      // API call to fetch booking details.
      this.shared.bookingDetailByBookingID(params).subscribe(
        (resp: any) => {
          this.spinner.hide(this.spinnerRefs.BookingCard);
  
          if (resp?.StatusCode === 200 && resp?.PayLoadDS) {
            console.log("API Response:", resp.PayLoadDS);
  
            // Assign booking info and booked test names.
            this.hcBookingInfo = resp.PayLoadDS.Table?.[0] || null;
            this.bookedTestNames = resp.PayLoadDS.Table1?.length
              ? resp.PayLoadDS.Table1.map((a) => a.Code).join(', ')
              : 'No tests booked';
          } else {
            console.warn("Unexpected API Response:", resp);
            this.toastr.error("Failed to fetch booking details. Please try again.");
          }
        },
        (error) => {
          this.spinner.hide(this.spinnerRefs.BookingCard);
          console.error("API Error:", error);
          this.toastr.error("An error occurred while fetching booking details. Please try again later.");
        }
      );
    } catch (error) {
      this.spinner.hide(this.spinnerRefs.BookingCard);
      console.error("Error in getbookingDetailByBookingID:", error);
      this.toastr.error("An unexpected error occurred. Please try again.");
    } finally {
      if (this.hcBookingInfoDT && !this.hcBookingInfo) {
        // Fallback to local data if API response is not available.
        this.hcBookingInfo = this.hcBookingInfoDT;
      this.spinner.hide(this.spinnerRefs.BookingCard);

      }
    }
  }
  

}
