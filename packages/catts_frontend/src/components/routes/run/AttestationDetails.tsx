import { useGetRunById } from "@/run/hooks/useGetRunById";
import useRunContext from "@/run/hooks/useRunContext";
import { Card, CardContent } from "@/components/ui/card";
import CopyButton from "@/components/CopyButton";
import { CircleAlert } from "lucide-react";

export default function AttestationDetails() {
  const { runId } = useRunContext();
  const { data: run } = useGetRunById(runId);

  if (!run) {
    return null;
  }

  const { attestation_transaction_hash, attestation_uid } = run;

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
                  {attestation_transaction_hash}{" "}
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
                  {attestation_uid}{" "}
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
