// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import Swal from 'sweetalert2';

@Component({
  standalone: false,

  selector: 'app-test-profile-rates',
  templateUrl: './test-profile-rates.component.html',
  styleUrls: ['./test-profile-rates.component.scss']
})
export class TestProfileRatesComponent implements OnInit {

  // patientTypeList = [];
  rdSearchBy = 'byCode'
  chkSearchByExactMatch = true
  clear = false
  totalTPPrice = 0
  discountAmount = 0
  selectedLocId = 1
  selectedPanelId = null
  selectedTPID = 0
  discountPercentage = 0
  discountedCharges = 0
  branchList = []
  panelList = []
  testList = []
  // selectedTPIDs = [{
  //   code: "",
  //   description: "",
  //   process: "",
  //   deliveryDate: null,
  //   price: 0,
  //   action: ""
  // }]
  selectedTPIDs = [];
  spinnerRefs = {
    TestSection: "TestSection",
  }

  constructor(
    private lookupService: LookupService,
    private testProfileService: TestProfileService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,

  ) { }

  ngOnInit(): void {
    this.getPanelList();
    this.getLocationList();
    this.getTestProfileList();
  }

  branchListChanged(e) {
    // console.log("Loc ID", this.selectedLocId, e.LocId);
    this.selectedLocId = e.LocId
    setTimeout(() => {
      this.getTestProfileList();
    }, 100);
  }
  panelListChanged(e) {
    if (e) {
      console.log("pane1", e.PanelId);
    }
    // console.log("Panel ID2", this.selectedPanelId, e && e.PanelId ? e.PanelId : null);
    this.getTestProfileList();

    // setTimeout(() => {
    //   // console.log("loop1", this.selectedTPIDs, this.selectedTPIDs.length);
    //     for (let i = 0; i < this.selectedTPIDs.length; i++) {
    //       matchTest = this.testList.find(x => x.TPId == this.selectedTPIDs[i].TPId)
    //       // console.log("matchunmatcheif",matchTest);
    //       if (matchTest){
    //         matchTest['isMatch'] = 1;
    //         updatedTPIDs.push(matchTest);
    //       }
    //       else {
    //         unmatchTest = this.selectedTPIDs[i];
    //         unmatchTest['TestProfilePrice'] = 0;
    //         unmatchTest['isMatch'] = 0;
    //         updatedTPIDs.push(unmatchTest);
    //         // console.log("matchunmatchelse",unmatchTest);
    //       }
    //       // console.log("matchunmatch",updatedTPIDs);
    //     }
    //     this.selectedTPIDs = updatedTPIDs;
    //     this.totalTPPrice = this.selectedTPIDs.reduce((pv, cv) => pv + cv.TestProfilePrice, 0);
    //     this.calculateDiscountedCharges(this.discountPercentage);
    //     let latestTestList = this.testList.filter(x => !updatedTPIDs.find(y => y.TPId == x.TPId));
    //     // console.log("latestTestList", latestTestList);
    //     this.testList = latestTestList
    // }, 5000);

  }
  // updateSelectedTPIDsList() {
  //   let updatedTPIDs = []
  //   let matchTest = {}
  //   let unmatchTest = {}
  //   for (let i = 0; i < this.selectedTPIDs.length; i++) {
  //     // Skip processing if forPkg is true for the current selectedTPID
  //     if (this.selectedTPIDs[i].forPkg) {
  //       continue; // Move to the next iteration
  //     }
    
  //     // Find a match in the testList
  //      matchTest = this.testList.find(x => x.TPId === this.selectedTPIDs[i].TPId);
  //      console.log("🚀 ~ TestProfileRatesComponent ~ updateSelectedTPIDsList ~ matchTest:", matchTest)
  //     if (matchTest) {
  //       matchTest['isMatch'] = 1;
  //       updatedTPIDs.push(matchTest);
  //     } else {
  //       unmatchTest = { ...this.selectedTPIDs[i] }; 
  //       unmatchTest['TestProfilePrice'] = 0;
  //       unmatchTest['isMatch'] = 0;
  //       updatedTPIDs.push(unmatchTest);
  //     }
  //   }
  //   console.log("🚀 ~ TestProfileRatesComponent ~ updateSelectedTPIDsList ~ updatedTPIDs:", updatedTPIDs)
  
  //   this.selectedTPIDs = updatedTPIDs;
  //   this.totalTPPrice = this.selectedTPIDs.reduce((pv, cv) => pv + cv.TestProfilePrice, 0);
  //   this.discountAmount = this.selectedTPIDs.reduce((pv, cv) => pv + cv.itemDiscount, 0);
  //   this.calculateDiscountedCharges(this.discountPercentage);
  //   let latestTestList = this.testList.filter(x => !updatedTPIDs.find(y => y.TPId == x.TPId));
  //   // console.log("latestTestList", latestTestList);
  //   this.testList = latestTestList;
  //   this.testList.forEach(element => {
  //     (element.IsDiscountable == 1) ? (element.itemDiscount = this.discountPercentage * element.TestProfilePrice / 100) : (element.itemDiscount = 0);
  //     (element.IsDiscountable == 1) ? (element.discountedPrice = element.TestProfilePrice - element.itemDiscount) : (element.discountedPrice = element.TestProfilePrice);
  //   });
  //   this.selectedTPIDs.forEach(element => {
  //     (element.IsDiscountable == 1) ? (element.itemDiscount = this.discountPercentage * element.TestProfilePrice / 100) : (element.itemDiscount = 0);
  //     (element.IsDiscountable == 1) ? (element.discountedPrice = element.TestProfilePrice - element.itemDiscount) : (element.discountedPrice = element.TestProfilePrice);
  //   });
  // }

  updateSelectedTPIDsList() {
    let updatedTPIDs = [];
    let matchTest = {};
    let unmatchTest = {};
  
    for (let i = 0; i < this.selectedTPIDs.length; i++) {
      const currentTP = this.selectedTPIDs[i];
  
      if (currentTP.forPkg) {
        updatedTPIDs.push({ ...currentTP, isMatch: 1 }); // Ensure isMatch is explicitly set
        continue; // Move to the next iteration
      }
  
      matchTest = this.testList.find(x => x.TPId === currentTP.TPId);
      if (matchTest) {
        matchTest['isMatch'] = 1;
        updatedTPIDs.push(matchTest);
      } else {
        unmatchTest = { ...currentTP }; // Create a copy of the unmatched item
        unmatchTest['TestProfilePrice'] = currentTP.TestProfilePrice; // Preserve the original price
        unmatchTest['isMatch'] = 0;
        updatedTPIDs.push(unmatchTest);
      }
    }

    console.log("🚀 ~ Updated TPIDs:", updatedTPIDs);
    // Update selectedTPIDs with the processed list
    this.selectedTPIDs = updatedTPIDs;
    this.totalTPPrice = this.selectedTPIDs.reduce((pv, cv) => pv + cv.TestProfilePrice, 0);
    this.discountAmount = this.selectedTPIDs.reduce((pv, cv) => pv + (cv.itemDiscount || 0), 0);
    this.calculateDiscountedCharges(this.discountPercentage);
    let latestTestList = this.testList.filter(x => !updatedTPIDs.find(y => y.TPId === x.TPId));
    this.testList = latestTestList;
    this.testList.forEach(element => {
      element.itemDiscount = element.IsDiscountable == 1
        ? this.discountPercentage * element.TestProfilePrice / 100
        : 0;
      element.discountedPrice = element.TestProfilePrice - element.itemDiscount;
    });
    this.selectedTPIDs.forEach(element => {
      element.itemDiscount = element.IsDiscountable == 1
        ? this.discountPercentage * element.TestProfilePrice / 100
        : 0;
      element.discountedPrice = element.TestProfilePrice - element.itemDiscount;
    });
  }
  

  customSearchFn = (term: string, item: any) => {
    term = term.toLowerCase();
    // console.log('hell 2 ',this.rdSearchBy);
    //console.log("radio value",SearchBy.value);
    if (this.rdSearchBy == 'byCode') {
      if (this.chkSearchByExactMatch) {
        return item.TestProfileCode.toLowerCase() == term;
      }
      return item.TestProfileCode.toLowerCase().indexOf(term) == 0;
    }
    else if (this.rdSearchBy == 'byName') {
      return item.TestProfileName.toLowerCase().indexOf(term) > -1;
    }

    //this.testList = this.testList['TestProfileName'].includes(term);
  }
  rdSearchByClick(a) {
    this.rdSearchBy = a;
  }

  getPackageList(e){

      let _params = {
        packageId: e.TPId,
        branchId: this.selectedLocId || null,
        panelId: (this.selectedPanelId || ''),
      }
      this.spinner.show();
      this.testProfileService.getPackageTestsProfiles(_params).subscribe((res: any) => {
        this.spinner.hide();
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          if (data.length) {
            console.log("getPackageTestsProfiles ~ data:", data);
            data.forEach(element => {
              element.forPkg = e.TPId;
            });
            let sameTestProfiles = data.forEach(a => { // if test/profile is in package then remove already added test/profile and use test/profile that is part of package
              let exist = this.selectedTPIDs.find(b => b.TPId == a.TPId);
              if (exist) {
                this.selectedTPIDs = this.selectedTPIDs.filter(b => b.TPId != a.TPId);
              }
            });
            this.selectedTPIDs = [...this.selectedTPIDs, ...data];
          }
        }
      }, (err) => {
        this.spinner.hide();
        console.log(err);
      });
  }

  testListChanged(e) {
    console.log("🚀 testListChanged ~ e:", e)
    // this.selectedTPID=e.TPID;
    let newTest = this.testList.find(x => x.TPId == this.selectedTPID)
    this.spinner.show(this.spinnerRefs.TestSection);
    if (newTest) {
      // console.log("Test ID", this.testList.find(x => x.TPId == this.selectedTPID));
      this.selectedTPIDs.push(newTest);
      if (e.AssociatedTPIDs) {
        let comm = e.AssociatedTPIDs.split(',');
        try {
          comm.forEach(a => {
            if (!this.selectedTPIDs.find(c => c.TPId == a)) {
              this.testList.map(b => {
                if (b.TPId == Number(a)) {
                  this.selectedTPIDs.push(b);
                  if (b.TypeId == 1 || b.TypeId == 3) {
                    let profilesIds = this.selectedTPIDs.filter(a => a.TypeId == 2).map(a => a.TPId).join(',');
                  } else if (b.TypeId == 2) {
                  }
                }
              });
            }
            else {
              this.toastr.info('Already selected');
            }
          });
        }
        catch (ex) {
          console.log(ex);
        }
      }

      this.totalTPPrice = this.selectedTPIDs.reduce((pv, cv) => pv + cv.TestProfilePrice, 0);

      // console.log("totla", this.totalTPPrice);
      this.calculateDiscountedCharges(this.discountPercentage);
      // After selecting the text remove the selected row from testList
      // let testListIndex = this.testList.findIndex(x=>x.TPId == this.selectedTPID)
      // let latestTestList = this.testList.filter(x => x.TPId != this.selectedTPID);

      // let latestTestList = this.testList.map(a => {
      //    this.selectedTPIDs.filter(x => x.TPId != a.TPId);
      // })

      //   var latestTestListo = this.testList.filter(function (o1) {
      //     return !this.selectedTPIDs.some(function (o2) {
      //         return o1.id === o2.id; // return the ones with equal id
      //    });
      // });
      // // if you want to be more clever...
      let latestTestList = this.testList.filter(o1 => !this.selectedTPIDs.some(o2 => o1.TPId === o2.TPId));
      // let latestTestList = this.testList.filter(x => x.TPId != this.selectedTPID)

     
      this.selectedTPIDs.forEach(element => {
        (element.IsDiscountable == 1) ? (element.itemDiscount = this.discountPercentage * element.TestProfilePrice / 100) : (element.itemDiscount = 0);
        (element.IsDiscountable == 1) ? (element.discountedPrice = element.TestProfilePrice - element.itemDiscount) : (element.discountedPrice = element.TestProfilePrice);
      });
      this.discountAmount = this.selectedTPIDs.reduce((pv, cv) => pv + cv.itemDiscount, 0);

      this.testList = latestTestList;
       this.spinner.hide(this.spinnerRefs.TestSection);
    
      console.log("selectedTPIDs ", this.selectedTPIDs);
      if(e.TypeId == 3){this.getPackageList(e)}
    }
    this.spinner.hide(this.spinnerRefs.TestSection);
    setTimeout(() => {
      this.selectedTPID = null;
    }, 100);
    // this.testList.push(this.testList.find(x=>x.TPID == this.selectedTPID));
    if(!e){
      this.getTestProfileList();
    }
  }
  tpParametersForPopover = []
  showTestDetail(tp){
    this.getParameterByTPID(tp);
    this.getTestProfileProtocolAndPatientInstruction(tp.TPId);
    
  }
  getParameterByTPID(tp) {
    console.log("🚀 ~ TestProfileRatesComponent ~ getParameterByTPID ~ tp:", tp)
    const targetIDs = ['51', '47', '7', '58', '45', '39', '46', '37', '43', '12', '36', '50', '18', '44', '34', '35', '49', '38', '48', '25', '29', '62']; 
    if(tp.SubSectionID){
      if (targetIDs.includes(tp.SubSectionID.toString())) {
        console.log('true')
          let TestProfileCode = tp.TestProfileCode;
          let TestProfileName = tp.TestProfileName;
          this.tpParametersForPopover = [{ Code: TestProfileCode, Name: TestProfileName }];
          return;
      }
    }   
    this.tpParametersForPopover = [];
    // let params = {
    //   profileIds: tp.TPId
    // }
    // this.tpParametersForPopover = [{ Code: 'Loading...', Name: '' }];
    // this.testProfileService.getTestsByProfileId(params).subscribe((res: any) => {
    //   if (res.StatusCode == 200 && res.PayLoad) {
    //     console.table(res.PayLoad);
    //     this.tpParametersForPopover = res.PayLoad;
    //   }
    // }, err => {
    //   this.tpParametersForPopover = [{ Code: 'server error', Name: '' }];
    //   console.log(err);
    // })
    let params = {
      TPId: tp.TPId
    }
    this.tpParametersForPopover = [{ Code: 'Loading...', Name: '' }];
    this.testProfileService.GetTestsByTestProfileID(params).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad) {
        console.table(res.PayLoad);
        this.tpParametersForPopover = res.PayLoad;
      }
    }, err => {
      this.tpParametersForPopover = [{ Code: 'server error', Name: '' }];
      console.log(err);
    })
  }
  protocol = null;
  patientInstruction = null;
  getTestProfileProtocolAndPatientInstruction(TPId) {
    this.protocol = null;
    let params = {
      TPId: TPId
    }
    this.testProfileService.getTestProfileProtocolAndPatientInstruction(params).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
        console.table(res.PayLoad)
        this.protocol = res.PayLoad[0].Protocol;
        this.patientInstruction = res.PayLoad[0].PatientInstruction;
      }
    }, err => {
      console.log(err);
    })
  }

  showTPProtocol(TPId) {
    this.tpParametersForPopover = [];
    let params = {
      profileIds: TPId
    }
    this.tpParametersForPopover = [{ Code: 'Loading...', Name: '' }];
    this.testProfileService.getTestsByProfileId(params).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad) {
        console.table(res.PayLoad);
        this.tpParametersForPopover = res.PayLoad;
      }
    }, err => {
      this.tpParametersForPopover = [{ Code: 'server error', Name: '' }];
      console.log(err);
    })
  }




  getPanelList() {
    this.panelList = [];
    let _param = {};
    this.lookupService.getPanels(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.panelList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  getLocationList() {
    this.branchList = [];
    let _param = {};
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.branchList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  getTestProfileList() {
    this.testList = [];
    let _param = {
      branchId: this.selectedLocId,
      TestProfileCode: null,
      TestProfileName: null,
      panelId: (this.selectedPanelId > 0 ? this.selectedPanelId : null),
      TPIDs: ''
    };
    if (!_param.branchId) {
      this.toastr.warning('Please select branch');
      return;
    }
    this.spinner.show(this.spinnerRefs.TestSection);
    this.testProfileService.getTestsByName(_param).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.TestSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.testList = data || [];
        // console.log("panel test data", this.testList)
        this.updateSelectedTPIDsList();
      }
    })
    // this.lookupService.GetBranches().subscribe((res: any) => {
    // this.spinner.hide(this.spinnerRefs.TestSection);
    //   if (res && res.StatusCode == 200 && res.PayLoad) {
    //     let data = res.PayLoad;
    //     try {
    //       data = JSON.parse(data);
    //     } catch (ex) { }
    //     this.branchList = data || [];
    //   }
    // }, (err) => {
    //   console.log(err);
    // this.spinner.hide(this.spinnerRefs.TestSection);
    // });
  }

  enforceRange(input: HTMLInputElement): void {
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 0;
      this.toastr.warning('Discount percentage should be less than 100');
    }
    input.value = value.toString();
  }

  discountPercentageChanged(discPercentage) {
    this.discountPercentage = discPercentage;
    this.selectedTPIDs.forEach(element => {
      (element.IsDiscountable == 1) ? (element.itemDiscount = discPercentage * element.TestProfilePrice / 100) : (element.itemDiscount = 0);
      (element.IsDiscountable == 1) ? (element.discountedPrice = element.TestProfilePrice - element.itemDiscount) : (element.discountedPrice = element.TestProfilePrice);
    });

    this.calculateDiscountedCharges(discPercentage);
  }
  calculateDiscountedCharges(_discPercentage) {
    let discChargesWithDiscount = 0

    let totalPriceWithDiscount = this.selectedTPIDs.filter(x => x.IsDiscountable).reduce((pv, cv) => pv + cv.TestProfilePrice, 0);
    let totalDiscChargesWithoutDiscount = this.selectedTPIDs.filter(x => x.IsDiscountable == 0).reduce((pv, cv) => pv + cv.TestProfilePrice, 0);
    this.discountAmount = this.selectedTPIDs.reduce((pv, cv) => pv + cv.itemDiscount, 0);


    discChargesWithDiscount = totalPriceWithDiscount - (_discPercentage * totalPriceWithDiscount / 100);
    this.discountedCharges = discChargesWithDiscount + totalDiscChargesWithoutDiscount

    // console.log("discountedCharges", this.discountedCharges);
  }
  removeItem(TPID) {
    //remove the selected Test item by tpid
    let newSelectTPIDs = [];
    // this.testList.push(this.selectedTPIDs.find(x => x.TPId == TPID ));
    this.testList = this.testList.concat(this.selectedTPIDs.find(x => x.TPId == TPID));

    this.selectedTPIDs  = this.selectedTPIDs.filter(x => x.TPId != TPID);
    this.selectedTPIDs  = this.selectedTPIDs.filter(a => a.forPkg != TPID ); // for package test profiles
    // console.log("remove TPID",TPID);
   
    // console.log("Filterdate",newSelectTPIDs);
    console.log("remove item push", this.selectedTPIDs.find(x => x.TPId == TPID));
    // this.selectedTPIDs = newSelectTPIDs;
    this.totalTPPrice = this.selectedTPIDs.reduce((pv, cv) => pv + cv.TestProfilePrice, 0);
    this.discountAmount = this.selectedTPIDs.reduce((pv, cv) => pv + cv.itemDiscount, 0);
    this.calculateDiscountedCharges(this.discountPercentage);
  }
}
