import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
  @Output() recipeWasSelected = new EventEmitter<Recipe>();

  recipes: Recipe[] = [
    new Recipe('A test recipe', 'This is just a test',
    'https://static.dribbble.com/users/301004/screenshots/994795/dribble.jpg'),
    new Recipe('Another recipe', 'This is just a test',
    'https://static.dribbble.com/users/301004/screenshots/994795/dribble.jpg')

  ];

  constructor() { }

  ngOnInit(): void {
  }

  // Forwards the selected recipe
  // tslint:disable-next-line:typedef
  onRecipeSelected(recipe: Recipe) {
    this.recipeWasSelected.emit(recipe);
  }
}
