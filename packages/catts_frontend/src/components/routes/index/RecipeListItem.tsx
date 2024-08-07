import { formatDistance } from "date-fns";
import { mainnet } from "wagmi/chains";
import { useEnsName } from "wagmi";
import { Link } from "@tanstack/react-router";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { RecipeBasics } from "@/recipe/types/recipe.types";

export default function RecipeListItem({ recipe }: { recipe: RecipeBasics }) {
  const { name, description, created, creator } = recipe;

  const { data: creatorEnsName } = useEnsName({
    address: creator as `0x${string}`,
    chainId: mainnet.id,
  });

  const when = formatDistance(new Date(created), new Date(), {
    addSuffix: true,
  });

  return (
    <li
      className="border-[1px] bg-card shadow-sm rounded-lg flex flex-col p-10 w-full mb-5"
      key={name}
    >
      <div className="flex flex-col gap-3">
        <Link params={{ recipeName: name }} to={`/recipe/$recipeName`}>
          <div className="text-2xl font-bold hover:underline  cursor-pointer">
            {name}
          </div>
        </Link>

        <div className="leading-relaxed">{description}</div>
        <div className="text-sm text-zinc-500">
          {creatorEnsName || shortenEthAddress(creator)} created {when}
        </div>
      </div>
    </li>
  );
}
