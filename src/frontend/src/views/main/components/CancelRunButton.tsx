import Button from "../../../components/ui/Button";
import { Run } from "../../../../../declarations/backend/backend.did";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useCancelRun } from "../../../catts/hooks/useCancelRun";

export default function CancelRunButton({ run }: { run: Run }) {
  const { mutate: cancelRun, isPending } = useCancelRun();

  if (!("Created" in run.status)) {
    return null;
  }

  return (
    <Button
      disabled={isPending}
      icon={isPending ? faCircleNotch : undefined}
      onClick={() => {
        cancelRun(run.id);
      }}
      spin={isPending}
    >
      {isPending ? "Cancelling run" : "Cancel run"}
    </Button>
  );
}
