// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FAQService } from '../../services/faq.service';
import { AuthService, UserModel } from 'src/app/modules/auth';

@Component({
  standalone: false,

  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.scss']
})
export class FAQListComponent implements OnInit {
  Answer = '<p></p>';
  faqListForm!: FormGroup;
  formSearchFAQ!: FormGroup;

  faqCategoryList = [];
  faqID: any = null;
  ExistingRow = [];
  spinnerRefs = {
    faqFormSection: 'faqFormSection',
    faqSearchSection: 'faqSearchSection'
  }
  loggedInUser: UserModel;
  faqList = [];
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  ActionLabel = "Save"
  LoadingFAQMessage = 'No record found...';

  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    // private storageService : StorageService,
    private faqService: FAQService,
  ) {
    this.faqListForm = this.fb.group({
      Question: ['', Validators.compose([Validators.required])],
      Answer: ['', Validators.compose([Validators.required])],
      FAQCategoryID: ['', Validators.compose([Validators.required])],
    });

    this.formSearchFAQ = this.fb.group({
      faqCategoryId: [null],
    });
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getFAQCategory();
    this.searchFAQ();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  searchFAQ() {
    this.spinner.show(this.spinnerRefs.faqSearchSection);
    this.faqList = [];
    this.clearForms();
    const formValues = this.formSearchFAQ.getRawValue();

    const objParm = {
      FAQCategoryID: formValues.faqCategoryId
    }
    this.LoadingFAQMessage = 'data loading...';
    this.faqService.getFAQ(objParm).subscribe((res: any) => {
      const resSearchJob = res.PayLoad || [];
      if (res.StatusCode == 200) {
        this.faqList = resSearchJob || [];
        if (!this.faqList.length) {
          this.LoadingFAQMessage = 'No recored found !';
        }
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.faqSearchSection);
      console.log("loading search result error", err);
    })
    this.spinner.hide(this.spinnerRefs.faqSearchSection);
  }

  getFAQCategory() {
    this.faqCategoryList = []
    this.faqService.getFAQCategory({}).subscribe((resp: any) => {
      this.faqCategoryList = resp.PayLoad || [];
      if (!this.faqCategoryList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })

  }

  rowIndex = null;
  getFAQByID(id,i) {
    this.rowIndex = i;
    this.ActionLabel = "Update"
    this.faqID = id;
    this.ExistingRow = [];

    const paramObj = {
      FAQID: this.faqID
    }

    this.faqService.getFAQ(paramObj).subscribe((resp: any) => {
      this.ExistingRow = resp.PayLoad || []
      if (resp.PayLoad) {
        this.faqListForm.patchValue({
          FAQCategoryID: this.ExistingRow[0]["FAQCategoryID"],
          Question: this.ExistingRow[0]["Question"],
          Answer: this.ExistingRow[0]["Answer"]
        });
      }

    }, (err) => {
      this.toastr.error('Connection error')
      this.spinner.hide(this.spinnerRefs.faqFormSection);
    })
  }

  addUpdateJobRequest() {
    this.spinner.show(this.spinnerRefs.faqFormSection);
    const formValues = this.faqListForm.getRawValue();
    this.faqListForm.markAllAsTouched();
    if (this.faqListForm.invalid) {
      this.spinner.hide(this.spinnerRefs.faqFormSection);
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      this.isSpinner = false; // Button Spinner shwo
      const formData = {
        FAQID: this.faqID,
        FAQCategoryID: formValues.FAQCategoryID,
        Question: formValues.Question,
        Answer: formValues.Answer,
        CreatedBy: this.loggedInUser.userid || -99,
      };
      this.faqService.addUpdateFAQ(formData).subscribe((data: any) => {
        this.spinner.hide(this.spinnerRefs.faqFormSection);
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.searchFAQ();
            this.clearForms();
            this.faqListForm.patchValue({
              FAQCategoryID: ''
            });

          } else {
            this.toastr.error(data.Message)
            this.spinner.hide(this.spinnerRefs.faqFormSection);
          }
        }
      }, (err) => {
        this.toastr.error('Connection error')
        this.spinner.hide(this.spinnerRefs.faqFormSection);
        this.disabledButton = false; // Enable button again
        this.isSpinner = true; // Hide button spinner
      })
      this.disabledButton = false; // Enable button again
      this.isSpinner = true; // Hide button spinner
    }
  }

  truncate(source, size) {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }

  clearForms() {
    this.faqListForm.reset();
    this.faqID = null;
    this.ActionLabel = "Save";
    setTimeout(() => {
      this.Answer = '<p></p>';
      // this.Answer= '';
    }, 100);

  }


}
