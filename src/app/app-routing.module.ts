import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const appRoutes: Routes = [
  {path: '', redirectTo: '/recipes', pathMatch: 'full'},
  /*
   Anonymous arrow function 'loadChildren' ensures that selected modules are loaded only when the path is visited - lazy loading.
   Real resource-saving comes from the reduced imports.
  */
  {path: 'recipes', loadChildren: () => import('./recipes/recipes.module').then(m => m.RecipesModule)},
  {path: 'shopping-list', loadChildren: () => import('./shopping-list/shopping-list.module').then(m => m.ShoppingListModule)},
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)}
];

@NgModule({
    /*
     'preloadingStrategy: PreloadAllModules' loads all lazy modules once the initial loading is done. This way the app is faster both
     during and after the initial loading.
    */
    imports: [RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})],
    exports: [RouterModule]
  }
)
export class AppRoutingModule {
}
