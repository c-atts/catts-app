import Button from "../../../components/ui/Button";
import { Run } from "../../../../../declarations/backend/backend.did";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useStartRun } from "../../../catts/hooks/useStartRun";

export default function RunButton({ run }: { run: Run }) {
  const { mutate: startRun, isPending } = useStartRun();

  if (!("Paid" in run.status)) {
    return null;
  }

  return (
    <Button
      disabled={isPending}
      icon={isPending ? faCircleNotch : undefined}
      onClick={() => {
        startRun(run.id);
      }}
      spin={isPending}
    >
      Run
    </Button>
  );
}
