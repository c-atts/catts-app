import { useEffect, useState } from "react";

import Button from "../../../components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import useRunContext from "../../../ run-context/useRunContext";
import { useSimulateRecipeQueries } from "../../../catts/hooks/useSimulateRecipeQueries";
import { z } from "zod";

const DataItem = z.object({
  name: z.string(),
  type: z.string(),
  value: z.union([z.string(), z.number(), z.object({ hex: z.string() })]),
});
type DataItem = z.infer<typeof DataItem>;

const DataItemArray = z.array(DataItem);
type DataItemArray = z.infer<typeof DataItemArray>;

function cleanProcessedData(dataItems: DataItemArray) {
  return dataItems.map((item) => {
    if (item.type === "uint256") {
      if (typeof item.value === "object" && item.value.hex) {
        return {
          name: item.name,
          type: item.type,
          value: item.value.hex,
        };
      }
      throw new Error("Invalid uint256 value");
    }
    return item;
  });
}

function RecipeRunnerInner() {
  const { data, isPending, error } = useSimulateRecipeQueries();
  const { selectedRecipe, setIsSelectedRecipeValid, isSelectedRecipeValid } =
    useRunContext();

  const [processedData, setProcessedData] = useState<any>(null);

  useEffect(() => {
    if (!data || !selectedRecipe || isSelectedRecipeValid != undefined) return;
    try {
      // Process the data returned by the recipe queries
      //TODO  Replace this with a proper sandboxed environment
      const processFunction = `            
          const data = JSON.parse(queryResult?.attestations[0]?.decodedDataJson); 
          ${selectedRecipe.processor}
      `;
      const process: (data: any) => any = new Function(
        "queryResult",
        processFunction
      ) as (data: any) => any;

      let _processedData = process(data);

      // Parse the processed data, make sure it follows the expected schema
      const dataItems: DataItemArray = DataItemArray.parse(
        JSON.parse(_processedData)
      );

      // Clean the processed data, transforming uint256 values to hex strings
      _processedData = cleanProcessedData(dataItems);

      // Encode the processed data using the output schema
      const schemaEncoder = new SchemaEncoder(selectedRecipe.output_schema);
      schemaEncoder.encodeData(_processedData);

      // All checks passed, this means we can use this data to create a new attestation
      setProcessedData(_processedData);
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
  const { selectedRecipe, isSelectedRecipeValid } = useRunContext();

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
