import { Link } from "@tanstack/react-router";
import ListCard from "@/components/ListCard";
import { RecipeBasics } from "@/recipe/types/recipe.types";
import { formatDistance } from "date-fns";
import { useEnsName } from "wagmi";
import { mainnet } from "viem/chains";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";

export default function RecipeListItem({ recipe }: { recipe: RecipeBasics }) {
  const { creator, created, name, id } = recipe;

  const { data: creatorEnsName } = useEnsName({
    address: creator as `0x${string}`,
    chainId: mainnet.id,
  });

  const when = formatDistance(new Date(created), new Date(), {
    addSuffix: true,
  });

  return (
    <Link params={{ recipeName: name }} to={"/recipe/$recipeName"}>
      <ListCard className="text-sm hover-darken" key={id}>
        <div className="flex flex-col gap-2">
          <h2 className="my-0">{name}</h2>
          <div>{recipe?.description}</div>
          <div className="text-foreground/50">
            {creatorEnsName || shortenEthAddress(creator)} • {when}
          </div>
        </div>
      </ListCard>
    </Link>
  );
}
