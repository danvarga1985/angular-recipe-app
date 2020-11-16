import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {FIREBASE_KEY} from '../../server-url';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../user.model';
import {AuthService} from '../../services/auth.service';


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

const handleAuthentication = (email: string, userId: string, token: string, expiresIn: number) => {
  const expirationDate = new Date(
    new Date().getTime() + expiresIn * 1000
  );

  const user = new User(email, userId, token, expirationDate);
  localStorage.setItem('userData', JSON.stringify(user));

  return new AuthActions.AuthenticateSuccess(
    {
      email,
      userId,
      token,
      expirationDate
    });
};

const handleError = (errorResponse: HttpErrorResponse) => {
  let errorMessage = 'An unknown error occurred!';

  // Firebase specific structure.
  if (!errorResponse.error || !errorResponse.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
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
  return of(new AuthActions.AuthenticateFail(errorMessage));
};

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
        tap(responseData => {
          this.authService.setLogoutTimer(+responseData.expiresIn * 1000);
        }),
        map(responseData => {
          return handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);
        }),
        /*
         catchError has to be called in an "inner-Observable" because upon error it destroys the Observable it is attached to.
         With Effects, that Observable should exist as long as the application is running.
        */
        catchError(errorResponse => {
          return handleError(errorResponse);
        })
      );
    })
  );

  @Effect()
  authSignUp = this.actions$.pipe(
    ofType(AuthActions.SIGN_UP_START),
    switchMap((signUpAction: AuthActions.SignUpStart) => {
      return this.http.post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FIREBASE_KEY,
        {
          // Follow firebase criteria: https://firebase.google.com/docs/reference/rest/auth/#section-create-email-password
          email: signUpAction.payload.email,
          password: signUpAction.payload.password,
          returnSecureToken: true
        }
      ).pipe(
        tap(responseData => {
          this.authService.setLogoutTimer(+responseData.expiresIn * 1000);
        }),
        map(responseData => {
          return handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);
        }),
        /*
         catchError has to be called in an "inner-Observable" because upon error it destroys the Observable it is attached to.
         With Effects, that Observable should exist as long as the application is running.
        */
        catchError(errorResponse => {
          return handleError(errorResponse);
        })
      );
    })
  );

  // Let Angular know that the Effect won't dispatch an action.
  @Effect({dispatch: false})
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap(() => {
      this.router.navigate(['/']);
    })
  );

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
        this.authService.clearLogoutTimer();
        localStorage.removeItem('userData');
        this.router.navigate(['/auth']);
      }
    )
  );

  @Effect()
  authAutoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {

      // Parse the string data from local storage to an object-literal.
      const userData: {
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string;
      } = JSON.parse(localStorage.getItem('userData'));

      if (!userData) {
        return {type: 'DUMMY'};
      }

      const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

      // If there's valid data in the local storage, set the active user based on that data -> user is already logged in.
      if (loadedUser.token) {
        // Get the difference between the current time and 'tokenExpirationDate' in milliseconds.
        const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();

        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess(
          {
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate)
          });

      }

      return {type: 'DUMMY'};
    })
  );

  /*
   A. 'Actions' is an Observable, that gives access to all dispatched Actions.
   B. Unlike Reducers, in Effects contains only code that won't change the application's state.
  */
  constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService) {
  }
}
