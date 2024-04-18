import { Recipe } from "../../../declarations/backend/backend.did";

export type RunContextStateType = {
  selectedRecipe?: Recipe;
  isSelectedRecipeValid?: boolean;
};
