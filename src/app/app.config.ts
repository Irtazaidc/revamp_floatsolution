// @ts-nocheck
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideToastr } from 'ngx-toastr'; // ✅ ADD THIS
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { appRoutes } from './app.routes';

class EmptyTranslateLoader implements TranslateLoader {
  getTranslation(_lang: string): Observable<any> {
    return of({});
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),

    // ✅ ADD THIS BLOCK
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: EmptyTranslateLoader },
      })
    ),

    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(appRoutes, withHashLocation()),
    provideCharts(withDefaultRegisterables()),
  ],
};