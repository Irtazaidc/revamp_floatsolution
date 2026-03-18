// @ts-nocheck
import { EmpProfilleRoutingModule } from './emp-profille-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { EmpCardComponent } from './component/emp-card/emp-card.component';
import { EmpPersonalInfoComponent } from './component/emp-personal-info/emp-personal-info.component';
import { EmpEduInfoComponent } from './component/emp-edu-info/emp-edu-info.component';
import { EmpDependentInfoComponent } from './component/emp-dependent-info/emp-dependent-info.component';
import { ChangeUserPasswordComponent } from './component/change-user-password/change-user-password.component';
import { EmpProfileComponent } from './component/emp-profile/emp-profile.component';
import { SecurityKeyGeneratorComponent } from './component/security-key-generator/security-key-generator.component';
import { MatCheckboxModule } from '@angular/material/checkbox';


// @NgModule({
//   declarations: [ProfileComponent],
//   imports: [
//     CommonModule
//   ]
// })
@NgModule({
  declarations: [EmpCardComponent, EmpPersonalInfoComponent, EmpEduInfoComponent, EmpDependentInfoComponent, ChangeUserPasswordComponent, EmpProfileComponent, SecurityKeyGeneratorComponent,],
  imports: [
    CommonModule,
    EmpProfilleRoutingModule,
    SharedModule,
    MatCheckboxModule
    
  ]
})
export class EmpProfileModule { }
