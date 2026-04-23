// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth';

@Component({
  standalone: false,

  selector: 'app-ris-dashboard-links',
  templateUrl: './ris-dashboard-links.component.html',
  styleUrls: ['./ris-dashboard-links.component.scss']
})
export class RisDashboardLinksComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.getRouts();
  }

  // Create a single object with state indexes
  stateObject: Record<string, boolean> = {};
  getRouts() {
    const perms_allowed: { state: string }[] = this.authService.getUserPermissionsFromLocalStorage() || [];
    const routes: { state: string }[] = perms_allowed;
    // Extract unique state values
    const stateIndexes: string[] = routes.map(route => route.state);
    const uniqueStateIndexes: string[] = Array.from(new Set(stateIndexes));

    
    uniqueStateIndexes.forEach(state => {
      this.stateObject[state] = true;
    });
  }

}
