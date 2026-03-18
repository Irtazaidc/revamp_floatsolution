// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../../../../core';

@Component({
  selector: 'app-notifications-offcanvas',
  templateUrl: './notifications-offcanvas.component.html',
  styleUrls: ['./notifications-offcanvas.component.scss'],
  standalone: false,
})
export class NotificationsOffcanvasComponent implements OnInit {
  extrasNotificationsOffcanvasDirectionCSSClass = 'right';

  constructor(private layout: LayoutService) {}
  ngOnInit(): void {
    this.extrasNotificationsOffcanvasDirectionCSSClass = `offcanvas-${this.layout.getProp(
      'extras.notifications.offcanvas.direction'
    )}`;
  }

  isNotificationsPanelVisible = true; // Controls the visibility of the notifications panel
   // Example CSS class, could be 'left' or 'right'

  toggleNotificationsPanel() {
    this.isNotificationsPanelVisible = !this.isNotificationsPanelVisible;
  }
}
