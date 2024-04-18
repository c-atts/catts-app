import Button from "../../../components/ui/Button";
import { ETH_PAYMENT_CONTRACT_ADDRESS } from "../../../config";
import { Run } from "../../../../../declarations/backend/backend.did";
import abi from "../../../components/abi.json";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { toHex } from "viem/utils";
import { useWriteContract } from "wagmi";

export default function PayRunButton({ run }: { run: Run }) {
  const { writeContract, isPending, error } = useWriteContract();

  if (!("Created" in run.status)) {
    return null;
  }

  error && console.error("error", error);

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
      Pay
    </Button>
  );
}
