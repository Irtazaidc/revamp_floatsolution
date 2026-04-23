// @ts-nocheck
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { AuthModel } from 'src/app/modules/auth/_models/auth.model';
import { tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token:AuthModel = this.auth.getAuthFromLocalStorage() || new AuthModel();
    const _headers = {}
    _headers['Content-Type'] = (request.headers.get('Content-Type') || 'application/json');
    _headers['Authorization'] = (request.headers.get('Authorization') || `Bearer ${token.authToken || ''}`);

    request = request.clone({
      // url: request.url.replace('http://', 'https://'),
      setHeaders: _headers
    });

    // return next.handle(request);
    return next.handle(request).pipe(
      tap(
        resp => {},
        err => {
          if(err && err.status) {
            switch(err.status) {
              case 401:
                // handle 401 StatusCode
                this.toastr.warning('Not Authorized');
                break;
              case 403:
                // handle 403 StatusCode
                this.toastr.warning('Session expired, Please re login');
                break;
              case 500:
                // handle 500 StatusCode
                break;
              default:
                // default
            }
          }
        }
      )
    );

    /*
    return next.handle(request).map((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse && ~~(event.status / 100) > 3) {
        console.info('HttpResponse::event =', event, ';');
      } else console.info('event =', event, ';');
      return event;
    })
    .catch((err: any, caught) => {
      console.info('err.error 0 =', err, ';');
      if (err instanceof HttpErrorResponse) {
        console.info('err.error 1 =', err, ';');
        if (err.status === 403) {
          console.info('err.error =', err.error, ';');
        }
        return Observable.throw(err);
      }
    });
    */
  }
}
