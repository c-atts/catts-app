import { runStateStore } from "@/run/RunStateStore";
import { validateProcessorResult, validateSchemaItems } from "catts-sdk";

import { RecipeFull } from "@/recipe/types/recipe.types";
import { fetchRecipeQueries } from "@/recipe/fetchRecipeQueries";
import { handleError } from "./util/handleError";
import { wait } from "@/lib/util/wait";
import { runProcessor } from "@/recipe/runProcessor";
import { ProcessorOutput } from "@/recipe/types/processor-output.type";

export async function startSimulateRunFlow({
  recipe,
  address,
}: {
  recipe: RecipeFull;
  address: `0x${string}`;
}) {
  runStateStore.send({
    type: "transition",
    step: "simulateFetchStatus",
    status: "pending",
  });

  let queryData: any;
  try {
    queryData = await fetchRecipeQueries(recipe, address);

    if (!queryData) {
      handleError(
        undefined,
        "simulateFetchStatus",
        "Recipe queries didn't return any data",
      );
      return false;
    }
  } catch (e) {
    handleError(e, "simulateFetchStatus", "Couldn't fetch recipe queries");
    return false;
  }

  await wait(500);

  runStateStore.send({
    type: "transitionMany",
    steps: [
      { step: "simulateFetchStatus", status: "success" },
      { step: "simulateProcessStatus", status: "pending" },
    ],
  });

  let processorOutputRaw = "";
  let processorOutput: ProcessorOutput;
  try {
    const result = await runProcessor({ recipe, queryData });
    processorOutputRaw = result.processorOutputRaw;
    processorOutput = result.processorOutput;
  } catch (e) {
    handleError(e, "simulateProcessStatus", (e as Error).message);
    return false;
  }

  await wait(500);

  runStateStore.send({
    type: "setProcessorOutput",
    output: processorOutput,
  });

  runStateStore.send({
    type: "transitionMany",
    steps: [
      { step: "simulateProcessStatus", status: "success" },
      { step: "simulateValidateStatus", status: "pending" },
    ],
  });

  try {
    const schemaItems = await validateProcessorResult({
      processorResult: processorOutputRaw,
    });
    await validateSchemaItems({ schemaItems, schema: recipe.schema });
  } catch (e) {
    handleError(e, "simulateValidateStatus", "Couldn't validate output");
    return false;
  }

  await wait(500);

  runStateStore.send({
    type: "transition",
    step: "simulateValidateStatus",
    status: "success",
  });

  return true;
}
