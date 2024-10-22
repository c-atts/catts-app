import { AllowedChainIds, CHAIN_CONFIG, wagmiConfig } from "@/config";
import { TransactionExecutionError, hexToBytes, toHex } from "viem";
import { ActorSubclass } from "@dfinity/agent";
import CattsPaymentsAbi from "catts_payments/catts_payments.abi.json";
import { RecipeFull } from "@/recipe/types/recipe.types";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { RunStatus } from "../types/run-status.type";
import { Signer } from "ethers";
import { _SERVICE } from "catts_engine/declarations/catts_engine.did";
import { estimateGas } from "@/lib/eas/estimateGas";
import { getFeeData } from "@/lib/alchemy/getFeeData";
import { getRunStatus } from "../getRunStatus";
import { getSchemaUID } from "@ethereum-attestation-service/eas-sdk";
import { handleError } from "./util/handleError";
import { runStateStore } from "@/run/RunStateStore";
import { wait } from "@/lib/util/wait";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";

const GET_UID_RETRY_LIMIT = 30;
const GET_UID_RETRY_INTERVAL = 5_000;

async function estimateTransactionFees(chainId: number) {
  try {
    return await getFeeData({ chainId });
  } catch (e) {
    handleError(e, "createRunStatus", "Error getting transaction fees");
  }
}
async function createRun({
  recipeId,
  chainId,
  baseFeePerGas,
  maxPriorityFeePerGas,
  gas,
  actor,
}: {
  recipeId: Uint8Array;
  chainId: number;
  baseFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gas: bigint;
  actor: ActorSubclass<_SERVICE>;
}) {
  try {
    const res = await actor.run_create(
      recipeId,
      chainId,
      baseFeePerGas,
      maxPriorityFeePerGas,
      gas,
    );
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
      run.payment_block_number = [receipt.blockNumber];
      run.payment_log_index = [BigInt(receipt.transactionIndex)];
      runStateStore.send({
        type: "setRunInProgress",
        run,
      });

      receipt.transactionIndex;
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
  creator,
  actor,
  chainId,
  signer,
}: {
  recipe: RecipeFull;
  creator: string;
  actor: ActorSubclass<_SERVICE>;
  chainId: number;
  signer: Signer;
}) {
  if (!signer.provider) {
    runStateStore.send({
      type: "transition",
      step: "createRunStatus",
      status: "error",
    });
    runStateStore.send({
      type: "setError",
      step: "createRunStatus",
      message: "Couldn't create run. No provider found.",
    });
    return false;
  }

  runStateStore.send({
    type: "transition",
    step: "createRunStatus",
    status: "pending",
  });

  // Only proceed if the simulation was successful
  const snapshot = runStateStore.getSnapshot();
  if (
    snapshot.context.simulateValidateStatus !== "success" ||
    !snapshot.context.attestationData
  ) {
    runStateStore.send({
      type: "setError",
      step: "createRunStatus",
      message: "Couldn't create run. Simulation failed.",
    });
    return false;
  }

  const feeData = await estimateTransactionFees(chainId);

  if (!feeData || !feeData.lastBaseFeePerGas) {
    runStateStore.send({
      type: "setError",
      step: "createRunStatus",
      message: "Couldn't create run. Error fetching fee data.",
    });
    return false;
  }

  const { provider } = signer;
  const { schema, resolver } = recipe;
  const schemaUid = getSchemaUID(schema, resolver, false);
  const { attestationData } = snapshot.context;

  const gas = await estimateGas({
    chainId,
    provider,
    schema,
    schemaUid,
    attestationData,
    recipient: creator,
  });

  const recipeId = hexToBytes(recipe.id as `0x{string}`);
  const baseFeePerGas = BigInt(feeData.lastBaseFeePerGas.toString());

  // Max priority fee is 10% of the base fee
  const maxPriorityFeePerGas = (baseFeePerGas * BigInt(10)) / BigInt(100);

  const run = await createRun({
    recipeId,
    chainId,
    baseFeePerGas,
    maxPriorityFeePerGas,
    gas,
    actor,
  });

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
