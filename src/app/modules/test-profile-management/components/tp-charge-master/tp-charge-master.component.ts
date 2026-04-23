// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { TpChargeMasterService } from '../../Services/tp-charge-master.service';

@Component({
  standalone: false,

  selector: 'app-tp-charge-master',
  templateUrl: './tp-charge-master.component-new.html',
  styleUrls: ['./tp-charge-master.component.scss']
})
export class TpChargeMasterComponent implements OnInit {

  cachedData = {
    testList: []
  };
  selectedTabIndex = 0;
  loggedInUser: UserModel;

  tableHeaders = [
    // { col: 'TPId', title: 'TPId'},
    { col: 'TestProfileCode', title: 'Code' },
    { col: 'TestProfileName', title: 'Name' },
    { col: 'TestProfilePrice', title: 'Price' },
    { col: 'RegTestProfilePrice', title: 'Regular Price' },
    { col: 'TypeId', title: 'TypeId' },
    { col: 'IsDiscountable', title: 'Discountable' },
    // { col: 'SubSectionId', title: 'SubSectionId'},
  ];
  testsList = [];
  filteredTestsList = [];
  branchesList = [];
  branchesListFiltered = [];
  branchRegions = [];
  chargeMastersList = [];
  testTypesFilterList = [
    { typeId: 0, title: 'All' },
    { typeId: 1, title: 'Tests' },
    { typeId: 2, title: 'Profiles' },
    { typeId: 3, title: 'Packages' },
    { typeId: 4, title: 'Lab' },
    { typeId: 5, title: 'Radiology' },
    { typeId: 6, title: 'Discountable' },
    { typeId: 7, title: 'Non-Discountable' },
    { typeId: 8, title: 'Covid Tests' },
    { typeId: 9, title: 'Dengue Tests' },
    { typeId: 10, title: 'Home Sampling Tests' },
  ];
  filters = {
    searchText: '',
    searchTextChargeMaster: '',
    testType: 0,
    discountPct: 0,
    effectiveDateAll: '',
    effectiveTimeAll: '',
    selectAllTests_checkbox: false
  }

  form = this.fb.group({
    ChargeMasterID: [null],
    ChargeMasterCode: ['', Validators.required],
    ChargeMasterTitle: ['', Validators.required],
    Remarks: [''],
    IsDefault: [false],
    BranchIDs: [null, Validators.required],
    CreatedBy: ['', Validators.required],
    IsDeleted: [0],
    // TPChargeMasterData: [[]]
  });
  formSubmitted = false;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection'
  }

  constructor(
    private testProfileService: TestProfileService,
    private lookupService: LookupService,
    private chargeMasterService: TpChargeMasterService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private helper: HelperService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    // this.getChargeMastersList();
    // this.getTestProfileList();
    // this.getBranches();
    // this.getBranches(1);

    this.loadTab0Date();
    this.loadTab1Data();//add for new html view
  }

  loadTab0Date() {
    this.spinner.show();
    this.branchesList = [];
    this.chargeMastersList = [];

    Promise.all([
      this.getBranchesPromise(),
      this.getChargeMastersListPromise()
    ]).then((responses: any) => {
      this.spinner.hide();
      const branchesData = responses[0];
      this.branchesList = branchesData;

      const chargeMastersList = responses[1];
      this.chargeMastersList = chargeMastersList;
      /**/
      this.chargeMastersList.forEach(cm => {
        cm.BranchesNames = this.branchesList.filter(b => b.ChargeMasterID == cm.ChargeMasterID);
        // cm.Branches ? (cm.Branches || '').split(',').forEach(b => {
        //   cm.BranchesNames.push({
        //     Code: this.branchesList.find(a => a.LocId == b).Code,
        //     Title: this.branchesList.find(a => a.LocId == b).Title,
        //   });
        // }) : null;
        // cm.BranchesNames = cm.BranchesNames.join(',   ');
      })
      
    }).catch(err => {
      this.spinner.hide();
      console.log(err);
      this.toastr.error('Error loading charge master data');
    })
  }
  loadTab1Data(chargeMasterId = null) {
    if(!chargeMasterId) {
      chargeMasterId = this.form.getRawValue().ChargeMasterID;
    }
    this.spinner.show();
    this.branchesListFiltered = [];
    this.branchRegions = [];
    this.testsList = [];
  
    const promisesArray = [
      this.getBranchesPromise(),
      // this.getBranchesPromise(1),
      this.getTestProfileListPromise(),
    ];
    if(chargeMasterId) {
      promisesArray.push(this.getChargeMastersListByIdPromise(chargeMasterId));
    }
    Promise.all(promisesArray).then((responses: any) => {
      this.spinner.hide();
      
      // All Branches
      // let allBranchesData = responses[0];

      // Unassigned Branches
      const branchesData = responses[0];//[1];
      this.branchesListFiltered = branchesData.filter(b => !b.ChargeMasterID || b.ChargeMasterID == chargeMasterId); //commented for new html view
      // this.branchesListFiltered = branchesData//branchesData.filter(b => !b.ChargeMasterID || b.ChargeMasterID == chargeMasterId); //added for new html view
      this.branchRegions = [...new Set(this.branchesListFiltered.filter(a => a.RegId).map(a => a.RegId))].map(a => { return {RegId: a, RegName: this.branchesListFiltered.find(b=>b.RegId == a).RegName, RegCode: this.branchesListFiltered.find(b=>b.RegId == a).RegCode} } )

      // Test Profiles
      const testsData = responses[1];//[2];
      this.testsList = testsData;
      this.testTypeChangedEvent({ target: { value: this.filters.testType } });

      // Charge Master Test Profiles
      if(chargeMasterId) {
        const chargeMasterTPData = responses[2];//[3];
        /*
        let currentChargeMasterBranches = [];
        chargeMasterTPData.Table1.map(a => a.BranchID).forEach(bId => {
          let branch = allBranchesData.find(bb => bb.LocId == bId);
          if(branch) {
            let _br = JSON.parse(JSON.stringify(branch));
            _br.$$chargeMasterId = chargeMasterId;
            currentChargeMasterBranches.push(_br);
          }
        });
        this.branchesListFiltered = [...this.branchesListFiltered, ...currentChargeMasterBranches];
        */

        this.form.patchValue({
          BranchIDs: this.branchesListFiltered.filter(b => b.ChargeMasterID == chargeMasterId).map(b => b.LocId|0) // this.branchesListFiltered.map(a => a.LocId)
        });
  
        (chargeMasterTPData.Table1 || []).forEach(cm => {
          const selectedTestIndex = this.filteredTestsList.findIndex(t => t.TPId == cm.TPID);
          if (selectedTestIndex > -1) {
            const _price = cm.Price || cm.RegTestProfilePrice || 0;
            const _newPrice = cm.NewPrice || 0;
            const _discountRs = cm.DiscountRs || (_price - _newPrice);
            const _discountPct = this.parseNumbericValues((cm.DiscountPct || ((100 - (_newPrice / _price * 100)))), 2);
            const _effectiveDate = cm.EffectiveDate ? Conversions.getDateObjectByGivenDate(cm.EffectiveDate) : null;
            const _effectiveTime = cm.EffectiveDate ? Conversions.getTimeObjectByGivenDate(cm.EffectiveDate) : null;

            this.filteredTestsList[selectedTestIndex] = {
              ...this.filteredTestsList[selectedTestIndex],
              ChargeMasterTestProfileID: cm.ChargeMasterTestProfileID || null,
              ChargeMasterID: cm.ChargeMasterID || null,
              Price: _price,
              NewPrice: _newPrice,
              discountRs: _discountRs,
              discountPct: _discountPct,
              effectiveDate: _effectiveDate,
              effectiveTime: _effectiveTime,
              Remarks: cm.Remarks || '',
              selected: !!_effectiveDate
            }
          }
        });
        this.branchRegions = [...new Set(this.branchesListFiltered.filter(a => a.RegId).map(a => a.RegId))].map(a => { return {RegId: a, RegName: this.branchesListFiltered.find(b=>b.RegId == a).RegName, RegCode: this.branchesListFiltered.find(b=>b.RegId == a).RegCode} } )
      }
    }).catch(err => {
      this.spinner.hide();
      console.log(err);
      this.toastr.error('Error loading charge master details data');
    });
  }

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.auth.getUserFromLocalStorage();
    this.loggedInUser = this.auth.currentUserValue;
    this.form.patchValue({
      CreatedBy: this.loggedInUser.userid
    });
  }

  /*
  TypeId
  IsDiscountable
  isCovidTestProfile
  isDengueTest
  isHomeSamplingTestProfile
  */
  testTypeChangedEvent(e) {
    if(e.target.value > 0) {
      switch (e.target.value | 0) {
        case 1: // Tests
        case 2: // Profiles
        case 3: // Packages
          this.filteredTestsList = this.testsList.filter(a => a.TypeId == e.target.value);
          break;
        case 4: // Lab
          this.filteredTestsList = this.testsList.filter(a => !a.isRadiologyTest);
          break;
        case 5: // Radiology
          this.filteredTestsList = this.testsList.filter(a => a.isRadiologyTest);
          break;
        case 6: // Discountable
          this.filteredTestsList = this.testsList.filter(a => a.IsDiscountable);
          break;
        case 7: // Non-Discountable
          this.filteredTestsList = this.testsList.filter(a => !a.IsDiscountable);
          break;
        case 8: // Covid
          this.filteredTestsList = this.testsList.filter(a => a.isCovidTestProfile);
          break;
        case 9: // Dengue
          this.filteredTestsList = this.testsList.filter(a => a.isDengueTest);
          break;
        case 10: // Home Sampling
          this.filteredTestsList = this.testsList.filter(a => a.isHomeSamplingTestProfile);
          break;
        default:
          this.filteredTestsList = this.testsList;
          break;
      }
    } else {
      this.filteredTestsList = this.testsList;
    }
  }
  selectAllTests(){
    this.filteredTestsList.forEach(t => {
      t.selected = this.filters.selectAllTests_checkbox;
    })
  }
  effectiveDateAllChangeEvent(e) {
    this.testsList.forEach( test => {
      test.effectiveDate = e;
    })
  }
  effectiveTimeAllChangeEvent(e) {
    if(!e) { return; }
    this.testsList.forEach( test => {
      test.effectiveTime = e;
    })
  }
  discountPctChangeEvent_all(e) {
    this.filteredTestsList.filter(t=>t.selected).forEach( test => {
      test.discountPct = e.target.value || 0;
      test.discountRs = this._calculateDiscountRs(test);
      test.NewPrice = this._calculateNewValue(test);
    });
  }
  discountRsChangeEvent(test) {
    test.discountPct = this._calculateDiscountPct(test);
    test.NewPrice = this._calculateNewValue(test);
  }
  discountPctChangeEvent(test) {
    test.discountRs = this._calculateDiscountRs(test);
    test.NewPrice = this._calculateNewValue(test);
  }
  newPriceChangeEvent(test) {
    test.discountRs = this.parseNumbericValues(test.RegTestProfilePrice) - this.parseNumbericValues(test.NewPrice);
    test.discountPct = this._calculateDiscountPct(test);
  }

  _calculateDiscountPct(test) {
    return this.parseNumbericValues(this.parseNumbericValues(test.discountRs) / this.parseNumbericValues(test.RegTestProfilePrice) * 100, 2);
  }
  _calculateDiscountRs(test) {
    return this.parseNumbericValues(this.parseNumbericValues(test.RegTestProfilePrice) * this.parseNumbericValues(test.discountPct) / 100, 2);
  }
  _calculateNewValue(test) {
    return this.parseNumbericValues(this.parseNumbericValues(test.RegTestProfilePrice) - this.parseNumbericValues(test.discountRs), 2); // null, 'ceil');
  }

  /*
    discountPctChangeEvent_all(e) {
    console.log(e.target.value);
    this.filteredTestsList.forEach( test => {
      test.discountRs = this._calculateDiscountRs(e.target.value, test.RegTestProfilePrice);
      test.NewPrice = this._calculateNewValue(test.discountRs, test.RegTestProfilePrice);
    });
  }
  discountRsChangeEvent(test) {
    test.discountPct = this._calculateDiscountPct(test.discountRs, test.RegTestProfilePrice);
    test.NewPrice = this._calculateNewValue(test.discountRs, test.RegTestProfilePrice);
  }
  discountPctChangeEvent(test) {
    test.discountRs = this._calculateDiscountRs(test.discountPct, test.RegTestProfilePrice);
    test.NewPrice = this._calculateNewValue(test.discountRs, test.RegTestProfilePrice);
  }
  newPriceChangeEvent(test) {
    test.discountRs = this.parseNumbericValues(test.RegTestProfilePrice) - this.parseNumbericValues(test.NewPrice);
    test.discountPct = this._calculateDiscountPct(test.discountRs, test.RegTestProfilePrice);
  }

  _calculateDiscountPct(discountRs, regPrice) {
    return this.parseNumbericValues(this.parseNumbericValues(discountRs) / this.parseNumbericValues(regPrice) * 100, 2);
  }
  _calculateDiscountRs(discountPct, regPrice) {
    return this.parseNumbericValues(this.parseNumbericValues(regPrice) * this.parseNumbericValues(discountPct) / 100, 2);
  }
  _calculateNewValue(discountRs, regPrice) {
    return this.parseNumbericValues(this.parseNumbericValues(regPrice) - this.parseNumbericValues(discountRs), 2); // null, 'ceil');
  }
  */

  /* API Calls */
  getBranchesPromise(filter = null) {
    const promise = new Promise( (resolve, reject) => {
      this.chargeMasterService.getLookupBranchesForChargeMaster({filter:filter}).subscribe((resp: any) => {
        const _response = resp.PayLoad;
        _response.forEach((element, index) => {
          _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
        });
        resolve(_response);
      }, (err) => {
        reject(err);
      })
    });
    return promise;
  }
  getChargeMastersListPromise(chargeMasterId = null) {
    this.spinner.show(this.spinnerRefs.listSection);
    const promise = new Promise((resolve, reject) => {
      this.chargeMasterService.getChargeMaster({ChargeMasterID: chargeMasterId}).subscribe((res: any) => {
        let returnedData = [];
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          let data = res.PayLoadDS;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          returnedData = (data.Table || []);
        }
        resolve(returnedData);
      }, (err) => {
        reject(err);
      })  
    });
    this.spinner.hide(this.spinnerRefs.listSection);
    return promise;
  }
  
  getTestProfileListPromise() {
    const promise = new Promise((resolve, reject) => {
      // if(this.cachedData.testList.length) {
      //   resolve(JSON.parse(JSON.stringify(this.cachedData.testList)));
      //   return promise;
      // }
      const _param = {
        // branchId: this.loggedInUser.locationid, // this.selectedLocId,
        // TestProfileCode: null,
        // TestProfileName: null,
        // panelId: null,
        // TPIDs: ''
      };
      this.testProfileService.getLookupTestProfileForChargeMaster(_param).subscribe((res: any) => {
        let testsData = [];
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          testsData = (data || []).map(test => {
            return {
              ...test,
              NewPrice: test.RegTestProfilePrice,
              discountRs: this._calculateDiscountRs(test),
              discountPct: this._calculateDiscountPct(test),
            }
          });
        }
        // if(testsData.length) {
        //   this.cachedData.testList = testsData;
        // }
        resolve(testsData);
      }, (err) => {
        reject(err);
      })
    });
    return promise;
  }
  getChargeMastersListByIdPromise(chargeMasterId) {
    const promise = new Promise((resolve, reject) => {
      const params = {
        ChargeMasterID: chargeMasterId
      }
      this.chargeMasterService.getChargeMaster(params).subscribe((res: any) => {
        let chargeMasterData = [];
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          let data = res.PayLoadDS;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          chargeMasterData = data;
        }
        resolve(chargeMasterData);
      }, (err) => {
        reject(err);
      })  
    });
    return promise;
  }
  updateChargeMasterLocationMappingPromise(chargeMasterId, branchIDs) {
    const promise = new Promise((resolve, reject) => {
      const params = {
        ChargeMasterID: chargeMasterId,
        BranchIDs: branchIDs
      }
      this.chargeMasterService.updateChargeMasterLocationMapping(params).subscribe((res: any) => {
        let result = '';
        if (res && res.StatusCode == 200) {
          result = 'success';
        } else {
          result = 'failure';
        }
        resolve(result);
      }, (err) => {
        reject(err);
      })  
    });
    return promise;
  }
  setChargeMasterAsDefaultPromise(chargeMasterId) {
    const promise = new Promise((resolve, reject) => {
      const params = {
        ChargeMasterID: chargeMasterId
      }
      this.chargeMasterService.setChargeMasterAsDefault(params).subscribe((res: any) => {
        let result = '';
        if (res && res.StatusCode == 200) {
          result = 'success';
        } else {
          result = 'failure';
        }
        resolve(result);
      }, (err) => {
        reject(err);
      })  
    });
    return promise;
  }
  /* end - API Calls */


  /* branches dropdown - start */
  onSelectAllBranches() {
    this.form.patchValue({
      BranchIDs: this.branchesListFiltered.map(a => a.LocId)
    });
    // this.selectedBranchIds = this.branchesListFiltered.map(a => a.LocId)
  }
  onSelectRegionBranches(reg) {
    this.form.patchValue({
      BranchIDs: this.branchesListFiltered.filter(a=>a.RegId == reg.RegId).map(a => a.LocId)
    });
    // this.selectedBranchIds = this.branchesListFiltered.filter(a=>a.RegId == reg.RegId).map(a => a.LocId)
  }
  onUnselectAllBranches() {
    this.form.patchValue({
      BranchIDs: []
    });
    // this.selectedBranchIds = [];
  }
  groupBranchesByRegionFn = (item) => item.RegName;
  groupBranchesByRegionValueFn = (item) => { 
    return { RegName: this.branchesListFiltered.find(b=>b.RegName == item).RegName, RegCode: this.branchesListFiltered.find(b=>b.RegName == item).RegCode }
  };
  searchBranchesCustomFn(term, item) {
    term = term.toLowerCase();
    return (item.RegName || '').toLowerCase().indexOf(term) > -1 || (item.RegName || '').toLowerCase() === term
    || (item.Title || '').toLowerCase().indexOf(term) > -1 || (item.Title || '').toLowerCase() === term
    || (item.CityName || '').toLowerCase().indexOf(term) > -1 || (item.CityName || '').toLowerCase() === term
    || (item.RegCode || '').toLowerCase().indexOf(term) > -1 || (item.RegCode || '').toLowerCase() === term
    ;
  }
  /* branches dropdown - end */

  saveChargeMaster() {

    if(this.form.valid) {
      if (!this.filteredTestsList.some(t => t.selected)) {
        this.toastr.warning('Please select atleast one test');
        return;
      }  
      if (this.filteredTestsList.filter(t=>t.selected).find( test => !test.effectiveDate)) {
        this.toastr.warning('Please enter effective data for: ' + this.filteredTestsList.filter(t=>t.selected).find( test => !test.effectiveDate).TestProfileName);
        return;
      }
      this.insertUpdateChargeMaster(this.form.getRawValue());
    } else {
      const invalidFieldNames = [];
      Object.keys(this.form.controls).forEach((a,i) => {
        if(this.form.controls[a].errors) {
             invalidFieldNames.push(a);
        }
      });
      this.toastr.warning('Please enter ' + invalidFieldNames.join(', '));
    }
  }
  insertUpdateChargeMaster(values) {
    this.formSubmitted = true;
    const params = values;
    params.IsDefault = params.IsDefault ? 1 : 0;
    params.BranchIDs = (params.BranchIDs || []).join(',');
    params.TPChargeMasterData = this.getFormatChargeMasterData();
    if(params.TPChargeMasterData.length) {

    }
    this.spinner.show();
    this.chargeMasterService.insertUpdateChargeMaster(params).subscribe( (res:any) => {
      this.spinner.hide();
      if(
        res.StatusCode == 200
        && res.PayLoad
        && res.PayLoad.length
        && res.PayLoad[0].Result == 1
        && res.PayLoad[0].Result == '1'
      ) {
        this.toastr.success(res.PayLoad[0].Message || 'Charge Master Saved');
        // this.resetForm();
        // Branches Mapping
        if(!this.form.getRawValue().ChargeMasterID) {
          this.form.patchValue({
            ChargeMasterID: res.PayLoad[0].ChargeMasterID
          });
        }
        this.updateChargeMasterLocationMapping();
        // this.selectedTabIndex = 0;
      } else {
        this.toastr.error(res?.PayLoad[0]?.Message || 'Error Saving Charge Master');
      }
    }, (err: any) => {
      this.spinner.hide();
      this.toastr.error('Error Saving Charge Master.');
      console.log(err);
    })
  }
  updateChargeMasterLocationMapping() {
    let {ChargeMasterID, BranchIDs} = this.form.getRawValue();
    BranchIDs = BranchIDs ? BranchIDs.join(',') : null;
    if(!ChargeMasterID) {
      this.toastr.warning('Charge Master ID not provided');
      return;
    }
    if(!BranchIDs) {
      this.toastr.warning('Please select Branche(s)');
      return;
    }
    this.spinner.show();
    this.updateChargeMasterLocationMappingPromise(ChargeMasterID, BranchIDs).then(res=>{
      this.spinner.hide();
      if(res == 'success') {
        this.toastr.success('Branches associated successfully');
        this.onTabChanged({index: 0});
        this.loadTab1Data();
      } else if(res == 'failure') {
        this.toastr.error('Error saving data branches mapping');
      } else {
        this.toastr.error('Error saving data Branches mapping');
      }
    }, err => {
      console.log(err);
      this.toastr.error('Error saving data branches mapping.');
      this.spinner.hide();
    }).finally(() =>{
      this.selectedTabIndex = 0;
    })
  }
  setChargeMasterAsDefault(cm) {
    // console.log(e, cm);
    this.chargeMastersList.forEach(a => {
      a.isDefault = false;
    });
    cm.isDefault = true;
    const ChargeMasterID = cm.ChargeMasterID;
    if(!ChargeMasterID) {
      this.toastr.warning('Charge Master ID not provided');
      return;
    }
    this.spinner.show();
    this.setChargeMasterAsDefaultPromise(ChargeMasterID).then(res=>{
      this.spinner.hide();
      if(res == 'success') {
        this.toastr.success('Charge Master made as default');
        this.loadTab0Date();
      } else if(res == 'failure') {
        this.toastr.error('Error making charge master as default');
      } else {
        this.toastr.error('Error making charge master as default.');
      }
    }, err => {
      console.log(err);
      this.toastr.error('Error making charge master as default..');
      this.spinner.hide();
    })
  }
  rowIndex=null;
  editChargeMaster(cm,rowIndex=null) {
    this.rowIndex = rowIndex;
    // this.selectedTabIndex = 1; //commented for new html
    this.selectedTabIndex = 0; //add for new html
    this.resetForm();

    // this.getChargeMastersListById(cm.ChargeMasterID);
    this.form.patchValue({
      ChargeMasterID: cm.ChargeMasterID,
      ChargeMasterCode: cm.ChargeMasterCode || '',
      ChargeMasterTitle: cm.ChargeMasterTitle || '',
      Remarks: cm.Remarks || '',
      IsDefault: cm.isDefault || false,
      // BranchIDs: cm.BranchIDS || [],
      BranchIDs: cm.BranchIDs && cm.BranchIDs.length ? (cm.BranchIDs || '').split(',').map(a => a|0) : null,
      IsDeleted: 0,
      // TPChargeMasterData: [[]]  
    });
    //uncommented for new html view, for origional its was commented
    setTimeout(() => {
      this.loadTab1Data(cm.ChargeMasterID);
    }, 500);
  }
  associateBranchesChargeMaster(cm) {
    this.selectedTabIndex = 2;
    // this.form.patchValue({
    //   ChargeMasterID: cm.ChargeMasterID,
    //   ChargeMasterCode: cm.ChargeMasterCode || '',
    //   ChargeMasterTitle: cm.ChargeMasterTitle || '',
    //   Remarks: cm.Remarks || '',
    //   IsDefault: cm.isDefault || false,
    //   // BranchIDs: cm.BranchIDS || [],
    //   BranchIDs: cm.BranchIDs && cm.BranchIDs.length ? (cm.BranchIDs || '').split(',').map(a => a|0) : null,
    //   IsDeleted: 0,
    //   // TPChargeMasterData: [[]]  
    // });
  }
  deleteChargeMaster(cm) {
    this.deleteChargeMasterById(cm.ChargeMasterID);
  }
  deleteChargeMasterById(chargeMasterId) {
    const params = {
      ChargeMasterID: chargeMasterId
    }
    this.spinner.show();
    this.chargeMasterService.deleteChargeMaster(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        this.toastr.success('Charge Master deleted successfully');
        this.loadTab0Date();
      } else {
        this.toastr.error('Error deleting Charge Master');
      }
    }, (err) => {
      this.spinner.hide();
      this.toastr.error('Error deleting Charge Master.');
      console.log(err);
    })
  }
  resetForm() {
    this.formSubmitted = false;
    this.form.reset();
    this.form.patchValue({
      ChargeMasterID: null,
      ChargeMasterCode: '',
      ChargeMasterTitle: '',
      Remarks: '',
      IsDefault: false,
      BranchIDs: [],
      CreatedBy: this.loggedInUser.userid,
      IsDeleted: 0,
      // TPChargeMasterData: [[]]  
    });
    this.filters = {
      searchText: '',
      searchTextChargeMaster: '',
      testType: 0,
      discountPct: 0,
      effectiveDateAll: null,
      effectiveTimeAll: null,
      selectAllTests_checkbox: false
    }
    this.branchesListFiltered = [];
    this.branchRegions = [];
    this.testsList = [];
    this.discountPctChangeEvent_all({target: {value: this.filters.discountPct}});
    this.effectiveDateAllChangeEvent(this.filters.effectiveDateAll);
    this.effectiveTimeAllChangeEvent(this.filters.effectiveTimeAll);
    this.testTypeChangedEvent({target: {value: this.filters.testType}});
    // this.branchesListFiltered = this.branchesListFiltered.filter(b => !b.$$chargeMasterId);
  }

  getFormatChargeMasterData() {
    return this.testsList.filter(test => test.selected).map( test => {
      return {
        ChargeMasterTestProfileID: test.ChargeMasterTestProfileID || null,
        ChargeMasterID: test.ChargeMasterID || null,
        TPID: test.TPId,
        Price: test.Price || test.RegTestProfilePrice || 0,
        NewPrice: this.parseNumbericValues((test.NewPrice || 0), 0, 'round'),
        EffectiveDate: test.effectiveDate ? Conversions.formatDateObjectToString(test.effectiveDate, test.effectiveTime || '') : null, // TODO: append effective time with data
        Remarks: test.Remarks || '',
      }
    });
  }

  onTabChanged($event) {
    // let clickedIndex = $event.index;
    // console.log('onTabChanged ', $event, $event.index);
    switch ($event.index) {
      case 0:
        this.resetForm();
        this.loadTab0Date();
        break;
      case 1:
        setTimeout(() => {
          this.loadTab1Data();
        }, 500);
        break;
      case 2:
        break;
      default:
        // console.log('default');
    }
  }
  addNewChargeMaster() {
    this.onTabChanged({index: 1});
  }


  parseNumbericValues(value, fixDecial = 0, roundingFn = '') {
    let _value = value;
    if (!isNaN(value)) {
      _value = Number(_value);
      // _value = Math.floor(_value);
      if(roundingFn) {
        _value = this.helper.parseNumbericValues(_value, roundingFn);
      }
    } else {
      _value = 0;
    }
    if(fixDecial) {
      try {
        _value = Number(Number(_value).toFixed(fixDecial));
      } catch (e) { }
    }
    return _value;
  }
  formatNumericValues(value) {
    return (value || '0').toString().replace(CONSTANTS.REGEX.nimericWithComma, ",");
  }
  getTotal(arr, key) {
    return arr.map(a => a[key]).reduce((a, b) => this.parseNumbericValues(a) + this.parseNumbericValues(b), 0);
  }


}
