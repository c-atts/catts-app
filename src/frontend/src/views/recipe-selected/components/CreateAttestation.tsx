import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import useRunContext from "../../../ run-context/useRunContext";

export function CreateAttestationInner() {
  const { useInitRun, useWaitForTransactionReceipt, useStartRun } =
    useRunContext();
  const { data: initRunData } = useInitRun;
  const { isSuccess } = useWaitForTransactionReceipt;

  const { mutate: startRun, isPending, data } = useStartRun;

  useEffect(() => {
    if (isSuccess && initRunData && "Ok" in initRunData) {
      startRun(initRunData.Ok.id);
    }
  }, [isSuccess, initRunData, startRun]);

  if (isPending) {
    return (
      <p>
        <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
        Creating attestation
      </p>
    );
  }

  if (data && "Ok" in data) {
    return (
      <>
        <div className="flex justify-between w-full">
          <div className="text-sm text-zinc-500">Transaction hash:</div>
          <div className="text-sm text-zinc-500">
            {data.Ok.s?.slice(0, 5)}...
            {data.Ok.s?.slice(-5)}
          </div>
        </div>
        <div className="flex justify-between w-full">
          <div>Attestation created</div>
          <div>✅</div>
        </div>
      </>
    );
  }

  if (data && "Err" in data) {
    console.error("Error creating attestation", data.Err);
    return (
      <div className="flex justify-between w-full">
        <div>There was an error creating the attestation</div>
        <div>🔴</div>
      </div>
    );
  }
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
