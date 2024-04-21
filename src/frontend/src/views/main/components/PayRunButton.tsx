import * as R from "remeda";

import Button from "../../../components/ui/Button";
import { Run } from "../../../../../declarations/backend/backend.did";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import useRunContext from "../../../ run-context/useRunContext";

export default function PayRunButton({ run }: { run: Run }) {
  const {
    useCancelRun,
    usePayForRun,
    useStartRun,
    payAndCreateAttestation,
    createAttestation,
    isPaymentTransactionConfirmed,
    runInProgress,
    progressMessage: runProgressMessage,
  } = useRunContext();

  const handleClick = async () => {
    if (run.payment_transaction_hash.length > 0) {
      await createAttestation(run);
    } else {
      await payAndCreateAttestation(run);
    }
  };

  const isDisabled =
    usePayForRun.isPending ||
    isPaymentTransactionConfirmed === false ||
    useStartRun.isPending ||
    useCancelRun.isPending ||
    runInProgress?.attestation_uid.length === 0;

  const showSpinner = R.isDeepEqual(runInProgress?.id, run.id) && isDisabled;

  const buttonText = () => {
    if (runInProgress && R.isDeepEqual(runInProgress?.id, run.id)) {
      return runProgressMessage;
    }
    if (run.payment_transaction_hash.length > 0) {
      return "Create attestation";
    }
    return "Pay and create attestation";
  };

  return (
    <Button
      disabled={isDisabled}
      icon={showSpinner ? faCircleNotch : undefined}
      onClick={handleClick}
      spin={showSpinner}
    >
      {buttonText()}
    </Button>
  );
}
