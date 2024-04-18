import { useCallback, useEffect } from "react";

import Button from "../../../components/ui/Button";
import { ETH_PAYMENT_CONTRACT_ADDRESS } from "../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import abi from "../../../components/abi.json";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { formatEther, toHex } from "viem/utils";
import useRunContext from "../../../ run-context/useRunContext";

export function PayForRunInner() {
  const {
    useInitRun,
    useWriteContract,
    useWaitForTransactionReceipt,
    selectedRecipe,
  } = useRunContext();
  const { data: initRunData } = useInitRun;

  const {
    writeContract,
    isPending: isPayPending,
    error: payError,
    data: transactionHash,
  } = useWriteContract;

  const { isPending: isConfirmationPending } = useWaitForTransactionReceipt;

  const payRun = useCallback(
    async (id: Uint8Array | number[], cost: bigint) => {
      writeContract({
        abi,
        address: ETH_PAYMENT_CONTRACT_ADDRESS,
        functionName: "payRun",
        args: [toHex(id as Uint8Array)],
        value: cost,
      });
    },
    [writeContract]
  );

  useEffect(() => {
    if (
      initRunData &&
      "Ok" in initRunData &&
      initRunData.Ok.recipe_id === selectedRecipe?.name
    ) {
      const run = initRunData.Ok;
      // payRun(run.id, run.cost);
    }
  }, [initRunData, payRun, selectedRecipe]);

  if (initRunData && "Ok" in initRunData) {
    if (payError) {
      console.error("Error paying for run", payError);
      let errorMessage = "Error paying for run.";
      if ("shortMessage" in payError) {
        errorMessage = payError.shortMessage;
      }
      return (
        <div className="flex items-center justify-between w-full">
          {payError && <p>🔴 {errorMessage}</p>}

          <Button
            className="text-sm"
            disabled={isPayPending}
            icon={isPayPending ? faCircleNotch : undefined}
            onClick={() => {
              payRun(initRunData.Ok.id, initRunData.Ok.cost);
            }}
            spin={isPayPending}
          >
            Pay {formatEther(initRunData.Ok.cost)} SepoilaETH
          </Button>
        </div>
      );
    }

    if (isPayPending) {
      return (
        <p>
          <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin /> Paying
          for run
        </p>
      );
    }

    if (isConfirmationPending) {
      return (
        <p>
          <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
          Waiting for 3 confirmations
        </p>
      );
    }

    return (
      <>
        <div className="flex justify-between w-full">
          <div className="text-sm text-zinc-500">Transaction hash:</div>
          <div className="text-sm text-zinc-500">
            {transactionHash?.slice(0, 5)}...
            {transactionHash?.slice(-5)}
          </div>
        </div>
        <div className="flex justify-between w-full">
          <div>Run paid</div>
          <div>✅</div>
        </div>
      </>
    );
  }
}

export default function PayForRun() {
  const { useInitRun } = useRunContext();
  const { data: initRunData } = useInitRun;

  const cost = initRunData && "Ok" in initRunData ? initRunData?.Ok?.cost : 0n;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
          2
        </div>
        Pay for run
      </div>
      <div className="flex flex-col gap-2 pl-10">
        <div className="flex justify-between w-full">
          <div className="text-sm text-zinc-500">Transaction fee</div>
          <div className="text-sm text-zinc-500">
            {formatEther(cost)} SepoilaETH{" "}
          </div>
        </div>

        <PayForRunInner />
      </div>
    </div>
  );
}
