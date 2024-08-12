import { createLazyFileRoute } from "@tanstack/react-router";
import { useListRecipesByUser } from "@/recipe/hooks/useListRecipesByUser";
import RecipeListItem from "@/components/RecipeListItem";
import { useEnsAvatar, useEnsName } from "wagmi";
import { mainnet } from "viem/chains";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import CopyButton from "@/components/CopyButton";
import { useListRunsByUser } from "@/run/hooks/useListRunsByUser";
import RunsListItem from "@/components/RunsListItem";
import { CircleUserRoundIcon } from "lucide-react";
import Message from "@/components/Message";

export const Route = createLazyFileRoute("/user/$address")({
  component: Index,
});

function EnsAvatar({ ensName }: { ensName: string }) {
  const { data: avatar } = useEnsAvatar({ name: ensName, chainId: mainnet.id });
  if (!avatar) return null;
  return (
    <img alt={ensName} className="w-20 h-20 rounded-full mr-3" src={avatar} />
  );
}

function Index() {
  const address = Route.useParams().address.toLowerCase() as `0x${string}`;
  const { data: recipes } = useListRecipesByUser(address);
  const { data: runs } = useListRunsByUser(address);

  const { data: userEnsName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
  });

  if (!recipes || !runs) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center mb-14">
        {userEnsName && <EnsAvatar ensName={userEnsName} />}
        {!userEnsName && <CircleUserRoundIcon className="w-20 h-20 mr-3" />}
        <div className="flex flex-col gap-3">
          <h1 className="my-0">{userEnsName || shortenEthAddress(address)}</h1>
          {userEnsName && (
            <div className="flex">
              {shortenEthAddress(address)}
              <CopyButton value={address} />
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-5 w-full">
        <div className="w-1/2 flex flex-col">
          <h1>User recipes</h1>
          <div className="flex flex-col gap-5">
            {recipes.map((recipe) => (
              <RecipeListItem key={recipe.name} recipe={recipe} />
            ))}
            {recipes.length === 0 && (
              <Message type="note">User has created no recipes.</Message>
            )}
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <h1>User runs</h1>
          <div className="flex flex-col gap-5">
            {runs.map((run) => (
              <RunsListItem key={run.id} run={run} />
            ))}
            {runs.length === 0 && (
              <Message type="note">User has created no runs.</Message>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
