import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

// Define the model of the response-data. Firebase-specific.
export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  // 'registered' only needed at login, but not at signup, so it has to be optional.
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  signUp(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBMYH3gvDz3pQIHz1tvKcBidm6aDR3EkYg',
      {
        // Follow firebase criteria: https://firebase.google.com/docs/reference/rest/auth/#section-create-email-password
        email,
        password,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError));
  }

  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBMYH3gvDz3pQIHz1tvKcBidm6aDR3EkYg',
      {
        email,
        password,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError));
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
