import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {exhaustMap, map, take} from 'rxjs/operators';
import * as fromApp from '../store/app.reducer';
import {Store} from '@ngrx/store';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private store: Store<fromApp.AppState>) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // The state provided by the 'auth' reducer is a User.
    return this.store.select('auth').pipe(
      take(1),
      // Need to extract the 'user' property from the State object.
      map(authState => {
        return authState.user;
      }),
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
