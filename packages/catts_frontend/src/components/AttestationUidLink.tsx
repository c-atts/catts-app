import { shortenEthAddress } from "@/lib/eth/utils/shortenEthAddress";
import { CHAIN_CONFIG } from "@/config";
import { cn } from "@/lib/utils";

export default function AttestationUidLink({
  uid,
  chainId,
  className,
}: {
  uid?: string;
  chainId: number;
  className?: string;
}) {
  if (!uid) return null;
  const attestationUidUrl = `${CHAIN_CONFIG[chainId].easExplorerUrl}/attestation/view/${uid}`;
  className = cn("classical-link", className);
  return (
    <a
      className={className}
      href={attestationUidUrl}
      rel="noreferrer"
      target="_blank"
    >
      {shortenEthAddress(uid)}
    </a>
  );
}
