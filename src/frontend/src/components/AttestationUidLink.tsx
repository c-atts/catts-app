import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";
import { shortenEthAddress } from "../eth/utils/shortenEthAddress";
import { twMerge } from "tailwind-merge";

export default function AttestationUidLink({
  uid,
  className,
}: {
  uid?: string;
  className?: string;
}) {
  if (!uid) return null;

  className = twMerge(
    "px-3 py-1 text-sm rounded-full bg-zinc-800/50 hover:bg-zinc-800 ",
    className
  );

  return (
    <a
      className="no-underline"
      href={`https://sepolia.easscan.org/attestation/view/${uid}`}
      rel="noreferrer"
      target="_blank"
    >
      <div className={className}>
        <div className="flex items-center justify-center w-full gap-2 whitespace-nowrap">
          <FontAwesomeIcon className="w-3 h-3" icon={faEthereum} />
          {shortenEthAddress(uid)}
        </div>
      </div>
    </a>
  );
}
