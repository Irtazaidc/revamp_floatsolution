// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { RackingRoutingService } from '../../services/racking-routing.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { RACKING_ROUTING_CONFIGS } from '../../../shared/helpers/raking-routing-configs'

@Component({
  standalone: false,

  selector: 'app-racking-routing',
  templateUrl: './racking-routing.component.html',
  styleUrls: ['./racking-routing.component.scss']
})
export class RackingRoutingComponent implements OnInit {
  @ViewChild('popupRackEventsHandler') popupRackEventsHandler;
  spinnerRefs = {
    listSection: 'listSection'
  }
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  RackList: any = [];
  RackNo : any = null
  RackRow: any = [];

  SampleCode : any = null
  SampleRow: any = [];

  subSectionList = [];
  labDeptID = -1;
  locationID = -1;
  formUpdateRack = this.fb.group({
    sectionID: ['', Validators.compose([Validators.required])],
  });
  rackStatus: any=null;
  isRequired: boolean = false;
  infoMessage ='Data loading...';
  modalHeader : String ="Rack's Allocation";
  scanType : number = 1; //1 For Rack Scaning, 2 For Sample Scaning
  isRackAvailable: boolean = false;
  SampleSection :String = "";
  RackID : number = null;
  SampleBarcode :string = null;
  isTLA: boolean=false;
  loggedInUser: any;
  constructor(
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private lookupService : LookupService,
    private fb : FormBuilder,
    private RackingRoutingService : RackingRoutingService,
    private auth: AuthService,
    private appPopupService: AppPopupService
  ) { }
  
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRacks();
    this.getSubSection();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getSubSection() {
    this.subSectionList = [];
    let objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID
    }    
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      let _response = resp.PayLoad;
      this.subSectionList = _response || [];
    }, (err) => {
      console.log(err)
    })
  }

  scaning(param){
    this.RackNo='';
    let rack_sample_code = param.substring(0,5)
    if(rack_sample_code.toLowerCase() =='rack-' || rack_sample_code.toLowerCase() == 'tlara'){
      this.getRackInformationByRackNo(param)
    }else{
      this.getSampleInfoByBarCode(param)
    }
  }
  getRackInformationByRackNo(rackNo){
    this.scanType=1;
    this.rackStatus = null 
    // this.RackNo = rackNo;
    this.RackRow = []
    let params={
      RackNo : rackNo, 
	    BranchID :  null
    }
    this.RackingRoutingService.getRackInformationByRackNo(params).subscribe((res:any) =>{
      if(res.StatusCode == 200){
        this.RackRow = res.PayLoad || [];
        if(this.RackRow.length){
          this.RackNo = this.RackRow[0]['RackNo'];
          if(this.RackRow[0]['Screen']==null && this.RackRow[0]['RackNo'].substring(0,5).toLowerCase() != 'tlara'){
            this.rackStatus='free';
            this.isRequired = true;
            this.formUpdateRack = this.fb.group({
              sectionID: ['', Validators.compose([Validators.required])],
            });
            this.isTLA = false;
          }else if(this.RackRow[0]['Screen']==null && this.RackRow[0]['RackNo'].substring(0,5).toLowerCase() == 'tlara'){
            this.rackStatus='free';
            this.isRequired = false;
            this.isTLA = true;
            this.formUpdateRack = this.fb.group({
              sectionID: [''],
            });
          }else if(this.RackRow[0]['Screen']=='Racking'){
            this.rackStatus='allocated';
            this.isRequired = false;
            this.formUpdateRack = this.fb.group({
              sectionID: [''],
            });
            this.isTLA = false;
          }else if(this.RackRow[0]['Screen']!=null && this.RackRow[0]['Screen']!='Racking'){
            this.rackStatus='locked';
            this.isRequired = false;
            this.formUpdateRack = this.fb.group({
              sectionID: [''],
            });
            this.isTLA = false;
          }
          this.appPopupService.openModal(this.popupRackEventsHandler,{size:'md', scrollable: true});
        }else{
          this.toastr.info('No rack found.')
          this.isRequired = false;
          this.isTLA = false;
          this.formUpdateRack = this.fb.group({
            sectionID: [''],
          });
        }
        
          
      }else{
        this.toastr.error(res.Message)
      }
    }, (err)=>{
      console.log(err);
      this.toastr.error('Connection Error')
    })

  }

  getSampleInfoByBarCode(sampleCode){ 
    this.isRequired = false;
    this.SampleBarcode  = sampleCode;
    this.scanType=2;
    this.modalHeader ="Sample Racking";
    this.SampleCode = sampleCode;
    this.RackRow = []
    let params={
      SampleBarcode : this.SampleCode
    }

    this.RackingRoutingService.getSampleInfoByBarCode(params).subscribe((res:any) =>{
      if(res.StatusCode == 200){
        this.SampleRow = res.PayLoad || [];
        console.log('Sample row is: ',this.SampleRow)
        if(this.SampleRow.length){
          let sectionID = this.SampleRow[0]['TPSubSectionID']
          var rackRow = this.RackList.find(e=>e.SectionID == sectionID);
          var tlaRow = this.RackList.find(e=>e.RackTypeID == 5);

          if(this.SampleRow[0].RackID){
            if(tlaRow){
              this.toastr.warning('This sample currently exists in  TLA special rack');
            }else{
              this.toastr.warning('This sample currently exists in '+this.SampleRow[0].RackScreen+' "'+this.SampleRow[0].TPSubSection+'" rack');
            }
            
            return;
          }
          
          if(tlaRow)
          rackRow = undefined;
          this.SampleSection = this.SampleRow[0].TPSubSection;
          if(tlaRow){
            this.isRackAvailable = true;
            this.isTLA=true;
            if(tlaRow.SampleCount>=tlaRow.Capacity){
              this.toastr.error('TLA Rack is full'); 
              this.RackNo= null;
              return;
            }
            this.RackID = tlaRow.RackID;
            this.putSample();
            return;
          }else if(rackRow) {
            this.isTLA=false;
            this.isRackAvailable = true;
            if(rackRow.SampleCount>=rackRow.Capacity){
              this.toastr.error('"'+this.SampleSection+'" Rack is full'); 
              this.RackNo= null;
              return;
            }
            this.RackID = rackRow.RackID;
            this.appPopupService.openModal(this.popupRackEventsHandler,{size:'md', scrollable: true});
          }
          else{
            this.isRackAvailable = false;
            this.isTLA=false;
            this.appPopupService.openModal(this.popupRackEventsHandler,{size:'md', scrollable: true});
          }
          
        }else{
          this.toastr.info('No sample found.')
          console.log('No sample found')
          this.SampleSection = ""
        }
      }else{
        this.toastr.error("Something went wrong. Please contact system administrator")
      }
    }, (err)=>{
      console.log(err);
      this.toastr.error('Connection Error')
    })

  }


  getRacks(){
    // console.log("Login Userdata: ",this.loggedInUser)
    this.infoMessage='Data loading...';
    this.RackList = [];
    this.RackRow = []
    this.spinner.show(this.spinnerRefs.listSection);
    let params = {
      LocID: this.loggedInUser.locationid,
      Screen:'Racking'
    };
    this.RackingRoutingService.getRacks(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
          this.RackList =  res.PayLoad || [];
          if(this.RackList.length){
            this.RackList.map(e => {
              e.rackConfData = RACKING_ROUTING_CONFIGS.RACK[e.SectionID]||{
                backgroundColorDark: '#61717e',
                backgroundColorLight: '#ade46ca3',
                backgroundImage: 'assets/media/rack-icons/icon_rack_Default.png',
              };
            })
          }else{
            // this.toastr.info('No allocated Rack found.');
            this.spinner.hide(this.spinnerRefs.listSection);
            this.infoMessage='No data rack found.'
          }
          this.spinner.hide(this.spinnerRefs.listSection);
      } else {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.listSection);
    })
  }

  
  allocateRack(){
    this.disabledButton = true; 
    this.isSpinner = false;
    let formValues = this.formUpdateRack.getRawValue();
    this.formUpdateRack.markAllAsTouched();
    if(!this.formUpdateRack.invalid) {    
      let sectionID = formValues.sectionID;
      let objParam={}
      if(sectionID || this.isTLA){
        let sectionObj = this.subSectionList.find(e=>e.SubSectionId == sectionID);
        let checkSectionRow = this.RackList.find(e=>e.SectionID == sectionID);
        if(checkSectionRow) {
          this.disabledButton = false; 
          this.isSpinner = true;
          this.toastr.info('"'+sectionObj.SubSectionShortName+'" Rack already exists...!');
          return;
        }
        
        objParam = {
          RackNo :  this.RackNo,
          RackBarcode :  null,
          SectionID :  this.isTLA? null : sectionObj.SubSectionId,
          Section :  this.isTLA? null : sectionObj.SubSectionShortName,
          // Section :  sectionObj.SubSectionTitle,
          Screen :  'Racking',
          SendOutBranchID :  null,
          LockForBranchID :  null,
        }
      }else{
        if(this.RackRow.length && this.RackRow[0].SampleCount>0){
          objParam = {
            RackNo :  this.RackNo,
            Screen :  'Accessioning',
            SectionID :  this.RackRow[0].SectionID,
            Section :  this.RackRow[0].Section,
            
          }
        }else{
          objParam = {
            RackNo :  this.RackNo,
            RackBarcode :  null,
            SectionID :  null,
            Section :  null,
            Screen :  null,
            SendOutBranchID :  null,
            LockForBranchID :  null,
          }
        }
      }
      this.RackingRoutingService.allocateRack(objParam).subscribe((res:any) => {
        if (JSON.parse(res.PayLoadStr).length) {
          if (res.StatusCode == 200) {
            this.isRequired=false;
            this.formUpdateRack = this.fb.group({
              sectionID: [''],
            });
            if(sectionID || this.isTLA){
              this.toastr.success(res.Message);
            }else{
              this.toastr.success('Rack has been released successfully.');
            }
            
            this.disabledButton = false; 
            this.isSpinner = true;
            this.formUpdateRack.patchValue({
              sectionID: ''
            });
            this.RackNo=null;
            this.appPopupService.closeModal();
            this.getRacks();
          } else {
            this.toastr.error(res.Message)
            this.disabledButton = false; 
            this.isSpinner = true;
            this.isRequired=false;
            this.formUpdateRack = this.fb.group({
              sectionID: [''],
            });
          }
        }
      },(err) => {
        console.log(err);
        this.disabledButton = false; 
        this.isSpinner = true; 
        this.isRequired=false;
        this.toastr.error('Connection error');
      })
    }else{
      console.log('not valid')
      this.disabledButton = false; 
      this.isSpinner = true;
    }
    
  }
  putSample(){
    this.disabledButton = true; 
    this.isSpinner = false;
      let objParam = {
        SampleBarcode :  this.SampleBarcode,
        RackID :  this.RackID,
        isTLASample : this.isTLA? 1:0,
        LocID: this.loggedInUser.locationid// this.isTLA? -1:this.loggedInUser.locationid
      }
      // console.log('ISTla:',this.isTLA,'obparam: ',objParam);return;
      this.RackingRoutingService.putSample(objParam).subscribe((res:any) => {
        if (JSON.parse(res.PayLoadStr).length) {
          if (res.StatusCode == 200) {
            this.toastr.success(res.Message);
            this.disabledButton = false; 
            this.isSpinner = true;
            this.RackNo=null;
            this.RackID=null;
            this.SampleBarcode=null;
            this.scanType=1;
            this.appPopupService.closeModal();
            this.getRacks();
          } else {
            this.toastr.error(res.Message)
            this.disabledButton = false; 
            this.isSpinner = true;
            this.isRequired=false;
            this.formUpdateRack = this.fb.group({
              sectionID: [''],
            });
          }
        }
      },(err) => {
        console.log(err);
        this.disabledButton = false; 
        this.isSpinner = true; 
        this.isRequired=false;
        this.formUpdateRack = this.fb.group({
          sectionID: [''],
        });
        this.toastr.error('Connection error');
    })
  }

  onKey(event: any) {
    this.RackNo=event.target.value;
}

}

