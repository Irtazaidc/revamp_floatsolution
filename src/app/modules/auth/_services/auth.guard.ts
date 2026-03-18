// @ts-nocheck
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private toaster: ToastrService
    ){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const currentUser = this.authService.currentUserValue;
      // return true;
      console.log(route.routeConfig.path);
      let comingRoute = '___not_allowed___'; // route.routeConfig.path; // state.url.split('/')[state.url.split('/').length-1].split('?')[0]; // route.routeConfig.path
      let comingRoute2 = '';
      try {
        comingRoute2 = state.url.split('/')[state.url.split('/').length-1].split('?')[0];
      } catch (e) {}
      let allowed_permissions = this.authService.getUserPermissionsFromLocalStorage() || [];
      let isRouteAllowed = allowed_permissions.filter(a=> (a.state == comingRoute || a.state == comingRoute2) && a.allowed).length;
      
      if(currentUser && isRouteAllowed) {
        this.authService.updateUserDetailsFromDB(currentUser.userid);
        return true;
      } else {
        console.log('Not authorized');
        this.toaster.warning('Not authorized, contact administrator');
        // this.storage.resetSessionAndLogout(); // this.router.navigate([APP_ROUTES.routes.login]);
        // this.authService.logout();
        return false;
      }
  }

}
