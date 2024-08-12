import { CHAIN_CONFIG } from "../config";
import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { cn } from "@/lib/utils";

export default function EthTxLink({
  tx,
  chainId,
  className,
}: {
  tx?: string;
  chainId: number;
  className?: string;
}) {
  if (!tx) return null;
  const txUrl = `${CHAIN_CONFIG[chainId]?.blockExplorerUrl}/tx/${tx}`;
  className = cn("classic-link", className);

  return (
    <a className={className} href={txUrl} rel="noreferrer" target="_blank">
      {shortenEthAddress(tx)}
    </a>
  );
}
