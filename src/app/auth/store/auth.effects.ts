import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {FIREBASE_KEY} from '../../server-url';
import {HttpClient} from '@angular/common/http';
import {of, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';


// Define the model of the response-data. Firebase-specific.
export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  // 'registered' only needed at login, but not at sign up, so it has to be optional.
  registered?: boolean;
}

@Injectable()
export class AuthEffects {
  // '@Effect' marks the Observable as an Effect, and dispatches every action it might return.
  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    // 'switchMap' creates another Observable based on another Observable's data.
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + FIREBASE_KEY,
        {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        map(responseData => {
          const expirationDate = new Date(
            new Date().getTime() + +responseData.expiresIn * 1000
          );

          return new AuthActions.Login(
            {
              email: responseData.email,
              userId: responseData.localId,
              token: responseData.idToken,
              expirationDate
            });
        }),
        /*
         catchError has to be called in an "inner-Observable" because upon error, it destroys the observable it is attached to.
         With Effects, that Observable should exist as long as the application is running.
        */
        catchError(errorResponse => {
          let errorMessage = 'An unknown error occurred!';

          // Firebase specific structure.
          if (!errorResponse.error || !errorResponse.error.error) {
            return of(new AuthActions.LoginFail(errorMessage));
          }

          /*
           A. Shared error-pool for login & sign up.
           B. In case no switch case applies, the 'errorMessage' won't change.
          */
          switch (errorResponse.error.error.message) {
            case 'EMAIL_EXISTS':
              errorMessage = 'This email already exists!';
              break;
            case 'EMAIL_NOT_FOUND':
              errorMessage = 'Unregistered email!';
              break;
            case 'INVALID_PASSWORD':
              errorMessage = 'The password is invalid';
              break;
            case 'USER_DISABLED':
              errorMessage = 'This user is deactivated!';
              break;
          }
          return of(new AuthActions.LoginFail(errorMessage));
        })
      );
    })
  );

  // Let Angular know that the Effect won't dispatch an action.
  @Effect({dispatch: false})
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.LOGIN),
    tap(() => {
      this.router.navigate(['/']);
    })
  );

  /*
   A. 'Actions' is an Observable, that gives access to all dispatched Actions.
   B. Unlike Reducers, in Effects contains only code that won't change the application's state.
  */
  constructor(private actions$: Actions, private http: HttpClient, private router: Router) {
  }
}
