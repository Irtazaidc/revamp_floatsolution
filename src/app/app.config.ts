// @ts-nocheck
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideNgxMask } from 'ngx-mask';
import { provideToastr } from 'ngx-toastr'; // ✅ ADD THIS
import { httpInterceptorProvider } from './_metronic/core/Interceptors';
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

    provideNgxMask(), // ✅ ADD THIS LINE

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
    ...httpInterceptorProvider,
    provideRouter(appRoutes, withHashLocation()),
    provideCharts(withDefaultRegisterables()),
  ],
};