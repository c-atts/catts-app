import { RecipeFull } from "@/recipe/types/recipe.types";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { runStateStore } from "@/run/RunStateStore";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "catts_engine/declarations/catts_engine.did";
import { hexToBytes, toHex, TransactionExecutionError } from "viem";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { AllowedChainIds, CHAIN_CONFIG, wagmiConfig } from "@/config";
import CattsPaymentsAbi from "catts_payments/catts_payments.abi.json";
import { getRunStatus } from "../getRunStatus";
import { RunStatus } from "../types/run-status.type";
import { handleError } from "./util/handleError";
import { wait } from "@/lib/util/wait";

const GET_UID_RETRY_LIMIT = 30;
const GET_UID_RETRY_INTERVAL = 5_000;

async function createRun(
  recipeId: Uint8Array,
  chainId: number,
  actor: ActorSubclass<_SERVICE>,
) {
  try {
    const res = await actor.run_create(recipeId, chainId);
    if (res && "Ok" in res) {
      return res.Ok;
    }
    handleError(res.Err, "createRunStatus", "Error creating run");
  } catch (e) {
    handleError(e, "createRunStatus", "Error creating run");
  }
  return undefined;
}

async function payRun(run: Run, chainId: number) {
  try {
    const transactionHash = await writeContract(wagmiConfig, {
      abi: CattsPaymentsAbi,
      address: CHAIN_CONFIG[chainId].paymentContractAddress as `0x${string}`,
      functionName: "payRun",
      args: [toHex(run.id as Uint8Array)],
      value: run.user_fee[0],
    });
    if (!transactionHash) {
      handleError(
        undefined,
        "payStatus",
        "No transaction hash returned from wallet.",
      );
      return;
    }
    run.payment_transaction_hash = [transactionHash as string];
    runStateStore.send({
      type: "setRunInProgress",
      run,
    });
  } catch (e) {
    const err = e as TransactionExecutionError;
    handleError(err, "payStatus", err.shortMessage);
    return;
  }

  try {
    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: run.payment_transaction_hash[0] as `0x${string}`,
      chainId: chainId as AllowedChainIds,
    });

    if (receipt) {
      if (receipt.transactionHash !== run.payment_transaction_hash[0]) {
        handleError(undefined, "payStatus", "Transaction hash mismatch.");
        return;
      }
      return receipt;
    } else {
      handleError(undefined, "payStatus", "No transaction receipt returned.");
    }
  } catch (e) {
    handleError(e, "payStatus", "Error waiting for transaction receipt.");
  }
}

async function createAttestation(
  run: Run,
  block: bigint,
  actor: ActorSubclass<_SERVICE>,
) {
  try {
    const transactionHash = run.payment_transaction_hash[0];
    if (!transactionHash) {
      handleError(
        "No transaction hash found for payment.",
        "createAttestationStatus",
        "Error registering payment",
      );
      return false;
    }

    const res = await actor.run_register_payment(
      run.id,
      transactionHash,
      block,
    );
    if (res) {
      if ("Ok" in res) {
        if (res.Ok.error.length > 0) {
          handleError(
            res.Ok.error[0],
            "createAttestationStatus",
            "Error registering payment",
          );
          return false;
        }
      } else {
        handleError(
          res.Err,
          "createAttestationStatus",
          "Error registering payment",
        );
        return false;
      }
    }
  } catch (e) {
    handleError(e, "createAttestationStatus", "Error registering payment");
    return false;
  }

  for (let i = 0; i < GET_UID_RETRY_LIMIT; i++) {
    await wait(GET_UID_RETRY_INTERVAL);

    try {
      const res = await actor.run_get(run.id);
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
            handleError(res.Ok.error, "createAttestationStatus", errorMessage);
            runStateStore.send({
              type: "setRunInProgress",
              run: res.Ok,
            });
            return false;
          } else {
            const runStatus = getRunStatus(res.Ok);
            if (runStatus === RunStatus.AttestationCreated) {
              runStateStore.send({
                type: "setRunInProgress",
                run: res.Ok,
              });
            }
            if (runStatus === RunStatus.AttestationUidConfirmed) {
              runStateStore.send({
                type: "setRunInProgress",
                run: res.Ok,
              });
              return true;
            }
          }
        } else if ("Err" in res) {
          handleError(
            res.Err,
            "createAttestationStatus",
            "Error creating attestation.",
          );
          return false;
        }
      }
    } catch (e) {
      handleError(e, "createAttestationStatus", "Error creating attestation.");
      return false;
    }
  }
  return false;
}

export async function startCreateRunFlow({
  recipe,
  actor,
  chainId,
}: {
  recipe: RecipeFull;
  actor: ActorSubclass<_SERVICE>;
  chainId: number;
}) {
  runStateStore.send({
    type: "transition",
    step: "createRunStatus",
    status: "pending",
  });

  // Only proceed if the simulation was successful
  let snapshot = runStateStore.getSnapshot();
  if (snapshot.context.simulateValidateStatus !== "success") {
    return false;
  }

  const run = await createRun(
    hexToBytes(recipe.id as `0x{string}`),
    chainId,
    actor,
  );

  if (!run) {
    return false;
  }

  runStateStore.send({
    type: "setRunInProgress",
    run,
  });

  runStateStore.send({
    type: "transitionMany",
    steps: [
      { step: "createRunStatus", status: "success" },
      { step: "payStatus", status: "pending" },
    ],
  });

  // Only proceed if the simulation was successful
  snapshot = runStateStore.getSnapshot();
  if (snapshot.context.simulateValidateStatus !== "success") {
    return false;
  }

  const receipt = await payRun(run, chainId);

  if (!receipt) {
    return false;
  }

  runStateStore.send({
    type: "transitionMany",
    steps: [
      { step: "payStatus", status: "success" },
      { step: "createAttestationStatus", status: "pending" },
    ],
  });

  const attestationCreated = await createAttestation(
    run,
    receipt.blockNumber,
    actor,
  );

  if (attestationCreated) {
    runStateStore.send({
      type: "transition",
      step: "createAttestationStatus",
      status: "success",
    });
  }

  return true;
}
