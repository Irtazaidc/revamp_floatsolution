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
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-sample-receive',
  templateUrl: './sample-receive.component.html',
  styleUrls: ['./sample-receive.component.scss']
})
export class SampleReceiveComponent implements OnInit {
  searchTextOutside='';
  searchTextOutsideArchived='';
  sampleInfoForm = this.fb.group({
    RackNo: ['', ''],
    SectionID: [],
  });
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
  sectionObj: any = {};
  formUpdateRack = this.fb.group({
    sectionID: [''],
  });

  worklistForm = this.fb.group({
    SectionID: [, ''],
    StartDate: [''],
    EndDate: [''],
    SampleStatus: [''],
  });
  archievedForm = this.fb.group({
    SectionID: [, ''],
    StartDate: [''],
    EndDate: [''],
    SampleStatus: [''],
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
  RackSection: any;
  sampleList=[];
  archievedSampleList=[];
  RackSectionName: any;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to transfer ?',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  SectionID: any;
  ScannedRackInfo: any[];
  RackNoToShow: any;
  RackSectionToShow: any;
  SampleCount = 0;
  isTLA = false;
  TransferRackNo:number=null;
  AccessioningRackID: any;
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
    // this.getRacks();
    this.getSubSection();
    // this.getTransferRack();
    setTimeout(() => {
      this.worklistForm.patchValue({
        StartDate: Conversions.getCurrentDateObject(),
        EndDate: Conversions.getCurrentDateObject(),
        SectionID: -1
      });
      this.archievedForm.patchValue({
        StartDate: Conversions.getCurrentDateObject(),
        EndDate: Conversions.getCurrentDateObject(),
        SectionID: -1
      });
      this.serchSample();
      this.serchArchievedSample();
    }, 100);
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getSmapleInfoByRackNo(rackNo) {
    this.RackNo = rackNo;
    this.SampleIfoInRackList=[]
    const sampleInfoFormVal = rackNo;
    if (sampleInfoFormVal) {
      const params = {
        "RackNo": sampleInfoFormVal,
        "Screen": 'TransferRack'
      }
      this.accessiongService.getSampleInfoByBarCode(params).subscribe((resp: any) => {
        if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
          this.disabledButton=false;
          this.SampleIfoInRackList = resp.PayLoad||[];
          this.SampleCount = this.SampleIfoInRackList.length;
          this.AccessioningRackID = this.SampleIfoInRackList[0].RackID
          // console.log('Samples List: ',this.SampleIfoInRackList); 
          this.SampleIfoInRackList.forEach(a => {
            a.checked = true;
            a.SampleStatusID = 3;
          })
          this.isReleasedBtnDisabled = false; 
          this.getRackInformationByRackNo(rackNo)
          this.appPopupService.openModal(this.SampleReceivingInfoModal);
          // this.appPopupService.openModal(this.SampleReceivingInfoModal, { size: 'lg', scrollable: true })
        }else{
          this.toastr.info('No Sample to recive')
        }
      }, (err) => { console.log(err) })
    } else {
      this.toastr.warning("Please Scan Rack First")
    }
  }
  
  moveSampleToTransferRack() {
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
          SampleStatusID: 5
        }
      })
    }
    // console.log("Sample list: ",objParam);return;
    this.accessiongService.moveSampleToTransferRack(objParam).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.toastr.success("Sample Transfered");
        this.appPopupService.closeModal();
        // this.getRacks();
        // this.getTransferRack();
        // this.getSmapleInfoByRackNo();
        this.RackNo=null
      }else{
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => { console.log("err", err) })
  }

  lockRackByRackBarcode_() {
    // let sampleInfoFormVal = this.sampleInfoForm.getRawValue();
    let isRemarks = true;
    this.SampleIfoInRackList.forEach(a => {
      if (a.SampleStatusID!=3 && !a.Remarks) {
        isRemarks = false;
      }
    })
    if (!isRemarks) {
      this.toastr.warning('Remarks is empty! please enter remarks');
      return;
    } else {
      var objParam = {
        CreatedBy: this.loggedInUser.userid || -99,
        RackNo: this.RackNo,
        tblSampleProcess: this.SampleIfoInRackList.map(a => {
          return {
            SampleBarCode: a.SampleBarCode,
            SampleStatusID: 3,
            Remarks: ''
          }
        })
      }
    }
    // console.log("Sample list: ",objParam);return;
    this.accessiongService.lockRackByRackBarcode(objParam).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.toastr.success("Sample has been received successfully");
        this.appPopupService.closeModal();
      }else{
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => { console.log("err", err) })
  }


  lockRackByRackBarcode() {
    if(this.isTLA){
      if(!this.TransferRackNo){
        this.toastr.error('Please Scan any free rack')
        return;
      }

      this.RackRow = []
      const params={
        RackNo : this.TransferRackNo, 
        BranchID :  null
      }
      this.RackingRoutingService.getRackInformationByRackNo(params).subscribe((res:any) =>{
        if(res.StatusCode == 200){
          this.RackRow = res.PayLoad || [];
            if(this.RackRow.length){
              //////////////start:: tla flow when lock rack ///////////
              if(this.RackRow[0]['Screen']==null){
                let isRemarks = true;
                this.SampleIfoInRackList.forEach(a => {
                  if (a.SampleStatusID!=3 && !a.Remarks) {
                    isRemarks = false;
                  }
                })
                if (!isRemarks) {
                  this.toastr.warning('Remarks is empty! please enter remarks');
                  return;
                } else {
                  var objParam = {
                    CreatedBy: this.loggedInUser.userid || -99,
                    RackNo: this.RackNo,
                    AccessioningRackID:this.RackRow[0]['RackID'],
                    SectionScreen: 'AccessioningTransfer',
                    tblSampleProcess: this.SampleIfoInRackList.map(a => {
                      return {
                        SampleBarCode: a.SampleBarCode,
                        SampleStatusID: a.SampleStatusID,//3,
                        Remarks: a.Remarks

                      }
                    })
                  }
                }

                this.accessiongService.lockRackByRackBarcode(objParam).subscribe((resp: any) => {
                  if (resp.StatusCode == 200) {
                    this.toastr.success("Sample has been received successfully");
                    this.appPopupService.closeModal();
                    this.sectionObj.SubSectionId=this.SectionID;
                    this.getSampleListByScreen(this.sectionObj)
                    this.sampleInfoForm.patchValue({
                      SectionID: this.SectionID
                    })
                  
                  }else{
                    this.toastr.error('Something went wrong! Please contact administrator');
                  }
                }, (err) => { console.log("err", err) })
                //////////////end::tla flow when lock rack ///////////
                
              }else if(this.RackRow[0]['Screen']=='Racking'){
                this.toastr.warning("this rack is already allocated");
                return;
              }else if(this.RackRow[0]['Screen']!=null && this.RackRow[0]['Screen']!='Racking'){
                this.toastr.warning("this rack is already locked");
                return;
              }
            }else{
              this.toastr.warning('No rack fount')
            }
          
            
        }else{
          this.toastr.error(res.Message)
        }
      }, (err)=>{
        console.log(err);
        this.toastr.error('Connection Error')
      })

      /////////////////////tla flow/////////////////////////

    }else{
      ///////////start::normal flow ... not tla/////////
      let isRemarks = true;
      this.SampleIfoInRackList.forEach(a => {
        if (a.SampleStatusID!=3 && !a.Remarks) {
          isRemarks = false;
        }
      })
      if (!isRemarks) {
        this.toastr.warning('Remarks is empty! please enter remarks');
        return;
      } else {
        var objParam = {
          CreatedBy: this.loggedInUser.userid || -99,
          RackNo: this.RackNo,
          AccessioningRackID:this.AccessioningRackID,
          SectionScreen: 'AccessioningTransfer',
          tblSampleProcess: this.SampleIfoInRackList.map(a => {
            return {
              SampleBarCode: a.SampleBarCode,
              SampleStatusID: a.SampleStatusID,//3,
              emarks: a.Remarks

            }
          })
        }
      }

      this.accessiongService.lockRackByRackBarcode(objParam).subscribe((resp: any) => {
        if (resp.StatusCode == 200) {
          this.toastr.success("Sample has been received successfully");
          this.appPopupService.closeModal();
          this.sectionObj.SubSectionId=this.SectionID;
          this.getSampleListByScreen(this.sectionObj)
          this.sampleInfoForm.patchValue({
            SectionID: this.SectionID
          })
        
        }else{
          this.toastr.error('Something went wrong! Please contact administrator');
        }
      }, (err) => { console.log("err", err) })

      /////////end::normal flow//////////

    }
  }


  getSampleListByScreen(data) {
    this.sectionObj ={}
    this.sectionObj = data;
    if(this.sectionObj){
      this.spinner.show(this.spinnerRefs.listSection);
      const objParm = {
        BranchID: this.loggedInUser.locationid,
        SubSectionID: this.sectionObj.SubSectionId||null,
        Screen: "Accessioning"
      }  

      this.accessiongService.getSampleListByScreen(objParm).subscribe((res:any)=>{
        this.spinner.hide(this.spinnerRefs.listSection);
        if(res.StatusCode==200){
          this.sampleList = res.PayLoad||[];
          this.RackSectionName=this.sectionObj.SubSectionShortName
          // console.log('sample list is: ',this.sectionObj)
        }else{
          this.toastr.error(res.Message)
        }
      },(err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.log("loading search result error", err);
      })
    } else {
      this.sampleList = [];
    }
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
      this.subSectionList.push({SubSectionId: -1, SubSectionCode: 'TLASamples', SubSectionTitle: 'TLASamples', SubSectionShortName: 'TLASamples'})
    }, (err) => {
      console.log(err)
    })
  }

  transferSampleToMachine(LabId){
    const objParm = {
      SampleBarcode: LabId,
      CreatedBy: this.loggedInUser.userid || -99,
      Remarks: null
    }  

    this.accessiongService.transferSampleToMachine(objParm).subscribe((res:any)=>{
      this.spinner.hide(this.spinnerRefs.listSection);
      if(res.StatusCode==200){
        this.toastr.success('Sample successfully transfered to machine')
        this.getSampleListByScreen(this.sectionObj)
      }else{
        this.toastr.error(res.Message)
      }
    },(err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log("loading search result error", err);
    })
  }

  getRackInformationByRackNo(rackNo){
    this.ScannedRackInfo = []
    const params={
      RackNo : rackNo, 
	    BranchID :  null
    }
    this.RackingRoutingService.getRackInformationByRackNo(params).subscribe((res:any) =>{
      if(res.StatusCode == 200){
        this.ScannedRackInfo = res.PayLoad[0] || [];
        // console.log('Rack Row is: ',this.ScannedRackInfo)
        if(this.ScannedRackInfo){
          this.RackNoToShow = this.ScannedRackInfo['RackNo'];
          this.RackSectionToShow = (this.ScannedRackInfo['Section']==null)?'TLASample': this.ScannedRackInfo['Section'];
          const rack_sample_code = this.RackNoToShow.substring(0,5)
          if(rack_sample_code.toLowerCase() == 'tlara'){
            this.RackSectionToShow ='TLA'
            this.isTLA = true;
          }else{
            this.RackSectionToShow = this.ScannedRackInfo['Section'];
            this.isTLA = false;
          }
          this.SectionID = ( this.ScannedRackInfo['SectionID']==null)? -1 : this.ScannedRackInfo['SectionID'];
        }else{
          this.ScannedRackInfo=[]
        } 
      }
    }, (err)=>{
      console.log(err);
      this.toastr.error('Connection Error')
    })
  }

  selectAllSamples(e) {
    // console.log('e.target.value ', e, e.target.checked);
    this.SampleIfoInRackList.forEach(a => {
      a.checked = false;
      // console.log('a.StatusId > 0 || a.StatusId < 8 ', a.StatusId, a.StatusId > 0, a.StatusId < 8);
      a.checked = e.target.checked;
    })
  }


  serchSample(){
    this.sampleList=[];
    this.disabledButton = true;
    this.isSpinner = false; 
    const formValues = this.worklistForm.getRawValue();
    this.spinner.show(this.spinnerRefs.listSection);
    const objParm = {
      BranchID: this.loggedInUser.locationid,
      SubSectionID: formValues.SectionID||null,
      Screen: "Accessioning",
      StartDate: formValues.StartDate ? Conversions.formatDateObject(formValues.StartDate) : '',
      EndDate: formValues.EndDate ? Conversions.formatDateObject(formValues.EndDate) : '',
      SampleStatusID: 3 //formValues.SampleStatus||null
    }  
    
    this.accessiongService.getSampleListByScreen(objParm).subscribe((res:any)=>{
      this.disabledButton = false;
      this.isSpinner = true;
      this.spinner.hide(this.spinnerRefs.listSection);
      if(res.StatusCode==200){
        this.sampleList = res.PayLoad||[];
        this.RackSectionName=this.sectionObj.SubSectionShortName
      }else{
        this.toastr.error(res.Message)
      }
    },(err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log("loading search result error", err);
    })

  }

  serchArchievedSample(){
    // this.archievedSampleList =[]
    this.disabledButton = true;
    this.isSpinner = false; 
    const formValues = this.archievedForm.getRawValue();
    this.spinner.show(this.spinnerRefs.listSection);
    const objParm = {
      BranchID: this.loggedInUser.locationid,
      SubSectionID: formValues.SectionID||null,
      Screen: "Accessioning",
      StartDate: formValues.StartDate ? Conversions.formatDateObject(formValues.StartDate) : '',
      EndDate: formValues.EndDate ? Conversions.formatDateObject(formValues.EndDate) : '',
      SampleStatusID: formValues.SampleStatus||null
    }  
    
    this.accessiongService.getSampleListByScreen(objParm).subscribe((res:any)=>{
      this.disabledButton = false;
      this.isSpinner = true;
      this.spinner.hide(this.spinnerRefs.listSection);
      if(res.StatusCode==200){
        this.archievedSampleList = res.PayLoad||[];
        // console.log('List: ',this.archievedSampleList);
      }else{
        this.toastr.error(res.Message)
      }
    },(err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log("loading search result error", err);
    })
  }
  
}
