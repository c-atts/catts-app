import AttestationUidLink from "../../../components/AttestationUidLink";
import CancelRunButton from "./CancelRunButton";
import EthTxLink from "../../../components/EthTxLink";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { formatDistance } from "date-fns";
import { formatEther } from "viem";
import { paymentVerifiedStatusToString } from "../../../catts/paymentVerifiedStatusToString";
import { useGetRecipe } from "../../../catts/hooks/useGetRecipes";

export function RunHistoryListItem({ run }: { run: Run }) {
  const { data } = useGetRecipe(run.recipe_id);
  const runCreatedDate = new Date(Number(run.created / BigInt(1_000_000)));
  const when = formatDistance(new Date(runCreatedDate), new Date(), {
    addSuffix: true,
  });

  const recipe = data && "Ok" in data ? data.Ok : undefined;

  const paymentStatus = paymentVerifiedStatusToString(run);

  return (
    <li className="flex flex-col">
      <div className="border-zinc-700/50 border-[1px] bg-zinc-800 drop-shadow-xl rounded-2xl flex flex-col p-10 w-full mt-2">
        <div className="text-2xl font-bold pb-3">
          {recipe ? recipe.name : ""}
        </div>
        <div className="flex flex-col gap-2 text-sm text-zinc-500">
          <div className="flex items-center justify-between w-full h-8">
            <div>Created</div>
            <div>{when}</div>
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
              <div>Payment Tx</div>
              <EthTxLink tx={run.payment_transaction_hash[0]} />
            </div>
          </div>
        )}
        {paymentStatus && (
          <div className="flex flex-col gap-2 text-sm text-zinc-500">
            <div className="flex items-center justify-between w-full h-8">
              <div>Payment verified status</div>
              {paymentVerifiedStatusToString(run)}
            </div>
          </div>
        )}
        {paymentStatus === undefined && !run.is_cancelled && (
          <div className="flex items-center justify-between w-full h-8">
            <div>Payment not verified</div>
            <div>🔴</div>
          </div>
        )}
        {run.is_cancelled && (
          <div className="flex items-center justify-between w-full h-8">
            <div>Run has been cancelled</div>
            <div>🔴</div>
          </div>
        )}
        {run.attestation_transaction_hash.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-zinc-500">
            <div className="flex items-center justify-between w-full h-8">
              <div>Attestation Tx</div>
              <EthTxLink tx={run.attestation_transaction_hash[0]} />
            </div>
          </div>
        )}
        {run.attestation_uid.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-zinc-500">
            <div className="flex items-center justify-between w-full h-8">
              <div>Attestation Uid</div>
              <AttestationUidLink uid={run.attestation_uid[0]} />
            </div>
          </div>
        )}
      </div>
      <div className="flex w-full gap-2 py-5 text-sm">
        {paymentStatus === undefined && !run.is_cancelled && (
          <CancelRunButton run={run} />
        )}
      </div>
    </li>
  );
}
