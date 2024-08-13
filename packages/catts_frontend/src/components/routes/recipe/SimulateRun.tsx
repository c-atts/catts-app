import { LoaderCircle } from "lucide-react";

import {
  runStateStore,
  RunStepStatus,
  useIsSimulationCompleted,
} from "@/run/RunStateStore";
import { useSelector } from "@xstate/store/react";

function Status({
  stepStatus,
  pendingMessage,
  successMessage,
}: {
  stepStatus: RunStepStatus;
  pendingMessage: string;
  successMessage: string;
}) {
  const { errorMessage } = useSelector(runStateStore, (state) => state.context);

  switch (stepStatus) {
    case "pending":
      return (
        <div className="flex justify-between w-full pl-10">
          <div>{pendingMessage}</div>
          <div>
            <LoaderCircle className="w-5 h-5 animate-spin" />
          </div>
        </div>
      );
    case "success":
      return (
        <div className="flex justify-between w-full pl-10">
          <div>{successMessage}</div>
          <div>✅</div>
        </div>
      );
    case "error":
      return (
        <div className="flex justify-between w-full pl-10">
          <div>Error: {errorMessage}</div>
          <div>🔴</div>
        </div>
      );
    default:
      return null;
  }
}

export default function SimulateRun() {
  const {
    simulateFetchStatus,
    simulateProcessStatus,
    simulateValidateStatus,
    processorOutput: simulationOutput,
  } = useSelector(runStateStore, (state) => state.context);

  const isSimulationCompleted = useIsSimulationCompleted();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            1
          </div>
          Fetch recipe data
        </div>
        <Status
          pendingMessage="Fetching recipe data..."
          stepStatus={simulateFetchStatus}
          successMessage="Recipe data fetched"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            2
          </div>
          Process data
        </div>
        <Status
          pendingMessage="Processing data..."
          stepStatus={simulateProcessStatus}
          successMessage="Data processed"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <div className="items-center justify-center hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            3
          </div>
          Validate data
        </div>
        <Status
          pendingMessage="Validating data..."
          stepStatus={simulateValidateStatus}
          successMessage="Data validated"
        />
      </div>
      <div>
        {isSimulationCompleted && (
          <>
            <p>
              Simulation was successful. The recipe would generate the following
              attestation:
            </p>
            <pre className="w-full p-3 overflow-x-auto text-sm border bg-muted/50">
              {JSON.stringify(simulationOutput, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
