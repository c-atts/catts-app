import { Check, LoaderCircle, TriangleAlert } from "lucide-react";

import useSimulateRunContext from "@/run/hooks/useSimulateRunContext";
import { SimulationStepStatus } from "@/run/types/simulate-run-context-state.type";

function Status({
  stepStatus,
  pendingMessage,
  successMessage,
}: {
  stepStatus: SimulationStepStatus;
  pendingMessage: string;
  successMessage: string;
}) {
  const { errorMessage } = useSimulateRunContext();

  switch (stepStatus) {
    case "pending":
      return (
        <div className="flex items-center gap-2">
          <div className="items-center justify-center flex-shrink-0 hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            <LoaderCircle className="w-4 h-4 animate-spin" />
          </div>
          {pendingMessage}
        </div>
      );

    case "success":
      return (
        <div className="flex items-center gap-2">
          <div className="items-center justify-center flex-shrink-0 hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            <Check className="w-4 h-4" />
          </div>
          {successMessage}
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-2">
          <div className="items-center justify-center flex-shrink-0 hidden w-8 h-8 text-xl font-bold rounded-full md:flex bg-primary text-primary-foreground">
            <TriangleAlert className="w-4 h-4" />
          </div>
          {errorMessage}
        </div>
      );
    default:
      return null;
  }
}

export default function SimulateRun() {
  const {
    step1Fetching,
    step2Processing,
    step3Validating,
    allStepsCompleted,
    runOutput,
  } = useSimulateRunContext();

  return (
    <>
      <Status
        pendingMessage="Fetching recipe data..."
        stepStatus={step1Fetching}
        successMessage="Recipe data fetched"
      />
      <Status
        pendingMessage="Processing data..."
        stepStatus={step2Processing}
        successMessage="Data processed"
      />
      <Status
        pendingMessage="Validating data..."
        stepStatus={step3Validating}
        successMessage="Data validated"
      />
      {allStepsCompleted && (
        <>
          <p>
            Simulation was successful. The recipe would generate the following
            attestation:
          </p>
          <pre className="w-full p-3 overflow-x-auto text-sm border bg-muted/50">
            {JSON.stringify(runOutput, null, 2)}
          </pre>
        </>
      )}
    </>
  );
}
