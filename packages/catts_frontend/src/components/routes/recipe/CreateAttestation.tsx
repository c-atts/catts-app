import AttestationUidLink from "../../../components/AttestationUidLink";
import EthTxLink from "../../../components/EthTxLink";
import { paymentVerifiedStatusToString } from "../../../catts/paymentVerifiedStatusToString";
import useRunContext from "../../../context/useRunContext";
import { LoaderCircle } from "lucide-react";

export function CreateAttestationInner() {
  const { runInProgress } = useRunContext();

  const paymentStatus = paymentVerifiedStatusToString(runInProgress);

  return (
    <>
      {runInProgress &&
        runInProgress.payment_transaction_hash.length > 0 &&
        paymentStatus === "Verified" &&
        runInProgress.attestation_transaction_hash.length === 0 && (
          <div className="flex justify-between w-full">
            <div>Creating attestation ...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}

      {runInProgress &&
        runInProgress.attestation_transaction_hash.length > 0 && (
          <div className="flex justify-between w-full">
            <div className="text-sm text-foreground/50">Attesttation tx</div>
            <div className="text-sm text-foreground/50">
              <EthTxLink
                chainId={Number(runInProgress.chain_id)}
                tx={runInProgress?.attestation_transaction_hash[0]}
              />
            </div>
          </div>
        )}

      {runInProgress &&
        runInProgress.attestation_transaction_hash.length > 0 &&
        runInProgress.attestation_uid.length === 0 && (
          <div className="flex justify-between w-full">
            <div> Attestation created, getting UID...</div>
            <div>
              <LoaderCircle className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}

      {runInProgress && runInProgress.attestation_uid.length > 0 && (
        <div className="flex justify-between w-full">
          <div className="text-sm text-foreground/50">Attestation uid</div>
          <div className="text-sm text-foreground/50">
            <AttestationUidLink
              chainId={Number(runInProgress.chain_id)}
              uid={runInProgress?.attestation_uid[0]}
            />
          </div>
        </div>
      )}

      {runInProgress && runInProgress.attestation_uid.length > 0 && (
        <div className="flex justify-between w-full">
          <div>Attestation created</div>
          <div>✅</div>
        </div>
      )}

      {/* {useStartRun.data && "Err" in useStartRun.data && (
        <div className="flex justify-between w-full">
          <div>There was an error creating the attestation</div>
          <div>🔴</div>
        </div>
      )} */}
    </>
  );
}

export default function CreateAttestation() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-zinc-300 text-zinc-800">
          3
        </div>
        Create attestation
      </div>
      <div className="flex flex-col gap-2 pl-10">
        <CreateAttestationInner />
      </div>
    </div>
  );
}
