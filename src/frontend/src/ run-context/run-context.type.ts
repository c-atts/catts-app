import {
  Config,
  UseWaitForTransactionReceiptReturnType,
  UseWriteContractReturnType,
} from "wagmi";
import {
  Recipe,
  Result,
  Result_1,
  Run,
} from "../../../declarations/backend/backend.did";

import { UseMutationResult } from "@tanstack/react-query";

export type RunContextType = {
  selectedRecipe?: Recipe;
  setSelectedRecipe: (recipe?: Recipe) => void;
  isSelectedRecipeValid?: boolean;
  setIsSelectedRecipeValid: (isValid: boolean) => void;
  runInProgress?: Run;
  useInitRun: UseMutationResult<Result | null, Error, string, unknown>;
  useStartRun: UseMutationResult<
    Result_1 | null,
    Error,
    Uint8Array | number[],
    unknown
  >;
  useWriteContract: UseWriteContractReturnType<Config, unknown>;
  useWaitForTransactionReceipt: UseWaitForTransactionReceiptReturnType;
  useGetAttestationUid: UseMutationResult<
    Result_1 | null,
    Error,
    Uint8Array | number[],
    unknown
  >;
  payAndCreateAttestations: (run: Run) => Promise<void>;
};
