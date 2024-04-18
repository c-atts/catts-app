import CancelRunButton from "./CancelRunButton";
import PayRunButton from "./PayRunButton";
import { Run } from "../../../../../declarations/backend/backend.did";
import RunButton from "./RunButton";
import { formatDistance } from "date-fns";
import { runStatusToString } from "../../../catts/runStatusToString";
import { formatEther } from "viem";

export function RunHistoryListItem({ run }: { run: Run }) {
  const runCreatedDate = new Date(Number(run.created / BigInt(1_000_000)));

  const when = formatDistance(new Date(runCreatedDate), new Date(), {
    addSuffix: true,
  });

  return (
    <li className="flex flex-col">
      <h3>Copy Gitcoin Passport Score</h3>
      <p className="text-sm text-zinc-500"> {when}</p>
      <div className="flex flex-col gap-2">
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
              <div>
                {" "}
                {run.payment_transaction_hash[0]?.slice(0, 5)}...
                {run.payment_transaction_hash[0]?.slice(0, 5)?.slice(-5)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full gap-2 py-5 text-sm">
        <CancelRunButton run={run} />
        <PayRunButton run={run} />
        <RunButton run={run} />
      </div>
    </li>
  );
}
