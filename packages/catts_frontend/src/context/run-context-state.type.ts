import { Recipe, Run } from "catts_engine/declarations/catts_engine.did";

export type RunContextStateType = {
  selectedRecipe?: Recipe;
  runInProgress?: Run;
  progressMessage?: string;
  errorMessage?: string;
  isPaymentTransactionConfirmed?: boolean;
};
