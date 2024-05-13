import Ethereum from "/ethereum_icon.svg";
import Optimism from "/optimism.svg";

const CHAIN_IMAGES: { [key: string]: string } = {
  "OP Mainnet": Optimism,
  Sepolia: Ethereum,
};

export function ChainIcon({
  chainName,
  className,
}: {
  chainName: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center w-full gap-2 md:w-auto`}>
      <img
        alt={chainName}
        className={className}
        src={CHAIN_IMAGES[chainName]}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
