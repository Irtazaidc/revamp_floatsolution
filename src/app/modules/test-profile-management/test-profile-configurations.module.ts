// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TestProfileConfigurationsComponent } from './components/test-profile-configurations/test-profile-configurations.component';
import { TestProfileConfigurationsRoutingModule } from '../test-profile-management/test-profile-configurations-routing.module';
import { CKEditorModule } from 'ckeditor4-angular';
import { TestProfileRatesComponent } from './components/test-profile-rates/test-profile-rates.component';
import { SharedModule } from '../shared/shared.module';
import { TestCommentsComponent } from './components/test-comments/test-comments.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TpChargeMasterComponent } from './components/tp-charge-master/tp-charge-master.component';
import { ReportDisclaimerComponent } from './components/report-disclaimer/report-disclaimer.component';
import { ManageTestProfileComponent } from './components/manage-tp/manage-test-profile/manage-test-profile.component';
import { TpGeneralComponent } from './components/manage-tp/tp-general/tp-general.component';
import { TpDetailComponent } from './components/manage-tp/tp-detail/tp-detail.component';
import { TpAccountsComponent } from './components/manage-tp/tp-accounts/tp-accounts.component';
import { TpLocationsComponent } from './components/manage-tp/tp-locations/tp-locations.component';
import { SampleInformationComponent } from './components/manage-tp/tp-general/sample-information/sample-information.component';
import { GroupsComponent } from './components/manage-tp/tp-general/groups/groups.component';
import { ParametersComponent } from './components/manage-tp/tp-general/parameters/parameters.component';




@NgModule({
  declarations: [TestProfileConfigurationsComponent, TestProfileRatesComponent, TestCommentsComponent, TpChargeMasterComponent, ReportDisclaimerComponent, ManageTestProfileComponent, TpGeneralComponent, TpDetailComponent, TpAccountsComponent, TpLocationsComponent, SampleInformationComponent, GroupsComponent, ParametersComponent],
  imports: [
    CommonModule,
    SharedModule,
    TestProfileConfigurationsRoutingModule,
    CKEditorModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    DragDropModule
  ],
  exports:[
    TestProfileRatesComponent
  ]
})
export class TestProfileConfigurationModule { }