import {EventEmitter, Injectable} from '@angular/core';
import {Recipe} from '../recipes/recipe.model';
import {Ingredient} from '../shared/ingredient.model';
import {ShoppingListService} from './shopping-list.service';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  // Subscribed to by 'recipes.component'
  private recipeSelected = new EventEmitter<Recipe>();

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

  constructor(private shoppingListService: ShoppingListService) {
  }

  getRecipes(): Recipe[] {
    // Return a copy of the recipes array
    return this.recipes.slice();
  }

  // Comes from 'recipe-item'
  getRecipeSelected(): EventEmitter<Recipe> {
    return this.recipeSelected;
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]): void {
    this.shoppingListService.addIngredientsToShoppingList(ingredients);
}

}
