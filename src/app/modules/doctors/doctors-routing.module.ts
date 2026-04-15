// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { B2bDoctorsComponent } from './components/b2b-doctors/b2b-doctors.component';
import { RefByDoctorsComponent } from './components/ref-by-doctors/ref-by-doctors.component';
import { RefByB2bDoctorsMappingComponent } from './components/ref-by-b2b-doctors-mapping/ref-by-b2b-doctors-mapping.component';
import { DoctorsAndMappingsComponent } from './components/doctors-and-mappings/doctors-and-mappings.component';
import { RefbyShiftComponent } from './components/refby-shift/refby-shift.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Doctors Config',
    },
    children: [
      {
        path: '',
        redirectTo: 'b2b-doctors',
        pathMatch: 'full'
      },
      {
        path: 'b2b-doctors',
        component: B2bDoctorsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'B2B Doctors'
        }
      },
      {
        path: 'ref-by-doctors',
        component: RefByDoctorsComponent,
        canActivate: [AuthGuard],
        data: {
          titl: 'Ref. by Doctors'
        }
      },
      {
        path: 'ref-by-b2b-doctors-mapping',
        component: RefByB2bDoctorsMappingComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Doctors Mapping'
        }
      },
      {
        path: 'doctors-and-mapping',
        component: DoctorsAndMappingsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Doctors And Mapping'
        }
      },
      {
        path: 'refby-shift',
        component: RefbyShiftComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Referring Doctor Shif'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorsRoutingModule { }
