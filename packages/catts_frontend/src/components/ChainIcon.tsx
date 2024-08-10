import { CHAIN_CONFIG } from "@/config";
import Ethereum from "/ethereum_icon.svg";
import Optimism from "/optimism.svg";

const CHAIN_IMAGES: { [key: string]: string } = {
  "OP Mainnet": Optimism,
  Sepolia: Ethereum,
};

export function ChainIcon({
  chainName,
  chainId,
  className,
}: {
  chainName?: string;
  chainId?: number;
  className?: string;
}) {
  if (chainId) {
    chainName = CHAIN_CONFIG[chainId]?.name;
  }

  if (!chainName) {
    return null;
  }

  return (
    <img
      alt={chainName}
      className={className}
      src={CHAIN_IMAGES[chainName] || Ethereum}
    />
  );
}
