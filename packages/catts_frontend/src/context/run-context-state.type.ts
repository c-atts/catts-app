import { Recipe, Run } from "catts_engine/declarations/catts_engine.did";

export type RunContextStateType = {
  selectedRecipe?: Recipe;
  isSimulationOk?: boolean;
  runInProgress?: Run;
  progressMessage?: string;
  errorMessage?: string;
  isPaymentTransactionConfirmed?: boolean;
};
