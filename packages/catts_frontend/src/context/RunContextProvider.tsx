import { ReactNode, createContext, useState } from "react";

import CattsPaymentsAbi from "catts_payments/catts_payments.abi.json";
import { ETH_PAYMENT_CONTRACT_ADDRESS } from "../config";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunContextStateType } from "./run-context-state.type";
import { RunContextType } from "./run-context.type";
import { TransactionExecutionError } from "viem";
import { isError } from "remeda";
import { sepolia } from "viem/chains";
import { toHex } from "viem/utils";
import { useCancelRun } from "../catts/hooks/useCancelRun";
import { useGetAttestationUid } from "../catts/hooks/useGetAttestationUid";
import { useInitRun } from "../catts/hooks/useInitRun";
import { useStartRun } from "../catts/hooks/useStartRun";
import { useWriteContract } from "wagmi";
import { wagmiConfig } from "../wagmi/wagmi.config";
import { wait } from "../utils/wait";
import { waitForTransactionReceipt } from "@wagmi/core";

export const RunContext = createContext<RunContextType | undefined>(undefined);

const GET_UID_RETRY_LIMIT = 4;
const GET_UID_RETRY_INTERVAL = 10000;

export function RunContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RunContextStateType>({});

  const _useInitRun = useInitRun();
  const _usePayForRun = useWriteContract();
  const _useCancelRun = useCancelRun();
  const _useStartRun = useStartRun();
  const _useGetAttestationUid = useGetAttestationUid();

  async function initPayAndCreateAttestation() {
    if (!state.selectedRecipe) {
      console.error("No selected recipe.");
      return;
    }

    setState((s) => {
      return {
        ...s,
        progressMessage: "Initializing...",
        errorMessage: undefined,
      };
    });

    try {
      const res = await _useInitRun.mutateAsync(state.selectedRecipe.id);
      if (res) {
        if ("Ok" in res) {
          await payAndCreateAttestation(res.Ok);
        } else {
          console.error(res.Err);
          throw new Error(res.Err.message); 
        }
      }
    } catch (e) {
      console.error(e);
      const errorMessage = isError(e) ? e.message : "Error initializing run." ;
      setState((s) => {
        return {
          ...s,
          errorMessage,
          progressMessage: undefined,
        };
      });
    }
  }

  async function payAndCreateAttestation(run: Run) {
    if (!run) {
      console.error("No run to pay for.");
      return;
    }

    setState((s) => {
      return {
        ...s,
        runInProgress: run,
        progressMessage: "Paying...",
        isPaymentTransactionConfirmed: false,
        errorMessage: undefined,
      };
    });

    try {
      const transactionHash = await _usePayForRun.writeContractAsync({
        abi: CattsPaymentsAbi,
        address: ETH_PAYMENT_CONTRACT_ADDRESS,
        functionName: "payRun",
        args: [toHex(run.id as Uint8Array)],
        value: run.cost,
      });

      if (!transactionHash) {
        throw new Error("No transaction hash returned from wallet.");
      }

      run.payment_transaction_hash = [transactionHash as string];
      setState((s) => {
        return {
          ...s,
          runInProgress: {
            ...run,
          },
          progressMessage: "Waiting for 3 confirmations...",
        };
      });
    } catch (e) {
      console.error(e);
      const err = e as TransactionExecutionError;
      setState((s) => {
        return {
          ...s,
          errorMessage: err.shortMessage,
          progressMessage: undefined,
        };
      });
      return;
    }

    try {
      const res = await waitForTransactionReceipt(wagmiConfig, {
        hash: run.payment_transaction_hash[0] as `0x${string}`,
        chainId: sepolia.id,
      });

      if (res) {
        if (res.transactionHash !== run.payment_transaction_hash[0]) {
          throw new Error("Transaction hash mismatch.");
        }
      } else {
        throw new Error("No transaction receipt returned.");
      }

      setState((s) => {
        return {
          ...s,
          isPaymentTransactionConfirmed: true,
        };
      });
    } catch (e) {
      console.error(e);
      const errorMessage = isError(e)
        ? e.message
        : "Error waiting for transaction receipt.";
      setState((s) => {
        return {
          ...s,
          errorMessage,
          progressMessage: undefined,
        };
      });
    }

    await createAttestation(run);
  }

  async function createAttestation(run: Run) {
    if (!run) {
      console.error("No run to create attestation for.");
      return;
    }

    setState((s) => {
      return {
        ...s,
        runInProgress: run,
        progressMessage: "Creating attestation...",
        errorMessage: undefined,
      };
    });

    try {
      const res = await _useStartRun.mutateAsync(run.id);
      if (res) {
        if ("Ok" in res) {
          run.attestation_transaction_hash = [res.Ok];
          setState((s) => {
            return {
              ...s,
              runInProgress: {
                ...run,
              },
              progressMessage: "Attestation created, getting UID...",
            };
          });
        } else {
          console.error(res.Err);
          throw new Error(res.Err.message);
        }
      }
    } catch (e) {
      console.error(e);
      const errorMessage = isError(e) ? e.message : "Error starting run.";
      setState((s) => {
        return {
          ...s,
          runInProgress: undefined,
          errorMessage,
          progressMessage: undefined,
        };
      });
      return;
    }

    for (let i = 0; i < GET_UID_RETRY_LIMIT; i++) {
      await wait(GET_UID_RETRY_INTERVAL);

      try {
        const res = await _useGetAttestationUid.mutateAsync(run.id);
        if (res) {
          if ("Ok" in res) {
            run.attestation_uid = [res.Ok];
            setState((s) => {
              return {
                ...s,
                runInProgress: {
                  ...run,
                },
              };
            });
            break;
          } else {
            console.error(res.Err);
            throw new Error(res.Err.message);
          }
        }
      } catch (e) {
        console.error(e);
        const errorMessage = isError(e)
          ? e.message
          : "Error getting attestation uid.";
        setState((s) => {
          return {
            ...s,
            errorMessage,
            progressMessage: undefined,
          };
        });
        return;
      }
    }
  }

  const resetRun = () => {
    _useInitRun.reset();
    setState((s) => {
      return {
        ...s,
        isSimulationOk: undefined,
        runInProgress: undefined,
        progressMessage: undefined,
        errorMessage: undefined,
        isPaymentTransactionConfirmed: undefined,
      };
    });
  };

  return (
    <RunContext.Provider
      value={{
        selectedRecipe: state?.selectedRecipe,
        setSelectedRecipe: (recipe) =>
          setState((s) => {
            return { ...s, selectedRecipe: recipe };
          }),
        isSimulationOk: state?.isSimulationOk,
        setIsSimulationOk: (ok) =>
          setState((s) => {
            return { ...s, isSimulationOk: ok };
          }),
        runInProgress: state?.runInProgress,
        progressMessage: state?.progressMessage,
        errorMessage: state?.errorMessage,
        isPaymentTransactionConfirmed: state?.isPaymentTransactionConfirmed,
        useInitRun: _useInitRun,
        usePayForRun: _usePayForRun,
        useStartRun: _useStartRun,
        useCancelRun: _useCancelRun,
        initPayAndCreateAttestation,
        payAndCreateAttestation,
        createAttestation,
        resetRun,
      }}
    >
      {children}
    </RunContext.Provider> 
  );
}
