// @ts-nocheck
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Injectable({
  providedIn: 'root',
})
export class UserPermissionsService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  // public fields


  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  
  getUserPermissions(params): Observable<any> {
    this.isLoadingSubject.next(true);
    let formattedPermissions = [];
    formattedPermissions.push({allowed: 1, name: 'Dashboard',           state: 'dashboard',          key: 'dashboard',      screenTitle: 'Dashboard'});
    return this.http.post(API_ROUTES.GET_PERMISSIONS, params).pipe(
      map((resp: any) => {
        if(resp && resp.StatusCode == 200 && resp.PayLoad && resp.PayLoad.length) {
          formattedPermissions = [...formattedPermissions, ...this.formatPermissionsData(resp.PayLoad || [])];
          // if(updateInStorage) {
            // this.setUserPermissionsInLocalStorage(formattedPermissions);
          // }
        }
        return formattedPermissions;
      }),
      catchError((err) => {
        console.error('err', err);
        return of(formattedPermissions);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }



  formatPermissionsData(data) {
    console.log(data);
    const c = [];
    let allowedScreensData = JSON.parse(JSON.stringify(data));
    const allScreens = [... new Set(allowedScreensData.map(a => a.ScreenKey))]
    allScreens.forEach( a=> {
      if(!allowedScreensData.find( b => b.ScreenKey == a && (b.ScreenDetailKey || '').toLowerCase() == 'screen')) {
        allowedScreensData = allowedScreensData.filter( c => c.ScreenKey != a);
      }
    })
    allowedScreensData.forEach( (a,i)=> {
      const obj = {
        allowed: ((typeof(a.allowed) == 'undefined' || a.allowed == null) ? 1 : a.allowed),
        name: a.ScreenDetailTitle,
        key: a.ScreenDetailKey,
        state: a.ScreenKey,
        title: a.ScreenTitle || '_PAGE_NAME_'
      }
      // if(obj.state == 'reg') {
      //   let objRegForHS = {
      //     allowed: ((typeof(a.allowed) == 'undefined' || a.allowed == null) ? 1 : a.allowed),
      //     name: a.ScreenDetailTitle,
      //     key: a.ScreenDetailKey,
      //     state: 'regForHS'
      //   }
      //   c.push(objRegForHS);
      // }
      c.push(obj);
    })
    return c;
  }





  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
