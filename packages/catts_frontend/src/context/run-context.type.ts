import { Config, UseWriteContractReturnType } from "wagmi";
import {
  Recipe,
  Result,
  Result_1,
  Run,
} from "catts_engine/declarations/catts_engine.did";

import { UseMutationResult } from "@tanstack/react-query";

export type RunContextType = {
  selectedRecipe?: Recipe;
  setSelectedRecipe: (recipe?: Recipe) => void;
  isSimulationOk?: boolean;
  setIsSimulationOk: (isValid: boolean) => void;
  runInProgress?: Run;
  progressMessage?: string;
  errorMessage?: string;
  isPaymentTransactionConfirmed?: boolean;
  useInitRun: UseMutationResult<Result | null, Error, string, unknown>;
  useStartRun: UseMutationResult<
    Result_1 | null,
    Error,
    Uint8Array | number[],
    unknown
  >;
  usePayForRun: UseWriteContractReturnType<Config, unknown>;
  useCancelRun: UseMutationResult<
    Result | null,
    Error,
    Uint8Array | number[],
    unknown
  >;
  initPayAndCreateAttestation: () => Promise<void>;
  payAndCreateAttestation: (run: Run) => Promise<void>;
  createAttestation: (run: Run) => Promise<void>;
  resetRun: () => void;
};
