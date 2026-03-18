// @ts-nocheck
import { Component, EventEmitter, OnInit, ViewChild , Input} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { AuthService, UserModel } from '../../../auth';
import { LookupService } from '../../../patient-booking/services/lookup.service';
import { DoctorService } from '../../services/doctor.service';
import { NullLogger } from '@microsoft/signalr';

@Component({
  standalone: false,

  selector: 'app-ref-by-b2b-doctors-mapping',
  templateUrl: './ref-by-b2b-doctors-mapping.component.html',
  styleUrls: ['./ref-by-b2b-doctors-mapping.component.scss']
})
export class RefByB2bDoctorsMappingComponent implements OnInit {

  loggedInUser: UserModel;

  @Input() bTobDoctorsData:any;

  
  refByB2BDoctorsMapping:any[] = [];
  refByB2BDoctorsMappingDB:any[] = [];
  refByDoctors = [];
  b2bDoctors = [];
  formSubmitted = false;
  searchText = '';
  rowIndex = null;
  // displayEnabled:boolean = false;


  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }

  form = this.fb.group({
    RefByDoc: ['', Validators.required], // for FE use only
    RefId: ['', Validators.required],
    B2BDoctorID: [ , Validators.required],
    CreatedBy: [''],
    AssignForcefully: ['']
  });

  isB2BDocDisabled = false;

  spinnerRefs ={
    mappingList : "mappingList"
  }

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
	focus$ = new Subject<string>();
	click$ = new Subject<string>();
  ngbTypeahead_config = {
    formatter: {
      input: (x: any) => x ? x.Name : '', // will be displayed input field when value is selected
      result: (x: any) => x ? x.Name : '' // will be displayed in dropdown items
    },
    search: (text$: Observable<any>) => // used to bind data to dropdown
      text$.pipe(
        // debounceTime(300),
        distinctUntilChanged(),
        map(term => term.length < 2 ? []
          : this.refByDoctors.filter(v => v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20))
      ),
    change: (e: any) => {
      this.form.patchValue({
        RefByDoc: this.refByDoctors.find(a => a.RefId == e?.item?.RefId),
        RefId: e?.item?.RefId
      });
      // this.form.get('B2BDoctorID').disable();
      // let selectedRefById = this.form.value.RefByDoc?.RefId;
      // let selectedRefByObj = this.refByB2BDoctorsMapping.find(a=>a.RefId == selectedRefById)
      // this.form.patchValue({
      //   B2BDoctorID: selectedRefByObj?.B2BDoctorID || ''
      // })
    },
    blur: (e: any) => {
      // remove values if not a valid value selected
      if(!this.form.value.RefByDoc || !this.form.value.RefId) {
        this.form.patchValue({
          RefByDoc: '',
          RefId: ''
        });
      }
    }
  }

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private doctorService: DoctorService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // this.loggedInUser = this.storage.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;
    this.getRefByB2bDoctorsMapping();
    this.getRefByDoctors();
    this.getB2BDoctors();

  }

  ngOnChanges() {
    this.getB2BDoctors();
    if (this.bTobDoctorsData) {
      try {
        this.handleB2BDoctorsData();
      } catch (error) {
        this.toastr.warning('An error occurred');
      }
    } else {
      this.ngOnInit();
    }
  }
  
   handleB2BDoctorsData() {
    this.isB2BDocDisabled = false;
    this.spinner.show(this.spinnerRefs.mappingList);
    const item = this.bTobDoctorsData;
    const selectedB2BDoctorID = item.B2BDoctorID;
    setTimeout(() => {
      this.form.patchValue({
        RefByDoc: '',
        RefId: '',
        B2BDoctorID: selectedB2BDoctorID || '',
      });
      selectedB2BDoctorID?this.form.get('B2BDoctorID').disable():this.form.get('B2BDoctorID').enable()
    }, 400);
    // Fetch mapping data asynchronously
    setTimeout(() => {
      this.refByB2BDoctorsMapping = this.filterMappingData(selectedB2BDoctorID);
      this.spinner.hide(this.spinnerRefs.mappingList);
    }, 500);
  }
  
  filterMappingData(selectedB2BDoctorID: string) {
    return this.refByB2BDoctorsMappingDB.filter((ref) => ref.B2BDoctorID == selectedB2BDoctorID) || [];
  }

  
  refByChanged(e = null) {
    this.ngbTypeahead_config.change(e);
  }
  
  getRefByDoctors() {
    this.refByDoctors = [];
    let _params = {};
    this.spinner.show();
    this.lookupService.getRefByDoctors(_params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.refByDoctors = data || [];
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    });
  }

  getB2BDoctors(b2bDoctorID = 0) {
    this.b2bDoctors = [];
    let _params = {
      B2BDoctorID: b2bDoctorID
    };
    this.spinner.show();
    this.lookupService.getB2BDoctors(_params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        console.log(data);
        this.b2bDoctors = data || [];
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    });
  }

  getRefByB2bDoctorsMapping(refId = 0) {
    this.refByB2BDoctorsMapping = [];
    let formvalues = this.form.getRawValue();
    let B2BDoctorID = formvalues.B2BDoctorID;
    let _params = {
      refId: refId ? refId : null
    };
    this.spinner.show();
    this.doctorService.getRefByB2BDoctorsMapping(_params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        console.log(data);
        this.refByB2BDoctorsMappingDB = data || [];
        this.refByB2BDoctorsMapping = data || [];
        this.refByB2BDoctorsMapping = this.refByB2BDoctorsMappingDB.filter((ref) => ref.B2BDoctorID == B2BDoctorID) || []
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    });
  }

  save() {
    this.formSubmitted = true;
    let formvalues = this.form.getRawValue();
    let B2BDoctorID = formvalues.B2BDoctorID;
    this.form.patchValue({
      CreatedBy: this.loggedInUser.userid,
      AssignForcefully: this.form.value.AssignForcefully == 1 ? 1 : 0,
    });
    if(!this.form.valid) {
      this.toastr.warning('Please select Ref By and B to B Doctors');
      return;
    }
    console.log(this.form, this.form.valid)
    let params = JSON.parse(JSON.stringify(this.form.value));
    params.B2BDoctorID = B2BDoctorID,
    delete params.RefByDoc;
    this.spinner.show();
    this.doctorService.insertRefByB2BDoctorsMapping(params).subscribe( (res:any) => {
      this.spinner.hide();
      this.form.patchValue({
        AssignForcefully: 0
      });
      if(res && res.StatusCode == 200) {
        if(!res.PayLoad.length) {
          this.toastr.success('Doctors mapped');
          // this.reset();
          this.isB2BDocDisabled = false;
          this.formSubmitted = false;
          this.form.get('RefByDoc').setValue('');
          this.form.get('RefId').setValue('');
          this.getRefByB2bDoctorsMapping();
          this.getRefByDoctors();
          this.getB2BDoctors();
          
        } else {
          this.toastr.warning('Mapped to: <br><b>' +  res.PayLoad.map(a => a.Name).join('<br>') + '</b>', 'Already mapped', {enableHtml: true});
          console.log('Already Mapped ' , res.PayLoad);
        }
      } else {
        this.toastr.error('Error mapping doctor');
      }
    } , (err) => {
      this.spinner.hide();
      this.form.patchValue({
        AssignForcefully: 0
      });
    });
  }
  delete(item) {
    console.log(item);
    this.form.patchValue({
      RefByDoc: this.refByDoctors.find(a => a.RefId == item.RefId),
      RefId: item.RefId,
      B2BDoctorID: 0,
      AssignForcefully: 1
    });
    this.save();
  }
  edit(item, index) {
    console.log(item);
    this.rowIndex = index;
    this.isB2BDocDisabled = true;
    this.form.get('B2BDoctorID').enable();
    setTimeout(() => {
      this.form.patchValue({
        RefByDoc: this.refByDoctors.find(a => a.RefId == item.RefId),
        RefId: item.RefId,
        AssignForcefully: 1,
      });
      this.refByChanged({item: item}); 
    }, 400);
    
  }


  reset() {
    this.isB2BDocDisabled = false;
    this.form.get('B2BDoctorID').enable();
    this.rowIndex = null;
    this.form.reset();
    this.form.patchValue({
      RefByDoc: '',
      RefId: '',
      B2BDoctorID: '',
      CreatedBy: '',
      AssignForcefully: ''
    });
    this.formSubmitted = false;
    this.refByB2BDoctorsMapping = [];
  }
  // displayRefTable(){
  //   this.displayEnabled = !this.displayEnabled;
  // }

}



