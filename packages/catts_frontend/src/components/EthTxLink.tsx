import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { shortenEthAddress } from "../eth/utils/shortenEthAddress";
import { twMerge } from "tailwind-merge";

import { CHAIN_CONFIG } from "../config";

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

  className = twMerge(
    "text-sm text-cyan-600 border-b-2 border-cyan-600 hover:border-opacity-100  border-opacity-0",
    className,
  );

  return (
    <a
      className="no-underline"
      href={`${CHAIN_CONFIG[chainId]?.blockExplorerUrl}/tx/${tx}`}
      rel="noreferrer"
      target="_blank"
    >
      <div className={className}>
        <div className="flex items-center justify-center w-full gap-2 whitespace-nowrap">
          <FontAwesomeIcon className="w-3 h-3" icon={faEthereum} />
          {shortenEthAddress(tx)}
        </div>
      </div>
    </a>
  );
}
