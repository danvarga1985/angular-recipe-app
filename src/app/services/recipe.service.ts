import {Injectable} from '@angular/core';
import {Recipe} from '../recipes/recipe.model';
import {Ingredient} from '../shared/ingredient.model';
import {ShoppingListService} from './shopping-list.service';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private recipes: Recipe[] = [];

  // Fetching the recipes from the server.
/*
  private recipes: Recipe[] = [
    new Recipe(
      'Plain oatmeal',
      'They used to feed this to horses',
      'http://www.simplecomfortfood.com/wp-content/uploads/2015/04/instant-oatmeal-granola.jpg',
      [
        new Ingredient('Oats', 1000),
        new Ingredient('Berries', 50)
      ]),
    new Recipe(
      'A pair of bananas',
      'Hardly a meal',
      'https://c.pxhere.com/photos/de/ae/bananas_fruit_banana_shrub_yellow_food_healthy_fruits_vitamins-761788.jpg!d',
      [
        new Ingredient('Banana', 2)
      ])
  ];
*/

  recipesChanged = new Subject<Recipe[]>();

  constructor(private shoppingListService: ShoppingListService) {
  }

  getRecipes(): Recipe[] {
    // Return a copy of the recipes array
    return this.recipes.slice();
  }

  getRecipe(index: number): Recipe {
    return this.recipes[index];
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]): void {
    this.shoppingListService.addIngredientsToShoppingList(ingredients);
  }

  addRecipe(recipe: Recipe): void {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe): void {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number): void {
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }

  setRecipes(recipes: Recipe[]): void {
    this.recipes = recipes;
    this.recipesChanged.next(this.recipes.slice());
  }

}
