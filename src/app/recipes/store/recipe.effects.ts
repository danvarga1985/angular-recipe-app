import {Actions, Effect, ofType} from '@ngrx/effects';
import * as RecipeActions from './recipe.actions';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Recipe} from '../recipe.model';
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipeEffects {
  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipeActions.FETCH_RECIPES),
    switchMap(() => {
        return this.http
          .get<Recipe[]>(
            'https://angular-recipe-app-backe-3cf79.firebaseio.com/recipes.json'
          );
      }
    ),
    map(recipes => {
      return recipes.map(recipe => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        };
      });
    }),
    map(recipes => {
      return new RecipeActions.SetRecipes(recipes);
    })
  );

  @Effect({dispatch: false})
  storeRecipes = this.actions$.pipe(
    ofType(RecipeActions.STORE_RECIPES),
    // 'withLatestFrom' - merge a value from another Observable to another.
    withLatestFrom(this.store.select('recipes')),
    // actionData - from 'actions$'; recipeState - from 'withLatestFrom'.
    switchMap(([actionData, recipesState]) => {
      return this.http.put(
        'https://angular-recipe-app-backe-3cf79.firebaseio.com/recipes.json', recipesState.recipes
      );
    })
  );

  constructor(private actions$: Actions, private http: HttpClient, private store: Store<fromApp.AppState>) {
  }
}

