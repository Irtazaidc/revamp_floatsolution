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
import { AccessioningService } from '../../services/accessioning.service';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,

  selector: 'app-sample-transfer',
  templateUrl: './sample-transfer.component.html',
  styleUrls: ['./sample-transfer.component.scss']
})
export class SampleTransferComponent implements OnInit {

  @ViewChild('popupRackEventsHandler') popupRackEventsHandler;
  @ViewChild('popupRackMoving') popupRackMoving;
  @ViewChild('SampleReceivingInfoModal') SampleReceivingInfoModal;
  spinnerRefs = {
    listSection: 'listSection'
  }
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  RackList: any = [];
  RackNo : any = null
  RackRow: any = [];

  SampleCode : any = null
  SampleRow: any = [];

  subSectionList = [];
  labDeptID = -1;
  locationID = -1;
  formUpdateRack = this.fb.group({
    sectionID: [''],
  });
  rackStatus: any=null;
  isRequired = false;
  infoMessage ='Data loading...';
  modalHeader  ="Rack's Allocation";
  scanType  = 1; //1 For Rack Scaning, 2 For Sample Scaning
  isRackAvailable = false;
  SampleSection  = "";
  RackID : number = null;
  SampleBarcode :string = null;
  loggedInUser: any;
  SampleIfoInRackList: any[];
  isReleasedBtnDisabled: boolean;
  TransferRack: any[];
  TransferRackNo: any;
  RackSection: any;
  constructor(
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private lookupService : LookupService,
    private fb : FormBuilder,
    private RackingRoutingService : RackingRoutingService,
    private auth: AuthService,
    private appPopupService: AppPopupService,
    private accessiongService: AccessioningService,
  ) { }
  
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRacks();
    this.getSubSection();
    this.getTransferRack();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getSubSection() {
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID
    }    
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.subSectionList = _response || [];
    }, (err) => {
      console.log(err)
    })
  }

  scaning(param){ 
    const rack_sample_code = param.substring(0,5)
    if(rack_sample_code.toLowerCase() =='rack-' || rack_sample_code.toLowerCase() == 'tlara'){
      this.getRackInformationByRackNo(param)
    }else{
      this.getSampleInfoByBarCode(param)
    }
  }
  getRackInformationByRackNo(rackNo){ 
    const rck = this.RackList.find(a=>a.RackNo==rackNo);
    // console.log('rck is: ',rck)
    // if(this.RackList.length && this.RackList[0].SampleCount<=0){
    //   this.toastr.info('Rack already available with empty space.')
    //   return
    // }
    this.scanType=1;
    this.rackStatus = null 
    this.RackRow = []
    const params={
      RackNo : rackNo, 
	    BranchID :  null
    }
    this.RackingRoutingService.getRackInformationByRackNo(params).subscribe((res:any) =>{
      if(res.StatusCode == 200){
        this.RackRow = res.PayLoad || [];
        if(this.RackRow.length){
          this.RackNo = this.RackRow[0]['RackNo'];
          this.RackSection = this.RackRow[0]["Section"]
          if(this.RackRow[0]['Screen']==null){
            this.rackStatus='free';
            this.isRequired = false;
            this.allocateRack();
          }else if(this.RackRow[0]['Screen']=='Transfer' && this.RackRow[0]['Capacity']>0){
            this.rackStatus='allocated';
            this.isRequired = false;
            const rackfilter = this.RackList.find(a=> a.RackNo=rackNo);
            if(rackfilter && rackfilter.RackNo ==rackNo && rackfilter.SampleCount>0){
              this.getSmapleInfoByRackNo(rackNo)
            }else if(rackfilter && rackfilter.RackNo ==rackNo && rackfilter.SampleCount<=0){
              this.releasTransferEmptyRack(rackNo)
            }
            
          }else if(this.RackRow[0]['Screen']!=null && this.RackRow[0]['Screen']!='Transfer'){
            this.rackStatus='locked';
            this.isRequired = false;
            this.appPopupService.openModal(this.popupRackEventsHandler,{size:'md', scrollable: true});
          }
          
        }else{
          this.toastr.info('No rack found.')
          this.isRequired = false;
        }
          
      }else{
        this.toastr.error(res.Message)
      }
    }, (err)=>{
      console.log(err);
      this.toastr.error('Connection Error')
    })

  }

  releasTransferEmptyRack(rackNo){
    const objParam = {
      RackNo :  rackNo,
      RackBarcode :  null,
      SectionID :  null,
      Section :  null,
      Screen :  null,
      SendOutBranchID :  null,
      LockForBranchID :  null,
    }
    this.RackingRoutingService.allocateRack(objParam).subscribe((res:any) => {
      if (JSON.parse(res.PayLoadStr).length) {
        if (res.StatusCode == 200) {
          this.toastr.success('Rack has been released successfully.');
          this.getRacks();
        } 
      }
    },(err) => {
      this.toastr.error('Connection error');
    })
  }

  getSampleInfoByBarCode(sampleCode){
    this.isRequired = false;
    this.SampleBarcode  = sampleCode;
    this.scanType=2;
    this.modalHeader ="Sample Racking";
    this.SampleCode = sampleCode;
    this.RackRow = []
    const params={
      SampleBarcode : this.SampleCode
    }

    this.RackingRoutingService.getSampleInfoByBarCode(params).subscribe((res:any) =>{
      if(res.StatusCode == 200){
        this.SampleRow = res.PayLoad || [];
        if(this.SampleRow.length){
          const rackRow = this.RackList.find(e=>e.SectionID == 41);
          if(this.SampleRow[0].RackID){
            this.toastr.warning('This sample currently exists in '+this.SampleRow[0].RackScreen+' "'+rackRow.Section+'" rack');
            return;
          }
          this.SampleSection = this.SampleRow[0].TPSubSection;
          if(rackRow) {
            this.isRackAvailable = true;
            if(rackRow.SampleCount>=rackRow.Capacity){
              this.toastr.error('Rack is full'); 
              this.RackNo= null;
              return;
            }
            this.RackID = rackRow.RackID;
            // this.appPopupService.openModal(this.popupRackEventsHandler,{size:'md', scrollable: true});
            this.putSample();
          }else{
            this.isRackAvailable = false;
            // this.appPopupService.openModal(this.popupRackEventsHandler,{size:'md', scrollable: true});
            this.toastr.info('Please scan Rack first.')
          }
        }else{
          this.toastr.info('No sample found.')
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
    this.infoMessage='Data loading...';
    this.RackList = [];
    this.RackRow = []
    this.spinner.show(this.spinnerRefs.listSection);
    const params = {
      LocID: this.loggedInUser.locationid,
      Screen:'Transfer'
    };
    this.RackingRoutingService.getRacks(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
          this.RackList =  res.PayLoad || [];
          if(this.RackList.length){
            this.RackList.map(e => {
              e.rackConfData = RACKING_ROUTING_CONFIGS.RACK[e.SectionID]||{
                backgroundColorDark: '#61717e',
                backgroundColorLight: '#ade46ca3',
                backgroundImage: '../assets/media/rack-icons/icon_rack_Default.png',
              };
            })
          }else{
            // this.toastr.info('No allocated Rack found.');
            this.spinner.hide(this.spinnerRefs.listSection);
            this.infoMessage='No rack data found.'
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
    const existingOutsourceRack = this.RackList.find(e=>e.SectionID == 41);
    let objParam={}
    let toasterMessage='';
    if(existingOutsourceRack && this.RackRow[0].SampleCount<=0 && this.rackStatus=='allocated'){
      objParam = {
        RackNo :  this.RackNo,
        RackBarcode :  null,
        SectionID :  null,
        Section :  null,
        Screen :  null,
        SendOutBranchID :  null,
        LockForBranchID :  null,
      }
      // toasterMessage = 'Oursource rack is already available with empty space';
      toasterMessage = 'Oursource rack has been released';
      this.toastr.success(toasterMessage);
      this.disabledButton = false; 
      this.isSpinner = true;
      
    }else{

      if(this.RackList.length && this.RackList[0].SampleCount<=0){
        this.toastr.info('Rack already available with empty space.')
        return
      // }

      // if(this.RackRow.length && this.RackRow[0].SampleCount>0){
      //   objParam = {
      //     RackNo :  this.RackNo,
      //     RackBarcode :  null,
      //     SectionID :  41,
      //     Section :  'Outsource',
      //     Screen :  'Accessioning',
      //     SendOutBranchID :  null,
      //     LockForBranchID :  null,
      //   }
        toasterMessage = 'Rack has been allocated successfully';
      }else{
        objParam = {
          RackNo :  this.RackNo,
          RackBarcode :  null,
          SectionID :  41,
          Section :  'Outsource',
          Screen :  'Transfer',
          SendOutBranchID :  null,
          LockForBranchID :  null,
        }
      }
      toasterMessage = 'Rack has been allocatee successfully';
    }
    this.RackingRoutingService.allocateRack(objParam).subscribe((res:any) => {
      if (JSON.parse(res.PayLoadStr).length) {
        if (res.StatusCode == 200) {
          this.isRequired=false;
          this.toastr.success(toasterMessage);
          this.disabledButton = false; 
          this.isSpinner = true;
          this.RackNo=null;
          this.appPopupService.closeModal();
          this.getRacks();
        } else {
          this.toastr.error(res.Message)
          this.disabledButton = false; 
          this.isSpinner = true;
          this.isRequired=false;
        }
      }
    },(err) => {
      console.log(err);
      this.disabledButton = false; 
      this.isSpinner = true; 
      this.isRequired=false;
      this.toastr.error('Connection error');
    })
    
  }
  putSample(){
    this.disabledButton = true; 
    this.isSpinner = false;
      const objParam = {
        SampleBarcode :  this.SampleBarcode,
        RackID :  this.RackID,
        isTLASample : 1,//isTLASample : this.isTLA? 1:0,
        LocID: this.loggedInUser.locationid, // this.isTLA? -1:this.loggedInUser.locationid
        SendOutLocID: this.loggedInUser.ParentLocID// this.isTLA? -1:this.loggedInUser.locationid
      }
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
          }
        }
      },(err) => {
        console.log(err);
        this.disabledButton = false; 
        this.isSpinner = true; 
        this.isRequired=false;
        this.toastr.error('Connection error');
    })
  }

  getSmapleInfoByRackNo(rackNo) {
    this.SampleIfoInRackList=[]
    const sampleInfoFormVal = rackNo;
    if (sampleInfoFormVal) {
      const params = {
        "RackNo": sampleInfoFormVal,
        "Screen": 'Transfer'
      }
      this.accessiongService.getSampleInfoByBarCode(params).subscribe((resp: any) => {
        if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
          this.disabledButton=false;
          this.SampleIfoInRackList = resp.PayLoad||[];
          this.SampleIfoInRackList.forEach(a => {
            a.checked = true;
            a.SampleStatusID = 3;
          })
          this.isReleasedBtnDisabled = false; 
          this.appPopupService.openModal(this.SampleReceivingInfoModal);
          // this.appPopupService.openModal(this.SampleReceivingInfoModal, { size: 'lg', scrollable: true })
          if(this.TransferRack.length){
            this.disabledButton=false;
          }else{
            this.disabledButton=true;
          }
        }else{
          this.toastr.info('No Sample to recive')
        }
      }, (err) => { console.log(err) })
    } else {
      this.toastr.warning("Please Scan Rack First")
    }
  }


  getTransferRackInformationByRackNo(rackNo){ 
    let TransferRackRowCheck= []
    const params={
      RackNo : rackNo, 
	    BranchID :  null
    }
    this.RackingRoutingService.getRackInformationByRackNo(params).subscribe((res:any) =>{
      if(res.StatusCode == 200){
        TransferRackRowCheck = res.PayLoad || [];
        if(TransferRackRowCheck.length){
          if(TransferRackRowCheck[0]['Screen']==null && TransferRackRowCheck[0]['RackTypeID']==7){
            this.allocateTransferRack(rackNo);
          }else if(TransferRackRowCheck[0]['Screen']!=null && TransferRackRowCheck[0]['RackTypeID']==7){
            this.toastr.info('Sample Transfer Rack has already scanned');
          }else{
            this.toastr.info('This is not a Sample Transfer Rack');
          }
        }else{
          this.toastr.info('No rack found.')
        }
          
      }else{
        this.toastr.error(res.Message)
      }
    }, (err)=>{
      console.log(err);
      this.toastr.error('Connection Error')
    })

  }

  allocateTransferRack(rackNo){
    if(this.TransferRack.length){
      this.toastr.info('Sample Transfer Rack is already availabl');
      return;
    }
    let objParam={}
    let toasterMessage='';
        objParam = {
          RackNo :  rackNo,
          RackBarcode :  null,
          SectionID :  41,
          Section :  'Outsource',
          Screen :  'TransferRack',
          SendOutBranchID :  null,
          LockForBranchID :  null,
        }
      toasterMessage = 'Rack has been allocatee successfully';
      this.RackingRoutingService.allocateRack(objParam).subscribe((res:any) => {
      if (JSON.parse(res.PayLoadStr).length) {
        if (res.StatusCode == 200) {
          this.TransferRackNo = rackNo;
          this.isRequired=false;
          this.toastr.success(toasterMessage);
          this.disabledButton = false; 
          this.isSpinner = true;
          // this.RackNo=null;//////////////////////////will keep in mind
          // this.appPopupService.closeModal();
          this.getTransferRack();
        } else {
          this.TransferRackNo = null;
          this.toastr.error(res.Message)
          this.disabledButton = false; 
          this.isSpinner = true;
          this.isRequired=false;
        }
      }
    },(err) => {
      console.log(err);
      this.disabledButton = false; 
      this.isSpinner = true; 
      this.isRequired=false;
      this.toastr.error('Connection error');
    })
    
  }

  getTransferRack(){
    this.disabledButton = true; 
    this.infoMessage='Data loading...';
    this.TransferRack = [];
    this.spinner.show(this.spinnerRefs.listSection);
    const params = {
      LocID: this.loggedInUser.locationid,
      Screen:'TransferRack'
    };
    this.RackingRoutingService.getRacks(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
          this.TransferRack =  res.PayLoad || [];
          if(this.TransferRack.length){
            this.disabledButton = false;
            this.isReleasedBtnDisabled= false;
            this.TransferRack.map(e => {
              e.rackConfData = RACKING_ROUTING_CONFIGS.RACK[e.SectionID]||{
                backgroundColorDark: '#61717e',
                backgroundColorLight: '#ade46ca3',
                backgroundImage: '../assets/media/rack-icons/icon_rack_Default.png',
              };
            })
          }else{
            this.disabledButton = true; 
            this.isReleasedBtnDisabled= true;
            // this.toastr.info('No Transfer allocated Rack found.');
            this.spinner.hide(this.spinnerRefs.listSection);
            this.infoMessage='No rack data found.'
          }
          this.spinner.hide(this.spinnerRefs.listSection);
      } else {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      this.disabledButton = false; 
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.listSection);
    })
  }

  moveSampleToTransferRack() {
    //param Action 1 is for view and 2 is for Print meanst print popup
    const url = environment.patientReportsPortalUrl + 'smp-bc/sample-dispatch-slip?p='+ btoa(JSON.stringify({BarCode: this.RackNo, appName: 'WebMedicubes:rackManagment', Action: 2, timeStemp: +new Date()}));
    window.open(url.toString(), '_blank');
    setTimeout(() => {
      this.moveSample();
    }, 3000);
  }

  moveSample(){
    const objParam = {
      CreatedBy: this.loggedInUser.userid || -99,
      FromRackNo: this.RackNo,
      ToRackNo: this.TransferRack[0].RackNo,
      // RackBarcode: null,
      Screen: 'TransferRack',
      SendOutBranchID: this.loggedInUser.ParentLocID,
      LockForBranchID: this.loggedInUser.ParentLocID,
      tblSampleProcess: this.SampleIfoInRackList.map(a => {
        return {
          SampleBarCode: a.SampleBarCode,
          SampleStatusID: 7
        }
      })
    }
    
    this.accessiongService.moveSampleToTransferRack(objParam).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.toastr.success("Sample Transfered");
        this.appPopupService.closeModal();
        this.getRacks();
        this.getTransferRack();
        // this.getSmapleInfoByRackNo();
        this.RackNo=null
      }else{
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => { console.log("err", err) })
  }

  viewSampleList() {
    const objParam = {
      CreatedBy: this.loggedInUser.userid || -99,
      FromRackNo: this.RackNo,
      ToRackNo: this.TransferRack[0].RackNo,
      // RackBarcode: null,
      Screen: 'TransferRack',
      SendOutBranchID: this.loggedInUser.ParentLocID,
      LockForBranchID: this.loggedInUser.ParentLocID,
      tblSampleProcess: this.SampleIfoInRackList.map(a => {
        return {
          SampleBarCode: a.SampleBarCode,
          SampleStatusID: 7
        }
      })
    }
    //param Action 1 is for view and 2 is for Print meanst print popup
    const url = environment.patientReportsPortalUrl + 'smp-bc/sample-dispatch-slip?p='+ btoa(JSON.stringify({BarCode: this.RackNo, appName: 'WebMedicubes:rackManagment', Action: 1,timeStemp: +new Date()}));
    window.open(url.toString(), '_blank');
  }
  

}
