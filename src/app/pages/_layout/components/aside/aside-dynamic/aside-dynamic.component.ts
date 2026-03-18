// @ts-nocheck
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService, DynamicAsideMenuService } from '../../../../../_metronic/core';

declare var document;

@Component({
  standalone: false,

  selector: 'app-aside-dynamic',
  templateUrl: './aside-dynamic.component.html',
  styleUrls: ['./aside-dynamic.component.scss']
})
export class AsideDynamicComponent implements OnInit, OnDestroy {
  menuConfig: any;
  subscriptions: Subscription[] = [];

  disableAsideSelfDisplay: boolean;
  headerLogo: string;
  brandSkin: string;
  ulCSSClasses: string;
  asideMenuHTMLAttributes: any = {};
  asideMenuCSSClasses: string;
  asideMenuDropdown;
  brandClasses: string;
  asideMenuScroll = 1;
  asideSelfMinimizeToggle = false;

  currentUrl: string;

  @Input('moduleId') moduleId = 1;

  constructor(
    private layout: LayoutService,
    private router: Router,
    private menu: DynamicAsideMenuService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // load view settings
    this.disableAsideSelfDisplay =
      this.layout.getProp('aside.self.display') === false;
    this.brandSkin = this.layout.getProp('brand.self.theme');
    this.headerLogo = this.getLogo();
    this.ulCSSClasses = this.layout.getProp('aside_menu_nav');
    this.asideMenuCSSClasses = this.layout.getStringCSSClasses('aside_menu');
    this.asideMenuHTMLAttributes = this.layout.getHTMLAttributes('aside_menu');
    this.asideMenuDropdown = this.layout.getProp('aside.menu.dropdown') ? '1' : '0';
    this.brandClasses = this.layout.getProp('brand');
    this.asideSelfMinimizeToggle = this.layout.getProp(
      'aside.self.minimize.toggle'
    );
    this.asideMenuScroll = this.layout.getProp('aside.menu.scroll') ? 1 : 0;
    this.asideMenuCSSClasses = `${this.asideMenuCSSClasses} ${this.asideMenuScroll === 1 ? 'scroll my-4 ps ps--active-y' : ''}`;

    // router subscription
    this.currentUrl = this.router.url.split(/[?#]/)[0];
    const routerSubscr = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      this.cdr.detectChanges();
    });
    this.subscriptions.push(routerSubscr);

    // menu load
    const menuSubscr = this.menu.menuConfig$.subscribe(res => {
      let moduleMenu = res.items;
      // if(this.moduleId == 2) {
        moduleMenu = res.items.filter(a => (a.module || 1) == this.moduleId);
      // }
      this.menuConfig = {items: moduleMenu};
      this.cdr.detectChanges();
      [...document.querySelectorAll('[module-id]')].forEach(e => {
        if(e.getAttribute('module-id') == this.moduleId && !moduleMenu.length) {
          document.querySelector('[data-target="#'+e.parentNode.id+'"]').remove();
        }
        // console.log(e.getAttribute('ng-reflect-module-id'),e.parentNode.id, document.querySelector('[data-target="#'+e.parentNode.id+'"]'))
      })
    });
    this.subscriptions.push(menuSubscr);

    // console.log('aaaaaaaaaaaaaaa ngOnInit => ', this.moduleId);
  }

  // ngAfterViewInit() {
  //   console.log('aaaaaaaaaaaaaaa ngAfterViewInit => ', this.moduleId);
  // }
  // ngOnChanges(e) {
  //   console.log('aaaaaaaaaaaaaaa ngOnChanges => ', this.moduleId);
  // }

  private getLogo() {
    if (this.brandSkin === 'light') {
      return './assets/media/logos/brand/idc-logo-medium.png';
    } else {
      return './assets/media/logos/brand/idc-logo-medium.png';
    }
  }

  isMenuItemActive(path) {
    if (!this.currentUrl || !path) {
      return false;
    }

    if (this.currentUrl === path) {
      return true;
    }

    if (this.currentUrl.indexOf(path) > -1) {
      return true;
    }

    return false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
