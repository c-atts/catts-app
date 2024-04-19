import Button from "../../../components/ui/Button";
import { Run } from "../../../../../declarations/backend/backend.did";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import useRunContext from "../../../ run-context/useRunContext";

export default function PayRunButton({ run }: { run: Run }) {
  const {
    useWriteContract,
    useWaitForTransactionReceipt,
    useStartRun,
    useGetAttestationUid,
    payAndCreateAttestations,
  } = useRunContext();

  const isPending =
    useWriteContract.isPending ||
    useWaitForTransactionReceipt.isFetching ||
    useStartRun.isPending;

  const buttonText = () => {
    if (useWriteContract.isPending) {
      return "Paying...";
    }
    if (useWaitForTransactionReceipt.isFetching) {
      return "Waiting for 3 confirmations...";
    }
    if (useStartRun.isPending) {
      return "Creating attestation...";
    }
    if (useGetAttestationUid.isPending) {
      return "Attestaion created, getting UID...";
    }
    return "Pay and create attestation";
  };

  console.log("run", run);
  console.log("isPending", isPending);
  console.log("buttonText", buttonText());
  console.log("---");

  return (
    <Button
      disabled={isPending}
      icon={isPending ? faCircleNotch : undefined}
      onClick={() => {
        payAndCreateAttestations(run);
      }}
      spin={isPending}
    >
      {buttonText()}
    </Button>
  );
}
