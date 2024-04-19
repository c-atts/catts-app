import { Recipe, Run } from "../../../declarations/backend/backend.did";

export type RunContextStateType = {
  selectedRecipe?: Recipe;
  isSelectedRecipeValid?: boolean;
  runInProgress?: Run;
  getUidRetryCount: number;
};
