import AttestationUidLink from "@/components/AttestationUidLink";
import EthTxLink from "@/components/EthTxLink";
import { LoaderCircle } from "lucide-react";
import { RunStatus } from "@/run/types/run-status.type";
import { useRunStatus } from "@/run/hooks/useRunStatus";
import { useSelector } from "@xstate/store/react";
import { runStateStore } from "@/run/RunStateStore";

export function CreateAttestationInner() {
  const { runInProgress, errorMessage, createAttestationStatus } = useSelector(
    runStateStore,
    (state) => state.context,
  );

  const runStatus = useRunStatus(runInProgress);

  if (!runInProgress) return null;

  return (
    <>
      {runStatus === RunStatus.PaymentVerified && !errorMessage && (
        <div className="flex justify-between w-full">
          <div>Creating attestation ...</div>
          <div>
            <LoaderCircle className="w-5 h-5 animate-spin" />
          </div>
        </div>
      )}

      {runStatus >= RunStatus.AttestationCreated && (
        <div className="flex justify-between w-full">
          <div className="text-sm text-foreground/50">Attestation tx</div>
          <div className="text-sm text-foreground/50">
            <EthTxLink
              chainId={Number(runInProgress.chain_id)}
              tx={runInProgress?.attestation_transaction_hash[0]}
            />
          </div>
        </div>
      )}

      {runStatus === RunStatus.AttestationCreated && !errorMessage && (
        <div className="flex justify-between w-full">
          <div> Attestation created, getting UID...</div>
          <div>
            <LoaderCircle className="w-5 h-5 animate-spin" />
          </div>
        </div>
      )}

      {runStatus === RunStatus.AttestationUidConfirmed && (
        <>
          <div className="flex justify-between w-full">
            <div className="text-sm text-foreground/50">Attestation uid</div>
            <div className="text-sm text-foreground/50">
              <AttestationUidLink
                chainId={Number(runInProgress.chain_id)}
                uid={runInProgress?.attestation_uid[0]}
              />
            </div>
          </div>
          <div className="flex justify-between w-full">
            <div>Attestation created</div>
            <div>✅</div>
          </div>
        </>
      )}

      {createAttestationStatus === "error" && errorMessage && (
        <div className="flex justify-between w-full">
          <div>Error: {errorMessage}</div>
          <div>🔴</div>
        </div>
      )}
    </>
  );
}

export default function CreateAttestation() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
          5
        </div>
        Create attestation
      </div>
      <div className="flex flex-col gap-2 pl-10">
        <CreateAttestationInner />
      </div>
    </div>
  );
}
