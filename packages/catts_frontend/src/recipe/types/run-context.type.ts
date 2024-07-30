import { Recipe } from "catts_engine/declarations/catts_engine.did";
import { RecipeContextStateType } from "./run-context-state.type";

export type RecipeContextType = RecipeContextStateType & {
  setRecipe: (recipe: Recipe) => void;
};
