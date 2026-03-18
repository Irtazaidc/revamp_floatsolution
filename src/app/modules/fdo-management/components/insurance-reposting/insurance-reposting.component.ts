// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LabTatsService } from 'src/app/modules/lab/services/lab-tats.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';

@Component({
  standalone: false,

  selector: 'app-insurance-reposting',
  templateUrl: './insurance-reposting.component.html',
  styleUrls: ['./insurance-reposting.component.scss']
})
export class InsuranceRepostingComponent implements OnInit {

 insuranceDataList: any = [];
 
   spinnerRefs = {
     dataTable: "dataTable",
     panelsDropdown: "panelsDropdown",
   };
 
   loggedInUser: UserModel;
 
   public Fields = {
     dateFrom: ["", Validators.required],
     dateTo: ["", Validators.required],
     locationid: [null],
     VisitId: [null],
   };
 
   pagination = {
     page: 1,
     pageSize: 10,
     collectionSize: 0,
     filteredSearchResults: [],
     paginatedSearchResults: [],
   };
 
   confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to proceed?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };
  
   isSubmitted = false;
   showLocColumn = false;
   branchList = [];
 
   searchText = "";
   maxDate: any;
   isActive: number = 1;
   filterForm: FormGroup = this.formBuilder.group(this.Fields);
 
   constructor(
     private formBuilder: FormBuilder,
     private toasrt: ToastrService,
     private spinner: NgxSpinnerService,
     private auth: AuthService,
     private lookupService: LookupService,
     private labTats: LabTatsService,
     private excelService: ExcelService
   ) {}
 
   ngOnInit(): void {
     this.loadLoggedInUserInfo();
     this.getLocationList();
    //  this.getLookupsForRegistration();
     // this.getPanels();
     setTimeout(() => {
       this.filterForm.patchValue({
         dateFrom: Conversions.getCurrentDateObject(),
         dateTo: Conversions.getCurrentDateObject(),
         // locationid: this.loggedInUser.locationid,
       });
       this.maxDate = Conversions.getCurrentDateObject();
     }, 200);
 
     this.filterForm.get('TypeId')?.valueChanges.subscribe(value => {
       this.updatePanelValidation(value);
     });
   }
 
   loadLoggedInUserInfo() {
     this.loggedInUser = this.auth.currentUserValue;
   }
 
   
   activeCases = 0;
   inactiveCases = 0;
   getPatientInsuranceData() {
     this.insuranceDataList = [];
     this.pagination.paginatedSearchResults = [];
     this.searchText = "";
     this.activeCases = 0;
     this.inactiveCases = 0;
     let formValues = this.filterForm.getRawValue();
     const dateFrom = formValues.dateFrom;
     const dateTo = formValues.dateTo;
     const fromDate: any = new Date(
       dateFrom.year,
       dateFrom.month - 1,
       dateFrom.day
     );
     const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
 
     // Check if DateTo is earlier than DateFrom
     if (toDate < fromDate) {
       this.toasrt.error("DateTo should be equal or greater than DateFrom");
       this.isSubmitted = false;
       return;
     }
 
     // Set the allowed range based on screenIdentity
     const maxDaysDifference = 30;
     const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));
 
     if (daysDifference > maxDaysDifference) {
       const period = "1 Month";
       this.toasrt.error(
         `The difference between dates should not exceed ${period}`
       );
       this.isSubmitted = false;
       return;
     }
     let locationid = formValues.locationid
     !locationid ? this.showLocColumn = true : this.showLocColumn = false;
     if (this.filterForm.invalid) {
       this.toasrt.warning("Please Fill The Mandatory Fields");
       this.isSubmitted = true;
       return;
     }
 
     let objParams = {
       DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
       DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
       LocID: formValues.locationid || null,
       VisitID: formValues.VisitId ? parseInt(formValues.VisitId, 10) : null
     };
     this.spinner.show(this.spinnerRefs.dataTable);
     this.labTats.GetUnPostedPatientInsurance(objParams).subscribe(
       (res: any) => {
         this.spinner.hide(this.spinnerRefs.dataTable);
         // this.isActive = -1;
         if (res.StatusCode == 200) {
           if (res.PayLoad.length) {
             this.insuranceDataList = res.PayLoad;
             this.insuranceDataList.forEach(patient => {
               if (patient.isInsuranceActive) {
                   this.activeCases++;
               } else {
                   this.inactiveCases++;
               }
           });
             this.filterResults()
           } else {
             this.toasrt.info("No Record Found");
             this.insuranceDataList = [];
             
           }
         } else {
           this.toasrt.error("Something went wrong");
         }
       },
       (err) => {
         console.log(err);
         this.spinner.hide(this.spinnerRefs.dataTable);
         this.toasrt.error("Connection error");
       }
     );
   }
 
   getLocationList() {
     this.branchList = [];
     this.lookupService.GetBranches().subscribe(
       (res: any) => {
         if (res && res.StatusCode == 200 && res.PayLoad) {
           let data = res.PayLoad;
           try {
             data = JSON.parse(data);
           } catch (ex) {}
           this.branchList = data || [];
           this.branchList = this.branchList.sort((a, b) => {
             if (a.Code > b.Code) {
               return 1;
             } else if (a.Code < b.Code) {
               return -1;
             } else {
               return 0;
             }
           });
         }
       },
       (err) => {
         console.log(err);
       }
     );
   }
   exportAsExcel() {
     const excelData = [];
     if (this.insuranceDataList.length) {
       this.insuranceDataList.forEach((d) => {
         // const row = {
         //   Sr: index + 1,
         //   PIN: d.AccNo,
         // };
         excelData.push(d);
       });
       this.excelService.exportAsExcelFile(excelData, "Patient Insurance Report","Patient Insurance Report");
     } else {
       this.toasrt.error("Cannot export empty table");
     }
   }
 
   patientTypeList = [];
   getLookupsForRegistration() {
     this.patientTypeList = [];
     this.lookupService
       .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
       .subscribe(
         (resp: any) => {
           let _response = resp.PayLoadDS || [];
           // this.paymentModesList = _response.Table5 || [];
           this.patientTypeList = _response.Table6 || [];
         },
         (err) => {
           console.log(err);
         }
       );
   }
   panelsList = [];
   getPanels() {
     this.panelsList = [];
     let _params = {
       branchId: null,
     };
     // if (!this.loggedInUser.locationid) {
     //   this.toasrt.warning('Branch ID not found');
     //   return;
     // }
     this.spinner.show(this.spinnerRefs.panelsDropdown);
     this.lookupService.getPanels(_params).subscribe(
       (res: any) => {
         this.spinner.hide(this.spinnerRefs.panelsDropdown);
         if (res && res.StatusCode == 200 && res.PayLoad) {
           let data = res.PayLoad;
           try {
             data = JSON.parse(data);
           } catch (ex) {}
 
           this.panelsList = data || [];
           // console.log("Panels list is__________",this.panelsList)
           // if (this.panelIdFromBookingId || this.panelIdFromVisitInfo) { //here
           //   this.convertSelectedTestProfiles({ PanelId: this.panelIdFromBookingId || this.panelIdFromVisitInfo });
           // }
 
           // setTimeout(() => {
           // let panelID = this.panelsList.find(panel => panel.PanelId === 1714);
           // if (panelID) {
           //   this._form.get('PanelId').setValue(1714);
           //   this._form.get('PanelId').disable();
           // } else {
           //   this._form.get('PanelId').setValue(null);
           //   this._form.get('PanelId').enable();
           // }
           // }, 200);
         }
       },
       (err) => {
         this.spinner.hide(this.spinnerRefs.panelsDropdown);
         console.log(err);
         this.toasrt.error("Something went wrong. " + err.statusText);
       }
     );
   }
 
   onChange(event: any) {
     this.isActive = event;
   }
 
   mainChk
  selectAllItems(checked){
  this.pagination.paginatedSearchResults.forEach(sec => {
    sec.checked = checked;
  });
  }

   onPanelChange(event) {
     if(!event){
       this.filterForm.get('PanelId')?.setValidators([]);
       this.panelsList = [];
       return
     }
     if (event.TypeId == 2 || event.TypeId == 5) {
       this.getPanels();
     } else {
       this.panelsList = [];
     }
   }
 
   updatePanelValidation(patientTypeValue: any) {
     console.log("patientTypeValue:", patientTypeValue);
     
     const panelControl = this.filterForm.get('PanelId');
   
     if (!patientTypeValue) {
       panelControl?.clearValidators(); // Correct way to remove validation
     } else if (patientTypeValue === 2 || patientTypeValue === 5) {
       panelControl?.setValidators([Validators.required]); // Make Panel required
     } else {
       panelControl?.clearValidators(); // Remove required validation
     }
   
     panelControl?.updateValueAndValidity(); // Refresh validation state
   }
   
 
   refreshPagination() {
     let dataToPaginate = this.pagination.filteredSearchResults;
     this.pagination.collectionSize = dataToPaginate.length;
     this.pagination.paginatedSearchResults = dataToPaginate
       .map((item, i) => ({ id: i + 1, ...item }))
       .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
   }
 
    filterResults() {
        this.pagination.page = 1;
        let cols = ['PatientMRNo', 'PatientName', 'Cell', 'VisitID', 'PatientPolicyNo'];
        let results: any = this.insuranceDataList;
        if (this.searchText && this.searchText.length > 1) {
          let pipe_filterByKey = new FilterByKeyPipe();
          results = pipe_filterByKey.transform(this.insuranceDataList, this.searchText, cols, this.insuranceDataList);
        }
        this.pagination.filteredSearchResults = results;
        console.log("pagination.filteredSearchResults:", this.pagination.filteredSearchResults)
        this.refreshPagination();
      }

      insertRepostedData(){

      }
}
