import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isError } from "remeda";
import { useAccount } from "wagmi";
import { useSiweIdentity } from "ic-use-siwe-identity";
import { SectionTitle } from "@/components/ui/Section";
import { runProcessor } from "@/catts/runProcessor";
import { useFetchRecipeQueries } from "@/catts/hooks/useFetchRecipeQueries";
import { validateProcessorResult, validateSchemaItems } from "catts-sdk";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import useRunContext from "@/context/useRunContext";
import { RunOutput } from "@/catts/types/run-output.type";
import { isChainIdSupported } from "@/wagmi/is-chain-id-supported";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function SimulateRunInner({ address }: { address: string }) {
  const { data, error: fetchError } = useFetchRecipeQueries(address);
  const { selectedRecipe } = useRunContext();
  const [processorError, setProcessorError] = useState<string>();
  const [processedData, setProcessedData] = useState<RunOutput>();
  const [validationError, setValidationError] = useState<string>();
  const [simulationSteps, setSimulationSteps] = useState<SimulationSteps>({
    step1Fetching: "pending",
    step2Processing: "idle",
    step3Validating: "idle",
  });

  useEffect(() => {
    if (!data || !selectedRecipe) return;
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
          recipe: selectedRecipe,
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
          schema: selectedRecipe.schema,
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
    })();
  }, [data, selectedRecipe]);

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

export default function SimulateRun() {
  const { identity } = useSiweIdentity();
  const { chainId } = useAccount();
  const [runSimulation, setRunSimulation] = useState(false);
  const { selectedRecipe, isSimulationOk: isSelectedRecipeValid } =
    useRunContext();
  const { address } = useAccount();
  const [simulateForAddress, setSimulateForAddress] = useState<string>(
    (address as string) || "",
  );
  const disabled =
    !identity ||
    !isChainIdSupported(chainId) ||
    !selectedRecipe ||
    isSelectedRecipeValid != undefined ||
    !simulateForAddress;

  const simulate = async () => {
    setRunSimulation(false);
    await new Promise((r) => setTimeout(r, 300));
    setRunSimulation(true);
  };

  const resetSimulation = () => {
    setRunSimulation(false);
  };

  return (
    <>
      <SectionTitle>Simulate run</SectionTitle>
      <div>
        Simulate the running of this recipe to see if it produces any output for
        selected address. The simulation fetches the attestations specified in
        the recipe and processes them locally in the browser.
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="address">Recipient Eth address</Label>
        <Input
          name="address"
          onChange={(e) => setSimulateForAddress(e.target.value)}
          onFocus={resetSimulation}
          placeholder="0x..."
          type="text"
          value={simulateForAddress}
        />
      </div>

      <Button disabled={disabled} onClick={simulate}>
        Simulate
      </Button>
      {runSimulation && <SimulateRunInner address={simulateForAddress} />}
    </>
  );
}
