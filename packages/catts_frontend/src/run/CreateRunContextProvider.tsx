import { CHAIN_CONFIG, wagmiConfig } from "../config";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { ReactNode, createContext, useState } from "react";
import { bytesToHex, toHex } from "viem/utils";
import { useAccount, useWriteContract } from "wagmi";

import CattsPaymentsAbi from "catts_payments/catts_payments.abi.json";
import { CreateRunContextStateType } from "./types/create-run-context-state.type";
import { CreateRunContextType } from "./types/create-run-context.type";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunStatus } from "./types/run-status.type";
import { TransactionExecutionError } from "viem";
import { catts_engine } from "catts_engine/declarations";
import { getRunStatus } from "./getRunStatus";
import { isError } from "remeda";
import { useCreateRun } from "./hooks/useCreateRun";
import { useRegisterRunPayment } from "./hooks/useRegisterRunPayment";
import { wait } from "@/lib/util/wait";
import { waitForTransactionReceipt } from "@wagmi/core";

export const CreateRunContext = createContext<CreateRunContextType | undefined>(
  undefined,
);

const GET_UID_RETRY_LIMIT = 30;
const GET_UID_RETRY_INTERVAL = 5_000;

async function invalidateAndReindex(
  queryClient: QueryClient,
  recipeId: Uint8Array,
) {
  try {
    await fetch(import.meta.env.VITE_SUPABASE_REINDEX_URL);
    queryClient.invalidateQueries({
      queryKey: ["runs_recipe_latest", bytesToHex(recipeId)],
    });
    queryClient.invalidateQueries({
      queryKey: ["runs_list"],
    });
  } catch (e) {
    console.error(e);
  }
}

export function CreateRunContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<CreateRunContextStateType>({
    inProgress: false,
    runCreated: false,
  });
  const { chainId } = useAccount();
  const queryClient = useQueryClient();

  const _useCreateRun = useCreateRun();
  const _useWriteContract = useWriteContract();
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
                inProgress: false,
                errorMessage: "Error creating run.",
              };
            });
            throw new Error(res.Ok.error[0]);
          }
          setState((s) => {
            return {
              ...s,
              runCreated: true,
            };
          });
          await payAndCreateAttestation(res.Ok);
        } else {
          throw new Error(res.Err.message);
        }
      }
    } catch (e) {
      console.error(e);
      await invalidateAndReindex(queryClient, recipeId);
      setState((s) => {
        return {
          ...s,
          inProgress: false,
          errorMessage:
            s.errorMessage || (isError(e) ? e.message : "Error creating run."),
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
        inProgress: true,
      };
    });

    try {
      const transactionHash = await _useWriteContract.writeContractAsync({
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
      await invalidateAndReindex(queryClient, run.recipe_id as Uint8Array);
      const err = e as TransactionExecutionError;
      setState((s) => {
        return {
          ...s,
          inProgress: false,
          errorMessage: err.shortMessage,
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
          inProgress: false,
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
        inProgress: true,
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
                inProgress: false,
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
      await invalidateAndReindex(queryClient, run.recipe_id as Uint8Array);
      setState((s) => {
        return {
          ...s,
          inProgress: false,
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
      }
    }

    setState((s) => {
      return {
        ...s,
        inProgress: false,
      };
    });
    await invalidateAndReindex(queryClient, run.recipe_id as Uint8Array);
  }

  const resetRun = () => {
    _useCreateRun.reset();
    setState({
      inProgress: false,
      runCreated: false,
    });
  };

  return (
    <CreateRunContext.Provider
      value={{
        ...state,
        initPayAndCreateAttestation,
        payAndCreateAttestation,
        createAttestation,
        resetRun,
      }}
    >
      {children}
    </CreateRunContext.Provider>
  );
}
