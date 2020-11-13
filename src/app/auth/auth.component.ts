import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthResponseData, AuthService} from '../services/auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  // 'isLoginMode' is also part of the State, but it doesn't effect any other part of the application, therefore it isn't part of the Store.
  isLoginMode = true;
  isLoading = false;
  // Error property can be more complex, but now only the message is relevant, hence it is just a string.
  error: string = null;

  constructor(private authService: AuthService, private router: Router, private store: Store<fromApp.AppState>) {
  }

  ngOnInit(): void {
    this.store.select('auth').subscribe(authState => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
    });
  }

  onSwitchMode(): void {
    // Change 'isLoginMode'
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm): void {
    // Extra validation (in case the DOM has been manipulated - e.g. enabling the Submit button on an invalid form)
    if (form.invalid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;
    // Because the subscription is the same for the Login & Signup, the observable is set as a variable.
    let authObservable: Observable<AuthResponseData>;

    this.isLoading = true;

    if (this.isLoginMode) {
      this.store.dispatch(new AuthActions.LoginStart({email, password}));
    } else {
      authObservable = this.authService.signUp(email, password);
    }


    // authObservable.subscribe(responseData => {
    //   console.log(responseData);
    //   this.isLoading = false;
    //   // Once the user logged in or signed up, they're redirected to the recipe page.
    //   this.router.navigate(['/recipes']);
    // }, errorMessage => {
    //   console.log(errorMessage);
    //   this.error = errorMessage;
    //   this.isLoading = false;
    // });

    form.reset();
  }

  onHandleError(): void {
    this.error = null;
  }
}
