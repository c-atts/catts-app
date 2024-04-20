import { Recipe, Run } from "../../../declarations/backend/backend.did";

export type RunContextStateType = {
  selectedRecipe?: Recipe;
  isSimulationOk?: boolean;
  runInProgress?: Run;
  progressMessage?: string;
  errorMessage?: string;
  isPaymentTransactionConfirmed?: boolean;
};
