// @ts-nocheck
import { Routes } from '@angular/router';
import { LoginGuard } from './modules/auth/_services/login.guard';

export const appRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'test-profile-configurations',
    loadChildren: () =>
      import('./modules/test-profile-management/test-profile-configurations.module').then(
        (m) => m.TestProfileConfigurationModule
      ),
  },
  {
    path: '',
    canActivate: [LoginGuard],
    loadChildren: () => import('./pages/layout.module').then((m) => m.LayoutModule),
  },
  { path: '**', redirectTo: 'error/404' },
];

