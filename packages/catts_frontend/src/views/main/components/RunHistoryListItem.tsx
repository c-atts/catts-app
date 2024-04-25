import AttestationUidLink from "../../../components/AttestationUidLink";
import CancelRunButton from "./CancelRunButton";
import EthTxLink from "../../../components/EthTxLink";
import PayRunButton from "./PayRunButton";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { formatDistance } from "date-fns";
import { formatEther } from "viem";
import { runStatusToString } from "../../../catts/runStatusToString";

export function RunHistoryListItem({ run }: { run: Run }) {
  const runCreatedDate = new Date(Number(run.created / BigInt(1_000_000)));
  const when = formatDistance(new Date(runCreatedDate), new Date(), {
    addSuffix: true,
  });

  const showCancelButton =
    "Created" in run.status ||
    ("Paid" in run.status && run.payment_transaction_hash.length === 0);

  const showPayButton =
    "Created" in run.status ||
    ("Paid" in run.status &&
      (run.payment_transaction_hash.length === 0 ||
        run.attestation_transaction_hash.length === 0 ||
        run.attestation_uid.length === 0));

  return (
    <li className="flex flex-col">
      <h3>{run.recipe_id}</h3>
      <div className="border-zinc-700/50 border-[1px]  drop-shadow-xl rounded-2xl flex flex-col p-10 w-full mt-2">
        <div className="flex flex-col gap-2 text-sm text-zinc-500">
          <div className="flex items-center justify-between w-full h-8">
            <div>Created</div>
            <div>{when}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-zinc-500">
          <div className="flex items-center justify-between w-full h-8">
            <div>Status</div>
            <div>{runStatusToString(run.status)}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-zinc-500">
          <div className="flex items-center justify-between w-full h-8">
            <div>Transaction fee</div>
            <div>{formatEther(run.cost)} SepoliaETH</div>
          </div>
        </div>
        {run.payment_transaction_hash.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-zinc-500">
            <div className="flex items-center justify-between w-full h-8">
              <div>Payment tx</div>
              <EthTxLink tx={run.payment_transaction_hash[0]} />
            </div>
          </div>
        )}
        {run.attestation_transaction_hash.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-zinc-500">
            <div className="flex items-center justify-between w-full h-8">
              <div>Attestation tx</div>
              <EthTxLink tx={run.attestation_transaction_hash[0]} />
            </div>
          </div>
        )}
        {run.attestation_uid.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-zinc-500">
            <div className="flex items-center justify-between w-full h-8">
              <div>Attestation UID</div>
              <AttestationUidLink uid={run.attestation_uid[0]} />
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full gap-2 py-5 text-sm">
        {showCancelButton && <CancelRunButton run={run} />}

        {showPayButton && <PayRunButton run={run} />}
      </div>
    </li>
  );
}
