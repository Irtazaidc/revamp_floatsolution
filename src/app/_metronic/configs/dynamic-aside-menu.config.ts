// @ts-nocheck
export const DynamicAsideMenuConfig = {
  items: [
    {
      title: 'Dashboard',
      root: true,
      icon: 'flaticon2-architecture-and-city',
      svg: './assets/media/svg/icons/Design/Layers.svg',
      page: '/dashboard',
      translate: 'MENU.DASHBOARD',
      bullet: 'dot',
    },
    {
      title: 'Layout Builder',
      root: true,
      icon: 'flaticon2-expand',
      page: '/builder',
      svg: './assets/media/svg/icons/Home/Library.svg'
    },
    { section: 'Components' },
    {
      title: 'Google Material',
      root: true,
      bullet: 'dot',
      page: '/material',
      icon: 'flaticon2-browser-2',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          title: 'Form Controls',
          bullet: 'dot',
          page: '/material/form-controls',
          submenu: [
            {
              title: 'Auto Complete',
              page: '/material/form-controls/autocomplete',
              permission: 'accessToECommerceModule'
            },
            {
              title: 'Checkbox',
              page: '/material/form-controls/checkbox'
            },
            {
              title: 'Radio Button',
              page: '/material/form-controls/radiobutton'
            },
            {
              title: 'Datepicker',
              page: '/material/form-controls/datepicker'
            },
            {
              title: 'Form Field',
              page: '/material/form-controls/formfield'
            },
            {
              title: 'Input',
              page: '/material/form-controls/input'
            },
            {
              title: 'Select',
              page: '/material/form-controls/select'
            },
            {
              title: 'Slider',
              page: '/material/form-controls/slider'
            },
            {
              title: 'Slider Toggle',
              page: '/material/form-controls/slidertoggle'
            }
          ]
        },
        {
          title: 'Navigation',
          bullet: 'dot',
          page: '/material/navigation',
          submenu: [
            {
              title: 'Menu',
              page: '/material/navigation/menu'
            },
            {
              title: 'Sidenav',
              page: '/material/navigation/sidenav'
            },
            {
              title: 'Toolbar',
              page: '/material/navigation/toolbar'
            }
          ]
        },
        {
          title: 'Layout',
          bullet: 'dot',
          page: '/material/layout',
          submenu: [
            {
              title: 'Card',
              page: '/material/layout/card'
            },
            {
              title: 'Divider',
              page: '/material/layout/divider'
            },
            {
              title: 'Expansion panel',
              page: '/material/layout/expansion-panel'
            },
            {
              title: 'Grid list',
              page: '/material/layout/grid-list'
            },
            {
              title: 'List',
              page: '/material/layout/list'
            },
            {
              title: 'Tabs',
              page: '/material/layout/tabs'
            },
            {
              title: 'Stepper',
              page: '/material/layout/stepper'
            },
            {
              title: 'Tree',
              page: '/material/layout/tree'
            }
          ]
        },
        {
          title: 'Buttons & Indicators',
          bullet: 'dot',
          page: '/material/buttons-and-indicators',
          submenu: [
            {
              title: 'Button',
              page: '/material/buttons-and-indicators/button'
            },
            {
              title: 'Button toggle',
              page: '/material/buttons-and-indicators/button-toggle'
            },
            {
              title: 'Chips',
              page: '/material/buttons-and-indicators/chips'
            },
            {
              title: 'Icon',
              page: '/material/buttons-and-indicators/icon'
            },
            {
              title: 'Progress bar',
              page: '/material/buttons-and-indicators/progress-bar'
            },
            {
              title: 'Progress spinner',
              page: '/material/buttons-and-indicators/progress-spinner'
            },
            {
              title: 'Ripples',
              page: '/material/buttons-and-indicators/ripples'
            }
          ]
        },
        {
          title: 'Popups & Modals',
          bullet: 'dot',
          page: '/material/popups-and-modals',
          submenu: [
            {
              title: 'Bottom sheet',
              page: '/material/popups-and-modals/bottom-sheet'
            },
            {
              title: 'Dialog',
              page: '/material/popups-and-modals/dialog'
            },
            {
              title: 'Snackbar',
              page: '/material/popups-and-modals/snackbar'
            },
            {
              title: 'Tooltip',
              page: '/material/popups-and-modals/tooltip'
            }
          ]
        },
        {
          title: 'Data table',
          bullet: 'dot',
          page: '/material/data-table',
          submenu: [
            {
              title: 'Paginator',
              page: '/material/data-table/paginator'
            },
            {
              title: 'Sort header',
              page: '/material/data-table/sort-header'
            },
            {
              title: 'Table',
              page: '/material/data-table/table'
            }
          ]
        }
      ]
    },
    {
      title: 'Ng-Bootstrap',
      root: true,
      bullet: 'dot',
      page: '/ngbootstrap',
      icon: 'flaticon2-digital-marketing',
      svg: './assets/media/svg/icons/Shopping/Bitcoin.svg',
      submenu: [
        {
          title: 'Accordion',
          page: '/ngbootstrap/accordion'
        },
        {
          title: 'Alert',
          page: '/ngbootstrap/alert'
        },
        {
          title: 'Buttons',
          page: '/ngbootstrap/buttons'
        },
        {
          title: 'Carousel',
          page: '/ngbootstrap/carousel'
        },
        {
          title: 'Collapse',
          page: '/ngbootstrap/collapse'
        },
        {
          title: 'Datepicker',
          page: '/ngbootstrap/datepicker'
        },
        {
          title: 'Dropdown',
          page: '/ngbootstrap/dropdown'
        },
        {
          title: 'Modal',
          page: '/ngbootstrap/modal'
        },
        {
          title: 'Pagination',
          page: '/ngbootstrap/pagination'
        },
        {
          title: 'Popover',
          page: '/ngbootstrap/popover'
        },
        {
          title: 'Progressbar',
          page: '/ngbootstrap/progressbar'
        },
        {
          title: 'Rating',
          page: '/ngbootstrap/rating'
        },
        {
          title: 'Tabs',
          page: '/ngbootstrap/tabs'
        },
        {
          title: 'Timepicker',
          page: '/ngbootstrap/timepicker'
        },
        {
          title: 'Tooltips',
          page: '/ngbootstrap/tooltip'
        },
        {
          title: 'Typehead',
          page: '/ngbootstrap/typehead'
        }
      ]
    },
    { section: 'Applications' },
    {
      title: 'eCommerce',
      bullet: 'dot',
      icon: 'flaticon2-list-2',
      svg: './assets/media/svg/icons/Shopping/Cart3.svg',
      root: true,
      permission: 'accessToECommerceModule',
      page: '/ecommerce',
      submenu: [
        {
          title: 'Customers',
          page: '/ecommerce/customers'
        },
        {
          title: 'Products',
          page: '/ecommerce/products'
        },
      ]
    },
    {
      title: 'User Management',
      root: true,
      bullet: 'dot',
      icon: 'flaticon2-user-outline-symbol',
      svg: './assets/media/svg/icons/General/User.svg',
      page: '/user-management',
      submenu: [
        {
          title: 'Users',
          page: '/user-management/users'
        },
        {
          title: 'Roles',
          page: '/user-management/roles'
        }
      ]
    },
    {
      title: 'User Profile',
      root: true,
      bullet: 'dot',
      icon: 'flaticon2-user-outline-symbol',
      svg: './assets/media/svg/icons/Communication/Add-user.svg',
      page: '/user-profile',
    },
    {

    },
    { section: 'Custom' },
    {
      title: 'Wizards',
      root: true,
      bullet: 'dot',
      icon: 'flaticon2-mail-1',
      svg: './assets/media/svg/icons/Shopping/Box1.svg',
      page: '/wizards',
      submenu: [
        {
          title: 'Wizard 1',
          page: '/wizards/wizard-1'
        },
        {
          title: 'Wizard 2',
          page: '/wizards/wizard-2'
        },
        {
          title: 'Wizard 3',
          page: '/wizards/wizard-3'
        },
        {
          title: 'Wizard 4',
          page: '/wizards/wizard-4'
        },
      ]
    },
    {
      title: 'Error Pages',
      root: true,
      bullet: 'dot',
      icon: 'flaticon2-list-2',
      svg: './assets/media/svg/icons/Code/Warning-2.svg',
      page: '/error',
      submenu: [
        {
          title: 'Error 1',
          page: '/error/error-1'
        },
        {
          title: 'Error 2',
          page: '/error/error-2'
        },
        {
          title: 'Error 3',
          page: '/error/error-3'
        },
        {
          title: 'Error 4',
          page: '/error/error-4'
        },
        {
          title: 'Error 5',
          page: '/error/error-5'
        },
        {
          title: 'Error 6',
          page: '/error/error-6'
        },
      ]
    },
  ]
};

export const AppMenu = {
  items: [


    

    { section: 'Reception' },
    {
      title: 'Dashboard',
      root: true,
      icon: 'flaticon2-architecture-and-city',
      svg: './assets/media/svg/icons/Design/Layers.svg',
      page: '/dashboard',
      translate: 'MENU.DASHBOARD',
      bullet: 'dot',
      ignoreAuth: true,
      module: 6,
    },
    {
      title: 'Reception',
      module: 6,
      root: true,
      bullet: 'dot',
      page: '/hc',
      icon: 'ti-desktop',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/tp-configs/test-rates',
          title: 'Test Rates'
        },
        {
          page: '/information-desk/info-desk',
          title: 'Information Desk',
          icon: 'ti-search'
        },
        {
          page: '/pat-reg/fdo-sales',
          title: 'FDO Sales',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/fdo-closed-sales',
          title: 'FDO Closed Sales',
          // ignoreAuth: true
        },
        {
          page: '/fdo-management/my-cash-tally',
          title: 'My Cash Tally',
        },
        {
          page: '/pat-reg/branch-sales-closing',
          title: 'Branch Sales Closing',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/visit-management',
          title: 'Visit Management',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/delayed-cancellation-requests',
          title: 'Delayed Cancellation',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/delayed-approvals',
          title: 'Delayed Approvals',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/visit-cancellation-manager',
          title: 'Visit Cancellation Manager',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/tp-cancellation-req',
          title: 'Cancellation Approvals',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/fbr-inv-repost',
          title: 'FBR Invoice Repost ',
          // ignoreAuth: true
        }
        ,
        {
          page: '/tp-configs/tp-charge-master',
          title: 'Charge Master',
          // ignoreAuth: true
        },
        {
          page: '/information-desk/inquiry-report',
          title: 'Inquiry Report',
          icon: 'ti-search'
        },
        {
          page: '/guidance-system/insurance-inquiry-report',
          title: 'FIT Coverage Inquiry Report',
          icon: 'ti-dashboard',
          // ignoreAuth:true,
        },
      ]
    },
    {
      title: 'Print Reports',
      root: true,
      bullet: 'dot',
      page: '/print',
      icon: 'ti-printer',
      module: 6,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/print/pat-rpts',
          title: 'Print Reports',
          icon: 'ti-search'
        },
        {
          page: '/pat-reg/manage-reports-on-desk',
          title: 'Manage Reports On Desk',
          // ignoreAuth: true
        },
      ]
    },
    {
      title: 'Appointments',
      root: true,
      bullet: 'dot',
      page: '/pat-appointments',
      icon: 'ti-calendar',
      module: 6,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/appointments/pat-appointments',
          title: 'Patient Appointments',
          icon: 'ti-search'
        }
      ]
    },
    { section: 'General Reports / Misc.' },
    {
      title: 'General Reports / Misc.',
      root: true,
      bullet: 'dot',
      page: '/pat-reg',
      icon: 'ti-files',
      module: 6,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/pat-reg/document-audit',
          title: 'Document Audit',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/update-visit-info',
          title: 'Update Visit Info.',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/update-refby',
          title: 'Update RefBy',
        },
        
      ]
    },
    {
      title: 'Free Test Approvals',
      root: true,
      bullet: 'dot',
      page: '/free-test-approvals',
      icon: 'ti-calendar',
      module: 6,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/pat-reg/free-test-approvals',
          title: 'Free Test Approvals',
          icon: 'ti-search'
        }
      ]
    },
    { section: 'Registration / Booking' },
    {
      title: 'Registration / Booking',
      root: true,
      bullet: 'dot',
      page: '/pat-reg',
      icon: 'ti-pencil-alt',
      module: 6,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/pat-reg/search',
          title: 'Search Patient',
          icon: 'ti-search'
        },
        {
          page: '/pat-reg/reg',
          title: 'Patient Reg / Booking',
          icon: 'ti-user'
        },
        {
          page: '/pat-reg/regForHS',
          title: 'Reg. For Home Smp.',
          icon: 'ti-user'
        },
        {
          page: '/pat-reg/hc-booking',
          title: 'Home Collection Booking ',
          // ignoreAuth: true
        },
        // {
        //   page: '/pat-reg/manage-reports-on-desk',
        //   title: 'Manage Reports On Desk',
        //   // ignoreAuth: true
        // },
        {
          page: '/pat-reg/dis-card-sale',
          title: 'Sale Discount Card'
        }
        ,
        {
          page: '/pat-reg/add-family',
          title: 'Add Family Members',
          // ignoreAuth: true
        }
        ,
        {
          page: '/pat-reg/panel-conversion',
          title: 'Panel Security Refund',
          // ignoreAuth: true
        }
        ,
        {
          page: '/pat-reg/outsource-patients',
          title: 'ECL Waiting patients',
          // ignoreAuth: true
        }
        ,
        {
          page: '/pat-reg/post-dengue-data',
          title: 'Post Data To Dengue Portal ',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/employee-test-request',
          title: 'Employee Test Request',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/post-dengue-data',
          title: 'Post Data To Dengue Portal ',
          // ignoreAuth: true
        },
        // {
        //   page: '/pat-reg/update-visit-info',
        //   title: 'Update Visit Info.',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/pat-reg/update-refby',
        //   title: 'Update RefBy',
        // },
      ]
    },
   
    { section: 'App Config' },
    {
      title: 'Lab Configs',
      root: true,
      bullet: 'dot',
      page: '/lab-configs',
      icon: 'ti-settings',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/lab-configs/machine-mgt',
          title: 'Machine\'s Management',
          // ignoreAuth: true
        },
        {
          page: '/lab-configs/rack-mgt',
          title: 'Rack Management',
        },
        {
          page: '/lab-configs/test-machine-priority',
          title: 'Test Machine Priority',
        },
        
      ]
    },

    {
      title: 'RIS Configs',
      root: true,
      bullet: 'dot',
      page: '/lab-configs',
      icon: 'ti-settings',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/ris/questionnaire',
          title: 'Questionnaire'
        },
        {
          page: '/ris/radiologist',
          title: 'Radiologist'
        },
        {
          page: '/ris/refby-radiologist-mapping',
          title: 'RefBy Radiologist Mapping',
        },
        {
          page: '/ris/ris-dictionary',
          title: 'RIS Dictionary'
        },
        {
          page: '/ris/ris-user-dictionary',
          title: 'RIS User Dictionary'
        },
        {
          page: '/ris/report-templates',
          title: 'Report Templates'
        },
        {
          page: '/ris/user-report-templates',
          title: 'User Report Templates'
        },
        {
          page: '/ris/ris-machine-mgt',
          title: 'RIS Machine Config.'
        }
      ]
    },
    {
      title: 'Roles & Permissions',
      root: true,
      bullet: 'dot',
      page: '/roles-and-permissions',
      icon: 'ti-shield',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [

        {
          page: '/roles-and-permissions/rolespermissions',
          title: "User's Roles | Permission",
          icon: 'ti-search',
          // ignoreAuth: true
        },
        {
          page: '/roles-and-permissions/assign-user-role',
          title: 'Manage User',
          icon: 'ti-search'
        },
        // {
        //   page: '/roles-and-permissions/manageusers',
        //   title: 'Manage Users Roles',
        //   icon: 'ti-search'
        // },

        // {
        //   page: '/roles-and-permissions/permissions',
        //   title: 'Permissions',
        //   icon: 'ti-search'
        // },
        // {
        //   page: '/roles-and-permissions/assign-user-role',
        //   title: 'Assign User Role',
        //   icon: 'ti-search'
        // },

      ]
    },
    {
      title: 'Test Profile Management',
      root: true,
      bullet: 'dot',
      page: '/tp-configs',
      icon: 'ti-settings',
      module: 7,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/tp-configs/test-profile-configurations',
          title: 'Test Profile Configurations'
        },
        {
          page: '/tp-configs/report-disclaimer',
          title: 'Report Disclaimer'
        },
        {
          page: '/tp-configs/test-comments',
          title: 'Test Comments'
        },
        {
          page: '/tp-configs/manage-tp',
          title: 'Manage Test/Profile',
          // ignoreAuth: true
        }


      ]
    },
    {
      title: 'Branch Management',
      root: true,
      bullet: 'dot',
      page: '/branch',
      icon: 'ti-settings',
      module: 7,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/branch/branch-config',
          title: 'Branch Config'
        }
      ]
    },
    {
      title: 'Notice Board',
      root: true,
      bullet: 'dot',
      page: '/notice-board',
      icon: 'ti-blackboard',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/notice-board/nb-config',
          title: 'Notice Board'
        }
      ]
    },
    {
      title: 'Marketing',
      root: true,
      bullet: 'dot',
      page: '/marketing',
      icon: 'ti-stats-up',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 8,
      submenu: [
        {
          page: '/marketing/products-promotion',
          title: 'Products Promotion'
        },
        {
          page: '/marketing/push-notifications',
          title: 'Push Notifications'
        },
        {
          page: '/marketing/news-events-listing',
          title: 'News and Events'
        },
        {
          page: '/marketing/campaign-configuration',
          title: 'Campaign Configuration'
        },
        {
          page: '/marketing/tests-mrk-configuration',
          title: 'Tests Configuration',
        }
      ]
    },
    {
      title: 'Reports',
      root: true,
      bullet: 'dot',
      page: '/marketing',
      icon: 'fa fa-eye',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 8,
      submenu: [
        {
          page: '/marketing/app-user-count-report',
          title: 'MyIDC App User Count'
        },
      ]
    },
    {
      title: 'FAQs',
      root: true,
      bullet: 'dot',
      page: '/faqs',
      icon: 'fa fa-question-circle', // ti-help
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/faqs/faqs-list',
          title: 'FAQs Management',
          // ignoreAuth: true
        }
      ]
    },
    {
      title: 'Telephone Extensions',
      root: true,
      bullet: 'dot',
      page: '/faqs',
      icon: 'fa fa-phone-square',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/misc/telephone-extensions',
          title: 'Manage Extensions',
          // ignoreAuth: true
        }
      ]
    },
    {
      title: 'Doctors Configs',
      root: true,
      bullet: 'dot',
      page: '/doctors',
      icon: 'fa fa-user-md',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/doctors/doctors-and-mapping',
          title: 'Doctors and Mapping',
          icon: 'ti-search',
        },
        {
          page: '/doctors/b2b-doctors',
          title: 'B2B Doctors',
          icon: 'ti-search',
        },
        {
          page: '/doctors/ref-by-doctors',
          title: 'Ref. by Doctors',
          icon: 'ti-search',
        },
        {
          page: '/doctors/ref-by-b2b-doctors-mapping',
          title: 'Doctors Mapping',
          icon: 'ti-search',
        },
        {
          page: '/doctors/refby-shift',
          title: 'Referring Dr\'s Request',
          icon: 'ti-share',
        }
      ]
    },
    {
      title: 'Miscellaneous',
      root: true,
      bullet: 'dot',
      page: '/blocking',
      icon: 'fa fa-ban',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,

      submenu: [
        {
          page: '/blocking/generator-logs',
          title: 'Generator Fuel Logs',
          icon: 'ti-search',
        },
        {
          page: '/blocking/generator-activation-logs',
          title: 'Generator Activation Logs',
          icon: 'ti-search',
        },
        // {
        //   page: '/blocking/blocked-process',
        //   title: 'Blocked Process',
        //   icon: 'ti-search',
        // },
      ]
    },
    {
      title: 'General Reports',
      root: true,
      bullet: 'dot',
      page: '/gen-reports',
      icon: 'fa fa-snowflake',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/reports/tpdata-reports',
          title: 'Test Profile Data',
          icon: 'ti-search',
        },
        {
          page: '/reports/annualmed-reports',
          title: 'Annual Medicals',
          icon: 'ti-search',
          
        },
        {
          page: '/reports/dr-prescription-config',
          title: ' Doctor Presc. OCR',
          icon: 'ti-search',
          // ignoreAuth: true
          
        },
      ]
    },
    {
      title: 'Manage Panel',
      root: true,
      bullet: 'dot',
      page: '/gen-reports',
      icon: 'fa fa-sticky-note',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/billing/manage-panel',
          title: 'Manage Panel',
          // ignoreAuth:true,
        },
       
      ]
    },
    {
      title: 'Campaign Configuration',
      root: true,
      bullet: 'dot',
      page: '/gen-reports',
      icon: 'fa fa-chart-line',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 7,
      submenu: [
        {
          page: '/marketing/campaign-configuration',
          title: 'Campaign Configuration'
        },
      ]
    },
    // {
    //   title: 'Radiologist Availability Config',
    //   root: true,
    //   bullet: 'dot',
    //   page: '/cms',
    //   icon: 'fa fa-sticky-note',
    //   svg: './assets/media/svg/icons/Design/Cap-2.svg',
    //   module: 7,
    //   submenu: [
    //     {
    //       page: '/cms/radiologist-availability-config',
    //       title: 'Radiologist Availability Config',
    //     },
       
    //   ]
    // },
    { section: 'Lab' },
    {
      title: 'Registration / Booking',
      root: true,
      bullet: 'dot',
      page: '/pat-reg',
      icon: 'ti-pencil-alt',
      module: 6,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [

      ]
    },

    {
      title: 'Sample Tracking',
      root: true,
      module: 4,
      bullet: 'dot',
      page: '/sample-dispatch',
      icon: 'ti-truck', // fa fa-eyedropper
      svg: './assets/media/svg/icons/Design/Picker.svg',
      submenu: [
        {
          page: '/sample-tracking/sample-dispatch',
          title: 'Dispatch',
          icon: 'ti-search'
        },
        {
          page: '/sample-tracking/pending-inv-cost',
          title: 'Pending Invoice / Actual Cost',
          icon: 'ti-search'
        },
        {
          page: '/sample-tracking/sample-receiving',
          title: 'Sample Receiving',
          icon: 'ti-search'
        },
        {
          page: '/sample-tracking/sample-tracking-dashboard',
          title: 'Tracking Dashboard',
          icon: 'ti-search'
        }
        
      ]
    },
    {
      title: 'Sample Management',
      root: true,
      module: 4,
      bullet: 'dot',
      page: '/sample-mgmt',
      icon: 'ti-settings', // fa fa-eyedropper
      svg: './assets/media/svg/icons/Design/Picker.svg',
      submenu: [
        {
          page: '/sample-mgmt/phlebotomy',
          title: 'Phlebotomy',
          icon: 'ti-search'
        }
      ]
    },
    {
      title: 'Reports',
      root: true,
      module: 4,
      bullet: 'dot',
      page: '/lab',
      icon: 'fa fa-eye', // fa fa-eyedropper
      svg: './assets/media/svg/icons/Design/Picker.svg',
      submenu: [
        {
          page: '/lab/sample-trnsprt-TAT',
          title: 'Sample Transportation TAT',
          icon: 'ti-search',
          // ignoreAuth: true
        },
        {
          page: '/lab/lab-testing-TAT',
          title: 'Lab Testing TAT',
          icon: 'ti-search',
          // ignoreAuth: true
        },
        {
          page: '/lab/delay-report',
          title: 'Delay Report',
          icon: 'ti-search',
          // ignoreAuth: true
        },
        {
          page: '/lab/due-report',
          title: 'Due Report',
          icon: 'ti-search',
          // ignoreAuth: true
        },

      ]
    },
    { section: 'Home Collection' },
    {
      title: 'Configs',
      module: 2,
      root: true,
      bullet: 'dot',
      page: '/hc',
      icon: 'ti-settings',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/hc/hc-city-auth',
          title: 'HC City Authorization',
          icon: 'ti-search'
        }
        ,
        {
          page: '/hc/hccity-config',
          title: 'HC City Configs',
          icon: 'ti-search'
        }
        ,
        {
          page: '/hc/rider',
          title: 'HC Staff Management',
          icon: 'ti-search'
        }
        ,
        {
          page: '/hc/zone-config',
          title: 'Zone Cofiguration',
          icon: 'ti-search'
        },
        {
          page: '/hc/rider-messagebox',
          title: 'Rider MessageBox',
          icon: 'ti-search'
        },

      ]
    },
    {
      title: 'Booking',
      module: 2,
      root: true,
      bullet: 'dot',
      page: '/hc',
      icon: 'ti-pencil-alt',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [

        {
          page: '/pat-reg/regForHS',
          title: 'Reg. For Home Smp.',
          icon: 'ti-user'
        }
        ,
      ]
    },
    {
      title: 'Dashboard',
      module: 2,
      root: true,
      bullet: 'dot',
      page: '/hc',
      icon: 'flaticon2-architecture-and-city',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/hc/hc-admin-dashboard',
          title: 'Admin Dashboard',
          icon: 'ti-search'
        },
        {
          page: '/hc/hc-dashboard',
          title: 'HC Dashboard',
          icon: 'ti-search'
        },
        {
          page: '/hc/rider-dashboard',
          title: 'HC Rider Dashboard',
          icon: 'ti-search'
        },
        {
          page: '/hc/hc-rider-checklist',
          title: 'HC Rider Checklist',
          // ignoreAuth: true,
         
        },
        {
          page: '/hc/hc-booking-comparison',
          title: 'HC Booking Records',
          icon: 'ti-search',
        },
        {
          page: '/hc/rider-device-info',
          title: 'Rider Device Info',
          // ignoreAuth: true,
        }
      ]
    },
    {
      title: 'Home Sampling',
      module: 2,
      root: true,
      bullet: 'dot',
      page: '/hc',
      icon: 'ti-truck',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/cms/hc-request-submission',
          title: 'Request For Home Collection',
          icon: 'ti-pencil-alt'
        },
        {
          page: '/hc/hc-booking',
          title: 'HC Booking',
          icon: 'ti-pencil-alt'
        }
        ,
        {
          //  page: '/pat-reg/search',
          page: '/hc/hc-requests',
          title: 'HC Request(s)',
          icon: 'ti-search'
        },
        {
          page: '/hc/gen-hc-share',
          title: 'Generate Hc Share',
          icon: 'ti-search'
        },
        {
          page: '/hc/update-hcbooking',
          title: 'Update HC Booking',
          icon: 'ti-search'
        },
        {
          page: '/hc/hc-worklist',
          title: 'HC Worklist',
          icon: 'ti-search',
        },
        {
          page: '/hc/cater-hc-request',
          title: 'Cater CC Request',
          icon: 'ti-search',
          // ignoreAuth: true
        },


      ]
    }
    ,
    {
      title: 'Reports',
      module: 2,
      root: true,
      bullet: 'dot',
      page: '/hc',
      icon: 'ti-eye',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/hc/booking-inquiry',
          title: 'HC Booking Inquiry',
          icon: 'ti-search'
        },
        {
          page: '/hc/exp-hcbooking-rpt',
          title: 'HC Booking Report',
          icon: 'ti-search'
        },
        {
          page: '/hc/hc-status-rpt',
          title: 'HC Status Wise Report',
          icon: 'ti-search'
        },
        {
          page: '/hc/hcshare-det-rpt',
          title: 'HC Share Report',
          icon: 'ti-search'
        },
        
        {
          page: '/hc/hc-collection-report',
          title: 'Sample Collection Report',
          icon: 'ti-search',
        },
        {
          page: '/hc/rider-share-report',
          title: 'Rider Share Report',
          icon: 'ti-search',          
        },
        {
          page: '/hc/hc-portable-services-share-report',
          title: 'Portable Services Share',
          icon: 'ti-search',    
        },
        {
          page: '/hc/hc-booking-activity',
          title: 'HC Booking Activity',
          icon: 'ti-search',
          // ignoreAuth: true,    
        },
      ]
    },


    { section: 'Racking & Routing' },
    {
      title: 'Racking & Routing',
      root: true,
      bullet: 'dot',
      page: '/racking-routing',
      icon: 'ti-layout-column2',
      module: 4,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/racking-routing/racking-routing',
          title: 'Racking Routing'
        },
        {
          page: '/racking-routing/lab-accession',
          title: 'Accessioning'
        },

      ]
    },
    { section: 'Results' },
    {
      title: 'Results Entry',
      root: true,
      bullet: 'dot',
      module: 4,
      page: '/visit-res-entry',
      icon: 'ti-pencil',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/visit-res-entry/lab-res-entry',
          title: 'Lab Results',
          icon: 'ti-search'
        }
      ]
    },
    { section: 'Recruitment' },
    {
      title: 'Recruitment',
      root: true,
      bullet: 'dot',
      page: '/recruitment',
      icon: 'ti-briefcase',
      module: 9,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        // {
        //   page: '/recruitment/post-job',
        //   title: 'Post Job',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/manage-job',
        //   title: 'Job Recommendation',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/job-approval',
        //   title: 'Job Approval',
        //   // ignoreAuth: true 
        // },
        // {
        //   page: '/recruitment/applicant-list',
        //   title: 'Applicant List',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/shortlisted-applicants',
        //   title: 'Shortlisted Applicants',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/confirmed-applicants',
        //   title: 'Confirmed Applicants',
        //   // ignoreAuth: true
        // }, 
        // {
        //   page: '/recruitment/interviewers',
        //   title: 'Interviewers Management',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/interview-process',
        //   title: 'Interview Process',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/interview-result',
        //   title: 'Interview Result',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/second-shortlisted-applicants',
        //   title: 'Shortlisted Applicants (2nd Interview)',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/second-confirmed-applicants',
        //   title: 'Confirmed Applicants (2nd Interview)',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/second-interviewers',
        //   title: 'Interviewers Management(2nd)',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/second-interview-process',
        //   title: 'Second Interview Process',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/second-interview-result',
        //   title: 'Second Interview Result',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/third-shortlisted-applicants',
        //   title: 'Shortlisted Applicants (3rd Interview)',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/third-confirmed-applicants',
        //   title: 'Confirmed Applicants (3rd Interview)',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/third-interviewers',
        //   title: 'Interviewers Management(3rd)',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/third-interview-process',
        //   title: 'Third Interview Process',
        //   // ignoreAuth: true
        // },
        // {
        //   page: '/recruitment/third-interview-result',
        //   title: 'Third Interview Result',
        //   // ignoreAuth: true
        // },
        {
          page: '/recruitment/job-mgt',
          title: 'Jobs Management',
          // ignoreAuth: true
        },
        {
          page: '/recruitment/applicant-mgt',
          title: 'Applicants Management',
          // ignoreAuth: true
        },
        {
          page: '/recruitment/interviewers-mgt',
          title: 'Interviewers Management',
          // ignoreAuth: true
        },
        {
          page: '/recruitment/first-interview',
          title: 'First Interview',
          // ignoreAuth: true
        },
        {
          page: '/recruitment/second-interview',
          title: 'Second Interview',
          // ignoreAuth: true
        },
        {
          page: '/recruitment/third-interview',
          title: 'Third Interview',
          // ignoreAuth: true
        },
        {
          page: '/recruitment/applicants-confirmation',
          title: 'Applicant Confirmation'
        },
        {
          page: '/recruitment/onboarding',
          title: 'Onboarding'
        }

      ]
    },


    { section: 'EMR' },
    {
      title: 'EMR',
      root: true,
      bullet: 'dot',
      page: '/recruitment',
      icon: 'ti-briefcase',
      module: 9,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/recruitment/employee-medical-record',
          title: 'Employee Medical Record',
        },
      ]
    },
    { section: 'Mess' },
    {
      title: 'Mess',
      root: true,
      bullet: 'dot',
      page: '/mess',
      icon: 'fa fa-leaf',
      module: 9,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/mess/activation-report',
          title: 'Mess Activation Report',
          // ignoreAuth: true
        },
      ]
    },

    

    { section: 'Business Suite' },
    {
      title: 'Business Suite',
      root: true,
      bullet: 'dot',
      // page: '/bussines-suite',
      icon: 'ti-bar-chart',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 10,
      submenu: [
        {
          page: '/bussiness-suite/registration-stat',
          title: 'Registration Statistics',
          // ignoreAuth: true
        },
        {
          page: '/bussiness-suite/revenue-stat',
          title: 'Revenue Statistics',
          // ignoreAuth: true
        }
        ,
        {
          page: '/bussiness-suite/reg-section-stat',
          title: 'Reg Section Statistics',
          // ignoreAuth: true
        },
        {
          page: '/analytics/sales',
          title: 'Sales Analytics',
          // ignoreAuth: true
        },
      ]
    },
    { section: 'Analytics' },
    {
      title: 'Analytics',
      root: true,
      bullet: 'dot',
      page: '/analytics',
      icon: 'ti-bar-chart',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 11,
      submenu: [
        {
          page: '/analytics/sales',
          title: 'Sales Analytics',
          // ignoreAuth: true
        },
      ]
    },
    // { section: 'Miscellaneous' },
    // {
    //   title: 'Miscellaneous',
    //   root: true,
    //   bullet: 'dot',
    //   // page: '/bussines-suite',
    //   icon: 'ti-bar-chart',
    //   svg: './assets/media/svg/icons/Design/Cap-2.svg',
    //   submenu: [
    //     {
    //       // page: '/misc/enc-decrypt',
    //       page: '/misc/coming-soon',
    //       title: 'Encrypt Decrypt',
    //       // ignoreAuth: true
    //     },
    //     {
    //       page: '/misc/coming-soon',
    //       title: 'Coming Soon',
    //       // ignoreAuth: true
    //     },

    //   ]

    // },
    { section: 'RIS DS' },
    {
      title: 'RIS DS',
      root: true,
      bullet: 'dot',
      page: '/lab-configs',
      icon: 'ti-settings',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 5,
      submenu: [
        {
          page: '/ris/ris-result-entry',
          title: 'DS'
        }
      ]
    },
    { section: 'RIS Configs' },
    {
      title: 'RIS Configs',
      root: true,
      bullet: 'dot',
      page: '/lab-configs',
      icon: 'ti-settings',
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      module: 5,
      submenu: [
        {
          page: '/ris/questionnaire',
          title: 'Questionnaire'
        },
        {
          page: '/ris/radiologist',
          title: 'Radiologist'
        },
        {
          page: '/ris/ris-dictionary',
          title: 'RIS Dictionary'
        },
        {
          page: '/ris/ris-user-dictionary',
          title: 'RIS User Dictionary'
        },
        {
          page: '/ris/report-templates',
          title: 'Report Templates'
        },
        {
          page: '/ris/user-report-templates',
          title: 'User Report Templates'
        },
        {
          page: '/ris/ris-machine-mgt',
          title: 'RIS Machine Config.'
        },
        {
          page: '/ris/refby-radiologist-mapping',
          title: 'RefBy Radiologist Mapping',
        },
      ]
    },
    { section: 'MO Worklist' },
    {
      title: 'MO Worklist',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'ti-layout-cta-left',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/mo-worklist',
          title: 'MO WorkList',
        },
      ]
    },

    { section: 'Technician Worklist' },
    {
      title: 'Technician Worklist',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'fa fa-stethoscope',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/tech-worklist',
          title: 'Technician WorkList',
        },
        {
          page: '/ris/tech-audit',
          title: 'Technologist Audit',
        },
        {
          page: '/ris/tech-audit-summary-report',
          title: 'Tech Audit Summary Report',
        },
        {
          page: '/ris/my-tech-audit-summary-report',
          title: 'My Audit Report',
        },
        {
          page: '/ris/tech-audit-summary-report-branch-mgr',
          title: 'Tech Audit Summary-Branch Mgr',
        }
      ]
    },
    { section: 'RIS Services' },
    {
      title: 'RIS Services',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'fa fa-film',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/ris-services',
          title: 'RIS Services',
        },
      ]
    },

    { section: 'Queue Management' },
    {
      title: 'Queue Management',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'ti-layout-media-left-alt',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/queue-management',
          title: 'Queue Management',
          // ignoreAuth: true
        },
        {
          page: '/ris/assign-bulk-test',
          title: 'Assign Bulk Test',
        },
        {
          page: '/ris/queue-manager',
          title: 'Queue Manager',
          // ignoreAuth: true
        },
        {
          page: '/ris/bulk-queue-manager',
          title: 'Bulk Queue Manager',
          // ignoreAuth: true
        },
      ]
    },
    { section: 'Reporting Worklist' },
    {
      title: 'Reporting Worklist',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'ti-agenda',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/reporting-worklist',
          title: 'Reporting Worklist',
          // ignoreAuth: true
        },
        {
          page: '/ris/reporting-v2',
          title: 'Reporting V2',
          // ignoreAuth: true
        },
        {
          page: '/ris/peer-review',
          title: 'Peer Review',
          // ignoreAuth: true
        }
      ]
    },
    { section: 'Addendum/Second Opinion' },
    {
      title: 'Addendum/Second Opinion',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'fas fa-file-medical',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/addendum-second-opinion-request',
          title: 'Addendum/Second Opinion Req.'
        },
        {
          page: '/ris/second-opinion-report',
          title: 'Second Opinion Report'
        }
      ]
    },
    { section: 'Reset Final Signature' },
    {
      title: 'Reset Request',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'fas fa-recycle',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/report-reset-request',
          title: 'Reset Request',
          // ignoreAuth: true
        },
        {
          page: '/ris/recommend-reject-request',
          title: 'Recomend/Reject Reset Req.',
          // ignoreAuth: true
        },
        {
          page: '/ris/approve-reject-request',
          title: 'Aporove/Reject Reset Req.',
          // ignoreAuth: true
        }
      ]
    },
    {
      title: 'Initial Reset Request',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'fas fa-recycle',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/initial-report-reset-request',
          title: 'Initial Reset Reques',
        },
        {
          page: '/ris/initial-recommend-reject-request',
          title: 'Init Recomend/Reject Reset Req.'
        },
        {
          page: '/ris/initial-approve-reject-request',
          title: 'Init Aporove/Reject Reset Req.'
        }
      ]
    },
    { section: 'Reports Audit' },
    {
      title: 'Reports Audit',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'fas fa-clipboard-check',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/send-for-audit',
          title: 'Send for Audit'
        },
        {
          page: '/ris/audit-report',
          title: 'Audit Report'
        },
        {
          page: '/ris/audit-summary-report',
          title: 'Audit Summary Report(dr)'
        },
        {
          page: '/ris/audit-findings',
          title: 'Audit Findings(mgr)'
        },
        {
          page: '/ris/radiologist-audit-findings',
          title: 'Radiologist Audit Findings'
        },
        {
          page: '/ris/ai-req-feedback',
          title: 'AI Request Feedback',
        },
        {
          page: '/ris/ai-req-feedback-audit',
          title: 'AI Req. Feedback Audit'
        }
      ]
    },
    { section: 'Share Configs' },
    {
      title: 'Share Configs',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'fas fa-users-cog',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        // These are not in use and depriecated
        // {
        //   page: '/ris/assign-level',
        //   title: 'Assign Level',
        // },
        // {
        //   page: '/ris/assign-share',
        //   title: 'Assign Share',
        //   // ignoreAuth: true

        // },
        {
          page: '/ris/doctor-share-config',
          title: 'Doctor Share Config',
        },
      ]
    },
    { section: 'PacsLink Dashboard' },
    {
      title: 'PacsLink Dashboard',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'ti-layout-menu-v',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/pacslink-dashboard',
          title: 'Pacs',

        }
      ]
    },
    { section: 'Machine Utilization Report' },
    {
      title: 'Machine Utilization Report',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'ti-panel',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/machine-utilization-report',
          title: 'Machine Utilization Report',
        }
      ]
    },
    { section: 'Radiology Statistics' },
    {
      title: 'Radiology Statistics',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'ti-pie-chart',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/radiology-stats',
          title: 'Radiology Statistics Report',
          // ignoreAuth: true
        }
      ]
    },
    { section: 'RIS Reports' },
    {
      title: 'RIS Reports',
      root: true,
      bullet: 'dot',
      page: '/ris',
      icon: 'ti-zip',
      module: 5,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/ris/ris-due-delay-reports',
          title: 'Delay Report',
        },
        {
          page: '/ris/ris-delay-summary-reports',
          title: 'Delay Summary Report',
        },
        {
          page: '/ris/ris-due-report',
          title: 'RIS Due Report',
        },
        {
          page: '/ris/ris-tat-report',
          title: 'RIS TAT Report',
        },
        {
          page: '/ris/ris-machine-sharing-report',
          title: 'RIS Machine Sharing Report',
        },
        {
          page: '/ris/mt-workload-report',
          title: 'MT Workload Report',
          // ignoreAuth: true
        }
      ]
    },
    // Start:: RMS Start
    {
      title: 'Dashboard',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/rms',
      icon: 'fas fa-chart-bar',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [
        {
          page: '/rms/cms-admin-dashboard',
          title: 'CMS Admin Dashboard',
          icon: 'ti-pencil-alt',
        },
        {
          page: '/cms/whatsapp-logs',
          title: 'Whatsapp Logs',
          icon: 'ti-pencil-alt',
          // ignoreAuth: true
        },
      ],

    },
    {
      title: 'FMS',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/rms',
      icon: 'fas fa-thumbs-up',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [
        {
          page: '/rms/feedback',
          title: 'Feedback',
          icon: 'ti-pencil-alt',
          // ignoreAuth: true
        },

      ],

    },
    {
      title: 'CMS',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/cms',
      icon: 'ti-comment-alt',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [
        {
          page: '/cms/create-complaint-feedback',
          title: 'Complaint Registration',
        },
        // {
        //   page: '/cms/hc-request-submission',
        //   title: 'Request For Home Collection',
        //   icon: 'ti-pencil-alt'
        // },
        {
          page: '/cms/cms-reporting',
          title: 'CMS Reporting',
        },
        // {
        //   page: '/cms/cms-analytics',
        //   title: 'CMS Analytics',
        //   ignoreAuth: true
        // },
        {
          page: '/cms/cc-request-handling',
          title: 'CMS Registration',
        },
        {
          page: '/cms/manage-cms-request',
          title: 'Manage CMS',
        },
        {
          page: '/cms/manage-my-cms',
          title: 'My CMS',
        },
        {
          page: '/cms/cms-inquiry',
          title: 'CMS Inquiries',
        }, 
        {
          page: '/cms/radiologist-availability',
          title: 'Radiologist Availability',
        }, 
      ],
    },
    {
      title: 'HC Request',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/cms',
      icon: 'ti-comment-alt',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [
        {
          page: '/cms/hc-request-submission',
          title: 'Request For Home Collection',
          icon: 'ti-pencil-alt'
        }, 
      ],
    },
    {
      title: 'Request Comparison',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/cms',
      icon: 'ti-comment-alt',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [
        {
          page: '/cms/request-comparison',
          title: 'RMS Request Comparison',
          icon: 'ti-pencil-alt',
        }, 
      ],
    },
    {
      title: 'SMS',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/sms',
      icon: 'fas fa-sms',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [

        // {
        //   page: '/sms/send-sms',
        //   title: 'Send SMS',
        //   icon: 'ti-pencil-alt',
        // },
        {
          page: '/sms/sending-sms-status',
          title: 'Sending SMS Status',
          icon: 'ti-pencil-alt',
        },
        {
          page: '/sms/cancellation-sms-status',
          title: 'Cancellation SMS Status',
          icon: 'ti-pencil-alt',
          // ignoreAuth: true
        },
        {
          page: '/sms/email-report',
          title: 'Email Report',
          icon: 'ti-pencil-alt',
          // ignoreAuth: true
        },
      ],

    },

    {
      title: 'Machine Status Log',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/rms',
      icon: 'ti-settings ',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [

        {
          page: '/rms/machine-status-log',
          title: 'Machine Status Log',
          icon: 'icofont-home bg-c-blue',
        },
      
      ],

    },
    {
      title: 'Services Log For KBS',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/rms',
      icon: 'ti-settings ',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [

        // {
        //   page: '/rms/services-log-for-kbs',
        //   title: 'Services Log For KBS',
        //   icon: 'icofont-home bg-c-blue',
        //   // ignoreAuth: true,
        // },
        {
          page: '/rms/branch-services-log',
          title: 'Branch Services Log',
          icon: 'icofont-home bg-c-blue',
          // ignoreAuth: true,
        },
      
      ],
    },
   
    {
      title: 'Outsource Hospital',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/rms',
      icon: 'ti-settings ',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [

        {
          page: '/rms/outsource-hospitals',
          title: 'Outsource Hospitals',
          icon: 'icofont-home bg-c-blue',
          // ignoreAuth: true,
        },
      ],

    },
    {
      title: 'Disease Config',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/rms',
      icon: 'ti-settings ',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [

        {
          page: '/rms/disease-config',
          title: 'Disease Config',
          icon: 'icofont-home bg-c-blue',
          // ignoreAuth: true,
        },
      ],

    },
    {
      title: 'Outsource Hospital Details',
      module: 12,
      root: true,
      bullet: 'dot',
      page: '/rms',
      icon: 'ti-settings ',
      svg: './assets/media/svg/icons/Design/Edit.svg',
      submenu: [

        {
          page: '/rms/outsource-hospital-details',
          title: 'Outsource Hospital Details',
          icon: 'icofont-home bg-c-blue',
        },
      
      ],

    },
     
    

   
    // END:: RMS

    {
      title: 'Billing',
      root: true,
      bullet: 'dot',
      page: '/billing',
      icon: 'fas fa-calculator',
      module: 13,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/billing/manage-billing',
          title: 'Manage Billing'
        },
        {
          page: '/billing/consolidated-report',
          title: 'Consolidated Report'
        },
        {
          page: '/billing/giz-bill-sales-report',
          title: 'GIZ Bill Sales Report',
          // ignoreAuth: true
        },
        {
          page: '/billing/panel-services-share',
          title: 'Panel Services Share Report',
          // ignoreAuth: true
        },
        {
          page: '/pat-reg/pending-panel-report',
          title: 'Pending Panel Report',
          // ignoreAuth: true
          
        },
        {
          page: '/pat-reg/panel-conversion-report',
          title: 'Panel Conversion Report',
          // ignoreAuth: true
          
        },
        {
          page: '/billing/alfalah-email-report',
          title: 'Alfalah Email Report',
          // ignoreAuth: true
        },
        {
          page: '/billing/digital-receipt-report',
          title: 'Digital Receipt Report',
          // ignoreAuth: true
        }
      ]
    },
    {
      title: 'Reports Share',
      root: true,
      bullet: 'dot',
      page: '/billing',
      icon: 'fas fa-file-invoice-dollar',
      module: 13,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/billing/my-services-share',
          title: 'My Services Share',
        },
        {
          page: '/billing/doctor-services-share',
          title: 'Doctor Services Share',
        },
        {
          page: '/billing/my-share-report',
          title: 'My Share Report New',
        },
      ]
    },

     // Start:: FDO Management
    {
      title: 'FDO Management',
      root: true,
      bullet: 'dot',
      page: '/fdo-management',
      icon: 'fa fa-users',
      module: 13,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        // {
        //   page: '/fdo-management/my-cash-tally',
        //   title: 'My Cash Tally',
        // },
        {
          page: '/fdo-management/daily-sales-report',
          title: 'Daily Sales Report',
          // ignoreAuth: true
        },
        {
          page: '/fdo-management/user-cash-report',
          title: 'User Cash Summary Report',
          // ignoreAuth: true
        },
        {
          page: '/fdo-management/due-clearance-report',
          title: 'Due Clearance Report',
        },
        {
          page: '/fdo-management/cancellation-report',
          title: 'Cancellation Report',
          //  ignoreAuth: true
        },
        {
          page: '/fdo-management/patient-test-count',
          title: 'Patient and Test Counts',
          //  ignoreAuth: true
        },
        // {
        //   page: '/fdo-management/patient-insurance',
        //   title: 'Patient Insurance',
        //   //  ignoreAuth: true
        // }
      ]
    },
    {
      title: 'Configuration',
      root: true,
      bullet: 'dot',
      page: '/billing',
      icon: 'ti-settings',
      module: 13,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/billing/manage-sales-deposit-slips',
          title: 'Manage Deposit Slips',
          // ignoreAuth: true,
        },
        {
          page: '/billing/manage-panel-users',
          title: 'Manage Panel Users',
          // ignoreAuth:true,
        },
        {
          page: '/billing/manage-partner-config',
          title: 'Manage Partner Config',
          // ignoreAuth:true,
        }
      ]
    },
    {
      title: 'FIT Coverage Reports',
      root: true,
      bullet: 'dot',
      page: '/billing',
      icon: 'ti-view-list-alt',
      module: 13,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/fdo-management/patient-insurance',
          title: 'Patient FIT Coverage',
          //  ignoreAuth: true
        },
        {
          page: '/fdo-management/patient-insurance-dashboard',
          title: 'FIT Coverage Dashboard',
          //  ignoreAuth: true
        },
        {
          page: '/fdo-management/registered-patients',
          title: 'Registered Patients',
          //  ignoreAuth: true
        },
        {
          page: '/fdo-management/unregistered-patients',
          title: 'Unregistered Patients',
          //  ignoreAuth: true
        },
        {
          page: '/fdo-management/insurance-summary',
          title: 'FIT Coverage Summary',
          // ignoreAuth:true,
        },
        // {
        //   page: '/fdo-management/insurance-reposting',
        //   title: 'Insurance Reposting',
        //   // ignoreAuth:true,
        // },
      ]
    },
    {
      title: 'Sale Reports',
      root: true,
      bullet: 'dot',
      page: '/billing',
      icon: 'ti-stats-up',
      module: 13,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/billing/branch-sales-report',
          title: 'Branch Sales Report',
          // ignoreAuth: true
        },
      ]
    },

    {
      title: 'Knowledge Based System',
      root: true,
      bullet: 'dot',
      page: '/guidance-system', //gbs is for Guidance Based System
      icon: 'ti-pencil-alt',
      module: 14,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
        {
          page: '/guidance-system/knowledge-based-dashboard',
          title: 'Knowledge Based Dashboard',
          icon: 'ti-dashboard',
        },
        
      ]
    },
    {
      title: 'Configurations',
      root: true,
      bullet: 'dot',
      page: '/guidance-system', //gbs is for Guidance Based System
      icon: 'ti-settings',
      module: 14,
      svg: './assets/media/svg/icons/Design/Cap-2.svg',
      submenu: [
         {
          page: '/cms/radiologist-availability-config',
          title: 'Radiologist Availability',
        },
        //  {
        //   page: '/guidance-system/services-config',
        //   title: 'Services Config',
        //   // ignoreAuth:true,

        // },
         {
          page: '/guidance-system/kbs-services-config',
          title: 'Services ',
          // ignoreAuth:true,

        },
         {
          page: '/guidance-system/kbs-branches-config',
          title: 'Branches ',
          // ignoreAuth:true,

        },
         {
          page: '/guidance-system/kbs-ticker-config',
          title: 'Ticker',
          // ignoreAuth:true,

        },
         {
          page: '/guidance-system/kbs-document-upload',
          title: 'Document Upload',
          // ignoreAuth:true,

        },
      ]
    },
    // {
    //   title: 'FAS System',
    //   root: true,
    //   bullet: 'dot',
    //   page: '/fas', 
    //   icon: 'ti-pencil-alt',
    //   module: 15,
    //   svg: './assets/media/svg/icons/Design/Cap-2.svg',
    //   submenu: [
    //     {
    //       page: '/fas/trial-report',
    //       title: 'Trial Report',
    //       icon: 'ti-dashboard',
    //       // ignoreAuth:true,
    //     },
    //   ]
    // },

     // END:: Billing
  ]
}
