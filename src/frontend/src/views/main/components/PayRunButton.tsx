import Button from "../../../components/ui/Button";
import { Run } from "../../../../../declarations/backend/backend.did";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import useRunContext from "../../../ run-context/useRunContext";

export default function PayRunButton({ run }: { run: Run }) {
  const {
    useCancelRun,
    useWriteContract,
    useWaitForTransactionReceipt,
    useStartRun,
    useGetAttestationUid,
    payAndCreateAttestations,
  } = useRunContext();

  const handleClick = () => {
    if (run.payment_transaction_hash.length) {
      useStartRun.mutate(run.id);
    } else {
      payAndCreateAttestations(run);
    }
  };

  const isPending =
    useWriteContract.isPending ||
    useWaitForTransactionReceipt.isFetching ||
    useStartRun.isPending ||
    useGetAttestationUid.isPending;

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
      return "Attestation created, getting UID...";
    }
    if (run.payment_transaction_hash.length) {
      return "Create attestation";
    }
    return "Pay and create attestation";
  };

  return (
    <Button
      disabled={isPending || useCancelRun.isPending}
      icon={isPending ? faCircleNotch : undefined}
      onClick={handleClick}
      spin={isPending}
    >
      {buttonText()}
    </Button>
  );
}
