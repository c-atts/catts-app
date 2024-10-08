import { formatDistance } from "date-fns";
import { mainnet } from "wagmi/chains";
import { useEnsName } from "wagmi";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { RunBasics } from "@/run/types/run.types";
import { ChainIcon } from "@/components/ChainIcon";
import ListCard from "@/components/ListCard";
import { Link } from "@tanstack/react-router";
import { InfoIcon, TriangleAlert } from "lucide-react";

export default function RunsListItem({ run }: { run: RunBasics }) {
  const {
    created,
    creator,
    chain_id,
    recipe,
    error,
    attestation_transaction_hash,
  } = run;

  const { data: creatorEnsName } = useEnsName({
    address: creator as `0x${string}`,
    chainId: mainnet.id,
  });

  const when = formatDistance(new Date(created), new Date(), {
    addSuffix: true,
  });

  return (
    <Link params={{ runId: run.id }} to={"/run/$runId"}>
      <ListCard className="text-sm hover-darken" key={run.id}>
        <div className="flex w-full gap-3 items-center">
          <ChainIcon chainId={chain_id} className="w-8 h-8" />
          <div className="flex flex-col gap-1">
            <h2 className="my-0">{recipe?.name}</h2>
            <div className="text-foreground/50">
              {creatorEnsName || shortenEthAddress(creator)} • {when}
            </div>
          </div>
          <div className="flex-grow" />
          <div>
            {error && <TriangleAlert className="w-4 h-4 text-red-500" />}
            {!error && !attestation_transaction_hash && (
              <InfoIcon className="w-4 h-4 text-blue-700" />
            )}
          </div>
        </div>
      </ListCard>
    </Link>
  );
}
