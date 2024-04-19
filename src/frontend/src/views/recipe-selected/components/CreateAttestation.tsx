import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import useRunContext from "../../../ run-context/useRunContext";
import EthTxLink from "../../../components/EthTxLink";
import AttestationUidLink from "../../../components/AttestationUidLink";

export function CreateAttestationInner() {
  const { useStartRun, runInProgress } = useRunContext();

  return (
    <>
      {useStartRun.isPending && (
        <p>
          <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
          Creating attestation...
        </p>
      )}

      {runInProgress?.attestation_transaction_hash[0]?.length && (
        <div className="flex justify-between w-full">
          <div className="text-sm text-zinc-500">Attesttation tx</div>
          <div className="text-sm text-zinc-500">
            <EthTxLink tx={runInProgress?.attestation_transaction_hash[0]} />
          </div>
        </div>
      )}

      {runInProgress?.attestation_transaction_hash[0]?.length &&
        !runInProgress?.attestation_uid[0]?.length && (
          <p>
            <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
            Attestation created, getting UID...
          </p>
        )}

      {runInProgress?.attestation_uid[0]?.length && (
        <div className="flex justify-between w-full">
          <div className="text-sm text-zinc-500">Attestation UID</div>
          <div className="text-sm text-zinc-500">
            <AttestationUidLink uid={runInProgress?.attestation_uid[0]} />
          </div>
        </div>
      )}

      {runInProgress?.attestation_uid[0]?.length && (
        <div className="flex justify-between w-full">
          <div>Attestation created</div>
          <div>✅</div>
        </div>
      )}

      {useStartRun.data && "Err" in useStartRun.data && (
        <div className="flex justify-between w-full">
          <div>There was an error creating the attestation</div>
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
