import { useEffect, useState } from "react";

import Button from "../../../components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RunOutput } from "../../../catts/types/run-output.type";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { simulateRun } from "../../../catts/simulateRun";
import useRunContext from "../../../ run-context/useRunContext";
import { useSimulateRecipeQueries } from "../../../catts/hooks/useSimulateRecipeQueries";

function RecipeRunnerInner() {
  const { data, isPending, error } = useSimulateRecipeQueries();
  const {
    selectedRecipe,
    setIsSimulationOk: setIsSelectedRecipeValid,
    isSimulationOk: isSelectedRecipeValid,
  } = useRunContext();

  const [processedData, setProcessedData] = useState<RunOutput>();

  useEffect(() => {
    if (!data || !selectedRecipe || isSelectedRecipeValid != undefined) return;
    try {
      // Simluate the run in the browser
      const { runOutput } = simulateRun({
        recipe: selectedRecipe,
        queryData: data as string,
      });

      // All checks passed, this means we can use this data to create a new attestation
      setProcessedData(runOutput);
      setIsSelectedRecipeValid(true);
    } catch (e) {
      console.error(e);
      setIsSelectedRecipeValid(false);
    }
  }, [data, selectedRecipe, setIsSelectedRecipeValid, isSelectedRecipeValid]);

  if (isPending)
    return (
      <p>
        <FontAwesomeIcon className="mr-2" icon={faCircleNotch} spin />
        Running simulation
      </p>
    );

  if (!data || !isSelectedRecipeValid)
    return <p>🔴 Recipe did not return any data for this user.</p>;

  if (error) {
    console.error(error);
    return <p>🔴 Couldn&apos;t run simulation. </p>;
  }

  return (
    <>
      <p>
        ✅ Simulation was successful. The recipe will generate the following
        attestation:
      </p>
      <pre className="w-full p-3 overflow-x-auto text-sm border border-zinc-500">
        {JSON.stringify(processedData, null, 2)}
      </pre>
    </>
  );
}

export default function SimulateRun() {
  const [runSimulation, setRunSimulation] = useState(false);
  const { selectedRecipe, isSimulationOk: isSelectedRecipeValid } =
    useRunContext();

  const disabled = !selectedRecipe || isSelectedRecipeValid != undefined;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h2>Simulate run</h2>
        <p>
          To create attestations based on this recipe, first simulate a run to
          see if it produces any output for current address. The simulation
          fetches the attestations specified in the recipe and processes them
          locally in the browser.
        </p>
        {!isSelectedRecipeValid && (
          <p>
            <Button
              className="mt-5"
              disabled={disabled}
              onClick={() => setRunSimulation(true)}
            >
              Simulate
            </Button>
          </p>
        )}
      </div>
      {runSimulation && <RecipeRunnerInner />}
    </div>
  );
}
