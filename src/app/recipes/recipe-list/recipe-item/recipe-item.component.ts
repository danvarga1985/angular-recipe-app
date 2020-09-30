import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Recipe } from '../../recipe.model';

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.scss']
})
export class RecipeItemComponent implements OnInit {
  // Binded by recipe-list component
  @Input() recipe: Recipe;

  // Comes from recipe-list
  @Output() recipeSelected = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  // tslint:disable-next-line:typedef
  onSelected() {
    this.recipeSelected.emit();
  }



}
