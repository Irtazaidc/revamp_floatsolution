// @ts-nocheck
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { DynamicAsideMenuConfig, AppMenu } from '../../configs/dynamic-aside-menu.config';

const emptyMenuConfig = {
  items: []
};

@Injectable({
  providedIn: 'root'
})
export class DynamicAsideMenuService {
  private menuConfigSubject = new BehaviorSubject<any>(emptyMenuConfig);
  menuConfig$: Observable<any>;
  constructor(
    private authService: AuthService
  ) {
  this.menuConfig$ = this.menuConfigSubject.asObservable();
    this.loadMenu();
  }

  // Here you able to load your menu from server/data-base/localStorage
  // Default => from DynamicAsideMenuConfig
  private loadMenu() {
    let menu: any = this.setPermissionsBasedMenu(AppMenu);
    this.setMenu(menu);
  }

  private setMenu(menuConfig) {
    this.menuConfigSubject.next(menuConfig);
  }

  private getMenu(): any {
    return this.menuConfigSubject.value;
  }



  setPermissionsBasedMenu(AppMenu) {

    let perms_allowed = this.authService.getUserPermissionsFromLocalStorage() || []; // allowedPermissoin;//AppSettings.screen_permissions.permissions;
    let _AppMenu = JSON.parse(JSON.stringify(AppMenu));
    let menu = [];
    _AppMenu.items.filter(a => a.ignoreAuth).forEach(element => {
      menu.push(element);
    });
    _AppMenu.items.forEach(element => {
      let parent = JSON.parse(JSON.stringify(element));
      // parent.submenu = [];
      let child = [];
      (element.submenu || []).forEach(c => {
        let pageState = (c.page || '');
        pageState = pageState.split('/')[(pageState.split('/').length - 1)];

        // c.title = (perms_allowed.find(p => p.state == pageState) || {title: c.title}).title;

        perms_allowed.filter(a => a.state == pageState && a.allowed).length > 0 ? child.push(c) : null;
        if(c.ignoreAuth) { // ignore
          child.push(c);
        }
      });
      parent.submenu = child;
      if(child.length) { // make first page as default
        parent.page = child[0].page;
      }
      if ((parent.submenu && parent.submenu.length) || parent.section) {
        menu.push(parent);
      }
    });


    menu.forEach( (a, i) => { // to remove section headings that don't have its menu items
      let nextIdx = i+1;
      if (menu[i].section) {
        if(!(menu[nextIdx] && menu[nextIdx].page)) {
          a.section = '';
        }
      }
    });
    _AppMenu.items = menu;
    console.log('===> ', _AppMenu);

    return _AppMenu;
  }
}
