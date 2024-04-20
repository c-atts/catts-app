import { Recipe } from "../../../declarations/backend/backend.did";
import { RunOutput } from "./types/run-output.type";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { transformHexItems } from "./transformHexItems";

export function simulateRun({
  recipe,
  queryData,
}: {
  recipe: Recipe;
  queryData: string;
}) {
  // Define the function that processes the data returned by the recipe queries
  //TODO  Replace this with a proper sandboxed environment
  const processFunction = `            
  const data = JSON.parse(queryResult?.attestations[0]?.decodedDataJson); 
  ${recipe.processor}
`;
  const process: (data: string) => string = new Function(
    "queryResult",
    processFunction
  ) as (data: string) => string;

  // Process the data returned by the recipe queries
  const runOutputRaw = process(queryData);

  // Parse the processed data, make sure it follows the expected schema
  let runOutput: RunOutput = RunOutput.parse(JSON.parse(runOutputRaw));

  // Clean the processed data, transforming uint256 values to hex strings
  runOutput = transformHexItems(runOutput);

  // Encode the processed data using the output schema
  const schemaEncoder = new SchemaEncoder(recipe.output_schema);
  const encodedOutput = schemaEncoder.encodeData(runOutput);

  return {
    runOutputRaw,
    runOutput,
    encodedOutput,
  };
}
