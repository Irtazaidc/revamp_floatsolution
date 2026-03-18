// @ts-nocheck
import {Injectable} from '@angular/core';

export interface BadgeItem {
  type: string;
  value: string;
}

export interface ChildrenItems {
  state: string;
  target?: boolean;
  name: string;
  icon?: string,
  type?: string;
  children?: ChildrenItems[];
}

export interface MainMenuItems {
  state: string;
  short_label?: string;
  main_state?: string;
  target?: boolean;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  children?: ChildrenItems[];
}

export interface Menu {
  label: string;
  main: MainMenuItems[];
}

const MENUITEMS: Menu[] = [
  {
    label: 'Navigation',
    main: [
      {
        state: 'dashboard',
        short_label: 'D',
        name: 'Dashboard',
        type: 'link',
        icon: 'ti-home',
        children: [
          {
            state: 'dashboard',
            name: 'Dashboard',
            icon: 'ti-home'
          },
        ]
      },
      {
        state: 'pat-reg',
        short_label: 'R',
        name: 'Registration / Booking',
        type: 'sub',
        icon: 'ti-pencil-alt',
        children: [
          {
            state: 'search',
            name: 'Search Patient',
            icon: 'ti-search'
          },
          {
            state: 'reg',
            name: 'Registration',
            icon: 'ti-user'
          },
          {
            state: 'regForHS',
            name: 'Reg. For Home Smp.',
            icon: 'ti-user'
          },
          {
            state: 'fdo-sales',
            name: 'Sales'
          },
          {
            state: 'visit-management',
            name: 'Visit Management'
          }
        ]
      },
      {
        state: 'sample-mgmt',
        short_label: 'P',
        name: 'Sample Management',
        type: 'sub',
        icon: 'fa fa-eyedropper',
        children: [
          {
            state: 'phlebotomy',
            name: 'Phlebotomy'
          }
        ]
      },
      {
        state: 'visit-res-entry',
        short_label: 'R',
        name: 'Results Entry',
        type: 'sub',
        icon: 'ti-pencil-alt',
        children: [
          {
            state: 'lab-res-entry',
            name: 'Lab Results',
            icon: 'ti-pencil-alt'
          }
        ]
      },
      {
        state: 'roles-and-permissions',
        short_label: 'R',
        name: 'Roles & Permissions',
        type: 'sub',
        icon: 'ti-view-list',
        children: [
          {
            state: 'rolespermissions',
            name: 'Roles Permissions',
            icon: 'fa fa-shield'
          },
          {
            state: 'roles',
            name: 'Roles',
            icon: 'fa fa-shield'
          },
          {
            state: 'permissions',
            name: 'Permissions',
            icon: 'fa fa-shield'
          },
          {
            state: 'assign-user-role',
            name: 'Assign User Role',
            icon: 'fa fa-shield'
          }
        ]
      },
      /*
      {
        state: 'push-notifications',
        short_label: 'P',
        name: 'Push Notifications',
        type: 'sub',
        icon: 'ti-bell',
        children: [
          {
            state: 'push-notifications',
            name: 'Push Notifications'
          }
        ]
      },
      {
        state: 'products-promotion',
        short_label: 'P',
        name: 'Products Promotion',
        type: 'sub',
        icon: 'ti-bar-chart-alt',
        children: [
          {
            state: 'products-promotion',
            name: 'Products Promotion'
          },
          // {
          //   state: 'addupdate-product-promotion',
          //   name: 'Products Promotion'
          // }
        ]
      },
      */
      {
        state: 'marketing',
        short_label: 'M',
        name: 'Marketing',
        type: 'sub',
        icon: 'ti-bar-chart-alt',
        children: [
          {
            state: 'products-promotion',
            name: 'Products Promotion',
            icon: 'ti-bar-chart-alt',
          },
          {
            state: 'push-notifications',
            name: 'Push Notifications',
            icon: 'ti-bell',
          },
          {
            state: 'news-events-listing',
            name: 'News and Events',
            icon: 'ti-book',
          },
        ]
      },
      {
        state: 'faqs',
        short_label: 'M',
        name: 'FAQs',
        type: 'sub',
        icon: 'ti-bar-chart-alt',
        children: [
          {
            state: 'faqs-management',
            name: 'FAQs Management',
            icon: 'ti-bar-chart-alt',
          }
        ]
      },
      {
        state: 'misc',
        short_label: 'M',
        name: 'Telephone Extensions',
        type: 'sub',
        icon: 'ti-bar-chart-alt',
        children: [
          {
            state: 'telephone-extensions',
            name: 'Telephone Extensions',
            icon: 'ti-bar-chart-alt',
          }
        ]
      },
      // {
      //   state: 'test-comments',
      //   short_label: 'P',
      //   name: 'Test Comments',
      //   type: 'sub',
      //   icon: 'ti-pencil',
      //   children: [
      //     {
      //       state: 'test-comments',
      //       name: 'Test Comments',
      //       icon: 'ti-align-left'
      //     }
      //   ]
      // },

      {
        state: 'tp-configs',
        short_label: 'P',
        name: 'Test Profile Management',
        type: 'sub',
        icon: 'ti-settings',
        children: [
          {
            state: 'test-profile-configurations',
            name: 'Configurations'
          },
          {
            state: 'test-comments',
            name: 'Test Comments',
            icon: 'ti-align-left'
          },
          {
            state: 'test-rates',
            name: 'Test Profile Rates'
          }
        ]
      },
      {
        state: 'notice-board',
        short_label: 'N',
        name: 'Notice Board',
        type: 'sub',
        icon: 'ti-clipboard',
        children: [
          {
            state: 'nb-config',
            name: 'Notification Configuration',
            icon: 'ti-settings',
          }
        ]
      },

      // {
      //   state: 'test-profile-management',
      //   short_label: 'P',
      //   name: 'Test Profile Configurations',
      //   type: 'sub',
      //   icon: 'ti-home',
      //   children: [
      //     {
      //       state: 'test-profile-management',
      //       name: 'Test Profile Configurations'
      //     }
      //   ]
      // }

  

      /* {
        state: 'attendance',
        short_label: 'A',
        name: 'Attendance',
        type: 'sub',
        icon: 'ti-home',
        children: [
          {
            state: 'emp-attendance',
            name: 'Employee Attendance'
          }
        ]
      } */
      /*,
      {
        state: 'basic',
        short_label: 'B',
        name: 'Basic Components',
        type: 'sub',
        icon: 'ti-layout-grid2-alt',
        children: [
          {
            state: 'button',
            name: 'Button'
          },
          {
            state: 'typography',
            name: 'Typography'
          }
        ]
      },
      {
        state: 'notifications',
        short_label: 'n',
        name: 'Notifications',
        type: 'link',
        icon: 'ti-crown'
      },*/
    ],
  }/*,
  {
    label: 'Tables',
    main: [
      {
        state: 'bootstrap-table',
        short_label: 'B',
        name: 'Bootstrap Table',
        type: 'link',
        icon: 'ti-receipt'
      }
    ]
  },
  {
    label: 'Map And Extra Pages ',
    main: [
      {
        state: 'map',
        short_label: 'M',
        name: 'Maps',
        type: 'link',
        icon: 'ti-map-alt'
      },
      {
        state: 'authentication',
        short_label: 'A',
        name: 'Authentication',
        type: 'sub',
        icon: 'ti-id-badge',
        children: [
          {
            state: 'login',
            type: 'link',
            name: 'Login',
            target: true
          }, {
            state: 'registration',
            type: 'link',
            name: 'Registration',
            target: true
          }
        ]
      },
      {
        state: 'user',
        short_label: 'U',
        name: 'User Profile',
        type: 'link',
        icon: 'ti-user'
      }
    ]
  },
  {
    label: 'Other',
    main: [
      {
        state: '',
        short_label: 'M',
        name: 'Menu Levels',
        type: 'sub',
        icon: 'ti-direction-alt',
        children: [
          {
            state: '',
            name: 'Menu Level 2.1',
            target: true
          }, {
            state: '',
            name: 'Menu Level 2.2',
            type: 'sub',
            children: [
              {
                state: '',
                name: 'Menu Level 2.2.1',
                target: true
              },
              {
                state: '',
                name: 'Menu Level 2.2.2',
                target: true
              }
            ]
          }, {
            state: '',
            name: 'Menu Level 2.3',
            target: true
          }, {
            state: '',
            name: 'Menu Level 2.4',
            type: 'sub',
            children: [
              {
                state: '',
                name: 'Menu Level 2.4.1',
                target: true
              },
              {
                state: '',
                name: 'Menu Level 2.4.2',
                target: true
              }
            ]
          }
        ]
      },
      {
        state: 'simple-page',
        short_label: 'S',
        name: 'Simple Page',
        type: 'link',
        icon: 'ti-layout-sidebar-left'
      }
    ]
  }, {
    label: 'Support',
    main: [
      {
        state: 'Upgrade To Pro',
        short_label: 'U',
        external: 'https://codedthemes.com/item/guru-able-admin-template/',
        name: 'Upgrade To Pro',
        type: 'external',
        icon: 'ti-layout-list-post',
        target: true
      }
    ]
  }*/
];

@Injectable()
export class MenuItems {
  getAll(): Menu[] {
    return MENUITEMS;
  }

  add(menu: Menu) {
    MENUITEMS.push(menu);
  }
}
