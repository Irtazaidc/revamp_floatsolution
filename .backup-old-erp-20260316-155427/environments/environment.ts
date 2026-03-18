// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.


export const environment = {
  production: false,
  appVersion: 'v726demo1',
  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: false,
  testingEnv: true,
  deployedAppName: '',

 // Data
// apiUrl: 'https://stgapi.metacubes.net/meta/api/',
apiUrl: 'https://localhost:57261/api/',

// LIVE
// apiUrl: 'https://api.metacubes.net/meta/api/',


patientReportsPortalUrl: 'http://localhost:4500/',
// patientReportsPortalUrl: 'https://stgapi.metacubes.net/p/api/',
// patientReportsPortalUrl: 'https://reports.idc.net.pk/PatientReportsPortalStg/',
vimsApiUrl: 'https://reports.idc.net.pk/vimsService/api/',
// patientPortalApiUrl: 'https://stgapi.metacubes.net/p/api/',
patientPortalApiUrl: 'http://localhost:51780/api/',
pushNotificationsApiUrl: 'https://localhost:44304/api/',
fbrApiUrl: 'http://localhost:8524/api/IMSFiscal/',
smartReportApiUrl: 'https://stgapi.metacubes.net/sr/api/',
// RealtimeMetacubesUrl:'https://localhost:54187/',
RealtimeMetacubesUrl:'https://reports.idc.net.pk/RealtimeMetacubesData',
// RealtimeMetacubesUrl1:'https://localhost:54187',
RealtimeMetacubesUrl1:'https://stgapi.metacubes.net',
// RealtimeMetacubesUrl:'https://reports.idc.net.pk/RealtimeMetacubesData/booking-chat',
EmailServiceUrl: 'https://reports.idc.net.pk/EmailService/#/'



};




/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
