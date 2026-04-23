// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DiscountCardService } from '../../services/discount-card.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
@Component({
  standalone: false,

  selector: 'app-discount-card',
  templateUrl: './discount-card.component.html',
  styleUrls: ['./discount-card.component.scss']
})
export class DiscountCardComponent implements OnInit {

  @Input() cardNO: any;
  @Output() discountCardDetails= new EventEmitter<any>();  

  discountCardlist=[];
  discountCardNumber=null;
  PatientName=null;
  RewardPoints=null;
  PatientID=null;
  cardTitle: any;
  UsedRedeemedPoints: any;
  CreatedOn: any;
  isReadonly = true;
  Age: any;
  Gender: any;
  Remarks: any;
  DiscountCardImage=CONSTANTS.USER_IMAGE.DISIMAGE;

  constructor(
    private discountCardService: DiscountCardService,
    private toastr: ToastrService, 
    ) { }

  ngOnInit(): void {
    this.getDiscountCardDetails(this.cardNO);  
  }

  getDiscountCardDetails(cardNO) {
    this.discountCardlist=[];
    const params = 
    { 
    cardNo: cardNO
    };
    
      this.discountCardService.getDiscountCardDetails(params).subscribe((res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
          this.discountCardlist = res.PayLoad;
          this.discountCardDetails.emit(this.discountCardlist);
          this.discountCardNumber = this.discountCardlist[0].CardNo;
          this.PatientName = this.discountCardlist[0].PatientName;
          this.RewardPoints = this.discountCardlist[0].RewardPoints;
          this.PatientID=this.discountCardlist[0].MRN;
          this.cardTitle=this.discountCardlist[0].Title;
          this.UsedRedeemedPoints=this.discountCardlist[0].UsedRedeemedPoints;
          this.CreatedOn=this.discountCardlist[0].CreatedOn;
          this.Age=this.discountCardlist[0].Age;
          this.Gender=this.discountCardlist[0].Gender;
          this.Remarks=this.discountCardlist[0].Remarks;
          console.log("🚀getDiscountCardDetails:", this.discountCardlist);
        } else {
        this.toastr.error('No Record(s) Found');

        }
      }, (err) => {
        this.toastr.error('Connection error');
        console.log(err);
      })
    } 
    
  }


