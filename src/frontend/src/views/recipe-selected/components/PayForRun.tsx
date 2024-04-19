import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { formatEther } from "viem/utils";
import useRunContext from "../../../ run-context/useRunContext";
import EthTxLink from "../../../components/EthTxLink";

export function PayForRunInner() {
  const {
    useInitRun,
    useWriteContract,
    useWaitForTransactionReceipt,
    payAndCreateAttestations,
    runInProgress,
    runInProgressStep,
    setRunInProgressStep,
  } = useRunContext();

  useEffect(() => {
    if (useInitRun.data && "Ok" in useInitRun.data && runInProgressStep === 0) {
      const run = useInitRun.data.Ok;
      payAndCreateAttestations(run);
      setRunInProgressStep(1);
    }
  }, [
    payAndCreateAttestations,
    runInProgressStep,
    setRunInProgressStep,
    useInitRun.data,
    useInitRun.isSuccess,
  ]);

  if (useWriteContract.isPending) {
    return (
      <p>
        <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
        Paying...
      </p>
    );
  }

  if (useWaitForTransactionReceipt.isFetching) {
    return (
      <p>
        <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
        Waiting for 3 confirmations...
      </p>
    );
  }

  if (runInProgress?.payment_transaction_hash[0]?.length) {
    return (
      <>
        <div className="flex justify-between w-full">
          <div className="text-sm text-zinc-500">Payment tx</div>
          <EthTxLink tx={runInProgress?.payment_transaction_hash[0]} />
        </div>
        <div className="flex justify-between w-full">
          <div>Run paid</div>
          <div>✅</div>
        </div>
      </>
    );
  }

  return null;
}

export default function PayForRun() {
  const { useInitRun } = useRunContext();
  const { data: initRunData } = useInitRun;

  const cost =
    initRunData && "Ok" in initRunData ? initRunData?.Ok?.cost : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
          2
        </div>
        Pay for run
      </div>
      <div className="flex flex-col gap-2 pl-10">
        {cost !== undefined && (
          <div className="flex justify-between w-full">
            <div className="text-sm text-zinc-500">Transaction fee</div>
            <div className="text-sm text-zinc-500">
              {formatEther(cost)} SepoilaETH{" "}
            </div>
          </div>
        )}

        <PayForRunInner />
      </div>
    </div>
  );
}
