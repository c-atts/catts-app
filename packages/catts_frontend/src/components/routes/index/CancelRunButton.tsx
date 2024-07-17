import { Button } from "@/components/ui/button";
import { Run } from "catts_engine/declarations/catts_engine.did";
// import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { paymentVerifiedStatusToString } from "../../../catts/paymentVerifiedStatusToString";
import useRunContext from "../../../context/useRunContext";

export default function CancelRunButton({ run }: { run: Run }) {
  const { useCancelRun } = useRunContext();
  const { mutate: cancelRun, isPending: isCancelPending } = useCancelRun;

  const paymentStatus = paymentVerifiedStatusToString(run);

  const { useRegisterRunPayment } = useRunContext();

  const isPaymentPending =
    paymentStatus !== undefined || useRegisterRunPayment.isPending;

  return (
    <Button
      disabled={isCancelPending || isPaymentPending}
      // icon={isCancelPending ? faCircleNotch : undefined}
      onClick={() => {
        cancelRun(run.id);
      }}
      // spin={isCancelPending}
      variant="outline"
    >
      {isCancelPending ? "Cancelling run" : "Cancel run"}
    </Button>
  );
}
