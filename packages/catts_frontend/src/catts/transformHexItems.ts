import { RunOutput } from "./types/run-output.type";

export function transformHexItems(runOutput: RunOutput) {
  console.log("runOutput", runOutput);
  return runOutput.map((item) => {
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
