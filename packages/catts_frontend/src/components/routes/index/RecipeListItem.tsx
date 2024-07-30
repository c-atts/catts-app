import { Recipe } from "catts_engine/declarations/catts_engine.did";
import { formatDistance } from "date-fns";
import { fromBytes } from "viem/utils";
import { mainnet } from "wagmi/chains";
import { useEnsName } from "wagmi";
import { Link } from "@tanstack/react-router";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const { name, description, created, creator } = recipe;

  const creatorAddress = fromBytes(creator as Uint8Array, "hex");
  const { data: creatorEnsName } = useEnsName({
    address: "0xa32aECda752cF4EF89956e83d60C04835d4FA867",
    chainId: mainnet.id,
  });

  const createdDate = new Date(Number(created / BigInt(1_000_000)));
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  // const handleClick = () => {
  //   resetRun();
  //   setSelectedRecipe(recipe);
  //   navigate({ to: "/recipe/$recipeName", params: { recipeName: name } });
  // };

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
          {creatorEnsName || shortenEthAddress(creatorAddress)} created {when}
        </div>
      </div>
    </li>
  );
}
