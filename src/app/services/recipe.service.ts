import {EventEmitter, Injectable} from '@angular/core';
import {Recipe} from '../recipes/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipeSelected = new EventEmitter<Recipe>();

  private recipes: Recipe[] = [
    new Recipe('A test recipe', 'This is just a test',
      'https://static.dribbble.com/users/301004/screenshots/994795/dribble.jpg'),
    new Recipe('Another recipe', 'This is just a test',
      'https://static.dribbble.com/users/301004/screenshots/994795/dribble.jpg')
  ];

  getRecipes(): Recipe[] {
    // Return a copy of the recipes array
    return this.recipes.slice();
  }

  getRecipeSelected(): EventEmitter<Recipe> {
    return this.recipeSelected;
  }

  constructor() {
  }
}
