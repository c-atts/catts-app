import Button from "../../../components/ui/Button";
import { ETH_PAYMENT_CONTRACT_ADDRESS } from "../../../config";
import { Run } from "../../../../../declarations/backend/backend.did";
import abi from "../../../components/abi.json";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { toHex } from "viem/utils";
import useRunContext from "../../../ run-context/useRunContext";

export default function PayRunButton({ run }: { run: Run }) {
  const { useWriteContract, useWaitForTransactionReceipt } = useRunContext();
  const {
    writeContract,
    isPending: isPaymentPending,
    error,
  } = useWriteContract;

  const { isFetching: isConfirmationFetching } = useWaitForTransactionReceipt;

  if (!("Created" in run.status)) {
    return null;
  }

  error && console.error("error", error);

  const isPending = isPaymentPending || isConfirmationFetching;

  const buttonText = () => {
    if (isPaymentPending) {
      return "Paying...";
    }
    if (isConfirmationFetching) {
      return "Waiting for 3 confirmations...";
    }
    return "Pay and create attestation";
  };

  const payRun = async () => {
    writeContract({
      abi,
      address: ETH_PAYMENT_CONTRACT_ADDRESS,
      functionName: "payRun",
      args: [toHex(run.id as Uint8Array)],
      value: run.cost,
    });
  };

  return (
    <Button
      disabled={isPending}
      icon={isPending ? faCircleNotch : undefined}
      onClick={() => {
        payRun();
      }}
      spin={isPending}
    >
      {buttonText()}
    </Button>
  );
}
