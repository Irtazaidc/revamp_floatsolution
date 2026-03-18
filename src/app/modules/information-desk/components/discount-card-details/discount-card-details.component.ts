// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DiscountCardService } from 'src/app/modules/patient-booking/services/discount-card.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';


@Component({
  standalone: false,

  selector: 'app-discount-card-details',
  templateUrl: './discount-card-details.component.html',
  styleUrls: ['./discount-card-details.component.scss']
})
export class DiscountCardDetailsComponent implements OnInit {

  spinnerRefs = {
    usersList: 'usersList',
    cardList: 'cardList',
    CardInfo: 'CardInfo',
    EditInfo: 'EditInfo',
    familyCardlist: 'familyCardlist',
  }

  searchForm: FormGroup;

  isSubmitted: boolean = false;

  cardUsersList:any = []; 
  familyCardlist:any[] = null;
  
  cardNo:number;
  getCardTypeId = 2;
  searchText = '';
  rowIndex = null;
  getDisCard = null;
  
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private discountCardService: DiscountCardService,
    private fb: FormBuilder,
    private helperService: HelperService,
    
  ) { 

    this.searchForm = this.fb.group({
      contactNumber: ['', Validators.required],
      cardNumber: ['', Validators.required]
    });

    this.searchForm.setValidators(this.validateFields());
    
   }

  ngOnInit(): void {

  }

  ngOnChanges(){

  }

  getUsersInfo(item, index){
    this.spinner.show(this.spinnerRefs.CardInfo)
    this.getDisCard = null;
    this.rowIndex = index;
    setTimeout(() => {
      const getCardId =  item.CardID; 
      this.getDisCard = item.CardNo;
      this.getFamilyCardDetails(getCardId);
    this.spinner.hide(this.spinnerRefs.CardInfo)
    }, 1);

  }

  getDiscountCardDetails(){
    
    this.getDisCard = null;
    this.cardUsersList = [];
    if (this.searchForm.invalid) {
      this.toastr.warning('Please Fill The Mandatory fields');
      this.isSubmitted = true;
      return;
    };
    let formValue = this.searchForm.getRawValue();
    let params =
    {
      PhoneNo: formValue.contactNumber || null, 
      CardNo: formValue.cardNumber || null, 
    };
    this.spinner.show(this.spinnerRefs.cardList)
    this.discountCardService.getDiscountCardList(params).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.cardList)
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.cardUsersList = res.PayLoad;
        if(this.cardUsersList.length && this.cardUsersList[0]){
          const item = this.cardUsersList[0]
          this.getUsersInfo(item, 0);
        }
        else{
          setTimeout(() => {
            this.getDisCard = null;
            this.getFamilyCardDetails(null);
          }, 200);
          
        }
      } else {
        this.toastr.info('No Member(s) Found');
        this.cardUsersList = [];
      }
    }, (err) => {
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.cardList)
      console.log(err);
    })

  }

  getFamilyCardDetails(cardId) {
    this.familyCardlist = null;
    let params =
    {
      cardId: cardId, //this.cardIdValue,
    };
    this.spinner.show(this.spinnerRefs.familyCardlist)
    this.discountCardService.getFamilyDiscountCardDetails(params).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.familyCardlist)
      if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
        this.familyCardlist = res.PayLoad;
      } else {
        this.toastr.info('Family Member(s) Not Found');
      }
    }, (err) => {
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.familyCardlist)
      console.log(err);
    })
  }

  copyText(text: string) {
    this.helperService.copyMessage(text);
  }

  validateFields(): ValidatorFn {
    return (formGroup: FormGroup): {[key: string]: any} | null => {
      const contactNumber = formGroup.get('contactNumber').value;
      const cardNumber = formGroup.get('cardNumber').value;
  
      // Check if at least one field is valid
      if (contactNumber || cardNumber) {
        formGroup.get('contactNumber').setErrors(null);
        formGroup.get('cardNumber').setErrors(null);
        return null;
      }
  
      // Both fields are empty or invalid
      return { required: true };
    };
  }
  
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

}
