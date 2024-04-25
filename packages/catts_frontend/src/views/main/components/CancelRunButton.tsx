import Button from "../../../components/ui/Button";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import useRunContext from "../../../context/useRunContext";

export default function CancelRunButton({ run }: { run: Run }) {
  const { useCancelRun } = useRunContext();
  const { mutate: cancelRun, isPending: isCancelPending } = useCancelRun;

  const { usePayForRun, isPaymentTransactionConfirmed, useStartRun } =
    useRunContext();

  const isDisabled =
    usePayForRun.isPending ||
    isPaymentTransactionConfirmed === false ||
    useStartRun.isPending;

  return (
    <Button
      disabled={isCancelPending || isDisabled}
      icon={isCancelPending ? faCircleNotch : undefined}
      onClick={() => {
        cancelRun(run.id);
      }}
      spin={isCancelPending}
      variant="outline"
    >
      {isCancelPending ? "Cancelling run" : "Cancel run"}
    </Button>
  );
}
