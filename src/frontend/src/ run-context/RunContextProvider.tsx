import { ReactNode, createContext, useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ETH_PAYMENT_CONTRACT_ADDRESS } from "../config";
import { Run } from "../../../declarations/backend/backend.did";
import { RunContextStateType } from "./run-context-state.type";
import { RunContextType } from "./run-context.type";
import abi from "../components/abi.json";
import { toHex } from "viem/utils";
import { useGetAttestationUid } from "../catts/hooks/useGetAttestationUid";
import { useInitRun } from "../catts/hooks/useInitRun";
import { useStartRun } from "../catts/hooks/useStartRun";

export const RunContext = createContext<RunContextType | undefined>(undefined);

const GET_UID_RETRY_LIMIT = 4;
const GET_UID_RETRY_INTERVAL = 10000;

export function RunContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RunContextStateType>({
    getUidRetryCount: 0,
  });

  const _useInitRun = useInitRun();
  const _useWriteContract = useWriteContract();
  const _useWaitForTransactionReceipt = useWaitForTransactionReceipt({
    hash: _useWriteContract.data,
    confirmations: 1,
  });
  const _useStartRun = useStartRun();
  const _useGetAttestationUid = useGetAttestationUid();

  // Reset isSelectedRecipeValid when selectedRecipe changes
  useEffect(() => {
    setState((s) => {
      return {
        ...s,
        isSelectedRecipeValid: undefined,
      };
    });
  }, [state?.selectedRecipe]);

  // A payment receipt has been received and there is a run in progress
  // Start the run
  useEffect(() => {
    if (state?.runInProgress && _useWaitForTransactionReceipt.isSuccess) {
      console.log("Starting run");
      console.log("Saving payment tx hash", _useWriteContract.data as string);
      const run = state.runInProgress;
      run.payment_transaction_hash = [_useWriteContract.data as string];
      setState((s) => {
        return {
          ...s,
          runInProgress: run,
        };
      });
      _useStartRun.mutate(state?.runInProgress?.id);
    }
  }, [
    _useWaitForTransactionReceipt.isSuccess,
    _useWriteContract.data,
    state?.runInProgress,
    _useStartRun,
  ]);

  // The run has been completed, save the attestation transaction hash
  useEffect(() => {
    if (state?.runInProgress && _useStartRun.isSuccess) {
      console.log("Run completed");
      if (_useStartRun.data && "Ok" in _useStartRun.data) {
        console.log(
          "Saving attestation tx hash",
          _useStartRun.data.Ok as string
        );
        const run = state.runInProgress;
        run.attestation_transaction_hash = [_useStartRun.data.Ok as string];
        setState((s) => {
          return {
            ...s,
            runInProgress: run,
          };
        });
        setTimeout(() => {
          console.log("Polling for attestation uid", 1);
          _useGetAttestationUid.mutate(run.id);
        }, GET_UID_RETRY_INTERVAL);
      }
    }
  }, [
    _useStartRun.isSuccess,
    _useStartRun.data,
    state?.runInProgress,
    _useGetAttestationUid,
  ]);

  useEffect(() => {
    if (
      state?.runInProgress &&
      _useGetAttestationUid.isSuccess &&
      _useGetAttestationUid.data &&
      "Err" in _useGetAttestationUid.data &&
      state.getUidRetryCount < GET_UID_RETRY_LIMIT
    ) {
      const run = state.runInProgress;
      setTimeout(() => {
        console.log("Polling for attestation uid", state.getUidRetryCount + 1);
        _useGetAttestationUid.mutate(run.id);
        setState((s) => {
          return {
            ...s,
            getUidRetryCount: s.getUidRetryCount + 1,
          };
        });
      }, GET_UID_RETRY_INTERVAL);
    }
  }, [
    _useGetAttestationUid.isSuccess,
    _useGetAttestationUid.data,
    state?.runInProgress,
    state.getUidRetryCount,
    _useGetAttestationUid,
  ]);

  const payAndCreateAttestations = async (run: Run) => {
    setState((s) => {
      return {
        ...s,
        runInProgress: run,
      };
    });

    _useWriteContract.writeContract({
      abi,
      address: ETH_PAYMENT_CONTRACT_ADDRESS,
      functionName: "payRun",
      args: [toHex(run.id as Uint8Array)],
      value: run.cost,
    });
  };

  return (
    <RunContext.Provider
      value={{
        selectedRecipe: state?.selectedRecipe,
        setSelectedRecipe: (recipe) =>
          setState({ ...state, selectedRecipe: recipe }),
        isSelectedRecipeValid: state?.isSelectedRecipeValid,
        setIsSelectedRecipeValid: (isValid) =>
          setState({ ...state, isSelectedRecipeValid: isValid }),
        runInProgress: state?.runInProgress,
        useInitRun: _useInitRun,
        useStartRun: _useStartRun,
        useWriteContract: _useWriteContract,
        useWaitForTransactionReceipt: _useWaitForTransactionReceipt,
        useGetAttestationUid: _useGetAttestationUid,
        payAndCreateAttestations,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}
