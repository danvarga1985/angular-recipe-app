import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {map, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
  }

  // If there is an authenticated user, return true, otherwise redirect to '/auth'.
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> |
    boolean | UrlTree {
    return this.authService.user.pipe(
      // Make sure to take the latest value, then unsubscribe. No need for the guard after the initial check.
      take(1),
      map(user => {
        const isAuth = !!user;

        if (isAuth) {
          return true;
        }

        return this.router.createUrlTree(['/auth']);
      })
    );
  }

}
