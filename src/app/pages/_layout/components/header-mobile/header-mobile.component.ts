// @ts-nocheck
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { LayoutService } from '../../../../_metronic/core';

@Component({
  standalone: false,

  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.scss'],
})
export class HeaderMobileComponent implements OnInit, AfterViewInit {
  asideSelfDisplay = true;
  headerMenuSelfDisplay = true;
  headerMobileClasses = '';
  headerMobileAttributes = {};
  constructor(
    private layout: LayoutService,
    private helperService: HelperService
    ) { }

  ngOnInit(): void {
    // build view by layout config settings
    this.headerMobileClasses = this.layout.getStringCSSClasses('header_mobile');
    this.headerMobileAttributes = this.layout.getHTMLAttributes(
      'header_mobile'
    );

    this.asideSelfDisplay = this.layout.getProp('aside.self.display');
    this.headerMenuSelfDisplay = this.layout.getProp(
      'header.menu.self.display'
    );
  }

  ngAfterViewInit() {
    // Init Header Topbar For Mobile Mode
    // KTLayoutHeaderTopbar.init('kt_header_mobile_topbar_toggle');
  }

  onBrandLogoClick() {
    this.helperService.windowRefresh();
  }

}
