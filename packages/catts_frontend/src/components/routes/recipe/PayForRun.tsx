import EthTxLink from "../../../components/EthTxLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TransactionExecutionError } from "viem";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { formatEther } from "viem/utils";
import { paymentVerifiedStatusToString } from "../../../catts/paymentVerifiedStatusToString";
import useRunContext from "../../../context/useRunContext";
import { CHAIN_CONFIG } from "../../../config";

export function PayForRunInner() {
  const { usePayForRun, runInProgress, progressMessage } = useRunContext();

  if (!runInProgress) return null;

  const paymentStatus = paymentVerifiedStatusToString(runInProgress);

  if (
    usePayForRun.isPending ||
    (runInProgress.payment_transaction_hash.length === 0 && !usePayForRun.error)
  ) {
    return (
      <p>
        <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
        {progressMessage}
      </p>
    );
  }

  if (usePayForRun.error) {
    return (
      <div className="flex justify-between w-full">
        <div>
          Error:{" "}
          {(usePayForRun.error as TransactionExecutionError).shortMessage}
        </div>
        <div>🔴</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between w-full">
        <div className="text-sm text-zinc-500">Payment tx</div>
        <EthTxLink
          chainId={Number(runInProgress.chain_id)}
          tx={runInProgress.payment_transaction_hash[0]}
        />
      </div>
      <div className="flex justify-between w-full">
        <div>Run paid</div>
        <div>✅</div>
      </div>
      {paymentStatus === "Verified" ? (
        <div className="flex justify-between w-full">
          <div>Payment verified</div>
          <div>✅</div>
        </div>
      ) : (
        <p>
          <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
          Verifying payment...
        </p>
      )}
    </>
  );
}

export default function PayForRun() {
  const { useCreateRun: useInitRun, runInProgress } = useRunContext();
  const { data: initRunData } = useInitRun;

  const cost =
    initRunData && "Ok" in initRunData ? initRunData?.Ok?.fee : undefined;

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
              {formatEther(cost)}{" "}
              {CHAIN_CONFIG[Number(runInProgress?.chain_id)].nativeTokenName}
            </div>
          </div>
        )}

        <PayForRunInner />
      </div>
    </div>
  );
}
