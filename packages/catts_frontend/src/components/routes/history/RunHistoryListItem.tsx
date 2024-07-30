import AttestationUidLink from "../../../components/AttestationUidLink";
import EthTxLink from "../../../components/EthTxLink";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { formatDistance } from "date-fns";
import { formatEther } from "viem";
import CancelRunButton from "../index/CancelRunButton";
import { CHAIN_CONFIG } from "../../../config";
import { ChainIcon } from "../../ChainIcon";
import { useGetRecipeById } from "@/recipe/hooks/useGetRecipeById";
import { getRunStatusString } from "@/run/getRunStatusString";

export function RunHistoryListItem({ run }: { run: Run }) {
  const { data } = useGetRecipeById(run.recipe_id);
  const runCreatedDate = new Date(Number(run.created / BigInt(1_000_000)));
  const when = formatDistance(new Date(runCreatedDate), new Date(), {
    addSuffix: true,
  });

  const recipe = data && "Ok" in data ? data.Ok : undefined;

  const paymentStatus = getRunStatusString(run);

  return (
    <li className="flex flex-col">
      <div className="border-zinc-700/50 border-[1px] bg-zinc-800 drop-shadow-xl rounded-2xl flex flex-col p-10 w-full mt-2">
        <div className=" pb-3 flex w-full justify-between">
          <div className="text-2xl font-bold">{recipe ? recipe.name : ""}</div>
          <ChainIcon
            chainName={CHAIN_CONFIG[Number(run.chain_id)]?.name}
            className="w-6 h-6"
          />
        </div>
        <div className="flex flex-col gap-2 text-sm text-foreground/50">
          <div className="flex items-center justify-between w-full h-8">
            <div>Created</div>
            <div>{when}</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-foreground/50">
          <div className="flex items-center justify-between w-full h-8">
            <div>Transaction fee</div>
            {run.user_fee.length > 0 && typeof run.user_fee[0] === "bigint" && (
              <div>
                {formatEther(run.user_fee[0])}{" "}
                {CHAIN_CONFIG[Number(run.chain_id)]?.nativeTokenName}
              </div>
            )}
          </div>
        </div>
        {run.payment_transaction_hash.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-foreground/50">
            <div className="flex items-center justify-between w-full h-8">
              <div>Payment Tx</div>
              <EthTxLink
                chainId={Number(run.chain_id)}
                tx={run.payment_transaction_hash[0]}
              />
            </div>
          </div>
        )}
        {paymentStatus && (
          <div className="flex flex-col gap-2 text-sm text-foreground/50">
            <div className="flex items-center justify-between w-full h-8">
              <div>Payment verified status</div>
              {getRunStatusString(run)}
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
          <div className="flex flex-col gap-2 text-sm text-foreground/50">
            <div className="flex items-center justify-between w-full h-8">
              <div>Attestation Tx</div>
              <EthTxLink
                chainId={Number(run.chain_id)}
                tx={run.attestation_transaction_hash[0]}
              />
            </div>
          </div>
        )}
        {run.attestation_uid.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-foreground/50">
            <div className="flex items-center justify-between w-full h-8">
              <div>Attestation Uid</div>
              <AttestationUidLink
                chainId={Number(run.chain_id)}
                uid={run.attestation_uid[0]}
              />
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
