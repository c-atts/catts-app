import { ReactNode, createContext, useState } from "react";

import CattsPaymentsAbi from "catts_payments/catts_payments.abi.json";
import { CHAIN_CONFIG, wagmiConfig } from "../config";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunContextStateType } from "./run-context-state.type";
import { RunContextType } from "./run-context.type";
import { TransactionExecutionError } from "viem";
import { catts_engine } from "catts_engine/declarations";
import { isError } from "remeda";
import { toHex } from "viem/utils";
import { useCancelRun } from "../catts/hooks/useCancelRun";
import { useCreateRun } from "../catts/hooks/useCreateRun";
import { useRegisterRunPayment } from "../catts/hooks/useRegisterRunPayment";
import { useAccount, useWriteContract } from "wagmi";
import { wait } from "../utils/wait";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getRunStatus } from "@/catts/getRunStatus";
import { RunStatus } from "@/catts/types/run-status.type";

export const RunContext = createContext<RunContextType | undefined>(undefined);

const GET_UID_RETRY_LIMIT = 30;
const GET_UID_RETRY_INTERVAL = 5_000;

export function RunContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RunContextStateType>({
    inProgress: false,
  });
  const { chainId } = useAccount();

  const _useCreateRun = useCreateRun();
  const _usePayForRun = useWriteContract();
  const _useCancelRun = useCancelRun();
  const _useRegisterRunPayment = useRegisterRunPayment();

  async function initPayAndCreateAttestation(recipeId: Uint8Array) {
    setState((s) => {
      return {
        ...s,
        inProgress: true,
        errorMessage: undefined,
      };
    });

    try {
      const res = await _useCreateRun.mutateAsync({
        recipeId,
        chainId,
      });
      if (res) {
        if ("Ok" in res) {
          if (res.Ok.error.length > 0) {
            setState((s) => {
              return {
                ...s,
                errorMessage: "Error initialising run.",
              };
            });
            throw new Error(res.Ok.error[0]);
          }
          await payAndCreateAttestation(res.Ok);
        } else {
          throw new Error(res.Err.message);
        }
      }
    } catch (e) {
      console.error(e);
      setState((s) => {
        return {
          ...s,
          errorMessage:
            s.errorMessage ||
            (isError(e) ? e.message : "Error initializing run."),
        };
      });
    }
  }

  async function payAndCreateAttestation(run: Run) {
    if (!run) {
      console.error("No run to pay for.");
      return;
    }

    if (!chainId) {
      console.error("No chain connected.");
      return;
    }

    setState((s) => {
      return {
        ...s,
        runInProgress: run,
      };
    });

    try {
      const transactionHash = await _usePayForRun.writeContractAsync({
        abi: CattsPaymentsAbi,
        address: CHAIN_CONFIG[chainId].paymentContractAddress as `0x${string}`,
        functionName: "payRun",
        args: [toHex(run.id as Uint8Array)],
        value: run.user_fee[0],
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
      if (chainId != 1 && chainId != 10 && chainId != 11155111) {
        console.error("No chain connected.");
        return;
      }

      const res = await waitForTransactionReceipt(wagmiConfig, {
        hash: run.payment_transaction_hash[0] as `0x${string}`,
        chainId,
      });

      if (res) {
        if (res.transactionHash !== run.payment_transaction_hash[0]) {
          throw new Error("Transaction hash mismatch.");
        }
      } else {
        throw new Error("No transaction receipt returned.");
      }

      await createAttestation(run, res.blockNumber);
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
  }

  async function createAttestation(run: Run, block: bigint) {
    if (!run) {
      console.error("No run to create attestation for.");
      return;
    }

    setState((s) => {
      return {
        ...s,
        runInProgress: run,
      };
    });

    try {
      const res = await _useRegisterRunPayment.mutateAsync({ run, block });
      if (res) {
        if ("Ok" in res) {
          if (res.Ok.error.length > 0) {
            setState((s) => {
              return {
                ...s,
                errorMessage: "Error registering payment.",
              };
            });
            throw new Error(res.Ok.error[0]);
          }
        } else {
          throw new Error(res.Err.message);
        }
      }
    } catch (e) {
      console.error(e);
      setState((s) => {
        return {
          ...s,
          errorMessage:
            s.errorMessage ||
            (isError(e) ? e.message : "Error registering payment."),
        };
      });
      return;
    }

    for (let i = 0; i < GET_UID_RETRY_LIMIT; i++) {
      await wait(GET_UID_RETRY_INTERVAL);

      try {
        const res = await catts_engine.run_get(run.id);
        if (res) {
          if ("Ok" in res) {
            if (res.Ok.error.length > 0) {
              let errorMessage = "";
              switch (getRunStatus(res.Ok)) {
                case RunStatus.PaymentRegistered:
                  errorMessage = "Couldn't register payment.";
                  break;
                case RunStatus.PaymentVerified:
                  errorMessage = "Couldn't create attestation.";
                  break;
                default:
                  errorMessage = "Couldn't get attestation UID.";
              }
              setState((s) => {
                return {
                  ...s,
                  runInProgress: res.Ok,
                  errorMessage,
                };
              });
              throw new Error(res.Ok.error[0]);
            } else {
              setState((s) => {
                return {
                  ...s,
                  runInProgress: res.Ok,
                };
              });
              if (getRunStatus(res.Ok) === RunStatus.AttestationUidConfirmed) {
                break;
              }
            }
          } else if ("Err" in res) {
            throw new Error(res.Err.message);
          }
        }
      } catch (e) {
        console.error(e);
        setState((s) => {
          return {
            ...s,
            errorMessage:
              s.errorMessage ||
              (isError(e) ? e.message : "Error creating attestation."),
          };
        });
        return;
      }
    }
  }

  const resetRun = () => {
    _useCreateRun.reset();
    setState((s) => {
      return {
        ...s,
        isSimulationOk: undefined,
        runInProgress: undefined,
        progressMessage: undefined,
        errorMessage: undefined,
      };
    });
  };

  return (
    <RunContext.Provider
      value={{
        selectedRecipe: state?.selectedRecipe,
        setSelectedRecipe: (recipe) => {
          setState((s) => {
            return { ...s, selectedRecipe: recipe };
          });
          resetRun();
        },
        runInProgress: state?.runInProgress,
        errorMessage: state?.errorMessage,
        useCreateRun: _useCreateRun,
        usePayForRun: _usePayForRun,
        useRegisterRunPayment: _useRegisterRunPayment,
        useCancelRun: _useCancelRun,
        initPayAndCreateAttestation,
        payAndCreateAttestation,
        createAttestation,
        resetRun,
        inProgress: state.inProgress,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}
