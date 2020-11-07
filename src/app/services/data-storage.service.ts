import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {RecipeService} from './recipe.service';
import {Recipe} from '../recipes/recipe.model';
import {exhaustMap, map, take, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  constructor(private http: HttpClient, private recipeService: RecipeService, private authService: AuthService) {
  }

  storeRecipes(): void {
    const recipes = this.recipeService.getRecipes();

    // Overwrite all recipe-data on the firebase server
    this.http.put('https://angular-recipe-app-backe-3cf79.firebaseio.com/recipes.json', recipes)
      .subscribe(response => {
        console.log(response);
      });
  }

  fetchRecipes(): Observable<Recipe[]> {
    /*
    A .'take()' is called as a function, and accepts a number as parameter. It then takes that many value from the Observable, then
    automatically unsubscribes from it. The user acquired this way is needed for the 'token', that Firebase needs for authentication.
    B. 'exhaustMap' waits for the first Observable to complete, uses the data needed from it, then replaces it with another Observable.
    */
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        // Firebase expects the 'token' as query-parameter.
        return this.http.get<Recipe[]>('https://angular-recipe-app-backe-3cf79.firebaseio.com/recipes.json');
      }),
      map(recipes => {
        // Array.map function gets called.
        return recipes.map(recipe => {
          // In case the recipe has no ingredients, set an empty array, instead of undefined.
          return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
        });
      }),
      tap(recipes => {
        this.recipeService.setRecipes(recipes);
      })
    );
  }
}
