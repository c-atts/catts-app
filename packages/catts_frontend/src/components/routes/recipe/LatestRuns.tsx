import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChainIcon } from "@/components/ChainIcon";
import { RunBasics } from "@/run/types/run.types";
import { formatDistance } from "date-fns";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { useLatestRecipeRuns } from "@/run/hooks/useLatestRecipeRuns";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";

function LatestRunItem({ run }: { run: RunBasics }) {
  const { id, chain_id, created } = run;

  const createdDate = new Date(created);
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  return (
    <div className="flex w-full gap-2 text-sm" key={run.id}>
      <ChainIcon chainId={chain_id} className="w-8 h-8" />
      <div className="flex flex-col">
        <div>{shortenEthAddress(id)}</div>
        <div>{when}</div>
      </div>
    </div>
  );
}

export default function LatestRuns() {
  const { recipe } = useRecipeContext();
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
