import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { Link } from "@tanstack/react-router";
import { mainnet } from "viem/chains";
import { useEnsAvatar, useEnsName } from "wagmi";

function EnsAvatar({ ensName }: { ensName: string }) {
  const { data: avatar } = useEnsAvatar({ name: ensName, chainId: mainnet.id });
  if (!avatar) return null;
  return (
    <img alt={ensName} className="w-7 h-7 rounded-full mr-2" src={avatar} />
  );
}

export default function UserLink({ address }: { address: string }) {
  const { data: creatorEnsName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
  });

  return (
    <Link
      className="flex items-center"
      params={{ address: address }}
      to={`/user/${address}`}
    >
      {creatorEnsName && <EnsAvatar ensName={creatorEnsName} />}{" "}
      {creatorEnsName || shortenEthAddress(address)}
    </Link>
  );
}
