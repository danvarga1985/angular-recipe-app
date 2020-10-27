import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../../shared/ingredient.model';
import {ShoppingListService} from '../../services/shopping-list.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.scss']
})
export class ShoppingEditComponent implements OnInit {
  // Comes from the template
  @ViewChild('nameInput', {static: false}) nameInputRef: ElementRef;
  @ViewChild('amountInput', {static: false}) amountInputRef: ElementRef;

  constructor(private shoppingListService: ShoppingListService) {
  }

  ngOnInit(): void {
  }

  /*
   Create a new Ingredient based on the two values of the controls of the form in the template, then call the service to add them to the
   'ingredients' array.
  */
  onAddItem(form: NgForm): void {
    const value = form.value;
    // Accessing the form controls with the control names 'name' & 'amount' set in the template.
    const newIngredient = new Ingredient(value.name, value.amount);
    this.shoppingListService.addIngredient(newIngredient);
  }

}
