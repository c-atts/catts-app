import { formatDistance } from "date-fns";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";
import { fromBytes } from "viem";
import { Badge } from "@/components/ui/badge";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";

export default function RecipeBasics() {
  const { recipe } = useRecipeContext();
  const creatorAddress = recipe
    ? fromBytes(recipe.creator as Uint8Array, "hex")
    : undefined;
  const { data: creatorEnsName } = useEnsName({
    address: creatorAddress,
    chainId: mainnet.id,
  });

  if (!recipe) {
    return null;
  }

  const { name, description, created, publish_state } = recipe;

  const publishBadgeText = Object.keys(publish_state)[0];
  const createdDate = new Date(Number(created / BigInt(1_000_000)));
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Badge className="bg-secondary">{publishBadgeText}</Badge>
      </div>
      <div className="text-3xl font-bold pb-4">{name}</div>
      <div className="leading-relaxed">{description}</div>
      <div className="text-sm text-foreground/50">
        {creatorEnsName || shortenEthAddress(creatorAddress)} created • {when}
      </div>
    </div>
  );
}
