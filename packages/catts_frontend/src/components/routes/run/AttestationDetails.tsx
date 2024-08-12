import { useGetRunById } from "@/run/hooks/useGetRunById";
import useRunContext from "@/run/hooks/useRunContext";
import { Card, CardContent } from "@/components/ui/card";
import CopyButton from "@/components/CopyButton";
import { CircleAlert } from "lucide-react";
import { CHAIN_CONFIG } from "@/config";
import { Link } from "@tanstack/react-router";

export default function AttestationDetails() {
  const { runId } = useRunContext();
  const { data: run } = useGetRunById(runId);

  if (!run) {
    return null;
  }

  const { chain_id, attestation_transaction_hash, attestation_uid } = run;

  const attestationTransactionUrl = `${CHAIN_CONFIG[chain_id].blockExplorerUrl}/tx/${attestation_transaction_hash}`;
  const attestationUidUrl = `${CHAIN_CONFIG[chain_id].easExplorerUrl}/attestation/view/${attestation_uid}`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 mt-6">
        <div className="flex flex-col gap-5">
          <h1>Attestation details</h1>
          <div className="flex flex-col w-full gap-3 text-sm">
            {!attestation_transaction_hash && !attestation_uid && (
              <div className="flex items-center">
                <CircleAlert className="w-4 h-4 mr-1" />
                No attestation has been created for this run.
              </div>
            )}
            {attestation_transaction_hash && (
              <div className="flex w-full">
                <div className="w-1/4 text-foreground/50 flex items-center">
                  Attestation transaction:
                </div>
                <div className="w-3/4 flex items-center ml-2">
                  <Link
                    className="classic-link"
                    target="_blank"
                    to={attestationTransactionUrl}
                  >
                    {attestation_transaction_hash}
                  </Link>
                  <CopyButton
                    className="ml-1"
                    value={attestation_transaction_hash}
                  />
                </div>
              </div>
            )}
            {attestation_uid && (
              <div className="flex w-full">
                <div className="w-1/4 text-foreground/50 flex items-center">
                  Attestation UID:
                </div>
                <div className="w-3/4 flex items-center ml-2">
                  <Link
                    className="classic-link"
                    target="_blank"
                    to={attestationUidUrl}
                  >
                    {attestation_uid}
                  </Link>
                  <CopyButton className="ml-1" value={attestation_uid} />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
