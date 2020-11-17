import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {AppRoutingModule} from './app-routing.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AuthInterceptorService} from './services/auth-interceptor.service';
import {ShoppingListModule} from './shopping-list/shopping-list.module';
import {SharedModule} from './shared/shared.module';
import {StoreModule} from '@ngrx/store';
import * as fromApp from './store/app.reducer';
import {EffectsModule} from '@ngrx/effects';
import {AuthEffects} from './auth/store/auth.effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {RecipeEffects} from './recipes/store/recipe.effects';

@NgModule({
  /*
   Declarations is an array of all the components, directives and custom-pipes used by the application. Declarations, unlike imports and
   exports, can happen only in one place.
  */
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  // Import is an array of other modules, imported into 'app.module'.
  imports: [
    /*
     'BrowserModule' is only needed in the app.module - must only be used once! Shouldn't be imported by other modules, those should import
     'CommonModule' instead.
    */
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ShoppingListModule,
    StoreModule.forRoot(fromApp.appReducer), // Import the global store, that contains all the reducers in the application.
    EffectsModule.forRoot([AuthEffects, RecipeEffects]),
    SharedModule,
    // Used together with the browser-extension.
    StoreDevtoolsModule.instrument({logOnly: environment.production}),
    StoreRouterConnectingModule.forRoot()
  ],
  /*
   Any service used in the app needs to be provided (most of this handled by annotations on the classes). These are needed to be provided
   only once, even when there are multiple modules.
  */
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true}], // Add Interceptor
  bootstrap: [AppComponent] // Load AppComponent at startup
})
export class AppModule { }
