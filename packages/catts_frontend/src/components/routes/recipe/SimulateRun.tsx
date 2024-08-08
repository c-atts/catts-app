import { useEffect, useState } from "react";
import { isError } from "remeda";
import { validateProcessorResult, validateSchemaItems } from "catts-sdk";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useFetchRecipeQueries } from "@/recipe/hooks/useFetchRecipeQueries";
import { RunOutput } from "@/run/types/run-output.type";
import { runProcessor } from "@/run/runProcessor";
import useRecipeContext from "@/recipe/hooks/useRecipeContext";

type SimulationStepStatus = "idle" | "pending" | "success" | "error";

type SimulationSteps = {
  step1Fetching: SimulationStepStatus;
  step2Processing: SimulationStepStatus;
  step3Validating: SimulationStepStatus;
};

function Status({
  stepStatus,
  pendingMessage,
  successMessage,
  errorMessage,
}: {
  stepStatus: SimulationStepStatus;
  pendingMessage: string;
  successMessage: string;
  errorMessage?: string;
}) {
  switch (stepStatus) {
    case "pending":
      return (
        <div className="flex items-center gap-2">
          <LoaderCircle className="w-5 h-5 animate-spin flex-shrink-0" />
          {pendingMessage}
        </div>
      );

    case "success":
      return (
        <div className="flex items-center gap-2">
          <CircleCheck className="w-5 h-5 flex-shrink-0" /> {successMessage}
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-2">
          <CircleAlert className="w-5 h-5 flex-shrink-0" /> {errorMessage}
        </div>
      );
    default:
      return null;
  }
}

function SimulationSteps({
  steps,
  fetchError,
  processorError,
  validationError,
}: {
  steps: SimulationSteps;
  fetchError?: Error | null;
  processorError?: string;
  validationError?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Status
          errorMessage={fetchError?.toString()}
          pendingMessage="Fetching recipe data..."
          stepStatus={steps.step1Fetching}
          successMessage="Recipe data fetched"
        />
      </div>
      <div>
        <Status
          errorMessage={processorError}
          pendingMessage="Processing data..."
          stepStatus={steps.step2Processing}
          successMessage="Data processed"
        />
      </div>
      <div>
        <Status
          errorMessage={validationError}
          pendingMessage="Validating data..."
          stepStatus={steps.step3Validating}
          successMessage="Data validated"
        />
      </div>
    </div>
  );
}

export default function SimulateRun({
  address,
  onDone,
}: {
  address: string;
  onDone: () => void;
}) {
  const { recipe } = useRecipeContext();
  const { data, error: fetchError } = useFetchRecipeQueries(recipe, address);
  const [processorError, setProcessorError] = useState<string>();
  const [processedData, setProcessedData] = useState<RunOutput>();
  const [validationError, setValidationError] = useState<string>();
  const [simulationSteps, setSimulationSteps] = useState<SimulationSteps>({
    step1Fetching: "pending",
    step2Processing: "idle",
    step3Validating: "idle",
  });

  useEffect(() => {
    if (!data || !recipe) return;
    (async () => {
      setSimulationSteps((s) => ({
        ...s,
        step1Fetching: "success",
        step2Processing: "pending",
      }));

      await new Promise((r) => setTimeout(r, 300));

      let _runOutputRaw = "";
      try {
        const { runOutput, runOutputRaw } = await runProcessor({
          recipe,
          queryData: data,
        });
        setProcessedData(runOutput);
        _runOutputRaw = runOutputRaw as string;
      } catch (e) {
        console.error(e);
        if (e != undefined && typeof e === "object" && "message" in e) {
          setProcessorError(e.message as string);
        } else {
          setProcessorError("Processor returned an error");
        }
        setSimulationSteps((s) => ({
          ...s,
          step2Processing: "error",
        }));
        return;
      }

      setSimulationSteps((s) => ({
        ...s,
        step2Processing: "success",
        step3Validating: "pending",
      }));

      await new Promise((r) => setTimeout(r, 300));

      try {
        const schemaItems = await validateProcessorResult({
          processorResult: _runOutputRaw,
        });
        await validateSchemaItems({
          schemaItems,
          schema: recipe.schema,
        });
        setSimulationSteps((s) => ({
          ...s,
          step3Validating: "success",
        }));
      } catch (e) {
        console.error(e);
        setValidationError(isError(e) ? e.message : "Couldn't validate output");
        setSimulationSteps((s) => ({
          ...s,
          step3Validating: "error",
        }));
      }

      onDone();
    })();
  }, [data, recipe, onDone]);

  const allStepsCompleted = Object.values(simulationSteps).every(
    (step) => step === "success",
  );

  return (
    <>
      <SimulationSteps
        fetchError={fetchError}
        processorError={processorError}
        steps={simulationSteps}
        validationError={validationError}
      />
      {allStepsCompleted && (
        <>
          <p>
            Simulation was successful. The recipe would generate the following
            attestation:
          </p>
          <pre className="w-full p-3 overflow-x-auto text-sm border bg-muted/50">
            {JSON.stringify(processedData, null, 2)}
          </pre>
        </>
      )}
    </>
  );
}
