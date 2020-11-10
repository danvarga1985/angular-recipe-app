import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RecipesComponent} from './recipes.component';
import {AuthGuard} from '../auth/auth.guard';
import {RecipeStartComponent} from './recipe-start/recipe-start.component';
import {RecipeEditComponent} from './recipe-edit/recipe-edit.component';
import {RecipeDetailComponent} from './recipe-detail/recipe-detail.component';
import {RecipesResolverService} from '../services/recipes-resolver.service';

const routes: Routes = [
  {
    // Path has to be empty, because in app-routing this route has already been loaded - lazy loading.
    path: '', component: RecipesComponent, canActivate: [AuthGuard], children: [
      {path: '', component: RecipeStartComponent},
      // 'new' has to come before the dynamic parameter 'id', otherwise 'new' would also be considered a dynamic parameter.
      {path: 'new', component: RecipeEditComponent},
      // Apply the 'RecipeResolverService' to the paths, so that the page will be loaded only after the data is loaded.
      {path: ':id', component: RecipeDetailComponent, resolve: [RecipesResolverService]},
      {path: ':id/edit', component: RecipeEditComponent, resolve: [RecipesResolverService]},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecipesRoutingModule {

}
