import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from 'inx-auth-jwt-lib';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private userService: UserService) {

    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        if (this.userService.token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.userService.token}`
                }
            });
        }

        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                }
            },
            (err: any) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401) {
                        if (err.message.includes("Token Expired")) {
                            this.userService.logOut();
                        }
                    }
                }
            }
        ));
    }
}
