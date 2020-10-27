import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../../shared/ingredient.model';
import {ShoppingListService} from '../../services/shopping-list.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.scss']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  // Access the form with ViewChild - the form is a child element on the template
  @ViewChild('f') shoppingListForm: NgForm;

  subscription: Subscription;
  editMode = false;
  editedItemIndex: number;
  editedItem: Ingredient;

  constructor(private shoppingListService: ShoppingListService) {
  }

  /*
      A. Subscribe to the 'startedEditing' Subject in the 'shoppingListService', that is ""emitting"" the index of the Ingredient-to-edit.
      B. Get the Ingredient-to-edit by it's index.
  */
  ngOnInit(): void {
    this.subscription = this.shoppingListService.startedEditing
      .subscribe(
        (index: number) => {
          this.editedItemIndex = index;
          this.editMode = true;
          this.editedItem = this.shoppingListService.getIngredient(index);
          // Set values on the form with property-values on the recently acquired Ingredient-to-edit
          this.shoppingListForm.setValue({
            name: this.editedItem.name,
            amount: this.editedItem.amount
          });
        }
      );
  }

  /*
   Create a new Ingredient based on the two values of the controls of the form in the template, then call the service to add them to the
   'ingredients' array.
  */
  onSubmit(form: NgForm): void {
    const value = form.value;
    // Accessing the form controls with the control names 'name' & 'amount' set in the template.
    const newIngredient = new Ingredient(value.name, value.amount);
    // Update- or create new Ingredient
    if (this.editMode) {
      this.shoppingListService.updateIngredient(this.editedItemIndex, newIngredient);
    } else {
      this.shoppingListService.addIngredient(newIngredient);
    }

    // Reset the form so that it's ready for a new user-action
    this.editMode = false;
    form.reset();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
