import CancelRunButton from "./CancelRunButton";
import EthTxLink from "../../../components/EthExplorerLink";
import PayRunButton from "./PayRunButton";
import { Run } from "../../../../../declarations/backend/backend.did";
import StartRunButton from "./StartRunButton";
import { formatDistance } from "date-fns";
import { formatEther } from "viem";
import { runStatusToString } from "../../../catts/runStatusToString";

export function RunHistoryListItem({ run }: { run: Run }) {
  const runCreatedDate = new Date(Number(run.created / BigInt(1_000_000)));

  const when = formatDistance(new Date(runCreatedDate), new Date(), {
    addSuffix: true,
  });

  const showCancelButton = "Created" in run.status || "Paid" in run.status;
  const showPayButton = "Created" in run.status;
  const showRunButton = "Paid" in run.status;

  return (
    <li className="flex flex-col">
      <h3>Copy Gitcoin Passport Score</h3>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 text-sm text-zinc-500">
          <div className="flex justify-between w-full">
            <div>Created</div>
            <div>{when}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-zinc-500">
          <div className="flex justify-between w-full">
            <div>Status</div>
            <div>{runStatusToString(run.status)}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-zinc-500">
          <div className="flex justify-between w-full">
            <div>Transaction fee</div>
            <div>{formatEther(run.cost)} SepoliaETH</div>
          </div>
        </div>
        {run.payment_transaction_hash.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-zinc-500">
            <div className="flex justify-between w-full">
              <div>Payment</div>
              <EthTxLink tx={run.payment_transaction_hash[0]} />
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full gap-2 py-5 text-sm">
        {showCancelButton && <CancelRunButton run={run} />}
        {showPayButton && <PayRunButton run={run} />}
        {showRunButton && <StartRunButton run={run} />}
      </div>
    </li>
  );
}
