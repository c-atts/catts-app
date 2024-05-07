import { Recipe } from "catts_engine/declarations/catts_engine.did";
import useRunContext from "../../../context/useRunContext";
import { formatDistance } from "date-fns";
import { fromBytes } from "viem/utils";
import { mainnet } from "wagmi/chains";
import { useEnsName } from "wagmi";
import { shortenEthAddress } from "../../../eth/utils/shortenEthAddress";

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const { name, description, version, created, creator } = recipe;
  const { setSelectedRecipe, resetRun } = useRunContext();

  const creatorAddress = fromBytes(creator as Uint8Array, "hex");
  const { data: creatorEnsName } = useEnsName({
    address: "0xa32aECda752cF4EF89956e83d60C04835d4FA867",
    chainId: mainnet.id,
  });

  const createdDate = new Date(Number(created / BigInt(1_000_000)));
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  const handleClick = () => {
    resetRun();
    setSelectedRecipe(recipe);
  };

  return (
    <li
      className="border-zinc-700/50 border-[1px] bg-zinc-800 drop-shadow-xl rounded-xl flex flex-col p-10 w-full mb-5"
      key={name}
    >
      <div className="flex flex-col gap-3">
        <div
          className="text-2xl font-bold hover:underline  cursor-pointer"
          onClick={handleClick}
        >
          {name}
        </div>
        <div className="leading-relaxed">{description}</div>
        <div className="text-sm text-zinc-500">
          {creatorEnsName || shortenEthAddress(creatorAddress)} created{" "}
          {version} • {when}
        </div>
      </div>
    </li>
  );
}
