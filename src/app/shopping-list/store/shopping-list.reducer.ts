import {Ingredient} from '../../shared/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient;
  editedIngredientIndex: number;
}

const initialState: State = {
  ingredients: [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 10)
  ],
  editedIngredient: null,
  editedIngredientIndex: -1
};

/*
 A. An ngrx Reducer is only a function. It requires the 'State' of the application and an 'Action' as parameters.
 B. Setting default value for the 'state' parameter in the signature.
 C. State parameter gets overwritten while the Application is running.
*/
export function shoppingListReducer(state: State = initialState,
                                    action: ShoppingListActions.ShoppingListActions): State {
  switch (action.type) {
    case ShoppingListActions.ADD_INGREDIENT:
      return {
        // States should be immutable - copy the previous state with the spread(...) operator into a new object.
        ...state,
        ingredients: [...state.ingredients, action.payload]
      };
    case ShoppingListActions.ADD_INGREDIENTS:
      return {
        ...state,
        ingredients: [...state.ingredients, ...action.payload]
      };
    case ShoppingListActions.UPDATE_INGREDIENT:
      const ingredient = state.ingredients[state.editedIngredientIndex];
      const updatedIngredient = {
        // It is considered good practice to keep the original data - in cases where the update is partial.
        // With the spread operator, the original object and the modified one are "merged into" a new 'Ingredient'.
        ...ingredient,
        ...action.payload
      };
      const updatedIngredients = [...state.ingredients];
      updatedIngredients[state.editedIngredientIndex] = updatedIngredient;

      return {
        ...state,
        ingredients: updatedIngredients,
        // After the update, the 'AppState' is no longer in "Edit-mode".
        editedIngredientIndex: -1,
        editedIngredient: null
      };
    case ShoppingListActions.DELETE_INGREDIENT:
      return {
        ...state,
        // Filter returns all the Ingredients except the one that is to be deleted.
        ingredients: state.ingredients.filter((ig, igIndex) => {
          return igIndex !== state.editedIngredientIndex;
        }),
        editedIngredientIndex: -1,
        editedIngredient: null
      };
    case ShoppingListActions.START_EDIT:
      return {
        ...state,
        editedIngredient: {...state.ingredients[action.payload]},
        editedIngredientIndex: action.payload
      };
    case ShoppingListActions.STOP_EDIT:
      return {
        ...state,
        editedIngredient: null,
        editedIngredientIndex: -1
      };
    default:
      return state;
  }
}
