import {
  newQuickJSWASMModuleFromVariant,
  newVariant,
} from "quickjs-emscripten-core";
import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url";
import RELEASE_SYNC from "@jitl/quickjs-wasmfile-release-sync";
import { RecipeFull } from "@/recipe/types/recipe.types";
import { ProcessorOutput } from "./types/processor-output.type";

const quickJSVariant = newVariant(RELEASE_SYNC, {
  wasmLocation,
});

export async function runProcessor({
  recipe,
  queryData,
}: {
  recipe: RecipeFull;
  queryData: any[];
}): Promise<{ processorOutputRaw: string; processorOutput: ProcessorOutput }> {
  if (!recipe.schema[0]) {
    throw new Error("Recipe schema is empty");
  }

  console.log(
    "Data returned by the recipe queries:",
    JSON.stringify(queryData, null, 2),
  );

  const QuickJS = await newQuickJSWASMModuleFromVariant(quickJSVariant);
  const vm = QuickJS.newContext();

  try {
    const queryResultRaw = vm.newString(JSON.stringify(queryData));
    vm.setProp(vm.global, "queryResultRaw", queryResultRaw);
    queryResultRaw.dispose();

    const processor = `
      let queryResult = JSON.parse(queryResultRaw);
      function process() {{
        ${recipe.processor}
      }}
      process();
    `;

    const result = vm.evalCode(processor);
    if (result.error) {
      const error = vm.dump(result.error);
      result.error.dispose();
      throw error;
    }

    const processorOutputRaw = vm.dump(result.value);
    result.value.dispose();

    // Parse the processed data, make sure it follows the expected schema
    const processorOutput: ProcessorOutput = ProcessorOutput.parse(
      JSON.parse(processorOutputRaw),
    );

    return {
      processorOutputRaw,
      processorOutput,
    };
  } finally {
    vm.dispose();
  }
}
