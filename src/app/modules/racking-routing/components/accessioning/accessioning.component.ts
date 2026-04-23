// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { AccessioningService } from '../../services/accessioning.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { RackingRoutingService } from '../../services/racking-routing.service';
import { environment } from 'src/environments/environment';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-accessioning',
  templateUrl: './accessioning.component.html',
  styleUrls: ['./accessioning.component.scss']
})
export class AccessioningComponent implements OnInit {
  searchText='';
  searchTextArchived='';

  sampleInfoForm = this.fb.group({
    RackNo: ['', ''],
    SectionID: [,''],
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
  SampleIfoInRackList: any = [];
  @ViewChild('SampleReceivingInfoModal') SampleReceivingInfoModal;
  isReleasedBtnDisabled = true;
  subSectionList = [];
  labDeptID = -1;
  locationID = -1;
  sampleList = [];
  archievedSampleList = [];
  spinnerRefs = {
    listSection:'listSection'
  }
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
  RackSectionName: any ="";
  loggedInUser: UserModel;
  sectionObj: any = {};
  ScannedRackInfo: any[];
  RackNoToShow: any;
  RackSectionToShow: any;
  SectionID: any=null;
  SampleCount=0;
  isTLA = false;
  TransferRackNo:number=null;
  RackRow: any[];
  AccessioningRackID: any;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  constructor(
      private spinner: NgxSpinnerService,
      private fb: FormBuilder,
      private toastr: ToastrService,
      private accessiongService: AccessioningService,
      private appPopupService: AppPopupService,
      private lookupService : LookupService,
      private auth: AuthService,
      private RackingRoutingService : RackingRoutingService,
    ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getSubSection();
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

    // this.getSampleListByScreen();
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
      this.subSectionList.push({SubSectionId: -1, SubSectionCode: 'TLASamples', SubSectionTitle: 'TLASamples', SubSectionShortName: 'TLASamples'})
      console.log('Subsection list is: ',this.subSectionList)
    }, (err) => {
      console.log(err)
    })
  }

  getSmapleInfoByRackNo() {
    this.SampleIfoInRackList=[]
    const sampleInfoFormVal = this.sampleInfoForm.getRawValue();
    if (sampleInfoFormVal.RackNo) {
      const params = {
        "RackNo": sampleInfoFormVal.RackNo,
        "Screen": 'Accessioning'
      }
      this.accessiongService.getSampleInfoByBarCode(params).subscribe((resp: any) => {
        if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
          this.SampleIfoInRackList = resp.PayLoad||[];
          this.AccessioningRackID = this.SampleIfoInRackList[0].RackID
          this.SampleCount = this.SampleIfoInRackList.length;
          this.SampleIfoInRackList.forEach(a => {
            // console.log('a.StatusId > 0 || a.StatusId < 8 ', a.StatusId, a.StatusId > 0, a.StatusId < 8);
            a.checked = true;
            a.SampleStatusID = 3;
          })
          this.isReleasedBtnDisabled = false; 
          this.getRackInformationByRackNo(sampleInfoFormVal.RackNo)
          this.appPopupService.openModal(this.SampleReceivingInfoModal);
        }else{
          this.toastr.info('No Sample to recive')
        }
      }, (err) => { console.log(err) })
    } else {
      this.toastr.warning("Please Scan Rack First")
    }
  }

  lockRackByRackBarcode() {
    const sampleInfoFormVal = this.sampleInfoForm.getRawValue();
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // console.log('sampleInfoForm:________________',sampleInfoFormVal,this.TransferRackNo);return;
    ///------------------------------------------------------------------------------------if TLA------------------------------------------------------------------
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
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      this.RackingRoutingService.getRackInformationByRackNo(params).subscribe((res:any) =>{
        if(res.StatusCode == 200){
          this.RackRow = res.PayLoad || [];
          
          // console.log('RackRow__________',this.RackRow[0]['RackID']);return;
          //////////////////////////////////////////////////////////////////
            if(this.RackRow.length){
              if(this.RackRow[0]['Screen']==null){
                let isRemarks = true;
                this.SampleIfoInRackList.forEach(a => {
                  if (a.SampleStatusID!=3 && !a.Remarks) {
                    isRemarks = false;
                  }
                })
                if (!isRemarks) {
                  this.toastr.error('Remarks is empty! please enter remarks');
                  return;
                } else {
                  var objParam = {
                    CreatedBy: this.loggedInUser.userid || -99,
                    RackNo: sampleInfoFormVal.RackNo,
                    AccessioningRackID:this.RackRow[0]['RackID'],
                    SectionScreen: 'AccessioningTransfer',
                    tblSampleProcess: this.SampleIfoInRackList.map(a => {
                      return {
                        SampleBarCode: a.SampleBarCode,
                        SampleStatusID:  a.SampleStatusID, //3,
                        Remarks: a.Remarks
  
                      }
                    })
                  }
                  // console.log('objParam_______',objParam);return;
                }
                this.accessiongService.lockRackByRackBarcode(objParam).subscribe((resp: any) => {
                  if (sampleInfoFormVal.RackNo) {
                    this.toastr.success("Sample received and Rack Released");
                    this.appPopupService.closeModal();
                    this.getSmapleInfoByRackNo();
                    this.sectionObj.SubSectionId=this.SectionID;
                    this.getSampleListByScreen(this.sectionObj)
                    this.sampleInfoForm.patchValue({
                      SectionID: this.SectionID
                    })
  
                  }
                  else {
                    this.toastr.warning("")
                  }
                }, (err) => { console.log("err", err) })
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
          //////////////////////////////////////////////////////////////////
          
            
        }else{
          this.toastr.error(res.Message)
        }
      }, (err)=>{
        console.log(err);
        this.toastr.error('Connection Error')
      })
    }//end of tla
    else{
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
          RackNo: sampleInfoFormVal.RackNo,
          // AccessioningRackID:null,
          AccessioningRackID:this.AccessioningRackID,
          SectionScreen: 'AccessioningTransfer',
          tblSampleProcess: this.SampleIfoInRackList.map(a => {
            return {
              SampleBarCode: a.SampleBarCode,
              SampleStatusID:  a.SampleStatusID, //3,
              Remarks: a.Remarks

            }
          })
        }
        // console.log('objParam_______',objParam);return;
      }
      this.accessiongService.lockRackByRackBarcode(objParam).subscribe((resp: any) => {
        if (sampleInfoFormVal.RackNo) {
          this.toastr.success("Sample received and Rack Released");
          this.appPopupService.closeModal();
          this.getSmapleInfoByRackNo();
          this.sectionObj.SubSectionId=this.SectionID;
          this.getSampleListByScreen(this.sectionObj)
          this.sampleInfoForm.patchValue({
            SectionID: this.SectionID
          })

        }
        else {
          this.toastr.warning("")
        }
      }, (err) => { console.log("err", err) })
    }//end of normal rack
  }

  selectAllSamples(e) {
    // console.log('e.target.value ', e, e.target.checked);
    this.SampleIfoInRackList.forEach(a => {
      a.checked = false;
      // console.log('a.StatusId > 0 || a.StatusId < 8 ', a.StatusId, a.StatusId > 0, a.StatusId < 8);
      a.checked = e.target.checked;
    })
  }
  closeLoginModal() {
    this.appPopupService.closeModal();
  }
  OpencancelledMoreInfoPopup() { 
    this.getSmapleInfoByRackNo();
    // this.appPopupService.openModal(this.SampleReceivingInfoModal);
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

    console.log('Sample List is: ',this.sampleList)
  }

  // getSampleListByScreenAfterReceive(sectionID) {
  //   if(this.sectionObj){
  //     this.spinner.show(this.spinnerRefs.listSection);
  //     let objParm = {
  //       BranchID: this.loggedInUser.locationid,
  //       SubSectionID: sectionID,
  //       Screen: "Accessioning"
  //     }  

  //     this.accessiongService.getSampleListByScreen(objParm).subscribe((res:any)=>{
  //       this.spinner.hide(this.spinnerRefs.listSection);
  //       if(res.StatusCode==200){
  //         this.sampleList = res.PayLoad||[];
  //         this.RackSectionName=this.sectionObj.SubSectionShortName
  //       }else{
  //         this.toastr.error(res.Message)
  //       }
  //     },(err) => {
  //       this.spinner.hide(this.spinnerRefs.listSection);
  //       console.log("loading search result error", err);
  //     })
  //   } else {
  //     this.sampleList = [];
  //   }
  // }

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
        // console.log('sample list info is: ',this.ScannedRackInfo)
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
          // this.RackSectionToShow = this.ScannedRackInfo['Section'];
          // this.SectionID = this.ScannedRackInfo['SectionID'];
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
    
    console.log('param: ',objParm);
    this.accessiongService.getSampleListByScreen(objParm).subscribe((res:any)=>{
      this.disabledButton = false;
      this.isSpinner = true;
      // console.log('response________',res)
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

    console.log('Sample List is: ',this.sampleList)
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
    
    // console.log('param: ',objParm);
    this.accessiongService.getSampleListByScreen(objParm).subscribe((res:any)=>{
      this.disabledButton = false;
      this.isSpinner = true;
      this.spinner.hide(this.spinnerRefs.listSection);
      if(res.StatusCode==200){
        this.archievedSampleList = res.PayLoad||[];
        console.log('List: ',this.archievedSampleList);
      }else{
        this.toastr.error(res.Message)
      }
    },(err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log("loading search result error", err);
    })
  }
  // (focusChange)="yourfun($event)"
  // yourfun(evt){
  //   this.serchSample()
  // }
}