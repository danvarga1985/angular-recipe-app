import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {User} from '../auth/user.model';
import {FIREBASE_KEY} from '../server-url';
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

  constructor(private http: HttpClient, private router: Router) {
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

  logout(): void {
    this.user.next(null);
    this.router.navigate(['/auth']);
  }

  private handleAuthentication(email: string, id: string, token: string, expiresIn: number): void {
    /*
     'expirationDate' = Get current date (getTime): timestamp in milliseconds -> add 'expiresIn' in milliseconds
     ('expiresIn' is in seconds originally).
    */
    const expirationDate = new Date(
      new Date().getTime() + expiresIn * 1000
    );

    const user = new User(
      email,
      id,
      token,
      expirationDate);

    this.user.next(user);

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
