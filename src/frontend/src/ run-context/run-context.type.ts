import {
  Config,
  UseWaitForTransactionReceiptReturnType,
  UseWriteContractReturnType,
} from "wagmi";
import {
  Recipe,
  Result,
  Result_5,
} from "../../../declarations/backend/backend.did";

import { UseMutationResult } from "@tanstack/react-query";

export type RunContextType = {
  selectedRecipe?: Recipe;
  setSelectedRecipe: (recipe?: Recipe) => void;
  isSelectedRecipeValid?: boolean;
  setIsSelectedRecipeValid: (isValid: boolean) => void;
  useInitRun: UseMutationResult<Result | null, Error, string, unknown>;
  useStartRun: UseMutationResult<
    Result_5 | null,
    Error,
    Uint8Array | number[],
    unknown
  >;
  useWriteContract: UseWriteContractReturnType<Config, unknown>;
  useWaitForTransactionReceipt: UseWaitForTransactionReceiptReturnType;
};
