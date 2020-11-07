import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

// Define the model of the response-data. Firebase-specific.
interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  signup(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBMYH3gvDz3pQIHz1tvKcBidm6aDR3EkYg',
      {
        // Follow firebase criteria: https://firebase.google.com/docs/reference/rest/auth/#section-create-email-password
        email,
        password,
        returnSecureToken: true
      }
      // Error-handling
    ).pipe(catchError(errorResponse => {
      let errorMessage = 'An unknown error occurred!';

      if (!errorResponse.error || !errorResponse.error.error) {
        return throwError(errorMessage);
      }

      switch (errorResponse.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage = 'This email already exitsts!';
      }

      return throwError(errorMessage);
    }));
  }

}
