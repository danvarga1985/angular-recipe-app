import {Component, OnInit} from '@angular/core';
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private  authService: AuthService) {
  }

  ngOnInit(): void {
    // Try to login automatically on application-startup based on local storage data.
    this.authService.autoLogin();
  }
}
