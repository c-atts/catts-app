import { Button } from "@/components/ui/button";
import { Run } from "catts_engine/declarations/catts_engine.did";
import { useCancelRun } from "@/run/hooks/useCancelRun";
import { getRunStatus } from "@/run/getRunStatus";
import { RunStatus } from "@/run/types/run-status.type";

export default function CancelRunButton({ run }: { run: Run }) {
  const { mutate: cancelRun, isPending: isCancelPending } = useCancelRun();

  const runStatus = getRunStatus(run);

  const isEnabled =
    runStatus === RunStatus.NotStarted ||
    runStatus === RunStatus.PaymentPending;

  return (
    <Button
      disabled={isCancelPending || !isEnabled}
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
