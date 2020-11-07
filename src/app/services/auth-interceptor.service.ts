import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {exhaustMap, take} from 'rxjs/operators';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        /*
         Ensure that the queryParams are added only if there is already a 'user'. In case of Sign up or Login, that is not that case,
         therefore the token shouldn't be sent.
        */
        if (user) {
          const modifiedRequest = req.clone({
            params: new HttpParams().set('auth', user.token)
          });
          return next.handle(modifiedRequest);
        } else {
          return next.handle(req);
        }
      })
    );
  }

}
