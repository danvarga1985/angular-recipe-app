import {Component, Input, OnInit} from '@angular/core';
import {Recipe} from '../../recipe.model';
import {RecipeService} from '../../../services/recipe.service';

@Component({
  selector: 'app-recipe-item',
  templateUrl: './recipe-item.component.html',
  styleUrls: ['./recipe-item.component.scss']
})
export class RecipeItemComponent implements OnInit {
  // Bound by recipe-list component
  @Input() recipe: Recipe;
  @Input() index: number;

  ngOnInit(): void {
  }

}
