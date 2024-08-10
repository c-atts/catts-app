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
    step1Fetching,
    step2Processing,
    step3Validating,
    allStepsCompleted,
    runOutput,
  } = useSimulateRunContext();

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
          stepStatus={step1Fetching}
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
          stepStatus={step2Processing}
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
          stepStatus={step3Validating}
          successMessage="Data validated"
        />
      </div>
      <div>
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
      </div>
    </div>
  );
}
