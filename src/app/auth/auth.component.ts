import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  isLoginMode = true;
  isLoading = false;
  // Error property can be more complex, but now only the message is relevant, hence it is a string.
  error: string = null;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
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

    this.isLoading = true;

    if (this.isLoginMode) {
      // TODO: impl
    } else {
      this.authService.signup(email, password).subscribe(responseData => {
        console.log(responseData);
        this.isLoading = false;
      }, errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      });
    }

    form.reset();
  }
}
