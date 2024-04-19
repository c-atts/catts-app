import Button from "../../../components/ui/Button";
import { Run } from "../../../../../declarations/backend/backend.did";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useStartRun } from "../../../catts/hooks/useStartRun";

export default function StartRunButton({ run }: { run: Run }) {
  const { mutate: startRun, isPending } = useStartRun();
  useEffect(() => {
    if (isRunSuccess) {
      setTimeout(() => {
        getAttestationUid(run.id);
      }, 5000);
    }
  }, [isRunSuccess, getAttestationUid, run.id]);

  useEffect(() => {
    if (
      getAttestationUidResult &&
      "Err" in getAttestationUidResult &&
      getUidRetryCount < 2
    ) {
      setTimeout(() => {
        getAttestationUid(run.id);
        setGetUidRetryCount((prev) => prev + 1);
      }, 5000);
    }
  }, [getAttestationUidResult, getAttestationUid, run.id, getUidRetryCount]);

  return (
    <Button
      disabled={isPending}
      icon={isPending ? faCircleNotch : undefined}
      onClick={() => {
        startRun(run.id);
      }}
      spin={isPending}
    >
      Create attestation
    </Button>
  );
}
