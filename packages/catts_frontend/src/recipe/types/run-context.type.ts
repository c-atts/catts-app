import { RecipeFull } from "./recipe.types";
import { RecipeContextStateType } from "./run-context-state.type";

export type RecipeContextType = RecipeContextStateType & {
  setRecipe: (recipe: RecipeFull) => void;
};
