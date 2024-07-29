import { Recipe, Run } from "catts_engine/declarations/catts_engine.did";

export type RunContextStateType = {
  selectedRecipe?: Recipe;
  runInProgress?: Run;
  errorMessage?: string;
  inProgress: boolean;
};
