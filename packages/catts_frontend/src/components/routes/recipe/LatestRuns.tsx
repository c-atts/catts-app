import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChainIcon } from "@/components/ChainIcon";
import { RunBasics } from "@/run/types/run.types";
import { formatDistance } from "date-fns";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { useLatestRecipeRuns } from "@/run/hooks/useLatestRecipeRuns";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";
import { useGetRecipeByName } from "@/recipe/hooks/useGetRecipeByName";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";
import { Link } from "@tanstack/react-router";

function LatestRunItem({ run }: { run: RunBasics }) {
  const { chain_id, created } = run;

  const { data: creatorEnsName } = useEnsName({
    address: run.creator as `0x${string}`,
    chainId: mainnet.id,
  });
  const createdDate = new Date(created);
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  return (
    <Link params={{ runId: run.id }} to={`/run/$runId`}>
      <div
        className="flex w-full gap-2 text-sm items-center hover-darken bg-card py-2 px-3 rounded-lg"
        key={run.id}
      >
        <ChainIcon chainId={chain_id} className="w-8 h-8" />
        <div className="flex flex-col">
          <div>{creatorEnsName || shortenEthAddress(run.creator)}</div>
          <div>{when}</div>
        </div>
      </div>
    </Link>
  );
}

export default function LatestRuns() {
  const { recipeName } = useRecipeContext();
  const { data: recipe } = useGetRecipeByName(recipeName);
  const { data, isPending } = useLatestRecipeRuns({ recipeId: recipe?.id });

  if (isPending || !data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Runs</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {data.length === 0 && <>This recipe has no runs yet.</>}
        {data.map((run) => (
          <LatestRunItem key={run.id} run={run} />
        ))}
      </CardContent>
    </Card>
  );
}
