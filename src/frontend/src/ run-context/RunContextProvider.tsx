import { ReactNode, createContext, useEffect, useRef, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ETH_PAYMENT_CONTRACT_ADDRESS } from "../config";
import { Run } from "../../../declarations/backend/backend.did";
import { RunContextStateType } from "./run-context-state.type";
import { RunContextType } from "./run-context.type";
import abi from "../components/abi.json";
import { toHex } from "viem/utils";
import { useCancelRun } from "../catts/hooks/useCancelRun";
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

  // STEP 0: Run initialized
  // STEP 1: Payment receipt received
  // STEP 2: Run started, attestation transaction hash received
  // STEP 3: Attestation uid received
  const runInProgressStep = useRef(0);

  const _useInitRun = useInitRun();
  const _useCancelRun = useCancelRun();
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
    if (
      runInProgressStep.current === 1 &&
      _useWaitForTransactionReceipt.isSuccess &&
      state?.runInProgress &&
      !state.runInProgress.payment_transaction_hash[0]?.length
    ) {
      const run = state.runInProgress;
      run.payment_transaction_hash = [_useWriteContract.data as string];
      setState((s) => {
        return {
          ...s,
          runInProgress: run,
        };
      });
      _useStartRun.mutate(run.id);
      runInProgressStep.current = 2;
    }
  }, [
    _useWaitForTransactionReceipt.isSuccess,
    _useWriteContract.data,
    _useStartRun,
    state?.runInProgress,
  ]);

  // The run has been completed, save the attestation transaction hash
  useEffect(() => {
    if (
      runInProgressStep.current === 2 &&
      _useStartRun.isSuccess &&
      state?.runInProgress &&
      !state.runInProgress.attestation_transaction_hash[0]?.length
    ) {
      if (_useStartRun.data && "Ok" in _useStartRun.data) {
        const run = state.runInProgress;
        run.attestation_transaction_hash = [_useStartRun.data.Ok as string];
        setState((s) => {
          return {
            ...s,
            runInProgress: run,
          };
        });
        _useGetAttestationUid.mutate(run.id);
        runInProgressStep.current = 3;
      }
    }
    if (_useStartRun.data && "Err" in _useStartRun.data) {
      console.error("Error starting run", _useStartRun.data.Err);
    }
  }, [
    _useGetAttestationUid,
    _useStartRun.data,
    _useStartRun.isSuccess,
    state.runInProgress,
  ]);

  // Poll for attestation uid until it is received, max GET_UID_RETRY_LIMIT times
  useEffect(() => {
    if (
      runInProgressStep.current === 3 &&
      _useGetAttestationUid.isSuccess &&
      _useGetAttestationUid.data &&
      state?.runInProgress &&
      !state.runInProgress.attestation_uid[0]?.length
    ) {
      if ("Ok" in _useGetAttestationUid.data) {
        const run = state.runInProgress;
        run.attestation_uid = [_useGetAttestationUid.data.Ok];
        setState((s) => {
          return {
            ...s,
            runInProgress: run,
          };
        });
        runInProgressStep.current = 4;
      }
      if (
        "Err" in _useGetAttestationUid.data &&
        state.getUidRetryCount < GET_UID_RETRY_LIMIT
      ) {
        const run = state.runInProgress;
        setTimeout(() => {
          _useGetAttestationUid.mutate(run.id);
          setState((s) => {
            return {
              ...s,
              getUidRetryCount: s.getUidRetryCount + 1,
            };
          });
        }, GET_UID_RETRY_INTERVAL);
      }
    }
  }, [
    _useGetAttestationUid,
    _useGetAttestationUid.isSuccess,
    state.getUidRetryCount,
    state.runInProgress,
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

  const reset = () => {
    _useInitRun.reset();
    _useCancelRun.reset();
    _useWriteContract.reset();
    _useStartRun.reset();
    _useGetAttestationUid.reset();

    setState({
      ...state,
      selectedRecipe: undefined,
      getUidRetryCount: 0,
      runInProgress: undefined,
      isSelectedRecipeValid: undefined,
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
        runInProgressStep: runInProgressStep.current,
        setRunInProgressStep: (step) => (runInProgressStep.current = step),
        useInitRun: _useInitRun,
        useCancelRun: _useCancelRun,
        useStartRun: _useStartRun,
        useWriteContract: _useWriteContract,
        useWaitForTransactionReceipt: _useWaitForTransactionReceipt,
        useGetAttestationUid: _useGetAttestationUid,
        payAndCreateAttestations,
        reset,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}
