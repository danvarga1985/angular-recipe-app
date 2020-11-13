import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {User} from '../auth/user.model';
import {FIREBASE_KEY} from '../server-url';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';


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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /*
   BehaviorSubject act the same as a Subject, but they provide the last emitted value, even if the emission happened before the
   subscription. Because of this, they need a starting value. This makes creating a 'token' variable unnecessary. In this app, the manual
   'fetch data' action will require the user-token, that has been emitted at authentication - BehaviorSubject will give access to that data.
  */
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router, private store: Store<fromApp.AppState>) {
  }

  signUp(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FIREBASE_KEY,
      {
        // Follow firebase criteria: https://firebase.google.com/docs/reference/rest/auth/#section-create-email-password
        email,
        password,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError),
      tap(responseData => {
        this.handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + FIREBASE_KEY,
      {
        email,
        password,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError),
      tap(responseData => {
        this.handleAuthentication(responseData.email, responseData.localId, responseData.idToken, +responseData.expiresIn);
      })
    );
  }

  autoLogin(): void {
    // Parse the string data from local storage to an object-literal.
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      return;
    }

    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

    // If there's valid data in the local storage, set the active user based on that data -> user is already logged in.
    if (loadedUser.token) {
      this.store.dispatch(
        new AuthActions.Login(
          {
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate)
          }));

      // Get the difference between the current time and 'tokenExpirationDate' in milliseconds.
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout(): void {
    this.store.dispatch(new AuthActions.Logout());
    localStorage.removeItem('userData');

    // Reset the token expiration countdown.
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;

    this.router.navigate(['/auth']);
  }

  autoLogout(expirationDuration: number): void {
    /*
     A. After 'expirationDuration' has passed, 'logout()' gets called.
     B. Start token-expiration countdown, by setting 'tokenExpirationTimer'.
    */
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number): void {
    /*
     'expirationDate' = Get current date (getTime): timestamp in milliseconds -> add 'expiresIn' in milliseconds
     ('expiresIn' is in seconds originally).
    */
    const expirationDate = new Date(
      new Date().getTime() + expiresIn * 1000
    );
    const user = new User(email, userId, token, expirationDate);

    this.store.dispatch(new AuthActions.Login(
      {
        email,
        userId,
        token,
        expirationDate
      }
    ));
    this.autoLogout(expiresIn * 1000);

    /*
     Save the user-data to the browser's local storage, so that it can be accessed even after page reload, or browser restart. This way
     there's no need for the user to re-authenticate in those situations. Another way to achieve this would be through cookies.
    */
    localStorage.setItem('userData', JSON.stringify(user));

  }

  private handleError(errorResponse: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    // Firebase specific structure.
    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(errorMessage);
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

    return throwError(errorMessage);
  }

}
