import { formatDistance } from "date-fns";
import { mainnet } from "wagmi/chains";
import { useEnsName } from "wagmi";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { RunBasics } from "@/run/types/run.types";
import { ChainIcon } from "@/components/ChainIcon";
import ListCard from "@/components/ListCard";
import { Link } from "@tanstack/react-router";

export default function RunsListItem({ run }: { run: RunBasics }) {
  const { created, creator, chain_id, recipe } = run;

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
        <div className="flex w-full gap-2">
          <ChainIcon chainId={chain_id} className="w-8 h-8" />
          <div className="flex flex-col">
            <h2>{recipe?.name}</h2>
            <div className="text-foreground/50">
              {creatorEnsName || shortenEthAddress(creator)} • {when}
            </div>
          </div>
        </div>
      </ListCard>
    </Link>
  );
}
