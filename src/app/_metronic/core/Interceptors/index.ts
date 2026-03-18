// @ts-nocheck
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpRequestInterceptor } from "../Interceptors/http-request.interceptor";

export const httpInterceptorProvider = [
    {provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true}
]