import { formatDistance } from "date-fns";
import useRunContext from "../../../context/useRunContext";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";
import { fromBytes } from "viem";
import { shortenEthAddress } from "../../../eth/utils/shortenEthAddress";

export default function RecipeBasics() {
  const { selectedRecipe } = useRunContext();
  const creatorAddress = selectedRecipe
    ? fromBytes(selectedRecipe.creator as Uint8Array, "hex")
    : undefined;
  const { data: creatorEnsName } = useEnsName({
    address: creatorAddress,
    chainId: mainnet.id,
  });

  if (!selectedRecipe) {
    return null;
  }

  const { slug, description, version, created } = selectedRecipe;

  const createdDate = new Date(Number(created / BigInt(1_000_000)));
  const when = formatDistance(new Date(createdDate), new Date(), {
    addSuffix: true,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="text-3xl font-bold pb-4">{slug}</div>
      <div className="leading-relaxed">{description}</div>
      <div className="text-sm text-zinc-500">
        {creatorEnsName || shortenEthAddress(creatorAddress)} created {version}{" "}
        • {when}
      </div>
    </div>
  );
}
