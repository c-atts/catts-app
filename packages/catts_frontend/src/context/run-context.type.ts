import { Config, UseWriteContractReturnType } from "wagmi";
import {
  Recipe,
  Result_3,
  Run,
} from "catts_engine/declarations/catts_engine.did";

import { UseMutationResult } from "@tanstack/react-query";

export type RunContextType = {
  selectedRecipe?: Recipe;
  setSelectedRecipe: (recipe?: Recipe) => void;
  runInProgress?: Run;
  progressMessage?: string;
  errorMessage?: string;
  useCreateRun: UseMutationResult<
    Result_3 | null,
    Error,
    {
      recipeId: Uint8Array | number[];
      chainId: number | undefined;
    },
    unknown
  >;
  useRegisterRunPayment: UseMutationResult<
    Result_3 | null,
    Error,
    {
      run: Run;
      block: bigint;
    },
    unknown
  >;
  usePayForRun: UseWriteContractReturnType<Config, unknown>;
  useCancelRun: UseMutationResult<
    Result_3 | null,
    Error,
    Uint8Array | number[],
    unknown
  >;
  initPayAndCreateAttestation: () => Promise<void>;
  payAndCreateAttestation: (run: Run) => Promise<void>;
  createAttestation: (run: Run, block: bigint) => Promise<void>;
  resetRun: () => void;
};
