import { Recipe } from "catts_engine/declarations/catts_engine.did";
import { RunOutput } from "./types/run-output.type";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { transformHexItems } from "./transformHexItems";
import {
  newQuickJSWASMModuleFromVariant,
  newVariant,
} from "quickjs-emscripten-core";
import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url";
import RELEASE_SYNC from "@jitl/quickjs-wasmfile-release-sync";

const variant = newVariant(RELEASE_SYNC, {
  wasmLocation,
});

export async function simulateRun({
  recipe,
  queryData,
}: {
  recipe: Recipe;
  queryData: any[];
}) {
  if (!recipe.schema[0]) {
    throw new Error("Recipe schema is empty");
  }

  console.log(
    "Data returned by the recipe queries:",
    JSON.stringify(queryData, null, 2),
  );

  const QuickJS = await newQuickJSWASMModuleFromVariant(variant);
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

    const runOutputRaw = vm.dump(result.value);
    result.value.dispose();

    // Parse the processed data, make sure it follows the expected schema
    const runOutput: RunOutput = RunOutput.parse(JSON.parse(runOutputRaw));

    // Clean the processed data, transforming uint256 values to hex strings
    // runOutput = transformHexItems(runOutput);

    // Encode the processed data using the output schema
    const schemaEncoder = new SchemaEncoder(recipe.schema);
    const encodedOutput = schemaEncoder.encodeData(runOutput);

    return {
      runOutputRaw,
      runOutput,
      encodedOutput,
    };
  } finally {
    vm.dispose();
  }
}
